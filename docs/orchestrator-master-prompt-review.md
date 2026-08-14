# Orchestrator Master Prompt Review Report

**Task:** t_663889a5
**Reviewer:** critic-reviewer
**Date:** 2026-08-14
**Artifact Reviewed:** `/opt/data/projects/nephroassist/docs/orchestrator-master-prompt.md`
**Source Documents Verified:**
- `/opt/data/projects/nephroassist/docs/competitor-analysis.md`
- `/opt/data/projects/nephroassist/docs/transplant-journey-regulations-market-report.md`
- `/opt/data/projects/nephroassist/docs/TECHNICAL_CONSTRAINTS.md`

---

## Verdict: PASS_WITH_WARNINGS

The master prompt is factually accurate, clinically safe, and actionable. It correctly synthesizes the research inputs, repeats the hard safety constraints with appropriate emphasis, and defines unambiguous escalation paths. No unauthorized medical advice is enabled. The German is clear and professional.

However, five issues should be fixed before the prompt is treated as the final production master. None are safety-critical, but they create ambiguity or incomplete coverage.

---

## PRIORITIZED FIXES

### 1. UNDEFINED WORKER PROFILES (Medium)
The prompt references `infrastructure-review` (in 4.5, 7.2, Quick Reference) and `incident-response` (in 7.1 Rot) but neither appears in the worker profile table in section 5.2. Add both to 5.2 with their responsibilities, or replace the references with existing defined profiles.

### 2. INCONSISTENT TONE ON NATIONAL REGISTRY INTEGRATION (Medium)
Section 1.2 lists SRTR/OPTN, Eurotransplant, and NHSBT as integration targets "ueber definierte Gateways," implying capability. Section 9.2 correctly notes that Eurotransplant has no direct technical connection without explicit agreement and NHSBT requires specific certification. Align 1.2 with 9.2: state that integration is limited to reporting workflow support (not direct submission) and that national registry connections require explicit bilateral agreements/certification.

### 3. BREACH NOTIFICATION RESPONSIBILITY (Medium)
Section 8.1 says the system must "support, not hinder" the 60-day HIPAA breach notification deadline. It does not clarify that NephroAssist, as a Business Associate (or GDPR processor), has its own notification duty to the covered entity / controller. Add explicit language: breach suspicion must be reported to the customer/covered entity within a shorter internal SLA (e.g., 24 hours), not merely "not hindered."

### 4. MISSING END-TO-END ENCRYPTION FOR PATIENT-COORDINATOR MESSAGING (Low-Medium)
The Patient persona and domain scope mention messaging between patients and the care team, but the prompt never explicitly requires end-to-end encryption for these messages. Given that they will contain PHI, add this to section 3 or 8.

### 5. MISSING SESSION TIMEOUT REQUIREMENTS (Low-Medium)
The source technical constraints specify 15-minute idle timeout and 8-hour absolute timeout, but the master prompt never mentions session expiry. This is a critical PHI safety control that should be reinforced in the orchestrator's mandatory checks or hard constraints.

---

## ADDITIONAL GAPS (non-blocking, consider for v1.1)

- Pediatric patients / guardian proxy roles are never mentioned.
- Living donors are neither included nor explicitly excluded from scope.
- Post-transplant immunosuppressant medication adherence is not explicitly in the domain scope, despite being a core transplant need.
- No edge case for patient death or graft failure (data retention, next-of-kin access, account closure).
- The upstream task metadata claims "5 Healthcare-Edge-Cases," but the document contains 4 (6.1-6.4). Either add a fifth (e.g., GDPR right-to-erasure request during active treatment) or correct the metadata.

---

## BOTTOM LINE

The prompt can be stored and used. It will not cause safety or compliance failures in its current form. Address the five prioritized fixes above to remove operational ambiguity before declaring it final.
