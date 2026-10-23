/**
 * Rank ladder. Colors follow flame temperature: the higher the rating,
 * the hotter the fire (ash → red → orange → yellow → blue → violet).
 * Problem difficulty uses the same ladder, so a 1800 problem is "Blaze-level".
 */
export const RANKS = [
  { id: "spark", name: "Spark", min: 0 },
  { id: "ember", name: "Ember", min: 1200 },
  { id: "flame", name: "Flame", min: 1400 },
  { id: "blaze", name: "Blaze", min: 1700 },
  { id: "inferno", name: "Inferno", min: 2000 },
  { id: "phoenix", name: "Phoenix", min: 2400 },
] as const;

export type RankId = (typeof RANKS)[number]["id"];
export type Rank = (typeof RANKS)[number];

export function rankForRating(rating: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (rating >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

/** Tailwind text color class per rank; listed literally so Tailwind can see them. */
export const RANK_TEXT: Record<RankId, string> = {
  spark: "text-rank-spark",
  ember: "text-rank-ember",
  flame: "text-rank-flame",
  blaze: "text-rank-blaze",
  inferno: "text-rank-inferno",
  phoenix: "text-rank-phoenix",
};

export const RANK_BG: Record<RankId, string> = {
  spark: "bg-rank-spark",
  ember: "bg-rank-ember",
  flame: "bg-rank-flame",
  blaze: "bg-rank-blaze",
  inferno: "bg-rank-inferno",
  phoenix: "bg-rank-phoenix",
};
