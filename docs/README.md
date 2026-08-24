# NephroAssist - Projektdokumentation

## Überblick

NephroAssist ist eine Next.js-basierte Webanwendung für die Verwaltung von Patienten und deren Untersuchungen im Kontext von Transplantationszentren. Die App verwendet ein schrittweises Workflow-System, bei dem Patienten Untersuchungen Schritt für Schritt durchlaufen und die Klinik die Fortschritte überwachen kann.

**Tech Stack:**
- Next.js 16 (App Router)
- React 19 + TypeScript
- Prisma ORM + PostgreSQL
- Bootstrap 5.3 (via CDN)
- Custom JWT Auth (jose)

**Deployment:**
- Vercel: `nephro-assist-app-pied.vercel.app`
- DB: PostgreSQL auf `m22p.your-database.de`
- GitHub: `Gigi1984P/NephroAssist-App`

---

## Inhalt

1. [Architektur](architecture.md)
2. [Datenbank](database.md)
3. [API-Endpunkte](api.md)
4. [Workflow-System](workflows.md)
5. [Frontend-Komponenten](frontend.md)
6. [Rollen & Berechtigungen](roles-permissions.md)
7. [Deployment](deployment.md)

---

## Kurzübersicht der Features

### Für Patienten
- Login mit E-Mail/Passwort
- Übersicht aller zugewiesenen Untersuchungen
- Schrittweiser Workflow (nur Schritt 1 aktiv, restlich gesperrt bis Vorgänger erledigt)
- Hausarzt-Daten im Profil hinterlegen
- Termindaten eintragen (Datum, Uhrzeit, Arzt, Ort, Email, Telefon, Fax)
- Dokumente hochladen (simuliert)
- Email-Anfragen an Hausarzt/Facharzt (simuliert)

### Für Klinik-Mitarbeiter
- Patientenübersicht (Name, Telefon, Email, Bericht-Status, Details-Button)
- Globale Patientensuche im Header
- Neue Untersuchungen zuweisen (Template-basiert oder manuell)
- Schritt 6 (Prüfung) direkt abnehmen
- Template-Verwaltung (erstellen, bearbeiten, löschen)
- Dashboard mit Statistiken

### Workflow (6 Schritte)
1. Überweisung anfordern (Email an Hausarzt, nur wenn GP-Email hinterlegt)
2. Verordnung hochladen
3. Termin vereinbaren (mit Facharzt-Kontaktdaten)
4. Bericht anfordern (Email an Facharzt, nur wenn Email aus Schritt 3 vorhanden)
5. Bericht hochladen
6. Prüfung durch Transplantationszentrum (nur Klinik)

---

## Wichtige Konventionen

### API-Response Shape
Wenn das Frontend `/api/user/profile` oder ähnliche Endpunkte aufruft, kann die Response entweder `{ user: {...} }` oder `{ ...data }` (flat) sein. **Immer beide Formen behandeln:**

```typescript
const data = await res.json();
const user = data.user || data;
```

### Fetch mit Cookies
Im Browser muss `fetch()` immer mit `credentials: "include"` aufgerufen werden, damit Cookies (JWT) mitgesendet werden:

```typescript
const res = await fetch("/api/something", { credentials: "include" });
```

### Next.js 16 params
`params` in Server Components ist ein **Promise**. Immer `await params` verwenden:

```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
```

### Build-Prozess
- `npm run build` für Production-Build
- Keine Dev-Server starten (User will direkten Build + Push)
- Alle Änderungen committen und pushen
- Vercel deployt automatisch

---

## Demo-Credentials

Alle Passwörter: `Test1234!`

| Rolle | Email |
|---|---|
| Admin | admin@nephroassist.de |
| Koordinator | koordinator@nephroassist.de |
| Arzt | arzt@nephroassist.de |
| Patient | patient@beispiel.de |
| Dialyse | dialyse@nephroassist.de |
| Transplantation | transplant@nephroassist.de |
| Pflege | pflege@nephroassist.de |

---

## Dateistruktur (wichtige Dateien)

```
src/
├── app/
│   ├── api/
│   │   ├── login/route.ts              # Login (custom JWT)
│   │   ├── user/profile/route.ts        # User-Profil
│   │   ├── tasks/route.ts              # Alle Tasks (Top-Level)
│   │   ├── tasks/[id]/route.ts         # Task CRUD
│   │   ├── tasks/[id]/workflow/route.ts  # Workflow-Schritte
│   │   ├── tasks/[id]/referral/route.ts  # Hausarzt-Email (Schritt 1)
│   │   ├── tasks/[id]/report-request/route.ts  # Bericht-Email (Schritt 4)
│   │   ├── tasks/[id]/review/route.ts  # Schritt 6 abnehmen
│   │   ├── patients/me/route.ts        # Eigenes Patientenprofil (Hausarzt)
│   │   ├── patients/route.ts            # Patientenliste
│   │   ├── patients/overview/route.ts  # Patienten mit Status + Dokumenten
│   │   └── examinations/
│   │       ├── templates/route.ts      # Templates CRUD
│   │       ├── templates/[id]/route.ts # Template Update/Delete
│   │       └── assign/route.ts         # Untersuchung zuweisen
│   ├── dashboard/
│   │   ├── layout.tsx                   # Dashboard-Layout mit Header + Sidebar
│   │   ├── page.tsx                     # Dashboard-Startseite
│   │   ├── tasks/page.tsx               # Untersuchungsübersicht
│   │   ├── tasks/new/page.tsx           # Neue Untersuchung erstellen
│   │   ├── patients/page.tsx            # Patientenübersicht (Klinik)
│   │   ├── settings/page.tsx            # Einstellungen (Hausarzt-Tab)
│   │   └── examinations/
│   │       └── templates/page.tsx       # Templates verwalten
│   └── login/page.tsx                   # Login-Seite
├── components/
│   ├── sidebar.tsx                      # Sidebar Navigation
│   ├── patient-search.tsx              # Header-Suchkomponente
│   ├── task-detail.tsx                  # Untersuchungsdetailseite
│   └── page-header.tsx                  # Seitenkopf
├── lib/
│   ├── auth.ts                          # Custom JWT Auth (jose)
│   ├── prisma.ts                        # Prisma Client (mit URL-Encoding)
│   ├── permissions.ts                   # Zentrale Permissions
│   └── workflows.ts                   # Workflow-Definitionen
├── app/globals.css                      # Bootstrap 5.3 + Custom Styles
└── middleware.ts                        # Auth Middleware (JWT verify)
```

---

## Letzter bekannter Zustand

**Branch:** main
**Build:** Sauber
**DB:** Production-DB mit `Task.metadata` (Json) und `Patient`-Hausarzt-Feldern
**Auth:** Custom JWT stabil, `credentials: "include"` in allen fetch-Calls

**Offene Punkte (letzter Stand):**
- Reports API HTTP 500 (patient_cases Abfrage) - noch nicht behoben
- Browser-Automatisierung nicht nutzbar (DBus-Fehler)

**Implementierte Features (vollständig):**
- Auth (Custom JWT, Login, Logout)
- Bootstrap 5.3 Migration (Tailwind entfernt)
- Workflow-System (6 Schritte, sequentielle Freischaltung)
- Upload-Simulation (Schritt 2 + 5)
- Terminvereinbarung (Schritt 3 mit Kalenderformular)
- Hausarzt-Email-Anbindung (Schritt 1)
- Facharzt-Email für Berichtsanforderung (Schritt 4)
- Schritt-6-Sperre (nur Klinik)
- Informationsbox nur für Klinik
- Top-Level Tasks als Übersicht
- Hausarzt-Daten im Patientenprofil
- Template-Verwaltung für Klinik
- Untersuchungszuweisung (Template oder manuell)
- Vereinfachte Patientenübersicht (5 Spalten)
- Globale Patientensuche im Header
- Schritt-6-Abnahme direkt aus Patientenübersicht
