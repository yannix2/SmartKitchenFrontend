"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard, RefreshCcw, Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, Clock, UserCheck, UserX, Search, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SkeletonRow } from "@/components/ui/skeleton";
import { SortableHeader, type SortDir } from "@/components/ui/sortable-header";
import { useToast } from "@/components/ui/toast";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminSubscription {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: string;
  plan_name: string | null;
  price: number | null;
  currency: string | null;
  started_at: string | null;
  expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string | null;
}

const LIMIT = 20;

type StatusLabels = { active: string; cancelling: string; past_due: string; cancelled: string };

// ── Status badge ─────────────────────────────────────────────────────────────

function SubBadge({ status, labels }: { status: string; labels: StatusLabels }) {
  if (status === "active")
    return <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15 text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3" />{labels.active}</Badge>;
  if (status === "cancelling")
    return <Badge className="gap-1 bg-orange-500/15 text-orange-600 border-orange-500/30 hover:bg-orange-500/15 text-[10px] font-semibold"><Clock className="w-3 h-3" />{labels.cancelling}</Badge>;
  if (status === "past_due")
    return <Badge className="gap-1 bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/15 text-[10px] font-semibold"><AlertCircle className="w-3 h-3" />{labels.past_due}</Badge>;
  if (status === "cancelled")
    return <Badge className="gap-1 bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/10 text-[10px] font-semibold"><XCircle className="w-3 h-3" />{labels.cancelled}</Badge>;
  return <Badge variant="outline" className="text-[10px] text-muted-foreground capitalize">{status || "—"}</Badge>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBillingPage() {
  const toast = useToast();
  const t = useT({
    fr: {
      title: "Abonnements",
      total_one: "abonnement au total",
      total_many: "abonnements au total",
      refresh: "Actualiser",
      summary_total: "Total",
      summary_active: "Actifs",
      summary_cancelling: "En annulation",
      summary_past_due: "Échus",
      summary_cancelled: "Annulés",
      search_ph: "Rechercher nom, email, plan, ID Stripe customer ou subscription…",
      all_statuses: "Tous les statuts",
      st_active: "Actif",
      st_cancelling: "En annulation",
      st_past_due: "Échu",
      st_cancelled: "Annulé",
      chip_search: "Recherche",
      chip_status: "Statut",
      clear_all: "Tout effacer",
      th_user: "Utilisateur",
      th_status: "Statut",
      th_plan: "Plan",
      th_started: "Début",
      th_expires: "Expire",
      th_actions: "Actions",
      no_match: "Aucun abonnement ne correspond à vos filtres",
      no_subs: "Aucun abonnement trouvé",
      activate: "Activer",
      deactivate: "Désactiver",
      activated: "{email} activé",
      deactivated: "{email} désactivé",
      activate_failed: "Échec de l'activation",
      deactivate_failed: "Échec de la désactivation",
      page: "Page",
      of: "sur",
      prev: "Préc.",
      next: "Suiv.",
      per_month: "/mois",
    },
    en: {
      title: "Subscriptions",
      total_one: "subscription total",
      total_many: "subscriptions total",
      refresh: "Refresh",
      summary_total: "Total",
      summary_active: "Active",
      summary_cancelling: "Cancelling",
      summary_past_due: "Past due",
      summary_cancelled: "Cancelled",
      search_ph: "Search name, email, plan, Stripe customer or subscription ID…",
      all_statuses: "All statuses",
      st_active: "Active",
      st_cancelling: "Cancelling",
      st_past_due: "Past due",
      st_cancelled: "Cancelled",
      chip_search: "Search",
      chip_status: "Status",
      clear_all: "Clear all",
      th_user: "User",
      th_status: "Status",
      th_plan: "Plan",
      th_started: "Started",
      th_expires: "Expires",
      th_actions: "Actions",
      no_match: "No subscriptions match your filters",
      no_subs: "No subscriptions found",
      activate: "Activate",
      deactivate: "Deactivate",
      activated: "{email} activated",
      deactivated: "{email} deactivated",
      activate_failed: "Activate failed",
      deactivate_failed: "Deactivate failed",
      page: "Page",
      of: "of",
      prev: "Prev",
      next: "Next",
      per_month: "/mo",
    },
  });

  const STATUS_OPTIONS = [
    { value: "",           label: t.all_statuses },
    { value: "active",     label: t.st_active     },
    { value: "cancelling", label: t.st_cancelling },
    { value: "past_due",   label: t.st_past_due   },
    { value: "cancelled",  label: t.st_cancelled  },
  ];
  const STATUS_LABELS: StatusLabels = {
    active:     t.st_active,
    cancelling: t.st_cancelling,
    past_due:   t.st_past_due,
    cancelled:  t.st_cancelled,
  };

  const [subs, setSubs]           = useState<AdminSubscription[]>([]);
  const [total, setTotal]         = useState(0);
  const [counts, setCounts]       = useState({ total: 0, active: 0, cancelling: 0, past_due: 0, cancelled: 0 });
  const [page, setPage]           = useState(0);
  const [statusFilter, setStatus] = useUrlState("status", "");
  const [search, setSearch]       = useUrlState("q", "");
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<SortDir>(null);
  function handleSort(field: string, dir: SortDir) { setSortField(dir === null ? null : field); setSortDir(dir); }

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (statusFilter) p.set("status", statusFilter);
      const d = await api.get<{
        total: number;
        counts?: { total: number; active: number; cancelling: number; past_due: number; cancelled: number };
        subscriptions: AdminSubscription[];
      }>(`/billing/admin/subscriptions?${p}`);
      setSubs(d.subscriptions ?? []);
      setTotal(d.total ?? 0);
      if (d.counts) setCounts(d.counts);
    } catch { setSubs([]); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  async function handleActivate(userId: string, email: string) {
    setActionId(userId);
    try {
      await api.post(`/billing/admin/activate/${userId}`, {});
      toast.success(t.activated.replace("{email}", email));
      fetchSubs();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? t.activate_failed);
    } finally { setActionId(null); }
  }

  async function handleDeactivate(userId: string, email: string) {
    setActionId(userId);
    try {
      await api.post(`/billing/admin/deactivate/${userId}`, {});
      toast.success(t.deactivated.replace("{email}", email));
      fetchSubs();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? t.deactivate_failed);
    } finally { setActionId(null); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  // ── Smart client-side filter: name, email, plan, both Stripe IDs ──
  const term = search.trim().toLowerCase();
  const matched = term
    ? subs.filter((s) =>
        (s.user_name              ?? "").toLowerCase().includes(term) ||
        (s.user_email             ?? "").toLowerCase().includes(term) ||
        (s.plan_name              ?? "").toLowerCase().includes(term) ||
        (s.stripe_customer_id     ?? "").toLowerCase().includes(term) ||
        (s.stripe_subscription_id ?? "").toLowerCase().includes(term),
      )
    : subs;

  // ── Sort applied last ──
  const filtered = (() => {
    if (!sortField || !sortDir) return matched;
    const arr = [...matched].sort((a, b) => {
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

  // Summary counts come from the backend aggregate so they reflect the entire
  // dataset, not just the currently visible page.

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-400 mx-auto space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <CreditCard className="text-violet-500" style={{ width: "18px", height: "18px" }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {total.toLocaleString("fr-FR")} {total !== 1 ? t.total_many : t.total_one}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchSubs} disabled={loading} className="gap-1.5 press-scale">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {t.refresh}
          </Button>
        </div>

        {/* Summary cards — global counts (not page-scoped) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-stagger-cards>
          {[
            { label: t.summary_active,     value: counts.active,     cls: "bg-emerald-500/5 border-emerald-500/20",     color: "text-emerald-600"  },
            { label: t.summary_cancelling, value: counts.cancelling, cls: "bg-orange-500/5 border-orange-500/20",       color: "text-orange-600"   },
            { label: t.summary_past_due,   value: counts.past_due,   cls: "bg-amber-500/5 border-amber-500/20",         color: "text-amber-600"    },
            { label: t.summary_cancelled,  value: counts.cancelled,  cls: "bg-destructive/5 border-destructive/20",     color: "text-destructive"  },
          ].map(({ label, value, cls, color }) => (
            <div key={label} className={cn("rounded-2xl border p-4 transition-all hover:shadow-sm", cls)}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={cn("text-2xl font-black tabular-nums", color)}>
                <AnimatedCounter value={value} decimals={0} />
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search_ph}
              className="pl-9 pr-9 h-9 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Active filter chips */}
        {(search || statusFilter) && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in">
            {search && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                {t.chip_search}: &quot;{search}&quot;
                <button onClick={() => setSearch("")} className="hover:text-foreground transition-colors press-scale"><XCircle className="w-3 h-3" /></button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                {t.chip_status}: {STATUS_LABELS[statusFilter as keyof StatusLabels] ?? statusFilter}
                <button onClick={() => setStatus("")} className="hover:text-foreground transition-colors press-scale"><XCircle className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => { setSearch(""); setStatus(""); }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors ml-1"
            >
              {t.clear_all}
            </button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden bg-card animate-fade-in-up">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3"><SortableHeader field="user_name"  currentField={sortField} currentDir={sortDir} onSort={handleSort}>{t.th_user}</SortableHeader></th>
                  <th className="text-left px-5 py-3"><SortableHeader field="status"     currentField={sortField} currentDir={sortDir} onSort={handleSort}>{t.th_status}</SortableHeader></th>
                  <th className="text-left px-5 py-3 hidden md:table-cell"><SortableHeader field="plan_name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>{t.th_plan}</SortableHeader></th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell"><SortableHeader field="started_at" currentField={sortField} currentDir={sortDir} onSort={handleSort}>{t.th_started}</SortableHeader></th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell"><SortableHeader field="expires_at" currentField={sortField} currentDir={sortDir} onSort={handleSort}>{t.th_expires}</SortableHeader></th>
                  <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t.th_actions}</th>
                </tr>
              </thead>
              <tbody data-stagger>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                    {search || statusFilter ? t.no_match : t.no_subs}
                  </td></tr>
                ) : filtered.map((sub) => {
                  const isLoading     = actionId === sub.user_id;
                  const canActivate   = sub.status !== "active";
                  const canDeactivate = sub.status === "active" || sub.status === "cancelling";
                  return (
                    <tr key={sub.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 row-hover-lift">
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold truncate">{sub.user_name || "—"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{sub.user_email}</p>
                      </td>
                      <td className="px-5 py-4"><SubBadge status={sub.status} labels={STATUS_LABELS} /></td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-xs font-semibold">{sub.plan_name ?? "—"}</p>
                        {sub.price && (
                          <p className="text-[10px] text-muted-foreground">
                            {sub.price}{sub.currency === "eur" ? "€" : ` ${sub.currency ?? ""}`}{t.per_month}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-xs text-muted-foreground">
                          {sub.started_at ? new Date(sub.started_at).toLocaleDateString("fr-FR") : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className={cn(
                          "text-xs font-medium",
                          sub.status === "cancelling" ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                        )}>
                          {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("fr-FR") : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {canActivate && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 press-scale"
                              onClick={() => handleActivate(sub.user_id, sub.user_email)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                              {t.activate}
                            </Button>
                          )}
                          {canDeactivate && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5 press-scale"
                              onClick={() => handleDeactivate(sub.user_id, sub.user_email)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                              {t.deactivate}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{t.page} {page + 1} {t.of} {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1 press-scale">
                <ChevronLeft className="w-3.5 h-3.5" />{t.prev}
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => p + 1)} className="gap-1 press-scale">
                {t.next}<ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
