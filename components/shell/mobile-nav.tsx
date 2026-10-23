"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useUi } from "@/lib/stores/ui";
import { cn } from "@/lib/utils";
import { isActive, TAB_ITEMS } from "./nav";

/** Phones only: four main sections plus the menu, 56px tall with safe-area padding. */
export function MobileTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const setDrawer = useUi((s) => s.setDrawer);
  return (
    <nav
      aria-label={t("mainNav")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="grid h-14 grid-cols-5">
        {TAB_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-2xs text-fg-muted",
                  active && "font-medium text-accent-text",
                )}
              >
                <Icon aria-hidden className="size-5" />
                {t(item.key)}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-2xs text-fg-muted"
          >
            <Menu aria-hidden className="size-5" />
            {t("menu")}
          </button>
        </li>
      </ul>
    </nav>
  );
}
