"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useT } from "@/i18n/provider";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const t = useT({
    fr: { features: "Fonctionnalités", how: "Comment ça marche", pricing: "Tarifs", about: "À propos", contact: "Contact", login: "Se connecter", get_started: "Commencer", get_started_free: "Commencer gratuitement" },
    en: { features: "Features", how: "How It Works", pricing: "Pricing", about: "About", contact: "Contact", login: "Log in", get_started: "Get Started", get_started_free: "Get Started Free" },
  });
  const NAV_LINKS = [
    { label: t.features, href: "#features"     },
    { label: t.how,      href: "#how-it-works" },
    { label: t.pricing,  href: "/pricing"      },
    { label: t.about,    href: "/about"        },
    { label: t.contact,  href: "/contact"      },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-linear-to-r from-primary/8 via-card/85 to-card/85 backdrop-blur-xl border-b border-border/60 shadow-[0_8px_24px_-12px] shadow-primary/10"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Logo
            width={36}
            height={36}
            className="rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:shadow-primary/30 transition-shadow"
          />
          <span className="font-extrabold text-lg tracking-tight select-none">
            Smart<span className="text-primary">Kitchen</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle variant="compact" />
          <ThemeToggle />
          <Link href="/login" className="hidden lg:block">
            <Button variant="ghost" size="sm" className="font-medium">{t.login}</Button>
          </Link>
          <Link href="/register" className="hidden lg:block">
            <Button size="sm" className="font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:-translate-y-px transition-all">
              {t.get_started}
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground transition-colors">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 flex flex-col gap-0 pt-10">
              <div className="flex items-center gap-2 mb-8 px-1">
                <Logo width={32} height={32} className="rounded-lg overflow-hidden shrink-0" />
                <span className="font-extrabold text-lg">
                  Smart<span className="text-primary">Kitchen</span>
                </span>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-border">
                <div className="flex justify-center"><LanguageToggle /></div>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold">{t.login}</Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full font-semibold">{t.get_started_free}</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
