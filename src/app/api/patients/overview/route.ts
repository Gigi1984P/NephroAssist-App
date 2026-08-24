import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

/* ================================================================ */
/*  GET: Patienten mit Untersuchungen, Status + Dokumenten           */
/*  Fuer Klinik-Uebersicht                                            */
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

    // Patienten laden mit Cases, Tasks, Dokumenten
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        consentStatus: true,
        cases: {
          select: {
            id: true,
            requirements: {
              select: {
                id: true,
                title: true,
                category: true,
                status: true,
                tasks: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                    stepNumber: true,
                    stepName: true,
                    stepDescription: true,
                    isWorkflowStep: true,
                    metadata: true,
                    completedAt: true,
                  },
                  orderBy: { stepNumber: "asc" },
                },
              },
            },
          },
        },
      },
      orderBy: { lastName: "asc" },
      take: 50,
    });

    // Dokumente laden
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        patientId: true,
        filename: true,
        documentType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Daten aufbereiten
    const enriched = patients.map((patient) => {
      // Alle Untersuchungen (Requirements) sammeln
      const investigations = patient.cases.flatMap((c) =>
        c.requirements.map((req) => {
          const topLevelTask = req.tasks.find((t) => !t.isWorkflowStep);
          const workflowSteps = req.tasks.filter((t) => t.isWorkflowStep);
          const step6 = workflowSteps.find((s) => s.stepNumber === 6);
          
          return {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            status: req.status,
            topLevelTaskId: topLevelTask?.id || null,
            step6: step6 ? {
              id: step6.id,
              status: step6.status,
              name: step6.stepName,
              completedAt: step6.completedAt,
            } : null,
            steps: workflowSteps.map((s) => ({
              id: s.id,
              stepNumber: s.stepNumber,
              stepName: s.stepName,
              status: s.status,
            })),
          };
        })
      );

      // Dokumente des Patienten
      const patientDocs = documents.filter((d) => d.patientId === patient.id);

      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        consentStatus: patient.consentStatus,
        investigations,
        documents: patientDocs,
      };
    });

    return NextResponse.json({ patients: enriched });
  } catch (error) {
    console.error("Patients overview error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
