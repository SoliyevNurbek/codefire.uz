import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";

const DAY = 86_400_000;

/** Slim banner when a contest is running or starts within 24h. Server-rendered, 40px tall. */
export async function ContestBanner() {
  const t = await getTranslations("banner");
  const list = await api.contests.list({ kind: "contest" }, { revalidate: 30 }).catch(() => []);
  const now = Date.now();
  const running = list.find((c) => c.status === "running");
  const soon = list
    .filter((c) => c.status === "upcoming" && new Date(c.startsAt).getTime() - now < DAY)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const contest = running ?? soon;
  if (!contest) return null;

  const end = new Date(new Date(contest.startsAt).getTime() + contest.durationMin * 60_000).toISOString();

  return (
    <div data-contest-banner className="border-b border-border bg-accent-soft">
      <div className="mx-auto flex h-10 max-w-[1280px] items-center gap-3 px-4 text-sm sm:px-6">
        {running && <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent" />}
        <p className="min-w-0 flex-1 truncate">
          <Link href={`/contests/${contest.id}`} className="font-semibold hover:underline">
            {contest.name}
          </Link>
          {running && <span className="text-fg-muted max-md:hidden"> {t("running")}</span>}
        </p>
        <p className="flex shrink-0 items-center gap-1.5 text-fg-muted">
          <span className="max-sm:sr-only">{running ? t("endsIn") : t("startsIn")}</span>
          <Countdown to={running ? end : contest.startsAt} className="font-medium text-fg" />
        </p>
        <Button asChild size="sm" className="h-7 shrink-0 px-3">
          <Link href={`/contests/${contest.id}`}>{running ? t("join") : t("open")}</Link>
        </Button>
      </div>
    </div>
  );
}
