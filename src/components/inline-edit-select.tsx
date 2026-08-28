"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/i18n-provider";
import { Check, X, Pencil } from "lucide-react";

interface InlineEditSelectProps {
  value: string;
  label: string;
  field: string;
  patientId: string;
  options: { value: string; label: string }[];
  onUpdate?: (field: string, value: string) => void;
  renderDisplay?: (value: string) => React.ReactNode;
}

export default function InlineEditSelect({
  value,
  label,
  field,
  patientId,
  options,
  onUpdate,
  renderDisplay,
}: InlineEditSelectProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value || "");
  }, [value]);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/patients/${patientId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field, value: editValue }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("inline.saveFailed", "Speichern fehlgeschlagen"));
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

  const displayValue = options.find((o) => o.value === value)?.label || value || "—";

  if (isEditing) {
    return (
      <div className="d-flex flex-column gap-1">
        <div className="d-flex align-items-center gap-2">
          <select
            ref={selectRef}
            className="form-select form-select-sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            style={{ minWidth: "200px" }}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className="btn btn-sm btn-success p-1"
            onClick={handleSave}
            disabled={saving}
            title={t("inline.save", "Speichern")}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <Check size={14} />
            )}
          </button>
          <button
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={handleCancel}
            disabled={saving}
            title={t("inline.cancel", "Abbrechen")}
          >
            <X size={14} />
          </button>
        </div>
        {error && <span className="text-danger small">{error}</span>}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <span
        className="cursor-pointer flex-grow-1"
        onClick={() => setIsEditing(true)}
        title={t("inline.editTooltip", "Klicken zum Bearbeiten")}
        style={{ cursor: "pointer" }}
      >
        {renderDisplay ? renderDisplay(value) : displayValue}
      </span>
      <button
        className="btn btn-link text-decoration-none p-0"
        onClick={() => setIsEditing(true)}
        title={t("inline.editTooltip", "Bearbeiten")}
        style={{ fontSize: "0.75rem", color: "#2563eb", opacity: 0, transition: "opacity 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}
