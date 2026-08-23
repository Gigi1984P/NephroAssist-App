import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userRole = session?.user?.role;

    if (!["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"].includes(userRole || "")) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
    }

    const patients = await prisma.patient.findMany({
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
