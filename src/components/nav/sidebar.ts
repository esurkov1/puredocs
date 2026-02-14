import { h, clear } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { navigate, buildPath, parsePath } from '../../core/router';
import { toggleTheme } from '../../core/theme';
import { formatBaseUrlForDisplay } from '../../services/env';
import { showSearchModal } from '../modals/search-modal';
import { openAuthModal } from '../modals/auth-modal';
import { isOperationAuthConfigured, isSchemeConfigured } from '../modals/auth-modal';
import { formatOperationAuthTitle, hasOperationAuth } from '../../core/security';
import { createBadge, createSelect, createInput, createLockIcon } from '../ui';
import type { PortalConfig } from '../../core/types';
import type { SpecTag, SpecOperation, RouteInfo } from '../../core/types';

/** Update active state of items and expand group with active route */
export function updateSidebarActiveState(container: HTMLElement, currentRoute: RouteInfo): void {
  const items = container.querySelectorAll('.nav-item');
  let activeEl: HTMLElement | null = null;

  items.forEach((el) => {
    const a = el as HTMLAnchorElement;
    const href = a.getAttribute('href');
    if (!href) return;
    const path = href.startsWith('#') ? href.slice(1) : href;
    const route = parsePath(path);
    const isActive = isRouteMatch(route, currentRoute);
    el.classList.toggle('active', isActive);
    if (isActive) {
      a.setAttribute('aria-current', 'page');
      activeEl = a;
    } else {
      a.removeAttribute('aria-current');
    }
  });

  // Expand group containing active endpoint or tag
  const tagToExpand = currentRoute.type === 'endpoint' ? currentRoute.tag
    : currentRoute.type === 'tag' ? currentRoute.tag
    : currentRoute.type === 'schema' ? 'schemas'
    : null;

  if (tagToExpand) {
    const group = container.querySelector(`[data-nav-tag="${CSS.escape(tagToExpand)}"]`) as HTMLElement | null;
    if (group) {
      const header = group.querySelector('.nav-group-header');
      const itemsWrap = group.querySelector('.nav-group-items');
      if (header && itemsWrap) {
        header.classList.add('expanded');
        itemsWrap.classList.remove('collapsed');
      }
    }
  }

  // Scroll group header to top so the full group is visible
  if (activeEl) {
    requestAnimationFrame(() => {
      const group = (activeEl as HTMLElement).closest('.nav-group');
      const scrollTarget = group?.querySelector('.nav-group-header') as HTMLElement | null;
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } else {
        (activeEl as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }
}

/** Render the sidebar navigation */
export function renderSidebar(container: HTMLElement, config: PortalConfig): void {
  const state = store.get();
  const spec = state.spec;
  if (!spec) return;

  clear(container);

  const title = config.title || spec.info.title || 'API Docs';
  const version = spec.info.version ? `v${spec.info.version}` : '';

  // Top section: collapse + MS name + description
  const topSection = h('div', { className: 'top' });
  const collapseBtn = h('button', {
    type: 'button',
    className: 'btn icon s soft u-text-muted',
    'aria-label': 'Collapse sidebar',
  });
  collapseBtn.innerHTML = icons.chevronLeft;
  collapseBtn.addEventListener('click', () => store.set({ sidebarOpen: false }));

  const titleBlock = h('a', { className: 'title', href: '/', textContent: title });
  titleBlock.addEventListener('click', (e: Event) => { e.preventDefault(); navigate('/'); });

  const titleWrap = h('div', { className: 'title-wrap' });
  titleWrap.append(titleBlock);
  if (version) titleWrap.append(h('span', { className: 'version', textContent: version }));
  topSection.append(collapseBtn, titleWrap);

  // Auth button moved to top bar
  if (spec.securitySchemes && Object.keys(spec.securitySchemes).length > 0) {
    const authState = state.auth;
    const schemeNames = Object.keys(spec.securitySchemes);
    const activeScheme = authState.activeScheme || schemeNames[0] || '';
    const hasToken = isSchemeConfigured(activeScheme);

    const authBtn = h('button', {
      type: 'button',
      className: 'btn icon s soft u-text-muted theme',
      'aria-label': 'Configure authentication',
      title: hasToken ? `Auth: ${activeScheme}` : 'Configure authentication',
    });
    authBtn.innerHTML = hasToken ? icons.unlock : icons.lock;
    authBtn.classList.toggle('active', hasToken);
    authBtn.addEventListener('click', () => {
      openAuthModal(
        spec!.securitySchemes, 
        (container.closest('.root') as HTMLElement | null) ?? undefined, 
        activeScheme,
      );
    });
    store.subscribe(() => {
      const s = store.get();
      const scheme = s.auth.activeScheme || schemeNames[0] || '';
      const configured = isSchemeConfigured(scheme);
      authBtn.innerHTML = configured ? icons.unlock : icons.lock;
      authBtn.title = configured ? `Auth: ${scheme}` : 'Configure authentication';
      authBtn.classList.toggle('active', configured);
    });

    topSection.append(authBtn);
  }

  const themeBtn = h('button', {
    type: 'button',
    className: 'btn icon s soft u-text-muted theme',
    'aria-label': 'Toggle theme',
  });
  themeBtn.innerHTML = store.get().theme === 'light' ? icons.moon : icons.sun;
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    themeBtn.innerHTML = store.get().theme === 'light' ? icons.moon : icons.sun;
  });

  container.append(topSection);

  // Environment selector
  if (state.environments.length > 1) {
    const envSelect = renderEnvironmentSelector(state);
    container.append(envSelect);
    store.subscribe(() => {
      const s = store.get();
      if (envSelect.value !== s.activeEnvironment) {
        envSelect.value = s.activeEnvironment;
      }
    });
  }

  // Search
  const searchWrap = h('div', { className: 'search' });
  const searchIcon = h('span', { className: 'search-icon', innerHTML: icons.search });
  const searchInput = createInput({
    className: 'search-input',
    placeholder: 'Search endpoints...',
    ariaLabel: 'Search endpoints',
  });
  const kbd = h('span', { className: 'kbd', textContent: '⌘K' });

  searchInput.addEventListener('focus', () => {
    store.set({ searchOpen: true });
    searchInput.blur();
    showSearchModal();
  });

  searchWrap.append(searchIcon, searchInput, kbd);
  container.append(searchWrap);

  // Navigation
  const nav = h('nav', { className: 'nav', 'aria-label': 'API navigation' });

  // Overview link — highlighted first item (icon in 60px slot like method badge for alignment)
  const overviewItem = createOverviewNavItem({ type: 'overview' }, state.route);
  nav.append(overviewItem);

  // Tag groups
  for (const tag of spec.tags) {
    if (tag.operations.length === 0) continue;
    const group = createTagGroup(tag, state.route, state);
    nav.append(group);
  }

  // Webhooks section
  if (spec.webhooks && spec.webhooks.length > 0) {
    const whGroup = h('div', { className: 'nav-group', 'data-nav-tag': 'webhooks' });
    const whHeader = createGroupHeader('Webhooks', spec.webhooks.length);
    const whItems = h('div', { className: 'nav-group-items' });

    for (const wh of spec.webhooks) {
      const route: RouteInfo = { type: 'webhook', webhookName: wh.name };
      const item = createNavItem(wh.summary || wh.name, wh.method, route, state.route);
      item.classList.add('nav-item-webhook');
      whItems.append(item);
    }

    whHeader.addEventListener('click', () => {
      whHeader.classList.toggle('expanded');
      whItems.classList.toggle('collapsed');
    });

    const isActiveWebhook = state.route.type === 'webhook';
    whHeader.classList.toggle('expanded', isActiveWebhook);
    whItems.classList.toggle('collapsed', !isActiveWebhook);
    whGroup.append(whHeader, whItems);
    nav.append(whGroup);
  }

  // Schemas section
  const schemaNames = Object.keys(spec.schemas);
  if (schemaNames.length > 0) {
    const schemasGroup = h('div', { className: 'nav-group' });
    const schemasHeader = createGroupHeader('Schemas', schemaNames.length);
    const schemasItems = h('div', { className: 'nav-group-items' });

    for (const name of schemaNames) {
      const route: RouteInfo = { type: 'schema', schemaName: name };
      const item = createNavItem(name, undefined, route, state.route);
      schemasItems.append(item);
    }

    schemasHeader.addEventListener('click', () => {
      schemasHeader.classList.toggle('expanded');
      schemasItems.classList.toggle('collapsed');
    });

    const isActiveSchema = state.route.type === 'schema';
    schemasHeader.classList.toggle('expanded', isActiveSchema);
    schemasItems.classList.toggle('collapsed', !isActiveSchema);
    schemasGroup.setAttribute('data-nav-tag', 'schemas');
    schemasGroup.append(schemasHeader, schemasItems);
    nav.append(schemasGroup);
  }

  container.append(nav);

  // Footer: credit + theme button
  const footer = h('div', { className: 'footer' });

  const credit = h('a', {
    className: 'credit',
    href: 'https://puredocs.dev',
    target: '_blank',
    rel: 'noopener noreferrer',
  });
  credit.textContent = `puredocs.dev${version ? ` ${version}` : ''}`;
  footer.append(credit);

  // Theme button moved to footer
  footer.append(themeBtn);

  container.append(footer);

  // Scroll group header to top after initial render
  requestAnimationFrame(() => {
    const activeItem = nav.querySelector('.nav-item.active') as HTMLElement | null;
    if (activeItem) {
      const group = activeItem.closest('.nav-group');
      const scrollTarget = group?.querySelector('.nav-group-header') as HTMLElement | null;
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } else {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  });
}

function createTagGroup(tag: SpecTag, currentRoute: RouteInfo, state: { route: RouteInfo }): HTMLElement {
  const group = h('div', { className: 'nav-group', 'data-nav-tag': tag.name });
  const header = createTagGroupHeader(tag, currentRoute);
  const items = h('div', { className: 'nav-group-items' });

  const isActiveTag = currentRoute.type === 'tag' && currentRoute.tag === tag.name
    || tag.operations.some((op) => isRouteMatch(routeForOp(op, tag.name), currentRoute));

  for (const op of tag.operations) {
    const route = routeForOp(op, tag.name);
    const item = createEndpointNavItem(op, route, currentRoute);
    items.append(item);
  }

  header.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest('.nav-group-link')) return;
    header.classList.toggle('expanded');
    items.classList.toggle('collapsed');
  });

  items.classList.toggle('collapsed', !isActiveTag);

  group.append(header, items);
  return group;
}

function createTagGroupHeader(tag: SpecTag, currentRoute: RouteInfo): HTMLElement {
  const isActiveTag = currentRoute.type === 'tag' && currentRoute.tag === tag.name
    || tag.operations.some((op) => isRouteMatch(routeForOp(op, tag.name), currentRoute));

  const header = h('div', { className: 'nav-group-header focus-ring', 'aria-expanded': String(isActiveTag), tabIndex: 0 });

  const chevronBtn = h('button', {
    type: 'button',
    className: 'nav-group-chevron',
    'aria-label': isActiveTag ? 'Collapse' : 'Expand',
  });
  chevronBtn.innerHTML = icons.chevronRight;
  chevronBtn.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    header.click();
  });

  const link = h('a', {
    className: 'nav-group-link',
    href: buildPath({ type: 'tag', tag: tag.name }),
  });
  link.append(
    h('span', { className: 'nav-group-title', textContent: tag.name }),
    h('span', { className: 'nav-group-count', textContent: String(tag.operations.length) }),
  );
  link.addEventListener('click', (e: Event) => {
    e.preventDefault();
    navigate(buildPath({ type: 'tag', tag: tag.name }));
  });

  header.append(chevronBtn, link);
  header.classList.toggle('expanded', isActiveTag);

  header.addEventListener('keydown', (e: Event) => {
    if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
      e.preventDefault();
      chevronBtn.click();
    }
  });

  return header;
}

function createGroupHeader(name: string, count: number): HTMLElement {
  const header = h('div', { className: 'nav-group-header focus-ring', role: 'button', 'aria-expanded': 'true', tabindex: '0' });

  const chevronBtn = h('button', {
    type: 'button',
    className: 'nav-group-chevron',
    'aria-label': 'Toggle section',
  });
  chevronBtn.innerHTML = icons.chevronRight;
  chevronBtn.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    header.click();
  });

  const label = h('span', { className: 'nav-group-link nav-group-link--static' });
  label.append(
    h('span', { className: 'nav-group-title', textContent: name }),
    h('span', { className: 'nav-group-count', textContent: String(count) }),
  );
  header.append(chevronBtn, label);

  header.addEventListener('keydown', (e: Event) => {
    if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
      e.preventDefault();
      header.click();
    }
  });

  return header;
}

function createNavItem(label: string, method: string | undefined, route: RouteInfo, currentRoute: RouteInfo): HTMLElement {
  const isActive = isRouteMatch(route, currentRoute);
  const item = h('a', {
    className: `nav-item${isActive ? ' active' : ''}`,
    href: buildPath(route),
    role: 'link',
    'aria-current': isActive ? 'page' : undefined,
  });

  const methodBadge = method
    ? createBadge({
      text: method.toUpperCase(),
      kind: 'method',
      method,
      mono: true,
    })
    : createBadge({
      text: 'GET',
      kind: 'method',
      method: 'get',
      mono: true,
      className: 'placeholder',
    });
  if (!method) methodBadge.setAttribute('aria-hidden', 'true');
  item.append(methodBadge);

  item.append(h('span', { className: 'nav-item-label', textContent: label }));

  item.addEventListener('click', (e: Event) => {
    e.preventDefault();
    navigate(buildPath(route));
  });

  return item;
}

function createOverviewNavItem(route: RouteInfo, currentRoute: RouteInfo): HTMLElement {
  const isActive = isRouteMatch(route, currentRoute);
  const item = h('a', {
    className: `nav-item nav-item-overview${isActive ? ' active' : ''}`,
    href: buildPath(route),
    role: 'link',
    'aria-current': isActive ? 'page' : undefined,
  });

  const iconSlot = h('span', { className: 'nav-overview-icon-slot' });
  iconSlot.innerHTML = icons.globe;
  const label = h('span', { className: 'nav-item-label', textContent: 'Overview' });

  item.append(iconSlot, label);

  item.addEventListener('click', (e: Event) => {
    e.preventDefault();
    navigate(buildPath(route));
  });

  return item;
}

function createEndpointNavItem(op: SpecOperation, route: RouteInfo, currentRoute: RouteInfo): HTMLElement {
  const isActive = isRouteMatch(route, currentRoute);
  const item = h('a', {
    className: `nav-item${isActive ? ' active' : ''}${op.deprecated ? ' deprecated' : ''}`,
    href: buildPath(route),
    title: `${op.method.toUpperCase()} ${op.path}`,
    'aria-current': isActive ? 'page' : undefined,
  });

  const spec = store.get().spec;
  const lockEl = hasOperationAuth(op.resolvedSecurity)
    ? createLockIcon({
      configured: isOperationAuthConfigured(op.resolvedSecurity, spec?.securitySchemes || {}),
      variant: 'nav',
      title: formatOperationAuthTitle(op.resolvedSecurity),
    })
    : null;

  item.append(
    createBadge({
      text: op.method.toUpperCase(),
      kind: 'method',
      method: op.method,
      mono: true,
    }),
    h('span', { className: 'nav-item-label', textContent: op.summary || op.path }),
    ...(lockEl ? [lockEl] : []),
  );

  item.addEventListener('click', (e: Event) => {
    e.preventDefault();
    navigate(buildPath(route));
  });

  return item;
}

function routeForOp(op: SpecOperation, tag: string): RouteInfo {
  return {
    type: 'endpoint',
    tag,
    method: op.method,
    path: op.path,
    operationId: op.operationId,
  };
}

function isRouteMatch(a: RouteInfo, b: RouteInfo): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'overview') return true;
  if (a.type === 'tag') return a.tag === b.tag;
  if (a.type === 'endpoint') return a.method === b.method && a.path === b.path;
  if (a.type === 'schema') return a.schemaName === b.schemaName;
  if (a.type === 'webhook') return a.webhookName === b.webhookName;
  return false;
}

/* ─── Environment Selector ─── */

function renderEnvironmentSelector(state: ReturnType<typeof store.get>): HTMLSelectElement {
  const canonical = state.initialEnvironments || state.environments;
  const options = state.environments.map((env) => {
    const c = canonical.find((e) => e.name === env.name);
    const url = formatBaseUrlForDisplay((c?.baseUrl ?? env.baseUrl) || '');
    return { value: env.name, label: url || '(no URL)' };
  });

  const select = createSelect({
    options,
    value: state.activeEnvironment,
    ariaLabel: 'Select server environment',
    onChange: (value) => store.setActiveEnvironment(value),
    className: 'env',
  });

  return select;
}
