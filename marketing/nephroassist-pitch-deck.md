# NephroAssist — Pitch Deck

**Transplant-Specific Patient Readiness & Care-Coordination Platform**

*Prepared for investors and strategic partners | August 2026*

---

## Slide 1: Problem — The Transplant Coordination Crisis

Transplant coordinators manage the most complex, high-stakes patient journey in medicine — with spreadsheets, phone trees, and sticky notes.

- **90,000+** kidney patients on the U.S. waiting list (SRTR/OPTN)
- **250+** transplant programs in the U.S. alone
- Coordinators juggle **50+ patients** across 5 distinct evaluation stages
- **10+ hours/week** lost chasing documents and reminding patients
- Missed appointments and incomplete evaluations **delay listing by weeks or months**
- **No dedicated tool exists** for pre-transplant patient readiness coordination

> "We track everything in Excel. When a coordinator is out sick, nobody knows where anything stands."
> — Transplant Coordinator, Midwest Academic Medical Center

---

## Slide 2: Solution — NephroAssist

The first transplant-specific readiness platform that sits between the EHR and the patient.

**What it does:**
- Structured, organ-specific readiness checklists (kidney → heart, liver, lung)
- Real-time patient-coordinator chat (not phone-only like CareDx)
- Automated document collection and review workflows
- Medication adherence reminders with care-team visibility
- Patient education mapped to the 5-stage transplant journey

**How it integrates:**
- SMART on FHIR launch from Epic/Cerner — read labs, appointments, demographics
- Positioned as a **coordination layer**, not an EHR replacement
- HIPAA-ready architecture; GDPR localization path for EU

---

## Slide 3: Market — Niche, Sticky, Underserved

| Metric | Value | Source |
|--------|-------|--------|
| U.S. transplant programs | ~250+ | SRTR/OPTN |
| U.S. kidney waiting-list patients | ~90,000 | SRTR |
| Annual U.S. transplants | ~40,000+ | SRTR |
| EU+UK programs | ~250–300 | Eurotransplant + NHSBT |
| Annual EU+UK transplants | ~17,000+ | Eurotransplant + NHSBT |

**Addressable Market (U.S. only):**
- TAM at $5K–$50K/program/year: **$1.25M–$12.5M annually**
- Expansion to EU+UK roughly doubles the program count
- Post-transplant adherence, living-donor coordination, and pediatric modules extend TAM further

**Why this market wins:**
- Sticky: transplant programs rarely switch tools mid-cycle
- Mission-critical: listing delays directly affect patient survival
- Currently served by EHR modules with known usability gaps

---

## Slide 4: Product — Four Layers of Value

```
┌─────────────────────────────────────────────┐
│  Layer 4: Intelligence & Analytics          │
│  — Coordinator dashboards, completion rates, │
│    time-to-listing metrics, SRTR reporting    │
├─────────────────────────────────────────────┤
│  Layer 3: Transplant Workflow Engine          │
│  — Organ-specific checklists, document review, │
│    approval chains, audit trails              │
├─────────────────────────────────────────────┤
│  Layer 2: Dialysis & Pre-Transplant Coordination│
│  — Appointment scheduling, lab tracking,        │
│    referral management, care-team chat        │
├─────────────────────────────────────────────┤
│  Layer 1: Patient Execution Layer             │
│  — Mobile PWA, task checklists, medication    │
│    reminders, educational content, progress   │
│    tracking                                   │
└─────────────────────────────────────────────┘
```

**MVP scope (Months 1–6):** Layer 1 + Layer 2 for kidney only
**Phase 2 (Months 6–18):** Add heart, liver, lung modules; living-donor workflows
**Phase 3 (Months 18–36):** AI-powered personalization, EU expansion, SRTR automation

---

## Slide 5: Competitive Landscape — The Gap Is Real

| Competitor | Transplant-Specific? | Patient Checklist? | Real-Time Chat? | Weakness |
|------------|---------------------|-------------------|-----------------|----------|
| **CareDx** | High (diagnostics) | No | Phone-only | No patient-facing readiness app |
| **Transplant Hero** | High (alarms only) | No | No | Alarm-only; no care team |
| **iTransplant / InVita** | High (logistics) | No | Yes (OPO teams) | Not patient-facing |
| **SeamlessMD** | Low | Yes | Partial | Not transplant-specific |
| **Get Well Network** | Low | Partial | Partial | Very broad; not transplant-specific |
| **Mytonomy** | Low | Partial | Partial | Education-heavy, light task mgmt |
| **ThoroughCare** | Low | Yes | No | Care-manager-centric, not patient-centric |
| **NephroAssist** | **High** | **Yes** | **Yes** | **Early stage — first-mover in gap** |

**Strategic positioning:**
- Against transplant incumbents: "We own pre-transplant coordination, not post-transplant diagnostics."
- Against generic players: "They offer 50 care journeys. We offer one — and we know every step."

---

## Slide 6: Business Model — Land-and-Expand B2B SaaS

| Tier | Target | Annual Price | Scope |
|------|--------|--------------|-------|
| **Free** | Individual patients & caregivers | €0 | Personal checklist, alarms, education |
| **Starter** | Small programs (≤50 patients) | €2,999/year | Coordinator dashboard, templates, basic analytics |
| **Professional** | Medium programs (≤200 patients) | €7,999/year | Care-team chat, FHIR integration, custom workflows |
| **Enterprise** | Large health systems / IDNs | €20K–€50K/year | Unlimited, SSO, SLA, dedicated CSM, custom integrations |

**Pricing rationale:**
- All competitors use opaque enterprise sales — transparent pricing is a trust differentiator
- Starter tier is low enough to bypass committee approval in some centers
- Enterprise priced 20–40% below equivalent generic platforms to win displacement

**Freemium flywheel:** Free patient app → viral coordinator invitations → trial → paid conversion

---

## Slide 7: Traction & Pilot Readiness

**Current state:**
- Existing Next.js codebase with patient/case/task workflows
- Document upload & review pipeline
- Dashboard & analytics views
- Bootstrap 5.3 PWA-ready UI

**Security & compliance gaps being closed:**
- Middleware JWT bypass (P0) — fix in progress
- Hardcoded fallback secret (P0) — fix in progress
- Rate limiting (P0) — implementation scheduled
- SOC 2 Type II audit engagement: Month 3 target

**Pilot strategy:**
- Target 1 academic + 1 community program for diversity
- 90-day pilot with defined success metrics (checklist completion rate, coordinator time saved)
- Manual contracts; no self-serve billing required for first revenue

---

## Slide 8: Competitive Advantage — Why We Win

1. **Domain depth:** Only platform built for the 5-stage pre-transplant journey (consideration → center selection → evaluation/listing → waiting → offer/surgery)

2. **First-mover in the gap:** No competitor combines transplant-specific checklists + real-time patient-coordinator chat + document workflows

3. **Compliance-first architecture:** HIPAA-ready on day one; GDPR localization path; granular consent management (none of the generic competitors expose this)

4. **Integration, not replacement:** SMART on FHIR launch from Epic/Cerner reduces procurement friction vs. rip-and-replace

5. **Coordinator-first design:** Built for the daily pain point, not the CIO's checklist

---

## Slide 9: Financial Projections — Three Scenarios

**24-Month Revenue (Zero-Bootstrap Model):**

| Scenario | Y1 Revenue | Y2 Revenue | 24-Mo Total |
|----------|------------|------------|-------------|
| **BEAR** (30%) | €2,750 | ~€0 | €2,750 |
| **BASE** (50%) | €14,835 | €98,838 | €113,673 |
| **BULL** (20%) | €83,688 | €403,026 | €486,714 |
| **Risk-adjusted expected** | | | **€155,005** |

**Key assumptions:**
- Founder-only, zero paid marketing (CAC ≈ €0)
- Infrastructure cost: €70–€120/month
- Monthly churn: 3–8% (Starter/Pro); annual churn: 15–50% (Enterprise)
- Time to first paying customer: 3–9 months

**Unit economics (BASE):**
- Starter LTV: €5,000 | Professional LTV: €13,333 | Enterprise LTV: €144,000
- Cash CAC: €0 | LTV:CAC = infinite on cash basis

---

## Slide 10: Regulatory Pathway — Compliance as Moat

| Jurisdiction | Framework | Status |
|--------------|-----------|--------|
| **United States** | HIPAA + HITECH | Architecture designed; BAA negotiations pending |
| **European Union** | GDPR (Article 9 special-category data) | DPIA scheduled Month 6; EU hosting architecture Month 9 |
| **Germany** | BfArM DiGA fast-track | Feasibility assessment Month 12–18 |
| **United Kingdom** | NHS Data Security Standards | Phase-3 expansion via NHSBT partnership |

**Compliance milestones:**
- Month 1: HIPAA Security Rule gap analysis
- Month 2: Signed BAAs with cloud provider + sub-processors
- Month 3: SOC 2 Type II auditor engagement
- Month 6: GDPR DPIA complete
- Month 12: SOC 2 Type II report issued

**Why this matters:** In healthcare SaaS, non-compliance is a terminal risk. A competitor with more features but no SOC 2 loses to a compliant vendor every time.

---

## Slide 11: Team & Vision

**Founder-led, domain-informed, compliance-first.**

The team combines healthcare SaaS product experience with deep understanding of the transplant coordinator workflow. The technical stack (Next.js, PostgreSQL, Prisma, Bootstrap) is production-tested and evolvable.

**Vision:**
> Every transplant patient, anywhere in the world, should have a clear, trackable path from referral to transplant — and every coordinator should know exactly where every patient stands, without opening a spreadsheet.

**Near-term milestones:**
- Month 3: First pilot clinic live
- Month 6: First paying customer
- Month 12: SOC 2 Type II + 10 paying customers
- Month 18: First Enterprise contract + FHIR read integration
- Year 2: Multi-organ expansion + EU market entry

---

## Slide 12: The Ask — Use of Funds

**Seeking:** Angel / Pre-Seed round to accelerate from zero-bootstrap to first 10 paying customers

| Use of Funds | Allocation | Purpose |
|--------------|------------|---------|
| Security & compliance | 30% | SOC 2 Type II audit, HIPAA gap remediation, penetration testing |
| Engineering | 35% | FHIR integration, multi-tenant hardening, living-donor module |
| Sales & pilot support | 20% | First CSM hire, pilot success metrics tracking, case-study production |
| Legal & operations | 15% | BAAs, GDPR DPIA, incorporation, cyber insurance |

**Success metrics for this round:**
- 10+ paying customers across 3+ transplant programs
- €5K+ MRR
- Net revenue retention >100%
- SOC 2 Type II clean report
- 1 published pilot case study with time-to-listing improvement data

**Contact:**
- Email: [investors@nephroassist.com]
- LinkedIn: [linkedin.com/company/nephroassist]
- Website: [nephroassist.com]

---

*All market data sourced from SRTR/OPTN, WHO, Eurotransplant, NHSBT, and live competitor website inspection. Financial projections are scenario-planning tools, not forecasts. Assumptions are explicitly stated in the Zero-Budget Financial Model (t_59df76ad).*
