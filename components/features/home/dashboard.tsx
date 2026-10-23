import { ArrowRight, Flame } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RegisterButton } from "@/components/features/contests/register-button";
import { TopRatingCard } from "@/components/features/widgets/top-rating";
import { PageContainer } from "@/components/shell/page";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Countdown } from "@/components/ui/countdown";
import { Difficulty, RankBadge, UserHandle } from "@/components/ui/rank";
import { RecentSubmissions } from "@/components/features/submissions/recent-list";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import type { Me } from "@/lib/api/types";
import { cn, formatNumber } from "@/lib/utils";

/** Signed-in home: what to do next, today's goal, the next contest. Personal data is fetched with the user's cookie. */
export async function Dashboard({ me, cookie }: { me: Me; cookie: string }) {
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("contests");
  const tCommon = await getTranslations("common");
  const from = Math.max(800, Math.floor((me.rating - 100) / 100) * 100);
  const to = from + 400;

  const [recommended, contests, recent] = await Promise.all([
    api.problems.list({ minDifficulty: from, maxDifficulty: to, status: "unsolved", sort: "-solved" }, { cookie }),
    api.contests.list({ kind: "contest" }, { cookie }),
    api.submissions.list({ user: me.username }, { cookie }),
  ]);
  const next = contests.filter((c) => c.status !== "finished").sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const lastFinished = contests.find((c) => c.status === "finished" && c.rated);
  const podium = lastFinished ? (await api.contests.standings(lastFinished.id, { revalidate: 300 })).rows.slice(0, 3) : [];
  const goalPct = Math.min(100, (me.solvedToday / me.dailyGoal) * 100);
  const firstName = me.displayName.split(" ")[0];

  return (
    <PageContainer>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("greeting", { name: firstName })}</h1>
          <p className="mt-1 flex items-center gap-2 text-fg-muted">
            {t("yourRank")}: <RankBadge rating={me.rating} showRating />
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {me.lastProblem && (
            <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-fg-muted">{t("continue")}</p>
                <p className="mt-0.5 truncate text-lg font-semibold">
                  <span className="font-mono text-fg-subtle">{me.lastProblem.id}.</span> {me.lastProblem.name}
                </p>
              </div>
              <Button asChild>
                <Link href={`/problems/${me.lastProblem.id}`}>
                  {t("openEditor")}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader
              title={t("recommended")}
              action={<span className="font-mono text-xs text-fg-subtle max-sm:hidden">{t("recommendedHint", { from, to })}</span>}
            />
            <table className="w-full border-collapse text-sm tabular-nums">
              <tbody>
                {recommended.results.slice(0, 6).map((p) => (
                  <tr key={p.id} className="group relative h-11 border-t border-border first:border-t-0 hover:bg-surface-2/60">
                    <td className="w-16 pl-4 font-mono text-fg-muted">{p.id}</td>
                    <td className="px-3">
                      <Link href={`/problems/${p.id}`} className="line-clamp-1 font-medium after:absolute after:inset-0 group-hover:text-accent-text">
                        {p.name}
                      </Link>
                    </td>
                    <td className="w-36 px-3">
                      <Difficulty rating={p.difficulty} />
                    </td>
                    <td className="w-24 pr-4 pl-3 text-right font-mono text-fg-muted max-sm:hidden">{formatNumber(p.solvedCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-4 py-2.5">
              <Link href={`/problems?min=${from}&max=${to}&status=unsolved`} className="text-sm text-accent-text hover:underline">
                {tCommon("seeAll")}
              </Link>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title={t("recentActivity")} />
            <RecentSubmissions items={recent.results.slice(0, 6)} />
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft">
                  <Flame aria-hidden className={cn("size-5", me.streak ? "fill-accent text-accent" : "text-fg-subtle")} />
                </span>
                <div>
                  <p className="font-semibold">{t("streak", { count: me.streak })}</p>
                  <p className="text-sm text-fg-muted">{t("streakHint")}</p>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-fg-muted">{t("dailyGoal")}</span>
                  <span className="font-mono tabular-nums">{t("dailyProgress", { done: me.solvedToday, goal: me.dailyGoal })}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={t("dailyGoal")}
                  aria-valuemin={0}
                  aria-valuemax={me.dailyGoal}
                  aria-valuenow={me.solvedToday}
                  className="h-2 overflow-hidden rounded-full bg-surface-2"
                >
                  <div className="h-full rounded-full bg-accent" style={{ width: `${goalPct}%` }} />
                </div>
              </div>
            </CardBody>
          </Card>

          {next && (
            <Card>
              <CardHeader title={t("nextContest")} />
              <CardBody className="flex flex-col gap-3">
                <Link href={`/contests/${next.id}`} className="font-medium hover:text-accent-text">
                  {next.name}
                </Link>
                <p className="flex items-center justify-between text-sm text-fg-muted">
                  {next.status === "running" ? tc("running") : tc("colCountdown")}
                  <Countdown
                    to={next.status === "running" ? new Date(new Date(next.startsAt).getTime() + next.durationMin * 60_000).toISOString() : next.startsAt}
                    className="font-medium text-fg"
                  />
                </p>
                {next.status === "upcoming" ? (
                  <RegisterButton contestId={next.id} name={next.name} />
                ) : (
                  <Button asChild size="sm">
                    <Link href={`/contests/${next.id}`}>{tc("enter")}</Link>
                  </Button>
                )}
              </CardBody>
            </Card>
          )}

          {lastFinished && podium.length === 3 && (
            <Card>
              <CardHeader title={t("lastContest")} />
              <CardBody>
                <p className="mb-4 truncate text-sm text-fg-muted">{lastFinished.name}</p>
                {/* Podium order 2-1-3; bar height encodes place. */}
                <ol className="grid grid-cols-3 items-end gap-2 text-center">
                  {[podium[1], podium[0], podium[2]].map((row) => (
                    <li key={row.user.username} className="flex min-w-0 flex-col items-center gap-1.5">
                      <UserHandle username={row.user.username} rating={row.user.rating} className="max-w-full truncate text-sm" />
                      <div
                        className={cn(
                          "flex w-full items-start justify-center rounded-t-[4px] border border-b-0 border-border bg-surface-2 pt-1.5 font-mono font-semibold",
                          row.rank === 1 ? "h-16 text-accent-text" : row.rank === 2 ? "h-12" : "h-9",
                        )}
                      >
                        {row.rank}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          )}

          <TopRatingCard />
        </aside>
      </div>
    </PageContainer>
  );
}
