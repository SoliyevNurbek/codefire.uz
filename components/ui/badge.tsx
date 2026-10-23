import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-full px-2 text-xs font-medium [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "bg-surface-2 text-fg-muted",
        outline: "border border-border-strong text-fg-muted",
        accent: "bg-accent-soft text-accent-text",
      },
      mono: { true: "font-mono tracking-tight", false: "" },
    },
    defaultVariants: { variant: "neutral", mono: false },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, mono, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, mono }), className)} {...props} />;
}
