import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  POST: Dokument reviewen (ACCEPTED / REJECTED / REQUEST_INFO)     */
/* ================================================================ */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Nur Klinik-Mitarbeiter" }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      status: z.enum(["ACCEPTED", "REJECTED", "REQUEST_INFO"]),
      rejectionReason: z.string().optional(),
      comment: z.string().optional(),
    });

    const data = schema.parse(body);

    // Dokument prüfen
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        processingStatus: true,
        patientId: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Dokument nicht gefunden" }, { status: 404 });
    }

    // Review erstellen
    const review = await prisma.documentReview.create({
      data: {
        documentId: id,
        reviewerId: user.id,
        status: data.status as any,
        rejectionReason: data.rejectionReason || null,
        comment: data.comment || null,
        reviewedAt: new Date(),
      },
    });

    // Dokument-Status aktualisieren
    const newProcessingStatus =
      data.status === "ACCEPTED"
        ? "ACCEPTED"
        : data.status === "REJECTED"
        ? "REJECTED"
        : "UNDER_REVIEW";

    await prisma.document.update({
      where: { id },
      data: { processingStatus: newProcessingStatus as any },
    });

    // Bei REJECTED: Blocker erstellen
    if (data.status === "REJECTED") {
      const patientReq = await prisma.patientRequirement.findFirst({
        where: {
          patientCase: { patientId: document.patientId },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, caseId: true },
      });

      if (patientReq) {
        await prisma.blocker.create({
          data: {
            caseId: patientReq.caseId,
            requirementId: patientReq.id,
            type: "REJECTED_DOCUMENT",
            description: data.rejectionReason || "Dokument wurde abgelehnt",
            status: "ACTIVE",
          },
        });
      }
    }

    return NextResponse.json({
      message: `Dokument ${data.status === "ACCEPTED" ? "akzeptiert" : data.status === "REJECTED" ? "abgelehnt" : "Rückfrage gestellt"}`,
      review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Document review error:", error);
    return NextResponse.json({ error: "Fehler beim Review" }, { status: 500 });
  }
}
