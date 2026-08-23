"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("[LOGIN] Email:", email, "Password:", password ? "***" : "EMPTY");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("[LOGIN] Response status:", res.status);

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      console.log("[LOGIN] Response data:", data);

      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}: Anmeldung fehlgeschlagen`);
      } else if (data.user) {
        window.location.href = "/dashboard";
      } else {
        setError("Ungültige Server-Antwort");
      }
    } catch (err) {
      console.error("[LOGIN] Error:", err);
      setError(`Netzwerk-Fehler: ${err instanceof Error ? err.message : "Unbekannt"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-xl font-semibold">NephroAssist</span>
          </div>
          <h1 className="text-2xl font-semibold">Anmelden</h1>
          <p className="text-sm text-slate-500 mt-1">Melden Sie sich mit Ihren Zugangsdaten an</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">E-Mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Passwort</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          Noch kein Konto?{" "}
          <a href="/register" className="text-blue-600 hover:underline">Registrieren</a>
        </div>
      </div>
    </div>
  );
}
