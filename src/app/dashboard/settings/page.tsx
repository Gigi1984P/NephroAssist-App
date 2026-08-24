"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { AlertCircle, User, Lock, Globe, Save, RotateCcw, Stethoscope } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  generalPractitionerName: string | null;
  generalPractitionerEmail: string | null;
  generalPractitionerPhone: string | null;
  generalPractitionerAddress: string | null;
  generalPractitionerCity: string | null;
}

/* localStorage keys */
const LS_NAME = "nephro-settings-draft-name";
const LS_TAB = "nephro-settings-active-tab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "preferences" | "gp">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LS_TAB);
      // Fallback auf "profile" wenn "gp" gespeichert aber noch keine Rolle geladen
      if (saved === "gp") return "gp";
      return (saved as any) || "profile";
    }
    return "profile";
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LS_NAME) || "";
    }
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDirty, setPasswordDirty] = useState(false);

  // GP form
  const [gpForm, setGpForm] = useState({
    generalPractitionerName: "",
    generalPractitionerEmail: "",
    generalPractitionerPhone: "",
    generalPractitionerAddress: "",
    generalPractitionerCity: "",
  });
  const [gpLoading, setGpLoading] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Fetch profile on mount */
  useEffect(() => {
    fetchProfile();
    if (typeof window !== "undefined" && localStorage.getItem(LS_TAB) === "gp") {
      fetchPatientProfile();
    }
  }, []);

  /* Auto-save name to localStorage */
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      localStorage.setItem(LS_NAME, name);
      if (name !== originalName) {
        setMessage({ type: "success", text: "Entwurf automatisch gespeichert" });
      }
    }, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [name, originalName]);

  /* Warn before closing if unsaved */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (name !== originalName) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [name, originalName]);

  /* Hide success message after 3s */
  useEffect(() => {
    if (message?.type === "success") {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const user = data.user || data;
        setProfile(user);
        setOriginalName(user.name || "");
        if (!localStorage.getItem(LS_NAME)) {
          setName(user.name || "");
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const fetchPatientProfile = async () => {
    try {
      const res = await fetch("/api/patients/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPatientProfile(data.patient);
        if (data.patient) {
          setGpForm({
            generalPractitionerName: data.patient.generalPractitionerName || "",
            generalPractitionerEmail: data.patient.generalPractitionerEmail || "",
            generalPractitionerPhone: data.patient.generalPractitionerPhone || "",
            generalPractitionerAddress: data.patient.generalPractitionerAddress || "",
            generalPractitionerCity: data.patient.generalPractitionerCity || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load patient profile:", err);
    }
  };

  const handleSaveName = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setOriginalName(name);
        localStorage.removeItem(LS_NAME);
        setMessage({ type: "success", text: "Profil erfolgreich gespeichert" });
      } else {
        setMessage({ type: "error", text: data.error || "Fehler beim Speichern" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGP = async () => {
    setGpLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/patients/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gpForm),
      });
      const data = await res.json();
      if (res.ok) {
        setPatientProfile(data.patient);
        setMessage({ type: "success", text: "Hausarzt-Daten erfolgreich gespeichert" });
      } else {
        setMessage({ type: "error", text: data.error || "Fehler beim Speichern" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setGpLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwörter stimmen nicht überein" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Passwort muss mindestens 8 Zeichen haben" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordDirty(false);
        setMessage({ type: "success", text: "Passwort erfolgreich geändert" });
      } else {
        setMessage({ type: "error", text: data.error || "Fehler beim Ändern" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: "profile" | "password" | "preferences" | "gp") => {
    if (name !== originalName) {
      setPendingTab(tab);
      setShowUnsaved(true);
      return;
    }
    setActiveTab(tab);
    localStorage.setItem(LS_TAB, tab);
    if (tab === "gp") {
      fetchPatientProfile();
    }
  };

  const confirmSwitchTab = () => {
    if (pendingTab) {
      setActiveTab(pendingTab as any);
      localStorage.setItem(LS_TAB, pendingTab);
      setShowUnsaved(false);
      setPendingTab(null);
      if (pendingTab === "gp") {
        fetchPatientProfile();
      }
    }
  };

  const cancelSwitchTab = () => {
    setShowUnsaved(false);
    setPendingTab(null);
  };

  const isPatient = profile?.role === "PATIENT";

  return (
    <div>
      <PageHeader title="Einstellungen" description="Verwalten Sie Ihre Profil- und Kontoeinstellungen" />

      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} d-flex align-items-center gap-2 mb-3`}
          role="alert"
        >
          <AlertCircle size={16} />
          <span>{message.text}</span>
        </div>
      )}

      {showUnsaved && (
        <div className="alert alert-warning mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>Sie haben ungespeicherte Änderungen. Möchten Sie diese verwerfen?</span>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-secondary" onClick={cancelSwitchTab}>Abbrechen</button>
              <button className="btn btn-sm btn-warning" onClick={confirmSwitchTab}>Verwerfen</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => switchTab("profile")}
              >
                <User size={14} className="me-1" /> Profil
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "password" ? "active" : ""}`}
                onClick={() => switchTab("password")}
              >
                <Lock size={14} className="me-1" /> Passwort
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "preferences" ? "active" : ""}`}
                onClick={() => switchTab("preferences")}
              >
                <Globe size={14} className="me-1" /> Präferenzen
              </button>
            </li>
            {isPatient ? (
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "gp" ? "active" : ""}`}
                  onClick={() => switchTab("gp")}
                >
                  <Stethoscope size={14} className="me-1" /> Hausarzt
                </button>
              </li>
            ) : profile ? (
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "gp" ? "active" : ""}`}
                  onClick={() => switchTab("gp")}
                  disabled
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                  title="Nur für Patienten verfügbar"
                >
                  <Stethoscope size={14} className="me-1" /> Hausarzt
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <button className="nav-link disabled" style={{ opacity: 0.5 }}>
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                  Laden...
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="card-body">
          {activeTab === "profile" && (
            <div>
              <div className="mb-3">
                <label className="form-label">E-Mail</label>
                <input type="email" className="form-control" value={profile?.email || ""} disabled />
                <div className="form-text">E-Mail-Adresse kann nicht geändert werden.</div>
              </div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Rolle</label>
                <input type="text" className="form-control" value={profile?.role || ""} disabled />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveName}
                  disabled={loading || name === originalName}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    <><Save size={16} className="me-1" /> Speichern</>
                  )}
                </button>
                {name !== originalName && (
                  <span className="text-warning" style={{ fontSize: "0.85rem" }}>Ungespeicherte Änderungen</span>
                )}
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div>
              <div className="mb-3">
                <label className="form-label">Aktuelles Passwort</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Neues Passwort</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordDirty(true);
                  }}
                />
                {passwordDirty && newPassword.length < 8 && (
                  <div className="text-danger" style={{ fontSize: "0.85rem" }}>Mindestens 8 Zeichen</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Passwort bestätigen</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordDirty(true);
                  }}
                />
                {passwordDirty && confirmPassword && newPassword !== confirmPassword && (
                  <div className="text-danger" style={{ fontSize: "0.85rem" }}>Passwörter stimmen nicht überein</div>
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={handlePasswordChange}
                disabled={
                  loading ||
                  !currentPassword ||
                  !newPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  <><RotateCcw size={16} className="me-1" /> Passwort ändern</>
                )}
              </button>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="text-muted">Präferenzen werden in einer zukünftigen Version verfügbar sein.</div>
          )}

          {activeTab === "gp" && isPatient && (
            <div>
              <p className="text-muted mb-3">
                Hinterlegen Sie hier die Daten Ihres Hausarztes. Diese werden für Überweisungsanfragen verwendet.
              </p>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name des Hausarztes *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="z.B. Dr. Max Mustermann"
                    value={gpForm.generalPractitionerName}
                    onChange={(e) => setGpForm((prev) => ({ ...prev, generalPractitionerName: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">E-Mail des Hausarztes *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="z.B. dr.mustermann@praxis.de"
                    value={gpForm.generalPractitionerEmail}
                    onChange={(e) => setGpForm((prev) => ({ ...prev, generalPractitionerEmail: e.target.value }))}
                  />
                  <div className="form-text">
                    Wird für automatische Überweisungsanfragen benötigt.
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefonnummer</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="z.B. 030 12345678"
                    value={gpForm.generalPractitionerPhone}
                    onChange={(e) => setGpForm((prev) => ({ ...prev, generalPractitionerPhone: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Stadt</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="z.B. Berlin"
                    value={gpForm.generalPractitionerCity}
                    onChange={(e) => setGpForm((prev) => ({ ...prev, generalPractitionerCity: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Adresse</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="z.B. Friedrichstraße 123, 10117 Berlin"
                    value={gpForm.generalPractitionerAddress}
                    onChange={(e) => setGpForm((prev) => ({ ...prev, generalPractitionerAddress: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-4 d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveGP}
                  disabled={gpLoading || !gpForm.generalPractitionerName || !gpForm.generalPractitionerEmail}
                >
                  {gpLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    <><Save size={16} className="me-1" /> Hausarzt speichern</>
                  )}
                </button>

                {patientProfile?.generalPractitionerEmail && (
                  <span className="text-success" style={{ fontSize: "0.85rem" }}>
                    ✓ Gespeichert — Überweisungsanfragen möglich
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
