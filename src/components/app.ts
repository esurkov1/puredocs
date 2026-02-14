import { h, clear, render } from '../lib/dom';
import { icons } from '../lib/icons';
import { store } from '../core/state';
import { slugifyTag } from '../core/router';
import { applyTheme, type ThemeConfig } from '../core/theme';
import { renderSidebar, updateSidebarActiveState } from './nav/sidebar';
import { renderOverview } from './pages/overview';
import { renderEndpoint } from './pages/endpoint';
import { renderTagPage } from './pages/tag-page';
import { renderSchemaViewer } from './shared/schema-viewer';
import { renderWebhookPage } from './pages/webhook';
import { resolveAuthHeaders, getAuthHeaderPlaceholder } from './modals/auth-modal';
import { createContentArea, setContentAreaAside } from './layout/page-layout';
import { createEmptyStatePage } from './layout/empty-state-page';
import { createHeaderRow } from './shared/try-it';
import { getBaseUrl, formatBaseUrlForDisplay } from '../services/env';
import { hasOperationAuth } from '../core/security';
import type { PortalConfig, PortalState, RouteInfo } from '../core/types';

let rootEl: HTMLElement | null = null;
let sidebarEl: HTMLElement | null = null;
let pageEl: HTMLElement | null = null;
let mainEl: HTMLElement | null = null;
let asideEl: HTMLElement | null = null;
let prevRoute: RouteInfo | null = null;
let prevSpecLoaded = false;
let prevEnvState = '';
let currentConfig: PortalConfig | null = null;
let cleanupViewportSync: (() => void) | null = null;
const MOBILE_SIDEBAR_MAX_WIDTH = 991;

/** Get current portal config */
export function getCurrentConfig(): PortalConfig | null {
  return currentConfig;
}

/** Mount the full portal app into the container */
export function mountApp(container: HTMLElement, config: PortalConfig): void {
  currentConfig = config;
  rootEl = h('div', { className: 'root' });

  const themeConfig: ThemeConfig = {
    primaryColor: config.primaryColor,
  };
  applyTheme(rootEl, store.get().theme, themeConfig);

  const expandTrigger = h('button', {
    type: 'button',
    className: 'sidebar-expand-trigger',
    'aria-label': 'Open sidebar',
  });
  expandTrigger.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
  expandTrigger.addEventListener('click', () => {
    store.set({ sidebarOpen: true });
    sidebarEl?.classList.remove('collapsed');
  });

  sidebarEl = h('aside', { className: 'sidebar', 'aria-label': 'Navigation' });

  const { page, main, aside } = createContentArea();
  pageEl = page;
  mainEl = main;
  asideEl = aside;

  rootEl.append(expandTrigger, sidebarEl, page);
  container.append(rootEl);
  setupViewportSidebarSync();

  store.subscribe((state) => {
    if (!rootEl) return;
    applyTheme(rootEl, state.theme, themeConfig);
    sidebarEl?.classList.toggle('collapsed', !state.sidebarOpen);
    expandTrigger.classList.toggle('visible', !state.sidebarOpen);
    void updateContent(state, config);
  });

  sidebarEl?.classList.toggle('collapsed', !store.get().sidebarOpen);
  expandTrigger.classList.toggle('visible', !store.get().sidebarOpen);
  void updateContent(store.get(), config);
}

/** Unmount the portal */
export function unmountApp(): void {
  cleanupViewportSync?.();
  cleanupViewportSync = null;

  if (rootEl) {
    rootEl.remove();
    rootEl = null;
    sidebarEl = null;
    pageEl = null;
    mainEl = null;
    asideEl = null;
    prevRoute = null;
    prevSpecLoaded = false;
    currentConfig = null;
  }
}

async function updateContent(state: PortalState, config: PortalConfig): Promise<void> {
  const specLoaded = !!state.spec;
  if (sidebarEl && specLoaded) {
    if (!prevSpecLoaded) {
      renderSidebar(sidebarEl, config);
    } else {
      updateSidebarActiveState(sidebarEl, state.route);
    }
    prevSpecLoaded = true;
  } else {
    prevSpecLoaded = false;
  }

  const currentMainEl = mainEl;
  const currentAsideEl = asideEl;
  const currentPageEl = pageEl;
  if (!currentMainEl || !currentAsideEl || !currentPageEl) return;

  if (state.loading) {
    setContentAreaAside(currentPageEl, false);
    clear(currentAsideEl);
    render(currentMainEl, createEmptyStatePage({ title: 'Loading...', message: 'Loading API specification...', variant: 'loading' }));
    const mainScroll = currentMainEl.parentElement as HTMLElement | null;
    if (mainScroll) mainScroll.scrollTop = 0;
    return;
  }

  if (state.error) {
    setContentAreaAside(currentPageEl, false);
    clear(currentAsideEl);
    render(currentMainEl, createEmptyStatePage({
      title: 'Failed to load API specification',
      message: state.error,
      icon: icons.warning,
      variant: 'error',
    }));
    const mainScroll = currentMainEl.parentElement as HTMLElement | null;
    if (mainScroll) mainScroll.scrollTop = 0;
    return;
  }

  if (!state.spec) return;

  // Route-based rendering
  const route = state.route;
  const envState = `${state.activeEnvironment}|${state.auth.token}`;
  const isSameCurrentRoute = !!(prevRoute && isSameRoute(prevRoute, route));
  const isSameRouteWithEnvOrAuthChange = isSameCurrentRoute && prevEnvState !== envState;
  const mainScroll = currentMainEl.parentElement as HTMLElement | null;
  const prevMainScrollTop = mainScroll ? mainScroll.scrollTop : 0;

  // Skip re-render if same route AND env/auth unchanged
  if (isSameCurrentRoute && prevEnvState === envState) return;
  
  // Route unchanged but env/auth changed — re-render sidebar and page to update lock icons
  if (isSameRouteWithEnvOrAuthChange) {
    prevEnvState = envState;
    updateEnvironmentState(currentPageEl, state, config);
    if (sidebarEl && state.spec) renderSidebar(sidebarEl, config);
  }
  
  prevRoute = { ...route };
  prevEnvState = envState;

  // Clean up mobile route-nav from previous render (lives outside main/aside, in .page directly)
  currentPageEl.querySelectorAll(':scope > .route-nav-wrap').forEach((el) => el.remove());

  clear(currentMainEl);
  clear(currentAsideEl);

  switch (route.type) {
    case 'overview':
      setContentAreaAside(currentPageEl, false);
      renderOverview(currentMainEl, currentAsideEl);
      break;

    case 'tag': {
      setContentAreaAside(currentPageEl, false);
      renderTagPage(currentMainEl, currentAsideEl, route.tag || '');
      break;
    }

    case 'endpoint': {
      const op = findOperation(state, route);
      if (op) {
        setContentAreaAside(currentPageEl, true);
        await renderEndpoint(currentMainEl, currentAsideEl, op);
      } else {
        setContentAreaAside(currentPageEl, false);
        const endpointLabel = route.operationId
          ? route.operationId
          : `${route.method?.toUpperCase() || ''} ${route.path || ''}`.trim();
        render(currentMainEl, createEmptyStatePage({
          title: 'Endpoint not found',
          message: endpointLabel || 'Unknown endpoint',
          variant: 'empty',
        }));
      }
      break;
    }

    case 'schema': {
      const schema = state.spec.schemas[route.schemaName || ''];
      if (schema) {
        setContentAreaAside(currentPageEl, false);
        const header = h('div', { className: 'block header' });
        header.append(h('h1', { textContent: route.schemaName || '' }));
        if (schema.description) {
          header.append(h('p', { textContent: String(schema.description) }));
        }
        const schemaSection = h('div', { className: 'block section' });
        schemaSection.append(renderSchemaViewer(schema, 'Properties'));
        render(currentMainEl, header, schemaSection);
      }
      break;
    }

    case 'webhook': {
      const wh = state.spec.webhooks?.find((w) => w.name === route.webhookName);
      if (wh) {
        setContentAreaAside(currentPageEl, false);
        renderWebhookPage(currentMainEl, wh);
      } else {
        setContentAreaAside(currentPageEl, false);
        render(currentMainEl, createEmptyStatePage({
          title: 'Webhook not found',
          message: route.webhookName || '',
          variant: 'empty',
        }));
      }
      break;
    }

    default:
      setContentAreaAside(currentPageEl, false);
      renderOverview(currentMainEl, currentAsideEl);
  }

  if (mainScroll) {
    mainScroll.scrollTop = isSameRouteWithEnvOrAuthChange ? prevMainScrollTop : 0;
  }
}

/** Targeted update when environment/auth changes without full re-render */
function updateEnvironmentState(root: HTMLElement, state: PortalState, _config: PortalConfig): void {
  const baseUrl = getBaseUrl(state);
  const baseUrlDisplay = formatBaseUrlForDisplay(baseUrl);

  // 1. Breadcrumb (endpoint/tag): baseUrl
  const breadcrumbHome = root.querySelector('.breadcrumb-item') as HTMLAnchorElement | null;
  if (breadcrumbHome) {
    breadcrumbHome.textContent = baseUrlDisplay || state.spec?.info.title || 'Home';
  }

  // 2. Endpoint: auth headers in Try It + Code Examples
  if (state.route.type !== 'endpoint' || !state.spec) return;

  const tryItEl = root.querySelector('.aside.try-it .content') as HTMLElement | null;
  const op = findOperation(state, state.route);

  if (op && hasOperationAuth(op.resolvedSecurity) && tryItEl) {
    const headersContainer = tryItEl.querySelector('.headers-list');
    if (headersContainer) {
      const authHeaderNames = ['Authorization', 'Cookie'];
      const allRows = Array.from(headersContainer.querySelectorAll('.header-row'));
      const authRows = allRows.filter((row) => {
        const nameInput = row.querySelector('[data-header-name]') as HTMLInputElement;
        return nameInput && authHeaderNames.includes(nameInput.value);
      });
      authRows.forEach((row) => row.remove());

      const authHeaders = resolveAuthHeaders(op.resolvedSecurity, state.spec.securitySchemes);
      const placeholders = getAuthHeaderPlaceholder(op.resolvedSecurity, state.spec.securitySchemes);
      const merged = { ...placeholders, ...authHeaders };

      const remainingRows = Array.from(headersContainer.querySelectorAll('.header-row'));
      const insertBeforeRow = remainingRows.find((row) => {
        const nameInput = row.querySelector('[data-header-name]') as HTMLInputElement;
        return nameInput && nameInput.value === 'Content-Type';
      }) || remainingRows[0];

      for (const [headerName, headerValue] of Object.entries(merged).reverse()) {
        const row = createHeaderRow(headerName, headerValue);
        if (insertBeforeRow) {
          insertBeforeRow.insertAdjacentElement('beforebegin', row);
        } else {
          headersContainer.prepend(row);
        }
      }
    }
  }

  if (tryItEl && op) {
    tryItEl.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function findOperation(state: PortalState, route: RouteInfo) {
  if (!state.spec || route.type !== 'endpoint') return null;

  // 1. Match by operationId (highest priority)
  if (route.operationId) {
    const op = state.spec.operations.find((o) => o.operationId === route.operationId);
    if (op) return op;
  }

  const method = (route.method || '').toLowerCase();
  if (!method) return null;

  // 2. Match by method + exact path
  const path = route.path || '';
  const candidates = state.spec.operations.filter(
    (op) => op.method.toLowerCase() === method && op.path === path,
  );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // 3. Multiple matches — disambiguate by tag (slug comparison)
  if (route.tag) {
    const routeTagSlug = slugifyTag(route.tag);
    const tagged = candidates.find((op) =>
      op.tags.some((t) => slugifyTag(t) === routeTagSlug),
    );
    if (tagged) return tagged;
  }

  return candidates[0];
}

function setupViewportSidebarSync(): void {
  cleanupViewportSync?.();
  cleanupViewportSync = null;

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

  const media = window.matchMedia(`(max-width: ${MOBILE_SIDEBAR_MAX_WIDTH}px)`);
  const syncState = (isMobile: boolean): void => {
    const shouldBeOpen = !isMobile;
    if (store.get().sidebarOpen !== shouldBeOpen) {
      store.set({ sidebarOpen: shouldBeOpen });
    }
  };

  syncState(media.matches);

  const onChange = (event: MediaQueryListEvent): void => {
    syncState(event.matches);
  };

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onChange);
    cleanupViewportSync = () => media.removeEventListener('change', onChange);
    return;
  }

  const legacyOnChange = onChange as unknown as (event: MediaQueryListEvent) => void;
  media.addListener(legacyOnChange);
  cleanupViewportSync = () => media.removeListener(legacyOnChange);
}

function isSameRoute(a: RouteInfo, b: RouteInfo): boolean {
  return a.type === b.type
    && a.operationId === b.operationId
    && a.method === b.method
    && a.path === b.path
    && a.schemaName === b.schemaName
    && a.tag === b.tag
    && a.webhookName === b.webhookName;
}
