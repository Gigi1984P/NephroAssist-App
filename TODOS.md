# NephroAssist — TODOS

## In Arbeit
- [ ] Security Review P1 (Passwort-Policies, Rate-Limiting, Session-Hardening)
- [ ] E-Mail-Client-Komponente (SMTP-basiert für CRM)

## Nächste Schritte
- [ ] Kalender-Seite mit FullCalendar vollständig implementieren
- [ ] CMS/TipTap-Integration für Content-Management
- [ ] Mobile-Responsiveness für alle Dashboard-Seiten prüfen & fixen
- [ ] Performance: Bundle-Analyse und Code-Splitting
- [ ] Security Review P2 (CSP, CSRF, XSS-Audits)
- [ ] Security Review P3 (SQL-Injection, Input-Validierung)
- [ ] Security Review P4 (Dependency-Audit, Secret-Scanning)
- [ ] Playwright E2E-Tests für kritische Flows
- [ ] Jest-Unit-Tests für Utils & API-Routes
- [ ] Dokumentation: API-Endpunkte dokumentieren
- [ ] Dokumentation: Deployment-Guide

## Ideen / Backlog
- [ ] WhatsApp/SMS-Integration für Reminder
- [ ] Video-Chat-Integration (z.B. Jitsi)
- [ ] AI-Dokumenten-Klassifizierung (OCR + GPT)
- [ ] Patienten-App (separate Mobile-App)
- [ ] Multi-Language-Portal (Patienten wählen Sprache)
- [ ] Analytics-Dashboard mit Charts
- [ ] Export-Funktion (PDF-Report für Patienten)
- [ ] Interoperabilität: HL7 FHIR-Integration
- [ ] Terminbuchung extern (Patienten können selbst buchen)
- [ ] Dark Mode

## Erledigt (letzte Session)
- [x] i18n: Legal-Seiten (Impressum, Datenschutz, AGB) migriert
- [x] i18n: 34 neue Legal-Translation-Keys zum Seed hinzugefügt (de + it)
- [x] PROJECT-STATE.md erstellt
- [x] TODOS.md erstellt
- [x] **Calendar**: Custom Month/Week/Day Views mit Appointment-Dots, Navigation, Detail-Modal
- [x] **Calendar**: GET /api/appointments hinzugefügt (mit Auth + Org-Filter)
- [x] **Email Client**: SMTP-basierte E-Mail-Komponente (Inbox, Sent, Drafts, Compose)
- [x] **Email Client**: DB Schema EmailMessage + EmailAttachment + EmailStatus
- [x] **Email Client**: API Routes (/api/email, /api/email/send, /api/email/sent, /api/email/[id])
- [x] **Email Client**: Sidebar-Navigation mit Mail-Icon
- [x] **Security P1**: Rate Limiting auf /api/auth/forgot-password
- [x] **Security P1**: Zod-Input-Validation auf forgot-password
- [x] **Security P1**: SameSite=Strict für nephro-token Cookie
- [x] **Security P1**: Middleware erweitert (Admin-Gate, Security Headers, erweiterter Matcher)
- [x] Build sauber, Git commit + push
