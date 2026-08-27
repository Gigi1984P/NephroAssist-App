import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const hash = await hashToken(token);

    const link = await prisma.secureUploadLink.findFirst({
      where: {
        tokenHash: hash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!link || (link.maxUses && link.usesUsed >= link.maxUses)) {
      return NextResponse.json({ error: "Ungültiger oder abgelaufener Link" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Datei erforderlich" }, { status: 400 });
    }

    const UPLOAD_DIR = join(process.cwd(), "uploads");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const fileKey = `patients/${link.patientId}/${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileKey);

    await mkdir(join(UPLOAD_DIR, `patients/${link.patientId}`), { recursive: true });
    await writeFile(filePath, buffer);

    const document = await prisma.document.create({
      data: {
        patientId: link.patientId,
        organizationId: link.organizationId,
        uploadedBy: link.createdBy,
        fileKey,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        sha256,
        source: "CENTER_UPLOAD",
        processingStatus: "UPLOADED",
      },
    });

    await prisma.secureUploadLink.update({
      where: { id: link.id },
      data: { usesUsed: { increment: 1 } },
    });

    return NextResponse.json({ message: "Datei erfolgreich hochgeladen", documentId: document.id });
  } catch (error) {
    console.error("Secure upload error:", error);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
