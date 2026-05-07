"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, PhoneCall, PhoneOff, PhoneIncoming,
  CheckCircle2, XCircle, Clock, Loader2, AlertCircle,
  MessageSquare, Mic, MicOff, FileText, RefreshCcw,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { CrmProspect, CallLog, CallOutcome, OnboardingStatus } from "@/types";

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OnboardingStatus }) {
  const map: Record<OnboardingStatus, { label: string; cls: string; icon: React.ElementType }> = {
    not_started:      { label: "Not started",      cls: "border-border text-muted-foreground",                    icon: Clock        },
    pending_call:     { label: "Pending call",     cls: "border-sky-500/30 text-sky-500 bg-sky-500/5",           icon: Phone        },
    pending_approval: { label: "Pending approval", cls: "border-amber-500/30 text-amber-500 bg-amber-500/5",     icon: Clock        },
    approved:         { label: "Approved",         cls: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5", icon: CheckCircle2 },
    rejected:         { label: "Rejected",         cls: "border-destructive/30 text-destructive bg-destructive/5", icon: XCircle     },
  };
  const { label, cls, icon: Icon } = map[status] ?? map.not_started;
  return (
    <Badge variant="outline" className={cn("gap-1 text-xs font-semibold", cls)}>
      <Icon className="w-3 h-3" />{label}
    </Badge>
  );
}

// ── Call outcome badge ─────────────────────────────────────────────────────────

function OutcomeBadge({ outcome }: { outcome: CallOutcome }) {
  const map: Record<CallOutcome, { label: string; cls: string }> = {
    pending:   { label: "Pending",   cls: "border-border text-muted-foreground" },
    approved:  { label: "Approved",  cls: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" },
    rejected:  { label: "Rejected",  cls: "border-destructive/30 text-destructive bg-destructive/5" },
    callback:  { label: "Callback",  cls: "border-amber-500/30 text-amber-500 bg-amber-500/5" },
    no_answer: { label: "No answer", cls: "border-border text-muted-foreground" },
  };
  const { label, cls } = map[outcome] ?? map.pending;
  return <Badge variant="outline" className={cn("text-xs font-semibold", cls)}>{label}</Badge>;
}

// ── Call card ─────────────────────────────────────────────────────────────────

function CallCard({
  call, onUpdate,
}: { call: CallLog; onUpdate: (id: string, outcome: CallOutcome, notes: string) => Promise<void> }) {
  const [open, setOpen]       = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>(call.outcome);
  const [notes, setNotes]     = useState(call.agent_notes ?? "");
  const [saving, setSaving]   = useState(false);

  async function save() {
    setSaving(true);
    await onUpdate(call.id, outcome, notes);
    setSaving(false);
  }

  const dur = call.duration_seconds
    ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
    : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          call.direction === "inbound" ? "bg-sky-500/10" : "bg-primary/10",
        )}>
          {call.direction === "inbound"
            ? <PhoneIncoming className="w-4 h-4 text-sky-500" />
            : <PhoneCall className="w-4 h-4 text-primary" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold capitalize">{call.direction}</span>
            {dur && <span className="text-xs text-muted-foreground">· {dur}</span>}
            {call.recording_url && <span className="text-xs text-emerald-600">· Recorded</span>}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {new Date(call.started_at).toLocaleString("fr-FR")}
            {call.agent && ` · by ${call.agent.name} ${call.agent.family_name}`}
          </p>
        </div>
        <OutcomeBadge outcome={call.outcome} />
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Recording player */}
          {call.recording_url && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Recording</p>
              <audio controls src={call.recording_url} className="w-full h-10 rounded-lg" />
            </div>
          )}

          {/* Transcription */}
          {call.transcription_text && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Transcription</p>
              <div className="rounded-xl bg-muted/50 border border-border p-3 text-xs leading-relaxed max-h-40 overflow-y-auto">
                {call.transcription_text}
              </div>
            </div>
          )}

          {/* Outcome + notes editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Outcome</p>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as CallOutcome)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="callback">Callback needed</option>
                <option value="no_answer">No answer</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Agent notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add notes about this call…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Browser phone widget ──────────────────────────────────────────────────────

function PhoneWidget({ prospectId, phoneNumber }: { prospectId: string; phoneNumber: string }) {
  const t = useT({
    fr: { browser_phone: "Téléphone navigateur", no_phone: "Aucun numéro", call: "Appeler", mute: "Mettre en sourdine", unmute: "Désactiver sourdine", hang_up: "Raccrocher", retry_call: "Réessayer l'appel", retry_in: "Réessayer dans", no_phone_on_file: "Aucun numéro pour ce prospect.", call_failed: "Appel échoué." },
    en: { browser_phone: "Browser Phone", no_phone: "No phone number", call: "Call", mute: "Mute", unmute: "Unmute", hang_up: "Hang up", retry_call: "Retry call", retry_in: "Retry in", no_phone_on_file: "No phone number on file for this prospect.", call_failed: "Call failed." },
  });
  const [status, setStatus]     = useState<"idle" | "calling" | "error">("idle");
  const [errMsg, setErrMsg]     = useState("");
  const [muted, setMuted]       = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const deviceRef               = useRef<unknown>(null);
  const callRef                 = useRef<unknown>(null);
  const cooldownRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { destroy(); if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  function destroy() {
    if (callRef.current)  { try { (callRef.current  as { disconnect: () => void }).disconnect(); } catch { /* */ } callRef.current  = null; }
    if (deviceRef.current){ try { (deviceRef.current as { destroy:    () => void }).destroy();    } catch { /* */ } deviceRef.current = null; }
  }

  function startCooldown(seconds = 15) {
    setCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function startCall() {
    if (cooldown > 0) return;
    setStatus("calling");
    setErrMsg("");
    destroy();
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { token } = await api.get<{ token: string }>("/calls/token");
      const { Device } = await import("@twilio/voice-sdk");
      const device = new Device(token, { logLevel: 1 });
      deviceRef.current = device;

      device.on("error", (err: unknown) => {
        const msg = (err as { message?: string })?.message ?? String(err);
        setErrMsg(msg);
        setStatus("error");
        destroy();
        startCooldown(15);
      });

      const call = await device.connect({ params: { To: phoneNumber, UserId: prospectId } });
      callRef.current = call;
      (call as { on: (e: string, cb: () => void) => void }).on("disconnect", () => {
        setStatus("idle");
        setMuted(false);
        destroy();
      });
    } catch (err: unknown) {
      const msg = (err as { detail?: string; message?: string })?.detail
        ?? (err as { message?: string })?.message
        ?? String(err);
      setErrMsg(msg);
      setStatus("error");
      destroy();
      startCooldown(15);
    }
  }

  function hangUp() {
    destroy();
    setStatus("idle");
    setMuted(false);
  }

  function toggleMute() {
    if (callRef.current) {
      const c = callRef.current as { mute: (v: boolean) => void; isMuted: () => boolean };
      const next = !c.isMuted();
      c.mute(next);
      setMuted(next);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Phone className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">{t.browser_phone}</p>
          <p className="text-xs text-muted-foreground">{phoneNumber || t.no_phone}</p>
        </div>
        <div className={cn(
          "ml-auto w-2 h-2 rounded-full",
          status === "calling" ? "bg-amber-500 animate-pulse" :
          status === "error"   ? "bg-destructive" :
          "bg-muted-foreground/30"
        )} />
      </div>

      {status === "idle" && (
        <Button size="sm" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={startCall} disabled={!phoneNumber}>
          <PhoneCall className="w-3.5 h-3.5" /> {t.call} {phoneNumber}
        </Button>
      )}
      {status === "calling" && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={toggleMute}>
            {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {muted ? t.unmute : t.mute}
          </Button>
          <Button size="sm" className="flex-1 gap-1 bg-destructive hover:bg-destructive/90 text-white" onClick={hangUp}>
            <PhoneOff className="w-3.5 h-3.5" /> {t.hang_up}
          </Button>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errMsg || t.call_failed}</span>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-2" onClick={startCall} disabled={!phoneNumber || cooldown > 0}>
            <PhoneCall className="w-3.5 h-3.5" />
            {cooldown > 0 ? `${t.retry_in} ${cooldown}s…` : t.retry_call}
          </Button>
        </div>
      )}

      {!phoneNumber && (
        <p className="text-xs text-muted-foreground text-center">{t.no_phone_on_file}</p>
      )}
    </div>
  );
}

// ── Form display helpers ──────────────────────────────────────────────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm">
        {value || <span className="text-muted-foreground italic">Not provided</span>}
      </p>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <a href={url} target="_blank" rel="noreferrer"
         className="text-sm text-primary hover:underline flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5" /> View document
      </a>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProspectDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const t = useT({
    fr: {
      not_found: "Prospect introuvable",
      load_failed: "Échec du chargement du prospect.",
      approve_failed: "Échec de l'approbation.",
      reject_failed: "Échec du rejet.",
      refresh: "Actualiser",
      decision: "Décision",
      approve_account: "Approuver le compte",
      reject_account: "Rejeter le compte",
      cancel: "Annuler",
      confirm_reject: "Confirmer le rejet",
      reject_ph: "Raison du rejet (envoyée à l'utilisateur par email)…",
      account_approved: "Compte approuvé. L'utilisateur peut s'abonner et accéder à la plateforme.",
      rejected: "Rejeté",
      re_approve: "Ré-approuver",
      onboarding_form: "Formulaire d'inscription",
      no_form: "Aucun formulaire soumis pour le moment.",
      call_history: "Historique des appels",
      calls: "appels",
      no_calls: "Aucun appel enregistré",
      use_browser_phone: "Utilisez le téléphone du navigateur à gauche pour démarrer un appel avec ce prospect.",
      // PhoneWidget
      browser_phone: "Téléphone navigateur",
      no_phone: "Aucun numéro de téléphone",
      call_btn: "Appeler",
      mute: "Mettre en sourdine", unmute: "Désactiver sourdine", hang_up: "Raccrocher",
      retry_call: "Réessayer l'appel", retry_in: "Réessayer dans",
      no_phone_on_file: "Aucun numéro pour ce prospect.",
      call_failed: "Appel échoué.",
    },
    en: {
      not_found: "Prospect not found",
      load_failed: "Failed to load prospect.",
      approve_failed: "Approval failed.",
      reject_failed: "Rejection failed.",
      refresh: "Refresh",
      decision: "Decision",
      approve_account: "Approve account",
      reject_account: "Reject account",
      cancel: "Cancel",
      confirm_reject: "Confirm reject",
      reject_ph: "Reason for rejection (sent to user by email)…",
      account_approved: "Account approved. User can now subscribe and access the platform.",
      rejected: "Rejected",
      re_approve: "Re-approve",
      onboarding_form: "Onboarding form",
      no_form: "No form submitted yet.",
      call_history: "Call history",
      calls: "calls",
      no_calls: "No calls logged yet",
      use_browser_phone: "Use the browser phone on the left to start a call with this prospect.",
      browser_phone: "Browser Phone",
      no_phone: "No phone number",
      call_btn: "Call",
      mute: "Mute", unmute: "Unmute", hang_up: "Hang up",
      retry_call: "Retry call", retry_in: "Retry in",
      no_phone_on_file: "No phone number on file for this prospect.",
      call_failed: "Call failed.",
    },
  });

  const [prospect, setProspect]     = useState<CrmProspect | null>(null);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setAction]  = useState(false);
  const [error, setError]           = useState("");
  const [rejectReason, setReject]   = useState("");
  const [showRejectForm, setShowRF] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get<CrmProspect>(`/crm/prospects/${params.userId}`);
      setProspect(d);
    } catch { setError(t.load_failed); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [params.userId]);

  async function handleApprove() {
    setAction(true);
    setError("");
    try {
      await api.post(`/crm/prospects/${params.userId}/approve`, {});
      await load();
    } catch { setError(t.approve_failed); }
    finally { setAction(false); }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setAction(true);
    setError("");
    try {
      await api.post(`/crm/prospects/${params.userId}/reject`, { reason: rejectReason });
      setShowRF(false);
      await load();
    } catch { setError(t.reject_failed); }
    finally { setAction(false); }
  }

  async function handleUpdateCall(id: string, outcome: CallOutcome, notes: string) {
    try {
      await api.patch(`/crm/calls/${id}`, { outcome, agent_notes: notes });
      await load();
    } catch { /* ignore */ }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (!prospect) return (
    <div className="px-8 py-16 text-center text-muted-foreground">
      {error || t.not_found}
    </div>
  );

  const phone = prospect.phone_number
    ? `${prospect.phone_code ?? ""}${prospect.phone_number}`.trim()
    : "";

  const form = prospect.form;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-6">

      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.push("/crm")} className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <UserAvatar
              src={prospect.avatar_url}
              name={prospect.name}
              familyName={prospect.family_name}
              size={44}
            />
            <div>
              <h1 className="text-xl font-black tracking-tight">{prospect.name} {prospect.family_name}</h1>
              <p className="text-sm text-muted-foreground">{prospect.email}</p>
            </div>
            <StatusBadge status={prospect.onboarding_status} />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={load} className="gap-1.5 shrink-0">
          <RefreshCcw className="w-3.5 h-3.5" /> {t.refresh}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: form answers + actions */}
        <div className="lg:col-span-1 space-y-4">

          {/* Phone widget */}
          <PhoneWidget prospectId={prospect.id} phoneNumber={phone} />

          {/* Approve / reject */}
          {prospect.onboarding_status !== "approved" && prospect.onboarding_status !== "rejected" && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <p className="text-sm font-semibold">{t.decision}</p>
              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {t.approve_account}
              </Button>
              {!showRejectForm ? (
                <Button variant="outline" className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/5" onClick={() => setShowRF(true)}>
                  <XCircle className="w-4 h-4" /> {t.reject_account}
                </Button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setReject(e.target.value)}
                    placeholder={t.reject_ph}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive/30"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowRF(false)}>{t.cancel}</Button>
                    <Button size="sm" className="flex-1 bg-destructive hover:bg-destructive/90 text-white" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t.confirm_reject}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Already approved/rejected state */}
          {prospect.onboarding_status === "approved" && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {t.account_approved}
            </div>
          )}
          {prospect.onboarding_status === "rejected" && (
            <div className="space-y-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-semibold flex items-center gap-2"><XCircle className="w-4 h-4" /> {t.rejected}</p>
              {prospect.rejection_reason && <p className="text-xs text-muted-foreground">{prospect.rejection_reason}</p>}
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white mt-2" onClick={handleApprove} disabled={actionLoading}>
                {t.re_approve}
              </Button>
            </div>
          )}

          {/* Form answers — grouped into KYB/KYC/Banking sections */}
          {form ? (
            <>
              {/* KYC — Signer identity */}
              <FormSection title="Signer identity (KYC)">
                <Field label="Role"        value={form.signer_role} />
                <Field label="CIN/Passport" value={form.cin_or_passport} />
                <Field label="Date of birth" value={form.date_of_birth} />
                <Field label="Nationality" value={form.nationality} />
                {form.id_document_url && <DocLink label="ID document" url={form.id_document_url} />}
                {form.business_proof_url && <DocLink label="Business proof" url={form.business_proof_url} />}
              </FormSection>

              {/* KYB — Business identity */}
              <FormSection title="Business (KYB)">
                <Field label="Legal entity" value={form.legal_entity_name} />
                <Field label="Type"         value={form.business_type} />
                <Field label="Tax ID"       value={form.tax_id} />
                <Field label="RNE"          value={form.rne_number} />
                <Field label="Years"        value={form.years_in_business?.toString()} />
                {form.business_address?.same_as_personal === "no" && (
                  <Field label="Business address"
                    value={[form.business_address.rue, form.business_address.city, form.business_address.zip_code, form.business_address.gouvernorat].filter(Boolean).join(", ")}
                  />
                )}
              </FormSection>

              {/* Operations */}
              <FormSection title="Operations">
                <Field label="Stores on Uber"     value={form.store_count?.toString()} />
                <Field label="Other platforms"    value={form.other_platforms?.length ? form.other_platforms.join(", ") : null} />
                <Field label="Monthly revenue"    value={form.monthly_uber_revenue} />
                <Field label="Monthly loss est."  value={form.monthly_loss_estimate} />
                <Field label="Refund handling"    value={form.refund_handling_today} />
              </FormSection>

              {/* Preferences */}
              <FormSection title="Preferences">
                <Field label="Preferred call"     value={form.preferred_call_time ? new Date(form.preferred_call_time).toLocaleString("fr-FR") : null} />
                <Field label="Contact method"     value={form.preferred_contact_method} />
                <Field label="Referral"           value={form.referral_source} />
                {form.notes && (
                  <div className="flex items-start gap-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes</p>
                      <p className="text-sm text-muted-foreground italic">{form.notes}</p>
                    </div>
                  </div>
                )}
              </FormSection>
            </>
          ) : (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted border border-border text-sm text-muted-foreground">
              <FileText className="w-4 h-4 shrink-0" /> {t.no_form}
            </div>
          )}
        </div>

        {/* Right: call history */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              {t.call_history}
              {prospect.calls && prospect.calls.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">({prospect.calls.length} {t.calls})</span>
              )}
            </p>
          </div>

          {!prospect.calls || prospect.calls.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground space-y-2">
              <PhoneCall className="w-8 h-8 mx-auto text-muted-foreground/30" />
              <p className="text-sm">{t.no_calls}</p>
              <p className="text-xs">{t.use_browser_phone}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prospect.calls.map((call) => (
                <CallCard key={call.id} call={call} onUpdate={handleUpdateCall} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
