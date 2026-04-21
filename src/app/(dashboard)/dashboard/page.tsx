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
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CancelledOrder, ContestedOrder, StoreRefund, UserStore } from "@/types";

interface Stats {
  stores:             number;
  cancelled:          number;
  contested:          number;
  refunds:            number;
  pendingCancelled:   number;
  pendingContested:   number;
  emailSentContested: number;
  rembourseContested: number;
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  href,
  loading,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: number | string;
  sub?: string;
  href: string;
  loading: boolean;
}) {
  return (
    <Link href={href} className="group">
      <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", iconColor)} style={{ width: "18px", height: "18px" }} />
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
        {loading ? (
          <div className="h-8 w-16 rounded-lg bg-muted animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-black tracking-tight">{value}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && !loading && (
          <p className="text-[10px] text-muted-foreground/60 mt-1">{sub}</p>
        )}
      </div>
    </Link>
  );
}

function StatusRow({
  icon: Icon,
  color,
  bg,
  label,
  count,
  total,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("w-3.5 h-3.5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{label}</span>
          <span className="text-xs font-bold">{count}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", color.replace("text-", "bg-"))}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
    </div>
  );
}

function RecentOrder({ order, type }: { order: CancelledOrder | ContestedOrder; type: "cancelled" | "contested" }) {
  const status = order.remboursement_status;
  const date   = type === "cancelled"
    ? (order as CancelledOrder).date_ordered
    : (order as ContestedOrder).time_customer_ordered;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
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
      <p className="text-[10px] text-muted-foreground">
        {date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]              = useState<Stats | null>(null);
  const [recentCancelled, setRecentC]  = useState<CancelledOrder[]>([]);
  const [recentContested, setRecentCo] = useState<ContestedOrder[]>([]);
  const [recentRefunds, setRecentR]    = useState<StoreRefund[]>([]);
  const [stores, setStores]            = useState<UserStore[]>([]);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [storesRes, cancelRes, contestRes, refundsRes] = await Promise.allSettled([
        api.get<UserStore[]>("/smartkitchen-stores/my"),
        api.get<{ total: number; cancelled_orders: CancelledOrder[] }>(
          "/order-reports/my-cancelled?skip=0&limit=5"
        ),
        api.get<{ total: number; contested_orders: ContestedOrder[] }>(
          "/order-reports/my-contested?skip=0&limit=5"
        ),
        api.get<{ total: number; refunds: StoreRefund[] }>(
          "/store-refunds?skip=0&limit=5"
        ),
      ]);

      const storesList = storesRes.status  === "fulfilled" ? (storesRes.value  ?? []) : [];
      const cOrders    = cancelRes.status  === "fulfilled" ? (cancelRes.value.cancelled_orders  ?? []) : [];
      const coOrders   = contestRes.status === "fulfilled" ? (contestRes.value.contested_orders ?? []) : [];
      const refList    = refundsRes.status === "fulfilled" ? (refundsRes.value.refunds           ?? []) : [];
      const cTotal     = cancelRes.status  === "fulfilled" ? cancelRes.value.total  : 0;
      const coTotal    = contestRes.status === "fulfilled" ? contestRes.value.total : 0;
      const rTotal     = refundsRes.status === "fulfilled" ? refundsRes.value.total : 0;

      setStores(storesList);
      setRecentC(cOrders);
      setRecentCo(coOrders);
      setRecentR(refList);

      // Fetch status breakdowns (up to 1000 contested orders for accurate counts)
      const [cancelAllRes, contestAllRes] = await Promise.allSettled([
        api.get<{ total: number; cancelled_orders: CancelledOrder[] }>(
          "/order-reports/my-cancelled?skip=0&limit=1000"
        ),
        api.get<{ total: number; contested_orders: ContestedOrder[] }>(
          "/order-reports/my-contested?skip=0&limit=1000"
        ),
      ]);

      const allCancelled = cancelAllRes.status  === "fulfilled" ? (cancelAllRes.value.cancelled_orders  ?? []) : cOrders;
      const allContested = contestAllRes.status === "fulfilled" ? (contestAllRes.value.contested_orders ?? []) : coOrders;

      setStats({
        stores:             storesList.length,
        cancelled:          cancelAllRes.status  === "fulfilled" ? cancelAllRes.value.total  : cTotal,
        contested:          contestAllRes.status === "fulfilled" ? contestAllRes.value.total : coTotal,
        refunds:            rTotal,
        pendingCancelled:   allCancelled.filter((o) => o.remboursement_status === "en attente").length,
        pendingContested:   allContested.filter((o) => o.remboursement_status === "en attente").length,
        emailSentContested: allContested.filter((o) => o.remboursement_status === "email envoyé").length,
        rembourseContested: allContested.filter((o) => o.remboursement_status === "remboursé").length,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">Your Recovery Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          {stores.length === 0 && !loading && (
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/25"
            >
              <Store className="w-4 h-4" />
              Add your first store
            </Link>
          )}
          <Button size="sm" variant="outline" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Could not load dashboard data. Please refresh.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Store}      iconColor="text-primary"    iconBg="bg-primary/10"    label="Active Stores"     value={stats?.stores ?? 0}    href="/stores"           loading={loading} />
        <StatCard icon={ShoppingBag} iconColor="text-amber-500" iconBg="bg-amber-500/10"  label="Cancelled Orders"  value={stats?.cancelled ?? 0} sub={stats ? `${stats.pendingCancelled} pending` : undefined} href="/orders/cancelled" loading={loading} />
        <StatCard icon={TrendingUp} iconColor="text-sky-500"    iconBg="bg-sky-500/10"    label="Contested Orders"  value={stats?.contested ?? 0} sub={stats ? `${stats.pendingContested} pending` : undefined} href="/orders/contested" loading={loading} />
        <StatCard icon={CreditCard} iconColor="text-violet-500" iconBg="bg-violet-500/10" label="Refunds Received"  value={stats?.refunds ?? 0}   href="/refunds"          loading={loading} />
      </div>

      {/* Middle: breakdown + stores */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">Contested Recovery Status</h2>
            <Link href="/orders/contested" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : stats && stats.contested > 0 ? (
            <div className="space-y-3">
              <StatusRow icon={CheckCircle2} color="text-primary"    bg="bg-primary/10"    label="Remboursé"    count={stats.rembourseContested} total={stats.contested} />
              <StatusRow icon={Mail}         color="text-sky-500"    bg="bg-sky-500/10"    label="Email envoyé" count={stats.emailSentContested}  total={stats.contested} />
              <StatusRow icon={Clock}        color="text-amber-500"  bg="bg-amber-500/10"  label="En attente"   count={stats.pendingContested}    total={stats.contested} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No contested orders yet</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">Your Stores</h2>
            <Link href="/stores" className="text-xs text-primary hover:underline">Manage</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <Store className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No stores added yet</p>
              <Link href="/stores" className="text-xs text-primary hover:underline">Add a store →</Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {stores.slice(0, 5).map((s) => (
                <div key={s.store_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm font-medium flex-1 truncate">{s.store_name}</p>
                  <code className="text-[10px] text-muted-foreground font-mono hidden sm:block">{s.store_id.slice(0, 8)}…</code>
                </div>
              ))}
              {stores.length > 5 && (
                <Link href="/stores" className="block text-center text-xs text-muted-foreground hover:text-primary pt-1 transition-colors">
                  +{stores.length - 5} more stores →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm">Recent Cancelled</h2>
            </div>
            <Link href="/orders/cancelled" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : recentCancelled.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No cancelled orders</p>
          ) : (
            recentCancelled.map((o) => <RecentOrder key={o.order_id} order={o} type="cancelled" />)
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <h2 className="font-bold text-sm">Recent Contested</h2>
            </div>
            <Link href="/orders/contested" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : recentContested.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No contested orders</p>
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
              <h2 className="font-bold text-sm">Recent Refunds</h2>
            </div>
            <Link href="/refunds" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map((i) => <div key={i} className="h-9 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentRefunds.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  <p className="flex-1 text-xs font-medium truncate">{r.store_name}</p>
                  <span className="text-sm font-bold text-violet-500">{r.amount}</span>
                  <span className="text-[10px] text-muted-foreground">
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
