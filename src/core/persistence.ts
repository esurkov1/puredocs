/**
 * Persist portal state (env, baseUrl, auth) to localStorage
 * so values survive page refresh.
 */

import type { PortalEnvironment, AuthState } from './types';

const STORAGE_KEY = 'ap_portal_prefs';

export interface PersistedState {
  activeEnvironment: string;
  environments: PortalEnvironment[];
  auth: AuthState;
}

export function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedState;
    if (!data || typeof data !== 'object') return null;
    return {
      activeEnvironment: typeof data.activeEnvironment === 'string' ? data.activeEnvironment : '',
      environments: Array.isArray(data.environments) ? data.environments : [],
      auth: data.auth && typeof data.auth === 'object'
        ? {
            schemes: data.auth.schemes && typeof data.auth.schemes === 'object' ? data.auth.schemes : {},
            activeScheme: typeof data.auth.activeScheme === 'string' ? data.auth.activeScheme : '',
            token: typeof data.auth.token === 'string' ? data.auth.token : '',
            locked: Boolean(data.auth.locked),
            source: data.auth.source === 'manual' || data.auth.source === 'auto-body' || data.auth.source === 'auto-header'
              ? data.auth.source
              : 'manual',
          }
        : { schemes: {}, activeScheme: '', token: '', locked: false, source: 'manual' },
    };
  } catch {
    return null;
  }
}

export function savePersisted(data: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
}
