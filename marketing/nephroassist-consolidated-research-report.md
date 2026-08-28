# NephroAssist — Consolidated Market & Competitor Research Report

**Task:** t_c269008b  
**Date:** 2026-08-28  
**Research Lead:** research-lead  
**Sources:** market-researcher (t_17542e1a, 2026-08-14), competitor-researcher (t_05397706 / t_7003a2a8, 2026-08-14 / 2026-08-28)

---

## Executive Summary

NephroAssist operates in a **niche, high-value, underserved market**: pre-transplant patient readiness coordination for kidney (and potentially other organ) transplant centers. No competitor currently offers a dedicated transplant-specific patient-facing application that combines task/checklist management, care-team communication, and condition-specific education in a coherent journey.

The competitive landscape splits into three layers:
1. **Transplant-specific incumbents** (CareDx, Transplant Hero, iTransplant/InVita) — clinically credible but narrow in scope (diagnostics/pharmacy, medication alarms, or donor logistics).
2. **Generic digital care-journey SaaS** (SeamlessMD, Commure, Get Well, Mytonomy) — broad functionality, not transplant-specific.
3. **Care-coordination tools** (ThoroughCare, CareMessage) — clinician-centric or SMS-based, not designed for transplant patient readiness.

The U.S. addressable market comprises ~250+ transplant programs, >100,000 waiting-list patients (of which ~90,000 are kidney), and ~40,000+ transplants annually. A SaaS charging $5K–$50K/year per program could address a U.S. TAM of $1.25M–$12.5M annually. The market is sticky, mission-critical, and dominated by EHR modules with known usability gaps.

**Key strategic insight:** Position NephroAssist as a **coordination layer on top of Epic/Cerner**, not a replacement EHR. Emphasize transplant-specific workflows and modern patient experience against generic players; emphasize comprehensive journey management and care-team communication against narrow transplant-specific tools.

---

## 1. Target Market & Patient Journey

### 1.1 Canonical Pre-Transplant Journey (5 Stages)

Based on SRTR/HRSA documentation, the pre-transplant patient journey follows five canonical stages:

| Stage | Description | Key Activities |
|-------|-------------|----------------|
| **1. Considering a Transplant** | Patient learns of organ failure; discusses dialysis vs. transplant with specialist | Education, initial decision-making |
| **2. Find a Transplant Center** | Patient/physician identifies programs; evaluates distance, insurance, outcomes | SRTR Program-Specific Reports review |
| **3. Evaluation / Getting Listed** | Comprehensive medical, psychosocial, financial evaluation | Blood tests, imaging, cardiac workup, cancer screening, infection screening |
| **4. Waiting Period** | Patient maintains health while waiting for organ offer | Periodic labs, clinic visits, medication adherence, infection avoidance |
| **5. Organ Offer and Decision** | Match run generates ranked list; center reviews offer; patient decides quickly | Rapid decision-making, travel to center |

**Source:** SRTR — The Organ Transplant Journey (https://srtr.org/patients-care-partners/the-organ-transplant-journey/)

NephroAssist's current 6-step workflow (Überweisung → Verordnung → Termin → Bericht anfordern → Bericht hochladen → Prüfung) maps most closely to Stages 2–3 (evaluation/pre-listing coordination). Expansion to cover the full 5-stage journey (including waiting-period management and offer coordination) represents a significant product roadmap opportunity.

### 1.2 Global Market Context

| Region | Key Metrics |
|--------|-------------|
| **U.S.** | ~250+ transplant programs; ~40,000+ transplants/year; >100,000 on waiting list; ~90,000 kidney candidates |
| **EU (Eurotransplant)** | 8 countries; >13,000 transplants/year |
| **UK (NHSBT)** | ~4,000+ transplants/year; ~7,000+ on active waiting list |
| **Global** | Solid organ transplantation in >100 countries; kidney transplants ~70% of all solid-organ transplants |

**Sources:** WHO Fact Sheet — Transplantation; SRTR Program-Specific Reports; Eurotransplant; NHS Blood and Transplant

### 1.3 Market Size Estimate

| Metric | Value | Provenance |
|--------|-------|------------|
| U.S. transplant programs | ~250+ | SRTR/OPTN |
| Estimated annual SaaS TAM (U.S.) | $1.25M–$12.5M | ASSUMPTION: $5K–$50K/year per program |
| Transplant episode cost | $150K–$1M+ | INFERENCE: depending on organ type and complications |
| EU+UK program count | ~250–300 | INFERENCE: roughly doubles U.S. addressable program count |

**INTERPRETATION:** The market is not massive by general SaaS standards, but it is sticky, mission-critical, and currently served by specialized EHR modules with known usability gaps. A best-in-class coordination layer that integrates rather than replaces has viable room.

---

## 2. Customer Segments & Demand Trends

### 2.1 Primary Customer Segments

| Segment | Role in Journey | Pain Points | Willingness to Pay |
|---------|----------------|-------------|-------------------|
| **Transplant Patients & Care Partners** | End users | Overwhelming checklist of evaluations; poor communication with coordinators; anxiety during waiting period | Low direct pay; expects free/insurer-paid |
| **Transplant Centers / Programs** | Primary buyer/admin | Need care coordination, waitlist management, outcome reporting, patient engagement | High — if ROI proven (reduced no-shows, faster listing) |
| **Transplant Coordinators** | Power users / champions | Task management, organ-offer communication, scheduling, lab tracking, patient outreach | Medium — influences buying decision |
| **Nephrologists / Referring Physicians** | Referral source | Need referral workflows, pre-transplant monitoring, post-transplant shared care | Medium — may refer but not buy directly |
| **Social Workers / Dietitians / Financial Counselors** | Care team members | Psychosocial assessments, dietary plans, insurance/financial clearance | Low — part of center staff |
| **OPOs (Organ Procurement Organizations)** | Data partners | Donor management, organ allocation, outcome data exchange | Low — separate systems |
| **Payers / Insurers** | Indirect stakeholder | Cost containment, prior authorization, outcomes verification | Medium-High — if cost savings demonstrated |

### 2.2 Demand Trends

1. **Patient expectations for digital engagement are rising.** Patients increasingly expect mobile-accessible tools, real-time updates, and transparent communication — areas where current transplant center workflows lag.

2. **Value-based care pressure is increasing.** CMS and payers are pushing for better outcomes at lower cost. Tools that reduce no-shows, accelerate listing, or improve waitlist survival have clear ROI narratives.

3. **Remote monitoring and PROs (Patient-Reported Outcomes) are becoming standard.** Competitors like SeamlessMD and Get Well emphasize remote monitoring; NephroAssist should plan for PRO collection in future iterations.

4. **AI-powered personalization is emerging as a hygiene factor.** Get Well (RhythmX), Commure (ambient AI), and Mytonomy (algorithmic nudging) all position AI as core. Expectation for AI-driven personalization will likely be table stakes within 2–3 years.

5. **Living-donor programs are expanding.** As deceased-donor organ scarcity continues, living-donor workflows (evaluation, matching, coordination) represent a growing, underserved sub-market.

---

## 3. Regulatory Context

### 3.1 United States — HIPAA & CMS

Any digital health platform handling Protected Health Information (PHI) must comply with HIPAA Security and Privacy Rules:

- **Covered Entities:** Transplant centers, hospitals, nephrology practices, and their Business Associates (BAs).
- **Technical Safeguards:** Unique user IDs, audit controls, integrity controls, encryption in transit and at rest.
- **CMS Conditions of Participation:** Transplant programs must report data to SRTR/OPTN. Software assisting with data submission becomes a critical workflow dependency.
- **Penalties:** Civil monetary penalties range from ~$137 to ~$2.1M+ per violation tier.

**Source:** HHS HIPAA Security Rule; CMS — Medicare Coverage of Organ Transplants; 45 CFR Parts 160 & 164

### 3.2 European Union — GDPR

- Health data (transplant status, organ type, blood type, immunosuppressant regimens, lab values) is "special category data" under Article 9.
- **Lawful bases:** Explicit consent, substantial public interest, protection of vital interests, or healthcare treatment (typically strongest for clinical platforms).
- **Key obligations:** Data Protection Impact Assessment (DPIA) required for high-risk processing; pseudonymization and encryption mandated; cross-border transfers to U.S. require EU-U.S. Data Privacy Framework or Standard Contractual Clauses.
- **Fines:** Up to EUR 20M or 4% of global annual turnover.

**Source:** GDPR (Regulation EU 2016/679)

### 3.3 Germany — BfArM / DiGA

Germany's Fast-Track Process for Digital Health Applications (DiGA) under SGB V, §§ 139a–139k creates a regulated pathway for prescription digital health apps to be reimbursed by statutory health insurers. If NephroAssist provides patient-facing digital therapeutics (e.g., medication adherence, symptom tracking), it could be classified as a DiGA, requiring proof of positive healthcare effect, data protection, interoperability (HL7 FHIR), and quality management (ISO 13485 / ISO 27001).

**Source:** BfArM — Digital Health Applications (DiGA)

### 3.4 United Kingdom — NHS Data Security Standards

NHSBT manages the UK Organ Donor Register. Any platform integrating with NHS systems must comply with NHS Data Security and Protection Toolkit requirements (10 data security standards).

**Source:** NHS Digital — Data Security and Information Governance

---

## 4. Adoption Barriers

### 4.1 Regulatory & Compliance Barriers
- **HIPAA / GDPR non-compliance risk:** Handling transplant data without BAAs, DPIAs, or encryption is a fatal risk.
- **Medical Device / DiGA classification risk:** If the platform provides diagnostic or therapeutic recommendations (e.g., "accept this organ offer"), it may be regulated as a medical device, dramatically increasing time-to-market.
- **Cross-border data transfer risk:** U.S.-EU patient data flows require DPF certification or SCCs.

### 4.2 Clinical & Workflow Barriers
- **EHR lock-in:** Transplant centers are deeply embedded in Epic, Cerner, or Meditech. A standalone SaaS must integrate via HL7 FHIR; workflow disruption is a deal-killer.
- **Coordination complexity:** The transplant journey spans 5+ clinical roles and multiple institutions (referring hospital, transplant center, OPO, dialysis center).
- **High-stakes decision support:** Any AI or recommendation feature faces extreme scrutiny due to life-or-death consequences.

### 4.3 Market & Commercial Barriers
- **Long sales cycles:** Hospital procurement and transplant program committees can take 12–24 months.
- **Limited budget for niche SaaS:** Transplant programs are cost centers; funding often depends on grants or health-system IT budgets.
- **Competition from EHR incumbents:** Epic has a Transplant Module. Cerner and other EHRs are building similar capabilities.

### 4.4 Data & Trust Barriers
- **Patient trust:** Transplant patients are vulnerable and often older. Adoption requires high usability, caregiver involvement, and proven privacy.
- **Interoperability:** SRTR/OPTN, UNOS, and OPOs use specific data formats. A SaaS must align with these reporting requirements.

---

## 5. Competitive Landscape

### 5.1 Competitor Comparison Matrix

| Dimension | CareDx | Transplant Hero | iTransplant (InVita) | SeamlessMD | Commure | Get Well | Mytonomy | ThoroughCare |
|---|---|---|---|---|---|---|---|---|
| **Primary URL** | caredx.com | transplanthero.com | invitaht.com | seamless.md | commure.com | getwellnetwork.com | mytonomy.com | thoroughcare.net |
| **Category** | Transplant diagnostics + support | Medication adherence app | Donation-transplant logistics | Digital care journeys | AI enterprise healthcare | Digital patient engagement | Patient education / engagement | Care coordination |
| **Target Users** | Transplant patients, clinicians | Transplant patients (B2C) | OPOs, transplant centers | Surgery/procedure patients | Health systems, clinicians | Health systems (1,000+) | Health systems, patients | Care managers, health plans |
| **Transplant Specificity** | **High** — kidney, heart, lung | **High** — medication timing | **High** — organ/tissue donation | **Low** — generic surgery | **Low** — generic | **Low** — broad engagement | **Low** — general education | **Low** — chronic care |
| **Task / Checklist Management** | **No** | **No** (alarm-only) | **No** | **Yes** | **Partial** | **Partial** | **Partial** | **Yes** |
| **Care Team Communication** | Phone-based | **No** | HIPAA chat (logistics teams) | In-app + alerts | SMS-based | Multi-channel | SMS/Email nudges | Team notes |
| **Real-time Chat** | **No** | **No** | **Yes** (logistics) | **Partial** | **No** | **Partial** | **Partial** | **No** |
| **Pricing Model** | UNKNOWN — B2B/insurance | UNKNOWN — likely free/freemium | UNKNOWN — enterprise B2B | UNKNOWN — B2B SaaS | UNKNOWN — B2B SaaS | UNKNOWN — enterprise | UNKNOWN — B2B SaaS | UNKNOWN — B2B SaaS |
| **Compliance** | HIPAA; URAC pharmacy | HIPAA (terms) | HIPAA | HIPAA | HIPAA; EHR-integrated | HITRUST r2 + SOC 2 Type II | HIPAA (Elsevier) | HIPAA; NCQA prevalidated |
| **Key Differentiator** | Only diagnostics + pharmacy + care team player | Only consumer transplant alarm app by doctors | Industry-leading donation-logistics | Digital Care Journeys + PROs | AI-native; EHR integration | 100M+ interactions; FedRAMP | Video microlearning; Elsevier | NCQA prevalidation |
| **Weakness / Gap** | No patient-facing task app; phone-heavy | Alarm-only; no care team; no journeys | Not patient-facing readiness | Not transplant-specific; no real-time chat | Patient engagement deprioritized; SMS-only | Very broad/generic | Education-heavy, light task mgmt | Care-manager-centric |

### 5.2 Detailed Competitor Profiles

#### CareDx — "Precision Diagnostics in Transplant"
- **Offering:** Transplant-focused diagnostics (rejection monitoring tests), digital health tools, pharmacy services, Care Team support line.
- **Evidence:** ~1M rejection monitoring tests performed; 70% of US kidney transplant hospitals use their tests; 150K prescriptions filled annually.
- **Strengths:** Deep clinical credibility; only truly transplant-specific enterprise player.
- **Weaknesses:** No modern patient-facing app for readiness tracking. Heavy reliance on phone support (1-888-255-6627, M–F 6am–5pm PT).

#### Transplant Hero — "Never Forget Your Transplant Medications"
- **Offering:** Consumer mobile alarm app for transplant patients to manage immunosuppression medication timing. Created by medical doctors.
- **Evidence:** B2C app; meta description confirms alarm system for medication adherence with positive reinforcement.
- **Strengths:** Only consumer-facing transplant-specific app identified.
- **Weaknesses:** Extremely narrow scope (alarms only). No care team communication, no EHR integration evident.

#### iTransplant / InVita — "Donation-Transplant Platform"
- **Offering:** Industry-leading organ, eye, tissue donation-transplant platform; iTransplant Mobile App with HIPAA-compliant chat and logistics tracking.
- **Evidence:** transplantconnect.com — "industry-leading and award-winning" platform.
- **Strengths:** Deep domain expertise in donation-transplant logistics.
- **Weaknesses:** **Not patient-facing.** Built for OPOs and transplant centers, not for pre-transplant patient readiness.

#### SeamlessMD — "Digital Care Journeys"
- **Offering:** Digital patient engagement and remote monitoring: automated education, care journeys, PRO collection.
- **Evidence:** KLAS 2023 Emerging Solutions Top 20 Report recognition; 40+ clinical studies.
- **Strengths:** Strong "care journey" concept closely matches transplant readiness idea. Mature PRO collection and remote monitoring.
- **Weaknesses:** Not transplant-specific. No evidence of real-time care-team chat.

#### Commure — "AI-Native Enterprise Healthcare Platform"
- **Offering:** AI-native platform for RCM, ambient AI dictation, call center agents. Formerly included Memora Health's Engage product.
- **Evidence:** Current homepage (2026-08-28) focuses on RCM and ambient AI; prior "Engage" patient engagement product no longer prominently featured.
- **Strengths:** AI automation reduces staff burden. Strong EHR integration. $70M raised at $7B valuation (company claim).
- **Weaknesses:** Not transplant-specific. Patient engagement appears deprioritized. SMS-only limits rich interactions.

#### Get Well Network — "Personalized Care for All"
- **Offering:** GW RhythmX digital patient engagement platform (Stay, Loop, Navigate) + RhythmX AI.
- **Evidence:** 100M+ patient interactions; HITRUST r2 + SOC 2 Type II + FedRAMP Moderate (Jan 2026).
- **Strengths:** Massive install base. Strong security posture. Federal and pediatric experience.
- **Weaknesses:** Very broad/generic; not transplant-specific. Likely expensive enterprise contracts.

#### Mytonomy — "Patient Education & Engagement"
- **Offering:** Cloud-based patient engagement with microlearning videos, communication tools, algorithmic nudging. Now part of Elsevier.
- **Evidence:** "Patient Experience Cloud™️"; SMART on FHIR API integration.
- **Strengths:** Strong in patient education. Video content is engaging. Elsevier backing.
- **Weaknesses:** Education-heavy, lighter on task management and care-team coordination. Not transplant-specific.

#### ThoroughCare — "Care Coordination Software"
- **Offering:** Clinician-designed care coordination for CCM, RPM, AWV, TCM. NCQA prevalidated.
- **Evidence:** 1M+ patients managed claim.
- **Strengths:** Strong task/workflow management. NCQA prevalidation is a trust signal.
- **Weaknesses:** Not patient-centric; built for care managers. Not transplant-specific.

### 5.3 Adjacent / Reference Competitors

| Competitor | Role | Relevance |
|---|---|---|
| **UNOS / OPTN** | Nonprofit organ matching / OPTN management | High authority; not a patient readiness tool |
| **Epic MyChart** | EHR patient portal | Universal; offers messaging, appointments, labs; no transplant-specific readiness journeys |
| **Oracle Health (Cerner)** | EHR + population health | Enterprise modules; no transplant-specific readiness app |
| **CareMessage** | Text-based patient engagement | Health equity focus; SMS outreach; no transplant-specific content |
| **Omada Health** | Chronic condition virtual care | Diabetes, hypertension, MSK; not transplant |
| **Virta Health** | Diabetes reversal / weight loss | Nutrition-first; not transplant |

---

## 6. Strategic Positioning Opportunities

### 6.1 Against Transplant-Specific Incumbents

| Competitor | Positioning Opportunity |
|---|---|
| **CareDx** | Emphasize modern patient experience, care team coordination, and **pre-transplant readiness** (not just post-transplant diagnostics) |
| **Transplant Hero** | Emphasize **comprehensive journey management** (not just alarms), care team communication, and checklist-based readiness tracking |
| **iTransplant** | Emphasize **patient-facing** design (not logistics-only) and readiness workflows for patients (not just OPO staff) |

### 6.2 Against Generic Digital Care-Journey Players

| Competitor | Positioning Opportunity |
|---|---|
| **SeamlessMD / Commure / Get Well / Mytonomy** | Emphasize **transplant-specific workflows**, condition-specific content, and deep understanding of the 5-stage transplant journey |
| **ThoroughCare** | Emphasize **patient-centric design** (not care-manager-centric). Build for the patient first, with coordinator workflows as secondary benefit |

### 6.3 Feature Differentiation Opportunities

| Feature | Status in Market | Opportunity Level |
|---|---|---|
| Transplant-specific task/checklist management | **Absent** | **High** — core differentiator |
| Real-time patient-coordinator chat | **Absent** | **High** — modern expectation |
| Pre-transplant journey mapping (5 stages) | **Absent** | **High** — domain expertise signal |
| Living-donor workflow support | **Absent** | **Medium-High** — competitive moat |
| Transparent pricing | **Absent** | **Medium** — trust builder vs. opaque enterprise competitors |
| Medication adherence + alarm | Present (Transplant Hero) | **Table stakes** — must include |
| EHR integration (FHIR) | Present (all major players) | **Table stakes** — must include |
| AI-powered personalization | Emerging | **Medium** — expected in 2–3 years |

### 6.4 Go-to-Market Signals

1. **Target early adopters:** Transplant coordinators and social workers who currently use spreadsheets and phone trees to manage patient readiness.
2. **Land with a narrow, high-value use case:** Start with kidney transplant readiness checklist before expanding to full journey management.
3. **Integrate, don't replace:** Position as a coordination layer on top of Epic/Cerner.
4. **Consider transparent pricing:** Publish clear per-patient or per-program pricing to differentiate from opaque enterprise competitors.

---

## 7. Evidence Gaps & Knowledge Gaps

### 7.1 Pricing Gaps (Universal)

| Competitor | Pricing Status |
|---|---|
| CareDx | UNKNOWN — likely insurance/reimbursement driven |
| Transplant Hero | UNKNOWN — consumer app; no pricing page found |
| iTransplant | UNKNOWN — enterprise B2B |
| SeamlessMD | UNKNOWN — B2B SaaS |
| Commure | UNKNOWN — enterprise sales model |
| Get Well | UNKNOWN — enterprise health system contracts |
| Mytonomy | UNKNOWN — now part of Elsevier |
| ThoroughCare | UNKNOWN — B2B SaaS |

**Implication:** All competitors use opaque B2B enterprise sales models. Transparent pricing could be a meaningful differentiation and trust signal, but also risks anchoring too low.

### 7.2 Quantitative Gaps

| Gap | Impact |
|---|---|
| Actual patient app screenshots / UX across competitors | HIGH — reliance on website copy, not in-app inspection |
| Number of transplant patients served by each competitor | HIGH — no public metrics found |
| Transplant Hero active user count | MEDIUM — no public metrics |
| NephroAssist-specific ICP validation (persona interviews) | HIGH — no primary research with transplant coordinators or patients has been conducted |
| Actual willingness-to-pay data from transplant programs | HIGH — no pricing sensitivity research conducted |

### 7.3 Market Data Gaps

| Gap | Impact |
|---|---|
| Size of living-donor coordination software sub-market | MEDIUM — growing segment, size unquantified |
| German/EU transplant center IT spending on patient engagement | MEDIUM — needed for DiGA/GDPR market sizing |
| Post-transplant adherence software market size | MEDIUM — adjacent expansion opportunity |

### 7.4 Contradictions to Resolve

1. **CareDx breadth vs. depth:** CareDx claims to support patients "across the entire transplant journey" but offers no patient-facing task/checklist app. This is a marketing claim vs. product reality gap that NephroAssist can exploit.
2. **Commure patient engagement deprioritization:** Commure's Engage product (Memora Health acquisition) appears to have been deprioritized in favor of RCM/ambient AI. This suggests the patient engagement market may be harder to monetize than enterprise RCM, OR that Commure's strategy shift opens space for a focused player.
3. **AI as differentiator vs. hygiene factor:** Competitors position AI as a core differentiator, but in a regulated clinical context, AI recommendations for transplant decisions face extreme liability. NephroAssist should adopt AI cautiously — for workflow automation and personalization, NOT for clinical decision support.

---

## 8. Key Findings Summary

1. **Market gap is real and defensible.** No competitor combines transplant-specific patient onboarding, task/checklist management for pre-transplant readiness, real-time care team communication, and transparent compliance in one patient-facing application.

2. **The addressable market is niche but high-value.** ~250 U.S. programs, ~90,000 kidney waiting-list patients. A SaaS at $5K–$50K/year per program addresses $1.25M–$12.5M U.S. TAM.

3. **Regulatory compliance is table stakes, not a differentiator.** HIPAA, GDPR, and potentially DiGA/BfArM compliance are mandatory. NCQA prevalidation or HITRUST r2 certification could become competitive moats.

4. **EHR integration is mandatory.** Epic/Cerner FHIR connectivity is expected by buyers. Position as a coordination layer, not an EHR replacement.

5. **Sales cycles are long (12–24 months).** Enterprise health system procurement is slow. Early traction should target individual transplant coordinators and smaller programs with less bureaucratic buying processes.

6. **Patient trust and usability are critical.** Transplant patients are vulnerable and often older. Any patient-facing tool must be simple, caregiver-friendly, and privacy-proven.

7. **Living-donor workflows represent an underserved expansion vector.** As deceased-donor scarcity continues, living-donor evaluation and coordination workflows are a growing, poorly served sub-market.

---

## 9. Sources & Methodology

### Primary Sources
- **Live website inspection** via `curl` with standard browser user-agent (competitor homepages, product pages, pricing pages, patient pages)
- **Date of inspection:** 2026-08-14 (v1), 2026-08-28 (v2)
- **Provenance tagging:** `FACT` (observed on live site), `COMPANY CLAIM` (marketing language), `INFERENCE` (logical deduction), `UNKNOWN` (not disclosed), `ASSUMPTION` (established for modeling purposes)

### Authoritative External Sources
1. SRTR — The Organ Transplant Journey (https://srtr.org/patients-care-partners/the-organ-transplant-journey/)
2. SRTR — Program-Specific Reports (https://srtr.org/transplant-professionals/program-specific-report/)
3. WHO — Fact Sheet: Transplantation (https://www.who.int/news-room/fact-sheets/detail/transplantation)
4. GDPR (Regulation EU 2016/679) (https://gdpr-info.eu/)
5. HHS — HIPAA Security Rule (https://www.hhs.gov/hipaa/for-professionals/security/)
6. CMS — Medicare Coverage of Organ Transplants (https://www.cms.gov/medicare/coverage/organ-transplants)
7. BfArM — Digital Health Applications (DiGA) (https://www.bfarm.de/EN/Medical-devices/DiGA/_node.html)
8. Eurotransplant (https://www.eurotransplant.org/)
9. NHS Blood and Transplant (https://www.nhsbt.nhs.uk/)
10. American Society of Transplantation (https://www.myast.org/)

### Prior Research Artifacts Consolidated
- `docs/transplant-journey-regulations-market-report.md` (market-researcher, t_17542e1a, 2026-08-14)
- `docs/competitor-analysis.md` (competitor-researcher, t_05397706, 2026-08-14)
- `marketing/transplant-platform-competitor-analysis-v2.md` (competitor-researcher, t_7003a2a8, 2026-08-28)

---

*Report consolidated by research-lead for Kanban task t_c269008b. Ready for downstream financial modeling (t_59df76ad) and GTM planning (t_9f0a98cb).*
