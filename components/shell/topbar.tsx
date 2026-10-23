"use client";

import { Menu as MenuIcon, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/misc";
import { useUi } from "@/lib/stores/ui";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";
import { MobileTabBar } from "./mobile-nav";
import { useGlobalShortcuts } from "./use-global-shortcuts";
import { UserArea } from "./user-menu";

// Overlays are split out of the first-load bundle; they load right after hydration.
const CommandPalette = dynamic(() => import("./command-palette").then((m) => m.CommandPalette), { ssr: false });
const ShortcutsDialog = dynamic(() => import("./shortcuts").then((m) => m.ShortcutsDialog), { ssr: false });
const MobileDrawer = dynamic(() => import("./mobile-drawer").then((m) => m.MobileDrawer), { ssr: false });

export function Topbar() {
  const t = useTranslations();
  const setPalette = useUi((s) => s.setPalette);
  const setDrawer = useUi((s) => s.setDrawer);
  useGlobalShortcuts();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-4">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex lg:hidden" aria-label={t("nav.openMenu")} onClick={() => setDrawer(true)}>
          <MenuIcon aria-hidden />
        </Button>
        <Logo className="mr-1 lg:hidden" />

        <button
          type="button"
          onClick={() => setPalette(true)}
          aria-keyshortcuts="Control+K Meta+K"
          className="ml-auto flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-bg px-3 text-fg-subtle transition-colors duration-150 hover:border-fg-subtle hover:text-fg-muted max-sm:w-9 max-sm:justify-center max-sm:px-0 sm:w-64 md:w-80 lg:mr-auto lg:ml-0"
        >
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="flex-1 truncate text-left max-sm:sr-only">{t("topbar.search")}…</span>
          <span className="hidden items-center gap-0.5 sm:flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <UserArea />
        </div>
      </header>
      <CommandPalette />
      <ShortcutsDialog />
      <MobileDrawer />
      <MobileTabBar />
    </>
  );
}
