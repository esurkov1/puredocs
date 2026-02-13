import { h, clear, render } from '../lib/dom';
import { icons } from '../lib/icons';
import { store } from '../core/state';
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

  // Skip re-render if same route AND env/auth unchanged
  if (prevRoute && isSameRoute(prevRoute, route) && prevEnvState === envState) return;
  
  // Route unchanged but env/auth changed — re-render sidebar and page to update lock icons
  if (prevRoute && isSameRoute(prevRoute, route) && prevEnvState !== envState) {
    prevEnvState = envState;
    updateEnvironmentState(currentPageEl, state, config);
    if (sidebarEl && state.spec) renderSidebar(sidebarEl, config);
  }
  
  prevRoute = { ...route };
  prevEnvState = envState;

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
        render(currentMainEl, createEmptyStatePage({
          title: 'Endpoint not found',
          message: `${route.method?.toUpperCase()} ${route.path}`,
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

  const mainScroll = currentMainEl.parentElement as HTMLElement | null;
  if (mainScroll) mainScroll.scrollTop = 0;
}

/** Точечное обновление при смене окружения/auth без полной перерисовки */
function updateEnvironmentState(root: HTMLElement, state: PortalState, _config: PortalConfig): void {
  const baseUrl = getBaseUrl(state);
  const baseUrlDisplay = formatBaseUrlForDisplay(baseUrl);

  // 1. Breadcrumb (endpoint/tag): baseUrl
  const breadcrumbHome = root.querySelector('.breadcrumb-item') as HTMLAnchorElement | null;
  if (breadcrumbHome) {
    breadcrumbHome.textContent = baseUrlDisplay || state.spec?.info.title || 'Главная';
  }

  // 2. Endpoint: auth headers в Try It + Code Examples
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
  if (!state.spec) return null;
  return state.spec.operations.find(
    (op) => op.method === route.method && op.path === route.path,
  ) || null;
}

function isSameRoute(a: RouteInfo, b: RouteInfo): boolean {
  return a.type === b.type
    && a.method === b.method
    && a.path === b.path
    && a.schemaName === b.schemaName
    && a.tag === b.tag
    && a.webhookName === b.webhookName;
}
