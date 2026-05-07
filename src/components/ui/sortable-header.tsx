"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc" | null;

type Props = {
  /** Column key — used to identify which column is currently sorted. */
  field: string;
  /** Currently sorted field (from parent state). */
  currentField: string | null;
  /** Currently sorted direction. */
  currentDir: SortDir;
  /** Called with (field, nextDir) on click — parent updates its state. */
  onSort: (field: string, dir: SortDir) => void;
  /** Cycle order: null → asc → desc → null (default). Pass `["asc", "desc"]` to skip the null state. */
  cycle?: SortDir[];
  /** Right-align label (e.g. for numeric columns). */
  align?: "left" | "right" | "center";
  className?: string;
  children: React.ReactNode;
};

/** Click-to-sort table header. Drop into a `<th>` cell:
 *
 *   <th><SortableHeader field="amount" currentField={f} currentDir={d} onSort={set}>Amount</SortableHeader></th>
 */
export function SortableHeader({
  field, currentField, currentDir, onSort,
  cycle = ["asc", "desc", null],
  align = "left", className, children,
}: Props) {
  const active = currentField === field && currentDir !== null;
  const dir: SortDir = active ? currentDir : null;

  function handleClick() {
    const idx = cycle.findIndex((d) => d === dir);
    const next = cycle[(idx + 1) % cycle.length];
    onSort(field, next);
  }

  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 group select-none transition-all rounded-md px-1.5 py-1 -mx-1.5 -my-1 cursor-pointer",
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        align === "right" && "justify-end w-full",
        align === "center" && "justify-center w-full",
        className,
      )}
      title={active ? `Sorted ${dir}ending — click to ${dir === "asc" ? "reverse" : "clear"}` : "Click to sort"}
    >
      <span className="font-semibold text-xs uppercase tracking-wide">{children}</span>
      <Icon className={cn(
        "w-3.5 h-3.5 transition-all",
        active ? "opacity-100" : "opacity-60 group-hover:opacity-100 group-hover:scale-110",
      )} />
    </button>
  );
}

/** Generic in-memory sort utility. Pass an array + field + dir → returns sorted copy. */
export function sortBy<T>(
  items: T[],
  field: string,
  dir: SortDir,
  /** Optional getter — defaults to `(row) => row[field]`. */
  get?: (row: T, field: string) => unknown,
): T[] {
  if (!dir || !field) return items;
  const accessor = get ?? ((row: T, f: string) => (row as Record<string, unknown>)[f]);
  const sorted = [...items].sort((a, b) => {
    const av = accessor(a, field);
    const bv = accessor(b, field);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv), undefined, { numeric: true });
  });
  return dir === "asc" ? sorted : sorted.reverse();
}
