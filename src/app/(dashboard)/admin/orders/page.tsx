"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { DetailPanel, DetailField, DetailSection } from "@/components/ui/detail-panel";
import { SkeletonRow } from "@/components/ui/skeleton";
import { SortableHeader, type SortDir } from "@/components/ui/sortable-header";
import { useToast } from "@/components/ui/toast";
import { useUrlState } from "@/hooks/use-url-state";
import { useT } from "@/i18n/provider";
import { api } from "@/lib/api";
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

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary animate-scale-in">
      {label}
      <button onClick={onRemove} className="hover:text-foreground transition-colors press-scale">
        <XCircle className="w-3 h-3" />
      </button>
    </span>
  );
}

function RemboursementBadge({ status }: { status: RemboursementStatus }) {
  if (status === "remboursé")
    return <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> Remboursé</Badge>;
  if (status === "email envoyé")
    return <Badge variant="outline" className="gap-1 border-sky-400/50 text-sky-500 bg-sky-500/5 text-xs whitespace-nowrap"><Mail className="w-3 h-3" /> Email envoyé</Badge>;
  return <Badge variant="outline" className="gap-1 text-xs text-muted-foreground whitespace-nowrap"><Clock className="w-3 h-3" /> En attente</Badge>;
}

// ── Inline editor for cancelled-order amount + send-refund button ───────────

function CancelledRowActions({ order, onChange }: { order: CancelledOrder; onChange: () => void }) {
  const toast = useToast();
  const [amount, setAmount]     = useState<string>(order.manual_amount != null ? String(order.manual_amount) : "");
  const [savingAmt, setSaveAmt] = useState(false);
  const [sending, setSending]   = useState(false);

  const sent = !!order.refund_email_sent_at;
  const hasAmount = order.manual_amount != null && order.manual_amount > 0;
  const numericAmount = Number(amount.replace(",", "."));
  const validAmount = !isNaN(numericAmount) && numericAmount > 0;

  async function saveAmount(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validAmount) return;
    setSaveAmt(true);
    try {
      await api.patch(`/order-reports/admin/cancelled-orders/${order.order_id}/amount`, { manual_amount: numericAmount });
      toast.success(`Amount saved: ${numericAmount.toFixed(2)} €`);
      onChange();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? "Save failed");
    } finally { setSaveAmt(false); }
  }

  async function sendEmail() {
    setSending(true);
    try {
      await api.post(`/order-reports/admin/cancelled-orders/${order.order_id}/send-refund`, {});
      toast.success("Refund email sent to Uber support");
      onChange();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? "Send failed");
    } finally { setSending(false); }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={saveAmount} className="flex items-center gap-1">
        <Input
          type="number" step="0.01" min="0"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="—" className="h-8 w-20 text-xs"
          disabled={sent}
        />
        <span className="text-xs text-muted-foreground">€</span>
        {!sent && (
          <Button
            type="submit" size="sm" variant="outline"
            disabled={!validAmount || savingAmt || numericAmount === order.manual_amount}
            className="h-8 text-xs"
          >
            {savingAmt ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
          </Button>
        )}
      </form>

      {hasAmount && !sent && (
        <Button size="sm" onClick={sendEmail} disabled={sending} className="h-8 gap-1 text-xs">
          {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3" /> Send refund</>}
        </Button>
      )}

      {sent && (
        <span className="text-[10px] text-primary flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {new Date(order.refund_email_sent_at!).toLocaleDateString("fr-FR")}
        </span>
      )}
    </div>
  );
}


function SendEmailsButton({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const r = await api.post<{ sent: number; skipped_no_proof: number; errors: number }>(
        "/order-proofs/admin/send-refund-emails"
      );
      toast.success(`${r.sent} sent · ${r.skipped_no_proof} skipped · ${r.errors} errors`, 5000);
      onDone();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? "Failed to send emails");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={send} disabled={loading} className="gap-1.5 press-scale">
      {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</> : <><Send className="w-3.5 h-3.5" /> Send Refund Emails</>}
    </Button>
  );
}

type Tab = "cancelled" | "contested";

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const t = useT({
    fr: {
      title: "Commandes", refresh: "Actualiser", search: "Rechercher ID commande ou restaurant…",
      all_stores: "Tous les restaurants", clear_all: "Tout effacer",
      quick_range: "Plage rapide :", today: "Aujourd'hui", days7: "7 jours", days30: "30 jours", days90: "90 jours",
      no_orders: "Aucune commande trouvée", page: "Page", of: "sur", prev: "Préc.", next: "Suiv.",
      cancelled: "Annulées", contested: "Contestées",
      // detail panel
      detail_cancelled_t: "Commande annulée", detail_contested_t: "Commande contestée",
      order: "Commande", order_id: "ID commande", order_uuid: "UUID commande",
      status: "Statut", items: "Articles", date_ordered: "Date commande", workflow_uuid: "UUID workflow",
      store: "Restaurant", store_name: "Nom restaurant", store_id: "ID restaurant", country: "Pays", city: "Ville",
      issue: "Problème", inaccurate: "Articles incorrects", fulfillment: "Type de livraison",
      amounts: "Montants", ticket_size: "Taille du ticket", customer_refunded: "Remboursé client",
      covered_merchant: "Couvert par marchand", not_covered: "Non couvert",
      remboursement: "Remboursement", report_job: "Job de rapport", fetched_at: "Récupéré le",
      manual_amount: "Montant manuel", refund_email_sent: "Email envoyé",
      channel: "Canal",
      orders_word: "commandes",
    },
    en: {
      title: "Orders", refresh: "Refresh", search: "Search order ID or store…",
      all_stores: "All Stores", clear_all: "Clear all",
      quick_range: "Quick range:", today: "Today", days7: "7 days", days30: "30 days", days90: "90 days",
      no_orders: "No orders found", page: "Page", of: "of", prev: "Prev", next: "Next",
      cancelled: "Cancelled", contested: "Contested",
      detail_cancelled_t: "Cancelled Order", detail_contested_t: "Contested Order",
      order: "Order", order_id: "Order ID", order_uuid: "Order UUID",
      status: "Status", items: "Items", date_ordered: "Date Ordered", workflow_uuid: "Workflow UUID",
      store: "Store", store_name: "Store Name", store_id: "Store ID", country: "Country", city: "City",
      issue: "Issue", inaccurate: "Inaccurate Items", fulfillment: "Fulfillment",
      amounts: "Amounts", ticket_size: "Ticket Size", customer_refunded: "Customer Refunded",
      covered_merchant: "Covered by Merchant", not_covered: "Not Covered",
      remboursement: "Remboursement", report_job: "Report Job", fetched_at: "Fetched At",
      manual_amount: "Manual amount", refund_email_sent: "Refund email sent",
      channel: "Channel",
      orders_word: "orders",
    },
  });
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "cancelled";

  const [tab, setTab]               = useState<Tab>(initialTab);
  const [stores, setStores]         = useState<SimpleStore[]>([]);
  const [items, setItems]           = useState<(CancelledOrder | ContestedOrder)[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useUrlState("q", "");
  const [backendSearch, setBackendSearch] = useState(searchParams.get("q") ?? "");
  const [storeId, setStoreId]       = useUrlState("store", "");
  const [rembStatus, setRembStatus] = useUrlState("status", "");
  const [dateFrom, setDateFrom]     = useUrlState("from", "");
  const [dateTo, setDateTo]         = useUrlState("to", "");
  const [sortField, setSortField]   = useState<string | null>(null);
  const [sortDir, setSortDir]       = useState<SortDir>(null);
  const [detail, setDetail]         = useState<CancelledOrder | ContestedOrder | null>(null);
  const searchTimer                 = useRef<ReturnType<typeof setTimeout>>();

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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (storeId)        params.set("store_id", storeId);
      if (rembStatus)     params.set("remboursement_status", rembStatus);
      if (dateFrom)       params.set("start_date", dateFrom);
      if (dateTo)         params.set("end_date", dateTo);
      if (backendSearch)  params.set("search", backendSearch);

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
  }, [tab, page, storeId, rembStatus, dateFrom, dateTo, backendSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function resetFilters() { setSearch(""); setBackendSearch(""); setStoreId(""); setRembStatus(""); setDateFrom(""); setDateTo(""); setPage(0); }
  function switchTab(t: Tab) { setTab(t); setPage(0); setSearch(""); setDetail(null); }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || storeId || rembStatus || dateFrom || dateTo);

  // Client-side sort over the current page (server already paginated/filtered)
  const sortedItems = (() => {
    if (!sortField || !sortDir) return items;
    const arr = [...items].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), undefined, { numeric: true });
    });
    return sortDir === "asc" ? arr : arr.reverse();
  })();

  return (
    <>
      {detail && tab === "cancelled" && (
        <DetailPanel
          title={t.detail_cancelled_t}
          subtitle={(detail as CancelledOrder).order_id}
          onClose={() => setDetail(null)}
        >
          <DetailSection title={t.order}>
            <DetailField label={t.order_id} value={(detail as CancelledOrder).order_id} mono />
            <DetailField label={t.order_uuid} value={(detail as CancelledOrder).order_uuid} mono />
            <DetailField label={t.status} value={(detail as CancelledOrder).order_status} />
            <DetailField label={t.items} value={(detail as CancelledOrder).menu_item_count} />
            <DetailField label={t.date_ordered} value={(detail as CancelledOrder).date_ordered ? new Date((detail as CancelledOrder).date_ordered).toLocaleDateString("fr-FR") : null} />
            <DetailField label={t.workflow_uuid} value={(detail as CancelledOrder).workflow_uuid} mono />
          </DetailSection>
          <DetailSection title={t.store}>
            <DetailField label={t.store_name} value={(detail as CancelledOrder).store_name} />
            <DetailField label={t.store_id} value={(detail as CancelledOrder).store_id} mono />
            <DetailField label={t.country} value={(detail as CancelledOrder).country_code} />
          </DetailSection>
          <DetailSection title={t.remboursement}>
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{t.status}</p>
              <RemboursementBadge status={(detail as CancelledOrder).remboursement_status} />
            </div>
            <DetailField
              label={t.manual_amount}
              value={(detail as CancelledOrder).manual_amount != null ? `${(detail as CancelledOrder).manual_amount} €` : null}
              highlight={(detail as CancelledOrder).manual_amount != null ? "amber" : undefined}
            />
            <DetailField
              label={t.refund_email_sent}
              value={(detail as CancelledOrder).refund_email_sent_at ? new Date((detail as CancelledOrder).refund_email_sent_at!).toLocaleString("fr-FR") : null}
              highlight={(detail as CancelledOrder).refund_email_sent_at ? "green" : undefined}
            />
            <DetailField label={t.report_job} value={(detail as CancelledOrder).report_job_id} mono />
            <DetailField label={t.fetched_at} value={(detail as CancelledOrder).fetched_at ? new Date((detail as CancelledOrder).fetched_at).toLocaleString("fr-FR") : null} />
          </DetailSection>
        </DetailPanel>
      )}

      {detail && tab === "contested" && (
        <DetailPanel
          title={t.detail_contested_t}
          subtitle={(detail as ContestedOrder).order_id}
          onClose={() => setDetail(null)}
        >
          <DetailSection title={t.order}>
            <DetailField label={t.order_id} value={(detail as ContestedOrder).order_id} mono />
            <DetailField label={t.order_uuid} value={(detail as ContestedOrder).order_uuid} mono />
            <DetailField label={t.issue} value={(detail as ContestedOrder).order_issue} />
            <DetailField label={t.inaccurate} value={(detail as ContestedOrder).inaccurate_items} />
            <DetailField label={t.date_ordered} value={(detail as ContestedOrder).time_customer_ordered ? new Date((detail as ContestedOrder).time_customer_ordered).toLocaleDateString("fr-FR") : null} />
            <DetailField label={t.fulfillment} value={(detail as ContestedOrder).fulfillment_type} />
          </DetailSection>
          <DetailSection title={t.amounts}>
            <DetailField label={t.ticket_size} value={`${(detail as ContestedOrder).ticket_size} ${(detail as ContestedOrder).currency_code}`} />
            <DetailField label={t.customer_refunded} value={`${(detail as ContestedOrder).customer_refunded} ${(detail as ContestedOrder).currency_code}`} highlight="green" />
            <DetailField label={t.covered_merchant} value={`${(detail as ContestedOrder).refund_covered_by_merchant} ${(detail as ContestedOrder).currency_code}`} highlight="amber" />
            <DetailField label={t.not_covered} value={`${(detail as ContestedOrder).refund_not_covered_by_merchant} ${(detail as ContestedOrder).currency_code}`} highlight="red" />
          </DetailSection>
          <DetailSection title={t.store}>
            <DetailField label={t.store_name} value={(detail as ContestedOrder).store_name} />
            <DetailField label={t.store_id} value={(detail as ContestedOrder).store_id} mono />
            <DetailField label={t.city} value={(detail as ContestedOrder).city} />
            <DetailField label={t.channel} value={(detail as ContestedOrder).order_channel} />
          </DetailSection>
          <DetailSection title={t.remboursement}>
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{t.status}</p>
              <RemboursementBadge status={(detail as ContestedOrder).remboursement_status} />
            </div>
            <DetailField label={t.report_job} value={(detail as ContestedOrder).report_job_id} mono />
            <DetailField label={t.fetched_at} value={(detail as ContestedOrder).fetched_at ? new Date((detail as ContestedOrder).fetched_at).toLocaleString("fr-FR") : null} />
          </DetailSection>
        </DetailPanel>
      )}

      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-sky-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{total.toLocaleString()} {tab === "cancelled" ? t.cancelled.toLowerCase() : t.contested.toLowerCase()} {t.orders_word}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tab === "contested" && <SendEmailsButton onDone={fetchOrders} />}
            <Button size="sm" variant="outline" onClick={fetchOrders} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              {t.refresh}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border">
          {(["cancelled", "contested"] as Tab[]).map((tabKey) => (
            <button key={tabKey} onClick={() => switchTab(tabKey)} className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
              tab === tabKey ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
              {tabKey === "cancelled" ? t.cancelled : t.contested}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input placeholder={t.search} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={storeId} onChange={(e) => { setStoreId(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
            <option value="">{t.all_stores}</option>
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

        {/* Date range presets */}
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
                onClick={() => {
                  setDateFrom(fromStr);
                  setDateTo(toStr);
                  setPage(0);
                }}
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
          <div className="flex items-center gap-2 flex-wrap animate-fade-in">
            {search && (
              <FilterChip label={`"${search}"`} onRemove={() => setSearch("")} />
            )}
            {storeId && (
              <FilterChip label={`Store: ${stores.find(s => s.store_id === storeId)?.store_name ?? storeId.slice(0,8)}`} onRemove={() => setStoreId("")} />
            )}
            {rembStatus && (
              <FilterChip label={`Status: ${rembStatus}`} onRemove={() => setRembStatus("")} />
            )}
            {dateFrom && (
              <FilterChip label={`From ${dateFrom}`} onRemove={() => setDateFrom("")} />
            )}
            {dateTo && (
              <FilterChip label={`To ${dateTo}`} onRemove={() => setDateTo("")} />
            )}
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors ml-1">
              {t.clear_all}
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-border overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto max-h-[70vh]">
            {tab === "cancelled" ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3"><SortableHeader field="order_id" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Order ID</SortableHeader></th>
                    <th className="text-left px-4 py-3 hidden md:table-cell"><SortableHeader field="store_name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Store</SortableHeader></th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell font-semibold text-muted-foreground text-xs">Items</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell font-semibold text-muted-foreground text-xs">Status</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="date_ordered" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Date</SortableHeader></th>
                    <th className="text-left px-4 py-3"><SortableHeader field="remboursement_status" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Remboursement</SortableHeader></th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Amount + Action</th>
                  </tr>
                </thead>
                <tbody data-stagger>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                  ) : sortedItems.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">{t.no_orders}</td></tr>
                  ) : (sortedItems as CancelledOrder[]).map((o) => (
                    <tr key={o.order_id} className="border-b border-border/50 hover:bg-muted/30 row-hover-lift cursor-pointer" onClick={() => setDetail(o)}>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors">{o.order_id}</code>
                      </td>
                      <td className="px-4 py-3 text-xs hidden md:table-cell">
                        <button
                          className="text-left hover:text-primary transition-colors"
                          onClick={(e) => { e.stopPropagation(); setStoreId(o.store_id); setPage(0); }}
                        >
                          <p className="font-medium">{o.store_name}</p>
                          <p className="text-muted-foreground">{o.store_id.slice(0, 8)}…</p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs hidden sm:table-cell">{o.menu_item_count}</td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Badge variant="outline" className="text-xs">{o.order_status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {o.date_ordered ? new Date(o.date_ordered).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-4 py-3"><RemboursementBadge status={o.remboursement_status} /></td>
                      <td className="px-4 py-3">
                        <CancelledRowActions order={o} onChange={fetchOrders} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3"><SortableHeader field="order_id" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Order ID</SortableHeader></th>
                    <th className="text-left px-4 py-3 hidden md:table-cell"><SortableHeader field="store_name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Store</SortableHeader></th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell font-semibold text-muted-foreground text-xs">Issue</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="ticket_size" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Ticket</SortableHeader></th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="refund_covered_by_merchant" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Merchant</SortableHeader></th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell"><SortableHeader field="time_customer_ordered" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Date</SortableHeader></th>
                    <th className="text-left px-4 py-3"><SortableHeader field="remboursement_status" currentField={sortField} currentDir={sortDir} onSort={handleSort}>Remboursement</SortableHeader></th>
                  </tr>
                </thead>
                <tbody data-stagger>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                  ) : sortedItems.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">{t.no_orders}</td></tr>
                  ) : (sortedItems as ContestedOrder[]).map((o) => (
                    <tr key={o.order_id} className="border-b border-border/50 hover:bg-muted/30 row-hover-lift cursor-pointer" onClick={() => setDetail(o)}>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors">{o.order_id}</code>
                      </td>
                      <td className="px-4 py-3 text-xs hidden md:table-cell">
                        <button
                          className="text-left hover:text-primary transition-colors"
                          onClick={(e) => { e.stopPropagation(); setStoreId(o.store_id); setPage(0); }}
                        >
                          <p className="font-medium">{o.store_name}</p>
                          <p className="text-muted-foreground">{o.city}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs hidden sm:table-cell max-w-40 truncate">{o.order_issue}</td>
                      <td className="px-4 py-3 text-xs hidden lg:table-cell">{o.ticket_size} {o.currency_code}</td>
                      <td className="px-4 py-3 text-xs hidden lg:table-cell font-semibold text-amber-600 dark:text-amber-400">{o.refund_covered_by_merchant} {o.currency_code}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {o.time_customer_ordered ? new Date(o.time_customer_ordered).toLocaleDateString("fr-FR") : "—"}
                      </td>
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
            <p className="text-xs text-muted-foreground">{t.page} {page + 1} {t.of} {totalPages} — {total} {t.orders_word}</p>
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

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrdersContent />
    </Suspense>
  );
}
