"use client";

import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError("Ungültige Antwort");
      }
    } catch (err) {
      setError(`Netzwerk: ${err instanceof Error ? err.message : "Unbekannt"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "#2563eb",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm-1-13v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z" />
              </svg>
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b" }}>NephroAssist</span>
          </div>
          <h1 className="h4 fw-bold" style={{ color: "#1e293b" }}>Anmelden</h1>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Melden Sie sich mit Ihren Zugangsdaten an
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-3" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label-custom">E-Mail</label>
            <input
              type="email"
              id="email"
              defaultValue="admin@nephroassist.de"
              className="form-control form-input-custom"
              placeholder="name@beispiel.de"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label-custom">Passwort</label>
            <input
              type="password"
              id="password"
              defaultValue="Test1234!"
              className="form-control form-input-custom"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 fw-medium"
            style={{ borderRadius: "0.5rem" }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Anmelden...
              </>
            ) : (
              "Anmelden"
            )}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: "0.875rem" }}>
          <span className="text-muted">Noch kein Konto?{" "}</span>
          <a href="/register" className="text-decoration-none" style={{ color: "#2563eb", fontWeight: 500 }}>
            Registrieren
          </a>
        </div>
      </div>
    </div>
  );
}
