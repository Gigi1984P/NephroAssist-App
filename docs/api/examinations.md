# Examinations API

Untersuchungs-Templates für den Transplantationsprozess.

---

### GET /api/examinations/templates

Liste aller Untersuchungs-Templates.

**Auth Required:** Ja

**Response (200):**

```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Pre-Transplant Assessment",
      "description": "Vollständige Vor-Transplantations-Bewertung",
      "category": "PRE_TRANSPLANT",
      "fields": [
        { "name": "blutdruck", "type": "number", "unit": "mmHg", "required": true },
        { "name": "gewicht", "type": "number", "unit": "kg", "required": true }
      ],
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/examinations/templates

Erstellt ein neues Untersuchungs-Template.

**Auth Required:** Ja (ADMIN, COORDINATOR)

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| name | string | ja |
| description | string | ja |
| category | string | ja |
| fields | Field[] | ja |

**Response (201):**

```json
{ "template": { "id": "uuid", "name": "..." } }
```
