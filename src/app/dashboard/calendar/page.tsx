"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/components/i18n-provider";
import { Plus, ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin } from "lucide-react";

interface Appointment {
  id: string;
  type: string;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  patient?: { id: string; firstName: string; lastName: string } | null;
  status: string;
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
}

type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  // Form state
  const [formPatientId, setFormPatientId] = useState("");
  const [formType, setFormType] = useState("Transplantationsambulanz");
  const [formLocation, setFormLocation] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formTime, setFormTime] = useState("09:00");

  useEffect(() => {
    loadAppointments();
    loadPatients();
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

  const loadPatients = async () => {
    try {
      const res = await fetch("/api/patients/overview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = (data.patients || []).map((p: any) => ({ id: p.id, firstName: p.firstName, lastName: p.lastName }));
        setPatients(list);
        if (list.length > 0) setFormPatientId(list[0].id);
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const startTime = new Date(`${formDate}T${formTime}`).toISOString();
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: formPatientId, type: formType, location: formLocation, startTime }),
      });
      if (res.ok) {
        setShowCreate(false);
        setFormType("Transplantationsambulanz");
        setFormLocation("");
        loadAppointments();
      } else {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error || "Fehler beim Erstellen");
      }
    } catch {
      setCreateError("Netzwerkfehler");
    } finally {
      setCreating(false);
    }
  };

  /* ── Helpers ── */
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - ((firstDay.getDay() + 6) % 7));
    const days: Date[] = [];
    const end = new Date(lastDay);
    end.setDate(end.getDate() + ((7 - lastDay.getDay()) % 7));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(new Date(d));
    return days;
  };

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push(d); }
    return days;
  };

  const apptsForDay = (day: Date) => appointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    return aptDate.getDate() === day.getDate() && aptDate.getMonth() === day.getMonth() && aptDate.getFullYear() === day.getFullYear();
  });

  const statusColor = (status: string) => { if (status === "CONFIRMED") return "bg-success"; if (status === "PLANNED") return "bg-primary"; return "bg-secondary"; };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  const monthLabel = currentDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const weekLabel = (() => { const days = getWeekDays(currentDate); const s = days[0]; const e = days[6]; const same = s.getMonth() === e.getMonth(); return same ? `${s.getDate()}.–${e.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}` : `${s.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}.–${e.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}`; })();
  const dayLabel = currentDate.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const prev = () => { const d = new Date(currentDate); if (view === "month") d.setMonth(d.getMonth() - 1); else if (view === "week") d.setDate(d.getDate() - 7); else d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const next = () => { const d = new Date(currentDate); if (view === "month") d.setMonth(d.getMonth() + 1); else if (view === "week") d.setDate(d.getDate() + 7); else d.setDate(d.getDate() + 1); setCurrentDate(d); };
  const today = () => setCurrentDate(new Date());

  const renderMonth = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    return (
      <div>
        <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#e2e8f0" }}>
          {weekDays.map((wd) => <div key={wd} className="text-center fw-semibold small py-2 bg-white text-muted">{wd}</div>)}
          {days.map((day, i) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() && day.getFullYear() === new Date().getFullYear();
            const appts = apptsForDay(day);
            return (
              <div key={i} className="bg-white p-2 position-relative" style={{ minHeight: "100px", cursor: "pointer" }} onClick={() => setCurrentDate(new Date(day))}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className={`fw-medium ${!isCurrentMonth ? "text-muted" : ""} ${isToday ? "badge bg-primary" : ""}`} style={isToday ? { borderRadius: "50%", width: "26px", height: "26px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" } : {}}>{day.getDate()}</span>
                </div>
                <div className="d-flex flex-column gap-1">
                  {appts.slice(0, 3).map((apt) => (
                    <button key={apt.id} className={`btn btn-sm text-start py-0 px-1 border-0 ${statusColor(apt.status)} bg-opacity-25 text-dark`} style={{ fontSize: "0.7rem", lineHeight: "1.4" }} onClick={(e) => { e.stopPropagation(); setSelectedAppt(apt); }}>
                      {formatTime(apt.startTime)} {apt.type}
                    </button>
                  ))}
                  {appts.length > 3 && <span className="text-muted" style={{ fontSize: "0.7rem" }}>+{appts.length - 3} weitere</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeek = () => {
    const days = getWeekDays(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekDayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    return (
      <div>
        <div className="d-grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)", gap: "1px", background: "#e2e8f0" }}>
          <div className="bg-white" />
          {days.map((day, i) => (
            <div key={i} className={`text-center py-2 bg-white small ${day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() ? "text-primary fw-bold" : ""}`}>
              <div>{weekDayNames[i]}</div><div className="fw-medium">{day.getDate()}.</div>
            </div>
          ))}
          {hours.flatMap((hour) => [
            <div key={`h-${hour}`} className="bg-white d-flex align-items-center justify-content-end px-2" style={{ minHeight: "48px" }}>
              <span className="text-muted" style={{ fontSize: "0.7rem" }}>{`${hour.toString().padStart(2, "0")}:00`}</span>
            </div>,
            ...days.map((day, dIdx) => {
              const appts = apptsForDay(day).filter((apt) => new Date(apt.startTime).getHours() === hour);
              return (
                <div key={`d-${dIdx}-${hour}`} className="bg-white position-relative" style={{ minHeight: "48px", cursor: "pointer" }}>
                  {appts.map((apt) => (
                    <button key={apt.id} className={`btn btn-sm text-start py-0 px-1 border-0 w-100 ${statusColor(apt.status)} bg-opacity-25 text-dark`} style={{ fontSize: "0.7rem" }} onClick={() => setSelectedAppt(apt)}>
                      {formatTime(apt.startTime)} {apt.type}
                    </button>
                  ))}
                </div>
              );
            }),
          ])}
        </div>
      </div>
    );
  };

  const renderDay = () => {
    const appts = apptsForDay(currentDate).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return (
      <div className="bg-white rounded" style={{ border: "1px solid #e2e8f0" }}>
        <div className="p-3 border-bottom"><h5 className="fw-bold mb-0">{dayLabel}</h5></div>
        {appts.length === 0 ? (
          <div className="p-4 text-center text-muted"><CalendarDays size={32} className="mb-2 opacity-50" /><p className="mb-0">{t("calendar.noAppointments", "Keine Termine an diesem Tag")}</p></div>
        ) : (
          <div className="d-flex flex-column">
            {appts.map((apt) => (
              <button key={apt.id} className="btn text-start p-3 border-bottom w-100 d-flex align-items-center gap-3" style={{ borderRadius: 0 }} onClick={() => setSelectedAppt(apt)}>
                <div className={`rounded-circle flex-shrink-0 ${statusColor(apt.status)}`} style={{ width: "10px", height: "10px" }} />
                <div className="flex-grow-1">
                  <div className="fw-medium">{apt.type}</div>
                  <div className="text-muted small d-flex align-items-center gap-3">
                    <span className="d-flex align-items-center gap-1"><Clock size={12} /> {formatTime(apt.startTime)}</span>
                    {apt.location && <span className="d-flex align-items-center gap-1"><MapPin size={12} /> {apt.location}</span>}
                    {apt.patient && <span>{apt.patient.firstName} {apt.patient.lastName}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <PageHeader
        title={t("nav.calendar", "Kalender")}
        description={t("calendar.desc", "Alle Termine im Überblick")}
        action={
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
            <Plus size={16} />{t("appt.new", "Neuer Termin")}
          </button>
        }
      />

      {/* Create Modal */}
      {showCreate && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowCreate(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <form onSubmit={handleCreate}>
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">{t("appt.new", "Neuer Termin")}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreate(false)} />
                </div>
                <div className="modal-body">
                  {createError && <div className="alert alert-danger py-2 small">{createError}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-medium">{t("patient.fullName", "Patient")}</label>
                    <select className="form-select form-select-sm" value={formPatientId} onChange={(e) => setFormPatientId(e.target.value)} required>
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">{t("appt.type", "Typ")}</label>
                    <input type="text" className="form-control form-control-sm" value={formType} onChange={(e) => setFormType(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">{t("appt.location", "Ort")}</label>
                    <input type="text" className="form-control form-control-sm" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-medium">{t("common.date", "Datum")}</label>
                      <input type="date" className="form-control form-control-sm" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">{t("common.time", "Zeit")}</label>
                      <input type="time" className="form-control form-control-sm" value={formTime} onChange={(e) => setFormTime(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreate(false)}>{t("nav.cancel", "Abbrechen")}</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? t("general.loading", "Wird erstellt...") : t("nav.save", "Speichern")}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-card">
        {/* Toolbar */}
        <div className="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={prev}><ChevronLeft size={16} /></button>
            <span className="fw-semibold" style={{ minWidth: "200px", textAlign: "center" }}>
              {view === "month" ? monthLabel : view === "week" ? weekLabel : dayLabel}
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={next}><ChevronRight size={16} /></button>
            <button className="btn btn-sm btn-outline-secondary ms-2" onClick={today}>{t("calendar.today", "Heute")}</button>
          </div>
          <div className="btn-group btn-group-sm">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button key={v} data-testid={`calendar-view-${v}`} className={`btn ${view === v ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setView(v)}>
                {v === "month" ? t("calendar.month", "Monat") : v === "week" ? t("calendar.week", "Woche") : t("calendar.day", "Tag")}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body-custom">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /><p className="text-muted mt-2">{t("loading.title", "Laden...")}</p></div>
          ) : (
            view === "month" ? renderMonth() : view === "week" ? renderWeek() : renderDay()
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAppt && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedAppt(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">{selectedAppt.type}</h5>
                <button className="btn-close" onClick={() => setSelectedAppt(null)} />
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2"><Clock size={16} className="text-muted" /><span>{new Date(selectedAppt.startTime).toLocaleString("de-DE")}</span></div>
                  {selectedAppt.location && <div className="d-flex align-items-center gap-2"><MapPin size={16} className="text-muted" /><span>{selectedAppt.location}</span></div>}
                  {selectedAppt.patient && <div><span className="text-muted">Patient: </span>{selectedAppt.patient.firstName} {selectedAppt.patient.lastName}</div>}
                  <div><span className="text-muted">Status: </span>
                    <span className={`badge ${selectedAppt.status === "CONFIRMED" ? "bg-success" : selectedAppt.status === "PLANNED" ? "bg-primary" : "bg-secondary"}`}>
                      {selectedAppt.status === "CONFIRMED" ? t("appt.confirmed", "Bestätigt") : selectedAppt.status === "PLANNED" ? t("appt.planned", "Geplant") : t("appt.cancelled", "Storniert")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedAppt(null)}>{t("nav.close", "Schließen")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
