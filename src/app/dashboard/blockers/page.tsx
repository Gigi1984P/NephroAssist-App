"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Activity, AlertTriangle, CheckCircle, Clock, Plus, X } from "lucide-react";

interface Blocker {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  patientCase: {
    patient: { id: string; firstName: string; lastName: string };
  } | null;
  requirement: { title: string } | null;
}

const blockerTypeLabels: Record<string, string> = {
  MISSING_PRESCRIPTION: "Fehlende Verordnung",
  NO_APPOINTMENT: "Kein Termin",
  MISSING_DOCUMENT: "Fehlendes Dokument",
  REJECTED_DOCUMENT: "Abgelehntes Dokument",
  PATIENT_NEEDS_HELP: "Patient braucht Hilfe",
  CLINIC_REVIEW_OVERDUE: "Prüfung überfällig",
  EXTERNAL_PROVIDER_DELAY: "Externe Verzögerung",
  EXPIRED_EXAMINATION: "Abgelaufene Untersuchung",
  OTHER: "Sonstiges",
};

export default function BlockersPage() {
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBlockers = async () => {
    try {
      const res = await fetch("/api/blockers", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBlockers(data.blockers || []);
      }
    } catch (error) {
      console.error("Failed to load blockers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockers();
  }, []);

  const resolveBlocker = async (id: string) => {
    try {
      const res = await fetch(`/api/blockers/${id}/resolve`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setBlockers((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Failed to resolve blocker:", error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Blocker"
        description="Aktive Hindernisse und Probleme im Überblick"
        action={
          <button className="btn-custom btn-primary-custom">
            <Plus size={16} />
            Neuer Blocker
          </button>
        }
      />

      <div className="dashboard-card">
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : blockers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckCircle size={24} />
              </div>
              <div className="empty-state-title">Keine aktiven Blocker</div>
              <div className="empty-state-desc">Alles läuft reibungslos!</div>
            </div>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Typ</th>
                  <th>Beschreibung</th>
                  <th>Patient</th>
                  <th>Anforderung</th>
                  <th>Erstellt</th>
                  <th className="actions">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {blockers.map((blocker) => (
                  <tr key={blocker.id}>
                    <td>
                      <span className="badge-custom badge-red">
                        {blockerTypeLabels[blocker.type] || blocker.type}
                      </span>
                    </td>
                    <td>{blocker.description}</td>
                    <td>
                      {blocker.patientCase?.patient
                        ? `${blocker.patientCase.patient.firstName} ${blocker.patientCase.patient.lastName}`
                        : "—"}
                    </td>
                    <td>{blocker.requirement?.title || "—"}</td>
                    <td>
                      {new Date(blocker.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="actions">
                      <button
                        className="btn-custom btn-outline-custom btn-sm-custom"
                        onClick={() => resolveBlocker(blocker.id)}
                      >
                        <CheckCircle size={14} />
                        Gelöst
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
