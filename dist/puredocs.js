class wa {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set(), this.state = this.defaultState();
  }
  defaultState() {
    return {
      spec: null,
      loading: !0,
      error: null,
      route: { type: "overview" },
      theme: "light",
      sidebarOpen: !0,
      searchOpen: !1,
      activeEnvironment: "default",
      environments: [{ name: "default", baseUrl: "" }],
      initialEnvironments: [{ name: "default", baseUrl: "" }],
      auth: { schemes: {}, activeScheme: "", token: "", locked: !1, source: "manual" },
      tryItState: null,
      specSources: [],
      activeSpecSource: ""
    };
  }
  get() {
    return this.state;
  }
  set(t) {
    this.state = { ...this.state, ...t }, this.notify();
  }
  setAuth(t) {
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, ...t }
    }, this.notify();
  }
  /** Update a specific scheme value and sync token if it's the active scheme */
  setSchemeValue(t, n) {
    const a = { ...this.state.auth.schemes, [t]: n }, s = t, r = n;
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, schemes: a, activeScheme: s, token: r, source: "manual" }
    }, this.notify();
  }
  setTryIt(t) {
    t === null ? this.state = { ...this.state, tryItState: null } : this.state = {
      ...this.state,
      tryItState: { ...this.state.tryItState, ...t }
    }, this.notify();
  }
  setRoute(t) {
    this.state = { ...this.state, route: t }, this.notify();
  }
  /** Switch active environment */
  setActiveEnvironment(t) {
    this.state = { ...this.state, activeEnvironment: t }, this.notify();
  }
  subscribe(t) {
    return this.listeners.add(t), () => this.listeners.delete(t);
  }
  notify() {
    for (const t of this.listeners)
      try {
        t(this.state);
      } catch (n) {
        console.error("[ApiPortal] Subscriber error:", n);
      }
  }
  reset() {
    this.state = this.defaultState(), this.listeners.clear();
  }
}
const y = new wa();
let $t = "";
function Ca(e = "") {
  $t = e.replace(/\/$/, ""), window.addEventListener("popstate", qt), qt();
}
function re(e) {
  window.history.pushState(null, "", $t + e), qt();
}
function Aa() {
  const e = window.location.pathname;
  return $t ? e.replace($t, "") || "/" : e;
}
function gs(e) {
  const t = e.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!t || t === "/")
    return { type: "overview" };
  const n = t.match(/^operations\/([^/]+)\/([^/]+)\/(.+)$/);
  if (n)
    return {
      type: "endpoint",
      tag: decodeURIComponent(n[1]),
      method: n[2].toLowerCase(),
      path: "/" + decodeURIComponent(n[3])
    };
  const a = t.match(/^tags\/([^/]+)$/);
  if (a)
    return { type: "tag", tag: decodeURIComponent(a[1]) };
  const s = t.match(/^schemas\/(.+)$/);
  if (s)
    return { type: "schema", schemaName: decodeURIComponent(s[1]) };
  const r = t.match(/^webhooks\/(.+)$/);
  if (r)
    return { type: "webhook", webhookName: decodeURIComponent(r[1]) };
  const o = t.match(/^guides\/(.+)$/);
  return o ? { type: "guide", guidePath: decodeURIComponent(o[1]) } : { type: "overview" };
}
function oe(e) {
  switch (e.type) {
    case "overview":
      return "/";
    case "tag":
      return `/tags/${encodeURIComponent(e.tag || "")}`;
    case "endpoint":
      return `/operations/${encodeURIComponent(e.tag || "default")}/${e.method}/${encodeURIComponent((e.path || "/").slice(1))}`;
    case "schema":
      return `/schemas/${encodeURIComponent(e.schemaName || "")}`;
    case "webhook":
      return `/webhooks/${encodeURIComponent(e.webhookName || "")}`;
    case "guide":
      return `/guides/${encodeURIComponent(e.guidePath || "")}`;
    default:
      return "/";
  }
}
function qt() {
  const e = Aa(), t = gs(e);
  y.setRoute(t);
}
function La() {
  window.removeEventListener("popstate", qt);
}
function vt(e) {
  if (e === void 0) return;
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!n || typeof n != "object" || Array.isArray(n)) continue;
    const a = {};
    for (const [s, r] of Object.entries(n)) {
      const o = Array.isArray(r) ? r.map((c) => String(c)) : [];
      a[s] = o;
    }
    t.push(a);
  }
  return t;
}
function vn(e, t, n) {
  if (!e || e.length === 0)
    return { explicitlyNoAuth: n, requirements: [] };
  const a = e.map((s) => Object.entries(s).map(([r, o]) => ({
    schemeName: r,
    scopes: Array.isArray(o) ? o : [],
    scheme: t[r]
  })));
  return { explicitlyNoAuth: n, requirements: a };
}
function le(e) {
  return !!(e && !e.explicitlyNoAuth && e.requirements.length > 0);
}
function bn(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function Oa(e) {
  if (!le(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const a of e.requirements)
    for (const s of a) {
      const r = bn(s.scheme);
      t.has(r) || (t.add(r), n.push(r));
    }
  return n;
}
function vs(e) {
  const t = Oa(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function st(e) {
  return le(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((a) => {
    const s = bn(a.scheme);
    return a.scopes.length > 0 ? `${s} [${a.scopes.join(", ")}]` : s;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function Ut(e, t, n, a) {
  const s = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!le(e)) return s;
  for (const c of e.requirements) {
    if (!c.every((p) => !!t[p.schemeName]) && c.length > 0) continue;
    const l = Gn(c, t);
    if (Object.keys(l.headers).length > 0 || Object.keys(l.query).length > 0 || Object.keys(l.cookies).length > 0)
      return l;
  }
  return !a || !n ? s : Gn([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: a });
}
function Ta(e) {
  const t = {};
  if (!le(e)) return t;
  const n = e.requirements[0] || [];
  for (const a of n) {
    const s = a.scheme;
    if (s) {
      if (s.type === "http") {
        const r = (s.scheme || "").toLowerCase();
        r === "bearer" ? t.Authorization = "Bearer <token>" : r === "basic" ? t.Authorization = "Basic <credentials>" : t.Authorization = "<token>";
        continue;
      }
      s.type === "apiKey" && s.in === "header" && s.name && (t[s.name] = `<${s.name}>`);
    }
  }
  return t;
}
function Gn(e, t) {
  const n = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  for (const a of e) {
    const s = a.scheme, r = t[a.schemeName];
    if (!(!s || !r)) {
      if (n.matchedSchemeNames.push(a.schemeName), s.type === "http") {
        const o = (s.scheme || "").toLowerCase();
        o === "bearer" ? n.headers.Authorization = `Bearer ${r}` : o === "basic" ? n.headers.Authorization = `Basic ${r}` : n.headers.Authorization = r;
        continue;
      }
      if (s.type === "oauth2" || s.type === "openIdConnect") {
        n.headers.Authorization = `Bearer ${r}`;
        continue;
      }
      s.type === "apiKey" && s.name && (s.in === "query" ? n.query[s.name] = r : s.in === "cookie" ? n.cookies[s.name] = r : n.headers[s.name] = r);
    }
  }
  return n;
}
const _a = 50, Ra = 200;
function bs(e) {
  const t = Ma(e.info || {}), n = $a(e.servers || []), a = e.components || {}, s = Ba(a.schemas || {}, e), r = qa(a.securitySchemes || {}), o = vt(e.security), c = e.paths || {}, d = {};
  for (const [v, h] of Object.entries(c))
    v.startsWith("/docs") || (d[v] = h);
  const l = ja(d, e, o, r), p = Ua(l, e.tags || []), f = Pa(e.webhooks || {}, e, o, r);
  return { raw: e, info: t, servers: n, tags: p, operations: l, schemas: s, securitySchemes: r, webhooks: f };
}
function Ma(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function $a(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function qa(e) {
  const t = {};
  for (const [n, a] of Object.entries(e)) {
    const s = a;
    t[n] = {
      type: String(s.type || ""),
      scheme: s.scheme ? String(s.scheme) : void 0,
      bearerFormat: s.bearerFormat ? String(s.bearerFormat) : void 0,
      description: s.description ? String(s.description) : void 0,
      in: s.in ? String(s.in) : void 0,
      name: s.name ? String(s.name) : void 0,
      openIdConnectUrl: s.openIdConnectUrl ? String(s.openIdConnectUrl) : void 0,
      flows: s.flows && typeof s.flows == "object" ? s.flows : void 0
    };
  }
  return t;
}
const mt = /* @__PURE__ */ new Map();
let yn = 0;
function Ia(e, t) {
  if (mt.has(e)) return mt.get(e);
  if (++yn > Ra) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((s) => decodeURIComponent(s.replace(/~1/g, "/").replace(/~0/g, "~")));
  let a = t;
  for (const s of n)
    if (a && typeof a == "object" && !Array.isArray(a))
      a = a[s];
    else
      return;
  return mt.set(e, a), a;
}
function fe(e, t, n = 0, a = /* @__PURE__ */ new Set()) {
  if (n > _a || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((o) => fe(o, t, n + 1, a));
  const s = e;
  if (typeof s.$ref == "string") {
    const o = s.$ref;
    if (a.has(o)) return { type: "object", description: "[Circular reference]" };
    const c = new Set(a);
    c.add(o);
    const d = Ia(o, t);
    return d && typeof d == "object" ? fe(d, t, n + 1, c) : d;
  }
  const r = {};
  for (const [o, c] of Object.entries(s))
    r[o] = fe(c, t, n + 1, a);
  return r;
}
function Ba(e, t) {
  mt.clear(), yn = 0;
  const n = {};
  for (const [a, s] of Object.entries(e))
    n[a] = fe(s, t);
  return n;
}
function ja(e, t, n, a) {
  mt.clear(), yn = 0;
  const s = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, c] of Object.entries(e)) {
    if (!c || typeof c != "object") continue;
    const d = vt(c.security), l = Array.isArray(c.parameters) ? c.parameters.map((p) => fe(p, t)) : [];
    for (const p of r) {
      const f = c[p];
      if (!f) continue;
      const v = ys(
        p,
        o,
        f,
        l,
        t,
        d,
        n,
        a
      );
      s.push(v);
    }
  }
  return s;
}
function ys(e, t, n, a, s, r = void 0, o = void 0, c = {}) {
  const d = Array.isArray(n.parameters) ? n.parameters.map((M) => fe(M, s)) : [], l = [...a];
  for (const M of d) {
    const I = l.findIndex((T) => T.name === M.name && T.in === M.in);
    I >= 0 ? l[I] = M : l.push(M);
  }
  const p = xs(l, s);
  let f = Es(n.requestBody, s);
  if (Array.isArray(n["x-doc-examples"])) {
    const M = n["x-doc-examples"], I = [];
    for (let T = 0; T < M.length; T++) {
      const _ = M[T], X = _.scenario ? String(_.scenario) : `Example ${T + 1}`, z = _.request?.body;
      z !== void 0 && I.push({ summary: X, value: z });
    }
    if (I.length > 0) {
      f || (f = { required: !1, content: {} });
      const T = f.content["application/json"] || f.content["application/vnd.api+json"] || {};
      f.content["application/json"] || (f.content["application/json"] = T);
      const _ = f.content["application/json"];
      _.examples || (_.examples = {});
      for (let X = 0; X < I.length; X++) {
        const J = I[X], xe = `${J.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${X}`.replace(/^-/, "");
        _.examples[xe] = { summary: J.summary, description: J.summary, value: J.value };
      }
    }
  }
  const v = Ss(n.responses, s), h = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], b = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), m = Object.prototype.hasOwnProperty.call(n, "security"), k = vt(n.security), E = m ? k : r ?? o, L = m && Array.isArray(k) && k.length === 0, j = Ha(n.callbacks, s, c), C = {
    operationId: b,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: h,
    deprecated: !!n.deprecated,
    security: E,
    resolvedSecurity: vn(E, c, L),
    parameters: p,
    requestBody: f,
    responses: v
  };
  return j.length > 0 && (C.callbacks = j), C;
}
function Pa(e, t, n, a) {
  if (!e || typeof e != "object") return [];
  const s = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, c] of Object.entries(e)) {
    if (!c || typeof c != "object") continue;
    const d = fe(c, t), l = vt(d.security);
    for (const p of r) {
      const f = d[p];
      if (!f) continue;
      const v = Object.prototype.hasOwnProperty.call(f, "security"), h = vt(f.security), b = v ? h : l ?? n, m = v && Array.isArray(h) && h.length === 0, k = Array.isArray(f.parameters) ? f.parameters.map((C) => fe(C, t)) : [], E = xs(k, t), L = Es(f.requestBody, t), j = Ss(f.responses, t);
      s.push({
        name: o,
        method: p,
        path: o,
        summary: f.summary ? String(f.summary) : void 0,
        description: f.description ? String(f.description) : void 0,
        security: b,
        resolvedSecurity: vn(b, a, m),
        parameters: E,
        requestBody: L,
        responses: j
      });
    }
  }
  return s;
}
function xs(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? fe(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? ks(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function Es(e, t) {
  if (!e) return;
  const n = fe(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: Ns(n.content || {}, t)
  };
}
function Da(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const r = fe(s, t), o = r.schema, c = r.example ?? (o && typeof o == "object" ? o.example : void 0);
    n[a] = {
      description: r.description ? String(r.description) : void 0,
      required: !!r.required,
      schema: o && typeof o == "object" ? fe(o, t) : void 0,
      example: c !== void 0 ? c : void 0,
      deprecated: !!r.deprecated
    };
  }
  return n;
}
function Ss(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, s] of Object.entries(e)) {
    const r = fe(s, t), o = r.headers;
    n[a] = {
      statusCode: a,
      description: r.description ? String(r.description) : void 0,
      headers: o ? Da(o, t) : void 0,
      content: r.content ? Ns(r.content, t) : void 0
    };
  }
  return n;
}
function Ha(e, t, n) {
  if (!e || typeof e != "object") return [];
  const a = [], s = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [r, o] of Object.entries(e)) {
    const c = fe(o, t);
    if (!c || typeof c != "object") continue;
    const d = [];
    for (const [l, p] of Object.entries(c))
      if (!(!p || typeof p != "object"))
        for (const f of s) {
          const v = p[f];
          v && d.push(ys(f, l, v, [], t, void 0, void 0, n));
        }
    d.length > 0 && a.push({ name: r, operations: d });
  }
  return a;
}
function Ns(e, t) {
  const n = {};
  for (const [a, s] of Object.entries(e)) {
    const r = s;
    n[a] = {
      schema: r.schema ? fe(r.schema, t) : void 0,
      example: r.example,
      examples: r.examples ? ks(r.examples) : void 0
    };
  }
  return n;
}
function ks(e) {
  const t = {};
  for (const [n, a] of Object.entries(e)) {
    const s = a;
    t[n] = {
      summary: s.summary ? String(s.summary) : void 0,
      description: s.description ? String(s.description) : void 0,
      value: s.value
    };
  }
  return t;
}
function Ua(e, t) {
  const n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  for (const o of t)
    a.set(String(o.name), String(o.description || ""));
  for (const o of e)
    for (const c of o.tags)
      n.has(c) || n.set(c, []), n.get(c).push(o);
  const s = [], r = /* @__PURE__ */ new Set();
  for (const o of t) {
    const c = String(o.name);
    r.has(c) || (r.add(c), s.push({
      name: c,
      description: a.get(c),
      operations: n.get(c) || []
    }));
  }
  for (const [o, c] of n)
    r.has(o) || (r.add(o), s.push({ name: o, description: a.get(o), operations: c }));
  return s;
}
function We(e) {
  if (e) {
    if (e.example !== void 0) return e.example;
    if (e.default !== void 0) return e.default;
    if (e.enum && e.enum.length > 0) return e.enum[0];
    switch (e.type) {
      case "string":
        return e.format === "date-time" ? "2025-01-15T10:30:00Z" : e.format === "date" ? "2025-01-15" : e.format === "email" ? "user@example.com" : e.format === "uri" || e.format === "url" ? "https://example.com" : e.format === "uuid" ? "550e8400-e29b-41d4-a716-446655440000" : e.format === "password" ? "********" : "string";
      case "number":
      case "integer":
        return e.minimum !== void 0 ? e.minimum : (e.type === "integer", 0);
      case "boolean":
        return !0;
      case "array":
        if (e.items) {
          const t = We(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, a] of Object.entries(e.properties))
            t[n] = We(a);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const a = We(n);
            a && typeof a == "object" && !Array.isArray(a) && Object.assign(t, a);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return We(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return We(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, a] of Object.entries(e.properties))
            t[n] = We(a);
          return t;
        }
        return;
    }
  }
}
async function ws(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return require("js-yaml").load(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let tt = [];
const Jn = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function Cs(e) {
  tt = [];
  for (const t of e.tags)
    tt.push({
      type: "tag",
      title: t.name,
      subtitle: t.description,
      tag: t.name,
      keywords: `${t.name} ${t.description || ""}`.toLowerCase()
    });
  for (const t of e.operations)
    tt.push({
      type: "operation",
      title: t.summary || t.operationId,
      subtitle: t.path,
      method: t.method,
      requiresAuth: le(t.resolvedSecurity),
      authBadge: vs(t.resolvedSecurity) || void 0,
      authTitle: le(t.resolvedSecurity) ? st(t.resolvedSecurity) : void 0,
      resolvedSecurity: t.resolvedSecurity,
      path: t.path,
      tag: t.tags[0],
      operationId: t.operationId,
      keywords: `${t.method} ${t.path} ${t.summary || ""} ${t.description || ""} ${t.operationId} ${t.tags.join(" ")}`.toLowerCase()
    });
  for (const [t, n] of Object.entries(e.schemas))
    tt.push({
      type: "schema",
      title: t,
      subtitle: n.description || "Schema",
      schemaName: t,
      keywords: `${t} ${n.description || ""} schema model`.toLowerCase()
    });
  if (e.webhooks)
    for (const t of e.webhooks)
      tt.push({
        type: "webhook",
        title: t.summary || t.name,
        subtitle: `${t.method.toUpperCase()} Webhook`,
        method: t.method,
        webhookName: t.name,
        keywords: `${t.name} ${t.method} ${t.summary || ""} ${t.description || ""} webhook`.toLowerCase()
      });
}
function za(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), a = [];
  for (const s of tt) {
    let r = 0, o = !0;
    for (const c of n)
      s.keywords.includes(c) ? (r += 1, s.title.toLowerCase().includes(c) && (r += 3), s.path?.toLowerCase().includes(c) && (r += 2), s.method?.toLowerCase() === c && (r += 2)) : o = !1;
    o && r > 0 && a.push({ entry: s, score: r });
  }
  return a.sort((s, r) => {
    const o = Jn[s.entry.type] ?? 99, c = Jn[r.entry.type] ?? 99;
    return o !== c ? o - c : r.score !== s.score ? r.score - s.score : s.entry.title.localeCompare(r.entry.title);
  }).slice(0, t).map((s) => s.entry);
}
const As = "puredocs-theme";
function Xn(e, t, n) {
  e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color"), n?.fontFamily ? e.style.setProperty("--font-family-base", n.fontFamily) : e.style.removeProperty("--font-family-base"), n?.codeFontFamily ? e.style.setProperty("--font-family-mono", n.codeFontFamily) : e.style.removeProperty("--font-family-mono");
}
function Fa() {
  const t = y.get().theme === "light" ? "dark" : "light";
  y.set({ theme: t });
  try {
    localStorage.setItem(As, t);
  } catch {
  }
}
function Wa(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(As);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function Ls(e) {
  const t = e.trim();
  return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function Yn(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function i(e, t, ...n) {
  const a = document.createElement(e);
  if (t)
    for (const [s, r] of Object.entries(t))
      r === void 0 || r === !1 || (s.startsWith("on") && typeof r == "function" ? a.addEventListener(s.slice(2).toLowerCase(), r) : s === "className" ? a.className = String(r) : s === "innerHTML" ? a.innerHTML = String(r) : s === "textContent" ? a.textContent = String(r) : r === !0 ? a.setAttribute(s, "") : a.setAttribute(s, String(r)));
  for (const s of n)
    s == null || s === !1 || (typeof s == "string" ? a.appendChild(document.createTextNode(s)) : a.appendChild(s));
  return a;
}
function ue(e) {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
}
function pt(e, ...t) {
  ue(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
async function Ka(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function Va(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], a = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** a).toFixed(a > 0 ? 1 : 0)} ${n[a]}`;
}
function Ga(e) {
  return e < 1e3 ? `${Math.round(e)} ms` : `${(e / 1e3).toFixed(2)} s`;
}
const ae = (e, t) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${1.75}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, H = {
  search: ae('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  close: ae('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: ae('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  chevronDown: ae('<path d="m6 9 6 6 6-6"/>'),
  chevronRight: ae('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: ae('<path d="m15 18-6-6 6-6"/>'),
  sun: ae('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: ae('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  copy: ae('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  check: ae('<path d="M20 6 9 17l-5-5"/>'),
  /** Closed padlock — requires auth (red) */
  lock: ae('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>'),
  /** Open padlock — auth configured (green) */
  unlock: ae('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M16 11V7a4 4 0 1 0-8 0v1"/>'),
  send: ae('<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>'),
  key: ae('<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>'),
  globe: ae('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  server: ae('<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>'),
  warning: ae('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  settings: ae('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>')
};
function Ja(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function zt(e) {
  return Ja(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function xn(e) {
  return String(e || "").replace(/\/$/, "");
}
function Ft(e) {
  return xn(e).replace(/^https?:\/\//i, "");
}
function Xa(e) {
  return xn(zt(e));
}
function Os(e) {
  return Ft(zt(e));
}
function It(e) {
  const { options: t, value: n, ariaLabel: a, onChange: s, className: r, variant: o = "default", invalid: c, dataAttrs: d } = e, l = document.createElement("select");
  o === "inline" && l.setAttribute("data-variant", "inline");
  const p = [];
  if (c && p.push("invalid"), r && p.push(r), l.className = p.join(" "), a && l.setAttribute("aria-label", a), d)
    for (const [f, v] of Object.entries(d))
      l.dataset[f] = v;
  for (const f of t) {
    const v = document.createElement("option");
    v.value = f.value, v.textContent = f.label, n !== void 0 && f.value === n && (v.selected = !0), l.appendChild(v);
  }
  return s && l.addEventListener("change", () => s(l.value)), l;
}
function ye(e) {
  const {
    type: t = "text",
    placeholder: n,
    value: a,
    ariaLabel: s,
    required: r,
    readOnly: o,
    invalid: c,
    modifiers: d,
    dataAttrs: l,
    className: p,
    onInput: f,
    onChange: v
  } = e, h = document.createElement("input");
  h.type = t;
  const b = [];
  if (d?.includes("filled") && b.push("filled"), c && b.push("invalid"), p && b.push(p), h.className = b.join(" "), n && (h.placeholder = n), a !== void 0 && (h.value = a), s && h.setAttribute("aria-label", s), r && (h.required = !0), o && (h.readOnly = !0), l)
    for (const [m, k] of Object.entries(l))
      h.dataset[m] = k;
  return f && h.addEventListener("input", () => f(h.value)), v && h.addEventListener("change", () => v(h.value)), h;
}
const Ya = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function Za(e = "secondary") {
  return ["btn", ...Ya[e]];
}
function Ae(e) {
  const { variant: t = "secondary", label: n, icon: a, ariaLabel: s, disabled: r, className: o, onClick: c } = e, d = document.createElement("button");
  d.type = "button";
  const l = Za(t);
  if (o && l.push(...o.split(/\s+/).filter(Boolean)), d.className = l.join(" "), a) {
    const p = document.createElement("span");
    p.className = "btn-icon-slot", p.innerHTML = a, d.appendChild(p);
  }
  if (n) {
    const p = document.createElement("span");
    p.textContent = n, d.appendChild(p);
  }
  return s && d.setAttribute("aria-label", s), r && (d.disabled = !0), c && d.addEventListener("click", c), d;
}
function Ts(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : `u-text-${e}`;
}
function En(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : `u-bg-${e}-soft`;
}
function Qa(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function _s(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function er(e, t) {
  return e.color ? e.color : t === "method" ? Qa(e.method || e.text) : t === "status" ? _s(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function q(e) {
  const t = document.createElement("span"), n = e.kind || "chip", a = er(e, n), r = ["badge", e.size || "m"];
  return n === "status" && r.push("status"), n === "required" && r.push("required"), r.push(Ts(a), En(a)), e.className && r.push(e.className), t.className = r.join(" "), t.textContent = e.text, t;
}
function Bt(e, t) {
  const n = t?.active ?? !1, a = t?.context ?? !1, s = document.createElement("button");
  return s.type = "button", s.className = `badge m interactive${n ? " is-active" : ""}`, a && (s.dataset.badgeContext = "true"), s.textContent = e, s;
}
function tr(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const a = _s(e), s = ["badge", "status", "m", "interactive", Ts(a)];
  return t && s.push("is-active", En(a)), n.className = s.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = a, n.textContent = e, n;
}
function Zn(e, t) {
  if (e.classList.remove(
    "u-bg-surface-hover",
    "u-bg-transparent",
    "u-bg-green-soft",
    "u-bg-blue-soft",
    "u-bg-orange-soft",
    "u-bg-purple-soft",
    "u-bg-red-soft"
  ), e.classList.toggle("is-active", t), !t) return;
  const n = e.dataset.badgeColor || "default";
  e.classList.add(En(n));
}
function $e(e) {
  const { simple: t, interactive: n, active: a, className: s, onClick: r } = e || {}, o = document.createElement("div"), c = [t ? "card-simple" : "card"];
  return n && c.push("card--interactive", "hover-surface", "focus-ring"), a && c.push("card-active"), s && c.push(s), o.className = c.join(" "), r && (o.style.cursor = "pointer", o.addEventListener("click", r)), o;
}
function Sn(...e) {
  const t = document.createElement("div");
  t.className = "card-header";
  for (const n of e)
    if (typeof n == "string") {
      const a = document.createElement("span");
      a.textContent = n, t.append(a);
    } else
      t.append(n);
  return t;
}
function Wt(e) {
  const t = document.createElement("div"), n = ["card-body"];
  return n.push("card-body--no-padding"), t.className = n.join(" "), t;
}
function Qn(e) {
  if (typeof e == "string" || typeof e == "number") {
    const t = document.createElement("span");
    return t.textContent = String(e), t;
  }
  return e;
}
function Nn(e) {
  const t = document.createElement("div");
  if (t.className = `card-header-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append(Qn(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? q({ text: String(e.trailing), kind: "chip", size: "m" }) : Qn(e.trailing);
    t.append(n);
  }
  return t;
}
function nr(e) {
  return typeof e == "string" ? i("span", { textContent: e }) : e;
}
function Rs(e) {
  return i("h2", { textContent: e });
}
function kn(e, t) {
  const n = i("div", { className: "section-head" });
  return n.append(typeof e == "string" ? Rs(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? q({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function pe(e, ...t) {
  const n = i("div", { className: `section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(kn(e.title, e.badge)) : n.append(Rs(e.title)));
  for (const a of t) n.append(nr(a));
  return n;
}
function wn(e, t) {
  const n = i("nav", {
    className: `breadcrumb${t?.className ? ` ${t.className}` : ""}`,
    "aria-label": "Breadcrumb"
  }), a = i("div", { className: "breadcrumb-main" });
  return t?.leading?.length && a.append(...t.leading), e.forEach((s, r) => {
    if (r > 0 && a.append(i("span", { className: "breadcrumb-sep", textContent: "/" })), s.href || s.onClick) {
      const o = i("a", {
        className: `breadcrumb-item${s.className ? ` ${s.className}` : ""}`,
        href: s.href || "#",
        textContent: s.label
      });
      s.onClick && o.addEventListener("click", s.onClick), a.append(o);
      return;
    }
    a.append(i("span", {
      className: s.className || "breadcrumb-segment",
      textContent: s.label
    }));
  }), n.append(a), t?.trailing?.length && n.append(i("div", { className: "breadcrumb-trailing" }, ...t.trailing)), n;
}
function Cn(e) {
  const { configured: t, variant: n = "tag", title: a } = e, s = t ? H.unlock : H.lock, r = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-auth-icon", o = n !== "endpoint" ? ` ${r}--${t ? "configured" : "required"}` : "";
  return i("span", {
    className: `${r}${o}`.trim(),
    innerHTML: s,
    ...a ? { title: a, "aria-label": a } : {}
  });
}
function Ms(e) {
  const t = i("div", { className: e.overlayClass });
  t.setAttribute(e.dataOverlayAttr, "true");
  const n = i("div", {
    className: e.modalClass,
    role: e.role || "dialog",
    "aria-label": e.ariaLabel,
    "aria-modal": "true"
  });
  t.append(n);
  const a = () => {
    t.remove(), e.onClose?.();
  };
  return t.addEventListener("click", (s) => {
    s.target === t && a();
  }), t.addEventListener("keydown", (s) => {
    s.key === "Escape" && (s.preventDefault(), a());
  }, !0), {
    overlay: t,
    modal: n,
    mount: (s) => {
      (s || document.querySelector(".root") || document.body).appendChild(t);
    },
    close: a
  };
}
let at = null;
function nn() {
  at && at.close(), at = null;
}
function sr(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function ar(e) {
  return bn(e);
}
function sn(e, t, n) {
  ue(n);
  const a = y.get().auth.schemes[e] || "", s = t.type, r = (t.scheme || "").toLowerCase();
  if (s === "http" && r === "bearer") {
    const o = i("div", { className: "modal field" });
    o.append(i("label", { className: "modal label", textContent: "Token" }));
    const c = i("div", { className: "modal input-wrap" }), d = ye({
      className: "modal input",
      placeholder: "Bearer token...",
      value: a,
      ariaLabel: "Bearer token",
      type: "password"
    }), l = Ae({
      variant: "icon",
      icon: H.key,
      ariaLabel: "Показать/скрыть",
      className: "l secondary u-text-muted",
      onClick: () => {
        d.type = d.type === "password" ? "text" : "password";
      }
    });
    d.addEventListener("input", () => {
      y.setSchemeValue(e, d.value);
    }), c.append(d, l), o.append(c), n.append(o), requestAnimationFrame(() => d.focus());
  } else if (s === "http" && r === "basic") {
    const o = a ? atob(a).split(":") : ["", ""], c = o[0] || "", d = o.slice(1).join(":") || "", l = i("div", { className: "modal field" });
    l.append(i("label", { className: "modal label", textContent: "Username" }));
    const p = ye({
      className: "modal input",
      placeholder: "Username",
      value: c,
      ariaLabel: "Username"
    });
    l.append(p), n.append(l);
    const f = i("div", { className: "modal field" });
    f.append(i("label", { className: "modal label", textContent: "Password" }));
    const v = ye({
      className: "modal input",
      placeholder: "Password",
      value: d,
      ariaLabel: "Password",
      type: "password"
    });
    f.append(v), n.append(f);
    const h = () => {
      const b = btoa(`${p.value}:${v.value}`);
      y.setSchemeValue(e, b);
    };
    p.addEventListener("input", h), v.addEventListener("input", h), requestAnimationFrame(() => p.focus());
  } else if (s === "apiKey") {
    const o = i("div", { className: "modal field" });
    o.append(i("label", { className: "modal label", textContent: `API Key (${t.name || "key"})` }));
    const c = i("div", { className: "modal input-wrap" }), d = ye({
      className: "modal input",
      placeholder: `${t.name || "API key"}...`,
      value: a,
      ariaLabel: "API key",
      type: "password"
    }), l = Ae({
      variant: "icon",
      icon: H.key,
      ariaLabel: "Показать/скрыть",
      className: "l secondary u-text-muted",
      onClick: () => {
        d.type = d.type === "password" ? "text" : "password";
      }
    });
    d.addEventListener("input", () => {
      y.setSchemeValue(e, d.value);
    }), c.append(d, l), o.append(c), n.append(o), requestAnimationFrame(() => d.focus());
  } else {
    const o = i("div", { className: "modal field" });
    o.append(i("label", { className: "modal label", textContent: "Token / Credential" }));
    const c = ye({
      className: "modal input",
      placeholder: "Token...",
      value: a,
      ariaLabel: "Token",
      type: "password"
    });
    c.addEventListener("input", () => {
      y.setSchemeValue(e, c.value);
    }), o.append(c), n.append(o), requestAnimationFrame(() => c.focus());
  }
}
function $s(e, t, n) {
  at && nn();
  const a = Object.entries(e);
  if (a.length === 0) return;
  const s = Ms({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Настройка аутентификации",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      at = null;
    }
  });
  at = s;
  const r = s.modal, o = i("div", { className: "modal header" });
  o.append(i("h2", { className: "modal title", textContent: "Authentication" }));
  const c = Ae({ variant: "icon", icon: H.close, ariaLabel: "Закрыть", onClick: nn });
  o.append(c), r.append(o);
  const d = i("div", { className: "modal body" });
  let l = n || y.get().auth.activeScheme || a[0][0];
  e[l] || (l = a[0][0]);
  const p = i("div", { className: "modal fields" });
  if (a.length > 1) {
    const E = i("div", { className: "modal tabs" }), L = [];
    for (const [j, C] of a) {
      const M = !!y.get().auth.schemes[j], I = i("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": j === l ? "true" : "false"
      }), T = i("span", { className: "modal tab-label", textContent: ar(C) });
      if (I.append(T), M) {
        const _ = i("span", { className: "modal tab-dot", "data-configured": "true" });
        I.append(_);
      }
      I.addEventListener("click", () => {
        if (l !== j) {
          l = j;
          for (const _ of L) _.setAttribute("aria-pressed", "false");
          I.setAttribute("aria-pressed", "true"), v(), sn(j, C, p);
        }
      }), L.push(I), E.append(I);
    }
    d.append(E);
  }
  const f = i("div", { className: "modal scheme-desc" });
  function v() {
    const E = e[l];
    if (!E) return;
    ue(f);
    const L = i("div", { className: "modal scheme-title", textContent: sr(E) });
    f.append(L), E.description && f.append(i("div", { className: "modal scheme-text", textContent: E.description }));
  }
  v(), d.append(f);
  const h = e[l];
  h && sn(l, h, p), d.append(p), r.append(d);
  const b = i("div", { className: "modal footer" }), m = Ae({
    variant: "ghost",
    label: "Сбросить",
    onClick: () => {
      y.setSchemeValue(l, "");
      const E = e[l];
      E && sn(l, E, p);
    }
  }), k = Ae({ variant: "primary", label: "Готово", onClick: nn });
  b.append(m, i("div", { className: "grow" }), k), r.append(b), s.mount(t ?? document.querySelector(".root") ?? document.body);
}
function jt(e) {
  return !!y.get().auth.schemes[e];
}
function An(e, t) {
  const n = bt(e, t), a = y.get().auth, s = Ut(n, a.schemes, a.activeScheme, a.token);
  return Object.keys(s.headers).length > 0 || Object.keys(s.query).length > 0 || Object.keys(s.cookies).length > 0;
}
function Ln(e, t) {
  const n = bt(e, t), a = y.get().auth;
  return Ut(n, a.schemes, a.activeScheme, a.token).headers;
}
function rr(e, t) {
  const n = bt(e, t), a = y.get().auth;
  return Ut(n, a.schemes, a.activeScheme, a.token).query;
}
function or(e, t) {
  const n = bt(e, t), a = y.get().auth;
  return Ut(n, a.schemes, a.activeScheme, a.token).cookies;
}
function On(e, t) {
  const n = bt(e, t);
  return Ta(n);
}
function bt(e, t) {
  if (e)
    return Array.isArray(e) ? vn(e, t, !1) : e;
}
let be = -1, Pt = null, Fe = null;
function qs() {
  ht();
  const e = Ms({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      Pt = null, y.set({ searchOpen: !1 });
    }
  });
  Pt = e;
  const t = e.modal, n = i("div", { className: "search-input-wrap" });
  n.innerHTML = H.search;
  const a = ye({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), s = i("kbd", { textContent: "ESC", className: "kbd" });
  n.append(a, s), t.append(n);
  const r = i("div", { className: "search-results", role: "listbox" }), o = i("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  r.append(o), t.append(r);
  const c = i("div", { className: "search-footer" });
  c.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(c), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => a.focus()), be = -1;
  let d = [];
  a.addEventListener("input", () => {
    const l = a.value;
    d = za(l), be = d.length > 0 ? 0 : -1, an(r, d, be);
  }), a.addEventListener("keydown", (l) => {
    const p = l;
    p.key === "ArrowDown" ? (p.preventDefault(), d.length > 0 && (be = Math.min(be + 1, d.length - 1), an(r, d, be))) : p.key === "ArrowUp" ? (p.preventDefault(), d.length > 0 && (be = Math.max(be - 1, 0), an(r, d, be))) : p.key === "Enter" ? (p.preventDefault(), be >= 0 && be < d.length && Is(d[be])) : p.key === "Escape" && (p.preventDefault(), ht());
  }), e.overlay.addEventListener("keydown", (l) => {
    l.key === "Escape" && (l.preventDefault(), ht());
  });
}
function ht() {
  if (Pt) {
    Pt.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), y.set({ searchOpen: !1 });
}
function an(e, t, n) {
  if (ue(e), t.length === 0) {
    e.append(i("div", { className: "search-empty", textContent: "No results found" }));
    return;
  }
  t.forEach((s, r) => {
    const o = i("div", {
      className: `search-result${r === n ? " focused" : ""}`,
      role: "option",
      "aria-selected": r === n ? "true" : "false"
    });
    s.method ? o.append(q({
      text: s.method.toUpperCase(),
      kind: "method",
      method: s.method
    })) : s.type === "schema" ? o.append(q({ text: "SCH", kind: "chip", size: "m" })) : s.type === "tag" && o.append(q({ text: "TAG", kind: "chip", size: "m" }));
    const c = i("div", { className: "search-result-info min-w-0" });
    if (c.append(i("span", { className: "search-result-title", textContent: s.title })), s.subtitle && c.append(i("span", { className: "search-result-subtitle", textContent: s.subtitle })), o.append(c), s.method && s.requiresAuth && s.resolvedSecurity) {
      const d = y.get().spec, l = An(s.resolvedSecurity, d?.securitySchemes || {});
      o.append(i("span", {
        className: `search-result-lock search-result-lock--${l ? "configured" : "required"}`,
        innerHTML: l ? H.unlock : H.lock,
        title: s.authTitle || "Requires authentication",
        "aria-label": s.authTitle || "Requires authentication"
      }));
    }
    o.addEventListener("click", () => Is(s)), o.addEventListener("mouseenter", () => {
      be = r, e.querySelectorAll(".focused").forEach((d) => d.classList.remove("focused")), o.classList.add("focused");
    }), e.append(o);
  });
  const a = e.querySelector(".focused");
  a && a.scrollIntoView({ block: "nearest" });
}
function Is(e) {
  ht(), e.type === "operation" ? re(oe({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? re(oe({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? re(oe({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && re(oe({ type: "webhook", webhookName: e.webhookName }));
}
function ir() {
  return Fe && document.removeEventListener("keydown", Fe), Fe = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), y.get().searchOpen ? ht() : (y.set({ searchOpen: !0 }), qs()));
  }, document.addEventListener("keydown", Fe), () => {
    Fe && (document.removeEventListener("keydown", Fe), Fe = null);
  };
}
function cr(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let a = null;
  n.forEach((r) => {
    const o = r, c = o.getAttribute("href");
    if (!c) return;
    const d = c.startsWith("#") ? c.slice(1) : c, l = gs(d), p = ot(l, t);
    r.classList.toggle("active", p), p ? (o.setAttribute("aria-current", "page"), a = o) : o.removeAttribute("aria-current");
  });
  const s = t.type === "endpoint" || t.type === "tag" ? t.tag : t.type === "schema" ? "schemas" : null;
  if (s) {
    const r = e.querySelector(`[data-nav-tag="${CSS.escape(s)}"]`);
    if (r) {
      const o = r.querySelector(".nav-group-header"), c = r.querySelector(".nav-group-items");
      o && c && (o.classList.add("expanded"), c.classList.remove("collapsed"));
    }
  }
  a && requestAnimationFrame(() => {
    const o = a.closest(".nav-group")?.querySelector(".nav-group-header");
    o ? o.scrollIntoView({ block: "start", behavior: "smooth" }) : a.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function es(e, t) {
  const n = y.get(), a = n.spec;
  if (!a) return;
  ue(e);
  const s = t.title || a.info.title || "API Docs", r = a.info.version ? `v${a.info.version}` : "", o = i("div", { className: "top" }), c = i("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  c.innerHTML = H.chevronLeft, c.addEventListener("click", () => y.set({ sidebarOpen: !1 }));
  const d = i("a", { className: "title", href: "/", textContent: s });
  d.addEventListener("click", (C) => {
    C.preventDefault(), re("/");
  });
  const l = i("div", { className: "title-wrap" });
  if (l.append(d), r && l.append(i("span", { className: "version", textContent: r })), o.append(c, l), a.securitySchemes && Object.keys(a.securitySchemes).length > 0) {
    const C = n.auth, M = Object.keys(a.securitySchemes), I = C.activeScheme || M[0] || "", T = jt(I), _ = i("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication",
      title: T ? `Auth: ${I}` : "Configure authentication"
    });
    _.innerHTML = T ? H.unlock : H.lock, _.classList.toggle("active", T), _.addEventListener("click", () => {
      $s(
        a.securitySchemes,
        e.closest(".root") ?? void 0,
        I
      );
    }), y.subscribe(() => {
      const J = y.get().auth.activeScheme || M[0] || "", z = jt(J);
      _.innerHTML = z ? H.unlock : H.lock, _.title = z ? `Auth: ${J}` : "Configure authentication", _.classList.toggle("active", z);
    }), o.append(_);
  }
  const p = i("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (p.innerHTML = y.get().theme === "light" ? H.moon : H.sun, p.addEventListener("click", () => {
    Fa(), p.innerHTML = y.get().theme === "light" ? H.moon : H.sun;
  }), e.append(o), n.environments.length > 1) {
    const C = fr(n);
    e.append(C), y.subscribe(() => {
      const M = y.get();
      C.value !== M.activeEnvironment && (C.value = M.activeEnvironment);
    });
  }
  const f = i("div", { className: "search" }), v = i("span", { className: "search-icon", innerHTML: H.search }), h = ye({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), b = i("span", { className: "kbd", textContent: "⌘K" });
  h.addEventListener("focus", () => {
    y.set({ searchOpen: !0 }), h.blur(), qs();
  }), f.append(v, h, b), e.append(f);
  const m = i("nav", { className: "nav", "aria-label": "API navigation" }), k = ur({ type: "overview" }, n.route);
  m.append(k);
  for (const C of a.tags) {
    if (C.operations.length === 0) continue;
    const M = lr(C, n.route);
    m.append(M);
  }
  if (a.webhooks && a.webhooks.length > 0) {
    const C = i("div", { className: "nav-group", "data-nav-tag": "webhooks" }), M = ts("Webhooks", a.webhooks.length), I = i("div", { className: "nav-group-items" });
    for (const _ of a.webhooks) {
      const X = { type: "webhook", webhookName: _.name }, J = ns(_.summary || _.name, _.method, X, n.route);
      J.classList.add("nav-item-webhook"), I.append(J);
    }
    M.addEventListener("click", () => {
      M.classList.toggle("expanded"), I.classList.toggle("collapsed");
    });
    const T = n.route.type === "webhook";
    M.classList.toggle("expanded", T), I.classList.toggle("collapsed", !T), C.append(M, I), m.append(C);
  }
  const E = Object.keys(a.schemas);
  if (E.length > 0) {
    const C = i("div", { className: "nav-group" }), M = ts("Schemas", E.length), I = i("div", { className: "nav-group-items" });
    for (const _ of E) {
      const J = ns(_, void 0, { type: "schema", schemaName: _ }, n.route);
      I.append(J);
    }
    M.addEventListener("click", () => {
      M.classList.toggle("expanded"), I.classList.toggle("collapsed");
    });
    const T = n.route.type === "schema";
    M.classList.toggle("expanded", T), I.classList.toggle("collapsed", !T), C.setAttribute("data-nav-tag", "schemas"), C.append(M, I), m.append(C);
  }
  e.append(m);
  const L = i("div", { className: "footer" }), j = i("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  j.textContent = `puredocs.dev${r ? ` ${r}` : ""}`, L.append(j), L.append(p), e.append(L), requestAnimationFrame(() => {
    const C = m.querySelector(".nav-item.active");
    if (C) {
      const I = C.closest(".nav-group")?.querySelector(".nav-group-header");
      I ? I.scrollIntoView({ block: "start", behavior: "smooth" }) : C.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function lr(e, t, n) {
  const a = i("div", { className: "nav-group", "data-nav-tag": e.name }), s = dr(e, t), r = i("div", { className: "nav-group-items" }), o = t.type === "tag" && t.tag === e.name || e.operations.some((c) => ot(dn(c, e.name), t));
  for (const c of e.operations) {
    const d = dn(c, e.name), l = pr(c, d, t);
    r.append(l);
  }
  return s.addEventListener("click", (c) => {
    c.target.closest(".nav-group-link") || (s.classList.toggle("expanded"), r.classList.toggle("collapsed"));
  }), r.classList.toggle("collapsed", !o), a.append(s, r), a;
}
function dr(e, t) {
  const n = t.type === "tag" && t.tag === e.name || e.operations.some((o) => ot(dn(o, e.name), t)), a = i("div", { className: "nav-group-header focus-ring", "aria-expanded": String(n), tabIndex: 0 }), s = i("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": n ? "Collapse" : "Expand"
  });
  s.innerHTML = H.chevronRight, s.addEventListener("click", (o) => {
    o.preventDefault(), o.stopPropagation(), a.click();
  });
  const r = i("a", {
    className: "nav-group-link",
    href: oe({ type: "tag", tag: e.name })
  });
  return r.append(
    i("span", { className: "nav-group-title", textContent: e.name }),
    i("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), r.addEventListener("click", (o) => {
    o.preventDefault(), re(oe({ type: "tag", tag: e.name }));
  }), a.append(s, r), a.classList.toggle("expanded", n), a.addEventListener("keydown", (o) => {
    (o.key === "Enter" || o.key === " ") && (o.preventDefault(), s.click());
  }), a;
}
function ts(e, t) {
  const n = i("div", { className: "nav-group-header focus-ring", role: "button", "aria-expanded": "true", tabindex: "0" }), a = i("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": "Toggle section"
  });
  a.innerHTML = H.chevronRight, a.addEventListener("click", (r) => {
    r.preventDefault(), r.stopPropagation(), n.click();
  });
  const s = i("span", { className: "nav-group-link nav-group-link--static" });
  return s.append(
    i("span", { className: "nav-group-title", textContent: e }),
    i("span", { className: "nav-group-count", textContent: String(t) })
  ), n.append(a, s), n.addEventListener("keydown", (r) => {
    (r.key === "Enter" || r.key === " ") && (r.preventDefault(), n.click());
  }), n;
}
function ns(e, t, n, a) {
  const s = ot(n, a), r = i("a", {
    className: `nav-item${s ? " active" : ""}`,
    href: oe(n),
    role: "link",
    "aria-current": s ? "page" : void 0
  }), o = q(t ? {
    text: t.toUpperCase(),
    kind: "method",
    method: t
  } : {
    text: "GET",
    kind: "method",
    method: "get",
    className: "placeholder"
  });
  return t || o.setAttribute("aria-hidden", "true"), r.append(o), r.append(i("span", { className: "nav-item-label", textContent: e })), r.addEventListener("click", (c) => {
    c.preventDefault(), re(oe(n));
  }), r;
}
function ur(e, t) {
  const n = ot(e, t), a = i("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: oe(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), s = i("span", { className: "nav-overview-icon-slot" });
  s.innerHTML = H.globe;
  const r = i("span", { className: "nav-item-label", textContent: "Overview" });
  return a.append(s, r), a.addEventListener("click", (o) => {
    o.preventDefault(), re(oe(e));
  }), a;
}
function pr(e, t, n) {
  const a = ot(t, n), s = i("a", {
    className: `nav-item${a ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: oe(t),
    title: `${e.method.toUpperCase()} ${e.path}`,
    "aria-current": a ? "page" : void 0
  }), r = y.get().spec, o = le(e.resolvedSecurity) ? Cn({
    configured: An(e.resolvedSecurity, r?.securitySchemes || {}),
    variant: "nav",
    title: st(e.resolvedSecurity)
  }) : null;
  return s.append(
    q({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    i("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...o ? [o] : []
  ), s.addEventListener("click", (c) => {
    c.preventDefault(), re(oe(t));
  }), s;
}
function dn(e, t) {
  return {
    type: "endpoint",
    tag: t,
    method: e.method,
    path: e.path,
    operationId: e.operationId
  };
}
function ot(e, t) {
  return e.type !== t.type ? !1 : e.type === "overview" ? !0 : e.type === "tag" ? e.tag === t.tag : e.type === "endpoint" ? e.method === t.method && e.path === t.path : e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function fr(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((s) => {
    const r = t.find((c) => c.name === s.name), o = Ft((r?.baseUrl ?? s.baseUrl) || "");
    return { value: s.name, label: o || "(no URL)" };
  });
  return It({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (s) => y.setActiveEnvironment(s),
    className: "env"
  });
}
function Bs(e, t, n = "No operations") {
  const a = i("div", { className: "summary-line" });
  for (const r of e)
    a.append(q({
      text: `${r.value} ${r.label}`,
      kind: "chip",
      size: "m"
    }));
  const s = ["get", "post", "put", "patch", "delete", "head", "options"];
  for (const r of s) {
    const o = t[r] || 0;
    o !== 0 && a.append(q({
      kind: "method",
      method: r,
      size: "m",
      text: `${o} ${r.toUpperCase()}`
    }));
  }
  return a.childNodes.length || a.append(q({
    text: n,
    kind: "chip",
    size: "m"
  })), a;
}
function mr(e, t) {
  const n = [], a = hr(e, t);
  return a && n.push(a), n;
}
function hr(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = pe({ title: "Authentication" }), a = [];
  for (const [s, r] of Object.entries(e)) {
    const o = jt(s), c = $e({ className: "tag-group-card auth-card" }), d = i("div", { className: "auth-card-main" }), l = i("div", { className: "tag-card-info auth-card-info" }), p = `${r.type}${r.scheme ? ` / ${r.scheme}` : ""}`;
    l.append(
      i("h3", { textContent: s }),
      i("p", { className: "auth-card-type", textContent: p })
    ), r.description && l.append(i("p", { className: "auth-card-desc", textContent: String(r.description) }));
    const f = Ae({
      variant: "secondary",
      icon: o ? H.check : H.settings,
      label: o ? "Success" : "Set",
      className: `auth-configure-btn-sm${o ? " active is-configured" : ""}`,
      onClick: (v) => {
        v.stopPropagation(), $s(e, t, s);
      }
    });
    d.append(l), c.append(d, f), a.push({ name: s, btn: f }), n.append(c);
  }
  return y.subscribe(() => {
    for (const s of a) {
      const r = jt(s.name);
      s.btn.className = `btn secondary m auth-configure-btn-sm${r ? " active is-configured" : ""}`, s.btn.innerHTML = `<span class="btn-icon-slot">${r ? H.check : H.settings}</span><span>${r ? "Success" : "Set"}</span>`;
    }
  }), n;
}
async function ss(e, t) {
  ue(e);
  const n = y.get().spec;
  if (!n) return;
  const a = i("div", { className: "header" }), s = i("div", { className: "overview-title-wrap" });
  s.append(
    i("h1", { textContent: n.info.title }),
    i("span", { className: "version", textContent: `v${n.info.version}` })
  ), a.append(s), n.info.description && a.append(i("p", { textContent: n.info.description })), e.append(a);
  const r = n.operations.filter((p) => le(p.resolvedSecurity)).length, o = n.operations.filter((p) => p.deprecated).length, c = vr(n.operations);
  e.append(pe(
    { className: "summary-section" },
    Bs(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: r },
        { label: "Deprecated", value: o }
      ],
      c,
      "No operations"
    )
  ));
  const d = e.closest(".root") ?? void 0, l = mr(n.securitySchemes || {}, d);
  for (const p of l)
    e.append(p);
  if (n.servers.length > 0) {
    const p = pe({ title: "Servers" }), f = y.get(), v = f.initialEnvironments || f.environments;
    for (const h of n.servers) {
      const b = v.find((M) => M.baseUrl === h.url), m = b?.name === f.activeEnvironment, k = $e({
        interactive: !0,
        active: m,
        className: "tag-group-card",
        onClick: () => {
          b && y.setActiveEnvironment(b.name);
        }
      });
      k.title = "Click to set as active environment";
      const E = i("div", { className: "tag-card-info" }), L = i("div", { className: "inline-cluster inline-cluster-sm" }), j = i("span", { className: "icon-muted" });
      j.innerHTML = H.server, L.append(j, i("code", { textContent: h.url })), E.append(L), h.description && E.append(i("p", { textContent: h.description }));
      const C = i("div", { className: "tag-card-badges" });
      k.append(E, C), p.append(k);
    }
    e.append(p);
  }
  if (n.tags.length > 0) {
    const p = pe({ title: "API Groups" });
    for (const f of n.tags)
      f.operations.length !== 0 && p.append(gr(f));
    e.append(p);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const p = pe({ title: "Webhooks" });
    for (const f of n.webhooks) {
      const v = $e({
        interactive: !0,
        className: "tag-group-card",
        onClick: () => re(oe({ type: "webhook", webhookName: f.name }))
      }), h = i("div", { className: "tag-card-info" });
      h.append(
        i("h3", { textContent: f.summary || f.name }),
        f.description ? i("p", { textContent: f.description }) : i("p", { textContent: `${f.method.toUpperCase()} webhook` })
      );
      const b = i("div", { className: "tag-card-badges" });
      b.append(
        q({ text: "WH", kind: "webhook", size: "s" }),
        q({ text: f.method.toUpperCase(), kind: "method", method: f.method, size: "s" })
      ), v.append(h, b), p.append(v);
    }
    e.append(p);
  }
}
function gr(e) {
  const t = $e({
    interactive: !0,
    className: "tag-group-card",
    onClick: () => re(oe({ type: "tag", tag: e.name }))
  }), n = i("div", { className: "tag-card-info" });
  n.append(
    i("h3", { textContent: e.name }),
    i("p", { textContent: e.description || `${e.operations.length} endpoints` })
  );
  const a = br(e), s = i("div", { className: "tag-card-badges" });
  for (const [r, o] of Object.entries(a)) {
    const c = q({
      text: r.toUpperCase(),
      kind: "method",
      method: r,
      size: "m"
    });
    c.textContent = `${o} ${r.toUpperCase()}`, s.append(c);
  }
  return t.append(n, s), t;
}
function vr(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function br(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function yt(e) {
  if (!e) return "any";
  if (e.$ref) return e.$ref.split("/").pop() || "ref";
  let t = e.type || "";
  return e.allOf ? t = "allOf" : e.oneOf ? t = "oneOf" : e.anyOf ? t = "anyOf" : e.enum ? t = "enum" : e.format && (t += `<${e.format}>`), e.type === "array" && e.items && !e.enum && (t = `${e.items.type || e.items.$ref?.split("/").pop() || "any"}[]`), e.nullable && (t += " | null"), t || "object";
}
function yr(e) {
  const t = i("div", { className: "schema-body" }), n = [];
  Ps(t, e, "", 0, /* @__PURE__ */ new Set(), n);
  const a = n.length > 0, s = () => n.some(({ children: o }) => o.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const o = !s();
    Us(n, o);
  }, isExpanded: s, hasExpandable: a };
}
function rt(e, t) {
  const n = $e(), a = yt(e), s = Wt(), r = i("div", { className: "schema-body" }), o = [];
  if (Ps(r, e, "", 0, /* @__PURE__ */ new Set(), o), s.append(r), t) {
    const c = Sn(), d = typeof t == "string" ? i("h3", { textContent: t }) : t, l = o.length > 0, p = l && o.some(({ children: h }) => h.style.display !== "none"), f = q({ text: a, kind: "chip", size: "m" }), v = l ? i("button", {
      className: p ? "schema-collapse-btn expanded" : "schema-collapse-btn",
      type: "button",
      title: p ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (v && (v.innerHTML = H.chevronDown, v.addEventListener("click", (h) => {
      h.stopPropagation();
      const b = !v.classList.contains("expanded");
      Us(o, b), v.classList.toggle("expanded", b), v.title = b ? "Collapse all fields" : "Expand all fields";
    })), d.classList.contains("card-header-row"))
      d.classList.add("schema-header-row"), d.append(f), v && d.append(v), c.append(d);
    else {
      const h = i("div", { className: "card-header-row schema-header-row" });
      h.append(d, f), v && h.append(v), c.append(h);
    }
    n.prepend(c);
  }
  return n.append(s), n;
}
function js(e, t) {
  const { headerTitle: n, withEnumAndDefault: a = !0 } = t, s = e.map((c) => {
    const d = i("div", { className: "schema-row params-list-row" }), l = i("div", { className: "schema-main-row" }), p = i("div", { className: "schema-name-wrapper params-list-name-wrap" });
    p.append(
      i("span", { className: "schema-spacer" }),
      i("span", { textContent: c.name })
    );
    const f = i("div", { className: "schema-meta-wrapper params-list-meta" });
    f.append(q({
      text: c.schema ? yt(c.schema) : "unknown",
      kind: "chip",
      size: "m"
    })), c.required && f.append(q({ text: "required", kind: "required", size: "m" })), l.append(p, f), d.append(l);
    const v = i("div", { className: "schema-desc-col schema-desc-col--root" });
    c.description && v.append(i("p", { textContent: c.description }));
    const h = c.schema?.enum, b = c.schema?.default !== void 0;
    if (a && (h && h.length > 0 || b)) {
      const m = i("div", { className: "schema-enum-values" });
      if (b && m.append(q({
        text: `Default: ${JSON.stringify(c.schema.default)}`,
        kind: "chip",
        size: "s"
      })), h)
        for (const k of h) {
          const E = String(k);
          E !== c.in && m.append(q({ text: E, kind: "chip", size: "s" }));
        }
      v.append(m);
    }
    return v.children.length > 0 && d.append(v), d;
  }), r = $e({ className: "params-list-card" }), o = Wt();
  return o.classList.add("params-list-body"), o.append(...s), r.append(
    Sn(Nn({ title: n })),
    o
  ), r;
}
function Ot(e, t, n, a, s, r, o) {
  const c = yt(n), d = xr(n), l = Hs(t, c, n, a, d, s);
  if (e.append(l), d) {
    const p = i("div", { className: "schema-children" });
    p.style.display = "block";
    const f = new Set(r);
    f.add(n), Ds(p, n, a + 1, f, o), e.append(p), o?.push({ row: l, children: p }), l.querySelector(".schema-toggle")?.classList.add("expanded"), l.classList.add("focus-ring"), l.setAttribute("aria-expanded", "true"), l.setAttribute("tabindex", "0"), l.addEventListener("click", () => {
      const v = p.style.display !== "none";
      un(l, p, !v);
    }), l.addEventListener("keydown", (v) => {
      if (v.key !== "Enter" && v.key !== " ") return;
      v.preventDefault();
      const h = p.style.display !== "none";
      un(l, p, !h);
    });
  }
}
function Ps(e, t, n, a, s, r) {
  if (s.has(t)) {
    e.append(Hs("[circular]", "circular", { description: "" }, a, !1, !1));
    return;
  }
  {
    const o = new Set(s);
    o.add(t), Ds(e, t, a, o, r);
    return;
  }
}
function Ds(e, t, n, a, s) {
  const r = new Set(t.required || []);
  if (t.properties)
    for (const [o, c] of Object.entries(t.properties))
      Ot(e, o, c, n, r.has(o), a, s);
  t.items && t.type === "array" && Ot(e, "[item]", t.items, n, !1, a, s);
  for (const o of ["allOf", "oneOf", "anyOf"]) {
    const c = t[o];
    if (Array.isArray(c))
      for (let d = 0; d < c.length; d++)
        Ot(e, `${o}[${d}]`, c[d], n, !1, a, s);
  }
  t.additionalProperties && typeof t.additionalProperties == "object" && Ot(e, "[additionalProperties]", t.additionalProperties, n, !1, a, s);
}
function Hs(e, t, n, a, s, r) {
  const o = [
    "schema-row",
    a === 0 ? "schema-row--root" : "",
    a === 0 && !s ? "schema-row--root-leaf" : ""
  ].filter(Boolean).join(" "), c = i("div", { className: o, role: s ? "button" : void 0 });
  c.setAttribute("data-depth", String(a)), c.style.setProperty("--schema-depth", String(a));
  const d = i("div", { className: "schema-main-row" }), l = i("div", { className: "schema-name-wrapper" });
  s ? l.append(i("span", { className: "schema-toggle", innerHTML: H.chevronRight })) : l.append(i("span", { className: "schema-spacer" })), l.append(i("span", { textContent: e })), d.append(l);
  const p = i("div", { className: "schema-meta-wrapper" });
  p.append(q({ text: t, kind: "chip", size: "m" })), r && p.append(q({ text: "required", kind: "required", size: "m" })), d.append(p), c.append(d);
  const f = i("div", { className: `schema-desc-col${a === 0 ? " schema-desc-col--root" : ""}` });
  n.description && f.append(i("p", { textContent: String(n.description) }));
  const v = n.enum, h = Array.isArray(v) && v.length > 0, b = n.default, m = b !== void 0, k = h && m ? v.some((L) => rn(L, b)) : !1, E = Er(n, !h || !m);
  if (E.length > 0 || h) {
    const L = i("div", { className: "schema-constraints-row" });
    for (const j of E)
      L.append(q({
        text: j,
        kind: "chip",
        size: j.startsWith("default: ") ? "s" : "m"
      }));
    if (h) {
      const j = m && k ? [b, ...v.filter((C) => !rn(C, b))] : v;
      m && !k && L.append(q({
        text: `default: ${Rt(b)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value--default"
      }));
      for (const C of j) {
        const M = m && rn(C, b);
        L.append(q({
          text: M ? `default: ${Rt(C)}` : Rt(C),
          kind: "chip",
          size: "s",
          className: M ? "schema-enum-value--default" : void 0
        }));
      }
    }
    f.append(L);
  }
  return f.children.length > 0 && c.append(f), c;
}
function xr(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function Er(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${Rt(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function Us(e, t) {
  for (const { row: n, children: a } of e)
    un(n, a, t);
}
function un(e, t, n) {
  t.style.display = n ? "block" : "none", e.querySelector(".schema-toggle")?.classList.toggle("expanded", n), e.setAttribute("aria-expanded", n ? "true" : "false");
}
function Rt(e) {
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (e === null) return "null";
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function rn(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function Sr(e) {
  const { method: t, url: n, headers: a = {}, body: s, timeout: r = 3e4 } = e, o = new AbortController(), c = setTimeout(() => o.abort(), r), d = performance.now();
  try {
    const l = typeof FormData < "u" && s instanceof FormData, p = {
      method: t.toUpperCase(),
      headers: l ? void 0 : a,
      signal: o.signal,
      credentials: "include"
    };
    if (l) {
      const k = {};
      for (const [E, L] of Object.entries(a))
        E.toLowerCase() !== "content-type" && (k[E] = L);
      Object.keys(k).length > 0 && (p.headers = k);
    }
    s && !["GET", "HEAD"].includes(t.toUpperCase()) && (p.body = s);
    const f = await fetch(n, p), v = performance.now() - d, h = await f.text(), b = new TextEncoder().encode(h).length, m = {};
    return f.headers.forEach((k, E) => {
      m[E.toLowerCase()] = k;
    }), Nr(h, m), {
      status: f.status,
      statusText: f.statusText,
      headers: m,
      body: h,
      duration: v,
      size: b
    };
  } catch (l) {
    const p = performance.now() - d;
    return l.name === "AbortError" ? {
      status: 0,
      statusText: "Request timed out",
      headers: {},
      body: `Request timed out after ${r}ms`,
      duration: p,
      size: 0
    } : {
      status: 0,
      statusText: "Network Error",
      headers: {},
      body: l.message || "Unknown network error",
      duration: p,
      size: 0
    };
  } finally {
    clearTimeout(c);
  }
}
function Nr(e, t) {
  const n = y.get().auth;
  if (n.locked) return;
  const a = y.get().spec;
  let s = n.activeScheme;
  if (a) {
    for (const [o, c] of Object.entries(a.securitySchemes))
      if (c.type === "http" && c.scheme?.toLowerCase() === "bearer") {
        s = o;
        break;
      }
  }
  const r = t["x-new-access-token"];
  if (r) {
    s ? (y.setSchemeValue(s, r), y.setAuth({ source: "auto-header" })) : y.setAuth({ token: r, source: "auto-header" });
    return;
  }
  try {
    const o = JSON.parse(e), c = o.accessToken || o.access_token || o.token;
    typeof c == "string" && c.length > 10 && (s ? (y.setSchemeValue(s, c), y.setAuth({ source: "auto-body" })) : y.setAuth({ token: c, source: "auto-body" }));
  } catch {
  }
}
function kr(e, t, n, a) {
  let s = t;
  for (const [l, p] of Object.entries(n))
    s = s.replace(`{${l}}`, encodeURIComponent(p));
  const o = e.replace(/\/+$/, "") + s, c = new URLSearchParams();
  for (const [l, p] of Object.entries(a))
    p && c.set(l, p);
  const d = c.toString();
  return d ? `${o}?${d}` : o;
}
function on(e) {
  return [
    { language: "curl", label: "cURL", code: wr(e) },
    { language: "javascript", label: "JavaScript", code: Cr(e) },
    { language: "python", label: "Python", code: Ar(e) },
    { language: "go", label: "Go", code: Lr(e) }
  ];
}
function wr({ method: e, url: t, headers: n, body: a }) {
  const s = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [r, o] of Object.entries(n))
    s.push(`  -H '${r}: ${o}'`);
  return a && s.push(`  -d '${a}'`), s.join(` \\
`);
}
function Cr({ method: e, url: t, headers: n, body: a }) {
  const s = [];
  s.push(`  method: '${e.toUpperCase()}'`);
  const r = Object.entries(n);
  if (r.length > 0) {
    const o = r.map(([c, d]) => `    '${c}': '${d}'`).join(`,
`);
    s.push(`  headers: {
${o}
  }`);
  }
  return a && s.push(`  body: JSON.stringify(${a})`), `const response = await fetch('${t}', {
${s.join(`,
`)}
});

const data = await response.json();
console.log(data);`;
}
function Ar({ method: e, url: t, headers: n, body: a }) {
  const s = ["import requests", ""], r = Object.entries(n);
  if (r.length > 0) {
    const c = r.map(([d, l]) => `    "${d}": "${l}"`).join(`,
`);
    s.push(`headers = {
${c}
}`);
  }
  a && s.push(`payload = ${a}`);
  const o = [`"${t}"`];
  return r.length > 0 && o.push("headers=headers"), a && o.push("json=payload"), s.push(""), s.push(`response = requests.${e.toLowerCase()}(${o.join(", ")})`), s.push("print(response.json())"), s.join(`
`);
}
function Lr({ method: e, url: t, headers: n, body: a }) {
  const s = [
    "package main",
    "",
    "import (",
    '    "fmt"',
    '    "io"',
    '    "net/http"'
  ];
  a && s.push('    "strings"'), s.push(")", "", "func main() {"), a ? (s.push(`    body := strings.NewReader(\`${a}\`)`), s.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", body)`)) : s.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", nil)`), s.push("    if err != nil {"), s.push("        panic(err)"), s.push("    }");
  for (const [r, o] of Object.entries(n))
    s.push(`    req.Header.Set("${r}", "${o}")`);
  return s.push(""), s.push("    resp, err := http.DefaultClient.Do(req)"), s.push("    if err != nil {"), s.push("        panic(err)"), s.push("    }"), s.push("    defer resp.Body.Close()"), s.push(""), s.push("    data, _ := io.ReadAll(resp.Body)"), s.push("    fmt.Println(string(data))"), s.push("}"), s.join(`
`);
}
function Or(e) {
  if (e.length === 0) return [];
  const t = (s, r, o) => {
    if (r && s.examples?.[r] !== void 0) {
      const c = s.examples[r], d = c?.value ?? c.value;
      if (d != null) return String(d);
    }
    return o !== void 0 && s.schema?.enum && s.schema.enum[o] !== void 0 ? String(s.schema.enum[o]) : s.example !== void 0 && s.example !== null ? String(s.example) : s.schema?.example !== void 0 && s.schema.example !== null ? String(s.schema.example) : s.schema?.default !== void 0 && s.schema.default !== null ? String(s.schema.default) : s.schema?.enum && s.schema.enum.length > 0 ? String(s.schema.enum[0]) : s.schema?.type === "integer" || s.schema?.type === "number" ? "0" : s.schema?.type === "boolean" ? "true" : s.in === "path" ? "id" : "value";
  }, n = /* @__PURE__ */ new Set();
  for (const s of e)
    if (s.examples && typeof s.examples == "object")
      for (const r of Object.keys(s.examples)) n.add(r);
  const a = [];
  if (n.size > 0)
    for (const s of n) {
      const r = {};
      for (const d of e)
        r[d.name] = t(d, s);
      const c = e.find((d) => d.examples?.[s])?.examples?.[s];
      a.push({ name: s, summary: c?.summary, values: r });
    }
  else {
    const s = e.find((r) => r.schema?.enum && r.schema.enum.length > 1);
    if (s?.schema?.enum)
      for (let r = 0; r < s.schema.enum.length; r++) {
        const o = {};
        for (const d of e)
          o[d.name] = d === s ? t(d, null, r) : t(d, null);
        const c = String(s.schema.enum[r]);
        a.push({ name: c, values: o });
      }
    else {
      const r = {};
      for (const o of e)
        r[o.name] = t(o, null);
      a.push({ name: "Default", values: r });
    }
  }
  return a;
}
function zs(e) {
  const t = [];
  if (e.examples && typeof e.examples == "object")
    for (const [n, a] of Object.entries(e.examples))
      t.push({
        name: n,
        summary: a.summary,
        description: a.description,
        value: a.value
      });
  if (t.length === 0 && e.example !== void 0 && t.push({ name: "Default", value: e.example }), t.length === 0 && e.schema) {
    const n = We(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function Tr(e) {
  const t = [e.summary, e.description].filter(Boolean);
  return [...new Set(t)].join(" — ") || e.name;
}
function as(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function _r(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var cn, rs;
function Rr() {
  if (rs) return cn;
  rs = 1;
  function e(u) {
    return u instanceof Map ? u.clear = u.delete = u.set = function() {
      throw new Error("map is read-only");
    } : u instanceof Set && (u.add = u.clear = u.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(u), Object.getOwnPropertyNames(u).forEach((g) => {
      const S = u[g], P = typeof S;
      (P === "object" || P === "function") && !Object.isFrozen(S) && e(S);
    }), u;
  }
  class t {
    /**
     * @param {CompiledMode} mode
     */
    constructor(g) {
      g.data === void 0 && (g.data = {}), this.data = g.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function n(u) {
    return u.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function a(u, ...g) {
    const S = /* @__PURE__ */ Object.create(null);
    for (const P in u)
      S[P] = u[P];
    return g.forEach(function(P) {
      for (const Q in P)
        S[Q] = P[Q];
    }), /** @type {T} */
    S;
  }
  const s = "</span>", r = (u) => !!u.scope, o = (u, { prefix: g }) => {
    if (u.startsWith("language:"))
      return u.replace("language:", "language-");
    if (u.includes(".")) {
      const S = u.split(".");
      return [
        `${g}${S.shift()}`,
        ...S.map((P, Q) => `${P}${"_".repeat(Q + 1)}`)
      ].join(" ");
    }
    return `${g}${u}`;
  };
  class c {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(g, S) {
      this.buffer = "", this.classPrefix = S.classPrefix, g.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(g) {
      this.buffer += n(g);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(g) {
      if (!r(g)) return;
      const S = o(
        g.scope,
        { prefix: this.classPrefix }
      );
      this.span(S);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(g) {
      r(g) && (this.buffer += s);
    }
    /**
     * returns the accumulated buffer
    */
    value() {
      return this.buffer;
    }
    // helpers
    /**
     * Builds a span element
     *
     * @param {string} className */
    span(g) {
      this.buffer += `<span class="${g}">`;
    }
  }
  const d = (u = {}) => {
    const g = { children: [] };
    return Object.assign(g, u), g;
  };
  class l {
    constructor() {
      this.rootNode = d(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(g) {
      this.top.children.push(g);
    }
    /** @param {string} scope */
    openNode(g) {
      const S = d({ scope: g });
      this.add(S), this.stack.push(S);
    }
    closeNode() {
      if (this.stack.length > 1)
        return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); ) ;
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    /**
     * @typedef { import("./html_renderer").Renderer } Renderer
     * @param {Renderer} builder
     */
    walk(g) {
      return this.constructor._walk(g, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(g, S) {
      return typeof S == "string" ? g.addText(S) : S.children && (g.openNode(S), S.children.forEach((P) => this._walk(g, P)), g.closeNode(S)), g;
    }
    /**
     * @param {Node} node
     */
    static _collapse(g) {
      typeof g != "string" && g.children && (g.children.every((S) => typeof S == "string") ? g.children = [g.children.join("")] : g.children.forEach((S) => {
        l._collapse(S);
      }));
    }
  }
  class p extends l {
    /**
     * @param {*} options
     */
    constructor(g) {
      super(), this.options = g;
    }
    /**
     * @param {string} text
     */
    addText(g) {
      g !== "" && this.add(g);
    }
    /** @param {string} scope */
    startScope(g) {
      this.openNode(g);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(g, S) {
      const P = g.root;
      S && (P.scope = `language:${S}`), this.add(P);
    }
    toHTML() {
      return new c(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function f(u) {
    return u ? typeof u == "string" ? u : u.source : null;
  }
  function v(u) {
    return m("(?=", u, ")");
  }
  function h(u) {
    return m("(?:", u, ")*");
  }
  function b(u) {
    return m("(?:", u, ")?");
  }
  function m(...u) {
    return u.map((S) => f(S)).join("");
  }
  function k(u) {
    const g = u[u.length - 1];
    return typeof g == "object" && g.constructor === Object ? (u.splice(u.length - 1, 1), g) : {};
  }
  function E(...u) {
    return "(" + (k(u).capture ? "" : "?:") + u.map((P) => f(P)).join("|") + ")";
  }
  function L(u) {
    return new RegExp(u.toString() + "|").exec("").length - 1;
  }
  function j(u, g) {
    const S = u && u.exec(g);
    return S && S.index === 0;
  }
  const C = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function M(u, { joinWith: g }) {
    let S = 0;
    return u.map((P) => {
      S += 1;
      const Q = S;
      let ee = f(P), A = "";
      for (; ee.length > 0; ) {
        const w = C.exec(ee);
        if (!w) {
          A += ee;
          break;
        }
        A += ee.substring(0, w.index), ee = ee.substring(w.index + w[0].length), w[0][0] === "\\" && w[1] ? A += "\\" + String(Number(w[1]) + Q) : (A += w[0], w[0] === "(" && S++);
      }
      return A;
    }).map((P) => `(${P})`).join(g);
  }
  const I = /\b\B/, T = "[a-zA-Z]\\w*", _ = "[a-zA-Z_]\\w*", X = "\\b\\d+(\\.\\d+)?", J = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", z = "\\b(0b[01]+)", xe = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", Et = (u = {}) => {
    const g = /^#![ ]*\//;
    return u.binary && (u.begin = m(
      g,
      /.*\b/,
      u.binary,
      /\b.*/
    )), a({
      scope: "meta",
      begin: g,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (S, P) => {
        S.index !== 0 && P.ignoreMatch();
      }
    }, u);
  }, Le = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, Kt = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [Le]
  }, Vt = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [Le]
  }, Ve = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, je = function(u, g, S = {}) {
    const P = a(
      {
        scope: "comment",
        begin: u,
        end: g,
        contains: []
      },
      S
    );
    P.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const Q = E(
      // list of common 1 and 2 letter words in English
      "I",
      "a",
      "is",
      "so",
      "us",
      "to",
      "at",
      "if",
      "in",
      "it",
      "on",
      // note: this is not an exhaustive list of contractions, just popular ones
      /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
      // contractions - can't we'd they're let's, etc
      /[A-Za-z]+[-][a-z]+/,
      // `no-way`, etc.
      /[A-Za-z][a-z]{2,}/
      // allow capitalized words at beginning of sentences
    );
    return P.contains.push(
      {
        // TODO: how to include ", (, ) without breaking grammars that use these for
        // comment delimiters?
        // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
        // ---
        // this tries to find sequences of 3 english words in a row (without any
        // "programming" type syntax) this gives us a strong signal that we've
        // TRULY found a comment - vs perhaps scanning with the wrong language.
        // It's possible to find something that LOOKS like the start of the
        // comment - but then if there is no readable text - good chance it is a
        // false match and not a comment.
        //
        // for a visual example please see:
        // https://github.com/highlightjs/highlight.js/issues/2827
        begin: m(
          /[ ]+/,
          // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          "(",
          Q,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), P;
  }, St = je("//", "$"), it = je("/\\*", "\\*/"), $ = je("#", "$"), W = {
    scope: "number",
    begin: X,
    relevance: 0
  }, ie = {
    scope: "number",
    begin: J,
    relevance: 0
  }, he = {
    scope: "number",
    begin: z,
    relevance: 0
  }, Pe = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      Le,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [Le]
      }
    ]
  }, Y = {
    scope: "title",
    begin: T,
    relevance: 0
  }, Z = {
    scope: "title",
    begin: _,
    relevance: 0
  }, ge = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + _,
    relevance: 0
  };
  var Oe = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: Kt,
    BACKSLASH_ESCAPE: Le,
    BINARY_NUMBER_MODE: he,
    BINARY_NUMBER_RE: z,
    COMMENT: je,
    C_BLOCK_COMMENT_MODE: it,
    C_LINE_COMMENT_MODE: St,
    C_NUMBER_MODE: ie,
    C_NUMBER_RE: J,
    END_SAME_AS_BEGIN: function(u) {
      return Object.assign(
        u,
        {
          /** @type {ModeCallback} */
          "on:begin": (g, S) => {
            S.data._beginMatch = g[1];
          },
          /** @type {ModeCallback} */
          "on:end": (g, S) => {
            S.data._beginMatch !== g[1] && S.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: $,
    IDENT_RE: T,
    MATCH_NOTHING_RE: I,
    METHOD_GUARD: ge,
    NUMBER_MODE: W,
    NUMBER_RE: X,
    PHRASAL_WORDS_MODE: Ve,
    QUOTE_STRING_MODE: Vt,
    REGEXP_MODE: Pe,
    RE_STARTERS_RE: xe,
    SHEBANG: Et,
    TITLE_MODE: Y,
    UNDERSCORE_IDENT_RE: _,
    UNDERSCORE_TITLE_MODE: Z
  });
  function Gt(u, g) {
    u.input[u.index - 1] === "." && g.ignoreMatch();
  }
  function Je(u, g) {
    u.className !== void 0 && (u.scope = u.className, delete u.className);
  }
  function Ne(u, g) {
    g && u.beginKeywords && (u.begin = "\\b(" + u.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", u.__beforeBegin = Gt, u.keywords = u.keywords || u.beginKeywords, delete u.beginKeywords, u.relevance === void 0 && (u.relevance = 0));
  }
  function De(u, g) {
    Array.isArray(u.illegal) && (u.illegal = E(...u.illegal));
  }
  function ct(u, g) {
    if (u.match) {
      if (u.begin || u.end) throw new Error("begin & end are not supported with match");
      u.begin = u.match, delete u.match;
    }
  }
  function Xe(u, g) {
    u.relevance === void 0 && (u.relevance = 1);
  }
  const Te = (u, g) => {
    if (!u.beforeMatch) return;
    if (u.starts) throw new Error("beforeMatch cannot be used with starts");
    const S = Object.assign({}, u);
    Object.keys(u).forEach((P) => {
      delete u[P];
    }), u.keywords = S.keywords, u.begin = m(S.beforeMatch, v(S.begin)), u.starts = {
      relevance: 0,
      contains: [
        Object.assign(S, { endsParent: !0 })
      ]
    }, u.relevance = 0, delete S.beforeMatch;
  }, me = [
    "of",
    "and",
    "for",
    "in",
    "not",
    "or",
    "if",
    "then",
    "parent",
    // common variable name
    "list",
    // common variable name
    "value"
    // common variable name
  ], Ye = "keyword";
  function He(u, g, S = Ye) {
    const P = /* @__PURE__ */ Object.create(null);
    return typeof u == "string" ? Q(S, u.split(" ")) : Array.isArray(u) ? Q(S, u) : Object.keys(u).forEach(function(ee) {
      Object.assign(
        P,
        He(u[ee], g, ee)
      );
    }), P;
    function Q(ee, A) {
      g && (A = A.map((w) => w.toLowerCase())), A.forEach(function(w) {
        const B = w.split("|");
        P[B[0]] = [ee, lt(B[0], B[1])];
      });
    }
  }
  function lt(u, g) {
    return g ? Number(g) : dt(u) ? 0 : 1;
  }
  function dt(u) {
    return me.includes(u.toLowerCase());
  }
  const Ze = {}, Ue = (u) => {
    console.error(u);
  }, $n = (u, ...g) => {
    console.log(`WARN: ${u}`, ...g);
  }, Qe = (u, g) => {
    Ze[`${u}/${g}`] || (console.log(`Deprecated as of ${u}. ${g}`), Ze[`${u}/${g}`] = !0);
  }, Nt = new Error();
  function qn(u, g, { key: S }) {
    let P = 0;
    const Q = u[S], ee = {}, A = {};
    for (let w = 1; w <= g.length; w++)
      A[w + P] = Q[w], ee[w + P] = !0, P += L(g[w - 1]);
    u[S] = A, u[S]._emit = ee, u[S]._multi = !0;
  }
  function Zs(u) {
    if (Array.isArray(u.begin)) {
      if (u.skip || u.excludeBegin || u.returnBegin)
        throw Ue("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), Nt;
      if (typeof u.beginScope != "object" || u.beginScope === null)
        throw Ue("beginScope must be object"), Nt;
      qn(u, u.begin, { key: "beginScope" }), u.begin = M(u.begin, { joinWith: "" });
    }
  }
  function Qs(u) {
    if (Array.isArray(u.end)) {
      if (u.skip || u.excludeEnd || u.returnEnd)
        throw Ue("skip, excludeEnd, returnEnd not compatible with endScope: {}"), Nt;
      if (typeof u.endScope != "object" || u.endScope === null)
        throw Ue("endScope must be object"), Nt;
      qn(u, u.end, { key: "endScope" }), u.end = M(u.end, { joinWith: "" });
    }
  }
  function ea(u) {
    u.scope && typeof u.scope == "object" && u.scope !== null && (u.beginScope = u.scope, delete u.scope);
  }
  function ta(u) {
    ea(u), typeof u.beginScope == "string" && (u.beginScope = { _wrap: u.beginScope }), typeof u.endScope == "string" && (u.endScope = { _wrap: u.endScope }), Zs(u), Qs(u);
  }
  function na(u) {
    function g(A, w) {
      return new RegExp(
        f(A),
        "m" + (u.case_insensitive ? "i" : "") + (u.unicodeRegex ? "u" : "") + (w ? "g" : "")
      );
    }
    class S {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(w, B) {
        B.position = this.position++, this.matchIndexes[this.matchAt] = B, this.regexes.push([B, w]), this.matchAt += L(w) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const w = this.regexes.map((B) => B[1]);
        this.matcherRe = g(M(w, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(w) {
        this.matcherRe.lastIndex = this.lastIndex;
        const B = this.matcherRe.exec(w);
        if (!B)
          return null;
        const se = B.findIndex((ut, Xt) => Xt > 0 && ut !== void 0), te = this.matchIndexes[se];
        return B.splice(0, se), Object.assign(B, te);
      }
    }
    class P {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(w) {
        if (this.multiRegexes[w]) return this.multiRegexes[w];
        const B = new S();
        return this.rules.slice(w).forEach(([se, te]) => B.addRule(se, te)), B.compile(), this.multiRegexes[w] = B, B;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(w, B) {
        this.rules.push([w, B]), B.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(w) {
        const B = this.getMatcher(this.regexIndex);
        B.lastIndex = this.lastIndex;
        let se = B.exec(w);
        if (this.resumingScanAtSamePosition() && !(se && se.index === this.lastIndex)) {
          const te = this.getMatcher(0);
          te.lastIndex = this.lastIndex + 1, se = te.exec(w);
        }
        return se && (this.regexIndex += se.position + 1, this.regexIndex === this.count && this.considerAll()), se;
      }
    }
    function Q(A) {
      const w = new P();
      return A.contains.forEach((B) => w.addRule(B.begin, { rule: B, type: "begin" })), A.terminatorEnd && w.addRule(A.terminatorEnd, { type: "end" }), A.illegal && w.addRule(A.illegal, { type: "illegal" }), w;
    }
    function ee(A, w) {
      const B = (
        /** @type CompiledMode */
        A
      );
      if (A.isCompiled) return B;
      [
        Je,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        ct,
        ta,
        Te
      ].forEach((te) => te(A, w)), u.compilerExtensions.forEach((te) => te(A, w)), A.__beforeBegin = null, [
        Ne,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        De,
        // default to 1 relevance if not specified
        Xe
      ].forEach((te) => te(A, w)), A.isCompiled = !0;
      let se = null;
      return typeof A.keywords == "object" && A.keywords.$pattern && (A.keywords = Object.assign({}, A.keywords), se = A.keywords.$pattern, delete A.keywords.$pattern), se = se || /\w+/, A.keywords && (A.keywords = He(A.keywords, u.case_insensitive)), B.keywordPatternRe = g(se, !0), w && (A.begin || (A.begin = /\B|\b/), B.beginRe = g(B.begin), !A.end && !A.endsWithParent && (A.end = /\B|\b/), A.end && (B.endRe = g(B.end)), B.terminatorEnd = f(B.end) || "", A.endsWithParent && w.terminatorEnd && (B.terminatorEnd += (A.end ? "|" : "") + w.terminatorEnd)), A.illegal && (B.illegalRe = g(
        /** @type {RegExp | string} */
        A.illegal
      )), A.contains || (A.contains = []), A.contains = [].concat(...A.contains.map(function(te) {
        return sa(te === "self" ? A : te);
      })), A.contains.forEach(function(te) {
        ee(
          /** @type Mode */
          te,
          B
        );
      }), A.starts && ee(A.starts, w), B.matcher = Q(B), B;
    }
    if (u.compilerExtensions || (u.compilerExtensions = []), u.contains && u.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return u.classNameAliases = a(u.classNameAliases || {}), ee(
      /** @type Mode */
      u
    );
  }
  function In(u) {
    return u ? u.endsWithParent || In(u.starts) : !1;
  }
  function sa(u) {
    return u.variants && !u.cachedVariants && (u.cachedVariants = u.variants.map(function(g) {
      return a(u, { variants: null }, g);
    })), u.cachedVariants ? u.cachedVariants : In(u) ? a(u, { starts: u.starts ? a(u.starts) : null }) : Object.isFrozen(u) ? a(u) : u;
  }
  var aa = "11.11.1";
  class ra extends Error {
    constructor(g, S) {
      super(g), this.name = "HTMLInjectionError", this.html = S;
    }
  }
  const Jt = n, Bn = a, jn = Symbol("nomatch"), oa = 7, Pn = function(u) {
    const g = /* @__PURE__ */ Object.create(null), S = /* @__PURE__ */ Object.create(null), P = [];
    let Q = !0;
    const ee = "Could not find the language '{}', did you forget to load/include a language module?", A = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let w = {
      ignoreUnescapedHTML: !1,
      throwUnescapedHTML: !1,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      // beta configuration options, subject to change, welcome to discuss
      // https://github.com/highlightjs/highlight.js/issues/1086
      __emitter: p
    };
    function B(x) {
      return w.noHighlightRe.test(x);
    }
    function se(x) {
      let R = x.className + " ";
      R += x.parentNode ? x.parentNode.className : "";
      const F = w.languageDetectRe.exec(R);
      if (F) {
        const V = qe(F[1]);
        return V || ($n(ee.replace("{}", F[1])), $n("Falling back to no-highlight mode for this block.", x)), V ? F[1] : "no-highlight";
      }
      return R.split(/\s+/).find((V) => B(V) || qe(V));
    }
    function te(x, R, F) {
      let V = "", ne = "";
      typeof R == "object" ? (V = x, F = R.ignoreIllegals, ne = R.language) : (Qe("10.7.0", "highlight(lang, code, ...args) has been deprecated."), Qe("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), ne = x, V = R), F === void 0 && (F = !0);
      const Ee = {
        code: V,
        language: ne
      };
      wt("before:highlight", Ee);
      const Ie = Ee.result ? Ee.result : ut(Ee.language, Ee.code, F);
      return Ie.code = Ee.code, wt("after:highlight", Ie), Ie;
    }
    function ut(x, R, F, V) {
      const ne = /* @__PURE__ */ Object.create(null);
      function Ee(N, O) {
        return N.keywords[O];
      }
      function Ie() {
        if (!D.keywords) {
          ce.addText(G);
          return;
        }
        let N = 0;
        D.keywordPatternRe.lastIndex = 0;
        let O = D.keywordPatternRe.exec(G), U = "";
        for (; O; ) {
          U += G.substring(N, O.index);
          const K = we.case_insensitive ? O[0].toLowerCase() : O[0], de = Ee(D, K);
          if (de) {
            const [_e, Na] = de;
            if (ce.addText(U), U = "", ne[K] = (ne[K] || 0) + 1, ne[K] <= oa && (Lt += Na), _e.startsWith("_"))
              U += O[0];
            else {
              const ka = we.classNameAliases[_e] || _e;
              ke(O[0], ka);
            }
          } else
            U += O[0];
          N = D.keywordPatternRe.lastIndex, O = D.keywordPatternRe.exec(G);
        }
        U += G.substring(N), ce.addText(U);
      }
      function Ct() {
        if (G === "") return;
        let N = null;
        if (typeof D.subLanguage == "string") {
          if (!g[D.subLanguage]) {
            ce.addText(G);
            return;
          }
          N = ut(D.subLanguage, G, !0, Vn[D.subLanguage]), Vn[D.subLanguage] = /** @type {CompiledMode} */
          N._top;
        } else
          N = Yt(G, D.subLanguage.length ? D.subLanguage : null);
        D.relevance > 0 && (Lt += N.relevance), ce.__addSublanguage(N._emitter, N.language);
      }
      function ve() {
        D.subLanguage != null ? Ct() : Ie(), G = "";
      }
      function ke(N, O) {
        N !== "" && (ce.startScope(O), ce.addText(N), ce.endScope());
      }
      function zn(N, O) {
        let U = 1;
        const K = O.length - 1;
        for (; U <= K; ) {
          if (!N._emit[U]) {
            U++;
            continue;
          }
          const de = we.classNameAliases[N[U]] || N[U], _e = O[U];
          de ? ke(_e, de) : (G = _e, Ie(), G = ""), U++;
        }
      }
      function Fn(N, O) {
        return N.scope && typeof N.scope == "string" && ce.openNode(we.classNameAliases[N.scope] || N.scope), N.beginScope && (N.beginScope._wrap ? (ke(G, we.classNameAliases[N.beginScope._wrap] || N.beginScope._wrap), G = "") : N.beginScope._multi && (zn(N.beginScope, O), G = "")), D = Object.create(N, { parent: { value: D } }), D;
      }
      function Wn(N, O, U) {
        let K = j(N.endRe, U);
        if (K) {
          if (N["on:end"]) {
            const de = new t(N);
            N["on:end"](O, de), de.isMatchIgnored && (K = !1);
          }
          if (K) {
            for (; N.endsParent && N.parent; )
              N = N.parent;
            return N;
          }
        }
        if (N.endsWithParent)
          return Wn(N.parent, O, U);
      }
      function ba(N) {
        return D.matcher.regexIndex === 0 ? (G += N[0], 1) : (tn = !0, 0);
      }
      function ya(N) {
        const O = N[0], U = N.rule, K = new t(U), de = [U.__beforeBegin, U["on:begin"]];
        for (const _e of de)
          if (_e && (_e(N, K), K.isMatchIgnored))
            return ba(O);
        return U.skip ? G += O : (U.excludeBegin && (G += O), ve(), !U.returnBegin && !U.excludeBegin && (G = O)), Fn(U, N), U.returnBegin ? 0 : O.length;
      }
      function xa(N) {
        const O = N[0], U = R.substring(N.index), K = Wn(D, N, U);
        if (!K)
          return jn;
        const de = D;
        D.endScope && D.endScope._wrap ? (ve(), ke(O, D.endScope._wrap)) : D.endScope && D.endScope._multi ? (ve(), zn(D.endScope, N)) : de.skip ? G += O : (de.returnEnd || de.excludeEnd || (G += O), ve(), de.excludeEnd && (G = O));
        do
          D.scope && ce.closeNode(), !D.skip && !D.subLanguage && (Lt += D.relevance), D = D.parent;
        while (D !== K.parent);
        return K.starts && Fn(K.starts, N), de.returnEnd ? 0 : O.length;
      }
      function Ea() {
        const N = [];
        for (let O = D; O !== we; O = O.parent)
          O.scope && N.unshift(O.scope);
        N.forEach((O) => ce.openNode(O));
      }
      let At = {};
      function Kn(N, O) {
        const U = O && O[0];
        if (G += N, U == null)
          return ve(), 0;
        if (At.type === "begin" && O.type === "end" && At.index === O.index && U === "") {
          if (G += R.slice(O.index, O.index + 1), !Q) {
            const K = new Error(`0 width match regex (${x})`);
            throw K.languageName = x, K.badRule = At.rule, K;
          }
          return 1;
        }
        if (At = O, O.type === "begin")
          return ya(O);
        if (O.type === "illegal" && !F) {
          const K = new Error('Illegal lexeme "' + U + '" for mode "' + (D.scope || "<unnamed>") + '"');
          throw K.mode = D, K;
        } else if (O.type === "end") {
          const K = xa(O);
          if (K !== jn)
            return K;
        }
        if (O.type === "illegal" && U === "")
          return G += `
`, 1;
        if (en > 1e5 && en > O.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return G += U, U.length;
      }
      const we = qe(x);
      if (!we)
        throw Ue(ee.replace("{}", x)), new Error('Unknown language: "' + x + '"');
      const Sa = na(we);
      let Qt = "", D = V || Sa;
      const Vn = {}, ce = new w.__emitter(w);
      Ea();
      let G = "", Lt = 0, ze = 0, en = 0, tn = !1;
      try {
        if (we.__emitTokens)
          we.__emitTokens(R, ce);
        else {
          for (D.matcher.considerAll(); ; ) {
            en++, tn ? tn = !1 : D.matcher.considerAll(), D.matcher.lastIndex = ze;
            const N = D.matcher.exec(R);
            if (!N) break;
            const O = R.substring(ze, N.index), U = Kn(O, N);
            ze = N.index + U;
          }
          Kn(R.substring(ze));
        }
        return ce.finalize(), Qt = ce.toHTML(), {
          language: x,
          value: Qt,
          relevance: Lt,
          illegal: !1,
          _emitter: ce,
          _top: D
        };
      } catch (N) {
        if (N.message && N.message.includes("Illegal"))
          return {
            language: x,
            value: Jt(R),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: N.message,
              index: ze,
              context: R.slice(ze - 100, ze + 100),
              mode: N.mode,
              resultSoFar: Qt
            },
            _emitter: ce
          };
        if (Q)
          return {
            language: x,
            value: Jt(R),
            illegal: !1,
            relevance: 0,
            errorRaised: N,
            _emitter: ce,
            _top: D
          };
        throw N;
      }
    }
    function Xt(x) {
      const R = {
        value: Jt(x),
        illegal: !1,
        relevance: 0,
        _top: A,
        _emitter: new w.__emitter(w)
      };
      return R._emitter.addText(x), R;
    }
    function Yt(x, R) {
      R = R || w.languages || Object.keys(g);
      const F = Xt(x), V = R.filter(qe).filter(Un).map(
        (ve) => ut(ve, x, !1)
      );
      V.unshift(F);
      const ne = V.sort((ve, ke) => {
        if (ve.relevance !== ke.relevance) return ke.relevance - ve.relevance;
        if (ve.language && ke.language) {
          if (qe(ve.language).supersetOf === ke.language)
            return 1;
          if (qe(ke.language).supersetOf === ve.language)
            return -1;
        }
        return 0;
      }), [Ee, Ie] = ne, Ct = Ee;
      return Ct.secondBest = Ie, Ct;
    }
    function ia(x, R, F) {
      const V = R && S[R] || F;
      x.classList.add("hljs"), x.classList.add(`language-${V}`);
    }
    function Zt(x) {
      let R = null;
      const F = se(x);
      if (B(F)) return;
      if (wt(
        "before:highlightElement",
        { el: x, language: F }
      ), x.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", x);
        return;
      }
      if (x.children.length > 0 && (w.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(x)), w.throwUnescapedHTML))
        throw new ra(
          "One of your code blocks includes unescaped HTML.",
          x.innerHTML
        );
      R = x;
      const V = R.textContent, ne = F ? te(V, { language: F, ignoreIllegals: !0 }) : Yt(V);
      x.innerHTML = ne.value, x.dataset.highlighted = "yes", ia(x, F, ne.language), x.result = {
        language: ne.language,
        // TODO: remove with version 11.0
        re: ne.relevance,
        relevance: ne.relevance
      }, ne.secondBest && (x.secondBest = {
        language: ne.secondBest.language,
        relevance: ne.secondBest.relevance
      }), wt("after:highlightElement", { el: x, result: ne, text: V });
    }
    function ca(x) {
      w = Bn(w, x);
    }
    const la = () => {
      kt(), Qe("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function da() {
      kt(), Qe("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let Dn = !1;
    function kt() {
      function x() {
        kt();
      }
      if (document.readyState === "loading") {
        Dn || window.addEventListener("DOMContentLoaded", x, !1), Dn = !0;
        return;
      }
      document.querySelectorAll(w.cssSelector).forEach(Zt);
    }
    function ua(x, R) {
      let F = null;
      try {
        F = R(u);
      } catch (V) {
        if (Ue("Language definition for '{}' could not be registered.".replace("{}", x)), Q)
          Ue(V);
        else
          throw V;
        F = A;
      }
      F.name || (F.name = x), g[x] = F, F.rawDefinition = R.bind(null, u), F.aliases && Hn(F.aliases, { languageName: x });
    }
    function pa(x) {
      delete g[x];
      for (const R of Object.keys(S))
        S[R] === x && delete S[R];
    }
    function fa() {
      return Object.keys(g);
    }
    function qe(x) {
      return x = (x || "").toLowerCase(), g[x] || g[S[x]];
    }
    function Hn(x, { languageName: R }) {
      typeof x == "string" && (x = [x]), x.forEach((F) => {
        S[F.toLowerCase()] = R;
      });
    }
    function Un(x) {
      const R = qe(x);
      return R && !R.disableAutodetect;
    }
    function ma(x) {
      x["before:highlightBlock"] && !x["before:highlightElement"] && (x["before:highlightElement"] = (R) => {
        x["before:highlightBlock"](
          Object.assign({ block: R.el }, R)
        );
      }), x["after:highlightBlock"] && !x["after:highlightElement"] && (x["after:highlightElement"] = (R) => {
        x["after:highlightBlock"](
          Object.assign({ block: R.el }, R)
        );
      });
    }
    function ha(x) {
      ma(x), P.push(x);
    }
    function ga(x) {
      const R = P.indexOf(x);
      R !== -1 && P.splice(R, 1);
    }
    function wt(x, R) {
      const F = x;
      P.forEach(function(V) {
        V[F] && V[F](R);
      });
    }
    function va(x) {
      return Qe("10.7.0", "highlightBlock will be removed entirely in v12.0"), Qe("10.7.0", "Please use highlightElement now."), Zt(x);
    }
    Object.assign(u, {
      highlight: te,
      highlightAuto: Yt,
      highlightAll: kt,
      highlightElement: Zt,
      // TODO: Remove with v12 API
      highlightBlock: va,
      configure: ca,
      initHighlighting: la,
      initHighlightingOnLoad: da,
      registerLanguage: ua,
      unregisterLanguage: pa,
      listLanguages: fa,
      getLanguage: qe,
      registerAliases: Hn,
      autoDetection: Un,
      inherit: Bn,
      addPlugin: ha,
      removePlugin: ga
    }), u.debugMode = function() {
      Q = !1;
    }, u.safeMode = function() {
      Q = !0;
    }, u.versionString = aa, u.regex = {
      concat: m,
      lookahead: v,
      either: E,
      optional: b,
      anyNumberOfTimes: h
    };
    for (const x in Oe)
      typeof Oe[x] == "object" && e(Oe[x]);
    return Object.assign(u, Oe), u;
  }, et = Pn({});
  return et.newInstance = () => Pn({}), cn = et, et.HighlightJS = et, et.default = et, cn;
}
var Mr = /* @__PURE__ */ Rr();
const xt = /* @__PURE__ */ _r(Mr);
function $r(e) {
  const t = e.regex, n = {}, a = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [n]
      }
      // default values
    ]
  };
  Object.assign(n, {
    className: "variable",
    variants: [
      { begin: t.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        "(?![\\w\\d])(?![$])"
      ) },
      a
    ]
  });
  const s = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [e.BACKSLASH_ESCAPE]
  }, r = e.inherit(
    e.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: "comment"
      }
    }
  ), o = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      e.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  }, c = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      n,
      s
    ]
  };
  s.contains.push(c);
  const d = {
    match: /\\"/
  }, l = {
    className: "string",
    begin: /'/,
    end: /'/
  }, p = {
    match: /\\'/
  }, f = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      e.NUMBER_MODE,
      n
    ]
  }, v = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ], h = e.SHEBANG({
    binary: `(${v.join("|")})`,
    relevance: 10
  }), b = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: !0,
    contains: [e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  }, m = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "time",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "coproc",
    "function",
    "select"
  ], k = [
    "true",
    "false"
  ], E = { match: /(\/[a-z._-]+)+/ }, L = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ], j = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ], C = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ], M = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: [
      "sh",
      "zsh"
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: m,
      literal: k,
      built_in: [
        ...L,
        ...j,
        // Shell modifiers
        "set",
        "shopt",
        ...C,
        ...M
      ]
    },
    contains: [
      h,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      b,
      f,
      r,
      o,
      E,
      c,
      d,
      l,
      p,
      n
    ]
  };
}
function qr(e) {
  const r = {
    keyword: [
      "break",
      "case",
      "chan",
      "const",
      "continue",
      "default",
      "defer",
      "else",
      "fallthrough",
      "for",
      "func",
      "go",
      "goto",
      "if",
      "import",
      "interface",
      "map",
      "package",
      "range",
      "return",
      "select",
      "struct",
      "switch",
      "type",
      "var"
    ],
    type: [
      "bool",
      "byte",
      "complex64",
      "complex128",
      "error",
      "float32",
      "float64",
      "int8",
      "int16",
      "int32",
      "int64",
      "string",
      "uint8",
      "uint16",
      "uint32",
      "uint64",
      "int",
      "uint",
      "uintptr",
      "rune"
    ],
    literal: [
      "true",
      "false",
      "iota",
      "nil"
    ],
    built_in: [
      "append",
      "cap",
      "close",
      "complex",
      "copy",
      "imag",
      "len",
      "make",
      "new",
      "panic",
      "print",
      "println",
      "real",
      "recover",
      "delete"
    ]
  };
  return {
    name: "Go",
    aliases: ["golang"],
    keywords: r,
    illegal: "</",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        variants: [
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          {
            begin: "`",
            end: "`"
          }
        ]
      },
      {
        className: "number",
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/,
            // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/,
            // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/,
            // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/,
            // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/,
            // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      {
        begin: /:=/
        // relevance booster
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "\\s*(\\{|$)",
        excludeEnd: !0,
        contains: [
          e.TITLE_MODE,
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: !0,
            keywords: r,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function Ir(e) {
  const t = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, n = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  }, a = [
    "true",
    "false",
    "null"
  ], s = {
    scope: "literal",
    beginKeywords: a.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: a
    },
    contains: [
      t,
      n,
      e.QUOTE_STRING_MODE,
      s,
      e.C_NUMBER_MODE,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
function Br(e) {
  const t = e.regex, n = /[\p{XID_Start}_]\p{XID_Continue}*/u, a = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ], c = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: a,
    built_in: [
      "__import__",
      "abs",
      "all",
      "any",
      "ascii",
      "bin",
      "bool",
      "breakpoint",
      "bytearray",
      "bytes",
      "callable",
      "chr",
      "classmethod",
      "compile",
      "complex",
      "delattr",
      "dict",
      "dir",
      "divmod",
      "enumerate",
      "eval",
      "exec",
      "filter",
      "float",
      "format",
      "frozenset",
      "getattr",
      "globals",
      "hasattr",
      "hash",
      "help",
      "hex",
      "id",
      "input",
      "int",
      "isinstance",
      "issubclass",
      "iter",
      "len",
      "list",
      "locals",
      "map",
      "max",
      "memoryview",
      "min",
      "next",
      "object",
      "oct",
      "open",
      "ord",
      "pow",
      "print",
      "property",
      "range",
      "repr",
      "reversed",
      "round",
      "set",
      "setattr",
      "slice",
      "sorted",
      "staticmethod",
      "str",
      "sum",
      "super",
      "tuple",
      "type",
      "vars",
      "zip"
    ],
    literal: [
      "__debug__",
      "Ellipsis",
      "False",
      "None",
      "NotImplemented",
      "True"
    ],
    type: [
      "Any",
      "Callable",
      "Coroutine",
      "Dict",
      "List",
      "Literal",
      "Generic",
      "Optional",
      "Sequence",
      "Set",
      "Tuple",
      "Type",
      "Union"
    ]
  }, d = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  }, l = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: c,
    illegal: /#/
  }, p = {
    begin: /\{\{/,
    relevance: 0
  }, f = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          d
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          d
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          d,
          p,
          l
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          d,
          p,
          l
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          e.BACKSLASH_ESCAPE,
          p,
          l
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          e.BACKSLASH_ESCAPE,
          p,
          l
        ]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  }, v = "[0-9](_?[0-9])*", h = `(\\b(${v}))?\\.(${v})|\\b(${v})\\.`, b = `\\b|${a.join("|")}`, m = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${v})|(${h}))[eE][+-]?(${v})[jJ]?(?=${b})`
      },
      {
        begin: `(${h})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${b})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${b})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${b})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${b})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${v})[jJ](?=${b})`
      }
    ]
  }, k = {
    className: "comment",
    begin: t.lookahead(/# type:/),
    end: /$/,
    keywords: c,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: !0
      }
    ]
  }, E = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: !0
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: !0,
        excludeEnd: !0,
        keywords: c,
        contains: [
          "self",
          d,
          m,
          f,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return l.contains = [
    f,
    m,
    d
  ], {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: !0,
    keywords: c,
    illegal: /(<\/|\?)|=>/,
    contains: [
      d,
      m,
      {
        // very common convention
        scope: "variable.language",
        match: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      { match: /\bor\b/, scope: "keyword" },
      f,
      k,
      e.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          n
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [E]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              n,
              /\s*/,
              /\(\s*/,
              n,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              n
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          m,
          E,
          f
        ]
      }
    ]
  };
}
xt.registerLanguage("bash", $r);
xt.registerLanguage("go", qr);
xt.registerLanguage("json", Ir);
xt.registerLanguage("python", Br);
const jr = {
  curl: "bash",
  go: "go",
  json: "json",
  py: "python",
  python: "python"
}, Pr = /* @__PURE__ */ new Set(["bash", "curl", "go", "json", "py", "python"]);
function pn(e, t) {
  if (t === "plaintext" || t === "" || !Pr.has(t))
    return Yn(e);
  const n = jr[t] ?? (Ls(e) ? "json" : "bash");
  try {
    return xt.highlight(e, { language: n }).value;
  } catch {
    return Yn(e);
  }
}
function Dr(e, t) {
  const n = t.schema;
  if (t.required && (!e || e.trim() === ""))
    return { valid: !1, message: "Required field" };
  if (!e || e.trim() === "")
    return { valid: !0 };
  if (!n) return { valid: !0 };
  if (n.type === "integer") {
    if (!/^-?\d+$/.test(e.trim()))
      return { valid: !1, message: "Must be an integer" };
    const a = parseInt(e, 10);
    return os(a, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const a = parseFloat(e);
    return os(a, n);
  }
  if (n.type === "boolean" && !["true", "false", "1", "0"].includes(e.trim().toLowerCase()))
    return { valid: !1, message: "Must be true or false" };
  if (n.enum && n.enum.length > 0 && !n.enum.some((a) => String(a) === e.trim()))
    return { valid: !1, message: `Allowed: ${n.enum.map(String).join(", ")}` };
  if (n.type === "string" || !n.type) {
    if (n.minLength !== void 0 && e.length < n.minLength)
      return { valid: !1, message: `Min length: ${n.minLength}` };
    if (n.maxLength !== void 0 && e.length > n.maxLength)
      return { valid: !1, message: `Max length: ${n.maxLength}` };
    if (n.pattern)
      try {
        if (!new RegExp(n.pattern).test(e))
          return { valid: !1, message: `Must match pattern: ${n.pattern}` };
      } catch {
      }
  }
  return { valid: !0 };
}
function os(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function Hr(e, t, n, a) {
  if (a && (!e || e.trim() === ""))
    return { valid: !1, message: "Request body is required" };
  if (!e || e.trim() === "")
    return { valid: !0 };
  if (t.includes("json"))
    try {
      JSON.parse(e);
    } catch (s) {
      return { valid: !1, message: `Invalid JSON: ${s instanceof Error ? s.message : "Invalid JSON"}` };
    }
  return { valid: !0 };
}
function Ur(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((s) => {
    const r = s.getAttribute("data-param-name"), o = t.parameters.find((d) => d.name === r);
    if (!o) return;
    const c = Dr(s.value, o);
    c.valid || n.push({ field: r, message: c.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const r = Object.keys(t.requestBody.content || {})[0] || "application/json", o = t.requestBody.content?.[r]?.schema, d = e.querySelector('[data-field="body"]')?.value || "";
    if (!r.includes("multipart")) {
      const l = Hr(d, r, o, t.requestBody.required);
      l.valid || n.push({ field: "body", message: l.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function zr(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function Fr(e, t) {
  for (const n of t) {
    const a = e.querySelector(`[data-error-for="${n.field}"]`);
    if (a && (a.textContent = n.message, a.classList.add("visible")), n.kind === "param") {
      const s = e.querySelector(`[data-param-name="${n.field}"]`);
      s && s.classList.add("invalid");
    } else if (n.kind === "body") {
      const s = e.querySelector('[data-field="body"]');
      s && s.classList.add("invalid");
    }
  }
}
function Fs(e) {
  return i("span", { className: "validation-error", "data-error-for": e });
}
const Wr = 60;
function Ke(e) {
  e.style.height = "0", e.style.height = Math.max(Wr, e.scrollHeight) + "px";
}
function is(e, t) {
  t.scrollTop = e.scrollTop, t.scrollLeft = e.scrollLeft;
}
function cs(e, t, n) {
  const a = i("div", { className: "try-it-body-editor" }), s = i("pre", { className: "try-it-body-highlight" }), r = i("code", { className: "hljs" });
  s.append(r);
  const o = i("textarea", {
    className: "try-it-textarea-json",
    spellcheck: "false",
    ...n?.dataField ? { "data-field": n.dataField } : {}
  });
  o.value = e, r.innerHTML = pn(e || " ", t), Ke(o);
  const c = (d, l) => {
    r.innerHTML = pn((d ?? o.value) || " ", l ?? t);
  };
  return o.addEventListener("input", () => {
    c(), is(o, s), Ke(o), n?.onInput?.();
  }), o.addEventListener("scroll", () => is(o, s)), a.append(s, o), {
    wrap: a,
    textarea: o,
    setValue: (d, l) => {
      o.value = d, c(d, l ?? t), Ke(o);
    }
  };
}
const Kr = 1500;
function gt(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", a = Ae({
    variant: "icon",
    icon: H.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const s = await e.getText();
      await Ka(s), a.innerHTML = H.check, a.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        a.innerHTML = H.copy, a.setAttribute("aria-label", t);
      }, Kr);
    }
  });
  return a;
}
function Vr(e, t, n, a) {
  ue(t), t.classList.add("try-it");
  const s = i("div", { className: "section" });
  s.append(i("h2", { textContent: "Response" }));
  const r = i("div", { "data-response": "true" });
  if (n)
    ln(r, {
      status: parseInt(n.statusCode, 10) || 200,
      statusText: n.statusText || "OK",
      headers: {},
      body: n.body,
      duration: 0,
      size: 0
    });
  else {
    const c = i("div", { className: "response-placeholder" });
    c.append(i("span", { textContent: "Выполните запрос, чтобы увидеть ответ" })), r.append(c);
  }
  s.append(r), t.append(Gr(e, t, {
    onConfigChange: a?.onConfigChange,
    onSendRequest: async (c) => {
      zr(t);
      const d = Ur(t, e);
      if (d.length > 0) {
        Fr(t, d);
        return;
      }
      const l = Be(t, e);
      c.setAttribute("disabled", ""), c.innerHTML = "", c.append(i("span", { className: "spinner spinner-sm" }), i("span", null, "Sending..."));
      try {
        const p = await Sr(l);
        ln(r, p);
      } catch (p) {
        ln(r, {
          status: 0,
          headers: {},
          body: p.message,
          duration: 0,
          size: 0
        });
      } finally {
        c.removeAttribute("disabled"), c.innerHTML = H.send, c.append(i("span", null, "Send Request"));
      }
    }
  })), t.append(s);
  const o = t.querySelector('textarea[data-field="body"]');
  o && requestAnimationFrame(() => {
    requestAnimationFrame(() => Ke(o));
  });
}
function Gr(e, t, n) {
  const a = n?.onConfigChange, s = e.parameters.filter(($) => $.in === "path"), r = e.parameters.filter(($) => $.in === "query"), o = Or([...s, ...r]), c = "Request", d = on({
    method: e.method,
    url: "",
    // будет обновляться
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), l = () => {
    const $ = Be(t, e);
    let W;
    return typeof $.body == "string" ? W = $.body : $.body instanceof FormData ? W = "{ /* multipart form-data */ }" : e.requestBody && (W = "{ ... }"), {
      method: $.method,
      url: $.url,
      headers: $.headers || {},
      body: W
    };
  }, p = () => {
    const $ = Be(t, e);
    if (typeof $.body == "string") return $.body;
    if ($.body instanceof FormData) {
      const W = [];
      return $.body.forEach((ie, he) => {
        if (ie instanceof File) {
          W.push(`${he}: [File ${ie.name}]`);
          return;
        }
        W.push(`${he}: ${String(ie)}`);
      }), W.join(`
`);
    }
    return "";
  }, f = ($, W) => {
    const ie = l(), he = on(ie), Pe = he[W] || he[0];
    Pe && $.setValue(Pe.code, Pe.language);
  }, v = i("div", { className: "section request-code-section" }), h = i("h2", { textContent: "Request" });
  v.append(h);
  const b = i("div", { className: "request-section-controls" });
  let m = !1;
  o.length > 1 && (s.length > 0 || r.length > 0) && (b.append(It({
    options: o.map(($) => ({ value: $.name, label: $.summary || $.name })),
    value: o[0].name,
    ariaLabel: "Select example",
    className: "request-example-select",
    onChange: ($) => {
      const W = o.find((ie) => ie.name === $);
      W && (Jr(t, W.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
    }
  })), m = !0);
  const k = y.get(), E = i("div", { className: "card" }), L = i("div", { className: "card-header" }), j = i("div", { className: "tabs" }), C = [];
  let M = 0, I = null, T = null, _ = null;
  {
    const $ = Bt(c, { active: !0, context: !0 });
    if (C.push($), _ = i("div", { className: "request-code-panel request-code-panel--request", "data-tab": "first" }), s.length > 0 || r.length > 0) {
      const Y = i("div", { className: "request-params-group" });
      if (Y.append(i("h3", { textContent: "Parameters" })), s.length > 0) {
        const Z = i("div", { className: "request-params-group" });
        r.length > 0 && Z.append(i("h3", { textContent: "Path" }));
        for (const ge of s)
          Z.append(ds(ge, o[0]?.values[ge.name]));
        Y.append(Z);
      }
      if (r.length > 0) {
        const Z = i("div", { className: "request-params-group" });
        s.length > 0 && Z.append(i("h3", { textContent: "Query" }));
        for (const ge of r)
          Z.append(ds(ge, o[0]?.values[ge.name]));
        Y.append(Z);
      }
      _.append(Y);
    }
    {
      const Y = i("div", { className: "request-route-preview" }), Z = i("div", { className: "request-field-header" });
      Z.append(i("h3", { textContent: "URL" }));
      const ge = gt({
        ariaLabel: "Copy URL",
        className: "request-route-copy-btn",
        getText: () => I?.value || Be(t, e).url
      });
      I = ye({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "request-route-input"
      });
      const Ge = i("div", { className: "request-route-input-row" });
      Ge.append(I, ge), Y.append(Z, Ge), T = Y;
    }
    if (e.requestBody) {
      const Y = i("div", { className: "request-body-section" }), Z = i("div", { className: "request-field-header" });
      Z.append(i("h3", { textContent: "Body" }));
      const ge = gt({
        ariaLabel: "Copy body",
        className: "request-field-copy-btn",
        getText: p
      });
      Z.append(ge), Y.append(Z);
      const Oe = Object.keys(e.requestBody.content || {})[0] || "application/json", Gt = Oe.includes("multipart"), Je = e.requestBody.content?.[Oe];
      if (Gt && Je?.schema) {
        const Ne = i("div", { className: "try-it-multipart", "data-field": "multipart" }), De = Je.schema, ct = De.properties || {}, Xe = De.required || [];
        for (const [Te, me] of Object.entries(ct)) {
          const Ye = me.format === "binary" || me.format === "base64" || me.type === "string" && me.format === "binary", He = Xe.includes(Te), lt = i("div", { className: `param-input-row${He ? " field-required" : ""}` }), dt = i("span", { className: "param-input-label", textContent: Te });
          if (He && dt.append(q({ text: "*", kind: "required", size: "s" })), Ye) {
            const Ze = i("input", {
              type: "file",
              "data-multipart-field": Te,
              "data-multipart-type": "file"
            });
            lt.append(dt, Ze);
          } else {
            const Ze = ye({
              placeholder: me.description || Te,
              value: me.default !== void 0 ? String(me.default) : "",
              dataAttrs: { multipartField: Te, multipartType: "text" }
            });
            lt.append(dt, Ze);
          }
          Ne.append(lt);
        }
        Y.append(Ne);
      } else {
        const Ne = Je ? zs(Je) : [], De = Ne[0], ct = De ? as(De.value) : "", Xe = cs(ct, "json", {
          dataField: "body",
          onInput: () => a?.(Be(t, e))
        });
        if (Y.append(Xe.wrap), Ne.length > 1) {
          const Te = It({
            options: Ne.map((me) => ({ value: me.name, label: Tr(me) })),
            value: Ne[0].name,
            ariaLabel: "Select example",
            className: "request-example-select",
            onChange: (me) => {
              const Ye = Ne.find((He) => He.name === me);
              Ye && (Xe.setValue(as(Ye.value), "json"), a?.(Be(t, e)));
            }
          });
          b.append(Te), m = !0;
        }
      }
      Y.append(Fs("body")), _.append(Y);
    }
    const W = i("div", { className: "request-headers-section" }), ie = i("div", { className: "request-field-header" });
    ie.append(i("h3", { textContent: "Headers" }));
    const he = i("div", { className: "try-it-headers" });
    if (e.requestBody) {
      const Z = Object.keys(e.requestBody.content || {})[0] || "application/json";
      he.append(ft("Content-Type", Z));
    }
    if (le(e.resolvedSecurity) && k.spec) {
      const Y = Ln(e.resolvedSecurity, k.spec.securitySchemes), ge = { ...On(e.resolvedSecurity, k.spec.securitySchemes), ...Y };
      for (const [Ge, Oe] of Object.entries(ge))
        he.append(ft(Ge, Oe));
    }
    for (const Y of e.parameters.filter((Z) => Z.in === "header"))
      he.append(ft(Y.name, String(Y.example || "")));
    const Pe = Ae({
      variant: "icon",
      icon: H.plus,
      ariaLabel: "Add header",
      className: "request-field-copy-btn",
      onClick: () => he.append(ft("", ""))
    });
    ie.append(Pe), W.append(ie, he), _.append(W);
  }
  const X = l(), J = on(X), z = cs(
    J[0]?.code ?? "",
    J[0]?.language
  ), xe = i("div", { className: "request-code-panel request-code-lang-panel", "data-tab": "lang" }), Et = i("div", { className: "request-body-section" }), Le = i("div", { className: "request-field-header" });
  Le.append(i("h3", { textContent: "Code Example" }));
  const Kt = gt({
    ariaLabel: "Copy code",
    className: "request-field-copy-btn",
    getText: () => z.textarea.value
  });
  Le.append(Kt), Et.append(Le, z.wrap), xe.append(Et);
  for (let $ = 0; $ < d.length; $++) {
    const W = d[$], ie = Bt(W.label, { active: !c });
    C.push(ie);
  }
  L.append(j);
  const Vt = _ ? [_, xe] : [xe], Ve = ($, W) => {
    if (!W) {
      $.style.display = "none";
      return;
    }
    $.style.display = $.classList.contains("request-code-panel--request") ? "flex" : "block";
  };
  for (let $ = 0; $ < C.length; $++) {
    j.append(C[$]);
    const W = $;
    C[$].addEventListener("click", () => {
      C.forEach((ie) => ie.classList.remove("is-active")), C[W].classList.add("is-active"), M = W, _ && Ve(_, W === 0), Ve(xe, W !== 0), W > 0 && f(z, W - 1);
    });
  }
  const je = i("div", { className: "card-body card-body--no-padding" }), St = i("div", { className: "request-code-panels" });
  if (_ && Ve(_, !0), Ve(xe, !1), St.append(...Vt), je.append(St), n?.onSendRequest) {
    const $ = Ae({
      variant: "primary",
      icon: H.send,
      label: "Send Request",
      className: "try-it-send-btn"
    });
    $.addEventListener("click", () => n.onSendRequest($));
    {
      T && _?.append(T);
      const W = i("div", { className: "try-it-send-inline-wrap" });
      W.append($), _?.append(W);
    }
  }
  !n?.onSendRequest && c && T && _?.append(T), m && v.append(b), E.append(L, je), v.append(E);
  const it = () => {
    I && (I.value = Be(t, e).url), a?.(Be(t, e)), (M > 0 || !c) && f(z, M - 1);
  };
  return t.addEventListener("input", it), t.addEventListener("change", it), it(), requestAnimationFrame(() => {
    const $ = t.querySelector('textarea[data-field="body"]');
    $ && Ke($);
  }), v;
}
function ls(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function Jr(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((a) => {
    const s = a.getAttribute("data-param-name");
    s && t[s] !== void 0 && (a.value = t[s]);
  });
}
function ds(e, t) {
  const n = i("div", { className: `param-input-row${e.required ? " field-required" : ""}` }), a = i("span", {
    className: "param-input-label",
    textContent: e.name
  });
  e.required && a.append(q({ text: "*", kind: "required", size: "s" }));
  const s = e.schema;
  let r;
  if (s?.enum && s.enum.length > 0) {
    const c = e.required ? s.enum.map((l) => ({ value: String(l), label: String(l) })) : [{ value: "", label: "— select —" }, ...s.enum.map((l) => ({ value: String(l), label: String(l) }))];
    r = It({
      options: c,
      value: ls(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const c = s?.type === "integer" || s?.type === "number" ? "number" : "text", d = ye({
      type: c,
      placeholder: e.description || e.name,
      value: ls(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    s?.type === "integer" && d.setAttribute("step", "1"), s?.minimum !== void 0 && d.setAttribute("min", String(s.minimum)), s?.maximum !== void 0 && d.setAttribute("max", String(s.maximum)), r = d;
  }
  const o = Fs(e.name);
  return n.append(a, r, o), n;
}
function ft(e, t) {
  const n = i("div", { className: "try-it-header-row" }), a = ye({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), s = ye({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), r = Ae({
    variant: "icon",
    icon: H.close,
    ariaLabel: "Remove header",
    className: "try-it-header-remove-btn",
    onClick: () => n.remove()
  });
  return n.append(a, s, r), n;
}
function Be(e, t) {
  const n = y.get(), a = zt(n), s = e.querySelectorAll('[data-param-in="path"]'), r = {};
  s.forEach((h) => {
    r[h.getAttribute("data-param-name")] = h.value;
  });
  const o = e.querySelectorAll('[data-param-in="query"]'), c = {};
  if (o.forEach((h) => {
    const b = h.getAttribute("data-param-name");
    h.value && (c[b] = h.value);
  }), n.spec && le(t.resolvedSecurity)) {
    const h = rr(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [b, m] of Object.entries(h))
      b in c || (c[b] = m);
  }
  const d = e.querySelectorAll(".try-it-header-row"), l = {};
  if (d.forEach((h) => {
    const b = h.querySelector("[data-header-name]"), m = h.querySelector("[data-header-value]");
    b?.value && m?.value && (l[b.value] = m.value);
  }), n.spec && le(t.resolvedSecurity)) {
    const h = or(t.resolvedSecurity, n.spec.securitySchemes), b = Object.entries(h).map(([m, k]) => `${m}=${k}`);
    if (b.length > 0) {
      const m = l.Cookie || l.cookie || "";
      l.Cookie = m ? `${m}; ${b.join("; ")}` : b.join("; "), delete l.cookie;
    }
  }
  const p = e.querySelector('[data-field="multipart"]');
  let f;
  if (p) {
    const h = new FormData();
    p.querySelectorAll("[data-multipart-field]").forEach((m) => {
      const k = m.getAttribute("data-multipart-field"), E = m.getAttribute("data-multipart-type");
      E === "file" && m.files && m.files.length > 0 ? h.append(k, m.files[0]) : E === "text" && m.value && h.append(k, m.value);
    }), f = h, delete l["Content-Type"];
  } else
    f = e.querySelector('[data-field="body"]')?.value || void 0;
  const v = kr(a, t.path, r, c);
  return { method: t.method, url: v, headers: l, body: f };
}
function ln(e, t) {
  ue(e);
  const n = i("div", { className: "card" }), a = i("div", { className: "card-header response-header--row" }), s = Bt("Body", { active: !0 }), r = Bt(`Headers (${Object.keys(t.headers).length})`), o = i("div", { className: "tabs" });
  o.append(s, r);
  const c = i("div", {
    className: "response-meta",
    innerHTML: `<span>${Ga(t.duration)}</span><span>${Va(t.size)}</span>`
  }), d = q({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), l = gt({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => Yr("Response copied")
  });
  a.append(o, c, d, l), n.append(a);
  const p = i("div", { className: "card-body card-body--no-padding" }), f = i("div", { className: "response-body" }), v = i("div", { className: "try-it-body-inner" }), h = i("pre", { className: "code-display" }), b = i("code", { className: "hljs" }), m = Xr(t.body);
  b.innerHTML = pn(m, Ls(m) ? "json" : ""), h.append(b), v.append(h), f.append(v);
  const k = i("div", { className: "response-body", style: "display:none" }), E = i("div", { className: "try-it-body-inner" }), L = i("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false"
  });
  L.value = Object.entries(t.headers).map(([j, C]) => `${j}: ${C}`).join(`
`), Ke(L), E.append(L), k.append(E), p.append(f, k), n.append(p), s.addEventListener("click", () => {
    s.classList.add("is-active"), r.classList.remove("is-active"), f.style.display = "block", k.style.display = "none";
  }), r.addEventListener("click", () => {
    r.classList.add("is-active"), s.classList.remove("is-active"), f.style.display = "none", k.style.display = "block", requestAnimationFrame(() => Ke(L));
  }), e.append(n);
}
function Xr(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function Yr(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = i("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
function Ws(e) {
  const { prev: t, next: n } = Zr(e);
  if (!t && !n) return null;
  const a = i("div", {
    className: `route-nav${!t || !n ? " route-nav--single" : ""}`
  });
  return t && a.append(us(t, "previous")), n && a.append(us(n, "next")), a;
}
function us(e, t) {
  const n = oe(e.route), a = i("a", {
    className: `card card--interactive hover-surface focus-ring route-nav-link route-nav-link--${t}`,
    href: n
  }), s = i("div", { className: "route-nav-meta" });
  e.kind === "endpoint" ? (s.append(q({
    text: e.operation.method.toUpperCase(),
    kind: "method",
    method: e.operation.method
  })), s.append(i("span", { className: "route-nav-path", textContent: e.operation.path }))) : (s.append(q({
    text: "WEBHOOK",
    kind: "webhook",
    size: "s"
  })), s.append(q({
    text: e.webhook.method.toUpperCase(),
    kind: "method",
    method: e.webhook.method
  })));
  const r = i("span", { className: "route-nav-side", "aria-hidden": "true" });
  r.innerHTML = t === "previous" ? H.chevronLeft : H.chevronRight;
  const o = i("div", { className: "route-nav-main" });
  return o.append(
    i("span", { className: "route-nav-category", textContent: e.category }),
    i("span", { className: "route-nav-title", textContent: e.title }),
    s
  ), t === "previous" ? a.append(r, o) : a.append(o, r), a.addEventListener("click", (c) => {
    c.preventDefault(), re(n);
  }), a;
}
function Zr(e) {
  if (!y.get().spec) return { prev: null, next: null };
  const n = Qr();
  if (n.length === 0) return { prev: null, next: null };
  const a = eo(n, e);
  return a < 0 ? { prev: null, next: null } : {
    prev: a > 0 ? n[a - 1] : null,
    next: a < n.length - 1 ? n[a + 1] : null
  };
}
function Qr() {
  const e = y.get().spec;
  if (!e) return [];
  const t = [], n = /* @__PURE__ */ new Set();
  for (const a of e.tags)
    for (const s of a.operations) {
      const r = `${s.method.toLowerCase()} ${s.path}`;
      n.has(r) || (n.add(r), t.push({
        kind: "endpoint",
        route: {
          type: "endpoint",
          tag: a.name,
          method: s.method,
          path: s.path,
          operationId: s.operationId
        },
        operation: s,
        title: s.summary || s.path,
        category: a.name
      }));
    }
  for (const a of e.webhooks || [])
    t.push({
      kind: "webhook",
      route: { type: "webhook", webhookName: a.name },
      webhook: a,
      title: a.summary || a.name,
      category: "Webhooks"
    });
  return t;
}
function eo(e, t) {
  return t.type === "endpoint" ? e.findIndex(
    (n) => n.kind === "endpoint" && n.route.method === t.method && n.route.path === t.path
  ) : t.type === "webhook" ? e.findIndex(
    (n) => n.kind === "webhook" && n.route.webhookName === t.webhookName
  ) : -1;
}
async function to(e, t, n) {
  ue(e), ue(t);
  const a = t.parentElement;
  a && (a.setAttribute("aria-label", "Try It"), a.classList.add("try-it"));
  const s = y.get(), r = Xa(s), o = Os(s), c = r + (n.path.startsWith("/") ? "" : "/") + n.path, d = [], l = q({
    text: n.method.toUpperCase(),
    kind: "method",
    method: n.method,
    size: "m"
  });
  d.push({
    label: o || s.spec?.info.title || "Главная",
    href: "/",
    className: "breadcrumb-item",
    onClick: (T) => {
      T.preventDefault(), re("/");
    }
  });
  const p = new Set((s.spec?.tags || []).map((T) => T.name.toLowerCase())), f = (n.path || "/").split("/").filter(Boolean);
  for (const T of f) {
    const _ = T.startsWith("{") && T.endsWith("}"), X = !_ && p.has(T.toLowerCase()), J = s.spec?.tags.find((z) => z.name.toLowerCase() === T.toLowerCase());
    X && J ? d.push({
      label: T,
      href: oe({ type: "tag", tag: J.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (z) => {
        z.preventDefault(), re(oe({ type: "tag", tag: J.name }));
      }
    }) : d.push({
      label: T,
      className: _ ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const v = gt({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${c}`
  }), h = wn(d, {
    leading: [l],
    trailing: [v]
  }), b = i("div", { className: "header" });
  if (b.append(i("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.deprecated) {
    const T = i("span", { className: "icon-muted" });
    T.innerHTML = H.warning, b.append(i("div", {}, i("span", { className: "endpoint-deprecated" }, T, "Deprecated")));
  }
  if (le(n.resolvedSecurity)) {
    const T = lo(s, n), _ = vs(n.resolvedSecurity) || "Auth required", X = Cn({
      configured: T,
      variant: "endpoint",
      title: st(n.resolvedSecurity)
    });
    b.append(i("span", {
      className: `endpoint-auth${T ? " active" : ""}`,
      title: st(n.resolvedSecurity),
      "aria-label": st(n.resolvedSecurity)
    }, X, _));
  }
  const m = i("div", { className: "breadcrumb-wrap" });
  m.append(h), b.append(m), n.description && b.append(i("p", { textContent: n.description })), e.append(b);
  const k = no(n);
  k && e.append(k);
  const E = n.parameters.filter((T) => T.in !== "cookie"), L = pe({ title: "Request" });
  if (E.length > 0 && L.append(so(E)), n.requestBody && L.append(ao(n)), E.length === 0 && !n.requestBody) {
    const T = i("div", { className: "request-empty", textContent: "Параметры и тело запроса не требуются" });
    L.append(T);
  }
  e.append(L);
  let j = !1;
  Object.keys(n.responses).length > 0 && (e.append(oo(n)), j = !0);
  const C = Ws({
    type: "endpoint",
    method: n.method,
    path: n.path
  }), M = () => {
    C && e.append(i("div", { className: "section" }, C));
  };
  j && M(), n.callbacks && n.callbacks.length > 0 && e.append(io(n)), j || M();
  const I = co(n);
  Vr(n, t, I);
}
function no(e) {
  const t = [];
  if (e.requestBody) {
    const r = Object.keys(e.requestBody.content || {});
    t.push({
      name: "Content-Type",
      value: r[0] || "application/json",
      description: "Media type for request body payload",
      required: !!e.requestBody?.required
    });
  }
  if (le(e.resolvedSecurity)) {
    const r = y.get().spec, o = r ? Ln(e.resolvedSecurity, r.securitySchemes) : {}, d = { ...r ? On(e.resolvedSecurity, r.securitySchemes) : {}, ...o };
    for (const [l, p] of Object.entries(d))
      t.push({
        name: l,
        value: p,
        description: "Authentication header value",
        required: !0
      });
  }
  for (const r of e.parameters.filter((o) => o.in === "header"))
    t.push({
      name: r.name,
      value: String(r.schema?.default ?? r.example ?? ""),
      description: r.description,
      required: r.required
    });
  if (t.length === 0) return null;
  const n = t.map((r) => {
    const o = i("div", { className: "schema-row headers-list-row" }), c = i("div", { className: "schema-main-row" }), d = i("div", { className: "schema-name-wrapper headers-list-name-wrap" });
    d.append(
      i("span", { className: "schema-spacer" }),
      i("span", { textContent: r.name })
    );
    const l = i("div", { className: "schema-meta-wrapper headers-list-meta" });
    r.required && l.append(q({ text: "required", kind: "required", size: "m" })), c.append(d, l), o.append(c);
    const p = i("div", { className: "schema-desc-col schema-desc-col--root" });
    r.description && p.append(i("p", { textContent: r.description }));
    const f = i("div", { className: "schema-enum-values" });
    return f.append(q({
      text: r.value || "—",
      kind: "chip",
      size: "s"
    })), p.append(f), p.children.length > 0 && o.append(p), o;
  }), a = $e({ className: "headers-card headers-list-card" }), s = Wt();
  return s.classList.add("headers-list-body"), s.append(...n), a.append(s), pe(
    { title: "Headers" },
    a
  );
}
function so(e) {
  const t = e.filter((s) => s.in === "path").length, n = e.filter((s) => s.in === "query").length, a = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return js(e, { headerTitle: a, withEnumAndDefault: !0 });
}
function ao(e) {
  const t = i("div", { className: "request-body-wrap" });
  e.requestBody?.description && t.append(i("p", { textContent: e.requestBody.description }));
  const n = e.requestBody?.content || {};
  for (const [a, s] of Object.entries(n))
    if (s.schema) {
      const r = Nn({ title: "Body" });
      r.append(q({
        text: a,
        kind: "chip",
        size: "s"
      })), t.append(rt(s.schema, r));
    }
  return t;
}
function ro(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([o, c]) => {
    const d = c.schema ? yt(c.schema) : "string", l = c.example !== void 0 ? String(c.example) : c.schema?.example !== void 0 ? String(c.schema.example) : "—", p = i("div", { className: "schema-row headers-list-row" }), f = i("div", { className: "schema-main-row" }), v = i("div", { className: "schema-name-wrapper headers-list-name-wrap" });
    v.append(
      i("span", { className: "schema-spacer" }),
      i("span", { textContent: o })
    );
    const h = i("div", { className: "schema-meta-wrapper headers-list-meta" });
    h.append(q({ text: d, kind: "chip", size: "s" })), c.required && h.append(q({ text: "required", kind: "required", size: "m" })), f.append(v, h), p.append(f);
    const b = i("div", { className: "schema-desc-col schema-desc-col--root" });
    c.description && b.append(i("p", { textContent: c.description }));
    const m = i("div", { className: "schema-enum-values" });
    return m.append(q({
      text: l,
      kind: "chip",
      size: "s"
    })), b.append(m), b.children.length > 0 && p.append(b), p;
  }), a = i("div", { className: "response-headers-block" }), s = i("div", { className: "response-headers-title", textContent: "Headers" }), r = i("div", { className: "headers-list-body" });
  return r.append(...n), a.append(s, r), a;
}
function oo(e) {
  const t = pe({
    titleEl: kn("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const a = $e(), s = i("div", { className: "card-header-row responses-header-row" }), r = i("div", { className: "response-codes-wrap" });
  let o = n[0][0], c = "application/json";
  const d = /* @__PURE__ */ new Map();
  for (const [k, E] of n) {
    const L = tr(k, k === o), j = E.content && Object.keys(E.content)[0] || "application/json", C = E.content?.[j], M = C?.schema ? yt(C.schema) : "plain";
    let I, T, _, X;
    if (C?.schema) {
      const z = yr(C.schema);
      I = z.body, T = z.toggleCollapse, _ = z.isExpanded, X = z.hasExpandable;
    } else
      I = i("div", { className: "schema-body" }), I.append(i("p", { textContent: E.description || "No schema" })), T = () => {
      }, _ = () => !1, X = !1;
    const J = E.headers ? ro(E.headers) : null;
    d.set(k, {
      body: I,
      headers: J,
      contentType: j,
      schemaType: M,
      toggleCollapse: T,
      isExpanded: _,
      hasExpandable: X
    }), r.append(L), L.addEventListener("click", () => {
      r.querySelectorAll('[data-badge-group="response-code"]').forEach((xe) => Zn(xe, !1)), Zn(L, !0), o = k;
      const z = d.get(k);
      c = z.contentType, l.textContent = z.contentType, p.textContent = z.schemaType, f.style.display = z.hasExpandable ? "inline-flex" : "none", f.classList.toggle("expanded", z.hasExpandable && z.isExpanded()), f.title = z.hasExpandable && z.isExpanded() ? "Collapse all" : "Expand all", h.innerHTML = "", z.headers ? (h.append(z.headers), h.hidden = !1) : h.hidden = !0, b.innerHTML = "", b.append(z.body);
    });
  }
  s.append(r);
  const l = q({
    text: c,
    kind: "chip",
    size: "s"
  }), p = q({
    text: d.get(o)?.schemaType || "plain",
    kind: "chip",
    size: "s"
  }), f = i("button", {
    className: "schema-collapse-btn expanded",
    type: "button",
    title: "Collapse all"
  });
  f.innerHTML = H.chevronDown, f.addEventListener("click", (k) => {
    k.stopPropagation();
    const E = d.get(o);
    E?.hasExpandable && (E.toggleCollapse(), f.classList.toggle("expanded", E.isExpanded()), f.title = E.isExpanded() ? "Collapse all" : "Expand all");
  }), s.append(l, p, f), a.append(Sn(s));
  const v = Wt(), h = i("div", { className: "response-headers-wrap" }), b = i("div"), m = d.get(o);
  return m && (m.headers ? (h.append(m.headers), h.hidden = !1) : h.hidden = !0, b.append(m.body), f.style.display = m.hasExpandable ? "inline-flex" : "none", f.classList.toggle("expanded", m.hasExpandable && m.isExpanded()), f.title = m.hasExpandable && m.isExpanded() ? "Collapse all" : "Expand all"), v.append(h, b), a.append(v), t.append(a), t;
}
function io(e) {
  const t = pe({
    titleEl: kn("Callbacks", q({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const a = i("div", { className: "callback-block" });
    a.append(i("div", { className: "callback-name", textContent: n.name }));
    for (const s of n.operations) {
      const r = i("div", { className: "callback-operation" }), o = i("div", { className: "callback-op-header" });
      if (o.append(
        q({
          text: s.method.toUpperCase(),
          kind: "method",
          method: s.method
        }),
        i("span", { className: "callback-op-path", textContent: s.path })
      ), r.append(o), s.summary && r.append(i("div", { className: "callback-op-summary", textContent: s.summary })), s.description && r.append(i("p", { textContent: s.description })), s.requestBody) {
        const c = s.requestBody.content || {};
        for (const [d, l] of Object.entries(c))
          l.schema && r.append(rt(l.schema, `${d} — Request Body`));
      }
      if (Object.keys(s.responses).length > 0)
        for (const [c, d] of Object.entries(s.responses)) {
          const l = i("div", { className: "callback-response-row" });
          if (l.append(q({
            text: c,
            kind: "status",
            statusCode: c
          })), d.description && l.append(i("p", { textContent: d.description })), d.content)
            for (const [p, f] of Object.entries(d.content))
              f.schema && l.append(rt(f.schema, `${p}`));
          r.append(l);
        }
      a.append(r);
    }
    t.append(a);
  }
  return t;
}
function co(e) {
  const t = Object.keys(e.responses).sort((n, a) => {
    const s = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, r = a.startsWith("2") ? 0 : a.startsWith("4") ? 1 : 2;
    return s - r || n.localeCompare(a);
  });
  for (const n of t) {
    const a = e.responses[n];
    if (!a?.content) continue;
    const s = Object.keys(a.content)[0] || "application/json", r = a.content[s], c = (r ? zs(r) : [])[0];
    if (c && c.value !== void 0) {
      const d = typeof c.value == "string" ? c.value : JSON.stringify(c.value, null, 2), l = a.description || (n.startsWith("2") ? "OK" : n.startsWith("4") ? "Not Found" : "Error");
      return { statusCode: n, statusText: l, body: d };
    }
    if (r?.example !== void 0) {
      const d = typeof r.example == "string" ? r.example : JSON.stringify(r.example, null, 2);
      return { statusCode: n, statusText: a.description || "OK", body: d };
    }
  }
  return null;
}
function lo(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!le(t.resolvedSecurity)) return !1;
  const a = (e.auth.token || "").trim(), s = e.auth.schemes || {}, r = e.auth.activeScheme, o = (c) => String(s[c] || "").trim() ? !0 : a ? !r || r === c : !1;
  return n.some((c) => {
    const d = c.map((l) => l.schemeName);
    return d.length === 0 ? !0 : d.every((l) => o(l));
  });
}
function uo(e, t, n) {
  ue(e);
  const a = y.get().spec;
  if (!a) return;
  const s = a.tags.find((m) => m.name === n);
  if (!s || s.operations.length === 0) {
    const m = i("div", { className: "header" });
    m.append(i("h1", { textContent: "Tag not found" })), e.append(m), e.append(pe(
      { title: "Details" },
      i("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const r = i("div", { className: "header" });
  r.append(i("h1", { textContent: s.name }));
  const o = y.get(), c = Os(o), d = wn([
    {
      label: c || a.info.title || "Главная",
      href: "/",
      className: "breadcrumb-item",
      onClick: (m) => {
        m.preventDefault(), re("/");
      }
    },
    { label: n, className: "breadcrumb-current" }
  ], {
    className: "breadcrumb-tag-page",
    leading: [q({ text: "Category", kind: "chip", size: "m" })]
  }), l = i("div", { className: "breadcrumb-wrap" });
  l.append(d), r.append(l), s.description && r.append(i("p", { textContent: s.description })), e.append(r);
  const p = po(s), f = s.operations.filter((m) => le(m.resolvedSecurity)).length, v = s.operations.filter((m) => m.deprecated).length;
  e.append(pe(
    { className: "summary-section" },
    Bs(
      [
        { label: "Endpoints", value: s.operations.length },
        { label: "Auth Required", value: f },
        { label: "Deprecated", value: v }
      ],
      p
    )
  ));
  const h = pe({ title: "Endpoints" }), b = y.get().route;
  for (const m of s.operations) {
    const k = { type: "endpoint", tag: s.name, method: m.method, path: m.path }, E = b.type === "endpoint" && b.method === m.method && b.path === m.path, L = $e({
      interactive: !0,
      active: E,
      className: `tag-group-card${m.deprecated ? " deprecated" : ""}`,
      onClick: () => re(oe(k))
    }), j = i("div", { className: "tag-card-info" });
    j.append(i("h3", {}, i("code", { textContent: m.path }))), (m.summary || m.operationId) && j.append(i("p", { textContent: m.summary || m.operationId }));
    const C = i("div", { className: "tag-card-badges" });
    C.append(q({ text: m.method.toUpperCase(), kind: "method", method: m.method, size: "m" })), le(m.resolvedSecurity) && C.append(Cn({
      configured: An(m.resolvedSecurity, a.securitySchemes || {}),
      variant: "tag",
      title: st(m.resolvedSecurity)
    })), L.append(j, C), h.append(L);
  }
  e.append(h);
}
function po(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function fo(e, t) {
  ue(e);
  const n = q({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), a = q({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), s = wn(
    [
      {
        label: "Overview",
        href: "/",
        className: "breadcrumb-item",
        onClick: (l) => {
          l.preventDefault(), re("/");
        }
      },
      { label: t.name, className: "breadcrumb-segment" }
    ],
    { leading: [n, a] }
  ), r = i("div", { className: "header" });
  t.summary ? r.append(i("h1", { textContent: t.summary })) : r.append(i("h1", { textContent: t.name }));
  const o = i("div", { className: "breadcrumb-wrap" });
  o.append(s), r.append(o), t.description && r.append(i("p", { textContent: t.description })), e.append(r);
  const c = t.parameters.filter((l) => l.in !== "cookie");
  if (c.length > 0) {
    const l = pe({ title: "Parameters" }, mo(c));
    e.append(l);
  }
  if (t.requestBody) {
    const l = pe({ title: "Webhook Payload" });
    t.requestBody.description && l.append(i("p", { textContent: t.requestBody.description }));
    const p = t.requestBody.content || {};
    for (const [f, v] of Object.entries(p))
      if (v.schema) {
        const h = Nn({ title: "Body" });
        h.append(q({
          text: f,
          kind: "chip",
          size: "s"
        })), l.append(rt(v.schema, h));
      }
    e.append(l);
  }
  if (Object.keys(t.responses).length > 0) {
    const l = pe({ title: "Expected Responses" });
    for (const [p, f] of Object.entries(t.responses)) {
      const v = i("div", { className: "response-block" });
      if (v.append(q({
        text: p,
        kind: "status",
        statusCode: p
      })), f.description && v.append(i("p", { textContent: f.description })), f.content)
        for (const [h, b] of Object.entries(f.content))
          b.schema && v.append(rt(b.schema, `${h} — Schema`));
      l.append(v);
    }
    e.append(l);
  }
  const d = Ws({ type: "webhook", webhookName: t.name });
  d && e.append(i("div", { className: "section" }, d));
}
function mo(e) {
  const t = e.filter((s) => s.in === "path").length, n = e.filter((s) => s.in === "query").length, a = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return js(e, { headerTitle: a, withEnumAndDefault: !1 });
}
function ho() {
  const e = i("div", { className: "page" }), t = i("div", {
    className: "main",
    role: "main"
  }), n = i("div", { className: "content" });
  t.append(n);
  const a = i("div", {
    className: "aside",
    "aria-label": "Panel"
  }), s = i("div", { className: "content" });
  return a.append(s), a.hidden = !0, e.append(t, a), { page: e, main: n, aside: s };
}
function Ce(e, t) {
  const n = e.querySelector(".aside");
  n && (n.hidden = !t);
}
function Tt(e) {
  const { title: t, message: n, icon: a, variant: s = "empty" } = e;
  if (s === "loading")
    return i(
      "div",
      { className: "header" },
      i("h2", { textContent: t }),
      i(
        "div",
        { className: "loading" },
        i("div", { className: "spinner" }),
        i("span", null, n || t)
      )
    );
  const r = i("div", { className: "header" });
  return a && r.append(i("span", { innerHTML: a, className: "icon-muted" })), r.append(i("h2", { textContent: t })), n && r.append(i("p", { className: "error-message", textContent: n })), r;
}
let Me = null, Se = null, Tn = null, _n = null, Rn = null, nt = null, Mt = !1, _t = "";
function go(e, t) {
  Me = i("div", { className: `root ${t.className || ""}`.trim() });
  const n = {
    primaryColor: t.primaryColor,
    fontFamily: t.fontFamily,
    codeFontFamily: t.codeFontFamily
  };
  Xn(Me, y.get().theme, n);
  const a = i("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', a.addEventListener("click", () => {
    y.set({ sidebarOpen: !0 }), Se?.classList.remove("collapsed");
  }), Se = i("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: s, main: r, aside: o } = ho();
  Tn = s, _n = r, Rn = o, Me.append(a, Se, s), e.append(Me), y.subscribe((c) => {
    Me && (Xn(Me, c.theme, n), Se?.classList.toggle("collapsed", !c.sidebarOpen), a.classList.toggle("visible", !c.sidebarOpen), ps(c, t));
  }), Se?.classList.toggle("collapsed", !y.get().sidebarOpen), a.classList.toggle("visible", !y.get().sidebarOpen), ps(y.get(), t);
}
function vo() {
  Me && (Me.remove(), Me = null, Se = null, Tn = null, _n = null, Rn = null, nt = null, Mt = !1);
}
async function ps(e, t) {
  const n = !!e.spec;
  Se && n ? (Mt ? cr(Se, e.route) : es(Se, t), Mt = !0) : Mt = !1;
  const a = _n, s = Rn, r = Tn;
  if (!a || !s || !r) return;
  if (e.loading) {
    Ce(r, !1), ue(s), pt(a, Tt({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const l = a.parentElement;
    l && (l.scrollTop = 0);
    return;
  }
  if (e.error) {
    Ce(r, !1), ue(s), pt(a, Tt({
      title: "Failed to load API specification",
      message: e.error,
      icon: H.warning,
      variant: "error"
    }));
    const l = a.parentElement;
    l && (l.scrollTop = 0);
    return;
  }
  if (!e.spec) return;
  const o = e.route, c = `${e.activeEnvironment}|${e.auth.token}`;
  if (nt && fs(nt, o) && _t === c) return;
  switch (nt && fs(nt, o) && _t !== c && (_t = c, bo(r, e), Se && e.spec && es(Se, t)), nt = { ...o }, _t = c, ue(a), ue(s), o.type) {
    case "overview":
      Ce(r, !1), ss(a);
      break;
    case "tag": {
      Ce(r, !1), uo(a, s, o.tag || "");
      break;
    }
    case "endpoint": {
      const l = Ks(e, o);
      l ? (Ce(r, !0), await to(a, s, l)) : (Ce(r, !1), pt(a, Tt({
        title: "Endpoint not found",
        message: `${o.method?.toUpperCase()} ${o.path}`,
        variant: "empty"
      })));
      break;
    }
    case "schema": {
      const l = e.spec.schemas[o.schemaName || ""];
      if (l) {
        Ce(r, !1);
        const p = i("div", { className: "header" });
        p.append(i("h1", { textContent: o.schemaName || "" })), l.description && p.append(i("p", { textContent: String(l.description) }));
        const f = i("div", { className: "section" });
        f.append(rt(l, "Properties")), pt(a, p, f);
      }
      break;
    }
    case "webhook": {
      const l = e.spec.webhooks?.find((p) => p.name === o.webhookName);
      l ? (Ce(r, !1), fo(a, l)) : (Ce(r, !1), pt(a, Tt({
        title: "Webhook not found",
        message: o.webhookName || "",
        variant: "empty"
      })));
      break;
    }
    default:
      Ce(r, !1), ss(a);
  }
  const d = a.parentElement;
  d && (d.scrollTop = 0);
}
function bo(e, t, n) {
  const a = zt(t), s = Ft(a), r = e.querySelector(".breadcrumb-item");
  if (r && (r.textContent = s || t.spec?.info.title || "Главная"), t.route.type !== "endpoint" || !t.spec) return;
  const o = e.querySelector(".aside.try-it .content"), c = Ks(t, t.route);
  if (c && le(c.resolvedSecurity) && o) {
    const d = o.querySelector(".try-it-headers");
    if (d) {
      const l = ["Authorization", "Cookie"];
      Array.from(d.querySelectorAll(".try-it-header-row")).filter((E) => {
        const L = E.querySelector("[data-header-name]");
        return L && l.includes(L.value);
      }).forEach((E) => E.remove());
      const v = Ln(c.resolvedSecurity, t.spec.securitySchemes), b = { ...On(c.resolvedSecurity, t.spec.securitySchemes), ...v }, m = Array.from(d.querySelectorAll(".try-it-header-row")), k = m.find((E) => {
        const L = E.querySelector("[data-header-name]");
        return L && L.value === "Content-Type";
      }) || m[0];
      for (const [E, L] of Object.entries(b).reverse()) {
        const j = ft(E, L);
        k ? k.insertAdjacentElement("beforebegin", j) : d.prepend(j);
      }
    }
  }
  o && c && o.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function Ks(e, t) {
  return e.spec && e.spec.operations.find(
    (n) => n.method === t.method && n.path === t.path
  ) || null;
}
function fs(e, t) {
  return e.type === t.type && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
const Vs = "ap_portal_prefs";
function yo() {
  try {
    const e = localStorage.getItem(Vs);
    if (!e) return null;
    const t = JSON.parse(e);
    return !t || typeof t != "object" ? null : {
      activeEnvironment: typeof t.activeEnvironment == "string" ? t.activeEnvironment : "",
      environments: Array.isArray(t.environments) ? t.environments : [],
      auth: t.auth && typeof t.auth == "object" ? {
        schemes: t.auth.schemes && typeof t.auth.schemes == "object" ? t.auth.schemes : {},
        activeScheme: typeof t.auth.activeScheme == "string" ? t.auth.activeScheme : "",
        token: typeof t.auth.token == "string" ? t.auth.token : "",
        locked: !!t.auth.locked,
        source: t.auth.source === "manual" || t.auth.source === "auto-body" || t.auth.source === "auto-header" ? t.auth.source : "manual"
      } : { schemes: {}, activeScheme: "", token: "", locked: !1, source: "manual" }
    };
  } catch {
    return null;
  }
}
function xo(e) {
  try {
    localStorage.setItem(Vs, JSON.stringify(e));
  } catch {
  }
}
function ms(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function Eo(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], a = ms(e[n]);
  for (let s = 1; s < t.length; s++) {
    const r = t[s], o = ms(e[r]);
    o < a && (a = o, n = r);
  }
  return n;
}
function Gs(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), a = Object.entries(t.schemes);
  if (n.length !== a.length) return !1;
  for (const [s, r] of n)
    if (t.schemes[s] !== r) return !1;
  return !0;
}
function Js(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const a = {};
  for (const o of n) {
    const c = e.schemes[o];
    typeof c == "string" && c.length > 0 && (a[o] = c);
  }
  let s = e.activeScheme;
  (!s || !t[s]) && (s = n.find((o) => !!a[o]) || ""), !s && e.token && (s = Eo(t)), s && e.token && !a[s] && (a[s] = e.token);
  let r = e.token;
  return s && a[s] && r !== a[s] && (r = a[s]), !r && s && a[s] && (r = a[s]), {
    ...e,
    schemes: a,
    activeScheme: s,
    token: r
  };
}
function So(e, t) {
  let n;
  return ((...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  });
}
let Dt = !1, Ht = null, fn = null, mn = null;
async function Xs(e) {
  let t = null;
  Dt && (t = y.get().auth, Mn()), Ht = e;
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  y.reset();
  const a = e.specSources || [], s = a.length > 0 ? a[0].name : "", r = e.environments || [{ name: "default", baseUrl: "" }], o = e.defaultEnvironment || r[0]?.name || "default";
  y.set({
    loading: !0,
    theme: Wa(e.theme),
    environments: [...r],
    initialEnvironments: [...r],
    activeEnvironment: o,
    specSources: a,
    activeSpecSource: s
  });
  const c = yo();
  c ? y.set({
    activeEnvironment: c.activeEnvironment && r.some((l) => l.name === c.activeEnvironment) ? c.activeEnvironment : o,
    auth: c.auth
  }) : t && y.setAuth(t);
  const d = So(() => {
    const l = y.get();
    xo({
      activeEnvironment: l.activeEnvironment,
      environments: l.environments,
      auth: l.auth
    });
  }, 300);
  y.subscribe(() => d()), Ca(e.basePath), mn = ir(), go(n, e), Dt = !0;
  try {
    let l;
    const p = e.specUrl ?? e.specSources?.[0]?.specUrl;
    if (e.spec)
      l = e.spec;
    else if (p)
      l = await ws(p);
    else
      throw new Error("Either spec or specUrl must be provided");
    const f = bs(l);
    if (f.servers.length > 0 && y.get().environments[0]?.baseUrl === "") {
      const b = [...y.get().environments];
      b[0] = { ...b[0], baseUrl: f.servers[0].url };
      for (let m = 1; m < f.servers.length; m++) {
        const k = f.servers[m];
        b.push({
          name: k.description || `Server ${m + 1}`,
          baseUrl: k.url
        });
      }
      y.set({ environments: b, initialEnvironments: b.map((m) => ({ ...m })) });
    }
    const v = y.get().auth, h = Js(v, f.securitySchemes);
    Gs(v, h) || y.setAuth(h), Cs(f), y.set({ spec: f, loading: !1, error: null });
  } catch (l) {
    y.set({
      loading: !1,
      error: l.message || "Failed to load specification"
    });
  }
  return fn = No(), fn;
}
function Mn() {
  Dt && (mn?.(), mn = null, La(), vo(), y.reset(), Dt = !1, Ht = null, fn = null);
}
async function Ys(e) {
  const t = y.get().specSources.find((n) => n.name === e);
  if (t) {
    y.set({ loading: !0, error: null, activeSpecSource: e, route: { type: "overview" } });
    try {
      const n = await ws(t.specUrl), a = bs(n);
      if (Ht && !Ht.environments && a.servers.length > 0) {
        const o = a.servers.map((c, d) => ({
          name: c.description || (d === 0 ? "default" : `Server ${d + 1}`),
          baseUrl: c.url
        }));
        y.set({ environments: o, initialEnvironments: o.map((c) => ({ ...c })) }), y.setActiveEnvironment(o[0].name);
      }
      const s = y.get().auth, r = Js(s, a.securitySchemes);
      Gs(s, r) || y.setAuth(r), Cs(a), y.set({ spec: a, loading: !1, error: null });
    } catch (n) {
      y.set({
        loading: !1,
        error: n.message || "Failed to load specification"
      });
    }
  }
}
function No() {
  return {
    getState: () => y.get(),
    subscribe: (e) => y.subscribe(e),
    setToken: (e) => {
      const t = y.get().auth.activeScheme;
      t ? y.setSchemeValue(t, e) : y.setAuth({ token: e, source: "manual" });
    },
    setEnvironment: (e) => y.setActiveEnvironment(e),
    navigate: (e) => re(e)
  };
}
const hs = [
  "spec-url",
  "spec-json",
  "theme",
  "primary-color",
  "font-family",
  "code-font-family",
  "base-path",
  "default-environment",
  "environments-array",
  "spec-sources-json",
  "title",
  "logo",
  "favicon",
  "class-name"
], Re = class Re extends HTMLElement {
  constructor() {
    super(...arguments), this.api = null, this.reloadTimer = null;
  }
  static get observedAttributes() {
    return [...hs];
  }
  async connectedCallback() {
    if (Re.activeElement && Re.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    Re.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    Re.activeElement === this && (this.api = null, Mn(), Re.activeElement = null);
  }
  attributeChangedCallback(t, n, a) {
    this.isConnected && n !== a && hs.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
      this.reload();
    }, 80));
  }
  async reload() {
    Re.activeElement === this && await this.mountFromAttributes();
  }
  getState() {
    return this.api?.getState() || null;
  }
  subscribe(t) {
    return this.api?.subscribe(t) || (() => {
    });
  }
  navigate(t) {
    this.api?.navigate(t);
  }
  setToken(t) {
    this.api?.setToken(t);
  }
  setEnvironment(t) {
    this.api?.setEnvironment(t);
  }
  async switchSpec(t) {
    await Ys(t);
  }
  async mountFromAttributes() {
    try {
      this.innerHTML = "";
      const t = this.parseConfig();
      this.api = await Xs({ ...t, mount: this });
    } catch (t) {
      const n = t instanceof Error ? t.message : String(t);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${n}</div>`;
    }
  }
  parseConfig() {
    const t = this.getAttribute("spec-json"), n = this.getAttribute("environments-array"), a = this.getAttribute("spec-sources-json");
    return {
      specUrl: this.getAttribute("spec-url") || void 0,
      spec: t ? gn(t, "spec-json") : void 0,
      theme: wo(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      fontFamily: this.getAttribute("font-family") || void 0,
      codeFontFamily: this.getAttribute("code-font-family") || void 0,
      basePath: this.getAttribute("base-path") || void 0,
      defaultEnvironment: this.getAttribute("default-environment") || void 0,
      environments: n ? ko(n) : void 0,
      specSources: a ? gn(a, "spec-sources-json") : void 0,
      title: this.getAttribute("title") || void 0,
      logo: this.getAttribute("logo") || void 0,
      favicon: this.getAttribute("favicon") || void 0,
      className: this.getAttribute("class-name") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
Re.activeElement = null;
let hn = Re;
function gn(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function ko(e) {
  const t = gn(e, "environments-array");
  if (!Array.isArray(t))
    throw new Error("Invalid JSON in environments-array");
  const n = /* @__PURE__ */ new Set();
  return t.map((a, s) => {
    if (typeof a != "string")
      throw new Error("Invalid JSON in environments-array");
    const r = xn(a.trim());
    if (!r)
      throw new Error("Invalid JSON in environments-array");
    const o = Ft(r) || `env-${s + 1}`;
    let c = o, d = 2;
    for (; n.has(c); )
      c = `${o} #${d++}`;
    return n.add(c), { name: c, baseUrl: r };
  });
}
function wo(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", hn);
const Co = {
  mount: Xs,
  unmount: Mn,
  switchSpec: Ys,
  version: "0.0.1"
};
export {
  Co as PureDocs,
  hn as PureDocsElement,
  Co as default
};
//# sourceMappingURL=puredocs.js.map
