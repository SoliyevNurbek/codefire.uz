import { Settings } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/shell/coming-soon";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("topbar");
  return <ComingSoon section={t("settings")} icon={Settings} />;
}
