import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Alle TemplateSets + Templates                               */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const templateSets = await prisma.templateSet.findMany({
      include: {
        templates: {
          select: { id: true, name: true, category: true, required: true, listingBlocker: true },
          orderBy: { category: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const templates = await prisma.requirementTemplate.findMany({
      where: { templateSetId: null },
      select: {
        id: true, name: true, category: true, description: true,
        required: true, listingBlocker: true,
        validityDuration: true, renewalLeadTime: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ templateSets, templates });
  } catch (error) {
    console.error("TemplateSets fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* ================================================================ */
/*  POST: Neues TemplateSet erstellen                               */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1, "Name erforderlich"),
      description: z.string().optional(),
      templateIds: z.array(z.string()).min(1, "Mindestens eine Untersuchung auswählen"),
    });

    const data = schema.parse(body);

    const templateSet = await prisma.templateSet.create({
      data: {
        name: data.name,
        description: data.description || null,
        createdBy: session.user.id,
      },
    });

    // Templates dem Set zuweisen
    await prisma.requirementTemplate.updateMany({
      where: { id: { in: data.templateIds } },
      data: { templateSetId: templateSet.id },
    });

    return NextResponse.json({ templateSet }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("TemplateSet create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
