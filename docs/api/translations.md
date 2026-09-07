# Translations API

Internationalisierung (i18n) — Übersetzungen für die Anwendung.

---

### GET /api/translations

Holt alle Übersetzungen für eine Sprache.

**Auth Required:** Nein (öffentlich)

**Query Parameters:**

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| lang | string | ja | Sprachcode (de, it) |

**Response (200):**

```json
{
  "translations": {
    "nav.dashboard": "Dashboard",
    "nav.patients": "Patienten",
    "nav.calendar": "Kalender",
    "loading.title": "Laden...",
    "appt.new": "Neuer Termin",
    "...": "..."
  }
}
```

---

### POST /api/translations/seed

Seed-Datei für Übersetzungen (meist für Entwicklung/Setup).

**Auth Required:** Ja (ADMIN)

**Response (200):**

```json
{
  "message": "Übersetzungen geseedet",
  "created": 50,
  "updated": 450
}
```

**Hinweis:** Dieser Endpunkt wird typischerweise nur einmal während der initialen Einrichtung aufgerufen.
