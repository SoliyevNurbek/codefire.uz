import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Native select styled to the system: zero JS, platform pickers on mobile,
 * full keyboard and screen reader support for free.
 */
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("relative inline-flex", className)}>
      <select
        ref={ref}
        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border-strong bg-surface pr-8 pl-3 text-fg transition-colors duration-150 hover:bg-surface-2 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-subtle" />
    </div>
  ),
);
Select.displayName = "Select";
