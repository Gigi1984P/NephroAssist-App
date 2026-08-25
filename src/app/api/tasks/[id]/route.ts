import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrganizations } from "@/lib/permissions";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE", "CANCELLED"]),
  notes: z.string().optional(),
  metadata: z.any().optional(),
});

/* ================================================================ */
/*  Status-Update mit actionType-basierter Berechtigung              */
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
        caseId: true,
        status: true,
        isWorkflowStep: true,
        stepNumber: true,
        stepName: true,
        requirementId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Untersuchung nicht gefunden" },
        { status: 404 }
      );
    }

    // 2. Für NICHT-Workflow-Tasks: Alte Regeln (Klinik nur)
    if (!task.isWorkflowStep) {
      if (userRole === "PATIENT" || userRole === "CAREGIVER") {
        return NextResponse.json(
          { error: "Sie dürfen den Status dieser Untersuchung nicht ändern." },
          { status: 403 }
        );
      }
      // Rest wie bisher...
    }

    // 3. Workflow-Schritte: actionType-basierte Berechtigung
    if (task.isWorkflowStep && newStatus === "COMPLETED") {
      // Bestimme actionType aus stepName
      const stepName = task.stepName || "";
      const isUploadStep = stepName.includes("hochladen");
      const isClinicReview = stepName.includes("Prüfung durch");

      if (isClinicReview) {
        // Nur Klinik oder Dialyse
        const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(userRole);
        if (!isClinic) {
          if (userRole === "DIALYSIS_STAFF") {
            const userOrgs = await getUserOrganizations(user.id);
            const isIndependent = userOrgs.every(
              (org) => org.parentOrganizationId === null
            );
            if (!isIndependent) {
              return NextResponse.json(
                { error: "Nur Klinik-Mitarbeiter können diesen Schritt bestätigen." },
                { status: 403 }
              );
            }
          } else {
            return NextResponse.json(
              { error: "Nur Klinik-Mitarbeiter können diesen Schritt bestätigen." },
              { status: 403 }
            );
          }
        }
      } else if (!isUploadStep) {
        // patient_status: Nur Patient oder Caregiver
        if (userRole !== "PATIENT" && userRole !== "CAREGIVER") {
          return NextResponse.json(
            { error: "Dieser Schritt kann nur vom Patienten selbst erledigt werden." },
            { status: 403 }
          );
        }
      } else {
        // patient_upload: Nur Patient oder Caregiver
        if (userRole !== "PATIENT" && userRole !== "CAREGIVER") {
          return NextResponse.json(
            { error: "Dieser Schritt erfordert einen Upload durch den Patienten." },
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

    if (newStatus === "COMPLETED") {
      updateData.completedById = user.id;
      updateData.completedByRole = userRole;
    }

    if (body.metadata) {
      updateData.metadata = body.metadata;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // 5. Wenn COMPLETED und Workflow-Schritt: Nächsten aktivieren + Timeline
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

      // Timeline-Event erstellen
      try {
        await prisma.timelineEvent.create({
          data: {
            caseId: task.caseId || updatedTask.caseId,
            eventType: "TASK_COMPLETED",
            description: `Schritt "${task.stepName || updatedTask.title}" wurde als erledigt markiert`,
            metadata: {
              taskId: id,
              stepNumber: task.stepNumber,
              completedById: user.id,
              completedByRole: userRole,
            },
          },
        });
      } catch (e) {
        // Silent fail für Timeline
        console.log("Timeline event creation failed:", e);
      }
    }

    // Wenn Schritt 6 COMPLETED: Requirement auf ACCEPTED + Timeline
    if (
      newStatus === "COMPLETED" &&
      task.isWorkflowStep &&
      task.stepNumber === 6
    ) {
      try {
        await prisma.patientRequirement.update({
          where: { id: task.requirementId },
          data: { status: "ACCEPTED", completedAt: new Date() },
        });
        await prisma.timelineEvent.create({
          data: {
            caseId: task.caseId || updatedTask.caseId,
            eventType: "REQUIREMENT_ACCEPTED",
            description: `Anforderung "${task.stepName || updatedTask.title}" wurde durch das Transplantationszentrum freigegeben`,
            metadata: {
              requirementId: task.requirementId,
              reviewedById: user.id,
              reviewedByRole: userRole,
            },
          },
        });
      } catch (e) {
        console.log("Timeline event creation failed:", e);
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
