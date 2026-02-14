import { h, clear } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { navigate, buildPath, parsePath, slugifyTag } from '../../core/router';
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
  let activeEl: HTMLAnchorElement | null = null;

  for (const el of items) {
    const a = el as HTMLAnchorElement;
    const routeFromDataset = parseRouteFromDataset(a);
    const href = a.getAttribute('href');
    if (!href && !routeFromDataset) continue;
    const path = href?.startsWith('#') ? href.slice(1) : href || '';
    const route = routeFromDataset || parsePath(path);
    const isActive = isRouteMatch(route, currentRoute);
    el.classList.toggle('active', isActive);
    if (isActive) {
      a.setAttribute('aria-current', 'page');
      activeEl = a;
    } else {
      a.removeAttribute('aria-current');
    }
  }

  // Expand group containing active endpoint or tag
  const activeGroup = activeEl ? (activeEl.closest('.nav-group') as HTMLElement | null) : null;
  if (activeGroup) {
    const activeHeader = activeGroup.querySelector('.nav-group-header');
    const activeItems = activeGroup.querySelector('.nav-group-items');
    if (activeHeader instanceof HTMLElement && activeItems instanceof HTMLElement) {
      setNavGroupExpanded(activeHeader, activeItems, true, { animate: false });
    }
  }

  const tagToExpand = currentRoute.type === 'endpoint' ? currentRoute.tag
    : currentRoute.type === 'tag' ? currentRoute.tag
    : null;
  const expandSlug = currentRoute.type === 'schema' ? 'schemas'
    : currentRoute.type === 'webhook' ? 'webhooks'
    : tagToExpand ? slugifyTag(tagToExpand) : null;

  if (expandSlug) {
    const group = container.querySelector(`[data-nav-tag="${CSS.escape(expandSlug)}"]`) as HTMLElement | null;
    if (group) {
      const header = group.querySelector('.nav-group-header');
      const itemsWrap = group.querySelector('.nav-group-items');
      if (header instanceof HTMLElement && itemsWrap instanceof HTMLElement) {
        setNavGroupExpanded(header, itemsWrap, true, { animate: false });
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

/**
 * Lightweight update: patch only auth-related elements in the sidebar
 * (lock icons on endpoints + top auth button) without full re-render.
 */
export function updateSidebarAuthState(container: HTMLElement): void {
  const state = store.get();
  const spec = state.spec;
  if (!spec) return;

  const schemes = spec.securitySchemes || {};

  // 1. Update the auth button icon (lock / unlock)
  const authBtn = container.querySelector('[data-sidebar-auth-btn]') as HTMLElement | null;
  if (authBtn) {
    const schemeNames = Object.keys(schemes);
    const activeScheme = state.auth.activeScheme || schemeNames[0] || '';
    const hasToken = isSchemeConfigured(activeScheme);
    authBtn.innerHTML = hasToken ? icons.unlock : icons.lock;
    authBtn.classList.toggle('active', hasToken);
  }

  // 2. Update lock icons inside nav items
  const lockSlots = container.querySelectorAll('[data-lock-slot]');
  // Build a quick lookup: operationId -> SpecOperation
  const opById = new Map<string, SpecOperation>();
  const opByKey = new Map<string, SpecOperation>();
  for (const op of spec.operations) {
    if (op.operationId) opById.set(op.operationId, op);
    opByKey.set(`${op.method.toLowerCase()} ${op.path}`, op);
  }

  for (const slot of lockSlots) {
    const navItem = slot.closest('.nav-item') as HTMLElement | null;
    if (!navItem) continue;

    const opId = navItem.dataset.routeOperationId;
    const method = navItem.dataset.routeMethod;
    const path = navItem.dataset.routePath;
    const op = (opId && opById.get(opId)) || (method && path ? opByKey.get(`${method.toLowerCase()} ${path}`) : null);
    if (!op) continue;

    const configured = isOperationAuthConfigured(op.resolvedSecurity, schemes);
    const newLock = createLockIcon({
      configured,
      variant: 'nav',
      title: formatOperationAuthTitle(op.resolvedSecurity),
    });
    slot.innerHTML = '';
    slot.append(newLock);
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
    const schemeNames = Object.keys(spec.securitySchemes);
    const activeScheme = state.auth.activeScheme || schemeNames[0] || '';
    const hasToken = isSchemeConfigured(activeScheme);

    const authBtn = h('button', {
      type: 'button',
      className: 'btn icon s soft u-text-muted theme',
      'aria-label': 'Configure authentication',
      'data-sidebar-auth-btn': '',
    });
    authBtn.innerHTML = hasToken ? icons.unlock : icons.lock;
    authBtn.classList.toggle('active', hasToken);
    authBtn.addEventListener('click', () => {
      const currentState = store.get();
      const currentScheme = currentState.auth.activeScheme || schemeNames[0] || '';
      openAuthModal(
        spec!.securitySchemes, 
        (container.closest('.root') as HTMLElement | null) ?? undefined, 
        currentScheme,
      );
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
    const whListRoute: RouteInfo = { type: 'webhook' };
    const whHeader = createLinkedGroupHeader('Webhooks', spec.webhooks.length, whListRoute, state.route);
    const whItems = h('div', { className: 'nav-group-items' });

    for (const wh of spec.webhooks) {
      const route: RouteInfo = { type: 'webhook', webhookName: wh.name };
      const item = createNavItem(wh.summary || wh.name, wh.method, route, state.route);
      item.classList.add('nav-item-webhook');
      whItems.append(item);
    }

    whHeader.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.nav-group-link')) return;
      setNavGroupExpanded(whHeader, whItems);
    });

    const isActiveWebhook = state.route.type === 'webhook';
    setNavGroupExpanded(whHeader, whItems, isActiveWebhook, { animate: false });
    whGroup.append(whHeader, whItems);
    nav.append(whGroup);
  }

  // Schemas section
  const schemaNames = Object.keys(spec.schemas);
  if (schemaNames.length > 0) {
    const schemasGroup = h('div', { className: 'nav-group' });
    const schemasListRoute: RouteInfo = { type: 'schema' };
    const schemasHeader = createLinkedGroupHeader('Schemas', schemaNames.length, schemasListRoute, state.route);
    const schemasItems = h('div', { className: 'nav-group-items' });

    for (const name of schemaNames) {
      const route: RouteInfo = { type: 'schema', schemaName: name };
      const item = createNavItem(name, undefined, route, state.route);
      schemasItems.append(item);
    }

    schemasHeader.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.nav-group-link')) return;
      setNavGroupExpanded(schemasHeader, schemasItems);
    });

    const isActiveSchema = state.route.type === 'schema';
    setNavGroupExpanded(schemasHeader, schemasItems, isActiveSchema, { animate: false });
    schemasGroup.setAttribute('data-nav-tag', 'schemas');
    schemasGroup.append(schemasHeader, schemasItems);
    nav.append(schemasGroup);
  }

  container.append(nav);

  // Re-sync heights for expanded groups now that elements are in the DOM
  // (scrollHeight is 0 when measured off-DOM during group creation)
  for (const items of nav.querySelectorAll('.nav-group-items:not(.collapsed)')) {
    syncNavGroupHeight(items as HTMLElement);
  }

  // Footer: credit + theme button
  const footer = h('div', { className: 'footer' });

  // Logo button
  const logoBtn = h('button', {
    type: 'button',
    className: 'btn icon s soft u-text-muted theme',
    'aria-label': 'PureDocs',
  });
  // Import the logo SVG content
  logoBtn.innerHTML = `<svg viewBox="0 0 593 465" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,465) scale(0.1,-0.1)" fill="currentColor" stroke="none">
      <path d="M895 4308 c-41 -15 -105 -56 -128 -82 -10 -12 -28 -41 -40 -66 l-22 -45 -3 -983 c-2 -618 1 -983 7 -980 5 1 66 37 135 78 l126 75 1 335 c1 184 3 570 4 857 4 588 1 569 78 604 40 18 83 19 1140 19 l1097 0 0 -192 c0 -106 3 -264 7 -351 7 -173 14 -195 76 -241 27 -20 43 -21 385 -26 l357 -5 3 -1363 c2 -1336 2 -1365 -18 -1408 -34 -78 22 -74 -962 -74 l-873 0 -50 -26 c-28 -15 -109 -60 -181 -101 l-131 -74 -287 -1 -287 -2 -29 30 c-16 16 -51 58 -77 92 -45 59 -63 73 -278 201 l-230 137 -3 -175 c-2 -142 0 -184 13 -218 21 -54 84 -119 143 -146 l47 -22 1640 0 1640 0 51 27 c27 14 67 45 87 67 71 79 67 -20 67 1607 0 804 -3 1475 -6 1491 -4 23 -122 147 -474 502 l-467 471 -1264 -1 c-877 0 -1273 -4 -1294 -11z"/>
      <path d="M5361 3645 c-2 -51 -36 -167 -69 -231 -64 -126 -193 -201 -407 -237 -11 -2 10 -9 46 -15 239 -43 359 -147 414 -357 8 -32 15 -74 15 -93 0 -19 4 -31 10 -27 6 3 10 18 10 32 0 48 32 157 62 215 62 116 174 191 343 227 50 10 78 19 64 20 -44 2 -180 41 -232 67 -113 58 -185 161 -223 319 -9 39 -20 79 -25 90 -6 17 -8 15 -8 -10z"/>
      <path d="M1354 3527 c-3 -8 -4 -45 -2 -83 l3 -69 743 -3 742 -2 0 85 0 85 -740 0 c-612 0 -742 -2 -746 -13z"/>
      <path d="M1350 3005 l0 -75 1185 0 1186 0 -3 68 -3 67 -120 6 c-66 4 -598 7 -1182 8 l-1063 1 0 -75z"/>
      <path d="M2033 2638 c-6 -7 -41 -137 -78 -288 -79 -327 -349 -1427 -405 -1656 -22 -89 -40 -170 -40 -181 0 -23 -11 -20 208 -49 115 -16 134 -16 146 -3 7 7 35 102 61 209 26 107 87 359 136 560 49 201 125 514 169 695 44 182 96 393 115 469 21 87 30 146 25 155 -7 13 -150 58 -311 97 -9 3 -21 -1 -26 -8z"/>
      <path d="M4810 2585 c0 -28 -34 -68 -73 -85 l-38 -17 30 -12 c36 -16 66 -47 82 -86 l12 -30 8 29 c10 36 42 71 80 87 l30 12 -38 17 c-39 17 -73 57 -73 85 0 8 -4 15 -10 15 -5 0 -10 -7 -10 -15z"/>
      <path d="M2706 2230 c-48 -58 -136 -197 -136 -217 0 -20 121 -106 587 -416 84 -56 153 -106 153 -110 0 -4 -34 -29 -75 -55 -68 -43 -272 -171 -510 -321 -49 -32 -150 -95 -222 -141 -73 -46 -133 -88 -133 -93 0 -5 35 -63 77 -129 52 -80 84 -120 99 -124 23 -6 174 85 739 441 182 115 345 216 438 273 77 47 107 83 107 132 0 22 -5 50 -11 64 -7 15 -77 69 -173 134 -843 570 -877 592 -898 592 -9 0 -28 -14 -42 -30z"/>
      <path d="M1205 2171 c-145 -90 -429 -266 -510 -316 -374 -230 -527 -328 -544 -349 -7 -8 -15 -34 -18 -57 -9 -61 17 -102 91 -146 67 -40 298 -183 650 -403 298 -185 323 -200 346 -200 22 0 160 211 160 245 0 12 -8 29 -17 38 -18 15 -433 278 -610 386 -51 30 -93 58 -93 61 0 5 526 336 710 447 36 22 66 47 68 55 2 9 -30 69 -70 134 -65 105 -77 119 -103 122 -17 1 -43 -6 -60 -17z"/>
    </g>
  </svg>`;
  logoBtn.addEventListener('click', () => {
    window.open('https://puredocs.dev', '_blank', 'noopener,noreferrer');
  });

  const credit = h('a', {
    className: 'credit',
    href: 'https://puredocs.dev',
    target: '_blank',
    rel: 'noopener noreferrer',
  });
  credit.textContent = `puredocs.dev${version ? ` ${version}` : ''}`;
  
  footer.append(logoBtn, credit);

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
  const group = h('div', { className: 'nav-group', 'data-nav-tag': slugifyTag(tag.name) });
  const header = createTagGroupHeader(tag, currentRoute);
  const items = h('div', { className: 'nav-group-items' });

  const tagSlug = slugifyTag(tag.name);
  const isActiveTag = (currentRoute.type === 'tag' && slugifyTag(currentRoute.tag || '') === tagSlug)
    || tag.operations.some((op) => isRouteMatch(routeForOp(op, tag.name), currentRoute));

  for (const op of tag.operations) {
    const route = routeForOp(op, tag.name);
    const item = createEndpointNavItem(op, route, currentRoute);
    items.append(item);
  }

  header.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest('.nav-group-link')) return;
    setNavGroupExpanded(header, items);
  });

  setNavGroupExpanded(header, items, isActiveTag, { animate: false });

  group.append(header, items);
  return group;
}

function createTagGroupHeader(tag: SpecTag, currentRoute: RouteInfo): HTMLElement {
  const tagSlug = slugifyTag(tag.name);
  const isActiveTag = (currentRoute.type === 'tag' && slugifyTag(currentRoute.tag || '') === tagSlug)
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

  header.addEventListener('keydown', (e: Event) => {
    if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
      e.preventDefault();
      chevronBtn.click();
    }
  });

  return header;
}

function createLinkedGroupHeader(name: string, count: number, listRoute: RouteInfo, currentRoute: RouteInfo): HTMLElement {
  const isActive = currentRoute.type === listRoute.type;

  const header = h('div', { className: 'nav-group-header focus-ring', 'aria-expanded': String(isActive), tabIndex: 0 });

  const chevronBtn = h('button', {
    type: 'button',
    className: 'nav-group-chevron',
    'aria-label': isActive ? 'Collapse' : 'Expand',
  });
  chevronBtn.innerHTML = icons.chevronRight;
  chevronBtn.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    header.click();
  });

  const link = h('a', {
    className: 'nav-group-link',
    href: buildPath(listRoute),
  });
  link.append(
    h('span', { className: 'nav-group-title', textContent: name }),
    h('span', { className: 'nav-group-count', textContent: String(count) }),
  );
  link.addEventListener('click', (e: Event) => {
    e.preventDefault();
    navigate(buildPath(listRoute));
  });

  header.append(chevronBtn, link);

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

function setNavGroupExpanded(
  header: HTMLElement,
  items: HTMLElement,
  expanded: boolean = !header.classList.contains('expanded'),
  options: { animate?: boolean } = {},
): void {
  const shouldAnimate = options.animate !== false;

  if (!shouldAnimate) {
    header.classList.toggle('expanded', expanded);
    header.setAttribute('aria-expanded', String(expanded));
    updateGroupChevronAriaLabel(header, expanded);
    items.classList.toggle('collapsed', !expanded);
    syncNavGroupHeight(items);
    return;
  }

  if (expanded) {
    items.classList.remove('collapsed');
    syncNavGroupHeight(items);
  } else {
    syncNavGroupHeight(items);
    // Keep current height for one frame so collapse animates smoothly from content height.
    void items.offsetHeight;
    items.classList.add('collapsed');
  }

  header.classList.toggle('expanded', expanded);
  header.setAttribute('aria-expanded', String(expanded));
  updateGroupChevronAriaLabel(header, expanded);
}

function syncNavGroupHeight(items: HTMLElement): void {
  items.style.setProperty('--nav-group-max-height', `${items.scrollHeight}px`);
}

function updateGroupChevronAriaLabel(header: HTMLElement, expanded: boolean): void {
  const chevron = header.querySelector('.nav-group-chevron');
  if (!(chevron instanceof HTMLElement)) return;
  chevron.setAttribute('aria-label', expanded ? 'Collapse' : 'Expand');
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
    'aria-current': isActive ? 'page' : undefined,
  });
  item.dataset.routeType = 'endpoint';
  if (route.operationId) item.dataset.routeOperationId = route.operationId;
  if (route.method) item.dataset.routeMethod = route.method;
  if (route.path) item.dataset.routePath = route.path;
  if (route.tag) item.dataset.routeTag = route.tag;

  const spec = store.get().spec;
  const needsAuth = hasOperationAuth(op.resolvedSecurity);
  const lockEl = needsAuth
    ? createLockIcon({
      configured: isOperationAuthConfigured(op.resolvedSecurity, spec?.securitySchemes || {}),
      variant: 'nav',
      title: formatOperationAuthTitle(op.resolvedSecurity),
    })
    : null;

  // Wrap lock in a slot so updateSidebarAuthState can patch it in-place
  const lockSlot = needsAuth ? h('span', { 'data-lock-slot': '' }) : null;
  if (lockSlot && lockEl) lockSlot.append(lockEl);

  item.append(
    createBadge({
      text: op.method.toUpperCase(),
      kind: 'method',
      method: op.method,
      mono: true,
    }),
    h('span', { className: 'nav-item-label', textContent: op.summary || op.path }),
    ...(lockSlot ? [lockSlot] : []),
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
  if (a.type === 'tag') return slugifyTag(a.tag || '') === slugifyTag(b.tag || '');
  if (a.type === 'endpoint') {
    if (a.operationId && b.operationId) return a.operationId === b.operationId;
    const methodA = (a.method || '').toLowerCase();
    const methodB = (b.method || '').toLowerCase();
    return methodA === methodB && normalizeEndpointPath(a.path) === normalizeEndpointPath(b.path);
  }
  if (a.type === 'schema') return a.schemaName === b.schemaName;
  if (a.type === 'webhook') return a.webhookName === b.webhookName;
  return false;
}

function normalizeEndpointPath(path: string | undefined): string {
  if (!path) return '/';
  const normalized = path.replace(/\/+/g, '/').replace(/\/+$/, '');
  return normalized || '/';
}

function parseRouteFromDataset(link: HTMLAnchorElement): RouteInfo | null {
  const { routeType } = link.dataset;
  if (!routeType) return null;

  if (routeType === 'endpoint') {
    return {
      type: 'endpoint',
      operationId: link.dataset.routeOperationId || undefined,
      method: link.dataset.routeMethod || undefined,
      path: link.dataset.routePath || undefined,
      tag: link.dataset.routeTag || undefined,
    };
  }

  return null;
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
