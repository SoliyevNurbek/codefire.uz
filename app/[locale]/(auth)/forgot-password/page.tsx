import { KeyRound } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/shell/coming-soon";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return <ComingSoon section={t("resetTitle")} icon={KeyRound} />;
}
