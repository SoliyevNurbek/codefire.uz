"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false during SSR and the hydration render, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
