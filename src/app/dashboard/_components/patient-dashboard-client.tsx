"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Hourglass,
  ArrowRight,
} from "lucide-react";

interface Requirement {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  patientFriendlyDescription: string | null;
  category: string;
}

interface Appointment {
  id: string;
  type: string;
  provider: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  notes: string | null;
}

interface PatientDashboardClientProps {
  userName: string;
  requirements: Requirement[];
  appointments: Appointment[];
  nowIso: string;
  sevenDaysAgoIso: string;
  thirtyDaysFromNowIso: string;
}

export default function PatientDashboardClient({
  userName,
  requirements,
  appointments,
  nowIso,
  sevenDaysAgoIso,
  thirtyDaysFromNowIso,
}: PatientDashboardClientProps) {
  const now = new Date(nowIso);
  const sevenDaysAgo = new Date(sevenDaysAgoIso);
  const thirtyDaysFromNow = new Date(thirtyDaysFromNowIso);

  const jetztErledigen = requirements.filter(
    (r) => r.status === "ACTION_REQUIRED"
  );
  const termine = appointments;
  const wartenAufAndere = requirements.filter(
    (r) => r.status === "WAITING_FOR_REVIEW" || r.status === "WAITING_FOR_DOCUMENT" || r.status === "WAITING_FOR_APPOINTMENT" || r.status === "UNDER_REVIEW"
  );
  const lauftBaldAb = requirements.filter(
    (r) =>
      r.expiresAt &&
      new Date(r.expiresAt) <= thirtyDaysFromNow &&
      new Date(r.expiresAt) >= now &&
      r.status !== "ACCEPTED" &&
      r.status !== "WAIVED" &&
      r.status !== "NOT_APPLICABLE"
  );
  const erledigt = requirements.filter(
    (r) =>
      r.completedAt &&
      new Date(r.completedAt) >= sevenDaysAgo &&
      (r.status === "ACCEPTED" || r.status === "WAIVED" || r.status === "NOT_APPLICABLE")
  );

  const totalCount = requirements.length;
  const completedCount = requirements.filter(
    (r) => r.status === "ACCEPTED" || r.status === "WAIVED" || r.status === "NOT_APPLICABLE"
  ).length;
  const attentionCount = requirements.filter(
    (r) => r.status === "ACTION_REQUIRED" || r.status === "RENEWAL_REQUIRED" || r.status === "EXPIRED"
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-success";
      case "PLANNED": return "bg-primary";
      case "RESCHEDULE_REQUIRED": return "bg-warning text-dark";
      case "CANCELLED": return "bg-secondary";
      default: return "bg-info text-dark";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "Bestätigt";
      case "PLANNED": return "Geplant";
      case "RESCHEDULE_REQUIRED": return "Neu terminieren";
      case "CANCELLED": return "Abgesagt";
      case "COMPLETED": return "Abgeschlossen";
      case "NO_SHOW": return "Nicht erschienen";
      default: return status;
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Willkommen */}
      <div className="mb-4">
        <h2 className="h3 fw-bold mb-1" style={{ color: "#1e293b" }}>
          Willkommen zurück{userName ? `, ${userName}` : ""}!
        </h2>
        <p className="text-muted mb-0">Hier ist ein Überblick über Ihre aktuellen Aktivitäten.</p>
      </div>

      {/* Patient-friendly Progress Card */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div
              className="d-flex align-items-center justify-content-center fw-bold text-white"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: completedCount === totalCount && totalCount > 0 ? "#198754" : "#3b82f6",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              {completedCount}
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold" style={{ fontSize: "1rem", color: "#1e293b" }}>
                {totalCount > 0 ? (
                  <>
                    <span className="text-primary fw-bold">{completedCount}</span> von{" "}
                    <span className="fw-bold">{totalCount}</span> erledigt
                  </>
                ) : (
                  "Noch keine Anforderungen"
                )}
              </div>
              <div className="progress mt-2" style={{ height: 8, borderRadius: 4 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%`,
                    borderRadius: 4,
                    background: completedCount === totalCount && totalCount > 0 ? "#198754" : "#3b82f6",
                  }}
                />
              </div>
            </div>
          </div>
          {attentionCount > 0 ? (
            <div
              className="d-flex align-items-center gap-2 p-3 rounded"
              style={{ background: "#fef3c7", border: "1px solid #fde68a", fontSize: "0.9rem", color: "#92400e" }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span className="fw-medium">
                {attentionCount} {attentionCount === 1 ? "Ding" : "Dinge"} brauchen Ihre Aufmerksamkeit
              </span>
            </div>
          ) : totalCount > 0 ? (
            <div
              className="d-flex align-items-center gap-2 p-3 rounded"
              style={{ background: "#dcfce7", border: "1px solid #86efac", fontSize: "0.9rem", color: "#166534" }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span className="fw-medium">Alles erledigt — super! 🎉</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Two-column layout for remaining sections */}
      <div className="row g-4">
        {/* Left column */}
        <div className="col-lg-6">
          {/* Jetzt erledigen */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
                Jetzt erledigen
              </span>
              {jetztErledigen.length > 0 && (
                <span className="badge bg-warning text-dark">{jetztErledigen.length}</span>
              )}
            </div>
            <div className="card-body-custom p-0">
              {jetztErledigen.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <CheckCircle size={24} className="text-muted mb-2" />
                  <div className="fw-medium">Keine dringenden Aufgaben</div>
                  <div className="small">Sie sind auf dem Laufenden.</div>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {jetztErledigen.map((r) => (
                    <Link
                      key={r.id}
                      href={`/dashboard/tasks/${r.id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <div className="fw-medium" style={{ color: "#1e293b" }}>
                          {r.patientFriendlyDescription || r.title}
                        </div>
                        {r.dueDate && (
                          <div className="small text-muted">
                            Fällig: {new Date(r.dueDate).toLocaleDateString("de-DE")}
                          </div>
                        )}
                      </div>
                      <ArrowRight size={16} className="text-muted mt-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Läuft bald ab */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <Clock size={16} style={{ color: "#dc3545" }} />
                Läuft bald ab
              </span>
              {lauftBaldAb.length > 0 && (
                <span className="badge bg-danger">{lauftBaldAb.length}</span>
              )}
            </div>
            <div className="card-body-custom p-0">
              {lauftBaldAb.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <CheckCircle size={24} className="text-muted mb-2" />
                  <div className="fw-medium">Keine ablaufenden Anforderungen</div>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {lauftBaldAb.map((r) => (
                    <div key={r.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-medium" style={{ color: "#1e293b" }}>
                          {r.patientFriendlyDescription || r.title}
                        </span>
                        <span className="badge bg-warning text-dark">
                          <Clock size={10} className="me-1" />
                          {r.expiresAt && new Date(r.expiresAt).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Erledigt */}
          <div className="dashboard-card">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <CheckCircle size={16} style={{ color: "#198754" }} />
                Erledigt (letzte 7 Tage)
              </span>
              {erledigt.length > 0 && (
                <span className="badge bg-success">{erledigt.length}</span>
              )}
            </div>
            <div className="card-body-custom p-0">
              {erledigt.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <div className="fw-medium">Keine kürzlich erledigten Anforderungen</div>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {erledigt.map((r) => (
                    <div key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span style={{ color: "#334155" }}>
                        <CheckCircle size={14} className="text-success me-2" />
                        {r.patientFriendlyDescription || r.title}
                      </span>
                      <span className="small text-muted">
                        {r.completedAt && new Date(r.completedAt).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-6">
          {/* Termine */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <Calendar size={16} />
                Termine
              </span>
              <Link href="/dashboard/appointments" className="btn btn-sm btn-outline-primary">
                Alle ansehen →
              </Link>
            </div>
            <div className="card-body-custom p-0">
              {termine.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <Calendar size={24} className="text-muted mb-2" />
                  <div className="fw-medium">Keine anstehenden Termine</div>
                  <div className="small">Sobald Termine vereinbart sind, erscheinen sie hier.</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Termin</th>
                        <th>Typ</th>
                        <th>Ort</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {termine.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            <div className="fw-medium">{formatDateTime(apt.startTime)}</div>
                            {apt.endTime && (
                              <div className="small text-muted">
                                bis{" "}
                                {new Date(apt.endTime).toLocaleTimeString("de-DE", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="fw-medium">{apt.type || "—"}</div>
                            {apt.provider && <div className="small text-muted">{apt.provider}</div>}
                          </td>
                          <td>
                            <span className="small">{apt.location || "—"}</span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(apt.status)}`}>
                              {getStatusLabel(apt.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Warten auf andere */}
          <div className="dashboard-card">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <Hourglass size={16} style={{ color: "#6c757d" }} />
                Warten auf andere
              </span>
              {wartenAufAndere.length > 0 && (
                <span className="badge bg-secondary">{wartenAufAndere.length}</span>
              )}
            </div>
            <div className="card-body-custom p-0">
              {wartenAufAndere.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <div className="fw-medium">Nichts in Warteschlange</div>
                  <div className="small">Keine Anforderungen warten auf andere.</div>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {wartenAufAndere.map((r) => (
                    <div key={r.id} className="list-group-item">
                      <div className="fw-medium" style={{ color: "#1e293b" }}>
                        {r.patientFriendlyDescription || r.title}
                      </div>
                      <div className="small text-muted">
                        <RequirementStatusLabel status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementStatusLabel({ status }: { status: string }) {
  const map: Record<string, string> = {
    WAITING_FOR_REVIEW: "Wartet auf Review",
    WAITING_FOR_DOCUMENT: "Wartet auf Dokument",
    WAITING_FOR_APPOINTMENT: "Wartet auf Termin",
    UNDER_REVIEW: "In Review",
    NOT_STARTED: "Nicht gestartet",
    ACTION_REQUIRED: "Aktion erforderlich",
    IN_PROGRESS: "In Bearbeitung",
    DOCUMENT_UPLOADED: "Dokument hochgeladen",
    ACCEPTED: "Akzeptiert",
    REJECTED: "Abgelehnt",
    BLOCKED: "Blockiert",
    EXPIRED: "Abgelaufen",
    RENEWAL_REQUIRED: "Erneuerung nötig",
    WAIVED: "Entfallen",
    NOT_APPLICABLE: "Nicht zutreffend",
  };
  return <span>{map[status] || status}</span>;
}
