import { h, clear } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { createButton, createInput } from '../ui';
import { createModalBase, type ModalBase } from './modal-base';
import type { OperationSecurityInfo, SecurityRequirement, SecurityScheme } from '../../core/types';
import {
  getOperationAuthHeaderPlaceholders,
  getSecuritySchemeBadge,
  resolveOperationAuth,
  resolveOperationSecurityInfo,
} from '../../core/security';

let modalBase: ModalBase | null = null;

function close() {
  if (modalBase) modalBase.close();
  modalBase = null;
}

/** Human-readable label for a security scheme */
function schemeLabel(scheme: SecurityScheme): string {
  if (scheme.type === 'http') {
    const s = (scheme.scheme || '').toLowerCase();
    if (s === 'bearer') return 'Bearer Token';
    if (s === 'basic') return 'Basic Auth';
    return `HTTP ${scheme.scheme || ''}`;
  }
  if (scheme.type === 'apiKey') {
    const loc = scheme.in === 'header' ? 'Header' : scheme.in === 'query' ? 'Query' : scheme.in === 'cookie' ? 'Cookie' : '';
    return `API Key (${loc}: ${scheme.name || '?'})`;
  }
  if (scheme.type === 'oauth2') return 'OAuth 2.0';
  if (scheme.type === 'openIdConnect') return 'OpenID Connect';
  return scheme.type;
}

/** Short type badge text */
function schemeBadge(scheme: SecurityScheme): string {
  return getSecuritySchemeBadge(scheme);
}

function focusNextFrame(input: HTMLInputElement): void {
  requestAnimationFrame(() => input.focus());
}

function createModalField(label: string, input: HTMLElement): HTMLElement {
  const row = h('div', { className: 'modal field' });
  row.append(h('label', { className: 'modal label', textContent: label }), input);
  return row;
}

function createModalTextInput(options: {
  placeholder: string;
  value: string;
  ariaLabel: string;
  type?: 'text' | 'password';
}): HTMLInputElement {
  return createInput({
    className: 'modal input',
    placeholder: options.placeholder,
    value: options.value,
    ariaLabel: options.ariaLabel,
    type: options.type,
  });
}

function decodeBasicAuth(value: string): { username: string; password: string } {
  if (!value) return { username: '', password: '' };
  try {
    const parts = atob(value).split(':');
    return {
      username: parts[0] || '',
      password: parts.slice(1).join(':') || '',
    };
  } catch {
    return { username: '', password: '' };
  }
}

/** Render input fields for a specific scheme type */
function renderSchemeFields(name: string, scheme: SecurityScheme, container: HTMLElement): void {
  clear(container);

  const currentValue = store.get().auth.schemes[name] || '';
  const type = scheme.type;
  const schemeLower = (scheme.scheme || '').toLowerCase();

  if (type === 'http' && schemeLower === 'bearer') {
    // Bearer token — single password input
    const row = h('div', { className: 'modal field' });
    const inputWrap = h('div', { className: 'modal input-wrap' });
    const input = createModalTextInput({
      placeholder: 'Bearer token...',
      value: currentValue,
      ariaLabel: 'Bearer token',
      type: 'password',
    });
    const toggleVis = createButton({
      variant: 'icon',
      icon: icons.key,
      ariaLabel: 'Show/Hide',
      className: 'l secondary u-text-muted',
      onClick: () => { input.type = input.type === 'password' ? 'text' : 'password'; },
    });
    input.addEventListener('input', () => store.setSchemeValue(name, input.value));
    inputWrap.append(input, toggleVis);
    row.append(h('label', { className: 'modal label', textContent: 'Token' }), inputWrap);
    container.append(row);
    focusNextFrame(input);
  } else if (type === 'http' && schemeLower === 'basic') {
    // Basic auth — username + password
    const credentials = decodeBasicAuth(currentValue);
    const userInput = createModalTextInput({
      placeholder: 'Username',
      value: credentials.username,
      ariaLabel: 'Username',
    });
    container.append(createModalField('Username', userInput));

    const passInput = createModalTextInput({
      placeholder: 'Password',
      value: credentials.password,
      ariaLabel: 'Password',
      type: 'password',
    });
    container.append(createModalField('Password', passInput));

    const updateBasic = () => {
      const encoded = btoa(`${userInput.value}:${passInput.value}`);
      store.setSchemeValue(name, encoded);
    };
    userInput.addEventListener('input', updateBasic);
    passInput.addEventListener('input', updateBasic);

    focusNextFrame(userInput);
  } else if (type === 'apiKey') {
    // API Key — single input
    const row = h('div', { className: 'modal field' });
    const inputWrap = h('div', { className: 'modal input-wrap' });
    const input = createModalTextInput({
      placeholder: `${scheme.name || 'API key'}...`,
      value: currentValue,
      ariaLabel: 'API key',
      type: 'password',
    });

    const toggleVis = createButton({
      variant: 'icon',
      icon: icons.key,
      ariaLabel: 'Show/Hide',
      className: 'l secondary u-text-muted',
      onClick: () => { input.type = input.type === 'password' ? 'text' : 'password'; },
    });

    input.addEventListener('input', () => {
      store.setSchemeValue(name, input.value);
    });

    inputWrap.append(input, toggleVis);
    row.append(h('label', { className: 'modal label', textContent: `API Key (${scheme.name || 'key'})` }), inputWrap);
    container.append(row);

    focusNextFrame(input);
  } else {
    // OAuth2 / OpenID / unknown — just show a token input as fallback
    const input = createModalTextInput({
      placeholder: 'Token...',
      value: currentValue,
      ariaLabel: 'Token',
      type: 'password',
    });

    input.addEventListener('input', () => {
      store.setSchemeValue(name, input.value);
    });

    container.append(createModalField('Token / Credential', input));
    focusNextFrame(input);
  }
}

/** Open authentication settings modal */
export function openAuthModal(
  securitySchemes: Record<string, SecurityScheme>,
  portalRoot?: HTMLElement,
  initialScheme?: string,
): void {
  if (modalBase) close();

  const schemes = Object.entries(securitySchemes);
  if (schemes.length === 0) return;

  const shell = createModalBase({
    overlayClass: 'modal overlay',
    modalClass: 'modal container',
    ariaLabel: 'Authentication Settings',
    dataOverlayAttr: 'data-auth-overlay',
    onClose: () => { modalBase = null; },
  });
  modalBase = shell;
  const modal = shell.modal;

  // Header
  const header = h('div', { className: 'modal header' });
  header.append(h('h2', { className: 'modal title', textContent: 'Authentication' }));
  const closeBtn = createButton({ variant: 'icon', icon: icons.close, ariaLabel: 'Close', onClick: close });
  header.append(closeBtn);
  modal.append(header);

  // Body
  const body = h('div', { className: 'modal body' });

  // Scheme tabs (if multiple)
  let selectedName = initialScheme || store.get().auth.activeScheme || schemes[0][0];
  // Ensure selectedName is valid
  if (!securitySchemes[selectedName]) selectedName = schemes[0][0];

  const fieldsContainer = h('div', { className: 'modal fields' });

  if (schemes.length > 1) {
    const tabs = h('div', { className: 'modal tabs' });

    const tabButtons: HTMLButtonElement[] = [];

    for (const [name, scheme] of schemes) {
      const isConfigured = !!(store.get().auth.schemes[name]);
      const tab = h('button', {
        type: 'button',
        className: 'modal tab',
        'aria-pressed': name === selectedName ? 'true' : 'false',
      }) as HTMLButtonElement;

      const tabLabel = h('span', { className: 'modal tab-label', textContent: schemeBadge(scheme) });
      tab.append(tabLabel);

      if (isConfigured) {
        const dot = h('span', { className: 'modal tab-dot', 'data-configured': 'true' });
        tab.append(dot);
      }

      tab.addEventListener('click', () => {
        if (selectedName === name) return;
        selectedName = name;
        for (const t of tabButtons) t.setAttribute('aria-pressed', 'false');
        tab.setAttribute('aria-pressed', 'true');
        updateDescription();
        renderSchemeFields(name, scheme, fieldsContainer);
      });

      tabButtons.push(tab);
      tabs.append(tab);
    }

    body.append(tabs);
  }

  // Scheme description
  const descEl = h('div', { className: 'modal scheme-desc' });
  function updateDescription() {
    const scheme = securitySchemes[selectedName];
    if (!scheme) return;
    clear(descEl);
    const title = h('div', { className: 'modal scheme-title', textContent: schemeLabel(scheme) });
    descEl.append(title);
    if (scheme.description) {
      descEl.append(h('div', { className: 'modal scheme-text', textContent: scheme.description }));
    }
  }
  updateDescription();
  body.append(descEl);

  // Fields
  const currentScheme = securitySchemes[selectedName];
  if (currentScheme) {
    renderSchemeFields(selectedName, currentScheme, fieldsContainer);
  }
  body.append(fieldsContainer);

  modal.append(body);

  // Footer
  const footer = h('div', { className: 'modal footer' });

  const clearBtn = createButton({
    variant: 'ghost',
    label: 'Reset',
    onClick: () => {
      store.setSchemeValue(selectedName, '');
      const scheme = securitySchemes[selectedName];
      if (scheme) renderSchemeFields(selectedName, scheme, fieldsContainer);
    },
  });

  const doneBtn = createButton({ variant: 'primary', label: 'Done', onClick: close });

  footer.append(clearBtn, h('div', { className: 'grow' }), doneBtn);
  modal.append(footer);

  shell.mount(portalRoot ?? document.querySelector('.root') ?? document.body);
}

/** Get human-readable configured scheme label for display */
export function getSchemeStatusLabel(name: string, scheme: SecurityScheme): string {
  const value = store.get().auth.schemes[name];
  if (!value) return 'Not configured';
  return `Configured ${schemeBadge(scheme)}`;
}

/** Check if a specific scheme is configured */
export function isSchemeConfigured(name: string): boolean {
  return !!(store.get().auth.schemes[name]);
}

/** Check if operation's auth requirements are satisfied (token/schemes configured) */
export function isOperationAuthConfigured(
  security: OperationSecurityInfo | SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): boolean {
  const info = toOperationSecurityInfo(security, securitySchemes);
  const auth = store.get().auth;
  const resolved = resolveOperationAuth(info, auth.schemes, auth.activeScheme, auth.token);
  return Object.keys(resolved.headers).length > 0 ||
    Object.keys(resolved.query).length > 0 ||
    Object.keys(resolved.cookies).length > 0;
}

/** Resolve auth headers for an operation's security requirements */
export function resolveAuthHeaders(
  security: OperationSecurityInfo | SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): Record<string, string> {
  const info = toOperationSecurityInfo(security, securitySchemes);
  const auth = store.get().auth;
  return resolveOperationAuth(info, auth.schemes, auth.activeScheme, auth.token).headers;
}

/** Resolve auth query params for an operation's security requirements */
export function resolveAuthQuery(
  security: OperationSecurityInfo | SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): Record<string, string> {
  const info = toOperationSecurityInfo(security, securitySchemes);
  const auth = store.get().auth;
  return resolveOperationAuth(info, auth.schemes, auth.activeScheme, auth.token).query;
}

/** Resolve auth cookie values for an operation's security requirements */
export function resolveAuthCookies(
  security: OperationSecurityInfo | SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): Record<string, string> {
  const info = toOperationSecurityInfo(security, securitySchemes);
  const auth = store.get().auth;
  return resolveOperationAuth(info, auth.schemes, auth.activeScheme, auth.token).cookies;
}

/** Get placeholder header value for display (when no token configured) */
export function getAuthHeaderPlaceholder(
  security: OperationSecurityInfo | SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): Record<string, string> {
  const info = toOperationSecurityInfo(security, securitySchemes);
  return getOperationAuthHeaderPlaceholders(info);
}

function toOperationSecurityInfo(
  security: OperationSecurityInfo | SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): OperationSecurityInfo | undefined {
  if (!security) return undefined;
  if (Array.isArray(security)) return resolveOperationSecurityInfo(security, securitySchemes, false);
  return security;
}
