/**
 * Unified Input primitive.
 * Base styles — by input tag (forms.css).
 */

export type InputModifier = 'filled' | 'invalid';

export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  ariaLabel?: string;
  required?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  modifiers?: InputModifier[];
  dataAttrs?: Record<string, string>;
  className?: string;
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
}

export function createInput(props: InputProps): HTMLInputElement {
  const {
    type = 'text',
    placeholder,
    value,
    ariaLabel,
    required,
    readOnly,
    invalid,
    modifiers,
    dataAttrs,
    className,
    onInput,
    onChange,
  } = props;

  const el = document.createElement('input');
  el.type = type;
  el.setAttribute('autocomplete', 'off');
  const classes: string[] = [];
  if (modifiers?.includes('filled')) classes.push('filled');
  if (invalid) classes.push('invalid');
  if (className) classes.push(className);
  el.className = classes.join(' ');

  if (placeholder) el.placeholder = placeholder;
  if (value !== undefined) el.value = value;
  if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
  if (required) el.required = true;
  if (readOnly) el.readOnly = true;

  if (dataAttrs) {
    for (const [k, v] of Object.entries(dataAttrs)) {
      el.dataset[k] = v;
    }
  }

  if (onInput) {
    el.addEventListener('input', () => onInput(el.value));
  }
  if (onChange) {
    el.addEventListener('change', () => onChange(el.value));
  }

  return el;
}
