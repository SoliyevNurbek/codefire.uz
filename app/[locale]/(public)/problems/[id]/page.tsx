import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProblemStatement } from "@/components/features/problem/statement";
import { Workspace } from "@/components/features/problem/workspace";
import { ApiError } from "@/lib/api/client";
import { api } from "@/lib/api/endpoints";

type Params = Promise<{ locale: string; id: string }>;

async function getProblem(id: string) {
  try {
    return await api.problems.get(id, { revalidate: 300 });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

// Statements are rendered on demand and cached (ISR); nothing is prebuilt.
export const revalidate = 300;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProblem(id);
  return {
    title: `${p.id}. ${p.name}`,
    description: p.legend.replace(/[$*`#]/g, "").slice(0, 155),
  };
}

export default async function ProblemPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [problem, languages] = await Promise.all([getProblem(id), api.languages({ revalidate: 3600 })]);

  return <Workspace problemId={problem.id} languages={languages} statement={<ProblemStatement problem={problem} />} />;
}
