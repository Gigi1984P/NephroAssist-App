# NephroAssist — Investor Memo

**Tiefenanalyse für Investoren: Transplant-Spezifische Patient-Readiness & Care-Coordination Platform**

*August 2026 | Vertraulich — Nicht zur Weitergabe bestimmt*

---

## Executive Summary

NephroAssist ist eine B2B-SaaS-Plattform für die Koordination der prätransplantativen Patientenvorbereitung. Sie adressiert eine echte Marktlücke: Kein Wettbewerber bietet eine transplant-spezifische Patienten-App mit kombiniertem Task-Management, Echtzeit-Kommunikation zwischen Patient und Koordinator sowie dokumentenbasierten Workflows. Das Unternehmen befindet sich in der Pre-Seed-Phase mit existierendem Codebase, klarer Go-to-Market-Strategie und einem Zero-Bootstrap-Modell, das auf den ersten zahlenden Kunden bis Monat 6 abzielt.

---

## 1. Detaillierte Marktgrößenanalyse

### 1.1 U.S. Markt

| Metrik | Wert | Quelle |
|--------|------|--------|
| Transplantationsprogramme | ~250+ | SRTR/OPTN |
| Nierenerkrankte auf Warteliste | ~90.000 | SRTR |
| Jährliche Transplantationen (alle Organe) | ~40.000+ | SRTR |
| Davon Nierentransplantationen | ~70% aller solid-organ Tx | WHO |

**TAM (U.S. only):**
- Bei €5K–€50K pro Programm/Jahr: **€1,25M–€12,5M jährlich**
- Sich erweiternd durch Multi-Organ-Module (Herz, Leber, Lunge)

### 1.2 EU + UK Markt

| Region | Programme | Jährliche Tx | Quelle |
|--------|-----------|--------------|--------|
| Eurotransplant (8 Länder) | ~150–200 | >13.000 | Eurotransplant |
| UK (NHSBT) | ~30–50 | ~4.000+ | NHSBT |
| Gesamtes EU+UK | ~250–300 | ~17.000+ | Aggregat |

**Interpretation:** Die EU+UK hat ungefähr die gleiche Programm-Anzahl wie die USA, verdoppelt also das addressierbare Marktvolumen. Der EU-Markt erfordert GDPR-Konformität (Art. 9 Sonderkategorien-Daten) und potenziell DiGA-Zulassung in Deutschland.

### 1.3 Marktwachstum & Trends

1. **Patientenerwartungen steigen:** Mobile-first, Echtzeit-Updates, transparente Kommunikation — aktuelle EHR-Module hinken hinterher.
2. **Value-based care Druck:** CMS und Kostenträger fordern bessere Outcomes bei niedrigeren Kosten. Reduzierte No-Shows und schnellere Listing-Zeiten haben klaren ROI.
3. **Remote Monitoring & PROs:** Patient-Reported Outcomes werden zum Standard — Wettbewerber wie SeamlessMD positionieren sich hier.
4. **KI-Personalisierung als Hygiene-Faktor:** Get Well (RhythmX), Commure und Mytonomy positionieren KI als Kern. Innerhalb von 2–3 Jahren wird dies erwartet.
5. **Lebendspende-Programme wachsen:** Organmangel treibt Lebendspende-Koordination — ein unterversorgtes Subsegment.

---

## 2. Unit Economics

### 2.1 Pricing Tiers & Annahmen

| Tier | Zielgruppe | Preis/Jahr | Scope |
|------|------------|------------|-------|
| **Free** | Einzelpatienten & Angehörige | €0 | Persönliche Checkliste, Alarme, Bildung |
| **Starter** | Kleine Programme (≤50 Patienten) | €2.999 | Koordinator-Dashboard, Templates, Basis-Analytics |
| **Professional** | Mittlere Programme (≤200 Patienten) | €7.999 | Care-Team-Chat, FHIR-Integration, Custom Workflows |
| **Enterprise** | Große Health Systems / IDNs | €20K–€50K | Unlimitiert, SSO, SLA, dedizierter CSM |

### 2.2 Customer Lifetime Value (LTV)

| Tier | Monatlicher Preis | Ø Lifetime (Monate) | LTV | Berechnung |
|------|-------------------|---------------------|-----|------------|
| Starter (BEAR) | €250 | 6 | €1.500 | 250 × (1/0,08) |
| Starter (BASE) | €250 | 20 | €5.000 | 250 × (1/0,05) |
| Starter (BULL) | €250 | 33 | €8.333 | 250 × (1/0,03) |
| Professional (BASE) | €667 | 20 | €13.333 | 667 × (1/0,05) |
| Enterprise (BASE) | €3.000 | 48 | €144.000 | 3.000 × 12 × (1/0,25) |

### 2.3 Customer Acquisition Cost (CAC) & Payback

**Cash-Basis CAC = €0** (by design: kein bezahltes Marketing, nur Founder-Zeit)

| Szenario | Impliziter CAC (bei €80K Founder-Gehalt/Jahr) | Payback-Periode |
|----------|-----------------------------------------------|-----------------|
| BEAR | ~€6.667/Kunde (bei 1 Kunde/Quartal) | >12 Monate |
| BASE | ~€2.222/Kunde (bei 3 Kunden/Quartal) | 1–4 Monate |
| BULL | ~€833/Kunde (bei 8 Kunden/Quartal) | <1 Monat |

### 2.4 LTV:CAC Ratio

| Szenario | LTV:CAC (Cash) | LTV:CAC (Founder-Zeit kalkuliert) | Bewertung |
|----------|----------------|-----------------------------------|-----------|
| BEAR | Unendlich | ~0,2:1 | Nicht tragfähig bei monetarisierter Founder-Zeit |
| BASE | Unendlich | ~6:1 | Tragfähig für Bootstrap |
| BULL | Unendlich | ~16:1 | Stark tragfähig |

**Kern-Erkenntnis:** Im Zero-Budget-Modell sind die Unit Economics auf Cash-Basis vorteilhaft, da marginaler CAC = 0. Das Risiko liegt in der Akquisitionsgeschwindigkeit, nicht in der Rentabilität pro Kunde.

---

## 3. Risikofaktoren & Abschwächungen

### 3.1 Kritische Risiken (Existenzgefährdend)

| Risiko | Wahrscheinlichkeit | Impact | Abschwächung | Owner |
|--------|-------------------|--------|--------------|-------|
| EHR-Integration dauert >6 Monate | Mittel | Hoch | SMART on FHIR als Fallback; manueller CSV-Import für Pilot | developer-lead |
| Vertriebszyklus >18 Monate | Mittel | Hoch | Fokus auf mid-tier Programme (nicht IDNs); 90-Tage-Pilot mit Erfolgsmetriken | sales-lead |
| CareDx oder Epic startet Readiness-Feature | Niedrig-Mittel | Sehr hoch | Tiefe Domain-Fokussierung (Nieren-Checklisten-Tiefe); Koordinator-Community aufbauen | product-lead |
| HIPAA-Breach oder GDPR-Beschwerde | Niedrig | Existenzgefährdend | Compliance-first Build; keine PHI in dev/staging; automatisiertes Security Scanning; Cyber-Versicherung | compliance-officer |
| FDA klassifiziert Checklisten als SaMD | Niedrig | Hoch | Nur pädagogischer Content; keine diagnostischen Empfehlungen; klare "consult your care team" Disclaimer | compliance-officer + legal |

### 3.2 Moderate Risiken (Wachstumsverlangsamung)

| Risiko | Wahrscheinlichkeit | Impact | Abschwächung |
|--------|-------------------|--------|--------------|
| SEO braucht >12 Monate | Hoch | Mittel | Diversifizierung in Community + Partnerschaften |
| Patientenakzeptanz niedrig (ältere Demografie) | Mittel | Mittel | Caregiver-Proxy-Zugang; Barrierefreiheit (WCAG 2.1 AA) |
| Wettbewerber startet ähnliches Free Tool | Niedrig | Mittel | Time-to-Market; Community-Moat aufbauen |

### 3.3 Invalidierungsszenarien

1. **Wenn >30% der Transplant-Koordinatoren zufrieden mit Epic MyChart + Tabellen sind** → Pivot zu EHR-embedded Widget (SMART on FHIR App) statt Standalone-Plattform.
2. **Wenn CareDx innerhalb 12 Monate eine Patient-Readiness-App baut** → Beschleunige Differenzierung bei Echtzeit-Chat und Lebendspende-Workflow; Partnerschaft erwägen.
3. **Wenn Krankenhaus-IT-Budgets für Transplantationsprogramme kollabieren** → Shift zu nutzungsbasiertem Modell (pro Patient) zur Ausrichtung mit variablen Budgets.
4. **Wenn GDPR-U.S.-Datenflüsse prohibitiv teuer werden** → EU-Expansion verzögern; 24–36 Monate rein U.S.-fokussiert.

---

## 4. Regulatorischer Pfad

### 4.1 Jurisdiktions-Rollout

| Priorität | Markt | Primäres Framework | Einstiegsstrategie |
|-------------|-------|--------------------|--------------------|
| 1 | USA | HIPAA + HITECH + State Privacy Laws | Launch-Markt. BAAs mit Hosting-Provider und Sub-Prozessoren. SOC 2 Type II innerhalb 6 Monaten nach erstem zahlenden Kunden. |
| 2 | EU | GDPR + nationale Gesundheitsgesetze | Start erst nach abgeschlossenem DPIA, SCCs für U.S.–EU-Transfers und EU-Hosting-Option. Deutschland (BfArM/DiGA) als erster EU-Markt. |
| 3 | UK | UK GDPR + NHS Data Security Standards | NHS Data Security and Protection Toolkit erforderlich. Best via NHSBT-Partnerschaft oder Pilot, nicht Direktvertrieb. |

### 4.2 Compliance-Meilensteine

| Meilenstein | Zieldatum | Owner | Nachweis |
|-------------|-----------|-------|----------|
| HIPAA Security Rule Gap Analysis | Monat 1 | compliance-officer | Dokumentiertes Risiko-Register |
| Signierte BAA mit Cloud-Provider + Sub-Prozessoren | Monat 2 | compliance-officer | Unterzeichnete Verträge |
| SOC 2 Type II Audit Engagement | Monat 3 | compliance-officer | Engagement Letter mit Auditor |
| GDPR DPIA abgeschlossen | Monat 6 | compliance-officer | Veröffentlichtes DPIA-Dokument |
| ISO 27001 Readiness Assessment | Monat 9 | compliance-officer | Gap Report |
| SOC 2 Type II Report ausgestellt | Monat 12 | compliance-officer | Sauberer Auditor Report |
| DiGA Machbarkeitsprüfung (Deutschland) | Monat 12–18 | compliance-officer + product | Go/No-Go Entscheidungsdokument |

### 4.3 Patienten-Daten-Einwilligungsarchitektur

**USA:**
- HIPAA erlaubt treatment-basierte Offenlegung ohne explizite pro-Feature-Einwilligung
- Plattform muss jedoch ein **Notice of Privacy Practices (NPP)** Äquivalent beim Onboarding anzeigen
- Nicht-treatment Nutzung (Analytics, Benchmarking, Produktverbesserung) erfordert **Opt-in-Einwilligung** oder De-Identifizierung nach Safe-Harbor-Standard

**EU:**
- Gesundheitsdaten sind Art. 9 "Sonderkategorie"
- Rechtsgrundlage für klinische Nutzung: **Art. 9(2)(h)** — Gesundheitsversorgung
- Rechtsgrundlage für Analytics / KI-Training: **explizite Einwilligung (Art. 9(2)(a))** — granular, widerrufbar, separat auditierbar
- Grenzüberschreitender Transfer in USA: Erfordert EU-U.S. Data Privacy Framework Zertifizierung oder SCCs mit Transfer Impact Assessment (TIA)

**Design-Implikation:** Baue ein **granulares Consent-Management-Modul** von Tag 1 ein. Keine Annahme, dass eine einzelne Blanket-Einwilligung alle Use-Cases abdeckt. Dies ist nicht nur Compliance-Anforderung, sondern Produkt-Differenzierer — kein generischer Wettbewerber (SeamlessMD, Get Well) bietet dieses Level an Patientenkontrolle.

---

## 5. Technologie-Moat

### 5.1 Domain Model

Das Herzstück von NephroAssist ist ein **transplant-spezifisches Domain Model**, das die 5-stufige Transplantationsreise in code gegossen abbildet:

1. **Überweisung / Referral** — Einweisung durch Nephrologen
2. **Verordnung / Evaluation** — Labor, Bildgebung, kardiale Abklärung, psychosoziale Bewertung
3. **Termin / Scheduling** — Klinikbesuche, Follow-ups
4. **Bericht anfordern + hochladen / Document Collection** — Anforderung, Upload, Review, Freigabe
5. **Prüfung / Readiness Review** — Finale Freigabe für die Warteliste

Dieses Modell ist nicht generisch übertragbar — es erfordert tiefe Kenntnis der Transplantations-Koordinator-Arbeitsabläufe und unterscheidet sich fundamental von generischen Care-Journey-Tools.

### 5.2 Workflow Engine

- **Zustandsmaschine pro Patient:** Jeder Patient durchläuft organ-spezifische Checklisten mit definierten Übergängen, Genehmigungsketten und Eskalationsregeln
- **Audit-Trail:** Jede Statusänderung, jeder Dokumenten-Upload, jede Chat-Nachricht wird mit Zeitstempel, Benutzer-ID und Tenant-Kontext protokolliert
- **Tenant-Isolation:** PostgreSQL Row-Level Security (RLS) stellt sicher, dass Patientendaten programm-übergreifend isoliert sind

### 5.3 Architektur-Stack

| Komponente | Technologie | Verantwortung |
|------------|-------------|---------------|
| Web Frontend | Next.js 16 App Router + React 19 + Bootstrap 5.3 | Patienten-PWA, Koordinator-Dashboard, Admin-Panels, Echtzeit-Chat UI |
| Backend API | Next.js API Routes (Node.js serverless) | REST Endpoints, Business Logic, Auth, Tenant Resolution, FHIR Proxy |
| Background Jobs | Redis + BullMQ | OCR-Pipeline, E-Mail-Benachrichtigungen, Erinnerungs-Dispatch, Audit-Log-Archivierung |
| Database | PostgreSQL 15 + Prisma ORM + RLS | ACID-Transaktionen, Tenant-Scoped Queries, Audit Logs |
| Cache/Queue | Redis | Session Store, Rate-Limit Counter, Job Queues, Pub/Sub für Messaging |
| Object Storage | S3-kompatibel (Vercel Blob / AWS S3 / Cloudflare R2) | Verschlüsselte Dokumentenspeicherung, Presigned URLs |
| AI Gateway | Next.js API Route + Service Layer | PHI-Redaktion, Prompt-Versioning, Provider-Auswahl |

### 5.4 Integrations-Strategie

- **Phase 1 (read-only):** SMART on FHIR Launch aus Epic/Cerner Patient-Kontext. Liest Demographics, Appointments, Labs, Allergies, Medications. Kein Writeback.
- **Phase 2 (write mit Approval):** Schreibt Patient-Reported Outcomes (PROs) und Care-Plan-Tasks zurück in EHR, aber nur nach klinischer Review und elektronischer Unterschrift.
- **Phase 3 (bidirectional sync):** Volle Care-Plan-Synchronisation. Erfordert umfangreiches Testing pro EHR-Version.

---

## 6. Finanzprojektionen (3-Jahres-Horizont)

### 6.1 Szenario-Parameter

| Parameter | BEAR | BASE | BULL |
|-----------|------|------|------|
| Zeit bis erster zahlender Kunde | Monat 9 | Monat 6 | Monat 3 |
| Neue Starter-Kunden/Monat (Peak) | 1 | 3 | 8 |
| Neue Professional-Kunden/Monat (Peak) | 0 | 1 | 3 |
| Neue Enterprise-Kunden/Quartal | 0 | 0,5 | 1 |
| Monatliche Churn (Starter/Pro) | 8% | 5% | 3% |
| Jährliche Churn (Enterprise) | 50% | 25% | 15% |
| Net Revenue Retention | 100% | 105% | 115% |

### 6.2 Umsatzprojektion (24 Monate)

| Monat | Free Users | Starter | Professional | Enterprise | MRR (€) | Kumulierter Umsatz (€) |
|-------|------------|---------|--------------|------------|---------|------------------------|
| **BASE Scenario** | | | | | | |
| 6 | 500 | 2 | 0 | 0 | 500 | 500 |
| 9 | 800 | 4 | 1 | 0 | 1.667 | 5.501 |
| 12 | 1.200 | 6 | 2 | 0 | 3.334 | 14.835 |
| 15 | 1.600 | 8 | 3 | 0 | 5.001 | 28.668 |
| 18 | 2.000 | 10 | 4 | 1 | 8.334 | 51.669 |
| 21 | 2.500 | 12 | 5 | 1 | 9.335 | 80.670 |
| 24 | 3.000 | 14 | 6 | 2 | 12.002 | 113.673 |

| **BULL Scenario** | | | | | | |
| 3 | 600 | 3 | 0 | 0 | 750 | 750 |
| 6 | 1.500 | 8 | 2 | 0 | 3.334 | 7.752 |
| 9 | 3.000 | 15 | 5 | 1 | 9.335 | 32.679 |
| 12 | 5.000 | 22 | 9 | 2 | 17.003 | 83.688 |
| 18 | 8.000 | 30 | 15 | 4 | 29.505 | 252.696 |
| 24 | 12.000 | 38 | 22 | 6 | 43.174 | 486.714 |

### 6.3 Break-Even-Analyse

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

### 6.4 Runway & Funding-Bedarfsanalyse

**Zero-Bootstrap Runway (kein externes Funding):**

| Szenario | Monatlicher Cash Burn | Runway (Monate) | Risiko |
|----------|----------------------|-----------------|--------|
| BEAR | €100 | 50 Monate | Sehr niedriges Cash-Risiko; hohes Zeit/Opportunitätsrisiko |
| BASE | €120 | 42 Monate | Niedriges Cash-Risiko |
| BULL | €150 | 33 Monate | Niedriges Cash-Risiko |

**Kritische Meilensteine vor externem Funding:**

| Meilenstein | Ziel (BASE) | Warum es wichtig ist |
|-------------|-------------|---------------------|
| 10 zahlende Kunden | Monat 9 | Proof of willingness to pay |
| €5K MRR | Monat 12 | Founder-Compensation Break-Even |
| 1 Enterprise-Kunde | Monat 18 | Validiert Large-Contract-Sales-Motion |
| Net Revenue Retention >100% | Monat 15 | Product-Market-Fit-Signal |
| Referral/Organic >50% neuer Leads | Monat 12 | Validiert CAC=0 Skalierbarkeit |

---

## 7. Sensitivitätsanalyse

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

## 8. Empfohlene Investitions-Entscheidungs-Gates

| Gate | Bedingung | Entscheidung |
|------|-----------|--------------|
| **Grün** | 10+ zahlende Kunden, €5K MRR, NRR >100% | Angel/Seed-Runde zur Beschleunigung erwägen |
| **Gelb** | 3–9 zahlende Kunden, €1K–€5K MRR | Bootstrap fortsetzen; bei Monat 18 neu bewerten |
| **Rot** | <3 zahlende Kunden bei Monat 12 | Produkt, Pricing oder Pivot neu bewerten |

---

*Alle Marktdaten aus SRTR/OPTN, WHO, Eurotransplant, NHSBT und Live-Wettbewerber-Website-Inspektion. Finanzprojektionen sind Szenario-Planungswerkzeuge, keine Prognosen. Alle Annahmen explizit im Zero-Budget Financial Model (t_59df76ad) dokumentiert. Vertraulich — nicht zur Weitergabe bestimmt.*
