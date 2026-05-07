"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Search, RefreshCcw, Loader2, ChevronLeft, ChevronRight,
  Phone, CheckCircle2, XCircle, Clock, FileText, PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { CrmProspect, OnboardingStatus } from "@/types";

const LIMIT = 30;

function StatusBadge({ status, labels }: { status: OnboardingStatus; labels: Record<OnboardingStatus, string> }) {
  const map: Record<OnboardingStatus, { className: string; icon: React.ElementType }> = {
    not_started:      { className: "border-border text-muted-foreground",                       icon: Clock         },
    pending_call:     { className: "border-sky-500/30 text-sky-500 bg-sky-500/5",              icon: Phone         },
    pending_approval: { className: "border-amber-500/30 text-amber-500 bg-amber-500/5",        icon: Clock         },
    approved:         { className: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",  icon: CheckCircle2  },
    rejected:         { className: "border-destructive/30 text-destructive bg-destructive/5",  icon: XCircle       },
  };
  const { className, icon: Icon } = map[status] ?? map.not_started;
  return (
    <Badge variant="outline" className={cn("gap-1 text-xs whitespace-nowrap font-semibold", className)}>
      <Icon className="w-3 h-3" />{labels[status] ?? labels.not_started}
    </Badge>
  );
}

export default function CrmProspectsPage() {
  const router = useRouter();
  const t = useT({
    fr: {
      title: "Prospects", refresh: "Actualiser", total_users: "utilisateurs inscrits au total",
      search: "Rechercher nom ou email…",
      all_statuses: "Tous les statuts",
      not_started: "Non démarré", pending_call: "Appel en attente", pending_approval: "Approbation en attente",
      approved: "Approuvé", rejected: "Rejeté",
      th_name: "Nom", th_email: "Email", th_phone: "Téléphone", th_form: "Formulaire", th_calls: "Appels", th_status: "Statut", th_action: "Action",
      submitted: "Soumis", not_submitted: "Non soumis",
      view: "Voir",
      no_prospects: "Aucun prospect trouvé",
      page: "Page", of: "sur", prev: "Préc.", next: "Suiv.",
    },
    en: {
      title: "Prospects", refresh: "Refresh", total_users: "total users registered",
      search: "Search name or email…",
      all_statuses: "All statuses",
      not_started: "Not started", pending_call: "Pending call", pending_approval: "Pending approval",
      approved: "Approved", rejected: "Rejected",
      th_name: "Name", th_email: "Email", th_phone: "Phone", th_form: "Form", th_calls: "Calls", th_status: "Status", th_action: "Action",
      submitted: "Submitted", not_submitted: "Not submitted",
      view: "View",
      no_prospects: "No prospects found",
      page: "Page", of: "of", prev: "Prev", next: "Next",
    },
  });
  const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: "",                 label: t.all_statuses     },
    { value: "not_started",      label: t.not_started      },
    { value: "pending_call",     label: t.pending_call     },
    { value: "pending_approval", label: t.pending_approval },
    { value: "approved",         label: t.approved         },
    { value: "rejected",         label: t.rejected         },
  ];
  const STATUS_LABELS: Record<OnboardingStatus, string> = {
    not_started:      t.not_started,
    pending_call:     t.pending_call,
    pending_approval: t.pending_approval,
    approved:         t.approved,
    rejected:         t.rejected,
  };

  const [prospects, setProspects]   = useState<CrmProspect[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [backendSearch, setBSearch] = useState("");
  const [statusFilter, setStatus]   = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setBSearch(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (statusFilter) p.set("onboarding_status", statusFilter);
      if (backendSearch) p.set("search", backendSearch);
      const d = await api.get<{ total: number; prospects: CrmProspect[] }>(`/crm/prospects?${p}`);
      setProspects(d.prospects ?? []);
      setTotal(d.total ?? 0);
    } catch { setProspects([]); }
    finally { setLoading(false); }
  }, [page, statusFilter, backendSearch]);

  useEffect(() => { fetchProspects(); }, [fetchProspects]);

  const totalPages = Math.ceil(total / LIMIT);

  // Status counts from loaded data (for quick summary)
  const counts = prospects.reduce<Record<string, number>>((acc, p) => {
    acc[p.onboarding_status] = (acc[p.onboarding_status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-400 mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="text-primary" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total.toLocaleString("fr-FR")} {t.total_users}</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchProspects} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          {t.refresh}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder={t.search} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">{t.th_name}</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden md:table-cell">{t.th_email}</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">{t.th_phone}</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden sm:table-cell">{t.th_form}</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">{t.th_calls}</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">{t.th_status}</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">{t.th_action}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…
                  </td>
                </tr>
              ) : prospects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">{t.no_prospects}</td>
                </tr>
              ) : prospects.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/crm/${p.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        src={p.avatar_url}
                        name={p.name}
                        familyName={p.family_name}
                        size={32}
                        className="ring-1 ring-primary/15"
                      />
                      <div>
                        <p className="text-xs font-semibold">{p.name} {p.family_name}</p>
                        <p className="text-[10px] text-muted-foreground md:hidden">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{p.email}</td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell">
                    {p.phone_number ? `${p.phone_code ?? ""} ${p.phone_number}`.trim() : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.form
                      ? <Badge variant="outline" className="gap-1 text-xs text-emerald-600 border-emerald-500/30 bg-emerald-500/5"><FileText className="w-3 h-3" />{t.submitted}</Badge>
                      : <span className="text-xs text-muted-foreground">{t.not_submitted}</span>
                    }
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PhoneCall className="w-3 h-3" />{p.call_count}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.onboarding_status} labels={STATUS_LABELS} /></td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      onClick={(e) => { e.stopPropagation(); router.push(`/crm/${p.id}`); }}
                    >
                      {t.view}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{t.page} {page + 1} {t.of} {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> {t.prev}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => p + 1)} className="gap-1">
              {t.next} <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
