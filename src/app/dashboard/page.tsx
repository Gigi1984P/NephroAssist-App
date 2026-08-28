import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllowedPatientIds } from "@/lib/permissions";
import { PageHeader } from "@/components/page-header";
import PatientDashboardClient from "./_components/patient-dashboard-client";
import CoordinatorQueueClient from "./_components/coordinator-queue-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user;
  const userRole = user.role as "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";
  const isPatientOrCaregiver = userRole === "PATIENT" || userRole === "CAREGIVER";

  if (isPatientOrCaregiver) {
    // Patient dashboard data
    const allowedPatientIds = await getAllowedPatientIds({ ...user, role: userRole });
    const patientId = Array.isArray(allowedPatientIds) && allowedPatientIds.length > 0
      ? allowedPatientIds[0]
      : null;

    let requirements: any[] = [];
    let appointments: any[] = [];

    if (patientId) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      requirements = await prisma.patientRequirement.findMany({
        where: { patientCase: { patientId } },
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          expiresAt: true,
          completedAt: true,
          patientFriendlyDescription: true,
          category: true,
        },
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
      });

      appointments = await prisma.appointment.findMany({
        where: { patientId, startTime: { gte: now }, deletedAt: null },
        orderBy: { startTime: "asc" },
        take: 3,
        select: {
          id: true,
          type: true,
          provider: true,
          location: true,
          startTime: true,
          endTime: true,
          status: true,
          notes: true,
        },
      });

      return (
        <PatientDashboardClient
          userName={user.name || ""}
          requirements={requirements}
          appointments={appointments}
          nowIso={now.toISOString()}
          sevenDaysAgoIso={sevenDaysAgo.toISOString()}
          thirtyDaysFromNowIso={thirtyDaysFromNow.toISOString()}
        />
      );
    }

    return (
      <PatientDashboardClient
        userName={user.name || ""}
        requirements={[]}
        appointments={[]}
        nowIso={new Date().toISOString()}
        sevenDaysAgoIso={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}
        thirtyDaysFromNowIso={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
      />
    );
  }

  // Clinic dashboard — pass through to client component
  return (
    <div>
      <PageHeader title="Dashboard" description="Klinik-Dashboard" />
      <CoordinatorQueueClient />
    </div>
  );
}
