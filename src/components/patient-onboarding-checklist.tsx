"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, Clock, SkipForward } from "lucide-react";

interface OnboardingStep {
  id: string;
  stepLabel: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
}

interface Props {
  patientId: string;
}

export default function PatientOnboardingChecklist({ patientId }: Props) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`/api/patients/${patientId}/onboarding`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.steps) {
          setSteps(d.steps);
          setProgress(d.progress || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [patientId]);

  const toggleStatus = async (step: OnboardingStep) => {
    const nextStatus = step.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await fetch(`/api/patients/onboarding/${step.id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, stepId: step.id, status: nextStatus }),
    });
    load();
  };

  if (loading) return <p className="text-muted">Onboarding laden...</p>;
  if (steps.length === 0) return null;

  return (
    <div className="dashboard-card mb-4">
      <div className="card-header-custom d-flex justify-content-between align-items-center">
        <span className="fw-semibold d-flex align-items-center gap-2">
          <CheckCircle size={18} />
          Onboarding-Checkliste
        </span>
        <span className="badge bg-primary">{progress}%</span>
      </div>
      <div className="card-body-custom">
        <div className="progress mb-3" style={{ height: "0.5rem" }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="d-flex flex-column gap-2">
          {steps.map((step) => {
            const isDone = step.status === "COMPLETED";
            const isSkipped = step.status === "SKIPPED";
            return (
              <div
                key={step.id}
                className="d-flex align-items-center gap-2 p-2 rounded"
                style={{
                  background: isDone ? "#f0fdf4" : isSkipped ? "#f8fafc" : "#fff",
                  border: `1px solid ${isDone ? "#bbf7d0" : "#e2e8f0"}`,
                  cursor: "pointer",
                }}
                onClick={() => toggleStatus(step)}
              >
                {isDone ? (
                  <CheckCircle size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
                ) : isSkipped ? (
                  <SkipForward size={18} style={{ color: "#94a3b8", flexShrink: 0 }} />
                ) : (
                  <Circle size={18} style={{ color: "#cbd5e1", flexShrink: 0 }} />
                )}
                <span
                  className={isDone ? "text-decoration-line-through text-muted" : "fw-medium"}
                  style={{ fontSize: "0.85rem" }}
                >
                  {step.stepLabel}
                </span>
                {step.dueDate && !isDone && (
                  <span className="ms-auto text-muted d-flex align-items-center gap-1" style={{ fontSize: "0.7rem" }}>
                    <Clock size={12} />
                    {new Date(step.dueDate).toLocaleDateString("de-DE")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
