class ta {
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
const k = new ta(), na = /* @__PURE__ */ new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace"
]), ra = "~", Ie = `/${ra}`;
let qe = "";
function aa(e = "") {
  qe = ca(e || la()), window.addEventListener("popstate", Ct), Ct();
}
function oa() {
  window.removeEventListener("popstate", Ct);
}
function P(e) {
  const t = cr(e);
  window.history.pushState(null, "", qe + t), Ct();
}
function R(e) {
  const t = ia(e);
  return cr(t);
}
function ia(e) {
  switch (e.type) {
    case "overview":
      return "/";
    case "tag":
      return `/${X(e.tag || "")}`;
    case "endpoint": {
      const t = e.tag || "default", n = (e.method || "get").toLowerCase(), a = e.path || "/";
      return `/${X(t)}/${n}${a}`;
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
function ir(e) {
  const t = dn(e);
  if (t === "/") return { type: "overview" };
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
  if (na.has(r)) {
    const o = be(n[0]), i = r, s = n.length > 2 ? "/" + n.slice(2).map(be).join("/") : "/";
    return { type: "endpoint", tag: o, method: i, path: s };
  }
  return { type: "tag", tag: be(n[0]) };
}
function X(e) {
  return e.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function be(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function sa() {
  const e = window.location.pathname, t = ua(e || "/");
  return dn(t, { requireMarker: !0 });
}
function Ct() {
  const e = sa(), t = ir(e);
  k.setRoute(t);
}
function ca(e) {
  const t = ln(e);
  return t === "/" ? "" : t;
}
function la() {
  const e = ln(window.location.pathname || "/");
  if (e === "/") return "";
  const t = un(e);
  if (t >= 0)
    return e.slice(0, t) || "";
  const n = e.slice(1).split("/"), a = n[n.length - 1] || "";
  if (/\.[a-z0-9]+$/i.test(a)) {
    const r = e.lastIndexOf("/");
    return r <= 0 ? "" : e.slice(0, r);
  }
  return e;
}
function ua(e) {
  return qe ? e === qe || e === `${qe}/` ? "/" : e.startsWith(`${qe}/`) ? e.slice(qe.length) || "/" : e : e;
}
function ln(e) {
  const t = e.split("?")[0]?.split("#")[0] || "/";
  return (t.startsWith("/") ? t : `/${t}`).replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
}
function sr(e) {
  return un(e) >= 0;
}
function un(e) {
  if (e === Ie || e.startsWith(`${Ie}/`)) return 0;
  const t = e.indexOf(`${Ie}/`);
  return t >= 0 ? t : e.endsWith(Ie) ? e.length - Ie.length : -1;
}
function da(e) {
  if (!sr(e)) return e;
  const t = un(e);
  return t < 0 ? e : e.slice(t + Ie.length) || "/";
}
function dn(e, t = {}) {
  const n = ln(e);
  return n === "/" ? "/" : sr(n) ? da(n) : t.requireMarker ? "/" : n;
}
function cr(e) {
  const t = dn(e);
  return t === "/" ? "/" : `${Ie}${t}`;
}
function ot(e) {
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
function pn(e, t, n) {
  if (!e || e.length === 0)
    return { explicitlyNoAuth: n, requirements: [] };
  const a = e.map((r) => Object.entries(r).map(([o, i]) => ({
    schemeName: o,
    scopes: Array.isArray(i) ? i : [],
    scheme: t[o]
  })));
  return { explicitlyNoAuth: n, requirements: a };
}
function W(e) {
  return !!(e && !e.explicitlyNoAuth && e.requirements.length > 0);
}
function fn(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function pa(e) {
  if (!W(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const a of e.requirements)
    for (const r of a) {
      const o = fn(r.scheme);
      t.has(o) || (t.add(o), n.push(o));
    }
  return n;
}
function lr(e) {
  const t = pa(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function De(e) {
  return W(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((a) => {
    const r = fn(a.scheme);
    return a.scopes.length > 0 ? `${r} [${a.scopes.join(", ")}]` : r;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function jt(e, t, n, a) {
  const r = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!W(e)) return r;
  for (const s of e.requirements) {
    if (!s.every((d) => !!t[d.schemeName]) && s.length > 0) continue;
    const u = Tn(s, t);
    if (Object.keys(u.headers).length > 0 || Object.keys(u.query).length > 0 || Object.keys(u.cookies).length > 0)
      return u;
  }
  return !a || !n ? r : Tn([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: a });
}
function fa(e) {
  const t = {};
  if (!W(e)) return t;
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
function Tn(e, t) {
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
function ur(e) {
  return typeof e > "u" || e === null;
}
function ma(e) {
  return typeof e == "object" && e !== null;
}
function ha(e) {
  return Array.isArray(e) ? e : ur(e) ? [] : [e];
}
function ga(e, t) {
  var n, a, r, o;
  if (t)
    for (o = Object.keys(t), n = 0, a = o.length; n < a; n += 1)
      r = o[n], e[r] = t[r];
  return e;
}
function va(e, t) {
  var n = "", a;
  for (a = 0; a < t; a += 1)
    n += e;
  return n;
}
function ya(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
var ba = ur, xa = ma, ka = ha, Ca = va, wa = ya, Na = ga, Y = {
  isNothing: ba,
  isObject: xa,
  toArray: ka,
  repeat: Ca,
  isNegativeZero: wa,
  extend: Na
};
function dr(e, t) {
  var n = "", a = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), a + " " + n) : a;
}
function it(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = dr(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
it.prototype = Object.create(Error.prototype);
it.prototype.constructor = it;
it.prototype.toString = function(t) {
  return this.name + ": " + dr(this, t);
};
var ge = it;
function zt(e, t, n, a, r) {
  var o = "", i = "", s = Math.floor(r / 2) - 1;
  return a - t > s && (o = " ... ", t = a - s + o.length), n - a > s && (i = " ...", n = a + s - i.length), {
    str: o + e.slice(t, n).replace(/\t/g, "→") + i,
    pos: a - t + o.length
    // relative position
  };
}
function Wt(e, t) {
  return Y.repeat(" ", t - e.length) + e;
}
function Sa(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var n = /\r?\n|\r|\0/g, a = [0], r = [], o, i = -1; o = n.exec(e.buffer); )
    r.push(o.index), a.push(o.index + o[0].length), e.position <= o.index && i < 0 && (i = a.length - 2);
  i < 0 && (i = a.length - 1);
  var s = "", l, u, d = Math.min(e.line + t.linesAfter, r.length).toString().length, p = t.maxLength - (t.indent + d + 3);
  for (l = 1; l <= t.linesBefore && !(i - l < 0); l++)
    u = zt(
      e.buffer,
      a[i - l],
      r[i - l],
      e.position - (a[i] - a[i - l]),
      p
    ), s = Y.repeat(" ", t.indent) + Wt((e.line - l + 1).toString(), d) + " | " + u.str + `
` + s;
  for (u = zt(e.buffer, a[i], r[i], e.position, p), s += Y.repeat(" ", t.indent) + Wt((e.line + 1).toString(), d) + " | " + u.str + `
`, s += Y.repeat("-", t.indent + d + 3 + u.pos) + `^
`, l = 1; l <= t.linesAfter && !(i + l >= r.length); l++)
    u = zt(
      e.buffer,
      a[i + l],
      r[i + l],
      e.position - (a[i] - a[i + l]),
      p
    ), s += Y.repeat(" ", t.indent) + Wt((e.line + l + 1).toString(), d) + " | " + u.str + `
`;
  return s.replace(/\n$/, "");
}
var Aa = Sa, Ea = [
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
], La = [
  "scalar",
  "sequence",
  "mapping"
];
function Oa(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(a) {
      t[String(a)] = n;
    });
  }), t;
}
function Ta(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (Ea.indexOf(n) === -1)
      throw new ge('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = Oa(t.styleAliases || null), La.indexOf(this.kind) === -1)
    throw new ge('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var V = Ta;
function In(e, t) {
  var n = [];
  return e[t].forEach(function(a) {
    var r = n.length;
    n.forEach(function(o, i) {
      o.tag === a.tag && o.kind === a.kind && o.multi === a.multi && (r = i);
    }), n[r] = a;
  }), n;
}
function Ia() {
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
  if (t instanceof V)
    a.push(t);
  else if (Array.isArray(t))
    a = a.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (a = a.concat(t.explicit));
  else
    throw new ge("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(o) {
    if (!(o instanceof V))
      throw new ge("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new ge("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new ge("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), a.forEach(function(o) {
    if (!(o instanceof V))
      throw new ge("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var r = Object.create(Qt.prototype);
  return r.implicit = (this.implicit || []).concat(n), r.explicit = (this.explicit || []).concat(a), r.compiledImplicit = In(r, "implicit"), r.compiledExplicit = In(r, "explicit"), r.compiledTypeMap = Ia(r.compiledImplicit, r.compiledExplicit), r;
};
var qa = Qt, $a = new V("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), ja = new V("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), Ba = new V("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Ma = new qa({
  explicit: [
    $a,
    ja,
    Ba
  ]
});
function Pa(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Ra() {
  return null;
}
function Ha(e) {
  return e === null;
}
var Fa = new V("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Pa,
  construct: Ra,
  predicate: Ha,
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
function _a(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function Da(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Ua(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var za = new V("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: _a,
  construct: Da,
  predicate: Ua,
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
function Wa(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Va(e) {
  return 48 <= e && e <= 55;
}
function Ya(e) {
  return 48 <= e && e <= 57;
}
function Ga(e) {
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
          if (!Wa(e.charCodeAt(n))) return !1;
          a = !0;
        }
      return a && r !== "_";
    }
    if (r === "o") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Va(e.charCodeAt(n))) return !1;
          a = !0;
        }
      return a && r !== "_";
    }
  }
  if (r === "_") return !1;
  for (; n < t; n++)
    if (r = e[n], r !== "_") {
      if (!Ya(e.charCodeAt(n)))
        return !1;
      a = !0;
    }
  return !(!a || r === "_");
}
function Ka(e) {
  var t = e, n = 1, a;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), a = t[0], (a === "-" || a === "+") && (a === "-" && (n = -1), t = t.slice(1), a = t[0]), t === "0") return 0;
  if (a === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function Ja(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !Y.isNegativeZero(e);
}
var Za = new V("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Ga,
  construct: Ka,
  predicate: Ja,
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
}), Xa = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Qa(e) {
  return !(e === null || !Xa.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function eo(e) {
  var t, n;
  return t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
var to = /^[-+]?[0-9]+e/;
function no(e, t) {
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
  else if (Y.isNegativeZero(e))
    return "-0.0";
  return n = e.toString(10), to.test(n) ? n.replace("e", ".e") : n;
}
function ro(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || Y.isNegativeZero(e));
}
var ao = new V("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Qa,
  construct: eo,
  predicate: ro,
  represent: no,
  defaultStyle: "lowercase"
}), oo = Ma.extend({
  implicit: [
    Fa,
    za,
    Za,
    ao
  ]
}), io = oo, pr = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), fr = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function so(e) {
  return e === null ? !1 : pr.exec(e) !== null || fr.exec(e) !== null;
}
function co(e) {
  var t, n, a, r, o, i, s, l = 0, u = null, d, p, m;
  if (t = pr.exec(e), t === null && (t = fr.exec(e)), t === null) throw new Error("Date resolve error");
  if (n = +t[1], a = +t[2] - 1, r = +t[3], !t[4])
    return new Date(Date.UTC(n, a, r));
  if (o = +t[4], i = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (d = +t[10], p = +(t[11] || 0), u = (d * 60 + p) * 6e4, t[9] === "-" && (u = -u)), m = new Date(Date.UTC(n, a, r, o, i, s, l)), u && m.setTime(m.getTime() - u), m;
}
function lo(e) {
  return e.toISOString();
}
var uo = new V("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: so,
  construct: co,
  instanceOf: Date,
  represent: lo
});
function po(e) {
  return e === "<<" || e === null;
}
var fo = new V("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: po
}), mn = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function mo(e) {
  if (e === null) return !1;
  var t, n, a = 0, r = e.length, o = mn;
  for (n = 0; n < r; n++)
    if (t = o.indexOf(e.charAt(n)), !(t > 64)) {
      if (t < 0) return !1;
      a += 6;
    }
  return a % 8 === 0;
}
function ho(e) {
  var t, n, a = e.replace(/[\r\n=]/g, ""), r = a.length, o = mn, i = 0, s = [];
  for (t = 0; t < r; t++)
    t % 4 === 0 && t && (s.push(i >> 16 & 255), s.push(i >> 8 & 255), s.push(i & 255)), i = i << 6 | o.indexOf(a.charAt(t));
  return n = r % 4 * 6, n === 0 ? (s.push(i >> 16 & 255), s.push(i >> 8 & 255), s.push(i & 255)) : n === 18 ? (s.push(i >> 10 & 255), s.push(i >> 2 & 255)) : n === 12 && s.push(i >> 4 & 255), new Uint8Array(s);
}
function go(e) {
  var t = "", n = 0, a, r, o = e.length, i = mn;
  for (a = 0; a < o; a++)
    a % 3 === 0 && a && (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]), n = (n << 8) + e[a];
  return r = o % 3, r === 0 ? (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]) : r === 2 ? (t += i[n >> 10 & 63], t += i[n >> 4 & 63], t += i[n << 2 & 63], t += i[64]) : r === 1 && (t += i[n >> 2 & 63], t += i[n << 4 & 63], t += i[64], t += i[64]), t;
}
function vo(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var yo = new V("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: mo,
  construct: ho,
  predicate: vo,
  represent: go
}), bo = Object.prototype.hasOwnProperty, xo = Object.prototype.toString;
function ko(e) {
  if (e === null) return !0;
  var t = [], n, a, r, o, i, s = e;
  for (n = 0, a = s.length; n < a; n += 1) {
    if (r = s[n], i = !1, xo.call(r) !== "[object Object]") return !1;
    for (o in r)
      if (bo.call(r, o))
        if (!i) i = !0;
        else return !1;
    if (!i) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function Co(e) {
  return e !== null ? e : [];
}
var wo = new V("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: ko,
  construct: Co
}), No = Object.prototype.toString;
function So(e) {
  if (e === null) return !0;
  var t, n, a, r, o, i = e;
  for (o = new Array(i.length), t = 0, n = i.length; t < n; t += 1) {
    if (a = i[t], No.call(a) !== "[object Object]" || (r = Object.keys(a), r.length !== 1)) return !1;
    o[t] = [r[0], a[r[0]]];
  }
  return !0;
}
function Ao(e) {
  if (e === null) return [];
  var t, n, a, r, o, i = e;
  for (o = new Array(i.length), t = 0, n = i.length; t < n; t += 1)
    a = i[t], r = Object.keys(a), o[t] = [r[0], a[r[0]]];
  return o;
}
var Eo = new V("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: So,
  construct: Ao
}), Lo = Object.prototype.hasOwnProperty;
function Oo(e) {
  if (e === null) return !0;
  var t, n = e;
  for (t in n)
    if (Lo.call(n, t) && n[t] !== null)
      return !1;
  return !0;
}
function To(e) {
  return e !== null ? e : {};
}
var Io = new V("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: Oo,
  construct: To
}), qo = io.extend({
  implicit: [
    uo,
    fo
  ],
  explicit: [
    yo,
    wo,
    Eo,
    Io
  ]
}), Ne = Object.prototype.hasOwnProperty, wt = 1, mr = 2, hr = 3, Nt = 4, Vt = 1, $o = 2, qn = 3, jo = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Bo = /[\x85\u2028\u2029]/, Mo = /[,\[\]\{\}]/, gr = /^(?:!|!!|![a-z\-]+!)$/i, vr = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function $n(e) {
  return Object.prototype.toString.call(e);
}
function ce(e) {
  return e === 10 || e === 13;
}
function $e(e) {
  return e === 9 || e === 32;
}
function Z(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Pe(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Po(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Ro(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function Ho(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function jn(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function Fo(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function yr(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
var br = new Array(256), xr = new Array(256);
for (var Be = 0; Be < 256; Be++)
  br[Be] = jn(Be) ? 1 : 0, xr[Be] = jn(Be);
function _o(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || qo, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function kr(e, t) {
  var n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = Aa(n), new ge(t, n);
}
function S(e, t) {
  throw kr(e, t);
}
function St(e, t) {
  e.onWarning && e.onWarning.call(null, kr(e, t));
}
var Bn = {
  YAML: function(t, n, a) {
    var r, o, i;
    t.version !== null && S(t, "duplication of %YAML directive"), a.length !== 1 && S(t, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(a[0]), r === null && S(t, "ill-formed argument of the YAML directive"), o = parseInt(r[1], 10), i = parseInt(r[2], 10), o !== 1 && S(t, "unacceptable YAML version of the document"), t.version = a[0], t.checkLineBreaks = i < 2, i !== 1 && i !== 2 && St(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, a) {
    var r, o;
    a.length !== 2 && S(t, "TAG directive accepts exactly two arguments"), r = a[0], o = a[1], gr.test(r) || S(t, "ill-formed tag handle (first argument) of the TAG directive"), Ne.call(t.tagMap, r) && S(t, 'there is a previously declared suffix for "' + r + '" tag handle'), vr.test(o) || S(t, "ill-formed tag prefix (second argument) of the TAG directive");
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
    else jo.test(s) && S(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function Mn(e, t, n, a) {
  var r, o, i, s;
  for (Y.isObject(n) || S(e, "cannot merge mappings; the provided source object is unacceptable"), r = Object.keys(n), i = 0, s = r.length; i < s; i += 1)
    o = r[i], Ne.call(t, o) || (yr(t, o, n[o]), a[o] = !0);
}
function Re(e, t, n, a, r, o, i, s, l) {
  var u, d;
  if (Array.isArray(r))
    for (r = Array.prototype.slice.call(r), u = 0, d = r.length; u < d; u += 1)
      Array.isArray(r[u]) && S(e, "nested arrays are not supported inside keys"), typeof r == "object" && $n(r[u]) === "[object Object]" && (r[u] = "[object Object]");
  if (typeof r == "object" && $n(r) === "[object Object]" && (r = "[object Object]"), r = String(r), t === null && (t = {}), a === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (u = 0, d = o.length; u < d; u += 1)
        Mn(e, t, o[u], n);
    else
      Mn(e, t, o, n);
  else
    !e.json && !Ne.call(n, r) && Ne.call(t, r) && (e.line = i || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, S(e, "duplicated mapping key")), yr(t, r, o), delete n[r];
  return t;
}
function hn(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : S(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function H(e, t, n) {
  for (var a = 0, r = e.input.charCodeAt(e.position); r !== 0; ) {
    for (; $e(r); )
      r === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
    if (t && r === 35)
      do
        r = e.input.charCodeAt(++e.position);
      while (r !== 10 && r !== 13 && r !== 0);
    if (ce(r))
      for (hn(e), r = e.input.charCodeAt(e.position), a++, e.lineIndent = 0; r === 32; )
        e.lineIndent++, r = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && a !== 0 && e.lineIndent < n && St(e, "deficient indentation"), a;
}
function Bt(e) {
  var t = e.position, n;
  return n = e.input.charCodeAt(t), !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || Z(n)));
}
function gn(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += Y.repeat(`
`, t - 1));
}
function Do(e, t, n) {
  var a, r, o, i, s, l, u, d, p = e.kind, m = e.result, f;
  if (f = e.input.charCodeAt(e.position), Z(f) || Pe(f) || f === 35 || f === 38 || f === 42 || f === 33 || f === 124 || f === 62 || f === 39 || f === 34 || f === 37 || f === 64 || f === 96 || (f === 63 || f === 45) && (r = e.input.charCodeAt(e.position + 1), Z(r) || n && Pe(r)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = i = e.position, s = !1; f !== 0; ) {
    if (f === 58) {
      if (r = e.input.charCodeAt(e.position + 1), Z(r) || n && Pe(r))
        break;
    } else if (f === 35) {
      if (a = e.input.charCodeAt(e.position - 1), Z(a))
        break;
    } else {
      if (e.position === e.lineStart && Bt(e) || n && Pe(f))
        break;
      if (ce(f))
        if (l = e.line, u = e.lineStart, d = e.lineIndent, H(e, !1, -1), e.lineIndent >= t) {
          s = !0, f = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = i, e.line = l, e.lineStart = u, e.lineIndent = d;
          break;
        }
    }
    s && (we(e, o, i, !1), gn(e, e.line - l), o = i = e.position, s = !1), $e(f) || (i = e.position + 1), f = e.input.charCodeAt(++e.position);
  }
  return we(e, o, i, !1), e.result ? !0 : (e.kind = p, e.result = m, !1);
}
function Uo(e, t) {
  var n, a, r;
  if (n = e.input.charCodeAt(e.position), n !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, a = r = e.position; (n = e.input.charCodeAt(e.position)) !== 0; )
    if (n === 39)
      if (we(e, a, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39)
        a = e.position, e.position++, r = e.position;
      else
        return !0;
    else ce(n) ? (we(e, a, r, !0), gn(e, H(e, !1, t)), a = r = e.position) : e.position === e.lineStart && Bt(e) ? S(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position);
  S(e, "unexpected end of the stream within a single quoted scalar");
}
function zo(e, t) {
  var n, a, r, o, i, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = a = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return we(e, n, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (we(e, n, e.position, !0), s = e.input.charCodeAt(++e.position), ce(s))
        H(e, !1, t);
      else if (s < 256 && br[s])
        e.result += xr[s], e.position++;
      else if ((i = Ro(s)) > 0) {
        for (r = i, o = 0; r > 0; r--)
          s = e.input.charCodeAt(++e.position), (i = Po(s)) >= 0 ? o = (o << 4) + i : S(e, "expected hexadecimal character");
        e.result += Fo(o), e.position++;
      } else
        S(e, "unknown escape sequence");
      n = a = e.position;
    } else ce(s) ? (we(e, n, a, !0), gn(e, H(e, !1, t)), n = a = e.position) : e.position === e.lineStart && Bt(e) ? S(e, "unexpected end of the document within a double quoted scalar") : (e.position++, a = e.position);
  }
  S(e, "unexpected end of the stream within a double quoted scalar");
}
function Wo(e, t) {
  var n = !0, a, r, o, i = e.tag, s, l = e.anchor, u, d, p, m, f, h = /* @__PURE__ */ Object.create(null), g, b, x, v;
  if (v = e.input.charCodeAt(e.position), v === 91)
    d = 93, f = !1, s = [];
  else if (v === 123)
    d = 125, f = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), v = e.input.charCodeAt(++e.position); v !== 0; ) {
    if (H(e, !0, t), v = e.input.charCodeAt(e.position), v === d)
      return e.position++, e.tag = i, e.anchor = l, e.kind = f ? "mapping" : "sequence", e.result = s, !0;
    n ? v === 44 && S(e, "expected the node content, but found ','") : S(e, "missed comma between flow collection entries"), b = g = x = null, p = m = !1, v === 63 && (u = e.input.charCodeAt(e.position + 1), Z(u) && (p = m = !0, e.position++, H(e, !0, t))), a = e.line, r = e.lineStart, o = e.position, Ue(e, t, wt, !1, !0), b = e.tag, g = e.result, H(e, !0, t), v = e.input.charCodeAt(e.position), (m || e.line === a) && v === 58 && (p = !0, v = e.input.charCodeAt(++e.position), H(e, !0, t), Ue(e, t, wt, !1, !0), x = e.result), f ? Re(e, s, h, b, g, x, a, r, o) : p ? s.push(Re(e, null, h, b, g, x, a, r, o)) : s.push(g), H(e, !0, t), v = e.input.charCodeAt(e.position), v === 44 ? (n = !0, v = e.input.charCodeAt(++e.position)) : n = !1;
  }
  S(e, "unexpected end of the stream within a flow collection");
}
function Vo(e, t) {
  var n, a, r = Vt, o = !1, i = !1, s = t, l = 0, u = !1, d, p;
  if (p = e.input.charCodeAt(e.position), p === 124)
    a = !1;
  else if (p === 62)
    a = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; p !== 0; )
    if (p = e.input.charCodeAt(++e.position), p === 43 || p === 45)
      Vt === r ? r = p === 43 ? qn : $o : S(e, "repeat of a chomping mode identifier");
    else if ((d = Ho(p)) >= 0)
      d === 0 ? S(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : i ? S(e, "repeat of an indentation width identifier") : (s = t + d - 1, i = !0);
    else
      break;
  if ($e(p)) {
    do
      p = e.input.charCodeAt(++e.position);
    while ($e(p));
    if (p === 35)
      do
        p = e.input.charCodeAt(++e.position);
      while (!ce(p) && p !== 0);
  }
  for (; p !== 0; ) {
    for (hn(e), e.lineIndent = 0, p = e.input.charCodeAt(e.position); (!i || e.lineIndent < s) && p === 32; )
      e.lineIndent++, p = e.input.charCodeAt(++e.position);
    if (!i && e.lineIndent > s && (s = e.lineIndent), ce(p)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      r === qn ? e.result += Y.repeat(`
`, o ? 1 + l : l) : r === Vt && o && (e.result += `
`);
      break;
    }
    for (a ? $e(p) ? (u = !0, e.result += Y.repeat(`
`, o ? 1 + l : l)) : u ? (u = !1, e.result += Y.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += Y.repeat(`
`, l) : e.result += Y.repeat(`
`, o ? 1 + l : l), o = !0, i = !0, l = 0, n = e.position; !ce(p) && p !== 0; )
      p = e.input.charCodeAt(++e.position);
    we(e, n, e.position, !1);
  }
  return !0;
}
function Pn(e, t) {
  var n, a = e.tag, r = e.anchor, o = [], i, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, S(e, "tab characters must not be used in indentation")), !(l !== 45 || (i = e.input.charCodeAt(e.position + 1), !Z(i)))); ) {
    if (s = !0, e.position++, H(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (n = e.line, Ue(e, t, hr, !1, !0), o.push(e.result), H(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && l !== 0)
      S(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = a, e.anchor = r, e.kind = "sequence", e.result = o, !0) : !1;
}
function Yo(e, t, n) {
  var a, r, o, i, s, l, u = e.tag, d = e.anchor, p = {}, m = /* @__PURE__ */ Object.create(null), f = null, h = null, g = null, b = !1, x = !1, v;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = p), v = e.input.charCodeAt(e.position); v !== 0; ) {
    if (!b && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, S(e, "tab characters must not be used in indentation")), a = e.input.charCodeAt(e.position + 1), o = e.line, (v === 63 || v === 58) && Z(a))
      v === 63 ? (b && (Re(e, p, m, f, h, null, i, s, l), f = h = g = null), x = !0, b = !0, r = !0) : b ? (b = !1, r = !0) : S(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, v = a;
    else {
      if (i = e.line, s = e.lineStart, l = e.position, !Ue(e, n, mr, !1, !0))
        break;
      if (e.line === o) {
        for (v = e.input.charCodeAt(e.position); $e(v); )
          v = e.input.charCodeAt(++e.position);
        if (v === 58)
          v = e.input.charCodeAt(++e.position), Z(v) || S(e, "a whitespace character is expected after the key-value separator within a block mapping"), b && (Re(e, p, m, f, h, null, i, s, l), f = h = g = null), x = !0, b = !1, r = !1, f = e.tag, h = e.result;
        else if (x)
          S(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = u, e.anchor = d, !0;
      } else if (x)
        S(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = u, e.anchor = d, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (b && (i = e.line, s = e.lineStart, l = e.position), Ue(e, t, Nt, !0, r) && (b ? h = e.result : g = e.result), b || (Re(e, p, m, f, h, g, i, s, l), f = h = g = null), H(e, !0, -1), v = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && v !== 0)
      S(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return b && Re(e, p, m, f, h, null, i, s, l), x && (e.tag = u, e.anchor = d, e.kind = "mapping", e.result = p), x;
}
function Go(e) {
  var t, n = !1, a = !1, r, o, i;
  if (i = e.input.charCodeAt(e.position), i !== 33) return !1;
  if (e.tag !== null && S(e, "duplication of a tag property"), i = e.input.charCodeAt(++e.position), i === 60 ? (n = !0, i = e.input.charCodeAt(++e.position)) : i === 33 ? (a = !0, r = "!!", i = e.input.charCodeAt(++e.position)) : r = "!", t = e.position, n) {
    do
      i = e.input.charCodeAt(++e.position);
    while (i !== 0 && i !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), i = e.input.charCodeAt(++e.position)) : S(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; i !== 0 && !Z(i); )
      i === 33 && (a ? S(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(t - 1, e.position + 1), gr.test(r) || S(e, "named tag handle cannot contain such characters"), a = !0, t = e.position + 1)), i = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), Mo.test(o) && S(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !vr.test(o) && S(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    S(e, "tag name is malformed: " + o);
  }
  return n ? e.tag = o : Ne.call(e.tagMap, r) ? e.tag = e.tagMap[r] + o : r === "!" ? e.tag = "!" + o : r === "!!" ? e.tag = "tag:yaml.org,2002:" + o : S(e, 'undeclared tag handle "' + r + '"'), !0;
}
function Ko(e) {
  var t, n;
  if (n = e.input.charCodeAt(e.position), n !== 38) return !1;
  for (e.anchor !== null && S(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !Z(n) && !Pe(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && S(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function Jo(e) {
  var t, n, a;
  if (a = e.input.charCodeAt(e.position), a !== 42) return !1;
  for (a = e.input.charCodeAt(++e.position), t = e.position; a !== 0 && !Z(a) && !Pe(a); )
    a = e.input.charCodeAt(++e.position);
  return e.position === t && S(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), Ne.call(e.anchorMap, n) || S(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], H(e, !0, -1), !0;
}
function Ue(e, t, n, a, r) {
  var o, i, s, l = 1, u = !1, d = !1, p, m, f, h, g, b;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = i = s = Nt === n || hr === n, a && H(e, !0, -1) && (u = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; Go(e) || Ko(e); )
      H(e, !0, -1) ? (u = !0, s = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = u || r), (l === 1 || Nt === n) && (wt === n || mr === n ? g = t : g = t + 1, b = e.position - e.lineStart, l === 1 ? s && (Pn(e, b) || Yo(e, b, g)) || Wo(e, g) ? d = !0 : (i && Vo(e, g) || Uo(e, g) || zo(e, g) ? d = !0 : Jo(e) ? (d = !0, (e.tag !== null || e.anchor !== null) && S(e, "alias node should not have any properties")) : Do(e, g, wt === n) && (d = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (d = s && Pn(e, b))), e.tag === null)
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
function Zo(e) {
  var t = e.position, n, a, r, o = !1, i;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (i = e.input.charCodeAt(e.position)) !== 0 && (H(e, !0, -1), i = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || i !== 37)); ) {
    for (o = !0, i = e.input.charCodeAt(++e.position), n = e.position; i !== 0 && !Z(i); )
      i = e.input.charCodeAt(++e.position);
    for (a = e.input.slice(n, e.position), r = [], a.length < 1 && S(e, "directive name must not be less than one character in length"); i !== 0; ) {
      for (; $e(i); )
        i = e.input.charCodeAt(++e.position);
      if (i === 35) {
        do
          i = e.input.charCodeAt(++e.position);
        while (i !== 0 && !ce(i));
        break;
      }
      if (ce(i)) break;
      for (n = e.position; i !== 0 && !Z(i); )
        i = e.input.charCodeAt(++e.position);
      r.push(e.input.slice(n, e.position));
    }
    i !== 0 && hn(e), Ne.call(Bn, a) ? Bn[a](e, a, r) : St(e, 'unknown document directive "' + a + '"');
  }
  if (H(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, H(e, !0, -1)) : o && S(e, "directives end mark is expected"), Ue(e, e.lineIndent - 1, Nt, !1, !0), H(e, !0, -1), e.checkLineBreaks && Bo.test(e.input.slice(t, e.position)) && St(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && Bt(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, H(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    S(e, "end of the stream or a document separator is expected");
  else
    return;
}
function Xo(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var n = new _o(e, t), a = e.indexOf("\0");
  for (a !== -1 && (n.position = a, S(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    Zo(n);
  return n.documents;
}
function Qo(e, t) {
  var n = Xo(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new ge("expected a single document in the stream, but found more");
  }
}
var ei = Qo, ti = {
  load: ei
}, ni = ti.load;
const ri = 50, ai = 200;
function oi(e) {
  const t = ii(e.info || {}), n = si(e.servers || []), a = e.components || {}, r = ui(a.schemas || {}, e), o = ci(a.securitySchemes || {}), i = ot(e.security), s = e.paths || {}, l = {};
  for (const [m, f] of Object.entries(s))
    m.startsWith("/docs") || (l[m] = f);
  const u = di(l, e, i, o), d = hi(u, e.tags || []), p = pi(e.webhooks || {}, e, i, o);
  return { raw: e, info: t, servers: n, tags: d, operations: u, schemas: r, securitySchemes: o, webhooks: p };
}
function ii(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function si(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function ci(e) {
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
const at = /* @__PURE__ */ new Map();
let vn = 0;
function li(e, t) {
  if (at.has(e)) return at.get(e);
  if (++vn > ai) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((r) => decodeURIComponent(r.replace(/~1/g, "/").replace(/~0/g, "~")));
  let a = t;
  for (const r of n)
    if (a && typeof a == "object" && !Array.isArray(a))
      a = a[r];
    else
      return;
  return at.set(e, a), a;
}
function G(e, t, n = 0, a = /* @__PURE__ */ new Set()) {
  if (n > ri || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((i) => G(i, t, n + 1, a));
  const r = e;
  if (typeof r.$ref == "string") {
    const i = r.$ref;
    if (a.has(i)) return { type: "object", description: "[Circular reference]" };
    const s = new Set(a);
    s.add(i);
    const l = li(i, t);
    return l && typeof l == "object" ? G(l, t, n + 1, s) : l;
  }
  const o = {};
  for (const [i, s] of Object.entries(r))
    o[i] = G(s, t, n + 1, a);
  return o;
}
function ui(e, t) {
  at.clear(), vn = 0;
  const n = {};
  for (const [a, r] of Object.entries(e))
    n[a] = G(r, t);
  return n;
}
function di(e, t, n, a) {
  at.clear(), vn = 0;
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [i, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = ot(s.security), u = Array.isArray(s.parameters) ? s.parameters.map((d) => G(d, t)) : [];
    for (const d of o) {
      const p = s[d];
      if (!p) continue;
      const m = Cr(
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
function Cr(e, t, n, a, r, o = void 0, i = void 0, s = {}) {
  const l = Array.isArray(n.parameters) ? n.parameters.map((y) => G(y, r)) : [], u = [...a];
  for (const y of l) {
    const L = u.findIndex((C) => C.name === y.name && C.in === y.in);
    L >= 0 ? u[L] = y : u.push(y);
  }
  const d = wr(u, r);
  let p = Nr(n.requestBody, r);
  if (Array.isArray(n["x-doc-examples"])) {
    const y = n["x-doc-examples"], L = [];
    for (let C = 0; C < y.length; C++) {
      const N = y[C], j = N.scenario ? String(N.scenario) : `Example ${C + 1}`, D = N.request?.body;
      D !== void 0 && L.push({ summary: j, value: D });
    }
    if (L.length > 0) {
      p || (p = { required: !1, content: {} });
      const C = p.content["application/json"] || p.content["application/vnd.api+json"] || {};
      p.content["application/json"] || (p.content["application/json"] = C);
      const N = p.content["application/json"];
      N.examples || (N.examples = {});
      for (let j = 0; j < L.length; j++) {
        const O = L[j], K = `${O.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${j}`.replace(/^-/, "");
        N.examples[K] = { summary: O.summary, description: O.summary, value: O.value };
      }
    }
  }
  const m = Sr(n.responses, r), f = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], h = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), g = Object.prototype.hasOwnProperty.call(n, "security"), b = ot(n.security), x = g ? b : o ?? i, v = g && Array.isArray(b) && b.length === 0, A = mi(n.callbacks, r, s), T = {
    operationId: h,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: f,
    deprecated: !!n.deprecated,
    security: x,
    resolvedSecurity: pn(x, s, v),
    parameters: d,
    requestBody: p,
    responses: m
  };
  return A.length > 0 && (T.callbacks = A), T;
}
function pi(e, t, n, a) {
  if (!e || typeof e != "object") return [];
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [i, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = G(s, t), u = ot(l.security);
    for (const d of o) {
      const p = l[d];
      if (!p) continue;
      const m = Object.prototype.hasOwnProperty.call(p, "security"), f = ot(p.security), h = m ? f : u ?? n, g = m && Array.isArray(f) && f.length === 0, b = Array.isArray(p.parameters) ? p.parameters.map((T) => G(T, t)) : [], x = wr(b, t), v = Nr(p.requestBody, t), A = Sr(p.responses, t);
      r.push({
        name: i,
        method: d,
        path: i,
        summary: p.summary ? String(p.summary) : void 0,
        description: p.description ? String(p.description) : void 0,
        security: h,
        resolvedSecurity: pn(h, a, g),
        parameters: x,
        requestBody: v,
        responses: A
      });
    }
  }
  return r;
}
function wr(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? G(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? Er(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function Nr(e, t) {
  if (!e) return;
  const n = G(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: Ar(n.content || {}, t)
  };
}
function fi(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, r] of Object.entries(e)) {
    if (!r || typeof r != "object") continue;
    const o = G(r, t), i = o.schema, s = o.example ?? (i && typeof i == "object" ? i.example : void 0);
    n[a] = {
      description: o.description ? String(o.description) : void 0,
      required: !!o.required,
      schema: i && typeof i == "object" ? G(i, t) : void 0,
      example: s !== void 0 ? s : void 0,
      deprecated: !!o.deprecated
    };
  }
  return n;
}
function Sr(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [a, r] of Object.entries(e)) {
    const o = G(r, t), i = o.headers;
    n[a] = {
      statusCode: a,
      description: o.description ? String(o.description) : void 0,
      headers: i ? fi(i, t) : void 0,
      content: o.content ? Ar(o.content, t) : void 0
    };
  }
  return n;
}
function mi(e, t, n) {
  if (!e || typeof e != "object") return [];
  const a = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, i] of Object.entries(e)) {
    const s = G(i, t);
    if (!s || typeof s != "object") continue;
    const l = [];
    for (const [u, d] of Object.entries(s))
      if (!(!d || typeof d != "object"))
        for (const p of r) {
          const m = d[p];
          m && l.push(Cr(p, u, m, [], t, void 0, void 0, n));
        }
    l.length > 0 && a.push({ name: o, operations: l });
  }
  return a;
}
function Ar(e, t) {
  const n = {};
  for (const [a, r] of Object.entries(e)) {
    const o = r;
    n[a] = {
      schema: o.schema ? G(o.schema, t) : void 0,
      example: o.example,
      examples: o.examples ? Er(o.examples) : void 0
    };
  }
  return n;
}
function Er(e) {
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
function hi(e, t) {
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
function Te(e) {
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
          const t = Te(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, a] of Object.entries(e.properties))
            t[n] = Te(a);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const a = Te(n);
            a && typeof a == "object" && !Array.isArray(a) && Object.assign(t, a);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return Te(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return Te(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, a] of Object.entries(e.properties))
            t[n] = Te(a);
          return t;
        }
        return;
    }
  }
}
async function gi(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return ni(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let Me = [];
const Rn = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function vi(e) {
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
      requiresAuth: W(t.resolvedSecurity),
      authBadge: lr(t.resolvedSecurity) || void 0,
      authTitle: W(t.resolvedSecurity) ? De(t.resolvedSecurity) : void 0,
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
function yi(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), a = [];
  for (const r of Me) {
    let o = 0, i = !0;
    for (const s of n)
      r.keywords.includes(s) ? (o += 1, r.title.toLowerCase().includes(s) && (o += 3), r.path?.toLowerCase().includes(s) && (o += 2), r.method?.toLowerCase() === s && (o += 2)) : i = !1;
    i && o > 0 && a.push({ entry: r, score: o });
  }
  return a.sort((r, o) => {
    const i = Rn[r.entry.type] ?? 99, s = Rn[o.entry.type] ?? 99;
    return i !== s ? i - s : o.score !== r.score ? o.score - r.score : r.entry.title.localeCompare(o.entry.title);
  }).slice(0, t).map((r) => r.entry);
}
const Lr = "puredocs-theme";
function Hn(e, t, n) {
  const a = e.classList.contains("light") || e.classList.contains("dark");
  a && e.classList.add("theme-transitioning"), e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color"), a && setTimeout(() => e.classList.remove("theme-transitioning"), 550);
}
function bi() {
  const t = k.get().theme === "light" ? "dark" : "light";
  k.set({ theme: t });
  try {
    localStorage.setItem(Lr, t);
  } catch {
  }
}
function xi(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(Lr);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function Or(e) {
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
function z(e) {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
}
function tt(e, ...t) {
  z(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
async function ki(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function Ci(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], a = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** a).toFixed(a > 0 ? 1 : 0)} ${n[a]}`;
}
function wi(e) {
  return e < 1e3 ? `${Math.round(e)} ms` : `${(e / 1e3).toFixed(2)} s`;
}
const F = (e, t) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${1.75}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, I = {
  search: F('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  close: F('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: F('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  chevronDown: F('<path d="m6 9 6 6 6-6"/>'),
  chevronRight: F('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: F('<path d="m15 18-6-6 6-6"/>'),
  sun: F('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: F('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  copy: F('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  check: F('<path d="M20 6 9 17l-5-5"/>'),
  /** Closed padlock — requires auth (red) */
  lock: F('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>'),
  /** Open padlock — auth configured (green) */
  unlock: F('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M16 11V7a4 4 0 1 0-8 0v1"/>'),
  send: F('<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>'),
  key: F('<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>'),
  globe: F('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  server: F('<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>'),
  warning: F('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  settings: F('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>')
};
class Ni {
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
function je() {
  return Fe || (Fe = new Ni()), Fe;
}
function Si(e) {
  Fe?.notify(e);
}
function Tr() {
  Fe?.dispose(), Fe = null;
}
function Ai(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function ve(e) {
  return Ai(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function Ir(e) {
  return String(e || "").replace(/\/$/, "");
}
function Se(e) {
  return Ir(e).replace(/^https?:\/\//i, "");
}
function Ei(e) {
  return Ir(ve(e));
}
function ze(e) {
  return Se(ve(e));
}
function At(e) {
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
    for (const [g, b] of Object.entries(u))
      f.dataset[g] = b;
  return p && f.addEventListener("input", () => p(f.value)), m && f.addEventListener("change", () => m(f.value)), f;
}
const Li = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function Oi(e = "secondary") {
  return ["btn", ...Li[e]];
}
function le(e) {
  const { variant: t = "secondary", label: n, icon: a, ariaLabel: r, disabled: o, className: i, onClick: s } = e, l = document.createElement("button");
  l.type = "button";
  const u = Oi(t);
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
function qr(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : e === "primary" ? "u-text-accent" : `u-text-${e}`;
}
function yn(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : e === "primary" ? "u-bg-accent-soft" : `u-bg-${e}-soft`;
}
function Ti(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function $r(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function Ii(e, t) {
  return e.color ? e.color : t === "method" ? Ti(e.method || e.text) : t === "status" ? $r(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function w(e) {
  const t = document.createElement("span"), n = e.kind || "chip", a = Ii(e, n), o = ["badge", e.size || "m"];
  return n === "status" && o.push("status"), n === "required" && o.push("required"), o.push(qr(a), yn(a)), e.className && o.push(e.className), t.className = o.join(" "), t.textContent = e.text, t;
}
function Et(e, t) {
  const n = t?.active ?? !1, a = t?.context ?? !1, r = document.createElement("button");
  return r.type = "button", r.className = `badge m interactive${n ? " is-active" : ""}`, a && (r.dataset.badgeContext = "true"), r.textContent = e, r;
}
function jr(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const a = $r(e), r = ["badge", "status", "m", "interactive", qr(a)];
  return t && r.push("is-active", yn(a)), n.className = r.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = a, n.textContent = e, n;
}
function Lt(e, t) {
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
  e.classList.add(yn(n));
}
function te(e) {
  const { simple: t, interactive: n, active: a, className: r, onClick: o } = e || {}, i = document.createElement("div"), s = ["card"];
  return t && s.push("simple"), n && s.push("interactive"), a && s.push("active"), r && s.push(r), i.className = s.join(" "), o && (i.classList.contains("interactive") || i.classList.add("interactive"), i.addEventListener("click", o)), i;
}
function Mt(...e) {
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
function Fn(e) {
  if (typeof e == "string" || typeof e == "number") {
    const t = document.createElement("span");
    return t.textContent = String(e), t;
  }
  return e;
}
function qi(e) {
  const t = document.createElement("div");
  if (t.className = `card-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append(Fn(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? w({ text: String(e.trailing), kind: "chip", size: "m" }) : Fn(e.trailing);
    t.append(n);
  }
  return t;
}
function $i(e) {
  return typeof e == "string" ? c("span", { textContent: e }) : e;
}
function Br(e) {
  return c("h2", { textContent: e });
}
function st(e, t) {
  const n = c("div", { className: "section-head" });
  return n.append(typeof e == "string" ? Br(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? w({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function _(e, ...t) {
  const n = c("div", { className: `block section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(st(e.title, e.badge)) : n.append(Br(e.title)));
  for (const a of t) n.append($i(a));
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
function Pt(e) {
  const { configured: t, variant: n = "tag", label: a, title: r } = e, o = a || r, i = t ? I.unlock : I.lock, s = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-meta-icon", l = n !== "endpoint" ? ` ${s}--${t ? "configured" : "required"}` : "";
  return c("span", {
    className: `${s}${l}`.trim(),
    innerHTML: i,
    ...o ? { "aria-label": o } : {}
  });
}
function Mr(e) {
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
let _e = null, en = null;
function Pr() {
  en?.(), en = null;
}
function Yt() {
  Pr(), _e && _e.close(), _e = null;
}
function ji(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function Bi(e) {
  return fn(e);
}
function dt(e) {
  requestAnimationFrame(() => e.focus());
}
function Gt(e, t) {
  const n = c("div", { className: "modal field" });
  return n.append(c("label", { className: "modal label", textContent: e }), t), n;
}
function nt(e) {
  return Ae({
    className: "modal input",
    placeholder: e.placeholder,
    value: e.value,
    ariaLabel: e.ariaLabel,
    type: e.type
  });
}
function Mi(e) {
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
function Pi(e) {
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
function Ri(e) {
  if (!e) return { username: "", password: "" };
  try {
    const n = Pi(e).split(":");
    return {
      username: n[0] || "",
      password: n.slice(1).join(":") || ""
    };
  } catch {
    return { username: "", password: "" };
  }
}
function Kt(e, t, n) {
  z(n);
  const a = k.get().auth.schemes[e] || "", r = t.type, o = (t.scheme || "").toLowerCase();
  if (r === "http" && o === "bearer") {
    const i = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = nt({
      placeholder: "Bearer token...",
      value: a,
      ariaLabel: "Bearer token",
      type: "password"
    }), u = le({
      variant: "icon",
      icon: I.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => k.setSchemeValue(e, l.value)), s.append(l, u), i.append(c("label", { className: "modal label", textContent: "Token" }), s), n.append(i), dt(l);
  } else if (r === "http" && o === "basic") {
    const i = Ri(a), s = nt({
      placeholder: "Username",
      value: i.username,
      ariaLabel: "Username"
    });
    n.append(Gt("Username", s));
    const l = nt({
      placeholder: "Password",
      value: i.password,
      ariaLabel: "Password",
      type: "password"
    });
    n.append(Gt("Password", l));
    const u = () => {
      const d = `${s.value}:${l.value}`, p = d === ":" ? "" : Mi(d);
      k.setSchemeValue(e, p);
    };
    s.addEventListener("input", u), l.addEventListener("input", u), dt(s);
  } else if (r === "apiKey") {
    const i = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = nt({
      placeholder: `${t.name || "API key"}...`,
      value: a,
      ariaLabel: "API key",
      type: "password"
    }), u = le({
      variant: "icon",
      icon: I.key,
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
    const i = nt({
      placeholder: "Token...",
      value: a,
      ariaLabel: "Token",
      type: "password"
    });
    i.addEventListener("input", () => {
      k.setSchemeValue(e, i.value);
    }), n.append(Gt("Token / Credential", i)), dt(i);
  }
}
function bn(e, t, n) {
  _e && Yt();
  const a = Object.entries(e);
  if (a.length === 0) return;
  const r = Mr({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Authentication Settings",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      Pr(), _e = null;
    }
  });
  _e = r;
  const o = r.modal, i = c("div", { className: "modal header" });
  i.append(c("h2", { className: "modal title", textContent: "Authentication" }));
  const s = le({ variant: "icon", icon: I.close, ariaLabel: "Close", onClick: Yt });
  i.append(s), o.append(i);
  const l = c("div", { className: "modal body" });
  let u = n || k.get().auth.activeScheme || a[0][0];
  e[u] || (u = a[0][0]);
  const d = c("div", { className: "modal fields" });
  if (a.length > 1) {
    const x = c("div", { className: "modal tabs" }), v = /* @__PURE__ */ new Map(), A = [], T = (y, L, C) => {
      const N = Rt(L);
      if (y.setAttribute("data-configured", N ? "true" : "false"), z(y), N) {
        const j = c("span", { className: "modal tab-check", "aria-hidden": "true" });
        j.innerHTML = I.check, y.append(j);
      }
      y.append(c("span", { className: "modal tab-label", textContent: Bi(C) }));
    };
    for (const [y, L] of a) {
      const C = c("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": y === u ? "true" : "false"
      });
      T(C, y, L), C.addEventListener("click", () => {
        if (u !== y) {
          u = y;
          for (const N of A) N.setAttribute("aria-pressed", "false");
          C.setAttribute("aria-pressed", "true"), m(), Kt(y, L, d);
        }
      }), v.set(y, C), A.push(C), x.append(C);
    }
    en = k.subscribe(() => {
      for (const [y, L] of a) {
        const C = v.get(y);
        C && T(C, y, L);
      }
    }), l.append(x);
  }
  const p = c("div", { className: "modal scheme-desc" });
  function m() {
    const x = e[u];
    if (!x) return;
    z(p);
    const v = c("div", { className: "modal scheme-title", textContent: ji(x) });
    p.append(v), x.description && p.append(c("div", { className: "modal scheme-text", textContent: x.description }));
  }
  m(), l.append(p);
  const f = e[u];
  f && Kt(u, f, d), l.append(d), o.append(l);
  const h = c("div", { className: "modal footer" }), g = le({
    variant: "ghost",
    label: "Reset",
    onClick: () => {
      k.setSchemeValue(u, "");
      const x = e[u];
      x && Kt(u, x, d);
    }
  }), b = le({ variant: "primary", label: "Done", onClick: Yt });
  h.append(g, c("div", { className: "grow" }), b), o.append(h), r.mount(t ?? document.querySelector(".root") ?? document.body);
}
function Rt(e) {
  return !!k.get().auth.schemes[e];
}
function Ht(e, t) {
  const n = ct(e, t), a = k.get().auth, r = jt(n, a.schemes, a.activeScheme, a.token);
  return Object.keys(r.headers).length > 0 || Object.keys(r.query).length > 0 || Object.keys(r.cookies).length > 0;
}
function xn(e, t) {
  const n = ct(e, t), a = k.get().auth;
  return jt(n, a.schemes, a.activeScheme, a.token).headers;
}
function Hi(e, t) {
  const n = ct(e, t), a = k.get().auth;
  return jt(n, a.schemes, a.activeScheme, a.token).query;
}
function Fi(e, t) {
  const n = ct(e, t), a = k.get().auth;
  return jt(n, a.schemes, a.activeScheme, a.token).cookies;
}
function kn(e, t) {
  const n = ct(e, t);
  return fa(n);
}
function ct(e, t) {
  if (e)
    return Array.isArray(e) ? pn(e, t, !1) : e;
}
let se = -1, Ot = null, Oe = null;
function Rr() {
  Tt();
  const e = Mr({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      Ot = null, k.set({ searchOpen: !1 });
    }
  });
  Ot = e;
  const t = e.modal, n = c("div", { className: "search-input-wrap" });
  n.innerHTML = I.search;
  const a = Ae({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), r = c("kbd", { textContent: "ESC", className: "kbd" });
  n.append(a, r), t.append(n);
  const o = c("div", { className: "search-results", role: "listbox" }), i = c("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  o.append(i), t.append(o);
  const s = c("div", { className: "search-footer" });
  s.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(s), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => a.focus()), se = -1;
  let l = [];
  a.addEventListener("input", () => {
    const u = a.value;
    l = yi(u), _i(o, l), vt(o, l.length > 0 ? 0 : -1);
  }), a.addEventListener("keydown", (u) => {
    const d = u;
    d.key === "ArrowDown" ? (d.preventDefault(), l.length > 0 && vt(o, Math.min(se + 1, l.length - 1))) : d.key === "ArrowUp" ? (d.preventDefault(), l.length > 0 && vt(o, Math.max(se - 1, 0))) : d.key === "Enter" ? (d.preventDefault(), se >= 0 && se < l.length && Hr(l[se])) : d.key === "Escape" && (d.preventDefault(), Tt());
  });
}
function Tt() {
  if (Ot) {
    Ot.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), k.set({ searchOpen: !1 });
}
function _i(e, t) {
  if (z(e), t.length === 0) {
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
    a.method ? o.append(w({
      text: a.method.toUpperCase(),
      kind: "method",
      method: a.method
    })) : a.type === "schema" ? o.append(w({ text: "SCH", kind: "chip", size: "m" })) : a.type === "tag" && o.append(w({ text: "TAG", kind: "chip", size: "m" }));
    const i = c("div", { className: "search-result-info min-w-0" });
    if (i.append(c("span", { className: "search-result-title", textContent: a.title })), a.subtitle && i.append(c("span", { className: "search-result-subtitle", textContent: a.subtitle })), o.append(i), a.method && a.requiresAuth && a.resolvedSecurity) {
      const s = k.get().spec, l = Ht(a.resolvedSecurity, s?.securitySchemes || {});
      o.append(c("span", {
        className: `search-result-lock search-result-lock--${l ? "configured" : "required"}`,
        innerHTML: l ? I.unlock : I.lock,
        "aria-label": a.authTitle || "Requires authentication"
      }));
    }
    o.addEventListener("click", () => Hr(a)), o.addEventListener("mouseenter", () => {
      vt(e, r);
    }), n.append(o);
  }), e.append(n);
}
function vt(e, t) {
  if (se === t) return;
  if (se >= 0) {
    const a = e.querySelector(`.search-result[data-index="${se}"]`);
    a && (a.classList.remove("focused"), a.setAttribute("aria-selected", "false"));
  }
  if (se = t, t < 0) return;
  const n = e.querySelector(`.search-result[data-index="${t}"]`);
  n && (n.classList.add("focused"), n.setAttribute("aria-selected", "true"), n.scrollIntoView({ block: "nearest" }));
}
function Hr(e) {
  Tt(), e.type === "operation" ? P(R({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? P(R({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? P(R({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && P(R({ type: "webhook", webhookName: e.webhookName }));
}
function Di() {
  return Oe && document.removeEventListener("keydown", Oe), Oe = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), k.get().searchOpen ? Tt() : (k.set({ searchOpen: !0 }), Rr()));
  }, document.addEventListener("keydown", Oe), () => {
    Oe && (document.removeEventListener("keydown", Oe), Oe = null);
  };
}
function Ui(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let a = null;
  for (const s of n) {
    const l = s, u = Ji(l), d = l.getAttribute("href");
    if (!d && !u) continue;
    const p = d?.startsWith("#") ? d.slice(1) : d || "", m = u || ir(p), f = Ye(m, t);
    s.classList.toggle("active", f), f ? (l.setAttribute("aria-current", "page"), a = l) : l.removeAttribute("aria-current");
  }
  const r = a ? a.closest(".nav-group") : null;
  if (r) {
    const s = r.querySelector(".nav-group-header"), l = r.querySelector(".nav-group-items");
    s instanceof HTMLElement && l instanceof HTMLElement && ke(s, l, !0, { animate: !1 });
  }
  const o = t.type === "endpoint" || t.type === "tag" ? t.tag : null, i = t.type === "schema" ? "schemas" : t.type === "webhook" ? "webhooks" : o ? X(o) : null;
  if (i) {
    const s = e.querySelector(`[data-nav-tag="${CSS.escape(i)}"]`);
    if (s) {
      const l = s.querySelector(".nav-group-header"), u = s.querySelector(".nav-group-items");
      l instanceof HTMLElement && u instanceof HTMLElement && ke(l, u, !0, { animate: !1 });
    }
  }
  a && requestAnimationFrame(() => {
    const l = a.closest(".nav-group")?.querySelector(".nav-group-header");
    l ? l.scrollIntoView({ block: "start", behavior: "smooth" }) : a.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function zi(e) {
  const t = k.get(), n = t.spec;
  if (!n) return;
  const a = n.securitySchemes || {}, r = e.querySelector("[data-sidebar-auth-btn]");
  if (r) {
    const l = Object.keys(a), u = t.auth.activeScheme || l[0] || "", d = Rt(u);
    r.innerHTML = d ? I.unlock : I.lock, r.classList.toggle("active", d);
  }
  const o = e.querySelectorAll("[data-lock-slot]"), i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of n.operations)
    l.operationId && i.set(l.operationId, l), s.set(`${l.method.toLowerCase()} ${l.path}`, l);
  for (const l of o) {
    const u = l.closest(".nav-item");
    if (!u) continue;
    const d = u.dataset.routeOperationId, p = u.dataset.routeMethod, m = u.dataset.routePath, f = d && i.get(d) || (p && m ? s.get(`${p.toLowerCase()} ${m}`) : null);
    if (!f) continue;
    const h = Ht(f.resolvedSecurity, a), g = Pt({
      configured: h,
      variant: "nav",
      title: De(f.resolvedSecurity)
    });
    l.innerHTML = "", l.append(g);
  }
}
function Wi(e, t) {
  const n = k.get(), a = n.spec;
  if (!a) return;
  z(e);
  const r = t.title || a.info.title || "API Docs", o = a.info.version ? `v${a.info.version}` : "", i = c("div", { className: "top" }), s = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  s.innerHTML = I.chevronLeft, s.addEventListener("click", () => k.set({ sidebarOpen: !1 }));
  const l = c("a", { className: "title", href: "/", textContent: r });
  l.addEventListener("click", (y) => {
    y.preventDefault(), P("/");
  });
  const u = c("div", { className: "title-wrap" });
  if (u.append(l), o && u.append(c("span", { className: "version", textContent: o })), i.append(s, u), a.securitySchemes && Object.keys(a.securitySchemes).length > 0) {
    const y = Object.keys(a.securitySchemes), L = n.auth.activeScheme || y[0] || "", C = Rt(L), N = c("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication",
      "data-sidebar-auth-btn": ""
    });
    N.innerHTML = C ? I.unlock : I.lock, N.classList.toggle("active", C), N.addEventListener("click", () => {
      const O = k.get().auth.activeScheme || y[0] || "";
      bn(
        a.securitySchemes,
        e.closest(".root") ?? void 0,
        O
      );
    }), i.append(N);
  }
  const d = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (d.innerHTML = k.get().theme === "light" ? I.moon : I.sun, d.addEventListener("click", () => {
    bi(), d.innerHTML = k.get().theme === "light" ? I.moon : I.sun;
  }), e.append(i), n.environments.length > 1) {
    const y = Xi(n);
    e.append(y);
  }
  const p = c("div", { className: "search" }), m = c("span", { className: "search-icon", innerHTML: I.search }), f = Ae({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), h = c("span", { className: "kbd", textContent: "⌘K" });
  f.addEventListener("focus", () => {
    k.set({ searchOpen: !0 }), f.blur(), Rr();
  }), p.append(m, f, h), e.append(p);
  const g = c("nav", { className: "nav", "aria-label": "API navigation" }), b = Gi({ type: "overview" }, n.route);
  g.append(b);
  for (const y of a.tags) {
    if (y.operations.length === 0) continue;
    const L = Vi(y, n.route);
    g.append(L);
  }
  if (a.webhooks && a.webhooks.length > 0) {
    const y = c("div", { className: "nav-group", "data-nav-tag": "webhooks" }), L = { type: "webhook" }, C = _n("Webhooks", a.webhooks.length, L, n.route), N = c("div", { className: "nav-group-items" });
    for (const O of a.webhooks) {
      const D = { type: "webhook", webhookName: O.name }, K = Un(O.summary || O.name, O.method, D, n.route);
      K.classList.add("nav-item-webhook"), N.append(K);
    }
    C.addEventListener("click", (O) => {
      O.target.closest(".nav-group-link") || ke(C, N);
    });
    const j = n.route.type === "webhook";
    ke(C, N, j, { animate: !1 }), y.append(C, N), g.append(y);
  }
  const x = Object.keys(a.schemas);
  if (x.length > 0) {
    const y = c("div", { className: "nav-group" }), L = { type: "schema" }, C = _n("Schemas", x.length, L, n.route), N = c("div", { className: "nav-group-items" });
    for (const O of x) {
      const K = Un(O, void 0, { type: "schema", schemaName: O }, n.route);
      N.append(K);
    }
    C.addEventListener("click", (O) => {
      O.target.closest(".nav-group-link") || ke(C, N);
    });
    const j = n.route.type === "schema";
    ke(C, N, j, { animate: !1 }), y.setAttribute("data-nav-tag", "schemas"), y.append(C, N), g.append(y);
  }
  e.append(g);
  for (const y of g.querySelectorAll(".nav-group-items:not(.collapsed)"))
    yt(y);
  const v = c("div", { className: "footer" }), A = c("button", {
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
  const T = c("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  T.textContent = `puredocs.dev${o ? ` ${o}` : ""}`, v.append(A, T), v.append(d), e.append(v), requestAnimationFrame(() => {
    const y = g.querySelector(".nav-item.active");
    if (y) {
      const C = y.closest(".nav-group")?.querySelector(".nav-group-header");
      C ? C.scrollIntoView({ block: "start", behavior: "smooth" }) : y.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function Vi(e, t, n) {
  const a = c("div", { className: "nav-group", "data-nav-tag": X(e.name) }), r = Yi(e, t), o = c("div", { className: "nav-group-items" }), i = X(e.name), s = t.type === "tag" && X(t.tag || "") === i || e.operations.some((l) => Ye(tn(l, e.name), t));
  for (const l of e.operations) {
    const u = tn(l, e.name), d = Ki(l, u, t);
    o.append(d);
  }
  return r.addEventListener("click", (l) => {
    l.target.closest(".nav-group-link") || ke(r, o);
  }), ke(r, o, s, { animate: !1 }), a.append(r, o), a;
}
function Yi(e, t) {
  const n = X(e.name), a = t.type === "tag" && X(t.tag || "") === n || e.operations.some((s) => Ye(tn(s, e.name), t)), r = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(a), tabIndex: 0 }), o = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": a ? "Collapse" : "Expand"
  });
  o.innerHTML = I.chevronRight, o.addEventListener("click", (s) => {
    s.preventDefault(), s.stopPropagation(), r.click();
  });
  const i = c("a", {
    className: "nav-group-link",
    href: R({ type: "tag", tag: e.name })
  });
  return i.append(
    c("span", { className: "nav-group-title", textContent: e.name }),
    c("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), i.addEventListener("click", (s) => {
    s.preventDefault(), P(R({ type: "tag", tag: e.name }));
  }), r.append(o, i), r.addEventListener("keydown", (s) => {
    (s.key === "Enter" || s.key === " ") && (s.preventDefault(), o.click());
  }), r;
}
function _n(e, t, n, a) {
  const r = a.type === n.type, o = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(r), tabIndex: 0 }), i = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": r ? "Collapse" : "Expand"
  });
  i.innerHTML = I.chevronRight, i.addEventListener("click", (l) => {
    l.preventDefault(), l.stopPropagation(), o.click();
  });
  const s = c("a", {
    className: "nav-group-link",
    href: R(n)
  });
  return s.append(
    c("span", { className: "nav-group-title", textContent: e }),
    c("span", { className: "nav-group-count", textContent: String(t) })
  ), s.addEventListener("click", (l) => {
    l.preventDefault(), P(R(n));
  }), o.append(i, s), o.addEventListener("keydown", (l) => {
    (l.key === "Enter" || l.key === " ") && (l.preventDefault(), i.click());
  }), o;
}
function ke(e, t, n = !e.classList.contains("expanded"), a = {}) {
  if (!(a.animate !== !1)) {
    e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), Dn(e, n), t.classList.toggle("collapsed", !n), yt(t);
    return;
  }
  n ? (t.classList.remove("collapsed"), yt(t)) : (yt(t), t.offsetHeight, t.classList.add("collapsed")), e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), Dn(e, n);
}
function yt(e) {
  e.style.setProperty("--nav-group-max-height", `${e.scrollHeight}px`);
}
function Dn(e, t) {
  const n = e.querySelector(".nav-group-chevron");
  n instanceof HTMLElement && n.setAttribute("aria-label", t ? "Collapse" : "Expand");
}
function Un(e, t, n, a) {
  const r = Ye(n, a), o = c("a", {
    className: `nav-item${r ? " active" : ""}`,
    href: R(n),
    role: "link",
    "aria-current": r ? "page" : void 0
  }), i = w(t ? {
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
    s.preventDefault(), P(R(n));
  }), o;
}
function Gi(e, t) {
  const n = Ye(e, t), a = c("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: R(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), r = c("span", { className: "nav-overview-icon-slot" });
  r.innerHTML = I.globe;
  const o = c("span", { className: "nav-item-label", textContent: "Overview" });
  return a.append(r, o), a.addEventListener("click", (i) => {
    i.preventDefault(), P(R(e));
  }), a;
}
function Ki(e, t, n) {
  const a = Ye(t, n), r = c("a", {
    className: `nav-item${a ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: R(t),
    "aria-current": a ? "page" : void 0
  });
  r.dataset.routeType = "endpoint", t.operationId && (r.dataset.routeOperationId = t.operationId), t.method && (r.dataset.routeMethod = t.method), t.path && (r.dataset.routePath = t.path), t.tag && (r.dataset.routeTag = t.tag);
  const o = k.get().spec, i = W(e.resolvedSecurity), s = i ? Pt({
    configured: Ht(e.resolvedSecurity, o?.securitySchemes || {}),
    variant: "nav",
    title: De(e.resolvedSecurity)
  }) : null, l = i ? c("span", { "data-lock-slot": "" }) : null;
  return l && s && l.append(s), r.append(
    w({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    c("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...l ? [l] : []
  ), r.addEventListener("click", (u) => {
    u.preventDefault(), P(R(t));
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
function Ye(e, t) {
  if (e.type !== t.type) return !1;
  if (e.type === "overview") return !0;
  if (e.type === "tag") return X(e.tag || "") === X(t.tag || "");
  if (e.type === "endpoint") {
    if (e.operationId && t.operationId) return e.operationId === t.operationId;
    const n = (e.method || "").toLowerCase(), a = (t.method || "").toLowerCase();
    return n === a && zn(e.path) === zn(t.path);
  }
  return e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function zn(e) {
  return e && e.replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
}
function Ji(e) {
  const { routeType: t } = e.dataset;
  return t && t === "endpoint" ? {
    type: "endpoint",
    operationId: e.dataset.routeOperationId || void 0,
    method: e.dataset.routeMethod || void 0,
    path: e.dataset.routePath || void 0,
    tag: e.dataset.routeTag || void 0
  } : null;
}
function Zi(e) {
  const t = e.querySelector("select.env");
  if (t) {
    const n = k.get().activeEnvironment;
    t.value !== n && (t.value = n);
  }
}
function Xi(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((r) => {
    const o = t.find((s) => s.name === r.name), i = Se((o?.baseUrl ?? r.baseUrl) || "");
    return { value: r.name, label: i || "(no URL)" };
  });
  return At({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (r) => k.setActiveEnvironment(r),
    className: "env"
  });
}
function Ft(e, t, n = "No operations") {
  const a = c("div", { className: "summary-line" });
  for (const o of e)
    a.append(w({
      text: `${o.value} ${o.label}`,
      kind: "chip",
      size: "m"
    }));
  const r = ["get", "post", "put", "patch", "delete", "head", "options"];
  for (const o of r) {
    const i = t[o] || 0;
    i !== 0 && a.append(w({
      kind: "method",
      method: o,
      size: "m",
      text: `${i} ${o.toUpperCase()}`
    }));
  }
  return a.childNodes.length || a.append(w({
    text: n,
    kind: "chip",
    size: "m"
  })), a;
}
function Qi(e, t) {
  const n = [], a = es(e, t);
  return a && n.push(a), n;
}
function es(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = _({ title: "Authentication" });
  for (const [a, r] of Object.entries(e)) {
    const o = Rt(a), i = te({ className: "card-group card-auth" }), s = c("div", { className: "card-auth-main" }), l = c("div", { className: "card-info card-auth-info" }), u = `${r.type}${r.scheme ? ` / ${r.scheme}` : ""}`;
    l.append(
      c("h3", { textContent: a }),
      c("p", { className: "card-auth-type", textContent: u })
    ), r.description && l.append(c("p", { className: "card-auth-desc", textContent: String(r.description) }));
    const d = le({
      variant: "secondary",
      icon: o ? I.check : I.settings,
      label: o ? "Success" : "Set",
      className: `card-auth-config${o ? " active is-configured" : ""}`,
      onClick: (p) => {
        p.stopPropagation(), bn(e, t, a);
      }
    });
    s.append(l), i.append(s, d), n.append(i);
  }
  return n;
}
async function Wn(e, t) {
  z(e);
  const n = k.get().spec;
  if (!n) return;
  const a = c("div", { className: "block header" }), r = c("div", { className: "title" });
  r.append(
    c("h1", { textContent: n.info.title }),
    c("span", { className: "version", textContent: `v${n.info.version}` })
  ), a.append(r), n.info.description && a.append(c("p", { textContent: n.info.description })), e.append(a);
  const o = n.operations.filter((d) => W(d.resolvedSecurity)).length, i = n.operations.filter((d) => d.deprecated).length, s = ns(n.operations);
  if (e.append(_(
    { className: "summary" },
    Ft(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: o },
        { label: "Deprecated", value: i }
      ],
      s,
      "No operations"
    )
  )), n.servers.length > 0) {
    const d = _({ title: "Servers" }), p = k.get(), m = p.initialEnvironments || p.environments, f = [];
    for (const g of n.servers) {
      const x = m.find((N) => N.baseUrl === g.url)?.name || "", v = x === p.activeEnvironment, A = te({
        interactive: !0,
        active: v,
        className: "card-group",
        onClick: () => {
          const N = k.get(), O = (N.initialEnvironments || N.environments).find((D) => D.baseUrl === g.url);
          O && O.name !== N.activeEnvironment && k.setActiveEnvironment(O.name);
        }
      }), T = c("div", { className: "card-info" }), y = c("div", { className: "inline-cluster inline-cluster-sm" }), L = c("span", { className: "icon-muted" });
      L.innerHTML = I.server, y.append(L, c("code", { textContent: g.url })), T.append(y), g.description && T.append(c("p", { textContent: g.description }));
      const C = c("div", { className: "card-badges" });
      A.append(T, C), d.append(A), f.push({ el: A, envName: x });
    }
    const h = (g) => {
      for (const { el: b, envName: x } of f)
        b.classList.toggle("active", x === g.activeEnvironment);
    };
    je().on("overview:servers", h), e.append(d);
  }
  const l = e.closest(".root") ?? void 0, u = Qi(n.securitySchemes || {}, l);
  for (const d of u)
    e.append(d);
  if (n.tags.length > 0) {
    const d = _({ title: "API Groups" });
    for (const p of n.tags)
      p.operations.length !== 0 && d.append(ts(p));
    e.append(d);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const d = _({ title: "Webhooks" });
    for (const p of n.webhooks) {
      const m = te({
        interactive: !0,
        className: "card-group",
        onClick: () => P(R({ type: "webhook", webhookName: p.name }))
      }), f = c("div", { className: "card-badges" });
      f.append(
        w({ text: "WH", kind: "webhook", size: "s" }),
        w({ text: p.method.toUpperCase(), kind: "method", method: p.method, size: "s" })
      );
      const h = c("div", { className: "card-group-top" });
      h.append(c("h3", { className: "card-group-title", textContent: p.summary || p.name }), f);
      const g = c("p", {
        className: "card-group-description",
        textContent: p.description || `${p.method.toUpperCase()} webhook`
      });
      m.append(h, g), d.append(m);
    }
    e.append(d);
  }
}
function ts(e) {
  const t = te({
    interactive: !0,
    className: "card-group",
    onClick: () => P(R({ type: "tag", tag: e.name }))
  }), n = rs(e), a = c("div", { className: "card-badges" });
  for (const [i, s] of Object.entries(n)) {
    const l = w({
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
function ns(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function rs(e) {
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
function as(e) {
  const t = c("div", { className: "schema" }), n = c("div", { className: "body" });
  t.append(n);
  const a = [];
  Fr(n, e, "", 0, /* @__PURE__ */ new Set(), a);
  const r = a.length > 0, o = () => a.some(({ children: s }) => s.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const s = !o();
    Ur(a, s);
  }, isExpanded: o, hasExpandable: r };
}
function nn(e, t) {
  const n = te(), a = Ge(e), r = We(), o = c("div", { className: "schema" }), i = c("div", { className: "body" });
  o.append(i);
  const s = [];
  if (Fr(i, e, "", 0, /* @__PURE__ */ new Set(), s), r.append(o), t) {
    const l = Mt(), u = typeof t == "string" ? c("h3", { textContent: t }) : t, d = s.length > 0, p = d && s.some(({ children: h }) => h.style.display !== "none"), m = w({ text: a, kind: "chip", color: "primary", size: "m" }), f = d ? c("button", {
      className: p ? "schema-collapse-btn is-expanded" : "schema-collapse-btn",
      type: "button",
      "aria-label": p ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (f && (f.innerHTML = I.chevronDown, f.addEventListener("click", (h) => {
      h.stopPropagation();
      const g = !f.classList.contains("is-expanded");
      Ur(s, g), f.classList.toggle("is-expanded", g), f.setAttribute("aria-label", g ? "Collapse all fields" : "Expand all fields");
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
function os(e, t) {
  const { headerTitle: n, withEnumAndDefault: a = !0 } = t, r = e.map((u) => {
    const d = c("div", { className: "schema-row role-flat role-params" }), p = c("div", { className: "schema-main-row" }), m = c("div", { className: "schema-name-wrapper" });
    m.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: u.name })
    );
    const f = c("div", { className: "schema-meta-wrapper" });
    f.append(w({
      text: u.schema ? Ge(u.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), u.required && f.append(w({ text: "required", kind: "required", size: "m" })), p.append(m, f), d.append(p);
    const h = c("div", { className: "schema-desc-col is-root" });
    u.description && h.append(c("p", { textContent: u.description }));
    const g = u.schema?.enum, b = u.schema?.default !== void 0;
    if (a && (g && g.length > 0 || b)) {
      const x = c("div", { className: "schema-enum-values" });
      if (b && x.append(w({
        text: `Default: ${JSON.stringify(u.schema.default)}`,
        kind: "chip",
        size: "s"
      })), g)
        for (const v of g) {
          const A = String(v);
          A !== u.in && x.append(w({ text: A, kind: "chip", size: "s" }));
        }
      h.append(x);
    }
    return h.children.length > 0 && d.append(h), d;
  }), o = te(), i = We(), s = c("div", { className: "params" }), l = c("div", { className: "body role-params" });
  return l.append(...r), s.append(l), i.append(s), o.append(
    Mt(qi({ title: n })),
    i
  ), o;
}
function pt(e, t, n, a, r, o, i) {
  const s = Ge(n), l = is(n), u = Dr(t, s, n, a, l, r);
  if (e.append(u), l) {
    const d = c("div", { className: "schema-children" });
    d.style.display = "block";
    const p = new Set(o);
    p.add(n), _r(d, n, a + 1, p, i), e.append(d), i?.push({ row: u, children: d }), u.querySelector(".schema-toggle")?.classList.add("is-expanded"), u.classList.add("focus-ring"), u.setAttribute("aria-expanded", "true"), u.setAttribute("tabindex", "0"), u.addEventListener("click", () => {
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
function Fr(e, t, n, a, r, o) {
  if (r.has(t)) {
    e.append(Dr("[circular]", "circular", { description: "" }, a, !1, !1));
    return;
  }
  {
    const i = new Set(r);
    i.add(t), _r(e, t, a, i, o);
    return;
  }
}
function _r(e, t, n, a, r) {
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
function Dr(e, t, n, a, r, o) {
  const i = [
    "schema-row",
    a === 0 ? "is-root" : "",
    a === 0 && !r ? "is-leaf" : ""
  ].filter(Boolean).join(" "), s = c("div", { className: i, role: r ? "button" : void 0 });
  s.setAttribute("data-depth", String(a)), s.style.setProperty("--schema-depth", String(a));
  const l = c("div", { className: "schema-main-row" }), u = c("div", { className: "schema-name-wrapper" });
  r ? u.append(c("span", { className: "schema-toggle", innerHTML: I.chevronRight })) : u.append(c("span", { className: "schema-spacer" })), u.append(c("span", { textContent: e })), l.append(u);
  const d = c("div", { className: "schema-meta-wrapper" });
  d.append(w({ text: t, kind: "chip", color: "primary", size: "m" })), o && d.append(w({ text: "required", kind: "required", size: "m" })), l.append(d), s.append(l);
  const p = c("div", { className: `schema-desc-col${a === 0 ? " is-root" : ""}` });
  n.description && p.append(c("p", { textContent: String(n.description) }));
  const m = n.enum, f = Array.isArray(m) && m.length > 0, h = n.default, g = h !== void 0, b = f && g ? m.some((v) => Jt(v, h)) : !1, x = ss(n, !f || !g);
  if (x.length > 0 || f) {
    const v = c("div", { className: "schema-constraints-row" });
    for (const A of x)
      v.append(w({
        text: A,
        kind: "chip",
        size: "s"
      }));
    if (f) {
      const A = g && b ? [h, ...m.filter((T) => !Jt(T, h))] : m;
      g && !b && v.append(w({
        text: `default: ${bt(h)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value is-default"
      }));
      for (const T of A) {
        const y = g && Jt(T, h);
        v.append(w({
          text: y ? `default: ${bt(T)}` : bt(T),
          kind: "chip",
          size: "s",
          className: y ? "schema-enum-value is-default" : "schema-enum-value"
        }));
      }
    }
    p.append(v);
  }
  return p.children.length > 0 && s.append(p), s;
}
function is(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function ss(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${bt(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function Ur(e, t) {
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
function Jt(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function cs(e) {
  const { method: t, url: n, headers: a = {}, body: r, timeout: o = 3e4 } = e, i = new AbortController(), s = setTimeout(() => i.abort(), o), l = performance.now();
  try {
    const u = typeof FormData < "u" && r instanceof FormData, d = {
      method: t.toUpperCase(),
      headers: u ? void 0 : a,
      signal: i.signal,
      credentials: "include"
    };
    if (u) {
      const b = {};
      for (const [x, v] of Object.entries(a))
        x.toLowerCase() !== "content-type" && (b[x] = v);
      Object.keys(b).length > 0 && (d.headers = b);
    }
    r && !["GET", "HEAD"].includes(t.toUpperCase()) && (d.body = r);
    const p = await fetch(n, d), m = performance.now() - l, f = await p.text(), h = new TextEncoder().encode(f).length, g = {};
    return p.headers.forEach((b, x) => {
      g[x.toLowerCase()] = b;
    }), ls(f, g), {
      status: p.status,
      statusText: p.statusText,
      headers: g,
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
function ls(e, t) {
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
function us(e, t, n, a) {
  let r = t;
  for (const [u, d] of Object.entries(n))
    r = r.replace(`{${u}}`, encodeURIComponent(d));
  const i = e.replace(/\/+$/, "") + r, s = new URLSearchParams();
  for (const [u, d] of Object.entries(a))
    d && s.set(u, d);
  const l = s.toString();
  return l ? `${i}?${l}` : i;
}
function Zt(e) {
  return [
    { language: "curl", label: "cURL", code: ds(e) },
    { language: "javascript", label: "JavaScript", code: ps(e) },
    { language: "python", label: "Python", code: fs(e) },
    { language: "go", label: "Go", code: ms(e) },
    { language: "rust", label: "Rust", code: hs(e) }
  ];
}
function ds({ method: e, url: t, headers: n, body: a }) {
  const r = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [o, i] of Object.entries(n))
    r.push(`  -H '${o}: ${i}'`);
  return a && r.push(`  -d '${a}'`), r.join(` \\
`);
}
function ps({ method: e, url: t, headers: n, body: a }) {
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
function fs({ method: e, url: t, headers: n, body: a }) {
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
function ms({ method: e, url: t, headers: n, body: a }) {
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
function hs({ method: e, url: t, headers: n, body: a }) {
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
function gs(e) {
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
function zr(e) {
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
    const n = Te(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function vs(e) {
  const t = [e.summary, e.description].filter(Boolean);
  return [...new Set(t)].join(" — ") || e.name;
}
function Vn(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
const Wr = [
  [/"(?:[^"\\]|\\.)*"(?=\s*:)/g, "property"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/\b(?:true|false|null)\b/g, "literal"],
  [/[{}[\]:,]/g, "punctuation"]
], Yn = [
  [/#.*/g, "comment"],
  [/"(?:[^"\\]|\\.)*"|'[^']*'/g, "string"],
  [/\$\w+|\$\{[^}]+\}/g, "sign"],
  [/--?\w[\w-]*/g, "sign"],
  [/\b(?:curl|wget|echo|export|if|then|else|fi|for|do|done|while|case|esac|function|return|local|set|unset|source|cd|ls|cat|grep|sed|awk|chmod|mkdir|rm|cp|mv|sudo|apt|brew|npm|pip|docker|http|https)\b/g, "keyword"],
  [/-?\b\d+(?:\.\d+)?\b/g, "number"]
], ys = [
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
], Gn = [
  [/#.*/g, "comment"],
  [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, "keyword"],
  [/\b(?:True|False|None)\b/g, "literal"],
  [/@\w+/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]():.,;]/g, "punctuation"]
], Kn = [
  [/\/\/.*/g, "comment"],
  [/\/\*[\s\S]*?\*\//g, "comment"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|type|unsafe|use|where|while|yield)\b/g, "keyword"],
  [/\b(?:true|false|None|Some|Ok|Err)\b/g, "literal"],
  [/\b(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Box|Option|Result|HashMap|HashSet|Rc|Arc|Mutex|Cell|RefCell)\b/g, "sign"],
  [/\b(?:println!|print!|format!|vec!|panic!|assert!|assert_eq!|assert_ne!|todo!|unimplemented!|unreachable!|eprintln!|eprint!|write!|writeln!)/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]();:.,]/g, "punctuation"]
], bs = {
  json: Wr,
  javascript: ft,
  js: ft,
  typescript: ft,
  ts: ft,
  bash: Yn,
  curl: Yn,
  go: ys,
  python: Gn,
  py: Gn,
  rust: Kn,
  rs: Kn
};
function xs(e, t) {
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
function Vr(e, t) {
  const n = bs[t] ?? (Or(e) ? Wr : null);
  return n ? xs(e, n) : gt(e);
}
function ks(e, t) {
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
    return Jn(a, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const a = parseFloat(e);
    return Jn(a, n);
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
function Jn(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function Cs(e, t, n, a) {
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
function ws(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((r) => {
    const o = r.getAttribute("data-param-name"), i = t.parameters.find((l) => l.name === o);
    if (!i) return;
    const s = ks(r.value, i);
    s.valid || n.push({ field: o, message: s.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const o = Object.keys(t.requestBody.content || {})[0] || "application/json", i = t.requestBody.content?.[o]?.schema, l = e.querySelector('[data-field="body"]')?.value || "";
    if (!o.includes("multipart")) {
      const u = Cs(l, o, i, t.requestBody.required);
      u.valid || n.push({ field: "body", message: u.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function Ns(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function Ss(e, t) {
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
function Yr(e) {
  return c("span", { className: "validation-error", "data-error-for": e });
}
function Zn(e) {
  e.style.height = "0", e.style.height = `${e.scrollHeight}px`;
}
function Xn(e, t, n) {
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
    o.innerHTML = Vr(d, u);
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
const As = 1500;
function ue(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", a = le({
    variant: "icon",
    icon: I.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const r = await e.getText();
      await ki(r), a.innerHTML = I.check, a.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        a.innerHTML = I.copy, a.setAttribute("aria-label", t);
      }, As);
    }
  });
  return a;
}
function Es(e, t, n, a) {
  z(t), t.classList.add("try-it");
  const r = c("div", { className: "body" }), o = c("div", { className: "block section" });
  o.append(c("h2", { textContent: "Response" }));
  const i = c("div", { "data-response": "true" });
  if (n)
    Xt(i, {
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
  o.append(i), r.append(Ls(e, t, {
    onConfigChange: a?.onConfigChange,
    onSendRequest: async (s) => {
      Ns(t);
      const l = ws(t, e);
      if (l.length > 0) {
        Ss(t, l);
        return;
      }
      const u = xe(t, e);
      s.setAttribute("disabled", ""), s.innerHTML = "", s.append(c("span", { className: "spinner spinner-sm" }), c("span", null, "Sending..."));
      try {
        const d = await cs(u);
        Xt(i, d);
      } catch (d) {
        Xt(i, {
          status: 0,
          headers: {},
          body: d.message,
          duration: 0,
          size: 0
        });
      } finally {
        s.removeAttribute("disabled"), s.innerHTML = I.send, s.append(c("span", null, "Send Request"));
      }
    }
  })), r.append(o), t.append(r);
}
function Ls(e, t, n) {
  const a = n?.onConfigChange, r = e.parameters.filter((E) => E.in === "path"), o = e.parameters.filter((E) => E.in === "query"), i = gs([...r, ...o]);
  let s = [];
  if (e.requestBody) {
    const E = Object.keys(e.requestBody.content || {})[0] || "application/json";
    if (!E.includes("multipart")) {
      const $ = e.requestBody.content?.[E];
      $ && (s = zr($));
    }
  }
  let l = null;
  const u = "Request", d = Zt({
    method: e.method,
    url: "",
    // will be updated
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), p = () => {
    const E = xe(t, e);
    let $;
    return typeof E.body == "string" ? $ = E.body : E.body instanceof FormData ? $ = "{ /* multipart form-data */ }" : e.requestBody && ($ = "{ ... }"), {
      method: E.method,
      url: E.url,
      headers: E.headers || {},
      body: $
    };
  }, m = () => {
    const E = xe(t, e);
    if (typeof E.body == "string") return E.body;
    if (E.body instanceof FormData) {
      const $ = [];
      return E.body.forEach((ne, ye) => {
        if (ne instanceof File) {
          $.push(`${ye}: [File ${ne.name}]`);
          return;
        }
        $.push(`${ye}: ${String(ne)}`);
      }), $.join(`
`);
    }
    return "";
  }, f = (E, $) => {
    const ne = p(), ye = Zt(ne), Ee = ye[$] || ye[0];
    Ee && E.setValue(Ee.code, Ee.language);
  }, h = c("div", { className: "block section tabs-code" }), g = c("div", { className: "body" }), b = c("h2", { textContent: "Request" });
  h.append(b, g);
  const x = k.get(), v = c("div", { className: "card" }), A = c("div", { className: "card-head" }), T = c("div", { className: "tabs tabs-code" }), y = [];
  let L = 0, C = null, N = null, j = null, O = null;
  {
    const E = Et(u, { active: !0, context: !0 });
    y.push(E), O = c("div", { className: "panel is-request", "data-tab": "first" });
    const $ = i.length > 1 && (r.length > 0 || o.length > 0), ne = s.length > 1;
    if ($ || ne) {
      const M = c("div", { className: "params-group" });
      M.append(c("h3", { textContent: "Examples" })), $ && M.append(At({
        options: i.map((B) => ({ value: B.name, label: B.summary || B.name })),
        value: i[0].name,
        ariaLabel: "Select parameter example",
        className: "example-select",
        onChange: (B) => {
          const U = i.find((pe) => pe.name === B);
          U && (Os(t, U.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
        }
      })), ne && M.append(At({
        options: s.map((B) => ({ value: B.name, label: vs(B) })),
        value: s[0].name,
        ariaLabel: "Select body example",
        className: "example-select",
        onChange: (B) => {
          const U = s.find((pe) => pe.name === B);
          U && l && (l.setValue(Vn(U.value), "json"), l.syncLayout(), a?.(xe(t, e)));
        }
      })), O.append(M);
    }
    const ye = c("div", { className: "headers-section" }), Ee = c("div", { className: "field-header" });
    Ee.append(c("h3", { textContent: "Headers" }));
    const Ze = c("div", { className: "headers-list" });
    if (e.requestBody) {
      const B = Object.keys(e.requestBody.content || {})[0] || "application/json";
      Ze.append(rt("Content-Type", B));
    }
    if (W(e.resolvedSecurity) && x.spec) {
      const M = xn(e.resolvedSecurity, x.spec.securitySchemes), U = { ...kn(e.resolvedSecurity, x.spec.securitySchemes), ...M };
      for (const [pe, lt] of Object.entries(U))
        Ze.append(rt(pe, lt));
    }
    for (const M of e.parameters.filter((B) => B.in === "header"))
      Ze.append(rt(M.name, String(M.example || "")));
    const Zr = le({
      variant: "icon",
      icon: I.plus,
      ariaLabel: "Add header",
      className: "field-copy-btn",
      onClick: () => Ze.append(rt("", ""))
    });
    if (Ee.append(Zr), ye.append(Ee, Ze), O.append(ye), r.length > 0 || o.length > 0) {
      const M = c("div", { className: "params-group" });
      if (M.append(c("h3", { textContent: "Parameters" })), r.length > 0) {
        const B = c("div", { className: "params-group" });
        o.length > 0 && B.append(c("h3", { textContent: "Path" }));
        for (const U of r)
          B.append(er(U, i[0]?.values[U.name]));
        M.append(B);
      }
      if (o.length > 0) {
        const B = c("div", { className: "params-group" });
        r.length > 0 && B.append(c("h3", { textContent: "Query" }));
        for (const U of o)
          B.append(er(U, i[0]?.values[U.name]));
        M.append(B);
      }
      O.append(M);
    }
    {
      const M = c("div", { className: "route-preview" }), B = c("div", { className: "field-header" });
      B.append(c("h3", { textContent: "URL" }));
      const U = ue({
        ariaLabel: "Copy URL",
        getText: () => C?.value || xe(t, e).url
      });
      C = Ae({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "route-input"
      });
      const pe = c("div", { className: "route-input-row" });
      pe.append(C, U), M.append(B, pe), N = M;
    }
    if (e.requestBody) {
      const M = c("div", { className: "body-section" }), B = c("div", { className: "field-header" });
      B.append(c("h3", { textContent: "Body" }));
      const U = ue({
        ariaLabel: "Copy body",
        className: "field-copy-btn",
        getText: m
      });
      B.append(U), M.append(B);
      const lt = Object.keys(e.requestBody.content || {})[0] || "application/json", Xr = lt.includes("multipart"), Ln = e.requestBody.content?.[lt];
      if (Xr && Ln?.schema) {
        const Xe = c("div", { className: "multipart", "data-field": "multipart" }), ut = Ln.schema, Qe = ut.properties || {}, Qr = ut.required || [];
        for (const [et, Le] of Object.entries(Qe)) {
          const ea = Le.format === "binary" || Le.format === "base64" || Le.type === "string" && Le.format === "binary", On = Qr.includes(et), _t = c("div", { className: `params row${On ? " is-required" : ""}` }), Dt = c("span", { className: "label", textContent: et });
          if (On && Dt.append(Gr()), ea) {
            const Ut = c("input", {
              type: "file",
              autocomplete: "off",
              "data-multipart-field": et,
              "data-multipart-type": "file"
            });
            _t.append(Dt, Ut);
          } else {
            const Ut = Ae({
              placeholder: Le.description || et,
              value: Le.default !== void 0 ? String(Le.default) : "",
              dataAttrs: { multipartField: et, multipartType: "text" }
            });
            _t.append(Dt, Ut);
          }
          Xe.append(_t);
        }
        M.append(Xe);
      } else {
        const Xe = s[0], ut = Xe ? Vn(Xe.value) : "", Qe = Xn(ut, "json", {
          dataField: "body",
          onInput: () => a?.(xe(t, e))
        });
        l = Qe, j = Qe.syncLayout, M.append(Qe.wrap);
      }
      M.append(Yr("body")), O.append(M);
    }
  }
  const D = p(), K = Zt(D), oe = Xn(
    K[0]?.code ?? "",
    K[0]?.language
  ), q = c("div", { className: "panel", "data-tab": "lang" }), J = c("div", { className: "body-section" }), de = c("div", { className: "field-header" });
  de.append(c("h3", { textContent: "Code Example" }));
  const Q = ue({
    ariaLabel: "Copy code",
    className: "field-copy-btn",
    getText: () => oe.textarea.value
  });
  de.append(Q), J.append(de, oe.wrap), q.append(J);
  for (let E = 0; E < d.length; E++) {
    const $ = d[E], ne = Et($.label, { active: !u });
    y.push(ne);
  }
  A.append(T);
  const ee = O ? [O, q] : [q], ae = (E, $) => {
    if (!$) {
      E.style.display = "none";
      return;
    }
    E.style.display = E.classList.contains("is-request") ? "flex" : "block";
  };
  for (let E = 0; E < y.length; E++) {
    T.append(y[E]);
    const $ = E;
    y[E].addEventListener("click", () => {
      y.forEach((ne) => ne.classList.remove("is-active")), y[$].classList.add("is-active"), L = $, O && ae(O, $ === 0), ae(q, $ !== 0), $ === 0 && j?.(), $ > 0 && f(oe, $ - 1);
    });
  }
  const Ke = c("div", { className: "card-content flush" }), Je = c("div", { className: "panels" });
  if (O && ae(O, !0), ae(q, !1), Je.append(...ee), Ke.append(Je), n?.onSendRequest) {
    const E = le({
      variant: "primary",
      icon: I.send,
      label: "Send Request",
      className: "send-btn"
    });
    E.addEventListener("click", () => n.onSendRequest(E));
    {
      N && O?.append(N);
      const $ = c("div", { className: "send-inline" });
      $.append(E), O?.append($);
    }
  }
  !n?.onSendRequest && u && N && O?.append(N), v.append(A, Ke), g.append(v);
  const ie = () => {
    C && (C.value = xe(t, e).url), a?.(xe(t, e)), (L > 0 || !u) && f(oe, L - 1);
  };
  return t.addEventListener("input", ie), t.addEventListener("change", ie), queueMicrotask(() => {
    ie(), j?.();
  }), h;
}
function Qn(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function Os(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((a) => {
    const r = a.getAttribute("data-param-name");
    r && t[r] !== void 0 && (a.value = t[r]);
  });
}
function er(e, t) {
  const n = c("div", { className: `params row${e.required ? " is-required" : ""}` }), a = c("span", {
    className: "label",
    textContent: e.name
  });
  e.required && a.append(Gr());
  const r = e.schema;
  let o;
  if (r?.enum && r.enum.length > 0) {
    const s = e.required ? r.enum.map((u) => ({ value: String(u), label: String(u) })) : [{ value: "", label: "— select —" }, ...r.enum.map((u) => ({ value: String(u), label: String(u) }))];
    o = At({
      options: s,
      value: Qn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const s = r?.type === "integer" || r?.type === "number" ? "number" : "text", l = Ae({
      type: s,
      placeholder: e.description || e.name,
      value: Qn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    r?.type === "integer" && l.setAttribute("step", "1"), r?.minimum !== void 0 && l.setAttribute("min", String(r.minimum)), r?.maximum !== void 0 && l.setAttribute("max", String(r.maximum)), o = l;
  }
  const i = Yr(e.name);
  return n.append(a, o, i), n;
}
function Gr() {
  return c("span", {
    className: "required-star",
    textContent: "*",
    "aria-hidden": "true"
  });
}
function rt(e, t) {
  const n = c("div", { className: "header-row" }), a = Ae({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), r = Ae({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), o = le({
    variant: "icon",
    icon: I.close,
    ariaLabel: "Remove header",
    onClick: () => n.remove()
  });
  return n.append(a, r, o), n;
}
function xe(e, t) {
  const n = k.get(), a = ve(n), r = e.querySelectorAll('[data-param-in="path"]'), o = {};
  r.forEach((f) => {
    o[f.getAttribute("data-param-name")] = f.value;
  });
  const i = e.querySelectorAll('[data-param-in="query"]'), s = {};
  if (i.forEach((f) => {
    const h = f.getAttribute("data-param-name");
    f.value && (s[h] = f.value);
  }), n.spec && W(t.resolvedSecurity)) {
    const f = Hi(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [h, g] of Object.entries(f))
      h in s || (s[h] = g);
  }
  const l = e.querySelectorAll(".header-row"), u = {};
  if (l.forEach((f) => {
    const h = f.querySelector("[data-header-name]"), g = f.querySelector("[data-header-value]");
    h?.value && g?.value && (u[h.value] = g.value);
  }), n.spec && W(t.resolvedSecurity)) {
    const f = Fi(t.resolvedSecurity, n.spec.securitySchemes), h = Object.entries(f).map(([g, b]) => `${g}=${b}`);
    if (h.length > 0) {
      const g = u.Cookie || u.cookie || "";
      u.Cookie = g ? `${g}; ${h.join("; ")}` : h.join("; "), delete u.cookie;
    }
  }
  const d = e.querySelector('[data-field="multipart"]');
  let p;
  if (d) {
    const f = new FormData();
    d.querySelectorAll("[data-multipart-field]").forEach((g) => {
      const b = g.getAttribute("data-multipart-field"), x = g.getAttribute("data-multipart-type");
      x === "file" && g.files && g.files.length > 0 ? f.append(b, g.files[0]) : x === "text" && g.value && f.append(b, g.value);
    }), p = f, delete u["Content-Type"];
  } else
    p = e.querySelector('[data-field="body"]')?.value || void 0;
  const m = us(a, t.path, o, s);
  return { method: t.method, url: m, headers: u, body: p };
}
function Xt(e, t) {
  z(e);
  const n = c("div", { className: "card" }), a = c("div", { className: "card-head response-header" }), r = Et("Body", { active: !0 }), o = Et(`Headers (${Object.keys(t.headers).length})`), i = c("div", { className: "tabs tabs-code" });
  i.append(r, o);
  const s = c("div", {
    className: "meta",
    innerHTML: `<span>${wi(t.duration)}</span><span>${Ci(t.size)}</span>`
  }), l = w({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), u = ue({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => Is("Response copied")
  });
  a.append(i, s, l, u), n.append(a);
  const d = c("div", { className: "card-content flush" }), p = c("div", { className: "response-pane" }), m = c("div", { className: "pane-inner" }), f = c("pre", { className: "code-display" }), h = c("code", {}), g = Ts(t.body);
  h.innerHTML = Vr(g, Or(g) ? "json" : ""), f.append(h), m.append(f), p.append(m);
  const b = c("div", { className: "response-pane", style: "display:none" }), x = c("div", { className: "pane-inner" }), v = c("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false",
    autocomplete: "off"
  });
  v.value = Object.entries(t.headers).map(([A, T]) => `${A}: ${T}`).join(`
`), Zn(v), x.append(v), b.append(x), d.append(p, b), n.append(d), r.addEventListener("click", () => {
    r.classList.add("is-active"), o.classList.remove("is-active"), p.style.display = "block", b.style.display = "none";
  }), o.addEventListener("click", () => {
    o.classList.add("is-active"), r.classList.remove("is-active"), p.style.display = "none", b.style.display = "block", requestAnimationFrame(() => Zn(v));
  }), e.append(n);
}
function Ts(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function Is(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = c("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
let qs = 0;
function It(e, t, n) {
  if (t?.schema)
    return {
      content: as(t.schema).body,
      contentType: e,
      schemaType: Ge(t.schema),
      itemsCount: $s(t.schema)
    };
  const a = c("div", { className: "schema" }), r = c("div", { className: "body schema-body-plain" });
  return r.append(c("p", { textContent: n })), a.append(r), {
    content: a,
    contentType: e,
    schemaType: "plain",
    itemsCount: 1
  };
}
function Cn(e) {
  const t = c("span", { className: "schema-content-meta" });
  return t.append(
    w({ text: e.contentType, kind: "chip", size: "s" }),
    w({ text: e.schemaType, kind: "chip", color: "primary", size: "s" })
  ), t;
}
function $s(e) {
  let t = 0;
  return e.properties && (t += Object.keys(e.properties).length), e.type === "array" && e.items && (t += 1), Array.isArray(e.allOf) && (t += e.allOf.length), Array.isArray(e.oneOf) && (t += e.oneOf.length), Array.isArray(e.anyOf) && (t += e.anyOf.length), e.additionalProperties && typeof e.additionalProperties == "object" && (t += 1), Math.max(t, 1);
}
function Ce(e) {
  const t = `collapsible-category-${qs++}`, n = c("div", { className: "collapsible-category" }), a = c("span", { className: "collapsible-category-title", textContent: e.title }), r = c("span", { className: "collapsible-category-meta" });
  e.trailing && r.append(c("span", { className: "collapsible-category-trailing" }, e.trailing));
  const o = c("span", { className: "collapsible-category-controls" });
  e.counter !== void 0 && o.append(w({ text: String(e.counter), kind: "chip", size: "s" }));
  const i = c("span", { className: "collapsible-category-chevron", innerHTML: I.chevronDown });
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
function Kr(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([o, i]) => {
    const s = i.schema ? Ge(i.schema) : "string", l = i.example !== void 0 ? String(i.example) : i.schema?.example !== void 0 ? String(i.schema.example) : "—", u = c("div", { className: "schema-row role-flat role-headers" }), d = c("div", { className: "schema-main-row" }), p = c("div", { className: "schema-name-wrapper" });
    p.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: o })
    );
    const m = c("div", { className: "schema-meta-wrapper" });
    m.append(w({ text: s, kind: "chip", color: "primary", size: "m" })), i.required && m.append(w({ text: "required", kind: "required", size: "m" })), d.append(p, m), u.append(d);
    const f = c("div", { className: "schema-desc-col is-root" });
    i.description && f.append(c("p", { textContent: i.description }));
    const h = c("div", { className: "schema-enum-values" });
    return h.append(w({
      text: l,
      kind: "chip",
      size: "s"
    })), f.append(h), f.children.length > 0 && u.append(f), u;
  }), a = c("div", { className: "params" }), r = c("div", { className: "body role-headers" });
  return r.append(...n), a.append(r), a;
}
function qt(e) {
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
    trailing: Cn(e.body),
    counter: e.body.itemsCount
  });
  return t.append(n.root), t;
}
function an(e) {
  const { prev: t, next: n } = js(e);
  if (!t && !n) return null;
  const a = c("div", {
    className: `route-nav${!t || !n ? " is-single" : ""}`
  });
  return t && a.append(tr(t, "previous")), n && a.append(tr(n, "next")), a;
}
function tr(e, t) {
  const n = R(e.route), a = c("a", {
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
  const o = c("span", { className: "route-side", "aria-hidden": "true" });
  o.innerHTML = t === "previous" ? I.chevronLeft : I.chevronRight;
  const i = c("div", { className: "route-main" });
  return i.append(
    c("span", { className: "route-category", textContent: e.category }),
    c("span", { className: "route-title", textContent: e.title }),
    r
  ), t === "previous" ? a.append(o, i) : a.append(i, o), a.addEventListener("click", (s) => {
    s.preventDefault(), P(n);
  }), a;
}
function js(e) {
  if (!k.get().spec) return { prev: null, next: null };
  const n = Bs();
  if (n.length === 0) return { prev: null, next: null };
  const a = Ms(n, e);
  return a < 0 ? { prev: null, next: null } : {
    prev: a > 0 ? n[a - 1] : null,
    next: a < n.length - 1 ? n[a + 1] : null
  };
}
function Bs() {
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
function Ms(e, t) {
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
async function Ps(e, t, n) {
  z(e), z(t);
  const a = n.method.toLowerCase() !== "trace", r = t.parentElement;
  r && a && (r.setAttribute("aria-label", "Try It"), r.classList.add("try-it"));
  const o = k.get(), i = Ei(o), s = ze(o), l = i + (n.path.startsWith("/") ? "" : "/") + n.path, u = [], d = w({
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
    const J = q.startsWith("{") && q.endsWith("}"), de = !J && p.has(q.toLowerCase()), Q = o.spec?.tags.find((ee) => ee.name.toLowerCase() === q.toLowerCase());
    de && Q ? u.push({
      label: q,
      href: R({ type: "tag", tag: Q.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (ee) => {
        ee.preventDefault(), P(R({ type: "tag", tag: Q.name }));
      }
    }) : u.push({
      label: q,
      className: J ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const f = ue({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${l}`
  }), h = Ve(u, {
    leading: [d],
    trailing: [f]
  }), g = c("div", { className: "block header" });
  g.append(c("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.description && g.append(c("p", { textContent: n.description }));
  const b = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  b.append(h), g.append(b);
  const x = c("div", { className: "endpoint-meta-row" });
  if (n.deprecated) {
    const q = c("span", { className: "icon-muted" });
    q.innerHTML = I.warning, x.append(c("span", { className: "endpoint-meta deprecated" }, q, "Deprecated"));
  }
  if (W(n.resolvedSecurity)) {
    const q = Ws(o, n), J = lr(n.resolvedSecurity) || "Auth required", de = Pt({
      configured: q,
      variant: "endpoint",
      title: De(n.resolvedSecurity)
    }), Q = c("span", {
      className: `endpoint-meta auth${q ? " is-active" : " is-missing"}`,
      "aria-label": De(n.resolvedSecurity),
      role: "button",
      tabindex: "0"
    }, de, J);
    Q.classList.add("endpoint-auth-trigger", "focus-ring"), Q.addEventListener("click", () => {
      const ee = k.get().spec;
      if (!ee || !Object.keys(ee.securitySchemes || {}).length) return;
      const ae = e.closest(".root") ?? void 0;
      bn(ee.securitySchemes, ae, Vs(n, o));
    }), Q.addEventListener("keydown", (ee) => {
      const ae = ee.key;
      ae !== "Enter" && ae !== " " || (ee.preventDefault(), Q.click());
    }), x.append(Q);
  }
  x.childElementCount > 0 && g.append(x), e.append(g);
  const v = n.parameters.filter((q) => q.in !== "cookie"), A = _({ title: "Request" }), T = Rs(n, v);
  if (T)
    A.append(T);
  else {
    const q = c("div", { className: "params empty", textContent: "No parameters or request body required" });
    A.append(q);
  }
  e.append(A);
  let y = !1;
  Object.keys(n.responses).length > 0 && (e.append(Ds(n)), y = !0);
  const L = {
    type: "endpoint",
    method: n.method,
    path: n.path,
    operationId: n.operationId
  }, C = an(L), N = an(L), j = () => {
    if (C && e.append(c("div", { className: "route-nav-wrap is-desktop" }, C)), N) {
      const q = e.closest(".page");
      q && q.append(c("div", { className: "route-nav-wrap is-mobile" }, N));
    }
  };
  y && j(), n.callbacks && n.callbacks.length > 0 && e.append(Us(n)), y || j();
  const O = zs(n);
  n.method.toLowerCase() !== "trace" && Es(n, t, O);
  const D = je(), K = h.querySelector(".breadcrumb-item");
  K && D.on("endpoint:breadcrumb", (q) => {
    K.textContent = ze(q) || q.spec?.info.title || "Home";
  });
  const oe = t.querySelector(".content");
  oe && W(n.resolvedSecurity) && D.on("endpoint:auth-headers", (q) => {
    if (!q.spec) return;
    const J = oe.querySelector(".headers-list");
    if (!J) return;
    const de = ["Authorization", "Cookie"];
    for (const ie of Array.from(J.querySelectorAll(".header-row"))) {
      const E = ie.querySelector("[data-header-name]");
      E && de.includes(E.value) && ie.remove();
    }
    const Q = xn(n.resolvedSecurity, q.spec.securitySchemes), ae = { ...kn(n.resolvedSecurity, q.spec.securitySchemes), ...Q }, Ke = Array.from(J.querySelectorAll(".header-row")), Je = Ke.find((ie) => {
      const E = ie.querySelector("[data-header-name]");
      return E && E.value === "Content-Type";
    }) || Ke[0];
    for (const [ie, E] of Object.entries(ae).reverse()) {
      const $ = rt(ie, E);
      Je ? Je.insertAdjacentElement("beforebegin", $) : J.prepend($);
    }
    oe.dispatchEvent(new Event("input", { bubbles: !0 }));
  });
}
function Rs(e, t) {
  const n = t.filter((u) => u.in === "path"), a = t.filter((u) => u.in === "query"), r = Hs(e), o = _s(e);
  if (n.length === 0 && a.length === 0 && r.length === 0 && !o)
    return null;
  const i = te(), s = We(), l = c("div", { className: "collapsible-categories" });
  if (n.length > 0) {
    const u = Ce({
      title: "Path",
      content: nr(n),
      counter: n.length
    });
    l.append(u.root);
  }
  if (a.length > 0) {
    const u = Ce({
      title: "Query",
      content: nr(a),
      counter: a.length
    });
    l.append(u.root);
  }
  if (r.length > 0) {
    const u = Ce({
      title: "Headers",
      content: Fs(r),
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
function nr(e) {
  const t = e.map((r) => {
    const o = c("div", { className: "schema-row role-flat role-params" }), i = c("div", { className: "schema-main-row" }), s = c("div", { className: "schema-name-wrapper" });
    s.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: r.name })
    );
    const l = c("div", { className: "schema-meta-wrapper" });
    l.append(w({
      text: r.schema ? Ge(r.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), r.required && l.append(w({ text: "required", kind: "required", size: "m" })), i.append(s, l), o.append(i);
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
    return u.children.length > 0 && o.append(u), o;
  }), n = c("div", { className: "params" }), a = c("div", { className: "body role-params" });
  return a.append(...t), n.append(a), n;
}
function Hs(e) {
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
  if (W(e.resolvedSecurity)) {
    const n = k.get().spec, a = n ? xn(e.resolvedSecurity, n.securitySchemes) : {}, o = { ...n ? kn(e.resolvedSecurity, n.securitySchemes) : {}, ...a };
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
function Fs(e) {
  const t = e.map((r) => {
    const o = c("div", { className: "schema-row role-flat role-headers" }), i = c("div", { className: "schema-main-row" }), s = c("div", { className: "schema-name-wrapper" });
    s.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: r.name })
    );
    const l = c("div", { className: "schema-meta-wrapper" });
    r.required && l.append(w({ text: "required", kind: "required", size: "m" })), i.append(s, l), o.append(i);
    const u = c("div", { className: "schema-desc-col is-root" });
    r.description && u.append(c("p", { textContent: r.description }));
    const d = c("div", { className: "schema-enum-values" });
    return d.append(w({
      text: r.value || "—",
      kind: "chip",
      size: "s"
    })), u.append(d), u.children.length > 0 && o.append(u), o;
  }), n = c("div", { className: "params" }), a = c("div", { className: "body role-headers" });
  return a.append(...t), n.append(a), n;
}
function _s(e) {
  const t = c("div", { className: "request-body-wrap" }), n = Object.entries(e.requestBody?.content || {});
  if (e.requestBody?.description && t.append(c("p", { textContent: e.requestBody.description })), n.length === 0)
    return t.childElementCount > 0 ? { content: t } : null;
  const a = n.map(([o, i]) => It(o, i, "No schema"));
  if (a.length === 1) {
    const o = a[0];
    return t.append(o.content), { content: t, trailing: Cn(o), counter: o.itemsCount };
  }
  const r = c("div", { className: "schema-media-list" });
  for (const o of a) {
    const i = c("div", { className: "schema-media-header" });
    i.append(
      w({ text: o.contentType, kind: "chip", size: "s" }),
      w({ text: o.schemaType, kind: "chip", color: "primary", size: "s" })
    );
    const s = c("div", { className: "schema-media-item" });
    s.append(i, o.content), r.append(s);
  }
  return t.append(r), {
    content: t,
    counter: a.length
  };
}
function Ds(e) {
  const t = _({
    titleEl: st("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const a = te(), r = c("div", { className: "card-row responses-header-row" }), o = c("div", { className: "tabs-code codes" });
  let i = n[0][0];
  const s = /* @__PURE__ */ new Map();
  for (const [p, m] of n) {
    const f = jr(p, p === i), h = m.content && Object.keys(m.content)[0] || "application/json", g = m.content?.[h], b = It(h, g, m.description || "No schema"), x = m.headers ? Kr(m.headers) : null;
    s.set(p, {
      body: b,
      headers: x,
      headersCount: m.headers ? Object.keys(m.headers).length : 0
    }), o.append(f), f.addEventListener("click", () => {
      o.querySelectorAll('[data-badge-group="response-code"]').forEach((A) => Lt(A, !1)), Lt(f, !0), i = p;
      const v = s.get(p);
      u.innerHTML = "", u.append(qt(v));
    });
  }
  r.append(o), a.append(Mt(r));
  const l = We(), u = c("div"), d = s.get(i);
  return d && u.append(qt(d)), l.append(u), a.append(l), t.append(a), t;
}
function Us(e) {
  const t = _({
    titleEl: st("Callbacks", w({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const a = c("div", { className: "callback-block" });
    a.append(c("div", { className: "callback-name", textContent: n.name }));
    for (const r of n.operations) {
      const o = c("div", { className: "callback-operation" }), i = c("div", { className: "callback-op-header" });
      if (i.append(
        w({
          text: r.method.toUpperCase(),
          kind: "method",
          method: r.method
        }),
        c("span", { className: "callback-op-path", textContent: r.path })
      ), o.append(i), r.summary && o.append(c("div", { className: "callback-op-summary", textContent: r.summary })), r.description && o.append(c("p", { textContent: r.description })), r.requestBody) {
        const s = r.requestBody.content || {};
        for (const [l, u] of Object.entries(s))
          u.schema && o.append(nn(u.schema, `${l} — Request Body`));
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
              p.schema && u.append(nn(p.schema, `${d}`));
          o.append(u);
        }
      a.append(o);
    }
    t.append(a);
  }
  return t;
}
function zs(e) {
  const t = Object.keys(e.responses).sort((n, a) => {
    const r = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, o = a.startsWith("2") ? 0 : a.startsWith("4") ? 1 : 2;
    return r - o || n.localeCompare(a);
  });
  for (const n of t) {
    const a = e.responses[n];
    if (!a?.content) continue;
    const r = Object.keys(a.content)[0] || "application/json", o = a.content[r], s = (o ? zr(o) : [])[0];
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
function Ws(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!W(t.resolvedSecurity)) return !1;
  const a = (e.auth.token || "").trim(), r = e.auth.schemes || {}, o = e.auth.activeScheme, i = (s) => String(r[s] || "").trim() ? !0 : a ? !o || o === s : !1;
  return n.some((s) => {
    const l = s.map((u) => u.schemeName);
    return l.length === 0 ? !0 : l.every((u) => i(u));
  });
}
function Vs(e, t) {
  return (e.resolvedSecurity?.requirements || [])[0]?.[0]?.schemeName || t.auth.activeScheme || void 0;
}
function Ys(e, t, n) {
  z(e);
  const a = k.get().spec;
  if (!a) return;
  const r = X(n), o = a.tags.find((v) => v.name === n) || a.tags.find((v) => X(v.name) === r);
  if (!o || o.operations.length === 0) {
    const v = c("div", { className: "block header" });
    v.append(c("h1", { textContent: "Tag not found" })), e.append(v), e.append(_(
      { title: "Details" },
      c("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const i = c("div", { className: "block header" });
  i.append(c("h1", { textContent: o.name }));
  const s = k.get(), l = ze(s), u = ue({
    ariaLabel: "Copy category",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => o.name
  }), d = Ve([
    {
      label: l || a.info.title || "Home",
      href: "/",
      className: "breadcrumb-item",
      onClick: (v) => {
        v.preventDefault(), P("/");
      }
    },
    { label: o.name, className: "breadcrumb-current" }
  ], {
    className: "breadcrumb-tag-page",
    leading: [w({ text: "Tag", kind: "chip", size: "m" })],
    trailing: [u]
  }), p = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  p.append(d), i.append(p), o.description && i.append(c("p", { textContent: o.description })), e.append(i);
  const m = Gs(o), f = o.operations.filter((v) => W(v.resolvedSecurity)).length, h = o.operations.filter((v) => v.deprecated).length;
  e.append(_(
    { className: "summary" },
    Ft(
      [
        { label: "Endpoints", value: o.operations.length },
        { label: "Auth Required", value: f },
        { label: "Deprecated", value: h }
      ],
      m
    )
  ));
  const g = _({ title: "Endpoints" }), b = k.get().route;
  for (const v of o.operations) {
    const A = {
      type: "endpoint",
      tag: o.name,
      method: v.method,
      path: v.path,
      operationId: v.operationId
    }, T = b.type === "endpoint" && (b.operationId && b.operationId === v.operationId || b.method === v.method && b.path === v.path), y = te({
      interactive: !0,
      active: T,
      className: `card-group${v.deprecated ? " deprecated" : ""}`,
      onClick: () => P(R(A))
    }), L = W(v.resolvedSecurity) ? Pt({
      configured: Ht(v.resolvedSecurity, a.securitySchemes || {}),
      variant: "tag",
      title: De(v.resolvedSecurity)
    }) : null, C = c("div", { className: "card-badges" });
    C.append(w({ text: v.method.toUpperCase(), kind: "method", method: v.method, size: "m" }));
    const N = c("div", { className: "card-group-top" });
    L && N.append(L), N.append(c("h3", { className: "card-group-title" }, c("code", { textContent: v.path })), C);
    const j = v.summary || v.operationId ? c("p", { className: "card-group-description", textContent: v.summary || v.operationId }) : null;
    y.append(N), j && y.append(j), g.append(y);
  }
  e.append(g);
  const x = d.querySelector(".breadcrumb-item");
  x && je().on("tag:breadcrumb", (v) => {
    x.textContent = ze(v) || v.spec?.info.title || "Home";
  });
}
function Gs(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function Ks(e, t) {
  z(e);
  const n = w({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), a = w({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), r = k.get(), o = ze(r), i = ue({
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
    const h = _({ title: "Parameters" }, Js(d));
    e.append(h);
  }
  if (t.requestBody) {
    const h = _({
      titleEl: st("Request")
    }), g = Object.entries(t.requestBody.content || {});
    if (g.length > 0) {
      const b = te(), x = We(), v = c("div", { className: "collapsible-categories" }), A = c("div", { className: "request-body-wrap" });
      t.requestBody.description && A.append(c("p", { textContent: t.requestBody.description }));
      const T = g.map(([y, L]) => It(y, L, "No schema"));
      if (T.length === 1) {
        const y = T[0];
        A.append(y.content);
        const L = Ce({
          title: "Body",
          content: A,
          trailing: Cn(y),
          counter: y.itemsCount
        });
        v.append(L.root);
      } else {
        const y = c("div", { className: "schema-media-list" });
        for (const C of T) {
          const N = c("div", { className: "schema-media-header" });
          N.append(
            w({ text: C.contentType, kind: "chip", size: "s" }),
            w({ text: C.schemaType, kind: "chip", color: "primary", size: "s" })
          );
          const j = c("div", { className: "schema-media-item" });
          j.append(N, C.content), y.append(j);
        }
        A.append(y);
        const L = Ce({
          title: "Body",
          content: A,
          counter: T.length
        });
        v.append(L.root);
      }
      x.append(v), b.append(x), h.append(b);
    }
    e.append(h);
  }
  const p = Object.entries(t.responses);
  if (p.length > 0) {
    const h = _({
      titleEl: st("Expected Responses")
    }), g = te(), b = c("div", { className: "card-row responses-header-row" }), x = c("div", { className: "tabs-code codes" });
    let v = p[0][0];
    const A = /* @__PURE__ */ new Map();
    for (const [C, N] of p) {
      const j = jr(C, C === v), O = N.content && Object.keys(N.content)[0] || "application/json", D = N.content?.[O], K = It(O, D, N.description || "No schema"), oe = N.headers ? Kr(N.headers) : null;
      A.set(C, {
        body: K,
        headers: oe,
        headersCount: N.headers ? Object.keys(N.headers).length : 0
      }), x.append(j), j.addEventListener("click", () => {
        x.querySelectorAll('[data-badge-group="response-code"]').forEach((J) => Lt(J, !1)), Lt(j, !0), v = C;
        const q = A.get(C);
        y.innerHTML = "", y.append(qt(q));
      });
    }
    b.append(x), g.append(Mt(b));
    const T = We(), y = c("div"), L = A.get(v);
    L && y.append(qt(L)), T.append(y), g.append(T), h.append(g), e.append(h);
  }
  const m = an({ type: "webhook", webhookName: t.name });
  m && e.append(c("div", { className: "block section" }, m));
  const f = s.querySelector(".breadcrumb-item");
  f && je().on("webhook:breadcrumb", (h) => {
    f.textContent = ze(h) || h.spec?.info.title || "Home";
  });
}
function Js(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, a = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return os(e, { headerTitle: a, withEnumAndDefault: !1 });
}
function Zs() {
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
let he = null, re = null, wn = null, Nn = null, Sn = null, xt = null, kt = !1, ht = "", He = null;
const Xs = 991;
function Qs(e, t) {
  he = c("div", { className: "root" });
  const n = {
    primaryColor: t.primaryColor
  };
  Hn(he, k.get().theme, n);
  const a = c("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', a.addEventListener("click", () => {
    k.set({ sidebarOpen: !0 }), re?.classList.remove("collapsed");
  }), re = c("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: r, main: o, aside: i } = Zs();
  wn = r, Nn = o, Sn = i, he.append(a, re, r), e.append(he), nc(), k.subscribe((s) => {
    he && (Hn(he, s.theme, n), re?.classList.toggle("collapsed", !s.sidebarOpen), a.classList.toggle("visible", !s.sidebarOpen), rr(s, t));
  }), re?.classList.toggle("collapsed", !k.get().sidebarOpen), a.classList.toggle("visible", !k.get().sidebarOpen), rr(k.get(), t);
}
function ec() {
  He?.(), He = null, Tr(), he && (he.remove(), he = null, re = null, wn = null, Nn = null, Sn = null, xt = null, kt = !1);
}
async function rr(e, t) {
  const n = !!e.spec;
  re && n ? (kt ? Ui(re, e.route) : Wi(re, t), kt = !0) : kt = !1;
  const a = Nn, r = Sn, o = wn;
  if (!a || !r || !o) return;
  if (e.loading) {
    fe(o, !1), z(r), tt(a, mt({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const m = a.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (e.error) {
    fe(o, !1), z(r), tt(a, mt({
      title: "Failed to load API specification",
      message: e.error,
      icon: I.warning,
      variant: "error"
    }));
    const m = a.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (!e.spec) return;
  const i = e.route, s = `${e.activeEnvironment}|${e.auth.token}`, l = !!(xt && rc(xt, i)), u = l && ht !== s, d = a.parentElement, p = d ? d.scrollTop : 0;
  if (!(l && ht === s)) {
    if (u) {
      ht = s, Si(e), re && e.spec && (zi(re), Zi(re));
      return;
    }
    switch (xt = { ...i }, ht = s, Tr(), o.querySelectorAll(":scope > .route-nav-wrap").forEach((m) => m.remove()), z(a), z(r), i.type) {
      case "overview":
        fe(o, !1), Wn(a);
        break;
      case "tag": {
        fe(o, !1), Ys(a, r, i.tag || "");
        break;
      }
      case "endpoint": {
        const m = tc(e, i);
        if (m) {
          const f = m.method.toLowerCase() !== "trace";
          fe(o, f), await Ps(a, r, m);
        } else {
          fe(o, !1);
          const f = i.operationId ? i.operationId : `${i.method?.toUpperCase() || ""} ${i.path || ""}`.trim();
          tt(a, mt({
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
            const f = ve(e), h = Se(f), g = ue({
              ariaLabel: "Copy schema name",
              copiedAriaLabel: "Copied",
              className: "breadcrumb-copy",
              getText: () => i.schemaName || ""
            }), b = Ve(
              [
                {
                  label: h || e.spec.info.title || "Home",
                  href: "/",
                  className: "breadcrumb-item",
                  onClick: (y) => {
                    y.preventDefault(), P("/");
                  }
                },
                { label: i.schemaName, className: "breadcrumb-current" }
              ],
              {
                leading: [w({ text: "Schema", kind: "chip", size: "m" })],
                trailing: [g]
              }
            ), x = c("div", { className: "block header" });
            x.append(c("h1", { textContent: i.schemaName }));
            const v = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
            v.append(b), x.append(v), m.description && x.append(c("p", { textContent: String(m.description) }));
            const A = c("div", { className: "block section" });
            A.append(nn(m, "Properties")), tt(a, x, A);
            const T = b.querySelector(".breadcrumb-item");
            T && je().on("schema:breadcrumb", (y) => {
              T.textContent = Se(ve(y)) || y.spec?.info.title || "Home";
            });
          }
        } else
          oc(a, e);
        break;
      }
      case "webhook": {
        if (fe(o, !1), i.webhookName) {
          const m = e.spec.webhooks?.find((f) => f.name === i.webhookName);
          m ? Ks(a, m) : tt(a, mt({
            title: "Webhook not found",
            message: i.webhookName,
            variant: "empty"
          }));
        } else
          ac(a, e);
        break;
      }
      default:
        fe(o, !1), Wn(a);
    }
    d && (d.scrollTop = u ? p : 0);
  }
}
function tc(e, t) {
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
    const o = X(t.tag), i = r.find(
      (s) => s.tags.some((l) => X(l) === o)
    );
    if (i) return i;
  }
  return r[0];
}
function nc() {
  if (He?.(), He = null, typeof window > "u" || typeof window.matchMedia != "function") return;
  const e = window.matchMedia(`(max-width: ${Xs}px)`), t = (r) => {
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
function rc(e, t) {
  return e.type === t.type && e.operationId === t.operationId && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
function ac(e, t) {
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
    leading: [w({ text: "Tag", kind: "chip", size: "m" })],
    trailing: [ue({
      ariaLabel: "Copy",
      copiedAriaLabel: "Copied",
      className: "breadcrumb-copy",
      getText: () => "Webhooks"
    })]
  }), l = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  l.append(s), i.append(l), e.append(i);
  const u = s.querySelector(".breadcrumb-item");
  u && je().on("webhookList:breadcrumb", (m) => {
    u.textContent = Se(ve(m)) || m.spec?.info.title || "Home";
  });
  const d = {};
  for (const m of a)
    d[m.method] = (d[m.method] || 0) + 1;
  e.append(_(
    { className: "summary" },
    Ft(
      [{ label: "Webhooks", value: a.length }],
      d
    )
  ));
  const p = _({ title: "Webhooks" });
  for (const m of a) {
    const f = { type: "webhook", webhookName: m.name }, h = t.route.type === "webhook" && t.route.webhookName === m.name, g = te({
      interactive: !0,
      active: h,
      className: "card-group",
      onClick: () => P(R(f))
    }), b = c("div", { className: "card-badges" });
    b.append(
      w({ text: "WH", kind: "webhook", size: "m" }),
      w({ text: m.method.toUpperCase(), kind: "method", method: m.method, size: "m" })
    );
    const x = c("div", { className: "card-group-top" });
    x.append(c("h3", { className: "card-group-title", textContent: m.name }), b);
    const v = c("p", {
      className: "card-group-description",
      textContent: m.summary || m.description || `${m.method.toUpperCase()} webhook`
    });
    g.append(x, v), p.append(g);
  }
  e.append(p);
}
function oc(e, t) {
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
    leading: [w({ text: "Tag", kind: "chip", size: "m" })],
    trailing: [ue({
      ariaLabel: "Copy",
      copiedAriaLabel: "Copied",
      className: "breadcrumb-copy",
      getText: () => "Schemas"
    })]
  }), l = c("div", { className: "breadcrumb-wrap endpoint-breadcrumb" });
  l.append(s), i.append(l), e.append(i);
  const u = s.querySelector(".breadcrumb-item");
  u && je().on("schemaList:breadcrumb", (p) => {
    u.textContent = Se(ve(p)) || p.spec?.info.title || "Home";
  }), e.append(_(
    { className: "summary" },
    Ft(
      [{ label: "Schemas", value: a.length }],
      {}
    )
  ));
  const d = _({ title: "Schemas" });
  for (const p of a) {
    const m = n.schemas[p], f = { type: "schema", schemaName: p }, h = t.route.type === "schema" && t.route.schemaName === p, g = te({
      interactive: !0,
      active: h,
      className: "card-group",
      onClick: () => P(R(f))
    }), b = c("div", { className: "card-badges" }), x = m.type || (m.allOf ? "allOf" : m.oneOf ? "oneOf" : m.anyOf ? "anyOf" : "object");
    b.append(w({ text: x, kind: "chip", size: "m" })), m.properties && b.append(w({ text: `${Object.keys(m.properties).length} props`, kind: "chip", size: "m" }));
    const v = c("div", { className: "card-group-top" });
    v.append(c("h3", { className: "card-group-title", textContent: p }), b);
    const A = m.description ? c("p", { className: "card-group-description", textContent: String(m.description) }) : c("p", { className: "card-group-description", textContent: `${x} schema` });
    g.append(v, A), d.append(g);
  }
  e.append(d);
}
const Jr = "ap_portal_prefs";
function ic() {
  try {
    const e = localStorage.getItem(Jr);
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
function sc(e) {
  try {
    localStorage.setItem(Jr, JSON.stringify(e));
  } catch {
  }
}
function ar(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function cc(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], a = ar(e[n]);
  for (let r = 1; r < t.length; r++) {
    const o = t[r], i = ar(e[o]);
    i < a && (a = i, n = o);
  }
  return n;
}
function lc(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), a = Object.entries(t.schemes);
  if (n.length !== a.length) return !1;
  for (const [r, o] of n)
    if (t.schemes[r] !== o) return !1;
  return !0;
}
function uc(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const a = {};
  for (const i of n) {
    const s = e.schemes[i];
    typeof s == "string" && s.length > 0 && (a[i] = s);
  }
  let r = e.activeScheme;
  (!r || !t[r]) && (r = n.find((i) => !!a[i]) || ""), !r && e.token && (r = cc(t)), r && e.token && !a[r] && (a[r] = e.token);
  let o = e.token;
  return r && a[r] && o !== a[r] && (o = a[r]), !o && r && a[r] && (o = a[r]), {
    ...e,
    schemes: a,
    activeScheme: r,
    token: o
  };
}
function dc(e, t) {
  let n;
  return ((...a) => {
    clearTimeout(n), n = setTimeout(() => e(...a), t);
  });
}
let $t = !1, on = null, sn = null;
function pc(e) {
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
function fc(e) {
  if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((r) => r.getAttribute("href") === e)) return;
  const a = document.createElement("link");
  a.rel = "stylesheet", a.href = e, document.head.append(a);
}
function mc(e) {
  document.documentElement.style.minHeight = "100%", document.body.style.minHeight = "100vh", document.body.style.margin = "0", e.style.minHeight = "100vh", e.style.display = "block";
}
function hc(e) {
  const t = (e || "/").replace(/\/+/g, "/"), n = t.indexOf("/~/");
  if (n >= 0) return `${t.slice(0, n) || ""}/`;
  if (t.endsWith("/~")) return `${t.slice(0, -2) || ""}/`;
  if (t.endsWith("/")) return t;
  const a = t.lastIndexOf("/");
  return a < 0 ? "/" : t.slice(0, a + 1);
}
function gc(e) {
  if (!e || /^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(e) || e.startsWith("/")) return e;
  const n = new URL(window.location.href);
  return n.pathname = hc(window.location.pathname || "/"), n.search = "", n.hash = "", new URL(e, n.href).toString();
}
async function An(e) {
  let t = null;
  $t && (t = k.get().auth, En());
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  k.reset();
  const a = [{ name: "default", baseUrl: "" }];
  k.set({
    loading: !0,
    theme: xi(e.theme),
    environments: [...a],
    initialEnvironments: [...a],
    activeEnvironment: "default"
  });
  const r = ic();
  r ? k.set({
    activeEnvironment: r.activeEnvironment || "default",
    auth: r.auth
  }) : t && k.setAuth(t);
  const o = dc(() => {
    const i = k.get();
    sc({
      activeEnvironment: i.activeEnvironment,
      environments: i.environments,
      auth: i.auth
    });
  }, 300);
  k.subscribe(() => o()), aa(""), sn = Di(), Qs(n, e), $t = !0;
  try {
    let i;
    const s = e.specUrl;
    if (e.spec)
      i = e.spec;
    else if (s)
      i = await gi(gc(s));
    else
      throw new Error("Either spec or specUrl must be provided");
    const l = oi(i);
    if (l.servers.length > 0) {
      const p = l.servers.map((h, g) => ({
        name: h.description || (g === 0 ? "default" : `Server ${g + 1}`),
        baseUrl: h.url
      }));
      k.set({ environments: p, initialEnvironments: p.map((h) => ({ ...h })) });
      const m = k.get();
      p.some((h) => h.name === m.activeEnvironment) || k.set({ activeEnvironment: p[0]?.name || "default" });
    }
    const u = k.get().auth, d = uc(u, l.securitySchemes);
    lc(u, d) || k.setAuth(d), vi(l), k.set({ spec: l, loading: !1, error: null });
  } catch (i) {
    k.set({
      loading: !1,
      error: i.message || "Failed to load specification"
    });
  }
  return on = yc(), on;
}
async function vc(e) {
  if (typeof document > "u")
    throw new Error("[PureDocs] bootstrap() requires a browser environment");
  const t = pc(e);
  e.cssHref && fc(e.cssHref), e.fullPage !== !1 && mc(t);
  const { mount: n, mountId: a, cssHref: r, fullPage: o, ...i } = e;
  return An({
    ...i,
    mount: t
  });
}
function En() {
  $t && (sn?.(), sn = null, oa(), ec(), k.reset(), $t = !1, on = null);
}
function yc() {
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
const or = [
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
    return [...or];
  }
  async connectedCallback() {
    if (me.activeElement && me.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    me.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    me.activeElement === this && (this.api = null, En(), me.activeElement = null);
  }
  attributeChangedCallback(t, n, a) {
    this.isConnected && n !== a && or.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
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
      this.removeAttribute("title"), this.api = await An({ ...t, mount: this });
    } catch (t) {
      const n = t instanceof Error ? t.message : String(t);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${n}</div>`;
    }
  }
  parseConfig() {
    const t = this.getAttribute("spec-json");
    return {
      specUrl: this.getAttribute("spec-url") || void 0,
      spec: t ? bc(t, "spec-json") : void 0,
      theme: xc(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      title: this.getAttribute("title") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
me.activeElement = null;
let cn = me;
function bc(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function xc(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", cn);
const kc = {
  mount: An,
  bootstrap: vc,
  unmount: En,
  version: "1.0.0"
};
export {
  kc as PureDocs,
  cn as PureDocsElement,
  kc as default
};
//# sourceMappingURL=puredocs.js.map
