"use client";

import { useTranslations } from "next-intl";
import { useNow } from "@/lib/hooks/use-now";
import { formatCountdown } from "@/lib/time";
import { cn } from "@/lib/utils";

/**
 * Live countdown in mono tabular figures. Width is reserved with a fixed
 * min-width so ticking never shifts layout (CLS 0).
 */
export function Countdown({ to, className }: { to: string; className?: string }) {
  const now = useNow();
  const t = useTranslations("common");
  const ms = new Date(to).getTime() - (now ?? 0);
  const text = now === null ? "--:--:--" : formatCountdown(ms, t("day"));
  return (
    <time
      dateTime={to}
      className={cn("inline-block min-w-[8ch] font-mono tabular-nums", ms > 86_400_000 && "min-w-[13ch]", className)}
    >
      {text}
    </time>
  );
}
