# Appointments API

Terminmanagement für Patienten und Klinik-Mitarbeiter.

---

### GET /api/appointments

Liste aller Termine (filtered by role).

**Auth Required:** Ja

**Response (200):**

```json
{
  "appointments": [
    {
      "id": "uuid",
      "type": "Transplantationsambulanz",
      "startTime": "2026-06-15T09:00:00Z",
      "endTime": "2026-06-15T10:00:00Z",
      "location": "Universitätsklinikum",
      "status": "CONFIRMED",
      "patient": {
        "id": "uuid",
        "firstName": "Max",
        "lastName": "Mustermann"
      }
    }
  ]
}
```

**Zugriffsregeln:**

- **PATIENT** — Nur eigene Termine
- **CAREGIVER** — Termine zugewiesener Patienten
- **Klinik-Rollen** — Alle Termine der Organisation

**Errors:**

- 401 — Nicht authentifiziert
- 403 — Ungenügende Berechtigungen

---

### POST /api/appointments

Erstellt einen neuen Termin.

**Auth Required:** Ja (ADMIN, COORDINATOR, PHYSICIAN, NURSE)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| patientId | string (UUID) | ja | Patienten-ID |
| type | string | ja | Termintyp |
| location | string | optional | Ort |
| startTime | string (ISO) | ja | Startzeitpunkt |
| endTime | string (ISO) | optional | Endzeitpunkt |
| notes | string | optional | Notizen |

**Response (200):**

```json
{
  "appointment": {
    "id": "uuid",
    "type": "Transplantationsambulanz",
    "startTime": "2026-06-15T09:00:00Z",
    "status": "PLANNED"
  }
}
```

**Errors:**

- 400 — Zod Validation (fehlende Felder, ungültige UUID)
- 404 — Kein aktiver Fall für den Patienten gefunden

---

### GET /api/appointments/[id]

Einzelner Termin mit Details.

**Auth Required:** Ja

**Response (200):**

```json
{
  "id": "uuid",
  "type": "Transplantationsambulanz",
  "startTime": "2026-06-15T09:00:00Z",
  "endTime": "2026-06-15T10:00:00Z",
  "location": "Universitätsklinikum",
  "status": "CONFIRMED",
  "notes": "Routine-Kontrolle",
  "patient": {
    "id": "uuid",
    "firstName": "Max",
    "lastName": "Mustermann"
  },
  "createdBy": {
    "id": "uuid",
    "name": "Dr. Schmidt"
  }
}
```

**Errors:**

- 404 — Termin nicht gefunden
- 403 — Kein Zugriff auf diesen Termin
