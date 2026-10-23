"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({ text, className, label }: { text: string; className?: string; label?: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text).catch(() => undefined);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={copied ? t("copied") : (label ?? t("copy"))}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface px-2 text-xs font-medium text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg",
        copied && "text-verdict-ac",
        className,
      )}
    >
      {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
      <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
    </button>
  );
}
