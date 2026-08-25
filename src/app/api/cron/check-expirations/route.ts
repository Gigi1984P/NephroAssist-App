import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Cron-Job — Ablaufprüfung für PatientRequirements             */
/*  Sollte täglich 1x aufgerufen werden (z.B. via Vercel Cron)     */
/* ================================================================ */
export async function GET(request: Request) {
  try {
    // Optional: Cron-Secret prüfen
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results = { expired: 0, renewalRequired: 0, notifications: 0 };

    // 1. Requirements die abgelaufen sind → EXPIRED
    const expiredReqs = await prisma.patientRequirement.findMany({
      where: {
        expiresAt: { lte: now },
        status: { notIn: ["EXPIRED", "RENEWAL_REQUIRED", "ACCEPTED", "WAIVED", "NOT_APPLICABLE"] },
      },
      include: {
        patientCase: {
          include: { patient: { include: { user: { select: { id: true } } } } },
        },
      },
    });

    for (const req of expiredReqs) {
      await prisma.patientRequirement.update({
        where: { id: req.id },
        data: { status: "EXPIRED" },
      });

      // Notification für Patient
      if (req.patientCase?.patient?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: req.patientCase.patient.user.id,
            organizationId: req.patientCase.patient.organizationId || "default",
            type: "RENEWAL",
            title: "Untersuchung abgelaufen",
            message: `Die Untersuchung "${req.title}" ist abgelaufen und muss erneuert werden.`,
            entityType: "PATIENT_REQUIREMENT",
            entityId: req.id,
          },
        });
        results.notifications++;
      }
      results.expired++;
    }

    // 2. Requirements die bald ablaufen (innerhalb renewalLeadTime) → RENEWAL_REQUIRED
    const renewalReqs = await prisma.patientRequirement.findMany({
      where: {
        expiresAt: { gt: now },
        status: { notIn: ["EXPIRED", "RENEWAL_REQUIRED", "ACCEPTED", "WAIVED", "NOT_APPLICABLE"] },
      },
      include: {
        template: { select: { renewalLeadTime: true } },
        patientCase: {
          include: { patient: { include: { user: { select: { id: true } } } } },
        },
      },
    });

    for (const req of renewalReqs) {
      const leadTimeMonths = req.template?.renewalLeadTime || 2;
      const leadTimeMs = leadTimeMonths * 30 * 24 * 60 * 60 * 1000;
      const warningDate = new Date(req.expiresAt!.getTime() - leadTimeMs);

      if (now >= warningDate) {
        await prisma.patientRequirement.update({
          where: { id: req.id },
          data: { status: "RENEWAL_REQUIRED" },
        });

        // Notification für Patient
        if (req.patientCase?.patient?.user?.id) {
          await prisma.notification.create({
            data: {
              userId: req.patientCase.patient.user.id,
              organizationId: req.patientCase.patient.organizationId || "default",
              type: "RENEWAL",
              title: "Erneuerung fällig",
              message: `Die Untersuchung "${req.title}" läuft in ${leadTimeMonths} Monaten ab. Bitte erneuern Sie sie rechtzeitig.`,
              entityType: "PATIENT_REQUIREMENT",
              entityId: req.id,
            },
          });
          results.notifications++;
        }
        results.renewalRequired++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron abgeschlossen: ${results.expired} abgelaufen, ${results.renewalRequired} erneuerungsfällig, ${results.notifications} Notifications erstellt`,
      results,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
