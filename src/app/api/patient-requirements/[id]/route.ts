import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Einzelne PatientRequirement mit Workflow-Tasks            */
/*  Unterstützt PatientRequirement-ID, Task-ID, und Task ohne Req  */
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Keine ID angegeben" }, { status: 400 });
    }

    let requirementId = id;
    let fallbackTask: any = null;

    // Versuche zuerst, die ID als PatientRequirement zu finden
    const reqExists = await prisma.patientRequirement.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!reqExists) {
      // Wenn nicht gefunden, prüfe ob es ein Task ist
      const task = await prisma.task.findUnique({
        where: { id },
        select: { 
          id: true, 
          requirementId: true, 
          title: true,
          description: true,
          status: true,
          dueDate: true,
          completedAt: true,
          stepNumber: true,
          stepName: true,
          stepDescription: true,
          ownerType: true,
          metadata: true,
          patientId: true,
        },
      });

      if (task) {
        if (task.requirementId) {
          requirementId = task.requirementId;
        } else {
          // Task ohne requirementId — Erstelle ein virtuelles Requirement
          fallbackTask = task;
        }
      }
    }

    // Falls es ein Task ohne requirementId war
    if (fallbackTask) {
      const patient = await prisma.patient.findUnique({
        where: { id: fallbackTask.patientId || "" },
        select: { firstName: true, lastName: true },
      });

      const virtualRequirement = {
        id: fallbackTask.id,
        title: fallbackTask.title || fallbackTask.stepName || "Untersuchung",
        category: "",
        description: fallbackTask.description || fallbackTask.stepDescription,
        status: "PENDING",
        required: false,
        listingBlocker: false,
        expiresAt: null,
        completedAt: fallbackTask.completedAt,
        template: null,
        patientCase: {
          patient: patient || { firstName: null, lastName: null },
        },
        tasks: [
          {
            id: fallbackTask.id,
            title: fallbackTask.title || fallbackTask.stepName || "Untersuchung",
            description: fallbackTask.description || fallbackTask.stepDescription,
            status: fallbackTask.status,
            dueDate: fallbackTask.dueDate,
            completedAt: fallbackTask.completedAt,
            stepNumber: fallbackTask.stepNumber || 1,
            stepName: fallbackTask.stepName || fallbackTask.title || "Untersuchung",
            stepDescription: fallbackTask.stepDescription || fallbackTask.description,
            ownerType: fallbackTask.ownerType,
            metadata: fallbackTask.metadata,
          },
        ],
      };

      return NextResponse.json({ requirement: virtualRequirement });
    }

    // Lade PatientRequirement mit allem
    const requirement = await prisma.patientRequirement.findUnique({
      where: { id: requirementId },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            description: true,
            required: true,
            listingBlocker: true,
            patientFriendlyDescription: true,
          },
        },
        patientCase: {
          select: {
            patientId: true,
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        tasks: {
          orderBy: { stepNumber: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            dueDate: true,
            completedAt: true,
            stepNumber: true,
            stepName: true,
            stepDescription: true,
            ownerType: true,
            metadata: true,
          },
        },
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: "Untersuchung nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ requirement });
  } catch (error) {
    console.error("Patient requirement detail error:", error);
    return NextResponse.json({ error: "Fehler beim Laden: " + String(error) }, { status: 500 });
  }
}
