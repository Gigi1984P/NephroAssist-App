import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Einzelnes TemplateSet MIT allen Versionen                   */
/* ================================================================ */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id } = await params;

    // Haupt-Set laden
    const current = await prisma.templateSet.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

    // Alle Versionen laden (sowohl Vorgänger als auch Nachfolger)
    const allVersions = await prisma.templateSet.findMany({
      where: {
        OR: [
          { id: current.parentId || "" },
          { parentId: id },
          { id: id },
          ...(current.parentId ? [
            { parentId: current.parentId },
            { id: current.parentId },
          ] : []),
        ],
      },
      orderBy: { version: "asc" },
      select: { id: true, version: true, createdAt: true, updatedAt: true, isLatest: true, items: true },
    });

    // Alle Versionen inkl. current zusammenführen
    const versionMap = new Map();
    versionMap.set(current.id, current);
    for (const v of allVersions) {
      versionMap.set(v.id, v);
    }

    const versions = Array.from(versionMap.values())
      .sort((a, b) => (a.version || 0) - (b.version || 0))
      .map((v) => ({
        ...v,
        items: (v.items as any[]) || [],
        itemCount: ((v.items as any[]) || []).length,
      }));

    return NextResponse.json({
      templateSet: {
        ...current,
        items: (current.items as any[]) || [],
        versions,
      },
    });
  } catch (error) {
    console.error("TemplateSet GET error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}

/* ================================================================ */
/*  PUT: Neue Version erstellen (altes bleibt erhalten)               */
/* ================================================================ */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const schema = z.object({
      name: z.string().min(1, "Name erforderlich"),
      description: z.string().optional(),
      items: z.array(z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        required: z.boolean().default(false),
        description: z.string().optional(),
      })).min(1, "Mindestens eine Untersuchung"),
      reason: z.string().optional(), // Optional: Grund für die neue Version
    });
    const data = schema.parse(body);

    // Aktuelles Set laden
    const current = await prisma.templateSet.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

    // Transaktion: Altes Set als nicht-aktuell markieren + neues erstellen
    const [_, newSet] = await prisma.$transaction([
      prisma.templateSet.update({
        where: { id },
        data: { isLatest: false },
      }),
      prisma.templateSet.create({
        data: {
          name: data.name,
          description: data.description || null,
          items: data.items as any,
          version: current.version + 1,
          isLatest: true,
          parentId: id,
          status: "PUBLISHED",
          createdBy: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      templateSet: newSet,
      message: `Neue Version v${newSet.version} erstellt`,
      previousVersion: current.version,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("TemplateSet PUT error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

/* ================================================================ */
/*  DELETE: TemplateSet + alle Versionen löschen                      */
/* ================================================================ */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id } = await params;

    const current = await prisma.templateSet.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

    // Alle verbundenen Versionen finden
    const allVersions = await prisma.templateSet.findMany({
      where: {
        OR: [
          { id },
          { parentId: id },
          ...(current.parentId ? [
            { parentId: current.parentId },
            { id: current.parentId },
          ] : []),
        ],
      },
      select: { id: true },
    });

    const ids = allVersions.map((v: any) => v.id);

    await prisma.templateSet.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error("TemplateSet DELETE error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
