import type { RouteInfo } from './types';
import { store } from './state';

// ─── Constants ───

const HTTP_METHODS = new Set([
  'get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace',
]);
const ROUTE_MARKER = '~';
const ROUTE_MARKER_PATH = `/${ROUTE_MARKER}`;

let basePath = '';

// ─── Lifecycle ───

/** Initialize the History API router */
export function initRouter(base = ''): void {
  basePath = normalizeBasePath(base || inferBasePath());
  window.addEventListener('popstate', handleRouteChange);
  handleRouteChange();
}

/** Remove all router event listeners */
export function destroyRouter(): void {
  window.removeEventListener('popstate', handleRouteChange);
}

// ─── Navigation ───

/** Push a new path onto the history stack and trigger a route change */
export function navigate(path: string): void {
  const externalPath = toExternalPath(path);
  window.history.pushState(null, '', basePath + externalPath);
  handleRouteChange();
}

// ─── URL Building ───

/**
 * Build a human-readable URL from a RouteInfo object.
 *
 * URL patterns:
 *   /                              → Overview
 *   /~/{tag}                       → Tag page
 *   /~/{tag}/{method}/{apiPath}    → Endpoint
 *   /~/schemas/{name}              → Schema
 *   /~/webhooks/{name}             → Webhook
 *   /~/guides/{path}               → Guide
 *
 * Examples:
 *   /~/users                       → "Users" tag page
 *   /~/users/get/users/{id}        → GET /users/{id} in "Users" tag
 *   /~/pets/post/pets              → POST /pets in "Pets" tag
 *   /~/schemas/UserResponse        → Schema "UserResponse"
 */
export function buildPath(route: RouteInfo): string {
  const internal = buildInternalPath(route);
  return toExternalPath(internal);
}

function buildInternalPath(route: RouteInfo): string {
  switch (route.type) {
    case 'overview':
      return '/';

    case 'tag':
      return `/${slugifyTag(route.tag || '')}`;

    case 'endpoint': {
      const tag = route.tag || 'default';
      const method = (route.method || 'get').toLowerCase();
      const apiPath = route.path || '/';
      // apiPath starts with "/" so the result is: /{tagSlug}/{method}{apiPath}
      return `/${slugifyTag(tag)}/${method}${apiPath}`;
    }

    case 'schema':
      return route.schemaName ? `/schemas/${encodeURIComponent(route.schemaName)}` : '/schemas';

    case 'webhook':
      return route.webhookName ? `/webhooks/${encodeURIComponent(route.webhookName)}` : '/webhooks';

    case 'guide':
      return `/guides/${encodeURIComponent(route.guidePath || '')}`;

    default:
      return '/';
  }
}

// ─── URL Parsing ───

/**
 * Parse a raw URL path into a RouteInfo object.
 *
 * Handles URL-encoded segments, normalizes slashes,
 * and strips query strings / hash fragments.
 */
export function parsePath(rawPath: string): RouteInfo {
  const normalized = toInternalPath(rawPath);

  if (normalized === '/') return { type: 'overview' };

  // Split into segments (skip the leading empty segment from "/")
  const segments = normalized.slice(1).split('/');
  if (segments.length === 0) return { type: 'overview' };

  const first = safeDecode(segments[0]).toLowerCase();

  // Reserved prefix: /schemas or /schemas/{name...}
  if (first === 'schemas') {
    if (segments.length >= 2) {
      return { type: 'schema', schemaName: safeDecode(segments.slice(1).join('/')) };
    }
    return { type: 'schema' };
  }

  // Reserved prefix: /webhooks or /webhooks/{name...}
  if (first === 'webhooks') {
    if (segments.length >= 2) {
      return { type: 'webhook', webhookName: safeDecode(segments.slice(1).join('/')) };
    }
    return { type: 'webhook' };
  }

  // Reserved prefix: /guides/{path...}
  if (first === 'guides' && segments.length >= 2) {
    return {
      type: 'guide',
      guidePath: safeDecode(segments.slice(1).join('/')),
    };
  }

  // Single segment → tag page: /{tag}
  if (segments.length === 1) {
    return { type: 'tag', tag: safeDecode(segments[0]) };
  }

  // Second segment might be an HTTP method → endpoint: /{tag}/{method}/{path...}
  const second = segments[1].toLowerCase();

  if (HTTP_METHODS.has(second)) {
    const tag = safeDecode(segments[0]);
    const method = second;
    // Reconstruct the API path from remaining segments (decode each for browser compat)
    const apiPath = segments.length > 2
      ? '/' + segments.slice(2).map(safeDecode).join('/')
      : '/';
    return { type: 'endpoint', tag, method, path: apiPath };
  }

  // Fallback: treat first segment as a tag page
  return { type: 'tag', tag: safeDecode(segments[0]) };
}

// ─── Tag Slug Utility ───

/**
 * Convert a tag name to a URL-friendly slug.
 *
 * "User Management" → "user-management"
 * "Pets"            → "pets"
 * "auth/v2"         → "auth-v2"
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Private Helpers ───

/** Safely decode a URI component, returning the original on failure */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Read the current pathname, stripping the configured base path */
function getCurrentPath(): string {
  const path = window.location.pathname;
  const pathInBase = stripBasePath(path || '/');
  return toInternalPath(pathInBase, { requireMarker: true });
}

/** Called on popstate and after navigate() — parses the URL and updates the store */
function handleRouteChange(): void {
  const path = getCurrentPath();
  const route = parsePath(path);
  store.setRoute(route);
}

function normalizeBasePath(rawBase: string): string {
  const normalized = normalizePath(rawBase);
  if (normalized === '/') return '';
  return normalized;
}

function inferBasePath(): string {
  const path = normalizePath(window.location.pathname || '/');
  if (path === '/') return '';

  const markerIndex = getRouteMarkerIndex(path);
  if (markerIndex >= 0) {
    return path.slice(0, markerIndex) || '';
  }

  const segments = path.slice(1).split('/');
  const lastSegment = segments[segments.length - 1] || '';
  if (/\.[a-z0-9]+$/i.test(lastSegment)) {
    const lastSlash = path.lastIndexOf('/');
    if (lastSlash <= 0) return '';
    return path.slice(0, lastSlash);
  }

  return path;
}

function stripBasePath(path: string): string {
  if (!basePath) return path || '/';
  if (path === basePath || path === `${basePath}/`) return '/';
  if (path.startsWith(`${basePath}/`)) return path.slice(basePath.length) || '/';
  return path || '/';
}

function normalizePath(rawPath: string): string {
  const pathOnly = rawPath.split('?')[0]?.split('#')[0] || '/';
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  return withLeadingSlash.replace(/\/+/g, '/').replace(/\/+$/, '') || '/';
}

function hasRouteMarker(path: string): boolean {
  return getRouteMarkerIndex(path) >= 0;
}

function getRouteMarkerIndex(path: string): number {
  if (path === ROUTE_MARKER_PATH || path.startsWith(`${ROUTE_MARKER_PATH}/`)) return 0;

  const nested = path.indexOf(`${ROUTE_MARKER_PATH}/`);
  if (nested >= 0) return nested;

  if (path.endsWith(ROUTE_MARKER_PATH)) {
    return path.length - ROUTE_MARKER_PATH.length;
  }

  return -1;
}

function stripRouteMarker(path: string): string {
  if (!hasRouteMarker(path)) return path;
  const markerIndex = getRouteMarkerIndex(path);
  if (markerIndex < 0) return path;

  const suffix = path.slice(markerIndex + ROUTE_MARKER_PATH.length);
  return suffix || '/';
}

function toInternalPath(rawPath: string, options: { requireMarker?: boolean } = {}): string {
  const normalized = normalizePath(rawPath);
  if (normalized === '/') return '/';

  if (hasRouteMarker(normalized)) {
    return stripRouteMarker(normalized);
  }

  if (options.requireMarker) {
    return '/';
  }

  return normalized;
}

function toExternalPath(rawPath: string): string {
  const internal = toInternalPath(rawPath);
  if (internal === '/') return '/';
  return `${ROUTE_MARKER_PATH}${internal}`;
}
