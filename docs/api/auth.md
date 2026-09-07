# Auth API

Authentifizierung und Benutzerverwaltung.

---

### POST /api/login

Authentifiziert einen Benutzer und setzt das `nephro-token` Cookie.

**Auth Required:** Nein

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| email | string | ja | Benutzer-E-Mail |
| password | string | ja | Passwort (min. 8 Zeichen) |

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@nephroassist.de",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

**Response (401):**

```json
{ "error": "Ungültige Anmeldedaten" }
```

**Response (429):**

```json
{ "error": "Zu viele Versuche", "retryAfter": 900 }
```

---

### POST /api/auth/register

Registriert einen neuen Benutzer.

**Auth Required:** Nein (nur für öffentliche Registrierung)

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| email | string | ja | E-Mail (einzigartig) |
| password | string | ja | Min. 8 Zeichen |
| firstName | string | ja | Vorname |
| lastName | string | ja | Nachname |
| role | string | optional | Standard: PATIENT |

**Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Max",
    "lastName": "Mustermann"
  }
}
```

**Errors:**

- 400 — E-Mail bereits vergeben, Passwort zu kurz
- 429 — Rate Limit überschritten

---

### POST /api/logout

Beendet die Session und löscht das Cookie.

**Auth Required:** Ja

**Response (200):**

```json
{ "message": "Abgemeldet" }
```

---

### POST /api/auth/forgot-password

Sendet eine Passwort-Reset-E-Mail.

**Auth Required:** Nein

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| email | string (email) | ja |

**Response (200):**

```json
{ "message": "Falls die E-Mail existiert, wurde ein Link gesendet" }
```

**Errors:**

- 400 — Ungültige E-Mail
- 429 — Rate Limit (5/15min)

---

### POST /api/reset-password/[token]

Setzt das Passwort mit einem Reset-Token zurück.

**Auth Required:** Nein (Token-basiert)

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| password | string (min 8) | ja |

**Response (200):**

```json
{ "message": "Passwort zurückgesetzt" }
```

---

### GET /api/verify-email/[token]

Verifiziert die E-Mail-Adresse eines Benutzers.

**Auth Required:** Nein (Token-basiert)

**Response (200):**

```json
{ "message": "E-Mail verifiziert" }
```

**Response (400):**

```json
{ "error": "Ungültiger oder abgelaufener Token" }
```

---

### POST /api/auth/2fa/verify

Verifiziert einen Zwei-Faktor-Authentifizierungs-Code.

**Auth Required:** Ja (während Login-Flow)

**Request Body:**

| Feld | Typ | Erforderlich |
|------|-----|--------------|
| code | string (6 Ziffern) | ja |

**Response (200):**

```json
{ "token": "jwt", "user": { "id": "...", "role": "..." } }
```

---

## Rollen

| Rolle | Beschreibung |
|-------|--------------|
| ADMIN | Vollzugriff |
| COORDINATOR | Koordination, Patienten-Management |
| PHYSICIAN | Ärztliche Funktionen |
| NURSE | Pflegerische Funktionen |
| PATIENT | Patienten-Self-Service |
| CAREGIVER | Betreuungsperson |
| DIALYSIS_STAFF | Dialyse-Mitarbeiter |
