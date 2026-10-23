"use client";

import { useEffect, useState } from "react";
import type { SubmissionEvent, Verdict } from "@/lib/api/types";
import { openSocket } from "./socket";

export interface LiveSubmission {
  verdict: Verdict;
  test: number;
  totalTests: number | null;
  failedTest: number | null;
  timeMs: number | null;
  memoryKb: number | null;
  done: boolean;
}

const INITIAL: LiveSubmission = {
  verdict: "PENDING",
  test: 0,
  totalTests: null,
  failedTest: null,
  timeMs: null,
  memoryKb: null,
  done: false,
};

/** Live verdict and per-test progress from ws/submissions/{id}/. Pass null to stay idle. */
export function useSubmissionSocket(id: number | null, onDone?: (s: LiveSubmission) => void) {
  const [state, setState] = useState<LiveSubmission>(INITIAL);

  useEffect(() => {
    if (id === null) return;
    setState(INITIAL);
    return openSocket<SubmissionEvent>(
      `ws/submissions/${id}/`,
      (event) => {
        if (event.type === "progress") {
          setState((s) => ({ ...s, verdict: event.verdict, test: event.test, totalTests: event.totalTests }));
        } else {
          const final: LiveSubmission = {
            verdict: event.verdict,
            test: event.failedTest ?? event.totalTests,
            totalTests: event.totalTests,
            failedTest: event.failedTest,
            timeMs: event.timeMs,
            memoryKb: event.memoryKb,
            done: true,
          };
          setState(final);
          onDone?.(final);
        }
      },
      (cb) => {
        let close = () => {};
        void import("@/mocks/ws").then((m) => (close = m.mockSubmissionSocket(id, cb)));
        return () => close();
      },
    );
    // onDone is intentionally not a dependency: a new callback must not reopen the socket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return id === null ? null : state;
}
