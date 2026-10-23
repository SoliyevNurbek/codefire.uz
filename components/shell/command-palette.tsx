"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { CornerDownLeft, Keyboard, Search, SunMoon, Trophy, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/misc";
import { Difficulty, RankBadge } from "@/components/ui/rank";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { useDebounced } from "@/lib/hooks/use-debounced";
import { qk } from "@/lib/query-keys";
import { useUi } from "@/lib/stores/ui";
import { NAV_GROUPS } from "./nav";

const itemClass =
  "flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-fg select-none data-[selected=true]:bg-surface-2 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-subtle";
const groupClass =
  "px-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-fg-subtle";

export function CommandPalette() {
  const t = useTranslations();
  const open = useUi((s) => s.paletteOpen);
  const setOpen = useUi((s) => s.setPalette);
  const setShortcuts = useUi((s) => s.setShortcuts);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const q = useDebounced(query.trim(), 150);

  const { data, isFetching } = useQuery({
    queryKey: qk.search(q),
    queryFn: ({ signal }) => api.search(q, signal),
    enabled: open && q.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const results = q ? data : undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => (setOpen(o), o || setQuery(""))}>
      <DialogContent title={t("palette.title")} hideTitle className="top-[10vh] max-w-xl overflow-hidden p-0">
        {/* Server already filters search results, so cmdk's own filtering is off. */}
        <Command shouldFilter={false} loop label={t("palette.title")}>
          <div className="flex h-12 items-center gap-3 border-b border-border px-4">
            {isFetching ? <Spinner className="text-fg-subtle" /> : <Search aria-hidden className="size-4 text-fg-subtle" />}
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={t("palette.placeholder")}
              className="h-full flex-1 bg-transparent text-md outline-none placeholder:text-fg-subtle"
            />
            <Kbd>Esc</Kbd>
          </div>
          <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto pb-2">
            {q && results && !results.problems.length && !results.users.length && !results.contests.length && (
              <Command.Empty className="px-4 py-10 text-center text-fg-muted">{t("palette.empty")}</Command.Empty>
            )}

            {results && results.problems.length > 0 && (
              <Command.Group heading={t("palette.problems")} className={groupClass}>
                {results.problems.map((p) => (
                  <Command.Item key={p.id} value={`p-${p.id}`} onSelect={() => go(`/problems/${p.id}`)} className={itemClass}>
                    <span className="w-12 font-mono text-sm text-fg-muted">{p.id}</span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <Difficulty rating={p.difficulty} />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {results && results.users.length > 0 && (
              <Command.Group heading={t("palette.users")} className={groupClass}>
                {results.users.map((u) => (
                  <Command.Item key={u.username} value={`u-${u.username}`} onSelect={() => go(`/users/${u.username}`)} className={itemClass}>
                    <User aria-hidden />
                    <span className="flex-1 truncate">
                      {u.username} <span className="text-fg-subtle">· {u.displayName}</span>
                    </span>
                    <RankBadge rating={u.rating} />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {results && results.contests.length > 0 && (
              <Command.Group heading={t("palette.contests")} className={groupClass}>
                {results.contests.map((c) => (
                  <Command.Item key={c.id} value={`c-${c.id}`} onSelect={() => go(`/contests/${c.id}`)} className={itemClass}>
                    <Trophy aria-hidden />
                    <span className="flex-1 truncate">{c.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {!q && (
              <>
                <Command.Group heading={t("palette.pages")} className={groupClass}>
                  {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item key={item.key} value={item.key} onSelect={() => go(item.href)} className={itemClass}>
                        <Icon aria-hidden />
                        <span className="flex-1">{t(`nav.${item.key}`)}</span>
                        <CornerDownLeft aria-hidden className="!size-3.5 opacity-0 [[data-selected=true]_&]:opacity-100" />
                      </Command.Item>
                    );
                  })}
                </Command.Group>
                <Command.Group heading={t("palette.actions")} className={groupClass}>
                  <Command.Item
                    value="theme"
                    onSelect={() => {
                      setTheme(resolvedTheme === "dark" ? "light" : "dark");
                      setOpen(false);
                    }}
                    className={itemClass}
                  >
                    <SunMoon aria-hidden />
                    {t("palette.toggleTheme")}
                  </Command.Item>
                  <Command.Item
                    value="shortcuts"
                    onSelect={() => {
                      setOpen(false);
                      setShortcuts(true);
                    }}
                    className={itemClass}
                  >
                    <Keyboard aria-hidden />
                    <span className="flex-1">{t("palette.shortcuts")}</span>
                    <Kbd>?</Kbd>
                  </Command.Item>
                </Command.Group>
              </>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
