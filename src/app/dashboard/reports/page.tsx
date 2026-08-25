import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Users, Clock, CheckCircle, FileText, AlertCircle, Activity } from "lucide-react";

interface ReportData {
  totalPatients: number;
  completedCount: number;
  avgDaysToComplete: number;
  avgReqsPerPatient: number;
  avgDocsPerPatient: number;
  completedCases: number;
  openReqs: number;
}

async function loadReports(): Promise<ReportData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/reports`, {
    cache: "no-store",
    headers: { cookie: "" },
  });
  if (!res.ok) throw new Error("Fehler beim Laden");
  return res.json();
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userRole = session.user.role;
  const isClinic = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE"].includes(userRole);
  if (!isClinic) redirect("/dashboard");

  let data: ReportData;
  try {
    data = await loadReports();
  } catch {
    data = {
      totalPatients: 0,
      completedCount: 0,
      avgDaysToComplete: 0,
      avgReqsPerPatient: 0,
      avgDocsPerPatient: 0,
      completedCases: 0,
      openReqs: 0,
    };
  }

  const completionRate = data.totalPatients > 0 ? Math.round((data.completedCount / data.totalPatients) * 100) : 0;

  return (
    <div>
      <PageHeader title="Auswertungen" description="Kennzahlen und Statistiken der Klinik" />

      {/* Kennzahlen-Karten */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon blue"><Users size={22} /></div>
            <div>
              <div className="stat-value">{data.totalPatients}</div>
              <div className="stat-label">Patienten im System</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon green"><CheckCircle size={22} /></div>
            <div>
              <div className="stat-value">{data.completedCount}</div>
              <div className="stat-label">Alle Untersuchungen fertig</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon purple"><Clock size={22} /></div>
            <div>
              <div className="stat-value">{data.avgDaysToComplete}</div>
              <div className="stat-label">Ø Tage bis Abschluss</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon orange"><Activity size={22} /></div>
            <div>
              <div className="stat-value">{completionRate}%</div>
              <div className="stat-label">Abschlussrate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Zweite Reihe */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon teal"><FileText size={22} /></div>
            <div>
              <div className="stat-value">{data.avgDocsPerPatient}</div>
              <div className="stat-label">Ø Dokumente / Patient</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon cyan"><AlertCircle size={22} /></div>
            <div>
              <div className="stat-value">{data.openReqs}</div>
              <div className="stat-label">Offene Untersuchungen</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon indigo"><CheckCircle size={22} /></div>
            <div>
              <div className="stat-value">{data.completedCases}</div>
              <div className="stat-label">Abgeschlossene Fälle</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="dashboard-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon pink"><Activity size={22} /></div>
            <div>
              <div className="stat-value">{data.avgReqsPerPatient}</div>
              <div className="stat-label">Ø Untersuchungen / Patient</div>
            </div>
          </div>
        </div>
      </div>

      {/* Erklärung */}
      <div className="dashboard-card">
        <div className="card-header-custom"><span className="fw-semibold">Berechnungsgrundlagen</span></div>
        <div className="card-body-custom">
          <ul className="mb-0">
            <li><strong>Patienten im System:</strong> Alle der Klinik zugeordneten Patienten.</li>
            <li><strong>Alle Untersuchungen fertig:</strong> Patienten bei denen alle Anforderungen den Status ACCEPTED, WAIVED oder NOT_APPLICABLE haben.</li>
            <li><strong>Ø Tage bis Abschluss:</strong> Durchschnittliche Zeit von Patienten-Erstellung bis zum Zeitpunkt an dem alle Untersuchungen abgeschlossen wurden.</li>
            <li><strong>Abschlussrate:</strong> Anteil der Patienten mit allen abgeschlossenen Untersuchungen in Prozent.</li>
            <li><strong>Ø Dokumente / Patient:</strong> Durchschnittliche Anzahl hochgeladener Dokumente pro Patient.</li>
            <li><strong>Offene Untersuchungen:</strong> Gesamtanzahl noch nicht abgeschlossener Anforderungen aller Patienten.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
