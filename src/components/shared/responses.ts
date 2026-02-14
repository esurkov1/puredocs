import { h } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { renderSchemaBody } from './schema-viewer';
import { getSchemaTypeLabel } from '../../helpers/schema-utils';
import { createBadge } from '../ui';
import type { SpecMediaType, SpecResponseHeader, SchemaObject } from '../../core/types';

/* ─── Types ─── */

export interface CollapsibleCategoryOptions {
  title: string;
  content: HTMLElement;
  expanded?: boolean;
  trailing?: HTMLElement;
  counter?: number | string;
}

export interface SchemaBodyContent {
  content: HTMLElement;
  contentType: string;
  schemaType: string;
  itemsCount: number;
}

export interface ResponseTabData {
  body: SchemaBodyContent;
  headers: HTMLElement | null;
  headersCount: number;
}

/* ─── Schema Body Content ─── */

let collapsibleCategoryCounter = 0;

export function createSchemaBodyContent(contentType: string, mediaType: SpecMediaType | undefined, emptyText: string): SchemaBodyContent {
  if (mediaType?.schema) {
    const result = renderSchemaBody(mediaType.schema);
    return {
      content: result.body,
      contentType,
      schemaType: getSchemaTypeLabel(mediaType.schema),
      itemsCount: getSchemaTopLevelCount(mediaType.schema),
    };
  }

  const schemaContainer = h('div', { className: 'schema' });
  const schemaBody = h('div', { className: 'body schema-body-plain' });
  schemaBody.append(h('p', { textContent: emptyText }));
  schemaContainer.append(schemaBody);

  return {
    content: schemaContainer,
    contentType,
    schemaType: 'plain',
    itemsCount: 1,
  };
}

export function createBodyCategoryTrailing(body: SchemaBodyContent): HTMLElement {
  const trailing = h('span', { className: 'schema-content-meta' });
  trailing.append(
    createBadge({ text: body.contentType, kind: 'chip', size: 's', mono: true }),
    createBadge({ text: body.schemaType, kind: 'chip', color: 'primary', size: 's', mono: true }),
  );
  return trailing;
}

export function getSchemaTopLevelCount(schema: SchemaObject): number {
  let count = 0;
  if (schema.properties) count += Object.keys(schema.properties).length;
  if (schema.type === 'array' && schema.items) count += 1;
  if (Array.isArray(schema.allOf)) count += schema.allOf.length;
  if (Array.isArray(schema.oneOf)) count += schema.oneOf.length;
  if (Array.isArray(schema.anyOf)) count += schema.anyOf.length;
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') count += 1;
  return Math.max(count, 1);
}

/* ─── Collapsible Category ─── */

export function createCollapsibleCategory(options: CollapsibleCategoryOptions): { root: HTMLElement } {
  const categoryId = `collapsible-category-${collapsibleCategoryCounter++}`;
  const root = h('div', { className: 'collapsible-category' });
  const title = h('span', { className: 'collapsible-category-title', textContent: options.title });
  const meta = h('span', { className: 'collapsible-category-meta' });
  if (options.trailing) {
    meta.append(h('span', { className: 'collapsible-category-trailing' }, options.trailing));
  }
  const controls = h('span', { className: 'collapsible-category-controls' });
  if (options.counter !== undefined) {
    controls.append(createBadge({ text: String(options.counter), kind: 'chip', size: 's', mono: true }));
  }
  const chevron = h('span', { className: 'collapsible-category-chevron', innerHTML: icons.chevronDown });
  controls.append(chevron);
  meta.append(controls);

  const toggle = h('button', {
    className: 'collapsible-category-toggle focus-ring',
    type: 'button',
    'aria-expanded': 'true',
    'aria-controls': categoryId,
  }, title, meta);

  const content = h('div', {
    id: categoryId,
    className: 'collapsible-category-content',
  });
  content.append(options.content);

  const setExpanded = (expanded: boolean) => {
    root.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    content.hidden = !expanded;
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  setExpanded(options.expanded !== false);
  root.append(toggle, content);
  return { root };
}

/* ─── Response Headers ─── */

export function renderResponseHeadersList(headers: Record<string, SpecResponseHeader>): HTMLElement | null {
  const entries = Object.entries(headers);
  if (entries.length === 0) return null;

  const rowsEl = entries.map(([name, hdr]) => {
    const typeLabel = hdr.schema ? getSchemaTypeLabel(hdr.schema) : 'string';
    const value = hdr.example !== undefined
      ? String(hdr.example)
      : (hdr.schema?.example !== undefined ? String(hdr.schema.example) : '—');

    const row = h('div', { className: 'schema-row role-flat role-headers' });
    const mainRow = h('div', { className: 'schema-main-row' });

    const nameWrap = h('div', { className: 'schema-name-wrapper' });
    nameWrap.append(
      h('span', { className: 'schema-spacer' }),
      h('span', { textContent: name }),
    );

    const metaWrap = h('div', { className: 'schema-meta-wrapper' });
    metaWrap.append(createBadge({ text: typeLabel, kind: 'chip', color: 'primary', size: 'm', mono: true }));
    if (hdr.required) {
      metaWrap.append(createBadge({ text: 'required', kind: 'required', size: 'm' }));
    }

    mainRow.append(nameWrap, metaWrap);
    row.append(mainRow);

    const descCol = h('div', { className: 'schema-desc-col is-root' });
    if (hdr.description) {
      descCol.append(h('p', { textContent: hdr.description }));
    }
    const valueWrap = h('div', { className: 'schema-enum-values' });
    valueWrap.append(createBadge({
      text: value,
      kind: 'chip',
      size: 's',
      mono: true,
    }));
    descCol.append(valueWrap);
    if (descCol.children.length > 0) {
      row.append(descCol);
    }
    return row;
  });

  const wrap = h('div', { className: 'params' });
  const body = h('div', { className: 'body role-headers' });
  body.append(...rowsEl);
  wrap.append(body);
  return wrap;
}

/* ─── Response Categories (Headers + Body collapsible) ─── */

export function renderResponseCategories(data: ResponseTabData): HTMLElement {
  const categories = h('div', { className: 'collapsible-categories' });
  if (data.headers) {
    const headersCategory = createCollapsibleCategory({
      title: 'Headers',
      content: data.headers,
      counter: data.headersCount,
    });
    categories.append(headersCategory.root);
  }
  const bodyCategory = createCollapsibleCategory({
    title: 'Body',
    content: data.body.content,
    trailing: createBodyCategoryTrailing(data.body),
    counter: data.body.itemsCount,
  });
  categories.append(bodyCategory.root);
  return categories;
}
