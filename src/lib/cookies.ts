/**
 * Cookie-based token storage.
 * Accessible by both client JS and Next.js middleware (edge runtime).
 */

const ACCESS_KEY  = "sk_access";
const REFRESH_KEY = "sk_refresh";

// ── Low-level helpers ────────────────────────────────────────────────────────

function writeCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === "undefined") return;
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `max-age=${maxAgeSec}`,
    "path=/",
    "SameSite=Lax",
    // Add Secure in production (HTTPS)
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Read the access token (client-side only). */
export function getAccessToken(): string | null {
  return readCookie(ACCESS_KEY);
}

/** Read the refresh token (client-side only). */
export function getRefreshToken(): string | null {
  return readCookie(REFRESH_KEY);
}

/**
 * Persist tokens after login / token refresh.
 * - access  → 1 hour
 * - refresh → 7 days
 */
export function setTokens(access: string, refresh?: string) {
  writeCookie(ACCESS_KEY, access, 60 * 60);           // 1 h
  if (refresh) writeCookie(REFRESH_KEY, refresh, 7 * 24 * 60 * 60); // 7 d
}

/** Wipe both tokens (logout). */
export function clearTokens() {
  eraseCookie(ACCESS_KEY);
  eraseCookie(REFRESH_KEY);
}

/** Cookie names exported for middleware (reads server-side via request.cookies). */
export const COOKIE_KEYS = { access: ACCESS_KEY, refresh: REFRESH_KEY };
