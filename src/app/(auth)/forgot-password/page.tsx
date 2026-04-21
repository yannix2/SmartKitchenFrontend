"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email }, { skipAuth: true });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Success state ──────────────────────────────────── */
  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-2">Email sent</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            If <strong className="text-foreground">{email}</strong> is registered,
            you&apos;ll receive a password reset link shortly.
          </p>
        </div>
        <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-left space-y-2.5">
          {[
            "Check your inbox and spam folder",
            "Click the reset link (valid for 1 hour)",
            "Choose a new password",
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              {s}
            </div>
          ))}
        </div>
        <Link href="/login" className="w-full">
          <Button variant="outline" size="lg" className="w-full font-semibold gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
        <h1 className="text-3xl font-black tracking-tight mb-2">Forgot password?</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          No worries — enter your email and we&apos;ll send you a reset link.
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
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@restaurant.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending link…</>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </div>
  );
}
