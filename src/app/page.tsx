"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/layout/landing-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { FeedbacksMarquee } from "@/components/landing/feedbacks-marquee";
import { useT } from "@/i18n/provider";
import {
  ArrowRight, BarChart3, CheckCircle2, ChevronRight,
  Mail, RefreshCcw, Shield, Star, Store, TrendingUp, Zap, XCircle,
} from "lucide-react";

function DashboardMockup({ recovered, recoveredLabel }: { recovered: string; recoveredLabel: string }) {
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
      <div className="absolute -top-5 -left-8 z-10 bg-card border border-border shadow-xl rounded-2xl px-4 py-3 animate-float-slow">
        <p className="text-[10px] text-muted-foreground">{recoveredLabel}</p>
        <p className="text-xl font-black text-primary leading-tight">+{recovered}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="ml-2 text-[11px] font-mono text-muted-foreground">smartkitchen — dashboard</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2">
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
    </div>
  );
}

export default function LandingPage() {
  const t = useT({
    fr: {
      hero_badge: "Arrêtez de laisser de l'argent sur la table",
      hero_h1_a: "Récupérez chaque",
      hero_h1_euro: "euro",
      hero_h1_b: "qu'Uber",
      hero_h1_c: "vous doit",
      hero_lead: "SmartKitchen gère automatiquement vos commandes annulées et contestées sur Uber Eats — détection, emails, récupération des remboursements, sans aucune intervention.",
      cta_start: "Commencer gratuitement",
      cta_features: "Voir les fonctionnalités",
      trusted: "Plus de 1 200 restaurants nous font confiance",
      stat_recovered: "Récupérés pour les restaurateurs",
      stat_active: "Restaurants actifs",
      stat_email: "Taux de succès des emails",
      stat_response: "Temps de réponse moyen",
      features_badge: "Fonctionnalités",
      features_t_a: "Conçu pour les restaurateurs,",
      features_t_b: "pas pour les comptables",
      features_lead: "Tout ce qu'il vous faut pour cesser de perdre de l'argent — sans lever le petit doigt.",
      f1_t: "Tous vos restaurants, un seul endroit",
      f1_d: "Gérez chaque restaurant depuis un tableau de bord unique. Plus besoin de jongler entre comptes.",
      f2_t: "Toujours à jour",
      f2_d: "Vos commandes restent fraîches automatiquement. Annulées et contestées sont signalées instantanément.",
      f3_t: "Sachez ce qu'on vous doit",
      f3_d: "Voyez exactement quels remboursements Uber a renvoyés et lesquels sont encore en attente.",
      f4_t: "Emails en pilote automatique",
      f4_d: "Les demandes de remboursement partent vers Uber Support automatiquement, avec les bonnes pièces jointes.",
      f5_t: "Justificatifs prêts",
      f5_d: "Importez vos preuves une fois. SmartKitchen attache la bonne pièce à la bonne commande, automatiquement.",
      f6_t: "Suivez chaque récupération",
      f6_d: "Statut en temps réel pour chaque commande contestée — de l'attente à l'argent sur votre compte.",
      compare_t_a: "L'ancienne méthode contre",
      compare_t_b: "la méthode intelligente",
      compare_lead: "Pourquoi 1 200+ restaurants ont choisi SmartKitchen.",
      without: "Sans SmartKitchen",
      with: "Avec SmartKitchen",
      recommended: "Recommandé",
      w0: "Fouiller les rapports Uber à la main",
      w1: "Écrire les emails de remboursement un par un",
      w2: "Aucune visibilité sur ce qui a été remboursé",
      w3: "Délais de justificatifs ratés",
      w4: "Des heures perdues chaque semaine",
      ww0: "Commandes détectées et signalées automatiquement",
      ww1: "Emails de remboursement en lot, en un clic",
      ww2: "Statut en direct sur chaque commande contestée",
      ww3: "Justificatifs joints automatiquement",
      ww4: "Quelques minutes au lieu d'heures",
      cta_h2: "Commencez à récupérer votre argent dès aujourd'hui",
      cta_lead: "Rejoignez plus de 1 200 restaurateurs qui ne perdent plus jamais un remboursement.",
      cta_create: "Créer un compte gratuit",
      cta_login: "Se connecter",
      bullet_no_card: "Aucune carte bancaire requise",
      bullet_free: "Plan gratuit pour toujours",
      bullet_support: "Support 24/7",
      mockup_recovered_label: "Récupéré ce mois",
    },
    en: {
      hero_badge: "Stop leaving money on the table",
      hero_h1_a: "Get back every",
      hero_h1_euro: "euro",
      hero_h1_b: "Uber",
      hero_h1_c: "owes you",
      hero_lead: "SmartKitchen automatically handles your cancelled and disputed Uber Eats orders — tracking, emailing, and recovering refunds so you never have to.",
      cta_start: "Start for Free",
      cta_features: "See Features",
      trusted: "Trusted by 1,200+ restaurants",
      stat_recovered: "Recovered for Restaurants",
      stat_active: "Active Restaurants",
      stat_email: "Email Success Rate",
      stat_response: "Average Response Time",
      features_badge: "Features",
      features_t_a: "Built for restaurant owners,",
      features_t_b: "not accountants",
      features_lead: "Everything you need to stop losing money on disputed orders — without lifting a finger.",
      f1_t: "All Your Stores, One Place",
      f1_d: "Manage every restaurant from a single dashboard. No more switching between accounts.",
      f2_t: "Always Up to Date",
      f2_d: "Your order data stays fresh automatically. Cancelled and disputed orders are flagged instantly.",
      f3_t: "Know What You're Owed",
      f3_d: "See exactly which payments Uber has sent back and which are still outstanding.",
      f4_t: "Emails on Autopilot",
      f4_d: "Refund requests go out to Uber support automatically, with the right attachments, every time.",
      f5_t: "Evidence Ready",
      f5_d: "Upload your proof images once. SmartKitchen attaches the right file to the right order automatically.",
      f6_t: "Track Every Recovery",
      f6_d: "Live status for every disputed order — from pending all the way to money back in your account.",
      compare_t_a: "The old way vs",
      compare_t_b: "the smart way",
      compare_lead: "See why 1,200+ restaurants switched to SmartKitchen.",
      without: "Without SmartKitchen",
      with: "With SmartKitchen",
      recommended: "Recommended",
      w0: "Digging through Uber reports by hand",
      w1: "Writing refund emails one by one",
      w2: "No idea which orders were reimbursed",
      w3: "Missing proof upload deadlines",
      w4: "Hours lost every week",
      ww0: "Orders tracked and flagged automatically",
      ww1: "Bulk refund emails sent with one click",
      ww2: "Live status on every disputed order",
      ww3: "Proof images attached automatically",
      ww4: "Minutes of work, not hours",
      cta_h2: "Start recovering your money today",
      cta_lead: "Join over 1,200 restaurant owners who never lose a refund again.",
      cta_create: "Create Free Account",
      cta_login: "Log In",
      bullet_no_card: "No credit card required",
      bullet_free: "Free forever plan",
      bullet_support: "24/7 support",
      mockup_recovered_label: "Monthly Recovery",
    },
  });

  const features = [
    { icon: Store,       title: t.f1_t, description: t.f1_d, iconColor: "text-primary",     iconBg: "bg-primary/10"     },
    { icon: RefreshCcw,  title: t.f2_t, description: t.f2_d, iconColor: "text-sky-500",     iconBg: "bg-sky-500/10"     },
    { icon: BarChart3,   title: t.f3_t, description: t.f3_d, iconColor: "text-violet-500",  iconBg: "bg-violet-500/10"  },
    { icon: Mail,        title: t.f4_t, description: t.f4_d, iconColor: "text-orange-500",  iconBg: "bg-orange-500/10"  },
    { icon: Shield,      title: t.f5_t, description: t.f5_d, iconColor: "text-pink-500",    iconBg: "bg-pink-500/10"    },
    { icon: TrendingUp,  title: t.f6_t, description: t.f6_d, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  ];

  const stats = [
    { value: "€2M+",   label: t.stat_recovered },
    { value: "1,200+", label: t.stat_active    },
    { value: "98%",    label: t.stat_email     },
    { value: "24 h",   label: t.stat_response  },
  ];

  const without = [t.w0, t.w1, t.w2, t.w3, t.w4];
  const withh   = [t.ww0, t.ww1, t.ww2, t.ww3, t.ww4];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <LandingNav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 -z-10 hero-grid opacity-50" />
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-primary/12 blur-[140px] -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/6 blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8 animate-fade-in-up">

            <h1 className="text-[clamp(2.75rem,6vw,4.75rem)] font-black tracking-tight leading-[1.05]">
              {t.hero_h1_a}{" "}
              <span className="relative inline-block">
                <span className="text-primary">{t.hero_h1_euro}</span>
                <svg className="absolute -bottom-1 left-0 w-full text-primary" height="8" viewBox="0 0 80 8" preserveAspectRatio="none" fill="none">
                  <path d="M2 6 Q 20 1 40 6 Q 60 11 78 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>{" "}
              {t.hero_h1_b} <span className="text-primary">{t.hero_h1_c}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">{t.hero_lead}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all text-base font-bold px-8">
                  {t.cta_start} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="gap-2 text-base font-semibold px-8 hover:-translate-y-0.5 transition-transform">
                  {t.cta_features}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2.5">
                {["Y", "M", "S", "R"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-[11px] font-bold text-primary-foreground">{l}</div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
              </div>
              <span>{t.trusted}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center px-6 py-10">
            <DashboardMockup recovered="€2,340" recoveredLabel={t.mockup_recovered_label} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-black text-primary mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 mb-4 font-semibold">{t.features_badge}</Badge>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              {t.features_t_a}{" "}<span className="text-primary">{t.features_t_b}</span>
            </h2>
            <p className="text-lg text-muted-foreground">{t.features_lead}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
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

      {/* COMPARISON */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-muted/20" />
        <div className="absolute inset-0 -z-10 hero-grid opacity-25" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              {t.compare_t_a}{" "}<span className="text-primary">{t.compare_t_b}</span>
            </h2>
            <p className="text-lg text-muted-foreground">{t.compare_lead}</p>
          </div>
          <div className="relative grid lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-0 items-stretch">
            <div className="flex flex-col rounded-2xl lg:rounded-r-none border border-border bg-card overflow-hidden">
              <div className="px-7 py-5 border-b border-border bg-muted/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center"><XCircle className="w-4 h-4 text-rose-500" /></div>
                <span className="font-bold text-base">{t.without}</span>
              </div>
              <ul className="flex flex-col gap-0 flex-1 p-2">
                {without.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-4 rounded-xl text-sm text-muted-foreground">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0"><XCircle className="w-3 h-3 text-rose-400" /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center w-16 relative z-10">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border" />
              <div className="relative w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-md"><span className="text-[11px] font-black text-muted-foreground">VS</span></div>
            </div>
            <div className="flex lg:hidden items-center justify-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-black text-muted-foreground px-3 py-1.5 rounded-full border border-border bg-background">VS</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-col rounded-2xl lg:rounded-l-none border border-primary/30 bg-card overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="px-7 py-5 border-b border-primary/15 bg-primary/5 flex items-center gap-3 relative">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-primary" /></div>
                <span className="font-bold text-base">{t.with}</span>
                <Badge className="ml-auto text-[10px] px-2 py-0.5 h-auto bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">{t.recommended}</Badge>
              </div>
              <ul className="flex flex-col gap-0 flex-1 p-2 relative">
                {withh.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-4 rounded-xl text-sm hover:bg-primary/5 transition-colors">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0"><CheckCircle2 className="w-3 h-3 text-primary" /></span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-primary overflow-hidden text-center px-8 py-20 lg:py-24">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(0,0,0,0.18)_100%)] pointer-events-none" />
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-black text-primary-foreground mb-4 tracking-tight max-w-2xl mx-auto">{t.cta_h2}</h2>
              <p className="text-primary-foreground/80 text-lg mb-10 max-w-lg mx-auto">{t.cta_lead}</p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-2 font-bold px-10 text-base shadow-2xl hover:-translate-y-0.5 transition-transform">
                    {t.cta_create} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 px-10 text-base font-semibold">
                    {t.cta_login}
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-primary-foreground/70">
                {[t.bullet_no_card, t.bullet_free, t.bullet_support].map((txt) => (
                  <div key={txt} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />{txt}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeedbacksMarquee />

      <SiteFooter />
    </div>
  );
}
