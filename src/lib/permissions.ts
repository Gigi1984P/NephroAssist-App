import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export type UserRole = "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

/* ================================================================ */
/*  1. Auth Check                                                   */
/* ================================================================ */
export async function requireAuth(): Promise<
  { user: SessionUser } | NextResponse
> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  return { user: session.user as SessionUser };
}

/* ================================================================ */
/*  2. Role Checks                                                  */
/* ================================================================ */
export function isAdmin(role: UserRole) {
  return role === "ADMIN";
}

export function isStaff(role: UserRole) {
  return ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"].includes(role);
}

export function isPatientOrCaregiver(role: UserRole) {
  return role === "PATIENT" || role === "CAREGIVER";
}

/* ================================================================ */
/*  3. Get Patient IDs for User (Scope)                             */
/* ================================================================ */
export async function getAllowedPatientIds(user: SessionUser): Promise<string[] | null> {
  const { id: userId, role } = user;

  // ADMIN: Alle Patienten → null = kein Filter
  if (role === "ADMIN") return null;

  // PATIENT: Nur eigener Patient
  if (role === "PATIENT") {
    const patient = await prisma.patient.findFirst({
      where: { userId },
      select: { id: true },
    });
    return patient ? [patient.id] : [];
  }

  // CAREGIVER: Alle Patienten mit CaregiverAccess
  if (role === "CAREGIVER") {
    const accesses = await prisma.caregiverAccess.findMany({
      where: { caregiverId: userId, status: "ACTIVE" },
      select: { patientId: true },
    });
    return accesses.map((a) => a.patientId);
  }

  // COORDINATOR: Alle Patienten in Cases wo coordinatorId = userId
  if (role === "COORDINATOR") {
    const cases = await prisma.patientCase.findMany({
      where: { coordinatorId: userId },
      select: { patientId: true },
    });
    const ids = cases.map((c) => c.patientId);
    return [...new Set(ids)];
  }

  // NURSE: Alle Patienten in ihrer Organisation
  if (role === "NURSE") {
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId },
      select: { organizationId: true },
    });
    const orgIds = memberships.map((m) => m.organizationId);
    if (orgIds.length === 0) return [];
    const cases = await prisma.patientCase.findMany({
      where: { organizationId: { in: orgIds } },
      select: { patientId: true },
    });
    const ids = cases.map((c) => c.patientId);
    return [...new Set(ids)];
  }

  // PHYSICIAN: Alle Patienten bei denen er Provider ist (Appointments)
  if (role === "PHYSICIAN") {
    const appts = await prisma.appointment.findMany({
      where: { provider: userId },
      select: { patientId: true },
    });
    const ids = appts.map((a) => a.patientId);
    return [...new Set(ids)];
  }

  // DIALYSIS_STAFF: Alle Patienten in ihrer Organisation
  if (role === "DIALYSIS_STAFF") {
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId },
      select: { organizationId: true },
    });
    const orgIds = memberships.map((m) => m.organizationId);
    if (orgIds.length === 0) return [];
    const cases = await prisma.patientCase.findMany({
      where: { organizationId: { in: orgIds } },
      select: { patientId: true },
    });
    const ids = cases.map((c) => c.patientId);
    return [...new Set(ids)];
  }

  return [];
}

/* ================================================================ */
/*  4. Patient Scope WHERE clause                                   */
/* ================================================================ */
export function patientScopeWhere(
  allowedPatientIds: string[] | null,
  patientField = "patientId"
): Record<string, any> | undefined {
  if (allowedPatientIds === null) return undefined; // Admin → kein Filter
  if (allowedPatientIds.length === 0) return { [patientField]: "" }; // Keine Rechte → leer
  return { [patientField]: { in: allowedPatientIds } };
}

/* ================================================================ */
/*  5. Check if user can access specific resource                   */
/* ================================================================ */
export async function canAccessPatient(
  user: SessionUser,
  patientId: string
): Promise<boolean> {
  if (isAdmin(user.role)) return true;
  const allowed = await getAllowedPatientIds(user);
  if (allowed === null) return true;
  return allowed.includes(patientId);
}

export async function canAccessTask(user: SessionUser, taskId: string): Promise<boolean> {
  if (isAdmin(user.role)) return true;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { patientId: true },
  });
  if (!task) return false;
  if (!task.patientId) return false;

  return canAccessPatient(user, task.patientId);
}
