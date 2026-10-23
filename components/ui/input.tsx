import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Icon rendered inside the field on the left (e.g. a lucide <Search />). */
  leading?: React.ReactNode;
  /** Content on the right, typically a <Kbd> hint. */
  trailing?: React.ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leading, trailing, invalid, ...props }, ref) => (
    <div
      className={cn(
        "group flex h-9 w-full items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 transition-colors duration-150",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        invalid && "border-verdict-wa focus-within:border-verdict-wa focus-within:ring-verdict-wa",
        props.disabled && "opacity-50",
        className,
      )}
    >
      {leading && <span className="text-fg-subtle [&_svg]:size-4">{leading}</span>}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className="h-full min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-subtle focus-visible:outline-none disabled:cursor-not-allowed"
        {...props}
      />
      {trailing}
    </div>
  ),
);
Input.displayName = "Input";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-medium text-fg">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-verdict-wa">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
