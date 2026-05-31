/* ============================================================================
   AdaptFi — Application state & the draft-screening model.
   Holds in-memory state for the wizard and the list/library filters so the
   prototype behaves like a real workbench within a session. Exposed as `App`.
   ========================================================================== */
(function (global) {
  'use strict';
  const DB = global.DB;

  function blankDraft() {
    return {
      id: 'PRJ-2026-00DRAFT',
      screeningId: 'SCR-2026-00DRAFT',
      name: '',
      sector: 'Commercial Real Estate',
      subSector: 'Data Centres',
      objective: '',
      ecosystem: '',
      typology: 'Type 2',
      districtId: '',
      overrides: {},               // hazard -> { value, reason }
      narratives: { sector: '', context: '', exposure: '', impacts: '' },
      measures: {},                // measureId -> { status, reason, note }
      measureNarratives: {},       // hazard -> free text
      eligibility: {},             // "1.0","1.1","2.0"... -> "Yes"/"No"
      dnsh: {},                    // n -> { response, justification }
      gen: {
        title: '', sections: {
          overview: true, hazard: true, measures: true, eligibility: true,
          dnsh: true, repro: true, citations: false
        }, distribution: 'internal'
      },
      maxStep: 1
    };
  }

  const App = {
    draft: blankDraft(),
    // list / library filter state
    filters: {
      projects: { q: '', subSector: '', state: '', eligibility: '', status: '' },
      library: { q: '', subSector: '', hazard: '', loe: '', theme: '', view: 'cards' }
    },

    resetDraft: function () { this.draft = blankDraft(); },

    // Seed the draft from a representative example (used by "open the example").
    seedExample: function () {
      const d = blankDraft();
      d.name = 'Powai Hyperscale Data Campus';
      d.subSector = 'Data Centres';
      d.objective = 'Finance a Tier-IV hyperscale data centre with climate-resilient cooling and flood protection serving the western India cloud region.';
      d.ecosystem = 'Reclaimed urban land adjacent to the Powai lake catchment; no protected habitat on site.';
      d.typology = 'Type 2';
      d.districtId = 'IND-27-MUM-0001';
      d.maxStep = 1;
      this.draft = d;
      return d;
    },

    // Effective hazard profile for the draft's district, applying overrides.
    draftProfile: function () {
      const d = this.draft;
      const dist = DB.district(d.districtId);
      if (!dist) return {};
      const prof = {};
      DB.HAZARDS.forEach(function (h) {
        prof[h] = (d.overrides[h] && d.overrides[h].value) ? d.overrides[h].value : dist.hazards[h];
      });
      return prof;
    },

    // Recommended measures for the current draft.
    draftRecommended: function () {
      const d = this.draft;
      if (!d.subSector || !d.districtId) return [];
      return DB.measuresForProfile(d.subSector, this.draftProfile());
    },

    measureStatusCounts: function () {
      const rec = this.draftRecommended();
      const d = this.draft;
      let applied = 0, deferred = 0, na = 0;
      rec.forEach(function (m) {
        const s = (d.measures[m.id] && d.measures[m.id].status) || '';
        if (s === 'applied') applied++;
        else if (s === 'deferred') deferred++;
        else if (s === 'na') na++;
      });
      return { recommended: rec.length, applied: applied, deferred: deferred, na: na };
    },

    // Eligibility rollups from the recorded yes/no answers.
    eligibilityOutcome: function () {
      const e = this.draft.eligibility;
      function yes(k) { return e[k] === 'Yes'; }
      const s1 = yes('1.0') && yes('1.1');
      const s2 = yes('2.0') && yes('2.1');
      // step 3: measures address risks AND (no risks unaddressed OR plan exists)
      const s3 = yes('3.0') && (e['3.1'] === 'No' || yes('3.2'));
      const answeredCore = ['1.0','1.1','2.0','2.1','3.0','3.1'].every(function (k) { return e[k]; });
      const outcome = (s1 && s2 && s3) ? 'Eligible' : 'Not Eligible';
      return { s1: s1, s2: s2, s3: s3, outcome: outcome, complete: answeredCore };
    },

    dnshOutcome: function () {
      const ans = this.draft.dnsh;
      let flagged = false, answered = 0;
      DB.DNSH_QUESTIONS.forEach(function (q) {
        const r = ans[q.n] && ans[q.n].response;
        if (r) answered++;
        if (q.harm && r === 'Yes') flagged = true;       // harm-risk answered Yes -> flag
        if (!q.harm && r === 'No') flagged = true;        // positive commitment answered No -> flag
      });
      return { outcome: flagged ? 'Flagged' : 'Compliant', flagged: flagged, answered: answered, total: DB.DNSH_QUESTIONS.length };
    }
  };

  global.App = App;
})(window);
