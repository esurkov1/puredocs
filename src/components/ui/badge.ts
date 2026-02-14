export type BadgeSize = 's' | 'm' | 'l';
export type BadgeKind = 'method' | 'status' | 'webhook' | 'required' | 'chip';
export type BadgeColor = 'default' | 'transparent' | 'primary' | 'green' | 'blue' | 'orange' | 'purple' | 'red';

export interface BadgeProps {
  text: string;
  kind?: BadgeKind;
  color?: BadgeColor;
  size?: BadgeSize;
  /** @deprecated All badges are monospace by default. */
  mono?: boolean;
  className?: string;
  method?: string;
  statusCode?: string;
}

function colorClass(color: BadgeColor): string {
  if (color === 'default' || color === 'transparent') return 'u-text-muted';
  if (color === 'primary') return 'u-text-accent';
  return `u-text-${color}`;
}

function bgClass(color: BadgeColor): string {
  if (color === 'default') return 'u-bg-surface-hover';
  if (color === 'transparent') return 'u-bg-transparent';
  if (color === 'primary') return 'u-bg-accent-soft';
  return `u-bg-${color}-soft`;
}

function getMethodColor(method: string): BadgeColor {
  const m = method.toLowerCase();
  if (m === 'get') return 'green';
  if (m === 'post') return 'blue';
  if (m === 'put' || m === 'patch') return 'orange';
  if (m === 'delete') return 'red';
  return 'default';
}

function getStatusColor(code: string): BadgeColor {
  const normalized = code.trim();
  if (normalized.startsWith('2')) return 'green';
  if (normalized.startsWith('3')) return 'blue';
  if (normalized.startsWith('4')) return 'orange';
  if (normalized.startsWith('5')) return 'red';
  return 'default';
}

function resolveColor(props: BadgeProps, kind: BadgeKind): BadgeColor {
  if (props.color) return props.color;
  if (kind === 'method') return getMethodColor(props.method || props.text);
  if (kind === 'status') return getStatusColor(props.statusCode || props.text);
  if (kind === 'webhook') return 'purple';
  if (kind === 'required') return 'orange';
  return 'default';
}

/** Unified Badge primitive (`.badge` + kind + size + optional modifiers). */
export function createBadge(props: BadgeProps): HTMLElement {
  const el = document.createElement('span');
  const kind = props.kind || 'chip';
  const color = resolveColor(props, kind);
  const size = props.size || 'm';
  const classes = ['badge', size];

  if (kind === 'status') classes.push('status');
  if (kind === 'required') classes.push('required');

  classes.push(colorClass(color), bgClass(color));

  if (props.className) classes.push(props.className);
  el.className = classes.join(' ');
  el.textContent = props.text;
  return el;
}

/** Tab button based on badge. Used for Body/Headers, Code Example, etc. */
export function createTab(text: string, options?: { active?: boolean; context?: boolean }): HTMLButtonElement {
  const active = options?.active ?? false;
  const context = options?.context ?? false;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `badge m interactive${active ? ' is-active' : ''}`;
  if (context) btn.dataset.badgeContext = 'true';
  btn.textContent = text;
  return btn;
}

/** Tab button with response code (200, 404, etc.). Inherits badge + status styles. */
export function createResponseCodeTab(code: string, active = false): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  const color = getStatusColor(code);
  const classes = ['badge', 'status', 'm', 'interactive', colorClass(color)];
  if (active) classes.push('is-active', bgClass(color));
  btn.className = classes.join(' ');
  btn.dataset.badgeGroup = 'response-code';
  btn.dataset.badgeColor = color;
  btn.textContent = code;
  return btn;
}

export function setResponseCodeTabActive(btn: HTMLElement, active: boolean): void {
  btn.classList.remove(
    'u-bg-surface-hover',
    'u-bg-transparent',
    'u-bg-green-soft',
    'u-bg-blue-soft',
    'u-bg-orange-soft',
    'u-bg-purple-soft',
    'u-bg-red-soft',
  );
  btn.classList.toggle('is-active', active);
  if (!active) return;
  const color = (btn.dataset.badgeColor as BadgeColor | undefined) || 'default';
  btn.classList.add(bgClass(color));
}
