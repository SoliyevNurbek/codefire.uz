export type Verdict =
  | "AC" // Accepted
  | "WA" // Wrong Answer
  | "TLE" // Time Limit Exceeded
  | "MLE" // Memory Limit Exceeded
  | "RE" // Runtime Error
  | "CE" // Compilation Error
  | "PENDING" // In queue
  | "RUNNING"; // Being judged

export type VerdictTone = "ac" | "wa" | "tle" | "ce" | "pending";

export const VERDICTS: Record<Verdict, { tone: VerdictTone; label: string; short: string }> = {
  AC: { tone: "ac", label: "Qabul qilindi", short: "AC" },
  WA: { tone: "wa", label: "Noto'g'ri javob", short: "WA" },
  RE: { tone: "wa", label: "Ishlash xatosi", short: "RE" },
  TLE: { tone: "tle", label: "Vaqt limiti oshdi", short: "TLE" },
  MLE: { tone: "tle", label: "Xotira limiti oshdi", short: "MLE" },
  CE: { tone: "ce", label: "Kompilyatsiya xatosi", short: "CE" },
  PENDING: { tone: "pending", label: "Navbatda", short: "…" },
  RUNNING: { tone: "pending", label: "Tekshirilmoqda", short: "…" },
};
