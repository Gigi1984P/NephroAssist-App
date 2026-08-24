# Frontend-Komponenten

## Seitenstruktur

### Dashboard Layout (`src/app/dashboard/layout.tsx`)
- Sidebar (links) + Header (oben) + Content
- Enthält `PatientSearch` im Header (nur Klinik)
- Lädt User-Profil und zeigt Navigation

### Untersuchungen (`src/app/dashboard/tasks/page.tsx`)
- Tabelle: Untersuchung + Status
- Top-Level Tasks nur (keine Workflow-Schritte)
- Neue-Untersuchung-Button (nur Klinik)

### Neue Untersuchung (`src/app/dashboard/tasks/new/page.tsx`)
- 2 Modi: Template oder Manuell
- Template-Auswahl gruppiert nach Kategorie
- Manuelle Felder: Titel, Kategorie, Beschreibung
- Patient-Dropdown
- Workflow-Auswahl
- Live-Zusammenfassung

### Untersuchungsdetail (`src/components/task-detail.tsx`)
- Die komplexeste Komponente
- Lädt Task + Workflow-Schritte + User-Rolle
- Schrittweise Freischaltung für Patienten
- Verschiedene UI pro Schritt:
  * Schritt 1: Dropdown + Email-Button
  * Schritt 2+5: Datei-Upload
  * Schritt 3: Kalenderformular
  * Schritt 4: Dropdown + Email-Button
  * Schritt 6: Nur Klinik
- Informationsbox nur für Klinik (links)
- `credentials: "include"` bei allen fetches

### Patientenübersicht (`src/app/dashboard/patients/page.tsx`)
- 5 Spalten: Name | Telefon | Email | Arztbericht | Details
- Suchleiste (Name, Email, Telefon)
- Pagination
- Keine Expandable Rows

### Einstellungen (`src/app/dashboard/settings/page.tsx`)
- Tabs: Profil, Passwort, Präferenzen, Hausarzt
- Hausarzt-Tab nur für Patienten (sonst disabled)
- Formular: Name, Email, Telefon, Adresse, PLZ, Ort

### Templates (`src/app/dashboard/examinations/templates/page.tsx`)
- Gruppiert nach Kategorie
- CRUD: Erstellen, Bearbeiten, Löschen
- Zuweisen-Modal pro Template
- Nur Klinik-Rollen

## Wichtige Komponenten

### Sidebar (`src/components/sidebar.tsx`)
- Resizable (200-400px)
- Items mit Rollen-Filterung
- Mobile Offcanvas-Version
- Untersuchungen hat Unterpunkte

### PatientSearch (`src/components/patient-search.tsx`)
- Im Dashboard-Header (nur Klinik)
- Client-seitige Suche (kein Server-Request pro Tastendruck)
- Dropdown mit Avatar + Kontaktdaten
- Enter selektiert ersten Treffer
- Escape schließt Dropdown

### PageHeader (`src/components/page-header.tsx`)
- Titel + Beschreibung + optionale Action (Button)
- Breadcrumbs (optional)

## Bootstrap 5.3 Konventionen

- Kein Tailwind mehr (entfernt)
- CDN in `app/layout.tsx`
- Custom CSS in `globals.css` ergänzt:
  * `.badge-custom`
  * `.table-custom`
  * `.btn-custom`
  * `.card-header-custom`
  * `.empty-state`
  * `.pagination-custom`

## Wichtige React Patterns

### API-Aufrufe
```typescript
// Immer credentials: "include"
fetch("/api/something", { credentials: "include" })

// Response-Shape behandeln (user vs flat)
const data = await res.json();
const user = data.user || data;
```

### State Management
- Kein Redux/Zustand
- React useState/useEffect
- Daten werden bei Bedarf neu geladen

### Error Handling
- try/catch bei fetch
- Alert-Komponenten für Fehlermeldungen
- Loading-Spinner bei async-Operationen

## Navigation

| Seite | Route | Rollen |
|---|---|---|
| Dashboard | /dashboard | Alle |
| Untersuchungen | /dashboard/tasks | Alle |
| Neue Untersuchung | /dashboard/tasks/new | Klinik |
| Untersuchungsdetail | /dashboard/tasks/[id] | Alle |
| Patienten | /dashboard/patients | Klinik |
| Patienten-Detail | /dashboard/patients/[id] | Klinik |
| Termine | /dashboard/appointments | Alle |
| Dokumente | /dashboard/documents | Alle |
| Einstellungen | /dashboard/settings | Alle |
| Templates | /dashboard/examinations/templates | Klinik |
| Admin | /dashboard/admin | Admin |
