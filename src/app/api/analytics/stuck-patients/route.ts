import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

/* ================================================================ */
/*  GET: Stuck Patients — keine Aktivität in 14 Tagen ODER          */
/*       überfällige Requirements >7 Tage                           */
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

    // Tenant isolation: restrict to user's organizations unless ADMIN
    let orgFilter = {};
    if (user.role !== "ADMIN") {
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      });
      const orgIds = memberships.map((m) => m.organizationId);
      if (orgIds.length === 0) {
        return NextResponse.json({ stuckPatients: [] });
      }
      orgFilter = { organizationId: { in: orgIds } };
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Patienten mit Cases: keine Aktivität in 14 Tagen (updatedAt)
    // ODER Requirements mit dueDate >7 Tage überfällig
    const cases = await prisma.patientCase.findMany({
      where: {
        ...orgFilter,
        status: {
          notIn: ["CLOSED", "TRANSPLANTED", "INACTIVE"],
        },
        OR: [
          { updatedAt: { lt: fourteenDaysAgo } },
          {
            requirements: {
              some: {
                dueDate: { lt: sevenDaysAgo },
                status: { notIn: ["ACCEPTED", "WAIVED", "NOT_APPLICABLE"] },
              },
            },
          },
        ],
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        requirements: {
          where: {
            status: { notIn: ["ACCEPTED", "WAIVED", "NOT_APPLICABLE"] },
            dueDate: { lt: now },
          },
          select: { id: true, title: true, dueDate: true, status: true },
          orderBy: { dueDate: "asc" },
        },
        blockers: {
          where: { status: "ACTIVE" },
          select: { id: true, type: true, description: true },
        },
        _count: {
          select: { requirements: true },
        },
      },
      orderBy: { updatedAt: "asc" },
      take: 50,
    });

    const stuckPatients = cases.map((c) => ({
      caseId: c.id,
      patient: c.patient,
      caseStatus: c.status,
      daysSinceActivity: c.updatedAt
        ? Math.floor((now.getTime() - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
        : null,
      overdueRequirements: c.requirements.map((r) => ({
        id: r.id,
        title: r.title,
        dueDate: r.dueDate?.toISOString() || null,
        status: r.status,
      })),
      activeBlockers: c.blockers.map((b) => ({
        id: b.id,
        type: b.type,
        description: b.description,
      })),
    }));

    return NextResponse.json({ stuckPatients });
  } catch (error) {
    console.error("Stuck patients fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
