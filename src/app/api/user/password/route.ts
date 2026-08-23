import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Aktuelles Passwort ist falsch" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_PASSWORD_CHANGE",
        entityType: "User",
        entityId: session.user.id,
        organizationId: (await prisma.organization.findFirst())?.id || "",
        metadata: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Fehler beim Ändern" }, { status: 500 });
  }
}
