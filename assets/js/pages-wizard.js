/* ============================================================================
   AdaptFi — pages: the six-step New Screening wizard (05–10) and the
   screening output preview (11).
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI, Comp = global.Comp, App = global.App;
  const esc = UI.esc;
  const Pages = global.Pages = global.Pages || {};

  const STEPS = [
    { n: 1, label: 'Project details', key: 'Identity', where: 'Capture who and what is being screened.', why: 'These fields mirror a credit memo’s project-identity block and seed the eligibility engine with context.' },
    { n: 2, label: 'Location', key: 'District', where: 'Pick the project’s district — by dropdown or on the map.', why: 'The district determines the hazard profile, and the exact hazard snapshot is pinned to this screening.' },
    { n: 3, label: 'Climate risk', key: 'Hazards', where: 'Review each hazard rating and override where you have better local evidence.', why: 'Every override is logged with a justification so a reviewer can inspect the reasoning.' },
    { n: 4, label: 'Measures', key: 'Adaptation', where: 'Apply, defer or dismiss each recommended measure.', why: 'Explicit decisions — not auto-accept — preserve the reasoning for the DNSH check and the report.' },
    { n: 5, label: 'Eligibility', key: 'MDB/IDFC + DNSH', where: 'Answer the 3-step eligibility logic and the DNSH safeguards.', why: 'The determination is a transparent walkthrough, not a black box.' },
    { n: 6, label: 'Review & generate', key: 'Commit', where: 'Confirm the summary and generate the audit-ready output.', why: 'Generation pins the version and snapshot, hashes the inputs and persists the artefacts.' }
  ];

  function stepStrip(cur) {
    return '<div class="stepstrip">' + STEPS.map(function (s) {
      const done = s.n < cur, active = s.n === cur;
      const clickable = s.n <= App.draft.maxStep || s.n <= cur;
      return '<a class="stepitem ' + (done ? 'done ' : '') + (active ? 'active ' : '') + (clickable ? 'clickable' : '') + '" ' +
        (clickable ? 'href="#/new/' + s.n + '"' : '') + '>' +
        '<span class="sn">' + (done ? UI.icon('check') : s.n) + '</span>' +
        '<span><span class="sl">' + esc(s.label) + '</span><br><span class="sk">' + esc(s.key) + '</span></span></a>';
    }).join('') + '</div>';
  }

  function chrome(cur, inner, reminders) {
    const s = STEPS[cur - 1];
    const left = '<div class="sidekick"><div class="blk"><h4>Where you are</h4><p>' + esc(s.where) + '</p></div>' +
      '<div class="blk"><h4>Why this matters</h4><p>' + esc(s.why) + '</p></div>' +
      '<div class="blk"><h4>Progress</h4><p>Step ' + cur + ' of 6</p>' +
        '<div class="track" style="height:8px;background:var(--n-100);border-radius:99px;overflow:hidden;margin-top:8px"><div style="height:100%;width:' + Math.round(cur / 6 * 100) + '%;background:linear-gradient(90deg,var(--primary-accent),var(--primary-deep))"></div></div></div></div>';
    const right = '<div class="sidekick"><div class="blk"><h4>Methodology</h4><p><span class="mono">cre@1.0</span> · 111 measures<br><span class="mono">thinkhazard@2026-03-18</span></p></div>' +
      '<div class="blk"><h4>Reminders</h4><p>' + (reminders || 'Save your draft any time — it resumes exactly where you left off.') + '</p></div></div>';

    const nav = '<div class="wizard-nav">' +
      (cur > 1 ? '<a class="btn" href="#/new/' + (cur - 1) + '">' + UI.icon('back') + ' Previous</a>' : '<span></span>') +
      (cur < 6 ? '<a class="btn btn-primary" href="#/new/' + (cur + 1) + '">Next: ' + esc(STEPS[cur].label) + ' ' + UI.icon('chevron') + '</a>'
        : '<button class="btn btn-primary btn-lg" id="generateBtn">' + UI.icon('spark') + ' Generate screening</button>') + '</div>';

    const head = '<div class="pagehead"><div class="lead"><div class="eyebrow">New screening · step ' + cur + ' of 6</div>' +
      '<h1>' + esc(s.label) + '</h1></div>' +
      '<div class="head-actions"><button class="btn" id="saveDraftBtn">' + UI.icon('check') + ' Save draft</button>' +
        '<a class="btn btn-ghost" href="#/projects">Cancel</a></div></div>';

    const body = head + stepStrip(cur) + '<div class="wizard-grid">' + left + '<div>' + inner + nav + '</div>' + right + '</div>';
    return body;
  }

  Pages.wizard = function (p) {
    let cur = parseInt(p.step || '1', 10); if (!(cur >= 1 && cur <= 6)) cur = 1;
    App.draft.maxStep = Math.max(App.draft.maxStep, cur);
    const d = App.draft;
    let inner, mount;

    if (cur === 1) { inner = step1(d); }
    else if (cur === 2) { inner = step2(d); }
    else if (cur === 3) { inner = step3(d); }
    else if (cur === 4) { inner = step4(d); }
    else if (cur === 5) { inner = step5(d); }
    else { inner = step6(d); }

    const body = chrome(cur, inner);
    return { html: UI.page('new', [{ label: 'Home', href: '#/dashboard' }, { label: 'New Screening' }, { label: 'Step ' + cur }], body),
      onMount: function (root) {
        const sd = root.querySelector('#saveDraftBtn');
        if (sd) sd.addEventListener('click', function () { UI.toast('Draft saved · ' + d.screeningId, 'ok'); });
        wireCommon(root, d);
        if (cur === 1) wire1(root, d);
        else if (cur === 2) wire2(root, d);
        else if (cur === 3) wire3(root, d);
        else if (cur === 4) wire4(root, d);
        else if (cur === 5) wire5(root, d);
        else wire6(root, d);
      }};
  };

  function wireCommon(root, d) {
    root.querySelectorAll('[data-bind]').forEach(function (el) {
      el.addEventListener('input', function () { setPath(d, el.getAttribute('data-bind'), el.value); });
    });
  }

  /* ----- Step 1 ---------------------------------------------------------- */
  function step1(d) {
    const subOpts = DB.SUBSECTORS.map(function (s) { return '<option' + (d.subSector === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
    const typoCards = Object.keys(DB.TYPOLOGY).map(function (t) {
      return '<div class="card hoverable typo-card ' + (d.typology === t ? 'sel' : '') + '" data-typology="' + t + '" ' +
        'style="padding:16px;cursor:pointer;border-color:' + (d.typology === t ? 'var(--primary-accent)' : 'var(--n-200)') + ';' +
        (d.typology === t ? 'box-shadow:var(--ring)' : '') + '">' +
        '<div class="row between"><span class="strong">' + esc(t) + '</span>' + (d.typology === t ? '<span class="chip ok">' + UI.icon('check') + '</span>' : '') + '</div>' +
        '<div class="meta" style="margin-top:4px;font-weight:600">' + esc(DB.TYPOLOGY_SHORT[t]) + '</div>' +
        '<p class="meta" style="margin-top:8px;line-height:1.5">' + esc(DB.TYPOLOGY[t]) + '</p></div>';
    }).join('');

    return '<div class="card pad"><div class="grid cols-2">' +
        '<div class="field"><label>Project name <span class="req">*</span></label><input class="input" data-bind="name" value="' + esc(d.name) + '" placeholder="e.g. Powai Hyperscale Data Campus"></div>' +
        '<div class="field"><label>Internal project ID</label><input class="input mono" value="' + esc(d.id) + '" data-bind="id"><span class="hint">Auto-generated · editable</span></div>' +
      '</div>' +
      '<div class="grid cols-2">' +
        '<div class="field"><label>Sector</label><select class="select" disabled><option>Commercial Real Estate</option></select></div>' +
        '<div class="field"><label>Sub-sector <span class="req">*</span></label><select class="select" data-bind="subSector">' + subOpts + '</select></div>' +
      '</div>' +
      '<div class="field"><label>Primary objective <span class="req">*</span></label><textarea class="textarea" data-bind="objective" placeholder="What is the project, and what does it aim to achieve?">' + esc(d.objective) + '</textarea><span class="hint">Referenced by the eligibility Step 2 logic.</span></div>' +
      '<div class="field"><label>Ecosystem context</label><textarea class="textarea" data-bind="ecosystem" placeholder="Describe the site context and surrounding ecology.">' + esc(d.ecosystem) + '</textarea><span class="hint">Feeds the DNSH and Maladaptation screening.</span></div>' +
      '<div class="field"><label>Adaptation project typology <span class="hint">— provisional; confirmed at Step 5</span></label>' +
        '<div class="grid cols-3" id="typoCards" style="margin-top:6px">' + typoCards + '</div></div>' +
    '</div>';
  }
  function wire1(root, d) {
    root.querySelectorAll('[data-typology]').forEach(function (c) {
      c.addEventListener('click', function () {
        d.typology = c.getAttribute('data-typology');
        root.querySelectorAll('.typo-card').forEach(function (x) { x.classList.remove('sel'); x.style.borderColor = 'var(--n-200)'; x.style.boxShadow = ''; x.querySelector('.chip')?.remove?.(); });
        c.classList.add('sel'); c.style.borderColor = 'var(--primary-accent)'; c.style.boxShadow = 'var(--ring)';
      });
    });
    const sub = root.querySelector('[data-bind="subSector"]');
    if (sub) sub.addEventListener('change', function () { d.subSector = sub.value; });
  }

  /* ----- Step 2 ---------------------------------------------------------- */
  function step2(d) {
    const states = uniq(DB.DISTRICTS.map(function (x) { return x.state; })).sort();
    const cur = DB.district(d.districtId);
    const curState = cur ? cur.state : '';
    const stateOpts = '<option value="">Select state…</option>' + states.map(function (s) { return '<option' + (curState === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
    const distList = DB.DISTRICTS.filter(function (x) { return !curState || x.state === curState; });
    const distOpts = '<option value="">Select district…</option>' + distList.map(function (x) { return '<option value="' + x.id + '"' + (d.districtId === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('');

    const mapDots = DB.DISTRICTS.map(function (x) {
      const sev = Comp.severity(x); const color = Comp.severityColor(sev);
      const selected = x.id === d.districtId;
      return '<a class="mapdot" data-did="' + x.id + '" title="' + esc(x.name) + '" style="left:' + (x.x * 100) + '%;top:' + (x.y * 100) + '%;width:' + (selected ? 18 : 12) + 'px;height:' + (selected ? 18 : 12) + 'px;background:' + color + ';' + (selected ? 'box-shadow:0 0 0 4px rgba(42,173,168,.4)' : '') + '"></a>';
    }).join('');
    const map = '<div class="mapwrap"><div class="mapcanvas">' + Comp.mapSilhouette() + '<div>' + mapDots + '</div>' +
      '<div class="mapnote">Click a district · schematic</div></div></div>';

    const profile = d.districtId ? App.draftProfile() : null;
    const profileBlock = profile
      ? '<div class="card pad"><div class="section-title" style="margin-top:0">Hazard profile — ' + esc(cur.name) + '</div>' +
        Comp.hazardProfileTable(profile) +
        '<p class="meta" style="margin-top:10px"><em>Source: ThinkHazard! district-level ratings · snapshotted ' + esc(DB.SNAPSHOT.snapshotted_at) +
        '. This exact snapshot will be pinned to this screening.</em></p></div>'
      : '<div class="card pad"><div class="empty"><div class="ei">' + UI.icon('map') + '</div>Choose a district to load its hazard profile.</div></div>';

    return '<div class="grid cols-2" style="margin-bottom:16px">' +
        '<div class="card pad"><div class="section-title" style="margin-top:0">Dropdown</div>' +
          '<div class="field"><label>State</label><select class="select" id="stateSel">' + stateOpts + '</select></div>' +
          '<div class="field"><label>District</label><select class="select" id="distSel">' + distOpts + '</select></div>' +
          '<p class="meta">Know the district? Pick it directly.</p></div>' +
        '<div class="card pad"><div class="section-title" style="margin-top:0">Map</div>' + map + '</div>' +
      '</div>' + profileBlock;
  }
  function wire2(root, d) {
    const ss = root.querySelector('#stateSel'), ds = root.querySelector('#distSel');
    if (ss) ss.addEventListener('change', function () {
      const first = DB.DISTRICTS.find(function (x) { return x.state === ss.value; });
      d.districtId = ''; // reset; user picks district next
      // temporarily store chosen state by selecting first district? Keep empty, re-render filtered list
      d._tmpState = ss.value; global.Router.refresh();
    });
    if (ds) ds.addEventListener('change', function () { d.districtId = ds.value; global.Router.refresh(); });
    root.querySelectorAll('[data-did]').forEach(function (dot) {
      dot.addEventListener('click', function (e) { e.preventDefault(); d.districtId = dot.getAttribute('data-did'); global.Router.refresh(); });
    });
  }

  /* ----- Step 3 ---------------------------------------------------------- */
  function step3(d) {
    if (!d.districtId) return needDistrict();
    const dist = DB.district(d.districtId);
    const rows = DB.HAZARDS.map(function (h) {
      const src = dist.hazards[h];
      const ov = d.overrides[h] ? d.overrides[h].value : '';
      const opts = ['<option value="">— use snapshot —</option>'].concat(DB.INTENSITIES.map(function (i) { return '<option value="' + i + '"' + (ov === i ? ' selected' : '') + '>' + i + '</option>'; })).join('');
      return '<tr><td><span class="row" style="gap:8px"><span>' + DB.HAZARD_ICON[h] + '</span><span class="strong">' + esc(h) + '</span></span></td>' +
        '<td>' + UI.intensityPill(src) + '</td>' +
        '<td><select class="select ov-sel" data-haz="' + esc(h) + '" style="min-width:160px">' + opts + '</select></td>' +
        '<td><input class="input ov-just" data-haz="' + esc(h) + '" placeholder="Justification (required if overridden)" value="' + esc(d.overrides[h] ? d.overrides[h].reason : '') + '"' + (ov ? '' : ' disabled') + '></td></tr>';
    }).join('');

    return '<div class="card"><div class="card-head"><h3>Per-hazard rating &amp; overrides</h3><span class="meta mono">' + esc(DB.SNAPSHOT.id) + '</span></div>' +
        '<table class="tbl"><thead><tr><th>Hazard</th><th>Current rating</th><th>Override</th><th>Justification</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="card pad" style="margin-top:16px"><div class="section-title" style="margin-top:0">Narrative assessment</div>' +
        nfield('Sector / sub-sector exposure and vulnerability', 'narratives.sector', d.narratives.sector) +
        nfield('Location developmental context', 'narratives.context', d.narratives.context) +
        nfield('Location exposure and vulnerability', 'narratives.exposure', d.narratives.exposure) +
        nfield('Environment, social and economic impacts', 'narratives.impacts', d.narratives.impacts) +
      '</div>';
  }
  function wire3(root, d) {
    root.querySelectorAll('.ov-sel').forEach(function (sel) {
      sel.addEventListener('change', function () {
        const h = sel.getAttribute('data-haz');
        const just = root.querySelector('.ov-just[data-haz="' + cssEsc(h) + '"]');
        if (sel.value) { d.overrides[h] = { value: sel.value, reason: d.overrides[h] ? d.overrides[h].reason : '' }; if (just) just.disabled = false; }
        else { delete d.overrides[h]; if (just) { just.disabled = true; just.value = ''; } }
      });
    });
    root.querySelectorAll('.ov-just').forEach(function (inp) {
      inp.addEventListener('input', function () { const h = inp.getAttribute('data-haz'); if (d.overrides[h]) d.overrides[h].reason = inp.value; });
    });
  }

  /* ----- Step 4 ---------------------------------------------------------- */
  function step4(d) {
    if (!d.districtId) return needDistrict();
    const rec = App.draftRecommended();
    const profile = App.draftProfile();
    const byHaz = {};
    rec.forEach(function (m) { (byHaz[m.hazard] = byHaz[m.hazard] || []).push(m); });
    const hazards = DB.HAZARDS.filter(function (h) { return byHaz[h]; });

    let groups = hazards.map(function (h) {
      const cards = byHaz[h].map(function (m) {
        const st = (d.measures[m.id] && d.measures[m.id].status) || '';
        const reason = (d.measures[m.id] && d.measures[m.id].reason) || '';
        return '<div class="measure-row ' + st + '" data-row="' + esc(m.id) + '"><div>' +
          '<div class="mtop" style="margin-bottom:6px">' + UI.loeChip(m.loe) + UI.themeChip(m.theme) + '<span class="mid mono">' + esc(m.id) + '</span>' +
            '<a class="mlink" href="#/library/measure/' + m.id + '" style="margin-left:auto">Detail ' + UI.icon('external') + '</a></div>' +
          '<div class="mtext">' + esc(m.text) + '</div>' +
          '<input class="input ms-reason" data-mid="' + esc(m.id) + '" placeholder="Reason / note" value="' + esc(reason) + '" style="margin-top:8px;' + (st === 'deferred' || st === 'na' ? '' : 'display:none') + '"></div>' +
          '<div class="ctrls"><div class="statusset" data-mid="' + esc(m.id) + '">' +
            '<button class="applied ' + (st === 'applied' ? 'active' : '') + '" data-status="applied">Applied</button>' +
            '<button class="deferred ' + (st === 'deferred' ? 'active' : '') + '" data-status="deferred">Defer</button>' +
            '<button class="na ' + (st === 'na' ? 'active' : '') + '" data-status="na">N/A</button>' +
          '</div></div></div>';
      }).join('');
      return '<div class="section-title">' + UI.hazardChip(h, true) + UI.intensityPillSm(profile[h]) + '<span class="tag-soft">' + byHaz[h].length + '</span></div>' +
        '<div class="stack" style="gap:10px">' + cards + '</div>' +
        '<div class="field" style="margin-top:10px"><label>Project measures for ' + esc(h) + ' — in your own words</label>' +
          '<textarea class="textarea" data-mn="' + esc(h) + '" placeholder="Describe the measures the project actually proposes for this hazard…">' + esc(d.measureNarratives[h] || '') + '</textarea></div>';
    }).join('');

    const c = App.measureStatusCounts();
    const summary = '<div class="card pad" style="position:sticky;top:140px"><div class="section-title" style="margin-top:0">Summary</div>' +
      '<div class="deflist" id="msSummary">' +
        Comp.di('Recommended', '<span id="cRec">' + c.recommended + '</span>') +
        Comp.di('Applied', '<span class="chip ok" id="cApp">' + c.applied + '</span>') +
        Comp.di('Deferred', '<span class="chip warn" id="cDef">' + c.deferred + '</span>') +
        Comp.di('Not applicable', '<span class="chip neutral" id="cNa">' + c.na + '</span>') + '</div>' +
      '<p class="meta" style="margin-top:12px">Confirm or dismiss each measure — decisions carry into the DNSH check and the report.</p></div>';

    return '<div class="layout-rail"><div>' + (groups || '<div class="empty">No hazards rated Medium/High for this district.</div>') + '</div><div>' + summary + '</div></div>';
  }
  function wire4(root, d) {
    root.querySelectorAll('.statusset').forEach(function (set) {
      const mid = set.getAttribute('data-mid');
      set.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          const status = b.getAttribute('data-status');
          d.measures[mid] = d.measures[mid] || {}; d.measures[mid].status = status;
          set.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          const row = root.querySelector('[data-row="' + cssEsc(mid) + '"]');
          row.className = 'measure-row ' + status;
          const reason = row.querySelector('.ms-reason');
          if (reason) reason.style.display = (status === 'deferred' || status === 'na') ? '' : 'none';
          updateCounts(root);
        });
      });
    });
    root.querySelectorAll('.ms-reason').forEach(function (inp) {
      inp.addEventListener('input', function () { const mid = inp.getAttribute('data-mid'); d.measures[mid] = d.measures[mid] || {}; d.measures[mid].reason = inp.value; });
    });
    root.querySelectorAll('[data-mn]').forEach(function (t) {
      t.addEventListener('input', function () { d.measureNarratives[t.getAttribute('data-mn')] = t.value; });
    });
  }
  function updateCounts(root) {
    const c = App.measureStatusCounts();
    set(root, '#cApp', c.applied); set(root, '#cDef', c.deferred); set(root, '#cNa', c.na); set(root, '#cRec', c.recommended);
  }

  /* ----- Step 5 ---------------------------------------------------------- */
  function step5(d) {
    if (!d.districtId) return needDistrict();
    const steps = [DB.ELIGIBILITY.step1, DB.ELIGIBILITY.step2, DB.ELIGIBILITY.step3];
    const cards = steps.map(function (st, i) {
      const qs = st.questions.map(function (q, j) {
        const key = (i + 1) + '.' + j;
        const v = d.eligibility[key] || '';
        return '<div class="row between" style="padding:11px 0;border-bottom:1px dashed var(--n-200);gap:14px">' +
          '<span style="font-size:12.5px;flex:1">' + esc(q) + '</span>' +
          '<span class="ynn" data-eq="' + key + '">' +
            '<button data-v="Yes" class="' + (v === 'Yes' ? 'active' : '') + '">Yes</button>' +
            '<button data-v="No" class="' + (v === 'No' ? 'active' : '') + '">No</button></span></div>';
      }).join('');
      return '<div class="card" style="margin-bottom:14px"><div class="card-head"><h3 style="font-size:13.5px">' + esc(st.title) + '</h3></div>' +
        '<div class="card-body">' + qs + '<div class="alert info" style="margin-top:12px;font-size:12px" data-rollup="' + (i + 1) + '"><span class="ai">' + UI.icon('info') + '</span>' +
        '<div><strong>' + esc(st.rollup) + '</strong> — <span class="r-val">pending</span></div></div></div></div>';
    }).join('');

    const det = '<div class="card pad" id="determination"></div>';

    const dnshRows = DB.DNSH_QUESTIONS.map(function (q) {
      const a = d.dnsh[q.n] || {};
      return '<tr data-dnrow="' + q.n + '"><td class="num strong">' + q.n + '</td><td>' + esc(q.text) + '</td>' +
        '<td><span class="ynn" data-dn="' + q.n + '">' +
          '<button data-v="Yes" class="' + (a.response === 'Yes' ? 'active' : '') + '">Yes</button>' +
          '<button data-v="No" class="' + (a.response === 'No' ? 'active' : '') + '">No</button>' +
          '<button data-v="NA" class="' + (a.response === 'NA' ? 'active' : '') + '">NA</button></span></td>' +
        '<td><input class="input dnj" data-dn="' + q.n + '" placeholder="Justification" value="' + esc(a.justification || '') + '"></td></tr>';
    }).join('');

    return '<div class="section-title" style="margin-top:0">Part 1 — MDB/IDFC 3-step eligibility logic</div>' + cards + det +
      '<div class="section-title">Part 2 — Maladaptation, DNSH &amp; Minimum Social Safeguards</div>' +
      '<div class="card"><div class="card-head"><h3>Safeguards questionnaire</h3><span id="dnshStatus">' + UI.dnshChip('Compliant') + '</span></div>' +
        '<table class="tbl"><thead><tr><th>#</th><th>Question</th><th>Response</th><th>Justification</th></tr></thead><tbody>' + dnshRows + '</tbody></table>' +
        '<div class="card-foot"><span class="meta">A Yes to a harm-risk question (or No to a positive commitment) raises a flag requiring reviewer sign-off.</span></div></div>';
  }
  function wire5(root, d) {
    root.querySelectorAll('.ynn[data-eq]').forEach(function (set) {
      const key = set.getAttribute('data-eq');
      set.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          d.eligibility[key] = b.getAttribute('data-v');
          set.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active');
          updateEligibility(root, d);
        });
      });
    });
    root.querySelectorAll('.ynn[data-dn]').forEach(function (set) {
      const n = set.getAttribute('data-dn');
      set.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          d.dnsh[n] = d.dnsh[n] || {}; d.dnsh[n].response = b.getAttribute('data-v');
          set.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active');
          updateDnsh(root, d);
        });
      });
    });
    root.querySelectorAll('.dnj').forEach(function (inp) {
      inp.addEventListener('input', function () { const n = inp.getAttribute('data-dn'); d.dnsh[n] = d.dnsh[n] || {}; d.dnsh[n].justification = inp.value; });
    });
    updateEligibility(root, d); updateDnsh(root, d);
  }
  function updateEligibility(root, d) {
    const e = d.eligibility;
    function rv(el, ok, ans) { if (!el) return; const span = el.querySelector('.r-val'); if (ans == null) { span.textContent = 'pending'; el.className = 'alert info'; } else { span.textContent = ans; el.className = 'alert ' + (ok ? 'ok' : 'bad'); } }
    const s1ans = (e['1.0'] && e['1.1']) ? ((e['1.0'] === 'Yes' && e['1.1'] === 'Yes') ? 'Yes' : 'No') : null;
    const s2ans = (e['2.0'] && e['2.1']) ? ((e['2.0'] === 'Yes' && e['2.1'] === 'Yes') ? 'Yes' : 'No') : null;
    const s3ready = e['3.0'] && e['3.1'];
    const s3ok = e['3.0'] === 'Yes' && (e['3.1'] === 'No' || e['3.2'] === 'Yes');
    rv(root.querySelector('[data-rollup="1"]'), s1ans === 'Yes', s1ans);
    rv(root.querySelector('[data-rollup="2"]'), s2ans === 'Yes', s2ans);
    rv(root.querySelector('[data-rollup="3"]'), s3ok, s3ready ? (s3ok ? 'Yes' : 'No') : null);
    const out = App.eligibilityOutcome();
    const det = root.querySelector('#determination');
    if (!det) return;
    if (!out.complete) { det.innerHTML = '<div class="empty" style="padding:16px"><span class="meta">Answer the questions above to see the determination.</span></div>'; return; }
    det.innerHTML = '<div class="grid cols-3" style="margin-bottom:14px">' +
      mini('Step 1', out.s1) + mini('Step 2', out.s2) + mini('Step 3', out.s3) + '</div>' +
      (out.outcome === 'Eligible'
        ? '<div class="banner ok"><div class="bicon">' + UI.icon('check') + '</div><div><div class="bt">Project is Eligible under IDFC-MDB Principles</div><div class="bs">Classification: ' + esc(d.typology) + ' — ' + esc(DB.TYPOLOGY_SHORT[d.typology]) + '</div></div></div>'
        : '<div class="banner bad"><div class="bicon">✕</div><div><div class="bt">Project is Not Eligible under IDFC-MDB Principles</div><div class="bs">One or more steps did not pass.</div></div></div>');
  }
  function mini(label, ok) {
    return '<div class="card" style="padding:12px;text-align:center;border-top:3px solid ' + (ok ? 'var(--ok)' : 'var(--bad)') + '">' +
      '<div class="meta">' + esc(label) + '</div><div class="strong" style="margin-top:4px;color:' + (ok ? 'var(--ok)' : 'var(--bad)') + '">' + (ok ? 'Pass' : 'Fail') + '</div></div>';
  }
  function updateDnsh(root, d) {
    const out = App.dnshOutcome();
    set(root, '#dnshStatus', UI.dnshChip(out.outcome), true);
    DB.DNSH_QUESTIONS.forEach(function (q) {
      const tr = root.querySelector('[data-dnrow="' + q.n + '"]'); if (!tr) return;
      const a = d.dnsh[q.n] || {}; const bad = (q.harm && a.response === 'Yes') || (!q.harm && a.response === 'No');
      tr.style.background = bad ? 'var(--bad-wash)' : '';
    });
  }

  /* ----- Step 6 ---------------------------------------------------------- */
  function step6(d) {
    if (!d.districtId) return needDistrict();
    const dist = DB.district(d.districtId);
    const profile = App.draftProfile();
    const c = App.measureStatusCounts();
    const elig = App.eligibilityOutcome();
    const dnsh = App.dnshOutcome();

    function summaryCard(title, step, inner) {
      return '<div class="card"><div class="card-head"><h3>' + esc(title) + '</h3><a class="btn btn-sm btn-ghost" href="#/new/' + step + '">Edit ' + UI.icon('chevron') + '</a></div><div class="card-body">' + inner + '</div></div>';
    }
    const cards =
      summaryCard('Project identity', 1, '<dl class="kv"><dt>Name</dt><dd>' + esc(d.name || '—') + '</dd><dt>Sub-sector</dt><dd>' + esc(d.subSector) + '</dd>' +
        '<dt>Typology</dt><dd>' + UI.typologyChip(d.typology) + '</dd><dt>Objective</dt><dd>' + esc(d.objective ? d.objective.slice(0, 120) + (d.objective.length > 120 ? '…' : '') : '—') + '</dd></dl>') +
      summaryCard('Location & hazard profile', 2, (dist ? '<div class="strong" style="margin-bottom:10px">' + esc(dist.name) + ', ' + esc(dist.state) + '</div>' + Comp.hazardProfileTable(profile) : '—')) +
      summaryCard('Measures applied', 4, '<div class="row" style="gap:18px"><div><div class="h2">' + c.applied + '</div><div class="meta">applied</div></div>' +
        '<div><div class="h2">' + c.deferred + '</div><div class="meta">deferred</div></div><div><div class="h2">' + c.na + '</div><div class="meta">n/a</div></div>' +
        '<div><div class="h2">' + c.recommended + '</div><div class="meta">recommended</div></div></div>') +
      summaryCard('Eligibility outcome', 5, (elig.complete
        ? (elig.outcome === 'Eligible' ? '<span class="chip ok">Eligible</span>' : '<span class="chip bad">Not Eligible</span>') + ' ' + UI.dnshChip(dnsh.outcome) + ' ' + UI.typologyChip(d.typology)
        : '<span class="chip warn">Eligibility incomplete</span> — answer Step 5 before generating.'));

    const secs = d.gen.sections;
    function chk(key, label) { return '<label class="row" style="gap:9px;padding:6px 0"><span class="toggle"><input type="checkbox" data-sec="' + key + '"' + (secs[key] ? ' checked' : '') + '><span class="tk"></span></span> ' + esc(label) + '</label>'; }
    const rail = '<div class="card" style="position:sticky;top:140px"><div class="card-head"><h3>Generation options</h3></div><div class="card-body">' +
      '<div class="field"><label>Report title override</label><input class="input" id="genTitle" placeholder="' + esc((d.name || 'Adaptation Finance Screening') + ' — Screening Report') + '" value="' + esc(d.gen.title) + '"></div>' +
      '<div class="section-title" style="margin-top:6px">Sections to include</div>' +
        chk('overview', 'Project overview') + chk('hazard', 'Hazard profile') + chk('measures', 'Adaptation measures') +
        chk('eligibility', 'Eligibility trail') + chk('dnsh', 'DNSH questionnaire') + chk('repro', 'Reproducibility hash') + chk('citations', 'Methodology citations appendix') +
      '<div class="field" style="margin-top:14px"><label>Distribution</label><select class="select" id="genDist"><option value="internal">Bank internal</option><option value="external">External (with attribution appendix)</option></select></div>' +
      '<div class="section-title">Output formats</div><div class="row wrapf" style="gap:6px">' +
        ['PDF', 'JSON', 'CSV', 'XLSX'].map(function (x) { return '<span class="chip neutral">' + x + '</span>'; }).join('') + '</div>' +
      '</div></div>';

    return '<div class="layout-rail"><div class="stack">' + cards + '</div><div>' + rail + '</div></div>';
  }
  function wire6(root, d) {
    root.querySelectorAll('[data-sec]').forEach(function (c) { c.addEventListener('change', function () { d.gen.sections[c.getAttribute('data-sec')] = c.checked; }); });
    const t = root.querySelector('#genTitle'); if (t) t.addEventListener('input', function () { d.gen.title = t.value; });
    const dist = root.querySelector('#genDist'); if (dist) dist.addEventListener('change', function () { d.gen.distribution = dist.value; });
    const gen = root.querySelector('#generateBtn');
    if (gen) gen.addEventListener('click', function () {
      const elig = App.eligibilityOutcome();
      if (!d.name || !d.districtId) { UI.toast('Add a project name and location first', 'warn'); return; }
      UI.modal({ title: 'Generate screening?', body: 'This commits the screening, pins <span class="mono">cre@1.0</span> and <span class="mono">thinkhazard@2026-03-18</span>, computes the inputs hash and persists the PDF, JSON, CSV and XLSX artefacts. The record becomes Completed.', ok: 'Generate & commit', onOk: function () {
        UI.toast('Screening generated · artefacts persisted', 'ok');
        global.Router.go('#/screenings/SCR-2026-0041-A/output');
      } });
    });
  }

  /* ----- 11 Output preview ----------------------------------------------- */
  Pages.output = function (p) {
    const s = (p && p.id) ? DB.screening(p.id) : null;
    const sc = s || DB.screening('SCR-2026-0041-A');
    const dist = DB.district(sc.district_id);
    const profile = dist.hazards;
    const highMeasures = sc.applied.map(function (id) { return DB.measure(id); }).filter(function (m) { return m && m.loe === 'High'; });

    const toolbar = '<div class="doc-toolbar"><div><div class="strong">' + esc(sc.screening_id) + '</div>' +
      '<div class="meta">Generated ' + esc(sc.committed_at || '2026-04-08') + ' 10:14 IST · committed artefact</div></div>' +
      '<div class="topbar-spacer" style="flex:1"></div>' +
      '<a class="btn btn-sm" href="#/projects/' + sc.project_id + '">' + UI.icon('back') + ' Project</a>' +
      '<button class="btn btn-sm" data-toast="PDF downloaded">' + UI.icon('download') + ' PDF</button>' +
      '<button class="btn btn-sm" data-toast="JSON downloaded">JSON</button>' +
      '<button class="btn btn-sm" data-toast="CSV downloaded">CSV</button>' +
      '<button class="btn btn-sm" data-toast="XLSX downloaded">XLSX</button>' +
      '<button class="btn btn-sm btn-primary" data-toast="Sent to LOS integration">' + UI.icon('external') + ' Send to LOS</button></div>';

    const hazTable = '<table class="doc-tbl"><thead><tr><th>Hazard</th><th>Intensity</th></tr></thead><tbody>' +
      DB.HAZARDS.map(function (h) { return '<tr><td>' + esc(h) + '</td><td>' + esc(profile[h]) + '</td></tr>'; }).join('') + '</tbody></table>';
    const measTable = '<table class="doc-tbl"><thead><tr><th>ID</th><th>Hazard</th><th>Measure</th><th>LoE</th></tr></thead><tbody>' +
      (highMeasures.slice(0, 8).map(function (m) { return '<tr><td>' + esc(m.id) + '</td><td>' + esc(m.hazard) + '</td><td>' + esc(m.text.slice(0, 90)) + (m.text.length > 90 ? '…' : '') + '</td><td>' + esc(m.loe) + '</td></tr>'; }).join('') || '<tr><td colspan="4">See Appendix A.</td></tr>') +
      '</tbody></table>';
    const elig = sc.eligibility === 'Eligible';
    const dnshTable = '<table class="doc-tbl"><thead><tr><th>#</th><th>Question</th><th>Response</th></tr></thead><tbody>' +
      DB.DNSH_QUESTIONS.map(function (q) { let r = q.harm ? 'No' : 'Yes'; if (sc.dnsh === 'Flagged' && q.n === 7) r = 'Yes'; return '<tr><td>' + q.n + '</td><td>' + esc(q.text.slice(0, 80)) + '…</td><td>' + r + '</td></tr>'; }).join('') + '</tbody></table>';

    const doc = '<div class="doc-frame"><div class="a4">' +
      '<div class="doc-cover"><div class="doc-kicker">Adaptation Finance Screening Report</div>' +
        '<div class="doc-title">' + esc(sc.name) + '</div>' +
        '<div class="doc-sub">Climate adaptation eligibility & safeguards assessment under the MDB/IDFC Joint Principles</div>' +
        '<div class="doc-idblock">' +
          dpair('Bank / DFI', sc.bank) + dpair('Sub-sector', sc.sub_sector) +
          dpair('District', dist.name + ', ' + dist.state) + dpair('Date screened', sc.committed_at || '2026-04-08') +
          dpair('Screening ID', sc.screening_id) + dpair('Methodology', sc.methodology_version) +
          dpair('Hazard snapshot', sc.hazard_snapshot) + dpair('Determination', sc.eligibility + ' · ' + sc.typology) +
        '</div>' +
        '<div class="doc-cobrand"><img src="assets/logos/eyekyam.png" alt="Eyekyam"><span class="div"></span><img src="assets/logos/auctusesg.png" alt="auctusESG"></div>' +
      '</div>' +
      docsec('1', 'Project overview') + '<p class="doc-p">' + esc(sc.objective) + '</p><p class="doc-p"><strong>Ecosystem context.</strong> ' + esc(sc.ecosystem) + '</p>' +
      docsec('2', 'Climate hazard profile') + hazTable + '<p class="doc-attrib">Source: ThinkHazard! district-level ratings, snapshotted ' + esc(dist ? DB.SNAPSHOT.snapshotted_at : '') + '. Snapshot pinned to this screening: <span class="doc-hash">' + esc(sc.hazard_snapshot) + '</span>.</p>' +
      docsec('3', 'Adaptation measures applied') + '<p class="doc-p">' + sc.applied.length + ' measures applied of ' + sc.recommended.length + ' recommended. High level-of-effort measures shown; full list in Appendix A.</p>' + measTable +
      docsec('4', 'Eligibility determination') + '<p class="doc-p">Under the MDB/IDFC 3-step logic, the project is <strong>' + esc(sc.eligibility) + '</strong>' + (elig ? ', classified <strong>' + esc(sc.typology) + '</strong> (' + esc(DB.TYPOLOGY_SHORT[sc.typology]) + ').' : '.') + ' Step 1 (context): ' + (elig ? 'Pass' : 'Pass') + ' · Step 2 (intent): ' + (elig ? 'Pass' : 'Pass') + ' · Step 3 (adequacy): ' + (elig ? 'Pass' : 'Fail') + '.</p>' +
      docsec('5', 'DNSH & Maladaptation compliance') + '<p class="doc-p">Status: <strong>' + esc(sc.dnsh) + '</strong>. ' + (sc.dnsh === 'Flagged' ? 'A harm-risk response was flagged and requires reviewer sign-off.' : 'All responses are in the desired direction.') + '</p>' + dnshTable +
      docsec('6', 'Reproducibility & attribution') +
        '<table class="doc-tbl"><tbody>' +
          '<tr><th style="width:38%">Methodology version</th><td class="doc-hash">' + esc(sc.methodology_version) + '</td></tr>' +
          '<tr><th>Hazard source</th><td>ThinkHazard! · <span class="doc-hash">' + esc(sc.hazard_snapshot) + '</span></td></tr>' +
          '<tr><th>District reference</th><td class="doc-hash">' + esc(dist.id) + '</td></tr>' +
          '<tr><th>Inputs hash</th><td class="doc-hash">' + esc(sc.inputs_hash) + '</td></tr>' +
        '</tbody></table>' +
        '<p class="doc-attrib">Data sources: ThinkHazard!, MDB/IDFC Joint Principles, EU Taxonomy (DNSH), IPCC AR6 (Maladaptation). ' +
          'This report can be regenerated bit-identically from the pinned version and snapshot above.</p>' +
      '<div class="doc-foot"><span>' + esc(sc.project_id) + ' · Page 1 of 1 (preview)</span><span>AdaptFi v1.0 · Confidential</span></div>' +
      '</div></div>';

    const body = toolbar + doc;
    return UI.page('projects', [{ label: 'Home', href: '#/dashboard' }, { label: 'Projects', href: '#/projects' },
      { label: sc.name, href: '#/projects/' + sc.project_id }, { label: 'Output' }], body);
  };
  function docsec(n, t) { return '<h2 class="doc-sec"><span class="nn">' + n + '</span>' + esc(t) + '</h2>'; }
  function dpair(l, v) { return '<div><span class="l">' + esc(l) + '</span><br><span class="v">' + esc(v) + '</span></div>'; }

  /* ----- helpers --------------------------------------------------------- */
  function needDistrict() {
    return '<div class="card pad"><div class="empty"><div class="ei">' + UI.icon('map') + '</div>Select a location first.<br>' +
      '<a class="btn btn-primary" style="margin-top:14px" href="#/new/2">Go to Step 2 — Location</a></div></div>';
  }
  function nfield(label, path, val) {
    return '<div class="field"><label>' + esc(label) + '</label><textarea class="textarea" data-bind="' + path + '">' + esc(val || '') + '</textarea></div>';
  }
  function setPath(obj, path, val) { const parts = path.split('.'); let o = obj; for (let i = 0; i < parts.length - 1; i++) { o = o[parts[i]] = o[parts[i]] || {}; } o[parts[parts.length - 1]] = val; }
  function set(root, sel, html, isHtml) { const el = root.querySelector(sel); if (el) { if (isHtml) el.innerHTML = html; else el.textContent = html; } }
  function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }
  function uniq(a) { const o = {}, r = []; a.forEach(function (x) { if (x && !o[x]) { o[x] = 1; r.push(x); } }); return r; }
})(window);
