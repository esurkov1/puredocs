/**
 * Unified Select primitive.
 * Base styles — by select tag (forms.css).
 * variant: inline → data-variant="inline"
 */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  ariaLabel?: string;
  onChange?: (value: string) => void;
  className?: string;
  variant?: 'default' | 'inline';
  invalid?: boolean;
  dataAttrs?: Record<string, string>;
}

export function createSelect(props: SelectProps): HTMLSelectElement {
  const { options, value, ariaLabel, onChange, className, variant = 'default', invalid, dataAttrs } = props;

  const el = document.createElement('select');
  if (variant === 'inline') el.setAttribute('data-variant', 'inline');
  const classes: string[] = [];
  if (invalid) classes.push('invalid');
  if (className) classes.push(className);
  el.className = classes.join(' ');

  if (ariaLabel) el.setAttribute('aria-label', ariaLabel);

  if (dataAttrs) {
    for (const [k, v] of Object.entries(dataAttrs)) {
      el.dataset[k] = v;
    }
  }

  for (const opt of options) {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    if (value !== undefined && opt.value === value) o.selected = true;
    el.appendChild(o);
  }

  if (onChange) {
    el.addEventListener('change', () => onChange(el.value));
  }

  return el;
}
