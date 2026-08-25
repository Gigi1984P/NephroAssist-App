"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ChevronLeft, ChevronRight, User, Phone, Mail } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentStatus: string;
  ampelColor: "green" | "yellow" | "red";
  caseCount: number;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [consentFilter, setConsentFilter] = useState("ALL");
  const [ampelFilter, setAmpelFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients/overview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
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

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchTerm === "" ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConsent = consentFilter === "ALL" || patient.consentStatus === consentFilter;
    const matchesAmpel = ampelFilter === "ALL" || patient.ampelColor === ampelFilter;
    return matchesSearch && matchesConsent && matchesAmpel;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getAmpelStyle = (color: string) => {
    switch (color) {
      case "green":
        return { background: "#dcfce7", border: "#86efac", dot: "#10b981" };
      case "yellow":
        return { background: "#fef3c7", border: "#fde68a", dot: "#f59e0b" };
      case "red":
        return { background: "#fee2e2", border: "#fecaca", dot: "#ef4444" };
      default:
        return { background: "#f1f5f9", border: "#e2e8f0", dot: "#94a3b8" };
    }
  };

  const getConsentBadgeClass = (status: string) => {
    switch (status) {
      case "GRANTED":
        return "badge-green";
      case "PENDING":
        return "badge-yellow";
      case "DENIED":
        return "badge-red";
      default:
        return "badge-outline";
    }
  };

  const getConsentLabel = (status: string) => {
    switch (status) {
      case "GRANTED":
        return "Einwilligt";
      case "PENDING":
        return "Ausstehend";
      case "DENIED":
        return "Abgelehnt";
      default:
        return status;
    }
  };

  return (
    <div>
      <PageHeader
        title="Patienten"
        description="Übersicht aller Patienten mit Ampel-Status"
        action={
          <button className="btn-custom btn-primary-custom">
            <Plus size={16} /> Neuer Patient
          </button>
        }
      />

      {/* Filters */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <div className="search-bar">
                <Search size={16} className="search-bar-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name oder E-Mail suchen..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "#64748b" }}>Einwilligung</label>
              <select className="form-select" value={consentFilter} onChange={(e) => { setConsentFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">Alle</option>
                <option value="GRANTED">Einwilligt</option>
                <option value="PENDING">Ausstehend</option>
                <option value="DENIED">Abgelehnt</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "#64748b" }}>Ampel-Status</label>
              <select className="form-select" value={ampelFilter} onChange={(e) => { setAmpelFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">Alle</option>
                <option value="green">🟢 Grün</option>
                <option value="yellow">🟡 Gelb</option>
                <option value="red">🔴 Rot</option>
              </select>
            </div>
            <div className="col-md-2 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>{filteredPatients.length} Patienten</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card">
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><User size={24} /></div>
              <div className="empty-state-title">Keine Patienten gefunden</div>
              <div className="empty-state-desc">Passen Sie Ihre Filter an oder fügen Sie einen Patienten hinzu.</div>
            </div>
          ) : (
            <>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Kontakt</th>
                    <th>Einwilligung</th>
                    <th>Fälle</th>
                    <th>Ampel</th>
                    <th className="actions">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => {
                    const ampelStyle = getAmpelStyle(patient.ampelColor);
                    const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");
                    return (
                      <tr key={patient.id}>
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
                        <td>
                          <span className={`badge-custom ${getConsentBadgeClass(patient.consentStatus)}`}>{getConsentLabel(patient.consentStatus)}</span>
                        </td>
                        <td>{patient.caseCount}</td>
                        <td>
                          <div
                            className="d-flex align-items-center gap-2 px-2 py-1 rounded"
                            style={{
                              background: ampelStyle.background,
                              border: `1px solid ${ampelStyle.border}`,
                              width: "fit-content",
                            }}
                          >
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: ampelStyle.dot,
                                display: "inline-block",
                              }}
                            />
                            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                              {patient.ampelColor === "green" && "Gültig"}
                              {patient.ampelColor === "yellow" && "Bald fällig"}
                              {patient.ampelColor === "red" && "Abgelaufen"}
                            </span>
                          </div>
                        </td>
                        <td className="actions">
                          <Link href={`/dashboard/patients/${patient.id}`} className="btn-custom btn-outline-custom btn-sm-custom">
                            Details
                          </Link>
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
    </div>
  );
}
