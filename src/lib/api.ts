import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ── Re-export token helpers so callers don't import cookies directly ─────────
export { getAccessToken, getRefreshToken, setTokens, clearTokens };

// ── Silent token refresh ─────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    // Only update the access cookie; keep the existing refresh cookie
    setTokens(data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

export type FetchOptions = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...init } = options;
  const headers = new Headers(init.headers);

  // Default content-type for JSON bodies
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach bearer token
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Auto-refresh on 401 and retry once
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    } else {
      // Refresh failed → force logout by clearing cookies
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(err.detail ?? res.statusText), {
      status: res.status,
      detail: err.detail ?? err,
    });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...opts,
    }),

  patch: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...opts,
    }),

  delete: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
      ...opts,
    }),

  upload: <T>(path: string, form: FormData, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "POST", body: form, ...opts }),
};
