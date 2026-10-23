"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { StatusIcon } from "@/components/features/status-icon";
import { api } from "@/lib/api/endpoints";
import { useMe } from "@/lib/hooks/use-session";
import { qk } from "@/lib/query-keys";

/** The signed-in user's solve status for one problem, layered onto server-rendered lists. */
export function MyStatus({ problemId }: { problemId: string }) {
  const t = useTranslations("status");
  const { data: me } = useMe();
  const { data } = useQuery({ queryKey: qk.statuses, queryFn: () => api.problems.statuses(), enabled: !!me, staleTime: 60_000 });
  return <StatusIcon status={data?.[problemId]} labels={{ solved: t("solved"), attempted: t("attempted") }} />;
}
