# NephroAssist — Technical Constraints & Compliance Framework

**Version:** 1.0
**Date:** 2026-08-14
**Status:** Draft — requires security-reviewer sign-off before downstream implementation
**Scope:** Mandatory architectural, security, and compliance constraints for all NephroAssist engineering tasks.

---

## 1. Regulatory Scope & Applicable Frameworks

NephroAssist is a healthcare SaaS handling patient data (PHI/ePHI). The following frameworks apply in full:

| Framework | Jurisdiction / Trigger | Applicability |
|-----------|------------------------|---------------|
| HIPAA (Security Rule, Privacy Rule, Breach Notification Rule) | US — any PHI storage, transmission, or processing | **Mandatory** |
| HITECH Act | US — breach notification, business associate liability | **Mandatory** |
| GDPR | EU / EEA — any EU patient data; also best-practice baseline | **Mandatory if EU patients** |
| HITRUST CSF | Industry — certification target for healthcare SaaS | **Target for certification** |
| ISO 27001:2022 | International — information security management | **Target for certification** |
| SOC 2 Type II | US — SaaS customer assurance | **Target for certification** |

> **Red Line:** Any task that touches PHI storage, transmission, processing, or access control MUST be reviewed by the security-reviewer profile before implementation begins.

---

## 2. Mandatory Security Controls for PHI

### 2.1 Encryption

| Layer | Requirement | Implementation Standard |
|-------|-------------|------------------------|
| Data at rest (database) | AES-256-GCM minimum | Database-native TDE or application-layer encryption |
| Data at rest (backups, logs) | AES-256-GCM minimum | Backup encryption keys separate from data keys |
| Data in transit (API, web) | TLS 1.3 minimum; TLS 1.2 acceptable only with secure cipher suites | Certificate pinning for mobile clients if applicable |
| Data in transit (service-to-service) | mTLS or authenticated encrypted tunnels (e.g., WireGuard, AWS PrivateLink) | Zero-trust networking model |
| Key management | HSM or cloud KMS (AWS KMS, Azure Key Vault, GCP Cloud KMS) | Key rotation every 90 days; separate keys per tenant |

> **Red Line:** Hard-coding encryption keys, using symmetric keys without rotation, or disabling TLS in any environment (including "temporary" dev) is a security incident. The task must be escalated to security-reviewer immediately.

### 2.2 Access Control

| Control | Requirement |
|---------|-------------|
| Authentication | OAuth 2.0 + OIDC minimum; MFA mandatory for all admin/clinical roles; phishing-resistant MFA (FIDO2/WebAuthn) for super-admins |
| Authorization | RBAC with fine-grained resource-level permissions; deny-by-default; principle of least privilege |
| Session management | Short-lived access tokens (15 min max); refresh tokens with rotation and binding; idle timeout 15 min; absolute timeout 8 hours |
| Audit of access | Every authentication, authorization decision, and access to PHI must be logged immutably |
| Break-glass | Emergency access procedures documented; every break-glass use triggers immediate alert and post-incident review |

> **Red Line:** Any task introducing a new user role, permission, or authentication flow MUST be reviewed by security-reviewer.

### 2.3 Audit Logging & Monitoring

| Requirement | Standard |
|-------------|----------|
| Immutable logs | Write-once storage (WORM); tamper-evident hashing; centralized SIEM |
| Log retention | 6 years minimum (HIPAA); 7 years recommended for litigation hold |
| Log contents | Who, what, when, where, why for every PHI access; failed access attempts; configuration changes |
| Real-time alerting | Anomaly detection on PHI access patterns; brute-force detection; impossible travel |
| Log integrity | Digitally signed log streams; periodic integrity verification |

> **Red Line:** Any task that modifies log formats, retention policies, or log routing MUST be reviewed by security-reviewer.

### 2.4 PHI Handling Rules

1. **Minimization:** Collect and store only the minimum necessary PHI for the stated purpose.
2. **De-identification:** Any analytics, ML training, or reporting using PHI must use HIPAA Safe Harbor de-identification or expert determination.
3. **Segmentation:** PHI must never be co-mingled with non-PHI data in the same unprotected store.
4. **Transmission:** PHI must only transit encrypted channels; no email/SMS of PHI without end-to-end encryption.
5. **Third-party sharing:** Business Associate Agreements (BAAs) required for any vendor processing PHI; no PHI to non-BAA vendors.

> **Red Line:** Any task involving PHI export, third-party integration, analytics pipeline, or ML model training MUST be reviewed by security-reviewer.

### 2.5 Tenant Isolation

| Aspect | Requirement |
|--------|-------------|
| Data isolation | Logical isolation minimum (tenant ID in every row); physical isolation (separate DBs/schemas) for enterprise tiers |
| Compute isolation | Separate worker pools or container namespaces per tenant tier; shared compute only with verified sandboxing |
| Network isolation | VPC per tenant or namespace-level network policies; no cross-tenant traffic without explicit gateway |
| Key isolation | Per-tenant encryption keys derived from a master key; key escrow for enterprise customers |
| Configuration isolation | Tenant-specific config stores; no global config that bleeds across tenants |

> **Red Line:** Any task that changes tenant isolation boundaries, shared resource pools, or multi-tenant data routing MUST be reviewed by security-reviewer.

---

## 3. Recommended Stack Patterns for HIPAA/GDPR-Aligned SaaS

### 3.1 Infrastructure

| Layer | Recommended | Rationale |
|-------|-------------|-----------|
| Cloud provider | AWS, Azure, or GCP (US or EU regions as needed) | BAA-ready; HITRUST-certified infrastructure |
| Compute | Kubernetes (EKS/GKE/AKS) or serverless (AWS Fargate, Cloud Run) with security-hardened base images | Scalable, patchable, auditable |
| Database | PostgreSQL 15+ (RDS/Cloud SQL) with TDE; or Aurora PostgreSQL | ACID, auditable, encryptable at rest |
| Cache / session store | Redis (ElastiCache/Memorystore) with AUTH and TLS | Fast, supports encrypted transit |
| Object storage | S3 / GCS / Azure Blob with bucket policies enforcing encryption and versioning | Immutable backups, lifecycle policies |
| Secrets management | HashiCorp Vault or cloud-native KMS | Dynamic secrets, automatic rotation, audit trails |
| CI/CD | GitHub Actions / GitLab CI with hardened runners, SAST/DAST in pipeline, signed artifacts | Reproducible, auditable builds |

### 3.2 Application Stack

| Layer | Recommended | Notes |
|-------|-------------|-------|
| Backend API | Python (FastAPI) or Node.js (NestJS) with OpenAPI spec | Strong typing, async, good middleware ecosystem |
| API gateway | Kong, AWS API Gateway, or Envoy | Rate limiting, authn/authz, request/response logging |
| Frontend | React or Vue with TypeScript; CSP headers enforced | Client-side encryption for sensitive form fields where applicable |
| Mobile (if any) | React Native or Flutter with certificate pinning | mTLS for API calls; encrypted local storage |
| Background jobs | Celery (Python) or BullMQ (Node) with encrypted task payloads | No PHI in plaintext in job queues |
| Search / analytics | Elasticsearch or OpenSearch with field-level encryption | Audit all search queries containing PHI |

### 3.3 Security Tooling

| Category | Tooling |
|----------|---------|
| SAST | Semgrep, SonarQube, or CodeQL |
| DAST | OWASP ZAP, Burp Suite Enterprise |
| Dependency scanning | Snyk, OWASP Dependency-Check |
| Container scanning | Trivy, Snyk Container |
| IaC scanning | Checkov, tfsec |
| Secrets detection | GitLeaks, TruffleHog (pre-commit hooks mandatory) |
| Penetration testing | Annual third-party pen test; quarterly internal red-team exercises |

### 3.4 GDPR-Specific Additions

| Requirement | Implementation |
|-------------|----------------|
| Data Processing Agreements (DPAs) | Signed with all sub-processors |
| Right to erasure | Automated data deletion workflows; cryptographic erasure for encrypted data |
| Right to portability | Standardized export formats (FHIR R4 where applicable) |
| Data Protection Impact Assessment (DPIA) | Required before any new high-risk processing |
| EU data residency | EU-based infrastructure for EU patients; no transfer without adequacy decision or SCCs |
| DPO | Designated Data Protection Officer with contact published |

---

## 4. Critical Non-Functional Requirements

### 4.1 Availability & Reliability

| Metric | Target | Rationale |
|--------|--------|-----------|
| Uptime SLA | 99.9% (8.77 h downtime/year) minimum; 99.99% (52.6 min/year) for critical path | Healthcare continuity |
| RTO (Recovery Time Objective) | 4 hours | Rapid restoration after incident |
| RPO (Recovery Point Objective) | 1 hour | Maximum acceptable data loss |
| Planned maintenance | < 4 hours/month; announced 72 hours in advance; zero-downtime deployments preferred | Patient care cannot wait |
| Multi-region | Active-passive minimum; active-active for critical services | Disaster resilience |

### 4.2 Backup & Disaster Recovery

| Requirement | Standard |
|-------------|----------|
| Backup frequency | Continuous for DB (PITR); daily full snapshots; incremental every 6 hours |
| Backup encryption | AES-256-GCM; keys stored separately from backups |
| Backup testing | Monthly automated restore drills; quarterly full DR simulation |
| Offsite / air-gapped | Geographic separation; immutable backups (WORM/S3 Object Lock) |
| DR plan | Documented, tested annually, with role-specific runbooks |

### 4.3 Performance

| Metric | Target |
|--------|--------|
| API response time (p99) | < 500 ms for critical paths (patient lookup, chart access) |
| Page load time (p99) | < 2 seconds for authenticated dashboard |
| Concurrent users | Support 10x expected peak without degradation |
| Database query time (p99) | < 100 ms for indexed queries |

### 4.4 Scalability

| Requirement | Approach |
|-------------|----------|
| Horizontal scaling | Stateless services; auto-scaling based on CPU/memory/custom metrics |
| Database scaling | Read replicas for reporting; sharding strategy for > 10M patients |
| Caching strategy | Multi-layer (CDN for static, Redis for session/query, application for computed) |
| Rate limiting | Per-tenant and per-user; graceful degradation under load |

---

## 5. Red Lines — Security-Reviewer Must Be Involved

The following task categories **MUST NOT** proceed to implementation without explicit security-reviewer approval:

| # | Red Line Category | Examples |
|---|-------------------|----------|
| 1 | **Cryptography changes** | Adding/removing encryption algorithms, changing key rotation schedules, implementing custom crypto, certificate authority changes |
| 2 | **Authentication & authorization** | New auth providers, new roles/permissions, OAuth scope changes, session policy changes, MFA requirement changes |
| 3 | **PHI access patterns** | New API endpoints returning PHI, bulk export features, data aggregation across patients, analytics/ML on PHI |
| 4 | **Network & infrastructure boundaries** | VPC changes, firewall rule relaxations, exposure of internal services, CDN/WAF rule changes, VPN/Bastion changes |
| 5 | **Third-party integrations** | New vendors processing PHI, API keys for external services, webhook endpoints, data synchronization with EHRs |
| 6 | **Logging & audit changes** | Log format changes, retention reduction, SIEM routing changes, log filtering/sampling that could omit PHI access events |
| 7 | **Tenant isolation changes** | Shared resource pool changes, cross-tenant data routing, tenant migration tools, multi-tenant to single-tenant conversion |
| 8 | **Data retention & deletion** | Retention policy reduction, automated deletion workflows, right-to-erasure implementation, backup pruning |
| 9 | **Compliance scope changes** | Entering new jurisdictions (GDPR, PIPEDA, etc.), new data types (genomic, mental health), new use cases (research, marketing) |
| 10 | **Incident response & forensics** | Breach investigation tools, forensic data collection, law enforcement data requests, patient notification workflows |

> **Procedure:** When a red line is identified, the implementer must:
> 1. Stop implementation and flag the task for security-reviewer review.
> 2. Document the security-reviewer assessment in the task comments.
> 3. Proceed only after explicit security-reviewer approval (e.g., `kanban_request_review` with `reviewer=security-reviewer`).

---

## 6. Development & Operational Constraints

### 6.1 Secure Development Lifecycle (SDLC)

| Phase | Requirement |
|-------|-------------|
| Design | Threat modeling (STRIDE) for every new feature handling PHI; architecture review mandatory |
| Code | Linting, SAST, secrets scanning in pre-commit; no secrets in code |
| Build | Reproducible builds; signed container images; SBOM generation |
| Test | Unit tests + integration tests + security tests; no PHI in test data (synthetic data only) |
| Deploy | Automated deployment with canary/blue-green; rollback < 5 minutes; no direct prod access |
| Monitor | Real-time alerting; incident response runbooks; post-mortems for all Sev1/2 incidents |

### 6.2 Environment Segregation

| Environment | Data Rule | Access Rule |
|-------------|-----------|-------------|
| Production | Real PHI only | Break-glass only; all access logged and reviewed |
| Staging | Synthetic data only; structurally identical to prod | Limited team; no customer access |
| Development | Fully synthetic data; no PHI-like structures that could be mistaken for real | Open to engineering team |
| Local | Synthetic data only; seeded from fixtures | Individual developer |

> **Red Line:** Never use production PHI in non-production environments. Any task requiring real data in staging/development MUST use de-identified datasets approved by security-reviewer.

### 6.3 Dependency & Supply Chain

| Requirement | Standard |
|-------------|----------|
| Dependency inventory | SBOM generated at every build; tracked in dependency management tool |
| Vulnerability scanning | Continuous scanning (Snyk/Dependabot); critical CVEs patched within 48 hours |
| Approved dependencies | No new dependencies without security-reviewer review for libraries touching crypto, auth, or PHI |
| Open source governance | License compliance scan; no GPL/AGPL in distributed components without legal review |

---

## 7. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-14 | developer-lead | Initial draft |

**Next Review:** 2026-11-14 (quarterly)
**Approval Required From:** security-reviewer, DPO (if appointed)

---

## 8. Quick Reference for Orchestrators

When delegating a downstream task, the orchestrator MUST verify:

- [ ] Does this task touch PHI, auth, crypto, or network boundaries? If yes → **security-reviewer required**.
- [ ] Does this task introduce a new dependency? If yes → **scan and approve**.
- [ ] Does this task modify logging, audit, or monitoring? If yes → **security-reviewer required**.
- [ ] Does this task change tenant isolation or data routing? If yes → **security-reviewer required**.
- [ ] Does this task affect availability, backup, or DR? If yes → **infrastructure review required**.
- [ ] Are all environments using synthetic data except production? If no → **block and escalate**.
- [ ] Is TLS 1.3+ used everywhere? If no → **remediate before merge**.
- [ ] Are encryption keys managed in KMS/HSM with rotation? If no → **remediate before merge**.

---

*This document is a living specification. All downstream implementation tasks must reference and comply with the constraints herein. Violations are security incidents and must be reported immediately.*
