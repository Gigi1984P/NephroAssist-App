# NephroAssist — Guida all'Integrazione e Configurazione FHIR (Italiano)

**Task:** t_631bdd6b  
**Date:** 2026-08-28  
**Author:** content-writer  
**Language:** Italiano  
**Target Audience:** Responsabili IT ospedalieri, sistemisti, tecnici sanitari italiani  
**Document Type:** Clinical / Professional — Technical integration guide

---

## 1. Panoramica dell'architettura

NephroAssist si integra con il sistema informativo ospedaliero (OIS) tramite lo standard HL7 FHIR (Fast Healthcare Interoperability Resources). L'integrazione consente:

- Sincronizzazione anagrafica pazienti
- Ricezione di referti di laboratorio
- Esportazione dati per il CNT
- Single Sign-On (SSO) tramite SAML 2.0

### Schema dell'architettura

```
[ Sistema Informativo Ospedaliero ]
         |
    [ HL7 FHIR R4 ]
         |
[ NephroAssist Gateway ]
         |
    [ API REST ]
         |
    [ NephroAssist Cloud ]
```

---

## 2. Requisiti di sistema

| Componente | Requisito |
|------------|-----------|
| Protocollo | HTTPS TLS 1.3 |
| Standard FHIR | HL7 FHIR R4 |
| Formato dati | JSON |
| Codifica | UTF-8 |
| Hosting dati | UE (Francoforte o Milano) |

---

## 3. Configurazione endpoint FHIR

### 3.1 Endpoint NephroAssist

- **URL base:** `https://api.nephroassist.it/fhir/R4`
- **Metodi supportati:** GET, POST, PUT, DELETE
- **Autenticazione:** OAuth 2.0 con JWT Bearer Token

### 3.2 Ottenere le credenziali API

1. Acceda alla console amministratore: `https://admin.nephroassist.it`
2. Vada su «Integrazioni» → «Credenziali API»
3. Generi una nuova coppia di chiavi:
   - `client_id`
   - `client_secret`
4. Conservi il `client_secret` in modo sicuro — non può essere recuperato.

### 3.3 Ottenere il token di accesso

```bash
curl -X POST https://api.nephroassist.it/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=IL_SUO_CLIENT_ID" \
  -d "client_secret=IL_SUO_CLIENT_SECRET" \
  -d "scope=fhir/read fhir/write"
```

Risposta:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## 4. Risorse FHIR supportate

### 4.1 Patient (Paziente)

**Operazioni:** READ, CREATE, UPDATE

**Esempio — Creare un paziente:**
```json
{
  "resourceType": "Patient",
  "identifier": [
    {
      "system": "http://hl7.it/sid/codiceFiscale",
      "value": "RSSMRA85T10A562S"
    }
  ],
  "name": [
    {
      "family": "Rossi",
      "given": ["Mario"]
    }
  ],
  "gender": "male",
  "birthDate": "1985-12-10",
  "telecom": [
    {
      "system": "phone",
      "value": "+39 333 1234567",
      "use": "mobile"
    }
  ]
}
```

### 4.2 Observation (Rilevazione / Referto)

**Operazioni:** READ, CREATE

**Esempio — Caricare un esame del sangue (creatinina):**
```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "laboratory"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "2160-0",
        "display": "Creatinine [Mass/volume] in Serum or Plasma"
      }
    ]
  },
  "subject": {
    "reference": "Patient/RSSMRA85T10A562S"
  },
  "effectiveDateTime": "2026-08-15T08:30:00+02:00",
  "valueQuantity": {
    "value": 1,2,
    "unit": "mg/dL",
    "system": "http://unitsofmeasure.org",
    "code": "mg/dL"
  }
}
```

**Nota:** per i valori numerici italiani, utilizzi la virgola decimale (1,2) nel contenuto FHIR. Il sistema la gestisce internamente.

### 4.3 Encounter (Visita / Contatto)

**Operazioni:** READ, CREATE

**Esempio — Registrare un appuntamento:**
```json
{
  "resourceType": "Encounter",
  "status": "finished",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB"
  },
  "subject": {
    "reference": "Patient/RSSMRA85T10A562S"
  },
  "period": {
    "start": "2026-08-20T09:00:00+02:00",
    "end": "2026-08-20T10:00:00+02:00"
  },
  "reasonCode": [
    {
      "text": "Visita di controllo pre-trapianto"
    }
  ]
}
```

### 4.4 DocumentReference (Documento)

**Operazioni:** READ, CREATE

Per i documenti PDF caricati dai pazienti:
```json
{
  "resourceType": "DocumentReference",
  "status": "current",
  "docStatus": "preliminary",
  "type": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "11506-3",
        "display": "Provider-unspecified progress note"
      }
    ]
  },
  "subject": {
    "reference": "Patient/RSSMRA85T10A562S"
  },
  "content": [
    {
      "attachment": {
        "contentType": "application/pdf",
        "url": "https://api.nephroassist.it/documents/abc123"
      }
    }
  ]
}
```

---

## 5. Webhook

### 5.1 Configurare i webhook

NephroAssist può inviare notifiche in tempo reale al suo sistema quando si verificano eventi.

1. Vada su «Integrazioni» → «Webhook» nella console amministratore
2. Aggiunga un endpoint:
   - **URL:** il suo endpoint HTTPS
   - **Eventi:** selezioni quelli desiderati
   - **Segreto:** per verificare l'autenticità delle chiamate

### 5.2 Eventi disponibili

| Evento | Descrizione |
|--------|-------------|
| `patient.created` | Nuovo paziente aggiunto |
| `patient.phase_changed` | Paziente cambiato di fase |
| `document.uploaded` | Documento caricato dal paziente |
| `document.reviewed` | Documento approvato o rifiutato |
| `task.completed` | Attività completata dal paziente |
| `appointment.missed` | Appuntamento perso |

### 5.3 Verifica della firma del webhook

Ogni webhook include un header `X-NephroAssist-Signature`. Verifichi la firma HMAC-SHA256 con il segreto condiviso.

---

## 6. Single Sign-On (SSO)

### 6.1 Configurazione SAML 2.0

NephroAssist supporta SSO tramite SAML 2.0 con il suo identity provider ospedaliero.

**Metadati SAML NephroAssist:**
- URL: `https://api.nephroassist.it/saml/metadata`

**Attributi richiesti:**

| Attributo SAML | Descrizione | Obbligatorio |
|----------------|-------------|--------------|
| `urn:oid:1.2.840.113549.1.9.1` (emailAddress) | E-mail istituzionale | Sì |
| `urn:oid:2.5.4.42` (givenName) | Nome | Sì |
| `urn:oid:2.5.4.4` (sn) | Cognome | Sì |
| `urn:oid:2.5.4.11` (ou) | Unità organizzativa (es. «Nefrologia») | No |

### 6.2 Configurazione SCIM (opzionale)

Per la sincronizzazione automatica degli utenti:
- Endpoint: `https://api.nephroassist.it/scim/v2`
- Autenticazione: Bearer Token

---

## 7. Gestione degli errori

### 7.1 Codici di errore comuni

| Codice HTTP | Significato | Azione consigliata |
|-------------|-------------|-------------------|
| 400 | Richiesta malformata | Verifichi il formato JSON |
| 401 | Non autenticato | Rigeneri il token OAuth |
| 403 | Non autorizzato | Verifichi i permessi del client |
| 404 | Risorsa non trovata | Verifichi l'ID della risorsa |
| 409 | Conflitto (es. paziente già esistente) | Verifichi se il paziente esiste già |
| 422 | Dati non validi | Verifichi i valori FHIR |
| 429 | Troppe richieste | Attenda prima di riprovare |
| 500 | Errore del server | Contatti il supporto NephroAssist |

### 7.2 Log di audit

Tutte le chiamate API sono registrate nei log di audit. Può scaricarli dalla console amministratore:
«Integrazioni» → «Log API» → Selezioni il periodo → «Esporta CSV»

---

## 8. Contatti e escalation

| Tipo di problema | Contatto | Tempo di risposta |
|------------------|----------|-------------------|
| Problemi tecnici di integrazione | supporto-tecnico@nephroassist.it | 4 ore lavorative |
| Problemi di sicurezza | security@nephroassist.it | 1 ora (24/7) |
| Richieste di funzionalità | product@nephroassist.it | 24 ore lavorative |

---

## 9. Checklist di configurazione

- [ ] Credenziali API generate e conservate in modo sicuro
- [ ] Endpoint FHIR testato con chiamata di prova
- [ ] Autenticazione OAuth configurata e testata
- [ ] Webhook configurati e verificati
- [ ] SSO SAML configurato (se applicabile)
- [ ] SCIM configurato (se applicabile)
- [ ] Log di audit abilitati
- [ ] Piano di disaster recovery documentato
- [ ] DPO informato dell'integrazione

---

*Documento creato per NephroAssist — Guida all'integrazione FHIR. Data: 2026-08-28*
*Lingua: Italiano | Destinatario: Responsabili IT ospedalieri italiani*
