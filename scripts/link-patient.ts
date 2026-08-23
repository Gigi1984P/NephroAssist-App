import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hans = await prisma.patient.findFirst({ where: { firstName: "Hans", lastName: "Müller" } });
  const patientUser = await prisma.user.findUnique({ where: { email: "patient@beispiel.de" } });

  if (hans && patientUser) {
    await prisma.patient.update({
      where: { id: hans.id },
      data: { userId: patientUser.id },
    });
    console.log("Linked Hans Müller to", patientUser.email);

    const tasks = await prisma.task.findMany({ where: { patientId: { not: null } }, take: 3 });
    for (const task of tasks) {
      await prisma.task.update({
        where: { id: task.id },
        data: { patientId: hans.id },
      });
      console.log("Set task patientId to Hans for", task.title);
    }
  } else {
    console.log("Hans:", hans?.id, "User:", patientUser?.id);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
