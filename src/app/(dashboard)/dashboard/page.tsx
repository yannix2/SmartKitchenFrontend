"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  Mail,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Zap,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n/provider";
import type { CancelledOrder, ContestedOrder, StoreRefund, UserStore, WalletData } from "@/types";

interface Stats {
  stores:              number;
  cancelled:           number;
  contested:           number;
  refunds:             number;
  pendingCancelled:    number;
  rembourseCancelled:  number;
  pendingContested:    number;
  emailSentContested:  number;
  rembourseContested:  number;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, iconColor, iconBg, label, value, sub, href, loading,
}: {
  icon: React.ElementType; iconColor: string; iconBg: string;
  label: string; value: number; sub?: string; href: string; loading: boolean;
}) {
  return (
    <Link href={href} className="group">
      <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 h-full row-hover-lift">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", iconColor)} style={{ width: "18px", height: "18px" }} />
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <p className="text-2xl font-black tracking-tight tabular-nums">
            <AnimatedCounter value={value} decimals={0} />
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && !loading && <p className="text-[10px] text-muted-foreground/60 mt-1">{sub}</p>}
      </div>
    </Link>
  );
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({
  icon: Icon, color, bg, label, count, total,
}: {
  icon: React.ElementType; color: string; bg: string; label: string; count: number; total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColor = color.replace("text-", "bg-");
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("w-3.5 h-3.5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{label}</span>
          <span className="text-xs font-bold">{count.toLocaleString("fr-FR")}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground w-8 text-right shrink-0">{pct}%</span>
    </div>
  );
}

// ── Recent order row ──────────────────────────────────────────────────────────

function RecentOrder({ order, type }: { order: CancelledOrder | ContestedOrder; type: "cancelled" | "contested" }) {
  const status = order.remboursement_status;
  const date   = type === "cancelled"
    ? (order as CancelledOrder).date_ordered
    : (order as ContestedOrder).time_customer_ordered;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0 row-hover-lift hover:bg-muted/30 -mx-2 px-2 rounded-lg">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        status === "remboursé"    && "bg-primary",
        status === "email envoyé" && "bg-sky-500",
        status === "en attente"   && "bg-amber-400",
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{order.store_name}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{order.order_id}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-muted-foreground">
          {date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
        </p>
        <p className={cn(
          "text-[10px] font-semibold",
          status === "remboursé"    && "text-primary",
          status === "email envoyé" && "text-sky-500",
          status === "en attente"   && "text-amber-500",
        )}>
          {status === "remboursé" ? "Remboursé" : status === "email envoyé" ? "Email envoyé" : "En attente"}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats]              = useState<Stats | null>(null);
  const [recentCancelled, setRecentC]  = useState<CancelledOrder[]>([]);
  const [recentContested, setRecentCo] = useState<ContestedOrder[]>([]);
  const [recentRefunds, setRecentR]    = useState<StoreRefund[]>([]);
  const [stores, setStores]            = useState<UserStore[]>([]);
  const [wallet, setWallet]            = useState<WalletData | null>(null);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      // First batch: quick data for display
      const [storesRes, cancelRes, contestRes, refundsRes, walletRes] = await Promise.allSettled([
        api.get<UserStore[]>("/smartkitchen-stores/my"),
        api.get<{ total: number; cancelled_orders: CancelledOrder[] }>("/order-reports/my-cancelled?skip=0&limit=5"),
        api.get<{ total: number; contested_orders: ContestedOrder[] }>("/order-reports/my-contested?skip=0&limit=5"),
        api.get<{ total: number; refunds: StoreRefund[] }>("/store-refunds?skip=0&limit=3"),
        api.get<WalletData>("/store-refunds/wallet"),
      ]);

      const storesList = storesRes.status  === "fulfilled" ? (storesRes.value  ?? []) : [];
      const cOrders    = cancelRes.status  === "fulfilled" ? (cancelRes.value.cancelled_orders  ?? []) : [];
      const coOrders   = contestRes.status === "fulfilled" ? (contestRes.value.contested_orders ?? []) : [];
      const refList    = refundsRes.status === "fulfilled" ? (refundsRes.value.refunds           ?? []) : [];
      const cTotal     = cancelRes.status  === "fulfilled" ? cancelRes.value.total  : 0;
      const coTotal    = contestRes.status === "fulfilled" ? contestRes.value.total : 0;
      const rTotal     = refundsRes.status === "fulfilled" ? refundsRes.value.total : 0;
      const walletData = walletRes.status  === "fulfilled" ? walletRes.value : null;

      setStores(storesList);
      setRecentC(cOrders);
      setRecentCo(coOrders);
      setRecentR(refList);
      if (walletData) setWallet(walletData);

      // Second batch: accurate per-status counts using limit=1 (only need the `total` field)
      // This avoids the backend le=500 cap and is fast — each call returns 0 rows
      const enc = encodeURIComponent;
      const [
        cRembRes, cPendRes,
        coRembRes, coEmailRes, coPendRes,
      ] = await Promise.allSettled([
        api.get<{ total: number }>(`/order-reports/my-cancelled?remboursement_status=${enc("remboursé")}&skip=0&limit=1`),
        api.get<{ total: number }>(`/order-reports/my-cancelled?remboursement_status=${enc("en attente")}&skip=0&limit=1`),
        api.get<{ total: number }>(`/order-reports/my-contested?remboursement_status=${enc("remboursé")}&skip=0&limit=1`),
        api.get<{ total: number }>(`/order-reports/my-contested?remboursement_status=${enc("email envoyé")}&skip=0&limit=1`),
        api.get<{ total: number }>(`/order-reports/my-contested?remboursement_status=${enc("en attente")}&skip=0&limit=1`),
      ]);

      setStats({
        stores:             storesList.length,
        cancelled:          cTotal,
        contested:          coTotal,
        refunds:            rTotal,
        rembourseCancelled: cRembRes.status  === "fulfilled" ? cRembRes.value.total  : 0,
        pendingCancelled:   cPendRes.status  === "fulfilled" ? cPendRes.value.total  : 0,
        rembourseContested: coRembRes.status === "fulfilled" ? coRembRes.value.total : 0,
        emailSentContested: coEmailRes.status === "fulfilled" ? coEmailRes.value.total : 0,
        pendingContested:   coPendRes.status === "fulfilled" ? coPendRes.value.total  : 0,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = useT({
    fr: {
      gm: "Bonjour", ga: "Bon après-midi", ge: "Bonsoir",
      title: "Votre tableau de récupération",
      add_first: "Ajouter votre premier restaurant",
      refresh: "Actualiser",
      banner_t: "Récupération entièrement automatisée — aucune action requise",
      banner_b: "Nous détectons vos commandes, envoyons les emails de remboursement et associons les remboursements reçus. Tout se passe en arrière-plan.",
      load_err: "Impossible de charger les données. Veuillez actualiser.",
      kpi_stores: "Restaurants actifs",
      kpi_cancelled: "Commandes annulées",
      kpi_contested: "Commandes contestées",
      kpi_refunds: "Remboursements reçus",
      rembourse: "remboursé",
      email_sent: "email envoyé",
      earned: "gagnés",
      cancelled_status: "Statut Annulées",
      contested_status: "Statut Contestées",
      view_all: "Voir tout",
      remboursé: "Remboursé",
      en_attente: "En attente",
      email_envoye: "Email envoyé",
      recovery_rate: "Taux de récupération",
      no_cancelled: "Aucune commande annulée pour l'instant",
      no_contested: "Aucune commande contestée pour l'instant",
      your_stores: "Vos restaurants",
      manage: "Gérer",
      no_stores: "Aucun restaurant ajouté",
      add_a_store: "Ajouter un restaurant →",
      total_recovered: "Total récupéré",
      view_refunds: "Voir les remboursements",
      recent_cancelled: "Annulées récentes",
      recent_contested: "Contestées récentes",
      recent_refunds: "Remboursements récents",
      no_refunds_yet: "Aucun remboursement pour l'instant",
    },
    en: {
      gm: "Good morning", ga: "Good afternoon", ge: "Good evening",
      title: "Your Recovery Overview",
      add_first: "Add your first store",
      refresh: "Refresh",
      banner_t: "Fully automated recovery — no action needed",
      banner_b: "We automatically detect your orders, send refund emails, and match incoming refunds. Everything runs in the background.",
      load_err: "Could not load dashboard data. Please refresh.",
      kpi_stores: "Active Stores",
      kpi_cancelled: "Cancelled Orders",
      kpi_contested: "Contested Orders",
      kpi_refunds: "Refunds Received",
      rembourse: "remboursé",
      email_sent: "email envoyé",
      earned: "earned",
      cancelled_status: "Cancelled Status",
      contested_status: "Contested Status",
      view_all: "{t.view_all}",
      remboursé: "Remboursé",
      en_attente: "En attente",
      email_envoye: "Email envoyé",
      recovery_rate: "Recovery rate",
      no_cancelled: "No cancelled orders yet",
      no_contested: "No contested orders yet",
      your_stores: "Your Stores",
      manage: "Manage",
      no_stores: "No stores added yet",
      add_a_store: "Add a store →",
      total_recovered: "Total recovered income",
      view_refunds: "View refunds",
      recent_cancelled: "Recent Cancelled",
      recent_contested: "Recent Contested",
      recent_refunds: "Recent Refunds",
      no_refunds_yet: "No refunds yet",
    },
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t.gm;
    if (h < 18) return t.ga;
    return t.ge;
  })();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-350 mx-auto space-y-8 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">{t.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {stores.length === 0 && !loading && (
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/25"
            >
              <Store className="w-4 h-4" />
              {t.add_first}
            </Link>
          )}
          <Button size="sm" variant="outline" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Automation banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5">
        <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-primary">{t.banner_t}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.banner_b}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t.load_err}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-stagger-cards>
        <StatCard
          icon={Store} iconColor="text-primary" iconBg="bg-primary/10"
          label={t.kpi_stores} value={stats?.stores ?? 0}
          href="/stores" loading={loading}
        />
        <StatCard
          icon={ShoppingBag} iconColor="text-amber-500" iconBg="bg-amber-500/10"
          label={t.kpi_cancelled} value={stats?.cancelled ?? 0}
          sub={stats ? `${stats.rembourseCancelled} ${t.rembourse}` : undefined}
          href="/orders/cancelled" loading={loading}
        />
        <StatCard
          icon={TrendingUp} iconColor="text-sky-500" iconBg="bg-sky-500/10"
          label={t.kpi_contested} value={stats?.contested ?? 0}
          sub={stats ? `${stats.rembourseContested} ${t.rembourse} · ${stats.emailSentContested} ${t.email_sent}` : undefined}
          href="/orders/contested" loading={loading}
        />
        <StatCard
          icon={CreditCard} iconColor="text-violet-500" iconBg="bg-violet-500/10"
          label={t.kpi_refunds} value={stats?.refunds ?? 0}
          sub={wallet ? `${wallet.total_income.toFixed(2)} € ${t.earned}` : undefined}
          href="/refunds" loading={loading}
        />
      </div>

      {/* Breakdowns + stores */}
      <div className="grid lg:grid-cols-3 gap-6" data-stagger-cards>

        {/* Cancelled breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="font-bold text-sm">{t.cancelled_status}</h2>
            </div>
            <Link href="/orders/cancelled" className="text-xs text-primary hover:underline">{t.view_all}</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2].map((i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : stats && stats.cancelled > 0 ? (
            <div className="space-y-3">
              <StatusBar icon={CheckCircle2} color="text-primary"   bg="bg-primary/10"   label={t.remboursé}  count={stats.rembourseCancelled} total={stats.cancelled} />
              <StatusBar icon={Clock}        color="text-amber-500" bg="bg-amber-500/10" label={t.en_attente} count={stats.pendingCancelled}    total={stats.cancelled} />
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.recovery_rate}</span>
                  <span className="font-bold text-primary">
                    {stats.cancelled > 0 ? Math.round((stats.rembourseCancelled / stats.cancelled) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-5">
              <XCircle className="w-7 h-7 text-muted-foreground/20" />
              <p className="text-xs text-muted-foreground">{t.no_cancelled}</p>
            </div>
          )}
        </div>

        {/* Contested breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
              <h2 className="font-bold text-sm">{t.contested_status}</h2>
            </div>
            <Link href="/orders/contested" className="text-xs text-primary hover:underline">{t.view_all}</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : stats && stats.contested > 0 ? (
            <div className="space-y-3">
              <StatusBar icon={CheckCircle2} color="text-primary"   bg="bg-primary/10"   label={t.remboursé}    count={stats.rembourseContested} total={stats.contested} />
              <StatusBar icon={Mail}         color="text-sky-500"   bg="bg-sky-500/10"   label={t.email_envoye} count={stats.emailSentContested}  total={stats.contested} />
              <StatusBar icon={Clock}        color="text-amber-500" bg="bg-amber-500/10" label={t.en_attente}   count={stats.pendingContested}    total={stats.contested} />
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.recovery_rate}</span>
                  <span className="font-bold text-primary">
                    {stats.contested > 0 ? Math.round((stats.rembourseContested / stats.contested) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-5">
              <XCircle className="w-7 h-7 text-muted-foreground/20" />
              <p className="text-xs text-muted-foreground">{t.no_contested}</p>
            </div>
          )}
        </div>

        {/* Stores */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">{t.your_stores}</h2>
            <Link href="/stores" className="text-xs text-primary hover:underline">{t.manage}</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <Store className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{t.no_stores}</p>
              <Link href="/stores" className="text-xs text-primary hover:underline">{t.add_a_store}</Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {stores.slice(0, 5).map((s) => (
                <div key={s.store_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-xs font-medium flex-1 truncate">{s.store_name}</p>
                  <code className="text-[10px] text-muted-foreground font-mono hidden sm:block">{s.store_id.slice(0, 8)}…</code>
                </div>
              ))}
              {stores.length > 5 && (
                <Link href="/stores" className="block text-center text-xs text-muted-foreground hover:text-primary pt-1 transition-colors">
                  +{stores.length - 5} more →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Income highlight */}
      {(wallet && wallet.total_income > 0) && (
        <div className="rounded-2xl border border-violet-500/20 bg-linear-to-r from-violet-500/5 to-card p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.total_recovered}</p>
                <p className="text-2xl font-black text-violet-500 tabular-nums">
                  <AnimatedCounter value={wallet.total_income} suffix=" €" />
                </p>
              </div>
            </div>
            <Link href="/refunds" className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-600 transition-colors">
              {t.view_refunds} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm">{t.recent_cancelled}</h2>
            </div>
            <Link href="/orders/cancelled" className="text-xs text-primary hover:underline flex items-center gap-1">
              {t.view_all} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : recentCancelled.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">{t.no_cancelled}</p>
          ) : (
            recentCancelled.map((o) => <RecentOrder key={o.order_id} order={o} type="cancelled" />)
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <h2 className="font-bold text-sm">{t.recent_contested}</h2>
            </div>
            <Link href="/orders/contested" className="text-xs text-primary hover:underline flex items-center gap-1">
              {t.view_all} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : recentContested.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">{t.no_contested}</p>
          ) : (
            recentContested.map((o) => <RecentOrder key={o.id} order={o} type="contested" />)
          )}
        </div>
      </div>

      {/* Recent refunds */}
      {(recentRefunds.length > 0 || loading) && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet-500" />
              <h2 className="font-bold text-sm">{t.recent_refunds}</h2>
            </div>
            <Link href="/refunds" className="text-xs text-primary hover:underline flex items-center gap-1">
              {t.view_all} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentRefunds.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", r.linked_order_id ? "bg-violet-500" : "bg-amber-400")} />
                  <p className="flex-1 text-xs font-medium truncate">{r.store_name}</p>
                  <span className="text-sm font-black text-violet-500">{r.amount} €</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {r.refund_date ? new Date(r.refund_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
