/* eslint-disable @next/next/no-img-element -- static SVG wordmark, no optimisation needed */
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The Codefire wordmark (flame mark + "Codefire"). "Code" is dark on light themes and
 * light on dark ones, so there are two files; `compact` swaps to the flame alone when
 * the sidebar is collapsed.
 */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label="Codefire" className={cn("flex shrink-0 items-center rounded-md", className)}>
      <span className={cn("flex", compact && "collapsed:hidden")}>
        <img src="/logo.svg" alt="" width={103} height={32} className="h-8 w-auto dark:hidden" />
        <img src="/logo-dark.svg" alt="" width={103} height={32} className="hidden h-8 w-auto dark:block" />
      </span>
      {compact && <img src="/logo-mark.svg" alt="" width={27} height={32} className="hidden h-8 w-auto collapsed:block" />}
    </Link>
  );
}
