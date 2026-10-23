"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/misc";
import { useUi } from "@/lib/stores/ui";

export function ShortcutsDialog() {
  const t = useTranslations("shortcuts");
  const open = useUi((s) => s.shortcutsOpen);
  const setOpen = useUi((s) => s.setShortcuts);
  const mod = typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl";

  const rows: [string, React.ReactNode][] = [
    [t("palette"), <><Kbd>{mod}</Kbd><Kbd>K</Kbd></>],
    [t("search"), <Kbd key="s">/</Kbd>],
    [t("goProblems"), <><Kbd>g</Kbd><span className="text-xs text-fg-subtle">{t("then")}</span><Kbd>p</Kbd></>],
    [t("goContests"), <><Kbd>g</Kbd><span className="text-xs text-fg-subtle">{t("then")}</span><Kbd>c</Kbd></>],
    [t("submit"), <><Kbd>{mod}</Kbd><Kbd>Enter</Kbd></>],
    [t("run"), <><Kbd>{mod}</Kbd><Kbd>&apos;</Kbd></>],
    [t("help"), <Kbd key="h">?</Kbd>],
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title={t("title")} className="max-w-md">
        <dl className="px-4 pt-3 pb-4">
          {rows.map(([label, keys]) => (
            <div key={label} className="flex h-10 items-center justify-between border-b border-border last:border-0">
              <dt className="text-fg-muted">{label}</dt>
              <dd className="flex items-center gap-1">{keys}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
