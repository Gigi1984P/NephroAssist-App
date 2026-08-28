"use client";

import { useState } from "react";
import { useTranslation } from "@/components/i18n-provider";

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  name: string;
}

const demoAccounts: DemoAccount[] = [
  { email: "admin@nephroassist.de", password: "Test1234!", role: "Admin", name: "Dr. Anna Admin" },
  { email: "koordinator@nephroassist.de", password: "Test1234!", role: "Koordinator", name: "Max Koordinator" },
  { email: "arzt@nephroassist.de", password: "Test1234!", role: "Arzt", name: "Dr. Petra Arzt" },
  { email: "patient@beispiel.de", password: "Test1234!", role: "Patient", name: "Hans Patient" },
  { email: "dialyse@beispiel.de", password: "Test1234!", role: "Dialyse", name: "Lisa Dialyse" },
  { email: "transplant@beispiel.de", password: "Test1234!", role: "Transplant", name: "Dr. Transplantklinik" },
  { email: "angehorige@beispiel.de", password: "Test1234!", role: "Pflege", name: "Marie Pflege" },
];

/* Inline SVG Icons */
function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

function CheckCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="#2563eb" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoFill, setDemoFill] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
      } else if (data.user) {
        window.location.href = "/dashboard";
      } else {
        setError(t("auth.invalidResponse", "Ungültige Antwort"));
      }
    } catch (err) {
      setError(t("auth.networkError", `Netzwerk: ${err instanceof Error ? err.message : "Unbekannt"}`));
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    if (emailInput) {
      // smooth transition by temporarily highlighting
      emailInput.style.transition = "background-color 0.3s ease";
      emailInput.value = email;
      emailInput.style.backgroundColor = "#eff6ff";
      setTimeout(() => { emailInput.style.backgroundColor = ""; }, 600);
    }
    if (passwordInput) {
      passwordInput.style.transition = "background-color 0.3s ease";
      passwordInput.value = password;
      passwordInput.style.backgroundColor = "#eff6ff";
      setTimeout(() => { passwordInput.style.backgroundColor = ""; }, 600);
    }
    setError("");
    setDemoFill(true);
    setTimeout(() => setDemoFill(false), 1200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%)",
        padding: "1rem",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "1.25rem",
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)",
          backdropFilter: "blur(8px)",
          padding: "2.25rem 2rem",
          animation: "fadeInUp 0.5s ease",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                borderRadius: "0.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              }}
            >
              <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
                <path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm-1-13v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z" />
              </svg>
            </div>
            <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}>NephroAssist</span>
          </div>
          <h1 className="h4 fw-bold mb-1" style={{ color: "#1e293b" }}>{t("auth.login", "Anmelden")}</h1>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            {t("auth.loginSubtitle", "Melden Sie sich mit Ihren Zugangsdaten an")}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3"
            role="alert"
            style={{ borderRadius: "0.5rem", fontSize: "0.85rem", border: "none", background: "#fee2e2", color: "#991b1b" }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </div>
        )}

        {/* Success hint after demo fill */}
        {demoFill && (
          <div
            className="d-flex align-items-center gap-2 py-2 mb-3 px-3"
            style={{
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              background: "#dbeafe",
              color: "#1e40af",
              transition: "opacity 0.5s",
            }}
          >
            <CheckCircleIcon size={16} />
            Zugangsdaten eingefügt — jetzt anmelden!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.375rem" }}>E-Mail</label>
            <div className="position-relative">
              <div
                className="position-absolute d-flex align-items-center justify-content-center"
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              >
                <MailIcon size={18} />
              </div>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="name@beispiel.de"
                style={{
                  paddingLeft: "42px",
                  paddingRight: "14px",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.3s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label htmlFor="password" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.375rem" }}>Passwort</label>
            <div className="position-relative">
              <div
                className="position-absolute d-flex align-items-center justify-content-center"
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              >
                <LockIcon size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-control"
                placeholder="••••••••"
                style={{
                  paddingLeft: "42px",
                  paddingRight: "44px",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.3s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="position-absolute d-flex align-items-center justify-content-center btn btn-link text-decoration-none p-0"
                style={{
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "32px",
                  height: "32px",
                  color: "#94a3b8",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  zIndex: 2,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#64748b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Passwort vergessen */}
          <div className="d-flex justify-content-end mb-4">
            <a
              href="#"
              className="text-decoration-none"
              style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 500 }}
              onClick={(e) => {
                e.preventDefault();
                alert("Bitte kontaktieren Sie Ihren Administrator um das Passwort zurückzusetzen.");
              }}
            >
              Passwort vergessen?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 fw-medium"
            style={{
              borderRadius: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)";
            }}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                Anmelden...
              </span>
            ) : (
              "Anmelden"
            )}
          </button>
        </form>

        {/* Register */}
        <div className="text-center mt-3" style={{ fontSize: "0.875rem" }}>
          <span className="text-muted">Noch kein Konto?{" "}</span>
          <a href="/register" className="text-decoration-none" style={{ color: "#2563eb", fontWeight: 500 }}>
            Registrieren
          </a>
        </div>

        {/* Demo Accounts */}
        <div className="mt-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <CheckCircleIcon size={16} />
            <span className="fw-semibold" style={{ fontSize: "0.8rem", color: "#2563eb" }}>
              Demo-Zugangsdaten
            </span>
          </div>
          <div className="d-flex flex-column gap-1">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => fillCredentials(acc.email, acc.password)}
                className="btn btn-sm text-start d-flex justify-content-between align-items-center"
                style={{
                  fontSize: "0.75rem",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#334155",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#eff6ff";
                  e.currentTarget.style.borderColor = "#2563eb";
                  e.currentTarget.style.transform = "translateX(3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <span className="d-flex align-items-center gap-1">
                  <span className="fw-medium">{acc.role}</span>
                  <span className="text-muted" style={{ fontSize: "0.7rem" }}>— {acc.name}</span>
                </span>
                <span className="text-muted" style={{ fontSize: "0.7rem" }}>Klicken</span>
              </button>
            ))}
          </div>
          <div className="text-center mt-2" style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
            Passwort für alle: Test1234!
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
