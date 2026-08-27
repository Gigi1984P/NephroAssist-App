import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bulkAssignSchema = z.object({
  patientIds: z.array(z.string()).min(1),
  templateId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];
    if (!clinicRoles.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const { patientIds, templateId } = bulkAssignSchema.parse(body);

    // Template laden
    const template = await prisma.requirementTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Template nicht gefunden" }, { status: 404 });
    }

    // Für jeden Patienten: aktiven Fall finden + PatientRequirement + Tasks erstellen
    let successCount = 0;
    const errors: string[] = [];

    for (const patientId of patientIds) {
      try {
        const patientCase = await prisma.patientCase.findFirst({
          where: {
            patientId,
            status: { notIn: ["CLOSED", "INACTIVE", "TRANSPLANTED"] },
          },
          select: { id: true },
        });

        if (!patientCase) {
          errors.push(`Patient ${patientId}: Kein aktiver Fall`);
          continue;
        }

        // Prüfen ob schon zugewiesen
        const existing = await prisma.patientRequirement.findFirst({
          where: { caseId: patientCase.id, templateId },
        });

        if (existing) {
          errors.push(`Patient ${patientId}: Bereits zugewiesen`);
          continue;
        }

        // PatientRequirement erstellen
        const requirement = await prisma.patientRequirement.create({
          data: {
            caseId: patientCase.id,
            templateId,
            organizationId: template.organizationId,
            programId: template.programId,
            title: template.name,
            category: template.category,
            description: template.description,
            required: template.required,
            listingBlocker: template.listingBlocker,
            conditional: template.conditional || false,
            validityDuration: template.validityDuration,
            renewalLeadTime: template.renewalLeadTime,
            responsibleRole: template.responsibleRole,
            reviewRequired: template.reviewRequired || false,
            priority: template.priority || 0,
            instructions: template.instructions,
            patientFriendlyDescription: template.patientFriendlyDescription,
            status: "NOT_STARTED",
            dueDate: template.validityDuration
              ? new Date(Date.now() + template.validityDuration * 30 * 24 * 60 * 60 * 1000)
              : null,
            expiresAt: template.validityDuration
              ? new Date(Date.now() + template.validityDuration * 30 * 24 * 60 * 60 * 1000)
              : null,
          },
        });

        // 5-Schritte Workflow Tasks erstellen
        const workflowSteps = [
          { stepNumber: 1, title: "Überweisung einholen", desc: "Hausarzt-Überweisung anfordern", owner: "PATIENT" as const },
          { stepNumber: 2, title: "Termin vereinbaren", desc: "Facharzt-Termin vereinbaren", owner: "PATIENT" as const },
          { stepNumber: 3, title: "Befund/Bericht hochladen", desc: "Dokumente hochladen", owner: "PATIENT" as const },
          { stepNumber: 4, title: "Dokument prüfen", desc: "Prüfung durch Klinik", owner: "TRANSPLANT_CENTER" as const },
          { stepNumber: 5, title: "Freigabe durch Transplantationszentrum", desc: "Abschluss und Freigabe", owner: "TRANSPLANT_CENTER" as const },
        ];

        for (const step of workflowSteps) {
          await prisma.task.create({
            data: {
              requirementId: requirement.id,
              caseId: patientCase.id,
              patientId,
              title: step.title,
              description: step.desc,
              ownerType: step.owner,
              status: step.stepNumber === 1 ? "IN_PROGRESS" : "PENDING",
              isWorkflowStep: true,
              stepNumber: step.stepNumber,
              stepName: step.title,
              stepDescription: step.desc,
            },
          });
        }

        successCount++;
      } catch (err: any) {
        errors.push(`Patient ${patientId}: ${err.message}`);
      }
    }

    // Audit Log
    await logAuditEvent({
      actorId: user.id,
      action: "BULK_ASSIGN",
      entityType: "PATIENT_REQUIREMENT",
      entityId: templateId,
      organizationId: template.organizationId,
      metadata: {
        patientIds,
        successCount,
        errorCount: errors.length,
      },
    });

    return NextResponse.json({
      successCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Bulk assign error:", error);
    return NextResponse.json({ error: "Fehler bei der Massen-Zuweisung" }, { status: 500 });
  }
}
