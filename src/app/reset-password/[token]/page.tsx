"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Ungültiger oder fehlender Token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten");
      } else {
        setSuccess("Passwort erfolgreich zurückgesetzt. Sie werden weitergeleitet...");
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 2500);
      }
    } catch {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
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
        }}
      >
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
            <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}>
              NephroAssist
            </span>
          </div>
          <h1 className="h4 fw-bold mb-1" style={{ color: "#1e293b" }}>Neues Passwort</h1>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Geben Sie Ihr neues Passwort ein.
          </p>
        </div>

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

        {success && (
          <div
            className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3"
            role="alert"
            style={{ borderRadius: "0.5rem", fontSize: "0.85rem", border: "none", background: "#dcfce7", color: "#166534" }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.375rem" }}>
              Neues Passwort
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  paddingRight: "44px",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
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
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
                    <path d="M2 2l20 20" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label fw-medium" style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.375rem" }}>
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              style={{
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="btn btn-primary w-100 fw-medium"
            style={{
              borderRadius: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            }}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Speichern...
              </span>
            ) : (
              "Passwort speichern"
            )}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: "0.875rem" }}>
          <span className="text-muted">Zurück zur{" "}</span>
          <Link href="/login" className="text-decoration-none" style={{ color: "#2563eb", fontWeight: 500 }}>
            Anmeldung
          </Link>
        </div>
      </div>
    </div>
  );
}
