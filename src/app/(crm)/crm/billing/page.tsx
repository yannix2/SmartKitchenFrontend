"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard, RefreshCcw, Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, Clock, UserCheck, UserX, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { UserProfile } from "@/types";

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

function SubBadge({ status, labels }: { status: string; labels: { active: string; cancelling: string; past_due: string; cancelled: string } }) {
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

export default function CrmBillingPage() {
  const t = useT({
    fr: {
      title: "Abonnements", refresh: "Actualiser",
      total_one: "abonnement au total", total_many: "abonnements au total",
      total: "Total", active: "Actif", cancelling: "En annulation", past_due: "En retard", cancelled: "Annulé",
      all_statuses: "Tous les statuts",
      search: "Rechercher nom ou email…",
      th_user: "Utilisateur", th_status: "Statut", th_plan: "Plan", th_started: "Démarré", th_expires: "Expire", th_actions: "Actions",
      loading: "Chargement…", no_subs: "Aucun abonnement trouvé",
      activate: "Activer", deactivate: "Désactiver",
      page: "Page", of: "sur", prev: "Préc.", next: "Suiv.",
    },
    en: {
      title: "Subscriptions", refresh: "Refresh",
      total_one: "subscription total", total_many: "subscriptions total",
      total: "Total", active: "Active", cancelling: "Cancelling", past_due: "Past due", cancelled: "Cancelled",
      all_statuses: "All statuses",
      search: "Search name or email…",
      th_user: "User", th_status: "Status", th_plan: "Plan", th_started: "Started", th_expires: "Expires", th_actions: "Actions",
      loading: "Loading…", no_subs: "No subscriptions found",
      activate: "Activate", deactivate: "Deactivate",
      page: "Page", of: "of", prev: "Prev", next: "Next",
    },
  });
  const STATUS_OPTIONS = [
    { value: "",           label: t.all_statuses },
    { value: "active",     label: t.active        },
    { value: "cancelling", label: t.cancelling    },
    { value: "past_due",   label: t.past_due      },
    { value: "cancelled",  label: t.cancelled     },
  ];
  const SUB_LABELS = { active: t.active, cancelling: t.cancelling, past_due: t.past_due, cancelled: t.cancelled };
  const [subs, setSubs]           = useState<AdminSubscription[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [statusFilter, setStatus] = useState("");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState<string | null>(null);
  const [role, setRole]           = useState<string>("agent");

  // Fetch current user role to decide whether to show admin actions
  useEffect(() => {
    api.get<UserProfile>("/auth/me").then((p) => setRole(p.role)).catch(() => {});
  }, []);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (statusFilter) p.set("status", statusFilter);
      const d = await api.get<{ total: number; subscriptions: AdminSubscription[] }>(`/billing/admin/subscriptions?${p}`);
      setSubs(d.subscriptions ?? []);
      setTotal(d.total ?? 0);
    } catch { setSubs([]); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  async function handleActivate(userId: string) {
    setActionId(userId);
    try { await api.post(`/billing/admin/activate/${userId}`, {}); fetchSubs(); }
    catch { /* ignored */ }
    finally { setActionId(null); }
  }

  async function handleDeactivate(userId: string) {
    setActionId(userId);
    try { await api.post(`/billing/admin/deactivate/${userId}`, {}); fetchSubs(); }
    catch { /* ignored */ }
    finally { setActionId(null); }
  }

  const isAdmin    = role === "admin";
  const totalPages = Math.ceil(total / LIMIT);

  const filtered = search.trim()
    ? subs.filter((s) =>
        s.user_name.toLowerCase().includes(search.toLowerCase()) ||
        s.user_email.toLowerCase().includes(search.toLowerCase())
      )
    : subs;

  const activeCount     = subs.filter((s) => s.status === "active").length;
  const cancellingCount = subs.filter((s) => s.status === "cancelling").length;
  const pastDueCount    = subs.filter((s) => s.status === "past_due").length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-400 mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <CreditCard className="text-violet-500" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total} {total !== 1 ? t.total_many : t.total_one}</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchSubs} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          {t.refresh}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t.total,      value: total,           cls: "bg-card border-border"                },
          { label: t.active,     value: activeCount,     cls: "bg-emerald-500/5 border-emerald-500/20" },
          { label: t.cancelling, value: cancellingCount, cls: "bg-orange-500/5 border-orange-500/20"  },
          { label: t.past_due,   value: pastDueCount,    cls: "bg-amber-500/5 border-amber-500/20"    },
        ].map(({ label, value, cls }) => (
          <div key={label} className={cn("rounded-2xl border p-4", cls)}>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="col-span-3">{t.th_user}</span>
          <span className="col-span-2">{t.th_status}</span>
          <span className="col-span-2">{t.th_plan}</span>
          <span className="col-span-2">{t.th_started}</span>
          <span className="col-span-2">{t.th_expires}</span>
          {isAdmin && <span className="text-right">{t.th_actions}</span>}
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">{t.loading}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t.no_subs}</div>
        ) : filtered.map((sub) => {
          const isLoading     = actionId === sub.user_id;
          const canActivate   = sub.status !== "active";
          const canDeactivate = sub.status === "active" || sub.status === "cancelling";

          return (
            <div
              key={sub.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-center px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="lg:col-span-3">
                <p className="text-xs font-semibold truncate">{sub.user_name || "—"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{sub.user_email}</p>
              </div>

              <div className="lg:col-span-2">
                <SubBadge status={sub.status} labels={SUB_LABELS} />
              </div>

              <div className="lg:col-span-2">
                <p className="text-xs font-semibold">{sub.plan_name ?? "—"}</p>
                {sub.price && (
                  <p className="text-[10px] text-muted-foreground">
                    {sub.price}{sub.currency === "eur" ? "€" : ` ${sub.currency ?? ""}`}/mo
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <p className="text-xs text-muted-foreground">
                  {sub.started_at ? new Date(sub.started_at).toLocaleDateString("fr-FR") : "—"}
                </p>
              </div>

              <div className="lg:col-span-2">
                <p className={cn(
                  "text-xs font-medium",
                  sub.status === "cancelling" ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                )}>
                  {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("fr-FR") : "—"}
                </p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 lg:justify-end">
                  {canActivate && (
                    <Button
                      size="sm" variant="outline"
                      className="h-7 text-xs gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => handleActivate(sub.user_id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                      {t.activate}
                    </Button>
                  )}
                  {canDeactivate && (
                    <Button
                      size="sm" variant="outline"
                      className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => handleDeactivate(sub.user_id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                      {t.deactivate}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{t.page} {page + 1} {t.of} {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />{t.prev}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => p + 1)} className="gap-1">
              {t.next}<ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
