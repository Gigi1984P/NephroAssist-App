# Tagesbericht NephroAssist — 25. August 2026

## Projektstand

- **Repository:** Gigi1984P/NephroAssist-App
- **Branch:** main
- **Letzter Commit:** `8464a3a` feat: Workflow-Tasks für bestehende PatientRequirements migriert
- **Build:** ✅ Sauber (exit 0)
- **Deploy:** https://nephro-assist-app-pied.vercel.app

---

## Heute umgesetzte Features (Chronologisch)

### 1. DB-Cleanup: Spalte `template_set_id` entfernt

**Problem:** Nach dem Entfernen von `templateSetId` aus dem Prisma Schema und `npx prisma db push` existierte die Spalte `template_set_id` in der Produktions-Datenbank weiterhin.

**Fix:**
```sql
ALTER TABLE "requirement_templates" DROP COLUMN IF EXISTS "template_set_id";
```

**Commit:** `6766d94`

---

### 2. TemplateSet-UI: Untersuchungen vollständig anzeigen

**Problem:** In der TemplateSets-Tabelle auf `/dashboard/requirements` wurden Untersuchungen als komprimierte Badges angezeigt — bei vielen Einträgen abgeschnitten.

**Fix:** Statt komprimierter Badges jetzt:
- Anzahl als Badge (z.B. "5 Untersuchungen")
- Jede Untersuchung als eigene `<li>`-Zeile
- Name + Kategorie in Klammern
- Pflicht-Untersuchungen fett gedruckt

**Commit:** `01718b2`

---

### 3. CSS-Fix: Tabelleneinträge sichtbar machen

**Problem:** Die untere Tabelle (Untersuchungen) auf `/dashboard/requirements` zeigte nicht alle Einträge an — Einträge wurden abgeschnitten.

**Fix:**
- `.dashboard-card { overflow: visible }` (statt default hidden)
- `.card-body-custom { overflow-x: auto }` (horizontales Scrollen)

**Commit:** `9fc4e21`

---

### 4. Klinik-Patientendetailseite komplett überarbeitet

**Seite:** `/dashboard/patients/[id]/clinic`

**Vorher:** Nur Patienteninfo (Name, Geburtsdatum, IDs, Dialysezentrum, Coordinator, Transplantationsart, Case-Status, Wartelistenstatus)

**Jetzt — 9 Sektionen:**

#### 4.1 Patient & Fallstatus
- Name + Avatar + E-Mail + Telefon
- Geburtsdatum / Alter
- Patienten-ID + Fall-ID (Monospace)
- Dialysezentrum
- zuständiger Coordinator
- Transplantationsart (Niere/Leber/Herz/Lunge)
- aktueller Case-Status (farbiges Badge)
- Wartelistenstatus
- Fall erstellt
- Hausarzt (falls hinterlegt)

#### 4.2 Readiness / Gesamtfortschritt
- 3 Count-Cards: erfüllt (grün) / offen (gelb) / Listing-Blocker (rot)
- Gesamt-Fortschritt in Prozent
- Alert wenn Listing-Blocker offen
- Gesamt-Label: "Bereit" / "Prüfung erforderlich" / "Nicht bereit"

#### 4.3 Blocker & kritische Punkte
- BLOCKED, EXPIRED, REJECTED Requirements
- Aktive Blocker
- Jeweils mit Verantwortlichem und nächster Aktion
- Rot hinterlegte Alerts

#### 4.4 Next Best Actions
- Priorisiert: kritisch → überfällig → bald fällig → regulär
- Jede Action mit konkretem nächsten Schritt:
  - "Patient informieren und Termin vereinbaren"
  - "Dokument vom Patienten anfordern"
  - "Dokument prüfen und freigeben"
  - etc.

#### 4.5 Anforderungen / Untersuchungen (Matrix)
- Kompakte Tabelle: Name, Kategorie, Status-Badge, Befund, Gültigkeit/Ablaufdatum, Verantwortliche Rolle, offene Tasks
- Sortiert nach Priorität (kritisch zuerst)

#### 4.6 Dokumente & Review-Queue
- Liste mit Filename, Typ, Eingangsdatum, Status-Badge
- Badge "X zur Prüfung" im Header
- Farben: UPLOADED (grau), READY_FOR_REVIEW (gelb), UNDER_REVIEW (gelb), ACCEPTED (grün), REJECTED (rot)

#### 4.7 Termine & Fristen
- Überfällige Tasks (rot)
- Bald ablaufende Requirements (gelb)
- Nächste Termine (blau)

#### 4.8 Kommunikation & Hilfe
- Kontaktinfos: Patient, Dialysezentrum, Coordinator
- Offene Help Requests mit Status-Badge

#### 4.9 Timeline / Audit-Historie
- Chronologisch: Überweisung → Aufnahme → Case eröffnet → Prüfung → Board → Warteliste → Abschluss
- Event-Typ + Zeitstempel

#### Rechte Spalte: Fall-Historie
- Timeline-Visualisierung mit Punkten und Linien
- Daten: Überweisung, Aufnahme, Case eröffnet, Bereit zur Prüfung, Board-Entscheidung, Wartelisteneintrag, Abgeschlossen

**Commit:** `c036048`

---

### 5. Automatische Zuweisung neuer Untersuchungen

**API:** `POST /api/examinations/templates`

**Was passiert jetzt automatisch:**
1. RequirementTemplate wird erstellt
2. Alle Patienten mit aktiven Fällen (Status ≠ CLOSED, ≠ INACTIVE) werden gefunden
3. Für jeden aktiven Fall:
   - `PatientRequirement` wird erzeugt
   - 6 Workflow-Tasks werden erzeugt
   - Schritt 1 startet als `IN_PROGRESS`, Rest als `PENDING`

**Response:**
```json
{
  "template": { ... },
  "assignedToPatients": 5
}
```

**Commit:** `0a55fc0`

---

### 6. Patient bekommt Untersuchungen auf /dashboard/tasks

**Problem:** `/dashboard/tasks` zeigte `Task`-Tabelle, nicht `PatientRequirement`. Patient sah nur manuell erstellte Tasks, nicht die automatisch zugewiesenen Untersuchungen.

**Lösung:**
- Neue API: `GET /api/patient-requirements`
- `/dashboard/tasks/page.tsx` komplett umgebaut
- Zeigt jetzt alle zugewiesenen `PatientRequirement`-Einträge

**Anzeige pro Untersuchung:**
- Untersuchungsname (mit patientFriendlyDescription)
- Status-Badge mit Icon
- Kategorie + Pflicht-Indikator
- Ablaufdatum mit Ampel (rot=abgelaufen, gelb=läuft bald ab)
- Anzahl offener Tasks
- Blocker-Badge

**Commit:** `f63f5e4`

---

### 7. Klinik-Patientendetails bearbeiten & löschen

**API:** `GET / PUT / DELETE /api/patients/[id]`

**Zugriff:** Nur Klinik-Rollen (ADMIN, COORDINATOR, PHYSICIAN, NURSE)

**Bearbeiten-Modal:**
- Vorname, Nachname, Geburtsdatum
- Telefon, E-Mail
- Hausarzt: Name, Stadt, E-Mail, Telefon

**Löschen-Modal:**
- Bestätigung mit Patientenname
- Warnung: "Alle zugehörigen Daten werden gelöscht"
- Nach Löschung: Redirect zu `/dashboard/patients`

**Commit:** `5944f0f`

---

### 8. 6-Schritte-Workflow für bestehende Patienten migriert

**Problem:** Vorhandene PatientRequirements (erstellt vor dem Workflow-Feature) hatten keine Workflow-Tasks.

**Migration:**
- Script: `scripts/migrate-workflows.js`
- 23 bestehende PatientRequirements gefunden
- 138 neue Workflow-Tasks erzeugt (23 × 6)

**Die 6 Schritte:**

| # | Name | Owner | Beschreibung |
|---|---|---|---|
| 1 | Überweisung einholen | PATIENT | Hausarzt-Überweisung anfordern |
| 2 | Termin vereinbaren | PATIENT | Facharzt-Termin vereinbaren |
| 3 | Untersuchung durchführen | PATIENT | Untersuchung beim Facharzt |
| 4 | Befund/Bericht hochladen | PATIENT | Dokumente hochladen |
| 5 | Dokument prüfen | TRANSPLANT_CENTER | Prüfung durch Klinik |
| 6 | Freigabe durch Transplantationszentrum | TRANSPLANT_CENTER | Abschluss und Freigabe |

**Berechtigungen:**
- Schritte 1-4: Nur Patient/Caregiver können erledigen
- Schritte 5-6: Nur Klinik (ADMIN/COORDINATOR/PHYSICIAN/NURSE)

**Wenn Schritt erledigt:**
- Nächster Schritt wird automatisch auf `IN_PROGRESS` gesetzt
- Timeline-Event wird erzeugt
- Notification für Patient

**Wenn Schritt 6 erledigt:**
- `PatientRequirement.status` → `ACCEPTED`

**Commit:** `8464a3a`

---

## Dateien, die heute geändert wurden

| Datei | Änderung |
|---|---|
| `src/app/api/examinations/templates/route.ts` | Automatische Zuweisung + 6 Workflow-Tasks |
| `src/app/api/patient-requirements/route.ts` | **Neu:** API für Patient-Requirements |
| `src/app/api/patients/[id]/route.ts` | **Neu:** GET/PUT/DELETE für Patienten |
| `src/app/api/tasks/[id]/route.ts` | Berechtigungs-Check für Workflow-Schritte |
| `src/app/dashboard/patients/[id]/clinic/page.tsx` | Komplette Überarbeitung (9 Sektionen) |
| `src/app/dashboard/requirements/page.tsx` | Untersuchungen als Aufzählungsliste |
| `src/app/dashboard/tasks/page.tsx` | Zeigt jetzt PatientRequirements |
| `src/app/globals.css` | overflow:visible + overflow-x:auto |
| `scripts/migrate-workflows.js` | **Neu:** Migration für bestehende Daten |

---

## Offene Themen für morgen

### 1. Patient sieht auf /dashboard/tasks keine Workflow-Schritte
Die Patienten-Übersicht zeigt zwar die Untersuchungen, aber nicht die 6 einzelnen Workflow-Schritte pro Untersuchung. Der Patient muss auf `/dashboard/tasks/[id]` klicken, um die Schritte zu sehen.

**Mögliche Erweiterung:**
- Auf `/dashboard/tasks` eine Expandable-Card pro Untersuchung mit den 6 Schritten
- Oder direkt auf `/dashboard/tasks/[id]` verlinken

### 2. RequirementStatus-Enum vs. UI-Badges Diskrepanz
- **Enum in DB:** ACCEPTED, DECLINED, WAIVED, PENDING, NOT_APPLICABLE (5 Werte)
- **UI zeigt:** NOT_STARTED, ACTION_REQUIRED, IN_PROGRESS, WAITING_FOR_APPOINTMENT, WAITING_FOR_DOCUMENT, DOCUMENT_UPLOADED, UNDER_REVIEW, BLOCKED, EXPIRED, RENEWAL_NEEDED (14 Werte)
- **Problem:** Die meisten Badges werden nie angezeigt, weil der DB-Status nicht passt
- **Lösung:** Enum erweitern ODER UI an bestehende Enum-Werte anpassen

### 3. Klinik-Patientendetailseite — Daten-Optimierung
- Die Seite lädt alle Daten via `fetch`, aber einige Relationen (Coordinator, Program) sind im API-Response enthalten
- Die Patienten-Info-Karte zeigt alle Daten korrekt
- Die anderen Sektionen (Readiness, Blocker, etc.) zeigen aktuell nur Platzhalter, weil die API noch nicht alle Daten zurückgibt

### 4. TemplateSets vs. RequirementTemplates — Doppelung
- TemplateSets speichern Untersuchungen als JSON in `items`
- RequirementTemplates sind eigenständige Einzel-Untersuchungen
- Es gibt keine Verbindung mehr zwischen beiden
- Die Klinik erstellt RequirementTemplates (einzeln), nicht TemplateSets
- TemplateSets sind aktuell nicht im aktiven Workflow

---

## Wichtige Commands

```bash
# Projekt
$ cd /opt/data/projects/nephroassist

# Build
$ npm run build

# Prisma
$ npx prisma db push --accept-data-loss
$ npx prisma generate

# DB direkt
$ DB_URL=$(grep DATABASE_URL .env | sed 's/DATABASE_URL=//' | tr -d '"')
$ npx prisma db execute --url="$DB_URL" --stdin <<< 'SQL...'

# Git
$ git add -A && git commit -m "..." && git push origin main --force-with-lease
```

---

## Schema-Übersicht (relevante Modelle)

```
RequirementTemplate
  id, name, category, description, required, listingBlocker
  validityDuration, renewalLeadTime, patientFriendlyDescription

TemplateSet
  id, name, description, items Json?, version

PatientRequirement
  id, caseId, templateId, title, category, status
  required, listingBlocker, responsibleRole, priority
  expiresAt, completedAt

Task (Workflow-Schritte)
  id, requirementId, caseId, patientId, title, description
  status (PENDING/IN_PROGRESS/COMPLETED/CANCELLED/OVERDUE)
  isWorkflowStep, stepNumber, stepName, stepDescription
  ownerType (PATIENT/CAREGIVER/DIALYSIS_CENTER/TRANSPLANT_CENTER/EXTERNAL_PROVIDER/SYSTEM)

Patient
  id, firstName, lastName, dateOfBirth, email, phone
  generalPractitionerName, generalPractitionerEmail
  generalPractitionerPhone, generalPractitionerCity
```

---

## Letzte 5 Commits

```
8464a3a feat: Workflow-Tasks für bestehende PatientRequirements migriert
5944f0f feat: Klinik-Patientendetailseite mit Bearbeiten & Löschen
f63f5e4 feat: Patient bekommt Untersuchungen aus Anforderungen automatisch angezeigt
0a55fc0 feat: Neue Untersuchungen automatisch allen Patienten mit aktiven Fällen zuweisen
c036048 feat: Klinik-Patientendetailseite vollständig überarbeitet mit 9 Sektionen
```
