import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: List sent emails                                            */
/* ================================================================ */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId") || undefined;

    const where: any = {
      createdBy: user.id,
      status: "SENT",
    };

    if (patientId) {
      where.patientId = patientId;
    }

    const clinicRoles = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];
    if (clinicRoles.includes(user.role)) {
      const membership = await prisma.organizationMembership.findFirst({
        where: { userId: user.id },
        select: { organizationId: true },
      });
      if (membership) {
        where.organizationId = membership.organizationId;
      }
    }

    const emails = await prisma.emailMessage.findMany({
      where,
      orderBy: { sentAt: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        attachments: true,
      },
      take: 200,
    });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Get sent emails error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der gesendeten E-Mails" },
      { status: 500 }
    );
  }
}
