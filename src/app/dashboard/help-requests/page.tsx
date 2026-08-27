"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { AlertCircle, Clock, CheckCircle, Search, LifeBuoy, User } from "lucide-react";

interface HelpRequest {
  id: string;
  type: string;
  description: string | null;
  status: string;
  createdAt: string;
  patient: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  patientCase: {
    status: string;
  } | null;
}

const HELP_TYPE_LABELS: Record<string, string> = {
  I_DONT_UNDERSTAND: "Verstehe nicht",
  NO_APPOINTMENT: "Kein Termin",
  MISSING_PRESCRIPTION: "Fehlende Überweisung",
  DOCTOR_WONT_ISSUE: "Arzt stellt nicht aus",
  TRANSPORT: "Transport",
  LANGUAGE: "Sprache",
  ORGANIZATIONAL: "Organisatorisch",
  OTHER: "Sonstiges",
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  OPEN: { label: "Offen", color: "#ef4444", bg: "#fef2f2", icon: <AlertCircle size={14} /> },
  IN_PROGRESS: { label: "In Bearbeitung", color: "#f59e0b", bg: "#fffbeb", icon: <Clock size={14} /> },
  RESOLVED: { label: "Erledigt", color: "#10b981", bg: "#f0fdf4", icon: <CheckCircle size={14} /> },
};

export default function HelpRequestsPage() {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/help-requests", { credentials: "include" });
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();
      setHelpRequests(data.helpRequests || []);
    } catch (err) {
      setError("Fehler beim Laden der Hilfeanfragen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = helpRequests.filter((hr) => {
    const q = search.toLowerCase();
    const typeLabel = HELP_TYPE_LABELS[hr.type] || hr.type;
    const patientName = `${hr.patient?.firstName || ""} ${hr.patient?.lastName || ""}`.toLowerCase();
    return (
      typeLabel.toLowerCase().includes(q) ||
      (hr.description || "").toLowerCase().includes(q) ||
      patientName.includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Hilfeanfragen"
        description="Übersicht aller offenen Hilfeanfragen"
      />

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} />
        </div>
      )}

      {/* Search */}
      <div className="row g-3 mb-3">
        <div className="col-md-8">
          <div className="search-bar">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              className="form-control form-control-sm border-0 bg-transparent"
              placeholder="Hilfeanfrage suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4 text-md-end">
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
            {helpRequests.length} offen
          </span>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Typ</th>
                <th>Beschreibung</th>
                <th style={{ width: "1%" }}>Status</th>
                <th style={{ width: "1%" }}>Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Laden...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <LifeBuoy size={40} className="text-muted mb-2" />
                      <p>Keine Hilfeanfragen gefunden.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((hr) => {
                  const meta = STATUS_META[hr.status] || STATUS_META.OPEN;
                  const typeLabel = HELP_TYPE_LABELS[hr.type] || hr.type;
                  const patientName = `${hr.patient?.firstName || ""} ${hr.patient?.lastName || ""}`.trim() || "—";
                  return (
                    <tr key={hr.id} className="align-middle">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#3b82f6",
                              fontSize: "0.75rem",
                              flexShrink: 0,
                            }}
                          >
                            <User size={14} />
                          </div>
                          <span className="fw-medium">{patientName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium" style={{ fontSize: "0.9rem" }}>{typeLabel}</span>
                      </td>
                      <td>
                        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                          {hr.description || "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge d-inline-flex align-items-center gap-1"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.color}30`,
                            fontSize: "0.75rem",
                            padding: "0.3rem 0.5rem",
                          }}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {new Date(hr.createdAt).toLocaleDateString("de-DE")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
