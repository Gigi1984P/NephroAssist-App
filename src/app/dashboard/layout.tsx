"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { UserNav } from "@/components/user-nav";
import { NotificationCenter } from "@/components/notification-center";
import PatientSearch from "@/components/patient-search";

const STORAGE_KEY = "nephro-sidebar-width";
const DEFAULT_WIDTH = 260;

const CLINIC_ROLES = ["ADMIN", "COORDINATOR", "PHYSICIAN", "NURSE", "DIALYSIS_STAFF"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [user, setUser] = useState<{
    name?: string | null;
    email: string;
    role: string;
  } | null>(null);
  const [pageTitle, setPageTitle] = useState("Dashboard");

  /* Load sidebar width from localStorage */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWidth(parseInt(saved, 10));
    }
  }, []);

  /* Load user from session */
  useEffect(() => {
    fetch("/api/user/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  /* Track page title from pathname */
  useEffect(() => {
    const titleMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/patients": "Patienten",
      "/dashboard/appointments": "Termine",
      "/dashboard/settings": "Einstellungen",
      "/dashboard/admin": "Admin",
      "/dashboard/admin/reports": "Statistiken",
      "/dashboard/admin/audit": "Audit Log",
      "/dashboard/reports": "Auswertungen",
    };
    if (typeof window !== "undefined") {
      setPageTitle(titleMap[window.location.pathname] || "Dashboard");
    }
  }, []);

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="d-flex flex-column align-items-center gap-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
          <span className="text-muted" style={{ fontSize: "0.9rem" }}>Sitzung wird geladen...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar role={user.role} userName={user.name} userEmail={user.email} />

      <div
        className="main-wrapper"
        style={{ marginLeft: `${width}px` }}
      >
        <header className="main-header">
          <MobileSidebar role={user.role} userName={user.name} userEmail={user.email} />

          <div className="d-flex flex-grow-1 align-items-center justify-content-between gap-3">
            <h1 className="h5 fw-semibold mb-0 text-truncate flex-shrink-0" style={{ color: "#334155", minWidth: 120 }}>
              {pageTitle}
            </h1>

            <div className="d-flex align-items-center gap-3 flex-grow-1 justify-content-end">
              {/* Patienten-Suche nur für Klinik */}
              {CLINIC_ROLES.includes(user.role) && <PatientSearch />}

              <NotificationCenter />
              <div style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />
              <UserNav user={user} />
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
