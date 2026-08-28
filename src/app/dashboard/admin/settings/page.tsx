"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Save, Mail, Bell, ShieldCheck, Wrench, Clock, Settings2,
  RotateCcw, ChevronDown, ChevronUp, AlertTriangle, Send
} from "lucide-react";

interface SystemConfig {
  id: string;
  key: string;
  value: string | null;
  type: string;
  label: string;
  description: string | null;
  category: string;
  editable: boolean;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  email: { label: "E-Mail", icon: <Mail size={18} />, color: "#3b82f6" },
  notifications: { label: "Benachrichtigungen", icon: <Bell size={18} />, color: "#f59e0b" },
  reminders: { label: "Erinnerungen", icon: <Clock size={18} />, color: "#10b981" },
  security: { label: "Sicherheit", icon: <ShieldCheck size={18} />, color: "#dc2626" },
  maintenance: { label: "Wartung", icon: <Wrench size={18} />, color: "#7c3aed" },
  general: { label: "Allgemein", icon: <Settings2 size={18} />, color: "#64748b" },
};

function getCategoryKeys(): string[] {
  return ["general", "email", "notifications", "reminders", "security", "maintenance"];
}

export default function SettingsPanel() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(["email", "notifications", "security"])
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
      }
    } catch (e) {
      console.error("Load configs error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const updateValue = (key: string, value: string | boolean) => {
    const strValue = value === true ? "true" : value === false ? "false" : String(value);
    setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, value: strValue } : c)));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const changed = configs.map((c) => ({ key: c.key, value: c.value }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: changed }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Einstellungen gespeichert!" });
        setHasChanges(false);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler beim Speichern" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    try {
      const res = await fetch("/api/admin/settings/seed", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Default-Einstellungen initialisiert!" });
        loadConfigs();
      }
    } catch (e) {
      setMessage({ type: "error", text: "Fehler beim Initialisieren" });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestResult({ success: false, message: "Bitte eine gültige E-Mail-Adresse eingeben." });
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const provider = configs.find((c) => c.key === "EMAIL_PROVIDER")?.value || "resend";
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail, provider }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: "Test-E-Mail gesendet! Bitte Posteingang prüfen." });
      } else {
        setTestResult({ success: false, message: data.error || "Fehler beim Senden" });
      }
    } catch (e) {
      setTestResult({ success: false, message: "Netzwerkfehler beim Senden" });
    } finally {
      setTestSending(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const grouped = getCategoryKeys().map((cat) => ({
    key: cat,
    meta: CATEGORY_META[cat],
    items: configs.filter((c) => c.category === cat),
  }));

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-3">Einstellungen laden...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="System-Einstellungen"
        description="Konfiguration der Anwendung"
        action={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2" onClick={handleSeed}>
              <RotateCcw size={16} />
              Defaults laden
            </button>
            <button
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              <Save size={16} />
              {saving ? "Speichern..." : "Speichern"}
            </button>
          </div>
        }
      />

      {message && (
        <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show mb-3`}>
          {message.text}
          <button className="btn-close" onClick={() => setMessage(null)} />
        </div>
      )}

      {configs.length === 0 && (
        <div className="alert alert-info d-flex align-items-center gap-2">
          <AlertTriangle size={20} />
          <div>
            Keine Einstellungen vorhanden. Klicke auf <strong>"Defaults laden"</strong>, um die Standard-Einstellungen zu initialisieren.
          </div>
        </div>
      )}

      {grouped.map(({ key, meta, items }) => {
        if (items.length === 0) return null;
        const isOpen = openCategories.has(key);
        return (
          <div key={key} className="dashboard-card mb-3">
            <div
              className="card-header-custom d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => toggleCategory(key)}
            >
              <span className="fw-semibold d-flex align-items-center gap-2">
                <span style={{ color: meta.color }}>{meta.icon}</span>
                {meta.label}
              </span>
              <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
            {isOpen && (
              <div className="card-body-custom">
                <div className="row g-3">
                  {items.map((cfg) => (
                    <div key={cfg.id} className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium">{cfg.label}</label>
                        {cfg.type === "boolean" ? (
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={cfg.value === "true"}
                              onChange={(e) => updateValue(cfg.key, e.target.checked)}
                            />
                            <label className="form-check-label" style={{ fontSize: "0.85rem" }}>
                              {cfg.value === "true" ? "Aktiv" : "Inaktiv"}
                            </label>
                          </div>
                        ) : cfg.type === "number" ? (
                          <input
                            type="number"
                            className="form-control"
                            value={cfg.value || ""}
                            onChange={(e) => updateValue(cfg.key, e.target.value)}
                          />
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={cfg.value || ""}
                            onChange={(e) => updateValue(cfg.key, e.target.value)}
                            placeholder={cfg.description || ""}
                          />
                        )}
                        {cfg.description && <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>{cfg.description}</small>}
                      </div>
                    </div>
                  ))}
                </div>
                {key === "email" && (
                  <div className="mt-4 pt-3" style={{ borderTop: "1px solid #e2e8f0" }}>
                    <label className="form-label fw-medium d-flex align-items-center gap-2">
                      <Send size={16} />
                      Test-E-Mail senden
                    </label>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <div className="input-group">
                          <input
                            type="email"
                            className="form-control"
                            placeholder="test@example.com"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                          />
                          <button
                            className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                            onClick={handleTestEmail}
                            disabled={testSending}
                          >
                            {testSending ? "Wird gesendet..." : "Senden"}
                            {!testSending && <Send size={14} className="ms-1" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {testResult && (
                      <div className={`alert alert-${testResult.success ? "success" : "danger"} mt-2 py-2`} style={{ fontSize: "0.85rem" }}>
                        {testResult.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
