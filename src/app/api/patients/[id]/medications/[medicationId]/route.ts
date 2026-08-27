import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/patients/[id]/medications/[medicationId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; medicationId: string }> }
) {
  try {
    const { id, medicationId } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();

    const medication = await prisma.medication.update({
      where: { id: medicationId, patientId: id },
      data: {
        name: body.name,
        substance: body.substance,
        dose: body.dose,
        morning: body.morning,
        noon: body.noon,
        evening: body.evening,
        night: body.night,
        notes: body.notes,
      },
    });

    return NextResponse.json(medication);
  } catch (error) {
    console.error("Error updating medication:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id]/medications/[medicationId]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; medicationId: string }> }
) {
  try {
    const { medicationId } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    await prisma.medication.delete({
      where: { id: medicationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting medication:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
