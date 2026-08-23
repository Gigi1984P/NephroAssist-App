"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  consentStatus: string;
  cases: { id: string }[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadPatients = async () => {
    try {
      const res = await fetch("/api/patients");
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
    const fullName = `${patient.firstName} ${patient.lastName}`;
    const matchesSearch =
      searchTerm === "" ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || patient.consentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getConsentBadgeClass = (consentStatus: string) => {
    switch (consentStatus) {
      case "CONSENT_GRANTED":
        return "badge-green";
      case "CONSENT_PENDING":
        return "badge-yellow";
      default:
        return "badge-outline";
    }
  };

  const getConsentLabel = (consentStatus: string) => {
    switch (consentStatus) {
      case "CONSENT_GRANTED":
        return "Einverstanden";
      case "CONSENT_PENDING":
        return "Ausstehend";
      default:
        return consentStatus;
    }
  };

  return (
    <div>
      <PageHeader
        title="Patienten"
        description="Verwalten Sie alle Patienten im System"
        action={
          <button className="btn-custom btn-primary-custom">
            <Plus size={16} />
            Neuer Patient
          </button>
        }
      />

      {/* Filters */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="search-bar">
                <Search size={16} className="search-bar-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Suchen nach Name oder E-Mail..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Alle Status</option>
                <option value="CONSENT_GRANTED">Einverstanden</option>
                <option value="CONSENT_PENDING">Ausstehend</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {filteredPatients.length} Patienten
              </span>
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
              <div className="empty-state-icon">
                <Users size={24} />
              </div>
              <div className="empty-state-title">Keine Patienten gefunden</div>
              <div className="empty-state-desc">
                {searchTerm || statusFilter !== "ALL"
                  ? "Versuchen Sie andere Filtereinstellungen"
                  : "Fügen Sie Ihren ersten Patienten hinzu"}
              </div>
              <button className="btn-custom btn-primary-custom">
                <Plus size={16} />
                Neuer Patient
              </button>
            </div>
          ) : (
            <>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>E-Mail</th>
                    <th>Einverständnis</th>
                    <th>Fälle</th>
                    <th className="actions">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="avatar-sm avatar-blue">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium">
                          {patient.firstName} {patient.lastName}
                        </span>
                      </td>
                      <td>{patient.email || "Keine E-Mail"}</td>
                      <td>
                        <span className={`badge-custom ${getConsentBadgeClass(patient.consentStatus)}`}>
                          {getConsentLabel(patient.consentStatus)}
                        </span>
                      </td>
                      <td>{patient.cases.length}</td>
                      <td className="actions">
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="btn-custom btn-outline-custom btn-sm-custom"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3 border-top">
                  <ul className="pagination-custom">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={14} />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
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
