import type { ParsedSpec, SearchEntry } from './types';
import { formatOperationAuthBadge, formatOperationAuthTitle, hasOperationAuth } from './security';

let index: SearchEntry[] = [];
const searchTypePriority: Record<SearchEntry['type'], number> = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3,
};

/** Build search index from parsed spec */
export function buildSearchIndex(spec: ParsedSpec): void {
  index = [];

  // Index tags
  for (const tag of spec.tags) {
    index.push({
      type: 'tag',
      title: tag.name,
      subtitle: tag.description,
      tag: tag.name,
      keywords: `${tag.name} ${tag.description || ''}`.toLowerCase(),
    });
  }

  // Index operations
  for (const op of spec.operations) {
    index.push({
      type: 'operation',
      title: op.summary || op.operationId,
      subtitle: op.path,
      method: op.method,
      requiresAuth: hasOperationAuth(op.resolvedSecurity),
      authBadge: formatOperationAuthBadge(op.resolvedSecurity) || undefined,
      authTitle: hasOperationAuth(op.resolvedSecurity) ? formatOperationAuthTitle(op.resolvedSecurity) : undefined,
      resolvedSecurity: op.resolvedSecurity,
      path: op.path,
      tag: op.tags[0],
      operationId: op.operationId,
      keywords: `${op.method} ${op.path} ${op.summary || ''} ${op.description || ''} ${op.operationId} ${op.tags.join(' ')}`.toLowerCase(),
    });
  }

  // Index schemas
  for (const [name, schema] of Object.entries(spec.schemas)) {
    index.push({
      type: 'schema',
      title: name,
      subtitle: (schema.description as string) || 'Schema',
      schemaName: name,
      keywords: `${name} ${(schema.description as string) || ''} schema model`.toLowerCase(),
    });
  }

  // Index webhooks
  if (spec.webhooks) {
    for (const wh of spec.webhooks) {
      index.push({
        type: 'webhook',
        title: wh.summary || wh.name,
        subtitle: `${wh.method.toUpperCase()} Webhook`,
        method: wh.method,
        webhookName: wh.name,
        keywords: `${wh.name} ${wh.method} ${wh.summary || ''} ${wh.description || ''} webhook`.toLowerCase(),
      });
    }
  }
}

/** Search the index with a query string */
export function search(query: string, limit = 20): SearchEntry[] {
  if (!query.trim()) return [];

  const terms = query.toLowerCase().trim().split(/\s+/);
  const scored: Array<{ entry: SearchEntry; score: number }> = [];

  for (const entry of index) {
    let score = 0;
    let allMatch = true;

    for (const term of terms) {
      if (entry.keywords.includes(term)) {
        score += 1;
        // Bonus for title match
        if (entry.title.toLowerCase().includes(term)) score += 3;
        // Bonus for exact path match
        if (entry.path?.toLowerCase().includes(term)) score += 2;
        // Bonus for method match
        if (entry.method?.toLowerCase() === term) score += 2;
      } else {
        allMatch = false;
      }
    }

    if (allMatch && score > 0) {
      scored.push({ entry, score });
    }
  }

  return scored
    .sort((a, b) => {
      const pa = searchTypePriority[a.entry.type] ?? 99;
      const pb = searchTypePriority[b.entry.type] ?? 99;
      if (pa !== pb) return pa - pb;
      if (b.score !== a.score) return b.score - a.score;
      return a.entry.title.localeCompare(b.entry.title);
    })
    .slice(0, limit)
    .map((s) => s.entry);
}

