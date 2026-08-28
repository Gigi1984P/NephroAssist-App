"use client";

import { useState, useEffect } from "react";
import {
  Droplets, Pencil, Check, X, Plus, Activity, Scale, Clock, HeartPulse,
  FlaskConical, Beaker, Syringe, Pill, ClipboardCheck, Trash2,
} from "lucide-react";
import { useTranslation } from "@/components/i18n-provider";

interface DialysisRegimeData {
  id: string;
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

function DialysisInlineField({ label, icon, value, field, regimeId, type = "text", options, onUpdate, placeholder }: any) {
  const { t } = useTranslation();
  const [editValue, setEditValue] = useState(value || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEditValue(value || "");
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/patients/any/dialysis-regime/${regimeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field, value: editValue }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("error.generic", "Speichern fehlgeschlagen"));
        return;
      }
      setIsEditing(false);
      if (onUpdate) onUpdate(field, editValue);
    } catch (e) {
      setError(t("error.network", "Netzwerkfehler"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setError("");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="mb-2">
        <div className="text-muted small fw-semibold mb-1 d-flex align-items-center gap-1">{icon} {label}</div>
        <div className="d-flex align-items-center gap-2">
          {type === "select" ? (
            <select
              className="form-select form-select-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={saving}
              style={{ minWidth: "180px" }}
            >
              {options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : type === "textarea" ? (
            <textarea
              className="form-control form-control-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={saving}
              rows={2}
              style={{ minWidth: "200px", resize: "vertical" }}
            />
          ) : (
            <input
              type={type}
              className="form-control form-control-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={saving}
              style={{ minWidth: "180px" }}
            />
          )}
          <button className="btn btn-sm btn-success p-1" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm" role="status" /> : <Check size={14} />}
          </button>
          <button className="btn btn-sm btn-outline-secondary p-1" onClick={handleCancel} disabled={saving}>
            <X size={14} />
          </button>
        </div>
        {error && <span className="text-danger small">{error}</span>}
      </div>
    );
  }

  const displayValue = type === "select"
    ? options?.find((o: any) => o.value === value)?.label || value || "—"
    : value || "—";

  return (
    <div className="mb-2">
      <div className="text-muted small fw-semibold mb-1 d-flex align-items-center gap-1">{icon} {label}</div>
      <div className="d-flex align-items-center gap-2">
        <span
          onClick={() => setIsEditing(true)}
          style={{ cursor: "pointer" }}
          className="flex-grow-1"
        >
          {displayValue}
        </span>
        <button
          className="btn btn-link text-decoration-none p-0"
          onClick={() => setIsEditing(true)}
          style={{ fontSize: "0.7rem", color: "#2563eb", opacity: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <Pencil size={11} />
        </button>
      </div>
    </div>
  );
}

export default function DialysisRegimeInline({ patientId }: Props) {
  const { t } = useTranslation();
  const [regimes, setRegimes] = useState<DialysisRegimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");

  const loadRegimes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/dialysis-regime`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRegimes(data.regimes || []);
      }
    } catch (e) { console.error("Load regimes error:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadRegimes();
  }, [patientId]);

  const handleFieldUpdate = () => {
    setSaveMsg(t("success.saved", "Gespeichert"));
    setTimeout(() => setSaveMsg(""), 2000);
    loadRegimes();
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/dialysis-regime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          procedure: t("dialysis.hemodialysis", "Hämodialyse"),
          frequency: "3-mal pro Woche",
          duration: "4 Stunden",
          accessType: "AV-Fistel/Shunt",
        }),
      });
      if (res.ok) {
        await loadRegimes();
      }
    } catch (e) { console.error("Create regime error:", e); }
  };

  const handleDelete = async (regimeId: string) => {
    if (!confirm(t("common.confirmDelete", "Wirklich löschen?"))) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/dialysis-regime/${regimeId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await loadRegimes();
    } catch (e) { console.error("Delete regime error:", e); }
  };

  if (loading) {
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-info" role="status" />
        </div>
      </div>
    );
  }

  const regime = regimes[0];

  if (!regime) {
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-info text-white d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Droplets size={18} /> {t("dialysis.title", "Dialyseregime")}
          </div>
        </div>
        <div className="card-body text-center py-4">
          <p className="text-muted mb-3">{t("dialysis.noRegime", "Noch kein Dialyseregime vorhanden")}</p>
          <button className="btn btn-info btn-sm" onClick={handleCreate}>
            <Plus size={14} /> {t("dialysis.createRegime", "Regime anlegen")}
          </button>
        </div>
      </div>
    );
  }

  const PROCEDURE_OPTIONS = [
    { value: "", label: "—" },
    { value: t("dialysis.hemodialysis", "Hämodialyse"), label: t("dialysis.hemodialysis", "Hämodialyse") },
    { value: t("dialysis.hemodiafiltration", "Hämodiafiltration"), label: t("dialysis.hemodiafiltration", "Hämodiafiltration") },
    { value: t("dialysis.peritoneal", "Peritonealdialyse"), label: t("dialysis.peritoneal", "Peritonealdialyse") },
  ];

  const FREQUENCY_OPTIONS = [
    { value: "", label: "—" },
    { value: "3-mal pro Woche", label: "3-mal pro Woche" },
    { value: "2-mal pro Woche", label: "2-mal pro Woche" },
    { value: "täglich", label: "täglich" },
    { value: "4-mal pro Woche", label: "4-mal pro Woche" },
    { value: "Alle 2 Wochen", label: "Alle 2 Wochen" },
    { value: "Individuell", label: "Individuell" },
  ];

  const DURATION_OPTIONS = [
    { value: "", label: "—" },
    { value: "4 Stunden", label: "4 Stunden" },
    { value: "5 Stunden", label: "5 Stunden" },
    { value: "6 Stunden", label: "6 Stunden" },
    { value: "8-10 Stunden (nächtlich)", label: "8-10 Stunden (nächtlich)" },
    { value: "Individuell", label: "Individuell" },
  ];

  const ACCESS_OPTIONS = [
    { value: "", label: "—" },
    { value: "AV-Fistel/Shunt", label: "AV-Fistel/Shunt" },
    { value: "Dialysekatheter", label: "Dialysekatheter" },
    { value: "Shaldon-Katheter", label: "Shaldon-Katheter" },
    { value: "Peritonealdialyse-Katheter", label: "Peritonealdialyse-Katheter" },
  ];

  const DIALYZER_TYPE_OPTIONS = [
    { value: "", label: "—" },
    { value: "High-Flux", label: "High-Flux" },
    { value: "Low-Flux", label: "Low-Flux" },
  ];

  const DIALYZER_SIZE_OPTIONS = [
    { value: "", label: "—" },
    { value: "1.4 m²", label: "1.4 m²" },
    { value: "1.6 m²", label: "1.6 m²" },
    { value: "1.8 m²", label: "1.8 m²" },
    { value: "2.0 m²", label: "2.0 m²" },
    { value: "2.1 m²", label: "2.1 m²" },
  ];

  const POTASSIUM_OPTIONS = [
    { value: "", label: "—" },
    { value: "1.0 mmol/L", label: "1.0 mmol/L" },
    { value: "2.0 mmol/L", label: "2.0 mmol/L" },
    { value: "3.0 mmol/L", label: "3.0 mmol/L" },
    { value: "4.0 mmol/L", label: "4.0 mmol/L" },
  ];

  const CALCIUM_OPTIONS = [
    { value: "", label: "—" },
    { value: "1.25 mmol/L", label: "1.25 mmol/L" },
    { value: "1.50 mmol/L", label: "1.50 mmol/L" },
    { value: "1.75 mmol/L", label: "1.75 mmol/L" },
  ];

  const SODIUM_OPTIONS = [
    { value: "", label: "—" },
    { value: "135 mmol/L", label: "135 mmol/L" },
    { value: "138 mmol/L", label: "138 mmol/L" },
    { value: "140 mmol/L", label: "140 mmol/L" },
    { value: "142 mmol/L", label: "142 mmol/L" },
    { value: "145 mmol/L", label: "145 mmol/L" },
  ];

  const BICARBONATE_OPTIONS = [
    { value: "", label: "—" },
    { value: "32 mmol/L", label: "32 mmol/L" },
    { value: "35 mmol/L", label: "35 mmol/L" },
    { value: "38 mmol/L", label: "38 mmol/L" },
  ];

  const ANTICOAGULATION_OPTIONS = [
    { value: "", label: "—" },
    { value: "Heparin", label: "Heparin" },
    { value: "Citrat", label: "Citrat" },
    { value: "Nadroparin", label: "Nadroparin" },
    { value: "Dalteparin", label: "Dalteparin" },
    { value: "Enoxaparin", label: "Enoxaparin" },
    { value: "Keine", label: "Keine" },
  ];

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-info text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Droplets size={18} /> {t("dialysis.title", "Dialyseregime")}
        </div>
        <div className="d-flex align-items-center gap-2">
          {saveMsg && (
            <span className="badge bg-success d-inline-flex align-items-center gap-1">
              <Check size={12} /> {saveMsg}
            </span>
          )}
          <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(regime.id)} title={t("nav.delete", "Löschen")}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="card-body p-3">
        <div className="row">
          {/* Basisdaten */}
          <div className="col-md-6 col-lg-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Activity size={16} /> {t("dialysis.basisData", "Basisdaten")}
            </h6>
            <DialysisInlineField
              label={t("dialysis.procedure", "Verfahren")}
              icon=<Droplets size={14} />
              value={regime.procedure}
              field="procedure"
              regimeId={regime.id}
              type="select"
              options={PROCEDURE_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.frequency", "Häufigkeit")}
              icon=<Clock size={14} />
              value={regime.frequency}
              field="frequency"
              regimeId={regime.id}
              type="select"
              options={FREQUENCY_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.duration", "Dauer")}
              icon=<Clock size={14} />
              value={regime.duration}
              field="duration"
              regimeId={regime.id}
              type="select"
              options={DURATION_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.accessType", "Gefäßzugang")}
              icon=<HeartPulse size={14} />
              value={regime.accessType}
              field="accessType"
              regimeId={regime.id}
              type="select"
              options={ACCESS_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.targetWeight", "Zielgewicht")}
              icon=<Scale size={14} />
              value={regime.targetWeight}
              field="targetWeight"
              regimeId={regime.id}
              placeholder={t("dialysis.targetWeightPlaceholder", "z.B. 72.5 kg")}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.ultrafiltration", "Ultrafiltrationsziel")}
              icon=<Droplets size={14} />
              value={regime.ultrafiltrationTarget}
              field="ultrafiltrationTarget"
              regimeId={regime.id}
              placeholder={t("dialysis.ultrafiltrationPlaceholder", "z.B. 2.5-3.0 L")}
              onUpdate={handleFieldUpdate}
            />
          </div>

          {/* Gerät-Einstellungen */}
          <div className="col-md-6 col-lg-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FlaskConical size={16} /> {t("dialysis.device", "Gerät")}
            </h6>
            <DialysisInlineField
              label={t("dialysis.bloodFlow", "Blutfluss")}
              icon=<Activity size={14} />
              value={regime.bloodFlow}
              field="bloodFlow"
              regimeId={regime.id}
              placeholder={t("dialysis.bloodFlowPlaceholder", "z.B. 250-300 ml/min")}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.dialysateFlow", "Dialysatfluss")}
              icon=<Activity size={14} />
              value={regime.dialysateFlow}
              field="dialysateFlow"
              regimeId={regime.id}
              placeholder={t("dialysis.dialysateFlowPlaceholder", "z.B. 500 ml/min")}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.dialyzerType", "Dialysator-Typ")}
              icon=<FlaskConical size={14} />
              value={regime.dialyzerType}
              field="dialyzerType"
              regimeId={regime.id}
              type="select"
              options={DIALYZER_TYPE_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.dialyzerSize", "Dialysator-Größe")}
              icon=<FlaskConical size={14} />
              value={regime.dialyzerSize}
              field="dialyzerSize"
              regimeId={regime.id}
              type="select"
              options={DIALYZER_SIZE_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
          </div>

          {/* Dialysatzusammensetzung */}
          <div className="col-md-6 col-lg-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Beaker size={16} /> {t("dialysis.composition", "Zusammensetzung")}
            </h6>
            <DialysisInlineField
              label={t("dialysis.potassium", "Kalium")}
              icon=<Beaker size={14} />
              value={regime.potassium}
              field="potassium"
              regimeId={regime.id}
              type="select"
              options={POTASSIUM_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.calcium", "Calcium")}
              icon=<Beaker size={14} />
              value={regime.calcium}
              field="calcium"
              regimeId={regime.id}
              type="select"
              options={CALCIUM_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.sodium", "Natrium")}
              icon=<Beaker size={14} />
              value={regime.sodium}
              field="sodium"
              regimeId={regime.id}
              type="select"
              options={SODIUM_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.bicarbonate", "Bicarbonat")}
              icon=<Beaker size={14} />
              value={regime.bicarbonate}
              field="bicarbonate"
              regimeId={regime.id}
              type="select"
              options={BICARBONATE_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
          </div>

          {/* Antikoagulation + Kontrollen */}
          <div className="col-md-6 col-lg-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Syringe size={16} /> {t("dialysis.anticoagulation", "Antikoagulation")}
            </h6>
            <DialysisInlineField
              label={t("dialysis.anticoagulation", "Antikoagulation")}
              icon=<Syringe size={14} />
              value={regime.anticoagulation}
              field="anticoagulation"
              regimeId={regime.id}
              type="select"
              options={ANTICOAGULATION_OPTIONS}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.anticoagulationDose", "Dosierung")}
              icon=<Syringe size={14} />
              value={regime.anticoagulationDose}
              field="anticoagulationDose"
              regimeId={regime.id}
              placeholder={t("dialysis.anticoagulationDosePlaceholder", "z.B. 5000 IE Bolus")}
              onUpdate={handleFieldUpdate}
            />

            <h6 className="fw-bold mb-3 mt-4 d-flex align-items-center gap-2">
              <ClipboardCheck size={16} /> {t("dialysis.misc", "Sonstiges")}
            </h6>
            <DialysisInlineField
              label={t("dialysis.medications", "Medikamente")}
              icon=<Pill size={14} />
              value={regime.medicationsDuring}
              field="medicationsDuring"
              regimeId={regime.id}
              type="textarea"
              placeholder={t("dialysis.medicationsPlaceholder", "z.B. Erythropoetin 4000 IE")}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.monitoring", "Überwachung")}
              icon=<ClipboardCheck size={14} />
              value={regime.monitoring}
              field="monitoring"
              regimeId={regime.id}
              type="textarea"
              placeholder={t("dialysis.monitoringPlaceholder", "z.B. Blutdruck alle 30 min")}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.labControls", "Labor")}
              icon=<Beaker size={14} />
              value={regime.labControls}
              field="labControls"
              regimeId={regime.id}
              type="textarea"
              placeholder={t("dialysis.labControlsPlaceholder", "z.B. Kt/V monatlich")}
              onUpdate={handleFieldUpdate}
            />
            <DialysisInlineField
              label={t("dialysis.notes", "Notizen")}
              icon=<ClipboardCheck size={14} />
              value={regime.notes}
              field="notes"
              regimeId={regime.id}
              type="textarea"
              placeholder={t("dialysis.notesPlaceholder", "Weitere Notizen...")}
              onUpdate={handleFieldUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
