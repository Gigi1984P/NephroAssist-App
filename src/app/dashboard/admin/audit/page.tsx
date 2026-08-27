"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Shield, Clock, FileText, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  ipAddress?: string;
  timestamp: string;
  organization?: { name: string };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [skip, filterAction, filterEntityType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("skip", String(skip));
      if (filterAction) params.set("action", filterAction);
      if (filterEntityType) params.set("entityType", filterEntityType);

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-success text-white";
    if (action.includes("UPDATE")) return "bg-primary text-white";
    if (action.includes("DELETE")) return "bg-danger text-white";
    if (action.includes("PASSWORD")) return "bg-warning text-dark";
    return "bg-secondary text-white";
  };

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Nachvollziehbarkeit aller Systemaktivitäten"
      />

      {/* Filter */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <select
            className="form-select form-select-sm"
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setSkip(0); }}
          >
            <option value="">Alle Aktionen</option>
            <option value="CREATE">Erstellen</option>
            <option value="UPDATE">Ändern</option>
            <option value="DELETE">Löschen</option>
            <option value="STATUS_CHANGE">Status-Änderung</option>
            <option value="REVIEW">Prüfung</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select form-select-sm"
            value={filterEntityType}
            onChange={(e) => { setFilterEntityType(e.target.value); setSkip(0); }}
          >
            <option value="">Alle Entitäten</option>
            <option value="PATIENT">Patient</option>
            <option value="TASK">Task</option>
            <option value="DOCUMENT">Dokument</option>
            <option value="PATIENT_REQUIREMENT">Untersuchung</option>
            <option value="HELP_REQUEST">Hilfeanfrage</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilterAction(""); setFilterEntityType(""); setSkip(0); }}>
            <Filter size={14} className="me-1" /> Filter zurücksetzen
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted small">Insgesamt {total} Einträge</span>
        </div>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Zeitpunkt</th>
                <th>Aktion</th>
                <th>Entität</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">Laden...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">Keine Einträge gefunden.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-nowrap">
                      <div className="d-flex align-items-center gap-1">
                        <Clock size={14} className="text-muted" />
                        <span className="small">{formatDate(log.timestamp)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getActionColor(log.action)}`} style={{ fontSize: "0.75rem" }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FileText size={14} className="text-muted" />
                        <span className="small">{log.entityType}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-monospace small text-muted">{log.entityId.slice(0, 8)}...</span>
                      {log.ipAddress && <span className="text-muted small ms-2">· IP: {log.ipAddress}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-custom">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-muted small">
            {skip + 1} - {Math.min(skip + limit, total)} von {total}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setSkip(skip + limit)}
            disabled={skip + limit >= total}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
