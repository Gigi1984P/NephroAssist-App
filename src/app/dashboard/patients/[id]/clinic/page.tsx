"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  ArrowLeft, Calendar, User, Stethoscope, Building2, ClipboardList, Clock, Phone, Mail,
  AlertTriangle, CheckCircle, XCircle, AlertCircle, FileText, Bell, MessageCircle,
  ChevronRight, Activity, RefreshCw, Circle, Pencil, Trash2, Save, X,
} from "lucide-react";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  generalPractitionerName: string | null;
  generalPractitionerEmail: string | null;
  generalPractitionerPhone: string | null;
  generalPractitionerCity: string | null;
  user?: { email: string } | null;
  Organization?: { name: string } | null;
  cases: Array<{
    id: string; status: string; createdAt: string;
    referralDate: string | null; intakeDate: string | null;
    readyForReviewDate: string | null; boardDecisionDate: string | null;
    waitlistedDate: string | null; closedDate: string | null;
    closureReason: string | null; coordinatorId: string | null;
    program?: { name: string; type: string } | null;
  }>;
}

interface ReqItem {
  id: string; title: string; category: string; description: string | null;
  status: string; dueDate: string | null; expiresAt: string | null;
  completedAt: string | null; required: boolean; listingBlocker: boolean;
  responsibleRole: string; instructions: string | null; priority: number;
  template?: {
    name: string; category: string; required: boolean; listingBlocker: boolean;
  } | null;
  tasks: Array<{ id: string; title: string; status: string; dueDate: string | null }>;
}

interface DocItem {
  id: string; filename: string; documentType: string | null;
  processingStatus: string; createdAt: string;
}

interface AptItem {
  id: string; type: string; startTime: string; location: string | null; status: string;
}

interface BlkItem {
  id: string; type: string; description: string | null; createdAt: string;
  requirement?: { title: string } | null;
}

interface TlItem {
  id: string; description: string; eventType: string; createdAt: string;
}

interface HelpItem {
  id: string; type: string; status: string; description: string | null; createdAt: string;
}

interface TaskItem {
  id: string; title: string; status: string; dueDate: string | null; description: string | null;
}

interface PageData {
  patient: PatientData;
  documents: DocItem[];
  appointments: AptItem[];
  blockers: BlkItem[];
  timelineEvents: TlItem[];
  requirements: ReqItem[];
  helpRequests: HelpItem[];
  tasks: TaskItem[];
  coordinatorName: string;
}

interface ClinicPatientPageProps {
  params: { id: string };
}

function calcAge(dob: string | null): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function daysDiff(from: string | Date | null, to?: string | Date | null): number | null {
  if (!from) return null;
  const f = new Date(from);
  const t = to ? new Date(to) : new Date();
  return Math.floor((t.getTime() - f.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const CASE_STATUS_LABELS: Record<string, string> = {
  REFERRAL: "Überweisung", INTAKE: "Aufnahme", EVALUATION: "Evaluation",
  READY_FOR_REVIEW: "Bereit zur Prüfung", UNDER_REVIEW: "In Prüfung",
  DEFERRED: "Zurückgestellt", APPROVED: "Freigegeben", WAITLISTED: "Auf Warteliste",
  INACTIVE: "Inaktiv", TRANSPLANTED: "Transplantiert", CLOSED: "Abgeschlossen",
};

const CASE_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  REFERRAL: { bg: "#e2e8f0", text: "#475569" },
  INTAKE: { bg: "#dbeafe", text: "#1e40af" },
  EVALUATION: { bg: "#fef3c7", text: "#92400e" },
  READY_FOR_REVIEW: { bg: "#dcfce7", text: "#166534" },
  UNDER_REVIEW: { bg: "#dbeafe", text: "#1e40af" },
  DEFERRED: { bg: "#fee2e2", text: "#991b1b" },
  APPROVED: { bg: "#dcfce7", text: "#166534" },
  WAITLISTED: { bg: "#dcfce7", text: "#166534" },
  INACTIVE: { bg: "#e2e8f0", text: "#475569" },
  TRANSPLANTED: { bg: "#dcfce7", text: "#166534" },
  CLOSED: { bg: "#e2e8f0", text: "#475569" },
};

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  KIDNEY: "Niere", LIVER: "Leber", HEART: "Herz", LUNG: "Lunge", OTHER: "Sonstige",
};

const REQ_STATUS_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; priority: number }
> = {
  NOT_STARTED: { label: "Nicht gestartet", icon: <Circle size={14} />, color: "#94a3b8", priority: 5 },
  ACTION_REQUIRED: { label: "Aktion nötig", icon: <AlertCircle size={14} />, color: "#f97316", priority: 1 },
  IN_PROGRESS: { label: "In Bearbeitung", icon: <Activity size={14} />, color: "#3b82f6", priority: 4 },
  WAITING_FOR_APPOINTMENT: { label: "Warte auf Termin", icon: <Calendar size={14} />, color: "#f59e0b", priority: 3 },
  WAITING_FOR_DOCUMENT: { label: "Warte auf Dokument", icon: <FileText size={14} />, color: "#f59e0b", priority: 3 },
  DOCUMENT_UPLOADED: { label: "Dokument hochgeladen", icon: <FileText size={14} />, color: "#3b82f6", priority: 2 },
  UNDER_REVIEW: { label: "In Prüfung", icon: <Activity size={14} />, color: "#8b5cf6", priority: 2 },
  ACCEPTED: { label: "Akzeptiert", icon: <CheckCircle size={14} />, color: "#10b981", priority: 6 },
  REJECTED: { label: "Abgelehnt", icon: <XCircle size={14} />, color: "#ef4444", priority: 1 },
  BLOCKED: { label: "Blockiert", icon: <AlertTriangle size={14} />, color: "#dc2626", priority: 0 },
  EXPIRED: { label: "Abgelaufen", icon: <Clock size={14} />, color: "#dc2626", priority: 0 },
  RENEWAL_REQUIRED: { label: "Erneuerung nötig", icon: <RefreshCw size={14} />, color: "#f59e0b", priority: 1 },
  WAIVED: { label: "Entfallen", icon: <Circle size={14} />, color: "#94a3b8", priority: 7 },
  NOT_APPLICABLE: { label: "N/A", icon: <Circle size={14} />, color: "#94a3b8", priority: 7 },
};

const PROC_STATUS_LABELS: Record<string, string> = {
  UPLOADED: "Hochgeladen", SCANNING: "Scanning", PROCESSING: "Verarbeitung",
  READY_FOR_REVIEW: "Bereit zur Prüfung", UNDER_REVIEW: "In Prüfung",
  ACCEPTED: "Akzeptiert", REJECTED: "Abgelehnt", SUPERSEDED: "Ersetzt", EXPIRED: "Abgelaufen",
};

const PROC_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  UPLOADED: { bg: "#e2e8f0", text: "#475569", border: "#cbd5e1" },
  SCANNING: { bg: "#e2e8f0", text: "#475569", border: "#cbd5e1" },
  PROCESSING: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  READY_FOR_REVIEW: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  UNDER_REVIEW: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  ACCEPTED: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  SUPERSEDED: { bg: "#e2e8f0", text: "#475569", border: "#cbd5e1" },
  EXPIRED: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
};

function fmtDate(d: string | Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}

export default function ClinicPatientPage({ params }: ClinicPatientPageProps) {
  const router = useRouter();
  const { id } = params;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", email: "", phone: "",
    generalPractitionerName: "", generalPractitionerEmail: "", generalPractitionerPhone: "", generalPractitionerCity: "",
  });

  const loadPatient = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        const p = json.patient;
        setEditForm({
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "",
          email: p.email || "",
          phone: p.phone || "",
          generalPractitionerName: p.generalPractitionerName || "",
          generalPractitionerEmail: p.generalPractitionerEmail || "",
          generalPractitionerPhone: p.generalPractitionerPhone || "",
          generalPractitionerCity: p.generalPractitionerCity || "",
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadPatient(); }, [loadPatient]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        await loadPatient();
      } else {
        const err = await res.json();
        alert(err.error || "Fehler beim Speichern");
      }
    } catch { alert("Netzwerkfehler"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/patients");
      } else {
        const err = await res.json();
        alert(err.error || "Fehler beim Löschen");
        setShowDeleteModal(false);
      }
    } catch { alert("Netzwerkfehler"); setShowDeleteModal(false); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-4 text-center text-muted">Laden...</div>;
  if (!data) return <div className="p-4 text-center text-muted">Patient nicht gefunden.</div>;

  const patient = data.patient;
  const latestCase = patient.cases[0] || null;
  const age = calcAge(patient.dateOfBirth);
  const statusColor = latestCase ? CASE_STATUS_COLORS[latestCase.status] || { bg: "#e2e8f0", text: "#475569" } : { bg: "#e2e8f0", text: "#475569" };
  const waitlistStatus = latestCase?.status === "WAITLISTED"
    ? "Auf Warteliste"
    : latestCase?.waitlistedDate
      ? `Eingetragen am ${fmtDate(latestCase.waitlistedDate)}`
      : "Nicht eingetragen";
  const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");

  const { requirements, documents, appointments, blockers, timelineEvents, helpRequests, tasks, coordinatorName } = data;

  const completedReqs = requirements.filter((r) => r.status === "ACCEPTED" || r.status === "WAIVED" || r.status === "NOT_APPLICABLE");
  const openReqs = requirements.filter((r) => r.status !== "ACCEPTED" && r.status !== "WAIVED" && r.status !== "NOT_APPLICABLE");
  const listingBlockers = requirements.filter((r) => r.template?.listingBlocker && r.status !== "ACCEPTED" && r.status !== "WAIVED");

  const sortedReqs = [...requirements].sort((a, b) => {
    const pa = REQ_STATUS_META[a.status]?.priority ?? 5;
    const pb = REQ_STATUS_META[b.status]?.priority ?? 5;
    if (pa !== pb) return pa - pb;
    return (a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity) - (b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity);
  });

  const criticalReqs = sortedReqs.filter((r) => r.status === "BLOCKED" || r.status === "EXPIRED" || r.status === "REJECTED");
  const soonExpiring = sortedReqs.filter((r) => {
    if (!r.expiresAt || r.status === "ACCEPTED" || r.status === "WAIVED" || r.status === "NOT_APPLICABLE") return false;
    const days = daysDiff(new Date(), r.expiresAt);
    return days !== null && days >= 0 && days <= 30;
  });

  const upcomingAppts = appointments.filter((a) => new Date(a.startTime) > new Date());
  const reviewDocs = documents.filter((d) => d.processingStatus === "UNDER_REVIEW" || d.processingStatus === "READY_FOR_REVIEW");
  const openHelp = helpRequests.filter((h) => h.status === "OPEN");
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED");

  const readinessLabel = listingBlockers.length > 0
    ? "Nicht bereit"
    : openReqs.length > 0
      ? "Prüfung erforderlich"
      : "Bereit";
  const readinessColor = listingBlockers.length > 0 ? "#dc2626" : openReqs.length > 0 ? "#f59e0b" : "#10b981";

  return (
    <div>
      <PageHeader
        title="Patient & Fallstatus"
        description={`${patient.firstName} ${patient.lastName}`}
        action={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1" onClick={() => setShowEditModal(true)}>
              <Pencil size={14} /> Bearbeiten
            </button>
            <button className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={14} /> Löschen
            </button>
            <Link href="/dashboard/patients" className="btn-custom btn-outline-custom">
              <ArrowLeft size={16} /> Zurück
            </Link>
          </div>
        }
      />

      {/* === BEARBEITEN MODAL === */}
      {showEditModal && (
        <>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Patient bearbeiten</h5>
                  <button className="btn-close" onClick={() => setShowEditModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Vorname *</label>
                      <input type="text" className="form-control form-control-sm" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Nachname *</label>
                      <input type="text" className="form-control form-control-sm" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Geburtsdatum</label>
                      <input type="date" className="form-control form-control-sm" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Telefon</label>
                      <input type="tel" className="form-control form-control-sm" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">E-Mail</label>
                      <input type="email" className="form-control form-control-sm" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <hr className="my-2" />
                      <div className="fw-medium mb-2" style={{ fontSize: "0.9rem", color: "#3b82f6" }}>Hausarzt</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Name</label>
                      <input type="text" className="form-control form-control-sm" value={editForm.generalPractitionerName} onChange={(e) => setEditForm({ ...editForm, generalPractitionerName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Stadt</label>
                      <input type="text" className="form-control form-control-sm" value={editForm.generalPractitionerCity} onChange={(e) => setEditForm({ ...editForm, generalPractitionerCity: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">E-Mail</label>
                      <input type="email" className="form-control form-control-sm" value={editForm.generalPractitionerEmail} onChange={(e) => setEditForm({ ...editForm, generalPractitionerEmail: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Telefon</label>
                      <input type="tel" className="form-control form-control-sm" value={editForm.generalPractitionerPhone} onChange={(e) => setEditForm({ ...editForm, generalPractitionerPhone: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)} disabled={saving}>Abbrechen</button>
                  <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1" onClick={handleSave} disabled={saving}>
                    <Save size={14} /> {saving ? "Speichern..." : "Speichern"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* === LÖSCHEN MODAL === */}
      {showDeleteModal && (
        <>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-danger">
                  <h5 className="modal-title fw-bold text-danger">Patient löschen</h5>
                  <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
                </div>
                <div className="modal-body">
                  <p>Bist du sicher, dass du <strong>{patient.firstName} {patient.lastName}</strong> löschen möchtest?</p>
                  <div className="alert alert-warning" style={{ fontSize: "0.85rem" }}>
                    <strong>Achtung:</strong> Alle zugehörigen Daten werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteModal(false)} disabled={saving}>Abbrechen</button>
                  <button className="btn btn-danger btn-sm d-inline-flex align-items-center gap-1" onClick={handleDelete} disabled={saving}>
                    <Trash2 size={14} /> {saving ? "Löschen..." : "Ja, löschen"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* === PATIENT & FALLSTATUS === */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center justify-content-center fw-bold text-white"
              style={{ width: 64, height: 64, borderRadius: "50%", background: "#3b82f6", fontSize: "1.4rem" }}
            >{initials}</div>
            <div>
              <h2 className="h4 fw-bold mb-1">{patient.firstName} {patient.lastName}</h2>
              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                <span className="d-inline-flex align-items-center gap-1"><Mail size={14} /> {patient.email || patient.user?.email || "—"}</span>
                <span className="mx-2">·</span>
                <span className="d-inline-flex align-items-center gap-1"><Phone size={14} /> {patient.phone || "—"}</span>
              </div>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Calendar size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Geburtsdatum / Alter</div>
                  <div className="fw-medium">{patient.dateOfBirth ? `${fmtDate(patient.dateOfBirth)} (${age} Jahre)` : "—"}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <User size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Patienten-ID</div>
                  <div className="fw-medium" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{patient.id.slice(0, 8)}…</div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <ClipboardList size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Fall-ID</div>
                  <div className="fw-medium" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{latestCase ? `${latestCase.id.slice(0, 8)}…` : "Kein Fall"}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Building2 size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Dialysezentrum</div>
                  <div className="fw-medium">{patient.Organization?.name || "—"}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Stethoscope size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">zuständiger Coordinator</div>
                  <div className="fw-medium">{coordinatorName}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Stethoscope size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Transplantationsart</div>
                  <div className="fw-medium">
                    {latestCase?.program?.type ? PROGRAM_TYPE_LABELS[latestCase.program.type] || latestCase.program.type : "—"}
                    {latestCase?.program?.name ? ` (${latestCase.program.name})` : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <ClipboardList size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">aktueller Case-Status</div>
                  {latestCase ? (
                    <span className="badge" style={{ background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.bg}`, fontSize: "0.85rem", padding: "0.35rem 0.6rem" }}>
                      {CASE_STATUS_LABELS[latestCase.status] || latestCase.status}
                    </span>
                  ) : <div className="fw-medium">—</div>}
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Clock size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Wartelistenstatus</div>
                  <div className="fw-medium">{waitlistStatus}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Calendar size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Fall erstellt</div>
                  <div className="fw-medium">{latestCase ? fmtDate(latestCase.createdAt) : "—"}</div>
                </div>
              </div>
            </div>
            {patient.generalPractitionerName && (
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-2">
                  <Stethoscope size={18} style={{ color: "#64748b", marginTop: 2 }} />
                  <div>
                    <div className="text-muted small">Hausarzt</div>
                    <div className="fw-medium">{patient.generalPractitionerName}</div>
                    {patient.generalPractitionerCity && <div className="small text-muted">{patient.generalPractitionerCity}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">

          {/* === READINESS === */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom">
              <span className="fw-semibold d-flex align-items-center gap-2"><CheckCircle size={16} /> Readiness / Gesamtfortschritt</span>
              <span className="badge fw-bold" style={{ background: `${readinessColor}15`, color: readinessColor, border: `1px solid ${readinessColor}40`, fontSize: "0.9rem", padding: "0.35rem 0.6rem" }}>{readinessLabel}</span>
            </div>
            <div className="card-body-custom">
              <div className="row g-3 mb-3">
                <div className="col-md-4"><div className="text-center p-3 rounded" style={{ background: "#f0fdf4" }}><div className="h3 fw-bold mb-1" style={{ color: "#166534" }}>{completedReqs.length}</div><div className="small text-muted">erfüllt</div></div></div>
                <div className="col-md-4"><div className="text-center p-3 rounded" style={{ background: "#fef3c7" }}><div className="h3 fw-bold mb-1" style={{ color: "#92400e" }}>{openReqs.length}</div><div className="small text-muted">offen</div></div></div>
                <div className="col-md-4"><div className="text-center p-3 rounded" style={{ background: "#fee2e2" }}><div className="h3 fw-bold mb-1" style={{ color: "#991b1b" }}>{listingBlockers.length}</div><div className="small text-muted">Listing-Blocker</div></div></div>
              </div>
              {listingBlockers.length > 0 && (
                <div className="alert alert-danger d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
                  <AlertTriangle size={16} /> <strong>{listingBlockers.length} Listing-Blocker offen:</strong>{" "}
                  {listingBlockers.map((b) => b.template?.name).filter(Boolean).join(", ")}
                </div>
              )}
              <div className="small text-muted">
                {completedReqs.length} von {requirements.length} Anforderungen erfüllt
                {requirements.length > 0 && ` (${Math.round((completedReqs.length / requirements.length) * 100)}%)`}
              </div>
            </div>
          </div>

          {/* === BLOCKER === */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex align-items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              <span className="fw-semibold">Blocker & kritische Punkte</span>
              <span className="badge bg-danger">{criticalReqs.length + blockers.length}</span>
            </div>
            <div className="card-body-custom">
              {criticalReqs.length === 0 && blockers.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine kritischen Punkte.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {criticalReqs.map((req) => {
                    const meta = REQ_STATUS_META[req.status] || REQ_STATUS_META.NOT_STARTED;
                    const daysUntil = req.expiresAt ? daysDiff(new Date(), req.expiresAt) : null;
                    return (
                      <div key={req.id} className="p-3 rounded" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ color: meta.color }}>{meta.icon}</span>
                            <span className="fw-medium" style={{ fontSize: "0.9rem", color: "#991b1b" }}>{req.template?.name || req.title || "—"}</span>
                            {req.template?.listingBlocker && <span className="badge bg-danger" style={{ fontSize: "0.65rem" }}>Listing-Blocker</span>}
                          </div>
                          <span className="badge" style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}40`, fontSize: "0.75rem" }}>{meta.label}</span>
                        </div>
                        <div className="mt-1" style={{ fontSize: "0.8rem", color: "#b91c1c" }}>
                          {req.status === "EXPIRED" && daysUntil !== null
                            ? `Abgelaufen seit ${Math.abs(daysUntil)} Tagen`
                            : req.status === "BLOCKED"
                              ? "Blockiert — kann nicht fortgesetzt werden"
                              : req.status === "REJECTED"
                                ? "Abgelehnt — Nachbesserung erforderlich"
                                : req.description || req.instructions || ""}
                        </div>
                        {req.responsibleRole && <div className="mt-1" style={{ fontSize: "0.75rem", color: "#991b1b" }}><strong>Verantwortlich:</strong> {req.responsibleRole}</div>}
                      </div>
                    );
                  })}
                  {blockers.map((blocker) => (
                    <div key={blocker.id} className="p-3 rounded" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center gap-2">
                          <AlertTriangle size={16} className="text-danger" />
                          <span className="fw-medium" style={{ fontSize: "0.9rem", color: "#991b1b" }}>{blocker.type}</span>
                        </div>
                        <span className="badge bg-danger" style={{ fontSize: "0.65rem" }}>Blocker</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#b91c1c" }}>{blocker.description}</div>
                      {blocker.requirement?.title && <div style={{ fontSize: "0.75rem", color: "#991b1b" }}>Betrifft: {blocker.requirement.title}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* === NEXT BEST ACTIONS === */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex align-items-center gap-2">
              <ChevronRight size={16} style={{ color: "#3b82f6" }} />
              <span className="fw-semibold">Next Best Actions</span>
            </div>
            <div className="card-body-custom">
              {sortedReqs.filter((r) => r.status !== "ACCEPTED" && r.status !== "WAIVED" && r.status !== "NOT_APPLICABLE").length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Alle Anforderungen erfüllt. Keine offenen Actions.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {sortedReqs
                    .filter((r) => r.status !== "ACCEPTED" && r.status !== "WAIVED" && r.status !== "NOT_APPLICABLE")
                    .slice(0, 6)
                    .map((req) => {
                      const meta = REQ_STATUS_META[req.status] || REQ_STATUS_META.NOT_STARTED;
                      const days = req.expiresAt ? daysDiff(new Date(), req.expiresAt) : null;
                      return (
                        <div key={req.id} className="d-flex align-items-start gap-2 p-2 rounded" style={{ background: `${meta.color}08` }}>
                          <span style={{ color: meta.color, marginTop: 2 }}>{meta.icon}</span>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                              <span className="fw-medium" style={{ fontSize: "0.85rem" }}>{req.template?.name || req.title || "—"}</span>
                              <span className="badge" style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}40`, fontSize: "0.7rem" }}>{meta.label}</span>
                            </div>
                            <div className="d-flex gap-3 mt-1" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {days !== null && days < 0 && <span className="text-danger fw-medium">Überfällig seit {Math.abs(days)} Tagen</span>}
                              {days !== null && days >= 0 && days <= 30 && <span className="text-warning fw-medium">Läuft in {days} Tagen ab</span>}
                              {req.responsibleRole && <span>Verantwortlich: {req.responsibleRole}</span>}
                            </div>
                            <div className="mt-1" style={{ fontSize: "0.75rem", color: "#3b82f6" }}>
                              <strong>Nächste Aktion:</strong>{" "}
                              {req.status === "NOT_STARTED"
                                ? "Patient informieren und Termin vereinbaren"
                                : req.status === "WAITING_FOR_DOCUMENT"
                                  ? "Dokument vom Patienten anfordern"
                                  : req.status === "DOCUMENT_UPLOADED"
                                    ? "Dokument prüfen und freigeben"
                                    : req.status === "UNDER_REVIEW"
                                      ? "Prüfung abschließen"
                                      : req.status === "WAITING_FOR_APPOINTMENT"
                                        ? "Termin bestätigen"
                                        : req.status === "RENEWAL_REQUIRED"
                                          ? "Erneuerung einleiten"
                                          : req.instructions || req.description || "—"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* === ANFORDERUNGEN MATRIX === */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex align-items-center gap-2">
              <ClipboardList size={16} style={{ color: "#3b82f6" }} />
              <span className="fw-semibold">Anforderungen / Untersuchungen</span>
              <span className="badge bg-secondary">{requirements.length}</span>
            </div>
            <div className="card-body-custom p-0">
              {requirements.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine Anforderungen zugewiesen.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Name</th><th>Kategorie</th><th>Status</th><th>Befund/Info</th><th>Gültigkeit</th><th>Verantwortlich</th><th>Offene Tasks</th></tr>
                    </thead>
                    <tbody>
                      {sortedReqs.map((req) => {
                        const meta = REQ_STATUS_META[req.status] || REQ_STATUS_META.NOT_STARTED;
                        const days = req.expiresAt ? daysDiff(new Date(), req.expiresAt) : null;
                        return (
                          <tr key={req.id}>
                            <td className="fw-medium">
                              {req.template?.name || req.title || "—"}
                              {req.template?.listingBlocker && <span className="badge bg-danger ms-1" style={{ fontSize: "0.6rem" }}>Blocker</span>}
                            </td>
                            <td>{req.template?.category || req.category || "—"}</td>
                            <td><span className="badge" style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}40`, fontSize: "0.75rem" }}>{meta.label}</span></td>
                            <td>{req.description || req.instructions || "—"}</td>
                            <td>
                              {req.expiresAt ? (
                                <span className={days !== null && days < 0 ? "text-danger fw-medium" : days !== null && days <= 30 ? "text-warning fw-medium" : ""}>
                                  {fmtDate(req.expiresAt)}
                                  {days !== null && ` (${days < 0 ? "abgelaufen" : `noch ${days} Tage`})`}
                                </span>
                              ) : "—"}
                            </td>
                            <td>{req.responsibleRole || "—"}</td>
                            <td>{req.tasks.length > 0 ? <span className="badge bg-warning text-dark" style={{ fontSize: "0.7rem" }}>{req.tasks.length} Task{req.tasks.length !== 1 ? "s" : ""}</span> : <span className="text-muted small">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* === DOKUMENTE === */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2"><FileText size={16} style={{ color: "#8b5cf6" }} /> Dokumente & Review-Queue</span>
              {reviewDocs.length > 0 && <span className="badge bg-warning text-dark">{reviewDocs.length} zur Prüfung</span>}
            </div>
            <div className="card-body-custom">
              {documents.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine Dokumente.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {documents.map((doc) => {
                    const colors = PROC_STATUS_COLORS[doc.processingStatus] || PROC_STATUS_COLORS.UPLOADED;
                    return (
                      <div key={doc.id} className="d-flex align-items-center gap-3 p-2 rounded" style={{ background: "#f8fafc" }}>
                        <FileText size={18} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                        <div className="flex-grow-1">
                          <div className="fw-medium" style={{ fontSize: "0.85rem" }}>{doc.filename}</div>
                          <div className="d-flex gap-3" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            <span>{doc.documentType || "Dokument"}</span>
                            <span>Eingang: {fmtDate(doc.createdAt)}</span>
                          </div>
                        </div>
                        <span className="badge" style={{ fontSize: "0.7rem", background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>{PROC_STATUS_LABELS[doc.processingStatus] || doc.processingStatus}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* === TERMINE & FRISTEN === */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex align-items-center gap-2">
              <Calendar size={16} style={{ color: "#3b82f6" }} />
              <span className="fw-semibold">Termine & Fristen</span>
              {overdueTasks.length > 0 && <span className="badge bg-danger">{overdueTasks.length} überfällig</span>}
            </div>
            <div className="card-body-custom">
              {upcomingAppts.length === 0 && overdueTasks.length === 0 && soonExpiring.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine anstehenden Termine oder Fristen.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#fee2e2" }}>
                      <AlertTriangle size={16} className="text-danger" />
                      <div className="flex-grow-1">
                        <div className="fw-medium text-danger" style={{ fontSize: "0.85rem" }}>{task.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#991b1b" }}>Überfällig seit {fmtDate(task.dueDate)}</div>
                      </div>
                    </div>
                  ))}
                  {soonExpiring.map((req) => (
                    <div key={req.id} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#fef3c7" }}>
                      <Clock size={16} style={{ color: "#f59e0b" }} />
                      <div className="flex-grow-1">
                        <div className="fw-medium" style={{ fontSize: "0.85rem", color: "#92400e" }}>{req.template?.name || req.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#92400e" }}>Läuft ab am {fmtDate(req.expiresAt)}</div>
                      </div>
                      <span className="badge bg-warning text-dark" style={{ fontSize: "0.7rem" }}>Renewal</span>
                    </div>
                  ))}
                  {upcomingAppts.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#dbeafe" }}>
                      <Calendar size={16} style={{ color: "#3b82f6" }} />
                      <div className="flex-grow-1">
                        <div className="fw-medium" style={{ fontSize: "0.85rem" }}>{apt.type}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {new Date(apt.startTime).toLocaleString("de-DE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          {apt.location && ` · ${apt.location}`}
                        </div>
                      </div>
                      <span className="badge" style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", fontSize: "0.7rem" }}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* === KOMMUNIKATION === */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex align-items-center gap-2">
              <MessageCircle size={16} style={{ color: "#10b981" }} />
              <span className="fw-semibold">Kommunikation & Hilfe</span>
              {openHelp.length > 0 && <span className="badge bg-warning text-dark">{openHelp.length} offen</span>}
            </div>
            <div className="card-body-custom">
              {openHelp.length === 0 && !patient.phone ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine offenen Help Requests.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <div className="p-2 rounded mb-2" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <div className="fw-medium mb-1" style={{ fontSize: "0.85rem", color: "#166534" }}>Kontaktinformationen</div>
                    <div className="row g-2" style={{ fontSize: "0.8rem" }}>
                      <div className="col-md-4"><strong>Patient:</strong> {patient.phone || "—"}{patient.email && <span> · {patient.email}</span>}</div>
                      <div className="col-md-4"><strong>Dialysezentrum:</strong> {patient.Organization?.name || "—"}</div>
                      <div className="col-md-4"><strong>Coordinator:</strong> {coordinatorName}</div>
                    </div>
                  </div>
                  {openHelp.map((help) => (
                    <div key={help.id} className="d-flex align-items-start gap-2 p-2 rounded" style={{ background: "#fef3c7" }}>
                      <Bell size={16} style={{ color: "#f59e0b", marginTop: 2 }} />
                      <div className="flex-grow-1">
                        <div className="fw-medium" style={{ fontSize: "0.85rem", color: "#92400e" }}>{help.type}</div>
                        <div style={{ fontSize: "0.8rem", color: "#92400e" }}>{help.description}</div>
                        <div className="small text-muted">{fmtDate(help.createdAt)}</div>
                      </div>
                      <span className="badge bg-warning text-dark" style={{ fontSize: "0.7rem" }}>{help.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* === TIMELINE === */}
          <div className="dashboard-card">
            <div className="card-header-custom d-flex align-items-center gap-2">
              <Activity size={16} style={{ color: "#64748b" }} />
              <span className="fw-semibold">Timeline / Audit-Historie</span>
              <span className="badge bg-secondary">{timelineEvents.length}</span>
            </div>
            <div className="card-body-custom">
              {timelineEvents.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine Ereignisse.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {timelineEvents.map((event) => (
                    <div key={event.id} className="d-flex gap-3 align-items-start">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
                        <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 20 }} />
                      </div>
                      <div className="pb-2">
                        <div className="fw-medium" style={{ fontSize: "0.85rem" }}>{event.description}</div>
                        <div className="d-flex gap-2" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          <span>{event.eventType}</span><span>·</span><span>{new Date(event.createdAt).toLocaleString("de-DE")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Rechte Spalte: Fall-Historie */}
        <div className="col-lg-4">
          {latestCase && (
            <div className="dashboard-card">
              <div className="card-header-custom">
                <span className="fw-semibold d-flex align-items-center gap-2"><Calendar size={16} /> Fall-Historie</span>
              </div>
              <div className="card-body-custom">
                <div className="d-flex flex-column gap-3">
                  {latestCase.referralDate && (
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
                        <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 20 }} />
                      </div>
                      <div><div className="fw-medium" style={{ fontSize: "0.85rem" }}>Überweisung eingegangen</div><div className="small text-muted">{fmtDate(latestCase.referralDate)}</div></div>
                    </div>
                  )}
                  {latestCase.intakeDate && (
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
                        <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 20 }} />
                      </div>
                      <div><div className="fw-medium" style={{ fontSize: "0.85rem" }}>Aufnahme</div><div className="small text-muted">{fmtDate(latestCase.intakeDate)}</div></div>
                    </div>
                  )}
                  <div className="d-flex gap-2">
                    <div className="d-flex flex-column align-items-center">
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
                      <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 20 }} />
                    </div>
                    <div><div className="fw-medium" style={{ fontSize: "0.85rem" }}>Case eröffnet</div><div className="small text-muted">{fmtDate(latestCase.createdAt)}</div></div>
                  </div>
                  {latestCase.readyForReviewDate && (
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                        <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 20 }} />
                      </div>
                      <div><div className="fw-medium" style={{ fontSize: "0.85rem" }}>Bereit zur Prüfung</div><div className="small text-muted">{fmtDate(latestCase.readyForReviewDate)}</div></div>
                    </div>
                  )}
                  {latestCase.boardDecisionDate && (
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                        <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 20 }} />
                      </div>
                      <div><div className="fw-medium" style={{ fontSize: "0.85rem" }}>Board-Entscheidung</div><div className="small text-muted">{fmtDate(latestCase.boardDecisionDate)}</div></div>
                    </div>
                  )}
                  {latestCase.waitlistedDate && (
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                        <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 20 }} />
                      </div>
                      <div><div className="fw-medium" style={{ fontSize: "0.85rem" }}>Wartelisteneintrag</div><div className="small text-muted">{fmtDate(latestCase.waitlistedDate)}</div></div>
                    </div>
                  )}
                  {latestCase.closedDate && (
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                      </div>
                      <div><div className="fw-medium" style={{ fontSize: "0.85rem" }}>Abgeschlossen</div><div className="small text-muted">{fmtDate(latestCase.closedDate)}</div>{latestCase.closureReason && <div className="small text-muted">Grund: {latestCase.closureReason}</div>}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
