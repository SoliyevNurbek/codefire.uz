"use client";

import { Clock, MemoryStick, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Link } from "@/i18n/navigation";
import type { RunResult } from "@/lib/api/types";
import { formatNumber, cn } from "@/lib/utils";
import { VERDICTS } from "@/lib/verdict";
import type { LiveSubmission } from "@/lib/ws/use-submission";

export type Mode = { kind: "idle" } | { kind: "run"; result: RunResult | null } | { kind: "submit"; id: number | null };

/** One square per test: green passed, tone of the verdict for the failing test, gray not yet run. */
function TestStrip({ live }: { live: LiveSubmission }) {
  const total = live.totalTests ?? 0;
  if (!total) return null;
  const failTone = VERDICTS[live.verdict].tone;
  return (
    <div className="flex flex-wrap gap-1" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const failed = live.done && live.failedTest === n;
        const passed = live.done ? !live.failedTest || n < live.failedTest : n < live.test;
        return (
          <span
            key={n}
            className={cn(
              "size-3 rounded-[3px] transition-colors duration-150",
              passed ? "bg-verdict-ac" : "bg-surface-3",
              !live.done && n === live.test && "bg-fg-subtle",
              failed && (failTone === "tle" ? "bg-verdict-tle" : "bg-verdict-wa"),
            )}
          />
        );
      })}
    </div>
  );
}

export function ResultPanel({ mode, live, runPending }: { mode: Mode; live: LiveSubmission | null; runPending: boolean }) {
  const t = useTranslations("problem");

  return (
    <section aria-label={t("result")} aria-live="polite" className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-4 max-lg:hidden">
        <Terminal aria-hidden className="size-4 text-fg-subtle" />
        <h2 className="text-sm font-medium">{mode.kind === "run" ? t("runResults") : t("result")}</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {mode.kind === "idle" && <p className="text-fg-muted">{t("verdictIdle")}</p>}

        {mode.kind === "run" &&
          (runPending || !mode.result ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : mode.result.compilerOutput ? (
            <div>
              <VerdictBadge verdict="CE" full />
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-sm text-verdict-wa">
                {mode.result.compilerOutput}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className={cn("font-medium", mode.result.results.every((r) => r.verdict === "AC") ? "text-verdict-ac" : "text-verdict-wa")}>
                {mode.result.results.every((r) => r.verdict === "AC")
                  ? t("allExamplesPassed")
                  : t("someExamplesFailed", { count: mode.result.results.filter((r) => r.verdict !== "AC").length })}
              </p>
              <ul className="flex flex-col gap-2">
                {mode.result.results.map((r) => (
                  <li key={r.example} className="rounded-lg border border-border">
                    <div className="flex h-9 items-center gap-3 px-3">
                      <VerdictBadge verdict={r.verdict} />
                      <span className="text-sm">{t("example", { n: r.example })}</span>
                      <span className="ml-auto font-mono text-xs text-fg-subtle tabular-nums">{r.timeMs} ms</span>
                    </div>
                    {r.verdict !== "AC" && (
                      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
                        <div className="bg-surface p-3">
                          <p className="mb-1 text-xs text-fg-subtle">{t("expected")}</p>
                          <pre className="font-mono text-sm">{r.expected}</pre>
                        </div>
                        <div className="bg-surface p-3">
                          <p className="mb-1 text-xs text-fg-subtle">{t("got")}</p>
                          <pre className="font-mono text-sm text-verdict-wa">{r.output}</pre>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        {mode.kind === "submit" && (
          <div className="flex flex-col gap-4">
            {!live || mode.id === null ? (
              <p className="flex items-center gap-2 text-fg-muted">
                <Spinner /> {t("submitting")}…
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <VerdictBadge verdict={live.verdict} full test={live.done ? (live.failedTest ?? undefined) : undefined} className="h-6 px-2.5 text-sm" />
                  <span className="font-mono text-sm text-fg-muted tabular-nums">
                    {live.totalTests
                      ? t("testOf", { n: live.done ? (live.failedTest ?? live.totalTests) : live.test, total: live.totalTests })
                      : t("queued")}
                  </span>
                  <Link href={`/submissions/${mode.id}`} className="ml-auto font-mono text-sm text-accent-text hover:underline">
                    #{mode.id}
                  </Link>
                </div>
                <TestStrip live={live} />
                {live.done && live.timeMs !== null && (
                  <dl className="flex gap-6 text-sm text-fg-muted">
                    <div className="flex items-center gap-1.5">
                      <dt>
                        <Clock aria-hidden className="size-4" />
                        <span className="sr-only">{t("time")}</span>
                      </dt>
                      <dd className="font-mono tabular-nums">{live.timeMs} ms</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt>
                        <MemoryStick aria-hidden className="size-4" />
                        <span className="sr-only">{t("memory")}</span>
                      </dt>
                      <dd className="font-mono tabular-nums">{formatNumber(live.memoryKb ?? 0)} KB</dd>
                    </div>
                  </dl>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
