# NephroAssist — Technical Architecture & System Blueprint

**Task:** t_5a502e1c  
**Date:** 2026-08-28  
**Author:** developer-lead  
**Status:** Draft — downstream implementation tasks depend on this document  
**Basis:** Business strategy (t_7a710525), existing codebase audit, technical constraints & compliance framework (docs/TECHNICAL_CONSTRAINTS.md), tenant-isolation strategy (docs/tenant-isolation.md)

---

## 1. Architecture Philosophy & Constraints

### Guiding Principles
1. **Compliance-first, correctness-first** — Every architectural decision is evaluated against HIPAA Security Rule, GDPR Article 9, and SOC 2 Type II readiness before implementation.
2. **Simplicity over novelty** — The existing Next.js + PostgreSQL + Prisma stack is production-tested and will be evolved, not replaced, unless a clear operational or security benefit justifies the migration cost.
3. **Tenant isolation is non-negotiable** — Row-level filtering + PostgreSQL RLS is the primary model; physical separation is reserved for Enterprise tier customers.
4. **AI is an assistant, never a decision-maker** — All AI outputs require human review before affecting patient workflows.

### Hard Constraints Inherited from Existing Codebase
- **Runtime:** Node.js 18+ on Vercel Edge / Serverless Functions
- **Framework:** Next.js 16 App Router (breaking changes from training-data Next.js — see AGENTS.md)
- **Database:** PostgreSQL 15+ (production host: m22p.your-database.de)
- **ORM:** Prisma 5.22.0 with `@prisma/client`
- **UI:** Bootstrap 5.3 via CDN (user decision, not Tailwind)
- **Auth:** Custom JWT in `nephro-token` HttpOnly cookie (not NextAuth v5)
- **State:** React useState/useEffect only — no Redux/Zustand
- **API:** Traditional REST API Routes, not Server Actions

---

## 2. High-Level System Components

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│  │  Patient    │  │ Coordinator │  │  Physician  │  │  Admin   │  │
│  │  (Browser/  │  │  (Browser/  │  │  (Browser/  │  │ (Browser │  │
│  │   PWA)      │  │   Desktop)  │  │   Desktop)  │  │  /CLI)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬─────┘  │
└─────────┼────────────────┼────────────────┼──────────────┼────────┘
          │                │                │              │
          └────────────────┴────────────────┴──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   CDN / WAF       │
                    │   (Vercel Edge)   │
                    │   TLS 1.3         │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                      APPLICATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Next.js App Router                       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │    │
│  │  │  Server     │  │  API Routes │  │   Middleware    │   │    │
│  │  │  Components │  │  (REST)     │  │  (JWT Verify +  │   │    │
│  │  │  (RSC)      │  │             │  │   Tenant Check) │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │    │
│  │  │  Client     │  │  Bootstrap  │  │   React Hook    │   │    │
│  │  │  Components │  │  5.3 UI     │  │   Form + Fetch  │   │    │
│  │  │  ("use      │  │             │  │   (cred:"       │   │    │
│  │  │   client")  │  │             │  │   "include")    │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                      │
│  ┌───────────────────────────▼──────────────────────────────────┐  │
│  │                     Service Layer (Lib)                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │  │
│  │  │  Auth   │ │ Tenant  │ │ Audit   │ │ Document│ │   AI   │ │  │
│  │  │ Service │ │ Context │ │ Service │ │Processing│ │Gateway │ │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      │                       │                       │
┌─────▼─────┐          ┌──────▼──────┐         ┌─────▼─────┐
│ PostgreSQL│          │    Redis    │         │  Object   │
│   (RDS)   │          │  (Sessions, │         │  Storage  │
│  Prisma   │          │   Queue)    │         │  (S3/GCS) │
│  TDE+RLS  │          │   ElastiCache│         │  Encrypted│
└───────────┘          └─────────────┘         └───────────┘
```

### 2.2 Component Responsibilities

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| **Web Frontend** | Next.js 16 App Router + React 19 + Bootstrap 5.3 | Patient-facing PWA, coordinator dashboard, admin panels, real-time chat UI |
| **Backend API** | Next.js API Routes (Node.js serverless) | REST endpoints, business logic, auth, tenant resolution, FHIR proxy |
| **Background Jobs** | Redis + BullMQ (or in-house queue via Redis lists) | OCR pipeline, email notifications, reminder dispatch, audit log archiving |
| **Integrations** | Next.js API Routes as proxy/gateway | SMART on FHIR (Epic/Cerner), EHR webhooks, email (Resend), future HL7 v2 |
| **AI Gateway** | Next.js API Route + service layer | PHI redaction, prompt versioning, provider selection, structured output validation |
| **Database** | PostgreSQL 15 + Prisma ORM | ACID transactions, tenant-scoped queries, audit logs, RLS policies |
| **Cache/Queue** | Redis | Session store, rate-limit counters, job queues, real-time pub/sub for messaging |
| **Object Storage** | S3-compatible (Vercel Blob / AWS S3 / Cloudflare R2) | Encrypted document storage, presigned URLs, versioning |

---

## 3. Recommended Tech Stack & Justification

### 3.1 Stack Decisions

| Layer | Current / Recommended | Justification |
|-------|----------------------|---------------|
| **Runtime** | Node.js 18+ | Existing. Async I/O suits API-heavy healthcare SaaS. |
| **Framework** | Next.js 16 App Router | Existing. Server Components reduce client bundle; API Routes sufficient for REST. |
| **Language** | TypeScript 5.9 | Existing. Compile-time safety reduces runtime PHI-handling bugs. |
| **Database** | PostgreSQL 15+ | Existing. ACID, mature RLS, JSONB for flexible metadata, excellent Prisma support. |
| **ORM** | Prisma 5.22 | Existing. Type-safe queries, migration system, good PostgreSQL feature coverage. |
| **UI Framework** | Bootstrap 5.3 (CDN) | Existing user preference. Do not migrate to Tailwind without explicit user request. |
| **Auth** | Custom JWT (jose) + bcryptjs | Existing. Cookie-based `nephro-token`. Will evolve toward OIDC-ready architecture (see §4). |
| **State Mgmt** | React hooks only | Existing. Sufficient for current feature set; avoids premature abstraction. |
| **Validation** | Zod | Existing. Runtime schema validation for all API inputs, form data, and AI outputs. |
| **Background Jobs** | Redis + BullMQ | **Recommended addition.** Existing codebase has no job queue. Required for OCR pipeline, reminders, and email at scale. |
| **Email** | Resend | Existing. BAA-ready email provider for healthcare. |
| **Object Storage** | S3-compatible with SSE | **Recommended addition.** Current "simulated upload" must be replaced with real encrypted storage for production. |
| **Monitoring** | Sentry + custom audit logging | Partially existing. Need structured audit log pipeline (see §6). |
| **Testing** | Jest + React Testing Library + Playwright | Existing. Maintain coverage for tenant-isolation and auth flows. |

### 3.2 What We Are NOT Adding (Intentional Omissions)

| Technology | Why Omitted |
|------------|-------------|
| NextAuth.js v5 | Existing custom JWT is simpler and sufficient for MVP. Evaluate OIDC migration in Phase 2. |
| GraphQL | REST + Zod is simpler for a small team; GraphQL adds query complexity and audit-logging surface. |
| Kubernetes | Vercel serverless is sufficient until Enterprise on-premise tier demands dedicated infrastructure. |
| Kafka / RabbitMQ | Redis queues are sufficient for expected volume (< 10K jobs/day in first 18 months). |
| Native mobile apps (iOS/Android) | PWA-first per business strategy. Native apps deferred to Phase 3. |
| Server Actions | Explicitly not used per existing convention. Traditional API routes are clearer for audit logging. |

---

## 4. Authentication & Authorization Architecture

### 4.1 Current State (Custom JWT)

The platform currently uses a custom JWT implementation:
- `POST /api/login` → verifies credentials → sets `nephro-token` HttpOnly cookie
- `middleware.ts` → verifies JWT on every request → injects user context
- Roles: `ADMIN | COORDINATOR | PHYSICIAN | NURSE | PATIENT | CAREGIVER | DIALYSIS_STAFF`

### 4.2 Target Architecture: OIDC-Ready with MFA

**Phase 1 (Months 1–6):** Evolve current custom JWT to be OIDC-compatible without breaking existing users.

**Phase 2 (Months 6–18):** Introduce managed OIDC provider (Keycloak or Auth0 Healthcare) behind abstraction layer.

```
Phase 1 (Current → Improved Custom JWT)
┌──────────┐     POST /api/login     ┌──────────────┐
│  Client  │ ───────────────────────→│   Server     │
│          │   {email, password}     │  1. Verify   │
│          │                         │     bcrypt   │
│          │  ←──── Set-Cookie ──────│  2. Sign JWT │
│          │     nephro-token        │     (jose)   │
└──────────┘                         └──────────────┘

Phase 2 (OIDC Migration Path)
┌──────────┐    OIDC Auth Code + PKCE   ┌──────────────┐
│  Client  │ ←─────────────────────────→│  OIDC Provider│
│          │                            │  (Keycloak)   │
│          │    Backend validates ID    └───────┬───────┘
│          │    token, sets own cookie          │
└──────────┘                                    │
                                         ┌──────▼──────┐
                                         │  NephroAssist│
                                         │  User DB     │
                                         │  (identity   │
                                         │   bridge)    │
                                         └─────────────┘
```

### 4.3 Role-Based Access Control (RBAC)

| Role | Primary User | Permissions (summary) |
|------|-------------|----------------------|
| **PATIENT** | Transplant candidate | Read own cases, tasks, documents; complete workflow steps; chat with coordinator; update own profile |
| **CAREGIVER** | Family member / proxy | Read patient data (with consent); complete tasks on behalf of patient; limited chat |
| **COORDINATOR** | Transplant coordinator | Full read/write within organization; assign requirements; review workflow steps; manage patient cases; view dashboard analytics |
| **PHYSICIAN** | Transplant surgeon / nephrologist | Clinical review and approval; read all patient data; write clinical notes; approve requirements |
| **NURSE** | Transplant clinic nurse | Read patient data; update vitals; assist with workflow; no final approval |
| **DIALYSIS_STAFF** | Dialysis center staff | Read linked patient data; update dialysis regime; upload documents |
| **ADMIN** | IT / operations admin | Organization management; user management; template configuration; system settings; NO automatic patient data access |
| **PLATFORM_SUPER_ADMIN** | NephroAssist ops | Cross-tenant admin tooling; impersonation with audit; billing; feature flags |

### 4.4 Permission Granularity

The existing `Permission` table supports fine-grained resource-level permissions:

```
patient.read, patient.update, patient.assign
requirement.read, requirement.create, requirement.review, requirement.approve
document.read, document.upload, document.review, document.delete
appointment.read, appointment.manage
organization.manage, user.manage, template.manage
audit.read, analytics.read
```

Every API endpoint must check BOTH:
1. **RBAC:** Does user's role have this permission?
2. **ABAC:** Does user have membership in the patient's organization? (tenant isolation)

### 4.5 Session Security Requirements

| Parameter | Requirement |
|-----------|-------------|
| Access token lifetime | 15 minutes (short-lived JWT) |
| Refresh token | Rotated on every use; bound to device fingerprint |
| Idle timeout | 15 minutes for clinical roles; 30 minutes for patients |
| Absolute timeout | 8 hours (clinical), 24 hours (patient) |
| Cookie flags | HttpOnly, Secure, SameSite=Strict |
| Concurrent sessions | Max 5 per user; oldest revoked on new login |
| MFA | Mandatory for ADMIN, PLATFORM_SUPER_ADMIN by Month 6 |

---

## 5. Multi-Tenancy & Tenant Isolation Strategy

### 5.1 Isolation Model: Row-Level + Application Enforcement + RLS Defense-in-Depth

This is already architected in `docs/tenant-isolation.md`. The blueprint confirms and hardens it:

```
┌─────────────────────────────────────────────────────────┐
│                  TENANT ISOLATION LAYERS                │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Application Filtering (Primary)               │
│  - Every query includes WHERE organizationId = ?      │
│  - BaseRepository pattern enforces this automatically   │
├─────────────────────────────────────────────────────────┤
│  Layer 2: PostgreSQL Row-Level Security (Defense)       │
│  - RLS policies on all tenant-scoped tables             │
│  - SET app.current_tenant before each query            │
│  - Catches direct SQL / admin tool bypasses              │
├─────────────────────────────────────────────────────────┤
│  Layer 3: API Gateway / Middleware (Perimeter)        │
│  - X-Organization-ID header validation                  │
│  - User membership verification                         │
│  - Cross-tenant requests rejected at edge               │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Tenant Context Propagation

```
HTTP Request
  ↓
Auth Middleware: Extract user from JWT cookie
  ↓
Tenant Middleware: Resolve active organization from:
  - Header: X-Organization-ID
  - User's active OrganizationMembership
  - URL parameter (for shared links)
  ↓
Tenant Context: Set in AsyncLocalStorage / request object
  ↓
All Services: Filter by tenantContext.organizationId
  ↓
All Prisma Queries: WHERE organizationId = ?
  ↓
Redis Jobs: tenantId explicitly passed in job payload
```

### 5.3 Data Model for Tenancy

Every tenant-scoped entity includes `organizationId` as a required (NOT NULL) field:

```prisma
model Patient {
  id             String    @id @default(uuid())
  organizationId String    // ← Tenant context, NOT NULL
  // ...
}

model PatientCase {
  id             String    @id @default(uuid())
  organizationId String    // ← Tenant context, NOT NULL
  // ...
}
```

Cross-tenant sharing is **explicit, consent-based, and audit-logged** via `DataSharingPermission` records.

### 5.4 Tenant Resolution for Multi-Organization Users

Users with multiple memberships (e.g., a consultant at Center A and Center B) see an organization switcher. Switching organizations:
1. Requires re-validation of membership
2. Clears cached tenant context
3. Regenerates JWT with new active organization claim
4. Logs the switch in audit log

### 5.5 Physical Separation for Enterprise Tier

| Tier | Isolation |
|------|-----------|
| Starter / Professional | Logical isolation (row-level + RLS) |
| Enterprise | Optional dedicated schema or database per health system |

---

## 6. Security & Privacy Controls

### 6.1 Encryption

| Layer | Standard | Implementation |
|-------|----------|----------------|
| Data at rest (DB) | AES-256 | PostgreSQL TDE or AWS RDS encryption |
| Data at rest (backups) | AES-256 | Backup encryption with separate key |
| Data in transit (API) | TLS 1.3 | Vercel Edge + origin certificate |
| Data in transit (service-to-service) | TLS 1.3 | RDS/Redis TLS connections |
| Key management | Cloud KMS | AWS KMS or HashiCorp Vault; 90-day rotation |

### 6.2 PHI Handling Rules

1. **Minimization:** Collect only minimum necessary PHI for transplant coordination.
2. **De-identification:** Analytics/ML uses HIPAA Safe Harbor before processing.
3. **Segmentation:** PHI never co-mingled with non-PHI in unprotected stores.
4. **Transmission:** No email/SMS of PHI without end-to-end encryption.
5. **No PHI in observability:** Patient names, MRNs, DOBs redacted from Sentry, logs, OpenTelemetry.

### 6.3 Audit Logging

Every authentication, authorization decision, and PHI access is logged immutably:

```
actorId, action, entityType, entityId, organizationId,
metadata (redacted), ipAddress, timestamp
```

- **Retention:** 6 years minimum (HIPAA); 7 years for litigation hold
- **Storage:** PostgreSQL `audit_logs` table → quarterly archival to WORM object storage
- **Integrity:** Tamper-evident hashing; periodic integrity verification

### 6.4 Security Review Gates

The following require explicit `security-reviewer` approval before implementation:

| Category | Examples |
|----------|----------|
| Cryptography changes | New algorithms, key rotation schedules, custom crypto |
| Auth/AuthZ changes | New roles, OAuth scopes, session policy changes |
| PHI access patterns | New endpoints returning PHI, bulk export, analytics on PHI |
| Network/infrastructure | VPC changes, firewall relaxations, CDN/WAF rules |
| Third-party integrations | New vendors processing PHI, EHR webhooks |
| Tenant isolation | Shared resource pool changes, cross-tenant routing |
| Data retention | Automated deletion, right-to-erasure implementation |

### 6.5 Environment Segregation

| Environment | Data Rule | Access Rule |
|-------------|-----------|-------------|
| Production | Real PHI only | Break-glass only; all access logged |
| Staging | Synthetic data only | Limited team; no customer access |
| Development | Synthetic data | Open to engineering |
| Local | Synthetic seeded data | Individual developer |

> **Red Line:** Never use production PHI in non-production environments.

---

## 7. Integration Points with Hospital IT

### 7.1 EHR Integration: SMART on FHIR

**Phase 1 (Months 1–6): Read-Only FHIR**

```
Patient opens NephroAssist from Epic MyChart
  ↓
SMART on FHIR Launch (context: patient)
  ↓
OAuth 2.0 + PKCE authorization
  ↓
FHIR R4 read: Patient, Observation (labs), Appointment, AllergyIntolerance, MedicationRequest
  ↓
NephroAssist displays read-only data alongside transplant checklist
```

**Supported EHRs:**
- Epic (App Orchard)
- Cerner / Oracle Health (Code Program)
- Meditech (FHIR R4 gateway)
- Other (generic FHIR R4 proxy)

**Phase 2 (Months 6–18): Write with Approval**
- Write patient-reported outcomes (PROs) back to EHR
- Requires clinician electronic signature before write
- Two-factor approval for any clinical data writeback

**Phase 3 (Months 18–36): Bidirectional Sync**
- Full care-plan synchronization
- Requires extensive per-EHR-version testing

### 7.2 HL7 v2 (Future / Enterprise Tier)

For health systems that cannot expose FHIR APIs:
- HL7 v2.5 ADT/ORU inbound (patient demographics, lab results)
- MLLP-over-TLS for secure transport
- HL7 v2-to-FHIR transformer (internal)
- **Out of scope for MVP** — evaluate after first 5 Enterprise customers

### 7.3 UNOS/OPTN / SRTR Integration

- **Read-only:** Pull waiting-list status and outcome benchmarks via SRTR data feeds
- **No write access:** OPTN listing decisions remain with transplant center administrators
- **Phase 3:** Automated SRTR/OPTN reporting from anonymized, aggregated data

### 7.4 Eurotransplant Integration (Phase 3)

- Requires bilateral agreement
- GDPR DPIA prerequisite
- EU-hosted infrastructure for data residency

### 7.5 Email / Communication

| Integration | Provider | Purpose |
|-------------|----------|---------|
| Transactional email | Resend (or AWS SES with BAA) | Appointment reminders, task notifications, password reset |
| Patient-coordinator chat | In-app (WebSocket or polling) | Real-time messaging; all messages logged and encrypted at rest |
| SMS fallback | Twilio (with BAA) | Reminders for patients without smartphone access |

---

## 8. AI Architecture

The existing `docs/ai-architecture.md` defines the AI governance model. Key architectural requirements:

### 8.1 LLMGateway (Mandatory)

```
Frontend → Backend API → LLMGateway → LLM Provider
                            │
                            ├── Provider selection (cost, latency, compliance)
                            ├── PHI redaction before outbound call
                            ├── Prompt versioning (PromptTemplate table)
                            ├── Structured output validation (Zod)
                            ├── Cost tracking per organization
                            └── Audit logging (AIProcessingLog table)
```

### 8.2 AI Capabilities (Assistive Only)

| Allowed | Prohibited |
|---------|------------|
| Document classification | Diagnosis |
| OCR / information extraction | Transplantability classification |
| Requirement explanation (patient-friendly) | Medical prioritization |
| Missing-information flagging | Clearance granting |
| Translation support | Listing decisions |

### 8.3 Data Privacy in AI

- **PHI redaction:** Names, DOB, MRN, addresses replaced with tokens before LLM call
- **EU data residency:** EU-hosted LLM endpoint or local model (Llama) for EU patients
- **No chain-of-thought stored:** Only structured results, confidence scores, human overrides

---

## 9. Implementation Phase Breakdown

### Phase 1: MVP — "Kidney Readiness Core" (Months 1–6)

**Goal:** Production-ready kidney transplant readiness platform for 3 pilot centers.

| Week | Deliverable | Acceptance Criteria |
|------|-------------|-------------------|
| 1–2 | Security hardening | HIPAA gap analysis complete; BAA signed with cloud provider; automated security scanning in CI |
| 2–4 | Auth evolution | OIDC-ready abstraction layer; MFA for admin roles; session rotation; audit log pipeline |
| 4–6 | Tenant isolation enforcement | RLS policies on all tables; BaseRepository pattern in all services; E2E tenant isolation tests passing |
| 6–8 | Real document upload | S3-compatible encrypted storage; virus scan hook; presigned URLs; MIME type whitelist; SHA-256 checksums |
| 8–10 | FHIR read integration | SMART on FHIR launch from Epic; read Patient, Observation, Appointment; fallback manual CSV import |
| 10–12 | Pilot readiness | SOC 2 Type II auditor engaged; pilot contract signed; onboarding runbook; training materials |

**Phase 1 Non-Functional Targets:**
- Uptime: 99.9%
- API p99 latency: < 500ms
- Build + lint + typecheck + test passing on every PR
- No PHI in logs, no secrets in code

### Phase 2: Expansion — "Multi-Organ + Living Donor" (Months 6–18)

**Goal:** Expand to heart/liver/lung modules; living-donor workflow; FHIR writeback.

| Month | Deliverable | Dependencies |
|-------|-------------|--------------|
| 6–9 | Heart / liver / lung modules | Phase 1 kidney checklist proven; template system supports organ-specific variations |
| 9–12 | Living-donor workflow | Parallel checklist model; consent architecture supports donor-specific consent |
| 12–15 | FHIR write integration | Two-factor clinician approval; extensive Epic/Cerner testing |
| 15–18 | Coordinator dashboard + analytics | ROI metrics (time-to-listing, no-show rates); SOC 2 Type II report issued |

### Phase 3: Scale — "AI, Benchmarking, EU" (Months 18–36)

**Goal:** AI personalization, SRTR automation, EU expansion.

| Month | Deliverable | Caveat |
|-------|-------------|--------|
| 18–24 | AI-powered personalization | Must NOT give medical advice; FDA SaMD boundary analysis required |
| 24–30 | SRTR/OPTN reporting automation | Data-format alignment; anonymized/aggregated only |
| 30–36 | EU expansion | GDPR DPIA complete; EU-hosted option; Eurotransplant integration explored |

---

## 10. Acceptance Criteria

### 10.1 Architecture-Level Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|------------|
| A1 | Every tenant-scoped database query includes `organizationId` filter | Static analysis + E2E test: user from Org A cannot read Org B data |
| A2 | PostgreSQL RLS policies are enabled on all tenant-scoped tables | `\d+ patients` shows RLS enabled; policy exists for `app_user` |
| A3 | No PHI appears in application logs, Sentry, or OpenTelemetry | Automated log-scanning test; redaction unit tests |
| A4 | All API inputs validated with Zod schema | Every API route has Zod validator; fuzz testing passes |
| A5 | Encryption at rest (AES-256) and in transit (TLS 1.3) | Infrastructure audit; SSL Labs A+ rating |
| A6 | Audit log captures every PHI access with actor, action, entity, timestamp | Unit tests for all repository read operations |
| A7 | AI outputs require human review before affecting workflow | UI enforced: "Approve" / "Reject" buttons for AI suggestions |
| A8 | Backup encrypted, tested quarterly, retained 7 years | Automated restore drill report |
| A9 | Build passes lint, typecheck, tests on every PR | CI gate: `npm run lint && npm run typecheck && npm run test` |
| A10 | Synthetic data only in non-production environments | Pre-commit hook rejects `.env` with production DB URL in dev |

### 10.2 Feature-Level Acceptance Criteria (MVP)

| ID | Feature | Criterion |
|----|---------|-----------|
| F1 | Kidney readiness checklist | Patient sees 5 journey stages; coordinator sees completion percentage |
| F2 | Patient-coordinator chat | Real-time messaging; all messages encrypted at rest; exportable audit trail |
| F3 | Medication adherence reminders | Patient receives reminder; coordinator sees adherence status |
| F4 | FHIR read (Epic) | Patient demographics and labs auto-populate from Epic; fallback to manual entry |
| F5 | Document upload | Encrypted storage; virus scan; audit log; presigned URL access |

---

## 11. Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| EHR integration takes >6 months | Medium | High | SMART on FHIR first; manual CSV fallback; engage Epic App Orchard early |
| HIPAA breach in early years | Low | Existential | Compliance-first build; automated security scanning; cyber insurance; breach-response playbook |
| Patient adoption low (digital literacy) | Medium | Medium | WCAG 2.1 AA accessibility; caregiver proxy; SMS fallback; large-font UI |
| CareDx launches competing feature | Low-Medium | Very High | Narrow kidney focus + coordinator community; real-time chat differentiation |
| GDPR enforcement blocks EU expansion | Low | High | EU-hosted infrastructure option; DPIA completed before launch |
| AI misclassification leads to clinical error | Low | Very High | AI never decides; human review mandatory; confidence thresholds; override tracking |

---

## 12. Document References

| Document | Path | Purpose |
|----------|------|---------|
| Business Strategy | `marketing/nephroassist-business-strategy-compliance-roadmap.md` | Revenue model, pricing, competitive positioning, feature roadmap |
| Technical Constraints | `docs/TECHNICAL_CONSTRAINTS.md` | Mandatory security controls, red lines, NFRs |
| Tenant Isolation | `docs/tenant-isolation.md` | Row-level + RLS strategy, cross-tenant sharing, testing |
| Security Architecture | `docs/security.md` | Auth, encryption, PHI handling, incident response |
| Database Schema | `prisma/schema.prisma` | Prisma schema — source of truth for data model |
| API Specification | `docs/api.md` | REST endpoint contract |
| AI Architecture | `docs/ai-architecture.md` | LLMGateway, document processing, human override |
| Workflows | `docs/workflows.md` | 6-step sequential workflow logic |
| Frontend Architecture | `docs/frontend.md` | Page inventory, component patterns, Bootstrap conventions |

---

## 13. Decisions Log

| Date | Decision | Rationale | Reversibility |
|------|----------|-----------|---------------|
| 2026-08-28 | Keep custom JWT (evolve to OIDC-ready) | Existing auth is stable; OIDC migration path preserved without disruption | Medium — abstraction layer allows swap |
| 2026-08-28 | Keep Bootstrap 5.3 | User preference; no UX benefit justifies migration cost | Low — Tailwind migration is possible but expensive |
| 2026-08-28 | Add Redis + BullMQ for jobs | Current codebase has no job queue; required for OCR, reminders, email at scale | High — can swap for SQS/RabbitMQ later |
| 2026-08-28 | Replace simulated upload with real S3 storage | Production readiness requirement; simulated upload is a blocker for pilot | Low — S3 API is standard |
| 2026-08-28 | SMART on FHIR before HL7 v2 | FHIR is modern, well-supported by Epic/Cerner; HL7 v2 adds complexity for limited benefit | Medium — HL7 can be added later for legacy systems |
| 2026-08-28 | PWA-first, native apps deferred | Business strategy Phase 1 focus; PWA sufficient for patient access; native apps add 3–6 months | High — native apps can be built in Phase 3 |

---

*Document generated by developer-lead profile for Kanban task t_5a502e1c.*
*Downstream tasks: t_cc8b39dc (database schema design), t_6ad4d1f5 (implementation orchestration).*
