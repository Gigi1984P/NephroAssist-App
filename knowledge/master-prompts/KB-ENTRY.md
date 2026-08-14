# NephroAssist Master Prompt — Knowledge Base Entry

**KB-ID:** nephroassist/master-prompts/orchestrator-v1.0  
**Stored:** 2026-08-14  
**Version:** 1.0  
**Status:** production-ready (PASS_WITH_WARNINGS)  
**Review cycle:** 6 months  
**Next review:** 2027-02-14  
**Author:** knowledge-manager  
**Reviewer:** critic-reviewer  
**Review task:** t_663889a5  
**Storage task:** t_d9aad1ae

---

## Tags / Domains
- healthcare
- saas
- orchestration
- transplant
- kidney
- patient-journey
- hipaa
- gdpr
- bfarm
- diga
- nhs
- phi
- fhir
- multi-agent
- compliance
- security
- devops

---

## Provenance (Parent Research Tasks)
| Task ID | Title | Profile | Date | Confidence |
|---------|-------|---------|------|------------|
| t_17542e1a | Transplant Journey Regulations and Market Requirements Report | market-researcher | 2026-08-14 | High |
| t_05397706 | Competitor Analysis | competitor-researcher | 2026-08-14 | High |
| t_0b3e7c1c | Technical Constraints & Compliance Framework | security-reviewer | 2026-08-14 | High |
| t_663889a5 | Review of orchestrator-master-prompt.md | critic-reviewer | 2026-08-14 | High (PASS_WITH_WARNINGS) |

---

## Related Artifacts
| Path | Description |
|------|-------------|
| `/opt/data/projects/nephroassist/knowledge/master-prompts/orchestrator-master-prompt-v1.0.md` | The finalized master prompt |
| `/opt/data/projects/nephroassist/knowledge/master-prompts/CHANGELOG.md` | Version history and review schedule |
| `/opt/data/projects/nephroassist/docs/competitor-analysis.md` | Source: competitor landscape |
| `/opt/data/projects/nephroassist/docs/transplant-journey-regulations-market-report.md` | Source: regulations and market requirements |
| `/opt/data/projects/nephroassist/docs/TECHNICAL_CONSTRAINTS.md` | Source: technical constraints and compliance framework |
| `/opt/data/projects/nephroassist/docs/orchestrator-master-prompt-review.md` | Source: review report with prioritized fixes |

---

## Quick Retrieval Hints

**For orchestrators initiating a new NephroAssist epic:**
Load `orchestrator-master-prompt-v1.0.md` as system context. All sub-tasks must comply with sections 3 (Hard Constraints) and 4 (Mandatory Compliance Checks). Use section 5.2 to select worker profiles.

**For security-reviewers:**
Check sections 3, 7, and 8 first. Any new feature touching PHI, auth, crypto, or tenant isolation is a Red Line per section 7.1.

**For compliance-officers:**
Sections 8.1–8.5 contain the regulatory summary. Section 6.5 covers GDPR erasure during active treatment. Verify BAA/DPA status in section 4.2 before any new integration.

**For backend/frontend engineers:**
Section 9 covers EHR and lab integration standards (FHIR R4). Section 10 covers audit/logging requirements. Section 11 lists quality gates.

---

## Health Warning
This prompt was written for the healthcare domain (organ transplant coordination). Healthcare regulation evolves rapidly. The 6-month review cycle is **mandatory**, not optional. Early review triggers are listed in CHANGELOG.md.

**Never use this prompt for non-healthcare projects without stripping clinical constraints and replacing regulatory frameworks.**

---

*End of knowledge base entry.*
