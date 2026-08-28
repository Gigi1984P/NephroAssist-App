"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  LifeBuoy,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";

interface CoordinatorQueueData {
  actionRequired: QueueItem[];
  blockers: BlockerItem[];
  reviewPending: DocItem[];
  helpRequests: HelpItem[];
  stuckPatients: StuckItem[];
  nextActions: NextActionItem[];
}

interface QueueItem {
  patientId: string;
  patientName: string;
  caseId: string;
  caseStatus: string;
  nextAction: string | null;
  dueDate: string | null;
  blockerCount: number;
}

interface BlockerItem {
  id: string;
  type: string;
  description: string | null;
  patientName: string;
  caseId: string;
  createdAt: string;
}

interface DocItem {
  id: string;
  filename: string;
  processingStatus: string;
  patientName: string;
  createdAt: string;
}

interface HelpItem {
  id: string;
  type: string;
  description: string | null;
  status: string;
  patientName: string;
  caseId: string;
  createdAt: string;
}

interface StuckItem {
  caseId: string;
  patientName: string;
  daysSinceActivity: number | null;
  overdueCount: number;
}

interface NextActionItem {
  caseId: string;
  caseStatus: string;
  patient: { id: string; firstName: string; lastName: string };
  progress: { total: number; completed: number; attentionNeeded: number };
  nextRequirement: { id: string; title: string; dueDate: string | null } | null;
  overdue: { id: string; title: string; dueDate: string | null }[];
  expiring: { id: string; title: string; expiresAt: string | null }[];
  blockers: { id: string; type: string; description: string | null }[];
}

export default function CoordinatorQueueClient() {
  const [data, setData] = useState<CoordinatorQueueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [blockersRes, helpRes, reviewRes, stuckRes, nextRes] = await Promise.all([
        fetch("/api/blockers", { credentials: "include" }),
        fetch("/api/help-requests", { credentials: "include" }),
        fetch("/api/documents/review-queue", { credentials: "include" }),
        fetch("/api/analytics/stuck-patients", { credentials: "include" }),
        fetch("/api/analytics/next-actions", { credentials: "include" }),
      ]);

      const [blockersData, helpData, reviewData, stuckData, nextData] = await Promise.all([
        blockersRes.ok ? blockersRes.json() : { blockers: [] },
        helpRes.ok ? helpRes.json() : { helpRequests: [] },
        reviewRes.ok ? reviewRes.json() : { documents: [] },
        stuckRes.ok ? stuckRes.json() : { stuckPatients: [] },
        nextRes.ok ? nextRes.json() : { nextActions: [] },
      ]);

      // Build action-required items from next-actions
      const actionRequired: QueueItem[] = (nextData.nextActions || [])
        .filter((na: NextActionItem) =>
          na.nextRequirement || na.overdue.length > 0 || na.blockers.length > 0
        )
        .map((na: NextActionItem) => ({
          patientId: na.patient.id,
          patientName: `${na.patient.firstName} ${na.patient.lastName}`,
          caseId: na.caseId,
          caseStatus: na.caseStatus,
          nextAction: na.nextRequirement?.title || null,
          dueDate: na.nextRequirement?.dueDate || null,
          blockerCount: na.blockers.length,
        }));

      const blockers: BlockerItem[] = (blockersData.blockers || []).map((b: any) => ({
        id: b.id,
        type: b.type,
        description: b.description,
        patientName: `${b.patientCase?.patient?.firstName || ""} ${b.patientCase?.patient?.lastName || ""}`.trim(),
        caseId: b.patientCase?.id || "",
        createdAt: b.createdAt,
      }));

      const reviewPending: DocItem[] = (reviewData.documents || [])
        .filter((d: any) => d.processingStatus === "READY_FOR_REVIEW")
        .map((d: any) => ({
          id: d.id,
          filename: d.filename,
          processingStatus: d.processingStatus,
          patientName: `${d.patient?.firstName || ""} ${d.patient?.lastName || ""}`.trim(),
          createdAt: d.createdAt,
        }));

      const helpRequests: HelpItem[] = (helpData.helpRequests || []).map((h: any) => ({
        id: h.id,
        type: h.type,
        description: h.description,
        status: h.status,
        patientName: `${h.patient?.firstName || ""} ${h.patient?.lastName || ""}`.trim(),
        caseId: h.caseId,
        createdAt: h.createdAt,
      }));

      const stuckPatients: StuckItem[] = (stuckData.stuckPatients || []).map((s: any) => ({
        caseId: s.caseId,
        patientName: `${s.patient?.firstName || ""} ${s.patient?.lastName || ""}`.trim(),
        daysSinceActivity: s.daysSinceActivity,
        overdueCount: (s.overdueRequirements || []).length,
      }));

      setData({
        actionRequired,
        blockers,
        reviewPending,
        helpRequests,
        stuckPatients,
        nextActions: nextData.nextActions || [],
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasStuck = data.stuckPatients.length > 0;

  return (
    <div>
      {/* Stuck Patients Alert Banner */}
      {hasStuck && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertOctagon size={18} />
          <div className="flex-grow-1">
            <strong>{data.stuckPatients.length} Patient(en) sind stecken geblieben</strong> — keine Aktivität in 14 Tagen oder überfällige Anforderungen.
          </div>
          <Link href="/dashboard/patients" className="btn btn-sm btn-outline-danger">
            Patienten ansehen <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="stat-value">{data.blockers.length}</div>
              <div className="stat-label">Aktive Blocker</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon orange">
              <FileText size={20} />
            </div>
            <div>
              <div className="stat-value">{data.reviewPending.length}</div>
              <div className="stat-label">Review ausstehend</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon blue">
              <LifeBuoy size={20} />
            </div>
            <div>
              <div className="stat-value">{data.helpRequests.length}</div>
              <div className="stat-label">Help Requests offen</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon purple">
              <Clock size={20} />
            </div>
            <div>
              <div className="stat-value">{data.stuckPatients.length}</div>
              <div className="stat-label">Stuck Patienten</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Best Actions Cards */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <CheckCircle size={18} style={{ color: "#3b82f6" }} />
          <h2 className="h5 fw-bold mb-0" style={{ color: "#1e293b" }}>Nächste Beste Aktionen</h2>
        </div>
        {data.nextActions.length === 0 ? (
          <div className="dashboard-card p-4 text-center text-muted">
            Keine aktiven Fälle mit offenen Aktionen.
          </div>
        ) : (
          <div className="row g-3">
            {data.nextActions.slice(0, 6).map((na) => {
              const percent = na.progress.total > 0
                ? Math.round((na.progress.completed / na.progress.total) * 100)
                : 0;
              const hasCritical = na.blockers.length > 0 || na.overdue.length > 0;
              return (
                <div className="col-md-6 col-lg-4" key={na.caseId}>
                  <div className={`dashboard-card h-100 ${hasCritical ? "border-danger" : ""}`}>
                    <div className="card-body-custom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Link
                          href={`/dashboard/patients/${na.patient.id}/clinic`}
                          className="fw-semibold text-decoration-none"
                          style={{ color: "#1e293b", fontSize: "0.95rem" }}
                        >
                          {na.patient.firstName} {na.patient.lastName}
                        </Link>
                        {hasCritical && (
                          <span className="badge bg-danger">Kritisch</span>
                        )}
                      </div>
                      <div className="mb-2">
                        <div className="progress" style={{ height: 6, borderRadius: 3 }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${percent}%`, borderRadius: 3 }}
                          />
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <span className="small text-muted">{na.progress.completed} / {na.progress.total} erledigt</span>
                          <span className="small fw-medium" style={{ color: percent === 100 ? "#198754" : "#0d6efd" }}>
                            {percent}%
                          </span>
                        </div>
                      </div>

                      {na.nextRequirement && (
                        <div className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ background: "#eff6ff", fontSize: "0.85rem" }}>
                          <ArrowRight size={14} style={{ color: "#1e40af", flexShrink: 0 }} />
                          <span className="fw-medium" style={{ color: "#1e40af" }}>Nächster Schritt:</span>
                          <span className="text-truncate" style={{ color: "#1e293b" }}>{na.nextRequirement.title}</span>
                        </div>
                      )}

                      {na.overdue.length > 0 && (
                        <div className="mb-2">
                          <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: "0.8rem", color: "#dc3545" }}>
                            <AlertTriangle size={12} />
                            <span className="fw-medium">Überfällig:</span>
                          </div>
                          {na.overdue.slice(0, 2).map((o) => (
                            <div key={o.id} className="small text-muted" style={{ fontSize: "0.8rem", paddingLeft: 16 }}>
                              • {o.title}
                            </div>
                          ))}
                          {na.overdue.length > 2 && (
                            <div className="small text-muted" style={{ fontSize: "0.8rem", paddingLeft: 16 }}>
                              +{na.overdue.length - 2} weitere
                            </div>
                          )}
                        </div>
                      )}

                      {na.blockers.length > 0 && (
                        <div className="d-flex align-items-center gap-1 mt-2" style={{ fontSize: "0.8rem", color: "#dc3545" }}>
                          <AlertOctagon size={12} />
                          <span>{na.blockers.length} Blocker aktiv</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Aktion erforderlich */}
      <div className="dashboard-card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2">
            <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
            Aktion erforderlich
          </span>
          <span className="badge bg-warning text-dark">{data.actionRequired.length}</span>
        </div>
        <div className="card-body-custom p-0">
          {data.actionRequired.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <CheckCircle size={24} className="text-muted mb-2" />
              <div className="fw-medium">Alles erledigt!</div>
              <div className="small">Keine Patienten benötigen aktuell eine Aktion.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Nächste Aktion</th>
                    <th>Fällig</th>
                    <th>Blocker</th>
                    <th className="text-end">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.actionRequired.map((item) => (
                    <tr key={item.caseId}>
                      <td>
                        <Link href={`/dashboard/patients/${item.patientId}/clinic`} className="fw-medium text-decoration-none" style={{ color: "#1e293b" }}>
                          {item.patientName}
                        </Link>
                      </td>
                      <td>
                        <CaseStatusBadge status={item.caseStatus} />
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 200 }}>
                        {item.nextAction || "—"}
                      </td>
                      <td>
                        {item.dueDate ? (
                          <span className="badge bg-warning text-dark">
                            <Clock size={10} className="me-1" />
                            {new Date(item.dueDate).toLocaleDateString("de-DE")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {item.blockerCount > 0 ? (
                          <span className="badge bg-danger">{item.blockerCount}</span>
                        ) : (
                          <span className="text-muted">0</span>
                        )}
                      </td>
                      <td className="text-end">
                        <Link href={`/dashboard/patients/${item.patientId}/clinic`} className="btn btn-sm btn-outline-primary">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Blocker aktiv */}
      <div className="dashboard-card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2">
            <AlertOctagon size={16} style={{ color: "#dc3545" }} />
            Blocker aktiv
          </span>
          <span className="badge bg-danger">{data.blockers.length}</span>
        </div>
        <div className="card-body-custom p-0">
          {data.blockers.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <CheckCircle size={24} className="text-muted mb-2" />
              <div className="fw-medium">Keine aktiven Blocker</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Typ</th>
                    <th>Beschreibung</th>
                    <th className="text-end">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.blockers.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <Link href={`/dashboard/patients/${b.caseId}/clinic`} className="fw-medium text-decoration-none" style={{ color: "#1e293b" }}>
                          {b.patientName}
                        </Link>
                      </td>
                      <td><BlockerTypeBadge type={b.type} /></td>
                      <td className="text-truncate" style={{ maxWidth: 300 }}>{b.description || "—"}</td>
                      <td className="text-end">
                        <Link href={`/dashboard/blockers`} className="btn btn-sm btn-outline-danger">
                          Zum Blocker
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review ausstehend */}
      <div className="dashboard-card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2">
            <FileText size={16} style={{ color: "#f59e0b" }} />
            Review ausstehend
          </span>
          <span className="badge bg-warning text-dark">{data.reviewPending.length}</span>
        </div>
        <div className="card-body-custom p-0">
          {data.reviewPending.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <CheckCircle size={24} className="text-muted mb-2" />
              <div className="fw-medium">Keine Reviews ausstehend</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Dokument</th>
                    <th>Hochgeladen</th>
                    <th className="text-end">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reviewPending.map((d) => (
                    <tr key={d.id}>
                      <td className="fw-medium">{d.patientName}</td>
                      <td>{d.filename}</td>
                      <td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("de-DE") : "—"}</td>
                      <td className="text-end">
                        <Link href="/dashboard/documents" className="btn btn-sm btn-outline-primary">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Help Requests offen */}
      <div className="dashboard-card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2">
            <LifeBuoy size={16} style={{ color: "#0d6efd" }} />
            Help Requests offen
          </span>
          <span className="badge bg-primary">{data.helpRequests.length}</span>
        </div>
        <div className="card-body-custom p-0">
          {data.helpRequests.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <CheckCircle size={24} className="text-muted mb-2" />
              <div className="fw-medium">Keine offenen Help Requests</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Typ</th>
                    <th>Beschreibung</th>
                    <th>Status</th>
                    <th className="text-end">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.helpRequests.map((h) => (
                    <tr key={h.id}>
                      <td className="fw-medium">{h.patientName}</td>
                      <td><HelpTypeBadge type={h.type} /></td>
                      <td className="text-truncate" style={{ maxWidth: 250 }}>{h.description || "—"}</td>
                      <td><HelpStatusBadge status={h.status} /></td>
                      <td className="text-end">
                        <Link href="/dashboard/help-requests" className="btn btn-sm btn-outline-primary">
                          Öffnen
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    REFERRAL: { cls: "bg-secondary", label: "Referral" },
    INTAKE: { cls: "bg-info text-dark", label: "Aufnahme" },
    EVALUATION: { cls: "bg-primary", label: "Evaluation" },
    READY_FOR_REVIEW: { cls: "bg-warning text-dark", label: "Bereit für Review" },
    UNDER_REVIEW: { cls: "bg-warning text-dark", label: "In Review" },
    DEFERRED: { cls: "bg-secondary", label: "Zurückgestellt" },
    APPROVED: { cls: "bg-success", label: "Genehmigt" },
    WAITLISTED: { cls: "bg-success", label: "Warteliste" },
    INACTIVE: { cls: "bg-secondary", label: "Inaktiv" },
    TRANSPLANTED: { cls: "bg-success", label: "Transplantiert" },
    CLOSED: { cls: "bg-secondary", label: "Geschlossen" },
  };
  const entry = map[status] || { cls: "bg-secondary", label: status };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}

function BlockerTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    MISSING_PRESCRIPTION: "Fehlendes Rezept",
    NO_APPOINTMENT: "Kein Termin",
    MISSING_DOCUMENT: "Fehlendes Dokument",
    REJECTED_DOCUMENT: "Abgelehntes Dokument",
    PATIENT_NEEDS_HELP: "Patient braucht Hilfe",
    CLINIC_REVIEW_OVERDUE: "Review überfällig",
    EXTERNAL_PROVIDER_DELAY: "Externe Verzögerung",
    EXPIRED_EXAMINATION: "Abgelaufene Untersuchung",
    OTHER: "Sonstiges",
  };
  return <span className="badge bg-danger">{map[type] || type}</span>;
}

function HelpTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    I_DONT_UNDERSTAND: "Nicht verstanden",
    NO_APPOINTMENT: "Kein Termin",
    MISSING_PRESCRIPTION: "Fehlendes Rezept",
    DOCTOR_WONT_ISSUE: "Arzt stellt nicht aus",
    TRANSPORT: "Transport",
    LANGUAGE: "Sprache",
    ORGANIZATIONAL: "Organisatorisch",
    OTHER: "Sonstiges",
  };
  return <span className="badge bg-info text-dark">{map[type] || type}</span>;
}

function HelpStatusBadge({ status }: { status: string }) {
  const cls =
    status === "OPEN"
      ? "bg-warning text-dark"
      : status === "IN_PROGRESS"
      ? "bg-primary"
      : "bg-success";
  const label =
    status === "OPEN"
      ? "Offen"
      : status === "IN_PROGRESS"
      ? "In Bearbeitung"
      : "Gelöst";
  return <span className={`badge ${cls}`}>{label}</span>;
}
