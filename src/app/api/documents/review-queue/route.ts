import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Dokumente die geprüft werden müssen
    const documents = await prisma.document.findMany({
      where: {
        processingStatus: { in: ["UPLOADED", "READY_FOR_REVIEW", "UNDER_REVIEW"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { firstName: true, lastName: true } },
      },
      take: 100,
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Review queue fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
