"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { AlertCircle, User, Lock, Globe, Save, RotateCcw } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

/* localStorage keys */
const LS_NAME = "nephro-settings-draft-name";
const LS_TAB = "nephro-settings-active-tab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "preferences">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(LS_TAB) as any) || "profile";
    }
    return "profile";
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
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
  const [pendingTab, setPendingTab] = useState<"profile" | "password" | "preferences" | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDirty, setPasswordDirty] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Fetch profile on mount */
  useEffect(() => {
    fetchProfile();
  }, []);

  /* Auto-save name to localStorage */
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      localStorage.setItem(LS_NAME, name);
      if (name !== originalName) {
        setMessage({ type: "success", text: "Entwurf automatisch gespeichert" });
      }
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [name, originalName]);

  /* Unsaved changes: beforeunload */
  useEffect(() => {
    const hasUnsaved = name !== originalName || passwordDirty;
    if (!hasUnsaved) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [name, originalName, passwordDirty]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setOriginalName(data.user.name || "");
        // Only overwrite name if there's no draft
        const draft = localStorage.getItem(LS_NAME);
        if (!draft) {
          setName(data.user.name || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Profil erfolgreich aktualisiert" });
        setOriginalName(name);
        localStorage.removeItem(LS_NAME);
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler beim Aktualisieren" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwörter stimmen nicht überein" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Passwort erfolgreich geändert" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordDirty(false);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler beim Ändern" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const discardChanges = () => {
    setName(originalName);
    localStorage.removeItem(LS_NAME);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordDirty(false);
    setShowUnsaved(false);
    setPendingTab(null);
    setMessage({ type: "success", text: "Änderungen verworfen" });
  };

  const hasUnsavedChanges = name !== originalName || passwordDirty;

  const handleTabClick = (tab: "profile" | "password" | "preferences") => {
    if (hasUnsavedChanges && tab !== activeTab) {
      setPendingTab(tab);
      setShowUnsaved(true);
      return;
    }
    setActiveTab(tab);
    localStorage.setItem(LS_TAB, tab);
  };

  const confirmTabSwitch = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      localStorage.setItem(LS_TAB, pendingTab);
    }
    setShowUnsaved(false);
    setPendingTab(null);
  };

  return (
    <div className="container-fluid">
      <PageHeader
        title="Einstellungen"
        description="Verwalten Sie Ihr Profil und Ihre Sicherheitseinstellungen."
      />

      {message && (
        <div className={`alert d-flex align-items-center gap-2 mb-3 ${message.type === "error" ? "alert-danger" : "alert-success"}`} role="alert">
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3" role="alert">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={18} />
            <span>Sie haben ungespeicherte Änderungen.</span>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={discardChanges}>
              <RotateCcw size={14} className="me-1" />
              Verwerfen
            </button>
            <button className="btn btn-sm btn-primary" onClick={updateProfile} disabled={loading}>
              <Save size={14} className="me-1" />
              Speichern
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-card">
        <div className="card-body-custom">
          <ul className="nav-tabs-custom">
            <li>
              <button
                type="button"
                className={`nav-tab-item d-flex align-items-center gap-2 ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => handleTabClick("profile")}
              >
                <User size={16} />
                Profil
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-tab-item d-flex align-items-center gap-2 ${activeTab === "password" ? "active" : ""}`}
                onClick={() => handleTabClick("password")}
              >
                <Lock size={16} />
                Passwort
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-tab-item d-flex align-items-center gap-2 ${activeTab === "preferences" ? "active" : ""}`}
                onClick={() => handleTabClick("preferences")}
              >
                <Globe size={16} />
                Präferenzen
              </button>
            </li>
          </ul>

          <div className="tab-content-custom">
            <div className={`tab-pane-custom ${activeTab === "profile" ? "active" : ""}`}>
              <div className="mb-3">
                <h5 className="fw-semibold">Profilinformationen</h5>
                <p className="text-muted mb-0">Aktualisieren Sie Ihre persönlichen Daten.</p>
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-Mail</label>
                <input id="email" className="form-control" value={profile?.email || ""} disabled readOnly />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ihr vollständiger Name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Rolle</label>
                <input id="role" className="form-control" value={profile?.role || ""} disabled readOnly />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={updateProfile} disabled={loading}>
                  {loading ? "Speichern..." : "Speichern"}
                </button>
                {name !== originalName && (
                  <button className="btn btn-outline-secondary" onClick={discardChanges}>
                    <RotateCcw size={14} className="me-1" />
                    Verwerfen
                  </button>
                )}
              </div>
            </div>

            <div className={`tab-pane-custom ${activeTab === "password" ? "active" : ""}`}>
              <div className="mb-3">
                <h5 className="fw-semibold">Passwort ändern</h5>
                <p className="text-muted mb-0">Ändern Sie Ihr Passwort für mehr Sicherheit.</p>
              </div>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">Aktuelles Passwort</label>
                <input
                  id="currentPassword"
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordDirty(true);
                  }}
                  placeholder="••••••••"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">Neues Passwort</label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordDirty(true);
                  }}
                  placeholder="Min. 8 Zeichen"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Passwort bestätigen</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordDirty(true);
                  }}
                  placeholder="••••••••"
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={changePassword} disabled={loading}>
                  {loading ? "Ändern..." : "Passwort ändern"}
                </button>
                {passwordDirty && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordDirty(false);
                    }}
                  >
                    <RotateCcw size={14} className="me-1" />
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>

            <div className={`tab-pane-custom ${activeTab === "preferences" ? "active" : ""}`}>
              <div className="mb-3">
                <h5 className="fw-semibold">Präferenzen</h5>
                <p className="text-muted mb-0">Sprache und Regionaleinstellungen.</p>
              </div>
              <div className="mb-3">
                <label className="form-label">Sprache</label>
                <p className="text-muted mb-0">Deutsch (vorerst festgelegt)</p>
              </div>
              <div className="mb-3">
                <label className="form-label">Zeitzone</label>
                <p className="text-muted mb-0">Europe/Berlin (vorerst festgelegt)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsaved && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1060, background: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-4 shadow p-4" style={{ maxWidth: "400px", width: "90%" }}>
            <h5 className="fw-bold mb-2">Ungespeicherte Änderungen</h5>
            <p className="text-muted mb-3">
              Sie haben Änderungen vorgenommen, die noch nicht gespeichert sind. Wenn Sie fortfahren, gehen diese Änderungen verloren.
            </p>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" onClick={() => setShowUnsaved(false)}>
                Abbrechen
              </button>
              <button className="btn btn-danger" onClick={discardChanges}>
                Verwerfen
              </button>
              <button className="btn btn-primary" onClick={confirmTabSwitch}>
                Speichern &amp; Weiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
