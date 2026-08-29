"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/components/i18n-provider";
import { Calendar as CalendarIcon, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  id: string;
  type: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
  };
}

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/appointments", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = appointments
    .filter((apt) => {
      const matchesSearch =
        searchTerm === "" ||
        apt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${apt.patient.firstName} ${apt.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.location || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage));
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "badge-green";
      case "PLANNED":
        return "badge-yellow";
      case "CANCELLED":
        return "badge-red";
      default:
        return "badge-outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return t("status.confirmed", "Bestätigt");
      case "PLANNED":
        return t("status.planned", "Geplant");
      case "CANCELLED":
        return t("status.cancelled", "Storniert");
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <PageHeader
        title={t("sidebar.appointments", "Termine")}
        description={t("appointments.desc", "Alle anstehenden Termine im Überblick")}
        action={
          <button className="btn-custom btn-primary-custom">
            <Plus size={16} />
            {t("appointments.new", "Neuer Termin")}
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
                  placeholder={t("search.appointments", "Suchen nach Typ, Patient, Ort...")}
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
                <option value="ALL">{t("status.all", "Alle Status")}</option>
                <option value="CONFIRMED">{t("status.confirmed", "Bestätigt")}</option>
                <option value="PLANNED">{t("status.planned", "Geplant")}</option>
                <option value="CANCELLED">{t("status.cancelled", "Storniert")}</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {filteredAppointments.length} {t("appointments.count", "Termine")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card">
        <div className="card-body-custom p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">{t("loading.title", "Laden...")}</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CalendarIcon size={24} />
              </div>
              <div className="empty-state-title">{t("appointments.none", "Keine Termine gefunden")}</div>
              <div className="empty-state-desc">
                {searchTerm || statusFilter !== "ALL"
                  ? t("appointments.tryFilter", "Versuchen Sie andere Filtereinstellungen")
                  : t("appointments.createFirst", "Erstellen Sie Ihren ersten Termin")}
              </div>
              <button className="btn-custom btn-primary-custom">
                <Plus size={16} />
                {t("appointments.new", "Neuer Termin")}
              </button>
            </div>
          ) : (
            <>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>{t("common.date", "Datum")}</th>
                    <th>{t("common.type", "Typ")}</th>
                    <th>{t("common.patient", "Patient")}</th>
                    <th>{t("common.location", "Ort")}</th>
                    <th>{t("common.status", "Status")}</th>
                    <th className="actions">{t("nav.actions", "Aktionen")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{formatDate(appointment.startTime)}</td>
                      <td>
                        <span className="fw-medium">{appointment.type}</span>
                      </td>
                      <td>
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </td>
                      <td>{appointment.location || "—"}</td>
                      <td>
                        <span className={`badge-custom ${getStatusBadgeClass(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="actions">
                        <Link
                          href={`/dashboard/appointments/${appointment.id}`}
                          className="btn-custom btn-outline-custom btn-sm-custom"
                        >
                          {t("common.details", "Details")}
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
