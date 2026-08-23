import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrganizations } from "@/lib/permissions";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE", "CANCELLED"]),
  notes: z.string().optional(),
});

/* ================================================================ */
/*  Status-Update mit strikten "Erledigt"-Regeln                    */
/* ================================================================ */
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

    const body = await request.json();
    const validated = updateSchema.parse(body);
    const newStatus = validated.status;

    // 1. Task laden
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        status: true,
        isWorkflowStep: true,
        stepNumber: true,
        requirementId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Untersuchung nicht gefunden" },
        { status: 404 }
      );
    }

    // 2. PATIENT / CAREGIVER: Keine Status-Updates erlaubt
    if (userRole === "PATIENT" || userRole === "CAREGIVER") {
      return NextResponse.json(
        { error: "Sie dürfen den Status dieser Untersuchung nicht ändern." },
        { status: 403 }
      );
    }

    // 3. "ERLEDIGT" (COMPLETED) darf nur Klinik oder unabhängige Dialyse
    if (newStatus === "COMPLETED") {
      const isKlinik = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(userRole);

      if (!isKlinik) {
        // Dialyse prüfen: nur wenn unabhängig
        if (userRole === "DIALYSIS_STAFF") {
          const userOrgs = await getUserOrganizations(user.id);
          const isIndependent = userOrgs.every(
            (org) => org.parentOrganizationId === null
          );

          if (!isIndependent) {
            return NextResponse.json(
              {
                error:
                  "Ihre Dialyse ist einer Klinik zugeordnet. Nur Klinik-Mitarbeiter können Untersuchungen als erledigt markieren.",
              },
              { status: 403 }
            );
          }
          // Unabhängige Dialyse darf → OK
        } else {
          // Andere Rollen (z.B. EXTERNAL_PROVIDER) nicht erlaubt
          return NextResponse.json(
            {
              error:
                "Nur Klinik-Mitarbeiter oder unabhängige Dialysen können Untersuchungen als erledigt markieren.",
            },
            { status: 403 }
          );
        }
      }
    }

    // 4. Update durchführen
    const updateData: any = {
      status: newStatus,
      completedAt: newStatus === "COMPLETED" ? new Date() : null,
    };

    // Nur bei Erledigt: completedBy speichern
    if (newStatus === "COMPLETED") {
      updateData.completedById = user.id;
      updateData.completedByRole = userRole;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // 5. Wenn COMPLETED und Workflow-Schritt: Nächsten Schritt aktivieren
    if (newStatus === "COMPLETED" && task.isWorkflowStep) {
      const nextStep = await prisma.task.findFirst({
        where: {
          requirementId: task.requirementId,
          stepNumber: (task.stepNumber || 0) + 1,
          isWorkflowStep: true,
        },
      });

      if (nextStep && nextStep.status === "PENDING") {
        await prisma.task.update({
          where: { id: nextStep.id },
          data: { status: "IN_PROGRESS" },
        });
      }
    }

    return NextResponse.json({
      message: "Untersuchung aktualisiert",
      task: updatedTask,
    });
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
