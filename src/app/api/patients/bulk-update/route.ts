import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

export async function PUT(request: Request) {
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
    const { patientIds, caseStatus, coordinatorId, note } = body;

    if (!Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json({ error: "Mindestens ein Patient auswählen" }, { status: 400 });
    }

    const results = { updated: 0, failed: 0, errors: [] as string[] };

    for (const patientId of patientIds) {
      try {
        // Patient-Case finden und aktualisieren
        const patientCase = await prisma.patientCase.findFirst({
          where: { patientId },
          select: { id: true, organizationId: true },
        });

        if (!patientCase) {
          results.failed++;
          results.errors.push(`Kein Fall für Patient ${patientId}`);
          continue;
        }

        const updateData: any = {};
        if (caseStatus) updateData.status = caseStatus;
        if (coordinatorId) updateData.coordinatorId = coordinatorId;

        if (Object.keys(updateData).length > 0) {
          await prisma.patientCase.update({
            where: { id: patientCase.id },
            data: updateData,
          });
        }

        // Notiz als Timeline-Eintrag
        if (note) {
          await prisma.timelineEvent.create({
            data: {
              caseId: patientCase.id,
              eventType: "NOTE_ADDED",
              description: note,
            },
          });
        }

        // Audit Log
        await logAuditEvent({
          actorId: user.id,
          action: "BULK_PATIENT_UPDATE",
          entityType: "PATIENT",
          entityId: patientId,
          organizationId: patientCase.organizationId,
          metadata: { caseStatus, coordinatorId, hasNote: !!note },
        });

        results.updated++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(err.message || String(err));
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Fehler bei Massenbearbeitung" }, { status: 500 });
  }
}
