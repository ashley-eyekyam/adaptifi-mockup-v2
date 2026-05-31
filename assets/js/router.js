/* ============================================================================
   AdaptFi — Hash router. Maps #/path patterns to Pages.* renderers.
   A renderer returns either an HTML string, or { html, onMount(root) }.
   Works on file:// — no server, no history API.
   ========================================================================== */
(function (global) {
  'use strict';

  const routes = [
    ['',                         function (p) { return Pages.catalogue(p); }],
    ['signin',                   function (p) { return Pages.signin(p); }],
    ['dashboard',                function (p) { return Pages.dashboard(p); }],
    ['projects',                 function (p) { return Pages.projects(p); }],
    ['projects/:id',             function (p) { return Pages.projectDetail(p); }],
    ['screenings/:id/output',    function (p) { return Pages.output(p); }],
    ['screenings/:id',           function (p) { return Pages.projectDetail(p); }],
    ['output',                   function (p) { return Pages.output(p); }],
    ['new',                      function (p) { return Pages.wizard(p); }],
    ['new/:step',                function (p) { return Pages.wizard(p); }],
    ['library',                  function (p) { return Pages.library(p); }],
    ['library/measure/:id',      function (p) { return Pages.measureDetail(p); }],
    ['library/sub-sector/:slug', function (p) { return Pages.subsectorView(p); }],
    ['library/hazard/:slug',     function (p) { return Pages.hazardView(p); }],
    ['districts',                function (p) { return Pages.districts(p); }],
    ['districts/:id',            function (p) { return Pages.districtDetail(p); }],
    ['admin',                    function (p) { return Pages.adminHome(p); }],
    ['admin/methodology',        function (p) { return Pages.methodology(p); }],
    ['admin/hazards',            function (p) { return Pages.hazards(p); }],
    ['admin/versions',           function (p) { return Pages.versions(p); }],
    ['admin/users',              function (p) { return Pages.users(p); }],
    ['admin/analytics',          function (p) { return Pages.analytics(p); }],
    ['settings',                 function (p) { return Pages.settings(p); }],
    ['about',                    function (p) { return Pages.about(p); }]
  ];

  function match(path) {
    const segs = path.split('/').filter(Boolean);
    for (let i = 0; i < routes.length; i++) {
      const pat = routes[i][0].split('/').filter(Boolean);
      if (pat.length !== segs.length) continue;
      const params = {};
      let ok = true;
      for (let j = 0; j < pat.length; j++) {
        if (pat[j][0] === ':') params[pat[j].slice(1)] = decodeURIComponent(segs[j]);
        else if (pat[j] !== segs[j]) { ok = false; break; }
      }
      if (ok) return { handler: routes[i][1], params: params };
    }
    return null;
  }

  function currentPath() {
    let h = global.location.hash || '#/';
    h = h.replace(/^#\/?/, '');
    return h;
  }

  function render() {
    const root = document.getElementById('root');
    const path = currentPath();
    const m = match(path) || { handler: function () { return Pages.notFound(path); }, params: {} };
    let result;
    try {
      result = m.handler(m.params);
    } catch (err) {
      console.error('Render error on', path, err);
      result = '<div class="wrap"><div class="empty"><div class="ei">⚠</div>Something went wrong rendering this view.<br><span class="mono">' +
        (err && err.message ? err.message : '') + '</span></div></div>';
    }
    const html = typeof result === 'string' ? result : result.html;
    root.innerHTML = html;
    global.scrollTo(0, 0);
    if (result && typeof result === 'object' && typeof result.onMount === 'function') {
      result.onMount(root);
    }
  }

  const Router = {
    start: function () {
      global.addEventListener('hashchange', render);
      render();
    },
    go: function (hash) {
      if (global.location.hash === hash) render();
      else global.location.hash = hash;
    },
    refresh: render
  };

  global.Router = Router;
})(window);
