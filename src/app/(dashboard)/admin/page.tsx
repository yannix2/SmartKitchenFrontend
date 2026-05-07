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
import { useT } from "@/i18n/provider";

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
  syncingLabel?: string;
  runningLabel?: string;
  completedLabel?: string;
  failedLabel?: string;
  lastRunLabel?: string;
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
  syncingLabel = "Syncing…",
  runningLabel = "Running…",
  completedLabel = "Completed",
  failedLabel = "Failed",
  lastRunLabel = "Last run",
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
            {lastRunLabel} {state.lastRun.toLocaleTimeString()}
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
              <Loader2 className="w-3 h-3 animate-spin" /> {runningLabel}
            </Badge>
          )}
          {state.status === "success" && (
            <Badge variant="outline" className="gap-1.5 text-xs border-primary/40 text-primary bg-primary/5">
              <CheckCircle2 className="w-3 h-3" /> {completedLabel}
            </Badge>
          )}
          {state.status === "error" && (
            <Badge variant="outline" className="gap-1.5 text-xs border-destructive/40 text-destructive bg-destructive/5">
              <XCircle className="w-3 h-3" /> {failedLabel}
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
          <><Loader2 className="w-4 h-4 animate-spin" /> {syncingLabel}</>
        ) : (
          <><RefreshCcw className="w-4 h-4" /> {buttonLabel}</>
        )}
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const t = useT({
    fr: {
      admin: "Admin", title: "Panneau de contrôle",
      lead: "Déclencher manuellement la synchronisation des données depuis l'API d'Uber.",
      syncing: "Synchronisation…", sync_all: "Tout synchroniser",
      manual_sync: "Synchronisation manuelle", bg_thread: "S'exécute en arrière-plan",
      stores: "Restaurants", orders: "Commandes", refunds: "Remboursements", users: "Utilisateurs", payments: "Paiements",
      stores_desc: "Récupère tous les restaurants SmartKitchen depuis l'API Uber, met à jour la base de données et auto-vérifie les restaurants utilisateurs en attente.",
      orders_desc: "Récupère toutes les commandes annulées et contestées pour chaque restaurant SmartKitchen actif. Les deux types de rapports en un seul appel.",
      payments_desc: "Déclenche un rapport de détails de paiement pour tous les restaurants actifs. Sauvegarde uniquement les lignes marquées comme remboursements restaurant.",
      sync_stores: "Synchroniser restaurants", sync_orders: "Synchroniser commandes", sync_payments: "Synchroniser paiements",
      last_run: "Dernier résumé", completed_at: "Terminé à", completed: "Terminé",
      failed: "Échec", running: "En cours…", not_run_yet: "Pas encore exécuté",
      sync_failed_stores: "Échec de la synchronisation des restaurants.",
      sync_failed_orders: "Échec de la synchronisation des commandes.",
      sync_failed_payments: "Échec de la synchronisation des paiements.",
    },
    en: {
      admin: "Admin", title: "Control Panel",
      lead: "Manually trigger data synchronisation from Uber's API.",
      syncing: "Syncing…", sync_all: "Sync All",
      manual_sync: "Manual Sync", bg_thread: "Runs in background thread",
      stores: "Stores", orders: "Orders", refunds: "Refunds", users: "Users", payments: "Payments",
      stores_desc: "Pull all SmartKitchen stores from Uber's API, upsert into the database, and auto-verify any pending user stores.",
      orders_desc: "Fetch all cancelled and contested orders for every active SmartKitchen store. Both report types run in one call.",
      payments_desc: "Trigger a Payment Details Report for all active stores. Saves only rows marked as restaurant refunds.",
      sync_stores: "Sync Stores", sync_orders: "Sync Orders", sync_payments: "Sync Payments",
      last_run: "Last Run Summary", completed_at: "Completed at", completed: "Completed",
      failed: "Failed", running: "Running…", not_run_yet: "Not run yet",
      sync_failed_stores: "Store sync failed.",
      sync_failed_orders: "Order sync failed.",
      sync_failed_payments: "Payment sync failed.",
    },
  });
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
        errorMsg: e.detail ?? t.sync_failed_stores,
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
        errorMsg: e.detail ?? t.sync_failed_orders,
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
        errorMsg: e.detail ?? t.sync_failed_payments,
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
    <div className="max-w-450 mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 text-xs font-semibold">
                {t.admin}
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>
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
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.syncing}</>
                : <><RefreshCcw className="w-3.5 h-3.5" /> {t.sync_all}</>
              }
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: t.stores,  href: "/admin/stores",  icon: Store        },
              { label: t.orders,  href: "/admin/orders",  icon: ShoppingBag  },
              { label: t.refunds, href: "/admin/refunds", icon: CreditCard   },
              { label: t.users,   href: "/admin/users",   icon: Users        },
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
            <h2 className="text-lg font-bold">{t.manual_sync}</h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t.bg_thread}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SyncCard
              icon={Store}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              title={t.stores}
              description={t.stores_desc}
              buttonLabel={t.sync_stores}
              syncingLabel={t.syncing}
              runningLabel={t.running}
              completedLabel={t.completed}
              failedLabel={t.failed}
              state={stores}
              onSync={syncStores}
            />
            <SyncCard
              icon={ShoppingBag}
              iconColor="text-sky-500"
              iconBg="bg-sky-500/10"
              title={t.orders}
              description={t.orders_desc}
              buttonLabel={t.sync_orders}
              syncingLabel={t.syncing}
              runningLabel={t.running}
              completedLabel={t.completed}
              failedLabel={t.failed}
              state={orders}
              onSync={syncOrders}
            />
            <SyncCard
              icon={CreditCard}
              iconColor="text-violet-500"
              iconBg="bg-violet-500/10"
              title={t.payments}
              description={t.payments_desc}
              buttonLabel={t.sync_payments}
              syncingLabel={t.syncing}
              runningLabel={t.running}
              completedLabel={t.completed}
              failedLabel={t.failed}
              state={payments}
              onSync={syncPayments}
            />
          </div>
        </div>

        {/* ── Status summary ─────────────────────────────────── */}
        {(stores.lastRun || orders.lastRun || payments.lastRun) && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold">{t.last_run}</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: t.stores,   state: stores   },
                { label: t.orders,   state: orders   },
                { label: t.payments, state: payments },
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
                        ? `${t.completed_at} ${state.lastRun.toLocaleTimeString()}`
                        : state.status === "error"
                        ? state.errorMsg ?? t.failed
                        : state.status === "loading"
                        ? t.running
                        : t.not_run_yet}
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
  );
}
