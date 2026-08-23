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
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const userRole = user.role as "ADMIN" | "COORDINATOR" | "PHYSICIAN" | "NURSE" | "PATIENT" | "CAREGIVER" | "DIALYSIS_STAFF";
  const allowedPatientIds = await getAllowedPatientIds({ ...user, role: userRole });

  // Is Admin? → keine Filter
  const isAdmin = userRole === "ADMIN";
  const patientFilter = isAdmin ? {} : (allowedPatientIds && allowedPatientIds.length > 0 ? { id: { in: allowedPatientIds } } : { id: "" });
  const taskFilter = isAdmin ? {} : (allowedPatientIds && allowedPatientIds.length > 0 ? { patientId: { in: allowedPatientIds } } : { patientId: "" });
  const appointmentFilter = isAdmin ? {} : (allowedPatientIds && allowedPatientIds.length > 0 ? { patientId: { in: allowedPatientIds } } : { patientId: "" });

  const [patientCount, upcomingAppointments, pendingTasks, activeBlockers] = await Promise.all([
    prisma.patient.count({ where: patientFilter }),
    prisma.appointment.count({
      where: { startTime: { gte: new Date() }, status: "PLANNED", ...appointmentFilter },
    }),
    prisma.task.count({
      where: { status: "PENDING", ...taskFilter },
    }),
    prisma.blocker.count({ where: { status: "ACTIVE" } }),
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

  const isPatientOrCaregiver = userRole === "PATIENT" || userRole === "CAREGIVER";

  return (
    <div>
      <div className="mb-4">
        <h2 className="h3 fw-bold mb-1" style={{ color: "#1e293b" }}>
          Willkommen zurück{user.name ? `, ${user.name}` : ""}!
        </h2>
        <p className="text-muted mb-0">Hier ist ein Überblick über Ihre aktuellen Aktivitäten.</p>
      </div>

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
