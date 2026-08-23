import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        requirementId: true,
        patientId: true,
        caseId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Untersuchung nicht gefunden" },
        { status: 404 }
      );
    }

    // Hole alle Workflow-Schritte für diese Requirement
    const steps = await prisma.task.findMany({
      where: {
        requirementId: task.requirementId,
        isWorkflowStep: true,
      },
      orderBy: { stepNumber: "asc" },
      select: {
        id: true,
        stepNumber: true,
        stepName: true,
        stepDescription: true,
        status: true,
        ownerType: true,
      },
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("Get workflow error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden des Workflows" },
      { status: 500 }
    );
  }
}
