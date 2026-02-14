# PureDocs

`PureDocs` transforms OpenAPI specs into an interactive docs portal with search, auth handling, and live requests.

**Full OpenAPI 3.1 support** — paths, callbacks (runtime expressions), webhooks, all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, TRACE), security schemes (Bearer, Basic, API Key, OAuth2), JSON Schema references, and JSON/YAML input.

## Installation

```bash
npm install puredocs
# or
bun add puredocs
```

## One Import API

```ts
import { pureDocs } from 'puredocs';
```

## API Methods (3)

1. `pureDocs.html()` - universal inline HTML (JS/CSS embedded)
2. `pureDocs.express()` - one-line Express route
3. `pureDocs.fastify()` - one-line Fastify route

## 1) `pureDocs.html()`

Generates full ready-to-send HTML with inline JS/CSS.

```ts
import { pureDocs } from 'puredocs';

const html = pureDocs.html({
  specUrl: '/openapi.json',
  title: 'My API',
  theme: 'auto',
});
```

## 2) `pureDocs.express()`

Registers route in one line and returns generated HTML.

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

## 3) `pureDocs.fastify()`

Registers route in one line and returns generated HTML.

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

## UMD Manual Setup (without `pureDocs` API)

This is a direct browser integration via stylesheet + script + web component. Pass parameters as attributes:

```html
<link rel="stylesheet" href="/assets/puredocs.css" />

<pure-docs
  spec-url="/openapi.json"
  theme="auto"
  title="My API"
  primary-color="#0ea5e9"
></pure-docs>

<script src="/assets/puredocs.umd.js"></script>
```

### UMD Attributes

| Attribute | Description |
|-----------|-------------|
| `spec-url` | OpenAPI URL (JSON/YAML) |
| `spec-json` | Inline OpenAPI object (JSON string) |
| `theme` | `light` \| `dark` \| `auto` |
| `title` | Docs title inside portal |
| `primary-color` | Accent color (hex) |

Servers/environments are taken from the OpenAPI `servers` array.

## CommonJS

```js
const { pureDocs } = require('puredocs');
```

## Options

Common options (for `html()`, `express()`, `fastify()`, and `PureDocs.bootstrap()`):

- `specUrl`: OpenAPI URL (JSON/YAML)
- `spec`: inline OpenAPI object
- `title`: docs title inside portal (HTML `<title>` auto-generated as `{title} — pureDocs`)
- `theme`: `light` | `dark` | `auto`
- `primaryColor`: accent color

Servers/environments come from the OpenAPI spec `servers` array.

Wrapper-only option:

- `route`: route path for `express()` and `fastify()` (default: `/docs`)

## URL Structure

PureDocs uses clean, human-readable URLs for navigation:

### Endpoint Routes

Format: `/{category}/{method}-{path-slug}`

Examples:
- `/users/get-users` — GET /users
- `/users/get-users-id` — GET /users/{id}
- `/auth/post-login` — POST /auth/login
- `/products/put-products-id` — PUT /products/{id}

The path slug is automatically generated from the API path:
- Path parameters like `{id}` are converted to readable segments
- Slashes are replaced with dashes
- Special characters are normalized

### Category Pages

Format: `/{category}`

Examples:
- `/users` — All endpoints in the "users" category
- `/auth` — All endpoints in the "auth" category

### Other Routes

- `/` — Overview/home page
- `/schemas/{name}` — Schema details
- `/webhooks/{name}` — Webhook details

This structure ensures:
- ✅ URLs work correctly when refreshing the page
- ✅ Deep linking to specific endpoints
- ✅ Readable and shareable links
- ✅ SEO-friendly structure

## Browser Web Component Entry

If you need direct browser import instead of server API:

```ts
import 'puredocs/web';
import 'puredocs/style.css';
```

## Demo and Landing

- Landing: `apps/landing/index.html`
- Interactive demo: `apps/demo/index.html`
- Demo OpenAPI spec: `apps/demo/public/sample-spec.json`

On GitHub Pages:

- `/` -> landing
- `/demo/` -> live demo with the showcase spec

## Development

```bash
npm run dev
npm run typecheck
npm run build
```

## License

See [`LICENSE`](./LICENSE).
