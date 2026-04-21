"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Store,
  Search,
  Copy,
  CheckCheck,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { AdminNav } from "@/components/layout/admin-nav";

// API returns [{store_id, store_name}]
interface AdminStore { store_id: string; store_name: string }

const LIMIT = 50;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="ml-1 text-muted-foreground hover:text-foreground transition-colors" title="Copy store ID">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function AdminStoresPage() {
  const [allStores, setAllStores] = useState<AdminStore[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(0);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      // Returns plain array, not paginated
      const data = await api.get<AdminStore[]>("/smartkitchen-stores/admin/list");
      setAllStores(Array.isArray(data) ? data : []);
    } catch {
      setAllStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const filtered = search
    ? allStores.filter((s) =>
        s.store_name.toLowerCase().includes(search.toLowerCase()) ||
        s.store_id.toLowerCase().includes(search.toLowerCase())
      )
    : allStores;

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paged      = filtered.slice(page * LIMIT, (page + 1) * LIMIT);

  function applySearch(v: string) { setSearch(v); setPage(0); }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Stores</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${filtered.length.toLocaleString()} store${filtered.length !== 1 ? "s" : ""}${search ? " matching" : " total"}`}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchStores} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or store ID…"
            className="pl-9"
            value={search}
            onChange={(e) => applySearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Store Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Store ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-16 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading stores…
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-16 text-center text-muted-foreground">
                      {search ? "No stores match your search." : "No stores found. Run a sync first."}
                    </td>
                  </tr>
                ) : paged.map((s, i) => (
                  <tr key={s.store_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{page * LIMIT + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Store className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="font-semibold text-sm">{s.store_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{s.store_id}</code>
                        <CopyButton text={s.store_id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages} — {filtered.length} stores
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="gap-1">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
