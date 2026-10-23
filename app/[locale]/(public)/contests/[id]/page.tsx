import { CalendarClock, Megaphone, MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContestBadges } from "@/components/features/contests/contest-badges";
import { RegisterButton } from "@/components/features/contests/register-button";
import { StandingsTable } from "@/components/features/contests/standings-table";
import { Markdown } from "@/components/features/markdown";
import { MyStatus } from "@/components/features/my-status";
import { SubmissionsTable } from "@/components/features/submissions/submissions-table";
import { Breadcrumbs, PageContainer, PageHeader } from "@/components/shell/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Countdown } from "@/components/ui/countdown";
import { LinkTabs } from "@/components/ui/link-tabs";
import { UserHandle } from "@/components/ui/rank";
import { EmptyState } from "@/components/ui/state";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { api } from "@/lib/api/endpoints";
import type { ContestDetail } from "@/lib/api/types";
import { formatDateTime, formatDuration } from "@/lib/time";
import { cn, formatNumber } from "@/lib/utils";

type Params = Promise<{ locale: string; id: string }>;
const TABS = ["problems", "standings", "my", "announcements", "ratings"] as const;
type Tab = (typeof TABS)[number];

export const revalidate = 15;

async function getContest(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  try {
    return await api.contests.get(n, { revalidate: 15 });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const c = await getContest(id);
  return { title: c.name };
}

async function InfoCard({ contest, locale }: { contest: ContestDetail; locale: string }) {
  const t = await getTranslations();
  const rows: [string, React.ReactNode][] = [
    [t("contests.colStart"), <span key="s" className="font-mono">{formatDateTime(contest.startsAt, locale)}</span>],
    [t("contests.colDuration"), <span key="d" className="font-mono">{formatDuration(contest.durationMin)}</span>],
    [t("contest.format"), <span key="f" className="font-mono">{contest.format}</span>],
    [t("contests.colParticipants"), <span key="p" className="font-mono">{formatNumber(contest.participants)}</span>],
    [
      t("contests.colAuthors"),
      <span key="a" className="flex flex-col items-end">
        {contest.authors.map((a) => (
          <UserHandle key={a.username} username={a.username} rating={a.rating} />
        ))}
      </span>,
    ],
  ];
  return (
    <Card>
      <dl className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex min-h-10 items-center justify-between gap-4 px-4 py-2 text-sm">
            <dt className="text-fg-muted">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      {contest.description && <p className="border-t border-border px-4 py-3 text-sm text-fg-muted">{contest.description}</p>}
    </Card>
  );
}

export default async function ContestPage({ params, searchParams }: { params: Params; searchParams: Promise<{ tab?: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contest");
  const tc = await getTranslations("contests");
  const tp = await getTranslations("problems");
  const contest = await getContest(id);
  const requested = (await searchParams).tab as Tab | undefined;

  const start = new Date(contest.startsAt).getTime();
  const end = new Date(start + contest.durationMin * 60_000).toISOString();
  const running = contest.status === "running";
  const upcoming = contest.status === "upcoming";
  const tab: Tab = requested && TABS.includes(requested) ? requested : running ? "problems" : "standings";
  const standings = !upcoming && tab === "standings" ? await api.contests.standings(contest.id, { revalidate: 15 }) : null;

  const header = (
    <PageHeader
      breadcrumbs={<Breadcrumbs items={[{ label: tc("title"), href: "/contests" }, { label: contest.name }]} />}
      title={contest.name}
      description={
        <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <ContestBadges contest={contest} />
          <span className="text-sm">
            {t("participants", { count: formatNumber(contest.participants) })}
          </span>
        </span>
      }
      actions={
        upcoming ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-fg-muted">
              {t("startsIn")} <Countdown to={contest.startsAt} className="font-medium text-fg" />
            </span>
            <RegisterButton contestId={contest.id} name={contest.name} size="md" />
          </div>
        ) : running && contest.kind === "contest" ? (
          <span className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm">
            <span aria-hidden className="size-2 rounded-full bg-accent" />
            {t("endsIn")} <Countdown to={end} className="font-semibold text-fg" />
          </span>
        ) : contest.kind === "contest" ? (
          <span className="text-sm text-fg-muted">
            {t("finishedAt")}: <span className="font-mono">{formatDateTime(end, locale, { year: true })}</span>
          </span>
        ) : null
      }
    />
  );

  if (upcoming) {
    return (
      <PageContainer>
        {header}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <EmptyState
              icon={<CalendarClock />}
              title={t("notStarted")}
              description={t("notStartedBody")}
              action={<Countdown to={contest.startsAt} className="text-3xl font-semibold tracking-tight text-fg" />}
              className="py-16"
            />
          </Card>
          <InfoCard contest={contest} locale={locale} />
        </div>
      </PageContainer>
    );
  }

  const tabs = [
    { key: "problems", label: t("problems"), href: `/contests/${contest.id}` + (running ? "" : "?tab=problems") },
    { key: "standings", label: t("standings"), href: `/contests/${contest.id}?tab=standings` },
    { key: "my", label: t("mySubmissions"), href: `/contests/${contest.id}?tab=my` },
    {
      key: "announcements",
      label: t("announcements"),
      href: `/contests/${contest.id}?tab=announcements`,
      count: contest.announcements.length + contest.clarifications.length || undefined,
    },
    ...(contest.ratingChanges ? [{ key: "ratings", label: t("ratingChanges"), href: `/contests/${contest.id}?tab=ratings` }] : []),
  ];

  const maxSolved = Math.max(1, ...contest.problems.map((p) => p.solvedCount));

  return (
    <PageContainer wide={tab === "standings"}>
      {header}
      <LinkTabs label={contest.name} tabs={tabs} active={tab} className="mb-5" />

      {tab === "problems" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="overflow-hidden">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead className="bg-surface-2">
                <tr className="h-8 text-left text-xs text-fg-muted">
                  <th scope="col" className="w-10 pl-4 font-medium">
                    <span className="sr-only">{tp("status")}</span>
                  </th>
                  <th scope="col" className="w-12 px-3 font-medium">{t("colLetter")}</th>
                  <th scope="col" className="px-3 font-medium">{tc("colName")}</th>
                  <th scope="col" className="w-48 px-3 font-medium max-sm:hidden">{t("colSolved")}</th>
                  <th scope="col" className="w-24 pr-4 pl-3 text-right font-medium">{t("colAttempted")}</th>
                </tr>
              </thead>
              <tbody>
                {contest.problems.map((p) => (
                  <tr key={p.letter} className="group relative h-12 border-t border-border hover:bg-surface-2/60">
                    <td className="pl-4">
                      <MyStatus problemId={p.problemId} />
                    </td>
                    <td className="px-3 font-mono text-md font-semibold">{p.letter}</td>
                    <td className="px-3">
                      <Link href={`/problems/${p.problemId}`} className="font-medium after:absolute after:inset-0 group-hover:text-accent-text">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 max-sm:hidden">
                      <span className="flex items-center gap-2">
                        <span aria-hidden className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-3">
                          <span className="block h-full rounded-full bg-verdict-ac" style={{ width: `${(p.solvedCount / maxSolved) * 100}%` }} />
                        </span>
                        <span className="font-mono text-fg-muted">{p.solvedCount}</span>
                      </span>
                    </td>
                    <td className="pr-4 pl-3 text-right font-mono text-fg-muted">{p.attemptedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <aside className="flex flex-col gap-6">
            <InfoCard contest={contest} locale={locale} />
            {contest.announcements[0] && (
              <Card>
                <CardHeader title={t("announcements")} />
                <div className="flex gap-3 p-4">
                  <Megaphone aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-text" />
                  <div className="text-sm">
                    <Markdown compact>{contest.announcements[0].text}</Markdown>
                    <p className="mt-1 font-mono text-xs text-fg-subtle">{formatDateTime(contest.announcements[0].at, locale)}</p>
                  </div>
                </div>
              </Card>
            )}
          </aside>
        </div>
      )}

      {tab === "standings" && standings && (
        <StandingsTable contestId={contest.id} initial={standings} problems={contest.problems} live={running} />
      )}

      {tab === "my" && <SubmissionsTable baseQuery={{ contest: contest.id }} mineOnly hideUser />}

      {tab === "announcements" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title={t("announcements")} />
            {contest.announcements.length ? (
              <ul className="divide-y divide-border">
                {contest.announcements.map((a) => (
                  <li key={a.id} className="flex gap-3 px-4 py-3">
                    <Megaphone aria-hidden className="mt-1 size-4 shrink-0 text-accent-text" />
                    <div className="min-w-0">
                      <Markdown compact>{a.text}</Markdown>
                      <p className="mt-1 font-mono text-xs text-fg-subtle">{formatDateTime(a.at, locale)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-fg-muted">{t("noAnnouncements")}</p>
            )}
          </Card>
          <Card>
            <CardHeader title={t("clarifications")} />
            {contest.clarifications.length ? (
              <ul className="divide-y divide-border">
                {contest.clarifications.map((c) => (
                  <li key={c.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <MessageCircleQuestion aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" mono>
                            {c.problemLetter ?? t("general")}
                          </Badge>
                          <span className="font-medium">{c.question}</span>
                        </p>
                        <p className={cn("mt-1.5", c.answer ? "text-fg" : "text-fg-subtle italic")}>
                          {c.answer ?? t("awaitingAnswer")}
                        </p>
                        <p className="mt-1 font-mono text-xs text-fg-subtle">{formatDateTime(c.at, locale)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-fg-muted">{t("noClarifications")}</p>
            )}
          </Card>
        </div>
      )}

      {tab === "ratings" &&
        (contest.ratingChanges ? (
          <Card className="overflow-hidden">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead className="bg-surface-2">
                <tr className="h-8 text-left text-xs text-fg-muted">
                  <th scope="col" className="w-16 pl-4 font-medium">{t("colRank")}</th>
                  <th scope="col" className="px-3 font-medium">{t("colParticipant")}</th>
                  <th scope="col" className="px-3 text-right font-medium max-sm:hidden">{t("colOld")}</th>
                  <th scope="col" className="px-3 text-right font-medium">{t("colNew")}</th>
                  <th scope="col" className="pr-4 pl-3 text-right font-medium">{t("colDelta")}</th>
                </tr>
              </thead>
              <tbody>
                {contest.ratingChanges.map((r) => {
                  const delta = r.newRating - r.oldRating;
                  return (
                    <tr key={r.user.username} className="h-10 border-t border-border hover:bg-surface-2/60">
                      <td className="pl-4 font-mono text-fg-muted">{r.rank}</td>
                      <td className="px-3">
                        <UserHandle username={r.user.username} rating={r.newRating} />
                      </td>
                      <td className="px-3 text-right font-mono text-fg-muted max-sm:hidden">{r.oldRating}</td>
                      <td className="px-3 text-right font-mono">{r.newRating}</td>
                      <td className={cn("pr-4 pl-3 text-right font-mono font-semibold", delta > 0 ? "text-verdict-ac" : delta < 0 ? "text-verdict-wa" : "text-fg-muted")}>
                        {delta > 0 ? `+${delta}` : delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <p className="text-fg-muted">{t("noRatingChanges")}</p>
        ))}
    </PageContainer>
  );
}
