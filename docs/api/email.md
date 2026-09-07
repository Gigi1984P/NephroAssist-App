# Email API

SMTP-basierte E-Mail-Kommunikation.

---

### GET /api/email

Liste aller E-Mails (Inbox + Sent).

**Auth Required:** Ja

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| folder | string | inbox, sent, drafts |

**Response (200):**

```json
{
  "emails": [
    {
      "id": "uuid",
      "fromEmail": "sender@example.com",
      "toEmail": "recipient@example.com",
      "subject": "Terminbestätigung",
      "body": "...",
      "status": "SENT",
      "sentAt": "2026-06-01T10:00:00Z",
      "createdAt": "2026-06-01T09:00:00Z",
      "patient": { "id": "uuid", "firstName": "Max", "lastName": "Mustermann" }
    }
  ]
}
```

---

### POST /api/email

Speichert eine E-Mail als Entwurf.

**Auth Required:** Ja

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| to | string (email) | ja |
| subject | string | ja |
| body | string | optional |

**Response (201):**

```json
{ "email": { "id": "uuid", "status": "DRAFT", "createdAt": "..." } }
```

---

### POST /api/email/send

Sendet eine E-Mail via SMTP.

**Auth Required:** Ja (ADMIN, COORDINATOR, PHYSICIAN, NURSE)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| to | string (email) | ja | Empfänger |
| subject | string | ja | Betreff |
| body | string | ja | Nachricht (HTML möglich) |
| patientId | string (UUID) | optional | Verknüpfter Patient |

**Response (200):**

```json
{
  "email": {
    "id": "uuid",
    "toEmail": "recipient@example.com",
    "subject": "...",
    "status": "SENT",
    "sentAt": "2026-06-01T10:00:00Z"
  }
}
```

**Response (500):**

```json
{ "error": "E-Mail konnte nicht gesendet werden", "details": "SMTP-Fehler" }
```

---

### GET /api/email/sent

Liste gesendeter E-Mails.

**Auth Required:** Ja

**Response (200):**

```json
{
  "emails": [
    {
      "id": "uuid",
      "toEmail": "...",
      "subject": "...",
      "sentAt": "...",
      "status": "SENT"
    }
  ]
}
```

---

### DELETE /api/email/[id]

Löscht eine E-Mail.

**Auth Required:** Ja

**Response (204):** (kein Body)

**Response (404):**

```json
{ "error": "E-Mail nicht gefunden" }
```
