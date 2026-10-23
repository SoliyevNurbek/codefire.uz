/**
 * Simulated Django Channels sockets. Same message shapes as the real
 * ws/submissions/{id}/ and ws/contests/{id}/standings/ (see lib/api/types.ts).
 */
import type { StandingsEvent, SubmissionEvent } from "@/lib/api/types";
import { applyCell } from "@/lib/standings";
import { judgeOutcome as outcome, ME_USERNAME, standings } from "./data";

type Listener<T> = (event: T) => void;

export function mockSubmissionSocket(id: number, onEvent: Listener<SubmissionEvent>) {
  const { verdict, failedTest, total } = outcome(id);
  const lastTest = failedTest ?? total;
  const timers: ReturnType<typeof setTimeout>[] = [];

  timers.push(setTimeout(() => onEvent({ type: "progress", verdict: "PENDING", test: 0, totalTests: total }), 50));
  for (let t = 1; t <= lastTest; t++) {
    timers.push(
      setTimeout(() => onEvent({ type: "progress", verdict: "RUNNING", test: t, totalTests: total }), 500 + t * 110),
    );
  }
  timers.push(
    setTimeout(
      () =>
        onEvent({
          type: "result",
          verdict,
          failedTest,
          timeMs: verdict === "TLE" ? 2000 : 31 + (id % 180),
          memoryKb: 3200 + (id % 9000),
          totalTests: total,
        }),
      700 + lastTest * 110,
    ),
  );
  return () => timers.forEach(clearTimeout);
}

export function mockStandingsSocket(contestId: number, onEvent: Listener<StandingsEvent>) {
  let current = standings(contestId);
  if (!current) return () => {};
  onEvent({ type: "snapshot", standings: current });

  // Every few seconds someone outside the top 10 gets a verdict.
  const interval = setInterval(() => {
    if (!current) return;
    const rows = current.rows;
    const row = rows[10 + Math.floor(Math.random() * Math.min(120, rows.length - 10))];
    if (!row || row.user.username === ME_USERNAME) return;
    const open = row.cells.filter((c) => c.result !== "accepted");
    const cell = open[Math.floor(Math.random() * open.length)];
    if (!cell) return;
    const elapsed = Math.max(...rows.flatMap((r) => r.cells.map((c) => c.timeMin ?? 0)));
    const updated = current.frozen
      ? { ...cell, result: "pending" as const, attempts: cell.attempts + 1, timeMin: elapsed }
      : Math.random() < 0.6
        ? { ...cell, result: "accepted" as const, timeMin: elapsed }
        : { ...cell, result: "rejected" as const, attempts: cell.attempts + 1, timeMin: elapsed };
    current = applyCell(current, row.user.username, updated);
    onEvent({ type: "cell", username: row.user.username, cell: updated });
  }, 3500);

  return () => clearInterval(interval);
}
