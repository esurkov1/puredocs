import type {
  ParsedSpec, SpecInfo, SpecServer, SpecTag, SpecOperation,
  SpecParameter, SpecRequestBody, SpecResponse, SpecResponseHeader, SpecMediaType,
  SpecExample, SchemaObject, SecurityScheme, SpecWebhook, SpecCallback, SecurityRequirement,
} from './types';
import { normalizeSecurityRequirements, resolveOperationSecurityInfo } from './security';

const MAX_REF_DEPTH = 50;
const MAX_CYCLE_REFS = 200;

/** Parse and normalize an OpenAPI 3.x spec */
export function parseSpec(raw: Record<string, unknown>): ParsedSpec {
  const info = parseInfo(raw.info as Record<string, unknown> || {});
  const servers = parseServers(raw.servers as Record<string, unknown>[] || []);
  const components = (raw.components || {}) as Record<string, unknown>;
  const schemas = resolveAllRefs(components.schemas as Record<string, unknown> || {}, raw);
  const securitySchemes = parseSecuritySchemes(components.securitySchemes as Record<string, unknown> || {});
  const rootSecurity = normalizeSecurityRequirements(raw.security);
  const rawPaths = raw.paths as Record<string, Record<string, unknown>> || {};
  const paths: Record<string, Record<string, unknown>> = {};
  for (const [path, methods] of Object.entries(rawPaths)) {
    if (!path.startsWith('/docs')) paths[path] = methods as Record<string, unknown>;
  }
  const operations = parseOperations(paths, raw, rootSecurity, securitySchemes);
  const tags = groupByTags(operations, raw.tags as Array<Record<string, unknown>> || []);
  const webhooks = parseWebhooks(raw.webhooks as Record<string, Record<string, unknown>> || {}, raw, rootSecurity, securitySchemes);

  return { raw, info, servers, tags, operations, schemas, securitySchemes, webhooks };
}

function parseInfo(raw: Record<string, unknown>): SpecInfo {
  return {
    title: String(raw.title || 'API'),
    description: raw.description ? String(raw.description) : undefined,
    version: String(raw.version || '1.0.0'),
    contact: raw.contact as SpecInfo['contact'],
    license: raw.license as SpecInfo['license'],
  };
}

function parseServers(raw: Record<string, unknown>[]): SpecServer[] {
  return raw.map((s) => ({
    url: String(s.url || '/'),
    description: s.description ? String(s.description) : undefined,
    variables: s.variables as SpecServer['variables'],
  }));
}

function parseSecuritySchemes(raw: Record<string, unknown>): Record<string, SecurityScheme> {
  const result: Record<string, SecurityScheme> = {};
  for (const [name, scheme] of Object.entries(raw)) {
    const s = scheme as Record<string, unknown>;
    result[name] = {
      type: String(s.type || ''),
      scheme: s.scheme ? String(s.scheme) : undefined,
      bearerFormat: s.bearerFormat ? String(s.bearerFormat) : undefined,
      description: s.description ? String(s.description) : undefined,
      in: s.in ? String(s.in) : undefined,
      name: s.name ? String(s.name) : undefined,
      openIdConnectUrl: s.openIdConnectUrl ? String(s.openIdConnectUrl) : undefined,
      flows: s.flows && typeof s.flows === 'object' ? s.flows as SecurityScheme['flows'] : undefined,
    };
  }
  return result;
}

/* ─── $ref Resolution ─── */

const refCache = new Map<string, unknown>();
let refCount = 0;

function resolveRef(ref: string, root: Record<string, unknown>): unknown {
  if (refCache.has(ref)) return refCache.get(ref);

  if (++refCount > MAX_CYCLE_REFS) return { type: 'object', description: '[Circular reference]' };

  const parts = ref.replace(/^#\//, '').split('/').map((p) => decodeURIComponent(p.replace(/~1/g, '/').replace(/~0/g, '~')));
  let current: unknown = root;

  for (const part of parts) {
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  refCache.set(ref, current);
  return current;
}

function deepResolve(node: unknown, root: Record<string, unknown>, depth = 0, seen = new Set<string>()): unknown {
  if (depth > MAX_REF_DEPTH) return node;
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map((item) => deepResolve(item, root, depth + 1, seen));

  const obj = node as Record<string, unknown>;

  if (typeof obj.$ref === 'string') {
    const ref = obj.$ref;
    if (seen.has(ref)) return { type: 'object', description: '[Circular reference]' };

    const newSeen = new Set(seen);
    newSeen.add(ref);
    const resolved = resolveRef(ref, root);
    if (resolved && typeof resolved === 'object') {
      return deepResolve(resolved, root, depth + 1, newSeen);
    }
    return resolved;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = deepResolve(value, root, depth + 1, seen);
  }
  return result;
}

function resolveAllRefs(schemas: Record<string, unknown>, root: Record<string, unknown>): Record<string, SchemaObject> {
  refCache.clear();
  refCount = 0;
  const result: Record<string, SchemaObject> = {};
  for (const [name, schema] of Object.entries(schemas)) {
    result[name] = deepResolve(schema, root) as SchemaObject;
  }
  return result;
}

/* ─── Operations ─── */

function parseOperations(
  paths: Record<string, Record<string, unknown>>,
  root: Record<string, unknown>,
  rootSecurity: SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): SpecOperation[] {
  refCache.clear();
  refCount = 0;
  const ops: SpecOperation[] = [];
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

  for (const [pathStr, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    const pathSecurity = normalizeSecurityRequirements(pathItem.security);

    // Path-level parameters
    const pathParams = Array.isArray(pathItem.parameters)
      ? pathItem.parameters.map((p: unknown) => deepResolve(p, root) as Record<string, unknown>)
      : [];

    for (const method of methods) {
      const op = pathItem[method] as Record<string, unknown> | undefined;
      if (!op) continue;

      const operation = parseOperation(
        method,
        pathStr,
        op,
        pathParams,
        root,
        pathSecurity,
        rootSecurity,
        securitySchemes,
      );
      ops.push(operation);
    }
  }

  return ops;
}

function parseOperation(
  method: string,
  path: string,
  op: Record<string, unknown>,
  pathParams: Record<string, unknown>[],
  root: Record<string, unknown>,
  pathSecurity: SecurityRequirement[] | undefined = undefined,
  rootSecurity: SecurityRequirement[] | undefined = undefined,
  securitySchemes: Record<string, SecurityScheme> = {},
): SpecOperation {
  const opParams = Array.isArray(op.parameters)
    ? op.parameters.map((p: unknown) => deepResolve(p, root) as Record<string, unknown>)
    : [];

  // Merge path-level and operation-level parameters (operation overrides)
  const mergedParams = [...pathParams];
  for (const p of opParams) {
    const idx = mergedParams.findIndex((mp) => mp.name === p.name && mp.in === p.in);
    if (idx >= 0) mergedParams[idx] = p;
    else mergedParams.push(p);
  }

  const parameters = mapParameters(mergedParams, root);
  let requestBody = mapRequestBody(op.requestBody, root);

  // x-doc-examples → requestBody.content[].examples
  if (Array.isArray(op['x-doc-examples'])) {
    const docExamples = op['x-doc-examples'] as Array<Record<string, unknown>>;
    const bodyExamples: Array<{ summary: string; value: unknown }> = [];

    for (let i = 0; i < docExamples.length; i++) {
      const ex = docExamples[i];
      const scenario = ex.scenario ? String(ex.scenario) : `Example ${i + 1}`;
      const req = ex.request as Record<string, unknown> | undefined;
      const body = req?.body;
      if (body === undefined) continue;
      bodyExamples.push({ summary: scenario, value: body });
    }

    if (bodyExamples.length > 0) {
      if (!requestBody) requestBody = { required: false, content: {} };
      const jsonContent = requestBody.content['application/json'] || requestBody.content['application/vnd.api+json'] || {};
      if (!requestBody.content['application/json']) {
        requestBody.content['application/json'] = jsonContent;
      }
      const target = requestBody.content['application/json'];
      if (!target.examples) target.examples = {};
      for (let i = 0; i < bodyExamples.length; i++) {
        const be = bodyExamples[i];
        const base = be.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, '-').replace(/-+/g, '-').slice(0, 40) || 'ex';
        const key = `${base}-${i}`.replace(/^-/, '');
        target.examples[key] = { summary: be.summary, description: be.summary, value: be.value };
      }
    }
  }

  const responses = mapResponses(op.responses, root);

  const tags = Array.isArray(op.tags) ? op.tags.map(String) : ['default'];
  const operationId = String(op.operationId || `${method}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`);
  const hasOwnSecurity = Object.prototype.hasOwnProperty.call(op, 'security');
  const operationSecurity = normalizeSecurityRequirements(op.security);
  const mergedSecurity = hasOwnSecurity ? operationSecurity : (pathSecurity ?? rootSecurity);
  const explicitlyNoAuth = hasOwnSecurity && Array.isArray(operationSecurity) && operationSecurity.length === 0;

  // Callbacks
  const callbacks = parseCallbacks(op.callbacks as Record<string, unknown> | undefined, root, securitySchemes);

  const result: SpecOperation = {
    operationId,
    method,
    path,
    summary: op.summary ? String(op.summary) : undefined,
    description: op.description ? String(op.description) : undefined,
    tags,
    deprecated: Boolean(op.deprecated),
    security: mergedSecurity,
    resolvedSecurity: resolveOperationSecurityInfo(mergedSecurity, securitySchemes, explicitlyNoAuth),
    parameters,
    requestBody,
    responses,
  };
  if (callbacks.length > 0) result.callbacks = callbacks;
  return result;
}

/* ─── Webhooks ─── */

function parseWebhooks(
  webhooks: Record<string, Record<string, unknown>>,
  root: Record<string, unknown>,
  rootSecurity: SecurityRequirement[] | undefined,
  securitySchemes: Record<string, SecurityScheme>,
): SpecWebhook[] {
  if (!webhooks || typeof webhooks !== 'object') return [];
  const result: SpecWebhook[] = [];
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

  for (const [name, pathItem] of Object.entries(webhooks)) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    const resolved = deepResolve(pathItem, root) as Record<string, unknown>;
    const pathSecurity = normalizeSecurityRequirements(resolved.security);

    for (const method of methods) {
      const op = resolved[method] as Record<string, unknown> | undefined;
      if (!op) continue;
      const hasOwnSecurity = Object.prototype.hasOwnProperty.call(op, 'security');
      const operationSecurity = normalizeSecurityRequirements(op.security);
      const mergedSecurity = hasOwnSecurity ? operationSecurity : (pathSecurity ?? rootSecurity);
      const explicitlyNoAuth = hasOwnSecurity && Array.isArray(operationSecurity) && operationSecurity.length === 0;

      const opParams = Array.isArray(op.parameters)
        ? op.parameters.map((p: unknown) => deepResolve(p, root) as Record<string, unknown>)
        : [];
      const parameters = mapParameters(opParams, root);
      const requestBody = mapRequestBody(op.requestBody, root);
      const responses = mapResponses(op.responses, root);

      result.push({
        name,
        method,
        path: name,
        summary: op.summary ? String(op.summary) : undefined,
        description: op.description ? String(op.description) : undefined,
        security: mergedSecurity,
        resolvedSecurity: resolveOperationSecurityInfo(mergedSecurity, securitySchemes, explicitlyNoAuth),
        parameters,
        requestBody,
        responses,
      });
    }
  }
  return result;
}

function mapParameters(
  rawParams: Record<string, unknown>[],
  root: Record<string, unknown>,
): SpecParameter[] {
  return rawParams.map((param) => ({
    name: String(param.name || ''),
    in: String(param.in || 'query') as SpecParameter['in'],
    required: Boolean(param.required),
    description: param.description ? String(param.description) : undefined,
    schema: param.schema ? deepResolve(param.schema, root) as SchemaObject : undefined,
    example: param.example,
    examples: param.examples ? parseExamples(param.examples as Record<string, unknown>) : undefined,
    deprecated: Boolean(param.deprecated),
  }));
}

function mapRequestBody(
  rawRequestBody: unknown,
  root: Record<string, unknown>,
): SpecRequestBody | undefined {
  if (!rawRequestBody) return undefined;
  const requestBody = deepResolve(rawRequestBody, root) as Record<string, unknown>;
  return {
    description: requestBody.description ? String(requestBody.description) : undefined,
    required: Boolean(requestBody.required),
    content: parseContent(requestBody.content as Record<string, unknown> || {}, root),
  };
}

function parseResponseHeaders(
  rawHeaders: unknown,
  root: Record<string, unknown>,
): Record<string, SpecResponseHeader> {
  const result: Record<string, SpecResponseHeader> = {};
  if (!rawHeaders || typeof rawHeaders !== 'object') return result;

  for (const [name, raw] of Object.entries(rawHeaders as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue;
    const resolved = deepResolve(raw, root) as Record<string, unknown>;
    const schema = resolved.schema as SchemaObject | undefined;
    const example = (resolved.example ?? (schema && typeof schema === 'object' ? schema.example : undefined)) as unknown;
    result[name] = {
      description: resolved.description ? String(resolved.description) : undefined,
      required: Boolean(resolved.required),
      schema: schema && typeof schema === 'object' ? (deepResolve(schema, root) as SchemaObject) : undefined,
      example: example !== undefined ? example : undefined,
      deprecated: Boolean(resolved.deprecated),
    };
  }
  return result;
}

function mapResponses(
  rawResponses: unknown,
  root: Record<string, unknown>,
): Record<string, SpecResponse> {
  const responses: Record<string, SpecResponse> = {};
  if (!rawResponses || typeof rawResponses !== 'object') return responses;

  for (const [code, rawResponse] of Object.entries(rawResponses as Record<string, unknown>)) {
    const response = deepResolve(rawResponse, root) as Record<string, unknown>;
    const rawHeaders = response.headers;
    responses[code] = {
      statusCode: code,
      description: response.description ? String(response.description) : undefined,
      headers: rawHeaders ? parseResponseHeaders(rawHeaders, root) : undefined,
      content: response.content ? parseContent(response.content as Record<string, unknown>, root) : undefined,
    };
  }

  return responses;
}

/* ─── Callbacks ─── */

function parseCallbacks(
  callbacks: Record<string, unknown> | undefined,
  root: Record<string, unknown>,
  securitySchemes: Record<string, SecurityScheme>,
): SpecCallback[] {
  if (!callbacks || typeof callbacks !== 'object') return [];
  const result: SpecCallback[] = [];
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

  for (const [name, callbackItem] of Object.entries(callbacks)) {
    const resolved = deepResolve(callbackItem, root) as Record<string, Record<string, unknown>>;
    if (!resolved || typeof resolved !== 'object') continue;
    const ops: SpecOperation[] = [];

    for (const [urlExpr, pathItem] of Object.entries(resolved)) {
      if (!pathItem || typeof pathItem !== 'object') continue;
      for (const method of methods) {
        const op = pathItem[method] as Record<string, unknown> | undefined;
        if (!op) continue;
        ops.push(parseOperation(method, urlExpr, op, [], root, undefined, undefined, securitySchemes));
      }
    }

    if (ops.length > 0) {
      result.push({ name, operations: ops });
    }
  }
  return result;
}

function parseContent(content: Record<string, unknown>, root: Record<string, unknown>): Record<string, SpecMediaType> {
  const result: Record<string, SpecMediaType> = {};
  for (const [mediaType, value] of Object.entries(content)) {
    const mt = value as Record<string, unknown>;
    result[mediaType] = {
      schema: mt.schema ? deepResolve(mt.schema, root) as SchemaObject : undefined,
      example: mt.example,
      examples: mt.examples ? parseExamples(mt.examples as Record<string, unknown>) : undefined,
    };
  }
  return result;
}

function parseExamples(examples: Record<string, unknown>): Record<string, SpecExample> {
  const result: Record<string, SpecExample> = {};
  for (const [name, ex] of Object.entries(examples)) {
    const e = ex as Record<string, unknown>;
    result[name] = {
      summary: e.summary ? String(e.summary) : undefined,
      description: e.description ? String(e.description) : undefined,
      value: e.value,
    };
  }
  return result;
}

function groupByTags(operations: SpecOperation[], rawTags: Array<Record<string, unknown>>): SpecTag[] {
  const tagMap = new Map<string, SpecOperation[]>();
  const tagDescriptions = new Map<string, string>();

  for (const t of rawTags) {
    tagDescriptions.set(String(t.name), String(t.description || ''));
  }

  for (const op of operations) {
    for (const tag of op.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag)!.push(op);
    }
  }

  // Maintain tag order from spec, then add any unregistered tags
  const orderedTags: SpecTag[] = [];
  const seen = new Set<string>();

  for (const t of rawTags) {
    const name = String(t.name);
    if (seen.has(name)) continue;
    seen.add(name);
    orderedTags.push({
      name,
      description: tagDescriptions.get(name),
      operations: tagMap.get(name) || [],
    });
  }

  for (const [name, ops] of tagMap) {
    if (seen.has(name)) continue;
    seen.add(name);
    orderedTags.push({ name, description: tagDescriptions.get(name), operations: ops });
  }

  return orderedTags;
}

/* ─── Example Generation ─── */

/** Generate a sample value from a schema when no example is provided */
export function generateExample(schema: SchemaObject | undefined): unknown {
  if (!schema) return undefined;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];

  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') return '2025-01-15T10:30:00Z';
      if (schema.format === 'date') return '2025-01-15';
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'uri' || schema.format === 'url') return 'https://example.com';
      if (schema.format === 'uuid') return '550e8400-e29b-41d4-a716-446655440000';
      if (schema.format === 'password') return '********';
      return 'string';

    case 'number':
    case 'integer':
      if (schema.minimum !== undefined) return schema.minimum;
      return schema.type === 'integer' ? 0 : 0.0;

    case 'boolean':
      return true;

    case 'array':
      if (schema.items) {
        const item = generateExample(schema.items);
        return item !== undefined ? [item] : [];
      }
      return [];

    case 'object': {
      const obj: Record<string, unknown> = {};
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          obj[key] = generateExample(prop);
        }
      }
      return obj;
    }

    default:
      // Handle allOf, oneOf, anyOf
      if (schema.allOf && schema.allOf.length > 0) {
        const merged: Record<string, unknown> = {};
        for (const sub of schema.allOf) {
          const ex = generateExample(sub);
          if (ex && typeof ex === 'object' && !Array.isArray(ex)) {
            Object.assign(merged, ex);
          }
        }
        return Object.keys(merged).length > 0 ? merged : undefined;
      }
      if (schema.oneOf && schema.oneOf.length > 0) return generateExample(schema.oneOf[0]);
      if (schema.anyOf && schema.anyOf.length > 0) return generateExample(schema.anyOf[0]);
      if (schema.properties) {
        const obj: Record<string, unknown> = {};
        for (const [key, prop] of Object.entries(schema.properties)) {
          obj[key] = generateExample(prop);
        }
        return obj;
      }
      return undefined;
  }
}

/** Load spec from URL (JSON or YAML) */
export async function loadSpec(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load spec: ${response.status} ${response.statusText}`);
  const text = await response.text();

  // Try JSON first
  try {
    return JSON.parse(text);
  } catch {
    try {
      const yaml = require('js-yaml') as { load: (str: string) => unknown };
      return yaml.load(text) as Record<string, unknown>;
    } catch {
      throw new Error('Failed to parse spec as JSON or YAML');
    }
  }
}
