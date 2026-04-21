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
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
            How to integrate your store with SmartKitchen
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-amber-500 shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-amber-500/20">
          <p className="text-sm text-muted-foreground pt-3">
            To allow SmartKitchen to manage your orders and reports, you need to add us as a{" "}
            <strong>Manager</strong> on your Uber Eats store. Follow these steps:
          </p>
          <ol className="space-y-3">
            {[
              {
                step: "1",
                title: "Open Uber Eats Manager",
                desc: "Go to manager.uber.com and sign in with your restaurant account.",
              },
              {
                step: "2",
                title: "Select your store",
                desc: "From the top navigation, choose the store you want to integrate.",
              },
              {
                step: "3",
                title: "Go to Users & Permissions",
                desc: 'Navigate to Settings → Users & Permissions (or "Team Members").',
              },
              {
                step: "4",
                title: "Add SmartKitchen as Manager",
                desc: (
                  <>
                    Click <strong>Invite User</strong>, enter the SmartKitchen email address, and set the role to{" "}
                    <strong>Manager</strong>.
                  </>
                ),
              },
              {
                step: "5",
                title: "Wait for verification",
                desc: "Once accepted, your store status will automatically switch from Pending to Verified.",
              },
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

  async function processFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
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
      setError((err as { detail?: string }).detail ?? "Import failed.");
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
            {importing ? "Importing…" : "Drop your Uber Eats CSV here"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {importing ? "Processing your stores" : "or click to browse — requires Shop UUID, Name columns"}
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
                <span className="text-muted-foreground shrink-0">already linked</span>
              )}
              <Badge variant="outline" className={cn(
                "text-[10px] px-1.5 py-0 shrink-0",
                r.status === STATUS_VERIFIED
                  ? "border-primary/40 text-primary bg-primary/5"
                  : "border-amber-500/40 text-amber-600 bg-amber-500/5"
              )}>
                {r.status === STATUS_VERIFIED ? "Verified" : "Pending"}
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
      setAddError(e.detail ?? "Failed to add store(s).");
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
          <h1 className="text-2xl font-black tracking-tight">My Stores</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Import your Uber Eats stores to start tracking orders and refunds.
        </p>
      </div>

      {/* Integration guide — shown when there are pending stores */}
      {hasPending && <IntegrationGuide />}

      {/* Add store card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-1 border-b border-border pb-3">
          {(["csv", "manual"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {t === "csv" ? <FileSpreadsheet className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              {t === "csv" ? "Import from CSV" : "Enter manually"}
            </button>
          ))}
        </div>

        {tab === "csv" ? (
          <CsvDropZone onImport={() => fetchStores()} />
        ) : (
          <form onSubmit={addStore} className="space-y-3">
            <textarea
              placeholder="Paste one or more Uber Eats store UUIDs, separated by commas, spaces, or new lines…"
              value={addIds}
              onChange={(e) => { setAddIds(e.target.value); setAddError(""); setAddResults([]); }}
              className="w-full h-24 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              disabled={adding}
            />
            <Button type="submit" disabled={adding || !addIds.trim()} className="gap-1.5 w-full sm:w-auto">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Store(s)
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
                      {r.status === STATUS_VERIFIED ? "Verified" : "Pending"}
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
          {loading ? "Loading…" : `${stores.length} store${stores.length !== 1 ? "s" : ""}`}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border flex flex-col items-center gap-3 py-12">
            <PackageOpen className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No stores added yet</p>
            <p className="text-xs text-muted-foreground/60">Import your Uber Eats CSV above to get started</p>
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
                        {verified ? "Verified" : "Pending"}
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
                    title="Remove store"
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
