import { CircleCheck, CircleDot } from "lucide-react";
import type { ProblemStatus } from "@/lib/api/types";

/** Solved / attempted marker used in every problem list. Reserves 16px when empty. */
export function StatusIcon({ status, labels }: { status: ProblemStatus | undefined; labels: { solved: string; attempted: string } }) {
  if (status === "solved") return <CircleCheck role="img" aria-label={labels.solved} className="size-4 text-verdict-ac" />;
  if (status === "attempted") return <CircleDot role="img" aria-label={labels.attempted} className="size-4 text-verdict-tle" />;
  return <span aria-hidden className="block size-4" />;
}
