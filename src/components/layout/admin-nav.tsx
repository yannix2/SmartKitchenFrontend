"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  CreditCard,
  Users,
  RefreshCcw,
  LogOut,
  Wallet,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useT } from "@/i18n/provider";
import { clearTokens } from "@/lib/cookies";
import { api } from "@/lib/api";
import type { UserProfile } from "@/types";

type AdminNavKey = "overview" | "stores" | "orders" | "refunds" | "wallet" | "users" | "billing" | "crm" | "sync";

const NAV: Array<{ key: AdminNavKey; href: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", href: "/admin",         icon: LayoutDashboard },
  { key: "stores",   href: "/admin/stores",  icon: Store           },
  { key: "orders",   href: "/admin/orders",  icon: ShoppingBag     },
  { key: "refunds",  href: "/admin/refunds", icon: CreditCard      },
  { key: "wallet",   href: "/admin/wallet",  icon: Wallet          },
  { key: "users",    href: "/admin/users",   icon: Users           },
  { key: "billing",  href: "/admin/billing", icon: CreditCard      },
  { key: "crm",      href: "/crm",           icon: PhoneCall       },
  { key: "sync",     href: "/admin/sync",    icon: RefreshCcw      },
];

export function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const t = useT({
    fr: {
      admin: "Admin",
      logout: "Déconnexion",
      view_profile: "Voir le profil",
      n_overview: "Tableau de bord",
      n_stores:   "Restaurants",
      n_orders:   "Commandes",
      n_refunds:  "Remboursements",
      n_wallet:   "Portefeuille",
      n_users:    "Utilisateurs",
      n_billing:  "Facturation",
      n_crm:      "CRM",
      n_sync:     "Sync",
    },
    en: {
      admin: "Admin",
      logout: "Logout",
      view_profile: "View profile",
      n_overview: "Overview",
      n_stores:   "Stores",
      n_orders:   "Orders",
      n_refunds:  "Refunds",
      n_wallet:   "Wallet",
      n_users:    "Users",
      n_billing:  "Billing",
      n_crm:      "CRM",
      n_sync:     "Sync",
    },
  });
  const labelFor = (k: AdminNavKey) => ({
    overview: t.n_overview, stores: t.n_stores, orders: t.n_orders, refunds: t.n_refunds,
    wallet: t.n_wallet, users: t.n_users, billing: t.n_billing, crm: t.n_crm, sync: t.n_sync,
  }[k]);

  useEffect(() => {
    api.get<UserProfile>("/auth/me").then(setProfile).catch(() => {});
  }, []);

  const initials = profile
    ? `${profile.name?.[0] ?? ""}${profile.family_name?.[0] ?? ""}`.toUpperCase()
    : "A";

  function logout() {
    clearTokens();
    router.push("/login");
  }

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);
  }

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <Logo width={28} height={28} className="rounded-md overflow-hidden shrink-0" />
          <span className="font-extrabold text-sm sm:text-base tracking-tight truncate">
            Smart<span className="text-primary">Kitchen</span>
          </span>
          <span className="text-xs font-normal text-muted-foreground hidden lg:inline">{t.admin}</span>
        </Link>

        {/* Desktop nav (xl+) */}
        <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center min-w-0">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <n.icon className="w-3.5 h-3.5 shrink-0" />
                {labelFor(n.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <LanguageToggle variant="compact" />
          <ThemeToggle />
          <Link
            href="/profile"
            title={t.view_profile}
            className="flex items-center"
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                {initials}
              </div>
            )}
          </Link>
          <button
            onClick={logout}
            title={t.logout}
            aria-label={t.logout}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Sub-xl horizontal nav (always horizontally scrollable) */}
      <div className="xl:hidden border-t border-border/50">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-0.5 px-3 sm:px-4 py-2 min-w-max">
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <n.icon className="w-3.5 h-3.5 shrink-0" />
                  {labelFor(n.key)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
