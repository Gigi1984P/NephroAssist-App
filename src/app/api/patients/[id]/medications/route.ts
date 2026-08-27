import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/patients/[id]/medications
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const medications = await prisma.medication.findMany({
      where: { patientId: id },
      orderBy: [{ substance: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(medications);
  } catch (error) {
    console.error("Error loading medications:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// POST /api/patients/[id]/medications
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const medication = await prisma.medication.create({
      data: {
        patientId: id,
        name: body.name,
        substance: body.substance,
        dose: body.dose,
        morning: body.morning ?? false,
        noon: body.noon ?? false,
        evening: body.evening ?? false,
        night: body.night ?? false,
        notes: body.notes,
      },
    });

    return NextResponse.json(medication, { status: 201 });
  } catch (error) {
    console.error("Error creating medication:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
