import { Clock, MemoryStick, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Markdown } from "@/components/features/markdown";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Difficulty, UserHandle } from "@/components/ui/rank";
import { Link } from "@/i18n/navigation";
import type { Problem } from "@/lib/api/types";
import { formatNumber } from "@/lib/utils";

function Sample({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border">
      <div className="flex h-9 items-center justify-between border-b border-border bg-surface-2 pr-1.5 pl-3">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        <CopyButton text={text}  className="h-6 border-transparent bg-transparent" />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-sm leading-relaxed">{text}</pre>
    </div>
  );
}

/** The full statement, rendered on the server (Markdown + KaTeX), no client JS beyond copy buttons. */
export async function ProblemStatement({ problem }: { problem: Problem }) {
  const t = await getTranslations("problem");
  const tn = await getTranslations("nav");
  const tp = await getTranslations("problems");

  return (
    <article className="mx-auto max-w-[76ch] px-5 py-5">
      <nav aria-label={tp("title")} className="mb-1 text-sm text-fg-subtle">
        <Link href="/problems" className="hover:text-fg">
          {tn("problems")}
        </Link>
        <span aria-hidden> / </span>
        <span className="font-mono">{problem.id}</span>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight">
        <span className="font-mono text-fg-subtle">{problem.id}.</span> {problem.name}
      </h1>

      <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
        <div className="flex items-center gap-1.5">
          <dt>
            <Clock aria-hidden className="size-4" />
            <span className="sr-only">{t("timeLimit")}</span>
          </dt>
          <dd className="font-mono tabular-nums">{problem.timeLimitMs / 1000} s</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt>
            <MemoryStick aria-hidden className="size-4" />
            <span className="sr-only">{t("memoryLimit")}</span>
          </dt>
          <dd className="font-mono tabular-nums">{problem.memoryLimitMb} MB</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">{tp("colDifficulty")}</dt>
          <dd>
            <Difficulty rating={problem.difficulty} />
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt>
            <Users aria-hidden className="size-4" />
            <span className="sr-only">{tp("colSolved")}</span>
          </dt>
          <dd>{t("solvedBy", { count: formatNumber(problem.solvedCount) })}</dd>
        </div>
      </dl>

      <Markdown className="mt-6">{problem.legend}</Markdown>

      <h2 className="mt-8 mb-2 text-lg font-semibold">{t("input")}</h2>
      <Markdown>{problem.inputSpec}</Markdown>

      <h2 className="mt-8 mb-2 text-lg font-semibold">{t("output")}</h2>
      <Markdown>{problem.outputSpec}</Markdown>

      <h2 className="mt-8 mb-3 text-lg font-semibold">{t("examples")}</h2>
      <div className="flex flex-col gap-4">
        {problem.examples.map((ex, i) => (
          <section key={i} aria-label={t("example", { n: i + 1 })} className="grid gap-3 sm:grid-cols-2">
            <Sample label={`${t("exampleInput")} ${problem.examples.length > 1 ? i + 1 : ""}`.trim()} text={ex.input} />
            <Sample label={`${t("exampleOutput")} ${problem.examples.length > 1 ? i + 1 : ""}`.trim()} text={ex.output} />
          </section>
        ))}
      </div>

      {problem.notes && (
        <>
          <h2 className="mt-8 mb-2 text-lg font-semibold">{t("notes")}</h2>
          <Markdown>{problem.notes}</Markdown>
        </>
      )}

      <footer className="mt-10 flex flex-col gap-3 border-t border-border pt-4 text-sm text-fg-muted">
        {/* Tags are hidden by default so they don't spoil the approach. Zero-JS toggle. */}
        <details className="group">
          <summary className="w-fit cursor-pointer list-none text-accent-text hover:underline">
            <span className="group-open:hidden">{t("showTags")}</span>
            <span className="hidden group-open:inline">{t("hideTags")}</span>
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <Link key={tag} href={`/problems?tags=${encodeURIComponent(tag)}`}>
                <Badge variant="outline">{tag}</Badge>
              </Link>
            ))}
          </div>
        </details>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {problem.author && (
            <p>
              {t("author")}: <UserHandle username={problem.author.username} rating={problem.author.rating} />
            </p>
          )}
          {problem.source && (
            <p>
              {t("source")}: {problem.source}
            </p>
          )}
        </div>
      </footer>
    </article>
  );
}
