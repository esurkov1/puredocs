import { h, clear, render } from '../lib/dom';
import { icons } from '../lib/icons';
import { store } from '../core/state';
import { slugifyTag, navigate, buildPath } from '../core/router';
import { applyTheme, type ThemeConfig } from '../core/theme';
import { renderSidebar, updateSidebarActiveState, updateSidebarAuthState } from './nav/sidebar';
import { renderOverview } from './pages/overview';
import { renderEndpoint } from './pages/endpoint';
import { renderTagPage } from './pages/tag-page';
import { renderSchemaViewer } from './shared/schema-viewer';
import { renderWebhookPage } from './pages/webhook';
import { resolveAuthHeaders, getAuthHeaderPlaceholder } from './modals/auth-modal';
import { createBreadcrumb, createBadge, createCard, createSection } from './ui';
import { createCopyButton } from './shared/copy-button';
import { createSummaryLine } from './shared/summary';
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
  
  // Route unchanged but env/auth changed — patch sidebar in-place and update page content
  if (isSameRouteWithEnvOrAuthChange) {
    prevEnvState = envState;
    updateEnvironmentState(currentPageEl, state, config);
    if (sidebarEl && state.spec) updateSidebarAuthState(sidebarEl);
    return;
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
        const showTryIt = op.method.toLowerCase() !== 'trace';
        setContentAreaAside(currentPageEl, showTryIt);
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
      setContentAreaAside(currentPageEl, false);
      if (route.schemaName) {
        const schema = state.spec.schemas[route.schemaName];
        if (schema) {
          const baseUrl = getBaseUrl(state);
          const baseUrlDisplay = formatBaseUrlForDisplay(baseUrl);
          const schemaCopyBtn = createCopyButton({
            ariaLabel: 'Copy schema name',
            copiedAriaLabel: 'Copied',
            className: 'breadcrumb-copy',
            getText: () => route.schemaName || '',
          });
          const schemaBreadcrumb = createBreadcrumb(
            [
              {
                label: baseUrlDisplay || state.spec.info.title || 'Home',
                href: '/',
                className: 'breadcrumb-item',
                onClick: (e: Event) => { e.preventDefault(); navigate('/'); },
              },
              { label: route.schemaName, className: 'breadcrumb-current' },
            ],
            {
              leading: [createBadge({ text: 'Schema', kind: 'chip', size: 'm', mono: true })],
              trailing: [schemaCopyBtn],
            },
          );
          const header = h('div', { className: 'block header' });
          header.append(h('h1', { textContent: route.schemaName }));
          const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap endpoint-breadcrumb' });
          breadcrumbWrap.append(schemaBreadcrumb);
          header.append(breadcrumbWrap);
          if (schema.description) {
            header.append(h('p', { textContent: String(schema.description) }));
          }
          const schemaSection = h('div', { className: 'block section' });
          schemaSection.append(renderSchemaViewer(schema, 'Properties'));
          render(currentMainEl, header, schemaSection);
        }
      } else {
        renderSchemaListPage(currentMainEl, state);
      }
      break;
    }

    case 'webhook': {
      setContentAreaAside(currentPageEl, false);
      if (route.webhookName) {
        const wh = state.spec.webhooks?.find((w) => w.name === route.webhookName);
        if (wh) {
          renderWebhookPage(currentMainEl, wh);
        } else {
          render(currentMainEl, createEmptyStatePage({
            title: 'Webhook not found',
            message: route.webhookName,
            variant: 'empty',
          }));
        }
      } else {
        renderWebhookListPage(currentMainEl, state);
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

/** Render a list page for all webhooks — similar to tag-page */
function renderWebhookListPage(slot: HTMLElement, state: PortalState): void {
  const spec = state.spec;
  if (!spec) return;
  const webhooks = spec.webhooks || [];

  const baseUrl = getBaseUrl(state);
  const baseUrlDisplay = formatBaseUrlForDisplay(baseUrl);

  const header = h('div', { className: 'block header' });
  header.append(h('h1', { textContent: 'Webhooks' }));

  const breadcrumb = createBreadcrumb([
    {
      label: baseUrlDisplay || spec.info.title || 'Home',
      href: '/',
      className: 'breadcrumb-item',
      onClick: (e: Event) => { e.preventDefault(); navigate('/'); },
    },
    { label: 'Webhooks', className: 'breadcrumb-current' },
  ], {
    leading: [createBadge({ text: 'Tag', kind: 'chip', size: 'm', mono: true })],
    trailing: [createCopyButton({
      ariaLabel: 'Copy',
      copiedAriaLabel: 'Copied',
      className: 'breadcrumb-copy',
      getText: () => 'Webhooks',
    })],
  });
  const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap endpoint-breadcrumb' });
  breadcrumbWrap.append(breadcrumb);
  header.append(breadcrumbWrap);
  slot.append(header);

  // Summary
  const methods: Record<string, number> = {};
  for (const wh of webhooks) {
    methods[wh.method] = (methods[wh.method] || 0) + 1;
  }
  slot.append(createSection(
    { className: 'summary' },
    createSummaryLine(
      [{ label: 'Webhooks', value: webhooks.length }],
      methods,
    ),
  ));

  // Cards
  const opsSection = createSection({ title: 'Webhooks' });
  for (const wh of webhooks) {
    const whRoute: RouteInfo = { type: 'webhook', webhookName: wh.name };
    const isActive = state.route.type === 'webhook' && state.route.webhookName === wh.name;
    const card = createCard({
      interactive: true,
      active: isActive,
      className: 'card-group',
      onClick: () => navigate(buildPath(whRoute)),
    });
    const badges = h('div', { className: 'card-badges' });
    badges.append(
      createBadge({ text: 'WH', kind: 'webhook', size: 'm', mono: true }),
      createBadge({ text: wh.method.toUpperCase(), kind: 'method', method: wh.method, size: 'm', mono: true }),
    );
    const top = h('div', { className: 'card-group-top' });
    top.append(h('h3', { className: 'card-group-title', textContent: wh.name }), badges);
    const desc = h('p', {
      className: 'card-group-description',
      textContent: wh.summary || wh.description || `${wh.method.toUpperCase()} webhook`,
    });
    card.append(top, desc);
    opsSection.append(card);
  }
  slot.append(opsSection);
}

/** Render a list page for all schemas — similar to tag-page */
function renderSchemaListPage(slot: HTMLElement, state: PortalState): void {
  const spec = state.spec;
  if (!spec) return;
  const schemaNames = Object.keys(spec.schemas);

  const baseUrl = getBaseUrl(state);
  const baseUrlDisplay = formatBaseUrlForDisplay(baseUrl);

  const header = h('div', { className: 'block header' });
  header.append(h('h1', { textContent: 'Schemas' }));

  const breadcrumb = createBreadcrumb([
    {
      label: baseUrlDisplay || spec.info.title || 'Home',
      href: '/',
      className: 'breadcrumb-item',
      onClick: (e: Event) => { e.preventDefault(); navigate('/'); },
    },
    { label: 'Schemas', className: 'breadcrumb-current' },
  ], {
    leading: [createBadge({ text: 'Tag', kind: 'chip', size: 'm', mono: true })],
    trailing: [createCopyButton({
      ariaLabel: 'Copy',
      copiedAriaLabel: 'Copied',
      className: 'breadcrumb-copy',
      getText: () => 'Schemas',
    })],
  });
  const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap endpoint-breadcrumb' });
  breadcrumbWrap.append(breadcrumb);
  header.append(breadcrumbWrap);
  slot.append(header);

  // Summary
  slot.append(createSection(
    { className: 'summary' },
    createSummaryLine(
      [{ label: 'Schemas', value: schemaNames.length }],
      {},
    ),
  ));

  // Cards
  const schemasSection = createSection({ title: 'Schemas' });
  for (const name of schemaNames) {
    const schema = spec.schemas[name];
    const schemaRoute: RouteInfo = { type: 'schema', schemaName: name };
    const isActive = state.route.type === 'schema' && state.route.schemaName === name;
    const card = createCard({
      interactive: true,
      active: isActive,
      className: 'card-group',
      onClick: () => navigate(buildPath(schemaRoute)),
    });
    const badges = h('div', { className: 'card-badges' });
    const schemaType = schema.type || (schema.allOf ? 'allOf' : schema.oneOf ? 'oneOf' : schema.anyOf ? 'anyOf' : 'object');
    badges.append(createBadge({ text: schemaType, kind: 'chip', size: 'm', mono: true }));
    if (schema.properties) {
      badges.append(createBadge({ text: `${Object.keys(schema.properties).length} props`, kind: 'chip', size: 'm', mono: true }));
    }
    const top = h('div', { className: 'card-group-top' });
    top.append(h('h3', { className: 'card-group-title', textContent: name }), badges);
    const desc = schema.description
      ? h('p', { className: 'card-group-description', textContent: String(schema.description) })
      : h('p', { className: 'card-group-description', textContent: `${schemaType} schema` });
    card.append(top, desc);
    schemasSection.append(card);
  }
  slot.append(schemasSection);
}
