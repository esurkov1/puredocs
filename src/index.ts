import './styles/index.css';
import type { PortalConfig, PortalApi, PortalState, PortalEnvironment } from './core/types';
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
import { formatBaseUrlForDisplay, normalizeBaseUrl } from './services/env';

let mounted = false;
let currentApi: PortalApi | null = null;
let cleanupSearchShortcut: (() => void) | null = null;

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

  const configEnvs = config.environments || [{ name: 'default', baseUrl: '' }];
  const configActiveEnv = config.defaultEnvironment || configEnvs[0]?.name || 'default';

  store.set({
    loading: true,
    theme: detectTheme(config.theme),
    environments: [...configEnvs],
    initialEnvironments: [...configEnvs],
    activeEnvironment: configActiveEnv,
  });

  const persisted = loadPersisted();
  if (persisted) {
    store.set({
      activeEnvironment: persisted.activeEnvironment && configEnvs.some((e) => e.name === persisted.activeEnvironment)
        ? persisted.activeEnvironment
        : configActiveEnv,
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

  initRouter(config.basePath);
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

    if (parsed.servers.length > 0 && store.get().environments[0]?.baseUrl === '') {
      const envs = [...store.get().environments];
      envs[0] = { ...envs[0], baseUrl: parsed.servers[0].url };

      for (let i = 1; i < parsed.servers.length; i++) {
        const server = parsed.servers[i];
        envs.push({
          name: server.description || `Server ${i + 1}`,
          baseUrl: server.url,
        });
      }

      store.set({ environments: envs, initialEnvironments: envs.map((e) => ({ ...e })) });
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
  'base-path',
  'default-environment',
  'environments-array',
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
      this.api = await mount({ ...config, mount: this });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${message}</div>`;
    }
  }

  private parseConfig(): Omit<PortalConfig, 'mount'> {
    const rawSpec = this.getAttribute('spec-json');
    const rawEnvs = this.getAttribute('environments-array');

    return {
      specUrl: this.getAttribute('spec-url') || undefined,
      spec: rawSpec ? parseJsonAttr<Record<string, unknown>>(rawSpec, 'spec-json') : undefined,
      theme: toTheme(this.getAttribute('theme')),
      primaryColor: this.getAttribute('primary-color') || undefined,
      basePath: this.getAttribute('base-path') || undefined,
      defaultEnvironment: this.getAttribute('default-environment') || undefined,
      environments: rawEnvs ? parseEnvironmentArrayAttr(rawEnvs) : undefined,
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

function parseEnvironmentArrayAttr(value: string): PortalEnvironment[] {
  const endpoints = parseJsonAttr<unknown>(value, 'environments-array');
  if (!Array.isArray(endpoints)) {
    throw new Error('Invalid JSON in environments-array');
  }
  const usedNames = new Set<string>();
  return endpoints.map((endpoint, idx) => {
    if (typeof endpoint !== 'string') {
      throw new Error('Invalid JSON in environments-array');
    }
    const baseUrl = normalizeBaseUrl(endpoint.trim());
    if (!baseUrl) {
      throw new Error('Invalid JSON in environments-array');
    }
    const baseName = formatBaseUrlForDisplay(baseUrl) || `env-${idx + 1}`;
    let name = baseName;
    let n = 2;
    while (usedNames.has(name)) {
      name = `${baseName} #${n++}`;
    }
    usedNames.add(name);
    return { name, baseUrl };
  });
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
  unmount,
  version: '0.0.1',
};

export type { PortalConfig, PortalApi, PortalState } from './core/types';
export default PureDocs;
