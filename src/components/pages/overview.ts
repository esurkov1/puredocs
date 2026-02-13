import { h, clear } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { navigate, buildPath } from '../../core/router';
import { createSummaryLine } from '../shared/summary';
import { createConnectionSettingsSections } from '../shared/connection-settings';
import { createBadge, createCard, createSection } from '../ui';
import { hasOperationAuth } from '../../core/security';
import type { SpecTag } from '../../core/types';

/** Render the API overview page */
export async function renderOverview(pageSlot: HTMLElement, _asideSlot: HTMLElement): Promise<void> {
  clear(pageSlot);

  const spec = store.get().spec;
  if (!spec) return;

  const header = h('div', { className: 'header' });
  const titleWrap = h('div', { className: 'overview-title-wrap' });
  titleWrap.append(
    h('h1', { textContent: spec.info.title }),
    h('span', { className: 'version', textContent: `v${spec.info.version}` }),
  );
  header.append(titleWrap);

  if (spec.info.description) {
    header.append(h('p', { textContent: spec.info.description }));
  }

  pageSlot.append(header);

  const authRequiredCount = spec.operations.filter((op) => hasOperationAuth(op.resolvedSecurity)).length;
  const deprecatedCount = spec.operations.filter((op) => op.deprecated).length;
  const methods = getMethodBreakdownFromOperations(spec.operations);

  pageSlot.append(createSection(
    { className: 'summary-section' },
    createSummaryLine(
      [
        { label: 'Endpoints', value: spec.operations.length },
        { label: 'Auth Required', value: authRequiredCount },
        { label: 'Deprecated', value: deprecatedCount },
      ],
      methods,
      'No operations',
    ),
  ));

  const portalRoot = (pageSlot.closest('.root') as HTMLElement | null) ?? undefined;
  const connectionSections = createConnectionSettingsSections(spec.securitySchemes || {}, portalRoot);
  for (const section of connectionSections) {
    pageSlot.append(section);
  }

  if (spec.servers.length > 0) {
    const serversSection = createSection({ title: 'Servers' });

    const curState = store.get();
    const initialEnvs = curState.initialEnvironments || curState.environments;
    for (const server of spec.servers) {
      const env = initialEnvs.find((e) => e.baseUrl === server.url);
      const isActive = env?.name === curState.activeEnvironment;
      const item = createCard({
        interactive: true,
        active: isActive,
        className: 'tag-group-card',
        onClick: () => {
          if (env) store.setActiveEnvironment(env.name);
        },
      });
      item.title = 'Click to set as active environment';
      const info = h('div', { className: 'tag-card-info' });
      const nameWrap = h('div', { className: 'inline-cluster inline-cluster-sm' });
      const iconEl = h('span', { className: 'icon-muted' });
      iconEl.innerHTML = icons.server;
      nameWrap.append(iconEl, h('code', { textContent: server.url }));
      info.append(nameWrap);
      if (server.description) {
        info.append(h('p', { textContent: server.description }));
      }
      const badges = h('div', { className: 'tag-card-badges' });
      item.append(info, badges);
      serversSection.append(item);
    }

    pageSlot.append(serversSection);
  }

  if (spec.tags.length > 0) {
    const tagsSection = createSection({ title: 'API Groups' });

    for (const tag of spec.tags) {
      if (tag.operations.length === 0) continue;
      tagsSection.append(createTagCard(tag));
    }

    pageSlot.append(tagsSection);
  }

  if (spec.webhooks && spec.webhooks.length > 0) {
    const webhooksSection = createSection({ title: 'Webhooks' });

    for (const wh of spec.webhooks) {
      const card = createCard({
        interactive: true,
        className: 'tag-group-card',
        onClick: () => navigate(buildPath({ type: 'webhook', webhookName: wh.name })),
      });
      const info = h('div', { className: 'tag-card-info' });
      info.append(
        h('h3', { textContent: wh.summary || wh.name }),
        wh.description
          ? h('p', { textContent: wh.description })
          : h('p', { textContent: `${wh.method.toUpperCase()} webhook` }),
      );
      const badges = h('div', { className: 'tag-card-badges' });
      badges.append(
        createBadge({ text: 'WH', kind: 'webhook', size: 's', mono: true }),
        createBadge({ text: wh.method.toUpperCase(), kind: 'method', method: wh.method, size: 's', mono: true }),
      );
      card.append(info, badges);
      webhooksSection.append(card);
    }

    pageSlot.append(webhooksSection);
  }

}

function createTagCard(tag: SpecTag): HTMLElement {
  const card = createCard({
    interactive: true,
    className: 'tag-group-card',
    onClick: () => navigate(buildPath({ type: 'tag', tag: tag.name })),
  });

  const info = h('div', { className: 'tag-card-info' });
  info.append(
    h('h3', { textContent: tag.name }),
    h('p', { textContent: tag.description || `${tag.operations.length} endpoints` }),
  );

  const methodBreakdown = getMethodBreakdown(tag);
  const badges = h('div', { className: 'tag-card-badges' });
  for (const [method, count] of Object.entries(methodBreakdown)) {
    const badge = createBadge({
      text: method.toUpperCase(),
      kind: 'method',
      method,
      size: 'm',
      mono: true,
    });
    badge.textContent = `${count} ${method.toUpperCase()}`;
    badges.append(badge);
  }

  card.append(info, badges);

  return card;
}

function getMethodBreakdownFromOperations(operations: { method: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const op of operations) {
    counts[op.method] = (counts[op.method] || 0) + 1;
  }
  return counts;
}

function getMethodBreakdown(tag: SpecTag): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const op of tag.operations) {
    counts[op.method] = (counts[op.method] || 0) + 1;
  }
  return counts;
}
