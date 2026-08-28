"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import MedicationPlan from "@/components/medication-plan";
import InlineAssignRequirement from "@/components/inline-assign-requirement";
import PatientRequirementsTable from "@/components/patient-requirements-table";
import AssignTemplateSet from "@/components/assign-template-set";
import DialysisRegime from "@/components/dialysis-regime";
import PatientStammdatenCard from "@/components/patient-stammdaten-card";
import HausarztInlineCard from "@/components/hausarzt-inline-card";
import {
  ArrowLeft, Calendar, User, Stethoscope, ClipboardList, Clock, Phone, Mail,
  AlertTriangle, CheckCircle, XCircle, AlertCircle, FileText, Bell, MessageCircle,
  ChevronRight, Activity, Circle, Pencil, Trash2, FileUp,
} from "lucide-react";
import ReadinessScoreBadge from "@/components/readiness-score-badge";
import LabValueTrend from "@/components/lab-value-trend";
import PatientOnboardingChecklist from "@/components/patient-onboarding-checklist";
import PatientCommentBox from "@/components/patient-comment-box";

export const dynamic = "force-dynamic";

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

function formatDate(dateStr: string | null | Date): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "—"; }
}

function formatDateTime(dateStr: string | null | Date): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

function getCaseStatusBadge(status: string | null) {
  const s = (status || "").toUpperCase();
  if (s === "ACTIVE") return { text: "Aktiv", variant: "success" };
  if (s === "ON_HOLD") return { text: "Pausiert", variant: "warning" };
  if (s === "CLOSED") return { text: "Abgeschlossen", variant: "secondary" };
  if (s === "ARCHIVED") return { text: "Archiviert", variant: "dark" };
  return { text: status || "—", variant: "secondary" };
}

export default function PatientClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [coordinatorName, setCoordinatorName] = useState("—");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadAllData(p.id);
    });
  }, [params]);

  const loadAllData = async (patientId: string) => {
    setLoading(true);
    setError("");

    try {
      // Load patient - Auth wird vom API-Handler geprüft
      const patientRes = await fetch(`/api/patients/${patientId}/edit`, { credentials: "include" });
      if (patientRes.status === 401 || patientRes.status === 403) {
        router.push("/dashboard");
        return;
      }
      if (!patientRes.ok) {
        if (patientRes.status === 404) setError("Patient nicht gefunden");
        else setError("Fehler beim Laden");
        setLoading(false);
        return;
      }
      const patientData = await patientRes.json();
      setPatient(patientData.patient);

      const latestCase = patientData.patient.cases?.[0] || null;
      if (latestCase?.coordinatorId) {
        try {
          // Try to load coordinator name from coordinators list
          // Since we don't have a direct endpoint, we'll try the overview
          const overviewRes = await fetch("/api/patients/overview", { credentials: "include" });
          if (overviewRes.ok) {
            const overview = await overviewRes.json();
            const coord = overview.coordinators?.find((c: any) => c.id === latestCase.coordinatorId);
            if (coord?.name) setCoordinatorName(coord.name);
          }
        } catch (e) { console.error("Coordinator load error:", e); }
      }

      // Parallel loads for other data
      const loadDocs = async () => {
        try {
          const res = await fetch(`/api/patients/${patientId}/documents`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setDocuments(data.documents || []);
          }
        } catch (e) { console.error("Docs load error:", e); }
      };

      const loadAppts = async () => {
        try {
          const res = await fetch(`/api/patients/${patientId}/appointments`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setAppointments(data.appointments || []);
          }
        } catch (e) { console.error("Appts load error:", e); }
      };

      const loadReqs = async () => {
        try {
          const res = await fetch(`/api/patients/${patientId}/requirements`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setRequirements(data.requirements || []);
          }
        } catch (e) { console.error("Reqs load error:", e); }
      };

      const loadMeds = async () => {
        try {
          const res = await fetch(`/api/patients/${patientId}/medications`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setMedications(data.medications || []);
          }
        } catch (e) { console.error("Meds load error:", e); }
      };

      await Promise.all([loadDocs(), loadAppts(), loadReqs(), loadMeds()]);
    } catch (e) {
      setError("Netzwerkfehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
        <p className="text-muted mt-2">Patientendaten werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
        <Link href="/dashboard/patients" className="btn btn-secondary">
          <ArrowLeft size={16} /> Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  if (!patient) return null;

  const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Unbekannt";
  const latestCase = patient.cases?.[0] || null;

  return (
    <div className="p-4">
      <PageHeader title={fullName} />

      <div className="mb-3">
        <Link href="/dashboard/patients" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} /> Zurück zur Übersicht
        </Link>
      </div>

      {/* STAMMDATEN - INLINE BEARBEITBAR */}
      <PatientStammdatenCard patientId={id} />

      {/* READINESS + LABORWERTE */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex align-items-center gap-2" style={{ background: "#f0fdf4", color: "#166534" }}>
              <Activity size={18} /> Transplantations-Readiness
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Basierend auf abgeschlossenen Untersuchungen
                </span>
                <a href={`/dashboard/patients/${id}/clinic`} className="btn btn-sm btn-outline-success">
                  Neu berechnen
                </a>
              </div>
              <ReadinessScoreBadge patientId={id} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex align-items-center gap-2" style={{ background: "#eff6ff", color: "#1e40af" }}>
              <Activity size={18} /> Laborwerte
            </div>
            <div className="card-body">
              <LabValueTrend patientId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* AKTUELLER FALL + HAUSARZT - INLINE */}
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

        <div className="col-lg-6">
          <HausarztInlineCard patientId={id} />
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

      {/* DOKUMENTE */}
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

      {/* ZEITSTRAHL */}
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

      {/* ONBOARDING + KOMMENTARE */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <PatientOnboardingChecklist patientId={id} />
        </div>
        <div className="col-lg-6">
          <PatientCommentBox patientId={id} />
        </div>
      </div>

      {/* AKTIONEN */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
          <Pencil size={18} /> Aktionen
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            <Link href={`/dashboard/patients/${id}/edit`} className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
              <Pencil size={14} /> Vollständig bearbeiten
            </Link>
            <Link href={`/dashboard/patients/${id}/documents/upload`} className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1">
              <FileUp size={14} /> Dokument hochladen
            </Link>
            <Link href={`/dashboard/patients/${id}/appointments/new`} className="btn btn-outline-info btn-sm d-inline-flex align-items-center gap-1">
              <Calendar size={14} /> Termin vereinbaren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
