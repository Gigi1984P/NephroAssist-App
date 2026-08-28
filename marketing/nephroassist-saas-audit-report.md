# NephroAssist SaaS Audit Report

**Task:** t_c00353db — Audit Nephroassist SaaS for product readiness and launch blockers  
**Auditor:** saas-auditor  
**Date:** 2026-08-28  
**Scope:** /opt/data/projects/nephroassist/  

---

## Executive Summary

NephroAssist is a multi-tenant SaaS platform for organ transplant coordination (initially kidney), built with Next.js 16 App Router, React 19, Bootstrap 5.3, Prisma ORM, and PostgreSQL. It targets transplant centers, dialysis centers, nephrologists, patients, and caregivers in the German-speaking market. The codebase is structurally sound, builds cleanly, and implements a rich domain model with patient cases, requirement templates, tasks, documents, appointments, blockers, help requests, messaging, audit logs, and role-based access.

**Readiness verdict:** The product is **feature-rich but not launch-ready** for paying customers. Several high-severity gaps block production use in a regulated healthcare context: no billing/subscription layer, weak security controls (no rate limiting, no CSRF protection, no CSP), middleware that does not actually verify JWTs, hardcoded demo credentials in the frontend, and no test coverage. The app is suitable for a **closed beta / pilot with a single clinic** under a manual contract, but not for self-serve public launch.

---

## 1. Architecture & Tech Stack

| Layer | Technology | Evidence |
|-------|-----------|----------|
| Framework | Next.js 16.3.2 (App Router) | `package.json` |
| Frontend | React 19.2.8, Bootstrap 5.3 (CDN) | `package.json`, `src/app/layout.tsx` |
| Language | TypeScript 5.9.3 (strict mode) | `tsconfig.json` |
| ORM | Prisma 5.22.0 | `package.json`, `prisma/schema.prisma` |
| Database | PostgreSQL 16 | `prisma/schema.prisma`, `docker-compose.yml` |
| Auth | Custom JWT (nephro-token) + NextAuth 5 beta fallback | `src/lib/auth.ts`, `src/middleware.ts` |
| Email | Resend (optional, logs fallback) | `src/lib/email.ts` |
| Storage | Local filesystem (`uploads/`) for documents | `src/app/api/documents/upload/route.ts` |
| Cache / Sessions | Redis configured in Docker, but not actively used in app code | `docker-compose.yml` |
| Object Storage | MinIO in Docker (optional) | `docker-compose.yml` |
| OIDC | Keycloak in Docker (optional for dev) | `docker-compose.yml` |
| Testing | Jest + Playwright (e2e tests misconfigured) | `package.json`, `tests/e2e/auth.spec.ts` |

**Build status:** `npm run build` passes. `npm run typecheck` passes (no TS errors). `npm run lint` passes (zero ESLint issues). `npm run test` fails because Jest tries to run Playwright `.spec.ts` files without a proper config split.

---

## 2. Feature Map

### Implemented Features (OBSERVED)
- **Multi-tenant organizations** with memberships and roles (`Organization`, `OrganizationMembership`, `Role`, `Permission`)
- **Patient management** (CRUD, contact info, consent status, GP info)
- **Patient cases** with status pipeline (`REFERRAL` → `INTAKE` → `EVALUATION` → `READY_FOR_REVIEW` → `UNDER_REVIEW` → `DEFERRED` → `APPROVED` → `WAITLISTED` → `INACTIVE` → `TRANSPLANTED` → `CLOSED`)
- **Requirement templates** with versioning, categories, listing blockers, validity durations, renewal lead times
- **Patient requirements** derived from templates, with status tracking and due dates
- **Tasks & clinical workflows** (6-step sequential workflows: Dental Clearance, Cardiac Clearance) with step-by-step unlock logic
- **Document upload & review queue** (PDF/JPG/PNG, local filesystem storage, SHA-256 checksums, document reviews)
- **Appointments** with calendar view (FullCalendar)
- **Blockers** (active/resolved) for case impediments
- **Help requests** (patient can request help on requirements/tasks)
- **Notifications** (in-app, per user)
- **Audit logs** (actor, action, entity, IP, metadata)
- **Timeline events** per case
- **Transplant passport** (shareable token-based view)
- **Secure upload links** (token-based, expiring, usage-limited)
- **Caregiver access** (invited, revocable, with permissions JSON)
- **Medication plan** (per patient, with dosing schedule)
- **Dialysis regime** (comprehensive fields: procedure, frequency, access type, machine settings, lab controls, anticoagulation)
- **Admin panel** (user management, audit log, reports, system settings)
- **Dashboard** (clinic view: recently viewed patients, completed patients; patient view: progress card + appointments)
- **Reports / Analytics** (KPIs: total patients, completed counts, avg days to complete, open reqs, completed cases)
- **AI infrastructure** (prompt templates, versions, processing logs — schema present, no active AI provider integration observed)
- **Feature flags** (global + per-organization)
- **System settings** (key/value config table)

### Missing / Incomplete Features
- **No billing, subscriptions, or pricing model** — no Stripe/Paddle/LemonSqueezy integration, no `Subscription`, `Invoice`, or `Plan` models in schema
- **No self-serve onboarding flow** — admin must manually create users; no organization self-registration
- **No email verification** — users can register and immediately log in
- **No password reset flow** — "Passwort vergessen?" shows an `alert()` telling users to contact an admin
- **No MFA** — schema/docs mention MFA-readiness but no implementation
- **No onboarding tutorial / guided walkthrough** — first-time users land directly on dashboard
- **No real S3 integration** — documents stored on local filesystem; MinIO config exists but not wired to upload handler
- **No AI document processing** — `AIProcessingLog` and `PromptTemplate` tables exist, but no active OCR/LLM pipeline in code
- **No cron jobs wired** — cron route files exist (`appointment-reminders`, `check-expirations`) but no scheduler (Vercel Cron, GitHub Actions, etc.)
- **No Terms of Service / Privacy Policy / Impressum pages** — legally required in Germany
- **No cookie consent banner** — Bootstrap + analytics would need GDPR compliance

---

## 3. Authentication & Authorization

### Auth Architecture
The app uses a **dual auth system**:
1. **Custom JWT (`nephro-token`)** — issued by `/api/login`, verified by `auth()` and `authFromRequest()`, 7-day expiry, signed with `NEXTAUTH_SECRET` via HS256.
2. **NextAuth v5 beta (`next-auth`)** — configured as fallback with Credentials provider, Prisma adapter, JWT sessions.

**RISK — HIGH:** The middleware (`src/middleware.ts`) only checks whether the `nephro-token` cookie **exists**; it does **not verify the JWT signature or expiry**. This means:
- Any client can set a cookie named `nephro-token` with any value and bypass the middleware gate for `/dashboard`.
- Server components do verify the token via `auth()`, but API routes that rely solely on middleware are not protected.
- The `auth()` function silently swallows errors (`catch {}`) and falls back to the custom token, making debugging difficult.

### Authorization Model
- **RBAC** with 9 user roles: `ADMIN`, `COORDINATOR`, `PHYSICIAN`, `NURSE`, `PATIENT`, `CAREGIVER`, `DIALYSIS_STAFF`
- **Permission system** (`Permission` model with `resource` + `action`) exists in schema but is **not actively enforced in API routes**. Most routes use hardcoded role checks (`session.user.role !== "ADMIN"`) rather than querying the `Permission` table.
- **Tenant isolation** is partially implemented: `getAllowedPatientIds()` filters patients by organization or case assignment. However, not all API routes use `patientScopeWhere()` — some rely on Prisma queries without organization filters.
- **Role-Permission mapping** (`OrganizationMembership.roleId`) is defined but many API routes do not resolve the role's permissions from the database.

### Security Gaps (Auth)
1. **Middleware does not verify JWT** — trivial to bypass (HIGH).
2. **Password reset missing** — users must contact admin (MEDIUM).
3. **No rate limiting on `/api/login`** — brute-forceable (HIGH).
4. **No account lockout** — unlimited failed login attempts (MEDIUM).
5. **Demo credentials hardcoded in login page** — `Test1234!` passwords visible in `src/app/login/page.tsx` (MEDIUM).
6. **No email verification** — anyone can register with any email (MEDIUM).
7. **NextAuth secret fallback** — `"fallback-secret-do-not-use-in-production"` is hardcoded in `auth.ts` and `middleware.ts` (HIGH).

---

## 4. Data Model & Database

### Schema Quality
- **1266 lines**, 40+ models, well-organized into domains (Identity, Patient/Case, Programs/Requirements, Tasks, Documents, Appointments, Blockers, Messaging, Audit, Passport, AI Config).
- **Indexes** are present on foreign keys and frequently queried fields.
- **Cascading deletes** are configured (`onDelete: Cascade` on most child relations).
- **Enums** are used for statuses and types.
- **JSON fields** used for flexible data (`metadata`, `settings`, `contactInfo`, `reminders`).

### Data Integrity Risks
1. **No database-level constraints** for multi-tenant isolation — all filtering is application-level. A bug in one query could leak cross-tenant data.
2. **`organizationId` on documents uses `session.user.id`** as fallback — see TODO in `upload/route.ts` (MEDIUM).
3. **No soft deletes** — patient deletion cascades to cases, requirements, tasks, documents. No recovery mechanism.
4. **No data retention policies** — audit logs and login histories accumulate indefinitely.

---

## 5. Security Assessment

| Control | Status | Evidence |
|---------|--------|----------|
| Input validation (Zod) | Partial | Used in some routes (`admin/users`, `examinations/templates`) but not all |
| SQL injection prevention | Yes | Prisma ORM used throughout |
| XSS prevention | Partial | No CSP header; Bootstrap 5 handles some escaping, but no global output encoding |
| CSRF protection | No | SameSite=Lax on cookie, but no double-submit tokens or CSRF middleware |
| Rate limiting | No | None found in codebase |
| File upload security | Partial | MIME whitelist (PDF/JPG/PNG), size limit (10MB), SHA-256, but stored on local filesystem, no virus scan |
| TLS in transit | Yes | HTTPS assumed (Vercel) |
| Encryption at rest | No | No TDE or field-level encryption observed; documents stored as plain files |
| Secrets management | Partial | `.env.example` documents variables, but no secret rotation strategy implemented |
| PHI in logs | Risk | Login API logs email and role to console; no structured PII scrubbing |

---

## 6. Performance & Reliability

### Performance Observations
- **Dashboard queries are heavy** — `prisma.patient.findMany` with nested `cases.requirements` fetches up to 100 patients with all their cases and requirements. No pagination on nested data.
- **No caching layer** — Redis is configured in Docker but not used for query caching or session storage.
- **Next.js cache headers disabled** — `Cache-Control: no-store` on all routes (`next.config.js`).
- **No connection pooling** configured explicitly for Prisma in production.

### Reliability Observations
- **Error handling is inconsistent** — some routes return 500 with stack traces in production (`login/route.ts` returns `error.stack` in JSON).
- **No health check endpoint**.
- **No structured logging** — mostly `console.log` / `console.error`.
- **No retry/backoff** on external calls (email).
- **No circuit breaker** for Resend email API.

---

## 7. Technical Debt

1. **Bootstrap 5.3 via CDN** — acceptable for MVP, but adds external dependency and slows load times.
2. **No Tailwind** — intentionally removed per `architecture.md`, but custom CSS in `globals.css` duplicates Bootstrap utilities.
3. **Client-side layout fetches user profile** — `dashboard/layout.tsx` is a Client Component that fetches `/api/user/profile` after mount, causing a flash of loading state.
4. **Hardcoded German strings** — all UI text is inline German; no i18n framework.
5. **Test suite broken** — Jest tries to run Playwright files; zero unit tests for business logic.
6. **`tsx` used for Prisma seed** — acceptable but adds a dev dependency.
7. **Docker Compose for local dev only** — no production Dockerfile or containerization strategy.

---

## 8. Prioritized Launch Blockers

### P0 — Critical (Must Fix Before Any Paid Customer)
1. **Middleware JWT verification** — currently only checks cookie existence. Actually verify and decode the JWT in middleware, or remove middleware and enforce auth in every route handler.
2. **Remove hardcoded fallback secret** — `NEXTAUTH_SECRET` must be required; fail startup if missing.
3. **Rate limit login endpoint** — at minimum, add in-memory rate limiting (e.g., 5 attempts per IP per 15 minutes).
4. **Remove demo credentials from production build** — `demoAccounts` array in `login/page.tsx` must be stripped or hidden behind a non-production flag.
5. **Add `organizationId` filter to all data queries** — enforce tenant isolation at the Prisma query level; add a helper wrapper that injects `organizationId` into every query.

### P1 — High (Blocks Public Launch / Self-Serve)
6. **Implement billing / subscription model** — even a simple Stripe Checkout integration with `Subscription` and `Plan` tables. Without this, there is no mechanism to charge customers.
7. **Add password reset flow** — email-based token reset, required for any self-serve SaaS.
8. **Add email verification** — verify email before account activation.
9. **Add Terms of Service, Privacy Policy, Impressum** — legally required in Germany (DGSVO / TMG).
10. **Implement CSP headers** and secure cookie flags review.
11. **Add CSRF protection** — especially for state-changing POST requests.

### P2 — Medium (Needed for Scale / Compliance)
12. **Write unit tests for permissions and auth logic** — fix Jest config, add tests for `getAllowedPatientIds`, `canAccessPatient`, `auth()`.
13. **Replace local filesystem document storage with S3/MinIO** — local storage is not scalable or resilient on Vercel serverless.
14. **Add cron job scheduler** — wire `appointment-reminders` and `check-expirations` routes to Vercel Cron or an external scheduler.
15. **Add health check and structured logging** — replace `console.log` with a structured logger (e.g., Pino).
16. **Implement MFA for admin accounts** — TOTP or WebAuthn.

### P3 — Low (Improvements / Polish)
17. **Onboarding flow / product tour** — first-time user guidance.
18. **i18n framework** — extract German strings for future localization.
19. **Optimize dashboard queries** — add pagination, use Prisma `select` to reduce payload, consider denormalized stats table.
20. **Add Sentry or error tracking** — capture frontend and backend errors.

---

## 9. Missing Commercial Pieces

| Piece | Status | Impact |
|-------|--------|--------|
| Pricing page / plans | Missing | Customers cannot evaluate cost |
| Stripe integration | Missing | No revenue collection |
| Subscription lifecycle (trial → paid → cancel) | Missing | No self-serve monetization |
| Organization onboarding (signup → create org → invite team) | Missing | High friction for new clinics |
| Public marketing website / landing page | Partial — `src/app/page.tsx` is a landing page but contains only a login link | Poor conversion |
| SEO / meta tags | Missing | No organic discovery |
| Customer support channel / chat | Missing | Support burden on founders |
| SLA / uptime monitoring | Missing | Professional credibility |

---

## 10. Recommendations & Next Steps

### Immediate (This Sprint)
1. **Fix middleware JWT verification** — this is the single biggest security hole.
2. **Audit every API route** for `organizationId` filtering and add it where missing.
3. **Strip demo accounts** from production or gate them behind `process.env.NODE_ENV !== "production"`.
4. **Add rate limiting** to `/api/login` and `/api/auth/register`.

### Short Term (Next 4 Weeks)
5. **Integrate Stripe Checkout** with `Plan`, `Subscription`, and `Invoice` models.
6. **Build password reset + email verification flows**.
7. **Add TOS / Privacy Policy / Impressum pages**.
8. **Fix test suite** and add coverage for auth, permissions, and critical business logic.

### Medium Term (Next 3 Months)
9. **Replace local file storage with S3-compatible object storage** (e.g., MinIO or AWS S3).
10. **Implement cron jobs** for appointment reminders and expiration checks.
11. **Add error tracking (Sentry)** and structured logging.
12. **Performance optimization** — query pagination, connection pooling, optional Redis caching.

### Commercial Readiness
13. **Define pricing tiers** (e.g., per-patient/month, per-clinic/month) and build a public pricing page.
14. **Build a self-serve organization signup flow**.
15. **Create a professional landing page** with SEO, trust signals, and demo video.

---

## Evidence References

- `src/middleware.ts` — middleware only checks cookie presence, does not verify JWT
- `src/lib/auth.ts` — hardcoded fallback secret, dual auth system
- `src/app/login/page.tsx` — hardcoded demo accounts with `Test1234!`
- `src/app/api/login/route.ts` — no rate limiting, returns stack trace in error response
- `src/app/api/documents/upload/route.ts` — `organizationId: session.user.id` TODO
- `src/lib/permissions.ts` — RBAC logic, but permission table unused in routes
- `prisma/schema.prisma` — full data model
- `package.json` — dependency list, no billing library
- `docs/architecture.md` — design decisions documented
- `docs/security.md` — security requirements documented but not fully implemented
- `docs/deployment.md` — Vercel deployment, production DB at `m22p.your-database.de`

---

*End of report.*
