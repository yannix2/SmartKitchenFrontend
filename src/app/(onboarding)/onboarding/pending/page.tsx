"use client";

import { useEffect, useState } from "react";
import { Clock, Phone, CheckCircle2, XCircle, Loader2, LogOut, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import { api, clearTokens } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { OnboardingStatus } from "@/types";

export default function OnboardingPendingPage() {
  const router = useRouter();
  const t = useT({
    fr: {
      logout: "Déconnexion",
      not_started_t: "Candidature non démarrée",
      not_started_m: "Veuillez compléter le formulaire d'inscription pour continuer.",
      pending_call_t: "Nous avons reçu votre candidature !",
      pending_call_m: "Notre équipe vous appellera à l'horaire choisi pour vous présenter SmartKitchen, expliquer notre fonctionnement et confirmer votre compte. Vous serez notifié par email dès l'approbation.",
      pending_approval_t: "Appel terminé — examen en cours",
      pending_approval_m: "Notre équipe vous a contacté et finalise l'approbation de votre compte. Vous recevrez un email sous peu.",
      approved_t: "Votre compte a été approuvé !",
      approved_m: "Bienvenue chez SmartKitchen. Cliquez ci-dessous pour accéder à votre tableau de bord.",
      rejected_t: "Candidature non approuvée",
      rejected_lead: "Malheureusement, votre candidature n'a pas été approuvée pour le moment.",
      reason: "Raison :",
      contact_support: "Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support.",
      go_dashboard: "Aller au tableau de bord",
      progress_title: "Progression de la candidature",
      step_received: "Candidature reçue",
      step_call: "Appel d'inscription effectué",
      step_approved: "Compte approuvé",
      in_progress: "En cours…",
      what_to_expect: "À quoi s'attendre",
      expect_1: "Notre agent vous appellera pour présenter SmartKitchen et expliquer le fonctionnement.",
      expect_2: "Il vous présentera l'accord, les commissions et nos besoins.",
      expect_3: "Une fois approuvé, vous accédez au tableau de bord et pouvez vous abonner.",
      check_updates: "Vérifier les mises à jour",
    },
    en: {
      logout: "Log out",
      not_started_t: "Application not started",
      not_started_m: "Please complete the onboarding form to proceed.",
      pending_call_t: "We received your application!",
      pending_call_m: "Our team will call you at your preferred time to walk you through SmartKitchen, explain how we work, and confirm your account. You'll be notified by email as soon as you're approved.",
      pending_approval_t: "Call completed — review in progress",
      pending_approval_m: "Our team has spoken with you and is finalising your account approval. You'll receive an email shortly.",
      approved_t: "Your account has been approved!",
      approved_m: "Welcome to SmartKitchen. Click below to go to your dashboard and get started.",
      rejected_t: "Application not approved",
      rejected_lead: "Unfortunately your application was not approved at this time.",
      reason: "Reason:",
      contact_support: "If you believe this is an error, please contact our support team.",
      go_dashboard: "Go to dashboard",
      progress_title: "Application progress",
      step_received: "Application received",
      step_call: "Onboarding call done",
      step_approved: "Account approved",
      in_progress: "In progress…",
      what_to_expect: "What to expect",
      expect_1: "Our agent will call you to introduce SmartKitchen and explain how refund recovery works.",
      expect_2: "They will walk you through our agreement, commission rates, and what we need from you.",
      expect_3: "Once approved, you get full dashboard access and can subscribe to activate your account.",
      check_updates: "Check for updates",
    },
  });

  const STATUS_CONFIG: Record<OnboardingStatus, {
    icon: React.ElementType; color: string; bg: string; border: string;
    title: string; message: string;
  }> = {
    not_started:      { icon: Clock,        color: "text-muted-foreground", bg: "bg-muted",           border: "border-border",           title: t.not_started_t,      message: t.not_started_m      },
    pending_call:     { icon: Phone,        color: "text-sky-500",          bg: "bg-sky-500/10",      border: "border-sky-500/20",       title: t.pending_call_t,     message: t.pending_call_m     },
    pending_approval: { icon: Clock,        color: "text-amber-500",        bg: "bg-amber-500/10",    border: "border-amber-500/20",     title: t.pending_approval_t, message: t.pending_approval_m },
    approved:         { icon: CheckCircle2, color: "text-emerald-500",      bg: "bg-emerald-500/10",  border: "border-emerald-500/20",   title: t.approved_t,         message: t.approved_m         },
    rejected:         { icon: XCircle,      color: "text-destructive",      bg: "bg-destructive/10",  border: "border-destructive/20",   title: t.rejected_t,         message: ""                   },
  };

  const STEPS = [
    { key: "pending_call",     label: t.step_received },
    { key: "pending_approval", label: t.step_call     },
    { key: "approved",         label: t.step_approved },
  ];

  const [status, setStatus]   = useState<OnboardingStatus>("pending_call");
  const [reason, setReason]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchStatus(showSpinner = false) {
    if (showSpinner) setRefreshing(true);
    try {
      const d = await api.get<{ onboarding_status: OnboardingStatus; rejection_reason: string | null }>("/onboarding/status");
      setStatus(d.onboarding_status);
      setReason(d.rejection_reason);
      if (d.onboarding_status === "approved") setTimeout(() => router.push("/dashboard"), 1500);
      if (d.onboarding_status === "not_started") router.push("/onboarding/form");
    } catch { /* */ }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { fetchStatus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_call;
  const Icon = cfg.icon;
  const currentStep = STEPS.findIndex((x) => x.key === status);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-6 py-4 flex items-center gap-3">
        <Logo width={28} height={28} className="rounded-lg overflow-hidden" />
        <span className="font-extrabold text-sm tracking-tight">
          Smart<span className="text-primary">Kitchen</span>
        </span>
        <button
          onClick={() => { clearTokens(); router.push("/login"); }}
          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> {t.logout}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8 animate-fade-in-up">
          <div className={cn("rounded-3xl border p-8 text-center space-y-4", cfg.bg, cfg.border)}>
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", cfg.bg, cfg.border, "border-2")}>
              <Icon className={cn("w-8 h-8", cfg.color)} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-2">{cfg.title}</h1>
              {status === "rejected" ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t.rejected_lead}</p>
                  {reason && (
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-left">
                      <span className="font-semibold">{t.reason} </span>{reason}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{t.contact_support}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{cfg.message}</p>
              )}
            </div>

            {status === "approved" && (
              <Button onClick={() => router.push("/dashboard")} className="gap-2 press-scale">
                <CheckCircle2 className="w-4 h-4" /> {t.go_dashboard}
              </Button>
            )}
          </div>

          {status !== "rejected" && status !== "not_started" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">{t.progress_title}</p>
              <div className="space-y-4">
                {STEPS.map((s, i) => {
                  const done = i < currentStep || status === "approved";
                  const active = i === currentStep && status !== "approved";
                  return (
                    <div key={s.key} className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                        done   ? "bg-primary text-primary-foreground" :
                        active ? "bg-primary/20 text-primary ring-2 ring-primary/30" :
                                 "bg-muted text-muted-foreground",
                      )}>
                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        done ? "text-foreground" : active ? "text-primary" : "text-muted-foreground",
                      )}>
                        {s.label}
                      </span>
                      {active && <span className="text-xs text-muted-foreground ml-auto animate-pulse">{t.in_progress}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(status === "pending_call" || status === "pending_approval") && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.what_to_expect}</p>
              {[["📞", t.expect_1], ["📋", t.expect_2], ["✅", t.expect_3]].map(([emoji, text]) => (
                <div key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0">{emoji}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          )}

          {status !== "approved" && status !== "rejected" && (
            <div className="text-center">
              <button
                onClick={() => fetchStatus(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCcw className={cn("w-3 h-3", refreshing && "animate-spin")} />
                {t.check_updates}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
