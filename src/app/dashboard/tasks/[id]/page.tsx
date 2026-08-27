"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, Calendar, XCircle, ChevronRight, Lock, Upload, HelpCircle, X } from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  stepNumber: number | null;
  stepName: string | null;
  stepDescription: string | null;
  ownerType: string;
}

interface RequirementDetail {
  id: string;
  title: string;
  category: string;
  description: string | null;
  status: string;
  required: boolean;
  listingBlocker: boolean;
  expiresAt: string | null;
  completedAt: string | null;
  patientId: string | null;
  template: {
    name: string;
    category: string;
    description: string | null;
    required: boolean;
    listingBlocker: boolean;
    patientFriendlyDescription: string | null;
  } | null;
  patientCase: {
    patient: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  tasks: WorkflowStep[];
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: "Ausstehend", color: "#64748b", bg: "#f1f5f9", icon: Clock },
  IN_PROGRESS: { label: "In Bearbeitung", color: "#3b82f6", bg: "#eff6ff", icon: ChevronRight },
  COMPLETED: { label: "Erledigt", color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  BLOCKED: { label: "Blockiert", color: "#dc2626", bg: "#fef2f2", icon: XCircle },
  EXPIRED: { label: "Abgelaufen", color: "#ea580c", bg: "#fff7ed", icon: AlertTriangle },
};

function canEditStep(step: WorkflowStep): boolean {
  if (step.status === "COMPLETED" || step.status === "CANCELLED") return false;
  const owner = step.ownerType?.toUpperCase() || "";
  return owner === "PATIENT";
}

function isUploadStep(step: WorkflowStep): boolean {
  const name = (step.stepName || step.title || "").toLowerCase();
  return name.includes("hochladen") || name.includes("upload") || name.includes("befund");
}

function isAppointmentStep(step: WorkflowStep): boolean {
  const name = (step.stepName || step.title || "").toLowerCase();
  return name.includes("termin") || name.includes("vereinbaren") || name.includes("appointment");
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [requirement, setRequirement] = useState<RequirementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState("");
  const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Termin-Modal State
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentStepId, setAppointmentStepId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentProvider, setAppointmentProvider] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [savingAppointment, setSavingAppointment] = useState(false);

  // Hilfeanfrage Modal
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState("OTHER");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpSubmitting, setHelpSubmitting] = useState(false);
  const [helpSuccess, setHelpSuccess] = useState("");
  const [helpError, setHelpError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchRequirement();
  }, [id]);

  async function fetchRequirement() {
    try {
      setLoading(true);
      setError("");
      setUpdateError("");
      const res = await fetch(`/api/patient-requirements/${id}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Laden");
        setRequirement(null);
        return;
      }

      setRequirement(data.requirement);
    } catch (err) {
      setError("Netzwerkfehler");
      setRequirement(null);
    } finally {
      setLoading(false);
    }
  }

  async function markStepComplete(stepId: string) {
    try {
      setUpdatingStepId(stepId);
      setUpdateError("");
      const res = await fetch(`/api/tasks/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.error || "Fehler beim Aktualisieren");
        return;
      }
      await fetchRequirement();
    } catch {
      setUpdateError("Netzwerkfehler beim Aktualisieren");
    } finally {
      setUpdatingStepId(null);
    }
  }

  async function handleUpload(stepId: string, file: File) {
    if (!requirement?.patientId) {
      setUploadError("Kein Patient zugeordnet");
      return;
    }
    try {
      setUploadingStepId(stepId);
      setUploadError("");
      setUploadSuccess("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", requirement.patientId);
      formData.append("documentType", "EXAMINATION_RESULT");

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload fehlgeschlagen");
        return;
      }
      setUploadSuccess("Dokument erfolgreich hochgeladen!");
      // Upload-Step automatisch als erledigt markieren
      await markStepComplete(stepId);
      // Erfolgsmeldung nach 3 Sekunden ausblenden
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch {
      setUploadError("Netzwerkfehler beim Upload");
    } finally {
      setUploadingStepId(null);
    }
  }

  async function saveAppointment(stepId: string) {
    if (!requirement?.patientId) {
      setUpdateError("Kein Patient zugeordnet");
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      setUpdateError("Bitte Datum und Uhrzeit angeben");
      return;
    }
    try {
      setSavingAppointment(true);
      setUpdateError("");

      const startTime = new Date(`${appointmentDate}T${appointmentTime}`);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: requirement.patientId,
          type: requirement.title || "Untersuchung",
          provider: appointmentProvider,
          location: appointmentLocation,
          startTime: startTime.toISOString(),
          notes: appointmentNotes,
          relatedRequirementId: requirement.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.error || "Fehler beim Speichern");
        return;
      }
      // Termin-Step als erledigt markieren
      await markStepComplete(stepId);
      setShowAppointmentModal(false);
      // Felder zurücksetzen
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentLocation("");
      setAppointmentProvider("");
      setAppointmentNotes("");
    } catch {
      setUpdateError("Netzwerkfehler beim Speichern");
    } finally {
      setSavingAppointment(false);
    }
  }

  async function submitHelpRequest() {
    try {
      setHelpSubmitting(true);
      setHelpError("");
      setHelpSuccess("");
      const res = await fetch("/api/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: helpType,
          description: helpDescription.trim(),
          requirementId: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHelpError(data.error || "Fehler beim Erstellen");
        return;
      }
      setHelpSuccess("Hilfeanfrage erfolgreich gesendet!");
      setTimeout(() => {
        setShowHelpModal(false);
        setHelpSuccess("");
        setHelpDescription("");
        setHelpType("OTHER");
      }, 2000);
    } catch {
      setHelpError("Netzwerkfehler");
    } finally {
      setHelpSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
          <p className="text-muted mt-3">Untersuchung wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Fehler</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger btn-sm" onClick={() => router.push("/dashboard/tasks")}>
            ← Zurück zu Untersuchungen
          </button>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Untersuchung nicht gefunden</h4>
          <p>Die angeforderte Untersuchung existiert nicht oder Sie haben keine Berechtigung.</p>
          <hr />
          <button className="btn btn-outline-primary btn-sm" onClick={() => router.push("/dashboard/tasks")}>
            ← Zurück zu Untersuchungen
          </button>
        </div>
      </div>
    );
  }

  const displayTitle = requirement.template?.name || requirement.title || "Untersuchung";
  const patientName = requirement.patientCase?.patient
    ? `${requirement.patientCase.patient.firstName || ""} ${requirement.patientCase.patient.lastName || ""}`.trim()
    : "Patient";

  const sortedSteps = [...(requirement.tasks || [])].sort((a, b) => {
    const numA = a.stepNumber ?? 999;
    const numB = b.stepNumber ?? 999;
    return numA - numB;
  });

  const completedSteps = sortedSteps.filter((s) => s.status === "COMPLETED").length;
  const totalSteps = sortedSteps.length || 1;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const activeStepIndex = sortedSteps.findIndex((s) => s.status !== "COMPLETED");

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <Link href="/dashboard/tasks" className="text-decoration-none text-muted d-flex align-items-center gap-2 mb-2" style={{ fontSize: "0.9rem" }}>
            <ArrowLeft size={16} />
            Zurück zu Untersuchungen
          </Link>
          <PageHeader title={displayTitle} />
          <p className="text-muted mb-0">
            {requirement.template?.category || requirement.category || ""}
            {requirement.required && <span className="badge bg-danger ms-2">Pflicht</span>}
            {requirement.listingBlocker && <span className="badge bg-warning text-dark ms-2">Listing-Blocker</span>}
          </p>
        </div>
        <button
          className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
          onClick={() => {
            setShowHelpModal(true);
            setHelpError("");
            setHelpSuccess("");
            setHelpDescription("");
            setHelpType("OTHER");
          }}
        >
          <HelpCircle size={16} />
          Hilfe anfordern
        </button>
      </div>

      {/* Patient-Info */}
      <div className="card mb-4" style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
        <div className="card-body py-2 px-3">
          <small className="text-muted">Patient:</small>
          <span className="fw-medium ms-2">{patientName}</span>
        </div>
      </div>

      {/* Fehler / Erfolg */}
      {updateError && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {updateError}
          <button type="button" className="btn-close" onClick={() => setUpdateError("")} />
        </div>
      )}
      {uploadError && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {uploadError}
          <button type="button" className="btn-close" onClick={() => setUploadError("")} />
        </div>
      )}
      {uploadSuccess && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {uploadSuccess}
          <button type="button" className="btn-close" onClick={() => setUploadSuccess("")} />
        </div>
      )}

      {/* Fortschritt */}
      {sortedSteps.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">5-Schritte-Workflow</h5>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Fortschritt</span>
              <span className="fw-medium">{completedSteps} von {totalSteps} erledigt</span>
            </div>
            <div className="progress mb-4" style={{ height: "0.75rem" }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${progressPercent}%` }}
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {/* Workflow-Schritte */}
            <div className="list-group">
              {sortedSteps.map((step, index) => {
                const isCompleted = step.status === "COMPLETED";
                const isActive = index === activeStepIndex;
                const isLocked = index > activeStepIndex + 1 && activeStepIndex !== -1;
                const showActions = canEditStep(step) && !isLocked;
                const showUpload = showActions && isUploadStep(step);
                const showAppointment = showActions && isAppointmentStep(step);

                const meta = STATUS_META[step.status] || STATUS_META.PENDING;
                const IconComp = meta.icon;

                return (
                  <div
                    key={step.id}
                    className={`list-group-item d-flex align-items-start gap-3 py-3 ${
                      isActive ? "border-primary" : ""
                    }`}
                    style={{
                      borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                      background: isCompleted ? "#f8fafc" : isActive ? "#f0f7ff" : "#fff",
                    }}
                  >
                    {/* Step-Nummer */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "2rem",
                        height: "2rem",
                        background: isCompleted ? "#dcfce7" : isActive ? "#dbeafe" : "#f1f5f9",
                        color: isCompleted ? "#16a34a" : isActive ? "#3b82f6" : "#94a3b8",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {isCompleted ? <CheckCircle size={16} /> : isLocked ? <Lock size={14} /> : step.stepNumber || index + 1}
                    </div>

                    {/* Inhalt */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 fw-medium">
                          {step.stepName || step.title || `Schritt ${index + 1}`}
                        </h6>
                        <span
                          className="badge"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.color}30`,
                            fontSize: "0.7rem",
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>

                      {step.stepDescription && (
                        <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                          {step.stepDescription}
                        </p>
                      )}

                      {/* Zusätzliche Infos */}
                      <div className="d-flex flex-wrap gap-2 mt-2" style={{ fontSize: "0.75rem" }}>
                        {step.ownerType && (
                          <span className="text-muted">
                            Verantwortlich: {step.ownerType === "PATIENT" ? "Patient" : "Klinik"}
                          </span>
                        )}
                        {step.dueDate && (
                          <span className="text-muted">
                            <Calendar size={12} className="me-1" />
                            Fällig: {new Date(step.dueDate).toLocaleDateString("de-DE")}
                          </span>
                        )}
                        {step.completedAt && (
                          <span className="text-success">
                            <CheckCircle size={12} className="me-1" />
                            Erledigt: {new Date(step.completedAt).toLocaleDateString("de-DE")}
                          </span>
                        )}
                      </div>

                      {/* Aktionen */}
                      {showActions && (
                        <div className="mt-3">
                          {showUpload ? (
                            <div className="d-flex flex-column gap-2">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="d-none"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpload(step.id, file);
                                }}
                              />
                              <button
                                className="btn btn-primary btn-sm align-self-start"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingStepId === step.id}
                              >
                                {uploadingStepId === step.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                                    Wird hochgeladen...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={14} className="me-1" />
                                    Befund/Bericht hochladen
                                  </>
                                )}
                              </button>
                              <small className="text-muted">Erlaubt: PDF, JPG, PNG (max. 10 MB)</small>
                            </div>
                          ) : showAppointment ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setAppointmentStepId(step.id);
                                setShowAppointmentModal(true);
                              }}
                            >
                              <Calendar size={14} className="me-1" />
                              Termin eintragen
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => markStepComplete(step.id)}
                              disabled={updatingStepId === step.id}
                            >
                              {updatingStepId === step.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                                  Wird aktualisiert...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} className="me-1" />
                                  Als erledigt markieren
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Hinweis für gesperrte Schritte */}
                      {isLocked && (
                        <div className="mt-2 p-2 rounded" style={{ background: "#fef2f2", fontSize: "0.8rem" }}>
                          <Lock size={12} className="me-1 text-danger" />
                          Bitte schließen Sie zuerst Schritt {activeStepIndex + 1} ab.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Keine Tasks vorhanden */}
      {(!sortedSteps || sortedSteps.length === 0) && (
        <div className="alert alert-info">
          <h5 className="alert-heading">Keine Workflow-Schritte</h5>
          <p className="mb-0">Diese Untersuchung hat noch keine definierten Schritte.</p>
        </div>
      )}

      {/* Beschreibung */}
      {(requirement.template?.patientFriendlyDescription || requirement.template?.description || requirement.description) && (
        <div className="card mt-4">
          <div className="card-body">
            <h6 className="card-subtitle mb-2 text-muted">Beschreibung</h6>
            <p className="card-text">
              {requirement.template?.patientFriendlyDescription || requirement.template?.description || requirement.description}
            </p>
          </div>
        </div>
      )}
      {/* Termin-Modal */}
      {showAppointmentModal && (
        <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Termin eintragen</h5>
                <button type="button" className="btn-close" onClick={() => setShowAppointmentModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Datum *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Uhrzeit *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Arzt/Klinik</label>
                    <input
                      type="text"
                      className="form-control"
                      value={appointmentProvider}
                      onChange={(e) => setAppointmentProvider(e.target.value)}
                      placeholder="z.B. Dr. Müller"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ort</label>
                    <input
                      type="text"
                      className="form-control"
                      value={appointmentLocation}
                      onChange={(e) => setAppointmentLocation(e.target.value)}
                      placeholder="z.B. Uniklinik Frankfurt"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notizen</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      placeholder="z.B. Bitte Laborwerte mitbringen"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAppointmentModal(false)}>Abbrechen</button>
                <button
                  className="btn btn-primary"
                  onClick={() => saveAppointment(appointmentStepId)}
                  disabled={savingAppointment || !appointmentDate || !appointmentTime}
                >
                  {savingAppointment ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Calendar size={14} className="me-1" />
                      Termin speichern
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
