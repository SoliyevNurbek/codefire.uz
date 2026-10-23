import type { ProblemQuery, SubmissionQuery, UserQuery } from "./api/types";

/** Every TanStack Query key in one place, so invalidation stays consistent. */
export const qk = {
  me: ["me"] as const,
  notifications: ["notifications"] as const,
  statuses: ["problem-statuses"] as const,
  problems: (q: ProblemQuery) => ["problems", q] as const,
  problem: (id: string) => ["problem", id] as const,
  languages: ["languages"] as const,
  submissions: (q: SubmissionQuery) => ["submissions", q] as const,
  submission: (id: number) => ["submission", id] as const,
  contests: ["contests"] as const,
  contest: (id: number) => ["contest", id] as const,
  users: (q: UserQuery) => ["users", q] as const,
  search: (q: string) => ["search", q] as const,
  blog: (slug: string) => ["blog", slug] as const,
};
