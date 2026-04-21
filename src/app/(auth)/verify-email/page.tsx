"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type Status = "loading" | "success" | "error" | "missing";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "loading" : "missing");

  useEffect(() => {
    if (!token) return;

    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
        skipAuth: true,
      })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  /* ── Loading ──────────────────────────────────────────── */
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-5 text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div>
          <h1 className="text-2xl font-black mb-1">Verifying your email…</h1>
          <p className="text-muted-foreground text-sm">Just a moment, please.</p>
        </div>
      </div>
    );
  }

  /* ── Success ──────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-11 h-11 text-primary" />
          </div>
          {/* Ripple */}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Email verified!
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Your account is now active. You can sign in and start recovering
            your Uber Eats refunds.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-sm text-left space-y-3">
          {[
            "Account activated",
            "Full dashboard access unlocked",
            "Ready to connect your stores",
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              {s}
            </div>
          ))}
        </div>

        <Link href="/login" className="w-full">
          <Button
            size="lg"
            className="w-full gap-2 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:-translate-y-0.5 transition-all"
          >
            Sign In to Your Account <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Missing token ────────────────────────────────────── */
  if (status === "missing") {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <XCircle className="w-11 h-11 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">No token found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            This link appears to be incomplete. Please use the exact link from
            your verification email.
          </p>
        </div>
        <Link href="/register" className="w-full">
          <Button size="lg" variant="outline" className="w-full gap-2 font-semibold">
            <RotateCcw className="w-4 h-4" /> Back to Register
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Error (invalid / expired) ────────────────────────── */
  return (
    <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
      <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
        <XCircle className="w-11 h-11 text-destructive" />
      </div>

      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Verification failed
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          This link is invalid or has expired. Verification links are valid for
          24 hours.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-left space-y-2.5">
        {[
          "Make sure you used the latest email we sent",
          "Links expire after 24 hours",
          "Register again to receive a new link",
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-3 text-muted-foreground">
            <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            {s}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/register">
          <Button
            size="lg"
            className="w-full gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
          >
            <RotateCcw className="w-4 h-4" /> Register Again
          </Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline" className="w-full font-semibold">
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
