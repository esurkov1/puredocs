import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface PureDocsOptions {
  specUrl?: string;
  spec?: Record<string, unknown>;
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
}

export interface PureDocsRouteOptions extends PureDocsOptions {
  route?: string;
}

export interface PureDocsHtmlPayload {
  css: string;
  script: string;
  bootstrapScript: string;
  pageTitle: string;
}

export type PureDocsHtmlTemplate = (payload: PureDocsHtmlPayload) => string;

interface ExpressLikeResponse {
  type?: (value: string) => unknown;
  setHeader?: (name: string, value: string) => unknown;
  send?: (body: string) => unknown;
  end?: (body?: string) => unknown;
}

interface ExpressLikeApp {
  get: (path: string, handler: (_req: unknown, res: ExpressLikeResponse) => unknown) => unknown;
}

interface FastifyLikeReply {
  type?: (value: string) => FastifyLikeReply;
  header?: (name: string, value: string) => FastifyLikeReply;
  send?: (body: string) => unknown;
}

interface FastifyLikeApp {
  get: (path: string, handler: (_request: unknown, reply: FastifyLikeReply) => unknown) => unknown;
}

interface PureDocsClientConfig {
  specUrl?: string;
  spec?: Record<string, unknown>;
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
}

interface InlineAssets {
  css: string;
  umd: string;
}

const currentDir = typeof __dirname === 'string'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

const cssPath = path.resolve(currentDir, 'puredocs.css');
const umdPath = path.resolve(currentDir, 'puredocs.umd.js');

let inlineAssetsCache: InlineAssets | null = null;

function getInlineAssets(): InlineAssets {
  if (!inlineAssetsCache) {
    const css = readFileSync(cssPath, 'utf8');
    const umd = readFileSync(umdPath, 'utf8');

    inlineAssetsCache = {
      css: css.replace(/<\/style>/gi, '<\\/style>'),
      umd: umd.replace(/<\/script>/gi, '<\\/script>'),
    };
  }

  return inlineAssetsCache;
}

function toSafeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildClientConfig(options: PureDocsOptions): PureDocsClientConfig {
  if (!options.specUrl && !options.spec) {
    throw new Error('[PureDocs] pureDocs.html() requires either "specUrl" or "spec".');
  }

  return {
    specUrl: options.specUrl,
    spec: options.spec,
    title: options.title,
    theme: options.theme ?? 'auto',
    primaryColor: options.primaryColor,
  };
}

function sendHtmlResponse(res: ExpressLikeResponse, html: string): unknown {
  if (typeof res.type === 'function') {
    res.type('text/html');
  } else if (typeof res.setHeader === 'function') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
  }

  if (typeof res.send === 'function') {
    return res.send(html);
  }
  if (typeof res.end === 'function') {
    return res.end(html);
  }

  throw new Error('[PureDocs] Unsupported response object: expected res.send() or res.end().');
}

function resolveRoute(options: PureDocsRouteOptions): string {
  const route = options.route || '/docs';
  return route.startsWith('/') ? route : `/${route}`;
}

export function pureDocsHtml(options: PureDocsOptions, template?: PureDocsHtmlTemplate): string {
  const { css, umd } = getInlineAssets();
  const clientConfig = buildClientConfig(options);
  const pageTitle = options.title ? `${options.title} — pureDocs` : 'pureDocs';
  const bootstrapScript = `(PureDocs.default||PureDocs.PureDocs||PureDocs).bootstrap(${toSafeJson(clientConfig)});`;

  const payload: PureDocsHtmlPayload = {
    css,
    script: umd,
    bootstrapScript,
    pageTitle,
  };

  if (template) {
    return template(payload);
  }

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${escapeHtml(pageTitle)}</title>`,
    `  <style>${css}</style>`,
    '  <style>html,body{margin:0}body{width:100vw;height:100vh}#puredocs{width:100%;height:100%;display:block}</style>',
    '</head>',
    '<body>',
    `  <script>${umd}</script>`,
    `  <script>${bootstrapScript}</script>`,
    '</body>',
    '</html>',
  ].join('\n');
}

export function pureDocsExpress(app: ExpressLikeApp, options: PureDocsRouteOptions): string {
  const html = pureDocsHtml(options);
  const route = resolveRoute(options);

  app.get(route, (_req, res) => sendHtmlResponse(res, html));
  return html;
}

export function pureDocsFastify(app: FastifyLikeApp, options: PureDocsRouteOptions): string {
  const html = pureDocsHtml(options);
  const route = resolveRoute(options);

  app.get(route, (_request, reply) => {
    if (typeof reply.type === 'function') {
      reply.type('text/html');
    } else if (typeof reply.header === 'function') {
      reply.header('content-type', 'text/html; charset=utf-8');
    }
    return reply.send ? reply.send(html) : html;
  });

  return html;
}

export const pureDocs = {
  html: pureDocsHtml,
  express: pureDocsExpress,
  fastify: pureDocsFastify,
};

export default pureDocs;
