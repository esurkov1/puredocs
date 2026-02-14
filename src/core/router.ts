import type { RouteInfo } from './types';
import { store } from './state';

let basePath = '';
const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

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
  if (!basePath) return path || '/';
  if (path === basePath) return '/';
  if (path.startsWith(`${basePath}/`)) return path.slice(basePath.length) || '/';
  return path || '/';
}

/**
 * Create a URL-safe slug from an API path
 * /users/{id}/posts -> users-id-posts
 * /v1/api/auth/login -> v1-api-auth-login
 */
function pathToSlug(apiPath: string): string {
  return apiPath
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/\{([^}]+)\}/g, '$1') // {id} -> id
    .replace(/[^\w\-/]/g, '-') // Replace special chars with dash
    .replace(/\/+/g, '-') // Replace slashes with dash
    .replace(/-+/g, '-') // Collapse multiple dashes
    .toLowerCase();
}

/**
 * Extract tag slug (URL-friendly version)
 */
function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^\w\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Parse a path into RouteInfo */
export function parsePath(path: string): RouteInfo {
  const pathOnly = path.split('?')[0]?.split('#')[0] || '/';
  const withoutLeading = pathOnly.replace(/^\/+/, '');
  const clean = withoutLeading.replace(/\/+$/, '');

  if (!clean || clean === '/') {
    return { type: 'overview' };
  }

  // New human-readable format: /{tag}/{method}-{slug}
  // Example: /users/get-users-id OR /users/post-users
  const endpointMatch = clean.match(/^([^/]+)\/(get|post|put|patch|delete|head|options|trace)-(.+)$/);
  if (endpointMatch) {
    const [, tagSlug, method, pathSlug] = endpointMatch;
    return {
      type: 'endpoint',
      tag: decodeURIComponent(tagSlug),
      method: method.toLowerCase(),
      // Store the path slug for matching
      pathSlug: decodeURIComponent(pathSlug),
    };
  }

  // Category page: /{tag}
  if (clean && !clean.includes('/')) {
    return { type: 'tag', tag: decodeURIComponent(clean) };
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
    case 'tag': {
      const slug = tagToSlug(route.tag || '');
      return `/${slug}`;
    }
    case 'endpoint': {
      if (route.operationId) {
        // If we have operationId but no tag/method/path, we need to look it up
        // This will be handled by the component
        return '/';
      }

      const method = (route.method || '').toLowerCase();
      const tag = route.tag || 'default';
      const apiPath = route.path || '/';
      
      if (!method) return '/';

      const tagSlug = tagToSlug(tag);
      const pathSlug = pathToSlug(apiPath);
      
      return `/${tagSlug}/${method}-${pathSlug}`;
    }
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
