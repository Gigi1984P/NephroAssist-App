import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  Ueberweisungsanfrage an Hausarzt simulieren                      */
/* ================================================================ */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;

    // Task laden
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        requirementId: true,
        stepNumber: true,
        stepName: true,
        patientId: true,
        isWorkflowStep: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Untersuchung nicht gefunden" }, { status: 404 });
    }

    // Nur fuer Workflow-Schritt 1 erlaubt
    if (!task.isWorkflowStep || task.stepNumber !== 1) {
      return NextResponse.json({ error: "Nur fuer Schritt 1 erlaubt" }, { status: 400 });
    }

    // Patient-Daten laden (inkl. Hausarzt)
    const patient = await prisma.patient.findUnique({
      where: { id: task.patientId || undefined },
      select: {
        firstName: true,
        lastName: true,
        generalPractitionerName: true,
        generalPractitionerEmail: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Pruefen ob Hausarzt-Email vorhanden
    if (!patient.generalPractitionerEmail) {
      return NextResponse.json(
        { error: "Keine Hausarzt-E-Mail hinterlegt" },
        { status: 400 }
      );
    }

    // SIMULATION: Email "gesendet"
    console.log(`[SIMULATION] Ueberweisungsanfrage an ${patient.generalPractitionerEmail}`);
    console.log(`  Patient: ${patient.firstName} ${patient.lastName}`);
    console.log(`  Hausarzt: ${patient.generalPractitionerName}`);
    console.log(`  Von: ${user.email}`);

    // Task als erledigt markieren
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completedById: user.id,
        completedByRole: user.role,
        metadata: {
          referralSent: true,
          sentAt: new Date().toISOString(),
          sentBy: user.id,
          practitionerEmail: patient.generalPractitionerEmail,
        },
      },
    });

    // Naechsten Schritt aktivieren
    const nextStep = await prisma.task.findFirst({
      where: {
        requirementId: task.requirementId,
        stepNumber: 2,
        isWorkflowStep: true,
      },
    });

    if (nextStep && nextStep.status === "PENDING") {
      await prisma.task.update({
        where: { id: nextStep.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({
      message: "Ueberweisungsanfrage an Hausarzt gesendet",
      practitionerEmail: patient.generalPractitionerEmail,
      simulated: true,
    });
  } catch (error) {
    console.error("Referral email error:", error);
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
