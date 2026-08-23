import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const appointmentSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  location: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      orderBy: { startTime: "asc" },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Termine" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const validated = appointmentSchema.parse(body);

    const appointment = await prisma.appointment.create({
      data: {
        type: validated.type,
        startTime: new Date(validated.startTime),
        endTime: validated.endTime ? new Date(validated.endTime) : null,
        location: validated.location,
        patientId: "", // TODO: Get from session or request
        organizationId: "", // TODO: Get from user's organization
        status: "PLANNED",
      },
    });

    return NextResponse.json({
      message: "Termin erfolgreich erstellt",
      appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen" },
      { status: 500 }
    );
  }
}
