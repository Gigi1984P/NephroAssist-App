"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  Plus, Search, ChevronLeft, ChevronRight, Users,
  ChevronDown, ChevronUp, FileText, CheckCircle, Clock,
  AlertCircle, FileCheck, Eye, Stethoscope,
} from "lucide-react";

interface InvestigationStep {
  id: string;
  stepNumber: number | null;
  stepName: string | null;
  status: string;
}

interface Investigation {
  requirementId: string;
  title: string;
  category: string;
  status: string;
  topLevelTaskId: string | null;
  step6: {
    id: string;
    status: string;
    name: string | null;
    completedAt: Date | null;
  } | null;
  steps: InvestigationStep[];
}

interface Document {
  id: string;
  filename: string;
  documentType: string | null;
  createdAt: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  consentStatus: string;
  investigations: Investigation[];
  documents: Document[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients/overview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Schritt 6 abnehmen
  const handleApproveStep6 = async (stepId: string) => {
    setUpdatingStepId(stepId);
    setMessage(null);
    try {
      const res = await fetch(`/api/tasks/${stepId}/review`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Prüfung erfolgreich abgenommen" });
        await loadPatients();
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setUpdatingStepId(null);
    }
  };

  // Fortschritt berechnen
  const getProgress = (inv: Investigation) => {
    const totalSteps = inv.steps.length;
    if (totalSteps === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = inv.steps.filter((s) => s.status === "COMPLETED").length;
    return { completed, total: totalSteps, percent: Math.round((completed / totalSteps) * 100) };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="badge bg-success">Erledigt</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-primary">In Bearbeitung</span>;
      case "PENDING":
      case "NOT_STARTED":
        return <span className="badge bg-secondary">Ausstehend</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={14} className="text-success" />;
      case "IN_PROGRESS":
        return <Clock size={14} className="text-primary" />;
      default:
        return <AlertCircle size={14} className="text-muted" />;
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`;
    return (
      searchTerm === "" ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <PageHeader
        title="Patienten"
        description="Patientenübersicht mit Untersuchungen, Status und Dokumenten"
        action={
          <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2">
            <Plus size={16} />
            Neuer Patient
          </button>
        }
      />

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mb-3`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text"><Search size={16} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name oder E-Mail suchen..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {filteredPatients.length} Patienten
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-5">
              <Users size={40} className="text-muted mb-2" />
              <div className="text-muted">Keine Patienten gefunden</div>
            </div>
          ) : (
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Patient</th>
                  <th>Untersuchungen</th>
                  <th>Status</th>
                  <th>Dokumente</th>
                  <th>Schritt 6</th>
                  <th style={{ width: "1%" }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient) => {
                  const isExpanded = expandedRow === patient.id;
                  const hasInvestigations = patient.investigations.length > 0;
                  const pendingStep6 = patient.investigations.filter(
                    (inv) => inv.step6 && inv.step6.status !== "COMPLETED"
                  );

                  return (
                    <>
                      <tr
                        key={patient.id}
                        className={isExpanded ? "table-primary" : ""}
                        style={{ cursor: hasInvestigations ? "pointer" : "default" }}
                        onClick={() => hasInvestigations && setExpandedRow(isExpanded ? null : patient.id)}
                      >
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: 36,
                                height: 36,
                                background: "#0d6efd",
                                fontSize: "0.8rem",
                              }}
                            >
                              {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {patient.email || "Keine E-Mail"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {hasInvestigations ? (
                            <div className="d-flex flex-wrap gap-1">
                              {patient.investigations.map((inv) => {
                                const progress = getProgress(inv);
                                return (
                                  <span
                                    key={inv.requirementId}
                                    className="badge bg-light text-dark border"
                                    style={{ fontSize: "0.75rem" }}
                                    title={`${inv.title}: ${progress.completed}/${progress.total} erledigt`}
                                  >
                                    <Stethoscope size={10} className="me-1" />
                                    {inv.title} ({progress.completed}/{progress.total})
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                              Keine Untersuchungen
                            </span>
                          )}
                        </td>
                        <td>
                          {patient.investigations.length > 0 && (
                            <div className="d-flex flex-column gap-1">
                              {patient.investigations.map((inv) => (
                                <div key={inv.requirementId} className="d-flex align-items-center gap-2">
                                  <span style={{ fontSize: "0.75rem" }}>{inv.title}:</span>
                                  {getStatusBadge(inv.status)}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          {patient.documents.length > 0 ? (
                            <div className="d-flex align-items-center gap-1">
                              <FileText size={14} className="text-primary" />
                              <span className="badge bg-info">{patient.documents.length}</span>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "0.8rem" }}>—</span>
                          )}
                        </td>
                        <td>
                          {pendingStep6.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {pendingStep6.map((inv) => (
                                inv.step6 && (
                                  <button
                                    key={inv.step6.id}
                                    className="btn btn-warning btn-sm"
                                    style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                                    disabled={updatingStepId === inv.step6.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveStep6(inv.step6!.id);
                                    }}
                                  >
                                    {updatingStepId === inv.step6.id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FileCheck size={12} className="me-1" />
                                        {inv.title} abnehmen
                                      </>
                                    )}
                                  </button>
                                )
                              ))}
                            </div>
                          ) : patient.investigations.some((i) => i.step6?.status === "COMPLETED") ? (
                            <span className="badge bg-success" style={{ fontSize: "0.75rem" }}>
                              <CheckCircle size={10} className="me-1" /> Abgenommen
                            </span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "0.8rem" }}>—</span>
                          )}
                        </td>
                        <td>
                          {hasInvestigations && (
                            <button className="btn btn-sm btn-link">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <div className="bg-light p-3">
                              <h6 className="fw-semibold mb-3">
                                Untersuchungsdetails für {patient.firstName} {patient.lastName}
                              </h6>

                              {patient.investigations.map((inv) => {
                                const progress = getProgress(inv);
                                return (
                                  <div key={inv.requirementId} className="card mb-3">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                      <div>
                                        <span className="fw-semibold">{inv.title}</span>
                                        <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7rem" }}>
                                          {inv.category}
                                        </span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="progress" style={{ width: 120, height: 8 }}>
                                          <div
                                            className={`progress-bar ${progress.percent === 100 ? "bg-success" : "bg-primary"}`}
                                            style={{ width: `${progress.percent}%` }}
                                          />
                                        </div>
                                        <span style={{ fontSize: "0.8rem" }}>
                                          {progress.percent}%
                                        </span>
                                        {getStatusBadge(inv.status)}
                                      </div>
                                    </div>
                                    <div className="card-body">
                                      <div className="table-responsive">
                                        <table className="table table-sm table-borderless mb-0">
                                          <thead>
                                            <tr className="text-muted" style={{ fontSize: "0.8rem" }}>
                                              <th>Schritt</th>
                                              <th>Beschreibung</th>
                                              <th>Status</th>
                                              <th style={{ width: "1%" }}></th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {inv.steps.map((step) => (
                                              <tr key={step.id}>
                                                <td className="fw-medium" style={{ fontSize: "0.85rem", width: 60 }}>
                                                  {step.stepNumber}.
                                                </td>
                                                <td style={{ fontSize: "0.85rem" }}>{step.stepName}</td>
                                                <td>{getStatusBadge(step.status)}</td>
                                                <td>{getStepStatusIcon(step.status)}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Schritt 6 Abnehmen Button */}
                                      {inv.step6 && inv.step6.status !== "COMPLETED" && (
                                        <div className="mt-3 pt-3 border-top">
                                          <button
                                            className="btn btn-success btn-sm"
                                            disabled={updatingStepId === inv.step6.id}
                                            onClick={() => handleApproveStep6(inv.step6!.id)}
                                          >
                                            {updatingStepId === inv.step6.id ? (
                                              <span className="spinner-border spinner-border-sm" role="status" />
                                            ) : (
                                              <>
                                                <FileCheck size={14} className="me-1" />
                                                Schritt 6: {inv.step6.name} abnehmen
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      )}

                                      {inv.step6?.status === "COMPLETED" && (
                                        <div className="mt-3 pt-3 border-top">
                                          <div className="alert alert-success py-2 mb-0" style={{ fontSize: "0.85rem" }}>
                                            <CheckCircle size={14} className="me-1" />
                                            Prüfung abgenommen
                                            {inv.step6.completedAt && (
                                              <span> am {new Date(inv.step6.completedAt).toLocaleDateString("de-DE")}</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="card-footer d-flex justify-content-between align-items-center">
                                      <Link
                                        href={`/dashboard/tasks/${inv.topLevelTaskId || "#"}`}
                                        className="btn btn-primary btn-sm"
                                      >
                                        <Eye size={14} className="me-1" />
                                        Zur Detailseite
                                      </Link>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Dokumente */}
                              {patient.documents.length > 0 && (
                                <div className="mt-3">
                                  <h6 className="fw-semibold mb-2">
                                    <FileText size={16} className="me-1" />
                                    Dokumente ({patient.documents.length})
                                  </h6>
                                  <div className="d-flex flex-wrap gap-2">
                                    {patient.documents.map((doc) => (
                                      <span
                                        key={doc.id}
                                        className="badge bg-light text-dark border"
                                        style={{ fontSize: "0.8rem" }}
                                        title={`Hochgeladen: ${new Date(doc.createdAt).toLocaleDateString("de-DE")}`}
                                      >
                                        <FileText size={10} className="me-1" />
                                        {doc.filename}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center p-3 border-top">
            <ul className="pagination mb-0">
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
                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
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
      </div>
    </div>
  );
}
