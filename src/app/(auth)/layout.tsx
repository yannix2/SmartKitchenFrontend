import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "SmartKitchen" };

const BULLETS = [
  "Automatically track all your disputed orders",
  "Bulk refund emails sent to Uber support",
  "Real-time status on every recovery",
  "Multi-restaurant management in one place",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left: brand panel (always dark) ─────────────── */}
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-zinc-950">
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/8 blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        {/* Grid */}
        <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none" />

        <div className="relative flex flex-col h-full p-12">
          {/* Logo — panel is always dark, wrap in .dark so CSS vars resolve correctly */}
          <Link href="/" className="flex items-center gap-2.5 w-fit group">
            <div className="dark">
              <Logo
                width={40}
                height={40}
                className="rounded-xl overflow-hidden shadow-lg group-hover:shadow-primary/40 transition-shadow"
              />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              Smart<span className="text-primary">Kitchen</span>
            </span>
          </Link>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center gap-10 py-12">
            <div>
              <h2 className="text-4xl font-black text-white mb-3 leading-tight">
                Recover every euro{" "}
                <span className="text-primary">Uber owes you</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                Automated refund management for Uber Eats restaurant owners.
                No manual work, no missed claims.
              </p>
            </div>

            <ul className="space-y-3.5">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  {b}
                </li>
              ))}
            </ul>

            {/* Testimonial */}
            <div className="border border-white/10 rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-primary text-sm">★</span>
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed italic">
                &ldquo;SmartKitchen recovered over €3,000 for our restaurant in the first
                month alone. I don&apos;t know how we managed without it.&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-white">
                Mohamed A.
                <span className="text-zinc-500 font-normal"> — Restaurant Owner, Paris</span>
              </p>
            </div>
          </div>

          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} SmartKitchen. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right: form area ─────────────────────────────── */}
      <div className="flex flex-col min-h-screen bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Logo width={30} height={30} className="rounded-lg overflow-hidden shrink-0" />
            <span className="font-extrabold text-base">
              Smart<span className="text-primary">Kitchen</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md animate-fade-in-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
