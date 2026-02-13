import { copyToClipboard } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { createButton } from '../ui';

const COPY_FEEDBACK_MS = 1500;

export interface CopyButtonOptions {
  getText: () => string | Promise<string>;
  ariaLabel?: string;
  copiedAriaLabel?: string;
  className?: string;
  onCopied?: () => void;
}

/**
 * Shared icon button with copy/check feedback.
 * Keeps copy interaction consistent across endpoint/try-it panels.
 */
export function createCopyButton(options: CopyButtonOptions): HTMLButtonElement {
  const ariaLabel = options.ariaLabel || 'Copy';
  const copiedAriaLabel = options.copiedAriaLabel || 'Copied';

  const btn = createButton({
    variant: 'icon',
    icon: icons.copy,
    ariaLabel,
    className: options.className,
    onClick: async () => {
      const text = await options.getText();
      await copyToClipboard(text);
      btn.innerHTML = icons.check;
      btn.setAttribute('aria-label', copiedAriaLabel);
      options.onCopied?.();
      setTimeout(() => {
        btn.innerHTML = icons.copy;
        btn.setAttribute('aria-label', ariaLabel);
      }, COPY_FEEDBACK_MS);
    },
  });
  return btn;
}
