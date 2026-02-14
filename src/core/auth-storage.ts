import type { AuthState, SecurityScheme } from './types';

function getSchemePriority(scheme: SecurityScheme): number {
  if (scheme.type === 'http') {
    const httpScheme = (scheme.scheme || '').toLowerCase();
    if (httpScheme === 'bearer') return 0;
    if (httpScheme === 'basic') return 3;
    return 4;
  }
  if (scheme.type === 'oauth2' || scheme.type === 'openIdConnect') return 1;
  if (scheme.type === 'apiKey') return 2;
  return 5;
}

function getPreferredSchemeName(securitySchemes: Record<string, SecurityScheme>): string {
  const names = Object.keys(securitySchemes);
  if (names.length === 0) return '';

  let bestName = names[0];
  let bestPriority = getSchemePriority(securitySchemes[bestName]);
  for (let i = 1; i < names.length; i++) {
    const name = names[i];
    const priority = getSchemePriority(securitySchemes[name]);
    if (priority < bestPriority) {
      bestPriority = priority;
      bestName = name;
    }
  }
  return bestName;
}

export function areAuthStatesEqual(a: AuthState, b: AuthState): boolean {
  if (a.activeScheme !== b.activeScheme) return false;
  if (a.token !== b.token) return false;
  if (a.locked !== b.locked) return false;
  if (a.source !== b.source) return false;

  const aEntries = Object.entries(a.schemes);
  const bEntries = Object.entries(b.schemes);
  if (aEntries.length !== bEntries.length) return false;
  for (const [key, value] of aEntries) {
    if (b.schemes[key] !== value) return false;
  }
  return true;
}

export function reconcileAuthWithSecuritySchemes(
  auth: AuthState,
  securitySchemes: Record<string, SecurityScheme>,
): AuthState {
  const availableSchemeNames = Object.keys(securitySchemes);
  if (availableSchemeNames.length === 0) {
    return { ...auth, schemes: { ...auth.schemes } };
  }

  const schemes: Record<string, string> = {};
  for (const name of availableSchemeNames) {
    const value = auth.schemes[name];
    if (typeof value === 'string' && value.length > 0) {
      schemes[name] = value;
    }
  }

  let activeScheme = auth.activeScheme;
  if (!activeScheme || !securitySchemes[activeScheme]) {
    activeScheme = availableSchemeNames.find((name) => Boolean(schemes[name])) || '';
  }

  if (!activeScheme && auth.token) {
    activeScheme = getPreferredSchemeName(securitySchemes);
  }

  if (activeScheme && auth.token && !schemes[activeScheme]) {
    schemes[activeScheme] = auth.token;
  }

  let token = auth.token;
  if (activeScheme && schemes[activeScheme] && token !== schemes[activeScheme]) {
    token = schemes[activeScheme];
  }
  if (!token && activeScheme && schemes[activeScheme]) {
    token = schemes[activeScheme];
  }

  return {
    ...auth,
    schemes,
    activeScheme,
    token,
  };
}
