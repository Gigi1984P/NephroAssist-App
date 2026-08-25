import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllowedPatientIds } from "@/lib/permissions";
import {
  Users,
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

  const patientCount = await prisma.patient.count({ where: patientFilter });

  const recentTasks = await prisma.task.findMany({
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
  });

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
      </div>

      {/* Content Grid */}
      <div className="row g-3">
        {isPatientOrCaregiver && (
          <div className="col-lg-6">
            <div className="dashboard-card">
              <div className="card-header-custom">
                <span className="fw-semibold">Letzte Untersuchungen</span>
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
