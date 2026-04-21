"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setTokens } from "@/lib/api";
import type { LoginResponse } from "@/types";

// ── Form (needs useSearchParams → must be inside Suspense) ───────────────────

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<LoginResponse>("/auth/login", form, {
        skipAuth: true,
      });
      setTokens(data.access_token, data.refresh_token);
      router.push(from);
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 401)
        setError("Incorrect email or password.");
      else if (e.status === 403)
        setError("Your account is not verified or has been deactivated.");
      else
        setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your SmartKitchen account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in-up">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@restaurant.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={set("email")}
            className="h-11"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={set("password")}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow mt-1"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">New to SmartKitchen?</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link href="/register">
        <Button variant="outline" size="lg" className="w-full h-11 font-semibold">
          Create an account
        </Button>
      </Link>
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-3 text-muted-foreground min-h-[300px]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
