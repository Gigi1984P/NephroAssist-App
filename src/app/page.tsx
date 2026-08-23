"use client";

import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Direkt aus DOM lesen - garantiert korrekt
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    console.log("[LOGIN] Email:", email);
    console.log("[LOGIN] Password empty?", password.length === 0);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("[LOGIN] Status:", res.status);

      const text = await res.text();
      console.log("[LOGIN] Response:", text);

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
      console.error("[LOGIN] Error:", err);
      setError(`Netzwerk: ${err instanceof Error ? err.message : "Unbekannt"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f1f5f9",
      padding: "1rem",
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: "white",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0",
        width: "100%",
        maxWidth: "400px",
        padding: "2rem",
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ width: "2rem", height: "2rem", background: "#2563eb", borderRadius: "0.5rem" }} />
            <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a" }}>NephroAssist</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>Anmelden</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>Melden Sie sich mit Ihren Zugangsdaten an</p>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#0f172a", marginBottom: "0.375rem" }}>E-Mail</label>
            <input
              type="email"
              id="email"
              defaultValue="admin@nephroassist.de"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password" style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#0f172a", marginBottom: "0.375rem" }}>Passwort</label>
            <input
              type="password"
              id="password"
              defaultValue="Test1234!"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.625rem",
              background: loading ? "#93c5fd" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem", color: "#64748b" }}>
          Noch kein Konto?{" "}
          <a href="/register" style={{ color: "#2563eb", textDecoration: "none" }}>Registrieren</a>
        </div>
      </div>
    </div>
  );
}
