# Help Requests API

Hilfeanfragen von Patienten und Betreuungspersonen.

---

### GET /api/help-requests

Liste aller Hilfeanfragen.

**Auth Required:** Ja

**Response (200):**

```json
{
  "helpRequests": [
    {
      "id": "uuid",
      "type": "TRANSPORT",
      "description": "Benötige Fahrt zur Dialyse",
      "status": "OPEN",
      "patientId": "uuid",
      "patientName": "Max Mustermann",
      "assignedTo": "uuid",
      "createdAt": "2026-06-01T10:00:00Z",
      "resolvedAt": null
    }
  ]
}
```

---

### POST /api/help-requests

Erstellt eine neue Hilfeanfrage.

**Auth Required:** Ja (PATIENT, CAREGIVER)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| type | string (enum) | ja | I_DONT_UNDERSTAND, NO_APPOINTMENT, MISSING_PRESCRIPTION, DOCTOR_WONT_ISSUE, TRANSPORT, LANGUAGE, ORGANIZATIONAL, OTHER |
| description | string (max 2000) | ja | Beschreibung |
| caseId | string (UUID) | ja | Fall-ID |
| requirementId | string (UUID) | optional | Verknüpfte Anforderung |

**Response (201):**

```json
{
  "helpRequest": {
    "id": "uuid",
    "type": "TRANSPORT",
    "status": "OPEN",
    "createdAt": "..."
  }
}
```

**Errors:**

- 400 — Zod Validation (ungültiger Typ, Beschreibung zu lang)

---

### PUT /api/help-requests/[id]

Aktualisiert eine Hilfeanfrage (z.B. Zuweisung, Status).

**Auth Required:** Ja (Klinik-Rollen)

**Request Body:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| status | string | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| assignedTo | string (UUID) | Zugewiesener Mitarbeiter |

**Response (200):**

```json
{ "helpRequest": { "id": "uuid", "status": "RESOLVED", "resolvedAt": "..." } }
```
