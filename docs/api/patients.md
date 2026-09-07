# Patients API

Patientenmanagement und verwandte Daten.

---

### GET /api/patients/overview

Liste aller Patienten (mit Filter nach Organisation/Rolle).

**Auth Required:** Ja

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| search | string | Suche nach Name/E-Mail |
| status | string | Filter nach Status |

**Response (200):**

```json
{
  "patients": [
    {
      "id": "uuid",
      "firstName": "Max",
      "lastName": "Mustermann",
      "email": "max@example.com",
      "dateOfBirth": "1980-01-15",
      "status": "ACTIVE",
      "organizationId": "uuid"
    }
  ],
  "total": 150
}
```

**Errors:**

- 401 — Nicht authentifiziert
- 403 — Ungenügende Berechtigungen

---

### POST /api/patients

Erstellt einen neuen Patienten (und optional ein Benutzerkonto).

**Auth Required:** Ja (ADMIN, COORDINATOR, PHYSICIAN, NURSE)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| firstName | string | ja | Vorname |
| lastName | string | ja | Nachname |
| email | string (email) | ja | E-Mail |
| dateOfBirth | string (ISO) | ja | Geburtsdatum |
| phone | string | optional | Telefon |
| gpName | string | optional | Hausarzt Name |
| gpPhone | string | optional | Hausarzt Telefon |
| createUserAccount | boolean | optional | Benutzerkonto erstellen |
| userEmail | string | optional | E-Mail für Benutzerkonto |

**Response (201):**

```json
{
  "patient": { "id": "uuid", "firstName": "...", "lastName": "..." },
  "user": { "id": "uuid", "email": "..." },  // falls erstellt
  "assignedRequirements": [...]
}
```

**Errors:**

- 400 — Zod Validation (fehlende Felder, ungültige E-Mail)
- 409 — Patient mit dieser E-Mail existiert bereits

---

### GET /api/patients/[id]

Einzelner Patient mit Detaildaten.

**Auth Required:** Ja

**Response (200):**

```json
{
  "id": "uuid",
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "max@example.com",
  "dateOfBirth": "1980-01-15",
  "phone": "+49...",
  "gpName": "Dr. Schmidt",
  "gpPhone": "+49...",
  "status": "ACTIVE",
  "organizationId": "uuid",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-06-01T00:00:00Z"
}
```

**Errors:**

- 404 — Patient nicht gefunden

---

### PUT /api/patients/[id]/edit

Aktualisiert Patientendaten.

**Auth Required:** Ja

**Request Body:** Gleiche Felder wie POST (alle optional).

**Response (200):**

```json
{ "patient": { "id": "uuid", "firstName": "...", "lastName": "..." } }
```

---

### GET /api/patients/[id]/comments

Kommentare zu einem Patienten.

**Auth Required:** Ja

**Response (200):**

```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Patient reagiert gut auf die neue Medikation.",
      "authorId": "uuid",
      "authorRole": "PHYSICIAN",
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ]
}
```

---

### POST /api/patients/[id]/comments

Neuer Kommentar zu einem Patienten.

**Auth Required:** Ja

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| content | string (max 5000) | ja |

**Response (201):**

```json
{ "comment": { "id": "uuid", "content": "...", "createdAt": "..." } }
```

---

### GET /api/patients/[id]/medications

Medikationsplan eines Patienten.

**Auth Required:** Ja

**Response (200):**

```json
{
  "medications": [
    {
      "id": "uuid",
      "name": "Tacrolimus",
      "dosage": "2mg",
      "frequency": "2x täglich",
      "startDate": "2026-01-01",
      "endDate": null
    }
  ]
}
```

---

### GET /api/patients/[id]/dialysis-regime

Dialyse-Regime eines Patienten.

**Auth Required:** Ja

**Response (200):**

```json
{
  "regimes": [
    {
      "id": "uuid",
      "type": "HEMODIALYSIS",
      "frequency": "3x pro Woche",
      "duration": "4 Stunden",
      "location": "Dialysezentrum München"
    }
  ]
}
```

---

### GET /api/patients/[id]/lab-values

Laborwerte eines Patienten.

**Auth Required:** Ja

**Response (200):**

```json
{
  "labValues": [
    {
      "id": "uuid",
      "type": "CREATININE",
      "value": 1.2,
      "unit": "mg/dL",
      "measuredAt": "2026-06-01T08:00:00Z"
    }
  ]
}
```

---

### GET /api/patients/[id]/cases

Fälle (Cases) eines Patienten.

**Auth Required:** Ja

**Response (200):**

```json
{
  "cases": [
    {
      "id": "uuid",
      "status": "ACTIVE",
      "type": "TRANSPLANT",
      "startDate": "2026-01-01",
      "endDate": null
    }
  ]
}
```

---

### POST /api/patients/[id]/assign-template-set

Weist einem Patienten ein Template-Set zu.

**Auth Required:** Ja (ADMIN, COORDINATOR)

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| templateSetId | string (UUID) | ja |

**Response (200):**

```json
{ "assignedRequirements": [...] }
```
