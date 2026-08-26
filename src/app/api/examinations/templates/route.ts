import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Alle Templates (für Klinik)                                 */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const templates = await prisma.requirementTemplate.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        required: true,
        listingBlocker: true,
        validityDuration: true,
        renewalLeadTime: true,
        version: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* ================================================================ */
/*  POST: Neues Template erstellen                                   */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1, "Name erforderlich"),
      category: z.string().min(1, "Kategorie erforderlich"),
      description: z.string().optional(),
      required: z.boolean().default(true),
      listingBlocker: z.boolean().default(false),
      patientFriendlyDescription: z.string().optional(),
      validityDuration: z.number().optional(),
      renewalLeadTime: z.number().optional(),
    });

    const data = schema.parse(body);

    // Program ID holen (wir nehmen das erste verfügbare Programm)
    const program = await prisma.transplantProgram.findFirst({
      select: { id: true, organizationId: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Kein Programm gefunden" }, { status: 400 });
    }

    const template = await prisma.requirementTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || null,
        required: data.required,
        listingBlocker: data.listingBlocker,
        patientFriendlyDescription: data.patientFriendlyDescription || null,
        programId: program.id,
        organizationId: program.organizationId,
        responsibleRole: "PATIENT",
        reviewRequired: true,
        validityDuration: data.validityDuration || null,
        renewalLeadTime: data.renewalLeadTime || null,
      },
    });

    // Automatisch allen Patienten mit aktiven Fällen zuweisen
    const activeCases = await prisma.patientCase.findMany({
      where: { status: { notIn: ["CLOSED", "INACTIVE"] } },
      select: { id: true, patientId: true, organizationId: true, programId: true },
    });

    if (activeCases.length > 0) {
      const expiresAt = data.validityDuration
        ? new Date(Date.now() + data.validityDuration * 30 * 24 * 60 * 60 * 1000)
        : null;

      for (const c of activeCases) {
        // 1. PatientRequirement erstellen
        const patientReq = await prisma.patientRequirement.create({
          data: {
            caseId: c.id,
            templateId: template.id,
            organizationId: c.organizationId || program.organizationId,
            programId: c.programId || program.id,
            title: data.name,
            category: data.category,
            description: data.description || null,
            required: data.required,
            listingBlocker: data.listingBlocker,
            responsibleRole: "PATIENT",
            reviewRequired: true,
            validityDuration: data.validityDuration || null,
            renewalLeadTime: data.renewalLeadTime || null,
            patientFriendlyDescription: data.patientFriendlyDescription || null,
            status: "NOT_STARTED",
            priority: data.listingBlocker ? 10 : 5,
            ...(expiresAt ? { expiresAt } : {}),
          },
        });

        // 2. 6-Schritte-Workflow Tasks erstellen
        const workflowSteps = [
          { stepNumber: 1, title: "Überweisung einholen", desc: "Hausarzt-Überweisung anfordern", owner: "PATIENT" },
          { stepNumber: 2, title: "Termin vereinbaren", desc: "Facharzt-Termin vereinbaren", owner: "PATIENT" },
          { stepNumber: 3, title: "Untersuchung durchführen", desc: "Untersuchung beim Facharzt", owner: "PATIENT" },
          { stepNumber: 4, title: "Befund/Bericht hochladen", desc: "Dokumente hochladen", owner: "PATIENT" },
          { stepNumber: 5, title: "Dokument prüfen", desc: "Prüfung durch Klinik", owner: "TRANSPLANT_CENTER" },
          { stepNumber: 6, title: "Freigabe durch Transplantationszentrum", desc: "Abschluss und Freigabe", owner: "TRANSPLANT_CENTER" },
        ];

        for (const step of workflowSteps) {
          await prisma.task.create({
            data: {
              requirementId: patientReq.id,
              caseId: c.id,
              patientId: c.patientId,
              title: step.title,
              description: step.desc,
              ownerType: step.owner as any,
              status: step.stepNumber === 1 ? "IN_PROGRESS" : "PENDING",
              isWorkflowStep: true,
              stepNumber: step.stepNumber,
              stepName: step.title,
              stepDescription: step.desc,
              dueDate: expiresAt,
            },
          });
        }
      }
    }

    return NextResponse.json({ template, assignedToPatients: activeCases.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Template create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
