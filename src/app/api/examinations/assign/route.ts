import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  POST: Neue Untersuchung einem Patienten zuweisen                 */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const userRole = user.role;

    // Nur Klinik-Mitarbeiter
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];
    if (!clinicRoles.includes(userRole)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      caseId: z.string().uuid(),
      templateId: z.string().optional(),
      title: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      workflowType: z.enum(["dental-clearance", "cardiac-clearance", "custom"]).optional(),
    });

    const data = schema.parse(body);
    const caseId = data.caseId;

    // PatientCase laden
    const patientCase = await prisma.patientCase.findUnique({
      where: { id: caseId },
      select: { id: true, patientId: true, programId: true, organizationId: true },
    });

    if (!patientCase) {
      return NextResponse.json({ error: "Patientenfall nicht gefunden" }, { status: 404 });
    }

    let requirement: any;

    if (data.templateId) {
      // Template-basierte Untersuchung
      const template = await prisma.requirementTemplate.findUnique({
        where: { id: data.templateId },
      });
      if (!template) {
        return NextResponse.json({ error: "Template nicht gefunden" }, { status: 404 });
      }

      // PatientRequirement erstellen
      requirement = await prisma.patientRequirement.create({
        data: {
          caseId,
          templateId: template.id,
          organizationId: patientCase.organizationId,
          programId: patientCase.programId,
          title: template.name,
          description: template.description,
          category: template.category,
          required: template.required,
          listingBlocker: template.listingBlocker,
          conditional: template.conditional,
          validityDuration: template.validityDuration,
          renewalLeadTime: template.renewalLeadTime,
          responsibleRole: template.responsibleRole,
          reviewRequired: template.reviewRequired,
          instructions: template.instructions,
          patientFriendlyDescription: template.patientFriendlyDescription,
          priority: template.priority,
        },
      });
    } else if (data.title) {
      // Manuelle Untersuchung (ohne Template)
      requirement = await prisma.patientRequirement.create({
        data: {
          caseId,
          templateId: "00000000-0000-0000-0000-000000000000", // Platzhalter
          organizationId: patientCase.organizationId,
          programId: patientCase.programId,
          title: data.title,
          description: data.description || null,
          category: data.category || "Sonstiges",
          required: true,
          listingBlocker: false,
          conditional: false,
          responsibleRole: "PATIENT",
          reviewRequired: true,
          priority: 0,
        },
      });
    } else {
      return NextResponse.json({ error: "Template oder Titel erforderlich" }, { status: 400 });
    }

    // Workflow-Schritte aus workflows.ts
    const { getWorkflow } = await import("@/lib/workflows");
    const workflowType = data.workflowType || "custom";
    const workflow = getWorkflow(workflowType);

    if (workflow) {
      // Top-Level Task
      const topLevelTask = await prisma.task.create({
        data: {
          requirementId: requirement.id,
          caseId,
          patientId: patientCase.patientId,
          title: workflow.name,
          description: workflow.description,
          status: "PENDING",
          isWorkflowStep: false,
        },
      });

      // Workflow-Schritte erstellen
      let prevStepId: string | null = null;
      for (const step of workflow.steps) {
      const createdStep: any = await prisma.task.create({
          data: {
            requirementId: requirement.id,
            caseId,
            patientId: patientCase.patientId,
            title: step.name,
            description: step.description,
            status: step.stepNumber === 1 ? "IN_PROGRESS" : "PENDING",
            stepNumber: step.stepNumber,
            stepName: step.name,
            stepDescription: step.description,
            previousStepId: prevStepId,
            isWorkflowStep: true,
          },
        });
        prevStepId = createdStep.id;
      }
    } else {
      // Einfacher Task ohne Workflow
      await prisma.task.create({
        data: {
          requirementId: requirement.id,
          caseId,
          patientId: patientCase.patientId,
          title: requirement.title,
          description: requirement.description,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      message: "Untersuchung erfolgreich zugewiesen",
      requirement,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Examination assignment error:", error);
    return NextResponse.json({ error: "Fehler beim Zuweisen" }, { status: 500 });
  }
}
