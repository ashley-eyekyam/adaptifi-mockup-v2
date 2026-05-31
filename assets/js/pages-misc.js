/* ============================================================================
   AdaptFi — pages: Settings (24) and About (25).
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI;
  const esc = UI.esc;
  const Pages = global.Pages = global.Pages || {};

  /* ----- 24 Settings ----------------------------------------------------- */
  Pages.settings = function () {
    function tog(label, on) {
      return '<label class="row between" style="padding:9px 0;border-bottom:1px dashed var(--n-200)"><span style="font-size:12.5px">' + esc(label) + '</span>' +
        '<span class="toggle"><input type="checkbox"' + (on ? ' checked' : '') + '><span class="tk"></span></span></label>';
    }
    const profile = '<div class="card"><div class="card-head"><h3>Profile</h3></div><div class="card-body">' +
      '<div class="grid cols-2">' +
        f('Full name', '<input class="input" value="Ananya Rao">') + f('Email', '<input class="input" value="a.rao@meridianbank.example">') +
        f('Phone', '<input class="input" value="+91 98765 43210">') + f('Timezone', sel(['Asia/Kolkata (IST)', 'UTC', 'Europe/London'])) +
      '</div><button class="btn btn-primary" data-toast="Profile saved">Save profile</button></div></div>';

    const notif = '<div class="card"><div class="card-head"><h3>Notifications</h3></div><div class="card-body">' +
      tog('Hazard reclassification in my districts', true) + tog('Methodology version published', true) +
      tog('Screening sent back for revision', true) + tog('DNSH flag raised on my screening', true) + tog('Weekly usage digest', false) +
      '<div class="row" style="gap:14px;margin-top:14px"><label class="row" style="gap:8px;font-size:12.5px"><input type="radio" name="ch" checked> Email</label>' +
        '<label class="row" style="gap:8px;font-size:12.5px"><input type="radio" name="ch"> In-app only</label></div></div></div>';

    const apikeys = '<div class="card"><div class="card-head"><h3>API keys</h3><span class="meta">For LOS integration</span></div><div class="card-body">' +
      '<div class="row between" style="padding:12px;background:var(--n-50);border:1px solid var(--n-200);border-radius:var(--r)">' +
        '<div><div class="strong" style="font-size:12.5px">Primary key</div><div class="mono meta">adfi_live_••••••••••••3a7e</div></div>' +
        '<div class="row" style="gap:8px"><button class="btn btn-sm" data-toast="Key rotated">' + UI.icon('refresh') + ' Rotate</button>' +
          '<button class="btn btn-sm btn-danger" data-toast="Key revoked">Revoke</button></div></div>' +
      '<p class="meta" style="margin-top:10px">Keys are scoped to your organisation. Rate-limited per key.</p></div></div>';

    const exportPrefs = '<div class="card"><div class="card-head"><h3>Export preferences</h3></div><div class="card-body"><div class="grid cols-2">' +
      f('PDF paper size', sel(['A4', 'US Letter'])) + f('JSON schema version', sel(['v0.1', 'v0.2 (beta)'])) +
      f('Methodology appendix', sel(['Include', 'Omit'])) + f('Filename template', '<input class="input mono" value="{screening_id}_{date}">') +
      '</div></div></div>';

    const security = '<div class="card"><div class="card-head"><h3>Security</h3></div><div class="card-body"><div class="deflist">' +
      '<div class="di"><span class="dk">Two-factor authentication</span><span class="dv"><span class="chip ok">Enabled (TOTP)</span></span></div>' +
      '<div class="di"><span class="dk">Last sign-in</span><span class="dv">2026-04-08 09:02 · Mumbai</span></div>' +
      '<div class="di"><span class="dk">Session timeout</span><span class="dv">30 minutes</span></div></div>' +
      '<button class="btn btn-sm" style="margin-top:12px" data-toast="2FA reset flow started">Reconfigure 2FA</button></div></div>';

    const danger = '<div class="card" style="border-color:#eccfd3"><div class="card-head" style="border-color:#f3dde0"><h3 style="color:var(--bad)">Danger zone</h3></div>' +
      '<div class="card-body"><div class="row between"><span style="font-size:12.5px">Delete account and revoke all access. This cannot be undone.</span>' +
        '<button class="btn btn-danger" id="delAcct">Delete account</button></div></div></div>';

    const body =
      '<div class="pagehead"><div class="lead"><div class="eyebrow">Account</div><h1>Settings</h1>' +
        '<p class="sub">Profile, notifications, integration keys, export preferences and security.</p></div></div>' +
      '<div class="grid cols-2" style="align-items:start">' +
        '<div class="stack">' + profile + apikeys + security + '</div>' +
        '<div class="stack">' + notif + exportPrefs + danger + '</div>' +
      '</div>';

    return { html: UI.page(null, [{ label: 'Home', href: '#/dashboard' }, { label: 'Settings' }], body),
      onMount: function (root) {
        root.querySelector('#delAcct').addEventListener('click', function () {
          UI.modal({ title: 'Delete account?', body: 'This permanently revokes your access and cannot be undone. Screenings owned by your organisation are retained.', ok: 'Delete account', onOk: function () { UI.toast('Account deletion requested', 'warn'); } });
        });
      }};
  };
  function f(label, inner) { return '<div class="field"><label>' + esc(label) + '</label>' + inner + '</div>'; }
  function sel(opts) { return '<select class="select">' + opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>'; }

  /* ----- 25 About -------------------------------------------------------- */
  Pages.about = function () {
    const sources = DB.DATA_SOURCES.map(function (s) {
      return '<div class="card" style="padding:14px"><div class="strong">' + esc(s.name) + '</div>' +
        '<div class="meta" style="margin-top:4px">' + esc(s.use) + '</div>' +
        '<div class="mono meta" style="margin-top:8px">' + esc(s.url) + '</div></div>';
    }).join('');

    const body =
      '<div class="cat-hero" style="padding:36px 40px;margin-bottom:24px"><div class="glow"></div><div class="inner">' +
        '<div class="eyebrow" style="color:var(--primary-light)">About</div>' +
        '<h1 style="font-size:28px">AdaptFi</h1>' +
        '<p>AdaptFi is a web-based adaptation finance screening platform. It assesses a project&rsquo;s eligibility as adaptation ' +
        'finance under the MDB/IDFC Joint Principles, applies an expert-authored library of 111 adaptation measures, runs DNSH and ' +
        'Maladaptation safeguards, and produces an audit-ready, reproducible screening report for a credit file.</p>' +
        '<div class="partners" style="margin-top:24px"><span class="pl">A collaboration by</span>' +
          '<span class="logochip"><img src="assets/logos/eyekyam.png" alt="Eyekyam Risk Resolutions"></span>' +
          '<span class="logochip"><img src="assets/logos/auctusesg.png" alt="auctusESG"></span></div>' +
      '</div></div>' +
      '<div class="layout-rail"><div class="stack">' +
        '<div class="card pad"><div class="section-title" style="margin-top:0">What it does</div>' +
          '<p style="line-height:1.7;font-size:13.5px">AdaptFi does three things at once, each to production quality: it runs structured ' +
          'screenings against a rigorous adaptation finance framework; it presents the adaptation measures library as a first-class, ' +
          'browseable knowledge asset; and it provides an administration console so the methodology, hazard data, eligibility framework ' +
          'and DNSH questionnaire can be curated without engineering involvement. Every screening is reproducible indefinitely — pinned to ' +
          'a methodology version and a hazard snapshot.</p></div>' +
        '<div class="card pad"><div class="section-title" style="margin-top:0">Data sources &amp; attribution</div>' +
          '<div class="grid cols-3">' + sources + '</div>' +
          '<p class="meta" style="margin-top:14px">District hazard ratings are sourced from ThinkHazard! and snapshotted per screening. ' +
          'All projects, banks, users and hashes in this prototype are fictional.</p></div>' +
      '</div><div class="stack">' +
        '<div class="card"><div class="card-head"><h3>Contact</h3></div><div class="card-body"><div class="deflist">' +
          '<div class="di"><span class="dk">Eyekyam Risk Resolutions</span><span class="dv">ashley@eyekyam.com</span></div>' +
          '<div class="di"><span class="dk">auctusESG</span><span class="dv">info@auctusesg.com</span></div>' +
          '<div class="di"><span class="dk">Product</span><span class="dv">AdaptFi v1.0</span></div>' +
        '</div></div></div>' +
        '<div class="card"><div class="card-head"><h3>Version</h3></div><div class="card-body"><div class="deflist">' +
          '<div class="di"><span class="dk">Application</span><span class="dv mono">v1.0</span></div>' +
          '<div class="di"><span class="dk">Methodology</span><span class="dv mono">cre@1.0</span></div>' +
          '<div class="di"><span class="dk">Hazard snapshot</span><span class="dv mono">thinkhazard@2026-03-18</span></div>' +
        '</div></div></div>' +
      '</div></div>';

    return UI.page(null, [{ label: 'Home', href: '#/dashboard' }, { label: 'About' }], body);
  };
})(window);
