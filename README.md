# NephroAssist

Multi-tenant SaaS platform for the organizational coordination of the organ transplant process.

## Overview

NephroAssist is a **Workflow- and Readiness-Engine** that translates complex transplant center requirements into concrete, traceable tasks for patients, dialysis centers, specialists, and transplant coordinators.

## Architecture

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server, TypeScript, Prisma
- **Database**: PostgreSQL with tenant isolation
- **Queue**: Redis for background jobs
- **Storage**: S3-compatible object storage
- **Auth**: OIDC (Keycloak or managed provider)

## Documentation

- [System Architecture](docs/architecture.md)
- [Domain Model](docs/domain-model.md)
- [Security Architecture](docs/security.md)
- [Permissions / RBAC](docs/permissions.md)
- [Workflows](docs/workflows.md)
- [AI Architecture](docs/ai-architecture.md)
- [State Machines, Events & Queue](docs/state-machines-events-queue.md)
- [Tenant Isolation](docs/tenant-isolation.md)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)

### Development Setup

```bash
# 1. Clone and install
git clone <repo>
cd nephroassist
npm install

# 2. Start infrastructure (PostgreSQL, Redis, MinIO)
docker-compose up -d postgres redis minio

# 3. Set up environment
cp .env.example .env
# Edit .env with your settings

# 4. Run database migrations
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate

# 6. Seed demo data
npx prisma db seed

# 7. Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://nephroassist:nephroassist@localhost:5432/nephroassist

# Redis
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# S3 / Object Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=nephroassist-documents
S3_REGION=us-east-1

# OIDC / Keycloak
KEYCLOAK_ISSUER=http://localhost:8080/realms/nephroassist
KEYCLOAK_CLIENT_ID=nephroassist
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm run test

# Open Prisma Studio
npx prisma studio
```

## Project Structure

```
/src
  /app              # Next.js App Router
  /domain           # Pure domain logic
  /services         # Application services
  /repositories     # Data access layer
  /workflows        # Workflow definitions
  /policies         # Authorization policies
  /permissions      # RBAC definitions
  /jobs             # Background job handlers
  /ai               # AI abstraction layer
  /notifications    # Email/push/SMS
  /audit            # Audit logging
  /integrations     # External integrations
  /lib              # Shared utilities
  /types            # Global types
  /components       # UI components
/prisma
  schema.prisma     # Database schema
  migrations/       # Database migrations
  seed.ts           # Seed data
```

## Security

See [Security Architecture](docs/security.md) for detailed security controls.

Key principles:
- Defense in depth
- Tenant isolation on every query
- PHI/PII scrubbing in all observability
- All AI calls via backend LLMGateway
- Immutable audit trail

## License

Proprietary - All rights reserved.
