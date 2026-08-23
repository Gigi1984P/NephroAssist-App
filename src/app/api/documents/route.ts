import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, getAllowedPatientIds, patientScopeWhere } from "@/lib/permissions";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const allowedIds = await getAllowedPatientIds(user);
    const scope = patientScopeWhere(allowedIds, "patientId");

    const documents = await prisma.document.findMany({
      where: scope ? scope : {},
      orderBy: { createdAt: "desc" },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Dokumente" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Datei erforderlich" },
        { status: 400 }
      );
    }

    // Validierung
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Nur PDF, JPG und PNG erlaubt" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Datei zu groß (max. 10 MB)" },
        { status: 400 }
      );
    }

    // Datei speichern
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sha256 = createHash("sha256").update(buffer).digest("hex");

    const fileKey = `documents/${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileKey);

    await mkdir(join(UPLOAD_DIR, "documents"), { recursive: true });
    await writeFile(filePath, buffer);

    // Dokument in DB speichern (Fallback: patientId = user.id für Demo)
    const patientId = user.id;

    const document = await prisma.document.create({
      data: {
        patientId,
        organizationId: user.id,
        fileKey,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        sha256,
        documentType: file.type.split("/")[1].toUpperCase(),
        uploadedBy: user.id,
        source: "PATIENT_UPLOAD",
        processingStatus: "UPLOADED",
      },
    });

    return NextResponse.json({
      message: "Dokument erfolgreich hochgeladen",
      document: {
        id: document.id,
        filename: document.filename,
        size: document.size,
        mimeType: document.mimeType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload fehlgeschlagen" },
      { status: 500 }
    );
  }
}
