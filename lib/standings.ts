import type { Standings, StandingsCell } from "./api/types";

/** Sort rows, assign shared ranks (ties share a place) and mark first solves. */
export function finalizeStandings(st: Standings): Standings {
  const ioi = st.format === "IOI";
  const rows = [...st.rows].sort((a, b) => (ioi ? b.score - a.score : b.solved - a.solved || a.penalty - b.penalty));
  const ranked = rows.map((row) => ({ ...row }));
  ranked.forEach((row, i) => {
    const prev = ranked[i - 1];
    const tie = prev && (ioi ? prev.score === row.score : prev.solved === row.solved && prev.penalty === row.penalty);
    row.rank = tie ? prev.rank : i + 1;
  });
  st.problems.forEach((_, pi) => {
    let bestRow = -1;
    let bestTime = Infinity;
    ranked.forEach((row, ri) => {
      const c = row.cells[pi];
      if (c.result === "accepted" && (c.timeMin ?? Infinity) < bestTime) {
        bestTime = c.timeMin ?? Infinity;
        bestRow = ri;
      }
    });
    ranked.forEach((row, ri) => {
      const c = row.cells[pi];
      if (c.firstSolve !== (ri === bestRow)) {
        row.cells = row.cells.map((x, i) => (i === pi ? { ...x, firstSolve: ri === bestRow } : x));
      }
    });
  });
  return { ...st, rows: ranked };
}

/** Apply a live cell update from ws/contests/{id}/standings/ and re-rank. */
export function applyCell(st: Standings, username: string, cell: StandingsCell): Standings {
  const ioi = st.format === "IOI";
  const rows = st.rows.map((row) => {
    if (row.user.username !== username) return row;
    const cells = row.cells.map((c) => (c.letter === cell.letter ? cell : c));
    return {
      ...row,
      cells,
      solved: cells.filter((c) => c.result === "accepted").length,
      penalty: ioi ? 0 : cells.reduce((s, c) => (c.result === "accepted" ? s + (c.timeMin ?? 0) + 20 * c.attempts : s), 0),
      score: cells.reduce((s, c) => s + (c.score ?? 0), 0),
    };
  });
  return finalizeStandings({ ...st, rows, updatedAt: new Date().toISOString() });
}
