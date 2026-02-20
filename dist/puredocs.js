class Xr {
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
const k = new Xr(), Qr = /* @__PURE__ */ new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace"
]);
function ea(e = "") {
  window.addEventListener("hashchange", Xt), Xt();
}
function ta() {
  window.removeEventListener("hashchange", Xt);
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
      return `/${ne(e.tag || "")}`;
    case "endpoint": {
      const t = e.tag || "default", n = (e.method || "get").toLowerCase(), a = e.path || "/";
      return `/${ne(t)}/${n}${a}`;
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
function or(e) {
  const t = ra(e);
  if (t === "/" || t === "") return { type: "overview" };
  const n = t.slice(1).split("/");
  if (n.length === 0) return { type: "overview" };
  const a = xe(n[0]).toLowerCase();
  if (a === "schemas")
    return n.length >= 2 ? { type: "schema", schemaName: xe(n.slice(1).join("/")) } : { type: "schema" };
  if (a === "webhooks")
    return n.length >= 2 ? { type: "webhook", webhookName: xe(n.slice(1).join("/")) } : { type: "webhook" };
  if (a === "guides" && n.length >= 2)
    return {
      type: "guide",
      guidePath: xe(n.slice(1).join("/"))
    };
  if (n.length === 1)
    return { type: "tag", tag: xe(n[0]) };
  const r = n[1].toLowerCase();
  if (Qr.has(r)) {
    const o = xe(n[0]), i = r, s = n.length > 2 ? "/" + n.slice(2).map(xe).join("/") : "/";
    return { type: "endpoint", tag: o, method: i, path: s };
  }
  return { type: "tag", tag: xe(n[0]) };
}
function ne(e) {
  return e.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function xe(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function na() {
  const e = window.location.hash;
  return !e || e === "#" || e === "#/" ? "/" : e.slice(1);
}
function Xt() {
  const e = na(), t = or(e);
  k.setRoute(t);
}
function ra(e) {
  const t = e.split("?")[0] || "/";
  return (t.startsWith("/") ? t : `/${t}`).replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
}
function it(e) {
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
function ln(e, t, n) {
  if (!e || e.length === 0)
    return { explicitlyNoAuth: n, requirements: [] };
  const a = e.map((r) => Object.entries(r).map(([o, i]) => ({
    schemeName: o,
    scopes: Array.isArray(i) ? i : [],
    scheme: t[o]
  })));
  return { explicitlyNoAuth: n, requirements: a };
}
function z(e) {
  return !!(e && !e.explicitlyNoAuth && e.requirements.length > 0);
}
function un(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function aa(e) {
  if (!z(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const a of e.requirements)
    for (const r of a) {
      const o = un(r.scheme);
      t.has(o) || (t.add(o), n.push(o));
    }
  return n;
}
function ir(e) {
  const t = aa(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function ze(e) {
  return z(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((a) => {
    const r = un(a.scheme);
    return a.scopes.length > 0 ? `${r} [${a.scopes.join(", ")}]` : r;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function $t(e, t, n, a) {
  const r = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!z(e)) return r;
  for (const s of e.requirements) {
    if (!s.every((d) => !!t[d.schemeName]) && s.length > 0) continue;
    const u = En(s, t);
    if (Object.keys(u.headers).length > 0 || Object.keys(u.query).length > 0 || Object.keys(u.cookies).length > 0)
      return u;
  }
  return !a || !n ? r : En([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: a });
}
function oa(e) {
  const t = {};
  if (!z(e)) return t;
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
function En(e, t) {
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
function sr(e) {
  return typeof e > "u" || e === null;
}
function ia(e) {
  return typeof e == "object" && e !== null;
}
function sa(e) {
  return Array.isArray(e) ? e : sr(e) ? [] : [e];
}
function ca(e, t) {
  var n, a, r, o;
  if (t)
    for (o = Object.keys(t), n = 0, a = o.length; n < a; n += 1)
      r = o[n], e[r] = t[r];
  return e;
}
function la(e, t) {
  var n = "", a;
  for (a = 0; a < t; a += 1)
    n += e;
  return n;
}
function ua(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
var da = sr, pa = ia, fa = sa, ma = la, ha = ua, ga = ca, J = {
  isNothing: da,
  isObject: pa,
  toArray: fa,
  repeat: ma,
  isNegativeZero: ha,
  extend: ga
};
function cr(e, t) {
  var n = "", a = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), a + " " + n) : a;
}
function st(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = cr(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
st.prototype = Object.create(Error.prototype);
st.prototype.constructor = st;
st.prototype.toString = function(t) {
  return this.name + ": " + cr(this, t);
};
var ve = st;
function Ut(e, t, n, a, r) {
  var o = "", i = "", s = Math.floor(r / 2) - 1;
  return a - t > s && (o = " ... ", t = a - s + o.length), n - a > s && (i = " ...", n = a + s - i.length), {
    str: o + e.slice(t, n).replace(/\t/g, "→") + i,
    pos: a - t + o.length
    // relative position
  };
}
function zt(e, t) {
  return J.repeat(" ", t - e.length) + e;
}
function va(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var n = /\r?\n|\r|\0/g, a = [0], r = [], o, i = -1; o = n.exec(e.buffer); )
    r.push(o.index), a.push(o.index + o[0].length), e.position <= o.index && i < 0 && (i = a.length - 2);
  i < 0 && (i = a.length - 1);
  var s = "", c, u, d = Math.min(e.line + t.linesAfter, r.length).toString().length, p = t.maxLength - (t.indent + d + 3);
  for (c = 1; c <= t.linesBefore && !(i - c < 0); c++)
    u = Ut(
      e.buffer,
      a[i - c],
      r[i - c],
      e.position - (a[i] - a[i - c]),
      p
    ), s = J.repeat(" ", t.indent) + zt((e.line - c + 1).toString(), d) + " | " + u.str + `
` + s;
  for (u = Ut(e.buffer, a[i], r[i], e.position, p), s += J.repeat(" ", t.indent) + zt((e.line + 1).toString(), d) + " | " + u.str + `
`, s += J.repeat("-", t.indent + d + 3 + u.pos) + `^
`, c = 1; c <= t.linesAfter && !(i + c >= r.length); c++)
    u = Ut(
      e.buffer,
      a[i + c],
      r[i + c],
      e.position - (a[i] - a[i + c]),
      p
    ), s += J.repeat(" ", t.indent) + zt((e.line + c + 1).toString(), d) + " | " + u.str + `
`;
  return s.replace(/\n$/, "");
}
var ya = va, ba = [
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
], xa = [
  "scalar",
  "sequence",
  "mapping"
];
function ka(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(a) {
      t[String(a)] = n;
    });
  }), t;
}
function wa(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (ba.indexOf(n) === -1)
      throw new ve('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = ka(t.styleAliases || null), xa.indexOf(this.kind) === -1)
    throw new ve('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var G = wa;
function Ln(e, t) {
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
function Qt(e) {
  return this.extend(e);
}
Qt.prototype.extend = function(t) {
  var n = [], a = [];
  if (t instanceof G)
    a.push(t);
  else if (Array.isArray(t))
    a = a.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (a = a.concat(t.explicit));
  else
    throw new ve("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(o) {
    if (!(o instanceof G))
      throw new ve("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new ve("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new ve("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), a.forEach(function(o) {
    if (!(o instanceof G))
      throw new ve("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var r = Object.create(Qt.prototype);
  return r.implicit = (this.implicit || []).concat(n), r.explicit = (this.explicit || []).concat(a), r.compiledImplicit = Ln(r, "implicit"), r.compiledExplicit = Ln(r, "explicit"), r.compiledTypeMap = Ca(r.compiledImplicit, r.compiledExplicit), r;
};
var Na = Qt, Sa = new G("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), Aa = new G("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), Ea = new G("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), La = new Na({
  explicit: [
    Sa,
    Aa,
    Ea
  ]
});
function Oa(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Ta() {
  return null;
}
function qa(e) {
  return e === null;
}
var Ia = new G("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Oa,
  construct: Ta,
  predicate: qa,
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
function $a(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function ja(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Ba(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Ma = new G("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: $a,
  construct: ja,
  predicate: Ba,
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
function Pa(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Ra(e) {
  return 48 <= e && e <= 55;
}
function Ha(e) {
  return 48 <= e && e <= 57;
}
function _a(e) {
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
          if (!Pa(e.charCodeAt(n))) return !1;
          a = !0;
        }
      return a && r !== "_";
    }
    if (r === "o") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Ra(e.charCodeAt(n))) return !1;
          a = !0;
        }
      return a && r !== "_";
    }
  }
  if (r === "_") return !1;
  for (; n < t; n++)
    if (r = e[n], r !== "_") {
      if (!Ha(e.charCodeAt(n)))
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
function Da(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !J.isNegativeZero(e);
}
var Ua = new G("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: _a,
  construct: Fa,
  predicate: Da,
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
}), za = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Wa(e) {
  return !(e === null || !za.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function Va(e) {
  var t, n;
  return t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
var Ya = /^[-+]?[0-9]+e/;
function Ga(e, t) {
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
  else if (J.isNegativeZero(e))
    return "-0.0";
  return n = e.toString(10), Ya.test(n) ? n.replace("e", ".e") : n;
}
function Ka(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || J.isNegativeZero(e));
}
var Ja = new G("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Wa,
  construct: Va,
  predicate: Ka,
  represent: Ga,
  defaultStyle: "lowercase"
}), Za = La.extend({
  implicit: [
    Ia,
    Ma,
    Ua,
    Ja
  ]
}), Xa = Za, lr = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), ur = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Qa(e) {
  return e === null ? !1 : lr.exec(e) !== null || ur.exec(e) !== null;
}
function eo(e) {
  var t, n, a, r, o, i, s, c = 0, u = null, d, p, m;
  if (t = lr.exec(e), t === null && (t = ur.exec(e)), t === null) throw new Error("Date resolve error");
  if (n = +t[1], a = +t[2] - 1, r = +t[3], !t[4])
    return new Date(Date.UTC(n, a, r));
  if (o = +t[4], i = +t[5], s = +t[6], t[7]) {
    for (c = t[7].slice(0, 3); c.length < 3; )
      c += "0";
    c = +c;
  }
  return t[9] && (d = +t[10], p = +(t[11] || 0), u = (d * 60 + p) * 6e4, t[9] === "-" && (u = -u)), m = new Date(Date.UTC(n, a, r, o, i, s, c)), u && m.setTime(m.getTime() - u), m;
}
function to(e) {
  return e.toISOString();
}
var no = new G("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Qa,
  construct: eo,
  instanceOf: Date,
  represent: to
});
function ro(e) {
  return e === "<<" || e === null;
}
var ao = new G("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: ro
}), dn = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function oo(e) {
  if (e === null) return !1;
  var t, n, a = 0, r = e.length, o = dn;
  for (n = 0; n < r; n++)
    if (t = o.indexOf(e.charAt(n)), !(t > 64)) {
      if (t < 0) return !1;
      a += 6;
    }
  return a % 8 === 0;
}
function io(e) {
  var t, n, a = e.replace(/[\r\n=]/g, ""), r = a.length, o = dn, i = 0, s = [];
  for (t = 0; t < r; t++)
    t % 4 === 0 && t && (s.push(i >> 16 & 255), s.push(i >> 8 & 255), s.push(i & 255)), i = i << 6 | o.indexOf(a.charAt(t));
  return n = r % 4 * 6, n === 0 ? (s.push(i >> 16 & 255), s.push(i >> 8 & 255), s.push(i & 255)) : n === 18 ? (s.push(i >> 10 & 255), s.push(i >> 2 & 255)) : n === 12 && s.push(i >> 4 & 255), new Uint8Array(s);
}
function so(e) {
  var t = "", n = 0, a, r, o = e.length, i = dn;
  for (a = 0; a < o; a++)
    a % 3 === 0 && a && (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]), n = (n << 8) + e[a];
  return r = o % 3, r === 0 ? (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]) : r === 2 ? (t += i[n >> 10 & 63], t += i[n >> 4 & 63], t += i[n << 2 & 63], t += i[64]) : r === 1 && (t += i[n >> 2 & 63], t += i[n << 4 & 63], t += i[64], t += i[64]), t;
}
function co(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var lo = new G("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: oo,
  construct: io,
  predicate: co,
  represent: so
}), uo = Object.prototype.hasOwnProperty, po = Object.prototype.toString;
function fo(e) {
  if (e === null) return !0;
  var t = [], n, a, r, o, i, s = e;
  for (n = 0, a = s.length; n < a; n += 1) {
    if (r = s[n], i = !1, po.call(r) !== "[object Object]") return !1;
    for (o in r)
      if (uo.call(r, o))
        if (!i) i = !0;
        else return !1;
    if (!i) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function mo(e) {
  return e !== null ? e : [];
}
var ho = new G("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: fo,
  construct: mo
}), go = Object.prototype.toString;
function vo(e) {
  if (e === null) return !0;
  var t, n, a, r, o, i = e;
  for (o = new Array(i.length), t = 0, n = i.length; t < n; t += 1) {
    if (a = i[t], go.call(a) !== "[object Object]" || (r = Object.keys(a), r.length !== 1)) return !1;
    o[t] = [r[0], a[r[0]]];
  }
  return !0;
}
function yo(e) {
  if (e === null) return [];
  var t, n, a, r, o, i = e;
  for (o = new Array(i.length), t = 0, n = i.length; t < n; t += 1)
    a = i[t], r = Object.keys(a), o[t] = [r[0], a[r[0]]];
  return o;
}
var bo = new G("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: vo,
  construct: yo
}), xo = Object.prototype.hasOwnProperty;
function ko(e) {
  if (e === null) return !0;
  var t, n = e;
  for (t in n)
    if (xo.call(n, t) && n[t] !== null)
      return !1;
  return !0;
}
function wo(e) {
  return e !== null ? e : {};
}
var Co = new G("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: ko,
  construct: wo
}), No = Xa.extend({
  implicit: [
    no,
    ao
  ],
  explicit: [
    lo,
    ho,
    bo,
    Co
  ]
}), Se = Object.prototype.hasOwnProperty, wt = 1, dr = 2, pr = 3, Ct = 4, Wt = 1, So = 2, On = 3, Ao = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Eo = /[\x85\u2028\u2029]/, Lo = /[,\[\]\{\}]/, fr = /^(?:!|!!|![a-z\-]+!)$/i, mr = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function Tn(e) {
  return Object.prototype.toString.call(e);
}
function ue(e) {
  return e === 10 || e === 13;
}
function Be(e) {
  return e === 9 || e === 32;
}
function te(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function He(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Oo(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function To(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function qo(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function qn(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function Io(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function hr(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
var gr = new Array(256), vr = new Array(256);
for (var Pe = 0; Pe < 256; Pe++)
  gr[Pe] = qn(Pe) ? 1 : 0, vr[Pe] = qn(Pe);
function $o(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || No, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function yr(e, t) {
  var n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = ya(n), new ve(t, n);
}
function S(e, t) {
  throw yr(e, t);
}
function Nt(e, t) {
  e.onWarning && e.onWarning.call(null, yr(e, t));
}
var In = {
  YAML: function(t, n, a) {
    var r, o, i;
    t.version !== null && S(t, "duplication of %YAML directive"), a.length !== 1 && S(t, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(a[0]), r === null && S(t, "ill-formed argument of the YAML directive"), o = parseInt(r[1], 10), i = parseInt(r[2], 10), o !== 1 && S(t, "unacceptable YAML version of the document"), t.version = a[0], t.checkLineBreaks = i < 2, i !== 1 && i !== 2 && Nt(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, a) {
    var r, o;
    a.length !== 2 && S(t, "TAG directive accepts exactly two arguments"), r = a[0], o = a[1], fr.test(r) || S(t, "ill-formed tag handle (first argument) of the TAG directive"), Se.call(t.tagMap, r) && S(t, 'there is a previously declared suffix for "' + r + '" tag handle'), mr.test(o) || S(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      S(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[r] = o;
  }
};
function Ne(e, t, n, a) {
  var r, o, i, s;
  if (t < n) {
    if (s = e.input.slice(t, n), a)
      for (r = 0, o = s.length; r < o; r += 1)
        i = s.charCodeAt(r), i === 9 || 32 <= i && i <= 1114111 || S(e, "expected valid JSON character");
    else Ao.test(s) && S(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function $n(e, t, n, a) {
  var r, o, i, s;
  for (J.isObject(n) || S(e, "cannot merge mappings; the provided source object is unacceptable"), r = Object.keys(n), i = 0, s = r.length; i < s; i += 1)
    o = r[i], Se.call(t, o) || (hr(t, o, n[o]), a[o] = !0);
}
function _e(e, t, n, a, r, o, i, s, c) {
  var u, d;
  if (Array.isArray(r))
    for (r = Array.prototype.slice.call(r), u = 0, d = r.length; u < d; u += 1)
      Array.isArray(r[u]) && S(e, "nested arrays are not supported inside keys"), typeof r == "object" && Tn(r[u]) === "[object Object]" && (r[u] = "[object Object]");
  if (typeof r == "object" && Tn(r) === "[object Object]" && (r = "[object Object]"), r = String(r), t === null && (t = {}), a === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (u = 0, d = o.length; u < d; u += 1)
        $n(e, t, o[u], n);
    else
      $n(e, t, o, n);
  else
    !e.json && !Se.call(n, r) && Se.call(t, r) && (e.line = i || e.line, e.lineStart = s || e.lineStart, e.position = c || e.position, S(e, "duplicated mapping key")), hr(t, r, o), delete n[r];
  return t;
}
function pn(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : S(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function F(e, t, n) {
  for (var a = 0, r = e.input.charCodeAt(e.position); r !== 0; ) {
    for (; Be(r); )
      r === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
    if (t && r === 35)
      do
        r = e.input.charCodeAt(++e.position);
      while (r !== 10 && r !== 13 && r !== 0);
    if (ue(r))
      for (pn(e), r = e.input.charCodeAt(e.position), a++, e.lineIndent = 0; r === 32; )
        e.lineIndent++, r = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && a !== 0 && e.lineIndent < n && Nt(e, "deficient indentation"), a;
}
function jt(e) {
  var t = e.position, n;
  return n = e.input.charCodeAt(t), !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || te(n)));
}
function fn(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += J.repeat(`
`, t - 1));
}
function jo(e, t, n) {
  var a, r, o, i, s, c, u, d, p = e.kind, m = e.result, f;
  if (f = e.input.charCodeAt(e.position), te(f) || He(f) || f === 35 || f === 38 || f === 42 || f === 33 || f === 124 || f === 62 || f === 39 || f === 34 || f === 37 || f === 64 || f === 96 || (f === 63 || f === 45) && (r = e.input.charCodeAt(e.position + 1), te(r) || n && He(r)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = i = e.position, s = !1; f !== 0; ) {
    if (f === 58) {
      if (r = e.input.charCodeAt(e.position + 1), te(r) || n && He(r))
        break;
    } else if (f === 35) {
      if (a = e.input.charCodeAt(e.position - 1), te(a))
        break;
    } else {
      if (e.position === e.lineStart && jt(e) || n && He(f))
        break;
      if (ue(f))
        if (c = e.line, u = e.lineStart, d = e.lineIndent, F(e, !1, -1), e.lineIndent >= t) {
          s = !0, f = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = i, e.line = c, e.lineStart = u, e.lineIndent = d;
          break;
        }
    }
    s && (Ne(e, o, i, !1), fn(e, e.line - c), o = i = e.position, s = !1), Be(f) || (i = e.position + 1), f = e.input.charCodeAt(++e.position);
  }
  return Ne(e, o, i, !1), e.result ? !0 : (e.kind = p, e.result = m, !1);
}
function Bo(e, t) {
  var n, a, r;
  if (n = e.input.charCodeAt(e.position), n !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, a = r = e.position; (n = e.input.charCodeAt(e.position)) !== 0; )
    if (n === 39)
      if (Ne(e, a, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39)
        a = e.position, e.position++, r = e.position;
      else
        return !0;
    else ue(n) ? (Ne(e, a, r, !0), fn(e, F(e, !1, t)), a = r = e.position) : e.position === e.lineStart && jt(e) ? S(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position);
  S(e, "unexpected end of the stream within a single quoted scalar");
}
function Mo(e, t) {
  var n, a, r, o, i, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = a = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return Ne(e, n, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (Ne(e, n, e.position, !0), s = e.input.charCodeAt(++e.position), ue(s))
        F(e, !1, t);
      else if (s < 256 && gr[s])
        e.result += vr[s], e.position++;
      else if ((i = To(s)) > 0) {
        for (r = i, o = 0; r > 0; r--)
          s = e.input.charCodeAt(++e.position), (i = Oo(s)) >= 0 ? o = (o << 4) + i : S(e, "expected hexadecimal character");
        e.result += Io(o), e.position++;
      } else
        S(e, "unknown escape sequence");
      n = a = e.position;
    } else ue(s) ? (Ne(e, n, a, !0), fn(e, F(e, !1, t)), n = a = e.position) : e.position === e.lineStart && jt(e) ? S(e, "unexpected end of the document within a double quoted scalar") : (e.position++, a = e.position);
  }
  S(e, "unexpected end of the stream within a double quoted scalar");
}
function Po(e, t) {
  var n = !0, a, r, o, i = e.tag, s, c = e.anchor, u, d, p, m, f, h = /* @__PURE__ */ Object.create(null), v, y, b, g;
  if (g = e.input.charCodeAt(e.position), g === 91)
    d = 93, f = !1, s = [];
  else if (g === 123)
    d = 125, f = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), g = e.input.charCodeAt(++e.position); g !== 0; ) {
    if (F(e, !0, t), g = e.input.charCodeAt(e.position), g === d)
      return e.position++, e.tag = i, e.anchor = c, e.kind = f ? "mapping" : "sequence", e.result = s, !0;
    n ? g === 44 && S(e, "expected the node content, but found ','") : S(e, "missed comma between flow collection entries"), y = v = b = null, p = m = !1, g === 63 && (u = e.input.charCodeAt(e.position + 1), te(u) && (p = m = !0, e.position++, F(e, !0, t))), a = e.line, r = e.lineStart, o = e.position, We(e, t, wt, !1, !0), y = e.tag, v = e.result, F(e, !0, t), g = e.input.charCodeAt(e.position), (m || e.line === a) && g === 58 && (p = !0, g = e.input.charCodeAt(++e.position), F(e, !0, t), We(e, t, wt, !1, !0), b = e.result), f ? _e(e, s, h, y, v, b, a, r, o) : p ? s.push(_e(e, null, h, y, v, b, a, r, o)) : s.push(v), F(e, !0, t), g = e.input.charCodeAt(e.position), g === 44 ? (n = !0, g = e.input.charCodeAt(++e.position)) : n = !1;
  }
  S(e, "unexpected end of the stream within a flow collection");
}
function Ro(e, t) {
  var n, a, r = Wt, o = !1, i = !1, s = t, c = 0, u = !1, d, p;
  if (p = e.input.charCodeAt(e.position), p === 124)
    a = !1;
  else if (p === 62)
    a = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; p !== 0; )
    if (p = e.input.charCodeAt(++e.position), p === 43 || p === 45)
      Wt === r ? r = p === 43 ? On : So : S(e, "repeat of a chomping mode identifier");
    else if ((d = qo(p)) >= 0)
      d === 0 ? S(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : i ? S(e, "repeat of an indentation width identifier") : (s = t + d - 1, i = !0);
    else
      break;
  if (Be(p)) {
    do
      p = e.input.charCodeAt(++e.position);
    while (Be(p));
    if (p === 35)
      do
        p = e.input.charCodeAt(++e.position);
      while (!ue(p) && p !== 0);
  }
  for (; p !== 0; ) {
    for (pn(e), e.lineIndent = 0, p = e.input.charCodeAt(e.position); (!i || e.lineIndent < s) && p === 32; )
      e.lineIndent++, p = e.input.charCodeAt(++e.position);
    if (!i && e.lineIndent > s && (s = e.lineIndent), ue(p)) {
      c++;
      continue;
    }
    if (e.lineIndent < s) {
      r === On ? e.result += J.repeat(`
`, o ? 1 + c : c) : r === Wt && o && (e.result += `
`);
      break;
    }
    for (a ? Be(p) ? (u = !0, e.result += J.repeat(`
`, o ? 1 + c : c)) : u ? (u = !1, e.result += J.repeat(`
`, c + 1)) : c === 0 ? o && (e.result += " ") : e.result += J.repeat(`
`, c) : e.result += J.repeat(`
`, o ? 1 + c : c), o = !0, i = !0, c = 0, n = e.position; !ue(p) && p !== 0; )
      p = e.input.charCodeAt(++e.position);
    Ne(e, n, e.position, !1);
  }
  return !0;
}
function jn(e, t) {
  var n, a = e.tag, r = e.anchor, o = [], i, s = !1, c;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), c = e.input.charCodeAt(e.position); c !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, S(e, "tab characters must not be used in indentation")), !(c !== 45 || (i = e.input.charCodeAt(e.position + 1), !te(i)))); ) {
    if (s = !0, e.position++, F(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), c = e.input.charCodeAt(e.position);
      continue;
    }
    if (n = e.line, We(e, t, pr, !1, !0), o.push(e.result), F(e, !0, -1), c = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && c !== 0)
      S(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = a, e.anchor = r, e.kind = "sequence", e.result = o, !0) : !1;
}
function Ho(e, t, n) {
  var a, r, o, i, s, c, u = e.tag, d = e.anchor, p = {}, m = /* @__PURE__ */ Object.create(null), f = null, h = null, v = null, y = !1, b = !1, g;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = p), g = e.input.charCodeAt(e.position); g !== 0; ) {
    if (!y && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, S(e, "tab characters must not be used in indentation")), a = e.input.charCodeAt(e.position + 1), o = e.line, (g === 63 || g === 58) && te(a))
      g === 63 ? (y && (_e(e, p, m, f, h, null, i, s, c), f = h = v = null), b = !0, y = !0, r = !0) : y ? (y = !1, r = !0) : S(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, g = a;
    else {
      if (i = e.line, s = e.lineStart, c = e.position, !We(e, n, dr, !1, !0))
        break;
      if (e.line === o) {
        for (g = e.input.charCodeAt(e.position); Be(g); )
          g = e.input.charCodeAt(++e.position);
        if (g === 58)
          g = e.input.charCodeAt(++e.position), te(g) || S(e, "a whitespace character is expected after the key-value separator within a block mapping"), y && (_e(e, p, m, f, h, null, i, s, c), f = h = v = null), b = !0, y = !1, r = !1, f = e.tag, h = e.result;
        else if (b)
          S(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = u, e.anchor = d, !0;
      } else if (b)
        S(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = u, e.anchor = d, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (y && (i = e.line, s = e.lineStart, c = e.position), We(e, t, Ct, !0, r) && (y ? h = e.result : v = e.result), y || (_e(e, p, m, f, h, v, i, s, c), f = h = v = null), F(e, !0, -1), g = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && g !== 0)
      S(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return y && _e(e, p, m, f, h, null, i, s, c), b && (e.tag = u, e.anchor = d, e.kind = "mapping", e.result = p), b;
}
function _o(e) {
  var t, n = !1, a = !1, r, o, i;
  if (i = e.input.charCodeAt(e.position), i !== 33) return !1;
  if (e.tag !== null && S(e, "duplication of a tag property"), i = e.input.charCodeAt(++e.position), i === 60 ? (n = !0, i = e.input.charCodeAt(++e.position)) : i === 33 ? (a = !0, r = "!!", i = e.input.charCodeAt(++e.position)) : r = "!", t = e.position, n) {
    do
      i = e.input.charCodeAt(++e.position);
    while (i !== 0 && i !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), i = e.input.charCodeAt(++e.position)) : S(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; i !== 0 && !te(i); )
      i === 33 && (a ? S(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(t - 1, e.position + 1), fr.test(r) || S(e, "named tag handle cannot contain such characters"), a = !0, t = e.position + 1)), i = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), Lo.test(o) && S(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !mr.test(o) && S(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    S(e, "tag name is malformed: " + o);
  }
  return n ? e.tag = o : Se.call(e.tagMap, r) ? e.tag = e.tagMap[r] + o : r === "!" ? e.tag = "!" + o : r === "!!" ? e.tag = "tag:yaml.org,2002:" + o : S(e, 'undeclared tag handle "' + r + '"'), !0;
}
function Fo(e) {
  var t, n;
  if (n = e.input.charCodeAt(e.position), n !== 38) return !1;
  for (e.anchor !== null && S(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !te(n) && !He(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && S(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function Do(e) {
  var t, n, a;
  if (a = e.input.charCodeAt(e.position), a !== 42) return !1;
  for (a = e.input.charCodeAt(++e.position), t = e.position; a !== 0 && !te(a) && !He(a); )
    a = e.input.charCodeAt(++e.position);
  return e.position === t && S(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), Se.call(e.anchorMap, n) || S(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], F(e, !0, -1), !0;
}
function We(e, t, n, a, r) {
  var o, i, s, c = 1, u = !1, d = !1, p, m, f, h, v, y;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = i = s = Ct === n || pr === n, a && F(e, !0, -1) && (u = !0, e.lineIndent > t ? c = 1 : e.lineIndent === t ? c = 0 : e.lineIndent < t && (c = -1)), c === 1)
    for (; _o(e) || Fo(e); )
      F(e, !0, -1) ? (u = !0, s = o, e.lineIndent > t ? c = 1 : e.lineIndent === t ? c = 0 : e.lineIndent < t && (c = -1)) : s = !1;
  if (s && (s = u || r), (c === 1 || Ct === n) && (wt === n || dr === n ? v = t : v = t + 1, y = e.position - e.lineStart, c === 1 ? s && (jn(e, y) || Ho(e, y, v)) || Po(e, v) ? d = !0 : (i && Ro(e, v) || Bo(e, v) || Mo(e, v) ? d = !0 : Do(e) ? (d = !0, (e.tag !== null || e.anchor !== null) && S(e, "alias node should not have any properties")) : jo(e, v, wt === n) && (d = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : c === 0 && (d = s && jn(e, y))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && S(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), p = 0, m = e.implicitTypes.length; p < m; p += 1)
      if (h = e.implicitTypes[p], h.resolve(e.result)) {
        e.result = h.construct(e.result), e.tag = h.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (Se.call(e.typeMap[e.kind || "fallback"], e.tag))
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
function Uo(e) {
  var t = e.position, n, a, r, o = !1, i;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (i = e.input.charCodeAt(e.position)) !== 0 && (F(e, !0, -1), i = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || i !== 37)); ) {
    for (o = !0, i = e.input.charCodeAt(++e.position), n = e.position; i !== 0 && !te(i); )
      i = e.input.charCodeAt(++e.position);
    for (a = e.input.slice(n, e.position), r = [], a.length < 1 && S(e, "directive name must not be less than one character in length"); i !== 0; ) {
      for (; Be(i); )
        i = e.input.charCodeAt(++e.position);
      if (i === 35) {
        do
          i = e.input.charCodeAt(++e.position);
        while (i !== 0 && !ue(i));
        break;
      }
      if (ue(i)) break;
      for (n = e.position; i !== 0 && !te(i); )
        i = e.input.charCodeAt(++e.position);
      r.push(e.input.slice(n, e.position));
    }
    i !== 0 && pn(e), Se.call(In, a) ? In[a](e, a, r) : Nt(e, 'unknown document directive "' + a + '"');
  }
  if (F(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, F(e, !0, -1)) : o && S(e, "directives end mark is expected"), We(e, e.lineIndent - 1, Ct, !1, !0), F(e, !0, -1), e.checkLineBreaks && Eo.test(e.input.slice(t, e.position)) && Nt(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && jt(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, F(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    S(e, "end of the stream or a document separator is expected");
  else
    return;
}
function zo(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var n = new $o(e, t), a = e.indexOf("\0");
  for (a !== -1 && (n.position = a, S(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    Uo(n);
  return n.documents;
}
function Wo(e, t) {
  var n = zo(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new ve("expected a single document in the stream, but found more");
  }
}
var Vo = Wo, Yo = {
  load: Vo
}, Go = Yo.load;
const Ko = 50, Jo = 200;
function Zo(e) {
  const t = Xo(e.info || {}), n = Qo(e.servers || []), a = e.components || {}, r = ni(a.schemas || {}, e), o = ei(a.securitySchemes || {}), i = it(e.security), s = e.paths || {}, c = {};
  for (const [m, f] of Object.entries(s))
    m.startsWith("/docs") || (c[m] = f);
  const u = ri(c, e, i, o), d = si(u, e.tags || []), p = ai(e.webhooks || {}, e, i, o);
  return { raw: e, info: t, servers: n, tags: d, operations: u, schemas: r, securitySchemes: o, webhooks: p };
}
function Xo(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function Qo(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function ei(e) {
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
const ot = /* @__PURE__ */ new Map();
let mn = 0;
function ti(e, t) {
  if (ot.has(e)) return ot.get(e);
  if (++mn > Jo) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((r) => decodeURIComponent(r.replace(/~1/g, "/").replace(/~0/g, "~")));
  let a = t;
  for (const r of n)
    if (a && typeof a == "object" && !Array.isArray(a))
      a = a[r];
    else
      return;
  return ot.set(e, a), a;
}
function Z(e, t, n = 0, a = /* @__PURE__ */ new Set()) {
  if (n > Ko || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((i) => Z(i, t, n + 1, a));
  const r = e;
  if (typeof r.$ref == "string") {
    const i = r.$ref;
    if (a.has(i)) return { type: "object", description: "[Circular reference]" };
    const s = new Set(a);
    s.add(i);
    const c = ti(i, t);
    return c && typeof c == "object" ? Z(c, t, n + 1, s) : c;
  }
  const o = {};
  for (const [i, s] of Object.entries(r))
    o[i] = Z(s, t, n + 1, a);
  return o;
}
function ni(e, t) {
  ot.clear(), mn = 0;
  const n = {};
  for (const [a, r] of Object.entries(e))
    n[a] = Z(r, t);
  return n;
}
function ri(e, t, n, a) {
  ot.clear(), mn = 0;
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [i, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const c = it(s.security), u = Array.isArray(s.parameters) ? s.parameters.map((d) => Z(d, t)) : [];
    for (const d of o) {
      const p = s[d];
      if (!p) continue;
      const m = br(
        d,
        i,
        p,
        u,
        t,
        c,
        n,
        a
      );
      r.push(m);
    }
  }
  return r;
}
function br(e, t, n, a, r, o = void 0, i = void 0, s = {}) {
  const c = Array.isArray(n.parameters) ? n.parameters.map((x) => Z(x, r)) : [], u = [...a];
  for (const x of c) {
    const L = u.findIndex((w) => w.name === x.name && w.in === x.in);
    L >= 0 ? u[L] = x : u.push(x);
  }
  const d = xr(u, r);
  let p = kr(n.requestBody, r);
  if (Array.isArray(n["x-doc-examples"])) {
    const x = n["x-doc-examples"], L = [];
    for (let w = 0; w < x.length; w++) {
      const C = x[w], $ = C.scenario ? String(C.scenario) : `Example ${w + 1}`, R = C.request?.body;
      R !== void 0 && L.push({ summary: $, value: R });
    }
    if (L.length > 0) {
      p || (p = { required: !1, content: {} });
      const w = p.content["application/json"] || p.content["application/vnd.api+json"] || {};
      p.content["application/json"] || (p.content["application/json"] = w);
      const C = p.content["application/json"];
      C.examples || (C.examples = {});
      for (let $ = 0; $ < L.length; $++) {
        const I = L[$], K = `${I.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${$}`.replace(/^-/, "");
        C.examples[K] = { summary: I.summary, description: I.summary, value: I.value };
      }
    }
  }
  const m = wr(n.responses, r), f = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], h = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), v = Object.prototype.hasOwnProperty.call(n, "security"), y = it(n.security), b = v ? y : o ?? i, g = v && Array.isArray(y) && y.length === 0, A = ii(n.callbacks, r, s), O = {
    operationId: h,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: f,
    deprecated: !!n.deprecated,
    security: b,
    resolvedSecurity: ln(b, s, g),
    parameters: d,
    requestBody: p,
    responses: m
  };
  return A.length > 0 && (O.callbacks = A), O;
}
function ai(e, t, n, a) {
  if (!e || typeof e != "object") return [];
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [i, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const c = Z(s, t), u = it(c.security);
    for (const d of o) {
      const p = c[d];
      if (!p) continue;
      const m = Object.prototype.hasOwnProperty.call(p, "security"), f = it(p.security), h = m ? f : u ?? n, v = m && Array.isArray(f) && f.length === 0, y = Array.isArray(p.parameters) ? p.parameters.map((O) => Z(O, t)) : [], b = xr(y, t), g = kr(p.requestBody, t), A = wr(p.responses, t);
      r.push({
        name: i,
        method: d,
        path: i,
        summary: p.summary ? String(p.summary) : void 0,
        description: p.description ? String(p.description) : void 0,
        security: h,
        resolvedSecurity: ln(h, a, v),
        parameters: b,
        requestBody: g,
        responses: A
      });
    }
  }
  return r;
}
function xr(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? Z(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? Nr(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function kr(e, t) {
  if (!e) return;
  const n = Z(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: Cr(n.content || {}, t)
  };
}
function oi(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, r] of Object.entries(e)) {
    if (!r || typeof r != "object") continue;
    const o = Z(r, t), i = o.schema, s = o.example ?? (i && typeof i == "object" ? i.example : void 0);
    n[a] = {
      description: o.description ? String(o.description) : void 0,
      required: !!o.required,
      schema: i && typeof i == "object" ? Z(i, t) : void 0,
      example: s !== void 0 ? s : void 0,
      deprecated: !!o.deprecated
    };
  }
  return n;
}
function wr(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, r] of Object.entries(e)) {
    const o = Z(r, t), i = o.headers;
    n[a] = {
      statusCode: a,
      description: o.description ? String(o.description) : void 0,
      headers: i ? oi(i, t) : void 0,
      content: o.content ? Cr(o.content, t) : void 0
    };
  }
  return n;
}
function ii(e, t, n) {
  if (!e || typeof e != "object") return [];
  const a = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, i] of Object.entries(e)) {
    const s = Z(i, t);
    if (!s || typeof s != "object") continue;
    const c = [];
    for (const [u, d] of Object.entries(s))
      if (!(!d || typeof d != "object"))
        for (const p of r) {
          const m = d[p];
          m && c.push(br(p, u, m, [], t, void 0, void 0, n));
        }
    c.length > 0 && a.push({ name: o, operations: c });
  }
  return a;
}
function Cr(e, t) {
  const n = {};
  for (const [a, r] of Object.entries(e)) {
    const o = r;
    n[a] = {
      schema: o.schema ? Z(o.schema, t) : void 0,
      example: o.example,
      examples: o.examples ? Nr(o.examples) : void 0
    };
  }
  return n;
}
function Nr(e) {
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
function si(e, t) {
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
function je(e) {
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
          const t = je(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, a] of Object.entries(e.properties))
            t[n] = je(a);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const a = je(n);
            a && typeof a == "object" && !Array.isArray(a) && Object.assign(t, a);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return je(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return je(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, a] of Object.entries(e.properties))
            t[n] = je(a);
          return t;
        }
        return;
    }
  }
}
async function ci(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return Go(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let Re = [];
const Bn = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function li(e) {
  Re = [];
  for (const t of e.tags)
    Re.push({
      type: "tag",
      title: t.name,
      subtitle: t.description,
      tag: t.name,
      keywords: `${t.name} ${t.description || ""}`.toLowerCase()
    });
  for (const t of e.operations)
    Re.push({
      type: "operation",
      title: t.summary || t.operationId,
      subtitle: t.path,
      method: t.method,
      requiresAuth: z(t.resolvedSecurity),
      authBadge: ir(t.resolvedSecurity) || void 0,
      authTitle: z(t.resolvedSecurity) ? ze(t.resolvedSecurity) : void 0,
      resolvedSecurity: t.resolvedSecurity,
      path: t.path,
      tag: t.tags[0],
      operationId: t.operationId,
      keywords: `${t.method} ${t.path} ${t.summary || ""} ${t.description || ""} ${t.operationId} ${t.tags.join(" ")}`.toLowerCase()
    });
  for (const [t, n] of Object.entries(e.schemas))
    Re.push({
      type: "schema",
      title: t,
      subtitle: n.description || "Schema",
      schemaName: t,
      keywords: `${t} ${n.description || ""} schema model`.toLowerCase()
    });
  if (e.webhooks)
    for (const t of e.webhooks)
      Re.push({
        type: "webhook",
        title: t.summary || t.name,
        subtitle: `${t.method.toUpperCase()} Webhook`,
        method: t.method,
        webhookName: t.name,
        keywords: `${t.name} ${t.method} ${t.summary || ""} ${t.description || ""} webhook`.toLowerCase()
      });
}
function ui(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), a = [];
  for (const r of Re) {
    let o = 0, i = !0;
    for (const s of n)
      r.keywords.includes(s) ? (o += 1, r.title.toLowerCase().includes(s) && (o += 3), r.path?.toLowerCase().includes(s) && (o += 2), r.method?.toLowerCase() === s && (o += 2)) : i = !1;
    i && o > 0 && a.push({ entry: r, score: o });
  }
  return a.sort((r, o) => {
    const i = Bn[r.entry.type] ?? 99, s = Bn[o.entry.type] ?? 99;
    return i !== s ? i - s : o.score !== r.score ? o.score - r.score : r.entry.title.localeCompare(o.entry.title);
  }).slice(0, t).map((r) => r.entry);
}
const Sr = "puredocs-theme";
function Mn(e, t, n) {
  const a = e.classList.contains("light") || e.classList.contains("dark");
  a && e.classList.add("theme-transitioning"), e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color"), a && setTimeout(() => e.classList.remove("theme-transitioning"), 550);
}
function di() {
  const t = k.get().theme === "light" ? "dark" : "light";
  k.set({ theme: t });
  try {
    localStorage.setItem(Sr, t);
  } catch {
  }
}
function pi(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(Sr);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function Ar(e) {
  const t = e.trim();
  return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function Me(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function fi(e) {
  const t = e.trim().toLowerCase();
  return t.startsWith("http://") || t.startsWith("https://");
}
function mi(e) {
  if (!e || typeof e != "string") return "";
  let t = Me(e);
  return t = t.replace(/`([^`]*)`/g, "<code>$1</code>"), t = t.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (n, a, r) => fi(r) ? `<a href="${Me(r)}" target="_blank" rel="noopener noreferrer">${a}</a>` : `[${a}](${Me(r)})`), t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"), t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>"), t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>"), t = t.replace(/\n\n+/g, '</p><p class="md-p">'), t = t.replace(/\n/g, "<br>"), t ? `<p class="md-p">${t}</p>` : "";
}
function l(e, t, ...n) {
  const a = document.createElement(e);
  if (t)
    for (const [r, o] of Object.entries(t))
      o === void 0 || o === !1 || (r.startsWith("on") && typeof o == "function" ? a.addEventListener(r.slice(2).toLowerCase(), o) : r === "className" ? a.className = String(o) : r === "innerHTML" ? a.innerHTML = String(o) : r === "textContent" ? a.textContent = String(o) : o === !0 ? a.setAttribute(r, "") : a.setAttribute(r, String(o)));
  for (const r of n)
    r == null || r === !1 || (typeof r == "string" ? a.appendChild(document.createTextNode(r)) : a.appendChild(r));
  return a;
}
function V(e) {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
}
function nt(e, ...t) {
  V(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
function _(e, t = "description md-content") {
  const n = document.createElement("div");
  return n.className = t, n.innerHTML = mi(e), n;
}
async function hi(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function gi(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], a = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** a).toFixed(a > 0 ? 1 : 0)} ${n[a]}`;
}
function vi(e) {
  return e < 1e3 ? `${Math.round(e)} ms` : `${(e / 1e3).toFixed(2)} s`;
}
const D = (e, t) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${1.75}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, T = {
  search: D('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  close: D('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: D('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  chevronDown: D('<path d="m6 9 6 6 6-6"/>'),
  chevronRight: D('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: D('<path d="m15 18-6-6 6-6"/>'),
  sun: D('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: D('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  copy: D('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  check: D('<path d="M20 6 9 17l-5-5"/>'),
  /** Closed padlock — requires auth (red) */
  lock: D('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>'),
  /** Open padlock — auth configured (green) */
  unlock: D('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M16 11V7a4 4 0 1 0-8 0v1"/>'),
  send: D('<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>'),
  key: D('<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>'),
  globe: D('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  server: D('<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>'),
  warning: D('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  settings: D('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>')
};
class yi {
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
let De = null;
function Le() {
  return De || (De = new yi()), De;
}
function bi(e) {
  De?.notify(e);
}
function Er() {
  De?.dispose(), De = null;
}
function xi(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function ye(e) {
  return xi(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function Lr(e) {
  return String(e || "").replace(/\/$/, "");
}
function Ae(e) {
  return Lr(e).replace(/^https?:\/\//i, "");
}
function ki(e) {
  return Lr(ye(e));
}
function Ve(e) {
  return Ae(ye(e));
}
function St(e) {
  const { options: t, value: n, ariaLabel: a, onChange: r, className: o, variant: i = "default", invalid: s, dataAttrs: c } = e, u = document.createElement("select");
  i === "inline" && u.setAttribute("data-variant", "inline");
  const d = [];
  if (s && d.push("invalid"), o && d.push(o), u.className = d.join(" "), a && u.setAttribute("aria-label", a), c)
    for (const [p, m] of Object.entries(c))
      u.dataset[p] = m;
  for (const p of t) {
    const m = document.createElement("option");
    m.value = p.value, m.textContent = p.label, n !== void 0 && p.value === n && (m.selected = !0), u.appendChild(m);
  }
  return r && u.addEventListener("change", () => r(u.value)), u;
}
function Ee(e) {
  const {
    type: t = "text",
    placeholder: n,
    value: a,
    ariaLabel: r,
    required: o,
    readOnly: i,
    invalid: s,
    modifiers: c,
    dataAttrs: u,
    className: d,
    onInput: p,
    onChange: m
  } = e, f = document.createElement("input");
  f.type = t, f.setAttribute("autocomplete", "off");
  const h = [];
  if (c?.includes("filled") && h.push("filled"), s && h.push("invalid"), d && h.push(d), f.className = h.join(" "), n && (f.placeholder = n), a !== void 0 && (f.value = a), r && f.setAttribute("aria-label", r), o && (f.required = !0), i && (f.readOnly = !0), u)
    for (const [v, y] of Object.entries(u))
      f.dataset[v] = y;
  return p && f.addEventListener("input", () => p(f.value)), m && f.addEventListener("change", () => m(f.value)), f;
}
const wi = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function Ci(e = "secondary") {
  return ["btn", ...wi[e]];
}
function de(e) {
  const { variant: t = "secondary", label: n, icon: a, ariaLabel: r, disabled: o, className: i, onClick: s } = e, c = document.createElement("button");
  c.type = "button";
  const u = Ci(t);
  if (i && u.push(...i.split(/\s+/).filter(Boolean)), c.className = u.join(" "), a) {
    const d = document.createElement("span");
    d.className = "btn-icon-slot", d.innerHTML = a, c.appendChild(d);
  }
  if (n) {
    const d = document.createElement("span");
    d.textContent = n, c.appendChild(d);
  }
  return r && c.setAttribute("aria-label", r), o && (c.disabled = !0), s && c.addEventListener("click", s), c;
}
function Or(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : e === "primary" ? "u-text-accent" : `u-text-${e}`;
}
function hn(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : e === "primary" ? "u-bg-accent-soft" : `u-bg-${e}-soft`;
}
function Ni(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function Tr(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function Si(e, t) {
  return e.color ? e.color : t === "method" ? Ni(e.method || e.text) : t === "status" ? Tr(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function N(e) {
  const t = document.createElement("span"), n = e.kind || "chip", a = Si(e, n), o = ["badge", e.size || "m"];
  return n === "status" && o.push("status"), n === "required" && o.push("required"), o.push(Or(a), hn(a)), e.className && o.push(e.className), t.className = o.join(" "), t.textContent = e.text, t;
}
function At(e, t) {
  const n = t?.active ?? !1, a = t?.context ?? !1, r = document.createElement("button");
  return r.type = "button", r.className = `badge m interactive${n ? " is-active" : ""}`, a && (r.dataset.badgeContext = "true"), r.textContent = e, r;
}
function qr(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const a = Tr(e), r = ["badge", "status", "m", "interactive", Or(a)];
  return t && r.push("is-active", hn(a)), n.className = r.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = a, n.textContent = e, n;
}
function Et(e, t) {
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
  e.classList.add(hn(n));
}
function re(e) {
  const { simple: t, interactive: n, active: a, className: r, onClick: o } = e || {}, i = document.createElement("div"), s = ["card"];
  return t && s.push("simple"), n && s.push("interactive"), a && s.push("active"), r && s.push(r), i.className = s.join(" "), o && (i.classList.contains("interactive") || i.classList.add("interactive"), i.addEventListener("click", o)), i;
}
function Bt(...e) {
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
function Ye(e) {
  const t = document.createElement("div"), n = ["card-content"];
  return n.push("flush"), t.className = n.join(" "), t;
}
function Pn(e) {
  if (typeof e == "string" || typeof e == "number") {
    const t = document.createElement("span");
    return t.textContent = String(e), t;
  }
  return e;
}
function Ai(e) {
  const t = document.createElement("div");
  if (t.className = `card-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append(Pn(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? N({ text: String(e.trailing), kind: "chip", size: "m" }) : Pn(e.trailing);
    t.append(n);
  }
  return t;
}
function Ei(e) {
  return typeof e == "string" ? l("span", { textContent: e }) : e;
}
function Ir(e) {
  return l("h2", { textContent: e });
}
function ct(e, t) {
  const n = l("div", { className: "section-head" });
  return n.append(typeof e == "string" ? Ir(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? N({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function U(e, ...t) {
  const n = l("div", { className: `block section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(ct(e.title, e.badge)) : n.append(Ir(e.title)));
  for (const a of t) n.append(Ei(a));
  return n;
}
function Ge(e, t) {
  const n = l("nav", {
    className: `breadcrumb${t?.className ? ` ${t.className}` : ""}`,
    "aria-label": "Breadcrumb"
  }), a = l("div", { className: "breadcrumb-main" });
  return t?.leading?.length && a.append(...t.leading), e.forEach((r, o) => {
    if (o > 0 && a.append(l("span", { className: "breadcrumb-sep", textContent: "/" })), r.href || r.onClick) {
      const i = l("a", {
        className: `breadcrumb-item${r.className ? ` ${r.className}` : ""}`,
        href: r.href || "#",
        textContent: r.label
      });
      r.onClick && i.addEventListener("click", r.onClick), a.append(i);
      return;
    }
    a.append(l("span", {
      className: r.className || "breadcrumb-segment",
      textContent: r.label
    }));
  }), n.append(a), t?.trailing?.length && n.append(l("div", { className: "breadcrumb-trailing" }, ...t.trailing)), n;
}
function Mt(e) {
  const { configured: t, variant: n = "tag", label: a, title: r } = e, o = a || r, i = t ? T.unlock : T.lock, s = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-meta-icon", c = n !== "endpoint" ? ` ${s}--${t ? "configured" : "required"}` : "";
  return l("span", {
    className: `${s}${c}`.trim(),
    innerHTML: i,
    ...o ? { "aria-label": o } : {}
  });
}
function $r(e) {
  const t = l("div", { className: e.overlayClass });
  t.setAttribute(e.dataOverlayAttr, "true");
  const n = l("div", {
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
let Ue = null, en = null;
function jr() {
  en?.(), en = null;
}
function Vt() {
  jr(), Ue && Ue.close(), Ue = null;
}
function Li(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function Oi(e) {
  return un(e);
}
function ft(e) {
  requestAnimationFrame(() => e.focus());
}
function Yt(e, t) {
  const n = l("div", { className: "modal field" });
  return n.append(l("label", { className: "modal label", textContent: e }), t), n;
}
function rt(e) {
  return Ee({
    className: "modal input",
    placeholder: e.placeholder,
    value: e.value,
    ariaLabel: e.ariaLabel,
    type: e.type
  });
}
function Ti(e) {
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
function qi(e) {
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
function Ii(e) {
  if (!e) return { username: "", password: "" };
  try {
    const n = qi(e).split(":");
    return {
      username: n[0] || "",
      password: n.slice(1).join(":") || ""
    };
  } catch {
    return { username: "", password: "" };
  }
}
function Gt(e, t, n) {
  V(n);
  const a = k.get().auth.schemes[e] || "", r = t.type, o = (t.scheme || "").toLowerCase();
  if (r === "http" && o === "bearer") {
    const i = l("div", { className: "modal field" }), s = l("div", { className: "modal input-wrap" }), c = rt({
      placeholder: "Bearer token...",
      value: a,
      ariaLabel: "Bearer token",
      type: "password"
    }), u = de({
      variant: "icon",
      icon: T.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        c.type = c.type === "password" ? "text" : "password";
      }
    });
    c.addEventListener("input", () => k.setSchemeValue(e, c.value)), s.append(c, u), i.append(l("label", { className: "modal label", textContent: "Token" }), s), n.append(i), ft(c);
  } else if (r === "http" && o === "basic") {
    const i = Ii(a), s = rt({
      placeholder: "Username",
      value: i.username,
      ariaLabel: "Username"
    });
    n.append(Yt("Username", s));
    const c = rt({
      placeholder: "Password",
      value: i.password,
      ariaLabel: "Password",
      type: "password"
    });
    n.append(Yt("Password", c));
    const u = () => {
      const d = `${s.value}:${c.value}`, p = d === ":" ? "" : Ti(d);
      k.setSchemeValue(e, p);
    };
    s.addEventListener("input", u), c.addEventListener("input", u), ft(s);
  } else if (r === "apiKey") {
    const i = l("div", { className: "modal field" }), s = l("div", { className: "modal input-wrap" }), c = rt({
      placeholder: `${t.name || "API key"}...`,
      value: a,
      ariaLabel: "API key",
      type: "password"
    }), u = de({
      variant: "icon",
      icon: T.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        c.type = c.type === "password" ? "text" : "password";
      }
    });
    c.addEventListener("input", () => {
      k.setSchemeValue(e, c.value);
    }), s.append(c, u), i.append(l("label", { className: "modal label", textContent: `API Key (${t.name || "key"})` }), s), n.append(i), ft(c);
  } else {
    const i = rt({
      placeholder: "Token...",
      value: a,
      ariaLabel: "Token",
      type: "password"
    });
    i.addEventListener("input", () => {
      k.setSchemeValue(e, i.value);
    }), n.append(Yt("Token / Credential", i)), ft(i);
  }
}
function gn(e, t, n) {
  Ue && Vt();
  const a = Object.entries(e);
  if (a.length === 0) return;
  const r = $r({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Authentication Settings",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      jr(), Ue = null;
    }
  });
  Ue = r;
  const o = r.modal, i = l("div", { className: "modal header" });
  i.append(l("h2", { className: "modal title", textContent: "Authentication" }));
  const s = de({ variant: "icon", icon: T.close, ariaLabel: "Close", onClick: Vt });
  i.append(s), o.append(i);
  const c = l("div", { className: "modal body" });
  let u = n || k.get().auth.activeScheme || a[0][0];
  e[u] || (u = a[0][0]);
  const d = l("div", { className: "modal fields" });
  if (a.length > 1) {
    const b = l("div", { className: "modal tabs" }), g = /* @__PURE__ */ new Map(), A = [], O = (x, L, w) => {
      const C = Pt(L);
      if (x.setAttribute("data-configured", C ? "true" : "false"), V(x), C) {
        const $ = l("span", { className: "modal tab-check", "aria-hidden": "true" });
        $.innerHTML = T.check, x.append($);
      }
      x.append(l("span", { className: "modal tab-label", textContent: Oi(w) }));
    };
    for (const [x, L] of a) {
      const w = l("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": x === u ? "true" : "false"
      });
      O(w, x, L), w.addEventListener("click", () => {
        if (u !== x) {
          u = x;
          for (const C of A) C.setAttribute("aria-pressed", "false");
          w.setAttribute("aria-pressed", "true"), m(), Gt(x, L, d);
        }
      }), g.set(x, w), A.push(w), b.append(w);
    }
    en = k.subscribe(() => {
      for (const [x, L] of a) {
        const w = g.get(x);
        w && O(w, x, L);
      }
    }), c.append(b);
  }
  const p = l("div", { className: "modal scheme-desc" });
  function m() {
    const b = e[u];
    if (!b) return;
    V(p);
    const g = l("div", { className: "modal scheme-title", textContent: Li(b) });
    p.append(g), b.description && p.append(_(b.description, "modal scheme-text md-content"));
  }
  m(), c.append(p);
  const f = e[u];
  f && Gt(u, f, d), c.append(d), o.append(c);
  const h = l("div", { className: "modal footer" }), v = de({
    variant: "ghost",
    label: "Reset",
    onClick: () => {
      k.setSchemeValue(u, "");
      const b = e[u];
      b && Gt(u, b, d);
    }
  }), y = de({ variant: "primary", label: "Done", onClick: Vt });
  h.append(v, l("div", { className: "grow" }), y), o.append(h), r.mount(t ?? document.querySelector(".root") ?? document.body);
}
function Pt(e) {
  return !!k.get().auth.schemes[e];
}
function Rt(e, t) {
  const n = lt(e, t), a = k.get().auth, r = $t(n, a.schemes, a.activeScheme, a.token);
  return Object.keys(r.headers).length > 0 || Object.keys(r.query).length > 0 || Object.keys(r.cookies).length > 0;
}
function vn(e, t) {
  const n = lt(e, t), a = k.get().auth;
  return $t(n, a.schemes, a.activeScheme, a.token).headers;
}
function $i(e, t) {
  const n = lt(e, t), a = k.get().auth;
  return $t(n, a.schemes, a.activeScheme, a.token).query;
}
function ji(e, t) {
  const n = lt(e, t), a = k.get().auth;
  return $t(n, a.schemes, a.activeScheme, a.token).cookies;
}
function yn(e, t) {
  const n = lt(e, t);
  return oa(n);
}
function lt(e, t) {
  if (e)
    return Array.isArray(e) ? ln(e, t, !1) : e;
}
let le = -1, Lt = null, $e = null;
function Br() {
  Ot();
  const e = $r({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      Lt = null, k.set({ searchOpen: !1 });
    }
  });
  Lt = e;
  const t = e.modal, n = l("div", { className: "search-input-wrap" });
  n.innerHTML = T.search;
  const a = Ee({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), r = l("kbd", { textContent: "ESC", className: "kbd" });
  n.append(a, r), t.append(n);
  const o = l("div", { className: "search-results", role: "listbox" }), i = l("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  o.append(i), t.append(o);
  const s = l("div", { className: "search-footer" });
  s.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(s), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => a.focus()), le = -1;
  let c = [];
  a.addEventListener("input", () => {
    const u = a.value;
    c = ui(u), Bi(o, c), yt(o, c.length > 0 ? 0 : -1);
  }), a.addEventListener("keydown", (u) => {
    const d = u;
    d.key === "ArrowDown" ? (d.preventDefault(), c.length > 0 && yt(o, Math.min(le + 1, c.length - 1))) : d.key === "ArrowUp" ? (d.preventDefault(), c.length > 0 && yt(o, Math.max(le - 1, 0))) : d.key === "Enter" ? (d.preventDefault(), le >= 0 && le < c.length && Mr(c[le])) : d.key === "Escape" && (d.preventDefault(), Ot());
  });
}
function Ot() {
  if (Lt) {
    Lt.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), k.set({ searchOpen: !1 });
}
function Bi(e, t) {
  if (V(e), t.length === 0) {
    e.append(l("div", { className: "search-empty", textContent: "No results found" }));
    return;
  }
  const n = document.createDocumentFragment();
  t.forEach((a, r) => {
    const o = l("div", {
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
    const i = l("div", { className: "search-result-info min-w-0" });
    if (i.append(l("span", { className: "search-result-title", textContent: a.title })), a.subtitle && i.append(l("span", { className: "search-result-subtitle", textContent: a.subtitle })), o.append(i), a.method && a.requiresAuth && a.resolvedSecurity) {
      const s = k.get().spec, c = Rt(a.resolvedSecurity, s?.securitySchemes || {});
      o.append(l("span", {
        className: `search-result-lock search-result-lock--${c ? "configured" : "required"}`,
        innerHTML: c ? T.unlock : T.lock,
        "aria-label": a.authTitle || "Requires authentication"
      }));
    }
    o.addEventListener("click", () => Mr(a)), o.addEventListener("mouseenter", () => {
      yt(e, r);
    }), n.append(o);
  }), e.append(n);
}
function yt(e, t) {
  if (le === t) return;
  if (le >= 0) {
    const a = e.querySelector(`.search-result[data-index="${le}"]`);
    a && (a.classList.remove("focused"), a.setAttribute("aria-selected", "false"));
  }
  if (le = t, t < 0) return;
  const n = e.querySelector(`.search-result[data-index="${t}"]`);
  n && (n.classList.add("focused"), n.setAttribute("aria-selected", "true"), n.scrollIntoView({ block: "nearest" }));
}
function Mr(e) {
  Ot(), e.type === "operation" ? P(H({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? P(H({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? P(H({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && P(H({ type: "webhook", webhookName: e.webhookName }));
}
function Mi() {
  return $e && document.removeEventListener("keydown", $e), $e = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), k.get().searchOpen ? Ot() : (k.set({ searchOpen: !0 }), Br()));
  }, document.addEventListener("keydown", $e), () => {
    $e && (document.removeEventListener("keydown", $e), $e = null);
  };
}
function Pi(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let a = null;
  for (const s of n) {
    const c = s, u = Wi(c), d = c.getAttribute("href");
    if (!d && !u) continue;
    const p = d?.startsWith("#") ? d.slice(1) : d || "", m = u || or(p), f = Ke(m, t);
    s.classList.toggle("active", f), f ? (c.setAttribute("aria-current", "page"), a = c) : c.removeAttribute("aria-current");
  }
  const r = a ? a.closest(".nav-group") : null;
  if (r) {
    const s = r.querySelector(".nav-group-header"), c = r.querySelector(".nav-group-items");
    s instanceof HTMLElement && c instanceof HTMLElement && se(s, c, !0);
  }
  const o = t.type === "endpoint" || t.type === "tag" ? t.tag : null, i = t.type === "schema" ? "schemas" : t.type === "webhook" ? "webhooks" : o ? ne(o) : null;
  if (i) {
    const s = e.querySelector(`[data-nav-tag="${CSS.escape(i)}"]`);
    if (s) {
      const c = s.querySelector(".nav-group-header"), u = s.querySelector(".nav-group-items");
      c instanceof HTMLElement && u instanceof HTMLElement && se(c, u, !0);
    }
  }
  a && requestAnimationFrame(() => {
    const c = a.closest(".nav-group")?.querySelector(".nav-group-header");
    c ? c.scrollIntoView({ block: "start", behavior: "smooth" }) : a.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function Ri(e) {
  const t = k.get(), n = t.spec;
  if (!n) return;
  const a = n.securitySchemes || {}, r = e.querySelector("[data-sidebar-auth-btn]");
  if (r) {
    const c = Object.keys(a), u = t.auth.activeScheme || c[0] || "", d = Pt(u);
    r.innerHTML = d ? T.unlock : T.lock, r.classList.toggle("active", d);
  }
  const o = e.querySelectorAll("[data-lock-slot]"), i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const c of n.operations)
    c.operationId && i.set(c.operationId, c), s.set(`${c.method.toLowerCase()} ${c.path}`, c);
  for (const c of o) {
    const u = c.closest(".nav-item");
    if (!u) continue;
    const d = u.dataset.routeOperationId, p = u.dataset.routeMethod, m = u.dataset.routePath, f = d && i.get(d) || (p && m ? s.get(`${p.toLowerCase()} ${m}`) : null);
    if (!f) continue;
    const h = Rt(f.resolvedSecurity, a), v = Mt({
      configured: h,
      variant: "nav",
      title: ze(f.resolvedSecurity)
    });
    c.innerHTML = "", c.append(v);
  }
}
function Hi(e, t) {
  const n = k.get(), a = n.spec;
  if (!a) return;
  V(e);
  const r = t.title || a.info.title || "API Docs", o = a.info.version ? `v${a.info.version}` : "", i = l("div", { className: "top" }), s = l("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  s.innerHTML = T.chevronLeft, s.addEventListener("click", () => k.set({ sidebarOpen: !1 }));
  const c = l("a", { className: "title", href: "/", textContent: r });
  c.addEventListener("click", (x) => {
    x.preventDefault(), P("/");
  });
  const u = l("div", { className: "title-wrap" });
  if (u.append(c), o && u.append(l("span", { className: "version", textContent: o })), i.append(s, u), a.securitySchemes && Object.keys(a.securitySchemes).length > 0) {
    const x = Object.keys(a.securitySchemes), L = n.auth.activeScheme || x[0] || "", w = Pt(L), C = l("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication",
      "data-sidebar-auth-btn": ""
    });
    C.innerHTML = w ? T.unlock : T.lock, C.classList.toggle("active", w), C.addEventListener("click", () => {
      const I = k.get().auth.activeScheme || x[0] || "";
      gn(
        a.securitySchemes,
        e.closest(".root") ?? void 0,
        I
      );
    }), i.append(C);
  }
  const d = l("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (d.innerHTML = k.get().theme === "light" ? T.moon : T.sun, d.addEventListener("click", () => {
    di(), d.innerHTML = k.get().theme === "light" ? T.moon : T.sun;
  }), e.append(i), n.environments.length > 1) {
    const x = Yi(n);
    e.append(x);
  }
  const p = l("div", { className: "search" }), m = l("span", { className: "search-icon", innerHTML: T.search }), f = Ee({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), h = l("span", { className: "kbd", textContent: "⌘K" });
  f.addEventListener("focus", () => {
    k.set({ searchOpen: !0 }), f.blur(), Br();
  }), p.append(m, f, h), e.append(p);
  const v = l("nav", { className: "nav", "aria-label": "API navigation" }), y = Ui({ type: "overview" }, n.route);
  v.append(y);
  for (const x of a.tags) {
    if (x.operations.length === 0) continue;
    const L = _i(x, n.route);
    v.append(L);
  }
  if (a.webhooks && a.webhooks.length > 0) {
    const x = l("div", { className: "nav-group", "data-nav-tag": "webhooks" }), L = { type: "webhook" }, w = Rn("Webhooks", a.webhooks.length, L, n.route), C = l("div", { className: "nav-group-items collapsed" });
    for (const R of a.webhooks) {
      const K = { type: "webhook", webhookName: R.name }, X = Fn(R.summary || R.name, R.method, K, n.route);
      X.classList.add("nav-item-webhook"), C.append(X);
    }
    w.addEventListener("click", (R) => {
      R.target.closest(".nav-group-link") || se(w, C);
    });
    const $ = w.querySelector(".nav-group-link");
    $ && $.addEventListener("click", () => se(w, C, !0), { capture: !0 });
    const I = n.route.type === "webhook";
    se(w, C, I, { instant: !0 }), x.append(w, C), v.append(x);
  }
  const b = Object.keys(a.schemas);
  if (b.length > 0) {
    const x = l("div", { className: "nav-group" }), L = { type: "schema" }, w = Rn("Schemas", b.length, L, n.route), C = l("div", { className: "nav-group-items collapsed" });
    for (const R of b) {
      const X = Fn(R, void 0, { type: "schema", schemaName: R }, n.route);
      C.append(X);
    }
    w.addEventListener("click", (R) => {
      R.target.closest(".nav-group-link") || se(w, C);
    });
    const $ = w.querySelector(".nav-group-link");
    $ && $.addEventListener("click", () => se(w, C, !0), { capture: !0 });
    const I = n.route.type === "schema";
    se(w, C, I, { instant: !0 }), x.setAttribute("data-nav-tag", "schemas"), x.append(w, C), v.append(x);
  }
  e.append(v);
  const g = l("div", { className: "footer" }), A = l("button", {
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
  const O = l("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  O.textContent = `puredocs.dev${o ? ` ${o}` : ""}`, g.append(A, O), g.append(d), e.append(g), requestAnimationFrame(() => {
    const x = v.querySelector(".nav-item.active");
    if (x) {
      const w = x.closest(".nav-group")?.querySelector(".nav-group-header");
      w ? w.scrollIntoView({ block: "start", behavior: "smooth" }) : x.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function _i(e, t, n) {
  const a = l("div", { className: "nav-group", "data-nav-tag": ne(e.name) }), r = Fi(e, t), o = l("div", { className: "nav-group-items collapsed" }), i = ne(e.name), s = t.type === "tag" && ne(t.tag || "") === i || e.operations.some((u) => Ke(tn(u, e.name), t));
  for (const u of e.operations) {
    const d = tn(u, e.name), p = zi(u, d, t);
    o.append(p);
  }
  r.addEventListener("click", (u) => {
    u.target.closest(".nav-group-link") || se(r, o);
  });
  const c = r.querySelector(".nav-group-link");
  return c && c.addEventListener("click", (u) => {
    se(r, o, !0);
  }, { capture: !0 }), se(r, o, s, { instant: !0 }), a.append(r, o), a;
}
function Fi(e, t) {
  const n = ne(e.name), a = t.type === "tag" && ne(t.tag || "") === n || e.operations.some((s) => Ke(tn(s, e.name), t)), r = l("div", { className: "nav-group-header focus-ring", "aria-expanded": String(a), tabIndex: 0 }), o = l("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": a ? "Collapse" : "Expand"
  });
  o.innerHTML = T.chevronRight, o.addEventListener("click", (s) => {
    s.preventDefault(), s.stopPropagation(), r.click();
  });
  const i = l("a", {
    className: "nav-group-link",
    href: H({ type: "tag", tag: e.name })
  });
  return i.append(
    l("span", { className: "nav-group-title", textContent: e.name }),
    l("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), i.addEventListener("click", (s) => {
    s.preventDefault(), P(H({ type: "tag", tag: e.name }));
  }), r.append(o, i), r.addEventListener("keydown", (s) => {
    (s.key === "Enter" || s.key === " ") && (s.preventDefault(), o.click());
  }), r;
}
function Rn(e, t, n, a) {
  const r = a.type === n.type, o = l("div", { className: "nav-group-header focus-ring", "aria-expanded": String(r), tabIndex: 0 }), i = l("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": r ? "Collapse" : "Expand"
  });
  i.innerHTML = T.chevronRight, i.addEventListener("click", (c) => {
    c.preventDefault(), c.stopPropagation(), o.click();
  });
  const s = l("a", {
    className: "nav-group-link",
    href: H(n)
  });
  return s.append(
    l("span", { className: "nav-group-title", textContent: e }),
    l("span", { className: "nav-group-count", textContent: String(t) })
  ), s.addEventListener("click", (c) => {
    c.preventDefault(), P(H(n));
  }), o.append(i, s), o.addEventListener("keydown", (c) => {
    (c.key === "Enter" || c.key === " ") && (c.preventDefault(), i.click());
  }), o;
}
const Hn = 260, _n = "cubic-bezier(0.25, 0.8, 0.25, 1)", ke = /* @__PURE__ */ new WeakMap();
function se(e, t, n = !e.classList.contains("expanded"), a = {}) {
  if (e.classList.contains("expanded") === n) return;
  const o = ke.get(t);
  if (o && (o.cancel(), ke.delete(t)), e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), Di(e, n), a.instant) {
    t.classList.toggle("collapsed", !n), t.style.maxHeight = "", t.style.overflow = "";
    return;
  }
  if (n) {
    t.classList.remove("collapsed"), t.style.maxHeight = "none", t.style.overflow = "hidden";
    const i = t.scrollHeight;
    t.style.maxHeight = "0";
    const s = t.animate(
      [{ maxHeight: "0px" }, { maxHeight: `${i}px` }],
      { duration: Hn, easing: _n, fill: "forwards" }
    );
    ke.set(t, s), s.finished.then(() => {
      ke.delete(t), t.style.maxHeight = "", t.style.overflow = "";
    }).catch(() => {
      ke.delete(t);
    });
  } else {
    t.classList.remove("collapsed");
    const i = t.scrollHeight;
    t.style.maxHeight = `${i}px`, t.style.overflow = "hidden";
    const s = t.animate(
      [{ maxHeight: `${i}px` }, { maxHeight: "0px" }],
      { duration: Hn, easing: _n, fill: "forwards" }
    );
    ke.set(t, s), s.finished.then(() => {
      ke.delete(t), t.style.maxHeight = "", t.style.overflow = "", t.classList.add("collapsed");
    }).catch(() => {
      ke.delete(t);
    });
  }
}
function Di(e, t) {
  const n = e.querySelector(".nav-group-chevron");
  n instanceof HTMLElement && n.setAttribute("aria-label", t ? "Collapse" : "Expand");
}
function Fn(e, t, n, a) {
  const r = Ke(n, a), o = l("a", {
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
  return t || i.setAttribute("aria-hidden", "true"), o.append(i), o.append(l("span", { className: "nav-item-label", textContent: e })), o.addEventListener("click", (s) => {
    s.preventDefault(), P(H(n));
  }), o;
}
function Ui(e, t) {
  const n = Ke(e, t), a = l("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: H(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), r = l("span", { className: "nav-overview-icon-slot" });
  r.innerHTML = T.globe;
  const o = l("span", { className: "nav-item-label", textContent: "Overview" });
  return a.append(r, o), a.addEventListener("click", (i) => {
    i.preventDefault(), P(H(e));
  }), a;
}
function zi(e, t, n) {
  const a = Ke(t, n), r = l("a", {
    className: `nav-item${a ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: H(t),
    "aria-current": a ? "page" : void 0
  });
  r.dataset.routeType = "endpoint", t.operationId && (r.dataset.routeOperationId = t.operationId), t.method && (r.dataset.routeMethod = t.method), t.path && (r.dataset.routePath = t.path), t.tag && (r.dataset.routeTag = t.tag);
  const o = k.get().spec, i = z(e.resolvedSecurity), s = i ? Mt({
    configured: Rt(e.resolvedSecurity, o?.securitySchemes || {}),
    variant: "nav",
    title: ze(e.resolvedSecurity)
  }) : null, c = i ? l("span", { "data-lock-slot": "" }) : null;
  return c && s && c.append(s), r.append(
    N({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    l("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...c ? [c] : []
  ), r.addEventListener("click", (u) => {
    u.preventDefault(), P(H(t));
  }), r;
}
function tn(e, t) {
  return {
    type: "endpoint",
    tag: t,
    method: e.method,
    path: e.path,
    operationId: e.operationId
  };
}
function Ke(e, t) {
  if (e.type !== t.type) return !1;
  if (e.type === "overview") return !0;
  if (e.type === "tag") return ne(e.tag || "") === ne(t.tag || "");
  if (e.type === "endpoint") {
    if (e.operationId && t.operationId) return e.operationId === t.operationId;
    const n = (e.method || "").toLowerCase(), a = (t.method || "").toLowerCase();
    return n === a && Dn(e.path) === Dn(t.path);
  }
  return e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function Dn(e) {
  return e && e.replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
}
function Wi(e) {
  const { routeType: t } = e.dataset;
  return t && t === "endpoint" ? {
    type: "endpoint",
    operationId: e.dataset.routeOperationId || void 0,
    method: e.dataset.routeMethod || void 0,
    path: e.dataset.routePath || void 0,
    tag: e.dataset.routeTag || void 0
  } : null;
}
function Vi(e) {
  const t = e.querySelector("select.env");
  if (t) {
    const n = k.get().activeEnvironment;
    t.value !== n && (t.value = n);
  }
}
function Yi(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((r) => {
    const o = t.find((s) => s.name === r.name), i = Ae((o?.baseUrl ?? r.baseUrl) || "");
    return { value: r.name, label: i || "(no URL)" };
  });
  return St({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (r) => k.setActiveEnvironment(r),
    className: "env"
  });
}
function Ht(e, t, n = "No operations") {
  const a = l("div", { className: "summary-line" });
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
function Gi(e, t) {
  const n = [], a = Ki(e, t);
  return a && n.push(a), n;
}
function Ki(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = U({ title: "Authentication" });
  for (const [a, r] of Object.entries(e)) {
    const o = Pt(a), i = re({ className: "card-group card-auth" }), s = l("div", { className: "card-auth-main" }), c = l("div", { className: "card-info card-auth-info" }), u = `${r.type}${r.scheme ? ` / ${r.scheme}` : ""}`;
    c.append(
      l("h3", { textContent: a }),
      l("p", { className: "card-auth-type", textContent: u })
    ), r.description && c.append(_(String(r.description), "card-auth-desc md-content"));
    const d = de({
      variant: "secondary",
      icon: o ? T.check : T.settings,
      label: o ? "Success" : "Set",
      className: `card-auth-config${o ? " active is-configured" : ""}`,
      onClick: (p) => {
        p.stopPropagation(), gn(e, t, a);
      }
    });
    s.append(c), i.append(s, d), n.append(i);
  }
  return n;
}
async function Un(e, t) {
  V(e);
  const n = k.get().spec;
  if (!n) return;
  const a = l("div", { className: "block header" }), r = l("div", { className: "title" });
  r.append(
    l("h1", { textContent: n.info.title }),
    l("span", { className: "version", textContent: `v${n.info.version}` })
  ), a.append(r), n.info.description && a.append(_(n.info.description)), e.append(a);
  const o = n.operations.filter((d) => z(d.resolvedSecurity)).length, i = n.operations.filter((d) => d.deprecated).length, s = Zi(n.operations);
  if (e.append(U(
    { className: "summary" },
    Ht(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: o },
        { label: "Deprecated", value: i }
      ],
      s,
      "No operations"
    )
  )), n.servers.length > 0) {
    const d = U({ title: "Servers" }), p = k.get(), m = p.initialEnvironments || p.environments, f = [];
    for (const v of n.servers) {
      const b = m.find((C) => C.baseUrl === v.url)?.name || "", g = b === p.activeEnvironment, A = re({
        interactive: !0,
        active: g,
        className: "card-group",
        onClick: () => {
          const C = k.get(), I = (C.initialEnvironments || C.environments).find((R) => R.baseUrl === v.url);
          I && I.name !== C.activeEnvironment && k.setActiveEnvironment(I.name);
        }
      }), O = l("div", { className: "card-info" }), x = l("div", { className: "inline-cluster inline-cluster-sm" }), L = l("span", { className: "icon-muted" });
      L.innerHTML = T.server, x.append(L, l("code", { textContent: v.url })), O.append(x), v.description && O.append(_(v.description));
      const w = l("div", { className: "card-badges" });
      A.append(O, w), d.append(A), f.push({ el: A, envName: b });
    }
    const h = (v) => {
      for (const { el: y, envName: b } of f)
        y.classList.toggle("active", b === v.activeEnvironment);
    };
    Le().on("overview:servers", h), e.append(d);
  }
  const c = e.closest(".root") ?? void 0, u = Gi(n.securitySchemes || {}, c);
  for (const d of u)
    e.append(d);
  if (n.tags.length > 0) {
    const d = U({ title: "API Groups" });
    for (const p of n.tags)
      p.operations.length !== 0 && d.append(Ji(p));
    e.append(d);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const d = U({ title: "Webhooks" });
    for (const p of n.webhooks) {
      const m = re({
        interactive: !0,
        className: "card-group",
        onClick: () => P(H({ type: "webhook", webhookName: p.name }))
      }), f = l("div", { className: "card-badges" });
      f.append(
        N({ text: "WH", kind: "webhook", size: "s" }),
        N({ text: p.method.toUpperCase(), kind: "method", method: p.method, size: "s" })
      );
      const h = l("div", { className: "card-group-top" });
      h.append(l("h3", { className: "card-group-title", textContent: p.summary || p.name }), f);
      const v = _(p.description || `${p.method.toUpperCase()} webhook`, "card-group-description md-content");
      m.append(h, v), d.append(m);
    }
    e.append(d);
  }
}
function Ji(e) {
  const t = re({
    interactive: !0,
    className: "card-group",
    onClick: () => P(H({ type: "tag", tag: e.name }))
  }), n = Xi(e), a = l("div", { className: "card-badges" });
  for (const [i, s] of Object.entries(n)) {
    const c = N({
      text: i.toUpperCase(),
      kind: "method",
      method: i,
      size: "m"
    });
    c.textContent = `${s} ${i.toUpperCase()}`, a.append(c);
  }
  const r = l("div", { className: "card-group-top" });
  r.append(l("h3", { className: "card-group-title", textContent: e.name }), a);
  const o = _(e.description || `${e.operations.length} endpoints`, "card-group-description md-content");
  return t.append(r, o), t;
}
function Zi(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Xi(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Je(e) {
  if (!e) return "any";
  if (e.$ref) return e.$ref.split("/").pop() || "ref";
  let t = e.type || "";
  return e.allOf ? t = "allOf" : e.oneOf ? t = "oneOf" : e.anyOf ? t = "anyOf" : e.enum ? t = "enum" : e.format && (t += `<${e.format}>`), e.type === "array" && e.items && !e.enum && (t = `${e.items.type || e.items.$ref?.split("/").pop() || "any"}[]`), e.nullable && (t += " | null"), t || "object";
}
function Qi(e) {
  const t = l("div", { className: "schema" }), n = l("div", { className: "body" });
  t.append(n);
  const a = [];
  Pr(n, e, "", 0, /* @__PURE__ */ new Set(), a);
  const r = a.length > 0, o = () => a.some(({ children: s }) => s.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const s = !o();
    _r(a, s);
  }, isExpanded: o, hasExpandable: r };
}
function nn(e, t) {
  const n = re(), a = Je(e), r = Ye(), o = l("div", { className: "schema" }), i = l("div", { className: "body" });
  o.append(i);
  const s = [];
  if (Pr(i, e, "", 0, /* @__PURE__ */ new Set(), s), r.append(o), t) {
    const c = Bt(), u = typeof t == "string" ? l("h3", { textContent: t }) : t, d = s.length > 0, p = d && s.some(({ children: h }) => h.style.display !== "none"), m = N({ text: a, kind: "chip", color: "primary", size: "m" }), f = d ? l("button", {
      className: p ? "schema-collapse-btn is-expanded" : "schema-collapse-btn",
      type: "button",
      "aria-label": p ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (f && (f.innerHTML = T.chevronDown, f.addEventListener("click", (h) => {
      h.stopPropagation();
      const v = !f.classList.contains("is-expanded");
      _r(s, v), f.classList.toggle("is-expanded", v), f.setAttribute("aria-label", v ? "Collapse all fields" : "Expand all fields");
    })), u.classList.contains("card-row"))
      u.classList.add("schema-header-row"), u.append(m), f && u.append(f), c.append(u);
    else {
      const h = l("div", { className: "card-row schema-header-row" });
      h.append(u, m), f && h.append(f), c.append(h);
    }
    n.prepend(c);
  }
  return n.append(r), n;
}
function es(e, t) {
  const { headerTitle: n, withEnumAndDefault: a = !0 } = t, r = e.map((u) => {
    const d = l("div", { className: "schema-row role-flat role-params" }), p = l("div", { className: "schema-main-row" }), m = l("div", { className: "schema-name-wrapper" });
    m.append(
      l("span", { className: "schema-spacer" }),
      l("span", { textContent: u.name })
    );
    const f = l("div", { className: "schema-meta-wrapper" });
    f.append(N({
      text: u.schema ? Je(u.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), u.required && f.append(N({ text: "required", kind: "required", size: "m" })), p.append(m, f), d.append(p);
    const h = l("div", { className: "schema-desc-col is-root" });
    u.description && h.append(_(u.description));
    const v = u.schema?.enum, y = u.schema?.default !== void 0;
    if (a && (v && v.length > 0 || y)) {
      const b = l("div", { className: "schema-enum-values" });
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
  }), o = re(), i = Ye(), s = l("div", { className: "params" }), c = l("div", { className: "body role-params" });
  return c.append(...r), s.append(c), i.append(s), o.append(
    Bt(Ai({ title: n })),
    i
  ), o;
}
function mt(e, t, n, a, r, o, i) {
  const s = Je(n), c = ts(n), u = Hr(t, s, n, a, c, r);
  if (e.append(u), c) {
    const d = l("div", { className: "schema-children" });
    d.style.display = "block";
    const p = new Set(o);
    p.add(n), Rr(d, n, a + 1, p, i), e.append(d), i?.push({ row: u, children: d }), u.querySelector(".schema-toggle")?.classList.add("is-expanded"), u.classList.add("focus-ring"), u.setAttribute("aria-expanded", "true"), u.setAttribute("tabindex", "0"), u.addEventListener("click", () => {
      const m = d.style.display !== "none";
      rn(u, d, !m);
    }), u.addEventListener("keydown", (m) => {
      if (m.key !== "Enter" && m.key !== " ") return;
      m.preventDefault();
      const f = d.style.display !== "none";
      rn(u, d, !f);
    });
  }
}
function Pr(e, t, n, a, r, o) {
  if (r.has(t)) {
    e.append(Hr("[circular]", "circular", { description: "" }, a, !1, !1));
    return;
  }
  {
    const i = new Set(r);
    i.add(t), Rr(e, t, a, i, o);
    return;
  }
}
function Rr(e, t, n, a, r) {
  const o = new Set(t.required || []);
  if (t.properties)
    for (const [i, s] of Object.entries(t.properties))
      mt(e, i, s, n, o.has(i), a, r);
  t.items && t.type === "array" && mt(e, "[item]", t.items, n, !1, a, r);
  for (const i of ["allOf", "oneOf", "anyOf"]) {
    const s = t[i];
    if (Array.isArray(s))
      for (let c = 0; c < s.length; c++)
        mt(e, `${i}[${c}]`, s[c], n, !1, a, r);
  }
  t.additionalProperties && typeof t.additionalProperties == "object" && mt(e, "[additionalProperties]", t.additionalProperties, n, !1, a, r);
}
function Hr(e, t, n, a, r, o) {
  const i = [
    "schema-row",
    a === 0 ? "is-root" : "",
    a === 0 && !r ? "is-leaf" : ""
  ].filter(Boolean).join(" "), s = l("div", { className: i, role: r ? "button" : void 0 });
  s.setAttribute("data-depth", String(a)), s.style.setProperty("--schema-depth", String(a));
  const c = l("div", { className: "schema-main-row" }), u = l("div", { className: "schema-name-wrapper" });
  r ? u.append(l("span", { className: "schema-toggle", innerHTML: T.chevronRight })) : u.append(l("span", { className: "schema-spacer" })), u.append(l("span", { textContent: e })), c.append(u);
  const d = l("div", { className: "schema-meta-wrapper" });
  d.append(N({ text: t, kind: "chip", color: "primary", size: "m" })), o && d.append(N({ text: "required", kind: "required", size: "m" })), c.append(d), s.append(c);
  const p = l("div", { className: `schema-desc-col${a === 0 ? " is-root" : ""}` });
  n.description && p.append(_(String(n.description)));
  const m = n.enum, f = Array.isArray(m) && m.length > 0, h = n.default, v = h !== void 0, y = f && v ? m.some((g) => Kt(g, h)) : !1, b = ns(n, !f || !v);
  if (b.length > 0 || f) {
    const g = l("div", { className: "schema-constraints-row" });
    for (const A of b)
      g.append(N({
        text: A,
        kind: "chip",
        size: "s"
      }));
    if (f) {
      const A = v && y ? [h, ...m.filter((O) => !Kt(O, h))] : m;
      v && !y && g.append(N({
        text: `default: ${bt(h)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value is-default"
      }));
      for (const O of A) {
        const x = v && Kt(O, h);
        g.append(N({
          text: x ? `default: ${bt(O)}` : bt(O),
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
function ts(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function ns(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${bt(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function _r(e, t) {
  for (const { row: n, children: a } of e)
    rn(n, a, t);
}
function rn(e, t, n) {
  t.style.display = n ? "block" : "none", e.querySelector(".schema-toggle")?.classList.toggle("is-expanded", n), e.setAttribute("aria-expanded", n ? "true" : "false");
}
function bt(e) {
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (e === null) return "null";
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function Kt(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function rs(e) {
  const { method: t, url: n, headers: a = {}, body: r, timeout: o = 3e4 } = e, i = new AbortController(), s = setTimeout(() => i.abort(), o), c = performance.now();
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
    const p = await fetch(n, d), m = performance.now() - c, f = await p.text(), h = new TextEncoder().encode(f).length, v = {};
    return p.headers.forEach((y, b) => {
      v[b.toLowerCase()] = y;
    }), as(f, v), {
      status: p.status,
      statusText: p.statusText,
      headers: v,
      body: f,
      duration: m,
      size: h
    };
  } catch (u) {
    const d = performance.now() - c;
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
function as(e, t) {
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
function os(e, t, n, a) {
  let r = t;
  for (const [u, d] of Object.entries(n))
    r = r.replace(`{${u}}`, encodeURIComponent(d));
  const i = e.replace(/\/+$/, "") + r, s = new URLSearchParams();
  for (const [u, d] of Object.entries(a))
    d && s.set(u, d);
  const c = s.toString();
  return c ? `${i}?${c}` : i;
}
function Jt(e) {
  return [
    { language: "curl", label: "cURL", code: is(e) },
    { language: "javascript", label: "JavaScript", code: ss(e) },
    { language: "python", label: "Python", code: cs(e) },
    { language: "go", label: "Go", code: ls(e) },
    { language: "rust", label: "Rust", code: us(e) }
  ];
}
function is({ method: e, url: t, headers: n, body: a }) {
  const r = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [o, i] of Object.entries(n))
    r.push(`  -H '${o}: ${i}'`);
  return a && r.push(`  -d '${a}'`), r.join(` \\
`);
}
function ss({ method: e, url: t, headers: n, body: a }) {
  const r = [];
  r.push(`  method: '${e.toUpperCase()}'`);
  const o = Object.entries(n);
  if (o.length > 0) {
    const i = o.map(([s, c]) => `    '${s}': '${c}'`).join(`,
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
function cs({ method: e, url: t, headers: n, body: a }) {
  const r = ["import requests", ""], o = Object.entries(n);
  if (o.length > 0) {
    const s = o.map(([c, u]) => `    "${c}": "${u}"`).join(`,
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
function ls({ method: e, url: t, headers: n, body: a }) {
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
function us({ method: e, url: t, headers: n, body: a }) {
  const r = [
    "use reqwest::header::{HeaderMap, HeaderValue};",
    "",
    "#[tokio::main]",
    "async fn main() -> Result<(), reqwest::Error> {",
    "    let client = reqwest::Client::new();"
  ], o = Object.entries(n);
  if (o.length > 0) {
    r.push(""), r.push("    let mut headers = HeaderMap::new();");
    for (const [c, u] of o)
      r.push(`    headers.insert("${c}", HeaderValue::from_static("${u}"));`);
  }
  r.push("");
  const s = [`    let response = client.${e.toLowerCase()}("${t}")`];
  return o.length > 0 && s.push("        .headers(headers)"), a && s.push(`        .body(r#"${a}"#.to_string())`), s.push("        .send()"), s.push("        .await?;"), r.push(s.join(`
`)), r.push(""), r.push("    let body = response.text().await?;"), r.push('    println!("{}", body);'), r.push(""), r.push("    Ok(())"), r.push("}"), r.join(`
`);
}
function ds(e) {
  if (e.length === 0) return [];
  const t = (r, o, i) => {
    if (o && r.examples?.[o] !== void 0) {
      const s = r.examples[o], c = s?.value ?? s.value;
      if (c != null) return String(c);
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
      for (const c of e)
        o[c.name] = t(c, r);
      const s = e.find((c) => c.examples?.[r])?.examples?.[r];
      a.push({ name: r, summary: s?.summary, values: o });
    }
  else {
    const r = e.find((o) => o.schema?.enum && o.schema.enum.length > 1);
    if (r?.schema?.enum)
      for (let o = 0; o < r.schema.enum.length; o++) {
        const i = {};
        for (const c of e)
          i[c.name] = c === r ? t(c, null, o) : t(c, null);
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
    const n = je(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function ps(e) {
  const t = [e.summary, e.description].filter(Boolean);
  return [...new Set(t)].join(" — ") || e.name;
}
function zn(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
const Dr = [
  [/"(?:[^"\\]|\\.)*"(?=\s*:)/g, "property"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/\b(?:true|false|null)\b/g, "literal"],
  [/[{}[\]:,]/g, "punctuation"]
], Wn = [
  [/#.*/g, "comment"],
  [/"(?:[^"\\]|\\.)*"|'[^']*'/g, "string"],
  [/\$\w+|\$\{[^}]+\}/g, "sign"],
  [/--?\w[\w-]*/g, "sign"],
  [/\b(?:curl|wget|echo|export|if|then|else|fi|for|do|done|while|case|esac|function|return|local|set|unset|source|cd|ls|cat|grep|sed|awk|chmod|mkdir|rm|cp|mv|sudo|apt|brew|npm|pip|docker|http|https)\b/g, "keyword"],
  [/-?\b\d+(?:\.\d+)?\b/g, "number"]
], fs = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/"(?:[^"\\]|\\.)*"|`[^`]*`/g, "string"],
  [/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g, "keyword"],
  [/\b(?:bool|byte|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr|true|false|nil|iota)\b/g, "literal"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], ht = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/`(?:[^`\\]|\\.)*`/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/g, "keyword"],
  [/\b(?:true|false|null|undefined|NaN|Infinity)\b/g, "literal"],
  [/\b(?:console|document|window|fetch|Promise|Array|Object|String|Number|Boolean|Map|Set|JSON|Math|Date|RegExp|Error)\b/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], Vn = [
  [/#.*/g, "comment"],
  [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, "keyword"],
  [/\b(?:True|False|None)\b/g, "literal"],
  [/@\w+/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]():.,;]/g, "punctuation"]
], Yn = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|type|unsafe|use|where|while|yield)\b/g, "keyword"],
  [/\b(?:true|false|None|Some|Ok|Err)\b/g, "literal"],
  [/\b(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Box|Option|Result|HashMap|HashSet|Rc|Arc|Mutex|Cell|RefCell)\b/g, "sign"],
  [/\b(?:println!|print!|format!|vec!|panic!|assert!|assert_eq!|assert_ne!|todo!|unimplemented!|unreachable!|eprintln!|eprint!|write!|writeln!)/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], ms = {
  json: Dr,
  javascript: ht,
  js: ht,
  typescript: ht,
  ts: ht,
  bash: Wn,
  curl: Wn,
  go: fs,
  python: Vn,
  py: Vn,
  rust: Yn,
  rs: Yn
};
function hs(e, t) {
  let n = "", a = 0;
  for (; a < e.length; ) {
    let r = null;
    for (const [o, i] of t) {
      o.lastIndex = a;
      const s = o.exec(e);
      s && (!r || s.index < r.start || s.index === r.start && s[0].length > r.end - r.start) && (r = { start: s.index, end: s.index + s[0].length, cls: i });
    }
    if (!r) {
      n += Me(e.slice(a));
      break;
    }
    r.start > a && (n += Me(e.slice(a, r.start))), n += `<span class="hl-${r.cls}">${Me(e.slice(r.start, r.end))}</span>`, a = r.end;
  }
  return n;
}
function Ur(e, t) {
  const n = ms[t] ?? (Ar(e) ? Dr : null);
  return n ? hs(e, n) : Me(e);
}
function gs(e, t) {
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
    return Gn(a, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const a = parseFloat(e);
    return Gn(a, n);
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
function Gn(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function vs(e, t, n, a) {
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
function ys(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((r) => {
    const o = r.getAttribute("data-param-name"), i = t.parameters.find((c) => c.name === o);
    if (!i) return;
    const s = gs(r.value, i);
    s.valid || n.push({ field: o, message: s.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const o = Object.keys(t.requestBody.content || {})[0] || "application/json", i = t.requestBody.content?.[o]?.schema, c = e.querySelector('[data-field="body"]')?.value || "";
    if (!o.includes("multipart")) {
      const u = vs(c, o, i, t.requestBody.required);
      u.valid || n.push({ field: "body", message: u.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function bs(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function xs(e, t) {
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
function zr(e) {
  return l("span", { className: "validation-error", "data-error-for": e });
}
function Kn(e) {
  e.style.height = "0", e.style.height = `${e.scrollHeight}px`;
}
function Jn(e, t, n) {
  const a = l("div", { className: "body-editor" }), r = l("pre", { className: "body-highlight" }), o = l("code", {});
  r.append(o);
  const i = l("textarea", {
    className: "textarea-json",
    spellcheck: "false",
    rows: "1",
    autocomplete: "off",
    ...n?.dataField ? { "data-field": n.dataField } : {}
  });
  i.value = e;
  const s = (c, u) => {
    const d = c.endsWith(`
`) ? c + " " : c || " ";
    o.innerHTML = Ur(d, u);
  };
  return s(e, t), i.addEventListener("input", () => {
    s(i.value, t), n?.onInput?.();
  }), a.append(r, i), {
    wrap: a,
    textarea: i,
    setValue: (c, u) => {
      i.value = c, s(c, u ?? t);
    },
    syncLayout: () => {
    }
    // no-op — CSS Grid handles layout
  };
}
const ks = 1500;
function pe(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", a = de({
    variant: "icon",
    icon: T.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const r = await e.getText();
      await hi(r), a.innerHTML = T.check, a.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        a.innerHTML = T.copy, a.setAttribute("aria-label", t);
      }, ks);
    }
  });
  return a;
}
function ws(e, t, n, a) {
  V(t), t.classList.add("try-it");
  const r = l("div", { className: "body" }), o = l("div", { className: "block section" });
  o.append(l("h2", { textContent: "Response" }));
  const i = l("div", { "data-response": "true" });
  if (n)
    Zt(i, {
      status: parseInt(n.statusCode, 10) || 200,
      statusText: n.statusText || "OK",
      headers: {},
      body: n.body,
      duration: 0,
      size: 0
    });
  else {
    const s = l("div", { className: "placeholder" });
    s.append(l("span", { textContent: "Execute request to see response" })), i.append(s);
  }
  o.append(i), r.append(Cs(e, t, {
    onConfigChange: a?.onConfigChange,
    onSendRequest: async (s) => {
      bs(t);
      const c = ys(t, e);
      if (c.length > 0) {
        xs(t, c);
        return;
      }
      const u = we(t, e);
      s.setAttribute("disabled", ""), s.innerHTML = "", s.append(l("span", { className: "spinner spinner-sm" }), l("span", null, "Sending..."));
      try {
        const d = await rs(u);
        Zt(i, d);
      } catch (d) {
        Zt(i, {
          status: 0,
          headers: {},
          body: d.message,
          duration: 0,
          size: 0
        });
      } finally {
        s.removeAttribute("disabled"), s.innerHTML = T.send, s.append(l("span", null, "Send Request"));
      }
    }
  })), r.append(o), t.append(r);
}
function Cs(e, t, n) {
  const a = n?.onConfigChange, r = e.parameters.filter((E) => E.in === "path"), o = e.parameters.filter((E) => E.in === "query"), i = ds([...r, ...o]);
  let s = [];
  if (e.requestBody) {
    const E = Object.keys(e.requestBody.content || {})[0] || "application/json";
    if (!E.includes("multipart")) {
      const j = e.requestBody.content?.[E];
      j && (s = Fr(j));
    }
  }
  let c = null;
  const u = "Request", d = Jt({
    method: e.method,
    url: "",
    // will be updated
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), p = () => {
    const E = we(t, e);
    let j;
    return typeof E.body == "string" ? j = E.body : E.body instanceof FormData ? j = "{ /* multipart form-data */ }" : e.requestBody && (j = "{ ... }"), {
      method: E.method,
      url: E.url,
      headers: E.headers || {},
      body: j
    };
  }, m = () => {
    const E = we(t, e);
    if (typeof E.body == "string") return E.body;
    if (E.body instanceof FormData) {
      const j = [];
      return E.body.forEach((ae, be) => {
        if (ae instanceof File) {
          j.push(`${be}: [File ${ae.name}]`);
          return;
        }
        j.push(`${be}: ${String(ae)}`);
      }), j.join(`
`);
    }
    return "";
  }, f = (E, j) => {
    const ae = p(), be = Jt(ae), qe = be[j] || be[0];
    qe && E.setValue(qe.code, qe.language);
  }, h = l("div", { className: "block section tabs-code" }), v = l("div", { className: "body" }), y = l("h2", { textContent: "Request" });
  h.append(y, v);
  const b = k.get(), g = l("div", { className: "card" }), A = l("div", { className: "card-head" }), O = l("div", { className: "tabs tabs-code" }), x = [];
  let L = 0, w = null, C = null, $ = null, I = null;
  {
    const E = At(u, { active: !0, context: !0 });
    x.push(E), I = l("div", { className: "panel is-request", "data-tab": "first" });
    const j = i.length > 1 && (r.length > 0 || o.length > 0), ae = s.length > 1;
    if (j || ae) {
      const M = l("div", { className: "params-group" });
      M.append(l("h3", { textContent: "Examples" })), j && M.append(St({
        options: i.map((B) => ({ value: B.name, label: B.summary || B.name })),
        value: i[0].name,
        ariaLabel: "Select parameter example",
        className: "example-select",
        onChange: (B) => {
          const W = i.find((fe) => fe.name === B);
          W && (Ns(t, W.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
        }
      })), ae && M.append(St({
        options: s.map((B) => ({ value: B.name, label: ps(B) })),
        value: s[0].name,
        ariaLabel: "Select body example",
        className: "example-select",
        onChange: (B) => {
          const W = s.find((fe) => fe.name === B);
          W && c && (c.setValue(zn(W.value), "json"), c.syncLayout(), a?.(we(t, e)));
        }
      })), I.append(M);
    }
    const be = l("div", { className: "headers-section" }), qe = l("div", { className: "field-header" });
    qe.append(l("h3", { textContent: "Headers" }));
    const Xe = l("div", { className: "headers-list" });
    if (e.requestBody) {
      const B = Object.keys(e.requestBody.content || {})[0] || "application/json";
      Xe.append(at("Content-Type", B));
    }
    if (z(e.resolvedSecurity) && b.spec) {
      const M = vn(e.resolvedSecurity, b.spec.securitySchemes), W = { ...yn(e.resolvedSecurity, b.spec.securitySchemes), ...M };
      for (const [fe, dt] of Object.entries(W))
        Xe.append(at(fe, dt));
    }
    for (const M of e.parameters.filter((B) => B.in === "header"))
      Xe.append(at(M.name, String(M.example || "")));
    const Gr = de({
      variant: "icon",
      icon: T.plus,
      ariaLabel: "Add header",
      className: "field-copy-btn",
      onClick: () => Xe.append(at("", ""))
    });
    if (qe.append(Gr), be.append(qe, Xe), I.append(be), r.length > 0 || o.length > 0) {
      const M = l("div", { className: "params-group" });
      if (M.append(l("h3", { textContent: "Parameters" })), r.length > 0) {
        const B = l("div", { className: "params-group" });
        o.length > 0 && B.append(l("h3", { textContent: "Path" }));
        for (const W of r)
          B.append(Xn(W, i[0]?.values[W.name]));
        M.append(B);
      }
      if (o.length > 0) {
        const B = l("div", { className: "params-group" });
        r.length > 0 && B.append(l("h3", { textContent: "Query" }));
        for (const W of o)
          B.append(Xn(W, i[0]?.values[W.name]));
        M.append(B);
      }
      I.append(M);
    }
    {
      const M = l("div", { className: "route-preview" }), B = l("div", { className: "field-header" });
      B.append(l("h3", { textContent: "URL" }));
      const W = pe({
        ariaLabel: "Copy URL",
        getText: () => w?.value || we(t, e).url
      });
      w = Ee({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "route-input"
      });
      const fe = l("div", { className: "route-input-row" });
      fe.append(w, W), M.append(B, fe), C = M;
    }
    if (e.requestBody) {
      const M = l("div", { className: "body-section" }), B = l("div", { className: "field-header" });
      B.append(l("h3", { textContent: "Body" }));
      const W = pe({
        ariaLabel: "Copy body",
        className: "field-copy-btn",
        getText: m
      });
      B.append(W), M.append(B);
      const dt = Object.keys(e.requestBody.content || {})[0] || "application/json", Kr = dt.includes("multipart"), Sn = e.requestBody.content?.[dt];
      if (Kr && Sn?.schema) {
        const Qe = l("div", { className: "multipart", "data-field": "multipart" }), pt = Sn.schema, et = pt.properties || {}, Jr = pt.required || [];
        for (const [tt, Ie] of Object.entries(et)) {
          const Zr = Ie.format === "binary" || Ie.format === "base64" || Ie.type === "string" && Ie.format === "binary", An = Jr.includes(tt), _t = l("div", { className: `params row${An ? " is-required" : ""}` }), Ft = l("span", { className: "label", textContent: tt });
          if (An && Ft.append(Wr()), Zr) {
            const Dt = l("input", {
              type: "file",
              autocomplete: "off",
              "data-multipart-field": tt,
              "data-multipart-type": "file"
            });
            _t.append(Ft, Dt);
          } else {
            const Dt = Ee({
              placeholder: Ie.description || tt,
              value: Ie.default !== void 0 ? String(Ie.default) : "",
              dataAttrs: { multipartField: tt, multipartType: "text" }
            });
            _t.append(Ft, Dt);
          }
          Qe.append(_t);
        }
        M.append(Qe);
      } else {
        const Qe = s[0], pt = Qe ? zn(Qe.value) : "", et = Jn(pt, "json", {
          dataField: "body",
          onInput: () => a?.(we(t, e))
        });
        c = et, $ = et.syncLayout, M.append(et.wrap);
      }
      M.append(zr("body")), I.append(M);
    }
  }
  const R = p(), K = Jt(R), X = Jn(
    K[0]?.code ?? "",
    K[0]?.language
  ), ie = l("div", { className: "panel", "data-tab": "lang" }), q = l("div", { className: "body-section" }), Y = l("div", { className: "field-header" });
  Y.append(l("h3", { textContent: "Code Example" }));
  const ce = pe({
    ariaLabel: "Copy code",
    className: "field-copy-btn",
    getText: () => X.textarea.value
  });
  Y.append(ce), q.append(Y, X.wrap), ie.append(q);
  for (let E = 0; E < d.length; E++) {
    const j = d[E], ae = At(j.label, { active: !u });
    x.push(ae);
  }
  A.append(O);
  const Q = I ? [I, ie] : [ie], ee = (E, j) => {
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
      x.forEach((ae) => ae.classList.remove("is-active")), x[j].classList.add("is-active"), L = j, I && ee(I, j === 0), ee(ie, j !== 0), j === 0 && $?.(), j > 0 && f(X, j - 1);
    });
  }
  const ut = l("div", { className: "card-content flush" }), Ze = l("div", { className: "panels" });
  if (I && ee(I, !0), ee(ie, !1), Ze.append(...Q), ut.append(Ze), n?.onSendRequest) {
    const E = de({
      variant: "primary",
      icon: T.send,
      label: "Send Request",
      className: "send-btn"
    });
    E.addEventListener("click", () => n.onSendRequest(E));
    {
      C && I?.append(C);
      const j = l("div", { className: "send-inline" });
      j.append(E), I?.append(j);
    }
  }
  !n?.onSendRequest && u && C && I?.append(C), g.append(A, ut), v.append(g);
  const Oe = () => {
    w && (w.value = we(t, e).url), a?.(we(t, e)), (L > 0 || !u) && f(X, L - 1);
  };
  return t.addEventListener("input", Oe), t.addEventListener("change", Oe), queueMicrotask(() => {
    Oe(), $?.();
  }), Le().on("try-it:env-change", () => {
    Oe();
  }), h;
}
function Zn(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function Ns(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((a) => {
    const r = a.getAttribute("data-param-name");
    r && t[r] !== void 0 && (a.value = t[r]);
  });
}
function Xn(e, t) {
  const n = l("div", { className: `params row${e.required ? " is-required" : ""}` }), a = l("span", {
    className: "label",
    textContent: e.name
  });
  e.required && a.append(Wr());
  const r = e.schema;
  let o;
  if (r?.enum && r.enum.length > 0) {
    const s = e.required ? r.enum.map((u) => ({ value: String(u), label: String(u) })) : [{ value: "", label: "— select —" }, ...r.enum.map((u) => ({ value: String(u), label: String(u) }))];
    o = St({
      options: s,
      value: Zn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const s = r?.type === "integer" || r?.type === "number" ? "number" : "text", c = Ee({
      type: s,
      placeholder: e.description || e.name,
      value: Zn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    r?.type === "integer" && c.setAttribute("step", "1"), r?.minimum !== void 0 && c.setAttribute("min", String(r.minimum)), r?.maximum !== void 0 && c.setAttribute("max", String(r.maximum)), o = c;
  }
  const i = zr(e.name);
  return n.append(a, o, i), n;
}
function Wr() {
  return l("span", {
    className: "required-star",
    textContent: "*",
    "aria-hidden": "true"
  });
}
function at(e, t) {
  const n = l("div", { className: "header-row" }), a = Ee({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), r = Ee({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), o = de({
    variant: "icon",
    icon: T.close,
    ariaLabel: "Remove header",
    onClick: () => n.remove()
  });
  return n.append(a, r, o), n;
}
function we(e, t) {
  const n = k.get(), a = ye(n), r = e.querySelectorAll('[data-param-in="path"]'), o = {};
  r.forEach((f) => {
    o[f.getAttribute("data-param-name")] = f.value;
  });
  const i = e.querySelectorAll('[data-param-in="query"]'), s = {};
  if (i.forEach((f) => {
    const h = f.getAttribute("data-param-name");
    f.value && (s[h] = f.value);
  }), n.spec && z(t.resolvedSecurity)) {
    const f = $i(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [h, v] of Object.entries(f))
      h in s || (s[h] = v);
  }
  const c = e.querySelectorAll(".header-row"), u = {};
  if (c.forEach((f) => {
    const h = f.querySelector("[data-header-name]"), v = f.querySelector("[data-header-value]");
    h?.value && v?.value && (u[h.value] = v.value);
  }), n.spec && z(t.resolvedSecurity)) {
    const f = ji(t.resolvedSecurity, n.spec.securitySchemes), h = Object.entries(f).map(([v, y]) => `${v}=${y}`);
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
  const m = os(a, t.path, o, s);
  return { method: t.method, url: m, headers: u, body: p };
}
function Zt(e, t) {
  V(e);
  const n = l("div", { className: "card" }), a = l("div", { className: "card-head response-header" }), r = At("Body", { active: !0 }), o = At(`Headers (${Object.keys(t.headers).length})`), i = l("div", { className: "tabs tabs-code" });
  i.append(r, o);
  const s = l("div", {
    className: "meta",
    innerHTML: `<span>${vi(t.duration)}</span><span>${gi(t.size)}</span>`
  }), c = N({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), u = pe({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => As("Response copied")
  });
  a.append(i, s, c, u), n.append(a);
  const d = l("div", { className: "card-content flush" }), p = l("div", { className: "response-pane" }), m = l("div", { className: "pane-inner" }), f = l("pre", { className: "code-display" }), h = l("code", {}), v = Ss(t.body);
  h.innerHTML = Ur(v, Ar(v) ? "json" : ""), f.append(h), m.append(f), p.append(m);
  const y = l("div", { className: "response-pane", style: "display:none" }), b = l("div", { className: "pane-inner" }), g = l("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false",
    autocomplete: "off"
  });
  g.value = Object.entries(t.headers).map(([A, O]) => `${A}: ${O}`).join(`
`), Kn(g), b.append(g), y.append(b), d.append(p, y), n.append(d), r.addEventListener("click", () => {
    r.classList.add("is-active"), o.classList.remove("is-active"), p.style.display = "block", y.style.display = "none";
  }), o.addEventListener("click", () => {
    o.classList.add("is-active"), r.classList.remove("is-active"), p.style.display = "none", y.style.display = "block", requestAnimationFrame(() => Kn(g));
  }), e.append(n);
}
function Ss(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function As(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = l("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
let Es = 0;
function Tt(e, t, n) {
  if (t?.schema)
    return {
      content: Qi(t.schema).body,
      contentType: e,
      schemaType: Je(t.schema),
      itemsCount: Ls(t.schema)
    };
  const a = l("div", { className: "schema" }), r = l("div", { className: "body schema-body-plain" });
  return r.append(l("p", { textContent: n })), a.append(r), {
    content: a,
    contentType: e,
    schemaType: "plain",
    itemsCount: 1
  };
}
function bn(e) {
  const t = l("span", { className: "schema-content-meta" });
  return t.append(
    N({ text: e.contentType, kind: "chip", size: "s" }),
    N({ text: e.schemaType, kind: "chip", color: "primary", size: "s" })
  ), t;
}
function Ls(e) {
  let t = 0;
  return e.properties && (t += Object.keys(e.properties).length), e.type === "array" && e.items && (t += 1), Array.isArray(e.allOf) && (t += e.allOf.length), Array.isArray(e.oneOf) && (t += e.oneOf.length), Array.isArray(e.anyOf) && (t += e.anyOf.length), e.additionalProperties && typeof e.additionalProperties == "object" && (t += 1), Math.max(t, 1);
}
function Ce(e) {
  const t = `collapsible-category-${Es++}`, n = l("div", { className: "collapsible-category" }), a = l("span", { className: "collapsible-category-title", textContent: e.title }), r = l("span", { className: "collapsible-category-meta" });
  e.trailing && r.append(l("span", { className: "collapsible-category-trailing" }, e.trailing));
  const o = l("span", { className: "collapsible-category-controls" });
  e.counter !== void 0 && o.append(N({ text: String(e.counter), kind: "chip", size: "s" }));
  const i = l("span", { className: "collapsible-category-chevron", innerHTML: T.chevronDown });
  o.append(i), r.append(o);
  const s = l("button", {
    className: "collapsible-category-toggle focus-ring",
    type: "button",
    "aria-expanded": "true",
    "aria-controls": t
  }, a, r), c = l("div", {
    id: t,
    className: "collapsible-category-content"
  });
  c.append(e.content);
  const u = (d) => {
    n.classList.toggle("is-expanded", d), s.setAttribute("aria-expanded", d ? "true" : "false"), c.hidden = !d;
  };
  return s.addEventListener("click", () => {
    const d = s.getAttribute("aria-expanded") === "true";
    u(!d);
  }), u(e.expanded !== !1), n.append(s, c), { root: n };
}
function Vr(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([o, i]) => {
    const s = i.schema ? Je(i.schema) : "string", c = i.example !== void 0 ? String(i.example) : i.schema?.example !== void 0 ? String(i.schema.example) : "—", u = l("div", { className: "schema-row role-flat role-headers" }), d = l("div", { className: "schema-main-row" }), p = l("div", { className: "schema-name-wrapper" });
    p.append(
      l("span", { className: "schema-spacer" }),
      l("span", { textContent: o })
    );
    const m = l("div", { className: "schema-meta-wrapper" });
    m.append(N({ text: s, kind: "chip", color: "primary", size: "m" })), i.required && m.append(N({ text: "required", kind: "required", size: "m" })), d.append(p, m), u.append(d);
    const f = l("div", { className: "schema-desc-col is-root" });
    i.description && f.append(_(i.description));
    const h = l("div", { className: "schema-enum-values" });
    return h.append(N({
      text: c,
      kind: "chip",
      size: "s"
    })), f.append(h), f.children.length > 0 && u.append(f), u;
  }), a = l("div", { className: "params" }), r = l("div", { className: "body role-headers" });
  return r.append(...n), a.append(r), a;
}
function qt(e) {
  const t = l("div", { className: "collapsible-categories" });
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
    trailing: bn(e.body),
    counter: e.body.itemsCount
  });
  return t.append(n.root), t;
}
function an(e) {
  const { prev: t, next: n } = Os(e);
  if (!t && !n) return null;
  const a = l("div", {
    className: `route-nav${!t || !n ? " is-single" : ""}`
  });
  return t && a.append(Qn(t, "previous")), n && a.append(Qn(n, "next")), a;
}
function Qn(e, t) {
  const n = H(e.route), a = l("a", {
    className: `card interactive route-card ${t === "previous" ? "is-prev" : "is-next"}`,
    href: n
  }), r = l("div", { className: "route-meta" });
  e.kind === "endpoint" ? (r.append(N({
    text: e.operation.method.toUpperCase(),
    kind: "method",
    method: e.operation.method
  })), r.append(l("span", { className: "route-path", textContent: e.operation.path }))) : (r.append(N({
    text: "WEBHOOK",
    kind: "webhook",
    size: "s"
  })), r.append(N({
    text: e.webhook.method.toUpperCase(),
    kind: "method",
    method: e.webhook.method
  })));
  const o = l("span", { className: "route-side", "aria-hidden": "true" });
  o.innerHTML = t === "previous" ? T.chevronLeft : T.chevronRight;
  const i = l("div", { className: "route-main" });
  return i.append(
    l("span", { className: "route-category", textContent: e.category }),
    l("span", { className: "route-title", textContent: e.title }),
    r
  ), t === "previous" ? a.append(o, i) : a.append(i, o), a.addEventListener("click", (s) => {
    s.preventDefault(), P(n);
  }), a;
}
function Os(e) {
  if (!k.get().spec) return { prev: null, next: null };
  const n = Ts();
  if (n.length === 0) return { prev: null, next: null };
  const a = qs(n, e);
  return a < 0 ? { prev: null, next: null } : {
    prev: a > 0 ? n[a - 1] : null,
    next: a < n.length - 1 ? n[a + 1] : null
  };
}
function Ts() {
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
function qs(e, t) {
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
async function Is(e, t, n) {
  V(e), V(t);
  const a = n.method.toLowerCase() !== "trace", r = t.parentElement;
  r && a && (r.setAttribute("aria-label", "Try It"), r.classList.add("try-it"));
  const o = k.get(), i = ki(o), s = Ve(o), c = i + (n.path.startsWith("/") ? "" : "/") + n.path, u = [], d = N({
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
    const Y = q.startsWith("{") && q.endsWith("}"), ce = !Y && p.has(q.toLowerCase()), Q = o.spec?.tags.find((ee) => ee.name.toLowerCase() === q.toLowerCase());
    ce && Q ? u.push({
      label: q,
      href: H({ type: "tag", tag: Q.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (ee) => {
        ee.preventDefault(), P(H({ type: "tag", tag: Q.name }));
      }
    }) : u.push({
      label: q,
      className: Y ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const f = pe({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${c}`
  }), h = Ge(u, {
    leading: [d],
    trailing: [f]
  }), v = l("div", { className: "block header" });
  v.append(l("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.description && v.append(_(n.description));
  const y = l("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  y.append(h), v.append(y);
  const b = l("div", { className: "endpoint-meta-row" });
  if (n.deprecated) {
    const q = l("span", { className: "icon-muted" });
    q.innerHTML = T.warning, b.append(l("span", { className: "endpoint-meta deprecated" }, q, "Deprecated"));
  }
  let g = null;
  if (z(n.resolvedSecurity)) {
    const q = tr(o, n), Y = ir(n.resolvedSecurity) || "Auth required", ce = Mt({
      configured: q,
      variant: "endpoint",
      title: ze(n.resolvedSecurity)
    });
    g = l("span", {
      className: `endpoint-meta auth${q ? " is-active" : " is-missing"}`,
      "aria-label": ze(n.resolvedSecurity),
      role: "button",
      tabindex: "0"
    }, ce, Y), g.classList.add("endpoint-auth-trigger", "focus-ring"), g.addEventListener("click", () => {
      const Q = k.get().spec;
      if (!Q || !Object.keys(Q.securitySchemes || {}).length) return;
      const ee = e.closest(".root") ?? void 0;
      gn(Q.securitySchemes, ee, _s(n, o));
    }), g.addEventListener("keydown", (Q) => {
      const ee = Q.key;
      ee !== "Enter" && ee !== " " || (Q.preventDefault(), g && g.click());
    }), b.append(g);
  }
  b.childElementCount > 0 && v.append(b), e.append(v);
  const A = n.parameters.filter((q) => q.in !== "cookie"), O = U({ title: "Request" }), x = $s(n, A);
  if (x)
    O.append(x);
  else {
    const q = l("div", { className: "params empty", textContent: "No parameters or request body required" });
    O.append(q);
  }
  e.append(O);
  let L = !1;
  Object.keys(n.responses).length > 0 && (e.append(Ps(n)), L = !0);
  const w = {
    type: "endpoint",
    method: n.method,
    path: n.path,
    operationId: n.operationId
  }, C = an(w), $ = an(w), I = () => {
    if (C && e.append(l("div", { className: "route-nav-wrap is-desktop" }, C)), $) {
      const q = e.closest(".page");
      q && q.append(l("div", { className: "route-nav-wrap is-mobile" }, $));
    }
  };
  L && I(), n.callbacks && n.callbacks.length > 0 && e.append(Rs(n)), L || I();
  const R = Hs(n);
  n.method.toLowerCase() !== "trace" && ws(n, t, R);
  const K = Le(), X = h.querySelector(".breadcrumb-item");
  X && K.on("endpoint:breadcrumb", (q) => {
    X.textContent = Ve(q) || q.spec?.info.title || "Home";
  }), g && z(n.resolvedSecurity) && K.on("endpoint:auth-badge", (q) => {
    const Y = tr(q, n);
    g.className = `endpoint-meta auth endpoint-auth-trigger focus-ring${Y ? " is-active" : " is-missing"}`;
    const ce = g.querySelector(".lock-icon");
    ce && (ce.className = `lock-icon${Y ? " is-unlocked" : ""}`);
  });
  const ie = t.querySelector(".content");
  ie && z(n.resolvedSecurity) && K.on("endpoint:auth-headers", (q) => {
    if (!q.spec) return;
    const Y = ie.querySelector(".headers-list");
    if (!Y) return;
    const ce = ["Authorization", "Cookie"];
    for (const Te of Array.from(Y.querySelectorAll(".header-row"))) {
      const E = Te.querySelector("[data-header-name]");
      E && ce.includes(E.value) && Te.remove();
    }
    const Q = vn(n.resolvedSecurity, q.spec.securitySchemes), ut = { ...yn(n.resolvedSecurity, q.spec.securitySchemes), ...Q }, Ze = Array.from(Y.querySelectorAll(".header-row")), Oe = Ze.find((Te) => {
      const E = Te.querySelector("[data-header-name]");
      return E && E.value === "Content-Type";
    }) || Ze[0];
    for (const [Te, E] of Object.entries(ut).reverse()) {
      const j = at(Te, E);
      Oe ? Oe.insertAdjacentElement("beforebegin", j) : Y.prepend(j);
    }
    ie.dispatchEvent(new Event("input", { bubbles: !0 }));
  });
}
function $s(e, t) {
  const n = t.filter((u) => u.in === "path"), a = t.filter((u) => u.in === "query"), r = js(e), o = Ms(e);
  if (n.length === 0 && a.length === 0 && r.length === 0 && !o)
    return null;
  const i = re(), s = Ye(), c = l("div", { className: "collapsible-categories" });
  if (n.length > 0) {
    const u = Ce({
      title: "Path",
      content: er(n),
      counter: n.length
    });
    c.append(u.root);
  }
  if (a.length > 0) {
    const u = Ce({
      title: "Query",
      content: er(a),
      counter: a.length
    });
    c.append(u.root);
  }
  if (r.length > 0) {
    const u = Ce({
      title: "Headers",
      content: Bs(r),
      counter: r.length
    });
    c.append(u.root);
  }
  if (o) {
    const u = Ce({
      title: "Body",
      content: o.content,
      trailing: o.trailing,
      counter: o.counter
    });
    c.append(u.root);
  }
  return s.append(c), i.append(s), i;
}
function er(e) {
  const t = e.map((r) => {
    const o = l("div", { className: "schema-row role-flat role-params" }), i = l("div", { className: "schema-main-row" }), s = l("div", { className: "schema-name-wrapper" });
    s.append(
      l("span", { className: "schema-spacer" }),
      l("span", { textContent: r.name })
    );
    const c = l("div", { className: "schema-meta-wrapper" });
    c.append(N({
      text: r.schema ? Je(r.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), r.required && c.append(N({ text: "required", kind: "required", size: "m" })), i.append(s, c), o.append(i);
    const u = l("div", { className: "schema-desc-col is-root" });
    r.description && u.append(_(r.description));
    const d = r.schema?.enum, p = r.schema?.default !== void 0;
    if (d && d.length > 0 || p) {
      const m = l("div", { className: "schema-enum-values" });
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
  }), n = l("div", { className: "params" }), a = l("div", { className: "body role-params" });
  return a.append(...t), n.append(a), n;
}
function js(e) {
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
  if (z(e.resolvedSecurity)) {
    const n = k.get().spec, a = n ? vn(e.resolvedSecurity, n.securitySchemes) : {}, o = { ...n ? yn(e.resolvedSecurity, n.securitySchemes) : {}, ...a };
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
function Bs(e) {
  const t = e.map((r) => {
    const o = l("div", { className: "schema-row role-flat role-headers" }), i = l("div", { className: "schema-main-row" }), s = l("div", { className: "schema-name-wrapper" });
    s.append(
      l("span", { className: "schema-spacer" }),
      l("span", { textContent: r.name })
    );
    const c = l("div", { className: "schema-meta-wrapper" });
    r.required && c.append(N({ text: "required", kind: "required", size: "m" })), i.append(s, c), o.append(i);
    const u = l("div", { className: "schema-desc-col is-root" });
    r.description && u.append(_(r.description));
    const d = l("div", { className: "schema-enum-values" });
    return d.append(N({
      text: r.value || "—",
      kind: "chip",
      size: "s"
    })), u.append(d), u.children.length > 0 && o.append(u), o;
  }), n = l("div", { className: "params" }), a = l("div", { className: "body role-headers" });
  return a.append(...t), n.append(a), n;
}
function Ms(e) {
  const t = l("div", { className: "request-body-wrap" }), n = Object.entries(e.requestBody?.content || {});
  if (e.requestBody?.description && t.append(_(e.requestBody.description)), n.length === 0)
    return t.childElementCount > 0 ? { content: t } : null;
  const a = n.map(([o, i]) => Tt(o, i, "No schema"));
  if (a.length === 1) {
    const o = a[0];
    return t.append(o.content), { content: t, trailing: bn(o), counter: o.itemsCount };
  }
  const r = l("div", { className: "schema-media-list" });
  for (const o of a) {
    const i = l("div", { className: "schema-media-header" });
    i.append(
      N({ text: o.contentType, kind: "chip", size: "s" }),
      N({ text: o.schemaType, kind: "chip", color: "primary", size: "s" })
    );
    const s = l("div", { className: "schema-media-item" });
    s.append(i, o.content), r.append(s);
  }
  return t.append(r), {
    content: t,
    counter: a.length
  };
}
function Ps(e) {
  const t = U({
    titleEl: ct("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const a = re(), r = l("div", { className: "card-row responses-header-row" }), o = l("div", { className: "tabs-code codes" });
  let i = n[0][0];
  const s = /* @__PURE__ */ new Map();
  for (const [p, m] of n) {
    const f = qr(p, p === i), h = m.content && Object.keys(m.content)[0] || "application/json", v = m.content?.[h], y = Tt(h, v, m.description || "No schema"), b = m.headers ? Vr(m.headers) : null;
    s.set(p, {
      body: y,
      headers: b,
      headersCount: m.headers ? Object.keys(m.headers).length : 0
    }), o.append(f), f.addEventListener("click", () => {
      o.querySelectorAll('[data-badge-group="response-code"]').forEach((A) => Et(A, !1)), Et(f, !0), i = p;
      const g = s.get(p);
      u.innerHTML = "", u.append(qt(g));
    });
  }
  r.append(o), a.append(Bt(r));
  const c = Ye(), u = l("div"), d = s.get(i);
  return d && u.append(qt(d)), c.append(u), a.append(c), t.append(a), t;
}
function Rs(e) {
  const t = U({
    titleEl: ct("Callbacks", N({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const a = l("div", { className: "callback-block" });
    a.append(l("div", { className: "callback-name", textContent: n.name }));
    for (const r of n.operations) {
      const o = l("div", { className: "callback-operation" }), i = l("div", { className: "callback-op-header" });
      if (i.append(
        N({
          text: r.method.toUpperCase(),
          kind: "method",
          method: r.method
        }),
        l("span", { className: "callback-op-path", textContent: r.path })
      ), o.append(i), r.summary && o.append(l("div", { className: "callback-op-summary", textContent: r.summary })), r.description && o.append(_(r.description)), r.requestBody) {
        const s = r.requestBody.content || {};
        for (const [c, u] of Object.entries(s))
          u.schema && o.append(nn(u.schema, `${c} — Request Body`));
      }
      if (Object.keys(r.responses).length > 0)
        for (const [s, c] of Object.entries(r.responses)) {
          const u = l("div", { className: "callback-response-row" });
          if (u.append(N({
            text: s,
            kind: "status",
            statusCode: s
          })), c.description && u.append(_(c.description)), c.content)
            for (const [d, p] of Object.entries(c.content))
              p.schema && u.append(nn(p.schema, `${d}`));
          o.append(u);
        }
      a.append(o);
    }
    t.append(a);
  }
  return t;
}
function Hs(e) {
  const t = Object.keys(e.responses).sort((n, a) => {
    const r = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, o = a.startsWith("2") ? 0 : a.startsWith("4") ? 1 : 2;
    return r - o || n.localeCompare(a);
  });
  for (const n of t) {
    const a = e.responses[n];
    if (!a?.content) continue;
    const r = Object.keys(a.content)[0] || "application/json", o = a.content[r], s = (o ? Fr(o) : [])[0];
    if (s && s.value !== void 0) {
      const c = typeof s.value == "string" ? s.value : JSON.stringify(s.value, null, 2), u = a.description || (n.startsWith("2") ? "OK" : n.startsWith("4") ? "Not Found" : "Error");
      return { statusCode: n, statusText: u, body: c };
    }
    if (o?.example !== void 0) {
      const c = typeof o.example == "string" ? o.example : JSON.stringify(o.example, null, 2);
      return { statusCode: n, statusText: a.description || "OK", body: c };
    }
  }
  return null;
}
function tr(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!z(t.resolvedSecurity)) return !1;
  const a = (e.auth.token || "").trim(), r = e.auth.schemes || {}, o = e.auth.activeScheme, i = (s) => String(r[s] || "").trim() ? !0 : a ? !o || o === s : !1;
  return n.some((s) => {
    const c = s.map((u) => u.schemeName);
    return c.length === 0 ? !0 : c.every((u) => i(u));
  });
}
function _s(e, t) {
  return (e.resolvedSecurity?.requirements || [])[0]?.[0]?.schemeName || t.auth.activeScheme || void 0;
}
function Fs(e, t, n) {
  V(e);
  const a = k.get().spec;
  if (!a) return;
  const r = ne(n), o = a.tags.find((g) => g.name === n) || a.tags.find((g) => ne(g.name) === r);
  if (!o || o.operations.length === 0) {
    const g = l("div", { className: "block header" });
    g.append(l("h1", { textContent: "Tag not found" })), e.append(g), e.append(U(
      { title: "Details" },
      l("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const i = l("div", { className: "block header" });
  i.append(l("h1", { textContent: o.name }));
  const s = k.get(), c = Ve(s), u = pe({
    ariaLabel: "Copy category",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => o.name
  }), d = Ge([
    {
      label: c || a.info.title || "Home",
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
  }), p = l("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  p.append(d), i.append(p), o.description && i.append(_(o.description)), e.append(i);
  const m = Ds(o), f = o.operations.filter((g) => z(g.resolvedSecurity)).length, h = o.operations.filter((g) => g.deprecated).length;
  e.append(U(
    { className: "summary" },
    Ht(
      [
        { label: "Endpoints", value: o.operations.length },
        { label: "Auth Required", value: f },
        { label: "Deprecated", value: h }
      ],
      m
    )
  ));
  const v = U({ title: "Endpoints" }), y = k.get().route;
  for (const g of o.operations) {
    const A = {
      type: "endpoint",
      tag: o.name,
      method: g.method,
      path: g.path,
      operationId: g.operationId
    }, O = y.type === "endpoint" && (y.operationId && y.operationId === g.operationId || y.method === g.method && y.path === g.path), x = re({
      interactive: !0,
      active: O,
      className: `card-group${g.deprecated ? " deprecated" : ""}`,
      onClick: () => P(H(A))
    }), L = z(g.resolvedSecurity) ? Mt({
      configured: Rt(g.resolvedSecurity, a.securitySchemes || {}),
      variant: "tag",
      title: ze(g.resolvedSecurity)
    }) : null, w = l("div", { className: "card-badges" });
    w.append(N({ text: g.method.toUpperCase(), kind: "method", method: g.method, size: "m" }));
    const C = l("div", { className: "card-group-top" });
    L && C.append(L), C.append(l("h3", { className: "card-group-title" }, l("code", { textContent: g.path })), w);
    const $ = g.summary || g.operationId ? l("p", { className: "card-group-description", textContent: g.summary || g.operationId }) : null;
    x.append(C), $ && x.append($), v.append(x);
  }
  e.append(v);
  const b = d.querySelector(".breadcrumb-item");
  b && Le().on("tag:breadcrumb", (g) => {
    b.textContent = Ve(g) || g.spec?.info.title || "Home";
  });
}
function Ds(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function Us(e, t) {
  V(e);
  const n = N({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), a = N({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), r = k.get(), o = Ve(r), i = pe({
    ariaLabel: "Copy webhook name",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${t.method.toUpperCase()} ${t.name}`
  }), s = Ge(
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
  ), c = l("div", { className: "block header" });
  t.summary ? c.append(l("h1", { textContent: t.summary })) : c.append(l("h1", { textContent: t.name }));
  const u = l("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  u.append(s), c.append(u), t.description && c.append(_(t.description)), e.append(c);
  const d = t.parameters.filter((h) => h.in !== "cookie");
  if (d.length > 0) {
    const h = U({ title: "Parameters" }, zs(d));
    e.append(h);
  }
  if (t.requestBody) {
    const h = U({
      titleEl: ct("Request")
    }), v = Object.entries(t.requestBody.content || {});
    if (v.length > 0) {
      const y = re(), b = Ye(), g = l("div", { className: "collapsible-categories" }), A = l("div", { className: "request-body-wrap" });
      t.requestBody.description && A.append(_(t.requestBody.description));
      const O = v.map(([x, L]) => Tt(x, L, "No schema"));
      if (O.length === 1) {
        const x = O[0];
        A.append(x.content);
        const L = Ce({
          title: "Body",
          content: A,
          trailing: bn(x),
          counter: x.itemsCount
        });
        g.append(L.root);
      } else {
        const x = l("div", { className: "schema-media-list" });
        for (const w of O) {
          const C = l("div", { className: "schema-media-header" });
          C.append(
            N({ text: w.contentType, kind: "chip", size: "s" }),
            N({ text: w.schemaType, kind: "chip", color: "primary", size: "s" })
          );
          const $ = l("div", { className: "schema-media-item" });
          $.append(C, w.content), x.append($);
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
    const h = U({
      titleEl: ct("Expected Responses")
    }), v = re(), y = l("div", { className: "card-row responses-header-row" }), b = l("div", { className: "tabs-code codes" });
    let g = p[0][0];
    const A = /* @__PURE__ */ new Map();
    for (const [w, C] of p) {
      const $ = qr(w, w === g), I = C.content && Object.keys(C.content)[0] || "application/json", R = C.content?.[I], K = Tt(I, R, C.description || "No schema"), X = C.headers ? Vr(C.headers) : null;
      A.set(w, {
        body: K,
        headers: X,
        headersCount: C.headers ? Object.keys(C.headers).length : 0
      }), b.append($), $.addEventListener("click", () => {
        b.querySelectorAll('[data-badge-group="response-code"]').forEach((q) => Et(q, !1)), Et($, !0), g = w;
        const ie = A.get(w);
        x.innerHTML = "", x.append(qt(ie));
      });
    }
    y.append(b), v.append(Bt(y));
    const O = Ye(), x = l("div"), L = A.get(g);
    L && x.append(qt(L)), O.append(x), v.append(O), h.append(v), e.append(h);
  }
  const m = an({ type: "webhook", webhookName: t.name });
  m && e.append(l("div", { className: "block section" }, m));
  const f = s.querySelector(".breadcrumb-item");
  f && Le().on("webhook:breadcrumb", (h) => {
    f.textContent = Ve(h) || h.spec?.info.title || "Home";
  });
}
function zs(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, a = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return es(e, { headerTitle: a, withEnumAndDefault: !1 });
}
function Ws() {
  const e = l("div", { className: "page" }), t = l("div", {
    className: "main",
    role: "main"
  }), n = l("div", { className: "content" });
  t.append(n);
  const a = l("div", {
    className: "aside",
    "aria-label": "Panel"
  }), r = l("div", { className: "content" });
  return a.append(r), a.hidden = !0, e.append(t, a), { page: e, main: n, aside: r };
}
function me(e, t) {
  const n = e.querySelector(".aside");
  n && (n.hidden = !t);
}
function gt(e) {
  const { title: t, message: n, icon: a, variant: r = "empty" } = e;
  if (r === "loading")
    return l(
      "div",
      { className: "block header" },
      l("h2", { textContent: t }),
      l(
        "div",
        { className: "loading" },
        l("div", { className: "spinner" }),
        l("span", null, n || t)
      )
    );
  const o = l("div", { className: "block header" });
  return a && o.append(l("span", { innerHTML: a, className: "icon-muted" })), o.append(l("h2", { textContent: t })), n && o.append(l("p", { className: "error-message", textContent: n })), o;
}
let ge = null, oe = null, xn = null, kn = null, wn = null, xt = null, kt = !1, vt = "", Fe = null;
const Vs = 991;
function Ys(e, t) {
  ge = l("div", { className: "root" });
  const n = {
    primaryColor: t.primaryColor
  };
  Mn(ge, k.get().theme, n);
  const a = l("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', a.addEventListener("click", () => {
    k.set({ sidebarOpen: !0 }), oe?.classList.remove("collapsed");
  }), oe = l("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: r, main: o, aside: i } = Ws();
  xn = r, kn = o, wn = i, ge.append(a, oe, r), e.append(ge), Js(), k.subscribe((s) => {
    ge && (Mn(ge, s.theme, n), oe?.classList.toggle("collapsed", !s.sidebarOpen), a.classList.toggle("visible", !s.sidebarOpen), nr(s, t));
  }), oe?.classList.toggle("collapsed", !k.get().sidebarOpen), a.classList.toggle("visible", !k.get().sidebarOpen), nr(k.get(), t);
}
function Gs() {
  Fe?.(), Fe = null, Er(), ge && (ge.remove(), ge = null, oe = null, xn = null, kn = null, wn = null, xt = null, kt = !1);
}
async function nr(e, t) {
  const n = !!e.spec;
  oe && n ? (kt ? Pi(oe, e.route) : Hi(oe, t), kt = !0) : kt = !1;
  const a = kn, r = wn, o = xn;
  if (!a || !r || !o) return;
  if (e.loading) {
    me(o, !1), V(r), nt(a, gt({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const m = a.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (e.error) {
    me(o, !1), V(r), nt(a, gt({
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
  const i = e.route, s = `${e.activeEnvironment}|${e.auth.token}`, c = !!(xt && Zs(xt, i)), u = c && vt !== s, d = a.parentElement, p = d ? d.scrollTop : 0;
  if (!(c && vt === s)) {
    if (u) {
      vt = s, bi(e), oe && e.spec && (Ri(oe), Vi(oe));
      return;
    }
    switch (xt = { ...i }, vt = s, Er(), o.querySelectorAll(":scope > .route-nav-wrap").forEach((m) => m.remove()), V(a), V(r), i.type) {
      case "overview":
        me(o, !1), Un(a);
        break;
      case "tag": {
        me(o, !1), Fs(a, r, i.tag || "");
        break;
      }
      case "endpoint": {
        const m = Ks(e, i);
        if (m) {
          const f = m.method.toLowerCase() !== "trace";
          me(o, f), await Is(a, r, m);
        } else {
          me(o, !1);
          const f = i.operationId ? i.operationId : `${i.method?.toUpperCase() || ""} ${i.path || ""}`.trim();
          nt(a, gt({
            title: "Endpoint not found",
            message: f || "Unknown endpoint",
            variant: "empty"
          }));
        }
        break;
      }
      case "schema": {
        if (me(o, !1), i.schemaName) {
          const m = e.spec.schemas[i.schemaName];
          if (m) {
            const f = ye(e), h = Ae(f), v = pe({
              ariaLabel: "Copy schema name",
              copiedAriaLabel: "Copied",
              className: "breadcrumb-copy",
              getText: () => i.schemaName || ""
            }), y = Ge(
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
            ), b = l("div", { className: "block header" });
            b.append(l("h1", { textContent: i.schemaName }));
            const g = l("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
            g.append(y), b.append(g), m.description && b.append(_(String(m.description)));
            const A = l("div", { className: "block section" });
            A.append(nn(m, "Properties")), nt(a, b, A);
            const O = y.querySelector(".breadcrumb-item");
            O && Le().on("schema:breadcrumb", (x) => {
              O.textContent = Ae(ye(x)) || x.spec?.info.title || "Home";
            });
          }
        } else
          Qs(a, e);
        break;
      }
      case "webhook": {
        if (me(o, !1), i.webhookName) {
          const m = e.spec.webhooks?.find((f) => f.name === i.webhookName);
          m ? Us(a, m) : nt(a, gt({
            title: "Webhook not found",
            message: i.webhookName,
            variant: "empty"
          }));
        } else
          Xs(a, e);
        break;
      }
      default:
        me(o, !1), Un(a);
    }
    d && (d.scrollTop = u ? p : 0);
  }
}
function Ks(e, t) {
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
    const o = ne(t.tag), i = r.find(
      (s) => s.tags.some((c) => ne(c) === o)
    );
    if (i) return i;
  }
  return r[0];
}
function Js() {
  if (Fe?.(), Fe = null, typeof window > "u" || typeof window.matchMedia != "function") return;
  const e = window.matchMedia(`(max-width: ${Vs}px)`), t = (r) => {
    const o = !r;
    k.get().sidebarOpen !== o && k.set({ sidebarOpen: o });
  };
  t(e.matches);
  const n = (r) => {
    t(r.matches);
  };
  if (typeof e.addEventListener == "function") {
    e.addEventListener("change", n), Fe = () => e.removeEventListener("change", n);
    return;
  }
  const a = n;
  e.addListener(a), Fe = () => e.removeListener(a);
}
function Zs(e, t) {
  return e.type === t.type && e.operationId === t.operationId && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
function Xs(e, t) {
  const n = t.spec;
  if (!n) return;
  const a = n.webhooks || [], r = ye(t), o = Ae(r), i = l("div", { className: "block header" });
  i.append(l("h1", { textContent: "Webhooks" }));
  const s = Ge([
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
    trailing: [pe({
      ariaLabel: "Copy",
      copiedAriaLabel: "Copied",
      className: "breadcrumb-copy",
      getText: () => "Webhooks"
    })]
  }), c = l("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  c.append(s), i.append(c), e.append(i);
  const u = s.querySelector(".breadcrumb-item");
  u && Le().on("webhookList:breadcrumb", (m) => {
    u.textContent = Ae(ye(m)) || m.spec?.info.title || "Home";
  });
  const d = {};
  for (const m of a)
    d[m.method] = (d[m.method] || 0) + 1;
  e.append(U(
    { className: "summary" },
    Ht(
      [{ label: "Webhooks", value: a.length }],
      d
    )
  ));
  const p = U({ title: "Webhooks" });
  for (const m of a) {
    const f = { type: "webhook", webhookName: m.name }, h = t.route.type === "webhook" && t.route.webhookName === m.name, v = re({
      interactive: !0,
      active: h,
      className: "card-group",
      onClick: () => P(H(f))
    }), y = l("div", { className: "card-badges" });
    y.append(
      N({ text: "WH", kind: "webhook", size: "m" }),
      N({ text: m.method.toUpperCase(), kind: "method", method: m.method, size: "m" })
    );
    const b = l("div", { className: "card-group-top" });
    b.append(l("h3", { className: "card-group-title", textContent: m.name }), y);
    const g = _(m.summary || m.description || `${m.method.toUpperCase()} webhook`, "card-group-description md-content");
    v.append(b, g), p.append(v);
  }
  e.append(p);
}
function Qs(e, t) {
  const n = t.spec;
  if (!n) return;
  const a = Object.keys(n.schemas), r = ye(t), o = Ae(r), i = l("div", { className: "block header" });
  i.append(l("h1", { textContent: "Schemas" }));
  const s = Ge([
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
    trailing: [pe({
      ariaLabel: "Copy",
      copiedAriaLabel: "Copied",
      className: "breadcrumb-copy",
      getText: () => "Schemas"
    })]
  }), c = l("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  c.append(s), i.append(c), e.append(i);
  const u = s.querySelector(".breadcrumb-item");
  u && Le().on("schemaList:breadcrumb", (p) => {
    u.textContent = Ae(ye(p)) || p.spec?.info.title || "Home";
  }), e.append(U(
    { className: "summary" },
    Ht(
      [{ label: "Schemas", value: a.length }],
      {}
    )
  ));
  const d = U({ title: "Schemas" });
  for (const p of a) {
    const m = n.schemas[p], f = { type: "schema", schemaName: p }, h = t.route.type === "schema" && t.route.schemaName === p, v = re({
      interactive: !0,
      active: h,
      className: "card-group",
      onClick: () => P(H(f))
    }), y = l("div", { className: "card-badges" }), b = m.type || (m.allOf ? "allOf" : m.oneOf ? "oneOf" : m.anyOf ? "anyOf" : "object");
    y.append(N({ text: b, kind: "chip", size: "m" })), m.properties && y.append(N({ text: `${Object.keys(m.properties).length} props`, kind: "chip", size: "m" }));
    const g = l("div", { className: "card-group-top" });
    g.append(l("h3", { className: "card-group-title", textContent: p }), y);
    const A = _(m.description ? String(m.description) : `${b} schema`, "card-group-description md-content");
    v.append(g, A), d.append(v);
  }
  e.append(d);
}
const Yr = "ap_portal_prefs";
function ec() {
  try {
    const e = localStorage.getItem(Yr);
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
function tc(e) {
  try {
    localStorage.setItem(Yr, JSON.stringify(e));
  } catch {
  }
}
function rr(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function nc(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], a = rr(e[n]);
  for (let r = 1; r < t.length; r++) {
    const o = t[r], i = rr(e[o]);
    i < a && (a = i, n = o);
  }
  return n;
}
function rc(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), a = Object.entries(t.schemes);
  if (n.length !== a.length) return !1;
  for (const [r, o] of n)
    if (t.schemes[r] !== o) return !1;
  return !0;
}
function ac(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const a = {};
  for (const i of n) {
    const s = e.schemes[i];
    typeof s == "string" && s.length > 0 && (a[i] = s);
  }
  let r = e.activeScheme;
  (!r || !t[r]) && (r = n.find((i) => !!a[i]) || ""), !r && e.token && (r = nc(t)), r && e.token && !a[r] && (a[r] = e.token);
  let o = e.token;
  return r && a[r] && o !== a[r] && (o = a[r]), !o && r && a[r] && (o = a[r]), {
    ...e,
    schemes: a,
    activeScheme: r,
    token: o
  };
}
function oc(e, t) {
  let n;
  return ((...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  });
}
let It = !1, on = null, sn = null;
function ic(e) {
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
function sc(e) {
  if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((r) => r.getAttribute("href") === e)) return;
  const a = document.createElement("link");
  a.rel = "stylesheet", a.href = e, document.head.append(a);
}
function cc(e) {
  document.documentElement.style.minHeight = "100%", document.body.style.width = "100vw", document.body.style.height = "100vh", document.body.style.margin = "0", e.style.width = "100%", e.style.height = "100%", e.style.display = "block";
}
function lc(e) {
  const t = (e || "/").replace(/\/+/g, "/"), n = t.indexOf("/~/");
  if (n >= 0) return `${t.slice(0, n) || ""}/`;
  if (t.endsWith("/~")) return `${t.slice(0, -2) || ""}/`;
  if (t.endsWith("/")) return t;
  const a = t.split("/").filter(Boolean).pop() || "";
  if (a && !a.includes(".")) return `${t}/`;
  const r = t.lastIndexOf("/");
  return r < 0 ? "/" : t.slice(0, r + 1);
}
function uc(e) {
  if (!e || /^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(e) || e.startsWith("/")) return e;
  const n = new URL(window.location.href);
  return n.pathname = lc(window.location.pathname || "/"), n.search = "", n.hash = "", new URL(e, n.href).toString();
}
async function Cn(e) {
  let t = null;
  It && (t = k.get().auth, Nn());
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  k.reset();
  const a = [{ name: "default", baseUrl: "" }];
  k.set({
    loading: !0,
    theme: pi(e.theme),
    environments: [...a],
    initialEnvironments: [...a],
    activeEnvironment: "default"
  });
  const r = ec();
  r ? k.set({
    activeEnvironment: r.activeEnvironment || "default",
    auth: r.auth
  }) : t && k.setAuth(t);
  const o = oc(() => {
    const i = k.get();
    tc({
      activeEnvironment: i.activeEnvironment,
      environments: i.environments,
      auth: i.auth
    });
  }, 300);
  k.subscribe(() => o()), ea(""), sn = Mi(), Ys(n, e), It = !0;
  try {
    let i;
    const s = e.specUrl;
    if (e.spec)
      i = e.spec;
    else if (s)
      i = await ci(uc(s));
    else
      throw new Error("Either spec or specUrl must be provided");
    const c = Zo(i);
    if (c.servers.length > 0) {
      const p = c.servers.map((h, v) => ({
        name: h.description || (v === 0 ? "default" : `Server ${v + 1}`),
        baseUrl: h.url
      }));
      k.set({ environments: p, initialEnvironments: p.map((h) => ({ ...h })) });
      const m = k.get();
      p.some((h) => h.name === m.activeEnvironment) || k.set({ activeEnvironment: p[0]?.name || "default" });
    }
    const u = k.get().auth, d = ac(u, c.securitySchemes);
    rc(u, d) || k.setAuth(d), li(c), k.set({ spec: c, loading: !1, error: null });
  } catch (i) {
    k.set({
      loading: !1,
      error: i.message || "Failed to load specification"
    });
  }
  return on = pc(), on;
}
async function dc(e) {
  if (typeof document > "u")
    throw new Error("[PureDocs] bootstrap() requires a browser environment");
  const t = ic(e);
  e.cssHref && sc(e.cssHref), e.fullPage !== !1 && cc(t);
  const { mount: n, mountId: a, cssHref: r, fullPage: o, ...i } = e;
  return Cn({
    ...i,
    mount: t
  });
}
function Nn() {
  It && (sn?.(), sn = null, ta(), Gs(), k.reset(), It = !1, on = null);
}
function pc() {
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
const ar = [
  "spec-url",
  "spec-json",
  "theme",
  "primary-color",
  "title"
], he = class he extends HTMLElement {
  constructor() {
    super(...arguments), this.api = null, this.reloadTimer = null;
  }
  static get observedAttributes() {
    return [...ar];
  }
  async connectedCallback() {
    if (he.activeElement && he.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    he.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    he.activeElement === this && (this.api = null, Nn(), he.activeElement = null);
  }
  attributeChangedCallback(t, n, a) {
    this.isConnected && n !== a && ar.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
      this.reload();
    }, 80));
  }
  async reload() {
    he.activeElement === this && await this.mountFromAttributes();
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
      spec: t ? fc(t, "spec-json") : void 0,
      theme: mc(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      title: this.getAttribute("title") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
he.activeElement = null;
let cn = he;
function fc(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function mc(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", cn);
const hc = {
  mount: Cn,
  bootstrap: dc,
  unmount: Nn,
  version: "1.0.0"
};
export {
  hc as PureDocs,
  cn as PureDocsElement,
  hc as default
};
//# sourceMappingURL=puredocs.js.map
