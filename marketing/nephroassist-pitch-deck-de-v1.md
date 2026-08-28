# NephroAssist — Pitch Deck

**Die erste transplant-spezifische Patient-Readiness & Care-Coordination Plattform**

*Für Investoren und strategische Partner | August 2026*

---

## Slide 1: Cover — Der Hook

# NephroAssist
## Jeder Transplant-Patient verdient einen klaren Pfad. Jeder Koordinator verdient mehr als Excel.

**Transplant-Spezifische Patient-Readiness & Care-Coordination Plattform**

---

**Sprechernotizen:**
Willkommen. Ich bin [Name], Gründer von NephroAssist. Heute zeige ich Ihnen, warum die komplexeste Patientenreise in der Medizin — der Weg zum Organtransplantat — immer noch mit Excel, Telefonaten und Post-its verwaltet wird. Und wie wir diese Lücke schließen. Das ist keine Idee aus dem Silicon Valley. Das ist ein Problem, das Transplant-Koordinatoren jeden Tag erleben.

---

## Slide 2: Das Problem — Die Transplant-Koordinationskrise

**Die komplexeste Patientenreise der Medizin läuft auf Tabellenkalkulation.**

- **90.000+** Nierenpatienten auf der US-Warteliste
- **250+** Transplantationsprogramme allein in den USA
- Koordinatoren managen **50+ Patienten** gleichzeitig über 5 Evaluationsstufen
- **10+ Stunden/Woche** gehen für Dokumentenjagd und Erinnerungsanrufe verloren
- Versäumte Termine und unvollständige Evaluationen **verzögern die Listung um Wochen oder Monate**
- **Kein dediziertes Tool existiert** für die prätransplantative Koordination

> „Wir tracken alles in Excel. Wenn ein Koordinator krank ist, weiß niemand, wo was steht.“
> — Transplant-Koordinator, Midwest Academic Medical Center

---

**Sprechernotizen:**
Der Transplant-Koordinator ist die wichtigste nicht-chirurgische Rolle im gesamten Prozess. Sie steuern die Evaluation, die Dokumentensammlung, die Terminplanung und die Patientenkommunikation — oft für 50 Patienten gleichzeitig. Und das Werkzeug? Excel, Telefon, E-Mail. Das ist kein Workflow-Problem. Das ist ein Patientensicherheitsproblem. Jede Woche Verzögerung bedeutet mehr Zeit auf der Warteliste. Das ist Lebenszeit.

---

## Slide 3: Die Lösung — NephroAssist

**Die erste Plattform, die zwischen EHR und Patient sitzt — speziell für die Transplantation.**

Was sie tut:
- Strukturierte, organ-spezifische Readiness-Checklisten (Niere → Herz, Leber, Lunge)
- Echtzeit-Chat zwischen Patient und Koordinator (nicht telefonisch wie CareDx)
- Automatisierte Dokumenten-Collection und Review-Workflows
- Medikamenten-Einnahme-Erinnerungen mit Care-Team-Sichtbarkeit
- Patientenbildung entlang der 5-stufigen Transplant-Reise

Wie sie integriert:
- SMART on FHIR Launch aus Epic/Cerner — liest Labs, Termine, Demografie
- Positioniert als **Koordinations-Layer**, nicht als EHR-Ersatz
- HIPAA-ready Architektur; GDPR-Lokalisierungspfad für die EU

---

**Sprechernotizen:**
Wir ersetzen nicht das EHR. Wir ergänzen es. NephroAssist ist die Schicht, die fehlt: zwischen dem klinischen System (Epic, Cerner) und dem Patienten. Wir geben dem Koordinator ein Dashboard, das zeigt, wo jeder Patient steht. Wir geben dem Patienten eine App, die ihm sagt, was als Nächstes zu tun ist. Das ist keine technologische Neuerung — das ist eine Design-Entscheidung. Wir haben die Reise vom Koordinator aus gedacht, nicht vom CIO.

---

## Slide 4: Produkt — Vier Wertschichten

```
┌─────────────────────────────────────────────┐
│  Schicht 4: Intelligence & Analytics         │
│  — Koordinator-Dashboards, Fertigstellungsraten│
│    Time-to-Listing, SRTR-Reporting            │
├─────────────────────────────────────────────┤
│  Schicht 3: Transplant-Workflow-Engine     │
│  — Organ-spezifische Checklisten, Dokumenten-│
│    Review, Freigabeketten, Audit-Trails       │
├─────────────────────────────────────────────┤
│  Schicht 2: Dialyse & Prä-Transplant-Koordination│
│  — Terminplanung, Lab-Tracking, Überweisungen,│
│    Care-Team-Chat                             │
├─────────────────────────────────────────────┤
│  Schicht 1: Patienten-Ausführungsschicht    │
│  — Mobile PWA, Aufgaben-Checklisten, Medikamenten-│
│    Erinnerungen, Bildungscontent, Fortschritts-│
│    Tracking                                   │
└─────────────────────────────────────────────┘
```

**MVP (Monate 1–6):** Schicht 1 + 2, nur Niere
**Phase 2 (Monate 6–18):** Herz, Leber, Lunge; Lebendspende-Workflows
**Phase 3 (Monate 18–36):** KI-Personalisierung, EU-Expansion, SRTR-Automatisierung

---

**Sprechernotizen:**
Unsere Architektur ist bewusst in Schichten aufgebaut. Die unterste Schicht ist die Patienten-App — das ist, was der Patient sieht. Darüber die Koordinations-Schicht für das Care Team. Darüber die Workflow-Engine mit Checklisten und Genehmigungen. Ganz oben die Analytics-Schicht, die dem Programm-Direktor zeigt, wie schnell Patienten durch die Evaluation kommen. Wir starten mit Niere, weil 70% aller solid-organ Transplantate Nieren sind. Das ist unser Beachhead.

---

## Slide 5: Markt — Nische, Sticky, Unterversorgt

| Metrik | Wert | Quelle |
|--------|------|--------|
| US-Transplantationsprogramme | ~250+ | SRTR/OPTN |
| US-Nieren-Wartelisten-Patienten | ~90.000 | SRTR |
| Jährliche US-Transplantationen | ~40.000+ | SRTR |
| EU+UK Programme | ~250–300 | Eurotransplant + NHSBT |
| Jährliche EU+UK Transplantationen | ~17.000+ | Eurotransplant + NHSBT |

**Addressierbarer Markt (US):**
- TAM bei €5K–€50K/Programm/Jahr: **€1,25M–€12,5M jährlich**
- EU+UK verdoppelt die Programm-Anzahl
- Post-Transplant-Adherence, Lebendspende-Koordination und Pädiatrie erweitern TAM

**Warum dieser Markt gewinnt:**
- Sticky: Transplantationsprogramme wechseln selten Tools mitten im Zyklus
- Missionskritisch: Verzögerungen bei der Listung beeinflussen direkt das Patientenüberleben
- Aktuell versorgt durch EHR-Module mit bekannten Usability-Lücken

---

**Sprechernotizen:**
Das ist kein Milliardenmarkt. Das ist bewusst. Wir zielen auf eine Nische, die hochwertig, klebrig und unterversorgt ist. 250 Programme in den USA. Nochmal 250–300 in Europa. Ein einzelnes Enterprise-Konto bei €30K–€50K/Jahr ist lukrativ — und die Programme wechseln nicht alle zwei Jahre. Die Abschreibungsquote ist niedrig, weil Patientendaten migriert werden müssen und Koordinatoren umgelernt werden müssen. Das ist ein Verteidigungsgraben.

---

## Slide 6: Geschäftsmodell — Land-and-Expand B2B SaaS

| Tier | Zielgruppe | Jahrespreis | Scope |
|------|------------|-------------|-------|
| **Free** | Einzelpatienten & Angehörige | €0 | Persönliche Checkliste, Alarme, Bildung |
| **Starter** | Kleine Programme (≤50 Patienten) | €2.999/Jahr | Koordinator-Dashboard, Templates, Basis-Analytics |
| **Professional** | Mittlere Programme (≤200 Patienten) | €7.999/Jahr | Care-Team-Chat, FHIR-Integration, Custom Workflows |
| **Enterprise** | Große Health Systems / IDNs | €20K–€50K/Jahr | Unlimitiert, SSO, SLA, dedizierter CSM, Custom Integration |

**Pricing-Logik:**
- Alle Wettbewerber nutzen intransparente Enterprise-Sales — transparentes Pricing ist ein Vertrauensdifferenzierer
- Starter-Tier ist niedrig genug, um in einigen Zentren die Komitee-Freigabe zu umgehen
- Enterprise 20–40% unter vergleichbaren generischen Plattformen, um Displacement zu gewinnen

**Freemium-Flywheel:** Gratis Patienten-App → virale Koordinator-Einladungen → Trial → Paid Conversion

---

**Sprechernotizen:**
Unser Pricing ist transparent — das ist eine bewusste Abgrenzung. Jeder Wettbewerber in diesem Raum verkauft über opake Enterprise-Verträge. Wir zeigen Preise auf der Website. Das senkt die Einstiegsschwelle für kleinere Programme und baut Vertrauen. Der Freemium-Flywheel funktioniert so: Ein Patient nutzt die kostenlose App, erwähnt sie seinem Koordinator, der sich anmeldet, und wir konvertieren in ein bezahltes Konto. Kein bezahltes Marketing nötig.

---

## Slide 7: Traction & Pilot-Readiness

**Aktueller Stand:**
- Bestehende Next.js Codebase mit Patienten-/Fall-/Aufgaben-Workflows
- Dokumenten-Upload & Review-Pipeline
- Dashboard & Analytics-Ansichten
- Bootstrap 5.3 PWA-ready UI

**Sicherheits- & Compliance-Lücken werden geschlossen:**
- Middleware JWT Bypass (P0) — Fix in Arbeit
- Hardcoded Fallback Secret (P0) — Fix in Arbeit
- Rate Limiting (P0) — Implementierung geplant
- SOC 2 Type II Audit Engagement: Ziel Monat 3

**Pilot-Strategie:**
- Ziel: 1 akademisches + 1 Community-Programm für Diversität
- 90-Tage-Pilot mit definierten Erfolgsmetriken (Checklisten-Fertigstellungsrate, eingesparte Koordinatorzeit)
- Manuelle Verträge; kein Self-Serve-Billing für ersten Umsatz nötig

---

**Sprechernotizen:**
Wir haben bereits einen funktionierenden Prototypen. Patienten-Workflows, Dokumentenmanagement, Dashboards — alles da. Was jetzt geschlossen wird, sind die Sicherheitslücken, die uns von einem Piloten mit echten Patientendaten trennen. Das ist kein „Wir brauchen 6 Monate Entwicklung“. Das ist „Wir brauchen 4–6 Wochen Security-Härtung“. Der erste Pilot kann in Monat 3 beginnen.

---

## Slide 8: Wettbewerbsvorteil — Warum wir gewinnen

1. **Domain-Tiefe:** Einzige Plattform, die für die 5-stufige Prä-Transplant-Reise gebaut wurde (Überweisung → Zentrumsauswahl → Evaluation/Listung → Wartezeit → Angebot/OP)

2. **First-Mover in der Lücke:** Kein Wettbewerber kombiniert transplant-spezifische Checklisten + Echtzeit-Patienten-Koordinator-Chat + Dokumenten-Workflows

3. **Compliance-first Architektur:** HIPAA-ready ab Tag 1; GDPR-Lokalisierungspfad; granulares Consent-Management — kein generischer Wettbewerber bietet dies

4. **Integration, nicht Ersatz:** SMART on FHIR Launch aus Epic/Cerner reduziert Beschaffungsfriction vs. Rip-and-Replace

5. **Koordinator-first Design:** Gebaut für den täglichen Schmerz, nicht für die CIO-Checkliste

---

**Sprechernotizen:**
Unser Wettbewerbsvorteil ist nicht eine Funktion. Es ist die Kombination aus Domain-Tiefe, Compliance und Design-Philosophie. CareDx ist tief im Transplant, aber hat keine Patienten-App. SeamlessMD hat eine Patienten-App, aber keine Transplant-Spezialisierung. Epic hat alles, aber die Koordinatoren beschweren sich über die Usability. Wir sind die einzigen, die genau diese Lücke bedienen: prä-transplantative Koordination, patientenfacing, compliance-ready.

---

## Slide 9: Team & Vision

**Founder-geführt, domain-informiert, compliance-first.**

Das Team vereint Healthcare-SaaS-Produkterfahrung mit tiefer Kenntnis des Transplant-Koordinator-Workflows. Der technische Stack (Next.js, PostgreSQL, Prisma, Bootstrap) ist produktionserprobt und evolvierbar.

**Vision:**
> Jeder Transplant-Patient auf der Welt sollte einen klaren, trackbaren Pfad von der Überweisung zum Transplantat haben — und jeder Koordinator sollte genau wissen, wo jeder Patient steht, ohne ein Tabellenblatt zu öffnen.

**Nächste Meilensteine:**
- Monat 3: Erste Pilot-Klinik live
- Monat 6: Erster zahlender Kunde
- Monat 12: SOC 2 Type II + 10 zahlende Kunden
- Monat 18: Erster Enterprise-Vertrag + FHIR-Read-Integration
- Jahr 2: Multi-Organ-Expansion + EU-Markteintritt

---

**Sprechernotizen:**
Wir sind kein Team aus McKinsey-Beratern, die ein Pitch-Deck für eine Branche geschrieben haben, die sie nicht verstehen. Wir haben direktes Feedback von Transplant-Koordinatoren eingebaut. Die Vision ist simpel: Kein Patient sollte auf der Warteliste vergessen werden, weil ein Dokument in einer E-Mail verloren ging. Das ist technisch lösbar. Das ist ein Design-Problem.

---

## Slide 10: Financial Projections — Drei Szenarien

**24-Monats-Umsatz (Zero-Bootstrap-Modell):**

| Szenario | J1 Umsatz | J2 Umsatz | 24-Mo Total |
|----------|-----------|-----------|-------------|
| **BEAR** (30%) | €2.750 | ~€0 | €2.750 |
| **BASE** (50%) | €14.835 | €98.838 | €113.673 |
| **BULL** (20%) | €83.688 | €403.026 | €486.714 |
| **Risk-adjusted expected** | | | **€155.005** |

**Kernannahmen:**
- Founder-only, kein bezahltes Marketing (CAC ≈ €0)
- Infrastrukturkosten: €70–€120/Monat
- Monatliche Churn: 3–8% (Starter/Pro); Jährliche Churn: 15–50% (Enterprise)
- Zeit bis erstem zahlenden Kunden: 3–9 Monate

**Unit Economics (BASE):**
- Starter LTV: €5.000 | Professional LTV: €13.333 | Enterprise LTV: €144.000
- Cash CAC: €0 | LTV:CAC = unendlich auf Cash-Basis

---

**Sprechernotizen:**
Unser Finanzmodell ist konservativ. Der BASE-Fall bringt €113K in 24 Monaten — ohne Marketingbudget, ohne Sales-Team, nur Founder-Zeit. Das ist kein „Wir werden Unicorns“. Das ist „Wir beweisen, dass Programme bereit sind zu zahlen, bevor wir Geld aufbrauchen.“ Der Bull-Fall zeigt, was möglich ist, wenn die virale Empfehlung funktioniert. Die Sensitivität ist hoch bei Churn und Zeit bis erstem Kunden — das sind die Hebel, die wir steuern.

---

## Slide 11: Der Ask — Mittelverwendung

**Gesucht:** Angel / Pre-Seed-Runde zur Beschleunigung von Zero-Bootstrap zu ersten 10 zahlenden Kunden

| Mittelverwendung | Anteil | Zweck |
|------------------|--------|-------|
| Sicherheit & Compliance | 30% | SOC 2 Type II Audit, HIPAA-Gap-Behebung, Penetration Testing |
| Engineering | 35% | FHIR-Integration, Multi-Tenant-Härtung, Lebendspende-Modul |
| Sales & Pilot-Support | 20% | Erster CSM-Hire, Pilot-Erfolgsmetriken, Case-Study-Produktion |
| Legal & Operations | 15% | BAAs, GDPR DPIA, Gründung, Cyber-Versicherung |

**Erfolgsmetriken für diese Runde:**
- 10+ zahlende Kunden über 3+ Transplantationsprogramme
- €5K+ MRR
- Net Revenue Retention >100%
- SOC 2 Type II Clean Report
- 1 veröffentlichte Pilot-Case-Study mit Time-to-Listing-Verbesserungsdaten

**Kontakt:**
- E-Mail: [investors@nephroassist.com]
- LinkedIn: [linkedin.com/company/nephroassist]
- Website: [nephroassist.com]

---

**Sprechernotizen:**
Wir suchen keine 10-Millionen-Runde. Wir suchen eine Angel- oder Pre-Seed-Investition, die uns von „kann funktionieren“ zu „funktioniert“ bringt. Die Hauptverwendung ist Compliance und Security — das ist der Einstiegsschwelle für jeden Krankenhaus-Kunden. 35% gehen in Engineering, um die FHIR-Integration und das Lebendspende-Modul zu bauen. 20% in Sales, um den ersten Customer Success Manager zu finanzieren. Wir messen Erfolg nicht an User-Zahlen. Wir messen an zahlenden Kunden, MRR und einem SOC 2 Report.

---

*Alle Marktdaten aus SRTR/OPTN, WHO, Eurotransplant, NHSBT und Live-Wettbewerber-Website-Inspektion. Finanzprojektionen sind Szenario-Planungswerkzeuge, keine Prognosen. Annahmen explizit im Zero-Budget Financial Model dokumentiert.*
