import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import MedicationPlan from "@/components/medication-plan";
import InlineAssignRequirement from "@/components/inline-assign-requirement";
import PatientRequirementsTable from "@/components/patient-requirements-table";
import AssignTemplateSet from "@/components/assign-template-set";
import DialysisRegime from "@/components/dialysis-regime";
import {
  ArrowLeft, Calendar, User, Stethoscope, Building2, ClipboardList, Clock, Phone, Mail,
  AlertTriangle, CheckCircle, XCircle, AlertCircle, FileText, Bell, MessageCircle,
  ChevronRight, Activity, Circle, Pencil, Trash2, FileUp,
} from "lucide-react";

/* ================================================================== */
/*  SERVER COMPONENT – Patienten-Detailseite für Klinik               */
/* ================================================================== */

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

/* ------------------------------------------------------------------ */
/*  Hilfsfunktionen                                                    */
/* ------------------------------------------------------------------ */
function formatDate(dateStr: string | null | Date): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null | Date): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string | null) {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED" || s === "DONE") return { text: "Erledigt", variant: "success" };
  if (s === "IN_PROGRESS") return { text: "In Bearbeitung", variant: "warning" };
  if (s === "PENDING") return { text: "Ausstehend", variant: "secondary" };
  if (s === "BLOCKED" || s === "REJECTED") return { text: "Blockiert", variant: "danger" };
  return { text: status || "—", variant: "secondary" };
}

function getCaseStatusBadge(status: string | null) {
  const s = (status || "").toUpperCase();
  if (s === "ACTIVE") return { text: "Aktiv", variant: "success" };
  if (s === "ON_HOLD") return { text: "Pausiert", variant: "warning" };
  if (s === "CLOSED") return { text: "Abgeschlossen", variant: "secondary" };
  if (s === "ARCHIVED") return { text: "Archiviert", variant: "dark" };
  return { text: status || "—", variant: "secondary" };
}

/* ================================================================== */
/*  PAGE COMPONENT                                                    */
/* ================================================================== */
export default async function PatientClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  /* ---------------------------------------------------------------- */
  /*  AUTH                                                            */
  /* ---------------------------------------------------------------- */
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  if (!CLINIC_ROLES.includes(session.user.role)) {
    redirect("/dashboard");
  }

  /* ---------------------------------------------------------------- */
  /*  PATIENT DATEN                                                   */
  /* ---------------------------------------------------------------- */
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      Organization: { select: { name: true, id: true } },
      cases: {
        include: {
          program: { select: { name: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!patient) {
    notFound();
  }

  /* ---------------------------------------------------------------- */
  /*  ZUSATZDATEN                                                     */
  /* ---------------------------------------------------------------- */
  const [documents, appointments, blockers, timelineEvents, requirements, helpRequests, tasks, medications] = await Promise.all([
    prisma.document.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, filename: true, documentType: true, processingStatus: true, createdAt: true },
    }).catch(() => []),
    prisma.appointment.findMany({
      where: { patientId: id },
      orderBy: { startTime: "asc" },
      take: 10,
      select: { id: true, type: true, startTime: true, location: true, status: true },
    }).catch(() => []),
    prisma.blocker.findMany({
      where: { patientCase: { patientId: id } },
      include: { requirement: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
    prisma.timelineEvent.findMany({
      where: { patientCase: { patientId: id } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }).catch(() => []),
    prisma.patientRequirement.findMany({
      where: { patientCase: { patientId: id } },
      include: {
        tasks: { select: { id: true, status: true, title: true, stepNumber: true, ownerType: true } },
        template: { select: { name: true, category: true, patientFriendlyDescription: true } },
      },
      orderBy: { priority: "desc" },
    }).catch(() => []),
    prisma.helpRequest.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
    prisma.task.findMany({
      where: { patientId: id },
      orderBy: { dueDate: "asc" },
      take: 10,
      select: { id: true, title: true, status: true, dueDate: true, description: true },
    }).catch(() => []),
    prisma.medication.findMany({
      where: { patientId: id },
      orderBy: [{ substance: "asc" }, { name: "asc" }],
    }).catch(() => []),
  ]);

  // Coordinator Name
  let coordinatorName = "—";
  const latestCase = patient.cases[0];
  if (latestCase?.coordinatorId) {
    const coord = await prisma.user.findUnique({
      where: { id: latestCase.coordinatorId },
      select: { name: true },
    }).catch(() => null);
    if (coord?.name) coordinatorName = coord.name;
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;
  const age = patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <div className="p-4">
    <PageHeader title={fullName} />

    {/* Zurück-Button */}
    <div className="mb-3">
      <Link href="/dashboard/patients" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
        <ArrowLeft size={14} /> Zurück zur Übersicht
      </Link>
    </div>

      {/* PATIENTENSTAMMDATEN */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
          <User size={18} /> Patientenstammdaten
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Name</div>
                <div className="col-sm-8">{fullName}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Geburtsdatum</div>
                <div className="col-sm-8">{formatDate(patient.dateOfBirth)} {age !== null && `(${age} Jahre)`}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">E-Mail</div>
                <div className="col-sm-8">{patient.email || "—"}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Telefon</div>
                <div className="col-sm-8">{patient.phone || "—"}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Patient-ID</div>
                <div className="col-sm-8">
                  <code className="text-muted">{patient.id.substring(0, 8)}...</code>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Erstellt</div>
                <div className="col-sm-8">{formatDateTime(patient.createdAt)}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Letzte Aktualisierung</div>
                <div className="col-sm-8">{formatDateTime(patient.updatedAt)}</div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted fw-semibold">Klinik</div>
                <div className="col-sm-8">{patient.Organization?.name || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AKTUELLER FALL */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white d-flex align-items-center gap-2">
              <ClipboardList size={18} /> Aktueller Fall
            </div>
            <div className="card-body">
              {latestCase ? (
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Status</div>
                    <span className={`badge bg-${getCaseStatusBadge(latestCase.status).variant === "success" ? "success" : getCaseStatusBadge(latestCase.status).variant === "warning" ? "warning text-dark" : getCaseStatusBadge(latestCase.status).variant === "secondary" ? "secondary" : "dark"}`}>
                      {getCaseStatusBadge(latestCase.status).text}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Programm</div>
                    <div>{latestCase.program?.name || "—"}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Koordinator</div>
                    <div>{coordinatorName}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Fall erstellt</div>
                    <div>{formatDateTime(latestCase.createdAt)}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Einweisung</div>
                    <div>{formatDate(latestCase.referralDate)}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small fw-semibold">Aufnahme</div>
                    <div>{formatDate(latestCase.intakeDate)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-3">Kein aktiver Fall vorhanden</div>
              )}
            </div>
          </div>
        </div>

        {/* HAUSARZT */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-secondary text-white d-flex align-items-center gap-2">
              <Stethoscope size={18} /> Hausarzt
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold">Name</div>
                  <div>{patient.generalPractitionerName || "—"}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold">Stadt</div>
                  <div>{patient.generalPractitionerCity || "—"}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold">E-Mail</div>
                  <div>{patient.generalPractitionerEmail || "—"}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold">Telefon</div>
                  <div>{patient.generalPractitionerPhone || "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIKAMENTENPLAN */}
      <MedicationPlan patientId={id} initialMedications={medications} />

      {/* DIALYSEREGIME */}
      <DialysisRegime patientId={id} />

      {/* OFFENE UNTERSUCHUNGEN */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-warning text-dark d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList size={18} /> Offene Untersuchungen ({requirements.length})
          </div>
        </div>
        <div className="card-body p-3">
          <AssignTemplateSet patientId={id} />
          <InlineAssignRequirement patientId={id} />
          <PatientRequirementsTable patientId={id} requirements={requirements as any} />
        </div>
      </div>

      {/* EINGEREICHTE DOKUMENTE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-success text-white d-flex align-items-center gap-2">
          <FileText size={18} /> Eingereichte Dokumente ({documents.length})
        </div>
        <div className="card-body p-0">
          {documents.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Datei</th>
                    <th>Typ</th>
                    <th>Status</th>
                    <th>Hochgeladen</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.filename}</td>
                      <td>{doc.documentType || "—"}</td>
                      <td>
                        <span className="badge bg-secondary">{doc.processingStatus || "—"}</span>
                      </td>
                      <td>{formatDateTime(doc.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <FileUp size={32} className="mb-2" />
              <div>Noch keine Dokumente eingereicht</div>
            </div>
          )}
        </div>
      </div>

      {/* TERMINE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-info text-white d-flex align-items-center gap-2">
          <Calendar size={18} /> Termine ({appointments.length})
        </div>
        <div className="card-body p-0">
          {appointments.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Typ</th>
                    <th>Datum</th>
                    <th>Ort</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.type}</td>
                      <td>{formatDateTime(appt.startTime)}</td>
                      <td>{appt.location || "—"}</td>
                      <td>
                        <span className="badge bg-secondary">{appt.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <Calendar size={32} className="mb-2" />
              <div>Keine Termine vorhanden</div>
            </div>
          )}
        </div>
      </div>

      {/* ZEITSTRAHL / TIMELINE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white d-flex align-items-center gap-2">
          <Activity size={18} /> Aktivitäten-Zeitstrahl
        </div>
        <div className="card-body">
          {timelineEvents.length > 0 ? (
            <ul className="list-group list-group-flush">
              {timelineEvents.map((event) => (
                <li key={event.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-medium">{event.eventType}</div>
                    <div className="text-muted small">{event.description}</div>
                  </div>
                  <span className="text-muted small">{formatDateTime(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted py-3">Keine Aktivitäten protokolliert</div>
          )}
        </div>
      </div>

      {/* AKTIONEN */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
          <Pencil size={18} /> Aktionen
        </div>
        <div className="card-body d-flex gap-2">
          <Link href={`/dashboard/patients/${id}`} className="btn btn-outline-primary btn-sm">
            Bearbeiten
          </Link>
          <Link href={`/dashboard/patients/${id}`} className="btn btn-outline-danger btn-sm">
            Patient löschen
          </Link>
          <Link href="/dashboard/patients" className="btn btn-outline-secondary btn-sm">
            Zurück
          </Link>
        </div>
      </div>
    </div>
  );
}
