"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "fr" | "en";

const STORAGE_KEY = "sk-lang";

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

const LangCtx = createContext<Ctx | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "en") return stored;
  // Detect from browser
  const nav = window.navigator.language.toLowerCase();
  if (nav.startsWith("fr")) return "fr";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr"); // SSR-safe default; replaced on mount

  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  // Reflect on <html lang="..."> for accessibility / SEO
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggle = useCallback(() => setLang(lang === "fr" ? "en" : "fr"), [lang, setLang]);

  return (
    <LangCtx.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}

/**
 * Per-component translation. Pass a dict keyed by language; returns the active one.
 *
 *   const t = useT({
 *     fr: { hero: "Bienvenue" },
 *     en: { hero: "Welcome" },
 *   });
 *   <h1>{t.hero}</h1>
 */
export function useT<D extends Record<string, string>>(dict: Record<Lang, D>): D {
  const { lang } = useLang();
  return dict[lang];
}
