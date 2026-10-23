"use client";

import { useEffect, useState } from "react";
import type { Standings, StandingsEvent } from "@/lib/api/types";
import { applyCell } from "@/lib/standings";
import { openSocket } from "./socket";

/** Live scoreboard: starts from the server-rendered snapshot, then applies ws events. */
export function useStandingsSocket(contestId: number, initial: Standings, live: boolean) {
  const [standings, setStandings] = useState(initial);
  const [lastChange, setLastChange] = useState<{ username: string; letter: string; at: number } | null>(null);

  useEffect(() => {
    if (!live) return;
    return openSocket<StandingsEvent>(
      `ws/contests/${contestId}/standings/`,
      (event) => {
        if (event.type === "snapshot") setStandings(event.standings);
        else {
          setStandings((s) => applyCell(s, event.username, event.cell));
          setLastChange({ username: event.username, letter: event.cell.letter, at: Date.now() });
        }
      },
      (cb) => {
        let close = () => {};
        // The mock's own snapshot matches the SSR one; skip it so the table doesn't re-render needlessly.
        void import("@/mocks/ws").then(
          (m) => (close = m.mockStandingsSocket(contestId, (e) => e.type !== "snapshot" && cb(e))),
        );
        return () => close();
      },
    );
  }, [contestId, live]);

  return { standings, lastChange };
}
