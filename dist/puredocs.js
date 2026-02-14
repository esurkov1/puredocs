class Zr {
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
      tryItState: null
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
    const a = { ...this.state.auth.schemes, [t]: n }, r = t, o = n;
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, schemes: a, activeScheme: r, token: o, source: "manual" }
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
const k = new Zr(), Xr = /* @__PURE__ */ new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace"
]);
function Qr(e = "") {
  window.addEventListener("hashchange", Zt), Zt();
}
function ea() {
  window.removeEventListener("hashchange", Zt);
}
function P(e) {
  const t = e.startsWith("/") ? e : `/${e}`;
  window.location.hash = t;
}
function H(e) {
  switch (e.type) {
    case "overview":
      return "/";
    case "tag":
      return `/${te(e.tag || "")}`;
    case "endpoint": {
      const t = e.tag || "default", n = (e.method || "get").toLowerCase(), a = e.path || "/";
      return `/${te(t)}/${n}${a}`;
    }
    case "schema":
      return e.schemaName ? `/schemas/${encodeURIComponent(e.schemaName)}` : "/schemas";
    case "webhook":
      return e.webhookName ? `/webhooks/${encodeURIComponent(e.webhookName)}` : "/webhooks";
    case "guide":
      return `/guides/${encodeURIComponent(e.guidePath || "")}`;
    default:
      return "/";
  }
}
function ar(e) {
  const t = na(e);
  if (t === "/" || t === "") return { type: "overview" };
  const n = t.slice(1).split("/");
  if (n.length === 0) return { type: "overview" };
  const a = be(n[0]).toLowerCase();
  if (a === "schemas")
    return n.length >= 2 ? { type: "schema", schemaName: be(n.slice(1).join("/")) } : { type: "schema" };
  if (a === "webhooks")
    return n.length >= 2 ? { type: "webhook", webhookName: be(n.slice(1).join("/")) } : { type: "webhook" };
  if (a === "guides" && n.length >= 2)
    return {
      type: "guide",
      guidePath: be(n.slice(1).join("/"))
    };
  if (n.length === 1)
    return { type: "tag", tag: be(n[0]) };
  const r = n[1].toLowerCase();
  if (Xr.has(r)) {
    const o = be(n[0]), i = r, s = n.length > 2 ? "/" + n.slice(2).map(be).join("/") : "/";
    return { type: "endpoint", tag: o, method: i, path: s };
  }
  return { type: "tag", tag: be(n[0]) };
}
function te(e) {
  return e.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function be(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function ta() {
  const e = window.location.hash;
  return !e || e === "#" || e === "#/" ? "/" : e.slice(1);
}
function Zt() {
  const e = ta(), t = ar(e);
  k.setRoute(t);
}
function na(e) {
  const t = e.split("?")[0] || "/";
  return (t.startsWith("/") ? t : `/${t}`).replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
}
function at(e) {
  if (e === void 0) return;
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!n || typeof n != "object" || Array.isArray(n)) continue;
    const a = {};
    for (const [r, o] of Object.entries(n)) {
      const i = Array.isArray(o) ? o.map((s) => String(s)) : [];
      a[r] = i;
    }
    t.push(a);
  }
  return t;
}
function cn(e, t, n) {
  if (!e || e.length === 0)
    return { explicitlyNoAuth: n, requirements: [] };
  const a = e.map((r) => Object.entries(r).map(([o, i]) => ({
    schemeName: o,
    scopes: Array.isArray(i) ? i : [],
    scheme: t[o]
  })));
  return { explicitlyNoAuth: n, requirements: a };
}
function U(e) {
  return !!(e && !e.explicitlyNoAuth && e.requirements.length > 0);
}
function ln(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function ra(e) {
  if (!U(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const a of e.requirements)
    for (const r of a) {
      const o = ln(r.scheme);
      t.has(o) || (t.add(o), n.push(o));
    }
  return n;
}
function or(e) {
  const t = ra(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function De(e) {
  return U(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((a) => {
    const r = ln(a.scheme);
    return a.scopes.length > 0 ? `${r} [${a.scopes.join(", ")}]` : r;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function It(e, t, n, a) {
  const r = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!U(e)) return r;
  for (const s of e.requirements) {
    if (!s.every((d) => !!t[d.schemeName]) && s.length > 0) continue;
    const u = An(s, t);
    if (Object.keys(u.headers).length > 0 || Object.keys(u.query).length > 0 || Object.keys(u.cookies).length > 0)
      return u;
  }
  return !a || !n ? r : An([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: a });
}
function aa(e) {
  const t = {};
  if (!U(e)) return t;
  const n = e.requirements[0] || [];
  for (const a of n) {
    const r = a.scheme;
    if (r) {
      if (r.type === "http") {
        const o = (r.scheme || "").toLowerCase();
        o === "bearer" ? t.Authorization = "Bearer <token>" : o === "basic" ? t.Authorization = "Basic <credentials>" : t.Authorization = "<token>";
        continue;
      }
      r.type === "apiKey" && r.in === "header" && r.name && (t[r.name] = `<${r.name}>`);
    }
  }
  return t;
}
function An(e, t) {
  const n = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  for (const a of e) {
    const r = a.scheme, o = t[a.schemeName];
    if (!(!r || !o)) {
      if (n.matchedSchemeNames.push(a.schemeName), r.type === "http") {
        const i = (r.scheme || "").toLowerCase();
        i === "bearer" ? n.headers.Authorization = `Bearer ${o}` : i === "basic" ? n.headers.Authorization = `Basic ${o}` : n.headers.Authorization = o;
        continue;
      }
      if (r.type === "oauth2" || r.type === "openIdConnect") {
        n.headers.Authorization = `Bearer ${o}`;
        continue;
      }
      r.type === "apiKey" && r.name && (r.in === "query" ? n.query[r.name] = o : r.in === "cookie" ? n.cookies[r.name] = o : n.headers[r.name] = o);
    }
  }
  return n;
}
/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function ir(e) {
  return typeof e > "u" || e === null;
}
function oa(e) {
  return typeof e == "object" && e !== null;
}
function ia(e) {
  return Array.isArray(e) ? e : ir(e) ? [] : [e];
}
function sa(e, t) {
  var n, a, r, o;
  if (t)
    for (o = Object.keys(t), n = 0, a = o.length; n < a; n += 1)
      r = o[n], e[r] = t[r];
  return e;
}
function ca(e, t) {
  var n = "", a;
  for (a = 0; a < t; a += 1)
    n += e;
  return n;
}
function la(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
var ua = ir, da = oa, pa = ia, fa = ca, ma = la, ha = sa, K = {
  isNothing: ua,
  isObject: da,
  toArray: pa,
  repeat: fa,
  isNegativeZero: ma,
  extend: ha
};
function sr(e, t) {
  var n = "", a = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), a + " " + n) : a;
}
function ot(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = sr(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
ot.prototype = Object.create(Error.prototype);
ot.prototype.constructor = ot;
ot.prototype.toString = function(t) {
  return this.name + ": " + sr(this, t);
};
var ge = ot;
function Dt(e, t, n, a, r) {
  var o = "", i = "", s = Math.floor(r / 2) - 1;
  return a - t > s && (o = " ... ", t = a - s + o.length), n - a > s && (i = " ...", n = a + s - i.length), {
    str: o + e.slice(t, n).replace(/\t/g, "→") + i,
    pos: a - t + o.length
    // relative position
  };
}
function Ut(e, t) {
  return K.repeat(" ", t - e.length) + e;
}
function ga(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var n = /\r?\n|\r|\0/g, a = [0], r = [], o, i = -1; o = n.exec(e.buffer); )
    r.push(o.index), a.push(o.index + o[0].length), e.position <= o.index && i < 0 && (i = a.length - 2);
  i < 0 && (i = a.length - 1);
  var s = "", l, u, d = Math.min(e.line + t.linesAfter, r.length).toString().length, p = t.maxLength - (t.indent + d + 3);
  for (l = 1; l <= t.linesBefore && !(i - l < 0); l++)
    u = Dt(
      e.buffer,
      a[i - l],
      r[i - l],
      e.position - (a[i] - a[i - l]),
      p
    ), s = K.repeat(" ", t.indent) + Ut((e.line - l + 1).toString(), d) + " | " + u.str + `
` + s;
  for (u = Dt(e.buffer, a[i], r[i], e.position, p), s += K.repeat(" ", t.indent) + Ut((e.line + 1).toString(), d) + " | " + u.str + `
`, s += K.repeat("-", t.indent + d + 3 + u.pos) + `^
`, l = 1; l <= t.linesAfter && !(i + l >= r.length); l++)
    u = Dt(
      e.buffer,
      a[i + l],
      r[i + l],
      e.position - (a[i] - a[i + l]),
      p
    ), s += K.repeat(" ", t.indent) + Ut((e.line + l + 1).toString(), d) + " | " + u.str + `
`;
  return s.replace(/\n$/, "");
}
var va = ga, ya = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], ba = [
  "scalar",
  "sequence",
  "mapping"
];
function xa(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(a) {
      t[String(a)] = n;
    });
  }), t;
}
function ka(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (ya.indexOf(n) === -1)
      throw new ge('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = xa(t.styleAliases || null), ba.indexOf(this.kind) === -1)
    throw new ge('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var Y = ka;
function En(e, t) {
  var n = [];
  return e[t].forEach(function(a) {
    var r = n.length;
    n.forEach(function(o, i) {
      o.tag === a.tag && o.kind === a.kind && o.multi === a.multi && (r = i);
    }), n[r] = a;
  }), n;
}
function Ca() {
  var e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, t, n;
  function a(r) {
    r.multi ? (e.multi[r.kind].push(r), e.multi.fallback.push(r)) : e[r.kind][r.tag] = e.fallback[r.tag] = r;
  }
  for (t = 0, n = arguments.length; t < n; t += 1)
    arguments[t].forEach(a);
  return e;
}
function Xt(e) {
  return this.extend(e);
}
Xt.prototype.extend = function(t) {
  var n = [], a = [];
  if (t instanceof Y)
    a.push(t);
  else if (Array.isArray(t))
    a = a.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (a = a.concat(t.explicit));
  else
    throw new ge("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(o) {
    if (!(o instanceof Y))
      throw new ge("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new ge("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new ge("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), a.forEach(function(o) {
    if (!(o instanceof Y))
      throw new ge("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var r = Object.create(Xt.prototype);
  return r.implicit = (this.implicit || []).concat(n), r.explicit = (this.explicit || []).concat(a), r.compiledImplicit = En(r, "implicit"), r.compiledExplicit = En(r, "explicit"), r.compiledTypeMap = Ca(r.compiledImplicit, r.compiledExplicit), r;
};
var wa = Xt, Na = new Y("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), Sa = new Y("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), Aa = new Y("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Ea = new wa({
  explicit: [
    Na,
    Sa,
    Aa
  ]
});
function La(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Oa() {
  return null;
}
function Ta(e) {
  return e === null;
}
var qa = new Y("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: La,
  construct: Oa,
  predicate: Ta,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function Ia(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function $a(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function ja(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Ba = new Y("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: Ia,
  construct: $a,
  predicate: ja,
  represent: {
    lowercase: function(e) {
      return e ? "true" : "false";
    },
    uppercase: function(e) {
      return e ? "TRUE" : "FALSE";
    },
    camelcase: function(e) {
      return e ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function Ma(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Pa(e) {
  return 48 <= e && e <= 55;
}
function Ra(e) {
  return 48 <= e && e <= 57;
}
function Ha(e) {
  if (e === null) return !1;
  var t = e.length, n = 0, a = !1, r;
  if (!t) return !1;
  if (r = e[n], (r === "-" || r === "+") && (r = e[++n]), r === "0") {
    if (n + 1 === t) return !0;
    if (r = e[++n], r === "b") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (r !== "0" && r !== "1") return !1;
          a = !0;
        }
      return a && r !== "_";
    }
    if (r === "x") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Ma(e.charCodeAt(n))) return !1;
          a = !0;
        }
      return a && r !== "_";
    }
    if (r === "o") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Pa(e.charCodeAt(n))) return !1;
          a = !0;
        }
      return a && r !== "_";
    }
  }
  if (r === "_") return !1;
  for (; n < t; n++)
    if (r = e[n], r !== "_") {
      if (!Ra(e.charCodeAt(n)))
        return !1;
      a = !0;
    }
  return !(!a || r === "_");
}
function Fa(e) {
  var t = e, n = 1, a;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), a = t[0], (a === "-" || a === "+") && (a === "-" && (n = -1), t = t.slice(1), a = t[0]), t === "0") return 0;
  if (a === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function _a(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !K.isNegativeZero(e);
}
var Da = new Y("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Ha,
  construct: Fa,
  predicate: _a,
  represent: {
    binary: function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    },
    octal: function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    },
    decimal: function(e) {
      return e.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
}), Ua = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function za(e) {
  return !(e === null || !Ua.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function Wa(e) {
  var t, n;
  return t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
var Va = /^[-+]?[0-9]+e/;
function Ya(e, t) {
  var n;
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (K.isNegativeZero(e))
    return "-0.0";
  return n = e.toString(10), Va.test(n) ? n.replace("e", ".e") : n;
}
function Ga(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || K.isNegativeZero(e));
}
var Ka = new Y("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: za,
  construct: Wa,
  predicate: Ga,
  represent: Ya,
  defaultStyle: "lowercase"
}), Ja = Ea.extend({
  implicit: [
    qa,
    Ba,
    Da,
    Ka
  ]
}), Za = Ja, cr = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), lr = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Xa(e) {
  return e === null ? !1 : cr.exec(e) !== null || lr.exec(e) !== null;
}
function Qa(e) {
  var t, n, a, r, o, i, s, l = 0, u = null, d, p, m;
  if (t = cr.exec(e), t === null && (t = lr.exec(e)), t === null) throw new Error("Date resolve error");
  if (n = +t[1], a = +t[2] - 1, r = +t[3], !t[4])
    return new Date(Date.UTC(n, a, r));
  if (o = +t[4], i = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (d = +t[10], p = +(t[11] || 0), u = (d * 60 + p) * 6e4, t[9] === "-" && (u = -u)), m = new Date(Date.UTC(n, a, r, o, i, s, l)), u && m.setTime(m.getTime() - u), m;
}
function eo(e) {
  return e.toISOString();
}
var to = new Y("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Xa,
  construct: Qa,
  instanceOf: Date,
  represent: eo
});
function no(e) {
  return e === "<<" || e === null;
}
var ro = new Y("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: no
}), un = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function ao(e) {
  if (e === null) return !1;
  var t, n, a = 0, r = e.length, o = un;
  for (n = 0; n < r; n++)
    if (t = o.indexOf(e.charAt(n)), !(t > 64)) {
      if (t < 0) return !1;
      a += 6;
    }
  return a % 8 === 0;
}
function oo(e) {
  var t, n, a = e.replace(/[\r\n=]/g, ""), r = a.length, o = un, i = 0, s = [];
  for (t = 0; t < r; t++)
    t % 4 === 0 && t && (s.push(i >> 16 & 255), s.push(i >> 8 & 255), s.push(i & 255)), i = i << 6 | o.indexOf(a.charAt(t));
  return n = r % 4 * 6, n === 0 ? (s.push(i >> 16 & 255), s.push(i >> 8 & 255), s.push(i & 255)) : n === 18 ? (s.push(i >> 10 & 255), s.push(i >> 2 & 255)) : n === 12 && s.push(i >> 4 & 255), new Uint8Array(s);
}
function io(e) {
  var t = "", n = 0, a, r, o = e.length, i = un;
  for (a = 0; a < o; a++)
    a % 3 === 0 && a && (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]), n = (n << 8) + e[a];
  return r = o % 3, r === 0 ? (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]) : r === 2 ? (t += i[n >> 10 & 63], t += i[n >> 4 & 63], t += i[n << 2 & 63], t += i[64]) : r === 1 && (t += i[n >> 2 & 63], t += i[n << 4 & 63], t += i[64], t += i[64]), t;
}
function so(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var co = new Y("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: ao,
  construct: oo,
  predicate: so,
  represent: io
}), lo = Object.prototype.hasOwnProperty, uo = Object.prototype.toString;
function po(e) {
  if (e === null) return !0;
  var t = [], n, a, r, o, i, s = e;
  for (n = 0, a = s.length; n < a; n += 1) {
    if (r = s[n], i = !1, uo.call(r) !== "[object Object]") return !1;
    for (o in r)
      if (lo.call(r, o))
        if (!i) i = !0;
        else return !1;
    if (!i) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function fo(e) {
  return e !== null ? e : [];
}
var mo = new Y("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: po,
  construct: fo
}), ho = Object.prototype.toString;
function go(e) {
  if (e === null) return !0;
  var t, n, a, r, o, i = e;
  for (o = new Array(i.length), t = 0, n = i.length; t < n; t += 1) {
    if (a = i[t], ho.call(a) !== "[object Object]" || (r = Object.keys(a), r.length !== 1)) return !1;
    o[t] = [r[0], a[r[0]]];
  }
  return !0;
}
function vo(e) {
  if (e === null) return [];
  var t, n, a, r, o, i = e;
  for (o = new Array(i.length), t = 0, n = i.length; t < n; t += 1)
    a = i[t], r = Object.keys(a), o[t] = [r[0], a[r[0]]];
  return o;
}
var yo = new Y("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: go,
  construct: vo
}), bo = Object.prototype.hasOwnProperty;
function xo(e) {
  if (e === null) return !0;
  var t, n = e;
  for (t in n)
    if (bo.call(n, t) && n[t] !== null)
      return !1;
  return !0;
}
function ko(e) {
  return e !== null ? e : {};
}
var Co = new Y("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: xo,
  construct: ko
}), wo = Za.extend({
  implicit: [
    to,
    ro
  ],
  explicit: [
    co,
    mo,
    yo,
    Co
  ]
}), Ne = Object.prototype.hasOwnProperty, kt = 1, ur = 2, dr = 3, Ct = 4, zt = 1, No = 2, Ln = 3, So = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Ao = /[\x85\u2028\u2029]/, Eo = /[,\[\]\{\}]/, pr = /^(?:!|!!|![a-z\-]+!)$/i, fr = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function On(e) {
  return Object.prototype.toString.call(e);
}
function le(e) {
  return e === 10 || e === 13;
}
function je(e) {
  return e === 9 || e === 32;
}
function ee(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Pe(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Lo(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Oo(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function To(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function Tn(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function qo(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function mr(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
var hr = new Array(256), gr = new Array(256);
for (var Be = 0; Be < 256; Be++)
  hr[Be] = Tn(Be) ? 1 : 0, gr[Be] = Tn(Be);
function Io(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || wo, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function vr(e, t) {
  var n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = va(n), new ge(t, n);
}
function S(e, t) {
  throw vr(e, t);
}
function wt(e, t) {
  e.onWarning && e.onWarning.call(null, vr(e, t));
}
var qn = {
  YAML: function(t, n, a) {
    var r, o, i;
    t.version !== null && S(t, "duplication of %YAML directive"), a.length !== 1 && S(t, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(a[0]), r === null && S(t, "ill-formed argument of the YAML directive"), o = parseInt(r[1], 10), i = parseInt(r[2], 10), o !== 1 && S(t, "unacceptable YAML version of the document"), t.version = a[0], t.checkLineBreaks = i < 2, i !== 1 && i !== 2 && wt(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, a) {
    var r, o;
    a.length !== 2 && S(t, "TAG directive accepts exactly two arguments"), r = a[0], o = a[1], pr.test(r) || S(t, "ill-formed tag handle (first argument) of the TAG directive"), Ne.call(t.tagMap, r) && S(t, 'there is a previously declared suffix for "' + r + '" tag handle'), fr.test(o) || S(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      S(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[r] = o;
  }
};
function we(e, t, n, a) {
  var r, o, i, s;
  if (t < n) {
    if (s = e.input.slice(t, n), a)
      for (r = 0, o = s.length; r < o; r += 1)
        i = s.charCodeAt(r), i === 9 || 32 <= i && i <= 1114111 || S(e, "expected valid JSON character");
    else So.test(s) && S(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function In(e, t, n, a) {
  var r, o, i, s;
  for (K.isObject(n) || S(e, "cannot merge mappings; the provided source object is unacceptable"), r = Object.keys(n), i = 0, s = r.length; i < s; i += 1)
    o = r[i], Ne.call(t, o) || (mr(t, o, n[o]), a[o] = !0);
}
function Re(e, t, n, a, r, o, i, s, l) {
  var u, d;
  if (Array.isArray(r))
    for (r = Array.prototype.slice.call(r), u = 0, d = r.length; u < d; u += 1)
      Array.isArray(r[u]) && S(e, "nested arrays are not supported inside keys"), typeof r == "object" && On(r[u]) === "[object Object]" && (r[u] = "[object Object]");
  if (typeof r == "object" && On(r) === "[object Object]" && (r = "[object Object]"), r = String(r), t === null && (t = {}), a === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (u = 0, d = o.length; u < d; u += 1)
        In(e, t, o[u], n);
    else
      In(e, t, o, n);
  else
    !e.json && !Ne.call(n, r) && Ne.call(t, r) && (e.line = i || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, S(e, "duplicated mapping key")), mr(t, r, o), delete n[r];
  return t;
}
function dn(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : S(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function F(e, t, n) {
  for (var a = 0, r = e.input.charCodeAt(e.position); r !== 0; ) {
    for (; je(r); )
      r === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
    if (t && r === 35)
      do
        r = e.input.charCodeAt(++e.position);
      while (r !== 10 && r !== 13 && r !== 0);
    if (le(r))
      for (dn(e), r = e.input.charCodeAt(e.position), a++, e.lineIndent = 0; r === 32; )
        e.lineIndent++, r = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && a !== 0 && e.lineIndent < n && wt(e, "deficient indentation"), a;
}
function $t(e) {
  var t = e.position, n;
  return n = e.input.charCodeAt(t), !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || ee(n)));
}
function pn(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += K.repeat(`
`, t - 1));
}
function $o(e, t, n) {
  var a, r, o, i, s, l, u, d, p = e.kind, m = e.result, f;
  if (f = e.input.charCodeAt(e.position), ee(f) || Pe(f) || f === 35 || f === 38 || f === 42 || f === 33 || f === 124 || f === 62 || f === 39 || f === 34 || f === 37 || f === 64 || f === 96 || (f === 63 || f === 45) && (r = e.input.charCodeAt(e.position + 1), ee(r) || n && Pe(r)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = i = e.position, s = !1; f !== 0; ) {
    if (f === 58) {
      if (r = e.input.charCodeAt(e.position + 1), ee(r) || n && Pe(r))
        break;
    } else if (f === 35) {
      if (a = e.input.charCodeAt(e.position - 1), ee(a))
        break;
    } else {
      if (e.position === e.lineStart && $t(e) || n && Pe(f))
        break;
      if (le(f))
        if (l = e.line, u = e.lineStart, d = e.lineIndent, F(e, !1, -1), e.lineIndent >= t) {
          s = !0, f = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = i, e.line = l, e.lineStart = u, e.lineIndent = d;
          break;
        }
    }
    s && (we(e, o, i, !1), pn(e, e.line - l), o = i = e.position, s = !1), je(f) || (i = e.position + 1), f = e.input.charCodeAt(++e.position);
  }
  return we(e, o, i, !1), e.result ? !0 : (e.kind = p, e.result = m, !1);
}
function jo(e, t) {
  var n, a, r;
  if (n = e.input.charCodeAt(e.position), n !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, a = r = e.position; (n = e.input.charCodeAt(e.position)) !== 0; )
    if (n === 39)
      if (we(e, a, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39)
        a = e.position, e.position++, r = e.position;
      else
        return !0;
    else le(n) ? (we(e, a, r, !0), pn(e, F(e, !1, t)), a = r = e.position) : e.position === e.lineStart && $t(e) ? S(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position);
  S(e, "unexpected end of the stream within a single quoted scalar");
}
function Bo(e, t) {
  var n, a, r, o, i, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = a = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return we(e, n, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (we(e, n, e.position, !0), s = e.input.charCodeAt(++e.position), le(s))
        F(e, !1, t);
      else if (s < 256 && hr[s])
        e.result += gr[s], e.position++;
      else if ((i = Oo(s)) > 0) {
        for (r = i, o = 0; r > 0; r--)
          s = e.input.charCodeAt(++e.position), (i = Lo(s)) >= 0 ? o = (o << 4) + i : S(e, "expected hexadecimal character");
        e.result += qo(o), e.position++;
      } else
        S(e, "unknown escape sequence");
      n = a = e.position;
    } else le(s) ? (we(e, n, a, !0), pn(e, F(e, !1, t)), n = a = e.position) : e.position === e.lineStart && $t(e) ? S(e, "unexpected end of the document within a double quoted scalar") : (e.position++, a = e.position);
  }
  S(e, "unexpected end of the stream within a double quoted scalar");
}
function Mo(e, t) {
  var n = !0, a, r, o, i = e.tag, s, l = e.anchor, u, d, p, m, f, h = /* @__PURE__ */ Object.create(null), v, y, b, g;
  if (g = e.input.charCodeAt(e.position), g === 91)
    d = 93, f = !1, s = [];
  else if (g === 123)
    d = 125, f = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), g = e.input.charCodeAt(++e.position); g !== 0; ) {
    if (F(e, !0, t), g = e.input.charCodeAt(e.position), g === d)
      return e.position++, e.tag = i, e.anchor = l, e.kind = f ? "mapping" : "sequence", e.result = s, !0;
    n ? g === 44 && S(e, "expected the node content, but found ','") : S(e, "missed comma between flow collection entries"), y = v = b = null, p = m = !1, g === 63 && (u = e.input.charCodeAt(e.position + 1), ee(u) && (p = m = !0, e.position++, F(e, !0, t))), a = e.line, r = e.lineStart, o = e.position, Ue(e, t, kt, !1, !0), y = e.tag, v = e.result, F(e, !0, t), g = e.input.charCodeAt(e.position), (m || e.line === a) && g === 58 && (p = !0, g = e.input.charCodeAt(++e.position), F(e, !0, t), Ue(e, t, kt, !1, !0), b = e.result), f ? Re(e, s, h, y, v, b, a, r, o) : p ? s.push(Re(e, null, h, y, v, b, a, r, o)) : s.push(v), F(e, !0, t), g = e.input.charCodeAt(e.position), g === 44 ? (n = !0, g = e.input.charCodeAt(++e.position)) : n = !1;
  }
  S(e, "unexpected end of the stream within a flow collection");
}
function Po(e, t) {
  var n, a, r = zt, o = !1, i = !1, s = t, l = 0, u = !1, d, p;
  if (p = e.input.charCodeAt(e.position), p === 124)
    a = !1;
  else if (p === 62)
    a = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; p !== 0; )
    if (p = e.input.charCodeAt(++e.position), p === 43 || p === 45)
      zt === r ? r = p === 43 ? Ln : No : S(e, "repeat of a chomping mode identifier");
    else if ((d = To(p)) >= 0)
      d === 0 ? S(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : i ? S(e, "repeat of an indentation width identifier") : (s = t + d - 1, i = !0);
    else
      break;
  if (je(p)) {
    do
      p = e.input.charCodeAt(++e.position);
    while (je(p));
    if (p === 35)
      do
        p = e.input.charCodeAt(++e.position);
      while (!le(p) && p !== 0);
  }
  for (; p !== 0; ) {
    for (dn(e), e.lineIndent = 0, p = e.input.charCodeAt(e.position); (!i || e.lineIndent < s) && p === 32; )
      e.lineIndent++, p = e.input.charCodeAt(++e.position);
    if (!i && e.lineIndent > s && (s = e.lineIndent), le(p)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      r === Ln ? e.result += K.repeat(`
`, o ? 1 + l : l) : r === zt && o && (e.result += `
`);
      break;
    }
    for (a ? je(p) ? (u = !0, e.result += K.repeat(`
`, o ? 1 + l : l)) : u ? (u = !1, e.result += K.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += K.repeat(`
`, l) : e.result += K.repeat(`
`, o ? 1 + l : l), o = !0, i = !0, l = 0, n = e.position; !le(p) && p !== 0; )
      p = e.input.charCodeAt(++e.position);
    we(e, n, e.position, !1);
  }
  return !0;
}
function $n(e, t) {
  var n, a = e.tag, r = e.anchor, o = [], i, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, S(e, "tab characters must not be used in indentation")), !(l !== 45 || (i = e.input.charCodeAt(e.position + 1), !ee(i)))); ) {
    if (s = !0, e.position++, F(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (n = e.line, Ue(e, t, dr, !1, !0), o.push(e.result), F(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && l !== 0)
      S(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = a, e.anchor = r, e.kind = "sequence", e.result = o, !0) : !1;
}
function Ro(e, t, n) {
  var a, r, o, i, s, l, u = e.tag, d = e.anchor, p = {}, m = /* @__PURE__ */ Object.create(null), f = null, h = null, v = null, y = !1, b = !1, g;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = p), g = e.input.charCodeAt(e.position); g !== 0; ) {
    if (!y && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, S(e, "tab characters must not be used in indentation")), a = e.input.charCodeAt(e.position + 1), o = e.line, (g === 63 || g === 58) && ee(a))
      g === 63 ? (y && (Re(e, p, m, f, h, null, i, s, l), f = h = v = null), b = !0, y = !0, r = !0) : y ? (y = !1, r = !0) : S(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, g = a;
    else {
      if (i = e.line, s = e.lineStart, l = e.position, !Ue(e, n, ur, !1, !0))
        break;
      if (e.line === o) {
        for (g = e.input.charCodeAt(e.position); je(g); )
          g = e.input.charCodeAt(++e.position);
        if (g === 58)
          g = e.input.charCodeAt(++e.position), ee(g) || S(e, "a whitespace character is expected after the key-value separator within a block mapping"), y && (Re(e, p, m, f, h, null, i, s, l), f = h = v = null), b = !0, y = !1, r = !1, f = e.tag, h = e.result;
        else if (b)
          S(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = u, e.anchor = d, !0;
      } else if (b)
        S(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = u, e.anchor = d, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (y && (i = e.line, s = e.lineStart, l = e.position), Ue(e, t, Ct, !0, r) && (y ? h = e.result : v = e.result), y || (Re(e, p, m, f, h, v, i, s, l), f = h = v = null), F(e, !0, -1), g = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && g !== 0)
      S(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return y && Re(e, p, m, f, h, null, i, s, l), b && (e.tag = u, e.anchor = d, e.kind = "mapping", e.result = p), b;
}
function Ho(e) {
  var t, n = !1, a = !1, r, o, i;
  if (i = e.input.charCodeAt(e.position), i !== 33) return !1;
  if (e.tag !== null && S(e, "duplication of a tag property"), i = e.input.charCodeAt(++e.position), i === 60 ? (n = !0, i = e.input.charCodeAt(++e.position)) : i === 33 ? (a = !0, r = "!!", i = e.input.charCodeAt(++e.position)) : r = "!", t = e.position, n) {
    do
      i = e.input.charCodeAt(++e.position);
    while (i !== 0 && i !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), i = e.input.charCodeAt(++e.position)) : S(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; i !== 0 && !ee(i); )
      i === 33 && (a ? S(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(t - 1, e.position + 1), pr.test(r) || S(e, "named tag handle cannot contain such characters"), a = !0, t = e.position + 1)), i = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), Eo.test(o) && S(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !fr.test(o) && S(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    S(e, "tag name is malformed: " + o);
  }
  return n ? e.tag = o : Ne.call(e.tagMap, r) ? e.tag = e.tagMap[r] + o : r === "!" ? e.tag = "!" + o : r === "!!" ? e.tag = "tag:yaml.org,2002:" + o : S(e, 'undeclared tag handle "' + r + '"'), !0;
}
function Fo(e) {
  var t, n;
  if (n = e.input.charCodeAt(e.position), n !== 38) return !1;
  for (e.anchor !== null && S(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !ee(n) && !Pe(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && S(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function _o(e) {
  var t, n, a;
  if (a = e.input.charCodeAt(e.position), a !== 42) return !1;
  for (a = e.input.charCodeAt(++e.position), t = e.position; a !== 0 && !ee(a) && !Pe(a); )
    a = e.input.charCodeAt(++e.position);
  return e.position === t && S(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), Ne.call(e.anchorMap, n) || S(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], F(e, !0, -1), !0;
}
function Ue(e, t, n, a, r) {
  var o, i, s, l = 1, u = !1, d = !1, p, m, f, h, v, y;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = i = s = Ct === n || dr === n, a && F(e, !0, -1) && (u = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; Ho(e) || Fo(e); )
      F(e, !0, -1) ? (u = !0, s = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = u || r), (l === 1 || Ct === n) && (kt === n || ur === n ? v = t : v = t + 1, y = e.position - e.lineStart, l === 1 ? s && ($n(e, y) || Ro(e, y, v)) || Mo(e, v) ? d = !0 : (i && Po(e, v) || jo(e, v) || Bo(e, v) ? d = !0 : _o(e) ? (d = !0, (e.tag !== null || e.anchor !== null) && S(e, "alias node should not have any properties")) : $o(e, v, kt === n) && (d = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (d = s && $n(e, y))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && S(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), p = 0, m = e.implicitTypes.length; p < m; p += 1)
      if (h = e.implicitTypes[p], h.resolve(e.result)) {
        e.result = h.construct(e.result), e.tag = h.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (Ne.call(e.typeMap[e.kind || "fallback"], e.tag))
      h = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (h = null, f = e.typeMap.multi[e.kind || "fallback"], p = 0, m = f.length; p < m; p += 1)
        if (e.tag.slice(0, f[p].tag.length) === f[p].tag) {
          h = f[p];
          break;
        }
    h || S(e, "unknown tag !<" + e.tag + ">"), e.result !== null && h.kind !== e.kind && S(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + h.kind + '", not "' + e.kind + '"'), h.resolve(e.result, e.tag) ? (e.result = h.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : S(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || d;
}
function Do(e) {
  var t = e.position, n, a, r, o = !1, i;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (i = e.input.charCodeAt(e.position)) !== 0 && (F(e, !0, -1), i = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || i !== 37)); ) {
    for (o = !0, i = e.input.charCodeAt(++e.position), n = e.position; i !== 0 && !ee(i); )
      i = e.input.charCodeAt(++e.position);
    for (a = e.input.slice(n, e.position), r = [], a.length < 1 && S(e, "directive name must not be less than one character in length"); i !== 0; ) {
      for (; je(i); )
        i = e.input.charCodeAt(++e.position);
      if (i === 35) {
        do
          i = e.input.charCodeAt(++e.position);
        while (i !== 0 && !le(i));
        break;
      }
      if (le(i)) break;
      for (n = e.position; i !== 0 && !ee(i); )
        i = e.input.charCodeAt(++e.position);
      r.push(e.input.slice(n, e.position));
    }
    i !== 0 && dn(e), Ne.call(qn, a) ? qn[a](e, a, r) : wt(e, 'unknown document directive "' + a + '"');
  }
  if (F(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, F(e, !0, -1)) : o && S(e, "directives end mark is expected"), Ue(e, e.lineIndent - 1, Ct, !1, !0), F(e, !0, -1), e.checkLineBreaks && Ao.test(e.input.slice(t, e.position)) && wt(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && $t(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, F(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    S(e, "end of the stream or a document separator is expected");
  else
    return;
}
function Uo(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var n = new Io(e, t), a = e.indexOf("\0");
  for (a !== -1 && (n.position = a, S(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    Do(n);
  return n.documents;
}
function zo(e, t) {
  var n = Uo(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new ge("expected a single document in the stream, but found more");
  }
}
var Wo = zo, Vo = {
  load: Wo
}, Yo = Vo.load;
const Go = 50, Ko = 200;
function Jo(e) {
  const t = Zo(e.info || {}), n = Xo(e.servers || []), a = e.components || {}, r = ti(a.schemas || {}, e), o = Qo(a.securitySchemes || {}), i = at(e.security), s = e.paths || {}, l = {};
  for (const [m, f] of Object.entries(s))
    m.startsWith("/docs") || (l[m] = f);
  const u = ni(l, e, i, o), d = ii(u, e.tags || []), p = ri(e.webhooks || {}, e, i, o);
  return { raw: e, info: t, servers: n, tags: d, operations: u, schemas: r, securitySchemes: o, webhooks: p };
}
function Zo(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function Xo(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function Qo(e) {
  const t = {};
  for (const [n, a] of Object.entries(e)) {
    const r = a;
    t[n] = {
      type: String(r.type || ""),
      scheme: r.scheme ? String(r.scheme) : void 0,
      bearerFormat: r.bearerFormat ? String(r.bearerFormat) : void 0,
      description: r.description ? String(r.description) : void 0,
      in: r.in ? String(r.in) : void 0,
      name: r.name ? String(r.name) : void 0,
      openIdConnectUrl: r.openIdConnectUrl ? String(r.openIdConnectUrl) : void 0,
      flows: r.flows && typeof r.flows == "object" ? r.flows : void 0
    };
  }
  return t;
}
const rt = /* @__PURE__ */ new Map();
let fn = 0;
function ei(e, t) {
  if (rt.has(e)) return rt.get(e);
  if (++fn > Ko) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((r) => decodeURIComponent(r.replace(/~1/g, "/").replace(/~0/g, "~")));
  let a = t;
  for (const r of n)
    if (a && typeof a == "object" && !Array.isArray(a))
      a = a[r];
    else
      return;
  return rt.set(e, a), a;
}
function J(e, t, n = 0, a = /* @__PURE__ */ new Set()) {
  if (n > Go || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((i) => J(i, t, n + 1, a));
  const r = e;
  if (typeof r.$ref == "string") {
    const i = r.$ref;
    if (a.has(i)) return { type: "object", description: "[Circular reference]" };
    const s = new Set(a);
    s.add(i);
    const l = ei(i, t);
    return l && typeof l == "object" ? J(l, t, n + 1, s) : l;
  }
  const o = {};
  for (const [i, s] of Object.entries(r))
    o[i] = J(s, t, n + 1, a);
  return o;
}
function ti(e, t) {
  rt.clear(), fn = 0;
  const n = {};
  for (const [a, r] of Object.entries(e))
    n[a] = J(r, t);
  return n;
}
function ni(e, t, n, a) {
  rt.clear(), fn = 0;
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [i, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = at(s.security), u = Array.isArray(s.parameters) ? s.parameters.map((d) => J(d, t)) : [];
    for (const d of o) {
      const p = s[d];
      if (!p) continue;
      const m = yr(
        d,
        i,
        p,
        u,
        t,
        l,
        n,
        a
      );
      r.push(m);
    }
  }
  return r;
}
function yr(e, t, n, a, r, o = void 0, i = void 0, s = {}) {
  const l = Array.isArray(n.parameters) ? n.parameters.map((x) => J(x, r)) : [], u = [...a];
  for (const x of l) {
    const L = u.findIndex((C) => C.name === x.name && C.in === x.in);
    L >= 0 ? u[L] = x : u.push(x);
  }
  const d = br(u, r);
  let p = xr(n.requestBody, r);
  if (Array.isArray(n["x-doc-examples"])) {
    const x = n["x-doc-examples"], L = [];
    for (let C = 0; C < x.length; C++) {
      const w = x[C], $ = w.scenario ? String(w.scenario) : `Example ${C + 1}`, R = w.request?.body;
      R !== void 0 && L.push({ summary: $, value: R });
    }
    if (L.length > 0) {
      p || (p = { required: !1, content: {} });
      const C = p.content["application/json"] || p.content["application/vnd.api+json"] || {};
      p.content["application/json"] || (p.content["application/json"] = C);
      const w = p.content["application/json"];
      w.examples || (w.examples = {});
      for (let $ = 0; $ < L.length; $++) {
        const I = L[$], G = `${I.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${$}`.replace(/^-/, "");
        w.examples[G] = { summary: I.summary, description: I.summary, value: I.value };
      }
    }
  }
  const m = kr(n.responses, r), f = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], h = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), v = Object.prototype.hasOwnProperty.call(n, "security"), y = at(n.security), b = v ? y : o ?? i, g = v && Array.isArray(y) && y.length === 0, A = oi(n.callbacks, r, s), O = {
    operationId: h,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: f,
    deprecated: !!n.deprecated,
    security: b,
    resolvedSecurity: cn(b, s, g),
    parameters: d,
    requestBody: p,
    responses: m
  };
  return A.length > 0 && (O.callbacks = A), O;
}
function ri(e, t, n, a) {
  if (!e || typeof e != "object") return [];
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [i, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = J(s, t), u = at(l.security);
    for (const d of o) {
      const p = l[d];
      if (!p) continue;
      const m = Object.prototype.hasOwnProperty.call(p, "security"), f = at(p.security), h = m ? f : u ?? n, v = m && Array.isArray(f) && f.length === 0, y = Array.isArray(p.parameters) ? p.parameters.map((O) => J(O, t)) : [], b = br(y, t), g = xr(p.requestBody, t), A = kr(p.responses, t);
      r.push({
        name: i,
        method: d,
        path: i,
        summary: p.summary ? String(p.summary) : void 0,
        description: p.description ? String(p.description) : void 0,
        security: h,
        resolvedSecurity: cn(h, a, v),
        parameters: b,
        requestBody: g,
        responses: A
      });
    }
  }
  return r;
}
function br(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? J(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? wr(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function xr(e, t) {
  if (!e) return;
  const n = J(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: Cr(n.content || {}, t)
  };
}
function ai(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, r] of Object.entries(e)) {
    if (!r || typeof r != "object") continue;
    const o = J(r, t), i = o.schema, s = o.example ?? (i && typeof i == "object" ? i.example : void 0);
    n[a] = {
      description: o.description ? String(o.description) : void 0,
      required: !!o.required,
      schema: i && typeof i == "object" ? J(i, t) : void 0,
      example: s !== void 0 ? s : void 0,
      deprecated: !!o.deprecated
    };
  }
  return n;
}
function kr(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, r] of Object.entries(e)) {
    const o = J(r, t), i = o.headers;
    n[a] = {
      statusCode: a,
      description: o.description ? String(o.description) : void 0,
      headers: i ? ai(i, t) : void 0,
      content: o.content ? Cr(o.content, t) : void 0
    };
  }
  return n;
}
function oi(e, t, n) {
  if (!e || typeof e != "object") return [];
  const a = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, i] of Object.entries(e)) {
    const s = J(i, t);
    if (!s || typeof s != "object") continue;
    const l = [];
    for (const [u, d] of Object.entries(s))
      if (!(!d || typeof d != "object"))
        for (const p of r) {
          const m = d[p];
          m && l.push(yr(p, u, m, [], t, void 0, void 0, n));
        }
    l.length > 0 && a.push({ name: o, operations: l });
  }
  return a;
}
function Cr(e, t) {
  const n = {};
  for (const [a, r] of Object.entries(e)) {
    const o = r;
    n[a] = {
      schema: o.schema ? J(o.schema, t) : void 0,
      example: o.example,
      examples: o.examples ? wr(o.examples) : void 0
    };
  }
  return n;
}
function wr(e) {
  const t = {};
  for (const [n, a] of Object.entries(e)) {
    const r = a;
    t[n] = {
      summary: r.summary ? String(r.summary) : void 0,
      description: r.description ? String(r.description) : void 0,
      value: r.value
    };
  }
  return t;
}
function ii(e, t) {
  const n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  for (const i of t)
    a.set(String(i.name), String(i.description || ""));
  for (const i of e)
    for (const s of i.tags)
      n.has(s) || n.set(s, []), n.get(s).push(i);
  const r = [], o = /* @__PURE__ */ new Set();
  for (const i of t) {
    const s = String(i.name);
    o.has(s) || (o.add(s), r.push({
      name: s,
      description: a.get(s),
      operations: n.get(s) || []
    }));
  }
  for (const [i, s] of n)
    o.has(i) || (o.add(i), r.push({ name: i, description: a.get(i), operations: s }));
  return r;
}
function $e(e) {
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
          const t = $e(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, a] of Object.entries(e.properties))
            t[n] = $e(a);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const a = $e(n);
            a && typeof a == "object" && !Array.isArray(a) && Object.assign(t, a);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return $e(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return $e(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, a] of Object.entries(e.properties))
            t[n] = $e(a);
          return t;
        }
        return;
    }
  }
}
async function si(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return Yo(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let Me = [];
const jn = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function ci(e) {
  Me = [];
  for (const t of e.tags)
    Me.push({
      type: "tag",
      title: t.name,
      subtitle: t.description,
      tag: t.name,
      keywords: `${t.name} ${t.description || ""}`.toLowerCase()
    });
  for (const t of e.operations)
    Me.push({
      type: "operation",
      title: t.summary || t.operationId,
      subtitle: t.path,
      method: t.method,
      requiresAuth: U(t.resolvedSecurity),
      authBadge: or(t.resolvedSecurity) || void 0,
      authTitle: U(t.resolvedSecurity) ? De(t.resolvedSecurity) : void 0,
      resolvedSecurity: t.resolvedSecurity,
      path: t.path,
      tag: t.tags[0],
      operationId: t.operationId,
      keywords: `${t.method} ${t.path} ${t.summary || ""} ${t.description || ""} ${t.operationId} ${t.tags.join(" ")}`.toLowerCase()
    });
  for (const [t, n] of Object.entries(e.schemas))
    Me.push({
      type: "schema",
      title: t,
      subtitle: n.description || "Schema",
      schemaName: t,
      keywords: `${t} ${n.description || ""} schema model`.toLowerCase()
    });
  if (e.webhooks)
    for (const t of e.webhooks)
      Me.push({
        type: "webhook",
        title: t.summary || t.name,
        subtitle: `${t.method.toUpperCase()} Webhook`,
        method: t.method,
        webhookName: t.name,
        keywords: `${t.name} ${t.method} ${t.summary || ""} ${t.description || ""} webhook`.toLowerCase()
      });
}
function li(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), a = [];
  for (const r of Me) {
    let o = 0, i = !0;
    for (const s of n)
      r.keywords.includes(s) ? (o += 1, r.title.toLowerCase().includes(s) && (o += 3), r.path?.toLowerCase().includes(s) && (o += 2), r.method?.toLowerCase() === s && (o += 2)) : i = !1;
    i && o > 0 && a.push({ entry: r, score: o });
  }
  return a.sort((r, o) => {
    const i = jn[r.entry.type] ?? 99, s = jn[o.entry.type] ?? 99;
    return i !== s ? i - s : o.score !== r.score ? o.score - r.score : r.entry.title.localeCompare(o.entry.title);
  }).slice(0, t).map((r) => r.entry);
}
const Nr = "puredocs-theme";
function Bn(e, t, n) {
  const a = e.classList.contains("light") || e.classList.contains("dark");
  a && e.classList.add("theme-transitioning"), e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color"), a && setTimeout(() => e.classList.remove("theme-transitioning"), 550);
}
function ui() {
  const t = k.get().theme === "light" ? "dark" : "light";
  k.set({ theme: t });
  try {
    localStorage.setItem(Nr, t);
  } catch {
  }
}
function di(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(Nr);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function Sr(e) {
  const t = e.trim();
  return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function gt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function c(e, t, ...n) {
  const a = document.createElement(e);
  if (t)
    for (const [r, o] of Object.entries(t))
      o === void 0 || o === !1 || (r.startsWith("on") && typeof o == "function" ? a.addEventListener(r.slice(2).toLowerCase(), o) : r === "className" ? a.className = String(o) : r === "innerHTML" ? a.innerHTML = String(o) : r === "textContent" ? a.textContent = String(o) : o === !0 ? a.setAttribute(r, "") : a.setAttribute(r, String(o)));
  for (const r of n)
    r == null || r === !1 || (typeof r == "string" ? a.appendChild(document.createTextNode(r)) : a.appendChild(r));
  return a;
}
function W(e) {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
}
function et(e, ...t) {
  W(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
async function pi(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function fi(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], a = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** a).toFixed(a > 0 ? 1 : 0)} ${n[a]}`;
}
function mi(e) {
  return e < 1e3 ? `${Math.round(e)} ms` : `${(e / 1e3).toFixed(2)} s`;
}
const _ = (e, t) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${1.75}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, T = {
  search: _('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  close: _('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: _('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  chevronDown: _('<path d="m6 9 6 6 6-6"/>'),
  chevronRight: _('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: _('<path d="m15 18-6-6 6-6"/>'),
  sun: _('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: _('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  copy: _('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  check: _('<path d="M20 6 9 17l-5-5"/>'),
  /** Closed padlock — requires auth (red) */
  lock: _('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>'),
  /** Open padlock — auth configured (green) */
  unlock: _('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M16 11V7a4 4 0 1 0-8 0v1"/>'),
  send: _('<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>'),
  key: _('<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>'),
  globe: _('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  server: _('<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>'),
  warning: _('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  settings: _('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>')
};
class hi {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map(), this.cleanupFns = [];
  }
  /** Register a named reactive handler that runs on every state change */
  on(t, n) {
    this.handlers.set(t, n);
  }
  /** Register a cleanup callback (runs on dispose) */
  onCleanup(t) {
    this.cleanupFns.push(t);
  }
  /** Run all registered handlers with current state */
  notify(t) {
    for (const n of this.handlers.values())
      try {
        n(t);
      } catch (a) {
        console.error("[Effects] handler error:", a);
      }
  }
  /** Dispose: run cleanups and clear all handlers */
  dispose() {
    for (const t of this.cleanupFns)
      try {
        t();
      } catch {
      }
    this.cleanupFns.length = 0, this.handlers.clear();
  }
}
let Fe = null;
function Ee() {
  return Fe || (Fe = new hi()), Fe;
}
function gi(e) {
  Fe?.notify(e);
}
function Ar() {
  Fe?.dispose(), Fe = null;
}
function vi(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function ve(e) {
  return vi(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function Er(e) {
  return String(e || "").replace(/\/$/, "");
}
function Se(e) {
  return Er(e).replace(/^https?:\/\//i, "");
}
function yi(e) {
  return Er(ve(e));
}
function ze(e) {
  return Se(ve(e));
}
function Nt(e) {
  const { options: t, value: n, ariaLabel: a, onChange: r, className: o, variant: i = "default", invalid: s, dataAttrs: l } = e, u = document.createElement("select");
  i === "inline" && u.setAttribute("data-variant", "inline");
  const d = [];
  if (s && d.push("invalid"), o && d.push(o), u.className = d.join(" "), a && u.setAttribute("aria-label", a), l)
    for (const [p, m] of Object.entries(l))
      u.dataset[p] = m;
  for (const p of t) {
    const m = document.createElement("option");
    m.value = p.value, m.textContent = p.label, n !== void 0 && p.value === n && (m.selected = !0), u.appendChild(m);
  }
  return r && u.addEventListener("change", () => r(u.value)), u;
}
function Ae(e) {
  const {
    type: t = "text",
    placeholder: n,
    value: a,
    ariaLabel: r,
    required: o,
    readOnly: i,
    invalid: s,
    modifiers: l,
    dataAttrs: u,
    className: d,
    onInput: p,
    onChange: m
  } = e, f = document.createElement("input");
  f.type = t, f.setAttribute("autocomplete", "off");
  const h = [];
  if (l?.includes("filled") && h.push("filled"), s && h.push("invalid"), d && h.push(d), f.className = h.join(" "), n && (f.placeholder = n), a !== void 0 && (f.value = a), r && f.setAttribute("aria-label", r), o && (f.required = !0), i && (f.readOnly = !0), u)
    for (const [v, y] of Object.entries(u))
      f.dataset[v] = y;
  return p && f.addEventListener("input", () => p(f.value)), m && f.addEventListener("change", () => m(f.value)), f;
}
const bi = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function xi(e = "secondary") {
  return ["btn", ...bi[e]];
}
function ue(e) {
  const { variant: t = "secondary", label: n, icon: a, ariaLabel: r, disabled: o, className: i, onClick: s } = e, l = document.createElement("button");
  l.type = "button";
  const u = xi(t);
  if (i && u.push(...i.split(/\s+/).filter(Boolean)), l.className = u.join(" "), a) {
    const d = document.createElement("span");
    d.className = "btn-icon-slot", d.innerHTML = a, l.appendChild(d);
  }
  if (n) {
    const d = document.createElement("span");
    d.textContent = n, l.appendChild(d);
  }
  return r && l.setAttribute("aria-label", r), o && (l.disabled = !0), s && l.addEventListener("click", s), l;
}
function Lr(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : e === "primary" ? "u-text-accent" : `u-text-${e}`;
}
function mn(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : e === "primary" ? "u-bg-accent-soft" : `u-bg-${e}-soft`;
}
function ki(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function Or(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function Ci(e, t) {
  return e.color ? e.color : t === "method" ? ki(e.method || e.text) : t === "status" ? Or(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function N(e) {
  const t = document.createElement("span"), n = e.kind || "chip", a = Ci(e, n), o = ["badge", e.size || "m"];
  return n === "status" && o.push("status"), n === "required" && o.push("required"), o.push(Lr(a), mn(a)), e.className && o.push(e.className), t.className = o.join(" "), t.textContent = e.text, t;
}
function St(e, t) {
  const n = t?.active ?? !1, a = t?.context ?? !1, r = document.createElement("button");
  return r.type = "button", r.className = `badge m interactive${n ? " is-active" : ""}`, a && (r.dataset.badgeContext = "true"), r.textContent = e, r;
}
function Tr(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const a = Or(e), r = ["badge", "status", "m", "interactive", Lr(a)];
  return t && r.push("is-active", mn(a)), n.className = r.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = a, n.textContent = e, n;
}
function At(e, t) {
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
  e.classList.add(mn(n));
}
function ne(e) {
  const { simple: t, interactive: n, active: a, className: r, onClick: o } = e || {}, i = document.createElement("div"), s = ["card"];
  return t && s.push("simple"), n && s.push("interactive"), a && s.push("active"), r && s.push(r), i.className = s.join(" "), o && (i.classList.contains("interactive") || i.classList.add("interactive"), i.addEventListener("click", o)), i;
}
function jt(...e) {
  const t = document.createElement("div");
  t.className = "card-head";
  for (const n of e)
    if (typeof n == "string") {
      const a = document.createElement("span");
      a.textContent = n, t.append(a);
    } else
      t.append(n);
  return t;
}
function We(e) {
  const t = document.createElement("div"), n = ["card-content"];
  return n.push("flush"), t.className = n.join(" "), t;
}
function Mn(e) {
  if (typeof e == "string" || typeof e == "number") {
    const t = document.createElement("span");
    return t.textContent = String(e), t;
  }
  return e;
}
function wi(e) {
  const t = document.createElement("div");
  if (t.className = `card-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append(Mn(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? N({ text: String(e.trailing), kind: "chip", size: "m" }) : Mn(e.trailing);
    t.append(n);
  }
  return t;
}
function Ni(e) {
  return typeof e == "string" ? c("span", { textContent: e }) : e;
}
function qr(e) {
  return c("h2", { textContent: e });
}
function it(e, t) {
  const n = c("div", { className: "section-head" });
  return n.append(typeof e == "string" ? qr(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? N({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function D(e, ...t) {
  const n = c("div", { className: `block section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(it(e.title, e.badge)) : n.append(qr(e.title)));
  for (const a of t) n.append(Ni(a));
  return n;
}
function Ve(e, t) {
  const n = c("nav", {
    className: `breadcrumb${t?.className ? ` ${t.className}` : ""}`,
    "aria-label": "Breadcrumb"
  }), a = c("div", { className: "breadcrumb-main" });
  return t?.leading?.length && a.append(...t.leading), e.forEach((r, o) => {
    if (o > 0 && a.append(c("span", { className: "breadcrumb-sep", textContent: "/" })), r.href || r.onClick) {
      const i = c("a", {
        className: `breadcrumb-item${r.className ? ` ${r.className}` : ""}`,
        href: r.href || "#",
        textContent: r.label
      });
      r.onClick && i.addEventListener("click", r.onClick), a.append(i);
      return;
    }
    a.append(c("span", {
      className: r.className || "breadcrumb-segment",
      textContent: r.label
    }));
  }), n.append(a), t?.trailing?.length && n.append(c("div", { className: "breadcrumb-trailing" }, ...t.trailing)), n;
}
function Bt(e) {
  const { configured: t, variant: n = "tag", label: a, title: r } = e, o = a || r, i = t ? T.unlock : T.lock, s = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-meta-icon", l = n !== "endpoint" ? ` ${s}--${t ? "configured" : "required"}` : "";
  return c("span", {
    className: `${s}${l}`.trim(),
    innerHTML: i,
    ...o ? { "aria-label": o } : {}
  });
}
function Ir(e) {
  const t = c("div", { className: e.overlayClass });
  t.setAttribute(e.dataOverlayAttr, "true");
  const n = c("div", {
    className: e.modalClass,
    role: e.role || "dialog",
    "aria-label": e.ariaLabel,
    "aria-modal": "true"
  });
  t.append(n);
  let a = !1;
  const r = () => {
    a || (a = !0, t.remove(), e.onClose?.());
  };
  return t.addEventListener("click", (o) => {
    o.target === t && r();
  }), t.addEventListener("keydown", (o) => {
    o.key === "Escape" && (o.preventDefault(), r());
  }, !0), {
    overlay: t,
    modal: n,
    mount: (o) => {
      (o || document.querySelector(".root") || document.body).appendChild(t);
    },
    close: r
  };
}
let _e = null, Qt = null;
function $r() {
  Qt?.(), Qt = null;
}
function Wt() {
  $r(), _e && _e.close(), _e = null;
}
function Si(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function Ai(e) {
  return ln(e);
}
function dt(e) {
  requestAnimationFrame(() => e.focus());
}
function Vt(e, t) {
  const n = c("div", { className: "modal field" });
  return n.append(c("label", { className: "modal label", textContent: e }), t), n;
}
function tt(e) {
  return Ae({
    className: "modal input",
    placeholder: e.placeholder,
    value: e.value,
    ariaLabel: e.ariaLabel,
    type: e.type
  });
}
function Ei(e) {
  try {
    const t = new TextEncoder().encode(e);
    let n = "";
    return t.forEach((a) => {
      n += String.fromCharCode(a);
    }), btoa(n);
  } catch {
    return btoa(unescape(encodeURIComponent(e)));
  }
}
function Li(e) {
  try {
    const t = atob(e), n = Uint8Array.from(t, (a) => a.charCodeAt(0));
    return new TextDecoder().decode(n);
  } catch {
    try {
      return decodeURIComponent(escape(atob(e)));
    } catch {
      return "";
    }
  }
}
function Oi(e) {
  if (!e) return { username: "", password: "" };
  try {
    const n = Li(e).split(":");
    return {
      username: n[0] || "",
      password: n.slice(1).join(":") || ""
    };
  } catch {
    return { username: "", password: "" };
  }
}
function Yt(e, t, n) {
  W(n);
  const a = k.get().auth.schemes[e] || "", r = t.type, o = (t.scheme || "").toLowerCase();
  if (r === "http" && o === "bearer") {
    const i = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = tt({
      placeholder: "Bearer token...",
      value: a,
      ariaLabel: "Bearer token",
      type: "password"
    }), u = ue({
      variant: "icon",
      icon: T.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => k.setSchemeValue(e, l.value)), s.append(l, u), i.append(c("label", { className: "modal label", textContent: "Token" }), s), n.append(i), dt(l);
  } else if (r === "http" && o === "basic") {
    const i = Oi(a), s = tt({
      placeholder: "Username",
      value: i.username,
      ariaLabel: "Username"
    });
    n.append(Vt("Username", s));
    const l = tt({
      placeholder: "Password",
      value: i.password,
      ariaLabel: "Password",
      type: "password"
    });
    n.append(Vt("Password", l));
    const u = () => {
      const d = `${s.value}:${l.value}`, p = d === ":" ? "" : Ei(d);
      k.setSchemeValue(e, p);
    };
    s.addEventListener("input", u), l.addEventListener("input", u), dt(s);
  } else if (r === "apiKey") {
    const i = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = tt({
      placeholder: `${t.name || "API key"}...`,
      value: a,
      ariaLabel: "API key",
      type: "password"
    }), u = ue({
      variant: "icon",
      icon: T.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => {
      k.setSchemeValue(e, l.value);
    }), s.append(l, u), i.append(c("label", { className: "modal label", textContent: `API Key (${t.name || "key"})` }), s), n.append(i), dt(l);
  } else {
    const i = tt({
      placeholder: "Token...",
      value: a,
      ariaLabel: "Token",
      type: "password"
    });
    i.addEventListener("input", () => {
      k.setSchemeValue(e, i.value);
    }), n.append(Vt("Token / Credential", i)), dt(i);
  }
}
function hn(e, t, n) {
  _e && Wt();
  const a = Object.entries(e);
  if (a.length === 0) return;
  const r = Ir({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Authentication Settings",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      $r(), _e = null;
    }
  });
  _e = r;
  const o = r.modal, i = c("div", { className: "modal header" });
  i.append(c("h2", { className: "modal title", textContent: "Authentication" }));
  const s = ue({ variant: "icon", icon: T.close, ariaLabel: "Close", onClick: Wt });
  i.append(s), o.append(i);
  const l = c("div", { className: "modal body" });
  let u = n || k.get().auth.activeScheme || a[0][0];
  e[u] || (u = a[0][0]);
  const d = c("div", { className: "modal fields" });
  if (a.length > 1) {
    const b = c("div", { className: "modal tabs" }), g = /* @__PURE__ */ new Map(), A = [], O = (x, L, C) => {
      const w = Mt(L);
      if (x.setAttribute("data-configured", w ? "true" : "false"), W(x), w) {
        const $ = c("span", { className: "modal tab-check", "aria-hidden": "true" });
        $.innerHTML = T.check, x.append($);
      }
      x.append(c("span", { className: "modal tab-label", textContent: Ai(C) }));
    };
    for (const [x, L] of a) {
      const C = c("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": x === u ? "true" : "false"
      });
      O(C, x, L), C.addEventListener("click", () => {
        if (u !== x) {
          u = x;
          for (const w of A) w.setAttribute("aria-pressed", "false");
          C.setAttribute("aria-pressed", "true"), m(), Yt(x, L, d);
        }
      }), g.set(x, C), A.push(C), b.append(C);
    }
    Qt = k.subscribe(() => {
      for (const [x, L] of a) {
        const C = g.get(x);
        C && O(C, x, L);
      }
    }), l.append(b);
  }
  const p = c("div", { className: "modal scheme-desc" });
  function m() {
    const b = e[u];
    if (!b) return;
    W(p);
    const g = c("div", { className: "modal scheme-title", textContent: Si(b) });
    p.append(g), b.description && p.append(c("div", { className: "modal scheme-text", textContent: b.description }));
  }
  m(), l.append(p);
  const f = e[u];
  f && Yt(u, f, d), l.append(d), o.append(l);
  const h = c("div", { className: "modal footer" }), v = ue({
    variant: "ghost",
    label: "Reset",
    onClick: () => {
      k.setSchemeValue(u, "");
      const b = e[u];
      b && Yt(u, b, d);
    }
  }), y = ue({ variant: "primary", label: "Done", onClick: Wt });
  h.append(v, c("div", { className: "grow" }), y), o.append(h), r.mount(t ?? document.querySelector(".root") ?? document.body);
}
function Mt(e) {
  return !!k.get().auth.schemes[e];
}
function Pt(e, t) {
  const n = st(e, t), a = k.get().auth, r = It(n, a.schemes, a.activeScheme, a.token);
  return Object.keys(r.headers).length > 0 || Object.keys(r.query).length > 0 || Object.keys(r.cookies).length > 0;
}
function gn(e, t) {
  const n = st(e, t), a = k.get().auth;
  return It(n, a.schemes, a.activeScheme, a.token).headers;
}
function Ti(e, t) {
  const n = st(e, t), a = k.get().auth;
  return It(n, a.schemes, a.activeScheme, a.token).query;
}
function qi(e, t) {
  const n = st(e, t), a = k.get().auth;
  return It(n, a.schemes, a.activeScheme, a.token).cookies;
}
function vn(e, t) {
  const n = st(e, t);
  return aa(n);
}
function st(e, t) {
  if (e)
    return Array.isArray(e) ? cn(e, t, !1) : e;
}
let ce = -1, Et = null, Ie = null;
function jr() {
  Lt();
  const e = Ir({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      Et = null, k.set({ searchOpen: !1 });
    }
  });
  Et = e;
  const t = e.modal, n = c("div", { className: "search-input-wrap" });
  n.innerHTML = T.search;
  const a = Ae({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), r = c("kbd", { textContent: "ESC", className: "kbd" });
  n.append(a, r), t.append(n);
  const o = c("div", { className: "search-results", role: "listbox" }), i = c("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  o.append(i), t.append(o);
  const s = c("div", { className: "search-footer" });
  s.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(s), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => a.focus()), ce = -1;
  let l = [];
  a.addEventListener("input", () => {
    const u = a.value;
    l = li(u), Ii(o, l), vt(o, l.length > 0 ? 0 : -1);
  }), a.addEventListener("keydown", (u) => {
    const d = u;
    d.key === "ArrowDown" ? (d.preventDefault(), l.length > 0 && vt(o, Math.min(ce + 1, l.length - 1))) : d.key === "ArrowUp" ? (d.preventDefault(), l.length > 0 && vt(o, Math.max(ce - 1, 0))) : d.key === "Enter" ? (d.preventDefault(), ce >= 0 && ce < l.length && Br(l[ce])) : d.key === "Escape" && (d.preventDefault(), Lt());
  });
}
function Lt() {
  if (Et) {
    Et.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), k.set({ searchOpen: !1 });
}
function Ii(e, t) {
  if (W(e), t.length === 0) {
    e.append(c("div", { className: "search-empty", textContent: "No results found" }));
    return;
  }
  const n = document.createDocumentFragment();
  t.forEach((a, r) => {
    const o = c("div", {
      className: "search-result",
      role: "option",
      "aria-selected": "false",
      "data-index": String(r)
    });
    a.method ? o.append(N({
      text: a.method.toUpperCase(),
      kind: "method",
      method: a.method
    })) : a.type === "schema" ? o.append(N({ text: "SCH", kind: "chip", size: "m" })) : a.type === "tag" && o.append(N({ text: "TAG", kind: "chip", size: "m" }));
    const i = c("div", { className: "search-result-info min-w-0" });
    if (i.append(c("span", { className: "search-result-title", textContent: a.title })), a.subtitle && i.append(c("span", { className: "search-result-subtitle", textContent: a.subtitle })), o.append(i), a.method && a.requiresAuth && a.resolvedSecurity) {
      const s = k.get().spec, l = Pt(a.resolvedSecurity, s?.securitySchemes || {});
      o.append(c("span", {
        className: `search-result-lock search-result-lock--${l ? "configured" : "required"}`,
        innerHTML: l ? T.unlock : T.lock,
        "aria-label": a.authTitle || "Requires authentication"
      }));
    }
    o.addEventListener("click", () => Br(a)), o.addEventListener("mouseenter", () => {
      vt(e, r);
    }), n.append(o);
  }), e.append(n);
}
function vt(e, t) {
  if (ce === t) return;
  if (ce >= 0) {
    const a = e.querySelector(`.search-result[data-index="${ce}"]`);
    a && (a.classList.remove("focused"), a.setAttribute("aria-selected", "false"));
  }
  if (ce = t, t < 0) return;
  const n = e.querySelector(`.search-result[data-index="${t}"]`);
  n && (n.classList.add("focused"), n.setAttribute("aria-selected", "true"), n.scrollIntoView({ block: "nearest" }));
}
function Br(e) {
  Lt(), e.type === "operation" ? P(H({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? P(H({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? P(H({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && P(H({ type: "webhook", webhookName: e.webhookName }));
}
function $i() {
  return Ie && document.removeEventListener("keydown", Ie), Ie = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), k.get().searchOpen ? Lt() : (k.set({ searchOpen: !0 }), jr()));
  }, document.addEventListener("keydown", Ie), () => {
    Ie && (document.removeEventListener("keydown", Ie), Ie = null);
  };
}
function ji(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let a = null;
  for (const s of n) {
    const l = s, u = Di(l), d = l.getAttribute("href");
    if (!d && !u) continue;
    const p = d?.startsWith("#") ? d.slice(1) : d || "", m = u || ar(p), f = Ye(m, t);
    s.classList.toggle("active", f), f ? (l.setAttribute("aria-current", "page"), a = l) : l.removeAttribute("aria-current");
  }
  const r = a ? a.closest(".nav-group") : null;
  if (r) {
    const s = r.querySelector(".nav-group-header"), l = r.querySelector(".nav-group-items");
    s instanceof HTMLElement && l instanceof HTMLElement && ie(s, l, !0);
  }
  const o = t.type === "endpoint" || t.type === "tag" ? t.tag : null, i = t.type === "schema" ? "schemas" : t.type === "webhook" ? "webhooks" : o ? te(o) : null;
  if (i) {
    const s = e.querySelector(`[data-nav-tag="${CSS.escape(i)}"]`);
    if (s) {
      const l = s.querySelector(".nav-group-header"), u = s.querySelector(".nav-group-items");
      l instanceof HTMLElement && u instanceof HTMLElement && ie(l, u, !0);
    }
  }
  a && requestAnimationFrame(() => {
    const l = a.closest(".nav-group")?.querySelector(".nav-group-header");
    l ? l.scrollIntoView({ block: "start", behavior: "smooth" }) : a.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function Bi(e) {
  const t = k.get(), n = t.spec;
  if (!n) return;
  const a = n.securitySchemes || {}, r = e.querySelector("[data-sidebar-auth-btn]");
  if (r) {
    const l = Object.keys(a), u = t.auth.activeScheme || l[0] || "", d = Mt(u);
    r.innerHTML = d ? T.unlock : T.lock, r.classList.toggle("active", d);
  }
  const o = e.querySelectorAll("[data-lock-slot]"), i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of n.operations)
    l.operationId && i.set(l.operationId, l), s.set(`${l.method.toLowerCase()} ${l.path}`, l);
  for (const l of o) {
    const u = l.closest(".nav-item");
    if (!u) continue;
    const d = u.dataset.routeOperationId, p = u.dataset.routeMethod, m = u.dataset.routePath, f = d && i.get(d) || (p && m ? s.get(`${p.toLowerCase()} ${m}`) : null);
    if (!f) continue;
    const h = Pt(f.resolvedSecurity, a), v = Bt({
      configured: h,
      variant: "nav",
      title: De(f.resolvedSecurity)
    });
    l.innerHTML = "", l.append(v);
  }
}
function Mi(e, t) {
  const n = k.get(), a = n.spec;
  if (!a) return;
  W(e);
  const r = t.title || a.info.title || "API Docs", o = a.info.version ? `v${a.info.version}` : "", i = c("div", { className: "top" }), s = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  s.innerHTML = T.chevronLeft, s.addEventListener("click", () => k.set({ sidebarOpen: !1 }));
  const l = c("a", { className: "title", href: "/", textContent: r });
  l.addEventListener("click", (x) => {
    x.preventDefault(), P("/");
  });
  const u = c("div", { className: "title-wrap" });
  if (u.append(l), o && u.append(c("span", { className: "version", textContent: o })), i.append(s, u), a.securitySchemes && Object.keys(a.securitySchemes).length > 0) {
    const x = Object.keys(a.securitySchemes), L = n.auth.activeScheme || x[0] || "", C = Mt(L), w = c("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication",
      "data-sidebar-auth-btn": ""
    });
    w.innerHTML = C ? T.unlock : T.lock, w.classList.toggle("active", C), w.addEventListener("click", () => {
      const I = k.get().auth.activeScheme || x[0] || "";
      hn(
        a.securitySchemes,
        e.closest(".root") ?? void 0,
        I
      );
    }), i.append(w);
  }
  const d = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (d.innerHTML = k.get().theme === "light" ? T.moon : T.sun, d.addEventListener("click", () => {
    ui(), d.innerHTML = k.get().theme === "light" ? T.moon : T.sun;
  }), e.append(i), n.environments.length > 1) {
    const x = zi(n);
    e.append(x);
  }
  const p = c("div", { className: "search" }), m = c("span", { className: "search-icon", innerHTML: T.search }), f = Ae({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), h = c("span", { className: "kbd", textContent: "⌘K" });
  f.addEventListener("focus", () => {
    k.set({ searchOpen: !0 }), f.blur(), jr();
  }), p.append(m, f, h), e.append(p);
  const v = c("nav", { className: "nav", "aria-label": "API navigation" }), y = Fi({ type: "overview" }, n.route);
  v.append(y);
  for (const x of a.tags) {
    if (x.operations.length === 0) continue;
    const L = Pi(x, n.route);
    v.append(L);
  }
  if (a.webhooks && a.webhooks.length > 0) {
    const x = c("div", { className: "nav-group", "data-nav-tag": "webhooks" }), L = { type: "webhook" }, C = Pn("Webhooks", a.webhooks.length, L, n.route), w = c("div", { className: "nav-group-items collapsed" });
    for (const R of a.webhooks) {
      const G = { type: "webhook", webhookName: R.name }, Z = Fn(R.summary || R.name, R.method, G, n.route);
      Z.classList.add("nav-item-webhook"), w.append(Z);
    }
    C.addEventListener("click", (R) => {
      R.target.closest(".nav-group-link") || ie(C, w);
    });
    const $ = C.querySelector(".nav-group-link");
    $ && $.addEventListener("click", () => ie(C, w, !0), { capture: !0 });
    const I = n.route.type === "webhook";
    ie(C, w, I, { instant: !0 }), x.append(C, w), v.append(x);
  }
  const b = Object.keys(a.schemas);
  if (b.length > 0) {
    const x = c("div", { className: "nav-group" }), L = { type: "schema" }, C = Pn("Schemas", b.length, L, n.route), w = c("div", { className: "nav-group-items collapsed" });
    for (const R of b) {
      const Z = Fn(R, void 0, { type: "schema", schemaName: R }, n.route);
      w.append(Z);
    }
    C.addEventListener("click", (R) => {
      R.target.closest(".nav-group-link") || ie(C, w);
    });
    const $ = C.querySelector(".nav-group-link");
    $ && $.addEventListener("click", () => ie(C, w, !0), { capture: !0 });
    const I = n.route.type === "schema";
    ie(C, w, I, { instant: !0 }), x.setAttribute("data-nav-tag", "schemas"), x.append(C, w), v.append(x);
  }
  e.append(v);
  const g = c("div", { className: "footer" }), A = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "PureDocs"
  });
  A.innerHTML = `<svg viewBox="0 0 593 465" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,465) scale(0.1,-0.1)" fill="currentColor" stroke="none">
      <path d="M895 4308 c-41 -15 -105 -56 -128 -82 -10 -12 -28 -41 -40 -66 l-22 -45 -3 -983 c-2 -618 1 -983 7 -980 5 1 66 37 135 78 l126 75 1 335 c1 184 3 570 4 857 4 588 1 569 78 604 40 18 83 19 1140 19 l1097 0 0 -192 c0 -106 3 -264 7 -351 7 -173 14 -195 76 -241 27 -20 43 -21 385 -26 l357 -5 3 -1363 c2 -1336 2 -1365 -18 -1408 -34 -78 22 -74 -962 -74 l-873 0 -50 -26 c-28 -15 -109 -60 -181 -101 l-131 -74 -287 -1 -287 -2 -29 30 c-16 16 -51 58 -77 92 -45 59 -63 73 -278 201 l-230 137 -3 -175 c-2 -142 0 -184 13 -218 21 -54 84 -119 143 -146 l47 -22 1640 0 1640 0 51 27 c27 14 67 45 87 67 71 79 67 -20 67 1607 0 804 -3 1475 -6 1491 -4 23 -122 147 -474 502 l-467 471 -1264 -1 c-877 0 -1273 -4 -1294 -11z"/>
      <path d="M5361 3645 c-2 -51 -36 -167 -69 -231 -64 -126 -193 -201 -407 -237 -11 -2 10 -9 46 -15 239 -43 359 -147 414 -357 8 -32 15 -74 15 -93 0 -19 4 -31 10 -27 6 3 10 18 10 32 0 48 32 157 62 215 62 116 174 191 343 227 50 10 78 19 64 20 -44 2 -180 41 -232 67 -113 58 -185 161 -223 319 -9 39 -20 79 -25 90 -6 17 -8 15 -8 -10z"/>
      <path d="M1354 3527 c-3 -8 -4 -45 -2 -83 l3 -69 743 -3 742 -2 0 85 0 85 -740 0 c-612 0 -742 -2 -746 -13z"/>
      <path d="M1350 3005 l0 -75 1185 0 1186 0 -3 68 -3 67 -120 6 c-66 4 -598 7 -1182 8 l-1063 1 0 -75z"/>
      <path d="M2033 2638 c-6 -7 -41 -137 -78 -288 -79 -327 -349 -1427 -405 -1656 -22 -89 -40 -170 -40 -181 0 -23 -11 -20 208 -49 115 -16 134 -16 146 -3 7 7 35 102 61 209 26 107 87 359 136 560 49 201 125 514 169 695 44 182 96 393 115 469 21 87 30 146 25 155 -7 13 -150 58 -311 97 -9 3 -21 -1 -26 -8z"/>
      <path d="M4810 2585 c0 -28 -34 -68 -73 -85 l-38 -17 30 -12 c36 -16 66 -47 82 -86 l12 -30 8 29 c10 36 42 71 80 87 l30 12 -38 17 c-39 17 -73 57 -73 85 0 8 -4 15 -10 15 -5 0 -10 -7 -10 -15z"/>
      <path d="M2706 2230 c-48 -58 -136 -197 -136 -217 0 -20 121 -106 587 -416 84 -56 153 -106 153 -110 0 -4 -34 -29 -75 -55 -68 -43 -272 -171 -510 -321 -49 -32 -150 -95 -222 -141 -73 -46 -133 -88 -133 -93 0 -5 35 -63 77 -129 52 -80 84 -120 99 -124 23 -6 174 85 739 441 182 115 345 216 438 273 77 47 107 83 107 132 0 22 -5 50 -11 64 -7 15 -77 69 -173 134 -843 570 -877 592 -898 592 -9 0 -28 -14 -42 -30z"/>
      <path d="M1205 2171 c-145 -90 -429 -266 -510 -316 -374 -230 -527 -328 -544 -349 -7 -8 -15 -34 -18 -57 -9 -61 17 -102 91 -146 67 -40 298 -183 650 -403 298 -185 323 -200 346 -200 22 0 160 211 160 245 0 12 -8 29 -17 38 -18 15 -433 278 -610 386 -51 30 -93 58 -93 61 0 5 526 336 710 447 36 22 66 47 68 55 2 9 -30 69 -70 134 -65 105 -77 119 -103 122 -17 1 -43 -6 -60 -17z"/>
    </g>
  </svg>`, A.addEventListener("click", () => {
    window.open("https://puredocs.dev", "_blank", "noopener,noreferrer");
  });
  const O = c("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  O.textContent = `puredocs.dev${o ? ` ${o}` : ""}`, g.append(A, O), g.append(d), e.append(g), requestAnimationFrame(() => {
    const x = v.querySelector(".nav-item.active");
    if (x) {
      const C = x.closest(".nav-group")?.querySelector(".nav-group-header");
      C ? C.scrollIntoView({ block: "start", behavior: "smooth" }) : x.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function Pi(e, t, n) {
  const a = c("div", { className: "nav-group", "data-nav-tag": te(e.name) }), r = Ri(e, t), o = c("div", { className: "nav-group-items collapsed" }), i = te(e.name), s = t.type === "tag" && te(t.tag || "") === i || e.operations.some((u) => Ye(en(u, e.name), t));
  for (const u of e.operations) {
    const d = en(u, e.name), p = _i(u, d, t);
    o.append(p);
  }
  r.addEventListener("click", (u) => {
    u.target.closest(".nav-group-link") || ie(r, o);
  });
  const l = r.querySelector(".nav-group-link");
  return l && l.addEventListener("click", (u) => {
    ie(r, o, !0);
  }, { capture: !0 }), ie(r, o, s, { instant: !0 }), a.append(r, o), a;
}
function Ri(e, t) {
  const n = te(e.name), a = t.type === "tag" && te(t.tag || "") === n || e.operations.some((s) => Ye(en(s, e.name), t)), r = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(a), tabIndex: 0 }), o = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": a ? "Collapse" : "Expand"
  });
  o.innerHTML = T.chevronRight, o.addEventListener("click", (s) => {
    s.preventDefault(), s.stopPropagation(), r.click();
  });
  const i = c("a", {
    className: "nav-group-link",
    href: H({ type: "tag", tag: e.name })
  });
  return i.append(
    c("span", { className: "nav-group-title", textContent: e.name }),
    c("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), i.addEventListener("click", (s) => {
    s.preventDefault(), P(H({ type: "tag", tag: e.name }));
  }), r.append(o, i), r.addEventListener("keydown", (s) => {
    (s.key === "Enter" || s.key === " ") && (s.preventDefault(), o.click());
  }), r;
}
function Pn(e, t, n, a) {
  const r = a.type === n.type, o = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(r), tabIndex: 0 }), i = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": r ? "Collapse" : "Expand"
  });
  i.innerHTML = T.chevronRight, i.addEventListener("click", (l) => {
    l.preventDefault(), l.stopPropagation(), o.click();
  });
  const s = c("a", {
    className: "nav-group-link",
    href: H(n)
  });
  return s.append(
    c("span", { className: "nav-group-title", textContent: e }),
    c("span", { className: "nav-group-count", textContent: String(t) })
  ), s.addEventListener("click", (l) => {
    l.preventDefault(), P(H(n));
  }), o.append(i, s), o.addEventListener("keydown", (l) => {
    (l.key === "Enter" || l.key === " ") && (l.preventDefault(), i.click());
  }), o;
}
const Rn = 260, Hn = "cubic-bezier(0.25, 0.8, 0.25, 1)", xe = /* @__PURE__ */ new WeakMap();
function ie(e, t, n = !e.classList.contains("expanded"), a = {}) {
  if (e.classList.contains("expanded") === n) return;
  const o = xe.get(t);
  if (o && (o.cancel(), xe.delete(t)), e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), Hi(e, n), a.instant) {
    t.classList.toggle("collapsed", !n), t.style.maxHeight = "", t.style.overflow = "";
    return;
  }
  if (n) {
    t.classList.remove("collapsed"), t.style.maxHeight = "none", t.style.overflow = "hidden";
    const i = t.scrollHeight;
    t.style.maxHeight = "0";
    const s = t.animate(
      [{ maxHeight: "0px" }, { maxHeight: `${i}px` }],
      { duration: Rn, easing: Hn, fill: "forwards" }
    );
    xe.set(t, s), s.finished.then(() => {
      xe.delete(t), t.style.maxHeight = "", t.style.overflow = "";
    }).catch(() => {
      xe.delete(t);
    });
  } else {
    t.classList.remove("collapsed");
    const i = t.scrollHeight;
    t.style.maxHeight = `${i}px`, t.style.overflow = "hidden";
    const s = t.animate(
      [{ maxHeight: `${i}px` }, { maxHeight: "0px" }],
      { duration: Rn, easing: Hn, fill: "forwards" }
    );
    xe.set(t, s), s.finished.then(() => {
      xe.delete(t), t.style.maxHeight = "", t.style.overflow = "", t.classList.add("collapsed");
    }).catch(() => {
      xe.delete(t);
    });
  }
}
function Hi(e, t) {
  const n = e.querySelector(".nav-group-chevron");
  n instanceof HTMLElement && n.setAttribute("aria-label", t ? "Collapse" : "Expand");
}
function Fn(e, t, n, a) {
  const r = Ye(n, a), o = c("a", {
    className: `nav-item${r ? " active" : ""}`,
    href: H(n),
    role: "link",
    "aria-current": r ? "page" : void 0
  }), i = N(t ? {
    text: t.toUpperCase(),
    kind: "method",
    method: t
  } : {
    text: "GET",
    kind: "method",
    method: "get",
    className: "placeholder"
  });
  return t || i.setAttribute("aria-hidden", "true"), o.append(i), o.append(c("span", { className: "nav-item-label", textContent: e })), o.addEventListener("click", (s) => {
    s.preventDefault(), P(H(n));
  }), o;
}
function Fi(e, t) {
  const n = Ye(e, t), a = c("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: H(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), r = c("span", { className: "nav-overview-icon-slot" });
  r.innerHTML = T.globe;
  const o = c("span", { className: "nav-item-label", textContent: "Overview" });
  return a.append(r, o), a.addEventListener("click", (i) => {
    i.preventDefault(), P(H(e));
  }), a;
}
function _i(e, t, n) {
  const a = Ye(t, n), r = c("a", {
    className: `nav-item${a ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: H(t),
    "aria-current": a ? "page" : void 0
  });
  r.dataset.routeType = "endpoint", t.operationId && (r.dataset.routeOperationId = t.operationId), t.method && (r.dataset.routeMethod = t.method), t.path && (r.dataset.routePath = t.path), t.tag && (r.dataset.routeTag = t.tag);
  const o = k.get().spec, i = U(e.resolvedSecurity), s = i ? Bt({
    configured: Pt(e.resolvedSecurity, o?.securitySchemes || {}),
    variant: "nav",
    title: De(e.resolvedSecurity)
  }) : null, l = i ? c("span", { "data-lock-slot": "" }) : null;
  return l && s && l.append(s), r.append(
    N({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    c("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...l ? [l] : []
  ), r.addEventListener("click", (u) => {
    u.preventDefault(), P(H(t));
  }), r;
}
function en(e, t) {
  return {
    type: "endpoint",
    tag: t,
    method: e.method,
    path: e.path,
    operationId: e.operationId
  };
}
function Ye(e, t) {
  if (e.type !== t.type) return !1;
  if (e.type === "overview") return !0;
  if (e.type === "tag") return te(e.tag || "") === te(t.tag || "");
  if (e.type === "endpoint") {
    if (e.operationId && t.operationId) return e.operationId === t.operationId;
    const n = (e.method || "").toLowerCase(), a = (t.method || "").toLowerCase();
    return n === a && _n(e.path) === _n(t.path);
  }
  return e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function _n(e) {
  return e && e.replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
}
function Di(e) {
  const { routeType: t } = e.dataset;
  return t && t === "endpoint" ? {
    type: "endpoint",
    operationId: e.dataset.routeOperationId || void 0,
    method: e.dataset.routeMethod || void 0,
    path: e.dataset.routePath || void 0,
    tag: e.dataset.routeTag || void 0
  } : null;
}
function Ui(e) {
  const t = e.querySelector("select.env");
  if (t) {
    const n = k.get().activeEnvironment;
    t.value !== n && (t.value = n);
  }
}
function zi(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((r) => {
    const o = t.find((s) => s.name === r.name), i = Se((o?.baseUrl ?? r.baseUrl) || "");
    return { value: r.name, label: i || "(no URL)" };
  });
  return Nt({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (r) => k.setActiveEnvironment(r),
    className: "env"
  });
}
function Rt(e, t, n = "No operations") {
  const a = c("div", { className: "summary-line" });
  for (const o of e)
    a.append(N({
      text: `${o.value} ${o.label}`,
      kind: "chip",
      size: "m"
    }));
  const r = ["get", "post", "put", "patch", "delete", "head", "options"];
  for (const o of r) {
    const i = t[o] || 0;
    i !== 0 && a.append(N({
      kind: "method",
      method: o,
      size: "m",
      text: `${i} ${o.toUpperCase()}`
    }));
  }
  return a.childNodes.length || a.append(N({
    text: n,
    kind: "chip",
    size: "m"
  })), a;
}
function Wi(e, t) {
  const n = [], a = Vi(e, t);
  return a && n.push(a), n;
}
function Vi(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = D({ title: "Authentication" });
  for (const [a, r] of Object.entries(e)) {
    const o = Mt(a), i = ne({ className: "card-group card-auth" }), s = c("div", { className: "card-auth-main" }), l = c("div", { className: "card-info card-auth-info" }), u = `${r.type}${r.scheme ? ` / ${r.scheme}` : ""}`;
    l.append(
      c("h3", { textContent: a }),
      c("p", { className: "card-auth-type", textContent: u })
    ), r.description && l.append(c("p", { className: "card-auth-desc", textContent: String(r.description) }));
    const d = ue({
      variant: "secondary",
      icon: o ? T.check : T.settings,
      label: o ? "Success" : "Set",
      className: `card-auth-config${o ? " active is-configured" : ""}`,
      onClick: (p) => {
        p.stopPropagation(), hn(e, t, a);
      }
    });
    s.append(l), i.append(s, d), n.append(i);
  }
  return n;
}
async function Dn(e, t) {
  W(e);
  const n = k.get().spec;
  if (!n) return;
  const a = c("div", { className: "block header" }), r = c("div", { className: "title" });
  r.append(
    c("h1", { textContent: n.info.title }),
    c("span", { className: "version", textContent: `v${n.info.version}` })
  ), a.append(r), n.info.description && a.append(c("p", { textContent: n.info.description })), e.append(a);
  const o = n.operations.filter((d) => U(d.resolvedSecurity)).length, i = n.operations.filter((d) => d.deprecated).length, s = Gi(n.operations);
  if (e.append(D(
    { className: "summary" },
    Rt(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: o },
        { label: "Deprecated", value: i }
      ],
      s,
      "No operations"
    )
  )), n.servers.length > 0) {
    const d = D({ title: "Servers" }), p = k.get(), m = p.initialEnvironments || p.environments, f = [];
    for (const v of n.servers) {
      const b = m.find((w) => w.baseUrl === v.url)?.name || "", g = b === p.activeEnvironment, A = ne({
        interactive: !0,
        active: g,
        className: "card-group",
        onClick: () => {
          const w = k.get(), I = (w.initialEnvironments || w.environments).find((R) => R.baseUrl === v.url);
          I && I.name !== w.activeEnvironment && k.setActiveEnvironment(I.name);
        }
      }), O = c("div", { className: "card-info" }), x = c("div", { className: "inline-cluster inline-cluster-sm" }), L = c("span", { className: "icon-muted" });
      L.innerHTML = T.server, x.append(L, c("code", { textContent: v.url })), O.append(x), v.description && O.append(c("p", { textContent: v.description }));
      const C = c("div", { className: "card-badges" });
      A.append(O, C), d.append(A), f.push({ el: A, envName: b });
    }
    const h = (v) => {
      for (const { el: y, envName: b } of f)
        y.classList.toggle("active", b === v.activeEnvironment);
    };
    Ee().on("overview:servers", h), e.append(d);
  }
  const l = e.closest(".root") ?? void 0, u = Wi(n.securitySchemes || {}, l);
  for (const d of u)
    e.append(d);
  if (n.tags.length > 0) {
    const d = D({ title: "API Groups" });
    for (const p of n.tags)
      p.operations.length !== 0 && d.append(Yi(p));
    e.append(d);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const d = D({ title: "Webhooks" });
    for (const p of n.webhooks) {
      const m = ne({
        interactive: !0,
        className: "card-group",
        onClick: () => P(H({ type: "webhook", webhookName: p.name }))
      }), f = c("div", { className: "card-badges" });
      f.append(
        N({ text: "WH", kind: "webhook", size: "s" }),
        N({ text: p.method.toUpperCase(), kind: "method", method: p.method, size: "s" })
      );
      const h = c("div", { className: "card-group-top" });
      h.append(c("h3", { className: "card-group-title", textContent: p.summary || p.name }), f);
      const v = c("p", {
        className: "card-group-description",
        textContent: p.description || `${p.method.toUpperCase()} webhook`
      });
      m.append(h, v), d.append(m);
    }
    e.append(d);
  }
}
function Yi(e) {
  const t = ne({
    interactive: !0,
    className: "card-group",
    onClick: () => P(H({ type: "tag", tag: e.name }))
  }), n = Ki(e), a = c("div", { className: "card-badges" });
  for (const [i, s] of Object.entries(n)) {
    const l = N({
      text: i.toUpperCase(),
      kind: "method",
      method: i,
      size: "m"
    });
    l.textContent = `${s} ${i.toUpperCase()}`, a.append(l);
  }
  const r = c("div", { className: "card-group-top" });
  r.append(c("h3", { className: "card-group-title", textContent: e.name }), a);
  const o = c("p", {
    className: "card-group-description",
    textContent: e.description || `${e.operations.length} endpoints`
  });
  return t.append(r, o), t;
}
function Gi(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Ki(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Ge(e) {
  if (!e) return "any";
  if (e.$ref) return e.$ref.split("/").pop() || "ref";
  let t = e.type || "";
  return e.allOf ? t = "allOf" : e.oneOf ? t = "oneOf" : e.anyOf ? t = "anyOf" : e.enum ? t = "enum" : e.format && (t += `<${e.format}>`), e.type === "array" && e.items && !e.enum && (t = `${e.items.type || e.items.$ref?.split("/").pop() || "any"}[]`), e.nullable && (t += " | null"), t || "object";
}
function Ji(e) {
  const t = c("div", { className: "schema" }), n = c("div", { className: "body" });
  t.append(n);
  const a = [];
  Mr(n, e, "", 0, /* @__PURE__ */ new Set(), a);
  const r = a.length > 0, o = () => a.some(({ children: s }) => s.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const s = !o();
    Hr(a, s);
  }, isExpanded: o, hasExpandable: r };
}
function tn(e, t) {
  const n = ne(), a = Ge(e), r = We(), o = c("div", { className: "schema" }), i = c("div", { className: "body" });
  o.append(i);
  const s = [];
  if (Mr(i, e, "", 0, /* @__PURE__ */ new Set(), s), r.append(o), t) {
    const l = jt(), u = typeof t == "string" ? c("h3", { textContent: t }) : t, d = s.length > 0, p = d && s.some(({ children: h }) => h.style.display !== "none"), m = N({ text: a, kind: "chip", color: "primary", size: "m" }), f = d ? c("button", {
      className: p ? "schema-collapse-btn is-expanded" : "schema-collapse-btn",
      type: "button",
      "aria-label": p ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (f && (f.innerHTML = T.chevronDown, f.addEventListener("click", (h) => {
      h.stopPropagation();
      const v = !f.classList.contains("is-expanded");
      Hr(s, v), f.classList.toggle("is-expanded", v), f.setAttribute("aria-label", v ? "Collapse all fields" : "Expand all fields");
    })), u.classList.contains("card-row"))
      u.classList.add("schema-header-row"), u.append(m), f && u.append(f), l.append(u);
    else {
      const h = c("div", { className: "card-row schema-header-row" });
      h.append(u, m), f && h.append(f), l.append(h);
    }
    n.prepend(l);
  }
  return n.append(r), n;
}
function Zi(e, t) {
  const { headerTitle: n, withEnumAndDefault: a = !0 } = t, r = e.map((u) => {
    const d = c("div", { className: "schema-row role-flat role-params" }), p = c("div", { className: "schema-main-row" }), m = c("div", { className: "schema-name-wrapper" });
    m.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: u.name })
    );
    const f = c("div", { className: "schema-meta-wrapper" });
    f.append(N({
      text: u.schema ? Ge(u.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), u.required && f.append(N({ text: "required", kind: "required", size: "m" })), p.append(m, f), d.append(p);
    const h = c("div", { className: "schema-desc-col is-root" });
    u.description && h.append(c("p", { textContent: u.description }));
    const v = u.schema?.enum, y = u.schema?.default !== void 0;
    if (a && (v && v.length > 0 || y)) {
      const b = c("div", { className: "schema-enum-values" });
      if (y && b.append(N({
        text: `Default: ${JSON.stringify(u.schema.default)}`,
        kind: "chip",
        size: "s"
      })), v)
        for (const g of v) {
          const A = String(g);
          A !== u.in && b.append(N({ text: A, kind: "chip", size: "s" }));
        }
      h.append(b);
    }
    return h.children.length > 0 && d.append(h), d;
  }), o = ne(), i = We(), s = c("div", { className: "params" }), l = c("div", { className: "body role-params" });
  return l.append(...r), s.append(l), i.append(s), o.append(
    jt(wi({ title: n })),
    i
  ), o;
}
function pt(e, t, n, a, r, o, i) {
  const s = Ge(n), l = Xi(n), u = Rr(t, s, n, a, l, r);
  if (e.append(u), l) {
    const d = c("div", { className: "schema-children" });
    d.style.display = "block";
    const p = new Set(o);
    p.add(n), Pr(d, n, a + 1, p, i), e.append(d), i?.push({ row: u, children: d }), u.querySelector(".schema-toggle")?.classList.add("is-expanded"), u.classList.add("focus-ring"), u.setAttribute("aria-expanded", "true"), u.setAttribute("tabindex", "0"), u.addEventListener("click", () => {
      const m = d.style.display !== "none";
      nn(u, d, !m);
    }), u.addEventListener("keydown", (m) => {
      if (m.key !== "Enter" && m.key !== " ") return;
      m.preventDefault();
      const f = d.style.display !== "none";
      nn(u, d, !f);
    });
  }
}
function Mr(e, t, n, a, r, o) {
  if (r.has(t)) {
    e.append(Rr("[circular]", "circular", { description: "" }, a, !1, !1));
    return;
  }
  {
    const i = new Set(r);
    i.add(t), Pr(e, t, a, i, o);
    return;
  }
}
function Pr(e, t, n, a, r) {
  const o = new Set(t.required || []);
  if (t.properties)
    for (const [i, s] of Object.entries(t.properties))
      pt(e, i, s, n, o.has(i), a, r);
  t.items && t.type === "array" && pt(e, "[item]", t.items, n, !1, a, r);
  for (const i of ["allOf", "oneOf", "anyOf"]) {
    const s = t[i];
    if (Array.isArray(s))
      for (let l = 0; l < s.length; l++)
        pt(e, `${i}[${l}]`, s[l], n, !1, a, r);
  }
  t.additionalProperties && typeof t.additionalProperties == "object" && pt(e, "[additionalProperties]", t.additionalProperties, n, !1, a, r);
}
function Rr(e, t, n, a, r, o) {
  const i = [
    "schema-row",
    a === 0 ? "is-root" : "",
    a === 0 && !r ? "is-leaf" : ""
  ].filter(Boolean).join(" "), s = c("div", { className: i, role: r ? "button" : void 0 });
  s.setAttribute("data-depth", String(a)), s.style.setProperty("--schema-depth", String(a));
  const l = c("div", { className: "schema-main-row" }), u = c("div", { className: "schema-name-wrapper" });
  r ? u.append(c("span", { className: "schema-toggle", innerHTML: T.chevronRight })) : u.append(c("span", { className: "schema-spacer" })), u.append(c("span", { textContent: e })), l.append(u);
  const d = c("div", { className: "schema-meta-wrapper" });
  d.append(N({ text: t, kind: "chip", color: "primary", size: "m" })), o && d.append(N({ text: "required", kind: "required", size: "m" })), l.append(d), s.append(l);
  const p = c("div", { className: `schema-desc-col${a === 0 ? " is-root" : ""}` });
  n.description && p.append(c("p", { textContent: String(n.description) }));
  const m = n.enum, f = Array.isArray(m) && m.length > 0, h = n.default, v = h !== void 0, y = f && v ? m.some((g) => Gt(g, h)) : !1, b = Qi(n, !f || !v);
  if (b.length > 0 || f) {
    const g = c("div", { className: "schema-constraints-row" });
    for (const A of b)
      g.append(N({
        text: A,
        kind: "chip",
        size: "s"
      }));
    if (f) {
      const A = v && y ? [h, ...m.filter((O) => !Gt(O, h))] : m;
      v && !y && g.append(N({
        text: `default: ${yt(h)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value is-default"
      }));
      for (const O of A) {
        const x = v && Gt(O, h);
        g.append(N({
          text: x ? `default: ${yt(O)}` : yt(O),
          kind: "chip",
          size: "s",
          className: x ? "schema-enum-value is-default" : "schema-enum-value"
        }));
      }
    }
    p.append(g);
  }
  return p.children.length > 0 && s.append(p), s;
}
function Xi(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function Qi(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${yt(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function Hr(e, t) {
  for (const { row: n, children: a } of e)
    nn(n, a, t);
}
function nn(e, t, n) {
  t.style.display = n ? "block" : "none", e.querySelector(".schema-toggle")?.classList.toggle("is-expanded", n), e.setAttribute("aria-expanded", n ? "true" : "false");
}
function yt(e) {
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (e === null) return "null";
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function Gt(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function es(e) {
  const { method: t, url: n, headers: a = {}, body: r, timeout: o = 3e4 } = e, i = new AbortController(), s = setTimeout(() => i.abort(), o), l = performance.now();
  try {
    const u = typeof FormData < "u" && r instanceof FormData, d = {
      method: t.toUpperCase(),
      headers: u ? void 0 : a,
      signal: i.signal,
      credentials: "include"
    };
    if (u) {
      const y = {};
      for (const [b, g] of Object.entries(a))
        b.toLowerCase() !== "content-type" && (y[b] = g);
      Object.keys(y).length > 0 && (d.headers = y);
    }
    r && !["GET", "HEAD"].includes(t.toUpperCase()) && (d.body = r);
    const p = await fetch(n, d), m = performance.now() - l, f = await p.text(), h = new TextEncoder().encode(f).length, v = {};
    return p.headers.forEach((y, b) => {
      v[b.toLowerCase()] = y;
    }), ts(f, v), {
      status: p.status,
      statusText: p.statusText,
      headers: v,
      body: f,
      duration: m,
      size: h
    };
  } catch (u) {
    const d = performance.now() - l;
    return u.name === "AbortError" ? {
      status: 0,
      statusText: "Request timed out",
      headers: {},
      body: `Request timed out after ${o}ms`,
      duration: d,
      size: 0
    } : {
      status: 0,
      statusText: "Network Error",
      headers: {},
      body: u.message || "Unknown network error",
      duration: d,
      size: 0
    };
  } finally {
    clearTimeout(s);
  }
}
function ts(e, t) {
  const n = k.get().auth;
  if (n.locked) return;
  const a = k.get().spec;
  let r = n.activeScheme;
  if (a) {
    for (const [i, s] of Object.entries(a.securitySchemes))
      if (s.type === "http" && s.scheme?.toLowerCase() === "bearer") {
        r = i;
        break;
      }
  }
  const o = t["x-new-access-token"];
  if (o) {
    r ? (k.setSchemeValue(r, o), k.setAuth({ source: "auto-header" })) : k.setAuth({ token: o, source: "auto-header" });
    return;
  }
  try {
    const i = JSON.parse(e), s = i.accessToken || i.access_token || i.token;
    typeof s == "string" && s.length > 10 && (r ? (k.setSchemeValue(r, s), k.setAuth({ source: "auto-body" })) : k.setAuth({ token: s, source: "auto-body" }));
  } catch {
  }
}
function ns(e, t, n, a) {
  let r = t;
  for (const [u, d] of Object.entries(n))
    r = r.replace(`{${u}}`, encodeURIComponent(d));
  const i = e.replace(/\/+$/, "") + r, s = new URLSearchParams();
  for (const [u, d] of Object.entries(a))
    d && s.set(u, d);
  const l = s.toString();
  return l ? `${i}?${l}` : i;
}
function Kt(e) {
  return [
    { language: "curl", label: "cURL", code: rs(e) },
    { language: "javascript", label: "JavaScript", code: as(e) },
    { language: "python", label: "Python", code: os(e) },
    { language: "go", label: "Go", code: is(e) },
    { language: "rust", label: "Rust", code: ss(e) }
  ];
}
function rs({ method: e, url: t, headers: n, body: a }) {
  const r = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [o, i] of Object.entries(n))
    r.push(`  -H '${o}: ${i}'`);
  return a && r.push(`  -d '${a}'`), r.join(` \\
`);
}
function as({ method: e, url: t, headers: n, body: a }) {
  const r = [];
  r.push(`  method: '${e.toUpperCase()}'`);
  const o = Object.entries(n);
  if (o.length > 0) {
    const i = o.map(([s, l]) => `    '${s}': '${l}'`).join(`,
`);
    r.push(`  headers: {
${i}
  }`);
  }
  return a && r.push(`  body: JSON.stringify(${a})`), `const response = await fetch('${t}', {
${r.join(`,
`)}
});

const data = await response.json();
console.log(data);`;
}
function os({ method: e, url: t, headers: n, body: a }) {
  const r = ["import requests", ""], o = Object.entries(n);
  if (o.length > 0) {
    const s = o.map(([l, u]) => `    "${l}": "${u}"`).join(`,
`);
    r.push(`headers = {
${s}
}`);
  }
  a && r.push(`payload = ${a}`);
  const i = [`"${t}"`];
  return o.length > 0 && i.push("headers=headers"), a && i.push("json=payload"), r.push(""), r.push(`response = requests.${e.toLowerCase()}(${i.join(", ")})`), r.push("print(response.json())"), r.join(`
`);
}
function is({ method: e, url: t, headers: n, body: a }) {
  const r = [
    "package main",
    "",
    "import (",
    '    "fmt"',
    '    "io"',
    '    "net/http"'
  ];
  a && r.push('    "strings"'), r.push(")", "", "func main() {"), a ? (r.push(`    body := strings.NewReader(\`${a}\`)`), r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", body)`)) : r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", nil)`), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }");
  for (const [o, i] of Object.entries(n))
    r.push(`    req.Header.Set("${o}", "${i}")`);
  return r.push(""), r.push("    resp, err := http.DefaultClient.Do(req)"), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }"), r.push("    defer resp.Body.Close()"), r.push(""), r.push("    data, _ := io.ReadAll(resp.Body)"), r.push("    fmt.Println(string(data))"), r.push("}"), r.join(`
`);
}
function ss({ method: e, url: t, headers: n, body: a }) {
  const r = [
    "use reqwest::header::{HeaderMap, HeaderValue};",
    "",
    "#[tokio::main]",
    "async fn main() -> Result<(), reqwest::Error> {",
    "    let client = reqwest::Client::new();"
  ], o = Object.entries(n);
  if (o.length > 0) {
    r.push(""), r.push("    let mut headers = HeaderMap::new();");
    for (const [l, u] of o)
      r.push(`    headers.insert("${l}", HeaderValue::from_static("${u}"));`);
  }
  r.push("");
  const s = [`    let response = client.${e.toLowerCase()}("${t}")`];
  return o.length > 0 && s.push("        .headers(headers)"), a && s.push(`        .body(r#"${a}"#.to_string())`), s.push("        .send()"), s.push("        .await?;"), r.push(s.join(`
`)), r.push(""), r.push("    let body = response.text().await?;"), r.push('    println!("{}", body);'), r.push(""), r.push("    Ok(())"), r.push("}"), r.join(`
`);
}
function cs(e) {
  if (e.length === 0) return [];
  const t = (r, o, i) => {
    if (o && r.examples?.[o] !== void 0) {
      const s = r.examples[o], l = s?.value ?? s.value;
      if (l != null) return String(l);
    }
    return i !== void 0 && r.schema?.enum && r.schema.enum[i] !== void 0 ? String(r.schema.enum[i]) : r.example !== void 0 && r.example !== null ? String(r.example) : r.schema?.example !== void 0 && r.schema.example !== null ? String(r.schema.example) : r.schema?.default !== void 0 && r.schema.default !== null ? String(r.schema.default) : r.schema?.enum && r.schema.enum.length > 0 ? String(r.schema.enum[0]) : r.schema?.type === "integer" || r.schema?.type === "number" ? "0" : r.schema?.type === "boolean" ? "true" : r.in === "path" ? "id" : "value";
  }, n = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r.examples && typeof r.examples == "object")
      for (const o of Object.keys(r.examples)) n.add(o);
  const a = [];
  if (n.size > 0)
    for (const r of n) {
      const o = {};
      for (const l of e)
        o[l.name] = t(l, r);
      const s = e.find((l) => l.examples?.[r])?.examples?.[r];
      a.push({ name: r, summary: s?.summary, values: o });
    }
  else {
    const r = e.find((o) => o.schema?.enum && o.schema.enum.length > 1);
    if (r?.schema?.enum)
      for (let o = 0; o < r.schema.enum.length; o++) {
        const i = {};
        for (const l of e)
          i[l.name] = l === r ? t(l, null, o) : t(l, null);
        const s = String(r.schema.enum[o]);
        a.push({ name: s, values: i });
      }
    else {
      const o = {};
      for (const i of e)
        o[i.name] = t(i, null);
      a.push({ name: "Default", values: o });
    }
  }
  return a;
}
function Fr(e) {
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
    const n = $e(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function ls(e) {
  const t = [e.summary, e.description].filter(Boolean);
  return [...new Set(t)].join(" — ") || e.name;
}
function Un(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
const _r = [
  [/"(?:[^"\\]|\\.)*"(?=\s*:)/g, "property"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/\b(?:true|false|null)\b/g, "literal"],
  [/[{}[\]:,]/g, "punctuation"]
], zn = [
  [/#.*/g, "comment"],
  [/"(?:[^"\\]|\\.)*"|'[^']*'/g, "string"],
  [/\$\w+|\$\{[^}]+\}/g, "sign"],
  [/--?\w[\w-]*/g, "sign"],
  [/\b(?:curl|wget|echo|export|if|then|else|fi|for|do|done|while|case|esac|function|return|local|set|unset|source|cd|ls|cat|grep|sed|awk|chmod|mkdir|rm|cp|mv|sudo|apt|brew|npm|pip|docker|http|https)\b/g, "keyword"],
  [/-?\b\d+(?:\.\d+)?\b/g, "number"]
], us = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/"(?:[^"\\]|\\.)*"|`[^`]*`/g, "string"],
  [/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g, "keyword"],
  [/\b(?:bool|byte|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr|true|false|nil|iota)\b/g, "literal"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], ft = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/`(?:[^`\\]|\\.)*`/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/g, "keyword"],
  [/\b(?:true|false|null|undefined|NaN|Infinity)\b/g, "literal"],
  [/\b(?:console|document|window|fetch|Promise|Array|Object|String|Number|Boolean|Map|Set|JSON|Math|Date|RegExp|Error)\b/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], Wn = [
  [/#.*/g, "comment"],
  [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, "keyword"],
  [/\b(?:True|False|None)\b/g, "literal"],
  [/@\w+/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]():.,;]/g, "punctuation"]
], Vn = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|type|unsafe|use|where|while|yield)\b/g, "keyword"],
  [/\b(?:true|false|None|Some|Ok|Err)\b/g, "literal"],
  [/\b(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Box|Option|Result|HashMap|HashSet|Rc|Arc|Mutex|Cell|RefCell)\b/g, "sign"],
  [/\b(?:println!|print!|format!|vec!|panic!|assert!|assert_eq!|assert_ne!|todo!|unimplemented!|unreachable!|eprintln!|eprint!|write!|writeln!)/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], ds = {
  json: _r,
  javascript: ft,
  js: ft,
  typescript: ft,
  ts: ft,
  bash: zn,
  curl: zn,
  go: us,
  python: Wn,
  py: Wn,
  rust: Vn,
  rs: Vn
};
function ps(e, t) {
  let n = "", a = 0;
  for (; a < e.length; ) {
    let r = null;
    for (const [o, i] of t) {
      o.lastIndex = a;
      const s = o.exec(e);
      s && (!r || s.index < r.start || s.index === r.start && s[0].length > r.end - r.start) && (r = { start: s.index, end: s.index + s[0].length, cls: i });
    }
    if (!r) {
      n += gt(e.slice(a));
      break;
    }
    r.start > a && (n += gt(e.slice(a, r.start))), n += `<span class="hl-${r.cls}">${gt(e.slice(r.start, r.end))}</span>`, a = r.end;
  }
  return n;
}
function Dr(e, t) {
  const n = ds[t] ?? (Sr(e) ? _r : null);
  return n ? ps(e, n) : gt(e);
}
function fs(e, t) {
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
    return Yn(a, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const a = parseFloat(e);
    return Yn(a, n);
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
function Yn(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function ms(e, t, n, a) {
  if (a && (!e || e.trim() === ""))
    return { valid: !1, message: "Request body is required" };
  if (!e || e.trim() === "")
    return { valid: !0 };
  if (t.includes("json"))
    try {
      JSON.parse(e);
    } catch (r) {
      return { valid: !1, message: `Invalid JSON: ${r instanceof Error ? r.message : "Invalid JSON"}` };
    }
  return { valid: !0 };
}
function hs(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((r) => {
    const o = r.getAttribute("data-param-name"), i = t.parameters.find((l) => l.name === o);
    if (!i) return;
    const s = fs(r.value, i);
    s.valid || n.push({ field: o, message: s.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const o = Object.keys(t.requestBody.content || {})[0] || "application/json", i = t.requestBody.content?.[o]?.schema, l = e.querySelector('[data-field="body"]')?.value || "";
    if (!o.includes("multipart")) {
      const u = ms(l, o, i, t.requestBody.required);
      u.valid || n.push({ field: "body", message: u.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function gs(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function vs(e, t) {
  for (const n of t) {
    const a = e.querySelector(`[data-error-for="${n.field}"]`);
    if (a && (a.textContent = n.message, a.classList.add("visible")), n.kind === "param") {
      const r = e.querySelector(`[data-param-name="${n.field}"]`);
      r && r.classList.add("invalid");
    } else if (n.kind === "body") {
      const r = e.querySelector('[data-field="body"]');
      r && r.classList.add("invalid");
    }
  }
}
function Ur(e) {
  return c("span", { className: "validation-error", "data-error-for": e });
}
function Gn(e) {
  e.style.height = "0", e.style.height = `${e.scrollHeight}px`;
}
function Kn(e, t, n) {
  const a = c("div", { className: "body-editor" }), r = c("pre", { className: "body-highlight" }), o = c("code", {});
  r.append(o);
  const i = c("textarea", {
    className: "textarea-json",
    spellcheck: "false",
    rows: "1",
    autocomplete: "off",
    ...n?.dataField ? { "data-field": n.dataField } : {}
  });
  i.value = e;
  const s = (l, u) => {
    const d = l.endsWith(`
`) ? l + " " : l || " ";
    o.innerHTML = Dr(d, u);
  };
  return s(e, t), i.addEventListener("input", () => {
    s(i.value, t), n?.onInput?.();
  }), a.append(r, i), {
    wrap: a,
    textarea: i,
    setValue: (l, u) => {
      i.value = l, s(l, u ?? t);
    },
    syncLayout: () => {
    }
    // no-op — CSS Grid handles layout
  };
}
const ys = 1500;
function de(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", a = ue({
    variant: "icon",
    icon: T.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const r = await e.getText();
      await pi(r), a.innerHTML = T.check, a.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        a.innerHTML = T.copy, a.setAttribute("aria-label", t);
      }, ys);
    }
  });
  return a;
}
function bs(e, t, n, a) {
  W(t), t.classList.add("try-it");
  const r = c("div", { className: "body" }), o = c("div", { className: "block section" });
  o.append(c("h2", { textContent: "Response" }));
  const i = c("div", { "data-response": "true" });
  if (n)
    Jt(i, {
      status: parseInt(n.statusCode, 10) || 200,
      statusText: n.statusText || "OK",
      headers: {},
      body: n.body,
      duration: 0,
      size: 0
    });
  else {
    const s = c("div", { className: "placeholder" });
    s.append(c("span", { textContent: "Execute request to see response" })), i.append(s);
  }
  o.append(i), r.append(xs(e, t, {
    onConfigChange: a?.onConfigChange,
    onSendRequest: async (s) => {
      gs(t);
      const l = hs(t, e);
      if (l.length > 0) {
        vs(t, l);
        return;
      }
      const u = ke(t, e);
      s.setAttribute("disabled", ""), s.innerHTML = "", s.append(c("span", { className: "spinner spinner-sm" }), c("span", null, "Sending..."));
      try {
        const d = await es(u);
        Jt(i, d);
      } catch (d) {
        Jt(i, {
          status: 0,
          headers: {},
          body: d.message,
          duration: 0,
          size: 0
        });
      } finally {
        s.removeAttribute("disabled"), s.innerHTML = T.send, s.append(c("span", null, "Send Request"));
      }
    }
  })), r.append(o), t.append(r);
}
function xs(e, t, n) {
  const a = n?.onConfigChange, r = e.parameters.filter((E) => E.in === "path"), o = e.parameters.filter((E) => E.in === "query"), i = cs([...r, ...o]);
  let s = [];
  if (e.requestBody) {
    const E = Object.keys(e.requestBody.content || {})[0] || "application/json";
    if (!E.includes("multipart")) {
      const j = e.requestBody.content?.[E];
      j && (s = Fr(j));
    }
  }
  let l = null;
  const u = "Request", d = Kt({
    method: e.method,
    url: "",
    // will be updated
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), p = () => {
    const E = ke(t, e);
    let j;
    return typeof E.body == "string" ? j = E.body : E.body instanceof FormData ? j = "{ /* multipart form-data */ }" : e.requestBody && (j = "{ ... }"), {
      method: E.method,
      url: E.url,
      headers: E.headers || {},
      body: j
    };
  }, m = () => {
    const E = ke(t, e);
    if (typeof E.body == "string") return E.body;
    if (E.body instanceof FormData) {
      const j = [];
      return E.body.forEach((re, ye) => {
        if (re instanceof File) {
          j.push(`${ye}: [File ${re.name}]`);
          return;
        }
        j.push(`${ye}: ${String(re)}`);
      }), j.join(`
`);
    }
    return "";
  }, f = (E, j) => {
    const re = p(), ye = Kt(re), Te = ye[j] || ye[0];
    Te && E.setValue(Te.code, Te.language);
  }, h = c("div", { className: "block section tabs-code" }), v = c("div", { className: "body" }), y = c("h2", { textContent: "Request" });
  h.append(y, v);
  const b = k.get(), g = c("div", { className: "card" }), A = c("div", { className: "card-head" }), O = c("div", { className: "tabs tabs-code" }), x = [];
  let L = 0, C = null, w = null, $ = null, I = null;
  {
    const E = St(u, { active: !0, context: !0 });
    x.push(E), I = c("div", { className: "panel is-request", "data-tab": "first" });
    const j = i.length > 1 && (r.length > 0 || o.length > 0), re = s.length > 1;
    if (j || re) {
      const M = c("div", { className: "params-group" });
      M.append(c("h3", { textContent: "Examples" })), j && M.append(Nt({
        options: i.map((B) => ({ value: B.name, label: B.summary || B.name })),
        value: i[0].name,
        ariaLabel: "Select parameter example",
        className: "example-select",
        onChange: (B) => {
          const z = i.find((pe) => pe.name === B);
          z && (ks(t, z.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
        }
      })), re && M.append(Nt({
        options: s.map((B) => ({ value: B.name, label: ls(B) })),
        value: s[0].name,
        ariaLabel: "Select body example",
        className: "example-select",
        onChange: (B) => {
          const z = s.find((pe) => pe.name === B);
          z && l && (l.setValue(Un(z.value), "json"), l.syncLayout(), a?.(ke(t, e)));
        }
      })), I.append(M);
    }
    const ye = c("div", { className: "headers-section" }), Te = c("div", { className: "field-header" });
    Te.append(c("h3", { textContent: "Headers" }));
    const Je = c("div", { className: "headers-list" });
    if (e.requestBody) {
      const B = Object.keys(e.requestBody.content || {})[0] || "application/json";
      Je.append(nt("Content-Type", B));
    }
    if (U(e.resolvedSecurity) && b.spec) {
      const M = gn(e.resolvedSecurity, b.spec.securitySchemes), z = { ...vn(e.resolvedSecurity, b.spec.securitySchemes), ...M };
      for (const [pe, lt] of Object.entries(z))
        Je.append(nt(pe, lt));
    }
    for (const M of e.parameters.filter((B) => B.in === "header"))
      Je.append(nt(M.name, String(M.example || "")));
    const Yr = ue({
      variant: "icon",
      icon: T.plus,
      ariaLabel: "Add header",
      className: "field-copy-btn",
      onClick: () => Je.append(nt("", ""))
    });
    if (Te.append(Yr), ye.append(Te, Je), I.append(ye), r.length > 0 || o.length > 0) {
      const M = c("div", { className: "params-group" });
      if (M.append(c("h3", { textContent: "Parameters" })), r.length > 0) {
        const B = c("div", { className: "params-group" });
        o.length > 0 && B.append(c("h3", { textContent: "Path" }));
        for (const z of r)
          B.append(Zn(z, i[0]?.values[z.name]));
        M.append(B);
      }
      if (o.length > 0) {
        const B = c("div", { className: "params-group" });
        r.length > 0 && B.append(c("h3", { textContent: "Query" }));
        for (const z of o)
          B.append(Zn(z, i[0]?.values[z.name]));
        M.append(B);
      }
      I.append(M);
    }
    {
      const M = c("div", { className: "route-preview" }), B = c("div", { className: "field-header" });
      B.append(c("h3", { textContent: "URL" }));
      const z = de({
        ariaLabel: "Copy URL",
        getText: () => C?.value || ke(t, e).url
      });
      C = Ae({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "route-input"
      });
      const pe = c("div", { className: "route-input-row" });
      pe.append(C, z), M.append(B, pe), w = M;
    }
    if (e.requestBody) {
      const M = c("div", { className: "body-section" }), B = c("div", { className: "field-header" });
      B.append(c("h3", { textContent: "Body" }));
      const z = de({
        ariaLabel: "Copy body",
        className: "field-copy-btn",
        getText: m
      });
      B.append(z), M.append(B);
      const lt = Object.keys(e.requestBody.content || {})[0] || "application/json", Gr = lt.includes("multipart"), Nn = e.requestBody.content?.[lt];
      if (Gr && Nn?.schema) {
        const Ze = c("div", { className: "multipart", "data-field": "multipart" }), ut = Nn.schema, Xe = ut.properties || {}, Kr = ut.required || [];
        for (const [Qe, qe] of Object.entries(Xe)) {
          const Jr = qe.format === "binary" || qe.format === "base64" || qe.type === "string" && qe.format === "binary", Sn = Kr.includes(Qe), Ht = c("div", { className: `params row${Sn ? " is-required" : ""}` }), Ft = c("span", { className: "label", textContent: Qe });
          if (Sn && Ft.append(zr()), Jr) {
            const _t = c("input", {
              type: "file",
              autocomplete: "off",
              "data-multipart-field": Qe,
              "data-multipart-type": "file"
            });
            Ht.append(Ft, _t);
          } else {
            const _t = Ae({
              placeholder: qe.description || Qe,
              value: qe.default !== void 0 ? String(qe.default) : "",
              dataAttrs: { multipartField: Qe, multipartType: "text" }
            });
            Ht.append(Ft, _t);
          }
          Ze.append(Ht);
        }
        M.append(Ze);
      } else {
        const Ze = s[0], ut = Ze ? Un(Ze.value) : "", Xe = Kn(ut, "json", {
          dataField: "body",
          onInput: () => a?.(ke(t, e))
        });
        l = Xe, $ = Xe.syncLayout, M.append(Xe.wrap);
      }
      M.append(Ur("body")), I.append(M);
    }
  }
  const R = p(), G = Kt(R), Z = Kn(
    G[0]?.code ?? "",
    G[0]?.language
  ), oe = c("div", { className: "panel", "data-tab": "lang" }), q = c("div", { className: "body-section" }), V = c("div", { className: "field-header" });
  V.append(c("h3", { textContent: "Code Example" }));
  const se = de({
    ariaLabel: "Copy code",
    className: "field-copy-btn",
    getText: () => Z.textarea.value
  });
  V.append(se), q.append(V, Z.wrap), oe.append(q);
  for (let E = 0; E < d.length; E++) {
    const j = d[E], re = St(j.label, { active: !u });
    x.push(re);
  }
  A.append(O);
  const X = I ? [I, oe] : [oe], Q = (E, j) => {
    if (!j) {
      E.style.display = "none";
      return;
    }
    E.style.display = E.classList.contains("is-request") ? "flex" : "block";
  };
  for (let E = 0; E < x.length; E++) {
    O.append(x[E]);
    const j = E;
    x[E].addEventListener("click", () => {
      x.forEach((re) => re.classList.remove("is-active")), x[j].classList.add("is-active"), L = j, I && Q(I, j === 0), Q(oe, j !== 0), j === 0 && $?.(), j > 0 && f(Z, j - 1);
    });
  }
  const ct = c("div", { className: "card-content flush" }), Ke = c("div", { className: "panels" });
  if (I && Q(I, !0), Q(oe, !1), Ke.append(...X), ct.append(Ke), n?.onSendRequest) {
    const E = ue({
      variant: "primary",
      icon: T.send,
      label: "Send Request",
      className: "send-btn"
    });
    E.addEventListener("click", () => n.onSendRequest(E));
    {
      w && I?.append(w);
      const j = c("div", { className: "send-inline" });
      j.append(E), I?.append(j);
    }
  }
  !n?.onSendRequest && u && w && I?.append(w), g.append(A, ct), v.append(g);
  const Le = () => {
    C && (C.value = ke(t, e).url), a?.(ke(t, e)), (L > 0 || !u) && f(Z, L - 1);
  };
  return t.addEventListener("input", Le), t.addEventListener("change", Le), queueMicrotask(() => {
    Le(), $?.();
  }), Ee().on("try-it:env-change", () => {
    Le();
  }), h;
}
function Jn(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function ks(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((a) => {
    const r = a.getAttribute("data-param-name");
    r && t[r] !== void 0 && (a.value = t[r]);
  });
}
function Zn(e, t) {
  const n = c("div", { className: `params row${e.required ? " is-required" : ""}` }), a = c("span", {
    className: "label",
    textContent: e.name
  });
  e.required && a.append(zr());
  const r = e.schema;
  let o;
  if (r?.enum && r.enum.length > 0) {
    const s = e.required ? r.enum.map((u) => ({ value: String(u), label: String(u) })) : [{ value: "", label: "— select —" }, ...r.enum.map((u) => ({ value: String(u), label: String(u) }))];
    o = Nt({
      options: s,
      value: Jn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const s = r?.type === "integer" || r?.type === "number" ? "number" : "text", l = Ae({
      type: s,
      placeholder: e.description || e.name,
      value: Jn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    r?.type === "integer" && l.setAttribute("step", "1"), r?.minimum !== void 0 && l.setAttribute("min", String(r.minimum)), r?.maximum !== void 0 && l.setAttribute("max", String(r.maximum)), o = l;
  }
  const i = Ur(e.name);
  return n.append(a, o, i), n;
}
function zr() {
  return c("span", {
    className: "required-star",
    textContent: "*",
    "aria-hidden": "true"
  });
}
function nt(e, t) {
  const n = c("div", { className: "header-row" }), a = Ae({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), r = Ae({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), o = ue({
    variant: "icon",
    icon: T.close,
    ariaLabel: "Remove header",
    onClick: () => n.remove()
  });
  return n.append(a, r, o), n;
}
function ke(e, t) {
  const n = k.get(), a = ve(n), r = e.querySelectorAll('[data-param-in="path"]'), o = {};
  r.forEach((f) => {
    o[f.getAttribute("data-param-name")] = f.value;
  });
  const i = e.querySelectorAll('[data-param-in="query"]'), s = {};
  if (i.forEach((f) => {
    const h = f.getAttribute("data-param-name");
    f.value && (s[h] = f.value);
  }), n.spec && U(t.resolvedSecurity)) {
    const f = Ti(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [h, v] of Object.entries(f))
      h in s || (s[h] = v);
  }
  const l = e.querySelectorAll(".header-row"), u = {};
  if (l.forEach((f) => {
    const h = f.querySelector("[data-header-name]"), v = f.querySelector("[data-header-value]");
    h?.value && v?.value && (u[h.value] = v.value);
  }), n.spec && U(t.resolvedSecurity)) {
    const f = qi(t.resolvedSecurity, n.spec.securitySchemes), h = Object.entries(f).map(([v, y]) => `${v}=${y}`);
    if (h.length > 0) {
      const v = u.Cookie || u.cookie || "";
      u.Cookie = v ? `${v}; ${h.join("; ")}` : h.join("; "), delete u.cookie;
    }
  }
  const d = e.querySelector('[data-field="multipart"]');
  let p;
  if (d) {
    const f = new FormData();
    d.querySelectorAll("[data-multipart-field]").forEach((v) => {
      const y = v.getAttribute("data-multipart-field"), b = v.getAttribute("data-multipart-type");
      b === "file" && v.files && v.files.length > 0 ? f.append(y, v.files[0]) : b === "text" && v.value && f.append(y, v.value);
    }), p = f, delete u["Content-Type"];
  } else
    p = e.querySelector('[data-field="body"]')?.value || void 0;
  const m = ns(a, t.path, o, s);
  return { method: t.method, url: m, headers: u, body: p };
}
function Jt(e, t) {
  W(e);
  const n = c("div", { className: "card" }), a = c("div", { className: "card-head response-header" }), r = St("Body", { active: !0 }), o = St(`Headers (${Object.keys(t.headers).length})`), i = c("div", { className: "tabs tabs-code" });
  i.append(r, o);
  const s = c("div", {
    className: "meta",
    innerHTML: `<span>${mi(t.duration)}</span><span>${fi(t.size)}</span>`
  }), l = N({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), u = de({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => ws("Response copied")
  });
  a.append(i, s, l, u), n.append(a);
  const d = c("div", { className: "card-content flush" }), p = c("div", { className: "response-pane" }), m = c("div", { className: "pane-inner" }), f = c("pre", { className: "code-display" }), h = c("code", {}), v = Cs(t.body);
  h.innerHTML = Dr(v, Sr(v) ? "json" : ""), f.append(h), m.append(f), p.append(m);
  const y = c("div", { className: "response-pane", style: "display:none" }), b = c("div", { className: "pane-inner" }), g = c("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false",
    autocomplete: "off"
  });
  g.value = Object.entries(t.headers).map(([A, O]) => `${A}: ${O}`).join(`
`), Gn(g), b.append(g), y.append(b), d.append(p, y), n.append(d), r.addEventListener("click", () => {
    r.classList.add("is-active"), o.classList.remove("is-active"), p.style.display = "block", y.style.display = "none";
  }), o.addEventListener("click", () => {
    o.classList.add("is-active"), r.classList.remove("is-active"), p.style.display = "none", y.style.display = "block", requestAnimationFrame(() => Gn(g));
  }), e.append(n);
}
function Cs(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function ws(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = c("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
let Ns = 0;
function Ot(e, t, n) {
  if (t?.schema)
    return {
      content: Ji(t.schema).body,
      contentType: e,
      schemaType: Ge(t.schema),
      itemsCount: Ss(t.schema)
    };
  const a = c("div", { className: "schema" }), r = c("div", { className: "body schema-body-plain" });
  return r.append(c("p", { textContent: n })), a.append(r), {
    content: a,
    contentType: e,
    schemaType: "plain",
    itemsCount: 1
  };
}
function yn(e) {
  const t = c("span", { className: "schema-content-meta" });
  return t.append(
    N({ text: e.contentType, kind: "chip", size: "s" }),
    N({ text: e.schemaType, kind: "chip", color: "primary", size: "s" })
  ), t;
}
function Ss(e) {
  let t = 0;
  return e.properties && (t += Object.keys(e.properties).length), e.type === "array" && e.items && (t += 1), Array.isArray(e.allOf) && (t += e.allOf.length), Array.isArray(e.oneOf) && (t += e.oneOf.length), Array.isArray(e.anyOf) && (t += e.anyOf.length), e.additionalProperties && typeof e.additionalProperties == "object" && (t += 1), Math.max(t, 1);
}
function Ce(e) {
  const t = `collapsible-category-${Ns++}`, n = c("div", { className: "collapsible-category" }), a = c("span", { className: "collapsible-category-title", textContent: e.title }), r = c("span", { className: "collapsible-category-meta" });
  e.trailing && r.append(c("span", { className: "collapsible-category-trailing" }, e.trailing));
  const o = c("span", { className: "collapsible-category-controls" });
  e.counter !== void 0 && o.append(N({ text: String(e.counter), kind: "chip", size: "s" }));
  const i = c("span", { className: "collapsible-category-chevron", innerHTML: T.chevronDown });
  o.append(i), r.append(o);
  const s = c("button", {
    className: "collapsible-category-toggle focus-ring",
    type: "button",
    "aria-expanded": "true",
    "aria-controls": t
  }, a, r), l = c("div", {
    id: t,
    className: "collapsible-category-content"
  });
  l.append(e.content);
  const u = (d) => {
    n.classList.toggle("is-expanded", d), s.setAttribute("aria-expanded", d ? "true" : "false"), l.hidden = !d;
  };
  return s.addEventListener("click", () => {
    const d = s.getAttribute("aria-expanded") === "true";
    u(!d);
  }), u(e.expanded !== !1), n.append(s, l), { root: n };
}
function Wr(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([o, i]) => {
    const s = i.schema ? Ge(i.schema) : "string", l = i.example !== void 0 ? String(i.example) : i.schema?.example !== void 0 ? String(i.schema.example) : "—", u = c("div", { className: "schema-row role-flat role-headers" }), d = c("div", { className: "schema-main-row" }), p = c("div", { className: "schema-name-wrapper" });
    p.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: o })
    );
    const m = c("div", { className: "schema-meta-wrapper" });
    m.append(N({ text: s, kind: "chip", color: "primary", size: "m" })), i.required && m.append(N({ text: "required", kind: "required", size: "m" })), d.append(p, m), u.append(d);
    const f = c("div", { className: "schema-desc-col is-root" });
    i.description && f.append(c("p", { textContent: i.description }));
    const h = c("div", { className: "schema-enum-values" });
    return h.append(N({
      text: l,
      kind: "chip",
      size: "s"
    })), f.append(h), f.children.length > 0 && u.append(f), u;
  }), a = c("div", { className: "params" }), r = c("div", { className: "body role-headers" });
  return r.append(...n), a.append(r), a;
}
function Tt(e) {
  const t = c("div", { className: "collapsible-categories" });
  if (e.headers) {
    const a = Ce({
      title: "Headers",
      content: e.headers,
      counter: e.headersCount
    });
    t.append(a.root);
  }
  const n = Ce({
    title: "Body",
    content: e.body.content,
    trailing: yn(e.body),
    counter: e.body.itemsCount
  });
  return t.append(n.root), t;
}
function rn(e) {
  const { prev: t, next: n } = As(e);
  if (!t && !n) return null;
  const a = c("div", {
    className: `route-nav${!t || !n ? " is-single" : ""}`
  });
  return t && a.append(Xn(t, "previous")), n && a.append(Xn(n, "next")), a;
}
function Xn(e, t) {
  const n = H(e.route), a = c("a", {
    className: `card interactive route-card ${t === "previous" ? "is-prev" : "is-next"}`,
    href: n
  }), r = c("div", { className: "route-meta" });
  e.kind === "endpoint" ? (r.append(N({
    text: e.operation.method.toUpperCase(),
    kind: "method",
    method: e.operation.method
  })), r.append(c("span", { className: "route-path", textContent: e.operation.path }))) : (r.append(N({
    text: "WEBHOOK",
    kind: "webhook",
    size: "s"
  })), r.append(N({
    text: e.webhook.method.toUpperCase(),
    kind: "method",
    method: e.webhook.method
  })));
  const o = c("span", { className: "route-side", "aria-hidden": "true" });
  o.innerHTML = t === "previous" ? T.chevronLeft : T.chevronRight;
  const i = c("div", { className: "route-main" });
  return i.append(
    c("span", { className: "route-category", textContent: e.category }),
    c("span", { className: "route-title", textContent: e.title }),
    r
  ), t === "previous" ? a.append(o, i) : a.append(i, o), a.addEventListener("click", (s) => {
    s.preventDefault(), P(n);
  }), a;
}
function As(e) {
  if (!k.get().spec) return { prev: null, next: null };
  const n = Es();
  if (n.length === 0) return { prev: null, next: null };
  const a = Ls(n, e);
  return a < 0 ? { prev: null, next: null } : {
    prev: a > 0 ? n[a - 1] : null,
    next: a < n.length - 1 ? n[a + 1] : null
  };
}
function Es() {
  const e = k.get().spec;
  if (!e) return [];
  const t = [], n = /* @__PURE__ */ new Set();
  for (const a of e.tags)
    for (const r of a.operations) {
      const o = `${r.method.toLowerCase()} ${r.path}`;
      n.has(o) || (n.add(o), t.push({
        kind: "endpoint",
        route: {
          type: "endpoint",
          tag: a.name,
          method: r.method,
          path: r.path,
          operationId: r.operationId
        },
        operation: r,
        title: r.summary || r.path,
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
function Ls(e, t) {
  if (t.type === "endpoint") {
    if (t.operationId) {
      const n = e.findIndex(
        (a) => a.kind === "endpoint" && a.route.operationId === t.operationId
      );
      if (n >= 0) return n;
    }
    return e.findIndex(
      (n) => n.kind === "endpoint" && n.route.method === t.method && n.route.path === t.path
    );
  }
  return t.type === "webhook" ? e.findIndex(
    (n) => n.kind === "webhook" && n.route.webhookName === t.webhookName
  ) : -1;
}
async function Os(e, t, n) {
  W(e), W(t);
  const a = n.method.toLowerCase() !== "trace", r = t.parentElement;
  r && a && (r.setAttribute("aria-label", "Try It"), r.classList.add("try-it"));
  const o = k.get(), i = yi(o), s = ze(o), l = i + (n.path.startsWith("/") ? "" : "/") + n.path, u = [], d = N({
    text: n.method.toUpperCase(),
    kind: "method",
    method: n.method,
    size: "m"
  });
  u.push({
    label: s || o.spec?.info.title || "Home",
    href: "/",
    className: "breadcrumb-item",
    onClick: (q) => {
      q.preventDefault(), P("/");
    }
  });
  const p = new Set((o.spec?.tags || []).map((q) => q.name.toLowerCase())), m = (n.path || "/").split("/").filter(Boolean);
  for (const q of m) {
    const V = q.startsWith("{") && q.endsWith("}"), se = !V && p.has(q.toLowerCase()), X = o.spec?.tags.find((Q) => Q.name.toLowerCase() === q.toLowerCase());
    se && X ? u.push({
      label: q,
      href: H({ type: "tag", tag: X.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (Q) => {
        Q.preventDefault(), P(H({ type: "tag", tag: X.name }));
      }
    }) : u.push({
      label: q,
      className: V ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const f = de({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${l}`
  }), h = Ve(u, {
    leading: [d],
    trailing: [f]
  }), v = c("div", { className: "block header" });
  v.append(c("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.description && v.append(c("p", { textContent: n.description }));
  const y = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  y.append(h), v.append(y);
  const b = c("div", { className: "endpoint-meta-row" });
  if (n.deprecated) {
    const q = c("span", { className: "icon-muted" });
    q.innerHTML = T.warning, b.append(c("span", { className: "endpoint-meta deprecated" }, q, "Deprecated"));
  }
  let g = null;
  if (U(n.resolvedSecurity)) {
    const q = er(o, n), V = or(n.resolvedSecurity) || "Auth required", se = Bt({
      configured: q,
      variant: "endpoint",
      title: De(n.resolvedSecurity)
    });
    g = c("span", {
      className: `endpoint-meta auth${q ? " is-active" : " is-missing"}`,
      "aria-label": De(n.resolvedSecurity),
      role: "button",
      tabindex: "0"
    }, se, V), g.classList.add("endpoint-auth-trigger", "focus-ring"), g.addEventListener("click", () => {
      const X = k.get().spec;
      if (!X || !Object.keys(X.securitySchemes || {}).length) return;
      const Q = e.closest(".root") ?? void 0;
      hn(X.securitySchemes, Q, Ps(n, o));
    }), g.addEventListener("keydown", (X) => {
      const Q = X.key;
      Q !== "Enter" && Q !== " " || (X.preventDefault(), g && g.click());
    }), b.append(g);
  }
  b.childElementCount > 0 && v.append(b), e.append(v);
  const A = n.parameters.filter((q) => q.in !== "cookie"), O = D({ title: "Request" }), x = Ts(n, A);
  if (x)
    O.append(x);
  else {
    const q = c("div", { className: "params empty", textContent: "No parameters or request body required" });
    O.append(q);
  }
  e.append(O);
  let L = !1;
  Object.keys(n.responses).length > 0 && (e.append(js(n)), L = !0);
  const C = {
    type: "endpoint",
    method: n.method,
    path: n.path,
    operationId: n.operationId
  }, w = rn(C), $ = rn(C), I = () => {
    if (w && e.append(c("div", { className: "route-nav-wrap is-desktop" }, w)), $) {
      const q = e.closest(".page");
      q && q.append(c("div", { className: "route-nav-wrap is-mobile" }, $));
    }
  };
  L && I(), n.callbacks && n.callbacks.length > 0 && e.append(Bs(n)), L || I();
  const R = Ms(n);
  n.method.toLowerCase() !== "trace" && bs(n, t, R);
  const G = Ee(), Z = h.querySelector(".breadcrumb-item");
  Z && G.on("endpoint:breadcrumb", (q) => {
    Z.textContent = ze(q) || q.spec?.info.title || "Home";
  }), g && U(n.resolvedSecurity) && G.on("endpoint:auth-badge", (q) => {
    const V = er(q, n);
    g.className = `endpoint-meta auth endpoint-auth-trigger focus-ring${V ? " is-active" : " is-missing"}`;
    const se = g.querySelector(".lock-icon");
    se && (se.className = `lock-icon${V ? " is-unlocked" : ""}`);
  });
  const oe = t.querySelector(".content");
  oe && U(n.resolvedSecurity) && G.on("endpoint:auth-headers", (q) => {
    if (!q.spec) return;
    const V = oe.querySelector(".headers-list");
    if (!V) return;
    const se = ["Authorization", "Cookie"];
    for (const Oe of Array.from(V.querySelectorAll(".header-row"))) {
      const E = Oe.querySelector("[data-header-name]");
      E && se.includes(E.value) && Oe.remove();
    }
    const X = gn(n.resolvedSecurity, q.spec.securitySchemes), ct = { ...vn(n.resolvedSecurity, q.spec.securitySchemes), ...X }, Ke = Array.from(V.querySelectorAll(".header-row")), Le = Ke.find((Oe) => {
      const E = Oe.querySelector("[data-header-name]");
      return E && E.value === "Content-Type";
    }) || Ke[0];
    for (const [Oe, E] of Object.entries(ct).reverse()) {
      const j = nt(Oe, E);
      Le ? Le.insertAdjacentElement("beforebegin", j) : V.prepend(j);
    }
    oe.dispatchEvent(new Event("input", { bubbles: !0 }));
  });
}
function Ts(e, t) {
  const n = t.filter((u) => u.in === "path"), a = t.filter((u) => u.in === "query"), r = qs(e), o = $s(e);
  if (n.length === 0 && a.length === 0 && r.length === 0 && !o)
    return null;
  const i = ne(), s = We(), l = c("div", { className: "collapsible-categories" });
  if (n.length > 0) {
    const u = Ce({
      title: "Path",
      content: Qn(n),
      counter: n.length
    });
    l.append(u.root);
  }
  if (a.length > 0) {
    const u = Ce({
      title: "Query",
      content: Qn(a),
      counter: a.length
    });
    l.append(u.root);
  }
  if (r.length > 0) {
    const u = Ce({
      title: "Headers",
      content: Is(r),
      counter: r.length
    });
    l.append(u.root);
  }
  if (o) {
    const u = Ce({
      title: "Body",
      content: o.content,
      trailing: o.trailing,
      counter: o.counter
    });
    l.append(u.root);
  }
  return s.append(l), i.append(s), i;
}
function Qn(e) {
  const t = e.map((r) => {
    const o = c("div", { className: "schema-row role-flat role-params" }), i = c("div", { className: "schema-main-row" }), s = c("div", { className: "schema-name-wrapper" });
    s.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: r.name })
    );
    const l = c("div", { className: "schema-meta-wrapper" });
    l.append(N({
      text: r.schema ? Ge(r.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), r.required && l.append(N({ text: "required", kind: "required", size: "m" })), i.append(s, l), o.append(i);
    const u = c("div", { className: "schema-desc-col is-root" });
    r.description && u.append(c("p", { textContent: r.description }));
    const d = r.schema?.enum, p = r.schema?.default !== void 0;
    if (d && d.length > 0 || p) {
      const m = c("div", { className: "schema-enum-values" });
      if (p && m.append(N({
        text: `Default: ${JSON.stringify(r.schema.default)}`,
        kind: "chip",
        size: "s"
      })), d)
        for (const f of d) {
          const h = String(f);
          h !== r.in && m.append(N({ text: h, kind: "chip", size: "s" }));
        }
      u.append(m);
    }
    return u.children.length > 0 && o.append(u), o;
  }), n = c("div", { className: "params" }), a = c("div", { className: "body role-params" });
  return a.append(...t), n.append(a), n;
}
function qs(e) {
  const t = [];
  if (e.requestBody) {
    const n = Object.keys(e.requestBody.content || {});
    t.push({
      name: "Content-Type",
      value: n[0] || "application/json",
      description: "Media type for request body payload",
      required: !!e.requestBody.required
    });
  }
  if (U(e.resolvedSecurity)) {
    const n = k.get().spec, a = n ? gn(e.resolvedSecurity, n.securitySchemes) : {}, o = { ...n ? vn(e.resolvedSecurity, n.securitySchemes) : {}, ...a };
    for (const [i, s] of Object.entries(o))
      t.push({
        name: i,
        value: s,
        description: "Authentication header value",
        required: !0
      });
  }
  for (const n of e.parameters.filter((a) => a.in === "header"))
    t.push({
      name: n.name,
      value: String(n.schema?.default ?? n.example ?? ""),
      description: n.description,
      required: n.required
    });
  return t;
}
function Is(e) {
  const t = e.map((r) => {
    const o = c("div", { className: "schema-row role-flat role-headers" }), i = c("div", { className: "schema-main-row" }), s = c("div", { className: "schema-name-wrapper" });
    s.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: r.name })
    );
    const l = c("div", { className: "schema-meta-wrapper" });
    r.required && l.append(N({ text: "required", kind: "required", size: "m" })), i.append(s, l), o.append(i);
    const u = c("div", { className: "schema-desc-col is-root" });
    r.description && u.append(c("p", { textContent: r.description }));
    const d = c("div", { className: "schema-enum-values" });
    return d.append(N({
      text: r.value || "—",
      kind: "chip",
      size: "s"
    })), u.append(d), u.children.length > 0 && o.append(u), o;
  }), n = c("div", { className: "params" }), a = c("div", { className: "body role-headers" });
  return a.append(...t), n.append(a), n;
}
function $s(e) {
  const t = c("div", { className: "request-body-wrap" }), n = Object.entries(e.requestBody?.content || {});
  if (e.requestBody?.description && t.append(c("p", { textContent: e.requestBody.description })), n.length === 0)
    return t.childElementCount > 0 ? { content: t } : null;
  const a = n.map(([o, i]) => Ot(o, i, "No schema"));
  if (a.length === 1) {
    const o = a[0];
    return t.append(o.content), { content: t, trailing: yn(o), counter: o.itemsCount };
  }
  const r = c("div", { className: "schema-media-list" });
  for (const o of a) {
    const i = c("div", { className: "schema-media-header" });
    i.append(
      N({ text: o.contentType, kind: "chip", size: "s" }),
      N({ text: o.schemaType, kind: "chip", color: "primary", size: "s" })
    );
    const s = c("div", { className: "schema-media-item" });
    s.append(i, o.content), r.append(s);
  }
  return t.append(r), {
    content: t,
    counter: a.length
  };
}
function js(e) {
  const t = D({
    titleEl: it("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const a = ne(), r = c("div", { className: "card-row responses-header-row" }), o = c("div", { className: "tabs-code codes" });
  let i = n[0][0];
  const s = /* @__PURE__ */ new Map();
  for (const [p, m] of n) {
    const f = Tr(p, p === i), h = m.content && Object.keys(m.content)[0] || "application/json", v = m.content?.[h], y = Ot(h, v, m.description || "No schema"), b = m.headers ? Wr(m.headers) : null;
    s.set(p, {
      body: y,
      headers: b,
      headersCount: m.headers ? Object.keys(m.headers).length : 0
    }), o.append(f), f.addEventListener("click", () => {
      o.querySelectorAll('[data-badge-group="response-code"]').forEach((A) => At(A, !1)), At(f, !0), i = p;
      const g = s.get(p);
      u.innerHTML = "", u.append(Tt(g));
    });
  }
  r.append(o), a.append(jt(r));
  const l = We(), u = c("div"), d = s.get(i);
  return d && u.append(Tt(d)), l.append(u), a.append(l), t.append(a), t;
}
function Bs(e) {
  const t = D({
    titleEl: it("Callbacks", N({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const a = c("div", { className: "callback-block" });
    a.append(c("div", { className: "callback-name", textContent: n.name }));
    for (const r of n.operations) {
      const o = c("div", { className: "callback-operation" }), i = c("div", { className: "callback-op-header" });
      if (i.append(
        N({
          text: r.method.toUpperCase(),
          kind: "method",
          method: r.method
        }),
        c("span", { className: "callback-op-path", textContent: r.path })
      ), o.append(i), r.summary && o.append(c("div", { className: "callback-op-summary", textContent: r.summary })), r.description && o.append(c("p", { textContent: r.description })), r.requestBody) {
        const s = r.requestBody.content || {};
        for (const [l, u] of Object.entries(s))
          u.schema && o.append(tn(u.schema, `${l} — Request Body`));
      }
      if (Object.keys(r.responses).length > 0)
        for (const [s, l] of Object.entries(r.responses)) {
          const u = c("div", { className: "callback-response-row" });
          if (u.append(N({
            text: s,
            kind: "status",
            statusCode: s
          })), l.description && u.append(c("p", { textContent: l.description })), l.content)
            for (const [d, p] of Object.entries(l.content))
              p.schema && u.append(tn(p.schema, `${d}`));
          o.append(u);
        }
      a.append(o);
    }
    t.append(a);
  }
  return t;
}
function Ms(e) {
  const t = Object.keys(e.responses).sort((n, a) => {
    const r = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, o = a.startsWith("2") ? 0 : a.startsWith("4") ? 1 : 2;
    return r - o || n.localeCompare(a);
  });
  for (const n of t) {
    const a = e.responses[n];
    if (!a?.content) continue;
    const r = Object.keys(a.content)[0] || "application/json", o = a.content[r], s = (o ? Fr(o) : [])[0];
    if (s && s.value !== void 0) {
      const l = typeof s.value == "string" ? s.value : JSON.stringify(s.value, null, 2), u = a.description || (n.startsWith("2") ? "OK" : n.startsWith("4") ? "Not Found" : "Error");
      return { statusCode: n, statusText: u, body: l };
    }
    if (o?.example !== void 0) {
      const l = typeof o.example == "string" ? o.example : JSON.stringify(o.example, null, 2);
      return { statusCode: n, statusText: a.description || "OK", body: l };
    }
  }
  return null;
}
function er(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!U(t.resolvedSecurity)) return !1;
  const a = (e.auth.token || "").trim(), r = e.auth.schemes || {}, o = e.auth.activeScheme, i = (s) => String(r[s] || "").trim() ? !0 : a ? !o || o === s : !1;
  return n.some((s) => {
    const l = s.map((u) => u.schemeName);
    return l.length === 0 ? !0 : l.every((u) => i(u));
  });
}
function Ps(e, t) {
  return (e.resolvedSecurity?.requirements || [])[0]?.[0]?.schemeName || t.auth.activeScheme || void 0;
}
function Rs(e, t, n) {
  W(e);
  const a = k.get().spec;
  if (!a) return;
  const r = te(n), o = a.tags.find((g) => g.name === n) || a.tags.find((g) => te(g.name) === r);
  if (!o || o.operations.length === 0) {
    const g = c("div", { className: "block header" });
    g.append(c("h1", { textContent: "Tag not found" })), e.append(g), e.append(D(
      { title: "Details" },
      c("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const i = c("div", { className: "block header" });
  i.append(c("h1", { textContent: o.name }));
  const s = k.get(), l = ze(s), u = de({
    ariaLabel: "Copy category",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => o.name
  }), d = Ve([
    {
      label: l || a.info.title || "Home",
      href: "/",
      className: "breadcrumb-item",
      onClick: (g) => {
        g.preventDefault(), P("/");
      }
    },
    { label: o.name, className: "breadcrumb-current" }
  ], {
    className: "breadcrumb-tag-page",
    leading: [N({ text: "Tag", kind: "chip", size: "m" })],
    trailing: [u]
  }), p = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  p.append(d), i.append(p), o.description && i.append(c("p", { textContent: o.description })), e.append(i);
  const m = Hs(o), f = o.operations.filter((g) => U(g.resolvedSecurity)).length, h = o.operations.filter((g) => g.deprecated).length;
  e.append(D(
    { className: "summary" },
    Rt(
      [
        { label: "Endpoints", value: o.operations.length },
        { label: "Auth Required", value: f },
        { label: "Deprecated", value: h }
      ],
      m
    )
  ));
  const v = D({ title: "Endpoints" }), y = k.get().route;
  for (const g of o.operations) {
    const A = {
      type: "endpoint",
      tag: o.name,
      method: g.method,
      path: g.path,
      operationId: g.operationId
    }, O = y.type === "endpoint" && (y.operationId && y.operationId === g.operationId || y.method === g.method && y.path === g.path), x = ne({
      interactive: !0,
      active: O,
      className: `card-group${g.deprecated ? " deprecated" : ""}`,
      onClick: () => P(H(A))
    }), L = U(g.resolvedSecurity) ? Bt({
      configured: Pt(g.resolvedSecurity, a.securitySchemes || {}),
      variant: "tag",
      title: De(g.resolvedSecurity)
    }) : null, C = c("div", { className: "card-badges" });
    C.append(N({ text: g.method.toUpperCase(), kind: "method", method: g.method, size: "m" }));
    const w = c("div", { className: "card-group-top" });
    L && w.append(L), w.append(c("h3", { className: "card-group-title" }, c("code", { textContent: g.path })), C);
    const $ = g.summary || g.operationId ? c("p", { className: "card-group-description", textContent: g.summary || g.operationId }) : null;
    x.append(w), $ && x.append($), v.append(x);
  }
  e.append(v);
  const b = d.querySelector(".breadcrumb-item");
  b && Ee().on("tag:breadcrumb", (g) => {
    b.textContent = ze(g) || g.spec?.info.title || "Home";
  });
}
function Hs(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function Fs(e, t) {
  W(e);
  const n = N({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), a = N({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), r = k.get(), o = ze(r), i = de({
    ariaLabel: "Copy webhook name",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${t.method.toUpperCase()} ${t.name}`
  }), s = Ve(
    [
      {
        label: o || r.spec?.info.title || "Home",
        href: "/",
        className: "breadcrumb-item",
        onClick: (h) => {
          h.preventDefault(), P("/");
        }
      },
      { label: t.name, className: "breadcrumb-current" }
    ],
    { leading: [n, a], trailing: [i] }
  ), l = c("div", { className: "block header" });
  t.summary ? l.append(c("h1", { textContent: t.summary })) : l.append(c("h1", { textContent: t.name }));
  const u = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  u.append(s), l.append(u), t.description && l.append(c("p", { textContent: t.description })), e.append(l);
  const d = t.parameters.filter((h) => h.in !== "cookie");
  if (d.length > 0) {
    const h = D({ title: "Parameters" }, _s(d));
    e.append(h);
  }
  if (t.requestBody) {
    const h = D({
      titleEl: it("Request")
    }), v = Object.entries(t.requestBody.content || {});
    if (v.length > 0) {
      const y = ne(), b = We(), g = c("div", { className: "collapsible-categories" }), A = c("div", { className: "request-body-wrap" });
      t.requestBody.description && A.append(c("p", { textContent: t.requestBody.description }));
      const O = v.map(([x, L]) => Ot(x, L, "No schema"));
      if (O.length === 1) {
        const x = O[0];
        A.append(x.content);
        const L = Ce({
          title: "Body",
          content: A,
          trailing: yn(x),
          counter: x.itemsCount
        });
        g.append(L.root);
      } else {
        const x = c("div", { className: "schema-media-list" });
        for (const C of O) {
          const w = c("div", { className: "schema-media-header" });
          w.append(
            N({ text: C.contentType, kind: "chip", size: "s" }),
            N({ text: C.schemaType, kind: "chip", color: "primary", size: "s" })
          );
          const $ = c("div", { className: "schema-media-item" });
          $.append(w, C.content), x.append($);
        }
        A.append(x);
        const L = Ce({
          title: "Body",
          content: A,
          counter: O.length
        });
        g.append(L.root);
      }
      b.append(g), y.append(b), h.append(y);
    }
    e.append(h);
  }
  const p = Object.entries(t.responses);
  if (p.length > 0) {
    const h = D({
      titleEl: it("Expected Responses")
    }), v = ne(), y = c("div", { className: "card-row responses-header-row" }), b = c("div", { className: "tabs-code codes" });
    let g = p[0][0];
    const A = /* @__PURE__ */ new Map();
    for (const [C, w] of p) {
      const $ = Tr(C, C === g), I = w.content && Object.keys(w.content)[0] || "application/json", R = w.content?.[I], G = Ot(I, R, w.description || "No schema"), Z = w.headers ? Wr(w.headers) : null;
      A.set(C, {
        body: G,
        headers: Z,
        headersCount: w.headers ? Object.keys(w.headers).length : 0
      }), b.append($), $.addEventListener("click", () => {
        b.querySelectorAll('[data-badge-group="response-code"]').forEach((q) => At(q, !1)), At($, !0), g = C;
        const oe = A.get(C);
        x.innerHTML = "", x.append(Tt(oe));
      });
    }
    y.append(b), v.append(jt(y));
    const O = We(), x = c("div"), L = A.get(g);
    L && x.append(Tt(L)), O.append(x), v.append(O), h.append(v), e.append(h);
  }
  const m = rn({ type: "webhook", webhookName: t.name });
  m && e.append(c("div", { className: "block section" }, m));
  const f = s.querySelector(".breadcrumb-item");
  f && Ee().on("webhook:breadcrumb", (h) => {
    f.textContent = ze(h) || h.spec?.info.title || "Home";
  });
}
function _s(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, a = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Zi(e, { headerTitle: a, withEnumAndDefault: !1 });
}
function Ds() {
  const e = c("div", { className: "page" }), t = c("div", {
    className: "main",
    role: "main"
  }), n = c("div", { className: "content" });
  t.append(n);
  const a = c("div", {
    className: "aside",
    "aria-label": "Panel"
  }), r = c("div", { className: "content" });
  return a.append(r), a.hidden = !0, e.append(t, a), { page: e, main: n, aside: r };
}
function fe(e, t) {
  const n = e.querySelector(".aside");
  n && (n.hidden = !t);
}
function mt(e) {
  const { title: t, message: n, icon: a, variant: r = "empty" } = e;
  if (r === "loading")
    return c(
      "div",
      { className: "block header" },
      c("h2", { textContent: t }),
      c(
        "div",
        { className: "loading" },
        c("div", { className: "spinner" }),
        c("span", null, n || t)
      )
    );
  const o = c("div", { className: "block header" });
  return a && o.append(c("span", { innerHTML: a, className: "icon-muted" })), o.append(c("h2", { textContent: t })), n && o.append(c("p", { className: "error-message", textContent: n })), o;
}
let he = null, ae = null, bn = null, xn = null, kn = null, bt = null, xt = !1, ht = "", He = null;
const Us = 991;
function zs(e, t) {
  he = c("div", { className: "root" });
  const n = {
    primaryColor: t.primaryColor
  };
  Bn(he, k.get().theme, n);
  const a = c("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', a.addEventListener("click", () => {
    k.set({ sidebarOpen: !0 }), ae?.classList.remove("collapsed");
  }), ae = c("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: r, main: o, aside: i } = Ds();
  bn = r, xn = o, kn = i, he.append(a, ae, r), e.append(he), Ys(), k.subscribe((s) => {
    he && (Bn(he, s.theme, n), ae?.classList.toggle("collapsed", !s.sidebarOpen), a.classList.toggle("visible", !s.sidebarOpen), tr(s, t));
  }), ae?.classList.toggle("collapsed", !k.get().sidebarOpen), a.classList.toggle("visible", !k.get().sidebarOpen), tr(k.get(), t);
}
function Ws() {
  He?.(), He = null, Ar(), he && (he.remove(), he = null, ae = null, bn = null, xn = null, kn = null, bt = null, xt = !1);
}
async function tr(e, t) {
  const n = !!e.spec;
  ae && n ? (xt ? ji(ae, e.route) : Mi(ae, t), xt = !0) : xt = !1;
  const a = xn, r = kn, o = bn;
  if (!a || !r || !o) return;
  if (e.loading) {
    fe(o, !1), W(r), et(a, mt({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const m = a.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (e.error) {
    fe(o, !1), W(r), et(a, mt({
      title: "Failed to load API specification",
      message: e.error,
      icon: T.warning,
      variant: "error"
    }));
    const m = a.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (!e.spec) return;
  const i = e.route, s = `${e.activeEnvironment}|${e.auth.token}`, l = !!(bt && Gs(bt, i)), u = l && ht !== s, d = a.parentElement, p = d ? d.scrollTop : 0;
  if (!(l && ht === s)) {
    if (u) {
      ht = s, gi(e), ae && e.spec && (Bi(ae), Ui(ae));
      return;
    }
    switch (bt = { ...i }, ht = s, Ar(), o.querySelectorAll(":scope > .route-nav-wrap").forEach((m) => m.remove()), W(a), W(r), i.type) {
      case "overview":
        fe(o, !1), Dn(a);
        break;
      case "tag": {
        fe(o, !1), Rs(a, r, i.tag || "");
        break;
      }
      case "endpoint": {
        const m = Vs(e, i);
        if (m) {
          const f = m.method.toLowerCase() !== "trace";
          fe(o, f), await Os(a, r, m);
        } else {
          fe(o, !1);
          const f = i.operationId ? i.operationId : `${i.method?.toUpperCase() || ""} ${i.path || ""}`.trim();
          et(a, mt({
            title: "Endpoint not found",
            message: f || "Unknown endpoint",
            variant: "empty"
          }));
        }
        break;
      }
      case "schema": {
        if (fe(o, !1), i.schemaName) {
          const m = e.spec.schemas[i.schemaName];
          if (m) {
            const f = ve(e), h = Se(f), v = de({
              ariaLabel: "Copy schema name",
              copiedAriaLabel: "Copied",
              className: "breadcrumb-copy",
              getText: () => i.schemaName || ""
            }), y = Ve(
              [
                {
                  label: h || e.spec.info.title || "Home",
                  href: "/",
                  className: "breadcrumb-item",
                  onClick: (x) => {
                    x.preventDefault(), P("/");
                  }
                },
                { label: i.schemaName, className: "breadcrumb-current" }
              ],
              {
                leading: [N({ text: "Schema", kind: "chip", size: "m" })],
                trailing: [v]
              }
            ), b = c("div", { className: "block header" });
            b.append(c("h1", { textContent: i.schemaName }));
            const g = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
            g.append(y), b.append(g), m.description && b.append(c("p", { textContent: String(m.description) }));
            const A = c("div", { className: "block section" });
            A.append(tn(m, "Properties")), et(a, b, A);
            const O = y.querySelector(".breadcrumb-item");
            O && Ee().on("schema:breadcrumb", (x) => {
              O.textContent = Se(ve(x)) || x.spec?.info.title || "Home";
            });
          }
        } else
          Js(a, e);
        break;
      }
      case "webhook": {
        if (fe(o, !1), i.webhookName) {
          const m = e.spec.webhooks?.find((f) => f.name === i.webhookName);
          m ? Fs(a, m) : et(a, mt({
            title: "Webhook not found",
            message: i.webhookName,
            variant: "empty"
          }));
        } else
          Ks(a, e);
        break;
      }
      default:
        fe(o, !1), Dn(a);
    }
    d && (d.scrollTop = u ? p : 0);
  }
}
function Vs(e, t) {
  if (!e.spec || t.type !== "endpoint") return null;
  if (t.operationId) {
    const o = e.spec.operations.find((i) => i.operationId === t.operationId);
    if (o) return o;
  }
  const n = (t.method || "").toLowerCase();
  if (!n) return null;
  const a = t.path || "", r = e.spec.operations.filter(
    (o) => o.method.toLowerCase() === n && o.path === a
  );
  if (r.length === 0) return null;
  if (r.length === 1) return r[0];
  if (t.tag) {
    const o = te(t.tag), i = r.find(
      (s) => s.tags.some((l) => te(l) === o)
    );
    if (i) return i;
  }
  return r[0];
}
function Ys() {
  if (He?.(), He = null, typeof window > "u" || typeof window.matchMedia != "function") return;
  const e = window.matchMedia(`(max-width: ${Us}px)`), t = (r) => {
    const o = !r;
    k.get().sidebarOpen !== o && k.set({ sidebarOpen: o });
  };
  t(e.matches);
  const n = (r) => {
    t(r.matches);
  };
  if (typeof e.addEventListener == "function") {
    e.addEventListener("change", n), He = () => e.removeEventListener("change", n);
    return;
  }
  const a = n;
  e.addListener(a), He = () => e.removeListener(a);
}
function Gs(e, t) {
  return e.type === t.type && e.operationId === t.operationId && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
function Ks(e, t) {
  const n = t.spec;
  if (!n) return;
  const a = n.webhooks || [], r = ve(t), o = Se(r), i = c("div", { className: "block header" });
  i.append(c("h1", { textContent: "Webhooks" }));
  const s = Ve([
    {
      label: o || n.info.title || "Home",
      href: "/",
      className: "breadcrumb-item",
      onClick: (m) => {
        m.preventDefault(), P("/");
      }
    },
    { label: "Webhooks", className: "breadcrumb-current" }
  ], {
    leading: [N({ text: "Tag", kind: "chip", size: "m" })],
    trailing: [de({
      ariaLabel: "Copy",
      copiedAriaLabel: "Copied",
      className: "breadcrumb-copy",
      getText: () => "Webhooks"
    })]
  }), l = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  l.append(s), i.append(l), e.append(i);
  const u = s.querySelector(".breadcrumb-item");
  u && Ee().on("webhookList:breadcrumb", (m) => {
    u.textContent = Se(ve(m)) || m.spec?.info.title || "Home";
  });
  const d = {};
  for (const m of a)
    d[m.method] = (d[m.method] || 0) + 1;
  e.append(D(
    { className: "summary" },
    Rt(
      [{ label: "Webhooks", value: a.length }],
      d
    )
  ));
  const p = D({ title: "Webhooks" });
  for (const m of a) {
    const f = { type: "webhook", webhookName: m.name }, h = t.route.type === "webhook" && t.route.webhookName === m.name, v = ne({
      interactive: !0,
      active: h,
      className: "card-group",
      onClick: () => P(H(f))
    }), y = c("div", { className: "card-badges" });
    y.append(
      N({ text: "WH", kind: "webhook", size: "m" }),
      N({ text: m.method.toUpperCase(), kind: "method", method: m.method, size: "m" })
    );
    const b = c("div", { className: "card-group-top" });
    b.append(c("h3", { className: "card-group-title", textContent: m.name }), y);
    const g = c("p", {
      className: "card-group-description",
      textContent: m.summary || m.description || `${m.method.toUpperCase()} webhook`
    });
    v.append(b, g), p.append(v);
  }
  e.append(p);
}
function Js(e, t) {
  const n = t.spec;
  if (!n) return;
  const a = Object.keys(n.schemas), r = ve(t), o = Se(r), i = c("div", { className: "block header" });
  i.append(c("h1", { textContent: "Schemas" }));
  const s = Ve([
    {
      label: o || n.info.title || "Home",
      href: "/",
      className: "breadcrumb-item",
      onClick: (p) => {
        p.preventDefault(), P("/");
      }
    },
    { label: "Schemas", className: "breadcrumb-current" }
  ], {
    leading: [N({ text: "Tag", kind: "chip", size: "m" })],
    trailing: [de({
      ariaLabel: "Copy",
      copiedAriaLabel: "Copied",
      className: "breadcrumb-copy",
      getText: () => "Schemas"
    })]
  }), l = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  l.append(s), i.append(l), e.append(i);
  const u = s.querySelector(".breadcrumb-item");
  u && Ee().on("schemaList:breadcrumb", (p) => {
    u.textContent = Se(ve(p)) || p.spec?.info.title || "Home";
  }), e.append(D(
    { className: "summary" },
    Rt(
      [{ label: "Schemas", value: a.length }],
      {}
    )
  ));
  const d = D({ title: "Schemas" });
  for (const p of a) {
    const m = n.schemas[p], f = { type: "schema", schemaName: p }, h = t.route.type === "schema" && t.route.schemaName === p, v = ne({
      interactive: !0,
      active: h,
      className: "card-group",
      onClick: () => P(H(f))
    }), y = c("div", { className: "card-badges" }), b = m.type || (m.allOf ? "allOf" : m.oneOf ? "oneOf" : m.anyOf ? "anyOf" : "object");
    y.append(N({ text: b, kind: "chip", size: "m" })), m.properties && y.append(N({ text: `${Object.keys(m.properties).length} props`, kind: "chip", size: "m" }));
    const g = c("div", { className: "card-group-top" });
    g.append(c("h3", { className: "card-group-title", textContent: p }), y);
    const A = m.description ? c("p", { className: "card-group-description", textContent: String(m.description) }) : c("p", { className: "card-group-description", textContent: `${b} schema` });
    v.append(g, A), d.append(v);
  }
  e.append(d);
}
const Vr = "ap_portal_prefs";
function Zs() {
  try {
    const e = localStorage.getItem(Vr);
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
function Xs(e) {
  try {
    localStorage.setItem(Vr, JSON.stringify(e));
  } catch {
  }
}
function nr(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function Qs(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], a = nr(e[n]);
  for (let r = 1; r < t.length; r++) {
    const o = t[r], i = nr(e[o]);
    i < a && (a = i, n = o);
  }
  return n;
}
function ec(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), a = Object.entries(t.schemes);
  if (n.length !== a.length) return !1;
  for (const [r, o] of n)
    if (t.schemes[r] !== o) return !1;
  return !0;
}
function tc(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const a = {};
  for (const i of n) {
    const s = e.schemes[i];
    typeof s == "string" && s.length > 0 && (a[i] = s);
  }
  let r = e.activeScheme;
  (!r || !t[r]) && (r = n.find((i) => !!a[i]) || ""), !r && e.token && (r = Qs(t)), r && e.token && !a[r] && (a[r] = e.token);
  let o = e.token;
  return r && a[r] && o !== a[r] && (o = a[r]), !o && r && a[r] && (o = a[r]), {
    ...e,
    schemes: a,
    activeScheme: r,
    token: o
  };
}
function nc(e, t) {
  let n;
  return ((...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  });
}
let qt = !1, an = null, on = null;
function rc(e) {
  const t = e.mount;
  if (t) {
    const o = typeof t == "string" ? document.querySelector(t) : t;
    if (!o)
      throw new Error(`[PureDocs] Mount target not found: ${String(t)}`);
    return o;
  }
  const n = e.mountId || "puredocs", a = document.getElementById(n);
  if (a) return a;
  const r = document.createElement("div");
  return r.id = n, document.body.append(r), r;
}
function ac(e) {
  if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((r) => r.getAttribute("href") === e)) return;
  const a = document.createElement("link");
  a.rel = "stylesheet", a.href = e, document.head.append(a);
}
function oc(e) {
  document.documentElement.style.minHeight = "100%", document.body.style.minHeight = "100vh", document.body.style.margin = "0", e.style.minHeight = "100vh", e.style.display = "block";
}
function ic(e) {
  const t = (e || "/").replace(/\/+/g, "/"), n = t.indexOf("/~/");
  if (n >= 0) return `${t.slice(0, n) || ""}/`;
  if (t.endsWith("/~")) return `${t.slice(0, -2) || ""}/`;
  if (t.endsWith("/")) return t;
  const a = t.split("/").filter(Boolean).pop() || "";
  if (a && !a.includes(".")) return `${t}/`;
  const r = t.lastIndexOf("/");
  return r < 0 ? "/" : t.slice(0, r + 1);
}
function sc(e) {
  if (!e || /^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(e) || e.startsWith("/")) return e;
  const n = new URL(window.location.href);
  return n.pathname = ic(window.location.pathname || "/"), n.search = "", n.hash = "", new URL(e, n.href).toString();
}
async function Cn(e) {
  let t = null;
  qt && (t = k.get().auth, wn());
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  k.reset();
  const a = [{ name: "default", baseUrl: "" }];
  k.set({
    loading: !0,
    theme: di(e.theme),
    environments: [...a],
    initialEnvironments: [...a],
    activeEnvironment: "default"
  });
  const r = Zs();
  r ? k.set({
    activeEnvironment: r.activeEnvironment || "default",
    auth: r.auth
  }) : t && k.setAuth(t);
  const o = nc(() => {
    const i = k.get();
    Xs({
      activeEnvironment: i.activeEnvironment,
      environments: i.environments,
      auth: i.auth
    });
  }, 300);
  k.subscribe(() => o()), Qr(""), on = $i(), zs(n, e), qt = !0;
  try {
    let i;
    const s = e.specUrl;
    if (e.spec)
      i = e.spec;
    else if (s)
      i = await si(sc(s));
    else
      throw new Error("Either spec or specUrl must be provided");
    const l = Jo(i);
    if (l.servers.length > 0) {
      const p = l.servers.map((h, v) => ({
        name: h.description || (v === 0 ? "default" : `Server ${v + 1}`),
        baseUrl: h.url
      }));
      k.set({ environments: p, initialEnvironments: p.map((h) => ({ ...h })) });
      const m = k.get();
      p.some((h) => h.name === m.activeEnvironment) || k.set({ activeEnvironment: p[0]?.name || "default" });
    }
    const u = k.get().auth, d = tc(u, l.securitySchemes);
    ec(u, d) || k.setAuth(d), ci(l), k.set({ spec: l, loading: !1, error: null });
  } catch (i) {
    k.set({
      loading: !1,
      error: i.message || "Failed to load specification"
    });
  }
  return an = lc(), an;
}
async function cc(e) {
  if (typeof document > "u")
    throw new Error("[PureDocs] bootstrap() requires a browser environment");
  const t = rc(e);
  e.cssHref && ac(e.cssHref), e.fullPage !== !1 && oc(t);
  const { mount: n, mountId: a, cssHref: r, fullPage: o, ...i } = e;
  return Cn({
    ...i,
    mount: t
  });
}
function wn() {
  qt && (on?.(), on = null, ea(), Ws(), k.reset(), qt = !1, an = null);
}
function lc() {
  return {
    getState: () => k.get(),
    subscribe: (e) => k.subscribe(e),
    setToken: (e) => {
      const t = k.get().auth.activeScheme;
      t ? k.setSchemeValue(t, e) : k.setAuth({ token: e, source: "manual" });
    },
    setEnvironment: (e) => k.setActiveEnvironment(e),
    navigate: (e) => P(e)
  };
}
const rr = [
  "spec-url",
  "spec-json",
  "theme",
  "primary-color",
  "title"
], me = class me extends HTMLElement {
  constructor() {
    super(...arguments), this.api = null, this.reloadTimer = null;
  }
  static get observedAttributes() {
    return [...rr];
  }
  async connectedCallback() {
    if (me.activeElement && me.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    me.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    me.activeElement === this && (this.api = null, wn(), me.activeElement = null);
  }
  attributeChangedCallback(t, n, a) {
    this.isConnected && n !== a && rr.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
      this.reload();
    }, 80));
  }
  async reload() {
    me.activeElement === this && await this.mountFromAttributes();
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
  async mountFromAttributes() {
    try {
      this.innerHTML = "";
      const t = this.parseConfig();
      this.removeAttribute("title"), this.api = await Cn({ ...t, mount: this });
    } catch (t) {
      const n = t instanceof Error ? t.message : String(t);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${n}</div>`;
    }
  }
  parseConfig() {
    const t = this.getAttribute("spec-json");
    return {
      specUrl: this.getAttribute("spec-url") || void 0,
      spec: t ? uc(t, "spec-json") : void 0,
      theme: dc(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      title: this.getAttribute("title") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
me.activeElement = null;
let sn = me;
function uc(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function dc(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", sn);
const pc = {
  mount: Cn,
  bootstrap: cc,
  unmount: wn,
  version: "1.0.0"
};
export {
  pc as PureDocs,
  sn as PureDocsElement,
  pc as default
};
//# sourceMappingURL=puredocs.js.map
