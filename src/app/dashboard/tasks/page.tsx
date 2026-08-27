"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ChevronLeft, ChevronRight, Stethoscope, ArrowRight, CheckCircle, Clock, AlertTriangle, XCircle, Activity, Calendar, FileText } from "lucide-react";

interface ReqItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  required: boolean;
  listingBlocker: boolean;
  priority: number;
  template?: {
    name: string;
    category: string;
    required: boolean;
    listingBlocker: boolean;
    patientFriendlyDescription: string | null;
  } | null;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
  }>;
}

const CAN_CREATE_INVESTIGATION = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  NOT_STARTED: { label: "Nicht gestartet", color: "#64748b", bg: "#f1f5f9", icon: <Clock size={14} /> },
  ACTION_REQUIRED: { label: "Aktion nötig", color: "#f97316", bg: "#fff7ed", icon: <AlertTriangle size={14} /> },
  IN_PROGRESS: { label: "In Bearbeitung", color: "#3b82f6", bg: "#eff6ff", icon: <Activity size={14} /> },
  WAITING_FOR_APPOINTMENT: { label: "Warte auf Termin", color: "#f59e0b", bg: "#fffbeb", icon: <Calendar size={14} /> },
  WAITING_FOR_DOCUMENT: { label: "Warte auf Dokument", color: "#f59e0b", bg: "#fffbeb", icon: <FileText size={14} /> },
  DOCUMENT_UPLOADED: { label: "Dokument hochgeladen", color: "#3b82f6", bg: "#eff6ff", icon: <FileText size={14} /> },
  UNDER_REVIEW: { label: "In Prüfung", color: "#8b5cf6", bg: "#faf5ff", icon: <Activity size={14} /> },
  ACCEPTED: { label: "Akzeptiert", color: "#10b981", bg: "#f0fdf4", icon: <CheckCircle size={14} /> },
  REJECTED: { label: "Abgelehnt", color: "#ef4444", bg: "#fef2f2", icon: <XCircle size={14} /> },
  BLOCKED: { label: "Blockiert", color: "#dc2626", bg: "#fef2f2", icon: <AlertTriangle size={14} /> },
  EXPIRED: { label: "Abgelaufen", color: "#dc2626", bg: "#fef2f2", icon: <Clock size={14} /> },
  RENEWAL_REQUIRED: { label: "Erneuerung nötig", color: "#f59e0b", bg: "#fffbeb", icon: <Clock size={14} /> },
  WAIVED: { label: "Entfallen", color: "#94a3b8", bg: "#f8fafc", icon: <CheckCircle size={14} /> },
  NOT_APPLICABLE: { label: "N/A", color: "#94a3b8", bg: "#f8fafc", icon: <CheckCircle size={14} /> },
};

export default function TasksPage() {
  const [requirements, setRequirements] = useState<ReqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, profileRes] = await Promise.all([
        fetch("/api/patient-requirements", { credentials: "include" }),
        fetch("/api/user/profile", { credentials: "include" }),
      ]);

      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequirements(data.requirements || []);
      }

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserRole(profile.user?.role || null);
      }
    } catch (error) {
      console.error("Failed to load requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const canCreate = userRole ? CAN_CREATE_INVESTIGATION.includes(userRole) : false;
  const isPatient = userRole === "PATIENT" || userRole === "CAREGIVER";

  const filtered = requirements.filter((r) => {
    const matchesSearch =
      !search ||
      (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.template?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHeader
        title="Untersuchungen"
        description={isPatient ? "Deine zugewiesenen Untersuchungen" : "Übersicht aller Patientenuntersuchungen"}
        action={
          canCreate && (
            <Link href="/dashboard/tasks/new" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2">
              <Plus size={16} />
              <span>Neue Untersuchung</span>
            </Link>
          )
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-md-8">
          <div className="search-bar">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              className="form-control form-control-sm border-0 bg-transparent"
              placeholder="Untersuchung suchen..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Untersuchung</th>
                <th style={{ width: "1%" }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center text-muted py-4">Laden...</td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={2}>
                    <div className="empty-state">
                      <Stethoscope size={40} className="text-muted mb-2" />
                      <p>Keine Untersuchungen gefunden.</p>
                      {canCreate && (
                        <Link href="/dashboard/tasks/new" className="btn btn-primary btn-sm mt-2">
                          Neue Untersuchung erstellen
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pageItems.map((req) => {
                  const meta = STATUS_META[req.status] || STATUS_META.NOT_STARTED;
                  const displayName = req.template?.patientFriendlyDescription || req.template?.name || req.title || "—";

                  return (
                    <tr key={req.id} className="align-middle">
                      <td>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold" style={{ fontSize: "1.05rem", color: "#1e293b" }}>
                              {displayName}
                            </span>
                            {req.listingBlocker && (
                              <span className="badge bg-danger" style={{ fontSize: "0.6rem" }}>Blocker</span>
                            )}
                          </div>
                          <div className="d-flex flex-wrap gap-2 mt-1" style={{ fontSize: "0.8rem" }}>
                            <span className="text-muted">{req.category || req.template?.category || ""}</span>
                            {req.tasks.length > 0 && (
                              <span className="text-muted">· {req.tasks.length} Task{req.tasks.length !== 1 ? "s" : ""}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
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
                          <Link
                            href={`/dashboard/tasks/${req.id}`}
                            className="btn btn-sm btn-link text-decoration-none"
                            style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                          >
                            Details <ArrowRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > perPage && (
          <div className="pagination-custom">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
              Seite {page} von {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
