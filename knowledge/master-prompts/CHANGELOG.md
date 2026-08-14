# NephroAssist Master Prompt — Changelog

## Format
All entries follow: `YYYY-MM-DD — Version X.Y — Change summary — Author`

---

## [1.0] — 2026-08-14 — Initial production release

**Author:** knowledge-manager (review: critic-reviewer)
**Source tasks:** t_663889a5 (review), t_17542e1a (market research), t_05397706 (competitor analysis), t_0b3e7c1c (technical constraints)
**Verdict:** PASS_WITH_WARNINGS

### Summary
Initial production-ready master prompt for the NephroAssist Master Orchestrator. Synthesizes research on transplant patient journey, competitor landscape, and technical compliance constraints into a delegable, safety-first orchestrator specification.

### Key sections
- System identity and domain scope (pre/post transplant, coordination, EHR integration)
- User personas and least-privilege authorization model
- Hard constraints (no diagnosis, no irreversible PHI changes without approval, no BAA-less sharing)
- Mandatory compliance checks (pre-delegation checklist)
- Multi-agent delegation rules (worker profiles, idempotency, verifiability)
- Healthcare-specific edge cases (emergency, critical labs, patient dropout, organ offer, GDPR erasure during active treatment)
- Safety guardrails (Green/Yellow/Orange/Red levels)
- Regulatory reminders (HIPAA, GDPR, BfArM/DiGA, NHS)
- Workflow integration (FHIR R4, national registries, lab integration)
- Audit, logging, and quality requirements

### Fixes applied from review (t_663889a5)
1. **Undefined worker profiles** — Added `infrastructure-review` and `incident-response` to section 5.2 with responsibilities and example tasks.
2. **Inconsistent tone on national registry integration** — Added explicit clarification in section 9.2 and a callout box: the platform supports reporting workflows but does not replace direct submissions; bilateral agreements/certification required.
3. **Breach notification responsibility** — Updated section 8.1 to specify an internal 24-hour SLA for reporting breach suspicion to the covered entity/controller, in addition to the 60-day external notification.
4. **Missing end-to-end encryption for patient-coordinator messaging** — Added hard constraint #10 in section 3 requiring E2E encryption for all PHI-bearing messages.
5. **Missing session timeout requirements** — Added hard constraint #9 in section 3: 15-minute idle timeout and 8-hour absolute timeout, server-side enforced.
6. **Edge case count discrepancy** — Added section 6.5 (GDPR right-to-erasure during active treatment) to bring edge cases to 5, matching upstream metadata claim.

### Non-blocking gaps deferred to v1.1
- Pediatric patients / guardian proxy roles
- Living donor inclusion or explicit exclusion
- Post-transplant immunosuppressant medication adherence scope
- Patient death / graft failure edge case (data retention, next-of-kin access, account closure)

### Confidence level
- **Clinical safety:** High — no unauthorized medical advice enabled, escalation paths clear.
- **Regulatory coverage:** High — HIPAA, GDPR, BfArM/DiGA, NHS all addressed with explicit constraints.
- **Operational completeness:** Medium-High — five prioritized fixes applied; four non-blocking gaps remain for v1.1.

---

## Review/Expiry Schedule
- **Next scheduled review:** 2027-02-14 (6 months from release)
- **Trigger conditions for early review:**
  - Change in applicable healthcare regulation (HIPAA Security Rule update, GDPR adequacy decision change, BfArM DiGA criteria update)
  - New national registry integration requirement
  - Post-incident review reveals prompt ambiguity
  - Addition of pediatric, living-donor, or post-transplant medication-adherence scope

---

*End of changelog.*
