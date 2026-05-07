"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

type Props = {
  kind: "id_document" | "business_proof" | "bank_statement";
  label: string;
  hint?: string;
  value?: string | null;          // current uploaded URL
  onChange: (url: string | null) => void;
  required?: boolean;
};

export function FileUpload({ kind, label, hint, value, onChange, required }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(f: File) {
    setError("");
    if (f.size > MAX_SIZE) { setError("File too large (max 10 MB)"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);

      const token = getAccessToken();
      const res = await fetch(`${BASE_URL}/onboarding/upload-document?kind=${kind}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(e.detail ?? "Upload failed");
      }
      const data = await res.json();
      onChange(data.url);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {label} {required && <span className="text-destructive">*</span>}
        </p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-600">Uploaded</p>
            <a href={value} target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground truncate block hover:underline">
              {value.split("/").pop()}
            </a>
          </div>
          <FileText className="w-4 h-4 text-muted-foreground" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors px-4 py-6 flex flex-col items-center justify-center gap-2",
            uploading && "opacity-60 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <Upload className="w-5 h-5 text-muted-foreground" />
          )}
          <p className="text-xs text-muted-foreground">
            {uploading ? "Uploading…" : "Click to upload (JPG, PNG, WebP or PDF, max 10 MB)"}
          </p>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
    </div>
  );
}
