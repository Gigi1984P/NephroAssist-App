# Datenbank-Schema

## Wichtige Models

### Patient
```prisma
model Patient {
  id                           String    @id @default(uuid())
  firstName                    String
  lastName                     String
  email                        String?
  phone                        String?
  dateOfBirth                  DateTime?
  language                     String    @default("de")
  timezone                     String    @default("Europe/Berlin")
  consentStatus                String    @default("CONSENT_PENDING")
  
  // Hausarzt-Felder
  generalPractitionerName      String?
  generalPractitionerEmail       String?
  generalPractitionerPhone       String?
  generalPractitionerAddress     String?
  generalPractitionerCity        String?
  generalPractitionerZip         String?
  
  userId                       String    @unique
  organizationId               String
  cases                        PatientCase[]
  documents                    Document[]
}
```

### PatientCase
```prisma
model PatientCase {
  id              String    @id @default(uuid())
  patientId       String
  organizationId String
  programId       String
  coordinatorId   String?
  status          String    @default("EVALUATION")
  referralDate    DateTime?
  intakeDate      DateTime?
  
  patient         Patient   @relation(fields: [patientId], references: [id])
  requirements    PatientRequirement[]
  tasks           Task[]
}
```

### PatientRequirement (eine Untersuchung)
```prisma
model PatientRequirement {
  id              String    @id @default(uuid())
  caseId          String
  templateId      String
  title           String
  description     String?
  category        String
  status          RequirementStatus @default(NOT_STARTED)
  required        Boolean   @default(true)
  priority        Int       @default(0)
  completedAt     DateTime?
  
  patientCase     PatientCase @relation(fields: [caseId], references: [id])
  tasks           Task[]
}
```

### Task
```prisma
model Task {
  id              String    @id @default(uuid())
  requirementId   String
  caseId          String
  patientId       String?
  title           String
  description     String?
  status          TaskStatus @default(PENDING)
  
  // Workflow fields
  stepNumber      Int?
  stepName        String?
  stepDescription String?
  previousStepId  String?
  isWorkflowStep  Boolean   @default(false)
  
  // Completion tracking
  completedById   String?
  completedByRole String?
  completedAt     DateTime?
  
  // Flexible metadata (appointment data, upload info, etc.)
  metadata        Json?
  
  requirement     PatientRequirement @relation(fields: [requirementId], references: [id])
}
```

### RequirementTemplate
```prisma
model RequirementTemplate {
  id                         String    @id @default(uuid())
  programId                  String
  organizationId           String
  name                       String
  category                   String
  description                String?
  required                   Boolean   @default(true)
  listingBlocker             Boolean   @default(false)
  status                     TemplateStatus @default(DRAFT)
  
  patientRequirements        PatientRequirement[]
}
```

### Document
```prisma
model Document {
  id                String    @id @default(uuid())
  patientId         String
  caseId            String?
  filename          String
  mimeType          String
  size              Int
  documentType      String?
  uploadedBy        String
  processingStatus  String    @default("UPLOADED")
  
  patient           Patient   @relation(fields: [patientId], references: [id])
}
```

### User
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  password      String?
  role          UserRole  @default(PATIENT)
  
  patients      Patient[]
  accounts      Account[]
  sessions      Session[]
}
```

## Enum: RequirementStatus
```
NOT_STARTED, ACTION_REQUIRED, IN_PROGRESS, WAITING_FOR_APPOINTMENT,
WAITING_FOR_DOCUMENT, DOCUMENT_UPLOADED, UNDER_REVIEW, ACCEPTED,
REJECTED, BLOCKED, EXPIRED, RENEWAL_REQUIRED, WAIVED
```

## Enum: TaskStatus
```
PENDING, IN_PROGRESS, COMPLETED
```

## Enum: UserRole
```
ADMIN, COORDINATOR, PHYSICIAN, NURSE, PATIENT, CAREGIVER, DIALYSIS_STAFF
```

## Wichtige Beziehungen

```
User (1) ────── (1) Patient
Patient (1) ──── (*) PatientCase
PatientCase (1) ──── (*) PatientRequirement
PatientRequirement (1) ──── (*) Task
Patient (1) ──── (*) Document
RequirementTemplate (1) ──── (*) PatientRequirement
```

## Production-DB Connection
- Host: `m22p.your-database.de`
- Connection String in `.env`
- URL-Encoding via `src/lib/prisma.ts`
- `prisma db push` für Schema-Updates
