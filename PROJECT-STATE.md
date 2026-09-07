# NephroAssist — PROJECT STATE

## Überblick
NephroAssist ist eine Multi-Tenant SaaS-Plattform für die Koordination von Organtransplantationsprozessen (Fokus: Nierentransplantation). Zielgruppe sind Transplantationszentren, Dialyseeinrichtungen, Nephrologie-Praxen und Patienten.

## Tech-Stack
- **Framework:** Next.js 16.3.2 (App Router)
- **Frontend:** React 19, Tailwind CSS, Radix UI
- **Backend:** Next.js API Routes (Route Handlers)
- **Auth:** next-auth 5.0.0-beta.32 (JWT-Strategy, CredentialsProvider, PrismaAdapter entfernt)
- **Datenbank:** PostgreSQL (Prisma ORM 5.22.0)
- **E-Mail:** Nodemailer + Resend
- **Tests:** Jest + Playwright

## Datenbank-Schema (Key Models)
- **Identity/Tenancy:** Organization, OrganizationMembership, Role, Permission
- **Patient:** Patient (mit Stammdaten, Hausarzt, Consent, GDPR-Feldern), Medication, DialysisRegime, LabValue, PatientOnboarding, PatientComment
- **Case:** PatientCase, TransplantProgram, RequirementTemplate, TemplateSet, PatientRequirement
- **Tasks:** Task (mit Workflow-Step-Feldern)
- **Documents:** Document, DocumentReview, DocumentRequirementLink, ExtractedDocumentItem
- **Appointments:** Appointment
- **Blockers/Help:** Blocker, HelpRequest
- **Comms:** Message, Notification
- **Audit:** AuditLog, TimelineEvent
- **Auth:** User, Account, Session, LoginHistory, PasswordResetToken, EmailVerificationToken, TwoFactorCode
- **System:** FeatureFlag, SystemSetting, SystemConfig, Translation
- **Security:** SecureUploadLink, TransplantPassport, CaregiverAccess, DataSharingPermission
- **AI:** PromptTemplate, PromptVersion, AIProcessingLog, ReminderLog

## Features (implementiert)
- ✅ Multi-Tenant-Architektur mit Organization-Memberships & RBAC (Rollen + Permissions)
- ✅ Patientenmanagement mit Stammdaten, Hausarzt-Daten, Consent-Status
- ✅ Fall-Status-Maschine (Referral → Intake → Evaluation → ReadyForReview → ...)
- ✅ Untersuchungsanforderungen (RequirementTemplates → PatientRequirements) mit Gültigkeit & Erneuerung
- ✅ Aufgaben-/Workflow-System mit Schritt-Logik
- ✅ Dokumenten-Upload & Review-Workflow
- ✅ Terminverwaltung
- ✅ Blocker-Tracking & Hilfeanfragen
- ✅ Audit-Log mit Hash-Chain
- ✅ Benachrichtigungs-Center
- ✅ 2FA (E-Mail-Codes)
- ✅ Passwort-Reset & E-Mail-Verifizierung
- ✅ Secure Upload Links (Passport-System)
- ✅ i18n (DB-basiert, Deutsch + Italienisch)
- ✅ Admin-Panel (User-Management, Audit, Reports, Settings)
- ✅ Cookie-Consent / GDPR first-class
- ✅ Dialyseregime-Verwaltung (Inline-Editing)
- ✅ Medikamentenplan
- ✅ Laborwerte-Trends
- ✅ Patienten-Onboarding-Checkliste
- ✅ Team-Kommentare (threaded, mit Mentions)
- ✅ Smart Reminders (t30, t14, t7, t1, overdue, escalation)
- ✅ Data-Sharing-Permissions (Org-zu-Org)

## i18n-Status
- ✅ 30/30 Dashboard-Seiten migriert
- ✅ 3/3 Auth-Seiten migriert
- ✅ 3/3 Legal-Seiten migriert (Impressum, Datenschutz, AGB)
- ✅ 65+ Translation-Keys geseeded (de + it)
- ✅ LanguageSwitcher in Topbar
- ✅ Translations API mit Seed-Endpunkt

## Offene Themen (siehe TODOS.md)
- Security Review (P1→P2→P3→P4)
- Kalender-Integration (FullCalendar vorhanden)
- E-Mail-Client (SMTP-basiert, nicht mailto)
- CMS/TipTap-Integration
- Mobile-Responsiveness-Polish
- Performance-Optimierung (Bundle-Analyse)

## Git
- Branch: `main`
- Letzter Commit: i18n Legal-Seiten + Seed-Erweiterung
- Build-Status: ✅ sauber (keine TypeScript-Fehler)

## Test-Zugangsdaten
| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Admin | admin@nephroassist.de | Test1234! |
| Koordinator | koordinator@nephroassist.de | Test1234! |
| Arzt | arzt@nephroassist.de | Test1234! |
| Patient | patient@beispiel.de | Test1234! |
| Dialyse | dialyse@beispiel.de | Test1234! |

## Umgebung
- Node ≥18
- PostgreSQL (lokal oder remote)
- Umgebungsvariablen siehe `.env.example`
