"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useT } from "@/i18n/provider";

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
  name: string; family_name: string;
  email: string; password: string; confirm: string;
  phone_number: string; phone_code: string;
  rue: string; city: string; gouvernorat: string; zip_code: string;
};

export default function RegisterPage() {
  const t = useT({
    fr: {
      check_email: "Vérifiez votre email",
      sent_link_to: "Nous avons envoyé un lien de vérification à",
      click_to_activate: "Cliquez dessus pour activer votre compte.",
      check_inbox: "Vérifiez votre boîte de réception (et les spams)",
      click_link: "Cliquez sur le lien de vérification",
      return_signin: "Revenez ici pour vous connecter",
      back_to_signin: "Retour à la connexion",
      create_account: "Créer un compte",
      lead: "Commencez à récupérer vos remboursements Uber Eats dès aujourd'hui",
      identity: "Identité",
      first_name: "Prénom",
      last_name: "Nom",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      street: "Rue",
      city: "Ville",
      zip: "Code postal",
      gouvernorat: "Gouvernorat / Région",
      security: "Sécurité",
      password: "Mot de passe",
      confirm_password: "Confirmer le mot de passe",
      min_chars: "Min. 8 caractères",
      repeat_pw: "Répétez votre mot de passe",
      terms_consent_a: "J'ai lu et j'accepte les",
      terms_consent_terms: "Conditions générales",
      terms_consent_and: "et la",
      terms_consent_privacy: "Politique de confidentialité",
      creating: "Création du compte…",
      submit: "Créer le compte",
      err_pw_mismatch: "Les mots de passe ne correspondent pas.",
      err_pw_short: "Le mot de passe doit contenir au moins 8 caractères.",
      err_terms: "Vous devez accepter les Conditions générales et la Politique de confidentialité.",
      err_email_taken: "Un compte avec cet email existe déjà.",
      err_generic: "Une erreur est survenue. Veuillez réessayer.",
    },
    en: {
      check_email: "Check your email",
      sent_link_to: "We sent a verification link to",
      click_to_activate: "Click it to activate your account.",
      check_inbox: "Check your inbox (and spam folder)",
      click_link: "Click the verification link",
      return_signin: "Return here to sign in",
      back_to_signin: "Back to Sign In",
      create_account: "Create account",
      lead: "Start recovering your Uber Eats refunds today",
      identity: "Identity",
      first_name: "First Name",
      last_name: "Last Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      street: "Street",
      city: "City",
      zip: "ZIP",
      gouvernorat: "Gouvernorat / Region",
      security: "Security",
      password: "Password",
      confirm_password: "Confirm Password",
      min_chars: "Min. 8 characters",
      repeat_pw: "Repeat your password",
      terms_consent_a: "I have read and agree to the",
      terms_consent_terms: "Terms of Service",
      terms_consent_and: "and the",
      terms_consent_privacy: "Privacy Policy",
      creating: "Creating account…",
      submit: "Create Account",
      err_pw_mismatch: "Passwords do not match.",
      err_pw_short: "Password must be at least 8 characters.",
      err_terms: "You must agree to the Terms of Service and Privacy Policy.",
      err_email_taken: "An account with this email already exists.",
      err_generic: "Something went wrong. Please try again.",
    },
  });

  const [form, setForm] = useState<Form>({
    name: "", family_name: "", email: "",
    password: "", confirm: "",
    phone_number: "", phone_code: "+216",
    rue: "", city: "", gouvernorat: "", zip_code: "",
  });
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) { setError(t.err_pw_mismatch); return; }
    if (form.password.length < 8)       { setError(t.err_pw_short); return; }
    if (!acceptTerms)                   { setError(t.err_terms); return; }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        family_name: form.family_name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number,
        phone_code: form.phone_code,
        address: {
          rue: form.rue,
          city: form.city,
          gouvernorat: form.gouvernorat,
          zip_code: form.zip_code,
        },
        role: "user",
      }, { skipAuth: true });
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 400) setError(t.err_email_taken);
      else setError(t.err_generic);
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-2">{t.check_email}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            {t.sent_link_to} <strong className="text-foreground">{form.email}</strong>. {t.click_to_activate}
          </p>
        </div>
        <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-left space-y-2">
          {[t.check_inbox, t.click_link, t.return_signin].map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{s}
            </div>
          ))}
        </div>
        <Link href="/login" className="w-full">
          <Button variant="outline" size="lg" className="w-full font-semibold">{t.back_to_signin}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">{t.create_account}</h1>
        <p className="text-muted-foreground text-sm">{t.lead}</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in-up">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Identity ── */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.identity}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t.first_name} *</Label>
              <Input id="name" placeholder="Yassine" required value={form.name} onChange={set("name")} className="h-11" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="family_name">{t.last_name} *</Label>
              <Input id="family_name" placeholder="Ben Ali" required value={form.family_name} onChange={set("family_name")} className="h-11" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t.email} *</Label>
            <Input id="email" type="email" placeholder="you@restaurant.com" autoComplete="email" required value={form.email} onChange={set("email")} className="h-11" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t.phone} *</Label>
            <div className="flex gap-2">
              <Select value={form.phone_code} onValueChange={(v) => setForm((p) => ({ ...p, phone_code: v ?? "+216" }))}>
                <SelectTrigger className="w-28 h-11 shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PHONE_CODES.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input id="phone" type="tel" required placeholder="55 123 456" value={form.phone_number} onChange={set("phone_number")} className="h-11 flex-1" />
            </div>
          </div>
        </div>

        {/* ── Address ── */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.address}</p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rue">{t.street} *</Label>
            <Input id="rue" required placeholder="12 rue de Marseille" value={form.rue} onChange={set("rue")} className="h-11" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">{t.city} *</Label>
              <Input id="city" required placeholder="Tunis" value={form.city} onChange={set("city")} className="h-11" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zip_code">{t.zip} *</Label>
              <Input id="zip_code" required placeholder="1002" value={form.zip_code} onChange={set("zip_code")} className="h-11" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="gouvernorat">{t.gouvernorat} *</Label>
            <Input id="gouvernorat" required placeholder="Tunis" value={form.gouvernorat} onChange={set("gouvernorat")} className="h-11" />
          </div>
        </div>

        {/* ── Password ── */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.security}</p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t.password} *</Label>
            <div className="relative">
              <Input id="password" type={showPw ? "text" : "password"} placeholder={t.min_chars} autoComplete="new-password" required value={form.password} onChange={set("password")} className="h-11 pr-10" />
              <button type="button" onClick={() => setShowPw((p) => !p)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">{t.confirm_password} *</Label>
            <div className="relative">
              <Input id="confirm" type={showCPw ? "text" : "password"} placeholder={t.repeat_pw} autoComplete="new-password" required value={form.confirm} onChange={set("confirm")} className="h-11 pr-10" />
              <button type="button" onClick={() => setShowCPw((p) => !p)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Terms consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-border accent-primary cursor-pointer shrink-0"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            {t.terms_consent_a}{" "}
            <Link href="/legal/terms" target="_blank" className="text-primary font-medium hover:underline">{t.terms_consent_terms}</Link>
            {" "}{t.terms_consent_and}{" "}
            <Link href="/legal/privacy" target="_blank" className="text-primary font-medium hover:underline">{t.terms_consent_privacy}</Link>.
          </span>
        </label>

        <Button
          type="submit" size="lg"
          disabled={loading || !acceptTerms}
          className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow mt-1 press-scale"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.creating}</> : t.submit}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">Already have an account?</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link href="/login">
        <Button variant="outline" size="lg" className="w-full h-11 font-semibold">Sign In</Button>
      </Link>
    </div>
  );
}
