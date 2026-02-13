# puredocs

Framework-agnostic OpenAPI portal built with native Web Components.

`puredocs` renders a full API docs experience using a single custom element: `<pure-docs>`.
No framework adapters are required.

## Install

```bash
bun add puredocs
# or
npm install puredocs
```

## Quick start (ESM)

```html
<pure-docs spec-url="/openapi.json" theme="auto"></pure-docs>
<script type="module">
  import 'puredocs';
  import 'puredocs/style.css';
</script>
```

## Quick start (UMD / script tag)

```html
<link rel="stylesheet" href="/assets/puredocs.css" />
<pure-docs spec-url="/openapi.json"></pure-docs>
<script src="/assets/puredocs.umd.cjs"></script>
```

## Public API

### Custom element

Package registration defines one element: `pure-docs`.

### Attributes

- `spec-url`
- `spec-json`
- `theme` (`light` | `dark` | `auto`)
- `primary-color`
- `font-family`
- `code-font-family`
- `base-path`
- `default-environment`
- `environments-array` (JSON-массив URL строк)
- `spec-sources-json`
- `title`
- `logo`
- `favicon`
- `class-name`

JSON attributes accept serialized JSON strings.

### Runtime methods on element

```ts
const el = document.querySelector('pure-docs');

el.reload();
el.getState();
el.subscribe((state) => console.log(state));
el.navigate('/operations/auth/post/auth%2Flogin');
el.setToken('token');
el.setEnvironment('Production');
el.switchSpec('v2');
```

## Framework usage

### React

```tsx
import 'puredocs';
import 'puredocs/style.css';

export function Docs() {
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

### Vanilla JS

```html
<pure-docs id="docs" spec-url="/openapi.json"></pure-docs>
<script type="module">
  import 'puredocs';
  import 'puredocs/style.css';

  const docs = document.getElementById('docs');
  docs.setAttribute('theme', 'dark');
</script>
```

## Build output

```txt
dist/
├── puredocs.js
├── puredocs.umd.cjs
├── puredocs.css
└── index.d.ts
```

## Development

```bash
cd packages/puredocs
bun run dev
bun run typecheck
bun run build
```

## Notes

- Custom element names must include a dash (`-`), so the valid tag is `<pure-docs>`.
- Routing works in `history` mode only.
- Portal state (environment + auth) is persisted in `localStorage`.
- No Fastify/Express plugin is bundled.
