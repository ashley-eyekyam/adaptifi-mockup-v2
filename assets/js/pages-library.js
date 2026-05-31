/* ============================================================================
   AdaptFi — pages: Library overview (12), Measure detail (13),
   Sub-sector view (14), Hazard view (15).
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI, Comp = global.Comp, App = global.App;
  const esc = UI.esc;
  const Pages = global.Pages = global.Pages || {};

  /* ----- 12 Library overview -------------------------------------------- */
  Pages.library = function () {
    const f = App.filters.library;
    const filtered = DB.MEASURES.filter(function (m) {
      if (f.subSector && m.sub_sector !== f.subSector) return false;
      if (f.hazard && m.hazard !== f.hazard) return false;
      if (f.loe && m.loe !== f.loe) return false;
      if (f.theme && m.theme !== f.theme) return false;
      return true;
    }).sort(function (a, b) {
      return a.sub_sector.localeCompare(b.sub_sector) || a.hazard.localeCompare(b.hazard);
    });

    // facets
    const ssChips = DB.SUBSECTORS.map(function (s) {
      return facet('subSector', s, esc(s), DB.counts.bySubSector(s), f.subSector === s);
    }).join('');
    const hzChips = DB.HAZARDS.map(function (h) {
      return facet('hazard', h, esc(h), DB.counts.byHazard(h), f.hazard === h,
        '<span class="swatch" style="background:' + DB.HAZARD_COLOR[h] + '"></span>');
    }).join('');
    const loeChips = ['High', 'Medium', 'Low', 'Unspecified'].map(function (l) {
      return facet('loe', l, l, DB.counts.byLoE(l), f.loe === l);
    }).join('');
    const themeChips = DB.THEMES.map(function (t) {
      const short = /operations/i.test(t) ? 'O&M' : 'Build / Retrofit';
      return facet('theme', t, short, DB.counts.byTheme(t), f.theme === t);
    }).join('');

    const rail = '<div class="card pad">' +
      '<div class="input-search" style="margin-bottom:18px"><span class="si">' + UI.icon('search') + '</span>' +
        '<input class="input" id="libSearch" placeholder="Search measures…" value="' + esc(f.q) + '"></div>' +
      '<div class="facet"><h4>Sub-sector</h4><div class="facet-chips">' + ssChips + '</div></div>' +
      '<div class="facet"><h4>Hazard</h4><div class="facet-chips">' + hzChips + '</div></div>' +
      '<div class="facet"><h4>Level of Effort</h4><div class="facet-chips">' + loeChips + '</div></div>' +
      '<div class="facet"><h4>Investment theme</h4><div class="facet-chips">' + themeChips + '</div></div>' +
      ((f.subSector || f.hazard || f.loe || f.theme) ? '<button class="btn btn-sm btn-ghost btn-block" data-clear="all">Clear filters</button>' : '') +
      '</div>';

    const cardsHtml = filtered.map(function (m) {
      return '<div class="lib-item" data-search="' + esc((m.text + ' ' + m.id + ' ' + m.sub_sector + ' ' + m.hazard).toLowerCase()) + '">' + Comp.measureCard(m) + '</div>';
    }).join('');
    const tableHtml = '<div class="card"><table class="tbl rowlink"><thead><tr><th>ID</th><th>Measure</th><th>Sub-sector</th><th>Hazard</th><th>LoE</th><th>Theme</th></tr></thead><tbody>' +
      filtered.map(function (m) {
        return '<tr class="rowlink lib-item" data-href="#/library/measure/' + m.id + '" data-search="' + esc((m.text + ' ' + m.id).toLowerCase()) + '">' +
          '<td class="mono meta">' + esc(m.id) + '</td><td>' + esc(m.text) + '</td><td class="nowrap">' + esc(m.sub_sector) + '</td>' +
          '<td>' + UI.hazardChip(m.hazard, true) + '</td><td>' + UI.loeChip(m.loe) + '</td><td>' + UI.themeChip(m.theme) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    const main = '<div class="row between" style="margin-bottom:16px">' +
      '<span class="meta" id="libCount">' + filtered.length + ' measures</span>' +
      '<div class="seg" id="viewSeg"><button class="' + (f.view === 'cards' ? 'active' : '') + '" data-view="cards">' + UI.icon('grid') + ' Cards</button>' +
        '<button class="' + (f.view === 'table' ? 'active' : '') + '" data-view="table">' + UI.icon('projects') + ' Table</button></div></div>' +
      (f.view === 'table' ? tableHtml : '<div class="grid cols-2" id="libGrid">' + cardsHtml + '</div>');

    const body =
      '<div class="cat-hero" style="padding:32px 36px;margin-bottom:24px"><div class="glow"></div><div class="inner">' +
        '<div class="eyebrow" style="color:var(--primary-light)">Measures Library · the knowledge surface</div>' +
        '<h1 style="font-size:26px">Adaptation measures library</h1>' +
        '<p style="font-size:13.5px">Browse, filter and cite the full expert-authored library. Each measure has its own page, ' +
        'citable as a reference — useful standalone, without running a screening.</p>' +
        '<div class="row" style="margin-top:16px;gap:8px"><span class="chip" style="background:rgba(255,255,255,.14);color:#fff">' + DB.counts.total + ' measures</span>' +
          '<span class="chip" style="background:rgba(255,255,255,.14);color:#fff">cre@1.0</span></div>' +
      '</div></div>' +
      '<div class="grid cols-4 reveal" style="margin-bottom:22px">' +
        UI.stat('Total measures', DB.counts.total, '') +
        UI.stat('Sub-sectors', DB.SUBSECTORS.length, '<span class="muted">Commercial Real Estate</span>', 'info') +
        UI.stat('Hazards covered', DB.HAZARDS.length, '', 'warn') +
        UI.stat('High-LoE share', DB.counts.highShare() + '%', '<span class="muted">' + DB.counts.byLoE('High') + ' measures</span>', 'ok') +
      '</div>' +
      '<div class="row between wrapf" style="margin-bottom:16px">' +
        '<div></div><div class="head-actions"><button class="btn" data-toast="Library exported to CSV">' + UI.icon('download') + ' Export CSV</button>' +
        '<a class="btn" href="#/admin/methodology">' + UI.icon('edit') + ' Edit methodology</a></div></div>' +
      '<div class="layout-rail-l"><div>' + rail + '</div><div>' + main + '</div></div>';

    return { html: UI.page('library', [{ label: 'Home', href: '#/dashboard' }, { label: 'Measures Library' }], body),
      onMount: function (root) {
        const search = root.querySelector('#libSearch');
        search.addEventListener('input', function () {
          const q = search.value.toLowerCase(); f.q = search.value; let n = 0;
          root.querySelectorAll('.lib-item').forEach(function (it) {
            const hit = !q || (it.getAttribute('data-search') || '').indexOf(q) !== -1;
            it.style.display = hit ? '' : 'none'; if (hit) n++;
          });
          root.querySelector('#libCount').textContent = n + ' measures';
        });
        root.querySelectorAll('[data-facet]').forEach(function (c) {
          c.addEventListener('click', function () {
            const k = c.getAttribute('data-facet'), v = c.getAttribute('data-val');
            f[k] = (f[k] === v) ? '' : v; global.Router.refresh();
          });
        });
        root.querySelectorAll('[data-clear]').forEach(function (b) {
          b.addEventListener('click', function () { f.subSector = f.hazard = f.loe = f.theme = ''; global.Router.refresh(); });
        });
        root.querySelectorAll('[data-view]').forEach(function (b) {
          b.addEventListener('click', function () { f.view = b.getAttribute('data-view'); global.Router.refresh(); });
        });
      }};
  };
  function facet(key, val, label, count, active, swatch) {
    return '<button class="fchip ' + (active ? 'active' : '') + '" data-facet="' + esc(key) + '" data-val="' + esc(val) + '">' +
      (swatch || '') + esc(label) + '<span class="cnt">' + count + '</span></button>';
  }

  /* ----- 13 Measure detail ----------------------------------------------- */
  Pages.measureDetail = function (p) {
    const m = DB.measure(p.id);
    if (!m) return Pages.notFound('library/measure/' + p.id);
    const usedIn = DB.SCREENINGS.filter(function (s) { return s.applied.indexOf(m.id) !== -1; });
    const related = (m.related || []).map(function (id) { return DB.measure(id); }).filter(Boolean);

    const title = '<div class="card pad" style="margin-bottom:18px">' +
      '<div class="row wrapf" style="gap:8px;margin-bottom:12px">' + UI.loeChip(m.loe) + UI.hazardChip(m.hazard) +
        UI.subsectorChip(m.sub_sector) + UI.themeChip(m.theme) + '<span class="mono meta" style="margin-left:auto">' + esc(m.id) + '</span></div>' +
      '<h1 class="h2" style="line-height:1.4">' + esc(m.text) + '</h1></div>';

    const narrative = '<div class="card pad"><div class="section-title" style="margin-top:0">What the measure does</div>' +
      '<p>' + esc(m.text) + ' This intervention targets <strong>' + esc(m.hazard) + '</strong> exposure for ' + esc(m.sub_sector) + ' assets, ' +
        'classified as a <strong>' + esc(m.loe) + '</strong> level-of-effort intervention under the ' + esc(m.theme.replace(/-/g, ' / ')) + ' theme.</p>' +
      '<div class="section-title">Why it matters under this hazard</div>' +
      '<p>' + esc(DB.HAZARD_DESC[m.hazard]) + ' Without it, the asset carries unmitigated residual risk that weakens the adaptation-finance case.</p>' +
      '<div class="section-title">When it applies</div>' +
      '<p>Recommended where the district hazard profile rates <strong>' + esc(m.hazard) + '</strong> as Medium or High for a ' + esc(m.sub_sector) + ' project.</p>' +
      '<div class="dnsh-note" style="margin-top:16px"><strong>DNSH implications.</strong> ' + esc(m.dnsh_notes) + '</div>' +
      '</div>';

    const usedCard = '<div class="card"><div class="card-head"><h3>Used in screenings</h3><span class="tag-soft">' + usedIn.length + '</span></div>' +
      (usedIn.length ? '<table class="tbl rowlink"><thead><tr><th>Screening</th><th>Project</th><th>Status</th></tr></thead><tbody>' +
        usedIn.map(function (s) { return '<tr class="rowlink" data-href="#/projects/' + s.project_id + '"><td class="mono meta">' + esc(s.screening_id) +
          '</td><td>' + esc(s.name) + '</td><td>' + UI.statusChip(s.status) + '</td></tr>'; }).join('') + '</tbody></table>'
        : '<div class="card-body"><div class="empty" style="padding:20px">No screenings have applied this measure yet.</div></div>') +
      '</div>';

    const rail = '<div class="card"><div class="card-head"><h3>Methodology details</h3></div><div class="card-body"><div class="deflist">' +
      Comp.di('Measure ID', '<span class="mono">' + esc(m.id) + '</span>') + Comp.di('Industry', 'Commercial Real Estate') +
      Comp.di('Sub-sector', esc(m.sub_sector)) + Comp.di('Hazard', UI.hazardChip(m.hazard, true)) +
      Comp.di('Level of Effort', UI.loeChip(m.loe)) + Comp.di('Theme', UI.themeChip(m.theme)) +
      Comp.di('First added', '<span class="mono">' + esc(m.version_first_added) + '</span>') +
      Comp.di('Last edited', '<span class="mono">' + esc(m.version_last_edited) + '</span>') + '</div>' +
      '<div class="row" style="gap:8px;margin-top:14px"><button class="btn btn-sm" id="citeBtn">' + UI.icon('copy') + ' Copy citation</button>' +
        '<a class="btn btn-sm" href="#/admin/methodology">' + UI.icon('edit') + ' Edit</a></div></div></div>' +
      (m.citations && m.citations.length ? '<div class="card"><div class="card-head"><h3>Rights &amp; references</h3></div><div class="card-body">' +
        '<ul class="stack" style="gap:8px">' + m.citations.map(function (c) { return '<li class="row" style="gap:8px"><span class="muted">' + UI.icon('doc') + '</span>' + esc(c) + '</li>'; }).join('') + '</ul></div></div>' : '') +
      (related.length ? '<div class="card"><div class="card-head"><h3>Related measures</h3></div><div class="card-body stack" style="gap:10px">' +
        related.map(function (r) { return '<a href="#/library/measure/' + r.id + '" class="row between" style="gap:10px"><span style="font-size:12.5px;max-width:80%">' + esc(r.text.slice(0, 70)) + (r.text.length > 70 ? '…' : '') + '</span><span class="mono meta">' + esc(r.id) + '</span></a>'; }).join('') + '</div></div>' : '');

    const body = title + '<div class="layout-rail"><div class="stack">' + narrative + usedCard + '</div><div class="stack">' + rail + '</div></div>';

    return { html: UI.page('library', [{ label: 'Home', href: '#/dashboard' }, { label: 'Measures Library', href: '#/library' },
        { label: 'Sub-sector', href: '#/library/sub-sector/' + DB.SUBSECTOR_SLUG[m.sub_sector] }, { label: m.id }], body),
      onMount: function (root) {
        const b = root.querySelector('#citeBtn');
        if (b) b.addEventListener('click', function () { UI.toast('Citation copied: AdaptFi measure ' + m.id + ' (cre@1.0)', 'ok'); });
      }};
  };

  /* ----- 14 Sub-sector view ---------------------------------------------- */
  Pages.subsectorView = function (p) {
    const ss = DB.subSectorBySlug(p.slug);
    if (!ss) return Pages.notFound('library/sub-sector/' + p.slug);
    const ms = DB.MEASURES.filter(function (m) { return m.sub_sector === ss; });
    const high = ms.filter(function (m) { return m.loe === 'High'; }).length;
    const scr = DB.SCREENINGS.filter(function (s) { return s.sub_sector === ss; }).length;

    const byHazard = DB.HAZARDS.map(function (h) {
      const c = ms.filter(function (m) { return m.hazard === h; }).length;
      return '<a class="card hoverable" href="#/library/hazard/' + DB.HAZARD_SLUG[h] + '" style="padding:14px;border-left:3px solid ' + DB.HAZARD_COLOR[h] + '">' +
        '<div class="row between"><span class="strong" style="font-size:12.5px">' + DB.HAZARD_ICON[h] + ' ' + esc(h) + '</span><span class="h3">' + c + '</span></div></a>';
    }).join('');

    let groups = '';
    DB.HAZARDS.forEach(function (h) {
      const hm = ms.filter(function (m) { return m.hazard === h; });
      if (!hm.length) return;
      groups += '<div class="section-title">' + UI.hazardChip(h, true) + '<span class="tag-soft">' + hm.length + '</span></div>' +
        '<div class="grid cols-2">' + hm.map(Comp.measureCard).join('') + '</div>';
    });

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Library · sub-sector pivot</div>' +
        '<h1>' + esc(ss) + '</h1><p class="sub">' + esc(DB.SUBSECTOR_BLURB[ss]) + '</p></div>' +
        '<a class="btn" href="#/library">' + UI.icon('back') + ' All measures</a></div>' +
      '<div class="grid cols-3 reveal" style="margin-bottom:22px">' +
        UI.stat('Measures', ms.length, '') + UI.stat('High-LoE measures', high, '', 'ok') +
        UI.stat('Screenings to date', scr, '', 'info') + '</div>' +
      '<div class="section-title" style="margin-top:0">By hazard</div><div class="grid cols-3" style="margin-bottom:8px">' + byHazard + '</div>' +
      groups;

    return UI.page('library', [{ label: 'Home', href: '#/dashboard' }, { label: 'Measures Library', href: '#/library' }, { label: ss }], body);
  };

  /* ----- 15 Hazard view -------------------------------------------------- */
  Pages.hazardView = function (p) {
    const hz = DB.hazardBySlug(p.slug);
    if (!hz) return Pages.notFound('library/hazard/' + p.slug);
    const ms = DB.MEASURES.filter(function (m) { return m.hazard === hz; });
    const highDistricts = DB.DISTRICTS.filter(function (d) { return d.hazards[hz] === 'High'; });
    const flaggedScr = DB.SCREENINGS.filter(function (s) { const d = DB.district(s.district_id); return d && d.hazards[hz] === 'High'; }).length;

    const bySub = DB.SUBSECTORS.map(function (s) {
      const c = ms.filter(function (m) { return m.sub_sector === s; }).length;
      return '<a class="card hoverable" href="#/library/sub-sector/' + DB.SUBSECTOR_SLUG[s] + '" style="padding:14px">' +
        '<div class="row between"><span class="strong" style="font-size:12.5px">' + esc(s) + '</span><span class="h3">' + c + '</span></div></a>';
    }).join('');

    let groups = '';
    DB.SUBSECTORS.forEach(function (s) {
      const sm = ms.filter(function (m) { return m.sub_sector === s; });
      if (!sm.length) return;
      groups += '<div class="section-title">' + esc(s) + '<span class="tag-soft">' + sm.length + '</span></div>' +
        '<div class="grid cols-2">' + sm.map(Comp.measureCard).join('') + '</div>';
    });

    const body =
      '<div class="cat-hero" style="padding:30px 34px;margin-bottom:22px;background:radial-gradient(120% 130% at 85% -10%,' +
        DB.HAZARD_COLOR[hz] + '33 0%, #0c2f34 60%)"><div class="inner">' +
        '<div class="eyebrow" style="color:#fff">' + DB.HAZARD_ICON[hz] + ' Hazard pivot</div>' +
        '<h1 style="font-size:26px">' + esc(hz) + '</h1>' +
        '<p style="font-size:13.5px;color:#dff4f2">' + esc(DB.HAZARD_DESC[hz]) + '</p></div></div>' +
      '<div class="grid cols-3 reveal" style="margin-bottom:22px">' +
        UI.stat('Measures', ms.length, '') + UI.stat('Districts at High', highDistricts.length, '', 'bad') +
        UI.stat('Screenings exposed', flaggedScr, '', 'warn') + '</div>' +
      '<div class="grid cols-2" style="margin-bottom:8px">' +
        '<div class="card"><div class="card-head"><h3>Indicators monitored</h3></div><div class="card-body"><p style="font-size:13px;line-height:1.7">' + esc(DB.HAZARD_INDICATORS[hz]) + '</p></div></div>' +
        '<div class="card"><div class="card-head"><h3>Source reference</h3></div><div class="card-body"><p style="font-size:13px">' + esc(DB.HAZARD_REFERENCE[hz]) + '</p>' +
          '<p class="meta" style="margin-top:6px">District ratings via ThinkHazard!, pinned per screening.</p></div></div>' +
      '</div>' +
      '<div class="section-title" style="margin-top:8px">By sub-sector</div><div class="grid cols-4" style="margin-bottom:8px">' + bySub + '</div>' +
      groups +
      '<div class="section-title">Districts at High intensity <span class="tag-soft">' + highDistricts.length + '</span></div>' +
      '<div class="tile-grid">' + highDistricts.map(Comp.districtTile).join('') + '</div>';

    return UI.page('library', [{ label: 'Home', href: '#/dashboard' }, { label: 'Measures Library', href: '#/library' }, { label: hz }], body);
  };
})(window);
