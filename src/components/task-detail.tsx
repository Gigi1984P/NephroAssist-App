"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CheckCircle, Clock, AlertCircle, Upload, ArrowRight, ChevronDown } from "lucide-react";

interface WorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  status: string;
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

export default function TaskDetailPage({ task: initialTask }: { task: TaskDetailData }) {
  const [task] = useState<TaskDetailData>(initialTask);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

  const loadWorkflowSteps = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/workflow`);
      if (res.ok) {
        const data = await res.json();
        setWorkflowSteps(data.steps || []);
      } else {
        console.error("Workflow API error:", res.status);
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

  const handleStatusChange = async (stepId: string, newStatus: string) => {
    if (newStatus === "no-change") return;
    
    setUpdatingStepId(stepId);
    setError(null);
    
    try {
      const res = await fetch(`/api/tasks/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Aktualisieren");
        return;
      }

      // Reload workflow steps
      await loadWorkflowSteps();
    } catch (err) {
      setError("Netzwerkfehler");
    } finally {
      setUpdatingStepId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="badge-custom badge-green"><CheckCircle size={12} /> Erledigt</span>;
      case "IN_PROGRESS":
        return <span className="badge-custom badge-yellow"><Clock size={12} /> In Bearbeitung</span>;
      case "PENDING":
        return <span className="badge-custom badge-blue"><AlertCircle size={12} /> Ausstehend</span>;
      default:
        return <span className="badge-custom badge-outline">{status}</span>;
    }
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
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="dashboard-card">
            <div className="card-header-custom">
              <span className="fw-semibold">Informationen</span>
            </div>
            <div className="card-body-custom">
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>Patient</label>
                <p className="mb-0 fw-medium" style={{ fontSize: "0.95rem" }}>
                  {task.requirement?.patientCase?.patient.firstName}{" "}
                  {task.requirement?.patientCase?.patient.lastName}
                </p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>Kategorie</label>
                <p className="mb-0" style={{ fontSize: "0.95rem" }}>{task.requirement?.category || "—"}</p>
              </div>
              <div className="mb-0">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>Fortschritt</label>
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-medium" style={{ fontSize: "0.9rem" }}>{completedSteps} / {workflowSteps.length} Schritte</span>
                  <span className="fw-medium" style={{ fontSize: "0.9rem" }}>{progress}%</span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div className="progress-bar bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="dashboard-card">
            <div className="card-header-custom">
              <span className="fw-semibold">Workflow-Schritte</span>
            </div>
            <div className="card-body-custom">
              {loading ? (
                <div className="text-center text-muted py-4">Laden...</div>
              ) : workflowSteps.length === 0 ? (
                <div className="text-center text-muted py-4">Keine Workflow-Schritte vorhanden.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {workflowSteps.map((step) => {
                    const isCompleted = step.status === "COMPLETED";
                    const isActive = step.status === "IN_PROGRESS";
                    const isUploadStep = step.stepName.toLowerCase().includes("hochladen");

                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-3 border ${
                          isCompleted
                            ? "border-success bg-success-subtle"
                            : isActive
                            ? "border-primary"
                            : "border-secondary-subtle bg-light"
                        }`}
                        style={{
                          opacity: isCompleted ? 0.85 : 1,
                          borderLeftWidth: isActive ? "4px" : "1px",
                          borderLeftColor: isActive ? "#0d6efd" : undefined,
                        }}
                      >
                        <div className="d-flex align-items-start justify-content-between gap-3">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span
                                className="fw-bold"
                                style={{
                                  fontSize: "1rem",
                                  color: isCompleted ? "#198754" : "#1e293b",
                                  textDecoration: isCompleted ? "line-through" : "none",
                                }}
                              >
                                {step.stepNumber}. {step.stepName}
                              </span>
                              {getStatusBadge(step.status)}
                            </div>
                            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                              {step.stepDescription}
                            </p>
                          </div>

                          <div className="d-flex flex-column gap-2">
                            {/* Status Dropdown fuer ALLE Schritte */}
                            <div className="d-flex align-items-center gap-2">
                              <select
                                className="form-select form-select-sm"
                                style={{ fontSize: "0.85rem", minWidth: "160px" }}
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

                            {/* Upload-Button fuer Upload-Schritte */}
                            {isUploadStep && isActive && (
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  type="file"
                                  className="form-control form-control-sm"
                                  style={{ fontSize: "0.8rem", maxWidth: "200px" }}
                                  id={`upload-${step.id}`}
                                />
                                <label
                                  htmlFor={`upload-${step.id}`}
                                  className="btn btn-sm btn-outline-primary mb-0"
                                  style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                                >
                                  <Upload size={12} /> Hochladen
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
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
