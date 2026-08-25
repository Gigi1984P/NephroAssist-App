import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllowedPatientIds } from "@/lib/permissions";
import Link from "next/link";
import {
  Calendar,
  FileText,
  CheckSquare,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import PatientProgressCard from "@/components/patient-progress-card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const userRole = user.role as "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";
  const allowedPatientIds = await getAllowedPatientIds({ ...user, role: userRole });

  const isAdmin = userRole === "ADMIN";
  const isPatientOrCaregiver = userRole === "PATIENT" || userRole === "CAREGIVER";

  const patientFilter = isAdmin ? {} : (allowedPatientIds && allowedPatientIds.length > 0 ? { id: { in: allowedPatientIds } } : { id: "" });
  const taskFilter = isAdmin ? {} : (allowedPatientIds && allowedPatientIds.length > 0 ? { patientId: { in: allowedPatientIds } } : { patientId: "" });
  const appointmentFilter = isAdmin ? {} : (allowedPatientIds && allowedPatientIds.length > 0 ? { patientId: { in: allowedPatientIds } } : { patientId: "" });

  const [patientCount, upcomingAppointments, pendingTasks, activeBlockers, totalRequirements, completedRequirements, expiringRequirements] = await Promise.all([
    prisma.patient.count({ where: patientFilter }),
    prisma.appointment.count({ where: { startTime: { gte: new Date() }, status: "PLANNED", ...appointmentFilter } }),
    prisma.task.count({ where: { status: "PENDING", ...taskFilter } }),
    prisma.blocker.count({ where: { status: "ACTIVE" } }),
    // Für Klinik: Gesamt-Requirements
    isPatientOrCaregiver ? Promise.resolve(0) : prisma.patientRequirement.count({ where: { patientCase: { patientId: isAdmin ? undefined : { in: allowedPatientIds || [] } } } }),
    isPatientOrCaregiver ? Promise.resolve(0) : prisma.patientRequirement.count({ where: { status: "ACCEPTED", patientCase: { patientId: isAdmin ? undefined : { in: allowedPatientIds || [] } } } }),
    // Bald ablaufende Requirements (innerhalb 60 Tage)
    isPatientOrCaregiver ? Promise.resolve(0) : prisma.patientRequirement.count({
      where: {
        expiresAt: { lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), gte: new Date() },
        patientCase: { patientId: isAdmin ? undefined : { in: allowedPatientIds || [] } },
      },
    }),
  ]);

  const [recentTasks, recentAppointments, recentDocuments] = await Promise.all([
    prisma.task.findMany({
      where: { status: "PENDING", ...taskFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        requirement: {
          include: {
            patientCase: {
              include: { patient: true },
            },
          },
        },
      },
    }),
    prisma.appointment.findMany({
      where: { startTime: { gte: new Date() }, status: "PLANNED", ...appointmentFilter },
      orderBy: { startTime: "asc" },
      take: 5,
      include: { patient: true },
    }),
    prisma.document.findMany({
      where: isAdmin ? {} : (allowedPatientIds && allowedPatientIds.length > 0 ? { patientId: { in: allowedPatientIds } } : { patientId: "" }),
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { patient: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="h3 fw-bold mb-1" style={{ color: "#1e293b" }}>
          Willkommen zurück{user.name ? `, ${user.name}` : ""}!
        </h2>
        <p className="text-muted mb-0">Hier ist ein Überblick über Ihre aktuellen Aktivitäten.</p>
      </div>

      {/* Patient Progress Card */}
      {isPatientOrCaregiver && (
        <PatientProgressCard />
      )}

      {/* Phase Cards für Klinik */}
      {!isPatientOrCaregiver && (
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon blue">
                  <Users size={22} />
                </div>
                <div>
                  <div className="stat-value">{patientCount}</div>
                  <div className="stat-label">Aktive Patienten</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon green">
                  <CheckSquare size={22} />
                </div>
                <div>
                  <div className="stat-value">{completedRequirements}</div>
                  <div className="stat-label">Freigegeben</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon orange">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="stat-value">{expiringRequirements}</div>
                  <div className="stat-label">Bald ablaufend</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="dashboard-card p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon red">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <div className="stat-value">{activeBlockers}</div>
                  <div className="stat-label">Aktive Blocker</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {!isPatientOrCaregiver && (
          <div className="col-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div>
                <div className="stat-value">{patientCount}</div>
                <div className="stat-label">Patienten</div>
              </div>
            </div>
          </div>
        )}
        <div className={`col-6 ${!isPatientOrCaregiver ? "col-lg-3" : "col-lg-4"}`}>
          <div className="stat-card">
            <div className="stat-icon green"><Calendar size={22} /></div>
            <div>
              <div className="stat-value">{upcomingAppointments}</div>
              <div className="stat-label">Termine</div>
            </div>
          </div>
        </div>

        <div className={`col-6 ${!isPatientOrCaregiver ? "col-lg-3" : "col-lg-4"}`}>
          <div className="stat-card">
            <div className="stat-icon orange"><CheckSquare size={22} /></div>
            <div>
              <div className="stat-value">{pendingTasks}</div>
              <div className="stat-label">Untersuchungen</div>
            </div>
          </div>
        </div>

        {!isPatientOrCaregiver && (
          <div className="col-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon red"><AlertTriangle size={22} /></div>
              <div>
                <div className="stat-value">{activeBlockers}</div>
                <div className="stat-label">Blocker</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="dashboard-card">
            <div className="card-header-custom">
              <span className="fw-semibold">Letzte Untersuchungen</span>
              <Link href="/dashboard/tasks" className="text-decoration-none" style={{ fontSize: "0.8rem", color: "#2563eb" }}>
                Alle anzeigen
              </Link>
            </div>
            <div className="card-body-custom">
              {recentTasks.length === 0 ? (
                <div className="text-muted text-center py-3" style={{ fontSize: "0.85rem" }}>
                  Keine Untersuchungen vorhanden
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="list-item-custom">
                    <div>
                      <div className="fw-medium" style={{ fontSize: "0.85rem" }}>{task.title}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {task.requirement?.patientCase?.patient?.firstName} {task.requirement?.patientCase?.patient?.lastName}
                      </div>
                      {task.dueDate && (
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Fällig: {new Date(task.dueDate).toLocaleDateString("de-DE")}
                        </div>
                      )}
                    </div>
                    <Link href={`/dashboard/tasks/${task.id}`} className="btn btn-outline-secondary btn-sm-custom" style={{ fontSize: "0.75rem" }}>
                      Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="dashboard-card">
            <div className="card-header-custom">
              <span className="fw-semibold">Letzte Termine</span>
              <Link href="/dashboard/appointments" className="text-decoration-none" style={{ fontSize: "0.8rem", color: "#2563eb" }}>
                Alle anzeigen
              </Link>
            </div>
            <div className="card-body-custom">
              {recentAppointments.length === 0 ? (
                <div className="text-muted text-center py-3" style={{ fontSize: "0.85rem" }}>
                  Keine Termine vorhanden
                </div>
              ) : (
                recentAppointments.map((apt) => (
                  <div key={apt.id} className="list-item-custom">
                    <div>
                      <div className="fw-medium" style={{ fontSize: "0.85rem" }}>{apt.type}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {apt.patient?.firstName} {apt.patient?.lastName}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {new Date(apt.startTime).toLocaleDateString("de-DE", {
                          weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <span className="badge-custom badge-outline" style={{ fontSize: "0.7rem" }}>{apt.status}</span>
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
