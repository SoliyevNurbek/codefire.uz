import type { ProblemQuery, ProblemSort } from "./api/types";

type SearchParams = Record<string, string | string[] | undefined>;

/** URL ↔ filters for the problems list. Shared by the server page and the client explorer. */
export function parseProblemQuery(sp: SearchParams): ProblemQuery {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const status = get("status");
  const sort = get("sort");
  return {
    search: get("search") || undefined,
    tags: get("tags")?.split(",").filter(Boolean),
    minDifficulty: get("min") ? Number(get("min")) : undefined,
    maxDifficulty: get("max") ? Number(get("max")) : undefined,
    status: status === "solved" || status === "attempted" || status === "unsolved" ? status : undefined,
    sort: sort && ["id", "difficulty", "-difficulty", "solved", "-solved"].includes(sort) ? (sort as ProblemSort) : undefined,
  };
}

export function problemQueryToSearch(q: ProblemQuery) {
  const sp = new URLSearchParams();
  if (q.search) sp.set("search", q.search);
  if (q.tags?.length) sp.set("tags", q.tags.join(","));
  if (q.minDifficulty) sp.set("min", String(q.minDifficulty));
  if (q.maxDifficulty) sp.set("max", String(q.maxDifficulty));
  if (q.status) sp.set("status", q.status);
  if (q.sort) sp.set("sort", q.sort);
  return sp.toString();
}
