import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, getAllowedPatientIds } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const allowedIds = await getAllowedPatientIds(user);

    let whereClause: any = {
      status: { in: ["PENDING", "IN_PROGRESS"] },
    };

    // PATIENT/CAREGIVER: Nur eigene Tasks
    if (user.role === "PATIENT" || user.role === "CAREGIVER") {
      whereClause.OR = [
        { patientId: { in: allowedIds || [] } },
        { ownerId: user.id },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { isWorkflowStep: "desc" },
        { stepNumber: "asc" },
        { status: "asc" },
        { dueDate: "asc" },
      ],
      take: 100,
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
      { error: "Fehler beim Laden der Untersuchungen" },
      { status: 500 }
    );
  }
}
