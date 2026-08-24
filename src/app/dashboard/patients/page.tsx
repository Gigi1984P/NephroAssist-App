"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  Plus, Search, ChevronLeft, ChevronRight, Users,
  FileCheck, FileX, Eye, Phone, Mail, User,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  hasReport: boolean;
  documentCount: number;
  gpName: string | null;
  gpEmail: string | null;
  gpPhone: string | null;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
    const fullName = `${patient.firstName} ${patient.lastName}`;
    const search = searchTerm.toLowerCase();
    return (
      searchTerm === "" ||
      fullName.toLowerCase().includes(search) ||
      (patient.email || "").toLowerCase().includes(search) ||
      (patient.phone || "").toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <PageHeader
        title="Patienten"
        description="Übersicht aller Patienten"
        action={
          <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2">
            <Plus size={16} />
            Neuer Patient
          </button>
        }
      />

      {/* Suchleiste */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text"><Search size={16} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name, E-Mail oder Telefon suchen..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {filteredPatients.length} Patienten
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Patienten-Tabelle */}
      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="p-4 text-center text-muted">Laden...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-5">
              <Users size={40} className="text-muted mb-2" />
              <div className="text-muted">Keine Patienten gefunden</div>
            </div>
          ) : (
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Telefon</th>
                  <th>E-Mail</th>
                  <th>Arztbericht</th>
                  <th style={{ width: "1%" }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                          style={{
                            width: 36,
                            height: 36,
                            background: "#0d6efd",
                            fontSize: "0.8rem",
                          }}
                        >
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <div className="fw-semibold">{patient.firstName} {patient.lastName}</div>
                          {patient.gpName && (
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              Hausarzt: {patient.gpName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {patient.phone ? (
                        <div className="d-flex align-items-center gap-1">
                          <Phone size={14} className="text-muted" />
                          <span>{patient.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "0.85rem" }}>—</span>
                      )}
                    </td>
                    <td>
                      {patient.email ? (
                        <div className="d-flex align-items-center gap-1">
                          <Mail size={14} className="text-muted" />
                          <span>{patient.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "0.85rem" }}>—</span>
                      )}
                    </td>
                    <td>
                      {patient.hasReport ? (
                        <span className="badge bg-success d-inline-flex align-items-center gap-1">
                          <FileCheck size={12} />
                          Eingereicht
                          {patient.documentCount > 0 && (
                            <span className="ms-1">({patient.documentCount})</span>
                          )}
                        </span>
                      ) : (
                        <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
                          <FileX size={12} />
                          Offen
                        </span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                      >
                        <Eye size={14} />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center p-3 border-top">
            <ul className="pagination mb-0">
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
                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
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
      </div>
    </div>
  );
}
