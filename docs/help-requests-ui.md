# Help Requests UI — Implementierungsdokumentation

## Ziel
Übersichtsseite für Hilfeanfragen (Help Requests) erstellen, sowie Hilfe-Button auf Task-Detailseite. Zusätzlich Sidebar-Menüpunkt für Klinik-Rollen.

## Bereits erledigt

### 1. API-Route: `src/app/api/help-requests/route.ts`
- **GET**: Gibt für Klinik-Rollen (ADMIN, COORDINATOR, PHYSICIAN, NURSE) alle offenen HelpRequests (`status: OPEN, IN_PROGRESS`) zurück, inkl. Patient-Name und Case-Status. Für Patient/Caregiver: eigene HelpRequests.
- **POST**: Erstellt einen neuen HelpRequest. Erfordert `type` und `description`. Erstellt automatisch eine Notification für die Klinik.
- **Bereits existent, NICHT neu erstellt.** Wurde bereits zuvor implementiert.

### 2. Neue Seite: `src/app/dashboard/help-requests/page.tsx` (NEU)
- **Typ**: Client Component (`"use client"`)
- **Datenquelle**: `/api/help-requests` (GET) mit `credentials: "include"`
- **Features**:
  - Tabelle mit Spalten: Patient, Typ, Beschreibung, Status, Erstellt
  - Suchleiste (filtert nach Typ, Beschreibung, Patientenname)
  - Status-Badges mit Farben (OPEN=rot, IN_PROGRESS=gelb, RESOLVED=grün)
  - Mapping `HelpType` → deutsche Labels
  - Leer-Zustand mit LifeBuoy-Icon
  - Nur für Klinik-Rollen gedacht (Patienten haben eigene Ansicht, aber die Seite ist über Sidebar erreichbar)
- **Design**: Nutzt bestehende CSS-Klassen (`dashboard-card`, `table-custom`, `search-bar`, `empty-state`)
- **Icons**: `lucide-react` (AlertCircle, Clock, CheckCircle, Search, LifeBuoy, User)

### 3. Hilfe-Button auf Task-Detailseite
- **Datei**: `src/app/dashboard/tasks/[id]/page.tsx` (BESTEHEND, modifiziert)
- **Neue Imports**: `HelpCircle`, `X` zu `lucide-react`
- **Neuer State** (Zeile 100-106):
  ```ts
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState("OTHER");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpSubmitting, setHelpSubmitting] = useState(false);
  const [helpSuccess, setHelpSuccess] = useState("");
  const [helpError, setHelpError] = useState("");
  ```
- **Hilfe-Button**: Im Header-Bereich rechts neben dem Titel (btn-outline-danger, HelpCircle-Icon)
- **submitHelpRequest()**: POST an `/api/help-requests` mit `{type, description, requirementId: id}`. Nach Erfolg 2s Timeout, dann Modal schließen.
- **Hinweis**: Das Modal-JSX für den Hilfe-Button wurde noch NICHT hinzugefügt. Das ist ein offener Punkt.

### 4. Sidebar-Menüpunkt (OFFEN)
- **Datei**: `src/components/sidebar.tsx` (BESTEHEND)
- **Noch nicht gemacht**: Eintrag in `sidebarItems` für Help Requests hinzufügen
- **Geplante Rollen**: `["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"]`
- **Geplanter Icon**: `LifeBuoy` aus `lucide-react`
- **Geplanter Titel**: `"Hilfeanfragen"`
- **Geplanter href**: `/dashboard/help-requests`

## Offene Punkte
1. **Modal-JSX für Hilfeanfrage** in `tasks/[id]/page.tsx` hinzufügen
2. **Sidebar-Menüpunkt** in `sidebar.tsx` hinzufügen
3. **Build ausführen** und Fehler fixen
4. **Commit + Push**

## Prisma-Schema (Referenz)
```prisma
model HelpRequest {
  id             String     @id @default(uuid())
  patientId      String
  caseId         String
  organizationId String
  requirementId  String?
  type           HelpType
  description    String?
  status         HelpStatus @default(OPEN)
  assignedTo     String?
  createdAt      DateTime   @default(now())
  resolvedAt     DateTime?
}

enum HelpType {
  I_DONT_UNDERSTAND
  NO_APPOINTMENT
  MISSING_PRESCRIPTION
  DOCTOR_WONT_ISSUE
  TRANSPORT
  LANGUAGE
  ORGANIZATIONAL
  OTHER
}

enum HelpStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}
```

## API-Endpunkte
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/help-requests` | Alle offenen (Klinik) oder eigene (Patient) |
| POST | `/api/help-requests` | Neue Hilfeanfrage erstellen |

## Dateien
| Pfad | Status |
|------|--------|
| `src/app/dashboard/help-requests/page.tsx` | **NEU erstellt** |
| `src/app/dashboard/tasks/[id]/page.tsx` | **MODIFIZIERT** (Button + State + submitHelpRequest) |
| `src/components/sidebar.tsx` | **OFFEN** (Menüpunkt fehlt) |

## Styling-Referenz (bestehende Klassen)
- `dashboard-card` — weiße Card mit Schatten
- `table-custom` — benutzerdefinierte Tabelle
- `search-bar` — Suchinput mit Icon
- `empty-state` — zentrierter Leer-Zustand
- `btn-outline-danger` — roter Outline-Button
- `btn-outline-primary` — blauer Outline-Button
- `btn-primary` — blauer Füll-Button
- Bootstrap-Klassen: `d-flex`, `gap-2`, `align-items-center`, `badge`, `alert`, `modal`, `form-control`, `form-select`, `text-muted`, `fw-medium`

## Wichtige Hinweise für spätere Sitzungen
- Die `submitHelpRequest`-Funktion POSTet an `/api/help-requests` OHNE `caseId`. Die API erwartet `caseId` optional im Body, aber das Route-POST liest `caseId` aus dem Body (`const { type, description, requirementId, caseId } = body`). Ohne `caseId` wird es `null` gesetzt.
- Die `requirementId` wird im Body übergeben und in der DB gespeichert.
- Das Modal für den Hilfe-Button muss am Ende des `return`-Blocks in `tasks/[id]/page.tsx` vor dem abschließenden `</div>` eingefügt werden.
- Die Seite `help-requests/page.tsx` nutzt `credentials: "include"` beim fetch, damit Session-Cookies mitgesendet werden.
