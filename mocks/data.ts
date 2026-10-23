/**
 * Deterministic mock database. Everything is generated from a fixed seed so the
 * server render and the browser see identical data. Times are relative to
 * anchor() (now, floored to 5 minutes) so the "running" contest is always running.
 */
import type {
  ActivityDay,
  BlogPostDetail,
  ClanDetail,
  Contest,
  ContestDetail,
  CourseDetail,
  Me,
  Problem,
  RatingPoint,
  Standings,
  StandingsCell,
  StandingsRow,
  Submission,
  User,
  UserSummary,
  Verdict,
} from "@/lib/api/types";
import {
  ACHIEVEMENTS,
  BLOG_POSTS,
  CLANS,
  COUNTRIES,
  COURSES,
  FEATURED_PROBLEMS,
  FIRST_NAMES_F,
  FIRST_NAMES_M,
  LANGUAGES,
  LAST_NAMES,
  PROBLEM_TITLES,
  REGIONS,
  SCHOOLS,
  TAGS,
} from "./content";
import { finalizeStandings } from "@/lib/standings";

export { COUNTRIES, LANGUAGES, TAGS };

/* ---------- Seeded randomness ---------- */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rng(seed: number) {
  const next = mulberry32(seed);
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)],
    chance: (p: number) => next() < p,
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function anchor() {
  return Math.floor(Date.now() / (5 * MIN)) * 5 * MIN;
}

/** ISO string in Tashkent time (UTC+5), the format the Django API returns. */
export function iso(ms: number) {
  const d = new Date(ms + 5 * HOUR);
  return d.toISOString().replace("Z", "+05:00").replace(/\.\d{3}/, "");
}

/* ---------- Users ---------- */

export const ME_USERNAME = "sardorbek";

interface MockUser extends User {
  email: string;
}

const FIXED_USERS: Partial<MockUser>[] = [
  { username: "aziz_uz", displayName: "Aziz Karimov", rating: 2731, region: "Toshkent", school: "INHA University" },
  { username: "timur", displayName: "Timur Rahimov", rating: 2468, region: "Samarqand", school: "Samarqand davlat universiteti" },
  { username: "dilnoza.k", displayName: "Dilnoza Qodirova", rating: 2390, region: "Toshkent", school: "TATU" },
  { username: "behruz_x", displayName: "Behruz Xolmatov", rating: 2215, region: "Xorazm", school: "Al-Xorazmiy maktabi" },
  { username: "nodira_a", displayName: "Nodira Aliyeva", rating: 1840, region: "Toshkent", school: "TATU" },
  { username: "malika.dev", displayName: "Malika Ergasheva", rating: 1310, region: "Farg'ona", school: "Farg'ona davlat universiteti" },
  { username: "jasur_k", displayName: "Jasur Normatov", rating: 1040, region: "Buxoro", school: "Buxoro davlat universiteti" },
  { username: ME_USERNAME, displayName: "Sardor Tursunov", rating: 1642, region: "Toshkent", school: "TATU" },
];

function makeUsers(): MockUser[] {
  const r = rng(42);
  const users: MockUser[] = [];
  const taken = new Set<string>();
  const total = 260;

  for (let i = 0; i < total; i++) {
    const fixed = FIXED_USERS[i];
    const female = r.chance(0.32);
    const first = female ? r.pick(FIRST_NAMES_F) : r.pick(FIRST_NAMES_M);
    const last = r.pick(LAST_NAMES) + (female ? "a" : "");
    let username = fixed?.username ?? `${first.toLowerCase().replace("'", "")}${r.pick(["", "_", "."])}${r.pick([last.toLowerCase().replace("'", "").slice(0, 3), String(r.int(1, 99)), "dev", "cf"])}`;
    while (taken.has(username)) username += r.int(0, 9);
    taken.add(username);

    // Rating distribution: long tail like any real judge.
    const base = 900 + Math.floor(Math.pow(r.next(), 2.2) * 1700);
    const rating = fixed?.rating ?? base;
    const country = r.chance(0.86) ? "UZ" : r.pick(["KZ", "KG", "TJ", "TM", "RU", "TR", "KR"]);
    const solved = Math.max(3, Math.round((rating - 700) * (0.4 + r.next() * 0.5)));
    const clanIdx = r.int(0, CLANS.length + 3);

    users.push({
      username,
      displayName: fixed?.displayName ?? `${first} ${last}`,
      rating,
      maxRating: rating + r.int(0, 140),
      country: fixed ? "UZ" : country,
      avatarUrl: null,
      region: fixed?.region ?? (country === "UZ" ? r.pick(REGIONS) : null),
      school: fixed?.school ?? (r.chance(0.8) ? r.pick(SCHOOLS) : null),
      contestsCount: r.int(2, 90),
      solvedCount: solved,
      contribution: r.int(-5, 60),
      bio: null,
      joinedAt: iso(Date.UTC(2023, r.int(0, 11), r.int(1, 28))),
      streak: r.int(0, 40),
      clan: clanIdx < CLANS.length ? { slug: CLANS[clanIdx].slug, name: CLANS[clanIdx].name } : null,
      languages: [],
      tagStats: [],
      difficultyStats: [],
      achievements: [],
      email: `${username.replace(".", "")}@mail.uz`,
    });
  }
  const me = users.find((u) => u.username === ME_USERNAME)!;
  Object.assign(me, {
    maxRating: 1710,
    streak: 12,
    solvedCount: 312,
    contestsCount: 34,
    contribution: 18,
    clan: { slug: "tatu-algo", name: "TATU Algo" },
    bio: "TATU 3-kurs. C++ va ozgina Rust. Graflarni yaxshi ko'raman.",
    email: "sardor@mail.uz",
  });
  return users.sort((a, b) => b.rating - a.rating);
}

export const USERS = makeUsers();
const USER_MAP = new Map(USERS.map((u) => [u.username, u]));

export function summary(u: Pick<User, "username" | "displayName" | "rating" | "country" | "avatarUrl">): UserSummary {
  return { username: u.username, displayName: u.displayName, rating: u.rating, country: u.country, avatarUrl: u.avatarUrl };
}

export function findUser(username: string) {
  return USER_MAP.get(username);
}

/** Full profile with derived stats, built on demand. */
export function userProfile(username: string): User | undefined {
  const u = USER_MAP.get(username);
  if (!u) return undefined;
  const r = rng(hash(username));
  const total = u.solvedCount;
  const langs = ["GNU C++17", "Python 3.12", "Java 21", "Go 1.23", "Rust 1.82"];
  const mainShare = 0.55 + r.next() * 0.3;
  const languages = langs
    .slice(0, r.int(2, 5))
    .map((language, i) => ({ language, count: Math.round(total * (i === 0 ? mainShare : (1 - mainShare) / (i + 1))) }))
    .filter((l) => l.count > 0);
  const tagStats = TAGS.map((tag) => ({ tag, solved: Math.round(total * r.next() * 0.35) }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 10);
  const difficultyStats = Array.from({ length: 12 }, (_, i) => {
    const rating = 800 + i * 200;
    const reach = Math.max(0, 1 - Math.max(0, rating - u.rating) / 500);
    return { rating, solved: Math.round(total * 0.18 * reach * Math.exp(-i / 6) * (0.7 + r.next() * 0.6)) };
  });
  const achievements = ACHIEVEMENTS.filter((_, i) => i < 2 || r.chance(0.55)).map((a, i) => ({
    ...a,
    earnedAt: iso(anchor() - (i + 1) * r.int(10, 60) * DAY),
  }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, ...publicUser } = u;
  return { ...publicUser, languages, tagStats, difficultyStats, achievements };
}

/* ---------- Problems ---------- */

interface MockProblem extends Problem {
  round: number;
}

const FEATURED_BY_ID = new Map(FEATURED_PROBLEMS.map((p) => [p.id, p]));

function genericStatement(name: string, seed: number) {
  const r = rng(seed);
  const n = r.pick(["2 \\cdot 10^5", "10^5", "5 \\cdot 10^5", "10^6"]);
  const n0 = r.int(3, 6);
  const arr = Array.from({ length: n0 }, () => r.int(1, 9));
  const answer = arr.reduce((a, b) => a + b, 0) % 7;
  return {
    legend: `${name} haqidagi masala. Sizga $n$ ta butun sondan iborat $a_1, a_2, \\ldots, a_n$ massiv berilgan.\n\nShunday $l \\le r$ juftlikni topingki, $\\left(\\sum_{i=l}^{r} a_i\\right) \\bmod 7$ eng katta bo'lsin. Shu qiymatni chiqaring.`,
    inputSpec: `Birinchi qatorda $n$ ($1 \\le n \\le ${n}$). Ikkinchi qatorda $a_1, \\ldots, a_n$ ($1 \\le a_i \\le 10^9$).`,
    outputSpec: "Bitta butun son — eng katta qoldiq.",
    examples: [{ input: `${n0}\n${arr.join(" ")}`, output: String(Math.max(answer, 6)) }],
  };
}

const TITLE_ADJECTIVES = ["Sehrli", "Qadimiy", "Yashirin", "Katta", "Kichik", "Uzun", "Qisqa", "Ikkilik"];

function makeProblems(): MockProblem[] {
  const r = rng(7);
  const featuredRounds = FEATURED_PROBLEMS.map((p) => parseInt(p.id, 10));
  const rounds = new Set<number>(featuredRounds);
  for (let c = 136; c <= 148; c++) rounds.add(c); // contest rounds
  let n = 1;
  while (rounds.size < 72) {
    rounds.add(n);
    n += r.int(2, 9);
  }
  const sorted = [...rounds].sort((a, b) => a - b);
  const problems: MockProblem[] = [];
  let titleIdx = 0;

  for (const round of sorted) {
    const count = round >= 136 && round <= 148 ? 6 : r.int(4, 6);
    const base = 800 + Math.floor(r.next() * 6) * 100;
    for (let i = 0; i < count; i++) {
      const id = `${round}${"ABCDEF"[i]}`;
      const featured = FEATURED_BY_ID.get(id);
      const difficulty = featured?.difficulty ?? Math.min(3000, base + i * r.int(2, 4) * 100);
      const cycle = Math.floor(titleIdx / PROBLEM_TITLES.length);
      const title = PROBLEM_TITLES[titleIdx % PROBLEM_TITLES.length];
      const name =
        featured?.name ??
        (cycle ? `${TITLE_ADJECTIVES[(cycle - 1) % TITLE_ADJECTIVES.length]} ${title[0].toLowerCase()}${title.slice(1)}` : title);
      titleIdx++;
      const solvedCount = Math.max(3, Math.round(14000 * Math.exp(-(difficulty - 800) / 380) * (0.6 + r.next() * 0.8)));
      const tagCount = r.int(1, 3);
      const tags = featured?.tags ?? [...new Set(Array.from({ length: tagCount }, () => r.pick(TAGS)))];
      const generic = genericStatement(name, round * 10 + i);
      problems.push({
        id,
        round,
        name,
        tags,
        difficulty,
        solvedCount,
        acceptance: Math.round((72 - (difficulty - 800) / 45 + r.next() * 10) * 10) / 10,
        status: null,
        legend: featured?.legend ?? generic.legend,
        inputSpec: featured?.inputSpec ?? generic.inputSpec,
        outputSpec: featured?.outputSpec ?? generic.outputSpec,
        notes: featured?.notes ?? null,
        examples: featured?.examples ?? generic.examples,
        timeLimitMs: featured?.timeLimitMs ?? r.pick([1000, 1000, 2000, 3000]),
        memoryLimitMb: featured?.memoryLimitMb ?? r.pick([256, 256, 512]),
        author: summary(USERS[r.int(0, 30)]),
        source: round >= 136 && round <= 148 ? `Codefire Round #${round}` : null,
      });
    }
  }
  return problems;
}

export const PROBLEMS = makeProblems();
const PROBLEM_MAP = new Map(PROBLEMS.map((p) => [p.id, p]));
export const findProblem = (id: string) => PROBLEM_MAP.get(id.toUpperCase());

/** Signed-in user's solved / attempted problems. */
export const MY_STATUSES: Record<string, "solved" | "attempted"> = (() => {
  const r = rng(99);
  const out: Record<string, "solved" | "attempted"> = {};
  for (const p of PROBLEMS) {
    const pSolve = Math.max(0.02, 0.92 - (p.difficulty - 800) / 1300);
    if (r.chance(pSolve * 0.75)) out[p.id] = "solved";
    else if (r.chance(0.08)) out[p.id] = "attempted";
  }
  out["37A"] = "solved";
  out["112B"] = "attempted";
  delete out["208C"];
  return out;
})();

/* ---------- Contests ---------- */

interface ContestSeed {
  id: number;
  name: string;
  kind: "contest" | "training";
  startOffsetMin: number; // relative to anchor()
  durationMin: number;
  rated: boolean;
  division: number | null;
  format: "ICPC" | "IOI";
  participants: number;
  registered: boolean;
}

const CONTEST_SEEDS: ContestSeed[] = [
  { id: 148, name: "Codefire Round #148 (Div. 2)", kind: "contest", startOffsetMin: -100, durationMin: 150, rated: true, division: 2, format: "ICPC", participants: 1243, registered: true },
  { id: 149, name: "Haftalik musobaqa #49", kind: "contest", startOffsetMin: 5 * 60 + 25, durationMin: 120, rated: true, division: 3, format: "ICPC", participants: 412, registered: false },
  { id: 150, name: "Codefire Round #150 (Div. 1)", kind: "contest", startOffsetMin: 3 * 24 * 60 + 200, durationMin: 150, rated: true, division: 1, format: "ICPC", participants: 287, registered: false },
  { id: 151, name: "Maktab o'quvchilari olimpiadasi — saralash", kind: "contest", startOffsetMin: 6 * 24 * 60 + 60, durationMin: 240, rated: false, division: null, format: "IOI", participants: 1980, registered: true },
  { id: 147, name: "Codefire Round #147 (Div. 2)", kind: "contest", startOffsetMin: -4 * 24 * 60, durationMin: 150, rated: true, division: 2, format: "ICPC", participants: 1184, registered: true },
  { id: 146, name: "Haftalik musobaqa #48", kind: "contest", startOffsetMin: -7 * 24 * 60, durationMin: 120, rated: true, division: 3, format: "ICPC", participants: 506, registered: true },
  { id: 145, name: "Respublika olimpiadasi — sinov turi", kind: "contest", startOffsetMin: -10 * 24 * 60, durationMin: 240, rated: false, division: null, format: "IOI", participants: 734, registered: false },
  { id: 144, name: "Codefire Round #144 (Div. 1)", kind: "contest", startOffsetMin: -14 * 24 * 60, durationMin: 150, rated: true, division: 1, format: "ICPC", participants: 341, registered: false },
  { id: 143, name: "Haftalik musobaqa #47", kind: "contest", startOffsetMin: -14 * 24 * 60 - 3 * 24 * 60, durationMin: 120, rated: true, division: 3, format: "ICPC", participants: 488, registered: true },
  { id: 142, name: "Codefire Round #142 (Div. 2)", kind: "contest", startOffsetMin: -21 * 24 * 60, durationMin: 150, rated: true, division: 2, format: "ICPC", participants: 1102, registered: true },
  { id: 141, name: "TATU ichki chempionati", kind: "contest", startOffsetMin: -26 * 24 * 60, durationMin: 300, rated: false, division: null, format: "ICPC", participants: 96, registered: true },
  { id: 140, name: "Haftalik musobaqa #46", kind: "contest", startOffsetMin: -28 * 24 * 60, durationMin: 120, rated: true, division: 3, format: "ICPC", participants: 455, registered: false },
  { id: 139, name: "Codefire Round #139 (Div. 2)", kind: "contest", startOffsetMin: -35 * 24 * 60, durationMin: 150, rated: true, division: 2, format: "ICPC", participants: 1066, registered: true },
  // Trainings: always open, no rating.
  { id: 138, name: "Graflar bo'yicha mashg'ulot", kind: "training", startOffsetMin: -40 * 24 * 60, durationMin: 60 * 24 * 365, rated: false, division: null, format: "ICPC", participants: 2310, registered: true },
  { id: 137, name: "Dinamik dasturlash haftaligi", kind: "training", startOffsetMin: -60 * 24 * 60, durationMin: 60 * 24 * 365, rated: false, division: null, format: "IOI", participants: 1745, registered: false },
  { id: 136, name: "Yangi boshlovchilar uchun 20 masala", kind: "training", startOffsetMin: -90 * 24 * 60, durationMin: 60 * 24 * 365, rated: false, division: null, format: "ICPC", participants: 5120, registered: true },
];

export const registeredContests = new Set(CONTEST_SEEDS.filter((c) => c.registered).map((c) => c.id));

export function contestStatus(seed: ContestSeed, now = anchor()) {
  const start = now + seed.startOffsetMin * MIN;
  const end = start + seed.durationMin * MIN;
  return now < start ? "upcoming" : now < end ? "running" : "finished";
}

function contestFrom(seed: ContestSeed, signedIn: boolean): Contest {
  const r = rng(seed.id);
  const now = anchor();
  return {
    id: seed.id,
    name: seed.name,
    kind: seed.kind,
    status: contestStatus(seed, now),
    startsAt: iso(now + seed.startOffsetMin * MIN),
    durationMin: seed.durationMin,
    authors: [summary(USERS[r.int(0, 6)]), ...(r.chance(0.5) ? [summary(USERS[r.int(7, 20)])] : [])],
    participants: seed.participants,
    rated: seed.rated,
    division: seed.division,
    format: seed.format,
    registered: signedIn && registeredContests.has(seed.id),
  };
}

export function contests(signedIn: boolean) {
  return CONTEST_SEEDS.map((s) => contestFrom(s, signedIn));
}

export function contestDetail(id: number, signedIn: boolean): ContestDetail | undefined {
  const seed = CONTEST_SEEDS.find((c) => c.id === id);
  if (!seed) return undefined;
  const base = contestFrom(seed, signedIn);
  const now = anchor();
  const start = now + seed.startOffsetMin * MIN;
  const end = start + seed.durationMin * MIN;
  const round = seed.kind === "training" ? null : seed.id;
  const pool =
    round && PROBLEMS.some((p) => p.round === round)
      ? PROBLEMS.filter((p) => p.round === round)
      : PROBLEMS.filter((p) => p.round % 7 === seed.id % 7).slice(0, 8);
  const started = base.status !== "upcoming";
  const standings = started ? buildStandings(seed, pool) : null;

  return {
    ...base,
    description:
      seed.format === "IOI"
        ? "IOI formati: har bir masala 100 ball, qisman ballar hisoblanadi. Jarima vaqti yo'q."
        : "ICPC formati: yechilgan masalalar soni, keyin jarima vaqti. Har bir noto'g'ri urinish +20 daqiqa.",
    problems: started
      ? pool.map((p, i) => ({
          letter: "ABCDEFGH"[i],
          problemId: p.id,
          name: p.name,
          solvedCount: standings!.rows.filter((r) => r.cells[i].result === "accepted").length,
          attemptedCount: standings!.rows.filter((r) => r.cells[i].result !== null).length,
          maxScore: seed.format === "IOI" ? 100 : 1,
        }))
      : [],
    freezeAt: seed.kind === "contest" && seed.format === "ICPC" ? iso(end - 60 * MIN) : null,
    announcements: started
      ? [
          { id: 1, at: iso(start + 25 * MIN), text: "C masalasida cheklov aniqlashtirildi: $1 \\le k \\le n$." },
          { id: 2, at: iso(start + 5 * MIN), text: "Omad! Savollaringizni «Savollar» bo'limi orqali yuboring." },
        ]
      : [],
    clarifications: started
      ? [
          { id: 1, at: iso(start + 18 * MIN), problemLetter: "B", question: "Massiv bo'sh bo'lishi mumkinmi?", answer: "Yo'q, n ≥ 1." },
          { id: 2, at: iso(start + 41 * MIN), problemLetter: "D", question: "Javob 64 bitga sig'adimi?", answer: "Shartni diqqat bilan o'qing." },
          { id: 3, at: iso(start + 70 * MIN), problemLetter: null, question: "Raund uzaytiriladimi?", answer: null },
        ]
      : [],
    ratingChanges:
      base.status === "finished" && seed.rated && standings
        ? standings.rows.slice(0, 120).map((row) => {
            const expected = 1 + USERS.findIndex((u) => u.username === row.user.username) / 2;
            const delta = Math.round(Math.max(-90, Math.min(140, (expected - row.rank) * 0.9)));
            return { user: row.user, rank: row.rank, oldRating: row.user.rating - delta, newRating: row.user.rating };
          })
        : null,
  };
}

/* ---------- Standings ---------- */

function buildStandings(seed: ContestSeed, pool: MockProblem[]): Standings {
  const r = rng(seed.id * 31);
  const now = anchor();
  const start = now + seed.startOffsetMin * MIN;
  const end = start + seed.durationMin * MIN;
  const elapsed = Math.min(seed.durationMin, Math.max(0, Math.floor((now - start) / MIN)));
  const freezeMin = seed.durationMin - 60;
  const frozen = seed.kind === "contest" && seed.format === "ICPC" && now < end && elapsed >= freezeMin;
  const ioi = seed.format === "IOI";

  const count = Math.min(seed.participants, 320);
  const entrants = USERS.slice(0, count).map((u) => u);
  if (!entrants.some((u) => u.username === ME_USERNAME)) entrants[count - 1] = USER_MAP.get(ME_USERNAME)!;

  const rows: StandingsRow[] = entrants.map((u) => {
    const skill = u.rating + r.int(-250, 250);
    const cells: StandingsCell[] = pool.map((p, i) => {
      const gap = skill - p.difficulty;
      const pSolve = 1 / (1 + Math.exp(-gap / 160));
      const tried = r.chance(Math.min(1, pSolve + 0.25));
      const letter = "ABCDEFGH"[i];
      if (!tried) return { letter, result: null, attempts: 0, timeMin: null, score: null, firstSolve: false };
      const solvedAt = Math.round(5 + (i + 1) * 12 * (1.4 - pSolve) + r.int(0, 25));
      const wrong = r.chance(0.45) ? r.int(1, 3) : 0;
      if (ioi) {
        const score = r.chance(pSolve) ? 100 : r.pick([0, 12, 20, 35, 48, 60, 72]);
        return { letter, result: score === 100 ? "accepted" : "rejected", attempts: wrong + 1, timeMin: Math.min(solvedAt, elapsed), score, firstSolve: false };
      }
      if (solvedAt > elapsed) return { letter, result: null, attempts: 0, timeMin: null, score: null, firstSolve: false };
      if (frozen && solvedAt >= freezeMin)
        return { letter, result: "pending", attempts: wrong + 1, timeMin: solvedAt, score: null, firstSolve: false };
      return r.chance(pSolve)
        ? { letter, result: "accepted", attempts: wrong, timeMin: solvedAt, score: null, firstSolve: false }
        : { letter, result: "rejected", attempts: wrong + 1, timeMin: solvedAt, score: null, firstSolve: false };
    });
    const solved = cells.filter((c) => c.result === "accepted").length;
    const penalty = cells.reduce((sum, c) => (c.result === "accepted" ? sum + (c.timeMin ?? 0) + 20 * c.attempts : sum), 0);
    const score = cells.reduce((sum, c) => sum + (c.score ?? 0), 0);
    return { rank: 0, user: summary(u), solved, penalty, score, cells };
  });

  return finalizeStandings({
    contestId: seed.id,
    format: seed.format,
    frozen,
    updatedAt: iso(now),
    problems: pool.map((_, i) => ({ letter: "ABCDEFGH"[i], maxScore: ioi ? 100 : 1 })),
    rows,
  });
}

export function standings(id: number) {
  const seed = CONTEST_SEEDS.find((c) => c.id === id);
  if (!seed || contestStatus(seed) === "upcoming") return undefined;
  const pool =
    PROBLEMS.some((p) => p.round === id) ? PROBLEMS.filter((p) => p.round === id) : PROBLEMS.filter((p) => p.round % 7 === id % 7).slice(0, 8);
  return buildStandings(seed, pool);
}

/* ---------- Submissions ---------- */

const VERDICT_WEIGHTS: [Verdict, number][] = [["AC", 0.52], ["WA", 0.26], ["TLE", 0.1], ["RE", 0.05], ["MLE", 0.02], ["CE", 0.05]];
const SUB_LANGS = ["GNU C++17", "GNU C++17", "GNU C++20", "Python 3.12", "PyPy 3.10", "Java 21", "Go 1.23", "Rust 1.82", "Kotlin 2.0", "Free Pascal 3.2"];

function pickVerdict(x: number): Verdict {
  let acc = 0;
  for (const [v, w] of VERDICT_WEIGHTS) {
    acc += w;
    if (x < acc) return v;
  }
  return "AC";
}

/** Submission ids grow over time; the newest few are still being judged. */
export function submissions(): Submission[] {
  const r = rng(2024);
  const now = anchor();
  const out: Submission[] = [];
  let id = 902_400;
  let t = now;
  for (let i = 0; i < 700; i++) {
    const mine = r.chance(0.12);
    const u = mine ? USER_MAP.get(ME_USERNAME)! : USERS[Math.floor(Math.pow(r.next(), 1.6) * USERS.length)];
    const inContest = mine && i < 120 && r.chance(0.35);
    const p = inContest ? PROBLEMS.filter((x) => x.round === 148)[r.int(0, 5)] : PROBLEMS[r.int(0, PROBLEMS.length - 1)];
    const verdict: Verdict = i < 3 ? (i === 0 ? "RUNNING" : "PENDING") : pickVerdict(r.next());
    const done = verdict !== "PENDING" && verdict !== "RUNNING";
    const failed = verdict === "AC" || verdict === "CE" || !done ? null : r.int(2, 40);
    out.push({
      id: id--,
      createdAt: iso(t),
      user: summary(u),
      problem: { id: p.id, name: p.name },
      language: r.pick(SUB_LANGS),
      verdict,
      failedTest: failed,
      timeMs: done && verdict !== "CE" ? (verdict === "TLE" ? p.timeLimitMs : r.int(15, Math.floor(p.timeLimitMs * 0.8))) : null,
      memoryKb: done && verdict !== "CE" ? r.int(800, 64000) : null,
      contestId: inContest ? 148 : null,
    });
    t -= r.int(10, 900) * 1000;
  }
  return out;
}

/** Verdict of a new submission, derived from its id: the socket and a later reload always agree. */
export function judgeOutcome(id: number): { verdict: Verdict; failedTest: number | null; total: number } {
  const total = 18 + (id % 13);
  const roll = (id * 2654435761) % 100;
  if (roll < 62) return { verdict: "AC", failedTest: null, total };
  if (roll < 82) return { verdict: "WA", failedTest: 2 + (id % (total - 2)), total };
  if (roll < 92) return { verdict: "TLE", failedTest: 5 + (id % 9), total };
  return { verdict: "RE", failedTest: 3 + (id % 5), total };
}

export const SAMPLE_CODE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long a, b;
    cin >> a >> b;
    cout << a + b << "\\n";
    return 0;
}
`;

/* ---------- Rating history and activity ---------- */

export function ratingHistory(username: string): RatingPoint[] {
  const u = USER_MAP.get(username);
  if (!u) return [];
  const r = rng(hash(username) + 1);
  const n = Math.min(40, Math.max(4, u.contestsCount));
  const points: RatingPoint[] = [];
  let rating = 1200 + r.int(-200, 100);
  const now = anchor();
  for (let i = 0; i < n; i++) {
    const remaining = n - i;
    const target = u.rating;
    const drift = (target - rating) / remaining;
    const delta = i === n - 1 ? target - rating : Math.round(drift + r.int(-70, 70));
    const contestId = 148 - n + i;
    points.push({
      contestId,
      contestName: i % 3 === 0 ? `Haftalik musobaqa #${contestId - 100}` : `Codefire Round #${contestId}`,
      date: iso(now - (n - i) * 7 * DAY),
      rank: Math.max(1, Math.round(r.int(20, 900) * (1 - (rating - 800) / 2600))),
      oldRating: rating,
      newRating: rating + delta,
    });
    rating += delta;
  }
  return points;
}

export function activity(username: string): ActivityDay[] {
  const r = rng(hash(username) + 2);
  const now = anchor();
  const u = USER_MAP.get(username);
  const intensity = u ? Math.min(1, u.solvedCount / 400) : 0.3;
  return Array.from({ length: 365 }, (_, i) => {
    const date = new Date(now - (364 - i) * DAY + 5 * HOUR).toISOString().slice(0, 10);
    const day = new Date(date).getUTCDay();
    const weekend = day === 0 || day === 6;
    const active = r.chance(intensity * (weekend ? 0.75 : 0.55));
    const count = active ? Math.ceil(Math.pow(r.next(), 2) * 9) : 0;
    return { date, count: i >= 353 && username === ME_USERNAME ? Math.max(1, count) : count };
  });
}

/* ---------- Me ---------- */

export function me(): Me {
  const profile = userProfile(ME_USERNAME)!;
  return {
    ...profile,
    phone: "+998901234567",
    email: "sardor@mail.uz",
    dailyGoal: 3,
    solvedToday: 2,
    lastProblem: { id: "112B", name: "Toshkent metrosi", language: "cpp17" },
  };
}

/* ---------- Clans, courses, blogs ---------- */

export function clans() {
  return CLANS.map((c, i) => {
    const members = USERS.filter((u) => u.clan?.slug === c.slug);
    const honor = members.reduce((s, u) => s + u.solvedCount * 3 + u.contribution * 10, 0);
    return { ...c, membersCount: members.length, honor, rank: 0, leader: summary(members[0] ?? USERS[i]) };
  })
    .sort((a, b) => b.honor - a.honor)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

export function clanDetail(slug: string): ClanDetail | undefined {
  const c = clans().find((x) => x.slug === slug);
  if (!c) return undefined;
  const r = rng(hash(slug));
  const members = USERS.filter((u) => u.clan?.slug === slug)
    .map((u, i) => ({
      user: summary(u),
      honor: u.solvedCount * 3 + u.contribution * 10,
      role: (i === 0 ? "leader" : i < 3 ? "officer" : "member") as "leader" | "officer" | "member",
      joinedAt: iso(anchor() - r.int(10, 700) * DAY),
    }))
    .sort((a, b) => b.honor - a.honor);
  return {
    ...c,
    description: `${c.name} — ${c.region ?? "O'zbekiston"}dagi dasturchilar jamoasi. Har hafta birgalikda virtual raund yechamiz va tahlil qilamiz. Yangi a'zolar uchun mentorlik bor.`,
    createdAt: iso(anchor() - r.int(200, 900) * DAY),
    members,
    allies: CLANS.filter((x) => x.slug !== slug && r.chance(0.3)).map((x) => ({ slug: x.slug, name: x.name })),
  };
}

export function courses(signedIn: boolean) {
  return COURSES.map((c, i) => {
    const lessonsCount = c.modules.reduce((s, m) => s + m.lessons.length, 0);
    return {
      slug: c.slug,
      title: c.title,
      description: c.description,
      level: c.level,
      lessonsCount,
      problemsCount: lessonsCount * 3,
      hours: c.hours,
      students: [4210, 3120, 2280, 1940, 1310, 620][i],
      progress: signedIn ? [100, null, 64, 22, null, null][i] : null,
    };
  });
}

export function courseDetail(slug: string, signedIn: boolean): CourseDetail | undefined {
  const base = courses(signedIn).find((c) => c.slug === slug);
  const src = COURSES.find((c) => c.slug === slug);
  if (!base || !src) return undefined;
  const r = rng(hash(slug));
  const total = base.lessonsCount;
  const doneCount = Math.round(((base.progress ?? 0) / 100) * total);
  let idx = 0;
  return {
    ...base,
    modules: src.modules.map((m) => ({
      title: m.title,
      lessons: m.lessons.flatMap((title) => {
        const done = idx++ < doneCount;
        const lesson = { slug: `${hash(title)}`, title, kind: "lesson" as const, minutes: r.int(8, 25), done, problemId: null };
        const practice = {
          slug: `${hash(title)}-p`,
          title: `Amaliyot: ${title.toLowerCase()}`,
          kind: "practice" as const,
          minutes: r.int(20, 45),
          done,
          problemId: PROBLEMS[r.int(0, 120)].id,
        };
        return [lesson, practice];
      }),
    })),
  };
}

export function blogPosts(likedSet: Set<string>) {
  return BLOG_POSTS.map((p, i) => {
    const r = rng(hash(p.slug));
    return {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: summary(USERS[[0, 2, 5, 1, 0, 3][i]]),
      publishedAt: iso(anchor() - (i * 3 + 1) * DAY - r.int(0, 20) * HOUR),
      readingMin: Math.max(2, Math.round(p.content.length / 900)),
      likes: r.int(12, 340) + (likedSet.has(p.slug) ? 1 : 0),
      commentsCount: r.int(3, 40),
      tags: p.tags,
      liked: likedSet.has(p.slug),
    };
  });
}

const COMMENT_TEXTS = [
  "Juda foydali tahlil, rahmat! D masalada men ham shu xatoga tushgandim.",
  "C masalani segment daraxtisiz ham yechsa bo'larkan, prefiks yig'indi yetarli.",
  "Keyingi raundni qachon kutsak bo'ladi?",
  "Python yechimi TLE oldi, PyPy da o'tdi. Cheklovlar biroz qattiq emasmi?",
  "Formulani tushuntirib berganingiz uchun rahmat, endi tushunarli.",
  "Kod juda chiroyli yozilgan. lambda o'rniga struct ishlatish tezroqmi?",
];

export function blogDetail(slug: string, likedSet: Set<string>): BlogPostDetail | undefined {
  const post = blogPosts(likedSet).find((p) => p.slug === slug);
  const src = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post || !src) return undefined;
  const r = rng(hash(slug) + 5);
  return {
    ...post,
    content: src.content,
    comments: Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      author: summary(USERS[r.int(0, 80)]),
      at: iso(anchor() - (4 - i) * 3 * HOUR),
      text: COMMENT_TEXTS[(hash(slug) + i) % COMMENT_TEXTS.length],
      likes: r.int(0, 25),
    })),
  };
}

/* ---------- Platform stats ---------- */

/** Uzbek users per region: roughly follows where universities and olympiad schools are. */
const REGION_WEIGHT: Record<string, number> = {
  Toshkent: 0.24, Samarqand: 0.1, "Farg'ona": 0.09, Andijon: 0.08, Buxoro: 0.07, Namangan: 0.07, "Toshkent viloyati": 0.065,
  Xorazm: 0.05, Qashqadaryo: 0.05, Surxondaryo: 0.04, Navoiy: 0.035, "Qoraqalpog'iston": 0.035, Jizzax: 0.03, Sirdaryo: 0.025,
};

export function regionStats() {
  const r = rng(314);
  return REGIONS.map((region) => {
    const users = Math.round(44_000 * (REGION_WEIGHT[region] ?? 0.02)) + r.int(-300, 300);
    return { region, users, newUsers: Math.round(users * (0.02 + r.next() * 0.02)), active: Math.round(users * (0.03 + r.next() * 0.03)) };
  }).sort((a, b) => b.users - a.users);
}

/** Submissions per day for the last 30 days, oldest first. */
export function dailySubmissions() {
  const r = rng(271);
  const now = anchor();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * DAY + 5 * HOUR).toISOString().slice(0, 10);
    const day = new Date(date).getUTCDay();
    const base = day === 0 || day === 6 ? 13_500 : 10_800;
    return { date, submissions: Math.round(base + i * 60 + r.int(-1800, 1800)) };
  });
}
