import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "toggle_admin") {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
      });

      if (!user) {
        return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
      }

      const newRole = user.role === "ADMIN" ? "PATIENT" : "ADMIN";

      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: { role: newRole },
      });

      return NextResponse.json({
        message: "Rolle geändert",
        user: updatedUser,
      });
    }

    return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren" },
      { status: 500 }
    );
  }
}
