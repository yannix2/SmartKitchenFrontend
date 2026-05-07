"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Store,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Phone,
  MapPin,
  Mail,
  UserX,
  UserCheck,
  KeyRound,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface StoreEntry {
  id: number;
  store_id: string;
  store_name: string;
  status: string;
  linked_at: string;
}

interface UserDetail {
  id: string;
  name: string;
  family_name: string;
  email: string;
  phone_number: string | null;
  phone_code: string | null;
  avatar_url: string | null;
  abonnement_id: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  address: { rue: string | null; city: string | null; gouvernorat: string | null; zip_code: string | null } | null;
  created_at: string;
  updated_at: string;
  stores: StoreEntry[];
}

function Avatar({ user }: { user: UserDetail }) {
  const initials = `${user.name?.[0] ?? ""}${user.family_name?.[0] ?? ""}`.toUpperCase();
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={`${user.name} ${user.family_name}`}
        className="w-20 h-20 rounded-2xl object-cover border border-border"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-border">
      <span className="text-2xl font-black text-primary">{initials || "?"}</span>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "admin")
    return <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 text-xs gap-1"><ShieldCheck className="w-3 h-3" />Admin</Badge>;
  if (role === "agent")
    return <Badge variant="outline" className="border-sky-400/40 text-sky-500 bg-sky-500/5 text-xs">Agent</Badge>;
  return <Badge variant="outline" className="text-xs text-muted-foreground">User</Badge>;
}

function StoreStatusBadge({ status }: { status: string }) {
  if (status === "verified")
    return <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs"><CheckCircle2 className="w-3 h-3" />Verified</Badge>;
  return <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-500/30 bg-amber-500/5"><Clock className="w-3 h-3" />Pending</Badge>;
}

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router     = useRouter();
  const [user, setUser]       = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [msg, setMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  // Support actions
  const [newPassword, setNewPassword]   = useState("");
  const [pwSaving, setPwSaving]         = useState(false);
  const [subSaving, setSubSaving]       = useState(false);

  useEffect(() => {
    api.get<UserDetail>(`/auth/admin/users/${userId}`)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [userId]);

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 3500);
  }

  async function toggleActive() {
    if (!user) return;
    setActioning(true);
    try {
      const endpoint = user.is_active
        ? `/auth/admin/users/${userId}/deactivate`
        : `/auth/admin/users/${userId}/activate`;
      await api.post(endpoint);
      setUser((u) => u ? { ...u, is_active: !u.is_active } : u);
      flash(true, user.is_active ? "User deactivated." : "User activated.");
    } catch (err: unknown) {
      flash(false, (err as { detail?: string }).detail ?? "Action failed.");
    } finally {
      setActioning(false);
    }
  }

  async function setPassword() {
    if (newPassword.length < 8) {
      flash(false, "Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    try {
      await api.post(`/auth/admin/users/${userId}/set-password`, { new_password: newPassword });
      setNewPassword("");
      flash(true, "Password updated. Share it with the user securely.");
    } catch (err: unknown) {
      flash(false, (err as { detail?: string }).detail ?? "Password update failed.");
    } finally {
      setPwSaving(false);
    }
  }

  async function activateSubscription() {
    if (!user) return;
    setSubSaving(true);
    try {
      const r = await api.post<{ message: string }>(`/billing/admin/activate/${userId}`);
      setUser((u) => u ? { ...u, abonnement_id: u.abonnement_id ?? "active" } : u);
      flash(true, r?.message ?? "Subscription activated.");
    } catch (err: unknown) {
      flash(false, (err as { detail?: string }).detail ?? "Subscription activation failed.");
    } finally {
      setSubSaving(false);
    }
  }

  async function deactivateSubscription() {
    if (!user) return;
    if (!window.confirm("Cancel this user's subscription?")) return;
    setSubSaving(true);
    try {
      await api.post(`/billing/admin/deactivate/${userId}`);
      setUser((u) => u ? { ...u, abonnement_id: null } : u);
      flash(true, "Subscription cancelled.");
    } catch (err: unknown) {
      flash(false, (err as { detail?: string }).detail ?? "Subscription cancellation failed.");
    } finally {
      setSubSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !user ? (
          <div className="text-center py-24 text-muted-foreground">User not found.</div>
        ) : (
          <>
            {msg && (
              <div className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
                msg.ok ? "border-primary/20 bg-primary/5 text-primary" : "border-destructive/20 bg-destructive/5 text-destructive"
              )}>
                {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : null}
                {msg.text}
              </div>
            )}

            {/* Profile card */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <Avatar user={user} />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight">{user.name} {user.family_name}</h1>
                    <RoleBadge role={user.role} />
                    <Badge variant="outline" className={cn("text-xs", user.is_active ? "border-primary/40 text-primary bg-primary/5" : "border-destructive/30 text-destructive bg-destructive/5")}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {!user.is_verified && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/5">Unverified</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{user.phone_code} {user.phone_number}</span>
                      </div>
                    )}
                    {(user.address?.city || user.address?.gouvernorat) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{[user.address.rue, user.address.city, user.address.gouvernorat, user.address.zip_code].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleActive}
                  disabled={actioning}
                  className={cn("gap-1.5 shrink-0", user.is_active ? "text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5" : "")}
                >
                  {actioning
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : user.is_active
                      ? <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                      : <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                  }
                </Button>
              </div>
            </div>

            {/* Abonnement */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-500" />
                  <h2 className="font-bold text-sm">Abonnement</h2>
                </div>
                <div className="flex items-center gap-2">
                  {user.abonnement_id ? (
                    <Button
                      size="sm" variant="outline"
                      onClick={deactivateSubscription}
                      disabled={subSaving}
                      className="text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                    >
                      {subSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                      Deactivate subscription
                    </Button>
                  ) : (
                    <Button
                      size="sm" variant="outline"
                      onClick={activateSubscription}
                      disabled={subSaving}
                      className="text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      {subSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                      Activate subscription
                    </Button>
                  )}
                </div>
              </div>
              {user.abonnement_id ? (
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5 text-xs">
                    <CheckCircle2 className="w-3 h-3" /> Active subscription
                  </Badge>
                  <code className="text-xs text-muted-foreground font-mono">{user.abonnement_id}</code>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription.</p>
              )}
            </div>

            {/* Reset password — support action */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-sm">Set new password</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this when a user can't reset their password themselves. Share the new password with them via a secure channel.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min. 8 chars)"
                  className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
                <Button
                  size="sm"
                  onClick={setPassword}
                  disabled={pwSaving || newPassword.length < 8}
                  className="gap-1.5"
                >
                  {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Update password
                </Button>
              </div>
            </div>

            {/* Stores */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-sky-500" />
                <h2 className="font-bold text-sm">Linked Stores</h2>
                <span className="text-xs text-muted-foreground ml-auto">{user.stores.length} store{user.stores.length !== 1 ? "s" : ""}</span>
              </div>

              {user.stores.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stores linked to this account.</p>
              ) : (
                <div className="space-y-2">
                  {user.stores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{s.store_name || "—"}</p>
                        <code className="text-[10px] text-muted-foreground font-mono">{s.store_id}</code>
                      </div>
                      <div className="flex items-center gap-3">
                        <StoreStatusBadge status={s.status} />
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          {s.linked_at ? new Date(s.linked_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}
