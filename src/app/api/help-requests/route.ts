import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

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
    const { type, description, requirementId, caseId } = body;

    if (!type || !description) {
      return NextResponse.json({ error: "Typ und Beschreibung erforderlich" }, { status: 400 });
    }

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
        caseId: caseId || null,
        requirementId: requirementId || null,
        organizationId: patient.organizationId,
        type,
        description,
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
          message: `Patient hat Hilfe angefordert: ${type}`,
          entityType: "HELP_REQUEST",
          entityId: helpRequest.id,
        },
      });
    } catch { /* ignore */ }

    return NextResponse.json({ helpRequest });
  } catch (error) {
    console.error("Help request create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
