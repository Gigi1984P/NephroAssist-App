# Requirements API

Anforderungen (Requirements) und Template-Sets für den Transplantationsprozess.

---

### GET /api/requirements

Liste aller Anforderungen.

**Auth Required:** Ja

**Response (200):**

```json
{
  "requirements": [
    {
      "id": "uuid",
      "name": "Blutdruck-Messung",
      "description": "Tägliche Blutdruckkontrolle",
      "category": "VITALS",
      "isRequired": true,
      "order": 1
    }
  ]
}
```

---

### POST /api/requirements

Erstellt eine neue Anforderung.

**Auth Required:** Ja (ADMIN, COORDINATOR)

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| name | string | ja |
| description | string | ja |
| category | string | ja |
| isRequired | boolean | optional |

**Response (201):**

```json
{ "requirement": { "id": "uuid", "name": "..." } }
```

---

### GET /api/template-sets

Liste aller Template-Sets.

**Auth Required:** Ja

**Response (200):**

```json
{
  "templateSets": [
    {
      "id": "uuid",
      "name": "Standard Transplantation",
      "description": "Standard-Anforderungen für Nierentransplantation",
      "requirements": [
        { "id": "uuid", "name": "...", "order": 1 }
      ]
    }
  ]
}
```

---

### POST /api/template-sets

Erstellt ein neues Template-Set.

**Auth Required:** Ja (ADMIN)

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| name | string | ja |
| description | string | ja |
| requirementIds | string[] (UUID) | ja |

**Response (201):**

```json
{ "templateSet": { "id": "uuid", "name": "..." } }
```
