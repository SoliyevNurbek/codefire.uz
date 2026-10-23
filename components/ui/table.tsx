import { cn } from "@/lib/utils";

/**
 * Dense data table (Codeforces-like density): 36px rows, 13px text,
 * tabular numerals, sticky header. Numeric cells use <Td numeric>.
 */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm tabular-nums", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("sticky top-0 z-10 bg-surface-2", className)} {...props} />;
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr({
  className,
  highlight,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { highlight?: boolean }) {
  return (
    <tr
      className={cn(
        "h-9 border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-surface-2/60",
        highlight && "bg-accent-soft hover:bg-accent-soft",
        className,
      )}
      {...props}
    />
  );
}

export function Th({
  className,
  numeric,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        "h-8 border-b border-border px-3 text-left text-xs font-medium whitespace-nowrap text-fg-muted",
        numeric && "text-right",
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  numeric,
  mono,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean; mono?: boolean }) {
  return (
    <td
      className={cn(
        "px-3 py-1.5 align-middle whitespace-nowrap",
        numeric && "text-right font-mono",
        mono && "font-mono",
        className,
      )}
      {...props}
    />
  );
}
