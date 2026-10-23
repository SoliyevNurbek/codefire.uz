"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Crosshair, Snowflake } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserHandle } from "@/components/ui/rank";
import { Link } from "@/i18n/navigation";
import type { ContestProblem, Standings, StandingsCell } from "@/lib/api/types";
import { useMe } from "@/lib/hooks/use-session";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useStandingsSocket } from "@/lib/ws/use-standings";

const ROW = 44;

function IcpcCell({ cell }: { cell: StandingsCell }) {
  if (!cell.result) return null;
  if (cell.result === "accepted")
    return (
      <>
        <span className="font-semibold">+{cell.attempts || ""}</span>
        <span className="text-2xs opacity-75">{formatDuration(cell.timeMin ?? 0)}</span>
      </>
    );
  if (cell.result === "pending")
    return (
      <>
        <span className="font-semibold">?{cell.attempts}</span>
        <span className="text-2xs opacity-75">{formatDuration(cell.timeMin ?? 0)}</span>
      </>
    );
  return <span className="font-semibold">−{cell.attempts}</span>;
}

function cellTone(cell: StandingsCell, ioi: boolean) {
  if (!cell.result) return "";
  if (ioi) {
    const score = cell.score ?? 0;
    return score === 100 ? "bg-verdict-ac/10 text-verdict-ac" : score === 0 ? "bg-verdict-wa/10 text-verdict-wa" : "bg-verdict-tle/10 text-verdict-tle";
  }
  if (cell.result === "accepted") return cell.firstSolve ? "bg-verdict-ac/25 text-verdict-ac" : "bg-verdict-ac/10 text-verdict-ac";
  if (cell.result === "pending") return "bg-surface-2 text-fg-muted";
  return "bg-verdict-wa/10 text-verdict-wa";
}

export function StandingsTable({
  contestId,
  initial,
  problems,
  live,
}: {
  contestId: number;
  initial: Standings;
  problems: ContestProblem[];
  live: boolean;
}) {
  const t = useTranslations("contest");
  const tc = useTranslations("common");
  const { data: me } = useMe();
  const { standings, lastChange } = useStandingsSocket(contestId, initial, live);
  const ioi = standings.format === "IOI";
  const rows = standings.rows;

  // Briefly mark the cell that just changed, so live updates are noticeable but calm.
  const [flash, setFlash] = useState<string | null>(null);
  useEffect(() => {
    if (!lastChange) return;
    setFlash(`${lastChange.username}:${lastChange.letter}`);
    const timer = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(timer);
  }, [lastChange]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW,
    overscan: 10,
    initialRect: { width: 1200, height: 720 },
  });
  const items = virtualizer.getVirtualItems();
  const myIndex = me ? rows.findIndex((r) => r.user.username === me.username) : -1;

  const padTop = items[0]?.start ?? 0;
  const padBottom = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0;
  const cols = 3 + (ioi ? 0 : 1) + problems.length;

  return (
    <div className="flex flex-col gap-3">
      {standings.frozen && (
        <div role="status" className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
          <Snowflake aria-hidden className="mt-0.5 size-4 shrink-0 text-rank-inferno" />
          <div>
            <p className="font-medium">{t("frozen")}</p>
            <p className="text-sm text-fg-muted">{t("frozenBody")}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-fg-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-3 rounded-sm bg-verdict-ac/25 ring-1 ring-verdict-ac/40" />
            {t("firstSolve")}
          </span>
          {live && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-accent" />
              {tc("updatedLive")}
            </span>
          )}
        </div>
        {myIndex >= 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => virtualizer.scrollToIndex(myIndex, { align: "center" })}
          >
            <Crosshair aria-hidden />
            {t("jumpToMe")} · #{rows[myIndex].rank}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div ref={scrollRef} className="max-h-[calc(100dvh-var(--chrome)-14rem)] min-h-[360px] overflow-auto overscroll-contain">
          <table className="w-full border-separate border-spacing-0 text-sm tabular-nums">
            <thead className="sticky top-0 z-20">
              <tr className="h-11 bg-surface-2 text-xs text-fg-muted">
                <th scope="col" className="sticky left-0 z-10 w-14 border-b border-border bg-surface-2 pl-4 text-left font-medium">
                  {t("colRank")}
                </th>
                <th scope="col" className="sticky left-14 z-10 min-w-48 border-r border-b border-border bg-surface-2 px-3 text-left font-medium">
                  {t("colParticipant")}
                </th>
                <th scope="col" className="w-16 border-b border-border px-2 text-center font-medium">
                  {ioi ? t("colScore") : t("colSolved")}
                </th>
                {!ioi && (
                  <th scope="col" className="w-20 border-r border-b border-border px-2 text-center font-medium">
                    {t("colPenalty")}
                  </th>
                )}
                {problems.map((p) => (
                  <th key={p.letter} scope="col" className="w-16 min-w-16 border-b border-border px-1 text-center font-medium">
                    <Link href={`/problems/${p.problemId}`} title={p.name} className="flex flex-col items-center hover:text-accent-text">
                      <span className="font-mono text-sm text-fg">{p.letter}</span>
                      <span className="text-2xs">{p.solvedCount}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {padTop > 0 && (
                <tr aria-hidden>
                  <td colSpan={cols} style={{ height: padTop }} />
                </tr>
              )}
              {items.map((item) => {
                const row = rows[item.index];
                const mine = item.index === myIndex;
                const bg = mine ? "bg-accent-soft" : "bg-surface";
                return (
                  <tr key={row.user.username} style={{ height: ROW }} className={cn("group", mine && "font-medium")}>
                    <td className={cn("sticky left-0 z-10 border-b border-border pl-4 font-mono text-fg-muted", bg)}>{row.rank}</td>
                    <td className={cn("sticky left-14 z-10 max-w-56 border-r border-b border-border px-3", bg)}>
                      <span className="flex items-center gap-1.5 truncate">
                        <UserHandle username={row.user.username} rating={row.user.rating} className="truncate" />
                        {mine && <span className="rounded-full bg-accent px-1.5 text-2xs font-medium text-accent-on">{tc("you")}</span>}
                      </span>
                    </td>
                    <td className={cn("border-b border-border px-2 text-center font-mono font-semibold", bg)}>
                      {ioi ? row.score : row.solved}
                    </td>
                    {!ioi && <td className={cn("border-r border-b border-border px-2 text-center font-mono text-fg-muted", bg)}>{row.penalty}</td>}
                    {row.cells.map((cell) => (
                      <td key={cell.letter} className={cn("border-b border-border p-0.5", bg)}>
                        <div
                          title={cell.firstSolve ? t("firstSolve") : undefined}
                          className={cn(
                            "flex h-9 flex-col items-center justify-center rounded-md font-mono text-sm leading-tight transition-shadow duration-200",
                            cellTone(cell, ioi),
                            cell.firstSolve && "ring-1 ring-verdict-ac/50",
                            flash === `${row.user.username}:${cell.letter}` && "ring-2 ring-accent",
                          )}
                        >
                          {ioi ? cell.result !== null && <span className="font-semibold">{cell.score}</span> : <IcpcCell cell={cell} />}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
              {padBottom > 0 && (
                <tr aria-hidden>
                  <td colSpan={cols} style={{ height: padBottom }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
