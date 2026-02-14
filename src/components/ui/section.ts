import { h } from '../../lib/dom';
import { createBadge } from './badge';

export interface SectionOptions {
  title?: string;
  titleEl?: HTMLElement;
  badge?: string | number | HTMLElement;
  className?: string;
}

function normalizeChild(child: HTMLElement | string): HTMLElement {
  return typeof child === 'string' ? h('span', { textContent: child }) : child;
}

function createSectionTitle(title: string): HTMLElement {
  return h('h2', { textContent: title });
}

export function createSectionTitleWrap(title: string | HTMLElement, badge?: string | number | HTMLElement): HTMLElement {
  const wrap = h('div', { className: 'section-head' });
  wrap.append(typeof title === 'string' ? createSectionTitle(title) : title);
  if (badge !== undefined) {
    wrap.append(typeof badge === 'string' || typeof badge === 'number'
      ? createBadge({ text: String(badge), kind: 'chip', size: 'm' })
      : badge);
  }
  return wrap;
}

export function createSection(options: SectionOptions, ...children: (HTMLElement | string)[]): HTMLElement {
  const section = h('div', { className: `block section${options.className ? ` ${options.className}` : ''}` });
  if (options.titleEl) {
    section.append(options.titleEl);
  } else if (options.title) {
    if (options.badge !== undefined) {
      section.append(createSectionTitleWrap(options.title, options.badge));
    } else {
      section.append(createSectionTitle(options.title));
    }
  }
  for (const child of children) section.append(normalizeChild(child));
  return section;
}
