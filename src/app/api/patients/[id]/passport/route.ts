import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const { id: patientId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        cases: {
          include: {
            program: { select: { name: true, type: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    if (!patient.cases[0]) {
      return NextResponse.json({ error: "Patient hat keinen aktiven Fall" }, { status: 400 });
    }

    const caseId = patient.cases[0].id;

    // Prüfen: User ist entweder Patient selbst oder Klinik
    const isPatient = user.role === "PATIENT" || user.role === "CAREGIVER";
    const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(user.role);

    if (!isPatient && !isClinic) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const { selectedCategories } = body;

    // Token generieren
    const token = crypto.randomUUID();
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 Tage gültig

    const passport = await prisma.transplantPassport.create({
      data: {
        patientId,
        caseId,
        shareToken: tokenHash,
        shareExpiresAt: expiresAt,
        selectedCategories: selectedCategories || [],
      },
    });

    // Audit Log
    await logAuditEvent({
      actorId: user.id,
      action: "PASSPORT_CREATED",
      entityType: "TRANSPLANT_PASSPORT",
      entityId: passport.id,
      organizationId: patient.organizationId || "system",
      metadata: { patientId, expiresAt: expiresAt.toISOString() },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://nephro-assist-app-pied.vercel.app"}/passport/${token}`;

    return NextResponse.json({
      passportId: passport.id,
      shareUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Passport create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
