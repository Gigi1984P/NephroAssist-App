import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  POST: TemplateSet einem Patienten zuweisen                          */
/* ================================================================ */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id: patientId } = await params;
    const body = await request.json();
    const { templateSetId } = body;

    if (!templateSetId) {
      return NextResponse.json({ error: "templateSetId erforderlich" }, { status: 400 });
    }

    // Patient finden
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });

    // Aktiver Case (nicht INACTIVE oder CLOSED)
    const activeCase = await prisma.patientCase.findFirst({
      where: {
        patientId,
        status: { notIn: ["INACTIVE", "CLOSED"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!activeCase) return NextResponse.json({ error: "Kein aktiver Fall" }, { status: 400 });

    // TemplateSet laden
    const templateSet = await prisma.templateSet.findUnique({
      where: { id: templateSetId },
    });
    if (!templateSet) return NextResponse.json({ error: "Untersuchungs-Set nicht gefunden" }, { status: 404 });

    const items = (templateSet.items as any[]) || [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Untersuchungs-Set enthält keine Untersuchungen" }, { status: 400 });
    }

    const createdRequirements: string[] = [];

    // Jede Untersuchung aus dem Set dem Patienten zuweisen
    for (const item of items) {
      // RequirementTemplate finden oder erstellen
      let template = await prisma.requirementTemplate.findFirst({
        where: {
          name: item.name,
          category: item.category,
          organizationId: activeCase.organizationId,
        },
      });

      if (!template) {
        template = await prisma.requirementTemplate.create({
          data: {
            name: item.name,
            category: item.category,
            description: item.description || null,
            required: item.required || false,
            programId: activeCase.programId,
            organizationId: activeCase.organizationId,
            status: "PUBLISHED",
          },
        });
      }

      // Prüfen ob bereits existiert
      const existing = await prisma.patientRequirement.findFirst({
        where: {
          caseId: activeCase.id,
          templateId: template.id,
        },
      });

      if (existing) continue;

      // PatientRequirement erstellen
      const patientReq = await prisma.patientRequirement.create({
        data: {
          caseId: activeCase.id,
          templateId: template.id,
          organizationId: activeCase.organizationId,
          programId: activeCase.programId,
          title: item.name,
          description: item.description || null,
          category: item.category,
          required: item.required || false,
          status: "NOT_STARTED",
          priority: 0,
        },
      });

      createdRequirements.push(patientReq.id);

      // Workflow-Tasks erstellen (5 Schritte)
      await prisma.task.createMany({
        data: [
          {
            title: `Überweisung einholen: ${item.name}`,
            description: `Überweisung für ${item.name} (${item.category}) besorgen`,
            status: "PENDING",
            ownerType: "PATIENT",
            patientId: patient.id,
            requirementId: patientReq.id,
            stepNumber: 1,
            caseId: activeCase.id,
          },
          {
            title: `Termin vereinbaren: ${item.name}`,
            description: `Termin für ${item.name} vereinbaren`,
            status: "PENDING",
            ownerType: "PATIENT",
            patientId: patient.id,
            requirementId: patientReq.id,
            stepNumber: 2,
            caseId: activeCase.id,
          },
          {
            title: `Befund/Bericht hochladen: ${item.name}`,
            description: `Befund oder Bericht für ${item.name} hochladen`,
            status: "PENDING",
            ownerType: "PATIENT",
            patientId: patient.id,
            requirementId: patientReq.id,
            stepNumber: 3,
            caseId: activeCase.id,
          },
          {
            title: `Dokument prüfen: ${item.name}`,
            description: `Hochgeladenes Dokument für ${item.name} prüfen`,
            status: "PENDING",
            ownerType: "TRANSPLANT_CENTER",
            patientId: patient.id,
            requirementId: patientReq.id,
            stepNumber: 4,
            caseId: activeCase.id,
          },
          {
            title: `Freigabe durch Transplantationszentrum: ${item.name}`,
            description: `Untersuchung ${item.name} freigeben`,
            status: "PENDING",
            ownerType: "TRANSPLANT_CENTER",
            patientId: patient.id,
            requirementId: patientReq.id,
            stepNumber: 5,
            caseId: activeCase.id,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      assigned: createdRequirements.length,
      message: `${createdRequirements.length} Untersuchungen aus "${templateSet.name}" zugewiesen`,
    });
  } catch (error) {
    console.error("TemplateSet assign error:", error);
    return NextResponse.json({ error: "Fehler beim Zuweisen" }, { status: 500 });
  }
}
