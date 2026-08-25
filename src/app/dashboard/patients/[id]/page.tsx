import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getAmpelColor } from "@/lib/ampel";
import {
  Calendar, FileText, AlertTriangle, ArrowLeft, Phone, Mail, MapPin,
} from "lucide-react";

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!patient) notFound();

  const [documents, appointments, blockers, timelineEvents] = await Promise.all([
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

  // Ampel-Farbe des Patienten: schlimmste Farbe aller Requirements
  const requirements = await prisma.patientRequirement.findMany({
    where: { patientCase: { patientId: id } },
    include: { template: { select: { renewalLeadTime: true } } },
  });

  let patientAmpel: string = "green";
  for (const req of requirements) {
    const color = getAmpelColor({
      status: req.status,
      expiresAt: req.expiresAt,
      renewalLeadTime: req.template?.renewalLeadTime,
    });
    if (color === "red") { patientAmpel = "red"; break; }
    if (color === "yellow" && patientAmpel !== "red") patientAmpel = "yellow";
  }

  const upcomingAppointments = appointments.filter(
    (a: any) => new Date(a.startTime) > new Date()
  );

  const ampelConfig = {
    green: { bg: "#dcfce7", border: "#86efac", text: "#166534", label: "Alles ok" },
    yellow: { bg: "#fef3c7", border: "#fde68a", text: "#92400e", label: "Achtung" },
    red: { bg: "#fee2e2", border: "#fecaca", text: "#991b1b", label: "Handlung nötig" },
  };

  const ampel = ampelConfig[patientAmpel as keyof typeof ampelConfig];
  const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");

  return (
    <div>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        description="Patientenübersicht"
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
                    width: 60, height: 60, borderRadius: "50%", background: "#3b82f6", fontSize: "1.2rem",
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
              <div className="d-flex justify-content-md-end">
                <div
                  className="d-flex align-items-center gap-2 px-3 py-2 rounded"
                  style={{ background: ampel.bg, border: `1px solid ${ampel.border}` }}
                >
                  <div
                    style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: patientAmpel === "green" ? "#10b981" : patientAmpel === "yellow" ? "#f59e0b" : "#ef4444",
                    }}
                  />
                  <span className="fw-semibold" style={{ fontSize: "0.85rem", color: ampel.text }}>{ampel.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Blocker */}
        <div className="col-lg-7">
          <div className="dashboard-card mb-4">
            <div className="card-header-custom d-flex align-items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              <span className="fw-semibold">Aktive Blocker</span>
              <span className="badge-custom badge-outline">{blockers.length}</span>
            </div>
            <div className="card-body-custom">
              {blockers.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine aktiven Blocker.</div>
              ) : (
                blockers.map((blocker: any) => (
                  <div key={blocker.id} className="p-3 mb-2 rounded" style={{ background: "#fee2e2", border: "1px solid #fecaca" }}>
                    <div className="d-flex justify-content-between">
                      <div className="fw-medium" style={{ fontSize: "0.85rem", color: "#991b1b" }}>{blocker.type}</div>
                      <div style={{ fontSize: "0.75rem", color: "#b91c1c" }}>{new Date(blocker.createdAt).toLocaleDateString("de-DE")}</div>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#b91c1c" }}>{blocker.description}</div>
                    {blocker.requirement?.title && (
                      <div style={{ fontSize: "0.75rem", color: "#b91c1c" }}>Betrifft: {blocker.requirement.title}</div>
                    )}
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
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine Ereignisse.</div>
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

        {/* Sidebar */}
        <div className="col-lg-5">
          {/* Termine */}
          <div className="dashboard-card mb-4">
            <div className="card-header-custom">
              <span className="fw-semibold">Nächste Termine</span>
            </div>
            <div className="card-body-custom">
              {upcomingAppointments.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine Termine.</div>
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

          {/* Dokumente */}
          <div className="dashboard-card">
            <div className="card-header-custom d-flex justify-content-between">
              <span className="fw-semibold">Letzte Dokumente</span>
              <Link href="/dashboard/documents" className="text-decoration-none" style={{ fontSize: "0.8rem", color: "#2563eb" }}>Alle</Link>
            </div>
            <div className="card-body-custom">
              {documents.length === 0 ? (
                <div className="p-3 text-center text-muted" style={{ fontSize: "0.85rem" }}>Keine Dokumente.</div>
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
        </div>
      </div>
    </div>
  );
}
