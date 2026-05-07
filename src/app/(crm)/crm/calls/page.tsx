"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PhoneCall, Search, RefreshCcw, Loader2, ChevronLeft, ChevronRight,
  PhoneIncoming, PhoneOutgoing, Mic, Volume2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { CallLog, CallOutcome, CallDirection } from "@/types";

const LIMIT = 30;

function OutcomeBadge({ outcome, labels }: { outcome: CallOutcome; labels: Record<CallOutcome, string> }) {
  const map: Record<CallOutcome, { cls: string }> = {
    pending:   { cls: "border-border text-muted-foreground" },
    approved:  { cls: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" },
    rejected:  { cls: "border-destructive/30 text-destructive bg-destructive/5" },
    callback:  { cls: "border-amber-500/30 text-amber-500 bg-amber-500/5" },
    no_answer: { cls: "border-border text-muted-foreground" },
  };
  const { cls } = map[outcome] ?? map.pending;
  return <Badge variant="outline" className={cn("text-xs font-semibold", cls)}>{labels[outcome] ?? labels.pending}</Badge>;
}

function CallRow({ call, labels }: { call: CallLog; labels: { outcome: Record<CallOutcome, string>; rec: string; transcript: string; agent_notes: string; recording: string; transcription: string; view_prospect: string; unknown: string } }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const dur = call.duration_seconds
    ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
    : "—";

  return (
    <div className="border-b border-border/50 last:border-0">
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Direction icon */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          call.direction === "inbound" ? "bg-sky-500/10" : "bg-primary/10",
        )}>
          {call.direction === "inbound"
            ? <PhoneIncoming className="w-4 h-4 text-sky-500" />
            : <PhoneOutgoing className="w-4 h-4 text-primary" />
          }
        </div>

        {/* Number */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">{call.phone_number || labels.unknown}</p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(call.started_at).toLocaleString("fr-FR")} · {dur}
            {call.agent && ` · ${call.agent.name} ${call.agent.family_name}`}
          </p>
        </div>

        {/* Indicators */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {call.recording_url && (
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <Volume2 className="w-3 h-3" />{labels.rec}
            </span>
          )}
          {call.transcription_text && (
            <span className="text-[10px] font-semibold text-sky-500 flex items-center gap-1">
              <Mic className="w-3 h-3" />{labels.transcript}
            </span>
          )}
        </div>

        <OutcomeBadge outcome={call.outcome} labels={labels.outcome} />
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3 bg-muted/20">
          {call.agent_notes && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{labels.agent_notes}</p>
              <p className="text-xs text-foreground">{call.agent_notes}</p>
            </div>
          )}
          {call.recording_url && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{labels.recording}</p>
              <audio controls src={call.recording_url} className="w-full h-10 rounded-lg" />
            </div>
          )}
          {call.transcription_text && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{labels.transcription}</p>
              <div className="rounded-xl bg-muted border border-border p-3 text-xs leading-relaxed max-h-32 overflow-y-auto">
                {call.transcription_text}
              </div>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 gap-1"
            onClick={() => router.push(`/crm/${call.id}`)}
          >
            <PhoneCall className="w-3 h-3" /> {labels.view_prospect}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CrmCallsPage() {
  const t = useT({
    fr: {
      title: "Journal d'appels", refresh: "Actualiser",
      total_calls: "appels enregistrés",
      all_outcomes: "Tous les résultats",
      pending: "En attente", approved: "Approuvé", rejected: "Rejeté",
      callback: "Rappel", callback_needed: "Rappel nécessaire", no_answer: "Pas de réponse",
      all_directions: "Toutes les directions", outbound: "Sortant", inbound: "Entrant",
      loading_calls: "Chargement des appels…", no_calls: "Aucun appel trouvé",
      page: "Page", of: "sur", prev: "Préc.", next: "Suiv.",
      rec: "Enr.", transcript: "Transcription",
      agent_notes: "Notes agent", recording: "Enregistrement", transcription: "Transcription",
      view_prospect: "Voir le prospect", unknown: "Inconnu",
    },
    en: {
      title: "Call Log", refresh: "Refresh",
      total_calls: "calls recorded",
      all_outcomes: "All outcomes",
      pending: "Pending", approved: "Approved", rejected: "Rejected",
      callback: "Callback", callback_needed: "Callback needed", no_answer: "No answer",
      all_directions: "All directions", outbound: "Outbound", inbound: "Inbound",
      loading_calls: "Loading calls…", no_calls: "No calls found",
      page: "Page", of: "of", prev: "Prev", next: "Next",
      rec: "Rec", transcript: "Transcript",
      agent_notes: "Agent notes", recording: "Recording", transcription: "Transcription",
      view_prospect: "View prospect", unknown: "Unknown",
    },
  });
  const OUTCOME_OPTIONS = [
    { value: "",          label: t.all_outcomes      },
    { value: "pending",   label: t.pending           },
    { value: "approved",  label: t.approved          },
    { value: "rejected",  label: t.rejected          },
    { value: "callback",  label: t.callback_needed   },
    { value: "no_answer", label: t.no_answer         },
  ];
  const DIRECTION_OPTIONS = [
    { value: "",         label: t.all_directions },
    { value: "outbound", label: t.outbound       },
    { value: "inbound",  label: t.inbound        },
  ];
  const OUTCOME_LABELS: Record<CallOutcome, string> = {
    pending: t.pending, approved: t.approved, rejected: t.rejected,
    callback: t.callback, no_answer: t.no_answer,
  };
  const callRowLabels = {
    outcome: OUTCOME_LABELS,
    rec: t.rec, transcript: t.transcript,
    agent_notes: t.agent_notes, recording: t.recording, transcription: t.transcription,
    view_prospect: t.view_prospect, unknown: t.unknown,
  };
  const [calls, setCalls]         = useState<CallLog[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [outcome, setOutcome]     = useState("");
  const [direction, setDirection] = useState("");

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (outcome)   p.set("outcome", outcome);
      if (direction) p.set("direction", direction);
      const d = await api.get<{ total: number; calls: CallLog[] }>(`/crm/calls?${p}`);
      setCalls(d.calls ?? []);
      setTotal(d.total ?? 0);
    } catch { setCalls([]); }
    finally { setLoading(false); }
  }, [page, outcome, direction]);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <PhoneCall className="text-primary" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{total.toLocaleString("fr-FR")} {t.total_calls}</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchCalls} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          {t.refresh}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={outcome}
          onChange={(e) => { setOutcome(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          {OUTCOME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={direction}
          onChange={(e) => { setDirection(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          {DIRECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Calls list */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />{t.loading_calls}
          </div>
        ) : calls.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">{t.no_calls}</div>
        ) : calls.map((c) => (
          <CallRow key={c.id} call={c} labels={callRowLabels} />
        ))}
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
