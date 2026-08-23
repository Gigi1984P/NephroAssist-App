import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  const [patientCount, upcomingAppointments, pendingTasks, activeBlockers] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({ where: { startTime: { gte: new Date() }, status: "PLANNED" } }),
    prisma.task.count({ where: { status: "PENDING" } }),
    prisma.blocker.count({ where: { status: "ACTIVE" } }),
  ]);

  const [recentTasks, recentAppointments, recentDocuments] = await Promise.all([
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        requirement: {
          include: {
            patientCase: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
    }),
    prisma.appointment.findMany({
      orderBy: { startTime: "asc" },
      take: 5,
      include: {
        patient: true,
      },
    }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        patient: true,
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="h3 fw-bold mb-1" style={{ color: "#1e293b" }}>
          Willkommen zurück{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h2>
        <p className="text-muted mb-0">Hier ist ein Überblick über Ihre aktuellen Aktivitäten.</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Users size={22} />
            </div>
            <div>
              <div className="stat-value">{patientCount}</div>
              <div className="stat-label">Patienten</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon green">
              <Calendar size={22} />
            </div>
            <div>
              <div className="stat-value">{upcomingAppointments}</div>
              <div className="stat-label">Termine</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon orange">
              <CheckSquare size={22} />
            </div>
            <div>
              <div className="stat-value">{pendingTasks}</div>
              <div className="stat-label">Aufgaben</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="stat-value">{activeBlockers}</div>
              <div className="stat-label">Blocker</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="dashboard-card">
            <div className="card-header-custom">
              <span className="fw-semibold">Letzte Aufgaben</span>
              <Link
                href="/dashboard/tasks"
                className="text-decoration-none"
                style={{ fontSize: "0.8rem", color: "#2563eb" }}
              >
                Alle anzeigen
              </Link>
            </div>
            <div className="card-body-custom">
              {recentTasks.length === 0 ? (
                <div className="text-muted text-center py-3" style={{ fontSize: "0.85rem" }}>
                  Keine Aufgaben vorhanden
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="list-item-custom">
                    <div>
                      <div className="fw-medium" style={{ fontSize: "0.85rem" }}>
                        {task.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {task.requirement?.patientCase?.patient.firstName}{" "}
                        {task.requirement?.patientCase?.patient.lastName}
                      </div>
                      {task.dueDate && (
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Fällig: {new Date(task.dueDate).toLocaleDateString("de-DE")}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="btn btn-outline-secondary btn-sm-custom"
                      style={{ fontSize: "0.75rem" }}
                    >
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
              <Link
                href="/dashboard/appointments"
                className="text-decoration-none"
                style={{ fontSize: "0.8rem", color: "#2563eb" }}
              >
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
                      <div className="fw-medium" style={{ fontSize: "0.85rem" }}>
                        {apt.type}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {apt.patient.firstName} {apt.patient.lastName}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {new Date(apt.startTime).toLocaleDateString("de-DE", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <span
                      className="badge-custom badge-outline"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {apt.status}
                    </span>
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
