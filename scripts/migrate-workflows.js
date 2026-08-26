const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const reqs = await prisma.patientRequirement.findMany({
    where: { tasks: { none: { isWorkflowStep: true } } },
    select: {
      id: true, caseId: true, title: true, category: true,
      validityDuration: true, expiresAt: true,
      patientCase: { select: { patientId: true } },
    },
  });

  console.log(`Found ${reqs.length} PatientRequirements without workflow tasks`);

  for (const req of reqs) {
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
          requirementId: req.id,
          caseId: req.caseId,
          patientId: req.patientCase?.patientId || null,
          title: step.title,
          description: step.desc,
          ownerType: step.owner,
          status: step.stepNumber === 1 ? "IN_PROGRESS" : "PENDING",
          isWorkflowStep: true,
          stepNumber: step.stepNumber,
          stepName: step.title,
          stepDescription: step.desc,
          dueDate: req.expiresAt,
        },
      });
    }
    console.log(`Created 6 workflow tasks for requirement ${req.id}`);
  }
  console.log("Migration complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
