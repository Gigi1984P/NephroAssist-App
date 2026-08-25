import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Calendar, User, Stethoscope, Building2, ClipboardList, Clock, Phone, Mail } from "lucide-react";

interface ClinicPatientPageProps {
  params: Promise<{ id: string }>;
}

function calcAge(dateOfBirth: Date | string | null): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const CASE_STATUS_LABELS: Record<string, string> = {
  REFERRAL: "Überweisung",
  INTAKE: "Aufnahme",
  EVALUATION: "Evaluation",
  READY_FOR_REVIEW: "Bereit zur Prüfung",
  UNDER_REVIEW: "In Prüfung",
  DEFERRED: "Zurückgestellt",
  APPROVED: "Freigegeben",
  WAITLISTED: "Auf Warteliste",
  INACTIVE: "Inaktiv",
  TRANSPLANTED: "Transplantiert",
  CLOSED: "Abgeschlossen",
};

const CASE_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  REFERRAL: { bg: "#e2e8f0", text: "#475569" },
  INTAKE: { bg: "#dbeafe", text: "#1e40af" },
  EVALUATION: { bg: "#fef3c7", text: "#92400e" },
  READY_FOR_REVIEW: { bg: "#dcfce7", text: "#166534" },
  UNDER_REVIEW: { bg: "#dbeafe", text: "#1e40af" },
  DEFERRED: { bg: "#fee2e2", text: "#991b1b" },
  APPROVED: { bg: "#dcfce7", text: "#166534" },
  WAITLISTED: { bg: "#dcfce7", text: "#166534" },
  INACTIVE: { bg: "#e2e8f0", text: "#475569" },
  TRANSPLANTED: { bg: "#dcfce7", text: "#166534" },
  CLOSED: { bg: "#e2e8f0", text: "#475569" },
};

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  KIDNEY: "Niere",
  LIVER: "Leber",
  HEART: "Herz",
  LUNG: "Lunge",
  OTHER: "Sonstige",
};

export default async function ClinicPatientPage({ params }: ClinicPatientPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const userRole = session.user.role;
  const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(userRole);
  if (!isClinic) redirect(`/dashboard/patients/${id}`);

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      Organization: { select: { name: true } },
      cases: {
        include: {
          program: { select: { name: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!patient) notFound();

  // Track: Patient wurde aufgerufen
  await prisma.patient.update({ where: { id }, data: { updatedAt: new Date() } });

  const latestCase = patient.cases[0] || null;

  // Coordinator laden (falls vorhanden)
  let coordinatorName = "—";
  if (latestCase?.coordinatorId) {
    try {
      const coord = await prisma.user.findUnique({
        where: { id: latestCase.coordinatorId },
        select: { name: true },
      });
      if (coord?.name) coordinatorName = coord.name;
    } catch {
      coordinatorName = "—";
    }
  }

  const age = calcAge(patient.dateOfBirth);
  const statusColor = latestCase ? CASE_STATUS_COLORS[latestCase.status] || { bg: "#e2e8f0", text: "#475569" } : { bg: "#e2e8f0", text: "#475569" };
  const waitlistStatus = latestCase?.status === "WAITLISTED"
    ? "Auf Warteliste"
    : latestCase?.waitlistedDate
      ? `Eingetragen am ${new Date(latestCase.waitlistedDate).toLocaleDateString("de-DE")}`
      : "Nicht eingetragen";

  const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");

  return (
    <div>
      <PageHeader
        title="Patient & Fallstatus"
        description={`${patient.firstName} ${patient.lastName}`}
        action={
          <Link href="/dashboard/patients" className="btn-custom btn-outline-custom">
            <ArrowLeft size={16} /> Zurück
          </Link>
        }
      />

      {/* Haupt-Info-Karte */}
      <div className="dashboard-card mb-4">
        <div className="card-body-custom">
          {/* Header mit Avatar */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="d-flex align-items-center justify-content-center fw-bold text-white"
              style={{ width: 64, height: 64, borderRadius: "50%", background: "#3b82f6", fontSize: "1.4rem" }}
            >
              {initials}
            </div>
            <div>
              <h2 className="h4 fw-bold mb-1">{patient.firstName} {patient.lastName}</h2>
              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                <span className="d-inline-flex align-items-center gap-1"><Mail size={14} /> {patient.email || patient.user?.email || "—"}</span>
                <span className="mx-2">·</span>
                <span className="d-inline-flex align-items-center gap-1"><Phone size={14} /> {patient.phone || "—"}</span>
              </div>
            </div>
          </div>

          {/* Daten-Gitter */}
          <div className="row g-3">
            {/* Geburtsdatum / Alter */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Calendar size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Geburtsdatum / Alter</div>
                  <div className="fw-medium">
                    {patient.dateOfBirth
                      ? `${new Date(patient.dateOfBirth).toLocaleDateString("de-DE")} (${age} Jahre)`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Patienten-ID */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <User size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Patienten-ID</div>
                  <div className="fw-medium" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{patient.id.slice(0, 8)}…</div>
                </div>
              </div>
            </div>

            {/* Fall-ID */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <ClipboardList size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Fall-ID</div>
                  <div className="fw-medium" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                    {latestCase ? `${latestCase.id.slice(0, 8)}…` : "Kein Fall"}
                  </div>
                </div>
              </div>
            </div>

            {/* Dialysezentrum */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Building2 size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Dialysezentrum</div>
                  <div className="fw-medium">{patient.Organization?.name || "—"}</div>
                </div>
              </div>
            </div>

            {/* zuständiger Coordinator */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Stethoscope size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">zuständiger Coordinator</div>
                  <div className="fw-medium">{coordinatorName}</div>
                </div>
              </div>
            </div>

            {/* Transplantationsart */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Stethoscope size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Transplantationsart</div>
                  <div className="fw-medium">
                    {latestCase?.program?.type ? PROGRAM_TYPE_LABELS[latestCase.program.type] || latestCase.program.type : "—"}
                    {latestCase?.program?.name ? ` (${latestCase.program.name})` : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* aktueller Case-Status */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <ClipboardList size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">aktueller Case-Status</div>
                  {latestCase ? (
                    <span
                      className="badge"
                      style={{
                        background: statusColor.bg,
                        color: statusColor.text,
                        border: `1px solid ${statusColor.bg}`,
                        fontSize: "0.85rem",
                        padding: "0.35rem 0.6rem",
                      }}
                    >
                      {CASE_STATUS_LABELS[latestCase.status] || latestCase.status}
                    </span>
                  ) : (
                    <div className="fw-medium">—</div>
                  )}
                </div>
              </div>
            </div>

            {/* Wartelistenstatus */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Clock size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Wartelistenstatus</div>
                  <div className="fw-medium">{waitlistStatus}</div>
                </div>
              </div>
            </div>

            {/* Fall-Erstelldatum */}
            <div className="col-md-6 col-lg-4">
              <div className="d-flex align-items-start gap-2">
                <Calendar size={18} style={{ color: "#64748b", marginTop: 2 }} />
                <div>
                  <div className="text-muted small">Fall erstellt</div>
                  <div className="fw-medium">
                    {latestCase ? new Date(latestCase.createdAt).toLocaleDateString("de-DE") : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Hausarzt */}
            {patient.generalPractitionerName && (
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-2">
                  <Stethoscope size={18} style={{ color: "#64748b", marginTop: 2 }} />
                  <div>
                    <div className="text-muted small">Hausarzt</div>
                    <div className="fw-medium">{patient.generalPractitionerName}</div>
                    {patient.generalPractitionerCity && (
                      <div className="small text-muted">{patient.generalPractitionerCity}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fall-Historie (Timeline) */}
      {latestCase && (
        <div className="dashboard-card">
          <div className="card-header-custom">
            <span className="fw-semibold">Fall-Historie</span>
          </div>
          <div className="card-body-custom">
            <div className="row g-3">
              {latestCase.referralDate && (
                <div className="col-md-4">
                  <div className="text-muted small">Überweisungsdatum</div>
                  <div className="fw-medium">{new Date(latestCase.referralDate).toLocaleDateString("de-DE")}</div>
                </div>
              )}
              {latestCase.intakeDate && (
                <div className="col-md-4">
                  <div className="text-muted small">Aufnahmedatum</div>
                  <div className="fw-medium">{new Date(latestCase.intakeDate).toLocaleDateString("de-DE")}</div>
                </div>
              )}
              {latestCase.readyForReviewDate && (
                <div className="col-md-4">
                  <div className="text-muted small">Bereit zur Prüfung</div>
                  <div className="fw-medium">{new Date(latestCase.readyForReviewDate).toLocaleDateString("de-DE")}</div>
                </div>
              )}
              {latestCase.boardDecisionDate && (
                <div className="col-md-4">
                  <div className="text-muted small">Board-Entscheidung</div>
                  <div className="fw-medium">{new Date(latestCase.boardDecisionDate).toLocaleDateString("de-DE")}</div>
                </div>
              )}
              {latestCase.waitlistedDate && (
                <div className="col-md-4">
                  <div className="text-muted small">Wartelisteneintrag</div>
                  <div className="fw-medium">{new Date(latestCase.waitlistedDate).toLocaleDateString("de-DE")}</div>
                </div>
              )}
              {latestCase.closedDate && (
                <div className="col-md-4">
                  <div className="text-muted small">Abschlussdatum</div>
                  <div className="fw-medium">{new Date(latestCase.closedDate).toLocaleDateString("de-DE")}</div>
                  {latestCase.closureReason && (
                    <div className="small text-muted">Grund: {latestCase.closureReason}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
