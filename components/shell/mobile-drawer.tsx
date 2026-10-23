"use client";

import { useTranslations } from "next-intl";
import { Dialog, DrawerContent } from "@/components/ui/dialog";
import { useUi } from "@/lib/stores/ui";
import { Logo } from "./logo";
import { NavList } from "./sidebar";

export function MobileDrawer() {
  const t = useTranslations("nav");
  const open = useUi((s) => s.drawerOpen);
  const setOpen = useUi((s) => s.setDrawer);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DrawerContent title={t("mainNav")}>
        <div className="flex h-14 items-center border-b border-border px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Dialog>
  );
}

