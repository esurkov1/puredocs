import './styles/index.css';
import type {
  PortalConfig,
  PortalApi,
  PortalState,
  PortalBootstrapConfig,
} from './core/types';
import { store } from './core/state';
import { initRouter, destroyRouter, navigate as routerNavigate } from './core/router';
import { parseSpec, loadSpec } from './core/parser';
import { buildSearchIndex } from './core/search';
import { detectTheme } from './core/theme';
import { mountApp, unmountApp } from './components/app';
import { setupSearchShortcut } from './components/modals/search-modal';
import { loadPersisted, savePersisted } from './core/persistence';
import {
  areAuthStatesEqual,
  reconcileAuthWithSecuritySchemes,
} from './core/auth-storage';
import { debounce } from './helpers/debounce';

let mounted = false;
let currentApi: PortalApi | null = null;
let cleanupSearchShortcut: (() => void) | null = null;

function resolveBootstrapMount(config: PortalBootstrapConfig): HTMLElement {
  const providedMount = config.mount;

  if (providedMount) {
    const target = typeof providedMount === 'string'
      ? document.querySelector<HTMLElement>(providedMount)
      : providedMount;

    if (!target) {
      throw new Error(`[PureDocs] Mount target not found: ${String(providedMount)}`);
    }

    return target;
  }

  const mountId = config.mountId || 'puredocs';
  const existing = document.getElementById(mountId);
  if (existing) return existing;

  const created = document.createElement('div');
  created.id = mountId;
  document.body.append(created);
  return created;
}

function ensureStylesheetOnce(href: string): void {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  const alreadyIncluded = links.some((link) => link.getAttribute('href') === href);
  if (alreadyIncluded) return;

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = href;
  document.head.append(styleLink);
}

function applyFullPageLayout(target: HTMLElement): void {
  document.documentElement.style.minHeight = '100%';
  document.body.style.minHeight = '100vh';
  document.body.style.margin = '0';
  target.style.minHeight = '100vh';
  target.style.display = 'block';
}

/** Mount the portal into the DOM */
async function mount(config: PortalConfig): Promise<PortalApi> {
  let preservedAuth = null;
  
  if (mounted) {
    // Preserve auth state during hot-reload
    preservedAuth = store.get().auth;
    unmount();
  }

  const target = typeof config.mount === 'string'
    ? document.querySelector<HTMLElement>(config.mount)
    : config.mount;

  if (!target) {
    throw new Error(`[PureDocs] Mount target not found: ${String(config.mount)}`);
  }

  store.reset();

  const initialEnvs = [{ name: 'default', baseUrl: '' }];

  store.set({
    loading: true,
    theme: detectTheme(config.theme),
    environments: [...initialEnvs],
    initialEnvironments: [...initialEnvs],
    activeEnvironment: 'default',
  });

  const persisted = loadPersisted();
  if (persisted) {
    store.set({
      activeEnvironment: persisted.activeEnvironment || 'default',
      auth: persisted.auth,
    });
  } else if (preservedAuth) {
    // No persisted data, but we have auth from previous mount - restore it
    store.setAuth(preservedAuth);
  }

  const saveDebounce = debounce(() => {
    const s = store.get();
    savePersisted({
      activeEnvironment: s.activeEnvironment,
      environments: s.environments,
      auth: s.auth,
    });
  }, 300);

  store.subscribe(() => saveDebounce());

  initRouter('');
  cleanupSearchShortcut = setupSearchShortcut();

  mountApp(target, config);
  mounted = true;

  try {
    let rawSpec: Record<string, unknown>;
    const initialSpecUrl = config.specUrl;

    if (config.spec) {
      rawSpec = config.spec;
    } else if (initialSpecUrl) {
      rawSpec = await loadSpec(initialSpecUrl);
    } else {
      throw new Error('Either spec or specUrl must be provided');
    }

    const parsed = parseSpec(rawSpec);

    if (parsed.servers.length > 0) {
      const envs = parsed.servers.map((server, i) => ({
        name: server.description || (i === 0 ? 'default' : `Server ${i + 1}`),
        baseUrl: server.url,
      }));
      store.set({ environments: envs, initialEnvironments: envs.map((e) => ({ ...e })) });
      const cur = store.get();
      const validActive = envs.some((e) => e.name === cur.activeEnvironment);
      if (!validActive) {
        store.set({ activeEnvironment: envs[0]?.name || 'default' });
      }
    }

    const auth = store.get().auth;
    const reconciledAuth = reconcileAuthWithSecuritySchemes(auth, parsed.securitySchemes);
    if (!areAuthStatesEqual(auth, reconciledAuth)) {
      store.setAuth(reconciledAuth);
    }

    buildSearchIndex(parsed);
    store.set({ spec: parsed, loading: false, error: null });
  } catch (err) {
    store.set({
      loading: false,
      error: (err as Error).message || 'Failed to load specification',
    });
  }

  currentApi = createApi();
  return currentApi;
}

/** Universal zero-boilerplate startup for JS consumers */
async function bootstrap(config: PortalBootstrapConfig): Promise<PortalApi> {
  if (typeof document === 'undefined') {
    throw new Error('[PureDocs] bootstrap() requires a browser environment');
  }

  const target = resolveBootstrapMount(config);

  if (config.cssHref) {
    ensureStylesheetOnce(config.cssHref);
  }

  if (config.fullPage !== false) {
    applyFullPageLayout(target);
  }

  const { mount: _mount, mountId: _mountId, cssHref: _cssHref, fullPage: _fullPage, ...portalConfig } = config;
  return mount({
    ...portalConfig,
    mount: target,
  });
}

/** Unmount portal and cleanup */
function unmount(): void {
  if (!mounted) return;

  cleanupSearchShortcut?.();
  cleanupSearchShortcut = null;

  destroyRouter();
  unmountApp();
  store.reset();

  mounted = false;
  currentApi = null;
}

function createApi(): PortalApi {
  return {
    getState: () => store.get(),
    subscribe: (fn: (state: PortalState) => void) => store.subscribe(fn),
    setToken: (token: string) => {
      const activeScheme = store.get().auth.activeScheme;
      if (activeScheme) {
        store.setSchemeValue(activeScheme, token);
      } else {
        store.setAuth({ token, source: 'manual' });
      }
    },
    setEnvironment: (name: string) => store.setActiveEnvironment(name),
    navigate: (path: string) => routerNavigate(path),
  };
}

const OBSERVED_ATTRIBUTES = [
  'spec-url',
  'spec-json',
  'theme',
  'primary-color',
  'title',
] as const;

export class PureDocsElement extends HTMLElement {
  private static activeElement: PureDocsElement | null = null;
  private api: PortalApi | null = null;
  private reloadTimer: ReturnType<typeof setTimeout> | null = null;

  static get observedAttributes(): string[] {
    return [...OBSERVED_ATTRIBUTES];
  }

  async connectedCallback(): Promise<void> {
    if (PureDocsElement.activeElement && PureDocsElement.activeElement !== this) {
      this.renderSingletonError();
      return;
    }

    PureDocsElement.activeElement = this;
    await this.mountFromAttributes();
  }

  disconnectedCallback(): void {
    if (PureDocsElement.activeElement === this) {
      this.api = null;
      unmount();
      PureDocsElement.activeElement = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this.isConnected) return;
    if (oldValue === newValue) return;
    if (!OBSERVED_ATTRIBUTES.includes(name as (typeof OBSERVED_ATTRIBUTES)[number])) return;

    if (this.reloadTimer) clearTimeout(this.reloadTimer);
    this.reloadTimer = setTimeout(() => {
      void this.reload();
    }, 80);
  }

  async reload(): Promise<void> {
    if (PureDocsElement.activeElement !== this) return;
    await this.mountFromAttributes();
  }

  getState(): PortalState | null {
    return this.api?.getState() || null;
  }

  subscribe(fn: (state: PortalState) => void): () => void {
    return this.api?.subscribe(fn) || (() => {});
  }

  navigate(path: string): void {
    this.api?.navigate(path);
  }

  setToken(token: string): void {
    this.api?.setToken(token);
  }

  setEnvironment(name: string): void {
    this.api?.setEnvironment(name);
  }

  private async mountFromAttributes(): Promise<void> {
    try {
      this.innerHTML = '';
      const config = this.parseConfig();
      this.removeAttribute('title'); // prevent native browser tooltip on hover
      this.api = await mount({ ...config, mount: this });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${message}</div>`;
    }
  }

  private parseConfig(): Omit<PortalConfig, 'mount'> {
    const rawSpec = this.getAttribute('spec-json');

    return {
      specUrl: this.getAttribute('spec-url') || undefined,
      spec: rawSpec ? parseJsonAttr<Record<string, unknown>>(rawSpec, 'spec-json') : undefined,
      theme: toTheme(this.getAttribute('theme')),
      primaryColor: this.getAttribute('primary-color') || undefined,
      title: this.getAttribute('title') || undefined,
    };
  }

  private renderSingletonError(): void {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
}

function parseJsonAttr<T>(value: string, attrName: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Invalid JSON in ${attrName}`);
  }
}

function toTheme(value: string | null): PortalConfig['theme'] | undefined {
  if (!value) return undefined;
  if (value === 'light' || value === 'dark' || value === 'auto') return value;
  return undefined;
}

if (!customElements.get('pure-docs')) {
  customElements.define('pure-docs', PureDocsElement);
}

export const PureDocs = {
  mount,
  bootstrap,
  unmount,
  version: '0.0.1',
};

export type { PortalConfig, PortalBootstrapConfig, PortalApi, PortalState } from './core/types';
export default PureDocs;
