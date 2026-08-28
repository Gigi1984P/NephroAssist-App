"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface TranslationDict {
  [key: string]: string;
}

interface I18nContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: "de",
  setLang: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isLoading: true,
});

export function useTranslation() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("de");
  const [translations, setTranslations] = useState<TranslationDict>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load language from localStorage or default
  useEffect(() => {
    const saved = localStorage.getItem("nephro-lang");
    if (saved) {
      setLangState(saved);
    }
  }, []);

  // Fetch translations when lang changes
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/translations?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.translations) {
          setTranslations(data.translations);
        }
      })
      .catch(() => {
        // fallback: load from localStorage cache
        const cached = localStorage.getItem(`nephro-trans-${lang}`);
        if (cached) {
          try {
            setTranslations(JSON.parse(cached));
          } catch { }
        }
      })
      .finally(() => setIsLoading(false));
  }, [lang]);

  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
    localStorage.setItem("nephro-lang", newLang);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return translations[key] || fallback || key;
    },
    [translations]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

// Language switcher component
export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="btn-group btn-group-sm">
      <button
        className={`btn ${lang === "de" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => setLang("de")}
      >
        🇩🇪 DE
      </button>
      <button
        className={`btn ${lang === "it" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => setLang("it")}
      >
        🇮🇹 IT
      </button>
    </div>
  );
}
