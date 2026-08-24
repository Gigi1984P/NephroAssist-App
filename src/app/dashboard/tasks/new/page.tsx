"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Plus, FileText, ClipboardList, ArrowLeft, Save } from "lucide-react";

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

const WORKFLOW_OPTIONS = [
  { id: "dental-clearance", name: "Dental Clearance (6 Schritte)" },
  { id: "cardiac-clearance", name: "Herz-Kreislauf Clearance (6 Schritte)" },
  { id: "custom", name: "Einfache Untersuchung (kein Workflow)" },
];

export default function NewExaminationPage() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "template" | "manual" | "confirm">("type");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Templates
  const [templates, setTemplates] = useState<Record<string, Template[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("dental-clearance");

  // Manuelle Untersuchung
  const [manualTitle, setManualTitle] = useState("");
  const [manualCategory, setManualCategory] = useState("Sonstiges");
  const [manualDescription, setManualDescription] = useState("");
  const [manualWorkflow, setManualWorkflow] = useState<string>("dental-clearance");

  // Patient
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  useEffect(() => {
    // Profil laden
    fetch("/api/user/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const user = data.user || data;
        setUserRole(user.role);
      });

    // Templates laden
    fetch("/api/examinations/templates", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.grouped) setTemplates(data.grouped);
      });

    // Patienten laden
    fetch("/api/patients", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const list = data.patients || [];
        setPatients(list);
        if (list.length > 0) {
          setSelectedPatient(list[0].id);
          if (list[0].cases?.length > 0) {
            setSelectedCase(list[0].cases[0].id);
          }
        }
      });
  }, []);

  const handleAssign = async () => {
    if (!selectedCase) {
      setMessage({ type: "error", text: "Bitte einen Patienten auswählen" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const body: any = {
      caseId: selectedCase,
      workflowType: selectedTemplate ? selectedWorkflow : manualWorkflow,
    };

    if (selectedTemplate) {
      body.templateId = selectedTemplate;
    } else {
      body.title = manualTitle || "Neue Untersuchung";
      body.category = manualCategory;
      body.description = manualDescription;
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
        setTimeout(() => router.push("/dashboard/tasks"), 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Fehler beim Zuweisen" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const isClinic = userRole && ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(userRole);

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

      {!isClinic && userRole ? (
        <div className="alert alert-warning">
          🔒 Nur Klinik-Mitarbeiter können Untersuchungen zuweisen.
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${step === "type" ? "active" : ""}`}
                  onClick={() => setStep("type")}
                >
                  <FileText size={14} className="me-1" /> Art
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${step === "template" || step === "manual" ? "active" : ""}`}
                  onClick={() => setStep(selectedTemplate ? "template" : "manual")}
                  disabled={!selectedTemplate && step === "type"}
                >
                  <ClipboardList size={14} className="me-1" /> Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${step === "confirm" ? "active" : ""}`}
                  onClick={() => setStep("confirm")}
                  disabled={!selectedCase}
                >
                  <Plus size={14} className="me-1" /> Zuweisen
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body">
            {step === "type" && (
              <div>
                <p className="text-muted mb-3">Wählen Sie, wie Sie die Untersuchung erstellen möchten:</p>

                <div className="row g-3">
                  {/* Template-basiert */}
                  <div className="col-md-6">
                    <button
                      className="btn btn-outline-primary w-100 text-start p-3"
                      onClick={() => setStep("template")}
                    >
                      <div className="fw-semibold mb-1">📋 Template verwenden</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        Wählen Sie aus vordefinierten Untersuchungs-Templates (Dental, Kardiologie, etc.)
                      </div>
                    </button>
                  </div>

                  {/* Manuell */}
                  <div className="col-md-6">
                    <button
                      className="btn btn-outline-secondary w-100 text-start p-3"
                      onClick={() => setStep("manual")}
                    >
                      <div className="fw-semibold mb-1">✏️ Manuell erstellen</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        Erstellen Sie eine individuelle Untersuchung mit eigenem Titel und Beschreibung
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === "template" && (
              <div>
                <p className="text-muted mb-3">Wählen Sie ein Template und den Workflow:</p>

                {Object.entries(templates).length === 0 && (
                  <div className="alert alert-info">Keine Templates verfügbar.</div>
                )}

                {Object.entries(templates).map(([category, items]) => (
                  <div key={category} className="mb-3">
                    <div className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>{category}</div>
                    <div className="list-group">
                      {items.map((t) => (
                        <button
                          key={t.id}
                          className={`list-group-item list-group-item-action ${selectedTemplate === t.id ? "active" : ""}`}
                          onClick={() => setSelectedTemplate(t.id)}
                        >
                          <div className="d-flex justify-content-between">
                            <span>{t.name}</span>
                            {t.required && <span className="badge bg-danger">Erforderlich</span>}
                          </div>
                          {t.description && (
                            <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>{t.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <hr className="my-3" />

                <div className="mb-3">
                  <label className="form-label">Workflow</label>
                  <select
                    className="form-select"
                    value={selectedWorkflow}
                    onChange={(e) => setSelectedWorkflow(e.target.value)}
                  >
                    {WORKFLOW_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  <div className="form-text">Der Workflow bestimmt die Schritte, die der Patient durchlaufen muss.</div>
                </div>

                <div className="d-flex justify-content-between">
                  <button className="btn btn-outline-secondary" onClick={() => { setStep("type"); setSelectedTemplate(null); }}>
                    <ArrowLeft size={14} className="me-1" /> Zurück
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedTemplate}
                    onClick={() => setStep("confirm")}
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}

            {step === "manual" && (
              <div>
                <p className="text-muted mb-3">Erstellen Sie eine individuelle Untersuchung:</p>

                <div className="mb-3">
                  <label className="form-label">Titel *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="z.B. Augenärztliche Untersuchung"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Kategorie</label>
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
                  <label className="form-label">Beschreibung</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Beschreibung der Untersuchung..."
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                  />
                </div>

                <hr className="my-3" />

                <div className="mb-3">
                  <label className="form-label">Workflow</label>
                  <select
                    className="form-select"
                    value={manualWorkflow}
                    onChange={(e) => setManualWorkflow(e.target.value)}
                  >
                    {WORKFLOW_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="d-flex justify-content-between">
                  <button className="btn btn-outline-secondary" onClick={() => setStep("type")}>
                    <ArrowLeft size={14} className="me-1" /> Zurück
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!manualTitle.trim()}
                    onClick={() => setStep("confirm")}
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div>
                <p className="text-muted mb-3">Wählen Sie den Patienten und bestätigen Sie die Zuweisung:</p>

                <div className="mb-3">
                  <label className="form-label">Patient *</label>
                  <select
                    className="form-select"
                    value={selectedPatient || ""}
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

                <hr className="my-3" />

                <div className="alert alert-info">
                  <div className="fw-semibold mb-2">Zusammenfassung:</div>
                  <div style={{ fontSize: "0.9rem" }}>
                    <strong>Typ:</strong>{" "}
                    {selectedTemplate
                      ? `Template-basiert (${Object.values(templates).flat().find((t) => t.id === selectedTemplate)?.name})`
                      : "Manuell"}
                    <br />
                    <strong>Workflow:</strong>{" "}
                    {WORKFLOW_OPTIONS.find((w) => w.id === (selectedTemplate ? selectedWorkflow : manualWorkflow))?.name}
                    <br />
                    <strong>Patient:</strong>{" "}
                    {selectedPatient
                      ? (() => {
                          const p = patients.find((pt) => pt.id === selectedPatient);
                          return p ? `${p.firstName} ${p.lastName}` : "—";
                        })()
                      : "—"}
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setStep(selectedTemplate ? "template" : "manual")}
                  >
                    <ArrowLeft size={14} className="me-1" /> Zurück
                  </button>
                  <button
                    className="btn btn-success"
                    disabled={!selectedCase || loading}
                    onClick={handleAssign}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <>
                        <Save size={16} className="me-1" /> Untersuchung zuweisen
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
