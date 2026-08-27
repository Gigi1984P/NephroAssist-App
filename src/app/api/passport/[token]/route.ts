import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const passport = await prisma.transplantPassport.findFirst({
      where: {
        shareToken: tokenHash,
        shareExpiresAt: { gt: new Date() },
      },
    });

    if (!passport) {
      return NextResponse.json({ error: "Ungültiger oder abgelaufener Link" }, { status: 400 });
    }

    // Patient separat laden
    const patient = await prisma.patient.findUnique({
      where: { id: passport.patientId },
      select: {
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        email: true,
        phone: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Fall laden
    const patientCase = await prisma.patientCase.findUnique({
      where: { id: passport.caseId },
      include: {
        program: { select: { name: true, type: true } },
      },
    });

    // Requirements laden
    const requirements = await prisma.patientRequirement.findMany({
      where: { caseId: passport.caseId },
      select: {
        title: true,
        category: true,
        status: true,
        completedAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Dokumente laden
    const documents = await prisma.document.findMany({
      where: { patientId: passport.patientId, processingStatus: { in: ["ACCEPTED", "UPLOADED"] } },
      select: {
        filename: true,
        documentType: true,
        processingStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      patient,
      case: {
        programName: patientCase?.program?.name || "—",
        programType: patientCase?.program?.type || "—",
        status: patientCase?.status || "—",
        referralDate: patientCase?.referralDate?.toISOString() || null,
        waitlistedDate: patientCase?.waitlistedDate?.toISOString() || null,
      },
      requirements,
      documents,
    });
  } catch (error) {
    console.error("Passport fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
