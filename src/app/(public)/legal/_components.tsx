"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function LegalShell({
  title, lastUpdated, children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> SmartKitchen
        </Link>

        <header className="space-y-2 pb-6 border-b border-border">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{title}</h1>
          <p className="text-xs text-muted-foreground">{lastUpdated}</p>
        </header>

        <article className="prose-legal space-y-6">{children}</article>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
