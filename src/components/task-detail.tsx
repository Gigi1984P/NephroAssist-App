"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Upload, FileCheck } from "lucide-react";

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
      const res = await fetch(`/api/tasks/${task.id}/workflow`, {
        credentials: "include",
      });
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

  useEffect(() => {
    loadWorkflowSteps();
  }, [task.id]);

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
      // Upload-Datei (noch ohne echtes Backend, zeigt nur Erfolg an)
      // TODO: /api/upload implementieren
      console.log("Upload:", file.name, "für Schritt", stepId);

      // Nach Upload: Status auf COMPLETED setzen
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

                        {/* UPLOAD-SCHRITT: Datei hochladen + Erledigt setzen */}
                        {isUploadStep ? (
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
