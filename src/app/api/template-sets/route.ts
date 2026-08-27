import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Alle aktuellen TemplateSets (isLatest=true) + Versionen   */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    // Nur aktuelle Versionen laden
    const templateSets = await prisma.templateSet.findMany({
      where: { isLatest: true },
      orderBy: { updatedAt: "desc" },
      include: {
        parent: {
          select: { id: true, version: true, updatedAt: true },
        },
      },
    });

    // Für jedes Set: alle Versionen laden
    const parsed = await Promise.all(
      templateSets.map(async (set: any) => {
        const allVersions = await prisma.templateSet.findMany({
          where: {
            OR: [
              { id: set.id },
              { parentId: set.id },
              ...(set.parentId ? [{ parentId: set.parentId }, { id: set.parentId }] : []),
            ],
          },
          orderBy: { version: "asc" },
          select: { id: true, version: true, createdAt: true, updatedAt: true, items: true },
        });

        // items JSON parsen
        const versions = allVersions.map((v: any) => ({
          ...v,
          items: (v.items as any[]) || [],
          itemCount: ((v.items as any[]) || []).length,
        }));

        return {
          ...set,
          items: (set.items as any[]) || [],
          versions,
          versionCount: versions.length,
        };
      })
    );

    return NextResponse.json({ templateSets: parsed });
  } catch (error) {
    console.error("TemplateSets fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* ================================================================ */
/*  POST: Neues TemplateSet erstellen (Version 1)                    */
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
      items: z.array(z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        required: z.boolean().default(false),
        description: z.string().optional(),
      })).min(1, "Mindestens eine Untersuchung erforderlich"),
    });

    const data = schema.parse(body);

    const templateSet = await prisma.templateSet.create({
      data: {
        name: data.name,
        description: data.description || null,
        items: data.items as any,
        version: 1,
        isLatest: true,
        createdBy: session.user.id,
      },
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
