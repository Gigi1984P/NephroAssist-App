import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { sendEmail, getUploadNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const patientId = formData.get("patientId") as string;
    const documentType = formData.get("documentType") as string;

    if (!file || !patientId) {
      return NextResponse.json(
        { error: "Datei und Patient-ID erforderlich" },
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

    const fileKey = `patients/${patientId}/${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileKey);

    await mkdir(join(UPLOAD_DIR, `patients/${patientId}`), { recursive: true });
    await writeFile(filePath, buffer);

    // Dokument in DB speichern
    const document = await prisma.document.create({
      data: {
        patientId,
        organizationId: session.user.id, // TODO: Get from user's organization
        fileKey,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        sha256,
        documentType,
        uploadedBy: session.user.id,
        source: "PATIENT_UPLOAD",
        processingStatus: "UPLOADED",
      },
    });

    // E-Mail-Benachrichtigung senden
    const patient = await prisma.patient.findUnique({
      where: { id: document.patientId },
      select: { firstName: true, lastName: true, email: true },
    });
    if (patient?.email) {
      const emailData = getUploadNotificationEmail(`${patient.firstName} ${patient.lastName}`, document.filename);
      await sendEmail({ to: patient.email, ...emailData });
    }

    return NextResponse.json({
      message: "Dokument erfolgreich hochgeladen",
      documentId: document.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload fehlgeschlagen" },
      { status: 500 }
    );
  }
}
