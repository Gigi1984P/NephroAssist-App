import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const { id: patientId } = await params;

    // Patient finden + aktiver Case mit Requirements
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        cases: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            requirements: {
              orderBy: [
                { priority: "desc" },
                { status: "asc" },
                { dueDate: "asc" },
              ],
              include: {
                template: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    required: true,
                    listingBlocker: true,
                    patientFriendlyDescription: true,
                  },
                },
                tasks: {
                  select: { id: true, title: true, status: true, dueDate: true },
                  orderBy: { stepNumber: "asc" },
                  take: 5,
                },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    const requirements = patient.cases?.[0]?.requirements || [];

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Patient requirements GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
