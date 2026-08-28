import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Alle aktiven Blocker                                        */
/* ================================================================ */
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

    // Tenant isolation
    let orgFilter = {};
    if (user.role !== "ADMIN") {
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      });
      const orgIds = memberships.map((m) => m.organizationId);
      if (orgIds.length === 0) {
        return NextResponse.json({ blockers: [] });
      }
      orgFilter = { patientCase: { organizationId: { in: orgIds } } };
    }

    const blockers = await prisma.blocker.findMany({
      where: { status: "ACTIVE", ...orgFilter },
      include: {
        patientCase: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        requirement: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ blockers });
  } catch (error) {
    console.error("Blocker fetch error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

/* ================================================================ */
/*  POST: Neuen Blocker erstellen                                    */
/* ================================================================ */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const user = session.user;
    if (!CLINIC_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      caseId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      requirementId: z.string().uuid().optional(),
      type: z.enum([
        "MISSING_PRESCRIPTION",
        "NO_APPOINTMENT",
        "MISSING_DOCUMENT",
        "REJECTED_DOCUMENT",
        "PATIENT_NEEDS_HELP",
        "CLINIC_REVIEW_OVERDUE",
        "EXTERNAL_PROVIDER_DELAY",
        "EXPIRED_EXAMINATION",
        "OTHER",
      ]),
      description: z.string().min(1, "Beschreibung erforderlich"),
    });

    const data = schema.parse(body);

    // Falls patientId statt caseId: aktiven Case finden
    let caseId = data.caseId;
    if (!caseId && data.patientId) {
      const activeCase = await prisma.patientCase.findFirst({
        where: { patientId: data.patientId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (!activeCase) {
        return NextResponse.json({ error: "Patient hat keinen aktiven Fall" }, { status: 400 });
      }
      caseId = activeCase.id;
    }

    if (!caseId) {
      return NextResponse.json({ error: "caseId oder patientId erforderlich" }, { status: 400 });
    }

    const blocker = await prisma.blocker.create({
      data: {
        caseId,
        requirementId: data.requirementId || null,
        type: data.type,
        description: data.description,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ blocker });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Blocker create error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
