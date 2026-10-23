/** All times render in Asia/Tashkent (UTC+5) unless the user picks otherwise in settings. */
export const TIME_ZONE = "Asia/Tashkent";


/**
 * Month names are written out per locale instead of relying on Intl: browsers ship
 * different ICU data (some have no Uzbek at all), and any difference between the
 * server render and the browser breaks hydration.
 */
const MONTHS: Record<string, string[]> = {
  uz: ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"],
  ru: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Wall-clock parts in Tashkent (UTC+5, no DST) — pure arithmetic, identical everywhere. */
function parts(iso: string) {
  const d = new Date(new Date(iso).getTime() + 5 * 3_600_000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), hh: d.getUTCHours(), mm: d.getUTCMinutes() };
}

const months = (locale: string) => MONTHS[locale] ?? MONTHS.uz;

/** "23 okt, 19:35" */
export function formatDateTime(iso: string, locale: string, opts: { year?: boolean } = {}) {
  const p = parts(iso);
  return `${p.d} ${months(locale)[p.m]}${opts.year ? ` ${p.y}` : ""}, ${pad(p.hh)}:${pad(p.mm)}`;
}

/** "23 okt 2026" */
export function formatDate(iso: string, locale: string) {
  const p = parts(iso);
  return `${p.d} ${months(locale)[p.m]} ${p.y}`;
}

/** Calendar tile parts: { day: 23, month: "okt" } */
export function dateParts(iso: string, locale: string) {
  const p = parts(iso);
  return { day: p.d, month: months(locale)[p.m] };
}

/** "19:35" */
export function formatTime(iso: string) {
  const p = parts(iso);
  return `${pad(p.hh)}:${pad(p.mm)}`;
}

type Unit = "year" | "month" | "week" | "day" | "hour" | "minute";
const UNITS: [Unit, number][] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const UZ: Record<Unit, string> = { year: "yil", month: "oy", week: "hafta", day: "kun", hour: "soat", minute: "daqiqa" };
const EN: Record<Unit, string> = { year: "year", month: "month", week: "week", day: "day", hour: "hour", minute: "minute" };
const RU: Record<Unit, [string, string, string]> = {
  year: ["год", "года", "лет"],
  month: ["месяц", "месяца", "месяцев"],
  week: ["неделю", "недели", "недель"],
  day: ["день", "дня", "дней"],
  hour: ["час", "часа", "часов"],
  minute: ["минуту", "минуты", "минут"],
};
const ruPlural = (n: number, [one, few, many]: [string, string, string]) =>
  n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;

/** "2 kun qoldi" / "3 soat oldin", "через 2 дня", "2 days ago". */
export function formatRelative(iso: string, locale: string, now = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  if (abs < 60_000) return locale === "ru" ? "только что" : locale === "en" ? "just now" : "hozirgina";
  const [unit, ms] = UNITS.find(([, ms]) => abs >= ms) ?? UNITS[UNITS.length - 1];
  const n = Math.floor(abs / ms);
  if (locale === "ru") {
    const word = ruPlural(n, RU[unit]);
    return diff > 0 ? `через ${n} ${word}` : `${n} ${word} назад`;
  }
  if (locale === "en") {
    const word = `${EN[unit]}${n === 1 ? "" : "s"}`;
    return diff > 0 ? `in ${n} ${word}` : `${n} ${word} ago`;
  }
  return diff > 0 ? `${n} ${UZ[unit]} qoldi` : `${n} ${UZ[unit]} oldin`;
}

/** Countdown text: "01:42:09" under a day, "2 kun 04:10:00" beyond. */
export function formatCountdown(ms: number, dayWord: string) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86_400);
  const hms = `${pad(Math.floor((s % 86_400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return days ? `${days} ${dayWord} ${hms}` : hms;
}

/** "2:30" for a duration in minutes. */
export function formatDuration(min: number) {
  return `${Math.floor(min / 60)}:${pad(min % 60)}`;
}
