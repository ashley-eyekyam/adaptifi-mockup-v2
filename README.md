# AdaptFi — Interactive Mock-up (v2)

A **fully-wired**, clickable prototype of the **AdaptFi** adaptation-finance screening
platform, built in plain HTML, CSS and JavaScript from
`docs/AdaptFi_Product_Design_Document.md`.

A collaboration between **Eyekyam Risk Resolutions** and **auctusESG**.

> Illustrative prototype. All projects, banks, users, dates and hashes are
> fictional. The 111 adaptation measures are the **real auctusESG Commercial
> Real Estate methodology (cre@1.0)**, derived from the project Excel model.

---

## How to open

Just open `index.html` in any modern browser — **no build step, no server**.

```
mockups/AdaptFi_Mockup_v2/index.html
```

It runs entirely from the `file://` protocol (all data is inlined as JS; there
are no `fetch()` calls). Web fonts load from Google Fonts when online and fall
back gracefully to system fonts (Inter → system-ui, Source Serif → Georgia,
JetBrains Mono → Consolas) when offline.

Start at the **Catalogue** (the landing page) for an index of all 25 surfaces,
or click **“Enter the prototype”** to begin at the sign-in screen.

---

## What’s wired

This is a single-page application with a hash router — navigation, filtering and
the screening flow genuinely work:

- **Dashboard** — live stats derived from the seed data, alerts, quick links.
- **Projects list** — live search + filter by sub-sector / state / eligibility / status.
- **Project detail** — working tab bar (Summary · Climate risk · Measures · Eligibility · DNSH · Audit trail).
- **New Screening wizard (6 steps)** — carries state across steps:
  - Step 1 selects sub-sector & typology; Step 2 picks a district by dropdown **or map**;
  - Step 2 auto-populates the hazard profile; Step 3 overrides toggle the justification field;
  - Step 4 Apply/Defer/N-A buttons update the **live summary counts**;
  - Step 5 computes the **MDB/IDFC eligibility determination** and the **DNSH flag** in real time;
  - Step 6 commits and routes to the output preview.
- **Measures Library** — faceted filters (sub-sector / hazard / LoE / theme) with live counts, card & table views, per-measure detail pages with their own URL.
- **District Explorer** — schematic India map with a switchable hazard heatmap layer; clickable district tiles & detail pages.
- **Admin console** — methodology editor (with draft diff highlighting), hazard dataset manager, version & release (with publish confirmation), users & orgs, usage analytics (charts + override-signal feedback loop).
- **Output preview** — credit-memo-grade A4 document (serif body), six sections + reproducibility block, co-branded cover.
- **Settings & About**.

Every measure reference, district and sub-sector is a real cross-link.

---

## Fidelity to the design document

- 25 surfaces, matching the Appendix B inventory.
- 111 measures — distribution matches the document exactly: Data Centres 27,
  Commercial Buildings 28, Warehouses 20, Hospitals/Healthcare 36; hazards
  32/17/17/16/16/13; LoE High 45 / Medium 51 / Low 8 / Unspecified 7.
- Design system: teal palette (`#2AADA8` / `#1A7070` / `#47C4BE`), `#0E1C26` ink,
  Inter UI / Source Serif document / JetBrains Mono IDs, 8-pt spacing, 1320px max width.
- MDB/IDFC 3-step eligibility logic and the 7-question DNSH questionnaire are
  implemented per Sections 11–12.

---

## File layout

```
index.html                 Shell: fonts, styles, script order, #root
assets/
  css/app.css              Design system + every component & page style
  logos/                   eyekyam.png · auctusesg.png
  js/
    measures.js            window.RAW_MEASURES — the 111 real measures (loads first)
    data.js                DB.* — vocabularies, districts, screenings, orgs, analytics
    ui.js                  UI.* — icons, chips, shell (topbar/subnav/crumbs/footer), toast, modal
    store.js               App.* — wizard draft state + eligibility/DNSH derivations
    components.js          Comp.* — map, hazard grid, measure card, charts, tables
    pages-core.js          catalogue, sign-in, dashboard, 404
    pages-projects.js      projects list, project detail
    pages-library.js       library overview, measure / sub-sector / hazard views
    pages-districts.js     district explorer, district detail
    pages-admin.js         admin home + 5 admin tools
    pages-wizard.js        6-step wizard + output preview
    pages-misc.js          settings, about
    router.js              hash router (#/path → Pages.*)
    app.js                 bootstrap + global click delegation
```

To regenerate `measures.js` from the source Excel-derived JSON, see
`AdaptFi_Mockup_v1/assets/measures.json` (the upstream measures data).
