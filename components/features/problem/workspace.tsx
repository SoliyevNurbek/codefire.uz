"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, RotateCcw, Send, Settings2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/controls";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/menu";
import { Kbd, Skeleton } from "@/components/ui/misc";
import { Select } from "@/components/ui/select";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { api } from "@/lib/api/endpoints";
import type { Language } from "@/lib/api/types";
import { useMe } from "@/lib/hooks/use-session";
import { qk } from "@/lib/query-keys";
import { loadDraft, saveDraft, useEditorPrefs } from "@/lib/stores/editor";
import { VERDICTS } from "@/lib/verdict";
import { useSubmissionSocket, type LiveSubmission } from "@/lib/ws/use-submission";
import { cn } from "@/lib/utils";
import { ResultPanel, type Mode } from "./result-panel";

// Monaco is ~2MB: loaded only here, only in the browser, after the statement has painted.
const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-col gap-2 p-4" aria-hidden>
      {[70, 45, 60, 30, 55].map((w, i) => (
        <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />
      ))}
    </div>
  ),
});

type Tab = "statement" | "code" | "result";

export function Workspace({ problemId, languages, statement }: { problemId: string; languages: Language[]; statement: React.ReactNode }) {
  const t = useTranslations("problem");
  const router = useRouter();
  const client = useQueryClient();
  const { data: me } = useMe();
  const prefs = useEditorPrefs();
  const language = languages.find((l) => l.id === prefs.language) ?? languages[0];

  const [code, setCode] = useState(language.template);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("statement");
  const [mode, setMode] = useState<Mode>({ kind: "idle" });

  // Drafts are per problem + language; load after mount (localStorage isn't available during SSR).
  useEffect(() => {
    setCode(loadDraft(problemId, language.id) ?? language.template);
    setSavedAt(null);
  }, [problemId, language.id, language.template]);

  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onChange = (value: string) => {
    setCode(value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraft(problemId, language.id, value);
      setSavedAt(Date.now());
    }, 500);
  };

  const run = useMutation({
    mutationFn: () => api.problems.run(problemId, { language: language.id, code }),
    onMutate: () => setMode({ kind: "run", result: null }),
    onSuccess: (result) => setMode({ kind: "run", result }),
    onError: () => {
      setMode({ kind: "idle" });
      toast.error(t("compileError"));
    },
  });

  const submit = useMutation({
    mutationFn: () => api.submissions.create({ problem: problemId, language: language.id, code }),
    onMutate: () => setMode({ kind: "submit", id: null }),
    onSuccess: (sub) => setMode({ kind: "submit", id: sub.id }),
    onError: (e) => {
      setMode({ kind: "idle" });
      toast.error(e instanceof ApiError ? e.message : t("compileError"));
    },
  });

  const submissionId = mode.kind === "submit" ? mode.id : null;
  const onDone = useCallback(
    (s: LiveSubmission) => {
      if (submissionId === null) return;
      const id = `#${submissionId}`;
      const action = { label: t("openSubmission"), onClick: () => router.push(`/submissions/${submissionId}`) };
      if (s.verdict === "AC") toast.success(t("toastAccepted", { id }), { action });
      else if (s.verdict === "CE") toast.error(t("toastCompile", { id }), { action });
      else toast.error(t("toastRejected", { id, verdict: VERDICTS[s.verdict].label, test: s.failedTest ?? 0 }), { action });
      void client.invalidateQueries({ queryKey: qk.statuses });
      void client.invalidateQueries({ queryKey: ["submissions"] });
    },
    [submissionId, t, router, client],
  );
  const live = useSubmissionSocket(submissionId, onDone);

  const busy = run.isPending || submit.isPending || (live !== null && !live.done);
  const doRun = () => {
    if (busy) return;
    setTab("result");
    run.mutate();
  };
  const doSubmit = () => {
    if (busy || !me) return;
    setTab("result");
    submit.mutate();
  };

  // Ctrl/⌘+Enter and Ctrl/⌘+' also work outside the editor.
  const keys = useRef({ doRun, doSubmit });
  keys.current = { doRun, doSubmit };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        keys.current.doSubmit();
      } else if (e.key === "'") {
        e.preventDefault();
        keys.current.doRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tabs: [Tab, string][] = [
    ["statement", t("statement")],
    ["code", t("code")],
    ["result", t("result")],
  ];

  return (
    <div className="flex h-[calc(100dvh-var(--chrome)-4rem)] min-h-[520px] flex-col sm:h-[calc(100dvh-var(--chrome))]">
      {/* Phones and tablets: three tabs instead of a split view. */}
      <div role="tablist" aria-label={t("statement")} className="flex h-10 shrink-0 border-b border-border bg-surface lg:hidden">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px flex-1 border-b-2 border-transparent text-sm font-medium text-fg-muted",
              tab === key && "border-accent text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <PanelGroup direction="horizontal" className="min-h-0 flex-1 max-lg:!flex-col">
        <Panel
          id="statement"
          order={1}
          defaultSize={46}
          minSize={28}
          className={cn("overflow-y-auto! bg-bg max-lg:!flex-[1_1_auto]", tab !== "statement" && "max-lg:hidden")}
        >
          {statement}
        </Panel>

        <PanelResizeHandle
          aria-label={t("splitResize")}
          className="group relative hidden w-px bg-border outline-none lg:block data-[resize-handle-state=drag]:bg-accent data-[resize-handle-state=hover]:bg-border-strong"
        >
          <span className="absolute inset-y-0 -right-1.5 -left-1.5" />
        </PanelResizeHandle>

        <Panel id="work" order={2} defaultSize={54} minSize={32} className={cn("max-lg:!flex-[1_1_auto]", tab === "statement" && "max-lg:hidden")}>
          <PanelGroup direction="vertical" className="max-lg:!flex-col">
            <Panel id="editor" order={1} defaultSize={68} minSize={30} className={cn("flex flex-col bg-surface max-lg:!flex-[1_1_auto]", tab === "result" && "max-lg:hidden")}>
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
                <Select
                  aria-label={t("language")}
                  value={language.id}
                  onChange={(e) => prefs.set({ language: e.target.value })}
                  className="w-44 [&_select]:h-8 [&_select]:text-sm"
                >
                  {languages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Select>
                <span className="ml-auto text-xs text-fg-subtle" aria-live="polite">
                  {savedAt ? t("draftSaved") : ""}
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={t("editorTheme")}>
                      <Settings2 aria-hidden />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center justify-between gap-3">
                        <span>{t("fontSize")}</span>
                        <Select value={prefs.fontSize} onChange={(e) => prefs.set({ fontSize: Number(e.target.value) })} className="w-24 font-mono">
                          {[12, 13, 14, 15, 16, 18, 20].map((s) => (
                            <option key={s} value={s}>
                              {s}px
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>{t("editorTheme")}</span>
                        <Select value={prefs.theme} onChange={(e) => prefs.set({ theme: e.target.value as "auto" | "light" | "dark" })} className="w-32">
                          <option value="auto">{t("themeAuto")}</option>
                          <option value="light">{t("themeLight")}</option>
                          <option value="dark">{t("themeDark")}</option>
                        </Select>
                      </label>
                      <label className="flex h-9 items-center justify-between gap-3">
                        <span>{t("vim")}</span>
                        <Switch checked={prefs.vim} onCheckedChange={(vim) => prefs.set({ vim })} />
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setCode(language.template);
                          saveDraft(problemId, language.id, language.template);
                        }}
                      >
                        <RotateCcw aria-hidden />
                        {t("resetCode")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="min-h-0 flex-1">
                <CodeEditor
                  value={code}
                  language={language.monaco}
                  fontSize={prefs.fontSize}
                  theme={prefs.theme}
                  vim={prefs.vim}
                  onChange={onChange}
                  onSubmit={doSubmit}
                  onRun={doRun}
                  label={`${t("code")} — ${language.name}`}
                />
              </div>

              <div className="flex h-12 shrink-0 items-center gap-2 border-t border-border px-3">
                <span className="hidden items-center gap-1 text-xs text-fg-subtle xl:flex">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>Enter</Kbd>
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="secondary" onClick={doRun} loading={run.isPending} disabled={busy && !run.isPending} aria-keyshortcuts="Control+'">
                    {!run.isPending && <Play aria-hidden />}
                    {run.isPending ? t("running") : t("run")}
                  </Button>
                  {me ? (
                    <Button onClick={doSubmit} loading={submit.isPending} disabled={busy && !submit.isPending} aria-keyshortcuts="Control+Enter">
                      {!submit.isPending && <Send aria-hidden />}
                      {submit.isPending ? t("submitting") : t("submit")}
                    </Button>
                  ) : me === null ? (
                    <Button asChild>
                      <Link href={`/login?next=/problems/${problemId}`}>{t("signInToSubmit")}</Link>
                    </Button>
                  ) : (
                    <Skeleton className="h-9 w-28" />
                  )}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="relative hidden h-px bg-border outline-none lg:block data-[resize-handle-state=drag]:bg-accent data-[resize-handle-state=hover]:bg-border-strong">
              <span className="absolute inset-x-0 -top-1.5 -bottom-1.5" />
            </PanelResizeHandle>

            <Panel id="result" order={2} defaultSize={32} minSize={12} className={cn("bg-surface max-lg:!flex-[1_1_auto]", tab !== "result" && "max-lg:hidden")}>
              <ResultPanel mode={mode} live={live} runPending={run.isPending} />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
