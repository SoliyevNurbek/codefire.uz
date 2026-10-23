"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Avatar, Skeleton } from "@/components/ui/misc";
import { RankBadge } from "@/components/ui/rank";
import { Link, useRouter } from "@/i18n/navigation";
import { useMe, useSignOut } from "@/lib/hooks/use-session";
import { RANK_TEXT, rankForRating } from "@/lib/rank";
import { cn } from "@/lib/utils";
import { Notifications } from "./notifications";

export function UserArea() {
  const t = useTranslations();
  const { data: me, isPending } = useMe();
  const signOut = useSignOut();
  const router = useRouter();

  // Same footprint as the signed-in state, so nothing jumps when auth resolves.
  if (isPending) return <Skeleton className="h-9 w-[132px]" />;

  if (!me) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">{t("common.signIn")}</Link>
        </Button>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/register">{t("common.signUp")}</Link>
        </Button>
      </div>
    );
  }

  const rank = rankForRating(me.rating);
  return (
    <div className="flex items-center gap-1">
      <Notifications />
      <Menu>
        <MenuTrigger asChild>
          <button
            type="button"
            aria-label={t("topbar.account")}
            className="flex h-9 items-center gap-2 rounded-md pr-2 pl-1 hover:bg-surface-2"
          >
            <Avatar name={me.displayName} size={28} />
            <span className="hidden flex-col items-start leading-tight md:flex">
              <span className={cn("text-sm font-semibold", RANK_TEXT[rank.id])}>{me.username}</span>
              <span className="font-mono text-2xs text-fg-subtle tabular-nums">{me.rating}</span>
            </span>
          </button>
        </MenuTrigger>
        <MenuContent className="w-60">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={me.displayName} size={40} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{me.displayName}</p>
              <RankBadge rating={me.rating} showRating className="mt-1" />
            </div>
          </div>
          <MenuSeparator />
          <MenuItem onSelect={() => router.push(`/users/${me.username}`)}>
            <User aria-hidden /> {t("topbar.profile")}
          </MenuItem>
          <MenuItem onSelect={() => router.push("/settings")}>
            <Settings aria-hidden /> {t("topbar.settings")}
          </MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={() => void signOut()}>
            <LogOut aria-hidden /> {t("common.signOut")}
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}
