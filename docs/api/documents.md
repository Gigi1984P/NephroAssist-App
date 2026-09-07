# Documents API

Dokumentenmanagement mit Upload-Funktionalität.

---

### POST /api/documents

Lädt ein Dokument hoch.

**Auth Required:** Ja

**Request Body:** (multipart/form-data)

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| file | File | ja | Dokument (PDF, Bild, etc.) |
| patientId | string (UUID) | optional | Zugehöriger Patient |
| category | string | optional | Kategorie (z.B. "LAB", "PRESCRIPTION") |

**Response (201):**

```json
{
  "document": {
    "id": "uuid",
    "filename": "blutwerte.pdf",
    "url": "https://cdn.nephroassist.com/docs/uuid",
    "category": "LAB",
    "patientId": "uuid",
    "uploadedAt": "2026-06-01T10:00:00Z"
  }
}
```

---

### GET /api/documents

Liste hochgeladener Dokumente.

**Auth Required:** Ja

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| patientId | string (UUID) | Filter nach Patient |
| category | string | Filter nach Kategorie |

**Response (200):**

```json
{
  "documents": [
    {
      "id": "uuid",
      "filename": "blutwerte.pdf",
      "url": "...",
      "category": "LAB",
      "uploadedBy": "uuid",
      "uploadedAt": "..."
    }
  ]
}
```

---

### GET /api/secure-upload-links

Erstellt einen sicheren Upload-Link.

**Auth Required:** Ja

**Response (201):**

```json
{
  "uploadLink": {
    "token": "secure-token",
    "url": "https://www.nephroassist.com/upload/secure-token",
    "expiresAt": "2026-06-01T12:00:00Z"
  }
}
```

---

### POST /api/upload/[token]

Upload via sicheren Link (ohne Auth).

**Auth Required:** Nein (Token-basiert)

**Request Body:** (multipart/form-data)

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| file | File | ja |

**Response (200):**

```json
{ "message": "Upload erfolgreich", "documentId": "uuid" }
```

**Response (403):**

```json
{ "error": "Ungültiger oder abgelaufener Token" }
```
