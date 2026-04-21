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
  ChevronDown,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { StoreRefund, UserStore } from "@/types";

interface RefundListResponse {
  total: number;
  skip: number;
  limit: number;
  refunds: StoreRefund[];
}

interface RefundSuggestion {
  refund_id: number;
  store_name: string;
  refund_amount: string;
  refund_date: string;
  linked_order_id: string | null;
  contested_candidates: {
    order_id: string;
    order_uuid: string;
    refund_covered_by_merchant: string;
    date: string;
  }[];
}

const LIMIT = 25;

interface SuggestCandidate {
  order_id: string;
  order_uuid: string;
  refund_covered_by_merchant: string;
  date: string;
}

function RefundRow({ refund }: { refund: StoreRefund }) {
  const [expanded, setExpanded]         = useState(false);
  const [candidates, setCandidates]     = useState<SuggestCandidate[] | null>(null);
  const [loadingSugg, setLoadingSugg]   = useState(false);

  async function fetchSuggestions(e: React.MouseEvent) {
    e.stopPropagation();
    if (candidates !== null) { setCandidates(null); return; }
    setLoadingSugg(true);
    try {
      const d = await api.get<{ refund_id: number; candidates: SuggestCandidate[] }>(
        `/store-refunds/${refund.id}/suggest-orders`
      );
      setCandidates(d.candidates ?? []);
    } catch {
      setCandidates([]);
    } finally {
      setLoadingSugg(false);
    }
  }

  return (
    <>
      <tr
        className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", expanded && "rotate-180")} />
            <span className="font-bold text-violet-500">{refund.amount}</span>
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
          {refund.linked_order_id ? (
            <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs">
              <Link2 className="w-3 h-3" /> {refund.linked_order_id}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
              <Link2Off className="w-3 h-3" /> Unlinked
            </Badge>
          )}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={fetchSuggestions}
            disabled={loadingSugg}
            className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50"
          >
            {loadingSugg
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Sparkles className="w-3.5 h-3.5" />}
            {candidates !== null ? "Hide" : "Suggest"}
          </button>
        </td>
      </tr>

      {candidates !== null && (
        <tr className="border-b border-amber-500/10 bg-amber-500/5">
          <td colSpan={5} className="px-6 py-3">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Suggested Orders
              </p>
              {candidates.length === 0 ? (
                <p className="text-xs text-muted-foreground">No matching contested orders found for this refund amount.</p>
              ) : (
                <div className="space-y-1">
                  {candidates.map((c) => (
                    <div key={c.order_id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border text-xs">
                      <code className="font-mono font-bold">{c.order_id}</code>
                      <span className="text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString() : "—"}</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{c.refund_covered_by_merchant}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground pt-1">Contact your admin to link this refund to one of these orders.</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {expanded && (
        <tr className="border-b border-border/50 bg-muted/20">
          <td colSpan={5} className="px-6 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-0.5">Payout Reference</p>
                <code className="font-mono">{refund.payout_reference_id || "—"}</code>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Linked Order</p>
                <code className="font-mono">{refund.linked_order_id ?? "Not linked"}</code>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Fetched</p>
                <span>{refund.fetched_at ? new Date(refund.fetched_at).toLocaleString() : "—"}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function RefundsPage() {
  const [stores, setStores]       = useState<UserStore[]>([]);
  const [refunds, setRefunds]     = useState<StoreRefund[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [storeId, setStoreId]     = useState("");
  const [linked, setLinked]       = useState("");
  const [suggestions, setSugg]    = useState<RefundSuggestion[]>([]);
  const [showSugg, setShowSugg]   = useState(false);
  const [loadingSugg, setLoadSugg]= useState(false);

  useEffect(() => {
    api.get<UserStore[]>("/smartkitchen-stores/my")
      .then((d) => setStores(d ?? []))
      .catch(() => {});
  }, []);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (storeId)              p.set("store_id", storeId);
      if (linked === "linked")  p.set("linked", "true");
      if (linked === "unlinked")p.set("linked", "false");
      const d = await api.get<RefundListResponse>(`/store-refunds?${p}`);
      setRefunds(d.refunds ?? []);
      setTotal(d.total ?? 0);
    } catch {
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, [page, storeId, linked]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const displayed = search
    ? refunds.filter((r) =>
        r.store_name.toLowerCase().includes(search.toLowerCase()) ||
        r.payout_reference_id?.toLowerCase().includes(search.toLowerCase())
      )
    : refunds;

  async function loadSuggestions() {
    setLoadSugg(true);
    setShowSugg(true);
    try {
      const d = await api.get<{ total: number; suggestions: RefundSuggestion[] }>(
        "/store-refunds/suggest-orders"
      );
      setSugg((d.suggestions ?? []).filter((s) => s.contested_candidates.length > 0 && !s.linked_order_id));
    } catch {
      setSugg([]);
    } finally {
      setLoadSugg(false);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || storeId || linked);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5 text-violet-500" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Refunds</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} refund{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadSuggestions} disabled={loadingSugg} className="gap-1.5">
            {loadingSugg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
            Suggest Matches
          </Button>
          <Button size="sm" variant="outline" onClick={fetchRefunds} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Suggestions panel */}
      {showSugg && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm">Order Match Suggestions</h2>
            </div>
            <button onClick={() => setShowSugg(false)} className="text-xs text-muted-foreground hover:text-foreground">Hide</button>
          </div>
          {loadingSugg ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading suggestions…
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unlinked refunds with matching contested orders found.</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div key={s.refund_id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{s.store_name}</p>
                      <p className="text-xs text-muted-foreground">Refund #{s.refund_id} · <span className="font-bold text-violet-500">{s.refund_amount}</span> · {s.refund_date}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Candidate Orders</p>
                    {s.contested_candidates.map((c) => (
                      <div key={c.order_id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 text-xs">
                        <code className="font-mono font-bold">{c.order_id}</code>
                        <span className="text-muted-foreground">{new Date(c.date).toLocaleDateString()}</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{c.refund_covered_by_merchant}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Contact your admin to link this refund to an order.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search store or payout ref…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={storeId} onChange={(e) => { setStoreId(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          <option value="">All Stores</option>
          {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
        </select>
        <select value={linked} onChange={(e) => { setLinked(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          <option value="">All</option>
          <option value="linked">Linked</option>
          <option value="unlinked">Unlinked</option>
        </select>
      </div>

      {hasFilters && (
        <button onClick={() => { setSearch(""); setStoreId(""); setLinked(""); setPage(0); }} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
          Clear filters
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
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Linked Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…
                </td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">No refunds found</td></tr>
              ) : displayed.map((r) => <RefundRow key={r.id} refund={r} />)}
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
