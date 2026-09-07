import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updatePageSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
  organizationId: z.string().optional().nullable(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updatePageSchema.parse(body);

    if (validated.slug) {
      const existing = await prisma.cmsPage.findFirst({
        where: { slug: validated.slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug bereits vergeben" }, { status: 409 });
      }
    }

    const page = await prisma.cmsPage.update({
      where: { id },
      data: {
        ...(validated.slug !== undefined && { slug: validated.slug }),
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.content !== undefined && { content: validated.content }),
        ...(validated.published !== undefined && { published: validated.published }),
        ...(validated.organizationId !== undefined && { organizationId: validated.organizationId }),
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("CMS pages PUT error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.cmsPage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CMS pages DELETE error:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
