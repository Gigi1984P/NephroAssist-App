import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "PATIENT", "CAREGIVER", "DIALYSIS_STAFF"]),
  organizationId: z.string().optional(),
  roleId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-Mail bereits registriert" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
      },
    });

    // Organisation-Mitgliedschaft hinzufügen
    if (validated.organizationId && validated.roleId) {
      await prisma.organizationMembership.create({
        data: {
          userId: user.id,
          organizationId: validated.organizationId,
          roleId: validated.roleId,
        },
      });
    }

    return NextResponse.json(
      { message: "Benutzer erstellt", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen" },
      { status: 500 }
    );
  }
}
