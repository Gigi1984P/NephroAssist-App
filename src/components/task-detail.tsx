"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";

interface WorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  status: string;
  metadata: any;
}

interface TaskDetailData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  isWorkflowStep: boolean;
  requirement: {
    title: string;
    description: string | null;
    category: string;
    patientCase: {
      patient: {
        firstName: string;
        lastName: string;
      };
    };
  } | null;
}

interface AppointmentData {
  date: string;
  time: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  doctorFax: string;
  location: string;
}

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"];

export default function TaskDetailPage({ task: initialTask }: { task: TaskDetailData }) {
  const [task] = useState<TaskDetailData>(initialTask);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Hausarzt-Email fuer Ueberweisungsbutton
  const [gpEmail, setGpEmail] = useState<string | null>(null);

  const [appointmentForms, setAppointmentForms] = useState<Record<string, AppointmentData>>({});

  useEffect(() => {
    // Lade User-Profil fuer Rollen-Check
    fetch("/api/user/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.role) {
          setUserRole(data.role);
        }
        setUserLoaded(true);
      })
      .catch(() => setUserLoaded(true));

    // Lade Hausarzt-Email wenn Patient
    fetch("/api/patients/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.patient?.generalPractitionerEmail) {
          setGpEmail(data.patient.generalPractitionerEmail);
        }
      })
      .catch(() => {});
  }, []);

  const loadWorkflowSteps = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/workflow`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const steps = data.steps || [];
        setWorkflowSteps(steps);
        const forms: Record<string, AppointmentData> = {};
        steps.forEach((s: WorkflowStep) => {
          if (s.metadata?.appointment) {
            forms[s.id] = s.metadata.appointment;
          }
        });
        setAppointmentForms(forms);
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflowSteps();
  }, [task.id]);

  const canEditClinicStep = (): boolean => {
    if (!userRole) return false;
    if (CLINIC_ROLES.includes(userRole)) return true;
    // DIALYSIS_STAFF nur wenn unabhaengig (parentOrganizationId = null)
    // Das kann hier nicht geprueft werden, API blockiert es
    if (userRole === "DIALYSIS_STAFF") return true; // API prueft genauer
    return false;
  };

  const handleStatusChange = async (stepId: string, newStatus: string) => {
    setUpdatingStepId(stepId);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${stepId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Aktualisieren");
        setUpdatingStepId(null);
        return;
      }
      await loadWorkflowSteps();
      setUpdatingStepId(null);
    } catch (err) {
      setError("Netzwerkfehler");
      setUpdatingStepId(null);
    }
  };

  const handleUpload = async (stepId: string, file: File) => {
    setUpdatingStepId(stepId);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${stepId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", notes: `Dokument hochgeladen: ${file.name}` }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Hochladen");
        setUpdatingStepId(null);
        return;
      }
      await loadWorkflowSteps();
      setUpdatingStepId(null);
    } catch (err) {
      setError("Netzwerkfehler beim Hochladen");
      setUpdatingStepId(null);
    }
  };

  const handleAppointmentSave = async (stepId: string) => {
    const form = appointmentForms[stepId];
    if (!form?.date || !form?.time || !form?.doctorName || !form?.location) {
      setError("Bitte Datum, Uhrzeit, Arztname und Ort ausfüllen");
      return;
    }
    setUpdatingStepId(stepId);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${stepId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          notes: `Termin vereinbart: ${form.date} ${form.time}, ${form.doctorName}${form.doctorPhone ? ", Tel: " + form.doctorPhone : ""}${form.doctorEmail ? ", Email: " + form.doctorEmail : ""}${form.doctorFax ? ", Fax: " + form.doctorFax : ""}, ${form.location}`,
          metadata: { appointment: form },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Speichern");
        setUpdatingStepId(null);
        return;
      }
      await loadWorkflowSteps();
      setUpdatingStepId(null);
    } catch (err) {
      setError("Netzwerkfehler");
      setUpdatingStepId(null);
    }
  };

  const handleReferralRequest = async (stepId: string) => {
    setUpdatingStepId(stepId);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${stepId}/referral`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Senden");
        setUpdatingStepId(null);
        return;
      }
      await loadWorkflowSteps();
      setUpdatingStepId(null);
      setMessage({ type: "success", text: `Überweisungsanfrage an ${data.practitionerEmail} gesendet` });
    } catch (err) {
      setError("Netzwerkfehler");
      setUpdatingStepId(null);
    }
  };

  const updateAppointmentField = (stepId: string, field: keyof AppointmentData, value: string) => {
    setAppointmentForms((prev) => ({
      ...prev,
      [stepId]: { ...(prev[stepId] || {}), [field]: value } as AppointmentData,
    }));
  };

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED") return <span className="badge bg-success">Erledigt</span>;
    if (status === "IN_PROGRESS") return <span className="badge bg-warning text-dark">In Bearbeitung</span>;
    return <span className="badge bg-secondary">Ausstehend</span>;
  };

  const completedSteps = workflowSteps.filter((s) => s.status === "COMPLETED").length;
  const progress = workflowSteps.length > 0 ? Math.round((completedSteps / workflowSteps.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={task.title}
        description={task.description || "Workflow bearbeiten"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Untersuchungen", href: "/dashboard/tasks" },
          { label: task.title },
        ]}
      />

      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><strong>Informationen</strong></div>
            <div className="card-body">
              <p><strong>Patient:</strong><br/>{task.requirement?.patientCase?.patient.firstName} {task.requirement?.patientCase?.patient.lastName}</p>
              <p><strong>Kategorie:</strong><br/>{task.requirement?.category || "—"}</p>
              <p className="mb-0"><strong>Fortschritt:</strong><br/>{completedSteps} / {workflowSteps.length} ({progress}%)</p>
              <div className="progress mt-2" style={{ height: "10px" }}>
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header"><strong>Workflow-Schritte</strong></div>
            <div className="card-body">
              {loading ? (
                <p className="text-muted">Laden...</p>
              ) : workflowSteps.length === 0 ? (
                <p className="text-muted">Keine Workflow-Schritte.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {workflowSteps.map((step) => {
                    const isCompleted = step.status === "COMPLETED";
                    const isActive = step.status === "IN_PROGRESS";
                    const isUploadStep = step.stepName.toLowerCase().includes("hochladen");
                    const isAppointmentStep = step.stepName.toLowerCase().includes("termin vereinbaren");
                    const isClinicReview = step.stepName.toLowerCase().includes("prüfung durch");
                    const existingAppointment = step.metadata?.appointment;

                    return (
                      <div
                        key={step.id}
                        className={`p-3 border rounded ${
                          isActive ? "border-primary border-2" : isCompleted ? "border-success" : ""
                        }`}
                        style={{ background: isCompleted ? "#f0f9f4" : isActive ? "#fff" : "#f8f9fa" }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong style={{ fontSize: "1.05rem" }}>
                              {step.stepNumber}. {step.stepName}
                            </strong>
                            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                              {step.stepDescription}
                            </p>
                          </div>
                          <div>{getStatusBadge(step.status)}</div>
                        </div>

                        {step.stepNumber === 1 ? (
                          /* SCHRITT 1: Ueberweisungsanfrage */
                          <div className="mt-2">
                            {/* Immer: Status-Dropdown fuer manuelle Bearbeitung */}
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <label className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Status:</label>
                              <select
                                className="form-select form-select-sm"
                                style={{ width: "auto", fontSize: "0.85rem" }}
                                value={step.status}
                                onChange={(e) => handleStatusChange(step.id, e.target.value)}
                                disabled={updatingStepId === step.id}
                              >
                                <option value="PENDING">Ausstehend</option>
                                <option value="IN_PROGRESS">In Bearbeitung</option>
                                <option value="COMPLETED">Erledigt</option>
                              </select>
                              {updatingStepId === step.id && (
                                <span className="spinner-border spinner-border-sm" role="status" />
                              )}
                            </div>

                            {/* Zusaetzlich: Email-Button wenn Hausarzt hinterlegt */}
                            {gpEmail && step.status !== "COMPLETED" && (
                              <div className="mt-2 p-2 border rounded bg-white">
                                <div className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
                                  Hausarzt: <strong>{gpEmail}</strong>
                                </div>
                                <button
                                  className="btn btn-primary btn-sm w-100"
                                  onClick={() => handleReferralRequest(step.id)}
                                  disabled={updatingStepId === step.id}
                                >
                                  {updatingStepId === step.id ? (
                                    <span className="spinner-border spinner-border-sm" role="status" />
                                  ) : (
                                    "📧 Überweisung per Email anfordern"
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Hinweis wenn kein Hausarzt hinterlegt */}
                            {!gpEmail && (
                              <div className="alert alert-info py-2 mb-0 mt-2" style={{ fontSize: "0.8rem" }}>
                                💡 <a href="/dashboard/settings" className="alert-link">Hausarzt hinterlegen</a> für automatische Email-Anfrage.
                                <br/>Sie können den Schritt auch manuell als erledigt markieren (z.B. nach telefonischer Anfrage).
                              </div>
                            )}
                          </div>
                        ) : isClinicReview ? (
                          <div className="mt-2">
                            {!userLoaded ? (
                              <span className="text-muted" style={{ fontSize: "0.85rem" }}>Lade Berechtigungen...</span>
                            ) : canEditClinicStep() ? (
                              /* Klinik-Mitarbeiter sehen Dropdown */
                              <div className="d-flex align-items-center gap-2">
                                <label className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Status:</label>
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: "auto", fontSize: "0.85rem" }}
                                  value={step.status}
                                  onChange={(e) => handleStatusChange(step.id, e.target.value)}
                                  disabled={updatingStepId === step.id}
                                >
                                  <option value="PENDING">Ausstehend</option>
                                  <option value="IN_PROGRESS">In Bearbeitung</option>
                                  <option value="COMPLETED">Erledigt</option>
                                </select>
                                {updatingStepId === step.id && (
                                  <span className="spinner-border spinner-border-sm" role="status" />
                                )}
                              </div>
                            ) : (
                              /* Patient/Pfleger sehen nur Info */
                              <div className="alert alert-info py-2 mb-0" style={{ fontSize: "0.85rem" }}>
                                🔒 <strong>Nur Klinik-Mitarbeiter</strong> können diesen Schritt bearbeiten.
                                <br/>
                                Ihre Rolle: <strong>{userRole || "Unbekannt"}</strong>
                              </div>
                            )}
                          </div>
                        ) : isAppointmentStep ? (
                          /* APPOINTMENT SCHRITT: Kalenderformular mit Facharzt-Kontaktdaten */
                          <div className="mt-3 p-3 bg-white border rounded">
                            <div className="fw-semibold mb-2" style={{ fontSize: "0.9rem", color: "#0d6efd" }}>
                              📅 Termin eintragen
                            </div>
                            
                            {existingAppointment ? (
                              <div className="alert alert-success py-2 mb-0">
                                <div className="fw-medium">Termin vereinbart:</div>
                                <div style={{ fontSize: "0.9rem" }}>
                                  📅 {existingAppointment.date} um {existingAppointment.time}<br/>
                                  👨‍⚕️ {existingAppointment.doctorName}
                                  {existingAppointment.doctorPhone && (
                                    <> · 📞 {existingAppointment.doctorPhone}</>
                                  )}
                                  {existingAppointment.doctorEmail && (
                                    <> · 📧 {existingAppointment.doctorEmail}</>
                                  )}
                                  {existingAppointment.doctorFax && (
                                    <> · 📠 {existingAppointment.doctorFax}</>
                                  )}
                                  <br/>
                                  📍 {existingAppointment.location}
                                </div>
                              </div>
                            ) : (
                              <div className="row g-2">
                                <div className="col-md-6">
                                  <label className="form-label mb-1" style={{ fontSize: "0.8rem" }}>Datum *</label>
                                  <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={appointmentForms[step.id]?.date || ""}
                                    onChange={(e) => updateAppointmentField(step.id, "date", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label mb-1" style={{ fontSize: "0.8rem" }}>Uhrzeit *</label>
                                  <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    value={appointmentForms[step.id]?.time || ""}
                                    onChange={(e) => updateAppointmentField(step.id, "time", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label mb-1" style={{ fontSize: "0.8rem" }}>Arztname *</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="z.B. Dr. Müller"
                                    value={appointmentForms[step.id]?.doctorName || ""}
                                    onChange={(e) => updateAppointmentField(step.id, "doctorName", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label mb-1" style={{ fontSize: "0.8rem" }}>E-Mail des Facharztes</label>
                                  <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    placeholder="z.B. dr.mueller@kardiologie.de"
                                    value={appointmentForms[step.id]?.doctorEmail || ""}
                                    onChange={(e) => updateAppointmentField(step.id, "doctorEmail", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label mb-1" style={{ fontSize: "0.8rem" }}>Telefon</label>
                                  <input
                                    type="tel"
                                    className="form-control form-control-sm"
                                    placeholder="z.B. 030 98765432"
                                    value={appointmentForms[step.id]?.doctorPhone || ""}
                                    onChange={(e) => updateAppointmentField(step.id, "doctorPhone", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label mb-1" style={{ fontSize: "0.8rem" }}>Fax</label>
                                  <input
                                    type="tel"
                                    className="form-control form-control-sm"
                                    placeholder="z.B. 030 98765433"
                                    value={appointmentForms[step.id]?.doctorFax || ""}
                                    onChange={(e) => updateAppointmentField(step.id, "doctorFax", e.target.value)}
                                  />
                                </div>
                                <div className="col-12">
                                  <label className="form-label mb-1" style={{ fontSize: "0.8rem" }}>Ort *</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="z.B. Uniklinik Musterstadt"
                                    value={appointmentForms[step.id]?.location || ""}
                                    onChange={(e) => updateAppointmentField(step.id, "location", e.target.value)}
                                  />
                                </div>
                                <div className="col-12">
                                  <button
                                    className="btn btn-primary btn-sm w-100"
                                    onClick={() => handleAppointmentSave(step.id)}
                                    disabled={updatingStepId === step.id}
                                  >
                                    {updatingStepId === step.id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      "✓ Termin speichern"
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : isUploadStep ? (
                          /* UPLOAD-SCHRITT: Datei hochladen */
                          <div className="mt-3 p-2 bg-white border rounded">
                            <label className="fw-semibold mb-2 d-block" style={{ fontSize: "0.9rem", color: "#0d6efd" }}>
                              📎 Dokument hochladen
                            </label>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="file"
                                className="form-control"
                                style={{ fontSize: "0.9rem" }}
                                disabled={updatingStepId === step.id || isCompleted}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpload(step.id, file);
                                }}
                              />
                              {updatingStepId === step.id && (
                                <span className="spinner-border spinner-border-sm" role="status" />
                              )}
                            </div>
                          </div>
                        ) : (
                          /* NORMALER SCHRITT: Dropdown */
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <label className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Status:</label>
                            <select
                              className="form-select form-select-sm"
                              style={{ width: "auto", fontSize: "0.85rem" }}
                              value={step.status}
                              onChange={(e) => handleStatusChange(step.id, e.target.value)}
                              disabled={updatingStepId === step.id}
                            >
                              <option value="PENDING">Ausstehend</option>
                              <option value="IN_PROGRESS">In Bearbeitung</option>
                              <option value="COMPLETED">Erledigt</option>
                            </select>
                            {updatingStepId === step.id && (
                              <span className="spinner-border spinner-border-sm" role="status" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
