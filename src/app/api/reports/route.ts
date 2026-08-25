import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllowedPatientIds } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ================================================================ */
/*  GET: Klinik-Auswertungen / Kennzahlen                            */
/* ================================================================ */
export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    if (!CLINIC_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });

    const user = session.user;
    const allowedPatientIds = await getAllowedPatientIds({ ...user, role: user.role as any });

    const patientFilter = user.role === "ADMIN" || allowedPatientIds === null
      ? {}
      : allowedPatientIds.length > 0
        ? { id: { in: allowedPatientIds } }
        : { id: "" };

    // Alle Patienten mit Cases + Requirements + Dokumenten
    const patients = await prisma.patient.findMany({
      where: patientFilter,
      include: {
        cases: {
          include: {
            requirements: { select: { id: true, status: true, title: true, completedAt: true } },
          },
        },
        documents: { select: { id: true } },
      },
    });

    // Gesamt Patienten
    const totalPatients = patients.length;

    // Patienten mit allen abgeschlossenen Untersuchungen
    const patientsWithAllDone = patients.map((p) => {
      const allReqs = p.cases.flatMap((c) => c.requirements);
      const totalReqs = allReqs.length;
      const completedReqs = allReqs.filter(
        (r) => r.status === "ACCEPTED" || r.status === "WAIVED" || r.status === "NOT_APPLICABLE"
      ).length;
      return {
        ...p,
        totalReqs,
        completedReqs,
        allDone: totalReqs > 0 && totalReqs === completedReqs,
      };
    });

    const completedPatients = patientsWithAllDone.filter((p) => p.allDone);
    const completedCount = completedPatients.length;

    // Durchschnittliche Tage bis Abschluss (Proxy: createdAt bis updatedAt)
    let avgDaysToComplete = 0;
    if (completedPatients.length > 0) {
      const totalDays = completedPatients.reduce((sum, p) => {
        const days = (new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, days);
      }, 0);
      avgDaysToComplete = Math.round(totalDays / completedPatients.length);
    }

    // Ø Untersuchungen / Patient
    const totalReqsAll = patients.reduce((sum, p) => sum + p.cases.flatMap((c) => c.requirements).length, 0);
    const avgReqsPerPatient = totalPatients > 0 ? Math.round((totalReqsAll / totalPatients) * 10) / 10 : 0;

    // Ø Dokumente / Patient
    const totalDocs = patients.reduce((sum, p) => sum + p.documents.length, 0);
    const avgDocsPerPatient = totalPatients > 0 ? Math.round((totalDocs / totalPatients) * 10) / 10 : 0;

    // Abgeschlossene Cases
    const completedCases = patients.reduce((sum, p) => {
      return sum + p.cases.filter((c) => c.status === "APPROVED" || c.status === "READY_FOR_REVIEW").length;
    }, 0);

    // Offene Untersuchungen
    const openReqs = patients.reduce((sum, p) => {
      return sum + p.cases.flatMap((c) => c.requirements).filter(
        (r) => r.status !== "ACCEPTED" && r.status !== "WAIVED" && r.status !== "NOT_APPLICABLE"
      ).length;
    }, 0);

    return NextResponse.json({
      totalPatients,
      completedCount,
      avgDaysToComplete,
      avgReqsPerPatient,
      avgDocsPerPatient,
      completedCases,
      openReqs,
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Auswertungen" }, { status: 500 });
  }
}
