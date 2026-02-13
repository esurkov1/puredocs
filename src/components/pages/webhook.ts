import { h, clear } from '../../lib/dom';
import { navigate } from '../../core/router';
import { renderSchemaViewer, renderParametersCard } from '../shared/schema-viewer';
import { createBadge, createSection, createBreadcrumb, createCardHeaderRow } from '../ui';
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
  const breadcrumb = createBreadcrumb(
    [
      {
        label: 'Overview',
        href: '/',
        className: 'breadcrumb-item',
        onClick: (e: Event) => { e.preventDefault(); navigate('/'); },
      },
      { label: webhook.name, className: 'breadcrumb-segment' },
    ],
    { leading: [webhookBadge, methodBadge] },
  );

  // Header
  const header = h('div', { className: 'header' });
  if (webhook.summary) {
    header.append(h('h1', { textContent: webhook.summary }));
  } else {
    header.append(h('h1', { textContent: webhook.name }));
  }

  const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap' });
  breadcrumbWrap.append(breadcrumb);
  header.append(breadcrumbWrap);

  if (webhook.description) {
    header.append(h('p', { textContent: webhook.description }));
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
    const bodySection = createSection({ title: 'Webhook Payload' });

    if (webhook.requestBody.description) {
      bodySection.append(h('p', { textContent: webhook.requestBody.description }));
    }

    const content = webhook.requestBody.content || {};
    for (const [contentType, mediaType] of Object.entries(content)) {
      if (mediaType.schema) {
        const headerContent = createCardHeaderRow({ title: 'Body' });
        headerContent.append(createBadge({
          text: contentType,
          kind: 'chip',
          size: 's',
          mono: true,
        }));
        bodySection.append(renderSchemaViewer(mediaType.schema, headerContent));
      }
    }

    pageSlot.append(bodySection);
  }

  // Responses (expected responses from the webhook consumer)
  if (Object.keys(webhook.responses).length > 0) {
    const respSection = createSection({ title: 'Expected Responses' });

    for (const [code, response] of Object.entries(webhook.responses)) {
      const respBlock = h('div', { className: 'response-block' });
      respBlock.append(createBadge({
        text: code,
        kind: 'status',
        statusCode: code,
        mono: true,
      }));
      if (response.description) {
        respBlock.append(h('p', { textContent: response.description }));
      }

      if (response.content) {
        for (const [ct, mediaType] of Object.entries(response.content)) {
          if (mediaType.schema) {
            respBlock.append(renderSchemaViewer(mediaType.schema, `${ct} — Schema`));
          }
        }
      }

      respSection.append(respBlock);
    }

    pageSlot.append(respSection);
  }

  const routeNav = renderRouteNavigation({ type: 'webhook', webhookName: webhook.name });
  if (routeNav) {
    pageSlot.append(h('div', { className: 'section' }, routeNav));
  }
}

function renderParamsTable(params: SpecWebhook['parameters']): HTMLElement {
  const pathCount = params.filter((p) => p.in === 'path').length;
  const queryCount = params.filter((p) => p.in === 'query').length;
  const headerTitle =
    pathCount > 0 && queryCount > 0 ? 'Parameters' : pathCount > 0 ? 'Path' : 'Query';
  return renderParametersCard(params, { headerTitle, withEnumAndDefault: false });
}
