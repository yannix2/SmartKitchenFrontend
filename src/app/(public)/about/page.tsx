"use client";

import Link from "next/link";
import { Sparkles, Target, Zap, Shield, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useT } from "@/i18n/provider";

export default function AboutPage() {
  const t = useT({
    fr: {
      eyebrow: "À propos",
      title: "Récupérez chaque euro qu'Uber Eats vous doit.",
      lead: "SmartKitchen détecte automatiquement les commandes annulées et contestées sur tous vos comptes Uber Eats, dépose les demandes de remboursement à votre place, et vous rend ce qui vous appartient — sans aucune intervention de votre part.",
      mission_title: "Notre mission",
      mission_body: "Les restaurateurs perdent en moyenne 8 à 15 % de leur chiffre Uber Eats à cause de commandes annulées, contestées ou jamais facturées. Cet argent est récupérable — mais le processus est long, manuel et complexe. SmartKitchen automatise tout : détection, justificatifs, emails de réclamation, suivi. Vous vous occupez de votre restaurant. Nous nous occupons des refunds.",
      stat_recovered_label: "Récupérés pour nos restaurateurs",
      stat_stores_label: "Restaurants partenaires",
      stat_recovery_label: "Taux de récupération moyen",
      values_title: "Pourquoi SmartKitchen ?",
      v1_title: "Automatisation totale",
      v1_body: "Connectez vos comptes Uber Eats une fois — nous détectons et traitons chaque refund tous les jours, sans que vous leviez le petit doigt.",
      v2_title: "Conforme RGPD",
      v2_body: "Vos données et celles de vos clients sont chiffrées, stockées en Europe, et jamais partagées. Documents KYC traités selon les normes bancaires.",
      v3_title: "Vous ne payez que sur résultat",
      v3_body: "Aucun frais d'installation. Une commission uniquement sur les montants effectivement récupérés.",
      cta_title: "Prêt à arrêter de perdre de l'argent ?",
      cta_body: "Inscription gratuite. 3 jours d'essai. Annulation à tout moment.",
      cta_button: "Commencer maintenant",
      cta_contact: "Nous contacter",
    },
    en: {
      eyebrow: "About",
      title: "Recover every euro Uber Eats owes you.",
      lead: "SmartKitchen automatically detects cancelled and contested orders across all your Uber Eats stores, files refund claims on your behalf, and gets your money back — without you lifting a finger.",
      mission_title: "Our mission",
      mission_body: "Restaurant owners lose on average 8–15% of their Uber Eats revenue to cancelled, contested, or never-invoiced orders. That money is recoverable — but the process is slow, manual, and complex. SmartKitchen automates everything: detection, evidence, claim emails, follow-up. You run your restaurant. We chase the refunds.",
      stat_recovered_label: "Recovered for our restaurants",
      stat_stores_label: "Partner restaurants",
      stat_recovery_label: "Average recovery rate",
      values_title: "Why SmartKitchen?",
      v1_title: "Fully automated",
      v1_body: "Connect your Uber Eats accounts once — we detect and process every refund every day, completely hands-off.",
      v2_title: "GDPR-compliant",
      v2_body: "Your data and your customers' data is encrypted, hosted in Europe, and never shared. KYC documents handled to banking standards.",
      v3_title: "You only pay on results",
      v3_body: "No setup fees. A commission only on amounts we actually recover.",
      cta_title: "Ready to stop losing money?",
      cta_body: "Free signup. 3-day trial. Cancel anytime.",
      cta_button: "Get started",
      cta_contact: "Contact us",
    },
  });

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> {t.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">{t.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">{t.lead}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6" data-stagger-cards>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <p className="text-4xl font-black text-primary tabular-nums">
              <AnimatedCounter value={500000} decimals={0} suffix=" €" />
            </p>
            <p className="text-xs text-muted-foreground mt-2">{t.stat_recovered_label} <span className="text-[10px] block opacity-60">[TODO: real number]</span></p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-4xl font-black tabular-nums">
              <AnimatedCounter value={200} decimals={0} suffix="+" />
            </p>
            <p className="text-xs text-muted-foreground mt-2">{t.stat_stores_label} <span className="text-[10px] block opacity-60">[TODO]</span></p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-4xl font-black tabular-nums">
              <AnimatedCounter value={92} decimals={0} suffix="%" />
            </p>
            <p className="text-xs text-muted-foreground mt-2">{t.stat_recovery_label} <span className="text-[10px] block opacity-60">[TODO]</span></p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-card/30">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">{t.mission_title}</h2>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">{t.mission_body}</p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-3xl font-black tracking-tight text-center">{t.values_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-stagger-cards>
            {[
              { icon: Zap,    title: t.v1_title, body: t.v1_body, color: "amber"   },
              { icon: Shield, title: t.v2_title, body: t.v2_body, color: "primary" },
              { icon: Sparkles, title: t.v3_title, body: t.v3_body, color: "violet" },
            ].map(({ icon: Icon, title, body, color }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 space-y-3 row-hover-lift hover:border-primary/30 hover:shadow-md transition-all">
                <div className={
                  color === "amber"   ? "w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center" :
                  color === "violet"  ? "w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center" :
                  "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                }>
                  <Icon className={
                    color === "amber"  ? "w-5 h-5 text-amber-500" :
                    color === "violet" ? "w-5 h-5 text-violet-500" :
                    "w-5 h-5 text-primary"
                  } />
                </div>
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 text-center space-y-5">
          <h2 className="text-3xl font-black tracking-tight">{t.cta_title}</h2>
          <p className="text-sm text-muted-foreground">{t.cta_body}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="gap-2 font-bold shadow-lg shadow-primary/30 press-scale">
                {t.cta_button} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="gap-2 press-scale">
                <Mail className="w-4 h-4" /> {t.cta_contact}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
