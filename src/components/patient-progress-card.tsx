"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface ProgressData {
  totalRequirements: number;
  completedRequirements: number;
  inProgressRequirements: number;
  expiredRequirements: number;
  totalSteps: number;
  completedSteps: number;
  overallPercent: number;
}

interface NextAction {
  requirementTitle: string;
  stepName: string;
  stepNumber: number;
  taskId: string;
  requirementId: string;
}

export default function PatientProgressCard() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch("/api/patients/me/progress", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProgress(data.progress);
          setNextAction(data.nextAction);
        }
      } catch (error) {
        console.error("Progress load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  if (loading) return <div className="text-muted">Laden...</div>;
  if (!progress) return null;

  const percent = progress.overallPercent;
  const color = percent >= 80 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="dashboard-card mb-4">
      <div className="card-body-custom">
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <h5 className="fw-semibold mb-2">Dein Weg zur Warteliste</h5>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div style={{ fontSize: "2rem", fontWeight: 700, color }}>
                {percent}%
              </div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                {progress.completedRequirements} von{" "}
                {progress.totalRequirements} Anforderungen abgeschlossen
              </div>
            </div>
            <div
              className="progress"
              style={{ height: "8px", borderRadius: "4px", background: "#e2e8f0" }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${percent}%`,
                  backgroundColor: color,
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          <div className="col-md-6">
            {nextAction ? (
              <div
                className="p-3 rounded"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <div
                  className="d-flex align-items-center gap-2 mb-1"
                  style={{ fontSize: "0.8rem", color: "#64748b" }}
                >
                  <Activity size={14} />
                  Nächster Schritt
                </div>
                <div className="fw-semibold" style={{ color: "#1e293b" }}>
                  {nextAction.requirementTitle}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {nextAction.stepName}
                </div>
                <Link
                  href={`/dashboard/tasks/${nextAction.taskId}`}
                  className="btn-custom btn-primary-custom btn-sm-custom mt-2"
                >
                  Jetzt erledigen
                </Link>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 text-success">
                <CheckCircle size={20} />
                <span className="fw-medium">Alle Anforderungen abgeschlossen!</span>
              </div>
            )}
          </div>
        </div>

        <div className="row g-2 mt-3">
          <div className="col-4">
            <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
              <div className="fw-bold" style={{ color: "#1e293b" }}>
                {progress.inProgressRequirements}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>In Bearbeitung</div>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
              <div className="fw-bold" style={{ color: "#1e293b" }}>
                {progress.completedRequirements}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Abgeschlossen</div>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
              <div className="fw-bold" style={{ color: "#ef4444" }}>
                {progress.expiredRequirements}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Erneuerung fällig</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
