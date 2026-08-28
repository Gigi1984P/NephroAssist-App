"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Plus, Trash2, ShieldCheck, Users, Building2, UserCog } from "lucide-react";
import type { UserRole } from "@prisma/client";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
}

interface AdminPanelProps {
  users: User[];
  organizations: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string; organizationId: string | null }>;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  COORDINATOR: "Koordinator",
  PHYSICIAN: "Arzt",
  NURSE: "Pflegekraft",
  PATIENT: "Patient",
  CAREGIVER: "Angehöriger",
  DIALYSIS_STAFF: "Dialysepersonal",
};

const ROLE_BADGES: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: "#dc2626", color: "#fff" },
  COORDINATOR: { bg: "#7c3aed", color: "#fff" },
  PHYSICIAN: { bg: "#2563eb", color: "#fff" },
  NURSE: { bg: "#0891b2", color: "#fff" },
  PATIENT: { bg: "#16a34a", color: "#fff" },
  CAREGIVER: { bg: "#ca8a04", color: "#fff" },
  DIALYSIS_STAFF: { bg: "#9333ea", color: "#fff" },
};

export function AdminPanel({ users, organizations, roles }: AdminPanelProps) {
  const router = useRouter();

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT" as UserRole,
    organizationId: "",
    roleId: "",
  });

  const handleCreateUser = async () => {
    if (!newUser.email.trim() || !newUser.password.trim()) {
      setError("E-Mail und Passwort sind Pflicht");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erstellen fehlgeschlagen");
      }

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "PATIENT",
        organizationId: "",
        roleId: "",
      });
      setShowCreateModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Fehler beim Erstellen");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_admin" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Toggle role error:", error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Benutzer wirklich löschen?")) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "PATIENT",
      organizationId: "",
      roleId: "",
    });
    setError("");
  };

  return (
    <div>
      <PageHeader
        title="Admin-Panel"
        description="Benutzer- und Rollenverwaltung"
        action={
          <button
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
            onClick={() => { resetForm(); setShowCreateModal(true); }}
          >
            <Plus size={16} />
            Neuer Benutzer
          </button>
        }
      />

      {/* Statistiken */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 48, height: 48, background: "#eff6ff" }}
            >
              <Users size={22} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <div className="h4 fw-bold mb-0" style={{ color: "#1e293b" }}>{users.length}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>Benutzer</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 48, height: 48, background: "#f0fdf4" }}
            >
              <Building2 size={22} style={{ color: "#16a34a" }} />
            </div>
            <div>
              <div className="h4 fw-bold mb-0" style={{ color: "#1e293b" }}>{organizations.length}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>Organisationen</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 48, height: 48, background: "#faf5ff" }}
            >
              <UserCog size={22} style={{ color: "#9333ea" }} />
            </div>
            <div>
              <div className="h4 fw-bold mb-0" style={{ color: "#1e293b" }}>{roles.length}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>Rollen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benutzer-Tabelle */}
      <div className="dashboard-card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2">
            <ShieldCheck size={18} /> Benutzer
          </span>
          <span className="badge bg-secondary">{users.length}</span>
        </div>
        <div className="card-body-custom p-0">
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Rolle</th>
                  <th style={{ width: "1%" }}>Admin</th>
                  <th style={{ width: "1%" }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleStyle = ROLE_BADGES[user.role] || { bg: "#64748b", color: "#fff" };
                  return (
                    <tr key={user.id}>
                      <td>
                        <span className="fw-medium">{user.name || "—"}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            fontSize: "0.75rem",
                          }}
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={user.role === "ADMIN"}
                            onChange={() => handleToggleRole(user.id)}
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-link text-decoration-none p-0"
                          onClick={() => handleDelete(user.id)}
                          title="Löschen"
                        >
                          <Trash2 size={16} className="text-danger" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rollen + Organisationen */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <UserCog size={18} /> Rollen
              </span>
              <span className="badge bg-secondary">{roles.length}</span>
            </div>
            <div className="card-body-custom">
              {roles.length === 0 ? (
                <div className="text-center text-muted py-3">Keine Rollen</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="d-flex align-items-center justify-content-between p-2 rounded"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                    >
                      <div>
                        <div className="fw-medium" style={{ fontSize: "0.9rem" }}>{role.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          {organizations.find((o) => o.id === role.organizationId)?.name || "Global"}
                        </div>
                      </div>
                      <span className="badge bg-light text-dark" style={{ fontSize: "0.7rem" }}>
                        0 Benutzer
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="dashboard-card">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <Building2 size={18} /> Organisationen
              </span>
              <span className="badge bg-secondary">{organizations.length}</span>
            </div>
            <div className="card-body-custom">
              {organizations.length === 0 ? (
                <div className="text-center text-muted py-3">Keine Organisationen</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="d-flex align-items-center justify-content-between p-2 rounded"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                    >
                      <span className="fw-medium" style={{ fontSize: "0.9rem" }}>{org.name}</span>
                      <span className="badge bg-success" style={{ fontSize: "0.7rem" }}>Aktiv</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Benutzer erstellen</h5>
                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">{error}</div>
                )}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">E-Mail *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="max@example.com"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Passwort *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Rolle</label>
                    <select
                      className="form-select"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="COORDINATOR">Koordinator</option>
                      <option value="PHYSICIAN">Arzt</option>
                      <option value="NURSE">Pflegekraft</option>
                      <option value="PATIENT">Patient</option>
                      <option value="CAREGIVER">Angehöriger</option>
                      <option value="DIALYSIS_STAFF">Dialysepersonal</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Organisation</label>
                  <select
                    className="form-select"
                    value={newUser.organizationId}
                    onChange={(e) => setNewUser({ ...newUser, organizationId: e.target.value })}
                  >
                    <option value="">Bitte wählen...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleCreateUser} disabled={creating}>
                  {creating ? "Wird erstellt..." : "Erstellen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
