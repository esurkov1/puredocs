<p align="center">
  <img src="apps/landing/assets/img/image1.png" alt="PureDocs — API Documentation Portal" width="720">
</p>

<h1 align="center">PureDocs</h1>

<p align="center">
  Beautiful, interactive API documentation from any OpenAPI 3.1 spec.<br>
  One function call for Express or Fastify. One Web Component for everything else.
</p>

<p align="center">
  <a href="https://esurkov1.github.io/puredocs/">puredocs.dev</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/puredocs"><img src="https://img.shields.io/npm/v/puredocs?color=2563EB&label=npm" alt="npm"></a>
  <a href="https://github.com/esurkov1/puredocs"><img src="https://img.shields.io/github/stars/esurkov1/puredocs?style=flat&logo=github" alt="GitHub stars"></a>
  <a href="https://github.com/esurkov1/puredocs/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-see%20LICENSE-blue" alt="License"></a>
  <img src="https://img.shields.io/badge/OpenAPI-3.1-green" alt="OpenAPI 3.1">
</p>

---

## Features

- **Full OpenAPI 3.1** — paths, callbacks, webhooks, all HTTP methods, `$ref` resolution, `oneOf`/`anyOf`/`allOf`
- **Express & Fastify** — add a `/docs` route in one function call
- **Web Component** — drop `<pure-docs>` into React, Vue, Angular, Next.js, Nuxt, Svelte, or plain HTML
- **Live Try It Console** — send real requests, configure environments, switch auth
- **Smart Search** — Cmd+K to find endpoints, schemas, webhooks instantly
- **Light & Dark Theme** — auto-detects system preference or set manually
- **Full Auth Support** — Bearer, Basic, API Key, OAuth2, OpenID Connect
- **Multi-Language Snippets** — auto-generated cURL, JavaScript, Python, Go, Rust
- **JSON & YAML** — load specs in either format
- **Markdown in Descriptions** — use `**bold**`, `*italic*`, `` `code` ``, and `[links](url)` in OpenAPI descriptions; zero deps, XSS-safe
- **Zero Config** — works out of the box with sensible defaults

---

## Install

```bash
npm install puredocs
```

## Quick Start

### Express

```ts
import express from 'express';
import { pureDocs } from 'puredocs';

const app = express();

pureDocs.express(app, {
  route: '/docs',
  specUrl: '/openapi.json',
});

app.listen(3000);
```

### Fastify

```ts
import Fastify from 'fastify';
import { pureDocs } from 'puredocs';

const app = Fastify();

pureDocs.fastify(app, {
  route: '/docs',
  specUrl: '/openapi.json',
});

await app.listen({ port: 3000 });
```

### HTML

```html
<pure-docs
  spec-url="/openapi.json"
  theme="auto"
></pure-docs>

<script type="module">
  import 'puredocs/web';
  import 'puredocs/style.css';
</script>
```

### CDN (no bundler)

```html
<link rel="stylesheet" href="https://unpkg.com/puredocs/dist/puredocs.css" />

<pure-docs spec-url="/openapi.json" theme="auto"></pure-docs>

<script src="https://unpkg.com/puredocs/dist/puredocs.umd.js"></script>
```

### Raw HTML Generation

```ts
const html = pureDocs.html({
  specUrl: '/openapi.json',
  title: 'My API',
  theme: 'auto',
});
// Returns a full self-contained HTML string — serve it however you want
```

---

## Configuration

### Web Component Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `spec-url` | `string` | OpenAPI spec URL (JSON or YAML) |
| `spec-json` | `string` | Inline OpenAPI object as JSON string |
| `theme` | `'light' \| 'dark' \| 'auto'` | Color theme (default: `auto`) |
| `title` | `string` | Portal title |
| `primary-color` | `string` | Accent color (hex) |

### Server API Options

| Option | Type | Description |
|--------|------|-------------|
| `specUrl` | `string` | OpenAPI spec URL |
| `spec` | `object` | Inline OpenAPI object |
| `title` | `string` | Portal title |
| `theme` | `'light' \| 'dark' \| 'auto'` | Color theme |
| `primaryColor` | `string` | Accent color |
| `route` | `string` | Route path (default: `/docs`) |

---

## Works with Any Framework

PureDocs is a standard Web Component. It works in any framework that supports custom elements:

- **React / Next.js** — `import 'puredocs/web'` then use `<pure-docs>` in JSX
- **Vue / Nuxt** — add `isCustomElement` config, then use `<pure-docs>` in templates
- **Angular** — add `CUSTOM_ELEMENTS_SCHEMA`, then use `<pure-docs>` in templates
- **Svelte** — use `<pure-docs>` directly
- **Plain HTML** — just add the `<script>` and `<link>` tags

---

## Development

```bash
bun run dev          # dev server with hot reload
bun run build        # production build
bun run typecheck    # type checking
```

## License

See [LICENSE](./LICENSE).
