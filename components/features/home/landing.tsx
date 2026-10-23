import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesColumn,
  Code,
  Dumbbell,
  Flame,
  GraduationCap,
  Newspaper,
  SquareCode,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { CodeBlock } from "@/components/features/code-block";
import { PageContainer } from "@/components/shell/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Countdown } from "@/components/ui/countdown";
import { Avatar } from "@/components/ui/misc";
import { Difficulty, RankBadge, UserHandle } from "@/components/ui/rank";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import type { DailyStat, RegionStat, Standings, StandingsCell } from "@/lib/api/types";
import { dateParts, formatTime } from "@/lib/time";
import { cn, formatNumber } from "@/lib/utils";

const HERO_CODE = `int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b << "\\n";
}`;

/* ---------- Shared pieces ---------- */

function SectionHeading({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{title}</h2>
        {body && <p className="mt-1.5 max-w-[60ch] text-md text-fg-muted">{body}</p>}
      </div>
      {action}
    </div>
  );
}

function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium text-accent-text">
      {children}
      <ArrowRight aria-hidden className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ---------- Hero ---------- */

/** The judging moment, as the product shows it: the hero is real UI, not an illustration. */
async function VerdictCard() {
  const t = await getTranslations("problem");
  return (
    <Card className="overflow-hidden shadow-md">
      <div className="flex h-11 items-center justify-between border-b border-border px-4">
        <Link href="/problems/37A" className="font-medium hover:text-accent-text">
          <span className="font-mono text-fg-subtle">37A.</span> Ikki son yig&apos;indisi
        </Link>
        <span className="font-mono text-xs text-fg-subtle">GNU C++17</span>
      </div>
      <CodeBlock code={HERO_CODE} language="GNU C++17" className="rounded-none border-0" />
      <div className="flex flex-col gap-3 border-t border-border p-4">
        <div className="flex items-center gap-3">
          <VerdictBadge verdict="AC" full className="h-6 px-2.5 text-sm" />
          <span className="font-mono text-sm text-fg-muted tabular-nums">{t("testOf", { n: 24, total: 24 })}</span>
          <span className="ml-auto font-mono text-sm text-fg-subtle tabular-nums">46 ms</span>
        </div>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties} className="test-pass h-3 flex-1 rounded-[3px] bg-verdict-ac" />
          ))}
        </div>
      </div>
    </Card>
  );
}

async function Hero({ stats, problems }: { stats: Awaited<ReturnType<typeof api.stats.platform>>; problems: number }) {
  const t = await getTranslations("landing");
  const numbers: [LucideIcon, number, string][] = [
    [Users, stats.users, t("statUsers")],
    [SquareCode, problems, t("statProblems")],
    [Code, stats.submissionsToday, t("statSubmissions")],
    [Trophy, stats.contestsHeld, t("statContests")],
  ];

  return (
    <section className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-fg-muted">
          <Flame aria-hidden className="size-3.5 fill-accent text-accent" />
          {t("eyebrow")}
        </p>
        <h1 className="mt-6 text-[2.375rem] leading-[1.06] font-bold tracking-[-0.04em] text-balance sm:text-5xl xl:text-[3.25rem]">
          {t.rich("title", { hl: (chunks) => <span className="text-accent-text">{chunks}</span> })}
        </h1>
        <p className="mt-5 max-w-[54ch] text-[1.0625rem] leading-relaxed text-fg-muted">{t("subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/problems">
              {t("ctaPrimary")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/contests">{t("ctaSecondary")}</Link>
          </Button>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-4">
          {numbers.map(([Icon, n, label]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="flex items-start gap-1.5 text-sm text-fg-muted">
                <Icon aria-hidden className="mt-[3px] size-3.5 shrink-0 text-fg-subtle" />
                {label}
              </dt>
              <dd className="order-first font-mono text-xl font-semibold tracking-tight tabular-nums">{formatNumber(n)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Product composition: the verdict card with two floating fragments of the real UI. */}
      <div className="relative sm:mb-10 lg:mb-0 lg:pl-6">
        <VerdictCard />
        <div className="absolute -top-5 right-4 hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium shadow-md sm:flex">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-verdict-ac opacity-60 motion-reduce:animate-none" />
            <span className="relative size-2 rounded-full bg-verdict-ac" />
          </span>
          {t("heroLive")}
        </div>
        <div className="absolute -bottom-14 -left-2 hidden items-center gap-3 rounded-lg border border-border bg-surface py-2.5 pr-4 pl-3 shadow-md sm:flex">
          <Avatar name="Sardor Tursunov" size={32} />
          <div className="leading-tight">
            <p className="text-sm font-medium">sardorbek</p>
            <RankBadge rating={1642} className="mt-0.5" />
          </div>
          <div className="ml-2 border-l border-border pl-3 text-right leading-tight">
            <p className="font-mono text-md font-semibold text-verdict-ac tabular-nums">+38</p>
            <p className="text-2xs text-fg-subtle">{t("heroRating")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Quick links ---------- */

async function QuickLinks({ problems }: { problems: number }) {
  const t = await getTranslations("landing");
  const items: [LucideIcon, string, string, string][] = [
    [SquareCode, "/problems", t("quickProblemsTitle"), t("quickProblemsBody", { count: formatNumber(problems) })],
    [Trophy, "/contests", t("quickContestsTitle"), t("quickContestsBody")],
    [ChartNoAxesColumn, "/rating", t("quickRatingTitle"), t("quickRatingBody")],
    [Dumbbell, "/contests?tab=trainings", t("quickTrainingsTitle"), t("quickTrainingsBody")],
  ];
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([Icon, href, title, body]) => (
        <li key={href}>
          <Link
            href={href}
            className="group flex h-full flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm max-sm:flex-row max-sm:items-center max-sm:gap-4 max-sm:p-4 transition-[border-color,translate] duration-150 hover:-translate-y-0.5 hover:border-accent/50"
          >
            <span className="flex shrink-0 items-start justify-between">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                <Icon aria-hidden className="size-5" />
              </span>
              <ArrowUpRight
                aria-hidden
                className="size-4 text-fg-subtle transition-[color,translate] max-sm:hidden duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text"
              />
            </span>
            <span>
              <span className="block text-md font-semibold">{title}</span>
              <span className="mt-1 block text-fg-muted">{body}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Now: contests, top users, activity ---------- */

async function UpcomingCard({ contests }: { contests: Awaited<ReturnType<typeof api.contests.list>> }) {
  const t = await getTranslations("landing");
  const tc = await getTranslations("contests");
  const locale = await getLocale();
  return (
    <Card className="flex flex-col">
      <CardHeader title={t("upcoming")} action={<SeeAll href="/contests">{tc("title")}</SeeAll>} />
      {contests.length ? (
        <ul className="flex-1 divide-y divide-border">
          {contests.map((c) => {
            const d = dateParts(c.startsAt, locale);
            return (
              <li key={c.id} className="relative flex items-center gap-3.5 px-4 py-3.5 hover:bg-surface-2/60">
                <span className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-md border border-border bg-bg">
                  <span className="w-full bg-accent-soft py-0.5 text-center font-mono text-2xs font-medium text-accent-text uppercase">{d.month}</span>
                  <span className="py-1 font-mono text-lg leading-none font-semibold tabular-nums">{d.day}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/contests/${c.id}`} className="line-clamp-1 font-medium after:absolute after:inset-0 hover:text-accent-text">
                    {c.name}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-fg-muted">
                    <span className="font-mono">{formatTime(c.startsAt)}</span>
                    <span aria-hidden className="text-fg-subtle">·</span>
                    <Countdown to={c.startsAt} className="min-w-0 text-fg-muted" />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="flex-1 px-4 py-10 text-center text-fg-muted">{t("upcomingEmpty")}</p>
      )}
    </Card>
  );
}

async function TopUsersCard() {
  const t = await getTranslations();
  const users = await api.users.list({ sort: "rating" }, { revalidate: 300 }).then((r) => r.results.slice(0, 6));
  return (
    <Card className="flex flex-col">
      <CardHeader title={t("landing.topUsers")} action={<SeeAll href="/rating">{t("common.seeAll")}</SeeAll>} />
      <ol className="flex-1 py-1.5">
        {users.map((u, i) => (
          <li key={u.username} className="flex items-center gap-3 px-4 py-2">
            <span className={cn("w-4 text-right font-mono text-sm tabular-nums", i === 0 ? "font-bold text-accent-text" : "text-fg-subtle")}>{i + 1}</span>
            <Avatar name={u.displayName} size={28} />
            <div className="min-w-0 flex-1 leading-tight">
              <UserHandle username={u.username} rating={u.rating} className="block truncate text-sm" />
              <p className="truncate text-xs text-fg-subtle">{u.school ?? u.region}</p>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums">{u.rating}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** Single-series magnitude: one hue, today emphasised, value in text ink on hover. */
async function ActivityCard({ daily, users, problems }: { daily: DailyStat[]; users: number; problems: number }) {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const max = Math.max(...daily.map((d) => d.submissions));
  const today = daily[daily.length - 1];
  return (
    <Card className="flex flex-col">
      <CardHeader title={t("community")} />
      <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
        {(
          [
            [users, t("statUsers")],
            [problems, t("statProblems")],
          ] as const
        ).map(([n, label]) => (
          <div key={label} className="bg-surface px-4 py-3">
            <p className="font-mono text-lg font-semibold tabular-nums">{formatNumber(n)}</p>
            <p className="text-xs text-fg-muted">{label}</p>
          </div>
        ))}
      </div>
      <figure className="flex flex-1 flex-col p-4">
        <figcaption className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-fg-muted">{t("communityChart")}</span>
          <span>
            <span className="font-mono font-semibold tabular-nums">{formatNumber(today.submissions)}</span>{" "}
            <span className="text-fg-subtle">{t("communityToday")}</span>
          </span>
        </figcaption>
        <div className="mt-4 flex min-h-28 flex-1 items-end gap-[2px]" aria-hidden>
          {daily.map((d, i) => {
            const p = dateParts(`${d.date}T12:00:00+05:00`, locale);
            return (
              <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className={cn("rounded-t-[3px] transition-colors duration-150", i === daily.length - 1 ? "bg-accent" : "bg-accent/40 group-hover:bg-accent/70")}
                  style={{ height: `${(d.submissions / max) * 100}%` }}
                />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-fg px-1.5 py-0.5 font-mono text-2xs whitespace-nowrap text-bg group-hover:block">
                  {p.day} {p.month}: {formatNumber(d.submissions)}
                </span>
              </div>
            );
          })}
        </div>
        <table className="sr-only">
          <caption>{t("communityChart")}</caption>
          <tbody>
            {daily.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.submissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </Card>
  );
}

/* ---------- Feature bento ---------- */

function cellTone(cell: StandingsCell) {
  if (cell.result === "accepted") return cell.firstSolve ? "bg-verdict-ac/25 text-verdict-ac" : "bg-verdict-ac/10 text-verdict-ac";
  if (cell.result === "rejected") return "bg-verdict-wa/10 text-verdict-wa";
  if (cell.result === "pending") return "bg-surface-2 text-fg-muted";
  return "";
}

function MiniStandings({ standings }: { standings: Standings }) {
  const rows = standings.rows.slice(0, 6);
  const letters = standings.problems.slice(0, 6).map((p) => p.letter);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      <table className="w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr className="h-9 border-b border-border text-xs text-fg-subtle">
            <th className="w-10 text-center font-medium">#</th>
            <th className="text-left font-medium">&nbsp;</th>
            <th className="w-10 text-center font-medium">=</th>
            {letters.map((l) => (
              <th key={l} className="w-11 text-center font-mono font-medium max-sm:[&:nth-child(n+7)]:hidden">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.user.username} className="h-10 border-b border-border last:border-b-0">
              <td className="text-center font-mono text-fg-muted">{row.rank}</td>
              <td className="max-w-0 truncate pr-2">
                <UserHandle username={row.user.username} rating={row.user.rating} />
              </td>
              <td className="text-center font-mono font-semibold">{row.solved}</td>
              {letters.map((l) => {
                const cell = row.cells.find((c) => c.letter === l);
                return (
                  <td key={l} className="p-0.5 max-sm:[&:nth-child(n+7)]:hidden">
                    {cell?.result && (
                      <span className={cn("flex h-8 items-center justify-center rounded-[4px] font-mono text-xs font-semibold", cellTone(cell))}>
                        {cell.result === "accepted" ? `+${cell.attempts > 1 ? cell.attempts - 1 : ""}` : cell.result === "pending" ? "?" : `−${cell.attempts}`}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tile({ className, title, body, children }: { className?: string; title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6", className)}>
      <div>
        <h3 className="text-md font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-fg-muted">{body}</p>
      </div>
      {children}
    </div>
  );
}

async function Features({ standings, languages }: { standings: Standings | null; languages: { id: string; name: string }[] }) {
  const t = await getTranslations("landing");
  const ts = await getTranslations("comingSoon");
  return (
    <section>
      <SectionHeading title={t("featuresTitle")} body={t("featuresBody")} />
      <div className="grid gap-4 lg:grid-cols-6">
        <Tile className="lg:col-span-4 lg:row-span-2" title={t("fStandingsTitle")} body={t("fStandingsBody")}>
          {standings && <MiniStandings standings={standings} />}
        </Tile>

        <Tile className="lg:col-span-2" title={t("fVerdictTitle")} body={t("fVerdictBody")}>
          <div className="mt-auto flex flex-col gap-3">
            <div className="flex gap-1" aria-hidden>
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  className={cn("h-3 flex-1 rounded-[3px]", i < 6 ? "bg-verdict-ac" : i === 6 ? "bg-verdict-wa" : "bg-surface-3")}
                />
              ))}
            </div>
            <VerdictBadge verdict="WA" test={7} full className="self-start" />
          </div>
        </Tile>

        <Tile className="lg:col-span-2" title={t("fLanguagesTitle")} body={t("fLanguagesBody")}>
          <ul className="mt-auto flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <li key={l.id} className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-xs text-fg-muted">
                {l.name}
              </li>
            ))}
          </ul>
        </Tile>

        <Tile className="lg:col-span-3" title={t("fStatementTitle")} body={t("fStatementBody")}>
          <div className="mt-auto rounded-lg border border-border bg-bg p-4">
            <p className="font-semibold">
              <span className="font-mono text-fg-subtle">37A.</span> Ikki son yig&apos;indisi
            </p>
            <p className="mt-2 text-fg-muted">
              Ikkita butun son <i className="font-serif text-fg">a</i> va <i className="font-serif text-fg">b</i> berilgan. Ularning yig&apos;indisini
              chiqaring.
            </p>
            <p className="mt-2 font-mono text-sm text-fg">1 ≤ a, b ≤ 10⁹</p>
          </div>
        </Tile>

        <Tile className="lg:col-span-3" title={t("fSoonTitle")} body={t("fSoonBody")}>
          <div className="mt-auto flex items-center gap-3">
            {[GraduationCap, Newspaper].map((Icon, i) => (
              <span key={i} className="flex size-10 items-center justify-center rounded-lg border border-dashed border-border text-fg-subtle">
                <Icon aria-hidden className="size-5" />
              </span>
            ))}
            <span className="ml-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-sm font-medium text-accent-text">{ts("badge")}</span>
          </div>
        </Tile>
      </div>
    </section>
  );
}

/* ---------- Problems to start with ---------- */

async function StarterProblems({ problems }: { problems: Awaited<ReturnType<typeof api.problems.list>>["results"] }) {
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");
  return (
    <section>
      <SectionHeading title={t("problemsTitle")} body={t("problemsBody")} action={<SeeAll href="/problems">{tCommon("seeAll")}</SeeAll>} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((p) => (
          <li key={p.id}>
            <Link
              href={`/problems/${p.id}`}
              className="group flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-sm transition-colors duration-150 hover:border-accent/50"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-fg-subtle">{p.id}</span>
                <Difficulty rating={p.difficulty} />
              </span>
              <span className="mt-2 line-clamp-1 text-md font-semibold group-hover:text-accent-text">{p.name}</span>
              <span className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">
                    {tag}
                  </span>
                ))}
              </span>
              <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-fg-subtle">
                <Users aria-hidden className="size-3.5" />
                {t("solvedBy", { count: formatNumber(p.solvedCount) })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Regions ---------- */

async function Regions({ regions }: { regions: RegionStat[] }) {
  const t = await getTranslations("landing");
  const top = regions.slice(0, 10);
  const leader = regions[0];
  const max = leader?.users ?? 1;
  if (!leader) return null;
  return (
    <section>
      <SectionHeading title={t("regionsTitle")} body={t("regionsBody")} />
      <Card className="grid overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-8 border-b border-border bg-surface-2/50 p-6 lg:border-r lg:border-b-0">
          <div>
            <p className="text-sm text-fg-muted">{t("regionsLeader")}</p>
            <p className="mt-1 text-3xl font-bold tracking-[-0.03em]">{leader.region}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1">
            {(
              [
                [leader.users, t("colUsers")],
                [leader.newUsers, t("colNew")],
                [leader.active, t("colActive")],
              ] as const
            ).map(([n, label]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-sm text-fg-muted">{label}</dt>
                <dd className="font-mono text-xl font-semibold tabular-nums">{formatNumber(n)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="h-10 border-b border-border text-left text-xs text-fg-subtle">
              <th className="w-10 pl-4 font-medium">#</th>
              <th className="px-3 font-medium">{t("colRegion")}</th>
              <th className="w-24 px-3 text-right font-medium">{t("colUsers")}</th>
              <th className="w-20 px-3 text-right font-medium max-sm:hidden">{t("colNew")}</th>
              <th className="w-20 pr-4 pl-3 text-right font-medium max-sm:hidden">{t("colActive")}</th>
            </tr>
          </thead>
          <tbody>
            {top.map((r, i) => (
              <tr key={r.region} className="h-12 border-b border-border last:border-b-0">
                <td className="pl-4 font-mono text-fg-subtle">{i + 1}</td>
                <td className="px-3">
                  <span className="font-medium">{r.region}</span>
                  <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <span className={cn("block h-full rounded-full", i === 0 ? "bg-accent" : "bg-accent/45")} style={{ width: `${(r.users / max) * 100}%` }} />
                  </span>
                </td>
                <td className="px-3 text-right font-mono font-medium">{formatNumber(r.users)}</td>
                <td className="px-3 text-right font-mono text-fg-muted max-sm:hidden">{formatNumber(r.newUsers)}</td>
                <td className="pr-4 pl-3 text-right font-mono text-fg-muted max-sm:hidden">{formatNumber(r.active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}

/* ---------- Closing call to action ---------- */

async function ClosingCta() {
  const t = await getTranslations("landing");
  const tn = await getTranslations("nav");
  return (
    <section className="relative overflow-hidden rounded-xl bg-fg px-6 py-12 text-bg sm:px-12 sm:py-16">
      <Flame aria-hidden strokeWidth={1} className="absolute -right-10 -bottom-12 size-72 text-accent opacity-90 max-md:hidden" />
      <div className="relative max-w-[36rem]">
        <h2 className="text-3xl leading-[1.08] font-bold tracking-[-0.035em] text-balance sm:text-[2.75rem]">{t("ctaTitle")}</h2>
        <p className="mt-4 text-md text-bg/70">{t("ctaBody")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/register">
              {t("ctaRegister")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="border border-bg/25 text-bg hover:bg-bg/10 hover:text-bg">
            <Link href="/problems">{tn("problems")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

export async function Landing() {
  const [stats, contests, languages, problems, daily, regions] = await Promise.all([
    api.stats.platform({ revalidate: 300 }),
    api.contests.list({ kind: "contest" }, { revalidate: 30 }),
    api.languages({ revalidate: 3600 }),
    api.problems.list({ sort: "-solved" }, { revalidate: 300 }),
    api.stats.daily({ revalidate: 300 }),
    api.stats.regions({ revalidate: 3600 }),
  ]);
  const upcoming = contests
    .filter((c) => c.status === "upcoming")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 4);
  const showcase = contests.find((c) => c.status === "running") ?? contests.find((c) => c.status === "finished");
  const standings = showcase ? await api.contests.standings(showcase.id, { revalidate: 30 }).catch(() => null) : null;

  return (
    <PageContainer className="flex flex-col gap-20 py-10 sm:gap-24 sm:py-16">
      <Hero stats={stats} problems={stats.problems} />
      <QuickLinks problems={stats.problems} />
      <div className="grid gap-4 lg:grid-cols-3">
        <UpcomingCard contests={upcoming} />
        <TopUsersCard />
        <ActivityCard daily={daily} users={stats.users} problems={stats.problems} />
      </div>
      <Features standings={standings} languages={languages} />
      <StarterProblems problems={problems.results.slice(0, 6)} />
      <Regions regions={regions} />
      <ClosingCta />
    </PageContainer>
  );
}
