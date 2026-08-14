# NephroAssist State Machines, Domain Events & Queue Architecture

## 1. State Machines

### 1.1 Document State Machine

```
                    ┌─────────────┐
                    │   UPLOADED  │
                    └──────┬──────┘
                           │
                    virus scan / hash
                           │
                    ┌──────▼──────┐
                    │  SCANNING   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PROCESSING │◄──────┐
                    └──────┬──────┘       │
                           │              │ retry
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
      ┌───────────┐ ┌──────────┐ ┌──────────┐
      │OCR queued │ │AI queued │ │manual    │
      └─────┬─────┘ └────┬─────┘ └────┬─────┘
            │            │            │
            ▼            ▼            ▼
      ┌───────────┐ ┌──────────┐ ┌──────────┐
      │READY_FOR  │ │AI_FAILED │ │UNDER_    │
      │_REVIEW    │ │→ MANUAL  │ │REVIEW    │
      └─────┬─────┘ │  REVIEW  │ └────┬─────┘
            │       └──────────┘      │
            │                         │
            ▼                         ▼
      ┌───────────┐           ┌──────────┐
      │ coordinator│           │ reviewer │
      │  reviews   │           │ reviews  │
      └─────┬─────┘           └────┬─────┘
            │                      │
      ┌─────┴─────┐          ┌─────┴─────┐
      ▼           ▼          ▼           ▼
┌─────────┐ ┌─────────┐ ┌────────┐ ┌────────┐
│ACCEPTED │ │REJECTED │ │ACCEPTED│ │REJECTED│
└────┬────┘ └────┬────┘ └───┬────┘ └───┬────┘
     │           │          │          │
     ▼           ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌────────┐ ┌────────┐
│requirement│ │new task │ │requirement│ │new task│
│updated  │ │created  │ │updated  │ │created │
└─────────┘ └─────────┘ └────────┘ └────────┘

Additional states:
- SUPERSEDED (replaced by newer version)
- EXPIRED (validity period ended)
```

### 1.2 Requirement State Machine

```
┌─────────────┐
│ NOT_STARTED │
└──────┬──────┘
       │
       ▼
┌───────────────┐     ┌─────────────────┐
│ ACTION_REQUIRED│────►│  IN_PROGRESS    │
└───────────────┘      └────────┬────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│WAITING_FOR        │ │  DOCUMENT_      │ │WAITING_FOR      │
│_APPOINTMENT       │ │  UPLOADED       │ │_DOCUMENT        │
└─────────┬─────────┘ └────────┬────────┘ └────────┬────────┘
          │                    │                   │
          │                    ▼                   │
          │           ┌─────────────────┐          │
          │           │  UNDER_REVIEW   │◄─────────┘
          │           └────────┬────────┘
          │                    │
          │         ┌─────────┴─────────┐
          │         ▼                   ▼
          │  ┌──────────┐       ┌──────────┐
          │  │ ACCEPTED │       │ REJECTED │
          │  └────┬─────┘       └────┬─────┘
          │       │                  │
          │       ▼                  ▼
          │  ┌──────────┐       ┌──────────┐
          │  │COMPLETE  │       │ BLOCKED  │
          │  └──────────┘       └────┬─────┘
          │                          │
          │                          ▼
          │                   ┌──────────┐
          │                   │ new task │
          │                   │ created  │
          │                   └────┬─────┘
          │                        │
          └────────────────────────┘
                    (retry)

Terminal states:
- ACCEPTED → COMPLETE
- WAIVED (admin decision)
- NOT_APPLICABLE (admin decision)
- EXPIRED → RENEWAL_REQUIRED
```

### 1.3 Case State Machine

```
┌──────────┐
│ REFERRAL │
└────┬─────┘
     │
     ▼
┌──────────┐
│  INTAKE  │
└────┬─────┘
     │
     ▼
┌────────────┐
│ EVALUATION │
└────┬───────┘
     │
     │ (all requirements complete)
     ▼
┌──────────────────┐
│ READY_FOR_REVIEW │
└────┬─────────────┘
     │
     ▼
┌──────────────┐
│ UNDER_REVIEW │
└────┬─────────┘
     │
     ├─────────────┬─────────────┐
     ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌─────────────────────┐
│DEFERRED │  │ APPROVED │  │ADDITIONAL_REQUIREMENTS│
└────┬────┘  └────┬─────┘  └──────────┬──────────┘
     │            │                    │
     ▼            ▼                    ▼
┌─────────┐  ┌──────────┐      ┌──────────────┐
│EVALUATION│  │WAITLISTED│      │  EVALUATION  │
└─────────┘  └────┬─────┘      └──────────────┘
                  │
                  ▼
     ┌────────────┼────────────┐
     ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌────────┐
│ INACTIVE │ │TRANSPLANTED│ │CLOSED │
└─────────┘ └──────────┘ └────────┘
```

### 1.4 Task State Machine

```
┌─────────┐
│ PENDING │
└────┬────┘
     │
     ▼
┌─────────────┐
│ IN_PROGRESS │
└──────┬──────┘
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│COMPLETED │ │CANCELLED│ │ OVERDUE  │
└──────────┘ └────────┘ └────┬─────┘
                             │
                             ▼
                        ┌──────────┐
                        │ RESUMED  │
                        │ (back to │
                        │IN_PROGRESS│
                        └──────────┘
```

### 1.5 Appointment State Machine

```
┌─────────┐
│ PLANNED │
└────┬────┘
     │
     ▼
┌───────────┐
│ CONFIRMED │
└─────┬─────┘
      │
      ├──────────┬──────────┬──────────┐
      ▼          ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────────────┐
│COMPLETED │ │CANCELLED│ │ NO_SHOW │ │RESCHEDULE_REQUIRED│
└────┬─────┘ └────────┘ └────────┘ └────────┬───────────┘
     │                                     │
     │ (post-appointment workflow)         ▼
     │                              ┌──────────┐
     │                              │ REPLANNED│
     │                              └──────────┘
     ▼
┌─────────────────────┐
│ Ask about report    │
│ - Upload report     │
│ - Report arrives later│
│ - Doctor sends directly│
└─────────────────────┘
```

## 2. Domain Events

### 2.1 Event Catalog

| Event | Trigger | Consumers |
|-------|---------|-----------|
| DocumentUploaded | Document stored in S3 | OCRJob, NotificationService, AuditService |
| DocumentProcessed | OCR/AI processing complete | DocumentReviewQueue, NotificationService |
| DocumentAccepted | Coordinator accepts document | ReadinessEngine, TimelineService, NotificationService |
| DocumentRejected | Coordinator rejects document | TaskEngine, BlockerEngine, NotificationService |
| RequirementCreated | Template assigned to case | TaskEngine, ReadinessEngine |
| RequirementCompleted | Requirement marked complete | ReadinessEngine, TimelineService |
| RequirementExpired | Validity period ended | RenewalEngine, BlockerEngine, NotificationService |
| RequirementRenewalStarted | Renewal triggered | TaskEngine, NotificationService |
| AppointmentCompleted | Appointment marked done | PostAppointmentWorkflow, TaskEngine |
| HelpRequested | Patient clicks help button | CoordinatorQueue, NotificationService |
| PatientReadyForReview | All requirements complete | BoardQueue, NotificationService |
| RenewalRequired | Expired requirement detected | TaskEngine, NotificationService |
| BlockerCreated | Blocker detected | CoordinatorQueue, NotificationService |
| BlockerResolved | Blocker resolved | ReadinessEngine, TimelineService |
| TaskCompleted | Task marked done | ReadinessEngine, DependencyResolver |
| TaskOverdue | Task past due date | NotificationService, CoordinatorQueue |
| PatientInvited | New patient invited | OnboardingWorkflow, NotificationService |
| CaregiverInvited | Caregiver invited | AccessControl, NotificationService |
| ExternalUploadLinkCreated | Secure link generated | AuditService, NotificationService |
| DocumentShared | Passport shared | AuditService |
| AIResultOverridden | Human corrects AI | AIQualityService, AuditService |
| UserLoggedIn | Authentication success | AuditService, SessionService |
| PermissionGranted | Role/permission changed | AuditService |
| OrganizationCreated | New tenant created | ProvisioningService |

### 2.2 Event Structure

```typescript
interface DomainEvent {
  id: string           // UUID
  type: string         // Event type
  payload: JSON        // Event-specific data
  metadata: {
    timestamp: string  // ISO 8601
    actorId: string    // Who triggered
    organizationId: string
    correlationId: string  // For tracing
    causationId: string    // Previous event ID
  }
}
```

### 2.3 Event Flow Example

```
Patient uploads document
  → DocumentUploaded event
    → OCRJob consumer: queues OCR processing
    → AuditService consumer: logs upload
    → NotificationService consumer: confirms upload to patient

OCR completes
  → DocumentProcessed event
    → DocumentReviewQueue consumer: adds to coordinator queue
    → AIProcessingLog consumer: logs AI result

Coordinator accepts document
  → DocumentAccepted event
    → ReadinessEngine consumer: recalculates readiness
    → TimelineService consumer: adds timeline event
    → NotificationService consumer: notifies patient
    → TaskEngine consumer: marks related task complete

Task completed
  → TaskCompleted event
    → ReadinessEngine consumer: checks if case ready for review
    → DependencyResolver consumer: unblocks dependent tasks
```

## 3. Queue Architecture

### 3.1 Redis Queue Structure

```
Redis Keys:
  jobs:queue:default     - Default job queue
  jobs:queue:ocr         - OCR jobs
  jobs:queue:ai          - AI processing jobs
  jobs:queue:email       - Email jobs
  jobs:queue:reminder    - Reminder jobs
  jobs:queue:renewal     - Renewal jobs
  jobs:queue:expiration  - Expiration checks
  jobs:queue:analytics   - Analytics jobs
  jobs:failed            - Failed jobs (for retry)
  jobs:delayed           - Scheduled future jobs
  jobs:repeat            - Recurring jobs
```

### 3.2 Job Types

#### OCR Job
```
Job: ocr.process
Payload: { documentId: string }
Priority: normal
Timeout: 5 minutes
Retries: 3
Backoff: exponential
```

#### AI Classification Job
```
Job: ai.classify
Payload: { documentId: string, ocrText: string }
Priority: normal
Timeout: 2 minutes
Retries: 2
```

#### AI Extraction Job
```
Job: ai.extract
Payload: { documentId: string, classification: string }
Priority: normal
Timeout: 2 minutes
Retries: 2
```

#### AI Requirement Matching Job
```
Job: ai.match-requirements
Payload: { documentId: string, caseId: string }
Priority: normal
Timeout: 2 minutes
Retries: 2
```

#### Email Job
```
Job: email.send
Payload: { template: string, to: string, data: JSON }
Priority: high
Timeout: 30 seconds
Retries: 5
```

#### Reminder Job
```
Job: reminder.send
Payload: { taskId: string, notificationType: string }
Priority: high
Timeout: 30 seconds
Retries: 3
```

#### Expiration Check Job
```
Job: expiration.check
Payload: { }
Priority: normal
Timeout: 10 minutes
Retries: 1
Schedule: daily at 06:00
```

#### Renewal Generation Job
```
Job: renewal.generate
Payload: { requirementId: string }
Priority: normal
Timeout: 1 minute
Retries: 3
```

#### Analytics Job
```
Job: analytics.process
Payload: { organizationId: string, period: string }
Priority: low
Timeout: 10 minutes
Retries: 1
```

### 3.3 Job Processing Flow

```
Job Added to Queue
  ↓
Worker Picks Up Job
  ↓
Job Status: RUNNING
  ↓
Process Job
  ↓
Success?
  ├── YES
  │   └── Job Status: COMPLETED
  │       └── Remove from queue
  └── NO
      └── Job Status: FAILED
          └── Retry?
              ├── YES (retries left)
              │   └── Add to delayed queue
              │       └── Backoff period
              │           └── Retry
              └── NO (max retries)
                  └── Move to dead letter queue
                      └── Alert admin
```

### 3.4 Idempotency

All background jobs must be idempotent:

```typescript
// Example: OCR Job
async function processOCR(documentId: string) {
  // Check if already processed
  const doc = await db.document.findUnique({ where: { id: documentId } })
  if (doc.processingStatus !== 'UPLOADED') {
    return { status: 'already_processed' }
  }
  
  // Process
  const ocrResult = await ocrProvider.process(doc.fileKey)
  
  // Update with idempotency check
  await db.document.updateMany({
    where: { id: documentId, processingStatus: 'UPLOADED' },
    data: { ocrText: ocrResult.text, processingStatus: 'PROCESSING' }
  })
}
```

### 3.5 Job Dashboard Data

```
Job Monitor (Admin):
  ┌─────────────────────────────────────────┐
  │ Queue Stats                             │
  │ ┌─────────┬────────┬────────┬─────────┐ │
  │ │ Queue   │ Active │ Failed │ Delayed│ │
  │ ├─────────┼────────┼────────┼────────┤ │
  │ │ OCR     │   3    │   0    │   2    │ │
  │ │ AI      │   5    │   1    │   0    │ │
  │ │ Email   │   0    │   0    │  12    │ │
  │ │ Reminder│   2    │   0    │  45    │ │
  │ └─────────┴────────┴────────┴─────────┘ │
  │                                         │
  │ Recent Failed Jobs                      │
  │ ┌─────────────────────────────────────┐ │
  │ │ job_123 │ ai.extract │ timeout     │ │
  │ │ job_124 │ ocr.process│ corrupted   │ │
  │ └─────────────────────────────────────┘ │
  │                                         │
  │ [Retry] [Purge] [Pause Queue]           │
  └─────────────────────────────────────────┘
```

### 3.6 Scheduled Jobs

```
Daily (06:00):
  - expiration.check: Check all expiring requirements
  - reminder.generate: Generate upcoming reminders
  - stuck-patient.detect: Find inactive patients

Hourly:
  - analytics.aggregate: Update dashboard metrics
  - notification.send: Process notification queue

Every 15 minutes:
  - renewal.check: Check requirements needing renewal
  - document.review-overdue: Check overdue reviews

Every 5 minutes:
  - email.send: Process email queue
  - task.overdue: Mark overdue tasks
```

## 4. Event Store (Simplified)

For MVP, domain events are stored in the `AuditLog` table with a `TIMELINE_EVENT` type. Future iterations may use a dedicated event store.

```
Event Store Requirements:
- Append-only
- Immutable
- Ordered by timestamp
- Queryable by entity type/id
- Supports replay for new consumers
```

## 5. Message Bus (Internal)

```
In-Memory Event Bus (MVP):
  - Synchronous for critical paths
  - Asynchronous via Redis for background jobs

Future: Dedicated message bus (e.g., NATS, RabbitMQ)
```

## 6. Retry Strategy

```
Job Type        │ Max Retries │ Backoff      │ Timeout
────────────────┼─────────────┼──────────────┼─────────
OCR             │ 3           │ 2^n minutes  │ 5 min
AI Classification│ 2          │ 2^n minutes  │ 2 min
AI Extraction   │ 2           │ 2^n minutes  │ 2 min
Email           │ 5           │ 1 minute     │ 30 sec
Reminder        │ 3           │ 1 minute     │ 30 sec
Renewal         │ 3           │ 5 minutes    │ 1 min
Analytics       │ 1           │ 10 minutes   │ 10 min
```

## 7. Dead Letter Queue

```
Failed jobs (max retries exceeded):
  - Stored in dead letter queue
  - Admin notification sent
  - Manual retry available (with permission)
  - After 7 days: auto-purged or archived
```

## 8. Monitoring

```
Job Metrics:
  - Jobs processed per minute
  - Average processing time
  - Failure rate per job type
  - Queue depth
  - Retry rate
  - Dead letter queue size
```
