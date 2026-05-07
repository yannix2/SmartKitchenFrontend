"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "support@smartkitchen.com";

type Props = {
  /** `full` = 4-column footer (public marketing pages). `compact` = single-line with links + lang toggle (in-app). */
  variant?: "full" | "compact";
  className?: string;
};

export function SiteFooter({ variant = "full", className }: Props) {
  const t = useT({
    fr: {
      footer_company: "Entreprise",
      footer_legal:   "Légal",
      footer_contact: "Contact",
      about:    "À propos",
      pricing:  "Tarifs",
      contact:  "Contact",
      terms:    "Conditions générales",
      privacy:  "Politique de confidentialité",
      mentions: "Mentions légales",
      built:    "Conçu pour les restaurateurs Uber Eats.",
      copyright: "© SmartKitchen. Tous droits réservés.",
    },
    en: {
      footer_company: "Company",
      footer_legal:   "Legal",
      footer_contact: "Contact",
      about:    "About",
      pricing:  "Pricing",
      contact:  "Contact",
      terms:    "Terms of Service",
      privacy:  "Privacy Policy",
      mentions: "Legal Notice",
      built:    "Built for Uber Eats restaurant owners.",
      copyright: "© SmartKitchen. All rights reserved.",
    },
  });

  if (variant === "compact") {
    return (
      <footer className={cn("border-t border-border bg-card/30 mt-auto", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[10px] text-muted-foreground">{t.copyright}</span>
            <Link href="/legal/terms"    className="text-[10px] text-muted-foreground hover:text-primary transition-colors">{t.terms}</Link>
            <Link href="/legal/privacy"  className="text-[10px] text-muted-foreground hover:text-primary transition-colors">{t.privacy}</Link>
            <Link href="/legal/mentions" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">{t.mentions}</Link>
            <Link href="/contact"        className="text-[10px] text-muted-foreground hover:text-primary transition-colors">{t.contact}</Link>
          </div>
          <LanguageToggle variant="compact" />
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("border-t border-border bg-card/30 mt-auto", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1 space-y-3">
          <div className="flex items-center gap-2.5">
            <Logo width={24} height={24} className="rounded-md overflow-hidden" />
            <span className="font-extrabold text-sm">
              Smart<span className="text-primary">Kitchen</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{t.built}</p>
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.footer_company}</p>
          <Link href="/about"   className="block text-xs hover:text-primary transition-colors">{t.about}</Link>
          <Link href="/pricing" className="block text-xs hover:text-primary transition-colors">{t.pricing}</Link>
          <Link href="/contact" className="block text-xs hover:text-primary transition-colors">{t.contact}</Link>
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.footer_legal}</p>
          <Link href="/legal/terms"    className="block text-xs hover:text-primary transition-colors">{t.terms}</Link>
          <Link href="/legal/privacy"  className="block text-xs hover:text-primary transition-colors">{t.privacy}</Link>
          <Link href="/legal/mentions" className="block text-xs hover:text-primary transition-colors">{t.mentions}</Link>
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.footer_contact}</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="block text-xs hover:text-primary transition-colors">{SUPPORT_EMAIL}</a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[10px] text-muted-foreground">{t.copyright}</p>
          <LanguageToggle variant="compact" />
        </div>
      </div>
    </footer>
  );
}
