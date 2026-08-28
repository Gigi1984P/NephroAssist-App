import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { RequirementStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const REMINDER_STAGES = [
  { daysBefore: 30, type: "t30", label: "30 Tage" },
  { daysBefore: 14, type: "t14", label: "14 Tage" },
  { daysBefore: 7, type: "t7", label: "7 Tage" },
  { daysBefore: 1, type: "t1", label: "1 Tag" },
];

export async function GET() {
  try {
    const now = new Date();
    const sentCount = { reminders: 0, escalations: 0 };

    // Stufen-Erinnerungen
    for (const stage of REMINDER_STAGES) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + stage.daysBefore);

      const reqs = await prisma.patientRequirement.findMany({
        where: {
          expiresAt: {
            gte: new Date(targetDate.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
          },
          status: { not: RequirementStatus.ACCEPTED },
        },
      });

      for (const req of reqs) {
        // Hole Patienten über Case
        const case_ = await prisma.patientCase.findUnique({
          where: { id: req.caseId },
          include: { patient: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });
        const patient = case_?.patient;
        if (!patient?.email) continue;

        const alreadySent = await prisma.reminderLog.findFirst({
          where: { patientId: patient.id, requirementId: req.id, reminderType: stage.type },
        });
        if (alreadySent) continue;

        const cfg = await prisma.systemConfig.findUnique({ where: { key: "EMAIL_TASK_ENABLED" } });
        if (cfg?.value !== "true") continue;

        await sendEmail({
          to: patient.email,
          subject: `⏰ Erinnerung: ${req.title} läuft in ${stage.label} ab`,
          html: `
            \u003ch2\u003eUntersuchung läuft bald ab\u003c/h2\u003e
            \u003cp\u003eHallo ${patient.firstName},\u003c/p\u003e
            \u003cp\u003eIhre Untersuchung \u003cstrong\u003e"${req.title}"\u003c/strong\u003e läuft in \u003cstrong\u003e${stage.label}\u003c/strong\u003e ab.\u003c/p\u003e
            \u003cp\u003eBitte reichen Sie rechtzeitig eine Erneuerung ein oder vereinbaren Sie einen Termin.\u003c/p\u003e
            \u003cp\u003e\u003ca href="https://nephro-assist-app-pied.vercel.app/dashboard/tasks"\u003eZur Übersicht →\u003c/a\u003e\u003c/p\u003e
          `,
        });

        await prisma.reminderLog.create({
          data: {
            patientId: patient.id,
            requirementId: req.id,
            reminderType: stage.type,
            channel: "email",
            status: "sent",
            recipient: patient.email,
          },
        });

        sentCount.reminders++;
      }
    }

    // Eskalation: Überfällige
    const overdue = await prisma.patientRequirement.findMany({
      where: { expiresAt: { lt: now }, status: { not: RequirementStatus.ACCEPTED } },
    });

    for (const req of overdue) {
      const case_ = await prisma.patientCase.findUnique({
        where: { id: req.caseId },
        include: { patient: { select: { id: true, firstName: true, lastName: true, email: true } } },
      });
      const patient = case_?.patient;
      if (!patient?.email) continue;

      const alreadyEscalated = await prisma.reminderLog.findFirst({
        where: { patientId: patient.id, requirementId: req.id, reminderType: "escalation" },
      });
      if (alreadyEscalated) continue;

      const cfg = await prisma.systemConfig.findUnique({ where: { key: "EMAIL_TASK_ENABLED" } });
      if (cfg?.value !== "true") continue;

      await sendEmail({
        to: patient.email,
        subject: `🚨 WICHTIG: ${req.title} ist überfällig`,
        html: `
          \u003ch2 style="color: #dc2626;"\u003eÜberfällige Untersuchung\u003c/h2\u003e
          \u003cp\u003eHallo ${patient.firstName},\u003c/p\u003e
          \u003cp\u003eIhre Untersuchung \u003cstrong\u003e"${req.title}"\u003c/strong\u003e ist \u003cstrong style="color: #dc2626;"\u003eüberfällig\u003c/strong\u003e.\u003c/p\u003e
          \u003cp\u003eBitte kontaktieren Sie uns umgehend unter support@nephroassist.de.\u003c/p\u003e
          \u003cp\u003e\u003ca href="https://nephro-assist-app-pied.vercel.app/dashboard/tasks"\u003eZur Übersicht →\u003c/a\u003e\u003c/p\u003e
        `,
      });

      await prisma.reminderLog.create({
        data: {
          patientId: patient.id,
          requirementId: req.id,
          reminderType: "escalation",
          channel: "email",
          status: "sent",
          recipient: patient.email,
        },
      });

      sentCount.escalations++;
    }

    return NextResponse.json({
      success: true,
      remindersSent: sentCount.reminders,
      escalationsSent: sentCount.escalations,
    });
  } catch (error) {
    console.error("Smart reminders error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
