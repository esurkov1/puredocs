/**
 * Lightweight DOM helper utilities.
 * No virtual DOM — direct, efficient DOM manipulation.
 */
import { escapeHtml as escapeHtmlImpl, markdownToHtml } from '../helpers/text';

type Attrs = Record<string, string | boolean | number | EventListener | undefined>;
type Child = HTMLElement | SVGElement | string | null | undefined | false;

/** Create an HTML element with attributes and children */
export function h(tag: string, attrs?: Attrs | null, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === false) continue;
      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      } else if (key === 'className') {
        el.className = String(value);
      } else if (key === 'innerHTML') {
        el.innerHTML = String(value);
      } else if (key === 'textContent') {
        el.textContent = String(value);
      } else if (value === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

/** Clear all children of an element */
export function clear(el: HTMLElement): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Replace all children of a container */
export function render(container: HTMLElement, ...children: Child[]): void {
  clear(container);
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string') {
      container.appendChild(document.createTextNode(child));
    } else {
      container.appendChild(child);
    }
  }
}

/** Escape HTML to prevent XSS */
export function escapeHtml(str: string): string {
  return escapeHtmlImpl(str);
}

/** Render markdown description as safe HTML block (no external deps) */
export function markdownBlock(md: string, className = 'description md-content'): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  el.innerHTML = markdownToHtml(md);
  return el;
}

/** Copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

/** Format bytes to human readable */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
}

/** Format duration in ms to human readable */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
