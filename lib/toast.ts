import type { ExternalToast } from "sonner";

type Fn = (message: string, data?: ExternalToast) => void;

/** sonner's toast(), loaded on first use so it stays out of first-load JS. */
const call =
  (kind: "success" | "error" | "message"): Fn =>
  (message, data) =>
    void import("sonner").then(({ toast }) => (kind === "message" ? toast(message, data) : toast[kind](message, data)));

export const toast = { success: call("success"), error: call("error"), message: call("message") };
