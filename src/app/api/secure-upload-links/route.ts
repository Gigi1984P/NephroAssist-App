import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const { patientId, documentType } = body;

    if (!patientId) {
      return NextResponse.json({ error: "Patient-ID erforderlich" }, { status: 400 });
    }

    const token = crypto.randomUUID();
    const tokenHash = await hashToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { organizationId: true },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    await prisma.secureUploadLink.create({
      data: {
        patientId,
        organizationId: patient.organizationId,
        documentType: documentType || undefined,
        tokenHash,
        expiresAt,
        maxUses: 1,
        usesUsed: 0,
        createdBy: user.id,
      },
    });

    const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://nephro-assist-app-pied.vercel.app"}/upload/${token}`;

    return NextResponse.json({
      link: uploadUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Secure upload link error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
