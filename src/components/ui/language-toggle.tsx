"use client";

import { useLang, type Lang } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type Props = {
  /** `pill` = sliding pill with both flags. `compact` = single button cycling languages. */
  variant?: "pill" | "compact";
  className?: string;
};

const FLAG_URLS: Record<Lang, string> = {
  fr: "https://flagcdn.com/fr.svg",
  en: "https://flagcdn.com/gb.svg",
};

const FLAG_ALT: Record<Lang, string> = {
  fr: "Drapeau français",
  en: "United Kingdom flag",
};

const LABELS: Record<Lang, string> = {
  fr: "FR",
  en: "EN",
};

function FlagImg({ lang, size = 18 }: { lang: Lang; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FLAG_URLS[lang]}
      alt={FLAG_ALT[lang]}
      width={size}
      height={Math.round(size * 0.66)}
      className="rounded-sm shadow-sm shrink-0 select-none"
      style={{ width: size, height: Math.round(size * 0.66), objectFit: "cover" }}
      draggable={false}
    />
  );
}

export function LanguageToggle({ variant = "pill", className }: Props) {
  const { lang, setLang, toggle } = useLang();

  if (variant === "compact") {
    return (
      <button
        onClick={toggle}
        title={lang === "fr" ? "Switch to English" : "Passer en français"}
        aria-label="Toggle language"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all press-scale",
          className,
        )}
      >
        <FlagImg lang={lang} size={16} />
        <span>{LABELS[lang]}</span>
      </button>
    );
  }

  // ── Sliding pill ──
  const codes: Lang[] = ["fr", "en"];
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        "relative inline-flex items-center rounded-full border border-border bg-card p-0.5 text-[11px] font-semibold shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Sliding indicator behind the active option */}
      <div
        className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-primary shadow-sm transition-transform duration-300 ease-out pointer-events-none"
        style={{
          width: "calc(50% - 2px)",
          transform: lang === "fr" ? "translateX(0)" : "translateX(100%)",
        }}
      />

      {codes.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            role="radio"
            aria-checked={active}
            onClick={() => setLang(code)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors duration-200",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FlagImg lang={code} size={16} />
            <span className="font-bold tracking-wider">{LABELS[code]}</span>
          </button>
        );
      })}
    </div>
  );
}
