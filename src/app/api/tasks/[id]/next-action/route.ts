import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Next Best Action für eine Task                               */
/*  Prüft Abhängigkeiten und gibt den nächsten sinnvollen Schritt an  */
/* ================================================================ */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        requirement: {
          include: {
            patientCase: true,
            template: {
              include: {
                dependencies: true,
                prerequisites: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task nicht gefunden" }, { status: 404 });
    }

    // Alle Schritte für dieses Requirement
    const allSteps = await prisma.task.findMany({
      where: { requirementId: task.requirementId, isWorkflowStep: true },
      orderBy: { stepNumber: "asc" },
    });

    // Finde aktiven Schritt
    const activeStep = allSteps.find((s) => s.status === "IN_PROGRESS");
    
    // Vorherigen Schritt finden
    let prevStep = null;
    if (activeStep && activeStep.stepNumber != null && activeStep.stepNumber > 1) {
      const targetStepNumber = activeStep.stepNumber - 1;
      prevStep = allSteps.find((s) => s.stepNumber === targetStepNumber) ?? null;
    }

    // Prüfe Abhängigkeiten (andere Requirements müssen ACCEPTED sein)
    const template = task.requirement?.template;
    const prerequisiteIds = template?.prerequisites?.map((p) => p.prerequisiteId) || [];
    
    const prerequisiteRequirements = await prisma.patientRequirement.findMany({
      where: {
        caseId: task.caseId,
        templateId: { in: prerequisiteIds },
      },
      select: { id: true, status: true, title: true },
    });

    const blockedBy = prerequisiteRequirements
      .filter((pr) => pr.status !== "ACCEPTED")
      .map((pr) => ({ id: pr.id, title: pr.title, status: pr.status }));

    // Next Best Action berechnen
    let nextAction: string;
    let canProceed: boolean;

    if (blockedBy.length > 0) {
      nextAction = `Vorher abschließen: ${blockedBy.map((b) => b.title).join(", ")}`;
      canProceed = false;
    } else if (!activeStep) {
      // Alle erledigt?
      const allCompleted = allSteps.every((s) => s.status === "COMPLETED");
      nextAction = allCompleted 
        ? "Alle Schritte abgeschlossen" 
        : "Kein aktiver Schritt gefunden";
      canProceed = false;
    } else {
      nextAction = activeStep.stepName || `Schritt ${activeStep.stepNumber}`;
      canProceed = true;
    }

    return NextResponse.json({
      currentStep: activeStep
        ? {
            id: activeStep.id,
            stepNumber: activeStep.stepNumber,
            stepName: activeStep.stepName,
            status: activeStep.status,
          }
        : null,
      previousStep: prevStep
        ? {
            id: prevStep.id,
            stepName: prevStep.stepName,
            status: prevStep.status,
          }
        : null,
      blockedBy,
      nextAction,
      canProceed,
    });
  } catch (error) {
    console.error("Next best action error:", error);
    return NextResponse.json({ error: "Fehler beim Berechnen" }, { status: 500 });
  }
}
