"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
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

export default function LoginPage() {
  const { t } = useTranslation();
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
      setInfoMsg(t("auth.registerSuccess", "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden."));
    }
    if (params.get("reset") === "success") {
      setInfoMsg(t("auth.passwordResetSuccess", "Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden."));
    }
  }, []);

  useEffect(() => {
    if (!show2FA || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
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
          setError(t("auth.invalidResponse", "Ungültige Antwort"));
        }
      } else {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: storedEmail, password: storedPassword, code: twoFactorCode, stage: "verify" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || `HTTP ${res.status}`);
        } else if (data.success) {
          window.location.href = "/dashboard";
        } else {
          setError(t("auth.invalidResponse", "Ungültige Antwort"));
        }
      }
    } catch (err) {
      setError(t("auth.networkError", `Netzwerk: ${err instanceof Error ? err.message : "Unbekannt"}`));
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    const eI = document.getElementById("email") as HTMLInputElement;
    const pI = document.getElementById("password") as HTMLInputElement;
    if (eI) { eI.value = email; eI.style.backgroundColor = "#eff6ff"; setTimeout(() => eI.style.backgroundColor = "", 600); }
    if (pI) { pI.value = password; pI.style.backgroundColor = "#eff6ff"; setTimeout(() => pI.style.backgroundColor = "", 600); }
    setError("");
    setDemoFill(true);
    setTimeout(() => setDemoFill(false), 1200);
  };

  const fmtCD = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%)", padding: "1rem", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(255,255,255,0.95)", borderRadius: "1.25rem", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)", backdropFilter: "blur(8px)", padding: "2.25rem 2rem" }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
              <svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm-1-13v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z" /></svg>
            </div>
            <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}>NephroAssist</span>
          </div>
          <h1 className="h4 fw-bold mb-1" style={{ color: "#1e293b" }}>{show2FA ? t("auth.twoFactor", "Zwei-Faktor-Authentifizierung") : t("auth.login", "Anmelden")}</h1>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            {show2FA ? t("auth.twoFactorSubtitle", `Bitte geben Sie den Code ein, den wir an ${storedEmail} gesendet haben.`) : t("auth.loginSubtitle", "Melden Sie sich mit Ihren Zugangsdaten an")}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" role="alert" style={{ borderRadius: "0.5rem", fontSize: "0.85rem", border: "none", background: "#fee2e2", color: "#991b1b" }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
            {error}
          </div>
        )}
        {infoMsg && (
          <div className="alert alert-info d-flex align-items-center gap-2 py-2 mb-3" role="alert" style={{ borderRadius: "0.5rem", fontSize: "0.85rem", border: "none", background: "#dbeafe", color: "#1e40af" }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
            {infoMsg}
          </div>
        )}
        {demoFill && (
          <div className="d-flex align-items-center gap-2 py-2 mb-3 px-3" style={{ borderRadius: "0.5rem", fontSize: "0.8rem", background: "#dbeafe", color: "#1e40af" }}>
            <CheckCircle size={16} /> {t("auth.credentialsFilled", "Zugangsdaten eingefügt — jetzt anmelden!")}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!show2FA ? (
            <>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151" }}>{t("common.email", "E-Mail")}</label>
                <div className="position-relative">
                  <div className="position-absolute d-flex align-items-center justify-content-center" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                    <Mail size={18} />
                  </div>
                  <input type="email" id="email" className="form-control" placeholder={t("auth.emailPlaceholder", "name@beispiel.de")} style={{ paddingLeft: "42px", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.9rem" }} />
                </div>
              </div>
              <div className="mb-2">
                <label htmlFor="password" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151" }}>{t("auth.password", "Passwort")}</label>
                <div className="position-relative">
                  <div className="position-absolute d-flex align-items-center justify-content-center" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                    <Lock size={18} />
                  </div>
                  <input type={showPassword ? "text" : "password"} id="password" className="form-control" placeholder="••••••••" style={{ paddingLeft: "42px", paddingRight: "44px", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.9rem" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="position-absolute d-flex align-items-center justify-content-center btn btn-link text-decoration-none p-0" style={{ right: "8px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", color: "#94a3b8", borderRadius: "0.375rem", cursor: "pointer", zIndex: 2 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="d-flex justify-content-end mb-4">
                <Link href="/forgot-password" className="text-decoration-none" style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 500 }}>{t("auth.forgotPassword", "Passwort vergessen?")}</Link>
              </div>
            </>
          ) : (
            <div className="mb-3">
              <label htmlFor="2fa-code" className="form-label fw-medium d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", color: "#374151" }}>
                <Shield size={16} /> Bestätigungscode
              </label>
              <div className="position-relative">
                <input type="text" id="2fa-code" inputMode="numeric" maxLength={6} className="form-control text-center fw-bold" placeholder="000000" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "1.5rem", letterSpacing: "8px", fontFamily: "monospace" }} autoFocus />
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>⏰ Gültig noch: {fmtCD(countdown)}</span>
                <button type="button" className="btn btn-link text-decoration-none p-0" style={{ fontSize: "0.75rem", color: "#2563eb" }} onClick={() => { setShow2FA(false); setTwoFactorCode(""); setError(""); }}>Abbrechen</button>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || (show2FA && twoFactorCode.length !== 6)} className="btn btn-primary w-100 fw-medium" style={{ borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.95rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}>
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{show2FA ? "Verifizieren..." : "Anmelden..."}</span>
            ) : (
              show2FA ? "Code bestätigen" : "Anmelden"
            )}
          </button>
        </form>

        {!show2FA && (
          <>
            <div className="text-center mt-3" style={{ fontSize: "0.875rem" }}>
              <span className="text-muted">Noch kein Konto? </span>
              <Link href="/register" className="text-decoration-none" style={{ color: "#2563eb", fontWeight: 500 }}>Registrieren</Link>
            </div>
            <div className="text-center mt-3" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              <Link href="/legal/terms-of-service" className="text-decoration-none" style={{ color: "#94a3b8" }}>AGB</Link>{" · "}
              <Link href="/legal/privacy-policy" className="text-decoration-none" style={{ color: "#94a3b8" }}>Datenschutz</Link>{" · "}
              <Link href="/legal/impressum" className="text-decoration-none" style={{ color: "#94a3b8" }}>Impressum</Link>
            </div>

            <div className="mt-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <CheckCircle size={16} style={{ color: "#2563eb" }} />
                <span className="fw-semibold" style={{ fontSize: "0.8rem", color: "#2563eb" }}>Demo-Zugangsdaten</span>
              </div>
              <div className="d-flex flex-column gap-1">
                {demoAccounts.map((acc) => (
                  <button key={acc.email} onClick={() => fillCredentials(acc.email, acc.password)} className="btn btn-sm text-start d-flex justify-content-between align-items-center" style={{ fontSize: "0.75rem", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }}>
                    <span className="d-flex align-items-center gap-1"><span className="fw-medium">{acc.role}</span><span className="text-muted" style={{ fontSize: "0.7rem" }}>— {acc.name}</span></span>
                    <span className="text-muted" style={{ fontSize: "0.7rem" }}>Klicken</span>
                  </button>
                ))}
              </div>
              <div className="text-center mt-2" style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Passwort für alle: Test1234!</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
