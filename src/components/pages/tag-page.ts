import { h, clear } from '../../lib/dom';
import { store } from '../../core/state';
import { navigate, buildPath, slugifyTag } from '../../core/router';
import { createSummaryLine } from '../shared/summary';
import { createBadge, createBreadcrumb, createCard, createSection, createLockIcon } from '../ui';
import { getDisplayBaseUrl } from '../../services/env';
import { isOperationAuthConfigured } from '../modals/auth-modal';
import { formatOperationAuthTitle, hasOperationAuth } from '../../core/security';
import type { SpecTag, RouteInfo } from '../../core/types';

/** Render a tag page — list of group operations */
export function renderTagPage(pageSlot: HTMLElement, _asideSlot: HTMLElement, tagName: string): void {
  clear(pageSlot);

  const spec = store.get().spec;
  if (!spec) return;

  // Find tag by exact match or by slug match
  const tagSlug = slugifyTag(tagName);
  const tag = spec.tags.find((t) => t.name === tagName)
    || spec.tags.find((t) => slugifyTag(t.name) === tagSlug);
  if (!tag || tag.operations.length === 0) {
    const header = h('div', { className: 'block header' });
    header.append(h('h1', { textContent: 'Tag not found' }));
    pageSlot.append(header);
    pageSlot.append(createSection(
      { title: 'Details' },
      h('p', { textContent: `No operations for tag "${tagName}"` }),
    ));
    return;
  }

  const header = h('div', { className: 'block header' });
  header.append(h('h1', { textContent: tag.name }));

  const state = store.get();
  const baseUrlDisplay = getDisplayBaseUrl(state);
  const breadcrumb = createBreadcrumb([
    {
      label: baseUrlDisplay || spec.info.title || 'Home',
      href: '/',
      className: 'breadcrumb-item',
      onClick: (e: Event) => { e.preventDefault(); navigate('/'); },
    },
    { label: tag.name, className: 'breadcrumb-current' },
  ], {
    className: 'breadcrumb-tag-page',
    leading: [createBadge({ text: 'Category', kind: 'chip', size: 'm', mono: true })],
  });
  const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap' });
  breadcrumbWrap.append(breadcrumb);
  header.append(breadcrumbWrap);

  if (tag.description) {
    header.append(h('p', { textContent: tag.description }));
  }

  pageSlot.append(header);

  const methods = getTagMethodBreakdown(tag);
  const authRequired = tag.operations.filter((op) => hasOperationAuth(op.resolvedSecurity)).length;
  const deprecatedCount = tag.operations.filter((op) => op.deprecated).length;

  pageSlot.append(createSection(
    { className: 'summary' },
    createSummaryLine(
      [
        { label: 'Endpoints', value: tag.operations.length },
        { label: 'Auth Required', value: authRequired },
        { label: 'Deprecated', value: deprecatedCount },
      ],
      methods,
    ),
  ));

  const opsSection = createSection({ title: 'Endpoints' });
  const currentRoute = store.get().route;

  for (const op of tag.operations) {
    const route: RouteInfo = {
      type: 'endpoint',
      tag: tag.name,
      method: op.method,
      path: op.path,
      operationId: op.operationId,
    };
    const isActive = currentRoute.type === 'endpoint'
      && (
        (currentRoute.operationId && currentRoute.operationId === op.operationId)
        || (currentRoute.method === op.method && currentRoute.path === op.path)
      );
    const card = createCard({
      interactive: true,
      active: isActive,
      className: `card-group${op.deprecated ? ' deprecated' : ''}`,
      onClick: () => navigate(buildPath(route)),
    });

    const info = h('div', { className: 'card-info' });
    info.append(h('h3', {}, h('code', { textContent: op.path })));
    if (op.summary || op.operationId) {
      info.append(h('p', { textContent: op.summary || op.operationId }));
    }

    const badges = h('div', { className: 'card-badges' });
    badges.append(createBadge({ text: op.method.toUpperCase(), kind: 'method', method: op.method, size: 'm', mono: true }));
    if (hasOperationAuth(op.resolvedSecurity)) {
      badges.append(createLockIcon({
        configured: isOperationAuthConfigured(op.resolvedSecurity, spec.securitySchemes || {}),
        variant: 'tag',
        title: formatOperationAuthTitle(op.resolvedSecurity),
      }));
    }

    card.append(info, badges);
    opsSection.append(card);
  }

  pageSlot.append(opsSection);

}

function getTagMethodBreakdown(tag: SpecTag): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const op of tag.operations) {
    counts[op.method] = (counts[op.method] || 0) + 1;
  }
  return counts;
}
