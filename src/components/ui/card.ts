/**
 * Unified Card primitive.
 *
 * Structural card: `.card` with `.card-head` and `.card-content`
 * Simple card: `.card.simple` for overview, servers, etc.
 */
import { createBadge } from './badge';

export interface CardProps {
  /** If true — creates a simple card (`.card.simple`), otherwise structural (`.card`) */
  simple?: boolean;
  /** Interactive flag (adds interactive) */
  interactive?: boolean;
  /** Active flag (adds active) */
  active?: boolean;
  /** Additional classes */
  className?: string;
  /** Click handler */
  onClick?: (e: Event) => void;
}

/** Creates a simple or structural card */
export function createCard(props?: CardProps): HTMLElement {
  const { simple, interactive, active, className, onClick } = props || {};

  const el = document.createElement('div');
  const classes = ['card'];
  if (simple) classes.push('simple');
  if (interactive) classes.push('interactive');
  if (active) classes.push('active');
  if (className) classes.push(className);
  el.className = classes.join(' ');

  if (onClick) {
    if (!el.classList.contains('interactive')) {
      el.classList.add('interactive');
    }
    el.addEventListener('click', onClick);
  }

  return el;
}

/** Creates header for structural card */
export function createCardHeader(...children: (HTMLElement | string)[]): HTMLElement {
  const header = document.createElement('div');
  header.className = 'card-head';
  for (const child of children) {
    if (typeof child === 'string') {
      const span = document.createElement('span');
      span.textContent = child;
      header.append(span);
    } else {
      header.append(child);
    }
  }
  return header;
}

/** Creates body for structural card */
export function createCardBody(variant?: 'default' | 'code' | 'no-padding'): HTMLElement {
  const body = document.createElement('div');
  const classes = ['card-content'];
  if (variant === 'code') classes.push('code');
  else if (variant === 'no-padding') classes.push('flush');
  body.className = classes.join(' ');
  return body;
}

export interface CardHeaderRowOptions {
  title: string | HTMLElement;
  leading?: HTMLElement | string;
  trailing?: HTMLElement | string | number;
  className?: string;
}

function normalizeNode(node: HTMLElement | string | number): HTMLElement {
  if (typeof node === 'string' || typeof node === 'number') {
    const span = document.createElement('span');
    span.textContent = String(node);
    return span;
  }
  return node;
}

export function createCardHeaderRow(options: CardHeaderRowOptions): HTMLElement {
  const row = document.createElement('div');
  row.className = `card-row${options.className ? ` ${options.className}` : ''}`;
  if (options.leading !== undefined) row.append(normalizeNode(options.leading));
  row.append(typeof options.title === 'string'
    ? Object.assign(document.createElement('h3'), { textContent: options.title })
    : options.title);
  if (options.trailing !== undefined) {
    const trailingEl =
      typeof options.trailing === 'string' || typeof options.trailing === 'number'
        ? createBadge({ text: String(options.trailing), kind: 'chip', size: 'm', mono: true })
        : normalizeNode(options.trailing);
    row.append(trailingEl);
  }
  return row;
}
