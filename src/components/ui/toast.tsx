"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant; ttl: number };

type Ctx = {
  toast: (message: string, variant?: ToastVariant, ttl?: number) => void;
  success: (message: string, ttl?: number) => void;
  error:   (message: string, ttl?: number) => void;
  info:    (message: string, ttl?: number) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = "info", ttl = 3500) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message, variant, ttl }]);
    setTimeout(() => remove(id), ttl);
  }, [remove]);

  const ctx: Ctx = {
    toast,
    success: useCallback((m: string, ttl?: number) => toast(m, "success", ttl), [toast]),
    error:   useCallback((m: string, ttl?: number) => toast(m, "error", ttl), [toast]),
    info:    useCallback((m: string, ttl?: number) => toast(m, "info", ttl), [toast]),
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
        {items.map((t) => <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />)}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = toast.variant === "success" ? CheckCircle2 : toast.variant === "error" ? AlertCircle : Info;
  return (
    <div
      className={cn(
        "pointer-events-auto animate-toast-in flex items-start gap-3 rounded-xl border bg-card shadow-lg shadow-black/5 px-4 py-3 text-sm",
        toast.variant === "success" && "border-emerald-500/30 bg-emerald-500/5",
        toast.variant === "error"   && "border-destructive/30 bg-destructive/5",
        toast.variant === "info"    && "border-primary/30 bg-primary/5",
      )}
    >
      <Icon className={cn(
        "w-4 h-4 mt-0.5 shrink-0",
        toast.variant === "success" && "text-emerald-600",
        toast.variant === "error"   && "text-destructive",
        toast.variant === "info"    && "text-primary",
      )} />
      <div className="flex-1 min-w-0 text-foreground">{toast.message}</div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
