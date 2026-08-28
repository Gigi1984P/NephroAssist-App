import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const comments = await prisma.patientComment.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Comments error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const { content, mentions } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Inhalt fehlt" }, { status: 400 });
    }

    const comment = await prisma.patientComment.create({
      data: {
        patientId: id,
        authorId: session.user.id,
        authorName: session.user.name || session.user.email,
        authorRole: session.user.role,
        content: content.trim(),
        mentions: mentions || [],
        isInternal: true,
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Comment create error:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
