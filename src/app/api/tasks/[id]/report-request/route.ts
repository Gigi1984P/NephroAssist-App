import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  Berichtsanforderung an Facharzt simulieren                        */
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

    // Nur fuer Workflow-Schritt 4 erlaubt
    if (!task.isWorkflowStep || task.stepNumber !== 4) {
      return NextResponse.json({ error: "Nur fuer Schritt 4 erlaubt" }, { status: 400 });
    }

    // Schritt 3 laden fuer Facharzt-Email
    const step3 = await prisma.task.findFirst({
      where: {
        requirementId: task.requirementId,
        stepNumber: 3,
        isWorkflowStep: true,
      },
      select: { metadata: true },
    });

    const meta = step3?.metadata as any;
    const specialistEmail = meta?.appointment?.doctorEmail;
    const specialistName = meta?.appointment?.doctorName || "Facharzt";

    if (!specialistEmail) {
      return NextResponse.json(
        { error: "Keine E-Mail des Facharztes in Schritt 3 hinterlegt" },
        { status: 400 }
      );
    }

    // SIMULATION: Email "gesendet"
    console.log(`[SIMULATION] Berichtsanforderung an ${specialistEmail}`);
    console.log(`  Facharzt: ${specialistName}`);
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
          reportRequested: true,
          requestedAt: new Date().toISOString(),
          requestedBy: user.id,
          specialistEmail,
          specialistName,
        },
      },
    });

    // Naechsten Schritt aktivieren
    const nextStep = await prisma.task.findFirst({
      where: {
        requirementId: task.requirementId,
        stepNumber: 5,
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
      message: "Berichtsanforderung an Facharzt gesendet",
      specialistEmail,
      specialistName,
      simulated: true,
    });
  } catch (error) {
    console.error("Report request error:", error);
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
