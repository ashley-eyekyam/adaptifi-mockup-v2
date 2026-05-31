/* ============================================================================
   AdaptFi — pages: projects list (03) and project detail (04).
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI, Comp = global.Comp, App = global.App;
  const esc = UI.esc;
  const Pages = global.Pages = global.Pages || {};

  /* ----- 03 Projects list ------------------------------------------------ */
  Pages.projects = function () {
    const f = App.filters.projects;
    const states = uniq(DB.SCREENINGS.map(function (s) { const d = DB.district(s.district_id); return d ? d.state : ''; })).sort();

    let rows = DB.SCREENINGS.filter(function (s) {
      if (f.subSector && s.sub_sector !== f.subSector) return false;
      if (f.eligibility && s.eligibility !== f.eligibility) return false;
      if (f.status && s.status !== f.status) return false;
      if (f.state) { const d = DB.district(s.district_id); if (!d || d.state !== f.state) return false; }
      return true;
    });

    const applied = [];
    if (f.subSector) applied.push(['subSector', 'Sub-sector: ' + f.subSector]);
    if (f.state) applied.push(['state', 'State: ' + f.state]);
    if (f.eligibility) applied.push(['eligibility', f.eligibility]);
    if (f.status) applied.push(['status', f.status]);

    const tbody = rows.map(function (s) {
      const d = DB.district(s.district_id);
      const search = (s.name + ' ' + s.screening_id + ' ' + s.project_id + ' ' + s.bank + ' ' + s.author).toLowerCase();
      return '<tr class="rowlink" data-href="#/projects/' + s.project_id + '" data-search="' + esc(search) + '">' +
        '<td><input type="checkbox" onclick="event.stopPropagation()"></td>' +
        '<td class="mono meta nowrap">' + esc(s.project_id) + '</td>' +
        '<td><div class="pname">' + esc(s.name) + '</div><div class="psub">' + esc(s.bank) + '</div></td>' +
        '<td class="nowrap">' + esc(s.sub_sector) + '</td>' +
        '<td><div>' + esc(d ? d.name : '—') + '</div><div class="psub">' + esc(d ? d.state : '') + '</div></td>' +
        '<td>' + UI.typologyChip(s.typology) + '</td>' +
        '<td>' + UI.eligibilityChip(s.eligibility) + '</td>' +
        '<td>' + UI.dnshChip(s.dnsh) + '</td>' +
        '<td>' + UI.statusChip(s.status) + '</td>' +
        '<td class="meta nowrap">' + esc(s.created_at) + '</td>' +
        '<td class="meta">' + esc(s.author) + '</td>' +
        '<td><span class="kebab" onclick="event.stopPropagation()">⋯</span></td></tr>';
    }).join('');

    const sel = function (id, label, val, opts) {
      return '<select class="select" data-filter="' + id + '" style="min-width:150px"><option value="">' + label + '</option>' +
        opts.map(function (o) { return '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') +
        '</select>';
    };

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Projects workspace</div>' +
        '<h1>Screenings</h1><p class="sub">Your organisation&rsquo;s full screening history, filterable and searchable.</p></div>' +
        '<div class="head-actions">' +
          '<button class="btn" id="importBtn">' + UI.icon('upload') + ' Import CSV</button>' +
          '<button class="btn" id="exportBtn">' + UI.icon('download') + ' Export</button>' +
          '<a class="btn btn-primary" href="#/new">' + UI.icon('plus') + ' New screening</a>' +
        '</div></div>' +
      '<div class="card pad" style="margin-bottom:18px"><div class="row wrapf" style="gap:12px">' +
        '<div class="input-search" style="flex:1;min-width:240px"><span class="si">' + UI.icon('search') + '</span>' +
          '<input class="input" id="projSearch" placeholder="Search project, ID, bank or author…" value="' + esc(f.q) + '"></div>' +
        sel('subSector', 'All sub-sectors', f.subSector, DB.SUBSECTORS) +
        sel('state', 'All states', f.state, states) +
        sel('eligibility', 'All eligibility', f.eligibility, ['Eligible', 'Not Eligible']) +
        sel('status', 'All status', f.status, ['Draft', 'Review', 'Completed']) +
      '</div>' +
      (applied.length ? '<div class="applied-chips" style="margin-top:14px"><span class="meta">Filters:</span>' +
        applied.map(function (a) { return '<span class="applied-chip">' + esc(a[1]) + '<button data-clear="' + a[0] + '">×</button></span>'; }).join('') +
        '<button class="btn btn-sm btn-ghost" data-clear="all">Clear all</button></div>' : '') +
      '</div>' +
      '<div class="card"><table class="tbl rowlink"><thead><tr>' +
        '<th></th><th>ID</th><th>Project</th><th>Sub-sector</th><th>District</th><th>Typology</th>' +
        '<th>Eligibility</th><th>DNSH</th><th>Status</th><th>Last run</th><th>Author</th><th></th>' +
        '</tr></thead><tbody id="projBody">' + tbody + '</tbody></table>' +
      '<div class="card-foot between"><span id="projCount">' + rows.length + ' screenings</span>' +
        '<span class="mono meta">Methodology cre@1.0 · snapshot thinkhazard@2026-03-18</span></div>' +
      '</div>';

    return { html: UI.page('projects', [{ label: 'Home', href: '#/dashboard' }, { label: 'Projects' }], body), onMount: function (root) {
      const search = root.querySelector('#projSearch');
      search.addEventListener('input', function () {
        const q = search.value.toLowerCase();
        f.q = search.value;
        let n = 0;
        root.querySelectorAll('#projBody tr').forEach(function (tr) {
          const hit = !q || (tr.getAttribute('data-search') || '').indexOf(q) !== -1;
          tr.style.display = hit ? '' : 'none'; if (hit) n++;
        });
        root.querySelector('#projCount').textContent = n + ' screenings';
      });
      root.querySelectorAll('[data-filter]').forEach(function (s) {
        s.addEventListener('change', function () { f[s.getAttribute('data-filter')] = s.value; global.Router.refresh(); });
      });
      root.querySelectorAll('[data-clear]').forEach(function (b) {
        b.addEventListener('click', function () {
          const k = b.getAttribute('data-clear');
          if (k === 'all') { f.subSector = f.state = f.eligibility = f.status = ''; }
          else f[k] = '';
          global.Router.refresh();
        });
      });
      root.querySelector('#exportBtn').addEventListener('click', function () { UI.toast('Exported ' + rows.length + ' screenings to CSV', 'ok'); });
      root.querySelector('#importBtn').addEventListener('click', function () { UI.toast('CSV import — choose a file (prototype)'); });
    }};
  };

  /* ----- 04 Project detail ----------------------------------------------- */
  Pages.projectDetail = function (p) {
    const s = DB.SCREENINGS.find(function (x) { return x.project_id === p.id || x.screening_id === p.id; });
    if (!s) return Pages.notFound('projects/' + p.id);
    const dist = DB.district(s.district_id);
    const profile = dist.hazards;
    const isEligible = s.eligibility === 'Eligible';

    const idStrip = '<div class="statusstrip" style="margin-bottom:18px"><div>' +
      '<div class="sid mono">' + esc(s.screening_id) + '</div>' +
      '<h2>' + esc(s.name) + '</h2>' +
      '<div class="identity">' + esc(s.bank) + ' · ' + esc(s.sub_sector) + ' · ' + esc(dist.name) + ', ' + esc(dist.state) +
        ' · screened ' + esc(s.committed_at || s.created_at) + ' · <span class="mono">' + esc(s.methodology_version) + '</span></div></div>' +
      '<div class="topbar-spacer" style="flex:1"></div>' +
      '<div class="chips">' + UI.eligibilityChip(s.eligibility) + UI.dnshChip(s.dnsh) + UI.statusChip(s.status) + '</div></div>';

    const actionRail = '<div class="row wrapf" style="gap:10px;margin-bottom:18px">' +
      '<a class="btn" href="#/admin/versions">' + UI.icon('refresh') + ' Re-run under newer version</a>' +
      '<button class="btn" data-toast="PDF downloaded">' + UI.icon('download') + ' Download PDF</button>' +
      '<button class="btn" data-toast="JSON exported">' + UI.icon('external') + ' Export JSON</button>' +
      '<a class="btn btn-primary" href="#/screenings/' + s.screening_id + '/output">' + UI.icon('doc') + ' View output preview</a>' +
      '</div>';

    const tabbar = '<div class="tabs" id="pdTabs">' +
      ['Summary', 'Climate risk', 'Measures', 'Eligibility', 'DNSH', 'Audit trail'].map(function (t, i) {
        return '<a class="tab ' + (i === 0 ? 'active' : '') + '" data-tab="t' + i + '">' + t +
          (t === 'Measures' ? '<span class="badge">' + s.applied.length + '</span>' : '') +
          (t === 'DNSH' && s.dnsh === 'Flagged' ? '<span class="badge" style="background:var(--bad-wash);color:var(--bad)">!</span>' : '') +
          '</a>';
      }).join('') + '</div>';

    // Summary tab
    const overview = '<div class="card"><div class="card-head"><h3>Project overview</h3></div><div class="card-body">' +
      '<dl class="kv"><dt>Sector</dt><dd>Commercial Real Estate</dd>' +
      '<dt>Sub-sector</dt><dd>' + esc(s.sub_sector) + '</dd>' +
      '<dt>Typology</dt><dd>' + UI.typologyChip(s.typology) + ' ' + esc(DB.TYPOLOGY_SHORT[s.typology]) + '</dd>' +
      '<dt>Location</dt><dd>' + esc(dist.name) + ', ' + esc(dist.state) + '</dd>' +
      '<dt>Objective</dt><dd>' + esc(s.objective) + '</dd>' +
      '<dt>Ecosystem</dt><dd>' + esc(s.ecosystem) + '</dd></dl></div></div>';

    const hazardCard = '<div class="card"><div class="card-head"><h3>Climate hazard profile</h3>' +
      '<span class="meta mono">' + esc(s.hazard_snapshot) + '</span></div><div class="card-body">' +
      Comp.hazardProfileGrid(profile) + '</div></div>';

    const measuresCard = '<div class="card"><div class="card-head"><div><h3>Measures applied</h3>' +
      '<div class="sub">' + s.applied.length + ' applied · ' + s.deferred.length + ' deferred · ' + s.na.length + ' n/a · of ' + s.recommended.length + ' recommended</div></div></div>' +
      Comp.measuresApplied(s, 7) +
      '</div>';

    const stepStats = '<div class="grid cols-3" style="margin-bottom:14px">' +
      stepStat('Step 1 — Context', isEligible) + stepStat('Step 2 — Intent', isEligible) +
      stepStat('Step 3 — Adequacy', isEligible) + '</div>';
    const determination = isEligible
      ? '<div class="banner ok"><div class="bicon">' + UI.icon('check') + '</div><div><div class="bt">Eligible under IDFC-MDB Principles</div>' +
        '<div class="bs">Classification: ' + esc(s.typology) + ' — ' + esc(DB.TYPOLOGY_SHORT[s.typology]) + '</div></div></div>'
      : '<div class="banner bad"><div class="bicon">✕</div><div><div class="bt">Not Eligible under IDFC-MDB Principles</div>' +
        '<div class="bs">One or more steps did not pass — see the Eligibility tab.</div></div></div>';
    const eligCard = '<div class="card"><div class="card-head"><h3>Eligibility determination</h3></div><div class="card-body">' + stepStats + determination + '</div></div>';

    const summaryTab = '<div class="layout-rail"><div class="stack">' + overview + hazardCard + measuresCard + eligCard + '</div>' +
      '<div class="stack">' + rightRail(s, dist) + '</div></div>';

    // other tabs
    const climateTab = '<div class="card"><div class="card-head"><h3>Climate risk screening</h3><span class="meta mono">' + esc(s.hazard_snapshot) + '</span></div>' +
      '<div class="card-body">' + Comp.hazardProfileGrid(profile, { desc: true }) +
      '<div class="section-title">Narrative assessment</div>' +
      narr('Sector / sub-sector exposure and vulnerability', s.sub_sector + ' assets in this region face elevated exposure to ' + topHazards(profile) + '. Sub-sector-specific vulnerabilities centre on service continuity and envelope performance.') +
      narr('Location developmental context', dist.name + ' (' + dist.classification + ', seismic zone ' + dist.seismic_zone + ', ' + dist.climate_zone + ' climate) with a population of ~' + dist.population + '.') +
      narr('Location exposure and vulnerability', 'District-level ratings indicate ' + topHazards(profile) + ' as the binding hazards for siting and design.') +
      narr('Environment, social & economic impacts', s.ecosystem) +
      '</div></div>';

    const measuresTab = measuresFullTab(s);
    const eligibilityTab = eligibilityFullTab(s, isEligible);
    const dnshTab = dnshFullTab(s);
    const auditTab = '<div class="card"><div class="card-head"><h3>Audit trail</h3><span class="meta">Append-only</span></div>' +
      '<table class="tbl"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead><tbody>' +
      DB.AUDIT.map(function (a) { return '<tr><td class="meta nowrap mono">' + esc(a.at) + '</td><td>' + esc(a.actor) +
        '</td><td><span class="chip neutral mono" style="font-size:10px">' + esc(a.action) + '</span></td><td class="meta">' + esc(a.detail) + '</td></tr>'; }).join('') +
      '</tbody></table></div>';

    const panels = '<div data-panel="t0">' + summaryTab + '</div>' +
      '<div data-panel="t1" hidden>' + climateTab + '</div>' +
      '<div data-panel="t2" hidden>' + measuresTab + '</div>' +
      '<div data-panel="t3" hidden>' + eligibilityTab + '</div>' +
      '<div data-panel="t4" hidden>' + dnshTab + '</div>' +
      '<div data-panel="t5" hidden>' + auditTab + '</div>';

    const body = idStrip + actionRail + tabbar + panels;

    return { html: UI.page('projects', [{ label: 'Home', href: '#/dashboard' }, { label: 'Projects', href: '#/projects' }, { label: s.name }], body),
      onMount: function (root) {
        root.querySelectorAll('#pdTabs .tab').forEach(function (tab) {
          tab.addEventListener('click', function () {
            root.querySelectorAll('#pdTabs .tab').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            const id = tab.getAttribute('data-tab');
            root.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== id; });
            global.scrollTo(0, 0);
          });
        });
      }};
  };

  function rightRail(s, dist) {
    return '<div class="card"><div class="card-head"><h3>Methodology version</h3></div><div class="card-body">' +
        '<div class="deflist">' + Comp.di('Pinned version', '<span class="mono">' + esc(s.methodology_version) + '</span>') +
        Comp.di('Status', '<span class="chip ok">Live</span>') + Comp.di('Measures', '111') + '</div>' +
        '<a class="btn btn-sm btn-block" style="margin-top:14px" href="#/admin/versions">' + UI.icon('refresh') + ' Re-run under newer version</a></div></div>' +
      '<div class="card"><div class="card-head"><h3>Reproducibility</h3></div><div class="card-body">' + Comp.reproBlock(s) +
        '<div class="alert ok" style="margin-top:14px;font-size:12px"><span class="ai">' + UI.icon('check') + '</span>' +
        '<div>This screening can be regenerated bit-identically, pinned to the version and snapshot above.</div></div></div></div>' +
      '<div class="card"><div class="card-head"><h3>Activity</h3></div><div class="card-body"><div class="stack" style="gap:12px">' +
        DB.AUDIT.slice(0, 4).map(function (a) { return '<div style="font-size:12px"><div class="strong">' + esc(a.action) + '</div>' +
          '<div class="meta">' + esc(a.actor) + ' · ' + esc(a.at) + '</div></div>'; }).join('') +
        '</div></div></div>';
  }
  function stepStat(label, ok) {
    return '<div class="card" style="padding:14px;text-align:center;border-top:3px solid ' + (ok ? 'var(--ok)' : 'var(--bad)') + '">' +
      '<div class="meta">' + esc(label) + '</div><div class="h3" style="margin-top:6px;color:' + (ok ? 'var(--ok)' : 'var(--bad)') + '">' +
      (ok ? 'Pass' : 'Fail') + '</div></div>';
  }
  function narr(label, text) {
    return '<div style="margin-bottom:14px"><div class="strong" style="font-size:12.5px;margin-bottom:5px">' + esc(label) + '</div>' +
      '<div class="quote-narrative">' + esc(text) + '</div></div>';
  }
  function topHazards(profile) {
    const highs = DB.HAZARDS.filter(function (h) { return profile[h] === 'High'; });
    if (!highs.length) return 'moderate multi-hazard conditions';
    return highs.slice(0, 3).join(', ');
  }
  function measuresFullTab(s) {
    function group(title, ids, cls) {
      if (!ids.length) return '';
      return '<div class="section-title">' + title + ' <span class="tag-soft">' + ids.length + '</span></div>' +
        '<div class="stack" style="gap:10px">' + ids.map(function (id) {
          const m = DB.measure(id); if (!m) return '';
          return '<div class="measure-row ' + cls + '"><div><div class="mtop" style="margin-bottom:6px">' + UI.hazardChip(m.hazard) + UI.loeChip(m.loe) +
            '<span class="mid mono">' + esc(m.id) + '</span></div><div class="mtext">' + esc(m.text) + '</div></div>' +
            '<div class="ctrls"><span class="chip ' + (cls === 'applied' ? 'ok' : cls === 'deferred' ? 'warn' : 'neutral') + '">' +
            (cls === 'applied' ? 'Applied' : cls === 'deferred' ? 'Deferred' : 'Not applicable') + '</span></div></div>';
        }).join('') + '</div>';
    }
    return '<div class="card pad">' +
      '<div class="grid cols-4 reveal" style="margin-bottom:8px">' +
        UI.stat('Recommended', s.recommended.length, '') + UI.stat('Applied', s.applied.length, '', 'ok') +
        UI.stat('Deferred', s.deferred.length, '', 'warn') + UI.stat('Not applicable', s.na.length, '') +
      '</div>' + group('Applied', s.applied, 'applied') + group('Deferred', s.deferred, 'deferred') + group('Not applicable', s.na, 'na') +
      '</div>';
  }
  function eligibilityFullTab(s, isEligible) {
    const steps = [DB.ELIGIBILITY.step1, DB.ELIGIBILITY.step2, DB.ELIGIBILITY.step3];
    const stepPass = [true, true, isEligible];
    const cards = steps.map(function (st, i) {
      const pass = stepPass[i];
      const qs = st.questions.map(function (q, j) {
        let ans = 'Yes';
        if (i === 2 && j === 1) ans = isEligible ? 'No' : 'Yes';
        if (i === 2 && j === 2) ans = isEligible ? '—' : 'No';
        if (!pass && i === 2 && j === 0) ans = 'No';
        const chip = ans === 'Yes' ? '<span class="chip ok">Yes</span>' : ans === 'No' ? '<span class="chip bad">No</span>' : '<span class="chip neutral">N/A</span>';
        return '<div class="row between" style="padding:9px 0;border-bottom:1px dashed var(--n-200)"><span style="font-size:12.5px;max-width:78%">' + esc(q) + '</span>' + chip + '</div>';
      }).join('');
      return '<div class="card" style="margin-bottom:14px"><div class="card-head"><h3 style="font-size:13.5px">' + esc(st.title) + '</h3>' +
        (pass ? '<span class="chip ok">Pass</span>' : '<span class="chip bad">Fail</span>') + '</div><div class="card-body">' + qs +
        '<div class="alert ' + (pass ? 'ok' : 'bad') + '" style="margin-top:12px;font-size:12px"><span class="ai">' + UI.icon(pass ? 'check' : 'info') + '</span>' +
        '<div><strong>' + esc(st.rollup) + '</strong> — ' + (pass ? 'Yes' : 'No') + '</div></div></div></div>';
    }).join('');
    const banner = isEligible
      ? '<div class="banner ok"><div class="bicon">' + UI.icon('check') + '</div><div><div class="bt">Project is Eligible under IDFC-MDB Principles</div>' +
        '<div class="bs">Classification: ' + esc(s.typology) + '</div></div></div>'
      : '<div class="banner bad"><div class="bicon">✕</div><div><div class="bt">Project is Not Eligible under IDFC-MDB Principles</div>' +
        '<div class="bs">Step 3 (adequacy of interventions) did not pass.</div></div></div>';
    return '<div class="layout-rail"><div>' + cards + '</div><div>' + banner + '</div></div>';
  }
  function dnshFullTab(s) {
    const flagged = s.dnsh === 'Flagged';
    const rows = DB.DNSH_QUESTIONS.map(function (q) {
      let resp = q.harm ? 'No' : 'Yes';
      if (flagged && q.n === 7 && q.harm) resp = 'Yes';
      const desired = q.harm ? (resp === 'No') : (resp === 'Yes');
      const chip = resp === 'Yes' ? '<span class="chip ' + (desired ? 'ok' : 'bad') + '">Yes</span>'
        : resp === 'No' ? '<span class="chip ' + (desired ? 'ok' : 'bad') + '">No</span>' : '<span class="chip neutral">N/A</span>';
      return '<tr' + (!desired ? ' style="background:var(--bad-wash)"' : '') + '><td class="num strong">' + q.n + '</td><td>' + esc(q.text) + '</td>' +
        '<td>' + chip + '</td><td class="meta">' + esc(desired ? 'In the desired direction.' : 'Harm-risk flagged — reviewer sign-off required.') + '</td></tr>';
    }).join('');
    return '<div class="card">' +
      '<div class="card-head"><div><h3>DNSH &amp; Maladaptation safeguards</h3>' +
        '<div class="sub">7 questions · Yes / No / NA with justification</div></div>' + UI.dnshChip(s.dnsh) + '</div>' +
      (flagged ? '<div style="padding:16px 20px 0"><div class="alert bad"><span class="ai">' + UI.icon('flag') + '</span>' +
        '<div><strong>Flagged.</strong> A harm-risk question was answered Yes — this screening requires explicit reviewer sign-off before it can be marked Completed.</div></div></div>' : '') +
      '<table class="tbl"><thead><tr><th>#</th><th>Question</th><th>Response</th><th>Assessment</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function uniq(a) { const o = {}; const r = []; a.forEach(function (x) { if (x && !o[x]) { o[x] = 1; r.push(x); } }); return r; }
})(window);
