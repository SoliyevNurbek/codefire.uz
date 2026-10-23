import { cn } from "@/lib/utils";
import { VERDICTS, type Verdict, type VerdictTone } from "@/lib/verdict";
import { Spinner } from "./spinner";

const TONE: Record<VerdictTone, string> = {
  ac: "text-verdict-ac bg-verdict-ac/10 border-verdict-ac/25",
  wa: "text-verdict-wa bg-verdict-wa/10 border-verdict-wa/25",
  tle: "text-verdict-tle bg-verdict-tle/10 border-verdict-tle/25",
  ce: "text-verdict-ce bg-verdict-ce/10 border-verdict-ce/25",
  pending: "text-verdict-pending bg-surface-2 border-border",
};

/**
 * The one way to show a verdict anywhere in the product.
 * `test` adds the failing / current test number: "WA 7", "Tekshirilmoqda 12".
 */
export function VerdictBadge({
  verdict,
  test,
  full = false,
  className,
}: {
  verdict: Verdict;
  test?: number;
  /** Show the full Uzbek label instead of the short code. */
  full?: boolean;
  className?: string;
}) {
  const meta = VERDICTS[verdict];
  const live = verdict === "PENDING" || verdict === "RUNNING";
  const text = full || live ? meta.label : meta.short;

  return (
    <span
      title={meta.label}
      aria-label={test ? `${meta.label}, test ${test}` : meta.label}
      className={cn(
        "inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 font-mono text-xs font-semibold tabular-nums",
        TONE[meta.tone],
        className,
      )}
    >
      {live && <Spinner className="size-3" />}
      <span aria-hidden>{text}</span>
      {test !== undefined && (
        <span aria-hidden className="font-normal opacity-80">
          {test}
        </span>
      )}
    </span>
  );
}
