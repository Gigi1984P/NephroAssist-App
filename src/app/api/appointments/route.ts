import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createAppointmentSchema = z.object({
  patientId: z.string().uuid("Patient-ID muss eine gültige UUID sein"),
  type: z.string().min(1, "Typ erforderlich").max(100, "Typ zu lang"),
  provider: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  startTime: z.string().datetime("Ungültiges Datumsformat"),
  notes: z.string().max(2000).optional().nullable(),
  relatedRequirementId: z.string().uuid().optional().nullable(),
});

/* ================================================================ */
/*  GET: List appointments                                           */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const isPatientOrCaregiver = user.role === "PATIENT" || user.role === "CAREGIVER";
    const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"].includes(user.role);

    if (!isPatientOrCaregiver && !isClinic) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const where: any = {};

    if (isPatientOrCaregiver) {
      // Find patient's own appointments
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (patient) {
        where.patientId = patient.id;
      }
    } else {
      // Clinic: filter by organization
      const membership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id },
        select: { organizationId: true },
      });
      if (membership) {
        where.organizationId = membership.organizationId;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      take: 500,
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();

    const validated = createAppointmentSchema.parse(body);

    // Prüfen: User ist entweder Patient selbst oder Klinik
    const isPatientOrCaregiver = user.role === "PATIENT" || user.role === "CAREGIVER";
    const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(user.role);

    if (!isPatientOrCaregiver && !isClinic) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Case finden
    const patientCase = await prisma.patientCase.findFirst({
      where: {
        patientId: validated.patientId,
        status: { notIn: ["CLOSED", "INACTIVE"] },
      },
      select: { id: true, organizationId: true },
    });

    if (!patientCase) {
      return NextResponse.json({ error: "Kein aktiver Fall gefunden" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: validated.patientId,
        caseId: patientCase.id,
        organizationId: patientCase.organizationId,
        type: validated.type || "Untersuchung",
        provider: validated.provider || null,
        location: validated.location || null,
        startTime: new Date(validated.startTime),
        status: "PLANNED",
        notes: validated.notes || null,
        relatedRequirementId: validated.relatedRequirementId || null,
      },
    });

    // Audit Log
    await logAuditEvent({
      actorId: user.id,
      action: "APPOINTMENT_CREATED",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      organizationId: patientCase.organizationId,
      metadata: { patientId: validated.patientId, startTime: validated.startTime, type: validated.type },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Appointment create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
