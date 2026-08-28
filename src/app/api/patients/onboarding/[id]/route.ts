import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, stepId, status, notes } = body;

    if (!patientId || !stepId) {
      return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
    }

    const step = await prisma.patientOnboarding.update({
      where: { id: stepId },
      data: {
        status,
        notes,
        completedAt: status === "COMPLETED" ? new Date() : null,
        completedBy: status === "COMPLETED" ? session.user.id : null,
      },
    });

    return NextResponse.json({ success: true, step });
  } catch (error) {
    console.error("Onboarding update error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}
