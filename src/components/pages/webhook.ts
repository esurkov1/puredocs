import { h, clear, markdownBlock } from '../../lib/dom';
import { navigate } from '../../core/router';
import { store } from '../../core/state';
import { useEffects } from '../../core/effects';
import { getDisplayBaseUrl } from '../../services/env';
import { renderSchemaViewer, renderParametersCard } from '../shared/schema-viewer';
import {
  createSchemaBodyContent, createBodyCategoryTrailing, createCollapsibleCategory,
  renderResponseHeadersList, renderResponseCategories,
  type ResponseTabData,
} from '../shared/responses';
import { createBadge, createSection, createSectionTitleWrap, createBreadcrumb, createCard, createCardHeader, createCardBody, createResponseCodeTab, setResponseCodeTabActive } from '../ui';
import { createCopyButton } from '../shared/copy-button';
import { renderRouteNavigation } from '../nav/route-nav';
import type { SpecWebhook } from '../../core/types';

/** Render a webhook detail page — similar to endpoint but marked as Webhook, no Try It */
export async function renderWebhookPage(pageSlot: HTMLElement, webhook: SpecWebhook): Promise<void> {
  clear(pageSlot);

  // Breadcrumb
  const webhookBadge = createBadge({
    text: 'WEBHOOK',
    kind: 'webhook',
    size: 'm',
    mono: true,
  });
  const methodBadge = createBadge({
    text: webhook.method.toUpperCase(),
    kind: 'method',
    method: webhook.method,
    mono: true,
    size: 'm',
  });
  const state = store.get();
  const baseUrlDisplay = getDisplayBaseUrl(state);
  const copyBtn = createCopyButton({
    ariaLabel: 'Copy webhook name',
    copiedAriaLabel: 'Copied',
    className: 'breadcrumb-copy',
    getText: () => `${webhook.method.toUpperCase()} ${webhook.name}`,
  });
  const breadcrumb = createBreadcrumb(
    [
      {
        label: baseUrlDisplay || state.spec?.info.title || 'Home',
        href: '/',
        className: 'breadcrumb-item',
        onClick: (e: Event) => { e.preventDefault(); navigate('/'); },
      },
      { label: webhook.name, className: 'breadcrumb-current' },
    ],
    { leading: [webhookBadge, methodBadge], trailing: [copyBtn] },
  );

  // Header
  const header = h('div', { className: 'block header' });
  if (webhook.summary) {
    header.append(h('h1', { textContent: webhook.summary }));
  } else {
    header.append(h('h1', { textContent: webhook.name }));
  }

  const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap endpoint-breadcrumb' });
  breadcrumbWrap.append(breadcrumb);
  header.append(breadcrumbWrap);

  if (webhook.description) {
    header.append(markdownBlock(webhook.description));
  }

  pageSlot.append(header);

  // Parameters
  const visibleParams = webhook.parameters.filter((p) => p.in !== 'cookie');
  if (visibleParams.length > 0) {
    const paramSection = createSection({ title: 'Parameters' }, renderParamsTable(visibleParams));
    pageSlot.append(paramSection);
  }

  // Request Body (what the webhook sends)
  if (webhook.requestBody) {
    const bodySection = createSection({
      titleEl: createSectionTitleWrap('Request'),
    });

    const contentEntries = Object.entries(webhook.requestBody.content || {});
    if (contentEntries.length > 0) {
      const card = createCard();
      const cardBody = createCardBody('no-padding');
      const categories = h('div', { className: 'collapsible-categories' });

      const wrapper = h('div', { className: 'request-body-wrap' });
      if (webhook.requestBody.description) {
        wrapper.append(markdownBlock(webhook.requestBody.description));
      }

      const schemas = contentEntries.map(([ct, mt]) => createSchemaBodyContent(ct, mt, 'No schema'));
      if (schemas.length === 1) {
        const body = schemas[0];
        wrapper.append(body.content);
        const bodyCategory = createCollapsibleCategory({
          title: 'Body',
          content: wrapper,
          trailing: createBodyCategoryTrailing(body),
          counter: body.itemsCount,
        });
        categories.append(bodyCategory.root);
      } else {
        const mediaList = h('div', { className: 'schema-media-list' });
        for (const body of schemas) {
          const mediaHeader = h('div', { className: 'schema-media-header' });
          mediaHeader.append(
            createBadge({ text: body.contentType, kind: 'chip', size: 's', mono: true }),
            createBadge({ text: body.schemaType, kind: 'chip', color: 'primary', size: 's', mono: true }),
          );
          const item = h('div', { className: 'schema-media-item' });
          item.append(mediaHeader, body.content);
          mediaList.append(item);
        }
        wrapper.append(mediaList);
        const bodyCategory = createCollapsibleCategory({
          title: 'Body',
          content: wrapper,
          counter: schemas.length,
        });
        categories.append(bodyCategory.root);
      }

      cardBody.append(categories);
      card.append(cardBody);
      bodySection.append(card);
    }

    pageSlot.append(bodySection);
  }

  // Responses (expected responses from the webhook consumer)
  const responses = Object.entries(webhook.responses);
  if (responses.length > 0) {
    const respSection = createSection({
      titleEl: createSectionTitleWrap('Expected Responses'),
    });

    const card = createCard();
    const headerRow = h('div', { className: 'card-row responses-header-row' });
    const codesWrap = h('div', { className: 'tabs-code codes' });
    let activeCode = responses[0][0];
    const tabData = new Map<string, ResponseTabData>();

    for (const [code, response] of responses) {
      const tabBtn = createResponseCodeTab(code, code === activeCode);

      const firstContentType = response.content ? Object.keys(response.content)[0] || 'application/json' : 'application/json';
      const mediaType = response.content?.[firstContentType];
      const bodyBlock = createSchemaBodyContent(firstContentType, mediaType, response.description || 'No schema');
      const headersEl = response.headers ? renderResponseHeadersList(response.headers) : null;

      tabData.set(code, {
        body: bodyBlock,
        headers: headersEl,
        headersCount: response.headers ? Object.keys(response.headers).length : 0,
      });
      codesWrap.append(tabBtn);

      tabBtn.addEventListener('click', () => {
        codesWrap.querySelectorAll('[data-badge-group="response-code"]').forEach((t) => setResponseCodeTabActive(t as HTMLElement, false));
        setResponseCodeTabActive(tabBtn, true);
        activeCode = code;
        const data = tabData.get(code)!;
        contentContainer.innerHTML = '';
        contentContainer.append(renderResponseCategories(data));
      });
    }

    headerRow.append(codesWrap);
    card.append(createCardHeader(headerRow));

    const bodyWrapper = createCardBody('no-padding');
    const contentContainer = h('div');
    const initialData = tabData.get(activeCode);
    if (initialData) {
      contentContainer.append(renderResponseCategories(initialData));
    }

    bodyWrapper.append(contentContainer);
    card.append(bodyWrapper);
    respSection.append(card);

    pageSlot.append(respSection);
  }

  const routeNav = renderRouteNavigation({ type: 'webhook', webhookName: webhook.name });
  if (routeNav) {
    pageSlot.append(h('div', { className: 'block section' }, routeNav));
  }

  // Reactive: update breadcrumb base URL when environment changes
  const breadcrumbHomeEl = breadcrumb.querySelector('.breadcrumb-item') as HTMLAnchorElement | null;
  if (breadcrumbHomeEl) {
    useEffects().on('webhook:breadcrumb', (st) => {
      breadcrumbHomeEl.textContent = getDisplayBaseUrl(st) || st.spec?.info.title || 'Home';
    });
  }
}

function renderParamsTable(params: SpecWebhook['parameters']): HTMLElement {
  const pathCount = params.filter((p) => p.in === 'path').length;
  const queryCount = params.filter((p) => p.in === 'query').length;
  const headerTitle =
    pathCount > 0 && queryCount > 0 ? 'Parameters' : pathCount > 0 ? 'Path' : 'Query';
  return renderParametersCard(params, { headerTitle, withEnumAndDefault: false });
}
