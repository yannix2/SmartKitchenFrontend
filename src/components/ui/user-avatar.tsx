import { cn } from "@/lib/utils";

type UserAvatarProps = {
  /** Avatar image URL — falls back to initials if missing/null. */
  src?: string | null;
  /** First name used for the first initial. */
  name?: string | null;
  /** Family name used for the second initial. */
  familyName?: string | null;
  /** Pixel size of the circle. Defaults to 32. */
  size?: number;
  /** Optional class merged onto the container (e.g. ring colors, margins). */
  className?: string;
  /** Optional alt text for the image (defaults to "<name> <familyName>"). */
  alt?: string;
};

/**
 * Renders a user's profile photo when `src` is set, otherwise a
 * primary-tinted circle with the user's two-letter initials. Falls back
 * to "?" when neither name is available.
 */
export function UserAvatar({
  src,
  name,
  familyName,
  size = 32,
  className,
  alt,
}: UserAvatarProps) {
  const first = (name ?? "").trim();
  const last  = (familyName ?? "").trim();
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";

  const fontSize = Math.max(10, Math.round(size * 0.36));
  const dim = { width: size, height: size, fontSize };

  const fallbackLabel = `${first} ${last}`.trim() || "Avatar";
  const ariaLabel = alt ?? fallbackLabel;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={ariaLabel}
        style={{ width: size, height: size }}
        className={cn(
          "rounded-full object-cover ring-2 ring-primary/20 shrink-0",
          className,
        )}
      />
    );
  }

  return (
    <div
      style={dim}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary ring-2 ring-primary/20 shrink-0 select-none",
        className,
      )}
    >
      {initials}
    </div>
  );
}
