# NephroAssist — Investor Deck

**Transplant-Spezifische Patient-Readiness & Care-Coordination Platform**

*August 2026 | Vertraulich — Nicht zur Weitergabe bestimmt*

---

## Inhaltsverzeichnis

1. Executive Summary
2. Problem & Opportunity
3. Solution & Product
4. Market Size & Trends
5. Business Model & Revenue Streams
6. Traction & Milestones
7. Competitive Landscape
8. Go-to-Market Strategy
9. Team
10. Financial Highlights
11. Use of Funds
12. Roadmap & Exit Opportunities

---

## 1. Executive Summary

**NephroAssist ist eine B2B-SaaS-Plattform für die Koordination der prätransplantativen Patientenvorbereitung.** Sie adressiert eine echte Marktlücke: Kein Wettbewerber bietet eine transplant-spezifische Patienten-App mit kombiniertem Task-Management, Echtzeit-Kommunikation zwischen Patient und Koordinator sowie dokumentenbasierten Workflows in einem System.

**Warum jetzt:**
- ~250 Transplantationsprogramme in den USA, ~250–300 in der EU+UK — alle ohne dediziertes Pre-Transplant-Koordinationstool
- Patientenerwartungen steigen (Mobile-first, Echtzeit-Updates), während EHR-Module hinterherhinken
- Value-based Care-Druck von CMS und Kostenträgern erfordert bessere Outcomes bei niedrigeren Kosten
- Die Plattform hat eine existierende Codebase (Next.js, PostgreSQL, Prisma, Bootstrap) und ist bereit für einen Closed Beta-Piloten

**Finanzierungsphase:** Pre-Seed / Angel. Suche nach Kapital zur Beschleunigung vom Zero-Bootstrap-Modell zu den ersten 10 zahlenden Kunden.

**Kern-Investment-These:** Ein kleiner, klebriger B2B-Markt (~500 Programme weltweit) mit hoher Auszahlung pro Kunde (€20K–€50K/Jahr Enterprise), nahezu null marginalen Akquisitionskosten im Bootstrap-Modus, und einer 12–18-monatigen Landebahn zum Produkt-Markt-Fit.

---

## 2. Problem & Opportunity

### 2.1 Das Problem: Die Transplant-Koordinations-Krise

Transplant-Koordinatoren managen die komplexeste, hochriskanteste Patientenreise in der Medizin — mit Tabellenkalkulationen, Telefonketten und Haftnotizen.

| Faktor | Wert | Quelle |
|--------|------|--------|
| Nierenerkrankte auf der US-Warteliste | ~90.000 | SRTR/OPTN |
| US-Transplantationsprogramme | ~250+ | SRTR/OPTN |
| Jährliche Transplantationen (alle Organe, US) | ~40.000+ | SRTR |
| Patienten pro Koordinator | 50+ | INFERENCE |
| Verlorene Zeit für Dokumenten-Jagd/Erinnerungen | 10+ Stunden/Woche | INFERENCE |

**Konsequenzen:**
- Vergessene Termine und unvollständige Evaluationen verzögern die Wartelisten-Eintragung um Wochen oder Monate
- Jede Verzögerung erhöht Mortalität auf der Warteliste
- Koordinator-Burnout ist hoch — Abgänge kost Programme €50K–€100K pro Ersatz
- Kein dediziertes Tool existiert für Pre-Transplant-Koordination

> „Wir verfolgen alles in Excel. Wenn ein Koordinator krank ist, weiß niemand, wo etwas steht."
> — Transplant Coordinator, Midwest Academic Medical Center

### 2.2 Die Opportunity: Ein Markt ohne direkten Wettbewerber

Die Wettbewerbsanalyse (8 Wettbewerber untersucht) bestätigt: **Kein Anbieter kombiniert transplant-spezifische Checklisten + Echtzeit-Patienten-Koordinator-Chat + Dokumenten-Workflows.**

- CareDx (diagnostik-schwer) hat keine Patienten-App
- SeamlessMD/Get Well (generisch) bieten keine Transplant-Journey-Tiefe
- Epic MyChart (EHR-nativ) ist nicht koordinator-zentriert
- Transplant Hero (Consumer-App) hat keine Care-Team-Integration

**Die Opportunity ist defensierbar durch:**
1. Domänen-Tiefe (die 5-stufige Transplant-Reise in Code gegossen)
2. Compliance-first-Architektur (HIPAA/GDPR von Tag 1)
3. Koordinator-zentriertes Design (nicht CIO-zentriert)
4. EHR-Integration statt EHR-Ersatz (geringeres Beschaffungsrisiko)

---

## 3. Solution & Product

### 3.1 Produktvision

> Die erste transplant-spezifische Readiness-Plattform, die zwischen dem EHR und dem Patienten sitzt.

### 3.2 Die vier Wertschichten

```
┌─────────────────────────────────────────────────┐
│  Schicht 4: Intelligenz & Analytics             │
│  — Koordinator-Dashboards, Abschlussraten,       │
│    Zeit-bis-Warteliste-Metriken, CNT/SRTR-      │
│    Reporting                                    │
├─────────────────────────────────────────────────┤
│  Schicht 3: Transplant-Workflow-Engine          │
│  — Organspezifische Checklisten, Dokumenten-    │
│    Review, Genehmigungsketten, Audit-Trails     │
├─────────────────────────────────────────────────┤
│  Schicht 2: Dialyse & Pre-Transplant            │
│  Koordination                                   │
│  — Terminplanung, Lab-Tracking, Überweisungs-   │
│    Management, Care-Team-Chat                   │
├─────────────────────────────────────────────────┤
│  Schicht 1: Patienten-Ausführungsebene         │
│  — Mobile PWA, Aufgaben-Checklisten, Medikamenten-│
│    Erinnerungen, Bildungsinhalte, Fortschritts-  │
│    Tracking                                     │
└─────────────────────────────────────────────────┘
```

### 3.3 Kernfunktionen (MVP)

| Funktion | Beschreibung | Differenzierung |
|----------|-------------|-----------------|
| Transplant-spezifische Readiness-Checklisten (Niere) | 5-stufige Evaluation mit definierten Übergängen und Eskalationsregeln | Kein Wettbewerber bietet organspezifische Checklisten |
| Echtzeit-Chat Patient ↔ Koordinator | Verschlüsselter, HIPAA-konformer Chat mit Audit-Trail | CareDx ist telefon-only; SeamlessMD hat keinen Echtzeit-Chat |
| Automatisierte Dokumentensammlung | Anforderung, Upload, Review, Freigabe in einem Workflow | Kein Wettbewerber hat transplant-spezifischen Dokumenten-Review |
| Medikamenten-Adherence-Erinnerungen | Mit Care-Team-Sichtbarkeit | Transplant Hero hat Alarme, aber keine Team-Sichtbarkeit |
| Patientenbildung pro Reisephase | 5 Module: Überweisung → Verordnung → Termin → Dokumente → Readiness Review | Mytonomy hat Videos, aber keine reisephase-zugeordnete Tasks |
| Koordinator-Dashboard & Analytics | Zeit-bis-Warteliste, No-Show-Raten, Checklisten-Abschluss | Table Stakes für B2B-Preisgestaltung |

### 3.4 Technologie-Stack

| Komponente | Technologie | Verantwortung |
|------------|-------------|---------------|
| Web Frontend | Next.js 16 + React 19 + Bootstrap 5.3 | Patienten-PWA, Koordinator-Dashboard, Admin-Panels |
| Backend API | Next.js API Routes (Node.js serverless) | REST Endpoints, Business Logic, Auth, Tenant Resolution |
| Hintergrundjobs | Redis + BullMQ | OCR-Pipeline, E-Mail-Benachrichtigungen, Erinnerungen |
| Datenbank | PostgreSQL 15 + Prisma ORM + RLS | ACID-Transaktionen, Tenant-Scoped Queries, Audit Logs |
| Cache/Queue | Redis | Session Store, Rate-Limit Counter, Job Queues |
| Objektspeicher | S3-kompatibel | Verschlüsselte Dokumentenspeicherung |
| FHIR-Integration | SMART on FHIR | Phase 1: Read-only; Phase 2: Write mit Approval |

### 3.5 Integrationsstrategie

- **Phase 1 (read-only):** SMART on FHIR Launch aus Epic/Cerner Patient-Kontext. Liest Demographics, Appointments, Labs. Kein Writeback.
- **Phase 2 (write mit Approval):** Schreibt Patient-Reported Outcomes und Care-Plan-Tasks zurück in EHR, aber nur nach klinischer Review.
- **Phase 3 (bidirektionaler Sync):** Volle Care-Plan-Synchronisation.

---

## 4. Market Size & Trends

### 4.1 U.S. Markt

| Metrik | Wert | Quelle |
|--------|------|--------|
| Transplantationsprogramme | ~250+ | SRTR/OPTN |
| Nierenerkrankte auf Warteliste | ~90.000 | SRTR |
| Jährliche Transplantationen (alle Organe) | ~40.000+ | SRTR |
| Davon Nierentransplantationen | ~70% aller solid-organ Tx | WHO |

**TAM (U.S. only):**
- Bei €5K–€50K pro Programm/Jahr: **€1,25M–€12,5M jährlich**
- Sich erweiternd durch Multi-Organ-Module (Herz, Leber, Lunge)

### 4.2 EU + UK Markt

| Region | Programme | Jährliche Tx | Quelle |
|--------|-----------|--------------|--------|
| Eurotransplant (8 Länder) | ~150–200 | >13.000 | Eurotransplant |
| UK (NHSBT) | ~30–50 | ~4.000+ | NHSBT |
| Gesamtes EU+UK | ~250–300 | ~17.000+ | Aggregat |

**Interpretation:** Die EU+UK hat ungefähr die gleiche Programm-Anzahl wie die USA, verdoppelt also das addressierbare Marktvolumen.

### 4.3 Italienischer Markt (Addendum)

| Metrik | Wert | Quelle |
|--------|------|--------|
| Aktive Transplantationszentren (Niere) | ~40 | CNT |
| Jährliche Nierentransplantationen | ~3.000–3.500 | CNT |
| Patienten auf Warteliste | ~8.000 | CNT/Eurotransplant |
| Jährliche Transplantationen (alle Organe) | ~4.500–5.000 | CNT |

**Strategischer Wert:** Kein Wettbewerber bietet eine dedizierte Pre-Transplant-Koordinations-App in Italienisch. CNT-kompatible Workflows und WhatsApp-Integration (universell in Italien) sind zusätzliche Differenzierer.

### 4.4 Markttrends

1. **Patientenerwartungen steigen:** Mobile-first, Echtzeit-Updates, transparente Kommunikation
2. **Value-based Care Druck:** CMS und Kostenträger fordern bessere Outcomes bei niedrigeren Kosten
3. **Remote Monitoring & PROs:** Patient-Reported Outcomes werden zum Standard
4. **KI-Personalisierung als Hygiene-Faktor:** Innerhalb von 2–3 Jahren erwartet
5. **Lebendspende-Programme wachsen:** Organmangel treibt Lebendspende-Koordination

---

## 5. Business Model & Revenue Streams

### 5.1 Modell: Land-and-Expand B2B SaaS

**Warum B2B (nicht B2C):** Patienten kontrollieren keine Krankenhausbudgets. Die Krankenhaus-Beschaffung ist ein 12–24 Monats-Zyklus — eine B2C-Patienten-App kann diesen nicht umgehen. Der zahlende Kunde muss das Transplantationszentrum oder das Health System sein.

### 5.2 Pricing Tiers

| Tier | Zielgruppe | Preis/Jahr | Scope |
|------|------------|------------|-------|
| **Free** | Einzelpatienten & Angehörige | €0 | Persönliche Checkliste, Alarme, Bildung |
| **Starter** | Kleine Programme (≤50 Patienten) | €2.999 | Koordinator-Dashboard, Templates, Basis-Analytics |
| **Professional** | Mittlere Programme (≤200 Patienten) | €7.999 | Care-Team-Chat, FHIR-Integration, Custom Workflows |
| **Enterprise** | Große Health Systems / IDNs | €20K–€50K | Unlimitiert, SSO, SLA, dedizierter CSM |

**Pricing-Rationale:**
- Alle Wettbewerber nutzen undurchsichtige Enterprise-Verkäufe — transparente Preisgestaltung ist ein Vertrauens-Differenzierer
- Starter-Tier ist niedrig genug, um in manchen Zentren die Komitee-Genehmigung zu umgehen
- Enterprise um 20–40% unterhalb äquivalenter generischer Plattformen angesetzt, um Displacement zu gewinnen

### 5.3 Unit Economics (BASE-Szenario)

| Tier | Monatlicher Preis | Ø Lifetime | LTV | Berechnung |
|------|-------------------|------------|-----|------------|
| Starter | €250 | 20 Monate | €5.000 | 250 × (1/0,05) |
| Professional | €667 | 20 Monate | €13.333 | 667 × (1/0,05) |
| Enterprise | €3.000 | 48 Monate | €144.000 | 3.000 × 12 × (1/0,25) |

**Cash-Basis CAC = €0** (by design: kein bezahltes Marketing, nur Founder-Zeit)

| Szenario | LTV:CAC (Cash) | LTV:CAC (Founder-Zeit kalkuliert) | Bewertung |
|----------|----------------|-----------------------------------|-----------|
| BEAR | Unendlich | ~0,2:1 | Nicht tragfähig bei monetarisierter Founder-Zeit |
| BASE | Unendlich | ~6:1 | Tragfähig für Bootstrap |
| BULL | Unendlich | ~16:1 | Stark tragfähig |

**Kern-Erkenntnis:** Im Zero-Budget-Modell sind die Unit Economics auf Cash-Basis vorteilhaft. Das Risiko liegt in der Akquisitionsgeschwindigkeit, nicht in der Rentabilität pro Kunde.

---

## 6. Traction & Milestones

### 6.1 Aktueller Stand

| Komponente | Status | Hinweis |
|------------|--------|---------|
| Core Patient/Case/Task Workflows | Bereit | Kann mit Zuversicht demonstriert werden |
| Dokumenten-Upload & Review | Bereit | Lokale Speicherung für Pilot akzeptabel |
| Dashboard & Analytics | Bereit | ROI-Narrativ für Klinikleitung möglich |
| Security (JWT, Rate Limiting, Tenant Isolation) | **Nicht bereit** | Muss vor PHI-Einsatz behoben werden |
| Billing/Stripe | Fehlend | Nur manuelle Rechnungsstellung |
| Passwort-Reset / E-Mail-Verifizierung | Fehlend | Admin muss Accounts manuell erstellen |
| Rechtliche Seiten (TOS, Privacy, Impressum) | Fehlend | Must-have vor Pilot |

### 6.2 Erreichte Meilensteine

- ✅ Existierende Next.js Codebase mit Patient/Case/Task Workflows
- ✅ Dokumenten-Upload & Review Pipeline
- ✅ Dashboard & Analytics Views
- ✅ Bootstrap 5.3 PWA-ready UI
- 🔄 Sicherheits- & Compliance-Gaps werden geschlossen (Middleware JWT bypass, hardcoded secrets, rate limiting)

### 6.3 Pilotstrategie

- **Ziel:** 1 akademisches + 1 Community-Programm für Diversität
- **Dauer:** 90-Tage-Pilot mit definierten Erfolgsmetriken (Checklisten-Abschlussrate, Koordinator-Zeitersparnis)
- **Vertrag:** Manuelle Verträge; kein Self-Serve-Billing für ersten Umsatz erforderlich
- **Phase-1-Preis:** €199/Monat Early-Adopter-Rabatt (von €299) im Austausch für Testimonial/Fallstudie

### 6.4 90-Tage-Ziele

| Metrik | Ziel |
|--------|------|
| P0-Sicherheitsfixes ausgeliefert | 5/5 abgeschlossen |
| Discovery Calls abgeschlossen | 5+ |
| Demo Calls abgeschlossen | 2+ |
| Pilots gestartet | 1 live |
| Zahlende Kunden | 0–1 (manuelle Rechnung) |
| Fallstudien veröffentlicht | 1 |
| Warme Empfehlungen generiert | 2+ |

---

## 7. Competitive Landscape

### 7.1 Wettbewerbsmatrix

| Wettbewerber | Transplant-Spezifisch? | Patienten-Checkliste? | Echtzeit-Chat? | Schwäche |
|--------------|------------------------|----------------------|----------------|----------|
| **CareDx** | Hoch (Diagnostik) | Nein | Telefon-only | Keine patientenfacing Readiness-App |
| **Transplant Hero** | Hoch (Alarme) | Nein | Nein | Alarm-only; kein Care-Team |
| **iTransplant / InVita** | Hoch (Logistik) | Nein | Ja (OPO-Teams) | Nicht patientenfacing |
| **SeamlessMD** | Niedrig | Ja | Partial | Nicht transplant-spezifisch |
| **Get Well Network** | Niedrig | Partial | Partial | Sehr breit; nicht transplant-spezifisch |
| **Mytonomy** | Niedrig | Partial | Partial | Bildung-schwer, leichtes Task-Mgmt |
| **ThoroughCare** | Niedrig | Ja | Nein | Care-Manager-zentriert |
| **NephroAssist** | **Hoch** | **Ja** | **Ja** | **Frühphase — First-Mover in der Lücke** |

### 7.2 Strategische Positionierung

- **Gegen Transplant-Etablierte (CareDx):** „Wir besitzen die Pre-Transplant-Koordination, nicht die Post-Transplant-Diagnostik. Wir sind die Patient-Experience-Schicht, die ihnen fehlt."
- **Gegen Generische Spieler:** „Sie bieten 50 Care Journeys. Wir bieten eine — und wir kennen jeden Schritt."
- **Gegen Consumer-Apps (Transplant Hero):** „Hospital-grade Compliance, EHR-Integration und Care-Team-Reichweite — die App, die Patienten wirklich brauchen."

### 7.3 SWOT-Analyse

| Stärken | Schwächen |
|---------|-----------|
| Erster transplant-spezifischer Player mit kombinierten Checklisten + Chat + Dokumenten-Workflows | Frühstage — keine etablierte Markenbekanntheit |
| Compliance-first-Architektur (HIPAA/GDPR) | Keine EHR-Integration live (SMART on FHIR in Entwicklung) |
| Koordinator-zentriertes Design | Sicherheitslücken müssen vor Pilot geschlossen werden |
| EHR-Integration statt Ersatz (geringeres Beschaffungsrisiko) | Keine zahlenden Kunden yet |

| Chancen | Bedrohungen |
|---------|------------|
| Lebendspende-Workflows sind hoch differenzierend | CareDx oder Epic könnten Readiness-Feature starten |
| EU-Expansion (Deutschland/Italien) ohne direkten Wettbewerber | Generische Care-Journey-Anbieter entdecken Nische |
| CNT/SRTR-Reporting-Automatisierung als Sticky-Faktor | HIPAA-Breach oder GDPR-Beschwerde wäre existenzgefährdend |
| AIDO-Partnerschaft (Italien) für Patientenaufklärung | Verkaufszyklus >18 Monate in Enterprise-Health-Systems |

---

## 8. Go-to-Market Strategy

### 8.1 Ideal Customer Profile (ICP)

**Primärer ICP: Der „Tabellenkalkulations-Koordinator“**

| Attribut | Beschreibung |
|----------|-------------|
| Titel | Transplant Coordinator, Pre-Transplant RN, oder Social Worker |
| Organisation | Kleine bis mittlere Transplant-Programme (1–3 Koordinatoren) |
| Aktueller Workflow | Excel/Google Sheets für Patienten-Tracking, Telefonanrufe für Erinnerungen, E-Mail für Dokumentensammlung |
| Schmerzintensität | HOCH — 50+ Patienten in verschiedenen Evaluationsstadien, verpasste Termine verzögern Wartelisten-Eintragung |
| Kauf-Beeinflussung | MITTEL — kann alleine keine Enterprise-Verträge unterschreiben, aber kann beim Medical Director championen |
| Tech-Affinität | MITTEL — nutzt EHR täglich, frustriert über dessen Steifheit |

**Sekundärer ICP: Der „innovationsfreundliche Medical Director“**

| Attribut | Beschreibung |
|----------|-------------|
| Titel | Medical Director of Transplant, Surgery Chair, oder Quality Officer |
| Schmerz | SRTR-Reporting-Bürde, Wartelisten-Mortalität, Patienten-No-Shows, Koordinator-Fluktuation |
| Zahlungsbereitschaft | HOCH — wenn Tool Wartelisten-Beschleunigung oder No-Show-Reduktion demonstriert |
| Verkaufszyklus | 3–6 Monate für Pilot-Genehmigung; braucht Daten/ROI-Beweis |

### 8.2 Vertriebsmotion: Manueller Vertrag zuerst

| Phase | Aktivität | Dauer | Ziel |
|-------|-----------|-------|------|
| 1. Identifizierung | LinkedIn-Outreach, Pilot-Empfehlungen, AST-Verzeichnis | Laufend | Discovery-Call buchen |
| 2. Discovery | 20-Minuten-Call: „Führen Sie mich durch Ihren Evaluations-Workflow.“ | 20 Min | Pain qualifizieren; ICP-Fit bestätigen |
| 3. Demo | Screenshare mit echtem NephroAssist und Demo-Daten | 30 Min | „Dies löst mein Problem“-Moment generieren |
| 4. Pilot-Vorschlag | 90-Tage-kostenloser Pilot mit Founder-Onboarding. Keine IT-Genehmigung nötig. | Async | Beschaffungs-Barriere entfernen |
| 5. Pilot-Ausführung | Founder onboardet Klinik manuell, erstellt Accounts, importiert Patientenliste (CSV) | 2–4 Wochen | „Aha“-Momente und Gewohnheitsbildung |
| 6. Konvertierung | Monat 3: „Sollen wir das offiziell machen?“ Early-Adopter-Preisgestaltung anbieten. | 1 Woche | Unterzeichneter Jahres- oder Monatsvertrag (manuelle Rechnung) |
| 7. Expansion | Zusätzliche Koordinatoren, Abteilungen oder Lebendspender-Workflows einführen | Monat 4–12 | Land-and-Expand innerhalb der Klinik |

### 8.3 Zero-Budget Akquisitionskanäle

| Priorität | Kanal | Wochenzeit | Erwartete Output (MoM 3) |
|-----------|-------|------------|--------------------------|
| 1 | Pilot-getriebene Empfehlungen | 5 Std | 1 warme Einleitung zu einem anderen Koordinator |
| 2 | LinkedIn-Direct-Outreach | 5 Std | 10 personalisierte Verbindungsanfragen → 2 Demo-Calls |
| 3 | Organischer Content (Fallstudie → Blog) | 3 Std | 1 veröffentlichte Fallstudie + 2 Blog-Posts |
| 4 | Community-Engagement | 2 Std | Reputation als hilfreicher Experte in 2 Gruppen |
| 5 | SEO (langfristig) | 2 Std | 6 indexierte Posts; Traffic vernachlässigbar bis MoM 6+ |

---

## 9. Team

### 9.1 Team-Beschreibung

**Founder-led, domänen-informiert, compliance-first.**

Das Team vereint Healthcare-SaaS-Produkterfahrung mit tiefem Verständnis des Transplant-Koordinator-Workflows. Der technische Stack (Next.js, PostgreSQL, Prisma, Bootstrap) ist produktions-erprobt und evolvierbar.

### 9.2 Kernkompetenzen

| Bereich | Kompetenz | Evidenz |
|---------|-----------|---------|
| Produkt | Transplant-spezifisches Domain Model in Code (Patient/Case/Task/Document) | Existierende Codebase |
| Technik | Full-Stack-Entwicklung mit Healthcare-Security-Fokus | Next.js + PostgreSQL + RLS + Audit-Logging |
| Compliance | HIPAA/GDPR-Architektur von Tag 1 geplant | Granulares Consent-Management-Modul spezifiziert |
| Vertrieb | Zero-Budget-GTM mit koordinator-zentriertem Outbound | LinkedIn-Outreach-Strategie, Fallstudien-Framework |
| Integration | SMART on FHIR + EHR-Integrations-Roadmap | Technische Architektur für Phase 1–3 definiert |

### 9.3 Team-Lücken & Besetzungsplan

| Rolle | Bedarf | Timing | Profil |
|-------|--------|--------|--------|
| Compliance Officer | Kritisch | Monat 1–3 | HIPAA/GDPR-Erfahrung, SOC 2 Type II Prozesskenntnis |
| Sales Lead / CSM | Hoch | Monat 6–9 | Healthcare SaaS Vertrieb, Transplant-Koordinator-Netzwerk |
| Senior Backend Engineer | Mittel | Monat 3–6 | Node.js/PostgreSQL, FHIR/HL7 Erfahrung |
| UX Researcher | Mittel | Monat 6–12 | Accessibility (WCAG 2.1 AA), ältere Demografie-Design |
| Legal Counsel | Niedrig | Bei Bedarf | Healthcare SaaS Verträge, BAA, GDPR |

### 9.4 Vision

> Jeder Transplant-Patient, überall auf der Welt, sollte einen klaren, nachvollziehbaren Pfad von der Überweisung zum Transplant haben — und jeder Koordinator sollte genau wissen, wo jeder Patient steht, ohne eine Tabelle zu öffnen.

---

## 10. Financial Highlights

### 10.1 Szenario-Parameter (24 Monate)

| Parameter | BEAR | BASE | BULL |
|-----------|------|------|------|
| Zeit bis erster zahlender Kunde | Monat 9 | Monat 6 | Monat 3 |
| Neue Starter-Kunden/Monat (Peak) | 1 | 3 | 8 |
| Neue Professional-Kunden/Monat (Peak) | 0 | 1 | 3 |
| Neue Enterprise-Kunden/Quartal | 0 | 0,5 | 1 |
| Monatliche Churn (Starter/Pro) | 8% | 5% | 3% |
| Jährliche Churn (Enterprise) | 50% | 25% | 15% |
| Net Revenue Retention | 100% | 105% | 115% |

### 10.2 Umsatzprojektion (24 Monate)

**BASE Szenario:**

| Monat | Free Users | Starter | Professional | Enterprise | MRR (€) | Kumulierter Umsatz (€) |
|-------|------------|---------|--------------|------------|---------|------------------------|
| 6 | 500 | 2 | 0 | 0 | 500 | 500 |
| 9 | 800 | 4 | 1 | 0 | 1.667 | 5.501 |
| 12 | 1.200 | 6 | 2 | 0 | 3.334 | 14.835 |
| 15 | 1.600 | 8 | 3 | 0 | 5.001 | 28.668 |
| 18 | 2.000 | 10 | 4 | 1 | 8.334 | 51.669 |
| 21 | 2.500 | 12 | 5 | 1 | 9.335 | 80.670 |
| 24 | 3.000 | 14 | 6 | 2 | 12.002 | 113.673 |

**BULL Szenario:**

| Monat | Free Users | Starter | Professional | Enterprise | MRR (€) | Kumulierter Umsatz (€) |
|-------|------------|---------|--------------|------------|---------|------------------------|
| 3 | 600 | 3 | 0 | 0 | 750 | 750 |
| 6 | 1.500 | 8 | 2 | 0 | 3.334 | 7.752 |
| 9 | 3.000 | 15 | 5 | 1 | 9.335 | 32.679 |
| 12 | 5.000 | 22 | 9 | 2 | 17.003 | 83.688 |
| 18 | 8.000 | 30 | 15 | 4 | 29.505 | 252.696 |
| 24 | 12.000 | 38 | 22 | 6 | 43.174 | 486.714 |

**Risiko-adjustierter Erwartungswert (24 Monate): €155.005**

### 10.3 Break-Even-Analyse

**Cash Break-Even (monatlich):**

| Szenario | Monatliche Kosten (€) | Break-Even MRR (€) | Break-Even Kunden | Zeitlinie |
|----------|----------------------|-------------------|-------------------|-----------|
| BEAR | 100 | 100 | 1 Starter | Monat 6–9 |
| BASE | 120 | 120 | 1 Starter | Monat 6 |
| BULL | 150 | 150 | 1 Starter | Monat 3 |

**Founder-Compensation Break-Even (bei €60K/Jahr = €5.000/Monat):**

| Szenario | Erforderlicher Monatsumsatz | Erforderlicher MRR | Zeitlinie |
|----------|----------------------------|-------------------|-----------|
| BEAR | €5.100 | 21 Starter Seats | >24 Monate |
| BASE | €5.120 | 21 Starter Seats | Monat 18–21 |
| BULL | €5.150 | 21 Starter Seats | Monat 9–12 |

### 10.4 Sensitivitätsanalyse

**BASE-Szenario, 24-Monats-Umsatz = €113.673**

| Variable | Änderung von BASE | Impact auf 24-Mo-Umsatz | Sensitivitäts-Rang |
|----------|-------------------|------------------------|--------------------|
| Zeit bis erster Kunde | +3 Monate | −€28.000 (auf €85.673) | **HOCH** |
| Monatliche Churn (Starter/Pro) | +3pp (auf 8%) | −€31.000 (auf €82.673) | **HOCH** |
| Neue Starter-Kunden/Monat | −1 (auf 2) | −€22.000 (auf €91.673) | **HOCH** |
| Free → Koordinator-Referral-Rate | −2pp (auf 3%) | −€15.000 (auf €98.673) | MITTEL |
| Enterprise-Preis | −€1.000/Monat | −€12.000 (auf €101.673) | MITTEL |
| Virale Invite-Rate | −5pp (auf 5%) | −€8.000 (auf €105.673) | NIEDRIG |
| SEO-Traffic pro Post | −10 Visits | −€5.000 (auf €108.673) | NIEDRIG |

**Kern-Erkenntnis:** Churn und Zeit-bis-erstem-Kunde sind die hebelstärksten Variablen. Eine 3-monatige Verzögerung oder ein 3-Prozentpunkt-Anstieg im Churn reduzieren den 24-Monats-Umsatz jeweils um ~25%.

---

## 11. Use of Funds

### 11.1 Gesuchte Finanzierung

**Runde:** Angel / Pre-Seed zur Beschleunigung vom Zero-Bootstrap zu den ersten 10 zahlenden Kunden.

| Verwendung der Mittel | Allokation | Zweck |
|-----------------------|------------|-------|
| Security & Compliance | 30% | SOC 2 Type II Audit, HIPAA-Gap-Remediation, Penetration Testing |
| Engineering | 35% | FHIR-Integration, Multi-Tenant-Hardening, Lebendspender-Modul |
| Sales & Pilot Support | 20% | Erster CSM Hire, Pilot-Erfolgsmetriken-Tracking, Fallstudien-Produktion |
| Legal & Operations | 15% | BAAs, GDPR DPIA, Gründung, Cyber-Versicherung |

### 11.2 Erfolgsmetriken für diese Runde

| Metrik | Ziel |
|--------|------|
| 10+ zahlende Kunden in 3+ Transplant-Programmen | Proof of willingness to pay |
| €5K+ MRR | Founder-Compensation Break-Even |
| Net Revenue Retention >100% | Product-Market-Fit-Signal |
| SOC 2 Type II sauberer Report | Compliance-Gate für Enterprise-Verkauf |
| 1 veröffentlichte Pilot-Fallstudie mit Zeit-bis-Warteliste-Verbesserungsdaten | Vertriebs-Kollateral |

### 11.3 Investitions-Entscheidungs-Gates

| Gate | Bedingung | Entscheidung |
|------|-----------|--------------|
| **Grün** | 10+ zahlende Kunden, €5K MRR, NRR >100% | Angel/Seed-Runde zur Beschleunigung erwägen |
| **Gelb** | 3–9 zahlende Kunden, €1K–€5K MRR | Bootstrap fortsetzen; bei Monat 18 neu bewerten |
| **Rot** | <3 zahlende Kunden bei Monat 12 | Produkt, Pricing oder Pivot neu bewerten |

---

## 12. Roadmap & Exit Opportunities

### 12.1 Produkt-Roadmap

| Phase | Timeline | Meilensteine |
|-------|----------|-------------|
| **Phase 1: MVP — „Nieren-Readiness-Kern“** | Monate 1–6 | Nieren-spezifische Checklisten, Patient-Koordinator-Chat, Basis-Dokumenten-Workflows, Patientenbildung, FHIR read-only |
| **Phase 2: Expansion — „Multi-Organ + Lebendspender“** | Monate 6–18 | Herz, Leber, Lunge Module; Lebendspender-Workflows; FHIR write mit Approval; Koordinator-Dashboard + Analytics; Care-Team-Rollen-Erweiterung |
| **Phase 3: Skalierung — „KI, Benchmarking, EU“** | Monate 18–36 | KI-Personalisierung (kein medizinischer Rat); SRTR/OPTN Reporting-Automatisierung; EU-Expansion (Deutschland BfArM/DiGA, Italien CNT); Pädiatrisches Modul |

### 12.2 Compliance-Roadmap

| Jurisdiktion | Framework | Status |
|--------------|-----------|--------|
| **USA** | HIPAA + HITECH | Architektur designed; BAA-Verhandlungen ausstehend |
| **EU** | GDPR (Art. 9 Sonderkategorie-Daten) | DPIA geplant Monat 6; EU-Hosting-Architektur Monat 9 |
| **Deutschland** | BfArM DiGA Fast-Track | Machbarkeitsprüfung Monat 12–18 |
| **Italien** | CNT + GDPR | Lokalisierte Workflows geplant; erster Pilot in Bologna/Padua |
| **UK** | NHS Data Security Standards | Phase-3-Expansion via NHSBT-Partnerschaft |

### 12.3 Exit Opportunities

**Szenario 1: Strategischer Verkauf (wahrscheinlichster Exit)**
- **Potenzielle Käufer:** CareDx (ergänzt ihre Post-Transplant-Diagnostik mit Pre-Transplant-Koordination), Epic/Cerner (embedded widget oder Akquisition), Get Well/SeamlessMD (erweitert Portfolio um Transplant-Tiefe)
- **Timeline:** Jahre 5–7
- **Preisantrieb:** Domänen-Tiefe + koordinator-Community + Compliance-Zertifizierungen

**Szenario 2: Wachstum zu einer €10M+ ARR-Plattform**
- Bei 50 Enterprise-Kunden à €200K/Jahr = €10M ARR
- Multiplikator für Healthcare SaaS: 5–8x ARR
- **Timeline:** Jahr 7–10

**Szenario 3: Roll-Up / Private Equity**
- Weniger wahrscheinlich bei kleinem Markt, aber möglich wenn Multi-Organ-Module und EU-Expansion den TAM erweitern

**Szenario 4: Weiteres Funding (Series A/B)**
- Nach €5M ARR und 3+ Enterprise-Verträgen
- Für europäische Expansion und KI-Entwicklung

### 12.4 Risikofaktoren & Abschwächungen

#### Kritische Risiken (Existenzgefährdend)

| Risiko | Wahrscheinlichkeit | Impact | Abschwächung |
|--------|-------------------|--------|-------------|
| EHR-Integration dauert >6 Monate | Mittel | Hoch | SMART on FHIR als Fallback; manueller CSV-Import für Pilot |
| Vertriebszyklus >18 Monate | Mittel | Hoch | Fokus auf mid-tier Programme; 90-Tage-Pilot mit Erfolgsmetriken |
| CareDx oder Epic startet Readiness-Feature | Niedrig-Mittel | Sehr hoch | Tiefe Domain-Fokussierung; Koordinator-Community aufbauen |
| HIPAA-Breach oder GDPR-Beschwerde | Niedrig | Existenzgefährdend | Compliance-first Build; keine PHI in dev/staging; automatisiertes Security Scanning; Cyber-Versicherung |
| FDA klassifiziert Checklisten als SaMD | Niedrig | Hoch | Nur pädagogischer Content; keine diagnostischen Empfehlungen; klare Disclaimer |

#### Moderate Risiken (Wachstumsverlangsamung)

| Risiko | Wahrscheinlichkeit | Impact | Abschwächung |
|--------|-------------------|--------|-------------|
| SEO braucht >12 Monate | Hoch | Mittel | Diversifizierung in Community + Partnerschaften |
| Patientenakzeptanz niedrig (ältere Demografie) | Mittel | Mittel | Caregiver-Proxy-Zugang; Barrierefreiheit (WCAG 2.1 AA) |
| Wettbewerber startet ähnliches Free Tool | Niedrig | Mittel | Time-to-Market; Community-Moat aufbauen |

#### Invalidierungsszenarien

1. **Wenn >30% der Transplant-Koordinatoren zufrieden mit Epic MyChart + Tabellen sind** → Pivot zu EHR-embedded Widget (SMART on FHIR App) statt Standalone-Plattform.
2. **Wenn CareDx innerhalb 12 Monate eine Patient-Readiness-App baut** → Beschleunige Differenzierung bei Echtzeit-Chat und Lebendspende-Workflow; Partnerschaft erwägen.
3. **Wenn Krankenhaus-IT-Budgets für Transplantationsprogramme kollabieren** → Shift zu nutzungsbasiertem Modell (pro Patient) zur Ausrichtung mit variablen Budgets.
4. **Wenn GDPR-U.S.-Datenflüsse prohibitiv teuer werden** → EU-Expansion verzögern; 24–36 Monate rein U.S.-fokussiert.

---

## Anhang: Datenquellen & Annahmen

**Alle Marktdaten aus:** SRTR/OPTN, WHO, Eurotransplant, NHSBT, CNT, und Live-Wettbewerber-Website-Inspektion.

**Finanzprojektionen sind Szenario-Planungswerkzeuge, keine Prognosen.** Alle Annahmen explizit im Zero-Budget Financial Model dokumentiert.

**Vertraulich — nicht zur Weitergabe bestimmt.**

---

*Dokument erstellt für Kanban Task t_d53d53f3. Basiert auf: NephroAssist Business Strategy (t_7a710525), Zero-Budget Financial Model (t_59df76ad), Zero-Budget GTM Action Plan (t_9f0a98cb), Consolidated Research (t_c269008b), Italian Market Localization Brief (t_04c2cd98), und Competitive Positioning Italy (t_fa7c7149).*
