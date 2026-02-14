import { h } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { buildPath, navigate } from '../../core/router';
import { store } from '../../core/state';
import { createBadge } from '../ui';
import type { RouteInfo, SpecOperation, SpecWebhook } from '../../core/types';

type LinearRoute =
  | {
      kind: 'endpoint';
      route: RouteInfo;
      operation: SpecOperation;
      title: string;
      category: string;
    }
  | {
      kind: 'webhook';
      route: RouteInfo;
      webhook: SpecWebhook;
      title: string;
      category: string;
    };

export function renderRouteNavigation(currentRoute: RouteInfo): HTMLElement | null {
  const { prev, next } = getAdjacentRoutes(currentRoute);
  if (!prev && !next) return null;

  const wrapper = h('div', {
    className: `route-nav${!prev || !next ? ' is-single' : ''}`,
  });

  if (prev) {
    wrapper.append(createRouteCard(prev, 'previous'));
  }

  if (next) {
    wrapper.append(createRouteCard(next, 'next'));
  }

  return wrapper;
}

function createRouteCard(
  entry: LinearRoute,
  direction: 'previous' | 'next',
): HTMLAnchorElement {
  const routePath = buildPath(entry.route);
  const card = h('a', {
    className: `card interactive route-card ${direction === 'previous' ? 'is-prev' : 'is-next'}`,
    href: routePath,
  }) as HTMLAnchorElement;

  const meta = h('div', { className: 'route-meta' });
  if (entry.kind === 'endpoint') {
    meta.append(createBadge({
      text: entry.operation.method.toUpperCase(),
      kind: 'method',
      method: entry.operation.method,
      mono: true,
    }));
    meta.append(h('span', { className: 'route-path', textContent: entry.operation.path }));
  } else {
    meta.append(createBadge({
      text: 'WEBHOOK',
      kind: 'webhook',
      size: 's',
      mono: true,
    }));
    meta.append(createBadge({
      text: entry.webhook.method.toUpperCase(),
      kind: 'method',
      method: entry.webhook.method,
      mono: true,
    }));
  }

  const side = h('span', { className: 'route-side', 'aria-hidden': 'true' });
  side.innerHTML = direction === 'previous' ? icons.chevronLeft : icons.chevronRight;

  const main = h('div', { className: 'route-main' });
  main.append(
    h('span', { className: 'route-category', textContent: entry.category }),
    h('span', { className: 'route-title', textContent: entry.title }),
    meta,
  );

  if (direction === 'previous') {
    card.append(side, main);
  } else {
    card.append(main, side);
  }

  card.addEventListener('click', (event: Event) => {
    event.preventDefault();
    navigate(routePath);
  });

  return card;
}

function getAdjacentRoutes(currentRoute: RouteInfo): { prev: LinearRoute | null; next: LinearRoute | null } {
  const spec = store.get().spec;
  if (!spec) return { prev: null, next: null };

  const linear = buildLinearRoutes();
  if (linear.length === 0) return { prev: null, next: null };

  const index = findCurrentIndex(linear, currentRoute);
  if (index < 0) return { prev: null, next: null };

  return {
    prev: index > 0 ? linear[index - 1] : null,
    next: index < linear.length - 1 ? linear[index + 1] : null,
  };
}

function buildLinearRoutes(): LinearRoute[] {
  const spec = store.get().spec;
  if (!spec) return [];

  const result: LinearRoute[] = [];
  const seenEndpoints = new Set<string>();

  for (const tag of spec.tags) {
    for (const operation of tag.operations) {
      const endpointKey = `${operation.method.toLowerCase()} ${operation.path}`;
      if (seenEndpoints.has(endpointKey)) continue;
      seenEndpoints.add(endpointKey);
      result.push({
        kind: 'endpoint',
        route: {
          type: 'endpoint',
          tag: tag.name,
          method: operation.method,
          path: operation.path,
          operationId: operation.operationId,
        },
        operation,
        title: operation.summary || operation.path,
        category: tag.name,
      });
    }
  }

  for (const webhook of spec.webhooks || []) {
    result.push({
      kind: 'webhook',
      route: { type: 'webhook', webhookName: webhook.name },
      webhook,
      title: webhook.summary || webhook.name,
      category: 'Webhooks',
    });
  }

  return result;
}

function findCurrentIndex(list: LinearRoute[], currentRoute: RouteInfo): number {
  if (currentRoute.type === 'endpoint') {
    if (currentRoute.operationId) {
      const byOperationId = list.findIndex(
        (entry) => entry.kind === 'endpoint' && entry.route.operationId === currentRoute.operationId,
      );
      if (byOperationId >= 0) return byOperationId;
    }

    return list.findIndex(
      (entry) => entry.kind === 'endpoint'
        && entry.route.method === currentRoute.method
        && entry.route.path === currentRoute.path,
    );
  }

  if (currentRoute.type === 'webhook') {
    return list.findIndex(
      (entry) => entry.kind === 'webhook' && entry.route.webhookName === currentRoute.webhookName,
    );
  }

  return -1;
}
