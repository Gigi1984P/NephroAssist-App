"use client";

import { useState } from "react";
import { ClipboardList, Trash2, AlertTriangle, X, CheckCircle } from "lucide-react";

interface Task {
  id: string;
  status: string;
}

interface Template {
  id: string;
  name: string | null;
  category: string | null;
}

interface Requirement {
  id: string;
  status: string;
  dueDate: string | null;
  priority: number;
  required: boolean;
  listingBlocker: boolean;
  template: Template | null;
  tasks: Task[];
}

interface PatientRequirementsTableProps {
  patientId: string;
  requirements: Requirement[];
}

export default function PatientRequirementsTable({ patientId, requirements }: PatientRequirementsTableProps) {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete(requirementId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/assign-requirement?patientId=${patientId}&requirementId=${requirementId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Löschen fehlgeschlagen");
      }
    } catch {
      alert("Netzwerkfehler");
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("de-DE");
  }

  if (requirements.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <CheckCircle size={32} className="mb-2 text-success" />
        <div>Keine offenen Untersuchungen vorhanden</div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm mb-0">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Kategorie</th>
            <th>Status</th>
            <th>Fällig</th>
            <th>Offene Tasks</th>
            <th className="text-end">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((req) => {
            const openTasks = req.tasks.filter((t) => t.status !== "COMPLETED").length;
            const isConfirming = showConfirm === req.id;

            return (
              <tr key={req.id} className={isConfirming ? "table-danger" : ""}>
                <td>
                  <div className="fw-medium">{req.template?.name || "Untersuchung"}</div>
                  {req.required && <span className="badge bg-danger me-1">Pflicht</span>}
                  {req.listingBlocker && <span className="badge bg-warning text-dark">Blocking</span>}
                </td>
                <td>{req.template?.category || "—"}</td>
                <td>
                  <span className="badge bg-secondary">{req.status}</span>
                </td>
                <td>{formatDate(req.dueDate)}</td>
                <td>
                  {openTasks > 0 ? (
                    <span className="badge bg-warning text-dark">{openTasks} offen</span>
                  ) : (
                    <span className="badge bg-success">✓ Alle erledigt</span>
                  )}
                </td>
                <td className="text-end">
                  {isConfirming ? (
                    <div className="d-inline-flex align-items-center gap-2">
                      <AlertTriangle size={16} className="text-danger" />
                      <span className="text-danger small fw-medium">Wirklich löschen?</span>
                      <button
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => handleDelete(req.id)}
                        disabled={loading}
                        title="Löschen bestätigen"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        onClick={() => setShowConfirm(null)}
                        disabled={loading}
                        title="Abbrechen"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      onClick={() => setShowConfirm(req.id)}
                      title="Untersuchung entfernen"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
