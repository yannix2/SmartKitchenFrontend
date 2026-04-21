"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { AdminNav } from "@/components/layout/admin-nav";
import { cn } from "@/lib/utils";
import type { CancelledOrder, ContestedOrder, RemboursementStatus } from "@/types";

interface SimpleStore { store_id: string; store_name: string }

const LIMIT = 25;

const REMBOURS_OPTIONS = [
  { value: "",             label: "All Statuses"  },
  { value: "en attente",   label: "En attente"    },
  { value: "email envoyé", label: "Email envoyé"  },
  { value: "remboursé",    label: "Remboursé"     },
];

function RemboursementBadge({ status }: { status: RemboursementStatus }) {
  if (status === "remboursé")
    return <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> Remboursé</Badge>;
  if (status === "email envoyé")
    return <Badge variant="outline" className="gap-1 border-sky-400/50 text-sky-500 bg-sky-500/5 text-xs whitespace-nowrap"><Mail className="w-3 h-3" /> Email envoyé</Badge>;
  return <Badge variant="outline" className="gap-1 text-xs text-muted-foreground whitespace-nowrap"><Clock className="w-3 h-3" /> En attente</Badge>;
}

function SendEmailsButton({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg]     = useState("");

  async function send() {
    setState("loading");
    try {
      const r = await api.post<{ sent: number; skipped_no_proof: number; errors: number }>(
        "/order-proofs/admin/send-refund-emails"
      );
      setMsg(`${r.sent} sent · ${r.skipped_no_proof} skipped · ${r.errors} errors`);
      setState("done");
      setTimeout(() => { setState("idle"); onDone(); }, 4000);
    } catch (err: unknown) {
      setMsg((err as { detail?: string }).detail ?? "Failed to send emails");
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {(state === "done" || state === "error") && (
        <span className={cn("text-xs font-medium flex items-center gap-1", state === "done" ? "text-primary" : "text-destructive")}>
          {state === "done" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {msg}
        </span>
      )}
      <Button size="sm" onClick={send} disabled={state === "loading"} className="gap-1.5">
        {state === "loading" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</> : <><Send className="w-3.5 h-3.5" /> Send Refund Emails</>}
      </Button>
    </div>
  );
}

type Tab = "cancelled" | "contested";

export default function AdminOrdersPage() {
  const [tab, setTab]               = useState<Tab>("cancelled");
  const [stores, setStores]         = useState<SimpleStore[]>([]);
  const [items, setItems]           = useState<(CancelledOrder | ContestedOrder)[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [storeId, setStoreId]       = useState("");
  const [rembStatus, setRembStatus] = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");

  useEffect(() => {
    // Admin list returns array [{store_id, store_name}]
    api.get<SimpleStore[]>("/smartkitchen-stores/admin/list")
      .then((d) => setStores(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (storeId)    params.set("store_id", storeId);
      if (rembStatus) params.set("remboursement_status", rembStatus);
      if (dateFrom)   params.set("start_date", dateFrom);
      if (dateTo)     params.set("end_date", dateTo);

      if (tab === "cancelled") {
        const data = await api.get<{ total: number; cancelled_orders: CancelledOrder[] }>(
          `/order-reports/my-cancelled?${params}`
        );
        setItems(data.cancelled_orders ?? []);
        setTotal(data.total ?? 0);
      } else {
        const data = await api.get<{ total: number; contested_orders: ContestedOrder[] }>(
          `/order-reports/my-contested?${params}`
        );
        setItems(data.contested_orders ?? []);
        setTotal(data.total ?? 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page, storeId, rembStatus, dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Client-side text search
  const displayed = search
    ? items.filter((o) =>
        o.order_id.toLowerCase().includes(search.toLowerCase()) ||
        o.store_name.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  function resetFilters() { setSearch(""); setStoreId(""); setRembStatus(""); setDateFrom(""); setDateTo(""); setPage(0); }
  function switchTab(t: Tab) { setTab(t); setPage(0); }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || storeId || rembStatus || dateFrom || dateTo);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-sky-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Orders</h1>
            </div>
            <p className="text-sm text-muted-foreground">{total.toLocaleString()} {tab} order{total !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tab === "contested" && <SendEmailsButton onDone={fetchOrders} />}
            <Button size="sm" variant="outline" onClick={fetchOrders} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {(["cancelled", "contested"] as Tab[]).map((t) => (
            <button key={t} onClick={() => switchTab(t)} className={cn(
              "px-4 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search order ID or store…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={storeId} onChange={(e) => { setStoreId(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
          </select>
          <select value={rembStatus} onChange={(e) => { setRembStatus(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
            {REMBOURS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex gap-2 items-center">
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="text-xs" title="From" />
            <span className="text-muted-foreground text-xs shrink-0">to</span>
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="text-xs" title="To" />
          </div>
        </div>

        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
            Clear all filters
          </button>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            {tab === "cancelled" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden md:table-cell">Store</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden sm:table-cell">Items</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Remboursement</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</td></tr>
                  ) : displayed.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">No orders found</td></tr>
                  ) : (displayed as CancelledOrder[]).map((o) => (
                    <tr key={o.order_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{o.order_id}</code></td>
                      <td className="px-4 py-3 text-xs hidden md:table-cell"><p className="font-medium">{o.store_name}</p><p className="text-muted-foreground">{o.store_id}…</p></td>
                      <td className="px-4 py-3 text-xs hidden sm:table-cell">{o.menu_item_count}</td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Badge variant="outline" className="text-xs">{o.order_status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{o.date_ordered ? new Date(o.date_ordered).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3"><RemboursementBadge status={o.remboursement_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                    <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</td></tr>
                  ) : displayed.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">No orders found</td></tr>
                  ) : (displayed as ContestedOrder[]).map((o) => (
                    <tr key={o.order_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{o.order_id}</code></td>
                      <td className="px-4 py-3 text-xs hidden md:table-cell"><p className="font-medium">{o.store_name}</p><p className="text-muted-foreground">{o.city}</p></td>
                      <td className="px-4 py-3 text-xs hidden sm:table-cell max-w-[160px] truncate">{o.order_issue}</td>
                      <td className="px-4 py-3 text-xs hidden lg:table-cell">{o.ticket_size} {o.currency_code}</td>
                      <td className="px-4 py-3 text-xs hidden lg:table-cell font-semibold text-amber-600 dark:text-amber-400">{o.refund_covered_by_merchant} {o.currency_code}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{o.time_customer_ordered ? new Date(o.time_customer_ordered).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3"><RemboursementBadge status={o.remboursement_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages} — {total} orders</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => p + 1)} className="gap-1">Next <ChevronRight className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
