const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const targetId = "c765c958-1e34-4f92-93ee-0d2f3b634f87";

  console.log("=== Debug: Suche ID", targetId, "===");

  // 1. Suche in PatientRequirement
  const pr = await prisma.patientRequirement.findUnique({
    where: { id: targetId },
    select: { id: true, title: true, status: true },
  });
  console.log("PatientRequirement:", pr ? "GEFUNDEN" : "NICHT GEFUNDEN", pr);

  // 2. Suche in Task
  const task = await prisma.task.findUnique({
    where: { id: targetId },
    select: { id: true, title: true, requirementId: true, status: true },
  });
  console.log("Task:", task ? "GEFUNDEN" : "NICHT GEFUNDEN", task);

  // 3. Liste alle Tasks mit requirementId
  const tasksWithReq = await prisma.task.findMany({
    where: { requirementId: { not: null } },
    take: 5,
    select: { id: true, title: true, requirementId: true },
  });
  console.log("\nTasks mit requirementId (erste 5):", tasksWithReq);

  // 4. Liste alle PatientRequirements
  const reqs = await prisma.patientRequirement.findMany({
    take: 5,
    select: { id: true, title: true },
  });
  console.log("\nPatientRequirements (erste 5):", reqs);

  await prisma.$disconnect();
}

main().catch(console.error);
