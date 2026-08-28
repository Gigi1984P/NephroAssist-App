"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  name: string;
}

const demoAccounts: DemoAccount[] = process.env.NODE_ENV === "production"
  ? []
  : [
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
    \u003csvg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"\u003e
      \u003crect x="2" y="4" width="20" height="16" rx="2" /\u003e
      \u003cpath d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /\u003e
    \u003c/svg\u003e
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    \u003csvg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"\u003e
      \u003crect x="3" y="11" width="18" height="11" rx="2" ry="2" /\u003e
      \u003cpath d="M7 11V7a5 5 0 0 1 10 0v4" /\u003e
    \u003c/svg\u003e
  );
}

function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    \u003csvg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"\u003e
      \u003cpath d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /\u003e
    \u003c/svg\u003e
  );
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    \u003csvg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"\u003e
      \u003cpath d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /\u003e
      \u003ccircle cx="12" cy="12" r="3" /\u003e
    \u003c/svg\u003e
  );
}

function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    \u003csvg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"\u003e
      \u003cpath d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /\u003e
      \u003cpath d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /\u003e
      \u003cpath d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" /\u003e
      \u003cpath d="M2 2l20 20" /\u003e
    \u003c/svg\u003e
  );
}

function CheckCircleIcon({ size = 16 }: { size?: number }) {
  return (
    \u003csvg width={size} height={size} fill="#2563eb" viewBox="0 0 24 24"\u003e
      \u003cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /\u003e
    \u003c/svg\u003e
  );
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoFill, setDemoFill] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [storedEmail, setStoredEmail] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [countdown, setCountdown] = useState(600);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setInfoMsg("Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden.");
    }
    if (params.get("reset") === "success") {
      setInfoMsg("Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.");
    }
  }, []);

  // Countdown für 2FA-Code
  useEffect(() => {
    if (!show2FA || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [show2FA, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const email = emailInput?.value.trim() || storedEmail;
    const password = passwordInput?.value || storedPassword;

    try {
      // Stage 1: E-Mail + Passwort
      if (!show2FA) {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, stage: "request" }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.error || `HTTP ${res.status}`);
        } else if (data.twoFactorRequired) {
          setStoredEmail(email);
          setStoredPassword(password);
          setShow2FA(true);
          setCountdown(600);
        } else if (data.success) {
          window.location.href = "/dashboard";
        } else {
          setError("Ungültige Antwort");
        }
      }
      // Stage 2: 2FA-Code
      else {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: storedEmail,
            password: storedPassword,
            code: twoFactorCode,
            stage: "verify",
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.error || `HTTP ${res.status}`);
        } else if (data.success) {
          window.location.href = "/dashboard";
        } else {
          setError("Ungültige Antwort");
        }
      }
    } catch (err) {
      setError(`Netzwerk: ${err instanceof Error ? err.message : "Unbekannt"}`);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    if (emailInput) {
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

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    \u003cdiv
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%)",
        padding: "1rem",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    \u003e
      \u003cdiv
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
      \u003e
        {/* Logo */}
        \u003cdiv className="text-center mb-4"\u003e
          \u003cdiv className="d-flex align-items-center justify-content-center gap-2 mb-3"\u003e
            \u003cdiv
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
            \u003e
              \u003csvg width="22" height="22" fill="white" viewBox="0 0 24 24"\u003e
                \u003cpath d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm-1-13v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z" /\u003e
              \u003c/svg\u003e
            \u003c/div\u003e
            \u003cspan style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}\u003eNephroAssist\u003c/span\u003e
          \u003c/div\u003e
          \u003ch1 className="h4 fw-bold mb-1" style={{ color: "#1e293b" }}\u003e{show2FA ? "2-Faktor-Authentifizierung" : "Anmelden"}\u003c/h1\u003e
          \u003cp className="text-muted mb-0" style={{ fontSize: "0.9rem" }}\u003e
            {show2FA
              ? `Bitte geben Sie den 6-stelligen Code ein, den wir an ${storedEmail} gesendet haben.`
              : "Melden Sie sich mit Ihren Zugangsdaten an"}
          \u003c/p\u003e
        \u003c/div\u003e

        {/* Error */}
        {error \u0026\u0026 (
          \u003cdiv
            className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3"
            role="alert"
            style={{ borderRadius: "0.5rem", fontSize: "0.85rem", border: "none", background: "#fee2e2", color: "#991b1b" }}
          \u003e
            \u003csvg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"\u003e
              \u003cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /\u003e
            \u003c/svg\u003e
            {error}
          \u003c/div\u003e
        )}

        {/* Info message */}
        {infoMsg \u0026\u0026 (
          \u003cdiv
            className="alert alert-info d-flex align-items-center gap-2 py-2 mb-3"
            role="alert"
            style={{ borderRadius: "0.5rem", fontSize: "0.85rem", border: "none", background: "#dbeafe", color: "#1e40af" }}
          \u003e
            \u003csvg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"\u003e
              \u003cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /\u003e
            \u003c/svg\u003e
            {infoMsg}
          \u003c/div\u003e
        )}

        {/* Success hint after demo fill */}
        {demoFill \u0026\u0026 (
          \u003cdiv
            className="d-flex align-items-center gap-2 py-2 mb-3 px-3"
            style={{
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              background: "#dbeafe",
              color: "#1e40af",
              transition: "opacity 0.5s",
            }}
          \u003e
            \u003cCheckCircleIcon size={16} /\u003e
            Zugangsdaten eingefügt — jetzt anmelden!
          \u003c/div\u003e
        )}

        \u003cform onSubmit={handleSubmit}\u003e
          {!show2FA ? (
            \u003c\u003e
              {/* Email */}
              \u003cdiv className="mb-3"\u003e
                \u003clabel htmlFor="email" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.375rem" }}\u003eE-Mail\u003c/label\u003e
                \u003cdiv className="position-relative"\u003e
                  \u003cdiv
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
                  \u003e
                    \u003cMailIcon size={18} /\u003e
                  \u003c/div\u003e
                  \u003cinput
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
                    }}
                  /\u003e
                \u003c/div\u003e
              \u003c/div\u003e

              {/* Password */}
              \u003cdiv className="mb-2"\u003e
                \u003clabel htmlFor="password" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.375rem" }}\u003ePasswort\u003c/label\u003e
                \u003cdiv className="position-relative"\u003e
                  \u003cdiv
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
                  \u003e
                    \u003cLockIcon size={18} /\u003e
                  \u003c/div\u003e
                  \u003cinput
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
                    }}
                  /\u003e
                  \u003cbutton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="position-absolute d-flex align-items-center justify-content-center btn btn-link text-decoration-none p-0"
                    style={{ right: "8px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", color: "#94a3b8", borderRadius: "0.375rem", cursor: "pointer", zIndex: 2 }}
                  \u003e
                    {showPassword ? \u003cEyeOffIcon size={18} /\u003e : \u003cEyeIcon size={18} /\u003e}
                  \u003c/button\u003e
                \u003c/div\u003e
              \u003c/div\u003e

              {/* Passwort vergessen */}
              \u003cdiv className="d-flex justify-content-end mb-4"\u003e
                \u003cLink href="/forgot-password" className="text-decoration-none" style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 500 }}\u003e
                  Passwort vergessen?
                \u003c/Link\u003e
              \u003c/div\u003e
            \u003c/\u003e
          ) : (
            \u003c\u003e
              {/* 2FA Code Input */}
              \u003cdiv className="mb-3"\u003e
                \u003clabel htmlFor="2fa-code" className="form-label fw-medium d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", color: "#374151" }}\u003e
                  \u003cShieldIcon size={16} /\u003e
                  Bestätigungscode
                \u003c/label\u003e
                \u003cdiv className="position-relative"\u003e
                  \u003cinput
                    type="text"
                    id="2fa-code"
                    inputMode="numeric"
                    maxLength={6}
                    className="form-control text-center fw-bold"
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                      setTwoFactorCode(val);
                    }}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #d1d5db",
                      fontSize: "1.5rem",
                      letterSpacing: "8px",
                      fontFamily: "monospace",
                    }}
                    autoFocus
                  /\u003e
                \u003c/div\u003e
                \u003cdiv className="d-flex justify-content-between mt-2"\u003e
                  \u003cspan className="text-muted" style={{ fontSize: "0.75rem" }}\u003e
                    ⏰ Gültig noch: {formatCountdown(countdown)}
                  \u003c/span\u003e
                  \u003cbutton
                    type="button"
                    className="btn btn-link text-decoration-none p-0"
                    style={{ fontSize: "0.75rem", color: "#2563eb" }}
                    onClick={() => {
                      setShow2FA(false);
                      setTwoFactorCode("");
                      setError("");
                    }}
                  \u003e
                    Abbrechen
                  \u003c/button\u003e
                \u003c/div\u003e
              \u003c/div\u003e
            \u003c/\u003e
          )}

          \u003cbutton
            type="submit"
            disabled={loading || (show2FA \u0026\u0026 twoFactorCode.length !== 6)}
            className="btn btn-primary w-100 fw-medium"
            style={{
              borderRadius: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            }}
          \u003e
            {loading ? (
              \u003cspan className="d-flex align-items-center justify-content-center gap-2"\u003e
                \u003cspan className="spinner-border spinner-border-sm" role="status" aria-hidden="true"\u003e\u003c/span\u003e
                {show2FA ? "Verifizieren..." : "Anmelden..."}
              \u003c/span\u003e
            ) : (
              show2FA ? "Code bestätigen" : "Anmelden"
            )}
          \u003c/button\u003e
        \u003c/form\u003e

        {/* Register */}
        {!show2FA \u0026\u0026 (
          \u003cdiv className="text-center mt-3" style={{ fontSize: "0.875rem" }}\u003e
            \u003cspan className="text-muted"\u003eNoch kein Konto?{" "}\u003c/span\u003e
            \u003cLink href="/register" className="text-decoration-none" style={{ color: "#2563eb", fontWeight: 500 }}\u003e
              Registrieren
            \u003c/Link\u003e
          \u003c/div\u003e
        )}

        {/* Legal */}
        {!show2FA \u0026\u0026 (
          \u003cdiv className="text-center mt-3" style={{ fontSize: "0.75rem", color: "#94a3b8" }}\u003e
            \u003cLink href="/legal/terms-of-service" className="text-decoration-none" style={{ color: "#94a3b8" }}\u003eAGB\u003c/Link\u003e{" · "}
            \u003cLink href="/legal/privacy-policy" className="text-decoration-none" style={{ color: "#94a3b8" }}\u003eDatenschutz\u003c/Link\u003e{" · "}
            \u003cLink href="/legal/impressum" className="text-decoration-none" style={{ color: "#94a3b8" }}\u003eImpressum\u003c/Link\u003e
          \u003c/div\u003e
        )}

        {/* Demo Accounts */}
        {!show2FA \u0026\u0026 (
          \u003cdiv className="mt-4"\u003e
            \u003cdiv className="d-flex align-items-center gap-2 mb-2"\u003e
              \u003cCheckCircleIcon size={16} /\u003e
              \u003cspan className="fw-semibold" style={{ fontSize: "0.8rem", color: "#2563eb" }}\u003e
                Demo-Zugangsdaten
              \u003c/span\u003e
            \u003c/div\u003e
            \u003cdiv className="d-flex flex-column gap-1"\u003e
              {demoAccounts.map((acc) => (
                \u003cbutton
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
                  }}
                \u003e
                  \u003cspan className="d-flex align-items-center gap-1"\u003e
                    \u003cspan className="fw-medium"\u003e{acc.role}\u003c/span\u003e
                    \u003cspan className="text-muted" style={{ fontSize: "0.7rem" }}\u003e— {acc.name}\u003c/span\u003e
                  \u003c/span\u003e
                  \u003cspan className="text-muted" style={{ fontSize: "0.7rem" }}\u003eKlicken\u003c/span\u003e
                \u003c/button\u003e
              ))}
            \u003c/div\u003e
            \u003cdiv className="text-center mt-2" style={{ fontSize: "0.7rem", color: "#94a3b8" }}\u003e
              Passwort für alle: Test1234!
            \u003c/div\u003e
          \u003c/div\u003e
        )}
      \u003c/div\u003e

      \u003cstyle jsx global\u003e{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}\u003c/style\u003e
    \u003c/div\u003e
  );
}
