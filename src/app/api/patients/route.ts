import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, getAllowedPatientIds, patientScopeWhere } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    // PATIENT und CAREGIVER sehen keine Patientenliste
    if (user.role === "PATIENT" || user.role === "CAREGIVER") {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }

    const allowedIds = await getAllowedPatientIds(user);
    const scope = patientScopeWhere(allowedIds);

    const patients = await prisma.patient.findMany({
      where: scope ? { id: scope["id"] } : {},
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        cases: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Get patients error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Patienten" },
      { status: 500 }
    );
  }
}
