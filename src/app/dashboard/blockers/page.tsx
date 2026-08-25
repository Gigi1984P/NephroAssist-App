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

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
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
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    type: "MISSING_DOCUMENT",
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

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

  const loadPatients = async () => {
    try {
      const res = await fetch("/api/patients/overview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  useEffect(() => {
    loadBlockers();
  }, []);

  const openModal = () => {
    loadPatients();
    setShowModal(true);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/blockers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setForm({ patientId: "", type: "MISSING_DOCUMENT", description: "" });
        loadBlockers();
      } else {
        setFormError(data.error || "Fehler beim Erstellen");
      }
    } catch (error) {
      setFormError("Netzwerkfehler");
    } finally {
      setFormLoading(false);
    }
  };

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
          <button className="btn-custom btn-primary-custom" onClick={openModal}>
            <Plus size={16} /> Neuer Blocker
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
                    <td>{new Date(blocker.createdAt).toLocaleDateString("de-DE")}</td>
                    <td className="actions">
                      <button
                        className="btn-custom btn-outline-custom btn-sm-custom"
                        onClick={() => resolveBlocker(blocker.id)}
                      >
                        <CheckCircle size={14} /> Gelöst
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="bg-white rounded shadow-sm" style={{ width: "100%", maxWidth: "480px", margin: "1rem" }}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <span className="fw-semibold">Neuer Blocker</span>
              <button className="btn btn-link text-decoration-none p-0" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-3">
              {formError && (
                <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "0.85rem" }}>{formError}</div>
              )}

              <div className="mb-3">
                <label className="form-label">Patient</label>
                <select
                  className="form-select"
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  required
                >
                  <option value="">Patient auswählen...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Typ</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {Object.entries(blockerTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Beschreibung</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Beschreiben Sie das Problem..."
                  required
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Abbrechen
                </button>
                <button type="submit" className="btn-custom btn-primary-custom" disabled={formLoading}>
                  {formLoading ? "Wird erstellt..." : "Blocker erstellen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
