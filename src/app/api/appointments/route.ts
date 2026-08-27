import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const {
      patientId,
      type,
      provider,
      location,
      startTime,
      notes,
      relatedRequirementId,
    } = body;

    if (!patientId || !startTime) {
      return NextResponse.json({ error: "Patient und Startzeit sind Pflicht" }, { status: 400 });
    }

    // Prüfen: User ist entweder Patient selbst oder Klinik
    const isPatientOrCaregiver = user.role === "PATIENT" || user.role === "CAREGIVER";
    const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(user.role);

    if (!isPatientOrCaregiver && !isClinic) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Case finden
    const patientCase = await prisma.patientCase.findFirst({
      where: {
        patientId,
        status: { notIn: ["CLOSED", "INACTIVE"] },
      },
      select: { id: true, organizationId: true },
    });

    if (!patientCase) {
      return NextResponse.json({ error: "Kein aktiver Fall gefunden" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        caseId: patientCase.id,
        organizationId: patientCase.organizationId,
        type: type || "Untersuchung",
        provider: provider || null,
        location: location || null,
        startTime: new Date(startTime),
        status: "PLANNED",
        notes: notes || null,
        relatedRequirementId: relatedRequirementId || null,
      },
    });

    // Audit Log
    await logAuditEvent({
      actorId: user.id,
      action: "APPOINTMENT_CREATED",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      organizationId: patientCase.organizationId,
      metadata: { patientId, startTime, type },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Appointment create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
