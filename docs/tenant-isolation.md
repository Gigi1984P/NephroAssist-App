# NephroAssist Tenant Isolation Strategy

## 1. Principle

Every piece of patient data, every workflow, every document belongs to exactly one organization (tenant). No data leaks between tenants. Cross-tenant sharing is explicit, consent-based, and audit-logged.

## 2. Isolation Model: Row-Level + Application Enforcement

### Strategy

We use **application-level tenant filtering** as the primary defense, with **PostgreSQL Row-Level Security (RLS)** as defense-in-depth.

### Why Not Schema-per-Tenant or Database-per-Tenant?

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Database-per-tenant | Strongest isolation | Operational complexity, cost | ❌ Rejected |
| Schema-per-tenant | Good isolation | Migration complexity | ❌ Rejected |
| Row-level + App filtering | Simple, scalable, sufficient | Requires discipline | ✅ Selected |

## 3. Tenant Context

### Every Relevant Record Has `organizationId`

```prisma
model Patient {
  id             String
  organizationId String  // ← Tenant context
  // ...
}

model Document {
  id             String
  organizationId String  // ← Tenant context
  // ...
}

model PatientCase {
  id             String
  organizationId String  // ← Tenant context
  // ...
}
```

### Tenant Context Propagation

```
HTTP Request
  ↓
Auth Middleware: Extract user from JWT/session
  ↓
Tenant Middleware: Extract organization from:
  - Header (X-Organization-ID)
  - User's active membership
  - URL parameter
  ↓
Tenant Context: Set in request/AsyncLocalStorage
  ↓
All Services: Filter by tenantContext.organizationId
  ↓
All Queries: WHERE organizationId = ?
```

## 4. Application-Level Enforcement

### Repository Pattern

```typescript
// All queries include tenant filter
class BaseRepository<T> {
  constructor(
    private model: Prisma.ModelName,
    private tenantContext: TenantContext
  ) {}

  async findById(id: string): Promise<T | null> {
    return prisma[this.model].findFirst({
      where: {
        id,
        organizationId: this.tenantContext.organizationId
      }
    })
  }

  async findMany(where: any = {}): Promise<T[]> {
    return prisma[this.model].findMany({
      where: {
        ...where,
        organizationId: this.tenantContext.organizationId
      }
    })
  }

  async create(data: any): Promise<T> {
    return prisma[this.model].create({
      data: {
        ...data,
        organizationId: this.tenantContext.organizationId
      }
    })
  }
}
```

### Service Layer

```typescript
class DocumentService {
  constructor(
    private tenantContext: TenantContext,
    private auditService: AuditService
  ) {}

  async getDocument(id: string) {
    // Tenant check enforced by repository
    const doc = await this.documentRepo.findById(id)
    
    if (!doc) {
      // Log access attempt for security monitoring
      await this.auditService.log({
        action: 'ACCESS_DENIED',
        entityType: 'Document',
        entityId: id,
        reason: 'TENANT_MISMATCH_OR_NOT_FOUND'
      })
      throw new NotFoundError()
    }
    
    return doc
  }
}
```

## 5. PostgreSQL RLS (Defense in Depth)

### RLS Policies

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_cases ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Create policy for application user
CREATE POLICY tenant_isolation ON patients
  FOR ALL
  TO app_user
  USING (organization_id = current_setting('app.current_tenant')::UUID);

-- Set tenant context before each query
SET app.current_tenant = 'org-uuid-here';
```

### When RLS Applies

- Direct SQL queries (bypassing Prisma)
- Admin tools (psql, pgAdmin)
- Backup/restore operations
- Analytics queries

### When Application Filtering Applies

- Normal application flow via Prisma
- API requests
- Background jobs (tenant context passed explicitly)

## 6. Cross-Tenant Sharing

### Explicit Sharing Only

```
Patient A at Center A
  wants to share Document D with Center B

Flow:
  1. Patient A grants consent
  2. System creates DataSharingPermission:
     - patientId: A
     - recipientId: Center B
     - documentId: D
     - expiresAt: 30 days
  3. Center B can access Document D
  4. Every access is audit-logged
  5. Expiration auto-revokes access
```

### Sharing Permissions

```typescript
interface DataSharingPermission {
  id: string
  patientId: string
  recipientOrganizationId: string
  resourceType: 'DOCUMENT' | 'CASE' | 'PASSPORT'
  resourceId: string
  grantedAt: Date
  expiresAt: Date
  revokedAt?: Date
  grantedBy: string // Patient or authorized representative
}
```

### Multi-Center Patient

```
Patient has:
  Case 1 at Center A (Kidney Evaluation)
  Case 2 at Center B (Kidney Evaluation)

Cases are isolated by organizationId.
Documents from Case 1 can be reused in Case 2
ONLY with explicit patient consent.
Center B decides independently on acceptance.
```

## 7. User Membership and Tenant Access

### OrganizationMembership

```prisma
model OrganizationMembership {
  id             String
  userId         String
  organizationId String
  roleId         String
  status         ACTIVE | INACTIVE | PENDING
}
```

### Active Tenant Resolution

```typescript
// From request
function resolveTenant(req: Request): string {
  // 1. Check X-Organization-ID header
  const headerOrg = req.headers['x-organization-id']
  if (headerOrg) return validateMembership(req.user, headerOrg)
  
  // 2. Check user's primary/active membership
  const activeMembership = req.user.memberships.find(m => m.status === 'ACTIVE')
  if (activeMembership) return activeMembership.organizationId
  
  // 3. If user has only one membership, use that
  if (req.user.memberships.length === 1) {
    return req.user.memberships[0].organizationId
  }
  
  throw new TenantResolutionError('Cannot determine active tenant')
}
```

### Multi-Organization Users

```
User Dr. Smith:
  - Member of Center A (Transplant Coordinator)
  - Member of Center B (External Consultant)

UI shows organization switcher.
All data filtered by selected organization.
Switching organization requires re-auth check.
```

## 8. Admin Access to Tenant Data

### Super Admin

```
PLATFORM_SUPER_ADMIN:
  - Can access ALL organizations
  - But every access is AUDIT LOGGED
  - Cannot access without explicit organization context
  - Impersonation requires explicit permission + time limit
```

### Org Admin

```
ORGANIZATION_ADMIN:
  - Can access all data within their organization
  - NO access to other organizations
  - Admin actions logged separately
```

### Clinical Admin

```
CLINICAL_ADMIN:
  - Can access clinical data within organization
  - NO access to admin config
  - NO access to other organizations
```

## 9. Background Jobs and Tenant Context

### Job Payload Includes Tenant

```typescript
interface JobPayload {
  tenantId: string
  userId: string
  data: any
}

// Example: Email job
{
  tenantId: 'org-123',
  userId: 'user-456',
  data: {
    template: 'REQUIREMENT_DUE',
    patientId: 'pat-789'
  }
}
```

### Worker Tenant Context

```typescript
async function processJob(job: Job) {
  // Set tenant context for this job
  const tenantContext = new TenantContext(job.tenantId)
  
  // All services use this context
  const notificationService = new NotificationService(tenantContext)
  await notificationService.send(job.data)
  
  // Tenant context cleared after job
}
```

## 10. Testing Tenant Isolation

### Critical E2E Test

```
Test: Tenant Security

Given: User from Center A
When: Attempts to access Center B patient
Then: Access denied
And: Security event logged
```

### Unit Tests

```typescript
describe('Tenant Isolation', () => {
  it('should only return documents for current tenant', async () => {
    const tenantA = new TenantContext('org-a')
    const repo = new DocumentRepository(tenantA)
    
    // Create doc in org A
    await repo.create({ filename: 'test.pdf' })
    
    // Create doc in org B (directly via prisma)
    await prisma.document.create({
      data: { filename: 'other.pdf', organizationId: 'org-b' }
    })
    
    // Repo should only return org A doc
    const docs = await repo.findMany()
    expect(docs).toHaveLength(1)
    expect(docs[0].organizationId).toBe('org-a')
  })
  
  it('should deny access to cross-tenant document', async () => {
    const tenantA = new TenantContext('org-a')
    const repo = new DocumentRepository(tenantA)
    
    // Doc in org B
    const orgBDoc = await prisma.document.create({
      data: { filename: 'secret.pdf', organizationId: 'org-b' }
    })
    
    // Should return null (not found for this tenant)
    const doc = await repo.findById(orgBDoc.id)
    expect(doc).toBeNull()
  })
})
```

## 11. Tenant Isolation Checklist

### For Every New Feature

- [ ] Does the entity have `organizationId`?
- [ ] Is `organizationId` required (NOT NULL)?
- [ ] Does the repository filter by `organizationId`?
- [ ] Does the service enforce tenant context?
- [ ] Are API endpoints scoped to tenant?
- [ ] Is cross-tenant access explicit and audited?
- [ ] Are background jobs passed tenant context?
- [ ] Are integration tests written for tenant isolation?

## 12. Error Handling

### Tenant Mismatch

```typescript
// DON'T reveal existence of resource in other tenant
if (!doc || doc.organizationId !== tenantContext.organizationId) {
  throw new NotFoundError() // NOT ForbiddenError
}
```

### Audit on Denial

```typescript
await auditService.log({
  action: 'ACCESS_DENIED',
  entityType: 'Document',
  entityId: id,
  metadata: {
    attemptedTenant: tenantContext.organizationId,
    actualTenant: doc?.organizationId
  }
})
```

## 13. Migration Safety

### Adding Tenant to Existing Tables

```sql
-- Step 1: Add column (nullable first)
ALTER TABLE patients ADD COLUMN organization_id UUID;

-- Step 2: Backfill with default tenant
UPDATE patients SET organization_id = 'default-tenant-id';

-- Step 3: Make NOT NULL
ALTER TABLE patients ALTER COLUMN organization_id SET NOT NULL;

-- Step 4: Add index
CREATE INDEX idx_patients_org ON patients(organization_id);

-- Step 5: Add RLS policy
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON patients FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
```
