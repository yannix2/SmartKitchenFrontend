"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Search,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Mail,
  Send,
  Zap,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ContestedOrder, RemboursementStatus, UserStore } from "@/types";

const REMBOURS_OPTIONS = [
  { value: "",             label: "All statuses"  },
  { value: "en attente",   label: "En attente"    },
  { value: "email envoyé", label: "Email envoyé"  },
  { value: "remboursé",    label: "Remboursé"     },
];

const LIMIT = 25;

function RemBadge({ status }: { status: RemboursementStatus }) {
  if (status === "remboursé")
    return <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs whitespace-nowrap"><CheckCircle2 className="w-3 h-3" />Remboursé</Badge>;
  if (status === "email envoyé")
    return <Badge variant="outline" className="gap-1 border-sky-400/50 text-sky-500 bg-sky-500/5 text-xs whitespace-nowrap"><Mail className="w-3 h-3" />Email envoyé</Badge>;
  return <Badge variant="outline" className="gap-1 text-xs text-muted-foreground whitespace-nowrap"><Clock className="w-3 h-3" />En attente</Badge>;
}

function SendEmailsButton({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg]     = useState("");

  async function send() {
    setState("loading");
    try {
      const r = await api.post<{ sent: number; skipped_no_proof: number; errors: number }>(
        "/order-proofs/send-refund-emails"
      );
      setMsg(`${r.sent} email(s) sent · ${r.skipped_no_proof} skipped (no proof)`);
      setState("done");
      setTimeout(() => { setState("idle"); onDone(); }, 4000);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setMsg(e.detail ?? "Failed to send emails");
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {(state === "done" || state === "error") && (
        <span className={cn(
          "text-xs font-medium flex items-center gap-1",
          state === "done" ? "text-primary" : "text-destructive"
        )}>
          {state === "done"
            ? <CheckCircle2 className="w-3.5 h-3.5" />
            : <XCircle className="w-3.5 h-3.5" />
          }
          {msg}
        </span>
      )}
      <Button size="sm" onClick={send} disabled={state === "loading"} className="gap-1.5">
        {state === "loading"
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
          : <><Send className="w-3.5 h-3.5" /> Send Refund Emails</>
        }
      </Button>
    </div>
  );
}

export default function ContestedOrdersPage() {
  const [orders, setOrders]   = useState<ContestedOrder[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [stores, setStores]   = useState<UserStore[]>([]);
  const [search, setSearch]   = useState("");
  const [rembStatus, setRemb] = useState("");
  const [storeId, setStoreId] = useState("");
  const [dateFrom, setFrom]   = useState("");
  const [dateTo, setTo]       = useState("");

  useEffect(() => {
    api.get<UserStore[]>("/smartkitchen-stores/my")
      .then((d) => setStores(d ?? []))
      .catch(() => {});
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (rembStatus) p.set("remboursement_status", rembStatus);
      if (storeId)    p.set("store_id", storeId);
      if (dateFrom)   p.set("start_date", dateFrom);
      if (dateTo)     p.set("end_date", dateTo);
      const d = await api.get<{ total: number; contested_orders: ContestedOrder[] }>(
        `/order-reports/my-contested?${p}`
      );
      setOrders(d.contested_orders ?? []);
      setTotal(d.total ?? 0);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, rembStatus, storeId, dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const displayed = search
    ? orders.filter((o) =>
        o.order_id.toLowerCase().includes(search.toLowerCase()) ||
        o.store_name.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  async function triggerSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const p = new URLSearchParams();
      if (storeId)  p.set("store_id", storeId);
      if (dateFrom) p.set("start_date", dateFrom);
      if (dateTo)   p.set("end_date", dateTo);
      const d = await api.get<{ triggered_jobs: string[] }>(
        `/order-reports/get-contested-orders?${p}`
      );
      setSyncMsg(`Sync triggered — ${d.triggered_jobs?.length ?? 0} job(s) started. Refresh to see fresh data.`);
      setTimeout(fetchOrders, 2000);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setSyncMsg(e.detail ?? "Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || rembStatus || storeId || dateFrom || dateTo);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-sky-500" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Contested Orders</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} orders stored</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SendEmailsButton onDone={fetchOrders} />
          <Button size="sm" variant="outline" onClick={triggerSync} disabled={syncing || loading} className="gap-1.5">
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Fetch Fresh Data
          </Button>
          <Button size="sm" variant="outline" onClick={fetchOrders} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      {syncMsg && (
        <div className={cn(
          "flex items-start gap-2 rounded-xl border px-4 py-3 text-xs",
          syncMsg.includes("failed") || syncMsg.includes("Failed")
            ? "border-destructive/20 bg-destructive/5 text-destructive"
            : "border-primary/20 bg-primary/5 text-primary"
        )}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {syncMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search order ID or store…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={rembStatus}
          onChange={(e) => { setRemb(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          {REMBOURS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={storeId}
          onChange={(e) => { setStoreId(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">All Stores</option>
          {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
        </select>
        <div className="flex gap-2 items-center">
          <Input type="date" value={dateFrom} onChange={(e) => { setFrom(e.target.value); setPage(0); }} className="text-xs" />
          <span className="text-muted-foreground text-xs shrink-0">to</span>
          <Input type="date" value={dateTo} onChange={(e) => { setTo(e.target.value); setPage(0); }} className="text-xs" />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setRemb(""); setStoreId(""); setFrom(""); setTo(""); setPage(0); }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Clear filters
        </button>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden md:table-cell">Store</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden sm:table-cell">Issue</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">Ticket</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">Merchant</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Remboursement</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…
                </td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-muted-foreground">No orders found</td></tr>
              ) : displayed.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{o.order_id}</code></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs font-medium">{o.store_name}</p>
                    <p className="text-[10px] text-muted-foreground">{o.city}</p>
                  </td>
                  <td className="px-4 py-3 text-xs hidden sm:table-cell max-w-40">
                    <p className="truncate">{o.order_issue}</p>
                    {o.inaccurate_items && <p className="text-[10px] text-muted-foreground truncate">{o.inaccurate_items}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell font-semibold">
                    {o.ticket_size} <span className="font-normal text-muted-foreground">{o.currency_code}</span>
                  </td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{o.refund_covered_by_merchant}</span>
                    <span className="text-muted-foreground"> {o.currency_code}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {o.time_customer_ordered ? new Date(o.time_customer_ordered).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3"><RemBadge status={o.remboursement_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => p + 1)} className="gap-1">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
