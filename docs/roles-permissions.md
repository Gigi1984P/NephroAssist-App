# Rollen & Berechtigungen

## Rollen

| Rolle | Beschreibung |
|---|---|
| **ADMIN** | Vollzugriff, Admin-Panel, Audit Log |
| **COORDINATOR** | Patientenverwaltung, Untersuchungen zuweisen, Reports |
| **PHYSICIAN** | Arztliche Prüfungen, Patienten einsehen |
| **NURSE** | Pflegerische Aufgaben, Patienten einsehen |
| **PATIENT** | Eigene Untersuchungen bearbeiten, Profil verwalten |
| **CAREGIVER** | Pflegeperson, ähnlich wie Patient |
| **DIALYSIS_STAFF** | Dialyse-Mitarbeiter |
| **TRANSPLANT_STAFF** | Transplantations-Mitarbeiter |

## Berechtigungen pro Bereich

### Untersuchungen (/dashboard/tasks/*)
| Aktion | Patient/Caregiver | Klinik (ADMIN/COORD/PHYS/NURSE) |
|---|---|---|
| Übersicht sehen | ✅ | ✅ |
| Eigenen Workflow bearbeiten | ✅ | N/A |
| Schritt 6 abnehmen | ❌ | ✅ |
| Neue Untersuchung erstellen | ❌ | ✅ |
| Templates verwalten | ❌ | ✅ |

### Patienten (/dashboard/patients/*)
| Aktion | Patient/Caregiver | Klinik |
|---|---|---|
| Eigenes Profil sehen | ✅ (nur /patients/me) | ✅ |
| Alle Patienten sehen | ❌ | ✅ |
| Patienten-Details sehen | ❌ | ✅ |
| Neue Patienten anlegen | ❌ | ✅ |

### Globale Patientensuche
- Nur Klinik-Rollen: ADMIN, COORDINATOR, PHYSICIAN, NURSE, DIALYSIS_STAFF
- Patienten und Caregiver sehen keine Suche

### Sidebar-Navigation
| Eintrag | Sichtbar für |
|---|---|
| Dashboard | Alle |
| Patienten | Klinik |
| Termine | Alle |
| Untersuchungen → Alle Untersuchungen | Alle |
| Dokumente | Alle |
| Statistiken | ADMIN, COORDINATOR |
| Audit Log | ADMIN |
| Admin | ADMIN |

## Permissions-Engine (`src/lib/permissions.ts`)

```typescript
export const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

export function canCompleteTask(userRole: string, actionType: string): boolean {
  switch (actionType) {
    case "patient_status":
    case "patient_upload":
      return ["PATIENT", "CAREGIVER"].includes(userRole);
    case "clinic_review":
      return CLINIC_ROLES.includes(userRole);
    default:
      return false;
  }
}
```

## Frontend-Rollenprüfung

```typescript
const isClinicUser = CLINIC_ROLES.includes(userRole || "");
```

### Typische Muster

```typescript
// Controls nur für Klinik anzeigen
{isClinicUser && (
  <button>Nur für Klinik</button>
)}

// Controls für Patienten ausgrauen
{!isClinicUser && (
  <div className="alert alert-info">Nur Klinik-Mitarbeiter</div>
)}

// API-Route schützen
const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];
if (!clinicRoles.includes(user.role)) {
  return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
}
```

## Authentifizierung

### Custom JWT (kein NextAuth!)
- `jose` Bibliothek für JWT
- Cookie: `nephro-token` (httpOnly)
- Middleware in `src/middleware.ts` verifiziert Token
- `auth()` Funktion in `src/lib/auth.ts` liest Cookie aus

### Middleware
- Redirects zu /login wenn kein Cookie
- Bypass für /login und /register
- Prüft Token-Validität bei jeder Anfrage

### Auth-Flow
```
1. POST /api/login → Setzt Cookie
2. Client speichert nichts (Cookie only)
3. Jede Anfrage: Cookie wird automatisch mitgesendet
4. Middleware verifiziert JWT
5. /api/logout → Löscht Cookie
```

## Wichtig: credentials: "include"
Im Browser muss jeder fetch-Call mit Cookies senden:
```typescript
fetch("/api/irgendwas", { credentials: "include" })
```
Sonst gibt es 401 trotz gültigem Cookie.
