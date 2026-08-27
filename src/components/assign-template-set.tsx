"use client";

import { useState, useEffect } from "react";
import { FolderOpen, ChevronDown, Check, Loader2 } from "lucide-react";

interface TemplateSet {
  id: string;
  name: string;
  description: string | null;
  items: any[];
}

interface AssignTemplateSetProps {
  patientId: string;
}

export default function AssignTemplateSet({ patientId }: AssignTemplateSetProps) {
  const [templateSets, setTemplateSets] = useState<TemplateSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/template-sets", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setTemplateSets(d.templateSets || []);
      })
      .catch(() => {});
  }, []);

  async function handleAssign() {
    if (!selectedSetId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/assign-template-set`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSetId: selectedSetId }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Zuweisung fehlgeschlagen");
      }
    } catch {
      alert("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  const selectedSet = templateSets.find((s) => s.id === selectedSetId);

  if (templateSets.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <FolderOpen size={16} />
        <span className="fw-medium small">Untersuchungs-Set zuweisen</span>
      </div>

      <div className="d-flex gap-2 align-items-start">
        <div className="flex-grow-1 position-relative">
          <button
            className="form-select text-start d-flex justify-content-between align-items-center"
            onClick={() => setOpen(!open)}
            disabled={loading}
          >
            <span>{selectedSet?.name || "Set auswählen…"}</span>
            <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </button>

          {open && (
            <div className="position-absolute start-0 end-0 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: "250px", overflow: "auto" }}>
              {templateSets.map((set) => (
                <button
                  key={set.id}
                  className={`d-flex align-items-center gap-2 px-3 py-2 w-100 text-start border-0 ${
                    selectedSetId === set.id ? "bg-primary text-white" : "bg-transparent"
                  }`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    if (selectedSetId !== set.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#f8f9fa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSetId !== set.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }
                  }}
                  onClick={() => {
                    setSelectedSetId(set.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex-grow-1">
                    <div className="fw-medium small">{set.name}</div>
                    {set.description && (
                      <div className="small" style={{ opacity: 0.7 }}>{set.description}</div>
                    )}
                    <div className="small" style={{ opacity: 0.7 }}>{set.items.length} Untersuchungen</div>
                  </div>
                  {selectedSetId === set.id && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-outline-primary btn-sm text-nowrap"
          onClick={handleAssign}
          disabled={!selectedSetId || loading}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="me-1" style={{ animation: "spin 1s linear infinite" }} />
              Zuweisen…
            </>
          ) : (
            <>
              <Check size={14} className="me-1" />
              Zuweisen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
