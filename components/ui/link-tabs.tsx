import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Tabs that are real links (?tab=…): server-rendered, shareable, and each
 * panel loads only its own data. Same look as <TabsList>.
 */
export function LinkTabs({
  tabs,
  active,
  label,
  className,
}: {
  tabs: { key: string; label: React.ReactNode; href: string; count?: number }[];
  active: string;
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex items-center gap-1 overflow-x-auto border-b border-border", className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          scroll={false}
          aria-current={tab.key === active ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex h-10 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 font-medium whitespace-nowrap text-fg-muted transition-colors duration-150 hover:text-fg",
            tab.key === active && "border-accent text-fg",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="rounded-full bg-surface-2 px-1.5 font-mono text-2xs text-fg-subtle tabular-nums">{tab.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
