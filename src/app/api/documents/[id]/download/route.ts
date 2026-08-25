import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Dokument herunterladen (authentifiziert)                   */
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

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, userId: true } },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Dokument nicht gefunden" }, { status: 404 });
    }

    // Nur Patient selbst oder Klinik darf downloaden
    const isOwner = document.patient?.userId === session.user.id;
    const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(session.user.role);
    if (!isOwner && !isClinic) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const filePath = `${process.cwd()}/uploads/${document.fileKey}`;
    const file = await import("fs/promises").then((m) => m.readFile(filePath));

    return new NextResponse(file, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.filename)}"`,
      },
    });
  } catch (error) {
    console.error("Document download error:", error);
    return NextResponse.json({ error: "Fehler beim Herunterladen" }, { status: 500 });
  }
}
