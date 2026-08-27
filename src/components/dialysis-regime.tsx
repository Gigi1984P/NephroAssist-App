"use client";

import { useState, useEffect } from "react";
import {
  Droplets, Pencil, Trash2, X, Check, Plus, ChevronDown,
  Activity, Scale, Clock, HeartPulse, Syringe, FlaskConical,
  Pill, ClipboardCheck, Beaker
} from "lucide-react";

interface DialysisRegimeData {
  id?: string;
  procedure: string;
  frequency: string;
  duration: string;
  accessType: string;
  targetWeight: string;
  ultrafiltrationTarget: string;
  bloodFlow: string;
  dialysateFlow: string;
  dialyzerType: string;
  dialyzerSize: string;
  potassium: string;
  calcium: string;
  sodium: string;
  bicarbonate: string;
  anticoagulation: string;
  anticoagulationDose: string;
  medicationsDuring: string;
  monitoring: string;
  labControls: string;
  notes: string;
}

interface Props {
  patientId: string;
}

const PROCEDURE_OPTIONS = [
  "Hämodialyse",
  "Hämodiafiltration",
  "Peritonealdialyse",
];

const FREQUENCY_OPTIONS = [
  "3-mal pro Woche",
  "2-mal pro Woche",
  "täglich",
  "4-mal pro Woche",
  "Alle 2 Wochen",
  "Individuell",
];

const DURATION_OPTIONS = [
  "4 Stunden",
  "5 Stunden",
  "6 Stunden",
  "8-10 Stunden (nächtlich)",
  "Individuell",
];

const ACCESS_OPTIONS = [
  "AV-Fistel/Shunt",
  "Dialysekatheter",
  "Shaldon-Katheter",
  "Peritonealdialyse-Katheter",
];

const DIALYZER_TYPE_OPTIONS = [
  "High-Flux",
  "Low-Flux",
];

const DIALYZER_SIZE_OPTIONS = [
  "1.4 m²",
  "1.6 m²",
  "1.8 m²",
  "2.0 m²",
  "2.1 m²",
];

const POTASSIUM_OPTIONS = [
  "1.0 mmol/L",
  "2.0 mmol/L",
  "3.0 mmol/L",
  "4.0 mmol/L",
];

const CALCIUM_OPTIONS = [
  "1.25 mmol/L",
  "1.50 mmol/L",
  "1.75 mmol/L",
];

const SODIUM_OPTIONS = [
  "135 mmol/L",
  "138 mmol/L",
  "140 mmol/L",
  "142 mmol/L",
  "145 mmol/L",
];

const BICARBONATE_OPTIONS = [
  "32 mmol/L",
  "35 mmol/L",
  "38 mmol/L",
];

const ANTICOAGULATION_OPTIONS = [
  "Heparin",
  "Citrat",
  "Nadroparin",
  "Dalteparin",
  "Enoxaparin",
  "Keine",
];

const EMPTY_REGIME: DialysisRegimeData = {
  procedure: "",
  frequency: "",
  duration: "",
  accessType: "",
  targetWeight: "",
  ultrafiltrationTarget: "",
  bloodFlow: "",
  dialysateFlow: "",
  dialyzerType: "",
  dialyzerSize: "",
  potassium: "",
  calcium: "",
  sodium: "",
  bicarbonate: "",
  anticoagulation: "",
  anticoagulationDose: "",
  medicationsDuring: "",
  monitoring: "",
  labControls: "",
  notes: "",
};

function SelectDropdown({
  label, icon, value, options, onChange, disabled
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="form-label d-flex align-items-center gap-2 fw-medium small">
        {icon} {label}
      </label>
      <select
        className="form-select form-select-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Bitte wählen...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
  label, icon, value, onChange, placeholder, disabled
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="form-label d-flex align-items-center gap-2 fw-medium small">
        {icon} {label}
      </label>
      <input
        type="text"
        className="form-control form-control-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function TextArea({
  label, icon, value, onChange, placeholder, rows, disabled
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="form-label d-flex align-items-center gap-2 fw-medium small">
        {icon} {label}
      </label>
      <textarea
        className="form-control form-control-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows || 2}
        disabled={disabled}
      />
    </div>
  );
}

export default function DialysisRegime({ patientId }: Props) {
  const [regimes, setRegimes] = useState<DialysisRegimeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DialysisRegimeData>({ ...EMPTY_REGIME });

  useEffect(() => {
    loadRegimes();
  }, []);

  async function loadRegimes() {
    try {
      const res = await fetch(`/api/patients/${patientId}/dialysis-regime`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRegimes(data.regimes || []);
      }
    } catch { /* ignore */ }
  }

  function updateField(field: keyof DialysisRegimeData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.procedure || !form.frequency || !form.duration || !form.accessType) {
      alert("Dialyseverfahren, Häufigkeit, Dauer und Gefäßzugang sind Pflichtfelder");
      return;
    }
    setLoading(true);
    try {
      const url = form.id
        ? `/api/patients/${patientId}/dialysis-regime/${form.id}`
        : `/api/patients/${patientId}/dialysis-regime`;
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setEditing(false);
        setForm({ ...EMPTY_REGIME });
        await loadRegimes();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Speichern fehlgeschlagen");
      }
    } catch {
      alert("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/dialysis-regime/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await loadRegimes();
    } catch { /* ignore */ }
  }

  function handleEdit(r: DialysisRegimeData) {
    setForm({ ...r });
    setEditing(true);
  }

  const currentRegime = regimes[0];

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-info text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Droplets size={18} /> Dialyseregime
        </div>
        {!editing && (
          <button
            className="btn btn-sm btn-light"
            onClick={() => {
              setForm({ ...EMPTY_REGIME });
              setEditing(true);
            }}
          >
            <Plus size={14} /> {currentRegime ? "Bearbeiten" : "Neu anlegen"}
          </button>
        )}
      </div>

      <div className="card-body p-3">
        {editing ? (
          <div className="row">
            {/* Basisdaten */}
            <div className="col-md-6">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Activity size={16} /> Basisdaten
              </h6>
              <SelectDropdown
                label="Dialyseverfahren"
                icon={<Droplets size={14} />}
                value={form.procedure}
                options={PROCEDURE_OPTIONS}
                onChange={(v) => updateField("procedure", v)}
                disabled={loading}
              />
              <SelectDropdown
                label="Häufigkeit"
                icon={<Clock size={14} />}
                value={form.frequency}
                options={FREQUENCY_OPTIONS}
                onChange={(v) => updateField("frequency", v)}
                disabled={loading}
              />
              <SelectDropdown
                label="Dauer pro Sitzung"
                icon={<Clock size={14} />}
                value={form.duration}
                options={DURATION_OPTIONS}
                onChange={(v) => updateField("duration", v)}
                disabled={loading}
              />
              <SelectDropdown
                label="Gefäßzugang"
                icon={<HeartPulse size={14} />}
                value={form.accessType}
                options={ACCESS_OPTIONS}
                onChange={(v) => updateField("accessType", v)}
                disabled={loading}
              />
              <TextInput
                label="Zielgewicht / Trockengewicht"
                icon={<Scale size={14} />}
                value={form.targetWeight}
                onChange={(v) => updateField("targetWeight", v)}
                placeholder="z.B. 72.5 kg"
                disabled={loading}
              />
              <TextInput
                label="Ultrafiltrationsziel"
                icon={<Droplets size={14} />}
                value={form.ultrafiltrationTarget}
                onChange={(v) => updateField("ultrafiltrationTarget", v)}
                placeholder="z.B. 2.5-3.0 L"
                disabled={loading}
              />
            </div>

            {/* Dialysegerät-Einstellungen */}
            <div className="col-md-6">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FlaskConical size={16} /> Gerät-Einstellungen
              </h6>
              <TextInput
                label="Blutfluss"
                icon={<Activity size={14} />}
                value={form.bloodFlow}
                onChange={(v) => updateField("bloodFlow", v)}
                placeholder="z.B. 250-300 ml/min"
                disabled={loading}
              />
              <TextInput
                label="Dialysatfluss"
                icon={<Activity size={14} />}
                value={form.dialysateFlow}
                onChange={(v) => updateField("dialysateFlow", v)}
                placeholder="z.B. 500 ml/min"
                disabled={loading}
              />
              <SelectDropdown
                label="Dialysator-Typ"
                icon={<FlaskConical size={14} />}
                value={form.dialyzerType}
                options={DIALYZER_TYPE_OPTIONS}
                onChange={(v) => updateField("dialyzerType", v)}
                disabled={loading}
              />
              <SelectDropdown
                label="Dialysator-Größe"
                icon={<FlaskConical size={14} />}
                value={form.dialyzerSize}
                options={DIALYZER_SIZE_OPTIONS}
                onChange={(v) => updateField("dialyzerSize", v)}
                disabled={loading}
              />

              <h6 className="fw-bold mb-3 mt-4 d-flex align-items-center gap-2">
                <Beaker size={16} /> Dialysatzusammensetzung
              </h6>
              <SelectDropdown
                label="Kalium"
                icon={<Beaker size={14} />}
                value={form.potassium}
                options={POTASSIUM_OPTIONS}
                onChange={(v) => updateField("potassium", v)}
                disabled={loading}
              />
              <SelectDropdown
                label="Calcium"
                icon={<Beaker size={14} />}
                value={form.calcium}
                options={CALCIUM_OPTIONS}
                onChange={(v) => updateField("calcium", v)}
                disabled={loading}
              />
              <SelectDropdown
                label="Natrium"
                icon={<Beaker size={14} />}
                value={form.sodium}
                options={SODIUM_OPTIONS}
                onChange={(v) => updateField("sodium", v)}
                disabled={loading}
              />
              <SelectDropdown
                label="Bicarbonat"
                icon={<Beaker size={14} />}
                value={form.bicarbonate}
                options={BICARBONATE_OPTIONS}
                onChange={(v) => updateField("bicarbonate", v)}
                disabled={loading}
              />
            </div>

            {/* Antikoagulation + Medikamente */}
            <div className="col-md-6 mt-3">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Syringe size={16} /> Antikoagulation
              </h6>
              <SelectDropdown
                label="Antikoagulation"
                icon={<Syringe size={14} />}
                value={form.anticoagulation}
                options={ANTICOAGULATION_OPTIONS}
                onChange={(v) => updateField("anticoagulation", v)}
                disabled={loading}
              />
              <TextInput
                label="Antikoagulations-Dosierung"
                icon={<Syringe size={14} />}
                value={form.anticoagulationDose}
                onChange={(v) => updateField("anticoagulationDose", v)}
                placeholder="z.B. 5000 IE Bolus, 1000 IE/h"
                disabled={loading}
              />
              <TextArea
                label="Medikamente während/bei der Dialyse"
                icon={<Pill size={14} />}
                value={form.medicationsDuring}
                onChange={(v) => updateField("medicationsDuring", v)}
                placeholder="z.B. Erythropoetin 4000 IE, Eisensaccharat 200 mg"
                rows={2}
                disabled={loading}
              />
            </div>

            {/* Kontrollen */}
            <div className="col-md-6 mt-3">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <ClipboardCheck size={16} /> Kontrollen
              </h6>
              <TextArea
                label="Überwachung während Dialyse"
                icon={<ClipboardCheck size={14} />}
                value={form.monitoring}
                onChange={(v) => updateField("monitoring", v)}
                placeholder="z.B. Blutdruck alle 30 min, Gewicht vor/nach, Kt/V monatlich"
                rows={2}
                disabled={loading}
              />
              <TextArea
                label="Labor-Kontrollen"
                icon={<Beaker size={14} />}
                value={form.labControls}
                onChange={(v) => updateField("labControls", v)}
                placeholder="z.B. Phosphat, PTH, Hb, Ferritin monatlich"
                rows={2}
                disabled={loading}
              />
              <TextArea
                label="Notizen / Besonderheiten"
                icon={<ClipboardCheck size={14} />}
                value={form.notes}
                onChange={(v) => updateField("notes", v)}
                placeholder="Zusätzliche Informationen..."
                rows={2}
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="col-12 d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setEditing(false); setForm({ ...EMPTY_REGIME }); }}
                disabled={loading}
              >
                <X size={14} className="me-1" /> Abbrechen
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Speichern…" : (
                  <>
                    <Check size={14} className="me-1" /> Speichern
                  </>
                )}
              </button>
            </div>
          </div>
        ) : currentRegime ? (
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Activity size={16} /> Basisdaten
              </h6>
              <InfoRow icon={<Droplets size={14} />} label="Dialyseverfahren" value={currentRegime.procedure} />
              <InfoRow icon={<Clock size={14} />} label="Häufigkeit" value={currentRegime.frequency} />
              <InfoRow icon={<Clock size={14} />} label="Dauer" value={currentRegime.duration} />
              <InfoRow icon={<HeartPulse size={14} />} label="Gefäßzugang" value={currentRegime.accessType} />
              <InfoRow icon={<Scale size={14} />} label="Zielgewicht" value={currentRegime.targetWeight} />
              <InfoRow icon={<Droplets size={14} />} label="Ultrafiltrationsziel" value={currentRegime.ultrafiltrationTarget} />
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FlaskConical size={16} /> Gerät-Einstellungen
              </h6>
              <InfoRow icon={<Activity size={14} />} label="Blutfluss" value={currentRegime.bloodFlow} />
              <InfoRow icon={<Activity size={14} />} label="Dialysatfluss" value={currentRegime.dialysateFlow} />
              <InfoRow icon={<FlaskConical size={14} />} label="Dialysator-Typ" value={currentRegime.dialyzerType} />
              <InfoRow icon={<FlaskConical size={14} />} label="Dialysator-Größe" value={currentRegime.dialyzerSize} />

              <h6 className="fw-bold mb-3 mt-4 d-flex align-items-center gap-2">
                <Beaker size={16} /> Dialysatzusammensetzung
              </h6>
              <InfoRow icon={<Beaker size={14} />} label="Kalium" value={currentRegime.potassium} />
              <InfoRow icon={<Beaker size={14} />} label="Calcium" value={currentRegime.calcium} />
              <InfoRow icon={<Beaker size={14} />} label="Natrium" value={currentRegime.sodium} />
              <InfoRow icon={<Beaker size={14} />} label="Bicarbonat" value={currentRegime.bicarbonate} />
            </div>
            <div className="col-md-6 mt-3">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Syringe size={16} /> Antikoagulation
              </h6>
              <InfoRow icon={<Syringe size={14} />} label="Antikoagulation" value={currentRegime.anticoagulation} />
              <InfoRow icon={<Syringe size={14} />} label="Dosierung" value={currentRegime.anticoagulationDose} />
              <InfoRow icon={<Pill size={14} />} label="Medikamente während Dialyse" value={currentRegime.medicationsDuring} />
            </div>
            <div className="col-md-6 mt-3">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <ClipboardCheck size={16} /> Kontrollen
              </h6>
              <InfoRow icon={<ClipboardCheck size={14} />} label="Überwachung" value={currentRegime.monitoring} />
              <InfoRow icon={<Beaker size={14} />} label="Labor-Kontrollen" value={currentRegime.labControls} />
              {currentRegime.notes && <InfoRow icon={<ClipboardCheck size={14} />} label="Notizen" value={currentRegime.notes} />}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <Droplets size={32} className="mb-2" />
            <div>Noch kein Dialyseregime eingetragen</div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="d-flex align-items-start gap-2 mb-2">
      <span className="text-muted mt-1">{icon}</span>
      <div>
        <div className="small text-muted">{label}</div>
        <div className="fw-medium">{value}</div>
      </div>
    </div>
  );
}
