# NephroAssist Relational Database Schema Design

**Task:** t_cc8b39dc  
**Date:** 2026-08-28  
**Author:** database-engineer  
**Status:** Draft — downstream implementation tasks depend on this document  
**Basis:** Technical architecture blueprint (t_5a502e1c), existing Prisma schema, tenant-isolation strategy, security architecture, domain model

---

## 1. Design Principles

1. **Tenant isolation is non-negotiable.** Every patient-data table carries `organization_id` as a required `NOT NULL` column. Row-Level Security (RLS) is enabled on all tenant-scoped tables as defense-in-depth.
2. **Referential integrity at the database.** Foreign keys with `ON DELETE` rules prevent orphaned records. CHECK constraints protect state-machine invariants.
3. **Audit immutability.** The `audit_logs` table is append-only, never updated or deleted by application code. Tamper-evident chain hashing provides integrity verification.
4. **Soft deletes + retention.** `deleted_at` + `retention_until` columns support GDPR right-to-erasure and HIPAA retention requirements without immediate hard deletion.
5. **PHI never leaks.** PHI is encrypted at rest (PostgreSQL TDE / AWS RDS encryption). No PHI in audit metadata, logs, or observability.
6. **Indexes target real access patterns.** Dashboard queries, coordinator queues, document review pipelines, and patient lookup are all covered.

---

## 2. Core Entities

### 2.1 Organization (Tenant)

```
organizations
├── id (PK UUID)
├── name (TEXT NOT NULL)
├── slug (TEXT UNIQUE, CHECK slug_format)
├── type (ENUM: TRANSPLANT_CENTER, DIALYSIS_CENTER, NEPHROLOGY, OTHER_PROVIDER)
├── logo, timezone, language, contact_info (JSONB), settings (JSONB)
├── status (ENUM: ACTIVE, INACTIVE, SUSPENDED)
├── parent_organization_id (SELF-REF FK → SET NULL)   -- hospital group hierarchy
├── deleted_at, deletion_requested_at, retention_until -- GDPR/HIPAA
├── created_at, updated_at
```

**Constraints:** `chk_org_slug_format`, `chk_org_not_self_parent`.

**Indexes:** `type`, `status`, `parent_organization_id` (all partial WHERE `deleted_at IS NULL`).

---

### 2.2 Users & Authentication

```
users
├── id (PK UUID)
├── email (UNIQUE, CHECK email_format)
├── email_verified, name, password (bcrypt hash, NULL for OIDC-only)
├── image, role (ENUM: ADMIN..DIALYSIS_STAFF), is_active, last_login_at
├── mfa_enabled, mfa_secret (encrypted TOTP secret -- Phase 2)
├── created_at, updated_at
```

**Companion tables:** `accounts` (OAuth), `sessions` (NextAuth-compat), `verification_tokens`, `login_histories` (security monitoring).

**Constraints:** `chk_user_email_format`.

---

### 2.3 RBAC: Roles & Permissions

```
roles
├── id (PK UUID)
├── name (TEXT)
├── organization_id (FK → organizations, CASCADE, NULL = global)
├── is_global (BOOLEAN, CHECK: global ⇒ org IS NULL)
└── created_at

permissions
├── id (PK UUID)
├── code (UNIQUE, e.g., "patient.read")
├── description, resource, action

role_permissions (M:N junction)
├── role_id + permission_id (PK)
```

**Index:** `permissions(resource)`, `permissions(action)`.

---

### 2.4 OrganizationMembership

Links a `User` to an `Organization` with a `Role`. Supports multi-organization users (consultants at multiple centers).

```
organization_memberships
├── id (PK UUID)
├── user_id (FK → users, CASCADE)
├── organization_id (FK → organizations, CASCADE)
├── role_id (FK → roles)
├── joined_at, status (ACTIVE | INACTIVE | PENDING)
└── UNIQUE(user_id, organization_id)
```

---

### 2.5 Patient

PHI-heavy. `organization_id` provides tenant isolation. `user_id` optional (links to login identity; NULL for pediatric patients managed by caregiver).

```
patients
├── id, first_name, last_name, date_of_birth, email, phone
├── gp_name, gp_email, gp_phone, gp_address, gp_city
├── language, timezone, consent_status
├── user_id (FK → users, SET NULL)
├── organization_id (FK → organizations, NOT NULL)
├── created_by, created_at, updated_at
├── deleted_at, retention_until
├── gdpr_consent_granted_at, gdpr_consent_revoked_at, gdpr_data_portability_at
```

**Constraints:** `chk_patient_email_format`, `chk_patient_dob_past`.

**Indexes:** `organization_id`, `email`, `consent_status`, `user_id`, `date_of_birth`, full-name trigram (GIN) for fuzzy search.

---

### 2.6 PatientCase (Transplant Journey)

A patient can have multiple cases (multi-center evaluation). Each case is isolated by `organization_id`.

```
patient_cases
├── id, patient_id (FK → patients, CASCADE)
├── organization_id (FK → organizations, NOT NULL)
├── program_id (FK → transplant_programs)
├── coordinator_id (FK → users, SET NULL)
├── status (case_status ENUM)
├── referral_date, intake_date, ready_for_review_date
├── board_decision_date, waitlisted_date, closed_date, closure_reason, notes
├── deleted_at, retention_until
├── created_by, created_at, updated_at
```

**Constraint:** `chk_case_closed_reason` (closed_date ⇒ closure_reason NOT NULL).

**Indexes:** `patient_id`, `organization_id`, `status`, `coordinator_id`, `waitlisted_date`.

---

### 2.7 TransplantProgram

Defines organ type and workflow per organization.

```
transplant_programs
├── id, organization_id (FK → organizations, CASCADE)
├── name, slug, description
├── type (KIDNEY | LIVER | HEART | LUNG | OTHER)
├── status (ACTIVE | INACTIVE | DRAFT)
├── UNIQUE(organization_id, slug)
```

**Index:** `organization_id`.

---

### 2.8 RequirementTemplate

Master definition of a checklist item. Versioned via `requirement_template_versions`.

```
requirement_templates
├── id, program_id (FK → transplant_programs, CASCADE)
├── organization_id (FK → organizations)
├── name, category, description, patient_friendly_description
├── required, listing_blocker, conditional
├── validity_duration (months), renewal_lead_time (days)
├── responsible_role (PATIENT | CAREGIVER | ...)
├── review_required, instructions, priority, version, status
```

**Indexes:** `program_id`, `organization_id`, `status`.

---

### 2.9 PatientRequirement

Snapshot of a template assigned to a case. Fields are **copied** at instantiation so template changes do not retroactively alter active cases.

```
patient_requirements
├── id, case_id (FK → patient_cases, CASCADE)
├── template_id (FK → requirement_templates)
├── organization_id, program_id
├── title, description, category, required, listing_blocker, conditional
├── validity_duration, renewal_lead_time, responsible_role, review_required
├── status (requirement_status ENUM), priority, instructions
├── patient_friendly_description, due_date, completed_at, expires_at, renewal_started_at
├── deleted_at, retention_until
```

**Indexes:** `case_id`, `status`, `due_date`, `expires_at`, composite `(listing_blocker, status)` for blocker dashboards.

---

### 2.10 Task

Concrete work item derived from a `PatientRequirement`. Supports workflow steps (`is_workflow_step`, `step_number`, `previous_step_id`).

```
tasks
├── id, requirement_id (FK → patient_requirements, CASCADE)
├── case_id (FK → patient_cases, CASCADE), patient_id (FK → patients, SET NULL)
├── title, description, owner_type, owner_id, status, due_date, completed_at, reminders
├── dependency_of (FK → tasks, SET NULL)
├── step_number, step_name, step_description, previous_step_id, is_workflow_step
├── completed_by_id, completed_by_role, metadata (JSONB)
├── deleted_at, retention_until
```

**Indexes:** `case_id`, `status`, `due_date`, `owner_id`, `step_number` (partial `is_workflow_step = TRUE`), `completed_by_id`.

---

### 2.11 Document

Metadata table for object-storage documents (S3). `sha256` enables duplicate detection and integrity verification. `kms_key_id` tracks encryption key for rotation.

```
documents
├── id, patient_id (FK → patients), organization_id (FK → organizations)
├── case_id (FK → patient_cases, SET NULL)
├── file_key, filename, mime_type, size, sha256
├── document_type, document_date, uploaded_by, source, processing_status
├── classification, ai_confidence, ocr_text, extracted_data (JSONB)
├── version, previous_version_id (FK → documents, SET NULL)
├── kms_key_id
├── deleted_at, retention_until
```

**Indexes:** `patient_id`, `organization_id`, `case_id`, `processing_status`, `sha256`, `document_date`.

---

### 2.12 Appointment

```
appointments
├── id, patient_id (FK → patients), case_id (FK → patient_cases, SET NULL)
├── organization_id (FK → organizations)
├── type, provider, location, start_time, end_time, status
├── related_requirement_id (FK → patient_requirements, SET NULL), notes, reminders (JSONB)
├── deleted_at, retention_until
```

**Indexes:** `patient_id`, `case_id`, `organization_id`, `start_time`, `status`.

---

### 2.13 Blocker & HelpRequest

First-class entities for workflow impediments and patient support.

```
blockers
├── id, case_id (FK → patient_cases, CASCADE)
├── requirement_id (FK → patient_requirements, SET NULL)
├── type (blocker_type ENUM), description, status (ACTIVE | RESOLVED)
├── resolved_at, resolved_by (FK → users)

help_requests
├── id, patient_id, case_id, organization_id
├── requirement_id (FK → patient_requirements, SET NULL)
├── type (help_type ENUM), description, status (OPEN | IN_PROGRESS | RESOLVED)
├── assigned_to (FK → users), created_at, resolved_at
```

**Indexes:** `blockers(case_id, status)`, `help_requests(case_id, status, assigned_to)`.

---

### 2.14 AuditLog

Immutable, append-only. Tamper-evident chain hashing. Partitioned by `timestamp` when >10M rows/year.

```
audit_logs
├── id, actor_id (FK → users), action, entity_type, entity_id
├── organization_id (FK → organizations)
├── metadata (JSONB, CHECK no PHI)
├── ip_address (INET), user_agent
├── previous_hash, row_hash (SHA-256 chain)
├── timestamp
```

**Constraint:** `chk_audit_metadata_no_phi` (rejects metadata containing first_name, last_name, email).

**Indexes:** `actor_id`, `(entity_type, entity_id)`, `organization_id`, `timestamp`, `action`.

---

### 2.15 Supporting Tables

| Table | Purpose |
|-------|---------|
| `medications` | Patient medication list with dosing schedule |
| `dialysis_regimes` | Detailed dialysis prescription |
| `document_requirement_links` | M:N link between documents and requirements (AI or manual match) |
| `extracted_document_items` | Structured data extracted from documents |
| `document_reviews` | Clinical review workflow (ACCEPTED / REJECTED / REQUEST_INFO) |
| `messages` | Contextual messaging (threaded, entity-bound) |
| `notifications` | User notification queue |
| `timeline_events` | Auto-generated case lifecycle events |
| `transplant_passports` | Emergency shareable summary |
| `caregiver_access` | Delegated patient access with granular JSON permissions |
| `secure_upload_links` | Expiring, limited-use upload tokens |
| `feature_flags` | A/B and org-scoped toggles |
| `system_settings` | Key-value org/global config |
| `system_configs` | Admin-editable system parameters (category, type, label) |
| `prompt_templates` | Versioned AI prompt definitions |
| `prompt_versions` | Audit trail of prompt changes |
| `ai_processing_logs` | Every AI call with input hash, output, confidence, override flag |
| `data_sharing_permissions` | Explicit cross-tenant sharing with expiry |

---

## 3. Relationships & Constraints

### 3.1 Entity Relationship Summary

```
Organization (tenant)
├── Role[] (global or org-specific)
├── TransplantProgram[]
│   └── RequirementTemplate[]
│       └── RequirementTemplateVersion[]
│       └── RequirementDependency[] (self-referential prerequisite)
├── Patient[]
│   ├── Medication[]
│   ├── DialysisRegime[]
│   ├── PatientCase[]
│   │   ├── PatientRequirement[] (snapshot of template)
│   │   │   ├── Task[]
│   │   │   ├── Blocker[]
│   │   │   ├── Appointment[]
│   │   │   ├── DocumentRequirementLink[] → Document[]
│   │   │   └── HelpRequest[]
│   │   ├── Document[]
│   │   ├── Appointment[]
│   │   ├── TimelineEvent[]
│   │   └── TransplantPassport[]
│   ├── Document[]
│   ├── Appointment[]
│   ├── CaregiverAccess[]
│   └── HelpRequest[]
├── AuditLog[]
├── Message[]
├── Notification[]
├── SecureUploadLink[]
└── DataSharingPermission[]

User
├── Account[] (OAuth)
├── Session[]
├── LoginHistory[]
├── OrganizationMembership[] → Role[]
└── Patient[] (optional link)
```

### 3.2 Referential Integrity Rules

| Parent Table | Child Table | FK Rule | Rationale |
|-------------|-------------|---------|-----------|
| `organizations` | `roles` | `ON DELETE CASCADE` | Org deletion removes org-specific roles |
| `organizations` | `patients` | `ON DELETE RESTRICT` (implicit, no CASCADE) | Prevent accidental tenant data loss |
| `patients` | `patient_cases` | `ON DELETE CASCADE` | Case is meaningless without patient |
| `patient_cases` | `patient_requirements` | `ON DELETE CASCADE` | Requirement belongs to case |
| `patient_requirements` | `tasks` | `ON DELETE CASCADE` | Task belongs to requirement |
| `patients` | `documents` | no CASCADE on patient | Document may outlive patient (retention) |
| `documents` | `document_requirement_links` | `ON DELETE CASCADE` | Link dies with document |
| `users` | `audit_logs` | `ON DELETE CASCADE` | Audit retained even if user deleted (but FK maintained) |

### 3.3 CHECK Constraints

| Table | Constraint | Purpose |
|-------|-----------|---------|
| `organizations` | `chk_org_slug_format` | URL-safe slugs |
| `organizations` | `chk_org_not_self_parent` | No self-reference loops |
| `roles` | `chk_role_global_no_org` | Global roles have no org |
| `users` | `chk_user_email_format` | Valid email format |
| `patients` | `chk_patient_dob_past` | DOB not in future |
| `patient_cases` | `chk_case_closed_reason` | Closure requires reason |
| `requirement_dependencies` | `chk_dep_not_self` | No self-prerequisite |
| `data_sharing_permissions` | `chk_sharing_not_same_org` | Cross-tenant only |
| `audit_logs` | `chk_audit_metadata_no_phi` | Prevent PHI leakage into audit |

---

## 4. Tenant Isolation

### 4.1 Three-Layer Defense

| Layer | Mechanism | When It Applies |
|-------|-----------|-----------------|
| **Primary** | Application-level `WHERE organization_id = ?` | Normal API flow via Prisma |
| **Defense-in-depth** | PostgreSQL RLS policies | Direct SQL, admin tools, backup/restore, analytics |
| **Perimeter** | Middleware `X-Organization-ID` validation | API gateway edge |

### 4.2 RLS Policy Design

All tenant-scoped tables have `ENABLE ROW LEVEL SECURITY`. The application sets:

```sql
SET app.current_tenant = 'org-uuid-here';
```

before direct SQL queries. Policies enforce:

```sql
CREATE POLICY tenant_isolation_patients ON patients
  FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
```

**Tables with RLS enabled:** `patients`, `patient_cases`, `patient_requirements`, `tasks`, `documents`, `appointments`, `blockers`, `help_requests`, `messages`, `notifications`, `audit_logs`, `timeline_events`, `transplant_passports`, `caregiver_access`, `secure_upload_links`.

### 4.3 Multi-Organization Users

A user with multiple `OrganizationMembership` records sees an organization switcher. Switching requires re-validation, clears cached tenant context, and is logged in `audit_logs`.

### 4.4 Cross-Tenant Sharing

Explicit, consent-based via `data_sharing_permissions`:

- `donor_organization_id` ≠ `recipient_organization_id`
- `expires_at` mandatory
- `revoked_at` nullable
- Every access to shared data is logged in `audit_logs`

---

## 5. Indexes for Common Access Patterns

### 5.1 Dashboard Queries

| Dashboard | Query Pattern | Index |
|-----------|---------------|-------|
| Coordinator queue | `patient_cases WHERE organization_id = ? AND status = 'EVALUATION'` | `idx_cases_organization`, `idx_cases_status` |
| Overdue tasks | `tasks WHERE organization_id = ? AND status = 'PENDING' AND due_date < now()` | `idx_tasks_due_date` + `idx_tasks_status` |
| Document review pipeline | `documents WHERE organization_id = ? AND processing_status = 'READY_FOR_REVIEW'` | `idx_documents_processing_status` |
| Blocker alerts | `blockers WHERE case_id IN (...) AND status = 'ACTIVE'` | `idx_blockers_status` |
| Help requests | `help_requests WHERE organization_id = ? AND status = 'OPEN'` | `idx_help_requests_status` |

### 5.2 Patient Lookup

| Pattern | Index |
|---------|-------|
| Search by name | `idx_patients_name_trgm` (GIN trigram) |
| Lookup by email | `idx_patients_email` |
| Filter by consent | `idx_patients_consent` |
| Filter by DOB range | `idx_patients_dob` |

### 5.3 Case Lifecycle

| Pattern | Index |
|---------|-------|
| Case by patient | `idx_cases_patient` |
| Cases by coordinator | `idx_cases_coordinator` |
| Waitlisted patients | `idx_cases_waitlisted` |
| Requirements by case | `idx_patient_reqs_case` |
| Requirements by due date | `idx_patient_reqs_due_date` |
| Requirements expiring soon | `idx_patient_reqs_expires` |
| Listing blockers | `idx_patient_reqs_listing_block` |

### 5.4 Audit & Compliance

| Pattern | Index |
|---------|-------|
| Audit by actor | `idx_audit_actor` |
| Audit by entity | `idx_audit_entity` |
| Audit by time range | `idx_audit_timestamp` |
| Audit by action type | `idx_audit_action` |
| Login history by user | `idx_login_histories_user` |
| Login history by time | `idx_login_histories_timestamp` |

### 5.5 Index Maintenance Strategy

- All partial indexes include `WHERE deleted_at IS NULL` to keep index small and focused on active data.
- `audit_logs` should be partitioned by `timestamp` range when exceeding 10M rows/year.
- Re-index `idx_patients_name_trgm` weekly if heavy write load.

---

## 6. GDPR / HIPAA Considerations

### 6.1 Encryption

| Layer | Standard | Implementation |
|-------|----------|----------------|
| Data at rest (DB) | AES-256 | PostgreSQL TDE or AWS RDS encryption |
| Data at rest (backups) | AES-256 | Backup encryption with separate key |
| Data in transit (API) | TLS 1.3 | Vercel Edge + origin certificate |
| Object storage (S3) | SSE-KMS | AWS KMS or Cloudflare R2; `kms_key_id` tracked per document |
| Key management | Cloud KMS | 90-day rotation; no keys in code |

### 6.2 Soft Deletes & Retention

- `deleted_at` timestamp on all PHI tables. Application queries filter `WHERE deleted_at IS NULL`.
- `retention_until` column supports per-record retention policies:
  - Medical records: 10 years (German law) / 7 years (HIPAA)
  - Audit logs: 7 years
  - AI processing logs: 3 years
- A background cron job hard-deletes rows where `retention_until < now()` and `deleted_at IS NOT NULL`.
- GDPR right-to-erasure sets `deletion_requested_at` and `deleted_at = now()`; hard deletion occurs after retention period.

### 6.3 Audit Trail

- **Immutable:** `audit_logs` rows are never updated or deleted.
- **Tamper-evident:** `previous_hash` + `row_hash` chain. Periodic integrity verification job recomputes hashes.
- **No PHI:** `chk_audit_metadata_no_phi` prevents patient names, emails, or DOBs from entering metadata.
- **Retention:** 7 years minimum. Quarterly archival to WORM object storage.

### 6.4 Consent Management

- `patients.consent_status`: `CONSENT_PENDING` → `CONSENT_GRANTED` → `CONSENT_REVOKED`.
- `gdpr_consent_granted_at`, `gdpr_consent_revoked_at`, `gdpr_data_portability_at` track GDPR-specific events.
- Consent revocation triggers:
  1. `deleted_at = now()` on patient record (soft delete)
  2. Revocation of all `data_sharing_permissions`
  3. Cancellation of all pending `appointments` and `tasks`
  4. Audit log entry

### 6.5 Data Minimization

- Only collect minimum necessary PHI for transplant coordination.
- Analytics/ML uses de-identified data (HIPAA Safe Harbor method) before processing.
- AI Gateway scrubs PHI before sending to LLM APIs.

### 6.6 Environment Segregation

| Environment | Data | Access |
|-------------|------|--------|
| Production | Real PHI only | Break-glass; all access logged |
| Staging | Synthetic data | Limited team; no customer access |
| Development | Synthetic seeded data | Open to engineering |

**Red Line:** Never use production PHI in non-production environments.

---

## 7. Migration Strategy

### 7.1 Expand-and-Contract Pattern

For breaking schema changes, use expand-and-contract to maintain zero-downtime deployments:

```
Phase 1 (Expand):
  - Add new column/table (nullable or with default)
  - Deploy application code that writes to BOTH old and new
  - Backfill existing data

Phase 2 (Migrate):
  - Verify backfill complete
  - Switch application reads to new column/table
  - Monitor for errors

Phase 3 (Contract):
  - Remove old column/table after N days
  - Remove dual-write code
```

### 7.2 Adding Tenant to Existing Tables

```sql
-- Step 1: Add column (nullable first)
ALTER TABLE patients ADD COLUMN organization_id UUID;

-- Step 2: Backfill with default tenant
UPDATE patients SET organization_id = 'default-tenant-id';

-- Step 3: Make NOT NULL
ALTER TABLE patients ALTER COLUMN organization_id SET NOT NULL;

-- Step 4: Add FK and index
ALTER TABLE patients ADD CONSTRAINT fk_patients_organization
  FOREIGN KEY (organization_id) REFERENCES organizations (id);
CREATE INDEX idx_patients_organization ON patients (organization_id) WHERE deleted_at IS NULL;

-- Step 5: Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_patients ON patients
  FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
```

### 7.3 Versioned Template Changes

When publishing a new `RequirementTemplate` version:
- `apply_to`: `NEW_ONLY` | `SELECTED` | `ALL_ELIGIBLE`
- Preview before mass changes
- Create new `PatientRequirement` snapshots only for selected cases
- Audit log every template version change

### 7.4 Document Versioning

Documents are versioned, not overwritten:
- New upload creates new `documents` row with `previous_version_id` pointing to old row.
- Old row `processing_status` updated to `SUPERSEDED`.
- `sha256` enables duplicate detection across versions.

### 7.5 Rollback Strategy

- Every migration is reversible (down migration) or idempotent.
- Database snapshots before major migrations.
- Feature flags (`feature_flags`) gate new schema usage so code can be rolled back independently of schema.

### 7.6 Migration Safety Checklist

- [ ] Is the migration backward compatible (old code can run against new schema)?
- [ ] Is there a default value or nullable column for new required fields?
- [ ] Is a backfill script included and tested on a copy of production data?
- [ ] Is the migration wrapped in a transaction where possible?
- [ ] Are large table rewrites avoided (prefer `ADD COLUMN` over `ALTER TYPE`)?
- [ ] Is RLS policy creation included for new tenant-scoped tables?
- [ ] Is the migration idempotent (can be re-run safely)?
- [ ] Is a rollback plan documented?

---

## 8. ER Diagram (Textual)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  organizations  │────▶│     roles       │────▶│  permissions    │
│   (tenant)      │     │  (RBAC)         │     │                │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │    ┌─────────────────┐
         ├───▶│  users          │
         │    │  (auth identity)│
         │    └─────────────────┘
         │
         │    ┌─────────────────┐     ┌─────────────────┐
         ├───▶│  patients       │◄────│  medications    │
         │    │  (PHI-heavy)    │     │  dialysis_regimes│
         │    └────────┬────────┘     └─────────────────┘
         │             │
         │    ┌────────▼────────┐     ┌─────────────────┐
         ├───▶│  patient_cases  │────▶│ patient_requirements│
         │    │  (journey)      │     │  (checklist)    │
         │    └────────┬────────┘     └────────┬────────┘
         │             │                       │
         │    ┌────────▼────────┐     ┌────────▼────────┐
         └───▶│  appointments   │     │  tasks          │
              │  blockers       │     │  document_req_links│
              │  help_requests  │     │  (M:N)          │
              │  documents      │◄────┘                 │
              │  timeline_events│                       │
              │  passports      │                       │
              └─────────────────┘                       │
                                                        │
                                              ┌─────────▼─────────┐
                                              │  documents        │
                                              │  (metadata + S3) │
                                              └───────────────────┘
```

See the full SQL DDL in `nephroassist-database-schema-design.sql`.

---

## 9. Prisma Schema Alignment

The existing `prisma/schema.prisma` is structurally aligned with this design. Key mappings:

| Prisma Model | SQL Table | Notes |
|-------------|-----------|-------|
| `Organization` | `organizations` | Added `deleted_at`, `retention_until` |
| `Patient` | `patients` | Added `retention_until`, `gdpr_*` columns |
| `PatientCase` | `patient_cases` | Added `retention_until`, `chk_case_closed_reason` |
| `PatientRequirement` | `patient_requirements` | Added `retention_until`, composite blocker index |
| `Task` | `tasks` | Added `retention_until` |
| `Document` | `documents` | Added `kms_key_id`, `retention_until` |
| `Appointment` | `appointments` | Added `retention_until` |
| `AuditLog` | `audit_logs` | Added `previous_hash`, `row_hash`, `user_agent` |
| `DataSharingPermission` | `data_sharing_permissions` | **New table** for explicit cross-tenant sharing |

### 9.1 Recommended Prisma Schema Additions

```prisma
// Add to existing models:
model Patient {
  // existing fields...
  deletedAt         DateTime? @map("deleted_at")
  retentionUntil    DateTime? @map("retention_until")
  gdprConsentGrantedAt  DateTime? @map("gdpr_consent_granted_at")
  gdprConsentRevokedAt  DateTime? @map("gdpr_consent_revoked_at")
  gdprDataPortabilityAt DateTime? @map("gdpr_data_portability_at")
}

model AuditLog {
  // existing fields...
  previousHash String? @map("previous_hash")
  rowHash      String  @map("row_hash")
  userAgent    String? @map("user_agent")
}

model Document {
  // existing fields...
  kmsKeyId      String? @map("kms_key_id")
  deletedAt     DateTime? @map("deleted_at")
  retentionUntil DateTime? @map("retention_until")
}

// New model
model DataSharingPermission {
  id                    String   @id @default(uuid())
  patientId             String   @map("patient_id")
  donorOrganizationId   String   @map("donor_organization_id")
  recipientOrganizationId String @map("recipient_organization_id")
  resourceType          String   @map("resource_type")
  resourceId            String   @map("resource_id")
  grantedAt             DateTime @default(now()) @map("granted_at")
  expiresAt             DateTime @map("expires_at")
  revokedAt             DateTime? @map("revoked_at")
  grantedBy             String   @map("granted_by")

  patient   Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  donorOrg  Organization @relation("DonorShares", fields: [donorOrganizationId], references: [id])
  recipientOrg Organization @relation("RecipientShares", fields: [recipientOrganizationId], references: [id])
  grantedByUser User @relation(fields: [grantedBy], references: [id])

  @@index([patientId])
  @@index([recipientOrganizationId])
  @@index([expiresAt])
  @@map("data_sharing_permissions")
}
```

---

## 10. Open Questions / Future Work

1. **Partitioning:** `audit_logs` should be range-partitioned by `timestamp` once >10M rows/year. This is not in the initial DDL but should be planned for Month 6.
2. **Full-Text Search:** `documents.ocr_text` and `patients` name fields may benefit from PostgreSQL `tsvector`/`tsquery` for advanced search. Evaluate in Phase 2.
3. **Data Retention Job:** The background cron job that hard-deletes expired soft-deleted rows is not implemented here; it belongs to the infrastructure task.
4. **Enterprise Tier:** Physical separation (schema-per-tenant or DB-per-tenant) is reserved for Enterprise customers and not modeled here.
5. **FHIR Integration:** Patient demographics from EHR (SMART on FHIR) may partially duplicate `patients` fields. Decide canonical source of truth per-field before Phase 1 EHR integration.

---

*End of document. SQL DDL lives in `nephroassist-database-schema-design.sql`.*
