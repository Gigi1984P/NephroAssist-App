"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { AlertCircle, User, Lock, Globe } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "preferences">("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name || "");
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

      <div className="dashboard-card">
        <div className="card-body-custom">
          <ul className="nav-tabs-custom">
            <li>
              <button
                type="button"
                className={`nav-tab-item d-flex align-items-center gap-2 ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={16} />
                Profil
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-tab-item d-flex align-items-center gap-2 ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <Lock size={16} />
                Passwort
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-tab-item d-flex align-items-center gap-2 ${activeTab === "preferences" ? "active" : ""}`}
                onClick={() => setActiveTab("preferences")}
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
                />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Rolle</label>
                <input id="role" className="form-control" value={profile?.role || ""} disabled readOnly />
              </div>
              <button className="btn btn-primary" onClick={updateProfile} disabled={loading}>
                {loading ? "Speichern..." : "Speichern"}
              </button>
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
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">Neues Passwort</label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Passwort bestätigen</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={changePassword} disabled={loading}>
                {loading ? "Ändern..." : "Passwort ändern"}
              </button>
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
    </div>
  );
}
