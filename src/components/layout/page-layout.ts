import { h } from '../../lib/dom';

export interface ContentAreaLayout {
  page: HTMLElement;
  main: HTMLElement;
  aside: HTMLElement;
}

/** Layout: page (main + aside). */
export function createContentArea(): ContentAreaLayout {
  const page = h('div', { className: 'page' });
  const mainPane = h('div', {
    className: 'main',
    role: 'main',
  });
  const main = h('div', { className: 'content' });
  mainPane.append(main);

  const asidePane = h('div', {
    className: 'aside',
    'aria-label': 'Panel',
  });
  const aside = h('div', { className: 'content' });
  asidePane.append(aside);
  asidePane.hidden = true;

  page.append(mainPane, asidePane);
  return { page, main, aside };
}

/** Включить/выключить aside в page layout. */
export function setContentAreaAside(page: HTMLElement, hasAside: boolean): void {
  const aside = page.querySelector('.aside') as HTMLElement | null;
  if (aside) aside.hidden = !hasAside;
}
