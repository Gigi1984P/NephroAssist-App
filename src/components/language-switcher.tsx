"use client";

import { useTranslation } from "@/components/i18n-provider";

interface LanguageSwitcherProps {
  currentLang: string;
  onChange: (lang: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function LanguageSwitcher({ currentLang, onChange, size = "md" }: LanguageSwitcherProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "btn-group-sm",
    md: "",
    lg: "btn-group-lg",
  };

  return (
    <div className={`btn-group ${sizeClasses[size]}`} role="group" aria-label="Sprachauswahl">
      <button
        type="button"
        className={`btn ${currentLang === "de" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => onChange("de")}
        title={t("lang.german", "Deutsch")}
      >
        🇩🇪 DE
      </button>
      <button
        type="button"
        className={`btn ${currentLang === "it" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => onChange("it")}
        title={t("lang.italian", "Italiano")}
      >
        🇮🇹 IT
      </button>
    </div>
  );
}
