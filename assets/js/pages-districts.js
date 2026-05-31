/* ============================================================================
   AdaptFi — pages: District Explorer (16) and District detail (17).
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI, Comp = global.Comp, App = global.App;
  const esc = UI.esc;
  const Pages = global.Pages = global.Pages || {};
  Pages._dview = Pages._dview || { layer: 'aggregate', onlyScreened: false };

  function screenedDistrictIds() {
    const set = {}; DB.SCREENINGS.forEach(function (s) { set[s.district_id] = 1; }); return set;
  }

  /* ----- 16 District Explorer ------------------------------------------- */
  Pages.districts = function () {
    const v = Pages._dview;
    const screened = screenedDistrictIds();
    let list = DB.DISTRICTS.slice();
    if (v.onlyScreened) list = list.filter(function (d) { return screened[d.id]; });

    const layerOptions = ['aggregate'].concat(DB.HAZARDS).map(function (o) {
      const label = o === 'aggregate' ? 'Composite hazard' : o;
      return '<option value="' + esc(o) + '"' + (v.layer === o ? ' selected' : '') + '>' + esc(label) + '</option>';
    }).join('');

    const controls = '<div class="card pad" style="margin-bottom:18px"><div class="row wrapf between" style="gap:14px">' +
      '<div class="row wrapf" style="gap:12px">' +
        '<label class="row" style="gap:8px;font-size:12.5px"><span class="muted">Heatmap layer</span>' +
          '<select class="select" id="layerSel" style="min-width:170px">' + layerOptions + '</select></label>' +
        '<label class="row" style="gap:8px;font-size:12.5px"><span class="toggle"><input type="checkbox" id="onlyScreened"' + (v.onlyScreened ? ' checked' : '') + '><span class="tk"></span></span> Only districts with screenings</label>' +
      '</div>' +
      '<div class="input-search" style="min-width:240px"><span class="si">' + UI.icon('search') + '</span>' +
        '<input class="input" id="distSearch" placeholder="Search district…"></div>' +
    '</div></div>';

    const topRows = DB.ANALYTICS.top_districts.map(function (t) {
      const d = DB.district(t.id);
      return '<tr class="rowlink" data-href="#/districts/' + t.id + '"><td class="strong">' + esc(t.name) + '</td>' +
        '<td class="meta">' + esc(d ? d.state : '') + '</td><td class="num"><span class="tag-soft">' + t.count + '</span></td></tr>';
    }).join('');

    const tiles = list.map(function (d) {
      return '<div class="dt-wrap" data-search="' + esc((d.name + ' ' + d.state).toLowerCase()) + '">' + Comp.districtTile(d) + '</div>';
    }).join('');

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">District Explorer · cross-cutting surface</div>' +
        '<h1>Hazard landscape</h1><p class="sub">Browse the district-level hazard landscape. ~720 districts in production; ' + DB.DISTRICTS.length + ' shown here.</p></div></div>' +
      controls +
      '<div class="layout-rail"><div>' + Comp.mapPanel(list, v.layer) + '</div>' +
        '<div class="card"><div class="card-head"><h3>Top by screening activity</h3></div>' +
          '<table class="tbl rowlink"><thead><tr><th>District</th><th>State</th><th class="num">Screenings</th></tr></thead><tbody>' + topRows + '</tbody></table></div>' +
      '</div>' +
      '<div class="section-title">All covered districts <span class="tag-soft" id="distCount">' + list.length + '</span></div>' +
      '<div class="tile-grid" id="distGrid">' + tiles + '</div>';

    return { html: UI.page('districts', [{ label: 'Home', href: '#/dashboard' }, { label: 'District Explorer' }], body),
      onMount: function (root) {
        root.querySelector('#layerSel').addEventListener('change', function (e) { v.layer = e.target.value; global.Router.refresh(); });
        root.querySelector('#onlyScreened').addEventListener('change', function (e) { v.onlyScreened = e.target.checked; global.Router.refresh(); });
        const search = root.querySelector('#distSearch');
        search.addEventListener('input', function () {
          const q = search.value.toLowerCase(); let n = 0;
          root.querySelectorAll('#distGrid .dt-wrap').forEach(function (it) {
            const hit = !q || (it.getAttribute('data-search') || '').indexOf(q) !== -1;
            it.style.display = hit ? '' : 'none'; if (hit) n++;
          });
          root.querySelector('#distCount').textContent = n;
        });
      }};
  };

  /* ----- 17 District detail ---------------------------------------------- */
  Pages.districtDetail = function (p) {
    const d = DB.district(p.id);
    if (!d) return Pages.notFound('districts/' + p.id);
    const profile = d.hazards;
    const activeScr = DB.SCREENINGS.filter(function (s) { return s.district_id === d.id; });
    const related = DB.DISTRICTS.filter(function (x) { return x.id !== d.id && x.state === d.state; }).slice(0, 4);
    if (related.length < 3) {
      DB.DISTRICTS.forEach(function (x) { if (x.id !== d.id && related.indexOf(x) === -1 && related.length < 4) related.push(x); });
    }

    // applicable measures by sub-sector for this district's profile
    const bySub = DB.SUBSECTORS.map(function (s) {
      const c = DB.measuresForProfile(s, profile).length;
      return '<a class="card hoverable" href="#/library/sub-sector/' + DB.SUBSECTOR_SLUG[s] + '" style="padding:14px">' +
        '<div class="row between"><span class="strong" style="font-size:12.5px">' + esc(s) + '</span><span class="h3">' + c + '</span></div>' +
        '<div class="meta" style="margin-top:4px">applicable measures</div></a>';
    }).join('');

    const scrRows = activeScr.length ? activeScr.map(function (s) {
      return '<tr class="rowlink" data-href="#/projects/' + s.project_id + '"><td class="mono meta">' + esc(s.screening_id) + '</td>' +
        '<td>' + esc(s.name) + '</td><td>' + esc(s.sub_sector) + '</td><td>' + UI.eligibilityChip(s.eligibility) + '</td><td>' + UI.statusChip(s.status) + '</td></tr>';
    }).join('') : '<tr><td colspan="5" class="muted">No active screenings in this district.</td></tr>';

    const rail = '<div class="card"><div class="card-head"><h3>District context</h3></div><div class="card-body"><div class="deflist">' +
      Comp.di('Reference ID', '<span class="mono">' + esc(d.id) + '</span>') +
      Comp.di('State', esc(d.state)) + Comp.di('Classification', esc(d.classification)) +
      Comp.di('Population', '~' + esc(d.population)) + Comp.di('Seismic zone', 'Zone ' + esc(d.seismic_zone) + ' (IS 1893)') +
      Comp.di('Climate zone', esc(d.climate_zone)) + Comp.di('Snapshot', '<span class="mono">' + esc(DB.SNAPSHOT.id) + '</span>') +
      '</div></div></div>' +
      '<div class="card"><div class="card-head"><h3>Data sources</h3></div><div class="card-body stack" style="gap:8px">' +
        DB.DATA_SOURCES.slice(0, 3).map(function (x) { return '<div class="row between"><span class="strong" style="font-size:12px">' + esc(x.name) + '</span><span class="meta">' + esc(x.use) + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="card"><div class="card-head"><h3>Related districts</h3></div><div class="card-body stack" style="gap:8px">' +
        related.map(function (r) { return '<a class="row between" href="#/districts/' + r.id + '"><span style="font-size:12.5px">' + esc(r.name) + '</span><span class="meta">' + esc(r.state) + '</span></a>'; }).join('') + '</div></div>';

    const body =
      '<div class="statusstrip" style="margin-bottom:18px"><div><div class="sid mono">' + esc(d.id) + '</div>' +
        '<h2>' + esc(d.name) + '</h2><div class="identity">' + esc(d.state) + ' · ' + esc(d.classification) + ' · snapshot ' + esc(DB.SNAPSHOT.snapshotted_at) + '</div></div>' +
        '<div class="topbar-spacer" style="flex:1"></div>' +
        '<button class="btn btn-primary" id="launchBtn">' + UI.icon('plus') + ' New screening here</button></div>' +
      '<div class="layout-rail"><div class="stack">' +
        '<div class="card pad"><div class="section-title" style="margin-top:0">Hazard profile</div>' + Comp.hazardProfileGrid(profile, { desc: true }) + '</div>' +
        '<div class="card pad"><div class="section-title" style="margin-top:0">Applicable adaptation measures</div>' +
          '<p class="meta" style="margin-bottom:12px">Measures whose hazard is rated Medium or High in this district, by sub-sector.</p>' +
          '<div class="grid cols-4">' + bySub + '</div></div>' +
        '<div class="card"><div class="card-head"><h3>Active screenings in this district</h3><span class="tag-soft">' + activeScr.length + '</span></div>' +
          '<table class="tbl rowlink"><thead><tr><th>ID</th><th>Project</th><th>Sub-sector</th><th>Eligibility</th><th>Status</th></tr></thead><tbody>' + scrRows + '</tbody></table></div>' +
      '</div><div class="stack">' + rail + '</div></div>';

    return { html: UI.page('districts', [{ label: 'Home', href: '#/dashboard' }, { label: 'District Explorer', href: '#/districts' }, { label: d.name }], body),
      onMount: function (root) {
        root.querySelector('#launchBtn').addEventListener('click', function () {
          App.resetDraft(); App.draft.districtId = d.id;
          UI.toast('Started a screening for ' + d.name);
          global.Router.go('#/new/1');
        });
      }};
  };
})(window);
