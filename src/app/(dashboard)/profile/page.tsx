"use client";

import { useEffect, useState, useRef } from "react";
import {
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const t = useT({
    fr: {
      title: "Mon profil", photo: "Photo de profil", change_photo: "Changer la photo", uploading: "Téléversement…", photo_help: "JPEG, PNG ou WebP · max 5 Mo",
      personal: "Informations personnelles", first_name: "Prénom", last_name: "Nom", email: "Email", email_locked: "L'email ne peut pas être modifié.",
      phone_code: "Indicatif", phone_num: "Téléphone", address: "Adresse", street: "Rue", city: "Ville", gouv: "Gouvernorat", zip: "Code postal",
      active: "Actif", inactive: "Inactif", verified: "Vérifié", saving: "Enregistrement…", save: "Enregistrer", profile_updated: "Profil mis à jour avec succès.",
      save_failed: "Échec de l'enregistrement du profil.", avatar_updated: "Avatar mis à jour.", avatar_failed: "Échec du téléversement de l'avatar.",
    },
    en: {
      title: "My Profile", photo: "Profile Photo", change_photo: "Change Photo", uploading: "Uploading…", photo_help: "JPEG, PNG or WebP · max 5 MB",
      personal: "Personal Information", first_name: "First Name", last_name: "Last Name", email: "Email", email_locked: "Email cannot be changed.",
      phone_code: "Phone Code", phone_num: "Phone Number", address: "Address", street: "Street", city: "City", gouv: "Gouvernorat", zip: "Zip Code",
      active: "Active", inactive: "Inactive", verified: "Verified", saving: "Saving…", save: "Save Changes", profile_updated: "Profile updated successfully.",
      save_failed: "Failed to save profile.", avatar_updated: "Avatar updated.", avatar_failed: "Avatar upload failed.",
    },
  });
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [name, setName]           = useState("");
  const [familyName, setFamily]   = useState("");
  const [phone, setPhone]         = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [rue, setRue]             = useState("");
  const [city, setCity]           = useState("");
  const [gouv, setGouv]           = useState("");
  const [zip, setZip]             = useState("");

  useEffect(() => {
    api.get<UserProfile>("/auth/me")
      .then((p) => {
        setProfile(p);
        setName(p.name ?? "");
        setFamily(p.family_name ?? "");
        setPhone(p.phone_number ?? "");
        setPhoneCode(p.phone_code ?? "");
        setRue(p.address?.rue ?? "");
        setCity(p.address?.city ?? "");
        setGouv(p.address?.gouvernorat ?? "");
        setZip(p.address?.zip_code ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const body: Record<string, unknown> = {
        name,
        family_name: familyName,
      };
      if (phone)     body.phone_number = phone;
      if (phoneCode) body.phone_code   = phoneCode;
      if (rue || city || gouv || zip) {
        body.address = { rue, city, gouvernorat: gouv, zip_code: zip };
      }
      const updated = await api.patch<UserProfile>("/profile", body);
      setProfile(updated);
      setSaveMsg({ ok: true, text: t.profile_updated });
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setSaveMsg({ ok: false, text: e.detail ?? t.save_failed });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<{ avatar_url: string }>("/profile/avatar", form);
      setProfile((prev) => prev ? { ...prev, avatar_url: res.avatar_url } : prev);
      setSaveMsg({ ok: true, text: t.avatar_updated });
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setSaveMsg({ ok: false, text: e.detail ?? t.avatar_failed });
    } finally {
      setUploading(false);
      setTimeout(() => setSaveMsg(null), 3000);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile
    ? `${profile.name?.[0] ?? ""}${profile.family_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-4.5 h-4.5 text-primary" style={{ width: "18px", height: "18px" }} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-bold text-sm">{t.photo}</h2>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-xl font-black text-primary border-2 border-border">
                {initials}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={uploadAvatar}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              {uploading ? t.uploading : t.change_photo}
            </Button>
            <p className="text-[10px] text-muted-foreground">{t.photo_help}</p>
          </div>
        </div>
      </div>

      {/* Status message */}
      {saveMsg && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
          saveMsg.ok
            ? "border-primary/20 bg-primary/5 text-primary"
            : "border-destructive/20 bg-destructive/5 text-destructive"
        )}>
          {saveMsg.ok
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />
          }
          {saveMsg.text}
        </div>
      )}

      {/* Profile form */}
      <form onSubmit={save} className="rounded-2xl border border-border bg-card p-5 space-y-5">
        <h2 className="font-bold text-sm">{t.personal}</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs">{t.first_name}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Yassine" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="family" className="text-xs">{t.last_name}</Label>
            <Input id="family" value={familyName} onChange={(e) => setFamily(e.target.value)} placeholder="Ben Ali" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">{t.email}</Label>
          <Input value={profile?.email ?? ""} disabled className="opacity-60" />
          <p className="text-[10px] text-muted-foreground">{t.email_locked}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone-code" className="text-xs">{t.phone_code}</Label>
            <Input id="phone-code" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} placeholder="+216" className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">{t.phone_num}</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="55123456" className="font-mono" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.address}</h3>
          <div className="space-y-1.5">
            <Label htmlFor="rue" className="text-xs">{t.street}</Label>
            <Input id="rue" value={rue} onChange={(e) => setRue(e.target.value)} placeholder="Rue de la paix" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs">{t.city}</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Tunis" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gouv" className="text-xs">{t.gouv}</Label>
              <Input id="gouv" value={gouv} onChange={(e) => setGouv(e.target.value)} placeholder="Tunis" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip" className="text-xs">{t.zip}</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="1000" className="font-mono" />
            </div>
          </div>
        </div>

        {/* Role / status badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className={cn(
            "text-[10px] font-semibold px-2 py-1 rounded-full border",
            profile?.role === "admin"
              ? "border-primary/40 text-primary bg-primary/5"
              : "border-border text-muted-foreground"
          )}>
            {profile?.role ?? "user"}
          </span>
          <span className={cn(
            "text-[10px] font-semibold px-2 py-1 rounded-full border",
            profile?.is_active
              ? "border-primary/40 text-primary bg-primary/5"
              : "border-destructive/40 text-destructive bg-destructive/5"
          )}>
            {profile?.is_active ? t.active : t.inactive}
          </span>
          {profile?.is_verified && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-primary/40 text-primary bg-primary/5">
              {t.verified}
            </span>
          )}
        </div>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto gap-1.5 press-scale">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t.saving : t.save}
        </Button>
      </form>
    </div>
  );
}
