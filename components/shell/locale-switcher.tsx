"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const NAMES: Record<Locale, string> = { uz: "O'zbekcha", ru: "Русский", en: "English" };

export function LocaleSwitcher() {
  const t = useTranslations("topbar");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t("language")} disabled={pending} className="gap-1.5 px-2">
          <Languages aria-hidden />
          <span className="font-mono text-xs uppercase">{locale}</span>
        </Button>
      </MenuTrigger>
      <MenuContent className="min-w-40">
        <MenuRadioGroup
          value={locale}
          onValueChange={(next) =>
            startTransition(() => {
              // Keep the query string (filters) when switching language.
              router.replace(`${pathname}${window.location.search}`, { locale: next as Locale });
            })
          }
        >
          {routing.locales.map((l) => (
            <MenuRadioItem key={l} value={l} lang={l}>
              {NAMES[l]}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
