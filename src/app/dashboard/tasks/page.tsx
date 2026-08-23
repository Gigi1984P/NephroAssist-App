"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ChevronLeft, ChevronRight, Stethoscope, ArrowRight } from "lucide-react";

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
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
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageTasks = filtered.slice((page - 1) * perPage, page * perPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="badge-custom badge-blue" style={{ fontSize: "0.7rem" }}>Ausstehend</span>;
      case "IN_PROGRESS":
        return <span className="badge-custom badge-yellow" style={{ fontSize: "0.7rem" }}>In Bearbeitung</span>;
      case "COMPLETED":
        return <span className="badge-custom badge-green" style={{ fontSize: "0.7rem" }}>Erledigt</span>;
      default:
        return <span className="badge-custom badge-outline" style={{ fontSize: "0.7rem" }}>{status}</span>;
    }
  };

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
        <div className="col-md-8">
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
      </div>

      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Untersuchung</th>
                <th>Patient</th>
                <th>Kategorie</th>
                <th style={{ width: "1%" }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">Laden...</td>
                </tr>
              ) : pageTasks.length === 0 ? (
                <tr>
                  <td colSpan={4}>
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
                pageTasks.map((task) => (
                  <tr key={task.id} className="align-middle">
                    <td>
                      <div className="d-flex flex-column">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold" style={{ fontSize: "1rem", color: "#1e293b" }}>
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <span className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>
                            {task.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="fw-medium" style={{ fontSize: "0.9rem" }}>
                        {task.patientName || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                        {task.category || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {getStatusBadge(task.status)}
                        <Link
                          href={`/dashboard/tasks/${task.id}`}
                          className="btn btn-sm btn-link text-decoration-none"
                          style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                        >
                          Details <ArrowRight size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
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
