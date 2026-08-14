# NephroAssist Workflow Architecture

## 1. Core Workflow Philosophy

Workflows are **configuration-driven**, not hardcoded. The transplant center admin defines requirements, dependencies, and rules. The system generates concrete tasks and tracks their execution.

## 2. Requirement-to-Task Workflow

### Template Definition
```
RequirementTemplate: Dental Clearance
├── Category: Dentistry
├── Required: true
├── Listing Blocker: true
├── Validity: 12 months
├── Responsible Actor: PATIENT
├── Prerequisites: Prescription
├── Required Documents: Dental Specialist Report
├── Review Required: true
├── Renewal: automatic
├── Renewal Start: 60 days before expiration
└── Tasks (auto-generated):
    1. Request prescription from GP
    2. Upload prescription
    3. Schedule dentist appointment
    4. Attend dentist appointment
    5. Request dental report
    6. Upload dental report
    7. Wait for transplant center review
```

### Patient Assignment Flow
```
Admin publishes RequirementTemplate
        ↓
Template assigned to PatientCase
        ↓
PatientRequirement created
        ↓
Tasks generated from template
        ↓
Readiness Engine calculates:
  - Next actions
  - Blockers
  - Dependencies
        ↓
Patient sees prioritized task list
```

## 3. Document Processing Workflow

### Upload Pipeline
```
Patient uploads document
        ↓
Virus Scan Hook
        ↓
SHA-256 Hash calculated
        ↓
Duplicate detection
        ↓
Store in S3 (metadata in DB)
        ↓
Queue OCR Job
        ↓
Queue Classification Job
        ↓
Queue Extraction Job
        ↓
Queue Requirement Matching Job
        ↓
Document status: READY_FOR_REVIEW
        ↓
Coordinator receives review task
```

### Review Flow
```
Document in Review Queue
        ↓
Coordinator reviews
        ↓
Decision:
  ├── ACCEPTED
  │     ↓
  │   Requirement status updated
  │     ↓
  │   Readiness recalculated
  │     ↓
  │   Patient notified
  │     ↓
  │   Timeline updated
  │
  ├── REJECTED
  │     ↓
  │   Structured reason recorded
  │     ↓
  │   New patient task created
  │     ↓
  │   Patient notified
  │     ↓
  │   Blocker created
  │
  └── REQUEST_INFO
        ↓
      Message sent to patient
        ↓
      Task updated
```

## 4. Appointment Workflow

### Scheduling
```
Requirement needs appointment
        ↓
Task: Schedule appointment
        ↓
Patient/coordinator schedules
        ↓
Appointment created in FullCalendar
        ↓
Reminders queued
```

### Post-Appointment
```
Appointment completed
        ↓
System asks: Did the appointment happen?
        ↓
YES:
  ├── Do you have the report?
  │   ├── Upload report → Document workflow
  │   ├── Report will arrive later → Task: Wait for report
  │   └── Doctor sends directly → Task: Confirm receipt
NO:
  ├── Reschedule → New appointment task
  ├── Cancelled by provider → Task: Find new provider
  ├── Patient unavailable → Task: Reschedule
  └── Other → Task: Investigate
```

## 5. Referral Workflow

### Dialysis Center Referral
```
Dialysis Center identifies potential candidate
        ↓
Referral Case created
        ↓
Status: POTENTIAL_CANDIDATE
        ↓
Referral Preparation
        ↓
Referral Package assembled:
  ├── Patient data
  ├── Dialysis information
  ├── Recent lab documents
  ├── Nephrology report
  └── Referral letter
        ↓
Completeness calculated
        ↓
Status: REFERRAL_READY
        ↓
Referral sent
        ↓
Status: REFERRAL_SENT
        ↓
Transplant Center receives
        ↓
Status: CENTER_RECEIVED
        ↓
Evaluation started
        ↓
Status: EVALUATION_STARTED
```

## 6. Validity and Renewal Workflow

### Validity Tracking
```
Requirement completed
        ↓
Valid until: completionDate + validityDuration
        ↓
System monitors expiration
        ↓
60 days before expiration:
  ├── Status: EXPIRING_SOON
  ├── Renewal task created
  ├── Patient notified
  └── Coordinator notified
        ↓
Expiration date reached:
  ├── Status: EXPIRED
  ├── Blocker created
  └── Patient must redo requirement
```

### Renewal Flow
```
Renewal triggered
        ↓
New requirement instance created
        ↓
Old requirement: ARCHIVED (not deleted)
        ↓
Patient sees new task
        ↓
New document uploaded
        ↓
New review
        ↓
New validity period
```

## 7. Blocker Detection and Resolution

### Blocker Types
```
MISSING_PRESCRIPTION
NO_APPOINTMENT
MISSING_DOCUMENT
REJECTED_DOCUMENT
PATIENT_NEEDS_HELP
CLINIC_REVIEW_OVERDUE
EXTERNAL_PROVIDER_DELAY
EXPIRED_EXAMINATION
OTHER
```

### Blocker Lifecycle
```
Blocker detected
        ↓
Status: ACTIVE
        ↓
Assigned to responsible actor
        ↓
Actor resolves
        ↓
Status: RESOLVED
        ↓
Resolution audited
        ↓
Readiness recalculated
```

## 8. Help Request Workflow

### Patient Help Button
```
Patient clicks "I need help"
        ↓
Reason selected:
  ├── I don't understand the requirement
  ├── I can't get an appointment
  ├── I'm missing a prescription
  ├── My doctor won't issue the report
  ├── Transport problem
  ├── Language problem
  ├── Organizational problem
  └── Other
        ↓
HelpRequest created
        ↓
Coordinator receives in queue
        ↓
Coordinator responds
        ↓
Patient notified
        ↓
HelpRequest resolved
```

## 9. Transplant Board Workflow (Phase 2)

### Ready for Review
```
All requirements complete
        ↓
No blockers
        ↓
Status: READY_FOR_BOARD
        ↓
Board view shows:
  ├── Requirements: 31/31
  ├── Open blockers: 0
  ├── Documents: complete
  └── Reviews: complete
        ↓
Transplant Board reviews
        ↓
Decision:
  ├── APPROVED → Waitlisted
  ├── DEFERRED → Additional monitoring
  ├── ADDITIONAL_REQUIREMENTS → New requirements assigned
  └── OTHER → Documented
```

## 10. Stuck Patient Detection

### Detection Rules (configurable)
```
No activity > 30 days
Appointment missing > 21 days
Rejected document unresolved
Help request unanswered
Clinic review pending > SLA
```

### Action
```
Stuck patient detected
        ↓
Flagged in coordinator queue
        ↓
Coordinator receives alert
        ↓
Coordinator intervenes
        ↓
Resolution tracked
```

## 11. Next Best Action Engine

### Logic
```
Input: PatientCase state
        ↓
Readiness Engine evaluates:
  ├── What is incomplete?
  ├── What is blocked?
  ├── What can be done now?
  ├── Who is responsible?
  └── What is the deadline?
        ↓
Output: Prioritized next actions
```

### Example
```
Instead of: "Cardiology incomplete"
Show: "Request the required referral/prescription from your GP now."

Next: "Schedule a cardiology appointment."

Next: "Upload the specialist report after your appointment."
```

## 12. Critical Path Calculation

### Organizational Critical Path
```
Input:
  ├── Dependencies
  ├── Known appointment dates
  ├── Open tasks
  └── Expected organizational wait times
        ↓
Calculation:
  ├── Which tasks have no dependencies?
  ├── Which tasks are on the longest chain?
  └── Which tasks block the most downstream work?
        ↓
Output:
  "This task will likely most affect the organizational completion date."
```

## 13. Parallelization Detection

### Fast Track
```
Tasks that can run in parallel:
  ├── Cardiology appointment
  ├── Dentist prescription
  └── Dermatology appointment
        ↓
System shows:
  "These three organizational tasks can be started in parallel."
```

## 14. Notification Workflow

### Trigger Events
```
Task assigned
Task due soon
Task overdue
Document accepted
Document rejected
Appointment reminder
Requirement expires soon
Renewal started
Help request received
Blocker resolved
Ready for review
```

### Channels
```
IN_APP (primary)
EMAIL (secondary)
SMS (future)
PUSH (future)
```

### Notification Preferences
```
Patient can configure:
  ├── Email reminders: on/off
  ├── In-app reminders: on/off
  ├── Appointment reminders: on/off
  └── Renewal reminders: on/off
```

## 15. Audit Workflow

### Every Action Logged
```
Actor: userId
Action: DOCUMENT_ACCEPTED
Entity: Document
EntityId: doc_123
Organization: org_456
Timestamp: 2026-08-14T18:00:00Z
Metadata: { reviewId: rev_789 }
IP: 192.168.1.1
```

### Immutable Audit Log
- Append-only
- Tamper-evident (hash chain or similar)
- No modification by admin
- Retention: 7 years

## 16. Messaging Workflow

### Contextual Threads
```
Requirement: Cardiology
└── Thread
    ├── Message: "I don't understand this requirement"
    ├── Reply: "You need to visit a cardiologist..."
    └── Message: "Thank you, I scheduled an appointment"
```

### Thread Binding
```
Thread can be bound to:
  ├── Requirement
  ├── Document
  ├── PatientCase
  └── Appointment
```

## 17. External Upload Workflow

### Secure Upload Link
```
Coordinator requests document
        ↓
System generates secure link
        ↓
Link sent to patient/external provider
        ↓
Recipient uploads document
        ↓
Document matched to requirement
        ↓
Token invalidated (if single-use)
```

### Link Properties
```
Random token
Hashed storage
Single/multi-use configurable
Expiration (default: 7 days)
Revocable
Audit logged
```

## 18. State Machines

### Document State Machine
```
UPLOADED → PROCESSING → READY_FOR_REVIEW → UNDER_REVIEW → ACCEPTED
                                    ↓
                              REJECTED → (new task) → UPLOADED
                                    ↓
                              SUPERSEDED
                                    ↓
                              EXPIRED
```

### Requirement State Machine
```
NOT_STARTED → ACTION_REQUIRED → IN_PROGRESS → WAITING_FOR_DOCUMENT
                                                  ↓
                                            DOCUMENT_UPLOADED → UNDER_REVIEW → ACCEPTED
                                                                                ↓
                                                                          REJECTED → BLOCKED
                                                                                ↓
                                                                          EXPIRED → RENEWAL_REQUIRED
                                                                                ↓
                                                                          WAIVED
                                                                                ↓
                                                                          NOT_APPLICABLE
```

### Case State Machine
```
REFERRAL → INTAKE → EVALUATION → READY_FOR_REVIEW → UNDER_REVIEW
                                                      ↓
                                                DEFERRED → EVALUATION
                                                      ↓
                                                APPROVED → WAITLISTED
                                                              ↓
                                                        INACTIVE | TRANSPLANTED | CLOSED
```

## 19. Workflow Builder (Future)

### Visual Workflow Builder
```
Admin defines:
  Task A
    ↓
  Task B
    ↓
  Task C

With parallel branches:
        → Task B
  Task A
        → Task C
```

### MVP: Form-Based Builder
```
Admin defines task sequence via form
System generates dependency graph
Preview as patient/coordinator before publish
```

## 20. Event-Driven Architecture

### Domain Events Trigger Workflows
```
DocumentUploaded
  → Queue OCR
  → Queue classification
  → Queue extraction
  → Queue requirement matching

RequirementCompleted
  → Recalculate readiness
  → Check if case ready for review
  → Notify patient
  → Update timeline

AppointmentCompleted
  → Ask patient about report
  → Update requirement status
  → Schedule follow-up if needed

HelpRequested
  → Add to coordinator queue
  → Send notification
  → Track response time
```
