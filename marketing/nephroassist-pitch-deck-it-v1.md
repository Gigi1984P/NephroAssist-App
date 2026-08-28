# NephroAssist — Pitch Deck

**La prima piattaforma italiana dedicata alla valutazione pre-trapianto e alla coordinazione dei pazienti**

*Per investitori e partner strategici | Agosto 2026*

---

## Slide 1: Copertina — Il Gancio

# NephroAssist
## Meno telefonate, meno carta, più pazienti pronti per il trapianto.

**La prima piattaforma italiana dedicata alla valutazione pre-trapianto e alla coordinazione dei pazienti**

---

**Note per il relatore:**
Benvenuti. Sono [Nome], fondatore di NephroAssist. Oggi vi mostrerò perché il percorso più complesso in medicina — la strada verso il trapianto di organo — è ancora gestito con Excel, telefonate e post-it. E come noi chiudiamo questa lacuna. Non è un'idea nata nel Silicon Valley. È un problema che i coordinatori dei trapianti vivono ogni giorno.

---

## Slide 2: Il Problema — La Crisi della Coordinazione Trapianti

**Il percorso pre-trapianto più complesso in medicina gira su fogli di calcolo.**

- **~40 centri trapianti di rene attivi** in Italia
- **~8.000 pazienti** in lista d'attesa per il rene
- **~3.000–3.500 trapianti di rene** all'anno
- I coordinatori gestiscono **40–60 pazienti** contemporaneamente nella fase di valutazione
- **10+ ore/settimana** perse a rincorrere documenti e ricordare appuntamenti
- Appuntamenti persi e valutazioni incomplete **ritardano l'inserimento in lista di settimane o mesi**
- **Nessuno strumento dedicato esiste** per la coordinazione pre-trapianto in Italia

> «Gestiamo tutto su Excel. Quando un coordinatore è assente, nessuno sa dove stanno le cose.»
> — Coordinatore dei trapianti, centro accademico italiano

---

**Note per il relatore:**
Il coordinatore dei trapianti è la figura non chirurgica più importante dell'intero processo. Coordina la valutazione, la raccolta dei documenti, la pianificazione degli appuntamenti e la comunicazione con il paziente — spesso per 40–60 pazienti contemporaneamente. E gli strumenti? Excel, telefono, email. Questo non è un problema di workflow. È un problema di sicurezza del paziente. Ogni settimana di ritardo significa più tempo in lista d'attesa. È tempo di vita.

---

## Slide 3: La Soluzione — NephroAssist

**La prima piattaforma che si colloca tra il fascicolo sanitario elettronico e il paziente — dedicata al trapianto.**

Cosa fa:
- Liste di controllo intelligenti per la valutazione pre-trapianto (rene → cuore, fegato, polmone)
- Chat sicura in tempo reale tra paziente e coordinatore (non solo telefono come CareDx)
- Raccolta e revisione documenti automatizzata
- Promemoria per l'assunzione dei farmaci con visibilità per il care team
- Educazione del paziente lungo il percorso pre-trapianto

Come si integra:
- Avvio SMART on FHIR da Epic/Cerner — legge esami, appuntamenti, dati demografici
- Posizionata come **strato di coordinazione**, non come sostituto del FSE
- GDPR Art. 9 pronto; DPIA completata; hosting UE

---

**Note per il relatore:**
Non sostituiamo il fascicolo sanitario elettronico. Lo completiamo. NephroAssist è lo strato che manca: tra il sistema clinico (Epic, Cerner) e il paziente. Diamo al coordinatore una dashboard che mostra dove si trova ogni paziente. Diamo al paziente un'app che gli dice cosa fare dopo. Non è un'innovazione tecnologica — è una scelta di design. Abbiamo pensato al percorso dal punto di vista del coordinatore, non del CIO.

---

## Slide 4: Prodotto — Quattro Strati di Valore

```
┌─────────────────────────────────────────────┐
│  Strato 4: Intelligence & Analytics         │
│  — Dashboard del coordinatore, tassi di       │
│    completamento, metriche time-to-listing,   │
│    reportistica CNT-ready                     │
├─────────────────────────────────────────────┤
│  Strato 3: Motore di Workflow Trapianto     │
│  — Liste di controllo per organo, revisione   │
│    documenti, catene di approvazione, audit   │
├─────────────────────────────────────────────┤
│  Strato 2: Coordinazione Dialisi & Pre-      │
│    Trapianto — Pianificazione appuntamenti,   │
│    tracciamento esami, gestione ricoveri,     │
│    chat del care team                         │
├─────────────────────────────────────────────┤
│  Strato 1: Strato di Esecuzione per il       │
│    Paziente — PWA mobile, liste attività,     │
│    promemoria farmaci, contenuti educativi,   │
│    tracciamento progressi                     │
└─────────────────────────────────────────────┘
```

**MVP (Mesi 1–6):** Strato 1 + 2, solo rene
**Fase 2 (Mesi 6–18):** Cuore, fegato, polmone; workflow donatore vivente
**Fase 3 (Mesi 18–36):** Personalizzazione AI, espansione EU, automazione CNT

---

**Note per il relatore:**
La nostra architettura è deliberatamente stratificata. Lo strato più basso è l'app del paziente — quello che il paziente vede. Sopra, lo strato di coordinazione per il care team. Sopra ancora, il motore di workflow con liste di controllo e approvazioni. In cima, lo strato analytics che mostra al direttore del programma quanto velocemente i pazienti completano la valutazione. Partiamo dal rene perché rappresenta il 70% di tutti i trapianti d'organo solido. Questa è la nostra spiaggia.

---

## Slide 5: Mercato — Nichia, Sticky, Sottoservito

| Metrica | Valore | Fonte |
|---------|--------|-------|
| Centri trapianti di rene attivi (IT) | ~40 | Centro Nazionale Trapianti (CNT) |
| Pazienti in lista d'attesa rene (IT) | ~8.000 | CNT / Ministero della Salute |
| Trapianti di rene annuali (IT) | ~3.000–3.500 | CNT / Eurotransplant |
| Programmi EU+UK | ~250–300 | Eurotransplant + NHSBT |
| Trapianti annuali EU+UK | ~17.000+ | Eurotransplant + NHSBT |

**Mercato Addressable (Italia):**
- TAM a €5K–€50K/centro/anno: **€200K–€2M annuali**
- EU+UK raddoppia il conteggio dei programmi
- Post-trapianto adherence, coordinazione donatore vivente e moduli pediatrici estendono il TAM

**Perché questo mercato vince:**
- Sticky: i centri trapianti cambiano raramente strumenti a metà ciclo
- Mission-critical: i ritardi nell'inserimento in lista influenzano direttamente la sopravvivenza del paziente
- Attualmente servito da moduli FSE/EHR con lacune di usabilità note
- **Nessun concorrente diretto** in Italia nella coordinazione pre-trapianto

---

**Note per il relatore:**
Non è un mercato da miliardi. È una scelta deliberata. Puntiamo a una nicchia ad alto valore, appiccicosa e sottoservita. 40 centri in Italia. Altri 250–300 in Europa. Un singolo contratto Enterprise a €30K–€50K/anno è redditizio — e i centri non cambiano ogni due anni. Il tasso di abbandono è basso perché i dati dei pazienti devono essere migrati e i coordinatori devono essere riaddestrati. Questo è un fossato difensivo.

---

## Slide 6: Modello di Business — Land-and-Expand B2B SaaS

| Tier | Target | Prezzo Annuale | Scope |
|------|--------|----------------|-------|
| **Free** | Pazienti singoli e caregiver | €0 | Lista personale, promemoria, educazione |
| **Starter** | Piccoli centri (≤50 pazienti) | €2.999/anno | Dashboard coordinatore, template, analytics base |
| **Professional** | Centri medi (≤200 pazienti) | €7.999/anno | Chat care team, integrazione FHIR, workflow custom |
| **Enterprise** | Grandi sistemi sanitari / Aziende Ospedaliere | €20K–€50K/anno | Illimitato, SSO, SLA, CSM dedicato, integrazioni custom |

**Logica di pricing:**
- Tutti i concorrenti usano vendite enterprise opache — il pricing trasparente è un differenziatore di fiducia
- Il tier Starter è abbastanza basso da aggirare l'approvazione del comitato in alcuni centri
- Enterprise prezzato 20–40% sotto piattaforme generiche equivalenti per vincere il displacement

**Freemium Flywheel:** App paziente gratuita → inviti virali del coordinatore → trial → conversione a pagamento

---

**Note per il relatore:**
Il nostro pricing è trasparente — è una scelta deliberata. Ogni concorrente in questo spazio vende tramite contratti enterprise opachi. Noi mostriamo i prezzi sul sito. Questo abbassa la soglia di ingresso per i centri più piccoli e costruisce fiducia. Il flywheel freemium funziona così: un paziente usa l'app gratuita, la menziona al suo coordinatore, che si registra, e noi convertiamo in un account a pagamento. Nessun marketing a pagamento necessario.

---

## Slide 7: Traction & Readiness del Pilota

**Stato attuale:**
- Codebase Next.js esistente con workflow paziente/caso/compito
- Pipeline di upload e revisione documenti
- Dashboard e viste analytics
- UI PWA-ready Bootstrap 5.3

**Lacune di sicurezza e compliance in chiusura:**
- Middleware JWT Bypass (P0) — fix in corso
- Hardcoded Fallback Secret (P0) — fix in corso
- Rate Limiting (P0) — implementazione pianificata
- Engagement audit SOC 2 Type II: obiettivo Mese 3

**Strategia pilota Italia:**
- Target: 1 centro accademico + 1 centro di comunità per diversità
- Pilota di 90 giorni con metriche di successo definite (tasso completamento liste, tempo risparmiato coordinatore)
- Contratti manuali; nessun self-serve billing necessario per i primi ricavi
- **Export CNT-ready** per la reportistica al Centro Nazionale Trapianti

---

**Note per il relatore:**
Abbiamo già un prototipo funzionante. Workflow paziente, gestione documenti, dashboard — tutto presente. Quello che stiamo chiudendo sono le lacune di sicurezza che ci separano da un pilota con veri dati sanitari. Non è un "ci vogliono 6 mesi di sviluppo". È un "ci vogliono 4–6 settimane di hardening della sicurezza". Il primo pilota può iniziare al Mese 3. E in Italia, l'export CNT-ready è un vantaggio competitivo unico: nessun altro strumento generico può generare report già formattati per il Centro Nazionale Trapianti.

---

## Slide 8: Vantaggio Competitivo — Perché vinciamo

1. **Profondità di dominio:** L'unica piattaforma costruita per il percorso pre-trapianto a 5 stadi (considerazione → selezione centro → valutazione/lista → attesa → offerta/OP)

2. **First-mover nella lacuna:** Nessun concorrente combina liste di controllo specifiche per trapianto + chat in tempo reale paziente-coordinatore + workflow documentali

3. **Architettura compliance-first:** GDPR Art. 9 pronto dal giorno 1; DPIA completata; gestione consenso granulare — nessun concorrente generico offre questo livello

4. **Integrazione, non sostituzione:** Avvio SMART on FHIR da Epic/Cerner riduce l'attrito di approvvigionamento rispetto al rip-and-replace

5. **Design coordinatore-first:** Costruito per il dolore quotidiano, non per la checklist del CIO

6. **Vantaggio Italia-specifico:** Primo strumento nativamente italiano per la coordinazione pre-trapianto; export CNT-ready; conformità GDPR con hosting UE

---

**Note per il relatore:**
Il nostro vantaggio competitivo non è una singola funzionalità. È la combinazione di profondità di dominio, compliance e filosofia di design. CareDx è profondo nel trapianto, ma non ha un'app paziente. SeamlessMD ha un'app paziente, ma non ha la specializzazione trapianto. Epic ha tutto, ma i coordinatori si lamentano dell'usabilità. Noi siamo gli unici a servire esattamente questa lacuna: coordinazione pre-trapianto, patient-facing, compliance-ready. E in Italia, siamo i primi — questo è un fossato difensivo enorme.

---

## Slide 9: Team & Visione

**Founder-led, domain-informato, compliance-first.**

Il team unisce esperienza prodotto in Healthcare SaaS con profonda conoscenza del workflow del coordinatore dei trapianti. Lo stack tecnico (Next.js, PostgreSQL, Prisma, Bootstrap) è collaudato in produzione ed evolvibile.

**Visione:**
> Ogni paziente in attesa di trapianto, ovunque nel mondo, dovrebbe avere un percorso chiaro e tracciabile dalla presa in carico al trapianto — e ogni coordinatore dovrebbe sapere esattamente dove si trova ogni paziente, senza aprire un foglio di calcolo.

**Prossimi traguardi:**
- Mese 3: Prima clinica pilota live
- Mese 6: Primo cliente pagante
- Mese 12: SOC 2 Type II + 10 clienti paganti
- Mese 18: Primo contratto Enterprise + integrazione FHIR read
- Anno 2: Espansione multi-organo + ingresso nel mercato EU

---

**Note per il relatore:**
Non siamo un team di consulenti McKinsey che ha scritto un pitch deck per un settore che non conosce. Abbiamo incorporato feedback diretto dai coordinatori dei trapianti. La visione è semplice: nessun paziente dovrebbe essere dimenticato in lista d'attesa perché un documento si è perso in una email. Questo è tecnicamente risolvibile. È un problema di design.

---

## Slide 10: Proiezioni Finanziarie — Tre Scenari

**Ricavi 24 mesi (Modello Zero-Bootstrap):**

| Scenario | Ricavo A1 | Ricavo A2 | Totale 24-Mo |
|----------|-----------|-----------|--------------|
| **BEAR** (30%) | €2.750 | ~€0 | €2.750 |
| **BASE** (50%) | €14.835 | €98.838 | €113.673 |
| **BULL** (20%) | €83.688 | €403.026 | €486.714 |
| **Risk-adjusted expected** | | | **€155.005** |

**Ipotesi chiave:**
- Solo founder, nessun marketing a pagamento (CAC ≈ €0)
- Costi infrastruttura: €70–€120/mese
- Churn mensile: 3–8% (Starter/Pro); Churn annuale: 15–50% (Enterprise)
- Tempo fino al primo cliente pagante: 3–9 mesi

**Unit Economics (BASE):**
- Starter LTV: €5.000 | Professional LTV: €13.333 | Enterprise LTV: €144.000
- Cash CAC: €0 | LTV:CAC = infinito su base cash

---

**Note per il relatore:**
Il nostro modello finanziario è conservativo. Il caso BASE porta €113K in 24 mesi — senza budget marketing, senza team di vendite, solo tempo del founder. Non è un "diventeremo unicorni". È un "dimostreremo che i centri sono disposti a pagare, prima di bruciare denaro". Il caso BULL mostra cosa è possibile se il passaparola virale funziona. La sensibilità è alta su churn e tempo al primo cliente — quelle sono le leve che controlliamo.

---

## Slide 11: La Richiesta — Impiego dei Fondi

**Cercato:** Round Angel / Pre-Seed per accelerare da zero-bootstrap ai primi 10 clienti paganti

| Impiego dei Fondi | Quota | Scopo |
|-------------------|-------|-------|
| Sicurezza & Compliance | 30% | Audit SOC 2 Type II, rimedio gap GDPR, penetration testing |
| Engineering | 35% | Integrazione FHIR, hardening multi-tenant, modulo donatore vivente |
| Sales & Support Pilota | 20% | Prima assumzione CSM, metriche successo pilota, produzione case study |
| Legale & Operazioni | 15% | DPIA GDPR, contratti, costituzione, assicurazione cyber |

**Metriche di successo per questo round:**
- 10+ clienti paganti in 3+ centri trapianti
- €5K+ MRR
- Net Revenue Retention >100%
- SOC 2 Type II report pulito
- 1 case study pilota pubblicata con dati di miglioramento time-to-listing

**Contatti:**
- E-mail: [investors@nephroassist.com]
- LinkedIn: [linkedin.com/company/nephroassist]
- Sito: [nephroassist.com]

---

**Note per il relatore:**
Non cerchiamo un round da 10 milioni. Cerchiamo un investimento Angel o Pre-Seed che ci porti da "potrebbe funzionare" a "funziona". L'impiego principale è compliance e sicurezza — questo è il requisito di ingresso per ogni cliente ospedaliero. Il 35% va in Engineering per costruire l'integrazione FHIR e il modulo donatore vivente. Il 20% in Sales per finanziare il primo Customer Success Manager. Misuriamo il successo non sui numeri di utenti. Lo misuriamo sui clienti paganti, l'MRR e un report SOC 2.

---

*Dati di mercato da CNT, Ministero della Salute, Eurotransplant, NHSBT e ispezione live dei siti concorrenti. Le proiezioni finanziarie sono strumenti di scenario-planning, non previsioni. Le ipotesi sono documentate esplicitamente nel Zero-Budget Financial Model.*
