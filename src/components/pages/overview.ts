import { h, clear, markdownBlock } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { useEffects } from '../../core/effects';
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

  const header = h('div', { className: 'block header' });
  const titleWrap = h('div', { className: 'title' });
  titleWrap.append(
    h('h1', { textContent: spec.info.title }),
    h('span', { className: 'version', textContent: `v${spec.info.version}` }),
  );
  header.append(titleWrap);

  if (spec.info.description) {
    header.append(markdownBlock(spec.info.description));
  }

  pageSlot.append(header);

  const authRequiredCount = spec.operations.filter((op) => hasOperationAuth(op.resolvedSecurity)).length;
  const deprecatedCount = spec.operations.filter((op) => op.deprecated).length;
  const methods = getMethodBreakdownFromOperations(spec.operations);

  pageSlot.append(createSection(
    { className: 'summary' },
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

  if (spec.servers.length > 0) {
    const serversSection = createSection({ title: 'Servers' });

    const curState = store.get();
    const initialEnvs = curState.initialEnvironments || curState.environments;
    const serverCards: { el: HTMLElement; envName: string }[] = [];

    for (const server of spec.servers) {
      const env = initialEnvs.find((e) => e.baseUrl === server.url);
      const envName = env?.name || '';
      const isActive = envName === curState.activeEnvironment;
      const item = createCard({
        interactive: true,
        active: isActive,
        className: 'card-group',
        onClick: () => {
          // Dynamic lookup: always resolve from current store state
          const st = store.get();
          const envs = st.initialEnvironments || st.environments;
          const target = envs.find((e) => e.baseUrl === server.url);
          if (target && target.name !== st.activeEnvironment) {
            store.setActiveEnvironment(target.name);
          }
        },
      });
      const info = h('div', { className: 'card-info' });
      const nameWrap = h('div', { className: 'inline-cluster inline-cluster-sm' });
      const iconEl = h('span', { className: 'icon-muted' });
      iconEl.innerHTML = icons.server;
      nameWrap.append(iconEl, h('code', { textContent: server.url }));
      info.append(nameWrap);
      if (server.description) {
        info.append(markdownBlock(server.description));
      }
      const badges = h('div', { className: 'card-badges' });
      item.append(info, badges);
      serversSection.append(item);
      serverCards.push({ el: item, envName });
    }

    // Reactive: update active server card when environment changes
    const updateServerCards = (state: { activeEnvironment: string }) => {
      for (const { el, envName } of serverCards) {
        el.classList.toggle('active', envName === state.activeEnvironment);
      }
    };

    useEffects().on('overview:servers', updateServerCards);

    pageSlot.append(serversSection);
  }

  const portalRoot = (pageSlot.closest('.root') as HTMLElement | null) ?? undefined;
  const connectionSections = createConnectionSettingsSections(spec.securitySchemes || {}, portalRoot);
  for (const section of connectionSections) {
    pageSlot.append(section);
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
        className: 'card-group',
        onClick: () => navigate(buildPath({ type: 'webhook', webhookName: wh.name })),
      });

      const badges = h('div', { className: 'card-badges' });
      badges.append(
        createBadge({ text: 'WH', kind: 'webhook', size: 's', mono: true }),
        createBadge({ text: wh.method.toUpperCase(), kind: 'method', method: wh.method, size: 's', mono: true }),
      );
      const top = h('div', { className: 'card-group-top' });
      top.append(h('h3', { className: 'card-group-title', textContent: wh.summary || wh.name }), badges);
      const desc = markdownBlock(wh.description || `${wh.method.toUpperCase()} webhook`, 'card-group-description md-content');
      card.append(top, desc);
      webhooksSection.append(card);
    }

    pageSlot.append(webhooksSection);
  }

}

function createTagCard(tag: SpecTag): HTMLElement {
  const card = createCard({
    interactive: true,
    className: 'card-group',
    onClick: () => navigate(buildPath({ type: 'tag', tag: tag.name })),
  });

  const methodBreakdown = getMethodBreakdown(tag);
  const badges = h('div', { className: 'card-badges' });
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

  const top = h('div', { className: 'card-group-top' });
  top.append(h('h3', { className: 'card-group-title', textContent: tag.name }), badges);
  const desc = markdownBlock(tag.description || `${tag.operations.length} endpoints`, 'card-group-description md-content');

  card.append(top, desc);

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
