/* KBS Milling site – tiny template runtime (no build tools needed) */
(function () {
  var VOID = { area:1, base:1, br:1, col:1, embed:1, hr:1, img:1, input:1, link:1, meta:1, source:1, track:1, wbr:1 };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function lookup(expr, scopes) {
    expr = expr.trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    var parts = expr.split('.');
    for (var i = scopes.length - 1; i >= 0; i--) {
      if (scopes[i] && Object.prototype.hasOwnProperty.call(scopes[i], parts[0])) {
        var v = scopes[i][parts[0]];
        for (var k = 1; k < parts.length; k++) { if (v == null) return undefined; v = v[parts[k]]; }
        return v;
      }
    }
    return undefined;
  }
  var HOLE = /\{\{([^}]*)\}\}/g;
  function interp(str, scopes) {
    return str.replace(HOLE, function (_, e) { var v = lookup(e, scopes); return v == null ? '' : String(v); });
  }
  function whole(str) { var m = /^\s*\{\{([^}]*)\}\}\s*$/.exec(str); return m ? m[1] : null; }
  var handlers = [];
  function render(node, scopes, out) {
    if (typeof node === 'string') { out.push(esc(interp(node, scopes))); return; }
    var tag = node[0], attrs = node[1], kids = node[2];
    if (tag === 'sc-for') {
      var list = lookup(whole(attrs.list) || '', scopes) || [];
      var as = attrs.as || 'item';
      for (var i = 0; i < list.length; i++) {
        var sc = {}; sc[as] = list[i];
        var ns = scopes.concat([sc]);
        for (var j = 0; j < kids.length; j++) render(kids[j], ns, out);
      }
      return;
    }
    if (tag === 'sc-if') {
      var w = whole(attrs.value || '');
      if (w !== null ? lookup(w, scopes) : attrs.value) for (var j2 = 0; j2 < kids.length; j2++) render(kids[j2], scopes, out);
      return;
    }
    out.push('<' + tag);
    for (var name in attrs) {
      if (name.indexOf('hint-') === 0) continue;
      var val = attrs[name];
      if (val === null) { out.push(' ' + name); continue; }
      if (name.slice(0, 2) === 'on' && whole(val) !== null) {
        var fn = lookup(whole(val), scopes);
        if (typeof fn === 'function') { handlers.push(fn); out.push(' data-dc-' + name.slice(2) + '="' + (handlers.length - 1) + '"'); }
        continue;
      }
      out.push(' ' + name + '="' + esc(interp(val, scopes)) + '"');
    }
    out.push('>');
    if (VOID[tag]) return;
    for (var c = 0; c < kids.length; c++) render(kids[c], scopes, out);
    out.push('</' + tag + '>');
  }
  var app, comp, tree;
  function rerender() {
    var keep = {}, focusId = document.activeElement && document.activeElement.id;
    app.querySelectorAll('input[id],textarea[id],select[id]').forEach(function (el) { keep[el.id] = el.value; });
    handlers = [];
    var vals = comp.renderVals ? comp.renderVals() : {};
    var out = [];
    for (var i = 0; i < tree.length; i++) render(tree[i], [window.DC_GLOBALS || {}, vals], out);
    app.innerHTML = out.join('');
    app.querySelectorAll('*').forEach(function (el) {
      for (var a = 0; a < el.attributes.length; a++) {
        var at = el.attributes[a];
        if (at.name.indexOf('data-dc-') === 0) {
          (function (ev, fn) { el.addEventListener(ev, function (e) { fn(e); }); })(at.name.slice(8), handlers[+at.value]);
        }
      }
    });
    app.querySelectorAll('[data-init-value]').forEach(function (el) { if (!(el.id in keep)) el.value = el.getAttribute('data-init-value'); });
    Object.keys(keep).forEach(function (id) { var el = document.getElementById(id); if (el && el.type !== 'file') el.value = keep[id]; });
    if (focusId) { var f = document.getElementById(focusId); if (f) f.focus(); }
    (window.DC_AFTER || []).forEach(function (fn) { try { fn(app); } catch (e) {} });
  }
  window.DCRerender = function () { if (comp) rerender(); };
  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (p) {
    Object.assign(this.state, typeof p === 'function' ? p(this.state) : p);
    rerender();
  };
  window.DCMount = function (Comp, t, props) {
    tree = t; app = document.getElementById('app');
    comp = new Comp(props || {});
    if (!comp.state) comp.state = {};
    rerender();
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
  };
})();
