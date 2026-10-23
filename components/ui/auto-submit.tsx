"use client";

import { Select } from "./select";

/** A native select inside a GET form that submits on change (filters → URL, no client state). */
export function AutoSubmitSelect(props: React.ComponentProps<typeof Select>) {
  return <Select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
