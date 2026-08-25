"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Plus, Pencil, Trash2, UserPlus, History, Tag, Clock, FileText,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string | null;
  required: boolean;
  listingBlocker: boolean;
  validityDuration: number | null;
  renewalLeadTime: number | null;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

export default function RequirementsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Assign Form
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientCaseId, setSelectedPatientCaseId] = useState("");
  const [patientCases, setPatientCases] = useState<{id: string; name: string}[]>([]);
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Create / Edit Template Form
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRequired, setFormRequired] = useState(true);
  const [formBlocker, setFormBlocker] = useState(false);
  const [formValidity, setFormValidity] = useState<number | undefined>(undefined);
  const [formRenewalLead, setFormRenewalLead] = useState<number | undefined>(undefined);
  const [templateSaving, setTemplateSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, patientsRes] = await Promise.all([
        fetch("/api/examinations/templates", { credentials: "include" }),
        fetch("/api/patients/overview", { credentials: "include" }),
      ]);
      const templatesData = await templatesRes.json();
      const patientsData = await patientsRes.json();
      setTemplates(templatesData.templates || []);
      const user = patientsData.user || patientsData;
      setPatients(user || []);
    } catch {
      setMessage({ type: "error", text: "Fehler beim Laden" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Patient-Cases laden wenn Patient ausgewählt
  useEffect(() => {
    if (!selectedPatientId) {
      setPatientCases([]);
      return;
    }
    fetch(`/api/patients/${selectedPatientId}/cases`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const user = data.user || data;
        setPatientCases(user || []);
        if ((user || []).length === 1) {
          setSelectedPatientCaseId(user[0].id);
        }
      })
      .catch(() => setPatientCases([]));
  }, [selectedPatientId]);

  // ---- Assign ----
  const handleAssign = async () => {
    if (!selectedTemplate || !selectedPatientCaseId || !assignDueDate) {
      setMessage({ type: "error", text: "Template, Fall und Fälligkeitsdatum sind Pflicht" });
      return;
    }
    setAssignLoading(true);
    try {
      const res = await fetch("/api/examinations/assign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          caseId: selectedPatientCaseId,
          dueDate: assignDueDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Anforderung zugewiesen" });
        setShowAssignModal(false);
        resetAssignForm();
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setAssignLoading(false);
    }
  };

  // ---- Create ----
  const handleCreateTemplate = async () => {
    if (!formName.trim() || !formCategory.trim()) {
      setMessage({ type: "error", text: "Name und Kategorie sind Pflicht" });
      return;
    }
    setTemplateSaving(true);
    try {
      const res = await fetch("/api/examinations/templates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          category: formCategory.trim(),
          description: formDescription.trim() || null,
          required: formRequired,
          listingBlocker: formBlocker,
          validityDuration: formValidity,
          renewalLeadTime: formRenewalLead,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Template erstellt" });
        setShowCreateModal(false);
        resetCreateForm();
        loadData();
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setTemplateSaving(false);
    }
  };

  // ---- Edit ----
  const openEdit = (template: Template) => {
    setSelectedTemplate(template);
    setFormName(template.name);
    setFormCategory(template.category);
    setFormDescription(template.description || "");
    setFormRequired(template.required);
    setFormBlocker(template.listingBlocker);
    setFormValidity(template.validityDuration ?? undefined);
    setFormRenewalLead(template.renewalLeadTime ?? undefined);
    setShowEditModal(true);
  };

  const handleEditTemplate = async () => {
    if (!selectedTemplate || !formName.trim() || !formCategory.trim()) {
      setMessage({ type: "error", text: "Name und Kategorie sind Pflicht" });
      return;
    }
    setTemplateSaving(true);
    try {
      const res = await fetch(`/api/examinations/templates/${selectedTemplate.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          category: formCategory.trim(),
          description: formDescription.trim() || null,
          required: formRequired,
          listingBlocker: formBlocker,
          validityDuration: formValidity,
          renewalLeadTime: formRenewalLead,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Template aktualisiert" });
        setShowEditModal(false);
        resetCreateForm();
        loadData();
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setTemplateSaving(false);
    }
  };

  // ---- Delete ----
  const openDelete = (template: Template) => {
    setSelectedTemplate(template);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch(`/api/examinations/templates/${selectedTemplate.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Template gelöscht" });
        setShowDeleteConfirm(false);
        setSelectedTemplate(null);
        loadData();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler beim Löschen" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    }
  };

  // ---- Version ----
  const handlePublishVersion = async (templateId: string, changes?: string) => {
    try {
      const res = await fetch(`/api/examinations/templates/${templateId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyTo: "NEW_ONLY", changes }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Neue Version veröffentlicht" });
        loadData();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    }
  };

  const resetAssignForm = () => {
    setSelectedTemplate(null);
    setSelectedPatientId("");
    setSelectedPatientCaseId("");
    setAssignDueDate("");
    setPatientCases([]);
  };

  const resetCreateForm = () => {
    setFormName("");
    setFormCategory("");
    setFormDescription("");
    setFormRequired(true);
    setFormBlocker(false);
    setFormValidity(undefined);
    setFormRenewalLead(undefined);
  };

  const openAssign = () => {
    setSelectedTemplate(null);
    setShowAssignModal(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Templates nach Kategorie gruppieren
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div>
      <PageHeader title="Anforderungen (Untersuchungen)" />

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show mb-3`}>
          {message.text}
          <button className="btn-close" onClick={() => setMessage(null)} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4">
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={openAssign}>
          <UserPlus size={16} /> Untersuchung anlegen
        </button>
        <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Neues Template
        </button>
      </div>

      {/* Templates nach Kategorie als Cards */}
      {loading ? (
        <div className="text-center py-5 text-muted">Laden...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-5 text-muted">Keine Templates vorhanden</div>
      ) : (
        <div className="row g-4">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category} className="col-12">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Tag size={18} className="text-primary" />
                <h5 className="fw-bold mb-0">{category}</h5>
                <span className="badge bg-secondary">{categoryTemplates.length}</span>
              </div>
              <div className="row g-3">
                {categoryTemplates.map((template) => (
                  <div key={template.id} className="col-md-6 col-lg-4">
                    <div className="dashboard-card h-100">
                      <div className="card-body-custom">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle"
                              style={{ width: 32, height: 32, background: "#e0e7ff", color: "#4338ca" }}
                            >
                              <FileText size={16} />
                            </div>
                            <div>
                              <div className="fw-semibold">{template.name}</div>
                            </div>
                          </div>
                          <span className={`badge ${template.status === "PUBLISHED" ? "bg-success" : "bg-warning text-dark"}`}>
                            v{template.version} {template.status === "PUBLISHED" ? "●" : "Entwurf"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-muted small mb-3" style={{ minHeight: 40 }}>
                          {template.description || "Keine Beschreibung"}
                        </p>

                        {/* Meta Info */}
                        <div className="d-flex flex-column gap-1 mb-3">
                          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.8rem" }}>
                            <Clock size={12} />
                            <span>Erstellt: {formatDate(template.createdAt)}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.8rem" }}>
                            <History size={12} />
                            <span>Aktualisiert: {formatDate(template.updatedAt)}</span>
                          </div>
                          {template.validityDuration && (
                            <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.8rem" }}>
                              <Tag size={12} />
                              <span>Gültigkeit: {template.validityDuration} Monate</span>
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="d-flex gap-1 mb-3">
                          {template.required && <span className="badge bg-danger">Pflicht</span>}
                          {template.listingBlocker && <span className="badge bg-warning text-dark">Blocker</span>}
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" onClick={() => openEdit(template)}>
                            <Pencil size={12} /> Bearbeiten
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowVersionModal(true);
                            }}
                          >
                            <History size={12} /> v{template.version + 1}
                          </button>
                          <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onClick={() => openDelete(template)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Untersuchung anlegen</h5>
                <button className="btn-close" onClick={() => { setShowAssignModal(false); resetAssignForm(); }} />
              </div>
              <div className="modal-body">
                {!selectedTemplate ? (
                  <div>
                    <label className="form-label fw-medium">Template auswählen</label>
                    <select className="form-select" onChange={(e) => {
                      const tmpl = templates.find((t) => t.id === e.target.value);
                      if (tmpl) setSelectedTemplate(tmpl);
                    }}>
                      <option value="">Bitte wählen...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.category}){t.required ? " — Pflicht" : ""}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-info mb-3">
                      <strong>Gewähltes Template:</strong> {selectedTemplate.name} ({selectedTemplate.category})
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Patient</label>
                      <select className="form-select" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
                        <option value="">Bitte wählen...</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.email ? `(${p.email})` : ""}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Fall (PatientCase)</label>
                      <select className="form-select" value={selectedPatientCaseId} onChange={(e) => setSelectedPatientCaseId(e.target.value)}>
                        <option value="">Bitte wählen...</option>
                        {patientCases.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Fälligkeitsdatum</label>
                      <input type="date" className="form-control" value={assignDueDate} onChange={(e) => setAssignDueDate(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowAssignModal(false); resetAssignForm(); }}>Abbrechen</button>
                {selectedTemplate && (
                  <button className="btn btn-primary" onClick={handleAssign} disabled={assignLoading}>
                    {assignLoading ? "Wird angelegt..." : "Anlegen"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Neues Template erstellen</h5>
                <button className="btn-close" onClick={() => { setShowCreateModal(false); resetCreateForm(); }} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-medium">Name *</label>
                  <input type="text" className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="z.B. Echokardiographie" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Kategorie *</label>
                  <select className="form-select" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="">Bitte wählen...</option>
                    <option value="Labor">Labor</option>
                    <option value="Bildgebung">Bildgebung</option>
                    <option value="Konsil">Konsil</option>
                    <option value="Psychosozial">Psychosozial</option>
                    <option value="Zahnärztlich">Zahnärztlich</option>
                    <option value="Sonstige">Sonstige</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Beschreibung</label>
                  <textarea className="form-control" rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Beschreibung der Untersuchung" />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={formRequired} onChange={(e) => setFormRequired(e.target.checked)} id="reqCheck" />
                      <label className="form-check-label" htmlFor="reqCheck">Pflicht-Untersuchung</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={formBlocker} onChange={(e) => setFormBlocker(e.target.checked)} id="blockCheck" />
                      <label className="form-check-label" htmlFor="blockCheck">Blockiert bei Fehlen</label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Gültigkeitsdauer (Monate)</label>
                    <input type="number" className="form-control" value={formValidity || ""} onChange={(e) => setFormValidity(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="z.B. 12" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Erinnerung vor Ablauf (Monate)</label>
                    <input type="number" className="form-control" value={formRenewalLead || ""} onChange={(e) => setFormRenewalLead(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="z.B. 1" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleCreateTemplate} disabled={templateSaving}>
                  {templateSaving ? "Wird erstellt..." : "Template erstellen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditModal && selectedTemplate && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Template bearbeiten: {selectedTemplate.name}</h5>
                <button className="btn-close" onClick={() => { setShowEditModal(false); resetCreateForm(); }} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-medium">Name *</label>
                  <input type="text" className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Kategorie *</label>
                  <select className="form-select" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="">Bitte wählen...</option>
                    <option value="Labor">Labor</option>
                    <option value="Bildgebung">Bildgebung</option>
                    <option value="Konsil">Konsil</option>
                    <option value="Psychosozial">Psychosozial</option>
                    <option value="Zahnärztlich">Zahnärztlich</option>
                    <option value="Sonstige">Sonstige</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Beschreibung</label>
                  <textarea className="form-control" rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={formRequired} onChange={(e) => setFormRequired(e.target.checked)} id="editReqCheck" />
                      <label className="form-check-label" htmlFor="editReqCheck">Pflicht-Untersuchung</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={formBlocker} onChange={(e) => setFormBlocker(e.target.checked)} id="editBlockCheck" />
                      <label className="form-check-label" htmlFor="editBlockCheck">Blockiert bei Fehlen</label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Gültigkeitsdauer (Monate)</label>
                    <input type="number" className="form-control" value={formValidity || ""} onChange={(e) => setFormValidity(e.target.value ? parseInt(e.target.value) : undefined)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Erinnerung vor Ablauf (Monate)</label>
                    <input type="number" className="form-control" value={formRenewalLead || ""} onChange={(e) => setFormRenewalLead(e.target.value ? parseInt(e.target.value) : undefined)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowEditModal(false); resetCreateForm(); }}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleEditTemplate} disabled={templateSaving}>
                  {templateSaving ? "Wird gespeichert..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selectedTemplate && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Template löschen</h5>
                <button className="btn-close" onClick={() => { setShowDeleteConfirm(false); setSelectedTemplate(null); }} />
              </div>
              <div className="modal-body">
                <p>Möchten Sie das Template <strong>"{selectedTemplate.name}"</strong> wirklich löschen?</p>
                <p className="text-muted small">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowDeleteConfirm(false); setSelectedTemplate(null); }}>Abbrechen</button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  <Trash2 size={14} className="me-1" /> Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Version Modal */}
      {showVersionModal && selectedTemplate && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Neue Version veröffentlichen</h5>
                <button className="btn-close" onClick={() => { setShowVersionModal(false); setSelectedTemplate(null); }} />
              </div>
              <div className="modal-body">
                <p>Template: <strong>{selectedTemplate.name}</strong></p>
                <p>Aktuelle Version: <strong>v{selectedTemplate.version}</strong></p>
                <p>Neue Version wird: <strong>v{selectedTemplate.version + 1}</strong></p>
                <div className="alert alert-info small">
                  Bei Veröffentlichung wird automatisch eine Version gespeichert.
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowVersionModal(false); setSelectedTemplate(null); }}>Abbrechen</button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handlePublishVersion(selectedTemplate.id);
                    setShowVersionModal(false);
                    setSelectedTemplate(null);
                  }}
                >
                  <History size={14} className="me-1" /> v{selectedTemplate.version + 1} veröffentlichen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
