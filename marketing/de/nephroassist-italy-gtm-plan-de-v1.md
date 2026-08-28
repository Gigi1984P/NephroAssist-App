# NephroAssist — Italien-GTM Plan (Lightweight)

**Task:** t_fa7c7149  
**Sprache:** Deutsch (Referenzdokument für interne Abstimmung und Gründer-Entscheidungen)  
**Zielmarkt:** Italien  
**Datum:** 2026-08-28  
**Autor:** content-writer  
**Reviewer:** Offen  
**Freigegeben durch:** Offen

---

## Zusammenfassung

Dieser Lightweight-GTM-Plan beschreibt einen praxisnahen, ressourcenschonenden Markteintritt für NephroAssist in Italien. Er basiert auf dem bestehenden Zero-Budget-GTM-Plan (Task t_9f0a98cb) und adaptiert dessen Prinzipien für den italienischen Kontext: Ein kostenloser Pilot mit einem Zentrum, manuelle Verträge, keine Selbstbedienungs-Infrastruktur.

**90-Tage-Ziel:** Ein Pilotzentrum in Italien verpflichtet, erstes italienisches Patienten-Onboarding validiert, klinisches Testimonial generiert.

---

## 1. Strategische Grundlage

### 1.1 Warum Italien — und warum jetzt?

| Faktor | Deutschland | Italien |
|--------|-------------|---------|
| Transplantationsvolumen | ~1.800–2.000/Jahr | ~3.000–3.500/Jahr |
| Aktive Zentren | ~35–40 | ~40 |
| Wettbewerb (direkt) | Keiner | Keiner |
| Sprache der Plattform | Deutsch | Deutsch → Italienisch |
| Beschaffung | Rigid, aber transparent | Rigid, regional fragmentiert |
| Kliniker-Sprachkenntnisse | Deutsch nativ; Englisch variabel | Italienisch nativ; Englisch selten; Deutsch sehr selten |

**Kernargument:** Italien hat ein größeres Transplantationsvolumen als Deutschland bei gleichzeitig fehlendem Wettbewerb. Die Sprachbarriere ist hoch — aber das ist auch ein Verteidigungsgraben, sobald NephroAssist als erste nativ-italienische Lösung etabliert ist.

### 1.2 Produkt-Readiness für Italien

| Fähigkeit | Status | GTM-Implikation |
|-----------|--------|-----------------|
| Kerne-Patienten-/Fall-/Aufgaben-Workflows | Bereit | Demo kann gezeigt werden |
| Dokumenten-Upload & Review | Bereit | Lokaler Speicher akzeptabel für Pilot |
| Dashboard & Analytics | Bereit | ROI-Narrative für Klinikleitung zeigen |
| Sicherheit (JWT, Rate Limiting, Tenant Isolation) | **Nicht bereit** | Muss vor Live-Betrieb mit echten PHI behoben werden |
| Abrechnung/Stripe | Fehlt | Manuelle Rechnungstellung; keine Selbstbedienung |
| Passwort-Reset / E-Mail-Verifizierung | Fehlt | Admin erstellt Accounts manuell |
| Rechtliche Seiten (TOS, Privacy, Impressum) | Fehlt | Muss vor Pilot erstellt werden (italienisches Recht!) |
| Öffentliche Landing Page / SEO | Minimal | Italienische Landing Page nötig |
| Italienische Lokalisierung der App | Teils | UI-Texte müssen ins Italienische übersetzt werden |

**Quelle:** SaaS-Audit (t_c00353db), Sections 3, 8, 9.

---

## 2. Ideal Customer Profile (ICP) — Italien

### 2.1 Primärer ICP: Der „Excel-Koordinator" (italienische Variante)

| Attribut | Beschreibung |
|----------|-------------|
| **Titel** | Coordinatore Trapianti, Infermiere Specialista in Nefrologia, Assistente Sociale Ospedaliera |
| **Organisation** | Azienda Ospedaliera oder Policlinico Universitario |
| **Aktueller Workflow** | Papier-Checklisten, Excel, Telefonate an Patienten, E-Mail für Dokumentensammlung |
| **Schmerzintensität** | HOCH — 40–60 Patienten in Evaluation; verpasste Termine verzögern Wartelisten-Aufnahme; bürokratische Komplexität des CNT-Reportings |
| **Kaufeinfluss** | MITTEL — kann keine Verträge allein unterschreiben; muss Direttore di Struttura Complessa (DSC) oder Direttore Sanitario überzeugen |
| **Technikaffinität** | MITTEL — nutzt elektronische Krankenakten (FSE), frustriert über deren Starrheit |
| **Sprache** | Italienisch Muttersprache; Englisch limitiert in Community-Hospitals; Deutsch extrem selten |

**Kerninsight:** Italienische Koordinatoren haben dieselbe Excel-und-Telefon-Belastung wie deutsche oder US-amerikanische Kollegen — aber mit zusätzlicher regionaler Bürokratie (regionaler Gesundheitssystem-Variation). Das Tool muss sich so anfühlen, als würde es „italienische Workflows verstehen“, nicht nur deutsche übersetzen.

### 2.2 Sekundärer ICP: Der „innovationsfreundliche Direttore Sanitario"

| Attribut | Beschreibung |
|----------|-------------|
| **Titel** | Direttore della Unità Operativa Complessa (UOC) di Nefrologia e Dialisi; Direttore Sanitario |
| **Schmerz** | CNT-Reporting-Belastung, Wartelisten-Mortalität, Patienten-Ausfälle, Koordinator-Fluktuation, regionale Budgetzwänge |
| **Zahlungsbereitschaft** | HOCH — wenn das Tool reduzierte Tage-bis-Warteliste oder Ausfallreduktion demonstriert |
| **Vertriebszyklus** | 4–8 Monate für Pilot-Genehmigung; erfordert ethisches Komitee (Comitato Etico) oder Innovationskomitee |
| **Budgetverantwortlicher** | Oft regionales Gesundheitssystem (SSR — Servizio Sanitario Regionale); CapEx/OpEx-Genehmigung kann getrennt sein |

**Kerninsight:** Italienische öffentliche Krankenhäuser haben rigide Beschaffung. Ein „kostenloser Pilot" ist essenziell, um Beschaffungsausschüsse anfangs zu umgehen. Der Medizinische Direktor kümmert sich um **Daten** — publizierbare Metriken, CNT-Compliance, regionales Benchmarking.

---

## 3. Positionierung & Value Proposition

### 3.1 Positionierungsaussage (für italienischen Markt)

> „NephroAssist ist die erste Plattform, die speziell für die italienische Transplantationskoordination entwickelt wurde — nicht ein übersetztes deutsches Tool, sondern ein Produkt, das CNT-Reporting, regionale Gesundheitssysteme und italienische Patientenkommunikation versteht.“

### 3.2 Kernbotschaften pro Zielgruppe

**Für Koordinatoren:**
- „Weniger Telefonate, weniger Papier, mehr Patienten, die bereit sind für den Trapianto.“
- „Die einzige Plattform, die CNT-konforme Berichte automatisch aus Ihrem Dashboard generiert.“
- „Keine IT-Integration nötig für den Piloten — wir richten alles manuell ein.“

**Für Medizinische Direktoren:**
- „Messbare Reduktion der Zeit von Evaluation bis Wartelisten-Aufnahme.“
- „Vollständig GDPR-konform mit abgeschlossener DPIA und EU-Hosting.“
- „Daten, die Sie im Comitato Etico und gegenüber der Regione präsentieren können.“

**Für Patienten (über Koordinator):**
- „Endlich eine App, die auf Italienisch spricht — mit Erinnerungen über WhatsApp, nicht nur E-Mail.“
- „Ihr persönlicher Koordinator ist nur einen Chat entfernt.“

---

## 4. Zero-Budget-Akquisitionsstrategie (adaptiert für Italien)

### 4.1 Phase 1: Vorbereitung (Woche 1–2)

| Aktivität | Beschreibung | Ressourcen |
|-----------|-------------|------------|
| Italienische Landing Page erstellen | Eine Seite: Problem, Lösung, Proof Points, CTA „Richiedi una demo gratuita" | 1 Designer, 1 Content Writer |
| LinkedIn-Profil optimieren | Gründer-Profil auf Italienisch; Verbindungen mit italienischen Transplantationsprofis | Gründerzeit |
| Rechtliche Seiten (italienisch) | Privacy Policy (Informativa sulla Privacy), TOS (Termini di Servizio), Impressum | Externer italienischer Anwalt |
| Erste Kontaktliste erstellen | 40 Zentren identifizieren, Koordinatoren und Direttore auf LinkedIn/Xing finden | 1 Researcher, halber Tag |

### 4.2 Phase 2: Erste Kontaktaufnahme (Woche 3–4)

| Kanal | Taktik | Ziel |
|-------|--------|------|
| LinkedIn-Direktnachrichten | Persönliche Nachrichten an Koordinatoren (nicht Direktoren) | 15 Gespräche vereinbaren |
| Kongress-Anwesenheit | ERA-EDTA Congress, Italian Society of Nephrology (SIN) | Persönliche Kontakte knüpfen |
| Kalt-E-Mail (italienisch) | Kurze, respektvolle E-Mail mit Fallstudie aus deutschem Pilot | 5 Antworten erhalten |
| AIDO-Kontakt | Anfrage über Partnerschaft/Aufklärung | Vertrauensaufbau |

**LinkedIn-Template (Italienisch):**

> „Buongiorno [Name],
>
> So che gestisce la valutazione pre-trapianto con fogli Excel e telefonate. È così anche nel suo centro?
>
> Stiamo costruendo NephroAssist, uno strumento specifico per i coordinatori italiani, con checklist CNT-compatibili e promemoria WhatsApp per i pazienti.
>
> Le va di parlarne 15 minuti? Non è una vendita — è una conversazione di ricerca.
>
> Cordiali saluti,
> [Name], NephroAssist“

### 4.3 Phase 3: Pilot-Konvertierung (Woche 5–8)

| Schritt | Beschreibung |
|---------|-------------|
| **Discovery-Call** | 30-minütiges Zoom/Gespräch; verstehen Workflow, Schmerzpunkte, CNT-Reporting |
| **Demo** | 15-minütige Bildschirmfreigabe; zeige deutsche Version, erkläre Italienisierung |
| **Pilot-Angebot** | „90 Tage kostenlos. Keine IT-Integration nötig. Wir übersetzen Inhalte ins Italienische. Sie geben uns Feedback.“ |
| **Vertrag** | Manueller Vertrag (kein Stripe); Letter of Intent oder einfacher Dienstvertrag auf Italienisch |
| **Onboarding** | Manuell: Admin erstellt Accounts; Koordinator erhält persönliches Training (Remote) |

### 4.4 Phase 4: Pilot-Betrieb und Validierung (Woche 9–12)

| Metrik | Ziel |
|--------|------|
| Patienten onboardet | 10–20 Patienten im Pilot |
| Aufgaben erstellt | 50+ pro Patient |
| Dokumente hochgeladen | 30+ Dokumente |
| Koordinator-Feedback | Wöchentliches 15-minütiges Feedback-Gespräch |
| Patienten-Feedback | 3+ qualitative Interviews |
| Testimonial | 1 schriftliches oder video-basiertes Testimonial vom Koordinator |

---

## 5. Content-Produktionsplan

| Dokument | Sprache | Priorität | Verantwortlich | Deadline |
|----------|---------|-----------|----------------|----------|
| Landing Page — Italienisch | Italienisch | 1 | content-writer | Woche 2 |
| LinkedIn-Outreach-Templates | Italienisch | 1 | content-writer | Woche 2 |
| One-Pager / Product Sheet | Italienisch | 2 | content-writer | Woche 3 |
| Patienten-Bildungsmodule | Italienisch | 2 | content-writer | Woche 4 |
| FAQ — Patienten | Italienisch | 2 | content-writer | Woche 4 |
| Benachrichtigungs-Copy (App/SMS) | Italienisch | 2 | content-writer | Woche 4 |
| Requirement-Checklisten (Patienten-freundlich) | Italienisch | 3 | content-writer | Woche 5 |
| Patient Journey Guide (PDF) | Italienisch | 3 | content-writer | Woche 6 |
| Koordinator-Handbuch | Italienisch | 3 | content-writer | Woche 6 |
| Integrationsleitfaden / FHIR-Setup | Italienisch | 4 | content-writer | Woche 8 |
| Privacy Policy (Informativa sulla Privacy) | Italienisch | 1 | Externer Anwalt | Woche 2 |
| Terms of Service (Termini di Servizio) | Italienisch | 1 | Externer Anwalt | Woche 2 |
| Impressum / Legal Notice | Italienisch | 1 | Externer Anwalt | Woche 2 |
| Einwilligungsformulare (Digital) | Italienisch | 2 | Externer Anwalt + content-writer | Woche 4 |
| Fallstudien-Rahmenwerk | Italienisch + Deutsch | 3 | content-writer | Woche 8 |
| Italien-Marktforschung-Addendum | Deutsch | 1 | content-writer | Fertig |
| Italien-GTM-Plan (Lightweight) | Deutsch | 1 | content-writer | Fertig |
| Wettbewerbspositionierung — Italien | Deutsch | 2 | content-writer | Woche 3 |

---

## 6. Erfolgsmetriken

| Metrik | Ziel (90 Tage) | Ziel (6 Monate) | Ziel (12 Monate) |
|--------|---------------|-----------------|------------------|
| Pilotzentren verpflichtet | 1 | 3 | 5 |
| Patienten onboardet | 15 | 60 | 150 |
| Koordinator-Testimonials | 1 | 2 | 4 |
| Fallstudien (veröffentlicht) | 0 | 1 | 2 |
| Italienische Landing Page Besuche | 100 | 500 | 2.000 |
| LinkedIn-Verbindungen (italienisch) | 50 | 150 | 400 |
| Italienischer Umsatz (manuell) | €0 | €15.000 | €75.000 |

---

## 7. Risikomanagement

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|--------------------|--------|------------|
| Kein Zentrum will pilotieren | Mittel | Blocker | AIDO-Kontakt, persönliche Empfehlungen, „nur Forschung“-Framing |
| Sprachqualität nicht akzeptabel | Niedrig | Reputationsverlust | Professionelle medizinische Übersetzung + klinisches Review |
| IT-Integration verzögert Pilot | Mittel | Verzögerung | „Keine IT nötig“-Angebot für Pilot; manuelles Onboarding |
| GDPR/DSB blockiert | Mittel | Blocker | DPIA vorab; EU-Hosting; Anwaltsfreigabe |
| Regionale Fragmentierung | Hoch | Skalierungskomplexität | FHIR-konforme Architektur; regionale Konfigurationsmöglichkeiten |

---

## 8. Genehmigung und nächste Schritte

**Dieser Plan ist bereit für:**
- [ ] Gründer-Abstimmung auf Budget und Priorisierung
- [ ] Freigabe der italienischen Landing Page und Outreach-Templates
- [ ] Kontaktaufnahme mit ersten Pilotzentren

**Nächste Schritte:**
1. Abstimmung mit Task t_0f2c6e7b (italienische Markt-Inhalte) für konsistente Messaging
2. Erstellung der italienischen Rechtsseiten durch externen Anwalt
3. Start der LinkedIn-Outreach-Kampagne in Woche 3

---

*Ende des Dokuments*
