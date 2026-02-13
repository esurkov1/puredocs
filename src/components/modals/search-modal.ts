import { h, clear } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { store } from '../../core/state';
import { search } from '../../core/search';
import { navigate, buildPath } from '../../core/router';
import { createBadge, createInput } from '../ui';
import { createModalBase, type ModalBase } from './modal-base';
import { isOperationAuthConfigured } from './auth-modal';
import type { SearchEntry } from '../../core/types';

let focusedIndex = -1;
let modalBase: ModalBase | null = null;
let shortcutHandler: ((event: KeyboardEvent) => void) | null = null;

/** Render and show the search modal */
export function showSearchModal(): void {
  // Close existing
  closeSearchModal();

  const shell = createModalBase({
    overlayClass: 'modal overlay search-modal-overlay',
    modalClass: 'modal container search-modal',
    ariaLabel: 'Search API',
    dataOverlayAttr: 'data-search-overlay',
    onClose: () => {
      modalBase = null;
      store.set({ searchOpen: false });
    },
  });
  modalBase = shell;
  const modal = shell.modal;

  // Input
  const inputWrap = h('div', { className: 'search-input-wrap' });
  inputWrap.innerHTML = icons.search;
  const input = createInput({
    className: 'search-input',
    placeholder: 'Search endpoints, schemas...',
    ariaLabel: 'Search',
  });
  const escHint = h('kbd', { textContent: 'ESC', className: 'kbd' });
  inputWrap.append(input, escHint);
  modal.append(inputWrap);

  // Results
  const results = h('div', { className: 'search-results', role: 'listbox' });
  const empty = h('div', { className: 'search-empty', textContent: 'Type to search across endpoints and schemas' });
  results.append(empty);
  modal.append(results);

  // Footer
  const footer = h('div', { className: 'search-footer' });
  footer.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>';
  modal.append(footer);

  // Mount внутри root для наследования CSS-переменных темы
  shell.mount(document.querySelector('.root') ?? document.body);

  // Focus input
  requestAnimationFrame(() => input.focus());
  focusedIndex = -1;

  // Search handler
  let currentResults: SearchEntry[] = [];
  input.addEventListener('input', () => {
    const query = input.value;
    currentResults = search(query);
    focusedIndex = currentResults.length > 0 ? 0 : -1;
    renderResults(results, currentResults, focusedIndex);
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'ArrowDown') {
      ke.preventDefault();
      if (currentResults.length > 0) {
        focusedIndex = Math.min(focusedIndex + 1, currentResults.length - 1);
        renderResults(results, currentResults, focusedIndex);
      }
    } else if (ke.key === 'ArrowUp') {
      ke.preventDefault();
      if (currentResults.length > 0) {
        focusedIndex = Math.max(focusedIndex - 1, 0);
        renderResults(results, currentResults, focusedIndex);
      }
    } else if (ke.key === 'Enter') {
      ke.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < currentResults.length) {
        selectResult(currentResults[focusedIndex]);
      }
    } else if (ke.key === 'Escape') {
      ke.preventDefault();
      closeSearchModal();
    }
  });

  shell.overlay.addEventListener('keydown', (e: Event) => {
    if ((e as KeyboardEvent).key === 'Escape') {
      e.preventDefault();
      closeSearchModal();
    }
  });
}

/** Close the search modal */
export function closeSearchModal(): void {
  if (modalBase) {
    modalBase.close();
    return;
  }
  const overlay = document.querySelector('[data-search-overlay]');
  if (overlay) overlay.remove();
  store.set({ searchOpen: false });
}

function renderResults(container: HTMLElement, results: SearchEntry[], focused: number): void {
  clear(container);

  if (results.length === 0) {
    container.append(h('div', { className: 'search-empty', textContent: 'No results found' }));
    return;
  }

  results.forEach((entry, i) => {
    const item = h('div', {
      className: `search-result${i === focused ? ' focused' : ''}`,
      role: 'option',
      'aria-selected': i === focused ? 'true' : 'false',
    });

    if (entry.method) {
      item.append(createBadge({
        text: entry.method.toUpperCase(),
        kind: 'method',
        method: entry.method,
        mono: true,
      }));
    } else if (entry.type === 'schema') {
      item.append(createBadge({ text: 'SCH', kind: 'chip', size: 'm', mono: true }));
    } else if (entry.type === 'tag') {
      item.append(createBadge({ text: 'TAG', kind: 'chip', size: 'm', mono: true }));
    }

    const info = h('div', { className: 'search-result-info min-w-0' });
    info.append(h('span', { className: 'search-result-title', textContent: entry.title }));
    if (entry.subtitle) {
      info.append(h('span', { className: 'search-result-subtitle', textContent: entry.subtitle }));
    }
    item.append(info);
    if (entry.method && entry.requiresAuth && entry.resolvedSecurity) {
      const spec = store.get().spec;
      const configured = isOperationAuthConfigured(entry.resolvedSecurity, spec?.securitySchemes || {});
      item.append(h('span', {
        className: `search-result-lock search-result-lock--${configured ? 'configured' : 'required'}`,
        innerHTML: configured ? icons.unlock : icons.lock,
        title: entry.authTitle || 'Requires authentication',
        'aria-label': entry.authTitle || 'Requires authentication',
      }));
    }

    item.addEventListener('click', () => selectResult(entry));
    item.addEventListener('mouseenter', () => {
      focusedIndex = i;
      container.querySelectorAll('.focused').forEach((el) => el.classList.remove('focused'));
      item.classList.add('focused');
    });

    container.append(item);
  });

  // Scroll focused into view
  const focusedEl = container.querySelector('.focused');
  if (focusedEl) {
    focusedEl.scrollIntoView({ block: 'nearest' });
  }
}

function selectResult(entry: SearchEntry): void {
  closeSearchModal();

  if (entry.type === 'operation') {
    navigate(buildPath({
      type: 'endpoint',
      tag: entry.tag || 'default',
      method: entry.method!,
      path: entry.path!,
      operationId: entry.operationId,
    }));
  } else if (entry.type === 'schema') {
    navigate(buildPath({ type: 'schema', schemaName: entry.schemaName! }));
  } else if (entry.type === 'tag' && entry.tag) {
    navigate(buildPath({ type: 'tag', tag: entry.tag }));
  } else if (entry.type === 'webhook' && entry.webhookName) {
    navigate(buildPath({ type: 'webhook', webhookName: entry.webhookName }));
  }
}

/** Setup global keyboard shortcut for search */
export function setupSearchShortcut(): () => void {
  if (shortcutHandler) {
    document.removeEventListener('keydown', shortcutHandler);
  }

  shortcutHandler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const state = store.get();
      if (state.searchOpen) {
        closeSearchModal();
      } else {
        store.set({ searchOpen: true });
        showSearchModal();
      }
    }
  };

  document.addEventListener('keydown', shortcutHandler);

  return () => {
    if (shortcutHandler) {
      document.removeEventListener('keydown', shortcutHandler);
      shortcutHandler = null;
    }
  };
}
