import { Award, CalendarDays, Flame, GraduationCap, MapPin, Shield } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActivityHeatmap } from "@/components/features/profile/activity-heatmap";
import { DifficultyBars, HBars } from "@/components/features/profile/breakdowns";
import { FollowButton } from "@/components/features/profile/follow-button";
import { RatingChartLazy } from "@/components/features/profile/rating-chart-lazy";
import { RecentSubmissions } from "@/components/features/submissions/recent-list";
import { PageContainer } from "@/components/shell/page";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/misc";
import { RankBadge } from "@/components/ui/rank";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { api } from "@/lib/api/endpoints";
import { RANK_TEXT, rankForRating } from "@/lib/rank";
import { formatDate } from "@/lib/time";
import { cn, formatNumber } from "@/lib/utils";

type Params = Promise<{ locale: string; username: string }>;

export const revalidate = 120;

async function getUser(username: string) {
  try {
    return await api.users.get(username, { revalidate: 120 });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const u = await getUser(username);
  return { title: `${u.username} (${u.displayName})`, description: `${rankForRating(u.rating).name} · ${u.rating}` };
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { locale, username } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  const [user, history, activity, recent] = await Promise.all([
    getUser(username),
    api.users.ratingHistory(username, { revalidate: 300 }),
    api.users.activity(username, { revalidate: 300 }),
    api.submissions.list({ user: username }, { revalidate: 30 }),
  ]);
  const rank = rankForRating(user.rating);
  const maxRank = rankForRating(user.maxRating);

  const stats: [string, React.ReactNode][] = [
    [t("rating"), <span key="r" className={RANK_TEXT[rank.id]}>{user.rating}</span>],
    [t("maxRating"), <span key="m" className={RANK_TEXT[maxRank.id]}>{user.maxRating}</span>],
    [t("solved"), formatNumber(user.solvedCount)],
    [t("contests"), user.contestsCount],
    [
      t("streak"),
      <span key="s" className="inline-flex items-center gap-1">
        <Flame aria-hidden className={cn("size-5", user.streak ? "fill-accent text-accent" : "text-fg-subtle")} />
        {user.streak}
      </span>,
    ],
    [t("contribution"), user.contribution > 0 ? `+${user.contribution}` : user.contribution],
  ];

  return (
    <PageContainer>
      {/* Identity */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={user.displayName} size={96} className="text-3xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className={cn("text-2xl font-semibold tracking-tight", RANK_TEXT[rank.id])}>{user.username}</h1>
            <RankBadge rating={user.rating} />
          </div>
          <p className="mt-0.5 text-md text-fg">{user.displayName}</p>
          {user.bio && <p className="mt-2 max-w-[60ch] text-fg-muted">{user.bio}</p>}
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-fg-muted">
            {user.region && (
              <li className="flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4 text-fg-subtle" />
                {user.region}, <span className="font-mono text-xs">{user.country}</span>
              </li>
            )}
            {user.school && (
              <li className="flex items-center gap-1.5">
                <GraduationCap aria-hidden className="size-4 text-fg-subtle" />
                {user.school}
              </li>
            )}
            {user.clan && (
              <li className="flex items-center gap-1.5">
                <Shield aria-hidden className="size-4 text-fg-subtle" />
                <Link href={`/clans/${user.clan.slug}`} className="text-fg hover:text-accent-text">
                  {user.clan.name}
                </Link>
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-4 text-fg-subtle" />
              {t("joined", { date: formatDate(user.joinedAt, locale) })}
            </li>
          </ul>
        </div>
        <FollowButton username={user.username} />
      </section>

      {/* Key numbers */}
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-surface px-4 py-3">
            <dt className="text-xs text-fg-muted">{label}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title={t("ratingHistory")} />
            <CardBody>{history.length >= 2 ? <RatingChartLazy points={history} /> : <p className="text-fg-muted">{t("noRatingHistory")}</p>}</CardBody>
          </Card>
          <Card>
            <CardHeader title={t("activity")} />
            <CardBody>
              <ActivityHeatmap days={activity} />
            </CardBody>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title={t("recentSubmissions")} />
            <RecentSubmissions items={recent.results.slice(0, 10)} />
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title={t("byDifficulty")} />
            <CardBody>
              <DifficultyBars data={user.difficultyStats} label={t("byDifficulty")} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={t("byTag")} />
            <CardBody>
              <HBars data={user.tagStats.map((s) => ({ label: s.tag, value: s.solved }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={t("languages")} />
            <CardBody>
              <HBars data={user.languages.map((l) => ({ label: l.language, value: l.count }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={t("achievements")} />
            <ul className="divide-y divide-border">
              {user.achievements.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-accent-soft text-accent-text">
                    <Award aria-hidden className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-fg-muted">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
