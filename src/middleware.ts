import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_KEYS } from "@/lib/cookies";

// Routes that logged-in users should not reach
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Route prefixes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/stores",
  "/orders",
  "/refunds",
  "/profile",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken  = request.cookies.get(COOKIE_KEYS.access)?.value;
  const refreshToken = request.cookies.get(COOKIE_KEYS.refresh)?.value;

  // A session is considered live if either cookie exists.
  // The API client handles the actual refresh silently on the first 401.
  const hasSession = Boolean(accessToken || refreshToken);

  // ── Logged-in users → redirect away from auth pages ──────────────────
  if (hasSession && AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Guests → redirect away from protected pages ───────────────────────
  if (!hasSession && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
