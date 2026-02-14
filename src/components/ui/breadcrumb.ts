import { h } from '../../lib/dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  className?: string;
  onClick?: (e: Event) => void;
}

export interface BreadcrumbOptions {
  className?: string;
  leading?: HTMLElement[];
  trailing?: HTMLElement[];
}

export function createBreadcrumb(
  items: BreadcrumbItem[],
  options?: BreadcrumbOptions,
): HTMLElement {
  const nav = h('nav', {
    className: `breadcrumb${options?.className ? ` ${options.className}` : ''}`,
    'aria-label': 'Breadcrumb',
  });
  const main = h('div', { className: 'breadcrumb-main' });

  if (options?.leading?.length) {
    main.append(...options.leading);
  }

  items.forEach((item, index) => {
    if (index > 0) {
      main.append(h('span', { className: 'breadcrumb-sep', textContent: '/' }));
    }
    if (item.href || item.onClick) {
      const link = h('a', {
        className: `breadcrumb-item${item.className ? ` ${item.className}` : ''}`,
        href: item.href || '#',
        textContent: item.label,
      });
      if (item.onClick) link.addEventListener('click', item.onClick);
      main.append(link);
      return;
    }
    main.append(h('span', {
      className: item.className || 'breadcrumb-segment',
      textContent: item.label,
    }));
  });
  nav.append(main);

  if (options?.trailing?.length) {
    nav.append(h('div', { className: 'breadcrumb-trailing' }, ...options.trailing));
  }

  return nav;
}
