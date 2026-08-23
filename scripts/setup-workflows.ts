import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Finde Hans Müller
  const patient = await prisma.patient.findFirst({
    where: { firstName: "Hans", lastName: "Müller" },
    include: { cases: { take: 1 } },
  });

  if (!patient || patient.cases.length === 0) {
    console.log("Hans Müller oder Case nicht gefunden");
    await prisma.$disconnect();
    return;
  }

  const patientCase = patient.cases[0];
  const orgId = patientCase.organizationId;
  const programId = patientCase.programId;

  // Lösche alte Tasks (die ohne isWorkflowStep)
  await prisma.task.deleteMany({
    where: { caseId: patientCase.id, isWorkflowStep: false },
  });
  console.log("Alte Tasks geloescht");

  // Erstelle Requirement Templates falls nicht existieren
  let dentalTemplate = await prisma.requirementTemplate.findFirst({
    where: { name: "Dental Clearance" },
  });
  if (!dentalTemplate) {
    dentalTemplate = await prisma.requirementTemplate.create({
      data: {
        programId,
        organizationId: orgId,
        name: "Dental Clearance",
        category: "Vorbereitung",
        required: true,
        responsibleRole: "PATIENT",
      },
    });
  }

  let cardiacTemplate = await prisma.requirementTemplate.findFirst({
    where: { name: "Herz-Kreislauf Clearance" },
  });
  if (!cardiacTemplate) {
    cardiacTemplate = await prisma.requirementTemplate.create({
      data: {
        programId,
        organizationId: orgId,
        name: "Herz-Kreislauf Clearance",
        category: "Vorbereitung",
        required: true,
        responsibleRole: "PATIENT",
      },
    });
  }

  // Erstelle PatientRequirements
  const dentalReq = await prisma.patientRequirement.create({
    data: {
      caseId: patientCase.id,
      templateId: dentalTemplate.id,
      organizationId: orgId,
      programId,
      title: "Dental Clearance",
      category: "Vorbereitung",
      required: true,
      status: "IN_PROGRESS",
      responsibleRole: "PATIENT",
    },
  });

  const cardiacReq = await prisma.patientRequirement.create({
    data: {
      caseId: patientCase.id,
      templateId: cardiacTemplate.id,
      organizationId: orgId,
      programId,
      title: "Herz-Kreislauf Clearance",
      category: "Vorbereitung",
      required: true,
      status: "IN_PROGRESS",
      responsibleRole: "PATIENT",
    },
  });

  // DENTAL CLEARANCE WORKFLOW - 7 Steps
  const dentalSteps = [
    { stepNumber: 1, title: "Überweisung anfordern", desc: "Verordnung beim Hausarzt oder Zahnarzt anfordern", status: "IN_PROGRESS" },
    { stepNumber: 2, title: "Verordnung hochladen", desc: "Die erhaltene Überweisung im Portal hochladen", status: "PENDING" },
    { stepNumber: 3, title: "Zahnarzttermin vereinbaren", desc: "Termin beim Zahnarzt vereinbaren", status: "PENDING" },
    { stepNumber: 4, title: "Termin wahrnehmen", desc: "Den vereinbarten Zahnarzttermin wahrnehmen", status: "PENDING" },
    { stepNumber: 5, title: "Bericht anfordern", desc: "Zahnarztbericht anfordern", status: "PENDING" },
    { stepNumber: 6, title: "Bericht hochladen", desc: "Den Zahnarztbericht im Portal hochladen", status: "PENDING" },
    { stepNumber: 7, title: "Prüfung durch Transplantationszentrum", desc: "Der Bericht wird geprüft", status: "PENDING" },
  ];

  for (const step of dentalSteps) {
    await prisma.task.create({
      data: {
        requirementId: dentalReq.id,
        caseId: patientCase.id,
        patientId: patient.id,
        title: step.title,
        description: step.desc,
        status: step.status as any,
        ownerType: step.stepNumber === 7 ? "TRANSPLANT_CENTER" : "PATIENT",
        stepNumber: step.stepNumber,
        stepName: step.title,
        stepDescription: step.desc,
        isWorkflowStep: true,
      },
    });
  }
  console.log("Dental Clearance Workflow erstellt (7 Schritte)");

  // CARDIAC CLEARANCE WORKFLOW - 7 Steps
  const cardiacSteps = [
    { stepNumber: 1, title: "Überweisung anfordern", desc: "Verordnung zum Kardiologen anfordern", status: "PENDING" },
    { stepNumber: 2, title: "Verordnung hochladen", desc: "Die erhaltene Überweisung hochladen", status: "PENDING" },
    { stepNumber: 3, title: "Kardiologentermin vereinbaren", desc: "Termin beim Kardiologen vereinbaren", status: "PENDING" },
    { stepNumber: 4, title: "Untersuchung durchführen", desc: "EKG, Echokardiografie durchführen lassen", status: "PENDING" },
    { stepNumber: 5, title: "Bericht anfordern", desc: "Kardiologie-Bericht anfordern", status: "PENDING" },
    { stepNumber: 6, title: "Bericht hochladen", desc: "Bericht im Portal hochladen", status: "PENDING" },
    { stepNumber: 7, title: "Prüfung durch Transplantationszentrum", desc: "Bericht wird geprüft", status: "PENDING" },
  ];

  for (const step of cardiacSteps) {
    await prisma.task.create({
      data: {
        requirementId: cardiacReq.id,
        caseId: patientCase.id,
        patientId: patient.id,
        title: step.title,
        description: step.desc,
        status: step.status as any,
        ownerType: step.stepNumber === 7 ? "TRANSPLANT_CENTER" : "PATIENT",
        stepNumber: step.stepNumber,
        stepName: step.title,
        stepDescription: step.desc,
        isWorkflowStep: true,
      },
    });
  }
  console.log("Herz-Kreislauf Clearance Workflow erstellt (7 Schritte)");

  console.log("Migration complete!");
  await prisma.$disconnect();
}

main().catch(console.error);
