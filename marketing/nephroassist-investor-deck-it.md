# NephroAssist — Investor Deck

**Piattaforma per la Preparazione dei Pazienti al Trapianto e la Coordinazione del Care Team**

*Agosto 2026 | Confidenziale — Non destinato alla distribuzione*

---

## Indice

1. Executive Summary
2. Problema & Opportunità
3. Soluzione & Prodotto
4. Dimensione del Mercato & Trend
5. Modello di Business & Flussi di Ricavi
6. Trazione & Milestones
7. Panorama Competitivo
8. Strategia Go-to-Market
9. Team
10. Highlights Finanziari
11. Uso dei Fondi
12. Roadmap & Opportunità di Exit

---

## 1. Executive Summary

**NephroAssist è una piattaforma B2B SaaS per la coordinazione della preparazione pre-trapianto dei pazienti.** Colma una vera lacuna di mercato: nessun concorrente offre un'app per pazienti specifica per il trapianto che combini task management, comunicazione in tempo reale tra paziente e coordinatore e flussi di lavoro basati su documenti in un unico sistema.

**Perché ora:**
- ~250 programmi di trapianto negli USA, ~250–300 nell'UE+UK — tutti senza uno strumento digitale dedicato alla coordinazione pre-trapianto
- Le aspettative dei pazienti crescono (mobile-first, aggiornamenti in tempo reale), mentre i moduli EHR restano indietro
- La pressione del Value-based Care da parte di CMS e dei payor richiede migliori outcome a costi inferiori
- La piattaforma ha una codebase esistente (Next.js, PostgreSQL, Prisma, Bootstrap) ed è pronta per un pilota in closed beta

**Fase di finanziamento:** Pre-Seed / Angel. Ricerca di capitale per accelerare dal modello zero-budget ai primi 10 clienti paganti.

**Tesi d'investimento principale:** Un mercato B2B di nicchia, appiccicoso e poco servito (~500 programmi nel mondo) con alto payout per cliente (€20K–€50K/anno Enterprise), costi di acquisizione marginali quasi nulli in modalità bootstrap, e una rampa di 12–18 mesi verso il product-market fit.

---

## 2. Problema & Opportunità

### 2.1 Il Problema: La Crisi della Coordinazione dei Trapianti

I coordinatori di trapianto gestiscono il percorso patient più complesso e ad alto rischio della medicina — con fogli di calcolo, catene di telefonate e post-it.

| Fattore | Valore | Fonte |
|---------|--------|-------|
| Pazienti renali in lista d'attesa negli USA | ~90.000 | SRTR/OPTN |
| Programmi di trapianto negli USA | ~250+ | SRTR/OPTN |
| Trapianti annuali (tutti gli organi, USA) | ~40.000+ | SRTR |
| Pazienti per coordinatore | 50+ | INFERENCE |
| Tempo perso per documenti/promemoria | 10+ ore/settimana | INFERENCE |

**Conseguenze:**
- Appuntamenti persi e valutazioni incomplete ritardano l'inserimento in lista di settimane o mesi
- Ogni ritardo aumenta la mortalità in lista d'attesa
- Il burnout dei coordinatori è elevato — ogni turnover costa ai programmi €50K–€100K per sostituire
- Non esiste uno strumento dedicato per la coordinazione pre-trapianto

> "Tracciamo tutto in Excel. Quando un coordinatore è malato, nessuno sa dove stanno le cose."
> — Coordinatore di Trapianto, Midwest Academic Medical Center

### 2.2 L'Opportunità: Un Mercato Senza Concorrenti Diretti

L'analisi competitiva (8 concorrenti esaminati) conferma: **nessun fornitore combina checklist specifiche per il trapianto + chat in tempo reale paziente-coordinatore + flussi documentali.**

- CareDx (diagnostica) non ha un'app per pazienti
- SeamlessMD/Get Well (generici) non offrono profondità specifica per il trapianto
- Epic MyChart (EHR nativo) non è incentrato sul coordinatore
- Transplant Hero (app consumer) non ha integrazione con il care team

**L'opportunità è difendibile attraverso:**
1. Profondità di dominio (il percorso a 5 fasi del trapianto codificato nel software)
2. Architettura compliance-first (HIPAA/GDPR dal giorno 1)
3. Design incentrato sul coordinatore (non sul CIO)
4. Integrazione con l'EHR, non sostituzione (minore rischio di procurement)

---

## 3. Soluzione & Prodotto

### 3.1 Visione del Prodotto

> La prima piattaforma di preparazione al trapianto che si colloca tra l'EHR e il paziente.

### 3.2 I Quattro Livelli di Valore

```
┌─────────────────────────────────────────────────┐
│  Livello 4: Intelligenza & Analytics             │
│  — Dashboard coordinatori, tassi di completamento,│
│    metriche tempo-in-lista, reporting CNT/SRTR  │
├─────────────────────────────────────────────────┤
│  Livello 3: Motore Workflow Trapianto            │
│  — Checklist specifiche per organo, review       │
│    documenti, catene di approvazione, audit trail│
├─────────────────────────────────────────────────┤
│  Livello 2: Dialisi & Coordinazione Pre-Trapianto│
│  — Pianificazione appuntamenti, tracciamento lab, │
│    gestione referral, chat care team              │
├─────────────────────────────────────────────────┤
│  Livello 1: Livello di Esecuzione Paziente       │
│  — PWA mobile, checklist attività, promemoria    │
│    farmaci, contenuti educativi, tracciamento    │
│    progressi                                     │
└─────────────────────────────────────────────────┘
```

### 3.3 Funzionalità Core (MVP)

| Funzionalità | Descrizione | Differenziazione |
|-------------|-------------|------------------|
| Checklist di preparazione specifiche per trapianto (rene) | Valutazione a 5 fasi con transizioni definite e regole di escalation | Nessun concorrente offre checklist specifiche per organo |
| Chat in tempo reale Paziente ↔ Coordinatore | Cifrata, HIPAA-compliant, con audit trail | CareDx è solo telefono; SeamlessMD non ha chat in tempo reale |
| Raccolta documenti automatizzata | Richiesta, upload, review, approvazione in un unico flusso | Nessun concorrente ha review documentale specifico per trapianto |
| Promemoria adesione farmaci | Con visibilità del care team | Transplant Hero ha allarmi, ma senza visibilità team |
| Educazione paziente per fase del percorso | 5 moduli: Referral → Valutazione → Appuntamento → Documenti → Review Readiness | Mytonomy ha video, ma senza task associati alle fasi |
| Dashboard & Analytics Coordinatori | Tempo-in-lista, tassi no-show, completamento checklist | Table stakes per la pricing B2B |

### 3.4 Stack Tecnologico

| Componente | Tecnologia | Responsabilità |
|------------|------------|----------------|
| Web Frontend | Next.js 16 + React 19 + Bootstrap 5.3 | PWA pazienti, dashboard coordinatori, admin panel |
| Backend API | Next.js API Routes (Node.js serverless) | REST endpoints, business logic, auth, tenant resolution |
| Job in background | Redis + BullMQ | Pipeline OCR, notifiche email, promemoria |
| Database | PostgreSQL 15 + Prisma ORM + RLS | Transazioni ACID, query scoped per tenant, audit log |
| Cache/Queue | Redis | Session store, rate limit, job queues |
| Object Storage | S3-compatibile | Archiviazione documenti cifrata |
| Integrazione FHIR | SMART on FHIR | Fase 1: read-only; Fase 2: write con approvazione |

### 3.5 Strategia di Integrazione

- **Fase 1 (read-only):** Launch SMART on FHIR da contesto paziente Epic/Cerner. Legge demographics, appuntamenti, lab. Nessun writeback.
- **Fase 2 (write con approvazione):** Scrive PRO (Patient-Reported Outcomes) e task care plan nell'EHR, solo dopo review clinica.
- **Fase 3 (sync bidirezionale):** Sincronizzazione completa care plan. Richiede testing esteso per ogni versione EHR.

---

## 4. Dimensione del Mercato & Trend

### 4.1 Mercato USA

| Metrica | Valore | Fonte |
|---------|--------|-------|
| Programmi di trapianto | ~250+ | SRTR/OPTN |
| Pazienti renali in lista d'attesa | ~90.000 | SRTR |
| Trapianti annuali (tutti gli organi) | ~40.000+ | SRTR |
| Di cui trapianti di rene | ~70% di tutti i trapianti solid organ | WHO |

**TAM (solo USA):**
- A €5K–€50K per programma/anno: **€1,25M–€12,5M annuali**
- Espandibile con moduli multi-organo (cuore, fegato, polmone)

### 4.2 Mercato EU + UK

| Regione | Programmi | Trapianti Annuali | Fonte |
|---------|-----------|-------------------|-------|
| Eurotransplant (8 paesi) | ~150–200 | >13.000 | Eurotransplant |
| UK (NHSBT) | ~30–50 | ~4.000+ | NHSBT |
| Totale EU+UK | ~250–300 | ~17.000+ | Aggregato |

**Interpretazione:** L'EU+UK ha circa lo stesso numero di programmi degli USA, raddoppiando il volume di mercato addressable.

### 4.3 Mercato Italiano (Addendum)

| Metrica | Valore | Fonte |
|---------|--------|-------|
| Centri trapianto attivi (rene) | ~40 | CNT |
| Trapianti renali annuali | ~3.000–3.500 | CNT |
| Pazienti in lista d'attesa | ~8.000 | CNT/Eurotransplant |
| Trapianti annuali (tutti gli organi) | ~4.500–5.000 | CNT |

**Valore strategico:** Nessun concorrente offre un'app dedicata per la coordinazione pre-trapianto in italiano. Workflow compatibili CNT e integrazione WhatsApp (universale in Italia) sono ulteriori differenziatori.

### 4.4 Trend di Mercato

1. **Crescenti aspettative dei pazienti:** Mobile-first, aggiornamenti in tempo reale, comunicazione trasparente
2. **Pressione del Value-based Care:** CMS e payor richiedono migliori outcome a costi inferiori
3. **Remote Monitoring & PRO:** I Patient-Reported Outcomes diventano standard
4. **Personalizzazione AI come fattore igienico:** Atteso entro 2–3 anni
5. **Crescenti programmi di donazione vivente:** La scarsità di organi spinge la coordinazione donazione vivente

---

## 5. Modello di Business & Flussi di Ricavi

### 5.1 Modello: Land-and-Expand B2B SaaS

**Perché B2B (non B2C):** I pazienti non controllano i budget ospedalieri. L'acquisto ospedaliero è un ciclo di 12–24 mesi — un'app B2C per pazienti non può aggirarlo. Il cliente pagante deve essere il centro trapianti o il health system.

### 5.2 Tier di Pricing

| Tier | Target | Prezzo/Anno | Scope |
|------|--------|-------------|-------|
| **Free** | Singoli pazienti & caregiver | €0 | Checklist personale, allarmi, educazione |
| **Starter** | Piccoli programmi (≤50 pazienti) | €2.999 | Dashboard coordinatori, template, analytics base |
| **Professional** | Programmi medi (≤200 pazienti) | €7.999 | Chat care team, integrazione FHIR, workflow custom |
| **Enterprise** | Grandi health systems / IDN | €20K–€50K | Illimitato, SSO, SLA, CSM dedicato |

**Rationale pricing:**
- Tutti i concorrenti usano vendite enterprise opache — la trasparenza dei prezzi è un differenziatore di fiducia
- Il tier Starter è abbastanza basso da aggirare l'approvazione del comitato in alcuni centri
- Enterprise prezzato 20–40% al di sotto di piattaforme generiche equivalenti per vincere displacement

### 5.3 Unit Economics (Scenario BASE)

| Tier | Prezzo Mensile | Lifetime Medio | LTV | Calcolo |
|------|----------------|----------------|-----|---------|
| Starter | €250 | 20 mesi | €5.000 | 250 × (1/0,05) |
| Professional | €667 | 20 mesi | €13.333 | 667 × (1/0,05) |
| Enterprise | €3.000 | 48 mesi | €144.000 | 3.000 × 12 × (1/0,25) |

**CAC su base cash = €0** (per design: nessun marketing a pagamento, solo tempo founder)

| Scenario | LTV:CAC (Cash) | LTV:CAC (tempo founder calcolato) | Valutazione |
|----------|----------------|-----------------------------------|-------------|
| BEAR | Infinito | ~0,2:1 | Non sostenibile se il tempo founder è monetizzato |
| BASE | Infinito | ~6:1 | Sostenibile per bootstrap |
| BULL | Infinito | ~16:1 | Fortemente sostenibile |

**Insight chiave:** Nel modello zero-budget, le unit economics su base cash sono favorevoli. Il rischio sta nella velocità di acquisizione, non nella redditività per cliente.

---

## 6. Trazione & Milestones

### 6.1 Stato Attuale

| Componente | Stato | Nota |
|------------|-------|------|
| Core workflow paziente/caso/task | Pronto | Può essere dimostrato con fiducia |
| Upload & review documenti | Pronto | Storage locale accettabile per pilota |
| Dashboard & analytics | Pronto | Narrazione ROI per leadership clinica possibile |
| Sicurezza (JWT, rate limiting, isolamento tenant) | **Non pronto** | Deve essere risolto prima dell'uso con PHI |
| Billing/Stripe | Mancante | Solo fatturazione manuale |
| Reset password / verifica email | Mancante | Admin deve creare account manualmente |
| Pagine legali (TOS, Privacy, Impressum) | Mancante | Must-have prima del pilota |

### 6.2 Milestones Raggiunti

- ✅ Codebase Next.js esistente con workflow paziente/caso/task
- ✅ Pipeline upload & review documenti
- ✅ Dashboard & analytics views
- ✅ UI Bootstrap 5.3 PWA-ready
- 🔄 Gap sicurezza e compliance in chiusura (JWT bypass, hardcoded secrets, rate limiting)

### 6.3 Strategia Pilota

- **Target:** 1 programma accademico + 1 community per diversità
- **Durata:** Pilota 90 giorni con metriche di successo definite (tasso completamento checklist, risparmio tempo coordinatore)
- **Contratto:** Contratti manuali; nessun billing self-serve richiesto per primo ricavo
- **Prezzo Fase 1:** €199/mese sconto early adopter (da €299) in cambio di testimonial/caso di studio

### 6.4 Obiettivi 90 Giorni

| Metrica | Target |
|---------|--------|
| Fix sicurezza P0 rilasciati | 5/5 completati |
| Discovery calls completati | 5+ |
| Demo calls completati | 2+ |
| Piloti avviati | 1 live |
| Clienti paganti | 0–1 (fattura manuale) |
| Casi di studio pubblicati | 1 |
| Referral caldi generati | 2+ |

---

## 7. Panorama Competitivo

### 7.1 Matrice Competitiva

| Concorrente | Specifico Trapianto? | Checklist Paziente? | Chat in Tempo Reale? | Punto Debole |
|-------------|---------------------|---------------------|----------------------|-------------|
| **CareDx** | Alto (diagnostica) | No | Solo telefono | Nessuna app patient-facing per readiness |
| **Transplant Hero** | Alto (allarmi) | No | No | Solo allarmi; nessun care team |
| **iTransplant / InVita** | Alto (logistica) | No | Sì (team OPO) | Non patient-facing |
| **SeamlessMD** | Basso | Sì | Parziale | Non specifico per trapianto |
| **Get Well Network** | Basso | Parziale | Parziale | Molto generico |
| **Mytonomy** | Basso | Parziale | Parziale | Pesante su educazione, leggero su task mgmt |
| **ThoroughCare** | Basso | Sì | No | Centrato sul care manager |
| **NephroAssist** | **Alto** | **Sì** | **Sì** | **Fase iniziale — first mover nella lacuna** |

### 7.2 Posizionamento Strategico

- **Contro incumbent trapianto (CareDx):** "Possediamo la coordinazione pre-trapianto, non la diagnostica post-trapianto. Siamo il layer di patient experience che loro manca."
- **Contro player generici:** "Loro offrono 50 care journey. Noi ne offriamo una — e conosciamo ogni passo."
- **Contro app consumer (Transplant Hero):** "Compliance hospital-grade, integrazione EHR e reach del care team — l'app che i pazienti hanno davvero bisogno."

### 7.3 Analisi SWOT

| Punti di Forza | Punti Deboli |
|----------------|-------------|
| Primo player specifico per trapianto con checklist combinate + chat + flussi documentali | Fase iniziale — nessuna brand awareness stabilita |
| Architettura compliance-first (HIPAA/GDPR) | Nessuna integrazione EHR live (SMART on FHIR in sviluppo) |
| Design incentrato sul coordinatore | Lacune di sicurezza da chiudere prima del pilota |
| Integrazione EHR invece di sostituzione (minore rischio procurement) | Nessun cliente pagante ancora |

| Opportunità | Minacce |
|-------------|---------|
| I workflow donazione vivente sono altamente differenzianti | CareDx o Epic potrebbero lanciare feature di readiness |
| Espansione UE (Germania/Italia) senza concorrenti diretti | Player generici care-journey potrebbero scoprire la nicchia |
| Automazione reporting CNT/SRTR come fattore di stickiness | Breach HIPAA o reclamo GDPR sarebbero rischio esistenziale |
| Partnership AIDO (Italia) per educazione pazienti | Ciclo di vendita >18 mesi in enterprise health systems |

---

## 8. Strategia Go-to-Market

### 8.1 Profilo Cliente Ideale (ICP)

**ICP Primario: Il "Coordinatore Foglio di Calcolo"**

| Attributo | Descrizione |
|-----------|-------------|
| Titolo | Coordinatore Trapianti, RN Pre-Trapianto, o Assistente Sociale Ospedaliero |
| Organizzazione | Piccoli e medi programmi trapianto (1–3 coordinatori) |
| Workflow attuale | Excel/Google Sheets per tracciamento pazienti, telefonate per promemoria, email per raccolta documenti |
| Intensità del dolore | ALTA — 50+ pazienti in stadi di valutazione diversi, appuntamenti persi ritardano inserimento in lista |
| Influenza sull'acquisto | MEDIA — non può firmare contratti enterprise da solo, ma può fare da champion presso il Medical Director |
| Affinità tecnologica | MEDIA — usa EHR quotidianamente, frustrato dalla sua rigidità |

**ICP Secondario: Il "Medical Director Innovation-Friendly"**

| Attributo | Descrizione |
|-----------|-------------|
| Titolo | Medical Director of Transplant, Surgery Chair, o Quality Officer |
| Dolore | Burden reporting SRTR, mortalità lista d'attesa, no-show pazienti, turnover coordinatori |
| Disposizione a pagare | ALTA — se lo strumento dimostra accelerazione lista o riduzione no-show |
| Ciclo di vendita | 3–6 mesi per approvazione pilota; necessita prove dati/ROI |

### 8.2 Motion di Vendita: Contratto Manuale Prima

| Fase | Attività | Durata | Obiettivo |
|------|----------|--------|-----------|
| 1. Identificazione | LinkedIn outreach, referral pilota, directory AST | Continuo | Prenotare discovery call |
| 2. Discovery | Call 20 min: "Mi guidi attraverso il tuo workflow di valutazione." | 20 min | Qualificare pain; confermare fit ICP |
| 3. Demo | Screenshare con NephroAssist reale e dati demo | 30 min | Generare momento "questo risolve il mio problema" |
| 4. Proposta Pilota | Pilota 90 giorni gratuito con onboarding founder. Nessuna approvazione IT richiesta. | Async | Rimuovere barriera procurement |
| 5. Esecuzione Pilota | Founder onboarda clinica manualmente, crea account, importa lista pazienti (CSV) | 2–4 settimane | Generare "aha moments" e formazione abitudini |
| 6. Conversione | Mese 3: "Rendiamolo ufficiale?" Offerta pricing early adopter. | 1 settimana | Contratto annuale o mensile firmato (fattura manuale) |
| 7. Espansione | Introduzione coordinatori aggiuntivi, reparti o workflow donazione vivente | Mesi 4–12 | Land-and-expand all'interno della clinica |

### 8.3 Canali di Acquisizione Zero-Budget

| Priorità | Canale | Tempo Settimanale | Output Atteso (MoM 3) |
|----------|--------|-------------------|----------------------|
| 1 | Referral guidati da pilota | 5 ore | 1 introduzione calda a un altro coordinatore |
| 2 | LinkedIn direct outreach | 5 ore | 10 richieste di connessione personalizzate → 2 demo calls |
| 3 | Contenuto organico (caso di studio → blog) | 3 ore | 1 caso di studio pubblicato + 2 post blog |
| 4 | Engagement community | 2 ore | Reputazione come esperto utile in 2 gruppi |
| 5 | SEO (lungo termine) | 2 ore | 6 post indicizzati; traffico trascurabile fino a MoM 6+ |

---

## 9. Team

### 9.1 Descrizione del Team

**Founder-led, domain-informed, compliance-first.**

Il team unisce esperienza di prodotto Healthcare SaaS con profonda comprensione del workflow del coordinatore di trapianto. Lo stack tecnologico (Next.js, PostgreSQL, Prisma, Bootstrap) è collaudato in produzione ed evolvibile.

### 9.2 Competenze Core

| Area | Competenza | Evidenza |
|------|-----------|----------|
| Prodotto | Domain model specifico per trapianto in codice (Patient/Case/Task/Document) | Codebase esistente |
| Tecnica | Sviluppo full-stack con focus su healthcare security | Next.js + PostgreSQL + RLS + Audit Logging |
| Compliance | Architettura HIPAA/GDPR pianificata dal giorno 1 | Modulo consent management granulare specificato |
| Vendite | GTM zero-budget con outbound coordinator-centrico | Strategia LinkedIn outreach, framework casi di studio |
| Integrazione | SMART on FHIR + roadmap integrazione EHR | Architettura tecnica per Fasi 1–3 definita |

### 9.3 Lacune del Team & Piano di Assunzione

| Ruolo | Necessità | Timing | Profilo |
|-------|----------|--------|---------|
| Compliance Officer | Critica | Mese 1–3 | Esperienza HIPAA/GDPR, conoscenza processo SOC 2 Type II |
| Sales Lead / CSM | Alta | Mese 6–9 | Vendita Healthcare SaaS, network coordinatori trapianto |
| Senior Backend Engineer | Media | Mese 3–6 | Node.js/PostgreSQL, esperienza FHIR/HL7 |
| UX Researcher | Media | Mese 6–12 | Accessibilità (WCAG 2.1 AA), design per demografie anziana |
| Legal Counsel | Bassa | Su necessità | Contratti Healthcare SaaS, BAA, GDPR |

### 9.4 Visione

> Ogni paziente trapiantato, ovunque nel mondo, dovrebbe avere un percorso chiaro e tracciabile dal referral al trapianto — e ogni coordinatore dovrebbe sapere esattamente dove sta ogni paziente, senza aprire un foglio di calcolo.

---

## 10. Highlights Finanziari

### 10.1 Parametri Scenario (24 Mesi)

| Parametro | BEAR | BASE | BULL |
|-----------|------|------|------|
| Tempo al primo cliente pagante | Mese 9 | Mese 6 | Mese 3 |
| Nuovi clienti Starter/mese (peak) | 1 | 3 | 8 |
| Nuovi clienti Professional/mese (peak) | 0 | 1 | 3 |
| Nuovi clienti Enterprise/trimestre | 0 | 0,5 | 1 |
| Churn mensile (Starter/Pro) | 8% | 5% | 3% |
| Churn annuale (Enterprise) | 50% | 25% | 15% |
| Net Revenue Retention | 100% | 105% | 115% |

### 10.2 Proiezione Ricavi (24 Mesi)

**Scenario BASE:**

| Mese | Free Users | Starter | Professional | Enterprise | MRR (€) | Ricavo Cumulato (€) |
|------|------------|---------|--------------|------------|---------|---------------------|
| 6 | 500 | 2 | 0 | 0 | 500 | 500 |
| 9 | 800 | 4 | 1 | 0 | 1.667 | 5.501 |
| 12 | 1.200 | 6 | 2 | 0 | 3.334 | 14.835 |
| 15 | 1.600 | 8 | 3 | 0 | 5.001 | 28.668 |
| 18 | 2.000 | 10 | 4 | 1 | 8.334 | 51.669 |
| 21 | 2.500 | 12 | 5 | 1 | 9.335 | 80.670 |
| 24 | 3.000 | 14 | 6 | 2 | 12.002 | 113.673 |

**Scenario BULL:**

| Mese | Free Users | Starter | Professional | Enterprise | MRR (€) | Ricavo Cumulato (€) |
|------|------------|---------|--------------|------------|---------|---------------------|
| 3 | 600 | 3 | 0 | 0 | 750 | 750 |
| 6 | 1.500 | 8 | 2 | 0 | 3.334 | 7.752 |
| 9 | 3.000 | 15 | 5 | 1 | 9.335 | 32.679 |
| 12 | 5.000 | 22 | 9 | 2 | 17.003 | 83.688 |
| 18 | 8.000 | 30 | 15 | 4 | 29.505 | 252.696 |
| 24 | 12.000 | 38 | 22 | 6 | 43.174 | 486.714 |

**Valore atteso risk-adjusted (24 mesi): €155.005**

### 10.3 Analisi Break-Even

**Break-Even Cash (mensile):**

| Scenario | Costi Mensili (€) | Break-Even MRR (€) | Break-Even Clienti | Timeline |
|----------|------------------|-------------------|-------------------|----------|
| BEAR | 100 | 100 | 1 Starter | Mese 6–9 |
| BASE | 120 | 120 | 1 Starter | Mese 6 |
| BULL | 150 | 150 | 1 Starter | Mese 3 |

**Break-Even Compensazione Founder (a €60K/anno = €5.000/mese):**

| Scenario | Ricavo Mensile Richiesto | MRR Richiesto | Timeline |
|----------|------------------------|--------------|----------|
| BEAR | €5.100 | 21 posti Starter | >24 mesi |
| BASE | €5.120 | 21 posti Starter | Mese 18–21 |
| BULL | €5.150 | 21 posti Starter | Mese 9–12 |

### 10.4 Analisi di Sensibilità

**Scenario BASE, ricavo 24 mesi = €113.673**

| Variabile | Cambiamento da BASE | Impact su ricavo 24 mesi | Rank Sensibilità |
|-----------|--------------------|--------------------------|-----------------|
| Tempo al primo cliente | +3 mesi | −€28.000 (a €85.673) | **ALTO** |
| Churn mensile (Starter/Pro) | +3pp (a 8%) | −€31.000 (a €82.673) | **ALTO** |
| Nuovi clienti Starter/mese | −1 (a 2) | −€22.000 (a €91.673) | **ALTO** |
| Tasso referral Free → Coordinatore | −2pp (a 3%) | −€15.000 (a €98.673) | MEDIO |
| Prezzo Enterprise | −€1.000/mese | −€12.000 (a €101.673) | MEDIO |
| Tasso invite virale | −5pp (a 5%) | −€8.000 (a €105.673) | BASSO |
| Traffico SEO per post | −10 visite | −€5.000 (a €108.673) | BASSO |

**Insight chiave:** Il churn e il tempo al primo cliente sono le variabili con maggiore leva. Un ritardo di 3 mesi o un aumento di 3 punti percentuali nel churn riducono entrambi il ricavo a 24 mesi di ~25%.

---

## 11. Uso dei Fondi

### 11.1 Finanziamento Ricercato

**Round:** Angel / Pre-Seed per accelerare dallo zero-budget ai primi 10 clienti paganti.

| Uso dei Fondi | Allocazione | Scopo |
|---------------|-------------|-------|
| Sicurezza & Compliance | 30% | Audit SOC 2 Type II, remediation HIPAA gap, penetration testing |
| Engineering | 35% | Integrazione FHIR, hardening multi-tenant, modulo donatore vivente |
| Sales & Support Pilota | 20% | Primo hire CSM, tracciamento metriche pilota, produzione casi di studio |
| Legale & Operazioni | 15% | BAA, DPIA GDPR, costituzione, cyber insurance |

### 11.2 Metriche di Successo per Questo Round

| Metrica | Target |
|---------|--------|
| 10+ clienti paganti in 3+ programmi trapianto | Proof of willingness to pay |
| €5K+ MRR | Break-even compensazione founder |
| Net Revenue Retention >100% | Segnale product-market fit |
| Report SOC 2 Type II pulito | Compliance gate per vendita enterprise |
| 1 caso di studio pilota pubblicato con dati miglioramento tempo-in-lista | Collaterale vendite |

### 11.3 Gate Decisionali per l'Investimento

| Gate | Condizione | Decisione |
|------|-----------|-----------|
| **Verde** | 10+ clienti paganti, €5K MRR, NRR >100% | Considerare round angel/seed per accelerare |
| **Giallo** | 3–9 clienti paganti, €1K–€5K MRR | Continuare bootstrap; rivalutare al mese 18 |
| **Rosso** | <3 clienti paganti al mese 12 | Rivalutare prodotto, pricing o pivot |

---

## 12. Roadmap & Opportunità di Exit

### 12.1 Roadmap Prodotto

| Fase | Timeline | Milestones |
|------|----------|-------------|
| **Fase 1: MVP — "Core Readiness Rene"** | Mesi 1–6 | Checklist specifiche rene, chat paziente-coordinatore, workflow documenti base, educazione paziente, FHIR read-only |
| **Fase 2: Espansione — "Multi-Organo + Donatore Vivente"** | Mesi 6–18 | Moduli cuore, fegato, polmone; workflow donatore vivente; FHIR write con approvazione; dashboard coordinatori + analytics; espansione ruoli care team |
| **Fase 3: Scaling — "AI, Benchmarking, UE"** | Mesi 18–36 | Personalizzazione AI (nessun consiglio medico); automazione reporting SRTR/OPTN; espansione UE (Germania BfArM/DiGA, Italia CNT); modulo pediatrico |

### 12.2 Roadmap Compliance

| Giurisdizione | Framework | Stato |
|---------------|-----------|-------|
| **USA** | HIPAA + HITECH | Architettura progettata; negoziazioni BAA in corso |
| **UE** | GDPR (Art. 9 dati categoria speciale) | DPIA pianificato mese 6; architettura hosting UE mese 9 |
| **Germania** | BfArM DiGA Fast-Track | Valutazione fattibilità mese 12–18 |
| **Italia** | CNT + GDPR | Workflow localizzati pianificati; primo pilota Bologna/Padova |
| **UK** | NHS Data Security Standards | Espansione Fase 3 via partnership NHSBT |

### 12.3 Opportunità di Exit

**Scenario 1: Vendita Strategica (exit più probabile)**
- **Potenziali acquirenti:** CareDx (completa la loro diagnostica post-trapianto con coordinazione pre-trapianto), Epic/Cerner (widget embedded o acquisizione), Get Well/SeamlessMD (espande il portfolio con profondità trapianto)
- **Timeline:** Anni 5–7
- **Driver di prezzo:** Profondità di dominio + community coordinatori + certificazioni compliance

**Scenario 2: Crescita a piattaforma €10M+ ARR**
- Con 50 clienti Enterprise a €200K/anno = €10M ARR
- Multiplo Healthcare SaaS: 5–8x ARR
- **Timeline:** Anno 7–10

**Scenario 3: Roll-Up / Private Equity**
- Meno probabile in un mercato piccolo, ma possibile se moduli multi-organo ed espansione UE ampliano il TAM

**Scenario 4: Ulteriori Finanziamenti (Series A/B)**
- Dopo €5M ARR e 3+ contratti Enterprise
- Per espansione europea e sviluppo AI

### 12.4 Fattori di Rischio & Mitigazioni

#### Rischi Critici (Esistenziali)

| Rischio | Probabilità | Impact | Mitigazione |
|---------|------------|--------|-------------|
| Integrazione EHR richiede >6 mesi | Media | Alto | SMART on FHIR come fallback; import CSV manuale per pilota |
| Ciclo di vendita >18 mesi | Media | Alto | Focus su programmi mid-tier; pilota 90 giorni con metriche di successo |
| CareDx o Epic lancia feature readiness | Basso-Media | Molto alto | Profonda focalizzazione di dominio; costruire community coordinatori |
| Breach HIPAA o reclamo GDPR | Bassa | Esistenziale | Build compliance-first; nessuna PHI in dev/staging; scanning sicurezza automatico; cyber insurance |
| FDA classifica checklist come SaMD | Bassa | Alto | Solo contenuto educativo; nessuna raccomandazione diagnostica; disclaimer chiari |

#### Rischi Moderati (Rallentamento Crescita)

| Rischio | Probabilità | Impact | Mitigazione |
|---------|------------|--------|-------------|
| SEO richiede >12 mesi | Alta | Medio | Diversificazione in community + partnership |
| Adozione paziente bassa (demografia anziana) | Media | Medio | Accesso caregiver proxy; accessibilità (WCAG 2.1 AA) |
| Concorrente lancia tool free simile | Bassa | Medio | Time-to-market; costruire community moat |

#### Scenari di Invalidazione

1. **Se >30% dei coordinatori di trapianto sono soddisfatti con Epic MyChart + fogli di calcolo** → Pivot a widget embedded nell'EHR (SMART on FHIR App) invece di piattaforma standalone.
2. **Se CareDx costruisce un'app patient readiness entro 12 mesi** → Accelerare differenziazione su chat in tempo reale e workflow donazione vivente; considerare partnership invece di competizione diretta.
3. **Se i budget IT ospedalieri per programmi trapianto collassano** → Shift a modello basato su utilizzo (per paziente) per allinearsi con budget variabili.
4. **Se i flussi dati USA-UE diventano prohibitivamente costosi** → Ritardare espansione UE; 24–36 mesi focus puramente USA.

---

## Appendice: Fonti Dati & Assunzioni

**Tutti i dati di mercato da:** SRTR/OPTN, WHO, Eurotransplant, NHSBT, CNT, e ispezione live siti web concorrenti.

**Le proiezioni finanziarie sono strumenti di scenario planning, non previsioni.** Tutte le assunzioni esplicitamente documentate nel Zero-Budget Financial Model.

**Confidenziale — Non destinato alla distribuzione.**

---

*Documento creato per Kanban Task t_d53d53f3. Basato su: NephroAssist Business Strategy (t_7a710525), Zero-Budget Financial Model (t_59df76ad), Zero-Budget GTM Action Plan (t_9f0a98cb), Consolidated Research (t_c269008b), Italian Market Localization Brief (t_04c2cd98), e Competitive Positioning Italy (t_fa7c7149).*
