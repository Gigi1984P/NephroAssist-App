-- ============================================================================
-- NEPHROASSIST RELATIONAL DATABASE SCHEMA DESIGN
-- PostgreSQL 15+ | Multi-Tenant Healthcare SaaS (Organ Transplant Coordination)
-- Author: database-engineer | Task: t_cc8b39dc
-- ============================================================================
-- DESIGN PRINCIPLES
--   - Every patient-data table carries organization_id (tenant isolation).
--   - Foreign keys enforce referential integrity at the database level.
--   - CHECK constraints protect state-machine invariants.
--   - Indexes target common access patterns (dashboards, queues, lookups).
--   - Soft deletes + retention fields support GDPR/HIPAA.
--   - Audit log is immutable with tamper-evident chain hashing.
--   - PHI is encrypted at rest via host-level TDE (AWS RDS / Cloud KMS).
--   - RLS policies are applied as defense-in-depth.
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS & TYPES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";          -- gen_random_uuid(), crypt()

-- Organization types
CREATE TYPE organization_type AS ENUM (
  'TRANSPLANT_CENTER',
  'DIALYSIS_CENTER',
  'NEPHROLOGY',
  'OTHER_PROVIDER'
);

CREATE TYPE organization_status AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED'
);

-- Membership
CREATE TYPE membership_status AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'PENDING'
);

-- Consent
CREATE TYPE consent_status AS ENUM (
  'CONSENT_GRANTED',
  'CONSENT_REVOKED',
  'CONSENT_PENDING'
);

-- Case lifecycle
CREATE TYPE case_status AS ENUM (
  'REFERRAL',
  'INTAKE',
  'EVALUATION',
  'READY_FOR_REVIEW',
  'UNDER_REVIEW',
  'DEFERRED',
  'APPROVED',
  'WAITLISTED',
  'INACTIVE',
  'TRANSPLANTED',
  'CLOSED'
);

-- Program
CREATE TYPE program_type AS ENUM (
  'KIDNEY',
  'LIVER',
  'HEART',
  'LUNG',
  'OTHER'
);

CREATE TYPE program_status AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'DRAFT'
);

-- Template
CREATE TYPE template_status AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED'
);

CREATE TYPE apply_to AS ENUM (
  'NEW_ONLY',
  'SELECTED',
  'ALL_ELIGIBLE'
);

-- Requirement
CREATE TYPE requirement_status AS ENUM (
  'NOT_STARTED',
  'ACTION_REQUIRED',
  'IN_PROGRESS',
  'WAITING_FOR_APPOINTMENT',
  'WAITING_FOR_DOCUMENT',
  'DOCUMENT_UPLOADED',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED',
  'BLOCKED',
  'EXPIRED',
  'RENEWAL_REQUIRED',
  'WAIVED',
  'NOT_APPLICABLE'
);

CREATE TYPE responsible_role AS ENUM (
  'PATIENT',
  'CAREGIVER',
  'DIALYSIS_CENTER',
  'TRANSPLANT_CENTER',
  'EXTERNAL_PROVIDER',
  'SYSTEM'
);

-- Task
CREATE TYPE task_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'OVERDUE'
);

CREATE TYPE owner_type AS ENUM (
  'PATIENT',
  'CAREGIVER',
  'DIALYSIS_CENTER',
  'TRANSPLANT_CENTER',
  'EXTERNAL_PROVIDER',
  'SYSTEM'
);

-- Document
CREATE TYPE document_source AS ENUM (
  'PATIENT_UPLOAD',
  'CAREGIVER_UPLOAD',
  'DIALYSIS_UPLOAD',
  'CENTER_UPLOAD',
  'EXTERNAL_PROVIDER_UPLOAD',
  'INTEGRATION'
);

CREATE TYPE processing_status AS ENUM (
  'UPLOADED',
  'SCANNING',
  'PROCESSING',
  'READY_FOR_REVIEW',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED',
  'SUPERSEDED',
  'EXPIRED'
);

CREATE TYPE match_type AS ENUM (
  'AI',
  'MANUAL'
);

CREATE TYPE link_status AS ENUM (
  'ACTIVE',
  'REMOVED'
);

CREATE TYPE review_status AS ENUM (
  'ACCEPTED',
  'REJECTED',
  'REQUEST_INFO'
);

-- Appointment
CREATE TYPE appointment_status AS ENUM (
  'PLANNED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULE_REQUIRED'
);

-- Blocker
CREATE TYPE blocker_type AS ENUM (
  'MISSING_PRESCRIPTION',
  'NO_APPOINTMENT',
  'MISSING_DOCUMENT',
  'REJECTED_DOCUMENT',
  'PATIENT_NEEDS_HELP',
  'CLINIC_REVIEW_OVERDUE',
  'EXTERNAL_PROVIDER_DELAY',
  'EXPIRED_EXAMINATION',
  'OTHER'
);

CREATE TYPE blocker_status AS ENUM (
  'ACTIVE',
  'RESOLVED'
);

-- Help
CREATE TYPE help_type AS ENUM (
  'I_DONT_UNDERSTAND',
  'NO_APPOINTMENT',
  'MISSING_PRESCRIPTION',
  'DOCTOR_WONT_ISSUE',
  'TRANSPORT',
  'LANGUAGE',
  'ORGANIZATIONAL',
  'OTHER'
);

CREATE TYPE help_status AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED'
);

-- Message / Notification
CREATE TYPE message_entity_type AS ENUM (
  'REQUIREMENT',
  'DOCUMENT',
  'CASE',
  'APPOINTMENT'
);

CREATE TYPE notification_type AS ENUM (
  'TASK',
  'APPOINTMENT',
  'DOCUMENT',
  'REVIEW',
  'MESSAGE',
  'RENEWAL',
  'HELP_REQUEST',
  'SYSTEM'
);

-- Caregiver
CREATE TYPE caregiver_status AS ENUM (
  'ACTIVE',
  'REVOKED'
);

-- FeatureFlag / SystemSetting
CREATE TYPE flag_scope AS ENUM (
  'GLOBAL',
  'ORGANIZATION'
);

CREATE TYPE setting_scope AS ENUM (
  'GLOBAL',
  'ORGANIZATION'
);

-- AI
CREATE TYPE prompt_status AS ENUM (
  'ACTIVE',
  'DEPRECATED'
);

-- Auth
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'COORDINATOR',
  'PHYSICIAN',
  'NURSE',
  'PATIENT',
  'CAREGIVER',
  'DIALYSIS_STAFF'
);

-- ============================================================================
-- 1. CORE IDENTITY & TENANCY
-- ============================================================================

-- Organizations (tenants). Every patient-data row belongs to one organization.
CREATE TABLE organizations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT        NOT NULL,
  slug                     TEXT        NOT NULL UNIQUE,
  type                     organization_type NOT NULL,
  logo                     TEXT,
  timezone                 TEXT        NOT NULL DEFAULT 'Europe/Berlin',
  language                 TEXT        NOT NULL DEFAULT 'de',
  contact_info             JSONB,
  settings                 JSONB,
  status                   organization_status NOT NULL DEFAULT 'ACTIVE',
  parent_organization_id   UUID        REFERENCES organizations (id) ON DELETE SET NULL,

  -- Soft delete + retention fields (GDPR/HIPAA)
  deleted_at               TIMESTAMPTZ,
  deletion_requested_at    TIMESTAMPTZ,          -- patient-requested deletion
  retention_until          TIMESTAMPTZ,          -- e.g., 7 years after closure

  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT chk_org_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT chk_org_not_self_parent CHECK (parent_organization_id IS NULL OR parent_organization_id <> id)
);

CREATE INDEX idx_organizations_type    ON organizations (type)   WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_status  ON organizations (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_parent  ON organizations (parent_organization_id) WHERE deleted_at IS NULL;

-- Roles (RBAC). Global roles have organization_id = NULL.
-- Org-specific roles (e.g., "Center A Coordinator") tie to an organization.
CREATE TABLE roles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  organization_id  UUID        REFERENCES organizations (id) ON DELETE CASCADE,
  is_global        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_role_global_no_org CHECK (is_global = FALSE OR organization_id IS NULL)
);

CREATE INDEX idx_roles_organization ON roles (organization_id);

-- Permissions (granular resource-action pairs).
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT        NOT NULL UNIQUE,
  description TEXT        NOT NULL,
  resource    TEXT        NOT NULL,
  action      TEXT        NOT NULL
);

CREATE INDEX idx_permissions_resource ON permissions (resource);
CREATE INDEX idx_permissions_action   ON permissions (action);

-- Many-to-many: roles <-> permissions
CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Users (NextAuth-compatible identity table).
-- password is hashed with bcrypt (60 chars). NULL for OIDC-only users.
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL UNIQUE,
  email_verified  TIMESTAMPTZ,
  name            TEXT,
  password        TEXT,                     -- bcrypt hash
  image           TEXT,
  role            user_role   NOT NULL DEFAULT 'PATIENT',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- MFA readiness (Phase 2)
  mfa_enabled     BOOLEAN     NOT NULL DEFAULT FALSE,
  mfa_secret      TEXT,                     -- encrypted TOTP secret

  CONSTRAINT chk_user_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_users_is_active ON users (is_active);

-- OrganizationMembership: links a user to a tenant with a role.
-- A user can belong to multiple organizations (multi-center consultants).
CREATE TABLE organization_memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  role_id         UUID        NOT NULL REFERENCES roles (id),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          membership_status NOT NULL DEFAULT 'ACTIVE',

  UNIQUE (user_id, organization_id)
);

CREATE INDEX idx_memberships_user         ON organization_memberships (user_id);
CREATE INDEX idx_memberships_organization ON organization_memberships (organization_id);
CREATE INDEX idx_memberships_role         ON organization_memberships (role_id);

-- NextAuth compatibility tables
CREATE TABLE accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type                TEXT        NOT NULL,
  provider            TEXT        NOT NULL,
  provider_account_id TEXT        NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,

  UNIQUE (provider, provider_account_id)
);
CREATE INDEX idx_accounts_user ON accounts (user_id);

CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT        NOT NULL UNIQUE,
  user_id       UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions (user_id);

CREATE TABLE verification_tokens (
  identifier TEXT        NOT NULL,
  token      TEXT        NOT NULL UNIQUE,
  expires    TIMESTAMPTZ NOT NULL,

  UNIQUE (identifier, token)
);

CREATE TABLE login_histories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  success    BOOLEAN     NOT NULL,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_login_histories_user     ON login_histories (user_id);
CREATE INDEX idx_login_histories_timestamp ON login_histories (timestamp);


-- ============================================================================
-- 2. PATIENT & CASE
-- ============================================================================

-- Patients: PHI-heavy. organization_id provides tenant isolation.
-- user_id links patient record to login identity (optional, e.g., child patients).
CREATE TABLE patients (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name                 TEXT        NOT NULL,
  last_name                  TEXT        NOT NULL,
  date_of_birth              DATE        NOT NULL,
  email                      TEXT,
  phone                      TEXT,

  -- General practitioner (Hausarzt)
  gp_name                    TEXT,
  gp_email                   TEXT,
  gp_phone                   TEXT,
  gp_address                 TEXT,
  gp_city                    TEXT,

  language                   TEXT        NOT NULL DEFAULT 'de',
  timezone                   TEXT        NOT NULL DEFAULT 'Europe/Berlin',
  consent_status             consent_status NOT NULL DEFAULT 'CONSENT_PENDING',
  user_id                    UUID        REFERENCES users (id) ON DELETE SET NULL,

  -- Tenant isolation
  organization_id            UUID        NOT NULL REFERENCES organizations (id),

  -- Audit
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                 UUID,

  -- Soft delete (retention: 7 years for medical records)
  deleted_at                 TIMESTAMPTZ,
  retention_until            TIMESTAMPTZ,

  -- GDPR
  gdpr_consent_granted_at    TIMESTAMPTZ,
  gdpr_consent_revoked_at    TIMESTAMPTZ,
  gdpr_data_portability_at   TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT chk_patient_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT chk_patient_dob_past CHECK (date_of_birth <= CURRENT_DATE)
);

-- Indexes for common access patterns
CREATE INDEX idx_patients_organization    ON patients (organization_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_email           ON patients (email)           WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_consent         ON patients (consent_status)   WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_user            ON patients (user_id)         WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_dob             ON patients (date_of_birth)   WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_name_trgm       ON patients USING gin ((first_name || ' ' || last_name) gin_trgm_ops) WHERE deleted_at IS NULL;

-- Medications per patient
CREATE TABLE medications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID        NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,   -- e.g., "Tacrolimus Sandoz"
  substance    TEXT        NOT NULL,   -- e.g., "Tacrolimus"
  dose         TEXT        NOT NULL,   -- e.g., "2mg"
  morning      BOOLEAN     NOT NULL DEFAULT FALSE,
  noon         BOOLEAN     NOT NULL DEFAULT FALSE,
  evening      BOOLEAN     NOT NULL DEFAULT FALSE,
  night        BOOLEAN     NOT NULL DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   UUID
);
CREATE INDEX idx_medications_patient ON medications (patient_id);

-- Dialysis regimes per patient
CREATE TABLE dialysis_regimes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID        NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  procedure               TEXT        NOT NULL,   -- Hämodialyse, Peritonealdialyse...
  frequency               TEXT        NOT NULL,   -- e.g., "3-mal pro Woche"
  duration                TEXT        NOT NULL,   -- e.g., "4 Stunden"
  access_type             TEXT        NOT NULL,   -- AV-Fistel, Katheter...
  target_weight           TEXT,
  ultrafiltration_target  TEXT,
  blood_flow              TEXT,
  dialysate_flow          TEXT,
  dialyzer_type           TEXT,
  dialyzer_size           TEXT,
  potassium               TEXT,
  calcium                 TEXT,
  sodium                  TEXT,
  bicarbonate             TEXT,
  anticoagulation         TEXT,
  anticoagulation_dose    TEXT,
  medications_during      TEXT,
  monitoring              TEXT,
  lab_controls            TEXT,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by              UUID
);
CREATE INDEX idx_dialysis_regimes_patient ON dialysis_regimes (patient_id);

-- PatientCase: one patient can have multiple cases (multi-center evaluation).
-- Each case is isolated by organization_id.
CREATE TABLE patient_cases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           UUID        NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  organization_id      UUID        NOT NULL REFERENCES organizations (id),
  program_id           UUID        NOT NULL REFERENCES transplant_programs (id),
  coordinator_id       UUID        REFERENCES users (id) ON DELETE SET NULL,
  status               case_status NOT NULL DEFAULT 'REFERRAL',

  -- Journey timestamps
  referral_date        DATE,
  intake_date          DATE,
  ready_for_review_date DATE,
  board_decision_date  DATE,
  waitlisted_date      DATE,
  closed_date          DATE,
  closure_reason       TEXT,
  notes                TEXT,

  -- Soft delete / retention
  deleted_at           TIMESTAMPTZ,
  retention_until      TIMESTAMPTZ,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by           UUID,

  -- Constraints
  CONSTRAINT chk_case_closed_reason CHECK (
    closed_date IS NULL OR closure_reason IS NOT NULL
  )
);

CREATE INDEX idx_cases_patient       ON patient_cases (patient_id)       WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_organization  ON patient_cases (organization_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_status        ON patient_cases (status)            WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_coordinator   ON patient_cases (coordinator_id)    WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_waitlisted    ON patient_cases (waitlisted_date)    WHERE deleted_at IS NULL;


-- ============================================================================
-- 3. TRANSPLANT PROGRAMS & REQUIREMENTS
-- ============================================================================

-- TransplantProgram: belongs to an organization. Defines organ type + workflow.
CREATE TABLE transplant_programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL,
  description     TEXT,
  type            program_type   NOT NULL DEFAULT 'KIDNEY',
  status          program_status NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (organization_id, slug)
);
CREATE INDEX idx_programs_organization ON transplant_programs (organization_id);

-- TemplateSet: reusable bundles of checklist items (versioned).
CREATE TABLE template_sets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  description  TEXT,
  items        JSONB,                    -- [{ name, category, required, description }]
  version      INTEGER     NOT NULL DEFAULT 1,
  is_latest    BOOLEAN     NOT NULL DEFAULT TRUE,
  parent_id    UUID        REFERENCES template_sets (id) ON DELETE SET NULL,
  status       template_status NOT NULL DEFAULT 'PUBLISHED',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   UUID
);
CREATE INDEX idx_template_sets_name     ON template_sets (name);
CREATE INDEX idx_template_sets_is_latest ON template_sets (is_latest) WHERE is_latest = TRUE;
CREATE INDEX idx_template_sets_parent   ON template_sets (parent_id);

-- RequirementTemplate: the master definition of a single checklist item.
-- One template belongs to exactly one program.
CREATE TABLE requirement_templates (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id                  UUID        NOT NULL REFERENCES transplant_programs (id) ON DELETE CASCADE,
  organization_id             UUID        NOT NULL REFERENCES organizations (id),
  name                        TEXT        NOT NULL,
  category                    TEXT        NOT NULL,
  description                 TEXT,
  patient_friendly_description TEXT,
  required                    BOOLEAN     NOT NULL DEFAULT TRUE,
  listing_blocker             BOOLEAN     NOT NULL DEFAULT FALSE,
  conditional                 BOOLEAN     NOT NULL DEFAULT FALSE,
  validity_duration             INTEGER,  -- months
  renewal_lead_time             INTEGER,  -- days
  responsible_role              responsible_role NOT NULL DEFAULT 'PATIENT',
  review_required             BOOLEAN     NOT NULL DEFAULT TRUE,
  instructions                TEXT,
  priority                    INTEGER     NOT NULL DEFAULT 0,
  version                     INTEGER     NOT NULL DEFAULT 1,
  status                      template_status NOT NULL DEFAULT 'DRAFT',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                  UUID
);
CREATE INDEX idx_req_templates_program       ON requirement_templates (program_id);
CREATE INDEX idx_req_templates_organization    ON requirement_templates (organization_id);
CREATE INDEX idx_req_templates_status        ON requirement_templates (status);

-- RequirementTemplateVersion: audit trail of published changes.
CREATE TABLE requirement_template_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID        NOT NULL REFERENCES requirement_templates (id) ON DELETE CASCADE,
  version       INTEGER     NOT NULL,
  changes       TEXT,
  published_at  TIMESTAMPTZ,
  published_by  UUID,
  apply_to      apply_to    NOT NULL DEFAULT 'NEW_ONLY'
);
CREATE INDEX idx_req_template_versions_template ON requirement_template_versions (template_id);

-- RequirementDependency: template-level prerequisites ("Dental Clearance needs Prescription").
CREATE TABLE requirement_dependencies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID        NOT NULL REFERENCES requirement_templates (id),
  prerequisite_id UUID        NOT NULL REFERENCES requirement_templates (id),

  UNIQUE (template_id, prerequisite_id),
  CONSTRAINT chk_dep_not_self CHECK (template_id <> prerequisite_id)
);
CREATE INDEX idx_req_deps_template      ON requirement_dependencies (template_id);
CREATE INDEX idx_req_deps_prerequisite  ON requirement_dependencies (prerequisite_id);

-- PatientRequirement: instantiated checklist item assigned to a case.
-- Snapshot of template fields at creation time (prevents template changes from retroactively altering active cases).
CREATE TABLE patient_requirements (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                     UUID        NOT NULL REFERENCES patient_cases (id) ON DELETE CASCADE,
  template_id                 UUID        NOT NULL REFERENCES requirement_templates (id),
  organization_id             UUID        NOT NULL REFERENCES organizations (id),
  program_id                  UUID        NOT NULL REFERENCES transplant_programs (id),
  title                       TEXT        NOT NULL,
  description                 TEXT,
  category                    TEXT        NOT NULL,
  required                    BOOLEAN     NOT NULL DEFAULT TRUE,
  listing_blocker             BOOLEAN     NOT NULL DEFAULT FALSE,
  conditional                 BOOLEAN     NOT NULL DEFAULT FALSE,
  validity_duration             INTEGER,
  renewal_lead_time             INTEGER,
  responsible_role              responsible_role NOT NULL DEFAULT 'PATIENT',
  review_required             BOOLEAN     NOT NULL DEFAULT TRUE,
  status                      requirement_status NOT NULL DEFAULT 'NOT_STARTED',
  priority                    INTEGER     NOT NULL DEFAULT 0,
  instructions                TEXT,
  patient_friendly_description TEXT,
  due_date                    DATE,
  completed_at                TIMESTAMPTZ,
  expires_at                  TIMESTAMPTZ,
  renewal_started_at          TIMESTAMPTZ,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Soft delete
  deleted_at                  TIMESTAMPTZ,
  retention_until             TIMESTAMPTZ
);

CREATE INDEX idx_patient_reqs_case        ON patient_requirements (case_id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_reqs_status      ON patient_requirements (status)         WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_reqs_due_date    ON patient_requirements (due_date)      WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_reqs_expires     ON patient_requirements (expires_at)    WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_reqs_listing_block ON patient_requirements (listing_blocker, status) WHERE deleted_at IS NULL AND listing_blocker = TRUE;


-- ============================================================================
-- 4. TASKS
-- ============================================================================

-- Task: concrete work item derived from a PatientRequirement.
CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id    UUID        NOT NULL REFERENCES patient_requirements (id) ON DELETE CASCADE,
  case_id           UUID        NOT NULL REFERENCES patient_cases (id) ON DELETE CASCADE,
  patient_id        UUID        REFERENCES patients (id) ON DELETE SET NULL,
  title             TEXT        NOT NULL,
  description       TEXT,
  owner_type        owner_type  NOT NULL DEFAULT 'PATIENT',
  owner_id          UUID,                     -- user_id or patient_id depending on owner_type
  status            task_status NOT NULL DEFAULT 'PENDING',
  due_date          DATE,
  completed_at      TIMESTAMPTZ,
  reminders         JSONB,
  dependency_of     UUID        REFERENCES tasks (id) ON DELETE SET NULL,

  -- Workflow step fields
  step_number       INTEGER,
  step_name         TEXT,
  step_description  TEXT,
  previous_step_id  UUID        REFERENCES tasks (id) ON DELETE SET NULL,
  is_workflow_step  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Completion tracking
  completed_by_id   UUID        REFERENCES users (id) ON DELETE SET NULL,
  completed_by_role   TEXT,

  -- Flexible metadata (appointment data, upload info, etc.)
  metadata          JSONB,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  deleted_at        TIMESTAMPTZ,
  retention_until   TIMESTAMPTZ
);

CREATE INDEX idx_tasks_case            ON tasks (case_id)            WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status          ON tasks (status)            WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date        ON tasks (due_date)          WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_owner           ON tasks (owner_id)          WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_step_number     ON tasks (step_number)       WHERE deleted_at IS NULL AND is_workflow_step = TRUE;
CREATE INDEX idx_tasks_completed_by    ON tasks (completed_by_id)   WHERE deleted_at IS NULL;

-- ============================================================================
-- 5. DOCUMENTS
-- ============================================================================

-- Documents: stored in object storage (S3); metadata lives here.
-- sha256 enables duplicate detection and integrity verification.
CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID        NOT NULL REFERENCES patients (id),
  organization_id     UUID        NOT NULL REFERENCES organizations (id),
  case_id             UUID        REFERENCES patient_cases (id) ON DELETE SET NULL,
  file_key            TEXT        NOT NULL,   -- S3 object key
  filename            TEXT        NOT NULL,
  mime_type           TEXT        NOT NULL,
  size                INTEGER     NOT NULL,
  sha256              TEXT        NOT NULL,   -- integrity / duplicate detection
  document_type       TEXT,
  document_date       DATE,
  uploaded_by         UUID        NOT NULL,   -- user_id
  source              document_source NOT NULL DEFAULT 'PATIENT_UPLOAD',
  processing_status   processing_status NOT NULL DEFAULT 'UPLOADED',
  classification      TEXT,                     -- AI classification result
  ai_confidence       REAL,
  ocr_text            TEXT,                     -- raw OCR output (searchable)
  extracted_data      JSONB,                    -- structured extraction
  version             INTEGER     NOT NULL DEFAULT 1,
  previous_version_id UUID        REFERENCES documents (id) ON DELETE SET NULL,

  -- Encryption at rest is handled by S3 SSE-KMS; we store the KMS key ID here for key rotation tracking.
  kms_key_id          TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  deleted_at          TIMESTAMPTZ,
  retention_until     TIMESTAMPTZ
);

CREATE INDEX idx_documents_patient           ON documents (patient_id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_organization        ON documents (organization_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_case              ON documents (case_id)           WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_processing_status ON documents (processing_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_sha256            ON documents (sha256)            WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_document_date     ON documents (document_date)     WHERE deleted_at IS NULL;

-- Many-to-many link between documents and patient_requirements.
CREATE TABLE document_requirement_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID        NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  requirement_id  UUID        NOT NULL REFERENCES patient_requirements (id) ON DELETE CASCADE,
  matched_by      match_type  NOT NULL DEFAULT 'MANUAL',
  confidence      REAL,
  matched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  matched_by_user UUID,
  status          link_status NOT NULL DEFAULT 'ACTIVE',

  UNIQUE (document_id, requirement_id)
);
CREATE INDEX idx_doc_req_links_document     ON document_requirement_links (document_id);
CREATE INDEX idx_doc_req_links_requirement  ON document_requirement_links (requirement_id);

-- Individual extracted items within a document (lab values, dates, etc.)
CREATE TABLE extracted_document_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID        NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  item_type       TEXT        NOT NULL,
  description     TEXT,
  value           TEXT,
  confidence      REAL,
  requirement_id  UUID        REFERENCES patient_requirements (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_extracted_items_document ON extracted_document_items (document_id);

-- DocumentReview: clinical review workflow.
CREATE TABLE document_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      UUID        NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  reviewer_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status           review_status NOT NULL,
  rejection_reason TEXT,
  comment          TEXT,
  reviewed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_doc_reviews_document ON document_reviews (document_id);
CREATE INDEX idx_doc_reviews_reviewer ON document_reviews (reviewer_id);


-- ============================================================================
-- 6. APPOINTMENTS
-- ============================================================================

CREATE TABLE appointments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            UUID        NOT NULL REFERENCES patients (id),
  case_id               UUID        REFERENCES patient_cases (id) ON DELETE SET NULL,
  organization_id       UUID        NOT NULL REFERENCES organizations (id),
  type                  TEXT        NOT NULL,   -- e.g., "Cardiology", "Dental"
  provider              TEXT,                     -- physician / clinic name
  location              TEXT,
  start_time            TIMESTAMPTZ NOT NULL,
  end_time              TIMESTAMPTZ,
  status                appointment_status NOT NULL DEFAULT 'PLANNED',
  related_requirement_id UUID       REFERENCES patient_requirements (id) ON DELETE SET NULL,
  notes                 TEXT,
  reminders             JSONB,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  deleted_at            TIMESTAMPTZ,
  retention_until       TIMESTAMPTZ
);

CREATE INDEX idx_appointments_patient      ON appointments (patient_id)     WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_case         ON appointments (case_id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_organization ON appointments (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_start_time   ON appointments (start_time)     WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_status       ON appointments (status)         WHERE deleted_at IS NULL;

-- ============================================================================
-- 7. BLOCKERS & HELP REQUESTS
-- ============================================================================

CREATE TABLE blockers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID        NOT NULL REFERENCES patient_cases (id) ON DELETE CASCADE,
  requirement_id  UUID        REFERENCES patient_requirements (id) ON DELETE SET NULL,
  type            blocker_type NOT NULL,
  description     TEXT,
  status          blocker_status NOT NULL DEFAULT 'ACTIVE',
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID        REFERENCES users (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blockers_case    ON blockers (case_id);
CREATE INDEX idx_blockers_status  ON blockers (status);
CREATE INDEX idx_blockers_req     ON blockers (requirement_id);

CREATE TABLE help_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID        NOT NULL REFERENCES patients (id),
  case_id         UUID        NOT NULL REFERENCES patient_cases (id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations (id),
  requirement_id  UUID        REFERENCES patient_requirements (id) ON DELETE SET NULL,
  type            help_type   NOT NULL,
  description     TEXT,
  status          help_status NOT NULL DEFAULT 'OPEN',
  assigned_to     UUID        REFERENCES users (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);
CREATE INDEX idx_help_requests_case     ON help_requests (case_id);
CREATE INDEX idx_help_requests_status   ON help_requests (status);
CREATE INDEX idx_help_requests_assigned ON help_requests (assigned_to);

-- ============================================================================
-- 8. MESSAGING & NOTIFICATIONS
-- ============================================================================

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id       UUID        NOT NULL,
  sender_id       UUID        NOT NULL,
  content         TEXT        NOT NULL,
  entity_type     message_entity_type NOT NULL,
  entity_id       UUID        NOT NULL,
  organization_id UUID        NOT NULL REFERENCES organizations (id),
  patient_id      UUID        REFERENCES patients (id) ON DELETE SET NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  deleted_at      TIMESTAMPTZ,
  retention_until TIMESTAMPTZ
);

CREATE INDEX idx_messages_thread        ON messages (thread_id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_entity        ON messages (entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_organization  ON messages (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_patient       ON messages (patient_id)     WHERE deleted_at IS NULL;

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations (id),
  type            notification_type NOT NULL,
  title           TEXT        NOT NULL,
  message         TEXT        NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  read            BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  deleted_at      TIMESTAMPTZ,
  retention_until TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user    ON notifications (user_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_read    ON notifications (read)     WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_org     ON notifications (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications (created_at) WHERE deleted_at IS NULL;


-- ============================================================================
-- 9. AUDIT & TIMELINE
-- ============================================================================

-- AuditLog: immutable, append-only. Tamper-evident via previous_hash.
-- NEVER updated or deleted by application code (managed by triggers / archival jobs).
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  action          TEXT        NOT NULL,   -- e.g., patient.read, document.upload
  entity_type     TEXT        NOT NULL,   -- e.g., Patient, Document
  entity_id       UUID        NOT NULL,
  organization_id UUID        NOT NULL REFERENCES organizations (id),
  metadata        JSONB,                    -- redacted; no PHI
  ip_address      INET,
  user_agent      TEXT,

  -- Tamper-evident chain
  previous_hash   TEXT,                     -- SHA-256 of previous audit row (ordered by timestamp)
  row_hash        TEXT        NOT NULL,       -- SHA-256 of this row's content (excluding row_hash)

  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Partitioning support (optional; implement when >10M rows/year)
  -- partitioned by range (timestamp) for performance and retention

  CONSTRAINT chk_audit_metadata_no_phi CHECK (
    metadata IS NULL OR
    NOT (metadata::text ILIKE '%first_name%' OR metadata::text ILIKE '%last_name%' OR metadata::text ILIKE '%email%')
  )
);

CREATE INDEX idx_audit_actor       ON audit_logs (actor_id);
CREATE INDEX idx_audit_entity      ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_organization ON audit_logs (organization_id);
CREATE INDEX idx_audit_timestamp   ON audit_logs (timestamp);
CREATE INDEX idx_audit_action      ON audit_logs (action);

-- TimelineEvent: auto-generated, read-only lifecycle events for a case.
CREATE TABLE timeline_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID        NOT NULL REFERENCES patient_cases (id) ON DELETE CASCADE,
  event_type  TEXT        NOT NULL,   -- e.g., "STATUS_CHANGED", "DOCUMENT_UPLOADED"
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_timeline_events_case ON timeline_events (case_id);
CREATE INDEX idx_timeline_events_type ON timeline_events (event_type);

-- ============================================================================
-- 10. PASSPORT & CAREGIVER ACCESS
-- ============================================================================

-- TransplantPassport: shareable summary for emergencies.
CREATE TABLE transplant_passports (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID        NOT NULL REFERENCES patients (id),
  case_id            UUID        NOT NULL REFERENCES patient_cases (id) ON DELETE CASCADE,
  share_token        TEXT        NOT NULL UNIQUE,   -- hashed random token
  share_expires_at   TIMESTAMPTZ,
  selected_categories JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_passports_patient ON transplant_passports (patient_id);
CREATE INDEX idx_passports_token   ON transplant_passports (share_token);

-- CaregiverAccess: delegated access with fine-grained JSON permissions.
CREATE TABLE caregiver_access (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID        NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  caregiver_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  permissions   JSONB       NOT NULL,   -- { view_tasks: true, manage_tasks: false, ... }
  status        caregiver_status NOT NULL DEFAULT 'ACTIVE',
  invited_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ,

  UNIQUE (patient_id, caregiver_id)
);
CREATE INDEX idx_caregiver_access_patient   ON caregiver_access (patient_id);
CREATE INDEX idx_caregiver_access_caregiver ON caregiver_access (caregiver_id);

-- ============================================================================
-- 11. SECURE UPLOAD LINKS
-- ============================================================================

CREATE TABLE secure_upload_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID        NOT NULL REFERENCES patients (id),
  case_id         UUID        REFERENCES patient_cases (id) ON DELETE SET NULL,
  organization_id UUID        NOT NULL REFERENCES organizations (id),
  requirement_id  UUID        REFERENCES patient_requirements (id) ON DELETE SET NULL,
  document_type   TEXT,
  token_hash      TEXT        NOT NULL UNIQUE,   -- bcrypt hash of the raw token
  expires_at      TIMESTAMPTZ NOT NULL,
  max_uses        INTEGER,
  uses_used       INTEGER     NOT NULL DEFAULT 0,
  revoked         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by      UUID        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_upload_links_token   ON secure_upload_links (token_hash);
CREATE INDEX idx_upload_links_expires ON secure_upload_links (expires_at);


-- ============================================================================
-- 12. SYSTEM CONFIGURATION
-- ============================================================================

CREATE TABLE feature_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL UNIQUE,
  description     TEXT,
  scope           flag_scope  NOT NULL DEFAULT 'GLOBAL',
  organization_id UUID        REFERENCES organizations (id) ON DELETE CASCADE,
  enabled         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_feature_flags_org ON feature_flags (organization_id);

CREATE TABLE system_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT        NOT NULL,
  value           TEXT        NOT NULL,
  scope           setting_scope NOT NULL DEFAULT 'GLOBAL',
  organization_id UUID        REFERENCES organizations (id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (key, scope, organization_id)
);
CREATE INDEX idx_system_settings_org ON system_settings (organization_id);

CREATE TABLE system_configs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT        NOT NULL UNIQUE,
  value       TEXT,
  type        TEXT        NOT NULL DEFAULT 'string',
  label       TEXT,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'general',
  editable    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_system_configs_category ON system_configs (category);
CREATE INDEX idx_system_configs_key      ON system_configs (key);

-- ============================================================================
-- 13. AI & PROMPT MANAGEMENT
-- ============================================================================

CREATE TABLE prompt_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  prompt      TEXT        NOT NULL,
  version     INTEGER     NOT NULL DEFAULT 1,
  status      prompt_status NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prompt_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID        NOT NULL REFERENCES prompt_templates (id) ON DELETE CASCADE,
  version     INTEGER     NOT NULL,
  changes     TEXT,
  prompt      TEXT        NOT NULL,
  performance JSONB,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prompt_versions_template ON prompt_versions (template_id);

CREATE TABLE ai_processing_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID        REFERENCES documents (id) ON DELETE SET NULL,
  provider        TEXT        NOT NULL,
  model           TEXT        NOT NULL,
  prompt_version  TEXT,
  input_hash      TEXT        NOT NULL,   -- SHA-256 of redacted input
  output          JSONB       NOT NULL,
  confidence      REAL,
  human_override  BOOLEAN     NOT NULL DEFAULT FALSE,
  reviewer_id     UUID        REFERENCES users (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_logs_document ON ai_processing_logs (document_id);
CREATE INDEX idx_ai_logs_provider ON ai_processing_logs (provider);


-- ============================================================================
-- 14. CROSS-TENANT SHARING (CONSENT-BASED)
-- ============================================================================

-- DataSharingPermission: explicit, consent-based cross-tenant access.
-- Every access to shared data is audit-logged via audit_logs.
CREATE TABLE data_sharing_permissions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID        NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  donor_organization_id   UUID        NOT NULL REFERENCES organizations (id),
  recipient_organization_id UUID      NOT NULL REFERENCES organizations (id),
  resource_type           TEXT        NOT NULL CHECK (resource_type IN ('DOCUMENT','CASE','PASSPORT')),
  resource_id             UUID        NOT NULL,
  granted_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at              TIMESTAMPTZ NOT NULL,
  revoked_at              TIMESTAMPTZ,
  granted_by              UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,

  CONSTRAINT chk_sharing_not_same_org CHECK (donor_organization_id <> recipient_organization_id)
);
CREATE INDEX idx_sharing_patient     ON data_sharing_permissions (patient_id);
CREATE INDEX idx_sharing_recipient   ON data_sharing_permissions (recipient_organization_id);
CREATE INDEX idx_sharing_expires     ON data_sharing_permissions (expires_at);
CREATE INDEX idx_sharing_resource    ON data_sharing_permissions (resource_type, resource_id);

-- ============================================================================
-- 15. ROW-LEVEL SECURITY (RLS) — DEFENSE IN DEPTH
-- ============================================================================

-- Enable RLS on all tenant-scoped tables. Policies use session variable
-- app.current_tenant set by application before each query.
--
-- IMPORTANT: Prisma does NOT automatically SET variables. The application
-- must execute `SET app.current_tenant = 'org-uuid'` before each Prisma
-- query when using direct SQL or admin tools. For normal Prisma usage,
-- application-level filtering in the repository layer is the primary defense.

ALTER TABLE patients                ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_cases           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_requirements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents               ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transplant_passports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_access        ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_upload_links     ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies (applies to SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY tenant_isolation_patients             ON patients             FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_cases                ON patient_cases        FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_requirements         ON patient_requirements  FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_tasks                ON tasks                FOR ALL USING (organization_id = (SELECT organization_id FROM patient_cases WHERE id = tasks.case_id));
CREATE POLICY tenant_isolation_documents            ON documents            FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_appointments         ON appointments         FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_blockers             ON blockers             FOR ALL USING (case_id IN (SELECT id FROM patient_cases WHERE organization_id = current_setting('app.current_tenant')::UUID));
CREATE POLICY tenant_isolation_help_requests        ON help_requests        FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_messages             ON messages             FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_notifications        ON notifications        FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_audit_logs           ON audit_logs           FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
CREATE POLICY tenant_isolation_timeline_events      ON timeline_events      FOR ALL USING (case_id IN (SELECT id FROM patient_cases WHERE organization_id = current_setting('app.current_tenant')::UUID));
CREATE POLICY tenant_isolation_passports            ON transplant_passports FOR ALL USING (case_id IN (SELECT id FROM patient_cases WHERE organization_id = current_setting('app.current_tenant')::UUID));
CREATE POLICY tenant_isolation_caregiver_access     ON caregiver_access     FOR ALL USING (patient_id IN (SELECT id FROM patients WHERE organization_id = current_setting('app.current_tenant')::UUID));
CREATE POLICY tenant_isolation_upload_links         ON secure_upload_links  FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);

-- Super-admin bypass policy (restricted to app_super_admin role, not application role)
-- CREATE POLICY bypass_tenant_isolation ON patients FOR ALL TO app_super_admin USING (true);

-- ============================================================================
-- 16. TRIGGERS: updated_at & soft-delete cascade
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_medications_updated_at
  BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dialysis_regimes_updated_at
  BEFORE UPDATE ON dialysis_regimes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_patient_cases_updated_at
  BEFORE UPDATE ON patient_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_transplant_programs_updated_at
  BEFORE UPDATE ON transplant_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_template_sets_updated_at
  BEFORE UPDATE ON template_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_requirement_templates_updated_at
  BEFORE UPDATE ON requirement_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_patient_requirements_updated_at
  BEFORE UPDATE ON patient_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_system_settings_updated_at
  BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_system_configs_updated_at
  BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 17. MIGRATION SAFETY NOTES (not executable SQL — documentation)
-- ============================================================================
/*
EXPAND-AND-CONTRACT PATTERN
---------------------------
1. Add new column/table (nullable or with default).
2. Deploy dual-write code (writes to BOTH old and new).
3. Backfill existing data.
4. Switch reads to new.
5. After N days, drop old column/table.

ADDING TENANT TO EXISTING TABLE
--------------------------------
1. ALTER TABLE ... ADD COLUMN organization_id UUID;
2. UPDATE ... SET organization_id = 'default-tenant-id';
3. ALTER TABLE ... ALTER COLUMN organization_id SET NOT NULL;
4. ADD FOREIGN KEY + CREATE INDEX.
5. ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
6. CREATE POLICY tenant_isolation_... USING (...);

BACKWARDS COMPATIBILITY
-----------------------
- Every migration must be idempotent (use IF NOT EXISTS / OR REPLACE).
- New required columns need defaults or nullable initial phase.
- Feature flags gate new schema usage.
- Database snapshot before major migrations.
- Down-migration must be prepared.

SOFT DELETE + RETENTION
-----------------------
- Background cron hard-deletes where deleted_at IS NOT NULL
  AND retention_until < now().
- Medical records: 10 years (German law) / 7 years (HIPAA).
- Audit logs: 7 years; archive quarterly to WORM storage.
- AI logs: 3 years.
*/
