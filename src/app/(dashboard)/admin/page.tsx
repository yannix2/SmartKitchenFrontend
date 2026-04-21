"use client";

import { useState } from "react";
import {
  Store,
  ShoppingBag,
  CreditCard,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminNav } from "@/components/layout/admin-nav";

// ── Types ─────────────────────────────────────────────────────────────────────

type SyncStatus = "idle" | "loading" | "success" | "error";

interface SyncState {
  status: SyncStatus;
  result: Record<string, unknown> | null;
  errorMsg: string | null;
  lastRun: Date | null;
}

const initialSync: SyncState = {
  status: "idle",
  result: null,
  errorMsg: null,
  lastRun: null,
};

// ── Result renderer ───────────────────────────────────────────────────────────

function ResultCard({ result }: { result: Record<string, unknown> }) {
  const entries = Object.entries(result).filter(
    ([k]) => k !== "store_ids" && k !== "triggered_by"
  );
  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 space-y-1.5">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground capitalize">
            {key.replace(/_/g, " ")}
          </span>
          <span className="font-semibold text-foreground">
            {String(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Sync card ─────────────────────────────────────────────────────────────────

interface SyncCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  buttonLabel: string;
  state: SyncState;
  onSync: () => void;
}

function SyncCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  buttonLabel,
  state,
  onSync,
}: SyncCardProps) {
  const isLoading = state.status === "loading";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300",
        state.status === "success" && "border-primary/30 shadow-md shadow-primary/5",
        state.status === "error"   && "border-destructive/30",
        state.status === "idle" || state.status === "loading" ? "border-border" : ""
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {state.lastRun && (
          <span className="text-[10px] text-muted-foreground">
            Last run {state.lastRun.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Text */}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>

      {/* Status badge */}
      {state.status !== "idle" && (
        <div className="mt-4">
          {state.status === "loading" && (
            <Badge variant="outline" className="gap-1.5 text-xs border-muted-foreground/30 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Running…
            </Badge>
          )}
          {state.status === "success" && (
            <Badge variant="outline" className="gap-1.5 text-xs border-primary/40 text-primary bg-primary/5">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </Badge>
          )}
          {state.status === "error" && (
            <Badge variant="outline" className="gap-1.5 text-xs border-destructive/40 text-destructive bg-destructive/5">
              <XCircle className="w-3 h-3" /> Failed
            </Badge>
          )}
        </div>
      )}

      {/* Result */}
      {state.status === "success" && state.result && (
        <ResultCard result={state.result} />
      )}

      {/* Error */}
      {state.status === "error" && state.errorMsg && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {state.errorMsg}
        </div>
      )}

      {/* Button */}
      <Button
        onClick={onSync}
        disabled={isLoading}
        className={cn(
          "mt-5 w-full gap-2 font-semibold transition-all",
          state.status === "success" && "shadow-md shadow-primary/20"
        )}
        variant={state.status === "success" ? "outline" : "default"}
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Syncing…</>
        ) : (
          <><RefreshCcw className="w-4 h-4" /> {buttonLabel}</>
        )}
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [stores,   setStores]   = useState<SyncState>(initialSync);
  const [orders,   setOrders]   = useState<SyncState>(initialSync);
  const [payments, setPayments] = useState<SyncState>(initialSync);

  // ── Sync handlers ───────────────────────────────────────────────────────

  async function syncStores() {
    setStores({ ...initialSync, status: "loading" });
    try {
      const result = await api.post<Record<string, unknown>>(
        "/smartkitchen-stores/admin/sync"
      );
      setStores({ status: "success", result, errorMsg: null, lastRun: new Date() });
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setStores({
        status: "error",
        result: null,
        errorMsg: e.detail ?? "Store sync failed.",
        lastRun: new Date(),
      });
    }
  }

  async function syncOrders() {
    setOrders({ ...initialSync, status: "loading" });
    try {
      const result = await api.post<Record<string, unknown>>(
        "/order-reports/admin/sync-nowV2"
      );
      setOrders({ status: "success", result, errorMsg: null, lastRun: new Date() });
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setOrders({
        status: "error",
        result: null,
        errorMsg: e.detail ?? "Order sync failed.",
        lastRun: new Date(),
      });
    }
  }

  async function syncPayments() {
    setPayments({ ...initialSync, status: "loading" });
    try {
      const result = await api.post<Record<string, unknown>>(
        "/order-reports/admin/payment-syncV2"
      );
      setPayments({
        status: "success",
        result,
        errorMsg: null,
        lastRun: new Date(),
      });
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setPayments({
        status: "error",
        result: null,
        errorMsg: e.detail ?? "Payment sync failed.",
        lastRun: new Date(),
      });
    }
  }

  // ── Sync all ────────────────────────────────────────────────────────────

  const isAnySyncing =
    stores.status === "loading" ||
    orders.status === "loading" ||
    payments.status === "loading";

  async function syncAll() {
    await Promise.allSettled([syncStores(), syncOrders(), syncPayments()]);
  }

  return (

    <div className="min-h-screen bg-background">
      <AdminNav />

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 text-xs font-semibold">
                Admin
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Control Panel</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manually trigger data synchronisation from Uber's API.
            </p>
          </div>

          {/* Sync all + quick links */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isAnySyncing}
              onClick={syncAll}
              className="gap-1.5 font-semibold shadow-md shadow-primary/20"
            >
              {isAnySyncing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</>
                : <><RefreshCcw className="w-3.5 h-3.5" /> Sync All</>
              }
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Stores",  href: "/admin/stores",  icon: Store        },
              { label: "Orders",  href: "/admin/orders",  icon: ShoppingBag  },
              { label: "Refunds", href: "/admin/refunds", icon: CreditCard   },
              { label: "Users",   href: "/admin/users",   icon: Users        },
            ].map((l) => (
              <Link key={l.href} href={l.href}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                  <l.icon className="w-3.5 h-3.5" />
                  {l.label}
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Sync cards ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold">Manual Sync</h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Runs in background thread</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SyncCard
              icon={Store}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              title="Stores"
              description="Pull all SmartKitchen stores from Uber's API, upsert into the database, and auto-verify any pending user stores."
              buttonLabel="Sync Stores"
              state={stores}
              onSync={syncStores}
            />
            <SyncCard
              icon={ShoppingBag}
              iconColor="text-sky-500"
              iconBg="bg-sky-500/10"
              title="Orders"
              description="Fetch all cancelled and contested orders for every active SmartKitchen store. Both report types run in one call."
              buttonLabel="Sync Orders"
              state={orders}
              onSync={syncOrders}
            />
            <SyncCard
              icon={CreditCard}
              iconColor="text-violet-500"
              iconBg="bg-violet-500/10"
              title="Payments"
              description="Trigger a Payment Details Report for all active stores. Saves only rows marked as restaurant refunds."
              buttonLabel="Sync Payments"
              state={payments}
              onSync={syncPayments}
            />
          </div>
        </div>

        {/* ── Status summary ─────────────────────────────────── */}
        {(stores.lastRun || orders.lastRun || payments.lastRun) && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold">Last Run Summary</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Stores",   state: stores   },
                { label: "Orders",   state: orders   },
                { label: "Payments", state: payments },
              ].map(({ label, state }) => (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3",
                    state.status === "success" && "border-primary/20 bg-primary/5",
                    state.status === "error"   && "border-destructive/20 bg-destructive/5",
                    !state.lastRun             && "border-border bg-muted/30 opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      state.status === "success" && "bg-primary",
                      state.status === "error"   && "bg-destructive",
                      state.status === "loading" && "bg-amber-400 animate-pulse",
                      !state.lastRun             && "bg-muted-foreground/30"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {state.status === "success" && state.lastRun
                        ? `Completed at ${state.lastRun.toLocaleTimeString()}`
                        : state.status === "error"
                        ? state.errorMsg ?? "Failed"
                        : state.status === "loading"
                        ? "Running…"
                        : "Not run yet"}
                    </p>
                  </div>
                  {state.status === "success" && (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  )}
                  {state.status === "error" && (
                    <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
