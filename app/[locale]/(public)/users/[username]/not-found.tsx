import { UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/shell/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { Link } from "@/i18n/navigation";

export default function UserNotFound() {
  const t = useTranslations();
  return (
    <PageContainer>
      <Card>
        <EmptyState
          icon={<UserX />}
          title={t("profile.notFoundTitle")}
          description={t("profile.notFoundBody")}
          action={
            <Button asChild size="sm">
              <Link href="/rating">{t("nav.rating")}</Link>
            </Button>
          }
        />
      </Card>
    </PageContainer>
  );
}
