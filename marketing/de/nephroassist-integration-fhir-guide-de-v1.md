# NephroAssist — Integrationsleitfaden / FHIR-Setup (Deutsch — Italien-Markt)

**Task:** t_fa7c7149  
**Datum:** 2026-08-28  
**Autor:** content-writer  
**Sprache:** Deutsch (Referenzversion)  
**Zielmarkt:** Italien  
**Zielgruppe:** Italienische Krankenhaus-IT-Abteilungen  
**Dokumenttyp:** Technische Onboarding-Dokumentation

---

## Einführung

Dieser Leitfaden beschreibt die technische Integration von NephroAssist in die IT-Infrastruktur eines italienischen Krankenhauses. Er richtet sich an IT-Verantwortliche, die mit HL7 FHIR vertraut sind, aber nicht mit den NephroAssist-spezifischen Details.

**Voraussetzungen:**
- HL7 FHIR R4-konformes Krankenhausinformationssystem (HIS)
- SAML 2.0 oder SCIM für Single Sign-On (optional)
- EU-Hosting-Anforderungen (Frankfurt oder Mailand)
- Durchgeführte DPIA (Datenschutz-Folgenabschätzung)

---

## 1. Architektur-Übersicht

```
┌─────────────────────────────────────────┐
│     Krankenhaus-IT (Ihr System)         │
│  ┌─────────────┐    ┌─────────────┐    │
│  │    HIS      │◄──►│  FHIR-Server │   │
│  │  (FSE/Regional)   │              │    │
│  └─────────────┘    └─────────────┘    │
│         │                                │
│         ▼                                │
│  ┌─────────────────────────────────┐   │
│  │   NephroAssist FHIR-Endpunkt    │   │
│  │   (REST API, OAuth 2.0)         │   │
│  └─────────────────────────────────┘   │
│                   │                      │
│                   ▼                      │
│  ┌─────────────────────────────────┐   │
│  │   NephroAssist Cloud (EU)       │   │
│  │   PostgreSQL + Prisma ORM       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Kommunikationsfluss:**
- Das Krankenhaus-System sendet Patientendaten und Termine an NephroAssist über FHIR.
- NephroAssist synchronisiert Aufgaben, Dokumente und Kommunikation zurück.
- Alle Daten verbleiben in der EU (AWS Frankfurt oder Azure EU-West).

---

## 2. FHIR-Endpunkt-Konfiguration

### 2.1 Endpunkt-URL

| Umgebung | URL |
|----------|-----|
| Produktion | `https://api.nephroassist.com/fhir/R4` |
| Staging | `https://staging-api.nephroassist.com/fhir/R4` |

### 2.2 Authentifizierung

NephroAssist verwendet OAuth 2.0 mit Client Credentials:

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=IHR_CLIENT_ID
&client_secret=IHR_CLIENT_SECRET
&scope=fhir/read fhir/write
```

**Antwort:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 2.3 Unterstützte Ressourcen

| Ressource | Operationen | Verwendung |
|-----------|-------------|------------|
| Patient | CREATE, READ, UPDATE | Patientenstammdaten |
| Encounter | CREATE, READ | Termine und Besuche |
| Observation | CREATE, READ | Laborwerte, Vitalzeichen |
| DocumentReference | CREATE, READ | Hochgeladene Dokumente |
| Task | CREATE, READ, UPDATE | Checklisten-Aufgaben |
| Appointment | CREATE, READ, UPDATE | Termine |
| Practitioner | READ | Koordinator- und Arztinformationen |

---

## 3. Webhook-Konfiguration

### 3.1 Webhook-Endpunkte

Registrieren Sie Ihren Webhook-Endpunkt im NephroAssist-Dashboard:

1. Navigieren Sie zu „Integrazioni" → „Webhook".
2. Geben Sie Ihre HTTPS-URL ein.
3. Wählen Sie die Ereignisse:
   - `patient.document.uploaded`
   - `patient.task.completed`
   - `patient.appointment.missed`
   - `patient.evaluation.approved`
4. Speichern Sie und kopieren Sie den Signing-Secret.

### 3.2 Webhook-Format

```json
{
  "event": "patient.task.completed",
  "timestamp": "2026-08-28T14:30:00Z",
  "patientId": "pat-123456",
  "data": {
    "taskId": "task-789",
    "taskName": "Blutuntersuchung",
    "completedAt": "2026-08-28T14:25:00Z"
  },
  "signature": "sha256=..."
}
```

### 3.3 Signatur-Validierung

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

---

## 4. Single Sign-On (SSO)

### 4.1 SAML 2.0

**Metadaten-URL:** `https://api.nephroassist.com/saml/metadata`

**Attribute-Mapping:**

| SAML-Attribut | NephroAssist-Feld | Beschreibung |
|---------------|-------------------|--------------|
| `urn:oid:1.2.840.113549.1.9.1` | email | E-Mail-Adresse des Benutzers |
| `urn:oid:2.5.4.42` | firstName | Vorname |
| `urn:oid:2.5.4.4` | lastName | Nachname |
| `urn:oid:2.5.4.11` | department | Abteilung (z. B. „Nefrologia") |
| `urn:oid:2.5.4.12` | role | Rolle (z. B. „coordinatore", "medico") |

### 4.2 SCIM (optional)

Für automatische Benutzerbereitstellung:

```
GET /scim/v2/Users
POST /scim/v2/Users
PUT /scim/v2/Users/{id}
DELETE /scim/v2/Users/{id}
```

---

## 5. Fehlerbehandlung

### 5.1 Häufige Fehler

| HTTP-Status | Bedeutung | Lösung |
|-------------|-----------|--------|
| 400 | Ungültige Anfrage | FHIR-Ressource auf Validierungsfehler prüfen |
| 401 | Nicht autorisiert | Token erneuern; Client-ID prüfen |
| 403 | Verboten | Berechtigungen prüfen; Scope erweitern |
| 404 | Nicht gefunden | Ressourcen-ID prüfen |
| 409 | Konflikt | Ressource existiert bereits; UPDATE statt CREATE |
| 429 | Zu viele Anfragen | Rate-Limit beachten; 100 Anfragen/Minute |
| 500 | Serverfehler | Support kontaktieren |

### 5.2 Eskalationskontakte

| Problem | Kontakt | Erreichbarkeit |
|---------|---------|----------------|
| Technische Integration | integrations@nephroassist.it | Mo–Fr, 09:00–18:00 CET |
| DPO / Datenschutz | dpo@nephroassist.it | 48h Antwortzeit |
| Notfall (Systemausfall) | +39-xxx-xxxxxxx | 24/7 (Pilotphase) |

---

## 6. Datenlokalisierung und Compliance

- **Hosting:** EU-Region (Frankfurt oder Mailand)
- **Verschlüsselung:** AES-256 in Transit (TLS 1.3) und im Ruhezustand
- **Backup:** Tägliche verschlüsselte Backups in der EU
- **Löschung:** Patientendaten werden nach Beendigung der Behandlung + gesetzliche Aufbewahrungsfrist gelöscht
- **DPIA:** Erhältlich auf Anfrage bei dpo@nephroassist.it

---

*Leitfaden erstellt für NephroAssist. Datum: 2026-08-28*  
*Sprache: Deutsch (Referenz) | Zielmarkt: Italien | Zielgruppe: Krankenhaus-IT*
