"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { useMe } from "@/lib/hooks/use-session";
import { qk } from "@/lib/query-keys";
import { toast } from "@/lib/toast";

/**
 * Optimistic register / unregister. The page is server-rendered for everyone,
 * so personal state comes from one shared (deduplicated) client query.
 */
export function RegisterButton({ contestId, name, size = "sm" }: { contestId: number; name: string; size?: "sm" | "md" }) {
  const t = useTranslations("contests");
  const client = useQueryClient();
  const { data: me, isPending } = useMe();
  const mine = useQuery({ queryKey: qk.contests, queryFn: () => api.contests.list(), enabled: !!me, staleTime: 60_000 });
  const [override, setOverride] = useState<boolean | null>(null);
  const registered = override ?? mine.data?.find((c) => c.id === contestId)?.registered ?? false;

  const mutation = useMutation({
    mutationFn: (next: boolean) => (next ? api.contests.register(contestId) : api.contests.unregister(contestId)),
    onMutate: (next) => {
      const previous = registered;
      setOverride(next);
      return { previous };
    },
    onSuccess: (_, next) => {
      if (next) toast.success(t("registeredToast", { name }));
      void client.invalidateQueries({ queryKey: qk.contests });
    },
    onError: (_, __, ctx) => {
      setOverride(ctx?.previous ?? false);
      toast.error(t("registerFailed"));
    },
  });

  if (isPending || (me && mine.isPending)) return <Skeleton className="h-8 w-36" />;
  if (!me)
    return (
      <Button asChild size={size} variant="secondary" className="min-w-36">
        <Link href={`/login?next=/contests/${contestId}`}>{t("register")}</Link>
      </Button>
    );

  return registered ? (
    <Button
      size={size}
      variant="secondary"
      onClick={() => mutation.mutate(false)}
      title={t("unregister")}
      className="min-w-36 text-verdict-ac"
    >
      <Check aria-hidden />
      {t("registered")}
      <span className="sr-only">. {t("unregister")}</span>
    </Button>
  ) : (
    <Button size={size} onClick={() => mutation.mutate(true)} className="min-w-36">
      {t("register")}
      <span className="sr-only">: {name}</span>
    </Button>
  );
}
