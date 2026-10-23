"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/misc";

/** The chart's JS loads after the profile has painted; the skeleton reserves its 240px. */
export const RatingChartLazy = dynamic(() => import("./rating-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[240px] w-full" />,
});
