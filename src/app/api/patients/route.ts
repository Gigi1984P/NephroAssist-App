import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  POST: Neuen Patienten anlegen + optional User-Account            */
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
      // User-Account Felder
      createUserAccount,
      userEmail,
      userPassword,
    } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "Vor- und Nachname sind Pflicht" }, { status: 400 });
    }

    // User-Account erstellen falls gewünscht
    let createdUserId: string | null = null;
    if (createUserAccount) {
      if (!userEmail?.trim() || !userPassword?.trim()) {
        return NextResponse.json({ error: "E-Mail und Passwort sind Pflicht für User-Account" }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail.trim().toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(userPassword.trim(), 12);

      const newUser = await prisma.user.create({
        data: {
          email: userEmail.trim().toLowerCase(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          password: hashedPassword,
          role: "PATIENT",
        },
      });
      createdUserId = newUser.id;
    }

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
        userId: createdUserId,
      },
    });

    return NextResponse.json({ 
      patient, 
      userCreated: !!createdUserId,
      userEmail: createdUserId ? userEmail.trim().toLowerCase() : null,
    }, { status: 201 });
  } catch (error) {
    console.error("Patient create error:", error);
    return NextResponse.json({ error: "Fehler beim Anlegen" }, { status: 500 });
  }
}
