"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** next-themes injects a blocking script, so the right theme is set before first paint (no flash). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
