"use client";

import { useState, useEffect } from "react";

import { useTranslation } from "@/components/i18n-provider";

interface Props {
  patientId: string;
}

export default function ReadinessScoreBadge({ patientId }: Props) {
  const { t } = useTranslation();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${patientId}/readiness-score`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.score !== undefined) setScore(d.score);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <span className="badge bg-light text-muted">…</span>;
  if (score === null) return null;

  let color = "#dc2626";
  let label = t("transplant.notReady", "Nicht bereit");
  if (score >= 80) { color = "#16a34a"; label = t("transplant.ready", "Bereit"); }
  else if (score >= 50) { color = "#f59e0b"; label = t("transplant.partiallyReady", "Teils bereit"); }

  return (
    <div className="d-inline-flex align-items-center gap-2">
      <div
        className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
        style={{
          width: 32,
          height: 32,
          background: color,
          fontSize: "0.75rem",
        }}
        title={`${label} (${score}%)`}
      >
        {score}
      </div>
      <span className="badge" style={{ background: color, color: "#fff", fontSize: "0.7rem" }}>
        {label}
      </span>
    </div>
  );
}
