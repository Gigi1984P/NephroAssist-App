import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generateTempPassword(): string {
  return crypto.randomBytes(6).toString("hex").slice(0, 12);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return NextResponse.json({
      message: "Passwort zurückgesetzt",
      tempPassword,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Fehler beim Zurücksetzen" }, { status: 500 });
  }
}
