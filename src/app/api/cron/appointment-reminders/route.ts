import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================================================================ */
/*  GET: Cron-Job — Termin-Erinnerungen                              */
/*  Sendet Notifications für Termine in 24h und 7 Tagen          */
/*  Sollte täglich 1x aufgerufen werden                             */
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
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const results = { tomorrow: 0, week: 0 };

    // 1. Termine morgen (innerhalb 24h)
    const tomorrowAppointments = await prisma.appointment.findMany({
      where: {
        startTime: { gte: now, lte: in24h },
        status: "PLANNED",
      },
      include: {
        patient: {
          include: { user: { select: { id: true } } },
        },
      },
    });

    for (const apt of tomorrowAppointments) {
      if (apt.patient?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: apt.patient.user.id,
            organizationId: apt.patient.organizationId || "default",
            type: "APPOINTMENT",
            title: "Termin morgen",
            message: `Sie haben morgen um ${new Date(apt.startTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr einen Termin: ${apt.type}${apt.location ? ` in ${apt.location}` : ""}.`,
            entityType: "APPOINTMENT",
            entityId: apt.id,
          },
        });
        results.tomorrow++;
      }
    }

    // 2. Termine in 7 Tagen (zwischen 6d 12h und 7d 12h, um Duplikate zu vermeiden)
    const weekStart = new Date(in7d.getTime() - 12 * 60 * 60 * 1000);
    const weekEnd = new Date(in7d.getTime() + 12 * 60 * 60 * 1000);
    const weekAppointments = await prisma.appointment.findMany({
      where: {
        startTime: { gte: weekStart, lte: weekEnd },
        status: "PLANNED",
      },
      include: {
        patient: {
          include: { user: { select: { id: true } } },
        },
      },
    });

    for (const apt of weekAppointments) {
      if (apt.patient?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: apt.patient.user.id,
            organizationId: apt.patient.organizationId || "default",
            type: "APPOINTMENT",
            title: "Termin in einer Woche",
            message: `Erinnerung: Sie haben am ${new Date(apt.startTime).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })} um ${new Date(apt.startTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr einen Termin: ${apt.type}.`,
            entityType: "APPOINTMENT",
            entityId: apt.id,
          },
        });
        results.week++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron abgeschlossen: ${results.tomorrow} morgen, ${results.week} in einer Woche`,
      results,
    });
  } catch (error) {
    console.error("Appointment reminder cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
