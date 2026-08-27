import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, getPatientWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

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
      createUserAccount,
      userEmail,
    } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "Vor- und Nachname sind Pflicht" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    // User-Account erstellen falls gewünscht
    let createdUserId: string | null = null;
    let generatedPassword = "";
    let finalUserEmail = "";

    if (createUserAccount) {
      const targetEmail = userEmail?.trim() || email?.trim();
      if (!targetEmail) {
        return NextResponse.json({ error: "E-Mail ist Pflicht für User-Account" }, { status: 400 });
      }

      // Prüfen ob E-Mail bereits existiert
      const existingUser = await prisma.user.findUnique({
        where: { email: targetEmail.toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 400 });
      }

      generatedPassword = generatePassword(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);

      const newUser = await prisma.user.create({
        data: {
          email: targetEmail.toLowerCase(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          password: hashedPassword,
          role: "PATIENT",
        },
      });
      createdUserId = newUser.id;
      finalUserEmail = targetEmail.toLowerCase();

      // E-Mail senden
      if (finalUserEmail && generatedPassword) {
        const emailPayload = getPatientWelcomeEmail(
          firstName.trim(),
          finalUserEmail,
          generatedPassword,
          dbUser?.name || undefined
        );
        await sendEmail({
          to: finalUserEmail,
          subject: emailPayload.subject,
          html: emailPayload.html,
          text: emailPayload.text,
        });
      }
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
      userEmail: finalUserEmail || null,
      password: generatedPassword || null,
    }, { status: 201 });
  } catch (error) {
    console.error("Patient create error:", error);
    return NextResponse.json({ error: "Fehler beim Anlegen" }, { status: 500 });
  }
}
