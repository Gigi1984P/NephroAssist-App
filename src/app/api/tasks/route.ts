import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    const userRole = user.role;

    let whereClause: any = {
      status: { in: ["PENDING", "IN_PROGRESS"] },
    };

    // PATIENT: Nur eigene Aufgaben sehen
    if (userRole === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!patient) {
        return NextResponse.json({ tasks: [] });
      }
      whereClause = {
        ...whereClause,
        patientId: patient.id,
      };
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
