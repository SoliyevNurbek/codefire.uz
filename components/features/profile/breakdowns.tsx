import { rankForRating } from "@/lib/rank";
import { formatNumber } from "@/lib/utils";

/**
 * Solved-by-difficulty: one sequential hue (magnitude), tier names under the
 * axis carry the rank meaning. Rank colors are not used here: they fail CVD
 * separation as a categorical palette (Inferno/Phoenix).
 */
export function DifficultyBars({ data, label }: { data: { rating: number; solved: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.solved));
  return (
    <figure aria-label={label}>
      <div className="flex h-36 items-end gap-0.5">
        {data.map((d) => (
          <div key={d.rating} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="rounded-t-[4px] bg-accent/75 transition-colors duration-150 group-hover:bg-accent"
              style={{ height: `${Math.max(d.solved ? 3 : 0, (d.solved / max) * 100)}%` }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded-md bg-fg px-1.5 py-0.5 font-mono text-2xs whitespace-nowrap text-bg group-hover:block">
              {d.rating}: {d.solved}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-0.5 border-t border-border pt-1.5">
        {data.map((d, i) => (
          <span key={d.rating} className="flex-1 text-center font-mono text-2xs text-fg-subtle">
            {i % 2 === 0 ? d.rating : ""}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.rating}>
              <td>
                {d.rating} ({rankForRating(d.rating).name})
              </td>
              <td>{d.solved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Horizontal magnitude bars with the value in text ink, never the bar color. */
export function HBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="flex flex-col gap-2">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[minmax(0,9rem)_1fr_3rem] items-center gap-3 text-sm">
          <span className="truncate text-fg-muted">{d.label}</span>
          <span aria-hidden className="h-2 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-fg-subtle" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="text-right font-mono text-fg tabular-nums">{formatNumber(d.value)}</span>
        </li>
      ))}
    </ul>
  );
}
