"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Plus, Calendar as CalendarIcon, Search } from "lucide-react";

interface Appointment {
  id: string;
  type: string;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  patient?: {
    firstName: string;
    lastName: string;
  } | null;
  status: string;
}

const PAGE_SIZE = 10;

export default function CalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/appointments", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((apt) => {
      const text = `${apt.type} ${apt.patient?.firstName || ""} ${apt.patient?.lastName || ""} ${apt.location || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [appointments, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageAppointments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const statusBadgeClass = (status: string) => {
    if (status === "CONFIRMED") return "badge-custom bg-success-subtle text-success";
    if (status === "PLANNED") return "badge-custom bg-primary-subtle text-primary";
    return "badge-custom bg-danger-subtle text-danger";
  };

  const statusLabel = (status: string) => {
    if (status === "CONFIRMED") return "Bestätigt";
    if (status === "PLANNED") return "Geplant";
    return "Storniert";
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container-fluid">
      <PageHeader
        title="Kalender"
        description="Alle Termine im Überblick"
        action={
          <button className="btn btn-primary d-flex align-items-center gap-2">
            <Plus size={16} />
            Neuer Termin
          </button>
        }
      />

      <div className="dashboard-card">
        <div className="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="search-bar">
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Termine suchen..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <span className="text-muted small">{filtered.length} Termine</span>
        </div>

        <div className="card-body-custom">
          {loading ? (
            <div className="table-responsive">
              <table className="table-custom table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Typ</th>
                    <th style={{ width: "25%" }}>Patient</th>
                    <th style={{ width: "25%" }}>Datum</th>
                    <th style={{ width: "10%" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className="skeleton" style={{ height: 16, width: "80%" }} /></td>
                      <td><div className="skeleton" style={{ height: 16, width: "70%" }} /></td>
                      <td><div className="skeleton" style={{ height: 16, width: "60%" }} /></td>
                      <td><div className="skeleton" style={{ height: 16, width: 60 }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CalendarIcon size={28} />
              </div>
              <div className="empty-state-title">
                {search ? "Keine Treffer" : "Keine Termine gefunden"}
              </div>
              <div className="empty-state-desc">
                {search
                  ? "Passen Sie Ihre Suche an."
                  : "Erstellen Sie Ihren ersten Termin."}
              </div>
              <button className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={16} />
                Neuer Termin
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table-custom table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "40%" }}>Typ</th>
                      <th style={{ width: "25%" }}>Patient</th>
                      <th style={{ width: "25%" }}>Datum</th>
                      <th style={{ width: "10%" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageAppointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-sm avatar-blue">
                              <CalendarIcon size={16} />
                            </div>
                            <div>
                              <div className="fw-medium">{apt.type}</div>
                              {apt.location && (
                                <div className="small text-muted">{apt.location}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {apt.patient ? (
                            <span>{apt.patient.firstName} {apt.patient.lastName}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-muted small">{formatDate(apt.startTime)}</td>
                        <td>
                          <span className={statusBadgeClass(apt.status)}>
                            {statusLabel(apt.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav aria-label="Seiten" className="mt-3 d-flex justify-content-end">
                  <ul className="pagination-custom pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Zurück
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p)}>
                          {p}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Weiter
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
