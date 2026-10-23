"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useUi } from "@/lib/stores/ui";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { isActive, NAV_GROUPS } from "./nav";

/** Reads location.search after mount (avoids a Suspense boundary for useSearchParams). */
function useSearch() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(window.location.search), [pathname]);
  return search;
}

export function NavList({ onNavigate, collapsible }: { onNavigate?: () => void; collapsible?: boolean }) {
  const t = useTranslations("nav");
  const ts = useTranslations("comingSoon");
  const pathname = usePathname();
  const search = useSearch();

  return (
    <nav aria-label={t("mainNav")} className="flex flex-col gap-5 px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.key}>
          {group.label !== false && (
            <p className={cn("mb-1 px-2 text-xs font-medium text-fg-subtle", collapsible && "collapsed:sr-only")}>
              {t(group.key)}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, search);
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsible ? t(item.key) : undefined}
                    className={cn(
                      "group relative flex h-9 items-center gap-3 rounded-md px-2 text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg",
                      active && "bg-surface-2 font-medium text-fg",
                      collapsible && "collapsed:justify-center collapsed:px-0",
                    )}
                  >
                    {active && <span aria-hidden className="absolute top-2 bottom-2 -left-3 w-0.5 rounded-r-full bg-accent" />}
                    <Icon aria-hidden className={cn("size-[18px] shrink-0", active && "text-accent-text")} />
                    <span className={cn("truncate", collapsible && "collapsed:sr-only")}>{t(item.key)}</span>
                    {item.soon && (
                      <span className={cn("ml-auto shrink-0 rounded-full bg-surface-2 px-1.5 text-2xs whitespace-nowrap text-fg-subtle", collapsible && "collapsed:hidden")}>
                        {ts("badge")}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const t = useTranslations("nav");
  const toggle = useUi((s) => s.toggleCollapsed);

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex collapsed:w-16">
      <div className="flex h-14 items-center border-b border-border px-5 collapsed:justify-center collapsed:px-0">
        <Logo compact />
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavList collapsible />
      </div>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-fg-muted hover:bg-surface-2 hover:text-fg collapsed:justify-center collapsed:px-0"
        >
          <PanelLeftClose aria-hidden className="size-[18px] collapsed:hidden" />
          <PanelLeftOpen aria-hidden className="hidden size-[18px] collapsed:block" />
          <span className="collapsed:sr-only">{t("collapse")}</span>
        </button>
      </div>
    </aside>
  );
}
