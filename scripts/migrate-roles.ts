import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orgId = "70f61307-5d24-407f-802c-a484f4767ed3";
  const koordinatorId = "032d3ff8-9844-4bff-97f5-8249764f2fa5";
  const arztId = "b6e7e413-514e-4962-88cf-51993d86e64b";
  const caregiverId = "000e868d-d2a6-4eaa-b953-51b75323bc82";
  const dialysisId = "e1ecb4e2-9335-4ce0-ae02-a1c32917a5ba";

  const hans = await prisma.patient.findFirst({
    where: { firstName: "Hans", lastName: "Müller" },
  });

  if (!hans) {
    console.log("Hans Müller nicht gefunden");
    await prisma.$disconnect();
    return;
  }

  // 1. CaregiverAccess
  const existingCa = await prisma.caregiverAccess.findFirst({
    where: { patientId: hans.id, caregiverId },
  });
  if (!existingCa) {
    await prisma.caregiverAccess.create({
      data: {
        patientId: hans.id,
        caregiverId,
        permissions: { canViewDocuments: true, canViewAppointments: true, canEditTasks: true },
        status: "ACTIVE",
      },
    });
    console.log("Created CaregiverAccess");
  }

  // 2. OrganizationMemberships
  const roles = await prisma.role.findMany({ where: { organizationId: orgId }, select: { id: true } });
  const roleId = roles[0]?.id;

  if (roleId) {
    for (const userId of [koordinatorId, arztId, caregiverId, dialysisId]) {
      const existing = await prisma.organizationMembership.findFirst({
        where: { userId, organizationId: orgId },
      });
      if (!existing) {
        await prisma.organizationMembership.create({
          data: { userId, organizationId: orgId, roleId },
        });
        console.log("Enrolled user", userId);
      }
    }
  }

  // 3. Task owner
  const tasks = await prisma.task.findMany({ where: { patientId: hans.id } });
  if (tasks.length > 0) {
    await prisma.task.updateMany({
      where: { id: tasks[0].id },
      data: { ownerId: caregiverId, ownerType: "CAREGIVER" },
    });
    console.log("Set task owner to caregiver");
  }

  // 4. Appointment provider
  await prisma.appointment.updateMany({
    where: { patientId: hans.id },
    data: { provider: arztId },
  });
  console.log("Set appointment provider to physician");

  // 5. Case coordinator
  const cases = await prisma.patientCase.findMany({ where: { patientId: hans.id } });
  for (const c of cases) {
    if (!c.coordinatorId) {
      await prisma.patientCase.update({
        where: { id: c.id },
        data: { coordinatorId: koordinatorId },
      });
      console.log("Set case coordinator");
    }
  }

  console.log("Migration complete!");
  await prisma.$disconnect();
}

main().catch(console.error);
