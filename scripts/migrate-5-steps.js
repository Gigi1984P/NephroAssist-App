const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 1. Alle stepNumber 3 Tasks auf CANCELLED setzen ("Untersuchung durchführen")
  const cancelled = await prisma.task.updateMany({
    where: {
      stepNumber: 3,
      isWorkflowStep: true,
    },
    data: {
      status: "CANCELLED",
    },
  });
  console.log(`Schritt 3 (Untersuchung durchführen) auf CANCELLED gesetzt: ${cancelled.count} Tasks`);

  // 2. stepNumber 4 → 3 umbenennen (Befund/Bericht hochladen)
  const updated4 = await prisma.task.updateMany({
    where: {
      stepNumber: 4,
      isWorkflowStep: true,
    },
    data: {
      stepNumber: 3,
    },
  });
  console.log(`Schritt 4 → 3 umbenannt: ${updated4.count} Tasks`);

  // 3. stepNumber 5 → 4 umbenennen (Dokument prüfen)
  const updated5 = await prisma.task.updateMany({
    where: {
      stepNumber: 5,
      isWorkflowStep: true,
    },
    data: {
      stepNumber: 4,
    },
  });
  console.log(`Schritt 5 → 4 umbenannt: ${updated5.count} Tasks`);

  // 4. stepNumber 6 → 5 umbenennen (Freigabe)
  const updated6 = await prisma.task.updateMany({
    where: {
      stepNumber: 6,
      isWorkflowStep: true,
    },
    data: {
      stepNumber: 5,
    },
  });
  console.log(`Schritt 6 → 5 umbenannt: ${updated6.count} Tasks`);

  // 5. stepName für umbenannte Schritte korrigieren
  await prisma.task.updateMany({
    where: { stepNumber: 3, isWorkflowStep: true },
    data: { stepName: "Befund/Bericht hochladen" },
  });
  await prisma.task.updateMany({
    where: { stepNumber: 4, isWorkflowStep: true },
    data: { stepName: "Dokument prüfen" },
  });
  await prisma.task.updateMany({
    where: { stepNumber: 5, isWorkflowStep: true },
    data: { stepName: "Freigabe durch Transplantationszentrum" },
  });

  console.log("\n✅ Migration abgeschlossen. Jetzt sind alle Workflows 5-Schritte:");
  console.log("  1. Überweisung einholen (PATIENT)");
  console.log("  2. Termin vereinbaren (PATIENT)");
  console.log("  3. Befund/Bericht hochladen (PATIENT)");
  console.log("  4. Dokument prüfen (Klinik)");
  console.log("  5. Freigabe durch Transplantationszentrum (Klinik)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
