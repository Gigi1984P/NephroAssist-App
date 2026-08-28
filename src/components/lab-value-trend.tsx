"use client";

import { useState, useEffect } from "react";

import { useTranslation } from "@/components/i18n-provider";

interface LabValue {
  id: string;
  testType: string;
  value: number;
  unit: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  testedAt: string;
}

interface Props {
  patientId: string;
}

export default function LabValueTrend({ patientId }: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, LabValue[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${patientId}/lab-values`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.grouped) setValues(d.grouped); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  const testTypes = Object.keys(values);

  if (loading) return <p className="text-muted" style={{ fontSize: "0.85rem" }}>{t("lab.loading", "Laborwerte laden...")}</p>;
  if (testTypes.length === 0) return <p className="text-muted" style={{ fontSize: "0.85rem" }}>{t("lab.noValues", "Keine Laborwerte vorhanden.")}</p>;

  return (
    <div className="mb-3">
      <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>{t("lab.latest", "Letzte Laborwerte")}</h6>
      {testTypes.slice(0, 3).map((type) => {
        const latest = values[type][0];
        const prev = values[type][1];
        const isHigh = latest.referenceHigh && latest.value > latest.referenceHigh;
        const isLow = latest.referenceLow && latest.value < latest.referenceLow;
        const trend = prev ? (latest.value > prev.value ? "↑" : latest.value < prev.value ? "↓" : "→") : "";

        return (
          <div key={type} className="d-flex align-items-center justify-content-between py-1" style={{ fontSize: "0.8rem", borderBottom: "1px solid #f1f5f9" }}>
            <span className="text-muted">{type}</span>
            <span className="fw-medium">
              {latest.value.toFixed(1)} {latest.unit}
              {" "}
              <span className={isHigh ? "text-danger" : isLow ? "text-warning" : "text-success"} style={{ fontSize: "0.7rem" }}>
                {isHigh ? "⚠️ " + t("lab.high", "hoch") : isLow ? "⚠️ " + t("lab.low", "niedrig") : "✓"} {trend}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
