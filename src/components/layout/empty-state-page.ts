import { h } from '../../lib/dom';

export interface EmptyStateOptions {
  title: string;
  message?: string;
  icon?: string;
  variant?: 'loading' | 'error' | 'empty';
}

/**
 * Helper for loading/error/empty pages.
 * Returns ready page for render(pageSlotEl, createEmptyStatePage(...)).
 */
export function createEmptyStatePage(opts: EmptyStateOptions): HTMLElement {
  const { title, message, icon, variant = 'empty' } = opts;
  if (variant === 'loading') {
    return h('div', { className: 'block header' },
      h('h2', { textContent: title }),
      h('div', { className: 'loading' },
        h('div', { className: 'spinner' }),
        h('span', null, message || title),
      ),
    );
  }

  const header = h('div', { className: 'block header' });
  if (icon) {
    header.append(h('span', { innerHTML: icon, className: 'icon-muted' }));
  }
  header.append(h('h2', { textContent: title }));
  if (message) {
    header.append(h('p', { className: 'error-message', textContent: message }));
  }
  return header;
}
