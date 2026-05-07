"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  CreditCard,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Loader2,
  Lock,
  Receipt,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, clearTokens } from "@/lib/api";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useT } from "@/i18n/provider";
import type { UserProfile } from "@/types";

// ── Nav config ─────────────────────────────────────────────────────────────────

type NavKey = "overview" | "stores" | "cancelled" | "contested" | "refunds" | "billing" | "feedback" | "profile";

const NAV: Array<{ key: NavKey; href: string; icon: typeof LayoutDashboard; free: boolean; badge?: string }> = [
  { key: "overview",  href: "/dashboard",        icon: LayoutDashboard, free: true  },
  { key: "stores",    href: "/stores",           icon: Store,           free: true  },
  { key: "cancelled", href: "/orders/cancelled", icon: ShoppingBag,     free: false },
  { key: "contested", href: "/orders/contested", icon: ShoppingBag,     free: false, badge: "!" },
  { key: "refunds",   href: "/refunds",          icon: CreditCard,      free: false },
  { key: "billing",   href: "/billing",          icon: Receipt,         free: true  },
  { key: "feedback",  href: "/feedback",         icon: MessageSquare,   free: true  },
  { key: "profile",   href: "/profile",          icon: User,            free: true  },
];

// Paths accessible without a subscription
const FREE_PATHS = ["/dashboard", "/billing", "/profile", "/stores", "/feedback", "/onboarding/preview"];

function isFreePath(pathname: string) {
  return FREE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function NavItem({
  item,
  label,
  proLabel,
  collapsed,
  isSubscribed,
  onClick,
}: {
  item: (typeof NAV)[number];
  label: string;
  proLabel: string;
  collapsed: boolean;
  isSubscribed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const router   = useRouter();

  const locked = !isSubscribed && !item.free;
  const active  =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  function handleClick(e: React.MouseEvent) {
    if (locked) {
      e.preventDefault();
      router.push("/onboarding/preview");
    }
    onClick?.();
  }

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        locked
          ? "text-muted-foreground/40 cursor-pointer hover:bg-muted/50"
          : active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        collapsed && "justify-center px-2"
      )}
    >
      {locked ? (
        <Lock className="w-4 h-4 shrink-0" />
      ) : (
        <item.icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {locked && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-500">
              {proLabel}
            </span>
          )}
          {!locked && item.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-500">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ── Main shell ─────────────────────────────────────────────────────────────────

export function UserShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const t = useT({
    fr: {
      nav_overview: "Tableau de bord",
      nav_stores: "Restaurants",
      nav_cancelled: "Annulées",
      nav_contested: "Contestées",
      nav_refunds: "Remboursements",
      nav_billing: "Facturation",
      nav_feedback: "Avis",
      nav_profile: "Profil",
      back_crm: "Retour au CRM",
      menu: "Menu",
      pro_required: "Pro requis",
      pro_unlock: "Débloquez le suivi des remboursements, les rapports et plus.",
      subscribe_now: "S'abonner maintenant",
      pro: "Pro",
      theme: "Thème",
      language: "Langue",
      logout: "Déconnexion",
      view_profile: "Voir le profil",
    },
    en: {
      nav_overview: "Overview",
      nav_stores: "Stores",
      nav_cancelled: "Cancelled",
      nav_contested: "Contested",
      nav_refunds: "Refunds",
      nav_billing: "Billing",
      nav_feedback: "Review",
      nav_profile: "Profile",
      back_crm: "Back to CRM",
      menu: "Menu",
      pro_required: "Pro required",
      pro_unlock: "Unlock refund tracking, reports and more.",
      subscribe_now: "Subscribe now",
      pro: "Pro",
      theme: "Theme",
      language: "Language",
      logout: "Logout",
      view_profile: "View profile",
    },
  });

  const labelFor = (key: NavKey) => ({
    overview:  t.nav_overview,
    stores:    t.nav_stores,
    cancelled: t.nav_cancelled,
    contested: t.nav_contested,
    refunds:   t.nav_refunds,
    billing:   t.nav_billing,
    feedback:  t.nav_feedback,
    profile:   t.nav_profile,
  }[key]);

  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [authDone, setAuthDone]     = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Admin pages are inside this layout group but have their own nav
    if (pathname.startsWith("/admin")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthDone(true);
      return;
    }

    api.get<UserProfile>("/auth/me")
      .then((p) => {
        if (p.role === "admin") {
          router.replace("/admin");
          return;
        }
        // Agents (call/support staff) live in /crm. The only "user" page they
        // need from this layout group is their own /profile — let them through
        // (we'll render children without the user sidebar below). Everything
        // else bounces back to /crm.
        if (p.role === "agent") {
          if (pathname === "/profile" || pathname.startsWith("/profile/")) {
            setProfile(p);
            setAuthDone(true);
            return;
          }
          router.replace("/crm");
          return;
        }
        setProfile(p);
        setAuthDone(true);

        // Gate behind onboarding approval first
        const approved = p.is_verified_bymanager ?? false;
        if (!approved) {
          const status = p.onboarding_status ?? "not_started";
          if (status === "not_started") {
            if (!pathname.startsWith("/onboarding")) router.replace("/onboarding/form");
          } else {
            if (!pathname.startsWith("/onboarding")) router.replace("/onboarding/pending");
          }
          return;
        }

        // Gate restricted pages behind subscription
        const subscribed = p.is_subscribed ?? false;
        if (!subscribed) {
          // Approved-but-unsubscribed users see the value pitch on first dashboard hit
          if (pathname === "/dashboard") {
            router.replace("/onboarding/preview");
            return;
          }
          if (!isFreePath(pathname)) {
            router.replace("/onboarding/preview");
          }
        }
      })
      .catch(() => {
        clearTokens();
        router.replace("/login");
      });
  }, [router, pathname]);

  function logout() {
    clearTokens();
    router.push("/login");
  }

  if (!authDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Admin routes render under their own AdminShell layout, not this user sidebar
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Agents only ever land here for their own /profile page; render bare so we
  // don't show the user sidebar (which has user-only locked items). Add a
  // small top bar so they can get back to CRM.
  if (profile?.role === "agent") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <Link
              href="/crm"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />{t.back_crm}
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle variant="compact" />
              <ThemeToggle />
            </div>
          </div>
        </div>
        <main>{children}</main>
      </div>
    );
  }

  const isSubscribed = profile?.is_subscribed ?? false;

  const initials = profile
    ? `${profile.name?.[0] ?? ""}${profile.family_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  // ── Sidebar content ──────────────────────────────────────────────────────

  const sidebarContent = (isMobile = false) => (
    <div className={cn(
      "flex flex-col h-full",
      !isMobile && collapsed ? "items-center" : ""
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 px-3 py-5 shrink-0",
        !isMobile && collapsed && "justify-center px-2"
      )}>
        <Logo width={30} height={30} className="rounded-lg overflow-hidden shrink-0" />
        {(!collapsed || isMobile) && (
          <span className="font-extrabold text-base tracking-tight">
            Smart<span className="text-primary">Kitchen</span>
          </span>
        )}
      </div>

      {/* Subscription banner for unpaid users */}
      {!isSubscribed && (!collapsed || isMobile) && (
        <Link href="/billing" className="group mx-2 mb-2 block">
          <div className="px-3 py-3 rounded-xl bg-linear-to-br from-violet-500/15 to-violet-500/5 border border-violet-500/25 hover:border-violet-500/40 transition-all duration-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3 h-3 text-violet-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">{t.pro_required}</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mb-2">{t.pro_unlock}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-500 group-hover:gap-2 transition-all">
              {t.subscribe_now} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      )}

      {/* Nav */}
      <nav className={cn(
        "flex-1 flex flex-col gap-0.5 px-2 pb-4 overflow-y-auto",
        !isMobile && collapsed && "px-1.5"
      )}>
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pt-2 pb-1",
          !isMobile && collapsed && "hidden"
        )}>
          {t.menu}
        </p>
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            label={labelFor(item.key)}
            proLabel={t.pro}
            collapsed={!isMobile && collapsed}
            isSubscribed={isSubscribed}
            onClick={isMobile ? () => setMobileOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className={cn(
        "shrink-0 border-t border-border px-2 pt-3 pb-4 space-y-1",
        !isMobile && collapsed && "px-1.5"
      )}>
        {/* Theme toggle */}
        {(!collapsed || isMobile) ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-muted-foreground">{t.theme}</span>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <ThemeToggle />
          </div>
        )}

        {/* Language toggle */}
        {(!collapsed || isMobile) ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-muted-foreground">{t.language}</span>
            <LanguageToggle />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <LanguageToggle variant="compact" />
          </div>
        )}

        {/* User */}
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors",
            !isMobile && collapsed && "justify-center px-2"
          )}
          title={t.view_profile}
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
          onClick={logout}
          title={!isMobile && collapsed ? t.logout : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors",
            !isMobile && collapsed && "justify-center px-2"
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

      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-20 border-r border-border/60 bg-linear-to-b from-primary/8 via-card to-card shadow-[4px_0_24px_-12px] shadow-primary/10 transition-all duration-300",
          collapsed ? "w-15" : "w-72"
        )}
      >
        {sidebarContent()}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shadow-sm"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft  className="w-3 h-3" />
          }
        </button>
      </aside>

      {/* ── Mobile overlay ────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 bottom-0 z-40 w-65 border-r border-border/60 bg-linear-to-b from-primary/8 via-card to-card shadow-[4px_0_24px_-12px] shadow-primary/15 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent(true)}
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        collapsed ? "lg:pl-15" : "lg:pl-72"
      )}>

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo width={26} height={26} className="rounded-md overflow-hidden shrink-0" />
            <span className="font-extrabold text-sm tracking-tight">
              Smart<span className="text-primary">Kitchen</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
