import { h, clear } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { navigate, buildPath } from '../../core/router';
import { renderSchemaViewer, renderSchemaBody, renderParametersCard } from '../shared/schema-viewer';
import { renderTryIt, type InitialResponseExample } from '../shared/try-it';
import { extractExamples } from '../shared/example-picker';
import { resolveAuthHeaders, getAuthHeaderPlaceholder } from '../modals/auth-modal';
import { getDisplayBaseUrl, getNormalizedBaseUrl } from '../../services/env';
import { formatOperationAuthBadge, formatOperationAuthTitle, hasOperationAuth } from '../../core/security';
import { createCopyButton } from '../shared/copy-button';
import { createBadge, createButton, createSection, createBreadcrumb, createSectionTitleWrap, createCard, createCardHeader, createCardBody, createCardHeaderRow, createResponseCodeTab, createLockIcon, setResponseCodeTabActive } from '../ui';
import { renderRouteNavigation } from '../nav/route-nav';
import { getSchemaTypeLabel } from '../../helpers/schema-utils';
import type { SpecOperation, SpecResponse, SpecResponseHeader, SpecMediaType, SchemaObject, PortalState } from '../../core/types';

/** Render an endpoint detail page. Main block divided into 2 parts: doc | Try It + Code Examples */
export async function renderEndpoint(pageSlot: HTMLElement, asideSlot: HTMLElement, operation: SpecOperation): Promise<void> {
  clear(pageSlot);
  clear(asideSlot);

  const asidePane = asideSlot.parentElement as HTMLElement | null;
  if (asidePane) {
    asidePane.setAttribute('aria-label', 'Try It');
    asidePane.classList.add('try-it');
  }

  const state = store.get();
  const baseUrlNorm = getNormalizedBaseUrl(state);
  const baseUrlDisplay = getDisplayBaseUrl(state);

  // Breadcrumb — Base URL / path with {variable} highlighting, method, copy
  const fullUrl = baseUrlNorm + (operation.path.startsWith('/') ? '' : '/') + operation.path;

  const breadcrumbItems: { label: string; href?: string; className?: string; onClick?: (e: Event) => void }[] = [];
  const methodBadge = createBadge({
    text: operation.method.toUpperCase(),
    kind: 'method',
    method: operation.method,
    mono: true,
    size: 'm',
  });
  breadcrumbItems.push({
    label: baseUrlDisplay || state.spec?.info.title || 'Home',
    href: '/',
    className: 'breadcrumb-item',
    onClick: (e: Event) => { e.preventDefault(); navigate('/'); },
  });

  const tagNames = new Set((state.spec?.tags || []).map((t) => t.name.toLowerCase()));
  const pathSegments = (operation.path || '/').split('/').filter(Boolean);
  for (const seg of pathSegments) {
    const isParam = seg.startsWith('{') && seg.endsWith('}');
    const matchesTag = !isParam && tagNames.has(seg.toLowerCase());
    const tagMatch = state.spec?.tags.find((t) => t.name.toLowerCase() === seg.toLowerCase());
    if (matchesTag && tagMatch) {
      breadcrumbItems.push({
        label: seg,
        href: buildPath({ type: 'tag', tag: tagMatch.name }),
        className: 'breadcrumb-item breadcrumb-segment',
        onClick: (e: Event) => {
          e.preventDefault();
          navigate(buildPath({ type: 'tag', tag: tagMatch.name }));
        },
      });
    } else {
      breadcrumbItems.push({
        label: seg,
        className: isParam ? 'breadcrumb-param' : 'breadcrumb-segment',
      });
    }
  }
  const copyBtn = createCopyButton({
    ariaLabel: 'Copy URL',
    copiedAriaLabel: 'Copied',
    className: 'breadcrumb-copy',
    getText: () => `${operation.method.toUpperCase()} ${fullUrl}`,
  });
  const breadcrumb = createBreadcrumb(breadcrumbItems, {
    leading: [methodBadge],
    trailing: [copyBtn],
  });

  // Header — title
  const header = h('div', { className: 'block header' });
  header.append(h('h1', {
    textContent: operation.summary || `${operation.method.toUpperCase()} ${operation.path}`,
  }));

  // Deprecated badge
  if (operation.deprecated) {
    const warnIcon = h('span', { className: 'icon-muted' });
    warnIcon.innerHTML = icons.warning;
    header.append(h('div', {}, h('span', { className: 'endpoint-meta deprecated' }, warnIcon, 'Deprecated')));
  }
  if (hasOperationAuth(operation.resolvedSecurity)) {
    const hasConfiguredAuth = isOperationAuthConfigured(state, operation);
    const authBadge = formatOperationAuthBadge(operation.resolvedSecurity) || 'Auth required';
    const lock = createLockIcon({
      configured: hasConfiguredAuth,
      variant: 'endpoint',
      title: formatOperationAuthTitle(operation.resolvedSecurity),
    });
    header.append(h('span', {
      className: `endpoint-meta auth${hasConfiguredAuth ? ' is-active' : ''}`,
      title: formatOperationAuthTitle(operation.resolvedSecurity),
      'aria-label': formatOperationAuthTitle(operation.resolvedSecurity),
    }, lock, authBadge));
  }

  // Breadcrumb — below title, before description
  const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap' });
  breadcrumbWrap.append(breadcrumb);
  header.append(breadcrumbWrap);

  // Description — plain text
  if (operation.description) {
    header.append(h('p', { textContent: operation.description }));
  }

  pageSlot.append(header);

  // Headers — before Request
  const headersSection = renderHeadersSection(operation);
  if (headersSection) pageSlot.append(headersSection);

  // Request
  const visibleParams = operation.parameters.filter((p) => p.in !== 'cookie');
  const requestSection = createSection({ title: 'Request' });

  if (visibleParams.length > 0) {
    requestSection.append(renderParametersSection(visibleParams));
  }

  if (operation.requestBody) {
    requestSection.append(renderRequestBodySection(operation));
  }

  if (visibleParams.length === 0 && !operation.requestBody) {
    const emptyHint = h('div', { className: 'params empty', textContent: 'No parameters or request body required' });
    requestSection.append(emptyHint);
  }

  pageSlot.append(requestSection);

  // Responses
  let responsesRendered = false;
  if (Object.keys(operation.responses).length > 0) {
    pageSlot.append(renderResponsesSection(operation));
    responsesRendered = true;
  }

  const routeNav = renderRouteNavigation({
    type: 'endpoint',
    method: operation.method,
    path: operation.path,
    operationId: operation.operationId,
  });
  const appendRouteNav = () => {
    if (routeNav) pageSlot.append(h('div', { className: 'block section' }, routeNav));
  };
  if (responsesRendered) appendRouteNav();

  // Callbacks
  if (operation.callbacks && operation.callbacks.length > 0) {
    pageSlot.append(renderCallbacksSection(operation));
  }

  if (!responsesRendered) appendRouteNav();

  const initialResponse = getFirstResponseExample(operation);
  renderTryIt(operation, asideSlot, initialResponse);
}

function renderHeadersSection(operation: SpecOperation): HTMLElement | null {
  const rows: {
    name: string;
    value: string;
    description?: string;
    required?: boolean;
  }[] = [];

  if (operation.requestBody) {
    const contentTypes = Object.keys(operation.requestBody.content || {});
    rows.push({
      name: 'Content-Type',
      value: contentTypes[0] || 'application/json',
      description: 'Media type for request body payload',
      required: Boolean(operation.requestBody?.required),
    });
  }
  if (hasOperationAuth(operation.resolvedSecurity)) {
    const spec = store.get().spec;
    const authHeaders = spec ? resolveAuthHeaders(operation.resolvedSecurity, spec.securitySchemes) : {};
    const placeholders = spec ? getAuthHeaderPlaceholder(operation.resolvedSecurity, spec.securitySchemes) : {};
    const merged = { ...placeholders, ...authHeaders };
    for (const [hName, hValue] of Object.entries(merged)) {
      rows.push({
        name: hName,
        value: hValue,
        description: 'Authentication header value',
        required: true,
      });
    }
  }
  for (const p of operation.parameters.filter((p) => p.in === 'header')) {
    rows.push({
      name: p.name,
      value: String(p.schema?.default ?? p.example ?? ''),
      description: p.description,
      required: p.required,
    });
  }

  if (rows.length === 0) return null;

  const rowsEl = rows.map((r) => {
    const row = h('div', { className: 'schema-row role-flat role-headers' });
    const mainRow = h('div', { className: 'schema-main-row' });

    const nameWrap = h('div', { className: 'schema-name-wrapper' });
    nameWrap.append(
      h('span', { className: 'schema-spacer' }),
      h('span', { textContent: r.name }),
    );

    const metaWrap = h('div', { className: 'schema-meta-wrapper' });
    if (r.required) {
      metaWrap.append(createBadge({ text: 'required', kind: 'required', size: 'm' }));
    }

    mainRow.append(nameWrap, metaWrap);
    row.append(mainRow);

    const descCol = h('div', { className: 'schema-desc-col is-root' });
    if (r.description) {
      descCol.append(h('p', { textContent: r.description }));
    }
    const valueWrap = h('div', { className: 'schema-enum-values' });
    valueWrap.append(createBadge({
      text: r.value || '—',
      kind: 'chip',
      size: 's',
      mono: true,
    }));
    descCol.append(valueWrap);
    if (descCol.children.length > 0) {
      row.append(descCol);
    }
    return row;
  });

  const card = createCard();
  const body = createCardBody('no-padding');
  const paramsWrap = h('div', { className: 'params' });
  const paramsBody = h('div', { className: 'body role-headers' });
  paramsBody.append(...rowsEl);
  paramsWrap.append(paramsBody);
  body.append(paramsWrap);
  card.append(body);

  return createSection(
    { title: 'Headers' },
    card,
  );
}

function renderParametersSection(params: SpecOperation['parameters']): HTMLElement {
  const pathCount = params.filter((p) => p.in === 'path').length;
  const queryCount = params.filter((p) => p.in === 'query').length;
  const headerTitle =
    pathCount > 0 && queryCount > 0 ? 'Parameters' : pathCount > 0 ? 'Path' : 'Query';
  return renderParametersCard(params, { headerTitle, withEnumAndDefault: true });
}

function renderRequestBodySection(operation: SpecOperation): HTMLElement {
  const wrapper = h('div', { className: 'request-body-wrap' });

  if (operation.requestBody?.description) {
    wrapper.append(h('p', { textContent: operation.requestBody.description }));
  }

  const content = operation.requestBody?.content || {};
  for (const [contentType, mediaType] of Object.entries(content)) {
    if (mediaType.schema) {
      const headerContent = createCardHeaderRow({ title: 'Body' });
      headerContent.append(createBadge({
        text: contentType,
        kind: 'chip',
        size: 's',
        mono: true,
      }));
      wrapper.append(renderSchemaViewer(mediaType.schema, headerContent));
    }
  }

  return wrapper;
}

function renderResponseHeadersBlock(headers: Record<string, SpecResponseHeader>): HTMLElement | null {
  const entries = Object.entries(headers);
  if (entries.length === 0) return null;

  const rowsEl = entries.map(([name, hdr]) => {
    const typeLabel = hdr.schema ? getSchemaTypeLabel(hdr.schema) : 'string';
    const value = hdr.example !== undefined
      ? String(hdr.example)
      : (hdr.schema?.example !== undefined ? String(hdr.schema.example) : '—');

    const row = h('div', { className: 'schema-row role-flat role-headers' });
    const mainRow = h('div', { className: 'schema-main-row' });

    const nameWrap = h('div', { className: 'schema-name-wrapper' });
    nameWrap.append(
      h('span', { className: 'schema-spacer' }),
      h('span', { textContent: name }),
    );

    const metaWrap = h('div', { className: 'schema-meta-wrapper' });
    metaWrap.append(createBadge({ text: typeLabel, kind: 'chip', size: 's', mono: true }));
    if (hdr.required) {
      metaWrap.append(createBadge({ text: 'required', kind: 'required', size: 'm' }));
    }

    mainRow.append(nameWrap, metaWrap);
    row.append(mainRow);

    const descCol = h('div', { className: 'schema-desc-col is-root' });
    if (hdr.description) {
      descCol.append(h('p', { textContent: hdr.description }));
    }
    const valueWrap = h('div', { className: 'schema-enum-values' });
    valueWrap.append(createBadge({
      text: value,
      kind: 'chip',
      size: 's',
      mono: true,
    }));
    descCol.append(valueWrap);
    if (descCol.children.length > 0) {
      row.append(descCol);
    }
    return row;
  });

  const block = h('div', { className: 'params block' });
  const title = h('div', { className: 'title', textContent: 'Headers' });
  const listBody = h('div', { className: 'body role-headers' });
  listBody.append(...rowsEl);
  block.append(title, listBody);
  return block;
}

function renderResponsesSection(operation: SpecOperation): HTMLElement {
  const section = createSection({
    titleEl: createSectionTitleWrap('Responses'),
  });

  const responses = Object.entries(operation.responses);
  if (responses.length === 0) return section;

  // Single card like Request: header (codes + application/json + collapse) + content
  const card = createCard();
  const headerRow = h('div', { className: 'card-row responses-header-row' });

  // Left: response code selector
  const codesWrap = h('div', { className: 'tabs-code codes' });
  let activeCode = responses[0][0];
  let activeContentType = 'application/json';
  const tabData = new Map<string, {
    body: HTMLElement;
    headers: HTMLElement | null;
    contentType: string;
    schemaType: string;
    toggleCollapse: () => void;
    isExpanded: () => boolean;
    hasExpandable: boolean;
  }>();

  for (const [code, response] of responses) {
    const tabBtn = createResponseCodeTab(code, code === activeCode);

    const firstContentType = response.content ? Object.keys(response.content)[0] || 'application/json' : 'application/json';
    const mediaType = response.content?.[firstContentType];
    const schemaType = mediaType?.schema ? getSchemaTypeLabel(mediaType.schema) : 'plain';

    let bodyEl: HTMLElement;
    let toggleCollapse: () => void;
    let isExpanded: () => boolean;
    let hasExpandable: boolean;

    if (mediaType?.schema) {
      const result = renderSchemaBody(mediaType.schema);
      bodyEl = result.body;
      toggleCollapse = result.toggleCollapse;
      isExpanded = result.isExpanded;
      hasExpandable = result.hasExpandable;
    } else {
      const schemaContainer = h('div', { className: 'schema' });
      const schemaBody = h('div', { className: 'body' });
      schemaBody.append(h('p', { textContent: response.description || 'No schema' }));
      schemaContainer.append(schemaBody);
      bodyEl = schemaContainer;
      toggleCollapse = () => {};
      isExpanded = () => false;
      hasExpandable = false;
    }

    const headersEl = response.headers ? renderResponseHeadersBlock(response.headers) : null;

    tabData.set(code, {
      body: bodyEl,
      headers: headersEl,
      contentType: firstContentType,
      schemaType,
      toggleCollapse,
      isExpanded,
      hasExpandable,
    });
    codesWrap.append(tabBtn);

    tabBtn.addEventListener('click', () => {
      codesWrap.querySelectorAll('[data-badge-group="response-code"]').forEach((t) => setResponseCodeTabActive(t as HTMLElement, false));
      setResponseCodeTabActive(tabBtn, true);
      activeCode = code;
      const data = tabData.get(code)!;
      activeContentType = data.contentType;
      contentTypeSpan.textContent = data.contentType;
      schemaTypeBadge.textContent = data.schemaType;
      collapseBtn.style.display = data.hasExpandable ? 'inline-flex' : 'none';
      collapseBtn.classList.toggle('is-expanded', data.hasExpandable && data.isExpanded());
      collapseBtn.title = data.hasExpandable && data.isExpanded() ? 'Collapse all' : 'Expand all';
      headersContainer.innerHTML = '';
      if (data.headers) {
        headersContainer.append(data.headers);
        headersContainer.hidden = false;
      } else {
        headersContainer.hidden = true;
      }
      bodyContainer.innerHTML = '';
      bodyContainer.append(data.body);
    });
  }

  headerRow.append(codesWrap);

  // Right: application/json + collapse
  const contentTypeSpan = createBadge({
    text: activeContentType,
    kind: 'chip',
    size: 's',
    mono: true,
  });
  const schemaTypeBadge = createBadge({
    text: tabData.get(activeCode)?.schemaType || 'plain',
    kind: 'chip',
    size: 's',
    mono: true,
  });
  const collapseBtn = h('button', {
    className: 'schema-collapse-btn is-expanded',
    type: 'button',
    title: 'Collapse all',
  });
  collapseBtn.innerHTML = icons.chevronDown;
  collapseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const data = tabData.get(activeCode);
    if (data?.hasExpandable) {
      data.toggleCollapse();
      collapseBtn.classList.toggle('is-expanded', data.isExpanded());
      collapseBtn.title = data.isExpanded() ? 'Collapse all' : 'Expand all';
    }
  });

  headerRow.append(contentTypeSpan, schemaTypeBadge, collapseBtn);

  card.append(createCardHeader(headerRow));

  const bodyWrapper = createCardBody('no-padding');
  const headersContainer = h('div', { className: 'params wrap' });
  const bodyContainer = h('div');
  const initialData = tabData.get(activeCode);
  if (initialData) {
    if (initialData.headers) {
      headersContainer.append(initialData.headers);
      headersContainer.hidden = false;
    } else {
      headersContainer.hidden = true;
    }
    bodyContainer.append(initialData.body);
    collapseBtn.style.display = initialData.hasExpandable ? 'inline-flex' : 'none';
    collapseBtn.classList.toggle('is-expanded', initialData.hasExpandable && initialData.isExpanded());
    collapseBtn.title = initialData.hasExpandable && initialData.isExpanded() ? 'Collapse all' : 'Expand all';
  }

  bodyWrapper.append(headersContainer, bodyContainer);
  card.append(bodyWrapper);
  section.append(card);

  return section;
}

function renderCallbacksSection(operation: SpecOperation): HTMLElement {
  const section = createSection({
    titleEl: createSectionTitleWrap('Callbacks', createBadge({ text: String(operation.callbacks!.length), kind: 'chip', size: 'm' })),
  });

  for (const callback of operation.callbacks!) {
    const callbackBlock = h('div', { className: 'callback-block' });
    callbackBlock.append(h('div', { className: 'callback-name', textContent: callback.name }));

    for (const cbOp of callback.operations) {
      const opBlock = h('div', { className: 'callback-operation' });

      const opHeader = h('div', { className: 'callback-op-header' });
      opHeader.append(
        createBadge({
          text: cbOp.method.toUpperCase(),
          kind: 'method',
          method: cbOp.method,
          mono: true,
        }),
        h('span', { className: 'callback-op-path', textContent: cbOp.path }),
      );
      opBlock.append(opHeader);

      if (cbOp.summary) {
        opBlock.append(h('div', { className: 'callback-op-summary', textContent: cbOp.summary }));
      }
      if (cbOp.description) {
        opBlock.append(h('p', { textContent: cbOp.description }));
      }

      // Callback request body
      if (cbOp.requestBody) {
        const bodyContent = cbOp.requestBody.content || {};
        for (const [ct, mediaType] of Object.entries(bodyContent)) {
          if (mediaType.schema) {
            opBlock.append(renderSchemaViewer(mediaType.schema, `${ct} — Request Body`));
          }
        }
      }

      // Callback responses
      if (Object.keys(cbOp.responses).length > 0) {
        for (const [code, resp] of Object.entries(cbOp.responses)) {
          const respRow = h('div', { className: 'callback-response-row' });
          respRow.append(createBadge({
            text: code,
            kind: 'status',
            statusCode: code,
            mono: true,
          }));
          if (resp.description) {
            respRow.append(h('p', { textContent: resp.description }));
          }
          if (resp.content) {
            for (const [ct, mediaType] of Object.entries(resp.content)) {
              if (mediaType.schema) {
                respRow.append(renderSchemaViewer(mediaType.schema, `${ct}`));
              }
            }
          }
          opBlock.append(respRow);
        }
      }

      callbackBlock.append(opBlock);
    }

    section.append(callbackBlock);
  }

  return section;
}

function getFirstResponseExample(operation: SpecOperation): InitialResponseExample | null {
  const codes = Object.keys(operation.responses).sort((a, b) => {
    const a2 = a.startsWith('2') ? 0 : a.startsWith('4') ? 1 : 2;
    const b2 = b.startsWith('2') ? 0 : b.startsWith('4') ? 1 : 2;
    return a2 - b2 || a.localeCompare(b);
  });
  for (const code of codes) {
    const resp = operation.responses[code];
    if (!resp?.content) continue;
    const ct = Object.keys(resp.content)[0] || 'application/json';
    const mediaType = resp.content[ct];
    const examples = mediaType ? extractExamples(mediaType) : [];
    const ex = examples[0];
    if (ex && ex.value !== undefined) {
      const body = typeof ex.value === 'string' ? ex.value : JSON.stringify(ex.value, null, 2);
      const statusText = resp.description || (code.startsWith('2') ? 'OK' : code.startsWith('4') ? 'Not Found' : 'Error');
      return { statusCode: code, statusText, body };
    }
    if (mediaType?.example !== undefined) {
      const body = typeof mediaType.example === 'string' ? mediaType.example : JSON.stringify(mediaType.example, null, 2);
      return { statusCode: code, statusText: resp.description || 'OK', body };
    }
  }
  return null;
}

function isOperationAuthConfigured(state: PortalState, operation: SpecOperation): boolean {
  const requirements = operation.resolvedSecurity?.requirements || [];
  if (!hasOperationAuth(operation.resolvedSecurity)) return false;

  const token = (state.auth.token || '').trim();
  const schemes = state.auth.schemes || {};
  const activeScheme = state.auth.activeScheme;

  const hasSchemeValue = (schemeName: string): boolean => {
    const value = String(schemes[schemeName] || '').trim();
    if (value) return true;
    if (!token) return false;
    return !activeScheme || activeScheme === schemeName;
  };

  return requirements.some((requirement) => {
    const schemeNames = requirement.map((item) => item.schemeName);
    if (schemeNames.length === 0) return true;
    return schemeNames.every((schemeName) => hasSchemeValue(schemeName));
  });
}
