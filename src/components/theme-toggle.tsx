"use client";

import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun size={14} /> },
    { value: "dark", label: "Dark", icon: <Moon size={14} /> },
    { value: "system", label: "System", icon: <Monitor size={14} /> },
  ];

  const active = options.find((o) => o.value === theme);

  return (
    <div className="position-relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
        style={{ color: "#64748b" }}
        title={active?.label}
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
          {active?.icon}
        </div>
        <span className="d-none d-md-inline" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
          {active?.label}
        </span>
      </button>

      {open && (
        <>
          <div
            className="position-fixed inset-0"
            style={{ zIndex: 1040 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="position-absolute bg-white border rounded-3 shadow-sm"
            style={{
              right: 0,
              marginTop: "0.25rem",
              minWidth: "160px",
              zIndex: 1050,
              borderColor: "#e2e8f0",
              borderRadius: "0.5rem",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className="d-flex align-items-center gap-2 w-100 text-start px-3 py-2"
                style={{
                  fontSize: "0.85rem",
                  color: "#374151",
                  border: "none",
                  background: theme === opt.value ? "#f1f5f9" : "transparent",
                  cursor: "pointer",
                  borderRadius: "0.375rem",
                  margin: "0.125rem 0.25rem",
                  width: "calc(100% - 0.5rem)",
                }}
                onMouseEnter={(e) => {
                  if (theme !== opt.value) e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (theme !== opt.value) e.currentTarget.style.backgroundColor = "transparent";
                  else e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
              >
                <span style={{ width: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
