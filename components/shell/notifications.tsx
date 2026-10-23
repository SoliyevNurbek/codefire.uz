"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/menu";
import { Skeleton } from "@/components/ui/misc";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { qk } from "@/lib/query-keys";
import { formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";

export function Notifications() {
  const t = useTranslations("topbar");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const { data, isPending } = useQuery({ queryKey: qk.notifications, queryFn: () => api.notifications(), staleTime: 60_000 });
  const unread = data?.filter((n) => !n.read).length ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={unread ? `${t("notifications")}, ${t("unread", { count: unread })}` : t("notifications")} className="relative">
          <Bell aria-hidden />
          {unread > 0 && <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full border-2 border-surface bg-accent" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(360px,calc(100vw-2rem))]">
        <div className="flex h-11 items-center justify-between border-b border-border px-4">
          <p className="font-semibold">{t("notifications")}</p>
          {unread > 0 && <span className="text-xs text-fg-subtle">{t("unread", { count: unread })}</span>}
        </div>
        {isPending ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : !data?.length ? (
          <p className="px-4 py-8 text-center text-fg-muted">{t("noNotifications")}</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto py-1">
            {data.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "/"}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 px-4 py-2.5 hover:bg-surface-2"
                >
                  <span aria-hidden className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent")} />
                  <span className="flex-1">
                    <span className={cn("block", n.read ? "text-fg-muted" : "text-fg")}>{n.text}</span>
                    <span className="text-xs text-fg-subtle">{formatRelative(n.at, locale)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
