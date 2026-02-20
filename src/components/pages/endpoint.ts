import { h, clear, markdownBlock } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { useEffects } from '../../core/effects';
import { navigate, buildPath } from '../../core/router';
import { renderSchemaViewer, renderSchemaBody } from '../shared/schema-viewer';
import { renderTryIt, createHeaderRow, type InitialResponseExample } from '../shared/try-it';
import { extractExamples } from '../shared/example-picker';
import { resolveAuthHeaders, getAuthHeaderPlaceholder, openAuthModal } from '../modals/auth-modal';
import { getDisplayBaseUrl, getNormalizedBaseUrl } from '../../services/env';
import { formatOperationAuthBadge, formatOperationAuthTitle, hasOperationAuth } from '../../core/security';
import { createCopyButton } from '../shared/copy-button';
import {
  createSchemaBodyContent, createBodyCategoryTrailing, getSchemaTopLevelCount,
  createCollapsibleCategory, renderResponseHeadersList, renderResponseCategories,
  type ResponseTabData, type SchemaBodyContent, type CollapsibleCategoryOptions,
} from '../shared/responses';
import { createBadge, createSection, createBreadcrumb, createSectionTitleWrap, createCard, createCardHeader, createCardBody, createResponseCodeTab, createLockIcon, setResponseCodeTabActive } from '../ui';
import { renderRouteNavigation } from '../nav/route-nav';
import { getSchemaTypeLabel } from '../../helpers/schema-utils';
import type { SpecOperation, SpecResponseHeader, SpecMediaType, SchemaObject, PortalState, RouteInfo } from '../../core/types';

/** Render an endpoint detail page. Main block divided into 2 parts: doc | Try It + Code Examples */
export async function renderEndpoint(pageSlot: HTMLElement, asideSlot: HTMLElement, operation: SpecOperation): Promise<void> {
  clear(pageSlot);
  clear(asideSlot);

  const showTryIt = operation.method.toLowerCase() !== 'trace';
  const asidePane = asideSlot.parentElement as HTMLElement | null;
  if (asidePane && showTryIt) {
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

  // Description — directly under title
  if (operation.description) {
    header.append(markdownBlock(operation.description));
  }

  // Breadcrumb — under description, highlighted as card
  const breadcrumbWrap = h('div', { className: 'breadcrumb-wrap endpoint-breadcrumb' });
  breadcrumbWrap.append(breadcrumb);
  header.append(breadcrumbWrap);

  // Meta row — auth and deprecated under breadcrumb
  const metaRow = h('div', { className: 'endpoint-meta-row' });
  if (operation.deprecated) {
    const warnIcon = h('span', { className: 'icon-muted' });
    warnIcon.innerHTML = icons.warning;
    metaRow.append(h('span', { className: 'endpoint-meta deprecated' }, warnIcon, 'Deprecated'));
  }
  
  let authEl: HTMLElement | null = null;
  if (hasOperationAuth(operation.resolvedSecurity)) {
    const hasConfiguredAuth = isOperationAuthConfigured(state, operation);
    const authBadge = formatOperationAuthBadge(operation.resolvedSecurity) || 'Auth required';
    const lock = createLockIcon({
      configured: hasConfiguredAuth,
      variant: 'endpoint',
      title: formatOperationAuthTitle(operation.resolvedSecurity),
    });
    authEl = h('span', {
      className: `endpoint-meta auth${hasConfiguredAuth ? ' is-active' : ' is-missing'}`,
      'aria-label': formatOperationAuthTitle(operation.resolvedSecurity),
      role: 'button',
      tabindex: '0',
    }, lock, authBadge);
    authEl.classList.add('endpoint-auth-trigger', 'focus-ring');
    authEl.addEventListener('click', () => {
      const spec = store.get().spec;
      if (!spec || !Object.keys(spec.securitySchemes || {}).length) return;
      const root = (pageSlot.closest('.root') as HTMLElement | null) ?? undefined;
      openAuthModal(spec.securitySchemes, root, getPreferredAuthScheme(operation, state));
    });
    authEl.addEventListener('keydown', (event: Event) => {
      const key = (event as KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ') return;
      event.preventDefault();
      if (authEl) authEl.click();
    });
    metaRow.append(authEl);
  }
  if (metaRow.childElementCount > 0) {
    header.append(metaRow);
  }

  pageSlot.append(header);

  // Request
  const visibleParams = operation.parameters.filter((p) => p.in !== 'cookie');
  const requestSection = createSection({ title: 'Request' });

  const requestContent = renderRequestContent(operation, visibleParams);
  if (requestContent) {
    requestSection.append(requestContent);
  } else {
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

  const routeNavArgs: RouteInfo = {
    type: 'endpoint',
    method: operation.method,
    path: operation.path,
    operationId: operation.operationId,
  };
  const routeNavDesktop = renderRouteNavigation(routeNavArgs);
  const routeNavMobile = renderRouteNavigation(routeNavArgs);
  const appendRouteNav = () => {
    if (routeNavDesktop) {
      pageSlot.append(h('div', { className: 'route-nav-wrap is-desktop' }, routeNavDesktop));
    }
    if (routeNavMobile) {
      const pageContainer = pageSlot.closest('.page');
      if (pageContainer) {
        pageContainer.append(h('div', { className: 'route-nav-wrap is-mobile' }, routeNavMobile));
      }
    }
  };
  if (responsesRendered) appendRouteNav();

  // Callbacks
  if (operation.callbacks && operation.callbacks.length > 0) {
    pageSlot.append(renderCallbacksSection(operation));
  }

  if (!responsesRendered) appendRouteNav();

  const initialResponse = getFirstResponseExample(operation);
  if (operation.method.toLowerCase() !== 'trace') {
    renderTryIt(operation, asideSlot, initialResponse);
  }

  // --- Reactive effects ---
  const effects = useEffects();

  // Breadcrumb: update base URL when environment changes
  const breadcrumbHomeEl = breadcrumb.querySelector('.breadcrumb-item') as HTMLAnchorElement | null;
  if (breadcrumbHomeEl) {
    effects.on('endpoint:breadcrumb', (st) => {
      breadcrumbHomeEl.textContent = getDisplayBaseUrl(st) || st.spec?.info.title || 'Home';
    });
  }

  // Auth badge: update lock icon and class when auth state changes
  if (authEl && hasOperationAuth(operation.resolvedSecurity)) {
    effects.on('endpoint:auth-badge', (st) => {
      const configured = isOperationAuthConfigured(st, operation);
      authEl!.className = `endpoint-meta auth endpoint-auth-trigger focus-ring${configured ? ' is-active' : ' is-missing'}`;
      
      // Update lock icon
      const lockIcon = authEl!.querySelector('.lock-icon');
      if (lockIcon) {
        lockIcon.className = `lock-icon${configured ? ' is-unlocked' : ''}`;
      }
    });
  }

  // Auth headers in Try It: swap auth rows when token/env changes
  const tryItContent = asideSlot.querySelector('.content') as HTMLElement | null;
  if (tryItContent && hasOperationAuth(operation.resolvedSecurity)) {
    effects.on('endpoint:auth-headers', (st) => {
      if (!st.spec) return;
      const headersContainer = tryItContent.querySelector('.headers-list');
      if (!headersContainer) return;

      // Remove existing auth rows
      const authNames = ['Authorization', 'Cookie'];
      for (const row of Array.from(headersContainer.querySelectorAll('.header-row'))) {
        const nameInput = row.querySelector('[data-header-name]') as HTMLInputElement;
        if (nameInput && authNames.includes(nameInput.value)) row.remove();
      }

      // Insert fresh auth rows
      const authHeaders = resolveAuthHeaders(operation.resolvedSecurity, st.spec.securitySchemes);
      const placeholders = getAuthHeaderPlaceholder(operation.resolvedSecurity, st.spec.securitySchemes);
      const merged = { ...placeholders, ...authHeaders };

      const remaining = Array.from(headersContainer.querySelectorAll('.header-row'));
      const anchor = remaining.find((r) => {
        const inp = r.querySelector('[data-header-name]') as HTMLInputElement;
        return inp && inp.value === 'Content-Type';
      }) || remaining[0];

      for (const [name, value] of Object.entries(merged).reverse()) {
        const row = createHeaderRow(name, value);
        if (anchor) anchor.insertAdjacentElement('beforebegin', row);
        else headersContainer.prepend(row);
      }

      // Trigger code-example refresh
      tryItContent.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}

interface RequestHeaderRow {
  name: string;
  value: string;
  description?: string;
  required?: boolean;
}

interface RequestBodyCategory {
  content: HTMLElement;
  trailing?: HTMLElement;
  counter?: number | string;
}

function renderRequestContent(operation: SpecOperation, params: SpecOperation['parameters']): HTMLElement | null {
  const pathParams = params.filter((p) => p.in === 'path');
  const queryParams = params.filter((p) => p.in === 'query');
  const requestHeaders = collectRequestHeaders(operation);
  const requestBodyCategory = renderRequestBodyCategory(operation);

  if (pathParams.length === 0 && queryParams.length === 0 && requestHeaders.length === 0 && !requestBodyCategory) {
    return null;
  }

  const card = createCard();
  const body = createCardBody('no-padding');
  const categories = h('div', { className: 'collapsible-categories' });

  if (pathParams.length > 0) {
    const pathCategory = createCollapsibleCategory({
      title: 'Path',
      content: renderParameterList(pathParams),
      counter: pathParams.length,
    });
    categories.append(pathCategory.root);
  }

  if (queryParams.length > 0) {
    const queryCategory = createCollapsibleCategory({
      title: 'Query',
      content: renderParameterList(queryParams),
      counter: queryParams.length,
    });
    categories.append(queryCategory.root);
  }

  if (requestHeaders.length > 0) {
    const headersCategory = createCollapsibleCategory({
      title: 'Headers',
      content: renderRequestHeadersList(requestHeaders),
      counter: requestHeaders.length,
    });
    categories.append(headersCategory.root);
  }

  if (requestBodyCategory) {
    const bodyCategory = createCollapsibleCategory({
      title: 'Body',
      content: requestBodyCategory.content,
      trailing: requestBodyCategory.trailing,
      counter: requestBodyCategory.counter,
    });
    categories.append(bodyCategory.root);
  }

  body.append(categories);
  card.append(body);
  return card;
}

function renderParameterList(params: SpecOperation['parameters']): HTMLElement {
  const rowsEl = params.map((p) => {
    const row = h('div', { className: 'schema-row role-flat role-params' });
    const mainRow = h('div', { className: 'schema-main-row' });

    const nameWrap = h('div', { className: 'schema-name-wrapper' });
    nameWrap.append(
      h('span', { className: 'schema-spacer' }),
      h('span', { textContent: p.name }),
    );

    const metaWrap = h('div', { className: 'schema-meta-wrapper' });
    metaWrap.append(createBadge({
      text: p.schema ? getSchemaTypeLabel(p.schema) : 'unknown',
      kind: 'chip',
      color: 'primary',
      size: 'm',
      mono: true,
    }));
    if (p.required) {
      metaWrap.append(createBadge({ text: 'required', kind: 'required', size: 'm' }));
    }

    mainRow.append(nameWrap, metaWrap);
    row.append(mainRow);

    const descCol = h('div', { className: 'schema-desc-col is-root' });
    if (p.description) {
      descCol.append(markdownBlock(p.description));
    }
    const enumValues = p.schema?.enum;
    const hasDefault = p.schema?.default !== undefined;
    if ((enumValues && enumValues.length > 0) || hasDefault) {
      const enumWrap = h('div', { className: 'schema-enum-values' });
      if (hasDefault) {
        enumWrap.append(createBadge({
          text: `Default: ${JSON.stringify(p.schema!.default)}`,
          kind: 'chip',
          size: 's',
          mono: true,
        }));
      }
      if (enumValues) {
        for (const val of enumValues) {
          const str = String(val);
          if (str === p.in) continue;
          enumWrap.append(createBadge({ text: str, kind: 'chip', size: 's', mono: true }));
        }
      }
      descCol.append(enumWrap);
    }
    if (descCol.children.length > 0) row.append(descCol);

    return row;
  });

  const wrap = h('div', { className: 'params' });
  const body = h('div', { className: 'body role-params' });
  body.append(...rowsEl);
  wrap.append(body);
  return wrap;
}

function collectRequestHeaders(operation: SpecOperation): RequestHeaderRow[] {
  const rows: RequestHeaderRow[] = [];

  if (operation.requestBody) {
    const contentTypes = Object.keys(operation.requestBody.content || {});
    rows.push({
      name: 'Content-Type',
      value: contentTypes[0] || 'application/json',
      description: 'Media type for request body payload',
      required: Boolean(operation.requestBody.required),
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
  for (const p of operation.parameters.filter((param) => param.in === 'header')) {
    rows.push({
      name: p.name,
      value: String(p.schema?.default ?? p.example ?? ''),
      description: p.description,
      required: p.required,
    });
  }

  return rows;
}

function renderRequestHeadersList(rows: RequestHeaderRow[]): HTMLElement {
  const rowsEl = rows.map((rowData) => {
    const row = h('div', { className: 'schema-row role-flat role-headers' });
    const mainRow = h('div', { className: 'schema-main-row' });

    const nameWrap = h('div', { className: 'schema-name-wrapper' });
    nameWrap.append(
      h('span', { className: 'schema-spacer' }),
      h('span', { textContent: rowData.name }),
    );

    const metaWrap = h('div', { className: 'schema-meta-wrapper' });
    if (rowData.required) {
      metaWrap.append(createBadge({ text: 'required', kind: 'required', size: 'm' }));
    }

    mainRow.append(nameWrap, metaWrap);
    row.append(mainRow);

    const descCol = h('div', { className: 'schema-desc-col is-root' });
    if (rowData.description) {
      descCol.append(markdownBlock(rowData.description));
    }
    const valueWrap = h('div', { className: 'schema-enum-values' });
    valueWrap.append(createBadge({
      text: rowData.value || '—',
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

  const wrap = h('div', { className: 'params' });
  const body = h('div', { className: 'body role-headers' });
  body.append(...rowsEl);
  wrap.append(body);
  return wrap;
}

function renderRequestBodyCategory(operation: SpecOperation): RequestBodyCategory | null {
  const wrapper = h('div', { className: 'request-body-wrap' });
  const contentEntries = Object.entries(operation.requestBody?.content || {});

  if (operation.requestBody?.description) {
    wrapper.append(markdownBlock(operation.requestBody.description));
  }

  if (contentEntries.length === 0) {
    return wrapper.childElementCount > 0 ? { content: wrapper } : null;
  }

  const schemas = contentEntries.map(([contentType, mediaType]) => createSchemaBodyContent(contentType, mediaType, 'No schema'));
  if (schemas.length === 1) {
    const body = schemas[0];
    wrapper.append(body.content);
    return { content: wrapper, trailing: createBodyCategoryTrailing(body), counter: body.itemsCount };
  }

  const mediaList = h('div', { className: 'schema-media-list' });
  for (const body of schemas) {
    const header = h('div', { className: 'schema-media-header' });
    header.append(
      createBadge({ text: body.contentType, kind: 'chip', size: 's', mono: true }),
      createBadge({ text: body.schemaType, kind: 'chip', color: 'primary', size: 's', mono: true }),
    );

    const item = h('div', { className: 'schema-media-item' });
    item.append(header, body.content);
    mediaList.append(item);
  }
  wrapper.append(mediaList);

  return {
    content: wrapper,
    counter: schemas.length,
  };
}


function renderResponsesSection(operation: SpecOperation): HTMLElement {
  const section = createSection({
    titleEl: createSectionTitleWrap('Responses'),
  });

  const responses = Object.entries(operation.responses);
  if (responses.length === 0) return section;

  // Single card like Request: response code tabs + unified body categories
  const card = createCard();
  const headerRow = h('div', { className: 'card-row responses-header-row' });

  // Left: response code selector
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
        opBlock.append(markdownBlock(cbOp.description));
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
            respRow.append(markdownBlock(resp.description));
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

function getPreferredAuthScheme(operation: SpecOperation, state: PortalState): string | undefined {
  const requirements = operation.resolvedSecurity?.requirements || [];
  const firstRequiredScheme = requirements[0]?.[0]?.schemeName;
  return firstRequiredScheme || state.auth.activeScheme || undefined;
}
