/* ============================================================================
   AdaptFi — bootstrap. Global click delegation (row navigation + toasts) and
   router start.
   ========================================================================== */
(function (global) {
  'use strict';

  // Global click delegation
  document.addEventListener('click', function (e) {
    // data-toast: show a toast, never navigate
    const toastEl = e.target.closest('[data-toast]');
    if (toastEl) {
      e.preventDefault();
      global.UI.toast(toastEl.getAttribute('data-toast'), 'ok');
      return;
    }
    // data-href on non-anchor rows: navigate unless an interactive child was clicked
    const hrefEl = e.target.closest('[data-href]');
    if (hrefEl) {
      if (e.target.closest('a:not([data-href]), button, input, select, textarea')) return;
      const href = hrefEl.getAttribute('data-href');
      if (href) global.Router.go(href);
    }
  });

  function boot() {
    if (!global.DB || !global.DB.MEASURES || !global.DB.MEASURES.length) {
      document.getElementById('root').innerHTML =
        '<div class="wrap"><div class="empty"><div class="ei">⚠</div>Measure data failed to load.<br>' +
        '<span class="meta">Ensure measures.js loads before data.js.</span></div></div>';
      return;
    }
    global.Router.start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
