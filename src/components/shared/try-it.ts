import { h, clear, formatDuration, formatBytes } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { executeRequest, buildRequestUrl } from '../../api/http-client';
import { generateSnippets } from '../../api/snippets';
import { extractExamples, extractParamExampleSets, formatExampleValue, getExampleLabel } from './example-picker';
import { getBaseUrl } from '../../services/env';
import { highlightCode, looksLikeJson } from '../../lib/highlight';
import { resolveAuthHeaders, resolveAuthQuery, resolveAuthCookies, getAuthHeaderPlaceholder } from '../modals/auth-modal';
import { hasOperationAuth } from '../../core/security';
import { validateAll } from '../../core/validation';
import { clearValidationErrors, showValidationErrors, createErrorPlaceholder } from '../../helpers/validation-ui';
import { createEditorPanel, autoResizeTextarea } from './editor-panel';
import { createCopyButton } from './copy-button';
import { createSelect, createInput, createButton, createBadge, createTab, createResponseCodeTab } from '../ui';
import type { SpecOperation, SpecParameter, TryItResponse, SchemaObject } from '../../core/types';

export interface InitialResponseExample {
  statusCode: string;
  statusText: string;
  body: string;
}

export interface TryItConfig {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string | FormData;
}

/** Collect current request config from Try It form (path, query, headers, body) */
export function collectRequestConfig(container: HTMLElement, operation: SpecOperation): TryItConfig {
  return collectRequestConfigImpl(container, operation);
}

/** Render the Try It interactive console */
export function renderTryIt(
  operation: SpecOperation,
  container: HTMLElement,
  initialResponse?: InitialResponseExample | null,
  options?: { onConfigChange?: (config: TryItConfig) => void; extraContent?: HTMLElement },
): void {
  clear(container);
  container.classList.add('try-it');
  const tryItLayout = h('div', { className: 'body' });

  // Request + Code Examples (combined block with tabs + Send button)
  const responseSection = h('div', { className: 'block section' });
  responseSection.append(h('h2', { textContent: 'Response' }));
  const responseContainer = h('div', { 'data-response': 'true' });
  if (initialResponse) {
    renderResponse(responseContainer, {
      status: parseInt(initialResponse.statusCode, 10) || 200,
      statusText: initialResponse.statusText || 'OK',
      headers: {},
      body: initialResponse.body,
      duration: 0,
      size: 0,
    });
  } else {
    const placeholder = h('div', { className: 'placeholder' });
    placeholder.append(h('span', { textContent: 'Execute request to see response' }));
    responseContainer.append(placeholder);
  }
  responseSection.append(responseContainer);

  tryItLayout.append(renderRequestCodeBlock(operation, container, {
    onConfigChange: options?.onConfigChange,
    onSendRequest: async (sendBtn: HTMLButtonElement) => {
      clearValidationErrors(container);
      const errors = validateAll(container, operation);
      if (errors.length > 0) {
        showValidationErrors(container, errors);
        return;
      }
      const config = collectRequestConfigImpl(container, operation);
      sendBtn.setAttribute('disabled', '');
      sendBtn.innerHTML = '';
      sendBtn.append(h('span', { className: 'spinner spinner-sm' }), h('span', null, 'Sending...'));
      try {
        const response = await executeRequest(config);
        renderResponse(responseContainer, response);
      } catch (err) {
        renderResponse(responseContainer, {
          status: 0,
          statusText: 'Error',
          headers: {},
          body: (err as Error).message,
          duration: 0,
          size: 0,
        });
      } finally {
        sendBtn.removeAttribute('disabled');
        sendBtn.innerHTML = icons.send;
        sendBtn.append(h('span', null, 'Send Request'));
      }
    },
  }));

  tryItLayout.append(responseSection);
  container.append(tryItLayout);

  if (options?.onConfigChange) {
    let debounceTimer: ReturnType<typeof setTimeout>;
    const notify = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const config = collectRequestConfigImpl(container, operation);
        options.onConfigChange!(config);
      }, 120);
    };
    container.addEventListener('input', notify);
    container.addEventListener('change', notify);
  }

  // Deferred resize body textarea — after layout in DOM
  const bodyTextarea = container.querySelector('textarea[data-field="body"]') as HTMLTextAreaElement | null;
  if (bodyTextarea) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => autoResizeTextarea(bodyTextarea));
    });
  }
}

/** Combined Request Body / Query / Path + Code Examples block with tabs */
function renderRequestCodeBlock(
  operation: SpecOperation,
  tryItBody: HTMLElement,
  options?: { onConfigChange?: (config: TryItConfig) => void; onSendRequest?: (sendBtn: HTMLButtonElement) => Promise<void> },
): HTMLElement {
  const onConfigChange = options?.onConfigChange;
  const pathParams = operation.parameters.filter((p) => p.in === 'path');
  const queryParams = operation.parameters.filter((p) => p.in === 'query');
  const paramExampleSets = extractParamExampleSets([...pathParams, ...queryParams]);

  // First tab unified for all operations
  const firstTabLabel = 'Request';

  const snippets = generateSnippets({
    method: operation.method,
    url: '', // will be updated
    headers: {},
    body: operation.requestBody ? '{ ... }' : undefined,
  });

  const getCodeParams = (): { method: string; url: string; headers: Record<string, string>; body?: string } => {
    const config = collectRequestConfigImpl(tryItBody, operation);
    let bodyStr: string | undefined;
    if (typeof config.body === 'string') bodyStr = config.body;
    else if (config.body instanceof FormData) bodyStr = '{ /* multipart form-data */ }';
    else if (operation.requestBody) bodyStr = '{ ... }';
    return {
      method: config.method,
      url: config.url,
      headers: config.headers || {},
      body: bodyStr,
    };
  };

  const getBodyTextForCopy = (): string => {
    const config = collectRequestConfigImpl(tryItBody, operation);
    if (typeof config.body === 'string') return config.body;
    if (config.body instanceof FormData) {
      const lines: string[] = [];
      config.body.forEach((value, key) => {
        if (value instanceof File) {
          lines.push(`${key}: [File ${value.name}]`);
          return;
        }
        lines.push(`${key}: ${String(value)}`);
      });
      return lines.join('\n');
    }
    return '';
  };

  const updateSnippetsCode = (
    editor: { setValue: (v: string, lang?: string) => void },
    snippetIndex: number,
  ) => {
    const params = getCodeParams();
    const items = generateSnippets(params);
    const sn = items[snippetIndex] || items[0];
    if (sn) editor.setValue(sn.code, sn.language);
  };

  const section = h('div', { className: 'block section tabs-code' });
  const sectionBody = h('div', { className: 'body' });
  const sectionTitle = h('h2', { textContent: 'Request' });
  section.append(sectionTitle, sectionBody);
  const requestControls = h('div', { className: 'controls' });
  let hasRequestControls = false;

  if (paramExampleSets.length > 1 && (pathParams.length > 0 || queryParams.length > 0)) {
    requestControls.append(createSelect({
      options: paramExampleSets.map((ex) => ({ value: ex.name, label: ex.summary || ex.name })),
      value: paramExampleSets[0].name,
      ariaLabel: 'Select example',
      className: 'example-select',
      onChange: (val) => {
        const chosen = paramExampleSets.find((e) => e.name === val);
        if (chosen) {
          applyParamValues(tryItBody, chosen.values);
          tryItBody.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
    }));
    hasRequestControls = true;
  }

  const state = store.get();
  const card = h('div', { className: 'card' });
  const header = h('div', { className: 'card-head' });
  const tabsWrap = h('div', { className: 'tabs tabs-code' });

  const tabButtons: HTMLElement[] = [];
  let activeTabIndex = 0;
  const showResolvedRoute = true;
  let routePreviewInput: HTMLInputElement | null = null;
  let routePreviewEl: HTMLElement | null = null;

  // Panel for first tab (Body/Query/Path)
  let firstTabPanel: HTMLElement | null = null;
  if (firstTabLabel) {
    const tabBtn = createTab(firstTabLabel, { active: true, context: true });
    tabButtons.push(tabBtn);

    firstTabPanel = h('div', { className: 'panel is-request', 'data-tab': 'first' });

    if (pathParams.length > 0 || queryParams.length > 0) {
      const paramsSection = h('div', { className: 'params-group' });
      paramsSection.append(h('h3', { textContent: 'Parameters' }));

      if (pathParams.length > 0) {
        const pathGroup = h('div', { className: 'params-group' });
        if (queryParams.length > 0) {
          pathGroup.append(h('h3', { textContent: 'Path' }));
        }
        for (const param of pathParams) {
          pathGroup.append(createParamInput(param, paramExampleSets[0]?.values[param.name]));
        }
        paramsSection.append(pathGroup);
      }

      if (queryParams.length > 0) {
        const queryGroup = h('div', { className: 'params-group' });
        if (pathParams.length > 0) {
          queryGroup.append(h('h3', { textContent: 'Query' }));
        }
        for (const param of queryParams) {
          queryGroup.append(createParamInput(param, paramExampleSets[0]?.values[param.name]));
        }
        paramsSection.append(queryGroup);
      }

      firstTabPanel.append(paramsSection);
    }

    if (showResolvedRoute) {
      const routePreview = h('div', { className: 'route-preview' });
      const routePreviewHeader = h('div', { className: 'field-header' });
      routePreviewHeader.append(h('h3', { textContent: 'URL' }));
      const copyRouteBtn = createCopyButton({
        ariaLabel: 'Copy URL',
        className: 'route-copy-btn',
        getText: () => routePreviewInput?.value || collectRequestConfigImpl(tryItBody, operation).url,
      });
      routePreviewInput = createInput({
        type: 'text',
        ariaLabel: 'Request URL',
        readOnly: true,
        modifiers: ['filled'],
        className: 'route-input',
      });
      const routeInputRow = h('div', { className: 'route-input-row' });
      routeInputRow.append(routePreviewInput, copyRouteBtn);
      routePreview.append(routePreviewHeader, routeInputRow);
      routePreviewEl = routePreview;
    }

    if (operation.requestBody) {
      const bodySection = h('div', { className: 'body-section' });
      const bodyHeader = h('div', { className: 'field-header' });
      bodyHeader.append(h('h3', { textContent: 'Body' }));
      const copyBodyBtn = createCopyButton({
        ariaLabel: 'Copy body',
        className: 'field-copy-btn',
        getText: getBodyTextForCopy,
      });
      bodyHeader.append(copyBodyBtn);
      bodySection.append(bodyHeader);

      const contentTypes = Object.keys(operation.requestBody.content || {});
      const defaultCT = contentTypes[0] || 'application/json';
      const isMultipart = defaultCT.includes('multipart');
      const mediaType = operation.requestBody.content?.[defaultCT];

      if (isMultipart && mediaType?.schema) {
        const formWrap = h('div', { className: 'multipart', 'data-field': 'multipart' });
        const schema = mediaType.schema;
        const properties = schema.properties || {};
        const requiredFields = schema.required || [];
        for (const [fieldName, fieldSchema] of Object.entries(properties)) {
          const isBinary = fieldSchema.format === 'binary' || fieldSchema.format === 'base64'
            || (fieldSchema.type === 'string' && fieldSchema.format === 'binary');
          const isRequired = requiredFields.includes(fieldName);
          const fieldRow = h('div', { className: `params row${isRequired ? ' is-required' : ''}` });
          const fieldLabel = h('span', { className: 'label', textContent: fieldName });
          if (isRequired) fieldLabel.append(createBadge({ text: '*', kind: 'required', size: 's' }));
          if (isBinary) {
            const fileInput = h('input', {
              type: 'file',
              'data-multipart-field': fieldName,
              'data-multipart-type': 'file',
            }) as HTMLInputElement;
            fieldRow.append(fieldLabel, fileInput);
          } else {
            const textInput = createInput({
              placeholder: fieldSchema.description || fieldName,
              value: fieldSchema.default !== undefined ? String(fieldSchema.default) : '',
              dataAttrs: { multipartField: fieldName, multipartType: 'text' },
            });
            fieldRow.append(fieldLabel, textInput);
          }
          formWrap.append(fieldRow);
        }
        bodySection.append(formWrap);
      } else {
        const examples = mediaType ? extractExamples(mediaType) : [];
        const initialExample = examples[0];
        const initialVal = initialExample ? formatExampleValue(initialExample.value) : '';
        const editor = createEditorPanel(initialVal, 'json', {
          dataField: 'body',
          onInput: () => onConfigChange?.(collectRequestConfigImpl(tryItBody, operation)),
        });
        bodySection.append(editor.wrap);
        if (examples.length > 1) {
          const exampleSelect = createSelect({
            options: examples.map((ex) => ({ value: ex.name, label: getExampleLabel(ex) })),
            value: examples[0].name,
            ariaLabel: 'Select example',
            className: 'example-select',
            onChange: (val) => {
              const chosen = examples.find((e) => e.name === val);
              if (chosen) {
                editor.setValue(formatExampleValue(chosen.value), 'json');
                onConfigChange?.(collectRequestConfigImpl(tryItBody, operation));
              }
            },
          });
          requestControls.append(exampleSelect);
          hasRequestControls = true;
        }
      }
      bodySection.append(createErrorPlaceholder('body'));
      firstTabPanel.append(bodySection);
    }

    // Headers — title + buttons + list (header-row), before URL
    const headersSection = h('div', { className: 'headers-section' });
    const headersHeader = h('div', { className: 'field-header' });
    headersHeader.append(h('h3', { textContent: 'Headers' }));
    const headersContainer = h('div', { className: 'headers-list' });
    if (operation.requestBody) {
      const contentTypes = Object.keys(operation.requestBody.content || {});
      const defaultCT = contentTypes[0] || 'application/json';
      headersContainer.append(createHeaderRow('Content-Type', defaultCT));
    }
    if (hasOperationAuth(operation.resolvedSecurity) && state.spec) {
      const authHeaders = resolveAuthHeaders(operation.resolvedSecurity, state.spec.securitySchemes);
      const placeholders = getAuthHeaderPlaceholder(operation.resolvedSecurity, state.spec.securitySchemes);
      const merged = { ...placeholders, ...authHeaders };
      for (const [headerName, headerValue] of Object.entries(merged)) {
        headersContainer.append(createHeaderRow(headerName, headerValue));
      }
    }
    for (const param of operation.parameters.filter((p) => p.in === 'header')) {
      headersContainer.append(createHeaderRow(param.name, String(param.example || '')));
    }
    const addHeaderBtn = createButton({
      variant: 'icon',
      icon: icons.plus,
      ariaLabel: 'Add header',
      className: 'field-copy-btn',
      onClick: () => headersContainer.append(createHeaderRow('', '')),
    });
    headersHeader.append(addHeaderBtn);
    headersSection.append(headersHeader, headersContainer);
    firstTabPanel.append(headersSection);
  }

  // Panels for languages (cURL, JavaScript, ...) — unified editor
  const initialParams = getCodeParams();
  const initialSnippets = generateSnippets(initialParams);
  const langEditor = createEditorPanel(
    initialSnippets[0]?.code ?? '',
    initialSnippets[0]?.language ?? 'bash',
  );
  const langPanel = h('div', { className: 'panel', 'data-tab': 'lang' });
  const codeExampleSection = h('div', { className: 'body-section' });
  const codeExampleHeader = h('div', { className: 'field-header' });
  codeExampleHeader.append(h('h3', { textContent: 'Code Example' }));
  const copyCodeBtn = createCopyButton({
    ariaLabel: 'Copy code',
    className: 'field-copy-btn',
    getText: () => langEditor.textarea.value,
  });
  codeExampleHeader.append(copyCodeBtn);
  codeExampleSection.append(codeExampleHeader, langEditor.wrap);
  langPanel.append(codeExampleSection);

  for (let i = 0; i < snippets.length; i++) {
    const sn = snippets[i];
    const tabBtn = createTab(sn.label, { active: !firstTabLabel && i === 0 });
    tabButtons.push(tabBtn);
  }

  header.append(tabsWrap);

  const allPanels: HTMLElement[] = firstTabLabel && firstTabPanel ? [firstTabPanel, langPanel] : [langPanel];

  const setPanelVisible = (panel: HTMLElement, visible: boolean): void => {
    if (!visible) {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = panel.classList.contains('is-request') ? 'flex' : 'block';
  };

  for (let i = 0; i < tabButtons.length; i++) {
    tabsWrap.append(tabButtons[i]);
    const idx = i;
    tabButtons[i].addEventListener('click', () => {
      tabButtons.forEach((t) => t.classList.remove('is-active'));
      tabButtons[idx].classList.add('is-active');
      activeTabIndex = idx;
      if (firstTabLabel) {
        if (firstTabPanel) setPanelVisible(firstTabPanel, idx === 0);
        setPanelVisible(langPanel, idx !== 0);
        if (idx > 0) updateSnippetsCode(langEditor, idx - 1);
      } else {
        setPanelVisible(langPanel, true);
        updateSnippetsCode(langEditor, idx);
      }
    });
  }

  const cardBody = h('div', { className: 'card-content flush' });
  const panelsContainer = h('div', { className: 'panels' });
  if (firstTabLabel) {
    if (firstTabPanel) setPanelVisible(firstTabPanel, true);
    setPanelVisible(langPanel, false);
  } else {
    setPanelVisible(langPanel, true);
  }
  panelsContainer.append(...allPanels);
  cardBody.append(panelsContainer);

  if (options?.onSendRequest) {
    const sendBtn = createButton({
      variant: 'primary',
      icon: icons.send,
      label: 'Send Request',
      className: 'send-btn',
    });
    sendBtn.addEventListener('click', () => options.onSendRequest!(sendBtn));
    if (firstTabLabel) {
      if (routePreviewEl) {
        firstTabPanel?.append(routePreviewEl);
      }
      const sendBtnWrap = h('div', { className: 'send-inline' });
      sendBtnWrap.append(sendBtn);
      firstTabPanel?.append(sendBtnWrap);
    } else {
      const sendBtnWrap = h('div', { className: 'send-bottom' });
      sendBtnWrap.append(sendBtn);
      cardBody.append(sendBtnWrap);
    }
  }
  if (!options?.onSendRequest && firstTabLabel && routePreviewEl) {
    firstTabPanel?.append(routePreviewEl);
  }

  if (hasRequestControls) sectionBody.append(requestControls);
  card.append(header, cardBody);
  sectionBody.append(card);

  const notify = () => {
    if (routePreviewInput) {
      routePreviewInput.value = collectRequestConfigImpl(tryItBody, operation).url;
    }
    onConfigChange?.(collectRequestConfigImpl(tryItBody, operation));
    if (activeTabIndex > 0 || !firstTabLabel) {
      updateSnippetsCode(langEditor, firstTabLabel ? activeTabIndex - 1 : activeTabIndex);
    }
  };
  tryItBody.addEventListener('input', notify);
  tryItBody.addEventListener('change', notify);
  notify();

  requestAnimationFrame(() => {
    const ta = tryItBody.querySelector('textarea[data-field="body"]') as HTMLTextAreaElement | null;
    if (ta) autoResizeTextarea(ta);
  });

  return section;
}

function getParamExampleValue(param: SpecParameter, fromSet?: string): string {
  if (fromSet !== undefined) return fromSet;
  if (param.example !== undefined && param.example !== null) return String(param.example);
  if (param.schema?.example !== undefined && param.schema.example !== null) return String(param.schema.example);
  if (param.schema?.default !== undefined && param.schema.default !== null) return String(param.schema.default);
  if (param.schema?.enum && param.schema.enum.length > 0) return String(param.schema.enum[0]);
  if (param.schema?.type === 'integer' || param.schema?.type === 'number') return '0';
  if (param.schema?.type === 'boolean') return 'true';
  return param.in === 'path' ? 'id' : 'value';
}

function applyParamValues(container: HTMLElement, values: Record<string, string>): void {
  const inputs = container.querySelectorAll('[data-param-name]') as NodeListOf<HTMLInputElement>;
  inputs.forEach((input) => {
    const name = input.getAttribute('data-param-name');
    if (name && values[name] !== undefined) input.value = values[name];
  });
}

function createParamInput(param: SpecParameter, initialValue?: string): HTMLElement {
  const wrapper = h('div', { className: `params row${param.required ? ' is-required' : ''}` });

  const label = h('span', {
    className: 'label',
    textContent: param.name,
  });

  if (param.required) {
    label.append(createBadge({ text: '*', kind: 'required', size: 's' }));
  }

  const schema = param.schema;
  let inputEl: HTMLElement;

  // Enum → select
  if (schema?.enum && schema.enum.length > 0) {
    const enumOptions = param.required
      ? schema.enum.map((val) => ({ value: String(val), label: String(val) }))
      : [{ value: '', label: '— select —' }, ...schema.enum.map((val) => ({ value: String(val), label: String(val) }))];

    const select = createSelect({
      options: enumOptions,
      value: getParamExampleValue(param, initialValue),
      dataAttrs: { paramName: param.name, paramIn: param.in },
    });
    inputEl = select;
  } else {
    // Determine input type
    const inputType = (schema?.type === 'integer' || schema?.type === 'number') ? 'number' : 'text';
    const input = createInput({
      type: inputType,
      placeholder: param.description || param.name,
      value: getParamExampleValue(param, initialValue),
      dataAttrs: { paramName: param.name, paramIn: param.in },
    });

    if (schema?.type === 'integer') input.setAttribute('step', '1');
    if (schema?.minimum !== undefined) input.setAttribute('min', String(schema.minimum));
    if (schema?.maximum !== undefined) input.setAttribute('max', String(schema.maximum));

    inputEl = input;
  }

  // Validation error placeholder
  const errorEl = createErrorPlaceholder(param.name);

  wrapper.append(label, inputEl, errorEl);
  return wrapper;
}

export function createHeaderRow(name: string, value: string): HTMLElement {
  const row = h('div', { className: 'header-row' });
  const nameInput = createInput({
    placeholder: 'Header name',
    value: name,
    dataAttrs: { headerName: 'true' },
  });
  const valueInput = createInput({
    placeholder: 'Value',
    value,
    dataAttrs: { headerValue: 'true' },
  });

  const removeBtn = createButton({
    variant: 'icon',
    icon: icons.close,
    ariaLabel: 'Remove header',
    className: 'header-remove-btn',
    onClick: () => row.remove(),
  });

  row.append(nameInput, valueInput, removeBtn);
  return row;
}

function collectRequestConfigImpl(container: HTMLElement, operation: SpecOperation): TryItConfig {
  const state = store.get();
  const baseUrl = getBaseUrl(state);

  // Collect path params
  const pathParamInputs = container.querySelectorAll('[data-param-in="path"]') as NodeListOf<HTMLInputElement>;
  const pathParams: Record<string, string> = {};
  pathParamInputs.forEach((input) => {
    pathParams[input.getAttribute('data-param-name')!] = input.value;
  });

  // Collect query params
  const queryParamInputs = container.querySelectorAll('[data-param-in="query"]') as NodeListOf<HTMLInputElement>;
  const queryParams: Record<string, string> = {};
  queryParamInputs.forEach((input) => {
    const name = input.getAttribute('data-param-name')!;
    if (input.value) queryParams[name] = input.value;
  });

  if (state.spec && hasOperationAuth(operation.resolvedSecurity)) {
    const authQuery = resolveAuthQuery(operation.resolvedSecurity, state.spec.securitySchemes);
    for (const [name, value] of Object.entries(authQuery)) {
      if (!(name in queryParams)) queryParams[name] = value;
    }
  }

  // Collect headers
  const headerRows = container.querySelectorAll('.header-row');
  const headers: Record<string, string> = {};
  headerRows.forEach((row) => {
    const nameInput = row.querySelector('[data-header-name]') as HTMLInputElement;
    const valueInput = row.querySelector('[data-header-value]') as HTMLInputElement;
    if (nameInput?.value && valueInput?.value) {
      headers[nameInput.value] = valueInput.value;
    }
  });

  if (state.spec && hasOperationAuth(operation.resolvedSecurity)) {
    const authCookies = resolveAuthCookies(operation.resolvedSecurity, state.spec.securitySchemes);
    const cookiePairs = Object.entries(authCookies).map(([name, value]) => `${name}=${value}`);
    if (cookiePairs.length > 0) {
      const existingCookie = headers.Cookie || headers.cookie || '';
      headers.Cookie = existingCookie ? `${existingCookie}; ${cookiePairs.join('; ')}` : cookiePairs.join('; ');
      delete headers.cookie;
    }
  }

  // Collect body — multipart or text
  const multipartWrap = container.querySelector('[data-field="multipart"]');
  let requestBody: string | FormData | undefined;

  if (multipartWrap) {
    const formData = new FormData();
    const fields = multipartWrap.querySelectorAll('[data-multipart-field]') as NodeListOf<HTMLInputElement>;
    fields.forEach((field) => {
      const fieldName = field.getAttribute('data-multipart-field')!;
      const fieldType = field.getAttribute('data-multipart-type');
      if (fieldType === 'file' && field.files && field.files.length > 0) {
        formData.append(fieldName, field.files[0]);
      } else if (fieldType === 'text' && field.value) {
        formData.append(fieldName, field.value);
      }
    });
    requestBody = formData;
    // Remove Content-Type header — browser sets it with boundary
    delete headers['Content-Type'];
  } else {
    const bodyTextarea = container.querySelector('[data-field="body"]') as HTMLTextAreaElement;
    requestBody = bodyTextarea?.value || undefined;
  }

  const url = buildRequestUrl(baseUrl, operation.path, pathParams, queryParams);

  return { method: operation.method, url, headers, body: requestBody };
}

function renderResponse(container: HTMLElement, response: TryItResponse): void {
  clear(container);

  const el = h('div', { className: 'card' });

  // One row in header: Body|Headers | meta | response code | Copy
  const header = h('div', { className: 'card-head response-header' });
  const bodyTab = createTab('Body', { active: true });
  const headersTab = createTab(`Headers (${Object.keys(response.headers).length})`);
  const tabs = h('div', { className: 'tabs tabs-code' });
  tabs.append(bodyTab, headersTab);

  const metaEl = h('div', {
    className: 'meta',
    innerHTML: `<span>${formatDuration(response.duration)}</span><span>${formatBytes(response.size)}</span>`,
  });
  const codeBadge = createBadge({
    text: String(response.status),
    kind: 'status',
    statusCode: String(response.status),
    size: 'm',
  });

  const copyBtn = createCopyButton({
    ariaLabel: 'Copy response',
    getText: () => response.body,
    onCopied: () => showCopyToast('Response copied'),
  });

  header.append(tabs, metaEl, codeBadge, copyBtn);
  el.append(header);

  // Body content — single mode, no Pretty/Raw
  const bodyWrapper = h('div', { className: 'card-content flush' });
  const bodyContent = h('div', { className: 'response-pane' });
  const bodyInner = h('div', { className: 'pane-inner' });
  const pre = h('pre', { className: 'code-display' });
  const codeEl = h('code', { className: 'hljs' });
  const displayText = formatResponseBody(response.body, true);
  codeEl.innerHTML = highlightCode(displayText, looksLikeJson(displayText) ? 'json' : '');
  pre.append(codeEl);
  bodyInner.append(pre);
  bodyContent.append(bodyInner);

  const headersContent = h('div', { className: 'response-pane', style: 'display:none' });
  const headersInner = h('div', { className: 'pane-inner' });
  const headersTextarea = h('textarea', {
    readonly: true,
    wrap: 'off',
    spellcheck: 'false',
  }) as HTMLTextAreaElement;
  headersTextarea.value = Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join('\n');
  autoResizeTextarea(headersTextarea);
  headersInner.append(headersTextarea);
  headersContent.append(headersInner);

  bodyWrapper.append(bodyContent, headersContent);
  el.append(bodyWrapper);

  bodyTab.addEventListener('click', () => {
    bodyTab.classList.add('is-active');
    headersTab.classList.remove('is-active');
    bodyContent.style.display = 'block';
    headersContent.style.display = 'none';
  });

  headersTab.addEventListener('click', () => {
    headersTab.classList.add('is-active');
    bodyTab.classList.remove('is-active');
    bodyContent.style.display = 'none';
    headersContent.style.display = 'block';
    requestAnimationFrame(() => autoResizeTextarea(headersTextarea));
  });

  container.append(el);
}

function formatResponseBody(body: string, pretty: boolean): string {
  if (!pretty) return body;
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function showCopyToast(message: string): void {
  const existing = document.querySelector('.copy-toast');
  if (existing) existing.remove();

  const toast = h('div', { className: 'copy-toast', textContent: message });
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2000);
}
