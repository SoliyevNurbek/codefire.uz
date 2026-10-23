"use client";

import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/shell/page";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/state";

/** Route-level error boundary for every page in the shell. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <PageContainer>
      <ErrorState
        title={t("errorTitle")}
        description={t("errorBody")}
        action={
          <Button size="sm" variant="secondary" onClick={reset}>
            {t("retry")}
          </Button>
        }
      />
    </PageContainer>
  );
}
