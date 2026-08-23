"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbMap: Record<string, string> = {
    dashboard: "Dashboard",
    tasks: "Aufgaben",
    patients: "Patienten",
    appointments: "Termine",
    documents: "Dokumente",
    calendar: "Kalender",
    settings: "Einstellungen",
    admin: "Admin",
    reports: "Statistiken",
    audit: "Audit Log",
  };

  return (
    <div className="mb-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb-custom mb-2">
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          {segments.slice(1).map((seg, i) => {
            const isLast = i === segments.length - 2;
            const href = "/" + segments.slice(0, i + 2).join("/");
            return (
              <li key={seg} className="d-flex align-items-center">
                <span className="separator">/</span>
                {isLast ? (
                  <span className="active">{breadcrumbMap[seg] || seg}</span>
                ) : (
                  <Link href={href}>{breadcrumbMap[seg] || seg}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2 className="h4 fw-bold">{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
