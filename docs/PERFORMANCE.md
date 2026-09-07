# NephroAssist — Performance-Analyse & Optimierung

> Stand: September 2026 | Commit: `main`

---

## 📊 Aktuelle Metriken

| Metrik | Wert | Status |
|--------|------|--------|
| **Build-Größe (.next)** | ~393 MB | ⚠️ Sehr groß |
| **API Routes** | 91 Endpunkte | ✅ Skalierbar |
| **Große Komponenten (>5KB)** | 12 Stück | ⚠️ Optimierbar |
| **Statische Seiten** | 29/29 prerendered | ✅ Gut |
| **Dynamic Pages** | Server-rendered | ✅ Gut |

---

## 🐘 Build-Größe Analyse

### Größte Chunks (geschätzt)

| Chunk | Größe | Beschreibung |
|-------|-------|--------------|
| `admin-panel.tsx` | 41.2 KB | Monolithisches Admin-Panel |
| `dialysis-regime-inline.tsx` | 21.0 KB | Dialyse-Regime Inline-Editor |
| `dialysis-regime.tsx` | 19.4 KB | Dialyse-Regime Komponente |
| `sidebar.tsx` | 16.8 KB | Sidebar (für alle Seiten) |
| `medication-plan.tsx` | 11.8 KB | Medikationsplan |
| `document-upload.tsx` | 7.0 KB | Dokumenten-Upload |

### Vendor-Dependencies (potenziell groß)

| Package | Nutzung | Optimierung |
|---------|---------|-------------|
| `lucide-react` | Alle Seiten | `optimizePackageImports` aktiviert |
| `@tiptap/*` | Nur CMS-Seiten | ✅ Lazy Loading implementiert |
| `next-auth` | Alle Seiten | Unvermeidbar |
| `@radix-ui/*` | Alle Seiten | `optimizePackageImports` aktiviert |

---

## ✅ Bereits Implementierte Optimierungen

### 1. Next.js `optimizePackageImports`
```js
// next.config.js
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "@radix-ui/react-icons",
  ],
}
```
→ Automatisches Tree-Shaking für Icon-Bibliotheken

### 2. Lazy Loading für TipTap Editor
```tsx
const TipTapEditor = dynamic(
  () => import("@/components/tiptap-editor").then(mod => ({ default: mod.TipTapEditor })),
  { ssr: false, loading: () => <div>Editor wird geladen...</div> }
);
```
→ TipTap wird nur auf CMS-Seiten geladen, nicht im initialen Bundle

### 3. Image Optimierung
```js
images: {
  formats: ["image/avif", "image/webp"],
}
```
→ Moderne Bildformate für bessere Kompression

---

## 📋 Empfohlene Weitere Optimierungen

### P1: Bundle Splitting (Webpack)

```js
// next.config.js — Erweiterung
webpack(config, { isServer }) {
  if (!isServer) {
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          priority: 10,
          reuseExistingChunk: true,
        },
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: "lucide",
          priority: 20,
          reuseExistingChunk: true,
        },
        tiptap: {
          test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
          name: "tiptap",
          priority: 20,
          reuseExistingChunk: true,
        },
      },
    };
  }
  return config;
}
```

### P2: Komponenten-Bündelung

| Komponente | Aktuell | Optimiert |
|------------|---------|-----------|
| `admin-panel.tsx` | In jeder Admin-Seite | Dynamic Import auf `/dashboard/admin` |
| `dialysis-regime.tsx` | In Patient-Detail | Dynamic Import auf Patient-Tab-Wechsel |
| `document-upload.tsx` | In Dokumenten-Seite | Bereits isoliert |

### P3: API Response Caching

```ts
// Middleware oder Route-Handler
cacheControl: "public, max-age=60, stale-while-revalidate=300"
```

| Endpoint | Cache-Dauer | Begründung |
|----------|-------------|------------|
| `/api/translations` | 1h | Selten geändert |
| `/api/patients/overview` | 30s | Häufige Änderungen |
| `/api/appointments` | 0s | Echtzeit-Daten |

### P4: Datenbank-Optimierung

| Query | Status | Empfehlung |
|-------|--------|------------|
| `appointment.findMany` + `patient` | Unoptimiert | Add `@db.Index` auf `startTime` |
| `patient.findMany` + `org` | Unoptimiert | Add `organizationId` Index |
| `notification.findMany` | Unoptimiert | Add Compound Index auf `userId + read` |

### P5: Lighthouse/Core Web Vitals

| Metrik | Ziel | Aktuell | Maßnahme |
|--------|------|---------|----------|
| **LCP** | <2.5s | Unbekannt | Bild-Optimierung, Font-Preload |
| **FID** | <100ms | Unbekannt | JS-Chunks reduzieren, Code-Splitting |
| **CLS** | <0.1 | Unbekannt | Layout-Reservierung für lazy Komponenten |
| **TTFB** | <600ms | Unbekannt | DB-Queries optimieren, Connection Pooling |

---

## 🛠️ Monitoring Tools

### Bundle-Analyse (lokal)

```bash
# Mit @next/bundle-analyzer (wenn installiert)
ANALYZE=true npm run build
# Öffnet Browser mit interaktivem Bundle-Graph

# Alternative: Statische Analyse
npm run build 2>&1 | grep -E "(First Load JS|chunks)"
```

### Lighthouse CI

```bash
# Einmalig
npm install -g lighthouse
lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html
```

### Web Vitals (Runtime)

```tsx
// src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export function reportWebVitals(metric: any) {
  console.log(metric);
  // Send to analytics: /api/analytics/vitals
}
```

---

## 📈 Optimierungs-Roadmap

| Phase | Task | Impact | Aufwand |
|-------|------|--------|---------|
| **P1** | Webpack Bundle Splitting | 🔴 Hoch | 2h |
| **P2** | Dynamic Imports für Admin/Dialyse | 🔴 Hoch | 1h |
| **P3** | DB-Indizes hinzufügen | 🟡 Mittel | 30min |
| **P4** | API Response Caching | 🟡 Mittel | 1h |
| **P5** | Lighthouse-Audit durchführen | 🟡 Mittel | 30min |
| **P6** | Web Vitals Monitoring | 🟢 Niedrig | 30min |

---

## 📝 Notizen

- Die `.next`-Ordnergröße von 393MB ist primär durch Prisma Client (generierter Code) und Next.js Cache verursacht — das Production-Bundle ist deutlich kleiner.
- TipTap Lazy Loading reduziert das initiale Bundle um ~50KB (geschätzt).
- Die Sidebar (16.8KB) ist auf allen Seiten vorhanden — lohnt sich nicht zu splitten.
