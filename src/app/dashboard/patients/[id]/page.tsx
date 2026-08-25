import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getAmpelColor, getAmpelLabel } from "@/lib/ampel";
import {
  Calendar, FileText, CheckSquare, AlertTriangle, Clock, ArrowLeft, Phone, Mail, MapPin,
} from "lucide-react";

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  // Separate Queries für bessere Typ-Sicherheit
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!patient) notFound();

  const [cases, documents, appointments, blockers, timelineEvents] = await Promise.all([
    prisma.patientCase.findMany({
      where: { patientId: id },
      include: {
        program: { select: { name: true } },
        requirements: {
          include: {
            template: { select: { renewalLeadTime: true } },
            tasks: { orderBy: { stepNumber: "asc" } },
          },
        },
      },
    }),
    prisma.document.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.appointment.findMany({
      where: { patientId: id },
      orderBy: { startTime: "asc" },
      take: 20,
    }),
    prisma.blocker.findMany({
      where: { patientCase: { patientId: id }, status: "ACTIVE" },
      include: { requirement: { select: { title: true } } },
    }),
    prisma.timelineEvent.findMany({
      where: { patientCase: { patientId: id } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const activeCase = cases[0];
  const requirements = activeCase?.requirements || [];
  const upcomingAppointments = appointments.filter(
    (a: any) => new Date(a.startTime) > new Date()
  );

  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    PENDING: { bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
    IN_PROGRESS: { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" },
    COMPLETED: { bg: "#dcfce7", border: "#86efac", text: "#166534" },
    EXPIRED: { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" },
    RENEWAL_REQUIRED: { bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
    ACCEPTED: { bg: "#dcfce7", border: "#86efac", text: "#166534" },
    BLOCKED: { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" },
    REJECTED: { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" },
  };

  const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");

  return (
    <div>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        description="Patientenübersicht mit Ampel, Anforderungen und Timeline"
        action={
          <Link href="/dashboard/patients" className="btn-custom btn-outline-custom">
            <ArrowLeft size={16} /> Zurück
          </Link>
        }
      />

      {/* Top Info Card */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center fw-bold text-white"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    fontSize: "1.2rem",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h3 className="h5 fw-bold mb-1">{patient.firstName} {patient.lastName}</h3>
                  <div className="d-flex flex-column gap-1" style={{ fontSize: "0.85rem" }}>
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <Mail size={14} /> {patient.email || patient.user?.email || "—"}
                    </div>
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <Phone size={14} /> {patient.phone || "—"}
                    </div>
                    {patient.generalPractitionerCity && (
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <MapPin size={14} /> {patient.generalPractitionerCity}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row g-2">
                <div className="col-6 col-lg-3">
                  <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
                    <div className="fw-bold" style={{ color: "#1e293b" }}>{upcomingAppointments.length}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Termine</div>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
                    <div className="fw-bold" style={{ color: "#1e293b" }}>{documents.length}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Dokumente</div>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
                    <div className="fw-bold" style={{ color: "#1e293b" }}>{requirements.length}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Anforderungen</div>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="text-center p-2 rounded" style={{ background: "#f8fafc" }}>
                    <div className="fw-bold" style={{ color: "#ef4444" }}>{blockers.length}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Blocker</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Anforderungen */}
        <div className="col-lg-7">
          <div className="dashboard-card">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Anforderungen</span>
              <span className="badge-custom badge-outline">{requirements.length}</span>
            </div>
            <div className="card-body-custom p-0">
              {requirements.length === 0 ? (
                <div className="p-4 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine Anforderungen.</div>
              ) : (
                <div className="d-flex flex-column">
                  {requirements.map((req: any) => {
                    const ampel = getAmpelColor({
                      status: req.status,
                      expiresAt: req.expiresAt,
                      renewalLeadTime: req.template?.renewalLeadTime,
                    });
                    const wfTasks = req.tasks?.filter((t: any) => t.isWorkflowStep) || [];
                    const completedSteps = wfTasks.filter((t: any) => t.status === "COMPLETED").length;
                    const percent = wfTasks.length > 0 ? Math.round((completedSteps / wfTasks.length) * 100) : 0;

                    return (
                      <div key={req.id} className="p-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>{req.title}</span>
                              <span
                                className="badge-custom"
                                style={{
                                  fontSize: "0.65rem",
                                  background: ampel === "green" ? "#dcfce7" : ampel === "yellow" ? "#fef3c7" : "#fee2e2",
                                  color: ampel === "green" ? "#166534" : ampel === "yellow" ? "#92400e" : "#991b1b",
                                  border: `1px solid ${ampel === "green" ? "#86efac" : ampel === "yellow" ? "#fde68a" : "#fecaca"}`,
                                }}
                              >
                                {getAmpelLabel(ampel)}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }} className="mt-1">
                              {req.status}
                              {req.expiresAt && (
                                <span> · Gültig bis {new Date(req.expiresAt).toLocaleDateString("de-DE")}</span>
                              )}
                            </div>
                          </div>
                          <Link href="/dashboard/tasks" className="btn-custom btn-outline-custom btn-sm-custom">Details</Link>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: "6px", borderRadius: "3px", background: "#e2e8f0" }}>
                            <div className="progress-bar" role="progressbar" style={{ width: `${percent}%`, background: percent === 100 ? "#10b981" : "#3b82f6", borderRadius: "3px" }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{completedSteps}/{wfTasks.length}</span>
                        </div>

                        <div className="mt-2 d-flex flex-wrap gap-1">
                          {req.tasks.map((task: any) => (
                            <span key={task.id} className="badge-custom" style={{
                              fontSize: "0.65rem",
                              background: statusColors[task.status]?.bg || "#f1f5f9",
                              color: statusColors[task.status]?.text || "#64748b",
                              border: `1px solid ${statusColors[task.status]?.border || "#e2e8f0"}`,
                            }}>
                              {task.stepNumber}. {task.stepName || task.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-5">
          {/* Termine */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom">
              <span className="fw-semibold">Nächste Termine</span>
            </div>
            <div className="card-body-custom">
              {upcomingAppointments.length === 0 ? (
                <div className="text-muted text-center py-2" style={{ fontSize: "0.85rem" }}>Keine Termine.</div>
              ) : (
                upcomingAppointments.slice(0, 5).map((apt: any) => (
                  <div key={apt.id} className="list-item-custom">
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={16} style={{ color: "#3b82f6" }} />
                      <div>
                        <div className="fw-medium" style={{ fontSize: "0.85rem" }}>{apt.type}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {new Date(apt.startTime).toLocaleString("de-DE", {
                            weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                          {apt.location && ` · ${apt.location}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Blocker */}
          {blockers.length > 0 && (
            <div className="dashboard-card mb-4">
              <div className="card-header-custom d-flex align-items-center gap-2">
                <AlertTriangle size={16} className="text-danger" />
                <span className="fw-semibold">Aktive Blocker</span>
              </div>
              <div className="card-body-custom">
                {blockers.map((blocker: any) => (
                  <div key={blocker.id} className="p-2 mb-2 rounded" style={{ background: "#fee2e2", border: "1px solid #fecaca" }}>
                    <div className="fw-medium" style={{ fontSize: "0.85rem", color: "#991b1b" }}>{blocker.type}</div>
                    <div style={{ fontSize: "0.8rem", color: "#b91c1c" }}>{blocker.description}</div>
                    {blocker.requirement?.title && (
                      <div style={{ fontSize: "0.75rem", color: "#b91c1c" }}>Betrifft: {blocker.requirement.title}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dokumente */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex justify-content-between">
              <span className="fw-semibold">Letzte Dokumente</span>
              <Link href="/dashboard/documents" className="text-decoration-none" style={{ fontSize: "0.8rem", color: "#2563eb" }}>Alle</Link>
            </div>
            <div className="card-body-custom">
              {documents.length === 0 ? (
                <div className="text-muted text-center py-2" style={{ fontSize: "0.85rem" }}>Keine Dokumente.</div>
              ) : (
                documents.slice(0, 5).map((doc: any) => (
                  <div key={doc.id} className="list-item-custom">
                    <div className="d-flex align-items-center gap-2">
                      <FileText size={16} style={{ color: "#8b5cf6" }} />
                      <div className="flex-grow-1">
                        <div className="fw-medium" style={{ fontSize: "0.85rem" }}>{doc.filename}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(doc.createdAt).toLocaleDateString("de-DE")}</div>
                      </div>
                      <span className="badge-custom" style={{
                        fontSize: "0.65rem",
                        background: doc.processingStatus === "ACCEPTED" ? "#dcfce7" : doc.processingStatus === "REJECTED" ? "#fee2e2" : "#fef3c7",
                        color: doc.processingStatus === "ACCEPTED" ? "#166534" : doc.processingStatus === "REJECTED" ? "#991b1b" : "#92400e",
                        border: `1px solid ${doc.processingStatus === "ACCEPTED" ? "#86efac" : doc.processingStatus === "REJECTED" ? "#fecaca" : "#fde68a"}`,
                      }}>
                        {doc.processingStatus === "ACCEPTED" ? "Akzeptiert" : doc.processingStatus === "REJECTED" ? "Abgelehnt" : "Prüfung"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="dashboard-card">
            <div className="card-header-custom">
              <span className="fw-semibold">Timeline</span>
            </div>
            <div className="card-body-custom">
              {timelineEvents.length === 0 ? (
                <div className="text-muted text-center py-2" style={{ fontSize: "0.85rem" }}>Keine Ereignisse.</div>
              ) : (
                timelineEvents.map((event: any) => (
                  <div key={event.id} className="d-flex gap-2 mb-2">
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", marginTop: "0.35rem", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.85rem" }}>{event.description}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(event.createdAt).toLocaleString("de-DE")}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
