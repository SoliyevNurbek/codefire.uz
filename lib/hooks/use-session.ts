"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/endpoints";
import { MOCK_SESSION_COOKIE, MOCKING } from "@/lib/api/client";
import type { Me } from "@/lib/api/types";
import { qk } from "@/lib/query-keys";
import { useHydrated } from "./use-hydrated";

/**
 * The signed-in user; `data` is null when signed out, undefined while loading.
 * Reports "loading" until hydration finishes: parts of the page can hydrate after
 * the session has already arrived, and must still match the signed-out SSR HTML.
 */
export function useMe() {
  const hydrated = useHydrated();
  const query = useQuery({ queryKey: qk.me, queryFn: () => api.auth.me(), staleTime: 5 * 60_000 });
  return hydrated ? query : { ...query, data: undefined, isPending: true as const };
}

/** After a successful login/register response. The real API has already set httpOnly cookies. */
export function useCompleteSignIn() {
  const client = useQueryClient();
  const router = useRouter();
  return (me: Me, next = "/") => {
    if (MOCKING) document.cookie = `${MOCK_SESSION_COOKIE}=${me.username}; path=/; max-age=2592000; samesite=lax`;
    client.setQueryData(qk.me, me);
    void client.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "me" });
    router.push(next);
    router.refresh();
  };
}

export function useSignOut() {
  const client = useQueryClient();
  const router = useRouter();
  return async () => {
    if (MOCKING) document.cookie = `${MOCK_SESSION_COOKIE}=; path=/; max-age=0`;
    else await api.auth.logout().catch(() => undefined);
    client.setQueryData(qk.me, null);
    client.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
    router.refresh();
  };
}
