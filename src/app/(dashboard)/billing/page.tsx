"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2, CreditCard, Loader2, AlertCircle, Zap, Calendar,
  ShieldCheck, RefreshCcw, ExternalLink, XCircle, Lock, ShoppingBag,
  Store, Mail, BarChart3, FileText, Headphones, Sparkles, ArrowRight,
  Ban, Clock, Receipt, Download, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { BillingStatus, BillingPlan } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  number: string | null;
  status: string;
  amount_paid: number;
  currency: string;
  created: number;
  period_start: number | null;
  period_end: number | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

// ── Features list ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: ShoppingBag, label: "Cancelled order refund tracking",  desc: "Automatically detect and track all your cancelled orders eligible for refund" },
  { icon: ShoppingBag, label: "Contested order refund tracking",  desc: "Monitor contested orders and their merchant-covered refund amounts" },
  { icon: Mail,        label: "Automated refund email campaigns", desc: "We send refund request emails to Uber Eats on your behalf" },
  { icon: Store,       label: "Store performance dashboard",      desc: "Full overview of all your stores, statuses and recovery rates" },
  { icon: BarChart3,   label: "Monthly revenue reports",          desc: "See exactly how much we recovered for you each month" },
  { icon: Headphones,  label: "Priority support",                 desc: "Dedicated support team ready to help you maximize your refunds" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}

function fmtTs(ts: number | null | undefined) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("fr-FR");
}

// ── Sub status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, React.ReactNode> = {
    active:     <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15 font-semibold"><CheckCircle2 className="w-3 h-3" />Active</Badge>,
    cancelling: <Badge className="gap-1 bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/15 font-semibold"><Clock className="w-3 h-3" />Ends at period end</Badge>,
    past_due:   <Badge className="gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/15 font-semibold"><AlertCircle className="w-3 h-3" />Payment due</Badge>,
    cancelled:  <Badge className="gap-1 bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/10 font-semibold"><XCircle className="w-3 h-3" />Cancelled</Badge>,
    trialing:   <Badge className="gap-1 bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/15 font-semibold"><Zap className="w-3 h-3" />Trial</Badge>,
  };
  return (map[status] ?? <Badge variant="outline" className="gap-1 text-muted-foreground font-semibold"><XCircle className="w-3 h-3" />Inactive</Badge>) as React.ReactElement;
}

function InvoiceBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15 text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3" />Paid</Badge>;
  if (status === "open") return <Badge className="gap-1 bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/15 text-[10px] font-semibold"><AlertCircle className="w-3 h-3" />Open</Badge>;
  return <Badge variant="outline" className="text-[10px] text-muted-foreground capitalize">{status}</Badge>;
}

// ── Main ───────────────────────────────────────────────────────────────────────

function BillingContent() {
  const t = useT({
    fr: {
      title: "Facturation", subtitle: "Gérez votre abonnement SmartKitchen",
      refresh: "Actualiser", loading: "Chargement des informations…",
      welcome_pro: "Paiement réussi — bienvenue sur Pro !",
      sub_active: "Votre abonnement est maintenant actif. Toutes les fonctionnalités sont déverrouillées.",
      checkout_cancelled: "Le paiement a été annulé. Votre abonnement n'a pas été modifié.",
      pro_plan: "Plan Pro",
      unlock_t_a: "Débloquez votre", unlock_t_b: "potentiel de remboursement",
      unlock_lead: "SmartKitchen suit, réclame et surveille automatiquement chaque remboursement que vous devez sur Uber Eats — annulés, contestés, et plus.",
      per_month: "/ mois · renouvellement automatique",
      get_started: "Commencer —", cancel_anytime: "Annulation à tout moment · Sans frais cachés · Sécurisé par Stripe",
      sub_cancelled: "Votre abonnement est annulé",
      access_until: "Vous avez encore un accès complet jusqu'au", resub_after: "Vous pouvez vous abonner à nouveau après cette date.",
      sub_avail_after: "Abonnement disponible après",
    },
    en: {
      title: "Billing", subtitle: "Manage your SmartKitchen subscription",
      refresh: "Refresh", loading: "Loading billing info…",
      welcome_pro: "Payment successful — welcome to Pro!",
      sub_active: "Your subscription is now active. All features are unlocked.",
      checkout_cancelled: "Checkout was cancelled. Your subscription has not changed.",
      pro_plan: "Pro plan",
      unlock_t_a: "Unlock your full", unlock_t_b: "refund potential",
      unlock_lead: "SmartKitchen automatically tracks, claims and monitors every refund you're owed from Uber Eats — cancelled orders, contested items, and more.",
      per_month: "/ month · automatic renewal",
      get_started: "Get started —", cancel_anytime: "Cancel anytime · No hidden fees · Secured by Stripe",
      sub_cancelled: "Your subscription is cancelled",
      access_until: "You still have full access until", resub_after: "You can subscribe again after that date.",
      sub_avail_after: "Subscription available after",
    },
  });
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [billing, setBilling]                   = useState<BillingStatus | null>(null);
  const [plan, setPlan]                         = useState<BillingPlan | null>(null);
  const [invoices, setInvoices]                 = useState<Invoice[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [invoicesLoading, setInvoicesLoading]   = useState(false);
  const [actionLoading, setActionLoading]       = useState(false);
  const [error, setError]                       = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [activeTab, setActiveTab]               = useState("plan");

  const success   = searchParams.get("success")   === "1";
  const cancelled = searchParams.get("cancelled") === "1";

  // ── Data fetching ────────────────────────────────────────────────────────────

  async function loadBilling() {
    const [b, p] = await Promise.all([
      api.get<BillingStatus>("/billing/status"),
      api.get<{ plans: BillingPlan[] }>("/billing/plans"),
    ]);
    setBilling(b);
    setPlan(p.plans?.[0] ?? null);
  }

  async function fetchInvoices() {
    setInvoicesLoading(true);
    try {
      const d = await api.get<{ invoices: Invoice[] }>("/billing/invoices");
      setInvoices(d.invoices ?? []);
    } catch { setInvoices([]); }
    finally { setInvoicesLoading(false); }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        if (success) {
          try { await api.post("/billing/sync", {}); } catch { /* non-fatal */ }
        }
        await loadBilling();
      } catch {
        setError("Failed to load billing information.");
      } finally {
        setLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "invoices") fetchInvoices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function handleSubscribe() {
    setActionLoading(true); setError("");
    try {
      const { url } = await api.post<{ url: string }>("/billing/checkout", {});
      window.location.href = url;
    } catch (e: unknown) {
      setError((e as { detail?: string })?.detail ?? "Could not start checkout.");
      setActionLoading(false);
    }
  }

  async function handlePortal() {
    setActionLoading(true); setError("");
    try {
      const { url } = await api.get<{ url: string }>("/billing/portal");
      window.location.href = url;
    } catch {
      setError("Could not open billing portal. Please try again.");
      setActionLoading(false);
    }
  }

  async function handleRefresh() {
    setLoading(true); setError("");
    try {
      await loadBilling();
      if (billing?.is_subscribed && success) router.replace("/billing");
    } catch { setError("Failed to refresh."); }
    finally { setLoading(false); }
  }

  async function handleCancel() {
    setActionLoading(true); setError("");
    try {
      await api.post("/billing/cancel", {});
      await loadBilling();
      setShowCancelDialog(false);
    } catch (e: unknown) {
      setError((e as { detail?: string })?.detail ?? "Could not cancel. Please try again.");
      setShowCancelDialog(false);
    } finally { setActionLoading(false); }
  }

  async function handleReactivate() {
    setActionLoading(true); setError("");
    try {
      await api.post("/billing/reactivate", {});
      await loadBilling();
    } catch (e: unknown) {
      setError((e as { detail?: string })?.detail ?? "Could not reactivate. Please try again.");
    } finally { setActionLoading(false); }
  }

  // ── Derived state ────────────────────────────────────────────────────────────

  const status       = billing?.status ?? "inactive";
  const isActive     = status === "active";
  const isCancelling = status === "cancelling";
  const isPastDue    = status === "past_due";
  const isCancelled  = status === "cancelled";
  const isSubscribed = isActive || isCancelling || isPastDue;

  const price = plan?.price ?? 49.99;

  const daysUntilRenewal = billing?.plan?.expires_at
    ? Math.ceil((new Date(billing.plan.expires_at).getTime() - Date.now()) / 86_400_000)
    : null;
  const cancelLocked  = daysUntilRenewal !== null && daysUntilRenewal <= 3;
  const canResubscribe = billing?.can_resubscribe ?? false;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <CreditCard className="text-violet-500" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          {t.refresh}
        </Button>
      </div>

      {/* Banners */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t.welcome_pro}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.sub_active}</p>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted border border-border">
          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{t.checkout_cancelled}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t.loading}</p>
        </div>

      ) : !isSubscribed ? (
        /* ═══════════════════════════════════════════════════════════════════
           STATE A: No active subscription
           - If truly new (or expired): show full upgrade hero + subscribe btn
           - If cancelled but period not yet over (can_resubscribe=false):
             show a "you still have access until X" waiting screen
        ═══════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">

          {/* Cancelled-but-period-running notice */}
          {isCancelled && !canResubscribe && billing?.plan?.expires_at && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{t.sub_cancelled}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.access_until} <strong>{fmt(billing.plan.expires_at)}</strong>. {t.resub_after}
                </p>
              </div>
            </div>
          )}

          {/* Hero upgrade card */}
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-linear-to-br from-violet-500/10 via-violet-500/5 to-transparent p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 w-fit">
                  <Lock className="w-3 h-3 text-violet-500" />
                  <span className="text-xs font-bold text-violet-500 tracking-wide uppercase">{t.pro_plan}</span>
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    Unlock your full <span className="text-violet-500">refund potential</span>
                  </h2>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    SmartKitchen automatically tracks, claims and monitors every refund you&apos;re owed from Uber Eats — cancelled orders, contested items, and more.
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{price}€</span>
                  <span className="text-muted-foreground font-medium">/ month · automatic renewal</span>
                </div>

                {canResubscribe ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" className="gap-2 text-base font-bold px-8" onClick={handleSubscribe} disabled={actionLoading}>
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Get started — {price}€/month
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      Cancel anytime · No hidden fees · Secured by Stripe
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border w-fit">
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Subscription available after <strong>{fmt(billing?.plan?.expires_at)}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:shrink-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-violet-500/10 border border-violet-500/20 flex flex-col items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-violet-500 mb-1" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">One plan</p>
                  <p className="text-lg font-black mt-0.5">Everything</p>
                  <p className="text-[10px] text-muted-foreground">included</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">What&apos;s included</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="group rounded-2xl border border-border bg-card p-4 hover:border-violet-500/30 hover:bg-violet-500/3 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/15 transition-colors">
                      <Icon className="w-4 h-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-snug mb-0.5">{label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      ) : (
        /* ═══════════════════════════════════════════════════════════════════
           STATE B: Has a subscription (active / cancelling / past_due)
           — tabbed: Plan details + Invoices
        ═══════════════════════════════════════════════════════════════════ */
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9">
              <TabsTrigger value="plan" className="gap-1.5 text-xs">
                <CreditCard className="w-3.5 h-3.5" />Plan
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-1.5 text-xs">
                <Receipt className="w-3.5 h-3.5" />Invoices
              </TabsTrigger>
            </TabsList>

            {/* ── Plan tab ────────────────────────────────────────────────── */}
            <TabsContent value="plan" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Main plan card */}
                <div className={cn(
                  "lg:col-span-3 rounded-2xl border p-6 space-y-6",
                  isCancelling ? "border-orange-500/25 bg-orange-500/5"
                    : isActive  ? "border-emerald-500/25 bg-emerald-500/5"
                                : "border-amber-500/25 bg-amber-500/5"
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-black tracking-tight">{plan?.name ?? "Pro"} Plan</h2>
                        <StatusBadge status={status} />
                      </div>
                      <p className="text-sm text-muted-foreground">All SmartKitchen features included</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-4xl font-black">{price}<span className="text-base font-semibold text-muted-foreground ml-0.5">€</span></p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FEATURES.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Auto-renewal toggle info */}
                  <div className={cn(
                    "rounded-xl border p-3 flex items-start gap-2.5",
                    isCancelling ? "bg-orange-500/8 border-orange-500/20" : "bg-emerald-500/8 border-emerald-500/20"
                  )}>
                    {isCancelling
                      ? <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      : <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold mb-0.5", isCancelling ? "text-orange-600 dark:text-orange-400" : "text-emerald-700 dark:text-emerald-400")}>
                        {isCancelling ? "Auto-renewal is OFF" : "Auto-renewal is ON"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isCancelling
                          ? `Your subscription ends on ${fmt(billing?.plan?.expires_at)}. No further charges after that.`
                          : `Your subscription renews automatically on ${fmt(billing?.plan?.expires_at)}.`
                        }
                      </p>
                    </div>
                    {isCancelling && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                        onClick={handleReactivate}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                        Turn on
                      </Button>
                    )}
                  </div>

                  {/* Past due warning */}
                  {isPastDue && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Your last payment failed. Update your payment method to keep access to all features.
                      </p>
                    </div>
                  )}

                  {/* Cancel lock warning */}
                  {isActive && cancelLocked && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted border border-border">
                      <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Cancellation locked — renews in <strong>{daysUntilRenewal} day{daysUntilRenewal !== 1 ? "s" : ""}</strong>.
                        You can turn off auto-renewal after your next billing date.
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className={cn("flex-1 gap-2", isPastDue && "bg-amber-500 hover:bg-amber-600 text-white")}
                      variant={isPastDue ? "default" : "outline"}
                      onClick={handlePortal}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      {isPastDue ? "Fix payment method" : "Manage payment method"}
                    </Button>
                    {isActive && !cancelLocked && (
                      <Button
                        variant="outline"
                        className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={actionLoading}
                      >
                        <Ban className="w-4 h-4" />
                        Turn off auto-renewal
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-2 space-y-4">

                  {/* Details card */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <h3 className="text-sm font-semibold">Subscription details</h3>
                    <Row label="Status"><StatusBadge status={status} /></Row>
                    {billing?.plan?.started_at && (
                      <Row label="Started"><span className="text-xs font-semibold">{fmt(billing.plan.started_at)}</span></Row>
                    )}
                    {billing?.plan?.expires_at && (
                      <Row label={isCancelling ? "Access until" : "Next billing"}>
                        <span className={cn("text-xs font-semibold", isCancelling && "text-orange-600 dark:text-orange-400")}>
                          {fmt(billing.plan.expires_at)}
                        </span>
                      </Row>
                    )}
                    {billing?.plan?.price && (
                      <Row label="Amount">
                        <span className="text-sm font-black">
                          {billing.plan.price}{billing.plan.currency === "eur" ? "€" : ` ${billing.plan.currency}`}/mo
                        </span>
                      </Row>
                    )}
                    {daysUntilRenewal !== null && !isCancelling && (
                      <Row label="Days until renewal">
                        <span className={cn("text-xs font-semibold", daysUntilRenewal <= 3 ? "text-amber-500" : "")}>
                          {daysUntilRenewal} day{daysUntilRenewal !== 1 ? "s" : ""}
                        </span>
                      </Row>
                    )}
                    <Row label="Auto-renewal">
                      <span className={cn("text-xs font-bold", isCancelling ? "text-orange-500" : "text-emerald-600 dark:text-emerald-400")}>
                        {isCancelling ? "Off" : "On"}
                      </span>
                    </Row>
                  </div>

                  {/* Trust card */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5">
                          {isCancelling ? "No more charges" : "Automatic monthly billing"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isCancelling
                            ? "Your card will not be charged again. Access ends on the date shown above."
                            : "Your card is charged automatically each month. Turn off auto-renewal anytime to stop future charges."}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5">Secured by Stripe</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          We never store your card details. All payments are processed securely by Stripe.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Invoices tab ─────────────────────────────────────────────── */}
            <TabsContent value="invoices" className="mt-6">
              <div className="rounded-2xl border border-border overflow-hidden bg-card">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="col-span-4">Invoice</span>
                  <span className="col-span-3">Period</span>
                  <span className="col-span-2">Amount</span>
                  <span className="col-span-2">Status</span>
                  <span className="col-span-1 text-right">PDF</span>
                </div>

                {invoicesLoading ? (
                  <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm">Loading invoices…</p>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                    <Receipt className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No invoices yet</p>
                  </div>
                ) : invoices.map((inv) => (
                  <div key={inv.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <div className="sm:col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{inv.number ?? inv.id.slice(0, 14) + "…"}</p>
                        <p className="text-[10px] text-muted-foreground">{fmtTs(inv.created)}</p>
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      {inv.period_start && inv.period_end
                        ? <p className="text-xs text-muted-foreground">{fmtTs(inv.period_start)} – {fmtTs(inv.period_end)}</p>
                        : <p className="text-xs text-muted-foreground">—</p>
                      }
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-black">{(inv.amount_paid / 100).toFixed(2)} {inv.currency.toUpperCase()}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <InvoiceBadge status={inv.status} />
                    </div>
                    <div className="sm:col-span-1 flex items-center sm:justify-end gap-1">
                      {inv.hosted_invoice_url && (
                        <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View invoice">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                      {inv.invoice_pdf && (
                        <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Download PDF">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Cancel / turn-off auto-renewal dialog */}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ban className="w-5 h-5 text-destructive" />
                  Turn off auto-renewal?
                </DialogTitle>
                <DialogDescription className="space-y-2 pt-1">
                  <span className="block">
                    Your subscription will <strong>not renew</strong> after{" "}
                    <strong>{fmt(billing?.plan?.expires_at)}</strong>.
                    You keep full access until that date.
                  </span>
                  <span className="block">
                    You can turn auto-renewal back on at any time before that date.
                  </span>
                  {daysUntilRenewal !== null && (
                    <span className="block text-muted-foreground text-xs">
                      You have <strong>{daysUntilRenewal} day{daysUntilRenewal !== 1 ? "s" : ""}</strong> remaining in your current period.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={actionLoading} className="flex-1">
                  Keep auto-renewal on
                </Button>
                <Button variant="destructive" onClick={handleCancel} disabled={actionLoading} className="flex-1 gap-2">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                  Turn off auto-renewal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

// ── Small layout helper ────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Calendar className="w-3 h-3" />{label}
      </span>
      {children}
    </div>
  );
}

export default function BillingPage() {
  return <Suspense><BillingContent /></Suspense>;
}
