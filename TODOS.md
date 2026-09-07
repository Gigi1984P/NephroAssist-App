# NephroAssist — TODOS

## In Arbeit
- [ ] Mobile-Responsiveness für alle Dashboard-Seiten prüfen & fixen
- [ ] Performance: Bundle-Analyse und Code-Splitting

## Nächste Schritte
- [ ] Jest-Unit-Tests für Utils & API-Routes
- [ ] Dokumentation: API-Endpunkte dokumentieren
- [ ] Dokumentation: Deployment-Guide
- [ ] WhatsApp/SMS-Integration für Reminder
- [ ] Video-Chat-Integration (z.B. Jitsi)
- [ ] AI-Dokumenten-Klassifizierung (OCR + GPT)
- [ ] Analytics-Dashboard mit Charts
- [ ] Export-Funktion (PDF-Report für Patienten)
- [ ] Interoperabilität: HL7 FHIR-Integration
- [ ] Terminbuchung extern (Patienten können selbst buchen)
- [ ] Dark Mode

## Erledigt (letzte Session)
- [x] **Calendar**: Custom Month/Week/Day Views mit Appointment-Dots, Navigation, Detail-Modal
- [x] **Calendar**: GET /api/appointments hinzugefügt (mit Auth + Org-Filter)
- [x] **Calendar**: "Neuer Termin" Dialog (Patient-Auswahl, Typ, Ort, Datum, Zeit)
- [x] **Email Client**: SMTP-basierte E-Mail-Komponente (Inbox, Sent, Drafts, Compose)
- [x] **Email Client**: DB Schema EmailMessage + EmailAttachment + EmailStatus
- [x] **Email Client**: API Routes (/api/email, /api/email/send, /api/email/sent, /api/email/[id])
- [x] **Email Client**: Sidebar-Navigation mit Mail-Icon
- [x] **CMS/TipTap**: Rich-Text Editor mit @tiptap/starter-kit + Toolbar
- [x] **CMS/TipTap**: CmsPage Schema, API Routes, Dashboard (List/Create/Edit)
- [x] **CMS/TipTap**: Sidebar Navigation (ADMIN only)
- [x] **Security P1**: Rate Limiting auf /api/auth/forgot-password
- [x] **Security P1**: Zod-Input-Validation auf forgot-password
- [x] **Security P1**: SameSite=Strict für nephro-token Cookie
- [x] **Security P1**: Middleware erweitert (Admin-Gate, Security Headers, erweiterter Matcher)
- [x] **Security P2**: CSP Header via Middleware (default-src 'self', script-src 'unsafe-inline', CSP-Report Endpoint)
- [x] **Security P2**: CSRF Token Generation + Verification auf state-changing POSTs
- [x] **Security P2**: XSS Audit — DOMPurify installiert, alle dangerouslySetInnerHTML entfernt
- [x] **Security P3**: Zod Input-Validation auf /api/appointments, /api/patients, /api/help-requests, /api/email/send
- [x] **Security P3**: sanitizeSearch Helper für LIKE-Injection-Schutz
- [x] **Security P4**: Dependency Audit (5 vuln dokumentiert)
- [x] **Security P4**: Secret-Scanning-Script (docs/scripts/secret-scan.sh)
- [x] **Security P4**: HSTS Header (Strict-Transport-Security) + Permissions-Policy
- [x] **Playwright E2E**: Auth flow (login valid/invalid, redirect unauth)
- [x] **Playwright E2E**: Dashboard navigation (sidebar, patients, calendar, email)
- [x] **Playwright E2E**: data-testid attributes auf login, sidebar, patients, calendar, email
- [x] Build sauber, Git commit + push
