import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Single email detail                                         */
/* ================================================================ */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const { id } = await params;

    const email = await prisma.emailMessage.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        case: { select: { id: true, status: true } },
        attachments: true,
      },
    });

    if (!email) {
      return NextResponse.json({ error: "E-Mail nicht gefunden" }, { status: 404 });
    }

    // Basic access control: creator or recipient
    if (email.createdBy !== user.id && email.toEmail !== user.email) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Get email detail error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der E-Mail" },
      { status: 500 }
    );
  }
}

/* ================================================================ */
/*  DELETE: Soft delete email                                        */
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

    const { user } = session;
    const { id } = await params;

    const existing = await prisma.emailMessage.findUnique({
      where: { id },
      select: { createdBy: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "E-Mail nicht gefunden" }, { status: 404 });
    }

    if (existing.createdBy !== user.id) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Soft delete by updating status
    const email = await prisma.emailMessage.update({
      where: { id },
      data: {
        status: "FAILED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("Delete email error:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen der E-Mail" },
      { status: 500 }
    );
  }
}
