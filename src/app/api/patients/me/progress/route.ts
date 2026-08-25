import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Patient Fortschritt für Dashboard                          */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    
    // Patient finden
    const patient = await prisma.patient.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Alle Requirements des Patienten
    const requirements = await prisma.patientRequirement.findMany({
      where: { patientCase: { patientId: patient.id } },
      include: {
        tasks: { where: { isWorkflowStep: true }, orderBy: { stepNumber: "asc" } },
      },
    });

    const totalRequirements = requirements.length;
    const completedRequirements = requirements.filter(
      (r) => r.status === "ACCEPTED"
    ).length;
    
    const inProgressRequirements = requirements.filter(
      (r) => r.status === "IN_PROGRESS" || r.status === "ACTION_REQUIRED"
    ).length;
    
    const expiredRequirements = requirements.filter(
      (r) => r.status === "EXPIRED" || r.status === "RENEWAL_REQUIRED"
    ).length;

    // Gesamt-Fortschritt (alle Schritte aller Requirements)
    let totalSteps = 0;
    let completedSteps = 0;
    
    requirements.forEach((req) => {
      const steps = req.tasks.filter((t) => t.isWorkflowStep);
      totalSteps += steps.length;
      completedSteps += steps.filter((t) => t.status === "COMPLETED").length;
    });

    // Nächste Aktion
    const nextRequirement = requirements
      .filter((r) => r.status !== "ACCEPTED" && r.status !== "WAIVED")
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .find((r) => r.tasks.some((t) => t.status === "IN_PROGRESS"));

    const nextStep = nextRequirement?.tasks.find((t) => t.status === "IN_PROGRESS");

    return NextResponse.json({
      progress: {
        totalRequirements,
        completedRequirements,
        inProgressRequirements,
        expiredRequirements,
        totalSteps,
        completedSteps,
        overallPercent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      },
      nextAction: nextStep
        ? {
            requirementTitle: nextRequirement?.title,
            stepName: nextStep.stepName,
            stepNumber: nextStep.stepNumber,
            taskId: nextStep.id,
            requirementId: nextRequirement?.id,
          }
        : null,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
