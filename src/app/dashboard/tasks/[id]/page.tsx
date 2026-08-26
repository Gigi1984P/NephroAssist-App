"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, Activity, Calendar, FileText, XCircle, ChevronRight } from "lucide-react";

interface WorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string | null;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  ownerType: string;
  metadata: any;
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

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Ausstehend", color: "#64748b", bg: "#f1f5f9" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "#3b82f6", bg: "#eff6ff" },
  COMPLETED: { label: "Erledigt", color: "#10b981", bg: "#f0fdf4" },
  CANCELLED: { label: "Abgebrochen", color: "#94a3b8", bg: "#f8fafc" },
  OVERDUE: { label: "Überfällig", color: "#dc2626", bg: "#fef2f2" },
};

function getStatusBadge(status: string) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span
      className="badge"
      style={{
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}30`,
        fontSize: "0.75rem",
        padding: "0.3rem 0.5rem",
      }}
    >
      {meta.label}
    </span>
  );
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [requirement, setRequirement] = useState<RequirementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const isPatient = userRole === "PATIENT" || userRole === "CAREGIVER";
  const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(userRole || "");

  useEffect(() => {
    // Load user role
    fetch("/api/user/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const user = data.user || data;
        setUserRole(user.role || null);
      })
      .catch(() => {});

    // Load requirement detail
    loadRequirement();
  }, [id]);

  const loadRequirement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/patient-requirements/${id}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Laden");
        setLoading(false);
        return;
      }
      setRequirement(data.requirement);
    } catch (err) {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
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
      await loadRequirement();
      setUpdatingStepId(null);
    } catch (err) {
      setError("Netzwerkfehler");
      setUpdatingStepId(null);
    }
  };

  const getStepAccess = (step: WorkflowStep, index: number, steps: WorkflowStep[]): "completed" | "active" | "locked" => {
    if (step.status === "COMPLETED") return "completed";
    if (index === 0) return "active";
    const prevStep = steps[index - 1];
    if (prevStep?.status === "COMPLETED") return "active";
    return "locked";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  if (error || !requirement) {
    return (
      <div>
        <div className="alert alert-danger" role="alert">{error || "Untersuchung nicht gefunden"}</div>
        <Link href="/dashboard/tasks" className="btn btn-outline-primary btn-sm">
          <ArrowLeft size={14} className="me-1" /> Zurück
        </Link>
      </div>
    );
  }

  const displayName = requirement.template?.patientFriendlyDescription || requirement.template?.name || requirement.title;
  const patientName = requirement.patientCase?.patient
    ? `${requirement.patientCase.patient.firstName || ""} ${requirement.patientCase.patient.lastName || ""}`.trim()
    : "—";

  const sortedSteps = [...requirement.tasks].sort((a, b) => a.stepNumber - b.stepNumber);
  const completedSteps = sortedSteps.filter((s) => s.status === "COMPLETED").length;
  const progress = sortedSteps.length > 0 ? Math.round((completedSteps / sortedSteps.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={displayName}
        description={`Patient: ${patientName}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Untersuchungen", href: "/dashboard/tasks" },
          { label: displayName },
        ]}
      />

      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {/* Fortschritt */}
      <div className="dashboard-card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Fortschritt: {completedSteps} von {sortedSteps.length} Schritten erledigt</strong>
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>{progress}%</span>
          </div>
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Workflow-Schritte */}
      <div className="dashboard-card">
        <div className="card-header-custom">
          <strong>6-Schritte-Workflow</strong>
        </div>
        <div className="card-body-custom">
          {sortedSteps.length === 0 ? (
            <p className="text-muted">Keine Workflow-Schritte vorhanden.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {sortedSteps.map((step, index) => {
                const access = getStepAccess(step, index, sortedSteps);
                const isCompleted = step.status === "COMPLETED";
                const isActive = access === "active";

                return (
                  <div
                    key={step.id}
                    className={`p-3 border rounded ${
                      isActive ? "border-primary border-2" :
                      isCompleted ? "border-success" :
                      "border-secondary opacity-75"
                    }`}
                    style={{
                      background: isCompleted ? "#f0f9f4" :
                                  access === "locked" ? "#e9ecef" :
                                  "#fff",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong style={{ fontSize: "1.05rem", opacity: access === "locked" ? 0.5 : 1 }}>
                          {step.stepNumber}. {step.stepName || "—"}
                        </strong>
                        {step.stepDescription && (
                          <p className="text-muted mb-0" style={{ fontSize: "0.85rem", opacity: access === "locked" ? 0.5 : 1 }}>
                            {step.stepDescription}
                          </p>
                        )}
                      </div>
                      <div>{getStatusBadge(step.status)}</div>
                    </div>

                    {/* Locked Hinweis */}
                    {access === "locked" && isPatient && (
                      <div className="alert alert-secondary py-2 mb-0" style={{ fontSize: "0.85rem" }}>
                        🔒 Bitte schließen Sie zuerst Schritt {index} ab, um diesen Schritt zu bearbeiten.
                      </div>
                    )}

                    {/* Controls nur wenn aktiv */}
                    {isActive && !isCompleted && (
                      <div className="mt-2">
                        {step.ownerType === "PATIENT" && !isPatient ? (
                          <div className="alert alert-info py-2 mb-0" style={{ fontSize: "0.85rem" }}>
                            🔒 Dieser Schritt kann nur vom Patienten erledigt werden.
                          </div>
                        ) : step.ownerType === "TRANSPLANT_CENTER" && !isClinic ? (
                          <div className="alert alert-info py-2 mb-0" style={{ fontSize: "0.85rem" }}>
                            🔒 Dieser Schritt erfordert die Klinik.
                          </div>
                        ) : (
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
                        )}
                      </div>
                    )}

                    {/* Completed Info */}
                    {isCompleted && step.completedAt && (
                      <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                        Erledigt am {new Date(step.completedAt).toLocaleDateString("de-DE")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Zusammenfassung */}
      <div className="mt-3">
        <Link href="/dashboard/tasks" className="btn btn-outline-primary btn-sm">
          <ArrowLeft size={14} className="me-1" /> Zurück zur Übersicht
        </Link>
      </div>
    </div>
  );
}
