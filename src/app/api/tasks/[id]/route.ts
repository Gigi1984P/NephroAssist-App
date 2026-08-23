import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: validated.status,
        completedAt: validated.status === "COMPLETED" ? new Date() : null,
      },
    });

    // Timeline Event erstellen
    if (validated.notes) {
      await prisma.timelineEvent.create({
        data: {
          caseId: task.caseId,
          eventType: "TASK_UPDATED",
          description: `Aufgabe "${task.title}" wurde aktualisiert: ${validated.notes}`,
        },
      });
    }

    return NextResponse.json({ message: "Aufgabe aktualisiert", task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Task update error:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren" },
      { status: 500 }
    );
  }
}
