"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";

/** Password field with a show/hide toggle. Labels come from the caller (i18n). */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "trailing"> & { showLabel: string; hideLabel: string }>(
  ({ showLabel, hideLabel, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-1", className)}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? hideLabel : showLabel}
            aria-pressed={visible}
            className="flex size-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            {visible ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        }
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";
