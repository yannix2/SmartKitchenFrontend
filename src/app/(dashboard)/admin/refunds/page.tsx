"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Search,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Link2,
  Link2Off,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { AdminNav } from "@/components/layout/admin-nav";
import { cn } from "@/lib/utils";
import type { StoreRefund } from "@/types";

interface SimpleStore { store_id: string; store_name: string }
interface RefundListResponse { total: number; skip: number; limit: number; refunds: StoreRefund[] }

interface SuggestionCandidate {
  order_id: string;
  order_uuid: string;
  refund_covered_by_merchant: string;
  date: string;
}

const LIMIT = 25;
const LINKED_OPTIONS = [
  { value: "", label: "All" },
  { value: "linked", label: "Linked" },
  { value: "unlinked", label: "Unlinked" },
];

// ── Link-order modal ──────────────────────────────────────────────────────────

function LinkOrderModal({ refund, suggestions, onClose, onLinked }: {
  refund: StoreRefund;
  suggestions: SuggestionCandidate[];
  onClose: () => void;
  onLinked: () => void;
}) {
  const [orderId, setOrderId] = useState("");
  const [linking, setLinking] = useState(false);
  const [error, setError]     = useState("");

  async function link(oid: string) {
    if (!oid.trim()) return;
    setLinking(true);
    setError("");
    try {
      await api.patch(`/store-refunds/${refund.id}/link-order`, { linked_order_id: oid.trim() });
      onLinked();
      onClose();
    } catch (err: unknown) {
      setError((err as { detail?: string }).detail ?? "Failed to link order");
      setLinking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md space-y-5 p-6 animate-fade-in-up">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">Link Order</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Refund #{refund.id} · <span className="font-semibold text-violet-500">{refund.amount}</span> · {refund.store_name}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Suggested matches</p>
            {suggestions.map((s) => (
              <button
                key={s.order_id}
                onClick={() => link(s.order_id)}
                disabled={linking}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
              >
                <div>
                  <p className="text-xs font-semibold font-mono">{s.order_id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()} · {s.refund_covered_by_merchant}</p>
                </div>
                <Link2 className="w-4 h-4 text-primary shrink-0" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {suggestions.length > 0 ? "Or enter manually" : "Enter order ID"}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Order ID…"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 font-mono text-xs"
              onKeyDown={(e) => e.key === "Enter" && link(orderId)}
            />
            <Button size="sm" onClick={() => link(orderId)} disabled={linking || !orderId.trim()} className="gap-1.5">
              {linking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
              Link
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function RefundRow({ refund, onLink, onUnlink }: { refund: StoreRefund; onLink: () => void; onUnlink: () => void }) {
  const [expanded, setExpanded]   = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  async function handleUnlink(e: React.MouseEvent) {
    e.stopPropagation();
    setUnlinking(true);
    try {
      await api.patch(`/store-refunds/${refund.id}/unlink-order`, {});
      onUnlink();
    } finally {
      setUnlinking(false);
    }
  }

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", expanded && "rotate-180")} />
            <span className="font-semibold text-sm text-violet-500">{refund.amount}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs hidden md:table-cell">
          <p className="font-medium">{refund.store_name}</p>
          <p className="text-muted-foreground">{refund.store_id.slice(0, 8)}…</p>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
          {refund.refund_date ? new Date(refund.refund_date).toLocaleDateString() : "—"}
        </td>
        <td className="px-4 py-3">
          {refund.linked_order_id
            ? <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs"><Link2 className="w-3 h-3" /> {refund.linked_order_id}</Badge>
            : <Badge variant="outline" className="gap-1 text-xs text-muted-foreground"><Link2Off className="w-3 h-3" /> Unlinked</Badge>
          }
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {refund.linked_order_id ? (
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7 px-2.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60" onClick={handleUnlink} disabled={unlinking}>
              {unlinking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2Off className="w-3 h-3" />} Unlink
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7 px-2.5" onClick={onLink}>
              <Link2 className="w-3 h-3" /> Link
            </Button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border/50 bg-muted/20">
          <td colSpan={5} className="px-6 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div><p className="text-muted-foreground mb-0.5">Payout Ref</p><code className="font-mono">{refund.payout_reference_id || "—"}</code></div>
              <div><p className="text-muted-foreground mb-0.5">Linked Order</p><code className="font-mono">{refund.linked_order_id ?? "—"}</code></div>
              <div><p className="text-muted-foreground mb-0.5">Report Job</p><code className="font-mono text-[10px]">{refund.report_job_id}</code></div>
              <div><p className="text-muted-foreground mb-0.5">Fetched</p><span>{refund.fetched_at ? new Date(refund.fetched_at).toLocaleString() : "—"}</span></div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminRefundsPage() {
  const [stores, setStores]           = useState<SimpleStore[]>([]);
  const [refunds, setRefunds]         = useState<StoreRefund[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [linkTarget, setLinkTarget]   = useState<StoreRefund | null>(null);
  const [linkCandidates, setCandidates] = useState<SuggestionCandidate[]>([]);
  const [linkSuccess, setLinkSuccess] = useState<number | null>(null);
  const [search, setSearch]           = useState("");
  const [storeId, setStoreId]         = useState("");
  const [linkedFilter, setLinked]     = useState("");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");

  useEffect(() => {
    api.get<SimpleStore[]>("/smartkitchen-stores/admin/list")
      .then((d) => setStores(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (storeId)              params.set("store_id", storeId);
      if (linkedFilter === "linked")   params.set("linked", "true");
      if (linkedFilter === "unlinked") params.set("linked", "false");
      if (dateFrom)             params.set("date_from", dateFrom);
      if (dateTo)               params.set("date_to", dateTo);
      const data = await api.get<RefundListResponse>(`/store-refunds?${params}`);
      setRefunds(data.refunds ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, [page, storeId, linkedFilter, dateFrom, dateTo]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const displayed = search
    ? refunds.filter((r) =>
        r.store_name.toLowerCase().includes(search.toLowerCase()) ||
        r.payout_reference_id?.toLowerCase().includes(search.toLowerCase())
      )
    : refunds;

  async function openLinkModal(refund: StoreRefund) {
    setLinkTarget(refund);
    setCandidates([]);
    try {
      const d = await api.get<{ refund_id: number; candidates: SuggestionCandidate[] }>(
        `/store-refunds/${refund.id}/suggest-orders`
      );
      setCandidates(d.candidates ?? []);
    } catch {
      setCandidates([]);
    }
  }

  function resetFilters() { setSearch(""); setStoreId(""); setLinked(""); setDateFrom(""); setDateTo(""); setPage(0); }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || storeId || linkedFilter || dateFrom || dateTo);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      {linkTarget && (
        <LinkOrderModal
          refund={linkTarget}
          suggestions={linkCandidates}
          onClose={() => { setLinkTarget(null); setCandidates([]); }}
          onLinked={() => {
            setLinkSuccess(linkTarget.id);
            setTimeout(() => setLinkSuccess(null), 3000);
            fetchRefunds();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-violet-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Refunds</h1>
            </div>
            <p className="text-sm text-muted-foreground">{total.toLocaleString()} refund{total !== 1 ? "s" : ""} total</p>
          </div>
          <div className="flex items-center gap-3">
            {linkSuccess !== null && (
              <span className="text-xs text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Refund #{linkSuccess} linked
              </span>
            )}
            <Button size="sm" variant="outline" onClick={fetchRefunds} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search payout ref or store…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={storeId} onChange={(e) => { setStoreId(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
          </select>
          <select value={linkedFilter} onChange={(e) => { setLinked(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
            {LINKED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden md:table-cell">Store</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Linked</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading refunds…</td></tr>
                ) : displayed.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">No refunds found</td></tr>
                ) : displayed.map((r) => (
                  <RefundRow key={r.id} refund={r} onLink={() => openLinkModal(r)} onUnlink={fetchRefunds} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages} — {total} refunds</p>
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
