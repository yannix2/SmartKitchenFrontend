"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  RefreshCcw,
  Loader2,
  ChevronDown,
  TrendingUp,
  Users,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useT } from "@/i18n/provider";
import type { AdminRevenueResponse, AdminRevenueUser, AdminRevenueStore } from "@/types";

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type StoreLabels = {
  contested_refunds: string;
  total: string;
  contested_orders: string;
  reimbursed: string;
  cancelled_refunds: string;
  cancelled_orders: string;
};
type UserLabels = {
  active: string;
  inactive: string;
  th_store: string;
  th_status: string;
  th_contested: string;
  th_cancelled: string;
  th_total: string;
  store: StoreLabels;
};

function StatCard({
  label, numericValue, suffix, sub, color = "primary", decimals = 2, integer = false,
}: {
  label: string;
  numericValue: number;
  suffix?: string;
  sub?: string;
  color?: "primary" | "amber" | "sky" | "violet";
  decimals?: number;
  integer?: boolean;
}) {
  const ring = {
    primary: "text-primary",
    amber:   "text-amber-500",
    sky:     "text-sky-500",
    violet:  "text-violet-500",
  }[color];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-1 transition-all duration-200 hover:border-border hover:shadow-sm">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-2xl font-black tabular-nums", ring)}>
        <AnimatedCounter value={numericValue} decimals={integer ? 0 : decimals} suffix={suffix ?? ""} />
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StoreRow({ store, labels }: { store: AdminRevenueStore; labels: StoreLabels & { verified: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className="border-b border-border/40 hover:bg-muted/20 row-hover-lift cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        <td className="px-4 py-2.5 pl-10">
          <div className="flex items-center gap-2">
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
            <div>
              <p className="text-xs font-medium">{store.store_name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{store.store_id.slice(0, 10)}…</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-2.5 text-xs hidden md:table-cell">
          <Badge variant="outline" className={cn("text-[10px]", store.status === "verified" ? "border-primary/40 text-primary" : "text-muted-foreground")}>
            {store.status === "verified" ? labels.verified : store.status}
          </Badge>
        </td>
        <td className="px-4 py-2.5 text-xs text-right text-amber-600 dark:text-amber-400 font-semibold">{fmt(store.contested_revenue)} <span className="text-muted-foreground font-normal">€</span></td>
        <td className="px-4 py-2.5 text-xs text-right text-sky-600 dark:text-sky-400 font-semibold hidden sm:table-cell">{fmt(store.cancelled_revenue)} <span className="text-muted-foreground font-normal">€</span></td>
        <td className="px-4 py-2.5 text-xs text-right font-bold text-primary">{fmt(store.total_revenue)} <span className="text-muted-foreground font-normal">€</span></td>
      </tr>
      {open && (
        <tr className="border-b border-border/40 bg-muted/10 animate-fade-in">
          <td colSpan={5} className="px-4 py-3 pl-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="text-muted-foreground">{labels.contested_refunds}</p>
                <p className="font-semibold">{store.contested_refunds} × 20%</p>
                <p className="text-muted-foreground">{labels.total}: {fmt(store.contested_amount)} €</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted-foreground">{labels.contested_orders}</p>
                <p className="font-semibold">{store.contested_orders_rembourse} / {store.contested_orders_total} {labels.reimbursed}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted-foreground">{labels.cancelled_refunds}</p>
                <p className="font-semibold">{store.cancelled_refunds} × 15%</p>
                <p className="text-muted-foreground">{labels.total}: {fmt(store.cancelled_amount)} €</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted-foreground">{labels.cancelled_orders}</p>
                <p className="font-semibold">{store.cancelled_orders_rembourse} / {store.cancelled_orders_total} {labels.reimbursed}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function UserRow({ user, labels }: { user: AdminRevenueUser; labels: UserLabels & { verified: string } }) {
  const [open, setOpen] = useState(false);
  const initials = `${user.name?.[0] ?? ""}${user.family_name?.[0] ?? ""}`.toUpperCase();

  return (
    <>
      <tr
        className="border-b border-border/60 hover:bg-muted/20 row-hover-lift cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-border" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{user.name} {user.family_name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-right text-amber-600 dark:text-amber-400 font-semibold hidden md:table-cell">
          {fmt(user.contested_revenue)} <span className="text-muted-foreground font-normal text-xs">€</span>
        </td>
        <td className="px-4 py-3 text-sm text-right text-sky-600 dark:text-sky-400 font-semibold hidden md:table-cell">
          {fmt(user.cancelled_revenue)} <span className="text-muted-foreground font-normal text-xs">€</span>
        </td>
        <td className="px-4 py-3 text-sm text-right font-black text-primary">
          {fmt(user.total_revenue)} <span className="text-muted-foreground font-normal text-xs">€</span>
        </td>
        <td className="px-4 py-3 text-center">
          <Badge variant="outline" className={cn("text-xs", user.is_active ? "border-primary/40 text-primary" : "text-muted-foreground")}>
            {user.is_active ? labels.active : labels.inactive}
          </Badge>
        </td>
      </tr>
      {open && user.stores.length > 0 && (
        <tr className="border-b border-border/60 bg-muted/10 animate-fade-in">
          <td colSpan={5} className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left px-4 py-2 pl-10 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">{labels.th_store}</th>
                  <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider hidden md:table-cell">{labels.th_status}</th>
                  <th className="text-right px-4 py-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">{labels.th_contested}</th>
                  <th className="text-right px-4 py-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider hidden sm:table-cell">{labels.th_cancelled}</th>
                  <th className="text-right px-4 py-2 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">{labels.th_total}</th>
                </tr>
              </thead>
              <tbody>
                {user.stores.map(s => <StoreRow key={s.store_id} store={s} labels={{ ...labels.store, verified: labels.verified }} />)}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminWalletPage() {
  const t = useT({
    fr: {
      title: "Portefeuille de revenus",
      subtitle: "Aperçu des commissions SmartKitchen — 20% contestées remboursées · 15% annulées remboursées",
      refresh: "Actualiser",
      err_load: "Échec du chargement des données de revenus.",
      stat_total: "Revenu total",
      stat_total_sub_one: "utilisateur",
      stat_total_sub_many: "utilisateurs",
      stat_contested: "Contestés (20%)",
      stat_contested_sub: "Commandes contestées remboursées × 0,20",
      stat_cancelled: "Annulés (15%)",
      stat_cancelled_sub: "Commandes annulées remboursées × 0,15",
      stat_active: "Utilisateurs actifs",
      stat_active_sub_of: "sur",
      stat_active_sub_total: "au total",
      legend_contested: "= Remboursement de boutique lié à une commande contestée remboursée × 20%",
      legend_contested_label: "Contestés",
      legend_cancelled: "= Remboursement de boutique lié à une commande annulée remboursée × 15%",
      legend_cancelled_label: "Annulés",
      legend_verified: "Seules les boutiques vérifiées sont incluses par utilisateur",
      th_user: "Utilisateur",
      th_contested: "Contestés",
      th_cancelled: "Annulés",
      th_total: "Total",
      th_status: "Statut",
      no_revenue: "Aucune donnée de revenu",
      active: "Actif",
      inactive: "Inactif",
      verified: "Vérifié",
      th_store: "Boutique",
      contested_refunds: "Remboursements contestés",
      total: "Total",
      contested_orders: "Commandes contestées",
      reimbursed: "remboursé",
      cancelled_refunds: "Remboursements annulés",
      cancelled_orders: "Commandes annulées",
    },
    en: {
      title: "Revenue Wallet",
      subtitle: "SmartKitchen commission overview — 20% contested reimbursed · 15% cancelled reimbursed",
      refresh: "Refresh",
      err_load: "Failed to load revenue data.",
      stat_total: "Total Revenue",
      stat_total_sub_one: "user",
      stat_total_sub_many: "users",
      stat_contested: "Contested (20%)",
      stat_contested_sub: "Reimbursed contested × 0.20",
      stat_cancelled: "Cancelled (15%)",
      stat_cancelled_sub: "Reimbursed cancelled × 0.15",
      stat_active: "Active Users",
      stat_active_sub_of: "of",
      stat_active_sub_total: "total",
      legend_contested: "= StoreRefund linked to reimbursed ContestedOrder × 20%",
      legend_contested_label: "Contested",
      legend_cancelled: "= StoreRefund linked to reimbursed ReportedOrder × 15%",
      legend_cancelled_label: "Cancelled",
      legend_verified: "Only verified stores are included per user",
      th_user: "User",
      th_contested: "Contested",
      th_cancelled: "Cancelled",
      th_total: "Total",
      th_status: "Status",
      no_revenue: "No revenue data",
      active: "Active",
      inactive: "Inactive",
      verified: "Verified",
      th_store: "Store",
      contested_refunds: "Contested refunds",
      total: "Total",
      contested_orders: "Contested orders",
      reimbursed: "reimbursed",
      cancelled_refunds: "Cancelled refunds",
      cancelled_orders: "Cancelled orders",
    },
  });

  const [data, setData]     = useState<AdminRevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await api.get<AdminRevenueResponse>("/store-refunds/admin/revenue");
      setData(d);
    } catch (err: unknown) {
      setError((err as { detail?: string }).detail ?? t.err_load);
    } finally {
      setLoading(false);
    }
  }, [t.err_load]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const userLabels: UserLabels & { verified: string } = {
    active:        t.active,
    inactive:      t.inactive,
    verified:      t.verified,
    th_store:      t.th_store,
    th_status:     t.th_status,
    th_contested:  t.th_contested,
    th_cancelled:  t.th_cancelled,
    th_total:      t.th_total,
    store: {
      contested_refunds: t.contested_refunds,
      total:             t.total,
      contested_orders:  t.contested_orders,
      reimbursed:        t.reimbursed,
      cancelled_refunds: t.cancelled_refunds,
      cancelled_orders:  t.cancelled_orders,
    },
  };

  return (
    <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchRevenue} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {t.refresh}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive px-4 py-3 text-xs">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{error}
          </div>
        )}

        {loading && !data ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-stagger-cards>
              <StatCard
                label={t.stat_total}
                numericValue={data.total_revenue}
                suffix=" €"
                sub={`${data.users.length} ${data.users.length !== 1 ? t.stat_total_sub_many : t.stat_total_sub_one}`}
                color="primary"
              />
              <StatCard
                label={t.stat_contested}
                numericValue={data.contested_revenue}
                suffix=" €"
                sub={t.stat_contested_sub}
                color="amber"
              />
              <StatCard
                label={t.stat_cancelled}
                numericValue={data.cancelled_revenue}
                suffix=" €"
                sub={t.stat_cancelled_sub}
                color="sky"
              />
              <StatCard
                label={t.stat_active}
                numericValue={data.users.filter(u => u.is_active).length}
                integer
                sub={`${t.stat_active_sub_of} ${data.users.length} ${t.stat_active_sub_total}`}
                color="violet"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span><span className="font-semibold text-foreground">{t.legend_contested_label}</span> {t.legend_contested}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span><span className="font-semibold text-foreground">{t.legend_cancelled_label}</span> {t.legend_cancelled}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <span>{t.legend_verified}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">{t.th_user}</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs hidden md:table-cell">{t.th_contested}</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs hidden md:table-cell">{t.th_cancelled}</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs">{t.th_total}</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">{t.th_status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.length === 0 ? (
                      <tr><td colSpan={5} className="py-16 text-center text-muted-foreground text-xs">{t.no_revenue}</td></tr>
                    ) : data.users.map(u => <UserRow key={u.user_id} user={u} labels={userLabels} />)}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
    </div>
  );
}
