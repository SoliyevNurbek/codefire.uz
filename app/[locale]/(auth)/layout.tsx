import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LocaleSwitcher } from "@/components/shell/locale-switcher";
import { Logo } from "@/components/shell/logo";

/** Minimal, centered shell for sign-in flows: no sidebar, no banner. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 pt-[8vh] pb-16">
        {children}
      </main>
    </div>
  );
}
