import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Einzelne PatientRequirement mit Workflow-Tasks            */
/*  Unterstützt sowohl PatientRequirement-ID als auch Task-ID      */
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

    // Versuche zuerst, die ID als PatientRequirement zu finden
    const reqExists = await prisma.patientRequirement.findUnique({
      where: { id },
      select: { id: true },
    });

    // Wenn nicht gefunden, prüfe ob es ein Task ist
    if (!reqExists) {
      const task = await prisma.task.findUnique({
        where: { id },
        select: { requirementId: true },
      });
      if (task?.requirementId) {
        requirementId = task.requirementId;
      } else {
        return NextResponse.json({ error: "Untersuchung nicht gefunden" }, { status: 404 });
      }
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
            patient: {
              select: {
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
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
