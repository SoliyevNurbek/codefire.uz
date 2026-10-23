import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { Contest } from "@/lib/api/types";

export async function ContestBadges({ contest }: { contest: Pick<Contest, "rated" | "division" | "format" | "kind"> }) {
  const t = await getTranslations();
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {contest.division && (
        <Badge variant="outline" mono>
          {t("contests.div", { n: contest.division })}
        </Badge>
      )}
      <Badge variant="outline" mono>
        {contest.format}
      </Badge>
      {contest.kind === "contest" &&
        (contest.rated ? <Badge variant="accent">{t("common.rated")}</Badge> : <Badge>{t("common.unrated")}</Badge>)}
    </span>
  );
}
