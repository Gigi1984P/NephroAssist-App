import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Verfuegbare Untersuchungs-Templates laden                   */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const userRole = user.role;

    // Nur Klinik-Mitarbeiter duerfen Templates sehen
    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];
    if (!clinicRoles.includes(userRole)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Alle Requirement Templates laden
    const templates = await prisma.requirementTemplate.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        required: true,
      },
      orderBy: { category: "asc" },
    });

    // Gruppiere nach Kategorie
    const grouped: Record<string, typeof templates> = {};
    templates.forEach((t) => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });

    return NextResponse.json({ templates, grouped });
  } catch (error) {
    console.error("Templates fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
