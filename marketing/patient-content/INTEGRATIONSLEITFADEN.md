# NephroAssist Patienten-Content — Integrationsleitfaden

## Dateien im Paket

| Datei | Format | Inhalt | Verwendung |
|-------|--------|--------|------------|
| `nephroassist-patienten-content-transplantationsreise.md` | Markdown | Vollständiger Content-Überblick, master-Dokument | Review, Dokumentation, Handoff |
| `educational-modules.json` | JSON | Strukturierte Bildungsmodule für 6 Phasen | CMS-Import, Learning-Management-System |
| `requirement-templates-patient-friendly.json` | JSON | Patienten-freundliche Beschreibungen für Requirement-Templates | Datenbank-Seed, Template-Aktualisierung |
| `notification-copy.json` | JSON | Alle In-App-Benachrichtigungen und Erinnerungen | Notification-Service, Push/SMS/E-Mail |
| `faq-content.json` | JSON | 30 FAQs mit Kategorien und Verknüpfungen | FAQ-Seite, Suchindex, Chatbot-Wissensbasis |

## Sprache und Zielgruppe

- **Sprache:** Deutsch (de-DE)
- **Zielgruppe:** Nierentransplantationspatienten und ihre Angehörigen
- **Ton:** Ein fühlend, klar, ermutigend, medizinisch fundiert aber verständlich
- **Disclaimer:** Alle Inhalte sind informational. Keine medizinische Beratung.

## Datenmodell-Abgleich

### Phasen-Mapping (Business Strategy ↔ App Data Model)

| Kanonische Phase | CaseStatus (App) | Bildungsmodul |
|------------------|------------------|---------------|
| 1. Transplantation in Erwägung ziehen | — (vor Aufnahme) | `edu-001` |
| 2. Ein Zentrum finden | `REFERRAL` → `INTAKE` | `edu-002` |
| 3. Evaluation / Auf die Warteliste | `EVALUATION` → `READY_FOR_REVIEW` → `APPROVED` | `edu-003` |
| 4. Wartezeit | `WAITLISTED` | `edu-004` |
| 5. Organangebot und Entscheidung | `TRANSPLANTED` (vor OP) | `edu-005` |
| 6. Nach der Transplantation | `TRANSPLANTED` (nach OP) | `edu-006` |

### RequirementTemplate Mapping

Die `requirement-templates-patient-friendly.json` enthält 20 Templates, die auf bestehende `RequirementTemplate` Felder in Prisma gemappt werden können:

```
patientFriendlyDescription → RequirementTemplate.patientFriendlyDescription
name → RequirementTemplate.name
category → RequirementTemplate.category
phase → CaseStatus (Logik-Layer)
responsibleRole → RequirementTemplate.responsibleRole
listingBlocker → RequirementTemplate.listingBlocker
validityDurationMonths → RequirementTemplate.validityDuration
renewalLeadTimeDays → RequirementTemplate.renewalLeadTime
```

### Notification Mapping

Die `notification-copy.json` enthält Nachrichten für alle `NotificationType` Enums der App:

- `TASK` → requirementReminders, phaseNotifications
- `APPOINTMENT` → appointmentReminders
- `DOCUMENT` → documentNotifications
- `REVIEW` → requirementReminders.accepted/rejected
- `MESSAGE` → generalNotifications.helpRequestResponse
- `RENEWAL` → requirementReminders.expiresSoon/expired
- `HELP_REQUEST` → blockerNotifications
- `SYSTEM` → generalNotifications.systemMaintenance

## Import-Empfehlungen

### 1. Seed-Skript (Prisma)

Erweitern Sie `prisma/seed.ts` um die patienten-freundlichen Beschreibungen:

```typescript
import patientFriendlyDescriptions from "../../marketing/patient-content/requirement-templates-patient-friendly.json";

// Beim Erstellen von RequirementTemplates:
for (const tmpl of patientFriendlyDescriptions.templates) {
  await prisma.requirementTemplate.create({
    data: {
      name: tmpl.name,
      category: tmpl.category,
      patientFriendlyDescription: tmpl.patientFriendlyDescription,
      required: true,
      listingBlocker: tmpl.listingBlocker,
      // ...
    }
  });
}
```

### 2. CMS / Content-Management

Die Bildungsmodule und FAQs können in eine CMS-Tabelle importiert werden:

```sql
CREATE TABLE educational_modules (
  id UUID PRIMARY KEY,
  phase VARCHAR(50),
  title VARCHAR(255),
  content JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE faq_items (
  id UUID PRIMARY KEY,
  category VARCHAR(100),
  question TEXT,
  answer TEXT,
  related_requirement_ids TEXT[],
  related_phase VARCHAR(50),
  priority INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false
);
```

### 3. Notification-Service

Die Notification-Copy kann als Template-Engine geladen werden:

```typescript
import notificationCopy from "../../marketing/patient-content/notification-copy.json";

function renderNotification(type: string, key: string, variables: Record<string, string>) {
  const template = notificationCopy[type]?.[key];
  if (!template) return null;
  let body = template.body;
  for (const [k, v] of Object.entries(variables)) {
    body = body.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return { title: template.title, body, actionLabel: template.actionLabel };
}
```

## Wartung und Aktualisierung

- **Medizinische Genauigkeit:** Alle Inhalte basieren auf etablierten Transplantationspraktiken (SRTR/OPTN, WHO, Eurotransplant). Bei Änderungen der klinischen Leitlinien sollte ein medizinischer Fachberater die Inhalte prüfen.
- **Lokalisierung:** Die Inhalte sind auf Deutsch. Bei EU-Expansion müssen sie in weitere Sprachen übersetzt werden.
- **Compliance:** Alle Inhalte enthalten Disclaimer, dass sie keine medizinische Beratung ersetzen. Dies ist wichtig für die FDA-/DiGA-Klassifizierung.

## Dateipfade

Alle Dateien befinden sich in:
```
/opt/data/projects/nephroassist/marketing/patient-content/
```

*Erstellt für Kanban-Task t_bbfeef62 — Content Writer*
