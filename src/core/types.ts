/* ─── Portal Configuration ─── */

export interface PortalConfig {
  /** CSS selector or HTMLElement to mount into */
  mount: string | HTMLElement;
  /** URL to fetch the OpenAPI spec from */
  specUrl?: string;
  /** Inline OpenAPI spec object */
  spec?: Record<string, unknown>;
  /** Portal title override */
  title?: string;
  /** Initial theme */
  theme?: 'light' | 'dark' | 'auto';
  /** Primary accent color (hex) */
  primaryColor?: string;
  /** Hide Try It console */
  hideTryIt?: boolean;
  /** Hide deprecated endpoints */
  hideDeprecated?: boolean;
  /** Hide schema viewer */
  hideSchemas?: boolean;
  /** Language */
  locale?: 'en' | 'ru';
  /** Plugin hooks */
  plugins?: PortalPlugin[];
}

/** Zero-boilerplate startup config: auto-create mount and optional CSS link injection */
export interface PortalBootstrapConfig extends Omit<PortalConfig, 'mount'> {
  /** Existing mount selector/element. If omitted, container is auto-created in body. */
  mount?: string | HTMLElement;
  /** Auto-created mount id when mount is omitted. Default: "puredocs". */
  mountId?: string;
  /** Apply minimal full-page layout styles. Default: true. */
  fullPage?: boolean;
  /** Optional stylesheet URL to inject once (useful for plain JS/UMD). */
  cssHref?: string;
}

export interface PortalEnvironment {
  name: string;
  baseUrl: string;
  variables?: Record<string, string>;
  bearerToken?: string;
}

export interface PortalPlugin {
  name: string;
  init?: (portal: PortalApi) => void;
  destroy?: () => void;
}

export interface PortalApi {
  getState: () => PortalState;
  subscribe: (fn: (state: PortalState) => void) => () => void;
  setToken: (token: string) => void;
  setEnvironment: (name: string) => void;
  navigate: (path: string) => void;
}

/* ─── Internal State ─── */

export interface PortalState {
  spec: ParsedSpec | null;
  loading: boolean;
  error: string | null;
  route: RouteInfo;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  searchOpen: boolean;
  activeEnvironment: string;
  environments: PortalEnvironment[];
  /** Canonical env list from config/spec — baseUrl reset to this when switching env */
  initialEnvironments: PortalEnvironment[];
  auth: AuthState;
  tryItState: TryItState | null;
}

export interface AuthState {
  /** Per-scheme configured values: schemeName -> value (token/apiKey/etc.) */
  schemes: Record<string, string>;
  /** Currently active scheme name */
  activeScheme: string;
  /** Derived token for requests (from active scheme) */
  token: string;
  locked: boolean;
  source: 'manual' | 'auto-body' | 'auto-header';
}

export interface TryItState {
  operationId: string;
  response: TryItResponse | null;
  loading: boolean;
}

export interface TryItResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
  size: number;
}

export interface RouteInfo {
  type: 'overview' | 'endpoint' | 'schema' | 'guide' | 'tag' | 'webhook';
  tag?: string;
  method?: string;
  path?: string;
  operationId?: string;
  schemaName?: string;
  guidePath?: string;
  webhookName?: string;
}

/* ─── Parsed OpenAPI ─── */

export interface ParsedSpec {
  raw: Record<string, unknown>;
  info: SpecInfo;
  servers: SpecServer[];
  tags: SpecTag[];
  operations: SpecOperation[];
  schemas: Record<string, SchemaObject>;
  securitySchemes: Record<string, SecurityScheme>;
  webhooks: SpecWebhook[];
}

export interface SpecInfo {
  title: string;
  description?: string;
  version: string;
  contact?: { name?: string; email?: string; url?: string };
  license?: { name: string; url?: string };
}

export interface SpecServer {
  url: string;
  description?: string;
  variables?: Record<string, { default: string; enum?: string[]; description?: string }>;
}

export interface SpecTag {
  name: string;
  description?: string;
  operations: SpecOperation[];
}

export interface SpecOperation {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  deprecated?: boolean;
  security?: SecurityRequirement[];
  resolvedSecurity?: OperationSecurityInfo;
  parameters: SpecParameter[];
  requestBody?: SpecRequestBody;
  responses: Record<string, SpecResponse>;
  callbacks?: SpecCallback[];
}

export interface SpecWebhook {
  /** Key from the webhooks object */
  name: string;
  method: string;
  /** URL template (usually runtime expression) */
  path: string;
  summary?: string;
  description?: string;
  security?: SecurityRequirement[];
  resolvedSecurity?: OperationSecurityInfo;
  parameters: SpecParameter[];
  requestBody?: SpecRequestBody;
  responses: Record<string, SpecResponse>;
}

export interface SpecCallback {
  /** Key from the callbacks object */
  name: string;
  operations: SpecOperation[];
}

export interface SpecParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: SchemaObject;
  example?: unknown;
  examples?: Record<string, SpecExample>;
  deprecated?: boolean;
}

export interface SpecRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, SpecMediaType>;
}

export interface SpecMediaType {
  schema?: SchemaObject;
  example?: unknown;
  examples?: Record<string, SpecExample>;
}

export interface SpecResponseHeader {
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
  example?: unknown;
  deprecated?: boolean;
}

export interface SpecResponse {
  statusCode: string;
  description?: string;
  headers?: Record<string, SpecResponseHeader>;
  content?: Record<string, SpecMediaType>;
}

export interface SpecExample {
  summary?: string;
  description?: string;
  value: unknown;
}

export interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
  description?: string;
  in?: string;
  name?: string;
  openIdConnectUrl?: string;
  flows?: Record<string, SecurityOAuthFlow>;
}

export interface SecurityOAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes?: Record<string, string>;
}

export type SecurityRequirement = Record<string, string[]>;

export interface ResolvedSecuritySchemeRequirement {
  schemeName: string;
  scopes: string[];
  scheme?: SecurityScheme;
}

export interface OperationSecurityInfo {
  explicitlyNoAuth: boolean;
  requirements: ResolvedSecuritySchemeRequirement[][];
}

/* ─── Schema ─── */

export interface SchemaObject {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: unknown;
  example?: unknown;
  examples?: unknown[];
  enum?: unknown[];
  const?: unknown;
  nullable?: boolean;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  required?: string[];
  properties?: Record<string, SchemaObject>;
  additionalProperties?: boolean | SchemaObject;
  items?: SchemaObject;
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  discriminator?: { propertyName: string; mapping?: Record<string, string> };
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  $ref?: string;
  [key: string]: unknown;
}

/* ─── Search ─── */

export interface SearchEntry {
  type: 'operation' | 'schema' | 'tag' | 'webhook';
  title: string;
  subtitle?: string;
  method?: string;
  requiresAuth?: boolean;
  authBadge?: string;
  authTitle?: string;
  resolvedSecurity?: OperationSecurityInfo;
  path?: string;
  tag?: string;
  operationId?: string;
  schemaName?: string;
  webhookName?: string;
  keywords: string;
}

/* ─── UI Badge ─── */

export type UiBadgeSize = 's' | 'm' | 'l';
export type UiBadgeKind = 'method' | 'status' | 'webhook' | 'required' | 'chip';
