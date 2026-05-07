"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Trash2,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { AdminUser, AdminUserListResponse, UserRole } from "@/types";

const LIMIT = 25;

function RoleBadge({ role, labels }: { role: UserRole; labels: { admin: string; agent: string; user: string } }) {
  if (role === "admin")
    return <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 text-xs gap-1"><ShieldCheck className="w-3 h-3" />{labels.admin}</Badge>;
  if (role === "agent")
    return <Badge variant="outline" className="border-sky-400/40 text-sky-500 bg-sky-500/5 text-xs">{labels.agent}</Badge>;
  return <Badge variant="outline" className="text-xs text-muted-foreground">{labels.user}</Badge>;
}

export default function AdminUsersPage() {
  const t = useT({
    fr: {
      title: "Utilisateurs", refresh: "Actualiser",
      total_one: "utilisateur au total", total_many: "utilisateurs au total",
      search: "Rechercher par nom ou email…",
      all_roles: "Tous les rôles", role_user: "Utilisateur", role_admin: "Admin", role_agent: "Agent",
      all: "Tous", active: "Actif", inactive: "Inactif",
      clear_filters: "Effacer les filtres", no_users: "Aucun utilisateur trouvé",
      page: "Page", of: "sur", prev: "Préc.", next: "Suiv.", users_word: "utilisateurs",
      activate: "Activer", deactivate: "Désactiver", delete_user: "Supprimer l'utilisateur",
      view_profile: "Voir le profil", confirm_delete: "Supprimer définitivement cet utilisateur ? Cette action est irréversible.",
      activated: "Utilisateur activé.", deactivated: "Utilisateur désactivé.", deleted: "Utilisateur supprimé.", failed: "Échec.",
    },
    en: {
      title: "Users", refresh: "Refresh",
      total_one: "user total", total_many: "users total",
      search: "Search by name or email…",
      all_roles: "All Roles", role_user: "User", role_admin: "Admin", role_agent: "Agent",
      all: "All", active: "Active", inactive: "Inactive",
      clear_filters: "Clear filters", no_users: "No users found",
      page: "Page", of: "of", prev: "Prev", next: "Next", users_word: "users",
      activate: "Activate", deactivate: "Deactivate", delete_user: "Delete user",
      view_profile: "View profile", confirm_delete: "Permanently delete this user? This cannot be undone.",
      activated: "User activated.", deactivated: "User deactivated.", deleted: "User deleted.", failed: "Failed.",
    },
  });
  const ROLE_OPTIONS = [
    { value: "",        label: t.all_roles    },
    { value: "user",    label: t.role_user    },
    { value: "admin",   label: t.role_admin   },
    { value: "agent",   label: t.role_agent   },
  ];
  const ACTIVE_OPTIONS = [
    { value: "",      label: t.all      },
    { value: "true",  label: t.active   },
    { value: "false", label: t.inactive },
  ];
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRole]       = useState("");
  const [activeFilter, setActive]   = useState("");
  const [actionMsg, setActionMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [actioning, setActioning]   = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ skip: String(page * LIMIT), limit: String(LIMIT) });
      if (roleFilter)   p.set("role", roleFilter);
      if (activeFilter) p.set("is_active", activeFilter);
      const d = await api.get<AdminUserListResponse>(`/auth/admin/users?${p}`);
      setUsers(d.users ?? []);
      setTotal(d.total ?? 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, activeFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const displayed = search
    ? users.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.family_name.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  function flash(ok: boolean, text: string) {
    setActionMsg({ ok, text });
    setTimeout(() => setActionMsg(null), 3500);
  }

  async function activate(userId: string) {
    setActioning(userId + ":activate");
    try {
      await api.post(`/auth/admin/users/${userId}/activate`);
      flash(true, t.activated);
      fetchUsers();
    } catch (err: unknown) {
      flash(false, (err as { detail?: string }).detail ?? t.failed);
    } finally {
      setActioning(null);
    }
  }

  async function deactivate(userId: string) {
    setActioning(userId + ":deactivate");
    try {
      await api.post(`/auth/admin/users/${userId}/deactivate`);
      flash(true, t.deactivated);
      fetchUsers();
    } catch (err: unknown) {
      flash(false, (err as { detail?: string }).detail ?? t.failed);
    } finally {
      setActioning(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm(t.confirm_delete)) return;
    setActioning(userId + ":delete");
    try {
      await api.delete("/auth/admin/users/bulk-delete", { user_ids: [userId] });
      flash(true, t.deleted);
      fetchUsers();
    } catch (err: unknown) {
      flash(false, (err as { detail?: string }).detail ?? t.failed);
    } finally {
      setActioning(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || roleFilter || activeFilter);

  return (
    <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{total.toLocaleString()} {total !== 1 ? t.total_many : t.total_one}</p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            {t.refresh}
          </Button>
        </div>

        {actionMsg && (
          <div className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
            actionMsg.ok
              ? "border-primary/20 bg-primary/5 text-primary"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          )}>
            {actionMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            {actionMsg.text}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t.search}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRole(e.target.value); setPage(0); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={activeFilter}
            onChange={(e) => { setActive(e.target.value); setPage(0); }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            {ACTIVE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setRole(""); setActive(""); setPage(0); }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            {t.clear_filters}
          </button>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…
                  </td></tr>
                ) : displayed.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">{t.no_users}</td></tr>
                ) : displayed.map((u) => {
                  const isActioning = actioning?.startsWith(u.id);
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            src={u.avatar_url}
                            name={u.name}
                            familyName={u.family_name}
                            size={32}
                            className="ring-1 ring-primary/15"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{u.name} {u.family_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <RoleBadge role={u.role} labels={{ admin: t.role_admin, agent: t.role_agent, user: t.role_user }} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={cn(
                            "text-xs w-fit",
                            u.is_active
                              ? "border-primary/40 text-primary bg-primary/5"
                              : "border-destructive/30 text-destructive bg-destructive/5"
                          )}>
                            {u.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {!u.is_verified && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/5 w-fit">
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title={t.view_profile}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {u.is_active ? (
                            <button
                              onClick={() => deactivate(u.id)}
                              disabled={isActioning}
                              title={t.deactivate}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors disabled:opacity-40"
                            >
                              {actioning === u.id + ":deactivate"
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <UserX className="w-3.5 h-3.5" />
                              }
                            </button>
                          ) : (
                            <button
                              onClick={() => activate(u.id)}
                              disabled={isActioning}
                              title={t.activate}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                            >
                              {actioning === u.id + ":activate"
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <UserCheck className="w-3.5 h-3.5" />
                              }
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(u.id)}
                            disabled={isActioning}
                            title={t.delete_user}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                          >
                            {actioning === u.id + ":delete"
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{t.page} {page + 1} {t.of} {totalPages} — {total} {t.users_word}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)} className="gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> {t.prev}
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((p) => p + 1)} className="gap-1">
                {t.next} <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
