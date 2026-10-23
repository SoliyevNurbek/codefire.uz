import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border-strong bg-surface-2 px-1 font-mono text-2xs font-medium text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden className={cn("animate-pulse rounded-md bg-surface-3/70", className)} {...props} />
  );
}

/** Initials fallback; real images come later via next/image. Size reserved to avoid CLS. */
export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: 24 | 28 | 32 | 40 | 64 | 96;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-semibold text-fg-muted",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Separator({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-border", className)} />;
}
