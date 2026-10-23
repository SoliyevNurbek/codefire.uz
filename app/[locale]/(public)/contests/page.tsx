import { CalendarClock, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContestBadges } from "@/components/features/contests/contest-badges";
import { RegisterButton } from "@/components/features/contests/register-button";
import { PageContainer, PageHeader } from "@/components/shell/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Countdown } from "@/components/ui/countdown";
import { LinkTabs } from "@/components/ui/link-tabs";
import { UserHandle } from "@/components/ui/rank";
import { EmptyState } from "@/components/ui/state";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import type { Contest } from "@/lib/api/types";
import { formatDateTime, formatDuration } from "@/lib/time";
import { formatNumber } from "@/lib/utils";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contests" });
  return { title: t("title"), description: t("description") };
}

const endOf = (c: Contest) => new Date(new Date(c.startsAt).getTime() + c.durationMin * 60_000).toISOString();

async function ContestTable({ contests, mode, locale }: { contests: Contest[]; mode: "running" | "upcoming" | "finished" | "training"; locale: string }) {
  const t = await getTranslations("contests");
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm tabular-nums md:table-fixed">
        <thead className="bg-surface-2">
          <tr className="h-8 text-left text-xs text-fg-muted">
            <th scope="col" className="pl-4 font-medium">{t("colName")}</th>
            {mode !== "training" && <th scope="col" className="w-40 px-3 font-medium max-lg:hidden">{t("colAuthors")}</th>}
            {mode !== "training" && <th scope="col" className="w-36 px-3 font-medium max-md:hidden">{t("colStart")}</th>}
            {mode !== "training" && <th scope="col" className="w-28 px-3 font-medium max-sm:hidden">{t("colDuration")}</th>}
            {mode === "upcoming" || mode === "running" ? (
              <th scope="col" className="w-40 px-3 font-medium">{t("colCountdown")}</th>
            ) : (
              <th scope="col" className="w-40 px-3 text-right font-medium">{t("colParticipants")}</th>
            )}
            <th scope="col" className="w-48 pr-4 pl-3 text-right font-medium">
              <span className="sr-only">{t("register")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {contests.map((c) => (
            <tr key={c.id} className="border-t border-border transition-colors duration-150 hover:bg-surface-2/60">
              <td className="py-2.5 pl-4">
                <Link href={`/contests/${c.id}`} className="font-medium hover:text-accent-text">
                  {c.name}
                </Link>
                <div className="mt-1">
                  <ContestBadges contest={c} />
                </div>
              </td>
              {mode !== "training" && (
                <td className="px-3 max-lg:hidden">
                  <span className="flex flex-col">
                    {c.authors.map((a) => (
                      <UserHandle key={a.username} username={a.username} rating={a.rating} />
                    ))}
                  </span>
                </td>
              )}
              {mode !== "training" && (
                <td className="px-3 font-mono whitespace-nowrap text-fg-muted max-md:hidden">{formatDateTime(c.startsAt, locale)}</td>
              )}
              {mode !== "training" && <td className="px-3 font-mono text-fg-muted max-sm:hidden">{formatDuration(c.durationMin)}</td>}
              {mode === "upcoming" || mode === "running" ? (
                <td className="px-3 whitespace-nowrap">
                  <Countdown to={mode === "running" ? endOf(c) : c.startsAt} className={mode === "running" ? "text-accent-text" : "text-fg"} />
                </td>
              ) : (
                <td className="px-3 text-right font-mono text-fg-muted">{formatNumber(c.participants)}</td>
              )}
              <td className="py-2 pr-4 pl-3 text-right">
                {mode === "upcoming" ? (
                  <RegisterButton contestId={c.id} name={c.name} />
                ) : mode === "running" || mode === "training" ? (
                  <Button asChild size="sm" className="min-w-36">
                    <Link href={`/contests/${c.id}`}>{t("enter")}</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="secondary" className="min-w-36">
                    <Link href={`/contests/${c.id}?tab=standings`}>{t("standings")}</Link>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ContestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contests");
  const trainings = (await searchParams).tab === "trainings";
  const all = await api.contests.list({}, { revalidate: 30 });
  const contests = all.filter((c) => c.kind === "contest");
  const running = contests.filter((c) => c.status === "running");
  const upcoming = contests.filter((c) => c.status === "upcoming").sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const finished = contests.filter((c) => c.status === "finished");

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <LinkTabs
        label={t("title")}
        active={trainings ? "trainings" : "contests"}
        tabs={[
          { key: "contests", label: t("tabContests"), href: "/contests" },
          { key: "trainings", label: t("tabTrainings"), href: "/contests?tab=trainings" },
        ]}
        className="mb-6"
      />

      {trainings ? (
        <Card className="overflow-hidden">
          <ContestTable contests={all.filter((c) => c.kind === "training")} mode="training" locale={locale} />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {running.length > 0 && (
            <Card className="overflow-hidden border-accent/40">
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="size-2 rounded-full bg-accent" />
                    {t("running")}
                  </span>
                }
              />
              <ContestTable contests={running} mode="running" locale={locale} />
            </Card>
          )}
          <Card className="overflow-hidden">
            <CardHeader title={t("upcoming")} />
            {upcoming.length ? (
              <ContestTable contests={upcoming} mode="upcoming" locale={locale} />
            ) : (
              <EmptyState icon={<CalendarClock />} title={t("noneUpcoming")} />
            )}
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title={t("finished")} />
            {finished.length ? (
              <ContestTable contests={finished} mode="finished" locale={locale} />
            ) : (
              <EmptyState icon={<Trophy />} title={t("noneRunning")} />
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
