class bo {
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
    const i = { ...this.state.auth.schemes, [t]: n }, r = t, o = n;
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, schemes: i, activeScheme: r, token: o, source: "manual" }
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
const C = new bo();
let ht = "";
const vo = /* @__PURE__ */ new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace"]);
function xo(e = "") {
  ht = e.replace(/\/$/, ""), window.addEventListener("popstate", en), en();
}
function se(e) {
  window.history.pushState(null, "", ht + e), en();
}
function So() {
  const e = window.location.pathname;
  return ht ? e === ht ? "/" : e.startsWith(`${ht}/`) ? e.slice(ht.length) || "/" : e || "/" : e || "/";
}
function Qr(e) {
  const n = (e.split("?")[0]?.split("#")[0] || "/").replace(/^\/+/, ""), i = n.replace(/\/+$/, "");
  if (!i || i === "/")
    return { type: "overview" };
  const r = i.match(/^operations\/key\/([^/]+)$/);
  if (r) {
    const g = Co(r[1]);
    if (g)
      return {
        type: "endpoint",
        method: g.method,
        path: g.path
      };
  }
  const o = i.match(/^operations\/id\/([^/]+)$/);
  if (o)
    return {
      type: "endpoint",
      operationId: decodeURIComponent(o[1])
    };
  const a = i.match(/^operations\/([^/]+)$/);
  if (a)
    return {
      type: "endpoint",
      operationId: decodeURIComponent(a[1])
    };
  const s = n.match(/^operations\/([^/]+)\/([^/]+)\/(.+)$/);
  if (s) {
    const g = dn(s[3]);
    return {
      type: "endpoint",
      tag: decodeURIComponent(s[1]),
      method: s[2].toLowerCase(),
      path: g
    };
  }
  const l = i.match(/^tags\/([^/]+)$/);
  if (l)
    return { type: "tag", tag: decodeURIComponent(l[1]) };
  const u = i.match(/^schemas\/(.+)$/);
  if (u)
    return { type: "schema", schemaName: decodeURIComponent(u[1]) };
  const f = i.match(/^webhooks\/(.+)$/);
  if (f)
    return { type: "webhook", webhookName: decodeURIComponent(f[1]) };
  const d = i.match(/^guides\/(.+)$/);
  return d ? { type: "guide", guidePath: decodeURIComponent(d[1]) } : { type: "overview" };
}
function ce(e) {
  switch (e.type) {
    case "overview":
      return "/";
    case "tag":
      return `/tags/${encodeURIComponent(e.tag || "")}`;
    case "endpoint": {
      if (e.method && e.path)
        return `/operations/key/${Eo(e.method, e.path)}`;
      if (e.operationId)
        return `/operations/id/${encodeURIComponent(e.operationId)}`;
      const t = (e.method || "").toLowerCase(), n = dn(e.path || "/");
      return t ? `/operations/${encodeURIComponent(e.tag || "default")}/${t}/${encodeURIComponent(n.slice(1))}` : "/";
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
function en() {
  const e = So(), t = Qr(e);
  C.setRoute(t);
}
function dn(e) {
  let t = e.trim();
  try {
    t = decodeURIComponent(t);
  } catch {
  }
  return t.startsWith("/") || (t = `/${t}`), t.length > 1 && (t = t.replace(/\/+$/, "")), t = t.replace(/\/{2,}/g, "/"), t;
}
function ei(e) {
  return e.trim().toLowerCase();
}
function Eo(e, t) {
  const n = ei(e), i = dn(t);
  return wo(`${n} ${i}`);
}
function Co(e) {
  const t = ko(e);
  if (!t) return null;
  const n = t.indexOf(" ");
  if (n <= 0) return null;
  const i = ei(t.slice(0, n)), r = dn(t.slice(n + 1));
  return vo.has(i) ? { method: i, path: r } : null;
}
function wo(e) {
  try {
    const t = new TextEncoder().encode(e);
    let n = "";
    return t.forEach((i) => {
      n += String.fromCharCode(i);
    }), btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  } catch {
    return btoa(unescape(encodeURIComponent(e))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
}
function ko(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"), n = `${t}${"=".repeat((4 - t.length % 4) % 4)}`;
  try {
    const i = atob(n), r = Uint8Array.from(i, (o) => o.charCodeAt(0));
    return new TextDecoder().decode(r);
  } catch {
    try {
      return decodeURIComponent(escape(atob(n)));
    } catch {
      return null;
    }
  }
}
function No() {
  window.removeEventListener("popstate", en);
}
function It(e) {
  if (e === void 0) return;
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!n || typeof n != "object" || Array.isArray(n)) continue;
    const i = {};
    for (const [r, o] of Object.entries(n)) {
      const a = Array.isArray(o) ? o.map((s) => String(s)) : [];
      i[r] = a;
    }
    t.push(i);
  }
  return t;
}
function Un(e, t, n) {
  if (!e || e.length === 0)
    return { explicitlyNoAuth: n, requirements: [] };
  const i = e.map((r) => Object.entries(r).map(([o, a]) => ({
    schemeName: o,
    scopes: Array.isArray(a) ? a : [],
    scheme: t[o]
  })));
  return { explicitlyNoAuth: n, requirements: i };
}
function pe(e) {
  return !!(e && !e.explicitlyNoAuth && e.requirements.length > 0);
}
function zn(e) {
  if (!e) return "Auth";
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer" : t === "basic" ? "Basic" : "HTTP";
  }
  return e.type === "apiKey" ? "API Key" : e.type === "oauth2" ? "OAuth2" : e.type === "openIdConnect" ? "OpenID Connect" : e.type || "Auth";
}
function Ao(e) {
  if (!pe(e)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const i of e.requirements)
    for (const r of i) {
      const o = zn(r.scheme);
      t.has(o) || (t.add(o), n.push(o));
    }
  return n;
}
function ti(e) {
  const t = Ao(e);
  return t.length === 0 ? null : t.length === 1 ? `${t[0]} required` : `${t[0]} +${t.length - 1} required`;
}
function bt(e) {
  return pe(e) ? `Requires authentication: ${e.requirements.map((n) => n.map((i) => {
    const r = zn(i.scheme);
    return i.scopes.length > 0 ? `${r} [${i.scopes.join(", ")}]` : r;
  }).join(" + ")).join(" OR ")}` : "Authentication not required";
}
function pn(e, t, n, i) {
  const r = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  if (!pe(e)) return r;
  for (const s of e.requirements) {
    if (!s.every((f) => !!t[f.schemeName]) && s.length > 0) continue;
    const u = wr(s, t);
    if (Object.keys(u.headers).length > 0 || Object.keys(u.query).length > 0 || Object.keys(u.cookies).length > 0)
      return u;
  }
  return !i || !n ? r : wr([{
    schemeName: n,
    scopes: []
  }], { ...t, [n]: i });
}
function Oo(e) {
  const t = {};
  if (!pe(e)) return t;
  const n = e.requirements[0] || [];
  for (const i of n) {
    const r = i.scheme;
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
function wr(e, t) {
  const n = { headers: {}, query: {}, cookies: {}, matchedSchemeNames: [] };
  for (const i of e) {
    const r = i.scheme, o = t[i.schemeName];
    if (!(!r || !o)) {
      if (n.matchedSchemeNames.push(i.schemeName), r.type === "http") {
        const a = (r.scheme || "").toLowerCase();
        a === "bearer" ? n.headers.Authorization = `Bearer ${o}` : a === "basic" ? n.headers.Authorization = `Basic ${o}` : n.headers.Authorization = o;
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
function ni(e) {
  return typeof e > "u" || e === null;
}
function Lo(e) {
  return typeof e == "object" && e !== null;
}
function To(e) {
  return Array.isArray(e) ? e : ni(e) ? [] : [e];
}
function _o(e, t) {
  var n, i, r, o;
  if (t)
    for (o = Object.keys(t), n = 0, i = o.length; n < i; n += 1)
      r = o[n], e[r] = t[r];
  return e;
}
function Io(e, t) {
  var n = "", i;
  for (i = 0; i < t; i += 1)
    n += e;
  return n;
}
function Mo(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
var Ro = ni, Bo = Lo, $o = To, jo = Io, qo = Mo, Po = _o, ye = {
  isNothing: Ro,
  isObject: Bo,
  toArray: $o,
  repeat: jo,
  isNegativeZero: qo,
  extend: Po
};
function ri(e, t) {
  var n = "", i = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), i + " " + n) : i;
}
function Mt(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = ri(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Mt.prototype = Object.create(Error.prototype);
Mt.prototype.constructor = Mt;
Mt.prototype.toString = function(t) {
  return this.name + ": " + ri(this, t);
};
var Pe = Mt;
function kn(e, t, n, i, r) {
  var o = "", a = "", s = Math.floor(r / 2) - 1;
  return i - t > s && (o = " ... ", t = i - s + o.length), n - i > s && (a = " ...", n = i + s - a.length), {
    str: o + e.slice(t, n).replace(/\t/g, "→") + a,
    pos: i - t + o.length
    // relative position
  };
}
function Nn(e, t) {
  return ye.repeat(" ", t - e.length) + e;
}
function Do(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var n = /\r?\n|\r|\0/g, i = [0], r = [], o, a = -1; o = n.exec(e.buffer); )
    r.push(o.index), i.push(o.index + o[0].length), e.position <= o.index && a < 0 && (a = i.length - 2);
  a < 0 && (a = i.length - 1);
  var s = "", l, u, f = Math.min(e.line + t.linesAfter, r.length).toString().length, d = t.maxLength - (t.indent + f + 3);
  for (l = 1; l <= t.linesBefore && !(a - l < 0); l++)
    u = kn(
      e.buffer,
      i[a - l],
      r[a - l],
      e.position - (i[a] - i[a - l]),
      d
    ), s = ye.repeat(" ", t.indent) + Nn((e.line - l + 1).toString(), f) + " | " + u.str + `
` + s;
  for (u = kn(e.buffer, i[a], r[a], e.position, d), s += ye.repeat(" ", t.indent) + Nn((e.line + 1).toString(), f) + " | " + u.str + `
`, s += ye.repeat("-", t.indent + f + 3 + u.pos) + `^
`, l = 1; l <= t.linesAfter && !(a + l >= r.length); l++)
    u = kn(
      e.buffer,
      i[a + l],
      r[a + l],
      e.position - (i[a] - i[a + l]),
      d
    ), s += ye.repeat(" ", t.indent) + Nn((e.line + l + 1).toString(), f) + " | " + u.str + `
`;
  return s.replace(/\n$/, "");
}
var Ho = Do, Fo = [
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
], Uo = [
  "scalar",
  "sequence",
  "mapping"
];
function zo(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(i) {
      t[String(i)] = n;
    });
  }), t;
}
function Wo(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (Fo.indexOf(n) === -1)
      throw new Pe('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = zo(t.styleAliases || null), Uo.indexOf(this.kind) === -1)
    throw new Pe('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var me = Wo;
function kr(e, t) {
  var n = [];
  return e[t].forEach(function(i) {
    var r = n.length;
    n.forEach(function(o, a) {
      o.tag === i.tag && o.kind === i.kind && o.multi === i.multi && (r = a);
    }), n[r] = i;
  }), n;
}
function Ko() {
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
function Bn(e) {
  return this.extend(e);
}
Bn.prototype.extend = function(t) {
  var n = [], i = [];
  if (t instanceof me)
    i.push(t);
  else if (Array.isArray(t))
    i = i.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (i = i.concat(t.explicit));
  else
    throw new Pe("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(o) {
    if (!(o instanceof me))
      throw new Pe("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new Pe("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new Pe("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), i.forEach(function(o) {
    if (!(o instanceof me))
      throw new Pe("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var r = Object.create(Bn.prototype);
  return r.implicit = (this.implicit || []).concat(n), r.explicit = (this.explicit || []).concat(i), r.compiledImplicit = kr(r, "implicit"), r.compiledExplicit = kr(r, "explicit"), r.compiledTypeMap = Ko(r.compiledImplicit, r.compiledExplicit), r;
};
var Go = Bn, Yo = new me("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), Vo = new me("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), Jo = new me("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Xo = new Go({
  explicit: [
    Yo,
    Vo,
    Jo
  ]
});
function Zo(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Qo() {
  return null;
}
function ea(e) {
  return e === null;
}
var ta = new me("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Zo,
  construct: Qo,
  predicate: ea,
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
function na(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function ra(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function ia(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var oa = new me("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: na,
  construct: ra,
  predicate: ia,
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
function aa(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function sa(e) {
  return 48 <= e && e <= 55;
}
function ca(e) {
  return 48 <= e && e <= 57;
}
function la(e) {
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
          if (!aa(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
    if (r === "o") {
      for (n++; n < t; n++)
        if (r = e[n], r !== "_") {
          if (!sa(e.charCodeAt(n))) return !1;
          i = !0;
        }
      return i && r !== "_";
    }
  }
  if (r === "_") return !1;
  for (; n < t; n++)
    if (r = e[n], r !== "_") {
      if (!ca(e.charCodeAt(n)))
        return !1;
      i = !0;
    }
  return !(!i || r === "_");
}
function ua(e) {
  var t = e, n = 1, i;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), i = t[0], (i === "-" || i === "+") && (i === "-" && (n = -1), t = t.slice(1), i = t[0]), t === "0") return 0;
  if (i === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function da(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !ye.isNegativeZero(e);
}
var pa = new me("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: la,
  construct: ua,
  predicate: da,
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
}), fa = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function ha(e) {
  return !(e === null || !fa.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function ma(e) {
  var t, n;
  return t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
var ga = /^[-+]?[0-9]+e/;
function ya(e, t) {
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
  else if (ye.isNegativeZero(e))
    return "-0.0";
  return n = e.toString(10), ga.test(n) ? n.replace("e", ".e") : n;
}
function ba(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || ye.isNegativeZero(e));
}
var va = new me("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: ha,
  construct: ma,
  predicate: ba,
  represent: ya,
  defaultStyle: "lowercase"
}), xa = Xo.extend({
  implicit: [
    ta,
    oa,
    pa,
    va
  ]
}), Sa = xa, ii = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), oi = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Ea(e) {
  return e === null ? !1 : ii.exec(e) !== null || oi.exec(e) !== null;
}
function Ca(e) {
  var t, n, i, r, o, a, s, l = 0, u = null, f, d, g;
  if (t = ii.exec(e), t === null && (t = oi.exec(e)), t === null) throw new Error("Date resolve error");
  if (n = +t[1], i = +t[2] - 1, r = +t[3], !t[4])
    return new Date(Date.UTC(n, i, r));
  if (o = +t[4], a = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (f = +t[10], d = +(t[11] || 0), u = (f * 60 + d) * 6e4, t[9] === "-" && (u = -u)), g = new Date(Date.UTC(n, i, r, o, a, s, l)), u && g.setTime(g.getTime() - u), g;
}
function wa(e) {
  return e.toISOString();
}
var ka = new me("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Ea,
  construct: Ca,
  instanceOf: Date,
  represent: wa
});
function Na(e) {
  return e === "<<" || e === null;
}
var Aa = new me("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Na
}), Wn = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Oa(e) {
  if (e === null) return !1;
  var t, n, i = 0, r = e.length, o = Wn;
  for (n = 0; n < r; n++)
    if (t = o.indexOf(e.charAt(n)), !(t > 64)) {
      if (t < 0) return !1;
      i += 6;
    }
  return i % 8 === 0;
}
function La(e) {
  var t, n, i = e.replace(/[\r\n=]/g, ""), r = i.length, o = Wn, a = 0, s = [];
  for (t = 0; t < r; t++)
    t % 4 === 0 && t && (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)), a = a << 6 | o.indexOf(i.charAt(t));
  return n = r % 4 * 6, n === 0 ? (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)) : n === 18 ? (s.push(a >> 10 & 255), s.push(a >> 2 & 255)) : n === 12 && s.push(a >> 4 & 255), new Uint8Array(s);
}
function Ta(e) {
  var t = "", n = 0, i, r, o = e.length, a = Wn;
  for (i = 0; i < o; i++)
    i % 3 === 0 && i && (t += a[n >> 18 & 63], t += a[n >> 12 & 63], t += a[n >> 6 & 63], t += a[n & 63]), n = (n << 8) + e[i];
  return r = o % 3, r === 0 ? (t += a[n >> 18 & 63], t += a[n >> 12 & 63], t += a[n >> 6 & 63], t += a[n & 63]) : r === 2 ? (t += a[n >> 10 & 63], t += a[n >> 4 & 63], t += a[n << 2 & 63], t += a[64]) : r === 1 && (t += a[n >> 2 & 63], t += a[n << 4 & 63], t += a[64], t += a[64]), t;
}
function _a(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var Ia = new me("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: Oa,
  construct: La,
  predicate: _a,
  represent: Ta
}), Ma = Object.prototype.hasOwnProperty, Ra = Object.prototype.toString;
function Ba(e) {
  if (e === null) return !0;
  var t = [], n, i, r, o, a, s = e;
  for (n = 0, i = s.length; n < i; n += 1) {
    if (r = s[n], a = !1, Ra.call(r) !== "[object Object]") return !1;
    for (o in r)
      if (Ma.call(r, o))
        if (!a) a = !0;
        else return !1;
    if (!a) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function $a(e) {
  return e !== null ? e : [];
}
var ja = new me("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Ba,
  construct: $a
}), qa = Object.prototype.toString;
function Pa(e) {
  if (e === null) return !0;
  var t, n, i, r, o, a = e;
  for (o = new Array(a.length), t = 0, n = a.length; t < n; t += 1) {
    if (i = a[t], qa.call(i) !== "[object Object]" || (r = Object.keys(i), r.length !== 1)) return !1;
    o[t] = [r[0], i[r[0]]];
  }
  return !0;
}
function Da(e) {
  if (e === null) return [];
  var t, n, i, r, o, a = e;
  for (o = new Array(a.length), t = 0, n = a.length; t < n; t += 1)
    i = a[t], r = Object.keys(i), o[t] = [r[0], i[r[0]]];
  return o;
}
var Ha = new me("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Pa,
  construct: Da
}), Fa = Object.prototype.hasOwnProperty;
function Ua(e) {
  if (e === null) return !0;
  var t, n = e;
  for (t in n)
    if (Fa.call(n, t) && n[t] !== null)
      return !1;
  return !0;
}
function za(e) {
  return e !== null ? e : {};
}
var Wa = new me("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: Ua,
  construct: za
}), Ka = Sa.extend({
  implicit: [
    ka,
    Aa
  ],
  explicit: [
    Ia,
    ja,
    Ha,
    Wa
  ]
}), Ke = Object.prototype.hasOwnProperty, tn = 1, ai = 2, si = 3, nn = 4, An = 1, Ga = 2, Nr = 3, Ya = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Va = /[\x85\u2028\u2029]/, Ja = /[,\[\]\{\}]/, ci = /^(?:!|!!|![a-z\-]+!)$/i, li = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function Ar(e) {
  return Object.prototype.toString.call(e);
}
function Me(e) {
  return e === 10 || e === 13;
}
function et(e) {
  return e === 9 || e === 32;
}
function xe(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function mt(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Xa(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Za(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function Qa(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function Or(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function es(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function ui(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
var di = new Array(256), pi = new Array(256);
for (var pt = 0; pt < 256; pt++)
  di[pt] = Or(pt) ? 1 : 0, pi[pt] = Or(pt);
function ts(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Ka, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function fi(e, t) {
  var n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = Ho(n), new Pe(t, n);
}
function I(e, t) {
  throw fi(e, t);
}
function rn(e, t) {
  e.onWarning && e.onWarning.call(null, fi(e, t));
}
var Lr = {
  YAML: function(t, n, i) {
    var r, o, a;
    t.version !== null && I(t, "duplication of %YAML directive"), i.length !== 1 && I(t, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(i[0]), r === null && I(t, "ill-formed argument of the YAML directive"), o = parseInt(r[1], 10), a = parseInt(r[2], 10), o !== 1 && I(t, "unacceptable YAML version of the document"), t.version = i[0], t.checkLineBreaks = a < 2, a !== 1 && a !== 2 && rn(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, i) {
    var r, o;
    i.length !== 2 && I(t, "TAG directive accepts exactly two arguments"), r = i[0], o = i[1], ci.test(r) || I(t, "ill-formed tag handle (first argument) of the TAG directive"), Ke.call(t.tagMap, r) && I(t, 'there is a previously declared suffix for "' + r + '" tag handle'), li.test(o) || I(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      I(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[r] = o;
  }
};
function We(e, t, n, i) {
  var r, o, a, s;
  if (t < n) {
    if (s = e.input.slice(t, n), i)
      for (r = 0, o = s.length; r < o; r += 1)
        a = s.charCodeAt(r), a === 9 || 32 <= a && a <= 1114111 || I(e, "expected valid JSON character");
    else Ya.test(s) && I(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function Tr(e, t, n, i) {
  var r, o, a, s;
  for (ye.isObject(n) || I(e, "cannot merge mappings; the provided source object is unacceptable"), r = Object.keys(n), a = 0, s = r.length; a < s; a += 1)
    o = r[a], Ke.call(t, o) || (ui(t, o, n[o]), i[o] = !0);
}
function gt(e, t, n, i, r, o, a, s, l) {
  var u, f;
  if (Array.isArray(r))
    for (r = Array.prototype.slice.call(r), u = 0, f = r.length; u < f; u += 1)
      Array.isArray(r[u]) && I(e, "nested arrays are not supported inside keys"), typeof r == "object" && Ar(r[u]) === "[object Object]" && (r[u] = "[object Object]");
  if (typeof r == "object" && Ar(r) === "[object Object]" && (r = "[object Object]"), r = String(r), t === null && (t = {}), i === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (u = 0, f = o.length; u < f; u += 1)
        Tr(e, t, o[u], n);
    else
      Tr(e, t, o, n);
  else
    !e.json && !Ke.call(n, r) && Ke.call(t, r) && (e.line = a || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, I(e, "duplicated mapping key")), ui(t, r, o), delete n[r];
  return t;
}
function Kn(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : I(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function re(e, t, n) {
  for (var i = 0, r = e.input.charCodeAt(e.position); r !== 0; ) {
    for (; et(r); )
      r === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), r = e.input.charCodeAt(++e.position);
    if (t && r === 35)
      do
        r = e.input.charCodeAt(++e.position);
      while (r !== 10 && r !== 13 && r !== 0);
    if (Me(r))
      for (Kn(e), r = e.input.charCodeAt(e.position), i++, e.lineIndent = 0; r === 32; )
        e.lineIndent++, r = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && i !== 0 && e.lineIndent < n && rn(e, "deficient indentation"), i;
}
function fn(e) {
  var t = e.position, n;
  return n = e.input.charCodeAt(t), !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || xe(n)));
}
function Gn(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += ye.repeat(`
`, t - 1));
}
function ns(e, t, n) {
  var i, r, o, a, s, l, u, f, d = e.kind, g = e.result, h;
  if (h = e.input.charCodeAt(e.position), xe(h) || mt(h) || h === 35 || h === 38 || h === 42 || h === 33 || h === 124 || h === 62 || h === 39 || h === 34 || h === 37 || h === 64 || h === 96 || (h === 63 || h === 45) && (r = e.input.charCodeAt(e.position + 1), xe(r) || n && mt(r)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = a = e.position, s = !1; h !== 0; ) {
    if (h === 58) {
      if (r = e.input.charCodeAt(e.position + 1), xe(r) || n && mt(r))
        break;
    } else if (h === 35) {
      if (i = e.input.charCodeAt(e.position - 1), xe(i))
        break;
    } else {
      if (e.position === e.lineStart && fn(e) || n && mt(h))
        break;
      if (Me(h))
        if (l = e.line, u = e.lineStart, f = e.lineIndent, re(e, !1, -1), e.lineIndent >= t) {
          s = !0, h = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = a, e.line = l, e.lineStart = u, e.lineIndent = f;
          break;
        }
    }
    s && (We(e, o, a, !1), Gn(e, e.line - l), o = a = e.position, s = !1), et(h) || (a = e.position + 1), h = e.input.charCodeAt(++e.position);
  }
  return We(e, o, a, !1), e.result ? !0 : (e.kind = d, e.result = g, !1);
}
function rs(e, t) {
  var n, i, r;
  if (n = e.input.charCodeAt(e.position), n !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, i = r = e.position; (n = e.input.charCodeAt(e.position)) !== 0; )
    if (n === 39)
      if (We(e, i, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39)
        i = e.position, e.position++, r = e.position;
      else
        return !0;
    else Me(n) ? (We(e, i, r, !0), Gn(e, re(e, !1, t)), i = r = e.position) : e.position === e.lineStart && fn(e) ? I(e, "unexpected end of the document within a single quoted scalar") : (e.position++, r = e.position);
  I(e, "unexpected end of the stream within a single quoted scalar");
}
function is(e, t) {
  var n, i, r, o, a, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return We(e, n, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (We(e, n, e.position, !0), s = e.input.charCodeAt(++e.position), Me(s))
        re(e, !1, t);
      else if (s < 256 && di[s])
        e.result += pi[s], e.position++;
      else if ((a = Za(s)) > 0) {
        for (r = a, o = 0; r > 0; r--)
          s = e.input.charCodeAt(++e.position), (a = Xa(s)) >= 0 ? o = (o << 4) + a : I(e, "expected hexadecimal character");
        e.result += es(o), e.position++;
      } else
        I(e, "unknown escape sequence");
      n = i = e.position;
    } else Me(s) ? (We(e, n, i, !0), Gn(e, re(e, !1, t)), n = i = e.position) : e.position === e.lineStart && fn(e) ? I(e, "unexpected end of the document within a double quoted scalar") : (e.position++, i = e.position);
  }
  I(e, "unexpected end of the stream within a double quoted scalar");
}
function os(e, t) {
  var n = !0, i, r, o, a = e.tag, s, l = e.anchor, u, f, d, g, h, y = /* @__PURE__ */ Object.create(null), m, E, v, x;
  if (x = e.input.charCodeAt(e.position), x === 91)
    f = 93, h = !1, s = [];
  else if (x === 123)
    f = 125, h = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), x = e.input.charCodeAt(++e.position); x !== 0; ) {
    if (re(e, !0, t), x = e.input.charCodeAt(e.position), x === f)
      return e.position++, e.tag = a, e.anchor = l, e.kind = h ? "mapping" : "sequence", e.result = s, !0;
    n ? x === 44 && I(e, "expected the node content, but found ','") : I(e, "missed comma between flow collection entries"), E = m = v = null, d = g = !1, x === 63 && (u = e.input.charCodeAt(e.position + 1), xe(u) && (d = g = !0, e.position++, re(e, !0, t))), i = e.line, r = e.lineStart, o = e.position, xt(e, t, tn, !1, !0), E = e.tag, m = e.result, re(e, !0, t), x = e.input.charCodeAt(e.position), (g || e.line === i) && x === 58 && (d = !0, x = e.input.charCodeAt(++e.position), re(e, !0, t), xt(e, t, tn, !1, !0), v = e.result), h ? gt(e, s, y, E, m, v, i, r, o) : d ? s.push(gt(e, null, y, E, m, v, i, r, o)) : s.push(m), re(e, !0, t), x = e.input.charCodeAt(e.position), x === 44 ? (n = !0, x = e.input.charCodeAt(++e.position)) : n = !1;
  }
  I(e, "unexpected end of the stream within a flow collection");
}
function as(e, t) {
  var n, i, r = An, o = !1, a = !1, s = t, l = 0, u = !1, f, d;
  if (d = e.input.charCodeAt(e.position), d === 124)
    i = !1;
  else if (d === 62)
    i = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; d !== 0; )
    if (d = e.input.charCodeAt(++e.position), d === 43 || d === 45)
      An === r ? r = d === 43 ? Nr : Ga : I(e, "repeat of a chomping mode identifier");
    else if ((f = Qa(d)) >= 0)
      f === 0 ? I(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : a ? I(e, "repeat of an indentation width identifier") : (s = t + f - 1, a = !0);
    else
      break;
  if (et(d)) {
    do
      d = e.input.charCodeAt(++e.position);
    while (et(d));
    if (d === 35)
      do
        d = e.input.charCodeAt(++e.position);
      while (!Me(d) && d !== 0);
  }
  for (; d !== 0; ) {
    for (Kn(e), e.lineIndent = 0, d = e.input.charCodeAt(e.position); (!a || e.lineIndent < s) && d === 32; )
      e.lineIndent++, d = e.input.charCodeAt(++e.position);
    if (!a && e.lineIndent > s && (s = e.lineIndent), Me(d)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      r === Nr ? e.result += ye.repeat(`
`, o ? 1 + l : l) : r === An && o && (e.result += `
`);
      break;
    }
    for (i ? et(d) ? (u = !0, e.result += ye.repeat(`
`, o ? 1 + l : l)) : u ? (u = !1, e.result += ye.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += ye.repeat(`
`, l) : e.result += ye.repeat(`
`, o ? 1 + l : l), o = !0, a = !0, l = 0, n = e.position; !Me(d) && d !== 0; )
      d = e.input.charCodeAt(++e.position);
    We(e, n, e.position, !1);
  }
  return !0;
}
function _r(e, t) {
  var n, i = e.tag, r = e.anchor, o = [], a, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, I(e, "tab characters must not be used in indentation")), !(l !== 45 || (a = e.input.charCodeAt(e.position + 1), !xe(a)))); ) {
    if (s = !0, e.position++, re(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (n = e.line, xt(e, t, si, !1, !0), o.push(e.result), re(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && l !== 0)
      I(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = i, e.anchor = r, e.kind = "sequence", e.result = o, !0) : !1;
}
function ss(e, t, n) {
  var i, r, o, a, s, l, u = e.tag, f = e.anchor, d = {}, g = /* @__PURE__ */ Object.create(null), h = null, y = null, m = null, E = !1, v = !1, x;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = d), x = e.input.charCodeAt(e.position); x !== 0; ) {
    if (!E && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, I(e, "tab characters must not be used in indentation")), i = e.input.charCodeAt(e.position + 1), o = e.line, (x === 63 || x === 58) && xe(i))
      x === 63 ? (E && (gt(e, d, g, h, y, null, a, s, l), h = y = m = null), v = !0, E = !0, r = !0) : E ? (E = !1, r = !0) : I(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, x = i;
    else {
      if (a = e.line, s = e.lineStart, l = e.position, !xt(e, n, ai, !1, !0))
        break;
      if (e.line === o) {
        for (x = e.input.charCodeAt(e.position); et(x); )
          x = e.input.charCodeAt(++e.position);
        if (x === 58)
          x = e.input.charCodeAt(++e.position), xe(x) || I(e, "a whitespace character is expected after the key-value separator within a block mapping"), E && (gt(e, d, g, h, y, null, a, s, l), h = y = m = null), v = !0, E = !1, r = !1, h = e.tag, y = e.result;
        else if (v)
          I(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = u, e.anchor = f, !0;
      } else if (v)
        I(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = u, e.anchor = f, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (E && (a = e.line, s = e.lineStart, l = e.position), xt(e, t, nn, !0, r) && (E ? y = e.result : m = e.result), E || (gt(e, d, g, h, y, m, a, s, l), h = y = m = null), re(e, !0, -1), x = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && x !== 0)
      I(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return E && gt(e, d, g, h, y, null, a, s, l), v && (e.tag = u, e.anchor = f, e.kind = "mapping", e.result = d), v;
}
function cs(e) {
  var t, n = !1, i = !1, r, o, a;
  if (a = e.input.charCodeAt(e.position), a !== 33) return !1;
  if (e.tag !== null && I(e, "duplication of a tag property"), a = e.input.charCodeAt(++e.position), a === 60 ? (n = !0, a = e.input.charCodeAt(++e.position)) : a === 33 ? (i = !0, r = "!!", a = e.input.charCodeAt(++e.position)) : r = "!", t = e.position, n) {
    do
      a = e.input.charCodeAt(++e.position);
    while (a !== 0 && a !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), a = e.input.charCodeAt(++e.position)) : I(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; a !== 0 && !xe(a); )
      a === 33 && (i ? I(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(t - 1, e.position + 1), ci.test(r) || I(e, "named tag handle cannot contain such characters"), i = !0, t = e.position + 1)), a = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), Ja.test(o) && I(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !li.test(o) && I(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    I(e, "tag name is malformed: " + o);
  }
  return n ? e.tag = o : Ke.call(e.tagMap, r) ? e.tag = e.tagMap[r] + o : r === "!" ? e.tag = "!" + o : r === "!!" ? e.tag = "tag:yaml.org,2002:" + o : I(e, 'undeclared tag handle "' + r + '"'), !0;
}
function ls(e) {
  var t, n;
  if (n = e.input.charCodeAt(e.position), n !== 38) return !1;
  for (e.anchor !== null && I(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !xe(n) && !mt(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && I(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function us(e) {
  var t, n, i;
  if (i = e.input.charCodeAt(e.position), i !== 42) return !1;
  for (i = e.input.charCodeAt(++e.position), t = e.position; i !== 0 && !xe(i) && !mt(i); )
    i = e.input.charCodeAt(++e.position);
  return e.position === t && I(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), Ke.call(e.anchorMap, n) || I(e, 'unidentified alias "' + n + '"'), e.result = e.anchorMap[n], re(e, !0, -1), !0;
}
function xt(e, t, n, i, r) {
  var o, a, s, l = 1, u = !1, f = !1, d, g, h, y, m, E;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = a = s = nn === n || si === n, i && re(e, !0, -1) && (u = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; cs(e) || ls(e); )
      re(e, !0, -1) ? (u = !0, s = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = u || r), (l === 1 || nn === n) && (tn === n || ai === n ? m = t : m = t + 1, E = e.position - e.lineStart, l === 1 ? s && (_r(e, E) || ss(e, E, m)) || os(e, m) ? f = !0 : (a && as(e, m) || rs(e, m) || is(e, m) ? f = !0 : us(e) ? (f = !0, (e.tag !== null || e.anchor !== null) && I(e, "alias node should not have any properties")) : ns(e, m, tn === n) && (f = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (f = s && _r(e, E))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && I(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), d = 0, g = e.implicitTypes.length; d < g; d += 1)
      if (y = e.implicitTypes[d], y.resolve(e.result)) {
        e.result = y.construct(e.result), e.tag = y.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (Ke.call(e.typeMap[e.kind || "fallback"], e.tag))
      y = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (y = null, h = e.typeMap.multi[e.kind || "fallback"], d = 0, g = h.length; d < g; d += 1)
        if (e.tag.slice(0, h[d].tag.length) === h[d].tag) {
          y = h[d];
          break;
        }
    y || I(e, "unknown tag !<" + e.tag + ">"), e.result !== null && y.kind !== e.kind && I(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + y.kind + '", not "' + e.kind + '"'), y.resolve(e.result, e.tag) ? (e.result = y.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : I(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || f;
}
function ds(e) {
  var t = e.position, n, i, r, o = !1, a;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (a = e.input.charCodeAt(e.position)) !== 0 && (re(e, !0, -1), a = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || a !== 37)); ) {
    for (o = !0, a = e.input.charCodeAt(++e.position), n = e.position; a !== 0 && !xe(a); )
      a = e.input.charCodeAt(++e.position);
    for (i = e.input.slice(n, e.position), r = [], i.length < 1 && I(e, "directive name must not be less than one character in length"); a !== 0; ) {
      for (; et(a); )
        a = e.input.charCodeAt(++e.position);
      if (a === 35) {
        do
          a = e.input.charCodeAt(++e.position);
        while (a !== 0 && !Me(a));
        break;
      }
      if (Me(a)) break;
      for (n = e.position; a !== 0 && !xe(a); )
        a = e.input.charCodeAt(++e.position);
      r.push(e.input.slice(n, e.position));
    }
    a !== 0 && Kn(e), Ke.call(Lr, i) ? Lr[i](e, i, r) : rn(e, 'unknown document directive "' + i + '"');
  }
  if (re(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, re(e, !0, -1)) : o && I(e, "directives end mark is expected"), xt(e, e.lineIndent - 1, nn, !1, !0), re(e, !0, -1), e.checkLineBreaks && Va.test(e.input.slice(t, e.position)) && rn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && fn(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, re(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    I(e, "end of the stream or a document separator is expected");
  else
    return;
}
function ps(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var n = new ts(e, t), i = e.indexOf("\0");
  for (i !== -1 && (n.position = i, I(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    ds(n);
  return n.documents;
}
function fs(e, t) {
  var n = ps(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new Pe("expected a single document in the stream, but found more");
  }
}
var hs = fs, ms = {
  load: hs
}, gs = ms.load;
const ys = 50, bs = 200;
function vs(e) {
  const t = xs(e.info || {}), n = Ss(e.servers || []), i = e.components || {}, r = ws(i.schemas || {}, e), o = Es(i.securitySchemes || {}), a = It(e.security), s = e.paths || {}, l = {};
  for (const [g, h] of Object.entries(s))
    g.startsWith("/docs") || (l[g] = h);
  const u = ks(l, e, a, o), f = Ls(u, e.tags || []), d = Ns(e.webhooks || {}, e, a, o);
  return { raw: e, info: t, servers: n, tags: f, operations: u, schemas: r, securitySchemes: o, webhooks: d };
}
function xs(e) {
  return {
    title: String(e.title || "API"),
    description: e.description ? String(e.description) : void 0,
    version: String(e.version || "1.0.0"),
    contact: e.contact,
    license: e.license
  };
}
function Ss(e) {
  return e.map((t) => ({
    url: String(t.url || "/"),
    description: t.description ? String(t.description) : void 0,
    variables: t.variables
  }));
}
function Es(e) {
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
const Tt = /* @__PURE__ */ new Map();
let Yn = 0;
function Cs(e, t) {
  if (Tt.has(e)) return Tt.get(e);
  if (++Yn > bs) return { type: "object", description: "[Circular reference]" };
  const n = e.replace(/^#\//, "").split("/").map((r) => decodeURIComponent(r.replace(/~1/g, "/").replace(/~0/g, "~")));
  let i = t;
  for (const r of n)
    if (i && typeof i == "object" && !Array.isArray(i))
      i = i[r];
    else
      return;
  return Tt.set(e, i), i;
}
function ve(e, t, n = 0, i = /* @__PURE__ */ new Set()) {
  if (n > ys || !e || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map((a) => ve(a, t, n + 1, i));
  const r = e;
  if (typeof r.$ref == "string") {
    const a = r.$ref;
    if (i.has(a)) return { type: "object", description: "[Circular reference]" };
    const s = new Set(i);
    s.add(a);
    const l = Cs(a, t);
    return l && typeof l == "object" ? ve(l, t, n + 1, s) : l;
  }
  const o = {};
  for (const [a, s] of Object.entries(r))
    o[a] = ve(s, t, n + 1, i);
  return o;
}
function ws(e, t) {
  Tt.clear(), Yn = 0;
  const n = {};
  for (const [i, r] of Object.entries(e))
    n[i] = ve(r, t);
  return n;
}
function ks(e, t, n, i) {
  Tt.clear(), Yn = 0;
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [a, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = It(s.security), u = Array.isArray(s.parameters) ? s.parameters.map((f) => ve(f, t)) : [];
    for (const f of o) {
      const d = s[f];
      if (!d) continue;
      const g = hi(
        f,
        a,
        d,
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
function hi(e, t, n, i, r, o = void 0, a = void 0, s = {}) {
  const l = Array.isArray(n.parameters) ? n.parameters.map((O) => ve(O, r)) : [], u = [...i];
  for (const O of l) {
    const P = u.findIndex((N) => N.name === O.name && N.in === O.in);
    P >= 0 ? u[P] = O : u.push(O);
  }
  const f = mi(u, r);
  let d = gi(n.requestBody, r);
  if (Array.isArray(n["x-doc-examples"])) {
    const O = n["x-doc-examples"], P = [];
    for (let N = 0; N < O.length; N++) {
      const H = O[N], Y = H.scenario ? String(H.scenario) : `Example ${N + 1}`, G = H.request?.body;
      G !== void 0 && P.push({ summary: Y, value: G });
    }
    if (P.length > 0) {
      d || (d = { required: !1, content: {} });
      const N = d.content["application/json"] || d.content["application/vnd.api+json"] || {};
      d.content["application/json"] || (d.content["application/json"] = N);
      const H = d.content["application/json"];
      H.examples || (H.examples = {});
      for (let Y = 0; Y < P.length; Y++) {
        const W = P[Y], Ce = `${W.summary.replace(/[^a-zA-Z0-9\u0430-\u044f\u0410-\u042f\u0451\u0401]/g, "-").replace(/-+/g, "-").slice(0, 40) || "ex"}-${Y}`.replace(/^-/, "");
        H.examples[Ce] = { summary: W.summary, description: W.summary, value: W.value };
      }
    }
  }
  const g = yi(n.responses, r), h = Array.isArray(n.tags) ? n.tags.map(String) : ["default"], y = String(n.operationId || `${e}_${t.replace(/[^a-zA-Z0-9]/g, "_")}`), m = Object.prototype.hasOwnProperty.call(n, "security"), E = It(n.security), v = m ? E : o ?? a, x = m && Array.isArray(E) && E.length === 0, j = Os(n.callbacks, r, s), T = {
    operationId: y,
    method: e,
    path: t,
    summary: n.summary ? String(n.summary) : void 0,
    description: n.description ? String(n.description) : void 0,
    tags: h,
    deprecated: !!n.deprecated,
    security: v,
    resolvedSecurity: Un(v, s, x),
    parameters: f,
    requestBody: d,
    responses: g
  };
  return j.length > 0 && (T.callbacks = j), T;
}
function Ns(e, t, n, i) {
  if (!e || typeof e != "object") return [];
  const r = [], o = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [a, s] of Object.entries(e)) {
    if (!s || typeof s != "object") continue;
    const l = ve(s, t), u = It(l.security);
    for (const f of o) {
      const d = l[f];
      if (!d) continue;
      const g = Object.prototype.hasOwnProperty.call(d, "security"), h = It(d.security), y = g ? h : u ?? n, m = g && Array.isArray(h) && h.length === 0, E = Array.isArray(d.parameters) ? d.parameters.map((T) => ve(T, t)) : [], v = mi(E, t), x = gi(d.requestBody, t), j = yi(d.responses, t);
      r.push({
        name: a,
        method: f,
        path: a,
        summary: d.summary ? String(d.summary) : void 0,
        description: d.description ? String(d.description) : void 0,
        security: y,
        resolvedSecurity: Un(y, i, m),
        parameters: v,
        requestBody: x,
        responses: j
      });
    }
  }
  return r;
}
function mi(e, t) {
  return e.map((n) => ({
    name: String(n.name || ""),
    in: String(n.in || "query"),
    required: !!n.required,
    description: n.description ? String(n.description) : void 0,
    schema: n.schema ? ve(n.schema, t) : void 0,
    example: n.example,
    examples: n.examples ? vi(n.examples) : void 0,
    deprecated: !!n.deprecated
  }));
}
function gi(e, t) {
  if (!e) return;
  const n = ve(e, t);
  return {
    description: n.description ? String(n.description) : void 0,
    required: !!n.required,
    content: bi(n.content || {}, t)
  };
}
function As(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [i, r] of Object.entries(e)) {
    if (!r || typeof r != "object") continue;
    const o = ve(r, t), a = o.schema, s = o.example ?? (a && typeof a == "object" ? a.example : void 0);
    n[i] = {
      description: o.description ? String(o.description) : void 0,
      required: !!o.required,
      schema: a && typeof a == "object" ? ve(a, t) : void 0,
      example: s !== void 0 ? s : void 0,
      deprecated: !!o.deprecated
    };
  }
  return n;
}
function yi(e, t) {
  const n = {};
  if (!e || typeof e != "object") return n;
  for (const [i, r] of Object.entries(e)) {
    const o = ve(r, t), a = o.headers;
    n[i] = {
      statusCode: i,
      description: o.description ? String(o.description) : void 0,
      headers: a ? As(a, t) : void 0,
      content: o.content ? bi(o.content, t) : void 0
    };
  }
  return n;
}
function Os(e, t, n) {
  if (!e || typeof e != "object") return [];
  const i = [], r = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [o, a] of Object.entries(e)) {
    const s = ve(a, t);
    if (!s || typeof s != "object") continue;
    const l = [];
    for (const [u, f] of Object.entries(s))
      if (!(!f || typeof f != "object"))
        for (const d of r) {
          const g = f[d];
          g && l.push(hi(d, u, g, [], t, void 0, void 0, n));
        }
    l.length > 0 && i.push({ name: o, operations: l });
  }
  return i;
}
function bi(e, t) {
  const n = {};
  for (const [i, r] of Object.entries(e)) {
    const o = r;
    n[i] = {
      schema: o.schema ? ve(o.schema, t) : void 0,
      example: o.example,
      examples: o.examples ? vi(o.examples) : void 0
    };
  }
  return n;
}
function vi(e) {
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
function Ls(e, t) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const a of t)
    i.set(String(a.name), String(a.description || ""));
  for (const a of e)
    for (const s of a.tags)
      n.has(s) || n.set(s, []), n.get(s).push(a);
  const r = [], o = /* @__PURE__ */ new Set();
  for (const a of t) {
    const s = String(a.name);
    o.has(s) || (o.add(s), r.push({
      name: s,
      description: i.get(s),
      operations: n.get(s) || []
    }));
  }
  for (const [a, s] of n)
    o.has(a) || (o.add(a), r.push({ name: a, description: i.get(a), operations: s }));
  return r;
}
function Qe(e) {
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
          const t = Qe(e.items);
          return t !== void 0 ? [t] : [];
        }
        return [];
      case "object": {
        const t = {};
        if (e.properties)
          for (const [n, i] of Object.entries(e.properties))
            t[n] = Qe(i);
        return t;
      }
      default:
        if (e.allOf && e.allOf.length > 0) {
          const t = {};
          for (const n of e.allOf) {
            const i = Qe(n);
            i && typeof i == "object" && !Array.isArray(i) && Object.assign(t, i);
          }
          return Object.keys(t).length > 0 ? t : void 0;
        }
        if (e.oneOf && e.oneOf.length > 0) return Qe(e.oneOf[0]);
        if (e.anyOf && e.anyOf.length > 0) return Qe(e.anyOf[0]);
        if (e.properties) {
          const t = {};
          for (const [n, i] of Object.entries(e.properties))
            t[n] = Qe(i);
          return t;
        }
        return;
    }
  }
}
async function Ts(e) {
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Failed to load spec: ${t.status} ${t.statusText}`);
  const n = await t.text();
  try {
    return JSON.parse(n);
  } catch {
    try {
      return gs(n);
    } catch {
      throw new Error("Failed to parse spec as JSON or YAML");
    }
  }
}
let ft = [];
const Ir = {
  operation: 0,
  tag: 1,
  schema: 2,
  webhook: 3
};
function _s(e) {
  ft = [];
  for (const t of e.tags)
    ft.push({
      type: "tag",
      title: t.name,
      subtitle: t.description,
      tag: t.name,
      keywords: `${t.name} ${t.description || ""}`.toLowerCase()
    });
  for (const t of e.operations)
    ft.push({
      type: "operation",
      title: t.summary || t.operationId,
      subtitle: t.path,
      method: t.method,
      requiresAuth: pe(t.resolvedSecurity),
      authBadge: ti(t.resolvedSecurity) || void 0,
      authTitle: pe(t.resolvedSecurity) ? bt(t.resolvedSecurity) : void 0,
      resolvedSecurity: t.resolvedSecurity,
      path: t.path,
      tag: t.tags[0],
      operationId: t.operationId,
      keywords: `${t.method} ${t.path} ${t.summary || ""} ${t.description || ""} ${t.operationId} ${t.tags.join(" ")}`.toLowerCase()
    });
  for (const [t, n] of Object.entries(e.schemas))
    ft.push({
      type: "schema",
      title: t,
      subtitle: n.description || "Schema",
      schemaName: t,
      keywords: `${t} ${n.description || ""} schema model`.toLowerCase()
    });
  if (e.webhooks)
    for (const t of e.webhooks)
      ft.push({
        type: "webhook",
        title: t.summary || t.name,
        subtitle: `${t.method.toUpperCase()} Webhook`,
        method: t.method,
        webhookName: t.name,
        keywords: `${t.name} ${t.method} ${t.summary || ""} ${t.description || ""} webhook`.toLowerCase()
      });
}
function Is(e, t = 20) {
  if (!e.trim()) return [];
  const n = e.toLowerCase().trim().split(/\s+/), i = [];
  for (const r of ft) {
    let o = 0, a = !0;
    for (const s of n)
      r.keywords.includes(s) ? (o += 1, r.title.toLowerCase().includes(s) && (o += 3), r.path?.toLowerCase().includes(s) && (o += 2), r.method?.toLowerCase() === s && (o += 2)) : a = !1;
    a && o > 0 && i.push({ entry: r, score: o });
  }
  return i.sort((r, o) => {
    const a = Ir[r.entry.type] ?? 99, s = Ir[o.entry.type] ?? 99;
    return a !== s ? a - s : o.score !== r.score ? o.score - r.score : r.entry.title.localeCompare(o.entry.title);
  }).slice(0, t).map((r) => r.entry);
}
const xi = "puredocs-theme";
function Mr(e, t, n) {
  e.classList.remove("light", "dark"), e.classList.add(`${t}`), n?.primaryColor ? e.style.setProperty("--primary-color", n.primaryColor) : e.style.removeProperty("--primary-color");
}
function Ms() {
  const t = C.get().theme === "light" ? "dark" : "light";
  C.set({ theme: t });
  try {
    localStorage.setItem(xi, t);
  } catch {
  }
}
function Rs(e) {
  if (e && e !== "auto") return e;
  try {
    const t = localStorage.getItem(xi);
    if (t === "light" || t === "dark") return t;
  } catch {
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function Si(e) {
  const t = e.trim();
  return t.startsWith("{") && t.endsWith("}") || t.startsWith("[") && t.endsWith("]");
}
function Rr(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function c(e, t, ...n) {
  const i = document.createElement(e);
  if (t)
    for (const [r, o] of Object.entries(t))
      o === void 0 || o === !1 || (r.startsWith("on") && typeof o == "function" ? i.addEventListener(r.slice(2).toLowerCase(), o) : r === "className" ? i.className = String(o) : r === "innerHTML" ? i.innerHTML = String(o) : r === "textContent" ? i.textContent = String(o) : o === !0 ? i.setAttribute(r, "") : i.setAttribute(r, String(o)));
  for (const r of n)
    r == null || r === !1 || (typeof r == "string" ? i.appendChild(document.createTextNode(r)) : i.appendChild(r));
  return i;
}
function de(e) {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
}
function At(e, ...t) {
  de(e);
  for (const n of t)
    n == null || n === !1 || (typeof n == "string" ? e.appendChild(document.createTextNode(n)) : e.appendChild(n));
}
async function Bs(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.cssText = "position:fixed;left:-9999px", document.body.appendChild(t), t.select();
    const n = document.execCommand("copy");
    return document.body.removeChild(t), n;
  }
}
function $s(e) {
  if (e === 0) return "0 B";
  const t = 1024, n = ["B", "KB", "MB"], i = Math.floor(Math.log(e) / Math.log(t));
  return `${(e / t ** i).toFixed(i > 0 ? 1 : 0)} ${n[i]}`;
}
function js(e) {
  return e < 1e3 ? `${Math.round(e)} ms` : `${(e / 1e3).toFixed(2)} s`;
}
const ae = (e, t) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${1.75}" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`, U = {
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
function qs(e) {
  return e.environments.find((t) => t.name === e.activeEnvironment) || e.environments[0];
}
function hn(e) {
  return qs(e)?.baseUrl || e.spec?.servers[0]?.url || window.location.origin;
}
function Ei(e) {
  return String(e || "").replace(/\/$/, "");
}
function Vn(e) {
  return Ei(e).replace(/^https?:\/\//i, "");
}
function Ps(e) {
  return Ei(hn(e));
}
function Ci(e) {
  return Vn(hn(e));
}
function on(e) {
  const { options: t, value: n, ariaLabel: i, onChange: r, className: o, variant: a = "default", invalid: s, dataAttrs: l } = e, u = document.createElement("select");
  a === "inline" && u.setAttribute("data-variant", "inline");
  const f = [];
  if (s && f.push("invalid"), o && f.push(o), u.className = f.join(" "), i && u.setAttribute("aria-label", i), l)
    for (const [d, g] of Object.entries(l))
      u.dataset[d] = g;
  for (const d of t) {
    const g = document.createElement("option");
    g.value = d.value, g.textContent = d.label, n !== void 0 && d.value === n && (g.selected = !0), u.appendChild(g);
  }
  return r && u.addEventListener("change", () => r(u.value)), u;
}
function Ge(e) {
  const {
    type: t = "text",
    placeholder: n,
    value: i,
    ariaLabel: r,
    required: o,
    readOnly: a,
    invalid: s,
    modifiers: l,
    dataAttrs: u,
    className: f,
    onInput: d,
    onChange: g
  } = e, h = document.createElement("input");
  h.type = t;
  const y = [];
  if (l?.includes("filled") && y.push("filled"), s && y.push("invalid"), f && y.push(f), h.className = y.join(" "), n && (h.placeholder = n), i !== void 0 && (h.value = i), r && h.setAttribute("aria-label", r), o && (h.required = !0), a && (h.readOnly = !0), u)
    for (const [m, E] of Object.entries(u))
      h.dataset[m] = E;
  return d && h.addEventListener("input", () => d(h.value)), g && h.addEventListener("change", () => g(h.value)), h;
}
const Ds = {
  primary: ["primary", "m"],
  secondary: ["secondary", "m"],
  ghost: ["s", "u-text-muted"],
  icon: ["icon", "m", "u-text-muted"]
};
function Hs(e = "secondary") {
  return ["btn", ...Ds[e]];
}
function Re(e) {
  const { variant: t = "secondary", label: n, icon: i, ariaLabel: r, disabled: o, className: a, onClick: s } = e, l = document.createElement("button");
  l.type = "button";
  const u = Hs(t);
  if (a && u.push(...a.split(/\s+/).filter(Boolean)), l.className = u.join(" "), i) {
    const f = document.createElement("span");
    f.className = "btn-icon-slot", f.innerHTML = i, l.appendChild(f);
  }
  if (n) {
    const f = document.createElement("span");
    f.textContent = n, l.appendChild(f);
  }
  return r && l.setAttribute("aria-label", r), o && (l.disabled = !0), s && l.addEventListener("click", s), l;
}
function wi(e) {
  return e === "default" || e === "transparent" ? "u-text-muted" : `u-text-${e}`;
}
function Jn(e) {
  return e === "default" ? "u-bg-surface-hover" : e === "transparent" ? "u-bg-transparent" : `u-bg-${e}-soft`;
}
function Fs(e) {
  const t = e.toLowerCase();
  return t === "get" ? "green" : t === "post" ? "blue" : t === "put" || t === "patch" ? "orange" : t === "delete" ? "red" : "default";
}
function ki(e) {
  const t = e.trim();
  return t.startsWith("2") ? "green" : t.startsWith("3") ? "blue" : t.startsWith("4") ? "orange" : t.startsWith("5") ? "red" : "default";
}
function Us(e, t) {
  return e.color ? e.color : t === "method" ? Fs(e.method || e.text) : t === "status" ? ki(e.statusCode || e.text) : t === "webhook" ? "purple" : t === "required" ? "orange" : "default";
}
function B(e) {
  const t = document.createElement("span"), n = e.kind || "chip", i = Us(e, n), o = ["badge", e.size || "m"];
  return n === "status" && o.push("status"), n === "required" && o.push("required"), o.push(wi(i), Jn(i)), e.className && o.push(e.className), t.className = o.join(" "), t.textContent = e.text, t;
}
function an(e, t) {
  const n = t?.active ?? !1, i = t?.context ?? !1, r = document.createElement("button");
  return r.type = "button", r.className = `badge m interactive${n ? " is-active" : ""}`, i && (r.dataset.badgeContext = "true"), r.textContent = e, r;
}
function zs(e, t = !1) {
  const n = document.createElement("button");
  n.type = "button";
  const i = ki(e), r = ["badge", "status", "m", "interactive", wi(i)];
  return t && r.push("is-active", Jn(i)), n.className = r.join(" "), n.dataset.badgeGroup = "response-code", n.dataset.badgeColor = i, n.textContent = e, n;
}
function Br(e, t) {
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
  e.classList.add(Jn(n));
}
function De(e) {
  const { simple: t, interactive: n, active: i, className: r, onClick: o } = e || {}, a = document.createElement("div"), s = ["card"];
  return t && s.push("simple"), n && s.push("interactive"), i && s.push("active"), r && s.push(r), a.className = s.join(" "), o && (a.classList.contains("interactive") || a.classList.add("interactive"), a.addEventListener("click", o)), a;
}
function Xn(...e) {
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
function mn(e) {
  const t = document.createElement("div"), n = ["card-content"];
  return n.push("flush"), t.className = n.join(" "), t;
}
function $r(e) {
  if (typeof e == "string" || typeof e == "number") {
    const t = document.createElement("span");
    return t.textContent = String(e), t;
  }
  return e;
}
function Zn(e) {
  const t = document.createElement("div");
  if (t.className = `card-row${e.className ? ` ${e.className}` : ""}`, e.leading !== void 0 && t.append($r(e.leading)), t.append(typeof e.title == "string" ? Object.assign(document.createElement("h3"), { textContent: e.title }) : e.title), e.trailing !== void 0) {
    const n = typeof e.trailing == "string" || typeof e.trailing == "number" ? B({ text: String(e.trailing), kind: "chip", size: "m" }) : $r(e.trailing);
    t.append(n);
  }
  return t;
}
function Ws(e) {
  return typeof e == "string" ? c("span", { textContent: e }) : e;
}
function Ni(e) {
  return c("h2", { textContent: e });
}
function Qn(e, t) {
  const n = c("div", { className: "section-head" });
  return n.append(typeof e == "string" ? Ni(e) : e), t !== void 0 && n.append(typeof t == "string" || typeof t == "number" ? B({ text: String(t), kind: "chip", size: "m" }) : t), n;
}
function be(e, ...t) {
  const n = c("div", { className: `block section${e.className ? ` ${e.className}` : ""}` });
  e.titleEl ? n.append(e.titleEl) : e.title && (e.badge !== void 0 ? n.append(Qn(e.title, e.badge)) : n.append(Ni(e.title)));
  for (const i of t) n.append(Ws(i));
  return n;
}
function er(e, t) {
  const n = c("nav", {
    className: `breadcrumb${t?.className ? ` ${t.className}` : ""}`,
    "aria-label": "Breadcrumb"
  }), i = c("div", { className: "breadcrumb-main" });
  return t?.leading?.length && i.append(...t.leading), e.forEach((r, o) => {
    if (o > 0 && i.append(c("span", { className: "breadcrumb-sep", textContent: "/" })), r.href || r.onClick) {
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
function tr(e) {
  const { configured: t, variant: n = "tag", title: i } = e, r = t ? U.unlock : U.lock, o = n === "tag" ? "tag-op-lock" : n === "nav" ? "nav-item-lock" : "endpoint-meta-icon", a = n !== "endpoint" ? ` ${o}--${t ? "configured" : "required"}` : "";
  return c("span", {
    className: `${o}${a}`.trim(),
    innerHTML: r,
    ...i ? { title: i, "aria-label": i } : {}
  });
}
function Ai(e) {
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
let vt = null, $n = null;
function Oi() {
  $n?.(), $n = null;
}
function On() {
  Oi(), vt && vt.close(), vt = null;
}
function Ks(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? "Bearer Token" : t === "basic" ? "Basic Auth" : `HTTP ${e.scheme || ""}`;
  }
  return e.type === "apiKey" ? `API Key (${e.in === "header" ? "Header" : e.in === "query" ? "Query" : e.in === "cookie" ? "Cookie" : ""}: ${e.name || "?"})` : e.type === "oauth2" ? "OAuth 2.0" : e.type === "openIdConnect" ? "OpenID Connect" : e.type;
}
function Gs(e) {
  return zn(e);
}
function Kt(e) {
  requestAnimationFrame(() => e.focus());
}
function Ln(e, t) {
  const n = c("div", { className: "modal field" });
  return n.append(c("label", { className: "modal label", textContent: e }), t), n;
}
function Ot(e) {
  return Ge({
    className: "modal input",
    placeholder: e.placeholder,
    value: e.value,
    ariaLabel: e.ariaLabel,
    type: e.type
  });
}
function Ys(e) {
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
function Vs(e) {
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
function Js(e) {
  if (!e) return { username: "", password: "" };
  try {
    const n = Vs(e).split(":");
    return {
      username: n[0] || "",
      password: n.slice(1).join(":") || ""
    };
  } catch {
    return { username: "", password: "" };
  }
}
function Tn(e, t, n) {
  de(n);
  const i = C.get().auth.schemes[e] || "", r = t.type, o = (t.scheme || "").toLowerCase();
  if (r === "http" && o === "bearer") {
    const a = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = Ot({
      placeholder: "Bearer token...",
      value: i,
      ariaLabel: "Bearer token",
      type: "password"
    }), u = Re({
      variant: "icon",
      icon: U.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => C.setSchemeValue(e, l.value)), s.append(l, u), a.append(c("label", { className: "modal label", textContent: "Token" }), s), n.append(a), Kt(l);
  } else if (r === "http" && o === "basic") {
    const a = Js(i), s = Ot({
      placeholder: "Username",
      value: a.username,
      ariaLabel: "Username"
    });
    n.append(Ln("Username", s));
    const l = Ot({
      placeholder: "Password",
      value: a.password,
      ariaLabel: "Password",
      type: "password"
    });
    n.append(Ln("Password", l));
    const u = () => {
      const f = `${s.value}:${l.value}`, d = f === ":" ? "" : Ys(f);
      C.setSchemeValue(e, d);
    };
    s.addEventListener("input", u), l.addEventListener("input", u), Kt(s);
  } else if (r === "apiKey") {
    const a = c("div", { className: "modal field" }), s = c("div", { className: "modal input-wrap" }), l = Ot({
      placeholder: `${t.name || "API key"}...`,
      value: i,
      ariaLabel: "API key",
      type: "password"
    }), u = Re({
      variant: "icon",
      icon: U.key,
      ariaLabel: "Show/Hide",
      className: "l secondary u-text-muted",
      onClick: () => {
        l.type = l.type === "password" ? "text" : "password";
      }
    });
    l.addEventListener("input", () => {
      C.setSchemeValue(e, l.value);
    }), s.append(l, u), a.append(c("label", { className: "modal label", textContent: `API Key (${t.name || "key"})` }), s), n.append(a), Kt(l);
  } else {
    const a = Ot({
      placeholder: "Token...",
      value: i,
      ariaLabel: "Token",
      type: "password"
    });
    a.addEventListener("input", () => {
      C.setSchemeValue(e, a.value);
    }), n.append(Ln("Token / Credential", a)), Kt(a);
  }
}
function Li(e, t, n) {
  vt && On();
  const i = Object.entries(e);
  if (i.length === 0) return;
  const r = Ai({
    overlayClass: "modal overlay",
    modalClass: "modal container",
    ariaLabel: "Authentication Settings",
    dataOverlayAttr: "data-auth-overlay",
    onClose: () => {
      Oi(), vt = null;
    }
  });
  vt = r;
  const o = r.modal, a = c("div", { className: "modal header" });
  a.append(c("h2", { className: "modal title", textContent: "Authentication" }));
  const s = Re({ variant: "icon", icon: U.close, ariaLabel: "Close", onClick: On });
  a.append(s), o.append(a);
  const l = c("div", { className: "modal body" });
  let u = n || C.get().auth.activeScheme || i[0][0];
  e[u] || (u = i[0][0]);
  const f = c("div", { className: "modal fields" });
  if (i.length > 1) {
    const v = c("div", { className: "modal tabs" }), x = /* @__PURE__ */ new Map(), j = [], T = (O, P, N) => {
      const H = nr(P);
      if (O.setAttribute("data-configured", H ? "true" : "false"), de(O), H) {
        const Y = c("span", { className: "modal tab-check", "aria-hidden": "true" });
        Y.innerHTML = U.check, O.append(Y);
      }
      O.append(c("span", { className: "modal tab-label", textContent: Gs(N) }));
    };
    for (const [O, P] of i) {
      const N = c("button", {
        type: "button",
        className: "modal tab",
        "aria-pressed": O === u ? "true" : "false"
      });
      T(N, O, P), N.addEventListener("click", () => {
        if (u !== O) {
          u = O;
          for (const H of j) H.setAttribute("aria-pressed", "false");
          N.setAttribute("aria-pressed", "true"), g(), Tn(O, P, f);
        }
      }), x.set(O, N), j.push(N), v.append(N);
    }
    $n = C.subscribe(() => {
      for (const [O, P] of i) {
        const N = x.get(O);
        N && T(N, O, P);
      }
    }), l.append(v);
  }
  const d = c("div", { className: "modal scheme-desc" });
  function g() {
    const v = e[u];
    if (!v) return;
    de(d);
    const x = c("div", { className: "modal scheme-title", textContent: Ks(v) });
    d.append(x), v.description && d.append(c("div", { className: "modal scheme-text", textContent: v.description }));
  }
  g(), l.append(d);
  const h = e[u];
  h && Tn(u, h, f), l.append(f), o.append(l);
  const y = c("div", { className: "modal footer" }), m = Re({
    variant: "ghost",
    label: "Reset",
    onClick: () => {
      C.setSchemeValue(u, "");
      const v = e[u];
      v && Tn(u, v, f);
    }
  }), E = Re({ variant: "primary", label: "Done", onClick: On });
  y.append(m, c("div", { className: "grow" }), E), o.append(y), r.mount(t ?? document.querySelector(".root") ?? document.body);
}
function nr(e) {
  return !!C.get().auth.schemes[e];
}
function rr(e, t) {
  const n = Rt(e, t), i = C.get().auth, r = pn(n, i.schemes, i.activeScheme, i.token);
  return Object.keys(r.headers).length > 0 || Object.keys(r.query).length > 0 || Object.keys(r.cookies).length > 0;
}
function ir(e, t) {
  const n = Rt(e, t), i = C.get().auth;
  return pn(n, i.schemes, i.activeScheme, i.token).headers;
}
function Xs(e, t) {
  const n = Rt(e, t), i = C.get().auth;
  return pn(n, i.schemes, i.activeScheme, i.token).query;
}
function Zs(e, t) {
  const n = Rt(e, t), i = C.get().auth;
  return pn(n, i.schemes, i.activeScheme, i.token).cookies;
}
function or(e, t) {
  const n = Rt(e, t);
  return Oo(n);
}
function Rt(e, t) {
  if (e)
    return Array.isArray(e) ? Un(e, t, !1) : e;
}
let Ie = -1, sn = null, Ze = null;
function Ti() {
  cn();
  const e = Ai({
    overlayClass: "modal overlay search-modal-overlay",
    modalClass: "modal container search-modal",
    ariaLabel: "Search API",
    dataOverlayAttr: "data-search-overlay",
    onClose: () => {
      sn = null, C.set({ searchOpen: !1 });
    }
  });
  sn = e;
  const t = e.modal, n = c("div", { className: "search-input-wrap" });
  n.innerHTML = U.search;
  const i = Ge({
    className: "search-input",
    placeholder: "Search endpoints, schemas...",
    ariaLabel: "Search"
  }), r = c("kbd", { textContent: "ESC", className: "kbd" });
  n.append(i, r), t.append(n);
  const o = c("div", { className: "search-results", role: "listbox" }), a = c("div", { className: "search-empty", textContent: "Type to search across endpoints and schemas" });
  o.append(a), t.append(o);
  const s = c("div", { className: "search-footer" });
  s.innerHTML = '<span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> Navigate</span><span><kbd class="kbd">↵</kbd> Select</span><span><kbd class="kbd">ESC</kbd> Close</span>', t.append(s), e.mount(document.querySelector(".root") ?? document.body), requestAnimationFrame(() => i.focus()), Ie = -1;
  let l = [];
  i.addEventListener("input", () => {
    const u = i.value;
    l = Is(u), Qs(o, l), Jt(o, l.length > 0 ? 0 : -1);
  }), i.addEventListener("keydown", (u) => {
    const f = u;
    f.key === "ArrowDown" ? (f.preventDefault(), l.length > 0 && Jt(o, Math.min(Ie + 1, l.length - 1))) : f.key === "ArrowUp" ? (f.preventDefault(), l.length > 0 && Jt(o, Math.max(Ie - 1, 0))) : f.key === "Enter" ? (f.preventDefault(), Ie >= 0 && Ie < l.length && _i(l[Ie])) : f.key === "Escape" && (f.preventDefault(), cn());
  });
}
function cn() {
  if (sn) {
    sn.close();
    return;
  }
  const e = document.querySelector("[data-search-overlay]");
  e && e.remove(), C.set({ searchOpen: !1 });
}
function Qs(e, t) {
  if (de(e), t.length === 0) {
    e.append(c("div", { className: "search-empty", textContent: "No results found" }));
    return;
  }
  const n = document.createDocumentFragment();
  t.forEach((i, r) => {
    const o = c("div", {
      className: "search-result",
      role: "option",
      "aria-selected": "false",
      "data-index": String(r)
    });
    i.method ? o.append(B({
      text: i.method.toUpperCase(),
      kind: "method",
      method: i.method
    })) : i.type === "schema" ? o.append(B({ text: "SCH", kind: "chip", size: "m" })) : i.type === "tag" && o.append(B({ text: "TAG", kind: "chip", size: "m" }));
    const a = c("div", { className: "search-result-info min-w-0" });
    if (a.append(c("span", { className: "search-result-title", textContent: i.title })), i.subtitle && a.append(c("span", { className: "search-result-subtitle", textContent: i.subtitle })), o.append(a), i.method && i.requiresAuth && i.resolvedSecurity) {
      const s = C.get().spec, l = rr(i.resolvedSecurity, s?.securitySchemes || {});
      o.append(c("span", {
        className: `search-result-lock search-result-lock--${l ? "configured" : "required"}`,
        innerHTML: l ? U.unlock : U.lock,
        title: i.authTitle || "Requires authentication",
        "aria-label": i.authTitle || "Requires authentication"
      }));
    }
    o.addEventListener("click", () => _i(i)), o.addEventListener("mouseenter", () => {
      Jt(e, r);
    }), n.append(o);
  }), e.append(n);
}
function Jt(e, t) {
  if (Ie === t) return;
  if (Ie >= 0) {
    const i = e.querySelector(`.search-result[data-index="${Ie}"]`);
    i && (i.classList.remove("focused"), i.setAttribute("aria-selected", "false"));
  }
  if (Ie = t, t < 0) return;
  const n = e.querySelector(`.search-result[data-index="${t}"]`);
  n && (n.classList.add("focused"), n.setAttribute("aria-selected", "true"), n.scrollIntoView({ block: "nearest" }));
}
function _i(e) {
  cn(), e.type === "operation" ? se(ce({
    type: "endpoint",
    tag: e.tag || "default",
    method: e.method,
    path: e.path,
    operationId: e.operationId
  })) : e.type === "schema" ? se(ce({ type: "schema", schemaName: e.schemaName })) : e.type === "tag" && e.tag ? se(ce({ type: "tag", tag: e.tag })) : e.type === "webhook" && e.webhookName && se(ce({ type: "webhook", webhookName: e.webhookName }));
}
function ec() {
  return Ze && document.removeEventListener("keydown", Ze), Ze = (e) => {
    (e.metaKey || e.ctrlKey) && e.key === "k" && (e.preventDefault(), C.get().searchOpen ? cn() : (C.set({ searchOpen: !0 }), Ti()));
  }, document.addEventListener("keydown", Ze), () => {
    Ze && (document.removeEventListener("keydown", Ze), Ze = null);
  };
}
function tc(e, t) {
  const n = e.querySelectorAll(".nav-item");
  let i = null;
  n.forEach((o) => {
    const a = o, s = ac(a), l = a.getAttribute("href");
    if (!l && !s) return;
    const u = l?.startsWith("#") ? l.slice(1) : l || "", f = s || Qr(u), d = Et(f, t);
    o.classList.toggle("active", d), d ? (a.setAttribute("aria-current", "page"), i = a) : a.removeAttribute("aria-current");
  });
  const r = t.type === "endpoint" || t.type === "tag" ? t.tag : t.type === "schema" ? "schemas" : null;
  if (r) {
    const o = e.querySelector(`[data-nav-tag="${CSS.escape(r)}"]`);
    if (o) {
      const a = o.querySelector(".nav-group-header"), s = o.querySelector(".nav-group-items");
      a && s && (a.classList.add("expanded"), s.classList.remove("collapsed"));
    }
  }
  i && requestAnimationFrame(() => {
    const a = i.closest(".nav-group")?.querySelector(".nav-group-header");
    a ? a.scrollIntoView({ block: "start", behavior: "smooth" }) : i.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function jr(e, t) {
  const n = C.get(), i = n.spec;
  if (!i) return;
  de(e);
  const r = t.title || i.info.title || "API Docs", o = i.info.version ? `v${i.info.version}` : "", a = c("div", { className: "top" }), s = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted",
    "aria-label": "Collapse sidebar"
  });
  s.innerHTML = U.chevronLeft, s.addEventListener("click", () => C.set({ sidebarOpen: !1 }));
  const l = c("a", { className: "title", href: "/", textContent: r });
  l.addEventListener("click", (T) => {
    T.preventDefault(), se("/");
  });
  const u = c("div", { className: "title-wrap" });
  if (u.append(l), o && u.append(c("span", { className: "version", textContent: o })), a.append(s, u), i.securitySchemes && Object.keys(i.securitySchemes).length > 0) {
    const T = Object.keys(i.securitySchemes), O = n.auth.activeScheme || T[0] || "", P = nr(O), N = c("button", {
      type: "button",
      className: "btn icon s soft u-text-muted theme",
      "aria-label": "Configure authentication",
      title: P ? `Auth: ${O}` : "Configure authentication"
    });
    N.innerHTML = P ? U.unlock : U.lock, N.classList.toggle("active", P), N.addEventListener("click", () => {
      const Y = C.get().auth.activeScheme || T[0] || "";
      Li(
        i.securitySchemes,
        e.closest(".root") ?? void 0,
        Y
      );
    }), a.append(N);
  }
  const f = c("button", {
    type: "button",
    className: "btn icon s soft u-text-muted theme",
    "aria-label": "Toggle theme"
  });
  if (f.innerHTML = C.get().theme === "light" ? U.moon : U.sun, f.addEventListener("click", () => {
    Ms(), f.innerHTML = C.get().theme === "light" ? U.moon : U.sun;
  }), e.append(a), n.environments.length > 1) {
    const T = sc(n);
    e.append(T);
  }
  const d = c("div", { className: "search" }), g = c("span", { className: "search-icon", innerHTML: U.search }), h = Ge({
    className: "search-input",
    placeholder: "Search endpoints...",
    ariaLabel: "Search endpoints"
  }), y = c("span", { className: "kbd", textContent: "⌘K" });
  h.addEventListener("focus", () => {
    C.set({ searchOpen: !0 }), h.blur(), Ti();
  }), d.append(g, h, y), e.append(d);
  const m = c("nav", { className: "nav", "aria-label": "API navigation" }), E = ic({ type: "overview" }, n.route);
  m.append(E);
  for (const T of i.tags) {
    if (T.operations.length === 0) continue;
    const O = nc(T, n.route);
    m.append(O);
  }
  if (i.webhooks && i.webhooks.length > 0) {
    const T = c("div", { className: "nav-group", "data-nav-tag": "webhooks" }), O = qr("Webhooks", i.webhooks.length), P = c("div", { className: "nav-group-items" });
    for (const H of i.webhooks) {
      const Y = { type: "webhook", webhookName: H.name }, W = Pr(H.summary || H.name, H.method, Y, n.route);
      W.classList.add("nav-item-webhook"), P.append(W);
    }
    O.addEventListener("click", () => {
      O.classList.toggle("expanded"), P.classList.toggle("collapsed");
    });
    const N = n.route.type === "webhook";
    O.classList.toggle("expanded", N), P.classList.toggle("collapsed", !N), T.append(O, P), m.append(T);
  }
  const v = Object.keys(i.schemas);
  if (v.length > 0) {
    const T = c("div", { className: "nav-group" }), O = qr("Schemas", v.length), P = c("div", { className: "nav-group-items" });
    for (const H of v) {
      const W = Pr(H, void 0, { type: "schema", schemaName: H }, n.route);
      P.append(W);
    }
    O.addEventListener("click", () => {
      O.classList.toggle("expanded"), P.classList.toggle("collapsed");
    });
    const N = n.route.type === "schema";
    O.classList.toggle("expanded", N), P.classList.toggle("collapsed", !N), T.setAttribute("data-nav-tag", "schemas"), T.append(O, P), m.append(T);
  }
  e.append(m);
  const x = c("div", { className: "footer" }), j = c("a", {
    className: "credit",
    href: "https://puredocs.dev",
    target: "_blank",
    rel: "noopener noreferrer"
  });
  j.textContent = `puredocs.dev${o ? ` ${o}` : ""}`, x.append(j), x.append(f), e.append(x), requestAnimationFrame(() => {
    const T = m.querySelector(".nav-item.active");
    if (T) {
      const P = T.closest(".nav-group")?.querySelector(".nav-group-header");
      P ? P.scrollIntoView({ block: "start", behavior: "smooth" }) : T.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
function nc(e, t, n) {
  const i = c("div", { className: "nav-group", "data-nav-tag": e.name }), r = rc(e, t), o = c("div", { className: "nav-group-items" }), a = t.type === "tag" && t.tag === e.name || e.operations.some((s) => Et(jn(s, e.name), t));
  for (const s of e.operations) {
    const l = jn(s, e.name), u = oc(s, l, t);
    o.append(u);
  }
  return r.addEventListener("click", (s) => {
    s.target.closest(".nav-group-link") || (r.classList.toggle("expanded"), o.classList.toggle("collapsed"));
  }), o.classList.toggle("collapsed", !a), i.append(r, o), i;
}
function rc(e, t) {
  const n = t.type === "tag" && t.tag === e.name || e.operations.some((a) => Et(jn(a, e.name), t)), i = c("div", { className: "nav-group-header focus-ring", "aria-expanded": String(n), tabIndex: 0 }), r = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": n ? "Collapse" : "Expand"
  });
  r.innerHTML = U.chevronRight, r.addEventListener("click", (a) => {
    a.preventDefault(), a.stopPropagation(), i.click();
  });
  const o = c("a", {
    className: "nav-group-link",
    href: ce({ type: "tag", tag: e.name })
  });
  return o.append(
    c("span", { className: "nav-group-title", textContent: e.name }),
    c("span", { className: "nav-group-count", textContent: String(e.operations.length) })
  ), o.addEventListener("click", (a) => {
    a.preventDefault(), se(ce({ type: "tag", tag: e.name }));
  }), i.append(r, o), i.classList.toggle("expanded", n), i.addEventListener("keydown", (a) => {
    (a.key === "Enter" || a.key === " ") && (a.preventDefault(), r.click());
  }), i;
}
function qr(e, t) {
  const n = c("div", { className: "nav-group-header focus-ring", role: "button", "aria-expanded": "true", tabindex: "0" }), i = c("button", {
    type: "button",
    className: "nav-group-chevron",
    "aria-label": "Toggle section"
  });
  i.innerHTML = U.chevronRight, i.addEventListener("click", (o) => {
    o.preventDefault(), o.stopPropagation(), n.click();
  });
  const r = c("span", { className: "nav-group-link nav-group-link--static" });
  return r.append(
    c("span", { className: "nav-group-title", textContent: e }),
    c("span", { className: "nav-group-count", textContent: String(t) })
  ), n.append(i, r), n.addEventListener("keydown", (o) => {
    (o.key === "Enter" || o.key === " ") && (o.preventDefault(), n.click());
  }), n;
}
function Pr(e, t, n, i) {
  const r = Et(n, i), o = c("a", {
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
  return t || a.setAttribute("aria-hidden", "true"), o.append(a), o.append(c("span", { className: "nav-item-label", textContent: e })), o.addEventListener("click", (s) => {
    s.preventDefault(), se(ce(n));
  }), o;
}
function ic(e, t) {
  const n = Et(e, t), i = c("a", {
    className: `nav-item nav-item-overview${n ? " active" : ""}`,
    href: ce(e),
    role: "link",
    "aria-current": n ? "page" : void 0
  }), r = c("span", { className: "nav-overview-icon-slot" });
  r.innerHTML = U.globe;
  const o = c("span", { className: "nav-item-label", textContent: "Overview" });
  return i.append(r, o), i.addEventListener("click", (a) => {
    a.preventDefault(), se(ce(e));
  }), i;
}
function oc(e, t, n) {
  const i = Et(t, n), r = c("a", {
    className: `nav-item${i ? " active" : ""}${e.deprecated ? " deprecated" : ""}`,
    href: ce(t),
    title: `${e.method.toUpperCase()} ${e.path}`,
    "aria-current": i ? "page" : void 0
  });
  r.dataset.routeType = "endpoint", t.operationId && (r.dataset.routeOperationId = t.operationId), t.method && (r.dataset.routeMethod = t.method), t.path && (r.dataset.routePath = t.path), t.tag && (r.dataset.routeTag = t.tag);
  const o = C.get().spec, a = pe(e.resolvedSecurity) ? tr({
    configured: rr(e.resolvedSecurity, o?.securitySchemes || {}),
    variant: "nav",
    title: bt(e.resolvedSecurity)
  }) : null;
  return r.append(
    B({
      text: e.method.toUpperCase(),
      kind: "method",
      method: e.method
    }),
    c("span", { className: "nav-item-label", textContent: e.summary || e.path }),
    ...a ? [a] : []
  ), r.addEventListener("click", (s) => {
    s.preventDefault(), se(ce(t));
  }), r;
}
function jn(e, t) {
  return {
    type: "endpoint",
    tag: t,
    method: e.method,
    path: e.path,
    operationId: e.operationId
  };
}
function Et(e, t) {
  return e.type !== t.type ? !1 : e.type === "overview" ? !0 : e.type === "tag" ? e.tag === t.tag : e.type === "endpoint" ? e.operationId && t.operationId ? e.operationId === t.operationId : e.method === t.method && e.path === t.path : e.type === "schema" ? e.schemaName === t.schemaName : e.type === "webhook" ? e.webhookName === t.webhookName : !1;
}
function ac(e) {
  const { routeType: t } = e.dataset;
  return t && t === "endpoint" ? {
    type: "endpoint",
    operationId: e.dataset.routeOperationId || void 0,
    method: e.dataset.routeMethod || void 0,
    path: e.dataset.routePath || void 0,
    tag: e.dataset.routeTag || void 0
  } : null;
}
function sc(e) {
  const t = e.initialEnvironments || e.environments, n = e.environments.map((r) => {
    const o = t.find((s) => s.name === r.name), a = Vn((o?.baseUrl ?? r.baseUrl) || "");
    return { value: r.name, label: a || "(no URL)" };
  });
  return on({
    options: n,
    value: e.activeEnvironment,
    ariaLabel: "Select server environment",
    onChange: (r) => C.setActiveEnvironment(r),
    className: "env"
  });
}
function Ii(e, t, n = "No operations") {
  const i = c("div", { className: "summary-line" });
  for (const o of e)
    i.append(B({
      text: `${o.value} ${o.label}`,
      kind: "chip",
      size: "m"
    }));
  const r = ["get", "post", "put", "patch", "delete", "head", "options"];
  for (const o of r) {
    const a = t[o] || 0;
    a !== 0 && i.append(B({
      kind: "method",
      method: o,
      size: "m",
      text: `${a} ${o.toUpperCase()}`
    }));
  }
  return i.childNodes.length || i.append(B({
    text: n,
    kind: "chip",
    size: "m"
  })), i;
}
function cc(e, t) {
  const n = [], i = lc(e, t);
  return i && n.push(i), n;
}
function lc(e, t) {
  if (Object.keys(e).length === 0) return null;
  const n = be({ title: "Authentication" });
  for (const [i, r] of Object.entries(e)) {
    const o = nr(i), a = De({ className: "card-group card-auth" }), s = c("div", { className: "card-auth-main" }), l = c("div", { className: "card-info card-auth-info" }), u = `${r.type}${r.scheme ? ` / ${r.scheme}` : ""}`;
    l.append(
      c("h3", { textContent: i }),
      c("p", { className: "card-auth-type", textContent: u })
    ), r.description && l.append(c("p", { className: "card-auth-desc", textContent: String(r.description) }));
    const f = Re({
      variant: "secondary",
      icon: o ? U.check : U.settings,
      label: o ? "Success" : "Set",
      className: `card-auth-config${o ? " active is-configured" : ""}`,
      onClick: (d) => {
        d.stopPropagation(), Li(e, t, i);
      }
    });
    s.append(l), a.append(s, f), n.append(a);
  }
  return n;
}
async function Dr(e, t) {
  de(e);
  const n = C.get().spec;
  if (!n) return;
  const i = c("div", { className: "block header" }), r = c("div", { className: "title" });
  r.append(
    c("h1", { textContent: n.info.title }),
    c("span", { className: "version", textContent: `v${n.info.version}` })
  ), i.append(r), n.info.description && i.append(c("p", { textContent: n.info.description })), e.append(i);
  const o = n.operations.filter((f) => pe(f.resolvedSecurity)).length, a = n.operations.filter((f) => f.deprecated).length, s = dc(n.operations);
  if (e.append(be(
    { className: "summary" },
    Ii(
      [
        { label: "Endpoints", value: n.operations.length },
        { label: "Auth Required", value: o },
        { label: "Deprecated", value: a }
      ],
      s,
      "No operations"
    )
  )), n.servers.length > 0) {
    const f = be({ title: "Servers" }), d = C.get(), g = d.initialEnvironments || d.environments;
    for (const h of n.servers) {
      const y = g.find((O) => O.baseUrl === h.url), m = y?.name === d.activeEnvironment, E = De({
        interactive: !0,
        active: m,
        className: "card-group",
        onClick: () => {
          y && C.setActiveEnvironment(y.name);
        }
      });
      E.title = "Click to set as active environment";
      const v = c("div", { className: "card-info" }), x = c("div", { className: "inline-cluster inline-cluster-sm" }), j = c("span", { className: "icon-muted" });
      j.innerHTML = U.server, x.append(j, c("code", { textContent: h.url })), v.append(x), h.description && v.append(c("p", { textContent: h.description }));
      const T = c("div", { className: "card-badges" });
      E.append(v, T), f.append(E);
    }
    e.append(f);
  }
  const l = e.closest(".root") ?? void 0, u = cc(n.securitySchemes || {}, l);
  for (const f of u)
    e.append(f);
  if (n.tags.length > 0) {
    const f = be({ title: "API Groups" });
    for (const d of n.tags)
      d.operations.length !== 0 && f.append(uc(d));
    e.append(f);
  }
  if (n.webhooks && n.webhooks.length > 0) {
    const f = be({ title: "Webhooks" });
    for (const d of n.webhooks) {
      const g = De({
        interactive: !0,
        className: "card-group",
        onClick: () => se(ce({ type: "webhook", webhookName: d.name }))
      }), h = c("div", { className: "card-info" });
      h.append(
        c("h3", { textContent: d.summary || d.name }),
        d.description ? c("p", { textContent: d.description }) : c("p", { textContent: `${d.method.toUpperCase()} webhook` })
      );
      const y = c("div", { className: "card-badges" });
      y.append(
        B({ text: "WH", kind: "webhook", size: "s" }),
        B({ text: d.method.toUpperCase(), kind: "method", method: d.method, size: "s" })
      ), g.append(h, y), f.append(g);
    }
    e.append(f);
  }
}
function uc(e) {
  const t = De({
    interactive: !0,
    className: "card-group",
    onClick: () => se(ce({ type: "tag", tag: e.name }))
  }), n = c("div", { className: "card-info" });
  n.append(
    c("h3", { textContent: e.name }),
    c("p", { textContent: e.description || `${e.operations.length} endpoints` })
  );
  const i = pc(e), r = c("div", { className: "card-badges" });
  for (const [o, a] of Object.entries(i)) {
    const s = B({
      text: o.toUpperCase(),
      kind: "method",
      method: o,
      size: "m"
    });
    s.textContent = `${a} ${o.toUpperCase()}`, r.append(s);
  }
  return t.append(n, r), t;
}
function dc(e) {
  const t = {};
  for (const n of e)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function pc(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
function Bt(e) {
  if (!e) return "any";
  if (e.$ref) return e.$ref.split("/").pop() || "ref";
  let t = e.type || "";
  return e.allOf ? t = "allOf" : e.oneOf ? t = "oneOf" : e.anyOf ? t = "anyOf" : e.enum ? t = "enum" : e.format && (t += `<${e.format}>`), e.type === "array" && e.items && !e.enum && (t = `${e.items.type || e.items.$ref?.split("/").pop() || "any"}[]`), e.nullable && (t += " | null"), t || "object";
}
function fc(e) {
  const t = c("div", { className: "schema" }), n = c("div", { className: "body" });
  t.append(n);
  const i = [];
  Ri(n, e, "", 0, /* @__PURE__ */ new Set(), i);
  const r = i.length > 0, o = () => i.some(({ children: s }) => s.style.display !== "none");
  return { body: t, toggleCollapse: () => {
    const s = !o();
    ji(i, s);
  }, isExpanded: o, hasExpandable: r };
}
function St(e, t) {
  const n = De(), i = Bt(e), r = mn(), o = c("div", { className: "schema" }), a = c("div", { className: "body" });
  o.append(a);
  const s = [];
  if (Ri(a, e, "", 0, /* @__PURE__ */ new Set(), s), r.append(o), t) {
    const l = Xn(), u = typeof t == "string" ? c("h3", { textContent: t }) : t, f = s.length > 0, d = f && s.some(({ children: y }) => y.style.display !== "none"), g = B({ text: i, kind: "chip", size: "m" }), h = f ? c("button", {
      className: d ? "schema-collapse-btn is-expanded" : "schema-collapse-btn",
      type: "button",
      title: d ? "Collapse all fields" : "Expand all fields"
    }) : null;
    if (h && (h.innerHTML = U.chevronDown, h.addEventListener("click", (y) => {
      y.stopPropagation();
      const m = !h.classList.contains("is-expanded");
      ji(s, m), h.classList.toggle("is-expanded", m), h.title = m ? "Collapse all fields" : "Expand all fields";
    })), u.classList.contains("card-row"))
      u.classList.add("schema-header-row"), u.append(g), h && u.append(h), l.append(u);
    else {
      const y = c("div", { className: "card-row schema-header-row" });
      y.append(u, g), h && y.append(h), l.append(y);
    }
    n.prepend(l);
  }
  return n.append(r), n;
}
function Mi(e, t) {
  const { headerTitle: n, withEnumAndDefault: i = !0 } = t, r = e.map((u) => {
    const f = c("div", { className: "schema-row role-flat role-params" }), d = c("div", { className: "schema-main-row" }), g = c("div", { className: "schema-name-wrapper" });
    g.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: u.name })
    );
    const h = c("div", { className: "schema-meta-wrapper" });
    h.append(B({
      text: u.schema ? Bt(u.schema) : "unknown",
      kind: "chip",
      size: "m"
    })), u.required && h.append(B({ text: "required", kind: "required", size: "m" })), d.append(g, h), f.append(d);
    const y = c("div", { className: "schema-desc-col is-root" });
    u.description && y.append(c("p", { textContent: u.description }));
    const m = u.schema?.enum, E = u.schema?.default !== void 0;
    if (i && (m && m.length > 0 || E)) {
      const v = c("div", { className: "schema-enum-values" });
      if (E && v.append(B({
        text: `Default: ${JSON.stringify(u.schema.default)}`,
        kind: "chip",
        size: "s"
      })), m)
        for (const x of m) {
          const j = String(x);
          j !== u.in && v.append(B({ text: j, kind: "chip", size: "s" }));
        }
      y.append(v);
    }
    return y.children.length > 0 && f.append(y), f;
  }), o = De(), a = mn(), s = c("div", { className: "params" }), l = c("div", { className: "body role-params" });
  return l.append(...r), s.append(l), a.append(s), o.append(
    Xn(Zn({ title: n })),
    a
  ), o;
}
function Gt(e, t, n, i, r, o, a) {
  const s = Bt(n), l = hc(n), u = $i(t, s, n, i, l, r);
  if (e.append(u), l) {
    const f = c("div", { className: "schema-children" });
    f.style.display = "block";
    const d = new Set(o);
    d.add(n), Bi(f, n, i + 1, d, a), e.append(f), a?.push({ row: u, children: f }), u.querySelector(".schema-toggle")?.classList.add("is-expanded"), u.classList.add("focus-ring"), u.setAttribute("aria-expanded", "true"), u.setAttribute("tabindex", "0"), u.addEventListener("click", () => {
      const g = f.style.display !== "none";
      qn(u, f, !g);
    }), u.addEventListener("keydown", (g) => {
      if (g.key !== "Enter" && g.key !== " ") return;
      g.preventDefault();
      const h = f.style.display !== "none";
      qn(u, f, !h);
    });
  }
}
function Ri(e, t, n, i, r, o) {
  if (r.has(t)) {
    e.append($i("[circular]", "circular", { description: "" }, i, !1, !1));
    return;
  }
  {
    const a = new Set(r);
    a.add(t), Bi(e, t, i, a, o);
    return;
  }
}
function Bi(e, t, n, i, r) {
  const o = new Set(t.required || []);
  if (t.properties)
    for (const [a, s] of Object.entries(t.properties))
      Gt(e, a, s, n, o.has(a), i, r);
  t.items && t.type === "array" && Gt(e, "[item]", t.items, n, !1, i, r);
  for (const a of ["allOf", "oneOf", "anyOf"]) {
    const s = t[a];
    if (Array.isArray(s))
      for (let l = 0; l < s.length; l++)
        Gt(e, `${a}[${l}]`, s[l], n, !1, i, r);
  }
  t.additionalProperties && typeof t.additionalProperties == "object" && Gt(e, "[additionalProperties]", t.additionalProperties, n, !1, i, r);
}
function $i(e, t, n, i, r, o) {
  const a = [
    "schema-row",
    i === 0 ? "is-root" : "",
    i === 0 && !r ? "is-leaf" : ""
  ].filter(Boolean).join(" "), s = c("div", { className: a, role: r ? "button" : void 0 });
  s.setAttribute("data-depth", String(i)), s.style.setProperty("--schema-depth", String(i));
  const l = c("div", { className: "schema-main-row" }), u = c("div", { className: "schema-name-wrapper" });
  r ? u.append(c("span", { className: "schema-toggle", innerHTML: U.chevronRight })) : u.append(c("span", { className: "schema-spacer" })), u.append(c("span", { textContent: e })), l.append(u);
  const f = c("div", { className: "schema-meta-wrapper" });
  f.append(B({ text: t, kind: "chip", size: "m" })), o && f.append(B({ text: "required", kind: "required", size: "m" })), l.append(f), s.append(l);
  const d = c("div", { className: `schema-desc-col${i === 0 ? " is-root" : ""}` });
  n.description && d.append(c("p", { textContent: String(n.description) }));
  const g = n.enum, h = Array.isArray(g) && g.length > 0, y = n.default, m = y !== void 0, E = h && m ? g.some((x) => _n(x, y)) : !1, v = mc(n, !h || !m);
  if (v.length > 0 || h) {
    const x = c("div", { className: "schema-constraints-row" });
    for (const j of v)
      x.append(B({
        text: j,
        kind: "chip",
        size: j.startsWith("default: ") ? "s" : "m"
      }));
    if (h) {
      const j = m && E ? [y, ...g.filter((T) => !_n(T, y))] : g;
      m && !E && x.append(B({
        text: `default: ${Xt(y)}`,
        kind: "chip",
        size: "s",
        className: "schema-enum-value is-default"
      }));
      for (const T of j) {
        const O = m && _n(T, y);
        x.append(B({
          text: O ? `default: ${Xt(T)}` : Xt(T),
          kind: "chip",
          size: "s",
          className: O ? "schema-enum-value is-default" : "schema-enum-value"
        }));
      }
    }
    d.append(x);
  }
  return d.children.length > 0 && s.append(d), s;
}
function hc(e) {
  return !!(e.properties && Object.keys(e.properties).length > 0 || e.type === "array" && e.items || e.allOf || e.oneOf || e.anyOf || e.additionalProperties && typeof e.additionalProperties == "object");
}
function mc(e, t = !0) {
  const n = [];
  return e.minLength !== void 0 && n.push(`minLength: ${e.minLength}`), e.maxLength !== void 0 && n.push(`maxLength: ${e.maxLength}`), e.minimum !== void 0 && n.push(`minimum: ${e.minimum}`), e.maximum !== void 0 && n.push(`maximum: ${e.maximum}`), e.pattern && n.push(`pattern: ${e.pattern}`), e.minItems !== void 0 && n.push(`minItems: ${e.minItems}`), e.maxItems !== void 0 && n.push(`maxItems: ${e.maxItems}`), e.uniqueItems && n.push("uniqueItems: true"), t && e.default !== void 0 && n.push(`default: ${Xt(e.default)}`), e.deprecated && n.push("deprecated: true"), e.readOnly && n.push("readOnly: true"), e.writeOnly && n.push("writeOnly: true"), n;
}
function ji(e, t) {
  for (const { row: n, children: i } of e)
    qn(n, i, t);
}
function qn(e, t, n) {
  t.style.display = n ? "block" : "none", e.querySelector(".schema-toggle")?.classList.toggle("is-expanded", n), e.setAttribute("aria-expanded", n ? "true" : "false");
}
function Xt(e) {
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (e === null) return "null";
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function _n(e, t) {
  if (e === t) return !0;
  try {
    return JSON.stringify(e) === JSON.stringify(t);
  } catch {
    return String(e) === String(t);
  }
}
async function gc(e) {
  const { method: t, url: n, headers: i = {}, body: r, timeout: o = 3e4 } = e, a = new AbortController(), s = setTimeout(() => a.abort(), o), l = performance.now();
  try {
    const u = typeof FormData < "u" && r instanceof FormData, f = {
      method: t.toUpperCase(),
      headers: u ? void 0 : i,
      signal: a.signal,
      credentials: "include"
    };
    if (u) {
      const E = {};
      for (const [v, x] of Object.entries(i))
        v.toLowerCase() !== "content-type" && (E[v] = x);
      Object.keys(E).length > 0 && (f.headers = E);
    }
    r && !["GET", "HEAD"].includes(t.toUpperCase()) && (f.body = r);
    const d = await fetch(n, f), g = performance.now() - l, h = await d.text(), y = new TextEncoder().encode(h).length, m = {};
    return d.headers.forEach((E, v) => {
      m[v.toLowerCase()] = E;
    }), yc(h, m), {
      status: d.status,
      statusText: d.statusText,
      headers: m,
      body: h,
      duration: g,
      size: y
    };
  } catch (u) {
    const f = performance.now() - l;
    return u.name === "AbortError" ? {
      status: 0,
      statusText: "Request timed out",
      headers: {},
      body: `Request timed out after ${o}ms`,
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
    clearTimeout(s);
  }
}
function yc(e, t) {
  const n = C.get().auth;
  if (n.locked) return;
  const i = C.get().spec;
  let r = n.activeScheme;
  if (i) {
    for (const [a, s] of Object.entries(i.securitySchemes))
      if (s.type === "http" && s.scheme?.toLowerCase() === "bearer") {
        r = a;
        break;
      }
  }
  const o = t["x-new-access-token"];
  if (o) {
    r ? (C.setSchemeValue(r, o), C.setAuth({ source: "auto-header" })) : C.setAuth({ token: o, source: "auto-header" });
    return;
  }
  try {
    const a = JSON.parse(e), s = a.accessToken || a.access_token || a.token;
    typeof s == "string" && s.length > 10 && (r ? (C.setSchemeValue(r, s), C.setAuth({ source: "auto-body" })) : C.setAuth({ token: s, source: "auto-body" }));
  } catch {
  }
}
function bc(e, t, n, i) {
  let r = t;
  for (const [u, f] of Object.entries(n))
    r = r.replace(`{${u}}`, encodeURIComponent(f));
  const a = e.replace(/\/+$/, "") + r, s = new URLSearchParams();
  for (const [u, f] of Object.entries(i))
    f && s.set(u, f);
  const l = s.toString();
  return l ? `${a}?${l}` : a;
}
function In(e) {
  return [
    { language: "curl", label: "cURL", code: vc(e) },
    { language: "javascript", label: "JavaScript", code: xc(e) },
    { language: "python", label: "Python", code: Sc(e) },
    { language: "go", label: "Go", code: Ec(e) }
  ];
}
function vc({ method: e, url: t, headers: n, body: i }) {
  const r = [`curl -X ${e.toUpperCase()} '${t}'`];
  for (const [o, a] of Object.entries(n))
    r.push(`  -H '${o}: ${a}'`);
  return i && r.push(`  -d '${i}'`), r.join(` \\
`);
}
function xc({ method: e, url: t, headers: n, body: i }) {
  const r = [];
  r.push(`  method: '${e.toUpperCase()}'`);
  const o = Object.entries(n);
  if (o.length > 0) {
    const a = o.map(([s, l]) => `    '${s}': '${l}'`).join(`,
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
function Sc({ method: e, url: t, headers: n, body: i }) {
  const r = ["import requests", ""], o = Object.entries(n);
  if (o.length > 0) {
    const s = o.map(([l, u]) => `    "${l}": "${u}"`).join(`,
`);
    r.push(`headers = {
${s}
}`);
  }
  i && r.push(`payload = ${i}`);
  const a = [`"${t}"`];
  return o.length > 0 && a.push("headers=headers"), i && a.push("json=payload"), r.push(""), r.push(`response = requests.${e.toLowerCase()}(${a.join(", ")})`), r.push("print(response.json())"), r.join(`
`);
}
function Ec({ method: e, url: t, headers: n, body: i }) {
  const r = [
    "package main",
    "",
    "import (",
    '    "fmt"',
    '    "io"',
    '    "net/http"'
  ];
  i && r.push('    "strings"'), r.push(")", "", "func main() {"), i ? (r.push(`    body := strings.NewReader(\`${i}\`)`), r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", body)`)) : r.push(`    req, err := http.NewRequest("${e.toUpperCase()}", "${t}", nil)`), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }");
  for (const [o, a] of Object.entries(n))
    r.push(`    req.Header.Set("${o}", "${a}")`);
  return r.push(""), r.push("    resp, err := http.DefaultClient.Do(req)"), r.push("    if err != nil {"), r.push("        panic(err)"), r.push("    }"), r.push("    defer resp.Body.Close()"), r.push(""), r.push("    data, _ := io.ReadAll(resp.Body)"), r.push("    fmt.Println(string(data))"), r.push("}"), r.join(`
`);
}
function Cc(e) {
  if (e.length === 0) return [];
  const t = (r, o, a) => {
    if (o && r.examples?.[o] !== void 0) {
      const s = r.examples[o], l = s?.value ?? s.value;
      if (l != null) return String(l);
    }
    return a !== void 0 && r.schema?.enum && r.schema.enum[a] !== void 0 ? String(r.schema.enum[a]) : r.example !== void 0 && r.example !== null ? String(r.example) : r.schema?.example !== void 0 && r.schema.example !== null ? String(r.schema.example) : r.schema?.default !== void 0 && r.schema.default !== null ? String(r.schema.default) : r.schema?.enum && r.schema.enum.length > 0 ? String(r.schema.enum[0]) : r.schema?.type === "integer" || r.schema?.type === "number" ? "0" : r.schema?.type === "boolean" ? "true" : r.in === "path" ? "id" : "value";
  }, n = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r.examples && typeof r.examples == "object")
      for (const o of Object.keys(r.examples)) n.add(o);
  const i = [];
  if (n.size > 0)
    for (const r of n) {
      const o = {};
      for (const l of e)
        o[l.name] = t(l, r);
      const s = e.find((l) => l.examples?.[r])?.examples?.[r];
      i.push({ name: r, summary: s?.summary, values: o });
    }
  else {
    const r = e.find((o) => o.schema?.enum && o.schema.enum.length > 1);
    if (r?.schema?.enum)
      for (let o = 0; o < r.schema.enum.length; o++) {
        const a = {};
        for (const l of e)
          a[l.name] = l === r ? t(l, null, o) : t(l, null);
        const s = String(r.schema.enum[o]);
        i.push({ name: s, values: a });
      }
    else {
      const o = {};
      for (const a of e)
        o[a.name] = t(a, null);
      i.push({ name: "Default", values: o });
    }
  }
  return i;
}
function qi(e) {
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
    const n = Qe(e.schema);
    n !== void 0 && t.push({ name: "Generated", value: n });
  }
  return t;
}
function wc(e) {
  const t = [e.summary, e.description].filter(Boolean);
  return [...new Set(t)].join(" — ") || e.name;
}
function Hr(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function kc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Mn, Fr;
function Nc() {
  if (Fr) return Mn;
  Fr = 1;
  function e(p) {
    return p instanceof Map ? p.clear = p.delete = p.set = function() {
      throw new Error("map is read-only");
    } : p instanceof Set && (p.add = p.clear = p.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(p), Object.getOwnPropertyNames(p).forEach((b) => {
      const w = p[b], q = typeof w;
      (q === "object" || q === "function") && !Object.isFrozen(w) && e(w);
    }), p;
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
  function n(p) {
    return p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function i(p, ...b) {
    const w = /* @__PURE__ */ Object.create(null);
    for (const q in p)
      w[q] = p[q];
    return b.forEach(function(q) {
      for (const Q in q)
        w[Q] = q[Q];
    }), /** @type {T} */
    w;
  }
  const r = "</span>", o = (p) => !!p.scope, a = (p, { prefix: b }) => {
    if (p.startsWith("language:"))
      return p.replace("language:", "language-");
    if (p.includes(".")) {
      const w = p.split(".");
      return [
        `${b}${w.shift()}`,
        ...w.map((q, Q) => `${q}${"_".repeat(Q + 1)}`)
      ].join(" ");
    }
    return `${b}${p}`;
  };
  class s {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(b, w) {
      this.buffer = "", this.classPrefix = w.classPrefix, b.walk(this);
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
      if (!o(b)) return;
      const w = a(
        b.scope,
        { prefix: this.classPrefix }
      );
      this.span(w);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(b) {
      o(b) && (this.buffer += r);
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
  const l = (p = {}) => {
    const b = { children: [] };
    return Object.assign(b, p), b;
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
      const w = l({ scope: b });
      this.add(w), this.stack.push(w);
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
    static _walk(b, w) {
      return typeof w == "string" ? b.addText(w) : w.children && (b.openNode(w), w.children.forEach((q) => this._walk(b, q)), b.closeNode(w)), b;
    }
    /**
     * @param {Node} node
     */
    static _collapse(b) {
      typeof b != "string" && b.children && (b.children.every((w) => typeof w == "string") ? b.children = [b.children.join("")] : b.children.forEach((w) => {
        u._collapse(w);
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
    __addSublanguage(b, w) {
      const q = b.root;
      w && (q.scope = `language:${w}`), this.add(q);
    }
    toHTML() {
      return new s(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function d(p) {
    return p ? typeof p == "string" ? p : p.source : null;
  }
  function g(p) {
    return m("(?=", p, ")");
  }
  function h(p) {
    return m("(?:", p, ")*");
  }
  function y(p) {
    return m("(?:", p, ")?");
  }
  function m(...p) {
    return p.map((w) => d(w)).join("");
  }
  function E(p) {
    const b = p[p.length - 1];
    return typeof b == "object" && b.constructor === Object ? (p.splice(p.length - 1, 1), b) : {};
  }
  function v(...p) {
    return "(" + (E(p).capture ? "" : "?:") + p.map((q) => d(q)).join("|") + ")";
  }
  function x(p) {
    return new RegExp(p.toString() + "|").exec("").length - 1;
  }
  function j(p, b) {
    const w = p && p.exec(b);
    return w && w.index === 0;
  }
  const T = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function O(p, { joinWith: b }) {
    let w = 0;
    return p.map((q) => {
      w += 1;
      const Q = w;
      let ee = d(q), L = "";
      for (; ee.length > 0; ) {
        const A = T.exec(ee);
        if (!A) {
          L += ee;
          break;
        }
        L += ee.substring(0, A.index), ee = ee.substring(A.index + A[0].length), A[0][0] === "\\" && A[1] ? L += "\\" + String(Number(A[1]) + Q) : (L += A[0], A[0] === "(" && w++);
      }
      return L;
    }).map((q) => `(${q})`).join(b);
  }
  const P = /\b\B/, N = "[a-zA-Z]\\w*", H = "[a-zA-Z_]\\w*", Y = "\\b\\d+(\\.\\d+)?", W = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", G = "\\b(0b[01]+)", Ce = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", tt = (p = {}) => {
    const b = /^#![ ]*\//;
    return p.binary && (p.begin = m(
      b,
      /.*\b/,
      p.binary,
      /\b.*/
    )), i({
      scope: "meta",
      begin: b,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (w, q) => {
        w.index !== 0 && q.ignoreMatch();
      }
    }, p);
  }, we = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, jt = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [we]
  }, Ct = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [we]
  }, gn = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, nt = function(p, b, w = {}) {
    const q = i(
      {
        scope: "comment",
        begin: p,
        end: b,
        contains: []
      },
      w
    );
    q.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const Q = v(
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
    return q.contains.push(
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
    ), q;
  }, rt = nt("//", "$"), qt = nt("/\\*", "\\*/"), Pt = nt("#", "$"), wt = {
    scope: "number",
    begin: Y,
    relevance: 0
  }, $ = {
    scope: "number",
    begin: W,
    relevance: 0
  }, K = {
    scope: "number",
    begin: G,
    relevance: 0
  }, le = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      we,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [we]
      }
    ]
  }, Se = {
    scope: "title",
    begin: N,
    relevance: 0
  }, Ye = {
    scope: "title",
    begin: H,
    relevance: 0
  }, Z = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + H,
    relevance: 0
  };
  var fe = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: jt,
    BACKSLASH_ESCAPE: we,
    BINARY_NUMBER_MODE: K,
    BINARY_NUMBER_RE: G,
    COMMENT: nt,
    C_BLOCK_COMMENT_MODE: qt,
    C_LINE_COMMENT_MODE: rt,
    C_NUMBER_MODE: $,
    C_NUMBER_RE: W,
    END_SAME_AS_BEGIN: function(p) {
      return Object.assign(
        p,
        {
          /** @type {ModeCallback} */
          "on:begin": (b, w) => {
            w.data._beginMatch = b[1];
          },
          /** @type {ModeCallback} */
          "on:end": (b, w) => {
            w.data._beginMatch !== b[1] && w.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: Pt,
    IDENT_RE: N,
    MATCH_NOTHING_RE: P,
    METHOD_GUARD: Z,
    NUMBER_MODE: wt,
    NUMBER_RE: Y,
    PHRASAL_WORDS_MODE: gn,
    QUOTE_STRING_MODE: Ct,
    REGEXP_MODE: le,
    RE_STARTERS_RE: Ce,
    SHEBANG: tt,
    TITLE_MODE: Se,
    UNDERSCORE_IDENT_RE: H,
    UNDERSCORE_TITLE_MODE: Ye
  });
  function Ve(p, b) {
    p.input[p.index - 1] === "." && b.ignoreMatch();
  }
  function it(p, b) {
    p.className !== void 0 && (p.scope = p.className, delete p.className);
  }
  function yn(p, b) {
    b && p.beginKeywords && (p.begin = "\\b(" + p.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", p.__beforeBegin = Ve, p.keywords = p.keywords || p.beginKeywords, delete p.beginKeywords, p.relevance === void 0 && (p.relevance = 0));
  }
  function ot(p, b) {
    Array.isArray(p.illegal) && (p.illegal = v(...p.illegal));
  }
  function Oe(p, b) {
    if (p.match) {
      if (p.begin || p.end) throw new Error("begin & end are not supported with match");
      p.begin = p.match, delete p.match;
    }
  }
  function Je(p, b) {
    p.relevance === void 0 && (p.relevance = 1);
  }
  const kt = (p, b) => {
    if (!p.beforeMatch) return;
    if (p.starts) throw new Error("beforeMatch cannot be used with starts");
    const w = Object.assign({}, p);
    Object.keys(p).forEach((q) => {
      delete p[q];
    }), p.keywords = w.keywords, p.begin = m(w.beforeMatch, g(w.begin)), p.starts = {
      relevance: 0,
      contains: [
        Object.assign(w, { endsParent: !0 })
      ]
    }, p.relevance = 0, delete w.beforeMatch;
  }, He = [
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
  ], Be = "keyword";
  function ge(p, b, w = Be) {
    const q = /* @__PURE__ */ Object.create(null);
    return typeof p == "string" ? Q(w, p.split(" ")) : Array.isArray(p) ? Q(w, p) : Object.keys(p).forEach(function(ee) {
      Object.assign(
        q,
        ge(p[ee], b, ee)
      );
    }), q;
    function Q(ee, L) {
      b && (L = L.map((A) => A.toLowerCase())), L.forEach(function(A) {
        const R = A.split("|");
        q[R[0]] = [ee, at(R[0], R[1])];
      });
    }
  }
  function at(p, b) {
    return b ? Number(b) : st(p) ? 0 : 1;
  }
  function st(p) {
    return He.includes(p.toLowerCase());
  }
  const ct = {}, ke = (p) => {
    console.error(p);
  }, lt = (p, ...b) => {
    console.log(`WARN: ${p}`, ...b);
  }, ut = (p, b) => {
    ct[`${p}/${b}`] || (console.log(`Deprecated as of ${p}. ${b}`), ct[`${p}/${b}`] = !0);
  }, Dt = new Error();
  function dr(p, b, { key: w }) {
    let q = 0;
    const Q = p[w], ee = {}, L = {};
    for (let A = 1; A <= b.length; A++)
      L[A + q] = Q[A], ee[A + q] = !0, q += x(b[A - 1]);
    p[w] = L, p[w]._emit = ee, p[w]._multi = !0;
  }
  function zi(p) {
    if (Array.isArray(p.begin)) {
      if (p.skip || p.excludeBegin || p.returnBegin)
        throw ke("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), Dt;
      if (typeof p.beginScope != "object" || p.beginScope === null)
        throw ke("beginScope must be object"), Dt;
      dr(p, p.begin, { key: "beginScope" }), p.begin = O(p.begin, { joinWith: "" });
    }
  }
  function Wi(p) {
    if (Array.isArray(p.end)) {
      if (p.skip || p.excludeEnd || p.returnEnd)
        throw ke("skip, excludeEnd, returnEnd not compatible with endScope: {}"), Dt;
      if (typeof p.endScope != "object" || p.endScope === null)
        throw ke("endScope must be object"), Dt;
      dr(p, p.end, { key: "endScope" }), p.end = O(p.end, { joinWith: "" });
    }
  }
  function Ki(p) {
    p.scope && typeof p.scope == "object" && p.scope !== null && (p.beginScope = p.scope, delete p.scope);
  }
  function Gi(p) {
    Ki(p), typeof p.beginScope == "string" && (p.beginScope = { _wrap: p.beginScope }), typeof p.endScope == "string" && (p.endScope = { _wrap: p.endScope }), zi(p), Wi(p);
  }
  function Yi(p) {
    function b(L, A) {
      return new RegExp(
        d(L),
        "m" + (p.case_insensitive ? "i" : "") + (p.unicodeRegex ? "u" : "") + (A ? "g" : "")
      );
    }
    class w {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(A, R) {
        R.position = this.position++, this.matchIndexes[this.matchAt] = R, this.regexes.push([R, A]), this.matchAt += x(A) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const A = this.regexes.map((R) => R[1]);
        this.matcherRe = b(O(A, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(A) {
        this.matcherRe.lastIndex = this.lastIndex;
        const R = this.matcherRe.exec(A);
        if (!R)
          return null;
        const oe = R.findIndex((Nt, vn) => vn > 0 && Nt !== void 0), ne = this.matchIndexes[oe];
        return R.splice(0, oe), Object.assign(R, ne);
      }
    }
    class q {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(A) {
        if (this.multiRegexes[A]) return this.multiRegexes[A];
        const R = new w();
        return this.rules.slice(A).forEach(([oe, ne]) => R.addRule(oe, ne)), R.compile(), this.multiRegexes[A] = R, R;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(A, R) {
        this.rules.push([A, R]), R.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(A) {
        const R = this.getMatcher(this.regexIndex);
        R.lastIndex = this.lastIndex;
        let oe = R.exec(A);
        if (this.resumingScanAtSamePosition() && !(oe && oe.index === this.lastIndex)) {
          const ne = this.getMatcher(0);
          ne.lastIndex = this.lastIndex + 1, oe = ne.exec(A);
        }
        return oe && (this.regexIndex += oe.position + 1, this.regexIndex === this.count && this.considerAll()), oe;
      }
    }
    function Q(L) {
      const A = new q();
      return L.contains.forEach((R) => A.addRule(R.begin, { rule: R, type: "begin" })), L.terminatorEnd && A.addRule(L.terminatorEnd, { type: "end" }), L.illegal && A.addRule(L.illegal, { type: "illegal" }), A;
    }
    function ee(L, A) {
      const R = (
        /** @type CompiledMode */
        L
      );
      if (L.isCompiled) return R;
      [
        it,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        Oe,
        Gi,
        kt
      ].forEach((ne) => ne(L, A)), p.compilerExtensions.forEach((ne) => ne(L, A)), L.__beforeBegin = null, [
        yn,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        ot,
        // default to 1 relevance if not specified
        Je
      ].forEach((ne) => ne(L, A)), L.isCompiled = !0;
      let oe = null;
      return typeof L.keywords == "object" && L.keywords.$pattern && (L.keywords = Object.assign({}, L.keywords), oe = L.keywords.$pattern, delete L.keywords.$pattern), oe = oe || /\w+/, L.keywords && (L.keywords = ge(L.keywords, p.case_insensitive)), R.keywordPatternRe = b(oe, !0), A && (L.begin || (L.begin = /\B|\b/), R.beginRe = b(R.begin), !L.end && !L.endsWithParent && (L.end = /\B|\b/), L.end && (R.endRe = b(R.end)), R.terminatorEnd = d(R.end) || "", L.endsWithParent && A.terminatorEnd && (R.terminatorEnd += (L.end ? "|" : "") + A.terminatorEnd)), L.illegal && (R.illegalRe = b(
        /** @type {RegExp | string} */
        L.illegal
      )), L.contains || (L.contains = []), L.contains = [].concat(...L.contains.map(function(ne) {
        return Vi(ne === "self" ? L : ne);
      })), L.contains.forEach(function(ne) {
        ee(
          /** @type Mode */
          ne,
          R
        );
      }), L.starts && ee(L.starts, A), R.matcher = Q(R), R;
    }
    if (p.compilerExtensions || (p.compilerExtensions = []), p.contains && p.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return p.classNameAliases = i(p.classNameAliases || {}), ee(
      /** @type Mode */
      p
    );
  }
  function pr(p) {
    return p ? p.endsWithParent || pr(p.starts) : !1;
  }
  function Vi(p) {
    return p.variants && !p.cachedVariants && (p.cachedVariants = p.variants.map(function(b) {
      return i(p, { variants: null }, b);
    })), p.cachedVariants ? p.cachedVariants : pr(p) ? i(p, { starts: p.starts ? i(p.starts) : null }) : Object.isFrozen(p) ? i(p) : p;
  }
  var Ji = "11.11.1";
  class Xi extends Error {
    constructor(b, w) {
      super(b), this.name = "HTMLInjectionError", this.html = w;
    }
  }
  const bn = n, fr = i, hr = Symbol("nomatch"), Zi = 7, mr = function(p) {
    const b = /* @__PURE__ */ Object.create(null), w = /* @__PURE__ */ Object.create(null), q = [];
    let Q = !0;
    const ee = "Could not find the language '{}', did you forget to load/include a language module?", L = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let A = {
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
    function R(S) {
      return A.noHighlightRe.test(S);
    }
    function oe(S) {
      let M = S.className + " ";
      M += S.parentNode ? S.parentNode.className : "";
      const z = A.languageDetectRe.exec(M);
      if (z) {
        const J = Fe(z[1]);
        return J || (lt(ee.replace("{}", z[1])), lt("Falling back to no-highlight mode for this block.", S)), J ? z[1] : "no-highlight";
      }
      return M.split(/\s+/).find((J) => R(J) || Fe(J));
    }
    function ne(S, M, z) {
      let J = "", ie = "";
      typeof M == "object" ? (J = S, z = M.ignoreIllegals, ie = M.language) : (ut("10.7.0", "highlight(lang, code, ...args) has been deprecated."), ut("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), ie = S, J = M), z === void 0 && (z = !0);
      const Ne = {
        code: J,
        language: ie
      };
      Ft("before:highlight", Ne);
      const Ue = Ne.result ? Ne.result : Nt(Ne.language, Ne.code, z);
      return Ue.code = Ne.code, Ft("after:highlight", Ue), Ue;
    }
    function Nt(S, M, z, J) {
      const ie = /* @__PURE__ */ Object.create(null);
      function Ne(k, _) {
        return k.keywords[_];
      }
      function Ue() {
        if (!D.keywords) {
          ue.addText(X);
          return;
        }
        let k = 0;
        D.keywordPatternRe.lastIndex = 0;
        let _ = D.keywordPatternRe.exec(X), F = "";
        for (; _; ) {
          F += X.substring(k, _.index);
          const V = Te.case_insensitive ? _[0].toLowerCase() : _[0], he = Ne(D, V);
          if (he) {
            const [$e, go] = he;
            if (ue.addText(F), F = "", ie[V] = (ie[V] || 0) + 1, ie[V] <= Zi && (Wt += go), $e.startsWith("_"))
              F += _[0];
            else {
              const yo = Te.classNameAliases[$e] || $e;
              Le(_[0], yo);
            }
          } else
            F += _[0];
          k = D.keywordPatternRe.lastIndex, _ = D.keywordPatternRe.exec(X);
        }
        F += X.substring(k), ue.addText(F);
      }
      function Ut() {
        if (X === "") return;
        let k = null;
        if (typeof D.subLanguage == "string") {
          if (!b[D.subLanguage]) {
            ue.addText(X);
            return;
          }
          k = Nt(D.subLanguage, X, !0, Cr[D.subLanguage]), Cr[D.subLanguage] = /** @type {CompiledMode} */
          k._top;
        } else
          k = xn(X, D.subLanguage.length ? D.subLanguage : null);
        D.relevance > 0 && (Wt += k.relevance), ue.__addSublanguage(k._emitter, k.language);
      }
      function Ee() {
        D.subLanguage != null ? Ut() : Ue(), X = "";
      }
      function Le(k, _) {
        k !== "" && (ue.startScope(_), ue.addText(k), ue.endScope());
      }
      function vr(k, _) {
        let F = 1;
        const V = _.length - 1;
        for (; F <= V; ) {
          if (!k._emit[F]) {
            F++;
            continue;
          }
          const he = Te.classNameAliases[k[F]] || k[F], $e = _[F];
          he ? Le($e, he) : (X = $e, Ue(), X = ""), F++;
        }
      }
      function xr(k, _) {
        return k.scope && typeof k.scope == "string" && ue.openNode(Te.classNameAliases[k.scope] || k.scope), k.beginScope && (k.beginScope._wrap ? (Le(X, Te.classNameAliases[k.beginScope._wrap] || k.beginScope._wrap), X = "") : k.beginScope._multi && (vr(k.beginScope, _), X = "")), D = Object.create(k, { parent: { value: D } }), D;
      }
      function Sr(k, _, F) {
        let V = j(k.endRe, F);
        if (V) {
          if (k["on:end"]) {
            const he = new t(k);
            k["on:end"](_, he), he.isMatchIgnored && (V = !1);
          }
          if (V) {
            for (; k.endsParent && k.parent; )
              k = k.parent;
            return k;
          }
        }
        if (k.endsWithParent)
          return Sr(k.parent, _, F);
      }
      function uo(k) {
        return D.matcher.regexIndex === 0 ? (X += k[0], 1) : (wn = !0, 0);
      }
      function po(k) {
        const _ = k[0], F = k.rule, V = new t(F), he = [F.__beforeBegin, F["on:begin"]];
        for (const $e of he)
          if ($e && ($e(k, V), V.isMatchIgnored))
            return uo(_);
        return F.skip ? X += _ : (F.excludeBegin && (X += _), Ee(), !F.returnBegin && !F.excludeBegin && (X = _)), xr(F, k), F.returnBegin ? 0 : _.length;
      }
      function fo(k) {
        const _ = k[0], F = M.substring(k.index), V = Sr(D, k, F);
        if (!V)
          return hr;
        const he = D;
        D.endScope && D.endScope._wrap ? (Ee(), Le(_, D.endScope._wrap)) : D.endScope && D.endScope._multi ? (Ee(), vr(D.endScope, k)) : he.skip ? X += _ : (he.returnEnd || he.excludeEnd || (X += _), Ee(), he.excludeEnd && (X = _));
        do
          D.scope && ue.closeNode(), !D.skip && !D.subLanguage && (Wt += D.relevance), D = D.parent;
        while (D !== V.parent);
        return V.starts && xr(V.starts, k), he.returnEnd ? 0 : _.length;
      }
      function ho() {
        const k = [];
        for (let _ = D; _ !== Te; _ = _.parent)
          _.scope && k.unshift(_.scope);
        k.forEach((_) => ue.openNode(_));
      }
      let zt = {};
      function Er(k, _) {
        const F = _ && _[0];
        if (X += k, F == null)
          return Ee(), 0;
        if (zt.type === "begin" && _.type === "end" && zt.index === _.index && F === "") {
          if (X += M.slice(_.index, _.index + 1), !Q) {
            const V = new Error(`0 width match regex (${S})`);
            throw V.languageName = S, V.badRule = zt.rule, V;
          }
          return 1;
        }
        if (zt = _, _.type === "begin")
          return po(_);
        if (_.type === "illegal" && !z) {
          const V = new Error('Illegal lexeme "' + F + '" for mode "' + (D.scope || "<unnamed>") + '"');
          throw V.mode = D, V;
        } else if (_.type === "end") {
          const V = fo(_);
          if (V !== hr)
            return V;
        }
        if (_.type === "illegal" && F === "")
          return X += `
`, 1;
        if (Cn > 1e5 && Cn > _.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return X += F, F.length;
      }
      const Te = Fe(S);
      if (!Te)
        throw ke(ee.replace("{}", S)), new Error('Unknown language: "' + S + '"');
      const mo = Yi(Te);
      let En = "", D = J || mo;
      const Cr = {}, ue = new A.__emitter(A);
      ho();
      let X = "", Wt = 0, Xe = 0, Cn = 0, wn = !1;
      try {
        if (Te.__emitTokens)
          Te.__emitTokens(M, ue);
        else {
          for (D.matcher.considerAll(); ; ) {
            Cn++, wn ? wn = !1 : D.matcher.considerAll(), D.matcher.lastIndex = Xe;
            const k = D.matcher.exec(M);
            if (!k) break;
            const _ = M.substring(Xe, k.index), F = Er(_, k);
            Xe = k.index + F;
          }
          Er(M.substring(Xe));
        }
        return ue.finalize(), En = ue.toHTML(), {
          language: S,
          value: En,
          relevance: Wt,
          illegal: !1,
          _emitter: ue,
          _top: D
        };
      } catch (k) {
        if (k.message && k.message.includes("Illegal"))
          return {
            language: S,
            value: bn(M),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: k.message,
              index: Xe,
              context: M.slice(Xe - 100, Xe + 100),
              mode: k.mode,
              resultSoFar: En
            },
            _emitter: ue
          };
        if (Q)
          return {
            language: S,
            value: bn(M),
            illegal: !1,
            relevance: 0,
            errorRaised: k,
            _emitter: ue,
            _top: D
          };
        throw k;
      }
    }
    function vn(S) {
      const M = {
        value: bn(S),
        illegal: !1,
        relevance: 0,
        _top: L,
        _emitter: new A.__emitter(A)
      };
      return M._emitter.addText(S), M;
    }
    function xn(S, M) {
      M = M || A.languages || Object.keys(b);
      const z = vn(S), J = M.filter(Fe).filter(br).map(
        (Ee) => Nt(Ee, S, !1)
      );
      J.unshift(z);
      const ie = J.sort((Ee, Le) => {
        if (Ee.relevance !== Le.relevance) return Le.relevance - Ee.relevance;
        if (Ee.language && Le.language) {
          if (Fe(Ee.language).supersetOf === Le.language)
            return 1;
          if (Fe(Le.language).supersetOf === Ee.language)
            return -1;
        }
        return 0;
      }), [Ne, Ue] = ie, Ut = Ne;
      return Ut.secondBest = Ue, Ut;
    }
    function Qi(S, M, z) {
      const J = M && w[M] || z;
      S.classList.add("hljs"), S.classList.add(`language-${J}`);
    }
    function Sn(S) {
      let M = null;
      const z = oe(S);
      if (R(z)) return;
      if (Ft(
        "before:highlightElement",
        { el: S, language: z }
      ), S.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", S);
        return;
      }
      if (S.children.length > 0 && (A.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(S)), A.throwUnescapedHTML))
        throw new Xi(
          "One of your code blocks includes unescaped HTML.",
          S.innerHTML
        );
      M = S;
      const J = M.textContent, ie = z ? ne(J, { language: z, ignoreIllegals: !0 }) : xn(J);
      S.innerHTML = ie.value, S.dataset.highlighted = "yes", Qi(S, z, ie.language), S.result = {
        language: ie.language,
        // TODO: remove with version 11.0
        re: ie.relevance,
        relevance: ie.relevance
      }, ie.secondBest && (S.secondBest = {
        language: ie.secondBest.language,
        relevance: ie.secondBest.relevance
      }), Ft("after:highlightElement", { el: S, result: ie, text: J });
    }
    function eo(S) {
      A = fr(A, S);
    }
    const to = () => {
      Ht(), ut("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function no() {
      Ht(), ut("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let gr = !1;
    function Ht() {
      function S() {
        Ht();
      }
      if (document.readyState === "loading") {
        gr || window.addEventListener("DOMContentLoaded", S, !1), gr = !0;
        return;
      }
      document.querySelectorAll(A.cssSelector).forEach(Sn);
    }
    function ro(S, M) {
      let z = null;
      try {
        z = M(p);
      } catch (J) {
        if (ke("Language definition for '{}' could not be registered.".replace("{}", S)), Q)
          ke(J);
        else
          throw J;
        z = L;
      }
      z.name || (z.name = S), b[S] = z, z.rawDefinition = M.bind(null, p), z.aliases && yr(z.aliases, { languageName: S });
    }
    function io(S) {
      delete b[S];
      for (const M of Object.keys(w))
        w[M] === S && delete w[M];
    }
    function oo() {
      return Object.keys(b);
    }
    function Fe(S) {
      return S = (S || "").toLowerCase(), b[S] || b[w[S]];
    }
    function yr(S, { languageName: M }) {
      typeof S == "string" && (S = [S]), S.forEach((z) => {
        w[z.toLowerCase()] = M;
      });
    }
    function br(S) {
      const M = Fe(S);
      return M && !M.disableAutodetect;
    }
    function ao(S) {
      S["before:highlightBlock"] && !S["before:highlightElement"] && (S["before:highlightElement"] = (M) => {
        S["before:highlightBlock"](
          Object.assign({ block: M.el }, M)
        );
      }), S["after:highlightBlock"] && !S["after:highlightElement"] && (S["after:highlightElement"] = (M) => {
        S["after:highlightBlock"](
          Object.assign({ block: M.el }, M)
        );
      });
    }
    function so(S) {
      ao(S), q.push(S);
    }
    function co(S) {
      const M = q.indexOf(S);
      M !== -1 && q.splice(M, 1);
    }
    function Ft(S, M) {
      const z = S;
      q.forEach(function(J) {
        J[z] && J[z](M);
      });
    }
    function lo(S) {
      return ut("10.7.0", "highlightBlock will be removed entirely in v12.0"), ut("10.7.0", "Please use highlightElement now."), Sn(S);
    }
    Object.assign(p, {
      highlight: ne,
      highlightAuto: xn,
      highlightAll: Ht,
      highlightElement: Sn,
      // TODO: Remove with v12 API
      highlightBlock: lo,
      configure: eo,
      initHighlighting: to,
      initHighlightingOnLoad: no,
      registerLanguage: ro,
      unregisterLanguage: io,
      listLanguages: oo,
      getLanguage: Fe,
      registerAliases: yr,
      autoDetection: br,
      inherit: fr,
      addPlugin: so,
      removePlugin: co
    }), p.debugMode = function() {
      Q = !1;
    }, p.safeMode = function() {
      Q = !0;
    }, p.versionString = Ji, p.regex = {
      concat: m,
      lookahead: g,
      either: v,
      optional: y,
      anyNumberOfTimes: h
    };
    for (const S in fe)
      typeof fe[S] == "object" && e(fe[S]);
    return Object.assign(p, fe), p;
  }, dt = mr({});
  return dt.newInstance = () => mr({}), Mn = dt, dt.HighlightJS = dt, dt.default = dt, Mn;
}
var Ac = /* @__PURE__ */ Nc();
const $t = /* @__PURE__ */ kc(Ac);
function Oc(e) {
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
  }, o = e.inherit(
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
  }, s = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      n,
      r
    ]
  };
  r.contains.push(s);
  const l = {
    match: /\\"/
  }, u = {
    className: "string",
    begin: /'/,
    end: /'/
  }, f = {
    match: /\\'/
  }, d = {
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
  }), y = {
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
  ], E = [
    "true",
    "false"
  ], v = { match: /(\/[a-z._-]+)+/ }, x = [
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
  ], T = [
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
  ], O = [
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
      literal: E,
      built_in: [
        ...x,
        ...j,
        // Shell modifiers
        "set",
        "shopt",
        ...T,
        ...O
      ]
    },
    contains: [
      h,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      y,
      d,
      o,
      a,
      v,
      s,
      l,
      u,
      f,
      n
    ]
  };
}
function Lc(e) {
  const o = {
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
    keywords: o,
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
            keywords: o,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function Tc(e) {
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
function _c(e) {
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
  ], s = {
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
    keywords: s,
    illegal: /#/
  }, f = {
    begin: /\{\{/,
    relevance: 0
  }, d = {
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
  }, g = "[0-9](_?[0-9])*", h = `(\\b(${g}))?\\.(${g})|\\b(${g})\\.`, y = `\\b|${i.join("|")}`, m = {
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
        begin: `(\\b(${g})|(${h}))[eE][+-]?(${g})[jJ]?(?=${y})`
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
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${y})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${y})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${y})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${y})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${g})[jJ](?=${y})`
      }
    ]
  }, E = {
    className: "comment",
    begin: t.lookahead(/# type:/),
    end: /$/,
    keywords: s,
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
  }, v = {
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
        keywords: s,
        contains: [
          "self",
          l,
          m,
          d,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return u.contains = [
    d,
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
    keywords: s,
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
      d,
      E,
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
        contains: [v]
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
          v,
          d
        ]
      }
    ]
  };
}
$t.registerLanguage("bash", Oc);
$t.registerLanguage("go", Lc);
$t.registerLanguage("json", Tc);
$t.registerLanguage("python", _c);
const Ic = {
  curl: "bash",
  go: "go",
  json: "json",
  py: "python",
  python: "python"
}, Mc = /* @__PURE__ */ new Set(["bash", "curl", "go", "json", "py", "python"]);
function Pn(e, t) {
  if (t === "plaintext" || t === "" || !Mc.has(t))
    return Rr(e);
  const n = Ic[t] ?? (Si(e) ? "json" : "bash");
  try {
    return $t.highlight(e, { language: n }).value;
  } catch {
    return Rr(e);
  }
}
function Rc(e, t) {
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
    return Ur(i, n);
  }
  if (n.type === "number") {
    if (isNaN(Number(e.trim())))
      return { valid: !1, message: "Must be a number" };
    const i = parseFloat(e);
    return Ur(i, n);
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
function Ur(e, t) {
  return t.minimum !== void 0 && e < t.minimum ? { valid: !1, message: `Minimum: ${t.minimum}` } : t.maximum !== void 0 && e > t.maximum ? { valid: !1, message: `Maximum: ${t.maximum}` } : { valid: !0 };
}
function Bc(e, t, n, i) {
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
function $c(e, t) {
  const n = [];
  if (e.querySelectorAll("[data-param-name]").forEach((r) => {
    const o = r.getAttribute("data-param-name"), a = t.parameters.find((l) => l.name === o);
    if (!a) return;
    const s = Rc(r.value, a);
    s.valid || n.push({ field: o, message: s.message || "Invalid", kind: "param" });
  }), t.requestBody) {
    const o = Object.keys(t.requestBody.content || {})[0] || "application/json", a = t.requestBody.content?.[o]?.schema, l = e.querySelector('[data-field="body"]')?.value || "";
    if (!o.includes("multipart")) {
      const u = Bc(l, o, a, t.requestBody.required);
      u.valid || n.push({ field: "body", message: u.message || "Invalid body", kind: "body" });
    }
  }
  return n;
}
function jc(e) {
  e.querySelectorAll(".validation-error").forEach((t) => {
    t.textContent = "", t.classList.remove("visible");
  }), e.querySelectorAll(".invalid").forEach((t) => {
    t.classList.remove("invalid");
  });
}
function qc(e, t) {
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
function Pi(e) {
  return c("span", { className: "validation-error", "data-error-for": e });
}
const Pc = 60;
function ln(e) {
  e.style.height = "auto", e.style.overflowY = "hidden", e.style.height = Math.max(Pc, e.scrollHeight) + "px";
}
function zr(e, t) {
  t.scrollTop = e.scrollTop, t.scrollLeft = e.scrollLeft;
}
function Wr(e, t, n) {
  const i = c("div", { className: "body-editor" }), r = c("pre", { className: "body-highlight" }), o = c("code", { className: "hljs" });
  r.append(o);
  const a = c("textarea", {
    className: "textarea-json",
    spellcheck: "false",
    ...n?.dataField ? { "data-field": n.dataField } : {}
  });
  a.value = e, o.innerHTML = Pn(e || " ", t);
  const s = () => {
    ln(a), r.style.height = `${a.offsetHeight}px`, zr(a, r);
  };
  s();
  const l = (u, f) => {
    o.innerHTML = Pn((u ?? a.value) || " ", f ?? t);
  };
  return a.addEventListener("input", () => {
    l(), s(), n?.onInput?.();
  }), a.addEventListener("scroll", () => zr(a, r)), i.append(r, a), {
    wrap: i,
    textarea: a,
    setValue: (u, f) => {
      a.value = u, l(u, f ?? t), s();
    },
    syncLayout: s
  };
}
const Dc = 1500;
function _t(e) {
  const t = e.ariaLabel || "Copy", n = e.copiedAriaLabel || "Copied", i = Re({
    variant: "icon",
    icon: U.copy,
    ariaLabel: t,
    className: e.className,
    onClick: async () => {
      const r = await e.getText();
      await Bs(r), i.innerHTML = U.check, i.setAttribute("aria-label", n), e.onCopied?.(), setTimeout(() => {
        i.innerHTML = U.copy, i.setAttribute("aria-label", t);
      }, Dc);
    }
  });
  return i;
}
function Hc(e, t, n, i) {
  de(t), t.classList.add("try-it");
  const r = c("div", { className: "body" }), o = c("div", { className: "block section" });
  o.append(c("h2", { textContent: "Response" }));
  const a = c("div", { "data-response": "true" });
  if (n)
    Rn(a, {
      status: parseInt(n.statusCode, 10) || 200,
      statusText: n.statusText || "OK",
      headers: {},
      body: n.body,
      duration: 0,
      size: 0
    });
  else {
    const l = c("div", { className: "placeholder" });
    l.append(c("span", { textContent: "Execute request to see response" })), a.append(l);
  }
  o.append(a), r.append(Fc(e, t, {
    onConfigChange: i?.onConfigChange,
    onSendRequest: async (l) => {
      jc(t);
      const u = $c(t, e);
      if (u.length > 0) {
        qc(t, u);
        return;
      }
      const f = ze(t, e);
      l.setAttribute("disabled", ""), l.innerHTML = "", l.append(c("span", { className: "spinner spinner-sm" }), c("span", null, "Sending..."));
      try {
        const d = await gc(f);
        Rn(a, d);
      } catch (d) {
        Rn(a, {
          status: 0,
          headers: {},
          body: d.message,
          duration: 0,
          size: 0
        });
      } finally {
        l.removeAttribute("disabled"), l.innerHTML = U.send, l.append(c("span", null, "Send Request"));
      }
    }
  })), r.append(o), t.append(r);
  const s = t.querySelector('textarea[data-field="body"]');
  s && ln(s);
}
function Fc(e, t, n) {
  const i = n?.onConfigChange, r = e.parameters.filter(($) => $.in === "path"), o = e.parameters.filter(($) => $.in === "query"), a = Cc([...r, ...o]), s = "Request", l = In({
    method: e.method,
    url: "",
    // will be updated
    headers: {},
    body: e.requestBody ? "{ ... }" : void 0
  }), u = () => {
    const $ = ze(t, e);
    let K;
    return typeof $.body == "string" ? K = $.body : $.body instanceof FormData ? K = "{ /* multipart form-data */ }" : e.requestBody && (K = "{ ... }"), {
      method: $.method,
      url: $.url,
      headers: $.headers || {},
      body: K
    };
  }, f = () => {
    const $ = ze(t, e);
    if (typeof $.body == "string") return $.body;
    if ($.body instanceof FormData) {
      const K = [];
      return $.body.forEach((le, Se) => {
        if (le instanceof File) {
          K.push(`${Se}: [File ${le.name}]`);
          return;
        }
        K.push(`${Se}: ${String(le)}`);
      }), K.join(`
`);
    }
    return "";
  }, d = ($, K) => {
    const le = u(), Se = In(le), Ye = Se[K] || Se[0];
    Ye && $.setValue(Ye.code, Ye.language);
  }, g = c("div", { className: "block section tabs-code" }), h = c("div", { className: "body" }), y = c("h2", { textContent: "Request" });
  g.append(y, h);
  const m = c("div", { className: "controls" });
  let E = !1;
  a.length > 1 && (r.length > 0 || o.length > 0) && (m.append(on({
    options: a.map(($) => ({ value: $.name, label: $.summary || $.name })),
    value: a[0].name,
    ariaLabel: "Select example",
    className: "example-select",
    onChange: ($) => {
      const K = a.find((le) => le.name === $);
      K && (Uc(t, K.values), t.dispatchEvent(new Event("input", { bubbles: !0 })));
    }
  })), E = !0);
  const v = C.get(), x = c("div", { className: "card" }), j = c("div", { className: "card-head" }), T = c("div", { className: "tabs tabs-code" }), O = [];
  let P = 0, N = null, H = null, Y = null, W = null;
  {
    const $ = an(s, { active: !0, context: !0 });
    if (O.push($), W = c("div", { className: "panel is-request", "data-tab": "first" }), r.length > 0 || o.length > 0) {
      const Z = c("div", { className: "params-group" });
      if (Z.append(c("h3", { textContent: "Parameters" })), r.length > 0) {
        const te = c("div", { className: "params-group" });
        o.length > 0 && te.append(c("h3", { textContent: "Path" }));
        for (const fe of r)
          te.append(Gr(fe, a[0]?.values[fe.name]));
        Z.append(te);
      }
      if (o.length > 0) {
        const te = c("div", { className: "params-group" });
        r.length > 0 && te.append(c("h3", { textContent: "Query" }));
        for (const fe of o)
          te.append(Gr(fe, a[0]?.values[fe.name]));
        Z.append(te);
      }
      W.append(Z);
    }
    {
      const Z = c("div", { className: "route-preview" }), te = c("div", { className: "field-header" });
      te.append(c("h3", { textContent: "URL" }));
      const fe = _t({
        ariaLabel: "Copy URL",
        className: "route-copy-btn",
        getText: () => N?.value || ze(t, e).url
      });
      N = Ge({
        type: "text",
        ariaLabel: "Request URL",
        readOnly: !0,
        modifiers: ["filled"],
        className: "route-input"
      });
      const Ve = c("div", { className: "route-input-row" });
      Ve.append(N, fe), Z.append(te, Ve), H = Z;
    }
    if (e.requestBody) {
      const Z = c("div", { className: "body-section" }), te = c("div", { className: "field-header" });
      te.append(c("h3", { textContent: "Body" }));
      const fe = _t({
        ariaLabel: "Copy body",
        className: "field-copy-btn",
        getText: f
      });
      te.append(fe), Z.append(te);
      const it = Object.keys(e.requestBody.content || {})[0] || "application/json", yn = it.includes("multipart"), ot = e.requestBody.content?.[it];
      if (yn && ot?.schema) {
        const Oe = c("div", { className: "multipart", "data-field": "multipart" }), Je = ot.schema, kt = Je.properties || {}, He = Je.required || [];
        for (const [Be, ge] of Object.entries(kt)) {
          const at = ge.format === "binary" || ge.format === "base64" || ge.type === "string" && ge.format === "binary", st = He.includes(Be), ct = c("div", { className: `params row${st ? " is-required" : ""}` }), ke = c("span", { className: "label", textContent: Be });
          if (st && ke.append(Di()), at) {
            const lt = c("input", {
              type: "file",
              "data-multipart-field": Be,
              "data-multipart-type": "file"
            });
            ct.append(ke, lt);
          } else {
            const lt = Ge({
              placeholder: ge.description || Be,
              value: ge.default !== void 0 ? String(ge.default) : "",
              dataAttrs: { multipartField: Be, multipartType: "text" }
            });
            ct.append(ke, lt);
          }
          Oe.append(ct);
        }
        Z.append(Oe);
      } else {
        const Oe = ot ? qi(ot) : [], Je = Oe[0], kt = Je ? Hr(Je.value) : "", He = Wr(kt, "json", {
          dataField: "body",
          onInput: () => i?.(ze(t, e))
        });
        if (Y = He.syncLayout, Z.append(He.wrap), Oe.length > 1) {
          const Be = on({
            options: Oe.map((ge) => ({ value: ge.name, label: wc(ge) })),
            value: Oe[0].name,
            ariaLabel: "Select example",
            className: "example-select",
            onChange: (ge) => {
              const at = Oe.find((st) => st.name === ge);
              at && (He.setValue(Hr(at.value), "json"), He.syncLayout(), i?.(ze(t, e)));
            }
          });
          m.append(Be), E = !0;
        }
      }
      Z.append(Pi("body")), W.append(Z);
    }
    const K = c("div", { className: "headers-section" }), le = c("div", { className: "field-header" });
    le.append(c("h3", { textContent: "Headers" }));
    const Se = c("div", { className: "headers-list" });
    if (e.requestBody) {
      const te = Object.keys(e.requestBody.content || {})[0] || "application/json";
      Se.append(Lt("Content-Type", te));
    }
    if (pe(e.resolvedSecurity) && v.spec) {
      const Z = ir(e.resolvedSecurity, v.spec.securitySchemes), fe = { ...or(e.resolvedSecurity, v.spec.securitySchemes), ...Z };
      for (const [Ve, it] of Object.entries(fe))
        Se.append(Lt(Ve, it));
    }
    for (const Z of e.parameters.filter((te) => te.in === "header"))
      Se.append(Lt(Z.name, String(Z.example || "")));
    const Ye = Re({
      variant: "icon",
      icon: U.plus,
      ariaLabel: "Add header",
      className: "field-copy-btn",
      onClick: () => Se.append(Lt("", ""))
    });
    le.append(Ye), K.append(le, Se), W.append(K);
  }
  const G = u(), Ce = In(G), tt = Wr(
    Ce[0]?.code ?? "",
    Ce[0]?.language
  ), we = c("div", { className: "panel", "data-tab": "lang" }), jt = c("div", { className: "body-section" }), Ct = c("div", { className: "field-header" });
  Ct.append(c("h3", { textContent: "Code Example" }));
  const gn = _t({
    ariaLabel: "Copy code",
    className: "field-copy-btn",
    getText: () => tt.textarea.value
  });
  Ct.append(gn), jt.append(Ct, tt.wrap), we.append(jt);
  for (let $ = 0; $ < l.length; $++) {
    const K = l[$], le = an(K.label, { active: !s });
    O.push(le);
  }
  j.append(T);
  const nt = W ? [W, we] : [we], rt = ($, K) => {
    if (!K) {
      $.style.display = "none";
      return;
    }
    $.style.display = $.classList.contains("is-request") ? "flex" : "block";
  };
  for (let $ = 0; $ < O.length; $++) {
    T.append(O[$]);
    const K = $;
    O[$].addEventListener("click", () => {
      O.forEach((le) => le.classList.remove("is-active")), O[K].classList.add("is-active"), P = K, W && rt(W, K === 0), rt(we, K !== 0), K === 0 && Y?.(), K > 0 && d(tt, K - 1);
    });
  }
  const qt = c("div", { className: "card-content flush" }), Pt = c("div", { className: "panels" });
  if (W && rt(W, !0), rt(we, !1), Pt.append(...nt), qt.append(Pt), n?.onSendRequest) {
    const $ = Re({
      variant: "primary",
      icon: U.send,
      label: "Send Request",
      className: "send-btn"
    });
    $.addEventListener("click", () => n.onSendRequest($));
    {
      H && W?.append(H);
      const K = c("div", { className: "send-inline" });
      K.append($), W?.append(K);
    }
  }
  !n?.onSendRequest && s && H && W?.append(H), E && h.append(m), x.append(j, qt), h.append(x);
  const wt = () => {
    N && (N.value = ze(t, e).url), i?.(ze(t, e)), (P > 0 || !s) && d(tt, P - 1);
  };
  return t.addEventListener("input", wt), t.addEventListener("change", wt), wt(), Y?.(), g;
}
function Kr(e, t) {
  return t !== void 0 ? t : e.example !== void 0 && e.example !== null ? String(e.example) : e.schema?.example !== void 0 && e.schema.example !== null ? String(e.schema.example) : e.schema?.default !== void 0 && e.schema.default !== null ? String(e.schema.default) : e.schema?.enum && e.schema.enum.length > 0 ? String(e.schema.enum[0]) : e.schema?.type === "integer" || e.schema?.type === "number" ? "0" : e.schema?.type === "boolean" ? "true" : e.in === "path" ? "id" : "value";
}
function Uc(e, t) {
  e.querySelectorAll("[data-param-name]").forEach((i) => {
    const r = i.getAttribute("data-param-name");
    r && t[r] !== void 0 && (i.value = t[r]);
  });
}
function Gr(e, t) {
  const n = c("div", { className: `params row${e.required ? " is-required" : ""}` }), i = c("span", {
    className: "label",
    textContent: e.name
  });
  e.required && i.append(Di());
  const r = e.schema;
  let o;
  if (r?.enum && r.enum.length > 0) {
    const s = e.required ? r.enum.map((u) => ({ value: String(u), label: String(u) })) : [{ value: "", label: "— select —" }, ...r.enum.map((u) => ({ value: String(u), label: String(u) }))];
    o = on({
      options: s,
      value: Kr(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
  } else {
    const s = r?.type === "integer" || r?.type === "number" ? "number" : "text", l = Ge({
      type: s,
      placeholder: e.description || e.name,
      value: Kr(e, t),
      dataAttrs: { paramName: e.name, paramIn: e.in }
    });
    r?.type === "integer" && l.setAttribute("step", "1"), r?.minimum !== void 0 && l.setAttribute("min", String(r.minimum)), r?.maximum !== void 0 && l.setAttribute("max", String(r.maximum)), o = l;
  }
  const a = Pi(e.name);
  return n.append(i, o, a), n;
}
function Di() {
  return c("span", {
    className: "required-star",
    textContent: "*",
    "aria-hidden": "true"
  });
}
function Lt(e, t) {
  const n = c("div", { className: "header-row" }), i = Ge({
    placeholder: "Header name",
    value: e,
    dataAttrs: { headerName: "true" }
  }), r = Ge({
    placeholder: "Value",
    value: t,
    dataAttrs: { headerValue: "true" }
  }), o = Re({
    variant: "icon",
    icon: U.close,
    ariaLabel: "Remove header",
    className: "header-remove-btn",
    onClick: () => n.remove()
  });
  return n.append(i, r, o), n;
}
function ze(e, t) {
  const n = C.get(), i = hn(n), r = e.querySelectorAll('[data-param-in="path"]'), o = {};
  r.forEach((h) => {
    o[h.getAttribute("data-param-name")] = h.value;
  });
  const a = e.querySelectorAll('[data-param-in="query"]'), s = {};
  if (a.forEach((h) => {
    const y = h.getAttribute("data-param-name");
    h.value && (s[y] = h.value);
  }), n.spec && pe(t.resolvedSecurity)) {
    const h = Xs(t.resolvedSecurity, n.spec.securitySchemes);
    for (const [y, m] of Object.entries(h))
      y in s || (s[y] = m);
  }
  const l = e.querySelectorAll(".header-row"), u = {};
  if (l.forEach((h) => {
    const y = h.querySelector("[data-header-name]"), m = h.querySelector("[data-header-value]");
    y?.value && m?.value && (u[y.value] = m.value);
  }), n.spec && pe(t.resolvedSecurity)) {
    const h = Zs(t.resolvedSecurity, n.spec.securitySchemes), y = Object.entries(h).map(([m, E]) => `${m}=${E}`);
    if (y.length > 0) {
      const m = u.Cookie || u.cookie || "";
      u.Cookie = m ? `${m}; ${y.join("; ")}` : y.join("; "), delete u.cookie;
    }
  }
  const f = e.querySelector('[data-field="multipart"]');
  let d;
  if (f) {
    const h = new FormData();
    f.querySelectorAll("[data-multipart-field]").forEach((m) => {
      const E = m.getAttribute("data-multipart-field"), v = m.getAttribute("data-multipart-type");
      v === "file" && m.files && m.files.length > 0 ? h.append(E, m.files[0]) : v === "text" && m.value && h.append(E, m.value);
    }), d = h, delete u["Content-Type"];
  } else
    d = e.querySelector('[data-field="body"]')?.value || void 0;
  const g = bc(i, t.path, o, s);
  return { method: t.method, url: g, headers: u, body: d };
}
function Rn(e, t) {
  de(e);
  const n = c("div", { className: "card" }), i = c("div", { className: "card-head response-header" }), r = an("Body", { active: !0 }), o = an(`Headers (${Object.keys(t.headers).length})`), a = c("div", { className: "tabs tabs-code" });
  a.append(r, o);
  const s = c("div", {
    className: "meta",
    innerHTML: `<span>${js(t.duration)}</span><span>${$s(t.size)}</span>`
  }), l = B({
    text: String(t.status),
    kind: "status",
    statusCode: String(t.status),
    size: "m"
  }), u = _t({
    ariaLabel: "Copy response",
    getText: () => t.body,
    onCopied: () => Wc("Response copied")
  });
  i.append(a, s, l, u), n.append(i);
  const f = c("div", { className: "card-content flush" }), d = c("div", { className: "response-pane" }), g = c("div", { className: "pane-inner" }), h = c("pre", { className: "code-display" }), y = c("code", { className: "hljs" }), m = zc(t.body);
  y.innerHTML = Pn(m, Si(m) ? "json" : ""), h.append(y), g.append(h), d.append(g);
  const E = c("div", { className: "response-pane", style: "display:none" }), v = c("div", { className: "pane-inner" }), x = c("textarea", {
    readonly: !0,
    wrap: "off",
    spellcheck: "false"
  });
  x.value = Object.entries(t.headers).map(([j, T]) => `${j}: ${T}`).join(`
`), ln(x), v.append(x), E.append(v), f.append(d, E), n.append(f), r.addEventListener("click", () => {
    r.classList.add("is-active"), o.classList.remove("is-active"), d.style.display = "block", E.style.display = "none";
  }), o.addEventListener("click", () => {
    o.classList.add("is-active"), r.classList.remove("is-active"), d.style.display = "none", E.style.display = "block", requestAnimationFrame(() => ln(x));
  }), e.append(n);
}
function zc(e, t) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function Wc(e) {
  const t = document.querySelector(".copy-toast");
  t && t.remove();
  const n = c("div", { className: "copy-toast", textContent: e });
  document.body.append(n), setTimeout(() => n.remove(), 2e3);
}
function Hi(e) {
  const { prev: t, next: n } = Kc(e);
  if (!t && !n) return null;
  const i = c("div", {
    className: `route-nav${!t || !n ? " is-single" : ""}`
  });
  return t && i.append(Yr(t, "previous")), n && i.append(Yr(n, "next")), i;
}
function Yr(e, t) {
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
  const o = c("span", { className: "route-side", "aria-hidden": "true" });
  o.innerHTML = t === "previous" ? U.chevronLeft : U.chevronRight;
  const a = c("div", { className: "route-main" });
  return a.append(
    c("span", { className: "route-category", textContent: e.category }),
    c("span", { className: "route-title", textContent: e.title }),
    r
  ), t === "previous" ? i.append(o, a) : i.append(a, o), i.addEventListener("click", (s) => {
    s.preventDefault(), se(n);
  }), i;
}
function Kc(e) {
  if (!C.get().spec) return { prev: null, next: null };
  const n = Gc();
  if (n.length === 0) return { prev: null, next: null };
  const i = Yc(n, e);
  return i < 0 ? { prev: null, next: null } : {
    prev: i > 0 ? n[i - 1] : null,
    next: i < n.length - 1 ? n[i + 1] : null
  };
}
function Gc() {
  const e = C.get().spec;
  if (!e) return [];
  const t = [], n = /* @__PURE__ */ new Set();
  for (const i of e.tags)
    for (const r of i.operations) {
      const o = `${r.method.toLowerCase()} ${r.path}`;
      n.has(o) || (n.add(o), t.push({
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
function Yc(e, t) {
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
async function Vc(e, t, n) {
  de(e), de(t);
  const i = t.parentElement;
  i && (i.setAttribute("aria-label", "Try It"), i.classList.add("try-it"));
  const r = C.get(), o = Ps(r), a = Ci(r), s = o + (n.path.startsWith("/") ? "" : "/") + n.path, l = [], u = B({
    text: n.method.toUpperCase(),
    kind: "method",
    method: n.method,
    size: "m"
  });
  l.push({
    label: a || r.spec?.info.title || "Home",
    href: "/",
    className: "breadcrumb-item",
    onClick: (N) => {
      N.preventDefault(), se("/");
    }
  });
  const f = new Set((r.spec?.tags || []).map((N) => N.name.toLowerCase())), d = (n.path || "/").split("/").filter(Boolean);
  for (const N of d) {
    const H = N.startsWith("{") && N.endsWith("}"), Y = !H && f.has(N.toLowerCase()), W = r.spec?.tags.find((G) => G.name.toLowerCase() === N.toLowerCase());
    Y && W ? l.push({
      label: N,
      href: ce({ type: "tag", tag: W.name }),
      className: "breadcrumb-item breadcrumb-segment",
      onClick: (G) => {
        G.preventDefault(), se(ce({ type: "tag", tag: W.name }));
      }
    }) : l.push({
      label: N,
      className: H ? "breadcrumb-param" : "breadcrumb-segment"
    });
  }
  const g = _t({
    ariaLabel: "Copy URL",
    copiedAriaLabel: "Copied",
    className: "breadcrumb-copy",
    getText: () => `${n.method.toUpperCase()} ${s}`
  }), h = er(l, {
    leading: [u],
    trailing: [g]
  }), y = c("div", { className: "block header" });
  if (y.append(c("h1", {
    textContent: n.summary || `${n.method.toUpperCase()} ${n.path}`
  })), n.deprecated) {
    const N = c("span", { className: "icon-muted" });
    N.innerHTML = U.warning, y.append(c("div", {}, c("span", { className: "endpoint-meta deprecated" }, N, "Deprecated")));
  }
  if (pe(n.resolvedSecurity)) {
    const N = rl(r, n), H = ti(n.resolvedSecurity) || "Auth required", Y = tr({
      configured: N,
      variant: "endpoint",
      title: bt(n.resolvedSecurity)
    });
    y.append(c("span", {
      className: `endpoint-meta auth${N ? " is-active" : ""}`,
      title: bt(n.resolvedSecurity),
      "aria-label": bt(n.resolvedSecurity)
    }, Y, H));
  }
  const m = c("div", { className: "breadcrumb-wrap" });
  m.append(h), y.append(m), n.description && y.append(c("p", { textContent: n.description })), e.append(y);
  const E = Jc(n);
  E && e.append(E);
  const v = n.parameters.filter((N) => N.in !== "cookie"), x = be({ title: "Request" });
  if (v.length > 0 && x.append(Xc(v)), n.requestBody && x.append(Zc(n)), v.length === 0 && !n.requestBody) {
    const N = c("div", { className: "params empty", textContent: "No parameters or request body required" });
    x.append(N);
  }
  e.append(x);
  let j = !1;
  Object.keys(n.responses).length > 0 && (e.append(el(n)), j = !0);
  const T = Hi({
    type: "endpoint",
    method: n.method,
    path: n.path,
    operationId: n.operationId
  }), O = () => {
    T && e.append(c("div", { className: "block section" }, T));
  };
  j && O(), n.callbacks && n.callbacks.length > 0 && e.append(tl(n)), j || O();
  const P = nl(n);
  Hc(n, t, P);
}
function Jc(e) {
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
  if (pe(e.resolvedSecurity)) {
    const s = C.get().spec, l = s ? ir(e.resolvedSecurity, s.securitySchemes) : {}, f = { ...s ? or(e.resolvedSecurity, s.securitySchemes) : {}, ...l };
    for (const [d, g] of Object.entries(f))
      t.push({
        name: d,
        value: g,
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
    const l = c("div", { className: "schema-row role-flat role-headers" }), u = c("div", { className: "schema-main-row" }), f = c("div", { className: "schema-name-wrapper" });
    f.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: s.name })
    );
    const d = c("div", { className: "schema-meta-wrapper" });
    s.required && d.append(B({ text: "required", kind: "required", size: "m" })), u.append(f, d), l.append(u);
    const g = c("div", { className: "schema-desc-col is-root" });
    s.description && g.append(c("p", { textContent: s.description }));
    const h = c("div", { className: "schema-enum-values" });
    return h.append(B({
      text: s.value || "—",
      kind: "chip",
      size: "s"
    })), g.append(h), g.children.length > 0 && l.append(g), l;
  }), i = De(), r = mn(), o = c("div", { className: "params" }), a = c("div", { className: "body role-headers" });
  return a.append(...n), o.append(a), r.append(o), i.append(r), be(
    { title: "Headers" },
    i
  );
}
function Xc(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, i = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Mi(e, { headerTitle: i, withEnumAndDefault: !0 });
}
function Zc(e) {
  const t = c("div", { className: "request-body-wrap" });
  e.requestBody?.description && t.append(c("p", { textContent: e.requestBody.description }));
  const n = e.requestBody?.content || {};
  for (const [i, r] of Object.entries(n))
    if (r.schema) {
      const o = Zn({ title: "Body" });
      o.append(B({
        text: i,
        kind: "chip",
        size: "s"
      })), t.append(St(r.schema, o));
    }
  return t;
}
function Qc(e) {
  const t = Object.entries(e);
  if (t.length === 0) return null;
  const n = t.map(([a, s]) => {
    const l = s.schema ? Bt(s.schema) : "string", u = s.example !== void 0 ? String(s.example) : s.schema?.example !== void 0 ? String(s.schema.example) : "—", f = c("div", { className: "schema-row role-flat role-headers" }), d = c("div", { className: "schema-main-row" }), g = c("div", { className: "schema-name-wrapper" });
    g.append(
      c("span", { className: "schema-spacer" }),
      c("span", { textContent: a })
    );
    const h = c("div", { className: "schema-meta-wrapper" });
    h.append(B({ text: l, kind: "chip", size: "s" })), s.required && h.append(B({ text: "required", kind: "required", size: "m" })), d.append(g, h), f.append(d);
    const y = c("div", { className: "schema-desc-col is-root" });
    s.description && y.append(c("p", { textContent: s.description }));
    const m = c("div", { className: "schema-enum-values" });
    return m.append(B({
      text: u,
      kind: "chip",
      size: "s"
    })), y.append(m), y.children.length > 0 && f.append(y), f;
  }), i = c("div", { className: "params block" }), r = c("div", { className: "title", textContent: "Headers" }), o = c("div", { className: "body role-headers" });
  return o.append(...n), i.append(r, o), i;
}
function el(e) {
  const t = be({
    titleEl: Qn("Responses")
  }), n = Object.entries(e.responses);
  if (n.length === 0) return t;
  const i = De(), r = c("div", { className: "card-row responses-header-row" }), o = c("div", { className: "tabs-code codes" });
  let a = n[0][0], s = "application/json";
  const l = /* @__PURE__ */ new Map();
  for (const [E, v] of n) {
    const x = zs(E, E === a), j = v.content && Object.keys(v.content)[0] || "application/json", T = v.content?.[j], O = T?.schema ? Bt(T.schema) : "plain";
    let P, N, H, Y;
    if (T?.schema) {
      const G = fc(T.schema);
      P = G.body, N = G.toggleCollapse, H = G.isExpanded, Y = G.hasExpandable;
    } else {
      const G = c("div", { className: "schema" }), Ce = c("div", { className: "body" });
      Ce.append(c("p", { textContent: v.description || "No schema" })), G.append(Ce), P = G, N = () => {
      }, H = () => !1, Y = !1;
    }
    const W = v.headers ? Qc(v.headers) : null;
    l.set(E, {
      body: P,
      headers: W,
      contentType: j,
      schemaType: O,
      toggleCollapse: N,
      isExpanded: H,
      hasExpandable: Y
    }), o.append(x), x.addEventListener("click", () => {
      o.querySelectorAll('[data-badge-group="response-code"]').forEach((Ce) => Br(Ce, !1)), Br(x, !0), a = E;
      const G = l.get(E);
      s = G.contentType, u.textContent = G.contentType, f.textContent = G.schemaType, d.style.display = G.hasExpandable ? "inline-flex" : "none", d.classList.toggle("is-expanded", G.hasExpandable && G.isExpanded()), d.title = G.hasExpandable && G.isExpanded() ? "Collapse all" : "Expand all", h.innerHTML = "", G.headers ? (h.append(G.headers), h.hidden = !1) : h.hidden = !0, y.innerHTML = "", y.append(G.body);
    });
  }
  r.append(o);
  const u = B({
    text: s,
    kind: "chip",
    size: "s"
  }), f = B({
    text: l.get(a)?.schemaType || "plain",
    kind: "chip",
    size: "s"
  }), d = c("button", {
    className: "schema-collapse-btn is-expanded",
    type: "button",
    title: "Collapse all"
  });
  d.innerHTML = U.chevronDown, d.addEventListener("click", (E) => {
    E.stopPropagation();
    const v = l.get(a);
    v?.hasExpandable && (v.toggleCollapse(), d.classList.toggle("is-expanded", v.isExpanded()), d.title = v.isExpanded() ? "Collapse all" : "Expand all");
  }), r.append(u, f, d), i.append(Xn(r));
  const g = mn(), h = c("div", { className: "params wrap" }), y = c("div"), m = l.get(a);
  return m && (m.headers ? (h.append(m.headers), h.hidden = !1) : h.hidden = !0, y.append(m.body), d.style.display = m.hasExpandable ? "inline-flex" : "none", d.classList.toggle("is-expanded", m.hasExpandable && m.isExpanded()), d.title = m.hasExpandable && m.isExpanded() ? "Collapse all" : "Expand all"), g.append(h, y), i.append(g), t.append(i), t;
}
function tl(e) {
  const t = be({
    titleEl: Qn("Callbacks", B({ text: String(e.callbacks.length), kind: "chip", size: "m" }))
  });
  for (const n of e.callbacks) {
    const i = c("div", { className: "callback-block" });
    i.append(c("div", { className: "callback-name", textContent: n.name }));
    for (const r of n.operations) {
      const o = c("div", { className: "callback-operation" }), a = c("div", { className: "callback-op-header" });
      if (a.append(
        B({
          text: r.method.toUpperCase(),
          kind: "method",
          method: r.method
        }),
        c("span", { className: "callback-op-path", textContent: r.path })
      ), o.append(a), r.summary && o.append(c("div", { className: "callback-op-summary", textContent: r.summary })), r.description && o.append(c("p", { textContent: r.description })), r.requestBody) {
        const s = r.requestBody.content || {};
        for (const [l, u] of Object.entries(s))
          u.schema && o.append(St(u.schema, `${l} — Request Body`));
      }
      if (Object.keys(r.responses).length > 0)
        for (const [s, l] of Object.entries(r.responses)) {
          const u = c("div", { className: "callback-response-row" });
          if (u.append(B({
            text: s,
            kind: "status",
            statusCode: s
          })), l.description && u.append(c("p", { textContent: l.description })), l.content)
            for (const [f, d] of Object.entries(l.content))
              d.schema && u.append(St(d.schema, `${f}`));
          o.append(u);
        }
      i.append(o);
    }
    t.append(i);
  }
  return t;
}
function nl(e) {
  const t = Object.keys(e.responses).sort((n, i) => {
    const r = n.startsWith("2") ? 0 : n.startsWith("4") ? 1 : 2, o = i.startsWith("2") ? 0 : i.startsWith("4") ? 1 : 2;
    return r - o || n.localeCompare(i);
  });
  for (const n of t) {
    const i = e.responses[n];
    if (!i?.content) continue;
    const r = Object.keys(i.content)[0] || "application/json", o = i.content[r], s = (o ? qi(o) : [])[0];
    if (s && s.value !== void 0) {
      const l = typeof s.value == "string" ? s.value : JSON.stringify(s.value, null, 2), u = i.description || (n.startsWith("2") ? "OK" : n.startsWith("4") ? "Not Found" : "Error");
      return { statusCode: n, statusText: u, body: l };
    }
    if (o?.example !== void 0) {
      const l = typeof o.example == "string" ? o.example : JSON.stringify(o.example, null, 2);
      return { statusCode: n, statusText: i.description || "OK", body: l };
    }
  }
  return null;
}
function rl(e, t) {
  const n = t.resolvedSecurity?.requirements || [];
  if (!pe(t.resolvedSecurity)) return !1;
  const i = (e.auth.token || "").trim(), r = e.auth.schemes || {}, o = e.auth.activeScheme, a = (s) => String(r[s] || "").trim() ? !0 : i ? !o || o === s : !1;
  return n.some((s) => {
    const l = s.map((u) => u.schemeName);
    return l.length === 0 ? !0 : l.every((u) => a(u));
  });
}
function il(e, t, n) {
  de(e);
  const i = C.get().spec;
  if (!i) return;
  const r = i.tags.find((m) => m.name === n);
  if (!r || r.operations.length === 0) {
    const m = c("div", { className: "block header" });
    m.append(c("h1", { textContent: "Tag not found" })), e.append(m), e.append(be(
      { title: "Details" },
      c("p", { textContent: `No operations for tag "${n}"` })
    ));
    return;
  }
  const o = c("div", { className: "block header" });
  o.append(c("h1", { textContent: r.name }));
  const a = C.get(), s = Ci(a), l = er([
    {
      label: s || i.info.title || "Home",
      href: "/",
      className: "breadcrumb-item",
      onClick: (m) => {
        m.preventDefault(), se("/");
      }
    },
    { label: n, className: "breadcrumb-current" }
  ], {
    className: "breadcrumb-tag-page",
    leading: [B({ text: "Category", kind: "chip", size: "m" })]
  }), u = c("div", { className: "breadcrumb-wrap" });
  u.append(l), o.append(u), r.description && o.append(c("p", { textContent: r.description })), e.append(o);
  const f = ol(r), d = r.operations.filter((m) => pe(m.resolvedSecurity)).length, g = r.operations.filter((m) => m.deprecated).length;
  e.append(be(
    { className: "summary" },
    Ii(
      [
        { label: "Endpoints", value: r.operations.length },
        { label: "Auth Required", value: d },
        { label: "Deprecated", value: g }
      ],
      f
    )
  ));
  const h = be({ title: "Endpoints" }), y = C.get().route;
  for (const m of r.operations) {
    const E = {
      type: "endpoint",
      tag: r.name,
      method: m.method,
      path: m.path,
      operationId: m.operationId
    }, v = y.type === "endpoint" && (y.operationId && y.operationId === m.operationId || y.method === m.method && y.path === m.path), x = De({
      interactive: !0,
      active: v,
      className: `card-group${m.deprecated ? " deprecated" : ""}`,
      onClick: () => se(ce(E))
    }), j = c("div", { className: "card-info" });
    j.append(c("h3", {}, c("code", { textContent: m.path }))), (m.summary || m.operationId) && j.append(c("p", { textContent: m.summary || m.operationId }));
    const T = c("div", { className: "card-badges" });
    T.append(B({ text: m.method.toUpperCase(), kind: "method", method: m.method, size: "m" })), pe(m.resolvedSecurity) && T.append(tr({
      configured: rr(m.resolvedSecurity, i.securitySchemes || {}),
      variant: "tag",
      title: bt(m.resolvedSecurity)
    })), x.append(j, T), h.append(x);
  }
  e.append(h);
}
function ol(e) {
  const t = {};
  for (const n of e.operations)
    t[n.method] = (t[n.method] || 0) + 1;
  return t;
}
async function al(e, t) {
  de(e);
  const n = B({
    text: "WEBHOOK",
    kind: "webhook",
    size: "m"
  }), i = B({
    text: t.method.toUpperCase(),
    kind: "method",
    method: t.method,
    size: "m"
  }), r = er(
    [
      {
        label: "Overview",
        href: "/",
        className: "breadcrumb-item",
        onClick: (u) => {
          u.preventDefault(), se("/");
        }
      },
      { label: t.name, className: "breadcrumb-segment" }
    ],
    { leading: [n, i] }
  ), o = c("div", { className: "block header" });
  t.summary ? o.append(c("h1", { textContent: t.summary })) : o.append(c("h1", { textContent: t.name }));
  const a = c("div", { className: "breadcrumb-wrap" });
  a.append(r), o.append(a), t.description && o.append(c("p", { textContent: t.description })), e.append(o);
  const s = t.parameters.filter((u) => u.in !== "cookie");
  if (s.length > 0) {
    const u = be({ title: "Parameters" }, sl(s));
    e.append(u);
  }
  if (t.requestBody) {
    const u = be({ title: "Webhook Payload" });
    t.requestBody.description && u.append(c("p", { textContent: t.requestBody.description }));
    const f = t.requestBody.content || {};
    for (const [d, g] of Object.entries(f))
      if (g.schema) {
        const h = Zn({ title: "Body" });
        h.append(B({
          text: d,
          kind: "chip",
          size: "s"
        })), u.append(St(g.schema, h));
      }
    e.append(u);
  }
  if (Object.keys(t.responses).length > 0) {
    const u = be({ title: "Expected Responses" });
    for (const [f, d] of Object.entries(t.responses)) {
      const g = c("div", { className: "response-block" });
      if (g.append(B({
        text: f,
        kind: "status",
        statusCode: f
      })), d.description && g.append(c("p", { textContent: d.description })), d.content)
        for (const [h, y] of Object.entries(d.content))
          y.schema && g.append(St(y.schema, `${h} — Schema`));
      u.append(g);
    }
    e.append(u);
  }
  const l = Hi({ type: "webhook", webhookName: t.name });
  l && e.append(c("div", { className: "block section" }, l));
}
function sl(e) {
  const t = e.filter((r) => r.in === "path").length, n = e.filter((r) => r.in === "query").length, i = t > 0 && n > 0 ? "Parameters" : t > 0 ? "Path" : "Query";
  return Mi(e, { headerTitle: i, withEnumAndDefault: !1 });
}
function cl() {
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
function Yt(e) {
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
  const o = c("div", { className: "block header" });
  return i && o.append(c("span", { innerHTML: i, className: "icon-muted" })), o.append(c("h2", { textContent: t })), n && o.append(c("p", { className: "error-message", textContent: n })), o;
}
let qe = null, Ae = null, ar = null, sr = null, cr = null, Zt = null, Qt = !1, Vt = "", yt = null;
const ll = 991;
function ul(e, t) {
  qe = c("div", { className: "root" });
  const n = {
    primaryColor: t.primaryColor
  };
  Mr(qe, C.get().theme, n);
  const i = c("button", {
    type: "button",
    className: "sidebar-expand-trigger",
    "aria-label": "Open sidebar"
  });
  i.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>', i.addEventListener("click", () => {
    C.set({ sidebarOpen: !0 }), Ae?.classList.remove("collapsed");
  }), Ae = c("aside", { className: "sidebar", "aria-label": "Navigation" });
  const { page: r, main: o, aside: a } = cl();
  ar = r, sr = o, cr = a, qe.append(i, Ae, r), e.append(qe), fl(), C.subscribe((s) => {
    qe && (Mr(qe, s.theme, n), Ae?.classList.toggle("collapsed", !s.sidebarOpen), i.classList.toggle("visible", !s.sidebarOpen), Vr(s, t));
  }), Ae?.classList.toggle("collapsed", !C.get().sidebarOpen), i.classList.toggle("visible", !C.get().sidebarOpen), Vr(C.get(), t);
}
function dl() {
  yt?.(), yt = null, qe && (qe.remove(), qe = null, Ae = null, ar = null, sr = null, cr = null, Zt = null, Qt = !1);
}
async function Vr(e, t) {
  const n = !!e.spec;
  Ae && n ? (Qt ? tc(Ae, e.route) : jr(Ae, t), Qt = !0) : Qt = !1;
  const i = sr, r = cr, o = ar;
  if (!i || !r || !o) return;
  if (e.loading) {
    _e(o, !1), de(r), At(i, Yt({ title: "Loading...", message: "Loading API specification...", variant: "loading" }));
    const g = i.parentElement;
    g && (g.scrollTop = 0);
    return;
  }
  if (e.error) {
    _e(o, !1), de(r), At(i, Yt({
      title: "Failed to load API specification",
      message: e.error,
      icon: U.warning,
      variant: "error"
    }));
    const g = i.parentElement;
    g && (g.scrollTop = 0);
    return;
  }
  if (!e.spec) return;
  const a = e.route, s = `${e.activeEnvironment}|${e.auth.token}`, l = !!(Zt && hl(Zt, a)), u = l && Vt !== s, f = i.parentElement, d = f ? f.scrollTop : 0;
  if (!(l && Vt === s)) {
    switch (u && (Vt = s, pl(o, e), Ae && e.spec && jr(Ae, t)), Zt = { ...a }, Vt = s, de(i), de(r), a.type) {
      case "overview":
        _e(o, !1), Dr(i);
        break;
      case "tag": {
        _e(o, !1), il(i, r, a.tag || "");
        break;
      }
      case "endpoint": {
        const g = Fi(e, a);
        if (g)
          _e(o, !0), await Vc(i, r, g);
        else {
          _e(o, !1);
          const h = a.operationId ? a.operationId : `${a.method?.toUpperCase() || ""} ${a.path || ""}`.trim();
          At(i, Yt({
            title: "Endpoint not found",
            message: h || "Unknown endpoint",
            variant: "empty"
          }));
        }
        break;
      }
      case "schema": {
        const g = e.spec.schemas[a.schemaName || ""];
        if (g) {
          _e(o, !1);
          const h = c("div", { className: "block header" });
          h.append(c("h1", { textContent: a.schemaName || "" })), g.description && h.append(c("p", { textContent: String(g.description) }));
          const y = c("div", { className: "block section" });
          y.append(St(g, "Properties")), At(i, h, y);
        }
        break;
      }
      case "webhook": {
        const g = e.spec.webhooks?.find((h) => h.name === a.webhookName);
        g ? (_e(o, !1), al(i, g)) : (_e(o, !1), At(i, Yt({
          title: "Webhook not found",
          message: a.webhookName || "",
          variant: "empty"
        })));
        break;
      }
      default:
        _e(o, !1), Dr(i);
    }
    f && (f.scrollTop = u ? d : 0);
  }
}
function pl(e, t, n) {
  const i = hn(t), r = Vn(i), o = e.querySelector(".breadcrumb-item");
  if (o && (o.textContent = r || t.spec?.info.title || "Home"), t.route.type !== "endpoint" || !t.spec) return;
  const a = e.querySelector(".aside.try-it .content"), s = Fi(t, t.route);
  if (s && pe(s.resolvedSecurity) && a) {
    const l = a.querySelector(".headers-list");
    if (l) {
      const u = ["Authorization", "Cookie"];
      Array.from(l.querySelectorAll(".header-row")).filter((v) => {
        const x = v.querySelector("[data-header-name]");
        return x && u.includes(x.value);
      }).forEach((v) => v.remove());
      const g = ir(s.resolvedSecurity, t.spec.securitySchemes), y = { ...or(s.resolvedSecurity, t.spec.securitySchemes), ...g }, m = Array.from(l.querySelectorAll(".header-row")), E = m.find((v) => {
        const x = v.querySelector("[data-header-name]");
        return x && x.value === "Content-Type";
      }) || m[0];
      for (const [v, x] of Object.entries(y).reverse()) {
        const j = Lt(v, x);
        E ? E.insertAdjacentElement("beforebegin", j) : l.prepend(j);
      }
    }
  }
  a && s && a.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function Fi(e, t) {
  if (!e.spec || t.type !== "endpoint") return null;
  if (t.operationId) {
    const a = e.spec.operations.find((s) => s.operationId === t.operationId);
    if (a) return a;
  }
  const n = (t.method || "").toLowerCase(), i = Jr(t.path);
  if (!n || !i) return null;
  const r = e.spec.operations.filter(
    (a) => a.method === n && a.path === i
  );
  if (r.length > 0) {
    if (t.tag) {
      const a = r.find((s) => s.tags.includes(t.tag));
      if (a) return a;
    }
    return r[0];
  }
  const o = e.spec.operations.filter(
    (a) => a.method.toLowerCase() === n && Jr(a.path) === i
  );
  if (o.length > 0) {
    if (t.tag) {
      const a = o.find((s) => s.tags.includes(t.tag));
      if (a) return a;
    }
    return o[0];
  }
  return null;
}
function Jr(e) {
  if (!e) return "";
  let n = (e.split("?")[0]?.split("#")[0] || "").trim().replace(/\/{2,}/g, "/");
  try {
    n = decodeURIComponent(n).replace(/\/{2,}/g, "/");
  } catch {
  }
  return n.startsWith("/") || (n = `/${n}`), n.length > 1 && (n = n.replace(/\/+$/, "")), n;
}
function fl() {
  if (yt?.(), yt = null, typeof window > "u" || typeof window.matchMedia != "function") return;
  const e = window.matchMedia(`(max-width: ${ll}px)`), t = (r) => {
    const o = !r;
    C.get().sidebarOpen !== o && C.set({ sidebarOpen: o });
  };
  t(e.matches);
  const n = (r) => {
    t(r.matches);
  };
  if (typeof e.addEventListener == "function") {
    e.addEventListener("change", n), yt = () => e.removeEventListener("change", n);
    return;
  }
  const i = n;
  e.addListener(i), yt = () => e.removeListener(i);
}
function hl(e, t) {
  return e.type === t.type && e.operationId === t.operationId && e.method === t.method && e.path === t.path && e.schemaName === t.schemaName && e.tag === t.tag && e.webhookName === t.webhookName;
}
const Ui = "ap_portal_prefs";
function ml() {
  try {
    const e = localStorage.getItem(Ui);
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
function gl(e) {
  try {
    localStorage.setItem(Ui, JSON.stringify(e));
  } catch {
  }
}
function Xr(e) {
  if (e.type === "http") {
    const t = (e.scheme || "").toLowerCase();
    return t === "bearer" ? 0 : t === "basic" ? 3 : 4;
  }
  return e.type === "oauth2" || e.type === "openIdConnect" ? 1 : e.type === "apiKey" ? 2 : 5;
}
function yl(e) {
  const t = Object.keys(e);
  if (t.length === 0) return "";
  let n = t[0], i = Xr(e[n]);
  for (let r = 1; r < t.length; r++) {
    const o = t[r], a = Xr(e[o]);
    a < i && (i = a, n = o);
  }
  return n;
}
function bl(e, t) {
  if (e.activeScheme !== t.activeScheme || e.token !== t.token || e.locked !== t.locked || e.source !== t.source) return !1;
  const n = Object.entries(e.schemes), i = Object.entries(t.schemes);
  if (n.length !== i.length) return !1;
  for (const [r, o] of n)
    if (t.schemes[r] !== o) return !1;
  return !0;
}
function vl(e, t) {
  const n = Object.keys(t);
  if (n.length === 0)
    return { ...e, schemes: { ...e.schemes } };
  const i = {};
  for (const a of n) {
    const s = e.schemes[a];
    typeof s == "string" && s.length > 0 && (i[a] = s);
  }
  let r = e.activeScheme;
  (!r || !t[r]) && (r = n.find((a) => !!i[a]) || ""), !r && e.token && (r = yl(t)), r && e.token && !i[r] && (i[r] = e.token);
  let o = e.token;
  return r && i[r] && o !== i[r] && (o = i[r]), !o && r && i[r] && (o = i[r]), {
    ...e,
    schemes: i,
    activeScheme: r,
    token: o
  };
}
function xl(e, t) {
  let n;
  return ((...i) => {
    clearTimeout(n), n = setTimeout(() => e(...i), t);
  });
}
let un = !1, Dn = null, Hn = null;
function Sl(e) {
  const t = e.mount;
  if (t) {
    const o = typeof t == "string" ? document.querySelector(t) : t;
    if (!o)
      throw new Error(`[PureDocs] Mount target not found: ${String(t)}`);
    return o;
  }
  const n = e.mountId || "puredocs", i = document.getElementById(n);
  if (i) return i;
  const r = document.createElement("div");
  return r.id = n, document.body.append(r), r;
}
function El(e) {
  if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((r) => r.getAttribute("href") === e)) return;
  const i = document.createElement("link");
  i.rel = "stylesheet", i.href = e, document.head.append(i);
}
function Cl(e) {
  document.documentElement.style.minHeight = "100%", document.body.style.minHeight = "100vh", document.body.style.margin = "0", e.style.minHeight = "100vh", e.style.display = "block";
}
async function lr(e) {
  let t = null;
  un && (t = C.get().auth, ur());
  const n = typeof e.mount == "string" ? document.querySelector(e.mount) : e.mount;
  if (!n)
    throw new Error(`[PureDocs] Mount target not found: ${String(e.mount)}`);
  C.reset();
  const i = [{ name: "default", baseUrl: "" }];
  C.set({
    loading: !0,
    theme: Rs(e.theme),
    environments: [...i],
    initialEnvironments: [...i],
    activeEnvironment: "default"
  });
  const r = ml();
  r ? C.set({
    activeEnvironment: r.activeEnvironment || "default",
    auth: r.auth
  }) : t && C.setAuth(t);
  const o = xl(() => {
    const a = C.get();
    gl({
      activeEnvironment: a.activeEnvironment,
      environments: a.environments,
      auth: a.auth
    });
  }, 300);
  C.subscribe(() => o()), xo(""), Hn = ec(), ul(n, e), un = !0;
  try {
    let a;
    const s = e.specUrl;
    if (e.spec)
      a = e.spec;
    else if (s)
      a = await Ts(s);
    else
      throw new Error("Either spec or specUrl must be provided");
    const l = vs(a);
    if (l.servers.length > 0) {
      const d = l.servers.map((y, m) => ({
        name: y.description || (m === 0 ? "default" : `Server ${m + 1}`),
        baseUrl: y.url
      }));
      C.set({ environments: d, initialEnvironments: d.map((y) => ({ ...y })) });
      const g = C.get();
      d.some((y) => y.name === g.activeEnvironment) || C.set({ activeEnvironment: d[0]?.name || "default" });
    }
    const u = C.get().auth, f = vl(u, l.securitySchemes);
    bl(u, f) || C.setAuth(f), _s(l), C.set({ spec: l, loading: !1, error: null });
  } catch (a) {
    C.set({
      loading: !1,
      error: a.message || "Failed to load specification"
    });
  }
  return Dn = kl(), Dn;
}
async function wl(e) {
  if (typeof document > "u")
    throw new Error("[PureDocs] bootstrap() requires a browser environment");
  const t = Sl(e);
  e.cssHref && El(e.cssHref), e.fullPage !== !1 && Cl(t);
  const { mount: n, mountId: i, cssHref: r, fullPage: o, ...a } = e;
  return lr({
    ...a,
    mount: t
  });
}
function ur() {
  un && (Hn?.(), Hn = null, No(), dl(), C.reset(), un = !1, Dn = null);
}
function kl() {
  return {
    getState: () => C.get(),
    subscribe: (e) => C.subscribe(e),
    setToken: (e) => {
      const t = C.get().auth.activeScheme;
      t ? C.setSchemeValue(t, e) : C.setAuth({ token: e, source: "manual" });
    },
    setEnvironment: (e) => C.setActiveEnvironment(e),
    navigate: (e) => se(e)
  };
}
const Zr = [
  "spec-url",
  "spec-json",
  "theme",
  "primary-color",
  "title"
], je = class je extends HTMLElement {
  constructor() {
    super(...arguments), this.api = null, this.reloadTimer = null;
  }
  static get observedAttributes() {
    return [...Zr];
  }
  async connectedCallback() {
    if (je.activeElement && je.activeElement !== this) {
      this.renderSingletonError();
      return;
    }
    je.activeElement = this, await this.mountFromAttributes();
  }
  disconnectedCallback() {
    je.activeElement === this && (this.api = null, ur(), je.activeElement = null);
  }
  attributeChangedCallback(t, n, i) {
    this.isConnected && n !== i && Zr.includes(t) && (this.reloadTimer && clearTimeout(this.reloadTimer), this.reloadTimer = setTimeout(() => {
      this.reload();
    }, 80));
  }
  async reload() {
    je.activeElement === this && await this.mountFromAttributes();
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
      this.api = await lr({ ...t, mount: this });
    } catch (t) {
      const n = t instanceof Error ? t.message : String(t);
      this.innerHTML = `<div style="padding:12px;border:1px solid #ef4444;border-radius:8px;color:#ef4444;background:#fff1f2;font-family:system-ui,sans-serif">[PureDocs] ${n}</div>`;
    }
  }
  parseConfig() {
    const t = this.getAttribute("spec-json");
    return {
      specUrl: this.getAttribute("spec-url") || void 0,
      spec: t ? Nl(t, "spec-json") : void 0,
      theme: Al(this.getAttribute("theme")),
      primaryColor: this.getAttribute("primary-color") || void 0,
      title: this.getAttribute("title") || void 0
    };
  }
  renderSingletonError() {
    this.innerHTML = '<div style="padding:12px;border:1px solid #f59e0b;border-radius:8px;color:#92400e;background:#fffbeb;font-family:system-ui,sans-serif">Only one &lt;pure-docs&gt; instance can be mounted at a time.</div>';
  }
};
je.activeElement = null;
let Fn = je;
function Nl(e, t) {
  try {
    return JSON.parse(e);
  } catch {
    throw new Error(`Invalid JSON in ${t}`);
  }
}
function Al(e) {
  if (e && (e === "light" || e === "dark" || e === "auto"))
    return e;
}
customElements.get("pure-docs") || customElements.define("pure-docs", Fn);
const Ol = {
  mount: lr,
  bootstrap: wl,
  unmount: ur,
  version: "0.0.1"
};
export {
  Ol as PureDocs,
  Fn as PureDocsElement,
  Ol as default
};
//# sourceMappingURL=puredocs.js.map
