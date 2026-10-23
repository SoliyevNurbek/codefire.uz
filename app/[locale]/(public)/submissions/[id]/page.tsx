import { Clock, MemoryStick } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock } from "@/components/features/code-block";
import { LiveStatus } from "@/components/features/submissions/live-status";
import { Breadcrumbs, PageContainer, PageHeader } from "@/components/shell/page";
import { Card, CardHeader } from "@/components/ui/card";
import { UserHandle } from "@/components/ui/rank";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { api } from "@/lib/api/endpoints";
import { formatDateTime } from "@/lib/time";
import { formatNumber } from "@/lib/utils";

type Params = Promise<{ locale: string; id: string }>;

async function getSubmission(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  try {
    return await api.submissions.get(n, { revalidate: 30 });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "submissions" });
  return { title: t("detailTitle", { id }), robots: { index: false } };
}

export default async function SubmissionPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("submissions");
  const tp = await getTranslations("problem");
  const s = await getSubmission(id);

  const meta: [string, React.ReactNode][] = [
    [t("colUser"), <UserHandle key="u" username={s.user.username} rating={s.user.rating} />],
    [
      t("colProblem"),
      <Link key="p" href={`/problems/${s.problem.id}`} className="hover:text-accent-text">
        <span className="font-mono text-fg-muted">{s.problem.id}</span> {s.problem.name}
      </Link>,
    ],
    [t("colLanguage"), s.language],
    [t("colTime"), <span key="t" className="font-mono">{formatDateTime(s.createdAt, locale, { year: true })}</span>],
    [
      tp("time"),
      <span key="r" className="inline-flex items-center gap-1.5 font-mono">
        <Clock aria-hidden className="size-4 text-fg-subtle" />
        {s.timeMs ?? "—"} ms
      </span>,
    ],
    [
      tp("memory"),
      <span key="m" className="inline-flex items-center gap-1.5 font-mono">
        <MemoryStick aria-hidden className="size-4 text-fg-subtle" />
        {s.memoryKb ? formatNumber(s.memoryKb) : "—"} KB
      </span>,
    ],
  ];

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: t("title"), href: "/submissions" }, { label: `#${s.id}` }]} />}
        title={t("detailTitle", { id: s.id })}
        actions={<LiveStatus id={s.id} verdict={s.verdict} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {s.compilerOutput && (
            <section>
              <h2 className="mb-2 font-semibold">{t("compilerOutput")}</h2>
              <pre className="overflow-x-auto rounded-lg border border-verdict-wa/30 bg-verdict-wa/5 p-4 font-mono text-sm text-verdict-wa">
                {s.compilerOutput}
              </pre>
            </section>
          )}
          <section>
            <h2 className="mb-2 font-semibold">{t("sourceCode")}</h2>
            <CodeBlock code={s.code} language={s.language} />
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <dl className="divide-y divide-border">
              {meta.map(([label, value]) => (
                <div key={label} className="flex min-h-10 items-center justify-between gap-4 px-4 py-2 text-sm">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd className="min-w-0 truncate text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title={t("tests")} />
            {s.tests.length ? (
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <THead>
                    <tr>
                      <Th>{t("colTest")}</Th>
                      <Th>{t("colVerdict")}</Th>
                      <Th numeric>ms</Th>
                      <Th numeric>KB</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {s.tests.map((test) => (
                      <Tr key={test.index}>
                        <Td mono className="text-fg-muted">
                          {test.index}
                        </Td>
                        <Td>
                          <VerdictBadge verdict={test.verdict} />
                        </Td>
                        <Td numeric className="text-fg-muted">
                          {test.timeMs ?? "—"}
                        </Td>
                        <Td numeric className="text-fg-muted">
                          {test.memoryKb ? formatNumber(test.memoryKb) : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            ) : (
              <p className="px-4 py-6 text-fg-muted">{t("noTests")}</p>
            )}
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
