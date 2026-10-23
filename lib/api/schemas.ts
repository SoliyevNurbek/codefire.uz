import { z } from "zod/mini";

/**
 * Zod schemas for every API entity (zod/mini: tree-shakable, ~5 KB in the browser). They are the single source of truth:
 * lib/api/types.ts re-exports the inferred types, and docs/API_CONTRACT.md
 * mirrors these shapes for the Django side. JSON keys are camelCase
 * (use djangorestframework-camel-case on the backend).
 */

export { z };

const isoDate = z.string(); // ISO-8601 with timezone, e.g. "2026-10-23T14:00:00+05:00"

export const verdictSchema = z.enum(["AC", "WA", "TLE", "MLE", "RE", "CE", "PENDING", "RUNNING"]);
export const problemStatusSchema = z.nullable(z.enum(["solved", "attempted"]));
export const contestStatusSchema = z.enum(["upcoming", "running", "finished"]);
export const contestFormatSchema = z.enum(["ICPC", "IOI"]);

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.optional(z.record(z.string(), z.array(z.string()))),
});

export const paginated = <T extends z.ZodMiniType>(item: T) =>
  z.object({
    count: z.int(),
    page: z.int(),
    pageSize: z.int(),
    results: z.array(item),
  });

/* ---------- Users ---------- */

export const userSummarySchema = z.object({
  username: z.string(),
  displayName: z.string(),
  rating: z.int(),
  country: z.string().check(z.length(2)), // ISO 3166-1 alpha-2
  avatarUrl: z.nullable(z.string()),
});

export const clanRefSchema = z.object({ slug: z.string(), name: z.string() });

export const userListItemSchema = z.extend(userSummarySchema, {
  region: z.nullable(z.string()),
  school: z.nullable(z.string()),
  contestsCount: z.int(),
  solvedCount: z.int(),
  contribution: z.int(),
});

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  earnedAt: isoDate,
});

export const userSchema = z.extend(userListItemSchema, {
  maxRating: z.int(),
  bio: z.nullable(z.string()),
  joinedAt: isoDate,
  streak: z.int(),
  clan: z.nullable(clanRefSchema),
  languages: z.array(z.object({ language: z.string(), count: z.int() })),
  tagStats: z.array(z.object({ tag: z.string(), solved: z.int() })),
  difficultyStats: z.array(z.object({ rating: z.int(), solved: z.int() })),
  achievements: z.array(achievementSchema),
});

export const meSchema = z.extend(userSchema, {
  phone: z.string(),
  email: z.nullable(z.string()),
  dailyGoal: z.int(),
  solvedToday: z.int(),
  lastProblem: z.nullable(z.object({ id: z.string(), name: z.string(), language: z.string() })),
});

export const ratingPointSchema = z.object({
  contestId: z.int(),
  contestName: z.string(),
  date: isoDate,
  rank: z.int(),
  oldRating: z.int(),
  newRating: z.int(),
});

export const activityDaySchema = z.object({ date: z.string(), count: z.int() }); // date: YYYY-MM-DD

/* ---------- Problems ---------- */

export const problemSummarySchema = z.object({
  id: z.string(), // "37A"
  name: z.string(),
  tags: z.array(z.string()),
  difficulty: z.int(), // on the rating scale, 800–3000
  solvedCount: z.int(),
  acceptance: z.number(), // 0–100, percent of accepted submissions
  status: problemStatusSchema, // null when signed out or untouched
});

export const exampleSchema = z.object({ input: z.string(), output: z.string() });

export const problemSchema = z.extend(problemSummarySchema, {
  legend: z.string(), // Markdown + KaTeX ($...$, $$...$$)
  inputSpec: z.string(),
  outputSpec: z.string(),
  notes: z.nullable(z.string()),
  examples: z.array(exampleSchema),
  timeLimitMs: z.int(),
  memoryLimitMb: z.int(),
  author: z.nullable(userSummarySchema),
  source: z.nullable(z.string()),
});

export const languageSchema = z.object({
  id: z.string(), // "cpp17"
  name: z.string(), // "GNU C++17"
  monaco: z.string(), // Monaco language id: "cpp"
  template: z.string(),
});

/* ---------- Submissions ---------- */

export const submissionSchema = z.object({
  id: z.int(),
  createdAt: isoDate,
  user: userSummarySchema,
  problem: z.object({ id: z.string(), name: z.string() }),
  language: z.string(), // languageSchema.name
  verdict: verdictSchema,
  failedTest: z.nullable(z.int()),
  timeMs: z.nullable(z.int()),
  memoryKb: z.nullable(z.int()),
  contestId: z.nullable(z.int()),
});

export const testResultSchema = z.object({
  index: z.int(),
  verdict: verdictSchema,
  timeMs: z.nullable(z.int()),
  memoryKb: z.nullable(z.int()),
});

export const submissionDetailSchema = z.extend(submissionSchema, {
  code: z.string(),
  compilerOutput: z.nullable(z.string()),
  tests: z.array(testResultSchema),
});

export const runResultSchema = z.object({
  results: z.array(
    z.object({
      example: z.int(),
      verdict: verdictSchema,
      output: z.string(),
      expected: z.string(),
      timeMs: z.int(),
    }),
  ),
  compilerOutput: z.nullable(z.string()),
});

/* ---------- Contests ---------- */

export const contestSchema = z.object({
  id: z.int(),
  name: z.string(),
  kind: z.enum(["contest", "training"]),
  status: contestStatusSchema,
  startsAt: isoDate,
  durationMin: z.int(),
  authors: z.array(userSummarySchema),
  participants: z.int(),
  rated: z.boolean(),
  division: z.nullable(z.int()), // 1 | 2 | 3
  format: contestFormatSchema,
  registered: z.boolean(), // false when signed out
});

export const contestProblemSchema = z.object({
  letter: z.string(),
  problemId: z.string(),
  name: z.string(),
  solvedCount: z.int(),
  attemptedCount: z.int(),
  maxScore: z.int(), // IOI: 100; ICPC: 1
});

export const contestDetailSchema = z.extend(contestSchema, {
  description: z.nullable(z.string()),
  problems: z.array(contestProblemSchema), // empty before start
  freezeAt: z.nullable(isoDate),
  announcements: z.array(z.object({ id: z.int(), at: isoDate, text: z.string() })),
  clarifications: z.array(
    z.object({
      id: z.int(),
      at: isoDate,
      problemLetter: z.nullable(z.string()),
      question: z.string(),
      answer: z.nullable(z.string()),
    }),
  ),
  // null until the contest is rated
  ratingChanges: z.nullable(
    z.array(
      z.object({
        user: userSummarySchema,
        rank: z.int(),
        oldRating: z.int(),
        newRating: z.int(),
      }),
    ),
  ),
});

export const standingsCellSchema = z.object({
  letter: z.string(),
  // ICPC: accepted / rejected / pending; null = no attempts
  result: z.nullable(z.enum(["accepted", "rejected", "pending"])),
  attempts: z.int(), // wrong tries before acceptance (ICPC) or total (IOI)
  timeMin: z.nullable(z.int()), // minute of acceptance / last change
  score: z.nullable(z.int()), // IOI points
  firstSolve: z.boolean(),
});

export const standingsRowSchema = z.object({
  rank: z.int(),
  user: userSummarySchema,
  solved: z.int(),
  penalty: z.int(), // ICPC minutes
  score: z.int(), // IOI total
  cells: z.array(standingsCellSchema),
});

export const standingsSchema = z.object({
  contestId: z.int(),
  format: contestFormatSchema,
  frozen: z.boolean(),
  updatedAt: isoDate,
  problems: z.array(z.object({ letter: z.string(), maxScore: z.int() })),
  rows: z.array(standingsRowSchema),
});

/* ---------- Community and learning ---------- */

export const clanSchema = z.object({
  slug: z.string(),
  name: z.string(),
  motto: z.string(),
  membersCount: z.int(),
  honor: z.int(),
  rank: z.int(),
  leader: userSummarySchema,
  region: z.nullable(z.string()),
});

export const clanDetailSchema = z.extend(clanSchema, {
  description: z.string(),
  createdAt: isoDate,
  members: z.array(
    z.object({
      user: userSummarySchema,
      honor: z.int(),
      role: z.enum(["leader", "officer", "member"]),
      joinedAt: isoDate,
    }),
  ),
  allies: z.array(clanRefSchema),
});

export const courseSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  lessonsCount: z.int(),
  problemsCount: z.int(),
  hours: z.int(),
  students: z.int(),
  progress: z.nullable(z.number()), // 0–100 when enrolled, null otherwise
});

export const lessonSchema = z.object({
  slug: z.string(),
  title: z.string(),
  kind: z.enum(["lesson", "practice"]),
  minutes: z.int(),
  done: z.boolean(),
  problemId: z.nullable(z.string()),
});

export const courseDetailSchema = z.extend(courseSchema, {
  modules: z.array(z.object({ title: z.string(), lessons: z.array(lessonSchema) })),
});

export const blogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  author: userSummarySchema,
  publishedAt: isoDate,
  readingMin: z.int(),
  likes: z.int(),
  commentsCount: z.int(),
  tags: z.array(z.string()),
  liked: z.boolean(),
});

export const commentSchema = z.object({
  id: z.int(),
  author: userSummarySchema,
  at: isoDate,
  text: z.string(),
  likes: z.int(),
});

export const blogPostDetailSchema = z.extend(blogPostSchema, {
  content: z.string(), // Markdown with fenced code blocks
  comments: z.array(commentSchema),
});

export const countryStatSchema = z.object({
  code: z.string(),
  name: z.string(),
  users: z.int(),
  solved: z.int(),
});

export const regionStatSchema = z.object({
  region: z.string(),
  users: z.int(),
  newUsers: z.int(),
  active: z.int(),
});

export const dailyStatSchema = z.object({
  date: z.string(),
  submissions: z.int(),
});

export const platformStatsSchema = z.object({
  users: z.int(),
  problems: z.int(),
  submissionsToday: z.int(),
  contestsHeld: z.int(),
});

export const notificationSchema = z.object({
  id: z.int(),
  at: isoDate,
  text: z.string(),
  href: z.nullable(z.string()),
  read: z.boolean(),
});

export const searchResultSchema = z.object({
  problems: z.array(z.pick(problemSummarySchema, { id: true, name: true, difficulty: true })),
  users: z.array(userSummarySchema),
  contests: z.array(z.pick(contestSchema, { id: true, name: true, status: true, startsAt: true })),
});

export const okSchema = z.object({ ok: z.literal(true) });
export const statusMapSchema = z.record(z.string(), z.enum(["solved", "attempted"]));
export const userFiltersSchema = z.object({
  countries: z.array(z.string()),
  regions: z.array(z.string()),
  schools: z.array(z.string()),
});
