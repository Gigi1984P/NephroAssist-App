import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const steps = await prisma.patientOnboarding.findMany({
      where: { patientId: id },
      orderBy: { sortOrder: "asc" },
    });

    const total = steps.length;
    const completed = steps.filter((s) => s.status === "COMPLETED").length;
    const inProgress = steps.filter((s) => s.status === "IN_PROGRESS").length;

    return NextResponse.json({
      steps,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      counts: { total, completed, inProgress, pending: total - completed - inProgress },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { stepKey, stepLabel, sortOrder, dueDate } = body;

    const step = await prisma.patientOnboarding.create({
      data: {
        patientId: id,
        stepKey: stepKey || stepLabel?.toLowerCase().replace(/\s+/g, "_"),
        stepLabel,
        sortOrder: sortOrder || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, step });
  } catch (error) {
    console.error("Onboarding create error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
