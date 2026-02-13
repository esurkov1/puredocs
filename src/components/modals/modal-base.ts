import { h } from '../../lib/dom';

export interface ModalBaseOptions {
  overlayClass: string;
  modalClass: string;
  role?: string;
  ariaLabel: string;
  dataOverlayAttr: string;
  onClose?: () => void;
}

export interface ModalBase {
  overlay: HTMLElement;
  modal: HTMLElement;
  mount: (target?: ParentNode | null) => void;
  close: () => void;
}

export function createModalBase(options: ModalBaseOptions): ModalBase {
  const overlay = h('div', { className: options.overlayClass });
  overlay.setAttribute(options.dataOverlayAttr, 'true');
  const modal = h('div', {
    className: options.modalClass,
    role: options.role || 'dialog',
    'aria-label': options.ariaLabel,
    'aria-modal': 'true',
  });
  overlay.append(modal);

  const close = () => {
    overlay.remove();
    options.onClose?.();
  };

  overlay.addEventListener('click', (event: Event) => {
    if (event.target === overlay) close();
  });
  overlay.addEventListener('keydown', (event: Event) => {
    if ((event as KeyboardEvent).key === 'Escape') {
      event.preventDefault();
      close();
    }
  }, true);

  return {
    overlay,
    modal,
    mount: (target?: ParentNode | null) => {
      (target || document.querySelector('.root') || document.body).appendChild(overlay);
    },
    close,
  };
}
