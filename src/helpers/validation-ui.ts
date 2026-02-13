import { h } from '../lib/dom';
import type { ValidationError } from '../core/validation';

export function clearValidationErrors(container: HTMLElement): void {
  container.querySelectorAll('.validation-error').forEach((el) => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  container.querySelectorAll('.invalid').forEach((el) => {
    el.classList.remove('invalid');
  });
}

export function showValidationErrors(container: HTMLElement, errors: ValidationError[]): void {
  for (const err of errors) {
    const errorEl = container.querySelector(`[data-error-for="${err.field}"]`);
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.add('visible');
    }
    if (err.kind === 'param') {
      const input = container.querySelector(`[data-param-name="${err.field}"]`) as HTMLElement | null;
      if (input) input.classList.add('invalid');
    } else if (err.kind === 'body') {
      const textarea = container.querySelector('[data-field="body"]') as HTMLElement | null;
      if (textarea) textarea.classList.add('invalid');
    }
  }
}

export function createErrorPlaceholder(field: string): HTMLElement {
  return h('span', { className: 'validation-error', 'data-error-for': field });
}
