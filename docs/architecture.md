# NephroAssist System Architecture

## 1. Overview

NephroAssist is a multi-tenant SaaS platform for the organizational coordination of the entire organ transplant process. It is NOT primarily a document repository; it is a **configurable Workflow- and Readiness-Engine** that translates complex transplant center requirements into concrete, traceable tasks for patients, dialysis centers, specialists, and transplant coordinators.

## 2. Core Principle

> **The actual product is NOT the document storage.**
> **The actual product is a configurable Workflow- and Readiness-Engine that translates complex transplant center requirements into concrete, traceable tasks for Patient, Dialysis Center, Specialist, and Transplant Center.**
> Document management supports this engine.

## 3. Architecture Style

- **Modular Monolith** (initially) with clean service boundaries
- **Domain-Driven Design** (DDD) patterns for core entities
- **Multi-Tenancy** with strict tenant isolation
- **Event-Driven** internal architecture via domain events
- **CQRS-like separation** for read-heavy dashboards

## 4. High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Patient UI   │  │ Coordinator  │  │ Dialysis     │  │ Admin UI     │   │
│  │ (Mobile-first) │  │ Dashboard    │  │ Dashboard    │  │ (Config)     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└───────┬─────────────────┬─────────────────┬─────────────────┬───────────────┘
        │                 │                 │                 │
        └─────────────────┴─────────────────┴─────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Next.js App      │
                    │   (App Router)       │
                    │   Server Components  │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼──────┐    ┌─────────▼──────────┐  ┌──────▼───────┐
│  API Routes  │    │  Server Actions    │  │  TRPC/API    │
│  (REST)      │    │  (Internal)        │  │  (Future)    │
└───────┬──────┘    └─────────┬──────────┘  └──────────────┘
        │                     │
        └─────────────────────┘
                  │
    ┌─────────────▼──────────────┐
    │      SERVICE LAYER         │
    │  ┌────────────────────┐  │
    │  │  Domain Services     │  │
    │  │  - ReadinessEngine   │  │
    │  │  - TaskEngine        │  │
    │  │  - RequirementEngine │  │
    │  │  - BlockerEngine     │  │
    │  │  - ValidityEngine    │  │
    │  │  - RenewalEngine     │  │
    │  └────────────────────┘  │
    │  ┌────────────────────┐  │
    │  │  Application Svcs    │  │
    │  │  - DocumentService   │  │
    │  │  - AppointmentSvc    │  │
    │  │  - NotificationSvc   │  │
    │  │  - AuditService      │  │
    │  │  - MessagingService  │  │
    │  └────────────────────┘  │
    │  ┌────────────────────┐  │
    │  │  AI Services         │  │
    │  │  - DocumentPipeline  │  │
    │  │  - LLMGateway        │  │
    │  │  - OCRProvider       │  │
    │  └────────────────────┘  │
    └─────────────┬────────────┘
                  │
    ┌─────────────▼──────────────┐
    │      DATA LAYER            │
    │  ┌────────────────────┐    │
    │  │  PostgreSQL (Prisma)│   │
    │  │  - Tenant Isolation │   │
    │  │  - Audit Trail      │   │
    │  │  - Soft Delete      │   │
    │  └────────────────────┘    │
    │  ┌────────────────────┐    │
    │  │  Redis              │    │
    │  │  - Job Queue        │    │
    │  │  - Sessions/Cache   │    │
    │  └────────────────────┘    │
    │  ┌────────────────────┐    │
    │  │  S3-Compatible      │    │
    │  │  Object Storage     │    │
    │  │  - EU-hosted        │    │
    │  └────────────────────┘    │
    └────────────────────────────┘
```

## 5. Technology Stack

### Frontend
- **Next.js** (App Router, Server Components preferred)
- **React** + **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui**
- **FullCalendar** for appointments

### Backend
- **Next.js Server** (initial)
- **TypeScript** strict
- **Prisma** ORM
- Clean separation: `/domain`, `/services`, `/repositories`, `/workflows`, `/policies`, `/permissions`, `/jobs`, `/ai`, `/notifications`, `/audit`

### Database
- **PostgreSQL** (EU-hosted)
- **Prisma** migrations
- UUIDs, FKs, constraints, indexes, createdAt/updatedAt/createdBy, versioning, soft delete where appropriate

### Queue / Background Jobs
- **Redis** for:
  - Background Jobs, Reminders, Email Jobs, OCR Jobs, AI Document Processing, Document Classification, Renewal Generation, Scheduled Notifications, Expiration Checks, Analytics Jobs, External Upload Processing

### File Storage
- **S3-compatible Object Storage** (EU-hosted)
- Presigned uploads/downloads, authorization checks, file size limits, MIME validation, malware scanning hook, checksums, duplicate detection, audit logging

### Auth
- **Keycloak** or Managed OIDC Provider
- OIDC standard, MFA-ready, RBAC, granular permissions
- NOT tightly coupled to a specific provider

### Email
- Abstracted **EmailProvider** interface
- AWS SES, Postmark, or EU equivalent

### Observability
- **Sentry** (error tracking)
- **OpenTelemetry** (structured logging, distributed tracing, performance monitoring)
- PII/PHI scrubbing mandatory

### Infrastructure
- **Docker** + Docker Compose for local dev
- Container-ready for production
- Secrets via environment/secret management only

## 6. Multi-Tenancy Architecture

### Tenant Isolation Strategy

**Row-Level Security (RLS) + Application-Level Filtering**

Every relevant record carries `organizationId`. The application layer enforces tenant isolation on every query. PostgreSQL RLS policies are prepared as a defense-in-depth layer.

### Organization Types

```
TRANSPLANT_CENTER
DIALYSIS_CENTER
NEPHROLOGY
OTHER_PROVIDER
```

### Core Tenant Entities

```
Organization
OrganizationMembership
Role
Permission
```

A user can belong to multiple organizations. Cross-tenant sharing only via explicit relationships/permissions.

## 7. Key Architectural Boundaries

### Domain Core (Pure TypeScript)
- Readiness Engine
- Requirement State Machine
- Task Engine
- Validity/Renewal Engine
- Blocker Detection
- Dependency Graph

**NO external dependencies** (no DB, no HTTP, no file system).

### Application Services (Orchestration)
- Use domain core
- Coordinate repositories, notifications, audit
- Handle transactions

### Infrastructure (Adapters)
- Prisma repositories
- S3 storage
- Redis queue
- Email providers
- LLM/OCR providers
- OIDC auth

## 8. Future-Proofing Boundaries

### NestJS Extraction
- Backend services designed to be extractable from Next.js
- Domain logic in pure TypeScript modules
- API routes as thin adapters

### FHIR Integration
- Internal boundary at `/integrations/fhir`
- FHIR mappings NOT mixed with core domain
- Prepare for: Patient, Observation, DiagnosticReport, DocumentReference, Appointment, ServiceRequest, Practitioner, Organization

### React Native / Expo
- Domain APIs not bound to Next.js Server Components
- Same APIs for mobile app

## 9. Data Flow: First Vertical Slice

```
Admin creates Requirement Template
        ↓
Publishes Template
        ↓
Patient Case gets Requirement assigned
        ↓
Readiness Engine calculates next actions
        ↓
Patient sees task on dashboard
        ↓
Patient uploads document
        ↓
Document stored in S3, metadata in DB
        ↓
OCR/AI processing job queued
        ↓
Document appears in Coordinator Review Queue
        ↓
Coordinator reviews + accepts
        ↓
Requirement status → ACCEPTED
        ↓
Readiness recalculated
        ↓
Timeline updated, patient notified
```

## 10. Critical Path & Performance

- Avoid N+1 queries via Prisma include/select patterns
- Pagination on all list endpoints
- Server-side filtering
- Indexing strategy for: organizationId, patientId, caseId, requirementStatus, assignedCoordinator, dueDate, expiresAt, reviewStatus, createdAt
- No unsafe caching of patient documents

## 11. Security Boundaries

- Authentication (OIDC) strictly separated from Authorization (RBAC)
- Every sensitive data request has server-side authorization
- Frontend hiding alone is NOT access control
- Secrets only via environment/secret management
- No secrets in repository
- Signed URLs for file access
- Rate limiting, input validation, file validation
- Session expiration, least privilege

## 12. ADRs (Architecture Decision Records)

| ADR | Topic | Decision |
|-----|-------|----------|
| ADR-001 | Multi-tenancy | Row-level isolation with application enforcement |
| ADR-002 | Document storage | S3-compatible object storage, metadata in PostgreSQL |
| ADR-003 | Authorization | RBAC with granular permissions, separate from auth |
| ADR-004 | Requirement engine | State machine with dependency graph |
| ADR-005 | AI abstraction | LLMGateway with provider abstraction, no direct frontend calls |
| ADR-006 | Queue architecture | Redis for job queue, background processing |

## 13. Folder Structure

```
/src
  /app                    # Next.js App Router
    /(patient)            # Patient routes
    /(center)            # Transplant center routes
    /(dialysis)          # Dialysis center routes
    /(admin)             # Admin routes
    /api                 # API routes
  /domain                # Pure domain logic (no deps)
    /readiness
    /requirements
    /tasks
    /blockers
    /validity
    /renewals
    /patients
    /cases
    /documents
    /appointments
    /notifications
    /events
  /services              # Application services
    /document-processing
    /notification
    /audit
    /messaging
    /ai
  /repositories          # Prisma/data access
  /workflows             # Workflow definitions
  /policies              # Authorization policies
  /permissions           # RBAC definitions
  /jobs                  # Background job handlers
  /ai                    # AI abstraction layer
    /llm-gateway
    /ocr-provider
    /document-classifier
    /extractor
    /requirement-matcher
  /notifications         # Email/push/SMS
  /audit                 # Audit logging
  /integrations          # External integrations
    /fhir                # FHIR boundary (future)
  /lib                   # Shared utilities
  /types                 # Global types
/prisma
  schema.prisma
  migrations/
/docs
  architecture.md
  domain-model.md
  security.md
  permissions.md
  workflows.md
  ai-architecture.md
/docker
  docker-compose.yml
  Dockerfile
```

## 14. Definition of Done (per feature)

- UI works
- Backend works
- Authorization implemented
- Tenant isolation verified
- Validation present
- Error handling present
- Audit events present where required
- Tests present
- Loading state present
- Empty state present
- Mobile display checked
- Documentation updated

## 15. North Star

> Does this feature reduce organizational friction on the path through the transplant process?
> Does it help the right actor recognize the right next action at the right time?

If no, prioritize lower.
