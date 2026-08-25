import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Einzelnes TemplateSet mit Templates                         */
/* ================================================================ */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id } = await params;
    const set = await prisma.templateSet.findUnique({
      where: { id },
      include: {
        templates: {
          select: { id: true, name: true, category: true, required: true, listingBlocker: true },
        },
      },
    });

    if (!set) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    return NextResponse.json({ templateSet: set });
  } catch (error) {
    console.error("TemplateSet GET error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}

/* ================================================================ */
/*  PUT: TemplateSet aktualisieren (+ Version erhöhen)               */
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
      templateIds: z.array(z.string()).min(1, "Mindestens eine Untersuchung"),
    });
    const data = schema.parse(body);

    const current = await prisma.templateSet.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

    // Alte Verknüpfungen entfernen
    await prisma.requirementTemplate.updateMany({
      where: { templateSetId: id },
      data: { templateSetId: null },
    });

    // Neue Verknüpfungen setzen
    await prisma.requirementTemplate.updateMany({
      where: { id: { in: data.templateIds } },
      data: { templateSetId: id },
    });

    // Version erhöhen
    const updated = await prisma.templateSet.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        version: { increment: 1 },
      },
      include: {
        templates: { select: { id: true, name: true, category: true, required: true } },
      },
    });

    return NextResponse.json({ templateSet: updated, message: `Aktualisiert (v${updated.version})` });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    console.error("TemplateSet PUT error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

/* ================================================================ */
/*  DELETE: TemplateSet löschen (Templates bleiben erhalten)         */
/* ================================================================ */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const { id } = await params;

    // Verknüpfungen entfernen
    await prisma.requirementTemplate.updateMany({
      where: { templateSetId: id },
      data: { templateSetId: null },
    });

    await prisma.templateSet.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TemplateSet DELETE error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
