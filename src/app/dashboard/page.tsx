import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllowedPatientIds } from "@/lib/permissions";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CheckCircle, ExternalLink, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const userRole = user.role as "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";
  const allowedPatientIds = await getAllowedPatientIds({ ...user, role: userRole });

  const isPatientOrCaregiver = userRole === "PATIENT" || userRole === "CAREGIVER";

  // Patienten-Dashboard: zeigt ProgressCard (kommt vom Client-Component)
  if (isPatientOrCaregiver) {
    return (
      <div>
        <div className="mb-4">
          <h2 className="h3 fw-bold mb-1" style={{ color: "#1e293b" }}>
            Willkommen zurück{user.name ? `, ${user.name}` : ""}!
          </h2>
          <p className="text-muted mb-0">Hier ist ein Überblick über Ihre aktuellen Aktivitäten.</p>
        </div>
        <PatientProgressCard />
      </div>
    );
  }

  // KLINIK-DASHBOARD
  const patientFilter = userRole === "ADMIN" || allowedPatientIds === null
    ? {}
    : allowedPatientIds.length > 0
      ? { id: { in: allowedPatientIds } }
      : { id: "" };

  // ALLE Patienten mit Cases/Requirements
  const patients = await prisma.patient.findMany({
    where: patientFilter,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      consentStatus: true,
      updatedAt: true,
      cases: {
        select: {
          id: true,
          requirements: {
            select: {
              id: true,
              status: true,
              title: true,
              template: {
                select: { name: true, category: true },
              },
            },
          },
        },
      },
    },
    orderBy: { lastName: "asc" },
    take: 100,
  });

  // Patienten mit allen abgeschlossenen Untersuchungen
  const completedPatients = patients
    .map((patient) => {
      const allRequirements = patient.cases.flatMap((c) => c.requirements);
      const totalCount = allRequirements.length;
      const completedCount = allRequirements.filter(
        (r) => r.status === "ACCEPTED" || r.status === "WAIVED" || r.status === "NOT_APPLICABLE"
      ).length;

      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        consentStatus: patient.consentStatus,
        totalRequirements: totalCount,
        completedRequirements: completedCount,
        allDone: totalCount > 0 && totalCount === completedCount,
      };
    })
    .filter((p) => p.allDone);

  // ZULETZT AUFGERUFENE Patienten (nach updatedAt, von Patienten-Detail-Aufruf)
  const recentlyViewed = [...patients]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone,
      updatedAt: p.updatedAt,
    }));

  const getConsentBadgeClass = (status: string) => {
    switch (status) {
      case "GRANTED": return "bg-success";
      case "PENDING": return "bg-warning text-dark";
      case "DENIED": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  const getConsentLabel = (status: string) => {
    switch (status) {
      case "GRANTED": return "Einwilligt";
      case "PENDING": return "Ausstehend";
      case "DENIED": return "Abgelehnt";
      default: return status;
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Klinik-Dashboard"
      />

      {/* Tabelle: Zuletzt aufgerufene Patienten */}
      <div className="dashboard-card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold d-flex align-items-center gap-2">
            <Clock size={16} />
            Zuletzt aufgerufene Patienten
          </span>
        </div>
        <div className="card-body-custom p-0">
          {recentlyViewed.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <div className="mb-2"><Clock size={24} className="text-muted" /></div>
              <div className="fw-medium">Keine kürzlich aufgerufenen Patienten</div>
              <div className="small">Patienten erscheinen hier, sobald Sie deren Detailseite besuchen.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Kontakt</th>
                    <th>Zuletzt aufgerufen</th>
                    <th className="text-end">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyViewed.map((patient) => {
                    const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");
                    return (
                      <tr key={patient.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: 36, height: 36, borderRadius: "50%", background: "#3b82f6", fontSize: "0.8rem", flexShrink: 0,
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
                            <div>{patient.email || "—"}</div>
                            <div className="text-muted">{patient.phone || "—"}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info text-dark">
                            <Clock size={10} className="me-1" />
                            {formatDateTime(patient.updatedAt)}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link
                            href={`/dashboard/patients/${patient.id}/clinic`}
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          >
                            <ExternalLink size={14} /> Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tabelle: Patienten mit allen abgeschlossenen Untersuchungen */}
      <div className="dashboard-card">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Patienten — Alle Untersuchungen abgeschlossen</span>
        </div>
        <div className="card-body-custom p-0">
          {completedPatients.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <div className="mb-2"><CheckCircle size={32} className="text-muted" /></div>
              <div className="fw-medium">Keine Patienten mit allen abgeschlossenen Untersuchungen</div>
              <div className="small">Sobald ein Patient alle Anforderungen erfüllt hat, erscheint er hier.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Kontakt</th>
                    <th>Einwilligung</th>
                    <th>Untersuchungen</th>
                    <th className="text-end">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {completedPatients.map((patient) => {
                    const initials = (patient.firstName?.charAt(0) || "") + (patient.lastName?.charAt(0) || "");
                    return (
                      <tr key={patient.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: 36, height: 36, borderRadius: "50%", background: "#3b82f6", fontSize: "0.8rem", flexShrink: 0,
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
                            <div>{patient.email || "—"}</div>
                            <div className="text-muted">{patient.phone || "—"}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getConsentBadgeClass(patient.consentStatus)}`}>{getConsentLabel(patient.consentStatus)}</span>
                        </td>
                        <td>
                          <span className="badge bg-success">
                            <CheckCircle size={12} className="me-1" />
                            {patient.completedRequirements} / {patient.totalRequirements}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link
                            href={`/dashboard/patients/${patient.id}/clinic`}
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          >
                            <ExternalLink size={14} /> Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Client-Component Import für Patienten-Dashboard */
import PatientProgressCard from "@/components/patient-progress-card";
