"use client";

import { useState, useRef } from "react";
import {
  Store,
  ShoppingBag,
  CreditCard,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  Send,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";

type SyncStatus = "idle" | "loading" | "success" | "error";

interface SyncState {
  status: SyncStatus;
  result: Record<string, unknown> | null;
  errorMsg: string | null;
  lastRun: Date | null;
}

const initialSync: SyncState = { status: "idle", result: null, errorMsg: null, lastRun: null };

function ResultCard({ result }: { result: Record<string, unknown> }) {
  const entries = Object.entries(result).filter(([k]) => k !== "store_ids" && k !== "triggered_by");
  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 space-y-1.5">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
          <span className="font-semibold">{String(val)}</span>
        </div>
      ))}
    </div>
  );
}

function SyncCard({
  icon: Icon, iconColor, iconBg, title, description, buttonLabel, state, onSync,
}: {
  icon: React.ElementType; iconColor: string; iconBg: string; title: string;
  description: string; buttonLabel: string; state: SyncState; onSync: () => void;
}) {
  return (
    <div className={cn(
      "flex flex-col rounded-2xl border bg-card p-6 transition-all",
      state.status === "success" && "border-primary/30 shadow-md shadow-primary/5",
      state.status === "error"   && "border-destructive/30",
      (state.status === "idle" || state.status === "loading") && "border-border"
    )}>
      <div className="flex items-start justify-between mb-5">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {state.lastRun && (
          <span className="text-[10px] text-muted-foreground">Last: {state.lastRun.toLocaleTimeString()}</span>
        )}
      </div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
      {state.status !== "idle" && (
        <div className="mt-4">
          {state.status === "loading" && <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Running…</Badge>}
          {state.status === "success" && <Badge variant="outline" className="gap-1.5 text-xs border-primary/40 text-primary bg-primary/5"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>}
          {state.status === "error"   && <Badge variant="outline" className="gap-1.5 text-xs border-destructive/40 text-destructive bg-destructive/5"><XCircle className="w-3 h-3" /> Failed</Badge>}
        </div>
      )}
      {state.status === "success" && state.result && <ResultCard result={state.result} />}
      {state.status === "error" && state.errorMsg && (
        <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">{state.errorMsg}</div>
      )}
      <Button onClick={onSync} disabled={state.status === "loading"} variant={state.status === "success" ? "outline" : "default"} className="mt-5 w-full gap-2 font-semibold">
        {state.status === "loading"
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing…</>
          : <><RefreshCcw className="w-4 h-4" /> {buttonLabel}</>
        }
      </Button>
    </div>
  );
}

interface UploadResult {
  filename: string;
  url?: string;
  error?: string;
}

export default function AdminSyncPage() {
  const t = useT({
    fr: {
      admin: "Admin", title: "Synchronisation & Téléchargements",
      lead: "Déclencher des synchronisations Uber et gérer les téléchargements de justificatifs.",
      syncing: "Synchronisation…", sync_all: "Tout synchroniser",
      data_sync: "Synchronisation données", bg_thread: "S'exécute en arrière-plan",
      stores: "Restaurants", orders: "Commandes", payments: "Paiements",
      stores_desc: "Récupère tous les restaurants SmartKitchen depuis l'API Uber et auto-vérifie les restaurants utilisateurs en attente.",
      orders_desc: "Récupère les commandes annulées et contestées de tous les restaurants SK actifs en un seul appel d'arrière-plan.",
      payments_desc: "Déclenche un rapport de paiements et sauvegarde les remboursements restaurant pour tous les restaurants actifs.",
      sync_stores: "Synchroniser restaurants", sync_orders: "Synchroniser commandes", sync_payments: "Synchroniser paiements",
      proof_images: "Justificatifs", filename_match: "Le nom de fichier doit correspondre à l'ID commande (ex. F745B.jpg)",
      upload_proofs: "Téléverser justificatifs",
      proof_lead_a: "Téléversez des images JPEG, PNG ou WebP. Le nom de fichier doit être l'ID commande (ex. ",
      proof_lead_b: "). Max 10 Mo par fichier.",
      uploading: "Téléversement…", choose_files: "Choisir des fichiers",
      uploaded: "Téléversés", failed: "Échoués",
      refund_emails: "Emails de remboursement", auto_24h: "Lancé automatiquement toutes les 24 h",
      send_refund_emails: "Envoyer les emails de remboursement",
      refund_lead: "Pour chaque commande contestée avec le statut « en attente », trouve son justificatif et envoie un email de demande de remboursement à Uber via Mailjet.",
      sending: "Envoi…", send_all_pending: "Envoyer tous les emails en attente",
      // errors
      err_stores: "Échec sync restaurants.", err_orders: "Échec sync commandes.", err_payments: "Échec sync paiements.",
      err_upload: "Échec du téléversement.", err_send: "Échec de l'envoi des emails.",
    },
    en: {
      admin: "Admin", title: "Sync & Upload",
      lead: "Trigger data syncs from Uber and manage proof uploads.",
      syncing: "Syncing…", sync_all: "Sync All",
      data_sync: "Data Sync", bg_thread: "Runs in background thread",
      stores: "Stores", orders: "Orders", payments: "Payments",
      stores_desc: "Pull all SmartKitchen stores from Uber's API and auto-verify pending user stores.",
      orders_desc: "Fetch cancelled and contested orders for all active SK stores in one background call.",
      payments_desc: "Trigger a payment details report and save restaurant refund rows for all active stores.",
      sync_stores: "Sync Stores", sync_orders: "Sync Orders", sync_payments: "Sync Payments",
      proof_images: "Proof Images", filename_match: "Filename must match Order ID (e.g. F745B.jpg)",
      upload_proofs: "Upload Proofs",
      proof_lead_a: "Upload JPEG, PNG, or WebP images. The filename must be the Order ID (e.g. ",
      proof_lead_b: "). Max 10 MB per file.",
      uploading: "Uploading…", choose_files: "Choose Files",
      uploaded: "Uploaded", failed: "Failed",
      refund_emails: "Refund Emails", auto_24h: "Auto-runs every 24h",
      send_refund_emails: "Send Refund Emails",
      refund_lead: "For every contested order with status \"en attente\", find its proof image and send a refund request email to Uber support via Mailjet.",
      sending: "Sending…", send_all_pending: "Send All Pending Emails",
      err_stores: "Store sync failed.", err_orders: "Order sync failed.", err_payments: "Payment sync failed.",
      err_upload: "Upload failed.", err_send: "Failed to send emails.",
    },
  });
  const [stores,   setStores]   = useState<SyncState>(initialSync);
  const [orders,   setOrders]   = useState<SyncState>(initialSync);
  const [payments, setPayments] = useState<SyncState>(initialSync);

  // Proof upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadResult, setUpResult] = useState<{ uploaded: UploadResult[]; failed: UploadResult[] } | null>(null);

  // Send emails
  const [sendState, setSendState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [sendMsg, setSendMsg]     = useState("");

  async function syncStores() {
    setStores({ ...initialSync, status: "loading" });
    try {
      const r = await api.post<Record<string, unknown>>("/smartkitchen-stores/admin/sync");
      setStores({ status: "success", result: r, errorMsg: null, lastRun: new Date() });
    } catch (err: unknown) {
      setStores({ status: "error", result: null, errorMsg: (err as { detail?: string }).detail ?? t.err_stores, lastRun: new Date() });
    }
  }

  async function syncOrders() {
    setOrders({ ...initialSync, status: "loading" });
    try {
      const r = await api.post<Record<string, unknown>>("/order-reports/admin/sync-nowV2");
      setOrders({ status: "success", result: r, errorMsg: null, lastRun: new Date() });
    } catch (err: unknown) {
      setOrders({ status: "error", result: null, errorMsg: (err as { detail?: string }).detail ?? t.err_orders, lastRun: new Date() });
    }
  }

  async function syncPayments() {
    setPayments({ ...initialSync, status: "loading" });
    try {
      const r = await api.post<Record<string, unknown>>("/order-reports/admin/payment-syncV2");
      setPayments({ status: "success", result: r, errorMsg: null, lastRun: new Date() });
    } catch (err: unknown) {
      setPayments({ status: "error", result: null, errorMsg: (err as { detail?: string }).detail ?? t.err_payments, lastRun: new Date() });
    }
  }

  async function uploadProofs(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUpResult(null);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const r = await api.post<{ uploaded: UploadResult[]; failed: UploadResult[] }>(
        "/order-proofs/upload", form
      );
      setUpResult(r);
    } catch (err: unknown) {
      setUpResult({ uploaded: [], failed: [{ filename: "—", error: (err as { detail?: string }).detail ?? t.err_upload }] });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function sendEmails() {
    setSendState("loading");
    setSendMsg("");
    try {
      const r = await api.post<{ sent: number; skipped_no_proof: number; errors: number }>(
        "/order-proofs/admin/send-refund-emails"
      );
      setSendMsg(`${r.sent} sent · ${r.skipped_no_proof} skipped (no proof) · ${r.errors} errors`);
      setSendState("done");
    } catch (err: unknown) {
      setSendMsg((err as { detail?: string }).detail ?? t.err_send);
      setSendState("error");
    }
  }

  const isAnySyncing = stores.status === "loading" || orders.status === "loading" || payments.status === "loading";

  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 text-xs font-semibold mb-2">{t.admin}</Badge>
            <h1 className="text-3xl font-black tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>
          </div>
          <Button size="sm" disabled={isAnySyncing} onClick={() => Promise.allSettled([syncStores(), syncOrders(), syncPayments()])} className="gap-1.5 font-semibold shadow-md shadow-primary/20 press-scale">
            {isAnySyncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.syncing}</> : <><RefreshCcw className="w-3.5 h-3.5" /> {t.sync_all}</>}
          </Button>
        </div>

        {/* Sync cards */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold">{t.data_sync}</h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t.bg_thread}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SyncCard icon={Store}      iconColor="text-primary"    iconBg="bg-primary/10"    title={t.stores}   description={t.stores_desc}    buttonLabel={t.sync_stores}   state={stores}   onSync={syncStores}   />
            <SyncCard icon={ShoppingBag} iconColor="text-sky-500"   iconBg="bg-sky-500/10"    title={t.orders}   description={t.orders_desc} buttonLabel={t.sync_orders}   state={orders}   onSync={syncOrders}   />
            <SyncCard icon={CreditCard} iconColor="text-violet-500" iconBg="bg-violet-500/10" title={t.payments} description={t.payments_desc}   buttonLabel={t.sync_payments} state={payments} onSync={syncPayments} />
          </div>
        </div>

        {/* Proof upload */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold">{t.proof_images}</h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t.filename_match}</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{t.upload_proofs}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.proof_lead_a}<code className="text-xs bg-muted px-1 py-0.5 rounded">F745B.jpg</code>{t.proof_lead_b}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadProofs} />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-1.5">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? t.uploading : t.choose_files}
              </Button>
            </div>

            {uploadResult && (
              <div className="space-y-3">
                {uploadResult.uploaded.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t.uploaded} ({uploadResult.uploaded.length})</p>
                    {uploadResult.uploaded.map((f) => (
                      <div key={f.filename} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <code className="font-mono">{f.filename}</code>
                      </div>
                    ))}
                  </div>
                )}
                {uploadResult.failed.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wide">{t.failed} ({uploadResult.failed.length})</p>
                    {uploadResult.failed.map((f) => (
                      <div key={f.filename} className="flex items-center gap-2 text-xs text-destructive">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <code className="font-mono">{f.filename}</code>
                        {f.error && <span className="text-muted-foreground">— {f.error}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Send refund emails */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold">{t.refund_emails}</h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t.auto_24h}</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-sky-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{t.send_refund_emails}</h3>
                <p className="text-sm text-muted-foreground">{t.refund_lead}</p>
              </div>
            </div>

            {sendMsg && (
              <div className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
                sendState === "done"
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : "border-destructive/20 bg-destructive/5 text-destructive"
              )}>
                {sendState === "done" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                {sendMsg}
              </div>
            )}

            <Button onClick={sendEmails} disabled={sendState === "loading"} className="gap-1.5">
              {sendState === "loading"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.sending}</>
                : <><Send className="w-4 h-4" /> {t.send_all_pending}</>
              }
            </Button>
          </div>
        </div>
    </div>
  );
}
