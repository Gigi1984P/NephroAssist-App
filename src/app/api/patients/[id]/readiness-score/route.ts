import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Berechnet den Transplant Readiness Score (0-100)
function calculateReadiness(
  requirements: { status: string; listingBlocker: boolean; expiresAt: Date | null; completedAt: Date | null }[]
): number {
  if (!requirements || requirements.length === 0) return 0;

  let score = 0;
  const total = requirements.length;
  const now = new Date();

  for (const req of requirements) {
    // Basis: Abgeschlossen = volle Punkte
    if (req.status === "ACCEPTED" || req.status === "WAIVED" || req.status === "NOT_APPLICABLE") {
      // Prüfe ob abgelaufen
      if (req.expiresAt && req.expiresAt < now) {
        score += 50;
      } else {
        score += 100;
      }
    } else if (req.status === "IN_PROGRESS" || req.status === "UNDER_REVIEW" || req.status === "WAITING_FOR_APPOINTMENT" || req.status === "WAITING_FOR_DOCUMENT" || req.status === "DOCUMENT_UPLOADED") {
      score += 50;
    } else if (req.status === "NOT_STARTED" || req.status === "ACTION_REQUIRED") {
      if (!req.listingBlocker) {
        score += 10;
      }
    }
  }

  return Math.round(score / total);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Hole alle Requirements des Patienten über Cases
    const cases = await prisma.patientCase.findMany({
      where: { patientId: id },
      select: { id: true },
    });
    const caseIds = cases.map((c) => c.id);

    const requirements = await prisma.patientRequirement.findMany({
      where: { caseId: { in: caseIds } },
      select: {
        status: true,
        listingBlocker: true,
        expiresAt: true,
        completedAt: true,
      },
    });

    const score = calculateReadiness(requirements);

    // Speichere Score
    await prisma.patient.update({
      where: { id },
      data: {
        readinessScore: score,
        readinessScoreAt: new Date(),
      },
    });

    return NextResponse.json({
      score,
      calculatedAt: new Date().toISOString(),
      totalRequirements: requirements.length,
      statusBreakdown: {
        completed: requirements.filter((r) => r.status === "ACCEPTED" || r.status === "WAIVED").length,
        inProgress: requirements.filter((r) => r.status === "IN_PROGRESS" || r.status === "UNDER_REVIEW").length,
        notStarted: requirements.filter((r) => r.status === "NOT_STARTED" || r.status === "ACTION_REQUIRED").length,
        expired: requirements.filter((r) => r.expiresAt && r.expiresAt < new Date()).length,
      },
    });
  } catch (error) {
    console.error("Readiness score error:", error);
    return NextResponse.json({ error: "Fehler beim Berechnen" }, { status: 500 });
  }
}
