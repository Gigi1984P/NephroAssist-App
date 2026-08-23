import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({ select: { id: true, firstName: true, lastName: true, email: true }, take: 10 });
  console.log("Patients:", patients);

  // Tasks mit Patient-Verknüpfung anzeigen
  const tasks = await prisma.task.findMany({
    where: { patientId: { not: null } },
    include: { requirement: { include: { patientCase: { include: { patient: true } } } } },
    take: 5,
  });
  console.log("Tasks:", tasks.map((t) => ({
    title: t.title,
    patientId: t.patientId,
    patientEmail: t.requirement?.patientCase?.patient?.email,
    ownerType: t.ownerType,
    ownerId: t.ownerId,
  })));

  await prisma.$disconnect();
}

main().catch(console.error);
