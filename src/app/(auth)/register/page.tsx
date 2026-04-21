"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

const PHONE_CODES = [
  { code: "+216", label: "🇹🇳 +216" },
  { code: "+33",  label: "🇫🇷 +33"  },
  { code: "+32",  label: "🇧🇪 +32"  },
  { code: "+41",  label: "🇨🇭 +41"  },
  { code: "+34",  label: "🇪🇸 +34"  },
  { code: "+39",  label: "🇮🇹 +39"  },
  { code: "+44",  label: "🇬🇧 +44"  },
  { code: "+49",  label: "🇩🇪 +49"  },
  { code: "+1",   label: "🇺🇸 +1"   },
];

type Form = {
  name: string;
  family_name: string;
  email: string;
  password: string;
  confirm: string;
  phone_number: string;
  phone_code: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<Form>({
    name: "", family_name: "", email: "",
    password: "", confirm: "", phone_number: "", phone_code: "+216",
  });
  const [showPw, setShowPw]     = useState(false);
  const [showCPw, setShowCPw]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/auth/register",
        {
          name: form.name,
          family_name: form.family_name,
          email: form.email,
          password: form.password,
          phone_number: form.phone_number || undefined,
          phone_code: form.phone_number ? form.phone_code : undefined,
          role: "user",
        },
        { skipAuth: true }
      );
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 400) setError("An account with this email already exists.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Success screen ─────────────────────────────────── */
  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            We sent a verification link to{" "}
            <strong className="text-foreground">{form.email}</strong>.
            Click it to activate your account.
          </p>
        </div>
        <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-left space-y-2">
          {["Check your inbox (and spam folder)", "Click the verification link", "Return here to sign in"].map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              {s}
            </div>
          ))}
        </div>
        <Link href="/login" className="w-full">
          <Button variant="outline" size="lg" className="w-full font-semibold">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Create account</h1>
        <p className="text-muted-foreground text-sm">
          Start recovering your Uber Eats refunds today
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in-up">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">First Name</Label>
            <Input id="name" placeholder="Yassine" required value={form.name} onChange={set("name")} className="h-11" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="family_name">Last Name</Label>
            <Input id="family_name" placeholder="Ben Ali" required value={form.family_name} onChange={set("family_name")} className="h-11" />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@restaurant.com" autoComplete="email" required value={form.email} onChange={set("email")} className="h-11" />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={set("password")}
              className="h-11 pr-10"
            />
            <button type="button" onClick={() => setShowPw((p) => !p)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showCPw ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
              value={form.confirm}
              onChange={set("confirm")}
              className="h-11 pr-10"
            />
            <button type="button" onClick={() => setShowCPw((p) => !p)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Phone (optional) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">
            Phone <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="flex gap-2">
            <Select value={form.phone_code} onValueChange={(v) => setForm((p) => ({ ...p, phone_code: v ?? "+216" }))}>
              <SelectTrigger className="w-28 h-11 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHONE_CODES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phone"
              type="tel"
              placeholder="55 123 456"
              value={form.phone_number}
              onChange={set("phone_number")}
              className="h-11 flex-1"
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow mt-1"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="#" className="underline hover:text-foreground transition-colors">Terms</Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
        </p>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">Already have an account?</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link href="/login">
        <Button variant="outline" size="lg" className="w-full h-11 font-semibold">
          Sign In
        </Button>
      </Link>
    </div>
  );
}
