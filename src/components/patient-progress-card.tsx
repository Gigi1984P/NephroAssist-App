"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity, AlertTriangle, CheckCircle, Clock,
} from "lucide-react";

interface ProgressData {
  totalRequirements: number;
  completedRequirements: number;
  inProgressRequirements: number;
  needsRenewal: number;
  expired: number;
  nextAction: {
    title: string;
    dueDate: string | null;
    isBlocked: boolean;
    blockedBy: { title: string; status: string }[];
    isNextStep: boolean;
    prevStep: { title: string } | null;
  } | null;
}

const ampelConfig = {
  green: { bg: "#dcfce7", border: "#86efac", text: "#166534", label: "Alles ok" },
  yellow: { bg: "#fef3c7", border: "#fde68a", text: "#92400e", label: "Achtung" },
  red: { bg: "#fee2e2", border: "#fecaca", text: "#991b1b", label: "Handlung nötig" },
};

export default function PatientProgressCard() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/patients/me/progress", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="dashboard-card mb-4">
        <div className="card-body-custom text-center text-muted">Laden...</div>
      </div>
    );
  }

  const percent = data.totalRequirements > 0
    ? Math.round((data.completedRequirements / data.totalRequirements) * 100)
    : 0;

  // Ampel-Farbe berechnen
  let ampelKey: "green" | "yellow" | "red" = "green";
  if (data.expired > 0 || (data.nextAction?.isBlocked ?? false)) {
    ampelKey = "red";
  } else if (data.needsRenewal > 0 || data.inProgressRequirements > 0) {
    ampelKey = "yellow";
  }
  const ampel = ampelConfig[ampelKey];

  return (
    <div className="dashboard-card mb-4">
      <div className="card-body-custom">
        {/* Ampel-Status */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <div
            style={{
              width: 14, height: 14, borderRadius: "50%",
              background: ampelKey === "green" ? "#10b981" : ampelKey === "yellow" ? "#f59e0b" : "#ef4444",
              boxShadow: `0 0 8px ${ampelKey === "green" ? "#10b981" : ampelKey === "yellow" ? "#f59e0b" : "#ef4444"}`,
            }}
          />
          <span className="fw-semibold" style={{ fontSize: "1rem", color: ampel.text }}>{ampel.label}</span>
        </div>

        {/* Fortschrittsbalken */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="progress flex-grow-1" style={{ height: "8px", borderRadius: "4px", background: "#e2e8f0" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${percent}%`, background: percent === 100 ? "#10b981" : "#3b82f6", borderRadius: "4px" }}
            />
          </div>
          <span className="fw-semibold" style={{ fontSize: "0.875rem", color: "#1e293b" }}>{percent}%</span>
        </div>

        {/* Statistik */}
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
              <div className="fw-bold" style={{ color: "#1e293b" }}>{data.completedRequirements}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Abgeschlossen</div>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
              <div className="fw-bold" style={{ color: "#1e293b" }}>{data.inProgressRequirements}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>In Bearbeitung</div>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
              <div className="fw-bold" style={{ color: data.needsRenewal > 0 ? "#92400e" : "#1e293b" }}>{data.needsRenewal}</div>
              <div style={{ fontSize: "0.7rem", color: data.needsRenewal > 0 ? "#92400e" : "#64748b" }}>Erneuerung</div>
            </div>
          </div>
        </div>

        {/* Next Best Action */}
        {data.nextAction && (
          <div
            className="p-3 rounded"
            style={{
              background: data.nextAction.isBlocked ? "#fee2e2" : "#eff6ff",
              border: `1px solid ${data.nextAction.isBlocked ? "#fecaca" : "#bfdbfe"}`,
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              {data.nextAction.isBlocked ? (
                <><AlertTriangle size={16} style={{ color: "#991b1b" }} /></>
              ) : (
                <><Clock size={16} style={{ color: "#1e40af" }} /></>
              )}
              <span
                className="fw-semibold"
                style={{ fontSize: "0.85rem", color: data.nextAction.isBlocked ? "#991b1b" : "#1e40af" }}
              >
                {data.nextAction.isBlocked ? "Blockiert" : "Nächster Schritt"}
              </span>
            </div>
            <div className="fw-medium" style={{ fontSize: "0.85rem", color: "#1e293b" }}>{data.nextAction.title}</div>
            {data.nextAction.dueDate && (
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Fällig: {new Date(data.nextAction.dueDate).toLocaleDateString("de-DE")}</div>
            )}
            {data.nextAction.isBlocked && data.nextAction.blockedBy.length > 0 && (
              <div className="mt-1">
                <div style={{ fontSize: "0.75rem", color: "#991b1b" }}>Wartet auf:</div>
                {data.nextAction.blockedBy.map((b, i) => (
                  <div key={i} style={{ fontSize: "0.75rem", color: "#b91c1c" }}>• {b.title} ({b.status})</div>
                ))}
              </div>
            )}
            {data.nextAction.isNextStep && data.nextAction.prevStep && (
              <div className="mt-1" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Voriger Schritt: {data.nextAction.prevStep.title} erledigt ✓
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
