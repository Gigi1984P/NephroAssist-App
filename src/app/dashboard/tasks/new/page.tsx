"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Plus, Save, ArrowLeft, UserPlus } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string | null;
  required: boolean;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  cases: { id: string }[];
}

export default function NewExaminationPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auswahl
  const [mode, setMode] = useState<"template" | "manual">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | "">("");
  const [selectedPatient, setSelectedPatient] = useState<string | "">("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<"dental-clearance" | "cardiac-clearance" | "custom">("dental-clearance");

  // Manuelle Felder
  const [manualTitle, setManualTitle] = useState("");
  const [manualCategory, setManualCategory] = useState("Sonstiges");
  const [manualDescription, setManualDescription] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/examinations/templates", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/patients", { credentials: "include" }).then((r) => r.json()),
    ]).then(([templatesData, patientsData]) => {
      setTemplates(templatesData.templates || []);
      setPatients(patientsData.patients || []);
      setLoading(false);
    });
  }, []);

  const handlePatientChange = (patientId: string) => {
    setSelectedPatient(patientId);
    const patient = patients.find((p) => p.id === patientId);
    if (patient && patient.cases && patient.cases.length > 0) {
      setSelectedCase(patient.cases[0].id);
    } else {
      setSelectedCase(null);
    }
  };

  const handleSave = async () => {
    if (!selectedCase) {
      setMessage({ type: "error", text: "Bitte Patient und Fall auswählen" });
      return;
    }
    if (mode === "template" && !selectedTemplate) {
      setMessage({ type: "error", text: "Bitte Template auswählen" });
      return;
    }
    if (mode === "manual" && !manualTitle.trim()) {
      setMessage({ type: "error", text: "Bitte Titel eingeben" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const body: any = {
      caseId: selectedCase,
      workflowType: selectedWorkflow,
    };

    if (mode === "template") {
      body.templateId = selectedTemplate;
    } else {
      body.title = manualTitle.trim();
      body.category = manualCategory;
      body.description = manualDescription.trim() || null;
    }

    try {
      const res = await fetch("/api/examinations/assign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Untersuchung erfolgreich zugewiesen" });
        setTimeout(() => router.push("/dashboard/tasks"), 1200);
      } else {
        setMessage({ type: "error", text: data.error || "Fehler" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setSaving(false);
    }
  };

  // Gruppiere Templates
  const grouped: Record<string, Template[]> = {};
  templates.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  return (
    <div>
      <PageHeader
        title="Neue Untersuchung"
        description="Untersuchung einem Patienten zuweisen"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Untersuchungen", href: "/dashboard/tasks" },
          { label: "Neu" },
        ]}
      />

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mb-3`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted py-4">Laden...</div>
      ) : (
        <div className="card">
          <div className="card-body">
            {/* Schritt 1: Modus wählen */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Art der Untersuchung</label>
              <div className="row g-2">
                <div className="col-md-6">
                  <button
                    className={`btn w-100 text-start p-3 ${mode === "template" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setMode("template")}
                  >
                    <div className="fw-semibold">📋 Template verwenden</div>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                      Aus vordefinierten Templates wählen
                    </div>
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className={`btn w-100 text-start p-3 ${mode === "manual" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setMode("manual")}
                  >
                    <div className="fw-semibold">✏️ Manuell erstellen</div>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                      Individuelle Untersuchung definieren
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Schritt 2a: Template auswählen */}
            {mode === "template" && (
              <div className="mb-4">
                <label className="form-label fw-semibold">Template auswählen *</label>
                {Object.entries(grouped).length === 0 ? (
                  <div className="alert alert-warning">
                    Keine Templates vorhanden.
                    {" "}
                    <a href="/dashboard/examinations/templates" className="alert-link">Templates erstellen</a>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {Object.entries(grouped).map(([category, items]) => (
                      <div key={category}>
                        <div className="fw-semibold mb-1" style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                          {category}
                        </div>
                        <div className="list-group">
                          {items.map((t) => (
                            <button
                              key={t.id}
                              className={`list-group-item list-group-item-action ${selectedTemplate === t.id ? "active" : ""}`}
                              onClick={() => setSelectedTemplate(t.id)}
                            >
                              <div className="d-flex justify-content-between">
                                <span>{t.name}</span>
                                {t.required && <span className="badge bg-danger">Pflicht</span>}
                              </div>
                              {t.description && (
                                <div className="mt-1" style={{ fontSize: "0.8rem", opacity: 0.8 }}>{t.description}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Schritt 2b: Manuelle Felder */}
            {mode === "manual" && (
              <div className="mb-4">
                <label className="form-label fw-semibold">Untersuchungsdetails</label>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Titel der Untersuchung *"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <select
                    className="form-select"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                  >
                    <option>Zahnmedizin</option>
                    <option>Kardiologie</option>
                    <option>Radiologie</option>
                    <option>Labor</option>
                    <option>Sonstiges</option>
                  </select>
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Beschreibung (optional)"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Schritt 3: Patient wählen */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Patient zuweisen *</label>
              <select
                className="form-select"
                value={selectedPatient}
                onChange={(e) => handlePatientChange(e.target.value)}
              >
                <option value="">Patient auswählen...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.email ? `(${p.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Schritt 4: Workflow wählen */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Workflow</label>
              <select
                className="form-select"
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value as any)}
              >
                <option value="dental-clearance">Dental Clearance (6 Schritte: Überweisung → Verordnung → Termin → Bericht → Upload → Prüfung)</option>
                <option value="cardiac-clearance">Herz-Kreislauf Clearance (6 Schritte: Überweisung → Verordnung → Termin → Bericht → Upload → Prüfung)</option>
                <option value="custom">Einfache Untersuchung (kein Workflow)</option>
              </select>
              <div className="form-text">
                Der Workflow bestimmt die Schritte, die der Patient nacheinander durchlaufen muss.
              </div>
            </div>

            {/* Zusammenfassung */}
            {(selectedTemplate || manualTitle) && selectedPatient && (
              <div className="alert alert-info mb-4">
                <div className="fw-semibold mb-2">Zusammenfassung:</div>
                <div style={{ fontSize: "0.9rem" }}>
                  <strong>Untersuchung:</strong>{" "}
                  {mode === "template"
                    ? Object.values(grouped).flat().find((t) => t.id === selectedTemplate)?.name
                    : manualTitle}
                  <br />
                  <strong>Workflow:</strong>{" "}
                  {selectedWorkflow === "dental-clearance" && "Dental Clearance (6 Schritte)"}
                  {selectedWorkflow === "cardiac-clearance" && "Herz-Kreislauf Clearance (6 Schritte)"}
                  {selectedWorkflow === "custom" && "Einfache Untersuchung"}
                  <br />
                  <strong>Patient:</strong>{" "}
                  {(() => {
                    const p = patients.find((pt) => pt.id === selectedPatient);
                    return p ? `${p.firstName} ${p.lastName}` : "—";
                  })()}
                </div>
              </div>
            )}

            {/* Aktionen */}
            <div className="d-flex justify-content-between">
              <a href="/dashboard/tasks" className="btn btn-outline-secondary">
                <ArrowLeft size={14} className="me-1" /> Abbrechen
              </a>
              <button
                className="btn btn-success"
                disabled={!selectedCase || saving || (mode === "template" && !selectedTemplate) || (mode === "manual" && !manualTitle.trim())}
                onClick={handleSave}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  <>
                    <UserPlus size={16} className="me-1" />
                    Untersuchung zuweisen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
