import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  // Uzbek lives at /problems, others at /ru/problems and /en/problems.
  localePrefix: "as-needed",
  // Always open in Uzbek; ru/en only when the user picks them (no Accept-Language redirect).
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
