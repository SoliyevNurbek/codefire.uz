"use client";

import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

type MonacoEditor = Parameters<OnMount>[0];
type VimAdapter = { dispose: () => void };
declare global {
  interface Window {
    MonacoVim?: { initVimMode: (editor: MonacoEditor, status: HTMLElement) => VimAdapter };
  }
}

const VIM_SRC = "https://cdn.jsdelivr.net/npm/monaco-vim@0.4.4/dist/monaco-vim.umd.js";

/** monaco-vim's UMD build must see the global `monaco`, not Monaco's AMD `define`. */
function loadVim(): Promise<NonNullable<Window["MonacoVim"]>> {
  if (window.MonacoVim) return Promise.resolve(window.MonacoVim);
  return new Promise((resolve, reject) => {
    const w = window as unknown as { define?: unknown };
    const define = w.define;
    w.define = undefined;
    const script = document.createElement("script");
    script.src = VIM_SRC;
    script.onload = () => {
      w.define = define;
      if (window.MonacoVim) resolve(window.MonacoVim);
      else reject(new Error("monaco-vim failed to load"));
    };
    script.onerror = () => {
      w.define = define;
      reject(new Error("monaco-vim failed to load"));
    };
    document.head.appendChild(script);
  });
}

/** Flat themes built from the design tokens (no gradients, no glow). */
const defineThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("codefire-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.lineHighlightBackground": "#f4f4f5",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#a1a1aa",
      "editorLineNumber.activeForeground": "#52525b",
      "editorCursor.foreground": "#ea580c",
      "editor.selectionBackground": "#fed7aa",
      "editorIndentGuide.background1": "#f4f4f5",
      "editorGutter.background": "#ffffff",
      "scrollbarSlider.background": "#d4d4d880",
    },
  });
  monaco.editor.defineTheme("codefire-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#121214",
      "editor.lineHighlightBackground": "#1c1c1f",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#52525b",
      "editorLineNumber.activeForeground": "#a1a1aa",
      "editorCursor.foreground": "#f97316",
      "editor.selectionBackground": "#7c2d1266",
      "editorIndentGuide.background1": "#1c1c1f",
      "editorGutter.background": "#121214",
      "scrollbarSlider.background": "#3f3f4680",
    },
  });
};

export interface CodeEditorProps {
  value: string;
  language: string; // Monaco language id
  fontSize: number;
  theme: "auto" | "light" | "dark";
  vim: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onRun: () => void;
  label: string;
}

export default function CodeEditor({ value, language, fontSize, theme, vim, onChange, onSubmit, onRun, label }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [editor, setEditor] = useState<MonacoEditor | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const actions = useRef({ onSubmit, onRun });
  actions.current = { onSubmit, onRun };

  const dark = theme === "auto" ? resolvedTheme === "dark" : theme === "dark";

  const onMount: OnMount = (instance, monaco) => {
    setEditor(instance);
    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => actions.current.onSubmit());
    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote, () => actions.current.onRun());
    instance.focus();
  };

  useEffect(() => {
    if (!vim || !editor || !statusRef.current) return;
    let adapter: VimAdapter | undefined;
    let cancelled = false;
    void loadVim().then((mv) => {
      if (!cancelled && statusRef.current) adapter = mv.initVimMode(editor, statusRef.current);
    });
    return () => {
      cancelled = true;
      adapter?.dispose();
    };
  }, [vim, editor]);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Editor
          value={value}
          language={language}
          theme={dark ? "codefire-dark" : "codefire-light"}
          beforeMount={defineThemes}
          onMount={onMount}
          onChange={(v) => onChange(v ?? "")}
          loading={null}
          options={{
            fontSize,
            fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "line",
            lineNumbersMinChars: 3,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            ariaLabel: label,
            accessibilitySupport: "auto",
          }}
        />
      </div>
      {vim && <div ref={statusRef} className="h-6 border-t border-border px-3 font-mono text-xs leading-6 text-fg-muted" />}
    </div>
  );
}
