import type { z } from "zod/mini";
import type * as s from "./schemas";

/** Every API entity, inferred from lib/api/schemas.ts. */
export type Verdict = z.infer<typeof s.verdictSchema>;
export type ProblemStatus = z.infer<typeof s.problemStatusSchema>;
export type ContestStatus = z.infer<typeof s.contestStatusSchema>;
export type ContestFormat = z.infer<typeof s.contestFormatSchema>;
export type ApiErrorBody = z.infer<typeof s.apiErrorSchema>;
export type Paginated<T> = { count: number; page: number; pageSize: number; results: T[] };

export type UserSummary = z.infer<typeof s.userSummarySchema>;
export type UserListItem = z.infer<typeof s.userListItemSchema>;
export type User = z.infer<typeof s.userSchema>;
export type Me = z.infer<typeof s.meSchema>;
export type Achievement = z.infer<typeof s.achievementSchema>;
export type RatingPoint = z.infer<typeof s.ratingPointSchema>;
export type ActivityDay = z.infer<typeof s.activityDaySchema>;

export type ProblemSummary = z.infer<typeof s.problemSummarySchema>;
export type Problem = z.infer<typeof s.problemSchema>;
export type Example = z.infer<typeof s.exampleSchema>;
export type Language = z.infer<typeof s.languageSchema>;

export type Submission = z.infer<typeof s.submissionSchema>;
export type SubmissionDetail = z.infer<typeof s.submissionDetailSchema>;
export type TestResult = z.infer<typeof s.testResultSchema>;
export type RunResult = z.infer<typeof s.runResultSchema>;

export type Contest = z.infer<typeof s.contestSchema>;
export type ContestDetail = z.infer<typeof s.contestDetailSchema>;
export type ContestProblem = z.infer<typeof s.contestProblemSchema>;
export type Standings = z.infer<typeof s.standingsSchema>;
export type StandingsRow = z.infer<typeof s.standingsRowSchema>;
export type StandingsCell = z.infer<typeof s.standingsCellSchema>;

export type Clan = z.infer<typeof s.clanSchema>;
export type ClanDetail = z.infer<typeof s.clanDetailSchema>;
export type Course = z.infer<typeof s.courseSchema>;
export type CourseDetail = z.infer<typeof s.courseDetailSchema>;
export type Lesson = z.infer<typeof s.lessonSchema>;
export type BlogPost = z.infer<typeof s.blogPostSchema>;
export type BlogPostDetail = z.infer<typeof s.blogPostDetailSchema>;
export type Comment = z.infer<typeof s.commentSchema>;
export type CountryStat = z.infer<typeof s.countryStatSchema>;
export type PlatformStats = z.infer<typeof s.platformStatsSchema>;
export type RegionStat = z.infer<typeof s.regionStatSchema>;
export type DailyStat = z.infer<typeof s.dailyStatSchema>;
export type Notification = z.infer<typeof s.notificationSchema>;
export type SearchResult = z.infer<typeof s.searchResultSchema>;

/* ---------- Request params ---------- */

export type ProblemSort = "id" | "difficulty" | "-difficulty" | "solved" | "-solved";
export interface ProblemQuery {
  search?: string;
  tags?: string[];
  minDifficulty?: number;
  maxDifficulty?: number;
  status?: "solved" | "attempted" | "unsolved";
  sort?: ProblemSort;
  page?: number;
}

export interface SubmissionQuery {
  user?: string;
  problem?: string;
  verdict?: Verdict;
  contest?: number;
  page?: number;
}

export interface UserQuery {
  sort?: "rating" | "solved" | "contribution";
  country?: string;
  region?: string;
  school?: string;
  search?: string;
  page?: number;
}

/* ---------- WebSocket messages ---------- */

/** ws/submissions/{id}/ */
export type SubmissionEvent =
  | { type: "progress"; verdict: "PENDING" | "RUNNING"; test: number; totalTests: number }
  | {
      type: "result";
      verdict: Verdict;
      failedTest: number | null;
      timeMs: number | null;
      memoryKb: number | null;
      totalTests: number;
    };

/** ws/contests/{id}/standings/ */
export type StandingsEvent =
  | { type: "snapshot"; standings: Standings }
  | { type: "cell"; username: string; cell: StandingsCell };
