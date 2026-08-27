import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllowedPatientIds } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const userRole = user.role as "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";
    const allowedPatientIds = await getAllowedPatientIds({ ...user, role: userRole });

    const isPatientOrCaregiver = userRole === "PATIENT" || userRole === "CAREGIVER";

    if (!isPatientOrCaregiver) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Patient-ID aus allowedPatientIds holen (für Patient/Caregiver ist es ihre eigene ID)
    const patientId = Array.isArray(allowedPatientIds) && allowedPatientIds.length > 0
      ? allowedPatientIds[0]
      : null;

    if (!patientId) {
      return NextResponse.json({ appointments: [] });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: "asc" },
      take: 10,
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

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Appointments fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
