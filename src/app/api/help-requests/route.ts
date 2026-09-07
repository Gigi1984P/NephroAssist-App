import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

const helpRequestSchema = z.object({
  type: z.enum([
    "I_DONT_UNDERSTAND",
    "NO_APPOINTMENT",
    "MISSING_PRESCRIPTION",
    "DOCTOR_WONT_ISSUE",
    "TRANSPORT",
    "LANGUAGE",
    "ORGANIZATIONAL",
    "OTHER",
  ], { message: "Ungültiger Hilfetyp" }),
  description: z.string().min(1, "Beschreibung ist Pflicht").max(2000, "Beschreibung zu lang"),
  requirementId: z.string().uuid().optional().nullable(),
  caseId: z.string().uuid("caseId ist Pflicht"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;

    if (CLINIC_ROLES.includes(user.role)) {
      // Tenant isolation
      let orgFilter = {};
      if (user.role !== "ADMIN") {
        const memberships = await prisma.organizationMembership.findMany({
          where: { userId: user.id },
          select: { organizationId: true },
        });
        const orgIds = memberships.map((m) => m.organizationId);
        if (orgIds.length === 0) {
          return NextResponse.json({ helpRequests: [] });
        }
        orgFilter = { organizationId: { in: orgIds } };
      }

      // Klinik: Alle offenen Hilfeanfragen
      const helpRequests = await prisma.helpRequest.findMany({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] }, ...orgFilter },
        orderBy: { createdAt: "desc" },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          patientCase: { select: { status: true } },
        },
      });
      return NextResponse.json({ helpRequests });
    }

    // Patient: eigene Hilfeanfragen
    const patient = await prisma.patient.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!patient) return NextResponse.json({ helpRequests: [] });

    const helpRequests = await prisma.helpRequest.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ helpRequests });
  } catch (error) {
    console.error("Help requests fetch error:", error);
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
    const validated = helpRequestSchema.parse(body);

    let patientId: string | null = null;

    if (user.role === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!patient) {
        return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
      }
      patientId = patient.id;
    } else if (user.role === "CAREGIVER") {
      // Caregiver: patientId aus body oder aus ersten Zugriff
      if (body.patientId) {
        patientId = body.patientId;
      } else {
        const access = await prisma.caregiverAccess.findFirst({
          where: { caregiverId: user.id, status: "ACTIVE" },
          select: { patientId: true },
        });
        if (access) patientId = access.patientId;
      }
    }

    if (!patientId) {
      return NextResponse.json({ error: "Kein Patient zugeordnet" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { organizationId: true },
    });
    if (!patient?.organizationId) {
      return NextResponse.json({ error: "Organisation nicht gefunden" }, { status: 404 });
    }

    const helpRequest = await prisma.helpRequest.create({
      data: {
        patientId,
        caseId: validated.caseId,
        requirementId: validated.requirementId,
        organizationId: patient.organizationId,
        type: validated.type as any,
        description: validated.description,
        status: "OPEN",
      },
    });

    // Notification für Klinik
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          organizationId: patient.organizationId,
          type: "HELP_REQUEST",
          title: "Neue Hilfeanfrage",
          message: `Patient hat Hilfe angefordert: ${validated.type}`,
          entityType: "HELP_REQUEST",
          entityId: helpRequest.id,
        },
      });
    } catch { /* ignore */ }

    return NextResponse.json({ helpRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Help request create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
