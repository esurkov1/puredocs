class Vr {
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
    const i = { ...this.state.auth.schemes, [t]: n }, r = t, a = n;
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, schemes: i, activeScheme: r, token: a, source: "manual" }
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
const b = new Vr(), Yr = /* @__PURE__ */ new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace"
]);
let Ce = "";
function Gr(e = "") {
  Ce = e.replace(/\/+$/, ""), window.addEventListener("popstate", st), st();
}
function Kr() {
  window.removeEventListener("popstate", st);
}
function R(e) {
  window.history.pushState(null, "", Ce + e), st();
}
function F(e) {
  switch (e.type) {
    case "overview":
      return "/";
    case "tag":
      return `/${Z(e.tag || "")}`;
    case "endpoint": {
      const t = e.tag || "default", n = (e.method || "get").toLowerCase(), i = e.path || "/";
      return `/${Z(t)}/${n}${i}`;
    }
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
function Gn(e) {
  const n = (e.split("?")[0]?.split("#")[0] || "/").replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
  if (n === "/") return { type: "overview" };
  const i = n.slice(1).split("/");
  if (i.length === 0) return { type: "overview" };
  const r = de(i[0]).toLowerCase();
  if (r === "schemas" && i.length >= 2)
    return {
      type: "schema",
      schemaName: de(i.slice(1).join("/"))
    };
  if (r === "webhooks" && i.length >= 2)
    return {
      type: "webhook",
      webhookName: de(i.slice(1).join("/"))
    };
  if (r === "guides" && i.length >= 2)
    return {
      type: "guide",
      guidePath: de(i.slice(1).join("/"))
    };
  if (i.length === 1)
    return { type: "tag", tag: de(i[0]) };
  const a = i[1].toLowerCase();
  if (Yr.has(a)) {
    const o = de(i[0]), s = a, l = i.length > 2 ? "/" + i.slice(2).map(de).join("/") : "/";
    return { type: "endpoint", tag: o, method: s, path: l };
  }
  return { type: "tag", tag: de(i[0]) };
}
function Z(e) {
  return e.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function de(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function Jr() {
  const e = window.location.pathname;
  return Ce ? e === Ce || e === `${Ce}/` ? "/" : e.startsWith(`${Ce}/`) ? e.slice(Ce.length) || "/" : e || "/" : e || "/";
}
function st() {
  const e = Jr(), t = Gn(e);
  b.setRoute(t);
}
function Ue(e) {
  if (e === void 0) return;
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!n || typeof n != "object" || Array.isArray(n)) continue;
    const i = {};
    for (const [r, a] of Object.entries(n)) {
      const o = Array.isArray(a) ? a.map((s) => String(s)) : [];
      i[r] = o;
    }
    t.push(i);
  }
  return t;
}
function Ut(e, t, n) {
  if (!e || e.length === 0)
    return { explicitlyNoAuth: n, requirements: [] };
  const i = e.map((r) => Object.entries(r).map(([a, o]) => ({
    schemeName: a,
    scopes: Array.isArray(o) ? o : [],
    scheme: t[a]
  })));
  return { explicitlyNoAuth: n, requirements: i };
}
function H(e) {
  return !!(e && !e.explicitlyNoAuth && e.requirements.length > 0);
}
function zt(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function Zr(e) {
  if (!H(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const i of e.requirements)
    for (const r of i) {
      const a = zt(r.scheme);
      t.has(a) || (t.add(a), n.push(a));
    }
  return n;
}
function Kn(e) {
  const t = Zr(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function ze(e) {
  return H(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((i) => {
    const r = zt(i.scheme);
    return i.scopes.length > 0 ? `${r} [${i.scopes.join(", ")}]` : r;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function gt(e, t, n, i) {
  const r = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!H(e)) return r;
  for (const s of e.requirements) {
    if (!s.every((d) => !!t[d.schemeName]) && s.length > 0) continue;
    const u = gn(s, t);
    if (Object.keys(u.headers).length > 0 || Object.keys(u.query).length > 0 || Object.keys(u.cookies).length > 0)
      return u;
  }
  return !i || !n ? r : gn([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: i });
}
function Xr(e) {
  const t = {};
  if (!H(e)) return t;
  const n = e.requirements[0] || [];
  for (const i of n) {
    const r = i.scheme;
    if (r) {
      if (r.type === "http") {
        const a = (r.scheme || "").toLowerCase();
        a === "bearer" ? t.Authorization = "Bearer <token>" : a === "basic" ? t.Authorization = "Basic <credentials>" : t.Authorization = "<token>";
        continue;
      }
      r.type === "apiKey" && r.in === "header" && r.name && (t[r.name] = `<${r.name}>`);
    }
  }
  return t;
}
function gn(e, t) {
  const n = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  for (const i of e) {
    const r = i.scheme, a = t[i.schemeName];
    if (!(!r || !a)) {
      if (n.matchedSchemeNames.push(i.schemeName), r.type === "http") {
        const o = (r.scheme || "").toLowerCase();
        o === "bearer" ? n.headers.Authorization = `Bearer ${a}` : o === "basic" ? n.headers.Authorization = `Basic ${a}` : n.headers.Authorization = a;
        continue;
      }
      if (r.type === "oauth2" || r.type === "openIdConnect") {
        n.headers.Authorization = `Bearer ${a}`;
        continue;
      }
      r.type === "apiKey" && r.name && (r.in === "query" ? n.query[r.name] = a : r.in === "cookie" ? n.cookies[r.name] = a : n.headers[r.name] = a);
    }
  }
  return n;
}
/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function Jn(e) {
  return typeof e > "u" || e === null;
}
function Qr(e) {
  return typeof e == "object" && e !== null;
}
function ei(e) {
  return Array.isArray(e) ? e : Jn(e) ? [] : [e];
}
function ti(e, t) {
  var n, i, r, a;
  if (t)
    for (a = Object.keys(t), n = 0, i = a.length; n < i; n += 1)
      r = a[n], e[r] = t[r];
  return e;
}
function ni(e, t) {
  var n = "", i;
  for (i = 0; i < t; i += 1)
    n += e;
  return n;
}
function ri(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
var ii = Jn, ai = Qr, oi = ei, si = ni, ci = ri, li = ti, V = {
  isNothing: ii,
  isObject: ai,
  toArray: oi,
  repeat: si,
  isNegativeZero: ci,
  extend: li
};
function Zn(e, t) {
  var n = "", i = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), i + " " + n) : i;
}
function We(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Zn(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
We.prototype = Object.create(Error.prototype);
We.prototype.constructor = We;
We.prototype.toString = function(t) {
  return this.name + ": " + Zn(this, t);
};
var se = We;
function Nt(e, t, n, i, r) {
  var a = "", o = "", s = Math.floor(r / 2) - 1;
  return i - t > s && (a = " ... ", t = i - s + a.length), n - i > s && (o = " ...", n = i + s - o.length), {
    str: a + e.slice(t, n).replace(/\t/g, "→") + o,
    pos: i - t + a.length
    // relative position
  };
}
function At(e, t) {
  return V.repeat(" ", t - e.length) + e;
}
function ui(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var n = /\r?\n|\r|\0/g, i = [0], r = [], a, o = -1; a = n.exec(e.buffer); )
    r.push(a.index), i.push(a.index + a[0].length), e.position <= a.index && o < 0 && (o = i.length - 2);
  o < 0 && (o = i.length - 1);
  var s = "", l, u, d = Math.min(e.line + t.linesAfter, r.length).toString().length, p = t.maxLength - (t.indent + d + 3);
  for (l = 1; l <= t.linesBefore && !(o - l < 0); l++)
    u = Nt(
      e.buffer,
      i[o - l],
      r[o - l],
      e.position - (i[o] - i[o - l]),
      p
    ), s = V.repeat(" ", t.indent) + At((e.line - l + 1).toString(), d) + " | " + u.str + `
` + s;
  for (u = Nt(e.buffer, i[o], r[o], e.position, p), s += V.repeat(" ", t.indent) + At((e.line + 1).toString(), d) + " | " + u.str + `
`, s += V.repeat("-", t.indent + d + 3 + u.pos) + `^
`, l = 1; l <= t.linesAfter && !(o + l >= r.length); l++)
    u = Nt(
      e.buffer,
      i[o + l],
      r[o + l],
      e.position - (i[o] - i[o + l]),
      p
    ), s += V.repeat(" ", t.indent) + At((e.line + l + 1).toString(), d) + " | " + u.str + `
`;
  return s.replace(/\n$/, "");
}
var di = ui, pi = [
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
], fi = [
  "scalar",
  "sequence",
  "mapping"
];
function mi(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(i) {
      t[String(i)] = n;
    });
  }), t;
}
function hi(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (pi.indexOf(n) === -1)
      throw new se('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = mi(t.styleAliases || null), fi.indexOf(this.kind) === -1)
    throw new se('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var z = hi;
function vn(e, t) {
  var n = [];
  return e[t].forEach(function(i) {
    var r = n.length;
    n.forEach(function(a, o) {
      a.tag === i.tag && a.kind === i.kind && a.multi === i.multi && (r = o);
    }), n[r] = i;
  }), n;
}
function gi() {
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
  function i(r) {
    r.multi ? (e.multi[r.kind].push(r), e.multi.fallback.push(r)) : e[r.kind][r.tag] = e.fallback[r.tag] = r;
  }
  for (t = 0, n = arguments.length; t < n; t += 1)
    arguments[t].forEach(i);
  return e;
}
function Bt(e) {
  return this.extend(e);
}
Bt.prototype.extend = function(t) {
  var n = [], i = [];
  if (t instanceof z)
    i.push(t);
  else if (Array.isArray(t))
    i = i.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (i = i.concat(t.explicit));
  else
    throw new se("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(a) {
    if (!(a instanceof z))
      throw new se("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (a.loadKind && a.loadKind !== "scalar")
      throw new se("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (a.multi)
      throw new se("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), i.forEach(function(a) {
    if (!(a instanceof z))
      throw new se("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var r = Object.create(Bt.prototype);
  return r.implicit = (this.implicit || []).concat(n), r.explicit = (this.explicit || []).concat(i), r.compiledImplicit = vn(r, "implicit"), r.compiledExplicit = vn(r, "explicit"), r.compiledTypeMap = gi(r.compiledImplicit, r.compiledExplicit), r;
};
var vi = Bt, yi = new z("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), bi = new z("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), xi = new z("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), ki = new vi({
  explicit: [
    yi,
    bi,
    xi
  ]
});
function Ci(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function wi() {
  return null;
}
function Si(e) {
  return e === null;
}
var Ni = new z("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Ci,
  construct: wi,
  predicate: Si,
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
function Ai(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function Ei(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Li(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Oi = new z("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: Ai,
  construct: Ei,
  predicate: Li,
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
function Ti(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Ii(e) {
  return 48 <= e && e <= 55;
}
function qi(e) {
  return 48 <= e && e <= 57;
}
function ji(e) {
  if (e === null) return !1;
  var t = e.length, n = 0, i = !1, r;
  if (!t) return !1;
  if (r = e[n], (r === "-" || r === "+") && (r = e[++n]), r === "0") {
    if (n + 1 === t) return !0;
    if (r = e[++n], r === "b") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (r !== "0" && r !== "1") return !1;
          i = !0;
        }
      return i && r !== "_";
    }
    if (r === "x") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Ti(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
    if (r === "o") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Ii(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
  }
  if (r === "_") return !1;
  for (; n < t; n++)
    if (r = e[n], r !== "_") {
      if (!qi(e.charCodeAt(n)))
        return !1;
      i = !0;
    }
  return !(!i || r === "_");
}
function $i(e) {
  var t = e, n = 1, i;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), i = t[0], (i === "-" || i === "+") && (i === "-" && (n = -1), t = t.slice(1), i = t[0]), t === "0") return 0;
  if (i === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function Bi(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !V.isNegativeZero(e);
}
var Mi = new z("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: ji,
  construct: $i,
  predicate: Bi,
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
}), Pi = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Ri(e) {
  return !(e === null || !Pi.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function Fi(e) {
  var t, n;
  return t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
var _i = /^[-+]?[0-9]+e/;
function Di(e, t) {
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
  else if (V.isNegativeZero(e))
    return "-0.0";
  return n = e.toString(10), _i.test(n) ? n.replace("e", ".e") : n;
}
function Hi(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || V.isNegativeZero(e));
}
var Ui = new z("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Ri,
  construct: Fi,
  predicate: Hi,
  represent: Di,
  defaultStyle: "lowercase"
}), zi = ki.extend({
  implicit: [
    Ni,
    Oi,
    Mi,
    Ui
  ]
}), Wi = zi, Xn = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Qn = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Vi(e) {
  return e === null ? !1 : Xn.exec(e) !== null || Qn.exec(e) !== null;
}
function Yi(e) {
  var t, n, i, r, a, o, s, l = 0, u = null, d, p, m;
  if (t = Xn.exec(e), t === null && (t = Qn.exec(e)), t === null) throw new Error("Date resolve error");
  if (n = +t[1], i = +t[2] - 1, r = +t[3], !t[4])
    return new Date(Date.UTC(n, i, r));
  if (a = +t[4], o = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (d = +t[10], p = +(t[11] || 0), u = (d * 60 + p) * 6e4, t[9] === "-" && (u = -u)), m = new Date(Date.UTC(n, i, r, a, o, s, l)), u && m.setTime(m.getTime() - u), m;
}
function Gi(e) {
  return e.toISOString();
}
var Ki = new z("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Vi,
  construct: Yi,
  instanceOf: Date,
  represent: Gi
});
function Ji(e) {
  return e === "<<" || e === null;
}
var Zi = new z("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Ji
}), Wt = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Xi(e) {
  if (e === null) return !1;
  var t, n, i = 0, r = e.length, a = Wt;
  for (n = 0; n < r; n++)
    if (t = a.indexOf(e.charAt(n)), !(t > 64)) {
      if (t < 0) return !1;
      i += 6;
    }
  return i % 8 === 0;
}
function Qi(e) {
  var t, n, i = e.replace(/[\r\n=]/g, ""), r = i.length, a = Wt, o = 0, s = [];
  for (t = 0; t < r; t++)
    t % 4 === 0 && t && (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)), o = o << 6 | a.indexOf(i.charAt(t));
  return n = r % 4 * 6, n === 0 ? (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)) : n === 18 ? (s.push(o >> 10 & 255), s.push(o >> 2 & 255)) : n === 12 && s.push(o >> 4 & 255), new Uint8Array(s);
}
function ea(e) {
  var t = "", n = 0, i, r, a = e.length, o = Wt;
  for (i = 0; i < a; i++)
    i % 3 === 0 && i && (t += o[n >> 18 & 63], t += o[n >> 12 & 63], t += o[n >> 6 & 63], t += o[n & 63]), n = (n << 8) + e[i];
  return r = a % 3, r === 0 ? (t += o[n >> 18 & 63], t += o[n >> 12 & 63], t += o[n >> 6 & 63], t += o[n & 63]) : r === 2 ? (t += o[n >> 10 & 63], t += o[n >> 4 & 63], t += o[n << 2 & 63], t += o[64]) : r === 1 && (t += o[n >> 2 & 63], t += o[n << 4 & 63], t += o[64], t += o[64]), t;
}
function ta(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var na = new z("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: Xi,
  construct: Qi,
  predicate: ta,
  represent: ea
}), ra = Object.prototype.hasOwnProperty, ia = Object.prototype.toString;
function aa(e) {
  if (e === null) return !0;
  var t = [], n, i, r, a, o, s = e;
  for (n = 0, i = s.length; n < i; n += 1) {
    if (r = s[n], o = !1, ia.call(r) !== "[object Object]") return !1;
    for (a in r)
      if (ra.call(r, a))
        if (!o) o = !0;
        else return !1;
    if (!o) return !1;
    if (t.indexOf(a) === -1) t.push(a);
    else return !1;
  }
  return !0;
}
function oa(e) {
  return e !== null ? e : [];
}
var sa = new z("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: aa,
  construct: oa
}), ca = Object.prototype.toString;
function la(e) {
  if (e === null) return !0;
  var t, n, i, r, a, o = e;
  for (a = new Array(o.length), t = 0, n = o.length; t < n; t += 1) {
    if (i = o[t], ca.call(i) !== "[object Object]" || (r = Object.keys(i), r.length !== 1)) return !1;
    a[t] = [r[0], i[r[0]]];
  }
  return !0;
}
function ua(e) {
  if (e === null) return [];
  var t, n, i, r, a, o = e;
  for (a = new Array(o.length), t = 0, n = o.length; t < n; t += 1)
    i = o[t], r = Object.keys(i), a[t] = [r[0], i[r[0]]];
  return a;
}
var da = new z("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: la,
  construct: ua
}), pa = Object.prototype.hasOwnProperty;
function fa(e) {
  if (e === null) return !0;
  var t, n = e;
  for (t in n)
    if (pa.call(n, t) && n[t] !== null)
      return !1;
  return !0;
}
function ma(e) {
  return e !== null ? e : {};
}
var ha = new z("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: fa,
  construct: ma
}), ga = Wi.extend({
  implicit: [
    Ki,
    Zi
  ],
  explicit: [
    na,
    sa,
    da,
    ha
  ]
}), he = Object.prototype.hasOwnProperty, ct = 1, er = 2, tr = 3, lt = 4, Et = 1, va = 2, yn = 3, ya = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, ba = /[\x85\u2028\u2029]/, xa = /[,\[\]\{\}]/, nr = /^(?:!|!!|![a-z\-]+!)$/i, rr = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function bn(e) {
  return Object.prototype.toString.call(e);
}
function ne(e) {
  return e === 10 || e === 13;
}
function we(e) {
  return e === 9 || e === 32;
}
function K(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Ae(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function ka(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Ca(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function wa(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function xn(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function Sa(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function ir(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
var ar = new Array(256), or = new Array(256);
for (var Se = 0; Se < 256; Se++)
  ar[Se] = xn(Se) ? 1 : 0, or[Se] = xn(Se);
function Na(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || ga, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function sr(e, t) {
  var n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = di(n), new se(t, n);
}
function C(e, t) {
  throw sr(e, t);
}
function ut(e, t) {
  e.onWarning && e.onWarning.call(null, sr(e, t));
}
var kn = {
  YAML: function(t, n, i) {
    var r, a, o;
    t.version !== null && C(t, "duplication of %YAML directive"), i.length !== 1 && C(t, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(i[0]), r === null && C(t, "ill-formed argument of the YAML directive"), a = parseInt(r[1], 10), o = parseInt(r[2], 10), a !== 1 && C(t, "unacceptable YAML version of the document"), t.version = i[0], t.checkLineBreaks = o < 2, o !== 1 && o !== 2 && ut(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, i) {
    var r, a;
    i.length !== 2 && C(t, "TAG directive accepts exactly two arguments"), r = i[0], a = i[1], nr.test(r) || C(t, "ill-formed tag handle (first argument) of the TAG directive"), he.call(t.tagMap, r) && C(t, 'there is a previously declared suffix for "' + r + '" tag handle'), rr.test(a) || C(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      a = decodeURIComponent(a);
    } catch {
      C(t, "tag prefix is malformed: " + a);
    }
    t.tagMap[r] = a;
  }
};
function me(e, t, n, i) {
  var r, a, o, s;
  if (t < n) {
    if (s = e.input.slice(t, n), i)
      for (r = 0, a = s.length; r < a; r += 1)
        o = s.charCodeAt(r), o === 9 || 32 <= o && o <= 1114111 || C(e, "expected valid JSON character");
    else ya.test(s) && C(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function Cn(e, t, n, i) {
  var r, a, o, s;
  for (V.isObject(n) || C(e, "cannot merge mappings; the provided source object is unacceptable"), r = Object.keys(n), o = 0, s = r.length; o < s; o += 1)
    a = r[o], he.call(t, a) || (ir(t, a, n[a]), i[a] = !0);
}
function Ee(e, t, n, i, r, a, o, s, l) {
  var u, d;
  if (Array.isArray(r))
    for (r = Array.prototype.slice.call(r), u = 0, d = r.length; u < d; u += 1)
      Array.isArray(r[u]) && C(e, "nested arrays are not supported inside keys"), typeof r == "object" && bn(r[u]) === "[object Object]" && (r[u] = "[object Object]");
  if (typeof r == "object" && bn(r) === "[object Object]" && (r = "[object Object]"), r = String(r), t === null && (t = {}), i === "tag:yaml.org,2002:merge")
    if (Array.isArray(a))
      for (u = 0, d = a.length; u < d; u += 1)
        Cn(e, t, a[u], n);
    else
      Cn(e, t, a, n);
  else
    !e.json && !he.call(n, r) && he.call(t, r) && (e.line = o || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, C(e, "duplicated mapping key")), ir(t, r, a), delete n[r];
  return t;
}
function Vt(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : C(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function M(e, t, n) {
  for (var i = 0, r = e.input.charCodeAt(e.position); r !== 0; ) {
    for (; we(r); )
      r === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
    if (t && r === 35)
      do
        r = e.input.charCodeAt(++e.position);
      while (r !== 10 && r !== 13 && r !== 0);
    if (ne(r))
      for (Vt(e), r = e.input.charCodeAt(e.position), i++, e.lineIndent = 0; r === 32; )
        e.lineIndent++, r = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && i !== 0 && e.lineIndent < n && ut(e, "deficient indentation"), i;
}
function vt(e) {
  var t = e.position, n;
  return n = e.input.charCodeAt(t), !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || K(n)));
}
function Yt(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += V.repeat(`
`, t - 1));
}
function Aa(e, t, n) {
  var i, r, a, o, s, l, u, d, p = e.kind, m = e.result, f;
  if (f = e.input.charCodeAt(e.position), K(f) || Ae(f) || f === 35 || f === 38 || f === 42 || f === 33 || f === 124 || f === 62 || f === 39 || f === 34 || f === 37 || f === 64 || f === 96 || (f === 63 || f === 45) && (r = e.input.charCodeAt(e.position + 1), K(r) || n && Ae(r)))
    return !1;
  for (e.kind = "scalar", e.result = "", a = o = e.position, s = !1; f !== 0; ) {
    if (f === 58) {
      if (r = e.input.charCodeAt(e.position + 1), K(r) || n && Ae(r))
        break;
    } else if (f === 35) {
      if (i = e.input.charCodeAt(e.position - 1), K(i))
        break;
    } else {
      if (e.position === e.lineStart && vt(e) || n && Ae(f))
        break;
      if (ne(f))
        if (l = e.line, u = e.lineStart, d = e.lineIndent, M(e, !1, -1), e.lineIndent >= t) {
          s = !0, f = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = o, e.line = l, e.lineStart = u, e.lineIndent = d;
          break;
        }
    }
    s && (me(e, a, o, !1), Yt(e, e.line - l), a = o = e.position, s = !1), we(f) || (o = e.position + 1), f = e.input.charCodeAt(++e.position);
  }
  return me(e, a, o, !1), e.result ? !0 : (e.kind = p, e.result = m, !1);
}
function Ea(e, t) {
  var n, i, r;
  if (n = e.input.charCodeAt(e.position), n !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, i = r = e.position; (n = e.input.charCodeAt(e.position)) !== 0; )
    if (n === 39)
      if (me(e, i, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39)
        i = e.position, e.position++, r = e.position;
      else
        return !0;
    else ne(n) ? (me(e, i, r, !0), Yt(e, M(e, !1, t)), i = r = e.position) : e.position === e.lineStart && vt(e) ? C(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position);
  C(e, "unexpected end of the stream within a single quoted scalar");
}
function La(e, t) {
  var n, i, r, a, o, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return me(e, n, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (me(e, n, e.position, !0), s = e.input.charCodeAt(++e.position), ne(s))
        M(e, !1, t);
      else if (s < 256 && ar[s])
        e.result += or[s], e.position++;
      else if ((o = Ca(s)) > 0) {
        for (r = o, a = 0; r > 0; r--)
          s = e.input.charCodeAt(++e.position), (o = ka(s)) >= 0 ? a = (a << 4) + o : C(e, "expected hexadecimal character");
        e.result += Sa(a), e.position++;
      } else
        C(e, "unknown escape sequence");
      n = i = e.position;
    } else ne(s) ? (me(e, n, i, !0), Yt(e, M(e, !1, t)), n = i = e.position) : e.position === e.lineStart && vt(e) ? C(e, "unexpected end of the document within a double quoted scalar") : (e.position++, i = e.position);
  }
  C(e, "unexpected end of the stream within a double quoted scalar");
}
function Oa(e, t) {
  var n = !0, i, r, a, o = e.tag, s, l = e.anchor, u, d, p, m, f, h = /* @__PURE__ */ Object.create(null), v, g, x, y;
  if (y = e.input.charCodeAt(e.position), y === 91)
    d = 93, f = !1, s = [];
  else if (y === 123)
    d = 125, f = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), y = e.input.charCodeAt(++e.position); y !== 0; ) {
    if (M(e, !0, t), y = e.input.charCodeAt(e.position), y === d)
      return e.position++, e.tag = o, e.anchor = l, e.kind = f ? "mapping" : "sequence", e.result = s, !0;
    n ? y === 44 && C(e, "expected the node content, but found ','") : C(e, "missed comma between flow collection entries"), g = v = x = null, p = m = !1, y === 63 && (u = e.input.charCodeAt(e.position + 1), K(u) && (p = m = !0, e.position++, M(e, !0, t))), i = e.line, r = e.lineStart, a = e.position, Ie(e, t, ct, !1, !0), g = e.tag, v = e.result, M(e, !0, t), y = e.input.charCodeAt(e.position), (m || e.line === i) && y === 58 && (p = !0, y = e.input.charCodeAt(++e.position), M(e, !0, t), Ie(e, t, ct, !1, !0), x = e.result), f ? Ee(e, s, h, g, v, x, i, r, a) : p ? s.push(Ee(e, null, h, g, v, x, i, r, a)) : s.push(v), M(e, !0, t), y = e.input.charCodeAt(e.position), y === 44 ? (n = !0, y = e.input.charCodeAt(++e.position)) : n = !1;
  }
  C(e, "unexpected end of the stream within a flow collection");
}
function Ta(e, t) {
  var n, i, r = Et, a = !1, o = !1, s = t, l = 0, u = !1, d, p;
  if (p = e.input.charCodeAt(e.position), p === 124)
    i = !1;
  else if (p === 62)
    i = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; p !== 0; )
    if (p = e.input.charCodeAt(++e.position), p === 43 || p === 45)
      Et === r ? r = p === 43 ? yn : va : C(e, "repeat of a chomping mode identifier");
    else if ((d = wa(p)) >= 0)
      d === 0 ? C(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : o ? C(e, "repeat of an indentation width identifier") : (s = t + d - 1, o = !0);
    else
      break;
  if (we(p)) {
    do
      p = e.input.charCodeAt(++e.position);
    while (we(p));
    if (p === 35)
      do
        p = e.input.charCodeAt(++e.position);
      while (!ne(p) && p !== 0);
  }
  for (; p !== 0; ) {
    for (Vt(e), e.lineIndent = 0, p = e.input.charCodeAt(e.position); (!o || e.lineIndent < s) && p === 32; )
      e.lineIndent++, p = e.input.charCodeAt(++e.position);
    if (!o && e.lineIndent > s && (s = e.lineIndent), ne(p)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      r === yn ? e.result += V.repeat(`
`, a ? 1 + l : l) : r === Et && a && (e.result += `
`);
      break;
    }
    for (i ? we(p) ? (u = !0, e.result += V.repeat(`
`, a ? 1 + l : l)) : u ? (u = !1, e.result += V.repeat(`
`, l + 1)) : l === 0 ? a && (e.result += " ") : e.result += V.repeat(`
`, l) : e.result += V.repeat(`
`, a ? 1 + l : l), a = !0, o = !0, l = 0, n = e.position; !ne(p) && p !== 0; )
      p = e.input.charCodeAt(++e.position);
    me(e, n, e.position, !1);
  }
  return !0;
}
function wn(e, t) {
  var n, i = e.tag, r = e.anchor, a = [], o, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = a), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, C(e, "tab characters must not be used in indentation")), !(l !== 45 || (o = e.input.charCodeAt(e.position + 1), !K(o)))); ) {
    if (s = !0, e.position++, M(e, !0, -1) && e.lineIndent <= t) {
      a.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (n = e.line, Ie(e, t, tr, !1, !0), a.push(e.result), M(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && l !== 0)
      C(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = i, e.anchor = r, e.kind = "sequence", e.result = a, !0) : !1;
}
function Ia(e, t, n) {
  var i, r, a, o, s, l, u = e.tag, d = e.anchor, p = {}, m = /* @__PURE__ */ Object.create(null), f = null, h = null, v = null, g = !1, x = !1, y;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = p), y = e.input.charCodeAt(e.position); y !== 0; ) {
    if (!g && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, C(e, "tab characters must not be used in indentation")), i = e.input.charCodeAt(e.position + 1), a = e.line, (y === 63 || y === 58) && K(i))
      y === 63 ? (g && (Ee(e, p, m, f, h, null, o, s, l), f = h = v = null), x = !0, g = !0, r = !0) : g ? (g = !1, r = !0) : C(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, y = i;
    else {
      if (o = e.line, s = e.lineStart, l = e.position, !Ie(e, n, er, !1, !0))
        break;
      if (e.line === a) {
        for (y = e.input.charCodeAt(e.position); we(y); )
          y = e.input.charCodeAt(++e.position);
        if (y === 58)
          y = e.input.charCodeAt(++e.position), K(y) || C(e, "a whitespace character is expected after the key-value separator within a block mapping"), g && (Ee(e, p, m, f, h, null, o, s, l), f = h = v = null), x = !0, g = !1, r = !1, f = e.tag, h = e.result;
        else if (x)
          C(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = u, e.anchor = d, !0;
      } else if (x)
        C(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = u, e.anchor = d, !0;
    }
    if ((e.line === a || e.lineIndent > t) && (g && (o = e.line, s = e.lineStart, l = e.position), Ie(e, t, lt, !0, r) && (g ? h = e.result : v = e.result), g || (Ee(e, p, m, f, h, v, o, s, l), f = h = v = null), M(e, !0, -1), y = e.input.charCodeAt(e.position)), (e.line === a || e.lineIndent > t) && y !== 0)
      C(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return g && Ee(e, p, m, f, h, null, o, s, l), x && (e.tag = u, e.anchor = d, e.kind = "mapping", e.result = p), x;
}
function qa(e) {
  var t, n = !1, i = !1, r, a, o;
  if (o = e.input.charCodeAt(e.position), o !== 33) return !1;
  if (e.tag !== null && C(e, "duplication of a tag property"), o = e.input.charCodeAt(++e.position), o === 60 ? (n = !0, o = e.input.charCodeAt(++e.position)) : o === 33 ? (i = !0, r = "!!", o = e.input.charCodeAt(++e.position)) : r = "!", t = e.position, n) {
    do
      o = e.input.charCodeAt(++e.position);
    while (o !== 0 && o !== 62);
    e.position < e.length ? (a = e.input.slice(t, e.position), o = e.input.charCodeAt(++e.position)) : C(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; o !== 0 && !K(o); )
      o === 33 && (i ? C(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(t - 1, e.position + 1), nr.test(r) || C(e, "named tag handle cannot contain such characters"), i = !0, t = e.position + 1)), o = e.input.charCodeAt(++e.position);
    a = e.input.slice(t, e.position), xa.test(a) && C(e, "tag suffix cannot contain flow indicator characters");
  }
  a && !rr.test(a) && C(e, "tag name cannot contain such characters: " + a);
  try {
    a = decodeURIComponent(a);
  } catch {
    C(e, "tag name is malformed: " + a);
  }
  return n ? e.tag = a : he.call(e.tagMap, r) ? e.tag = e.tagMap[r] + a : r === "!" ? e.tag = "!" + a : r === "!!" ? e.tag = "tag:yaml.org,2002:" + a : C(e, 'undeclared tag handle "' + r + '"'), !0;
}
function ja(e) {
  var t, n;
  if (n = e.input.charCodeAt(e.position), n !== 38) return !1;
  for (e.anchor !== null && C(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !K(n) && !Ae(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && C(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function $a(e) {
  var t, n, i;
  if (i = e.input.charCodeAt(e.position), i !== 42) return !1;
  for (i = e.input.charCodeAt(++e.position), t = e.position; i !== 0 && !K(i) && !Ae(i); )
    i = e.input.charCodeAt(++e.position);
  return e.position === t && C(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), he.call(e.anchorMap, n) || C(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], M(e, !0, -1), !0;
}
function Ie(e, t, n, i, r) {
  var a, o, s, l = 1, u = !1, d = !1, p, m, f, h, v, g;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, a = o = s = lt === n || tr === n, i && M(e, !0, -1) && (u = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; qa(e) || ja(e); )
      M(e, !0, -1) ? (u = !0, s = a, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = u || r), (l === 1 || lt === n) && (ct === n || er === n ? v = t : v = t + 1, g = e.position - e.lineStart, l === 1 ? s && (wn(e, g) || Ia(e, g, v)) || Oa(e, v) ? d = !0 : (o && Ta(e, v) || Ea(e, v) || La(e, v) ? d = !0 : $a(e) ? (d = !0, (e.tag !== null || e.anchor !== null) && C(e, "alias node should not have any properties")) : Aa(e, v, ct === n) && (d = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (d = s && wn(e, g))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && C(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), p = 0, m = e.implicitTypes.length; p < m; p += 1)
      if (h = e.implicitTypes[p], h.resolve(e.result)) {
        e.result = h.construct(e.result), e.tag = h.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (he.call(e.typeMap[e.kind || "fallback"], e.tag))
      h = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (h = null, f = e.typeMap.multi[e.kind || "fallback"], p = 0, m = f.length; p < m; p += 1)
        if (e.tag.slice(0, f[p].tag.length) === f[p].tag) {
          h = f[p];
          break;
        }
    h || C(e, "unknown tag !<" + e.tag + ">"), e.result !== null && h.kind !== e.kind && C(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + h.kind + '", not "' + e.kind + '"'), h.resolve(e.result, e.tag) ? (e.result = h.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : C(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || d;
}
function Ba(e) {
  var t = e.position, n, i, r, a = !1, o;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (o = e.input.charCodeAt(e.position)) !== 0 && (M(e, !0, -1), o = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || o !== 37)); ) {
    for (a = !0, o = e.input.charCodeAt(++e.position), n = e.position; o !== 0 && !K(o); )
      o = e.input.charCodeAt(++e.position);
    for (i = e.input.slice(n, e.position), r = [], i.length < 1 && C(e, "directive name must not be less than one character in length"); o !== 0; ) {
      for (; we(o); )
        o = e.input.charCodeAt(++e.position);
      if (o === 35) {
        do
          o = e.input.charCodeAt(++e.position);
        while (o !== 0 && !ne(o));
        break;
      }
      if (ne(o)) break;
      for (n = e.position; o !== 0 && !K(o); )
        o = e.input.charCodeAt(++e.position);
      r.push(e.input.slice(n, e.position));
    }
    o !== 0 && Vt(e), he.call(kn, i) ? kn[i](e, i, r) : ut(e, 'unknown document directive "' + i + '"');
  }
  if (M(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, M(e, !0, -1)) : a && C(e, "directives end mark is expected"), Ie(e, e.lineIndent - 1, lt, !1, !0), M(e, !0, -1), e.checkLineBreaks && ba.test(e.input.slice(t, e.position)) && ut(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && vt(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, M(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    C(e, "end of the stream or a document separator is expected");
  else
    return;
}
function Ma(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var n = new Na(e, t), i = e.indexOf("\0");
  for (i !== -1 && (n.position = i, C(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    Ba(n);
  return n.documents;
}
function Pa(e, t) {
  var n = Ma(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new se("expected a single document in the stream, but found more");
  }
}
var Ra = Pa, Fa = {
  load: Ra
}, _a = Fa.load;
const Da = 50, Ha = 200;
function Ua(e) {
  const t = za(e.info || {}), n = Wa(e.servers || []), i = e.components || {}, r = Ga(i.schemas || {}, e), a = Va(i.securitySchemes || {}), o = Ue(e.security), s = e.paths || {}, l = {};
  for (const [m, f] of Object.entries(s))
    m.startsWith("/docs") || (l[m] = f);
  const u = Ka(l, e, o, a), d = Qa(u, e.tags || []), p = Ja(e.webhooks || {}, e, o, a);
  return { raw: e, info: t, servers: n, tags: d, operations: u, schemas: r, securitySchemes: a, webhooks: p };
}
function za(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function Wa(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function Va(e) {
  const t = {};
  for (const [n, i] of Object.entries(e)) {
    const r = i;
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
const De = /* @__PURE__ */ new Map();
let Gt = 0;
function Ya(e, t) {
  if (De.has(e)) return De.get(e);
  if (++Gt > Ha) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((r) => decodeURIComponent(r.replace(/~1/g, "/").replace(/~0/g, "~")));
  let i = t;
  for (const r of n)
    if (i && typeof i == "object" && !Array.isArray(i))
      i = i[r];
    else
      return;
  return De.set(e, i), i;
}
function Y(e, t, n = 0, i = /* @__PURE__ */ new Set()) {
  if (n > Da || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((o) => Y(o, t, n + 1, i));
  const r = e;
  if (typeof r.$ref == "string") {
    const o = r.$ref;
    if (i.has(o)) return { type: "object", description: "[Circular reference]" };
    const s = new Set(i);
    s.add(o);
    const l = Ya(o, t);
    return l && typeof l == "object" ? Y(l, t, n + 1, s) : l;
  }
  const a = {};
  for (const [o, s] of Object.entries(r))
    a[o] = Y(s, t, n + 1, i);
  return a;
}
function Ga(e, t) {
  De.clear(), Gt = 0;
  const n = {};
  for (const [i, r] of Object.entries(e))
    n[i] = Y(r, t);
  return n;
}
function Ka(e, t, n, i) {
  De.clear(), Gt = 0;
  const r = [], a = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = Ue(s.security), u = Array.isArray(s.parameters) ? s.parameters.map((d) => Y(d, t)) : [];
    for (const d of a) {
      const p = s[d];
      if (!p) continue;
      const m = cr(
        d,
        o,
        p,
        u,
        t,
        l,
        n,
        i
      );
      r.push(m);
    }
  }
  return r;
}
function cr(e, t, n, i, r, a = void 0, o = void 0, s = {}) {
  const l = Array.isArray(n.parameters) ? n.parameters.map((k) => Y(k, r)) : [], u = [...i];
  for (const k of l) {
    const E = u.findIndex((N) => N.name === k.name && N.in === k.in);
    E >= 0 ? u[E] = k : u.push(k);
  }
  const d = lr(u, r);
  let p = ur(n.requestBody, r);
  if (Array.isArray(n["x-doc-examples"])) {
    const k = n["x-doc-examples"], E = [];
    for (let N = 0; N < k.length; N++) {
      const q = k[N], $ = q.scenario ? String(q.scenario) : `Example ${N + 1}`, W = q.request?.body;
      W !== void 0 && E.push({ summary: $, value: W });
    }
    if (E.length > 0) {
      p || (p = { required: !1, content: {} });
      const N = p.content["application/json"] || p.content["application/vnd.api+json"] || {};
      p.content["application/json"] || (p.content["application/json"] = N);
      const q = p.content["application/json"];
      q.examples || (q.examples = {});
      for (let $ = 0; $ < E.length; $++) {
        const S = E[$], le = `${S.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${$}`.replace(/^-/, "");
        q.examples[le] = { summary: S.summary, description: S.summary, value: S.value };
      }
    }
  }
  const m = dr(n.responses, r), f = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], h = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), v = Object.prototype.hasOwnProperty.call(n, "security"), g = Ue(n.security), x = v ? g : a ?? o, y = v && Array.isArray(g) && g.length === 0, L = Xa(n.callbacks, r, s), T = {
    operationId: h,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: f,
    deprecated: !!n.deprecated,
    security: x,
    resolvedSecurity: Ut(x, s, y),
    parameters: d,
    requestBody: p,
    responses: m
  };
  return L.length > 0 && (T.callbacks = L), T;
}
function Ja(e, t, n, i) {
  if (!e || typeof e != "object") return [];
  const r = [], a = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = Y(s, t), u = Ue(l.security);
    for (const d of a) {
      const p = l[d];
      if (!p) continue;
      const m = Object.prototype.hasOwnProperty.call(p, "security"), f = Ue(p.security), h = m ? f : u ?? n, v = m && Array.isArray(f) && f.length === 0, g = Array.isArray(p.parameters) ? p.parameters.map((T) => Y(T, t)) : [], x = lr(g, t), y = ur(p.requestBody, t), L = dr(p.responses, t);
      r.push({
        name: o,
        method: d,
        path: o,
        summary: p.summary ? String(p.summary) : void 0,
        description: p.description ? String(p.description) : void 0,
        security: h,
        resolvedSecurity: Ut(h, i, v),
        parameters: x,
        requestBody: y,
        responses: L
      });
    }
  }
  return r;
}
function lr(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? Y(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? fr(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function ur(e, t) {
  if (!e) return;
  const n = Y(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: pr(n.content || {}, t)
  };
}
function Za(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [i, r] of Object.entries(e)) {
    if (!r || typeof r != "object") continue;
    const a = Y(r, t), o = a.schema, s = a.example ?? (o && typeof o == "object" ? o.example : void 0);
    n[i] = {
      description: a.description ? String(a.description) : void 0,
      required: !!a.required,
      schema: o && typeof o == "object" ? Y(o, t) : void 0,
      example: s !== void 0 ? s : void 0,
      deprecated: !!a.deprecated
    };
  }
  return n;
}
function dr(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [i, r] of Object.entries(e)) {
    const a = Y(r, t), o = a.headers;
    n[i] = {
      statusCode: i,
      description: a.description ? String(a.description) : void 0,
      headers: o ? Za(o, t) : void 0,
      content: a.content ? pr(a.content, t) : void 0
    };
  }
  return n;
}
function Xa(e, t, n) {
  if (!e || typeof e != "object") return [];
  const i = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [a, o] of Object.entries(e)) {
    const s = Y(o, t);
    if (!s || typeof s != "object") continue;
    const l = [];
    for (const [u, d] of Object.entries(s))
      if (!(!d || typeof d != "object"))
        for (const p of r) {
          const m = d[p];
          m && l.push(cr(p, u, m, [], t, void 0, void 0, n));
        }
    l.length > 0 && i.push({ name: a, operations: l });
  }
  return i;
}
function pr(e, t) {
  const n = {};
  for (const [i, r] of Object.entries(e)) {
    const a = r;
    n[i] = {
      schema: a.schema ? Y(a.schema, t) : void 0,
      example: a.example,
      examples: a.examples ? fr(a.examples) : void 0
    };
  }
  return n;
}
function fr(e) {
  const t = {};
  for (const [n, i] of Object.entries(e)) {
    const r = i;
    t[n] = {
      summary: r.summary ? String(r.summary) : void 0,
      description: r.description ? String(r.description) : void 0,
      value: r.value
    };
  }
  return t;
}
function Qa(e, t) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const o of t)
    i.set(String(o.name), String(o.description || ""));
  for (const o of e)
    for (const s of o.tags)
      n.has(s) || n.set(s, []), n.get(s).push(o);
  const r = [], a = /* @__PURE__ */ new Set();
  for (const o of t) {
    const s = String(o.name);
    a.has(s) || (a.add(s), r.push({
      name: s,
      description: i.get(s),
      operations: n.get(s) || []
    }));
  }
  for (const [o, s] of n)
    a.has(o) || (a.add(o), r.push({ name: o, description: i.get(o), operations: s }));
  return r;
}
function ke(e) {
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
          const t = ke(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, i] of Object.entries(e.properties))
            t[n] = ke(i);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const i = ke(n);
            i && typeof i == "object" && !Array.isArray(i) && Object.assign(t, i);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return ke(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return ke(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, i] of Object.entries(e.properties))
            t[n] = ke(i);
          return t;
        }
        return;
    }
  }
}
async function eo(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return _a(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let Ne = [];
const Sn = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function to(e) {
  Ne = [];
  for (const t of e.tags)
    Ne.push({
      type: "tag",
      title: t.name,
      subtitle: t.description,
      tag: t.name,
      keywords: `${t.name} ${t.description || ""}`.toLowerCase()
    });
  for (const t of e.operations)
    Ne.push({
      type: "operation",
      title: t.summary || t.operationId,
      subtitle: t.path,
      method: t.method,
      requiresAuth: H(t.resolvedSecurity),
      authBadge: Kn(t.resolvedSecurity) || void 0,
      authTitle: H(t.resolvedSecurity) ? ze(t.resolvedSecurity) : void 0,
      resolvedSecurity: t.resolvedSecurity,
      path: t.path,
      tag: t.tags[0],
      operationId: t.operationId,
      keywords: `${t.method} ${t.path} ${t.summary || ""} ${t.description || ""} ${t.operationId} ${t.tags.join(" ")}`.toLowerCase()
    });
  for (const [t, n] of Object.entries(e.schemas))
    Ne.push({
      type: "schema",
      title: t,
      subtitle: n.description || "Schema",
      schemaName: t,
      keywords: `${t} ${n.description || ""} schema model`.toLowerCase()
    });
  if (e.webhooks)
    for (const t of e.webhooks)
      Ne.push({
        type: "webhook",
        title: t.summary || t.name,
        subtitle: `${t.method.toUpperCase()} Webhook`,
        method: t.method,
        webhookName: t.name,
        keywords: `${t.name} ${t.method} ${t.summary || ""} ${t.description || ""} webhook`.toLowerCase()
      });
}
function no(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), i = [];
  for (const r of Ne) {
    let a = 0, o = !0;
    for (const s of n)
      r.keywords.includes(s) ? (a += 1, r.title.toLowerCase().includes(s) && (a += 3), r.path?.toLowerCase().includes(s) && (a += 2), r.method?.toLowerCase() === s && (a += 2)) : o = !1;
    o && a > 0 && i.push({ entry: r, score: a });
  }
  return i.sort((r, a) => {
    const o = Sn[r.entry.type] ?? 99, s = Sn[a.entry.type] ?? 99;
    return o !== s ? o - s : a.score !== r.score ? a.score - r.score : r.entry.title.localeCompare(a.entry.title);
  }).slice(0, t).map((r) => r.entry);
}
const mr = "puredocs-theme";
function Nn(e, t, n) {
  const i = e.classList.contains("light") || e.classList.contains("dark");
  i && e.classList.add("theme-transitioning"), e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color"), i && setTimeout(() => e.classList.remove("theme-transitioning"), 550);
}
function ro() {
  const t = b.get().theme === "light" ? "dark" : "light";
  b.set({ theme: t });
  try {
    localStorage.setItem(mr, t);
  } catch {
  }
}
function io(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(mr);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function hr(e) {
  const t = e.trim();
  return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function nt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function c(e, t, ...n) {
  const i = document.createElement(e);
  if (t)
    for (const [r, a] of Object.entries(t))
      a === void 0 || a === !1 || (r.startsWith("on") && typeof a == "function" ? i.addEventListener(r.slice(2).toLowerCase(), a) : r === "className" ? i.className = String(a) : r === "innerHTML" ? i.innerHTML = String(a) : r === "textContent" ? i.textContent = String(a) : a === !0 ? i.setAttribute(r, "") : i.setAttribute(r, String(a)));
  for (const r of n)
    r == null || r === !1 || (typeof r == "string" ? i.appendChild(document.createTextNode(r)) : i.appendChild(r));
  return i;
}
function D(e) {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
}
function Re(e, ...t) {
  D(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
async function ao(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function oo(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], i = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** i).toFixed(i > 0 ? 1 : 0)} ${n[i]}`;
}
function so(e) {
  return e < 1e3 ? `${Math.round(e)} ms` : `${(e / 1e3).toFixed(2)} s`;
}
const P = (e, t) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${1.75}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, O = {
  search: P('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  close: P('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: P('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  chevronDown: P('<path d="m6 9 6 6 6-6"/>'),
  chevronRight: P('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: P('<path d="m15 18-6-6 6-6"/>'),
  sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: P('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  copy: P('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  check: P('<path d="M20 6 9 17l-5-5"/>'),
  /** Closed padlock — requires auth (red) */
  lock: P('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>'),
  /** Open padlock — auth configured (green) */
  unlock: P('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M16 11V7a4 4 0 1 0-8 0v1"/>'),
  send: P('<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>'),
  key: P('<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>'),
  globe: P('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  server: P('<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>'),
  warning: P('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  settings: P('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>')
};
function co(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function yt(e) {
  return co(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function gr(e) {
  return String(e || "").replace(/\/$/, "");
}
function Kt(e) {
  return gr(e).replace(/^https?:\/\//i, "");
}
function lo(e) {
  return gr(yt(e));
}
function vr(e) {
  return Kt(yt(e));
}
function dt(e) {
  const { options: t, value: n, ariaLabel: i, onChange: r, className: a, variant: o = "default", invalid: s, dataAttrs: l } = e, u = document.createElement("select");
  o === "inline" && u.setAttribute("data-variant", "inline");
  const d = [];
  if (s && d.push("invalid"), a && d.push(a), u.className = d.join(" "), i && u.setAttribute("aria-label", i), l)
    for (const [p, m] of Object.entries(l))
      u.dataset[p] = m;
  for (const p of t) {
    const m = document.createElement("option");
    m.value = p.value, m.textContent = p.label, n !== void 0 && p.value === n && (m.selected = !0), u.appendChild(m);
  }
  return r && u.addEventListener("change", () => r(u.value)), u;
}
function ge(e) {
  const {
    type: t = "text",
    placeholder: n,
    value: i,
    ariaLabel: r,
    required: a,
    readOnly: o,
    invalid: s,
    modifiers: l,
    dataAttrs: u,
    className: d,
    onInput: p,
    onChange: m
  } = e, f = document.createElement("input");
  f.type = t;
  const h = [];
  if (l?.includes("filled") && h.push("filled"), s && h.push("invalid"), d && h.push(d), f.className = h.join(" "), n && (f.placeholder = n), i !== void 0 && (f.value = i), r && f.setAttribute("aria-label", r), a && (f.required = !0), o && (f.readOnly = !0), u)
    for (const [v, g] of Object.entries(u))
      f.dataset[v] = g;
  return p && f.addEventListener("input", () => p(f.value)), m && f.addEventListener("change", () => m(f.value)), f;
}
const uo = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function po(e = "secondary") {
  return ["btn", ...uo[e]];
}
function re(e) {
  const { variant: t = "secondary", label: n, icon: i, ariaLabel: r, disabled: a, className: o, onClick: s } = e, l = document.createElement("button");
  l.type = "button";
  const u = po(t);
  if (o && u.push(...o.split(/\s+/).filter(Boolean)), l.className = u.join(" "), i) {
    const d = document.createElement("span");
    d.className = "btn-icon-slot", d.innerHTML = i, l.appendChild(d);
  }
  if (n) {
    const d = document.createElement("span");
    d.textContent = n, l.appendChild(d);
  }
  return r && l.setAttribute("aria-label", r), a && (l.disabled = !0), s && l.addEventListener("click", s), l;
}
function yr(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : e === "primary" ? "u-text-accent" : `u-text-${e}`;
}
function Jt(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : e === "primary" ? "u-bg-accent-soft" : `u-bg-${e}-soft`;
}
function fo(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function br(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function mo(e, t) {
  return e.color ? e.color : t === "method" ? fo(e.method || e.text) : t === "status" ? br(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function w(e) {
  const t = document.createElement("span"), n = e.kind || "chip", i = mo(e, n), a = ["badge", e.size || "m"];
  return n === "status" && a.push("status"), n === "required" && a.push("required"), a.push(yr(i), Jt(i)), e.className && a.push(e.className), t.className = a.join(" "), t.textContent = e.text, t;
}
function pt(e, t) {
  const n = t?.active ?? !1, i = t?.context ?? !1, r = document.createElement("button");
  return r.type = "button", r.className = `badge m interactive${n ? " is-active" : ""}`, i && (r.dataset.badgeContext = "true"), r.textContent = e, r;
}
function ho(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const i = br(e), r = ["badge", "status", "m", "interactive", yr(i)];
  return t && r.push("is-active", Jt(i)), n.className = r.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = i, n.textContent = e, n;
}
function An(e, t) {
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
  e.classList.add(Jt(n));
}
function ce(e) {
  const { simple: t, interactive: n, active: i, className: r, onClick: a } = e || {}, o = document.createElement("div"), s = ["card"];
  return t && s.push("simple"), n && s.push("interactive"), i && s.push("active"), r && s.push(r), o.className = s.join(" "), a && (o.classList.contains("interactive") || o.classList.add("interactive"), o.addEventListener("click", a)), o;
}
function Zt(...e) {
  const t = document.createElement("div");
  t.className = "card-head";
  for (const n of e)
    if (typeof n == "string") {
      const i = document.createElement("span");
      i.textContent = n, t.append(i);
    } else
      t.append(n);
  return t;
}
function bt(e) {
  const t = document.createElement("div"), n = ["card-content"];
  return n.push("flush"), t.className = n.join(" "), t;
}
function En(e) {
  if (typeof e == "string" || typeof e == "number") {
    const t = document.createElement("span");
    return t.textContent = String(e), t;
  }
  return e;
}
function xr(e) {
  const t = document.createElement("div");
  if (t.className = `card-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append(En(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? w({ text: String(e.trailing), kind: "chip", size: "m" }) : En(e.trailing);
    t.append(n);
  }
  return t;
}
function go(e) {
  return typeof e == "string" ? c("span", { textContent: e }) : e;
}
function kr(e) {
  return c("h2", { textContent: e });
}
function Xt(e, t) {
  const n = c("div", { className: "section-head" });
  return n.append(typeof e == "string" ? kr(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? w({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function J(e, ...t) {
  const n = c("div", { className: `block section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(Xt(e.title, e.badge)) : n.append(kr(e.title)));
  for (const i of t) n.append(go(i));
  return n;
}
function Qt(e, t) {
  const n = c("nav", {
    className: `breadcrumb${t?.className ? ` ${t.className}` : ""}`,
    "aria-label": "Breadcrumb"
  }), i = c("div", { className: "breadcrumb-main" });
  return t?.leading?.length && i.append(...t.leading), e.forEach((r, a) => {
    if (a > 0 && i.append(c("span", { className: "breadcrumb-sep", textContent: "/" })), r.href || r.onClick) {
      const o = c("a", {
        className: `breadcrumb-item${r.className ? ` ${r.className}` : ""}`,
        href: r.href || "#",
        textContent: r.label
      });
      r.onClick && o.addEventListener("click", r.onClick), i.append(o);
      return;
    }
    i.append(c("span", {
      className: r.className || "breadcrumb-segment",
      textContent: r.label
    }));
  }), n.append(i), t?.trailing?.length && n.append(c("div", { className: "breadcrumb-trailing" }, ...t.trailing)), n;
}
function en(e) {
  const { configured: t, variant: n = "tag", label: i, title: r } = e, a = i || r, o = t ? O.unlock : O.lock, s = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-meta-icon", l = n !== "endpoint" ? ` ${s}--${t ? "configured" : "required"}` : "";
  return c("span", {
    className: `${s}${l}`.trim(),
    innerHTML: o,
    ...a ? { "aria-label": a } : {}
  });
}
function Cr(e) {
  const t = c("div", { className: e.overlayClass });
  t.setAttribute(e.dataOverlayAttr, "true");
  const n = c("div", {
    className: e.modalClass,
    role: e.role || "dialog",
    "aria-label": e.ariaLabel,
    "aria-modal": "true"
  });
  t.append(n);
  let i = !1;
  const r = () => {
    i || (i = !0, t.remove(), e.onClose?.());
  };
  return t.addEventListener("click", (a) => {
    a.target === t && r();
  }), t.addEventListener("keydown", (a) => {
    a.key === "Escape" && (a.preventDefault(), r());
  }, !0), {
    overlay: t,
    modal: n,
    mount: (a) => {
      (a || document.querySelector(".root") || document.body).appendChild(t);
    },
    close: r
  };
}
let Te = null, Mt = null;
function wr() {
  Mt?.(), Mt = null;
}
function Lt() {
  wr(), Te && Te.close(), Te = null;
}
function vo(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function yo(e) {
  return zt(e);
}
function Ze(e) {
  requestAnimationFrame(() => e.focus());
}
function Ot(e, t) {
  const n = c("div", { className: "modal field" });
  return n.append(c("label", { className: "modal label", textContent: e }), t), n;
}
function Fe(e) {
  return ge({
    className: "modal input",
    placeholder: e.placeholder,
    value: e.value,
    ariaLabel: e.ariaLabel,
    type: e.type
  });
}
function bo(e) {
  try {
    const t = new TextEncoder().encode(e);
    let n = "";
    return t.forEach((i) => {
      n += String.fromCharCode(i);
    }), btoa(n);
  } catch {
    return btoa(unescape(encodeURIComponent(e)));
  }
}
function xo(e) {
  try {
    const t = atob(e), n = Uint8Array.from(t, (i) => i.charCodeAt(0));
    return new TextDecoder().decode(n);
  } catch {
    try {
      return decodeURIComponent(escape(atob(e)));
    } catch {
      return "";
    }
  }
}
function ko(e) {
  if (!e) return { username: "", password: "" };
  try {
    const n = xo(e).split(":");
    return {
      username: n[0] || "",
      password: n.slice(1).join(":") || ""
    };
  } catch {
    return { username: "", password: "" };
  }
}
function Tt(e, t, n) {
  D(n);
  const i = b.get().auth.schemes[e] || "", r = t.type, a = (t.scheme || "").toLowerCase();
  if (r === "http" && a === "bearer") {
    const o = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = Fe({
      placeholder: "Bearer token...",
      value: i,
      ariaLabel: "Bearer token",
      type: "password"
    }), u = re({
      variant: "icon",
      icon: O.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => b.setSchemeValue(e, l.value)), s.append(l, u), o.append(c("label", { className: "modal label", textContent: "Token" }), s), n.append(o), Ze(l);
  } else if (r === "http" && a === "basic") {
    const o = ko(i), s = Fe({
      placeholder: "Username",
      value: o.username,
      ariaLabel: "Username"
    });
    n.append(Ot("Username", s));
    const l = Fe({
      placeholder: "Password",
      value: o.password,
      ariaLabel: "Password",
      type: "password"
    });
    n.append(Ot("Password", l));
    const u = () => {
      const d = `${s.value}:${l.value}`, p = d === ":" ? "" : bo(d);
      b.setSchemeValue(e, p);
    };
    s.addEventListener("input", u), l.addEventListener("input", u), Ze(s);
  } else if (r === "apiKey") {
    const o = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = Fe({
      placeholder: `${t.name || "API key"}...`,
      value: i,
      ariaLabel: "API key",
      type: "password"
    }), u = re({
      variant: "icon",
      icon: O.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => {
      b.setSchemeValue(e, l.value);
    }), s.append(l, u), o.append(c("label", { className: "modal label", textContent: `API Key (${t.name || "key"})` }), s), n.append(o), Ze(l);
  } else {
    const o = Fe({
      placeholder: "Token...",
      value: i,
      ariaLabel: "Token",
      type: "password"
    });
    o.addEventListener("input", () => {
      b.setSchemeValue(e, o.value);
    }), n.append(Ot("Token / Credential", o)), Ze(o);
  }
}
function tn(e, t, n) {
  Te && Lt();
  const i = Object.entries(e);
  if (i.length === 0) return;
  const r = Cr({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Authentication Settings",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      wr(), Te = null;
    }
  });
  Te = r;
  const a = r.modal, o = c("div", { className: "modal header" });
  o.append(c("h2", { className: "modal title", textContent: "Authentication" }));
  const s = re({ variant: "icon", icon: O.close, ariaLabel: "Close", onClick: Lt });
  o.append(s), a.append(o);
  const l = c("div", { className: "modal body" });
  let u = n || b.get().auth.activeScheme || i[0][0];
  e[u] || (u = i[0][0]);
  const d = c("div", { className: "modal fields" });
  if (i.length > 1) {
    const x = c("div", { className: "modal tabs" }), y = /* @__PURE__ */ new Map(), L = [], T = (k, E, N) => {
      const q = nn(E);
      if (k.setAttribute("data-configured", q ? "true" : "false"), D(k), q) {
        const $ = c("span", { className: "modal tab-check", "aria-hidden": "true" });
        $.innerHTML = O.check, k.append($);
      }
      k.append(c("span", { className: "modal tab-label", textContent: yo(N) }));
    };
    for (const [k, E] of i) {
      const N = c("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": k === u ? "true" : "false"
      });
      T(N, k, E), N.addEventListener("click", () => {
        if (u !== k) {
          u = k;
          for (const q of L) q.setAttribute("aria-pressed", "false");
          N.setAttribute("aria-pressed", "true"), m(), Tt(k, E, d);
        }
      }), y.set(k, N), L.push(N), x.append(N);
    }
    Mt = b.subscribe(() => {
      for (const [k, E] of i) {
        const N = y.get(k);
        N && T(N, k, E);
      }
    }), l.append(x);
  }
  const p = c("div", { className: "modal scheme-desc" });
  function m() {
    const x = e[u];
    if (!x) return;
    D(p);
    const y = c("div", { className: "modal scheme-title", textContent: vo(x) });
    p.append(y), x.description && p.append(c("div", { className: "modal scheme-text", textContent: x.description }));
  }
  m(), l.append(p);
  const f = e[u];
  f && Tt(u, f, d), l.append(d), a.append(l);
  const h = c("div", { className: "modal footer" }), v = re({
    variant: "ghost",
    label: "Reset",
    onClick: () => {
      b.setSchemeValue(u, "");
      const x = e[u];
      x && Tt(u, x, d);
    }
  }), g = re({ variant: "primary", label: "Done", onClick: Lt });
  h.append(v, c("div", { className: "grow" }), g), a.append(h), r.mount(t ?? document.querySelector(".root") ?? document.body);
}
function nn(e) {
  return !!b.get().auth.schemes[e];
}
function rn(e, t) {
  const n = Ye(e, t), i = b.get().auth, r = gt(n, i.schemes, i.activeScheme, i.token);
  return Object.keys(r.headers).length > 0 || Object.keys(r.query).length > 0 || Object.keys(r.cookies).length > 0;
}
function an(e, t) {
  const n = Ye(e, t), i = b.get().auth;
  return gt(n, i.schemes, i.activeScheme, i.token).headers;
}
function Co(e, t) {
  const n = Ye(e, t), i = b.get().auth;
  return gt(n, i.schemes, i.activeScheme, i.token).query;
}
function wo(e, t) {
  const n = Ye(e, t), i = b.get().auth;
  return gt(n, i.schemes, i.activeScheme, i.token).cookies;
}
function on(e, t) {
  const n = Ye(e, t);
  return Xr(n);
}
function Ye(e, t) {
  if (e)
    return Array.isArray(e) ? Ut(e, t, !1) : e;
}
let te = -1, ft = null, xe = null;
function Sr() {
  mt();
  const e = Cr({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      ft = null, b.set({ searchOpen: !1 });
    }
  });
  ft = e;
  const t = e.modal, n = c("div", { className: "search-input-wrap" });
  n.innerHTML = O.search;
  const i = ge({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), r = c("kbd", { textContent: "ESC", className: "kbd" });
  n.append(i, r), t.append(n);
  const a = c("div", { className: "search-results", role: "listbox" }), o = c("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  a.append(o), t.append(a);
  const s = c("div", { className: "search-footer" });
  s.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(s), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => i.focus()), te = -1;
  let l = [];
  i.addEventListener("input", () => {
    const u = i.value;
    l = no(u), So(a, l), rt(a, l.length > 0 ? 0 : -1);
  }), i.addEventListener("keydown", (u) => {
    const d = u;
    d.key === "ArrowDown" ? (d.preventDefault(), l.length > 0 && rt(a, Math.min(te + 1, l.length - 1))) : d.key === "ArrowUp" ? (d.preventDefault(), l.length > 0 && rt(a, Math.max(te - 1, 0))) : d.key === "Enter" ? (d.preventDefault(), te >= 0 && te < l.length && Nr(l[te])) : d.key === "Escape" && (d.preventDefault(), mt());
  });
}
function mt() {
  if (ft) {
    ft.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), b.set({ searchOpen: !1 });
}
function So(e, t) {
  if (D(e), t.length === 0) {
    e.append(c("div", { className: "search-empty", textContent: "No results found" }));
    return;
  }
  const n = document.createDocumentFragment();
  t.forEach((i, r) => {
    const a = c("div", {
      className: "search-result",
      role: "option",
      "aria-selected": "false",
      "data-index": String(r)
    });
    i.method ? a.append(w({
      text: i.method.toUpperCase(),
      kind: "method",
      method: i.method
    })) : i.type === "schema" ? a.append(w({ text: "SCH", kind: "chip", size: "m" })) : i.type === "tag" && a.append(w({ text: "TAG", kind: "chip", size: "m" }));
    const o = c("div", { className: "search-result-info min-w-0" });
    if (o.append(c("span", { className: "search-result-title", textContent: i.title })), i.subtitle && o.append(c("span", { className: "search-result-subtitle", textContent: i.subtitle })), a.append(o), i.method && i.requiresAuth && i.resolvedSecurity) {
      const s = b.get().spec, l = rn(i.resolvedSecurity, s?.securitySchemes || {});
      a.append(c("span", {
        className: `search-result-lock search-result-lock--${l ? "configured" : "required"}`,
        innerHTML: l ? O.unlock : O.lock,
        "aria-label": i.authTitle || "Requires authentication"
      }));
    }
    a.addEventListener("click", () => Nr(i)), a.addEventListener("mouseenter", () => {
      rt(e, r);
    }), n.append(a);
  }), e.append(n);
}
function rt(e, t) {
  if (te === t) return;
  if (te >= 0) {
    const i = e.querySelector(`.search-result[data-index="${te}"]`);
    i && (i.classList.remove("focused"), i.setAttribute("aria-selected", "false"));
  }
  if (te = t, t < 0) return;
  const n = e.querySelector(`.search-result[data-index="${t}"]`);
  n && (n.classList.add("focused"), n.setAttribute("aria-selected", "true"), n.scrollIntoView({ block: "nearest" }));
}
function Nr(e) {
  mt(), e.type === "operation" ? R(F({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? R(F({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? R(F({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && R(F({ type: "webhook", webhookName: e.webhookName }));
}
function No() {
  return xe && document.removeEventListener("keydown", xe), xe = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), b.get().searchOpen ? mt() : (b.set({ searchOpen: !0 }), Sr()));
  }, document.addEventListener("keydown", xe), () => {
    xe && (document.removeEventListener("keydown", xe), xe = null);
  };
}
function Ao(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let i = null;
  for (const s of n) {
    const l = s, u = Io(l), d = l.getAttribute("href");
    if (!d && !u) continue;
    const p = d?.startsWith("#") ? d.slice(1) : d || "", m = u || Gn(p), f = qe(m, t);
    s.classList.toggle("active", f), f ? (l.setAttribute("aria-current", "page"), i = l) : l.removeAttribute("aria-current");
  }
  const r = i ? i.closest(".nav-group") : null;
  if (r) {
    const s = r.querySelector(".nav-group-header"), l = r.querySelector(".nav-group-items");
    s instanceof HTMLElement && l instanceof HTMLElement && fe(s, l, !0, { animate: !1 });
  }
  const a = t.type === "endpoint" || t.type === "tag" ? t.tag : null, o = t.type === "schema" ? "schemas" : a ? Z(a) : null;
  if (o) {
    const s = e.querySelector(`[data-nav-tag="${CSS.escape(o)}"]`);
    if (s) {
      const l = s.querySelector(".nav-group-header"), u = s.querySelector(".nav-group-items");
      l instanceof HTMLElement && u instanceof HTMLElement && fe(l, u, !0, { animate: !1 });
    }
  }
  i && requestAnimationFrame(() => {
    const l = i.closest(".nav-group")?.querySelector(".nav-group-header");
    l ? l.scrollIntoView({ block: "start", behavior: "smooth" }) : i.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function Ln(e, t) {
  const n = b.get(), i = n.spec;
  if (!i) return;
  D(e);
  const r = t.title || i.info.title || "API Docs", a = i.info.version ? `v${i.info.version}` : "", o = c("div", { className: "top" }), s = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  s.innerHTML = O.chevronLeft, s.addEventListener("click", () => b.set({ sidebarOpen: !1 }));
  const l = c("a", { className: "title", href: "/", textContent: r });
  l.addEventListener("click", (k) => {
    k.preventDefault(), R("/");
  });
  const u = c("div", { className: "title-wrap" });
  if (u.append(l), a && u.append(c("span", { className: "version", textContent: a })), o.append(s, u), i.securitySchemes && Object.keys(i.securitySchemes).length > 0) {
    const k = Object.keys(i.securitySchemes), E = n.auth.activeScheme || k[0] || "", N = nn(E), q = c("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication"
    });
    q.innerHTML = N ? O.unlock : O.lock, q.classList.toggle("active", N), q.addEventListener("click", () => {
      const S = b.get().auth.activeScheme || k[0] || "";
      tn(
        i.securitySchemes,
        e.closest(".root") ?? void 0,
        S
      );
    }), o.append(q);
  }
  const d = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (d.innerHTML = b.get().theme === "light" ? O.moon : O.sun, d.addEventListener("click", () => {
    ro(), d.innerHTML = b.get().theme === "light" ? O.moon : O.sun;
  }), e.append(o), n.environments.length > 1) {
    const k = qo(n);
    e.append(k);
  }
  const p = c("div", { className: "search" }), m = c("span", { className: "search-icon", innerHTML: O.search }), f = ge({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), h = c("span", { className: "kbd", textContent: "⌘K" });
  f.addEventListener("focus", () => {
    b.set({ searchOpen: !0 }), f.blur(), Sr();
  }), p.append(m, f, h), e.append(p);
  const v = c("nav", { className: "nav", "aria-label": "API navigation" }), g = Oo({ type: "overview" }, n.route);
  v.append(g);
  for (const k of i.tags) {
    if (k.operations.length === 0) continue;
    const E = Eo(k, n.route);
    v.append(E);
  }
  if (i.webhooks && i.webhooks.length > 0) {
    const k = c("div", { className: "nav-group", "data-nav-tag": "webhooks" }), E = On("Webhooks", i.webhooks.length), N = c("div", { className: "nav-group-items" });
    for (const $ of i.webhooks) {
      const S = { type: "webhook", webhookName: $.name }, W = In($.summary || $.name, $.method, S, n.route);
      W.classList.add("nav-item-webhook"), N.append(W);
    }
    E.addEventListener("click", () => {
      fe(E, N);
    });
    const q = n.route.type === "webhook";
    fe(E, N, q, { animate: !1 }), k.append(E, N), v.append(k);
  }
  const x = Object.keys(i.schemas);
  if (x.length > 0) {
    const k = c("div", { className: "nav-group" }), E = On("Schemas", x.length), N = c("div", { className: "nav-group-items" });
    for (const $ of x) {
      const W = In($, void 0, { type: "schema", schemaName: $ }, n.route);
      N.append(W);
    }
    E.addEventListener("click", () => {
      fe(E, N);
    });
    const q = n.route.type === "schema";
    fe(E, N, q, { animate: !1 }), k.setAttribute("data-nav-tag", "schemas"), k.append(E, N), v.append(k);
  }
  e.append(v);
  const y = c("div", { className: "footer" }), L = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "PureDocs"
  });
  L.innerHTML = `<svg viewBox="0 0 593 465" xmlns="http://www.w3.org/2000/svg">
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
  </svg>`, L.addEventListener("click", () => {
    window.open("https://puredocs.dev", "_blank", "noopener,noreferrer");
  });
  const T = c("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  T.textContent = `puredocs.dev${a ? ` ${a}` : ""}`, y.append(L, T), y.append(d), e.append(y), requestAnimationFrame(() => {
    const k = v.querySelector(".nav-item.active");
    if (k) {
      const N = k.closest(".nav-group")?.querySelector(".nav-group-header");
      N ? N.scrollIntoView({ block: "start", behavior: "smooth" }) : k.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function Eo(e, t, n) {
  const i = c("div", { className: "nav-group", "data-nav-tag": Z(e.name) }), r = Lo(e, t), a = c("div", { className: "nav-group-items" }), o = Z(e.name), s = t.type === "tag" && Z(t.tag || "") === o || e.operations.some((l) => qe(Pt(l, e.name), t));
  for (const l of e.operations) {
    const u = Pt(l, e.name), d = To(l, u, t);
    a.append(d);
  }
  return r.addEventListener("click", (l) => {
    l.target.closest(".nav-group-link") || fe(r, a);
  }), fe(r, a, s, { animate: !1 }), i.append(r, a), i;
}
function Lo(e, t) {
  const n = Z(e.name), i = t.type === "tag" && Z(t.tag || "") === n || e.operations.some((s) => qe(Pt(s, e.name), t)), r = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(i), tabIndex: 0 }), a = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": i ? "Collapse" : "Expand"
  });
  a.innerHTML = O.chevronRight, a.addEventListener("click", (s) => {
    s.preventDefault(), s.stopPropagation(), r.click();
  });
  const o = c("a", {
    className: "nav-group-link",
    href: F({ type: "tag", tag: e.name })
  });
  return o.append(
    c("span", { className: "nav-group-title", textContent: e.name }),
    c("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), o.addEventListener("click", (s) => {
    s.preventDefault(), R(F({ type: "tag", tag: e.name }));
  }), r.append(a, o), r.addEventListener("keydown", (s) => {
    (s.key === "Enter" || s.key === " ") && (s.preventDefault(), a.click());
  }), r;
}
function On(e, t) {
  const n = c("div", { className: "nav-group-header focus-ring", role: "button", "aria-expanded": "true", tabindex: "0" }), i = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": "Toggle section"
  });
  i.innerHTML = O.chevronRight, i.addEventListener("click", (a) => {
    a.preventDefault(), a.stopPropagation(), n.click();
  });
  const r = c("span", { className: "nav-group-link nav-group-link--static" });
  return r.append(
    c("span", { className: "nav-group-title", textContent: e }),
    c("span", { className: "nav-group-count", textContent: String(t) })
  ), n.append(i, r), n.addEventListener("keydown", (a) => {
    (a.key === "Enter" || a.key === " ") && (a.preventDefault(), n.click());
  }), n;
}
function fe(e, t, n = !e.classList.contains("expanded"), i = {}) {
  if (!(i.animate !== !1)) {
    e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), Tn(e, n), t.classList.toggle("collapsed", !n), It(t);
    return;
  }
  n ? (t.classList.remove("collapsed"), It(t)) : (It(t), t.offsetHeight, t.classList.add("collapsed")), e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), Tn(e, n);
}
function It(e) {
  e.style.setProperty("--nav-group-max-height", `${e.scrollHeight}px`);
}
function Tn(e, t) {
  const n = e.querySelector(".nav-group-chevron");
  n instanceof HTMLElement && n.setAttribute("aria-label", t ? "Collapse" : "Expand");
}
function In(e, t, n, i) {
  const r = qe(n, i), a = c("a", {
    className: `nav-item${r ? " active" : ""}`,
    href: F(n),
    role: "link",
    "aria-current": r ? "page" : void 0
  }), o = w(t ? {
    text: t.toUpperCase(),
    kind: "method",
    method: t
  } : {
    text: "GET",
    kind: "method",
    method: "get",
    className: "placeholder"
  });
  return t || o.setAttribute("aria-hidden", "true"), a.append(o), a.append(c("span", { className: "nav-item-label", textContent: e })), a.addEventListener("click", (s) => {
    s.preventDefault(), R(F(n));
  }), a;
}
function Oo(e, t) {
  const n = qe(e, t), i = c("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: F(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), r = c("span", { className: "nav-overview-icon-slot" });
  r.innerHTML = O.globe;
  const a = c("span", { className: "nav-item-label", textContent: "Overview" });
  return i.append(r, a), i.addEventListener("click", (o) => {
    o.preventDefault(), R(F(e));
  }), i;
}
function To(e, t, n) {
  const i = qe(t, n), r = c("a", {
    className: `nav-item${i ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: F(t),
    "aria-current": i ? "page" : void 0
  });
  r.dataset.routeType = "endpoint", t.operationId && (r.dataset.routeOperationId = t.operationId), t.method && (r.dataset.routeMethod = t.method), t.path && (r.dataset.routePath = t.path), t.tag && (r.dataset.routeTag = t.tag);
  const a = b.get().spec, o = H(e.resolvedSecurity) ? en({
    configured: rn(e.resolvedSecurity, a?.securitySchemes || {}),
    variant: "nav",
    title: ze(e.resolvedSecurity)
  }) : null;
  return r.append(
    w({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    c("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...o ? [o] : []
  ), r.addEventListener("click", (s) => {
    s.preventDefault(), R(F(t));
  }), r;
}
function Pt(e, t) {
  return {
    type: "endpoint",
    tag: t,
    method: e.method,
    path: e.path,
    operationId: e.operationId
  };
}
function qe(e, t) {
  if (e.type !== t.type) return !1;
  if (e.type === "overview") return !0;
  if (e.type === "tag") return Z(e.tag || "") === Z(t.tag || "");
  if (e.type === "endpoint") {
    if (e.operationId && t.operationId) return e.operationId === t.operationId;
    const n = (e.method || "").toLowerCase(), i = (t.method || "").toLowerCase();
    return n === i && qn(e.path) === qn(t.path);
  }
  return e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function qn(e) {
  return e && e.replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
}
function Io(e) {
  const { routeType: t } = e.dataset;
  return t && t === "endpoint" ? {
    type: "endpoint",
    operationId: e.dataset.routeOperationId || void 0,
    method: e.dataset.routeMethod || void 0,
    path: e.dataset.routePath || void 0,
    tag: e.dataset.routeTag || void 0
  } : null;
}
function qo(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((r) => {
    const a = t.find((s) => s.name === r.name), o = Kt((a?.baseUrl ?? r.baseUrl) || "");
    return { value: r.name, label: o || "(no URL)" };
  });
  return dt({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (r) => b.setActiveEnvironment(r),
    className: "env"
  });
}
function Ar(e, t, n = "No operations") {
  const i = c("div", { className: "summary-line" });
  for (const a of e)
    i.append(w({
      text: `${a.value} ${a.label}`,
      kind: "chip",
      size: "m"
    }));
  const r = ["get", "post", "put", "patch", "delete", "head", "options"];
  for (const a of r) {
    const o = t[a] || 0;
    o !== 0 && i.append(w({
      kind: "method",
      method: a,
      size: "m",
      text: `${o} ${a.toUpperCase()}`
    }));
  }
  return i.childNodes.length || i.append(w({
    text: n,
    kind: "chip",
    size: "m"
  })), i;
}
function jo(e, t) {
  const n = [], i = $o(e, t);
  return i && n.push(i), n;
}
function $o(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = J({ title: "Authentication" });
  for (const [i, r] of Object.entries(e)) {
    const a = nn(i), o = ce({ className: "card-group card-auth" }), s = c("div", { className: "card-auth-main" }), l = c("div", { className: "card-info card-auth-info" }), u = `${r.type}${r.scheme ? ` / ${r.scheme}` : ""}`;
    l.append(
      c("h3", { textContent: i }),
      c("p", { className: "card-auth-type", textContent: u })
    ), r.description && l.append(c("p", { className: "card-auth-desc", textContent: String(r.description) }));
    const d = re({
      variant: "secondary",
      icon: a ? O.check : O.settings,
      label: a ? "Success" : "Set",
      className: `card-auth-config${a ? " active is-configured" : ""}`,
      onClick: (p) => {
        p.stopPropagation(), tn(e, t, i);
      }
    });
    s.append(l), o.append(s, d), n.append(o);
  }
  return n;
}
async function jn(e, t) {
  D(e);
  const n = b.get().spec;
  if (!n) return;
  const i = c("div", { className: "block header" }), r = c("div", { className: "title" });
  r.append(
    c("h1", { textContent: n.info.title }),
    c("span", { className: "version", textContent: `v${n.info.version}` })
  ), i.append(r), n.info.description && i.append(c("p", { textContent: n.info.description })), e.append(i);
  const a = n.operations.filter((d) => H(d.resolvedSecurity)).length, o = n.operations.filter((d) => d.deprecated).length, s = Mo(n.operations);
  if (e.append(J(
    { className: "summary" },
    Ar(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: a },
        { label: "Deprecated", value: o }
      ],
      s,
      "No operations"
    )
  )), n.servers.length > 0) {
    const d = J({ title: "Servers" }), p = b.get(), m = p.initialEnvironments || p.environments;
    for (const f of n.servers) {
      const h = m.find((k) => k.baseUrl === f.url), v = h?.name === p.activeEnvironment, g = ce({
        interactive: !0,
        active: v,
        className: "card-group",
        onClick: () => {
          h && b.setActiveEnvironment(h.name);
        }
      }), x = c("div", { className: "card-info" }), y = c("div", { className: "inline-cluster inline-cluster-sm" }), L = c("span", { className: "icon-muted" });
      L.innerHTML = O.server, y.append(L, c("code", { textContent: f.url })), x.append(y), f.description && x.append(c("p", { textContent: f.description }));
      const T = c("div", { className: "card-badges" });
      g.append(x, T), d.append(g);
    }
    e.append(d);
  }
  const l = e.closest(".root") ?? void 0, u = jo(n.securitySchemes || {}, l);
  for (const d of u)
    e.append(d);
  if (n.tags.length > 0) {
    const d = J({ title: "API Groups" });
    for (const p of n.tags)
      p.operations.length !== 0 && d.append(Bo(p));
    e.append(d);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const d = J({ title: "Webhooks" });
    for (const p of n.webhooks) {
      const m = ce({
        interactive: !0,
        className: "card-group",
        onClick: () => R(F({ type: "webhook", webhookName: p.name }))
      }), f = c("div", { className: "card-badges" });
      f.append(
        w({ text: "WH", kind: "webhook", size: "s" }),
        w({ text: p.method.toUpperCase(), kind: "method", method: p.method, size: "s" })
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
function Bo(e) {
  const t = ce({
    interactive: !0,
    className: "card-group",
    onClick: () => R(F({ type: "tag", tag: e.name }))
  }), n = Po(e), i = c("div", { className: "card-badges" });
  for (const [o, s] of Object.entries(n)) {
    const l = w({
      text: o.toUpperCase(),
      kind: "method",
      method: o,
      size: "m"
    });
    l.textContent = `${s} ${o.toUpperCase()}`, i.append(l);
  }
  const r = c("div", { className: "card-group-top" });
  r.append(c("h3", { className: "card-group-title", textContent: e.name }), i);
  const a = c("p", {
    className: "card-group-description",
    textContent: e.description || `${e.operations.length} endpoints`
  });
  return t.append(r, a), t;
}
function Mo(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Po(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function je(e) {
  if (!e) return "any";
  if (e.$ref) return e.$ref.split("/").pop() || "ref";
  let t = e.type || "";
  return e.allOf ? t = "allOf" : e.oneOf ? t = "oneOf" : e.anyOf ? t = "anyOf" : e.enum ? t = "enum" : e.format && (t += `<${e.format}>`), e.type === "array" && e.items && !e.enum && (t = `${e.items.type || e.items.$ref?.split("/").pop() || "any"}[]`), e.nullable && (t += " | null"), t || "object";
}
function Ro(e) {
  const t = c("div", { className: "schema" }), n = c("div", { className: "body" });
  t.append(n);
  const i = [];
  Er(n, e, "", 0, /* @__PURE__ */ new Set(), i);
  const r = i.length > 0, a = () => i.some(({ children: s }) => s.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const s = !a();
    Tr(i, s);
  }, isExpanded: a, hasExpandable: r };
}
function Ve(e, t) {
  const n = ce(), i = je(e), r = bt(), a = c("div", { className: "schema" }), o = c("div", { className: "body" });
  a.append(o);
  const s = [];
  if (Er(o, e, "", 0, /* @__PURE__ */ new Set(), s), r.append(a), t) {
    const l = Zt(), u = typeof t == "string" ? c("h3", { textContent: t }) : t, d = s.length > 0, p = d && s.some(({ children: h }) => h.style.display !== "none"), m = w({ text: i, kind: "chip", color: "primary", size: "m" }), f = d ? c("button", {
      className: p ? "schema-collapse-btn is-expanded" : "schema-collapse-btn",
      type: "button",
      "aria-label": p ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (f && (f.innerHTML = O.chevronDown, f.addEventListener("click", (h) => {
      h.stopPropagation();
      const v = !f.classList.contains("is-expanded");
      Tr(s, v), f.classList.toggle("is-expanded", v), f.setAttribute("aria-label", v ? "Collapse all fields" : "Expand all fields");
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
function Fo(e, t) {
  const { headerTitle: n, withEnumAndDefault: i = !0 } = t, r = e.map((u) => {
    const d = c("div", { className: "schema-row role-flat role-params" }), p = c("div", { className: "schema-main-row" }), m = c("div", { className: "schema-name-wrapper" });
    m.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: u.name })
    );
    const f = c("div", { className: "schema-meta-wrapper" });
    f.append(w({
      text: u.schema ? je(u.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), u.required && f.append(w({ text: "required", kind: "required", size: "m" })), p.append(m, f), d.append(p);
    const h = c("div", { className: "schema-desc-col is-root" });
    u.description && h.append(c("p", { textContent: u.description }));
    const v = u.schema?.enum, g = u.schema?.default !== void 0;
    if (i && (v && v.length > 0 || g)) {
      const x = c("div", { className: "schema-enum-values" });
      if (g && x.append(w({
        text: `Default: ${JSON.stringify(u.schema.default)}`,
        kind: "chip",
        size: "s"
      })), v)
        for (const y of v) {
          const L = String(y);
          L !== u.in && x.append(w({ text: L, kind: "chip", size: "s" }));
        }
      h.append(x);
    }
    return h.children.length > 0 && d.append(h), d;
  }), a = ce(), o = bt(), s = c("div", { className: "params" }), l = c("div", { className: "body role-params" });
  return l.append(...r), s.append(l), o.append(s), a.append(
    Zt(xr({ title: n })),
    o
  ), a;
}
function Xe(e, t, n, i, r, a, o) {
  const s = je(n), l = _o(n), u = Or(t, s, n, i, l, r);
  if (e.append(u), l) {
    const d = c("div", { className: "schema-children" });
    d.style.display = "block";
    const p = new Set(a);
    p.add(n), Lr(d, n, i + 1, p, o), e.append(d), o?.push({ row: u, children: d }), u.querySelector(".schema-toggle")?.classList.add("is-expanded"), u.classList.add("focus-ring"), u.setAttribute("aria-expanded", "true"), u.setAttribute("tabindex", "0"), u.addEventListener("click", () => {
      const m = d.style.display !== "none";
      Rt(u, d, !m);
    }), u.addEventListener("keydown", (m) => {
      if (m.key !== "Enter" && m.key !== " ") return;
      m.preventDefault();
      const f = d.style.display !== "none";
      Rt(u, d, !f);
    });
  }
}
function Er(e, t, n, i, r, a) {
  if (r.has(t)) {
    e.append(Or("[circular]", "circular", { description: "" }, i, !1, !1));
    return;
  }
  {
    const o = new Set(r);
    o.add(t), Lr(e, t, i, o, a);
    return;
  }
}
function Lr(e, t, n, i, r) {
  const a = new Set(t.required || []);
  if (t.properties)
    for (const [o, s] of Object.entries(t.properties))
      Xe(e, o, s, n, a.has(o), i, r);
  t.items && t.type === "array" && Xe(e, "[item]", t.items, n, !1, i, r);
  for (const o of ["allOf", "oneOf", "anyOf"]) {
    const s = t[o];
    if (Array.isArray(s))
      for (let l = 0; l < s.length; l++)
        Xe(e, `${o}[${l}]`, s[l], n, !1, i, r);
  }
  t.additionalProperties && typeof t.additionalProperties == "object" && Xe(e, "[additionalProperties]", t.additionalProperties, n, !1, i, r);
}
function Or(e, t, n, i, r, a) {
  const o = [
    "schema-row",
    i === 0 ? "is-root" : "",
    i === 0 && !r ? "is-leaf" : ""
  ].filter(Boolean).join(" "), s = c("div", { className: o, role: r ? "button" : void 0 });
  s.setAttribute("data-depth", String(i)), s.style.setProperty("--schema-depth", String(i));
  const l = c("div", { className: "schema-main-row" }), u = c("div", { className: "schema-name-wrapper" });
  r ? u.append(c("span", { className: "schema-toggle", innerHTML: O.chevronRight })) : u.append(c("span", { className: "schema-spacer" })), u.append(c("span", { textContent: e })), l.append(u);
  const d = c("div", { className: "schema-meta-wrapper" });
  d.append(w({ text: t, kind: "chip", color: "primary", size: "m" })), a && d.append(w({ text: "required", kind: "required", size: "m" })), l.append(d), s.append(l);
  const p = c("div", { className: `schema-desc-col${i === 0 ? " is-root" : ""}` });
  n.description && p.append(c("p", { textContent: String(n.description) }));
  const m = n.enum, f = Array.isArray(m) && m.length > 0, h = n.default, v = h !== void 0, g = f && v ? m.some((y) => qt(y, h)) : !1, x = Do(n, !f || !v);
  if (x.length > 0 || f) {
    const y = c("div", { className: "schema-constraints-row" });
    for (const L of x)
      y.append(w({
        text: L,
        kind: "chip",
        size: "s"
      }));
    if (f) {
      const L = v && g ? [h, ...m.filter((T) => !qt(T, h))] : m;
      v && !g && y.append(w({
        text: `default: ${it(h)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value is-default"
      }));
      for (const T of L) {
        const k = v && qt(T, h);
        y.append(w({
          text: k ? `default: ${it(T)}` : it(T),
          kind: "chip",
          size: "s",
          className: k ? "schema-enum-value is-default" : "schema-enum-value"
        }));
      }
    }
    p.append(y);
  }
  return p.children.length > 0 && s.append(p), s;
}
function _o(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function Do(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${it(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function Tr(e, t) {
  for (const { row: n, children: i } of e)
    Rt(n, i, t);
}
function Rt(e, t, n) {
  t.style.display = n ? "block" : "none", e.querySelector(".schema-toggle")?.classList.toggle("is-expanded", n), e.setAttribute("aria-expanded", n ? "true" : "false");
}
function it(e) {
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (e === null) return "null";
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function qt(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function Ho(e) {
  const { method: t, url: n, headers: i = {}, body: r, timeout: a = 3e4 } = e, o = new AbortController(), s = setTimeout(() => o.abort(), a), l = performance.now();
  try {
    const u = typeof FormData < "u" && r instanceof FormData, d = {
      method: t.toUpperCase(),
      headers: u ? void 0 : i,
      signal: o.signal,
      credentials: "include"
    };
    if (u) {
      const g = {};
      for (const [x, y] of Object.entries(i))
        x.toLowerCase() !== "content-type" && (g[x] = y);
      Object.keys(g).length > 0 && (d.headers = g);
    }
    r && !["GET", "HEAD"].includes(t.toUpperCase()) && (d.body = r);
    const p = await fetch(n, d), m = performance.now() - l, f = await p.text(), h = new TextEncoder().encode(f).length, v = {};
    return p.headers.forEach((g, x) => {
      v[x.toLowerCase()] = g;
    }), Uo(f, v), {
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
      body: `Request timed out after ${a}ms`,
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
function Uo(e, t) {
  const n = b.get().auth;
  if (n.locked) return;
  const i = b.get().spec;
  let r = n.activeScheme;
  if (i) {
    for (const [o, s] of Object.entries(i.securitySchemes))
      if (s.type === "http" && s.scheme?.toLowerCase() === "bearer") {
        r = o;
        break;
      }
  }
  const a = t["x-new-access-token"];
  if (a) {
    r ? (b.setSchemeValue(r, a), b.setAuth({ source: "auto-header" })) : b.setAuth({ token: a, source: "auto-header" });
    return;
  }
  try {
    const o = JSON.parse(e), s = o.accessToken || o.access_token || o.token;
    typeof s == "string" && s.length > 10 && (r ? (b.setSchemeValue(r, s), b.setAuth({ source: "auto-body" })) : b.setAuth({ token: s, source: "auto-body" }));
  } catch {
  }
}
function zo(e, t, n, i) {
  let r = t;
  for (const [u, d] of Object.entries(n))
    r = r.replace(`{${u}}`, encodeURIComponent(d));
  const o = e.replace(/\/+$/, "") + r, s = new URLSearchParams();
  for (const [u, d] of Object.entries(i))
    d && s.set(u, d);
  const l = s.toString();
  return l ? `${o}?${l}` : o;
}
function jt(e) {
  return [
    { language: "curl", label: "cURL", code: Wo(e) },
    { language: "javascript", label: "JavaScript", code: Vo(e) },
    { language: "python", label: "Python", code: Yo(e) },
    { language: "go", label: "Go", code: Go(e) }
  ];
}
function Wo({ method: e, url: t, headers: n, body: i }) {
  const r = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [a, o] of Object.entries(n))
    r.push(`  -H '${a}: ${o}'`);
  return i && r.push(`  -d '${i}'`), r.join(` \\
`);
}
function Vo({ method: e, url: t, headers: n, body: i }) {
  const r = [];
  r.push(`  method: '${e.toUpperCase()}'`);
  const a = Object.entries(n);
  if (a.length > 0) {
    const o = a.map(([s, l]) => `    '${s}': '${l}'`).join(`,
`);
    r.push(`  headers: {
${o}
  }`);
  }
  return i && r.push(`  body: JSON.stringify(${i})`), `const response = await fetch('${t}', {
${r.join(`,
`)}
});

const data = await response.json();
console.log(data);`;
}
function Yo({ method: e, url: t, headers: n, body: i }) {
  const r = ["import requests", ""], a = Object.entries(n);
  if (a.length > 0) {
    const s = a.map(([l, u]) => `    "${l}": "${u}"`).join(`,
`);
    r.push(`headers = {
${s}
}`);
  }
  i && r.push(`payload = ${i}`);
  const o = [`"${t}"`];
  return a.length > 0 && o.push("headers=headers"), i && o.push("json=payload"), r.push(""), r.push(`response = requests.${e.toLowerCase()}(${o.join(", ")})`), r.push("print(response.json())"), r.join(`
`);
}
function Go({ method: e, url: t, headers: n, body: i }) {
  const r = [
    "package main",
    "",
    "import (",
    '    "fmt"',
    '    "io"',
    '    "net/http"'
  ];
  i && r.push('    "strings"'), r.push(")", "", "func main() {"), i ? (r.push(`    body := strings.NewReader(\`${i}\`)`), r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", body)`)) : r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", nil)`), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }");
  for (const [a, o] of Object.entries(n))
    r.push(`    req.Header.Set("${a}", "${o}")`);
  return r.push(""), r.push("    resp, err := http.DefaultClient.Do(req)"), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }"), r.push("    defer resp.Body.Close()"), r.push(""), r.push("    data, _ := io.ReadAll(resp.Body)"), r.push("    fmt.Println(string(data))"), r.push("}"), r.join(`
`);
}
function Ko(e) {
  if (e.length === 0) return [];
  const t = (r, a, o) => {
    if (a && r.examples?.[a] !== void 0) {
      const s = r.examples[a], l = s?.value ?? s.value;
      if (l != null) return String(l);
    }
    return o !== void 0 && r.schema?.enum && r.schema.enum[o] !== void 0 ? String(r.schema.enum[o]) : r.example !== void 0 && r.example !== null ? String(r.example) : r.schema?.example !== void 0 && r.schema.example !== null ? String(r.schema.example) : r.schema?.default !== void 0 && r.schema.default !== null ? String(r.schema.default) : r.schema?.enum && r.schema.enum.length > 0 ? String(r.schema.enum[0]) : r.schema?.type === "integer" || r.schema?.type === "number" ? "0" : r.schema?.type === "boolean" ? "true" : r.in === "path" ? "id" : "value";
  }, n = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r.examples && typeof r.examples == "object")
      for (const a of Object.keys(r.examples)) n.add(a);
  const i = [];
  if (n.size > 0)
    for (const r of n) {
      const a = {};
      for (const l of e)
        a[l.name] = t(l, r);
      const s = e.find((l) => l.examples?.[r])?.examples?.[r];
      i.push({ name: r, summary: s?.summary, values: a });
    }
  else {
    const r = e.find((a) => a.schema?.enum && a.schema.enum.length > 1);
    if (r?.schema?.enum)
      for (let a = 0; a < r.schema.enum.length; a++) {
        const o = {};
        for (const l of e)
          o[l.name] = l === r ? t(l, null, a) : t(l, null);
        const s = String(r.schema.enum[a]);
        i.push({ name: s, values: o });
      }
    else {
      const a = {};
      for (const o of e)
        a[o.name] = t(o, null);
      i.push({ name: "Default", values: a });
    }
  }
  return i;
}
function Ir(e) {
  const t = [];
  if (e.examples && typeof e.examples == "object")
    for (const [n, i] of Object.entries(e.examples))
      t.push({
        name: n,
        summary: i.summary,
        description: i.description,
        value: i.value
      });
  if (t.length === 0 && e.example !== void 0 && t.push({ name: "Default", value: e.example }), t.length === 0 && e.schema) {
    const n = ke(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function Jo(e) {
  const t = [e.summary, e.description].filter(Boolean);
  return [...new Set(t)].join(" — ") || e.name;
}
function $n(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
const qr = [
  [/"(?:[^"\\]|\\.)*"(?=\s*:)/g, "property"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/\b(?:true|false|null)\b/g, "literal"],
  [/[{}[\]:,]/g, "punctuation"]
], Bn = [
  [/#.*/g, "comment"],
  [/"(?:[^"\\]|\\.)*"|'[^']*'/g, "string"],
  [/\$\w+|\$\{[^}]+\}/g, "sign"],
  [/--?\w[\w-]*/g, "sign"],
  [/\b(?:curl|wget|echo|export|if|then|else|fi|for|do|done|while|case|esac|function|return|local|set|unset|source|cd|ls|cat|grep|sed|awk|chmod|mkdir|rm|cp|mv|sudo|apt|brew|npm|pip|docker|http|https)\b/g, "keyword"],
  [/-?\b\d+(?:\.\d+)?\b/g, "number"]
], Zo = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/"(?:[^"\\]|\\.)*"|`[^`]*`/g, "string"],
  [/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g, "keyword"],
  [/\b(?:bool|byte|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr|true|false|nil|iota)\b/g, "literal"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], Qe = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/`(?:[^`\\]|\\.)*`/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/g, "keyword"],
  [/\b(?:true|false|null|undefined|NaN|Infinity)\b/g, "literal"],
  [/\b(?:console|document|window|fetch|Promise|Array|Object|String|Number|Boolean|Map|Set|JSON|Math|Date|RegExp|Error)\b/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], Mn = [
  [/#.*/g, "comment"],
  [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, "keyword"],
  [/\b(?:True|False|None)\b/g, "literal"],
  [/@\w+/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]():.,;]/g, "punctuation"]
], Xo = {
  json: qr,
  javascript: Qe,
  js: Qe,
  typescript: Qe,
  ts: Qe,
  bash: Bn,
  curl: Bn,
  go: Zo,
  python: Mn,
  py: Mn
};
function Qo(e, t) {
  let n = "", i = 0;
  for (; i < e.length; ) {
    let r = null;
    for (const [a, o] of t) {
      a.lastIndex = i;
      const s = a.exec(e);
      s && (!r || s.index < r.start || s.index === r.start && s[0].length > r.end - r.start) && (r = { start: s.index, end: s.index + s[0].length, cls: o });
    }
    if (!r) {
      n += nt(e.slice(i));
      break;
    }
    r.start > i && (n += nt(e.slice(i, r.start))), n += `<span class="hl-${r.cls}">${nt(e.slice(r.start, r.end))}</span>`, i = r.end;
  }
  return n;
}
function jr(e, t) {
  const n = Xo[t] ?? (hr(e) ? qr : null);
  return n ? Qo(e, n) : nt(e);
}
function es(e, t) {
  const n = t.schema;
  if (t.required && (!e || e.trim() === ""))
    return { valid: !1, message: "Required field" };
  if (!e || e.trim() === "")
    return { valid: !0 };
  if (!n) return { valid: !0 };
  if (n.type === "integer") {
    if (!/^-?\d+$/.test(e.trim()))
      return { valid: !1, message: "Must be an integer" };
    const i = parseInt(e, 10);
    return Pn(i, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const i = parseFloat(e);
    return Pn(i, n);
  }
  if (n.type === "boolean" && !["true", "false", "1", "0"].includes(e.trim().toLowerCase()))
    return { valid: !1, message: "Must be true or false" };
  if (n.enum && n.enum.length > 0 && !n.enum.some((i) => String(i) === e.trim()))
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
function Pn(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function ts(e, t, n, i) {
  if (i && (!e || e.trim() === ""))
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
function ns(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((r) => {
    const a = r.getAttribute("data-param-name"), o = t.parameters.find((l) => l.name === a);
    if (!o) return;
    const s = es(r.value, o);
    s.valid || n.push({ field: a, message: s.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const a = Object.keys(t.requestBody.content || {})[0] || "application/json", o = t.requestBody.content?.[a]?.schema, l = e.querySelector('[data-field="body"]')?.value || "";
    if (!a.includes("multipart")) {
      const u = ts(l, a, o, t.requestBody.required);
      u.valid || n.push({ field: "body", message: u.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function rs(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function is(e, t) {
  for (const n of t) {
    const i = e.querySelector(`[data-error-for="${n.field}"]`);
    if (i && (i.textContent = n.message, i.classList.add("visible")), n.kind === "param") {
      const r = e.querySelector(`[data-param-name="${n.field}"]`);
      r && r.classList.add("invalid");
    } else if (n.kind === "body") {
      const r = e.querySelector('[data-field="body"]');
      r && r.classList.add("invalid");
    }
  }
}
function $r(e) {
  return c("span", { className: "validation-error", "data-error-for": e });
}
function Rn(e) {
  e.style.height = "0", e.style.height = `${e.scrollHeight}px`;
}
function Fn(e, t, n) {
  const i = c("div", { className: "body-editor" }), r = c("pre", { className: "body-highlight" }), a = c("code", {});
  r.append(a);
  const o = c("textarea", {
    className: "textarea-json",
    spellcheck: "false",
    rows: "1",
    ...n?.dataField ? { "data-field": n.dataField } : {}
  });
  o.value = e;
  const s = (l, u) => {
    const d = l.endsWith(`
`) ? l + " " : l || " ";
    a.innerHTML = jr(d, u);
  };
  return s(e, t), o.addEventListener("input", () => {
    s(o.value, t), n?.onInput?.();
  }), i.append(r, o), {
    wrap: i,
    textarea: o,
    setValue: (l, u) => {
      o.value = l, s(l, u ?? t);
    },
    syncLayout: () => {
    }
    // no-op — CSS Grid handles layout
  };
}
const as = 1500;
function He(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", i = re({
    variant: "icon",
    icon: O.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const r = await e.getText();
      await ao(r), i.innerHTML = O.check, i.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        i.innerHTML = O.copy, i.setAttribute("aria-label", t);
      }, as);
    }
  });
  return i;
}
function os(e, t, n, i) {
  D(t), t.classList.add("try-it");
  const r = c("div", { className: "body" }), a = c("div", { className: "block section" });
  a.append(c("h2", { textContent: "Response" }));
  const o = c("div", { "data-response": "true" });
  if (n)
    $t(o, {
      status: parseInt(n.statusCode, 10) || 200,
      statusText: n.statusText || "OK",
      headers: {},
      body: n.body,
      duration: 0,
      size: 0
    });
  else {
    const s = c("div", { className: "placeholder" });
    s.append(c("span", { textContent: "Execute request to see response" })), o.append(s);
  }
  a.append(o), r.append(ss(e, t, {
    onConfigChange: i?.onConfigChange,
    onSendRequest: async (s) => {
      rs(t);
      const l = ns(t, e);
      if (l.length > 0) {
        is(t, l);
        return;
      }
      const u = pe(t, e);
      s.setAttribute("disabled", ""), s.innerHTML = "", s.append(c("span", { className: "spinner spinner-sm" }), c("span", null, "Sending..."));
      try {
        const d = await Ho(u);
        $t(o, d);
      } catch (d) {
        $t(o, {
          status: 0,
          headers: {},
          body: d.message,
          duration: 0,
          size: 0
        });
      } finally {
        s.removeAttribute("disabled"), s.innerHTML = O.send, s.append(c("span", null, "Send Request"));
      }
    }
  })), r.append(a), t.append(r);
}
function ss(e, t, n) {
  const i = n?.onConfigChange, r = e.parameters.filter((A) => A.in === "path"), a = e.parameters.filter((A) => A.in === "query"), o = Ko([...r, ...a]);
  let s = [];
  if (e.requestBody) {
    const A = Object.keys(e.requestBody.content || {})[0] || "application/json";
    if (!A.includes("multipart")) {
      const I = e.requestBody.content?.[A];
      I && (s = Ir(I));
    }
  }
  let l = null;
  const u = "Request", d = jt({
    method: e.method,
    url: "",
    // will be updated
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), p = () => {
    const A = pe(t, e);
    let I;
    return typeof A.body == "string" ? I = A.body : A.body instanceof FormData ? I = "{ /* multipart form-data */ }" : e.requestBody && (I = "{ ... }"), {
      method: A.method,
      url: A.url,
      headers: A.headers || {},
      body: I
    };
  }, m = () => {
    const A = pe(t, e);
    if (typeof A.body == "string") return A.body;
    if (A.body instanceof FormData) {
      const I = [];
      return A.body.forEach((X, ue) => {
        if (X instanceof File) {
          I.push(`${ue}: [File ${X.name}]`);
          return;
        }
        I.push(`${ue}: ${String(X)}`);
      }), I.join(`
`);
    }
    return "";
  }, f = (A, I) => {
    const X = p(), ue = jt(X), ye = ue[I] || ue[0];
    ye && A.setValue(ye.code, ye.language);
  }, h = c("div", { className: "block section tabs-code" }), v = c("div", { className: "body" }), g = c("h2", { textContent: "Request" });
  h.append(g, v);
  const x = b.get(), y = c("div", { className: "card" }), L = c("div", { className: "card-head" }), T = c("div", { className: "tabs tabs-code" }), k = [];
  let E = 0, N = null, q = null, $ = null, S = null;
  {
    const A = pt(u, { active: !0, context: !0 });
    k.push(A), S = c("div", { className: "panel is-request", "data-tab": "first" });
    const I = o.length > 1 && (r.length > 0 || a.length > 0), X = s.length > 1;
    if (I || X) {
      const B = c("div", { className: "params-group" });
      B.append(c("h3", { textContent: "Examples" })), I && B.append(dt({
        options: o.map((j) => ({ value: j.name, label: j.summary || j.name })),
        value: o[0].name,
        ariaLabel: "Select parameter example",
        className: "example-select",
        onChange: (j) => {
          const _ = o.find((ie) => ie.name === j);
          _ && (cs(t, _.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
        }
      })), X && B.append(dt({
        options: s.map((j) => ({ value: j.name, label: Jo(j) })),
        value: s[0].name,
        ariaLabel: "Select body example",
        className: "example-select",
        onChange: (j) => {
          const _ = s.find((ie) => ie.name === j);
          _ && l && (l.setValue($n(_.value), "json"), l.syncLayout(), i?.(pe(t, e)));
        }
      })), S.append(B);
    }
    const ue = c("div", { className: "headers-section" }), ye = c("div", { className: "field-header" });
    ye.append(c("h3", { textContent: "Headers" }));
    const $e = c("div", { className: "headers-list" });
    if (e.requestBody) {
      const j = Object.keys(e.requestBody.content || {})[0] || "application/json";
      $e.append(_e("Content-Type", j));
    }
    if (H(e.resolvedSecurity) && x.spec) {
      const B = an(e.resolvedSecurity, x.spec.securitySchemes), _ = { ...on(e.resolvedSecurity, x.spec.securitySchemes), ...B };
      for (const [ie, Ke] of Object.entries(_))
        $e.append(_e(ie, Ke));
    }
    for (const B of e.parameters.filter((j) => j.in === "header"))
      $e.append(_e(B.name, String(B.example || "")));
    const Hr = re({
      variant: "icon",
      icon: O.plus,
      ariaLabel: "Add header",
      className: "field-copy-btn",
      onClick: () => $e.append(_e("", ""))
    });
    if (ye.append(Hr), ue.append(ye, $e), S.append(ue), r.length > 0 || a.length > 0) {
      const B = c("div", { className: "params-group" });
      if (B.append(c("h3", { textContent: "Parameters" })), r.length > 0) {
        const j = c("div", { className: "params-group" });
        a.length > 0 && j.append(c("h3", { textContent: "Path" }));
        for (const _ of r)
          j.append(Dn(_, o[0]?.values[_.name]));
        B.append(j);
      }
      if (a.length > 0) {
        const j = c("div", { className: "params-group" });
        r.length > 0 && j.append(c("h3", { textContent: "Query" }));
        for (const _ of a)
          j.append(Dn(_, o[0]?.values[_.name]));
        B.append(j);
      }
      S.append(B);
    }
    {
      const B = c("div", { className: "route-preview" }), j = c("div", { className: "field-header" });
      j.append(c("h3", { textContent: "URL" }));
      const _ = He({
        ariaLabel: "Copy URL",
        getText: () => N?.value || pe(t, e).url
      });
      N = ge({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "route-input"
      });
      const ie = c("div", { className: "route-input-row" });
      ie.append(N, _), B.append(j, ie), q = B;
    }
    if (e.requestBody) {
      const B = c("div", { className: "body-section" }), j = c("div", { className: "field-header" });
      j.append(c("h3", { textContent: "Body" }));
      const _ = He({
        ariaLabel: "Copy body",
        className: "field-copy-btn",
        getText: m
      });
      j.append(_), B.append(j);
      const Ke = Object.keys(e.requestBody.content || {})[0] || "application/json", Ur = Ke.includes("multipart"), mn = e.requestBody.content?.[Ke];
      if (Ur && mn?.schema) {
        const Be = c("div", { className: "multipart", "data-field": "multipart" }), Je = mn.schema, Me = Je.properties || {}, zr = Je.required || [];
        for (const [Pe, be] of Object.entries(Me)) {
          const Wr = be.format === "binary" || be.format === "base64" || be.type === "string" && be.format === "binary", hn = zr.includes(Pe), Ct = c("div", { className: `params row${hn ? " is-required" : ""}` }), wt = c("span", { className: "label", textContent: Pe });
          if (hn && wt.append(Br()), Wr) {
            const St = c("input", {
              type: "file",
              "data-multipart-field": Pe,
              "data-multipart-type": "file"
            });
            Ct.append(wt, St);
          } else {
            const St = ge({
              placeholder: be.description || Pe,
              value: be.default !== void 0 ? String(be.default) : "",
              dataAttrs: { multipartField: Pe, multipartType: "text" }
            });
            Ct.append(wt, St);
          }
          Be.append(Ct);
        }
        B.append(Be);
      } else {
        const Be = s[0], Je = Be ? $n(Be.value) : "", Me = Fn(Je, "json", {
          dataField: "body",
          onInput: () => i?.(pe(t, e))
        });
        l = Me, $ = Me.syncLayout, B.append(Me.wrap);
      }
      B.append($r("body")), S.append(B);
    }
  }
  const W = p(), le = jt(W), G = Fn(
    le[0]?.code ?? "",
    le[0]?.language
  ), U = c("div", { className: "panel", "data-tab": "lang" }), ve = c("div", { className: "body-section" }), xt = c("div", { className: "field-header" });
  xt.append(c("h3", { textContent: "Code Example" }));
  const _r = He({
    ariaLabel: "Copy code",
    className: "field-copy-btn",
    getText: () => G.textarea.value
  });
  xt.append(_r), ve.append(xt, G.wrap), U.append(ve);
  for (let A = 0; A < d.length; A++) {
    const I = d[A], X = pt(I.label, { active: !u });
    k.push(X);
  }
  L.append(T);
  const Dr = S ? [S, U] : [U], Ge = (A, I) => {
    if (!I) {
      A.style.display = "none";
      return;
    }
    A.style.display = A.classList.contains("is-request") ? "flex" : "block";
  };
  for (let A = 0; A < k.length; A++) {
    T.append(k[A]);
    const I = A;
    k[A].addEventListener("click", () => {
      k.forEach((X) => X.classList.remove("is-active")), k[I].classList.add("is-active"), E = I, S && Ge(S, I === 0), Ge(U, I !== 0), I === 0 && $?.(), I > 0 && f(G, I - 1);
    });
  }
  const pn = c("div", { className: "card-content flush" }), fn = c("div", { className: "panels" });
  if (S && Ge(S, !0), Ge(U, !1), fn.append(...Dr), pn.append(fn), n?.onSendRequest) {
    const A = re({
      variant: "primary",
      icon: O.send,
      label: "Send Request",
      className: "send-btn"
    });
    A.addEventListener("click", () => n.onSendRequest(A));
    {
      q && S?.append(q);
      const I = c("div", { className: "send-inline" });
      I.append(A), S?.append(I);
    }
  }
  !n?.onSendRequest && u && q && S?.append(q), y.append(L, pn), v.append(y);
  const kt = () => {
    N && (N.value = pe(t, e).url), i?.(pe(t, e)), (E > 0 || !u) && f(G, E - 1);
  };
  return t.addEventListener("input", kt), t.addEventListener("change", kt), kt(), $?.(), h;
}
function _n(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function cs(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((i) => {
    const r = i.getAttribute("data-param-name");
    r && t[r] !== void 0 && (i.value = t[r]);
  });
}
function Dn(e, t) {
  const n = c("div", { className: `params row${e.required ? " is-required" : ""}` }), i = c("span", {
    className: "label",
    textContent: e.name
  });
  e.required && i.append(Br());
  const r = e.schema;
  let a;
  if (r?.enum && r.enum.length > 0) {
    const s = e.required ? r.enum.map((u) => ({ value: String(u), label: String(u) })) : [{ value: "", label: "— select —" }, ...r.enum.map((u) => ({ value: String(u), label: String(u) }))];
    a = dt({
      options: s,
      value: _n(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const s = r?.type === "integer" || r?.type === "number" ? "number" : "text", l = ge({
      type: s,
      placeholder: e.description || e.name,
      value: _n(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    r?.type === "integer" && l.setAttribute("step", "1"), r?.minimum !== void 0 && l.setAttribute("min", String(r.minimum)), r?.maximum !== void 0 && l.setAttribute("max", String(r.maximum)), a = l;
  }
  const o = $r(e.name);
  return n.append(i, a, o), n;
}
function Br() {
  return c("span", {
    className: "required-star",
    textContent: "*",
    "aria-hidden": "true"
  });
}
function _e(e, t) {
  const n = c("div", { className: "header-row" }), i = ge({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), r = ge({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), a = re({
    variant: "icon",
    icon: O.close,
    ariaLabel: "Remove header",
    onClick: () => n.remove()
  });
  return n.append(i, r, a), n;
}
function pe(e, t) {
  const n = b.get(), i = yt(n), r = e.querySelectorAll('[data-param-in="path"]'), a = {};
  r.forEach((f) => {
    a[f.getAttribute("data-param-name")] = f.value;
  });
  const o = e.querySelectorAll('[data-param-in="query"]'), s = {};
  if (o.forEach((f) => {
    const h = f.getAttribute("data-param-name");
    f.value && (s[h] = f.value);
  }), n.spec && H(t.resolvedSecurity)) {
    const f = Co(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [h, v] of Object.entries(f))
      h in s || (s[h] = v);
  }
  const l = e.querySelectorAll(".header-row"), u = {};
  if (l.forEach((f) => {
    const h = f.querySelector("[data-header-name]"), v = f.querySelector("[data-header-value]");
    h?.value && v?.value && (u[h.value] = v.value);
  }), n.spec && H(t.resolvedSecurity)) {
    const f = wo(t.resolvedSecurity, n.spec.securitySchemes), h = Object.entries(f).map(([v, g]) => `${v}=${g}`);
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
      const g = v.getAttribute("data-multipart-field"), x = v.getAttribute("data-multipart-type");
      x === "file" && v.files && v.files.length > 0 ? f.append(g, v.files[0]) : x === "text" && v.value && f.append(g, v.value);
    }), p = f, delete u["Content-Type"];
  } else
    p = e.querySelector('[data-field="body"]')?.value || void 0;
  const m = zo(i, t.path, a, s);
  return { method: t.method, url: m, headers: u, body: p };
}
function $t(e, t) {
  D(e);
  const n = c("div", { className: "card" }), i = c("div", { className: "card-head response-header" }), r = pt("Body", { active: !0 }), a = pt(`Headers (${Object.keys(t.headers).length})`), o = c("div", { className: "tabs tabs-code" });
  o.append(r, a);
  const s = c("div", {
    className: "meta",
    innerHTML: `<span>${so(t.duration)}</span><span>${oo(t.size)}</span>`
  }), l = w({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), u = He({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => us("Response copied")
  });
  i.append(o, s, l, u), n.append(i);
  const d = c("div", { className: "card-content flush" }), p = c("div", { className: "response-pane" }), m = c("div", { className: "pane-inner" }), f = c("pre", { className: "code-display" }), h = c("code", {}), v = ls(t.body);
  h.innerHTML = jr(v, hr(v) ? "json" : ""), f.append(h), m.append(f), p.append(m);
  const g = c("div", { className: "response-pane", style: "display:none" }), x = c("div", { className: "pane-inner" }), y = c("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false"
  });
  y.value = Object.entries(t.headers).map(([L, T]) => `${L}: ${T}`).join(`
`), Rn(y), x.append(y), g.append(x), d.append(p, g), n.append(d), r.addEventListener("click", () => {
    r.classList.add("is-active"), a.classList.remove("is-active"), p.style.display = "block", g.style.display = "none";
  }), a.addEventListener("click", () => {
    a.classList.add("is-active"), r.classList.remove("is-active"), p.style.display = "none", g.style.display = "block", requestAnimationFrame(() => Rn(y));
  }), e.append(n);
}
function ls(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function us(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = c("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
function Ft(e) {
  const { prev: t, next: n } = ds(e);
  if (!t && !n) return null;
  const i = c("div", {
    className: `route-nav${!t || !n ? " is-single" : ""}`
  });
  return t && i.append(Hn(t, "previous")), n && i.append(Hn(n, "next")), i;
}
function Hn(e, t) {
  const n = F(e.route), i = c("a", {
    className: `card interactive route-card ${t === "previous" ? "is-prev" : "is-next"}`,
    href: n
  }), r = c("div", { className: "route-meta" });
  e.kind === "endpoint" ? (r.append(w({
    text: e.operation.method.toUpperCase(),
    kind: "method",
    method: e.operation.method
  })), r.append(c("span", { className: "route-path", textContent: e.operation.path }))) : (r.append(w({
    text: "WEBHOOK",
    kind: "webhook",
    size: "s"
  })), r.append(w({
    text: e.webhook.method.toUpperCase(),
    kind: "method",
    method: e.webhook.method
  })));
  const a = c("span", { className: "route-side", "aria-hidden": "true" });
  a.innerHTML = t === "previous" ? O.chevronLeft : O.chevronRight;
  const o = c("div", { className: "route-main" });
  return o.append(
    c("span", { className: "route-category", textContent: e.category }),
    c("span", { className: "route-title", textContent: e.title }),
    r
  ), t === "previous" ? i.append(a, o) : i.append(o, a), i.addEventListener("click", (s) => {
    s.preventDefault(), R(n);
  }), i;
}
function ds(e) {
  if (!b.get().spec) return { prev: null, next: null };
  const n = ps();
  if (n.length === 0) return { prev: null, next: null };
  const i = fs(n, e);
  return i < 0 ? { prev: null, next: null } : {
    prev: i > 0 ? n[i - 1] : null,
    next: i < n.length - 1 ? n[i + 1] : null
  };
}
function ps() {
  const e = b.get().spec;
  if (!e) return [];
  const t = [], n = /* @__PURE__ */ new Set();
  for (const i of e.tags)
    for (const r of i.operations) {
      const a = `${r.method.toLowerCase()} ${r.path}`;
      n.has(a) || (n.add(a), t.push({
        kind: "endpoint",
        route: {
          type: "endpoint",
          tag: i.name,
          method: r.method,
          path: r.path,
          operationId: r.operationId
        },
        operation: r,
        title: r.summary || r.path,
        category: i.name
      }));
    }
  for (const i of e.webhooks || [])
    t.push({
      kind: "webhook",
      route: { type: "webhook", webhookName: i.name },
      webhook: i,
      title: i.summary || i.name,
      category: "Webhooks"
    });
  return t;
}
function fs(e, t) {
  if (t.type === "endpoint") {
    if (t.operationId) {
      const n = e.findIndex(
        (i) => i.kind === "endpoint" && i.route.operationId === t.operationId
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
async function ms(e, t, n) {
  D(e), D(t);
  const i = t.parentElement;
  i && (i.setAttribute("aria-label", "Try It"), i.classList.add("try-it"));
  const r = b.get(), a = lo(r), o = vr(r), s = a + (n.path.startsWith("/") ? "" : "/") + n.path, l = [], u = w({
    text: n.method.toUpperCase(),
    kind: "method",
    method: n.method,
    size: "m"
  });
  l.push({
    label: o || r.spec?.info.title || "Home",
    href: "/",
    className: "breadcrumb-item",
    onClick: (S) => {
      S.preventDefault(), R("/");
    }
  });
  const d = new Set((r.spec?.tags || []).map((S) => S.name.toLowerCase())), p = (n.path || "/").split("/").filter(Boolean);
  for (const S of p) {
    const W = S.startsWith("{") && S.endsWith("}"), le = !W && d.has(S.toLowerCase()), G = r.spec?.tags.find((U) => U.name.toLowerCase() === S.toLowerCase());
    le && G ? l.push({
      label: S,
      href: F({ type: "tag", tag: G.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (U) => {
        U.preventDefault(), R(F({ type: "tag", tag: G.name }));
      }
    }) : l.push({
      label: S,
      className: W ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const m = He({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${s}`
  }), f = Qt(l, {
    leading: [u],
    trailing: [m]
  }), h = c("div", { className: "block header" });
  h.append(c("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.description && h.append(c("p", { textContent: n.description }));
  const v = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  v.append(f), h.append(v);
  const g = c("div", { className: "endpoint-meta-row" });
  if (n.deprecated) {
    const S = c("span", { className: "icon-muted" });
    S.innerHTML = O.warning, g.append(c("span", { className: "endpoint-meta deprecated" }, S, "Deprecated"));
  }
  if (H(n.resolvedSecurity)) {
    const S = Ns(r, n), W = Kn(n.resolvedSecurity) || "Auth required", le = en({
      configured: S,
      variant: "endpoint",
      title: ze(n.resolvedSecurity)
    }), G = c("span", {
      className: `endpoint-meta auth${S ? " is-active" : " is-missing"}`,
      "aria-label": ze(n.resolvedSecurity),
      role: "button",
      tabindex: "0"
    }, le, W);
    G.classList.add("endpoint-auth-trigger", "focus-ring"), G.addEventListener("click", () => {
      const U = b.get().spec;
      if (!U || !Object.keys(U.securitySchemes || {}).length) return;
      const ve = e.closest(".root") ?? void 0;
      tn(U.securitySchemes, ve, As(n, r));
    }), G.addEventListener("keydown", (U) => {
      const ve = U.key;
      ve !== "Enter" && ve !== " " || (U.preventDefault(), G.click());
    }), g.append(G);
  }
  g.childElementCount > 0 && h.append(g), e.append(h);
  const x = n.parameters.filter((S) => S.in !== "cookie"), y = J({ title: "Request" }), L = gs(n, x);
  if (L)
    y.append(L);
  else {
    const S = c("div", { className: "params empty", textContent: "No parameters or request body required" });
    y.append(S);
  }
  e.append(y);
  let T = !1;
  Object.keys(n.responses).length > 0 && (e.append(Cs(n)), T = !0);
  const k = {
    type: "endpoint",
    method: n.method,
    path: n.path,
    operationId: n.operationId
  }, E = Ft(k), N = Ft(k), q = () => {
    if (E && e.append(c("div", { className: "route-nav-wrap is-desktop" }, E)), N) {
      const S = e.closest(".page");
      S && S.append(c("div", { className: "route-nav-wrap is-mobile" }, N));
    }
  };
  T && q(), n.callbacks && n.callbacks.length > 0 && e.append(ws(n)), T || q();
  const $ = Ss(n);
  os(n, t, $);
}
let hs = 0;
function gs(e, t) {
  const n = t.filter((u) => u.in === "path"), i = t.filter((u) => u.in === "query"), r = vs(e), a = bs(e);
  if (n.length === 0 && i.length === 0 && r.length === 0 && !a)
    return null;
  const o = ce(), s = bt(), l = c("div", { className: "collapsible-categories" });
  if (n.length > 0) {
    const u = Le({
      title: "Path",
      content: Un(n),
      counter: n.length
    });
    l.append(u.root);
  }
  if (i.length > 0) {
    const u = Le({
      title: "Query",
      content: Un(i),
      counter: i.length
    });
    l.append(u.root);
  }
  if (r.length > 0) {
    const u = Le({
      title: "Headers",
      content: ys(r),
      counter: r.length
    });
    l.append(u.root);
  }
  if (a) {
    const u = Le({
      title: "Body",
      content: a.content,
      trailing: a.trailing,
      counter: a.counter
    });
    l.append(u.root);
  }
  return s.append(l), o.append(s), o;
}
function Un(e) {
  const t = e.map((r) => {
    const a = c("div", { className: "schema-row role-flat role-params" }), o = c("div", { className: "schema-main-row" }), s = c("div", { className: "schema-name-wrapper" });
    s.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: r.name })
    );
    const l = c("div", { className: "schema-meta-wrapper" });
    l.append(w({
      text: r.schema ? je(r.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), r.required && l.append(w({ text: "required", kind: "required", size: "m" })), o.append(s, l), a.append(o);
    const u = c("div", { className: "schema-desc-col is-root" });
    r.description && u.append(c("p", { textContent: r.description }));
    const d = r.schema?.enum, p = r.schema?.default !== void 0;
    if (d && d.length > 0 || p) {
      const m = c("div", { className: "schema-enum-values" });
      if (p && m.append(w({
        text: `Default: ${JSON.stringify(r.schema.default)}`,
        kind: "chip",
        size: "s"
      })), d)
        for (const f of d) {
          const h = String(f);
          h !== r.in && m.append(w({ text: h, kind: "chip", size: "s" }));
        }
      u.append(m);
    }
    return u.children.length > 0 && a.append(u), a;
  }), n = c("div", { className: "params" }), i = c("div", { className: "body role-params" });
  return i.append(...t), n.append(i), n;
}
function vs(e) {
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
  if (H(e.resolvedSecurity)) {
    const n = b.get().spec, i = n ? an(e.resolvedSecurity, n.securitySchemes) : {}, a = { ...n ? on(e.resolvedSecurity, n.securitySchemes) : {}, ...i };
    for (const [o, s] of Object.entries(a))
      t.push({
        name: o,
        value: s,
        description: "Authentication header value",
        required: !0
      });
  }
  for (const n of e.parameters.filter((i) => i.in === "header"))
    t.push({
      name: n.name,
      value: String(n.schema?.default ?? n.example ?? ""),
      description: n.description,
      required: n.required
    });
  return t;
}
function ys(e) {
  const t = e.map((r) => {
    const a = c("div", { className: "schema-row role-flat role-headers" }), o = c("div", { className: "schema-main-row" }), s = c("div", { className: "schema-name-wrapper" });
    s.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: r.name })
    );
    const l = c("div", { className: "schema-meta-wrapper" });
    r.required && l.append(w({ text: "required", kind: "required", size: "m" })), o.append(s, l), a.append(o);
    const u = c("div", { className: "schema-desc-col is-root" });
    r.description && u.append(c("p", { textContent: r.description }));
    const d = c("div", { className: "schema-enum-values" });
    return d.append(w({
      text: r.value || "—",
      kind: "chip",
      size: "s"
    })), u.append(d), u.children.length > 0 && a.append(u), a;
  }), n = c("div", { className: "params" }), i = c("div", { className: "body role-headers" });
  return i.append(...t), n.append(i), n;
}
function bs(e) {
  const t = c("div", { className: "request-body-wrap" }), n = Object.entries(e.requestBody?.content || {});
  if (e.requestBody?.description && t.append(c("p", { textContent: e.requestBody.description })), n.length === 0)
    return t.childElementCount > 0 ? { content: t } : null;
  const i = n.map(([a, o]) => Mr(a, o, "No schema"));
  if (i.length === 1) {
    const a = i[0];
    return t.append(a.content), { content: t, trailing: Pr(a), counter: a.itemsCount };
  }
  const r = c("div", { className: "schema-media-list" });
  for (const a of i) {
    const o = c("div", { className: "schema-media-header" });
    o.append(
      w({ text: a.contentType, kind: "chip", size: "s" }),
      w({ text: a.schemaType, kind: "chip", color: "primary", size: "s" })
    );
    const s = c("div", { className: "schema-media-item" });
    s.append(o, a.content), r.append(s);
  }
  return t.append(r), {
    content: t,
    counter: i.length
  };
}
function Mr(e, t, n) {
  if (t?.schema)
    return {
      content: Ro(t.schema).body,
      contentType: e,
      schemaType: je(t.schema),
      itemsCount: xs(t.schema)
    };
  const i = c("div", { className: "schema" }), r = c("div", { className: "body" });
  return r.append(c("p", { textContent: n })), i.append(r), {
    content: i,
    contentType: e,
    schemaType: "plain",
    itemsCount: 1
  };
}
function Pr(e) {
  const t = c("span", { className: "schema-content-meta" });
  return t.append(
    w({ text: e.contentType, kind: "chip", size: "s" }),
    w({ text: e.schemaType, kind: "chip", color: "primary", size: "s" })
  ), t;
}
function xs(e) {
  let t = 0;
  return e.properties && (t += Object.keys(e.properties).length), e.type === "array" && e.items && (t += 1), Array.isArray(e.allOf) && (t += e.allOf.length), Array.isArray(e.oneOf) && (t += e.oneOf.length), Array.isArray(e.anyOf) && (t += e.anyOf.length), e.additionalProperties && typeof e.additionalProperties == "object" && (t += 1), Math.max(t, 1);
}
function Le(e) {
  const t = `collapsible-category-${hs++}`, n = c("div", { className: "collapsible-category" }), i = c("span", { className: "collapsible-category-title", textContent: e.title }), r = c("span", { className: "collapsible-category-meta" });
  e.trailing && r.append(c("span", { className: "collapsible-category-trailing" }, e.trailing));
  const a = c("span", { className: "collapsible-category-controls" });
  e.counter !== void 0 && a.append(w({ text: String(e.counter), kind: "chip", size: "s" }));
  const o = c("span", { className: "collapsible-category-chevron", innerHTML: O.chevronDown });
  a.append(o), r.append(a);
  const s = c("button", {
    className: "collapsible-category-toggle focus-ring",
    type: "button",
    "aria-expanded": "true",
    "aria-controls": t
  }, i, r), l = c("div", {
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
function ks(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([a, o]) => {
    const s = o.schema ? je(o.schema) : "string", l = o.example !== void 0 ? String(o.example) : o.schema?.example !== void 0 ? String(o.schema.example) : "—", u = c("div", { className: "schema-row role-flat role-headers" }), d = c("div", { className: "schema-main-row" }), p = c("div", { className: "schema-name-wrapper" });
    p.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: a })
    );
    const m = c("div", { className: "schema-meta-wrapper" });
    m.append(w({ text: s, kind: "chip", color: "primary", size: "m" })), o.required && m.append(w({ text: "required", kind: "required", size: "m" })), d.append(p, m), u.append(d);
    const f = c("div", { className: "schema-desc-col is-root" });
    o.description && f.append(c("p", { textContent: o.description }));
    const h = c("div", { className: "schema-enum-values" });
    return h.append(w({
      text: l,
      kind: "chip",
      size: "s"
    })), f.append(h), f.children.length > 0 && u.append(f), u;
  }), i = c("div", { className: "params" }), r = c("div", { className: "body role-headers" });
  return r.append(...n), i.append(r), i;
}
function zn(e) {
  const t = c("div", { className: "collapsible-categories" });
  if (e.headers) {
    const i = Le({
      title: "Headers",
      content: e.headers,
      counter: e.headersCount
    });
    t.append(i.root);
  }
  const n = Le({
    title: "Body",
    content: e.body.content,
    trailing: Pr(e.body),
    counter: e.body.itemsCount
  });
  return t.append(n.root), t;
}
function Cs(e) {
  const t = J({
    titleEl: Xt("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const i = ce(), r = c("div", { className: "card-row responses-header-row" }), a = c("div", { className: "tabs-code codes" });
  let o = n[0][0];
  const s = /* @__PURE__ */ new Map();
  for (const [p, m] of n) {
    const f = ho(p, p === o), h = m.content && Object.keys(m.content)[0] || "application/json", v = m.content?.[h], g = Mr(h, v, m.description || "No schema"), x = m.headers ? ks(m.headers) : null;
    s.set(p, {
      body: g,
      headers: x,
      headersCount: m.headers ? Object.keys(m.headers).length : 0
    }), a.append(f), f.addEventListener("click", () => {
      a.querySelectorAll('[data-badge-group="response-code"]').forEach((L) => An(L, !1)), An(f, !0), o = p;
      const y = s.get(p);
      u.innerHTML = "", u.append(zn(y));
    });
  }
  r.append(a), i.append(Zt(r));
  const l = bt(), u = c("div"), d = s.get(o);
  return d && u.append(zn(d)), l.append(u), i.append(l), t.append(i), t;
}
function ws(e) {
  const t = J({
    titleEl: Xt("Callbacks", w({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const i = c("div", { className: "callback-block" });
    i.append(c("div", { className: "callback-name", textContent: n.name }));
    for (const r of n.operations) {
      const a = c("div", { className: "callback-operation" }), o = c("div", { className: "callback-op-header" });
      if (o.append(
        w({
          text: r.method.toUpperCase(),
          kind: "method",
          method: r.method
        }),
        c("span", { className: "callback-op-path", textContent: r.path })
      ), a.append(o), r.summary && a.append(c("div", { className: "callback-op-summary", textContent: r.summary })), r.description && a.append(c("p", { textContent: r.description })), r.requestBody) {
        const s = r.requestBody.content || {};
        for (const [l, u] of Object.entries(s))
          u.schema && a.append(Ve(u.schema, `${l} — Request Body`));
      }
      if (Object.keys(r.responses).length > 0)
        for (const [s, l] of Object.entries(r.responses)) {
          const u = c("div", { className: "callback-response-row" });
          if (u.append(w({
            text: s,
            kind: "status",
            statusCode: s
          })), l.description && u.append(c("p", { textContent: l.description })), l.content)
            for (const [d, p] of Object.entries(l.content))
              p.schema && u.append(Ve(p.schema, `${d}`));
          a.append(u);
        }
      i.append(a);
    }
    t.append(i);
  }
  return t;
}
function Ss(e) {
  const t = Object.keys(e.responses).sort((n, i) => {
    const r = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, a = i.startsWith("2") ? 0 : i.startsWith("4") ? 1 : 2;
    return r - a || n.localeCompare(i);
  });
  for (const n of t) {
    const i = e.responses[n];
    if (!i?.content) continue;
    const r = Object.keys(i.content)[0] || "application/json", a = i.content[r], s = (a ? Ir(a) : [])[0];
    if (s && s.value !== void 0) {
      const l = typeof s.value == "string" ? s.value : JSON.stringify(s.value, null, 2), u = i.description || (n.startsWith("2") ? "OK" : n.startsWith("4") ? "Not Found" : "Error");
      return { statusCode: n, statusText: u, body: l };
    }
    if (a?.example !== void 0) {
      const l = typeof a.example == "string" ? a.example : JSON.stringify(a.example, null, 2);
      return { statusCode: n, statusText: i.description || "OK", body: l };
    }
  }
  return null;
}
function Ns(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!H(t.resolvedSecurity)) return !1;
  const i = (e.auth.token || "").trim(), r = e.auth.schemes || {}, a = e.auth.activeScheme, o = (s) => String(r[s] || "").trim() ? !0 : i ? !a || a === s : !1;
  return n.some((s) => {
    const l = s.map((u) => u.schemeName);
    return l.length === 0 ? !0 : l.every((u) => o(u));
  });
}
function As(e, t) {
  return (e.resolvedSecurity?.requirements || [])[0]?.[0]?.schemeName || t.auth.activeScheme || void 0;
}
function Es(e, t, n) {
  D(e);
  const i = b.get().spec;
  if (!i) return;
  const r = Z(n), a = i.tags.find((g) => g.name === n) || i.tags.find((g) => Z(g.name) === r);
  if (!a || a.operations.length === 0) {
    const g = c("div", { className: "block header" });
    g.append(c("h1", { textContent: "Tag not found" })), e.append(g), e.append(J(
      { title: "Details" },
      c("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const o = c("div", { className: "block header" });
  o.append(c("h1", { textContent: a.name }));
  const s = b.get(), l = vr(s), u = Qt([
    {
      label: l || i.info.title || "Home",
      href: "/",
      className: "breadcrumb-item",
      onClick: (g) => {
        g.preventDefault(), R("/");
      }
    },
    { label: a.name, className: "breadcrumb-current" }
  ], {
    className: "breadcrumb-tag-page",
    leading: [w({ text: "Category", kind: "chip", size: "m" })]
  }), d = c("div", { className: "breadcrumb-wrap" });
  d.append(u), o.append(d), a.description && o.append(c("p", { textContent: a.description })), e.append(o);
  const p = Ls(a), m = a.operations.filter((g) => H(g.resolvedSecurity)).length, f = a.operations.filter((g) => g.deprecated).length;
  e.append(J(
    { className: "summary" },
    Ar(
      [
        { label: "Endpoints", value: a.operations.length },
        { label: "Auth Required", value: m },
        { label: "Deprecated", value: f }
      ],
      p
    )
  ));
  const h = J({ title: "Endpoints" }), v = b.get().route;
  for (const g of a.operations) {
    const x = {
      type: "endpoint",
      tag: a.name,
      method: g.method,
      path: g.path,
      operationId: g.operationId
    }, y = v.type === "endpoint" && (v.operationId && v.operationId === g.operationId || v.method === g.method && v.path === g.path), L = ce({
      interactive: !0,
      active: y,
      className: `card-group${g.deprecated ? " deprecated" : ""}`,
      onClick: () => R(F(x))
    }), T = c("div", { className: "card-badges" });
    T.append(w({ text: g.method.toUpperCase(), kind: "method", method: g.method, size: "m" })), H(g.resolvedSecurity) && T.append(en({
      configured: rn(g.resolvedSecurity, i.securitySchemes || {}),
      variant: "tag",
      title: ze(g.resolvedSecurity)
    }));
    const k = c("div", { className: "card-group-top" });
    k.append(c("h3", { className: "card-group-title" }, c("code", { textContent: g.path })), T);
    const E = g.summary || g.operationId ? c("p", { className: "card-group-description", textContent: g.summary || g.operationId }) : null;
    L.append(k), E && L.append(E), h.append(L);
  }
  e.append(h);
}
function Ls(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function Os(e, t) {
  D(e);
  const n = w({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), i = w({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), r = Qt(
    [
      {
        label: "Overview",
        href: "/",
        className: "breadcrumb-item",
        onClick: (u) => {
          u.preventDefault(), R("/");
        }
      },
      { label: t.name, className: "breadcrumb-segment" }
    ],
    { leading: [n, i] }
  ), a = c("div", { className: "block header" });
  t.summary ? a.append(c("h1", { textContent: t.summary })) : a.append(c("h1", { textContent: t.name }));
  const o = c("div", { className: "breadcrumb-wrap" });
  o.append(r), a.append(o), t.description && a.append(c("p", { textContent: t.description })), e.append(a);
  const s = t.parameters.filter((u) => u.in !== "cookie");
  if (s.length > 0) {
    const u = J({ title: "Parameters" }, Ts(s));
    e.append(u);
  }
  if (t.requestBody) {
    const u = J({ title: "Webhook Payload" });
    t.requestBody.description && u.append(c("p", { textContent: t.requestBody.description }));
    const d = t.requestBody.content || {};
    for (const [p, m] of Object.entries(d))
      if (m.schema) {
        const f = xr({ title: "Body" });
        f.append(w({
          text: p,
          kind: "chip",
          size: "s"
        })), u.append(Ve(m.schema, f));
      }
    e.append(u);
  }
  if (Object.keys(t.responses).length > 0) {
    const u = J({ title: "Expected Responses" });
    for (const [d, p] of Object.entries(t.responses)) {
      const m = c("div", { className: "response-block" });
      if (m.append(w({
        text: d,
        kind: "status",
        statusCode: d
      })), p.description && m.append(c("p", { textContent: p.description })), p.content)
        for (const [f, h] of Object.entries(p.content))
          h.schema && m.append(Ve(h.schema, `${f} — Schema`));
      u.append(m);
    }
    e.append(u);
  }
  const l = Ft({ type: "webhook", webhookName: t.name });
  l && e.append(c("div", { className: "block section" }, l));
}
function Ts(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, i = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Fo(e, { headerTitle: i, withEnumAndDefault: !1 });
}
function Is() {
  const e = c("div", { className: "page" }), t = c("div", {
    className: "main",
    role: "main"
  }), n = c("div", { className: "content" });
  t.append(n);
  const i = c("div", {
    className: "aside",
    "aria-label": "Panel"
  }), r = c("div", { className: "content" });
  return i.append(r), i.hidden = !0, e.append(t, i), { page: e, main: n, aside: r };
}
function ee(e, t) {
  const n = e.querySelector(".aside");
  n && (n.hidden = !t);
}
function et(e) {
  const { title: t, message: n, icon: i, variant: r = "empty" } = e;
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
  const a = c("div", { className: "block header" });
  return i && a.append(c("span", { innerHTML: i, className: "icon-muted" })), a.append(c("h2", { textContent: t })), n && a.append(c("p", { className: "error-message", textContent: n })), a;
}
let oe = null, Q = null, sn = null, cn = null, ln = null, at = null, ot = !1, tt = "", Oe = null;
const qs = 991;
function js(e, t) {
  oe = c("div", { className: "root" });
  const n = {
    primaryColor: t.primaryColor
  };
  Nn(oe, b.get().theme, n);
  const i = c("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  i.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', i.addEventListener("click", () => {
    b.set({ sidebarOpen: !0 }), Q?.classList.remove("collapsed");
  }), Q = c("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: r, main: a, aside: o } = Is();
  sn = r, cn = a, ln = o, oe.append(i, Q, r), e.append(oe), Ms(), b.subscribe((s) => {
    oe && (Nn(oe, s.theme, n), Q?.classList.toggle("collapsed", !s.sidebarOpen), i.classList.toggle("visible", !s.sidebarOpen), Wn(s, t));
  }), Q?.classList.toggle("collapsed", !b.get().sidebarOpen), i.classList.toggle("visible", !b.get().sidebarOpen), Wn(b.get(), t);
}
function $s() {
  Oe?.(), Oe = null, oe && (oe.remove(), oe = null, Q = null, sn = null, cn = null, ln = null, at = null, ot = !1);
}
async function Wn(e, t) {
  const n = !!e.spec;
  Q && n ? (ot ? Ao(Q, e.route) : Ln(Q, t), ot = !0) : ot = !1;
  const i = cn, r = ln, a = sn;
  if (!i || !r || !a) return;
  if (e.loading) {
    ee(a, !1), D(r), Re(i, et({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const m = i.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (e.error) {
    ee(a, !1), D(r), Re(i, et({
      title: "Failed to load API specification",
      message: e.error,
      icon: O.warning,
      variant: "error"
    }));
    const m = i.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (!e.spec) return;
  const o = e.route, s = `${e.activeEnvironment}|${e.auth.token}`, l = !!(at && Ps(at, o)), u = l && tt !== s, d = i.parentElement, p = d ? d.scrollTop : 0;
  if (!(l && tt === s)) {
    switch (u && (tt = s, Bs(a, e), Q && e.spec && Ln(Q, t)), at = { ...o }, tt = s, a.querySelectorAll(":scope > .route-nav-wrap").forEach((m) => m.remove()), D(i), D(r), o.type) {
      case "overview":
        ee(a, !1), jn(i);
        break;
      case "tag": {
        ee(a, !1), Es(i, r, o.tag || "");
        break;
      }
      case "endpoint": {
        const m = Rr(e, o);
        if (m)
          ee(a, !0), await ms(i, r, m);
        else {
          ee(a, !1);
          const f = o.operationId ? o.operationId : `${o.method?.toUpperCase() || ""} ${o.path || ""}`.trim();
          Re(i, et({
            title: "Endpoint not found",
            message: f || "Unknown endpoint",
            variant: "empty"
          }));
        }
        break;
      }
      case "schema": {
        const m = e.spec.schemas[o.schemaName || ""];
        if (m) {
          ee(a, !1);
          const f = c("div", { className: "block header" });
          f.append(c("h1", { textContent: o.schemaName || "" })), m.description && f.append(c("p", { textContent: String(m.description) }));
          const h = c("div", { className: "block section" });
          h.append(Ve(m, "Properties")), Re(i, f, h);
        }
        break;
      }
      case "webhook": {
        const m = e.spec.webhooks?.find((f) => f.name === o.webhookName);
        m ? (ee(a, !1), Os(i, m)) : (ee(a, !1), Re(i, et({
          title: "Webhook not found",
          message: o.webhookName || "",
          variant: "empty"
        })));
        break;
      }
      default:
        ee(a, !1), jn(i);
    }
    d && (d.scrollTop = u ? p : 0);
  }
}
function Bs(e, t, n) {
  const i = yt(t), r = Kt(i), a = e.querySelector(".breadcrumb-item");
  if (a && (a.textContent = r || t.spec?.info.title || "Home"), t.route.type !== "endpoint" || !t.spec) return;
  const o = e.querySelector(".aside.try-it .content"), s = Rr(t, t.route);
  if (s && H(s.resolvedSecurity) && o) {
    const l = o.querySelector(".headers-list");
    if (l) {
      const u = ["Authorization", "Cookie"];
      Array.from(l.querySelectorAll(".header-row")).filter((x) => {
        const y = x.querySelector("[data-header-name]");
        return y && u.includes(y.value);
      }).forEach((x) => x.remove());
      const m = an(s.resolvedSecurity, t.spec.securitySchemes), h = { ...on(s.resolvedSecurity, t.spec.securitySchemes), ...m }, v = Array.from(l.querySelectorAll(".header-row")), g = v.find((x) => {
        const y = x.querySelector("[data-header-name]");
        return y && y.value === "Content-Type";
      }) || v[0];
      for (const [x, y] of Object.entries(h).reverse()) {
        const L = _e(x, y);
        g ? g.insertAdjacentElement("beforebegin", L) : l.prepend(L);
      }
    }
  }
  o && s && o.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function Rr(e, t) {
  if (!e.spec || t.type !== "endpoint") return null;
  if (t.operationId) {
    const a = e.spec.operations.find((o) => o.operationId === t.operationId);
    if (a) return a;
  }
  const n = (t.method || "").toLowerCase();
  if (!n) return null;
  const i = t.path || "", r = e.spec.operations.filter(
    (a) => a.method.toLowerCase() === n && a.path === i
  );
  if (r.length === 0) return null;
  if (r.length === 1) return r[0];
  if (t.tag) {
    const a = Z(t.tag), o = r.find(
      (s) => s.tags.some((l) => Z(l) === a)
    );
    if (o) return o;
  }
  return r[0];
}
function Ms() {
  if (Oe?.(), Oe = null, typeof window > "u" || typeof window.matchMedia != "function") return;
  const e = window.matchMedia(`(max-width: ${qs}px)`), t = (r) => {
    const a = !r;
    b.get().sidebarOpen !== a && b.set({ sidebarOpen: a });
  };
  t(e.matches);
  const n = (r) => {
    t(r.matches);
  };
  if (typeof e.addEventListener == "function") {
    e.addEventListener("change", n), Oe = () => e.removeEventListener("change", n);
    return;
  }
  const i = n;
  e.addListener(i), Oe = () => e.removeListener(i);
}
function Ps(e, t) {
  return e.type === t.type && e.operationId === t.operationId && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
const Fr = "ap_portal_prefs";
function Rs() {
  try {
    const e = localStorage.getItem(Fr);
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
function Fs(e) {
  try {
    localStorage.setItem(Fr, JSON.stringify(e));
  } catch {
  }
}
function Vn(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function _s(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], i = Vn(e[n]);
  for (let r = 1; r < t.length; r++) {
    const a = t[r], o = Vn(e[a]);
    o < i && (i = o, n = a);
  }
  return n;
}
function Ds(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), i = Object.entries(t.schemes);
  if (n.length !== i.length) return !1;
  for (const [r, a] of n)
    if (t.schemes[r] !== a) return !1;
  return !0;
}
function Hs(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const i = {};
  for (const o of n) {
    const s = e.schemes[o];
    typeof s == "string" && s.length > 0 && (i[o] = s);
  }
  let r = e.activeScheme;
  (!r || !t[r]) && (r = n.find((o) => !!i[o]) || ""), !r && e.token && (r = _s(t)), r && e.token && !i[r] && (i[r] = e.token);
  let a = e.token;
  return r && i[r] && a !== i[r] && (a = i[r]), !a && r && i[r] && (a = i[r]), {
    ...e,
    schemes: i,
    activeScheme: r,
    token: a
  };
}
function Us(e, t) {
  let n;
  return ((...i) => {
    clearTimeout(n), n = setTimeout(() => e(...i), t);
  });
}
let ht = !1, _t = null, Dt = null;
function zs(e) {
  const t = e.mount;
  if (t) {
    const a = typeof t == "string" ? document.querySelector(t) : t;
    if (!a)
      throw new Error(`[PureDocs] Mount target not found: ${String(t)}`);
    return a;
  }
  const n = e.mountId || "puredocs", i = document.getElementById(n);
  if (i) return i;
  const r = document.createElement("div");
  return r.id = n, document.body.append(r), r;
}
function Ws(e) {
  if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((r) => r.getAttribute("href") === e)) return;
  const i = document.createElement("link");
  i.rel = "stylesheet", i.href = e, document.head.append(i);
}
function Vs(e) {
  document.documentElement.style.minHeight = "100%", document.body.style.minHeight = "100vh", document.body.style.margin = "0", e.style.minHeight = "100vh", e.style.display = "block";
}
async function un(e) {
  let t = null;
  ht && (t = b.get().auth, dn());
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  b.reset();
  const i = [{ name: "default", baseUrl: "" }];
  b.set({
    loading: !0,
    theme: io(e.theme),
    environments: [...i],
    initialEnvironments: [...i],
    activeEnvironment: "default"
  });
  const r = Rs();
  r ? b.set({
    activeEnvironment: r.activeEnvironment || "default",
    auth: r.auth
  }) : t && b.setAuth(t);
  const a = Us(() => {
    const o = b.get();
    Fs({
      activeEnvironment: o.activeEnvironment,
      environments: o.environments,
      auth: o.auth
    });
  }, 300);
  b.subscribe(() => a()), Gr(""), Dt = No(), js(n, e), ht = !0;
  try {
    let o;
    const s = e.specUrl;
    if (e.spec)
      o = e.spec;
    else if (s)
      o = await eo(s);
    else
      throw new Error("Either spec or specUrl must be provided");
    const l = Ua(o);
    if (l.servers.length > 0) {
      const p = l.servers.map((h, v) => ({
        name: h.description || (v === 0 ? "default" : `Server ${v + 1}`),
        baseUrl: h.url
      }));
      b.set({ environments: p, initialEnvironments: p.map((h) => ({ ...h })) });
      const m = b.get();
      p.some((h) => h.name === m.activeEnvironment) || b.set({ activeEnvironment: p[0]?.name || "default" });
    }
    const u = b.get().auth, d = Hs(u, l.securitySchemes);
    Ds(u, d) || b.setAuth(d), to(l), b.set({ spec: l, loading: !1, error: null });
  } catch (o) {
    b.set({
      loading: !1,
      error: o.message || "Failed to load specification"
    });
  }
  return _t = Gs(), _t;
}
async function Ys(e) {
  if (typeof document > "u")
    throw new Error("[PureDocs] bootstrap() requires a browser environment");
  const t = zs(e);
  e.cssHref && Ws(e.cssHref), e.fullPage !== !1 && Vs(t);
  const { mount: n, mountId: i, cssHref: r, fullPage: a, ...o } = e;
  return un({
    ...o,
    mount: t
  });
}
function dn() {
  ht && (Dt?.(), Dt = null, Kr(), $s(), b.reset(), ht = !1, _t = null);
}
function Gs() {
  return {
    getState: () => b.get(),
    subscribe: (e) => b.subscribe(e),
    setToken: (e) => {
      const t = b.get().auth.activeScheme;
      t ? b.setSchemeValue(t, e) : b.setAuth({ token: e, source: "manual" });
    },
    setEnvironment: (e) => b.setActiveEnvironment(e),
    navigate: (e) => R(e)
  };
}
const Yn = [
  "spec-url",
  "spec-json",
  "theme",
  "primary-color",
  "title"
], ae = class ae extends HTMLElement {
  constructor() {
    super(...arguments), this.api = null, this.reloadTimer = null;
  }
  static get observedAttributes() {
    return [...Yn];
  }
  async connectedCallback() {
    if (ae.activeElement && ae.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    ae.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    ae.activeElement === this && (this.api = null, dn(), ae.activeElement = null);
  }
  attributeChangedCallback(t, n, i) {
    this.isConnected && n !== i && Yn.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
      this.reload();
    }, 80));
  }
  async reload() {
    ae.activeElement === this && await this.mountFromAttributes();
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
      this.api = await un({ ...t, mount: this });
    } catch (t) {
      const n = t instanceof Error ? t.message : String(t);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${n}</div>`;
    }
  }
  parseConfig() {
    const t = this.getAttribute("spec-json");
    return {
      specUrl: this.getAttribute("spec-url") || void 0,
      spec: t ? Ks(t, "spec-json") : void 0,
      theme: Js(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      title: this.getAttribute("title") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
ae.activeElement = null;
let Ht = ae;
function Ks(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function Js(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", Ht);
const Zs = {
  mount: un,
  bootstrap: Ys,
  unmount: dn,
  version: "0.0.1"
};
export {
  Zs as PureDocs,
  Ht as PureDocsElement,
  Zs as default
};
//# sourceMappingURL=puredocs.js.map
