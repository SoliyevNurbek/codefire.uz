import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PageContainer } from "./page";

/** Placeholder for sections that ship later: says what is coming and where to go now. */
export async function ComingSoon({ section, icon: Icon }: { section: string; icon: LucideIcon }) {
  const t = await getTranslations("comingSoon");
  return (
    <PageContainer className="flex flex-1 items-center justify-center">
      <div className="flex max-w-md flex-col items-center py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg border border-border bg-surface text-fg-subtle">
          <Icon aria-hidden className="size-6" />
        </span>
        <span className="mt-5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-text">{t("badge")}</span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{t("title", { section })}</h1>
        <p className="mt-2 text-fg-muted">{t("body")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/problems">{t("problems")}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/contests">{t("contests")}</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
