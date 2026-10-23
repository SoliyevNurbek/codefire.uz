"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { RatingPoint } from "@/lib/api/types";
import { RANKS } from "@/lib/rank";
import { formatDate } from "@/lib/time";

const H = 240;
const PAD = { top: 12, right: 64, bottom: 28, left: 44 };

/**
 * Rating over time: one 2px line, rank tiers as faint labeled bands (the tier
 * name carries identity, not the color), crosshair + tooltip on hover, arrow
 * keys to step through contests, and a screen-reader table.
 */
export default function RatingChart({ points }: { points: RatingPoint[] }) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ratings = points.flatMap((p) => [p.oldRating, p.newRating]);
  const yMin = Math.floor((Math.min(...ratings) - 80) / 100) * 100;
  const yMax = Math.ceil((Math.max(...ratings) + 80) / 100) * 100;
  const times = points.map((p) => new Date(p.date).getTime());
  const tMin = times[0];
  const tMax = times[times.length - 1];
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (time: number) => PAD.left + (tMax === tMin ? innerW / 2 : ((time - tMin) / (tMax - tMin)) * innerW);
  const y = (r: number) => PAD.top + (1 - (r - yMin) / (yMax - yMin)) * innerH;

  const bands = RANKS.map((rank, i) => ({
    rank,
    from: Math.max(rank.min, yMin),
    to: Math.min(RANKS[i + 1]?.min ?? Infinity, yMax),
  })).filter((b) => b.to > b.from);

  const path = points.map((p, i) => `${i ? "L" : "M"}${x(times[i]).toFixed(1)},${y(p.newRating).toFixed(1)}`).join("");
  const ticks = [0, Math.floor(points.length / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left;
    let best = 0;
    times.forEach((time, i) => {
      if (Math.abs(x(time) - px) < Math.abs(x(times[best]) - px)) best = i;
    });
    setActive(best);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setActive((a) => {
      const cur = a ?? points.length - 1;
      return Math.min(points.length - 1, Math.max(0, cur + (e.key === "ArrowRight" ? 1 : -1)));
    });
  };

  const p = active !== null ? points[active] : null;
  const last = points[points.length - 1];
  const delta = p ? p.newRating - p.oldRating : 0;

  return (
    <div ref={wrap} className="relative">
      <svg
        width={width}
        height={H}
        role="img"
        tabIndex={0}
        aria-label={`${t("ratingHistory")}: ${points[0].oldRating} → ${last.newRating}`}
        onPointerMove={onMove}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        className="block touch-pan-y rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {bands.map((b) => (
          <g key={b.rank.id}>
            <rect x={PAD.left} width={innerW} y={y(b.to)} height={y(b.from) - y(b.to)} fill={`var(--rank-${b.rank.id})`} fillOpacity={0.09} />
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y(b.from)} y2={y(b.from)} stroke="var(--border)" />
            <text x={PAD.left + innerW + 8} y={(y(b.from) + y(b.to)) / 2} dominantBaseline="middle" className="fill-fg-subtle text-[11px]">
              {b.rank.name}
            </text>
            {b.from > yMin && (
              <text x={PAD.left - 8} y={y(b.from)} textAnchor="end" dominantBaseline="middle" className="fill-fg-subtle font-mono text-[11px]">
                {b.from}
              </text>
            )}
          </g>
        ))}
        {ticks.map((i) => (
          <text key={i} x={x(times[i])} y={H - 8} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} className="fill-fg-subtle text-[11px]">
            {formatDate(points[i].date, locale)}
          </text>
        ))}

        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {p && active !== null && (
          <>
            <line x1={x(times[active])} x2={x(times[active])} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--fg-subtle)" strokeDasharray="3 3" />
            <circle cx={x(times[active])} cy={y(p.newRating)} r={4.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
          </>
        )}
        {!p && <circle cx={x(times[times.length - 1])} cy={y(last.newRating)} r={4.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />}
      </svg>

      {p && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 w-56 rounded-lg border border-border bg-surface p-3 text-sm shadow-lg"
          style={x(times[active]) > width / 2 ? { left: Math.max(0, x(times[active]) - 236) } : { left: x(times[active]) + 16 }}
        >
          <p className="truncate font-medium">{p.contestName}</p>
          <p className="text-xs text-fg-subtle">{formatDate(p.date, locale)}</p>
          <p className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-md font-semibold">{p.newRating}</span>
            <span className="text-fg-muted">
              {delta > 0 ? `+${delta}` : delta} · #{p.rank}
            </span>
          </p>
        </div>
      )}

      <table className="sr-only">
        <caption>{t("ratingHistory")}</caption>
        <tbody>
          {points.map((pt) => (
            <tr key={pt.contestId}>
              <td>{pt.contestName}</td>
              <td>{formatDate(pt.date, locale)}</td>
              <td>{pt.newRating}</td>
              <td>{pt.newRating - pt.oldRating}</td>
              <td>{pt.rank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
