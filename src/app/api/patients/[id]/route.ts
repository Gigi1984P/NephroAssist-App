import { NextResponse } from "next/server";
import { auth, authFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Einzelnen Patient laden mit allen Details                   */
/* ================================================================ */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Versuche auth() (cookie-based) dann authFromRequest (request-header-based)
    let session = await auth();
    if (!session) {
      session = await authFromRequest(request);
    }

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    if (!CLINIC_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Ungültige Patienten-ID" }, { status: 400 });
    }

    // 1. PATIENT + CASES (Kern-Daten — darf nicht fehlschlagen)
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        Organization: { select: { name: true, id: true } },
        cases: {
          include: {
            program: { select: { name: true, type: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // 2. Zusatz-Daten (können fehlschlagen, werden mit Defaults abgefangen)
    let documents: any[] = [];
    let appointments: any[] = [];
    let blockers: any[] = [];
    let timelineEvents: any[] = [];
    let requirements: any[] = [];
    let helpRequests: any[] = [];
    let tasks: any[] = [];

    try {
      documents = await prisma.document.findMany({
        where: { patientId: id },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: { id: true, filename: true, documentType: true, processingStatus: true, createdAt: true },
      });
    } catch (e) { console.error("documents error:", e); }

    try {
      appointments = await prisma.appointment.findMany({
        where: { patientId: id },
        orderBy: { startTime: "asc" },
        take: 10,
        select: { id: true, type: true, startTime: true, location: true, status: true },
      });
    } catch (e) { console.error("appointments error:", e); }

    try {
      blockers = await prisma.blocker.findMany({
        where: { patientCase: { patientId: id } },
        include: {
          requirement: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    } catch (e) { console.error("blockers error:", e); }

    try {
      timelineEvents = await prisma.timelineEvent.findMany({
        where: { patientCase: { patientId: id } },
        orderBy: { createdAt: "desc" },
        take: 8,
      });
    } catch (e) { console.error("timelineEvents error:", e); }

    try {
      requirements = await prisma.patientRequirement.findMany({
        where: { patientCase: { patientId: id } },
        include: {
          tasks: { select: { id: true, status: true, title: true, stepNumber: true, ownerType: true } },
          template: { select: { name: true, category: true, patientFriendlyDescription: true } },
        },
        orderBy: { priority: "desc" },
      });
    } catch (e) { console.error("requirements error:", e); }

    try {
      helpRequests = await prisma.helpRequest.findMany({
        where: { patientId: id },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    } catch (e) { console.error("helpRequests error:", e); }

    try {
      tasks = await prisma.task.findMany({
        where: { patientId: id },
        orderBy: { dueDate: "asc" },
        take: 10,
        select: { id: true, title: true, status: true, dueDate: true, description: true },
      });
    } catch (e) { console.error("tasks error:", e); }

    // Coordinator Name laden
    let coordinatorName = "—";
    const latestCase = patient.cases[0];
    if (latestCase?.coordinatorId) {
      try {
        const coord = await prisma.user.findUnique({
          where: { id: latestCase.coordinatorId },
          select: { name: true },
        });
        if (coord?.name) coordinatorName = coord.name;
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      patient,
      documents,
      appointments,
      blockers,
      timelineEvents,
      requirements,
      helpRequests,
      tasks,
      coordinatorName,
    });
  } catch (error) {
    console.error("Patient GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* ================================================================ */
/*  PUT: Patient bearbeiten                                          */
/* ================================================================ */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let session = await auth();
    if (!session) {
      session = await authFromRequest(request);
    }

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    if (!CLINIC_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      firstName, lastName, dateOfBirth, email, phone,
      generalPractitionerName, generalPractitionerEmail,
      generalPractitionerPhone, generalPractitionerCity,
    } = body;

    const existing = await prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        firstName: firstName?.trim() || undefined,
        lastName: lastName?.trim() || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        generalPractitionerName: generalPractitionerName?.trim() || null,
        generalPractitionerEmail: generalPractitionerEmail?.trim() || null,
        generalPractitionerPhone: generalPractitionerPhone?.trim() || null,
        generalPractitionerCity: generalPractitionerCity?.trim() || null,
      },
    });

    return NextResponse.json({ patient: updated });
  } catch (error) {
    console.error("Patient PUT error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}

/* ================================================================ */
/*  DELETE: Patient löschen                                          */
/* ================================================================ */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let session = await auth();
    if (!session) {
      session = await authFromRequest(request);
    }

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    if (!CLINIC_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.patient.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Child-Records vorher löschen (Reihenfolge beachten wegen FK-Constraints)
    await prisma.task.deleteMany({ where: { patientId: id } });
    await prisma.timelineEvent.deleteMany({ where: { patientCase: { patientId: id } } });
    await prisma.blocker.deleteMany({ where: { patientCase: { patientId: id } } });
    await prisma.document.deleteMany({ where: { patientId: id } });
    await prisma.patientRequirement.deleteMany({ where: { patientCase: { patientId: id } } });
    await prisma.appointment.deleteMany({ where: { patientId: id } });
    await prisma.helpRequest.deleteMany({ where: { patientId: id } });
    await prisma.patientCase.deleteMany({ where: { patientId: id } });

    await prisma.patient.delete({ where: { id } });

    // Zugehörigen User-Account löschen
    if (existing.userId) {
      await prisma.user.delete({ where: { id: existing.userId } }).catch((e) => {
        console.warn("User löschen fehlgeschlagen (möglicherweise bereits gelöscht):", e);
      });
    }

    return NextResponse.json({ success: true, message: "Patient gelöscht" });
  } catch (error) {
    console.error("Patient DELETE error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
