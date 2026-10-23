"use client";

import { useMutation } from "@tanstack/react-query";
import { Check, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { useMe } from "@/lib/hooks/use-session";
import { toast } from "@/lib/toast";

/** Optimistic follow. On your own profile it becomes "Edit profile". */
export function FollowButton({ username }: { username: string }) {
  const t = useTranslations();
  const { data: me, isPending } = useMe();
  const [following, setFollowing] = useState(false);
  const mutation = useMutation({
    mutationFn: (next: boolean) => api.users.follow(username, next),
    onMutate: (next) => setFollowing(next),
    onError: (_, next) => {
      setFollowing(!next);
      toast.error(t("common.errorBody"));
    },
  });

  if (isPending) return <Skeleton className="h-9 w-32" />;
  if (me?.username === username)
    return (
      <Button asChild variant="secondary">
        <Link href="/settings">{t("profile.editProfile")}</Link>
      </Button>
    );
  if (!me)
    return (
      <Button asChild variant="secondary">
        <Link href={`/login?next=/users/${username}`}>
          <UserPlus aria-hidden />
          {t("profile.follow")}
        </Link>
      </Button>
    );
  return (
    <Button variant={following ? "secondary" : "primary"} aria-pressed={following} onClick={() => mutation.mutate(!following)} className="min-w-32">
      {following ? <Check aria-hidden /> : <UserPlus aria-hidden />}
      {following ? t("profile.following") : t("profile.follow")}
    </Button>
  );
}
