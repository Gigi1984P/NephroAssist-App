# Notifications API

Benachrichtigungen und Timeline-Einträge.

---

### GET /api/notifications

Liste aller Benachrichtigungen für den aktuellen Benutzer.

**Auth Required:** Ja

**Response (200):**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "TASK_ASSIGNED",
      "title": "Neue Aufgabe zugewiesen",
      "message": "Sie haben eine neue Aufgabe erhalten",
      "read": false,
      "entityType": "TASK",
      "entityId": "uuid",
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

---

### PUT /api/notifications/[id]/read

Markiert eine Benachrichtigung als gelesen.

**Auth Required:** Ja

**Response (200):**

```json
{ "notification": { "id": "uuid", "read": true, "readAt": "..." } }
```

---

### PUT /api/notifications/read-all

Markiert alle Benachrichtigungen als gelesen.

**Auth Required:** Ja

**Response (200):**

```json
{ "updated": 5 }
```

---

### GET /api/timeline

Timeline aller Aktivitäten für den Benutzer.

**Auth Required:** Ja

**Response (200):**

```json
{
  "timeline": [
    {
      "id": "uuid",
      "type": "PATIENT_CREATED",
      "description": "Neuer Patient angelegt",
      "userId": "uuid",
      "userName": "Dr. Schmidt",
      "entityType": "PATIENT",
      "entityId": "uuid",
      "createdAt": "2026-06-01T10:00:00Z"
    },
    {
      "id": "uuid",
      "type": "APPOINTMENT_CONFIRMED",
      "description": "Termin bestätigt",
      "createdAt": "2026-06-01T11:00:00Z"
    }
  ]
}
```
