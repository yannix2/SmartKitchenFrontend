"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp, Search, RefreshCcw, Loader2, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DetailPanel, DetailField, DetailSection } from "@/components/ui/detail-panel";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SkeletonRow } from "@/components/ui/skeleton";
import { SortableHeader, type SortDir } from "@/components/ui/sortable-header";
import { useUrlState } from "@/hooks/use-url-state";
import { useT } from "@/i18n/provider";
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

function ContestedOrdersContent() {
  const searchParams = useSearchParams();
  const t = useT({
    fr: { title: "Commandes contestées", orders: "commandes", refresh: "Actualiser", search: "Rechercher par ID ou restaurant…", all_stores: "Tous les restaurants", clear_filters: "Effacer les filtres", quick_range: "Plage rapide :", today: "Aujourd'hui", days7: "7 jours", days30: "30 jours", days90: "90 jours", no_orders: "Aucune commande trouvée" },
    en: { title: "Contested Orders", orders: "orders", refresh: "Refresh", search: "Search order ID or store…", all_stores: "All Stores", clear_filters: "Clear filters", quick_range: "Quick range:", today: "Today", days7: "7 days", days30: "30 days", days90: "90 days", no_orders: "No orders found" },
  });

  const [orders, setOrders]     = useState<ContestedOrder[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [stores, setStores]     = useState<UserStore[]>([]);
  const [search, setSearch]     = useUrlState("q", "");
  const [rembStatus, setRemb]   = useUrlState("status", "");
  const [storeId, setStoreId]   = useUrlState("store", "");
  const [dateFrom, setFrom]     = useUrlState("from", "");
  const [dateTo, setTo]         = useUrlState("to", "");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<SortDir>(null);
  const [detail, setDetail]     = useState<ContestedOrder | null>(null);
  const searchTimer             = useRef<ReturnType<typeof setTimeout>>();
  const [backendSearch, setBackendSearch] = useState(searchParams.get("q") ?? "");
  function handleSort(field: string, dir: SortDir) { setSortField(dir === null ? null : field); setSortDir(dir); }

  useEffect(() => {
    api.get<UserStore[]>("/smartkitchen-stores/my").then(d => setStores(d ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setBackendSearch(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (rembStatus)    p.set("remboursement_status", rembStatus);
      if (storeId)       p.set("store_id", storeId);
      if (dateFrom)      p.set("start_date", dateFrom);
      if (dateTo)        p.set("end_date", dateTo);
      if (backendSearch) p.set("search", backendSearch);
      const d = await api.get<{ total: number; contested_orders: ContestedOrder[] }>(`/order-reports/my-contested?${p}`);
      setOrders(d.contested_orders ?? []);
      setTotal(d.total ?? 0);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [page, rembStatus, storeId, dateFrom, dateTo, backendSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || rembStatus || storeId || dateFrom || dateTo);

  const sortedOrders = (() => {
    if (!sortField || !sortDir) return orders;
    const arr = [...orders].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      if (sortField === "refund_covered_by_merchant" || sortField === "ticket_size") {
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

      {detail && (
        <DetailPanel
          title="Contested Order"
          subtitle={detail.order_id}
          onClose={() => setDetail(null)}
        >
          <DetailSection title="Order">
            <DetailField label="Order ID" value={detail.order_id} mono />
            <DetailField label="Order UUID" value={detail.order_uuid} mono />
            <DetailField label="Issue" value={detail.order_issue} />
            <DetailField label="Inaccurate Items" value={detail.inaccurate_items} />
            <DetailField label="Date Ordered" value={detail.time_customer_ordered ? new Date(detail.time_customer_ordered).toLocaleDateString("fr-FR") : null} />
            <DetailField label="Date Refunded" value={detail.time_customer_refunded ? new Date(detail.time_customer_refunded).toLocaleDateString("fr-FR") : null} />
            <DetailField label="Fulfillment" value={detail.fulfillment_type} />
            <DetailField label="Channel" value={detail.order_channel} />
          </DetailSection>
          <DetailSection title="Amounts">
            <DetailField label="Ticket Size" value={detail.ticket_size ? `${detail.ticket_size} ${detail.currency_code}` : null} />
            <DetailField label="Customer Refunded" value={detail.customer_refunded ? `${detail.customer_refunded} ${detail.currency_code}` : null} />
            <DetailField label="Covered by Merchant" value={detail.refund_covered_by_merchant ? `${detail.refund_covered_by_merchant} ${detail.currency_code}` : null} highlight="amber" />
            <DetailField label="Not Covered" value={detail.refund_not_covered_by_merchant ? `${detail.refund_not_covered_by_merchant} ${detail.currency_code}` : null} />
          </DetailSection>
          <DetailSection title="Store">
            <DetailField label="Store Name" value={detail.store_name} />
            <DetailField label="Store ID" value={detail.store_id} mono />
            <DetailField label="City" value={detail.city} />
          </DetailSection>
          <DetailSection title="Remboursement">
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
              <RemBadge status={detail.remboursement_status} />
            </div>
            <DetailField label="Fetched At" value={detail.fetched_at ? new Date(detail.fetched_at).toLocaleString("fr-FR") : null} />
          </DetailSection>
        </DetailPanel>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-sky-500" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchOrders} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {t.refresh}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder={t.search} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={rembStatus} onChange={(e) => { setRemb(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          {REMBOURS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={storeId} onChange={(e) => { setStoreId(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          <option value="">{t.all_stores}</option>
          {stores.map((s) => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
        </select>
        <div className="flex gap-2 items-center">
          <Input type="date" value={dateFrom} onChange={(e) => { setFrom(e.target.value); setPage(0); }} className="text-xs" />
          <span className="text-muted-foreground text-xs shrink-0">to</span>
          <Input type="date" value={dateTo} onChange={(e) => { setTo(e.target.value); setPage(0); }} className="text-xs" />
        </div>
      </div>

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
            <button key={label}
              onClick={() => { setFrom(fromStr); setTo(toStr); setPage(0); }}
              className={cn(
                "px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all press-scale",
                active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >{label}</button>
          );
        })}
      </div>

      {hasFilters && (
        <button onClick={() => { setSearch(""); setRemb(""); setStoreId(""); setFrom(""); setTo(""); setPage(0); }} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">{t.clear_filters}</button>
      )}

      <div className="rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3"><SortableHeader field="order_id" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Order ID</SortableHeader></th>
                <th className="text-left px-4 py-3 hidden md:table-cell"><SortableHeader field="store_name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Store</SortableHeader></th>
                <th className="text-left px-4 py-3 hidden sm:table-cell font-semibold text-muted-foreground text-xs">Issue</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="refund_covered_by_merchant" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Merchant</SortableHeader></th>
                <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="time_customer_ordered" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Date</SortableHeader></th>
                <th className="text-left px-4 py-3"><SortableHeader field="remboursement_status" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Remboursement</SortableHeader></th>
              </tr>
            </thead>
            <tbody data-stagger>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : sortedOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-muted-foreground">{t.no_orders}</td></tr>
              ) : sortedOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 row-hover-lift cursor-pointer" onClick={() => setDetail(o)}>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors">{o.order_id}</code>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <button className="text-left hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); setStoreId(o.store_id); setPage(0); }}>
                      <p className="text-xs font-medium">{o.store_name}</p>
                      <p className="text-[10px] text-muted-foreground">{o.city}</p>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs hidden sm:table-cell max-w-40 truncate">{o.order_issue}</td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell font-semibold text-amber-600 dark:text-amber-400">{o.refund_covered_by_merchant} {o.currency_code}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{o.time_customer_ordered ? new Date(o.time_customer_ordered).toLocaleDateString("fr-FR") : "—"}</td>
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
            <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)} className="gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage(p => p + 1)} className="gap-1">Next <ChevronRight className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContestedOrdersPage() {
  return <Suspense><ContestedOrdersContent /></Suspense>;
}
