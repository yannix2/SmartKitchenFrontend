"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Persist a piece of state in the URL query string.
 *
 * Reads the URL ONCE on mount, then mirrors local state to the URL on
 * every change. Does NOT sync URL changes back into state (avoids a race
 * when several useUrlState hooks update simultaneously — common with
 * quick-filter buttons that change multiple params at once).
 */
export function useUrlState<T extends string | number | boolean | null | undefined>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<T>(() => {
    const raw = searchParams.get(key);
    if (raw === null) return defaultValue;
    if (typeof defaultValue === "number") return Number(raw) as T;
    if (typeof defaultValue === "boolean") return (raw === "true") as T;
    return raw as T;
  });

  const update = useCallback(
    (value: T) => {
      setState(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Read the freshest URL at fire time — not the captured searchParams
        const current = typeof window !== "undefined" ? window.location.search : "";
        const params = new URLSearchParams(current);
        if (value === "" || value === null || value === undefined || value === defaultValue) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }, 150);
    },
    [router, pathname, key, defaultValue],
  );

  return [state, update];
}
