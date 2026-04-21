"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { clearTokens } from "@/lib/cookies";

const NAV = [
  { label: "Overview",  href: "/admin",          icon: LayoutDashboard },
  { label: "Stores",    href: "/admin/stores",    icon: Store           },
  { label: "Orders",    href: "/admin/orders",    icon: ShoppingBag     },
  { label: "Refunds",   href: "/admin/refunds",   icon: CreditCard      },
  { label: "Users",     href: "/admin/users",     icon: Users           },
  { label: "Sync",      href: "/admin/sync",      icon: RefreshCcw      },
];

export function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();

  function logout() {
    clearTokens();
    router.push("/login");
  }

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo width={28} height={28} className="rounded-md overflow-hidden shrink-0" />
          <span className="font-extrabold text-base tracking-tight">
            Smart<span className="text-primary">Kitchen</span>
          </span>
          <span className="text-xs font-normal text-muted-foreground hidden sm:inline">Admin</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV.map((n) => {
            const active =
              n.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <n.icon className="w-3.5 h-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-0.5 overflow-x-auto px-4 pb-2 scrollbar-none">
        {NAV.map((n) => {
          const active =
            n.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <n.icon className="w-3 h-3" />
              {n.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
