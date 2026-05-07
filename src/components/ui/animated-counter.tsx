"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  /** Animation duration in ms */
  duration?: number;
  /** Number of decimals to render */
  decimals?: number;
  /** String suffix appended after the number (e.g. " €", "%") */
  suffix?: string;
  /** String prefix */
  prefix?: string;
  /** Use fr-FR formatting (space thousands separator, comma decimal) */
  locale?: string;
  className?: string;
};

/** Counts from 0 → value over `duration` ms on mount and whenever value changes. */
export function AnimatedCounter({
  value,
  duration = 700,
  decimals = 2,
  suffix = "",
  prefix = "",
  locale = "fr-FR",
  className,
}: Props) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = display.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span className={className}>{prefix}{formatted}{suffix}</span>;
}
