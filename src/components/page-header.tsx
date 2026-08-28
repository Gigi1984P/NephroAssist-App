"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { useTranslation } from "@/components/i18n-provider";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, action, breadcrumbs }: PageHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { t } = useTranslation();

  const breadcrumbMap: Record<string, string> = {
    dashboard: t("nav.dashboard", "Dashboard"),
    tasks: t("req.title", "Untersuchungen"),
    patients: t("nav.patients", "Patienten"),
    appointments: t("appt.title", "Termine"),
    documents: t("doc.title", "Dokumente"),
    calendar: t("appt.title", "Termine"),
    settings: t("nav.settings", "Einstellungen"),
    admin: t("nav.admin", "Admin"),
    reports: t("nav.reports", "Auswertungen"),
    audit: t("admin.auditLog", "Audit Log"),
  };

  return (
    <div className="mb-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb-custom mb-2">
          {breadcrumbs ? (
            breadcrumbs.map((crumb, i) => (
              <li key={i} className="d-flex align-items-center">
                {i > 0 && <span className="separator">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span className="active">{crumb.label}</span>
                )}
              </li>
            ))
          ) : (
            <>
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
            </>
          )}
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
