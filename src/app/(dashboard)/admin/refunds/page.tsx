"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SkeletonRow } from "@/components/ui/skeleton";
import { SortableHeader, type SortDir } from "@/components/ui/sortable-header";
import { useToast } from "@/components/ui/toast";
import { useUrlState } from "@/hooks/use-url-state";
import { useT } from "@/i18n/provider";
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
  const toast = useToast();
  const [expanded, setExpanded]   = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  async function handleUnlink(e: React.MouseEvent) {
    e.stopPropagation();
    setUnlinking(true);
    try {
      await api.patch(`/store-refunds/${refund.id}/unlink-order`, {});
      toast.success(`Refund #${refund.id} unlinked`);
      onUnlink();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? "Failed to unlink");
    } finally {
      setUnlinking(false);
    }
  }

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/30 row-hover-lift cursor-pointer" onClick={() => setExpanded((v) => !v)}>
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
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {refund.linked_order_id ? (
            <Link
              href={`/admin/orders?tab=contested&q=${encodeURIComponent(refund.linked_order_id)}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-primary/40 text-primary bg-primary/5 text-xs font-medium hover:bg-primary/10 hover:border-primary/60 transition-colors"
            >
              <Link2 className="w-3 h-3 shrink-0" />
              <span className="font-mono truncate max-w-32">{refund.linked_order_id}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
            </Link>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground"><Link2Off className="w-3 h-3" /> Unlinked</Badge>
          )}
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
        <tr className="border-b border-border/50 bg-muted/20 animate-fade-in">
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
  const toast = useToast();
  const t = useT({
    fr: {
      title: "Remboursements", refresh: "Actualiser",
      total_one: "remboursement au total", total_many: "remboursements au total",
      search: "Rechercher référence de paiement ou restaurant…",
      all_stores: "Tous les restaurants",
      all: "Tous", linked: "Liés", unlinked: "Non liés",
      clear_all: "Effacer tous les filtres",
      no_refunds: "Aucun remboursement trouvé",
      page: "Page", of: "sur", prev: "Préc.", next: "Suiv.", refunds_word: "remboursements",
      quick_range: "Plage rapide :", today: "Aujourd'hui", days7: "7 jours", days30: "30 jours", days90: "90 jours",
      // modal
      link_order: "Lier une commande", refund_n: "Remboursement", suggested: "Correspondances suggérées",
      or_manual: "Ou saisir manuellement", enter_oid: "Entrer l'ID commande", order_id_ph: "ID commande…",
      link: "Lier", failed_link: "Échec de la liaison", unlink: "Délier", linked_word: "Lié",
      // table
      amount: "Montant", store: "Restaurant", date: "Date", linked_col: "Lié",
      // expand
      payout_ref: "Référence", linked_order: "Commande liée", report_job: "Job de rapport", fetched: "Récupéré",
    },
    en: {
      title: "Refunds", refresh: "Refresh",
      total_one: "refund total", total_many: "refunds total",
      search: "Search payout ref or store…",
      all_stores: "All Stores",
      all: "All", linked: "Linked", unlinked: "Unlinked",
      clear_all: "Clear all filters",
      no_refunds: "No refunds found",
      page: "Page", of: "of", prev: "Prev", next: "Next", refunds_word: "refunds",
      quick_range: "Quick range:", today: "Today", days7: "7 days", days30: "30 days", days90: "90 days",
      link_order: "Link Order", refund_n: "Refund", suggested: "Suggested matches",
      or_manual: "Or enter manually", enter_oid: "Enter order ID", order_id_ph: "Order ID…",
      link: "Link", failed_link: "Failed to link order", unlink: "Unlink", linked_word: "Linked",
      amount: "Amount", store: "Store", date: "Date", linked_col: "Linked",
      payout_ref: "Payout Ref", linked_order: "Linked Order", report_job: "Report Job", fetched: "Fetched",
    },
  });
  const [stores, setStores]           = useState<SimpleStore[]>([]);
  const [refunds, setRefunds]         = useState<StoreRefund[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [linkTarget, setLinkTarget]   = useState<StoreRefund | null>(null);
  const [linkCandidates, setCandidates] = useState<SuggestionCandidate[]>([]);
  const [search, setSearch]           = useUrlState("q", "");
  const [backendSearch, setBackendSearch] = useState(search);
  const [storeId, setStoreId]         = useUrlState("store", "");
  const [linkedFilter, setLinked]     = useUrlState("linked", "");
  const [dateFrom, setDateFrom]       = useUrlState("from", "");
  const [dateTo, setDateTo]           = useUrlState("to", "");
  const [sortField, setSortField]     = useState<string | null>(null);
  const [sortDir, setSortDir]         = useState<SortDir>(null);
  const searchTimer                   = useRef<ReturnType<typeof setTimeout>>();
  function handleSort(field: string, dir: SortDir) { setSortField(dir === null ? null : field); setSortDir(dir); }

  useEffect(() => {
    api.get<SimpleStore[]>("/smartkitchen-stores/admin/list")
      .then((d) => setStores(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setBackendSearch(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (storeId)              params.set("store_id", storeId);
      if (linkedFilter === "linked")   params.set("linked", "true");
      if (linkedFilter === "unlinked") params.set("linked", "false");
      if (dateFrom)             params.set("date_from", dateFrom);
      if (dateTo)               params.set("date_to", dateTo);
      if (backendSearch)        params.set("search", backendSearch);
      const data = await api.get<RefundListResponse>(`/store-refunds?${params}`);
      setRefunds(data.refunds ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, [page, storeId, linkedFilter, dateFrom, dateTo, backendSearch]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

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

  function resetFilters() { setSearch(""); setBackendSearch(""); setStoreId(""); setLinked(""); setDateFrom(""); setDateTo(""); setPage(0); }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || storeId || linkedFilter || dateFrom || dateTo);

  const sortedRefunds = (() => {
    if (!sortField || !sortDir) return refunds;
    const arr = [...refunds].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      // amount is a string in the backend — try to parse for numeric sort
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
    <>
      {linkTarget && (
        <LinkOrderModal
          refund={linkTarget}
          suggestions={linkCandidates}
          onClose={() => { setLinkTarget(null); setCandidates([]); }}
          onLinked={() => {
            toast.success(`Refund #${linkTarget.id} linked`);
            fetchRefunds();
          }}
        />
      )}

      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-violet-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{total.toLocaleString("fr-FR")} {total !== 1 ? t.total_many : t.total_one}</p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchRefunds} disabled={loading} className="gap-1.5 press-scale">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {t.refresh}
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input placeholder={t.search} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={storeId} onChange={(e) => { setStoreId(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
            <option value="">{t.all_stores}</option>
            {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
          </select>
          <select value={linkedFilter} onChange={(e) => { setLinked(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
            {[
              { value: "", label: t.all },
              { value: "linked", label: t.linked },
              { value: "unlinked", label: t.unlinked },
            ].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex gap-2 items-center">
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="text-xs" title="From" />
            <span className="text-muted-foreground text-xs shrink-0">to</span>
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="text-xs" title="To" />
          </div>
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-1.5 -mt-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mr-1">{t.quick_range}</span>
          {[
            { label: t.today,  days: 0 },
            { label: t.days7,  days: 7 },
            { label: t.days30, days: 30 },
            { label: t.days90, days: 90 },
          ].map(({ label, days }) => {
            const today = new Date();
            const from = new Date(today); from.setDate(today.getDate() - days);
            const fromStr = from.toISOString().slice(0, 10);
            const toStr   = today.toISOString().slice(0, 10);
            const active  = dateFrom === fromStr && dateTo === toStr;
            return (
              <button
                key={label}
                onClick={() => { setDateFrom(fromStr); setDateTo(toStr); setPage(0); }}
                className={cn(
                  "px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all press-scale",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
            {t.clear_all}
          </button>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3"><SortableHeader field="amount" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Amount</SortableHeader></th>
                  <th className="text-left px-4 py-3 hidden md:table-cell"><SortableHeader field="store_name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Store</SortableHeader></th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="refund_date" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Date</SortableHeader></th>
                  <th className="text-left px-4 py-3"><SortableHeader field="linked_order_id" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Linked</SortableHeader></th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody data-stagger>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                ) : sortedRefunds.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">{t.no_refunds}</td></tr>
                ) : sortedRefunds.map((r) => (
                  <RefundRow key={r.id} refund={r} onLink={() => openLinkModal(r)} onUnlink={fetchRefunds} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{t.page} {page + 1} {t.of} {totalPages} — {total} {t.refunds_word}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1"><ChevronLeft className="w-3.5 h-3.5" /> {t.prev}</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => p + 1)} className="gap-1">{t.next} <ChevronRight className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
