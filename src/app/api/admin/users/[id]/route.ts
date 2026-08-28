import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "toggle_admin") {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
      }

      const newRole = user.role === "ADMIN" ? "PATIENT" : "ADMIN";

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: newRole },
      });

      return NextResponse.json({
        message: "Rolle geändert",
        user: updatedUser,
      });
    }

    // Neue Aktionen
    if (action === "deactivate") {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Benutzer deaktiviert", user: updatedUser });
    }

    if (action === "activate") {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: true },
      });
      return NextResponse.json({ message: "Benutzer aktiviert", user: updatedUser });
    }

    // Vollständige Bearbeitung
    const { name, email, role, organizationId } = body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "Benutzer aktualisiert", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren" },
      { status: 500 }
    );
  }
}
