"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag, Search, RefreshCcw, Loader2, ChevronLeft, ChevronRight,
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
import type { CancelledOrder, RemboursementStatus, UserStore } from "@/types";

const REMBOURS_OPTIONS = [
  { value: "",           label: "All statuses" },
  { value: "en attente", label: "En attente"   },
  { value: "remboursé",  label: "Remboursé"    },
];
const LIMIT = 25;

function RemBadge({ status }: { status: RemboursementStatus }) {
  if (status === "remboursé")
    return <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs whitespace-nowrap"><CheckCircle2 className="w-3 h-3" />Remboursé</Badge>;
  if (status === "email envoyé")
    return <Badge variant="outline" className="gap-1 border-sky-400/50 text-sky-500 bg-sky-500/5 text-xs whitespace-nowrap"><Mail className="w-3 h-3" />Email envoyé</Badge>;
  return <Badge variant="outline" className="gap-1 text-xs text-muted-foreground whitespace-nowrap"><Clock className="w-3 h-3" />En attente</Badge>;
}

function CancelledOrdersContent() {
  const searchParams = useSearchParams();
  const t = useT({
    fr: { title: "Commandes annulées", orders: "commandes", refresh: "Actualiser", search: "Rechercher par ID ou restaurant…", all_stores: "Tous les restaurants", all_statuses: "Tous les statuts", clear_filters: "Effacer les filtres", quick_range: "Plage rapide :", today: "Aujourd'hui", days7: "7 jours", days30: "30 jours", days90: "90 jours", no_orders: "Aucune commande trouvée", page: "Page", of: "sur", prev: "Préc.", next: "Suiv.", attente: "En attente", rembourse: "Remboursé" },
    en: { title: "Cancelled Orders", orders: "orders", refresh: "Refresh", search: "Search order ID or store…", all_stores: "All Stores", all_statuses: "All statuses", clear_filters: "Clear filters", quick_range: "Quick range:", today: "Today", days7: "7 days", days30: "30 days", days90: "90 days", no_orders: "No orders found", page: "Page", of: "of", prev: "Prev", next: "Next", attente: "En attente", rembourse: "Remboursé" },
  });

  const [orders, setOrders]       = useState<CancelledOrder[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [stores, setStores]       = useState<UserStore[]>([]);
  const [search, setSearch]       = useUrlState("q", "");
  const [rembStatus, setRemb]     = useUrlState("status", "");
  const [storeId, setStoreId]     = useUrlState("store", "");
  const [dateFrom, setFrom]       = useUrlState("from", "");
  const [dateTo, setTo]           = useUrlState("to", "");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<SortDir>(null);
  const [detail, setDetail]       = useState<CancelledOrder | null>(null);
  const searchTimer               = useRef<ReturnType<typeof setTimeout>>();
  const [backendSearch, setBackendSearch] = useState(searchParams.get("q") ?? "");
  function handleSort(field: string, dir: SortDir) { setSortField(dir === null ? null : field); setSortDir(dir); }

  useEffect(() => {
    api.get<UserStore[]>("/smartkitchen-stores/my").then(d => setStores(d ?? [])).catch(() => {});
  }, []);

  // Debounce search → backend
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setBackendSearch(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (rembStatus)     p.set("remboursement_status", rembStatus);
      if (storeId)        p.set("store_id", storeId);
      if (dateFrom)       p.set("start_date", dateFrom);
      if (dateTo)         p.set("end_date", dateTo);
      if (backendSearch)  p.set("search", backendSearch);
      const d = await api.get<{ total: number; cancelled_orders: CancelledOrder[] }>(`/order-reports/my-cancelled?${p}`);
      setOrders(d.cancelled_orders ?? []);
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
      return String(av).localeCompare(String(bv), undefined, { numeric: true });
    });
    return sortDir === "asc" ? arr : arr.reverse();
  })();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-350 mx-auto space-y-6 animate-fade-in-up">

      {detail && (
        <DetailPanel
          title="Cancelled Order"
          subtitle={detail.order_id}
          onClose={() => setDetail(null)}
        >
          <DetailSection title="Order">
            <DetailField label="Order ID" value={detail.order_id} mono />
            <DetailField label="Order UUID" value={detail.order_uuid} mono />
            <DetailField label="Status" value={detail.order_status} />
            <DetailField label="Items" value={detail.menu_item_count} />
            <DetailField label="Date Ordered" value={detail.date_ordered ? new Date(detail.date_ordered).toLocaleDateString("fr-FR") : null} />
            <DetailField label="Workflow UUID" value={detail.workflow_uuid} mono />
          </DetailSection>
          <DetailSection title="Store">
            <DetailField label="Store Name" value={detail.store_name} />
            <DetailField label="Store ID" value={detail.store_id} mono />
            <DetailField label="Country" value={detail.country_code} />
          </DetailSection>
          <DetailSection title="Remboursement">
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
              <RemBadge status={detail.remboursement_status} />
            </div>
            <DetailField label="Report Job" value={detail.report_job_id} mono />
            <DetailField label="Fetched At" value={detail.fetched_at ? new Date(detail.fetched_at).toLocaleString("fr-FR") : null} />
          </DetailSection>
        </DetailPanel>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5 text-amber-500" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} orders</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Quick range presets */}
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
        <button onClick={() => { setSearch(""); setRemb(""); setStoreId(""); setFrom(""); setTo(""); setPage(0); }} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
          {t.clear_filters}
        </button>
      )}

      <div className="rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3"><SortableHeader field="order_id" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Order ID</SortableHeader></th>
                <th className="text-left px-4 py-3 hidden md:table-cell"><SortableHeader field="store_name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Store</SortableHeader></th>
                <th className="text-left px-4 py-3 hidden sm:table-cell font-semibold text-muted-foreground text-xs">Items</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="date_ordered" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Date</SortableHeader></th>
                <th className="text-left px-4 py-3"><SortableHeader field="remboursement_status" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Remboursement</SortableHeader></th>
              </tr>
            </thead>
            <tbody data-stagger>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
              ) : sortedOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">{t.no_orders}</td></tr>
              ) : sortedOrders.map((o) => (
                <tr key={o.order_id} className="border-b border-border/50 hover:bg-muted/30 row-hover-lift cursor-pointer" onClick={() => setDetail(o)}>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors">{o.order_id}</code>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <button
                      className="text-left hover:text-primary transition-colors"
                      onClick={(e) => { e.stopPropagation(); setStoreId(o.store_id); setPage(0); }}
                    >
                      <p className="text-xs font-medium">{o.store_name}</p>
                      <p className="text-[10px] text-muted-foreground">{o.country_code}</p>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs hidden sm:table-cell">{o.menu_item_count}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {o.date_ordered ? new Date(o.date_ordered).toLocaleDateString("fr-FR") : "—"}
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
            <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)} className="gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage(p => p + 1)} className="gap-1">Next <ChevronRight className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CancelledOrdersPage() {
  return <Suspense><CancelledOrdersContent /></Suspense>;
}
