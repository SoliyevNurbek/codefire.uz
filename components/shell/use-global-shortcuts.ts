"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUi } from "@/lib/stores/ui";

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

/** Global keys: Ctrl/⌘+K palette, / search, g p / g c navigation, ? help. */
export function useGlobalShortcuts() {
  const router = useRouter();
  const pendingG = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useUi.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.setPalette(!ui.paletteOpen);
        return;
      }
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>("[data-page-search]");
        if (input) input.focus();
        else ui.setPalette(true);
      } else if (e.key === "?") {
        e.preventDefault();
        ui.setShortcuts(true);
      } else if (e.key === "g") {
        pendingG.current = Date.now();
      } else if (Date.now() - pendingG.current < 1000) {
        pendingG.current = 0;
        if (e.key === "p") router.push("/problems");
        if (e.key === "c") router.push("/contests");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

