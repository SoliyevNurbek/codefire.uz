import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Empty and error states. Copy rule: say what happened, then what to do.
 * Errors never apologize and always offer a way forward.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      {icon && (
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-surface-2 text-fg-subtle [&_svg]:size-5">
          {icon}
        </div>
      )}
      <p className="font-semibold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-lg border border-verdict-wa/30 bg-verdict-wa/5 p-4",
        className,
      )}
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-verdict-wa" />
      <div className="min-w-48 flex-1">
        <p className="font-semibold text-fg">{title}</p>
        {description && <p className="mt-0.5 text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
