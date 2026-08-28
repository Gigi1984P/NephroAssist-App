import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequirementStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

/* ================================================================ */
/*  GET: Next Best Actions — pro aktivem Case                       */
/*       - Nächstes NOT_STARTED Requirement ohne unmet dependencies */
/*       - Überfällige Tasks                                      */
/*       - Ablaufende Requirements (innerhalb 30 Tagen)           */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Tenant isolation
    let orgFilter = {};
    if (user.role !== "ADMIN") {
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      });
      const orgIds = memberships.map((m) => m.organizationId);
      if (orgIds.length === 0) {
        return NextResponse.json({ nextActions: [] });
      }
      orgFilter = { organizationId: { in: orgIds } };
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Aktive Cases mit relevanten Requirements
    const cases = await prisma.patientCase.findMany({
      where: {
        ...orgFilter,
        status: {
          notIn: ["CLOSED", "TRANSPLANTED", "INACTIVE"],
        },
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        requirements: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
            expiresAt: true,
            priority: true,
            patientFriendlyDescription: true,
            template: {
              select: {
                id: true,
                dependencies: {
                  select: { prerequisiteId: true },
                },
              },
            },
          },
          orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
        },
        blockers: {
          where: { status: "ACTIVE" },
          select: { id: true, type: true, description: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    const nextActions = cases.map((c) => {
      const reqs = c.requirements;

      // IDs der erledigten Requirements im Case
      const doneIds = new Set(
        reqs
          .filter((r) => r.status === RequirementStatus.ACCEPTED || r.status === RequirementStatus.WAIVED)
          .map((r) => r.template?.id)
          .filter(Boolean) as string[]
      );

      // Nächstes NOT_STARTED ohne unmet dependencies
      const nextRequirement = reqs.find((r) => {
        if (r.status !== RequirementStatus.NOT_STARTED) return false;
        const prereqIds = r.template?.dependencies.map((d) => d.prerequisiteId) || [];
        // If no dependencies → it's ready
        if (prereqIds.length === 0) return true;
        // Check if all prereqs are done
        return prereqIds.every((pid) => doneIds.has(pid));
      });

      // Überfällige Requirements
      const overdue = reqs.filter(
        (r) =>
          r.dueDate && new Date(r.dueDate) < now &&
          r.status !== RequirementStatus.ACCEPTED &&
          r.status !== RequirementStatus.WAIVED &&
          r.status !== RequirementStatus.NOT_APPLICABLE
      );

      // Ablaufende Requirements (innerhalb 30 Tagen)
      const expiring = reqs.filter(
        (r) =>
          r.expiresAt &&
          new Date(r.expiresAt) <= thirtyDaysFromNow &&
          new Date(r.expiresAt) >= now &&
          r.status !== RequirementStatus.ACCEPTED &&
          r.status !== RequirementStatus.WAIVED &&
          r.status !== RequirementStatus.NOT_APPLICABLE
      );

      // Zähle "Dinge die Aufmerksamkeit brauchen"
      const attentionCount =
        c.blockers.length +
        overdue.length +
        reqs.filter(
          (r) => r.status === RequirementStatus.ACTION_REQUIRED || r.status === RequirementStatus.IN_PROGRESS
        ).length;

      const totalCount = reqs.length;
      const completedCount = reqs.filter(
        (r) => r.status === RequirementStatus.ACCEPTED || r.status === RequirementStatus.WAIVED || r.status === RequirementStatus.NOT_APPLICABLE
      ).length;

      return {
        caseId: c.id,
        caseStatus: c.status,
        patient: c.patient,
        progress: {
          total: totalCount,
          completed: completedCount,
          attentionNeeded: attentionCount,
        },
        nextRequirement: nextRequirement
          ? {
              id: nextRequirement.id,
              title: nextRequirement.title,
              patientFriendlyDescription: nextRequirement.patientFriendlyDescription,
              dueDate: nextRequirement.dueDate?.toISOString() || null,
            }
          : null,
        overdue: overdue.map((r) => ({
          id: r.id,
          title: r.title,
          dueDate: r.dueDate?.toISOString() || null,
          status: r.status,
        })),
        expiring: expiring.map((r) => ({
          id: r.id,
          title: r.title,
          expiresAt: r.expiresAt?.toISOString() || null,
          status: r.status,
        })),
        blockers: c.blockers.map((b) => ({
          id: b.id,
          type: b.type,
          description: b.description,
        })),
      };
    });

    // Sort: Cases with blockers/overdue first, then by attention count descending
    nextActions.sort((a, b) => {
      const aHasCritical = a.blockers.length > 0 || a.overdue.length > 0;
      const bHasCritical = b.blockers.length > 0 || b.overdue.length > 0;
      if (aHasCritical && !bHasCritical) return -1;
      if (!aHasCritical && bHasCritical) return 1;
      return b.progress.attentionNeeded - a.progress.attentionNeeded;
    });

    return NextResponse.json({ nextActions });
  } catch (error) {
    console.error("Next actions fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
