# NephroAssist — Business Strategy and Compliance Roadmap

**Task:** t_7a710525  
**Date:** 2026-08-28  
**Author:** business-strategist  
**Basis:** market-research (t_5faf9643 / t_17542e1a) and competitor-analysis (t_7003a2a8 / t_05397706)

---

## Executive Summary

NephroAssist is a **transplant-specific patient readiness and care-coordination SaaS** that sits between the EHR and the patient. There is no direct competitor offering transplant-specific task/checklist management combined with real-time patient-coordinator communication. The strategy is to **land with a narrow, high-value use case** (kidney transplant readiness coordination), prove ROI at 3–5 early-adopter transplant centers, then expand to other organs, regions, and adjacent workflows (living donor, post-transplant).

**Key strategic choices this document justifies:**
1. **Land-and-expand B2B SaaS** (not B2C freemium) because hospital procurement is the only scalable revenue path.
2. **Position above the EHR, not against it** — integration, not replacement.
3. **Prioritize HIPAA/GDPR compliance before any ML/AI features** because regulatory trust is the primary purchase driver in healthcare.
4. **Target transplant coordinators as the initial buyer persona** — they are the daily pain point, not CIOs.
5. **Start with kidney only** — largest volume, clearest checklist, most coordinator pain.

---

## 1. Recommended Business Model and Pricing Approach

### 1.1 Model: Land-and-Expand B2B SaaS (Hospital-Facing)

**Why not B2C?** Transplant Hero is a consumer alarm app, but its monetization is unclear and its reach is limited. Patients do not control hospital budgets, and hospital procurement is a 12–24 month cycle — a B2C patient app cannot bypass that. The paying customer must be the transplant center or the health system.

**Why not DiGA-first?** Germany’s DiGA fast-track is appealing for reimbursement, but it requires proof of a positive healthcare effect (study data) and adds 6–18 months of clinical validation before listing. It is a **Phase-2 expansion lever**, not the launch model.

**Chosen model:**
- **Primary revenue:** Annual subscription per transplant program / health system.
- **Secondary revenue (Phase-2):** Per-patient coordination fee for living-donor workup modules; per-module add-ons (pediatrics, heart, lung).
- **Tertiary revenue (Phase-3):** Data insights / benchmarking for SRTR/OPTN reporting (anonymized, aggregated).

### 1.2 Pricing Structure

| Tier | Target | Scope | Estimated Annual Price (USD) | Rationale |
|------|--------|-------|-----------------------------|-----------|
| **Starter** | Single transplant program (1 organ type, ≤1,000 active patients) | Core readiness checklist + coordinator chat + basic patient education | $18,000–$30,000 | Low enough to bypass committee approval in some centers; land-and-prove |
| **Professional** | Multi-organ program or small health system (1–3 programs) | Starter + multi-organ modules + FHIR integration + analytics dashboard + priority support | $50,000–$85,000 | Anchors against SeamlessMD/ThoroughCare enterprise pricing; justified by reduced no-shows and faster listing |
| **Enterprise** | Large health system / IDN (5+ programs) | All modules + custom workflows + dedicated CSM + SSO/SAML + on-premise/private-cloud option + SLAs | $120,000–$250,000 | Competes with Get Well/CareDx contracts; priced at 20–40% below equivalent generic platforms to win displacement |

**Pricing assumptions:**
- Transplant programs have IT budgets for point solutions in the $20K–$100K range (FACT: CareDx and SeamlessMD both sell B2B but disclose no pricing; ThoroughCare and Get Well are similarly opaque).
- A 50-patient improvement in listing speed or a 20% reduction in evaluation no-shows justifies the subscription cost within one fiscal year.

### 1.3 Revenue Projections (Illustrative)

| Phase | Timeline | Milestone | Assumed ARR |
|-------|----------|-----------|-------------|
| **Pilot** | Months 1–6 | 3 kidney programs on Starter/Professional | ~$75K |
| **Land** | Months 6–18 | 10 programs (mix of Starter/Professional) | ~$400K |
| **Expand** | Months 18–36 | 30 programs + first Enterprise contract | ~$1.5M |
| **Scale** | Years 3–5 | EU expansion, living-donor module, heart/lung | $5M–$10M |

> **Assumption dependency:** These projections assume a 12-month average sales cycle for the first deal and 6–9 months for expansion within existing health systems. If EHR integration (Epic/Cerner FHIR) takes longer than 4 months, the timeline shifts right by 2–3 months per deal.

---

## 2. Value Proposition and Competitive Positioning

### 2.1 Core Value Proposition

> **For transplant coordinators who currently manage patient readiness with spreadsheets, phone trees, and sticky notes, NephroAssist is a transplant-specific coordination layer that replaces fragmented manual tracking with structured checklists, real-time patient communication, and automated task workflows — integrated on top of Epic or Cerner, not instead of them.**

### 2.2 Differentiation Matrix

| Competitor Layer | Player | Their Strength | Their Weakness | Our Positioning |
|------------------|--------|----------------|----------------|-----------------|
| **Transplant-specific** | CareDx | Deep clinical credibility; diagnostics + pharmacy | No patient-facing task/checklist app; phone-heavy support | "We coordinate readiness *before* CareDx takes over post-transplant. We are the patient experience layer they lack." |
| **Transplant-specific** | Transplant Hero | Only consumer transplant app | Alarm-only; no care team integration; no EHR | "We are what Transplant Hero would be if it were built for hospitals, not just patients." |
| **Transplant-specific** | iTransplant (InVita) | Donor-logistics leader | Not patient-facing; built for OPOs, not coordinators | "We serve the patient side of the same workflow you manage on the donor side." |
| **Generic digital care** | SeamlessMD, Get Well, Commure, Mytonomy | Broad feature sets; massive install bases | Not transplant-specific; generic checklists | "They offer 50 care journeys. We offer one — and we know every step of the kidney transplant path better than anyone." |
| **Care coordination** | ThoroughCare | Strong task mgmt; NCQA prevalidation | Care-manager-centric, not patient-centric | "Built for the patient first, with the coordinator’s workflow as a natural consequence." |

### 2.3 Competitive Positioning Statement

**Against generic players:** Deep, organ-specific workflow knowledge that generic platforms cannot replicate without months of customization.

**Against transplant incumbents (CareDx):** Modern patient experience and real-time care team coordination, not just diagnostics and pharmacy.

**Against consumer apps (Transplant Hero):** Hospital-grade compliance, EHR integration, and care-team reach — the app patients actually need.

### 2.4 Key Messaging Pillars

1. **"The only transplant readiness platform built by people who know the checklist."** — Domain expertise as trust signal.
2. **"Your patients see progress. You see compliance."** — Dual-value (patient engagement + coordinator efficiency).
3. **"No rip-and-replace. Works with Epic and Cerner."** — Reduces procurement risk.
4. **"HIPAA-ready on day one. SOC 2 Type II in six months."** — Compliance-first credibility.

---

## 3. Prioritized Feature Roadmap

### 3.1 Prioritization Framework

We use a **RICE + Risk** hybrid:
- **Reach:** How many transplant programs benefit?
- **Impact:** Reduction in coordinator workload or improvement in patient readiness?
- **Confidence:** How certain are we based on competitor gaps and market research?
- **Effort:** Engineering months to ship a production-grade, compliant feature?
- **Regulatory Risk:** Does this trigger FDA 510(k), DiGA, or medical-device classification?

### 3.2 Phase 1: MVP — "Kidney Readiness Core" (Months 1–6)

| Feature | Rationale | Regulatory Risk |
|---------|-----------|-----------------|
| **Transplant-specific readiness checklist** (kidney) | Highest-impact gap per competitor analysis. Every center uses a paper or spreadsheet checklist today. | Low — educational/task-tracking, not diagnostic |
| **Patient-coordinator real-time chat** | No competitor offers this for transplant. High patient satisfaction signal. | Medium — must be logged, encrypted, HIPAA-compliant |
| **Basic patient education modules** (5 journey stages) | Table stakes; Mytonomy and SeamlessMD both have this. | Low — informational only, no medical advice |
| **Medication adherence reminders** | Transplant Hero proves demand; we add care-team visibility. | Low — reminder only, no dosing recommendation |
| **FHIR read integration** (Epic/Cerner) | Must-have for procurement. Read-only labs, appointments, demographics. | Medium — requires BAA, audit logging |

**Why kidney first?**
- Largest volume: ~70% of solid-organ transplants globally (WHO FACT).
- Most standardized checklist: evaluation labs, psychosocial clearance, financial clearance, living vs. deceased donor selection.
- Greatest coordinator pain: kidney waiting lists are longest (~90,000 in U.S.), so coordinators manage the most patients simultaneously.

### 3.3 Phase 2: Expansion — "Multi-Organ + Living Donor" (Months 6–18)

| Feature | Rationale |
|---------|-----------|
| **Heart, liver, lung transplant modules** | Expands TAM from ~250 kidney programs to ~250+ multi-organ programs in the U.S. alone. Each organ has distinct evaluation criteria. |
| **Living-donor workflow support** | High differentiation; no competitor addresses this. Living-donor evaluation is a parallel checklist that current coordinators track manually. |
| **FHIR write integration** (patient-reported outcomes, care plans) | Moves from passive read to active EHR contribution. Medium regulatory risk — requires two-factor clinician approval for writes. |
| **Coordinator dashboard + analytics** | Quantify ROI for renewal / upsell: time-to-listing, no-show rates, checklist completion rates. |
| **Care-team role expansion** (social worker, dietitian, financial counselor views) | Matches the multi-role evaluation workflow documented in market research. |

### 3.4 Phase 3: Scale — "AI, Benchmarking, EU" (Months 18–36)

| Feature | Rationale | Caveat |
|---------|-----------|--------|
| **AI-powered personalization** (e.g., "based on your checklist progress, here are the next 3 steps") | Get Well (RhythmX) and Commure both position AI as core. | Must NOT give medical advice; requires FDA SaMD boundary analysis. Red-line task for security-reviewer + legal. |
| **SRTR/OPTN reporting automation** | Transplant centers are mandated to report; automating this is a massive stickiness driver. | Requires data-format alignment; medium effort. |
| **EU expansion** (GDPR localization, Eurotransplant integration) | Eurotransplant covers 8 countries with >13,000 transplants annually. | Must complete GDPR DPIA and localize hosting. |
| **Pediatric module** | Distinct workflows, caregiver-proxy consent, and child-appropriate UX. | Adds COPPA (U.S.) and additional consent layers. |

### 3.5 What We Are Explicitly De-Prioritizing

| Feature | Reason |
|---------|--------|
| **Patient-facing mobile app (native iOS/Android)** | Web-first Progressive Web App (PWA) is sufficient for MVP. Native apps add 3–6 months and App Store compliance friction. |
| **Telehealth / video visits** | Saturated space (Teladoc, Amwell, Doxy.me). Not a differentiator for transplant readiness. |
| **Financial / insurance navigation as a primary feature** | Useful but not a purchase driver; Cerner and Epic already handle billing workflows. |
| **Organ-offer decision support** | Life-or-death stakes; any AI here triggers FDA SaMD classification. Explicitly out of scope for 36 months. |

---

## 4. Regulatory and Compliance Strategy

### 4.1 Jurisdiction Rollout Order

| Priority | Market | Primary Framework | Entry Strategy |
|----------|--------|-------------------|----------------|
| **1** | United States | HIPAA + HITECH + state privacy laws | Launch market. Sign BAAs with hosting provider (AWS/Azure/GCP) and any sub-processors. Target SOC 2 Type II within 6 months of first paid customer. |
| **2** | European Union | GDPR + national health laws | Delay launch until DPIA is complete, Standard Contractual Clauses (SCCs) are in place for U.S.–EU transfers, and EU-hosted option is available. Target Germany (BfArM/DiGA awareness) as first EU market. |
| **3** | United Kingdom | UK GDPR + NHS Data Security Standards | Requires NHS Data Security and Protection Toolkit compliance. Best pursued via NHSBT partnership or pilot, not direct sales. |

### 4.2 Compliance Milestone Roadmap

| Milestone | Target Date | Owner | Evidence |
|-----------|-------------|-------|----------|
| HIPAA Security Rule gap analysis | Month 1 | compliance-officer | Documented risk register |
| Signed BAA with cloud provider + all sub-processors | Month 2 | compliance-officer | Executed contracts |
| SOC 2 Type II audit engagement | Month 3 | compliance-officer | Engagement letter with auditor |
| GDPR DPIA complete | Month 6 | compliance-officer | Published DPIA document |
| ISO 27001 readiness assessment | Month 9 | compliance-officer | Gap report |
| SOC 2 Type II report issued | Month 12 | compliance-officer | Clean auditor report |
| DiGA feasibility assessment (Germany) | Month 12–18 | compliance-officer + product | Go/No-Go decision document |

### 4.3 Patient Data Consent Architecture

**United States:**
- HIPAA permits treatment-based disclosure without explicit per-feature consent, BUT:
- The platform must display a **Notice of Privacy Practices (NPP)** equivalent at onboarding.
- Any non-treatment use (analytics, benchmarking, product improvement) requires **opt-in consent** or de-identification to Safe Harbor standard.

**European Union:**
- Health data is Article 9 "special category data."
- Lawful basis for clinical use: **Article 9(2)(h)** — healthcare treatment.
- Lawful basis for analytics / AI training: **explicit consent (Article 9(2)(a))** — must be granular, revocable, and separately auditable.
- Cross-border transfer to U.S.: requires EU-U.S. Data Privacy Framework certification or SCCs with Transfer Impact Assessment (TIA).

**Design implication:** Build a **granular consent-management module** from day one. Do not assume a single blanket consent covers all use cases. This is not just a compliance requirement — it is a product differentiator because none of the generic competitors (SeamlessMD, Get Well) expose this level of patient control.

### 4.4 Clinical Workflow Integration Strategy

**EHR Integration:**
- **Phase 1 (read-only):** SMART on FHIR launch from Epic/Cerner patient context. Read demographics, appointments, labs, allergies, medications. No writeback.
- **Phase 2 (write with approval):** Write patient-reported outcomes (PROs) and care-plan tasks back to EHR, but only after clinician review and electronic signature.
- **Phase 3 (bidirectional sync):** Full care-plan synchronization. Requires extensive testing with each EHR version.

**UNOS/OPTN / Eurotransplant Integration:**
- Read-only integration with SRTR/OPTN data feeds for waiting-list status and outcome benchmarks.
- No direct write access to OPTN — that is reserved for transplant center administrators with UNOS credentials.
- Eurotransplant integration requires bilateral agreement and is a Phase-3 initiative.

---

## 5. Tradeoff Analysis and Risk Assessment

### 5.1 Strategic Tradeoffs

#### Tradeoff 1: Narrow vs. Broad — Kidney-Only MVP vs. Multi-Organ from Day One

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Kidney-only MVP** | Fastest time-to-value; deepest domain expertise; largest patient volume; easiest pilot recruitment | Smaller headline TAM; risk of being perceived as "just a kidney tool" | **Choose this.** Speed and credibility matter more than TAM breadth at this stage. |
| **Multi-organ from launch** | Larger addressable market per sales conversation; broader press coverage | 3–4x engineering effort; each organ has distinct evaluation criteria; dilutes focus; harder to prove ROI | Defer to Phase 2. |

#### Tradeoff 2: B2B SaaS vs. B2C Freemium

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **B2B SaaS (hospital-facing)** | Scalable revenue; aligns with procurement budget; coordinator is daily user; EHR integration is natural | 12–24 month sales cycles; needs enterprise compliance (SOC 2); requires field sales or strong inbound | **Choose this.** The only path to meaningful revenue in healthcare SaaS. |
| **B2C freemium (patient-facing)** | Faster user acquisition; viral potential; no procurement friction | No clear revenue model; patients cannot pay for hospital tools; disconnected from coordinator workflows; CareDx already owns post-transplant patient trust | Reject. Transplant Hero has not proven this model is venture-scalable. |

#### Tradeoff 3: Compliance-First vs. Feature-First

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Compliance-first** | Enables hospital sales; prevents downstream rebuild; builds trust with clinical buyers; SOC 2 / HIPAA are procurement gates | Slower feature velocity; higher upfront cost (~$50K–$100K for audit prep); forces disciplined engineering | **Choose this.** In healthcare, non-compliance is a terminal risk. A competitor with more features but no SOC 2 loses to a compliant vendor every time. |
| **Feature-first** | Faster demo; more impressive pitch decks; earlier user feedback | Rejected by procurement; potential breach liability; costly retrofit later; reputational damage if PHI exposed | Reject. |

#### Tradeoff 4: Build vs. Buy — EHR Integration

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Build FHIR integration in-house** | Full control; no vendor dependency; deeper Epic/Cerner expertise over time | 2–3 months per EHR; requires HL7 expertise; ongoing maintenance burden | **Choose a hybrid:** Use SMART on FHIR launch framework (open standard) for Phase 1. Evaluate third-party FHIR middleware (e.g., 1upHealth, Health Gorilla) for Phase 2+ to accelerate multi-EHR support. |
| **Buy third-party middleware** | Faster time-to-market; handles EHR-version differences | Vendor lock-in; per-transaction cost; another BAA to manage | Use selectively after Phase 1. |

### 5.2 Risk Assessment Matrix

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **EHR integration takes >6 months** | Medium | High | Start with SMART on FHIR (widely supported); have fallback manual CSV import for pilot; engage Epic/Cerner App Orchard early | developer-lead |
| **Sales cycle exceeds 18 months** | Medium | High | Target mid-tier transplant programs (not IDNs) for first deals; offer 90-day pilot with success metrics; leverage AST/SRTR conference presence | sales-lead |
| **CareDx or Epic launches transplant readiness feature** | Low-Medium | Very High | Maintain narrow focus (kidney checklist depth); build coordinator community/loyalty; own the patient-facing UX gap that EHRs ignore | product-lead |
| **HIPAA breach or GDPR complaint in early years** | Low | Existential | Compliance-first build; no PHI in dev/staging; automated security scanning; breach-response playbook; cyber insurance | compliance-officer |
| **FDA classifies checklist feature as SaMD** | Low | High | Keep all content educational; no diagnostic or therapeutic recommendations; legal review of all patient-facing copy; maintain clear "consult your care team" disclaimers | compliance-officer + legal |
| **Patient adoption is low (digital literacy, age)** | Medium | Medium | Design for accessibility (WCAG 2.1 AA); caregiver proxy access; SMS fallback for chat; large-font / high-contrast UI | ux-researcher |
| **Living in "pilot purgatory"** | Medium | High | Define clear pilot success metrics (checklist completion rate, coordinator time saved) in contract; convert pilots to paid contracts with automatic renewal clause | sales-lead |

### 5.3 Invalidation Scenarios (What Would Make This Strategy Wrong)

1. **If >30% of transplant coordinators say they are "satisfied with Epic MyChart + spreadsheets" and see no need for a separate tool.** → Pivot to EHR-embedded widget (SMART on FHIR app) rather than standalone platform.
2. **If CareDx acquires or builds a patient readiness app within 12 months.** → Accelerate differentiation on real-time chat and living-donor workflow; consider partnership rather than head-to-head competition.
3. **If hospital IT budgets for transplant programs collapse due to Medicare reimbursement cuts.** → Shift to per-patient coordination fee model (usage-based) to align with variable budgets.
4. **If GDPR enforcement makes U.S.-EU patient data flows prohibitively expensive.** → Delay EU expansion; focus exclusively on U.S. market for 24–36 months.

---

## 6. Recommended Next Steps

### Immediate (Next 2 Weeks)
1. **Validate pricing assumptions** with 3–5 transplant coordinator interviews. Do not build pricing in a vacuum.
2. **Confirm EHR integration feasibility** — contact Epic App Orchard and Cerner code program to understand SMART on FHIR approval timelines.
3. **Secure cyber insurance quote** and BAA template for cloud provider negotiations.

### Short-Term (Next 3 Months)
4. Complete HIPAA gap analysis and SOC 2 Type II auditor engagement.
5. Build kidney-specific readiness checklist MVP with 2 pilot partners (ideally 1 academic center + 1 community program for diversity).
6. Draft granular consent-management module specification (GDPR + HIPAA dual-compliant).

### Medium-Term (Months 3–12)
7. Convert pilots to paid contracts; document ROI case studies.
8. Launch Professional tier with FHIR read integration.
9. Publish first SOC 2 Type II report.
10. Begin GDPR DPIA and EU hosting architecture design.

### Long-Term (Year 2+)
11. Expand to heart/liver/lung modules.
12. Evaluate DiGA fast-track for German market entry.
13. Build SRTR/OPTN reporting automation as a stickiness driver.

---

## Appendix: Evidence Summary

| Claim | Source | Confidence |
|-------|--------|------------|
| No direct competitor offers transplant-specific readiness checklist + care team chat | Competitor analysis v2 (t_7003a2a8): live inspection of 8 competitor websites | High (FACT) |
| ~250 U.S. transplant programs; ~40,000+ transplants/year | Market report (t_17542e1a): SRTR/OPTN data | High (FACT) |
| 12–24 month hospital procurement cycles | Market report (t_17542e1a): industry standard; also observed in competitor pricing opaqueness | Medium (INFERENCE) |
| HIPAA penalties up to $2.1M+ per violation tier | Market report (t_17542e1a): HHS published penalty structure | High (FACT) |
| GDPR fines up to EUR 20M or 4% global turnover | Market report (t_17542e1a): GDPR text | High (FACT) |
| AI personalization expected within 2–3 years in healthcare | Competitor analysis v2: Get Well RhythmX, Commure AI positioning | Medium (INFERENCE) |

---

*Document generated by business-strategist profile for Kanban task t_7a710525.*
*Downstream tasks: t_5a502e1c (technical architecture), t_bbfeef62 (patient-facing content), t_6ad4d1f5 (implementation orchestration).*
