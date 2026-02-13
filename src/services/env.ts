import type { PortalState } from '../core/types';

export function getActiveEnvironment(state: PortalState) {
  return state.environments.find((env) => env.name === state.activeEnvironment) || state.environments[0];
}

export function getBaseUrl(state: PortalState): string {
  const env = getActiveEnvironment(state);
  return env?.baseUrl || state.spec?.servers[0]?.url || window.location.origin;
}

export function normalizeBaseUrl(baseUrl: string): string {
  return String(baseUrl || '').replace(/\/$/, '');
}

export function formatBaseUrlForDisplay(baseUrl: string): string {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized.replace(/^https?:\/\//i, '');
}

export function getNormalizedBaseUrl(state: PortalState): string {
  return normalizeBaseUrl(getBaseUrl(state));
}

export function getDisplayBaseUrl(state: PortalState): string {
  return formatBaseUrlForDisplay(getBaseUrl(state));
}
