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

    const allowedIds = await getAllowedPatientIds(user);
    const scope = patientScopeWhere(allowedIds, "patientId");

    const whereClause: any = {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      ...(scope || {}),
    };

    // PATIENT/CAREGIVER: Nur Tasks sehen wo sie owner sind ODER patientId passt
    if (user.role === "PATIENT" || user.role === "CAREGIVER") {
      whereClause.OR = [
        { patientId: { in: allowedIds || [] } },
        { ownerId: user.id },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
      ],
      take: 50,
      include: {
        requirement: {
          include: {
            patientCase: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Aufgaben" },
      { status: 500 }
    );
  }
}
