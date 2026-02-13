/**
 * Unified Card primitive.
 *
 * Структурная карточка: `.card` с `.card-header` и `.card-body`
 * Простая карточка: `.card-simple` для overview, servers, и т.д.
 */
import { createBadge } from './badge';

export interface CardProps {
  /** Если true — создаёт простую карточку (card-simple), иначе структурную (card) */
  simple?: boolean;
  /** Флаг интерактивности (добавляет card--interactive + hover-surface + focus-ring) */
  interactive?: boolean;
  /** Флаг активности (добавляет card-active) */
  active?: boolean;
  /** Дополнительные классы */
  className?: string;
  /** Обработчик клика */
  onClick?: (e: Event) => void;
}

/** Создаёт простую или структурную карточку */
export function createCard(props?: CardProps): HTMLElement {
  const { simple, interactive, active, className, onClick } = props || {};

  const el = document.createElement('div');
  const classes = [simple ? 'card-simple' : 'card'];
  if (interactive) classes.push('card--interactive', 'hover-surface', 'focus-ring');
  if (active) classes.push('card-active');
  if (className) classes.push(className);
  el.className = classes.join(' ');

  if (onClick) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', onClick);
  }

  return el;
}

/** Создаёт header для структурной карточки */
export function createCardHeader(...children: (HTMLElement | string)[]): HTMLElement {
  const header = document.createElement('div');
  header.className = 'card-header';
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

/** Создаёт body для структурной карточки */
export function createCardBody(variant?: 'default' | 'code' | 'no-padding'): HTMLElement {
  const body = document.createElement('div');
  const classes = ['card-body'];
  if (variant === 'code') classes.push('card-body--code');
  else if (variant === 'no-padding') classes.push('card-body--no-padding');
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
  row.className = `card-header-row${options.className ? ` ${options.className}` : ''}`;
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
