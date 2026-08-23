"use client";

import { useEffect } from "react";
import LoginForm from "@/components/login-form";

export default function HomePage() {
  // Prüfe ob bereits eingeloggt (Client-Side)
  useEffect(() => {
    fetch("/api/auth/check", { method: "GET" }).catch(() => {
      // Ignoriere Fehler
    });
  }, []);

  return <LoginForm />;
}
