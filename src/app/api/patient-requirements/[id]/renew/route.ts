import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  POST: PatientRequirement für Renewal markieren                   */
/*  Erzeugt neue Tasks und setzt Status auf RENEWAL_REQUIRED        */
/* ================================================================ */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Nur Klinik-Mitarbeiter" }, { status: 403 });
    }

    const requirement = await prisma.patientRequirement.findUnique({
      where: { id },
      include: {
        tasks: { where: { isWorkflowStep: true } },
        patientCase: true,
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: "Anforderung nicht gefunden" }, { status: 404 });
    }

    // Nur wenn abgelaufen oder fast abgelaufen
    const now = new Date();
    const expiresAt = requirement.expiresAt;
    if (expiresAt && expiresAt > now) {
      return NextResponse.json({ error: "Anforderung ist noch gültig" }, { status: 400 });
    }

    // Bestehende Tasks archivieren (isWorkflowStep auf false setzen)
    await prisma.task.updateMany({
      where: { requirementId: id, isWorkflowStep: true },
      data: { isWorkflowStep: false, title: `ARCHIVIERT: ${requirement.title}` },
    });

    // Requirement auf RENEWAL_REQUIRED setzen
    await prisma.patientRequirement.update({
      where: { id },
      data: {
        status: "RENEWAL_REQUIRED",
        renewalStartedAt: new Date(),
        completedAt: null,
      },
    });

    // Neue Workflow-Schritte erstellen
    const workflowSteps = [
      { stepNumber: 1, stepName: "Überweisung anfordern", description: "Verordnung erneut anfordern" },
      { stepNumber: 2, stepName: "Verordnung hochladen", description: "Neue Verordnung hochladen" },
      { stepNumber: 3, stepName: "Termin vereinbaren", description: "Neuen Termin vereinbaren" },
      { stepNumber: 4, stepName: "Bericht anfordern", description: "Bericht erneut anfordern" },
      { stepNumber: 5, stepName: "Bericht hochladen", description: "Neuen Bericht hochladen" },
      { stepNumber: 6, stepName: "Prüfung durch Zentrum", description: "Erneute Prüfung durch Klinik" },
    ];

    let prevStepId: string | null = null;
    let createdTask: any;
    for (const step of workflowSteps) {
      createdTask = await prisma.task.create({
        data: {
          requirementId: id,
          caseId: requirement.caseId,
          patientId: requirement.patientCase?.patientId,
          title: step.stepName,
          description: step.description,
          status: step.stepNumber === 1 ? "IN_PROGRESS" : "PENDING",
          stepNumber: step.stepNumber,
          stepName: step.stepName,
          stepDescription: step.description,
          previousStepId: prevStepId,
          isWorkflowStep: true,
        },
      });
      prevStepId = createdTask.id;
    }

    return NextResponse.json({
      message: "Erneuerung gestartet",
      requirement: await prisma.patientRequirement.findUnique({ where: { id } }),
    });
  } catch (error) {
    console.error("Renewal error:", error);
    return NextResponse.json({ error: "Fehler beim Starten der Erneuerung" }, { status: 500 });
  }
}
