"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Plus, X, Save, ClipboardList, CheckCircle, AlertTriangle,
  ChevronDown, Eye, Clock, UserPlus,
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

  // Assign Form
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientCaseId, setSelectedPatientCaseId] = useState("");
  const [patientCases, setPatientCases] = useState<{id: string; name: string}[]>([]);
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Create Template Form
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

  const openAssign = (template: Template) => {
    setSelectedTemplate(template);
    setShowAssignModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Anforderungen (Untersuchungen)"
      />

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show mb-3`}>
          {message.text}
          <button className="btn-close" onClick={() => setMessage(null)} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4">
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={() => setShowAssignModal(true)}>
          <UserPlus size={16} /> Untersuchung anlegen
        </button>
        <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Neues Template
        </button>
      </div>

      {/* Templates Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Laden...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-5 text-muted">Keine Templates vorhanden</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kategorie</th>
                <th>Beschreibung</th>
                <th>Pflicht</th>
                <th>Gültigkeit (Tage)</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td className="fw-medium">{t.name}</td>
                  <td>{t.category}</td>
                  <td>{t.description || "—"}</td>
                  <td>{t.required ? <span className="badge bg-danger">Ja</span> : <span className="badge bg-secondary">Nein</span>}</td>
                  <td>{t.validityDuration ? `${t.validityDuration} Tage` : "—"}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-1" onClick={() => openAssign(t)}>
                      <UserPlus size={14} /> Anlegen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Gültigkeitsdauer (Tage)</label>
                    <input type="number" className="form-control" value={formValidity || ""} onChange={(e) => setFormValidity(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="z.B. 365" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Erinnerung vor Ablauf (Tage)</label>
                    <input type="number" className="form-control" value={formRenewalLead || ""} onChange={(e) => setFormRenewalLead(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="z.B. 30" />
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
    </div>
  );
}
