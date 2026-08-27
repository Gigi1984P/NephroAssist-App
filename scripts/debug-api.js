const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const targetId = "c765c958-1e34-4f92-93ee-0d2f3b634f87";

  // 1. Suche PatientRequirement
  const pr = await prisma.patientRequirement.findUnique({
    where: { id: targetId },
    select: { id: true, title: true, status: true },
  });
  console.log("1. PatientRequirement:", pr ? "GEFUNDEN" : "NICHT GEFUNDEN");

  if (!pr) {
    console.log("FEHLER: PatientRequirement nicht gefunden!");
    await prisma.$disconnect();
    return;
  }

  // 2. Lade mit include (wie die API)
  try {
    const requirement = await prisma.patientRequirement.findUnique({
      where: { id: targetId },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            description: true,
            required: true,
            listingBlocker: true,
            patientFriendlyDescription: true,
          },
        },
        patientCase: {
          select: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        tasks: {
          orderBy: { stepNumber: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            dueDate: true,
            completedAt: true,
            stepNumber: true,
            stepName: true,
            stepDescription: true,
            ownerType: true,
            metadata: true,
          },
        },
      },
    });
    console.log("2. Requirement mit Include:", requirement ? "GEFUNDEN" : "NICHT GEFUNDEN");
    if (requirement) {
      console.log("  Title:", requirement.title);
      console.log("  Status:", requirement.status);
      console.log("  Tasks:", requirement.tasks.length);
      console.log("  Template:", requirement.template ? requirement.template.name : "null");
    }
  } catch (err) {
    console.log("2. FEHLER beim Laden mit Include:", err.message);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
