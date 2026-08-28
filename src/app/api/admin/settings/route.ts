import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Alle Einstellungen laden
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const configs = await prisma.systemConfig.findMany({
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error("Config load error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// Eine oder mehrere Einstellungen aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { configs } = body;

    if (!Array.isArray(configs)) {
      return NextResponse.json({ error: "Ungültiges Format" }, { status: 400 });
    }

    const results = [];
    for (const { key, value } of configs) {
      const existing = await prisma.systemConfig.findUnique({ where: { key } });
      if (existing) {
        const updated = await prisma.systemConfig.update({
          where: { key },
          data: { value: value === null ? null : String(value) },
        });
        results.push(updated);
      }
    }

    return NextResponse.json({ success: true, configs: results });
  } catch (error) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}

// Einzelne Einstellung per key
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    const existing = await prisma.systemConfig.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ error: "Einstellung nicht gefunden" }, { status: 404 });
    }

    const updated = await prisma.systemConfig.update({
      where: { key },
      data: { value: value === null ? null : String(value) },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
