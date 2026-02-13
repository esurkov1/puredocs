/**
 * Unified Button primitive.
 * Variants: 'primary' | 'secondary' | 'ghost' | 'icon'
 * Uses CSS classes: `.btn` + utility/modifier classes.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

export interface ButtonProps {
  variant?: ButtonVariant;
  label?: string;
  icon?: string;        // SVG string (innerHTML)
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  onClick?: (e: Event) => void;
}

const VARIANT_MODIFIERS: Record<ButtonVariant, string[]> = {
  primary: ['primary', 'm'],
  secondary: ['secondary', 'm'],
  ghost: ['s', 'u-text-muted'],
  icon: ['icon', 'm', 'u-text-muted'],
};

export function getButtonClasses(variant: ButtonVariant = 'secondary'): string[] {
  return ['btn', ...VARIANT_MODIFIERS[variant]];
}

export function createButton(props: ButtonProps): HTMLButtonElement {
  const { variant = 'secondary', label, icon, ariaLabel, disabled, className, onClick } = props;

  const el = document.createElement('button');
  el.type = 'button';

  const classes = getButtonClasses(variant);
  if (className) classes.push(...className.split(/\s+/).filter(Boolean));
  el.className = classes.join(' ');

  if (icon) {
    const span = document.createElement('span');
    span.className = 'btn-icon-slot';
    span.innerHTML = icon;
    el.appendChild(span);
  }

  if (label) {
    const text = document.createElement('span');
    text.textContent = label;
    el.appendChild(text);
  }

  if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
  if (disabled) el.disabled = true;

  if (onClick) {
    el.addEventListener('click', onClick);
  }

  return el;
}
