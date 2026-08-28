# NephroAssist — Zero-Budget Go-to-Market Action Plan

**Task:** t_9f0a98cb  
**Date:** 2026-08-28  
**Owner:** business-strategist  
**Sources:** SaaS Audit (t_c00353db), Consolidated Research (t_c269008b), Zero-Budget Financial Model (t_59df76ad)

---

## Executive Summary

**The honest verdict:** NephroAssist is not ready for a public, self-serve SaaS launch. The codebase has critical security gaps (middleware JWT bypass, no rate limiting, hardcoded secrets), zero billing infrastructure, and missing commercial pieces (password reset, email verification, legal pages). However, the product is **feature-rich enough for a closed beta with a single transplant clinic under a manual contract** — which is exactly how a zero-budget GTM should begin.

This plan rejects the temptation to "launch and hope." Instead, it prescribes a **phased, credibility-first GTM** that turns the current product limitations into a strategic advantage: by starting with one deep pilot, NephroAssist generates clinical testimonials, workflow validation, and case-study content that no amount of SEO or community posting can replicate.

**90-day headline:** One pilot clinic signed, critical security fixes shipped, and the first paying customer contracted manually before any self-serve infrastructure is built.

---

## 1. Strategic Foundation

### 1.1 Why Zero Budget Requires Discipline, Not Haste

With €0 starting capital, every hour of founder time must generate either:
- **Revenue signal** (a clinic willing to pay or pilot), or
- **Credibility asset** (testimonial, case study, content that attracts the next clinic).

The research confirms there is no direct competitor offering transplant-specific patient readiness coordination with care-team communication. The market is small (~250 U.S. programs), sticky, and underserved. A rushed self-serve launch that leaks patient data or crashes under load would destroy the trust required to compete against Epic/Cerner incumbents.

**Strategic choice:** Land one manual pilot first. Use it as the foundation for all subsequent zero-cost acquisition.

### 1.2 Product Readiness Reality Check

| Capability | Status | GTM Implication |
|------------|--------|-----------------|
| Core patient/case/task workflows | Ready | Can demo confidently |
| Document upload & review | Ready | Local storage acceptable for pilot |
| Dashboard & analytics | Ready | Can show clinic leadership ROI narrative |
| Security (JWT, rate limiting, tenant isolation) | **Not ready** | Must fix before ANY clinic handles real PHI |
| Billing/Stripe | Missing | Manual invoicing only; no self-serve |
| Password reset / email verification | Missing | Admin must create accounts manually |
| Legal pages (TOS, Privacy, Impressum) | Missing | Must create boilerplate before pilot |
| Public landing page / SEO | Minimal | Needs basic landing page |

**Source:** SaaS Audit Report (t_c00353db), Sections 3, 8, 9.

---

## 2. Ideal Customer Profile (ICP)

### 2.1 Primary ICP: The "Spreadsheet Coordinator"

The research and competitor analysis reveal a clear early-adopter persona:

| Attribute | Description |
|-----------|-------------|
| **Title** | Transplant Coordinator, Pre-Transplant RN, or Social Worker |
| **Organization** | Small-to-medium transplant program (1–3 coordinators), often academic medical center or community hospital |
| **Current workflow** | Excel/Google Sheets for patient tracking, phone calls for reminders, email for document collection, paper checklists for evaluation readiness |
| **Pain intensity** | HIGH — 50+ patients in various evaluation stages, missed appointments delay listing, document chasing consumes 10+ hours/week |
| **Buying influence** | MEDIUM — cannot sign enterprise contracts alone, but can champion to Medical Director or Program Manager |
| **Tech savviness** | MEDIUM — uses EHR daily, frustrated by its rigidity, willing to try lightweight tools if HIPAA-aligned |
| **Geographic sweet spot** | U.S. or EU (English-speaking or German-speaking, given current UI language) |

### 2.2 Secondary ICP: The "Innovation-Friendly Medical Director"

| Attribute | Description |
|-----------|-------------|
| **Title** | Medical Director of Transplant, Surgery Chair, or Quality Officer |
| **Pain** | SRTR reporting burden, waitlist mortality, patient no-shows, coordinator turnover |
| **Willingness to pay** | HIGH — if tool demonstrates waitlist acceleration or no-show reduction |
| **Sales cycle** | 3–6 months for pilot approval; needs data/ROI proof |

### 2.3 Why Not Patients First?

The financial model assumes a free patient app driving viral coordinator referrals. This is valid in BULL scenario, but with zero budget and an unproven product, patient acquisition without a clinical partner is a "leaky bucket" — patients sign up, find no coordinator connected, and churn. **The coordinator must be landed first.** The patient app becomes a retention/enrichment layer after the first clinic is live.

---

## 3. Positioning & Value Proposition

### 3.1 Positioning Statement

> For transplant coordinators who manage pre-transplant evaluations across spreadsheets and phone calls, NephroAssist is a transplant-specific readiness coordination platform that replaces manual tracking with structured checklists, real-time patient communication, and automated document collection — unlike generic care-journey tools (SeamlessMD, Get Well), we understand the five-stage transplant evaluation, and unlike EHR modules, we are built for the coordinator's workflow, not the billing department's.

### 3.2 Value Proposition by Stakeholder

| Stakeholder | Core Value | Proof Point (to generate in pilot) |
|-------------|-----------|-----------------------------------|
| Transplant Coordinator | "I spend 50% less time chasing documents and reminding patients." | Time-tracking study in pilot |
| Medical Director | "We listed patients 2 weeks faster because nothing fell through cracks." | Days-to-listing metric before/after |
| Patient / Caregiver | "I finally know exactly what I need to do and when." | NPS survey in pilot |
| Health System IT | "It integrates with Epic/Cerner via FHIR and doesn't require infrastructure." | FHIR read demo (even if mock) |

### 3.3 Differentiation vs. Competitors

| Competitor | Their Strength | Our Wedge |
|------------|---------------|-----------|
| CareDx | Deep clinical credibility, diagnostics | We own pre-transplant *coordination*, not post-transplant monitoring |
| SeamlessMD | Mature care-journey infrastructure | We are transplant-specific (not generic surgery) |
| Epic MyChart | Universal, EHR-native | We are coordinator-first, not billing-first; modern UX |
| Transplant Hero | Consumer app, free | We connect patient + coordinator in one system |

---

## 4. Pricing & Packaging (Manual-First)

### 4.1 Phase 1 Pricing: Manual Contract Only

Because billing infrastructure is missing, all pricing in Phase 1 is **manual invoicing** (PDF invoice, bank transfer, or Stripe Payment Link as a temporary workaround).

| Tier | Price | What the Pilot Clinic Gets |
|------|-------|---------------------------|
| **Pilot** | €0 for 90 days | Full Starter feature set, dedicated onboarding support, founder-accessible Slack/Teams channel |
| **Early Adopter** | €199/month (discounted from €299) | Locked-in price for 12 months; requires testimonial/case-study consent |
| **Annual Commitment** | €1,999/year | 2 months free; preferred for cash-flow planning |

**Rationale:** The financial model priced Starter at €299/month. For the first 3–5 customers, a 33% "early adopter discount" is justified in exchange for:
- A signed testimonial ("NephroAssist reduced our document-chasing time by 50%")
- Permission to publish a case study
- Introductions to 2 other transplant coordinators

These assets are worth far more than the €100/month discount because they enable all zero-cost acquisition channels.

### 4.2 Phase 2 Pricing (Self-Serve, Post-Audit-Remediation)

Once P0/P1 launch blockers are fixed (see Section 7), introduce self-serve tiers aligned with the financial model:

| Tier | Price | Target |
|------|-------|--------|
| **Free (Patient)** | €0 | Individual patients/caregivers; builds viral loop |
| **Starter** | €299/month | Small programs, 1 coordinator, up to 50 active patients |
| **Professional** | €799/month | Multi-coordinator teams, up to 200 patients, FHIR integration |
| **Enterprise** | €1,999–€4,999/month | Health systems, SSO, SLA, custom integrations |

**Source:** Financial Model (t_59df76ad), Section 2.

---

## 5. Zero-Cost Customer Acquisition Channels

### 5.1 Channel Hierarchy (Prioritized)

With €0 budget, channels are ranked by **credibility leverage per hour invested**:

| Priority | Channel | Weekly Time | Expected Output (MoM 3) |
|----------|---------|-------------|------------------------|
| 1 | **Pilot-driven referrals** | 5 hrs | 1 warm intro to another coordinator |
| 2 | **LinkedIn direct outreach** | 5 hrs | 10 personalized connection requests → 2 demo calls |
| 3 | **Organic content (case study → blog)** | 3 hrs | 1 published case study + 2 blog posts |
| 4 | **Community engagement** | 2 hrs | Reputation as helpful expert in 2 groups |
| 5 | **SEO (long-term)** | 2 hrs | 6 indexed posts; traffic negligible until MoM 6+ |

**Why this order:** A referral from a pilot coordinator converts at 30–50% (warm, trusted). A LinkedIn cold outreach to a coordinator who saw your case study converts at 5–10%. An SEO visitor converts at 0.5–2%. Founders with zero budget must stack the highest-conversion channels first.

### 5.2 Channel 1: Pilot-Driven Referrals (Highest Priority)

**Mechanism:** One happy coordinator introduces NephroAssist at regional transplant conferences, AST meetings, or Slack/Teams groups for transplant professionals.

**Execution:**
- Week 1 of pilot: Ask coordinator, "Who else do you know managing evaluations with spreadsheets?"
- Week 4: Request LinkedIn testimonial (even draft it for them).
- Week 8: Ask for email intro to 1–2 peers.
- Week 12: Offer "ambassador" perk — 3 months free for every converted referral.

**CAC:** €0. **Conversion rate:** 30–50% for warm intros.

### 5.3 Channel 2: LinkedIn Direct Outreach

**Target:** Search "Transplant Coordinator" + "RN" + "Pre-Transplant" in U.S. and D-A-CH regions.

**Message template (to customize):**
> Hi [Name], I saw you're a transplant coordinator at [Hospital]. I'm building a tool specifically for pre-transplant evaluation tracking — checklists, document collection, patient communication — because I noticed most coordinators are still managing it in spreadsheets. Would you be open to a 15-minute call to see if it matches your workflow? No pitch, just research.

**Why this works:** The research confirms coordinators are the power users and champions. A "research call" framing reduces resistance. The SaaS audit confirms the product is real and functional — the founder can screenshare actual workflows.

**Volume:** 10 personalized requests/week. **Target:** 1 demo call/week in Month 1, scaling to 2–3/week by Month 3.

### 5.4 Channel 3: Organic Content

**Content pillars:**
1. **"How [Hospital Name] Reduced Evaluation Delays"** (case study from pilot)
2. **"The Pre-Transplant Coordinator's Spreadsheet Problem"** (pain-point content)
3. **"5 Things Patients Forget Before Their Transplant Evaluation"** (patient-facing, shareable)

**Distribution:** Publish on LinkedIn (founder's profile), Medium, and a basic NephroAssist blog. Repurpose into 3–5 short LinkedIn posts per week.

**SEO note:** The financial model assumes 52 blog posts in Year 1 driving 1,560 monthly visits by Month 12. This is realistic IF content is transplant-specific and authoritative, but the first 6 months will generate <100 visits/month. **Do not rely on SEO for the first 90 days.** Use content as credibility collateral for outbound, not as a traffic source.

### 5.5 Channel 4: Community Engagement

**Communities to join (passive presence, active value):**
- Reddit: r/transplant, r/nursing
- Facebook: Private groups for transplant patients/caregivers
- LinkedIn: AST (American Society of Transplantation) group posts
- Professional: Transplant coordinators' association forums

**Rule:** Never post "Check out my app." Answer questions, share resources, mention your tool only when directly relevant. One genuine, detailed answer per day builds more trust than 50 spam posts.

### 5.6 Channel 5: Viral Loops (Deferred)

The financial model's "patient invites coordinator" viral loop is deferred to Phase 2. It requires:
- A polished free patient app (acceptable security)
- Self-serve coordinator signup (needs billing, password reset, email verification)
- At least 100 free patients to generate meaningful coordinator invites

**Timeline:** Introduce after first 3 paying clinics are live (Month 6–9).

---

## 6. Sales Motion

### 6.1 The "Manual Contract" Sales Process

Given zero budget and missing billing infrastructure, the sales motion is founder-led, manual, and consultative:

| Stage | Activity | Duration | Goal |
|-------|----------|----------|------|
| **1. Identify** | LinkedIn outreach, pilot referrals, AST directory | Ongoing | Book discovery call |
| **2. Discover** | 20-min call: "Walk me through your evaluation workflow." | 20 min | Qualify pain; confirm ICP fit |
| **3. Demo** | Screenshare actual NephroAssist with demo data. Show patient view + coordinator view. | 30 min | Generate "this solves my problem" moment |
| **4. Pilot proposal** | Offer 90-day free pilot with founder onboarding. No IT approval needed (cloud-hosted). | Async | Remove procurement barrier |
| **5. Pilot execution** | Founder manually onboards clinic, creates accounts, imports patient list (CSV). | 2–4 weeks | Generate "aha" moments and habit formation |
| **6. Convert** | Month 3 check-in: "Shall we make this official?" Offer early-adopter pricing. | 1 week | Signed annual or monthly contract (manual invoice) |
| **7. Expand** | Introduce additional coordinators, departments, or living-donor workflows. | Months 4–12 | Land-and-expand within clinic |

### 6.2 Objection Handling

| Objection | Response |
|-----------|----------|
| "We already use Epic." | "NephroAssist doesn't replace Epic — it sits on top, giving coordinators the task-specific view Epic doesn't have. We can FHIR-sync later." |
| "Is this HIPAA-compliant?" | "We use encryption in transit, audit logs, and role-based access. We will sign a BAA. For the pilot, no PHI leaves your control — we can even host in your environment." |
| "We need IT approval." | "The pilot requires zero IT integration. It's a web app. If your coordinators can use Gmail, they can use this." |
| "We have no budget." | "The pilot is free. If it saves 5 hours/week of coordinator time, that's €5,000/year in labor. The paid tier is €199/month." |

---

## 7. 90-Day Execution Milestones

### Phase 0: Pre-Launch Blocker Remediation (Weeks 1–2)

**These are NOT optional.** The audit identified P0 blockers that must be fixed before ANY clinic handles real data.

| Milestone | Owner | Evidence of Completion |
|-----------|-------|------------------------|
| Fix middleware JWT verification — actually decode and verify signature | Engineering | `src/middleware.ts` updated; manual test with forged cookie fails |
| Remove hardcoded fallback secret | Engineering | App fails to start if `NEXTAUTH_SECRET` missing; no fallback string |
| Add rate limiting to `/api/login` | Engineering | 5 attempts per IP per 15 min; tested with script |
| Strip demo accounts from production build | Engineering | `demoAccounts` array absent in production bundle |
| Add `organizationId` filtering to all data queries | Engineering | All Prisma queries include tenant scope; cross-tenant access tested and blocked |
| Create basic legal pages (TOS, Privacy Policy, Impressum) | Founder | Static pages published at `/legal/*` |
| Create minimal public landing page | Founder | Single-page site with problem, solution, demo video/screenshots, and "Request Pilot" CTA |

**Why this matters:** One data breach or unauthorized access during a pilot would be fatal in a HIPAA/GDPR context. The €0 budget does not excuse shipping insecure software to clinics.

### Phase 1: First Pilot Signed (Weeks 3–6)

| Week | Milestone | Success Criteria |
|------|-----------|-----------------|
| 3 | Identify 20 transplant coordinators via LinkedIn/AST directory | LinkedIn list of 20 names with hospitals |
| 3–4 | Send 20 personalized LinkedIn connection requests | 10 acceptances, 3 respond |
| 4–5 | Conduct 5 discovery calls | 3 confirm pain point; 2 agree to demo |
| 5–6 | Deliver 2 demos | 1 clinic agrees to 90-day pilot |
| 6 | Sign pilot agreement (even via email) | Coordinator + Medical Director confirm participation |

### Phase 2: Pilot Live & Content Generation (Weeks 7–10)

| Week | Milestone | Success Criteria |
|------|-----------|-----------------|
| 7 | Onboard pilot clinic (manual account creation, data import) | 5–10 patients in system; coordinators trained |
| 7–8 | Daily check-ins with coordinator (Slack/email) | Coordinator reports first "this saved me time" moment |
| 8–9 | Collect quantitative baseline vs. pilot metrics | Time per patient evaluation; days to document completion |
| 9–10 | Draft case study and request testimonial | Signed quote or LinkedIn recommendation |

### Phase 3: Convert & Seed Pipeline (Weeks 11–13)

| Week | Milestone | Success Criteria |
|------|-----------|-----------------|
| 11 | Conversion conversation with pilot clinic | Verbal or written commitment to paid contract |
| 11–12 | Send manual invoice for Early Adopter tier | Invoice sent; payment terms agreed |
| 12 | Publish first case study blog post | Live on NephroAssist blog + LinkedIn |
| 12–13 | Request 2 warm intros from pilot coordinator | Email introductions sent |
| 13 | Pipeline status: 1 paying customer + 2 warm prospects + 1 live pilot | CRM/board updated |

### 90-Day Summary Targets

| Metric | Target |
|--------|--------|
| P0 security fixes shipped | 5/5 complete |
| Discovery calls completed | 5+ |
| Demo calls completed | 2+ |
| Pilots launched | 1 live |
| Paying customers | 0–1 (manual invoice) |
| Case studies published | 1 |
| Warm referrals generated | 2+ |
| LinkedIn connections (coordinators) | 50+ |

---

## 8. Success Metrics & KPIs

### 8.1 Leading Indicators (Weekly)

| Metric | Why It Matters | Target (MoM 1–3) |
|--------|---------------|------------------|
| Outbound messages sent | Measures founder hustle | 10/week |
| Discovery calls booked | Validates ICP and messaging | 2/week by Week 6 |
| Demo calls completed | Measures pipeline depth | 1/week by Week 8 |
| Pilot agreements signed | True north metric | 1 by Week 6 |
| Security fixes shipped | Blocks all revenue | 100% of P0 by Week 2 |

### 8.2 Lagging Indicators (Monthly)

| Metric | Why It Matters | Target (MoM 3) |
|--------|---------------|----------------|
| Paying customers | Revenue signal | 0–1 |
| Pilot NPS | Product-market fit proxy | >50 |
| Days to evaluation completion | Clinical ROI proof | Baseline established |
| Coordinator time saved | Economic value proof | 5+ hours/week claimed |
| Organic inbound inquiries | Validates messaging | 1–2/month |
| Content published | SEO and credibility compounding | 6 blog posts |

### 8.3 What NOT to Track (Yet)

| Metric | Why Deferred |
|--------|-------------|
| Free patient signups | No free app launched yet; no coordinator base to connect to |
| Viral coefficient | No viral loop built yet |
| SEO traffic | 6-month horizon minimum for meaningful volume |
| Churn | No paying customer base to measure |
| NRR (Net Revenue Retention) | Requires 5+ customers for statistical relevance |

---

## 9. Risk Mitigations

### 9.1 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Security breach during pilot** | Medium | CATASTROPHIC | Fix ALL P0 blockers before pilot. Use synthetic/test data for first 2 weeks if needed. |
| **Product crashes under real load** | Low | HIGH | Pilot is 5–10 patients. Current architecture handles this. Monitor manually. |
| **EHR integration expectation** | Medium | MEDIUM | Set explicit scope: "Phase 1 is standalone. FHIR integration is a Phase 2 upgrade." |

### 9.2 Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **First pilot churns or won't convert** | Medium | HIGH | Make pilot clinic a true partner — daily support, rapid feature tweaks. Offer steep discount for first 12 months. |
| **Sales cycle longer than 90 days** | High (enterprise) | MEDIUM | Target individual coordinators, not committees. Manual contract avoids procurement. |
| **Competitor launches free tool** | Low | MEDIUM | Speed to first testimonial. Community moat (relationships) > feature moat. |
| **HIPAA/GDPR concern blocks deal** | Medium | HIGH | Prepare BAA template. Offer on-premise or private-cloud pilot. Document compliance posture transparently. |

### 9.3 Founder Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Founder burnout before revenue** | Medium | CATASTROPHIC | Set hard milestone: if no pilot signed by Week 8, reassess product or pivot. Do not "grind" indefinitely. |
| **Technical founder distracted by coding** | High | HIGH | Allocate fixed hours: 50% sales/outreach, 30% security fixes, 20% pilot support. No feature development beyond security. |
| **Perfectionism delays launch** | High | MEDIUM | "Good enough for one clinic" ≠ "public self-serve ready." Ship pilot once P0 is fixed. |

---

## 10. Resource Allocation (Zero Budget)

### 10.1 Founder Time Budget (Weekly)

| Activity | Hours/Week | Rationale |
|----------|-----------|-----------|
| Security fixes (P0) | 10 | Blocks everything; must finish in 2 weeks |
| Outreach & sales | 10 | Highest-leverage activity for revenue |
| Pilot onboarding & support | 5 | Converts pilot to paying customer |
| Content creation | 3 | Enables future inbound |
| Community engagement | 2 | Long-term reputation |
| **Total** | **30** | Sustainable solo-founder schedule |

### 10.2 Cash Budget (Monthly)

| Category | Monthly (€) |
|----------|-------------|
| Cloud infrastructure (Vercel free + Supabase free) | €0 |
| Domain + email (Resend free tier) | €0 |
| Legal boilerplate (self-serve templates) | €0 |
| **Total** | **€0** |

**Note:** If pilot scales beyond free tiers, infra cost rises to €25–€50/month. This is covered by first paying customer (€199/month).

### 10.3 Tool Stack (All Free)

| Purpose | Tool | Cost |
|---------|------|------|
| CRM / Pipeline | Notion or Airtable free | €0 |
| Email outreach | LinkedIn + manual | €0 |
| Video calls | Google Meet or Zoom free | €0 |
| Document signing | DocuSign free or manual email | €0 |
| Invoicing | Manual PDF or Stripe Payment Link | €0 |
| Analytics | Vercel Analytics + Google Analytics | €0 |

---

## 11. Assumptions & What Would Make This Wrong

### 11.1 Explicit Assumptions

1. **The founder can dedicate 30 hrs/week to NephroAssist** (ASSUMPTION — if part-time, 90-day targets must stretch to 120–180 days).
2. **At least one transplant coordinator is willing to try a new tool** (ASSUMPTION — validated by research showing spreadsheet pain, but not by primary interviews).
3. **Security fixes take 1–2 weeks** (ASSUMPTION — if underlying auth architecture needs redesign, add 2–4 weeks).
4. **Pilot clinic allows publication of testimonial** (ASSUMPTION — some hospitals restrict vendor endorsements; have anonymized fallback ready).
5. **German-speaking market is accessible** (ASSUMPTION — current UI is German; D-A-CH transplant centers may have different procurement rules than U.S.).

### 11.2 What Would Make This Plan Wrong

| Scenario | Impact | Response |
|----------|--------|----------|
| No coordinator responds to outreach after 40 attempts | ICP or messaging is wrong | Pivot to Medical Directors; or pivot to patient-advocacy orgs as channel partners |
| Pilot clinic loves tool but refuses to pay ("it's a cost center") | Pricing model invalid | Offer outcome-based pricing (pay per patient listed faster) or seek grant funding |
| Security fixes reveal architecture must be rebuilt | Timeline blown by 4–8 weeks | Extend Phase 0; do not ship insecure pilot. Consider interim "demo-only" engagements. |
| First paying customer requires enterprise features (SSO, SLA) | Self-serve model invalidated | Treat as one-off enterprise contract; do not build enterprise infra for one customer |
| Founder cannot sustain 30 hrs/week | All targets slip proportionally | Reduce to 1 pilot target in 90 days; set hard quit milestone at 6 months |

---

## 12. Summary: The Zero-Budget Path to First Revenue

1. **Fix security first.** No clinic will (or should) trust a tool with JWT bypass and hardcoded secrets.
2. **Land one manual pilot.** Do not build self-serve infrastructure until you have one clinic proving the workflow works.
3. **Convert pilot to testimonial.** This single asset is more valuable than 100 blog posts.
4. **Use testimonial to fuel outbound.** LinkedIn + case study = credible, zero-cost acquisition.
5. **Reinvest first revenue into billing infrastructure.** Only after 3+ paying customers should Stripe, password reset, and self-serve signup be built.

**The 90-day headline, revisited:**
> One secure pilot live. One case study published. One paying customer contracted. And a pipeline of 3–5 warm prospects who saw the case study.

This is not the fastest path to €100K MRR. It is the most realistic path to €0 MRR becoming €2K MRR without burning trust, security, or founder sanity.

---

*Plan synthesized by business-strategist for Kanban task t_9f0a98cb. Grounded in SaaS Audit (t_c00353db), Consolidated Research (t_c269008b), and Zero-Budget Financial Model (t_59df76ad). All strategic choices, assumptions, and risks are explicitly stated.*
