class ps {
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
    const i = { ...this.state.auth.schemes, [t]: n }, r = t, s = n;
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, schemes: i, activeScheme: r, token: s, source: "manual" }
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
const k = new ps();
let Xt = "";
function fs(e = "") {
  Xt = e.replace(/\/$/, ""), window.addEventListener("popstate", Zt), Zt();
}
function oe(e) {
  window.history.pushState(null, "", Xt + e), Zt();
}
function hs() {
  const e = window.location.pathname;
  return Xt ? e.replace(Xt, "") || "/" : e;
}
function Jr(e) {
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
  const i = t.match(/^tags\/([^/]+)$/);
  if (i)
    return { type: "tag", tag: decodeURIComponent(i[1]) };
  const r = t.match(/^schemas\/(.+)$/);
  if (r)
    return { type: "schema", schemaName: decodeURIComponent(r[1]) };
  const s = t.match(/^webhooks\/(.+)$/);
  if (s)
    return { type: "webhook", webhookName: decodeURIComponent(s[1]) };
  const a = t.match(/^guides\/(.+)$/);
  return a ? { type: "guide", guidePath: decodeURIComponent(a[1]) } : { type: "overview" };
}
function ce(e) {
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
function Zt() {
  const e = hs(), t = Jr(e);
  k.setRoute(t);
}
function ms() {
  window.removeEventListener("popstate", Zt);
}
function _t(e) {
  if (e === void 0) return;
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!n || typeof n != "object" || Array.isArray(n)) continue;
    const i = {};
    for (const [r, s] of Object.entries(n)) {
      const a = Array.isArray(s) ? s.map((o) => String(o)) : [];
      i[r] = a;
    }
    t.push(i);
  }
  return t;
}
function Fn(e, t, n) {
  if (!e || e.length === 0)
    return { explicitlyNoAuth: n, requirements: [] };
  const i = e.map((r) => Object.entries(r).map(([s, a]) => ({
    schemeName: s,
    scopes: Array.isArray(a) ? a : [],
    scheme: t[s]
  })));
  return { explicitlyNoAuth: n, requirements: i };
}
function de(e) {
  return !!(e && !e.explicitlyNoAuth && e.requirements.length > 0);
}
function Hn(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function gs(e) {
  if (!de(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const i of e.requirements)
    for (const r of i) {
      const s = Hn(r.scheme);
      t.has(s) || (t.add(s), n.push(s));
    }
  return n;
}
function Xr(e) {
  const t = gs(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function gt(e) {
  return de(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((i) => {
    const r = Hn(i.scheme);
    return i.scopes.length > 0 ? `${r} [${i.scopes.join(", ")}]` : r;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function ln(e, t, n, i) {
  const r = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!de(e)) return r;
  for (const o of e.requirements) {
    if (!o.every((f) => !!t[f.schemeName]) && o.length > 0) continue;
    const u = Er(o, t);
    if (Object.keys(u.headers).length > 0 || Object.keys(u.query).length > 0 || Object.keys(u.cookies).length > 0)
      return u;
  }
  return !i || !n ? r : Er([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: i });
}
function vs(e) {
  const t = {};
  if (!de(e)) return t;
  const n = e.requirements[0] || [];
  for (const i of n) {
    const r = i.scheme;
    if (r) {
      if (r.type === "http") {
        const s = (r.scheme || "").toLowerCase();
        s === "bearer" ? t.Authorization = "Bearer <token>" : s === "basic" ? t.Authorization = "Basic <credentials>" : t.Authorization = "<token>";
        continue;
      }
      r.type === "apiKey" && r.in === "header" && r.name && (t[r.name] = `<${r.name}>`);
    }
  }
  return t;
}
function Er(e, t) {
  const n = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  for (const i of e) {
    const r = i.scheme, s = t[i.schemeName];
    if (!(!r || !s)) {
      if (n.matchedSchemeNames.push(i.schemeName), r.type === "http") {
        const a = (r.scheme || "").toLowerCase();
        a === "bearer" ? n.headers.Authorization = `Bearer ${s}` : a === "basic" ? n.headers.Authorization = `Basic ${s}` : n.headers.Authorization = s;
        continue;
      }
      if (r.type === "oauth2" || r.type === "openIdConnect") {
        n.headers.Authorization = `Bearer ${s}`;
        continue;
      }
      r.type === "apiKey" && r.name && (r.in === "query" ? n.query[r.name] = s : r.in === "cookie" ? n.cookies[r.name] = s : n.headers[r.name] = s);
    }
  }
  return n;
}
/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function Zr(e) {
  return typeof e > "u" || e === null;
}
function bs(e) {
  return typeof e == "object" && e !== null;
}
function ys(e) {
  return Array.isArray(e) ? e : Zr(e) ? [] : [e];
}
function xs(e, t) {
  var n, i, r, s;
  if (t)
    for (s = Object.keys(t), n = 0, i = s.length; n < i; n += 1)
      r = s[n], e[r] = t[r];
  return e;
}
function Es(e, t) {
  var n = "", i;
  for (i = 0; i < t; i += 1)
    n += e;
  return n;
}
function Ss(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
var ks = Zr, Ns = bs, Cs = ys, ws = Es, As = Ss, Os = xs, me = {
  isNothing: ks,
  isObject: Ns,
  toArray: Cs,
  repeat: ws,
  isNegativeZero: As,
  extend: Os
};
function Qr(e, t) {
  var n = "", i = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), i + " " + n) : i;
}
function It(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Qr(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
It.prototype = Object.create(Error.prototype);
It.prototype.constructor = It;
It.prototype.toString = function(t) {
  return this.name + ": " + Qr(this, t);
};
var De = It;
function Nn(e, t, n, i, r) {
  var s = "", a = "", o = Math.floor(r / 2) - 1;
  return i - t > o && (s = " ... ", t = i - o + s.length), n - i > o && (a = " ...", n = i + o - a.length), {
    str: s + e.slice(t, n).replace(/\t/g, "→") + a,
    pos: i - t + s.length
    // relative position
  };
}
function Cn(e, t) {
  return me.repeat(" ", t - e.length) + e;
}
function Ls(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var n = /\r?\n|\r|\0/g, i = [0], r = [], s, a = -1; s = n.exec(e.buffer); )
    r.push(s.index), i.push(s.index + s[0].length), e.position <= s.index && a < 0 && (a = i.length - 2);
  a < 0 && (a = i.length - 1);
  var o = "", l, u, f = Math.min(e.line + t.linesAfter, r.length).toString().length, p = t.maxLength - (t.indent + f + 3);
  for (l = 1; l <= t.linesBefore && !(a - l < 0); l++)
    u = Nn(
      e.buffer,
      i[a - l],
      r[a - l],
      e.position - (i[a] - i[a - l]),
      p
    ), o = me.repeat(" ", t.indent) + Cn((e.line - l + 1).toString(), f) + " | " + u.str + `
` + o;
  for (u = Nn(e.buffer, i[a], r[a], e.position, p), o += me.repeat(" ", t.indent) + Cn((e.line + 1).toString(), f) + " | " + u.str + `
`, o += me.repeat("-", t.indent + f + 3 + u.pos) + `^
`, l = 1; l <= t.linesAfter && !(a + l >= r.length); l++)
    u = Nn(
      e.buffer,
      i[a + l],
      r[a + l],
      e.position - (i[a] - i[a + l]),
      p
    ), o += me.repeat(" ", t.indent) + Cn((e.line + l + 1).toString(), f) + " | " + u.str + `
`;
  return o.replace(/\n$/, "");
}
var Ts = Ls, _s = [
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
], Is = [
  "scalar",
  "sequence",
  "mapping"
];
function Ms(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(i) {
      t[String(i)] = n;
    });
  }), t;
}
function Rs(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (_s.indexOf(n) === -1)
      throw new De('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = Ms(t.styleAliases || null), Is.indexOf(this.kind) === -1)
    throw new De('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var he = Rs;
function Sr(e, t) {
  var n = [];
  return e[t].forEach(function(i) {
    var r = n.length;
    n.forEach(function(s, a) {
      s.tag === i.tag && s.kind === i.kind && s.multi === i.multi && (r = a);
    }), n[r] = i;
  }), n;
}
function Bs() {
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
function Rn(e) {
  return this.extend(e);
}
Rn.prototype.extend = function(t) {
  var n = [], i = [];
  if (t instanceof he)
    i.push(t);
  else if (Array.isArray(t))
    i = i.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (i = i.concat(t.explicit));
  else
    throw new De("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(s) {
    if (!(s instanceof he))
      throw new De("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (s.loadKind && s.loadKind !== "scalar")
      throw new De("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (s.multi)
      throw new De("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), i.forEach(function(s) {
    if (!(s instanceof he))
      throw new De("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var r = Object.create(Rn.prototype);
  return r.implicit = (this.implicit || []).concat(n), r.explicit = (this.explicit || []).concat(i), r.compiledImplicit = Sr(r, "implicit"), r.compiledExplicit = Sr(r, "explicit"), r.compiledTypeMap = Bs(r.compiledImplicit, r.compiledExplicit), r;
};
var $s = Rn, js = new he("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), qs = new he("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), Ps = new he("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Ds = new $s({
  explicit: [
    js,
    qs,
    Ps
  ]
});
function Fs(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Hs() {
  return null;
}
function Us(e) {
  return e === null;
}
var zs = new he("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Fs,
  construct: Hs,
  predicate: Us,
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
function Ws(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function Ks(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Gs(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Ys = new he("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: Ws,
  construct: Ks,
  predicate: Gs,
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
function Vs(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Js(e) {
  return 48 <= e && e <= 55;
}
function Xs(e) {
  return 48 <= e && e <= 57;
}
function Zs(e) {
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
          if (!Vs(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
    if (r === "o") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Js(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
  }
  if (r === "_") return !1;
  for (; n < t; n++)
    if (r = e[n], r !== "_") {
      if (!Xs(e.charCodeAt(n)))
        return !1;
      i = !0;
    }
  return !(!i || r === "_");
}
function Qs(e) {
  var t = e, n = 1, i;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), i = t[0], (i === "-" || i === "+") && (i === "-" && (n = -1), t = t.slice(1), i = t[0]), t === "0") return 0;
  if (i === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function ea(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !me.isNegativeZero(e);
}
var ta = new he("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Zs,
  construct: Qs,
  predicate: ea,
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
}), na = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function ra(e) {
  return !(e === null || !na.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function ia(e) {
  var t, n;
  return t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
var sa = /^[-+]?[0-9]+e/;
function aa(e, t) {
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
  else if (me.isNegativeZero(e))
    return "-0.0";
  return n = e.toString(10), sa.test(n) ? n.replace("e", ".e") : n;
}
function oa(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || me.isNegativeZero(e));
}
var ca = new he("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: ra,
  construct: ia,
  predicate: oa,
  represent: aa,
  defaultStyle: "lowercase"
}), la = Ds.extend({
  implicit: [
    zs,
    Ys,
    ta,
    ca
  ]
}), ua = la, ei = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), ti = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function da(e) {
  return e === null ? !1 : ei.exec(e) !== null || ti.exec(e) !== null;
}
function pa(e) {
  var t, n, i, r, s, a, o, l = 0, u = null, f, p, g;
  if (t = ei.exec(e), t === null && (t = ti.exec(e)), t === null) throw new Error("Date resolve error");
  if (n = +t[1], i = +t[2] - 1, r = +t[3], !t[4])
    return new Date(Date.UTC(n, i, r));
  if (s = +t[4], a = +t[5], o = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (f = +t[10], p = +(t[11] || 0), u = (f * 60 + p) * 6e4, t[9] === "-" && (u = -u)), g = new Date(Date.UTC(n, i, r, s, a, o, l)), u && g.setTime(g.getTime() - u), g;
}
function fa(e) {
  return e.toISOString();
}
var ha = new he("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: da,
  construct: pa,
  instanceOf: Date,
  represent: fa
});
function ma(e) {
  return e === "<<" || e === null;
}
var ga = new he("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: ma
}), Un = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function va(e) {
  if (e === null) return !1;
  var t, n, i = 0, r = e.length, s = Un;
  for (n = 0; n < r; n++)
    if (t = s.indexOf(e.charAt(n)), !(t > 64)) {
      if (t < 0) return !1;
      i += 6;
    }
  return i % 8 === 0;
}
function ba(e) {
  var t, n, i = e.replace(/[\r\n=]/g, ""), r = i.length, s = Un, a = 0, o = [];
  for (t = 0; t < r; t++)
    t % 4 === 0 && t && (o.push(a >> 16 & 255), o.push(a >> 8 & 255), o.push(a & 255)), a = a << 6 | s.indexOf(i.charAt(t));
  return n = r % 4 * 6, n === 0 ? (o.push(a >> 16 & 255), o.push(a >> 8 & 255), o.push(a & 255)) : n === 18 ? (o.push(a >> 10 & 255), o.push(a >> 2 & 255)) : n === 12 && o.push(a >> 4 & 255), new Uint8Array(o);
}
function ya(e) {
  var t = "", n = 0, i, r, s = e.length, a = Un;
  for (i = 0; i < s; i++)
    i % 3 === 0 && i && (t += a[n >> 18 & 63], t += a[n >> 12 & 63], t += a[n >> 6 & 63], t += a[n & 63]), n = (n << 8) + e[i];
  return r = s % 3, r === 0 ? (t += a[n >> 18 & 63], t += a[n >> 12 & 63], t += a[n >> 6 & 63], t += a[n & 63]) : r === 2 ? (t += a[n >> 10 & 63], t += a[n >> 4 & 63], t += a[n << 2 & 63], t += a[64]) : r === 1 && (t += a[n >> 2 & 63], t += a[n << 4 & 63], t += a[64], t += a[64]), t;
}
function xa(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var Ea = new he("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: va,
  construct: ba,
  predicate: xa,
  represent: ya
}), Sa = Object.prototype.hasOwnProperty, ka = Object.prototype.toString;
function Na(e) {
  if (e === null) return !0;
  var t = [], n, i, r, s, a, o = e;
  for (n = 0, i = o.length; n < i; n += 1) {
    if (r = o[n], a = !1, ka.call(r) !== "[object Object]") return !1;
    for (s in r)
      if (Sa.call(r, s))
        if (!a) a = !0;
        else return !1;
    if (!a) return !1;
    if (t.indexOf(s) === -1) t.push(s);
    else return !1;
  }
  return !0;
}
function Ca(e) {
  return e !== null ? e : [];
}
var wa = new he("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Na,
  construct: Ca
}), Aa = Object.prototype.toString;
function Oa(e) {
  if (e === null) return !0;
  var t, n, i, r, s, a = e;
  for (s = new Array(a.length), t = 0, n = a.length; t < n; t += 1) {
    if (i = a[t], Aa.call(i) !== "[object Object]" || (r = Object.keys(i), r.length !== 1)) return !1;
    s[t] = [r[0], i[r[0]]];
  }
  return !0;
}
function La(e) {
  if (e === null) return [];
  var t, n, i, r, s, a = e;
  for (s = new Array(a.length), t = 0, n = a.length; t < n; t += 1)
    i = a[t], r = Object.keys(i), s[t] = [r[0], i[r[0]]];
  return s;
}
var Ta = new he("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Oa,
  construct: La
}), _a = Object.prototype.hasOwnProperty;
function Ia(e) {
  if (e === null) return !0;
  var t, n = e;
  for (t in n)
    if (_a.call(n, t) && n[t] !== null)
      return !1;
  return !0;
}
function Ma(e) {
  return e !== null ? e : {};
}
var Ra = new he("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: Ia,
  construct: Ma
}), Ba = ua.extend({
  implicit: [
    ha,
    ga
  ],
  explicit: [
    Ea,
    wa,
    Ta,
    Ra
  ]
}), Ge = Object.prototype.hasOwnProperty, Qt = 1, ni = 2, ri = 3, en = 4, wn = 1, $a = 2, kr = 3, ja = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, qa = /[\x85\u2028\u2029]/, Pa = /[,\[\]\{\}]/, ii = /^(?:!|!!|![a-z\-]+!)$/i, si = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function Nr(e) {
  return Object.prototype.toString.call(e);
}
function Me(e) {
  return e === 10 || e === 13;
}
function nt(e) {
  return e === 9 || e === 32;
}
function ye(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function ht(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Da(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Fa(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function Ha(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function Cr(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function Ua(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function ai(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
var oi = new Array(256), ci = new Array(256);
for (var dt = 0; dt < 256; dt++)
  oi[dt] = Cr(dt) ? 1 : 0, ci[dt] = Cr(dt);
function za(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Ba, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function li(e, t) {
  var n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = Ts(n), new De(t, n);
}
function T(e, t) {
  throw li(e, t);
}
function tn(e, t) {
  e.onWarning && e.onWarning.call(null, li(e, t));
}
var wr = {
  YAML: function(t, n, i) {
    var r, s, a;
    t.version !== null && T(t, "duplication of %YAML directive"), i.length !== 1 && T(t, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(i[0]), r === null && T(t, "ill-formed argument of the YAML directive"), s = parseInt(r[1], 10), a = parseInt(r[2], 10), s !== 1 && T(t, "unacceptable YAML version of the document"), t.version = i[0], t.checkLineBreaks = a < 2, a !== 1 && a !== 2 && tn(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, i) {
    var r, s;
    i.length !== 2 && T(t, "TAG directive accepts exactly two arguments"), r = i[0], s = i[1], ii.test(r) || T(t, "ill-formed tag handle (first argument) of the TAG directive"), Ge.call(t.tagMap, r) && T(t, 'there is a previously declared suffix for "' + r + '" tag handle'), si.test(s) || T(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      s = decodeURIComponent(s);
    } catch {
      T(t, "tag prefix is malformed: " + s);
    }
    t.tagMap[r] = s;
  }
};
function Ke(e, t, n, i) {
  var r, s, a, o;
  if (t < n) {
    if (o = e.input.slice(t, n), i)
      for (r = 0, s = o.length; r < s; r += 1)
        a = o.charCodeAt(r), a === 9 || 32 <= a && a <= 1114111 || T(e, "expected valid JSON character");
    else ja.test(o) && T(e, "the stream contains non-printable characters");
    e.result += o;
  }
}
function Ar(e, t, n, i) {
  var r, s, a, o;
  for (me.isObject(n) || T(e, "cannot merge mappings; the provided source object is unacceptable"), r = Object.keys(n), a = 0, o = r.length; a < o; a += 1)
    s = r[a], Ge.call(t, s) || (ai(t, s, n[s]), i[s] = !0);
}
function mt(e, t, n, i, r, s, a, o, l) {
  var u, f;
  if (Array.isArray(r))
    for (r = Array.prototype.slice.call(r), u = 0, f = r.length; u < f; u += 1)
      Array.isArray(r[u]) && T(e, "nested arrays are not supported inside keys"), typeof r == "object" && Nr(r[u]) === "[object Object]" && (r[u] = "[object Object]");
  if (typeof r == "object" && Nr(r) === "[object Object]" && (r = "[object Object]"), r = String(r), t === null && (t = {}), i === "tag:yaml.org,2002:merge")
    if (Array.isArray(s))
      for (u = 0, f = s.length; u < f; u += 1)
        Ar(e, t, s[u], n);
    else
      Ar(e, t, s, n);
  else
    !e.json && !Ge.call(n, r) && Ge.call(t, r) && (e.line = a || e.line, e.lineStart = o || e.lineStart, e.position = l || e.position, T(e, "duplicated mapping key")), ai(t, r, s), delete n[r];
  return t;
}
function zn(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : T(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function re(e, t, n) {
  for (var i = 0, r = e.input.charCodeAt(e.position); r !== 0; ) {
    for (; nt(r); )
      r === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
    if (t && r === 35)
      do
        r = e.input.charCodeAt(++e.position);
      while (r !== 10 && r !== 13 && r !== 0);
    if (Me(r))
      for (zn(e), r = e.input.charCodeAt(e.position), i++, e.lineIndent = 0; r === 32; )
        e.lineIndent++, r = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && i !== 0 && e.lineIndent < n && tn(e, "deficient indentation"), i;
}
function un(e) {
  var t = e.position, n;
  return n = e.input.charCodeAt(t), !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || ye(n)));
}
function Wn(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += me.repeat(`
`, t - 1));
}
function Wa(e, t, n) {
  var i, r, s, a, o, l, u, f, p = e.kind, g = e.result, h;
  if (h = e.input.charCodeAt(e.position), ye(h) || ht(h) || h === 35 || h === 38 || h === 42 || h === 33 || h === 124 || h === 62 || h === 39 || h === 34 || h === 37 || h === 64 || h === 96 || (h === 63 || h === 45) && (r = e.input.charCodeAt(e.position + 1), ye(r) || n && ht(r)))
    return !1;
  for (e.kind = "scalar", e.result = "", s = a = e.position, o = !1; h !== 0; ) {
    if (h === 58) {
      if (r = e.input.charCodeAt(e.position + 1), ye(r) || n && ht(r))
        break;
    } else if (h === 35) {
      if (i = e.input.charCodeAt(e.position - 1), ye(i))
        break;
    } else {
      if (e.position === e.lineStart && un(e) || n && ht(h))
        break;
      if (Me(h))
        if (l = e.line, u = e.lineStart, f = e.lineIndent, re(e, !1, -1), e.lineIndent >= t) {
          o = !0, h = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = a, e.line = l, e.lineStart = u, e.lineIndent = f;
          break;
        }
    }
    o && (Ke(e, s, a, !1), Wn(e, e.line - l), s = a = e.position, o = !1), nt(h) || (a = e.position + 1), h = e.input.charCodeAt(++e.position);
  }
  return Ke(e, s, a, !1), e.result ? !0 : (e.kind = p, e.result = g, !1);
}
function Ka(e, t) {
  var n, i, r;
  if (n = e.input.charCodeAt(e.position), n !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, i = r = e.position; (n = e.input.charCodeAt(e.position)) !== 0; )
    if (n === 39)
      if (Ke(e, i, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39)
        i = e.position, e.position++, r = e.position;
      else
        return !0;
    else Me(n) ? (Ke(e, i, r, !0), Wn(e, re(e, !1, t)), i = r = e.position) : e.position === e.lineStart && un(e) ? T(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position);
  T(e, "unexpected end of the stream within a single quoted scalar");
}
function Ga(e, t) {
  var n, i, r, s, a, o;
  if (o = e.input.charCodeAt(e.position), o !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (o = e.input.charCodeAt(e.position)) !== 0; ) {
    if (o === 34)
      return Ke(e, n, e.position, !0), e.position++, !0;
    if (o === 92) {
      if (Ke(e, n, e.position, !0), o = e.input.charCodeAt(++e.position), Me(o))
        re(e, !1, t);
      else if (o < 256 && oi[o])
        e.result += ci[o], e.position++;
      else if ((a = Fa(o)) > 0) {
        for (r = a, s = 0; r > 0; r--)
          o = e.input.charCodeAt(++e.position), (a = Da(o)) >= 0 ? s = (s << 4) + a : T(e, "expected hexadecimal character");
        e.result += Ua(s), e.position++;
      } else
        T(e, "unknown escape sequence");
      n = i = e.position;
    } else Me(o) ? (Ke(e, n, i, !0), Wn(e, re(e, !1, t)), n = i = e.position) : e.position === e.lineStart && un(e) ? T(e, "unexpected end of the document within a double quoted scalar") : (e.position++, i = e.position);
  }
  T(e, "unexpected end of the stream within a double quoted scalar");
}
function Ya(e, t) {
  var n = !0, i, r, s, a = e.tag, o, l = e.anchor, u, f, p, g, h, v = /* @__PURE__ */ Object.create(null), m, S, y, x;
  if (x = e.input.charCodeAt(e.position), x === 91)
    f = 93, h = !1, o = [];
  else if (x === 123)
    f = 125, h = !0, o = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), x = e.input.charCodeAt(++e.position); x !== 0; ) {
    if (re(e, !0, t), x = e.input.charCodeAt(e.position), x === f)
      return e.position++, e.tag = a, e.anchor = l, e.kind = h ? "mapping" : "sequence", e.result = o, !0;
    n ? x === 44 && T(e, "expected the node content, but found ','") : T(e, "missed comma between flow collection entries"), S = m = y = null, p = g = !1, x === 63 && (u = e.input.charCodeAt(e.position + 1), ye(u) && (p = g = !0, e.position++, re(e, !0, t))), i = e.line, r = e.lineStart, s = e.position, bt(e, t, Qt, !1, !0), S = e.tag, m = e.result, re(e, !0, t), x = e.input.charCodeAt(e.position), (g || e.line === i) && x === 58 && (p = !0, x = e.input.charCodeAt(++e.position), re(e, !0, t), bt(e, t, Qt, !1, !0), y = e.result), h ? mt(e, o, v, S, m, y, i, r, s) : p ? o.push(mt(e, null, v, S, m, y, i, r, s)) : o.push(m), re(e, !0, t), x = e.input.charCodeAt(e.position), x === 44 ? (n = !0, x = e.input.charCodeAt(++e.position)) : n = !1;
  }
  T(e, "unexpected end of the stream within a flow collection");
}
function Va(e, t) {
  var n, i, r = wn, s = !1, a = !1, o = t, l = 0, u = !1, f, p;
  if (p = e.input.charCodeAt(e.position), p === 124)
    i = !1;
  else if (p === 62)
    i = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; p !== 0; )
    if (p = e.input.charCodeAt(++e.position), p === 43 || p === 45)
      wn === r ? r = p === 43 ? kr : $a : T(e, "repeat of a chomping mode identifier");
    else if ((f = Ha(p)) >= 0)
      f === 0 ? T(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : a ? T(e, "repeat of an indentation width identifier") : (o = t + f - 1, a = !0);
    else
      break;
  if (nt(p)) {
    do
      p = e.input.charCodeAt(++e.position);
    while (nt(p));
    if (p === 35)
      do
        p = e.input.charCodeAt(++e.position);
      while (!Me(p) && p !== 0);
  }
  for (; p !== 0; ) {
    for (zn(e), e.lineIndent = 0, p = e.input.charCodeAt(e.position); (!a || e.lineIndent < o) && p === 32; )
      e.lineIndent++, p = e.input.charCodeAt(++e.position);
    if (!a && e.lineIndent > o && (o = e.lineIndent), Me(p)) {
      l++;
      continue;
    }
    if (e.lineIndent < o) {
      r === kr ? e.result += me.repeat(`
`, s ? 1 + l : l) : r === wn && s && (e.result += `
`);
      break;
    }
    for (i ? nt(p) ? (u = !0, e.result += me.repeat(`
`, s ? 1 + l : l)) : u ? (u = !1, e.result += me.repeat(`
`, l + 1)) : l === 0 ? s && (e.result += " ") : e.result += me.repeat(`
`, l) : e.result += me.repeat(`
`, s ? 1 + l : l), s = !0, a = !0, l = 0, n = e.position; !Me(p) && p !== 0; )
      p = e.input.charCodeAt(++e.position);
    Ke(e, n, e.position, !1);
  }
  return !0;
}
function Or(e, t) {
  var n, i = e.tag, r = e.anchor, s = [], a, o = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, T(e, "tab characters must not be used in indentation")), !(l !== 45 || (a = e.input.charCodeAt(e.position + 1), !ye(a)))); ) {
    if (o = !0, e.position++, re(e, !0, -1) && e.lineIndent <= t) {
      s.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (n = e.line, bt(e, t, ri, !1, !0), s.push(e.result), re(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && l !== 0)
      T(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return o ? (e.tag = i, e.anchor = r, e.kind = "sequence", e.result = s, !0) : !1;
}
function Ja(e, t, n) {
  var i, r, s, a, o, l, u = e.tag, f = e.anchor, p = {}, g = /* @__PURE__ */ Object.create(null), h = null, v = null, m = null, S = !1, y = !1, x;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = p), x = e.input.charCodeAt(e.position); x !== 0; ) {
    if (!S && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, T(e, "tab characters must not be used in indentation")), i = e.input.charCodeAt(e.position + 1), s = e.line, (x === 63 || x === 58) && ye(i))
      x === 63 ? (S && (mt(e, p, g, h, v, null, a, o, l), h = v = m = null), y = !0, S = !0, r = !0) : S ? (S = !1, r = !0) : T(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, x = i;
    else {
      if (a = e.line, o = e.lineStart, l = e.position, !bt(e, n, ni, !1, !0))
        break;
      if (e.line === s) {
        for (x = e.input.charCodeAt(e.position); nt(x); )
          x = e.input.charCodeAt(++e.position);
        if (x === 58)
          x = e.input.charCodeAt(++e.position), ye(x) || T(e, "a whitespace character is expected after the key-value separator within a block mapping"), S && (mt(e, p, g, h, v, null, a, o, l), h = v = m = null), y = !0, S = !1, r = !1, h = e.tag, v = e.result;
        else if (y)
          T(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = u, e.anchor = f, !0;
      } else if (y)
        T(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = u, e.anchor = f, !0;
    }
    if ((e.line === s || e.lineIndent > t) && (S && (a = e.line, o = e.lineStart, l = e.position), bt(e, t, en, !0, r) && (S ? v = e.result : m = e.result), S || (mt(e, p, g, h, v, m, a, o, l), h = v = m = null), re(e, !0, -1), x = e.input.charCodeAt(e.position)), (e.line === s || e.lineIndent > t) && x !== 0)
      T(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return S && mt(e, p, g, h, v, null, a, o, l), y && (e.tag = u, e.anchor = f, e.kind = "mapping", e.result = p), y;
}
function Xa(e) {
  var t, n = !1, i = !1, r, s, a;
  if (a = e.input.charCodeAt(e.position), a !== 33) return !1;
  if (e.tag !== null && T(e, "duplication of a tag property"), a = e.input.charCodeAt(++e.position), a === 60 ? (n = !0, a = e.input.charCodeAt(++e.position)) : a === 33 ? (i = !0, r = "!!", a = e.input.charCodeAt(++e.position)) : r = "!", t = e.position, n) {
    do
      a = e.input.charCodeAt(++e.position);
    while (a !== 0 && a !== 62);
    e.position < e.length ? (s = e.input.slice(t, e.position), a = e.input.charCodeAt(++e.position)) : T(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; a !== 0 && !ye(a); )
      a === 33 && (i ? T(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(t - 1, e.position + 1), ii.test(r) || T(e, "named tag handle cannot contain such characters"), i = !0, t = e.position + 1)), a = e.input.charCodeAt(++e.position);
    s = e.input.slice(t, e.position), Pa.test(s) && T(e, "tag suffix cannot contain flow indicator characters");
  }
  s && !si.test(s) && T(e, "tag name cannot contain such characters: " + s);
  try {
    s = decodeURIComponent(s);
  } catch {
    T(e, "tag name is malformed: " + s);
  }
  return n ? e.tag = s : Ge.call(e.tagMap, r) ? e.tag = e.tagMap[r] + s : r === "!" ? e.tag = "!" + s : r === "!!" ? e.tag = "tag:yaml.org,2002:" + s : T(e, 'undeclared tag handle "' + r + '"'), !0;
}
function Za(e) {
  var t, n;
  if (n = e.input.charCodeAt(e.position), n !== 38) return !1;
  for (e.anchor !== null && T(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !ye(n) && !ht(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && T(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function Qa(e) {
  var t, n, i;
  if (i = e.input.charCodeAt(e.position), i !== 42) return !1;
  for (i = e.input.charCodeAt(++e.position), t = e.position; i !== 0 && !ye(i) && !ht(i); )
    i = e.input.charCodeAt(++e.position);
  return e.position === t && T(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), Ge.call(e.anchorMap, n) || T(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], re(e, !0, -1), !0;
}
function bt(e, t, n, i, r) {
  var s, a, o, l = 1, u = !1, f = !1, p, g, h, v, m, S;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, s = a = o = en === n || ri === n, i && re(e, !0, -1) && (u = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; Xa(e) || Za(e); )
      re(e, !0, -1) ? (u = !0, o = s, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : o = !1;
  if (o && (o = u || r), (l === 1 || en === n) && (Qt === n || ni === n ? m = t : m = t + 1, S = e.position - e.lineStart, l === 1 ? o && (Or(e, S) || Ja(e, S, m)) || Ya(e, m) ? f = !0 : (a && Va(e, m) || Ka(e, m) || Ga(e, m) ? f = !0 : Qa(e) ? (f = !0, (e.tag !== null || e.anchor !== null) && T(e, "alias node should not have any properties")) : Wa(e, m, Qt === n) && (f = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (f = o && Or(e, S))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && T(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), p = 0, g = e.implicitTypes.length; p < g; p += 1)
      if (v = e.implicitTypes[p], v.resolve(e.result)) {
        e.result = v.construct(e.result), e.tag = v.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (Ge.call(e.typeMap[e.kind || "fallback"], e.tag))
      v = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (v = null, h = e.typeMap.multi[e.kind || "fallback"], p = 0, g = h.length; p < g; p += 1)
        if (e.tag.slice(0, h[p].tag.length) === h[p].tag) {
          v = h[p];
          break;
        }
    v || T(e, "unknown tag !<" + e.tag + ">"), e.result !== null && v.kind !== e.kind && T(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + v.kind + '", not "' + e.kind + '"'), v.resolve(e.result, e.tag) ? (e.result = v.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : T(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || f;
}
function eo(e) {
  var t = e.position, n, i, r, s = !1, a;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (a = e.input.charCodeAt(e.position)) !== 0 && (re(e, !0, -1), a = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || a !== 37)); ) {
    for (s = !0, a = e.input.charCodeAt(++e.position), n = e.position; a !== 0 && !ye(a); )
      a = e.input.charCodeAt(++e.position);
    for (i = e.input.slice(n, e.position), r = [], i.length < 1 && T(e, "directive name must not be less than one character in length"); a !== 0; ) {
      for (; nt(a); )
        a = e.input.charCodeAt(++e.position);
      if (a === 35) {
        do
          a = e.input.charCodeAt(++e.position);
        while (a !== 0 && !Me(a));
        break;
      }
      if (Me(a)) break;
      for (n = e.position; a !== 0 && !ye(a); )
        a = e.input.charCodeAt(++e.position);
      r.push(e.input.slice(n, e.position));
    }
    a !== 0 && zn(e), Ge.call(wr, i) ? wr[i](e, i, r) : tn(e, 'unknown document directive "' + i + '"');
  }
  if (re(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, re(e, !0, -1)) : s && T(e, "directives end mark is expected"), bt(e, e.lineIndent - 1, en, !1, !0), re(e, !0, -1), e.checkLineBreaks && qa.test(e.input.slice(t, e.position)) && tn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && un(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, re(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    T(e, "end of the stream or a document separator is expected");
  else
    return;
}
function to(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var n = new za(e, t), i = e.indexOf("\0");
  for (i !== -1 && (n.position = i, T(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    eo(n);
  return n.documents;
}
function no(e, t) {
  var n = to(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new De("expected a single document in the stream, but found more");
  }
}
var ro = no, io = {
  load: ro
}, so = io.load;
const ao = 50, oo = 200;
function co(e) {
  const t = lo(e.info || {}), n = uo(e.servers || []), i = e.components || {}, r = ho(i.schemas || {}, e), s = po(i.securitySchemes || {}), a = _t(e.security), o = e.paths || {}, l = {};
  for (const [g, h] of Object.entries(o))
    g.startsWith("/docs") || (l[g] = h);
  const u = mo(l, e, a, s), f = yo(u, e.tags || []), p = go(e.webhooks || {}, e, a, s);
  return { raw: e, info: t, servers: n, tags: f, operations: u, schemas: r, securitySchemes: s, webhooks: p };
}
function lo(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function uo(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function po(e) {
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
const Lt = /* @__PURE__ */ new Map();
let Kn = 0;
function fo(e, t) {
  if (Lt.has(e)) return Lt.get(e);
  if (++Kn > oo) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((r) => decodeURIComponent(r.replace(/~1/g, "/").replace(/~0/g, "~")));
  let i = t;
  for (const r of n)
    if (i && typeof i == "object" && !Array.isArray(i))
      i = i[r];
    else
      return;
  return Lt.set(e, i), i;
}
function ve(e, t, n = 0, i = /* @__PURE__ */ new Set()) {
  if (n > ao || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((a) => ve(a, t, n + 1, i));
  const r = e;
  if (typeof r.$ref == "string") {
    const a = r.$ref;
    if (i.has(a)) return { type: "object", description: "[Circular reference]" };
    const o = new Set(i);
    o.add(a);
    const l = fo(a, t);
    return l && typeof l == "object" ? ve(l, t, n + 1, o) : l;
  }
  const s = {};
  for (const [a, o] of Object.entries(r))
    s[a] = ve(o, t, n + 1, i);
  return s;
}
function ho(e, t) {
  Lt.clear(), Kn = 0;
  const n = {};
  for (const [i, r] of Object.entries(e))
    n[i] = ve(r, t);
  return n;
}
function mo(e, t, n, i) {
  Lt.clear(), Kn = 0;
  const r = [], s = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [a, o] of Object.entries(e)) {
    if (!o || typeof o != "object") continue;
    const l = _t(o.security), u = Array.isArray(o.parameters) ? o.parameters.map((f) => ve(f, t)) : [];
    for (const f of s) {
      const p = o[f];
      if (!p) continue;
      const g = ui(
        f,
        a,
        p,
        u,
        t,
        l,
        n,
        i
      );
      r.push(g);
    }
  }
  return r;
}
function ui(e, t, n, i, r, s = void 0, a = void 0, o = {}) {
  const l = Array.isArray(n.parameters) ? n.parameters.map((I) => ve(I, r)) : [], u = [...i];
  for (const I of l) {
    const D = u.findIndex((_) => _.name === I.name && _.in === I.in);
    D >= 0 ? u[D] = I : u.push(I);
  }
  const f = di(u, r);
  let p = pi(n.requestBody, r);
  if (Array.isArray(n["x-doc-examples"])) {
    const I = n["x-doc-examples"], D = [];
    for (let _ = 0; _ < I.length; _++) {
      const j = I[_], W = j.scenario ? String(j.scenario) : `Example ${_ + 1}`, z = j.request?.body;
      z !== void 0 && D.push({ summary: W, value: z });
    }
    if (D.length > 0) {
      p || (p = { required: !1, content: {} });
      const _ = p.content["application/json"] || p.content["application/vnd.api+json"] || {};
      p.content["application/json"] || (p.content["application/json"] = _);
      const j = p.content["application/json"];
      j.examples || (j.examples = {});
      for (let W = 0; W < D.length; W++) {
        const X = D[W], xe = `${X.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${W}`.replace(/^-/, "");
        j.examples[xe] = { summary: X.summary, description: X.summary, value: X.value };
      }
    }
  }
  const g = fi(n.responses, r), h = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], v = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), m = Object.prototype.hasOwnProperty.call(n, "security"), S = _t(n.security), y = m ? S : s ?? a, x = m && Array.isArray(S) && S.length === 0, $ = bo(n.callbacks, r, o), O = {
    operationId: v,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: h,
    deprecated: !!n.deprecated,
    security: y,
    resolvedSecurity: Fn(y, o, x),
    parameters: f,
    requestBody: p,
    responses: g
  };
  return $.length > 0 && (O.callbacks = $), O;
}
function go(e, t, n, i) {
  if (!e || typeof e != "object") return [];
  const r = [], s = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [a, o] of Object.entries(e)) {
    if (!o || typeof o != "object") continue;
    const l = ve(o, t), u = _t(l.security);
    for (const f of s) {
      const p = l[f];
      if (!p) continue;
      const g = Object.prototype.hasOwnProperty.call(p, "security"), h = _t(p.security), v = g ? h : u ?? n, m = g && Array.isArray(h) && h.length === 0, S = Array.isArray(p.parameters) ? p.parameters.map((O) => ve(O, t)) : [], y = di(S, t), x = pi(p.requestBody, t), $ = fi(p.responses, t);
      r.push({
        name: a,
        method: f,
        path: a,
        summary: p.summary ? String(p.summary) : void 0,
        description: p.description ? String(p.description) : void 0,
        security: v,
        resolvedSecurity: Fn(v, i, m),
        parameters: y,
        requestBody: x,
        responses: $
      });
    }
  }
  return r;
}
function di(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? ve(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? mi(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function pi(e, t) {
  if (!e) return;
  const n = ve(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: hi(n.content || {}, t)
  };
}
function vo(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [i, r] of Object.entries(e)) {
    if (!r || typeof r != "object") continue;
    const s = ve(r, t), a = s.schema, o = s.example ?? (a && typeof a == "object" ? a.example : void 0);
    n[i] = {
      description: s.description ? String(s.description) : void 0,
      required: !!s.required,
      schema: a && typeof a == "object" ? ve(a, t) : void 0,
      example: o !== void 0 ? o : void 0,
      deprecated: !!s.deprecated
    };
  }
  return n;
}
function fi(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [i, r] of Object.entries(e)) {
    const s = ve(r, t), a = s.headers;
    n[i] = {
      statusCode: i,
      description: s.description ? String(s.description) : void 0,
      headers: a ? vo(a, t) : void 0,
      content: s.content ? hi(s.content, t) : void 0
    };
  }
  return n;
}
function bo(e, t, n) {
  if (!e || typeof e != "object") return [];
  const i = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [s, a] of Object.entries(e)) {
    const o = ve(a, t);
    if (!o || typeof o != "object") continue;
    const l = [];
    for (const [u, f] of Object.entries(o))
      if (!(!f || typeof f != "object"))
        for (const p of r) {
          const g = f[p];
          g && l.push(ui(p, u, g, [], t, void 0, void 0, n));
        }
    l.length > 0 && i.push({ name: s, operations: l });
  }
  return i;
}
function hi(e, t) {
  const n = {};
  for (const [i, r] of Object.entries(e)) {
    const s = r;
    n[i] = {
      schema: s.schema ? ve(s.schema, t) : void 0,
      example: s.example,
      examples: s.examples ? mi(s.examples) : void 0
    };
  }
  return n;
}
function mi(e) {
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
function yo(e, t) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const a of t)
    i.set(String(a.name), String(a.description || ""));
  for (const a of e)
    for (const o of a.tags)
      n.has(o) || n.set(o, []), n.get(o).push(a);
  const r = [], s = /* @__PURE__ */ new Set();
  for (const a of t) {
    const o = String(a.name);
    s.has(o) || (s.add(o), r.push({
      name: o,
      description: i.get(o),
      operations: n.get(o) || []
    }));
  }
  for (const [a, o] of n)
    s.has(a) || (s.add(a), r.push({ name: a, description: i.get(a), operations: o }));
  return r;
}
function tt(e) {
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
          const t = tt(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, i] of Object.entries(e.properties))
            t[n] = tt(i);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const i = tt(n);
            i && typeof i == "object" && !Array.isArray(i) && Object.assign(t, i);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return tt(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return tt(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, i] of Object.entries(e.properties))
            t[n] = tt(i);
          return t;
        }
        return;
    }
  }
}
async function xo(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return so(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let pt = [];
const Lr = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function Eo(e) {
  pt = [];
  for (const t of e.tags)
    pt.push({
      type: "tag",
      title: t.name,
      subtitle: t.description,
      tag: t.name,
      keywords: `${t.name} ${t.description || ""}`.toLowerCase()
    });
  for (const t of e.operations)
    pt.push({
      type: "operation",
      title: t.summary || t.operationId,
      subtitle: t.path,
      method: t.method,
      requiresAuth: de(t.resolvedSecurity),
      authBadge: Xr(t.resolvedSecurity) || void 0,
      authTitle: de(t.resolvedSecurity) ? gt(t.resolvedSecurity) : void 0,
      resolvedSecurity: t.resolvedSecurity,
      path: t.path,
      tag: t.tags[0],
      operationId: t.operationId,
      keywords: `${t.method} ${t.path} ${t.summary || ""} ${t.description || ""} ${t.operationId} ${t.tags.join(" ")}`.toLowerCase()
    });
  for (const [t, n] of Object.entries(e.schemas))
    pt.push({
      type: "schema",
      title: t,
      subtitle: n.description || "Schema",
      schemaName: t,
      keywords: `${t} ${n.description || ""} schema model`.toLowerCase()
    });
  if (e.webhooks)
    for (const t of e.webhooks)
      pt.push({
        type: "webhook",
        title: t.summary || t.name,
        subtitle: `${t.method.toUpperCase()} Webhook`,
        method: t.method,
        webhookName: t.name,
        keywords: `${t.name} ${t.method} ${t.summary || ""} ${t.description || ""} webhook`.toLowerCase()
      });
}
function So(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), i = [];
  for (const r of pt) {
    let s = 0, a = !0;
    for (const o of n)
      r.keywords.includes(o) ? (s += 1, r.title.toLowerCase().includes(o) && (s += 3), r.path?.toLowerCase().includes(o) && (s += 2), r.method?.toLowerCase() === o && (s += 2)) : a = !1;
    a && s > 0 && i.push({ entry: r, score: s });
  }
  return i.sort((r, s) => {
    const a = Lr[r.entry.type] ?? 99, o = Lr[s.entry.type] ?? 99;
    return a !== o ? a - o : s.score !== r.score ? s.score - r.score : r.entry.title.localeCompare(s.entry.title);
  }).slice(0, t).map((r) => r.entry);
}
const gi = "puredocs-theme";
function Tr(e, t, n) {
  e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color");
}
function ko() {
  const t = k.get().theme === "light" ? "dark" : "light";
  k.set({ theme: t });
  try {
    localStorage.setItem(gi, t);
  } catch {
  }
}
function No(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(gi);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function vi(e) {
  const t = e.trim();
  return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function _r(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function c(e, t, ...n) {
  const i = document.createElement(e);
  if (t)
    for (const [r, s] of Object.entries(t))
      s === void 0 || s === !1 || (r.startsWith("on") && typeof s == "function" ? i.addEventListener(r.slice(2).toLowerCase(), s) : r === "className" ? i.className = String(s) : r === "innerHTML" ? i.innerHTML = String(s) : r === "textContent" ? i.textContent = String(s) : s === !0 ? i.setAttribute(r, "") : i.setAttribute(r, String(s)));
  for (const r of n)
    r == null || r === !1 || (typeof r == "string" ? i.appendChild(document.createTextNode(r)) : i.appendChild(r));
  return i;
}
function fe(e) {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
}
function wt(e, ...t) {
  fe(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
async function Co(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function wo(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], i = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** i).toFixed(i > 0 ? 1 : 0)} ${n[i]}`;
}
function Ao(e) {
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
function Oo(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function dn(e) {
  return Oo(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function Gn(e) {
  return String(e || "").replace(/\/$/, "");
}
function pn(e) {
  return Gn(e).replace(/^https?:\/\//i, "");
}
function Lo(e) {
  return Gn(dn(e));
}
function bi(e) {
  return pn(dn(e));
}
function nn(e) {
  const { options: t, value: n, ariaLabel: i, onChange: r, className: s, variant: a = "default", invalid: o, dataAttrs: l } = e, u = document.createElement("select");
  a === "inline" && u.setAttribute("data-variant", "inline");
  const f = [];
  if (o && f.push("invalid"), s && f.push(s), u.className = f.join(" "), i && u.setAttribute("aria-label", i), l)
    for (const [p, g] of Object.entries(l))
      u.dataset[p] = g;
  for (const p of t) {
    const g = document.createElement("option");
    g.value = p.value, g.textContent = p.label, n !== void 0 && p.value === n && (g.selected = !0), u.appendChild(g);
  }
  return r && u.addEventListener("change", () => r(u.value)), u;
}
function Ye(e) {
  const {
    type: t = "text",
    placeholder: n,
    value: i,
    ariaLabel: r,
    required: s,
    readOnly: a,
    invalid: o,
    modifiers: l,
    dataAttrs: u,
    className: f,
    onInput: p,
    onChange: g
  } = e, h = document.createElement("input");
  h.type = t;
  const v = [];
  if (l?.includes("filled") && v.push("filled"), o && v.push("invalid"), f && v.push(f), h.className = v.join(" "), n && (h.placeholder = n), i !== void 0 && (h.value = i), r && h.setAttribute("aria-label", r), s && (h.required = !0), a && (h.readOnly = !0), u)
    for (const [m, S] of Object.entries(u))
      h.dataset[m] = S;
  return p && h.addEventListener("input", () => p(h.value)), g && h.addEventListener("change", () => g(h.value)), h;
}
const To = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function _o(e = "secondary") {
  return ["btn", ...To[e]];
}
function Re(e) {
  const { variant: t = "secondary", label: n, icon: i, ariaLabel: r, disabled: s, className: a, onClick: o } = e, l = document.createElement("button");
  l.type = "button";
  const u = _o(t);
  if (a && u.push(...a.split(/\s+/).filter(Boolean)), l.className = u.join(" "), i) {
    const f = document.createElement("span");
    f.className = "btn-icon-slot", f.innerHTML = i, l.appendChild(f);
  }
  if (n) {
    const f = document.createElement("span");
    f.textContent = n, l.appendChild(f);
  }
  return r && l.setAttribute("aria-label", r), s && (l.disabled = !0), o && l.addEventListener("click", o), l;
}
function yi(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : `u-text-${e}`;
}
function Yn(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : `u-bg-${e}-soft`;
}
function Io(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function xi(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function Mo(e, t) {
  return e.color ? e.color : t === "method" ? Io(e.method || e.text) : t === "status" ? xi(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function B(e) {
  const t = document.createElement("span"), n = e.kind || "chip", i = Mo(e, n), s = ["badge", e.size || "m"];
  return n === "status" && s.push("status"), n === "required" && s.push("required"), s.push(yi(i), Yn(i)), e.className && s.push(e.className), t.className = s.join(" "), t.textContent = e.text, t;
}
function rn(e, t) {
  const n = t?.active ?? !1, i = t?.context ?? !1, r = document.createElement("button");
  return r.type = "button", r.className = `badge m interactive${n ? " is-active" : ""}`, i && (r.dataset.badgeContext = "true"), r.textContent = e, r;
}
function Ro(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const i = xi(e), r = ["badge", "status", "m", "interactive", yi(i)];
  return t && r.push("is-active", Yn(i)), n.className = r.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = i, n.textContent = e, n;
}
function Ir(e, t) {
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
  e.classList.add(Yn(n));
}
function Fe(e) {
  const { simple: t, interactive: n, active: i, className: r, onClick: s } = e || {}, a = document.createElement("div"), o = ["card"];
  return t && o.push("simple"), n && o.push("interactive"), i && o.push("active"), r && o.push(r), a.className = o.join(" "), s && (a.classList.contains("interactive") || a.classList.add("interactive"), a.addEventListener("click", s)), a;
}
function Vn(...e) {
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
function fn(e) {
  const t = document.createElement("div"), n = ["card-content"];
  return n.push("flush"), t.className = n.join(" "), t;
}
function Mr(e) {
  if (typeof e == "string" || typeof e == "number") {
    const t = document.createElement("span");
    return t.textContent = String(e), t;
  }
  return e;
}
function Jn(e) {
  const t = document.createElement("div");
  if (t.className = `card-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append(Mr(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? B({ text: String(e.trailing), kind: "chip", size: "m" }) : Mr(e.trailing);
    t.append(n);
  }
  return t;
}
function Bo(e) {
  return typeof e == "string" ? c("span", { textContent: e }) : e;
}
function Ei(e) {
  return c("h2", { textContent: e });
}
function Xn(e, t) {
  const n = c("div", { className: "section-head" });
  return n.append(typeof e == "string" ? Ei(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? B({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function ge(e, ...t) {
  const n = c("div", { className: `block section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(Xn(e.title, e.badge)) : n.append(Ei(e.title)));
  for (const i of t) n.append(Bo(i));
  return n;
}
function Zn(e, t) {
  const n = c("nav", {
    className: `breadcrumb${t?.className ? ` ${t.className}` : ""}`,
    "aria-label": "Breadcrumb"
  }), i = c("div", { className: "breadcrumb-main" });
  return t?.leading?.length && i.append(...t.leading), e.forEach((r, s) => {
    if (s > 0 && i.append(c("span", { className: "breadcrumb-sep", textContent: "/" })), r.href || r.onClick) {
      const a = c("a", {
        className: `breadcrumb-item${r.className ? ` ${r.className}` : ""}`,
        href: r.href || "#",
        textContent: r.label
      });
      r.onClick && a.addEventListener("click", r.onClick), i.append(a);
      return;
    }
    i.append(c("span", {
      className: r.className || "breadcrumb-segment",
      textContent: r.label
    }));
  }), n.append(i), t?.trailing?.length && n.append(c("div", { className: "breadcrumb-trailing" }, ...t.trailing)), n;
}
function Qn(e) {
  const { configured: t, variant: n = "tag", title: i } = e, r = t ? H.unlock : H.lock, s = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-meta-icon", a = n !== "endpoint" ? ` ${s}--${t ? "configured" : "required"}` : "";
  return c("span", {
    className: `${s}${a}`.trim(),
    innerHTML: r,
    ...i ? { title: i, "aria-label": i } : {}
  });
}
function Si(e) {
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
  return t.addEventListener("click", (s) => {
    s.target === t && r();
  }), t.addEventListener("keydown", (s) => {
    s.key === "Escape" && (s.preventDefault(), r());
  }, !0), {
    overlay: t,
    modal: n,
    mount: (s) => {
      (s || document.querySelector(".root") || document.body).appendChild(t);
    },
    close: r
  };
}
let vt = null;
function An() {
  vt && vt.close(), vt = null;
}
function $o(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function jo(e) {
  return Hn(e);
}
function zt(e) {
  requestAnimationFrame(() => e.focus());
}
function On(e, t) {
  const n = c("div", { className: "modal field" });
  return n.append(c("label", { className: "modal label", textContent: e }), t), n;
}
function At(e) {
  return Ye({
    className: "modal input",
    placeholder: e.placeholder,
    value: e.value,
    ariaLabel: e.ariaLabel,
    type: e.type
  });
}
function qo(e) {
  if (!e) return { username: "", password: "" };
  try {
    const t = atob(e).split(":");
    return {
      username: t[0] || "",
      password: t.slice(1).join(":") || ""
    };
  } catch {
    return { username: "", password: "" };
  }
}
function Ln(e, t, n) {
  fe(n);
  const i = k.get().auth.schemes[e] || "", r = t.type, s = (t.scheme || "").toLowerCase();
  if (r === "http" && s === "bearer") {
    const a = c("div", { className: "modal field" }), o = c("div", { className: "modal input-wrap" }), l = At({
      placeholder: "Bearer token...",
      value: i,
      ariaLabel: "Bearer token",
      type: "password"
    }), u = Re({
      variant: "icon",
      icon: H.key,
      ariaLabel: "Показать/скрыть",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => k.setSchemeValue(e, l.value)), o.append(l, u), a.append(c("label", { className: "modal label", textContent: "Token" }), o), n.append(a), zt(l);
  } else if (r === "http" && s === "basic") {
    const a = qo(i), o = At({
      placeholder: "Username",
      value: a.username,
      ariaLabel: "Username"
    });
    n.append(On("Username", o));
    const l = At({
      placeholder: "Password",
      value: a.password,
      ariaLabel: "Password",
      type: "password"
    });
    n.append(On("Password", l));
    const u = () => {
      const f = btoa(`${o.value}:${l.value}`);
      k.setSchemeValue(e, f);
    };
    o.addEventListener("input", u), l.addEventListener("input", u), zt(o);
  } else if (r === "apiKey") {
    const a = c("div", { className: "modal field" }), o = c("div", { className: "modal input-wrap" }), l = At({
      placeholder: `${t.name || "API key"}...`,
      value: i,
      ariaLabel: "API key",
      type: "password"
    }), u = Re({
      variant: "icon",
      icon: H.key,
      ariaLabel: "Показать/скрыть",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => {
      k.setSchemeValue(e, l.value);
    }), o.append(l, u), a.append(c("label", { className: "modal label", textContent: `API Key (${t.name || "key"})` }), o), n.append(a), zt(l);
  } else {
    const a = At({
      placeholder: "Token...",
      value: i,
      ariaLabel: "Token",
      type: "password"
    });
    a.addEventListener("input", () => {
      k.setSchemeValue(e, a.value);
    }), n.append(On("Token / Credential", a)), zt(a);
  }
}
function ki(e, t, n) {
  vt && An();
  const i = Object.entries(e);
  if (i.length === 0) return;
  const r = Si({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Настройка аутентификации",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      vt = null;
    }
  });
  vt = r;
  const s = r.modal, a = c("div", { className: "modal header" });
  a.append(c("h2", { className: "modal title", textContent: "Authentication" }));
  const o = Re({ variant: "icon", icon: H.close, ariaLabel: "Закрыть", onClick: An });
  a.append(o), s.append(a);
  const l = c("div", { className: "modal body" });
  let u = n || k.get().auth.activeScheme || i[0][0];
  e[u] || (u = i[0][0]);
  const f = c("div", { className: "modal fields" });
  if (i.length > 1) {
    const y = c("div", { className: "modal tabs" }), x = [];
    for (const [$, O] of i) {
      const I = !!k.get().auth.schemes[$], D = c("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": $ === u ? "true" : "false"
      }), _ = c("span", { className: "modal tab-label", textContent: jo(O) });
      if (D.append(_), I) {
        const j = c("span", { className: "modal tab-dot", "data-configured": "true" });
        D.append(j);
      }
      D.addEventListener("click", () => {
        if (u !== $) {
          u = $;
          for (const j of x) j.setAttribute("aria-pressed", "false");
          D.setAttribute("aria-pressed", "true"), g(), Ln($, O, f);
        }
      }), x.push(D), y.append(D);
    }
    l.append(y);
  }
  const p = c("div", { className: "modal scheme-desc" });
  function g() {
    const y = e[u];
    if (!y) return;
    fe(p);
    const x = c("div", { className: "modal scheme-title", textContent: $o(y) });
    p.append(x), y.description && p.append(c("div", { className: "modal scheme-text", textContent: y.description }));
  }
  g(), l.append(p);
  const h = e[u];
  h && Ln(u, h, f), l.append(f), s.append(l);
  const v = c("div", { className: "modal footer" }), m = Re({
    variant: "ghost",
    label: "Сбросить",
    onClick: () => {
      k.setSchemeValue(u, "");
      const y = e[u];
      y && Ln(u, y, f);
    }
  }), S = Re({ variant: "primary", label: "Готово", onClick: An });
  v.append(m, c("div", { className: "grow" }), S), s.append(v), r.mount(t ?? document.querySelector(".root") ?? document.body);
}
function sn(e) {
  return !!k.get().auth.schemes[e];
}
function er(e, t) {
  const n = Mt(e, t), i = k.get().auth, r = ln(n, i.schemes, i.activeScheme, i.token);
  return Object.keys(r.headers).length > 0 || Object.keys(r.query).length > 0 || Object.keys(r.cookies).length > 0;
}
function tr(e, t) {
  const n = Mt(e, t), i = k.get().auth;
  return ln(n, i.schemes, i.activeScheme, i.token).headers;
}
function Po(e, t) {
  const n = Mt(e, t), i = k.get().auth;
  return ln(n, i.schemes, i.activeScheme, i.token).query;
}
function Do(e, t) {
  const n = Mt(e, t), i = k.get().auth;
  return ln(n, i.schemes, i.activeScheme, i.token).cookies;
}
function nr(e, t) {
  const n = Mt(e, t);
  return vs(n);
}
function Mt(e, t) {
  if (e)
    return Array.isArray(e) ? Fn(e, t, !1) : e;
}
let Ie = -1, an = null, et = null;
function Ni() {
  on();
  const e = Si({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      an = null, k.set({ searchOpen: !1 });
    }
  });
  an = e;
  const t = e.modal, n = c("div", { className: "search-input-wrap" });
  n.innerHTML = H.search;
  const i = Ye({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), r = c("kbd", { textContent: "ESC", className: "kbd" });
  n.append(i, r), t.append(n);
  const s = c("div", { className: "search-results", role: "listbox" }), a = c("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  s.append(a), t.append(s);
  const o = c("div", { className: "search-footer" });
  o.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(o), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => i.focus()), Ie = -1;
  let l = [];
  i.addEventListener("input", () => {
    const u = i.value;
    l = So(u), Fo(s, l), Yt(s, l.length > 0 ? 0 : -1);
  }), i.addEventListener("keydown", (u) => {
    const f = u;
    f.key === "ArrowDown" ? (f.preventDefault(), l.length > 0 && Yt(s, Math.min(Ie + 1, l.length - 1))) : f.key === "ArrowUp" ? (f.preventDefault(), l.length > 0 && Yt(s, Math.max(Ie - 1, 0))) : f.key === "Enter" ? (f.preventDefault(), Ie >= 0 && Ie < l.length && Ci(l[Ie])) : f.key === "Escape" && (f.preventDefault(), on());
  });
}
function on() {
  if (an) {
    an.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), k.set({ searchOpen: !1 });
}
function Fo(e, t) {
  if (fe(e), t.length === 0) {
    e.append(c("div", { className: "search-empty", textContent: "No results found" }));
    return;
  }
  const n = document.createDocumentFragment();
  t.forEach((i, r) => {
    const s = c("div", {
      className: "search-result",
      role: "option",
      "aria-selected": "false",
      "data-index": String(r)
    });
    i.method ? s.append(B({
      text: i.method.toUpperCase(),
      kind: "method",
      method: i.method
    })) : i.type === "schema" ? s.append(B({ text: "SCH", kind: "chip", size: "m" })) : i.type === "tag" && s.append(B({ text: "TAG", kind: "chip", size: "m" }));
    const a = c("div", { className: "search-result-info min-w-0" });
    if (a.append(c("span", { className: "search-result-title", textContent: i.title })), i.subtitle && a.append(c("span", { className: "search-result-subtitle", textContent: i.subtitle })), s.append(a), i.method && i.requiresAuth && i.resolvedSecurity) {
      const o = k.get().spec, l = er(i.resolvedSecurity, o?.securitySchemes || {});
      s.append(c("span", {
        className: `search-result-lock search-result-lock--${l ? "configured" : "required"}`,
        innerHTML: l ? H.unlock : H.lock,
        title: i.authTitle || "Requires authentication",
        "aria-label": i.authTitle || "Requires authentication"
      }));
    }
    s.addEventListener("click", () => Ci(i)), s.addEventListener("mouseenter", () => {
      Yt(e, r);
    }), n.append(s);
  }), e.append(n);
}
function Yt(e, t) {
  if (Ie === t) return;
  if (Ie >= 0) {
    const i = e.querySelector(`.search-result[data-index="${Ie}"]`);
    i && (i.classList.remove("focused"), i.setAttribute("aria-selected", "false"));
  }
  if (Ie = t, t < 0) return;
  const n = e.querySelector(`.search-result[data-index="${t}"]`);
  n && (n.classList.add("focused"), n.setAttribute("aria-selected", "true"), n.scrollIntoView({ block: "nearest" }));
}
function Ci(e) {
  on(), e.type === "operation" ? oe(ce({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? oe(ce({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? oe(ce({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && oe(ce({ type: "webhook", webhookName: e.webhookName }));
}
function Ho() {
  return et && document.removeEventListener("keydown", et), et = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), k.get().searchOpen ? on() : (k.set({ searchOpen: !0 }), Ni()));
  }, document.addEventListener("keydown", et), () => {
    et && (document.removeEventListener("keydown", et), et = null);
  };
}
function Uo(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let i = null;
  n.forEach((s) => {
    const a = s, o = a.getAttribute("href");
    if (!o) return;
    const l = o.startsWith("#") ? o.slice(1) : o, u = Jr(l), f = xt(u, t);
    s.classList.toggle("active", f), f ? (a.setAttribute("aria-current", "page"), i = a) : a.removeAttribute("aria-current");
  });
  const r = t.type === "endpoint" || t.type === "tag" ? t.tag : t.type === "schema" ? "schemas" : null;
  if (r) {
    const s = e.querySelector(`[data-nav-tag="${CSS.escape(r)}"]`);
    if (s) {
      const a = s.querySelector(".nav-group-header"), o = s.querySelector(".nav-group-items");
      a && o && (a.classList.add("expanded"), o.classList.remove("collapsed"));
    }
  }
  i && requestAnimationFrame(() => {
    const a = i.closest(".nav-group")?.querySelector(".nav-group-header");
    a ? a.scrollIntoView({ block: "start", behavior: "smooth" }) : i.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function Rr(e, t) {
  const n = k.get(), i = n.spec;
  if (!i) return;
  fe(e);
  const r = t.title || i.info.title || "API Docs", s = i.info.version ? `v${i.info.version}` : "", a = c("div", { className: "top" }), o = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  o.innerHTML = H.chevronLeft, o.addEventListener("click", () => k.set({ sidebarOpen: !1 }));
  const l = c("a", { className: "title", href: "/", textContent: r });
  l.addEventListener("click", (O) => {
    O.preventDefault(), oe("/");
  });
  const u = c("div", { className: "title-wrap" });
  if (u.append(l), s && u.append(c("span", { className: "version", textContent: s })), a.append(o, u), i.securitySchemes && Object.keys(i.securitySchemes).length > 0) {
    const O = n.auth, I = Object.keys(i.securitySchemes), D = O.activeScheme || I[0] || "", _ = sn(D), j = c("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication",
      title: _ ? `Auth: ${D}` : "Configure authentication"
    });
    j.innerHTML = _ ? H.unlock : H.lock, j.classList.toggle("active", _), j.addEventListener("click", () => {
      ki(
        i.securitySchemes,
        e.closest(".root") ?? void 0,
        D
      );
    }), k.subscribe(() => {
      const X = k.get().auth.activeScheme || I[0] || "", z = sn(X);
      j.innerHTML = z ? H.unlock : H.lock, j.title = z ? `Auth: ${X}` : "Configure authentication", j.classList.toggle("active", z);
    }), a.append(j);
  }
  const f = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (f.innerHTML = k.get().theme === "light" ? H.moon : H.sun, f.addEventListener("click", () => {
    ko(), f.innerHTML = k.get().theme === "light" ? H.moon : H.sun;
  }), e.append(a), n.environments.length > 1) {
    const O = Yo(n);
    e.append(O), k.subscribe(() => {
      const I = k.get();
      O.value !== I.activeEnvironment && (O.value = I.activeEnvironment);
    });
  }
  const p = c("div", { className: "search" }), g = c("span", { className: "search-icon", innerHTML: H.search }), h = Ye({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), v = c("span", { className: "kbd", textContent: "⌘K" });
  h.addEventListener("focus", () => {
    k.set({ searchOpen: !0 }), h.blur(), Ni();
  }), p.append(g, h, v), e.append(p);
  const m = c("nav", { className: "nav", "aria-label": "API navigation" }), S = Ko({ type: "overview" }, n.route);
  m.append(S);
  for (const O of i.tags) {
    if (O.operations.length === 0) continue;
    const I = zo(O, n.route);
    m.append(I);
  }
  if (i.webhooks && i.webhooks.length > 0) {
    const O = c("div", { className: "nav-group", "data-nav-tag": "webhooks" }), I = Br("Webhooks", i.webhooks.length), D = c("div", { className: "nav-group-items" });
    for (const j of i.webhooks) {
      const W = { type: "webhook", webhookName: j.name }, X = $r(j.summary || j.name, j.method, W, n.route);
      X.classList.add("nav-item-webhook"), D.append(X);
    }
    I.addEventListener("click", () => {
      I.classList.toggle("expanded"), D.classList.toggle("collapsed");
    });
    const _ = n.route.type === "webhook";
    I.classList.toggle("expanded", _), D.classList.toggle("collapsed", !_), O.append(I, D), m.append(O);
  }
  const y = Object.keys(i.schemas);
  if (y.length > 0) {
    const O = c("div", { className: "nav-group" }), I = Br("Schemas", y.length), D = c("div", { className: "nav-group-items" });
    for (const j of y) {
      const X = $r(j, void 0, { type: "schema", schemaName: j }, n.route);
      D.append(X);
    }
    I.addEventListener("click", () => {
      I.classList.toggle("expanded"), D.classList.toggle("collapsed");
    });
    const _ = n.route.type === "schema";
    I.classList.toggle("expanded", _), D.classList.toggle("collapsed", !_), O.setAttribute("data-nav-tag", "schemas"), O.append(I, D), m.append(O);
  }
  e.append(m);
  const x = c("div", { className: "footer" }), $ = c("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  $.textContent = `puredocs.dev${s ? ` ${s}` : ""}`, x.append($), x.append(f), e.append(x), requestAnimationFrame(() => {
    const O = m.querySelector(".nav-item.active");
    if (O) {
      const D = O.closest(".nav-group")?.querySelector(".nav-group-header");
      D ? D.scrollIntoView({ block: "start", behavior: "smooth" }) : O.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function zo(e, t, n) {
  const i = c("div", { className: "nav-group", "data-nav-tag": e.name }), r = Wo(e, t), s = c("div", { className: "nav-group-items" }), a = t.type === "tag" && t.tag === e.name || e.operations.some((o) => xt(Bn(o, e.name), t));
  for (const o of e.operations) {
    const l = Bn(o, e.name), u = Go(o, l, t);
    s.append(u);
  }
  return r.addEventListener("click", (o) => {
    o.target.closest(".nav-group-link") || (r.classList.toggle("expanded"), s.classList.toggle("collapsed"));
  }), s.classList.toggle("collapsed", !a), i.append(r, s), i;
}
function Wo(e, t) {
  const n = t.type === "tag" && t.tag === e.name || e.operations.some((a) => xt(Bn(a, e.name), t)), i = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(n), tabIndex: 0 }), r = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": n ? "Collapse" : "Expand"
  });
  r.innerHTML = H.chevronRight, r.addEventListener("click", (a) => {
    a.preventDefault(), a.stopPropagation(), i.click();
  });
  const s = c("a", {
    className: "nav-group-link",
    href: ce({ type: "tag", tag: e.name })
  });
  return s.append(
    c("span", { className: "nav-group-title", textContent: e.name }),
    c("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), s.addEventListener("click", (a) => {
    a.preventDefault(), oe(ce({ type: "tag", tag: e.name }));
  }), i.append(r, s), i.classList.toggle("expanded", n), i.addEventListener("keydown", (a) => {
    (a.key === "Enter" || a.key === " ") && (a.preventDefault(), r.click());
  }), i;
}
function Br(e, t) {
  const n = c("div", { className: "nav-group-header focus-ring", role: "button", "aria-expanded": "true", tabindex: "0" }), i = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": "Toggle section"
  });
  i.innerHTML = H.chevronRight, i.addEventListener("click", (s) => {
    s.preventDefault(), s.stopPropagation(), n.click();
  });
  const r = c("span", { className: "nav-group-link nav-group-link--static" });
  return r.append(
    c("span", { className: "nav-group-title", textContent: e }),
    c("span", { className: "nav-group-count", textContent: String(t) })
  ), n.append(i, r), n.addEventListener("keydown", (s) => {
    (s.key === "Enter" || s.key === " ") && (s.preventDefault(), n.click());
  }), n;
}
function $r(e, t, n, i) {
  const r = xt(n, i), s = c("a", {
    className: `nav-item${r ? " active" : ""}`,
    href: ce(n),
    role: "link",
    "aria-current": r ? "page" : void 0
  }), a = B(t ? {
    text: t.toUpperCase(),
    kind: "method",
    method: t
  } : {
    text: "GET",
    kind: "method",
    method: "get",
    className: "placeholder"
  });
  return t || a.setAttribute("aria-hidden", "true"), s.append(a), s.append(c("span", { className: "nav-item-label", textContent: e })), s.addEventListener("click", (o) => {
    o.preventDefault(), oe(ce(n));
  }), s;
}
function Ko(e, t) {
  const n = xt(e, t), i = c("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: ce(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), r = c("span", { className: "nav-overview-icon-slot" });
  r.innerHTML = H.globe;
  const s = c("span", { className: "nav-item-label", textContent: "Overview" });
  return i.append(r, s), i.addEventListener("click", (a) => {
    a.preventDefault(), oe(ce(e));
  }), i;
}
function Go(e, t, n) {
  const i = xt(t, n), r = c("a", {
    className: `nav-item${i ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: ce(t),
    title: `${e.method.toUpperCase()} ${e.path}`,
    "aria-current": i ? "page" : void 0
  }), s = k.get().spec, a = de(e.resolvedSecurity) ? Qn({
    configured: er(e.resolvedSecurity, s?.securitySchemes || {}),
    variant: "nav",
    title: gt(e.resolvedSecurity)
  }) : null;
  return r.append(
    B({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    c("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...a ? [a] : []
  ), r.addEventListener("click", (o) => {
    o.preventDefault(), oe(ce(t));
  }), r;
}
function Bn(e, t) {
  return {
    type: "endpoint",
    tag: t,
    method: e.method,
    path: e.path,
    operationId: e.operationId
  };
}
function xt(e, t) {
  return e.type !== t.type ? !1 : e.type === "overview" ? !0 : e.type === "tag" ? e.tag === t.tag : e.type === "endpoint" ? e.method === t.method && e.path === t.path : e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function Yo(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((r) => {
    const s = t.find((o) => o.name === r.name), a = pn((s?.baseUrl ?? r.baseUrl) || "");
    return { value: r.name, label: a || "(no URL)" };
  });
  return nn({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (r) => k.setActiveEnvironment(r),
    className: "env"
  });
}
function wi(e, t, n = "No operations") {
  const i = c("div", { className: "summary-line" });
  for (const s of e)
    i.append(B({
      text: `${s.value} ${s.label}`,
      kind: "chip",
      size: "m"
    }));
  const r = ["get", "post", "put", "patch", "delete", "head", "options"];
  for (const s of r) {
    const a = t[s] || 0;
    a !== 0 && i.append(B({
      kind: "method",
      method: s,
      size: "m",
      text: `${a} ${s.toUpperCase()}`
    }));
  }
  return i.childNodes.length || i.append(B({
    text: n,
    kind: "chip",
    size: "m"
  })), i;
}
function Vo(e, t) {
  const n = [], i = Jo(e, t);
  return i && n.push(i), n;
}
function Jo(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = ge({ title: "Authentication" }), i = [];
  for (const [r, s] of Object.entries(e)) {
    const a = sn(r), o = Fe({ className: "card-group card-auth" }), l = c("div", { className: "card-auth-main" }), u = c("div", { className: "card-info card-auth-info" }), f = `${s.type}${s.scheme ? ` / ${s.scheme}` : ""}`;
    u.append(
      c("h3", { textContent: r }),
      c("p", { className: "card-auth-type", textContent: f })
    ), s.description && u.append(c("p", { className: "card-auth-desc", textContent: String(s.description) }));
    const p = Re({
      variant: "secondary",
      icon: a ? H.check : H.settings,
      label: a ? "Success" : "Set",
      className: `card-auth-config${a ? " active is-configured" : ""}`,
      onClick: (g) => {
        g.stopPropagation(), ki(e, t, r);
      }
    });
    l.append(u), o.append(l, p), i.push({ name: r, btn: p }), n.append(o);
  }
  return k.subscribe(() => {
    for (const r of i) {
      const s = sn(r.name);
      r.btn.className = `btn secondary m card-auth-config${s ? " active is-configured" : ""}`, r.btn.innerHTML = `<span class="btn-icon-slot">${s ? H.check : H.settings}</span><span>${s ? "Success" : "Set"}</span>`;
    }
  }), n;
}
async function jr(e, t) {
  fe(e);
  const n = k.get().spec;
  if (!n) return;
  const i = c("div", { className: "block header" }), r = c("div", { className: "title" });
  r.append(
    c("h1", { textContent: n.info.title }),
    c("span", { className: "version", textContent: `v${n.info.version}` })
  ), i.append(r), n.info.description && i.append(c("p", { textContent: n.info.description })), e.append(i);
  const s = n.operations.filter((f) => de(f.resolvedSecurity)).length, a = n.operations.filter((f) => f.deprecated).length, o = Zo(n.operations);
  e.append(ge(
    { className: "summary" },
    wi(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: s },
        { label: "Deprecated", value: a }
      ],
      o,
      "No operations"
    )
  ));
  const l = e.closest(".root") ?? void 0, u = Vo(n.securitySchemes || {}, l);
  for (const f of u)
    e.append(f);
  if (n.servers.length > 0) {
    const f = ge({ title: "Servers" }), p = k.get(), g = p.initialEnvironments || p.environments;
    for (const h of n.servers) {
      const v = g.find((I) => I.baseUrl === h.url), m = v?.name === p.activeEnvironment, S = Fe({
        interactive: !0,
        active: m,
        className: "card-group",
        onClick: () => {
          v && k.setActiveEnvironment(v.name);
        }
      });
      S.title = "Click to set as active environment";
      const y = c("div", { className: "card-info" }), x = c("div", { className: "inline-cluster inline-cluster-sm" }), $ = c("span", { className: "icon-muted" });
      $.innerHTML = H.server, x.append($, c("code", { textContent: h.url })), y.append(x), h.description && y.append(c("p", { textContent: h.description }));
      const O = c("div", { className: "card-badges" });
      S.append(y, O), f.append(S);
    }
    e.append(f);
  }
  if (n.tags.length > 0) {
    const f = ge({ title: "API Groups" });
    for (const p of n.tags)
      p.operations.length !== 0 && f.append(Xo(p));
    e.append(f);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const f = ge({ title: "Webhooks" });
    for (const p of n.webhooks) {
      const g = Fe({
        interactive: !0,
        className: "card-group",
        onClick: () => oe(ce({ type: "webhook", webhookName: p.name }))
      }), h = c("div", { className: "card-info" });
      h.append(
        c("h3", { textContent: p.summary || p.name }),
        p.description ? c("p", { textContent: p.description }) : c("p", { textContent: `${p.method.toUpperCase()} webhook` })
      );
      const v = c("div", { className: "card-badges" });
      v.append(
        B({ text: "WH", kind: "webhook", size: "s" }),
        B({ text: p.method.toUpperCase(), kind: "method", method: p.method, size: "s" })
      ), g.append(h, v), f.append(g);
    }
    e.append(f);
  }
}
function Xo(e) {
  const t = Fe({
    interactive: !0,
    className: "card-group",
    onClick: () => oe(ce({ type: "tag", tag: e.name }))
  }), n = c("div", { className: "card-info" });
  n.append(
    c("h3", { textContent: e.name }),
    c("p", { textContent: e.description || `${e.operations.length} endpoints` })
  );
  const i = Qo(e), r = c("div", { className: "card-badges" });
  for (const [s, a] of Object.entries(i)) {
    const o = B({
      text: s.toUpperCase(),
      kind: "method",
      method: s,
      size: "m"
    });
    o.textContent = `${a} ${s.toUpperCase()}`, r.append(o);
  }
  return t.append(n, r), t;
}
function Zo(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Qo(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Rt(e) {
  if (!e) return "any";
  if (e.$ref) return e.$ref.split("/").pop() || "ref";
  let t = e.type || "";
  return e.allOf ? t = "allOf" : e.oneOf ? t = "oneOf" : e.anyOf ? t = "anyOf" : e.enum ? t = "enum" : e.format && (t += `<${e.format}>`), e.type === "array" && e.items && !e.enum && (t = `${e.items.type || e.items.$ref?.split("/").pop() || "any"}[]`), e.nullable && (t += " | null"), t || "object";
}
function ec(e) {
  const t = c("div", { className: "schema" }), n = c("div", { className: "body" });
  t.append(n);
  const i = [];
  Oi(n, e, "", 0, /* @__PURE__ */ new Set(), i);
  const r = i.length > 0, s = () => i.some(({ children: o }) => o.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const o = !s();
    _i(i, o);
  }, isExpanded: s, hasExpandable: r };
}
function yt(e, t) {
  const n = Fe(), i = Rt(e), r = fn(), s = c("div", { className: "schema" }), a = c("div", { className: "body" });
  s.append(a);
  const o = [];
  if (Oi(a, e, "", 0, /* @__PURE__ */ new Set(), o), r.append(s), t) {
    const l = Vn(), u = typeof t == "string" ? c("h3", { textContent: t }) : t, f = o.length > 0, p = f && o.some(({ children: v }) => v.style.display !== "none"), g = B({ text: i, kind: "chip", size: "m" }), h = f ? c("button", {
      className: p ? "schema-collapse-btn is-expanded" : "schema-collapse-btn",
      type: "button",
      title: p ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (h && (h.innerHTML = H.chevronDown, h.addEventListener("click", (v) => {
      v.stopPropagation();
      const m = !h.classList.contains("is-expanded");
      _i(o, m), h.classList.toggle("is-expanded", m), h.title = m ? "Collapse all fields" : "Expand all fields";
    })), u.classList.contains("card-row"))
      u.classList.add("schema-header-row"), u.append(g), h && u.append(h), l.append(u);
    else {
      const v = c("div", { className: "card-row schema-header-row" });
      v.append(u, g), h && v.append(h), l.append(v);
    }
    n.prepend(l);
  }
  return n.append(r), n;
}
function Ai(e, t) {
  const { headerTitle: n, withEnumAndDefault: i = !0 } = t, r = e.map((u) => {
    const f = c("div", { className: "schema-row role-flat role-params" }), p = c("div", { className: "schema-main-row" }), g = c("div", { className: "schema-name-wrapper" });
    g.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: u.name })
    );
    const h = c("div", { className: "schema-meta-wrapper" });
    h.append(B({
      text: u.schema ? Rt(u.schema) : "unknown",
      kind: "chip",
      size: "m"
    })), u.required && h.append(B({ text: "required", kind: "required", size: "m" })), p.append(g, h), f.append(p);
    const v = c("div", { className: "schema-desc-col is-root" });
    u.description && v.append(c("p", { textContent: u.description }));
    const m = u.schema?.enum, S = u.schema?.default !== void 0;
    if (i && (m && m.length > 0 || S)) {
      const y = c("div", { className: "schema-enum-values" });
      if (S && y.append(B({
        text: `Default: ${JSON.stringify(u.schema.default)}`,
        kind: "chip",
        size: "s"
      })), m)
        for (const x of m) {
          const $ = String(x);
          $ !== u.in && y.append(B({ text: $, kind: "chip", size: "s" }));
        }
      v.append(y);
    }
    return v.children.length > 0 && f.append(v), f;
  }), s = Fe(), a = fn(), o = c("div", { className: "params" }), l = c("div", { className: "body role-params" });
  return l.append(...r), o.append(l), a.append(o), s.append(
    Vn(Jn({ title: n })),
    a
  ), s;
}
function Wt(e, t, n, i, r, s, a) {
  const o = Rt(n), l = tc(n), u = Ti(t, o, n, i, l, r);
  if (e.append(u), l) {
    const f = c("div", { className: "schema-children" });
    f.style.display = "block";
    const p = new Set(s);
    p.add(n), Li(f, n, i + 1, p, a), e.append(f), a?.push({ row: u, children: f }), u.querySelector(".schema-toggle")?.classList.add("is-expanded"), u.classList.add("focus-ring"), u.setAttribute("aria-expanded", "true"), u.setAttribute("tabindex", "0"), u.addEventListener("click", () => {
      const g = f.style.display !== "none";
      $n(u, f, !g);
    }), u.addEventListener("keydown", (g) => {
      if (g.key !== "Enter" && g.key !== " ") return;
      g.preventDefault();
      const h = f.style.display !== "none";
      $n(u, f, !h);
    });
  }
}
function Oi(e, t, n, i, r, s) {
  if (r.has(t)) {
    e.append(Ti("[circular]", "circular", { description: "" }, i, !1, !1));
    return;
  }
  {
    const a = new Set(r);
    a.add(t), Li(e, t, i, a, s);
    return;
  }
}
function Li(e, t, n, i, r) {
  const s = new Set(t.required || []);
  if (t.properties)
    for (const [a, o] of Object.entries(t.properties))
      Wt(e, a, o, n, s.has(a), i, r);
  t.items && t.type === "array" && Wt(e, "[item]", t.items, n, !1, i, r);
  for (const a of ["allOf", "oneOf", "anyOf"]) {
    const o = t[a];
    if (Array.isArray(o))
      for (let l = 0; l < o.length; l++)
        Wt(e, `${a}[${l}]`, o[l], n, !1, i, r);
  }
  t.additionalProperties && typeof t.additionalProperties == "object" && Wt(e, "[additionalProperties]", t.additionalProperties, n, !1, i, r);
}
function Ti(e, t, n, i, r, s) {
  const a = [
    "schema-row",
    i === 0 ? "is-root" : "",
    i === 0 && !r ? "is-leaf" : ""
  ].filter(Boolean).join(" "), o = c("div", { className: a, role: r ? "button" : void 0 });
  o.setAttribute("data-depth", String(i)), o.style.setProperty("--schema-depth", String(i));
  const l = c("div", { className: "schema-main-row" }), u = c("div", { className: "schema-name-wrapper" });
  r ? u.append(c("span", { className: "schema-toggle", innerHTML: H.chevronRight })) : u.append(c("span", { className: "schema-spacer" })), u.append(c("span", { textContent: e })), l.append(u);
  const f = c("div", { className: "schema-meta-wrapper" });
  f.append(B({ text: t, kind: "chip", size: "m" })), s && f.append(B({ text: "required", kind: "required", size: "m" })), l.append(f), o.append(l);
  const p = c("div", { className: `schema-desc-col${i === 0 ? " is-root" : ""}` });
  n.description && p.append(c("p", { textContent: String(n.description) }));
  const g = n.enum, h = Array.isArray(g) && g.length > 0, v = n.default, m = v !== void 0, S = h && m ? g.some((x) => Tn(x, v)) : !1, y = nc(n, !h || !m);
  if (y.length > 0 || h) {
    const x = c("div", { className: "schema-constraints-row" });
    for (const $ of y)
      x.append(B({
        text: $,
        kind: "chip",
        size: $.startsWith("default: ") ? "s" : "m"
      }));
    if (h) {
      const $ = m && S ? [v, ...g.filter((O) => !Tn(O, v))] : g;
      m && !S && x.append(B({
        text: `default: ${Vt(v)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value is-default"
      }));
      for (const O of $) {
        const I = m && Tn(O, v);
        x.append(B({
          text: I ? `default: ${Vt(O)}` : Vt(O),
          kind: "chip",
          size: "s",
          className: I ? "schema-enum-value is-default" : "schema-enum-value"
        }));
      }
    }
    p.append(x);
  }
  return p.children.length > 0 && o.append(p), o;
}
function tc(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function nc(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${Vt(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function _i(e, t) {
  for (const { row: n, children: i } of e)
    $n(n, i, t);
}
function $n(e, t, n) {
  t.style.display = n ? "block" : "none", e.querySelector(".schema-toggle")?.classList.toggle("is-expanded", n), e.setAttribute("aria-expanded", n ? "true" : "false");
}
function Vt(e) {
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (e === null) return "null";
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function Tn(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function rc(e) {
  const { method: t, url: n, headers: i = {}, body: r, timeout: s = 3e4 } = e, a = new AbortController(), o = setTimeout(() => a.abort(), s), l = performance.now();
  try {
    const u = typeof FormData < "u" && r instanceof FormData, f = {
      method: t.toUpperCase(),
      headers: u ? void 0 : i,
      signal: a.signal,
      credentials: "include"
    };
    if (u) {
      const S = {};
      for (const [y, x] of Object.entries(i))
        y.toLowerCase() !== "content-type" && (S[y] = x);
      Object.keys(S).length > 0 && (f.headers = S);
    }
    r && !["GET", "HEAD"].includes(t.toUpperCase()) && (f.body = r);
    const p = await fetch(n, f), g = performance.now() - l, h = await p.text(), v = new TextEncoder().encode(h).length, m = {};
    return p.headers.forEach((S, y) => {
      m[y.toLowerCase()] = S;
    }), ic(h, m), {
      status: p.status,
      statusText: p.statusText,
      headers: m,
      body: h,
      duration: g,
      size: v
    };
  } catch (u) {
    const f = performance.now() - l;
    return u.name === "AbortError" ? {
      status: 0,
      statusText: "Request timed out",
      headers: {},
      body: `Request timed out after ${s}ms`,
      duration: f,
      size: 0
    } : {
      status: 0,
      statusText: "Network Error",
      headers: {},
      body: u.message || "Unknown network error",
      duration: f,
      size: 0
    };
  } finally {
    clearTimeout(o);
  }
}
function ic(e, t) {
  const n = k.get().auth;
  if (n.locked) return;
  const i = k.get().spec;
  let r = n.activeScheme;
  if (i) {
    for (const [a, o] of Object.entries(i.securitySchemes))
      if (o.type === "http" && o.scheme?.toLowerCase() === "bearer") {
        r = a;
        break;
      }
  }
  const s = t["x-new-access-token"];
  if (s) {
    r ? (k.setSchemeValue(r, s), k.setAuth({ source: "auto-header" })) : k.setAuth({ token: s, source: "auto-header" });
    return;
  }
  try {
    const a = JSON.parse(e), o = a.accessToken || a.access_token || a.token;
    typeof o == "string" && o.length > 10 && (r ? (k.setSchemeValue(r, o), k.setAuth({ source: "auto-body" })) : k.setAuth({ token: o, source: "auto-body" }));
  } catch {
  }
}
function sc(e, t, n, i) {
  let r = t;
  for (const [u, f] of Object.entries(n))
    r = r.replace(`{${u}}`, encodeURIComponent(f));
  const a = e.replace(/\/+$/, "") + r, o = new URLSearchParams();
  for (const [u, f] of Object.entries(i))
    f && o.set(u, f);
  const l = o.toString();
  return l ? `${a}?${l}` : a;
}
function _n(e) {
  return [
    { language: "curl", label: "cURL", code: ac(e) },
    { language: "javascript", label: "JavaScript", code: oc(e) },
    { language: "python", label: "Python", code: cc(e) },
    { language: "go", label: "Go", code: lc(e) }
  ];
}
function ac({ method: e, url: t, headers: n, body: i }) {
  const r = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [s, a] of Object.entries(n))
    r.push(`  -H '${s}: ${a}'`);
  return i && r.push(`  -d '${i}'`), r.join(` \\
`);
}
function oc({ method: e, url: t, headers: n, body: i }) {
  const r = [];
  r.push(`  method: '${e.toUpperCase()}'`);
  const s = Object.entries(n);
  if (s.length > 0) {
    const a = s.map(([o, l]) => `    '${o}': '${l}'`).join(`,
`);
    r.push(`  headers: {
${a}
  }`);
  }
  return i && r.push(`  body: JSON.stringify(${i})`), `const response = await fetch('${t}', {
${r.join(`,
`)}
});

const data = await response.json();
console.log(data);`;
}
function cc({ method: e, url: t, headers: n, body: i }) {
  const r = ["import requests", ""], s = Object.entries(n);
  if (s.length > 0) {
    const o = s.map(([l, u]) => `    "${l}": "${u}"`).join(`,
`);
    r.push(`headers = {
${o}
}`);
  }
  i && r.push(`payload = ${i}`);
  const a = [`"${t}"`];
  return s.length > 0 && a.push("headers=headers"), i && a.push("json=payload"), r.push(""), r.push(`response = requests.${e.toLowerCase()}(${a.join(", ")})`), r.push("print(response.json())"), r.join(`
`);
}
function lc({ method: e, url: t, headers: n, body: i }) {
  const r = [
    "package main",
    "",
    "import (",
    '    "fmt"',
    '    "io"',
    '    "net/http"'
  ];
  i && r.push('    "strings"'), r.push(")", "", "func main() {"), i ? (r.push(`    body := strings.NewReader(\`${i}\`)`), r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", body)`)) : r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", nil)`), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }");
  for (const [s, a] of Object.entries(n))
    r.push(`    req.Header.Set("${s}", "${a}")`);
  return r.push(""), r.push("    resp, err := http.DefaultClient.Do(req)"), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }"), r.push("    defer resp.Body.Close()"), r.push(""), r.push("    data, _ := io.ReadAll(resp.Body)"), r.push("    fmt.Println(string(data))"), r.push("}"), r.join(`
`);
}
function uc(e) {
  if (e.length === 0) return [];
  const t = (r, s, a) => {
    if (s && r.examples?.[s] !== void 0) {
      const o = r.examples[s], l = o?.value ?? o.value;
      if (l != null) return String(l);
    }
    return a !== void 0 && r.schema?.enum && r.schema.enum[a] !== void 0 ? String(r.schema.enum[a]) : r.example !== void 0 && r.example !== null ? String(r.example) : r.schema?.example !== void 0 && r.schema.example !== null ? String(r.schema.example) : r.schema?.default !== void 0 && r.schema.default !== null ? String(r.schema.default) : r.schema?.enum && r.schema.enum.length > 0 ? String(r.schema.enum[0]) : r.schema?.type === "integer" || r.schema?.type === "number" ? "0" : r.schema?.type === "boolean" ? "true" : r.in === "path" ? "id" : "value";
  }, n = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r.examples && typeof r.examples == "object")
      for (const s of Object.keys(r.examples)) n.add(s);
  const i = [];
  if (n.size > 0)
    for (const r of n) {
      const s = {};
      for (const l of e)
        s[l.name] = t(l, r);
      const o = e.find((l) => l.examples?.[r])?.examples?.[r];
      i.push({ name: r, summary: o?.summary, values: s });
    }
  else {
    const r = e.find((s) => s.schema?.enum && s.schema.enum.length > 1);
    if (r?.schema?.enum)
      for (let s = 0; s < r.schema.enum.length; s++) {
        const a = {};
        for (const l of e)
          a[l.name] = l === r ? t(l, null, s) : t(l, null);
        const o = String(r.schema.enum[s]);
        i.push({ name: o, values: a });
      }
    else {
      const s = {};
      for (const a of e)
        s[a.name] = t(a, null);
      i.push({ name: "Default", values: s });
    }
  }
  return i;
}
function Ii(e) {
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
    const n = tt(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function dc(e) {
  const t = [e.summary, e.description].filter(Boolean);
  return [...new Set(t)].join(" — ") || e.name;
}
function qr(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function pc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var In, Pr;
function fc() {
  if (Pr) return In;
  Pr = 1;
  function e(d) {
    return d instanceof Map ? d.clear = d.delete = d.set = function() {
      throw new Error("map is read-only");
    } : d instanceof Set && (d.add = d.clear = d.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(d), Object.getOwnPropertyNames(d).forEach((b) => {
      const N = d[b], P = typeof N;
      (P === "object" || P === "function") && !Object.isFrozen(N) && e(N);
    }), d;
  }
  class t {
    /**
     * @param {CompiledMode} mode
     */
    constructor(b) {
      b.data === void 0 && (b.data = {}), this.data = b.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function n(d) {
    return d.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function i(d, ...b) {
    const N = /* @__PURE__ */ Object.create(null);
    for (const P in d)
      N[P] = d[P];
    return b.forEach(function(P) {
      for (const ee in P)
        N[ee] = P[ee];
    }), /** @type {T} */
    N;
  }
  const r = "</span>", s = (d) => !!d.scope, a = (d, { prefix: b }) => {
    if (d.startsWith("language:"))
      return d.replace("language:", "language-");
    if (d.includes(".")) {
      const N = d.split(".");
      return [
        `${b}${N.shift()}`,
        ...N.map((P, ee) => `${P}${"_".repeat(ee + 1)}`)
      ].join(" ");
    }
    return `${b}${d}`;
  };
  class o {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(b, N) {
      this.buffer = "", this.classPrefix = N.classPrefix, b.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(b) {
      this.buffer += n(b);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(b) {
      if (!s(b)) return;
      const N = a(
        b.scope,
        { prefix: this.classPrefix }
      );
      this.span(N);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(b) {
      s(b) && (this.buffer += r);
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
    span(b) {
      this.buffer += `<span class="${b}">`;
    }
  }
  const l = (d = {}) => {
    const b = { children: [] };
    return Object.assign(b, d), b;
  };
  class u {
    constructor() {
      this.rootNode = l(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(b) {
      this.top.children.push(b);
    }
    /** @param {string} scope */
    openNode(b) {
      const N = l({ scope: b });
      this.add(N), this.stack.push(N);
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
    walk(b) {
      return this.constructor._walk(b, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(b, N) {
      return typeof N == "string" ? b.addText(N) : N.children && (b.openNode(N), N.children.forEach((P) => this._walk(b, P)), b.closeNode(N)), b;
    }
    /**
     * @param {Node} node
     */
    static _collapse(b) {
      typeof b != "string" && b.children && (b.children.every((N) => typeof N == "string") ? b.children = [b.children.join("")] : b.children.forEach((N) => {
        u._collapse(N);
      }));
    }
  }
  class f extends u {
    /**
     * @param {*} options
     */
    constructor(b) {
      super(), this.options = b;
    }
    /**
     * @param {string} text
     */
    addText(b) {
      b !== "" && this.add(b);
    }
    /** @param {string} scope */
    startScope(b) {
      this.openNode(b);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(b, N) {
      const P = b.root;
      N && (P.scope = `language:${N}`), this.add(P);
    }
    toHTML() {
      return new o(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function p(d) {
    return d ? typeof d == "string" ? d : d.source : null;
  }
  function g(d) {
    return m("(?=", d, ")");
  }
  function h(d) {
    return m("(?:", d, ")*");
  }
  function v(d) {
    return m("(?:", d, ")?");
  }
  function m(...d) {
    return d.map((N) => p(N)).join("");
  }
  function S(d) {
    const b = d[d.length - 1];
    return typeof b == "object" && b.constructor === Object ? (d.splice(d.length - 1, 1), b) : {};
  }
  function y(...d) {
    return "(" + (S(d).capture ? "" : "?:") + d.map((P) => p(P)).join("|") + ")";
  }
  function x(d) {
    return new RegExp(d.toString() + "|").exec("").length - 1;
  }
  function $(d, b) {
    const N = d && d.exec(b);
    return N && N.index === 0;
  }
  const O = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function I(d, { joinWith: b }) {
    let N = 0;
    return d.map((P) => {
      N += 1;
      const ee = N;
      let te = p(P), A = "";
      for (; te.length > 0; ) {
        const w = O.exec(te);
        if (!w) {
          A += te;
          break;
        }
        A += te.substring(0, w.index), te = te.substring(w.index + w[0].length), w[0][0] === "\\" && w[1] ? A += "\\" + String(Number(w[1]) + ee) : (A += w[0], w[0] === "(" && N++);
      }
      return A;
    }).map((P) => `(${P})`).join(b);
  }
  const D = /\b\B/, _ = "[a-zA-Z]\\w*", j = "[a-zA-Z_]\\w*", W = "\\b\\d+(\\.\\d+)?", X = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", z = "\\b(0b[01]+)", xe = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", Ve = (d = {}) => {
    const b = /^#![ ]*\//;
    return d.binary && (d.begin = m(
      b,
      /.*\b/,
      d.binary,
      /\b.*/
    )), i({
      scope: "meta",
      begin: b,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (N, P) => {
        N.index !== 0 && P.ignoreMatch();
      }
    }, d);
  }, He = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, Et = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [He]
  }, hn = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [He]
  }, mn = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, Be = function(d, b, N = {}) {
    const P = i(
      {
        scope: "comment",
        begin: d,
        end: b,
        contains: []
      },
      N
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
    const ee = y(
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
          ee,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), P;
  }, $t = Be("//", "$"), jt = Be("/\\*", "\\*/"), St = Be("#", "$"), R = {
    scope: "number",
    begin: W,
    relevance: 0
  }, G = {
    scope: "number",
    begin: X,
    relevance: 0
  }, le = {
    scope: "number",
    begin: z,
    relevance: 0
  }, Ee = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      He,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [He]
      }
    ]
  }, Je = {
    scope: "title",
    begin: _,
    relevance: 0
  }, Z = {
    scope: "title",
    begin: j,
    relevance: 0
  }, Q = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + j,
    relevance: 0
  };
  var Ae = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: Et,
    BACKSLASH_ESCAPE: He,
    BINARY_NUMBER_MODE: le,
    BINARY_NUMBER_RE: z,
    COMMENT: Be,
    C_BLOCK_COMMENT_MODE: jt,
    C_LINE_COMMENT_MODE: $t,
    C_NUMBER_MODE: G,
    C_NUMBER_RE: X,
    END_SAME_AS_BEGIN: function(d) {
      return Object.assign(
        d,
        {
          /** @type {ModeCallback} */
          "on:begin": (b, N) => {
            N.data._beginMatch = b[1];
          },
          /** @type {ModeCallback} */
          "on:end": (b, N) => {
            N.data._beginMatch !== b[1] && N.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: St,
    IDENT_RE: _,
    MATCH_NOTHING_RE: D,
    METHOD_GUARD: Q,
    NUMBER_MODE: R,
    NUMBER_RE: W,
    PHRASAL_WORDS_MODE: mn,
    QUOTE_STRING_MODE: hn,
    REGEXP_MODE: Ee,
    RE_STARTERS_RE: xe,
    SHEBANG: Ve,
    TITLE_MODE: Je,
    UNDERSCORE_IDENT_RE: j,
    UNDERSCORE_TITLE_MODE: Z
  });
  function it(d, b) {
    d.input[d.index - 1] === "." && b.ignoreMatch();
  }
  function gn(d, b) {
    d.className !== void 0 && (d.scope = d.className, delete d.className);
  }
  function st(d, b) {
    b && d.beginKeywords && (d.begin = "\\b(" + d.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", d.__beforeBegin = it, d.keywords = d.keywords || d.beginKeywords, delete d.beginKeywords, d.relevance === void 0 && (d.relevance = 0));
  }
  function Oe(d, b) {
    Array.isArray(d.illegal) && (d.illegal = y(...d.illegal));
  }
  function Xe(d, b) {
    if (d.match) {
      if (d.begin || d.end) throw new Error("begin & end are not supported with match");
      d.begin = d.match, delete d.match;
    }
  }
  function kt(d, b) {
    d.relevance === void 0 && (d.relevance = 1);
  }
  const at = (d, b) => {
    if (!d.beforeMatch) return;
    if (d.starts) throw new Error("beforeMatch cannot be used with starts");
    const N = Object.assign({}, d);
    Object.keys(d).forEach((P) => {
      delete d[P];
    }), d.keywords = N.keywords, d.begin = m(N.beforeMatch, g(N.begin)), d.starts = {
      relevance: 0,
      contains: [
        Object.assign(N, { endsParent: !0 })
      ]
    }, d.relevance = 0, delete N.beforeMatch;
  }, $e = [
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
  ], be = "keyword";
  function Ze(d, b, N = be) {
    const P = /* @__PURE__ */ Object.create(null);
    return typeof d == "string" ? ee(N, d.split(" ")) : Array.isArray(d) ? ee(N, d) : Object.keys(d).forEach(function(te) {
      Object.assign(
        P,
        Ze(d[te], b, te)
      );
    }), P;
    function ee(te, A) {
      b && (A = A.map((w) => w.toLowerCase())), A.forEach(function(w) {
        const q = w.split("|");
        P[q[0]] = [te, ot(q[0], q[1])];
      });
    }
  }
  function ot(d, b) {
    return b ? Number(b) : Nt(d) ? 0 : 1;
  }
  function Nt(d) {
    return $e.includes(d.toLowerCase());
  }
  const ct = {}, Ne = (d) => {
    console.error(d);
  }, or = (d, ...b) => {
    console.log(`WARN: ${d}`, ...b);
  }, lt = (d, b) => {
    ct[`${d}/${b}`] || (console.log(`Deprecated as of ${d}. ${b}`), ct[`${d}/${b}`] = !0);
  }, qt = new Error();
  function cr(d, b, { key: N }) {
    let P = 0;
    const ee = d[N], te = {}, A = {};
    for (let w = 1; w <= b.length; w++)
      A[w + P] = ee[w], te[w + P] = !0, P += x(b[w - 1]);
    d[N] = A, d[N]._emit = te, d[N]._multi = !0;
  }
  function Pi(d) {
    if (Array.isArray(d.begin)) {
      if (d.skip || d.excludeBegin || d.returnBegin)
        throw Ne("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), qt;
      if (typeof d.beginScope != "object" || d.beginScope === null)
        throw Ne("beginScope must be object"), qt;
      cr(d, d.begin, { key: "beginScope" }), d.begin = I(d.begin, { joinWith: "" });
    }
  }
  function Di(d) {
    if (Array.isArray(d.end)) {
      if (d.skip || d.excludeEnd || d.returnEnd)
        throw Ne("skip, excludeEnd, returnEnd not compatible with endScope: {}"), qt;
      if (typeof d.endScope != "object" || d.endScope === null)
        throw Ne("endScope must be object"), qt;
      cr(d, d.end, { key: "endScope" }), d.end = I(d.end, { joinWith: "" });
    }
  }
  function Fi(d) {
    d.scope && typeof d.scope == "object" && d.scope !== null && (d.beginScope = d.scope, delete d.scope);
  }
  function Hi(d) {
    Fi(d), typeof d.beginScope == "string" && (d.beginScope = { _wrap: d.beginScope }), typeof d.endScope == "string" && (d.endScope = { _wrap: d.endScope }), Pi(d), Di(d);
  }
  function Ui(d) {
    function b(A, w) {
      return new RegExp(
        p(A),
        "m" + (d.case_insensitive ? "i" : "") + (d.unicodeRegex ? "u" : "") + (w ? "g" : "")
      );
    }
    class N {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(w, q) {
        q.position = this.position++, this.matchIndexes[this.matchAt] = q, this.regexes.push([q, w]), this.matchAt += x(w) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const w = this.regexes.map((q) => q[1]);
        this.matcherRe = b(I(w, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(w) {
        this.matcherRe.lastIndex = this.lastIndex;
        const q = this.matcherRe.exec(w);
        if (!q)
          return null;
        const se = q.findIndex((Ct, bn) => bn > 0 && Ct !== void 0), ne = this.matchIndexes[se];
        return q.splice(0, se), Object.assign(q, ne);
      }
    }
    class P {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(w) {
        if (this.multiRegexes[w]) return this.multiRegexes[w];
        const q = new N();
        return this.rules.slice(w).forEach(([se, ne]) => q.addRule(se, ne)), q.compile(), this.multiRegexes[w] = q, q;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(w, q) {
        this.rules.push([w, q]), q.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(w) {
        const q = this.getMatcher(this.regexIndex);
        q.lastIndex = this.lastIndex;
        let se = q.exec(w);
        if (this.resumingScanAtSamePosition() && !(se && se.index === this.lastIndex)) {
          const ne = this.getMatcher(0);
          ne.lastIndex = this.lastIndex + 1, se = ne.exec(w);
        }
        return se && (this.regexIndex += se.position + 1, this.regexIndex === this.count && this.considerAll()), se;
      }
    }
    function ee(A) {
      const w = new P();
      return A.contains.forEach((q) => w.addRule(q.begin, { rule: q, type: "begin" })), A.terminatorEnd && w.addRule(A.terminatorEnd, { type: "end" }), A.illegal && w.addRule(A.illegal, { type: "illegal" }), w;
    }
    function te(A, w) {
      const q = (
        /** @type CompiledMode */
        A
      );
      if (A.isCompiled) return q;
      [
        gn,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        Xe,
        Hi,
        at
      ].forEach((ne) => ne(A, w)), d.compilerExtensions.forEach((ne) => ne(A, w)), A.__beforeBegin = null, [
        st,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        Oe,
        // default to 1 relevance if not specified
        kt
      ].forEach((ne) => ne(A, w)), A.isCompiled = !0;
      let se = null;
      return typeof A.keywords == "object" && A.keywords.$pattern && (A.keywords = Object.assign({}, A.keywords), se = A.keywords.$pattern, delete A.keywords.$pattern), se = se || /\w+/, A.keywords && (A.keywords = Ze(A.keywords, d.case_insensitive)), q.keywordPatternRe = b(se, !0), w && (A.begin || (A.begin = /\B|\b/), q.beginRe = b(q.begin), !A.end && !A.endsWithParent && (A.end = /\B|\b/), A.end && (q.endRe = b(q.end)), q.terminatorEnd = p(q.end) || "", A.endsWithParent && w.terminatorEnd && (q.terminatorEnd += (A.end ? "|" : "") + w.terminatorEnd)), A.illegal && (q.illegalRe = b(
        /** @type {RegExp | string} */
        A.illegal
      )), A.contains || (A.contains = []), A.contains = [].concat(...A.contains.map(function(ne) {
        return zi(ne === "self" ? A : ne);
      })), A.contains.forEach(function(ne) {
        te(
          /** @type Mode */
          ne,
          q
        );
      }), A.starts && te(A.starts, w), q.matcher = ee(q), q;
    }
    if (d.compilerExtensions || (d.compilerExtensions = []), d.contains && d.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return d.classNameAliases = i(d.classNameAliases || {}), te(
      /** @type Mode */
      d
    );
  }
  function lr(d) {
    return d ? d.endsWithParent || lr(d.starts) : !1;
  }
  function zi(d) {
    return d.variants && !d.cachedVariants && (d.cachedVariants = d.variants.map(function(b) {
      return i(d, { variants: null }, b);
    })), d.cachedVariants ? d.cachedVariants : lr(d) ? i(d, { starts: d.starts ? i(d.starts) : null }) : Object.isFrozen(d) ? i(d) : d;
  }
  var Wi = "11.11.1";
  class Ki extends Error {
    constructor(b, N) {
      super(b), this.name = "HTMLInjectionError", this.html = N;
    }
  }
  const vn = n, ur = i, dr = Symbol("nomatch"), Gi = 7, pr = function(d) {
    const b = /* @__PURE__ */ Object.create(null), N = /* @__PURE__ */ Object.create(null), P = [];
    let ee = !0;
    const te = "Could not find the language '{}', did you forget to load/include a language module?", A = { disableAutodetect: !0, name: "Plain text", contains: [] };
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
      __emitter: f
    };
    function q(E) {
      return w.noHighlightRe.test(E);
    }
    function se(E) {
      let M = E.className + " ";
      M += E.parentNode ? E.parentNode.className : "";
      const K = w.languageDetectRe.exec(M);
      if (K) {
        const V = Ue(K[1]);
        return V || (or(te.replace("{}", K[1])), or("Falling back to no-highlight mode for this block.", E)), V ? K[1] : "no-highlight";
      }
      return M.split(/\s+/).find((V) => q(V) || Ue(V));
    }
    function ne(E, M, K) {
      let V = "", ie = "";
      typeof M == "object" ? (V = E, K = M.ignoreIllegals, ie = M.language) : (lt("10.7.0", "highlight(lang, code, ...args) has been deprecated."), lt("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), ie = E, V = M), K === void 0 && (K = !0);
      const Ce = {
        code: V,
        language: ie
      };
      Dt("before:highlight", Ce);
      const ze = Ce.result ? Ce.result : Ct(Ce.language, Ce.code, K);
      return ze.code = Ce.code, Dt("after:highlight", ze), ze;
    }
    function Ct(E, M, K, V) {
      const ie = /* @__PURE__ */ Object.create(null);
      function Ce(C, L) {
        return C.keywords[L];
      }
      function ze() {
        if (!F.keywords) {
          ue.addText(J);
          return;
        }
        let C = 0;
        F.keywordPatternRe.lastIndex = 0;
        let L = F.keywordPatternRe.exec(J), U = "";
        for (; L; ) {
          U += J.substring(C, L.index);
          const Y = Te.case_insensitive ? L[0].toLowerCase() : L[0], pe = Ce(F, Y);
          if (pe) {
            const [je, us] = pe;
            if (ue.addText(U), U = "", ie[Y] = (ie[Y] || 0) + 1, ie[Y] <= Gi && (Ut += us), je.startsWith("_"))
              U += L[0];
            else {
              const ds = Te.classNameAliases[je] || je;
              Le(L[0], ds);
            }
          } else
            U += L[0];
          C = F.keywordPatternRe.lastIndex, L = F.keywordPatternRe.exec(J);
        }
        U += J.substring(C), ue.addText(U);
      }
      function Ft() {
        if (J === "") return;
        let C = null;
        if (typeof F.subLanguage == "string") {
          if (!b[F.subLanguage]) {
            ue.addText(J);
            return;
          }
          C = Ct(F.subLanguage, J, !0, xr[F.subLanguage]), xr[F.subLanguage] = /** @type {CompiledMode} */
          C._top;
        } else
          C = yn(J, F.subLanguage.length ? F.subLanguage : null);
        F.relevance > 0 && (Ut += C.relevance), ue.__addSublanguage(C._emitter, C.language);
      }
      function Se() {
        F.subLanguage != null ? Ft() : ze(), J = "";
      }
      function Le(C, L) {
        C !== "" && (ue.startScope(L), ue.addText(C), ue.endScope());
      }
      function gr(C, L) {
        let U = 1;
        const Y = L.length - 1;
        for (; U <= Y; ) {
          if (!C._emit[U]) {
            U++;
            continue;
          }
          const pe = Te.classNameAliases[C[U]] || C[U], je = L[U];
          pe ? Le(je, pe) : (J = je, ze(), J = ""), U++;
        }
      }
      function vr(C, L) {
        return C.scope && typeof C.scope == "string" && ue.openNode(Te.classNameAliases[C.scope] || C.scope), C.beginScope && (C.beginScope._wrap ? (Le(J, Te.classNameAliases[C.beginScope._wrap] || C.beginScope._wrap), J = "") : C.beginScope._multi && (gr(C.beginScope, L), J = "")), F = Object.create(C, { parent: { value: F } }), F;
      }
      function br(C, L, U) {
        let Y = $(C.endRe, U);
        if (Y) {
          if (C["on:end"]) {
            const pe = new t(C);
            C["on:end"](L, pe), pe.isMatchIgnored && (Y = !1);
          }
          if (Y) {
            for (; C.endsParent && C.parent; )
              C = C.parent;
            return C;
          }
        }
        if (C.endsWithParent)
          return br(C.parent, L, U);
      }
      function ss(C) {
        return F.matcher.regexIndex === 0 ? (J += C[0], 1) : (kn = !0, 0);
      }
      function as(C) {
        const L = C[0], U = C.rule, Y = new t(U), pe = [U.__beforeBegin, U["on:begin"]];
        for (const je of pe)
          if (je && (je(C, Y), Y.isMatchIgnored))
            return ss(L);
        return U.skip ? J += L : (U.excludeBegin && (J += L), Se(), !U.returnBegin && !U.excludeBegin && (J = L)), vr(U, C), U.returnBegin ? 0 : L.length;
      }
      function os(C) {
        const L = C[0], U = M.substring(C.index), Y = br(F, C, U);
        if (!Y)
          return dr;
        const pe = F;
        F.endScope && F.endScope._wrap ? (Se(), Le(L, F.endScope._wrap)) : F.endScope && F.endScope._multi ? (Se(), gr(F.endScope, C)) : pe.skip ? J += L : (pe.returnEnd || pe.excludeEnd || (J += L), Se(), pe.excludeEnd && (J = L));
        do
          F.scope && ue.closeNode(), !F.skip && !F.subLanguage && (Ut += F.relevance), F = F.parent;
        while (F !== Y.parent);
        return Y.starts && vr(Y.starts, C), pe.returnEnd ? 0 : L.length;
      }
      function cs() {
        const C = [];
        for (let L = F; L !== Te; L = L.parent)
          L.scope && C.unshift(L.scope);
        C.forEach((L) => ue.openNode(L));
      }
      let Ht = {};
      function yr(C, L) {
        const U = L && L[0];
        if (J += C, U == null)
          return Se(), 0;
        if (Ht.type === "begin" && L.type === "end" && Ht.index === L.index && U === "") {
          if (J += M.slice(L.index, L.index + 1), !ee) {
            const Y = new Error(`0 width match regex (${E})`);
            throw Y.languageName = E, Y.badRule = Ht.rule, Y;
          }
          return 1;
        }
        if (Ht = L, L.type === "begin")
          return as(L);
        if (L.type === "illegal" && !K) {
          const Y = new Error('Illegal lexeme "' + U + '" for mode "' + (F.scope || "<unnamed>") + '"');
          throw Y.mode = F, Y;
        } else if (L.type === "end") {
          const Y = os(L);
          if (Y !== dr)
            return Y;
        }
        if (L.type === "illegal" && U === "")
          return J += `
`, 1;
        if (Sn > 1e5 && Sn > L.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return J += U, U.length;
      }
      const Te = Ue(E);
      if (!Te)
        throw Ne(te.replace("{}", E)), new Error('Unknown language: "' + E + '"');
      const ls = Ui(Te);
      let En = "", F = V || ls;
      const xr = {}, ue = new w.__emitter(w);
      cs();
      let J = "", Ut = 0, Qe = 0, Sn = 0, kn = !1;
      try {
        if (Te.__emitTokens)
          Te.__emitTokens(M, ue);
        else {
          for (F.matcher.considerAll(); ; ) {
            Sn++, kn ? kn = !1 : F.matcher.considerAll(), F.matcher.lastIndex = Qe;
            const C = F.matcher.exec(M);
            if (!C) break;
            const L = M.substring(Qe, C.index), U = yr(L, C);
            Qe = C.index + U;
          }
          yr(M.substring(Qe));
        }
        return ue.finalize(), En = ue.toHTML(), {
          language: E,
          value: En,
          relevance: Ut,
          illegal: !1,
          _emitter: ue,
          _top: F
        };
      } catch (C) {
        if (C.message && C.message.includes("Illegal"))
          return {
            language: E,
            value: vn(M),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: C.message,
              index: Qe,
              context: M.slice(Qe - 100, Qe + 100),
              mode: C.mode,
              resultSoFar: En
            },
            _emitter: ue
          };
        if (ee)
          return {
            language: E,
            value: vn(M),
            illegal: !1,
            relevance: 0,
            errorRaised: C,
            _emitter: ue,
            _top: F
          };
        throw C;
      }
    }
    function bn(E) {
      const M = {
        value: vn(E),
        illegal: !1,
        relevance: 0,
        _top: A,
        _emitter: new w.__emitter(w)
      };
      return M._emitter.addText(E), M;
    }
    function yn(E, M) {
      M = M || w.languages || Object.keys(b);
      const K = bn(E), V = M.filter(Ue).filter(mr).map(
        (Se) => Ct(Se, E, !1)
      );
      V.unshift(K);
      const ie = V.sort((Se, Le) => {
        if (Se.relevance !== Le.relevance) return Le.relevance - Se.relevance;
        if (Se.language && Le.language) {
          if (Ue(Se.language).supersetOf === Le.language)
            return 1;
          if (Ue(Le.language).supersetOf === Se.language)
            return -1;
        }
        return 0;
      }), [Ce, ze] = ie, Ft = Ce;
      return Ft.secondBest = ze, Ft;
    }
    function Yi(E, M, K) {
      const V = M && N[M] || K;
      E.classList.add("hljs"), E.classList.add(`language-${V}`);
    }
    function xn(E) {
      let M = null;
      const K = se(E);
      if (q(K)) return;
      if (Dt(
        "before:highlightElement",
        { el: E, language: K }
      ), E.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", E);
        return;
      }
      if (E.children.length > 0 && (w.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(E)), w.throwUnescapedHTML))
        throw new Ki(
          "One of your code blocks includes unescaped HTML.",
          E.innerHTML
        );
      M = E;
      const V = M.textContent, ie = K ? ne(V, { language: K, ignoreIllegals: !0 }) : yn(V);
      E.innerHTML = ie.value, E.dataset.highlighted = "yes", Yi(E, K, ie.language), E.result = {
        language: ie.language,
        // TODO: remove with version 11.0
        re: ie.relevance,
        relevance: ie.relevance
      }, ie.secondBest && (E.secondBest = {
        language: ie.secondBest.language,
        relevance: ie.secondBest.relevance
      }), Dt("after:highlightElement", { el: E, result: ie, text: V });
    }
    function Vi(E) {
      w = ur(w, E);
    }
    const Ji = () => {
      Pt(), lt("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function Xi() {
      Pt(), lt("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let fr = !1;
    function Pt() {
      function E() {
        Pt();
      }
      if (document.readyState === "loading") {
        fr || window.addEventListener("DOMContentLoaded", E, !1), fr = !0;
        return;
      }
      document.querySelectorAll(w.cssSelector).forEach(xn);
    }
    function Zi(E, M) {
      let K = null;
      try {
        K = M(d);
      } catch (V) {
        if (Ne("Language definition for '{}' could not be registered.".replace("{}", E)), ee)
          Ne(V);
        else
          throw V;
        K = A;
      }
      K.name || (K.name = E), b[E] = K, K.rawDefinition = M.bind(null, d), K.aliases && hr(K.aliases, { languageName: E });
    }
    function Qi(E) {
      delete b[E];
      for (const M of Object.keys(N))
        N[M] === E && delete N[M];
    }
    function es() {
      return Object.keys(b);
    }
    function Ue(E) {
      return E = (E || "").toLowerCase(), b[E] || b[N[E]];
    }
    function hr(E, { languageName: M }) {
      typeof E == "string" && (E = [E]), E.forEach((K) => {
        N[K.toLowerCase()] = M;
      });
    }
    function mr(E) {
      const M = Ue(E);
      return M && !M.disableAutodetect;
    }
    function ts(E) {
      E["before:highlightBlock"] && !E["before:highlightElement"] && (E["before:highlightElement"] = (M) => {
        E["before:highlightBlock"](
          Object.assign({ block: M.el }, M)
        );
      }), E["after:highlightBlock"] && !E["after:highlightElement"] && (E["after:highlightElement"] = (M) => {
        E["after:highlightBlock"](
          Object.assign({ block: M.el }, M)
        );
      });
    }
    function ns(E) {
      ts(E), P.push(E);
    }
    function rs(E) {
      const M = P.indexOf(E);
      M !== -1 && P.splice(M, 1);
    }
    function Dt(E, M) {
      const K = E;
      P.forEach(function(V) {
        V[K] && V[K](M);
      });
    }
    function is(E) {
      return lt("10.7.0", "highlightBlock will be removed entirely in v12.0"), lt("10.7.0", "Please use highlightElement now."), xn(E);
    }
    Object.assign(d, {
      highlight: ne,
      highlightAuto: yn,
      highlightAll: Pt,
      highlightElement: xn,
      // TODO: Remove with v12 API
      highlightBlock: is,
      configure: Vi,
      initHighlighting: Ji,
      initHighlightingOnLoad: Xi,
      registerLanguage: Zi,
      unregisterLanguage: Qi,
      listLanguages: es,
      getLanguage: Ue,
      registerAliases: hr,
      autoDetection: mr,
      inherit: ur,
      addPlugin: ns,
      removePlugin: rs
    }), d.debugMode = function() {
      ee = !1;
    }, d.safeMode = function() {
      ee = !0;
    }, d.versionString = Wi, d.regex = {
      concat: m,
      lookahead: g,
      either: y,
      optional: v,
      anyNumberOfTimes: h
    };
    for (const E in Ae)
      typeof Ae[E] == "object" && e(Ae[E]);
    return Object.assign(d, Ae), d;
  }, ut = pr({});
  return ut.newInstance = () => pr({}), In = ut, ut.HighlightJS = ut, ut.default = ut, In;
}
var hc = /* @__PURE__ */ fc();
const Bt = /* @__PURE__ */ pc(hc);
function mc(e) {
  const t = e.regex, n = {}, i = {
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
      i
    ]
  });
  const r = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [e.BACKSLASH_ESCAPE]
  }, s = e.inherit(
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
  ), a = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      e.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  }, o = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      n,
      r
    ]
  };
  r.contains.push(o);
  const l = {
    match: /\\"/
  }, u = {
    className: "string",
    begin: /'/,
    end: /'/
  }, f = {
    match: /\\'/
  }, p = {
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
  }, g = [
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
    binary: `(${g.join("|")})`,
    relevance: 10
  }), v = {
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
  ], S = [
    "true",
    "false"
  ], y = { match: /(\/[a-z._-]+)+/ }, x = [
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
  ], $ = [
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
  ], O = [
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
  ], I = [
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
      literal: S,
      built_in: [
        ...x,
        ...$,
        // Shell modifiers
        "set",
        "shopt",
        ...O,
        ...I
      ]
    },
    contains: [
      h,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      v,
      p,
      s,
      a,
      y,
      o,
      l,
      u,
      f,
      n
    ]
  };
}
function gc(e) {
  const s = {
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
    keywords: s,
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
            keywords: s,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function vc(e) {
  const t = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, n = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  }, i = [
    "true",
    "false",
    "null"
  ], r = {
    scope: "literal",
    beginKeywords: i.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: i
    },
    contains: [
      t,
      n,
      e.QUOTE_STRING_MODE,
      r,
      e.C_NUMBER_MODE,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
function bc(e) {
  const t = e.regex, n = /[\p{XID_Start}_]\p{XID_Continue}*/u, i = [
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
  ], o = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: i,
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
  }, l = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  }, u = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: o,
    illegal: /#/
  }, f = {
    begin: /\{\{/,
    relevance: 0
  }, p = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l,
          f,
          u
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l,
          f,
          u
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
          f,
          u
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          e.BACKSLASH_ESCAPE,
          f,
          u
        ]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  }, g = "[0-9](_?[0-9])*", h = `(\\b(${g}))?\\.(${g})|\\b(${g})\\.`, v = `\\b|${i.join("|")}`, m = {
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
        begin: `(\\b(${g})|(${h}))[eE][+-]?(${g})[jJ]?(?=${v})`
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
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${v})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${v})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${v})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${v})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${g})[jJ](?=${v})`
      }
    ]
  }, S = {
    className: "comment",
    begin: t.lookahead(/# type:/),
    end: /$/,
    keywords: o,
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
  }, y = {
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
        keywords: o,
        contains: [
          "self",
          l,
          m,
          p,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return u.contains = [
    p,
    m,
    l
  ], {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: !0,
    keywords: o,
    illegal: /(<\/|\?)|=>/,
    contains: [
      l,
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
      p,
      S,
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
        contains: [y]
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
          y,
          p
        ]
      }
    ]
  };
}
Bt.registerLanguage("bash", mc);
Bt.registerLanguage("go", gc);
Bt.registerLanguage("json", vc);
Bt.registerLanguage("python", bc);
const yc = {
  curl: "bash",
  go: "go",
  json: "json",
  py: "python",
  python: "python"
}, xc = /* @__PURE__ */ new Set(["bash", "curl", "go", "json", "py", "python"]);
function jn(e, t) {
  if (t === "plaintext" || t === "" || !xc.has(t))
    return _r(e);
  const n = yc[t] ?? (vi(e) ? "json" : "bash");
  try {
    return Bt.highlight(e, { language: n }).value;
  } catch {
    return _r(e);
  }
}
function Ec(e, t) {
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
    return Dr(i, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const i = parseFloat(e);
    return Dr(i, n);
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
function Dr(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function Sc(e, t, n, i) {
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
function kc(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((r) => {
    const s = r.getAttribute("data-param-name"), a = t.parameters.find((l) => l.name === s);
    if (!a) return;
    const o = Ec(r.value, a);
    o.valid || n.push({ field: s, message: o.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const s = Object.keys(t.requestBody.content || {})[0] || "application/json", a = t.requestBody.content?.[s]?.schema, l = e.querySelector('[data-field="body"]')?.value || "";
    if (!s.includes("multipart")) {
      const u = Sc(l, s, a, t.requestBody.required);
      u.valid || n.push({ field: "body", message: u.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function Nc(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function Cc(e, t) {
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
function Mi(e) {
  return c("span", { className: "validation-error", "data-error-for": e });
}
const wc = 60;
function rt(e) {
  e.style.height = "0", e.style.height = Math.max(wc, e.scrollHeight) + "px";
}
function Fr(e, t) {
  t.scrollTop = e.scrollTop, t.scrollLeft = e.scrollLeft;
}
function Hr(e, t, n) {
  const i = c("div", { className: "body-editor" }), r = c("pre", { className: "body-highlight" }), s = c("code", { className: "hljs" });
  r.append(s);
  const a = c("textarea", {
    className: "textarea-json",
    spellcheck: "false",
    ...n?.dataField ? { "data-field": n.dataField } : {}
  });
  a.value = e, s.innerHTML = jn(e || " ", t), rt(a);
  const o = (l, u) => {
    s.innerHTML = jn((l ?? a.value) || " ", u ?? t);
  };
  return a.addEventListener("input", () => {
    o(), Fr(a, r), rt(a), n?.onInput?.();
  }), a.addEventListener("scroll", () => Fr(a, r)), i.append(r, a), {
    wrap: i,
    textarea: a,
    setValue: (l, u) => {
      a.value = l, o(l, u ?? t), rt(a);
    }
  };
}
const Ac = 1500;
function Tt(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", i = Re({
    variant: "icon",
    icon: H.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const r = await e.getText();
      await Co(r), i.innerHTML = H.check, i.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        i.innerHTML = H.copy, i.setAttribute("aria-label", t);
      }, Ac);
    }
  });
  return i;
}
function Oc(e, t, n, i) {
  fe(t), t.classList.add("try-it");
  const r = c("div", { className: "body" }), s = c("div", { className: "block section" });
  s.append(c("h2", { textContent: "Response" }));
  const a = c("div", { "data-response": "true" });
  if (n)
    Mn(a, {
      status: parseInt(n.statusCode, 10) || 200,
      statusText: n.statusText || "OK",
      headers: {},
      body: n.body,
      duration: 0,
      size: 0
    });
  else {
    const l = c("div", { className: "placeholder" });
    l.append(c("span", { textContent: "Выполните запрос, чтобы увидеть ответ" })), a.append(l);
  }
  s.append(a), r.append(Lc(e, t, {
    onConfigChange: i?.onConfigChange,
    onSendRequest: async (l) => {
      Nc(t);
      const u = kc(t, e);
      if (u.length > 0) {
        Cc(t, u);
        return;
      }
      const f = We(t, e);
      l.setAttribute("disabled", ""), l.innerHTML = "", l.append(c("span", { className: "spinner spinner-sm" }), c("span", null, "Sending..."));
      try {
        const p = await rc(f);
        Mn(a, p);
      } catch (p) {
        Mn(a, {
          status: 0,
          headers: {},
          body: p.message,
          duration: 0,
          size: 0
        });
      } finally {
        l.removeAttribute("disabled"), l.innerHTML = H.send, l.append(c("span", null, "Send Request"));
      }
    }
  })), r.append(s), t.append(r);
  const o = t.querySelector('textarea[data-field="body"]');
  o && requestAnimationFrame(() => {
    requestAnimationFrame(() => rt(o));
  });
}
function Lc(e, t, n) {
  const i = n?.onConfigChange, r = e.parameters.filter((R) => R.in === "path"), s = e.parameters.filter((R) => R.in === "query"), a = uc([...r, ...s]), o = "Request", l = _n({
    method: e.method,
    url: "",
    // будет обновляться
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), u = () => {
    const R = We(t, e);
    let G;
    return typeof R.body == "string" ? G = R.body : R.body instanceof FormData ? G = "{ /* multipart form-data */ }" : e.requestBody && (G = "{ ... }"), {
      method: R.method,
      url: R.url,
      headers: R.headers || {},
      body: G
    };
  }, f = () => {
    const R = We(t, e);
    if (typeof R.body == "string") return R.body;
    if (R.body instanceof FormData) {
      const G = [];
      return R.body.forEach((le, Ee) => {
        if (le instanceof File) {
          G.push(`${Ee}: [File ${le.name}]`);
          return;
        }
        G.push(`${Ee}: ${String(le)}`);
      }), G.join(`
`);
    }
    return "";
  }, p = (R, G) => {
    const le = u(), Ee = _n(le), Je = Ee[G] || Ee[0];
    Je && R.setValue(Je.code, Je.language);
  }, g = c("div", { className: "block section tabs-code" }), h = c("div", { className: "body" }), v = c("h2", { textContent: "Request" });
  g.append(v, h);
  const m = c("div", { className: "controls" });
  let S = !1;
  a.length > 1 && (r.length > 0 || s.length > 0) && (m.append(nn({
    options: a.map((R) => ({ value: R.name, label: R.summary || R.name })),
    value: a[0].name,
    ariaLabel: "Select example",
    className: "example-select",
    onChange: (R) => {
      const G = a.find((le) => le.name === R);
      G && (Tc(t, G.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
    }
  })), S = !0);
  const y = k.get(), x = c("div", { className: "card" }), $ = c("div", { className: "card-head" }), O = c("div", { className: "tabs tabs-code" }), I = [];
  let D = 0, _ = null, j = null, W = null;
  {
    const R = rn(o, { active: !0, context: !0 });
    if (I.push(R), W = c("div", { className: "panel is-request", "data-tab": "first" }), r.length > 0 || s.length > 0) {
      const Z = c("div", { className: "params-group" });
      if (Z.append(c("h3", { textContent: "Parameters" })), r.length > 0) {
        const Q = c("div", { className: "params-group" });
        s.length > 0 && Q.append(c("h3", { textContent: "Path" }));
        for (const ke of r)
          Q.append(zr(ke, a[0]?.values[ke.name]));
        Z.append(Q);
      }
      if (s.length > 0) {
        const Q = c("div", { className: "params-group" });
        r.length > 0 && Q.append(c("h3", { textContent: "Query" }));
        for (const ke of s)
          Q.append(zr(ke, a[0]?.values[ke.name]));
        Z.append(Q);
      }
      W.append(Z);
    }
    {
      const Z = c("div", { className: "route-preview" }), Q = c("div", { className: "field-header" });
      Q.append(c("h3", { textContent: "URL" }));
      const ke = Tt({
        ariaLabel: "Copy URL",
        className: "route-copy-btn",
        getText: () => _?.value || We(t, e).url
      });
      _ = Ye({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "route-input"
      });
      const Ae = c("div", { className: "route-input-row" });
      Ae.append(_, ke), Z.append(Q, Ae), j = Z;
    }
    if (e.requestBody) {
      const Z = c("div", { className: "body-section" }), Q = c("div", { className: "field-header" });
      Q.append(c("h3", { textContent: "Body" }));
      const ke = Tt({
        ariaLabel: "Copy body",
        className: "field-copy-btn",
        getText: f
      });
      Q.append(ke), Z.append(Q);
      const it = Object.keys(e.requestBody.content || {})[0] || "application/json", gn = it.includes("multipart"), st = e.requestBody.content?.[it];
      if (gn && st?.schema) {
        const Oe = c("div", { className: "multipart", "data-field": "multipart" }), Xe = st.schema, kt = Xe.properties || {}, at = Xe.required || [];
        for (const [$e, be] of Object.entries(kt)) {
          const Ze = be.format === "binary" || be.format === "base64" || be.type === "string" && be.format === "binary", ot = at.includes($e), Nt = c("div", { className: `params row${ot ? " is-required" : ""}` }), ct = c("span", { className: "label", textContent: $e });
          if (ot && ct.append(B({ text: "*", kind: "required", size: "s" })), Ze) {
            const Ne = c("input", {
              type: "file",
              "data-multipart-field": $e,
              "data-multipart-type": "file"
            });
            Nt.append(ct, Ne);
          } else {
            const Ne = Ye({
              placeholder: be.description || $e,
              value: be.default !== void 0 ? String(be.default) : "",
              dataAttrs: { multipartField: $e, multipartType: "text" }
            });
            Nt.append(ct, Ne);
          }
          Oe.append(Nt);
        }
        Z.append(Oe);
      } else {
        const Oe = st ? Ii(st) : [], Xe = Oe[0], kt = Xe ? qr(Xe.value) : "", at = Hr(kt, "json", {
          dataField: "body",
          onInput: () => i?.(We(t, e))
        });
        if (Z.append(at.wrap), Oe.length > 1) {
          const $e = nn({
            options: Oe.map((be) => ({ value: be.name, label: dc(be) })),
            value: Oe[0].name,
            ariaLabel: "Select example",
            className: "example-select",
            onChange: (be) => {
              const Ze = Oe.find((ot) => ot.name === be);
              Ze && (at.setValue(qr(Ze.value), "json"), i?.(We(t, e)));
            }
          });
          m.append($e), S = !0;
        }
      }
      Z.append(Mi("body")), W.append(Z);
    }
    const G = c("div", { className: "headers-section" }), le = c("div", { className: "field-header" });
    le.append(c("h3", { textContent: "Headers" }));
    const Ee = c("div", { className: "headers-list" });
    if (e.requestBody) {
      const Q = Object.keys(e.requestBody.content || {})[0] || "application/json";
      Ee.append(Ot("Content-Type", Q));
    }
    if (de(e.resolvedSecurity) && y.spec) {
      const Z = tr(e.resolvedSecurity, y.spec.securitySchemes), ke = { ...nr(e.resolvedSecurity, y.spec.securitySchemes), ...Z };
      for (const [Ae, it] of Object.entries(ke))
        Ee.append(Ot(Ae, it));
    }
    for (const Z of e.parameters.filter((Q) => Q.in === "header"))
      Ee.append(Ot(Z.name, String(Z.example || "")));
    const Je = Re({
      variant: "icon",
      icon: H.plus,
      ariaLabel: "Add header",
      className: "field-copy-btn",
      onClick: () => Ee.append(Ot("", ""))
    });
    le.append(Je), G.append(le, Ee), W.append(G);
  }
  const X = u(), z = _n(X), xe = Hr(
    z[0]?.code ?? "",
    z[0]?.language
  ), Ve = c("div", { className: "panel", "data-tab": "lang" }), He = c("div", { className: "body-section" }), Et = c("div", { className: "field-header" });
  Et.append(c("h3", { textContent: "Code Example" }));
  const hn = Tt({
    ariaLabel: "Copy code",
    className: "field-copy-btn",
    getText: () => xe.textarea.value
  });
  Et.append(hn), He.append(Et, xe.wrap), Ve.append(He);
  for (let R = 0; R < l.length; R++) {
    const G = l[R], le = rn(G.label, { active: !o });
    I.push(le);
  }
  $.append(O);
  const mn = W ? [W, Ve] : [Ve], Be = (R, G) => {
    if (!G) {
      R.style.display = "none";
      return;
    }
    R.style.display = R.classList.contains("is-request") ? "flex" : "block";
  };
  for (let R = 0; R < I.length; R++) {
    O.append(I[R]);
    const G = R;
    I[R].addEventListener("click", () => {
      I.forEach((le) => le.classList.remove("is-active")), I[G].classList.add("is-active"), D = G, W && Be(W, G === 0), Be(Ve, G !== 0), G > 0 && p(xe, G - 1);
    });
  }
  const $t = c("div", { className: "card-content flush" }), jt = c("div", { className: "panels" });
  if (W && Be(W, !0), Be(Ve, !1), jt.append(...mn), $t.append(jt), n?.onSendRequest) {
    const R = Re({
      variant: "primary",
      icon: H.send,
      label: "Send Request",
      className: "send-btn"
    });
    R.addEventListener("click", () => n.onSendRequest(R));
    {
      j && W?.append(j);
      const G = c("div", { className: "send-inline" });
      G.append(R), W?.append(G);
    }
  }
  !n?.onSendRequest && o && j && W?.append(j), S && h.append(m), x.append($, $t), h.append(x);
  const St = () => {
    _ && (_.value = We(t, e).url), i?.(We(t, e)), (D > 0 || !o) && p(xe, D - 1);
  };
  return t.addEventListener("input", St), t.addEventListener("change", St), St(), requestAnimationFrame(() => {
    const R = t.querySelector('textarea[data-field="body"]');
    R && rt(R);
  }), g;
}
function Ur(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function Tc(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((i) => {
    const r = i.getAttribute("data-param-name");
    r && t[r] !== void 0 && (i.value = t[r]);
  });
}
function zr(e, t) {
  const n = c("div", { className: `params row${e.required ? " is-required" : ""}` }), i = c("span", {
    className: "label",
    textContent: e.name
  });
  e.required && i.append(B({ text: "*", kind: "required", size: "s" }));
  const r = e.schema;
  let s;
  if (r?.enum && r.enum.length > 0) {
    const o = e.required ? r.enum.map((u) => ({ value: String(u), label: String(u) })) : [{ value: "", label: "— select —" }, ...r.enum.map((u) => ({ value: String(u), label: String(u) }))];
    s = nn({
      options: o,
      value: Ur(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const o = r?.type === "integer" || r?.type === "number" ? "number" : "text", l = Ye({
      type: o,
      placeholder: e.description || e.name,
      value: Ur(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    r?.type === "integer" && l.setAttribute("step", "1"), r?.minimum !== void 0 && l.setAttribute("min", String(r.minimum)), r?.maximum !== void 0 && l.setAttribute("max", String(r.maximum)), s = l;
  }
  const a = Mi(e.name);
  return n.append(i, s, a), n;
}
function Ot(e, t) {
  const n = c("div", { className: "header-row" }), i = Ye({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), r = Ye({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), s = Re({
    variant: "icon",
    icon: H.close,
    ariaLabel: "Remove header",
    className: "header-remove-btn",
    onClick: () => n.remove()
  });
  return n.append(i, r, s), n;
}
function We(e, t) {
  const n = k.get(), i = dn(n), r = e.querySelectorAll('[data-param-in="path"]'), s = {};
  r.forEach((h) => {
    s[h.getAttribute("data-param-name")] = h.value;
  });
  const a = e.querySelectorAll('[data-param-in="query"]'), o = {};
  if (a.forEach((h) => {
    const v = h.getAttribute("data-param-name");
    h.value && (o[v] = h.value);
  }), n.spec && de(t.resolvedSecurity)) {
    const h = Po(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [v, m] of Object.entries(h))
      v in o || (o[v] = m);
  }
  const l = e.querySelectorAll(".header-row"), u = {};
  if (l.forEach((h) => {
    const v = h.querySelector("[data-header-name]"), m = h.querySelector("[data-header-value]");
    v?.value && m?.value && (u[v.value] = m.value);
  }), n.spec && de(t.resolvedSecurity)) {
    const h = Do(t.resolvedSecurity, n.spec.securitySchemes), v = Object.entries(h).map(([m, S]) => `${m}=${S}`);
    if (v.length > 0) {
      const m = u.Cookie || u.cookie || "";
      u.Cookie = m ? `${m}; ${v.join("; ")}` : v.join("; "), delete u.cookie;
    }
  }
  const f = e.querySelector('[data-field="multipart"]');
  let p;
  if (f) {
    const h = new FormData();
    f.querySelectorAll("[data-multipart-field]").forEach((m) => {
      const S = m.getAttribute("data-multipart-field"), y = m.getAttribute("data-multipart-type");
      y === "file" && m.files && m.files.length > 0 ? h.append(S, m.files[0]) : y === "text" && m.value && h.append(S, m.value);
    }), p = h, delete u["Content-Type"];
  } else
    p = e.querySelector('[data-field="body"]')?.value || void 0;
  const g = sc(i, t.path, s, o);
  return { method: t.method, url: g, headers: u, body: p };
}
function Mn(e, t) {
  fe(e);
  const n = c("div", { className: "card" }), i = c("div", { className: "card-head response-header" }), r = rn("Body", { active: !0 }), s = rn(`Headers (${Object.keys(t.headers).length})`), a = c("div", { className: "tabs tabs-code" });
  a.append(r, s);
  const o = c("div", {
    className: "meta",
    innerHTML: `<span>${Ao(t.duration)}</span><span>${wo(t.size)}</span>`
  }), l = B({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), u = Tt({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => Ic("Response copied")
  });
  i.append(a, o, l, u), n.append(i);
  const f = c("div", { className: "card-content flush" }), p = c("div", { className: "response-pane" }), g = c("div", { className: "pane-inner" }), h = c("pre", { className: "code-display" }), v = c("code", { className: "hljs" }), m = _c(t.body);
  v.innerHTML = jn(m, vi(m) ? "json" : ""), h.append(v), g.append(h), p.append(g);
  const S = c("div", { className: "response-pane", style: "display:none" }), y = c("div", { className: "pane-inner" }), x = c("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false"
  });
  x.value = Object.entries(t.headers).map(([$, O]) => `${$}: ${O}`).join(`
`), rt(x), y.append(x), S.append(y), f.append(p, S), n.append(f), r.addEventListener("click", () => {
    r.classList.add("is-active"), s.classList.remove("is-active"), p.style.display = "block", S.style.display = "none";
  }), s.addEventListener("click", () => {
    s.classList.add("is-active"), r.classList.remove("is-active"), p.style.display = "none", S.style.display = "block", requestAnimationFrame(() => rt(x));
  }), e.append(n);
}
function _c(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function Ic(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = c("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
function Ri(e) {
  const { prev: t, next: n } = Mc(e);
  if (!t && !n) return null;
  const i = c("div", {
    className: `route-nav${!t || !n ? " is-single" : ""}`
  });
  return t && i.append(Wr(t, "previous")), n && i.append(Wr(n, "next")), i;
}
function Wr(e, t) {
  const n = ce(e.route), i = c("a", {
    className: `card interactive route-card ${t === "previous" ? "is-prev" : "is-next"}`,
    href: n
  }), r = c("div", { className: "route-meta" });
  e.kind === "endpoint" ? (r.append(B({
    text: e.operation.method.toUpperCase(),
    kind: "method",
    method: e.operation.method
  })), r.append(c("span", { className: "route-path", textContent: e.operation.path }))) : (r.append(B({
    text: "WEBHOOK",
    kind: "webhook",
    size: "s"
  })), r.append(B({
    text: e.webhook.method.toUpperCase(),
    kind: "method",
    method: e.webhook.method
  })));
  const s = c("span", { className: "route-side", "aria-hidden": "true" });
  s.innerHTML = t === "previous" ? H.chevronLeft : H.chevronRight;
  const a = c("div", { className: "route-main" });
  return a.append(
    c("span", { className: "route-category", textContent: e.category }),
    c("span", { className: "route-title", textContent: e.title }),
    r
  ), t === "previous" ? i.append(s, a) : i.append(a, s), i.addEventListener("click", (o) => {
    o.preventDefault(), oe(n);
  }), i;
}
function Mc(e) {
  if (!k.get().spec) return { prev: null, next: null };
  const n = Rc();
  if (n.length === 0) return { prev: null, next: null };
  const i = Bc(n, e);
  return i < 0 ? { prev: null, next: null } : {
    prev: i > 0 ? n[i - 1] : null,
    next: i < n.length - 1 ? n[i + 1] : null
  };
}
function Rc() {
  const e = k.get().spec;
  if (!e) return [];
  const t = [], n = /* @__PURE__ */ new Set();
  for (const i of e.tags)
    for (const r of i.operations) {
      const s = `${r.method.toLowerCase()} ${r.path}`;
      n.has(s) || (n.add(s), t.push({
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
function Bc(e, t) {
  return t.type === "endpoint" ? e.findIndex(
    (n) => n.kind === "endpoint" && n.route.method === t.method && n.route.path === t.path
  ) : t.type === "webhook" ? e.findIndex(
    (n) => n.kind === "webhook" && n.route.webhookName === t.webhookName
  ) : -1;
}
async function $c(e, t, n) {
  fe(e), fe(t);
  const i = t.parentElement;
  i && (i.setAttribute("aria-label", "Try It"), i.classList.add("try-it"));
  const r = k.get(), s = Lo(r), a = bi(r), o = s + (n.path.startsWith("/") ? "" : "/") + n.path, l = [], u = B({
    text: n.method.toUpperCase(),
    kind: "method",
    method: n.method,
    size: "m"
  });
  l.push({
    label: a || r.spec?.info.title || "Главная",
    href: "/",
    className: "breadcrumb-item",
    onClick: (_) => {
      _.preventDefault(), oe("/");
    }
  });
  const f = new Set((r.spec?.tags || []).map((_) => _.name.toLowerCase())), p = (n.path || "/").split("/").filter(Boolean);
  for (const _ of p) {
    const j = _.startsWith("{") && _.endsWith("}"), W = !j && f.has(_.toLowerCase()), X = r.spec?.tags.find((z) => z.name.toLowerCase() === _.toLowerCase());
    W && X ? l.push({
      label: _,
      href: ce({ type: "tag", tag: X.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (z) => {
        z.preventDefault(), oe(ce({ type: "tag", tag: X.name }));
      }
    }) : l.push({
      label: _,
      className: j ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const g = Tt({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${o}`
  }), h = Zn(l, {
    leading: [u],
    trailing: [g]
  }), v = c("div", { className: "block header" });
  if (v.append(c("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.deprecated) {
    const _ = c("span", { className: "icon-muted" });
    _.innerHTML = H.warning, v.append(c("div", {}, c("span", { className: "endpoint-meta deprecated" }, _, "Deprecated")));
  }
  if (de(n.resolvedSecurity)) {
    const _ = zc(r, n), j = Xr(n.resolvedSecurity) || "Auth required", W = Qn({
      configured: _,
      variant: "endpoint",
      title: gt(n.resolvedSecurity)
    });
    v.append(c("span", {
      className: `endpoint-meta auth${_ ? " is-active" : ""}`,
      title: gt(n.resolvedSecurity),
      "aria-label": gt(n.resolvedSecurity)
    }, W, j));
  }
  const m = c("div", { className: "breadcrumb-wrap" });
  m.append(h), v.append(m), n.description && v.append(c("p", { textContent: n.description })), e.append(v);
  const S = jc(n);
  S && e.append(S);
  const y = n.parameters.filter((_) => _.in !== "cookie"), x = ge({ title: "Request" });
  if (y.length > 0 && x.append(qc(y)), n.requestBody && x.append(Pc(n)), y.length === 0 && !n.requestBody) {
    const _ = c("div", { className: "params empty", textContent: "Параметры и тело запроса не требуются" });
    x.append(_);
  }
  e.append(x);
  let $ = !1;
  Object.keys(n.responses).length > 0 && (e.append(Fc(n)), $ = !0);
  const O = Ri({
    type: "endpoint",
    method: n.method,
    path: n.path
  }), I = () => {
    O && e.append(c("div", { className: "block section" }, O));
  };
  $ && I(), n.callbacks && n.callbacks.length > 0 && e.append(Hc(n)), $ || I();
  const D = Uc(n);
  Oc(n, t, D);
}
function jc(e) {
  const t = [];
  if (e.requestBody) {
    const o = Object.keys(e.requestBody.content || {});
    t.push({
      name: "Content-Type",
      value: o[0] || "application/json",
      description: "Media type for request body payload",
      required: !!e.requestBody?.required
    });
  }
  if (de(e.resolvedSecurity)) {
    const o = k.get().spec, l = o ? tr(e.resolvedSecurity, o.securitySchemes) : {}, f = { ...o ? nr(e.resolvedSecurity, o.securitySchemes) : {}, ...l };
    for (const [p, g] of Object.entries(f))
      t.push({
        name: p,
        value: g,
        description: "Authentication header value",
        required: !0
      });
  }
  for (const o of e.parameters.filter((l) => l.in === "header"))
    t.push({
      name: o.name,
      value: String(o.schema?.default ?? o.example ?? ""),
      description: o.description,
      required: o.required
    });
  if (t.length === 0) return null;
  const n = t.map((o) => {
    const l = c("div", { className: "schema-row role-flat role-headers" }), u = c("div", { className: "schema-main-row" }), f = c("div", { className: "schema-name-wrapper" });
    f.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: o.name })
    );
    const p = c("div", { className: "schema-meta-wrapper" });
    o.required && p.append(B({ text: "required", kind: "required", size: "m" })), u.append(f, p), l.append(u);
    const g = c("div", { className: "schema-desc-col is-root" });
    o.description && g.append(c("p", { textContent: o.description }));
    const h = c("div", { className: "schema-enum-values" });
    return h.append(B({
      text: o.value || "—",
      kind: "chip",
      size: "s"
    })), g.append(h), g.children.length > 0 && l.append(g), l;
  }), i = Fe(), r = fn(), s = c("div", { className: "params" }), a = c("div", { className: "body role-headers" });
  return a.append(...n), s.append(a), r.append(s), i.append(r), ge(
    { title: "Headers" },
    i
  );
}
function qc(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, i = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Ai(e, { headerTitle: i, withEnumAndDefault: !0 });
}
function Pc(e) {
  const t = c("div", { className: "request-body-wrap" });
  e.requestBody?.description && t.append(c("p", { textContent: e.requestBody.description }));
  const n = e.requestBody?.content || {};
  for (const [i, r] of Object.entries(n))
    if (r.schema) {
      const s = Jn({ title: "Body" });
      s.append(B({
        text: i,
        kind: "chip",
        size: "s"
      })), t.append(yt(r.schema, s));
    }
  return t;
}
function Dc(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([a, o]) => {
    const l = o.schema ? Rt(o.schema) : "string", u = o.example !== void 0 ? String(o.example) : o.schema?.example !== void 0 ? String(o.schema.example) : "—", f = c("div", { className: "schema-row role-flat role-headers" }), p = c("div", { className: "schema-main-row" }), g = c("div", { className: "schema-name-wrapper" });
    g.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: a })
    );
    const h = c("div", { className: "schema-meta-wrapper" });
    h.append(B({ text: l, kind: "chip", size: "s" })), o.required && h.append(B({ text: "required", kind: "required", size: "m" })), p.append(g, h), f.append(p);
    const v = c("div", { className: "schema-desc-col is-root" });
    o.description && v.append(c("p", { textContent: o.description }));
    const m = c("div", { className: "schema-enum-values" });
    return m.append(B({
      text: u,
      kind: "chip",
      size: "s"
    })), v.append(m), v.children.length > 0 && f.append(v), f;
  }), i = c("div", { className: "params block" }), r = c("div", { className: "title", textContent: "Headers" }), s = c("div", { className: "body role-headers" });
  return s.append(...n), i.append(r, s), i;
}
function Fc(e) {
  const t = ge({
    titleEl: Xn("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const i = Fe(), r = c("div", { className: "card-row responses-header-row" }), s = c("div", { className: "tabs-code codes" });
  let a = n[0][0], o = "application/json";
  const l = /* @__PURE__ */ new Map();
  for (const [S, y] of n) {
    const x = Ro(S, S === a), $ = y.content && Object.keys(y.content)[0] || "application/json", O = y.content?.[$], I = O?.schema ? Rt(O.schema) : "plain";
    let D, _, j, W;
    if (O?.schema) {
      const z = ec(O.schema);
      D = z.body, _ = z.toggleCollapse, j = z.isExpanded, W = z.hasExpandable;
    } else {
      const z = c("div", { className: "schema" }), xe = c("div", { className: "body" });
      xe.append(c("p", { textContent: y.description || "No schema" })), z.append(xe), D = z, _ = () => {
      }, j = () => !1, W = !1;
    }
    const X = y.headers ? Dc(y.headers) : null;
    l.set(S, {
      body: D,
      headers: X,
      contentType: $,
      schemaType: I,
      toggleCollapse: _,
      isExpanded: j,
      hasExpandable: W
    }), s.append(x), x.addEventListener("click", () => {
      s.querySelectorAll('[data-badge-group="response-code"]').forEach((xe) => Ir(xe, !1)), Ir(x, !0), a = S;
      const z = l.get(S);
      o = z.contentType, u.textContent = z.contentType, f.textContent = z.schemaType, p.style.display = z.hasExpandable ? "inline-flex" : "none", p.classList.toggle("is-expanded", z.hasExpandable && z.isExpanded()), p.title = z.hasExpandable && z.isExpanded() ? "Collapse all" : "Expand all", h.innerHTML = "", z.headers ? (h.append(z.headers), h.hidden = !1) : h.hidden = !0, v.innerHTML = "", v.append(z.body);
    });
  }
  r.append(s);
  const u = B({
    text: o,
    kind: "chip",
    size: "s"
  }), f = B({
    text: l.get(a)?.schemaType || "plain",
    kind: "chip",
    size: "s"
  }), p = c("button", {
    className: "schema-collapse-btn is-expanded",
    type: "button",
    title: "Collapse all"
  });
  p.innerHTML = H.chevronDown, p.addEventListener("click", (S) => {
    S.stopPropagation();
    const y = l.get(a);
    y?.hasExpandable && (y.toggleCollapse(), p.classList.toggle("is-expanded", y.isExpanded()), p.title = y.isExpanded() ? "Collapse all" : "Expand all");
  }), r.append(u, f, p), i.append(Vn(r));
  const g = fn(), h = c("div", { className: "params wrap" }), v = c("div"), m = l.get(a);
  return m && (m.headers ? (h.append(m.headers), h.hidden = !1) : h.hidden = !0, v.append(m.body), p.style.display = m.hasExpandable ? "inline-flex" : "none", p.classList.toggle("is-expanded", m.hasExpandable && m.isExpanded()), p.title = m.hasExpandable && m.isExpanded() ? "Collapse all" : "Expand all"), g.append(h, v), i.append(g), t.append(i), t;
}
function Hc(e) {
  const t = ge({
    titleEl: Xn("Callbacks", B({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const i = c("div", { className: "callback-block" });
    i.append(c("div", { className: "callback-name", textContent: n.name }));
    for (const r of n.operations) {
      const s = c("div", { className: "callback-operation" }), a = c("div", { className: "callback-op-header" });
      if (a.append(
        B({
          text: r.method.toUpperCase(),
          kind: "method",
          method: r.method
        }),
        c("span", { className: "callback-op-path", textContent: r.path })
      ), s.append(a), r.summary && s.append(c("div", { className: "callback-op-summary", textContent: r.summary })), r.description && s.append(c("p", { textContent: r.description })), r.requestBody) {
        const o = r.requestBody.content || {};
        for (const [l, u] of Object.entries(o))
          u.schema && s.append(yt(u.schema, `${l} — Request Body`));
      }
      if (Object.keys(r.responses).length > 0)
        for (const [o, l] of Object.entries(r.responses)) {
          const u = c("div", { className: "callback-response-row" });
          if (u.append(B({
            text: o,
            kind: "status",
            statusCode: o
          })), l.description && u.append(c("p", { textContent: l.description })), l.content)
            for (const [f, p] of Object.entries(l.content))
              p.schema && u.append(yt(p.schema, `${f}`));
          s.append(u);
        }
      i.append(s);
    }
    t.append(i);
  }
  return t;
}
function Uc(e) {
  const t = Object.keys(e.responses).sort((n, i) => {
    const r = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, s = i.startsWith("2") ? 0 : i.startsWith("4") ? 1 : 2;
    return r - s || n.localeCompare(i);
  });
  for (const n of t) {
    const i = e.responses[n];
    if (!i?.content) continue;
    const r = Object.keys(i.content)[0] || "application/json", s = i.content[r], o = (s ? Ii(s) : [])[0];
    if (o && o.value !== void 0) {
      const l = typeof o.value == "string" ? o.value : JSON.stringify(o.value, null, 2), u = i.description || (n.startsWith("2") ? "OK" : n.startsWith("4") ? "Not Found" : "Error");
      return { statusCode: n, statusText: u, body: l };
    }
    if (s?.example !== void 0) {
      const l = typeof s.example == "string" ? s.example : JSON.stringify(s.example, null, 2);
      return { statusCode: n, statusText: i.description || "OK", body: l };
    }
  }
  return null;
}
function zc(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!de(t.resolvedSecurity)) return !1;
  const i = (e.auth.token || "").trim(), r = e.auth.schemes || {}, s = e.auth.activeScheme, a = (o) => String(r[o] || "").trim() ? !0 : i ? !s || s === o : !1;
  return n.some((o) => {
    const l = o.map((u) => u.schemeName);
    return l.length === 0 ? !0 : l.every((u) => a(u));
  });
}
function Wc(e, t, n) {
  fe(e);
  const i = k.get().spec;
  if (!i) return;
  const r = i.tags.find((m) => m.name === n);
  if (!r || r.operations.length === 0) {
    const m = c("div", { className: "block header" });
    m.append(c("h1", { textContent: "Tag not found" })), e.append(m), e.append(ge(
      { title: "Details" },
      c("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const s = c("div", { className: "block header" });
  s.append(c("h1", { textContent: r.name }));
  const a = k.get(), o = bi(a), l = Zn([
    {
      label: o || i.info.title || "Главная",
      href: "/",
      className: "breadcrumb-item",
      onClick: (m) => {
        m.preventDefault(), oe("/");
      }
    },
    { label: n, className: "breadcrumb-current" }
  ], {
    className: "breadcrumb-tag-page",
    leading: [B({ text: "Category", kind: "chip", size: "m" })]
  }), u = c("div", { className: "breadcrumb-wrap" });
  u.append(l), s.append(u), r.description && s.append(c("p", { textContent: r.description })), e.append(s);
  const f = Kc(r), p = r.operations.filter((m) => de(m.resolvedSecurity)).length, g = r.operations.filter((m) => m.deprecated).length;
  e.append(ge(
    { className: "summary" },
    wi(
      [
        { label: "Endpoints", value: r.operations.length },
        { label: "Auth Required", value: p },
        { label: "Deprecated", value: g }
      ],
      f
    )
  ));
  const h = ge({ title: "Endpoints" }), v = k.get().route;
  for (const m of r.operations) {
    const S = { type: "endpoint", tag: r.name, method: m.method, path: m.path }, y = v.type === "endpoint" && v.method === m.method && v.path === m.path, x = Fe({
      interactive: !0,
      active: y,
      className: `card-group${m.deprecated ? " deprecated" : ""}`,
      onClick: () => oe(ce(S))
    }), $ = c("div", { className: "card-info" });
    $.append(c("h3", {}, c("code", { textContent: m.path }))), (m.summary || m.operationId) && $.append(c("p", { textContent: m.summary || m.operationId }));
    const O = c("div", { className: "card-badges" });
    O.append(B({ text: m.method.toUpperCase(), kind: "method", method: m.method, size: "m" })), de(m.resolvedSecurity) && O.append(Qn({
      configured: er(m.resolvedSecurity, i.securitySchemes || {}),
      variant: "tag",
      title: gt(m.resolvedSecurity)
    })), x.append($, O), h.append(x);
  }
  e.append(h);
}
function Kc(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function Gc(e, t) {
  fe(e);
  const n = B({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), i = B({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), r = Zn(
    [
      {
        label: "Overview",
        href: "/",
        className: "breadcrumb-item",
        onClick: (u) => {
          u.preventDefault(), oe("/");
        }
      },
      { label: t.name, className: "breadcrumb-segment" }
    ],
    { leading: [n, i] }
  ), s = c("div", { className: "block header" });
  t.summary ? s.append(c("h1", { textContent: t.summary })) : s.append(c("h1", { textContent: t.name }));
  const a = c("div", { className: "breadcrumb-wrap" });
  a.append(r), s.append(a), t.description && s.append(c("p", { textContent: t.description })), e.append(s);
  const o = t.parameters.filter((u) => u.in !== "cookie");
  if (o.length > 0) {
    const u = ge({ title: "Parameters" }, Yc(o));
    e.append(u);
  }
  if (t.requestBody) {
    const u = ge({ title: "Webhook Payload" });
    t.requestBody.description && u.append(c("p", { textContent: t.requestBody.description }));
    const f = t.requestBody.content || {};
    for (const [p, g] of Object.entries(f))
      if (g.schema) {
        const h = Jn({ title: "Body" });
        h.append(B({
          text: p,
          kind: "chip",
          size: "s"
        })), u.append(yt(g.schema, h));
      }
    e.append(u);
  }
  if (Object.keys(t.responses).length > 0) {
    const u = ge({ title: "Expected Responses" });
    for (const [f, p] of Object.entries(t.responses)) {
      const g = c("div", { className: "response-block" });
      if (g.append(B({
        text: f,
        kind: "status",
        statusCode: f
      })), p.description && g.append(c("p", { textContent: p.description })), p.content)
        for (const [h, v] of Object.entries(p.content))
          v.schema && g.append(yt(v.schema, `${h} — Schema`));
      u.append(g);
    }
    e.append(u);
  }
  const l = Ri({ type: "webhook", webhookName: t.name });
  l && e.append(c("div", { className: "block section" }, l));
}
function Yc(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, i = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Ai(e, { headerTitle: i, withEnumAndDefault: !1 });
}
function Vc() {
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
function _e(e, t) {
  const n = e.querySelector(".aside");
  n && (n.hidden = !t);
}
function Kt(e) {
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
  const s = c("div", { className: "block header" });
  return i && s.append(c("span", { innerHTML: i, className: "icon-muted" })), s.append(c("h2", { textContent: t })), n && s.append(c("p", { className: "error-message", textContent: n })), s;
}
let Pe = null, we = null, rr = null, ir = null, sr = null, ft = null, Jt = !1, Gt = "";
function Jc(e, t) {
  Pe = c("div", { className: "root" });
  const n = {
    primaryColor: t.primaryColor
  };
  Tr(Pe, k.get().theme, n);
  const i = c("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  i.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', i.addEventListener("click", () => {
    k.set({ sidebarOpen: !0 }), we?.classList.remove("collapsed");
  }), we = c("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: r, main: s, aside: a } = Vc();
  rr = r, ir = s, sr = a, Pe.append(i, we, r), e.append(Pe), k.subscribe((o) => {
    Pe && (Tr(Pe, o.theme, n), we?.classList.toggle("collapsed", !o.sidebarOpen), i.classList.toggle("visible", !o.sidebarOpen), Kr(o, t));
  }), we?.classList.toggle("collapsed", !k.get().sidebarOpen), i.classList.toggle("visible", !k.get().sidebarOpen), Kr(k.get(), t);
}
function Xc() {
  Pe && (Pe.remove(), Pe = null, we = null, rr = null, ir = null, sr = null, ft = null, Jt = !1);
}
async function Kr(e, t) {
  const n = !!e.spec;
  we && n ? (Jt ? Uo(we, e.route) : Rr(we, t), Jt = !0) : Jt = !1;
  const i = ir, r = sr, s = rr;
  if (!i || !r || !s) return;
  if (e.loading) {
    _e(s, !1), fe(r), wt(i, Kt({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const u = i.parentElement;
    u && (u.scrollTop = 0);
    return;
  }
  if (e.error) {
    _e(s, !1), fe(r), wt(i, Kt({
      title: "Failed to load API specification",
      message: e.error,
      icon: H.warning,
      variant: "error"
    }));
    const u = i.parentElement;
    u && (u.scrollTop = 0);
    return;
  }
  if (!e.spec) return;
  const a = e.route, o = `${e.activeEnvironment}|${e.auth.token}`;
  if (ft && Gr(ft, a) && Gt === o) return;
  switch (ft && Gr(ft, a) && Gt !== o && (Gt = o, Zc(s, e), we && e.spec && Rr(we, t)), ft = { ...a }, Gt = o, fe(i), fe(r), a.type) {
    case "overview":
      _e(s, !1), jr(i);
      break;
    case "tag": {
      _e(s, !1), Wc(i, r, a.tag || "");
      break;
    }
    case "endpoint": {
      const u = Bi(e, a);
      u ? (_e(s, !0), await $c(i, r, u)) : (_e(s, !1), wt(i, Kt({
        title: "Endpoint not found",
        message: `${a.method?.toUpperCase()} ${a.path}`,
        variant: "empty"
      })));
      break;
    }
    case "schema": {
      const u = e.spec.schemas[a.schemaName || ""];
      if (u) {
        _e(s, !1);
        const f = c("div", { className: "block header" });
        f.append(c("h1", { textContent: a.schemaName || "" })), u.description && f.append(c("p", { textContent: String(u.description) }));
        const p = c("div", { className: "block section" });
        p.append(yt(u, "Properties")), wt(i, f, p);
      }
      break;
    }
    case "webhook": {
      const u = e.spec.webhooks?.find((f) => f.name === a.webhookName);
      u ? (_e(s, !1), Gc(i, u)) : (_e(s, !1), wt(i, Kt({
        title: "Webhook not found",
        message: a.webhookName || "",
        variant: "empty"
      })));
      break;
    }
    default:
      _e(s, !1), jr(i);
  }
  const l = i.parentElement;
  l && (l.scrollTop = 0);
}
function Zc(e, t, n) {
  const i = dn(t), r = pn(i), s = e.querySelector(".breadcrumb-item");
  if (s && (s.textContent = r || t.spec?.info.title || "Главная"), t.route.type !== "endpoint" || !t.spec) return;
  const a = e.querySelector(".aside.try-it .content"), o = Bi(t, t.route);
  if (o && de(o.resolvedSecurity) && a) {
    const l = a.querySelector(".headers-list");
    if (l) {
      const u = ["Authorization", "Cookie"];
      Array.from(l.querySelectorAll(".header-row")).filter((y) => {
        const x = y.querySelector("[data-header-name]");
        return x && u.includes(x.value);
      }).forEach((y) => y.remove());
      const g = tr(o.resolvedSecurity, t.spec.securitySchemes), v = { ...nr(o.resolvedSecurity, t.spec.securitySchemes), ...g }, m = Array.from(l.querySelectorAll(".header-row")), S = m.find((y) => {
        const x = y.querySelector("[data-header-name]");
        return x && x.value === "Content-Type";
      }) || m[0];
      for (const [y, x] of Object.entries(v).reverse()) {
        const $ = Ot(y, x);
        S ? S.insertAdjacentElement("beforebegin", $) : l.prepend($);
      }
    }
  }
  a && o && a.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function Bi(e, t) {
  return e.spec && e.spec.operations.find(
    (n) => n.method === t.method && n.path === t.path
  ) || null;
}
function Gr(e, t) {
  return e.type === t.type && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
const $i = "ap_portal_prefs";
function Qc() {
  try {
    const e = localStorage.getItem($i);
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
function el(e) {
  try {
    localStorage.setItem($i, JSON.stringify(e));
  } catch {
  }
}
function Yr(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function tl(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], i = Yr(e[n]);
  for (let r = 1; r < t.length; r++) {
    const s = t[r], a = Yr(e[s]);
    a < i && (i = a, n = s);
  }
  return n;
}
function nl(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), i = Object.entries(t.schemes);
  if (n.length !== i.length) return !1;
  for (const [r, s] of n)
    if (t.schemes[r] !== s) return !1;
  return !0;
}
function rl(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const i = {};
  for (const a of n) {
    const o = e.schemes[a];
    typeof o == "string" && o.length > 0 && (i[a] = o);
  }
  let r = e.activeScheme;
  (!r || !t[r]) && (r = n.find((a) => !!i[a]) || ""), !r && e.token && (r = tl(t)), r && e.token && !i[r] && (i[r] = e.token);
  let s = e.token;
  return r && i[r] && s !== i[r] && (s = i[r]), !s && r && i[r] && (s = i[r]), {
    ...e,
    schemes: i,
    activeScheme: r,
    token: s
  };
}
function il(e, t) {
  let n;
  return ((...i) => {
    clearTimeout(n), n = setTimeout(() => e(...i), t);
  });
}
let cn = !1, qn = null, Pn = null;
async function ji(e) {
  let t = null;
  cn && (t = k.get().auth, ar());
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  k.reset();
  const i = e.environments || [{ name: "default", baseUrl: "" }], r = e.defaultEnvironment || i[0]?.name || "default";
  k.set({
    loading: !0,
    theme: No(e.theme),
    environments: [...i],
    initialEnvironments: [...i],
    activeEnvironment: r
  });
  const s = Qc();
  s ? k.set({
    activeEnvironment: s.activeEnvironment && i.some((o) => o.name === s.activeEnvironment) ? s.activeEnvironment : r,
    auth: s.auth
  }) : t && k.setAuth(t);
  const a = il(() => {
    const o = k.get();
    el({
      activeEnvironment: o.activeEnvironment,
      environments: o.environments,
      auth: o.auth
    });
  }, 300);
  k.subscribe(() => a()), fs(e.basePath), Pn = Ho(), Jc(n, e), cn = !0;
  try {
    let o;
    const l = e.specUrl;
    if (e.spec)
      o = e.spec;
    else if (l)
      o = await xo(l);
    else
      throw new Error("Either spec or specUrl must be provided");
    const u = co(o);
    if (u.servers.length > 0 && k.get().environments[0]?.baseUrl === "") {
      const g = [...k.get().environments];
      g[0] = { ...g[0], baseUrl: u.servers[0].url };
      for (let h = 1; h < u.servers.length; h++) {
        const v = u.servers[h];
        g.push({
          name: v.description || `Server ${h + 1}`,
          baseUrl: v.url
        });
      }
      k.set({ environments: g, initialEnvironments: g.map((h) => ({ ...h })) });
    }
    const f = k.get().auth, p = rl(f, u.securitySchemes);
    nl(f, p) || k.setAuth(p), Eo(u), k.set({ spec: u, loading: !1, error: null });
  } catch (o) {
    k.set({
      loading: !1,
      error: o.message || "Failed to load specification"
    });
  }
  return qn = sl(), qn;
}
function ar() {
  cn && (Pn?.(), Pn = null, ms(), Xc(), k.reset(), cn = !1, qn = null);
}
function sl() {
  return {
    getState: () => k.get(),
    subscribe: (e) => k.subscribe(e),
    setToken: (e) => {
      const t = k.get().auth.activeScheme;
      t ? k.setSchemeValue(t, e) : k.setAuth({ token: e, source: "manual" });
    },
    setEnvironment: (e) => k.setActiveEnvironment(e),
    navigate: (e) => oe(e)
  };
}
const Vr = [
  "spec-url",
  "spec-json",
  "theme",
  "primary-color",
  "base-path",
  "default-environment",
  "environments-array",
  "title"
], qe = class qe extends HTMLElement {
  constructor() {
    super(...arguments), this.api = null, this.reloadTimer = null;
  }
  static get observedAttributes() {
    return [...Vr];
  }
  async connectedCallback() {
    if (qe.activeElement && qe.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    qe.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    qe.activeElement === this && (this.api = null, ar(), qe.activeElement = null);
  }
  attributeChangedCallback(t, n, i) {
    this.isConnected && n !== i && Vr.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
      this.reload();
    }, 80));
  }
  async reload() {
    qe.activeElement === this && await this.mountFromAttributes();
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
      this.api = await ji({ ...t, mount: this });
    } catch (t) {
      const n = t instanceof Error ? t.message : String(t);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${n}</div>`;
    }
  }
  parseConfig() {
    const t = this.getAttribute("spec-json"), n = this.getAttribute("environments-array");
    return {
      specUrl: this.getAttribute("spec-url") || void 0,
      spec: t ? qi(t, "spec-json") : void 0,
      theme: ol(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      basePath: this.getAttribute("base-path") || void 0,
      defaultEnvironment: this.getAttribute("default-environment") || void 0,
      environments: n ? al(n) : void 0,
      title: this.getAttribute("title") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
qe.activeElement = null;
let Dn = qe;
function qi(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function al(e) {
  const t = qi(e, "environments-array");
  if (!Array.isArray(t))
    throw new Error("Invalid JSON in environments-array");
  const n = /* @__PURE__ */ new Set();
  return t.map((i, r) => {
    if (typeof i != "string")
      throw new Error("Invalid JSON in environments-array");
    const s = Gn(i.trim());
    if (!s)
      throw new Error("Invalid JSON in environments-array");
    const a = pn(s) || `env-${r + 1}`;
    let o = a, l = 2;
    for (; n.has(o); )
      o = `${a} #${l++}`;
    return n.add(o), { name: o, baseUrl: s };
  });
}
function ol(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", Dn);
const cl = {
  mount: ji,
  unmount: ar,
  version: "0.0.1"
};
export {
  cl as PureDocs,
  Dn as PureDocsElement,
  cl as default
};
//# sourceMappingURL=puredocs.js.map
