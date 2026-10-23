import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shell/logo";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-10" />
      <p className="font-mono text-sm text-accent-text">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 max-w-md text-fg-muted">{t("body")}</p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href="/">{t("home")}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/problems">{t("search")}</Link>
        </Button>
      </div>
    </main>
  );
}
