import { h, markdownBlock } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { createBadge, createCard, createCardHeader, createCardBody, createCardHeaderRow } from '../ui';
import { getSchemaTypeLabel } from '../../helpers/schema-utils';
import type { SchemaObject, SpecParameter } from '../../core/types';

type RowData = { row: HTMLElement; children: HTMLElement }[];

export interface SchemaBodyResult {
  body: HTMLElement;
  toggleCollapse: () => void;
  isExpanded: () => boolean;
  hasExpandable: boolean;
}

/** Render only the schema tree body (no card wrapper). For custom headers (e.g. Responses). */
export function renderSchemaBody(schema: SchemaObject): SchemaBodyResult {
  const container = h('div', { className: 'schema' });
  const body = h('div', { className: 'body' });
  container.append(body);
  const rowData: RowData = [];
  renderSchemaNode(body, schema, '', 0, new Set(), rowData);
  const hasExpandable = rowData.length > 0;
  const isExpanded = () => rowData.some(({ children }) => children.style.display !== 'none');
  const toggleCollapse = () => {
    const nextExpanded = !isExpanded();
    setRowsExpanded(rowData, nextExpanded);
  };
  return { body: container, toggleCollapse, isExpanded, hasExpandable };
}

/** Render an expandable schema tree viewer */
export function renderSchemaViewer(schema: SchemaObject, title?: string | HTMLElement): HTMLElement {
  const container = createCard();
  const rootType = getSchemaTypeLabel(schema);

  const body = createCardBody('no-padding');
  const schemaContainer = h('div', { className: 'schema' });
  const schemaBody = h('div', { className: 'body' });
  schemaContainer.append(schemaBody);
  const rowData: RowData = [];
  renderSchemaNode(schemaBody, schema, '', 0, new Set(), rowData);
  body.append(schemaContainer);

  if (title) {
    const header = createCardHeader();
    const titleEl = typeof title === 'string' ? h('h3', { textContent: title }) : title;
    const hasNestedLevels = rowData.length > 0;
    const anyExpanded = hasNestedLevels && rowData.some(({ children }) => children.style.display !== 'none');
    const typeBadge = createBadge({ text: rootType, kind: 'chip', color: 'primary', size: 'm', mono: true });
    const collapseBtn = hasNestedLevels
      ? h('button', {
          className: anyExpanded ? 'schema-collapse-btn is-expanded' : 'schema-collapse-btn',
          type: 'button',
          'aria-label': anyExpanded ? 'Collapse all fields' : 'Expand all fields',
        })
      : null;

    if (collapseBtn) {
      collapseBtn.innerHTML = icons.chevronDown;
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextExpanded = !collapseBtn.classList.contains('is-expanded');
        setRowsExpanded(rowData, nextExpanded);
        collapseBtn.classList.toggle('is-expanded', nextExpanded);
        collapseBtn.setAttribute('aria-label', nextExpanded ? 'Collapse all fields' : 'Expand all fields');
      });
    }

    if (titleEl.classList.contains('card-row')) {
      titleEl.classList.add('schema-header-row');
      titleEl.append(typeBadge);
      if (collapseBtn) titleEl.append(collapseBtn);
      header.append(titleEl);
    } else {
      const headerRow = h('div', { className: 'card-row schema-header-row' });
      headerRow.append(titleEl, typeBadge);
      if (collapseBtn) headerRow.append(collapseBtn);
      header.append(headerRow);
    }

    container.prepend(header);
  }

  container.append(body);
  return container;
}

export interface ParametersCardOptions {
  headerTitle: string;
  withEnumAndDefault?: boolean;
}

/** Parameters in the same style as schema (flat list). */
export function renderParametersCard(params: SpecParameter[], options: ParametersCardOptions): HTMLElement {
  const { headerTitle, withEnumAndDefault = true } = options;

  const rowsEl = params.map((p) => {
    const row = h('div', { className: 'schema-row role-flat role-params' });
    const mainRow = h('div', { className: 'schema-main-row' });

    const nameWrap = h('div', { className: 'schema-name-wrapper' });
    nameWrap.append(
      h('span', { className: 'schema-spacer' }),
      h('span', { textContent: p.name }),
    );

    const metaWrap = h('div', { className: 'schema-meta-wrapper' });
    metaWrap.append(createBadge({
      text: p.schema ? getSchemaTypeLabel(p.schema) : 'unknown',
      kind: 'chip',
      color: 'primary',
      size: 'm',
      mono: true,
    }));
    if (p.required) {
      metaWrap.append(createBadge({ text: 'required', kind: 'required', size: 'm' }));
    }

    mainRow.append(nameWrap, metaWrap);
    row.append(mainRow);

    const descCol = h('div', { className: 'schema-desc-col is-root' });
    if (p.description) {
      descCol.append(markdownBlock(p.description));
    }
    const enumValues = p.schema?.enum;
    const hasDefault = p.schema?.default !== undefined;
    if (withEnumAndDefault && ((enumValues && enumValues.length > 0) || hasDefault)) {
      const enumWrap = h('div', { className: 'schema-enum-values' });
      if (hasDefault) {
        enumWrap.append(createBadge({
          text: `Default: ${JSON.stringify(p.schema!.default)}`,
          kind: 'chip',
          size: 's',
          mono: true,
        }));
      }
      if (enumValues) {
        for (const val of enumValues) {
          const str = String(val);
          if (str === p.in) continue; /* don't duplicate path/query — already in header */
          enumWrap.append(createBadge({ text: str, kind: 'chip', size: 's', mono: true }));
        }
      }
      descCol.append(enumWrap);
    }
    if (descCol.children.length > 0) row.append(descCol);

    return row;
  });

  const card = createCard();
  const body = createCardBody('no-padding');
  const paramsWrap = h('div', { className: 'params' });
  const paramsBody = h('div', { className: 'body role-params' });
  paramsBody.append(...rowsEl);
  paramsWrap.append(paramsBody);
  body.append(paramsWrap);
  card.append(
    createCardHeader(createCardHeaderRow({ title: headerTitle })),
    body,
  );
  return card;
}

function addExpandableNode(
  parent: HTMLElement,
  key: string,
  childSchema: SchemaObject,
  depth: number,
  required: boolean,
  seen: Set<SchemaObject>,
  rowData?: RowData,
): void {
  const type = getSchemaTypeLabel(childSchema);
  const expandable = hasChildren(childSchema);
  const row = createRow(key, type, childSchema, depth, expandable, required);
  parent.append(row);

  if (expandable) {
    const childContainer = h('div', { className: 'schema-children' });
    childContainer.style.display = 'block';

    const newSeen = new Set(seen);
    newSeen.add(childSchema);
    renderChildren(childContainer, childSchema, depth + 1, newSeen, rowData);
    parent.append(childContainer);
    rowData?.push({ row, children: childContainer });

    row.querySelector('.schema-toggle')?.classList.add('is-expanded');
    row.classList.add('focus-ring');
    row.setAttribute('aria-expanded', 'true');
    row.setAttribute('tabindex', '0');
    row.addEventListener('click', () => {
      const isExpanded = childContainer.style.display !== 'none';
      setRowExpanded(row, childContainer, !isExpanded);
    });
    row.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const isExpanded = childContainer.style.display !== 'none';
      setRowExpanded(row, childContainer, !isExpanded);
    });
  }
}

function renderSchemaNode(
  parent: HTMLElement,
  schema: SchemaObject,
  key: string,
  depth: number,
  seen: Set<SchemaObject>,
  rowData?: RowData,
): void {
  if (seen.has(schema)) {
    parent.append(createRow(key || '[circular]', 'circular', { description: '' }, depth, false, false));
    return;
  }

  if (depth === 0 && !key) {
    const newSeen = new Set(seen);
    newSeen.add(schema);
    renderChildren(parent, schema, depth, newSeen, rowData);
    return;
  }

  addExpandableNode(parent, key, schema, depth, false, seen, rowData);
}

function renderChildren(parent: HTMLElement, schema: SchemaObject, depth: number, seen: Set<SchemaObject>, rowData?: RowData): void {
  const required = new Set(schema.required || []);

  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      addExpandableNode(parent, propName, propSchema, depth, required.has(propName), seen, rowData);
    }
  }

  if (schema.items && schema.type === 'array') {
    addExpandableNode(parent, '[item]', schema.items, depth, false, seen, rowData);
  }

  for (const keyword of ['allOf', 'oneOf', 'anyOf'] as const) {
    const variants = schema[keyword];
    if (Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        addExpandableNode(parent, `${keyword}[${i}]`, variants[i] as SchemaObject, depth, false, seen, rowData);
      }
    }
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    addExpandableNode(parent, '[additionalProperties]', schema.additionalProperties as SchemaObject, depth, false, seen, rowData);
  }
}

function createRow(
  key: string,
  type: string,
  schema: SchemaObject,
  depth: number,
  expandable: boolean,
  required: boolean,
): HTMLElement {
  const rowClass = [
    'schema-row',
    depth === 0 ? 'is-root' : '',
    depth === 0 && !expandable ? 'is-leaf' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const row = h('div', { className: rowClass, role: expandable ? 'button' : undefined });
  row.setAttribute('data-depth', String(depth));
  row.style.setProperty('--schema-depth', String(depth));

  const mainRow = h('div', { className: 'schema-main-row' });

  const nameWrapper = h('div', { className: 'schema-name-wrapper' });
  if (expandable) {
    nameWrapper.append(h('span', { className: 'schema-toggle', innerHTML: icons.chevronRight }));
  } else {
    nameWrapper.append(h('span', { className: 'schema-spacer' }));
  }
  nameWrapper.append(h('span', { textContent: key }));
  mainRow.append(nameWrapper);

  const metaWrapper = h('div', { className: 'schema-meta-wrapper' });
  metaWrapper.append(createBadge({ text: type, kind: 'chip', color: 'primary', size: 'm', mono: true }));
  if (required) {
    metaWrapper.append(createBadge({ text: 'required', kind: 'required', size: 'm' }));
  }
  mainRow.append(metaWrapper);

  row.append(mainRow);

  const descCol = h('div', { className: `schema-desc-col${depth === 0 ? ' is-root' : ''}` });
  if (schema.description) {
    descCol.append(markdownBlock(String(schema.description)));
  }
  const enumValues = schema.enum;
  const hasEnumValues = Array.isArray(enumValues) && enumValues.length > 0;
  const defaultValue = schema.default;
  const hasDefaultValue = defaultValue !== undefined;
  const isDefaultInEnum = hasEnumValues && hasDefaultValue
    ? enumValues.some((val) => schemaValuesEqual(val, defaultValue))
    : false;

  const constraints = getConstraints(schema, !hasEnumValues || !hasDefaultValue);
  if (constraints.length > 0 || hasEnumValues) {
    const constraintsRow = h('div', { className: 'schema-constraints-row' });
    for (const c of constraints) {
      constraintsRow.append(createBadge({
        text: c,
        kind: 'chip',
        size: 's',
        mono: true,
      }));
    }
    if (hasEnumValues) {
      const orderedEnumValues = hasDefaultValue && isDefaultInEnum
        ? [defaultValue, ...enumValues.filter((val) => !schemaValuesEqual(val, defaultValue))]
        : enumValues;

      if (hasDefaultValue && !isDefaultInEnum) {
        constraintsRow.append(createBadge({
          text: `default: ${stringifySchemaValue(defaultValue)}`,
          kind: 'chip',
          size: 's',
          mono: true,
          className: 'schema-enum-value is-default',
        }));
      }

      for (const val of orderedEnumValues) {
        const isDefaultValue = hasDefaultValue && schemaValuesEqual(val, defaultValue);
        constraintsRow.append(createBadge({
          text: isDefaultValue ? `default: ${stringifySchemaValue(val)}` : stringifySchemaValue(val),
          kind: 'chip',
          size: 's',
          mono: true,
          className: isDefaultValue ? 'schema-enum-value is-default' : 'schema-enum-value',
        }));
      }
    }
    descCol.append(constraintsRow);
  }
  if (descCol.children.length > 0) {
    row.append(descCol);
  }

  return row;
}

function hasChildren(schema: SchemaObject): boolean {
  if (schema.properties && Object.keys(schema.properties).length > 0) return true;
  if (schema.type === 'array' && schema.items) return true;
  if (schema.allOf || schema.oneOf || schema.anyOf) return true;
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') return true;
  return false;
}

function getConstraints(schema: SchemaObject, includeDefault: boolean = true): string[] {
  const parts: string[] = [];
  if (schema.minLength !== undefined) parts.push(`minLength: ${schema.minLength}`);
  if (schema.maxLength !== undefined) parts.push(`maxLength: ${schema.maxLength}`);
  if (schema.minimum !== undefined) parts.push(`minimum: ${schema.minimum}`);
  if (schema.maximum !== undefined) parts.push(`maximum: ${schema.maximum}`);
  if (schema.pattern) parts.push(`pattern: ${schema.pattern}`);
  if (schema.minItems !== undefined) parts.push(`minItems: ${schema.minItems}`);
  if (schema.maxItems !== undefined) parts.push(`maxItems: ${schema.maxItems}`);
  if (schema.uniqueItems) parts.push('uniqueItems: true');
  if (includeDefault && schema.default !== undefined) parts.push(`default: ${stringifySchemaValue(schema.default)}`);
  if (schema.deprecated) parts.push('deprecated: true');
  if (schema.readOnly) parts.push('readOnly: true');
  if (schema.writeOnly) parts.push('writeOnly: true');
  return parts;
}

function setRowsExpanded(rows: RowData, expanded: boolean): void {
  for (const { row, children } of rows) {
    setRowExpanded(row, children, expanded);
  }
}

function setRowExpanded(row: HTMLElement, children: HTMLElement, expanded: boolean): void {
  children.style.display = expanded ? 'block' : 'none';
  row.querySelector('.schema-toggle')?.classList.toggle('is-expanded', expanded);
  row.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function stringifySchemaValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function schemaValuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return String(left) === String(right);
  }
}
