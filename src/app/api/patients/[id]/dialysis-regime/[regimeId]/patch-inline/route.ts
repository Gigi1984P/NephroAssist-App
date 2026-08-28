import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* PATCH /api/patients/[id]/dialysis-regime/[regimeId] - Partial update for inline editing */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; regimeId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { regimeId } = await params;
    const body = await request.json();
    const { field, value } = body;

    if (!field) {
      return NextResponse.json({ error: "Feld erforderlich" }, { status: 400 });
    }

    const updateData: any = {};
    updateData[field] = value || null;

    const regime = await prisma.dialysisRegime.update({
      where: { id: regimeId },
      data: updateData,
    });

    return NextResponse.json({ regime });
  } catch (error) {
    console.error("DialysisRegime PATCH error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}
