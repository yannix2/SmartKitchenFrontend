"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Store, ShoppingBag, CreditCard, Users,
  RefreshCcw, LogOut, Wallet, PhoneCall,
  Loader2, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, clearTokens } from "@/lib/api";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useT } from "@/i18n/provider";
import type { UserProfile } from "@/types";

type AdminNavKey =
  | "overview" | "stores" | "orders" | "refunds" | "wallet"
  | "users"    | "billing" | "crm"    | "sync";

// `agentVisible: true` means an agent (call/support staff) sees this entry.
// Everything else is admin-only.
const NAV: Array<{ key: AdminNavKey; href: string; icon: typeof LayoutDashboard; exact: boolean; agentVisible?: boolean }> = [
  { key: "overview", href: "/admin",         icon: LayoutDashboard, exact: true                       },
  { key: "stores",   href: "/admin/stores",  icon: Store,           exact: false                      },
  { key: "orders",   href: "/admin/orders",  icon: ShoppingBag,     exact: false                      },
  { key: "refunds",  href: "/admin/refunds", icon: CreditCard,      exact: false                      },
  { key: "wallet",   href: "/admin/wallet",  icon: Wallet,          exact: false                      },
  { key: "users",    href: "/admin/users",   icon: Users,           exact: false, agentVisible: true  },
  { key: "billing",  href: "/admin/billing", icon: CreditCard,      exact: false, agentVisible: true  },
  { key: "crm",      href: "/crm",           icon: PhoneCall,       exact: false, agentVisible: true  },
  { key: "sync",     href: "/admin/sync",    icon: RefreshCcw,      exact: false                      },
];

function NavItem({
  item, label, collapsed, onClick,
}: {
  item: (typeof NAV)[number]; label: string; collapsed: boolean; onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        collapsed && "justify-center px-2",
      )}
    >
      <item.icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const t = useT({
    fr: {
      admin: "Admin",
      menu: "Menu",
      n_overview: "Tableau de bord",
      n_stores:   "Restaurants",
      n_orders:   "Commandes",
      n_refunds:  "Remboursements",
      n_wallet:   "Portefeuille",
      n_users:    "Utilisateurs",
      n_billing:  "Facturation",
      n_crm:      "CRM",
      n_sync:     "Sync",
      theme: "Thème",
      language: "Langue",
      logout: "Déconnexion",
      view_profile: "Voir le profil",
    },
    en: {
      admin: "Admin",
      menu: "Menu",
      n_overview: "Overview",
      n_stores:   "Stores",
      n_orders:   "Orders",
      n_refunds:  "Refunds",
      n_wallet:   "Wallet",
      n_users:    "Users",
      n_billing:  "Billing",
      n_crm:      "CRM",
      n_sync:     "Sync",
      theme: "Theme",
      language: "Language",
      logout: "Logout",
      view_profile: "View profile",
    },
  });

  const labelFor = (k: AdminNavKey) => ({
    overview: t.n_overview, stores: t.n_stores, orders: t.n_orders, refunds: t.n_refunds,
    wallet:   t.n_wallet,   users:  t.n_users,  billing: t.n_billing, crm: t.n_crm, sync: t.n_sync,
  }[k]);

  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [authDone, setAuthDone]     = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    api.get<UserProfile>("/auth/me")
      .then((p) => {
        // Admins get full access; agents (call/support staff) get a
        // subset of admin pages — billing and users — for sub activations
        // and password resets. Non-staff bounce back to their dashboard.
        if (p.role !== "admin" && p.role !== "agent") {
          router.replace("/dashboard");
          return;
        }
        setProfile(p);
        setAuthDone(true);
      })
      .catch(() => {
        clearTokens();
        router.replace("/login");
      });
  }, [router]);

  if (!authDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile
    ? `${profile.name?.[0] ?? ""}${profile.family_name?.[0] ?? ""}`.toUpperCase()
    : "A";

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full min-h-0">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 px-3 py-5 shrink-0",
        !isMobile && collapsed && "justify-center px-2",
      )}>
        <Logo width={28} height={28} className="rounded-lg overflow-hidden shrink-0" />
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <span className="font-extrabold text-sm tracking-tight">
              Smart<span className="text-primary">Kitchen</span>
            </span>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest -mt-0.5">{t.admin}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn(
        "flex-1 min-h-0 flex flex-col gap-0.5 px-2 pb-4 overflow-y-auto scrollbar-thin",
        !isMobile && collapsed && "px-1.5",
      )}>
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pt-2 pb-1",
          !isMobile && collapsed && "hidden",
        )}>
          {t.menu}
        </p>
        {NAV.filter((item) => profile?.role === "admin" || item.agentVisible).map((item) => (
          <NavItem
            key={item.href}
            item={item}
            label={labelFor(item.key)}
            collapsed={!isMobile && collapsed}
            onClick={isMobile ? () => setMobileOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className={cn(
        "shrink-0 border-t border-border px-2 pt-3 pb-4 space-y-1",
        !isMobile && collapsed && "px-1.5",
      )}>
        {(!collapsed || isMobile) ? (
          <>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">{t.theme}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">{t.language}</span>
              <LanguageToggle />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center py-1"><ThemeToggle /></div>
            <div className="flex justify-center py-1"><LanguageToggle variant="compact" /></div>
          </>
        )}

        {/* Profile */}
        <Link
          href="/profile"
          title={t.view_profile}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors",
            !isMobile && collapsed && "justify-center px-2",
          )}
        >
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-xs font-bold text-primary ring-2 ring-primary/20">
              {initials}
            </div>
          )}
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.name} {profile?.family_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={() => { clearTokens(); router.push("/login"); }}
          title={!isMobile && collapsed ? t.logout : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors",
            !isMobile && collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>{t.logout}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30 flex">
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-20 border-r border-border/60 bg-linear-to-b from-primary/8 via-card to-card shadow-[4px_0_24px_-12px] shadow-primary/10 transition-[width] duration-300",
        collapsed ? "w-15" : "w-72",
      )}>
        {sidebarContent()}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand" : "Collapse"}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 bottom-0 z-40 w-65 max-w-[85vw] border-r border-border/60 bg-linear-to-b from-primary/8 via-card to-card shadow-[4px_0_24px_-12px] shadow-primary/15 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent(true)}
      </aside>

      {/* Main */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-[padding] duration-300",
        collapsed ? "lg:pl-15" : "lg:pl-72",
      )}>
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm tracking-tight">
            Smart<span className="text-primary">Kitchen</span>
            <span className="text-primary text-xs ml-1">{t.admin}</span>
          </span>
          <ThemeToggle />
        </div>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
