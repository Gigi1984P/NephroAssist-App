import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* PATCH /api/patients/[id]/dialysis-regime/[regimeId] */
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

    const regime = await prisma.dialysisRegime.update({
      where: { id: regimeId },
      data: {
        procedure: body.procedure,
        frequency: body.frequency,
        duration: body.duration,
        accessType: body.accessType,
        targetWeight: body.targetWeight || null,
        ultrafiltrationTarget: body.ultrafiltrationTarget || null,
        bloodFlow: body.bloodFlow || null,
        dialysateFlow: body.dialysateFlow || null,
        dialyzerType: body.dialyzerType || null,
        dialyzerSize: body.dialyzerSize || null,
        potassium: body.potassium || null,
        calcium: body.calcium || null,
        sodium: body.sodium || null,
        bicarbonate: body.bicarbonate || null,
        anticoagulation: body.anticoagulation || null,
        anticoagulationDose: body.anticoagulationDose || null,
        medicationsDuring: body.medicationsDuring || null,
        monitoring: body.monitoring || null,
        labControls: body.labControls || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ regime });
  } catch (error) {
    console.error("DialysisRegime PATCH error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

/* DELETE /api/patients/[id]/dialysis-regime/[regimeId] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; regimeId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { regimeId } = await params;

    await prisma.dialysisRegime.delete({
      where: { id: regimeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DialysisRegime DELETE error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
