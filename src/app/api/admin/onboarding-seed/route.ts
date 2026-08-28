import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "COORDINATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      select: { id: true },
    });

    const DEFAULT_STEPS = [
      { stepKey: "consent", stepLabel: "Einwilligung unterschrieben", sortOrder: 1 },
      { stepKey: "initial_labs", stepLabel: "Initiale Laborwerte", sortOrder: 2 },
      { stepKey: "hla_typing", stepLabel: "HLA-Typisierung", sortOrder: 3 },
      { stepKey: "psychosocial", stepLabel: "Psychosoziales Gutachten", sortOrder: 4 },
      { stepKey: "first_appointment", stepLabel: "Ersttermin vereinbart", sortOrder: 5 },
    ];

    let created = 0;
    for (const patient of patients) {
      const existing = await prisma.patientOnboarding.findFirst({
        where: { patientId: patient.id },
      });
      if (!existing) {
        for (const step of DEFAULT_STEPS) {
          await prisma.patientOnboarding.create({
            data: {
              patientId: patient.id,
              ...step,
              status: "PENDING",
            },
          });
        }
        created++;
      }
    }

    return NextResponse.json({ success: true, patientsProcessed: created });
  } catch (error) {
    console.error("Onboarding seed error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
