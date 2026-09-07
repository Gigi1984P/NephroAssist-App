# CMS API

Content Management für statische Seiten (ADMIN only).

---

### GET /api/cms/pages

Liste aller CMS-Seiten.

**Auth Required:** Ja

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| slug | string | Filter nach Slug |

**Response (200):**

```json
{
  "pages": [
    {
      "id": "uuid",
      "slug": "willkommen",
      "title": "Willkommen bei NephroAssist",
      "published": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-06-01T00:00:00Z"
    }
  ]
}
```

---

### GET /api/cms/pages?slug=willkommen

Einzelne Seite nach Slug.

**Auth Required:** Ja (oder public für published Seiten)

**Response (200):**

```json
{
  "page": {
    "id": "uuid",
    "slug": "willkommen",
    "title": "Willkommen bei NephroAssist",
    "content": "<h1>Willkommen</h1>...",
    "published": true,
    "organizationId": "uuid",
    "createdBy": "uuid",
    "createdAt": "..."
  }
}
```

---

### POST /api/cms/pages

Erstellt eine neue CMS-Seite.

**Auth Required:** Ja (ADMIN)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| slug | string (min 1, max 100) | ja | URL-Slug (einzigartig) |
| title | string (min 1, max 200) | ja | Seitentitel |
| content | string | ja | HTML-Inhalt |
| published | boolean | optional | Standard: false |
| organizationId | string (UUID) | optional | Zugehörige Organisation |

**Response (201):**

```json
{ "page": { "id": "uuid", "slug": "...", "title": "..." } }
```

**Errors:**

- 400 — Zod Validation (ungültige Felder)
- 409 — Slug bereits vergeben
- 403 — Keine ADMIN-Berechtigung

---

### PUT /api/cms/pages/[id]

Aktualisiert eine CMS-Seite.

**Auth Required:** Ja (ADMIN)

**Request Body:** (alle Felder optional)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| slug | string | Neuer Slug |
| title | string | Neuer Titel |
| content | string | Neuer Inhalt |
| published | boolean | Veröffentlichungsstatus |

**Response (200):**

```json
{ "page": { "id": "uuid", "slug": "...", "updatedAt": "..." } }
```

---

### DELETE /api/cms/pages/[id]

Löscht eine CMS-Seite.

**Auth Required:** Ja (ADMIN)

**Response (204):** (kein Body)

**Response (403):**

```json
{ "error": "Keine Berechtigung" }
```
