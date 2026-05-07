"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  IdCard, Building2, Activity, ClipboardCheck,
  ChevronRight, Loader2, CheckCircle2, ArrowRight, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/ui/Logo";
import { FileUpload } from "@/components/ui/file-upload";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";

// ── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { value: "personne_physique",  label: "Personne physique" },
  { value: "auto_entrepreneur",  label: "Auto-entrepreneur" },
  { value: "sarl",               label: "SARL" },
  { value: "suarl",              label: "SUARL" },
  { value: "sa",                 label: "SA" },
];

const PLATFORMS = ["Glovo", "Jahez", "Bolt Food", "Deliveroo", "Yassir Express", "Other"];

const REVENUE_BRACKETS = [
  "Less than 500€/month",
  "500 – 2 000€/month",
  "2 000 – 10 000€/month",
  "More than 10 000€/month",
];

const LOSS_BRACKETS = [
  "Less than 200€/month",
  "200 – 500€/month",
  "500 – 1 000€/month",
  "1 000 – 2 000€/month",
  "More than 2 000€/month",
];

const REFUND_HANDLING = [
  { value: "yes",        label: "Yes, I handle disputes myself" },
  { value: "no",         label: "No one handles them today" },
  { value: "outsourced", label: "Outsourced to an agency" },
];

const SIGNER_ROLES = [
  { value: "owner",      label: "Owner / CEO" },
  { value: "manager",    label: "Manager" },
  { value: "accountant", label: "Accountant" },
  { value: "other",      label: "Other (prestataire)" },
];

const CONTACT_METHODS = [
  { value: "phone",    label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email",    label: "Email" },
];

const REFERRAL_OPTIONS = [
  "Word of mouth / friend", "Social media", "Google search",
  "Uber Eats community", "Email / newsletter", "Other",
];

const NATIONALITIES = ["Tunisian", "French", "Algerian", "Moroccan", "Italian", "Spanish", "Other"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function OptionPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150 text-left",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {selected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
      {label}
    </button>
  );
}

function StepCard({
  step, total, icon: Icon, title, subtitle, children,
}: {
  step: number; total: number; icon: React.ElementType;
  title: string; subtitle: string; children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Step {step} of {total}
          </p>
          <h2 className="text-lg font-black tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Main wizard ──────────────────────────────────────────────────────────────

type FormState = {
  // KYB Identity (signer)
  signer_role: string;
  cin_or_passport: string;
  date_of_birth: string;
  nationality: string;
  id_document_url: string | null;
  business_proof_url: string | null;

  // Business
  legal_entity_name: string;
  business_type: string;
  tax_id: string;
  rne_number: string;
  years_in_business: string;
  business_address_same_as_personal: "yes" | "no" | "";
  business_address_rue: string;
  business_address_city: string;
  business_address_gouvernorat: string;
  business_address_zip_code: string;

  // Banking
  bank_name: string;
  rib_iban: string;
  bank_account_holder: string;
  bank_statement_url: string | null;

  // Operations
  store_count: string;
  other_platforms: string[];
  monthly_uber_revenue: string;
  monthly_loss_estimate: string;
  refund_handling_today: string;

  // Preferences
  preferred_call_time: string;
  preferred_contact_method: string;
  referral_source: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  signer_role: "", cin_or_passport: "", date_of_birth: "", nationality: "",
  id_document_url: null, business_proof_url: null,
  legal_entity_name: "", business_type: "", tax_id: "", rne_number: "",
  years_in_business: "", business_address_same_as_personal: "",
  business_address_rue: "", business_address_city: "",
  business_address_gouvernorat: "", business_address_zip_code: "",
  bank_name: "", rib_iban: "", bank_account_holder: "",
  bank_statement_url: null,
  store_count: "", other_platforms: [], monthly_uber_revenue: "",
  monthly_loss_estimate: "", refund_handling_today: "",
  preferred_call_time: "", preferred_contact_method: "", referral_source: "", notes: "",
};

export default function OnboardingFormPage() {
  const router = useRouter();
  const t = useT({
    fr: {
      step_of: "Étape",
      step_of_of: "sur",
      welcome: "Bienvenue chez SmartKitchen 👋",
      welcome_lead: "Nous avons besoin de quelques détails sur vous et votre entreprise pour activer votre compte.",
      back: "← Retour",
      next: "Suivant",
      submit: "Envoyer la candidature",
      generic_error: "Une erreur est survenue. Veuillez réessayer.",
      // Step 1
      s1_title: "Qui êtes-vous ?",
      s1_sub: "Dites-nous qui s'inscrit — et téléchargez vos documents d'identité.",
      role: "Votre rôle dans l'entreprise",
      cin_pp: "CIN / Passeport",
      dob: "Date de naissance",
      nationality: "Nationalité",
      select_nat: "Sélectionner la nationalité",
      both_kyc: "Les deux documents KYC sont obligatoires pour activer votre compte.",
      id_label: "Pièce d'identité (CIN recto+verso ou passeport)",
      id_hint: "Téléchargez un scan ou photo lisible. JPG, PNG, WebP ou PDF.",
      bproof_label: "Justificatif de propriété d'entreprise",
      bproof_hint: "Patente, extrait RNE ou registre commercial.",
      // Step 2
      s2_title: "Votre entreprise",
      s2_sub: "Informations légales nécessaires pour facturer et procéder au remboursement.",
      legal_name: "Raison sociale",
      btype: "Type d'entreprise",
      tax_id: "Identifiant fiscal / Matricule fiscal",
      rne: "RNE / Registre du commerce",
      years: "Années d'activité",
      // Step 3
      s3_title: "Vos opérations de livraison",
      s3_sub: "Pour comprendre le volume et ce que nous pouvons récupérer.",
      stores_count: "Combien de restaurants sur Uber Eats ?",
      other_platforms: "Autres plateformes de livraison utilisées",
      multi_select: "Multi-sélection — laissez vide si Uber Eats uniquement.",
      monthly_rev: "Revenu mensuel moyen sur Uber",
      monthly_loss: "Pertes mensuelles estimées (annulées / contestées)",
      who_handles: "Qui gère les disputes de remboursement aujourd'hui ?",
      // Step 4
      s4_title: "Touches finales",
      s4_sub: "Comment nous joindre, puis vérifier et envoyer.",
      preferred_call: "Quand souhaitez-vous notre appel d'inscription ?",
      contact_method: "Méthode de contact préférée",
      heard_about: "Comment avez-vous entendu parler de nous ?",
      anything_else: "Autre chose ?",
      anything_ph: "Optionnel — questions ou notes pour notre équipe…",
      summary: "Résumé",
      sum_role: "Rôle",
      sum_legal: "Raison sociale",
      sum_btype: "Type d'entreprise",
      sum_tax: "Matricule fiscal",
      sum_stores: "Restaurants",
      sum_rev: "Revenu mensuel",
      sum_loss: "Pertes mensuelles",
      sum_contact: "Contact",
    },
    en: {
      step_of: "Step",
      step_of_of: "of",
      welcome: "Welcome to SmartKitchen 👋",
      welcome_lead: "We need a few details about you and your business to onboard your account.",
      back: "← Back",
      next: "Next",
      submit: "Submit application",
      generic_error: "Something went wrong. Please try again.",
      s1_title: "Who are you?",
      s1_sub: "Tell us who's signing up — and upload your KYC documents.",
      role: "Your role at the company",
      cin_pp: "CIN / Passport",
      dob: "Date of birth",
      nationality: "Nationality",
      select_nat: "Select nationality",
      both_kyc: "Both KYC documents are required to activate your account.",
      id_label: "ID document (CIN front+back or passport)",
      id_hint: "Upload a clear scan or photo. JPG, PNG, WebP or PDF.",
      bproof_label: "Proof of business ownership",
      bproof_hint: "Patente, RNE extract, or commercial register document.",
      s2_title: "About your business",
      s2_sub: "Legal details we need to invoice and reimburse you correctly.",
      legal_name: "Legal entity name (raison sociale)",
      btype: "Business type",
      tax_id: "Tax ID / Matricule fiscal",
      rne: "RNE / Trade register",
      years: "Years in business",
      s3_title: "Your delivery operations",
      s3_sub: "Helps us understand the volume and what we can recover.",
      stores_count: "How many stores on Uber Eats?",
      other_platforms: "Other delivery platforms you use",
      multi_select: "Multi-select — leave empty if Uber Eats only.",
      monthly_rev: "Average monthly Uber revenue",
      monthly_loss: "Estimated monthly losses (cancelled / contested)",
      who_handles: "Who handles refund disputes today?",
      s4_title: "Final touches",
      s4_sub: "Tell us how to reach you, then review and submit.",
      preferred_call: "When would you like our onboarding call?",
      contact_method: "Preferred contact method",
      heard_about: "How did you hear about us?",
      anything_else: "Anything else?",
      anything_ph: "Optional — questions or notes for our team…",
      summary: "Summary",
      sum_role: "Role",
      sum_legal: "Legal entity",
      sum_btype: "Business type",
      sum_tax: "Tax ID",
      sum_stores: "Stores",
      sum_rev: "Monthly revenue",
      sum_loss: "Monthly losses",
      sum_contact: "Contact",
    },
  });

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [f, setF]             = useState<FormState>(EMPTY_FORM);

  const TOTAL_STEPS = 4;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  // ── Validation per step ──
  function canNext(): boolean {
    if (step === 1) {
      return !!f.signer_role && !!f.cin_or_passport && !!f.date_of_birth
        && !!f.nationality && !!f.id_document_url && !!f.business_proof_url;
    }
    if (step === 2) {
      return !!f.legal_entity_name && !!f.business_type && !!f.tax_id
        && !!f.rne_number && !!f.years_in_business;
    }
    if (step === 3) {
      return !!f.store_count && !!f.monthly_uber_revenue && !!f.monthly_loss_estimate
        && !!f.refund_handling_today;
    }
    return !!f.preferred_call_time && !!f.preferred_contact_method;
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await api.post("/onboarding/form", buildPayload(f));
      router.push("/onboarding/pending");
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e.detail ?? t.generic_error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-6 py-4 flex items-center gap-3">
        <Logo width={28} height={28} className="rounded-lg overflow-hidden" />
        <span className="font-extrabold text-sm tracking-tight">
          Smart<span className="text-primary">Kitchen</span>
        </span>
        <span className="text-muted-foreground text-xs ml-auto">
          {t.step_of} {step} {t.step_of_of} {TOTAL_STEPS}
        </span>
      </div>

      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl space-y-8">

          {step === 1 && (
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black tracking-tight">{t.welcome}</h1>
              <p className="text-muted-foreground">{t.welcome_lead}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
            </div>
          )}

          {/* ── STEP 1 — Identity (KYC of signer) ── */}
          {step === 1 && (
            <StepCard step={1} total={TOTAL_STEPS} icon={IdCard}
              title={t.s1_title}
              subtitle={t.s1_sub}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-semibold">{t.role} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {SIGNER_ROLES.map((o) => (
                      <OptionPill key={o.value} label={o.label} selected={f.signer_role === o.value} onClick={() => set("signer_role", o.value)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="font-semibold">{t.cin_pp} *</Label>
                    <Input value={f.cin_or_passport} onChange={(e) => set("cin_or_passport", e.target.value)} placeholder="01234567" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">{t.dob} *</Label>
                    <Input type="date" value={f.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.nationality} *</Label>
                  <Select value={f.nationality} onValueChange={(v) => set("nationality", v ?? "")}>
                    <SelectTrigger><SelectValue placeholder={t.select_nat} /></SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {t.both_kyc}
                  </p>
                  <FileUpload
                    kind="id_document"
                    label={t.id_label}
                    hint={t.id_hint}
                    value={f.id_document_url}
                    onChange={(url) => set("id_document_url", url)}
                    required
                  />
                  <FileUpload
                    kind="business_proof"
                    label={t.bproof_label}
                    hint={t.bproof_hint}
                    value={f.business_proof_url}
                    onChange={(url) => set("business_proof_url", url)}
                    required
                  />
                </div>
              </div>
            </StepCard>
          )}

          {/* ── STEP 2 — Business ── */}
          {step === 2 && (
            <StepCard step={2} total={TOTAL_STEPS} icon={Building2}
              title={t.s2_title}
              subtitle={t.s2_sub}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-semibold">{t.legal_name} *</Label>
                  <Input value={f.legal_entity_name} onChange={(e) => set("legal_entity_name", e.target.value)} placeholder="SARL Restaurant XYZ" />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.btype} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_TYPES.map((b) => (
                      <OptionPill key={b.value} label={b.label} selected={f.business_type === b.value} onClick={() => set("business_type", b.value)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="font-semibold">{t.tax_id} *</Label>
                    <Input value={f.tax_id} onChange={(e) => set("tax_id", e.target.value)} placeholder="1234567A/M/000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">{t.rne} *</Label>
                    <Input value={f.rne_number} onChange={(e) => set("rne_number", e.target.value)} placeholder="B01234562020" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.years} *</Label>
                  <Input type="number" min={0} className="max-w-40"
                    value={f.years_in_business} onChange={(e) => set("years_in_business", e.target.value)} placeholder="3" />
                </div>
              </div>
            </StepCard>
          )}

          {/* ── STEP 3 — Operations ── */}
          {step === 3 && (
            <StepCard step={3} total={TOTAL_STEPS} icon={Activity}
              title={t.s3_title}
              subtitle={t.s3_sub}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-semibold">{t.stores_count} *</Label>
                  <Input type="number" min={1} className="max-w-40"
                    value={f.store_count} onChange={(e) => set("store_count", e.target.value)} placeholder="3" />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.other_platforms}</Label>
                  <p className="text-xs text-muted-foreground">{t.multi_select}</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => {
                      const sel = f.other_platforms.includes(p);
                      return (
                        <OptionPill key={p} label={p} selected={sel}
                          onClick={() => set("other_platforms", sel
                            ? f.other_platforms.filter(x => x !== p)
                            : [...f.other_platforms, p])}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.monthly_rev} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {REVENUE_BRACKETS.map((b) => (
                      <OptionPill key={b} label={b} selected={f.monthly_uber_revenue === b} onClick={() => set("monthly_uber_revenue", b)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.monthly_loss} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {LOSS_BRACKETS.map((b) => (
                      <OptionPill key={b} label={b} selected={f.monthly_loss_estimate === b} onClick={() => set("monthly_loss_estimate", b)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.who_handles} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {REFUND_HANDLING.map((o) => (
                      <OptionPill key={o.value} label={o.label} selected={f.refund_handling_today === o.value} onClick={() => set("refund_handling_today", o.value)} />
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {/* ── STEP 4 — Preferences + Review ── */}
          {step === 4 && (
            <StepCard step={4} total={TOTAL_STEPS} icon={ClipboardCheck}
              title={t.s4_title}
              subtitle={t.s4_sub}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-semibold">{t.preferred_call} *</Label>
                  <Input type="datetime-local" className="max-w-xs"
                    value={f.preferred_call_time} onChange={(e) => set("preferred_call_time", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.contact_method} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_METHODS.map((c) => (
                      <OptionPill key={c.value} label={c.label} selected={f.preferred_contact_method === c.value} onClick={() => set("preferred_contact_method", c.value)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.heard_about}</Label>
                  <div className="flex flex-wrap gap-2">
                    {REFERRAL_OPTIONS.map((o) => (
                      <OptionPill key={o} label={o} selected={f.referral_source === o} onClick={() => set("referral_source", o)} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t.anything_else}</Label>
                  <textarea
                    value={f.notes} onChange={(e) => set("notes", e.target.value)}
                    rows={3}
                    placeholder={t.anything_ph}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                {/* Review */}
                <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                  <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">{t.summary}</p>
                  {[
                    [t.sum_role, SIGNER_ROLES.find((r) => r.value === f.signer_role)?.label],
                    [t.sum_legal, f.legal_entity_name],
                    [t.sum_btype, BUSINESS_TYPES.find((b) => b.value === f.business_type)?.label],
                    [t.sum_tax, f.tax_id],
                    [t.sum_stores, f.store_count],
                    [t.sum_rev, f.monthly_uber_revenue],
                    [t.sum_loss, f.monthly_loss_estimate],
                    [t.sum_contact, CONTACT_METHODS.find((c) => c.value === f.preferred_contact_method)?.label],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-right">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StepCard>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.back}
              </button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="gap-2 press-scale">
                {t.next} <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !canNext()} className="gap-2 press-scale">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {t.submit}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payload mapping (camelCase form state → snake_case API) ──────────────────

function buildPayload(f: FormState) {
  return {
    signer_role: f.signer_role,
    cin_or_passport: f.cin_or_passport,
    date_of_birth: f.date_of_birth,
    nationality: f.nationality,
    id_document_url: f.id_document_url,
    business_proof_url: f.business_proof_url,

    legal_entity_name: f.legal_entity_name,
    business_type: f.business_type,
    tax_id: f.tax_id,
    rne_number: f.rne_number,
    years_in_business: f.years_in_business ? parseInt(f.years_in_business, 10) : null,
    business_address_same_as_personal: f.business_address_same_as_personal || null,
    business_address_rue: f.business_address_same_as_personal === "no" ? f.business_address_rue : null,
    business_address_city: f.business_address_same_as_personal === "no" ? f.business_address_city : null,
    business_address_gouvernorat: f.business_address_same_as_personal === "no" ? f.business_address_gouvernorat : null,
    business_address_zip_code: f.business_address_same_as_personal === "no" ? f.business_address_zip_code : null,

    store_count: f.store_count ? parseInt(f.store_count, 10) : null,
    other_platforms: f.other_platforms,
    monthly_uber_revenue: f.monthly_uber_revenue,
    monthly_loss_estimate: f.monthly_loss_estimate,
    refund_handling_today: f.refund_handling_today,

    preferred_call_time: f.preferred_call_time,
    preferred_contact_method: f.preferred_contact_method,
    referral_source: f.referral_source || null,
    notes: f.notes || null,
  };
}
