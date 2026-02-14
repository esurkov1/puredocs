# PureDocs

`PureDocs` is a UI portal for OpenAPI that makes API documentation visually clean, fast, and convenient for developers' daily work.

PureDocs transforms an OpenAPI specification into a full-featured interactive portal:

- API overview with groups, schemas, and webhooks
- Convenient navigation through routes
- Built-in `Try It` console for sending requests directly from documentation
- Automatic code snippet generation (`cURL`, `JavaScript`, `Python`, `Go`)
- Search across endpoints/tags/schemas/webhooks (`Cmd/Ctrl + K`)
- Support for auth schemes (Bearer, Basic, API Key, OAuth2/OpenID Connect)
- Support for JSON and YAML specifications

## Key Advantages

- Minimal integration: one `<pure-docs>` tag and the documentation is ready
- Framework-agnostic: works as a Web Component, suitable for React/Vue/vanilla
- Designed for real development: environments, authorization, live requests, copying ready-to-use URLs/examples
- Support for complex API structures: callbacks, webhooks, schemas, security requirements
- Quick customization of appearance: theme, accent color, and portal title

## Quick Start

### 1. Installation

```bash
npm install puredocs
# or
bun add puredocs
```

### 2. Integration (ESM)

```html
<pure-docs spec-url="/openapi.json" theme="auto"></pure-docs>

<script type="module">
  import 'puredocs';
  import 'puredocs/style.css';
</script>
```

### 3. Done

If `spec-url` points to a valid OpenAPI (JSON/YAML), the portal will render automatically.

## Integration into Project

### HTML + script (UMD)

```html
<link rel="stylesheet" href="/assets/puredocs.css" />
<pure-docs spec-url="/openapi.yaml"></pure-docs>
<script src="/assets/puredocs.umd.cjs"></script>
```

### React

```tsx
import 'puredocs';
import 'puredocs/style.css';

export function ApiDocsPage() {
  return <pure-docs spec-url="/openapi.json" theme="auto" />;
}
```

### Vue

```vue
<template>
  <pure-docs spec-url="/openapi.json" theme="auto" />
</template>

<script setup lang="ts">
import 'puredocs';
import 'puredocs/style.css';
</script>
```

### Programmatic Integration (JS API)

```ts
import PureDocs from 'puredocs';
import 'puredocs/style.css';

PureDocs.mount({
  mount: '#docs',
  specUrl: '/openapi.yaml',
  theme: 'auto',
});
```

## Configuration via Attributes

Element: `pure-docs`

- `spec-url`: OpenAPI file URL
- `spec-json`: embedded JSON spec (JSON string)
- `default-environment`: default environment
- `environments-array`: JSON array of URLs for environments
- `base-path`: router base path
- `theme`: `light` | `dark` | `auto`
- `primary-color`: accent color
- `title`: navigation title

Example:

```html
<pure-docs
  spec-url="/openapi.json"
  environments-array='["https://api.dev.example.com","https://api.example.com"]'
  default-environment="api.dev.example.com"
  theme="auto"
  primary-color="#0ea5e9"
  title="Example API"
></pure-docs>
```

## Element Runtime API

```ts
const docs = document.querySelector('pure-docs');

docs.reload();
docs.getState();
docs.subscribe((state) => console.log(state));
docs.navigate('/operations/auth/post/auth%2Flogin');
docs.setToken('token');
docs.setEnvironment('api.example.com');
```

## Development

```bash
bun run dev
bun run typecheck
bun run build
```

## Important to Know

- Only one `<pure-docs>` can be mounted at a time
- Environment and authorization state is saved in `localStorage`
- Routing is based on the `history` API

## License

See the [`LICENSE`](./LICENSE) file.  
PureDocs is free for non-commercial use.

Developed by [esurkov1](https://github.com/esurkov1).  
