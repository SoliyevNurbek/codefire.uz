import { TableSkeleton } from "@/components/features/problems/problem-explorer";
import { PageContainer } from "@/components/shell/page";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <PageContainer>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 mb-6 h-4 w-72" />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Card className="overflow-hidden xl:mr-[344px]">
        <div className="h-8 bg-surface-2" />
        <TableSkeleton rows={14} />
      </Card>
    </PageContainer>
  );
}
