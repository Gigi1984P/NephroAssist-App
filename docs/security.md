# NephroAssist Security Architecture

## 1. Security by Design Principles

- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimum necessary access
- **Privacy by Design**: Data minimization, purpose limitation
- **Zero Trust**: Verify every request, every time
- **Fail Secure**: Default deny, explicit allow

## 2. Authentication Architecture

### OIDC Standard
- Provider: Keycloak or Managed OIDC
- NOT tightly coupled to a specific provider
- Standard OIDC flows: Authorization Code + PKCE

### Multi-Factor Authentication (MFA-Ready)
- Architecture supports MFA enrollment
- TOTP/WebAuthn ready
- Enforced for admin roles

### Session Management
- Server-side sessions (Redis)
- Configurable session timeout (default: 30 minutes idle, 8 hours max)
- Secure, HttpOnly, SameSite=Strict cookies
- Session invalidation on logout, password change, suspicious activity

## 3. Authorization Architecture

### RBAC + ABAC Hybrid
- Role-Based Access Control (RBAC) for coarse permissions
- Attribute-Based Access Control (ABAC) for fine-grained, context-aware decisions

### Permission System
```
patient.read
patient.update
patient.assign

requirement.read
requirement.create
requirement.review
requirement.approve

document.read
document.upload
document.review
document.delete

appointment.read
appointment.manage

organization.manage
user.manage
template.manage

audit.read
analytics.read
```

### Tenant Isolation
- Every data query filtered by `organizationId`
- PostgreSQL RLS policies as defense-in-depth
- Cross-tenant sharing only via explicit relationships
- Tenant context validated on every request

### Admin Privilege Separation
```
PLATFORM_SUPER_ADMIN: Full platform management, NO automatic patient data access
ORGANIZATION_ADMIN: Organization config, limited patient data per consent
CLINICAL_ADMIN: Clinical workflows, NO admin config access
```

## 4. Data Protection

### Encryption at Rest
- PostgreSQL: Transparent Data Encryption (TDE) or database-level encryption
- S3: Server-side encryption (AES-256)
- Redis: Encrypted persistence if enabled

### Encryption in Transit
- TLS 1.3 for all communications
- mTLS for service-to-service where applicable

### Key Management
- Secrets via environment variables or secret management (1Password, HashiCorp Vault)
- NO secrets in code, logs, or database
- Key rotation strategy documented

## 5. PHI/PII Handling

### Data Minimization
- Collect only what is necessary
- Anonymize where possible for analytics

### PHI Scrubbing
- NO patient data in:
  - Logs
  - Analytics
  - URLs
  - Error messages
  - Email subjects
  - Sentry
  - OpenTelemetry attributes
- PII redaction in all observability data

### Audit Trail
- Immutable audit log
- Actor, action, entity, timestamp, IP
- NO secrets in audit metadata

## 6. File Upload Security

### Upload Flow Security
```
Upload → Virus Scan Hook → Hash → Store → OCR Job
```

### Controls
- Presigned URLs (time-limited)
- Authorization checks on every access
- File size limits (configurable, default 10MB)
- MIME type validation (whitelist)
- Malware scanning hook
- SHA-256 checksums
- Duplicate detection
- Audit logging for every access

### Document Access
- Signed URLs with expiration
- Authorization check before presigned URL generation
- Access logged

## 7. API Security

### Input Validation
- Zod schema validation on all inputs
- API input, form input, AI output, webhooks, env vars

### Rate Limiting
- Per-user, per-IP, per-tenant
- Configurable limits
- DDoS protection

### CSRF Protection
- For cookie-based auth
- Double-submit pattern or SameSite cookies

### XSS Prevention
- Output encoding
- Content Security Policy (CSP)
- No inline scripts

### SQL Injection Prevention
- Prisma ORM (parameterized queries)
- No raw SQL without validation

## 8. AI Privacy Gateway

### LLMGateway
- ALL AI calls via backend service
- NO direct LLM API calls from frontend

### Gateway Responsibilities
- Provider selection
- Data redaction before sending to LLM
- Logging policy (what gets logged)
- Prompt versioning
- Timeout/retry
- Cost tracking
- Structured output validation

### AI Data Handling
- PHI scrubbed before AI processing
- AI results stored with audit trail
- Human override tracked
- No chain-of-thought stored

## 9. Infrastructure Security

### Docker Security
- Non-root containers
- Read-only filesystems where possible
- Resource limits
- Security scanning in CI

### Network Security
- Internal services not exposed externally
- Reverse proxy with TLS termination
- Network segmentation

### Secret Management
- Environment variables for non-sensitive config
- Secret management system for credentials
- NO secrets in Git
- Secret rotation procedure

## 10. Compliance Alignment

### GDPR
- Data minimization
- Purpose limitation
- Storage limitation
- Right to erasure (architecturally prepared, legal review required)
- Data portability
- Consent management

### HIPAA
- Business Associate Agreement (BAA) ready
- Access controls
- Audit controls
- Integrity controls
- Transmission security

### HITRUST / ISO 27001
- Controls mapped
- Evidence collection prepared

## 11. Security Review Gates

### Before Production
- [ ] Threat model review
- [ ] Authorization review
- [ ] Tenant isolation tests
- [ ] File upload security review
- [ ] Secrets review
- [ ] Logging review (PHI scrubbing)
- [ ] Dependency scan
- [ ] Backup/restore test

### Red Lines (Trigger Security Reviewer)
- Any auth bypass
- Tenant isolation failure
- PHI in logs/observability
- Unencrypted data at rest
- Missing audit trail for sensitive actions
- Admin impersonation without full audit
- Production secret exposure

## 12. Incident Response

### Detection
- Sentry alerts
- Anomaly detection on audit logs
- Failed auth attempt monitoring

### Response
- Automated session revocation on suspicious activity
- Admin notification
- Audit trail preservation
- Post-incident review

## 13. Security Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Patient    │  │  Coordinator│  │  Admin      │        │
│  │  (Mobile)   │  │  (Desktop)  │  │  (Desktop)  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                      │
              ┌───────▼───────┐
              │   WAF / CDN   │
              │   TLS 1.3     │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  Reverse Proxy│
              │  Rate Limit   │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  Next.js App  │
              │  OIDC Auth    │
              │  RBAC Check   │
              └───────┬───────┘
                      │
      ┌───────────────┼───────────────┐
      │               │               │
┌─────▼─────┐  ┌──────▼──────┐  ┌────▼────┐
│PostgreSQL │  │  Redis      │  │  S3     │
│RLS + Enc  │  │  Sessions   │  │  Enc    │
│Audit Log  │  │  Queue      │  │  Signed │
└───────────┘  └─────────────┘  │  URLs   │
                                └─────────┘
```

## 14. Session Timeout Requirements

- Idle timeout: 30 minutes (configurable)
- Absolute timeout: 8 hours
- Admin sessions: 15 minutes idle, 4 hours absolute
- MFA-remember: 30 days (optional)
- Concurrent session limit: 5 per user

## 15. End-to-End Encryption for Messaging

- Patient-coordinator messaging: TLS in transit
- At-rest: encrypted in database
- Future: E2E encryption for sensitive messaging (architecture prepared)

## 16. Breach Notification SLA

- Internal detection: 24 hours
- Business Associate notification: 48 hours
- Supervisory authority (GDPR): 72 hours
- Affected individuals: without undue delay

## 17. Backup Security

- Encrypted backups
- Backup access logging
- Restore tested quarterly
- Object storage versioning where appropriate
- Backup retention: 7 years for audit data
