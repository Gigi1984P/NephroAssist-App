# Admin API

Verwaltungsendpunkte (nur für ADMIN-Rolle).

---

### GET /api/admin/users

Liste aller Benutzer.

**Auth Required:** Ja (ADMIN)

**Response (200):**

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@nephroassist.de",
      "name": "Admin User",
      "role": "ADMIN",
      "organizationId": "uuid",
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLoginAt": "2026-06-01T10:00:00Z"
    }
  ]
}
```

---

### GET /api/admin/users/[id]

Einzelner Benutzer mit Details.

**Auth Required:** Ja (ADMIN)

**Response (200):**

```json
{
  "id": "uuid",
  "email": "admin@nephroassist.de",
  "name": "Admin User",
  "role": "ADMIN",
  "organizationId": "uuid",
  "loginHistory": [
    { "ip": "192.168.1.1", "userAgent": "...", "timestamp": "..." }
  ]
}
```

---

### POST /api/admin/users/[id]/reset-password

Setzt das Passwort eines Benutzers zurück.

**Auth Required:** Ja (ADMIN)

**Response (200):**

```json
{ "message": "Passwort zurückgesetzt", "temporaryPassword": "auto-generated" }
```

---

### GET /api/admin/audit

Audit-Log der Systemaktivitäten.

**Auth Required:** Ja (ADMIN)

**Query Parameters:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| userId | string (UUID) | Filter nach Benutzer |
| entityType | string | Filter nach Entität |
| startDate | string (ISO) | Startdatum |
| endDate | string (ISO) | Enddatum |

**Response (200):**

```json
{
  "logs": [
    {
      "id": "uuid",
      "action": "PATIENT_CREATED",
      "userId": "uuid",
      "userName": "Admin User",
      "entityType": "PATIENT",
      "entityId": "uuid",
      "details": { ... },
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ],
  "total": 1500
}
```

---

### GET /api/admin/reports

Admin-Berichte (Statistiken).

**Auth Required:** Ja (ADMIN)

**Response (200):**

```json
{
  "reports": {
    "totalPatients": 150,
    "totalTasks": 450,
    "openHelpRequests": 12,
    "usersByRole": { "ADMIN": 3, "COORDINATOR": 5, "PHYSICIAN": 10, "NURSE": 20, "PATIENT": 112 }
  }
}
```

---

### GET /api/admin/settings

Systemeinstellungen.

**Auth Required:** Ja (ADMIN)

**Response (200):**

```json
{
  "settings": {
    "appName": "NephroAssist",
    "defaultLanguage": "de",
    "emailNotifications": true,
    "twoFactorRequired": false,
    "passwordPolicy": { "minLength": 8, "requireSpecialChars": true }
  }
}
```

---

### PUT /api/admin/settings

Aktualisiert Systemeinstellungen.

**Auth Required:** Ja (ADMIN)

**Request Body:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| appName | string | Anwendungsname |
| defaultLanguage | string | Standard-Sprache (de/it) |
| emailNotifications | boolean | E-Mail-Benachrichtigungen |
| twoFactorRequired | boolean | 2FA Pflicht für Admins |

**Response (200):**

```json
{ "settings": { "appName": "...", "updatedAt": "..." } }
```
