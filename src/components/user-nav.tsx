"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useTranslation } from "@/components/i18n-provider";

interface UserNavProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="position-relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
        style={{ color: "#64748b" }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          {initials}
        </div>
        <span className="d-none d-md-inline text-truncate" style={{ fontSize: "0.85rem", fontWeight: 500, maxWidth: "120px" }}>
          {user.name || user.email}
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <div
            className="position-fixed inset-0"
            style={{ zIndex: 1040 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="position-absolute end-0 mt-1 bg-white border rounded-3 shadow-sm"
            style={{
              minWidth: "220px",
              zIndex: 1050,
              borderColor: "#e2e8f0",
              borderRadius: "0.5rem",
            }}
          >
            <div className="p-3 border-bottom">
              <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>
                {user.name || t("common.user", "Benutzer")}
              </div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                {user.email}
              </div>
              <div
                className="text-uppercase"
                style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.05em" }}
              >
                {user.role}
              </div>
            </div>
            <div className="p-1">
              <Link
                href="/dashboard/settings"
                className="d-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded-2"
                style={{ color: "#374151", fontSize: "0.85rem" }}
                onClick={() => setOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Settings size={16} />
                {t("nav.settings", "Einstellungen")}
              </Link>
              <hr className="my-1 mx-3" style={{ borderColor: "#f1f5f9" }} />
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="d-flex align-items-center gap-2 w-100 text-start px-3 py-2 rounded-2"
                style={{
                  color: "#dc2626",
                  fontSize: "0.85rem",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <LogOut size={16} />
                {t("auth.logout", "Abmelden")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
