import { Flame, Sparkle } from "lucide-react";
import Link from "next/link";
import { RANK_BG, RANK_TEXT, rankForRating, type RankId } from "@/lib/rank";
import { cn, formatNumber } from "@/lib/utils";

function RankGlyph({ id, className }: { id: RankId; className?: string }) {
  const Icon = id === "spark" ? Sparkle : Flame;
  return <Icon aria-hidden className={cn("fill-current", className)} strokeWidth={1.75} />;
}

/** Rank pill: glyph + name, colored by flame temperature. Optionally shows the rating. */
export function RankBadge({
  rating,
  showRating = false,
  className,
}: {
  rating: number;
  showRating?: boolean;
  className?: string;
}) {
  const rank = rankForRating(rating);
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-full border border-current/25 bg-current/10 px-2 text-xs font-semibold",
        RANK_TEXT[rank.id],
        className,
      )}
    >
      <RankGlyph id={rank.id} className="size-3" />
      {rank.name}
      {showRating && <span className="font-mono font-medium tabular-nums">{rating}</span>}
    </span>
  );
}

/** A username colored by its rank — the Codeforces convention, so tables stay scannable. */
export function UserHandle({
  username,
  rating,
  className,
}: {
  username: string;
  rating: number;
  className?: string;
}) {
  const rank = rankForRating(rating);
  return (
    <Link
      href={`/users/${username}`}
      title={`${rank.name} · ${rating}`}
      className={cn("font-semibold hover:underline underline-offset-2", RANK_TEXT[rank.id], className)}
    >
      {username}
    </Link>
  );
}

/**
 * Problem difficulty shown on the same ladder as user ratings:
 * a five-step heat bar plus the rating number in mono.
 */
export function Difficulty({ rating, className }: { rating: number; className?: string }) {
  const rank = rankForRating(rating);
  const steps = Math.min(5, Math.max(1, Math.round((rating - 800) / 400) + 1));
  return (
    <span
      className={cn("inline-flex items-center gap-2 whitespace-nowrap", className)}
      aria-label={`${rating}, ${rank.name}`}
    >
      <span aria-hidden className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn("h-3 w-1 rounded-full", i < steps ? RANK_BG[rank.id] : "bg-surface-3")}
          />
        ))}
      </span>
      <span aria-hidden className={cn("font-mono text-sm font-medium tabular-nums", RANK_TEXT[rank.id])}>
        {formatNumber(rating)}
      </span>
    </span>
  );
}
