"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Plus, Pencil, Trash2, UserPlus, X,
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
  createdAt: string;
  updatedAt: string;
}

interface SetItem {
  name: string;
  category: string;
  required: boolean;
  description: string;
}

interface TemplateSet {
  id: string;
  name: string;
  description: string | null;
  items: SetItem[];
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

export default function RequirementsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateSets, setTemplateSets] = useState<TemplateSet[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selTemplate, setSelTemplate] = useState<Template | null>(null);
  const [selSet, setSelSet] = useState<TemplateSet | null>(null);

  // Assign Form
  const [selPatientId, setSelPatientId] = useState("");
  const [selCaseId, setSelCaseId] = useState("");
  const [cases, setCases] = useState<{id: string; name: string}[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Create / Edit Template Form
  const [tName, setTName] = useState("");
  const [tCategory, setTCategory] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tRequired, setTRequired] = useState(true);
  const [tBlocker, setTBlocker] = useState(false);
  const [tValidity, setTValidity] = useState<number | undefined>(undefined);
  const [tRenewal, setTRenewal] = useState<number | undefined>(undefined);
  const [tSaving, setTSaving] = useState(false);

  // TemplateSet Form (neu mit Textfeldern statt Checkboxen)
  const [sName, setSName] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sItems, setSItems] = useState<SetItem[]>([{ name: "", category: "Labor", required: false, description: "" }]);
  const [sSaving, setSSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, sr, pr] = await Promise.all([
        fetch("/api/examinations/templates", { credentials: "include" }),
        fetch("/api/template-sets", { credentials: "include" }),
        fetch("/api/patients/overview", { credentials: "include" }),
      ]);
      const td = await tr.json();
      const sd = await sr.json();
      const pd = await pr.json();
      setTemplates(td.templates || []);
      setTemplateSets(sd.templateSets || []);
      setPatients(pd.patients || pd || []);
    } catch {
      setMsg({ type: "error", text: "Fehler beim Laden" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selPatientId) { setCases([]); return; }
    fetch(`/api/patients/${selPatientId}/cases`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list = d.cases || d || [];
        setCases(list);
        if (list.length === 1) setSelCaseId(list[0].id);
      })
      .catch(() => setCases([]));
  }, [selPatientId]);

  const closeAll = () => {
    setActiveModal(null);
    setSelTemplate(null);
    setSelSet(null);
    setSItems([{ name: "", category: "Labor", required: false, description: "" }]);
  };

  // ===================== ASSIGN =====================
  const handleAssign = async () => {
    if (!selTemplate || !selCaseId || !dueDate) {
      setMsg({ type: "error", text: "Untersuchung, Fall und Fälligkeitsdatum sind Pflicht" });
      return;
    }
    setAssignLoading(true);
    try {
      const res = await fetch("/api/examinations/assign", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selTemplate.id, caseId: selCaseId, dueDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: "Anforderung zugewiesen" });
        closeAll();
        setSelPatientId(""); setSelCaseId(""); setDueDate(""); setCases([]);
      } else setMsg({ type: "error", text: data.error || "Fehler" });
    } catch { setMsg({ type: "error", text: "Netzwerkfehler" }); }
    finally { setAssignLoading(false); }
  };

  // ===================== CREATE TEMPLATE =====================
  const handleCreateT = async () => {
    if (!tName.trim() || !tCategory.trim()) { setMsg({ type: "error", text: "Name und Kategorie sind Pflicht" }); return; }
    setTSaving(true);
    try {
      const res = await fetch("/api/examinations/templates", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tName.trim(), category: tCategory.trim(), description: tDesc.trim() || null,
          required: tRequired, listingBlocker: tBlocker,
          validityDuration: tValidity, renewalLeadTime: tRenewal,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: "Untersuchung erstellt" });
        closeAll();
        setTName(""); setTCategory(""); setTDesc(""); setTRequired(true); setTBlocker(false); setTValidity(undefined); setTRenewal(undefined);
        loadData();
      } else setMsg({ type: "error", text: data.error || "Fehler" });
    } catch { setMsg({ type: "error", text: "Netzwerkfehler" }); }
    finally { setTSaving(false); }
  };

  // ===================== EDIT TEMPLATE =====================
  const openEditT = (template: Template) => {
    setSelTemplate(template);
    setTName(template.name); setTCategory(template.category); setTDesc(template.description || "");
    setTRequired(template.required); setTBlocker(template.listingBlocker);
    setTValidity(template.validityDuration ?? undefined); setTRenewal(template.renewalLeadTime ?? undefined);
    setActiveModal("editT");
  };

  const handleEditT = async () => {
    if (!selTemplate || !tName.trim() || !tCategory.trim()) { setMsg({ type: "error", text: "Name und Kategorie sind Pflicht" }); return; }
    setTSaving(true);
    try {
      const res = await fetch(`/api/examinations/templates/${selTemplate.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tName.trim(), category: tCategory.trim(), description: tDesc.trim() || null,
          required: tRequired, listingBlocker: tBlocker,
          validityDuration: tValidity, renewalLeadTime: tRenewal,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: data.message || "Untersuchung aktualisiert" });
        closeAll();
        setTName(""); setTCategory(""); setTDesc(""); setTRequired(true); setTBlocker(false); setTValidity(undefined); setTRenewal(undefined);
        loadData();
      } else setMsg({ type: "error", text: data.error || "Fehler" });
    } catch { setMsg({ type: "error", text: "Netzwerkfehler" }); }
    finally { setTSaving(false); }
  };

  // ===================== DELETE TEMPLATE =====================
  const openDelT = (template: Template) => { setSelTemplate(template); setActiveModal("delT"); };
  const handleDelT = async () => {
    if (!selTemplate) return;
    try {
      const res = await fetch(`/api/examinations/templates/${selTemplate.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setMsg({ type: "success", text: "Untersuchung gelöscht" }); closeAll(); loadData(); }
      else { const d = await res.json(); setMsg({ type: "error", text: d.error || "Fehler" }); }
    } catch { setMsg({ type: "error", text: "Netzwerkfehler" }); }
  };

  // ===================== TEMPLATESET (TEXTFELDER) =====================
  const openCreateS = () => {
    setSName(""); setSDesc(""); setSItems([{ name: "", category: "Labor", required: false, description: "" }]);
    setActiveModal("createS");
  };

  const openEditS = (set: TemplateSet) => {
    setSelSet(set); setSName(set.name); setSDesc(set.description || "");
    setSItems(set.items.length > 0 ? set.items : [{ name: "", category: "Labor", required: false, description: "" }]);
    setActiveModal("editS");
  };

  const addSItem = () => {
    setSItems((prev) => [...prev, { name: "", category: "Labor", required: false, description: "" }]);
  };

  const removeSItem = (idx: number) => {
    setSItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSItem = (idx: number, field: keyof SetItem, value: string | boolean) => {
    setSItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSaveS = async () => {
    if (!sName.trim() || sItems.length === 0 || sItems.some((it) => !it.name.trim())) {
      setMsg({ type: "error", text: "Name und mindestens eine Untersuchung mit Namen sind Pflicht" });
      return;
    }
    setSSaving(true);
    try {
      const isEdit = activeModal === "editS" && selSet;
      const url = isEdit ? `/api/template-sets/${selSet.id}` : "/api/template-sets";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sName.trim(),
          description: sDesc.trim() || null,
          items: sItems.map((it) => ({ ...it, name: it.name.trim(), category: it.category.trim() })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: isEdit ? `TemplateSet aktualisiert (v${data.templateSet.version})` : "TemplateSet erstellt" });
        closeAll();
        loadData();
      } else setMsg({ type: "error", text: data.error || "Fehler" });
    } catch { setMsg({ type: "error", text: "Netzwerkfehler" }); }
    finally { setSSaving(false); }
  };

  const openDelS = (set: TemplateSet) => { setSelSet(set); setActiveModal("delS"); };
  const handleDelS = async () => {
    if (!selSet) return;
    try {
      const res = await fetch(`/api/template-sets/${selSet.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setMsg({ type: "success", text: "TemplateSet gelöscht" }); closeAll(); loadData(); }
      else { const d = await res.json(); setMsg({ type: "error", text: d.error || "Fehler" }); }
    } catch { setMsg({ type: "error", text: "Netzwerkfehler" }); }
  };

  const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
  const fmtDateTime = (s: string) => s ? new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const isOpen = activeModal !== null;

  return (
    <div>
      <PageHeader title="Anforderungen (Untersuchungen)" />

      {msg && (
        <div className={`alert ${msg.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show mb-3`}>
          {msg.text} <button className="btn-close" onClick={() => setMsg(null)} />
        </div>
      )}

      {/* Actions */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={() => { setSelTemplate(null); setSelPatientId(""); setSelCaseId(""); setDueDate(""); setCases([]); setActiveModal("assign"); }}>
          <UserPlus size={16} /> Untersuchung anlegen
        </button>
        <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2" onClick={() => { setTName(""); setTCategory(""); setTDesc(""); setTRequired(true); setTBlocker(false); setTValidity(undefined); setTRenewal(undefined); setActiveModal("createT"); }}>
          <Plus size={16} /> Neue Untersuchung
        </button>
        <button className="btn btn-outline-success d-inline-flex align-items-center gap-2" onClick={openCreateS}>
          <Plus size={16} /> TemplateSet
        </button>
      </div>

      {/* ==== TEMPLATESETS TABELLE ==== */}
      <div className="dashboard-card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2"><Plus size={18} /> TemplateSets</span>
          <span className="badge bg-secondary">{templateSets.length}</span>
        </div>
        <div className="card-body-custom p-0">
          {templateSets.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <div className="mb-2"><Plus size={24} className="text-muted" /></div>
              <div className="fw-medium">Keine TemplateSets</div>
              <div className="small">Erstellen Sie Sets mit Untersuchungen als Freitext.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light"><tr><th>Name</th><th>Beschreibung</th><th>Untersuchungen</th><th>Version</th><th>Erstellt</th><th>Aktualisiert</th><th className="text-end">Aktionen</th></tr></thead>
                <tbody>
                  {templateSets.map((set) => (
                    <tr key={set.id}>
                      <td className="fw-medium">{set.name}</td>
                      <td>{set.description || "—"}</td>
                      <td>
                        {set.items?.length > 0 ? (
                          <div>
                            <span className="badge bg-info text-dark mb-1">{set.items.length} Untersuchung{set.items.length !== 1 ? "en" : ""}</span>
                            <ul className="list-unstyled small mb-0" style={{ fontSize: "0.8rem" }}>
                              {set.items.map((it: any, i: number) => (
                                <li key={i} className="text-muted">
                                  {it.required ? <strong>{it.name}</strong> : it.name}
                                  {it.category && <span className="text-secondary"> ({it.category})</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : "—"}
                      </td>
                      <td><span className="badge bg-primary">v{set.version}</span></td>
                      <td><span className="text-muted small">{fmtDate(set.createdAt)}</span></td>
                      <td><span className="text-muted small">{fmtDateTime(set.updatedAt)}</span></td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEditS(set)}><Pencil size={12} /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => openDelS(set)}><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ==== UNTERSUCHUNGEN TABELLE ==== */}
      <div className="dashboard-card">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2"><Pencil size={18} /> Untersuchungen</span>
          <span className="badge bg-secondary">{templates.length}</span>
        </div>
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : templates.length === 0 ? (
            <div className="p-4 text-center text-muted"><div className="mb-2"><Pencil size={24} className="text-muted" /></div><div className="fw-medium">Keine Untersuchungen</div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light"><tr><th>Name</th><th>Kategorie</th><th>Beschreibung</th><th>Pflicht</th><th>Gültigkeit</th><th>Erstellt</th><th className="text-end">Aktionen</th></tr></thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-medium">{t.name}</td>
                      <td>{t.category}</td>
                      <td>{t.description || "—"}</td>
                      <td>{t.required ? <span className="badge bg-danger">Ja</span> : <span className="badge bg-secondary">Nein</span>}</td>
                      <td>{t.validityDuration ? `${t.validityDuration} Monate` : "—"}</td>
                      <td><span className="text-muted small">{fmtDate(t.createdAt)}</span></td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEditT(t)}><Pencil size={12} /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => openDelT(t)}><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="modal-backdrop show" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }} onClick={closeAll} />
      )}

      {/* Assign Modal */}
      {activeModal === "assign" && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Untersuchung anlegen</h5><button className="btn-close" onClick={closeAll} /></div>
              <div className="modal-body">
                {!selTemplate ? (
                  <div className="mb-3">
                    <label className="form-label fw-medium">Untersuchung auswählen</label>
                    <select className="form-select" onChange={(e) => { const tmpl = templates.find((t) => t.id === e.target.value); if (tmpl) setSelTemplate(tmpl); }}>
                      <option value="">Bitte wählen...</option>
                      {templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.category}){t.required ? " — Pflicht" : ""}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-info mb-3"><strong>Gewählte Untersuchung:</strong> {selTemplate.name} ({selTemplate.category})</div>
                    <div className="mb-3"><label className="form-label fw-medium">Patient</label><select className="form-select" value={selPatientId} onChange={(e) => setSelPatientId(e.target.value)}><option value="">Bitte wählen...</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></div>
                    <div className="mb-3"><label className="form-label fw-medium">Fall</label><select className="form-select" value={selCaseId} onChange={(e) => setSelCaseId(e.target.value)}><option value="">Bitte wählen...</option>{cases.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div className="mb-3"><label className="form-label fw-medium">Fälligkeitsdatum</label><input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAll}>Abbrechen</button>
                {selTemplate && <button className="btn btn-primary" onClick={handleAssign} disabled={assignLoading}>{assignLoading ? "Wird angelegt..." : "Anlegen"}</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {activeModal === "createT" && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Neue Untersuchung erstellen</h5><button className="btn-close" onClick={closeAll} /></div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label fw-medium">Name *</label><input type="text" className="form-control" value={tName} onChange={(e) => setTName(e.target.value)} placeholder="z.B. Echokardiographie" /></div>
                <div className="mb-3"><label className="form-label fw-medium">Kategorie *</label><select className="form-select" value={tCategory} onChange={(e) => setTCategory(e.target.value)}><option value="">Bitte wählen...</option><option value="Labor">Labor</option><option value="Bildgebung">Bildgebung</option><option value="Konsil">Konsil</option><option value="Psychosozial">Psychosozial</option><option value="Zahnärztlich">Zahnärztlich</option><option value="Sonstige">Sonstige</option></select></div>
                <div className="mb-3"><label className="form-label fw-medium">Beschreibung</label><textarea className="form-control" rows={3} value={tDesc} onChange={(e) => setTDesc(e.target.value)} placeholder="Beschreibung" /></div>
                <div className="row mb-3">
                  <div className="col-md-6"><div className="form-check"><input className="form-check-input" type="checkbox" checked={tRequired} onChange={(e) => setTRequired(e.target.checked)} id="reqCheck" /><label className="form-check-label" htmlFor="reqCheck">Pflicht</label></div></div>
                  <div className="col-md-6"><div className="form-check"><input className="form-check-input" type="checkbox" checked={tBlocker} onChange={(e) => setTBlocker(e.target.checked)} id="blockCheck" /><label className="form-check-label" htmlFor="blockCheck">Blockiert bei Fehlen</label></div></div>
                </div>
                <div className="row">
                  <div className="col-md-3"><label className="form-label fw-medium">Gültigkeit (Monate)</label><input type="number" className="form-control" value={tValidity || ""} onChange={(e) => setTValidity(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="12" /></div>
                  <div className="col-md-3"><label className="form-label fw-medium">Erinnerung (Monate)</label><input type="number" className="form-control" value={tRenewal || ""} onChange={(e) => setTRenewal(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="1" /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAll}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleCreateT} disabled={tSaving}>{tSaving ? "Wird erstellt..." : "Erstellen"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {activeModal === "editT" && selTemplate && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Untersuchung bearbeiten: {selTemplate.name}</h5><button className="btn-close" onClick={closeAll} /></div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label fw-medium">Name *</label><input type="text" className="form-control" value={tName} onChange={(e) => setTName(e.target.value)} /></div>
                <div className="mb-3"><label className="form-label fw-medium">Kategorie *</label><select className="form-select" value={tCategory} onChange={(e) => setTCategory(e.target.value)}><option value="">Bitte wählen...</option><option value="Labor">Labor</option><option value="Bildgebung">Bildgebung</option><option value="Konsil">Konsil</option><option value="Psychosozial">Psychosozial</option><option value="Zahnärztlich">Zahnärztlich</option><option value="Sonstige">Sonstige</option></select></div>
                <div className="mb-3"><label className="form-label fw-medium">Beschreibung</label><textarea className="form-control" rows={3} value={tDesc} onChange={(e) => setTDesc(e.target.value)} /></div>
                <div className="row mb-3">
                  <div className="col-md-6"><div className="form-check"><input className="form-check-input" type="checkbox" checked={tRequired} onChange={(e) => setTRequired(e.target.checked)} id="editReq" /><label className="form-check-label" htmlFor="editReq">Pflicht</label></div></div>
                  <div className="col-md-6"><div className="form-check"><input className="form-check-input" type="checkbox" checked={tBlocker} onChange={(e) => setTBlocker(e.target.checked)} id="editBlock" /><label className="form-check-label" htmlFor="editBlock">Blockiert bei Fehlen</label></div></div>
                </div>
                <div className="row">
                  <div className="col-md-3"><label className="form-label fw-medium">Gültigkeit (Monate)</label><input type="number" className="form-control" value={tValidity || ""} onChange={(e) => setTValidity(e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                  <div className="col-md-3"><label className="form-label fw-medium">Erinnerung (Monate)</label><input type="number" className="form-control" value={tRenewal || ""} onChange={(e) => setTRenewal(e.target.value ? parseInt(e.target.value) : undefined)} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAll}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleEditT} disabled={tSaving}>{tSaving ? "Wird gespeichert..." : "Speichern"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Modal */}
      {activeModal === "delT" && selTemplate && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Untersuchung löschen</h5><button className="btn-close" onClick={closeAll} /></div>
              <div className="modal-body">
                <p>Möchten Sie die Untersuchung <strong>"{selTemplate.name}"</strong> wirklich löschen?</p>
                <p className="text-muted small">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAll}>Abbrechen</button>
                <button className="btn btn-danger" onClick={handleDelT}><Trash2 size={14} className="me-1" /> Löschen</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== TemplateSet Modal: FREITEXT-FELDER ====== */}
      {(activeModal === "createS" || activeModal === "editS") && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{activeModal === "editS" && selSet ? `TemplateSet bearbeiten: ${selSet.name}` : "Neues TemplateSet erstellen"}</h5>
                <button className="btn-close" onClick={closeAll} />
              </div>
              <div className="modal-body">
                {/* Set-Name + Beschreibung */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Name *</label>
                  <input type="text" className="form-control" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="z.B. Standard-Nephrologie-Check" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Beschreibung</label>
                  <textarea className="form-control" rows={2} value={sDesc} onChange={(e) => setSDesc(e.target.value)} placeholder="Beschreibung" />
                </div>

                <hr className="my-3" />
                <h6 className="fw-semibold mb-2">Untersuchungen (jeweils in Textfelder reinschreiben)</h6>

                {/* Header */}
                <div className="row fw-medium text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                  <div className="col-3">Name</div>
                  <div className="col-2">Kategorie</div>
                  <div className="col-1">Pflicht</div>
                  <div className="col-5">Beschreibung</div>
                  <div className="col-1"></div>
                </div>

                {/* Item-Zeilen */}
                {sItems.map((item, idx) => (
                  <div key={idx} className="row g-2 align-items-center mb-2">
                    <div className="col-3">
                      <input type="text" className="form-control form-control-sm" value={item.name} onChange={(e) => updateSItem(idx, "name", e.target.value)} placeholder="Untersuchungsname" />
                    </div>
                    <div className="col-2">
                      <select className="form-select form-select-sm" value={item.category} onChange={(e) => updateSItem(idx, "category", e.target.value)}>
                        <option>Labor</option>
                        <option>Bildgebung</option>
                        <option>Konsil</option>
                        <option>Psychosozial</option>
                        <option>Zahnärztlich</option>
                        <option>Sonstige</option>
                      </select>
                    </div>
                    <div className="col-1">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={item.required} onChange={(e) => updateSItem(idx, "required", e.target.checked)} id={`req-${idx}`} />
                        <label className="form-check-label" htmlFor={`req-${idx}`}></label>
                      </div>
                    </div>
                    <div className="col-5">
                      <input type="text" className="form-control form-control-sm" value={item.description} onChange={(e) => updateSItem(idx, "description", e.target.value)} placeholder="Beschreibung (optional)" />
                    </div>
                    <div className="col-1">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeSItem(idx)} disabled={sItems.length <= 1}><X size={14} /></button>
                    </div>
                  </div>
                ))}

                <button className="btn btn-sm btn-outline-primary mt-2" onClick={addSItem}><Plus size={14} className="me-1" />Weitere Untersuchung hinzufügen</button>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAll}>Abbrechen</button>
                <button className="btn btn-success" onClick={handleSaveS} disabled={sSaving}>{sSaving ? "Wird gespeichert..." : "Speichern"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete TemplateSet Modal */}
      {activeModal === "delS" && selSet && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">TemplateSet löschen</h5><button className="btn-close" onClick={closeAll} /></div>
              <div className="modal-body">
                <p>Möchten Sie das TemplateSet <strong>"{selSet.name}"</strong> wirklich löschen?</p>
                <p className="text-muted small">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeAll}>Abbrechen</button>
                <button className="btn btn-danger" onClick={handleDelS}><Trash2 size={14} className="me-1" /> Löschen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
