# Tasks API

Aufgabenmanagement für den Transplantationsprozess.

---

### GET /api/tasks

Liste aller Tasks (filtered by role).

**Auth Required:** Ja

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| status | string | OPEN, IN_PROGRESS, COMPLETED, BLOCKED |
| patientId | string (UUID) | Filter nach Patient |
| assignedTo | string (UUID) | Filter nach Zuweisung |

**Response (200):**

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Blutdruck-Messung",
      "description": "Tägliche Blutdruckkontrolle",
      "status": "OPEN",
      "priority": "HIGH",
      "dueDate": "2026-06-10",
      "patientId": "uuid",
      "assignedTo": "uuid",
      "createdAt": "2026-06-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/tasks

Erstellt einen neuen Task.

**Auth Required:** Ja (ADMIN, COORDINATOR, PHYSICIAN, NURSE)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| title | string | ja | Titel |
| description | string | optional | Beschreibung |
| patientId | string (UUID) | ja | Patienten-ID |
| priority | string | optional | LOW, MEDIUM, HIGH, CRITICAL |
| dueDate | string (ISO) | optional | Fälligkeitsdatum |
| requirementId | string (UUID) | optional | Verknüpfte Anforderung |

**Response (201):**

```json
{ "task": { "id": "uuid", "title": "...", "status": "OPEN" } }
```

---

### GET /api/tasks/[id]

Einzelner Task mit Details.

**Auth Required:** Ja

**Response (200):**

```json
{
  "id": "uuid",
  "title": "Blutdruck-Messung",
  "description": "...",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2026-06-10",
  "patient": { "id": "...", "firstName": "...", "lastName": "..." },
  "assignedTo": { "id": "...", "name": "..." },
  "comments": [],
  "history": []
}
```

---

### PUT /api/tasks/[id]

Aktualisiert einen Task.

**Auth Required:** Ja

**Request Body:** (alle Felder optional)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| status | string | OPEN, IN_PROGRESS, COMPLETED, BLOCKED |
| assignedTo | string (UUID) | Neuer zugewiesener Benutzer |
| title | string | Neuer Titel |
| description | string | Neue Beschreibung |

**Response (200):**

```json
{ "task": { "id": "uuid", "status": "COMPLETED", "updatedAt": "..." } }
```

---

### GET /api/tasks/[id]/next-action

Empfohlener nächster Schritt basierend auf Task-Abhängigkeiten.

**Auth Required:** Ja

**Response (200):**

```json
{
  "nextAction": {
    "type": "SCHEDULE_APPOINTMENT",
    "description": "Nächsten Termin für Laborwerte vereinbaren",
    "suggestedDate": "2026-06-15"
  }
}
```

---

### POST /api/tasks/[id]/referral

Simuliert eine Überweisungsanfrage an den Hausarzt.

**Auth Required:** Ja

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| gpEmail | string (email) | ja |
| reason | string | ja |

**Response (200):**

```json
{ "message": "Überweisung angefordert" }
```

---

### POST /api/tasks/[id]/review

Markiert einen Prüfungsschritt als abgenommen.

**Auth Required:** Ja

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| approved | boolean | ja |
| notes | string | optional |

**Response (200):**

```json
{ "review": { "id": "uuid", "approved": true, "reviewedAt": "..." } }
```
