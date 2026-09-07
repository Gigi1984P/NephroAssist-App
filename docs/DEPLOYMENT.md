# NephroAssist — Deployment-Guide

> **Ziel:** Produktives Deployment auf Vercel mit PostgreSQL-Datenbank

---

## 📋 Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Repository vorbereiten](#2-repository-vorbereiten)
3. [Datenbank einrichten](#3-datenbank-einrichten)
4. [Vercel-Projekt erstellen](#4-vercel-projekt-erstellen)
5. [Umgebungsvariablen konfigurieren](#5-umgebungsvariablen-konfigurieren)
6. [Erstes Deployment](#6-erstes-deployment)
7. [Prisma Migrations & Seed](#7-prisma-migrations--seed)
8. [Cron-Jobs verifizieren](#8-cron-jobs-verifizieren)
9. [Post-Deployment Checks](#9-post-deployment-checks)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Voraussetzungen

| Tool | Version | Hinweis |
|------|---------|---------|
| **Node.js** | >= 18.0.0 | empfohlen: 20.x LTS |
| **npm** | >= 9.0.0 | oder `pnpm` / `yarn` |
| **Git** | aktuell | SSH-Key für GitHub |
| **Vercel CLI** | optional | `npm i -g vercel` |
| **PostgreSQL** | >= 14 | Remote-DB (z.B. Supabase, Neon, AWS RDS) |

### Accounts

- [ ] GitHub Account (Repository: `Gigi1984P/NephroAssist-App`)
- [ ] Vercel Account (mit GitHub verbunden)
- [ ] PostgreSQL-Datenbank (extern gehostet)
- [ ] E-Mail-Service (SMTP oder Resend API Key)
- [ ] 1Password (für Secrets-Management, empfohlen)

---

## 2. Repository vorbereiten

### 2.1 Lokal klonen

```bash
git clone git@github.com:Gigi1984P/NephroAssist-App.git
cd NephroAssist-App
```

### 2.2 Abhängigkeiten installieren

```bash
npm install
```

### 2.3 Prisma Client generieren

```bash
npx prisma generate
```

### 2.4 Build lokal testen

```bash
npm run build
```

> **Erfolg:** Keine TypeScript-Fehler, kein Build-Fehler.

---

## 3. Datenbank einrichten

### 3.1 PostgreSQL-Datenbank erstellen

Empfohlene Provider:

| Provider | URL | Preis | Hinweis |
|----------|-----|-------|---------|
| **Supabase** | supabase.com | Kostenlos (Starter) | Gut für Entwicklung |
| **Neon** | neon.tech | Kostenlos (Tier 1) | Serverless, gut für Vercel |
| **AWS RDS** | aws.amazon.com/rds | Pay-per-use | Produktions-Grade |
| **DigitalOcean** | digitalocean.com | ab $15/Monat | Einfach, Managed |

### 3.2 Connection String ermitteln

Format:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public
```

Beispiel:
```
postgresql://postgres:mein-passwort@db.abc123.supabase.co:5432/nephroassist
```

### 3.3 SSL-Modus

Vercel verbindet sich über öffentliches Internet zur DB. SSL ist **Pflicht**:

```
postgresql://...?schema=public&sslmode=require
```

Bei selbstgehosteter DB ohne SSL: Verbindung nur via Private Network (nicht empfohlen).

---

## 4. Vercel-Projekt erstellen

### 4.1 Via Vercel Dashboard

1. https://vercel.com/new
2. GitHub-Repo `Gigi1984P/NephroAssist-App` importieren
3. Projekt-Name: `nephroassist` (oder Custom)
4. Framework Preset: **Next.js** (automatisch erkannt)

### 4.2 Via Vercel CLI

```bash
# Login
vercel login

# Initiales Deployment
vercel

# Produktions-Deployment
vercel --prod
```

### 4.3 Build-Einstellungen

Die `vercel.json` im Repository enthält bereits:

```json
{
  "buildCommand": "npm install --include=dev && npx prisma generate && npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --include=dev",
  "framework": "nextjs",
  "regions": ["fra1"],
  "crons": [
    { "path": "/api/cron/check-expirations", "schedule": "0 2 * * *" },
    { "path": "/api/cron/appointment-reminders", "schedule": "0 18 * * *" }
  ]
}
```

> **Wichtig:** `--include=dev` ist nötig, weil `prisma` und `tsx` als `devDependencies` gelistet sind.

---

## 5. Umgebungsvariablen konfigurieren

### 5.1 In Vercel Dashboard

**Settings → Environment Variables**

| Variable | Wert | Hinweis |
|----------|------|---------|
| `DATABASE_URL` | `postgresql://...` | SSL erforderlich |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Min. 32 Byte |
| `NEXTAUTH_URL` | `https://www.wowendo.com` | Muss auf accessed Domain zeigen |
| `RESEND_API_KEY` | `re_...` | Optional, für E-Mail |
| `SMTP_HOST` | `smtp.example.com` | Alternativ zu Resend |
| `SMTP_PORT` | `587` | TLS-Port |
| `SMTP_USER` | `user@example.com` | SMTP-Benutzer |
| `SMTP_PASS` | `...` | SMTP-Passwort |
| `SMTP_FROM` | `noreply@nephroassist.de` | Absender-Adresse |

### 5.2 Via CLI

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### 5.3 Lokale `.env.local`

```bash
# Entwicklung
DATABASE_URL="postgresql://postgres:passwort@localhost:5432/nephroassist"
NEXTAUTH_SECRET="dev-secret-mindestens-32-zeichen-lang!!!"
NEXTAUTH_URL="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="dein-email@gmail.com"
SMTP_PASS="dein-app-passwort"
SMTP_FROM="NephroAssist <noreply@nephroassist.de>"
```

---

## 6. Erstes Deployment

### 6.1 Erster Push

Nach dem Verbinden mit Vercel:

```bash
git push origin main
```

Vercel startet automatisch den Build.

### 6.2 Build-Verlauf prüfen

Im Vercel Dashboard:
- **Deployments** → letzter Commit
- Logs auf Fehler prüfen

Typische Fehler:
- ❌ `DATABASE_URL` fehlt → `P1001: Can't reach database server`
- ❌ `NEXTAUTH_SECRET` fehlt → Auth funktioniert nicht
- ❌ Prisma Generate fehlt → `PrismaClientInitializationError`

---

## 7. Prisma Migrations & Seed

### 7.1 Migrations ausführen

> **Achtung:** `prisma migrate deploy` NICHT in Build-Scripts verwenden (siehe MEMORY: P3005-Policy).

**Option A: Via Vercel Shell (nur Erst-Setup)**

```bash
# Lokal: Migration auf Remote-DB anwenden
DATABASE_URL="postgresql://REMOTE-URL" npx prisma migrate deploy
```

**Option B: Admin UI auf Production**

Falls `_prisma_migrations` Tabelle fehlt:
- Rufe `/admin/migrate` auf (wenn implementiert)
- oder führe Migrationen lokal mit Remote-DB-URL aus

### 7.2 i18n-Translations seeden

```bash
# Lokal mit Remote-DB
DATABASE_URL="postgresql://REMOTE-URL" npm run db:seed
# oder
curl -X POST https://www.wowendo.com/api/translations/seed
```

### 7.3 Demo-Daten (optional)

```bash
# Lokal: Patienten- und Benutzer-Daten seeden
DATABASE_URL="postgresql://REMOTE-URL" npx tsx prisma/seed.ts
```

---

## 8. Cron-Jobs verifizieren

### 8.1 Aktive Cron-Jobs

| Pfad | Schedule | Funktion |
|------|----------|----------|
| `/api/cron/check-expirations` | `0 2 * * *` | Täglich 2 Uhr: Prüft abgelaufene Dokumente/Anforderungen |
| `/api/cron/appointment-reminders` | `0 18 * * *` | Täglich 18 Uhr: Sendet Termin-Erinnerungen |

### 8.2 Cron-Logs prüfen

Vercel Dashboard → **Cron Jobs** → Logs

Alternativ via API:
```bash
curl https://api.vercel.com/v1/projects/nephroassist/cron-jobs \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

### 8.3 Cron manuell testen

```bash
curl -X POST https://www.wowendo.com/api/cron/check-expirations \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 9. Post-Deployment Checks

### 9.1 Funktionale Tests

| Test | Erwartetes Ergebnis | URL |
|------|---------------------|-----|
| Homepage lädt | ✅ | `/` |
| Login-Seite | ✅ | `/login` |
| Login mit Demo-Account | Dashboard-Redirect | `/login` → `/dashboard` |
| Dashboard lädt | Sidebar + Content | `/dashboard` |
| Patienten-Liste | Daten sichtbar | `/dashboard/patients` |
| Kalender | Termine sichtbar | `/dashboard/calendar` |
| E-Mail | Inbox lädt | `/dashboard/email` |
| Admin-Panel | Zugriff nur als ADMIN | `/dashboard/admin` |
| i18n | Deutsche Texte | Überall |
| Dark Mode | Toggle funktioniert | Sidebar |

### 9.2 API-Tests

```bash
# Health Check (implizit via Login)
curl -X POST https://www.wowendo.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nephroassist.de","password":"Test1234!"}'

# Response sollte JWT-Token enthalten
```

### 9.3 Security-Checks

| Check | Tool / Methode |
|-------|---------------|
| CSP Header | Browser DevTools → Network → Response Headers |
| HSTS | `curl -I https://www.wowendo.com` → `strict-transport-security` |
| X-Frame-Options | `curl -I https://www.wowendo.com` → `x-frame-options: DENY` |
| Cookies | DevTools → Application → Cookies → `SameSite=Strict` prüfen |

---

## 10. Troubleshooting

### 10.1 `P1001: Can't reach database server`

**Ursache:** `DATABASE_URL` falsch oder Netzwerk nicht erreichbar.

**Lösung:**
```bash
# Teste DB-Verbindung
psql "$DATABASE_URL"
# Oder via Node
node -e "const {PrismaClient} = require('@prisma/client'); new PrismaClient().$queryRaw\`SELECT 1\`"
```

### 10.2 `PrismaClientInitializationError`

**Ursache:** Prisma Client nicht generiert.

**Lösung:**
```bash
# In Build-Script sicherstellen
npx prisma generate
```

### 10.3 `Module not found: Can't resolve '@auth/prisma-adapter'`

**Ursache:** Dev-Dependencies fehlen im Build.

**Lösung:** `vercel.json` muss `--include=dev` haben:
```json
"buildCommand": "npm install --include=dev && npx prisma generate && npm run build"
```

### 10.4 Build dauert zu lange (>10 Min)

**Ursache:** `node_modules` zu groß oder TypeScript-Prüfung langsam.

**Lösung:**
- Vercel Build-Timeout ist 45 Min (Pro-Plan) / 15 Min (Hobby)
- `optimizePackageImports` in `next.config.js` aktivieren
- `.vercelignore` für große Dateien:
  ```
  __tests__/
  docs/
  *.md
  ```

### 10.5 `NEXTAUTH_URL` Mismatch

**Ursache:** `NEXTAUTH_URL` zeigt auf falsche Domain.

**Lösung:**
```bash
# Muss exakt auf accessed Domain zeigen
vercel env add NEXTAUTH_URL
# Wert: https://www.wowendo.com (NICHT https://wowendo.com ohne www)
```

### 10.6 E-Mails werden nicht gesendet

**Ursache:** SMTP/Resend nicht konfiguriert.

**Lösung:**
1. Prüfe `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in Env-Vars
2. Teste SMTP-Verbindung:
   ```bash
   telnet $SMTP_HOST $SMTP_PORT
   ```
3. Resend-Alternative: `RESEND_API_KEY` statt SMTP setzen

### 10.7 `403 Forbidden` bei Admin-Seiten

**Ursache:** Benutzer hat nicht die `ADMIN` Rolle.

**Lösung:**
```sql
-- Direkt in DB prüfen
SELECT role FROM "User" WHERE email = 'admin@nephroassist.de';
-- Sollte 'ADMIN' zurückgeben
```

---

## 🔄 Continuous Deployment

### Git Workflow

```bash
# Feature entwickeln
git checkout -b feature/neues-feature
# ... Änderungen ...
git commit -m "feat: neues Feature"
git push origin feature/neues-feature

# PR erstellen → Review → Merge nach main
# Vercel deployed automatisch auf Production
```

### Preview Deployments

Jeder Pull Request auf `main` erzeugt automatisch eine **Preview URL**:

```
https://nephroassist-git-feature-neues-feature-gigi1984p.vercel.app
```

> Nutze Preview Deployments für QA vor dem Merge.

---

## 📊 Monitoring

### Vercel Analytics

1. Dashboard → **Analytics**
2. Web Vitals (LCP, FID, CLS) automatisch erfasst
3. Traffic-Übersicht

### Fehler-Tracking

| Tool | Einrichtung |
|------|-------------|
| **Vercel Logs** | Dashboard → Deployments → Logs |
| **Sentry** | Optional, `SENTRY_DSN` als Env-Var |
| **LogRocket** | Optional, für Session Replay |

### Datenbank-Monitoring

- Prisma Accelerate (optional): https://prisma.io/accelerate
- Supabase Dashboard (falls verwendet)
- PostgreSQL Logs via Provider

---

## 🚀 Schnellstart-Checkliste

- [ ] Repository geklont und `npm install` ausgeführt
- [ ] Lokaler Build erfolgreich (`npm run build`)
- [ ] PostgreSQL-Datenbank erstellt
- [ ] Vercel-Projekt mit GitHub verbunden
- [ ] Alle Umgebungsvariablen in Vercel gesetzt
- [ ] Erstes Deployment erfolgreich
- [ ] Prisma Migrations auf Produktion ausgeführt
- [ ] i18n Translations geseedet
- [ ] Demo-Accounts getestet (Login → Dashboard)
- [ ] Cron-Jobs verifiziert
- [ ] Security-Header geprüft (CSP, HSTS, Cookies)
- [ ] Custom Domain konfiguriert (optional: www.wowendo.com)

---

## 📞 Support

| Problem | Ressource |
|---------|-----------|
| Vercel Build-Fehler | [Vercel Docs](https://vercel.com/docs) |
| Prisma Issues | [Prisma Docs](https://prisma.io/docs) |
| Next.js | [Next.js Docs](https://nextjs.org/docs) |
| NephroAssist Projekt | `PROJECT-STATE.md` im Repository |

---

*Letzte Aktualisierung: September 2026*
