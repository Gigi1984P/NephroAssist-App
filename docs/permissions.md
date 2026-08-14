# NephroAssist RBAC / Permission Matrix

## 1. Role Hierarchy

```
PLATFORM_SUPER_ADMIN
├── ORGANIZATION_ADMIN
│   ├── CLINICAL_ADMIN
│   ├── TRANSPLANT_COORDINATOR
│   ├── TRANSPLANT_PHYSICIAN
│   ├── DIALYSIS_ADMIN
│   ├── DIALYSIS_STAFF
│   ├── NEPHROLOGIST
│   └── EXTERNAL_PROVIDER
├── PATIENT
└── CAREGIVER
```

## 2. Permission Catalog

### Patient Permissions
| Permission | Description |
|------------|-------------|
| patient.read | View own patient profile |
| patient.update | Update own patient profile |
| patient.read.case | View own case details |
| patient.read.requirements | View own requirements |
| patient.read.documents | View own documents |
| patient.upload.document | Upload own documents |
| patient.read.appointments | View own appointments |
| patient.manage.appointments | Schedule/cancel own appointments |
| patient.read.tasks | View own tasks |
| patient.complete.task | Mark own tasks complete |
| patient.read.calendar | View own calendar |
| patient.read.passport | View transplant passport |
| patient.share.passport | Share passport with others |
| patient.request.help | Request help |
| patient.read.messages | Read messages in threads |
| patient.send.message | Send messages |
| patient.read.notifications | Read own notifications |
| patient.configure.reminders | Configure reminder preferences |

### Document Permissions
| Permission | Description |
|------------|-------------|
| document.read | View documents (scoped by tenant) |
| document.upload | Upload documents |
| document.review | Review and accept/reject documents |
| document.delete | Delete documents (soft delete) |
| document.request | Request documents from patient |
| document.classify | Classify documents (AI or manual) |
| document.extract | Extract data from documents |

### Requirement Permissions
| Permission | Description |
|------------|-------------|
| requirement.read | View requirements |
| requirement.create | Create requirements |
| requirement.update | Update requirements |
| requirement.delete | Delete requirements |
| requirement.review | Review requirement completion |
| requirement.approve | Approve requirements |
| requirement.assign | Assign requirements to patients |
| requirement.configure | Configure requirement templates |

### Appointment Permissions
| Permission | Description |
|------------|-------------|
| appointment.read | View appointments |
| appointment.create | Create appointments |
| appointment.update | Update appointments |
| appointment.delete | Cancel appointments |
| appointment.manage | Full appointment management |

### Organization Permissions
| Permission | Description |
|------------|-------------|
| organization.read | View organization details |
| organization.manage | Manage organization settings |
| organization.manage.members | Manage organization members |
| organization.manage.roles | Manage roles |
| organization.read.analytics | View organization analytics |

### Admin Permissions
| Permission | Description |
|------------|-------------|
| admin.read | Access admin dashboard |
| admin.manage.organizations | Manage all organizations |
| admin.manage.users | Manage all users |
| admin.manage.patients | Manage all patients |
| admin.manage.programs | Manage transplant programs |
| admin.manage.requirements | Manage requirement library |
| admin.manage.templates | Manage templates |
| admin.manage.workflows | Manage workflows |
| admin.manage.document.types | Manage document types |
| admin.manage.task.templates | Manage task templates |
| admin.manage.validity.rules | Manage validity rules |
| admin.manage.reminder.rules | Manage reminder rules |
| admin.manage.email.templates | Manage email templates |
| admin.manage.translations | Manage translations |
| admin.manage.ai.config | Manage AI configuration |
| admin.manage.feature.flags | Manage feature flags |
| admin.manage.system.settings | Manage system settings |
| admin.read.audit.logs | Read audit logs |
| admin.read.job.monitor | Monitor jobs |
| admin.manage.integrations | Manage integrations |
| admin.read.analytics | Read system analytics |

### Audit Permissions
| Permission | Description |
|------------|-------------|
| audit.read | Read audit logs (scoped) |
| audit.read.all | Read all audit logs (super admin) |

### Analytics Permissions
| Permission | Description |
|------------|-------------|
| analytics.read | Read analytics (scoped by tenant) |
| analytics.read.all | Read all analytics (super admin) |

## 3. Role Permission Matrix

| Permission | PATIENT | CAREGIVER | COORDINATOR | PHYSICIAN | DIALYSIS_STAFF | NEPHROLOGIST | ORG_ADMIN | SUPER_ADMIN |
|------------|:-------:|:---------:|:-----------:|:---------:|:--------------:|:------------:|:---------:|:-----------:|
| patient.read.own | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| patient.read.all | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| patient.update.own | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| patient.update.all | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| patient.assign | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| requirement.read | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| requirement.create | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| requirement.review | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| requirement.approve | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| requirement.configure | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| document.read | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| document.upload | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| document.review | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| document.delete | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| appointment.read | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| appointment.create | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| appointment.manage | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| organization.read | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| organization.manage | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| audit.read | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| audit.read.all | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| analytics.read | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| analytics.read.all | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| admin.* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

*Note: Patients and caregivers can only read their own data.

## 4. Tenant Isolation Rules

### Data Access Rule
```
A user may only access data where:
  data.organizationId IN (user's organization memberships)
  OR
  data is explicitly shared with user's organization
```

### Cross-Tenant Sharing
- Explicit relationship required
- Consent-based for patient data
- Audit logged

### Admin Access to Patient Data
- ORG_ADMIN: Can access patient data within their organization
- SUPER_ADMIN: Can access all data, but action is audit logged
- CLINICAL_ADMIN: Can access clinical data within their organization
- Admin impersonation: Requires explicit permission, time-limited, full audit

## 5. Dynamic Authorization Checks

### Per-Resource Authorization
```typescript
// Example authorization check
can(user, 'document.review', document) {
  return user.hasPermission('document.review') 
    && user.organizationId === document.organizationId
    && document.status === 'READY_FOR_REVIEW'
}
```

### Context-Aware Authorization
```typescript
// Coordinator can only review documents assigned to their cases
can(user, 'requirement.review', requirement) {
  return user.hasPermission('requirement.review')
    && user.organizationId === requirement.organizationId
    && (requirement.assignedCoordinatorId === user.id 
        || user.hasPermission('requirement.review.all'))
}
```

## 6. Consent-Based Access

### Patient Consent Model
```
Consent
├── patientId
├── consentType: DATA_SHARING | TREATMENT | RESEARCH
├── grantedTo: organizationId
├── scope: JSON (what data is shared)
├── grantedAt: datetime
├── revokedAt: datetime (nullable)
├── version: number
```

### Data Sharing Permission
```
DataSharingPermission
├── patientId
├── recipientId: userId or organizationId
├── categories: string[] (tasks, calendar, documents, etc.)
├── expiresAt: datetime
├── grantedAt: datetime
├── revokedAt: datetime
```

## 7. API Authorization Middleware

### Request Flow
```
Request → Auth (OIDC) → Tenant Context → Permission Check → Resource Access
```

### Middleware Stack
```
1. authenticate: Verify JWT/session
2. tenantContext: Extract organization from request
3. authorize: Check permission for resource/action
4. audit: Log access to sensitive resources
```

## 8. Feature Flag Authorization

### Feature Access Control
```
FeatureFlag
├── name: AI_DOCUMENT_PROCESSING
├── scope: GLOBAL | ORGANIZATION
├── organizationId: UUID (if scope=ORGANIZATION)
├── enabled: boolean
```

### Check
```typescript
if (!featureFlag.isEnabled('AI_DOCUMENT_PROCESSING', organizationId)) {
  throw new ForbiddenError('Feature not enabled for this organization')
}
```

## 9. Impersonation Authorization

### Admin Impersonation
- Requires: `admin.impersonate` permission
- Time-limited: Max 30 minutes
- Full audit: Every action logged as impersonated
- UI banner: Clear indication of impersonation mode
- Auto-logout: When time limit reached

## 10. Emergency Override

### Emergency Access
- Break-glass procedure for emergencies
- Requires two authorized personnel
- Full audit trail
- Automatic notification to security team
- Time-limited (max 4 hours)

## 11. Authorization Audit Events

```
PERMISSION_GRANTED
PERMISSION_REVOKED
ROLE_ASSIGNED
ROLE_REMOVED
ADMIN_IMPERSONATION_STARTED
ADMIN_IMPERSONATION_ENDED
EMERGENCY_ACCESS_USED
CONSENT_GRANTED
CONSENT_REVOKED
DATA_SHARED
ACCESS_DENIED
```
