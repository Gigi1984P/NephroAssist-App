# Workflow-System

## Konzept

Jede Untersuchung hat 6 Schritte (Workflow). Der Patient kann nur **einen Schritt nach dem anderen** bearbeiten. Schritt 1 ist immer aktiv, Schritte 2-6 sind gesperrt bis der Vorgänger auf COMPLETED gesetzt wird.

## Workflow-Definitionen

### Dental Clearance (`dental-clearance`)
```
1. Überweisung anfordern          → actionType: patient_status
2. Verordnung hochladen           → actionType: patient_upload
3. Zahnarzttermin vereinbaren     → actionType: patient_status (Terminformular)
4. Bericht anfordern              → actionType: patient_status
5. Bericht hochladen              → actionType: patient_upload
6. Prüfung durch Transplantationszentrum → actionType: clinic_review
```

### Herz-Kreislauf Clearance (`cardiac-clearance`)
```
1. Überweisung anfordern          → actionType: patient_status
2. Verordnung hochladen           → actionType: patient_upload
3. Kardiologentermin vereinbaren  → actionType: patient_status (Terminformular)
4. Bericht anfordern              → actionType: patient_status
5. Bericht hochladen              → actionType: patient_upload
6. Prüfung durch Transplantationszentrum → actionType: clinic_review
```

## actionType Erklärung

| actionType | Beschreibung | Wer darf? |
|---|---|---|
| `patient_status` | Dropdown zum Status ändern | Patient, Caregiver |
| `patient_upload` | Datei-Input (simuliert) | Patient, Caregiver |
| `clinic_review` | Nur Klinik darf erledigen | Admin, Coordinator, Physician, Nurse, Dialysis |

## Sequentielle Freischaltung (Frontend)

```typescript
// getStepAccess: Schritt ist aktiv nur wenn Vorgänger COMPLETED
function getStepAccess(step, index) {
  if (step.status === "COMPLETED") return "completed";
  if (index === 0) return "active"; // Erster Schritt immer aktiv
  const prevStep = sortedSteps[index - 1];
  if (prevStep?.status === "COMPLETED") return "active";
  return "locked";
}
```

**Für Patienten:**
- Aktiver Schritt: Dropdown/Formular sichtbar
- Gesperrter Schritt: Graue Box, "🔒 Bitte schließen Sie zuerst Schritt X ab"
- Erledigter Schritt: Grüner Hintergrund, Info-Anzeige

**Für Klinik:** Alle Schritte immer bearbeitbar (keine Sperre).

## Datenmodell

```
PatientRequirement (Top-Level)
├── Task (Top-Level, isWorkflowStep: false)
│   └── Titel: "Dental Clearance"
│
└── Tasks (Workflow-Schritte, isWorkflowStep: true)
    ├── stepNumber: 1, status: IN_PROGRESS
    ├── stepNumber: 2, status: PENDING
    ├── stepNumber: 3, status: PENDING
    ├── stepNumber: 4, status: PENDING
    ├── stepNumber: 5, status: PENDING
    └── stepNumber: 6, status: PENDING
```

## Spezielle Features pro Schritt

### Schritt 1: Überweisung anfordern
- Dropdown für manuelle Status-Änderung (immer sichtbar)
- "An Hausarzt senden"-Button nur wenn `generalPractitionerEmail` gesetzt
- Wenn kein Hausarzt: Hinweis + Link zu Settings

### Schritt 2 & 5: Upload
- Datei-Input statt Dropdown
- Simuliert: Datei-Auswahl → automatisch COMPLETED
- Kein echter Server-Upload

### Schritt 3: Termin vereinbaren
- Kalenderformular: Datum, Uhrzeit, Arztname, Ort
- **Optional:** Email, Telefon, Fax des Facharztes
- Speichert JSON in `task.metadata`
- Erledigt-Anzeige zeigt alle Kontaktdaten

### Schritt 4: Bericht anfordern
- Dropdown + "Bericht per Email anfordern"
- Button nur wenn Facharzt-Email aus Schritt 3 vorhanden
- Liest Email aus `previousStep.metadata.doctorEmail`

### Schritt 6: Prüfung durch Klinik
- **Nur Klinik-Rollen** dürfen Status ändern
- Patienten sehen Info-Box mit 🔒 statt Dropdown
- API gibt 403 wenn nicht berechtigt

## Zustände

| Status | Bedeutung | Farbe |
|---|---|---|
| PENDING | Ausstehend | Grau |
| IN_PROGRESS | In Bearbeitung | Blau |
| COMPLETED | Erledigt | Grün |

## Metadaten-Struktur (Schritt 3)

```json
{
  "appointment": {
    "date": "2026-08-25",
    "time": "14:30",
    "doctorName": "Dr. Müller",
    "doctorEmail": "dr@kardiologie.de",
    "doctorPhone": "030 98765432",
    "doctorFax": "030 98765433",
    "location": "Uniklinik Musterstadt"
  }
}
```

## Erstellung eines Workflows

Wenn Klinik eine Untersuchung zuweist (`POST /api/examinations/assign`):

1. `PatientRequirement` erstellen
2. Top-Level `Task` erstellen (isWorkflowStep: false)
3. 6 Workflow-Tasks erstellen (isWorkflowStep: true):
   - stepNumber 1: status = IN_PROGRESS
   - stepNumber 2-6: status = PENDING
   - previousStepId verknüpft
4. Automatisch in Patienten-Übersicht sichtbar
