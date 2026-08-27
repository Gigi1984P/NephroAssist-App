"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, Calendar, XCircle, ChevronRight, Lock } from "lucide-react";

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

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [requirement, setRequirement] = useState<RequirementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchRequirement();
  }, [id]);

  async function fetchRequirement() {
    try {
      setLoading(true);
      setError("");
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

  // Bestimme den aktiven Schritt (erster nicht erledigter)
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
      </div>

      {/* Patient-Info */}
      <div className="card mb-4" style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
        <div className="card-body py-2 px-3">
          <small className="text-muted">Patient:</small>
          <span className="fw-medium ms-2">{patientName}</span>
        </div>
      </div>

      {/* Fortschritt */}
      {sortedSteps.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">6-Schritte-Workflow</h5>
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
                const isLocked = index > activeStepIndex && activeStepIndex !== -1;

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
    </div>
  );
}
