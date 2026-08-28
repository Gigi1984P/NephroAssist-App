// This file is used by `prisma db seed`
// It is NOT part of the Next.js build

if (process.env.NODE_ENV === "production" && !process.env.SEEDING) {
  throw new Error("Seed file should not be executed in production");
}

import { PrismaClient, UserRole, OrganizationType, OrganizationStatus, ProgramType, ProgramStatus, TemplateStatus, ResponsibleRole, ConsentStatus, CaseStatus, RequirementStatus, TaskStatus, AppointmentStatus, BlockerType, BlockerStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Organization (Transplant Center)
  const organization = await prisma.organization.upsert({
    where: { slug: "uniklinik-musterstadt" },
    update: {},
    create: {
      name: "Uniklinik Musterstadt",
      slug: "uniklinik-musterstadt",
      type: OrganizationType.TRANSPLANT_CENTER,
      status: OrganizationStatus.ACTIVE,
      timezone: "Europe/Berlin",
      language: "de",
    },
  });

  console.log("Created organization:", organization.name);

  // 2. Roles
  const adminRole = await prisma.role.create({
    data: {
      name: "Administrator",
      organizationId: organization.id,
      isGlobal: false,
    },
  });

  const coordinatorRole = await prisma.role.create({
    data: {
      name: "Koordinator",
      organizationId: organization.id,
      isGlobal: false,
    },
  });

  const physicianRole = await prisma.role.create({
    data: {
      name: "Arzt",
      organizationId: organization.id,
      isGlobal: false,
    },
  });

  const dialysisRole = await prisma.role.create({
    data: {
      name: "Dialysepersonal",
      organizationId: organization.id,
      isGlobal: false,
    },
  });

  const transplantRole = await prisma.role.create({
    data: {
      name: "Transplantationsklinik",
      organizationId: organization.id,
      isGlobal: false,
    },
  });

  console.log("Created roles");

  // 3. Users
  const hashedPassword = await bcrypt.hash("Test1234!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nephroassist.de" },
    update: {},
    create: {
      email: "admin@nephroassist.de",
      name: "Dr. Anna Admin",
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  const coordinatorUser = await prisma.user.upsert({
    where: { email: "koordinator@nephroassist.de" },
    update: {},
    create: {
      email: "koordinator@nephroassist.de",
      name: "Max Koordinator",
      password: hashedPassword,
      role: UserRole.COORDINATOR,
      emailVerified: new Date(),
    },
  });

  const physicianUser = await prisma.user.upsert({
    where: { email: "arzt@nephroassist.de" },
    update: {},
    create: {
      email: "arzt@nephroassist.de",
      name: "Dr. Petra Arzt",
      password: hashedPassword,
      role: UserRole.PHYSICIAN,
      emailVerified: new Date(),
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "patient@beispiel.de" },
    update: {},
    create: {
      email: "patient@beispiel.de",
      name: "Hans Patient",
      password: hashedPassword,
      role: UserRole.PATIENT,
      emailVerified: new Date(),
    },
  });

  const dialysisUser = await prisma.user.upsert({
    where: { email: "dialyse@beispiel.de" },
    update: {},
    create: {
      email: "dialyse@beispiel.de",
      name: "Lisa Dialyse",
      password: hashedPassword,
      role: UserRole.DIALYSIS_STAFF,
      emailVerified: new Date(),
    },
  });

  const transplantUser = await prisma.user.upsert({
    where: { email: "transplant@beispiel.de" },
    update: {},
    create: {
      email: "transplant@beispiel.de",
      name: "Dr. transplantklinik",
      password: hashedPassword,
      role: UserRole.PHYSICIAN,
      emailVerified: new Date(),
    },
  });

  const caregiverUser = await prisma.user.upsert({
    where: { email: "angehorige@beispiel.de" },
    update: {},
    create: {
      email: "angehorige@beispiel.de",
      name: "Marie Pflege",
      password: hashedPassword,
      role: UserRole.CAREGIVER,
      emailVerified: new Date(),
    },
  });

  console.log("Created users");

  // 4. Transplant Program
  const program = await prisma.transplantProgram.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: "nierentransplantation",
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Nierentransplantation",
      slug: "nierentransplantation",
      description: "Programm für Nierentransplantationen",
      type: ProgramType.KIDNEY,
      status: ProgramStatus.ACTIVE,
    },
  });

  console.log("Created program:", program.name);

  // 5. Requirement Templates
  const templates = await Promise.all([
    prisma.requirementTemplate.create({
      data: {
        programId: program.id,
        organizationId: organization.id,
        name: "Aktuelle Laborwerte",
        category: "Labor",
        description: "Aktuelle Blutwerte (Kreatinin, HbA1c, etc.)",
        patientFriendlyDescription: "Blutuntersuchung beim Hausarzt",
        required: true,
        listingBlocker: true,
        validityDuration: 3,
        renewalLeadTime: 14,
        responsibleRole: ResponsibleRole.PATIENT,
        reviewRequired: true,
        status: TemplateStatus.PUBLISHED,
        priority: 1,
      },
    }),
    prisma.requirementTemplate.create({
      data: {
        programId: program.id,
        organizationId: organization.id,
        name: "Herzunter suchung",
        category: "Kardiologie",
        description: "EKG und Echokardiographie",
        patientFriendlyDescription: "Herzuntersuchung beim Kardiologen",
        required: true,
        listingBlocker: true,
        validityDuration: 6,
        renewalLeadTime: 30,
        responsibleRole: ResponsibleRole.PATIENT,
        reviewRequired: true,
        status: TemplateStatus.PUBLISHED,
        priority: 2,
      },
    }),
    prisma.requirementTemplate.create({
      data: {
        programId: program.id,
        organizationId: organization.id,
        name: "Zahnstatus",
        category: "Zahnmedizin",
        description: "Vollständiger zahnmedizinischer Status",
        patientFriendlyDescription: "Zahnarztbesuch mit Gesundheitsbescheinigung",
        required: true,
        listingBlocker: false,
        validityDuration: 12,
        renewalLeadTime: 60,
        responsibleRole: ResponsibleRole.PATIENT,
        reviewRequired: true,
        status: TemplateStatus.PUBLISHED,
        priority: 3,
      },
    }),
    prisma.requirementTemplate.create({
      data: {
        programId: program.id,
        organizationId: organization.id,
        name: "Impfstatus",
        category: "Prävention",
        description: "Aktueller Impfstatus (Hepatitis B, COVID-19, etc.)",
        patientFriendlyDescription: "Impfausweis aktualisieren",
        required: true,
        listingBlocker: false,
        validityDuration: 12,
        renewalLeadTime: 30,
        responsibleRole: ResponsibleRole.PATIENT,
        reviewRequired: true,
        status: TemplateStatus.PUBLISHED,
        priority: 4,
      },
    }),
    prisma.requirementTemplate.create({
      data: {
        programId: program.id,
        organizationId: organization.id,
        name: "Psychosomatische Untersuchung",
        category: "Psychologie",
        description: "Psychosomatisches Gutachten",
        patientFriendlyDescription: "Gespräch mit einem Psychologen",
        required: true,
        listingBlocker: true,
        validityDuration: 12,
        renewalLeadTime: 30,
        responsibleRole: ResponsibleRole.PATIENT,
        reviewRequired: true,
        status: TemplateStatus.PUBLISHED,
        priority: 5,
      },
    }),
  ]);

  console.log("Created requirement templates:", templates.length);

  // 6. Patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        firstName: "Hans",
        lastName: "Müller",
        dateOfBirth: new Date("1975-03-15"),
        email: "hans.mueller@beispiel.de",
        phone: "+49123456789",
        consentStatus: ConsentStatus.CONSENT_GRANTED,
        organizationId: organization.id,
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Maria",
        lastName: "Schmidt",
        dateOfBirth: new Date("1982-07-22"),
        email: "maria.schmidt@beispiel.de",
        phone: "+49987654321",
        consentStatus: ConsentStatus.CONSENT_GRANTED,
        organizationId: organization.id,
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Peter",
        lastName: "Weber",
        dateOfBirth: new Date("1968-11-30"),
        email: "peter.weber@beispiel.de",
        phone: "+49111222333",
        consentStatus: ConsentStatus.CONSENT_PENDING,
        organizationId: organization.id,
      },
    }),
  ]);

  console.log("Created patients:", patients.length);

  // 7. Patient Cases
  const cases = await Promise.all(
    patients.map((patient, index) => {
      const statuses = [CaseStatus.EVALUATION, CaseStatus.READY_FOR_REVIEW, CaseStatus.WAITLISTED];
      return prisma.patientCase.create({
        data: {
          patientId: patient.id,
          organizationId: organization.id,
          programId: program.id,
          coordinatorId: coordinatorUser.id,
          status: statuses[index] || CaseStatus.REFERRAL,
          referralDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          intakeDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      });
    })
  );

  console.log("Created cases:", cases.length);

  // 8. Patient Requirements
  for (const patientCase of cases) {
    for (const template of templates) {
      await prisma.patientRequirement.create({
        data: {
          caseId: patientCase.id,
          templateId: template.id,
          organizationId: organization.id,
          programId: program.id,
          title: template.name,
          description: template.description,
          category: template.category,
          required: template.required,
          listingBlocker: template.listingBlocker,
          conditional: template.conditional,
          validityDuration: template.validityDuration,
          renewalLeadTime: template.renewalLeadTime,
          responsibleRole: template.responsibleRole,
          reviewRequired: template.reviewRequired,
          status: Math.random() > 0.5 ? RequirementStatus.NOT_STARTED : RequirementStatus.IN_PROGRESS,
          priority: template.priority,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Created patient requirements");

  // 9. Tasks
  const taskStatuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];
  for (const patientCase of cases) {
    const requirements = await prisma.patientRequirement.findMany({
      where: { caseId: patientCase.id },
    });
    for (const req of requirements.slice(0, 3)) {
      await prisma.task.create({
        data: {
          requirementId: req.id,
          caseId: patientCase.id,
          patientId: patientCase.patientId,
          title: `Aufgabe: ${req.title}`,
          description: `Bitte führen Sie die Anforderung "${req.title}" durch.`,
          ownerType: "PATIENT",
          status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
          dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Created tasks");

  // 10. Appointments
  for (const patient of patients) {
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        organizationId: organization.id,
        type: "Transplantationsambulanz",
        provider: "Uniklinik Musterstadt",
        location: "Transplantationszentrum, Raum 12",
        startTime: new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
        status: AppointmentStatus.PLANNED,
      },
    });
  }

  console.log("Created appointments");

  // 11. Documents
  for (const patient of patients) {
    await prisma.document.create({
      data: {
        patientId: patient.id,
        organizationId: organization.id,
        fileKey: `patients/${patient.id}/laborbericht.pdf`,
        filename: "laborbericht.pdf",
        mimeType: "application/pdf",
        size: 1024 * 512, // 512 KB
        sha256: "dummy-sha256-" + patient.id,
        uploadedBy: patient.id,
        source: "PATIENT_UPLOAD",
        processingStatus: "ACCEPTED",
      },
    });
  }

  console.log("Created documents");

  // 12. Blockers (for one case)
  await prisma.blocker.create({
    data: {
      caseId: cases[0].id,
      type: BlockerType.MISSING_DOCUMENT,
      description: "Warte auf aktuelle Laborwerte vom Hausarzt",
      status: BlockerStatus.ACTIVE,
    },
  });

  console.log("Created blockers");

  // 13. Notifications
  await prisma.notification.create({
    data: {
      userId: patientUser.id,
      organizationId: organization.id,
      type: "TASK",
      title: "Neue Aufgabe",
      message: "Sie haben eine neue Aufgabe: Laborwerte aktualisieren",
      entityType: "TASK",
      entityId: "dummy-task-id",
    },
  });

  console.log("Created notifications");

  // 14. System Settings
  await prisma.systemSetting.create({
    data: {
      key: "default_language",
      value: "de",
      scope: "GLOBAL",
    },
  });

  await prisma.systemSetting.create({
    data: {
      key: "default_timezone",
      value: "Europe/Berlin",
      scope: "GLOBAL",
    },
  });

  console.log("Created system settings");

  console.log("Seeding finished!");
  console.log("");
  console.log("Test-Logins:");
  console.log("  Admin:              admin@nephroassist.de / Test1234!");
  console.log("  Koordinator:        koordinator@nephroassist.de / Test1234!");
  console.log("  Arzt:               arzt@nephroassist.de / Test1234!");
  console.log("  Patient:            patient@beispiel.de / Test1234!");
  console.log("  Dialyse:            dialyse@beispiel.de / Test1234!");
  console.log("  Transplant:         transplant@beispiel.de / Test1234!");
  console.log("  Angehöriger (Pflege): angehorige@beispiel.de / Test1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
