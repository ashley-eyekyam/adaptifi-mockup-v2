/* ============================================================================
   AdaptFi — UI primitives: icons, chips, shell (topbar/subnav/crumbs/footer),
   toasts and modals. Everything attaches to the global `UI`.
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB;

  /* ----- tiny helpers ---------------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function slug(s) { return DB.HAZARD_SLUG[s] || DB.SUBSECTOR_SLUG[s] || String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  /* ----- icons (inline stroke SVG) -------------------------------------- */
  const I = {
    home:'M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5',
    projects:'M4 5h16v4H4zM4 11h16v8H4z',
    plus:'M12 5v14M5 12h14',
    library:'M5 4h5v16H5zM12 4h3v16h-3zM17 5l3 .5-2 15-3-.5z',
    map:'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
    admin:'M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3z',
    search:'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3',
    download:'M12 3v12m0 0 4-4m-4 4-4-4M4 21h16',
    external:'M14 4h6v6M20 4l-9 9M18 14v5H5V6h5',
    chevron:'M9 6l6 6-6 6',
    chevdown:'M6 9l6 6 6-6',
    back:'M15 6l-6 6 6 6',
    check:'M5 12l4.5 4.5L19 7',
    edit:'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    copy:'M9 9h11v11H9zM5 15H4V4h11v1',
    filter:'M4 5h16l-6 8v6l-4-2v-4z',
    refresh:'M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M18 4v5h-5M6 20v-5h5',
    upload:'M12 21V9m0 0 4 4m-4-4-4 4M4 3h16',
    bell:'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
    spark:'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
    doc:'M6 3h8l4 4v14H6zM14 3v4h4',
    grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
    gear:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12l2 1-2 4-2-1a7 7 0 0 1-2 1l-.5 2h-5L7 19a7 7 0 0 1-2-1l-2 1-2-4 2-1a7 7 0 0 1 0-2l-2-1 2-4 2 1a7 7 0 0 1 2-1l.5-2h5L13 5a7 7 0 0 1 2 1l2-1 2 4-2 1a7 7 0 0 1 0 2z',
    info:'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z',
    flag:'M5 21V4M5 4h11l-2 4 2 4H5'
  };
  function icon(name, cls) {
    const d = I[name] || '';
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  /* ----- chips ----------------------------------------------------------- */
  function hazardChip(h, soft) {
    if (soft) return '<span class="chip hz-soft"><span class="dot" style="background:' + DB.HAZARD_COLOR[h] + '"></span>' + esc(h) + '</span>';
    return '<span class="chip hz hz-' + DB.HAZARD_SLUG[h] + '">' + esc(h) + '</span>';
  }
  function loeChip(l) { return '<span class="chip loe-' + esc(l) + '">' + esc(l) + ' LoE</span>'; }
  function themeChip(t) {
    const short = /operations/i.test(t) ? 'O&amp;M' : 'Build / Retrofit';
    return '<span class="chip neutral" title="' + esc(t) + '">' + short + '</span>';
  }
  function subsectorChip(s) { return '<span class="chip neutral">' + esc(s) + '</span>'; }
  function statusChip(s) {
    const m = { 'Draft':'neutral', 'Review':'warn', 'Completed':'ok', 'Archived':'neutral' };
    return '<span class="chip ' + (m[s] || 'neutral') + '"><span class="dot"></span>' + esc(s) + '</span>';
  }
  function eligibilityChip(e) {
    return e === 'Eligible'
      ? '<span class="chip ok"><span class="dot"></span>Eligible</span>'
      : '<span class="chip bad"><span class="dot"></span>Not Eligible</span>';
  }
  function dnshChip(d) {
    return d === 'Compliant'
      ? '<span class="chip ok"><span class="dot"></span>Compliant</span>'
      : '<span class="chip bad"><span class="dot"></span>Flagged</span>';
  }
  function typologyChip(t) { return '<span class="chip info">' + esc(t) + '</span>'; }
  function intensityPill(v) {
    const cls = (v === 'High' || v === 'Medium' || v === 'Low') ? v : 'none';
    return '<span class="pill ' + cls + '">' + esc(v || '—') + '</span>';
  }
  function intensityPillSm(v) {
    const cls = (v === 'High' || v === 'Medium' || v === 'Low') ? v : 'none';
    return '<span class="pill sm ' + cls + '">' + esc(v || '—') + '</span>';
  }

  /* ----- stat ------------------------------------------------------------ */
  function stat(k, v, d, variant) {
    return '<div class="stat ' + (variant || '') + '">' +
      '<div class="k">' + esc(k) + '</div><div class="v">' + v + '</div>' +
      (d ? '<div class="d">' + d + '</div>' : '') + '</div>';
  }

  /* ----- shell ----------------------------------------------------------- */
  const NAV = [
    { key:'dashboard', label:'Home', icon:'home', href:'#/dashboard' },
    { key:'projects', label:'Projects', icon:'projects', href:'#/projects' },
    { key:'new', label:'New Screening', icon:'plus', href:'#/new' },
    { key:'library', label:'Measures Library', icon:'library', href:'#/library' },
    { key:'districts', label:'District Explorer', icon:'map', href:'#/districts' }
  ];
  function topbar() {
    const u = DB.CURRENT_USER;
    return '<header class="topbar"><div class="topbar-inner">' +
      '<a class="brand" href="#/dashboard"><span class="mark">Af</span>' +
        '<span><span class="wm">AdaptFi</span><br><span class="desc">Adaptation Finance Platform</span></span></a>' +
      '<div class="topbar-spacer"></div>' +
      '<div class="cobrand"><span class="colabel">A collaboration by</span>' +
        '<span class="logochip"><img src="assets/logos/eyekyam.png" alt="Eyekyam Risk Resolutions"></span>' +
        '<span class="logochip"><img src="assets/logos/auctusesg.png" alt="auctusESG"></span>' +
      '</div>' +
      '<a class="ghostlink" href="#/" title="Mockup catalogue">' + icon('grid') + 'Catalogue</a>' +
      '<div class="userbox"><span><span class="uname">' + esc(u.name) + '</span><br>' +
        '<span class="urole">' + esc(u.role) + ' · ' + esc(u.org) + '</span></span>' +
        '<a class="uava" href="#/settings" title="Settings">' + esc(u.initials) + '</a></div>' +
      '</div></header>';
  }
  function subnav(activeKey) {
    let html = '<nav class="subnav"><div class="subnav-inner">';
    NAV.forEach(function (n) {
      html += '<a class="navlink ' + (n.key === activeKey ? 'active' : '') + '" href="' + n.href + '">' +
        icon(n.icon) + n.label + '</a>';
    });
    html += '<a class="navlink admin ' + (activeKey === 'admin' ? 'active' : '') + '" href="#/admin">' +
      icon('admin') + 'Admin</a>';
    html += '</div></nav>';
    return html;
  }
  function crumbs(parts) {
    let html = '<div class="crumbs">';
    parts.forEach(function (p, i) {
      const last = i === parts.length - 1;
      if (last) html += '<span class="cur">' + esc(p.label) + '</span>';
      else html += '<a href="' + p.href + '">' + esc(p.label) + '</a><span class="sep">' + icon('chevron') + '</span>';
    });
    return html + '</div>';
  }
  function footer() {
    return '<footer class="footer"><div class="footer-inner">' +
      '<span class="ver">AdaptFi v1.0 · Methodology cre@1.0</span>' +
      '<span class="fcobrand"><img src="assets/logos/eyekyam.png" alt="Eyekyam"><span class="div"></span>' +
        '<img src="assets/logos/auctusesg.png" alt="auctusESG"></span>' +
      '<span class="conf"><span class="dot"></span>Confidential — illustrative prototype</span>' +
      '</div></footer>';
  }
  // Compose a standard signed-in page: topbar + subnav + crumbs + main + footer
  function page(activeKey, crumbParts, bodyHtml) {
    return '<div class="app">' + topbar() + subnav(activeKey) +
      (crumbParts ? crumbs(crumbParts) : '') +
      '<main class="main"><div class="wrap view-enter">' + bodyHtml + '</div></main>' +
      footer() + '</div>';
  }

  /* ----- toast & modal --------------------------------------------------- */
  function toast(msg, variant) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + (variant || '');
    t.innerHTML = '<span class="tdot"></span><span>' + esc(msg) + '</span>';
    wrap.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = '.3s';
      setTimeout(function () { t.remove(); }, 320); }, 2600);
  }
  function modal(opts) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' +
      '<div class="mh">' + esc(opts.title) + '</div>' +
      '<div class="mb">' + (opts.body || '') + '</div>' +
      '<div class="mf">' +
        '<button class="btn" data-close>' + esc(opts.cancel || 'Cancel') + '</button>' +
        '<button class="btn btn-primary" data-ok>' + esc(opts.ok || 'Confirm') + '</button>' +
      '</div></div>';
    function close() { back.remove(); }
    back.addEventListener('click', function (e) {
      if (e.target === back || e.target.closest('[data-close]')) close();
      if (e.target.closest('[data-ok]')) { close(); if (opts.onOk) opts.onOk(); }
    });
    document.body.appendChild(back);
  }

  global.UI = {
    esc, slug, icon, I,
    hazardChip, loeChip, themeChip, subsectorChip, statusChip, eligibilityChip, dnshChip, typologyChip,
    intensityPill, intensityPillSm, stat,
    topbar, subnav, crumbs, footer, page, toast, modal
  };
})(window);
