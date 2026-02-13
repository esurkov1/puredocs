# PureDocs

`PureDocs` это UI-портал для OpenAPI, который делает документацию API визуально чистой, быстрой и удобной для ежедневной работы разработчиков.

Проект разработан [esurkov1](https://github.com/esurkov1).  
Исходный код открыт, и проект полностью бесплатен для некоммерческого использования.

## Что делает PureDocs

PureDocs превращает OpenAPI-спецификацию в полноценный интерактивный портал:

- обзор API с группами, схемами и webhooks;
- удобная навигация по роутам;
- встроенный `Try It` для отправки запросов прямо из документации;
- автоматическая генерация сниппетов (`cURL`, `JavaScript`, `Python`, `Go`);
- поиск по endpoint/тегам/схемам/Webhooks (`Cmd/Ctrl + K`);
- работа с auth-схемами (Bearer, Basic, API Key, OAuth2/OpenID Connect);
- поддержка JSON и YAML спецификаций.

## Ключевые преимущества

- Минимальная интеграция: один тег `<pure-docs>` и документация готова.
- Framework-agnostic: работает как Web Component, подходит для React/Vue/vanilla.
- Продуман для реальной разработки: окружения, авторизация, живые запросы, копирование готовых URL/примеров.
- Поддержка сложных API-структур: callbacks, webhooks, схемы, security requirements.
- Быстрая кастомизация внешнего вида: тема, цвет акцента и заголовок портала.

## Быстрый старт

### 1. Установка

```bash
npm install puredocs
# или
bun add puredocs
```

### 2. Подключение (ESM)

```html
<pure-docs spec-url="/openapi.json" theme="auto"></pure-docs>

<script type="module">
  import 'puredocs';
  import 'puredocs/style.css';
</script>
```

### 3. Готово

Если `spec-url` указывает на валидный OpenAPI (JSON/YAML), портал отрисуется автоматически.

## Подключение в проект

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

### Программное подключение (JS API)

```ts
import PureDocs from 'puredocs';
import 'puredocs/style.css';

PureDocs.mount({
  mount: '#docs',
  specUrl: '/openapi.yaml',
  theme: 'auto',
});
```

## Конфигурация через атрибуты

Элемент: `pure-docs`

- `spec-url`: URL OpenAPI файла
- `spec-json`: встроенная JSON-спека (строка JSON)
- `theme`: `light` | `dark` | `auto`
- `primary-color`: цвет акцента
- `base-path`: базовый путь роутера
- `default-environment`: окружение по умолчанию
- `environments-array`: JSON-массив URL для окружений
- `title`: заголовок в навигации

Пример:

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

## Runtime API элемента

```ts
const docs = document.querySelector('pure-docs');

docs.reload();
docs.getState();
docs.subscribe((state) => console.log(state));
docs.navigate('/operations/auth/post/auth%2Flogin');
docs.setToken('token');
docs.setEnvironment('api.example.com');
```

## Разработка

```bash
bun run dev
bun run typecheck
bun run build
```

## Важно знать

- Одновременно может быть смонтирован только один `<pure-docs>`.
- Состояние окружения и авторизации сохраняется в `localStorage`.
- Роутинг основан на `history` API.

## AI-скиллы для разработки

В проекте установлен **UI/UX Pro Max** скилл для улучшения дизайна и пользовательского опыта:

```bash
# Генерация дизайн-системы для компонентов
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "query" --design-system

# Подробнее см. .claude/UI-UX-PRO-MAX-INFO.md
```

Скилл предоставляет 67 UI-стилей, 96 цветовых палитр, 57 шрифтовых пар и автоматическую генерацию дизайн-систем.

## Лицензия

См. файл [`LICENSE`](./LICENSE).  
PureDocs бесплатен для некоммерческого использования.
