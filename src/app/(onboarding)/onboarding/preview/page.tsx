"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingDown, TrendingUp, Sparkles, Store, Loader2, CheckCircle2,
  ShoppingBag, AlertTriangle, RefreshCcw, ArrowRight, Receipt, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import { useT } from "@/i18n/provider";

// ── Types ────────────────────────────────────────────────────────────────────

interface StoreOption {
  store_id: string;
  store_name: string;
  integrated: boolean;
}

interface SampleContestedOrder {
  order_id: string | null;
  store_name: string | null;
  amount: number;
  issue: string | null;
  date: string | null;
}

interface SampleCancelledOrder {
  order_id: string | null;
  store_name: string | null;
  date: string | null;
  status: string | null;
}

interface PreviewData {
  data_ready: boolean;
  period_days: number;
  stores: { store_id: string; store_name: string }[];
  contested_count: number;
  cancelled_count: number;
  contested_amount: number;
  cancelled_amount: number;
  lost_total_eur: number;
  recovered_at_85: number;
  net_at_85: number;
  recovered_at_90: number;
  net_at_90: number;
  commission_rates: { contested: number; cancelled: number };
  sample_contested_order: SampleContestedOrder | null;
  sample_cancelled_order: SampleCancelledOrder | null;
}

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const router = useRouter();
  const t = useT({
    fr: {
      account_approved: "Compte approuvé 🎉",
      welcome_aboard: "Bienvenue à bord",
      header_title: "Voici ce que vous avez perdu.",
      header_lead: "Nous avons extrait les 30 derniers jours de vos données Uber Eats pour les restaurants choisis. Voici ce que vous avez perdu — et combien nous récupérerons pour vous dès le premier jour.",
      choose_stores: "Choisissez jusqu'à {n} restaurants pour l'aperçu",
      verified_only: "Seuls les restaurants vérifiés et intégrés sont affichés.",
      refresh: "Actualiser",
      loading_stores: "Chargement de vos restaurants…",
      no_verified: "Aucun restaurant vérifié intégré pour le moment.",
      connect_a_store: "Connectez un restaurant",
      first: "d'abord.",
      integrated: "Intégré",
      pending_integration: "En attente d'intégration",
      crunching: "Nous calculons vos 30 derniers jours…",
      not_ready_t: "Nous extrayons encore vos données",
      not_ready_b: "Les rapports Uber Eats prennent 2 à 10 minutes à générer. Actualisez la page dans quelques minutes — vos chiffres apparaîtront ici.",
      try_again: "Réessayer",
      what_you_lost: "Ce que vous avez perdu",
      last_30: "sur les 30 derniers jours",
      contested: "Contestées",
      cancelled: "Annulées",
      recoverable_85: "Récupérable @ 85%",
      conservative: "Estimation prudente — votre net :",
      recoverable_90: "Récupérable @ 90%",
      realistic: "Cas réaliste — votre net :",
      real_orders: "Vraies commandes sur lesquelles nous travaillerions",
      real_orders_lead: "Juste deux exemples de vos restaurants pour montrer que ce sont vos vraies données.",
      contested_label: "Contestée",
      cancelled_label: "Annulée",
      no_contested_30: "Aucune commande contestée dans les 30 derniers jours.",
      no_cancelled_30: "Aucune commande annulée dans les 30 derniers jours.",
      found_summary: "{c} contestées + {x} annulées trouvées sur {n} {s}.",
      store: "restaurant",
      stores: "restaurants",
      cta_t: "Arrêtez de laisser de l'argent sur la table.",
      cta_b: "Abonnez-vous et nous commencerons à déposer les demandes dès demain. Vous ne payez notre commission que sur ce que nous récupérons réellement.",
      cta_btn: "Commencer l'abonnement",
      cta_fine: "Commissions : 20% sur contestées · 15% sur annulées. Annulation à tout moment.",
    },
    en: {
      account_approved: "Account approved 🎉",
      welcome_aboard: "Welcome aboard",
      header_title: "Here's what you've been missing.",
      header_lead: "We pulled the last 30 days of your Uber Eats data for the stores you picked. Below is what you lost — and how much we'll recover for you starting day one.",
      choose_stores: "Choose up to {n} stores for the preview",
      verified_only: "Only verified + integrated stores are shown.",
      refresh: "Refresh",
      loading_stores: "Loading your stores…",
      no_verified: "No verified integrated stores yet.",
      connect_a_store: "Connect a store",
      first: "first.",
      integrated: "Integrated",
      pending_integration: "Pending integration",
      crunching: "Crunching your last 30 days…",
      not_ready_t: "We're still pulling your data",
      not_ready_b: "Uber Eats reports take 2–10 minutes to generate. Refresh this page in a few minutes — your numbers will appear here.",
      try_again: "Try again",
      what_you_lost: "What you lost",
      last_30: "in the last 30 days",
      contested: "Contested",
      cancelled: "Cancelled",
      recoverable_85: "Recoverable @ 85%",
      conservative: "Conservative estimate — your net:",
      recoverable_90: "Recoverable @ 90%",
      realistic: "Realistic case — your net:",
      real_orders: "Real orders we'd start working on",
      real_orders_lead: "Just two examples from your stores so you can see this is your real data.",
      contested_label: "Contested",
      cancelled_label: "Cancelled",
      no_contested_30: "No contested order found in the last 30 days.",
      no_cancelled_30: "No cancelled order found in the last 30 days.",
      found_summary: "Found {c} contested + {x} cancelled orders across {n} {s}.",
      store: "store",
      stores: "stores",
      cta_t: "Stop leaving money on the table.",
      cta_b: "Subscribe now and we'll start filing claims tomorrow. You only pay our commission on what we actually recover.",
      cta_btn: "Start subscription",
      cta_fine: "Commissions: 20% on contested · 15% on cancelled. Cancel anytime.",
    },
  });

  const [stores, setStores]           = useState<StoreOption[]>([]);
  const [maxSelectable, setMax]       = useState(2);
  const [selected, setSelected]       = useState<string[]>([]);
  const [data, setData]               = useState<PreviewData | null>(null);
  const [loadingStores, setLS]        = useState(true);
  const [loadingPreview, setLP]       = useState(false);

  // Load store list once
  useEffect(() => {
    api.get<{ stores: StoreOption[]; max_selectable: number }>("/onboarding/preview/stores")
      .then((d) => {
        setStores(d.stores);
        setMax(d.max_selectable);
        // Auto-select first 2 integrated
        const auto = d.stores.filter((s) => s.integrated).slice(0, d.max_selectable).map((s) => s.store_id);
        setSelected(auto);
      })
      .finally(() => setLS(false));
  }, []);

  const fetchPreview = useCallback(async () => {
    if (!selected.length) return;
    setLP(true);
    try {
      const params = selected.map((id) => `store_ids=${encodeURIComponent(id)}`).join("&");
      const d = await api.get<PreviewData>(`/onboarding/preview?${params}`);
      setData(d);
    } finally {
      setLP(false);
    }
  }, [selected]);

  useEffect(() => { fetchPreview(); }, [fetchPreview]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelectable) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-6 py-4 flex items-center gap-3">
        <Logo width={28} height={28} className="rounded-lg overflow-hidden" />
        <span className="font-extrabold text-sm tracking-tight">
          Smart<span className="text-primary">Kitchen</span>
        </span>
        <span className="text-muted-foreground text-xs ml-auto">{t.account_approved}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> {t.welcome_aboard}
          </div>
          <h1 className="text-3xl font-black tracking-tight">{t.header_title}</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">{t.header_lead}</p>
        </div>

        {/* Store picker */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" /> {t.choose_stores.replace("{n}", String(maxSelectable))}
              </p>
              <p className="text-xs text-muted-foreground">{t.verified_only}</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchPreview} disabled={loadingPreview || !selected.length} className="gap-1.5">
              {loadingPreview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              {t.refresh}
            </Button>
          </div>

          {loadingStores ? (
            <div className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {t.loading_stores}</div>
          ) : stores.length === 0 ? (
            <div className="rounded-xl bg-muted/40 border border-border p-4 text-sm text-muted-foreground">
              {t.no_verified} <a href="/stores" className="text-primary underline">{t.connect_a_store}</a> {t.first}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stores.map((s) => {
                const sel = selected.includes(s.store_id);
                const disabled = !s.integrated || (!sel && selected.length >= maxSelectable);
                return (
                  <button
                    key={s.store_id}
                    onClick={() => !disabled && toggle(s.store_id)}
                    disabled={disabled}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150",
                      sel ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "border-border bg-card hover:border-primary/40",
                      disabled && !sel && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      sel ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                    )}>
                      {sel ? <CheckCircle2 className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.store_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.integrated ? t.integrated : t.pending_integration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading / not ready states */}
        {loadingPreview && !data && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
            {t.crunching}
          </div>
        )}

        {data && !data.data_ready && !loadingPreview && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="font-semibold text-amber-700 dark:text-amber-400">{t.not_ready_t}</p>
            </div>
            <p className="text-sm text-muted-foreground">{t.not_ready_b}</p>
            <Button size="sm" variant="outline" onClick={fetchPreview} className="gap-1.5">
              <RefreshCcw className="w-3.5 h-3.5" /> {t.try_again}
            </Button>
          </div>
        )}

        {/* Numbers */}
        {data && data.data_ready && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-destructive/80 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" /> {t.what_you_lost}
                </p>
                <p className="text-3xl font-black text-destructive mt-1">
                  {fmt(data.lost_total_eur)} <span className="text-base font-bold">€</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t.last_30}</p>
                <div className="mt-3 pt-3 border-t border-destructive/15 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>{t.contested}</span><span className="font-semibold text-foreground">{fmt(data.contested_amount)} €</span></div>
                  <div className="flex justify-between"><span>{t.cancelled}</span><span className="font-semibold text-foreground">{fmt(data.cancelled_amount)} €</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> {t.recoverable_85}
                </p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {fmt(data.recovered_at_85)} <span className="text-base font-bold">€</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.conservative} <span className="font-semibold text-foreground">{fmt(data.net_at_85)} €</span>
                </p>
              </div>

              <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 ring-2 ring-primary/20">
                <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {t.recoverable_90}
                </p>
                <p className="text-3xl font-black text-primary mt-1">
                  {fmt(data.recovered_at_90)} <span className="text-base font-bold">€</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.realistic} <span className="font-semibold text-foreground">{fmt(data.net_at_90)} €</span>
                </p>
              </div>
            </div>

            {/* Sample orders */}
            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> {t.real_orders}
              </p>
              <p className="text-xs text-muted-foreground">{t.real_orders_lead}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.sample_contested_order ? (
                  <div className="rounded-xl border border-amber-500/30 bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                        <AlertTriangle className="w-3 h-3" /> {t.contested_label}
                      </span>
                      <span className="font-black text-amber-600">{fmt(data.sample_contested_order.amount)} €</span>
                    </div>
                    <p className="text-sm font-semibold truncate">{data.sample_contested_order.store_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{data.sample_contested_order.issue ?? "Issue not specified"}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {data.sample_contested_order.date ? new Date(data.sample_contested_order.date).toLocaleDateString("fr-FR") : "—"}
                      {data.sample_contested_order.order_id && <span className="font-mono">· #{data.sample_contested_order.order_id.slice(-8)}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    {t.no_contested_30}
                  </div>
                )}

                {data.sample_cancelled_order ? (
                  <div className="rounded-xl border border-sky-500/30 bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-sky-600">
                        <ShoppingBag className="w-3 h-3" /> {t.cancelled_label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {data.sample_cancelled_order.status ?? "—"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate">{data.sample_cancelled_order.store_name ?? "—"}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {data.sample_cancelled_order.date ? new Date(data.sample_cancelled_order.date).toLocaleDateString("fr-FR") : "—"}
                      {data.sample_cancelled_order.order_id && <span className="font-mono">· #{data.sample_cancelled_order.order_id.slice(-8)}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    {t.no_cancelled_30}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                {t.found_summary
                  .replace("{c}", String(data.contested_count))
                  .replace("{x}", String(data.cancelled_count))
                  .replace("{n}", String(data.stores.length))
                  .replace("{s}", data.stores.length === 1 ? t.store : t.stores)}
              </p>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 text-center space-y-4">
              <p className="text-2xl sm:text-3xl font-black tracking-tight">
                {t.cta_t}
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">{t.cta_b}</p>
              <Button size="lg" className="gap-2 font-bold shadow-lg shadow-primary/30 press-scale" onClick={() => router.push("/billing")}>
                {t.cta_btn} <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-[10px] text-muted-foreground">{t.cta_fine}</p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
