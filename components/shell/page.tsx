import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function PageContainer({ className, wide, ...props }: React.HTMLAttributes<HTMLDivElement> & { wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-6 sm:px-6", wide ? "max-w-[1600px]" : "max-w-[1280px]", className)} {...props} />;
}

export async function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const t = await getTranslations("common");
  return (
    <nav aria-label={t("breadcrumbs")} className="mb-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-fg-subtle">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-fg">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-6", className)}>
      {breadcrumbs}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 max-w-[70ch] text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** Main column + 320px right rail on wide screens; the rail drops below on smaller ones. */
export function WithRail({ children, rail }: { children: React.ReactNode; rail: React.ReactNode }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">{children}</div>
      <aside className="flex min-w-0 flex-col gap-6">{rail}</aside>
    </div>
  );
}
