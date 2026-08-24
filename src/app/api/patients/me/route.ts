import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const gpSchema = z.object({
  generalPractitionerName: z.string().min(1).optional(),
  generalPractitionerEmail: z.string().email().optional().or(z.literal("")),
  generalPractitionerPhone: z.string().optional(),
  generalPractitionerAddress: z.string().optional(),
  generalPractitionerCity: z.string().optional(),
});

/* ================================================================ */
/*  Eigenes Patientenprofil laden                                    */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const patient = await prisma.patient.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        generalPractitionerName: true,
        generalPractitionerEmail: true,
        generalPractitionerPhone: true,
        generalPractitionerAddress: true,
        generalPractitionerCity: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("Get patient profile error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* ================================================================ */
/*  Eigenes Patientenprofil aktualisieren (nur Hausarzt-Daten)      */
/* ================================================================ */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const validated = gpSchema.parse(body);

    const patient = await prisma.patient.findFirst({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    const updated = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        ...(validated.generalPractitionerName !== undefined && {
          generalPractitionerName: validated.generalPractitionerName || null,
        }),
        ...(validated.generalPractitionerEmail !== undefined && {
          generalPractitionerEmail: validated.generalPractitionerEmail || null,
        }),
        ...(validated.generalPractitionerPhone !== undefined && {
          generalPractitionerPhone: validated.generalPractitionerPhone || null,
        }),
        ...(validated.generalPractitionerAddress !== undefined && {
          generalPractitionerAddress: validated.generalPractitionerAddress || null,
        }),
        ...(validated.generalPractitionerCity !== undefined && {
          generalPractitionerCity: validated.generalPractitionerCity || null,
        }),
      },
    });

    return NextResponse.json({ patient: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Update patient profile error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
