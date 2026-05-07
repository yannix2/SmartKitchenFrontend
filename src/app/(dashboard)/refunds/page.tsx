"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  CreditCard, Search, RefreshCcw, Loader2, ChevronLeft, ChevronRight,
  Link2, Link2Off, ChevronDown, TrendingUp, Store, Calendar,
  ExternalLink, Bell, Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";
import { SortableHeader, type SortDir } from "@/components/ui/sortable-header";
import { useUrlState } from "@/hooks/use-url-state";
import { useT } from "@/i18n/provider";
import type { StoreRefund, UserStore, WalletData } from "@/types";

interface RefundListResponse { total: number; refunds: StoreRefund[] }

const LIMIT = 25;

// ── Wallet ────────────────────────────────────────────────────────────────────

function WalletSection({ wallet, loading }: { wallet: WalletData | null; loading: boolean }) {
  const [showStores, setShowStores] = useState(false);
  const [showMonths, setShowMonths] = useState(false);

  if (loading) return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
    </div>
  );
  if (!wallet) return null;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/5 to-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-violet-500" />
        </div>
        <h2 className="font-bold text-sm">Wallet</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-stagger-cards>
        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Income</p>
          <p className="text-2xl font-black text-violet-500 tabular-nums">
            <AnimatedCounter value={wallet.total_income} suffix=" €" />
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Refunds</p>
          <p className="text-2xl font-black tabular-nums"><AnimatedCounter value={wallet.refund_count} decimals={0} /></p>
        </div>
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Stores</p>
          <p className="text-2xl font-black tabular-nums"><AnimatedCounter value={wallet.by_store.length} decimals={0} /></p>
        </div>
      </div>

      {wallet.by_store.length > 0 && (
        <div className="space-y-2">
          <button onClick={() => setShowStores(v => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <Store className="w-3.5 h-3.5" />Income by store<ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showStores && "rotate-180")} />
          </button>
          {showStores && (
            <div className="space-y-1.5">
              {wallet.by_store.map(s => {
                const pct = wallet.total_income > 0 ? (s.total / wallet.total_income) * 100 : 0;
                return (
                  <div key={s.store_id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{s.store_name}</p>
                      <div className="h-1 rounded-full bg-muted mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-violet-500">{s.total.toFixed(2)} €</p>
                      <p className="text-[10px] text-muted-foreground">{s.count} refund{s.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {wallet.by_month.length > 0 && (
        <div className="space-y-2">
          <button onClick={() => setShowMonths(v => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="w-3.5 h-3.5" />Income by month<ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showMonths && "rotate-180")} />
          </button>
          {showMonths && (
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-1">
                {wallet.by_month.map(m => {
                  const [y, mo] = m.month.split("-");
                  const label = new Date(Number(y), Number(mo) - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
                  return (
                    <div key={m.month} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted/40 border border-border min-w-18">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-sm font-bold text-violet-500">{m.total.toFixed(0)}€</p>
                      <p className="text-[10px] text-muted-foreground">{m.count}x</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Unlinked alert (latest 5) ─────────────────────────────────────────────────

function UnlinkedAlert({ refunds }: { refunds: StoreRefund[] }) {
  if (refunds.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-xs font-bold text-amber-600">
          {refunds.length} unlinked refund{refunds.length > 1 ? "s" : ""} detected — our team is matching them automatically
        </p>
      </div>
      <div className="space-y-1.5">
        {refunds.map(r => (
          <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-card border border-border text-xs">
            <span className="font-bold text-amber-500">{r.amount} €</span>
            <span className="flex-1 truncate text-muted-foreground">{r.store_name}</span>
            <span className="text-muted-foreground shrink-0">
              {r.refund_date ? new Date(r.refund_date).toLocaleDateString("fr-FR") : "—"}
            </span>
            <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground shrink-0 py-0">
              <Link2Off className="w-2.5 h-2.5" />Unlinked
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Linked refund row ─────────────────────────────────────────────────────────

function RefundRow({ refund, onStoreClick }: { refund: StoreRefund; onStoreClick: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-border/50 hover:bg-muted/30 row-hover-lift cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", expanded && "rotate-180")} />
            <span className="font-bold text-violet-500">{refund.amount} €</span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs hidden md:table-cell">
          <button
            className="text-left hover:text-primary transition-colors"
            onClick={e => { e.stopPropagation(); onStoreClick(refund.store_id); }}
          >
            <p className="font-medium">{refund.store_name}</p>
            <p className="text-muted-foreground">{refund.store_id.slice(0, 8)}…</p>
          </button>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
          {refund.refund_date ? new Date(refund.refund_date).toLocaleDateString("fr-FR") : "—"}
        </td>
        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
          {refund.linked_order_id ? (
            <Link
              href={`/orders/contested?q=${encodeURIComponent(refund.linked_order_id)}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-primary/40 text-primary bg-primary/5 text-xs font-medium hover:bg-primary/10 transition-colors"
            >
              <Link2 className="w-3 h-3 shrink-0" />
              <span className="font-mono truncate max-w-32">{refund.linked_order_id}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
            </Link>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
              <Link2Off className="w-3 h-3" />Unlinked
            </Badge>
          )}
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-border/50 bg-muted/20 animate-fade-in">
          <td colSpan={4} className="px-6 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-0.5">Payout Reference</p>
                <code className="font-mono select-all break-all">{refund.payout_reference_id || "—"}</code>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Linked Order</p>
                <code className="font-mono">{refund.linked_order_id ?? "—"}</code>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Fetched At</p>
                <span>{refund.fetched_at ? new Date(refund.fetched_at).toLocaleString("fr-FR") : "—"}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RefundsPage() {
  const t = useT({
    fr: { title: "Remboursements", linked: "remboursement(s) lié(s)", refresh: "Actualiser", auto_t: "Tout est automatique", auto_b: "Nous détectons, récupérons et associons vos remboursements automatiquement. Aucune action requise.", search: "Rechercher restaurant, référence ou ID commande…", all_stores: "Tous les restaurants", clear_filters: "Effacer les filtres", no_refunds: "Aucun remboursement trouvé", page: "Page", of: "sur", refunds_word: "remboursements" },
    en: { title: "Refunds", linked: "linked refund(s)", refresh: "Refresh", auto_t: "Everything is automatic", auto_b: "We detect, fetch, and match your refunds automatically. No action needed on your end.", search: "Search store, payout ref, or order ID…", all_stores: "All Stores", clear_filters: "Clear filters", no_refunds: "No refunds found", page: "Page", of: "of", refunds_word: "refunds" },
  });
  const [stores, setStores]         = useState<UserStore[]>([]);
  const [refunds, setRefunds]       = useState<StoreRefund[]>([]);
  const [unlinked5, setUnlinked5]   = useState<StoreRefund[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useUrlState("q", "");
  const [backendSearch, setBS]      = useState("");
  const [storeId, setStoreId]       = useUrlState("store", "");
  const [sortField, setSortField]   = useState<string | null>(null);
  const [sortDir, setSortDir]       = useState<SortDir>(null);
  function handleSort(field: string, dir: SortDir) { setSortField(dir === null ? null : field); setSortDir(dir); }
  const [wallet, setWallet]         = useState<WalletData | null>(null);
  const [walletLoading, setWL]      = useState(true);
  const searchTimer                 = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.get<UserStore[]>("/smartkitchen-stores/my").then(d => setStores(d ?? [])).catch(() => {});
    api.get<WalletData>("/store-refunds/wallet").then(setWallet).catch(() => setWallet(null)).finally(() => setWL(false));
    api.get<RefundListResponse>("/store-refunds?linked=false&skip=0&limit=5")
      .then(d => setUnlinked5(d.refunds ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setBS(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (storeId)        p.set("store_id", storeId);
      if (backendSearch)  p.set("search", backendSearch);
      const d = await api.get<RefundListResponse>(`/store-refunds?${p}`);
      setRefunds(d.refunds ?? []);
      setTotal(d.total ?? 0);
    } catch { setRefunds([]); }
    finally { setLoading(false); }
  }, [page, storeId, backendSearch]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || storeId);

  const sortedRefunds = (() => {
    if (!sortField || !sortDir) return refunds;
    const arr = [...refunds].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (sortField === "amount") {
        const an = parseFloat(String(av).replace(",", "."));
        const bn = parseFloat(String(bv).replace(",", "."));
        if (!isNaN(an) && !isNaN(bn)) return an - bn;
      }
      return String(av).localeCompare(String(bv), undefined, { numeric: true });
    });
    return sortDir === "asc" ? arr : arr.reverse();
  })();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-350 mx-auto space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-violet-500" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total.toLocaleString("fr-FR")} {t.linked}</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchRefunds} disabled={loading} className="gap-1.5 self-start sm:self-auto">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          {t.refresh}
        </Button>
      </div>

      {/* Automation note */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-primary">{t.auto_t}</p>
          <p className="text-muted-foreground">{t.auto_b}</p>
        </div>
      </div>

      <WalletSection wallet={wallet} loading={walletLoading} />
      <UnlinkedAlert refunds={unlinked5} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t.search}
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={storeId}
          onChange={e => { setStoreId(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">{t.all_stores}</option>
          {stores.map(s => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setBS(""); setStoreId(""); setPage(0); }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          {t.clear_filters}
        </button>
      )}

      {/* Linked refunds table */}
      <div className="rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3"><SortableHeader field="amount" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Amount</SortableHeader></th>
                <th className="text-left px-4 py-3 hidden md:table-cell"><SortableHeader field="store_name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Store</SortableHeader></th>
                <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="refund_date" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Date</SortableHeader></th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Linked Order</th>
              </tr>
            </thead>
            <tbody data-stagger>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
              ) : sortedRefunds.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t.no_refunds}</p>
                </td></tr>
              ) : sortedRefunds.map(r => (
                <RefundRow key={r.id} refund={r} onStoreClick={id => { setStoreId(id); setPage(0); }} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)} className="gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage(p => p + 1)} className="gap-1">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
