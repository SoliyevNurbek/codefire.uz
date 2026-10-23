import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProblemExplorer } from "@/components/features/problems/problem-explorer";
import { TopRatingCard } from "@/components/features/widgets/top-rating";
import { PageContainer, PageHeader, WithRail } from "@/components/shell/page";
import { Card, CardHeader } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { parseProblemQuery, problemQueryToSearch } from "@/lib/problem-query";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "problems" });
  return { title: t("title") };
}

export default async function ProblemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("problems");
  const query = parseProblemQuery(await searchParams);
  const [page, tags, all] = await Promise.all([
    api.problems.list(query),
    api.problems.tags({ revalidate: 3600 }),
    api.problems.list({}, { revalidate: 300 }),
  ]);

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description", { count: formatNumber(all.count) })} />
      <WithRail
        rail={
          <>
            <Card>
              <CardHeader title={t("tags")} />
              <div className="flex flex-wrap gap-1.5 p-4">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/problems?tags=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-fg-muted transition-colors duration-150 hover:border-border-strong hover:text-fg"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </Card>
            <TopRatingCard />
          </>
        }
      >
        {/* key: a new URL (e.g. a tag link in the rail) resets the explorer's local filter state. */}
        <ProblemExplorer key={problemQueryToSearch(query)} initialQuery={query} initialPage={page} tags={tags} />
      </WithRail>
    </PageContainer>
  );
}
