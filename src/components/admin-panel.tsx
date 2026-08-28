"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  Plus, Trash2, ShieldCheck, Users, Building2, UserCog,
  Pencil, Power, PowerOff, Clock, Key, RefreshCw,
  ChevronLeft, ChevronRight, Search, Activity, Database,
  AlertTriangle, Eye, EyeOff, CheckSquare, ChevronDown,
  ChevronUp
} from "lucide-react";
import type { UserRole } from "@prisma/client";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  organizationId: string | null;
}

interface LoginHistoryItem {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  timestamp: string;
}

interface AdminPanelProps {
  users: User[];
  organizations: Organization[];
  roles: Role[];
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

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminPanel({ users: initialUsers, organizations, roles }: AdminPanelProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  // Such- und Filter-States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loginHistories, setLoginHistories] = useState<LoginHistoryItem[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);

  // Form States
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  // Create Form
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT" as UserRole,
    organizationId: "",
    roleId: "",
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "PATIENT" as UserRole,
  });

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Refresh users error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && u.isActive) ||
      (statusFilter === "INACTIVE" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // Bulk Aktionen
  const handleSelectAll = () => {
    if (selectedIds.size === pageItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageItems.map((u) => u.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDeactivate = async () => {
    if (!confirm(`${selectedIds.size} Benutzer deaktivieren?`)) return;
    for (const id of selectedIds) {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate" }),
      });
    }
    setSelectedIds(new Set());
    refreshUsers();
  };

  // Create
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erstellen fehlgeschlagen");
      }
      setSuccess("Benutzer erstellt");
      setNewUser({ name: "", email: "", password: "", role: "PATIENT", organizationId: "", roleId: "" });
      setShowCreateModal(false);
      refreshUsers();
    } catch (err: any) {
      setError(err.message || "Fehler beim Erstellen");
    } finally {
      setCreating(false);
    }
  };

  // Edit
  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name || "", email: user.email, role: user.role });
    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Aktualisieren");
      setSuccess("Benutzer aktualisiert");
      setShowEditModal(false);
      refreshUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Toggle
  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      refreshUsers();
    } catch (e) {
      console.error("Toggle active error:", e);
    }
  };

  // Delete
  const handleDelete = async (userId: string) => {
    if (!confirm("Benutzer wirklich löschen?")) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      refreshUsers();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  // Login History
  const openLoginHistory = async (userId: string) => {
    setSelectedUserId(userId);
    setShowLoginHistoryModal(true);
    setLoginHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/login-history`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLoginHistories(data.history || []);
      }
    } catch (e) {
      console.error("Login history error:", e);
    } finally {
      setLoginHistoryLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/reset-password`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.tempPassword) {
        setTempPassword(data.tempPassword);
      }
    } catch (e) {
      console.error("Reset password error:", e);
    }
  };

  const resetForm = () => {
    setNewUser({ name: "", email: "", password: "", role: "PATIENT", organizationId: "", roleId: "" });
    setEditForm({ name: "", email: "", role: "PATIENT" });
    setError("");
    setSuccess("");
    setTempPassword("");
    setShowPassword(false);
  };

  // Stats
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div>
      <PageHeader
        title="Admin-Panel"
        description="Benutzer- und Rollenverwaltung"
        action={
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
              onClick={() => setShowStatsModal(true)}
            >
              <Activity size={16} />
              Statistiken
            </button>
            <button
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
              onClick={() => { resetForm(); setShowCreateModal(true); }}
            >
              <Plus size={16} />
              Neuer Benutzer
            </button>
          </div>
        }
      />

      {/* Success / Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")} />
        </div>
      )}

      {/* Statistiken-Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 48, height: 48, background: "#eff6ff" }}>
              <Users size={22} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <div className="h4 fw-bold mb-0" style={{ color: "#1e293b" }}>{users.length}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>Benutzer gesamt</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 48, height: 48, background: "#f0fdf4" }}>
              <CheckSquare size={22} style={{ color: "#16a34a" }} />
            </div>
            <div>
              <div className="h4 fw-bold mb-0" style={{ color: "#1e293b" }}>{activeUsers}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>Aktiv</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 48, height: 48, background: "#fef2f2" }}>
              <AlertTriangle size={22} style={{ color: "#dc2626" }} />
            </div>
            <div>
              <div className="h4 fw-bold mb-0" style={{ color: "#1e293b" }}>{inactiveUsers}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>Deaktiviert</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 48, height: 48, background: "#faf5ff" }}>
              <ShieldCheck size={22} style={{ color: "#9333ea" }} />
            </div>
            <div>
              <div className="h4 fw-bold mb-0" style={{ color: "#1e293b" }}>{adminCount}</div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>Admins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="dashboard-card mb-3">
        <div className="card-body-custom">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <div className="search-bar">
                <Search size={16} className="text-muted" />
                <input
                  type="text"
                  className="form-control form-control-sm border-0 bg-transparent"
                  placeholder="Name oder E-Mail suchen..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                <option value="ALL">Alle Rollen</option>
                <option value="ADMIN">Administrator</option>
                <option value="COORDINATOR">Koordinator</option>
                <option value="PHYSICIAN">Arzt</option>
                <option value="NURSE">Pflegekraft</option>
                <option value="PATIENT">Patient</option>
                <option value="CAREGIVER">Angehöriger</option>
                <option value="DIALYSIS_STAFF">Dialysepersonal</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="ALL">Alle Status</option>
                <option value="ACTIVE">Aktiv</option>
                <option value="INACTIVE">Deaktiviert</option>
              </select>
            </div>
            <div className="col-md-2 text-md-end">
              {selectedIds.size > 0 && (
                <button className="btn btn-sm btn-outline-danger" onClick={handleBulkDeactivate}>
                  <PowerOff size={14} className="me-1" />
                  {selectedIds.size} deaktivieren
                </button>
              )}
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
          <span className="badge bg-secondary">{filtered.length}</span>
        </div>
        <div className="card-body-custom p-0">
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th style={{ width: "1%" }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={pageItems.length > 0 && pageItems.every((u) => selectedIds.has(u.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Rolle</th>
                  <th>Status</th>
                  <th>Zuletzt aktiv</th>
                  <th style={{ width: "1%" }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      Laden...
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <Users size={40} className="text-muted mb-2" />
                        <p>Keine Benutzer gefunden.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((user) => {
                    const roleStyle = ROLE_BADGES[user.role] || { bg: "#64748b", color: "#fff" };
                    return (
                      <tr key={user.id} className={!user.isActive ? "text-muted" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedIds.has(user.id)}
                            onChange={() => handleSelectOne(user.id)}
                          />
                        </td>
                        <td>
                          <span className={user.isActive ? "fw-medium" : "fw-medium text-decoration-line-through"}>
                            {user.name || "—"}
                          </span>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className="badge" style={{ background: roleStyle.bg, color: roleStyle.color, fontSize: "0.75rem" }}>
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </td>
                        <td>
                          {user.isActive ? (
                            <span className="badge bg-success" style={{ fontSize: "0.7rem" }}>Aktiv</span>
                          ) : (
                            <span className="badge bg-secondary" style={{ fontSize: "0.7rem" }}>Deaktiviert</span>
                          )}
                        </td>
                        <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          <Clock size={12} className="me-1 text-muted" />
                          {fmtDate(user.lastLoginAt)}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-link text-decoration-none p-1" onClick={() => openEdit(user)} title="Bearbeiten">
                              <Pencil size={15} />
                            </button>
                            <button className="btn btn-sm btn-link text-decoration-none p-1" onClick={() => { setSelectedUserId(user.id); setTempPassword(""); setShowResetPasswordModal(true); }} title="Passwort zurücksetzen">
                              <Key size={15} />
                            </button>
                            <button className="btn btn-sm btn-link text-decoration-none p-1" onClick={() => openLoginHistory(user.id)} title="Login-Historie">
                              <Clock size={15} />
                            </button>
                            <button
                              className={`btn btn-sm btn-link text-decoration-none p-1 ${user.isActive ? "text-warning" : "text-success"}`}
                              onClick={() => handleToggleActive(user)}
                              title={user.isActive ? "Deaktivieren" : "Aktivieren"}
                            >
                              {user.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                            </button>
                            <button className="btn btn-sm btn-link text-decoration-none p-1 text-danger" onClick={() => handleDelete(user.id)} title="Löschen">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > perPage && (
            <div className="pagination-custom">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeft size={14} />
              </button>
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                Seite {page} von {totalPages}
              </span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
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
                    <div key={role.id} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div>
                        <div className="fw-medium" style={{ fontSize: "0.9rem" }}>{role.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          {organizations.find((o) => o.id === role.organizationId)?.name || "Global"}
                        </div>
                      </div>
                      <span className="badge bg-light text-dark" style={{ fontSize: "0.7rem" }}>0 Benutzer</span>
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
                    <div key={org.id} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
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

      {/* ============ CREATE MODAL ============ */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Benutzer erstellen</h5>
                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Name</label>
                    <input type="text" className="form-control" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Max Mustermann" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">E-Mail *</label>
                    <input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="max@example.com" />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Passwort *</label>
                    <div className="input-group">
                      <input type={showPassword ? "text" : "password"} className="form-control" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Rolle</label>
                    <select className="form-select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}>
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
                  <select className="form-select" value={newUser.organizationId} onChange={(e) => setNewUser({ ...newUser, organizationId: e.target.value })}>
                    <option value="">Bitte wählen...</option>
                    {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
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

      {/* ============ EDIT MODAL ============ */}
      {showEditModal && editingUser && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Benutzer bearbeiten</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Name</label>
                    <input type="text" className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">E-Mail</label>
                    <input type="email" className="form-control" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Rolle</label>
                  <select className="form-select" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}>
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
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" onClick={handleEditUser} disabled={updating}>
                  {updating ? "Wird gespeichert..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ RESET PASSWORD MODAL ============ */}
      {showResetPasswordModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Passwort zurücksetzen</h5>
                <button className="btn-close" onClick={() => setShowResetPasswordModal(false)} />
              </div>
              <div className="modal-body">
                {tempPassword ? (
                  <div>
                    <div className="alert alert-success">Passwort wurde zurückgesetzt.</div>
                    <label className="form-label fw-medium">Temporäres Passwort</label>
                    <div className="input-group">
                      <input type="text" className="form-control" value={tempPassword} readOnly />
                      <button className="btn btn-outline-secondary" onClick={() => navigator.clipboard.writeText(tempPassword)}>
                        Kopieren
                      </button>
                    </div>
                    <small className="text-muted">Bitte notieren und sicher übermitteln.</small>
                  </div>
                ) : (
                  <p>Möchten Sie das Passwort für diesen Benutzer zurücksetzen? Ein temporäres Passwort wird generiert.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowResetPasswordModal(false)}>Schließen</button>
                {!tempPassword && (
                  <button className="btn btn-warning" onClick={handleResetPassword}>
                    <RefreshCw size={14} className="me-1" />
                    Passwort zurücksetzen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ LOGIN HISTORY MODAL ============ */}
      {showLoginHistoryModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login-Historie</h5>
                <button className="btn-close" onClick={() => setShowLoginHistoryModal(false)} />
              </div>
              <div className="modal-body">
                {loginHistoryLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <p className="text-muted mt-2">Laden...</p>
                  </div>
                ) : loginHistories.length === 0 ? (
                  <div className="text-center text-muted py-4">Keine Login-Historie verfügbar.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Zeitpunkt</th>
                          <th>IP-Adresse</th>
                          <th>Browser</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginHistories.map((h) => (
                          <tr key={h.id}>
                            <td style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>{fmtDate(h.timestamp)}</td>
                            <td style={{ fontSize: "0.85rem" }}>{h.ipAddress || "—"}</td>
                            <td style={{ fontSize: "0.8rem", maxWidth: 200 }} className="text-truncate">
                              {h.userAgent ? h.userAgent.split(" ").slice(0, 3).join(" ") : "—"}
                            </td>
                            <td>
                              {h.success ? (
                                <span className="badge bg-success" style={{ fontSize: "0.7rem" }}>Erfolgreich</span>
                              ) : (
                                <span className="badge bg-danger" style={{ fontSize: "0.7rem" }}>Fehlgeschlagen</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowLoginHistoryModal(false)}>Schließen</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ STATS MODAL ============ */}
      {showStatsModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">System-Statistiken</h5>
                <button className="btn-close" onClick={() => setShowStatsModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="text-center p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="h3 fw-bold text-primary">{users.length}</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>Benutzer gesamt</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="h3 fw-bold text-success">{activeUsers}</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>Aktive Benutzer</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="h3 fw-bold text-danger">{inactiveUsers}</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>Deaktivierte Benutzer</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="h3 fw-bold" style={{ color: "#9333ea" }}>{organizations.length}</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>Organisationen</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="h3 fw-bold" style={{ color: "#0891b2" }}>{roles.length}</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>Rollen</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="h3 fw-bold text-warning">{adminCount}</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>Administratoren</div>
                    </div>
                  </div>
                </div>
                <hr />
                <h6 className="fw-semibold mb-3">Rollen-Verteilung</h6>
                {Object.entries(
                  users.reduce((acc, u) => {
                    acc[u.role] = (acc[u.role] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([role, count]) => {
                  const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                  const label = ROLE_LABELS[role] || role;
                  return (
                    <div key={role} className="mb-2">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.85rem" }}>
                        <span>{label}</span>
                        <span className="text-muted">{count} ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: "0.5rem" }}>
                        <div className="progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowStatsModal(false)}>Schließen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
