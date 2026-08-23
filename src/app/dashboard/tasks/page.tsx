"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CheckSquare, Plus, Search, ChevronLeft, ChevronRight, Clock, CheckCircle, Upload, FileText, Stethoscope, ArrowRight, AlertCircle } from "lucide-react";

interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  status: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  isWorkflowStep: boolean;
  dueDate: string | null;
  ownerType: string;
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
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
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

  // Nur Workflow-Schritte anzeigen
  const workflowTasks = tasks.filter((t) => t.isWorkflowStep);

  // Nach Requirement gruppieren
  const groupedByRequirement = workflowTasks.reduce((acc, task) => {
    const reqTitle = task.title.split(":")[0] || "Untersuchung";
    if (!acc[reqTitle]) acc[reqTitle] = [];
    acc[reqTitle].push(task);
    return acc;
  }, {} as Record<string, WorkflowTask[]>);

  // Sortiere jede Gruppe nach stepNumber
  Object.keys(groupedByRequirement).forEach((key) => {
    groupedByRequirement[key].sort((a, b) => a.stepNumber - b.stepNumber);
  });

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
      case "COMPLETED":
        return "badge-green";
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
        return "Aktiv";
      case "COMPLETED":
        return "Erledigt";
      case "PENDING":
        return "Ausstehend";
      default:
        return status;
    }
  };

  const getStepIcon = (stepNumber: number, status: string) => {
    if (status === "COMPLETED") return <CheckCircle size={20} className="text-success" />;
    if (status === "IN_PROGRESS") return <Clock size={20} className="text-warning" />;
    switch (stepNumber) {
      case 1: return <FileText size={20} className="text-muted" />;
      case 2: return <Upload size={20} className="text-muted" />;
      case 3: return <Stethoscope size={20} className="text-muted" />;
      case 7: return <AlertCircle size={20} className="text-muted" />;
      default: return <ArrowRight size={20} className="text-muted" />;
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
                <option value="IN_PROGRESS">Aktiv</option>
                <option value="COMPLETED">Erledigt</option>
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

      {/* Workflow Steps View */}
      <div className="dashboard-card">
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : Object.keys(groupedByRequirement).length === 0 ? (
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
            <div className="p-3">
              {Object.entries(groupedByRequirement).map(([workflowName, steps]) => {
                const currentStep = steps.find((s) => s.status === "IN_PROGRESS") || steps[0];
                const completedSteps = steps.filter((s) => s.status === "COMPLETED").length;
                const progress = Math.round((completedSteps / steps.length) * 100);

                return (
                  <div key={workflowName} className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h5 className="fw-semibold mb-0">{workflowName}</h5>
                        <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                          {completedSteps} von {steps.length} Schritten erledigt
                        </span>
                      </div>
                      <span className="badge-custom badge-blue" style={{ fontSize: "0.75rem" }}>
                        {progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress mb-3" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>

                    {/* Steps Timeline */}
                    <div className="timeline-steps">
                      {steps.map((step, index) => {
                        const isCompleted = step.status === "COMPLETED";
                        const isActive = step.status === "IN_PROGRESS";
                        const isPending = step.status === "PENDING";

                        return (
                          <div
                            key={step.id}
                            className={`timeline-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                          >
                            <div className="step-indicator">
                              <div className={`step-circle ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                                {getStepIcon(step.stepNumber, step.status)}
                              </div>
                              {index < steps.length - 1 && (
                                <div className={`step-line ${isCompleted ? "completed" : ""}`} />
                              )}
                            </div>
                            <div className="step-content">
                              <div className="d-flex align-items-start justify-content-between">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="step-number">{step.stepNumber}.</span>
                                    <span className="step-title">{step.stepName}</span>
                                  </div>
                                  <p className="step-desc mb-2">{step.stepDescription}</p>
                                </div>
                                <div className="ms-2 text-end">
                                  <span className={`step-status ${isCompleted ? "done" : isActive ? "active" : ""}`}>
                                    {isCompleted ? "✓ Erledigt" : isActive ? "● Aktiv" : "○ Ausstehend"}
                                  </span>
                                </div>
                              </div>
                              {isActive && (
                                <button className="btn btn-sm btn-outline-primary step-action-btn">
                                  Als erledigt markieren
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
