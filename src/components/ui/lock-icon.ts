import { h } from '../../lib/dom';
import { icons } from '../../lib/icons';

export interface CreateLockIconOptions {
  configured: boolean;
  variant?: 'tag' | 'nav' | 'endpoint';
  title?: string;
}

/** Общая фабрика для lock/unlock иконок в навигации, карточках и endpoint */
export function createLockIcon(options: CreateLockIconOptions): HTMLElement {
  const { configured, variant = 'tag', title } = options;
  const iconHtml = configured ? icons.unlock : icons.lock;

  const baseClass = variant === 'tag' ? 'tag-op-lock'
    : variant === 'nav' ? 'nav-item-lock'
    : 'endpoint-auth-icon';

  const mod = variant !== 'endpoint' ? ` ${baseClass}--${configured ? 'configured' : 'required'}` : '';

  return h('span', {
    className: `${baseClass}${mod}`.trim(),
    innerHTML: iconHtml,
    ...(title ? { title, 'aria-label': title } : {}),
  });
}
