# PureDocs

Beautiful, interactive API documentation from any OpenAPI spec. One Web Component — zero config.

![PureDocs Screenshot](assets/screenshot.png)

## Full OpenAPI 3.1 Support

PureDocs fully supports the **OpenAPI 3.1** specification:

- **Paths** — all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, TRACE)
- **Callbacks** — including runtime expressions
- **Webhooks** — first-class webhook documentation
- **Security schemes** — Bearer, Basic, API Key, OAuth2, OpenID Connect
- **JSON Schema** — `$ref` resolution, `oneOf` / `anyOf` / `allOf`, nested objects, arrays
- **Input formats** — JSON and YAML spec files
- **Servers** — environments from the `servers` array with switching support

## Installation

```bash
npm install puredocs
# or
bun add puredocs
# or
yarn add puredocs
# or
pnpm add puredocs
```

## Quick Start

### HTML / Vanilla JS

```html
<pure-docs
  spec-url="/openapi.json"
  theme="auto"
  title="My API"
></pure-docs>

<script type="module">
  import 'puredocs/web';
  import 'puredocs/style.css';
</script>
```

### React

```tsx
// app/docs/page.tsx (Next.js) or src/pages/Docs.tsx (Vite/CRA)
import 'puredocs/web';
import 'puredocs/style.css';

export default function DocsPage() {
  return (
    <pure-docs
      spec-url="/openapi.json"
      theme="auto"
      title="My API"
      primary-color="#0ea5e9"
    />
  );
}
```

> For TypeScript, add a global declaration for the custom element:
>
> ```ts
> // types/puredocs.d.ts
> declare namespace JSX {
>   interface IntrinsicElements {
>     'pure-docs': React.DetailedHTMLProps<
>       React.HTMLAttributes<HTMLElement> & {
>         'spec-url'?: string;
>         'spec-json'?: string;
>         theme?: 'light' | 'dark' | 'auto';
>         title?: string;
>         'primary-color'?: string;
>       },
>       HTMLElement
>     >;
>   }
> }
> ```

### Vue

```vue
<!-- src/views/DocsView.vue -->
<template>
  <pure-docs
    spec-url="/openapi.json"
    theme="auto"
    title="My API"
    primary-color="#0ea5e9"
  />
</template>

<script setup lang="ts">
import 'puredocs/web';
import 'puredocs/style.css';
</script>
```

> In `vite.config.ts`, tell Vue to treat `pure-docs` as a custom element:
>
> ```ts
> // vite.config.ts
> export default defineConfig({
>   plugins: [
>     vue({
>       template: {
>         compilerOptions: {
>           isCustomElement: (tag) => tag === 'pure-docs',
>         },
>       },
>     }),
>   ],
> });
> ```

### Angular

```ts
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class AppModule {}
```

```ts
// docs.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-docs',
  template: `
    <pure-docs
      spec-url="/openapi.json"
      theme="auto"
      title="My API"
      primary-color="#0ea5e9"
    ></pure-docs>
  `,
})
export class DocsComponent implements OnInit {
  ngOnInit() {
    import('puredocs/web');
    import('puredocs/style.css');
  }
}
```

### Nuxt 3

```vue
<!-- pages/docs.vue -->
<template>
  <pure-docs
    spec-url="/openapi.json"
    theme="auto"
    title="My API"
  />
</template>

<script setup>
if (import.meta.client) {
  await import('puredocs/web');
  await import('puredocs/style.css');
}
</script>
```

## Server-Side API

PureDocs also provides server wrappers for Express and Fastify that generate self-contained HTML.

```ts
import { pureDocs } from 'puredocs';
```

### Express

```ts
import express from 'express';
import { pureDocs } from 'puredocs';

const app = express();

pureDocs.express(app, {
  route: '/docs',
  specUrl: '/openapi.json',
  title: 'My API',
  theme: 'auto',
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
  title: 'My API',
  theme: 'auto',
});

await app.listen({ port: 3000 });
```

### Raw HTML

```ts
const html = pureDocs.html({
  specUrl: '/openapi.json',
  title: 'My API',
  theme: 'auto',
});
// Returns full HTML string with embedded JS/CSS — serve it however you want
```

## UMD (CDN / No Bundler)

```html
<link rel="stylesheet" href="https://unpkg.com/puredocs/dist/puredocs.css" />

<pure-docs
  spec-url="/openapi.json"
  theme="auto"
  title="My API"
  primary-color="#0ea5e9"
></pure-docs>

<script src="https://unpkg.com/puredocs/dist/puredocs.umd.js"></script>
```

## CommonJS

```js
const { pureDocs } = require('puredocs');
```

## Attributes

| Attribute | Description |
|-----------|-------------|
| `spec-url` | OpenAPI spec URL (JSON or YAML) |
| `spec-json` | Inline OpenAPI object (JSON string) |
| `theme` | `light` \| `dark` \| `auto` |
| `title` | Title displayed inside the portal |
| `primary-color` | Accent color (hex) |

Servers and environments are taken from the OpenAPI `servers` array.

## Options (Server API)

| Option | Description |
|--------|-------------|
| `specUrl` | OpenAPI spec URL |
| `spec` | Inline OpenAPI object |
| `title` | Portal title (HTML `<title>` auto-set as `{title} — pureDocs`) |
| `theme` | `light` \| `dark` \| `auto` |
| `primaryColor` | Accent color |
| `route` | Route path for `express()` / `fastify()` (default: `/docs`) |

## URL Structure

PureDocs generates clean, human-readable URLs:

| Pattern | Example | Description |
|---------|---------|-------------|
| `/` | `/` | Overview page |
| `/{tag}` | `/users` | Tag (category) page |
| `/{tag}/{method}-{slug}` | `/users/get-users-id` | Endpoint page |
| `/schemas/{name}` | `/schemas/User` | Schema details |
| `/webhooks/{name}` | `/webhooks/orderCreated` | Webhook details |

URLs support deep linking, page refresh, and sharing.

## Development

```bash
bun run dev        # dev server
bun run build      # production build
bun run typecheck   # type checking
```

## License

See [`LICENSE`](./LICENSE).
