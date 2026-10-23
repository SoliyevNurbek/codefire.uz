import { getLocale } from "next-intl/server";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Link } from "@/i18n/navigation";
import type { Submission } from "@/lib/api/types";
import { formatRelative } from "@/lib/time";

/** Compact recent submissions: verdict, problem, relative time. Used on the dashboard and profiles. */
export async function RecentSubmissions({ items }: { items: Submission[] }) {
  const locale = await getLocale();
  return (
    <ul className="divide-y divide-border">
      {items.map((s) => (
        <li key={s.id} className="flex h-11 items-center gap-3 px-4 text-sm">
          <VerdictBadge verdict={s.verdict} test={s.verdict === "AC" || s.verdict === "CE" ? undefined : (s.failedTest ?? undefined)} />
          <Link href={`/problems/${s.problem.id}`} className="min-w-0 flex-1 truncate hover:text-accent-text">
            <span className="font-mono text-fg-muted">{s.problem.id}</span> {s.problem.name}
          </Link>
          <span className="hidden shrink-0 text-xs text-fg-subtle sm:inline">{s.language}</span>
          <Link href={`/submissions/${s.id}`} className="shrink-0 text-xs text-fg-subtle hover:text-fg" suppressHydrationWarning>
            {formatRelative(s.createdAt, locale)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
