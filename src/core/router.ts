import type { RouteInfo } from './types';
import { store } from './state';

let basePath = '';

/** Initialize history router */
export function initRouter(base = ''): void {
  basePath = base.replace(/\/$/, '');
  window.addEventListener('popstate', handleRouteChange);
  handleRouteChange();
}

/** Navigate to a path */
export function navigate(path: string): void {
  window.history.pushState(null, '', basePath + path);
  handleRouteChange();
}

/** Get the current path */
function getCurrentPath(): string {
  const path = window.location.pathname;
  return basePath ? path.replace(basePath, '') || '/' : path;
}

/** Parse a path into RouteInfo */
export function parsePath(path: string): RouteInfo {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');

  if (!clean || clean === '/') {
    return { type: 'overview' };
  }

  // /operations/{tag}/{method}/{path}
  const opMatch = clean.match(/^operations\/([^/]+)\/([^/]+)\/(.+)$/);
  if (opMatch) {
    return {
      type: 'endpoint',
      tag: decodeURIComponent(opMatch[1]),
      method: opMatch[2].toLowerCase(),
      path: '/' + decodeURIComponent(opMatch[3]),
    };
  }

  // /tags/{tag}
  const tagMatch = clean.match(/^tags\/([^/]+)$/);
  if (tagMatch) {
    return { type: 'tag', tag: decodeURIComponent(tagMatch[1]) };
  }

  // /schemas/{name}
  const schemaMatch = clean.match(/^schemas\/(.+)$/);
  if (schemaMatch) {
    return { type: 'schema', schemaName: decodeURIComponent(schemaMatch[1]) };
  }

  // /webhooks/{name}
  const webhookMatch = clean.match(/^webhooks\/(.+)$/);
  if (webhookMatch) {
    return { type: 'webhook', webhookName: decodeURIComponent(webhookMatch[1]) };
  }

  // /guides/{path}
  const guideMatch = clean.match(/^guides\/(.+)$/);
  if (guideMatch) {
    return { type: 'guide', guidePath: decodeURIComponent(guideMatch[1]) };
  }

  return { type: 'overview' };
}

/** Build a navigation path from RouteInfo */
export function buildPath(route: RouteInfo): string {
  switch (route.type) {
    case 'overview':
      return '/';
    case 'tag':
      return `/tags/${encodeURIComponent(route.tag || '')}`;
    case 'endpoint':
      return `/operations/${encodeURIComponent(route.tag || 'default')}/${route.method}/${encodeURIComponent((route.path || '/').slice(1))}`;
    case 'schema':
      return `/schemas/${encodeURIComponent(route.schemaName || '')}`;
    case 'webhook':
      return `/webhooks/${encodeURIComponent(route.webhookName || '')}`;
    case 'guide':
      return `/guides/${encodeURIComponent(route.guidePath || '')}`;
    default:
      return '/';
  }
}

/** Handle route change events */
function handleRouteChange(): void {
  const path = getCurrentPath();
  const route = parsePath(path);
  store.setRoute(route);
}

/** Cleanup router listeners */
export function destroyRouter(): void {
  window.removeEventListener('popstate', handleRouteChange);
}
