# API-Endpunkte

## Auth

### POST /api/login
**Body:** `{ email: string, password: string }`
**Response:** Setzt Cookie `nephro-token` (JWT)
**Error:** 401 bei ungültigen Credentials

### POST /api/logout
**Response:** Löscht Cookie

## User

### GET /api/user/profile
**Auth:** Cookie `nephro-token`
**Response:** `{ user: { id, email, name, role } }` oder `{ id, email, name, role }` (flat)

## Patienten (für eigene Daten)

### GET /api/patients/me
**Auth:** Patient oder Caregiver
**Response:** `{ patient: { id, firstName, ..., generalPractitionerName, ... } }`

### PATCH /api/patients/me
**Auth:** Patient oder Caregiver
**Body:** `{ generalPractitionerName?, generalPractitionerEmail?, generalPractitionerPhone?, generalPractitionerAddress?, generalPractitionerCity?, generalPractitionerZip? }`
**Response:** `{ patient: {...} }`

## Patienten (für Klinik)

### GET /api/patients
**Auth:** Klinik-Rollen (ADMIN/COORDINATOR/PHYSICIAN/NURSE)
**Response:** `{ patients: [{ id, firstName, lastName, email, cases: [{ id }] }] }`

### GET /api/patients/overview
**Auth:** Klinik-Rollen
**Response:** `{ patients: [{ id, firstName, lastName, email, phone, hasReport, documentCount, gpName, gpEmail, gpPhone }] }`

## Tasks (Untersuchungen)

### GET /api/tasks
**Auth:** Alle Rollen
**Response:** `{ tasks: [{ id, title, status, patientName, category, isWorkflowStep, stepNumber }] }`
**Hinweis:** Filtert `isWorkflowStep: false` im Frontend

### GET /api/tasks/[id]
**Auth:** Alle Rollen (mit eigener Authorisierung)
**Response:** `{ task: {...} }`

### PATCH /api/tasks/[id]
**Auth:** Alle Rollen
**Body:** `{ status?, metadata?, completedById?, completedByRole? }`
**Response:** `{ task: {...} }`

### GET /api/tasks/[id]/workflow
**Response:** `{ steps: [{ id, title, status, stepNumber, stepName, stepDescription, metadata, previousStepId }] }`

### POST /api/tasks/[id]/referral
**Auth:** Alle Rollen
**Funktion:** Simuliert Email an Hausarzt, setzt Task auf COMPLETED
**Response:** `{ message, task }`

### POST /api/tasks/[id]/report-request
**Auth:** Alle Rollen
**Funktion:** Liest Facharzt-Email aus Schritt 3, simuliert Email, setzt Task auf COMPLETED
**Response:** `{ message, task }`

### POST /api/tasks/[id]/review
**Auth:** Klinik-Rollen
**Funktion:** Setzt Schritt 6 auf COMPLETED + PatientRequirement auf ACCEPTED
**Response:** `{ message, task }`

## Untersuchungen (Klinik)

### GET /api/examinations/templates
**Auth:** Klinik-Rollen
**Response:** `{ templates: [{ id, name, category, description, required, listingBlocker, status }] }`

### POST /api/examinations/templates
**Auth:** Klinik-Rollen
**Body:** `{ name, category, description?, required?, listingBlocker? }`
**Response:** `{ template: {...} }`

### PUT /api/examinations/templates/[id]
**Auth:** Klinik-Rollen
**Body:** `{ name?, category?, description?, required?, listingBlocker? }`

### DELETE /api/examinations/templates/[id]
**Auth:** Klinik-Rollen

### POST /api/examinations/assign
**Auth:** Klinik-Rollen
**Body:** `{ caseId, templateId?, title?, category?, description?, workflowType? }`
**Funktion:** Erstellt PatientRequirement + Top-Level Task + Workflow-Schritte
**Response:** `{ message, requirement }`

## Dokumente

### POST /api/documents
**Body:** `{ patientId, file, documentType? }`
**Response:** `{ document: {...} }`

## Admin/Debug

### GET /api/debug-login
**Response:** Debug-Info für Login-Probleme

---

## Auth-Header
Alle API-Aufrufe nutzen **Cookie-based Auth** (kein Bearer Token).
Im Frontend immer `credentials: "include"` bei `fetch()` verwenden.

## Fehlercodes
| Code | Bedeutung |
|---|---|
| 401 | Nicht autorisiert (kein Cookie oder ungültig) |
| 403 | Zugriff verweigert (falsche Rolle) |
| 404 | Ressource nicht gefunden |
| 400 | Ungültige Daten (Zod-Validation) |
| 500 | Serverfehler |
