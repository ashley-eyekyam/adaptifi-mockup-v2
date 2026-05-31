/* ============================================================================
   AdaptFi — shared render components used across multiple pages. -> `Comp`
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB, UI = global.UI;
  const esc = UI.esc;

  /* ----- severity helpers ------------------------------------------------ */
  function severity(district) {
    let s = 0;
    DB.HAZARDS.forEach(function (h) {
      const v = district.hazards[h];
      s += v === 'High' ? 2 : v === 'Medium' ? 1 : 0;
    });
    return s; // 0..12
  }
  function severityColor(s) {
    if (s >= 7) return '#b2283b';
    if (s >= 5) return '#d9663a';
    if (s >= 3) return '#e0a52e';
    return '#2aada8';
  }
  function intensityColor(v) {
    return v === 'High' ? '#b2283b' : v === 'Medium' ? '#e8b53e' : v === 'Low' ? '#3a9e6b' : '#c2ced4';
  }

  /* ----- schematic India map -------------------------------------------- */
  const INDIA_PATH = 'M33,8 C40,6 50,8 56,14 C60,17 64,16 70,20 C77,24 82,28 80,31 C77,33 70,31 66,33 ' +
    'C62,40 61,48 60,55 C58,66 55,72 52,78 C50,86 48,96 45,108 C44,112 43,113 42,110 ' +
    'C40,100 38,92 36,84 C34,76 31,70 28,62 C24,55 20,52 18,48 C15,44 12,42 13,38 ' +
    'C14,33 20,33 24,31 C27,26 28,20 31,14 C31.5,11 31,9 33,8 Z';

  function mapSilhouette() {
    return '<svg class="india-svg" viewBox="0 0 100 120" preserveAspectRatio="none" ' +
      'style="position:absolute;inset:0;width:100%;height:100%;">' +
      '<path d="' + INDIA_PATH + '" fill="#cfe6e4" stroke="#9cc9c5" stroke-width="0.6" opacity="0.7"/>' +
      '</svg>';
  }
  function mapDots(districts, layer) {
    return districts.map(function (d) {
      let color, size;
      if (!layer || layer === 'aggregate') { const s = severity(d); color = severityColor(s); size = 12 + Math.min(s, 10) * 0.9; }
      else { const v = d.hazards[layer]; color = intensityColor(v); size = v === 'High' ? 18 : v === 'Medium' ? 14 : 11; }
      return '<a class="mapdot" href="#/districts/' + d.id + '" title="' + esc(d.name) + ' · ' + esc(d.state) + '" ' +
        'style="left:' + (d.x * 100) + '%;top:' + (d.y * 100) + '%;width:' + size + 'px;height:' + size + 'px;background:' + color + ';"></a>';
    }).join('');
  }
  function mapPanel(districts, layer) {
    const legend = (!layer || layer === 'aggregate')
      ? ['Higher composite hazard', 'Moderate', 'Lower'].map(function (t, i) {
          const c = [ '#b2283b', '#e0a52e', '#2aada8' ][i];
          return '<div class="lr"><span class="ls" style="background:' + c + '"></span>' + t + '</div>';
        }).join('')
      : ['High', 'Medium', 'Low'].map(function (t) {
          return '<div class="lr"><span class="ls" style="background:' + intensityColor(t) + '"></span>' + t + '</div>';
        }).join('');
    return '<div class="mapwrap"><div class="mapcanvas" id="mapcanvas">' +
      mapSilhouette() +
      '<div id="mapdots">' + mapDots(districts, layer) + '</div>' +
      '<div class="maplegend"><strong style="font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:#6f7f88;">' +
        (layer && layer !== 'aggregate' ? esc(layer) : 'Composite hazard') + '</strong>' + legend + '</div>' +
      '<div class="mapnote">Schematic — polygon-level in production</div>' +
      '</div></div>';
  }

  /* ----- hazard profile grid / table ------------------------------------ */
  function hazardProfileGrid(profile, opts) {
    opts = opts || {};
    return '<div class="grid cols-3">' + DB.HAZARDS.map(function (h) {
      const v = profile[h] || '—';
      return '<div class="card" style="padding:14px;border-left:3px solid ' + DB.HAZARD_COLOR[h] + '">' +
        '<div class="row between"><span class="row" style="gap:8px"><span style="font-size:15px">' + DB.HAZARD_ICON[h] + '</span>' +
          '<span class="strong" style="font-size:12.5px">' + esc(h) + '</span></span>' + UI.intensityPill(v) + '</div>' +
        (opts.desc ? '<p class="meta" style="margin-top:8px;line-height:1.5">' + esc(DB.HAZARD_DESC[h]) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';
  }
  function hazardProfileTable(profile) {
    return '<table class="tbl compact"><tbody>' + DB.HAZARDS.map(function (h) {
      return '<tr><td style="width:30px">' + DB.HAZARD_ICON[h] + '</td><td class="strong">' + esc(h) + '</td>' +
        '<td class="num">' + UI.intensityPill(profile[h] || '—') + '</td></tr>';
    }).join('') + '</tbody></table>';
  }

  /* ----- district tile --------------------------------------------------- */
  function districtTile(d) {
    const pips = DB.HAZARDS.map(function (h) {
      const v = d.hazards[h];
      return '<span class="hzpip" title="' + esc(h) + ': ' + esc(v) + '"><span class="pd" style="background:' + intensityColor(v) + '"></span>' + DB.HAZARD_CODE[h] + '</span>';
    }).join('');
    return '<a class="dtile" href="#/districts/' + d.id + '">' +
      '<div class="dn">' + esc(d.name) + '</div><div class="ds">' + esc(d.state) + ' · ' + esc(d.classification) + '</div>' +
      '<div class="hzrow">' + pips + '</div></a>';
  }

  /* ----- measure card (library) ----------------------------------------- */
  function measureCard(m) {
    return '<a class="measure-card" href="#/library/measure/' + m.id + '">' +
      '<div class="mtop">' + UI.loeChip(m.loe) + UI.hazardChip(m.hazard) +
        '<span class="mid">' + esc(m.id) + '</span></div>' +
      '<div class="mtext">' + esc(m.text) + '</div>' +
      '<div class="mfoot">' + UI.subsectorChip(m.sub_sector) + UI.themeChip(m.theme) +
        '<span class="mlink">Open ' + UI.icon('chevron') + '</span></div></a>';
  }

  /* ----- charts ---------------------------------------------------------- */
  function barChart(items) {
    const max = Math.max.apply(null, items.map(function (i) { return i.value; })) || 1;
    return '<div class="barchart">' + items.map(function (it) {
      const h = Math.round(it.value / max * 100);
      return '<div class="bar"><span class="bv">' + it.value + '</span>' +
        '<div class="col" style="height:' + h + '%"></div><span class="bl">' + esc(it.label) + '</span></div>';
    }).join('') + '</div>';
  }
  function hbar(items) {
    const max = Math.max.apply(null, items.map(function (i) { return i.value; })) || 1;
    return '<div class="hbar">' + items.map(function (it) {
      const w = Math.round(it.value / max * 100);
      return '<div class="hb"><span class="muted nowrap" style="overflow:hidden;text-overflow:ellipsis">' + esc(it.label) + '</span>' +
        '<span class="track"><span class="fill" style="width:' + w + '%"></span></span>' +
        '<span class="strong num">' + it.value + '</span></div>';
    }).join('') + '</div>';
  }

  /* ----- reproducibility block ------------------------------------------ */
  function reproBlock(s) {
    const dist = DB.district(s.district_id);
    return '<div class="deflist">' +
      di('Methodology version', '<span class="mono">' + esc(s.methodology_version) + '</span>') +
      di('Hazard snapshot', '<span class="mono">' + esc(s.hazard_snapshot) + '</span>') +
      di('District reference', '<span class="mono">' + esc(dist ? dist.id : '—') + '</span>') +
      di('Inputs hash', '<span class="mono">' + esc(s.inputs_hash) + '</span>') +
      '</div>';
  }
  function di(k, v) { return '<div class="di"><span class="dk">' + esc(k) + '</span><span class="dv">' + v + '</span></div>'; }

  /* ----- measures-applied table ----------------------------------------- */
  function measuresApplied(s, limit) {
    let ids = s.applied.slice(0, limit || s.applied.length);
    const rows = ids.map(function (id) {
      const m = DB.measure(id); if (!m) return '';
      return '<tr><td>' + UI.hazardChip(m.hazard, true) + '</td>' +
        '<td><a href="#/library/measure/' + m.id + '">' + esc(m.text) + '</a></td>' +
        '<td>' + UI.loeChip(m.loe) + '</td><td class="meta mono">' + esc(m.id) + '</td></tr>';
    }).join('');
    return '<table class="tbl"><thead><tr><th>Hazard</th><th>Measure</th><th>Level of Effort</th><th>ID</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="4" class="muted">No measures applied yet.</td></tr>') + '</tbody></table>';
  }

  global.Comp = {
    severity, severityColor, intensityColor,
    mapPanel, mapDots, mapSilhouette,
    hazardProfileGrid, hazardProfileTable, districtTile, measureCard,
    barChart, hbar, reproBlock, di, measuresApplied
  };
})(window);
