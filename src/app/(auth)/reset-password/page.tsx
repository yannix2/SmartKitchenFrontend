"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCPw, setShowCPw]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    if (!token)               { setError("Reset token is missing. Please use the link from your email."); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password }, { skipAuth: true });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 400) setError("This reset link is invalid or has expired. Please request a new one.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Success state ──────────────────────────────────── */
  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-2">Password updated</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your password has been reset successfully.
            <br />Redirecting you to sign in…
          </p>
        </div>
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary animate-[grow_2.5s_linear_forwards] rounded-full" />
        </div>
        <Link href="/login" className="w-full">
          <Button size="lg" className="w-full font-bold">
            Sign In Now
          </Button>
        </Link>
      </div>
    );
  }

  /* ── No token warning ───────────────────────────────── */
  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Link href="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Request a new link
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2">Invalid link</h1>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          No reset token found. Please use the link from your email or request a new one.
        </div>
        <Link href="/forgot-password">
          <Button size="lg" className="w-full font-bold">Request New Link</Button>
        </Link>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
        <h1 className="text-3xl font-black tracking-tight mb-2">Set new password</h1>
        <p className="text-muted-foreground text-sm">
          Choose a strong password for your account.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in-up">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
            />
            <button type="button" onClick={() => setShowPw((p) => !p)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showCPw ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 pr-10"
            />
            <button type="button" onClick={() => setShowCPw((p) => !p)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Live match indicator */}
          {confirm.length > 0 && (
            <p className={`text-xs flex items-center gap-1.5 ${password === confirm ? "text-primary" : "text-destructive"}`}>
              {password === confirm
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                : <><AlertCircle className="w-3.5 h-3.5" /> Passwords do not match</>
              }
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow mt-1"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Updating password…</>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
