import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditorPrefs {
  language: string;
  fontSize: number;
  theme: "auto" | "light" | "dark";
  vim: boolean;
  set: (prefs: Partial<Omit<EditorPrefs, "set">>) => void;
}

/** Editor preferences, remembered per browser (synced to the account later via settings). */
export const useEditorPrefs = create<EditorPrefs>()(
  persist(
    (set) => ({
      language: "cpp17",
      fontSize: 14,
      theme: "auto",
      vim: false,
      set: (prefs) => set(prefs),
    }),
    { name: "cf-editor" },
  ),
);

const draftKey = (problem: string, language: string) => `cf-draft:${problem}:${language}`;

export function loadDraft(problem: string, language: string) {
  try {
    return localStorage.getItem(draftKey(problem, language));
  } catch {
    return null;
  }
}

export function saveDraft(problem: string, language: string, code: string) {
  try {
    localStorage.setItem(draftKey(problem, language), code);
  } catch {
    /* storage full or blocked: drafts are a convenience */
  }
}
