"use client";

import { useTranslations } from "next-intl";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { useRouter } from "@/i18n/navigation";
import type { Verdict } from "@/lib/api/types";
import { useSubmissionSocket } from "@/lib/ws/use-submission";

/** On a submission that is still being judged: live verdict, then a refresh to load the final tests. */
export function LiveStatus({ id, verdict }: { id: number; verdict: Verdict }) {
  const t = useTranslations("problem");
  const router = useRouter();
  const live = useSubmissionSocket(verdict === "PENDING" || verdict === "RUNNING" ? id : null, () => router.refresh());
  if (!live) return <VerdictBadge verdict={verdict} full />;
  return (
    <span className="inline-flex items-center gap-2">
      <VerdictBadge verdict={live.verdict} full test={live.done ? (live.failedTest ?? undefined) : undefined} />
      {!live.done && live.totalTests && (
        <span className="font-mono text-sm text-fg-muted tabular-nums">{t("testOf", { n: live.test, total: live.totalTests })}</span>
      )}
    </span>
  );
}
