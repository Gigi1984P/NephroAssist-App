import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

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

    // Alle Patienten fuer Klinik-Rollen (keine Tenant-Isolation)
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        updatedAt: true,
        generalPractitionerName: true,
        generalPractitionerEmail: true,
        generalPractitionerPhone: true,
        cases: {
          select: {
            id: true,
            status: true,
            coordinatorId: true,
          },
          take: 1,
        },
      },
      orderBy: { lastName: "asc" },
      take: 50,
    });

    const coordinators = await prisma.user.findMany({
      where: { role: "COORDINATOR" },
      select: { id: true, name: true, email: true },
    });

    const enriched = patients.map((patient) => {
      const firstCase = patient.cases?.[0];
      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        updatedAt: patient.updatedAt,
        gpName: patient.generalPractitionerName,
        gpEmail: patient.generalPractitionerEmail,
        gpPhone: patient.generalPractitionerPhone,
        caseStatus: firstCase?.status || null,
        coordinatorId: firstCase?.coordinatorId || null,
      };
    });

    return NextResponse.json({ patients: enriched, coordinators });
  } catch (error) {
    console.error("Patients overview error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
