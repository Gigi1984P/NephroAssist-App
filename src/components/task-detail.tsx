"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CheckCircle, Clock, AlertCircle, Upload, FileText, Stethoscope, AlertTriangle, ChevronRight } from "lucide-react";

interface WorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  status: string;
  ownerType: string;
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

type UserRole = "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";

export default function TaskDetailPage({ task: initialTask }: { task: TaskDetailData }) {
  const router = useRouter();
  const [task] = useState<TaskDetailData>(initialTask);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflowSteps = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/workflow`);
      if (res.ok) {
        const data = await res.json();
        setWorkflowSteps(data.steps || []);
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || null);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    loadWorkflowSteps();
    loadProfile();
  }, [task.id]);

  const handleCompleteStep = async (stepId: string) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Aktualisieren");
        return;
      }

      await loadWorkflowSteps();
      setNotes("");
    } catch (err) {
      setError("Netzwerkfehler");
    } finally {
      setUpdating(false);
    }
  };

  // Bestimmt ob der aktuelle User einen Schritt erledigen darf
  const canUserCompleteStep = (step: WorkflowStep): boolean => {
    if (!userRole) return false;

    const stepName = step.stepName;
    const isUploadStep = stepName.includes("hochladen");
    const isClinicReview = stepName.includes("Prüfung durch");

    if (isClinicReview) {
      return ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"].includes(userRole);
    }

    // Upload + Status: Nur Patient/Caregiver
    return userRole === "PATIENT" || userRole === "CAREGIVER";
  };

  // Beschreibung der Aktion
  const getActionLabel = (step: WorkflowStep): string => {
    const stepName = step.stepName;
    if (stepName.includes("hochladen")) return "📎 Dokument hochladen";
    if (stepName.includes("Prüfung durch")) return "✓ Prüfen und bestätigen";
    return "✓ Als erledigt markieren";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { label: "Erledigt", color: "badge-green", icon: CheckCircle };
      case "IN_PROGRESS":
        return { label: "In Bearbeitung", color: "badge-yellow", icon: AlertCircle };
      case "PENDING":
        return { label: "Ausstehend", color: "badge-blue", icon: Clock };
      default:
        return { label: status, color: "badge-outline", icon: Clock };
    }
  };

  const getStepIcon = (stepNumber: number, status: string) => {
    if (status === "COMPLETED") return <CheckCircle size={20} className="text-success" />;
    if (status === "IN_PROGRESS") return <Clock size={20} className="text-warning" />;
    switch (stepNumber) {
      case 1: return <FileText size={20} className="text-muted" />;
      case 2: return <Upload size={20} className="text-muted" />;
      case 3: return <Stethoscope size={20} className="text-muted" />;
      case 6: return <AlertTriangle size={20} className="text-muted" />;
      default: return <ChevronRight size={20} className="text-muted" />;
    }
  };

  const currentStatus = getStatusConfig(task.status);
  const StatusIcon = currentStatus.icon;

  const completedSteps = workflowSteps.filter((s) => s.status === "COMPLETED").length;
  const progress = workflowSteps.length > 0 ? Math.round((completedSteps / workflowSteps.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Untersuchung"
        description="Details und Workflow"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Untersuchungen", href: "/dashboard/tasks" },
          { label: task.title },
        ]}
      />

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Left: Task Info */}
        <div className="col-lg-4">
          <div className="dashboard-card">
            <div className="card-header-custom">
              <span className="fw-semibold">Untersuchungs-Details</span>
              <span className={`badge-custom ${currentStatus.color}`}>
                <StatusIcon size={14} /> {currentStatus.label}
              </span>
            </div>
            <div className="card-body-custom">
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>Titel</label>
                <h5 className="fw-semibold mb-0">{task.title}</h5>
              </div>

              {task.description && (
                <div className="mb-3">
                  <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>Beschreibung</label>
                  <p className="mb-0" style={{ fontSize: "0.9rem" }}>{task.description}</p>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>Patient</label>
                <p className="mb-0 fw-medium" style={{ fontSize: "0.9rem" }}>
                  {task.requirement?.patientCase?.patient.firstName}{" "}
                  {task.requirement?.patientCase?.patient.lastName}
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>Kategorie</label>
                <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                  {task.requirement?.category || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Workflow Steps */}
        <div className="col-lg-8">
          <div className="dashboard-card">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Workflow-Schritte</span>
              {workflowSteps.length > 0 && (
                <span className="badge-custom badge-blue" style={{ fontSize: "0.75rem" }}>
                  {completedSteps} / {workflowSteps.length}
                </span>
              )}
            </div>

            <div className="card-body-custom">
              {loading ? (
                <div className="text-center text-muted py-4">Laden...</div>
              ) : workflowSteps.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <AlertCircle size={32} className="mb-2" />
                  <p>Keine Workflow-Schritte vorhanden.</p>
                </div>
              ) : (
                <div>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted" style={{ fontSize: "0.8rem" }}>Fortschritt</span>
                      <span className="fw-medium" style={{ fontSize: "0.8rem" }}>{progress}%</span>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="timeline-steps">
                    {workflowSteps.map((step, index) => {
                      const isCompleted = step.status === "COMPLETED";
                      const isActive = step.status === "IN_PROGRESS";
                      const userCanComplete = canUserCompleteStep(step);

                      return (
                        <div
                          key={step.id}
                          className={`timeline-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                        >
                          <div className="step-indicator">
                            <div className={`step-circle ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                              {getStepIcon(step.stepNumber, step.status)}
                            </div>
                            {index < workflowSteps.length - 1 && (
                              <div className={`step-line ${isCompleted ? "completed" : ""}`} />
                            )}
                          </div>
                          <div className="step-content">
                            <div className="d-flex align-items-start justify-content-between">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span className="step-number">{step.stepNumber}.</span>
                                  <span className="step-title">{step.stepName}</span>
                                </div>
                                <p className="step-desc mb-2">{step.stepDescription}</p>
                              </div>
                              <div className="ms-2 text-end">
                                <span className={`step-status ${isCompleted ? "done" : isActive ? "active" : ""}`}>
                                  {isCompleted ? "✓ Erledigt" : isActive ? "● Aktiv" : "○ Ausstehend"}
                                </span>
                              </div>
                            </div>

                            {/* Aktions-Buttons nur fuer aktive Schritte */}
                            {isActive && userCanComplete && (
                              <>
                                <div className="mb-2">
                                  <textarea
                                    className="form-control form-control-sm"
                                    placeholder="Optionaler Kommentar..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    style={{ fontSize: "0.85rem" }}
                                  />
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-primary step-action-btn"
                                  onClick={() => handleCompleteStep(step.id)}
                                  disabled={updating}
                                >
                                  {updating ? "Wird aktualisiert..." : getActionLabel(step)}
                                </button>
                              </>
                            )}

                            {/* Hinweis wenn Patient nicht handeln darf */}
                            {isActive && !userCanComplete && (
                              <div className="alert alert-info py-2 px-3 mt-2" style={{ fontSize: "0.8rem" }}>
                                {step.stepName.includes("Prüfung durch")
                                  ? "⏳ Warten auf Prüfung durch die Klinik..."
                                  : "⏳ Dieser Schritt ist für den Patienten vorgesehen."}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
