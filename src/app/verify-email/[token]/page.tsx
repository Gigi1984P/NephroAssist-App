"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params?.token as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("E-Mail wird bestätigt...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Ungültiger oder fehlender Bestätigungslink.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "E-Mail-Adresse erfolgreich bestätigt. Sie können sich jetzt anmelden.");
        } else {
          setStatus("error");
          setMessage(data.error || "Bestätigung fehlgeschlagen.");
        }
      } catch {
        setStatus("error");
        setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      }
    };

    verify();
  }, [token]);

  const iconColor = status === "success" ? "#166534" : status === "error" ? "#991b1b" : "#2563eb";

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
          textAlign: "center",
        }}
      >
        <div className="mb-4">
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
          <h1 className="h4 fw-bold mb-2" style={{ color: "#1e293b" }}>
            {status === "success" ? "E-Mail bestätigt" : status === "error" ? "Bestätigung fehlgeschlagen" : "E-Mail wird bestätigt"}
          </h1>
        </div>

        <div
          className="d-flex align-items-center justify-content-center gap-2 py-3 mb-3"
          style={{
            borderRadius: "0.5rem",
            fontSize: "0.9rem",
            background: status === "success" ? "#dcfce7" : status === "error" ? "#fee2e2" : "#eff6ff",
            color: iconColor,
          }}
        >
          {status === "loading" && (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          )}
          {status === "success" && (
            <svg width="20" height="20" fill={iconColor} viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
          {status === "error" && (
            <svg width="20" height="20" fill={iconColor} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          )}
          {message}
        </div>

        <div className="text-center" style={{ fontSize: "0.875rem" }}>
          {status === "success" ? (
            <Link href="/login" className="text-decoration-none" style={{ color: "#2563eb", fontWeight: 500 }}>
              Zum Login →
            </Link>
          ) : status === "error" ? (
            <span>
              <span className="text-muted">Brauchen Sie Hilfe?{" "}</span>
              <a href="mailto:support@nephroassist.de" className="text-decoration-none" style={{ color: "#2563eb", fontWeight: 500 }}>
                Kontaktieren Sie uns
              </a>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
