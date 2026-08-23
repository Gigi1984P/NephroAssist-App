"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CheckSquare, Plus, Search, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  requirement: {
    patientCase: {
      patient: {
        firstName: string;
        lastName: string;
      };
    };
  } | null;
}

type UserRole = "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";

const CAN_CREATE_INVESTIGATION: UserRole[] = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const itemsPerPage = 10;

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
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

  const filteredTasks = tasks
    .filter((task) => {
      const patient = task.requirement?.patientCase?.patient;
      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
      const taskStatus = isOverdue ? "OVERDUE" : task.status;

      const matchesSearch =
        searchTerm === "" ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || taskStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date();
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (status: string, isOverdue: boolean) => {
    if (isOverdue) return "badge-red";
    switch (status) {
      case "IN_PROGRESS":
        return "badge-yellow";
      case "PENDING":
        return "badge-blue";
      default:
        return "badge-outline";
    }
  };

  const getStatusLabel = (status: string, isOverdue: boolean) => {
    if (isOverdue) return "Überfällig";
    switch (status) {
      case "IN_PROGRESS":
        return "In Bearbeitung";
      case "PENDING":
        return "Ausstehend";
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  return (
    <div>
      <PageHeader
        title="Untersuchungen"
        description="Verwalten Sie offene und laufende Untersuchungen"
        action={
          canCreate ? (
            <button className="btn-custom btn-primary-custom">
              <Plus size={16} />
              Neue Untersuchung
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="search-bar">
                <Search size={16} className="search-bar-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Suchen nach Titel oder Patient..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Alle Status</option>
                <option value="PENDING">Ausstehend</option>
                <option value="IN_PROGRESS">In Bearbeitung</option>
                <option value="OVERDUE">Überfällig</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {filteredTasks.length} Untersuchungen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card">
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckSquare size={24} />
              </div>
              <div className="empty-state-title">Keine Untersuchungen gefunden</div>
              <div className="empty-state-desc">
                {searchTerm || statusFilter !== "ALL"
                  ? "Versuchen Sie andere Filtereinstellungen"
                  : "Alle Untersuchungen sind erledigt!"}
              </div>
              {canCreate && (
                <button className="btn-custom btn-primary-custom">
                  <Plus size={16} />
                  Neue Untersuchung
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Titel</th>
                    <th>Patient</th>
                    <th>Fällig am</th>
                    <th>Status</th>
                    <th className="actions">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map((task) => {
                    const patient = task.requirement?.patientCase?.patient;
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                    return (
                      <tr key={task.id}>
                        <td>
                          <div className={`avatar-sm ${isOverdue ? "avatar-red" : "avatar-blue"}`}>
                            <Clock size={16} />
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium">{task.title}</span>
                        </td>
                        <td>
                          {patient ? `${patient.firstName} ${patient.lastName}` : "—"}
                        </td>
                        <td>
                          {task.dueDate ? (
                            <span style={isOverdue ? { color: "#dc3545", fontWeight: 600 } : {}}>
                              {formatDate(task.dueDate)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span className={`badge-custom ${getStatusBadgeClass(task.status, !!isOverdue)}`}>
                            {getStatusLabel(task.status, !!isOverdue)}
                          </span>
                        </td>
                        <td className="actions">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="btn-custom btn-outline-custom btn-sm-custom"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3 border-top">
                  <ul className="pagination-custom">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={14} />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
