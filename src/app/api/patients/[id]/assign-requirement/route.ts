import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  POST: Einzelne oder mehrere Untersuchungen zuweisen              */
/* ================================================================ */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];
    if (!clinicRoles.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id: patientId } = await params;
    const body = await request.json();
    const { templateId, templateIds } = body;

    const idsToAssign: string[] = templateIds || (templateId ? [templateId] : []);

    if (!patientId || idsToAssign.length === 0) {
      return NextResponse.json({ error: "patientId und templateId(s) sind Pflicht" }, { status: 400 });
    }

    // Patient + aktiver Case laden
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        cases: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    let patientCase = patient.cases[0];

    // Falls kein Case existiert, einen erstellen
    if (!patientCase) {
      const org = await prisma.organization.findFirst({ select: { id: true } });
      const prog = await prisma.transplantProgram.findFirst({ select: { id: true } });
      if (!org || !prog) {
        return NextResponse.json({ error: "Keine Organisation/Programm gefunden" }, { status: 500 });
      }
      patientCase = await prisma.patientCase.create({
        data: {
          patientId,
          organizationId: org.id,
          programId: prog.id,
          status: "REFERRAL",
          coordinatorId: user.id,
        },
      });
    }

    const results: string[] = [];

    for (const tid of idsToAssign) {
      const template = await prisma.requirementTemplate.findUnique({
        where: { id: tid },
      });
      if (!template) continue;

      // Prüfen ob bereits zugewiesen
      const existing = await prisma.patientRequirement.findFirst({
        where: { caseId: patientCase.id, templateId: tid },
      });
      if (existing) continue;

      // Ablaufdatum berechnen
      let expiresAt: Date | undefined;
      if (template.validityDuration) {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + template.validityDuration);
      }

      // PatientRequirement erstellen
      const patientReq = await prisma.patientRequirement.create({
        data: {
          caseId: patientCase.id,
          templateId: template.id,
          organizationId: patientCase.organizationId,
          programId: patientCase.programId,
          title: template.name,
          category: template.category,
          description: template.description || null,
          required: template.required,
          listingBlocker: template.listingBlocker,
          responsibleRole: "PATIENT",
          reviewRequired: true,
          validityDuration: template.validityDuration,
          renewalLeadTime: template.renewalLeadTime,
          patientFriendlyDescription: template.patientFriendlyDescription || null,
          status: "NOT_STARTED",
          priority: template.listingBlocker ? 10 : 5,
          ...(expiresAt ? { expiresAt } : {}),
        },
      });

      // 5-Schritte-Workflow
      const workflowSteps = [
        { stepNumber: 1, title: "Überweisung einholen", desc: "Hausarzt-Überweisung anfordern", owner: "PATIENT" as const },
        { stepNumber: 2, title: "Termin vereinbaren", desc: "Facharzt-Termin vereinbaren", owner: "PATIENT" as const },
        { stepNumber: 3, title: "Befund/Bericht hochladen", desc: "Dokumente hochladen", owner: "PATIENT" as const },
        { stepNumber: 4, title: "Dokument prüfen", desc: "Prüfung durch Klinik", owner: "TRANSPLANT_CENTER" as const },
        { stepNumber: 5, title: "Freigabe durch Transplantationszentrum", desc: "Abschluss und Freigabe", owner: "TRANSPLANT_CENTER" as const },
      ];

      for (const step of workflowSteps) {
        await prisma.task.create({
          data: {
            requirementId: patientReq.id,
            caseId: patientCase.id,
            patientId,
            title: step.title,
            description: step.desc,
            ownerType: step.owner,
            status: step.stepNumber === 1 ? "IN_PROGRESS" : "PENDING",
            isWorkflowStep: true,
            stepNumber: step.stepNumber,
            stepName: step.title,
            stepDescription: step.desc,
            dueDate: expiresAt,
          },
        });
      }

      results.push(template.name);
    }

    return NextResponse.json({
      success: true,
      assignedCount: results.length,
      assignedNames: results,
      message: `${results.length} Untersuchung(en) zugewiesen`,
    });
  } catch (error) {
    console.error("Assign requirement error:", error);
    return NextResponse.json({ error: "Fehler bei der Zuweisung" }, { status: 500 });
  }
}

/* ================================================================ */
/*  DELETE: Einzelne Untersuchung vom Patienten entfernen           */
/* ================================================================ */
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];
    if (!clinicRoles.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const requirementId = searchParams.get("requirementId");

    if (!patientId || !requirementId) {
      return NextResponse.json({ error: "patientId und requirementId sind Pflicht" }, { status: 400 });
    }

    // Prüfen ob PatientRequirement existiert und zum Patienten gehört
    const patientCase = await prisma.patientCase.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    const patientReq = await prisma.patientRequirement.findFirst({
      where: {
        id: requirementId,
        caseId: patientCase?.id,
      },
    });

    if (!patientReq) {
      return NextResponse.json({ error: "Untersuchung nicht gefunden" }, { status: 404 });
    }

    // Zugehörige Tasks löschen (Cascade wäre ideal, aber wir machen es explizit)
    await prisma.task.deleteMany({
      where: { requirementId },
    });

    // PatientRequirement löschen
    await prisma.patientRequirement.delete({
      where: { id: requirementId },
    });

    return NextResponse.json({
      success: true,
      message: "Untersuchung entfernt",
    });
  } catch (error) {
    console.error("Remove requirement error:", error);
    return NextResponse.json({ error: "Fehler beim Entfernen" }, { status: 500 });
  }
}

/* ================================================================ */
/*  GET: Verfügbare Untersuchungen (nicht zugewiesene)              */
/* ================================================================ */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];
    if (!clinicRoles.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id: patientId } = await params;

    if (!patientId) {
      // Alle Templates zurückgeben
      const templates = await prisma.requirementTemplate.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ templates });
    }

    // Bereits zugewiesene Template-IDs finden
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        cases: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            requirements: { select: { templateId: true } },
          },
        },
      },
    });

    const assignedTemplateIds = new Set(
      patient?.cases?.[0]?.requirements?.map((r) => r.templateId) || []
    );

    // Nur nicht-zugewiesene Templates
    const templates = await prisma.requirementTemplate.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { name: "asc" },
    });

    const available = templates.filter((t) => !assignedTemplateIds.has(t.id));

    return NextResponse.json({ templates: available });
  } catch (error) {
    console.error("Get available requirements error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
