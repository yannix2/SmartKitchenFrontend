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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, clearTokens } from "@/lib/api";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserProfile } from "@/types";

// ── Nav config ─────────────────────────────────────────────────────────────────

const NAV = [
  { label: "Overview",    href: "/dashboard",            icon: LayoutDashboard },
  { label: "Stores",      href: "/stores",               icon: Store           },
  { label: "Cancelled",   href: "/orders/cancelled",     icon: ShoppingBag     },
  { label: "Contested",   href: "/orders/contested",     icon: ShoppingBag, badge: "!" },
  { label: "Refunds",     href: "/refunds",              icon: CreditCard      },
  { label: "Profile",     href: "/profile",              icon: User            },
];

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function NavItem({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof NAV)[number];
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        collapsed && "justify-center px-2"
      )}
    >
      <item.icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
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

  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [authDone, setAuthDone]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    // Admin pages are inside this layout group but have their own nav —
    // skip the shell entirely and just render children.
    if (pathname.startsWith("/admin")) {
      setAuthDone(true);
      return;
    }

    api.get<UserProfile>("/auth/me")
      .then((p) => {
        if (p.role === "admin") {
          router.replace("/admin");
          return;
        }
        setProfile(p);
        setAuthDone(true);
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

  // Admin routes render without the user sidebar (AdminNav handles navigation)
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  const initials = profile
    ? `${profile.name[0] ?? ""}${profile.family_name[0] ?? ""}`.toUpperCase()
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

      {/* Nav */}
      <nav className={cn(
        "flex-1 flex flex-col gap-0.5 px-2 pb-4 overflow-y-auto",
        !isMobile && collapsed && "px-1.5"
      )}>
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pt-2 pb-1",
          !isMobile && collapsed && "hidden"
        )}>
          Menu
        </p>
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            collapsed={!isMobile && collapsed}
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
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <ThemeToggle />
          </div>
        )}

        {/* User */}
        <div className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl",
          !isMobile && collapsed && "justify-center px-2"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
            {initials}
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.name} {profile?.family_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title={!isMobile && collapsed ? "Log out" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors",
            !isMobile && collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Log out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-20 border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-[60px]" : "w-[220px]"
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
          "lg:hidden fixed left-0 top-0 bottom-0 z-40 w-[260px] border-r border-border bg-card transition-transform duration-300",
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
        collapsed ? "lg:pl-[60px]" : "lg:pl-[220px]"
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
