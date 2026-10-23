"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { UserHandle } from "@/components/ui/rank";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import type { Paginated, Submission, SubmissionQuery, Verdict } from "@/lib/api/types";
import { useMe } from "@/lib/hooks/use-session";
import { qk } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/time";
import { cn, formatNumber } from "@/lib/utils";
import { VERDICTS } from "@/lib/verdict";
import { useSubmissionSocket } from "@/lib/ws/use-submission";

/** A row that is still being judged subscribes to its own socket and updates in place. */
function Row({ s, locale, hideUser }: { s: Submission; locale: string; hideUser?: boolean }) {
  const pending = s.verdict === "PENDING" || s.verdict === "RUNNING";
  const live = useSubmissionSocket(pending ? s.id : null);
  const verdict = live ? live.verdict : s.verdict;
  const test = live ? (live.done ? (live.failedTest ?? undefined) : live.test || undefined) : (s.failedTest ?? undefined);
  const timeMs = live?.done ? live.timeMs : s.timeMs;
  const memoryKb = live?.done ? live.memoryKb : s.memoryKb;

  return (
    <tr className="h-10 border-t border-border transition-colors duration-150 hover:bg-surface-2/60">
      <td className="pl-4 font-mono">
        <Link href={`/submissions/${s.id}`} className="text-fg-muted hover:text-accent-text hover:underline">
          {s.id}
        </Link>
      </td>
      <td className="px-3 font-mono whitespace-nowrap text-fg-muted max-md:hidden">{formatDateTime(s.createdAt, locale)}</td>
      {!hideUser && (
        <td className="px-3">
          <UserHandle username={s.user.username} rating={s.user.rating} />
        </td>
      )}
      <td className="max-w-64 px-3">
        <Link href={`/problems/${s.problem.id}`} className="block truncate hover:text-accent-text">
          <span className="font-mono text-fg-muted">{s.problem.id}</span> {s.problem.name}
        </Link>
      </td>
      <td className="px-3 whitespace-nowrap text-fg-muted max-lg:hidden">{s.language}</td>
      <td className="px-3">
        <VerdictBadge verdict={verdict} test={verdict === "AC" || verdict === "CE" ? undefined : test} />
      </td>
      <td className="px-3 text-right font-mono text-fg-muted max-sm:hidden">{timeMs ?? "—"}</td>
      <td className="pr-4 pl-3 text-right font-mono text-fg-muted max-md:hidden">{memoryKb !== null && memoryKb !== undefined ? formatNumber(memoryKb) : "—"}</td>
    </tr>
  );
}

const FILTERABLE: Verdict[] = ["AC", "WA", "TLE", "MLE", "RE", "CE"];

export function SubmissionsTable({
  initial,
  baseQuery,
  mineOnly,
  hideUser,
}: {
  initial?: Paginated<Submission>;
  baseQuery: SubmissionQuery;
  /** Show only the signed-in user's submissions (resolved on the client). */
  mineOnly?: boolean;
  hideUser?: boolean;
}) {
  const t = useTranslations("submissions");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: me, isPending: meLoading } = useMe();
  const [page, setPage] = useState(1);
  const [verdict, setVerdict] = useState<Verdict | undefined>(baseQuery.verdict);

  const query: SubmissionQuery = { ...baseQuery, verdict, page, ...(mineOnly && me ? { user: me.username } : {}) };
  const enabled = !mineOnly || !!me;
  const list = useQuery({
    queryKey: qk.submissions(query),
    queryFn: ({ signal }) => api.submissions.list(query, { signal }),
    enabled,
    initialData: !mineOnly && page === 1 && verdict === baseQuery.verdict ? initial : undefined,
    placeholderData: keepPreviousData,
    refetchInterval: 15_000, // new submissions keep flowing in
  });

  if (mineOnly && !meLoading && !me) {
    return (
      <Card>
        <EmptyState
          icon={<Inbox />}
          title={tc("signInToSee")}
          action={
            <Button asChild size="sm">
              <Link href="/login?next=/submissions?tab=mine">{tc("signIn")}</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const data = list.data;
  const pages = data ? Math.max(1, Math.ceil(data.count / data.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Select
          aria-label={t("verdictFilter")}
          value={verdict ?? ""}
          onChange={(e) => {
            setVerdict((e.target.value || undefined) as Verdict | undefined);
            setPage(1);
          }}
        >
          <option value="">
            {t("colVerdict")}: {tc("all")}
          </option>
          {FILTERABLE.map((v) => (
            <option key={v} value={v}>
              {v} — {VERDICTS[v].label}
            </option>
          ))}
        </Select>
        {data && (
          <p className="text-sm text-fg-subtle tabular-nums">{formatNumber(data.count)}</p>
        )}
      </div>

      {list.isError && !data ? (
        <ErrorState
          title={tc("errorTitle")}
          description={tc("errorBody")}
          action={
            <Button size="sm" variant="secondary" onClick={() => void list.refetch()}>
              {tc("retry")}
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className={cn("w-full border-collapse text-sm tabular-nums transition-opacity duration-150", list.isPlaceholderData && "opacity-60")}>
              <thead className="bg-surface-2">
                <tr className="h-8 text-left text-xs text-fg-muted">
                  <th scope="col" className="w-24 pl-4 font-medium">{t("colId")}</th>
                  <th scope="col" className="px-3 font-medium max-md:hidden">{t("colTime")}</th>
                  {!hideUser && <th scope="col" className="px-3 font-medium">{t("colUser")}</th>}
                  <th scope="col" className="px-3 font-medium">{t("colProblem")}</th>
                  <th scope="col" className="px-3 font-medium max-lg:hidden">{t("colLanguage")}</th>
                  <th scope="col" className="px-3 font-medium">{t("colVerdict")}</th>
                  <th scope="col" className="px-3 text-right font-medium max-sm:hidden">{t("colRuntime")}</th>
                  <th scope="col" className="pr-4 pl-3 text-right font-medium max-md:hidden">{t("colMemory")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.results.map((s) => (
                  <Row key={s.id} s={s} locale={locale} hideUser={hideUser} />
                ))}
              </tbody>
            </table>
          </div>
          {!data &&
            Array.from({ length: 10 }, (_, i) => (
              <div key={i} aria-hidden className="flex h-10 items-center gap-4 border-t border-border px-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            ))}
          {data && !data.results.length && (
            <EmptyState
              icon={<Inbox />}
              title={t("emptyTitle")}
              description={t("emptyBody")}
              action={
                <Button asChild size="sm">
                  <Link href="/problems">{t("goProblems")}</Link>
                </Button>
              }
            />
          )}
          {data && pages > 1 && (
            <div className="flex h-12 items-center justify-between border-t border-border px-4">
              <span className="text-sm text-fg-subtle">{tc("pageOf", { page, total: pages })}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft aria-hidden />
                  {tc("prev")}
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  {tc("next")}
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
