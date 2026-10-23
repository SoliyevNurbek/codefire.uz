import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Group digits with a thin space: 12 480. Done by hand, not Intl: browsers
 * without Uzbek ICU data print "12,480", which breaks SSR hydration.
 */
export function formatNumber(value: number) {
  return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
