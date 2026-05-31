/* ============================================================================
   AdaptFi — pages: Admin home (18), Methodology editor (19),
   Hazard Dataset Manager (20), Version & release (21),
   Users & organisations (22), Usage analytics (23).
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI, Comp = global.Comp;
  const esc = UI.esc;
  const Pages = global.Pages = global.Pages || {};
  Pages._admView = Pages._admView || { subSector: '', hazard: '', selected: '' };

  function adminCrumbs(last) { return [{ label: 'Home', href: '#/dashboard' }, { label: 'Admin', href: '#/admin' }, { label: last }]; }

  /* ----- 18 Admin home --------------------------------------------------- */
  Pages.adminHome = function () {
    function tool(num, ic, title, desc, stat, href) {
      return '<a class="cat-card" href="' + href + '"><span class="num">' + UI.icon(ic) + '</span>' +
        '<span style="flex:1"><span class="ct">' + esc(title) + '</span><span class="cd">' + esc(desc) + '</span>' +
        '<span class="tag-soft" style="margin-top:8px;display:inline-block">' + esc(stat) + '</span></span></a>';
    }
    const content = '<div class="cat-cards">' +
      tool('19', 'edit', 'Methodology editor', 'Add, edit and retire measures', '111 measures · cre@1.0', '#/admin/methodology') +
      tool('20', 'map', 'Hazard Dataset Manager', 'Curate district hazard intensities', DB.DISTRICTS.length + ' districts · 3 changes', '#/admin/hazards') +
      tool('21', 'spark', 'Version & release', 'Publish methodology versions', 'cre@1.1-draft pending', '#/admin/versions') +
      tool('eq', 'doc', 'Eligibility & DNSH framework', 'Edit the questionnaire text', '3-step + 7 DNSH', '#/admin/versions') +
      '</div>';
    const ops = '<div class="cat-cards">' +
      tool('22', 'user', 'Users & organisations', 'Provision access', DB.ORGS.length + ' orgs · ' + DB.USERS.length + ' users', '#/admin/users') +
      tool('23', 'projects', 'Usage analytics', 'De-identified telemetry', DB.ANALYTICS.screenings_30d + ' in 30 days', '#/admin/analytics') +
      tool('in', 'external', 'Integrations', 'API keys & webhooks', 'REST v1 · 4 events', '#/settings') +
      tool('au', 'admin', 'Audit & compliance', 'Append-only audit log', 'Exportable', '#/admin/analytics') +
      '</div>';

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Administration console</div>' +
        '<h1>Governance toolkit</h1><p class="sub">Curate the methodology, hazard data, access and telemetry — without engineering involvement.</p></div>' +
        '<span class="chip info" style="align-self:center">' + UI.icon('admin') + ' Administrator</span></div>' +
      '<div class="cat-group"><h3>Content management</h3>' + content + '</div>' +
      '<div class="cat-group"><h3>Platform operations</h3>' + ops + '</div>';
    return UI.page('admin', [{ label: 'Home', href: '#/dashboard' }, { label: 'Admin' }], body);
  };

  /* ----- 19 Methodology editor ------------------------------------------ */
  Pages.methodology = function () {
    const v = Pages._admView;
    const changeMap = {}; DB.DRAFT_VERSION.changes.forEach(function (c) { changeMap[c.measure_id] = c.type; });

    let list = DB.MEASURES.filter(function (m) {
      if (v.subSector && m.sub_sector !== v.subSector) return false;
      if (v.hazard && m.hazard !== v.hazard) return false;
      return true;
    });
    // include 'added' draft rows that match the filter
    const addedRows = DB.DRAFT_VERSION.changes.filter(function (c) { return c.type === 'added'; }).map(function (c) {
      return { id: c.measure_id, sub_sector: c.sub_sector, hazard: '—', loe: 'Medium', theme: DB.THEMES[0], text: c.detail, _added: true };
    }).filter(function (m) { return (!v.subSector || m.sub_sector === v.subSector); });

    const all = addedRows.concat(list);
    const rows = all.map(function (m) {
      const ch = m._added ? 'added' : (changeMap[m.id] || '');
      const rowcls = ch === 'added' ? 'row-added' : ch === 'edited' ? 'row-edited' : ch === 'retired' ? 'row-retired' : '';
      const badge = ch ? '<span class="chip ' + (ch === 'added' ? 'ok' : ch === 'edited' ? 'warn' : 'bad') + '" style="font-size:9.5px">' + ch + '</span>' : '';
      return '<tr class="rowlink ' + rowcls + '" data-mid="' + esc(m.id) + '"><td class="mono meta">' + esc(m.id) + '</td>' +
        '<td>' + esc(m.text.slice(0, 90)) + (m.text.length > 90 ? '…' : '') + '</td>' +
        '<td class="nowrap">' + esc(m.sub_sector) + '</td><td>' + (m.hazard !== '—' ? UI.hazardChip(m.hazard, true) : '—') + '</td>' +
        '<td>' + UI.loeChip(m.loe) + '</td><td>' + badge + '</td></tr>';
    }).join('');

    const sel = function (id, label, val, opts) {
      return '<select class="select" data-af="' + id + '" style="min-width:160px"><option value="">' + label + '</option>' +
        opts.map(function (o) { return '<option' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    };

    const selM = v.selected ? DB.measure(v.selected) : null;
    const editPanel = selM ? '<div class="card"><div class="card-head"><h3>Edit measure</h3><span class="mono meta">' + esc(selM.id) + '</span></div><div class="card-body">' +
        '<div class="field"><label>Measure text <span class="req">*</span></label><textarea class="textarea" style="min-height:110px">' + esc(selM.text) + '</textarea></div>' +
        '<div class="grid cols-2">' +
          field('Level of Effort', selectInline(DB.LOE, selM.loe)) +
          field('Investment theme', selectInline(DB.THEMES, selM.theme)) + '</div>' +
        '<div class="field"><label>Edit note <span class="req">*</span> <span class="hint">(for the audit trail)</span></label><input class="input" placeholder="Why are you changing this measure?"></div>' +
        '<div class="field"><label>DNSH notes</label><textarea class="textarea">' + esc(selM.dnsh_notes) + '</textarea></div>' +
        '<div class="row" style="gap:8px;margin-top:6px"><button class="btn btn-primary" data-toast="Draft change saved to cre@1.1-draft">Save to draft</button>' +
          '<button class="btn btn-danger" data-toast="Measure marked for retirement">Retire</button></div>' +
      '</div></div>'
      : '<div class="card pad"><div class="empty"><div class="ei">' + UI.icon('edit') + '</div>Select a measure row to edit.<br><span class="meta">Edits collect in the draft version until published.</span></div></div>';

    const body =
      '<div class="statusstrip" style="margin-bottom:18px"><div><div class="sid">Active draft</div><h2 class="mono" style="font-size:18px">' + esc(DB.DRAFT_VERSION.id) + '</h2>' +
        '<div class="identity">' + DB.DRAFT_VERSION.edited + ' edited · ' + DB.DRAFT_VERSION.added + ' added · ' + DB.DRAFT_VERSION.retired + ' retired</div></div>' +
        '<div class="topbar-spacer" style="flex:1"></div>' +
        '<div class="row" style="gap:8px"><button class="btn" data-toast="Diff preview opened">' + UI.icon('doc') + ' Preview diff</button>' +
          '<a class="btn btn-primary" href="#/admin/versions">' + UI.icon('spark') + ' Publish draft</a></div></div>' +
      '<div class="grid cols-4 reveal" style="margin-bottom:18px">' +
        UI.stat('Total measures', DB.counts.total, '') + UI.stat('Edited', DB.DRAFT_VERSION.edited, '', 'warn') +
        UI.stat('Added', DB.DRAFT_VERSION.added, '', 'ok') + UI.stat('Retired', DB.DRAFT_VERSION.retired, '', 'bad') + '</div>' +
      '<div class="card pad" style="margin-bottom:16px"><div class="row wrapf between" style="gap:12px">' +
        '<div class="row wrapf" style="gap:10px">' + sel('subSector', 'All sub-sectors', v.subSector, DB.SUBSECTORS) + sel('hazard', 'All hazards', v.hazard, DB.HAZARDS) + '</div>' +
        '<div class="row" style="gap:8px"><button class="btn btn-sm" data-toast="New measure form opened">' + UI.icon('plus') + ' New measure</button>' +
          '<button class="btn btn-sm" data-toast="Bulk XLSX upload (prototype)">' + UI.icon('upload') + ' Bulk upload</button>' +
          '<button class="btn btn-sm" data-toast="Measures exported">' + UI.icon('download') + ' Export</button></div></div></div>' +
      '<div class="layout-rail"><div class="card"><table class="tbl rowlink compact"><thead><tr><th>ID</th><th>Measure</th><th>Sub-sector</th><th>Hazard</th><th>LoE</th><th>Change</th></tr></thead>' +
        '<tbody id="methBody">' + rows + '</tbody></table></div>' +
        '<div class="stack">' + editPanel + '</div></div>';

    return { html: UI.page('admin', adminCrumbs('Methodology editor'), body),
      onMount: function (root) {
        root.querySelectorAll('[data-af]').forEach(function (s) { s.addEventListener('change', function () { v[s.getAttribute('data-af')] = s.value; global.Router.refresh(); }); });
        root.querySelectorAll('#methBody tr').forEach(function (tr) {
          tr.addEventListener('click', function () { v.selected = tr.getAttribute('data-mid'); global.Router.refresh(); });
        });
      }};
  };
  function field(label, inner) { return '<div class="field"><label>' + esc(label) + '</label>' + inner + '</div>'; }
  function selectInline(opts, val) { return '<select class="select">' + opts.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>'; }

  /* ----- 20 Hazard Dataset Manager -------------------------------------- */
  Pages.hazards = function () {
    const banner = '<div class="alert info" style="margin-bottom:18px"><span class="ai">' + UI.icon('refresh') + '</span><div>' +
      '<div class="at">ThinkHazard! auto-sync</div>Last sync ' + esc(DB.SNAPSHOT.snapshotted_at) + ' · next scheduled ' + esc(DB.SNAPSHOT.next_sync) +
      ' · <strong>' + DB.SNAPSHOT.changes_since + ' changes</strong> since the last published snapshot. ' +
      '<a href="#" data-toast="Diff opened — 3 district-hazard changes">Review changes →</a></div></div>';

    const head = DB.HAZARDS.map(function (h) { return '<th title="' + esc(h) + '">' + DB.HAZARD_CODE[h] + '</th>'; }).join('');
    const rows = DB.DISTRICTS.map(function (d) {
      const cells = DB.HAZARDS.map(function (h) { return '<td>' + UI.intensityPillSm(d.hazards[h]) + '</td>'; }).join('');
      const overridden = d.id === 'IND-27-MUM-0001';
      return '<tr><td class="strong nowrap">' + esc(d.name) + '</td><td class="meta">' + esc(d.state) + '</td>' + cells +
        '<td class="meta nowrap">' + (overridden ? '<span class="chip warn" style="font-size:9.5px">override</span>' : 'ThinkHazard ' + esc(DB.SNAPSHOT.snapshotted_at)) + '</td>' +
        '<td><button class="btn btn-sm" data-toast="Override form for ' + esc(d.name) + '">' + UI.icon('edit') + '</button></td></tr>';
    }).join('');

    const overrideForm = '<div class="card"><div class="card-head"><h3>Override a cell</h3></div><div class="card-body">' +
      field('District', selectInline(DB.DISTRICTS.map(function (d) { return d.name; }), 'Mumbai')) +
      field('Hazard', selectInline(DB.HAZARDS, 'Storm/Cyclone')) +
      '<div class="grid cols-2">' + field('Source rating', '<input class="input" value="Medium" disabled>') + field('Override to', selectInline(DB.INTENSITIES, 'High')) + '</div>' +
      '<div class="field"><label>Justification <span class="req">*</span></label><textarea class="textarea" placeholder="Document the evidence for this override…">Local IMD cyclone track data indicates higher exposure than the aggregate district rating.</textarea></div>' +
      '<button class="btn btn-primary btn-block" data-toast="Override saved to draft snapshot">Save to draft snapshot</button>' +
      '<p class="meta" style="margin-top:10px">The source rating is always retained alongside the override.</p></div></div>';

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Administration · hazard data</div>' +
        '<h1>Hazard Dataset Manager</h1><p class="sub">District-level hazard intensities with auto-sync plus documented manual overrides.</p></div>' +
        '<div class="head-actions"><button class="btn" data-toast="Sync triggered">' + UI.icon('refresh') + ' Trigger sync</button>' +
          '<button class="btn" data-toast="Snapshot saved & published">' + UI.icon('check') + ' Publish snapshot</button></div></div>' +
      banner +
      '<div class="layout-rail"><div class="card"><div class="card-head"><h3>District ratings</h3><span class="meta">' + DB.DISTRICTS.length + ' of ~720 districts</span></div>' +
        '<div style="overflow-x:auto"><table class="tbl compact"><thead><tr><th>District</th><th>State</th>' + head + '<th>Last update</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
        '<div>' + overrideForm + '</div></div>';
    return UI.page('admin', adminCrumbs('Hazard Dataset Manager'), body);
  };

  /* ----- 21 Version & release ------------------------------------------- */
  Pages.versions = function () {
    const diffRows = DB.DRAFT_VERSION.changes.map(function (c) {
      const cls = c.type === 'added' ? 'ok' : c.type === 'edited' ? 'warn' : 'bad';
      return '<tr><td><span class="chip ' + cls + '" style="font-size:9.5px">' + c.type + '</span></td><td class="mono meta">' + esc(c.measure_id) + '</td>' +
        '<td>' + esc(c.sub_sector) + '</td><td class="meta">' + esc(c.detail) + '</td></tr>';
    }).join('');

    // impact: screenings that used a changed measure
    const changedIds = DB.DRAFT_VERSION.changes.map(function (c) { return c.measure_id; });
    const impacted = DB.SCREENINGS.filter(function (s) {
      return s.applied.concat(s.recommended).some(function (id) { return changedIds.indexOf(id) !== -1; });
    }).slice(0, 6);
    const impactRows = (impacted.length ? impacted : DB.SCREENINGS.slice(0, 4)).map(function (s, i) {
      const benign = i % 2 === 1;
      return '<tr><td class="mono meta">' + esc(s.screening_id) + '</td><td>' + esc(s.name) + '</td>' +
        '<td>' + (benign ? '<span class="chip neutral">No material change</span>' : '<span class="chip warn">Output would differ</span>') + '</td>' +
        '<td>' + (benign ? '<span class="meta">No action</span>' : '<button class="btn btn-sm" data-toast="Re-run queued for ' + esc(s.screening_id) + '">Queue re-run</button>') + '</td></tr>';
    }).join('');

    const checklist = ['Release notes filled', 'Diff reviewed', 'Effective date set', 'Approval co-sign', 'Email notification'].map(function (t, i) {
      const done = i < 3;
      return '<div class="row" style="gap:10px;padding:8px 0;border-bottom:1px dashed var(--n-200)"><span class="' + (done ? 'chip solid-ok' : 'chip neutral') + '" style="width:22px;height:22px;border-radius:50%;padding:0;justify-content:center">' +
        (done ? UI.icon('check') : (i + 1)) + '</span><span style="font-size:12.5px">' + esc(t) + '</span></div>';
    }).join('');

    const history = DB.VERSIONS.map(function (vv) {
      return '<div class="row between" style="padding:9px 0;border-bottom:1px dashed var(--n-200)"><div><span class="mono strong" style="font-size:12.5px">' + esc(vv.id) + '</span>' +
        '<div class="meta">' + esc(vv.published_at) + ' · ' + vv.measures + ' measures</div></div>' +
        '<span class="chip ' + (vv.status === 'live' ? 'ok' : 'neutral') + '">' + esc(vv.status) + '</span></div>';
    }).join('');

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Administration · versioning</div>' +
        '<h1>Version &amp; release</h1><p class="sub">Publish a new methodology version and manage its impact on existing screenings. Published versions are immutable.</p></div>' +
        '<div class="head-actions"><button class="btn" data-toast="Rolled back to cre@1.0">Roll back</button>' +
          '<button class="btn btn-primary" id="pubBtn">' + UI.icon('spark') + ' Publish cre@1.1</button></div></div>' +
      '<div class="layout-rail"><div class="stack">' +
        '<div class="card pad"><div class="grid cols-2">' +
          field('Release summary', '<input class="input" value="Critical-care cooling clarifications; new shading & flood-barrier measures.">') +
          field('Effective from', '<input class="input" type="date" value="2026-05-01">') + '</div></div>' +
        '<div class="card"><div class="card-head"><h3>Diff against live (cre@1.0)</h3><span class="tag-soft">' + DB.DRAFT_VERSION.changes.length + ' changes</span></div>' +
          '<table class="tbl compact"><thead><tr><th>Change</th><th>Measure</th><th>Sub-sector</th><th>Detail</th></tr></thead><tbody>' + diffRows + '</tbody></table></div>' +
        '<div class="card"><div class="card-head"><h3>Impact on existing screenings</h3></div>' +
          '<table class="tbl compact"><thead><tr><th>Screening</th><th>Project</th><th>Impact</th><th>Action</th></tr></thead><tbody>' + impactRows + '</tbody></table>' +
          '<div class="card-foot"><span class="meta">Re-runs are added alongside originals — originals are never overwritten.</span></div></div>' +
      '</div><div class="stack">' +
        '<div class="card"><div class="card-head"><h3>Publishing checklist</h3></div><div class="card-body">' + checklist +
          '<div class="alert warn" style="margin-top:14px;font-size:12px"><span class="ai">' + UI.icon('info') + '</span><div>Co-sign by a second Administrator is enforced on publish.</div></div></div></div>' +
        '<div class="card"><div class="card-head"><h3>Version history</h3></div><div class="card-body">' + history + '</div></div>' +
      '</div></div>';

    return { html: UI.page('admin', adminCrumbs('Version & release'), body),
      onMount: function (root) { root.querySelector('#pubBtn').addEventListener('click', function () {
        UI.modal({ title: 'Publish cre@1.1?', body: 'This freezes the draft as a new live version. Existing screenings stay pinned to their original version. A second-Administrator co-sign is required.', ok: 'Publish & request co-sign', onOk: function () { UI.toast('cre@1.1 queued for co-sign & publish', 'ok'); } });
      }); }};
  };

  /* ----- 22 Users & organisations --------------------------------------- */
  Pages.users = function () {
    const screeners = DB.USERS.filter(function (u) { return u.role === 'Screener'; }).length;
    const reviewers = DB.USERS.filter(function (u) { return u.role === 'Reviewer'; }).length;

    const orgRows = DB.ORGS.map(function (o) {
      return '<tr><td><div class="pname">' + esc(o.name) + '</div><div class="psub mono">' + esc(o.slug) + '</div></td>' +
        '<td class="meta">' + esc(o.type) + '</td><td class="num">' + o.users + '</td><td class="num">' + o.screenings + '</td>' +
        '<td><span class="chip ' + (o.plan === 'Enterprise' ? 'info' : 'neutral') + '">' + esc(o.plan) + '</span></td>' +
        '<td class="meta nowrap">' + esc(o.created) + '</td></tr>';
    }).join('');

    const userRows = DB.USERS.map(function (u) {
      const initials = u.name.split(' ').map(function (x) { return x[0]; }).join('').slice(0, 2);
      const roleCls = u.role === 'Administrator' ? 'info' : u.role === 'Reviewer' ? 'warn' : u.role === 'Observer' ? 'neutral' : 'ok';
      return '<tr><td><div class="userrow"><span class="ava">' + esc(initials) + '</span><div><div class="pname">' + esc(u.name) + '</div><div class="psub">' + esc(u.email) + '</div></div></div></td>' +
        '<td class="meta">' + esc(u.org) + '</td><td><span class="chip ' + roleCls + '">' + esc(u.role) + '</span></td>' +
        '<td class="meta nowrap">' + esc(u.last_active) + '</td><td class="num">' + u.screenings + '</td>' +
        '<td><span class="chip ' + (u.status === 'Active' ? 'ok' : 'warn') + '"><span class="dot"></span>' + esc(u.status) + '</span></td></tr>';
    }).join('');

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Administration · access</div>' +
        '<h1>Users &amp; organisations</h1><p class="sub">Organisations are the tenancy unit; screenings belong to an organisation, methodology is global.</p></div>' +
        '<div class="head-actions"><button class="btn" data-toast="Create organisation form">' + UI.icon('plus') + ' New organisation</button>' +
          '<button class="btn btn-primary" data-toast="Invite sent">' + UI.icon('user') + ' Invite user</button></div></div>' +
      '<div class="grid cols-4 reveal" style="margin-bottom:18px">' +
        UI.stat('Organisations', DB.ORGS.length, '', 'info') + UI.stat('Users', DB.USERS.length, '') +
        UI.stat('Screeners', screeners, '', 'ok') + UI.stat('Reviewers', reviewers, '', 'warn') + '</div>' +
      '<div class="card" style="margin-bottom:18px"><div class="card-head"><h3>Organisations</h3></div>' +
        '<table class="tbl"><thead><tr><th>Organisation</th><th>Type</th><th class="num">Users</th><th class="num">Screenings</th><th>Plan</th><th>Created</th></tr></thead><tbody>' + orgRows + '</tbody></table></div>' +
      '<div class="card"><div class="card-head"><h3>Recent users</h3></div>' +
        '<table class="tbl"><thead><tr><th>User</th><th>Organisation</th><th>Role</th><th>Last active</th><th class="num">Screenings</th><th>Status</th></tr></thead><tbody>' + userRows + '</tbody></table></div>';
    return UI.page('admin', adminCrumbs('Users & organisations'), body);
  };

  /* ----- 23 Usage analytics --------------------------------------------- */
  Pages.analytics = function () {
    const a = DB.ANALYTICS;
    const weekItems = a.per_week.map(function (v, i) { return { label: 'W' + (i + 1), value: v }; });

    const signalRows = a.override_signal.map(function (r) {
      const rate = Math.round(r.overridden / r.recommended * 100);
      return '<tr class="rowlink" data-href="#/admin/methodology"><td class="mono meta">' + esc(r.measure_id) + '</td>' +
        '<td class="num">' + r.recommended + '</td><td class="num">' + r.overridden + '</td>' +
        '<td><span class="chip ' + (rate > 20 ? 'warn' : 'neutral') + '">' + rate + '%</span></td>' +
        '<td class="meta">' + esc(r.reason) + '</td></tr>';
    }).join('');

    const topTiles = a.top_districts.map(function (t) {
      return '<a class="dtile" href="#/districts/' + t.id + '"><div class="row between"><span class="dn">' + esc(t.name) + '</span><span class="h3">' + t.count + '</span></div>' +
        '<div class="ds">screenings</div></a>';
    }).join('');

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Administration · telemetry</div>' +
        '<h1>Usage analytics</h1><p class="sub">De-identified aggregate telemetry that feeds methodology evolution.</p></div>' +
        '<button class="btn" data-toast="Analytics exported">' + UI.icon('download') + ' Export</button></div>' +
      '<div class="grid cols-4 reveal" style="margin-bottom:22px">' +
        UI.stat('Screenings (30d)', a.screenings_30d, '<span class="d up">' + UI.icon('check') + ' +18% MoM</span>') +
        UI.stat('Districts queried', a.districts_queried, '', 'info') +
        UI.stat('Avg time-to-screen', a.avg_time_to_screen, '<span class="muted">target &lt; 15 min</span>', 'ok') +
        UI.stat('Override rate', a.override_rate, '<span class="muted">of recommended measures</span>', 'warn') + '</div>' +
      '<div class="grid cols-2" style="margin-bottom:18px">' +
        '<div class="card pad"><div class="card-head" style="padding:0 0 14px;border:none"><h3>Screenings per week</h3></div>' + Comp.barChart(weekItems) + '</div>' +
        '<div class="card pad"><div class="card-head" style="padding:0 0 14px;border:none"><h3>Screenings by sub-sector</h3></div><div style="margin-top:10px">' + Comp.hbar(a.by_subsector) + '</div></div>' +
      '</div>' +
      '<div class="card" style="margin-bottom:18px"><div class="card-head"><div><h3>Methodology signal — most-overridden measures</h3>' +
        '<div class="sub">The feedback loop for methodology evolution — click through to the editor</div></div></div>' +
        '<table class="tbl rowlink"><thead><tr><th>Measure</th><th class="num">Recommended</th><th class="num">Overridden</th><th>Rate</th><th>Top reason</th></tr></thead><tbody>' + signalRows + '</tbody></table></div>' +
      '<div class="section-title">Top districts queried</div><div class="tile-grid">' + topTiles + '</div>';
    return UI.page('admin', adminCrumbs('Usage analytics'), body);
  };
})(window);
