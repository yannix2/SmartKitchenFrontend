"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, Zap, Shield, Mail, FileText, Activity, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/provider";

const MONTHLY_PRICE   = 49; // [TODO: confirm real price] — €/month
const TRIAL_DAYS      = 3;
const COMMISSION_CONT = 20;
const COMMISSION_CAN  = 15;

export default function PricingPage() {
  const t = useT({
    fr: {
      eyebrow: "Tarifs",
      title: "Simple. Transparent. Sans surprise.",
      lead: "Inscription gratuite, 3 jours d'essai, puis un abonnement mensuel. Annulation à tout moment.",
      plan_name: "Abonnement Pro",
      plan_tagline: "Tout ce qu'il vous faut pour récupérer chaque euro.",
      per_month: "/mois",
      trial_badge: `${TRIAL_DAYS} jours d'essai gratuit`,
      cta: "Commencer l'essai gratuit",
      cta_sub: "Aucune carte bancaire requise pour l'essai.",
      included_title: "Inclus dans l'abonnement",
      f1: "Détection automatique des commandes annulées et contestées",
      f2: "Envoi automatique des emails de demande de remboursement",
      f3: "Suivi en temps réel des refunds reçus",
      f4: "Tableau de bord avec graphiques et exports",
      f5: "Multi-stores Uber Eats illimités",
      f6: "Justificatifs et documents KYC chiffrés",
      f7: "Support email prioritaire (réponse < 24h)",
      f8: "Mises à jour produit incluses",
      commission_title: "Commission sur les récupérations",
      commission_body: "En plus de l'abonnement, nous prenons une petite commission uniquement sur les montants effectivement récupérés. Aucune récupération = aucune commission.",
      contested_label: "Sur commandes contestées remboursées",
      cancelled_label: "Sur commandes annulées remboursées",
      faq_title: "Questions fréquentes",
      q1: "Puis-je annuler à tout moment ?",
      a1: "Oui. L'abonnement se résilie en un clic depuis votre espace facturation. Aucun engagement, aucun frais d'annulation.",
      q2: "Et si SmartKitchen ne récupère rien ?",
      a2: "Vous payez uniquement l'abonnement. La commission ne s'applique qu'aux montants effectivement récupérés. Si nous ne récupérons rien, vous ne payez aucune commission.",
      q3: "Combien de stores Uber Eats puis-je connecter ?",
      a3: "Autant que vous voulez. L'abonnement est par compte SmartKitchen, pas par store.",
      q4: "Mes données sont-elles sécurisées ?",
      a4: "Absolument. Données chiffrées, stockage en Europe, conformité RGPD. Vos documents KYC sont traités selon les normes bancaires et ne sont jamais partagés.",
      q5: "Comment vous récupérez les remboursements ?",
      a5: "Nous détectons quotidiennement les commandes éligibles depuis vos rapports Uber, générons les justificatifs, et envoyons les demandes de remboursement officielles à Uber. Uber rembourse directement votre compte — nous ne touchons jamais à votre argent.",
    },
    en: {
      eyebrow: "Pricing",
      title: "Simple. Transparent. No surprises.",
      lead: "Free signup, 3-day trial, then a monthly subscription. Cancel anytime.",
      plan_name: "Pro plan",
      plan_tagline: "Everything you need to recover every euro.",
      per_month: "/month",
      trial_badge: `${TRIAL_DAYS}-day free trial`,
      cta: "Start free trial",
      cta_sub: "No credit card required for the trial.",
      included_title: "Included in the subscription",
      f1: "Automatic detection of cancelled and contested orders",
      f2: "Automatic refund-request email sending",
      f3: "Real-time tracking of refunds received",
      f4: "Dashboard with charts and exports",
      f5: "Unlimited Uber Eats stores",
      f6: "Encrypted evidence and KYC documents",
      f7: "Priority email support (< 24h response)",
      f8: "Product updates included",
      commission_title: "Recovery commission",
      commission_body: "On top of the subscription, we take a small commission only on amounts we actually recover for you. No recovery = no commission.",
      contested_label: "On contested orders refunded",
      cancelled_label: "On cancelled orders refunded",
      faq_title: "Frequently asked",
      q1: "Can I cancel anytime?",
      a1: "Yes. Cancel in one click from your billing page. No commitment, no cancellation fee.",
      q2: "What if SmartKitchen doesn't recover anything?",
      a2: "You only pay the subscription. The commission applies only to amounts actually recovered. No recovery = no commission.",
      q3: "How many Uber Eats stores can I connect?",
      a3: "As many as you want. The subscription is per SmartKitchen account, not per store.",
      q4: "Is my data secure?",
      a4: "Absolutely. Encrypted data, EU hosting, GDPR-compliant. Your KYC documents are handled to banking standards and never shared.",
      q5: "How do you actually recover refunds?",
      a5: "We detect eligible orders daily from your Uber reports, generate the evidence, and send official refund requests to Uber. Uber pays your account directly — we never touch your money.",
    },
  });

  const features = [t.f1, t.f2, t.f3, t.f4, t.f5, t.f6, t.f7, t.f8];
  const faqs = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 },
    { q: t.q4, a: t.a4 },
    { q: t.q5, a: t.a5 },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-10 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> {t.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">{t.title}</h1>
          <p className="text-lg text-muted-foreground">{t.lead}</p>
        </div>
      </section>

      {/* Pricing card */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl border-2 border-primary bg-card p-8 sm:p-10 shadow-xl shadow-primary/10 animate-scale-in">
            {/* Trial badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-widest shadow-md">
              <Sparkles className="w-3 h-3" /> {t.trial_badge}
            </div>

            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-black tracking-tight">{t.plan_name}</h2>
              <p className="text-sm text-muted-foreground">{t.plan_tagline}</p>
            </div>

            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-6xl font-black tracking-tight tabular-nums">{MONTHLY_PRICE}</span>
              <span className="text-2xl font-bold">€</span>
              <span className="text-sm text-muted-foreground ml-1">{t.per_month}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mb-8 opacity-60">[TODO: confirmer le prix réel]</p>

            <Link href="/register" className="block">
              <Button size="lg" className="w-full gap-2 font-bold shadow-lg shadow-primary/30 press-scale h-12 text-base">
                {t.cta} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-[11px] text-muted-foreground text-center mt-3">{t.cta_sub}</p>

            {/* Features */}
            <div className="mt-10 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.included_title}</p>
              <ul className="space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Commission */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-card/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tight">{t.commission_title}</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{t.commission_body}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto" data-stagger-cards>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
              <p className="text-5xl font-black text-amber-500 tabular-nums">{COMMISSION_CONT}<span className="text-xl">%</span></p>
              <p className="text-xs text-muted-foreground mt-2">{t.contested_label}</p>
            </div>
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6 text-center">
              <p className="text-5xl font-black text-sky-500 tabular-nums">{COMMISSION_CAN}<span className="text-xl">%</span></p>
              <p className="text-xs text-muted-foreground mt-2">{t.cancelled_label}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-black tracking-tight text-center">{t.faq_title}</h2>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
                  <span className="font-semibold text-sm">{item.q}</span>
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-open:bg-primary group-open:text-primary-foreground transition-all">
                    <span className="group-open:rotate-45 transition-transform">+</span>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 text-center space-y-5">
          <h2 className="text-3xl font-black tracking-tight">{t.cta}</h2>
          <p className="text-sm text-muted-foreground">{t.cta_sub}</p>
          <Link href="/register" className="inline-block">
            <Button size="lg" className="gap-2 font-bold shadow-lg shadow-primary/30 press-scale">
              {t.cta} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
