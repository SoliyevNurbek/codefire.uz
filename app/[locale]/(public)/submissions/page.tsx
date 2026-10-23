import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SubmissionsTable } from "@/components/features/submissions/submissions-table";
import { PageContainer, PageHeader } from "@/components/shell/page";
import { LinkTabs } from "@/components/ui/link-tabs";
import { api } from "@/lib/api/endpoints";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submissions" });
  return { title: t("title") };
}

export default async function SubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("submissions");
  const mine = (await searchParams).tab === "mine";
  const initial = mine ? undefined : await api.submissions.list({}, { revalidate: 10 });

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <LinkTabs
        label={t("title")}
        active={mine ? "mine" : "all"}
        tabs={[
          { key: "all", label: t("tabAll"), href: "/submissions" },
          { key: "mine", label: t("tabMine"), href: "/submissions?tab=mine" },
        ]}
        className="mb-4"
      />
      <SubmissionsTable key={mine ? "mine" : "all"} initial={initial} baseQuery={{}} mineOnly={mine} />
    </PageContainer>
  );
}
