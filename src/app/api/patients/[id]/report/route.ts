import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/patients/[id]/report
 * Generiert einen strukturierten Patienten-Report für PDF-Export.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Separate Queries für alle verwandten Daten
    const [
      medications,
      labValues,
      cases,
      dialysisRegimes,
      comments,
      documents,
      appointments,
      onboardingSteps,
    ] = await Promise.all([
      prisma.medication.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" } }),
      prisma.labValue.findMany({ where: { patientId: id }, orderBy: { testedAt: "desc" }, take: 20 }),
      prisma.patientCase.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" } }),
      prisma.dialysisRegime.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" } }),
      prisma.patientComment.findMany({
        where: { patientId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.document.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.appointment.findMany({ where: { patientId: id }, orderBy: { startTime: "desc" }, take: 10 }),
      prisma.patientOnboarding.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" } }),
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        consentStatus: patient.consentStatus,
        gpName: patient.generalPractitionerName,
        gpPhone: patient.generalPractitionerPhone,
        createdAt: patient.createdAt,
      },
      summary: {
        totalMedications: medications.length,
        totalLabValues: labValues.length,
        totalCases: cases.length,
        totalOnboardingSteps: onboardingSteps.length,
        totalDialysisRegimes: dialysisRegimes.length,
        totalDocuments: documents.length,
        totalAppointments: appointments.length,
      },
      medications: medications.map((m) => ({
        name: m.name,
        substance: m.substance,
        dose: m.dose,
        morning: m.morning,
        noon: m.noon,
        evening: m.evening,
        night: m.night,
        notes: m.notes,
      })),
      labValues: labValues.map((lv) => ({
        testType: lv.testType,
        value: lv.value,
        unit: lv.unit,
        referenceLow: lv.referenceLow,
        referenceHigh: lv.referenceHigh,
        testedAt: lv.testedAt,
      })),
      cases: cases.map((c) => ({
        status: c.status,
        referralDate: c.referralDate,
        intakeDate: c.intakeDate,
        readyForReviewDate: c.readyForReviewDate,
        boardDecisionDate: c.boardDecisionDate,
      })),
      dialysisRegimes: dialysisRegimes.map((dr) => ({
        procedure: dr.procedure,
        frequency: dr.frequency,
        duration: dr.duration,
        accessType: dr.accessType,
        targetWeight: dr.targetWeight,
      })),
      recentComments: comments.map((c: any) => ({
        content: c.content,
        authorName: c.authorName || "Unbekannt",
        createdAt: c.createdAt,
      })),
      upcomingAppointments: appointments
        .filter((a) => new Date(a.startTime) > new Date())
        .map((a) => ({
          type: a.type,
          startTime: a.startTime,
          location: a.location,
          status: a.status,
        })),
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error("PDF Report Error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
