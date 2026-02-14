class Fr {
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
const x = new Fr(), _r = /* @__PURE__ */ new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace"
]);
let be = "";
function Dr(e = "") {
  be = e.replace(/\/+$/, ""), window.addEventListener("popstate", st), st();
}
function Hr() {
  window.removeEventListener("popstate", st);
}
function F(e) {
  window.history.pushState(null, "", be + e), st();
}
function _(e) {
  switch (e.type) {
    case "overview":
      return "/";
    case "tag":
      return `/${K(e.tag || "")}`;
    case "endpoint": {
      const t = e.tag || "default", n = (e.method || "get").toLowerCase(), i = e.path || "/";
      return `/${K(t)}/${n}${i}`;
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
function Wn(e) {
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
  if (_r.has(a)) {
    const o = de(i[0]), s = a, l = i.length > 2 ? "/" + i.slice(2).map(de).join("/") : "/";
    return { type: "endpoint", tag: o, method: s, path: l };
  }
  return { type: "tag", tag: de(i[0]) };
}
function K(e) {
  return e.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function de(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function Ur() {
  const e = window.location.pathname;
  return be ? e === be || e === `${be}/` ? "/" : e.startsWith(`${be}/`) ? e.slice(be.length) || "/" : e || "/" : e || "/";
}
function st() {
  const e = Ur(), t = Wn(e);
  x.setRoute(t);
}
function He(e) {
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
function zt(e, t, n) {
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
function Wt(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function zr(e) {
  if (!H(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const i of e.requirements)
    for (const r of i) {
      const a = Wt(r.scheme);
      t.has(a) || (t.add(a), n.push(a));
    }
  return n;
}
function Vn(e) {
  const t = zr(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function Ee(e) {
  return H(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((i) => {
    const r = Wt(i.scheme);
    return i.scopes.length > 0 ? `${r} [${i.scopes.join(", ")}]` : r;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function gt(e, t, n, i) {
  const r = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!H(e)) return r;
  for (const s of e.requirements) {
    if (!s.every((p) => !!t[p.schemeName]) && s.length > 0) continue;
    const u = gn(s, t);
    if (Object.keys(u.headers).length > 0 || Object.keys(u.query).length > 0 || Object.keys(u.cookies).length > 0)
      return u;
  }
  return !i || !n ? r : gn([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: i });
}
function Wr(e) {
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
function Yn(e) {
  return typeof e > "u" || e === null;
}
function Vr(e) {
  return typeof e == "object" && e !== null;
}
function Yr(e) {
  return Array.isArray(e) ? e : Yn(e) ? [] : [e];
}
function Gr(e, t) {
  var n, i, r, a;
  if (t)
    for (a = Object.keys(t), n = 0, i = a.length; n < i; n += 1)
      r = a[n], e[r] = t[r];
  return e;
}
function Kr(e, t) {
  var n = "", i;
  for (i = 0; i < t; i += 1)
    n += e;
  return n;
}
function Jr(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
var Zr = Yn, Xr = Vr, Qr = Yr, ei = Kr, ti = Jr, ni = Gr, W = {
  isNothing: Zr,
  isObject: Xr,
  toArray: Qr,
  repeat: ei,
  isNegativeZero: ti,
  extend: ni
};
function Gn(e, t) {
  var n = "", i = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), i + " " + n) : i;
}
function Ue(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Gn(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Ue.prototype = Object.create(Error.prototype);
Ue.prototype.constructor = Ue;
Ue.prototype.toString = function(t) {
  return this.name + ": " + Gn(this, t);
};
var se = Ue;
function At(e, t, n, i, r) {
  var a = "", o = "", s = Math.floor(r / 2) - 1;
  return i - t > s && (a = " ... ", t = i - s + a.length), n - i > s && (o = " ...", n = i + s - o.length), {
    str: a + e.slice(t, n).replace(/\t/g, "→") + o,
    pos: i - t + a.length
    // relative position
  };
}
function Et(e, t) {
  return W.repeat(" ", t - e.length) + e;
}
function ri(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var n = /\r?\n|\r|\0/g, i = [0], r = [], a, o = -1; a = n.exec(e.buffer); )
    r.push(a.index), i.push(a.index + a[0].length), e.position <= a.index && o < 0 && (o = i.length - 2);
  o < 0 && (o = i.length - 1);
  var s = "", l, u, p = Math.min(e.line + t.linesAfter, r.length).toString().length, d = t.maxLength - (t.indent + p + 3);
  for (l = 1; l <= t.linesBefore && !(o - l < 0); l++)
    u = At(
      e.buffer,
      i[o - l],
      r[o - l],
      e.position - (i[o] - i[o - l]),
      d
    ), s = W.repeat(" ", t.indent) + Et((e.line - l + 1).toString(), p) + " | " + u.str + `
` + s;
  for (u = At(e.buffer, i[o], r[o], e.position, d), s += W.repeat(" ", t.indent) + Et((e.line + 1).toString(), p) + " | " + u.str + `
`, s += W.repeat("-", t.indent + p + 3 + u.pos) + `^
`, l = 1; l <= t.linesAfter && !(o + l >= r.length); l++)
    u = At(
      e.buffer,
      i[o + l],
      r[o + l],
      e.position - (i[o] - i[o + l]),
      d
    ), s += W.repeat(" ", t.indent) + Et((e.line + l + 1).toString(), p) + " | " + u.str + `
`;
  return s.replace(/\n$/, "");
}
var ii = ri, ai = [
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
], oi = [
  "scalar",
  "sequence",
  "mapping"
];
function si(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(i) {
      t[String(i)] = n;
    });
  }), t;
}
function ci(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (ai.indexOf(n) === -1)
      throw new se('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = si(t.styleAliases || null), oi.indexOf(this.kind) === -1)
    throw new se('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var U = ci;
function vn(e, t) {
  var n = [];
  return e[t].forEach(function(i) {
    var r = n.length;
    n.forEach(function(a, o) {
      a.tag === i.tag && a.kind === i.kind && a.multi === i.multi && (r = o);
    }), n[r] = i;
  }), n;
}
function li() {
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
function Mt(e) {
  return this.extend(e);
}
Mt.prototype.extend = function(t) {
  var n = [], i = [];
  if (t instanceof U)
    i.push(t);
  else if (Array.isArray(t))
    i = i.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (i = i.concat(t.explicit));
  else
    throw new se("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(a) {
    if (!(a instanceof U))
      throw new se("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (a.loadKind && a.loadKind !== "scalar")
      throw new se("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (a.multi)
      throw new se("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), i.forEach(function(a) {
    if (!(a instanceof U))
      throw new se("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var r = Object.create(Mt.prototype);
  return r.implicit = (this.implicit || []).concat(n), r.explicit = (this.explicit || []).concat(i), r.compiledImplicit = vn(r, "implicit"), r.compiledExplicit = vn(r, "explicit"), r.compiledTypeMap = li(r.compiledImplicit, r.compiledExplicit), r;
};
var ui = Mt, di = new U("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), pi = new U("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), fi = new U("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), mi = new ui({
  explicit: [
    di,
    pi,
    fi
  ]
});
function hi(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function gi() {
  return null;
}
function vi(e) {
  return e === null;
}
var yi = new U("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: hi,
  construct: gi,
  predicate: vi,
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
function bi(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function xi(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function ki(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Ci = new U("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: bi,
  construct: xi,
  predicate: ki,
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
function wi(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Si(e) {
  return 48 <= e && e <= 55;
}
function Ni(e) {
  return 48 <= e && e <= 57;
}
function Ai(e) {
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
          if (!wi(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
    if (r === "o") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!Si(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
  }
  if (r === "_") return !1;
  for (; n < t; n++)
    if (r = e[n], r !== "_") {
      if (!Ni(e.charCodeAt(n)))
        return !1;
      i = !0;
    }
  return !(!i || r === "_");
}
function Ei(e) {
  var t = e, n = 1, i;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), i = t[0], (i === "-" || i === "+") && (i === "-" && (n = -1), t = t.slice(1), i = t[0]), t === "0") return 0;
  if (i === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function Li(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !W.isNegativeZero(e);
}
var Ti = new U("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Ai,
  construct: Ei,
  predicate: Li,
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
}), Oi = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Ii(e) {
  return !(e === null || !Oi.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function qi(e) {
  var t, n;
  return t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
var $i = /^[-+]?[0-9]+e/;
function ji(e, t) {
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
  else if (W.isNegativeZero(e))
    return "-0.0";
  return n = e.toString(10), $i.test(n) ? n.replace("e", ".e") : n;
}
function Bi(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || W.isNegativeZero(e));
}
var Mi = new U("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Ii,
  construct: qi,
  predicate: Bi,
  represent: ji,
  defaultStyle: "lowercase"
}), Pi = mi.extend({
  implicit: [
    yi,
    Ci,
    Ti,
    Mi
  ]
}), Ri = Pi, Kn = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Jn = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Fi(e) {
  return e === null ? !1 : Kn.exec(e) !== null || Jn.exec(e) !== null;
}
function _i(e) {
  var t, n, i, r, a, o, s, l = 0, u = null, p, d, m;
  if (t = Kn.exec(e), t === null && (t = Jn.exec(e)), t === null) throw new Error("Date resolve error");
  if (n = +t[1], i = +t[2] - 1, r = +t[3], !t[4])
    return new Date(Date.UTC(n, i, r));
  if (a = +t[4], o = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (p = +t[10], d = +(t[11] || 0), u = (p * 60 + d) * 6e4, t[9] === "-" && (u = -u)), m = new Date(Date.UTC(n, i, r, a, o, s, l)), u && m.setTime(m.getTime() - u), m;
}
function Di(e) {
  return e.toISOString();
}
var Hi = new U("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Fi,
  construct: _i,
  instanceOf: Date,
  represent: Di
});
function Ui(e) {
  return e === "<<" || e === null;
}
var zi = new U("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Ui
}), Vt = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Wi(e) {
  if (e === null) return !1;
  var t, n, i = 0, r = e.length, a = Vt;
  for (n = 0; n < r; n++)
    if (t = a.indexOf(e.charAt(n)), !(t > 64)) {
      if (t < 0) return !1;
      i += 6;
    }
  return i % 8 === 0;
}
function Vi(e) {
  var t, n, i = e.replace(/[\r\n=]/g, ""), r = i.length, a = Vt, o = 0, s = [];
  for (t = 0; t < r; t++)
    t % 4 === 0 && t && (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)), o = o << 6 | a.indexOf(i.charAt(t));
  return n = r % 4 * 6, n === 0 ? (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)) : n === 18 ? (s.push(o >> 10 & 255), s.push(o >> 2 & 255)) : n === 12 && s.push(o >> 4 & 255), new Uint8Array(s);
}
function Yi(e) {
  var t = "", n = 0, i, r, a = e.length, o = Vt;
  for (i = 0; i < a; i++)
    i % 3 === 0 && i && (t += o[n >> 18 & 63], t += o[n >> 12 & 63], t += o[n >> 6 & 63], t += o[n & 63]), n = (n << 8) + e[i];
  return r = a % 3, r === 0 ? (t += o[n >> 18 & 63], t += o[n >> 12 & 63], t += o[n >> 6 & 63], t += o[n & 63]) : r === 2 ? (t += o[n >> 10 & 63], t += o[n >> 4 & 63], t += o[n << 2 & 63], t += o[64]) : r === 1 && (t += o[n >> 2 & 63], t += o[n << 4 & 63], t += o[64], t += o[64]), t;
}
function Gi(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var Ki = new U("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: Wi,
  construct: Vi,
  predicate: Gi,
  represent: Yi
}), Ji = Object.prototype.hasOwnProperty, Zi = Object.prototype.toString;
function Xi(e) {
  if (e === null) return !0;
  var t = [], n, i, r, a, o, s = e;
  for (n = 0, i = s.length; n < i; n += 1) {
    if (r = s[n], o = !1, Zi.call(r) !== "[object Object]") return !1;
    for (a in r)
      if (Ji.call(r, a))
        if (!o) o = !0;
        else return !1;
    if (!o) return !1;
    if (t.indexOf(a) === -1) t.push(a);
    else return !1;
  }
  return !0;
}
function Qi(e) {
  return e !== null ? e : [];
}
var ea = new U("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Xi,
  construct: Qi
}), ta = Object.prototype.toString;
function na(e) {
  if (e === null) return !0;
  var t, n, i, r, a, o = e;
  for (a = new Array(o.length), t = 0, n = o.length; t < n; t += 1) {
    if (i = o[t], ta.call(i) !== "[object Object]" || (r = Object.keys(i), r.length !== 1)) return !1;
    a[t] = [r[0], i[r[0]]];
  }
  return !0;
}
function ra(e) {
  if (e === null) return [];
  var t, n, i, r, a, o = e;
  for (a = new Array(o.length), t = 0, n = o.length; t < n; t += 1)
    i = o[t], r = Object.keys(i), a[t] = [r[0], i[r[0]]];
  return a;
}
var ia = new U("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: na,
  construct: ra
}), aa = Object.prototype.hasOwnProperty;
function oa(e) {
  if (e === null) return !0;
  var t, n = e;
  for (t in n)
    if (aa.call(n, t) && n[t] !== null)
      return !1;
  return !0;
}
function sa(e) {
  return e !== null ? e : {};
}
var ca = new U("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: oa,
  construct: sa
}), la = Ri.extend({
  implicit: [
    Hi,
    zi
  ],
  explicit: [
    Ki,
    ea,
    ia,
    ca
  ]
}), me = Object.prototype.hasOwnProperty, ct = 1, Zn = 2, Xn = 3, lt = 4, Lt = 1, ua = 2, yn = 3, da = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, pa = /[\x85\u2028\u2029]/, fa = /[,\[\]\{\}]/, Qn = /^(?:!|!!|![a-z\-]+!)$/i, er = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function bn(e) {
  return Object.prototype.toString.call(e);
}
function re(e) {
  return e === 10 || e === 13;
}
function ke(e) {
  return e === 9 || e === 32;
}
function G(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Se(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function ma(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function ha(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function ga(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function xn(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function va(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function tr(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
var nr = new Array(256), rr = new Array(256);
for (var Ce = 0; Ce < 256; Ce++)
  nr[Ce] = xn(Ce) ? 1 : 0, rr[Ce] = xn(Ce);
function ya(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || la, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function ir(e, t) {
  var n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = ii(n), new se(t, n);
}
function C(e, t) {
  throw ir(e, t);
}
function ut(e, t) {
  e.onWarning && e.onWarning.call(null, ir(e, t));
}
var kn = {
  YAML: function(t, n, i) {
    var r, a, o;
    t.version !== null && C(t, "duplication of %YAML directive"), i.length !== 1 && C(t, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(i[0]), r === null && C(t, "ill-formed argument of the YAML directive"), a = parseInt(r[1], 10), o = parseInt(r[2], 10), a !== 1 && C(t, "unacceptable YAML version of the document"), t.version = i[0], t.checkLineBreaks = o < 2, o !== 1 && o !== 2 && ut(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, i) {
    var r, a;
    i.length !== 2 && C(t, "TAG directive accepts exactly two arguments"), r = i[0], a = i[1], Qn.test(r) || C(t, "ill-formed tag handle (first argument) of the TAG directive"), me.call(t.tagMap, r) && C(t, 'there is a previously declared suffix for "' + r + '" tag handle'), er.test(a) || C(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      a = decodeURIComponent(a);
    } catch {
      C(t, "tag prefix is malformed: " + a);
    }
    t.tagMap[r] = a;
  }
};
function fe(e, t, n, i) {
  var r, a, o, s;
  if (t < n) {
    if (s = e.input.slice(t, n), i)
      for (r = 0, a = s.length; r < a; r += 1)
        o = s.charCodeAt(r), o === 9 || 32 <= o && o <= 1114111 || C(e, "expected valid JSON character");
    else da.test(s) && C(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function Cn(e, t, n, i) {
  var r, a, o, s;
  for (W.isObject(n) || C(e, "cannot merge mappings; the provided source object is unacceptable"), r = Object.keys(n), o = 0, s = r.length; o < s; o += 1)
    a = r[o], me.call(t, a) || (tr(t, a, n[a]), i[a] = !0);
}
function Ne(e, t, n, i, r, a, o, s, l) {
  var u, p;
  if (Array.isArray(r))
    for (r = Array.prototype.slice.call(r), u = 0, p = r.length; u < p; u += 1)
      Array.isArray(r[u]) && C(e, "nested arrays are not supported inside keys"), typeof r == "object" && bn(r[u]) === "[object Object]" && (r[u] = "[object Object]");
  if (typeof r == "object" && bn(r) === "[object Object]" && (r = "[object Object]"), r = String(r), t === null && (t = {}), i === "tag:yaml.org,2002:merge")
    if (Array.isArray(a))
      for (u = 0, p = a.length; u < p; u += 1)
        Cn(e, t, a[u], n);
    else
      Cn(e, t, a, n);
  else
    !e.json && !me.call(n, r) && me.call(t, r) && (e.line = o || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, C(e, "duplicated mapping key")), tr(t, r, a), delete n[r];
  return t;
}
function Yt(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : C(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function B(e, t, n) {
  for (var i = 0, r = e.input.charCodeAt(e.position); r !== 0; ) {
    for (; ke(r); )
      r === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
    if (t && r === 35)
      do
        r = e.input.charCodeAt(++e.position);
      while (r !== 10 && r !== 13 && r !== 0);
    if (re(r))
      for (Yt(e), r = e.input.charCodeAt(e.position), i++, e.lineIndent = 0; r === 32; )
        e.lineIndent++, r = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && i !== 0 && e.lineIndent < n && ut(e, "deficient indentation"), i;
}
function vt(e) {
  var t = e.position, n;
  return n = e.input.charCodeAt(t), !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || G(n)));
}
function Gt(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += W.repeat(`
`, t - 1));
}
function ba(e, t, n) {
  var i, r, a, o, s, l, u, p, d = e.kind, m = e.result, f;
  if (f = e.input.charCodeAt(e.position), G(f) || Se(f) || f === 35 || f === 38 || f === 42 || f === 33 || f === 124 || f === 62 || f === 39 || f === 34 || f === 37 || f === 64 || f === 96 || (f === 63 || f === 45) && (r = e.input.charCodeAt(e.position + 1), G(r) || n && Se(r)))
    return !1;
  for (e.kind = "scalar", e.result = "", a = o = e.position, s = !1; f !== 0; ) {
    if (f === 58) {
      if (r = e.input.charCodeAt(e.position + 1), G(r) || n && Se(r))
        break;
    } else if (f === 35) {
      if (i = e.input.charCodeAt(e.position - 1), G(i))
        break;
    } else {
      if (e.position === e.lineStart && vt(e) || n && Se(f))
        break;
      if (re(f))
        if (l = e.line, u = e.lineStart, p = e.lineIndent, B(e, !1, -1), e.lineIndent >= t) {
          s = !0, f = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = o, e.line = l, e.lineStart = u, e.lineIndent = p;
          break;
        }
    }
    s && (fe(e, a, o, !1), Gt(e, e.line - l), a = o = e.position, s = !1), ke(f) || (o = e.position + 1), f = e.input.charCodeAt(++e.position);
  }
  return fe(e, a, o, !1), e.result ? !0 : (e.kind = d, e.result = m, !1);
}
function xa(e, t) {
  var n, i, r;
  if (n = e.input.charCodeAt(e.position), n !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, i = r = e.position; (n = e.input.charCodeAt(e.position)) !== 0; )
    if (n === 39)
      if (fe(e, i, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39)
        i = e.position, e.position++, r = e.position;
      else
        return !0;
    else re(n) ? (fe(e, i, r, !0), Gt(e, B(e, !1, t)), i = r = e.position) : e.position === e.lineStart && vt(e) ? C(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position);
  C(e, "unexpected end of the stream within a single quoted scalar");
}
function ka(e, t) {
  var n, i, r, a, o, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return fe(e, n, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (fe(e, n, e.position, !0), s = e.input.charCodeAt(++e.position), re(s))
        B(e, !1, t);
      else if (s < 256 && nr[s])
        e.result += rr[s], e.position++;
      else if ((o = ha(s)) > 0) {
        for (r = o, a = 0; r > 0; r--)
          s = e.input.charCodeAt(++e.position), (o = ma(s)) >= 0 ? a = (a << 4) + o : C(e, "expected hexadecimal character");
        e.result += va(a), e.position++;
      } else
        C(e, "unknown escape sequence");
      n = i = e.position;
    } else re(s) ? (fe(e, n, i, !0), Gt(e, B(e, !1, t)), n = i = e.position) : e.position === e.lineStart && vt(e) ? C(e, "unexpected end of the document within a double quoted scalar") : (e.position++, i = e.position);
  }
  C(e, "unexpected end of the stream within a double quoted scalar");
}
function Ca(e, t) {
  var n = !0, i, r, a, o = e.tag, s, l = e.anchor, u, p, d, m, f, h = /* @__PURE__ */ Object.create(null), g, v, b, y;
  if (y = e.input.charCodeAt(e.position), y === 91)
    p = 93, f = !1, s = [];
  else if (y === 123)
    p = 125, f = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), y = e.input.charCodeAt(++e.position); y !== 0; ) {
    if (B(e, !0, t), y = e.input.charCodeAt(e.position), y === p)
      return e.position++, e.tag = o, e.anchor = l, e.kind = f ? "mapping" : "sequence", e.result = s, !0;
    n ? y === 44 && C(e, "expected the node content, but found ','") : C(e, "missed comma between flow collection entries"), v = g = b = null, d = m = !1, y === 63 && (u = e.input.charCodeAt(e.position + 1), G(u) && (d = m = !0, e.position++, B(e, !0, t))), i = e.line, r = e.lineStart, a = e.position, Te(e, t, ct, !1, !0), v = e.tag, g = e.result, B(e, !0, t), y = e.input.charCodeAt(e.position), (m || e.line === i) && y === 58 && (d = !0, y = e.input.charCodeAt(++e.position), B(e, !0, t), Te(e, t, ct, !1, !0), b = e.result), f ? Ne(e, s, h, v, g, b, i, r, a) : d ? s.push(Ne(e, null, h, v, g, b, i, r, a)) : s.push(g), B(e, !0, t), y = e.input.charCodeAt(e.position), y === 44 ? (n = !0, y = e.input.charCodeAt(++e.position)) : n = !1;
  }
  C(e, "unexpected end of the stream within a flow collection");
}
function wa(e, t) {
  var n, i, r = Lt, a = !1, o = !1, s = t, l = 0, u = !1, p, d;
  if (d = e.input.charCodeAt(e.position), d === 124)
    i = !1;
  else if (d === 62)
    i = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; d !== 0; )
    if (d = e.input.charCodeAt(++e.position), d === 43 || d === 45)
      Lt === r ? r = d === 43 ? yn : ua : C(e, "repeat of a chomping mode identifier");
    else if ((p = ga(d)) >= 0)
      p === 0 ? C(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : o ? C(e, "repeat of an indentation width identifier") : (s = t + p - 1, o = !0);
    else
      break;
  if (ke(d)) {
    do
      d = e.input.charCodeAt(++e.position);
    while (ke(d));
    if (d === 35)
      do
        d = e.input.charCodeAt(++e.position);
      while (!re(d) && d !== 0);
  }
  for (; d !== 0; ) {
    for (Yt(e), e.lineIndent = 0, d = e.input.charCodeAt(e.position); (!o || e.lineIndent < s) && d === 32; )
      e.lineIndent++, d = e.input.charCodeAt(++e.position);
    if (!o && e.lineIndent > s && (s = e.lineIndent), re(d)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      r === yn ? e.result += W.repeat(`
`, a ? 1 + l : l) : r === Lt && a && (e.result += `
`);
      break;
    }
    for (i ? ke(d) ? (u = !0, e.result += W.repeat(`
`, a ? 1 + l : l)) : u ? (u = !1, e.result += W.repeat(`
`, l + 1)) : l === 0 ? a && (e.result += " ") : e.result += W.repeat(`
`, l) : e.result += W.repeat(`
`, a ? 1 + l : l), a = !0, o = !0, l = 0, n = e.position; !re(d) && d !== 0; )
      d = e.input.charCodeAt(++e.position);
    fe(e, n, e.position, !1);
  }
  return !0;
}
function wn(e, t) {
  var n, i = e.tag, r = e.anchor, a = [], o, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = a), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, C(e, "tab characters must not be used in indentation")), !(l !== 45 || (o = e.input.charCodeAt(e.position + 1), !G(o)))); ) {
    if (s = !0, e.position++, B(e, !0, -1) && e.lineIndent <= t) {
      a.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (n = e.line, Te(e, t, Xn, !1, !0), a.push(e.result), B(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && l !== 0)
      C(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = i, e.anchor = r, e.kind = "sequence", e.result = a, !0) : !1;
}
function Sa(e, t, n) {
  var i, r, a, o, s, l, u = e.tag, p = e.anchor, d = {}, m = /* @__PURE__ */ Object.create(null), f = null, h = null, g = null, v = !1, b = !1, y;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = d), y = e.input.charCodeAt(e.position); y !== 0; ) {
    if (!v && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, C(e, "tab characters must not be used in indentation")), i = e.input.charCodeAt(e.position + 1), a = e.line, (y === 63 || y === 58) && G(i))
      y === 63 ? (v && (Ne(e, d, m, f, h, null, o, s, l), f = h = g = null), b = !0, v = !0, r = !0) : v ? (v = !1, r = !0) : C(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, y = i;
    else {
      if (o = e.line, s = e.lineStart, l = e.position, !Te(e, n, Zn, !1, !0))
        break;
      if (e.line === a) {
        for (y = e.input.charCodeAt(e.position); ke(y); )
          y = e.input.charCodeAt(++e.position);
        if (y === 58)
          y = e.input.charCodeAt(++e.position), G(y) || C(e, "a whitespace character is expected after the key-value separator within a block mapping"), v && (Ne(e, d, m, f, h, null, o, s, l), f = h = g = null), b = !0, v = !1, r = !1, f = e.tag, h = e.result;
        else if (b)
          C(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = u, e.anchor = p, !0;
      } else if (b)
        C(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = u, e.anchor = p, !0;
    }
    if ((e.line === a || e.lineIndent > t) && (v && (o = e.line, s = e.lineStart, l = e.position), Te(e, t, lt, !0, r) && (v ? h = e.result : g = e.result), v || (Ne(e, d, m, f, h, g, o, s, l), f = h = g = null), B(e, !0, -1), y = e.input.charCodeAt(e.position)), (e.line === a || e.lineIndent > t) && y !== 0)
      C(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return v && Ne(e, d, m, f, h, null, o, s, l), b && (e.tag = u, e.anchor = p, e.kind = "mapping", e.result = d), b;
}
function Na(e) {
  var t, n = !1, i = !1, r, a, o;
  if (o = e.input.charCodeAt(e.position), o !== 33) return !1;
  if (e.tag !== null && C(e, "duplication of a tag property"), o = e.input.charCodeAt(++e.position), o === 60 ? (n = !0, o = e.input.charCodeAt(++e.position)) : o === 33 ? (i = !0, r = "!!", o = e.input.charCodeAt(++e.position)) : r = "!", t = e.position, n) {
    do
      o = e.input.charCodeAt(++e.position);
    while (o !== 0 && o !== 62);
    e.position < e.length ? (a = e.input.slice(t, e.position), o = e.input.charCodeAt(++e.position)) : C(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; o !== 0 && !G(o); )
      o === 33 && (i ? C(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(t - 1, e.position + 1), Qn.test(r) || C(e, "named tag handle cannot contain such characters"), i = !0, t = e.position + 1)), o = e.input.charCodeAt(++e.position);
    a = e.input.slice(t, e.position), fa.test(a) && C(e, "tag suffix cannot contain flow indicator characters");
  }
  a && !er.test(a) && C(e, "tag name cannot contain such characters: " + a);
  try {
    a = decodeURIComponent(a);
  } catch {
    C(e, "tag name is malformed: " + a);
  }
  return n ? e.tag = a : me.call(e.tagMap, r) ? e.tag = e.tagMap[r] + a : r === "!" ? e.tag = "!" + a : r === "!!" ? e.tag = "tag:yaml.org,2002:" + a : C(e, 'undeclared tag handle "' + r + '"'), !0;
}
function Aa(e) {
  var t, n;
  if (n = e.input.charCodeAt(e.position), n !== 38) return !1;
  for (e.anchor !== null && C(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !G(n) && !Se(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && C(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function Ea(e) {
  var t, n, i;
  if (i = e.input.charCodeAt(e.position), i !== 42) return !1;
  for (i = e.input.charCodeAt(++e.position), t = e.position; i !== 0 && !G(i) && !Se(i); )
    i = e.input.charCodeAt(++e.position);
  return e.position === t && C(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), me.call(e.anchorMap, n) || C(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], B(e, !0, -1), !0;
}
function Te(e, t, n, i, r) {
  var a, o, s, l = 1, u = !1, p = !1, d, m, f, h, g, v;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, a = o = s = lt === n || Xn === n, i && B(e, !0, -1) && (u = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; Na(e) || Aa(e); )
      B(e, !0, -1) ? (u = !0, s = a, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = u || r), (l === 1 || lt === n) && (ct === n || Zn === n ? g = t : g = t + 1, v = e.position - e.lineStart, l === 1 ? s && (wn(e, v) || Sa(e, v, g)) || Ca(e, g) ? p = !0 : (o && wa(e, g) || xa(e, g) || ka(e, g) ? p = !0 : Ea(e) ? (p = !0, (e.tag !== null || e.anchor !== null) && C(e, "alias node should not have any properties")) : ba(e, g, ct === n) && (p = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (p = s && wn(e, v))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && C(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), d = 0, m = e.implicitTypes.length; d < m; d += 1)
      if (h = e.implicitTypes[d], h.resolve(e.result)) {
        e.result = h.construct(e.result), e.tag = h.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (me.call(e.typeMap[e.kind || "fallback"], e.tag))
      h = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (h = null, f = e.typeMap.multi[e.kind || "fallback"], d = 0, m = f.length; d < m; d += 1)
        if (e.tag.slice(0, f[d].tag.length) === f[d].tag) {
          h = f[d];
          break;
        }
    h || C(e, "unknown tag !<" + e.tag + ">"), e.result !== null && h.kind !== e.kind && C(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + h.kind + '", not "' + e.kind + '"'), h.resolve(e.result, e.tag) ? (e.result = h.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : C(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || p;
}
function La(e) {
  var t = e.position, n, i, r, a = !1, o;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (o = e.input.charCodeAt(e.position)) !== 0 && (B(e, !0, -1), o = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || o !== 37)); ) {
    for (a = !0, o = e.input.charCodeAt(++e.position), n = e.position; o !== 0 && !G(o); )
      o = e.input.charCodeAt(++e.position);
    for (i = e.input.slice(n, e.position), r = [], i.length < 1 && C(e, "directive name must not be less than one character in length"); o !== 0; ) {
      for (; ke(o); )
        o = e.input.charCodeAt(++e.position);
      if (o === 35) {
        do
          o = e.input.charCodeAt(++e.position);
        while (o !== 0 && !re(o));
        break;
      }
      if (re(o)) break;
      for (n = e.position; o !== 0 && !G(o); )
        o = e.input.charCodeAt(++e.position);
      r.push(e.input.slice(n, e.position));
    }
    o !== 0 && Yt(e), me.call(kn, i) ? kn[i](e, i, r) : ut(e, 'unknown document directive "' + i + '"');
  }
  if (B(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, B(e, !0, -1)) : a && C(e, "directives end mark is expected"), Te(e, e.lineIndent - 1, lt, !1, !0), B(e, !0, -1), e.checkLineBreaks && pa.test(e.input.slice(t, e.position)) && ut(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && vt(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, B(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    C(e, "end of the stream or a document separator is expected");
  else
    return;
}
function Ta(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var n = new ya(e, t), i = e.indexOf("\0");
  for (i !== -1 && (n.position = i, C(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    La(n);
  return n.documents;
}
function Oa(e, t) {
  var n = Ta(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new se("expected a single document in the stream, but found more");
  }
}
var Ia = Oa, qa = {
  load: Ia
}, $a = qa.load;
const ja = 50, Ba = 200;
function Ma(e) {
  const t = Pa(e.info || {}), n = Ra(e.servers || []), i = e.components || {}, r = Da(i.schemas || {}, e), a = Fa(i.securitySchemes || {}), o = He(e.security), s = e.paths || {}, l = {};
  for (const [m, f] of Object.entries(s))
    m.startsWith("/docs") || (l[m] = f);
  const u = Ha(l, e, o, a), p = Va(u, e.tags || []), d = Ua(e.webhooks || {}, e, o, a);
  return { raw: e, info: t, servers: n, tags: p, operations: u, schemas: r, securitySchemes: a, webhooks: d };
}
function Pa(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function Ra(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function Fa(e) {
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
const _e = /* @__PURE__ */ new Map();
let Kt = 0;
function _a(e, t) {
  if (_e.has(e)) return _e.get(e);
  if (++Kt > Ba) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((r) => decodeURIComponent(r.replace(/~1/g, "/").replace(/~0/g, "~")));
  let i = t;
  for (const r of n)
    if (i && typeof i == "object" && !Array.isArray(i))
      i = i[r];
    else
      return;
  return _e.set(e, i), i;
}
function Y(e, t, n = 0, i = /* @__PURE__ */ new Set()) {
  if (n > ja || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((o) => Y(o, t, n + 1, i));
  const r = e;
  if (typeof r.$ref == "string") {
    const o = r.$ref;
    if (i.has(o)) return { type: "object", description: "[Circular reference]" };
    const s = new Set(i);
    s.add(o);
    const l = _a(o, t);
    return l && typeof l == "object" ? Y(l, t, n + 1, s) : l;
  }
  const a = {};
  for (const [o, s] of Object.entries(r))
    a[o] = Y(s, t, n + 1, i);
  return a;
}
function Da(e, t) {
  _e.clear(), Kt = 0;
  const n = {};
  for (const [i, r] of Object.entries(e))
    n[i] = Y(r, t);
  return n;
}
function Ha(e, t, n, i) {
  _e.clear(), Kt = 0;
  const r = [], a = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = He(s.security), u = Array.isArray(s.parameters) ? s.parameters.map((p) => Y(p, t)) : [];
    for (const p of a) {
      const d = s[p];
      if (!d) continue;
      const m = ar(
        p,
        o,
        d,
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
function ar(e, t, n, i, r, a = void 0, o = void 0, s = {}) {
  const l = Array.isArray(n.parameters) ? n.parameters.map((k) => Y(k, r)) : [], u = [...i];
  for (const k of l) {
    const E = u.findIndex((w) => w.name === k.name && w.in === k.in);
    E >= 0 ? u[E] = k : u.push(k);
  }
  const p = or(u, r);
  let d = sr(n.requestBody, r);
  if (Array.isArray(n["x-doc-examples"])) {
    const k = n["x-doc-examples"], E = [];
    for (let w = 0; w < k.length; w++) {
      const q = k[w], S = q.scenario ? String(q.scenario) : `Example ${w + 1}`, I = q.request?.body;
      I !== void 0 && E.push({ summary: S, value: I });
    }
    if (E.length > 0) {
      d || (d = { required: !1, content: {} });
      const w = d.content["application/json"] || d.content["application/vnd.api+json"] || {};
      d.content["application/json"] || (d.content["application/json"] = w);
      const q = d.content["application/json"];
      q.examples || (q.examples = {});
      for (let S = 0; S < E.length; S++) {
        const $ = E[S], J = `${$.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${S}`.replace(/^-/, "");
        q.examples[J] = { summary: $.summary, description: $.summary, value: $.value };
      }
    }
  }
  const m = cr(n.responses, r), f = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], h = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), g = Object.prototype.hasOwnProperty.call(n, "security"), v = He(n.security), b = g ? v : a ?? o, y = g && Array.isArray(v) && v.length === 0, L = Wa(n.callbacks, r, s), O = {
    operationId: h,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: f,
    deprecated: !!n.deprecated,
    security: b,
    resolvedSecurity: zt(b, s, y),
    parameters: p,
    requestBody: d,
    responses: m
  };
  return L.length > 0 && (O.callbacks = L), O;
}
function Ua(e, t, n, i) {
  if (!e || typeof e != "object") return [];
  const r = [], a = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = Y(s, t), u = He(l.security);
    for (const p of a) {
      const d = l[p];
      if (!d) continue;
      const m = Object.prototype.hasOwnProperty.call(d, "security"), f = He(d.security), h = m ? f : u ?? n, g = m && Array.isArray(f) && f.length === 0, v = Array.isArray(d.parameters) ? d.parameters.map((O) => Y(O, t)) : [], b = or(v, t), y = sr(d.requestBody, t), L = cr(d.responses, t);
      r.push({
        name: o,
        method: p,
        path: o,
        summary: d.summary ? String(d.summary) : void 0,
        description: d.description ? String(d.description) : void 0,
        security: h,
        resolvedSecurity: zt(h, i, g),
        parameters: b,
        requestBody: y,
        responses: L
      });
    }
  }
  return r;
}
function or(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? Y(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? ur(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function sr(e, t) {
  if (!e) return;
  const n = Y(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: lr(n.content || {}, t)
  };
}
function za(e, t) {
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
function cr(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [i, r] of Object.entries(e)) {
    const a = Y(r, t), o = a.headers;
    n[i] = {
      statusCode: i,
      description: a.description ? String(a.description) : void 0,
      headers: o ? za(o, t) : void 0,
      content: a.content ? lr(a.content, t) : void 0
    };
  }
  return n;
}
function Wa(e, t, n) {
  if (!e || typeof e != "object") return [];
  const i = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [a, o] of Object.entries(e)) {
    const s = Y(o, t);
    if (!s || typeof s != "object") continue;
    const l = [];
    for (const [u, p] of Object.entries(s))
      if (!(!p || typeof p != "object"))
        for (const d of r) {
          const m = p[d];
          m && l.push(ar(d, u, m, [], t, void 0, void 0, n));
        }
    l.length > 0 && i.push({ name: a, operations: l });
  }
  return i;
}
function lr(e, t) {
  const n = {};
  for (const [i, r] of Object.entries(e)) {
    const a = r;
    n[i] = {
      schema: a.schema ? Y(a.schema, t) : void 0,
      example: a.example,
      examples: a.examples ? ur(a.examples) : void 0
    };
  }
  return n;
}
function ur(e) {
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
function Va(e, t) {
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
function ye(e) {
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
          const t = ye(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, i] of Object.entries(e.properties))
            t[n] = ye(i);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const i = ye(n);
            i && typeof i == "object" && !Array.isArray(i) && Object.assign(t, i);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return ye(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return ye(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, i] of Object.entries(e.properties))
            t[n] = ye(i);
          return t;
        }
        return;
    }
  }
}
async function Ya(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return $a(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let we = [];
const Sn = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function Ga(e) {
  we = [];
  for (const t of e.tags)
    we.push({
      type: "tag",
      title: t.name,
      subtitle: t.description,
      tag: t.name,
      keywords: `${t.name} ${t.description || ""}`.toLowerCase()
    });
  for (const t of e.operations)
    we.push({
      type: "operation",
      title: t.summary || t.operationId,
      subtitle: t.path,
      method: t.method,
      requiresAuth: H(t.resolvedSecurity),
      authBadge: Vn(t.resolvedSecurity) || void 0,
      authTitle: H(t.resolvedSecurity) ? Ee(t.resolvedSecurity) : void 0,
      resolvedSecurity: t.resolvedSecurity,
      path: t.path,
      tag: t.tags[0],
      operationId: t.operationId,
      keywords: `${t.method} ${t.path} ${t.summary || ""} ${t.description || ""} ${t.operationId} ${t.tags.join(" ")}`.toLowerCase()
    });
  for (const [t, n] of Object.entries(e.schemas))
    we.push({
      type: "schema",
      title: t,
      subtitle: n.description || "Schema",
      schemaName: t,
      keywords: `${t} ${n.description || ""} schema model`.toLowerCase()
    });
  if (e.webhooks)
    for (const t of e.webhooks)
      we.push({
        type: "webhook",
        title: t.summary || t.name,
        subtitle: `${t.method.toUpperCase()} Webhook`,
        method: t.method,
        webhookName: t.name,
        keywords: `${t.name} ${t.method} ${t.summary || ""} ${t.description || ""} webhook`.toLowerCase()
      });
}
function Ka(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), i = [];
  for (const r of we) {
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
const dr = "puredocs-theme";
function Nn(e, t, n) {
  const i = e.classList.contains("light") || e.classList.contains("dark");
  i && e.classList.add("theme-transitioning"), e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color"), i && setTimeout(() => e.classList.remove("theme-transitioning"), 550);
}
function Ja() {
  const t = x.get().theme === "light" ? "dark" : "light";
  x.set({ theme: t });
  try {
    localStorage.setItem(dr, t);
  } catch {
  }
}
function Za(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(dr);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function pr(e) {
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
function Pe(e, ...t) {
  D(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
async function Xa(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function Qa(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], i = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** i).toFixed(i > 0 ? 1 : 0)} ${n[i]}`;
}
function eo(e) {
  return e < 1e3 ? `${Math.round(e)} ms` : `${(e / 1e3).toFixed(2)} s`;
}
const R = (e, t) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${1.75}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, T = {
  search: R('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  close: R('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: R('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  chevronDown: R('<path d="m6 9 6 6 6-6"/>'),
  chevronRight: R('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: R('<path d="m15 18-6-6 6-6"/>'),
  sun: R('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: R('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  copy: R('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  check: R('<path d="M20 6 9 17l-5-5"/>'),
  /** Closed padlock — requires auth (red) */
  lock: R('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>'),
  /** Open padlock — auth configured (green) */
  unlock: R('<rect width="14" height="11" x="5" y="11" rx="2" ry="2"/><path d="M16 11V7a4 4 0 1 0-8 0v1"/>'),
  send: R('<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>'),
  key: R('<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>'),
  globe: R('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  server: R('<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>'),
  warning: R('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  settings: R('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>')
};
function to(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function yt(e) {
  return to(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function fr(e) {
  return String(e || "").replace(/\/$/, "");
}
function Jt(e) {
  return fr(e).replace(/^https?:\/\//i, "");
}
function no(e) {
  return fr(yt(e));
}
function mr(e) {
  return Jt(yt(e));
}
function dt(e) {
  const { options: t, value: n, ariaLabel: i, onChange: r, className: a, variant: o = "default", invalid: s, dataAttrs: l } = e, u = document.createElement("select");
  o === "inline" && u.setAttribute("data-variant", "inline");
  const p = [];
  if (s && p.push("invalid"), a && p.push(a), u.className = p.join(" "), i && u.setAttribute("aria-label", i), l)
    for (const [d, m] of Object.entries(l))
      u.dataset[d] = m;
  for (const d of t) {
    const m = document.createElement("option");
    m.value = d.value, m.textContent = d.label, n !== void 0 && d.value === n && (m.selected = !0), u.appendChild(m);
  }
  return r && u.addEventListener("change", () => r(u.value)), u;
}
function he(e) {
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
    className: p,
    onInput: d,
    onChange: m
  } = e, f = document.createElement("input");
  f.type = t;
  const h = [];
  if (l?.includes("filled") && h.push("filled"), s && h.push("invalid"), p && h.push(p), f.className = h.join(" "), n && (f.placeholder = n), i !== void 0 && (f.value = i), r && f.setAttribute("aria-label", r), a && (f.required = !0), o && (f.readOnly = !0), u)
    for (const [g, v] of Object.entries(u))
      f.dataset[g] = v;
  return d && f.addEventListener("input", () => d(f.value)), m && f.addEventListener("change", () => m(f.value)), f;
}
const ro = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function io(e = "secondary") {
  return ["btn", ...ro[e]];
}
function ie(e) {
  const { variant: t = "secondary", label: n, icon: i, ariaLabel: r, disabled: a, className: o, onClick: s } = e, l = document.createElement("button");
  l.type = "button";
  const u = io(t);
  if (o && u.push(...o.split(/\s+/).filter(Boolean)), l.className = u.join(" "), i) {
    const p = document.createElement("span");
    p.className = "btn-icon-slot", p.innerHTML = i, l.appendChild(p);
  }
  if (n) {
    const p = document.createElement("span");
    p.textContent = n, l.appendChild(p);
  }
  return r && l.setAttribute("aria-label", r), a && (l.disabled = !0), s && l.addEventListener("click", s), l;
}
function hr(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : e === "primary" ? "u-text-accent" : `u-text-${e}`;
}
function Zt(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : e === "primary" ? "u-bg-accent-soft" : `u-bg-${e}-soft`;
}
function ao(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function gr(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function oo(e, t) {
  return e.color ? e.color : t === "method" ? ao(e.method || e.text) : t === "status" ? gr(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function N(e) {
  const t = document.createElement("span"), n = e.kind || "chip", i = oo(e, n), a = ["badge", e.size || "m"];
  return n === "status" && a.push("status"), n === "required" && a.push("required"), a.push(hr(i), Zt(i)), e.className && a.push(e.className), t.className = a.join(" "), t.textContent = e.text, t;
}
function pt(e, t) {
  const n = t?.active ?? !1, i = t?.context ?? !1, r = document.createElement("button");
  return r.type = "button", r.className = `badge m interactive${n ? " is-active" : ""}`, i && (r.dataset.badgeContext = "true"), r.textContent = e, r;
}
function so(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const i = gr(e), r = ["badge", "status", "m", "interactive", hr(i)];
  return t && r.push("is-active", Zt(i)), n.className = r.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = i, n.textContent = e, n;
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
  e.classList.add(Zt(n));
}
function ce(e) {
  const { simple: t, interactive: n, active: i, className: r, onClick: a } = e || {}, o = document.createElement("div"), s = ["card"];
  return t && s.push("simple"), n && s.push("interactive"), i && s.push("active"), r && s.push(r), o.className = s.join(" "), a && (o.classList.contains("interactive") || o.classList.add("interactive"), o.addEventListener("click", a)), o;
}
function Xt(...e) {
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
function Qt(e) {
  const t = document.createElement("div");
  if (t.className = `card-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append(En(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? N({ text: String(e.trailing), kind: "chip", size: "m" }) : En(e.trailing);
    t.append(n);
  }
  return t;
}
function co(e) {
  return typeof e == "string" ? c("span", { textContent: e }) : e;
}
function vr(e) {
  return c("h2", { textContent: e });
}
function en(e, t) {
  const n = c("div", { className: "section-head" });
  return n.append(typeof e == "string" ? vr(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? N({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function V(e, ...t) {
  const n = c("div", { className: `block section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(en(e.title, e.badge)) : n.append(vr(e.title)));
  for (const i of t) n.append(co(i));
  return n;
}
function tn(e, t) {
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
function nn(e) {
  const { configured: t, variant: n = "tag", title: i } = e, r = t ? T.unlock : T.lock, a = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-meta-icon", o = n !== "endpoint" ? ` ${a}--${t ? "configured" : "required"}` : "";
  return c("span", {
    className: `${a}${o}`.trim(),
    innerHTML: r,
    ...i ? { title: i, "aria-label": i } : {}
  });
}
function yr(e) {
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
let Le = null, Pt = null;
function br() {
  Pt?.(), Pt = null;
}
function Tt() {
  br(), Le && Le.close(), Le = null;
}
function lo(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function uo(e) {
  return Wt(e);
}
function Ze(e) {
  requestAnimationFrame(() => e.focus());
}
function Ot(e, t) {
  const n = c("div", { className: "modal field" });
  return n.append(c("label", { className: "modal label", textContent: e }), t), n;
}
function Re(e) {
  return he({
    className: "modal input",
    placeholder: e.placeholder,
    value: e.value,
    ariaLabel: e.ariaLabel,
    type: e.type
  });
}
function po(e) {
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
function fo(e) {
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
function mo(e) {
  if (!e) return { username: "", password: "" };
  try {
    const n = fo(e).split(":");
    return {
      username: n[0] || "",
      password: n.slice(1).join(":") || ""
    };
  } catch {
    return { username: "", password: "" };
  }
}
function It(e, t, n) {
  D(n);
  const i = x.get().auth.schemes[e] || "", r = t.type, a = (t.scheme || "").toLowerCase();
  if (r === "http" && a === "bearer") {
    const o = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = Re({
      placeholder: "Bearer token...",
      value: i,
      ariaLabel: "Bearer token",
      type: "password"
    }), u = ie({
      variant: "icon",
      icon: T.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => x.setSchemeValue(e, l.value)), s.append(l, u), o.append(c("label", { className: "modal label", textContent: "Token" }), s), n.append(o), Ze(l);
  } else if (r === "http" && a === "basic") {
    const o = mo(i), s = Re({
      placeholder: "Username",
      value: o.username,
      ariaLabel: "Username"
    });
    n.append(Ot("Username", s));
    const l = Re({
      placeholder: "Password",
      value: o.password,
      ariaLabel: "Password",
      type: "password"
    });
    n.append(Ot("Password", l));
    const u = () => {
      const p = `${s.value}:${l.value}`, d = p === ":" ? "" : po(p);
      x.setSchemeValue(e, d);
    };
    s.addEventListener("input", u), l.addEventListener("input", u), Ze(s);
  } else if (r === "apiKey") {
    const o = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = Re({
      placeholder: `${t.name || "API key"}...`,
      value: i,
      ariaLabel: "API key",
      type: "password"
    }), u = ie({
      variant: "icon",
      icon: T.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => {
      x.setSchemeValue(e, l.value);
    }), s.append(l, u), o.append(c("label", { className: "modal label", textContent: `API Key (${t.name || "key"})` }), s), n.append(o), Ze(l);
  } else {
    const o = Re({
      placeholder: "Token...",
      value: i,
      ariaLabel: "Token",
      type: "password"
    });
    o.addEventListener("input", () => {
      x.setSchemeValue(e, o.value);
    }), n.append(Ot("Token / Credential", o)), Ze(o);
  }
}
function xr(e, t, n) {
  Le && Tt();
  const i = Object.entries(e);
  if (i.length === 0) return;
  const r = yr({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Authentication Settings",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      br(), Le = null;
    }
  });
  Le = r;
  const a = r.modal, o = c("div", { className: "modal header" });
  o.append(c("h2", { className: "modal title", textContent: "Authentication" }));
  const s = ie({ variant: "icon", icon: T.close, ariaLabel: "Close", onClick: Tt });
  o.append(s), a.append(o);
  const l = c("div", { className: "modal body" });
  let u = n || x.get().auth.activeScheme || i[0][0];
  e[u] || (u = i[0][0]);
  const p = c("div", { className: "modal fields" });
  if (i.length > 1) {
    const b = c("div", { className: "modal tabs" }), y = /* @__PURE__ */ new Map(), L = [], O = (k, E, w) => {
      const q = rn(E);
      if (k.setAttribute("data-configured", q ? "true" : "false"), D(k), q) {
        const S = c("span", { className: "modal tab-check", "aria-hidden": "true" });
        S.innerHTML = T.check, k.append(S);
      }
      k.append(c("span", { className: "modal tab-label", textContent: uo(w) }));
    };
    for (const [k, E] of i) {
      const w = c("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": k === u ? "true" : "false"
      });
      O(w, k, E), w.addEventListener("click", () => {
        if (u !== k) {
          u = k;
          for (const q of L) q.setAttribute("aria-pressed", "false");
          w.setAttribute("aria-pressed", "true"), m(), It(k, E, p);
        }
      }), y.set(k, w), L.push(w), b.append(w);
    }
    Pt = x.subscribe(() => {
      for (const [k, E] of i) {
        const w = y.get(k);
        w && O(w, k, E);
      }
    }), l.append(b);
  }
  const d = c("div", { className: "modal scheme-desc" });
  function m() {
    const b = e[u];
    if (!b) return;
    D(d);
    const y = c("div", { className: "modal scheme-title", textContent: lo(b) });
    d.append(y), b.description && d.append(c("div", { className: "modal scheme-text", textContent: b.description }));
  }
  m(), l.append(d);
  const f = e[u];
  f && It(u, f, p), l.append(p), a.append(l);
  const h = c("div", { className: "modal footer" }), g = ie({
    variant: "ghost",
    label: "Reset",
    onClick: () => {
      x.setSchemeValue(u, "");
      const b = e[u];
      b && It(u, b, p);
    }
  }), v = ie({ variant: "primary", label: "Done", onClick: Tt });
  h.append(g, c("div", { className: "grow" }), v), a.append(h), r.mount(t ?? document.querySelector(".root") ?? document.body);
}
function rn(e) {
  return !!x.get().auth.schemes[e];
}
function an(e, t) {
  const n = ze(e, t), i = x.get().auth, r = gt(n, i.schemes, i.activeScheme, i.token);
  return Object.keys(r.headers).length > 0 || Object.keys(r.query).length > 0 || Object.keys(r.cookies).length > 0;
}
function on(e, t) {
  const n = ze(e, t), i = x.get().auth;
  return gt(n, i.schemes, i.activeScheme, i.token).headers;
}
function ho(e, t) {
  const n = ze(e, t), i = x.get().auth;
  return gt(n, i.schemes, i.activeScheme, i.token).query;
}
function go(e, t) {
  const n = ze(e, t), i = x.get().auth;
  return gt(n, i.schemes, i.activeScheme, i.token).cookies;
}
function sn(e, t) {
  const n = ze(e, t);
  return Wr(n);
}
function ze(e, t) {
  if (e)
    return Array.isArray(e) ? zt(e, t, !1) : e;
}
let ne = -1, ft = null, ve = null;
function kr() {
  mt();
  const e = yr({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      ft = null, x.set({ searchOpen: !1 });
    }
  });
  ft = e;
  const t = e.modal, n = c("div", { className: "search-input-wrap" });
  n.innerHTML = T.search;
  const i = he({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), r = c("kbd", { textContent: "ESC", className: "kbd" });
  n.append(i, r), t.append(n);
  const a = c("div", { className: "search-results", role: "listbox" }), o = c("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  a.append(o), t.append(a);
  const s = c("div", { className: "search-footer" });
  s.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(s), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => i.focus()), ne = -1;
  let l = [];
  i.addEventListener("input", () => {
    const u = i.value;
    l = Ka(u), vo(a, l), rt(a, l.length > 0 ? 0 : -1);
  }), i.addEventListener("keydown", (u) => {
    const p = u;
    p.key === "ArrowDown" ? (p.preventDefault(), l.length > 0 && rt(a, Math.min(ne + 1, l.length - 1))) : p.key === "ArrowUp" ? (p.preventDefault(), l.length > 0 && rt(a, Math.max(ne - 1, 0))) : p.key === "Enter" ? (p.preventDefault(), ne >= 0 && ne < l.length && Cr(l[ne])) : p.key === "Escape" && (p.preventDefault(), mt());
  });
}
function mt() {
  if (ft) {
    ft.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), x.set({ searchOpen: !1 });
}
function vo(e, t) {
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
    i.method ? a.append(N({
      text: i.method.toUpperCase(),
      kind: "method",
      method: i.method
    })) : i.type === "schema" ? a.append(N({ text: "SCH", kind: "chip", size: "m" })) : i.type === "tag" && a.append(N({ text: "TAG", kind: "chip", size: "m" }));
    const o = c("div", { className: "search-result-info min-w-0" });
    if (o.append(c("span", { className: "search-result-title", textContent: i.title })), i.subtitle && o.append(c("span", { className: "search-result-subtitle", textContent: i.subtitle })), a.append(o), i.method && i.requiresAuth && i.resolvedSecurity) {
      const s = x.get().spec, l = an(i.resolvedSecurity, s?.securitySchemes || {});
      a.append(c("span", {
        className: `search-result-lock search-result-lock--${l ? "configured" : "required"}`,
        innerHTML: l ? T.unlock : T.lock,
        title: i.authTitle || "Requires authentication",
        "aria-label": i.authTitle || "Requires authentication"
      }));
    }
    a.addEventListener("click", () => Cr(i)), a.addEventListener("mouseenter", () => {
      rt(e, r);
    }), n.append(a);
  }), e.append(n);
}
function rt(e, t) {
  if (ne === t) return;
  if (ne >= 0) {
    const i = e.querySelector(`.search-result[data-index="${ne}"]`);
    i && (i.classList.remove("focused"), i.setAttribute("aria-selected", "false"));
  }
  if (ne = t, t < 0) return;
  const n = e.querySelector(`.search-result[data-index="${t}"]`);
  n && (n.classList.add("focused"), n.setAttribute("aria-selected", "true"), n.scrollIntoView({ block: "nearest" }));
}
function Cr(e) {
  mt(), e.type === "operation" ? F(_({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? F(_({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? F(_({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && F(_({ type: "webhook", webhookName: e.webhookName }));
}
function yo() {
  return ve && document.removeEventListener("keydown", ve), ve = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), x.get().searchOpen ? mt() : (x.set({ searchOpen: !0 }), kr()));
  }, document.addEventListener("keydown", ve), () => {
    ve && (document.removeEventListener("keydown", ve), ve = null);
  };
}
function bo(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let i = null;
  n.forEach((o) => {
    const s = o, l = So(s), u = s.getAttribute("href");
    if (!u && !l) return;
    const p = u?.startsWith("#") ? u.slice(1) : u || "", d = l || Wn(p), m = Ie(d, t);
    o.classList.toggle("active", m), m ? (s.setAttribute("aria-current", "page"), i = s) : s.removeAttribute("aria-current");
  });
  const r = t.type === "endpoint" || t.type === "tag" ? t.tag : null, a = t.type === "schema" ? "schemas" : r ? K(r) : null;
  if (a) {
    const o = e.querySelector(`[data-nav-tag="${CSS.escape(a)}"]`);
    if (o) {
      const s = o.querySelector(".nav-group-header"), l = o.querySelector(".nav-group-items");
      s instanceof HTMLElement && l instanceof HTMLElement && xe(s, l, !0);
    }
  }
  i && requestAnimationFrame(() => {
    const s = i.closest(".nav-group")?.querySelector(".nav-group-header");
    s ? s.scrollIntoView({ block: "start", behavior: "smooth" }) : i.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function Ln(e, t) {
  const n = x.get(), i = n.spec;
  if (!i) return;
  D(e);
  const r = t.title || i.info.title || "API Docs", a = i.info.version ? `v${i.info.version}` : "", o = c("div", { className: "top" }), s = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  s.innerHTML = T.chevronLeft, s.addEventListener("click", () => x.set({ sidebarOpen: !1 }));
  const l = c("a", { className: "title", href: "/", textContent: r });
  l.addEventListener("click", (k) => {
    k.preventDefault(), F("/");
  });
  const u = c("div", { className: "title-wrap" });
  if (u.append(l), a && u.append(c("span", { className: "version", textContent: a })), o.append(s, u), i.securitySchemes && Object.keys(i.securitySchemes).length > 0) {
    const k = Object.keys(i.securitySchemes), E = n.auth.activeScheme || k[0] || "", w = rn(E), q = c("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication",
      title: w ? `Auth: ${E}` : "Configure authentication"
    });
    q.innerHTML = w ? T.unlock : T.lock, q.classList.toggle("active", w), q.addEventListener("click", () => {
      const $ = x.get().auth.activeScheme || k[0] || "";
      xr(
        i.securitySchemes,
        e.closest(".root") ?? void 0,
        $
      );
    }), o.append(q);
  }
  const p = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (p.innerHTML = x.get().theme === "light" ? T.moon : T.sun, p.addEventListener("click", () => {
    Ja(), p.innerHTML = x.get().theme === "light" ? T.moon : T.sun;
  }), e.append(o), n.environments.length > 1) {
    const k = No(n);
    e.append(k);
  }
  const d = c("div", { className: "search" }), m = c("span", { className: "search-icon", innerHTML: T.search }), f = he({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), h = c("span", { className: "kbd", textContent: "⌘K" });
  f.addEventListener("focus", () => {
    x.set({ searchOpen: !0 }), f.blur(), kr();
  }), d.append(m, f, h), e.append(d);
  const g = c("nav", { className: "nav", "aria-label": "API navigation" }), v = Co({ type: "overview" }, n.route);
  g.append(v);
  for (const k of i.tags) {
    if (k.operations.length === 0) continue;
    const E = xo(k, n.route);
    g.append(E);
  }
  if (i.webhooks && i.webhooks.length > 0) {
    const k = c("div", { className: "nav-group", "data-nav-tag": "webhooks" }), E = Tn("Webhooks", i.webhooks.length), w = c("div", { className: "nav-group-items" });
    for (const S of i.webhooks) {
      const $ = { type: "webhook", webhookName: S.name }, I = In(S.summary || S.name, S.method, $, n.route);
      I.classList.add("nav-item-webhook"), w.append(I);
    }
    E.addEventListener("click", () => {
      xe(E, w);
    });
    const q = n.route.type === "webhook";
    xe(E, w, q, { animate: !1 }), k.append(E, w), g.append(k);
  }
  const b = Object.keys(i.schemas);
  if (b.length > 0) {
    const k = c("div", { className: "nav-group" }), E = Tn("Schemas", b.length), w = c("div", { className: "nav-group-items" });
    for (const S of b) {
      const I = In(S, void 0, { type: "schema", schemaName: S }, n.route);
      w.append(I);
    }
    E.addEventListener("click", () => {
      xe(E, w);
    });
    const q = n.route.type === "schema";
    xe(E, w, q, { animate: !1 }), k.setAttribute("data-nav-tag", "schemas"), k.append(E, w), g.append(k);
  }
  e.append(g);
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
  const O = c("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  O.textContent = `puredocs.dev${a ? ` ${a}` : ""}`, y.append(L, O), y.append(p), e.append(y), requestAnimationFrame(() => {
    const k = g.querySelector(".nav-item.active");
    if (k) {
      const w = k.closest(".nav-group")?.querySelector(".nav-group-header");
      w ? w.scrollIntoView({ block: "start", behavior: "smooth" }) : k.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function xo(e, t, n) {
  const i = c("div", { className: "nav-group", "data-nav-tag": K(e.name) }), r = ko(e, t), a = c("div", { className: "nav-group-items" }), o = K(e.name), s = t.type === "tag" && K(t.tag || "") === o || e.operations.some((l) => Ie(Rt(l, e.name), t));
  for (const l of e.operations) {
    const u = Rt(l, e.name), p = wo(l, u, t);
    a.append(p);
  }
  return r.addEventListener("click", (l) => {
    l.target.closest(".nav-group-link") || xe(r, a);
  }), xe(r, a, s, { animate: !1 }), i.append(r, a), i;
}
function ko(e, t) {
  const n = K(e.name), i = t.type === "tag" && K(t.tag || "") === n || e.operations.some((s) => Ie(Rt(s, e.name), t)), r = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(i), tabIndex: 0 }), a = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": i ? "Collapse" : "Expand"
  });
  a.innerHTML = T.chevronRight, a.addEventListener("click", (s) => {
    s.preventDefault(), s.stopPropagation(), r.click();
  });
  const o = c("a", {
    className: "nav-group-link",
    href: _({ type: "tag", tag: e.name })
  });
  return o.append(
    c("span", { className: "nav-group-title", textContent: e.name }),
    c("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), o.addEventListener("click", (s) => {
    s.preventDefault(), F(_({ type: "tag", tag: e.name }));
  }), r.append(a, o), r.addEventListener("keydown", (s) => {
    (s.key === "Enter" || s.key === " ") && (s.preventDefault(), a.click());
  }), r;
}
function Tn(e, t) {
  const n = c("div", { className: "nav-group-header focus-ring", role: "button", "aria-expanded": "true", tabindex: "0" }), i = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": "Toggle section"
  });
  i.innerHTML = T.chevronRight, i.addEventListener("click", (a) => {
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
function xe(e, t, n = !e.classList.contains("expanded"), i = {}) {
  if (!(i.animate !== !1)) {
    e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), On(e, n), t.classList.toggle("collapsed", !n), qt(t);
    return;
  }
  n ? (t.classList.remove("collapsed"), qt(t)) : (qt(t), t.offsetHeight, t.classList.add("collapsed")), e.classList.toggle("expanded", n), e.setAttribute("aria-expanded", String(n)), On(e, n);
}
function qt(e) {
  e.style.setProperty("--nav-group-max-height", `${e.scrollHeight}px`);
}
function On(e, t) {
  const n = e.querySelector(".nav-group-chevron");
  n instanceof HTMLElement && n.setAttribute("aria-label", t ? "Collapse" : "Expand");
}
function In(e, t, n, i) {
  const r = Ie(n, i), a = c("a", {
    className: `nav-item${r ? " active" : ""}`,
    href: _(n),
    role: "link",
    "aria-current": r ? "page" : void 0
  }), o = N(t ? {
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
    s.preventDefault(), F(_(n));
  }), a;
}
function Co(e, t) {
  const n = Ie(e, t), i = c("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: _(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), r = c("span", { className: "nav-overview-icon-slot" });
  r.innerHTML = T.globe;
  const a = c("span", { className: "nav-item-label", textContent: "Overview" });
  return i.append(r, a), i.addEventListener("click", (o) => {
    o.preventDefault(), F(_(e));
  }), i;
}
function wo(e, t, n) {
  const i = Ie(t, n), r = c("a", {
    className: `nav-item${i ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: _(t),
    title: `${e.method.toUpperCase()} ${e.path}`,
    "aria-current": i ? "page" : void 0
  });
  r.dataset.routeType = "endpoint", t.operationId && (r.dataset.routeOperationId = t.operationId), t.method && (r.dataset.routeMethod = t.method), t.path && (r.dataset.routePath = t.path), t.tag && (r.dataset.routeTag = t.tag);
  const a = x.get().spec, o = H(e.resolvedSecurity) ? nn({
    configured: an(e.resolvedSecurity, a?.securitySchemes || {}),
    variant: "nav",
    title: Ee(e.resolvedSecurity)
  }) : null;
  return r.append(
    N({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    c("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...o ? [o] : []
  ), r.addEventListener("click", (s) => {
    s.preventDefault(), F(_(t));
  }), r;
}
function Rt(e, t) {
  return {
    type: "endpoint",
    tag: t,
    method: e.method,
    path: e.path,
    operationId: e.operationId
  };
}
function Ie(e, t) {
  return e.type !== t.type ? !1 : e.type === "overview" ? !0 : e.type === "tag" ? K(e.tag || "") === K(t.tag || "") : e.type === "endpoint" ? e.operationId && t.operationId ? e.operationId === t.operationId : (e.method || "").toLowerCase() === (t.method || "").toLowerCase() && e.path === t.path : e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function So(e) {
  const { routeType: t } = e.dataset;
  return t && t === "endpoint" ? {
    type: "endpoint",
    operationId: e.dataset.routeOperationId || void 0,
    method: e.dataset.routeMethod || void 0,
    path: e.dataset.routePath || void 0,
    tag: e.dataset.routeTag || void 0
  } : null;
}
function No(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((r) => {
    const a = t.find((s) => s.name === r.name), o = Jt((a?.baseUrl ?? r.baseUrl) || "");
    return { value: r.name, label: o || "(no URL)" };
  });
  return dt({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (r) => x.setActiveEnvironment(r),
    className: "env"
  });
}
function wr(e, t, n = "No operations") {
  const i = c("div", { className: "summary-line" });
  for (const a of e)
    i.append(N({
      text: `${a.value} ${a.label}`,
      kind: "chip",
      size: "m"
    }));
  const r = ["get", "post", "put", "patch", "delete", "head", "options"];
  for (const a of r) {
    const o = t[a] || 0;
    o !== 0 && i.append(N({
      kind: "method",
      method: a,
      size: "m",
      text: `${o} ${a.toUpperCase()}`
    }));
  }
  return i.childNodes.length || i.append(N({
    text: n,
    kind: "chip",
    size: "m"
  })), i;
}
function Ao(e, t) {
  const n = [], i = Eo(e, t);
  return i && n.push(i), n;
}
function Eo(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = V({ title: "Authentication" });
  for (const [i, r] of Object.entries(e)) {
    const a = rn(i), o = ce({ className: "card-group card-auth" }), s = c("div", { className: "card-auth-main" }), l = c("div", { className: "card-info card-auth-info" }), u = `${r.type}${r.scheme ? ` / ${r.scheme}` : ""}`;
    l.append(
      c("h3", { textContent: i }),
      c("p", { className: "card-auth-type", textContent: u })
    ), r.description && l.append(c("p", { className: "card-auth-desc", textContent: String(r.description) }));
    const p = ie({
      variant: "secondary",
      icon: a ? T.check : T.settings,
      label: a ? "Success" : "Set",
      className: `card-auth-config${a ? " active is-configured" : ""}`,
      onClick: (d) => {
        d.stopPropagation(), xr(e, t, i);
      }
    });
    s.append(l), o.append(s, p), n.append(o);
  }
  return n;
}
async function qn(e, t) {
  D(e);
  const n = x.get().spec;
  if (!n) return;
  const i = c("div", { className: "block header" }), r = c("div", { className: "title" });
  r.append(
    c("h1", { textContent: n.info.title }),
    c("span", { className: "version", textContent: `v${n.info.version}` })
  ), i.append(r), n.info.description && i.append(c("p", { textContent: n.info.description })), e.append(i);
  const a = n.operations.filter((p) => H(p.resolvedSecurity)).length, o = n.operations.filter((p) => p.deprecated).length, s = To(n.operations);
  if (e.append(V(
    { className: "summary" },
    wr(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: a },
        { label: "Deprecated", value: o }
      ],
      s,
      "No operations"
    )
  )), n.servers.length > 0) {
    const p = V({ title: "Servers" }), d = x.get(), m = d.initialEnvironments || d.environments;
    for (const f of n.servers) {
      const h = m.find((k) => k.baseUrl === f.url), g = h?.name === d.activeEnvironment, v = ce({
        interactive: !0,
        active: g,
        className: "card-group",
        onClick: () => {
          h && x.setActiveEnvironment(h.name);
        }
      });
      v.title = "Click to set as active environment";
      const b = c("div", { className: "card-info" }), y = c("div", { className: "inline-cluster inline-cluster-sm" }), L = c("span", { className: "icon-muted" });
      L.innerHTML = T.server, y.append(L, c("code", { textContent: f.url })), b.append(y), f.description && b.append(c("p", { textContent: f.description }));
      const O = c("div", { className: "card-badges" });
      v.append(b, O), p.append(v);
    }
    e.append(p);
  }
  const l = e.closest(".root") ?? void 0, u = Ao(n.securitySchemes || {}, l);
  for (const p of u)
    e.append(p);
  if (n.tags.length > 0) {
    const p = V({ title: "API Groups" });
    for (const d of n.tags)
      d.operations.length !== 0 && p.append(Lo(d));
    e.append(p);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const p = V({ title: "Webhooks" });
    for (const d of n.webhooks) {
      const m = ce({
        interactive: !0,
        className: "card-group",
        onClick: () => F(_({ type: "webhook", webhookName: d.name }))
      }), f = c("div", { className: "card-info" });
      f.append(
        c("h3", { textContent: d.summary || d.name }),
        d.description ? c("p", { textContent: d.description }) : c("p", { textContent: `${d.method.toUpperCase()} webhook` })
      );
      const h = c("div", { className: "card-badges" });
      h.append(
        N({ text: "WH", kind: "webhook", size: "s" }),
        N({ text: d.method.toUpperCase(), kind: "method", method: d.method, size: "s" })
      ), m.append(f, h), p.append(m);
    }
    e.append(p);
  }
}
function Lo(e) {
  const t = ce({
    interactive: !0,
    className: "card-group",
    onClick: () => F(_({ type: "tag", tag: e.name }))
  }), n = c("div", { className: "card-info" });
  n.append(
    c("h3", { textContent: e.name }),
    c("p", { textContent: e.description || `${e.operations.length} endpoints` })
  );
  const i = Oo(e), r = c("div", { className: "card-badges" });
  for (const [a, o] of Object.entries(i)) {
    const s = N({
      text: a.toUpperCase(),
      kind: "method",
      method: a,
      size: "m"
    });
    s.textContent = `${o} ${a.toUpperCase()}`, r.append(s);
  }
  return t.append(n, r), t;
}
function To(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Oo(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function We(e) {
  if (!e) return "any";
  if (e.$ref) return e.$ref.split("/").pop() || "ref";
  let t = e.type || "";
  return e.allOf ? t = "allOf" : e.oneOf ? t = "oneOf" : e.anyOf ? t = "anyOf" : e.enum ? t = "enum" : e.format && (t += `<${e.format}>`), e.type === "array" && e.items && !e.enum && (t = `${e.items.type || e.items.$ref?.split("/").pop() || "any"}[]`), e.nullable && (t += " | null"), t || "object";
}
function Io(e) {
  const t = c("div", { className: "schema" }), n = c("div", { className: "body" });
  t.append(n);
  const i = [];
  Nr(n, e, "", 0, /* @__PURE__ */ new Set(), i);
  const r = i.length > 0, a = () => i.some(({ children: s }) => s.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const s = !a();
    Lr(i, s);
  }, isExpanded: a, hasExpandable: r };
}
function Oe(e, t) {
  const n = ce(), i = We(e), r = bt(), a = c("div", { className: "schema" }), o = c("div", { className: "body" });
  a.append(o);
  const s = [];
  if (Nr(o, e, "", 0, /* @__PURE__ */ new Set(), s), r.append(a), t) {
    const l = Xt(), u = typeof t == "string" ? c("h3", { textContent: t }) : t, p = s.length > 0, d = p && s.some(({ children: h }) => h.style.display !== "none"), m = N({ text: i, kind: "chip", color: "primary", size: "m" }), f = p ? c("button", {
      className: d ? "schema-collapse-btn is-expanded" : "schema-collapse-btn",
      type: "button",
      title: d ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (f && (f.innerHTML = T.chevronDown, f.addEventListener("click", (h) => {
      h.stopPropagation();
      const g = !f.classList.contains("is-expanded");
      Lr(s, g), f.classList.toggle("is-expanded", g), f.title = g ? "Collapse all fields" : "Expand all fields";
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
function Sr(e, t) {
  const { headerTitle: n, withEnumAndDefault: i = !0 } = t, r = e.map((u) => {
    const p = c("div", { className: "schema-row role-flat role-params" }), d = c("div", { className: "schema-main-row" }), m = c("div", { className: "schema-name-wrapper" });
    m.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: u.name })
    );
    const f = c("div", { className: "schema-meta-wrapper" });
    f.append(N({
      text: u.schema ? We(u.schema) : "unknown",
      kind: "chip",
      color: "primary",
      size: "m"
    })), u.required && f.append(N({ text: "required", kind: "required", size: "m" })), d.append(m, f), p.append(d);
    const h = c("div", { className: "schema-desc-col is-root" });
    u.description && h.append(c("p", { textContent: u.description }));
    const g = u.schema?.enum, v = u.schema?.default !== void 0;
    if (i && (g && g.length > 0 || v)) {
      const b = c("div", { className: "schema-enum-values" });
      if (v && b.append(N({
        text: `Default: ${JSON.stringify(u.schema.default)}`,
        kind: "chip",
        size: "s"
      })), g)
        for (const y of g) {
          const L = String(y);
          L !== u.in && b.append(N({ text: L, kind: "chip", size: "s" }));
        }
      h.append(b);
    }
    return h.children.length > 0 && p.append(h), p;
  }), a = ce(), o = bt(), s = c("div", { className: "params" }), l = c("div", { className: "body role-params" });
  return l.append(...r), s.append(l), o.append(s), a.append(
    Xt(Qt({ title: n })),
    o
  ), a;
}
function Xe(e, t, n, i, r, a, o) {
  const s = We(n), l = qo(n), u = Er(t, s, n, i, l, r);
  if (e.append(u), l) {
    const p = c("div", { className: "schema-children" });
    p.style.display = "block";
    const d = new Set(a);
    d.add(n), Ar(p, n, i + 1, d, o), e.append(p), o?.push({ row: u, children: p }), u.querySelector(".schema-toggle")?.classList.add("is-expanded"), u.classList.add("focus-ring"), u.setAttribute("aria-expanded", "true"), u.setAttribute("tabindex", "0"), u.addEventListener("click", () => {
      const m = p.style.display !== "none";
      Ft(u, p, !m);
    }), u.addEventListener("keydown", (m) => {
      if (m.key !== "Enter" && m.key !== " ") return;
      m.preventDefault();
      const f = p.style.display !== "none";
      Ft(u, p, !f);
    });
  }
}
function Nr(e, t, n, i, r, a) {
  if (r.has(t)) {
    e.append(Er("[circular]", "circular", { description: "" }, i, !1, !1));
    return;
  }
  {
    const o = new Set(r);
    o.add(t), Ar(e, t, i, o, a);
    return;
  }
}
function Ar(e, t, n, i, r) {
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
function Er(e, t, n, i, r, a) {
  const o = [
    "schema-row",
    i === 0 ? "is-root" : "",
    i === 0 && !r ? "is-leaf" : ""
  ].filter(Boolean).join(" "), s = c("div", { className: o, role: r ? "button" : void 0 });
  s.setAttribute("data-depth", String(i)), s.style.setProperty("--schema-depth", String(i));
  const l = c("div", { className: "schema-main-row" }), u = c("div", { className: "schema-name-wrapper" });
  r ? u.append(c("span", { className: "schema-toggle", innerHTML: T.chevronRight })) : u.append(c("span", { className: "schema-spacer" })), u.append(c("span", { textContent: e })), l.append(u);
  const p = c("div", { className: "schema-meta-wrapper" });
  p.append(N({ text: t, kind: "chip", color: "primary", size: "m" })), a && p.append(N({ text: "required", kind: "required", size: "m" })), l.append(p), s.append(l);
  const d = c("div", { className: `schema-desc-col${i === 0 ? " is-root" : ""}` });
  n.description && d.append(c("p", { textContent: String(n.description) }));
  const m = n.enum, f = Array.isArray(m) && m.length > 0, h = n.default, g = h !== void 0, v = f && g ? m.some((y) => $t(y, h)) : !1, b = $o(n, !f || !g);
  if (b.length > 0 || f) {
    const y = c("div", { className: "schema-constraints-row" });
    for (const L of b)
      y.append(N({
        text: L,
        kind: "chip",
        size: "s"
      }));
    if (f) {
      const L = g && v ? [h, ...m.filter((O) => !$t(O, h))] : m;
      g && !v && y.append(N({
        text: `default: ${it(h)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value is-default"
      }));
      for (const O of L) {
        const k = g && $t(O, h);
        y.append(N({
          text: k ? `default: ${it(O)}` : it(O),
          kind: "chip",
          size: "s",
          className: k ? "schema-enum-value is-default" : "schema-enum-value"
        }));
      }
    }
    d.append(y);
  }
  return d.children.length > 0 && s.append(d), s;
}
function qo(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function $o(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${it(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function Lr(e, t) {
  for (const { row: n, children: i } of e)
    Ft(n, i, t);
}
function Ft(e, t, n) {
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
function $t(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function jo(e) {
  const { method: t, url: n, headers: i = {}, body: r, timeout: a = 3e4 } = e, o = new AbortController(), s = setTimeout(() => o.abort(), a), l = performance.now();
  try {
    const u = typeof FormData < "u" && r instanceof FormData, p = {
      method: t.toUpperCase(),
      headers: u ? void 0 : i,
      signal: o.signal,
      credentials: "include"
    };
    if (u) {
      const v = {};
      for (const [b, y] of Object.entries(i))
        b.toLowerCase() !== "content-type" && (v[b] = y);
      Object.keys(v).length > 0 && (p.headers = v);
    }
    r && !["GET", "HEAD"].includes(t.toUpperCase()) && (p.body = r);
    const d = await fetch(n, p), m = performance.now() - l, f = await d.text(), h = new TextEncoder().encode(f).length, g = {};
    return d.headers.forEach((v, b) => {
      g[b.toLowerCase()] = v;
    }), Bo(f, g), {
      status: d.status,
      statusText: d.statusText,
      headers: g,
      body: f,
      duration: m,
      size: h
    };
  } catch (u) {
    const p = performance.now() - l;
    return u.name === "AbortError" ? {
      status: 0,
      statusText: "Request timed out",
      headers: {},
      body: `Request timed out after ${a}ms`,
      duration: p,
      size: 0
    } : {
      status: 0,
      statusText: "Network Error",
      headers: {},
      body: u.message || "Unknown network error",
      duration: p,
      size: 0
    };
  } finally {
    clearTimeout(s);
  }
}
function Bo(e, t) {
  const n = x.get().auth;
  if (n.locked) return;
  const i = x.get().spec;
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
    r ? (x.setSchemeValue(r, a), x.setAuth({ source: "auto-header" })) : x.setAuth({ token: a, source: "auto-header" });
    return;
  }
  try {
    const o = JSON.parse(e), s = o.accessToken || o.access_token || o.token;
    typeof s == "string" && s.length > 10 && (r ? (x.setSchemeValue(r, s), x.setAuth({ source: "auto-body" })) : x.setAuth({ token: s, source: "auto-body" }));
  } catch {
  }
}
function Mo(e, t, n, i) {
  let r = t;
  for (const [u, p] of Object.entries(n))
    r = r.replace(`{${u}}`, encodeURIComponent(p));
  const o = e.replace(/\/+$/, "") + r, s = new URLSearchParams();
  for (const [u, p] of Object.entries(i))
    p && s.set(u, p);
  const l = s.toString();
  return l ? `${o}?${l}` : o;
}
function jt(e) {
  return [
    { language: "curl", label: "cURL", code: Po(e) },
    { language: "javascript", label: "JavaScript", code: Ro(e) },
    { language: "python", label: "Python", code: Fo(e) },
    { language: "go", label: "Go", code: _o(e) }
  ];
}
function Po({ method: e, url: t, headers: n, body: i }) {
  const r = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [a, o] of Object.entries(n))
    r.push(`  -H '${a}: ${o}'`);
  return i && r.push(`  -d '${i}'`), r.join(` \\
`);
}
function Ro({ method: e, url: t, headers: n, body: i }) {
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
function Fo({ method: e, url: t, headers: n, body: i }) {
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
function _o({ method: e, url: t, headers: n, body: i }) {
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
function Do(e) {
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
function Tr(e) {
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
    const n = ye(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function Ho(e) {
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
const Or = [
  [/"(?:[^"\\]|\\.)*"(?=\s*:)/g, "property"],
  [/"(?:[^"\\]|\\.)*"/g, "string"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/\b(?:true|false|null)\b/g, "literal"],
  [/[{}[\]:,]/g, "punctuation"]
], jn = [
  [/#.*/g, "comment"],
  [/"(?:[^"\\]|\\.)*"|'[^']*'/g, "string"],
  [/\$\w+|\$\{[^}]+\}/g, "sign"],
  [/--?\w[\w-]*/g, "sign"],
  [/\b(?:curl|wget|echo|export|if|then|else|fi|for|do|done|while|case|esac|function|return|local|set|unset|source|cd|ls|cat|grep|sed|awk|chmod|mkdir|rm|cp|mv|sudo|apt|brew|npm|pip|docker|http|https)\b/g, "keyword"],
  [/-?\b\d+(?:\.\d+)?\b/g, "number"]
], Uo = [
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
], Bn = [
  [/#.*/g, "comment"],
  [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, "string"],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "string"],
  [/\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, "keyword"],
  [/\b(?:True|False|None)\b/g, "literal"],
  [/@\w+/g, "sign"],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, "number"],
  [/[{}[\]():.,;]/g, "punctuation"]
], zo = {
  json: Or,
  javascript: Qe,
  js: Qe,
  typescript: Qe,
  ts: Qe,
  bash: jn,
  curl: jn,
  go: Uo,
  python: Bn,
  py: Bn
};
function Wo(e, t) {
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
function Ir(e, t) {
  const n = zo[t] ?? (pr(e) ? Or : null);
  return n ? Wo(e, n) : nt(e);
}
function Vo(e, t) {
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
    return Mn(i, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const i = parseFloat(e);
    return Mn(i, n);
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
function Mn(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function Yo(e, t, n, i) {
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
function Go(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((r) => {
    const a = r.getAttribute("data-param-name"), o = t.parameters.find((l) => l.name === a);
    if (!o) return;
    const s = Vo(r.value, o);
    s.valid || n.push({ field: a, message: s.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const a = Object.keys(t.requestBody.content || {})[0] || "application/json", o = t.requestBody.content?.[a]?.schema, l = e.querySelector('[data-field="body"]')?.value || "";
    if (!a.includes("multipart")) {
      const u = Yo(l, a, o, t.requestBody.required);
      u.valid || n.push({ field: "body", message: u.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function Ko(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function Jo(e, t) {
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
function qr(e) {
  return c("span", { className: "validation-error", "data-error-for": e });
}
function Pn(e) {
  e.style.height = "0", e.style.height = `${e.scrollHeight}px`;
}
function Rn(e, t, n) {
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
    const p = l.endsWith(`
`) ? l + " " : l || " ";
    a.innerHTML = Ir(p, u);
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
const Zo = 1500;
function De(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", i = ie({
    variant: "icon",
    icon: T.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const r = await e.getText();
      await Xa(r), i.innerHTML = T.check, i.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        i.innerHTML = T.copy, i.setAttribute("aria-label", t);
      }, Zo);
    }
  });
  return i;
}
function Xo(e, t, n, i) {
  D(t), t.classList.add("try-it");
  const r = c("div", { className: "body" }), a = c("div", { className: "block section" });
  a.append(c("h2", { textContent: "Response" }));
  const o = c("div", { "data-response": "true" });
  if (n)
    Bt(o, {
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
  a.append(o), r.append(Qo(e, t, {
    onConfigChange: i?.onConfigChange,
    onSendRequest: async (s) => {
      Ko(t);
      const l = Go(t, e);
      if (l.length > 0) {
        Jo(t, l);
        return;
      }
      const u = pe(t, e);
      s.setAttribute("disabled", ""), s.innerHTML = "", s.append(c("span", { className: "spinner spinner-sm" }), c("span", null, "Sending..."));
      try {
        const p = await jo(u);
        Bt(o, p);
      } catch (p) {
        Bt(o, {
          status: 0,
          headers: {},
          body: p.message,
          duration: 0,
          size: 0
        });
      } finally {
        s.removeAttribute("disabled"), s.innerHTML = T.send, s.append(c("span", null, "Send Request"));
      }
    }
  })), r.append(a), t.append(r);
}
function Qo(e, t, n) {
  const i = n?.onConfigChange, r = e.parameters.filter((A) => A.in === "path"), a = e.parameters.filter((A) => A.in === "query"), o = Do([...r, ...a]), s = "Request", l = jt({
    method: e.method,
    url: "",
    // will be updated
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), u = () => {
    const A = pe(t, e);
    let j;
    return typeof A.body == "string" ? j = A.body : A.body instanceof FormData ? j = "{ /* multipart form-data */ }" : e.requestBody && (j = "{ ... }"), {
      method: A.method,
      url: A.url,
      headers: A.headers || {},
      body: j
    };
  }, p = () => {
    const A = pe(t, e);
    if (typeof A.body == "string") return A.body;
    if (A.body instanceof FormData) {
      const j = [];
      return A.body.forEach((z, X) => {
        if (z instanceof File) {
          j.push(`${X}: [File ${z.name}]`);
          return;
        }
        j.push(`${X}: ${String(z)}`);
      }), j.join(`
`);
    }
    return "";
  }, d = (A, j) => {
    const z = u(), X = jt(z), $e = X[j] || X[0];
    $e && A.setValue($e.code, $e.language);
  }, m = c("div", { className: "block section tabs-code" }), f = c("div", { className: "body" }), h = c("h2", { textContent: "Request" });
  m.append(h, f);
  const g = c("div", { className: "controls" });
  let v = !1;
  o.length > 1 && (r.length > 0 || a.length > 0) && (g.append(dt({
    options: o.map((A) => ({ value: A.name, label: A.summary || A.name })),
    value: o[0].name,
    ariaLabel: "Select example",
    className: "example-select",
    onChange: (A) => {
      const j = o.find((z) => z.name === A);
      j && (es(t, j.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
    }
  })), v = !0);
  const b = x.get(), y = c("div", { className: "card" }), L = c("div", { className: "card-head" }), O = c("div", { className: "tabs tabs-code" }), k = [];
  let E = 0, w = null, q = null, S = null, $ = null;
  {
    const A = pt(s, { active: !0, context: !0 });
    if (k.push(A), $ = c("div", { className: "panel is-request", "data-tab": "first" }), r.length > 0 || a.length > 0) {
      const M = c("div", { className: "params-group" });
      if (M.append(c("h3", { textContent: "Parameters" })), r.length > 0) {
        const P = c("div", { className: "params-group" });
        a.length > 0 && P.append(c("h3", { textContent: "Path" }));
        for (const Q of r)
          P.append(_n(Q, o[0]?.values[Q.name]));
        M.append(P);
      }
      if (a.length > 0) {
        const P = c("div", { className: "params-group" });
        r.length > 0 && P.append(c("h3", { textContent: "Query" }));
        for (const Q of a)
          P.append(_n(Q, o[0]?.values[Q.name]));
        M.append(P);
      }
      $.append(M);
    }
    {
      const M = c("div", { className: "route-preview" }), P = c("div", { className: "field-header" });
      P.append(c("h3", { textContent: "URL" }));
      const Q = De({
        ariaLabel: "Copy URL",
        getText: () => w?.value || pe(t, e).url
      });
      w = he({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "route-input"
      });
      const je = c("div", { className: "route-input-row" });
      je.append(w, Q), M.append(P, je), q = M;
    }
    if (e.requestBody) {
      const M = c("div", { className: "body-section" }), P = c("div", { className: "field-header" });
      P.append(c("h3", { textContent: "Body" }));
      const Q = De({
        ariaLabel: "Copy body",
        className: "field-copy-btn",
        getText: p
      });
      P.append(Q), M.append(P);
      const Ye = Object.keys(e.requestBody.content || {})[0] || "application/json", Rr = Ye.includes("multipart"), Ge = e.requestBody.content?.[Ye];
      if (Rr && Ge?.schema) {
        const ue = c("div", { className: "multipart", "data-field": "multipart" }), Be = Ge.schema, Ct = Be.properties || {}, Me = Be.required || [];
        for (const [ge, Z] of Object.entries(Ct)) {
          const Ke = Z.format === "binary" || Z.format === "base64" || Z.type === "string" && Z.format === "binary", Je = Me.includes(ge), wt = c("div", { className: `params row${Je ? " is-required" : ""}` }), St = c("span", { className: "label", textContent: ge });
          if (Je && St.append($r()), Ke) {
            const Nt = c("input", {
              type: "file",
              "data-multipart-field": ge,
              "data-multipart-type": "file"
            });
            wt.append(St, Nt);
          } else {
            const Nt = he({
              placeholder: Z.description || ge,
              value: Z.default !== void 0 ? String(Z.default) : "",
              dataAttrs: { multipartField: ge, multipartType: "text" }
            });
            wt.append(St, Nt);
          }
          ue.append(wt);
        }
        M.append(ue);
      } else {
        const ue = Ge ? Tr(Ge) : [], Be = ue[0], Ct = Be ? $n(Be.value) : "", Me = Rn(Ct, "json", {
          dataField: "body",
          onInput: () => i?.(pe(t, e))
        });
        if (S = Me.syncLayout, M.append(Me.wrap), ue.length > 1) {
          const ge = dt({
            options: ue.map((Z) => ({ value: Z.name, label: Ho(Z) })),
            value: ue[0].name,
            ariaLabel: "Select example",
            className: "example-select",
            onChange: (Z) => {
              const Ke = ue.find((Je) => Je.name === Z);
              Ke && (Me.setValue($n(Ke.value), "json"), i?.(pe(t, e)));
            }
          });
          g.append(ge), v = !0;
        }
      }
      M.append(qr("body")), $.append(M);
    }
    const j = c("div", { className: "headers-section" }), z = c("div", { className: "field-header" });
    z.append(c("h3", { textContent: "Headers" }));
    const X = c("div", { className: "headers-list" });
    if (e.requestBody) {
      const P = Object.keys(e.requestBody.content || {})[0] || "application/json";
      X.append(Fe("Content-Type", P));
    }
    if (H(e.resolvedSecurity) && b.spec) {
      const M = on(e.resolvedSecurity, b.spec.securitySchemes), Q = { ...sn(e.resolvedSecurity, b.spec.securitySchemes), ...M };
      for (const [je, Ye] of Object.entries(Q))
        X.append(Fe(je, Ye));
    }
    for (const M of e.parameters.filter((P) => P.in === "header"))
      X.append(Fe(M.name, String(M.example || "")));
    const $e = ie({
      variant: "icon",
      icon: T.plus,
      ariaLabel: "Add header",
      className: "field-copy-btn",
      onClick: () => X.append(Fe("", ""))
    });
    z.append($e), j.append(z, X), $.append(j);
  }
  const I = u(), J = jt(I), le = Rn(
    J[0]?.code ?? "",
    J[0]?.language
  ), qe = c("div", { className: "panel", "data-tab": "lang" }), fn = c("div", { className: "body-section" }), xt = c("div", { className: "field-header" });
  xt.append(c("h3", { textContent: "Code Example" }));
  const Mr = De({
    ariaLabel: "Copy code",
    className: "field-copy-btn",
    getText: () => le.textarea.value
  });
  xt.append(Mr), fn.append(xt, le.wrap), qe.append(fn);
  for (let A = 0; A < l.length; A++) {
    const j = l[A], z = pt(j.label, { active: !s });
    k.push(z);
  }
  L.append(O);
  const Pr = $ ? [$, qe] : [qe], Ve = (A, j) => {
    if (!j) {
      A.style.display = "none";
      return;
    }
    A.style.display = A.classList.contains("is-request") ? "flex" : "block";
  };
  for (let A = 0; A < k.length; A++) {
    O.append(k[A]);
    const j = A;
    k[A].addEventListener("click", () => {
      k.forEach((z) => z.classList.remove("is-active")), k[j].classList.add("is-active"), E = j, $ && Ve($, j === 0), Ve(qe, j !== 0), j === 0 && S?.(), j > 0 && d(le, j - 1);
    });
  }
  const mn = c("div", { className: "card-content flush" }), hn = c("div", { className: "panels" });
  if ($ && Ve($, !0), Ve(qe, !1), hn.append(...Pr), mn.append(hn), n?.onSendRequest) {
    const A = ie({
      variant: "primary",
      icon: T.send,
      label: "Send Request",
      className: "send-btn"
    });
    A.addEventListener("click", () => n.onSendRequest(A));
    {
      q && $?.append(q);
      const j = c("div", { className: "send-inline" });
      j.append(A), $?.append(j);
    }
  }
  !n?.onSendRequest && s && q && $?.append(q), v && f.append(g), y.append(L, mn), f.append(y);
  const kt = () => {
    w && (w.value = pe(t, e).url), i?.(pe(t, e)), (E > 0 || !s) && d(le, E - 1);
  };
  return t.addEventListener("input", kt), t.addEventListener("change", kt), kt(), S?.(), m;
}
function Fn(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function es(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((i) => {
    const r = i.getAttribute("data-param-name");
    r && t[r] !== void 0 && (i.value = t[r]);
  });
}
function _n(e, t) {
  const n = c("div", { className: `params row${e.required ? " is-required" : ""}` }), i = c("span", {
    className: "label",
    textContent: e.name
  });
  e.required && i.append($r());
  const r = e.schema;
  let a;
  if (r?.enum && r.enum.length > 0) {
    const s = e.required ? r.enum.map((u) => ({ value: String(u), label: String(u) })) : [{ value: "", label: "— select —" }, ...r.enum.map((u) => ({ value: String(u), label: String(u) }))];
    a = dt({
      options: s,
      value: Fn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const s = r?.type === "integer" || r?.type === "number" ? "number" : "text", l = he({
      type: s,
      placeholder: e.description || e.name,
      value: Fn(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    r?.type === "integer" && l.setAttribute("step", "1"), r?.minimum !== void 0 && l.setAttribute("min", String(r.minimum)), r?.maximum !== void 0 && l.setAttribute("max", String(r.maximum)), a = l;
  }
  const o = qr(e.name);
  return n.append(i, a, o), n;
}
function $r() {
  return c("span", {
    className: "required-star",
    textContent: "*",
    "aria-hidden": "true"
  });
}
function Fe(e, t) {
  const n = c("div", { className: "header-row" }), i = he({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), r = he({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), a = ie({
    variant: "icon",
    icon: T.close,
    ariaLabel: "Remove header",
    onClick: () => n.remove()
  });
  return n.append(i, r, a), n;
}
function pe(e, t) {
  const n = x.get(), i = yt(n), r = e.querySelectorAll('[data-param-in="path"]'), a = {};
  r.forEach((f) => {
    a[f.getAttribute("data-param-name")] = f.value;
  });
  const o = e.querySelectorAll('[data-param-in="query"]'), s = {};
  if (o.forEach((f) => {
    const h = f.getAttribute("data-param-name");
    f.value && (s[h] = f.value);
  }), n.spec && H(t.resolvedSecurity)) {
    const f = ho(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [h, g] of Object.entries(f))
      h in s || (s[h] = g);
  }
  const l = e.querySelectorAll(".header-row"), u = {};
  if (l.forEach((f) => {
    const h = f.querySelector("[data-header-name]"), g = f.querySelector("[data-header-value]");
    h?.value && g?.value && (u[h.value] = g.value);
  }), n.spec && H(t.resolvedSecurity)) {
    const f = go(t.resolvedSecurity, n.spec.securitySchemes), h = Object.entries(f).map(([g, v]) => `${g}=${v}`);
    if (h.length > 0) {
      const g = u.Cookie || u.cookie || "";
      u.Cookie = g ? `${g}; ${h.join("; ")}` : h.join("; "), delete u.cookie;
    }
  }
  const p = e.querySelector('[data-field="multipart"]');
  let d;
  if (p) {
    const f = new FormData();
    p.querySelectorAll("[data-multipart-field]").forEach((g) => {
      const v = g.getAttribute("data-multipart-field"), b = g.getAttribute("data-multipart-type");
      b === "file" && g.files && g.files.length > 0 ? f.append(v, g.files[0]) : b === "text" && g.value && f.append(v, g.value);
    }), d = f, delete u["Content-Type"];
  } else
    d = e.querySelector('[data-field="body"]')?.value || void 0;
  const m = Mo(i, t.path, a, s);
  return { method: t.method, url: m, headers: u, body: d };
}
function Bt(e, t) {
  D(e);
  const n = c("div", { className: "card" }), i = c("div", { className: "card-head response-header" }), r = pt("Body", { active: !0 }), a = pt(`Headers (${Object.keys(t.headers).length})`), o = c("div", { className: "tabs tabs-code" });
  o.append(r, a);
  const s = c("div", {
    className: "meta",
    innerHTML: `<span>${eo(t.duration)}</span><span>${Qa(t.size)}</span>`
  }), l = N({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), u = De({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => ns("Response copied")
  });
  i.append(o, s, l, u), n.append(i);
  const p = c("div", { className: "card-content flush" }), d = c("div", { className: "response-pane" }), m = c("div", { className: "pane-inner" }), f = c("pre", { className: "code-display" }), h = c("code", {}), g = ts(t.body);
  h.innerHTML = Ir(g, pr(g) ? "json" : ""), f.append(h), m.append(f), d.append(m);
  const v = c("div", { className: "response-pane", style: "display:none" }), b = c("div", { className: "pane-inner" }), y = c("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false"
  });
  y.value = Object.entries(t.headers).map(([L, O]) => `${L}: ${O}`).join(`
`), Pn(y), b.append(y), v.append(b), p.append(d, v), n.append(p), r.addEventListener("click", () => {
    r.classList.add("is-active"), a.classList.remove("is-active"), d.style.display = "block", v.style.display = "none";
  }), a.addEventListener("click", () => {
    a.classList.add("is-active"), r.classList.remove("is-active"), d.style.display = "none", v.style.display = "block", requestAnimationFrame(() => Pn(y));
  }), e.append(n);
}
function ts(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function ns(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = c("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
function _t(e) {
  const { prev: t, next: n } = rs(e);
  if (!t && !n) return null;
  const i = c("div", {
    className: `route-nav${!t || !n ? " is-single" : ""}`
  });
  return t && i.append(Dn(t, "previous")), n && i.append(Dn(n, "next")), i;
}
function Dn(e, t) {
  const n = _(e.route), i = c("a", {
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
  const a = c("span", { className: "route-side", "aria-hidden": "true" });
  a.innerHTML = t === "previous" ? T.chevronLeft : T.chevronRight;
  const o = c("div", { className: "route-main" });
  return o.append(
    c("span", { className: "route-category", textContent: e.category }),
    c("span", { className: "route-title", textContent: e.title }),
    r
  ), t === "previous" ? i.append(a, o) : i.append(o, a), i.addEventListener("click", (s) => {
    s.preventDefault(), F(n);
  }), i;
}
function rs(e) {
  if (!x.get().spec) return { prev: null, next: null };
  const n = is();
  if (n.length === 0) return { prev: null, next: null };
  const i = as(n, e);
  return i < 0 ? { prev: null, next: null } : {
    prev: i > 0 ? n[i - 1] : null,
    next: i < n.length - 1 ? n[i + 1] : null
  };
}
function is() {
  const e = x.get().spec;
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
function as(e, t) {
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
async function os(e, t, n) {
  D(e), D(t);
  const i = t.parentElement;
  i && (i.setAttribute("aria-label", "Try It"), i.classList.add("try-it"));
  const r = x.get(), a = no(r), o = mr(r), s = a + (n.path.startsWith("/") ? "" : "/") + n.path, l = [], u = N({
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
      S.preventDefault(), F("/");
    }
  });
  const p = new Set((r.spec?.tags || []).map((S) => S.name.toLowerCase())), d = (n.path || "/").split("/").filter(Boolean);
  for (const S of d) {
    const $ = S.startsWith("{") && S.endsWith("}"), I = !$ && p.has(S.toLowerCase()), J = r.spec?.tags.find((le) => le.name.toLowerCase() === S.toLowerCase());
    I && J ? l.push({
      label: S,
      href: _({ type: "tag", tag: J.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (le) => {
        le.preventDefault(), F(_({ type: "tag", tag: J.name }));
      }
    }) : l.push({
      label: S,
      className: $ ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const m = De({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${s}`
  }), f = tn(l, {
    leading: [u],
    trailing: [m]
  }), h = c("div", { className: "block header" });
  if (h.append(c("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.deprecated) {
    const S = c("span", { className: "icon-muted" });
    S.innerHTML = T.warning, h.append(c("div", {}, c("span", { className: "endpoint-meta deprecated" }, S, "Deprecated")));
  }
  if (H(n.resolvedSecurity)) {
    const S = ms(r, n), $ = Vn(n.resolvedSecurity) || "Auth required", I = nn({
      configured: S,
      variant: "endpoint",
      title: Ee(n.resolvedSecurity)
    });
    h.append(c("span", {
      className: `endpoint-meta auth${S ? " is-active" : ""}`,
      title: Ee(n.resolvedSecurity),
      "aria-label": Ee(n.resolvedSecurity)
    }, I, $));
  }
  const g = c("div", { className: "breadcrumb-wrap" });
  g.append(f), h.append(g), n.description && h.append(c("p", { textContent: n.description })), e.append(h);
  const v = ss(n);
  v && e.append(v);
  const b = n.parameters.filter((S) => S.in !== "cookie"), y = V({ title: "Request" });
  if (b.length > 0 && y.append(cs(b)), n.requestBody && y.append(ls(n)), b.length === 0 && !n.requestBody) {
    const S = c("div", { className: "params empty", textContent: "No parameters or request body required" });
    y.append(S);
  }
  e.append(y);
  let L = !1;
  Object.keys(n.responses).length > 0 && (e.append(ds(n)), L = !0);
  const O = {
    type: "endpoint",
    method: n.method,
    path: n.path,
    operationId: n.operationId
  }, k = _t(O), E = _t(O), w = () => {
    if (k && e.append(c("div", { className: "block section route-nav-wrap is-desktop" }, k)), E) {
      const S = e.closest(".page");
      S && S.append(c("div", { className: "route-nav-wrap is-mobile" }, E));
    }
  };
  L && w(), n.callbacks && n.callbacks.length > 0 && e.append(ps(n)), L || w();
  const q = fs(n);
  Xo(n, t, q);
}
function ss(e) {
  const t = [];
  if (e.requestBody) {
    const s = Object.keys(e.requestBody.content || {});
    t.push({
      name: "Content-Type",
      value: s[0] || "application/json",
      description: "Media type for request body payload",
      required: !!e.requestBody?.required
    });
  }
  if (H(e.resolvedSecurity)) {
    const s = x.get().spec, l = s ? on(e.resolvedSecurity, s.securitySchemes) : {}, p = { ...s ? sn(e.resolvedSecurity, s.securitySchemes) : {}, ...l };
    for (const [d, m] of Object.entries(p))
      t.push({
        name: d,
        value: m,
        description: "Authentication header value",
        required: !0
      });
  }
  for (const s of e.parameters.filter((l) => l.in === "header"))
    t.push({
      name: s.name,
      value: String(s.schema?.default ?? s.example ?? ""),
      description: s.description,
      required: s.required
    });
  if (t.length === 0) return null;
  const n = t.map((s) => {
    const l = c("div", { className: "schema-row role-flat role-headers" }), u = c("div", { className: "schema-main-row" }), p = c("div", { className: "schema-name-wrapper" });
    p.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: s.name })
    );
    const d = c("div", { className: "schema-meta-wrapper" });
    s.required && d.append(N({ text: "required", kind: "required", size: "m" })), u.append(p, d), l.append(u);
    const m = c("div", { className: "schema-desc-col is-root" });
    s.description && m.append(c("p", { textContent: s.description }));
    const f = c("div", { className: "schema-enum-values" });
    return f.append(N({
      text: s.value || "—",
      kind: "chip",
      size: "s"
    })), m.append(f), m.children.length > 0 && l.append(m), l;
  }), i = ce(), r = bt(), a = c("div", { className: "params" }), o = c("div", { className: "body role-headers" });
  return o.append(...n), a.append(o), r.append(a), i.append(r), V(
    { title: "Headers" },
    i
  );
}
function cs(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, i = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Sr(e, { headerTitle: i, withEnumAndDefault: !0 });
}
function ls(e) {
  const t = c("div", { className: "request-body-wrap" });
  e.requestBody?.description && t.append(c("p", { textContent: e.requestBody.description }));
  const n = e.requestBody?.content || {};
  for (const [i, r] of Object.entries(n))
    if (r.schema) {
      const a = Qt({ title: "Body" });
      a.append(N({
        text: i,
        kind: "chip",
        size: "s"
      })), t.append(Oe(r.schema, a));
    }
  return t;
}
function us(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([o, s]) => {
    const l = s.schema ? We(s.schema) : "string", u = s.example !== void 0 ? String(s.example) : s.schema?.example !== void 0 ? String(s.schema.example) : "—", p = c("div", { className: "schema-row role-flat role-headers" }), d = c("div", { className: "schema-main-row" }), m = c("div", { className: "schema-name-wrapper" });
    m.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: o })
    );
    const f = c("div", { className: "schema-meta-wrapper" });
    f.append(N({ text: l, kind: "chip", color: "primary", size: "s" })), s.required && f.append(N({ text: "required", kind: "required", size: "m" })), d.append(m, f), p.append(d);
    const h = c("div", { className: "schema-desc-col is-root" });
    s.description && h.append(c("p", { textContent: s.description }));
    const g = c("div", { className: "schema-enum-values" });
    return g.append(N({
      text: u,
      kind: "chip",
      size: "s"
    })), h.append(g), h.children.length > 0 && p.append(h), p;
  }), i = c("div", { className: "params block" }), r = c("div", { className: "title", textContent: "Headers" }), a = c("div", { className: "body role-headers" });
  return a.append(...n), i.append(r, a), i;
}
function ds(e) {
  const t = V({
    titleEl: en("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const i = ce(), r = c("div", { className: "card-row responses-header-row" }), a = c("div", { className: "tabs-code codes" });
  let o = n[0][0], s = "application/json";
  const l = /* @__PURE__ */ new Map();
  for (const [v, b] of n) {
    const y = so(v, v === o), L = b.content && Object.keys(b.content)[0] || "application/json", O = b.content?.[L], k = O?.schema ? We(O.schema) : "plain";
    let E, w, q, S;
    if (O?.schema) {
      const I = Io(O.schema);
      E = I.body, w = I.toggleCollapse, q = I.isExpanded, S = I.hasExpandable;
    } else {
      const I = c("div", { className: "schema" }), J = c("div", { className: "body" });
      J.append(c("p", { textContent: b.description || "No schema" })), I.append(J), E = I, w = () => {
      }, q = () => !1, S = !1;
    }
    const $ = b.headers ? us(b.headers) : null;
    l.set(v, {
      body: E,
      headers: $,
      contentType: L,
      schemaType: k,
      toggleCollapse: w,
      isExpanded: q,
      hasExpandable: S
    }), a.append(y), y.addEventListener("click", () => {
      a.querySelectorAll('[data-badge-group="response-code"]').forEach((J) => An(J, !1)), An(y, !0), o = v;
      const I = l.get(v);
      s = I.contentType, u.textContent = I.contentType, p.textContent = I.schemaType, d.style.display = I.hasExpandable ? "inline-flex" : "none", d.classList.toggle("is-expanded", I.hasExpandable && I.isExpanded()), d.title = I.hasExpandable && I.isExpanded() ? "Collapse all" : "Expand all", f.innerHTML = "", I.headers ? (f.append(I.headers), f.hidden = !1) : f.hidden = !0, h.innerHTML = "", h.append(I.body);
    });
  }
  r.append(a);
  const u = N({
    text: s,
    kind: "chip",
    size: "s"
  }), p = N({
    text: l.get(o)?.schemaType || "plain",
    kind: "chip",
    color: "primary",
    size: "s"
  }), d = c("button", {
    className: "schema-collapse-btn is-expanded",
    type: "button",
    title: "Collapse all"
  });
  d.innerHTML = T.chevronDown, d.addEventListener("click", (v) => {
    v.stopPropagation();
    const b = l.get(o);
    b?.hasExpandable && (b.toggleCollapse(), d.classList.toggle("is-expanded", b.isExpanded()), d.title = b.isExpanded() ? "Collapse all" : "Expand all");
  }), r.append(u, p, d), i.append(Xt(r));
  const m = bt(), f = c("div", { className: "params wrap" }), h = c("div"), g = l.get(o);
  return g && (g.headers ? (f.append(g.headers), f.hidden = !1) : f.hidden = !0, h.append(g.body), d.style.display = g.hasExpandable ? "inline-flex" : "none", d.classList.toggle("is-expanded", g.hasExpandable && g.isExpanded()), d.title = g.hasExpandable && g.isExpanded() ? "Collapse all" : "Expand all"), m.append(f, h), i.append(m), t.append(i), t;
}
function ps(e) {
  const t = V({
    titleEl: en("Callbacks", N({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const i = c("div", { className: "callback-block" });
    i.append(c("div", { className: "callback-name", textContent: n.name }));
    for (const r of n.operations) {
      const a = c("div", { className: "callback-operation" }), o = c("div", { className: "callback-op-header" });
      if (o.append(
        N({
          text: r.method.toUpperCase(),
          kind: "method",
          method: r.method
        }),
        c("span", { className: "callback-op-path", textContent: r.path })
      ), a.append(o), r.summary && a.append(c("div", { className: "callback-op-summary", textContent: r.summary })), r.description && a.append(c("p", { textContent: r.description })), r.requestBody) {
        const s = r.requestBody.content || {};
        for (const [l, u] of Object.entries(s))
          u.schema && a.append(Oe(u.schema, `${l} — Request Body`));
      }
      if (Object.keys(r.responses).length > 0)
        for (const [s, l] of Object.entries(r.responses)) {
          const u = c("div", { className: "callback-response-row" });
          if (u.append(N({
            text: s,
            kind: "status",
            statusCode: s
          })), l.description && u.append(c("p", { textContent: l.description })), l.content)
            for (const [p, d] of Object.entries(l.content))
              d.schema && u.append(Oe(d.schema, `${p}`));
          a.append(u);
        }
      i.append(a);
    }
    t.append(i);
  }
  return t;
}
function fs(e) {
  const t = Object.keys(e.responses).sort((n, i) => {
    const r = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, a = i.startsWith("2") ? 0 : i.startsWith("4") ? 1 : 2;
    return r - a || n.localeCompare(i);
  });
  for (const n of t) {
    const i = e.responses[n];
    if (!i?.content) continue;
    const r = Object.keys(i.content)[0] || "application/json", a = i.content[r], s = (a ? Tr(a) : [])[0];
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
function ms(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!H(t.resolvedSecurity)) return !1;
  const i = (e.auth.token || "").trim(), r = e.auth.schemes || {}, a = e.auth.activeScheme, o = (s) => String(r[s] || "").trim() ? !0 : i ? !a || a === s : !1;
  return n.some((s) => {
    const l = s.map((u) => u.schemeName);
    return l.length === 0 ? !0 : l.every((u) => o(u));
  });
}
function hs(e, t, n) {
  D(e);
  const i = x.get().spec;
  if (!i) return;
  const r = K(n), a = i.tags.find((v) => v.name === n) || i.tags.find((v) => K(v.name) === r);
  if (!a || a.operations.length === 0) {
    const v = c("div", { className: "block header" });
    v.append(c("h1", { textContent: "Tag not found" })), e.append(v), e.append(V(
      { title: "Details" },
      c("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const o = c("div", { className: "block header" });
  o.append(c("h1", { textContent: a.name }));
  const s = x.get(), l = mr(s), u = tn([
    {
      label: l || i.info.title || "Home",
      href: "/",
      className: "breadcrumb-item",
      onClick: (v) => {
        v.preventDefault(), F("/");
      }
    },
    { label: a.name, className: "breadcrumb-current" }
  ], {
    className: "breadcrumb-tag-page",
    leading: [N({ text: "Category", kind: "chip", size: "m" })]
  }), p = c("div", { className: "breadcrumb-wrap" });
  p.append(u), o.append(p), a.description && o.append(c("p", { textContent: a.description })), e.append(o);
  const d = gs(a), m = a.operations.filter((v) => H(v.resolvedSecurity)).length, f = a.operations.filter((v) => v.deprecated).length;
  e.append(V(
    { className: "summary" },
    wr(
      [
        { label: "Endpoints", value: a.operations.length },
        { label: "Auth Required", value: m },
        { label: "Deprecated", value: f }
      ],
      d
    )
  ));
  const h = V({ title: "Endpoints" }), g = x.get().route;
  for (const v of a.operations) {
    const b = {
      type: "endpoint",
      tag: a.name,
      method: v.method,
      path: v.path,
      operationId: v.operationId
    }, y = g.type === "endpoint" && (g.operationId && g.operationId === v.operationId || g.method === v.method && g.path === v.path), L = ce({
      interactive: !0,
      active: y,
      className: `card-group${v.deprecated ? " deprecated" : ""}`,
      onClick: () => F(_(b))
    }), O = c("div", { className: "card-info" });
    O.append(c("h3", {}, c("code", { textContent: v.path }))), (v.summary || v.operationId) && O.append(c("p", { textContent: v.summary || v.operationId }));
    const k = c("div", { className: "card-badges" });
    k.append(N({ text: v.method.toUpperCase(), kind: "method", method: v.method, size: "m" })), H(v.resolvedSecurity) && k.append(nn({
      configured: an(v.resolvedSecurity, i.securitySchemes || {}),
      variant: "tag",
      title: Ee(v.resolvedSecurity)
    })), L.append(O, k), h.append(L);
  }
  e.append(h);
}
function gs(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function vs(e, t) {
  D(e);
  const n = N({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), i = N({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), r = tn(
    [
      {
        label: "Overview",
        href: "/",
        className: "breadcrumb-item",
        onClick: (u) => {
          u.preventDefault(), F("/");
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
    const u = V({ title: "Parameters" }, ys(s));
    e.append(u);
  }
  if (t.requestBody) {
    const u = V({ title: "Webhook Payload" });
    t.requestBody.description && u.append(c("p", { textContent: t.requestBody.description }));
    const p = t.requestBody.content || {};
    for (const [d, m] of Object.entries(p))
      if (m.schema) {
        const f = Qt({ title: "Body" });
        f.append(N({
          text: d,
          kind: "chip",
          size: "s"
        })), u.append(Oe(m.schema, f));
      }
    e.append(u);
  }
  if (Object.keys(t.responses).length > 0) {
    const u = V({ title: "Expected Responses" });
    for (const [p, d] of Object.entries(t.responses)) {
      const m = c("div", { className: "response-block" });
      if (m.append(N({
        text: p,
        kind: "status",
        statusCode: p
      })), d.description && m.append(c("p", { textContent: d.description })), d.content)
        for (const [f, h] of Object.entries(d.content))
          h.schema && m.append(Oe(h.schema, `${f} — Schema`));
      u.append(m);
    }
    e.append(u);
  }
  const l = _t({ type: "webhook", webhookName: t.name });
  l && e.append(c("div", { className: "block section" }, l));
}
function ys(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, i = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Sr(e, { headerTitle: i, withEnumAndDefault: !1 });
}
function bs() {
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
function te(e, t) {
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
let oe = null, ee = null, cn = null, ln = null, un = null, at = null, ot = !1, tt = "", Ae = null;
const xs = 991;
function ks(e, t) {
  oe = c("div", { className: "root" });
  const n = {
    primaryColor: t.primaryColor
  };
  Nn(oe, x.get().theme, n);
  const i = c("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  i.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', i.addEventListener("click", () => {
    x.set({ sidebarOpen: !0 }), ee?.classList.remove("collapsed");
  }), ee = c("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: r, main: a, aside: o } = bs();
  cn = r, ln = a, un = o, oe.append(i, ee, r), e.append(oe), Ss(), x.subscribe((s) => {
    oe && (Nn(oe, s.theme, n), ee?.classList.toggle("collapsed", !s.sidebarOpen), i.classList.toggle("visible", !s.sidebarOpen), Hn(s, t));
  }), ee?.classList.toggle("collapsed", !x.get().sidebarOpen), i.classList.toggle("visible", !x.get().sidebarOpen), Hn(x.get(), t);
}
function Cs() {
  Ae?.(), Ae = null, oe && (oe.remove(), oe = null, ee = null, cn = null, ln = null, un = null, at = null, ot = !1);
}
async function Hn(e, t) {
  const n = !!e.spec;
  ee && n ? (ot ? bo(ee, e.route) : Ln(ee, t), ot = !0) : ot = !1;
  const i = ln, r = un, a = cn;
  if (!i || !r || !a) return;
  if (e.loading) {
    te(a, !1), D(r), Pe(i, et({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const m = i.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (e.error) {
    te(a, !1), D(r), Pe(i, et({
      title: "Failed to load API specification",
      message: e.error,
      icon: T.warning,
      variant: "error"
    }));
    const m = i.parentElement;
    m && (m.scrollTop = 0);
    return;
  }
  if (!e.spec) return;
  const o = e.route, s = `${e.activeEnvironment}|${e.auth.token}`, l = !!(at && Ns(at, o)), u = l && tt !== s, p = i.parentElement, d = p ? p.scrollTop : 0;
  if (!(l && tt === s)) {
    switch (u && (tt = s, ws(a, e), ee && e.spec && Ln(ee, t)), at = { ...o }, tt = s, a.querySelectorAll(":scope > .route-nav-wrap").forEach((m) => m.remove()), D(i), D(r), o.type) {
      case "overview":
        te(a, !1), qn(i);
        break;
      case "tag": {
        te(a, !1), hs(i, r, o.tag || "");
        break;
      }
      case "endpoint": {
        const m = jr(e, o);
        if (m)
          te(a, !0), await os(i, r, m);
        else {
          te(a, !1);
          const f = o.operationId ? o.operationId : `${o.method?.toUpperCase() || ""} ${o.path || ""}`.trim();
          Pe(i, et({
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
          te(a, !1);
          const f = c("div", { className: "block header" });
          f.append(c("h1", { textContent: o.schemaName || "" })), m.description && f.append(c("p", { textContent: String(m.description) }));
          const h = c("div", { className: "block section" });
          h.append(Oe(m, "Properties")), Pe(i, f, h);
        }
        break;
      }
      case "webhook": {
        const m = e.spec.webhooks?.find((f) => f.name === o.webhookName);
        m ? (te(a, !1), vs(i, m)) : (te(a, !1), Pe(i, et({
          title: "Webhook not found",
          message: o.webhookName || "",
          variant: "empty"
        })));
        break;
      }
      default:
        te(a, !1), qn(i);
    }
    p && (p.scrollTop = u ? d : 0);
  }
}
function ws(e, t, n) {
  const i = yt(t), r = Jt(i), a = e.querySelector(".breadcrumb-item");
  if (a && (a.textContent = r || t.spec?.info.title || "Home"), t.route.type !== "endpoint" || !t.spec) return;
  const o = e.querySelector(".aside.try-it .content"), s = jr(t, t.route);
  if (s && H(s.resolvedSecurity) && o) {
    const l = o.querySelector(".headers-list");
    if (l) {
      const u = ["Authorization", "Cookie"];
      Array.from(l.querySelectorAll(".header-row")).filter((b) => {
        const y = b.querySelector("[data-header-name]");
        return y && u.includes(y.value);
      }).forEach((b) => b.remove());
      const m = on(s.resolvedSecurity, t.spec.securitySchemes), h = { ...sn(s.resolvedSecurity, t.spec.securitySchemes), ...m }, g = Array.from(l.querySelectorAll(".header-row")), v = g.find((b) => {
        const y = b.querySelector("[data-header-name]");
        return y && y.value === "Content-Type";
      }) || g[0];
      for (const [b, y] of Object.entries(h).reverse()) {
        const L = Fe(b, y);
        v ? v.insertAdjacentElement("beforebegin", L) : l.prepend(L);
      }
    }
  }
  o && s && o.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function jr(e, t) {
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
    const a = K(t.tag), o = r.find(
      (s) => s.tags.some((l) => K(l) === a)
    );
    if (o) return o;
  }
  return r[0];
}
function Ss() {
  if (Ae?.(), Ae = null, typeof window > "u" || typeof window.matchMedia != "function") return;
  const e = window.matchMedia(`(max-width: ${xs}px)`), t = (r) => {
    const a = !r;
    x.get().sidebarOpen !== a && x.set({ sidebarOpen: a });
  };
  t(e.matches);
  const n = (r) => {
    t(r.matches);
  };
  if (typeof e.addEventListener == "function") {
    e.addEventListener("change", n), Ae = () => e.removeEventListener("change", n);
    return;
  }
  const i = n;
  e.addListener(i), Ae = () => e.removeListener(i);
}
function Ns(e, t) {
  return e.type === t.type && e.operationId === t.operationId && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
const Br = "ap_portal_prefs";
function As() {
  try {
    const e = localStorage.getItem(Br);
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
function Es(e) {
  try {
    localStorage.setItem(Br, JSON.stringify(e));
  } catch {
  }
}
function Un(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function Ls(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], i = Un(e[n]);
  for (let r = 1; r < t.length; r++) {
    const a = t[r], o = Un(e[a]);
    o < i && (i = o, n = a);
  }
  return n;
}
function Ts(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), i = Object.entries(t.schemes);
  if (n.length !== i.length) return !1;
  for (const [r, a] of n)
    if (t.schemes[r] !== a) return !1;
  return !0;
}
function Os(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const i = {};
  for (const o of n) {
    const s = e.schemes[o];
    typeof s == "string" && s.length > 0 && (i[o] = s);
  }
  let r = e.activeScheme;
  (!r || !t[r]) && (r = n.find((o) => !!i[o]) || ""), !r && e.token && (r = Ls(t)), r && e.token && !i[r] && (i[r] = e.token);
  let a = e.token;
  return r && i[r] && a !== i[r] && (a = i[r]), !a && r && i[r] && (a = i[r]), {
    ...e,
    schemes: i,
    activeScheme: r,
    token: a
  };
}
function Is(e, t) {
  let n;
  return ((...i) => {
    clearTimeout(n), n = setTimeout(() => e(...i), t);
  });
}
let ht = !1, Dt = null, Ht = null;
function qs(e) {
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
function $s(e) {
  if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((r) => r.getAttribute("href") === e)) return;
  const i = document.createElement("link");
  i.rel = "stylesheet", i.href = e, document.head.append(i);
}
function js(e) {
  document.documentElement.style.minHeight = "100%", document.body.style.minHeight = "100vh", document.body.style.margin = "0", e.style.minHeight = "100vh", e.style.display = "block";
}
async function dn(e) {
  let t = null;
  ht && (t = x.get().auth, pn());
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  x.reset();
  const i = [{ name: "default", baseUrl: "" }];
  x.set({
    loading: !0,
    theme: Za(e.theme),
    environments: [...i],
    initialEnvironments: [...i],
    activeEnvironment: "default"
  });
  const r = As();
  r ? x.set({
    activeEnvironment: r.activeEnvironment || "default",
    auth: r.auth
  }) : t && x.setAuth(t);
  const a = Is(() => {
    const o = x.get();
    Es({
      activeEnvironment: o.activeEnvironment,
      environments: o.environments,
      auth: o.auth
    });
  }, 300);
  x.subscribe(() => a()), Dr(""), Ht = yo(), ks(n, e), ht = !0;
  try {
    let o;
    const s = e.specUrl;
    if (e.spec)
      o = e.spec;
    else if (s)
      o = await Ya(s);
    else
      throw new Error("Either spec or specUrl must be provided");
    const l = Ma(o);
    if (l.servers.length > 0) {
      const d = l.servers.map((h, g) => ({
        name: h.description || (g === 0 ? "default" : `Server ${g + 1}`),
        baseUrl: h.url
      }));
      x.set({ environments: d, initialEnvironments: d.map((h) => ({ ...h })) });
      const m = x.get();
      d.some((h) => h.name === m.activeEnvironment) || x.set({ activeEnvironment: d[0]?.name || "default" });
    }
    const u = x.get().auth, p = Os(u, l.securitySchemes);
    Ts(u, p) || x.setAuth(p), Ga(l), x.set({ spec: l, loading: !1, error: null });
  } catch (o) {
    x.set({
      loading: !1,
      error: o.message || "Failed to load specification"
    });
  }
  return Dt = Ms(), Dt;
}
async function Bs(e) {
  if (typeof document > "u")
    throw new Error("[PureDocs] bootstrap() requires a browser environment");
  const t = qs(e);
  e.cssHref && $s(e.cssHref), e.fullPage !== !1 && js(t);
  const { mount: n, mountId: i, cssHref: r, fullPage: a, ...o } = e;
  return dn({
    ...o,
    mount: t
  });
}
function pn() {
  ht && (Ht?.(), Ht = null, Hr(), Cs(), x.reset(), ht = !1, Dt = null);
}
function Ms() {
  return {
    getState: () => x.get(),
    subscribe: (e) => x.subscribe(e),
    setToken: (e) => {
      const t = x.get().auth.activeScheme;
      t ? x.setSchemeValue(t, e) : x.setAuth({ token: e, source: "manual" });
    },
    setEnvironment: (e) => x.setActiveEnvironment(e),
    navigate: (e) => F(e)
  };
}
const zn = [
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
    return [...zn];
  }
  async connectedCallback() {
    if (ae.activeElement && ae.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    ae.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    ae.activeElement === this && (this.api = null, pn(), ae.activeElement = null);
  }
  attributeChangedCallback(t, n, i) {
    this.isConnected && n !== i && zn.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
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
      this.api = await dn({ ...t, mount: this });
    } catch (t) {
      const n = t instanceof Error ? t.message : String(t);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${n}</div>`;
    }
  }
  parseConfig() {
    const t = this.getAttribute("spec-json");
    return {
      specUrl: this.getAttribute("spec-url") || void 0,
      spec: t ? Ps(t, "spec-json") : void 0,
      theme: Rs(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      title: this.getAttribute("title") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
ae.activeElement = null;
let Ut = ae;
function Ps(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function Rs(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", Ut);
const Fs = {
  mount: dn,
  bootstrap: Bs,
  unmount: pn,
  version: "0.0.1"
};
export {
  Fs as PureDocs,
  Ut as PureDocsElement,
  Fs as default
};
//# sourceMappingURL=puredocs.js.map
