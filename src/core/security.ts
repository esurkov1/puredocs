import type {
  OperationSecurityInfo,
  ResolvedSecuritySchemeRequirement,
  SecurityRequirement,
  SecurityScheme,
} from './types';

export interface OperationAuthResolved {
  headers: Record<string, string>;
  query: Record<string, string>;
  cookies: Record<string, string>;
  matchedSchemeNames: string[];
}

export function normalizeSecurityRequirements(raw: unknown): SecurityRequirement[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return [];
  const requirements: SecurityRequirement[] = [];
  for (const candidate of raw) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;
    const requirement: SecurityRequirement = {};
    for (const [schemeName, scopesRaw] of Object.entries(candidate as Record<string, unknown>)) {
      const scopes = Array.isArray(scopesRaw)
        ? scopesRaw.map((scope) => String(scope))
        : [];
      requirement[schemeName] = scopes;
    }
    requirements.push(requirement);
  }
  return requirements;
}

export function resolveOperationSecurityInfo(
  requirements: SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
  explicitlyNoAuth: boolean,
): OperationSecurityInfo {
  if (!requirements || requirements.length === 0) {
    return { explicitlyNoAuth, requirements: [] };
  }

  const resolved: ResolvedSecuritySchemeRequirement[][] = requirements.map((requirement) => (
    Object.entries(requirement).map(([schemeName, scopes]) => ({
      schemeName,
      scopes: Array.isArray(scopes) ? scopes : [],
      scheme: securitySchemes[schemeName],
    }))
  ));

  return { explicitlyNoAuth, requirements: resolved };
}

export function hasOperationAuth(info: OperationSecurityInfo | undefined): boolean {
  return Boolean(info && !info.explicitlyNoAuth && info.requirements.length > 0);
}

export function getSecuritySchemeBadge(scheme: SecurityScheme | undefined): string {
  if (!scheme) return 'Auth';
  if (scheme.type === 'http') {
    const s = (scheme.scheme || '').toLowerCase();
    if (s === 'bearer') return 'Bearer';
    if (s === 'basic') return 'Basic';
    return 'HTTP';
  }
  if (scheme.type === 'apiKey') return 'API Key';
  if (scheme.type === 'oauth2') return 'OAuth2';
  if (scheme.type === 'openIdConnect') return 'OpenID Connect';
  return scheme.type || 'Auth';
}

export function getOperationSecurityBadges(info: OperationSecurityInfo | undefined): string[] {
  if (!hasOperationAuth(info)) return [];
  const seen = new Set<string>();
  const badges: string[] = [];
  for (const requirement of info!.requirements) {
    for (const item of requirement) {
      const badge = getSecuritySchemeBadge(item.scheme);
      if (seen.has(badge)) continue;
      seen.add(badge);
      badges.push(badge);
    }
  }
  return badges;
}

export function formatOperationAuthBadge(info: OperationSecurityInfo | undefined): string | null {
  const badges = getOperationSecurityBadges(info);
  if (badges.length === 0) return null;
  if (badges.length === 1) return `${badges[0]} required`;
  return `${badges[0]} +${badges.length - 1} required`;
}

export function formatOperationAuthTitle(info: OperationSecurityInfo | undefined): string {
  if (!hasOperationAuth(info)) return 'Authentication not required';
  const groups = info!.requirements.map((requirement) => (
    requirement.map((item) => {
      const badge = getSecuritySchemeBadge(item.scheme);
      if (item.scopes.length > 0) return `${badge} [${item.scopes.join(', ')}]`;
      return badge;
    }).join(' + ')
  ));
  return `Requires authentication: ${groups.join(' OR ')}`;
}

export function resolveOperationAuth(
  info: OperationSecurityInfo | undefined,
  configuredSchemes: Record<string, string>,
  activeScheme: string,
  fallbackToken: string,
): OperationAuthResolved {
  const empty: OperationAuthResolved = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!hasOperationAuth(info)) return empty;

  for (const requirement of info!.requirements) {
    const allConfigured = requirement.every((item) => Boolean(configuredSchemes[item.schemeName]));
    if (!allConfigured && requirement.length > 0) continue;
    const resolved = materializeRequirement(requirement, configuredSchemes);
    if (Object.keys(resolved.headers).length > 0 || Object.keys(resolved.query).length > 0 || Object.keys(resolved.cookies).length > 0) {
      return resolved;
    }
  }

  if (!fallbackToken || !activeScheme) return empty;
  const fallbackItem: ResolvedSecuritySchemeRequirement = {
    schemeName: activeScheme,
    scopes: [],
  };
  const resolved = materializeRequirement([fallbackItem], { ...configuredSchemes, [activeScheme]: fallbackToken });
  return resolved;
}

export function getOperationAuthHeaderPlaceholders(info: OperationSecurityInfo | undefined): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!hasOperationAuth(info)) return headers;
  const firstRequirement = info!.requirements[0] || [];
  for (const item of firstRequirement) {
    const scheme = item.scheme;
    if (!scheme) continue;
    if (scheme.type === 'http') {
      const s = (scheme.scheme || '').toLowerCase();
      if (s === 'bearer') headers.Authorization = 'Bearer <token>';
      else if (s === 'basic') headers.Authorization = 'Basic <credentials>';
      else headers.Authorization = '<token>';
      continue;
    }
    if (scheme.type === 'apiKey' && scheme.in === 'header' && scheme.name) {
      headers[scheme.name] = `<${scheme.name}>`;
    }
  }
  return headers;
}

function materializeRequirement(
  requirement: ResolvedSecuritySchemeRequirement[],
  configuredSchemes: Record<string, string>,
): OperationAuthResolved {
  const result: OperationAuthResolved = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  for (const item of requirement) {
    const scheme = item.scheme;
    const value = configuredSchemes[item.schemeName];
    if (!scheme || !value) continue;
    result.matchedSchemeNames.push(item.schemeName);

    if (scheme.type === 'http') {
      const s = (scheme.scheme || '').toLowerCase();
      if (s === 'bearer') result.headers.Authorization = `Bearer ${value}`;
      else if (s === 'basic') result.headers.Authorization = `Basic ${value}`;
      else result.headers.Authorization = value;
      continue;
    }

    if (scheme.type === 'oauth2' || scheme.type === 'openIdConnect') {
      result.headers.Authorization = `Bearer ${value}`;
      continue;
    }

    if (scheme.type === 'apiKey' && scheme.name) {
      if (scheme.in === 'query') result.query[scheme.name] = value;
      else if (scheme.in === 'cookie') result.cookies[scheme.name] = value;
      else result.headers[scheme.name] = value;
    }
  }
  return result;
}
