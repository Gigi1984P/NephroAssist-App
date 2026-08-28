"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/i18n-provider";
import { Check, X, Pencil } from "lucide-react";

interface InlineEditTextareaProps {
  value: string;
  label: string;
  field: string;
  patientId: string;
  rows?: number;
  placeholder?: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function InlineEditTextarea({
  value,
  label,
  field,
  patientId,
  rows = 2,
  placeholder = "",
  onUpdate,
}: InlineEditTextareaProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value || "");
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
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
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="d-flex flex-column gap-1">
        <div className="d-flex align-items-start gap-2">
          <textarea
            ref={textareaRef}
            className="form-control form-control-sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={saving}
            rows={rows}
            style={{ minWidth: "300px", resize: "vertical" }}
          />
          <div className="d-flex flex-column gap-1">
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
        </div>
        {error && <span className="text-danger small">{error}</span>}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-start gap-2">
      <span
        className="cursor-pointer flex-grow-1"
        onClick={() => setIsEditing(true)}
        title={t("inline.editTooltip", "Klicken zum Bearbeiten")}
        style={{ cursor: "pointer", whiteSpace: "pre-wrap" }}
      >
        {value || <span className="text-muted">—</span>}
      </span>
      <button
        className="btn btn-link text-decoration-none p-0"
        onClick={() => setIsEditing(true)}
        title={t("inline.editTooltip", "Bearbeiten")}
        style={{ fontSize: "0.75rem", color: "#2563eb", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}
