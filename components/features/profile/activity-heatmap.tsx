import { getLocale, getTranslations } from "next-intl/server";
import type { ActivityDay } from "@/lib/api/types";
import { formatDate } from "@/lib/time";

const CELL = 11;
const GAP = 3;

/** Sequential single-hue ramp (empty → accent), monotonic in lightness. */
const LEVELS = [
  "var(--surface-3)",
  "color-mix(in oklab, var(--accent) 30%, var(--surface-3))",
  "color-mix(in oklab, var(--accent) 55%, var(--surface-3))",
  "color-mix(in oklab, var(--accent) 80%, var(--surface-3))",
  "var(--accent)",
];
const level = (n: number) => (n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);

/** GitHub-style year of activity. Server-rendered SVG, native per-cell tooltips, zero JS. */
export async function ActivityHeatmap({ days }: { days: ActivityDay[] }) {
  const t = await getTranslations("profile");
  const locale = await getLocale();
  const total = days.reduce((s, d) => s + d.count, 0);
  // Monday-first weeks: pad the start so the first column begins on Monday.
  const firstDow = (new Date(days[0].date).getUTCDay() + 6) % 7;
  const cells = [...Array<ActivityDay | null>(firstDow).fill(null), ...days];
  const weeks = Math.ceil(cells.length / 7);
  const width = weeks * (CELL + GAP);
  const height = 7 * (CELL + GAP);

  return (
    <figure>
      <figcaption className="mb-3 text-sm text-fg-muted">{t("activityTotal", { count: total })}</figcaption>
      <div className="overflow-x-auto pb-1">
        <svg width={width} height={height} role="img" aria-label={t("activityTotal", { count: total })} className="block">
          {cells.map((d, i) =>
            d ? (
              <rect
                key={d.date}
                x={Math.floor(i / 7) * (CELL + GAP)}
                y={(i % 7) * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                fill={LEVELS[level(d.count)]}
              >
                <title>
                  {d.count
                    ? t("solvedOnDay", { date: formatDate(d.date, locale), count: d.count })
                    : t("noActivityOnDay", { date: formatDate(d.date, locale) })}
                </title>
              </rect>
            ) : null,
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-fg-subtle" aria-hidden>
        {t("less")}
        {LEVELS.map((c) => (
          <span key={c} className="size-[11px] rounded-[2px]" style={{ background: c }} />
        ))}
        {t("more")}
      </div>
    </figure>
  );
}
