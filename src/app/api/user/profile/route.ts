import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { name, language, timezone } = updateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, updatedAt: new Date() },
      select: { id: true, email: true, name: true, role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_PROFILE_UPDATE",
        entityType: "User",
        entityId: session.user.id,
        organizationId: (await prisma.organization.findFirst())?.id || "",
        metadata: { fields: Object.keys(body) },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}
