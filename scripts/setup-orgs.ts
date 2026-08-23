import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const uniKlinik = await prisma.organization.findFirst({
    where: { name: "Uniklinik Musterstadt" },
  });

  if (!uniKlinik) {
    console.log("Uniklinik nicht gefunden");
    await prisma.$disconnect();
    return;
  }

  // 1. Dialyse-Center erstellen
  let dialyseOrg = await prisma.organization.findFirst({
    where: { name: "Muster-Dialyse" },
  });
  if (!dialyseOrg) {
    dialyseOrg = await prisma.organization.create({
      data: {
        name: "Muster-Dialyse",
        slug: "muster-dialyse",
        type: "DIALYSIS_CENTER",
        parentOrganizationId: uniKlinik.id,
      },
    });
    console.log("Dialyse-Center erstellt:", dialyseOrg.id);
  } else {
    await prisma.organization.update({
      where: { id: dialyseOrg.id },
      data: { parentOrganizationId: uniKlinik.id },
    });
    console.log("Dialyse-Center parent gesetzt");
  }

  // 2. Rollen finden
  const roles = await prisma.role.findMany({
    where: { organizationId: { in: [uniKlinik.id, dialyseOrg.id] } },
    select: { id: true, name: true, organizationId: true },
  });
  console.log("Rollen:", roles);

  const dialyseRole = roles.find((r) => r.organizationId === dialyseOrg.id);
  const klinikRole = roles.find((r) => r.organizationId === uniKlinik.id);

  // 3. Dialyse-User: Lösche alte Klinik-Membership, setze in Dialyse
  const dialyseUserId = "e1ecb4e2-9335-4ce0-ae02-a1c32917a5ba"; // dialyse@beispiel.de

  // Lösche alte Memberships für Dialyse-User
  await prisma.organizationMembership.deleteMany({
    where: { userId: dialyseUserId },
  });
  console.log("Alte Dialyse-Memberships geloescht");

  if (dialyseRole) {
    await prisma.organizationMembership.create({
      data: {
        userId: dialyseUserId,
        organizationId: dialyseOrg.id,
        roleId: dialyseRole.id,
      },
    });
    console.log("Dialyse-User in Dialyse-Center eingetragen");
  }

  // 4. Caregiver: Lösche alte Klinik-Membership (unabhängig)
  const caregiverId = "000e868d-d2a6-4eaa-b953-51b75323bc82"; // angehorige@beispiel.de
  await prisma.organizationMembership.deleteMany({
    where: { userId: caregiverId },
  });
  console.log("Alte Caregiver-Memberships geloescht (jetzt unabhaengig)");

  console.log("Migration complete!");
  await prisma.$disconnect();
}

main().catch(console.error);
