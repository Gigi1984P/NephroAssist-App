const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Alle User mit Rolle PATIENT finden, die keinem Patienten mehr zugeordnet sind
  const allPatientUsers = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: { id: true, email: true },
  });

  const orphanUsers = [];
  for (const u of allPatientUsers) {
    const patient = await prisma.patient.findFirst({ where: { userId: u.id } });
    if (!patient) orphanUsers.push(u);
  }

  console.log(`Gefunden: ${orphanUsers.length} verwaiste User-Accounts`);
  for (const u of orphanUsers) {
    console.log(`  - ${u.email} (${u.id})`);
  }

  if (orphanUsers.length === 0) {
    console.log("Keine verwaisten User gefunden. Alles sauber!");
    process.exit(0);
  }

  // Löschen
  for (const u of orphanUsers) {
    await prisma.user.delete({ where: { id: u.id } });
    console.log(`  Gelöscht: ${u.email}`);
  }

  console.log(`\n✅ ${orphanUsers.length} verwaiste User-Accounts entfernt.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
