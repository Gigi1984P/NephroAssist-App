import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const OCR_SERVER = process.env.OCR_SERVER_URL || "http://187.124.0.184:3001";
const OCR_API_KEY = process.env.OCR_API_KEY || "G1anlu1g1!";

/**
 * POST /api/documents/[id]/ocr
 * Sendet ein Dokument an den OCR-Server zur Klassifizierung und Extraktion.
 */
export async function POST(
  request: Request,
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
      include: { patient: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Dokument nicht gefunden" }, { status: 404 });
    }

    // Dokument-Pfad
    const fileUrl = `/api/documents/${id}/download`;

    // OCR-Server aufrufen
    const ocrResponse = await fetch(`${OCR_SERVER}/api/ocr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": OCR_API_KEY,
      },
      body: JSON.stringify({
        documentUrl: fileUrl,
        documentId: id,
        patientId: document.patientId,
      }),
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text().catch(() => "OCR-Fehler");
      return NextResponse.json(
        { error: "OCR-Verarbeitung fehlgeschlagen", details: errorText },
        { status: 502 }
      );
    }

    const ocrResult = await ocrResponse.json();

    // Ergebnis in DB speichern
    await prisma.aIProcessingLog.create({
      data: {
        documentId: id,
        provider: "plantone-ocr",
        model: ocrResult.model || "unknown",
        inputHash: ocrResult.hash || "",
        output: ocrResult,
        confidence: ocrResult.confidence || null,
      },
    });

    // Extrahierte Items speichern
    if (ocrResult.extractedItems && Array.isArray(ocrResult.extractedItems)) {
      for (const item of ocrResult.extractedItems) {
        await prisma.extractedDocumentItem.create({
          data: {
            documentId: id,
            itemType: item.type || "UNKNOWN",
            description: item.description || null,
            value: item.value || null,
            confidence: item.confidence || null,
          },
        });
      }
    }

    // Dokument-Status aktualisieren
    await prisma.document.update({
      where: { id },
      data: { classification: ocrResult.classification || null },
    });

    return NextResponse.json({
      success: true,
      extractedItems: ocrResult.extractedItems || [],
      confidence: ocrResult.confidence,
      classifications: ocrResult.classifications || [],
    });
  } catch (error) {
    console.error("OCR Processing Error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/[id]/ocr
 * Holt die OCR-Ergebnisse für ein Dokument.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;

    const logs = await prisma.aIProcessingLog.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    const items = await prisma.extractedDocumentItem.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      hasOcrResults: logs.length > 0,
      latestLog: logs[0] || null,
      extractedItems: items,
    });
  } catch (error) {
    console.error("OCR Fetch Error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
