"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  Plus, Edit3, Trash2, X, Save, AlertTriangle, UserPlus, ArrowLeft,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string | null;
  required: boolean;
  listingBlocker: boolean;
  status: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  cases: { id: string }[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Zuweisungs-Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState<Template | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | "">("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<"dental-clearance" | "cardiac-clearance" | "custom">("dental-clearance");

  // Formular-States
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRequired, setFormRequired] = useState(true);
  const [formBlocker, setFormBlocker] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [templatesRes, patientsRes] = await Promise.all([
        fetch("/api/examinations/templates", { credentials: "include" }),
        fetch("/api/patients", { credentials: "include" }),
      ]);
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }
      if (patientsRes.ok) {
        const data = await patientsRes.json();
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreate = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormCategory("");
    setFormDescription("");
    setFormRequired(true);
    setFormBlocker(false);
    setShowModal(true);
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormCategory(template.category);
    setFormDescription(template.description || "");
    setFormRequired(template.required);
    setFormBlocker(template.listingBlocker);
    setShowModal(true);
  };

  const openAssign = (template: Template) => {
    setAssigningTemplate(template);
    setSelectedPatient("");
    setSelectedCase(null);
    setSelectedWorkflow("dental-clearance");
    setShowAssignModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCategory.trim()) {
      setMessage({ type: "error", text: "Name und Kategorie sind Pflichtfelder" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const body = {
      name: formName.trim(),
      category: formCategory.trim(),
      description: formDescription.trim() || null,
      required: formRequired,
      listingBlocker: formBlocker,
    };

    try {
      let res;
      if (editingTemplate) {
        res = await fetch(`/api/examinations/templates/${editingTemplate.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/examinations/templates", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: editingTemplate ? "Template aktualisiert" : "Template erstellt",
        });
        setShowModal(false);
        await loadTemplates();
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/examinations/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Template gelöscht" });
        setDeleteConfirm(null);
        await loadTemplates();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler beim Löschen" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCase || !assigningTemplate) {
      setMessage({ type: "error", text: "Bitte Patient und Fall auswählen" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/examinations/assign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase,
          templateId: assigningTemplate.id,
          workflowType: selectedWorkflow,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `"${assigningTemplate.name}" erfolgreich zugewiesen`,
        });
        setShowAssignModal(false);
        setAssigningTemplate(null);
      } else {
        setMessage({ type: "error", text: data.error || "Fehler beim Zuweisen" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  // Gruppiere nach Kategorie
  const grouped: Record<string, Template[]> = {};
  templates.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  return (
    <div>
      <PageHeader
        title="Untersuchungs-Templates"
        description="Vordefinierte Untersuchungen verwalten und Patienten zuweisen"
        action={
          <button
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
            onClick={openCreate}
          >
            <Plus size={16} />
            <span>Neues Template</span>
          </button>
        }
      />

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mb-3`}>
          {message.text}
        </div>
      )}

      {loading && templates.length === 0 ? (
        <div className="text-center text-muted py-4">Laden...</div>
      ) : templates.length === 0 ? (
        <div className="alert alert-info">
          Keine Templates vorhanden. Erstellen Sie das erste Template.
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>{category}</strong>
                  <span className="badge bg-secondary ms-2">{items.length}</span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <tbody>
                    {items.map((template) => (
                      <tr key={template.id}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">{template.name}</span>
                            {template.required && <span className="badge bg-danger" style={{ fontSize: "0.65rem" }}>Pflicht</span>}
                            {template.listingBlocker && <span className="badge bg-warning text-dark" style={{ fontSize: "0.65rem" }}>Blocker</span>}
                          </div>
                          {template.description && (
                            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                              {template.description}
                            </div>
                          )}
                        </td>
                        <td className="align-middle" style={{ width: "1%", whiteSpace: "nowrap" }}>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => openAssign(template)}
                              title="Patient zuweisen"
                            >
                              <UserPlus size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEdit(template)}
                              title="Bearbeiten"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setDeleteConfirm(template.id)}
                              title="Löschen"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Template erstellen/bearbeiten */}
      {showModal && (
        <>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingTemplate ? "Template bearbeiten" : "Neues Template"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="z.B. Zahnstatus"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Kategorie *</label>
                    <select
                      className="form-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="">Kategorie wählen...</option>
                      <option>Zahnmedizin</option>
                      <option>Kardiologie</option>
                      <option>Radiologie</option>
                      <option>Labor</option>
                      <option>Haut</option>
                      <option>Augenheilkunde</option>
                      <option>Sonstiges</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Beschreibung</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Beschreibung der Untersuchung..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="requiredCheck"
                          checked={formRequired}
                          onChange={(e) => setFormRequired(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="requiredCheck">
                          Erforderliche Untersuchung
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="blockerCheck"
                          checked={formBlocker}
                          onChange={(e) => setFormBlocker(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="blockerCheck">
                          Listing Blocker
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    <X size={14} className="me-1" /> Abbrechen
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={!formName.trim() || !formCategory.trim() || loading}
                    onClick={handleSave}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <>
                        <Save size={14} className="me-1" /> Speichern
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Template einem Patienten zuweisen */}
      {showAssignModal && assigningTemplate && (
        <>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <UserPlus size={16} className="me-2" />
                    "{assigningTemplate.name}" zuweisen
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAssignModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="alert alert-info mb-3">
                    <strong>Template:</strong> {assigningTemplate.name}
                    <br />
                    <strong>Kategorie:</strong> {assigningTemplate.category}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Patient *</label>
                    <select
                      className="form-select"
                      value={selectedPatient}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setSelectedPatient(pid);
                        const patient = patients.find((p) => p.id === pid);
                        if (patient && patient.cases && patient.cases.length > 0) {
                          setSelectedCase(patient.cases[0].id);
                        } else {
                          setSelectedCase(null);
                        }
                      }}
                    >
                      <option value="">Patient auswählen...</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} {p.email ? `(${p.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Workflow *</label>
                    <select
                      className="form-select"
                      value={selectedWorkflow}
                      onChange={(e) => setSelectedWorkflow(e.target.value as any)}
                    >
                      <option value="dental-clearance">Dental Clearance (6 Schritte)</option>
                      <option value="cardiac-clearance">Herz-Kreislauf Clearance (6 Schritte)</option>
                      <option value="custom">Einfache Untersuchung (kein Workflow)</option>
                    </select>
                    <div className="form-text">
                      Der Workflow bestimmt die Schritte, die der Patient durchlaufen muss.
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAssignModal(false)}
                  >
                    <ArrowLeft size={14} className="me-1" /> Abbrechen
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={!selectedCase || loading}
                    onClick={handleAssign}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <>
                        <UserPlus size={14} className="me-1" /> Zuweisen
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lösch-Bestätigung */}
      {deleteConfirm && (
        <>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Template löschen?</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDeleteConfirm(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning d-flex align-items-center gap-2">
                    <AlertTriangle size={20} />
                    <span>Dieses Template wird dauerhaft gelöscht. Bereits zugewiesene Untersuchungen bleiben erhalten.</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(deleteConfirm)}
                  >
                    <Trash2 size={14} className="me-1" /> Löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
