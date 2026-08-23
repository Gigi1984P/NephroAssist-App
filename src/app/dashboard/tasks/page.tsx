"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CheckSquare, Plus, Search, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle, Filter, Stethoscope } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  PENDING: { label: "Ausstehend", class: "badge-blue" },
  IN_PROGRESS: { label: "In Bearbeitung", class: "badge-yellow" },
  COMPLETED: { label: "Erledigt", class: "badge-green" },
  OVERDUE: { label: "Überfällig", class: "badge-red" },
};

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  category: string;
  patientName: string;
  isWorkflowStep: boolean;
  stepNumber: number | null;
}

const CAN_CREATE_INVESTIGATION = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        // Filter: Nur Top-Level Untersuchungen (nicht einzelne Workflow-Schritte)
        const filtered = data.tasks.filter((t: TaskItem) => !t.isWorkflowStep);
        setTasks(filtered);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || null);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadProfile();
  }, []);

  const canCreate = userRole ? CAN_CREATE_INVESTIGATION.includes(userRole) : false;

  const filtered = tasks.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.patientName && t.patientName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageTasks = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHeader
        title="Untersuchungen"
        description="Übersicht aller Patientenuntersuchungen"
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
        <div className="col-md-6">
          <div className="search-bar">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              className="form-control form-control-sm border-0 bg-transparent"
              placeholder="Untersuchung oder Patient suchen..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select form-select-sm search-bar"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="ALL">Alle Status</option>
            <option value="PENDING">Ausstehend</option>
            <option value="IN_PROGRESS">In Bearbeitung</option>
            <option value="COMPLETED">Erledigt</option>
          </select>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Untersuchung</th>
                <th>Patient</th>
                <th>Kategorie</th>
                <th>Status</th>
                <th>Fällig am</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">Laden...</td>
                </tr>
              ) : pageTasks.length === 0 ? (
                <tr>
                  <td colSpan={6}>
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
                pageTasks.map((task) => {
                  const statusConfig = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
                  return (
                    <tr key={task.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <CheckSquare size={16} className="text-primary" />
                          <span className="fw-medium">{task.title}</span>
                        </div>
                        {task.description && (
                          <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="fw-medium" style={{ fontSize: "0.9rem" }}>
                          {task.patientName || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="badge-custom badge-outline">
                          {task.category || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-custom ${statusConfig.class}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem" }}>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("de-DE")
                            : "Kein Datum"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-end">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Details
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
