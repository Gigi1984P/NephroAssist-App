import { prisma } from "@/lib/prisma";

/**
 * Return the organizationIds the user is a member of.
 */
export async function getUserOrganizationIds(userId: string): Promise<string[]> {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId },
    select: { organizationId: true },
  });
  return memberships.map((m) => m.organizationId);
}

/**
 * Return the organizationId of a patient's most recent case.
 * Patients without a case return null.
 */
export async function getPatientOrganizationId(patientId: string): Promise<string | null> {
  const patientCase = await prisma.patientCase.findFirst({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    select: { organizationId: true },
  });
  return patientCase?.organizationId ?? null;
}

/**
 * Build a Prisma where-clause that restricts queries to the user's organizations.
 * ADMIN gets no restriction (undefined).
 * Users with no memberships get a clause that yields zero results.
 */
export async function organizationScope(
  userId: string,
  userRole: string
): Promise<{ organizationId: { in: string[] } } | undefined> {
  if (userRole === "ADMIN") return undefined;
  const orgIds = await getUserOrganizationIds(userId);
  if (orgIds.length === 0) return { organizationId: { in: [""] } };
  return { organizationId: { in: orgIds } };
}

/**
 * Check whether a user may access data for a specific patient.
 * ADMIN always passes. COORDINATOR passes if they coordinate a case for the patient.
 * Other clinic roles pass if they share an organization with the patient's latest case.
 */
export async function canAccessPatient(
  userId: string,
  userRole: string,
  patientId: string
): Promise<boolean> {
  if (userRole === "ADMIN") return true;

  const patientOrgId = await getPatientOrganizationId(patientId);
  if (!patientOrgId) return false;

  const userOrgIds = await getUserOrganizationIds(userId);
  if (userOrgIds.length === 0) {
    if (userRole === "COORDINATOR") {
      const caseCount = await prisma.patientCase.count({
        where: { patientId, coordinatorId: userId },
      });
      return caseCount > 0;
    }
    return false;
  }

  return userOrgIds.includes(patientOrgId);
}
