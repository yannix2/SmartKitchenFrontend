import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/layout/landing-nav";
import Logo from "@/components/ui/Logo";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Mail,
  RefreshCcw,
  Shield,
  Star,
  Store,
  TrendingUp,
  Zap,
  XCircle,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Store,
    title: "All Your Stores, One Place",
    description: "Manage every restaurant from a single dashboard. No more switching between accounts.",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    icon: RefreshCcw,
    title: "Always Up to Date",
    description: "Your order data stays fresh automatically. Cancelled and disputed orders are flagged instantly.",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10",
  },
  {
    icon: BarChart3,
    title: "Know What You're Owed",
    description: "See exactly which payments Uber has sent back and which are still outstanding.",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: Mail,
    title: "Emails on Autopilot",
    description: "Refund requests go out to Uber support automatically, with the right attachments, every time.",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    icon: Shield,
    title: "Evidence Ready",
    description: "Upload your proof images once. SmartKitchen attaches the right file to the right order automatically.",
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
  },
  {
    icon: TrendingUp,
    title: "Track Every Recovery",
    description: "A live status for every disputed order — from pending all the way to money back in your account.",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
];

const STATS = [
  { value: "€2M+",   label: "Recovered for Restaurants" },
  { value: "1,200+", label: "Active Restaurants" },
  { value: "98%",    label: "Email Success Rate" },
  { value: "24 h",   label: "Average Response Time" },
];

const WITHOUT = [
  "Digging through Uber reports by hand",
  "Writing refund emails one by one",
  "No idea which orders were reimbursed",
  "Missing proof upload deadlines",
  "Hours lost every week",
];

const WITH = [
  "Orders tracked and flagged automatically",
  "Bulk refund emails sent with one click",
  "Live status on every disputed order",
  "Proof images attached automatically",
  "Minutes of work, not hours",
];

// ── Dashboard Mockup ──────────────────────────────────────────────────────────

function DashboardMockup() {
  const orders = [
    { id: "F745B", store: "SK Paris 1", status: "email envoyé", amount: "€12.50" },
    { id: "A123C", store: "SK Lyon",    status: "remboursé",    amount: "€8.00"  },
    { id: "B891D", store: "SK Paris 2", status: "en attente",   amount: "€22.00" },
  ];

  const statusCls: Record<string, string> = {
    "remboursé":    "bg-primary/15 text-primary",
    "email envoyé": "bg-sky-500/15 text-sky-500",
    "en attente":   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="relative w-full max-w-[500px] animate-float">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/20 blur-3xl scale-90 translate-y-6" />

      {/* Top-left badge */}
      <div className="absolute -top-5 -left-8 z-10 bg-card border border-border shadow-xl rounded-2xl px-4 py-3 animate-float-slow">
        <p className="text-[10px] text-muted-foreground">Monthly Recovery</p>
        <p className="text-xl font-black text-primary leading-tight">+€2,340</p>
      </div>

      {/* Window */}
      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="ml-2 text-[11px] font-mono text-muted-foreground">smartkitchen — dashboard</span>
        </div>

        <div className="p-5 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Recovered", value: "€2,340", sub: "+12%",    accent: true  },
              { label: "Cancelled", value: "23",     sub: "orders",  accent: false },
              { label: "Contested", value: "8",      sub: "pending", accent: false },
            ].map((k) => (
              <div key={k.label} className="p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
                <p className={`text-lg font-black leading-none ${k.accent ? "text-primary" : ""}`}>{k.value}</p>
                <p className={`text-[10px] mt-0.5 ${k.accent ? "text-primary" : "text-muted-foreground"}`}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-xl bg-muted/50 border border-border p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold">Revenue Recovery</span>
              <span className="text-[10px] text-primary font-semibold">This Month</span>
            </div>
            <svg viewBox="0 0 260 52" className="w-full h-11" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#5DDE35" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#5DDE35" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 46 C30 40,50 34,80 28 S130 16,160 12 S210 5,260 2 L260 52 L0 52 Z" fill="url(#cg)" />
              <path d="M0 46 C30 40,50 34,80 28 S130 16,160 12 S210 5,260 2" fill="none" stroke="#5DDE35" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="260" cy="2" r="3.5" fill="#5DDE35" />
            </svg>
          </div>

          {/* Orders */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Orders</p>
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/30 border border-border text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{o.id}</span>
                  <span className="text-muted-foreground">{o.store}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCls[o.status]}`}>{o.status}</span>
                  <span className="font-bold">{o.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom-right notification */}
      <div className="absolute -bottom-6 -right-8 z-10 bg-card border border-primary/30 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 animate-float-slow [animation-delay:1.5s]">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold leading-tight">Refund Confirmed</p>
          <p className="text-[11px] text-muted-foreground">€22.00 recovered</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <LandingNav />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 -z-10 hero-grid opacity-50" />
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-primary/12 blur-[140px] -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/6 blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8 animate-fade-in-up">
            <Badge variant="outline" className="w-fit border-primary/50 text-primary bg-primary/5 px-3 py-1 text-xs font-semibold gap-1.5">
              <Zap className="w-3 h-3" />
              Stop leaving money on the table
            </Badge>

            <h1 className="text-[clamp(2.75rem,6vw,4.75rem)] font-black tracking-tight leading-[1.05]">
              Get back every{" "}
              <span className="relative inline-block">
                <span className="text-primary">euro</span>
                <svg className="absolute -bottom-1 left-0 w-full text-primary" height="8" viewBox="0 0 80 8" preserveAspectRatio="none" fill="none">
                  <path d="M2 6 Q 20 1 40 6 Q 60 11 78 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>{" "}
              Uber{" "}
              <span className="text-primary">owes you</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              SmartKitchen automatically handles your cancelled and disputed Uber Eats
              orders — tracking, emailing, and recovering refunds so you never have to.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all text-base font-bold px-8">
                  Start for Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="gap-2 text-base font-semibold px-8 hover:-translate-y-0.5 transition-transform">
                  See Features
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2.5">
                {["Y", "M", "S", "R"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                    {l}
                  </div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <span>Trusted by <strong className="text-foreground">1,200+</strong> restaurants</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center px-6 py-10">
            <DashboardMockup />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-muted-foreground/40">
          <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full bg-current animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-black text-primary mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 mb-4 font-semibold">
              Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Built for restaurant owners,{" "}
              <span className="text-primary">not accountants</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to stop losing money on disputed orders — without lifting a finger.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1.5">
                <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-lg mb-2 leading-snug">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                <ChevronRight className="absolute bottom-6 right-6 w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ════════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-muted/20" />
        <div className="absolute inset-0 -z-10 hero-grid opacity-25" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              The old way vs{" "}
              <span className="text-primary">the smart way</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See why 1,200+ restaurants switched to SmartKitchen.
            </p>
          </div>

          {/* Comparison cards */}
          <div className="relative grid lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-0 items-stretch">

            {/* WITHOUT card */}
            <div className="flex flex-col rounded-2xl lg:rounded-r-none border border-border bg-card overflow-hidden">
              <div className="px-7 py-5 border-b border-border bg-muted/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <span className="font-bold text-base">Without SmartKitchen</span>
              </div>
              <ul className="flex flex-col gap-0 flex-1 p-2">
                {WITHOUT.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-4 rounded-xl text-sm text-muted-foreground">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                      <XCircle className="w-3 h-3 text-rose-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* VS divider */}
            <div className="hidden lg:flex flex-col items-center justify-center w-16 relative z-10">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border" />
              <div className="relative w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-md">
                <span className="text-[11px] font-black text-muted-foreground">VS</span>
              </div>
            </div>
            {/* Mobile VS */}
            <div className="flex lg:hidden items-center justify-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-black text-muted-foreground px-3 py-1.5 rounded-full border border-border bg-background">VS</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* WITH card */}
            <div className="flex flex-col rounded-2xl lg:rounded-l-none border border-primary/30 bg-card overflow-hidden relative">
              {/* Green top glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="px-7 py-5 border-b border-primary/15 bg-primary/5 flex items-center gap-3 relative">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-base">With SmartKitchen</span>
                <Badge className="ml-auto text-[10px] px-2 py-0.5 h-auto bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                  Recommended
                </Badge>
              </div>
              <ul className="flex flex-col gap-0 flex-1 p-2 relative">
                {WITH.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-4 rounded-xl text-sm hover:bg-primary/5 transition-colors">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-primary overflow-hidden text-center px-8 py-20 lg:py-24">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(0,0,0,0.18)_100%)] pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-black text-primary-foreground mb-4 tracking-tight max-w-2xl mx-auto">
                Start recovering your money today
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-10 max-w-lg mx-auto">
                Join over 1,200 restaurant owners who never lose a refund again.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-2 font-bold px-10 text-base shadow-2xl hover:-translate-y-0.5 transition-transform">
                    Create Free Account <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 px-10 text-base font-semibold">
                    Log In
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-primary-foreground/70">
                {["No credit card required", "Free forever plan", "24/7 support"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-border mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo width={28} height={28} className="rounded-lg overflow-hidden shrink-0" />
              <span className="font-extrabold text-base tracking-tight">
                Smart<span className="text-primary">Kitchen</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground order-last md:order-none text-center">
              © {new Date().getFullYear()} SmartKitchen. All rights reserved.
            </p>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              {["Privacy", "Terms", "Contact"].map((label) => (
                <Link key={label} href="#" className="hover:text-foreground transition-colors">{label}</Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
