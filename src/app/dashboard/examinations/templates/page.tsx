"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Plus, Edit3, Trash2, X, Save, AlertTriangle, UserPlus, CheckCircle,
  Eye, Clock, ChevronDown,
} from "lucide-react";

interface TemplateVersion {
  id: string;
  version: number;
  changes: string | null;
  publishedAt: string;
  applyTo: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string | null;
  required: boolean;
  listingBlocker: boolean;
  status: string;
  version: number;
  validityDuration: number | null;
  renewalLeadTime: number | null;
  versions: TemplateVersion[];
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  cases: { id: string }[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  // Publish
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishingTemplate, setPublishingTemplate] = useState<Template | null>(null);
  const [publishChanges, setPublishChanges] = useState("");

  // Zuweisungs-Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState<Template | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | "">("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  // Formular
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRequired, setFormRequired] = useState(true);
  const [formBlocker, setFormBlocker] = useState(false);
  const [formValidity, setFormValidity] = useState(365);
  const [formRenewalLead, setFormRenewalLead] = useState(60);

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
    setFormValidity(365);
    setFormRenewalLead(60);
    setShowModal(true);
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormCategory(template.category);
    setFormDescription(template.description || "");
    setFormRequired(template.required);
    setFormBlocker(template.listingBlocker);
    setFormValidity(template.validityDuration || 365);
    setFormRenewalLead(template.renewalLeadTime || 60);
    setShowModal(true);
  };

  const openPublish = (template: Template) => {
    setPublishingTemplate(template);
    setPublishChanges("");
    setShowPublishModal(true);
  };

  const handlePublish = async () => {
    if (!publishingTemplate) return;
    try {
      const res = await fetch(`/api/examinations/templates/${publishingTemplate.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes: publishChanges }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Veröffentlicht" });
        setShowPublishModal(false);
        loadTemplates();
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    }
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
      validityDuration: formValidity,
      renewalLeadTime: formRenewalLead,
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
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/examinations/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Template gelöscht" });
        setDeleteConfirm(null);
        loadTemplates();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    }
  };

  const openAssign = (template: Template) => {
    setAssigningTemplate(template);
    setSelectedPatient("");
    setSelectedCase(null);
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedCase || !assigningTemplate) return;
    try {
      const res = await fetch("/api/examinations/assign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: selectedCase, templateId: assigningTemplate.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `"${assigningTemplate.name}" zugewiesen` });
        setShowAssignModal(false);
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    }
  };

  const grouped: Record<string, Template[]> = {};
  templates.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  return (
    <div>
      <PageHeader
        title="Untersuchungs-Templates"
        description="Vorlagen verwalten, versionieren und veröffentlichen"
        action={
          <button className="btn-custom btn-primary-custom" onClick={openCreate}>
            <Plus size={16} /> Neues Template
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
        <div className="empty-state">
          <div className="empty-state-icon"><Plus size={24} /></div>
          <div className="empty-state-title">Keine Templates</div>
          <div className="empty-state-desc">Erstellen Sie die erste Vorlage.</div>
          <button className="btn-custom btn-primary-custom" onClick={openCreate}>Template erstellen</button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="dashboard-card">
              <div className="card-header-custom d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold">{category}</span>
                  <span className="badge-custom badge-outline ms-2">{items.length}</span>
                </div>
              </div>
              <div className="card-body-custom p-0">
                <table className="table-custom">
                  <tbody>
                    {items.map((template) => (
                      <>
                        <tr key={template.id}>
                          <td className="align-middle">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-semibold">{template.name}</span>
                              {template.required && <span className="badge-custom badge-red" style={{ fontSize: "0.65rem" }}>Pflicht</span>}
                              {template.listingBlocker && <span className="badge-custom badge-yellow" style={{ fontSize: "0.65rem" }}>Blocker</span>}
                              <span className="badge-custom badge-green" style={{ fontSize: "0.65rem" }}>v{template.version}</span>
                            </div>
                            {template.description && <div className="text-muted" style={{ fontSize: "0.8rem" }}>{template.description}</div>}
                          </td>
                          <td className="align-middle" style={{ width: "1%", whiteSpace: "nowrap" }}>
                            <div className="d-flex gap-2">
                              <button className="btn-custom btn-outline-custom btn-sm-custom" onClick={() => openAssign(template)} title="Zuweisen">
                                <UserPlus size={14} />
                              </button>
                              <button className="btn-custom btn-primary-custom btn-sm-custom" onClick={() => openPublish(template)} title="Veröffentlichen">
                                <CheckCircle size={14} />
                              </button>
                              <button className="btn-custom btn-outline-custom btn-sm-custom" onClick={() => openEdit(template)} title="Bearbeiten">
                                <Edit3 size={14} />
                              </button>
                              <button className="btn-custom btn-outline-custom btn-sm-custom" onClick={() => setDeleteConfirm(template.id)} title="Löschen">
                                <Trash2 size={14} />
                              </button>
                              <button className="btn-custom btn-outline-custom btn-sm-custom" onClick={() => setExpandedVersion(expandedVersion === template.id ? null : template.id)} title="Versionen">
                                <Clock size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedVersion === template.id && (
                          <tr key={`${template.id}-versions`}>
                            <td colSpan={2} className="p-0">
                              <div className="p-3" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                                <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Versionen</h6>
                                {template.versions?.length === 0 ? (
                                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>Noch keine Versionen.</div>
                                ) : (
                                  <div className="d-flex flex-column gap-2">
                                    {template.versions?.map((v) => (
                                      <div key={v.id} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                                        <div>
                                          <span className="fw-medium" style={{ fontSize: "0.8rem" }}>v{v.version}</span>
                                          {v.changes && <span className="text-muted ms-2" style={{ fontSize: "0.75rem" }}>{v.changes}</span>}
                                        </div>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                          {new Date(v.publishedAt).toLocaleDateString("de-DE")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create/Edit */}
      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingTemplate ? "Template bearbeiten" : "Neues Template"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name *</label>
                  <input type="text" className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Kategorie *</label>
                  <select className="form-select" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
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
                  <textarea className="form-control" rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="reqCheck" checked={formRequired} onChange={(e) => setFormRequired(e.target.checked)} />
                      <label className="form-check-label" htmlFor="reqCheck">Erforderlich</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="blockCheck" checked={formBlocker} onChange={(e) => setFormBlocker(e.target.checked)} />
                      <label className="form-check-label" htmlFor="blockCheck">Listing Blocker</label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Gültigkeit (Tage)</label>
                    <input type="number" className="form-control" value={formValidity} onChange={(e) => setFormValidity(Number(e.target.value))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Erinnerung vor (Tage)</label>
                    <input type="number" className="form-control" value={formRenewalLead} onChange={(e) => setFormRenewalLead(Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!formName.trim() || !formCategory.trim() || loading}>
                  {loading ? "Speichern..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Publish */}
      {showPublishModal && publishingTemplate && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Template veröffentlichen</h5>
                <button className="btn-close" onClick={() => setShowPublishModal(false)} />
              </div>
              <div className="modal-body">
                <p>Sie veröffentlichen <strong>"{publishingTemplate.name}"</strong> als Version {publishingTemplate.version + 1}.</p>
                <div className="mb-3">
                  <label className="form-label">Änderungen (optional)</label>
                  <textarea className="form-control" rows={2} placeholder="z.B. Neue Anforderung hinzugefügt, Workflow angepasst..." value={publishChanges} onChange={(e) => setPublishChanges(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowPublishModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handlePublish}><CheckCircle size={14} className="me-1" /> Veröffentlichen</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign */}
      {showAssignModal && assigningTemplate && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">"{assigningTemplate.name}" zuweisen</h5>
                <button className="btn-close" onClick={() => setShowAssignModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Patient</label>
                  <select className="form-select" value={selectedPatient} onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedPatient(pid);
                    const p = patients.find((x) => x.id === pid);
                    setSelectedCase(p?.cases?.[0]?.id || null);
                  }}>
                    <option value="">Patient auswählen...</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowAssignModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedCase}>Zuweisen</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center">
                <AlertTriangle size={32} className="text-danger mb-2" />
                <p>Template wirklich löschen?</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-outline-secondary" onClick={() => setDeleteConfirm(null)}>Nein</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Löschen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
