"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type NativeProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "checked" | "defaultChecked">;
interface ToggleProps extends NativeProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** Native checkbox, styled. Same API as Radix (`checked`, `onCheckedChange`) at zero JS cost. */
export const Checkbox = forwardRef<HTMLInputElement, ToggleProps>(({ className, onCheckedChange, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={cn(
      "peer relative size-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-border-strong bg-surface transition-colors duration-150",
      "checked:border-accent checked:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
      // Check mark drawn with borders, so no icon font or SVG is needed.
      "after:absolute after:top-[2px] after:left-[5px] after:hidden after:h-[8px] after:w-[4px] after:rotate-45 after:border-r-2 after:border-b-2 after:border-accent-on checked:after:block",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

/** Native checkbox with role="switch": announced as on/off by screen readers. */
export const Switch = forwardRef<HTMLInputElement, ToggleProps>(({ className, onCheckedChange, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    role="switch"
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={cn(
      "relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-surface-3 transition-colors duration-150",
      "checked:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
      "before:absolute before:top-0.5 before:left-0.5 before:size-4 before:rounded-full before:bg-white before:shadow-sm before:transition-transform before:duration-150 checked:before:translate-x-4",
      className,
    )}
    {...props}
  />
));
Switch.displayName = "Switch";
