import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        generalPractitionerName: true,
        generalPractitionerEmail: true,
        generalPractitionerPhone: true,
      },
      orderBy: { lastName: "asc" },
      take: 50,
    });

    const documents = await prisma.document.findMany({
      select: {
        patientId: true,
        documentType: true,
        filename: true,
      },
    });

    const enriched = patients.map((patient) => {
      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        gpName: patient.generalPractitionerName,
        gpEmail: patient.generalPractitionerEmail,
        gpPhone: patient.generalPractitionerPhone,
      };
    });

    return NextResponse.json({ patients: enriched });
  } catch (error) {
    console.error("Patients overview error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
