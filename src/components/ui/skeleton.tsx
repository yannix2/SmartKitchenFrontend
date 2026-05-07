import { cn } from "@/lib/utils";

/** Solid shimmer block. Pass className for sizing. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

/** Skeleton row matching a typical table row. `cols` = number of column placeholders. */
export function SkeletonRow({ cols = 5, className }: { cols?: number; className?: string }) {
  return (
    <tr className={cn("border-b border-border/50", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn("h-4", i === 0 ? "w-24" : i === 1 ? "w-32" : "w-20")} />
        </td>
      ))}
    </tr>
  );
}

/** Card-shaped skeleton — for stat cards / list items. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 space-y-3", className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
