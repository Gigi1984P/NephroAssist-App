"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Sehr schwach", color: "#991b1b" },
    { label: "Schwach", color: "#c2410c" },
    { label: "Mittel", color: "#ca8a04" },
    { label: "Gut", color: "#16a34a" },
    { label: "Sehr gut", color: "#15803d" },
    { label: "Exzellent", color: "#166534" },
  ];
  return { score, ...levels[score] };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Bitte akzeptieren Sie die AGB und Datenschutzerklärung.");
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrierung fehlgeschlagen");
      } else {
        setShowSuccess(true);
      }
    } catch {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-600" />
              <span className="text-xl font-semibold">NephroAssist</span>
            </div>
            <CardTitle className="text-2xl text-center">Registrierung erfolgreich</CardTitle>
            <CardDescription className="text-center">
              Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte prüfen Sie Ihren Posteingang und bestätigen Sie Ihre E-Mail-Adresse.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/login")} className="mt-2">
              Zum Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-xl font-semibold">NephroAssist</span>
          </div>
          <CardTitle className="text-2xl text-center">Registrieren</CardTitle>
          <CardDescription className="text-center">
            Erstellen Sie ein neues Konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Max Mustermann"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Passwortstärke</span>
                  <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(strength.score / 5) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>Mindestens 8 Zeichen</li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>Großbuchstabe (A–Z)</li>
                  <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>Kleinbuchstabe (a–z)</li>
                  <li className={/\d/.test(password) ? "text-green-600" : ""}>Zahl (0–9)</li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>Sonderzeichen</li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">Patient</SelectItem>
                  <SelectItem value="CAREGIVER">Angehöriger</SelectItem>
                  <SelectItem value="COORDINATOR">Koordinator</SelectItem>
                  <SelectItem value="PHYSICIAN">Arzt</SelectItem>
                  <SelectItem value="NURSE">Pflegekraft</SelectItem>
                  <SelectItem value="DIALYSIS_STAFF">Dialysepersonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="agree" className="text-sm font-normal cursor-pointer">
                Ich stimme den{" "}
                <Link href="/legal/terms-of-service" className="text-blue-600 hover:underline" target="_blank">
                  AGB
                </Link>{" "}
                und der{" "}
                <Link href="/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank">
                  Datenschutzerklärung
                </Link>{" "}
                zu.
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrieren..." : "Konto erstellen"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600">
            Bereits registriert?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Anmelden
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
