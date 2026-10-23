import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageContainer, PageHeader, WithRail } from "@/components/shell/page";
import { AutoSubmitSelect } from "@/components/ui/auto-submit";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkTabs } from "@/components/ui/link-tabs";
import { RankBadge, UserHandle } from "@/components/ui/rank";
import { EmptyState } from "@/components/ui/state";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import type { UserQuery } from "@/lib/api/types";
import { RANK_TEXT, rankForRating, RANKS } from "@/lib/rank";
import { cn, formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rating" });
  return { title: t("title"), description: t("description") };
}

type SP = Record<string, string | undefined>;

function hrefWith(sp: SP, patch: SP) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) q.set(k, v);
  const s = q.toString();
  return `/rating${s ? `?${s}` : ""}`;
}

export default async function RatingPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("rating");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const sort = (["rating", "solved", "contribution"].includes(sp.sort ?? "") ? sp.sort : "rating") as UserQuery["sort"];
  const page = Math.max(1, Number(sp.page) || 1);
  const query: UserQuery = { sort, country: sp.country, region: sp.region, school: sp.school, search: sp.search, page };
  const [list, filters] = await Promise.all([api.users.list(query, { revalidate: 60 }), api.users.filters({ revalidate: 3600 })]);
  const pages = Math.max(1, Math.ceil(list.count / list.pageSize));
  const offset = (page - 1) * list.pageSize;

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <WithRail
        rail={
          <Card>
            <CardHeader title={t("ladder")} />
            <ul className="py-1">
              {[...RANKS].reverse().map((rank, i, arr) => {
                const next = arr[i - 1];
                return (
                  <li key={rank.id} className="flex h-10 items-center justify-between px-4 text-sm">
                    <RankBadge rating={rank.min} />
                    <span className="font-mono text-fg-muted tabular-nums">
                      {rank.min}
                      {next ? `–${next.min - 1}` : "+"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        }
      >
        <LinkTabs
          label={t("title")}
          active={sort ?? "rating"}
          className="mb-4"
          tabs={[
            { key: "rating", label: t("tabRating"), href: hrefWith(sp, { sort: undefined, page: undefined }) },
            { key: "solved", label: t("tabSolved"), href: hrefWith(sp, { sort: "solved", page: undefined }) },
            { key: "contribution", label: t("tabContribution"), href: hrefWith(sp, { sort: "contribution", page: undefined }) },
          ]}
        />

        {/* A plain GET form: filters live in the URL and work without JavaScript. */}
        <form className="mb-4 flex flex-wrap items-center gap-2" action="">
          {sort !== "rating" && <input type="hidden" name="sort" value={sort} />}
          <Input name="search" defaultValue={sp.search} aria-label={t("searchUser")} placeholder={t("searchUser")} leading={<Search />} className="w-full sm:w-56" data-page-search />
          <AutoSubmitSelect name="country" defaultValue={sp.country ?? ""} aria-label={t("country")}>
            <option value="">{t("anyCountry")}</option>
            {filters.countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </AutoSubmitSelect>
          <AutoSubmitSelect name="region" defaultValue={sp.region ?? ""} aria-label={t("region")} className="max-w-48">
            <option value="">{t("anyRegion")}</option>
            {filters.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </AutoSubmitSelect>
          <AutoSubmitSelect name="school" defaultValue={sp.school ?? ""} aria-label={t("school")} className="max-w-56">
            <option value="">{t("anySchool")}</option>
            {filters.schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </AutoSubmitSelect>
          <Button type="submit" variant="secondary" className="sr-only focus:not-sr-only">
            {t("searchUser")}
          </Button>
        </form>

        <Card className="overflow-hidden">
          {list.results.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm tabular-nums">
                <thead className="bg-surface-2">
                  <tr className="h-8 text-left text-xs text-fg-muted">
                    <th scope="col" className="w-14 pl-4 font-medium">{t("colRank")}</th>
                    <th scope="col" className="px-3 font-medium">{t("colUser")}</th>
                    <th scope="col" className="px-3 font-medium max-lg:hidden">{t("colRegion")}</th>
                    <th scope="col" className="px-3 text-right font-medium">{t("colRating")}</th>
                    <th scope="col" className="px-3 text-right font-medium max-sm:hidden">{t("colContests")}</th>
                    <th scope="col" className="px-3 text-right font-medium max-sm:hidden">{t("colSolved")}</th>
                    <th scope="col" className="pr-4 pl-3 text-right font-medium max-md:hidden">{t("colContribution")}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.results.map((u, i) => (
                    <tr key={u.username} className="h-11 border-t border-border hover:bg-surface-2/60">
                      <td className="pl-4 font-mono text-fg-muted">{offset + i + 1}</td>
                      <td className="px-3">
                        <span className="flex items-center gap-2">
                          <span className="w-6 font-mono text-2xs text-fg-subtle">{u.country}</span>
                          <span className="min-w-0">
                            <UserHandle username={u.username} rating={u.rating} className="block truncate" />
                            <span className="block truncate text-xs text-fg-subtle">{u.displayName}</span>
                          </span>
                        </span>
                      </td>
                      <td className="max-w-48 truncate px-3 text-fg-muted max-lg:hidden">{u.region ?? "—"}</td>
                      <td className={cn("px-3 text-right font-mono font-semibold", sort === "rating" && "text-md")}>
                        <span className={RANK_TEXT[rankForRating(u.rating).id]}>{u.rating}</span>
                      </td>
                      <td className="px-3 text-right font-mono text-fg-muted max-sm:hidden">{u.contestsCount}</td>
                      <td className={cn("px-3 text-right font-mono max-sm:hidden", sort === "solved" ? "font-semibold text-fg" : "text-fg-muted")}>
                        {formatNumber(u.solvedCount)}
                      </td>
                      <td className={cn("pr-4 pl-3 text-right font-mono max-md:hidden", sort === "contribution" ? "font-semibold text-fg" : "text-fg-muted")}>
                        {u.contribution > 0 ? `+${u.contribution}` : u.contribution}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Users />}
              title={t("emptyTitle")}
              description={t("emptyBody")}
              action={
                <Button asChild size="sm" variant="secondary">
                  <Link href="/rating">{tc("all")}</Link>
                </Button>
              }
            />
          )}
          {pages > 1 && (
            <nav aria-label={tc("pageOf", { page, total: pages })} className="flex h-12 items-center justify-between border-t border-border px-4">
              <span className="text-sm text-fg-subtle">{tc("pageOf", { page, total: pages })}</span>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={hrefWith(sp, { page: String(page - 1) })}>
                      <ChevronLeft aria-hidden />
                      {tc("prev")}
                    </Link>
                  </Button>
                ) : null}
                {page < pages ? (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={hrefWith(sp, { page: String(page + 1) })}>
                      {tc("next")}
                      <ChevronRight aria-hidden />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </nav>
          )}
        </Card>
      </WithRail>
    </PageContainer>
  );
}
