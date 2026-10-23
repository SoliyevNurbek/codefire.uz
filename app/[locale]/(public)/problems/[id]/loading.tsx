import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="grid h-[calc(100dvh-var(--chrome))] lg:grid-cols-[46fr_54fr]">
      <div className="mx-auto w-full max-w-[76ch] px-5 py-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <div className="mt-8 flex flex-col gap-2">
          {[100, 95, 88, 60, 100, 72].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="hidden border-l border-border bg-surface lg:block">
        <div className="h-11 border-b border-border" />
      </div>
    </div>
  );
}
