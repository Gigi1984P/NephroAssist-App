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
/*  2. Organisation des Users                                       */
/* ================================================================ */
export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId },
    include: { organization: true },
  });
  return memberships.map((m) => m.organization);
}

export async function isIndependentUser(userId: string): Promise<boolean> {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId },
  });
  return memberships.length === 0;
}

/* ================================================================ */
/*  3. Prüfung: Darf User Untersuchungen ERSTELLEN?                 */
/* ================================================================ */
export async function canCreateInvestigation(user: SessionUser): Promise<{
  allowed: boolean;
  reason?: string;
  organizationId?: string | null;
}> {
  const { id: userId, role } = user;

  switch (role) {
    case "ADMIN":
      return { allowed: true };

    case "COORDINATOR":
    case "PHYSICIAN": {
      // Klinik-Mitarbeiter dürfen immer erstellen
      const orgs = await getUserOrganizations(userId);
      const clinic = orgs.find(
        (o) => o.type === "TRANSPLANT_CENTER" || o.type === "NEPHROLOGY"
      );
      if (clinic) {
        return { allowed: true, organizationId: clinic.id };
      }
      return {
        allowed: false,
        reason: "Nur Klinik-Mitarbeiter dürfen Untersuchungen erstellen",
      };
    }

    case "NURSE": {
      // Pfleger nur wenn UNABHÄNGIG (keine Org-Membership)
      const independent = await isIndependentUser(userId);
      if (independent) {
        return { allowed: true, organizationId: null };
      }
      return {
        allowed: false,
        reason: "Pfleger in einer Klinik/Dialyse dürfen keine Untersuchungen erstellen",
      };
    }

    case "DIALYSIS_STAFF": {
      const orgs = await getUserOrganizations(userId);
      const dialysis = orgs.find((o) => o.type === "DIALYSIS_CENTER");
      if (dialysis) {
        // Prüfe ob Dialyse einer Klinik unterstellt ist
        if (dialysis.parentOrganizationId) {
          return {
            allowed: false,
            reason: "Dialyse unter Klinik: Untersuchungen müssen von der Klinik erstellt werden",
          };
        }
        return { allowed: true, organizationId: dialysis.id };
      }
      // Dialyse-User ohne Org → unabhängig
      const independent = await isIndependentUser(userId);
      if (independent) {
        return { allowed: true, organizationId: null };
      }
      return {
        allowed: false,
        reason: "Dialyse nicht gefunden",
      };
    }

    case "PATIENT":
      return {
        allowed: false,
        reason: "Patienten dürfen keine Untersuchungen erstellen",
      };

    case "CAREGIVER":
      return {
        allowed: false,
        reason: "Pfleger dürfen keine Untersuchungen erstellen",
      };

    default:
      return { allowed: false, reason: "Rolle nicht berechtigt" };
  }
}

/* ================================================================ */
/*  4. Prüfung: Darf User Untersuchungen SEHEN?                     */
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
    return Array.from(new Set(ids));
  }

  // PHYSICIAN: Alle Patienten in seiner Klinik (über Org-Membership)
  if (role === "PHYSICIAN") {
    const orgs = await getUserOrganizations(userId);
    const clinicIds = orgs
      .filter((o) => o.type === "TRANSPLANT_CENTER" || o.type === "NEPHROLOGY")
      .map((o) => o.id);
    if (clinicIds.length === 0) return [];
    const cases = await prisma.patientCase.findMany({
      where: { organizationId: { in: clinicIds } },
      select: { patientId: true },
    });
    const ids = cases.map((c) => c.patientId);
    return Array.from(new Set(ids));
  }

  // NURSE: Alle Patienten in ihrer Organisation
  if (role === "NURSE") {
    const orgs = await getUserOrganizations(userId);
    const orgIds = orgs.map((o) => o.id);
    if (orgIds.length === 0) {
      // Unabhängig: nur Patienten mit CaregiverAccess
      const accesses = await prisma.caregiverAccess.findMany({
        where: { caregiverId: userId, status: "ACTIVE" },
        select: { patientId: true },
      });
      return accesses.map((a) => a.patientId);
    }
    const cases = await prisma.patientCase.findMany({
      where: { organizationId: { in: orgIds } },
      select: { patientId: true },
    });
    const ids = cases.map((c) => c.patientId);
    return Array.from(new Set(ids));
  }

  // DIALYSIS_STAFF: Alle Patienten in ihrer Dialyse
  if (role === "DIALYSIS_STAFF") {
    const orgs = await getUserOrganizations(userId);
    const dialysisIds = orgs
      .filter((o) => o.type === "DIALYSIS_CENTER")
      .map((o) => o.id);
    if (dialysisIds.length === 0) return [];
    const cases = await prisma.patientCase.findMany({
      where: { organizationId: { in: dialysisIds } },
      select: { patientId: true },
    });
    const ids = cases.map((c) => c.patientId);
    return Array.from(new Set(ids));
  }

  return [];
}

/* ================================================================ */
/*  5. Patient Scope WHERE clause                                   */
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
/*  6. Check if user can access specific resource                   */
/* ================================================================ */
export async function canAccessPatient(
  user: SessionUser,
  patientId: string
): Promise<boolean> {
  if (user.role === "ADMIN") return true;
  const allowed = await getAllowedPatientIds(user);
  if (allowed === null) return true;
  return allowed.includes(patientId);
}

export async function canAccessTask(user: SessionUser, taskId: string): Promise<boolean> {
  if (user.role === "ADMIN") return true;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { patientId: true },
  });
  if (!task) return false;
  if (!task.patientId) return false;

  return canAccessPatient(user, task.patientId);
}
