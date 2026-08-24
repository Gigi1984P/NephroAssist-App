# Architektur

## Übersicht

```
┌─────────────────────────────────────────┐
│           Client (Browser)              │
│  - React 19 + Next.js 16 App Router     │
│  - Bootstrap 5.3 (CDN)                  │
│  - Custom JWT Cookie Auth               │
└─────────────────┬───────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────┐
│           Vercel Edge                   │
│  - Next.js Server Components            │
│  - API Routes (Serverless Functions)    │
│  - Middleware (JWT Verify)              │
└─────────────────┬───────────────────────┘
                  │ TCP
┌─────────────────▼───────────────────────┐
│         PostgreSQL (m22p...)            │
│  - Prisma ORM                           │
│  - Production DB                        │
└─────────────────────────────────────────┘
```

## Auth-Architektur (Custom JWT)

```
┌─────────────┐     POST /api/login      ┌─────────────┐
│   Client    │ ────────────────────────→│   Server    │
│             │   {email, password}      │             │
│             │                          │  1. User    │
│             │  ←──── Set-Cookie ───────│     prüfen  │
│             │      nephro-token (JWT)  │  2. JWT     │
│             │                          │     signen  │
└─────────────┘                          └─────────────┘

┌─────────────┐     Jede Anfrage        ┌─────────────┐
│   Client    │ ────────────────────────→│ Middleware  │
│             │   Cookie: nephro-token   │             │
│             │                          │  1. JWT     │
│             │  ←──── Weiterleiten ─────│     verify  │
│             │     (oder 401/Redirect)  │  2. User    │
│             │                          │     setzen  │
└─────────────┘                          └─────────────┘
```

**Wichtig:** Kein NextAuth, kein Session-Storage. Nur Cookie + JWT.

## Datenfluss: Untersuchung erstellen

```
Klinik-Mitarbeiter
    │
    ▼
POST /api/examinations/assign
    │
    ├── 1. RequirementTemplate finden (oder manuelle Daten)
    │
    ├── 2. PatientRequirement erstellen
    │   └── caseId, templateId, title, category, ...
    │
    ├── 3. Top-Level Task erstellen
    │   └── isWorkflowStep: false
    │
    ├── 4. Workflow-Schritte erstellen (6x)
    │   └── stepNumber 1-6, isWorkflowStep: true
    │   └── stepNumber 1: status = IN_PROGRESS
    │   └── stepNumber 2-6: status = PENDING
    │   └── previousStepId verknüpft
    │
    └── 5. Response: { message, requirement }

Patient sieht automatisch in /dashboard/tasks
```

## Datenfluss: Workflow bearbeiten

```
Patient (Schritt 1 aktiv)
    │
    ▼
PATCH /api/tasks/[step1-id]
    Body: { status: "COMPLETED" }
    │
    └── Task auf COMPLETED gesetzt
    │
    ▼
Frontend: Status ändern
    │
    ▼
GET /api/tasks/[task-id]/workflow
    Response: Alle Schritte neu laden
    │
    └── Schritt 2 jetzt aktiv (weil Schritt 1 COMPLETED)
```

## Datenfluss: Schritt 6 abnehmen

```
Klinik-Mitarbeiter
    │
    ▼
POST /api/tasks/[step6-id]/review
    │
    ├── 1. Prüfe: User hat Klinik-Rolle?
    │   └── Nein → 403
    │
    ├── 2. Task.update:
    │   └── status: COMPLETED
    │   └── completedById: user.id
    │   └── completedByRole: user.role
    │   └── completedAt: new Date()
    │
    ├── 3. PatientRequirement.update:
    │   └── status: ACCEPTED
    │   └── completedAt: new Date()
    │
    └── 4. Response: { message, task }
```

## Frontend-Architektur

```
DashboardLayout (Server Component)
├── Sidebar (Client)
│   ├── Navigation items (mit Rollen-Filter)
│   └── Resizable (localStorage)
│
├── Header (Client)
│   ├── MobileSidebar
│   ├── PageTitle
│   ├── PatientSearch (nur Klinik)
│   ├── NotificationCenter
│   └── UserNav
│
└── Main Content
    ├── Server Components (default)
    └── Client Components ("use client" bei Interaktivität)
        ├── useState/useEffect
        ├── fetch mit credentials: "include"
        └── Event Handler
```

## State-Management

- **Kein Redux/Zustand**
- React useState/useEffect
- Daten werden bei Bedarf frisch geladen
- Keine globalen Stores

## Wichtige Dateien

| Datei | Zweck |
|---|---|
| `src/lib/auth.ts` | JWT erstellen/verifizieren |
| `src/lib/prisma.ts` | Prisma Client + URL-Encoding |
| `src/lib/permissions.ts` | Rollenbasierte Berechtigungen |
| `src/lib/workflows.ts` | Workflow-Definitionen (Dental/Cardiac) |
| `src/middleware.ts` | JWT-Verify bei jedem Request |
| `prisma/schema.prisma` | Datenbank-Schema |

## Design-Entscheidungen

1. **Custom JWT statt NextAuth** — Mehr Kontrolle, weniger Abhängigkeiten
2. **Bootstrap 5.3 statt Tailwind** — User-Präferenz
3. **Cookie statt localStorage** — Sicherer für JWT
4. **Server Actions nicht verwendet** — Traditionelle API Routes
5. **Kein Redux** — React State reicht aus
6. **Simulation statt echter Upload** — User-Anforderung
