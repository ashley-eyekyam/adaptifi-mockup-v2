/* ============================================================================
   AdaptFi — Mock data layer
   Adaptation Finance Screening Platform · Eyekyam Risk Resolutions × auctusESG
   ----------------------------------------------------------------------------
   Illustrative seed data for a clickable, fully-wired prototype.
   NOT production data. Projects, banks, users and hashes are fictional.
   The 111 adaptation measures are the real auctusESG CRE methodology, loaded
   from measures.js (window.RAW_MEASURES). Everything is exposed on `DB`.
   No fetch() is used, so the prototype runs from the file:// protocol.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ----- Controlled vocabularies ----------------------------------------- */
  const SUBSECTORS = ['Data Centres', 'Commercial Buildings', 'Warehouses', 'Hospitals/Healthcare'];
  const HAZARDS = ['Extreme Heat', 'Floods', 'Water Scarcity', 'Storm/Cyclone', 'Earthquake/Landslides', 'Wildfire'];
  const LOE = ['High', 'Medium', 'Low', 'Unspecified'];
  const THEMES = ['Construction-Upgradation-Retrofitting', 'Operations & Maintenance'];
  const INTENSITIES = ['Low', 'Medium', 'High'];

  const SUBSECTOR_SLUG = {
    'Data Centres': 'data-centres', 'Commercial Buildings': 'commercial-buildings',
    'Warehouses': 'warehouses', 'Hospitals/Healthcare': 'hospitals-healthcare'
  };
  const SUBSECTOR_CODE = { 'Data Centres': 'DC', 'Commercial Buildings': 'CB', 'Warehouses': 'WH', 'Hospitals/Healthcare': 'HH' };
  const HAZARD_SLUG = {
    'Extreme Heat': 'extreme-heat', 'Floods': 'floods', 'Water Scarcity': 'water-scarcity',
    'Storm/Cyclone': 'storm-cyclone', 'Earthquake/Landslides': 'earthquake-landslides', 'Wildfire': 'wildfire'
  };
  const HAZARD_CODE = {
    'Extreme Heat': 'EH', 'Floods': 'FL', 'Water Scarcity': 'WS',
    'Storm/Cyclone': 'ST', 'Earthquake/Landslides': 'EQ', 'Wildfire': 'WF'
  };
  // Distinct hazard colours (separate from the ok/warn/bad semantic set)
  const HAZARD_COLOR = {
    'Extreme Heat': '#ED7B2F', 'Floods': '#2D74C4', 'Water Scarcity': '#C99A2E',
    'Storm/Cyclone': '#7C5CD6', 'Earthquake/Landslides': '#8A6F3C', 'Wildfire': '#C0392B'
  };
  const HAZARD_ICON = {
    'Extreme Heat': '☀', 'Floods': '🌊', 'Water Scarcity': '💧',
    'Storm/Cyclone': '🌀', 'Earthquake/Landslides': '⛰', 'Wildfire': '🔥'
  };
  const HAZARD_DESC = {
    'Extreme Heat': 'Sustained high temperatures and heat-wave frequency that stress cooling, occupants and equipment.',
    'Floods': 'Riverine, pluvial and coastal inundation that threatens ground-level plant, access and continuity.',
    'Water Scarcity': 'Reduced freshwater availability affecting cooling make-up, sanitation and clinical continuity.',
    'Storm/Cyclone': 'High winds, wind-driven debris and storm surge damaging the envelope and rooftop plant.',
    'Earthquake/Landslides': 'Ground shaking and slope failure damaging structure and non-structural systems.',
    'Wildfire': 'Direct flame, ember attack and smoke ingress affecting envelope, intakes and air quality.'
  };
  const SUBSECTOR_BLURB = {
    'Data Centres': 'Mission-critical IT facilities where cooling continuity and power resilience dominate the adaptation agenda.',
    'Commercial Buildings': 'Offices and mixed-use assets where occupant comfort, envelope performance and water efficiency lead.',
    'Warehouses': 'Long-span logistics and storage assets where structural wind resistance and flood protection are decisive.',
    'Hospitals/Healthcare': 'Life-safety-critical facilities demanding the broadest, highest-assurance adaptation response.'
  };
  // Hazard indicators (auctusESG methodology, Annexure 1) and source references (Annexure 2).
  const HAZARD_INDICATORS = {
    'Extreme Heat': 'Heat index · cooling degree days · days above 35–40°C · land-surface & wet-bulb temperature',
    'Floods': 'Annual & peak rainfall · distance to waterbodies · drainage density · slope/elevation · sea-level-rise & storm surge · historical flood data',
    'Water Scarcity': 'Groundwater levels · rainfall deficit · per-capita availability · reservoir storage · drought frequency · aridity index · soil moisture',
    'Storm/Cyclone': 'Wind speed · number of cyclonic events · storm-surge height · pressure drop (hPa)',
    'Earthquake/Landslides': 'Peak Ground Acceleration (PGA) · seismic zone classification · soil type · proximity to fault lines',
    'Wildfire': 'Vegetation type · fuel load · temperature/humidity/wind · proximity to forest/grassland · historical fire occurrence'
  };
  const HAZARD_REFERENCE = {
    'Extreme Heat': 'NDMA — Heat Wave (ndma.gov.in)',
    'Floods': 'NDMA — Floods (ndma.gov.in)',
    'Storm/Cyclone': 'NDMA — Cyclone (ndma.gov.in)',
    'Water Scarcity': 'Water scarcity in India (reference)',
    'Earthquake/Landslides': 'NDMA — Earthquakes (ndma.gov.in)',
    'Wildfire': 'NDMA — Forest Fire (ndma.gov.in)'
  };
  const RISK_CATEGORY = {
    'Category A': 'Projects likely to generate significant climate risks; full assessment required.',
    'Category B': 'Projects with potential adverse climate risks that are less significant.',
    'Category C': 'Projects with minimal or no adverse climate risk.'
  };

  /* ----- 111-measure library (real CRE methodology) ---------------------- */
  // Supplied by measures.js, which must load before data.js.
  const MEASURES = (global.RAW_MEASURES || []).slice();

  /* ----- Districts (subset of ~720, with full hazard profiles) ----------- */
  // x/y are normalised positions (0..1) on a schematic India panel.
  function D(id, name, state, x, y, cls, sz, cz, pop, h) {
    return {
      id: id, name: name, state: state, x: x, y: y, classification: cls,
      seismic_zone: sz, climate_zone: cz, population: pop, hazards: {
        'Extreme Heat': h[0], 'Floods': h[1], 'Water Scarcity': h[2],
        'Storm/Cyclone': h[3], 'Earthquake/Landslides': h[4], 'Wildfire': h[5]
      }
    };
  }
  const DISTRICTS = [
    D('IND-27-MUM-0001', 'Mumbai', 'Maharashtra', 0.28, 0.62, 'Urban / coastal', 'III', 'Warm-humid', '12.4M', ['High','High','Medium','High','Medium','Low']),
    D('IND-07-NDL-0001', 'New Delhi', 'Delhi', 0.40, 0.30, 'Urban', 'IV', 'Composite', '16.8M', ['High','Medium','High','Low','High','Low']),
    D('IND-29-BLR-0001', 'Bengaluru Urban', 'Karnataka', 0.36, 0.78, 'Urban', 'II', 'Moderate', '9.6M', ['Medium','Medium','High','Low','Low','Low']),
    D('IND-33-CHN-0001', 'Chennai', 'Tamil Nadu', 0.45, 0.83, 'Urban / coastal', 'III', 'Hot-humid', '8.7M', ['High','High','High','High','Low','Low']),
    D('IND-36-HYD-0001', 'Hyderabad', 'Telangana', 0.40, 0.68, 'Urban', 'II', 'Hot-dry', '10.1M', ['High','Medium','High','Low','Low','Low']),
    D('IND-19-KOL-0001', 'Kolkata', 'West Bengal', 0.62, 0.50, 'Urban / deltaic', 'III', 'Warm-humid', '14.9M', ['High','High','Medium','High','Medium','Low']),
    D('IND-24-AMD-0001', 'Ahmedabad', 'Gujarat', 0.24, 0.46, 'Urban', 'III', 'Hot-dry', '8.4M', ['High','Medium','High','Medium','Low','Low']),
    D('IND-27-PUN-0002', 'Pune', 'Maharashtra', 0.30, 0.64, 'Urban', 'III', 'Moderate', '7.4M', ['Medium','Medium','Medium','Low','Low','Medium']),
    D('IND-08-JAI-0001', 'Jaipur', 'Rajasthan', 0.32, 0.36, 'Urban / semi-arid', 'II', 'Hot-dry', '4.1M', ['High','Low','High','Low','Medium','Low']),
    D('IND-32-ERN-0001', 'Ernakulam', 'Kerala', 0.34, 0.88, 'Urban / coastal', 'III', 'Hot-humid', '3.3M', ['Medium','High','Low','High','Medium','Low']),
    D('IND-21-KHO-0001', 'Khordha (Bhubaneswar)', 'Odisha', 0.57, 0.58, 'Urban / coastal', 'III', 'Warm-humid', '2.4M', ['High','High','Medium','High','Low','Low']),
    D('IND-23-IND-0001', 'Indore', 'Madhya Pradesh', 0.34, 0.50, 'Urban', 'III', 'Composite', '3.3M', ['High','Medium','Medium','Low','Low','Low']),
    D('IND-09-LKO-0001', 'Lucknow', 'Uttar Pradesh', 0.46, 0.40, 'Urban', 'III', 'Composite', '3.6M', ['High','High','Medium','Low','Medium','Low']),
    D('IND-10-PAT-0001', 'Patna', 'Bihar', 0.56, 0.42, 'Urban / riverine', 'IV', 'Composite', '2.4M', ['High','High','Medium','Low','High','Low']),
    D('IND-03-LDH-0001', 'Ludhiana', 'Punjab', 0.34, 0.24, 'Urban', 'III', 'Composite', '1.9M', ['High','Medium','Medium','Low','Medium','Low']),
    D('IND-29-MYS-0002', 'Mysuru', 'Karnataka', 0.35, 0.82, 'Urban', 'II', 'Moderate', '1.0M', ['Medium','Low','High','Low','Low','Medium']),
    D('IND-02-SML-0001', 'Shimla', 'Himachal Pradesh', 0.38, 0.18, 'Hill / urban', 'IV', 'Cold', '0.2M', ['Low','Medium','Low','Low','High','High']),
    D('IND-05-DDN-0001', 'Dehradun', 'Uttarakhand', 0.41, 0.22, 'Hill / urban', 'IV', 'Sub-temperate', '0.7M', ['Medium','High','Low','Low','High','High']),
    D('IND-18-GUW-0001', 'Kamrup (Guwahati)', 'Assam', 0.72, 0.40, 'Urban / riverine', 'V', 'Warm-humid', '1.3M', ['Medium','High','Low','Medium','High','Medium']),
    D('IND-22-RAI-0001', 'Raipur', 'Chhattisgarh', 0.48, 0.56, 'Urban', 'II', 'Composite', '1.5M', ['High','Medium','Medium','Low','Low','Medium']),
    D('IND-24-SUR-0002', 'Surat', 'Gujarat', 0.24, 0.52, 'Urban / coastal', 'III', 'Hot-humid', '6.6M', ['High','High','Medium','High','Low','Low']),
    D('IND-27-NAG-0003', 'Nagpur', 'Maharashtra', 0.40, 0.56, 'Urban', 'II', 'Hot-dry', '2.9M', ['High','Low','High','Low','Low','Medium']),
    D('IND-33-CBE-0002', 'Coimbatore', 'Tamil Nadu', 0.37, 0.85, 'Urban', 'III', 'Moderate', '2.6M', ['Medium','Medium','High','Medium','Low','Medium']),
    D('IND-28-VSK-0001', 'Visakhapatnam', 'Andhra Pradesh', 0.50, 0.70, 'Urban / coastal', 'II', 'Hot-humid', '2.4M', ['High','Medium','Medium','High','Low','Low'])
  ];

  /* ----- Organisations & users ------------------------------------------- */
  const ORGS = [
    { id: 'ORG-001', name: 'Meridian Development Bank', type: 'Commercial Bank', slug: 'meridian', users: 14, screenings: 38, plan: 'Enterprise', created: '2025-09-12' },
    { id: 'ORG-002', name: 'Coastal DFI', type: 'Development Finance Institution', slug: 'coastal-dfi', users: 9, screenings: 21, plan: 'Enterprise', created: '2025-10-03' },
    { id: 'ORG-003', name: 'auctusESG Advisory', type: 'Sustainability Advisor', slug: 'auctusesg', users: 6, screenings: 17, plan: 'Professional', created: '2025-08-21' },
    { id: 'ORG-004', name: 'Highland Credit Union', type: 'Commercial Bank', slug: 'highland', users: 5, screenings: 8, plan: 'Professional', created: '2026-01-19' }
  ];
  const USERS = [
    { id: 'USR-001', name: 'Ananya Rao', email: 'a.rao@meridianbank.example', org: 'Meridian Development Bank', role: 'Screener', last_active: '2026-04-08', screenings: 19, status: 'Active' },
    { id: 'USR-002', name: 'David Mensah', email: 'd.mensah@meridianbank.example', org: 'Meridian Development Bank', role: 'Reviewer', last_active: '2026-04-08', screenings: 0, status: 'Active' },
    { id: 'USR-003', name: 'Priya Nair', email: 'p.nair@coastaldfi.example', org: 'Coastal DFI', role: 'Screener', last_active: '2026-04-07', screenings: 12, status: 'Active' },
    { id: 'USR-004', name: 'Marcus Lim', email: 'm.lim@coastaldfi.example', org: 'Coastal DFI', role: 'Reviewer', last_active: '2026-04-05', screenings: 0, status: 'Active' },
    { id: 'USR-005', name: 'Sofia Almeida', email: 's.almeida@auctusesg.example', org: 'auctusESG Advisory', role: 'Administrator', last_active: '2026-04-08', screenings: 4, status: 'Active' },
    { id: 'USR-006', name: 'Rohan Gupta', email: 'r.gupta@auctusesg.example', org: 'auctusESG Advisory', role: 'Administrator', last_active: '2026-04-06', screenings: 3, status: 'Active' },
    { id: 'USR-007', name: 'Hannah Müller', email: 'h.muller@highland.example', org: 'Highland Credit Union', role: 'Screener', last_active: '2026-04-02', screenings: 5, status: 'Active' },
    { id: 'USR-008', name: 'Tariq Hassan', email: 't.hassan@meridianbank.example', org: 'Meridian Development Bank', role: 'Observer', last_active: '2026-03-28', screenings: 0, status: 'Active' },
    { id: 'USR-009', name: 'Lena Petrova', email: 'l.petrova@coastaldfi.example', org: 'Coastal DFI', role: 'Screener', last_active: '2026-03-30', screenings: 7, status: 'Invited' }
  ];
  // The signed-in user for this prototype session.
  const CURRENT_USER = { name: 'Ananya Rao', role: 'Screener', org: 'Meridian Development Bank', initials: 'AR' };

  /* ----- Eligibility & DNSH question text --------------------------------- */
  const ELIGIBILITY = {
    step1: {
      title: 'Step 1 — Setting out the context of vulnerability to climate change',
      rollup: 'Has the context of climate change vulnerability been set out?',
      questions: [
        'Has the project assessment documented current and future climate hazards which could impact the project?',
        'Have the identified climate risks been assessed based on robust and trusted climate data and models?'
      ]
    },
    step2: {
      title: 'Step 2 — Statement of intent to reduce vulnerability',
      rollup: 'Is there an explicit statement of intent to reduce the identified climate change vulnerabilities?',
      questions: [
        'Do the project measures aim to increase the resilience of the project or its beneficiaries?',
        'Are the adaptation objectives clearly articulated and aligned with the identified climate risks?'
      ]
    },
    step3: {
      title: 'Step 3 — Relevance, significance and adequacy of adaptation interventions',
      rollup: 'Is there a direct link between the project measures and the identified climate risks?',
      questions: [
        'Do the proposed adaptation measures address the specific climate risks identified?',
        'Have any identified climate risks been left unaddressed?',
        'If yes to the previous, is there a plan of action to remedy them within a defined timeframe?'
      ]
    }
  };
  const TYPOLOGY = {
    'Type 1': 'Projects where the primary objective is not adaptation, but certain measures within the project contribute to adaptation.',
    'Type 2': 'Projects where adaptation is one of the explicit (non-primary) objectives and is a significant part of the project.',
    'Type 3': 'Projects where the primary objective is to build resilience or reduce vulnerability to climate change impacts.'
  };
  const TYPOLOGY_SHORT = {
    'Type 1': 'Adaptation as co-benefit',
    'Type 2': 'Adaptation & development goals',
    'Type 3': 'Primary adaptation objective'
  };
  const DNSH_QUESTIONS = [
    { n: 1, harm: true, text: 'Does the project contradict climate mitigation efforts in the short and long term?' },
    { n: 2, harm: true, text: 'Is there a risk that the project could disproportionately and negatively impact any stakeholder group (especially vulnerable or marginalised communities)?' },
    { n: 3, harm: false, text: 'Does the project meet the minimum national standards relating to human rights, fair labour, anti-corruption and environmental safeguards?' },
    { n: 4, harm: true, text: 'Could the project unintentionally create new risks or worsen existing climate-related risks for other systems, sectors, or populations?' },
    { n: 5, harm: true, text: 'Could the project encourage overuse or mismanagement of natural resources?' },
    { n: 6, harm: false, text: 'Does the project incorporate measures to encourage use of recycled material, minimise waste and promote the circular economy?' },
    { n: 7, harm: true, text: 'Is there a risk that the project may result in negative short- or long-term impacts on biodiversity and ecosystem services?' }
  ];

  /* ----- Screenings ------------------------------------------------------- */
  function measuresForProfile(subSector, profile) {
    return MEASURES.filter(function (m) {
      return m.sub_sector === subSector && (profile[m.hazard] === 'High' || profile[m.hazard] === 'Medium');
    });
  }
  function S(o) {
    const district = DISTRICTS.find(function (d) { return d.id === o.district_id; });
    const recommended = measuresForProfile(o.sub_sector, district.hazards);
    const applied = [], deferred = [], na = [];
    recommended.forEach(function (m, i) {
      if (i % 7 === 5) na.push(m.id);
      else if (i % 5 === 3) deferred.push(m.id);
      else applied.push(m.id);
    });
    return {
      screening_id: o.id, project_id: o.project_id, name: o.name, bank: o.bank, org: o.org,
      sub_sector: o.sub_sector, district_id: o.district_id, typology: o.typology,
      eligibility: o.eligibility, dnsh: o.dnsh, status: o.status,
      created_at: o.created_at, committed_at: o.committed_at, author: o.author,
      methodology_version: 'cre@1.0', hazard_snapshot: 'thinkhazard@2026-03-18', inputs_hash: o.hash,
      objective: o.objective, ecosystem: o.ecosystem,
      recommended: recommended.map(function (m) { return m.id; }),
      applied: applied, deferred: deferred, na: na
    };
  }
  const SCREENINGS = [
    S({ id: 'SCR-2026-0041-A', project_id: 'PRJ-2026-0041', name: 'Powai Hyperscale Data Campus', bank: 'Meridian Development Bank', org: 'Meridian Development Bank', sub_sector: 'Data Centres', district_id: 'IND-27-MUM-0001', typology: 'Type 2', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Completed', created_at: '2026-04-06', committed_at: '2026-04-08', author: 'Ananya Rao', hash: '0x3a7e91f1c2', objective: 'Finance a Tier-IV hyperscale data centre with climate-resilient cooling and flood protection serving the western India cloud region.', ecosystem: 'Reclaimed urban land adjacent to the Powai lake catchment; no protected habitat on site.' }),
    S({ id: 'SCR-2026-0039-A', project_id: 'PRJ-2026-0039', name: 'Apollo Grace Multispecialty Hospital', bank: 'Coastal DFI', org: 'Coastal DFI', sub_sector: 'Hospitals/Healthcare', district_id: 'IND-33-CHN-0001', typology: 'Type 3', eligibility: 'Eligible', dnsh: 'Flagged', status: 'Review', created_at: '2026-04-04', committed_at: null, author: 'Priya Nair', hash: '0x9b22ae44d0', objective: 'Retrofit a 600-bed hospital for flood, cyclone and extreme-heat resilience with assured clinical continuity.', ecosystem: 'Coastal urban site within 3km of the Adyar estuary; mangrove buffer downstream.' }),
    S({ id: 'SCR-2026-0044-A', project_id: 'PRJ-2026-0044', name: 'Whitefield Logistics Park', bank: 'Meridian Development Bank', org: 'Meridian Development Bank', sub_sector: 'Warehouses', district_id: 'IND-29-BLR-0001', typology: 'Type 1', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Completed', created_at: '2026-04-02', committed_at: '2026-04-03', author: 'Ananya Rao', hash: '0x71c0d39f5e', objective: 'Develop a Grade-A logistics park with water-scarcity and heat resilience for last-mile distribution.', ecosystem: 'Peri-urban plot on former agricultural land; rainwater recharge zone nearby.' }),
    S({ id: 'SCR-2026-0036-A', project_id: 'PRJ-2026-0036', name: 'Cyber Towers Office Retrofit', bank: 'Highland Credit Union', org: 'Highland Credit Union', sub_sector: 'Commercial Buildings', district_id: 'IND-36-HYD-0001', typology: 'Type 2', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Completed', created_at: '2026-03-28', committed_at: '2026-03-29', author: 'Hannah Müller', hash: '0x4f8821ab3c', objective: 'Deep-retrofit a 1.2M sq ft office complex for extreme-heat and water-scarcity resilience.', ecosystem: 'Dense urban tech corridor; no significant natural habitat on site.' }),
    S({ id: 'SCR-2026-0048-A', project_id: 'PRJ-2026-0048', name: 'Sundarban Riverside Warehousing', bank: 'Coastal DFI', org: 'Coastal DFI', sub_sector: 'Warehouses', district_id: 'IND-19-KOL-0001', typology: 'Type 2', eligibility: 'Not Eligible', dnsh: 'Flagged', status: 'Completed', created_at: '2026-03-25', committed_at: '2026-03-27', author: 'Priya Nair', hash: '0x2d55e0117a', objective: 'Cold-chain warehousing near the deltaic floodplain with cyclone hardening.', ecosystem: 'Adjacent to ecologically sensitive deltaic wetland — biodiversity flag raised.' }),
    S({ id: 'SCR-2026-0052-A', project_id: 'PRJ-2026-0052', name: 'Marina Bay Specialty Clinic', bank: 'Meridian Development Bank', org: 'Meridian Development Bank', sub_sector: 'Hospitals/Healthcare', district_id: 'IND-28-VSK-0001', typology: 'Type 3', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Draft', created_at: '2026-04-07', committed_at: null, author: 'Ananya Rao', hash: '—', objective: 'New specialty clinic with cyclone- and heat-resilient design on the Visakhapatnam coast.', ecosystem: 'Coastal urban infill; no protected habitat directly affected.' }),
    S({ id: 'SCR-2026-0033-A', project_id: 'PRJ-2026-0033', name: 'Ahmedabad Edge Data Node', bank: 'Highland Credit Union', org: 'Highland Credit Union', sub_sector: 'Data Centres', district_id: 'IND-24-AMD-0001', typology: 'Type 1', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Completed', created_at: '2026-03-20', committed_at: '2026-03-21', author: 'Hannah Müller', hash: '0x88aa12cd9b', objective: 'Edge data node with air-cooled chillers to manage extreme-heat and water-scarcity exposure.', ecosystem: 'Industrial estate; minimal ecological sensitivity.' }),
    S({ id: 'SCR-2026-0029-A', project_id: 'PRJ-2026-0029', name: 'Connaught Place Heritage Office', bank: 'Meridian Development Bank', org: 'Meridian Development Bank', sub_sector: 'Commercial Buildings', district_id: 'IND-07-NDL-0001', typology: 'Type 2', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Completed', created_at: '2026-03-15', committed_at: '2026-03-16', author: 'Ananya Rao', hash: '0x61bb73fe21', objective: 'Heritage-sensitive office retrofit for extreme-heat and seismic resilience.', ecosystem: 'Dense urban core; no natural habitat affected.' }),
    S({ id: 'SCR-2026-0055-A', project_id: 'PRJ-2026-0055', name: 'Guwahati Riverine Care Hospital', bank: 'Coastal DFI', org: 'Coastal DFI', sub_sector: 'Hospitals/Healthcare', district_id: 'IND-18-GUW-0001', typology: 'Type 3', eligibility: 'Eligible', dnsh: 'Flagged', status: 'Review', created_at: '2026-04-05', committed_at: null, author: 'Lena Petrova', hash: '0x019cf4ab77', objective: 'Flood- and seismic-resilient hospital on the Brahmaputra floodplain.', ecosystem: 'Riverine site in seismic zone V; floodplain ecology adjacent.' }),
    S({ id: 'SCR-2026-0026-A', project_id: 'PRJ-2026-0026', name: 'Pune IT SEZ Tower B', bank: 'Highland Credit Union', org: 'Highland Credit Union', sub_sector: 'Commercial Buildings', district_id: 'IND-27-PUN-0002', typology: 'Type 1', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Completed', created_at: '2026-03-10', committed_at: '2026-03-11', author: 'Hannah Müller', hash: '0x33de90aa18', objective: 'SEZ office tower with a passive-cooling envelope upgrade.', ecosystem: 'Urban SEZ; no ecological sensitivity.' }),
    S({ id: 'SCR-2026-0058-A', project_id: 'PRJ-2026-0058', name: 'Surat Diamond Logistics Hub', bank: 'Coastal DFI', org: 'Coastal DFI', sub_sector: 'Warehouses', district_id: 'IND-24-SUR-0002', typology: 'Type 2', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Draft', created_at: '2026-04-08', committed_at: null, author: 'Priya Nair', hash: '—', objective: 'Coastal logistics hub with flood and cyclone hardening.', ecosystem: 'Coastal industrial belt; tidal creek nearby.' }),
    S({ id: 'SCR-2026-0021-A', project_id: 'PRJ-2026-0021', name: 'Indore Smart Hospital', bank: 'Meridian Development Bank', org: 'Meridian Development Bank', sub_sector: 'Hospitals/Healthcare', district_id: 'IND-23-IND-0001', typology: 'Type 3', eligibility: 'Eligible', dnsh: 'Compliant', status: 'Completed', created_at: '2026-03-05', committed_at: '2026-03-06', author: 'Ananya Rao', hash: '0x77af23b110', objective: 'Greenfield hospital with an extreme-heat resilient critical-care wing.', ecosystem: 'Urban greenfield; landscaped buffer planned.' })
  ];

  /* ----- Methodology versions -------------------------------------------- */
  const VERSIONS = [
    { id: 'cre@1.0', status: 'live', effective_from: '2026-01-15', published_at: '2026-01-15', measures: 111, notes: 'Initial Commercial Real Estate methodology — 111 measures across four sub-sectors and six hazards.' },
    { id: 'cre@0.9', status: 'archived', effective_from: '2025-11-01', published_at: '2025-11-01', measures: 104, notes: 'Pre-release calibration version.' }
  ];
  const DRAFT_VERSION = {
    id: 'cre@1.1-draft', status: 'draft', edited: 6, added: 3, retired: 1,
    changes: [
      { type: 'edited', measure_id: 'HH-EH-01', sub_sector: 'Hospitals/Healthcare', detail: 'Clarified redundancy requirement for critical-care cooling.' },
      { type: 'edited', measure_id: 'DC-WS-01', sub_sector: 'Data Centres', detail: 'Added condensate-recovery guidance.' },
      { type: 'added', measure_id: 'CB-EH-09', sub_sector: 'Commercial Buildings', detail: 'New measure: dynamic external shading systems.' },
      { type: 'added', measure_id: 'HH-FL-07', sub_sector: 'Hospitals/Healthcare', detail: 'New measure: modular flood-barrier kit for emergency entrances.' },
      { type: 'retired', measure_id: 'WH-WF-02', sub_sector: 'Warehouses', detail: 'Superseded by ember-resistant detailing measure.' }
    ]
  };

  /* ----- Hazard snapshot meta & data sources ----------------------------- */
  const SNAPSHOT = { id: 'thinkhazard@2026-03-18', source: 'ThinkHazard! district-level ratings', snapshotted_at: '2026-03-18', status: 'published', next_sync: '2026-04-18', changes_since: 3 };
  const DATA_SOURCES = [
    { name: 'ThinkHazard!', use: 'District-level climate hazard ratings', url: 'thinkhazard.org' },
    { name: 'IMD', use: 'Meteorological baselines', url: 'imd.gov.in' },
    { name: 'MDB/IDFC Joint Principles', use: 'Adaptation finance eligibility framework', url: '—' },
    { name: 'EU Taxonomy', use: 'Do No Significant Harm criteria', url: '—' },
    { name: 'IPCC AR6', use: 'Maladaptation definitions', url: 'ipcc.ch' }
  ];

  /* ----- Analytics -------------------------------------------------------- */
  const ANALYTICS = {
    screenings_30d: 47, districts_queried: 63, avg_time_to_screen: '13.4 min', override_rate: '11%',
    per_week: [6, 9, 7, 11, 8, 12, 10, 14],
    by_subsector: [
      { label: 'Hospitals/Healthcare', value: 18 },
      { label: 'Data Centres', value: 12 },
      { label: 'Commercial Buildings', value: 10 },
      { label: 'Warehouses', value: 7 }
    ],
    override_signal: [
      { measure_id: 'HH-EH-01', recommended: 41, overridden: 9, reason: 'Existing chiller redundancy already meets requirement' },
      { measure_id: 'DC-WS-01', recommended: 33, overridden: 7, reason: 'Site uses municipal recycled water' },
      { measure_id: 'CB-ST-01', recommended: 28, overridden: 6, reason: 'Wind load below threshold for sub-region' },
      { measure_id: 'WH-FL-01', recommended: 22, overridden: 5, reason: 'Plinth already above design flood level' },
      { measure_id: 'HH-WF-01', recommended: 19, overridden: 4, reason: 'No wildland-urban interface exposure' }
    ],
    top_districts: [
      { id: 'IND-27-MUM-0001', name: 'Mumbai', count: 14 },
      { id: 'IND-33-CHN-0001', name: 'Chennai', count: 11 },
      { id: 'IND-29-BLR-0001', name: 'Bengaluru Urban', count: 9 },
      { id: 'IND-07-NDL-0001', name: 'New Delhi', count: 8 },
      { id: 'IND-36-HYD-0001', name: 'Hyderabad', count: 7 },
      { id: 'IND-19-KOL-0001', name: 'Kolkata', count: 6 }
    ]
  };

  /* ----- Audit trail (illustrative, for the active screening) ------------- */
  const AUDIT = [
    { actor: 'Ananya Rao', action: 'screening.commit', detail: 'Committed screening; pinned cre@1.0 and thinkhazard@2026-03-18.', at: '2026-04-08 10:14' },
    { actor: 'Ananya Rao', action: 'measure.override', detail: 'Marked HH-EH-01 as Deferred — "phased capex".', at: '2026-04-08 10:02' },
    { actor: 'Ananya Rao', action: 'screening.draft_save', detail: 'Saved draft at Step 5.', at: '2026-04-07 17:41' },
    { actor: 'Ananya Rao', action: 'screening.create', detail: 'Created draft screening from the New Screening wizard.', at: '2026-04-06 09:20' }
  ];

  /* ----- Public API ------------------------------------------------------ */
  global.DB = {
    SUBSECTORS, HAZARDS, LOE, THEMES, INTENSITIES,
    SUBSECTOR_SLUG, SUBSECTOR_CODE, HAZARD_SLUG, HAZARD_CODE, HAZARD_COLOR, HAZARD_ICON, HAZARD_DESC, SUBSECTOR_BLURB,
    HAZARD_INDICATORS, HAZARD_REFERENCE, RISK_CATEGORY,
    MEASURES, DISTRICTS, ORGS, USERS, CURRENT_USER,
    ELIGIBILITY, TYPOLOGY, TYPOLOGY_SHORT, DNSH_QUESTIONS,
    SCREENINGS, VERSIONS, DRAFT_VERSION, SNAPSHOT, DATA_SOURCES, ANALYTICS, AUDIT,
    measure: function (id) { return MEASURES.find(function (m) { return m.id === id; }); },
    district: function (id) { return DISTRICTS.find(function (d) { return d.id === id; }); },
    screening: function (id) { return SCREENINGS.find(function (s) { return s.screening_id === id; }); },
    measuresForProfile: measuresForProfile,
    subSectorBySlug: function (slug) { return SUBSECTORS.find(function (s) { return SUBSECTOR_SLUG[s] === slug; }); },
    hazardBySlug: function (slug) { return HAZARDS.find(function (h) { return HAZARD_SLUG[h] === slug; }); },
    counts: {
      total: MEASURES.length,
      bySubSector: function (ss) { return MEASURES.filter(function (m) { return m.sub_sector === ss; }).length; },
      byHazard: function (hz) { return MEASURES.filter(function (m) { return m.hazard === hz; }).length; },
      byLoE: function (l) { return MEASURES.filter(function (m) { return m.loe === l; }).length; },
      byTheme: function (t) { return MEASURES.filter(function (m) { return m.theme === t; }).length; },
      highShare: function () { return MEASURES.length ? Math.round(MEASURES.filter(function (m) { return m.loe === 'High'; }).length / MEASURES.length * 100) : 0; }
    }
  };
})(window);
