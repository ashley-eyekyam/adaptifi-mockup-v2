/* ============================================================================
   AdaptFi — pages: catalogue (walkthrough), sign-in, dashboard, 404.
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI, Comp = global.Comp, App = global.App;
  const esc = UI.esc;
  const Pages = global.Pages = global.Pages || {};

  /* ----- 00 Catalogue / walkthrough ------------------------------------- */
  const SURFACES = [
    { group:'Shell & entry', items:[
      ['01','Sign-in','Branded entry point with SSO option','#/signin'],
      ['02','Dashboard','Workbench home with alerts & stats','#/dashboard']
    ]},
    { group:'Projects workspace', items:[
      ['03','Projects list','Filterable screening history','#/projects'],
      ['04','Project detail','Audit-ready screening record','#/projects/PRJ-2026-0041']
    ]},
    { group:'Screening wizard', items:[
      ['05','Step 1 — Project details','Identity & provisional typology','#/new/1'],
      ['06','Step 2 — Location','District pick + hazard profile','#/new/2'],
      ['07','Step 3 — Climate risk','Per-hazard rating & overrides','#/new/3'],
      ['08','Step 4 — Measures','Apply / defer the recommended set','#/new/4'],
      ['09','Step 5 — Eligibility','MDB/IDFC 3-step + DNSH','#/new/5'],
      ['10','Step 6 — Review & generate','Commit & produce artefacts','#/new/6']
    ]},
    { group:'Output artefact', items:[
      ['11','Screening output preview','Credit-memo-grade document','#/screenings/SCR-2026-0041-A/output']
    ]},
    { group:'Measures Library', items:[
      ['12','Library overview','111 measures, faceted','#/library'],
      ['13','Measure detail','One measure, fully expanded','#/library/measure/DC-EH-01'],
      ['14','Sub-sector view','Measures by sub-sector','#/library/sub-sector/data-centres'],
      ['15','Hazard view','Measures by hazard','#/library/hazard/extreme-heat']
    ]},
    { group:'District Explorer', items:[
      ['16','District Explorer','India hazard landscape','#/districts'],
      ['17','District detail','One district, fully expanded','#/districts/IND-27-MUM-0001']
    ]},
    { group:'Administration', items:[
      ['18','Admin home','Governance toolkit','#/admin'],
      ['19','Methodology editor','Add / edit / retire measures','#/admin/methodology'],
      ['20','Hazard Dataset Manager','District hazard curation','#/admin/hazards'],
      ['21','Version & release','Publish methodology versions','#/admin/versions'],
      ['22','Users & organisations','Provision access','#/admin/users'],
      ['23','Usage analytics','De-identified telemetry','#/admin/analytics']
    ]},
    { group:'Ancillary', items:[
      ['24','Settings','Profile, API keys, security','#/settings'],
      ['25','About','Product & data-source attribution','#/about']
    ]}
  ];

  Pages.catalogue = function () {
    let groups = SURFACES.map(function (g) {
      const cards = g.items.map(function (it) {
        return '<a class="cat-card" href="' + it[3] + '"><span class="num">' + it[0] + '</span>' +
          '<span><span class="ct">' + esc(it[1]) + '</span><span class="cd">' + esc(it[2]) + '</span></span></a>';
      }).join('');
      return '<div class="cat-group"><h3>' + esc(g.group) + '</h3><div class="cat-cards">' + cards + '</div></div>';
    }).join('');

    const html = '<div class="app">' +
      '<main class="main"><div class="wrap view-enter">' +
      '<div class="cat-hero"><div class="glow"></div><div class="inner">' +
        '<div class="eyebrow">Interactive prototype · 25 surfaces</div>' +
        '<h1>AdaptFi — Adaptation Finance Platform</h1>' +
        '<p>A web platform that takes a credit analyst from a blank project record to a complete, audit-ready ' +
        'adaptation-finance screening — grounded in a versioned library of 111 adaptation measures and ' +
        'district-level climate hazard data. This is a fully-wired clickable mock-up of the product design.</p>' +
        '<div class="partners"><span class="pl">A collaboration by</span>' +
          '<span class="logochip"><img src="assets/logos/eyekyam.png" alt="Eyekyam Risk Resolutions"></span>' +
          '<span class="logochip"><img src="assets/logos/auctusesg.png" alt="auctusESG"></span>' +
        '</div>' +
        '<div class="row" style="margin-top:26px;gap:12px;flex-wrap:wrap">' +
          '<a class="btn btn-primary btn-lg" href="#/signin">Enter the prototype ' + UI.icon('chevron') + '</a>' +
          '<a class="btn btn-lg" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff" href="#/dashboard">Skip to dashboard</a>' +
        '</div>' +
      '</div></div>' +
      groups +
      '<p class="meta" style="margin-top:40px;text-align:center">Illustrative prototype · all projects, banks, users and hashes are fictional · ' +
        'measures are the real auctusESG CRE methodology v1.0</p>' +
      '</div></main>' +
      UI.footer() + '</div>';
    return html;
  };

  /* ----- 01 Sign-in ------------------------------------------------------ */
  Pages.signin = function () {
    const html =
      '<div class="auth view-enter">' +
        '<div class="auth-art"><div class="glow g1"></div><div class="glow g2"></div><div class="grain"></div>' +
          '<div class="auth-art-inner">' +
            '<div class="brandbig"><span class="mark">Af</span>' +
              '<span><div class="wm">AdaptFi</div><div class="desc">Adaptation Finance Platform</div></span></div>' +
            '<div class="pitch">' +
              '<h2>Screen projects as adaptation finance — with audit-ready rigour.</h2>' +
              '<p>Assess eligibility under the MDB/IDFC Joint Principles, apply an expert measures library, ' +
              'run DNSH &amp; Maladaptation safeguards, and generate a reproducible screening report.</p>' +
              '<div class="feats">' +
                feat('Versioned methodology — historical screenings never silently change') +
                feat('Snapshotted hazard data pinned to every screening') +
                feat('Credit-memo-grade PDF, JSON, CSV &amp; XLSX outputs') +
              '</div>' +
              '<div class="partners"><div class="pl">A collaboration by</div><div class="logos">' +
                '<span class="logochip"><img src="assets/logos/eyekyam.png" alt="Eyekyam Risk Resolutions"></span>' +
                '<span class="logochip"><img src="assets/logos/auctusesg.png" alt="auctusESG"></span>' +
              '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="auth-form"><div class="auth-card">' +
          '<div class="ac-h"><h1>Sign in</h1><p class="ac-sub">Welcome back. Continue to your workbench.</p></div>' +
          '<form id="signinForm">' +
            '<div class="field"><label>Work email</label>' +
              '<input class="input" type="email" value="a.rao@meridianbank.example" autocomplete="username"></div>' +
            '<div class="field"><label>Password</label>' +
              '<input class="input" type="password" value="••••••••••" autocomplete="current-password"></div>' +
            '<div class="checkrow"><label><input type="checkbox" checked> Keep me signed in</label>' +
              '<a href="#/signin">Forgot password?</a></div>' +
            '<button class="btn btn-primary btn-block btn-lg" type="submit">Sign in ' + UI.icon('chevron') + '</button>' +
            '<div class="divider">or</div>' +
            '<button class="btn btn-block" type="button" id="ssoBtn">' + UI.icon('admin') + ' Continue with corporate SSO</button>' +
          '</form>' +
          '<div class="auth-foot">AdaptFi v1.0 · Methodology cre@1.0 · Confidential</div>' +
        '</div></div>' +
      '</div>';
    return { html: html, onMount: function (root) {
      const form = root.querySelector('#signinForm');
      form.addEventListener('submit', function (e) { e.preventDefault(); UI.toast('Signed in as Ananya Rao', 'ok'); global.Router.go('#/dashboard'); });
      root.querySelector('#ssoBtn').addEventListener('click', function () { UI.toast('Redirecting to corporate SSO…'); setTimeout(function(){ global.Router.go('#/dashboard'); }, 500); });
    }};
  };
  function feat(t) { return '<div class="f"><span class="fi">' + UI.icon('check') + '</span><span>' + t + '</span></div>'; }

  /* ----- 02 Dashboard ---------------------------------------------------- */
  Pages.dashboard = function () {
    const scr = DB.SCREENINGS;
    const total = scr.length;
    const eligible = scr.filter(function (s) { return s.eligibility === 'Eligible'; }).length;
    const flagged = scr.filter(function (s) { return s.dnsh === 'Flagged'; }).length;
    const districts = (function () { const set = {}; scr.forEach(function (s) { set[s.district_id] = 1; }); return Object.keys(set).length; })();
    const recent = scr.slice().sort(function (a, b) { return (b.created_at).localeCompare(a.created_at); }).slice(0, 6);
    const needAttention = scr.filter(function (s) { return s.status === 'Review' || s.status === 'Draft'; }).length;

    const stats = '<div class="grid cols-4 reveal" style="margin-bottom:24px">' +
      UI.stat('Total screenings', total, '<span class="d up">' + UI.icon('check') + ' workspace</span>') +
      UI.stat('Eligible projects', eligible, '<span class="muted">' + Math.round(eligible / total * 100) + '% of screenings</span>', 'ok') +
      UI.stat('DNSH-flagged', flagged, '<span class="muted">awaiting reviewer sign-off</span>', flagged ? 'bad' : 'ok') +
      UI.stat('Districts covered', districts, '<span class="muted">of ~720 available</span>', 'info') +
      '</div>';

    const recentRows = recent.map(function (s) {
      const dist = DB.district(s.district_id);
      return '<tr class="rowlink" data-href="#/projects/' + s.project_id + '">' +
        '<td class="mono meta">' + esc(s.screening_id) + '</td>' +
        '<td><div class="pname">' + esc(s.name) + '</div><div class="psub">' + esc(s.bank) + '</div></td>' +
        '<td>' + esc(s.sub_sector) + '</td>' +
        '<td>' + esc(dist ? dist.name : '—') + '</td>' +
        '<td>' + UI.eligibilityChip(s.eligibility) + '</td>' +
        '<td>' + UI.statusChip(s.status) + '</td>' +
        '<td class="meta nowrap">' + esc(s.created_at) + '</td></tr>';
    }).join('');

    const recentCard = '<div class="card"><div class="card-head"><div><h3>Recent screenings</h3>' +
      '<div class="sub">Most recent activity in your workspace</div></div>' +
      '<a class="btn btn-sm" href="#/projects">View all ' + UI.icon('chevron') + '</a></div>' +
      '<table class="tbl rowlink"><thead><tr><th>ID</th><th>Project</th><th>Sub-sector</th><th>District</th><th>Eligibility</th><th>Status</th><th>Last run</th></tr></thead>' +
      '<tbody>' + recentRows + '</tbody></table></div>';

    const alerts = '<div class="card"><div class="card-head"><h3>Portfolio activity</h3>' +
      '<span class="chip warn"><span class="dot"></span>2 need attention</span></div><div class="card-body stack">' +
      '<div class="alert warn"><span class="ai">' + UI.icon('refresh') + '</span><div>' +
        '<div class="at">Hazard reclassification pending</div>' +
        'Mumbai — <strong>Storm/Cyclone</strong> proposed Medium → High in the latest ThinkHazard sync. ' +
        'Affects 2 active screenings in your portfolio. <a href="#/admin/hazards">Review snapshot →</a></div></div>' +
      '<div class="alert info"><span class="ai">' + UI.icon('spark') + '</span><div>' +
        '<div class="at">Methodology draft available</div>' +
        '<span class="mono">cre@1.1-draft</span> — 6 edited, 3 added, 1 retired. ' +
        '<a href="#/admin/versions">Review &amp; publish →</a></div></div>' +
      '</div></div>';

    const quick = '<div class="card"><div class="card-head"><h3>Quick actions</h3></div><div class="card-body grid cols-2" style="gap:10px">' +
      qa('plus','New screening','#/new') + qa('map','District explorer','#/districts') +
      qa('library','Measures library','#/library') + qa('admin','Admin console','#/admin') +
      '</div></div>';

    const methodology = '<div class="card"><div class="card-head"><h3>Current methodology</h3>' +
      '<span class="chip ok"><span class="dot"></span>Live</span></div><div class="card-body">' +
      '<div class="deflist">' +
        Comp.di('Active version', '<span class="mono">cre@1.0</span>') +
        Comp.di('Published', '2026-01-15') +
        Comp.di('Measures', '111 across 4 sub-sectors') +
        Comp.di('Hazard snapshot', '<span class="mono">thinkhazard@2026-03-18</span>') +
      '</div></div></div>';

    const sources = '<div class="card"><div class="card-head"><h3>Data sources</h3></div><div class="card-body">' +
      '<div class="stack" style="gap:10px">' + DB.DATA_SOURCES.map(function (d) {
        return '<div class="row between"><span class="strong" style="font-size:12.5px">' + esc(d.name) + '</span>' +
          '<span class="meta" style="text-align:right;max-width:60%">' + esc(d.use) + '</span></div>';
      }).join('') + '</div></div></div>';

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Workbench</div>' +
        '<h1>Good afternoon, Ananya.</h1>' +
        '<p class="sub">' + (needAttention ? needAttention + ' active screenings need your attention.' : 'You are all caught up.') + '</p></div>' +
        '<div class="head-actions"><a class="btn" href="#/library">' + UI.icon('library') + ' Library</a>' +
          '<a class="btn btn-primary" href="#/new">' + UI.icon('plus') + ' New screening</a></div>' +
      '</div>' +
      stats +
      '<div class="layout-rail"><div class="stack">' + recentCard + alerts + '</div>' +
        '<div class="stack">' + quick + methodology + sources + '</div></div>';

    return UI.page('dashboard', null, body);
  };
  function qa(ic, label, href) {
    return '<a class="btn btn-block" href="' + href + '" style="justify-content:flex-start">' + UI.icon(ic) + ' ' + esc(label) + '</a>';
  }

  Pages.notFound = function (path) {
    return UI.page(null, null, '<div class="empty" style="padding:80px"><div class="ei">🧭</div>' +
      '<div class="h2">Surface not found</div><p class="muted" style="margin-top:8px">No route for <span class="mono">#/' + esc(path) + '</span></p>' +
      '<a class="btn btn-primary" style="margin-top:18px" href="#/">Back to catalogue</a></div>');
  };
})(window);
