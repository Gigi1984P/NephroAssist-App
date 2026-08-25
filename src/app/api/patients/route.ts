import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  POST: Neuen Patienten anlegen                                   */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];
    if (!clinicRoles.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      gpName,
      gpEmail,
      gpPhone,
    } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "Vor- und Nachname sind Pflicht" }, { status: 400 });
    }

    // Organization ID aus dem User-Kontext (optional)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    const patient = await prisma.patient.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("1990-01-01"),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        generalPractitionerName: gpName?.trim() || null,
        generalPractitionerEmail: gpEmail?.trim() || null,
        generalPractitionerPhone: gpPhone?.trim() || null,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error("Patient create error:", error);
    return NextResponse.json({ error: "Fehler beim Anlegen" }, { status: 500 });
  }
}
