# Deployment & Entwicklung

## Deployment

### Vercel
- **URL:** https://nephro-assist-app-pied.vercel.app
- Auto-Deployment bei Push auf main
- GitHub: `Gigi1984P/NephroAssist-App`
- Branch: `main`

### SSH Key für Push
- Key: `~/.ssh/nephroassist_github`
- Config in `~/.ssh/config` eingetragen

### Environment Variables (Vercel)
- `DATABASE_URL` — PostgreSQL Connection String
- `NEXTAUTH_SECRET` — Für JWT Signing
- `NODE_ENV` — `production`

## Datenbank

### Production DB
- **Host:** `m22p.your-database.de`
- **Connection:** In `.env` und Vercel Secrets
- **Schema-Updates:** `npx prisma db push`
- **URL-Encoding:** In `src/lib/prisma.ts` für Sonderzeichen

### Prisma Commands
```bash
# Schema validieren
npx prisma validate

# DB Schema deployen
npx prisma db push

# Prisma Client neu generieren
npx prisma generate

# DB direkt ansehen
npx prisma studio
```

## Build & Deploy

### Lokaler Build
```bash
npm run build
```

### Vollständiger Deploy-Flow
```bash
# 1. Änderungen committen
git add -A
git commit -m "feat: Beschreibung"

# 2. Pushen (Vercel deployt automatisch)
git push origin main

# 3. Vercel Dashboard überprüfen
#    https://vercel.com/dashboard
```

## Entwicklungs-Workflow

### Konventionen
1. **Nie Dev-Server starten** — User will direkten Build + Push
2. **Alles in einem Commit** — Mehrere Features zusammen
3. **Deutsch commit messages** — User spricht Deutsch
4. **Build sauber halten** — Vor jedem Push `npm run build` prüfen

### Typischer Ablauf
```bash
# Dateien editieren
# ...

# Build testen
npm run build

# Committen
git add -A
git commit -m "feat(feature): Beschreibung auf Deutsch"

# Pushen
git push origin main
```

## Troubleshooting

### Build-Fehler
```bash
# Prisma Client neu generieren
npx prisma generate

# Node_modules löschen und neu installieren
rm -rf node_modules package-lock.json
npm install

# TypeScript-Prüfung überspringen (nicht empfohlen)
# In next.config.ts: typescript.ignoreBuildErrors = true
```

### DB-Verbindungsprobleme
- `.env` prüfen
- `src/lib/prisma.ts` — URL-Encoding aktiv?
- PostgreSQL-Host erreichbar?

### Auth-Probleme
- Cookie `nephro-token` gesetzt?
- `credentials: "include"` in fetch?
- `/api/user/profile` erreichbar?

## Demo-Testdaten

### Patient (für Tests)
- Name: Hans Müller
- Email: patient@beispiel.de
- Passwort: Test1234!
- Dental Clearance ID: `f2e815ab-6020-4a3b-9952-467b43f5d7bb`

### Test-Credentials
Alle Demo-Accounts haben Passwort: `Test1234!`
- admin@nephroassist.de
- koordinator@nephroassist.de
- arzt@nephroassist.de
- patient@beispiel.de
- dialyse@nephroassist.de
- transplant@nephroassist.de
- pflege@nephroassist.de

## Offene Punkte (Bekannte Issues)

1. **Reports API HTTP 500** — `patient_cases` Abfrage schlägt fehl
2. **Browser-Automatisierung** — Chrome Headless nicht nutzbar (DBus-Fehler)

## Letzter bekannter Zustand

- **Branch:** main
- **Build:** Sauber
- **DB:** Production mit allen Schema-Updates
- **Auth:** Custom JWT stabil
- **Workflow:** 6 Schritte mit sequentieller Freischaltung implementiert
- **Features:** Alle im README beschriebenen Features sind live
