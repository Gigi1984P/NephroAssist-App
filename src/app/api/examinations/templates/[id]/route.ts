import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  PUT: Template aktualisieren                                       */
/* ================================================================ */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1).optional(),
      category: z.string().min(1).optional(),
      description: z.string().optional(),
      required: z.boolean().optional(),
      listingBlocker: z.boolean().optional(),
      patientFriendlyDescription: z.string().optional(),
      validityDuration: z.number().optional(),
      renewalLeadTime: z.number().optional(),
    });

    const data = schema.parse(body);

    // Aktuelle Version holen
    const current = await prisma.requirementTemplate.findUnique({
      where: { id },
      select: { version: true },
    });

    const newVersion = (current?.version || 1) + 1;

    // Alte Version speichern
    await prisma.requirementTemplateVersion.create({
      data: {
        templateId: id,
        version: current?.version || 1,
        changes: "Automatische Versionierung durch Bearbeitung",
        publishedAt: new Date(),
        publishedBy: user.id,
      },
    });

    const template = await prisma.requirementTemplate.update({
      where: { id },
      data: {
        ...data,
        version: newVersion,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ template, message: `Aktualisiert (v${newVersion})` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Template update error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

/* ================================================================ */
/*  POST: Template veröffentlichen (Publish + Version)                */
/* ================================================================ */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { applyTo = "NEW_ONLY", changes } = body as { applyTo?: string; changes?: string };

    const template = await prisma.requirementTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "Template nicht gefunden" }, { status: 404 });
    }

    const newVersion = template.version + 1;

    // Neue Version in RequirementTemplateVersion speichern
    await prisma.requirementTemplateVersion.create({
      data: {
        templateId: id,
        version: template.version,
        changes: changes || null,
        publishedAt: new Date(),
        publishedBy: user.id,
        applyTo: applyTo as any,
      },
    });

    // Template aktualisieren
    const updated = await prisma.requirementTemplate.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        version: newVersion,
      },
    });

    return NextResponse.json({
      message: `Template veröffentlicht (v${newVersion})`,
      template: updated,
    });
  } catch (error) {
    console.error("Template publish error:", error);
    return NextResponse.json({ error: "Fehler beim Veröffentlichen" }, { status: 500 });
  }
}
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id } = await params;

    try {
      // Zugehörige RequirementDependencies entfernen (sonst FK-Constraint-Fehler)
      await prisma.requirementDependency.deleteMany({
        where: { OR: [{ templateId: id }, { prerequisiteId: id }] },
      });

      // TemplateSet-Referenz entfernen
      await prisma.requirementTemplate.updateMany({
        where: { id },
        data: { templateSetId: null },
      });

      // Zugehörige PatientRequirements entfernen
      await prisma.patientRequirement.deleteMany({
        where: { templateId: id },
      });

      // Versions werden automatisch gelöscht (onDelete: Cascade)
      await prisma.requirementTemplate.delete({
        where: { id },
      });

      return NextResponse.json({ message: "Template gelöscht" });
    } catch (dbError: any) {
      console.error("Template delete DB error:", dbError);
      return NextResponse.json({ error: dbError.message || "Datenbankfehler beim Löschen" }, { status: 500 });
    }
  } catch (error) {
    console.error("Template delete error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
