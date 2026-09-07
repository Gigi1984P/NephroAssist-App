import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createPageSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  content: z.string(),
  published: z.boolean().default(false),
  organizationId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const page = await prisma.cmsPage.findUnique({
        where: { slug },
        include: { organization: { select: { id: true, name: true } } },
      });
      if (!page) {
        return NextResponse.json({ error: "Seite nicht gefunden" }, { status: 404 });
      }
      return NextResponse.json({ page });
    }

    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    const pages = await prisma.cmsPage.findMany({
      where: isAdmin ? undefined : { published: true },
      orderBy: { updatedAt: "desc" },
      include: { organization: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("CMS pages GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createPageSchema.parse(body);

    const existing = await prisma.cmsPage.findUnique({
      where: { slug: validated.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug bereits vergeben" }, { status: 409 });
    }

    const page = await prisma.cmsPage.create({
      data: {
        slug: validated.slug,
        title: validated.title,
        content: validated.content,
        published: validated.published,
        createdBy: session.user.id,
        organizationId: validated.organizationId || null,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("CMS pages POST error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
