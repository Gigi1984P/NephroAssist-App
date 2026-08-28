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

    // Tenant isolation
    let orgFilter = {};
    if (user.role !== "ADMIN") {
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      });
      const orgIds = memberships.map((m) => m.organizationId);
      if (orgIds.length === 0) {
        return NextResponse.json({ documents: [] });
      }
      orgFilter = { organizationId: { in: orgIds } };
    }

    // Dokumente die geprüft werden müssen
    const documents = await prisma.document.findMany({
      where: {
        processingStatus: { in: ["UPLOADED", "READY_FOR_REVIEW", "UNDER_REVIEW"] },
        ...orgFilter,
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
