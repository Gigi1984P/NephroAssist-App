import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Toggle 2FA für einen User
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { userId, enabled } = await request.json();

    if (!userId || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: enabled },
      select: { id: true, name: true, email: true, twoFactorEnabled: true },
    });

    return NextResponse.json({
      success: true,
      user,
      message: enabled
        ? "2-Faktor-Authentifizierung aktiviert"
        : "2-Faktor-Authentifizierung deaktiviert",
    });
  } catch (error) {
    console.error("2FA toggle error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
