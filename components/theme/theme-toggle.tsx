"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const t = useTranslations("topbar");
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      {/* Both rendered; CSS picks one, so there is no hydration mismatch. */}
      <Sun aria-hidden className="hidden dark:block" />
      <Moon aria-hidden className="dark:hidden" />
      <span className="sr-only dark:hidden">{t("themeDark")}</span>
      <span className="sr-only hidden dark:inline">{t("themeLight")}</span>
    </Button>
  );
}
