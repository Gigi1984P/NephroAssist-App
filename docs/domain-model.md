# NephroAssist Domain Model

## 1. Core Entities

### Patient
```
id: UUID
firstName: string
lastName: string
dateOfBirth: date
email: string
phone: string
language: string
timezone: string
consentStatus: CONSENT_GRANTED | CONSENT_REVOKED | CONSENT_PENDING
createdAt: datetime
updatedAt: datetime
createdBy: UUID (User)
```

### PatientCase (separate from Patient - a patient can have multiple cases)
```
id: UUID
patientId: UUID (Patient)
organizationId: UUID (Organization - Transplant Center)
programId: UUID (TransplantProgram)
coordinatorId: UUID (User, optional)
status: CaseStatus
referralDate: date
intakeDate: date
readyForReviewDate: date
boardDecisionDate: date
waitlistedDate: date
closedDate: date
closureReason: string
notes: string
createdAt: datetime
updatedAt: datetime
createdBy: UUID
```

### CaseStatus State Machine
```
REFERRAL
  ↓
INTAKE
  ↓
EVALUATION
  ↓
READY_FOR_REVIEW
  ↓
UNDER_REVIEW
  ↓
DEFERRED | APPROVED
  ↓ (APPROVED)
WAITLISTED
  ↓
INACTIVE | TRANSPLANTED | CLOSED
```

### Organization
```
id: UUID
name: string
slug: string
type: TRANSPLANT_CENTER | DIALYSIS_CENTER | NEPHROLOGY | OTHER_PROVIDER
logo: string (URL)
timezone: string
language: string
contactInfo: JSON
settings: JSON
createdAt: datetime
updatedAt: datetime
```

### OrganizationMembership
```
id: UUID
userId: UUID
organizationId: UUID
roleId: UUID
joinedAt: datetime
status: ACTIVE | INACTIVE | PENDING
```

### Role
```
id: UUID
name: string
organizationId: UUID (optional - global or org-specific)
permissions: Permission[]
createdAt: datetime
```

### Permission
```
id: UUID
code: string (e.g., patient.read, document.review)
description: string
resource: string
action: string
createdAt: datetime
```

### TransplantProgram
```
id: UUID
organizationId: UUID
name: string
slug: string
description: string
type: KIDNEY | LIVER | HEART | LUNG | OTHER
status: ACTIVE | INACTIVE | DRAFT
createdAt: datetime
updatedAt: datetime
```

### RequirementTemplate
```
id: UUID
programId: UUID
name: string
category: string
description: string
patientFriendlyDescription: string
required: boolean
listingBlocker: boolean
conditional: boolean
validityDuration: number (months)
renewalLeadTime: number (days)
responsibleRole: PATIENT | CAREGIVER | DIALYSIS_CENTER | TRANSPLANT_CENTER | EXTERNAL_PROVIDER | SYSTEM
reviewRequired: boolean
instructions: string
priority: number
version: number
status: DRAFT | PUBLISHED | ARCHIVED
createdAt: datetime
updatedAt: datetime
```

### RequirementTemplateVersion
```
id: UUID
templateId: UUID
version: number
changes: string
publishedAt: datetime
publishedBy: UUID
applyTo: NEW_ONLY | SELECTED | ALL_ELIGIBLE
```

### PatientRequirement (instance of a template assigned to a case)
```
id: UUID
caseId: UUID
templateId: UUID
organizationId: UUID
programId: UUID
title: string
description: string
category: string
required: boolean
listingBlocker: boolean
conditional: boolean
validityDuration: number
renewalLeadTime: number
responsibleRole: string
reviewRequired: boolean
status: RequirementStatus
priority: number
instructions: string
patientFriendlyDescription: string
dueDate: date
completedAt: datetime
expiresAt: datetime
renewalStartedAt: datetime
createdAt: datetime
updatedAt: datetime
```

### RequirementStatus State Machine
```
NOT_STARTED
  ↓
ACTION_REQUIRED
  ↓
IN_PROGRESS
  ↓
WAITING_FOR_APPOINTMENT | WAITING_FOR_DOCUMENT | DOCUMENT_UPLOADED
  ↓
UNDER_REVIEW
  ↓
ACCEPTED | REJECTED | BLOCKED | EXPIRED | RENEWAL_REQUIRED | WAIVED | NOT_APPLICABLE
```

### RequirementDependency
```
id: UUID
requirementId: UUID (the one that depends)
prerequisiteId: UUID (the one that must be completed first)
createdAt: datetime
```

### Task (concrete task generated from a requirement)
```
id: UUID
requirementId: UUID
caseId: UUID
patientId: UUID
title: string
description: string
ownerType: PATIENT | CAREGIVER | DIALYSIS_CENTER | TRANSPLANT_CENTER | EXTERNAL_PROVIDER | SYSTEM
ownerId: UUID (User or Patient, depending on ownerType)
status: TaskStatus
dueDate: date
completedAt: datetime
reminders: JSON
dependencyOf: UUID (another task)
createdAt: datetime
updatedAt: datetime
```

### TaskStatus
```
PENDING
IN_PROGRESS
COMPLETED
CANCELLED
OVERDUE
```

### Document
```
id: UUID
patientId: UUID
organizationId: UUID
caseId: UUID
fileKey: string
filename: string
mimeType: string
size: number
sha256: string
documentType: string
documentDate: date
uploadedBy: UUID
source: PATIENT_UPLOAD | CAREGIVER_UPLOAD | DIALYSIS_UPLOAD | CENTER_UPLOAD | EXTERNAL_PROVIDER_UPLOAD | INTEGRATION
processingStatus: UPLOADED | SCANNING | PROCESSING | READY_FOR_REVIEW | UNDER_REVIEW | ACCEPTED | REJECTED | SUPERSEDED | EXPIRED
classification: string (AI result)
aiConfidence: number
ocrText: string (raw)
extractedData: JSON
version: number
previousVersionId: UUID
createdAt: datetime
updatedAt: datetime
```

### DocumentRequirementLink (many-to-many)
```
id: UUID
documentId: UUID
requirementId: UUID
matchedBy: AI | MANUAL
confidence: number
matchedAt: datetime
matchedByUser: UUID (if manual)
status: ACTIVE | REMOVED
```

### ExtractedDocumentItem (individual items within a document)
```
id: UUID
documentId: UUID
itemType: string
description: string
value: string
confidence: number
requirementId: UUID (linked requirement, optional)
createdAt: datetime
```

### DocumentReview
```
id: UUID
documentId: UUID
reviewerId: UUID
status: ACCEPTED | REJECTED | REQUEST_INFO
rejectionReason: string
comment: string
reviewedAt: datetime
```

### Appointment
```
id: UUID
patientId: UUID
caseId: UUID
type: string
provider: string
location: string
startTime: datetime
endTime: datetime
status: PLANNED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW | RESCHEDULE_REQUIRED
relatedRequirementId: UUID
notes: string
reminders: JSON
createdAt: datetime
updatedAt: datetime
```

### Blocker (first-class entity)
```
id: UUID
caseId: UUID
requirementId: UUID
type: MISSING_PRESCRIPTION | NO_APPOINTMENT | MISSING_DOCUMENT | REJECTED_DOCUMENT | PATIENT_NEEDS_HELP | CLINIC_REVIEW_OVERDUE | EXTERNAL_PROVIDER_DELAY | EXPIRED_EXAMINATION | OTHER
description: string
status: ACTIVE | RESOLVED
resolvedAt: datetime
resolvedBy: UUID
createdAt: datetime
```

### HelpRequest
```
id: UUID
patientId: UUID
caseId: UUID
requirementId: UUID (optional)
type: I_DONT_UNDERSTAND | NO_APPOINTMENT | MISSING_PRESCRIPTION | DOCTOR_WONT_ISSUE | TRANSPORT | LANGUAGE | ORGANIZATIONAL | OTHER
description: string
status: OPEN | IN_PROGRESS | RESOLVED
assignedTo: UUID
createdAt: datetime
resolvedAt: datetime
```

### Notification
```
id: UUID
userId: UUID
type: TASK | APPOINTMENT | DOCUMENT | REVIEW | MESSAGE | RENEWAL | HELP_REQUEST | SYSTEM
title: string
message: string
entityType: string
entityId: UUID
read: boolean
readAt: datetime
createdAt: datetime
```

### AuditLog (immutable)
```
id: UUID
actorId: UUID
action: string
entityType: string
entityId: UUID
organizationId: UUID
metadata: JSON
ipAddress: string
timestamp: datetime
```

### TransplantPassport
```
id: UUID
patientId: UUID
caseId: UUID
shareToken: string (hashed)
shareExpiresAt: datetime
selectedCategories: string[]
createdAt: datetime
```

### CaregiverAccess
```
id: UUID
patientId: UUID
caregiverId: UUID
permissions: JSON (view_tasks, manage_tasks, view_calendar, manage_appointments, upload_documents, receive_reminders, send_messages, view_medical_documents)
status: ACTIVE | REVOKED
invitedAt: datetime
revokedAt: datetime
```

### SecureUploadLink
```
id: UUID
patientId: UUID
caseId: UUID
requirementId: UUID
documentType: string
tokenHash: string
expiresAt: datetime
maxUses: number
usesUsed: number
revoked: boolean
createdBy: UUID
createdAt: datetime
```

### Message (contextual messaging)
```
id: UUID
threadId: UUID
senderId: UUID
content: string
entityType: REQUIREMENT | DOCUMENT | CASE | APPOINTMENT
entityId: UUID
createdAt: datetime
```

### TimelineEvent (auto-generated)
```
id: UUID
caseId: UUID
eventType: string
description: string
metadata: JSON
createdAt: datetime
```

### FeatureFlag
```
id: UUID
name: string
description: string
scope: GLOBAL | ORGANIZATION
organizationId: UUID (if scope=ORGANIZATION)
enabled: boolean
createdAt: datetime
```

### SystemSetting
```
id: UUID
key: string
value: string
scope: GLOBAL | ORGANIZATION
organizationId: UUID (if scope=ORGANIZATION)
createdAt: datetime
updatedAt: datetime
```

## 2. Entity Relationships

```
Patient
├── PatientCase[]
│   ├── Organization (Transplant Center)
│   ├── TransplantProgram
│   ├── User (Coordinator)
│   ├── PatientRequirement[]
│   │   ├── RequirementTemplate
│   │   ├── Task[]
│   │   ├── Blocker[]
│   │   ├── Appointment[]
│   │   ├── DocumentRequirementLink[]
│   │   │   └── Document
│   │   └── HelpRequest[]
│   ├── Document[]
│   ├── Appointment[]
│   ├── TimelineEvent[]
│   └── TransplantPassport[]
├── CaregiverAccess[]
└── Notification[]

Organization
├── OrganizationMembership[]
│   └── User
│       └── Role
│           └── Permission[]
├── TransplantProgram[]
│   └── RequirementTemplate[]
│       └── RequirementTemplateVersion[]
└── SystemSetting[]

Document
├── DocumentReview[]
├── ExtractedDocumentItem[]
└── DocumentRequirementLink[]

Message
└── Thread (entity-bound)
```

## 3. Domain Events

```
DocumentUploaded
DocumentProcessed
DocumentAccepted
DocumentRejected
RequirementCreated
RequirementCompleted
RequirementExpired
RequirementRenewalStarted
AppointmentCompleted
HelpRequested
PatientReadyForReview
RenewalRequired
BlockerCreated
BlockerResolved
TaskCompleted
TaskOverdue
PatientInvited
CaregiverInvited
ExternalUploadLinkCreated
DocumentShared
AIResultOverridden
```

## 4. Readiness Engine Input/Output

### Input
```
Patient
+ TransplantProgram
+ Requirements[]
+ RequirementDependencies[]
+ Tasks[]
+ Documents[]
+ DocumentReviews[]
+ Appointments[]
+ Deadlines[]
+ ValidityRules[]
+ Renewals[]
+ Blockers[]
+ ResponsibleActors[]
+ ClinicalReviews[]
```

### Output
```
CurrentState
NextActions[]
CompletionPercentage
BlockingRequirements[]
ResponsibleActor
ExpiringRequirements[]
Renewals[]
ReadyForReviewState
```

## 5. Transplant Journey Lifecycle

```
Potential Candidate
        ↓
Referral
        ↓
Referral Preparation
        ↓
Transplant Center Intake
        ↓
Evaluation Started
        ↓
Requirements Assigned
        ↓
Investigations / Appointments / Documents
        ↓
Requirements Complete
        ↓
Ready for Review
        ↓
Clinical Review / Transplant Board
        ↓
Listing Decision
        ↓
Waitlisted
        ↓
Waitlist Maintenance
        ↓
Renewals / Re-Evaluations
        ↓
Transplant
```

## 6. Four Product Layers

### Layer 1 – Patient Execution Layer
- What must I do next?
- Tasks, Requirements, Documents, Appointments, Calendar, Reminders, Help, Progress, Next Actions, Transplant Passport

### Layer 2 – Dialysis Coordination Layer
- Which patient needs help today?
- Transplant candidates, Referrals, Open tasks, Patient blockers, Investigations, Blood draws, Documents, Help requests, Waitlist maintenance, Renewals

### Layer 3 – Transplant Center Workflow Layer
- Which cases need clinic action?
- Patient management, Requirement management, Document review, Review queue, Coordinator queue, Ready for review, Transplant board, Listing decisions, Renewal management

### Layer 4 – Process Intelligence Layer
- Where do delays occur?
- Funnel, Throughput times, Blockers, Wait times, Document rejections, Coordinator workload, Requirement completion times, Stuck patients, Process bottlenecks

## 7. Configuration-First Design

Medical workflows are NOT hardcoded. The admin/transplant center can define:

```
Requirement: Dental Clearance
Category: Dentistry
Required: true
Listing Blocker: true
Validity: 12 months
Responsible Actor: PATIENT
Prerequisites: Prescription
Required Documents: Dental Specialist Report
Review Required: true
Renewal: automatic
Renewal Start: 60 days before expiration
```

## 8. Versioned Templates

```
RequirementTemplate
└── RequirementTemplateVersion

Kidney Evaluation v1
Kidney Evaluation v2
Kidney Evaluation v3
```

On publish of new version:
- Apply to: new patients only / selected active patients / all eligible active patients
- Preview before mass changes

## 9. Multi-Center Support

A patient can have multiple cases:
```
Center A → Kidney Evaluation
Center B → Kidney Evaluation
```

Existing documents can be reused with consent. Each center decides independently on acceptance.

## 10. Document Versioning

Documents are NOT blindly overwritten:
```
Cardiology Report 2025 → EXPIRED
Cardiology Report 2026 → CURRENT
Cardiology Report 2027 → PLANNED
```

## 11. Patient Transplant Passport

```
Cardiology ✓ valid until 04/2027
Dentistry ✓ valid until 11/2026
Dermatology ⚠ expires in 42 days
Hepatitis Screening ✓
PSA pending
```

## 12. Soft Delete / Retention

NOT everywhere simple `deletedAt`. Define:
- What may be deleted
- What is archived
- What must be retained for audit reasons

Admin may NOT silently modify audit history.
