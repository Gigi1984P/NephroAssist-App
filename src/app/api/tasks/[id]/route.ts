import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const userRole = user.role;

    // Task laden
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        requirement: {
          include: {
            patientCase: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Aufgabe nicht gefunden" }, { status: 404 });
    }

    // PATIENT: Nur eigene Aufgaben bearbeiten
    if (userRole === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!patient || task.patientId !== patient.id) {
        return NextResponse.json(
          { error: "Sie können nur Ihre eigenen Aufgaben bearbeiten" },
          { status: 403 }
        );
      }
      // Patient darf nur auf COMPLETED oder IN_PROGRESS setzen
      const body = await request.json();
      if (!["COMPLETED", "IN_PROGRESS", "PENDING"].includes(body.status)) {
        return NextResponse.json(
          { error: "Ungültiger Status" },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: validated.status,
        completedAt: validated.status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json({ message: "Aufgabe aktualisiert", task: updatedTask });
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
