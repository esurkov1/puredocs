import type { TryItResponse } from '../core/types';
import { store } from '../core/state';

interface RequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  /** Timeout in ms */
  timeout?: number;
}

/** Execute an HTTP request for the Try It console */
export async function executeRequest(config: RequestConfig): Promise<TryItResponse> {
  const { method, url, headers = {}, body, timeout = 30000 } = config;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const start = performance.now();

  try {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: isFormData ? undefined : headers,
      signal: controller.signal,
      credentials: 'include',
    };

    // For FormData, don't set Content-Type — browser adds boundary automatically
    // Also skip headers object to avoid overriding Content-Type
    if (isFormData) {
      // Re-add non-Content-Type headers
      const cleanHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(headers)) {
        if (k.toLowerCase() !== 'content-type') cleanHeaders[k] = v;
      }
      if (Object.keys(cleanHeaders).length > 0) fetchOptions.headers = cleanHeaders;
    }

    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const duration = performance.now() - start;
    const responseBody = await response.text();
    const size = new TextEncoder().encode(responseBody).length;

    // Collect response headers (lowercase keys for case-insensitive lookup)
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });

    // Auto-capture Bearer token
    autoCaptureBearerToken(responseBody, responseHeaders);

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      duration,
      size,
    };
  } catch (error) {
    const duration = performance.now() - start;
    if ((error as Error).name === 'AbortError') {
      return {
        status: 0,
        statusText: 'Request timed out',
        headers: {},
        body: `Request timed out after ${timeout}ms`,
        duration,
        size: 0,
      };
    }
    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      body: (error as Error).message || 'Unknown network error',
      duration,
      size: 0,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Auto-capture Bearer token from response */
function autoCaptureBearerToken(body: string, headers: Record<string, string>): void {
  const auth = store.get().auth;
  if (auth.locked) return;

  // Find bearer scheme name from spec
  const spec = store.get().spec;
  let bearerSchemeName = auth.activeScheme;
  if (spec) {
    for (const [name, scheme] of Object.entries(spec.securitySchemes)) {
      if (scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'bearer') {
        bearerSchemeName = name;
        break;
      }
    }
  }

  // Priority 1: x-new-access-token header (lowercase after normalize)
  const headerToken = headers['x-new-access-token'];
  if (headerToken) {
    if (bearerSchemeName) {
      store.setSchemeValue(bearerSchemeName, headerToken);
      store.setAuth({ source: 'auto-header' });
    } else {
      store.setAuth({ token: headerToken, source: 'auto-header' });
    }
    return;
  }

  // Priority 2: accessToken from JSON response body
  try {
    const json = JSON.parse(body);
    const token = json.accessToken || json.access_token || json.token;
    if (typeof token === 'string' && token.length > 10) {
      if (bearerSchemeName) {
        store.setSchemeValue(bearerSchemeName, token);
        store.setAuth({ source: 'auto-body' });
      } else {
        store.setAuth({ token, source: 'auto-body' });
      }
    }
  } catch {
    // Not JSON — skip
  }
}

/** Build full URL from base, path, and parameters */
export function buildRequestUrl(
  baseUrl: string,
  pathTemplate: string,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
): string {
  let url = pathTemplate;

  // Replace path parameters
  for (const [key, value] of Object.entries(pathParams)) {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  }

  // Build full URL
  const base = baseUrl.replace(/\/+$/, '');
  const fullUrl = base + url;

  // Add query parameters
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) searchParams.set(key, value);
  }

  const queryString = searchParams.toString();
  return queryString ? `${fullUrl}?${queryString}` : fullUrl;
}
