# Reports API

Berichtsgenerierung für Kliniken und Administratoren.

---

### GET /api/reports

Liste verfügbarer Berichte.

**Auth Required:** Ja

**Response (200):**

```json
{
  "reports": [
    {
      "id": "uuid",
      "type": "PATIENT_STATUS",
      "title": "Patientenstatus-Bericht",
      "description": "Übersicht aller aktiven Patienten",
      "generatedAt": "2026-06-01T00:00:00Z",
      "url": "https://cdn.nephroassist.com/reports/uuid.pdf"
    }
  ]
}
```

---

### POST /api/reports

Generiert einen neuen Bericht.

**Auth Required:** Ja (ADMIN, COORDINATOR, PHYSICIAN)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| type | string | ja | PATIENT_STATUS, TASK_COMPLETION, AUDIT |
| parameters | object | optional | Filter-Parameter |

**Response (201):**

```json
{
  "report": {
    "id": "uuid",
    "type": "PATIENT_STATUS",
    "url": "https://cdn.nephroassist.com/reports/uuid.pdf",
    "generatedAt": "..."
  }
}
```
