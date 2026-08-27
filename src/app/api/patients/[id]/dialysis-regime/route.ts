import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* GET /api/patients/[id]/dialysis-regime */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id: patientId } = await params;

    const regimes = await prisma.dialysisRegime.findMany({
      where: { patientId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ regimes });
  } catch (error) {
    console.error("DialysisRegime GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* POST /api/patients/[id]/dialysis-regime */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id: patientId } = await params;
    const body = await request.json();

    const regime = await prisma.dialysisRegime.create({
      data: {
        patientId,
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
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ regime }, { status: 201 });
  } catch (error) {
    console.error("DialysisRegime POST error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
