"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/components/i18n-provider";
import { Plus, Search, ChevronLeft, ChevronRight, User, Phone, Mail, Trash2, Edit3, AlertTriangle, Users } from "lucide-react";

interface Coordinator {
  id: string;
  name: string;
  email: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  caseStatus?: string | null;
  coordinatorId?: string | null;
}

export default function PatientsPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [modalType, setModalType] = useState<"" | "create" | "edit" | "delete" | "bulk-delete" | "bulk-update">("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Bulk-Update Felder
  const [bulkCaseStatus, setBulkCaseStatus] = useState("");
  const [bulkCoordinatorId, setBulkCoordinatorId] = useState("");
  const [bulkNote, setBulkNote] = useState("");

  // User-Account Form Felder
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formDateOfBirth, setFormDateOfBirth] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGpName, setFormGpName] = useState("");
  const [formGpEmail, setFormGpEmail] = useState("");
  const [formGpPhone, setFormGpPhone] = useState("");

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients/overview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
        setCoordinators(data.coordinators || []);
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // ─── Checkboxen ──────────────────────────────────────────────────────
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    const allSelected = paginatedPatients.length > 0 && paginatedPatients.every((p) => selectedIds.has(p.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPatients.map((p) => p.id)));
    }
  };

  // ─── CRUD ────────────────────────────────────────────────────────────
  const handleCreatePatient = async () => {
    if (!formFirstName.trim() || !formLastName.trim()) {
      setMessage({ type: "error", text: t("error.required", "Vor- und Nachname sind Pflicht") });
      return;
    }
    if (createUserAccount && !userEmail.trim()) {
      setMessage({ type: "error", text: t("error.required", "E-Mail für User-Account ist Pflicht") });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formFirstName.trim(),
          lastName: formLastName.trim(),
          dateOfBirth: formDateOfBirth || null,
          email: formEmail.trim() || null,
          phone: formPhone.trim() || null,
          gpName: formGpName.trim() || null,
          gpEmail: formGpEmail.trim() || null,
          gpPhone: formGpPhone.trim() || null,
          createUserAccount,
          userEmail: userEmail.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        let msg = t("success.created", "Patient angelegt");
        if (data.userCreated) {
          msg += ` + Login für ${data.userEmail}`;
          setGeneratedPassword(data.password);
        }
        if (data.assignedRequirements > 0) {
          msg += ` + ${data.assignedRequirements} Untersuchungen zugewiesen`;
        }
        setMessage({ type: "success", text: msg });
        closeModal();
        loadPatients();
      } else {
        setMessage({ type: "error", text: data.error || t("error.generic", "Fehler beim Anlegen") });
      }
    } catch {
      setMessage({ type: "error", text: t("error.network", "Netzwerkfehler") });
    } finally {
      setSaving(false);
    }
  };

  const handleEditPatient = async () => {
    if (!activePatient) return;
    if (!formFirstName.trim() || !formLastName.trim()) {
      setMessage({ type: "error", text: t("error.required", "Vor- und Nachname sind Pflicht") });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${activePatient.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formFirstName.trim(),
          lastName: formLastName.trim(),
          dateOfBirth: formDateOfBirth || null,
          email: formEmail.trim() || null,
          phone: formPhone.trim() || null,
          gpName: formGpName.trim() || null,
          gpEmail: formGpEmail.trim() || null,
          gpPhone: formGpPhone.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: t("success.updated", "Patient aktualisiert") });
        closeModal();
        loadPatients();
      } else {
        setMessage({ type: "error", text: data.error || t("error.generic", "Fehler beim Aktualisieren") });
      }
    } catch {
      setMessage({ type: "error", text: t("error.network", "Netzwerkfehler") });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ type: "success", text: t("success.deleted", "Patient gelöscht") });
        closeModal();
        loadPatients();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || t("error.generic", "Fehler beim Löschen") });
      }
    } catch {
      setMessage({ type: "error", text: t("error.network", "Netzwerkfehler") });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      let deleted = 0;
      let failed = 0;
      for (const id of Array.from(selectedIds)) {
        const res = await fetch(`/api/patients/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) deleted++;
        else failed++;
      }
      setSelectedIds(new Set());
      if (failed === 0) {
        setMessage({ type: "success", text: `${deleted} Patienten gelöscht` });
      } else {
        setMessage({ type: "error", text: `${deleted} gelöscht, ${failed} fehlgeschlagen` });
      }
      closeModal();
      loadPatients();
    } catch {
      setMessage({ type: "error", text: t("error.network", "Netzwerkfehler") });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/patients/bulk-update", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientIds: Array.from(selectedIds),
          caseStatus: bulkCaseStatus || undefined,
          coordinatorId: bulkCoordinatorId || undefined,
          note: bulkNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const { results } = data;
        setMessage({ type: "success", text: `${results.updated} Patienten aktualisiert` });
        setSelectedIds(new Set());
        closeModal();
        loadPatients();
      } else {
        setMessage({ type: "error", text: data.error || t("error.generic", "Fehler bei Massenbearbeitung") });
      }
    } catch {
      setMessage({ type: "error", text: t("error.network", "Netzwerkfehler") });
    } finally {
      setSaving(false);
    }
  };

  // ─── Modal-Helfer ──────────────────────────────────────────────────────
  const openCreate = () => {
    setActivePatient(null);
    resetForm();
    setModalType("create");
  };

  const openEdit = (patient: Patient) => {
    setActivePatient(patient);
    setFormFirstName(patient.firstName || "");
    setFormLastName(patient.lastName || "");
    setFormDateOfBirth(patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "");
    setFormEmail(patient.email || "");
    setFormPhone(patient.phone || "");
    setFormGpName("");
    setFormGpEmail("");
    setFormGpPhone("");
    setModalType("edit");
  };

  const openDelete = (patient: Patient) => {
    setActivePatient(patient);
    setModalType("delete");
  };

  const openBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setModalType("bulk-delete");
  };

  const openBulkUpdate = () => {
    if (selectedIds.size === 0) return;
    setBulkCaseStatus("");
    setBulkCoordinatorId("");
    setBulkNote("");
    setModalType("bulk-update");
  };

  const closeModal = () => {
    setModalType("");
    resetForm();
    setActivePatient(null);
  };

  const resetForm = () => {
    setFormFirstName("");
    setFormLastName("");
    setFormDateOfBirth("");
    setFormEmail("");
    setFormPhone("");
    setFormGpName("");
    setFormGpEmail("");
    setFormGpPhone("");
    setCreateUserAccount(false);
    setUserEmail("");
    setGeneratedPassword("");
  };

  // ─── Status-Badge ────────────────────────────────────────────────────
  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return <span className="badge bg-secondary">—</span>;
    const colors: Record<string, string> = {
      REFERRAL: "bg-info text-dark",
      EVALUATION: "bg-warning text-dark",
      APPROVED: "bg-success",
      READY_FOR_REVIEW: "bg-primary",
      LISTED: "bg-success",
      TRANSPLANTED: "bg-success",
      CLOSED: "bg-secondary",
      INACTIVE: "bg-secondary",
    };
    const labels: Record<string, string> = {
      REFERRAL: "Überweisung",
      EVALUATION: "Evaluierung",
      APPROVED: "Genehmigt",
      READY_FOR_REVIEW: "Zur Prüfung",
      LISTED: "Gelistet",
      TRANSPLANTED: "Transplantiert",
      CLOSED: "Geschlossen",
      INACTIVE: "Inaktiv",
    };
    return <span className={`badge ${colors[status] || "bg-secondary"}`}>{labels[status] || status}</span>;
  };

  // ─── Filter & Pagination ──────────────────────────────────────────────
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchTerm === "" ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const allSelected = paginatedPatients.length > 0 && paginatedPatients.every((p) => selectedIds.has(p.id));

  return (
    <div>
      <PageHeader
        title={t("nav.patients", "Patienten")}
        description={t("patient.title", "Patienten")}
        action={
          <button className="btn-custom btn-primary-custom" onClick={openCreate}>
            <Plus size={16} /> Neuer Patient
          </button>
        }
      />

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show mb-3`}>
          {message.text}
          <button className="btn-close" onClick={() => setMessage(null)} />
        </div>
      )}

      {/* Search */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <div className="search-bar">
                <Search size={16} className="search-bar-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("patient.searchPlaceholder", "Name oder E-Mail suchen...")}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {selectedIds.size > 0 ? `${selectedIds.size} ausgewählt | ` : ""}
                {filteredPatients.length} Patienten
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Massen-Aktionen */}
      {selectedIds.size > 0 && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mb-3" role="alert">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={16} />
            <span className="fw-medium">{selectedIds.size} Patienten ausgewählt</span>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={openBulkUpdate}>
              <Users size={14} className="me-1" />
              Massen bearbeiten
            </button>
            <button className="btn btn-danger btn-sm" onClick={openBulkDelete}>
              <Trash2 size={14} className="me-1" />
              Ausgewählte löschen
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dashboard-card">
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><User size={24} /></div>
              <div className="empty-state-title">Keine Patienten gefunden</div>
              <div className="empty-state-desc">Passen Sie Ihre Suche an oder fügen Sie einen Patienten hinzu.</div>
            </div>
          ) : (
            <>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={allSelected}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Patient</th>
                    <th>Kontakt</th>
                    <th>Status</th>
                    <th className="actions">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => {
                    const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");
                    const isSelected = selectedIds.has(patient.id);
                    return (
                      <tr key={patient.id} className={isSelected ? "table-active" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => toggleSelection(patient.id)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "#3b82f6",
                                fontSize: "0.8rem",
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="fw-medium">{patient.firstName} {patient.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.85rem" }}>
                            <div className="d-flex align-items-center gap-1">
                              <Mail size={12} className="text-muted" />
                              {patient.email || "—"}
                            </div>
                            <div className="d-flex align-items-center gap-1 mt-1">
                              <Phone size={12} className="text-muted" />
                              {patient.phone || "—"}
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(patient.caseStatus)}</td>
                        <td className="actions">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => openEdit(patient)}
                              title="Bearbeiten"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => openDelete(patient)}
                              title="Löschen"
                            >
                              <Trash2 size={14} />
                            </button>
                            <Link href={`/dashboard/patients/${patient.id}/clinic`} className="btn btn-outline-secondary btn-sm">
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3 border-top">
                  <ul className="pagination-custom">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft size={14} />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight size={14} />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Modale ─────────────────────────────────────────────────────── */}
      {modalType !== "" && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }} tabIndex={-1}>
          <div className={`modal-dialog ${modalType === "bulk-update" ? "" : "modal-lg"}`}>
            <div className="modal-content">
              {/* CREATE / EDIT */}
              {(modalType === "create" || modalType === "edit") && (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title">{modalType === "create" ? t("patient.createTitle", t("patient.createTitle", "Neuer Patient")) : t("patient.editTitle", "Patient bearbeiten")}</h5>
                    <button className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">Vorname *</label>
                        <input type="text" className="form-control" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} placeholder="Max" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">Nachname *</label>
                        <input type="text" className="form-control" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} placeholder="Mustermann" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">Geburtsdatum</label>
                        <input type="date" className="form-control" value={formDateOfBirth} onChange={(e) => setFormDateOfBirth(e.target.value)} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">E-Mail</label>
                        <input type="email" className="form-control" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="max@example.com" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">Telefon</label>
                        <input type="tel" className="form-control" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+49 123 456789" />
                      </div>
                    </div>
                    <hr className="my-3" />
                    <h6 className="fw-semibold mb-2">Hausarzt</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">Name</label>
                        <input type="text" className="form-control" value={formGpName} onChange={(e) => setFormGpName(e.target.value)} placeholder="Dr. Schmidt" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">E-Mail</label>
                        <input type="email" className="form-control" value={formGpEmail} onChange={(e) => setFormGpEmail(e.target.value)} placeholder="dr.schmidt@example.com" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">Telefon</label>
                        <input type="tel" className="form-control" value={formGpPhone} onChange={(e) => setFormGpPhone(e.target.value)} placeholder="+49 987 654321" />
                      </div>
                    </div>

                    {/* ─── User-Account (nur bei Neuanlage) ───────────────── */}
                    {modalType === "create" && (
                      <>
                        <hr className="my-3" />
                        <h6 className="fw-semibold mb-2">Login für Patienten-Portal</h6>
                        <div className="form-check mb-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="createUserAccount"
                            checked={createUserAccount}
                            onChange={(e) => setCreateUserAccount(e.target.checked)}
                          />
                          <label className="form-check-label fw-medium" htmlFor="createUserAccount">
                            User-Account erstellen
                          </label>
                        </div>
                        {createUserAccount && (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-medium">E-Mail für Login *</label>
                              <input
                                type="email"
                                className="form-control"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="patient@email.de"
                              />
                              <div className="form-text small">Das System generiert automatisch ein sicheres Passwort.</div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-medium">Passwort</label>
                              <input
                                type="text"
                                className="form-control"
                                value={generatedPassword || t("patient.passwordGenerated", "Wird automatisch generiert...")}
                                disabled
                                readOnly
                              />
                            </div>
                            {generatedPassword && (
                              <div className="col-12">
                                <div className="alert alert-success py-2">
                                  <div className="fw-medium">✅ User-Account erstellt!</div>
                                  <div className="small">Login: {userEmail}</div>
                                  <div className="small">Passwort: <strong>{generatedPassword}</strong></div>
                                  <div className="small text-muted mt-1">
                                    E-Mail mit Zugangsdaten wurde an {userEmail} gesendet.
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={modalType === "create" ? handleCreatePatient : handleEditPatient} disabled={saving}>
                      {saving ? t("general.loading", "Wird gespeichert...") : modalType === "create" ? t("patient.createTitle", "Patient anlegen") : t("nav.save", "Speichern")}
                    </button>
                  </div>
                </>
              )}

              {/* DELETE Confirm */}
              {modalType === "delete" && activePatient && (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title text-danger">Patient löschen</h5>
                    <button className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <p className="mb-1 fw-medium">
                          Möchten Sie <strong>{activePatient.firstName} {activePatient.lastName}</strong> wirklich löschen?
                        </p>
                        <p className="text-muted small mb-0">
                          Alle zugehörigen Daten werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>Abbrechen</button>
                    <button className="btn btn-danger" onClick={() => handleDeletePatient(activePatient.id)} disabled={saving}>
                      {saving ? t("general.loading", "Wird gelöscht...") : t("patient.deleteTitle", "Patient löschen")}
                    </button>
                  </div>
                </>
              )}

              {/* BULK DELETE Confirm */}
              {modalType === "bulk-delete" && (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title text-danger">Massenlöschung</h5>
                    <button className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <p className="mb-1 fw-medium">
                          Möchten Sie <strong>{selectedIds.size} Patienten</strong> wirklich löschen?
                        </p>
                        <p className="text-muted small mb-0">
                          Alle zugehörigen Daten werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>Abbrechen</button>
                    <button className="btn btn-danger" onClick={handleBulkDelete} disabled={saving}>
                      {saving ? t("general.loading", "Wird gelöscht...") : `${selectedIds.size} Patienten löschen`}
                    </button>
                  </div>
                </>
              )}

              {/* BULK UPDATE */}
              {modalType === "bulk-update" && (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <Users size={18} className="me-2" />
                      {selectedIds.size} Patienten bearbeiten
                    </h5>
                    <button className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <p className="text-muted small mb-3">
                      Änderungen werden auf alle ausgewählten Patienten angewendet. Leere Felder werden ignoriert.
                    </p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Fall-Status</label>
                        <select
                          className="form-select"
                          value={bulkCaseStatus}
                          onChange={(e) => setBulkCaseStatus(e.target.value)}
                        >
                          <option value="">— Nicht ändern —</option>
                          <option value="REFERRAL">Überweisung</option>
                          <option value="EVALUATION">Evaluierung</option>
                          <option value="APPROVED">Genehmigt</option>
                          <option value="READY_FOR_REVIEW">Zur Prüfung</option>
                          <option value="LISTED">Gelistet</option>
                          <option value="TRANSPLANTED">Transplantiert</option>
                          <option value="CLOSED">Geschlossen</option>
                          <option value="INACTIVE">Inaktiv</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Koordinator zuweisen</label>
                        <select
                          className="form-select"
                          value={bulkCoordinatorId}
                          onChange={(e) => setBulkCoordinatorId(e.target.value)}
                        >
                          <option value="">— Nicht ändern —</option>
                          {coordinators.map((c) => (
                            <option key={c.id} value={c.id}>{c.name || c.email}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium">Notiz (wird als Timeline-Eintrag gespeichert)</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={bulkNote}
                          onChange={(e) => setBulkNote(e.target.value)}
                          placeholder={t("patient.notePlaceholder", "z.B. Wartezeit verkürzt, Priorität erhöht...")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={handleBulkUpdate} disabled={saving}>
                      {saving ? t("general.loading", "Wird gespeichert...") : `${selectedIds.size} Patienten aktualisieren`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
