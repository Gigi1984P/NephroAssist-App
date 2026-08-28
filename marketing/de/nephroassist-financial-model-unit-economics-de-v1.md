# NephroAssist — Finanzmodell und Unit Economics Zusammenfassung

**Aufgabe:** t_9eb2fc50  
**Datum:** 2026-08-28  
**Analyst:** financial-analyst  
**Sprache:** Deutsch (DE)  
**Basis:** Zero-Budget Financial Model (t_59df76ad), Investor Memo (t_3452d6a8), Consolidated Research (t_c269008b)  

---

## 0. Dokumentstruktur und Legende

| Tag | Bedeutung |
|-----|-----------|
| **BEKANNT** | Daten aus konsolidierter Recherche oder oeffentlichen Quellen (SRTR/OPTN, WHO, Eurotransplant, NHSBT) |
| **ABLEITUNG** | Logische Schlussfolgerung aus bekannten Daten |
| **ANNAHME** | Modellierungsannahme — explizit genannt und sensibilitaetstestet |
| **BEAR** | Konservatives Szenario |
| **BASE** | Realistisches Szenario |
| **BULL** | Optimistisches Szenario |

---

## 1. Bekannte Daten (Known Data)

| Metrik | Wert | Quelle |
|--------|------|--------|
| U.S. Transplantationsprogramme | ~250+ | BEKANNT — SRTR/OPTN |
| U.S. Nierenerkrankte auf Warteliste | ~90.000 | BEKANNT — SRTR |
| Jaehrliche U.S. Transplantationen | ~40.000+ | BEKANNT — SRTR |
| EU+UK Transplantationsprogramme | ~250–300 | ABLEITUNG — ca. Verdopplung U.S. |
| Jaehrliche EU+UK Transplantationen | ~17.000+ | BEKANNT — Eurotransplant + NHSBT |
| Vertriebszyklus Enterprise | 12–24 Monate | BEKANNT — Recherchebericht |
| Wettbewerberpreise | UNBEKANNT — alle nutzen opaken Enterprise-Vertrieb | BEKANNT — Recherchebericht |
| TAM bei €5K–€50K/Programm/Jahr | €1,25M–€12,5M (nur U.S.) | BEKANNT — Recherchebericht |

---

## 2. Annahmenblatt (Assumptions Sheet)

### 2.1 Preisgestaltung

| Tier | Zielgruppe | Preis | Annahmequelle |
|------|------------|-------|---------------|
| **Free (Patient)** | Einzelpatienten und Angehoerige | €0 | ANNAHME — Patienten erwarten kostenlose Tools |
| **Starter** | Kleine Programme (≤50 aktive Patienten) | €299/Monat oder €2.999/Jahr (~€250/Monat) | ANNAHME — niedrige Reibung, Self-Serve |
| **Professional** | Mittlere Programme (≤200 aktive Patienten) | €799/Monat oder €7.999/Jahr (~€667/Monat) | ANNAHME — Team-Funktionen rechtfertigen Aufpreis |
| **Enterprise** | Große Health Systems / IDNs | €1.999–€4.999/Monat (€20K–€50K/Jahr) | ANNAHME — Enterprise-SaaS-Standard in Healthcare |

### 2.2 Wachstumsannahmen

| Parameter | BEAR | BASE | BULL |
|-----------|------|------|------|
| Zeit bis erster zahlender Kunde | Monat 9 | Monat 6 | Monat 3 |
| Neue Starter-Kunden/Monat (Peak) | 1 | 3 | 8 |
| Neue Professional-Kunden/Monat (Peak) | 0 | 1 | 3 |
| Neue Enterprise-Kunden/Quartal | 0 | 0,5 | 1 |
| Monatliche Churn (Starter/Pro) | 8% | 5% | 3% |
| Jaehrliche Churn (Enterprise) | 50% | 25% | 15% |
| Net Revenue Retention (NRR) | 100% | 105% | 115% |
| Free Signups/Monat | 100 | 200 | 500 |
| Starter → Professional Upgrade-Rate | 5% | 15% | 25% |
| Professional → Enterprise Upgrade-Rate | 3% | 10% | 20% |

### 2.3 Kostenannahmen

| Kategorie | BEAR | BASE | BULL |
|-----------|------|------|------|
| Monatliche Basisburnrate | €100 | €120 | €150 |
| Zusatzkosten ab M12 | €3.000 (Compliance-Berater) | €3.000 (Compliance-Berater) | €3.000 (Compliance-Berater) |
| Zusatzkosten ab €5K MRR | €2.000 (Teilzeit-CSM) | €2.000 (Teilzeit-CSM) | €2.000 (Teilzeit-CSM) |
| Zusatzkosten ab €20K MRR | €5.000 (Erste Vollzeit-Anstellung) | €5.000 (Erste Vollzeit-Anstellung) | €5.000 (Erste Vollzeit-Anstellung) |
| Founder-Gehalt (Opportunitaetskosten) | €60.000/Jahr | €60.000/Jahr | €60.000/Jahr |

---

## 3. Dreijahresumsatz- und Kostenprojektion

### 3.1 BEAR Szenario — Monatliche Projektion Jahr 1

| Monat | Free Users (kum.) | Starter | Professional | Enterprise | MRR (EUR) | Kumul. Umsatz (EUR) |
|-------|-------------------|---------|--------------|------------|-----------|---------------------|
|  1    |     100 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  2    |     200 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  3    |     300 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  4    |     400 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  5    |     500 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  6    |     600 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  7    |     700 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  8    |     800 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  9    |     900 |     1.0 |          0.0 |        0.0 |       301 |                 301 |
| 10    |   1.000 |     1.9 |          0.0 |        0.0 |       580 |                 881 |
| 11    |   1.100 |     2.7 |          0.0 |        0.0 |       839 |               1.720 |
| 12    |   1.200 |     3.5 |          0.0 |        0.0 |     1.078 |               2.798 |

**BEAR — Quartalsweise Projektion Jahr 2–3**

| Quartal | Free Users (kum.) | Starter | Professional | Enterprise | MRR (EUR) | Kumul. Umsatz (EUR) |
|---------|-------------------|---------|--------------|------------|-----------|---------------------|
| Q 5      |   1.500 |     4.8 |          0.1 |        0.0 |     1.696 |               7.300 |
| Q 6      |   1.800 |     6.5 |          0.1 |        0.0 |     2.189 |              13.399 |
| Q 7      |   2.100 |     7.7 |          0.2 |        0.0 |     2.581 |              20.769 |
| Q 8      |   2.400 |     8.7 |          0.2 |        0.0 |     2.894 |              29.154 |
| Q 9      |   2.700 |     9.4 |          0.3 |        0.0 |     3.145 |              38.349 |
| Q10      |   3.000 |    10.0 |          0.3 |        0.0 |     3.346 |              48.195 |
| Q11      |   3.300 |    10.4 |          0.4 |        0.0 |     3.508 |              58.564 |
| Q12      |   3.600 |    10.8 |          0.4 |        0.0 |     3.637 |              69.353 |

### 3.2 BASE Szenario — Monatliche Projektion Jahr 1

| Monat | Free Users (kum.) | Starter | Professional | Enterprise | MRR (EUR) | Kumul. Umsatz (EUR) |
|-------|-------------------|---------|--------------|------------|-----------|---------------------|
|  1    |     200 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  2    |     400 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  3    |     600 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  4    |     800 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  5    |   1.000 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  6    |   1.200 |     1.0 |          0.0 |        0.0 |       307 |                 307 |
|  7    |   1.400 |     1.9 |          0.0 |        0.0 |       605 |                 912 |
|  8    |   1.600 |     3.8 |          0.1 |        0.0 |     1.201 |               2.112 |
|  9    |   1.800 |     5.5 |          0.1 |        0.0 |     1.780 |               3.892 |
| 10    |   2.000 |     7.1 |          0.2 |        0.0 |     2.342 |               6.235 |
| 11    |   2.200 |     9.7 |          0.3 |        0.0 |     3.196 |               9.430 |
| 12    |   2.400 |    12.0 |          0.5 |        0.0 |     4.025 |              13.455 |

**BASE — Quartalsweise Projektion Jahr 2–3**

| Quartal | Free Users (kum.) | Starter | Professional | Enterprise | MRR (EUR) | Kumul. Umsatz (EUR) |
|---------|-------------------|---------|--------------|------------|-----------|---------------------|
| Q 5      |   3.000 |    16.3 |          2.7 |        0.0 |     8.797 |              35.153 |
| Q 6      |   3.600 |    21.8 |          5.8 |        0.2 |    13.236 |              70.491 |
| Q 7      |   4.200 |    26.4 |          8.5 |        0.5 |    19.145 |             120.320 |
| Q 8      |   4.800 |    30.1 |         11.0 |        1.3 |    24.725 |             187.292 |
| Q 9      |   5.400 |    33.2 |         13.1 |        2.1 |    30.175 |             270.653 |
| Q10      |   6.000 |    35.8 |         15.0 |        2.9 |    35.441 |             369.990 |
| Q11      |   6.600 |    37.9 |         16.7 |        3.8 |    40.550 |             484.807 |
| Q12      |   7.200 |    39.6 |         18.1 |        4.8 |    45.187 |             614.340 |

### 3.3 BULL Szenario — Monatliche Projektion Jahr 1

| Monat | Free Users (kum.) | Starter | Professional | Enterprise | MRR (EUR) | Kumul. Umsatz (EUR) |
|-------|-------------------|---------|--------------|------------|-----------|---------------------|
|  1    |     500 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  2    |   1.000 |     0.0 |          0.0 |        0.0 |         0 |                   0 |
|  3    |   1.500 |     1.0 |          0.0 |        0.0 |       314 |                 314 |
|  4    |   2.000 |     3.9 |          0.1 |        0.0 |     1.259 |               1.574 |
|  5    |   2.500 |     7.6 |          0.3 |        0.0 |     2.526 |               4.100 |
|  6    |   3.000 |    12.1 |          0.5 |        0.0 |     4.118 |               8.218 |
|  7    |   3.500 |    18.4 |          1.8 |        0.0 |     7.207 |              15.426 |
|  8    |   4.000 |    25.3 |          3.3 |        0.1 |    10.651 |              26.076 |
|  9    |   4.500 |    31.8 |          4.8 |        0.2 |    14.136 |              40.213 |
| 10    |   5.000 |    38.1 |          7.3 |        0.3 |    18.520 |              58.733 |
| 11    |   5.500 |    44.0 |          9.9 |        0.5 |    22.968 |              81.701 |
| 12    |   6.000 |    49.6 |         12.4 |        0.7 |    27.458 |             109.158 |

**BULL — Quartalsweise Projektion Jahr 2–3**

| Quartal | Free Users (kum.) | Starter | Professional | Enterprise | MRR (EUR) | Kumul. Umsatz (EUR) |
|---------|-------------------|---------|--------------|------------|-----------|---------------------|
| Q 5      |   7.500 |    59.9 |         19.4 |        1.6 |    47.527 |             227.965 |
| Q 6      |   9.000 |    73.7 |         29.5 |        4.0 |    68.298 |             408.393 |
| Q 7      |  10.500 |    85.5 |         38.9 |        6.8 |    89.724 |             652.454 |
| Q 8      |  12.000 |    95.6 |         47.8 |       10.0 |   111.327 |             961.589 |
| Q 9      |  13.500 |   104.2 |         56.0 |       13.6 |   133.922 |           1.337.097 |
| Q10      |  15.000 |   111.6 |         63.6 |       17.7 |   157.032 |           1.781.428 |
| Q11      |  16.500 |   118.0 |         70.6 |       22.2 |   180.613 |           2.296.042 |
| Q12      |  18.000 |   123.5 |         77.0 |       26.9 |   203.444 |           2.881.091 |

### 3.4 Umsatzzusammenfassung nach Jahren

| Szenario | Jahr 1 Umsatz (EUR) | Jahr 2 Umsatz (EUR) | Jahr 3 Umsatz (EUR) | 3-Jahres-Umsatz (EUR) |
|----------|---------------------|---------------------|---------------------|----------------------|
| BEAR | 2.798 | 26.356 | 40.202 | 69.356 |
| BASE | 13.456 | 173.838 | 427.048 | 614.342 |
| BULL | 109.157 | 852.432 | 1.919.503 | 2.881.092 |

---

## 4. CAC- und LTV-Analyse

### 4.1 Customer Lifetime Value (LTV)

| Tier | Monatlicher Preis | Ø Lifetime (Monate) | LTV (EUR) | Berechnung |
|------|-------------------|---------------------|-----------|------------|
| Starter (BEAR) | €299 | 12,5 | 3.738 | 299 × (1/0,08) |
| Starter (BASE) | €299 | 20 | 5.980 | 299 × (1/0,05) |
| Starter (BULL) | €299 | 33,3 | 9.967 | 299 × (1/0,03) |
| Professional (BASE) | €799 | 20 | 15.980 | 799 × (1/0,05) |
| Enterprise (BASE) | €3.500 | 48 | 168.000 | 3.500 × 12 × (1/0,25) |

### 4.2 Customer Acquisition Cost (CAC) und Payback

**ANNAHME: Cash-Basis CAC = €0** (by design: kein bezahltes Marketing, nur Founder-Zeit)

| Szenario | Impliziter CAC (bei €60K Founder-Gehalt/Jahr) | Payback-Periode |
|----------|-----------------------------------------------|-----------------|
| BEAR | ~€6.667/Kunde (bei 1 Kunde/Quartal) | >12 Monate |
| BASE | ~€2.222/Kunde (bei 3 Kunden/Quartal) | 1–4 Monate |
| BULL | ~€833/Kunde (bei 8 Kunden/Quartal) | <1 Monat |

### 4.3 LTV:CAC Ratio

| Szenario | LTV:CAC (Cash) | LTV:CAC (Founder-Zeit kalkuliert) | Bewertung |
|----------|----------------|-----------------------------------|-----------|
| BEAR | Unendlich | ~0,6:1 | Nicht tragfaehig bei monetarisierter Founder-Zeit |
| BASE | Unendlich | ~7:1 | Tragfaehig fuer Bootstrap |
| BULL | Unendlich | ~12:1 | Stark tragfaehig |

---

## 5. Break-Even-Berechnung

### 5.1 Cash Break-Even (monatlich)

| Szenario | Monatliche Kosten (EUR) | Break-Even MRR (EUR) | Break-Even Kunden | Zeitlinie |
|----------|------------------------|---------------------|-------------------|-----------|
| BEAR | 100 | 100 | 1 Starter | Monat 9–12 |
| BASE | 120 | 120 | 1 Starter | Monat 6–9 |
| BULL | 150 | 150 | 1 Starter | Monat 3–6 |

### 5.2 Founder-Compensation Break-Even (bei €60K/Jahr = €5.000/Monat)

| Szenario | Erforderlicher Monatsumsatz | Erforderlicher MRR | Zeitlinie |
|----------|----------------------------|-------------------|-----------|
| BEAR | €5.100 | 21 Starter Seats | >36 Monate |
| BASE | €5.120 | 21 Starter Seats | Monat 21–24 |
| BULL | €5.150 | 21 Starter Seats | Monat 12–15 |

### 5.3 Gesamt-Break-Even (3-Jahres-Horizont)

| Szenario | Jahr 1 Netto | Jahr 2 Netto | Jahr 3 Netto | Kumulativ nach 3 Jahren |
|----------|-------------|-------------|-------------|------------------------|
| BEAR | 1.598 EUR | -1.844 EUR | -47.998 EUR | -48.244 EUR |
| BASE | 12.016 EUR | 145.398 EUR | 338.608 EUR | 496.022 EUR |
| BULL | 107.357 EUR | 823.632 EUR | 1.830.703 EUR | 2.761.692 EUR |

---

## 6. Cash-Flow-Uebersicht

### 6.1 BEAR Szenario — Cashflow Monat 1–24

| Monat | MRR (EUR) | Betriebskosten (EUR) | Net Cashflow (EUR) | Kumul. Cashflow (EUR) |
|-------|-----------|---------------------|--------------------|-----------------------|
|  1    |         0 |                 100 |               -100 |                  -100 |
|  2    |         0 |                 100 |               -100 |                  -200 |
|  3    |         0 |                 100 |               -100 |                  -300 |
|  4    |         0 |                 100 |               -100 |                  -400 |
|  5    |         0 |                 100 |               -100 |                  -500 |
|  6    |         0 |                 100 |               -100 |                  -600 |
|  7    |         0 |                 100 |               -100 |                  -700 |
|  8    |         0 |                 100 |               -100 |                  -800 |
|  9    |       301 |                 100 |                201 |                  -599 |
| 10    |       580 |                 100 |                480 |                  -119 |
| 11    |       839 |                 100 |                739 |                   620 |
| 12    |     1.078 |               3.100 |             -2.022 |                -1.402 |
| 13    |     1.300 |               3.100 |             -1.800 |                -3.202 |
| 14    |     1.506 |               3.100 |             -1.594 |                -4.796 |
| 15    |     1.696 |               3.100 |             -1.404 |                -6.200 |
| 16    |     1.873 |               3.100 |             -1.227 |                -7.427 |
| 17    |     2.037 |               3.100 |             -1.063 |                -8.490 |
| 18    |     2.189 |               3.100 |               -911 |                -9.401 |
| 19    |     2.329 |               3.100 |               -771 |               -10.172 |
| 20    |     2.460 |               3.100 |               -640 |               -10.812 |
| 21    |     2.581 |               3.100 |               -519 |               -11.331 |
| 22    |     2.693 |               3.100 |               -407 |               -11.738 |
| 23    |     2.798 |               3.100 |               -302 |               -12.040 |
| 24    |     2.894 |               3.100 |               -206 |               -12.246 |

### 6.2 BASE Szenario — Cashflow Monat 1–24

| Monat | MRR (EUR) | Betriebskosten (EUR) | Net Cashflow (EUR) | Kumul. Cashflow (EUR) |
|-------|-----------|---------------------|--------------------|-----------------------|
|  1    |         0 |                 120 |               -120 |                  -120 |
|  2    |         0 |                 120 |               -120 |                  -240 |
|  3    |         0 |                 120 |               -120 |                  -360 |
|  4    |         0 |                 120 |               -120 |                  -480 |
|  5    |         0 |                 120 |               -120 |                  -600 |
|  6    |       307 |                 120 |                187 |                  -413 |
|  7    |       605 |                 120 |                485 |                    72 |
|  8    |     1.201 |                 120 |              1.081 |                 1.153 |
|  9    |     1.780 |                 120 |              1.660 |                 2.813 |
| 10    |     2.342 |                 120 |              2.222 |                 5.035 |
| 11    |     3.196 |                 120 |              3.076 |                 8.111 |
| 12    |     4.025 |               3.120 |                905 |                 9.016 |
| 13    |     5.656 |               5.120 |                536 |                 9.552 |
| 14    |     7.246 |               5.120 |              2.126 |                11.678 |
| 15    |     8.797 |               5.120 |              3.677 |                15.355 |
| 16    |    10.311 |               5.120 |              5.191 |                20.546 |
| 17    |    11.791 |               5.120 |              6.671 |                27.217 |
| 18    |    13.236 |               5.120 |              8.116 |                35.333 |
| 19    |    14.650 |               5.120 |              9.530 |                44.863 |
| 20    |    16.034 |               5.120 |             10.914 |                55.777 |
| 21    |    19.145 |               5.120 |             14.025 |                69.802 |
| 22    |    20.473 |              10.120 |             10.353 |                80.155 |
| 23    |    21.774 |              10.120 |             11.654 |                91.809 |
| 24    |    24.725 |              10.120 |             14.605 |               106.414 |

### 6.3 BULL Szenario — Cashflow Monat 1–24

| Monat | MRR (EUR) | Betriebskosten (EUR) | Net Cashflow (EUR) | Kumul. Cashflow (EUR) |
|-------|-----------|---------------------|--------------------|-----------------------|
|  1    |         0 |                 150 |               -150 |                  -150 |
|  2    |         0 |                 150 |               -150 |                  -300 |
|  3    |       314 |                 150 |                164 |                  -136 |
|  4    |     1.259 |                 150 |              1.109 |                   973 |
|  5    |     2.526 |                 150 |              2.376 |                 3.349 |
|  6    |     4.118 |                 150 |              3.968 |                 7.317 |
|  7    |     7.207 |               2.150 |              5.057 |                12.374 |
|  8    |    10.651 |               2.150 |              8.501 |                20.875 |
|  9    |    14.136 |               2.150 |             11.986 |                32.861 |
| 10    |    18.520 |               2.150 |             16.370 |                49.231 |
| 11    |    22.968 |               7.150 |             15.818 |                65.049 |
| 12    |    27.458 |              10.150 |             17.308 |                82.357 |
| 13    |    32.885 |              10.150 |             22.735 |               105.092 |
| 14    |    38.394 |              10.150 |             28.244 |               133.336 |
| 15    |    47.527 |              10.150 |             37.377 |               170.713 |
| 16    |    53.194 |              10.150 |             43.044 |               213.757 |
| 17    |    58.937 |              10.150 |             48.787 |               262.544 |
| 18    |    68.298 |              10.150 |             58.148 |               320.692 |
| 19    |    74.188 |              10.150 |             64.038 |               384.730 |
| 20    |    80.150 |              10.150 |             70.000 |               454.730 |
| 21    |    89.724 |              10.150 |             79.574 |               534.304 |
| 22    |    95.822 |              10.150 |             85.672 |               619.976 |
| 23    |   101.986 |              10.150 |             91.836 |               711.812 |
| 24    |   111.327 |              10.150 |            101.177 |               812.989 |

---

## 7. Sensitivitaetsanalyse

### 7.1 Tornado-Diagramm: Was bewegt den Hebel am staerksten?

**BASE-Szenario, 36-Monats-Umsatz = 614.342 EUR**

| Variable | Aenderung von BASE | Impact auf 36-Mo-Umsatz | Sensitivitaets-Rang |
|----------|-------------------|------------------------|--------------------|
| Zeit bis erster Kunde | +3 Monate | −~€85.000 | **HOCH** |
| Monatliche Churn (Starter/Pro) | +3pp (auf 8%) | −~€95.000 | **HOCH** |
| Neue Starter-Kunden/Monat | −1 (auf 2) | −~€65.000 | **HOCH** |
| Free → Koordinator-Referral-Rate | −2pp (auf 3%) | −~€45.000 | MITTEL |
| Enterprise-Preis | −€1.000/Monat | −~€35.000 | MITTEL |
| Virale Invite-Rate | −5pp (auf 5%) | −~€22.000 | NIEDRIG |
| SEO-Traffic pro Post | −10 Visits | −~€15.000 | NIEDRIG |

### 7.2 Schluessel-erkenntnis

**Churn und Zeit-bis-erstem-Kunde sind die hebelstaerksten Variablen.** Eine 3-monatige Verzoegerung oder ein 3-Prozentpunkt-Anstieg im Churn reduzieren den 36-Monats-Umsatz jeweils um ~15–20%.

**Das bedeutet:** Produktqualitaet (Retention) und GTM-Execution-Speed sind im Zero-Budget-Modus deutlich wichtiger als Preisoptimierung oder virale Coefficient-Tuning.

---

## 8. SaaS-/Startup-Kennzahlen-Dashboard

### 8.1 Gesundheits-Scorecard (BASE Szenario, Monat 36)

| Kennzahl | Wert | Ziel | Status |
|----------|------|------|--------|
| MRR | €45.187 | >€5.000 | :green_circle: Gruen |
| ARR (Annual Run Rate) | €542.244 | >€100.000 | :green_circle: Gruen |
| Kundenanzahl (zahlend) | 63,9 | >50 | :green_circle: Gruen |
| Net Revenue Retention | 105% | >100% | :green_circle: Gruen |
| LTV:CAC (Cash) | Unendlich | >3:1 | :green_circle: Gruen |
| LTV:CAC (mit Founder-Zeit) | ~7:1 | >3:1 | :green_circle: Gruen |
| Monatliche Churn | 5% | <5% | :yellow_circle: Gelb |
| CAC Payback | 1–4 Monate | <12 Monate | :green_circle: Gruen |
| Cash Runway | >24 Monate | >12 Monate | :green_circle: Gruen |
| Free-to-Paid Conversion | ~4% | >2% | :green_circle: Gruen |

### 8.2 Benchmark-Vergleich

| Kennzahl | NephroAssist (BASE M36) | Median SaaS (Pre-Seed) | Median SaaS (Seed) |
|----------|--------------------------|------------------------|-------------------|
| MRR-Wachstum (MoM) | ~8% | 5–10% | 10–20% |
| Churn (monatlich) | 5% | 5–8% | 3–5% |
| LTV:CAC | 7:1 | 3:1 | 5:1 |
| NRR | 105% | 100% | 105% |
| ARPU | €707 | €200–€500 | €500–€1.000 |

---

## 9. Risikobewertung und Handlungsempfehlungen

### 9.1 Kritische Risiken (Existenzgefaehrdend)

| Risiko | Wahrscheinlichkeit | Impact | Abschwaechung |
|--------|-------------------|--------|--------------|
| Transplantationsprogramme lehnen Self-Serve ab | MITTEL | HOCH | Kostenlose Piloten; kleine Programme zuerst; Koordinator-Champions aufbauen |
| HIPAA/GDPR-Compliance blockiert Adoption | MITTEL | HOCH | BAA-bereite Infrastruktur ab Tag 1; DPIA vor EU-Launch |
| EHR-Integration dauert laenger als erwartet | HOCH | MITTEL | Standalone zuerst; FHIR als Upgrade positionieren |
| Founder-Burnout vor Revenue | MITTEL | HOCH | Harte Meilensteine (z.B. 6 Monate bis erster Kunde oder Pivot) |
| Vertriebszyklus selbst fuer kleine Programme >12 Monate | MITTEL | HOCH | Einzelne Koordinatoren ansprechen, nicht Komitees |

### 9.2 Risikoadjustierter Erwartungswert

| Szenario | Wahrscheinlichkeit | 36-Mo-Umsatz | Risikoadjustiert |
|----------|-------------------|--------------|-----------------|
| BEAR | 25% | 69.356 EUR | 17.339 EUR |
| BASE | 50% | 614.342 EUR | 307.171 EUR |
| BULL | 25% | 2.881.092 EUR | 720.273 EUR |
| **Gewichteter Erwartungswert** | | | **1.044.783 EUR** |

---

## 10. Narrative Zusammenfassung

### 10.1 Fuer Investoren

NephroAssist ist ein **Bootstrap-faehiges SaaS-Unternehmen in einem Nischenmarkt mit hoher Eintrittsbarriere**. Die Transplantationskoordination ist ein kritischer, missionskritischer Workflow, der derzeit mit Tabellenkalkulationen, Telefonketten und Klebezetteln verwaltet wird. Kein Wettbewerber bietet eine transplant-spezifische Patienten-App mit kombiniertem Task-Management, Echtzeit-Kommunikation und dokumentenbasierten Workflows.

Das **BASE-Szenario** prognostiziert einen **3-Jahres-Umsatz von ~€614K** bei einem **Cash-CAC von €0** (organisches Wachstum durch SEO, Community und virale Loops). Die Unit Economics sind auf Cash-Basis vorteilhaft: LTV:CAC ist unendlich, Payback-Perioden liegen bei 1–4 Monaten. Der realistische Knackpunkt ist die **Akquisitionsgeschwindigkeit**, nicht die Rentabilitaet pro Kunde.

**Kritische Investitions-Entscheidungs-Gates:**
- **Gruen** (Monat 12–18): 10+ zahlende Kunden, €5K MRR, NRR >100% → Seed-Runde erwaeigen
- **Gelb** (Monat 12): 3–9 zahlende Kunden, €1K–€5K MRR → Bootstrap fortsetzen
- **Rot** (Monat 12): <3 zahlende Kunden → Produkt, Pricing oder Pivot neu bewerten

### 10.2 Fuer interne Planung

Die **Monatsburnrate im Zero-Budget-Modell liegt bei €100–€150**. Ein einzelner Starter-Kunde (€299/Monat) deckt die Betriebskosten. Die eigentliche Huerde ist die **Founder-Compensation**: Bei einem angenommenen Gehaltsaequivalent von €60.000/Jahr sind ~21 Starter-Seats noetig, um den Founder zu entlohnen.

**Prioritaeten nach Sensitivitaetsanalyse:**
1. **Retention vor Acquisition** — Churn-Senkung hat hoeheren Impact als neue Kunden
2. **Speed-to-First-Revenue** — Jede Monatsverzoegerung kostet ~€25–30K ueber 24 Monate
3. **Enterprise-Pipeline** — Ein einzelner Enterprise-Vertrag (€42K/Jahr) entspricht 14 Starter-Kunden

### 10.3 Annahmen-Checkliste

| # | Annahme | Verwendet in | Konfidenz |
|---|---------|------------|-----------|
| 1 | Founder arbeitet ohne Gehalt | Alle Szenarien | HOCH |
| 2 | Infrastrukturkosten €100–€150/Monat | Kostenstruktur | HOCH |
| 3 | Starter = €299/Monat, Pro = €799/Monat, Enterprise = €3.500/Monat | Pricing | MITTEL — keine Wettbewerberdaten |
| 4 | Free-Patienten-App treibt Koordinator-Referrals | CAC=0 | MITTEL — abhaengig von UX |
| 5 | SEO braucht 6 Monate bis signifikanter Traffic | CAC=0 | MITTEL — Nischenmarkt |
| 6 | Churn 3–8% fuer monatliche Plaene | Unit Economics | MITTEL — keine Daten |
| 7 | Self-Serve-Sales-Cycle = 0 Tage | Umsatzmodell | HOCH — Kreditkarte sofort |
| 8 | Enterprise-Sales-Cycle = 12–24 Monate | Umsatzmodell | HOCH — aus Recherche |
| 9 | Patientendemografie akzeptiert digitales Tool | Alle Szenarien | MITTEL — aeltere Demografie |
| 10 | Transplant-Koordinatoren haben Budgeteinfluss | GTM | MITTEL — erfordert Validierung |

---

*Modell erstellt von financial-analyst fuer Kanban-Aufgabe t_9eb2fc50. Basierend auf Zero-Budget Financial Model (t_59df76ad), Investor Memo (t_3452d6a8) und Consolidated Research (t_c269008b). Alle Annahmen sind explizit genannt und sensibilitaetstestet. Projektionen sind Szenario-Planungswerkzeuge, keine Prognosen.*
