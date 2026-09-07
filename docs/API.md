# NephroAssist — API-Dokumentation

> Stand: September 2026 | Version: 1.0

---

## 🔐 Authentifizierung

Die API verwendet eine Kombination aus **NextAuth-Sessions** und **JWT-Cookies** (`nephro-token`).

| Methode | Beschreibung |
|---------|--------------|
| **Cookie** | `nephro-token` (httpOnly, secure, SameSite=Strict) |
| **Session** | NextAuth Session (via `auth()` helper) |
| **CSRF** | `x-csrf-token` Header bei allen POST/PUT/PATCH/DELETE Requests |

### Fehlerformat

```json
{
  "error": "Fehlermeldung",
  "retryAfter": 900  // bei Rate Limiting
}
```

### HTTP-Statuscodes

| Code | Bedeutung |
|------|-----------|
| 200 | Erfolg |
| 400 | Validation-Fehler (Zod) |
| 401 | Nicht authentifiziert |
| 403 | Zugriff verweigert (Rolle unzureichend) |
| 404 | Ressource nicht gefunden |
| 429 | Rate Limit überschritten |
| 500 | Serverfehler |

### Rate Limiting

- **Login**: 5 Versuche / 15 Minuten
- **Register**: 3 Versuche / Stunde
- **Forgot Password**: 5 Versuche / 15 Minuten
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

---

## 📂 Endpunkt-Kategorien

| Kategorie | Endpunkte | Auth |
|-----------|-----------|------|
| [Auth](./api/auth.md) | Login, Register, Logout, Verify, Reset | Nein (Login) / Ja |
| [Patients](./api/patients.md) | CRUD, Overview, Comments, Medications, Cases | Ja |
| [Appointments](./api/appointments.md) | GET/POST Termine | Ja |
| [Tasks](./api/tasks.md) | CRUD, Next Action, Referral, Review | Ja |
| [Email](./api/email.md) | Inbox, Sent, Compose, Delete | Ja |
| [CMS](./api/cms.md) | Pages CRUD (ADMIN) | Ja |
| [Admin](./api/admin.md) | Users, Audit, Settings, Reports | Ja (ADMIN) |
| [Help Requests](./api/help-requests.md) | Hilfeanfragen | Ja |
| [Documents](./api/documents.md) | Upload, Secure Links | Ja |
| [Notifications](./api/notifications.md) | Notifications, Timeline | Ja |
| [Requirements](./api/requirements.md) | Anforderungen, Templates | Ja |
| [Examinations](./api/examinations.md) | Untersuchungs-Templates | Ja |
| [Reports](./api/reports.md) | Berichte | Ja |
| [Translations](./api/translations.md) | i18n Übersetzungen | Nein (GET) / Ja (POST) |
| [User](./api/user.md) | Profil, Passwort ändern | Ja |

---

## 🏗️ Architektur

```
Base URL: https://www.nephroassist.com/api/
Format: JSON
Content-Type: application/json
```

### Zod-Validierung

Alle state-changing Endpunkte verwenden **Zod** für Input-Validierung:

| Endpunkt | Validierung |
|----------|-------------|
| `/api/login` | `email` (string, email), `password` (string, min 8) |
| `/api/auth/register` | `email`, `password`, `firstName`, `lastName`, `role` |
| `/api/appointments` | `patientId` (UUID), `type` (string, min 1), `startTime` (ISO) |
| `/api/patients` | `firstName`, `lastName`, `email`, `dateOfBirth` |
| `/api/help-requests` | `type` (enum), `description` (string, max 2000) |
| `/api/email/send` | `to` (email), `subject` (string), `body` (string) |
| `/api/cms/pages` | `slug` (string, max 100), `title` (string, max 200), `content` (string) |

### Rollenbasierte Zugriffskontrolle (RBAC)

| Rolle | Beschreibung |
|-------|--------------|
| **ADMIN** | Vollzugriff auf alle Endpunkte |
| **COORDINATOR** | Patienten-Management, Termine, Tasks |
| **PHYSICIAN** | Patienten-Detailansicht, Termine, Berichte |
| **NURSE** | Patienten-Übersicht, Termine, Tasks |
| **PATIENT** | Eigene Daten, Termine, Help Requests |
| **CAREGIVER** | Zugewiesene Patienten-Daten |
| **DIALYSIS_STAFF** | Dialyse-Regime, Patienten-Übersicht |

### Middleware-Sicherheit

- **Admin-Gate**: `/admin/*` erfordert `ADMIN` Rolle
- **CSP Header**: `default-src 'self'`, `script-src 'self' 'unsafe-inline'`
- **HSTS**: `max-age=31536000; includeSubDomains`
- **X-Frame-Options**: `DENY`
- **X-Content-Type-Options**: `nosniff`

---

## 📝 OpenAPI Spec

Eine vollständige OpenAPI 3.0 Spezifikation für die wichtigsten Endpunkte findest du unter [`docs/openapi.yaml`](./openapi.yaml).
