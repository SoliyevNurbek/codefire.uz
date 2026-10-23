// Banner and other live widgets: re-render at most every 30s (ISR).
export const revalidate = 30;

import { AppShell } from "@/components/shell/app-shell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
