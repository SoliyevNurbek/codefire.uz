"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      offset={{ bottom: 72, right: 16 }}
      mobileOffset={{ bottom: 72 }}
      toastOptions={{
        classNames: {
          toast: "!rounded-lg !border !border-border !bg-surface !text-fg !shadow-sm !font-sans",
          description: "!text-fg-muted",
          actionButton: "!bg-accent !text-accent-on !rounded-md",
        },
      }}
    />
  );
}

