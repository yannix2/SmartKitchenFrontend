"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Store,
  Plus,
  Trash2,
  Loader2,
  Copy,
  CheckCheck,
  AlertCircle,
  PackageOpen,
  Clock,
  CheckCircle2,
  Upload,
  FileSpreadsheet,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { UserStore, StoreAddResult } from "@/types";

const STATUS_VERIFIED = "verified";

interface ImportResult {
  store_id: string;
  store_name: string | null;
  action: "added" | "already_exists";
  status: string;
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded" title="Copy">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Integration guide ─────────────────────────────────────────────────────────

function IntegrationGuide() {
  const [open, setOpen] = useState(false);
  const t = useT({
    fr: {
      title: "Comment intégrer votre restaurant avec SmartKitchen",
      lead_a: "Pour permettre à SmartKitchen de gérer vos commandes et rapports, vous devez nous ajouter en tant que",
      manager: "Gérant",
      lead_b: "sur votre restaurant Uber Eats. Suivez ces étapes :",
      s1_t: "Ouvrir Uber Eats Manager",
      s1_d: "Allez sur manager.uber.com et connectez-vous avec votre compte restaurant.",
      s2_t: "Sélectionner votre restaurant",
      s2_d: "Depuis la barre du haut, choisissez le restaurant à intégrer.",
      s3_t: "Aller dans Utilisateurs & Permissions",
      s3_d: "Naviguez vers Paramètres → Utilisateurs & Permissions (ou « Membres de l'équipe »).",
      s4_t: "Ajouter SmartKitchen comme Gérant",
      s4_d_a: "Cliquez sur",
      s4_d_invite: "Inviter un utilisateur",
      s4_d_b: ", entrez l'email SmartKitchen et définissez le rôle sur",
      s4_d_role: "Gérant",
      s5_t: "Attendre la vérification",
      s5_d: "Une fois accepté, votre statut passera automatiquement de En attente à Vérifié.",
    },
    en: {
      title: "How to integrate your store with SmartKitchen",
      lead_a: "To allow SmartKitchen to manage your orders and reports, you need to add us as a",
      manager: "Manager",
      lead_b: "on your Uber Eats store. Follow these steps:",
      s1_t: "Open Uber Eats Manager",
      s1_d: "Go to manager.uber.com and sign in with your restaurant account.",
      s2_t: "Select your store",
      s2_d: "From the top navigation, choose the store you want to integrate.",
      s3_t: "Go to Users & Permissions",
      s3_d: 'Navigate to Settings → Users & Permissions (or "Team Members").',
      s4_t: "Add SmartKitchen as Manager",
      s4_d_a: "Click",
      s4_d_invite: "Invite User",
      s4_d_b: ", enter the SmartKitchen email address, and set the role to",
      s4_d_role: "Manager",
      s5_t: "Wait for verification",
      s5_d: "Once accepted, your store status will automatically switch from Pending to Verified.",
    },
  });
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">{t.title}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-amber-500 shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-amber-500/20">
          <p className="text-sm text-muted-foreground pt-3">
            {t.lead_a} <strong>{t.manager}</strong> {t.lead_b}
          </p>
          <ol className="space-y-3">
            {[
              { step: "1", title: t.s1_t, desc: t.s1_d as React.ReactNode },
              { step: "2", title: t.s2_t, desc: t.s2_d as React.ReactNode },
              { step: "3", title: t.s3_t, desc: t.s3_d as React.ReactNode },
              {
                step: "4",
                title: t.s4_t,
                desc: (
                  <>
                    {t.s4_d_a} <strong>{t.s4_d_invite}</strong>{t.s4_d_b} <strong>{t.s4_d_role}</strong>.
                  </>
                ),
              },
              { step: "5", title: t.s5_t, desc: t.s5_d as React.ReactNode },
            ].map((item) => (
              <li key={item.step} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ── CSV drop zone ─────────────────────────────────────────────────────────────

function CsvDropZone({ onImport }: { onImport: (results: ImportResult[]) => void }) {
  const [dragging, setDragging]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError]         = useState("");
  const [results, setResults]     = useState<ImportResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT({
    fr: {
      need_csv: "Veuillez téléverser un fichier .csv.",
      import_failed: "Échec de l'import.",
      importing: "Import en cours…",
      drop_here: "Déposez votre CSV Uber Eats ici",
      processing: "Traitement de vos restaurants",
      or_click: "ou cliquez pour parcourir — colonnes requises : Shop UUID, Name",
      already_linked: "déjà lié",
      verified: "Vérifié",
      pending: "En attente",
    },
    en: {
      need_csv: "Please upload a .csv file.",
      import_failed: "Import failed.",
      importing: "Importing…",
      drop_here: "Drop your Uber Eats CSV here",
      processing: "Processing your stores",
      or_click: "or click to browse — requires Shop UUID, Name columns",
      already_linked: "already linked",
      verified: "Verified",
      pending: "Pending",
    },
  });

  async function processFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError(t.need_csv);
      return;
    }
    setImporting(true);
    setError("");
    setResults([]);
    try {
      const form = new FormData();
      form.append("file", file);
      const d = await api.upload<{ results: ImportResult[] }>(
        "/smartkitchen-stores/my/import-csv",
        form
      );
      setResults(d.results ?? []);
      onImport(d.results ?? []);
    } catch (err: unknown) {
      setError((err as { detail?: string }).detail ?? t.import_failed);
    } finally {
      setImporting(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl flex flex-col items-center gap-3 py-10 cursor-pointer transition-colors select-none",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        )}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
        {importing ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        ) : (
          <FileSpreadsheet className={cn("w-8 h-8 transition-colors", dragging ? "text-primary" : "text-muted-foreground/50")} />
        )}
        <div className="text-center">
          <p className="text-sm font-semibold">
            {importing ? t.importing : t.drop_here}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {importing ? t.processing : t.or_click}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 divide-y divide-border overflow-hidden">
          {results.map((r) => (
            <div key={r.store_id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
              {r.status === STATUS_VERIFIED
                ? <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                : <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              }
              <span className="font-medium truncate flex-1">{r.store_name || r.store_id}</span>
              {r.action === "already_exists" && (
                <span className="text-muted-foreground shrink-0">{t.already_linked}</span>
              )}
              <Badge variant="outline" className={cn(
                "text-[10px] px-1.5 py-0 shrink-0",
                r.status === STATUS_VERIFIED
                  ? "border-primary/40 text-primary bg-primary/5"
                  : "border-amber-500/40 text-amber-600 bg-amber-500/5"
              )}>
                {r.status === STATUS_VERIFIED ? t.verified : t.pending}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StoresPage() {
  const t = useT({
    fr: {
      title: "Mes restaurants",
      lead: "Importez vos restaurants Uber Eats pour suivre les commandes et remboursements.",
      tab_csv: "Importer depuis CSV",
      tab_manual: "Saisir manuellement",
      paste_ph: "Collez un ou plusieurs UUID de restaurants Uber Eats, séparés par virgules, espaces ou retours à la ligne…",
      add_stores: "Ajouter le(s) restaurant(s)",
      add_failed: "Échec de l'ajout du/des restaurant(s).",
      verified: "Vérifié",
      pending: "En attente",
      loading: "Chargement…",
      stores_count_one: "restaurant",
      stores_count_many: "restaurants",
      no_stores: "Aucun restaurant ajouté",
      no_stores_lead: "Importez votre CSV Uber Eats ci-dessus pour commencer",
      remove_store: "Retirer le restaurant",
    },
    en: {
      title: "My Stores",
      lead: "Import your Uber Eats stores to start tracking orders and refunds.",
      tab_csv: "Import from CSV",
      tab_manual: "Enter manually",
      paste_ph: "Paste one or more Uber Eats store UUIDs, separated by commas, spaces, or new lines…",
      add_stores: "Add Store(s)",
      add_failed: "Failed to add store(s).",
      verified: "Verified",
      pending: "Pending",
      loading: "Loading…",
      stores_count_one: "store",
      stores_count_many: "stores",
      no_stores: "No stores added yet",
      no_stores_lead: "Import your Uber Eats CSV above to get started",
      remove_store: "Remove store",
    },
  });
  const [stores, setStores]         = useState<UserStore[]>([]);
  const [loading, setLoading]       = useState(true);
  const [addIds, setAddIds]         = useState("");
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState("");
  const [addResults, setAddResults] = useState<StoreAddResult[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [tab, setTab]               = useState<"manual" | "csv">("csv");

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<UserStore[]>("/smartkitchen-stores/my");
      setStores(data ?? []);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  async function addStore(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const ids = addIds.split(/[\n,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return;
    setAdding(true);
    setAddError("");
    setAddResults([]);
    try {
      const res = await api.post<{ results: StoreAddResult[] }>(
        "/smartkitchen-stores/my/add",
        { store_ids: ids }
      );
      setAddResults(res.results ?? []);
      setAddIds("");
      fetchStores();
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setAddError(e.detail ?? t.add_failed);
    } finally {
      setAdding(false);
    }
  }

  async function removeStore(storeId: string) {
    setRemovingId(storeId);
    try {
      await api.delete(`/smartkitchen-stores/my/${storeId}`);
      setStores((prev) => prev.filter((s) => s.store_id !== storeId));
    } catch {
      // silently ignore
    } finally {
      setRemovingId(null);
    }
  }

  const hasPending = stores.some((s) => s.status !== STATUS_VERIFIED);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-4.5 h-4.5 text-primary" style={{ width: "18px", height: "18px" }} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t.lead}</p>
      </div>

      {/* Integration guide — shown when there are pending stores */}
      {hasPending && <IntegrationGuide />}

      {/* Add store card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-1 border-b border-border pb-3">
          {(["csv", "manual"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTab(mode)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                tab === mode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {mode === "csv" ? <FileSpreadsheet className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              {mode === "csv" ? t.tab_csv : t.tab_manual}
            </button>
          ))}
        </div>

        {tab === "csv" ? (
          <CsvDropZone onImport={() => fetchStores()} />
        ) : (
          <form onSubmit={addStore} className="space-y-3">
            <textarea
              placeholder={t.paste_ph}
              value={addIds}
              onChange={(e) => { setAddIds(e.target.value); setAddError(""); setAddResults([]); }}
              className="w-full h-24 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              disabled={adding}
            />
            <Button type="submit" disabled={adding || !addIds.trim()} className="gap-1.5 w-full sm:w-auto">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t.add_stores}
            </Button>

            {addError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {addError}
              </div>
            )}

            {addResults.length > 0 && (
              <div className="space-y-1.5">
                {addResults.map((r) => (
                  <div key={r.store_id} className="flex items-center gap-2 text-xs">
                    {r.status === STATUS_VERIFIED
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      : <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    }
                    <code className="font-mono text-muted-foreground">{r.store_id.slice(0, 16)}…</code>
                    <Badge variant="outline" className={cn(
                      "text-[10px] px-1.5 py-0",
                      r.status === STATUS_VERIFIED
                        ? "border-primary/40 text-primary bg-primary/5"
                        : "border-amber-500/40 text-amber-600 bg-amber-500/5"
                    )}>
                      {r.status === STATUS_VERIFIED ? t.verified : t.pending}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Stores list */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm">
          {loading ? t.loading : `${stores.length} ${stores.length !== 1 ? t.stores_count_many : t.stores_count_one}`}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border flex flex-col items-center gap-3 py-12">
            <PackageOpen className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t.no_stores}</p>
            <p className="text-xs text-muted-foreground/60">{t.no_stores_lead}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stores.map((s) => {
              const verified = s.status === STATUS_VERIFIED;
              return (
                <div
                  key={s.store_id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 hover:border-primary/20 transition-colors group"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    verified ? "bg-primary/10" : "bg-amber-500/10"
                  )}>
                    <Store className={cn("w-4 h-4", verified ? "text-primary" : "text-amber-500")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{s.store_name || "—"}</p>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 shrink-0",
                        verified
                          ? "border-primary/40 text-primary bg-primary/5"
                          : "border-amber-500/40 text-amber-600 bg-amber-500/5"
                      )}>
                        {verified ? t.verified : t.pending}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <code className="text-[10px] text-muted-foreground font-mono">{s.store_id}</code>
                      <CopyButton text={s.store_id} />
                    </div>
                  </div>
                  <button
                    onClick={() => removeStore(s.store_id)}
                    disabled={removingId === s.store_id}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground transition-colors",
                      "hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100"
                    )}
                    title={t.remove_store}
                  >
                    {removingId === s.store_id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
