import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  POST: Schritt 6 (Pruefung) als abgenommen markieren              */
/*  Setzt Status auf COMPLETED + completedBy                         */
/* ================================================================ */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Nur Klinik-Mitarbeiter" }, { status: 403 });
    }

    const { id } = await params;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedById: user.id,
        completedByRole: user.role,
        completedAt: new Date(),
      },
    });

    // Auch das Parent-Requirement auf ACCEPTED setzen
    await prisma.patientRequirement.update({
      where: { id: task.requirementId },
      data: { status: "ACCEPTED", completedAt: new Date() },
    });

    return NextResponse.json({
      message: "Prüfung erfolgreich abgenommen",
      task,
    });
  } catch (error) {
    console.error("Step 6 review error:", error);
    return NextResponse.json({ error: "Fehler beim Abnehmen" }, { status: 500 });
  }
}
