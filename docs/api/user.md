# User API

Benutzerprofil und Kontoeinstellungen.

---

### GET /api/user/profile

Profil des aktuellen Benutzers.

**Auth Required:** Ja

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Max Mustermann",
    "firstName": "Max",
    "lastName": "Mustermann",
    "role": "PATIENT",
    "organizationId": "uuid",
    "phone": "+49123456789",
    "twoFactorEnabled": false,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-06-01T00:00:00Z"
  }
}
```

---

### PUT /api/user/profile

Aktualisiert das Benutzerprofil.

**Auth Required:** Ja

**Request Body:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| firstName | string | Vorname |
| lastName | string | Nachname |
| phone | string | Telefonnummer |

**Response (200):**

```json
{ "user": { "id": "uuid", "firstName": "...", "lastName": "...", "updatedAt": "..." } }
```

---

### PUT /api/user/password

Ändert das Passwort.

**Auth Required:** Ja

**Request Body:**

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|--------------|--------------|
| currentPassword | string | ja | Aktuelles Passwort |
| newPassword | string | ja | Neues Passwort (min. 8 Zeichen) |

**Response (200):**

```json
{ "message": "Passwort erfolgreich geändert" }
```

**Response (400):**

```json
{ "error": "Aktuelles Passwort ist falsch" }
```

**Response (400):**

```json
{ "error": "Neues Passwort muss mindestens 8 Zeichen haben" }
```
