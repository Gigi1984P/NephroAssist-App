import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "COORDINATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }

    const [
      totalPatients,
      patientsByStatus,
      totalCases,
      casesByStatus,
      pendingTasks,
      upcomingAppointments,
      activeBlockers,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.groupBy({ by: ["consentStatus"], _count: { id: true } }),
      prisma.patientCase.count(),
      prisma.patientCase.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.task.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { startTime: { gte: new Date() }, status: "PLANNED" } }),
      prisma.blocker.count({ where: { status: "ACTIVE" } }),
      prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 10,
        select: { action: true, entityType: true, timestamp: true },
      }),
    ]);

    const monthlyCases = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
      FROM patient_cases
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 6
    `;

    return NextResponse.json({
      totalPatients,
      patientsByStatus,
      totalCases,
      casesByStatus,
      pendingTasks,
      upcomingAppointments,
      activeBlockers,
      recentAuditLogs,
      monthlyCases,
    });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
