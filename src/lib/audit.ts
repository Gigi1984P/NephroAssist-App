import { prisma } from "./prisma";

export interface AuditLogPayload {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export async function logAuditEvent(payload: AuditLogPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: payload.actorId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        organizationId: payload.organizationId,
        metadata: payload.metadata || {},
        ipAddress: payload.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Silent fail — don't block user action
  }
}
