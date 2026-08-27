"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, X, Check } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  required: boolean;
  listingBlocker: boolean;
  description?: string | null;
}

interface Props {
  patientId: string;
}

export default function InlineAssignRequirement({ patientId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/assign-requirement`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/assign-requirement`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, templateIds: selectedIds }),
      });
      if (res.ok) {
        setShowForm(false);
        setSelectedIds([]);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Zuweisen");
      }
    } catch {
      alert("Fehler beim Zuweisen");
    } finally {
      setSaving(false);
    }
  };

  const startAdd = () => {
    setShowForm(true);
    setSelectedIds([]);
    loadTemplates();
  };

  return (
    <div className="mb-2">
      {!showForm ? (
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          onClick={startAdd}
        >
          <Plus size={14} /> Untersuchung hinzufügen
        </button>
      ) : (
        <div className="border rounded p-3 bg-light">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <strong className="d-flex align-items-center gap-1">
              <ClipboardList size={16} /> Untersuchung(en) zuweisen
            </strong>
            <button
              className="btn btn-link btn-sm text-decoration-none p-0"
              onClick={() => setShowForm(false)}
            >
              <X size={16} /> Abbrechen
            </button>
          </div>

          {loading ? (
            <div className="text-muted py-2">Lade verfügbare Untersuchungen...</div>
          ) : templates.length === 0 ? (
            <div className="text-muted py-2">Alle verfügbaren Untersuchungen sind bereits zugewiesen.</div>
          ) : (
            <>
              <div className="table-responsive" style={{ maxHeight: "300px", overflow: "auto" }}>
                <table className="table table-hover table-sm mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: "40px" }}></th>
                      <th>Name</th>
                      <th>Kategorie</th>
                      <th>Wichtig</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => toggleSelect(t.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedIds.includes(t.id)}
                            onChange={() => toggleSelect(t.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>
                          <div className="fw-medium">{t.name}</div>
                          {t.description && (
                            <small className="text-muted">{t.description}</small>
                          )}
                        </td>
                        <td>{t.category}</td>
                        <td>
                          {t.required && <span className="badge bg-danger me-1">Pflicht</span>}
                          {t.listingBlocker && <span className="badge bg-warning text-dark">Blocking</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <span className="text-muted">{selectedIds.length} ausgewählt</span>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                  onClick={handleAssign}
                  disabled={selectedIds.length === 0 || saving}
                >
                  {saving ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <Check size={14} /> {selectedIds.length} zuweisen
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
