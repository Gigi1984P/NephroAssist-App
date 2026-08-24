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
    });

    const data = schema.parse(body);

    const template = await prisma.requirementTemplate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Template update error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

/* ================================================================ */
/*  DELETE: Template löschen                                          */
/* ================================================================ */
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

    await prisma.requirementTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Template gelöscht" });
  } catch (error) {
    console.error("Template delete error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
