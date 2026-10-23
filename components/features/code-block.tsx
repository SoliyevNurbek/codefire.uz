import { codeToHtml } from "shiki";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

const LANG_BY_NAME: [RegExp, string][] = [
  [/C\+\+/, "cpp"],
  [/PyPy|Python/, "python"],
  [/Java\b/, "java"],
  [/Kotlin/, "kotlin"],
  [/Go\b/, "go"],
  [/Rust/, "rust"],
  [/C#/, "csharp"],
  [/Node|JavaScript/, "javascript"],
  [/Pascal/, "pascal"],
];

export const shikiLang = (languageName: string) => LANG_BY_NAME.find(([re]) => re.test(languageName))?.[1] ?? "text";

/** Read-only code with line numbers, highlighted on the server (light + dark), with a copy button. */
export async function CodeBlock({ code, language, className }: { code: string; language: string; className?: string }) {
  const html = await codeToHtml(code, {
    lang: shikiLang(language),
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  });
  return (
    <div className={cn("group relative overflow-hidden rounded-lg border border-border bg-surface", className)}>
      <CopyButton text={code} className="absolute top-2 right-2 z-10" />
      <div
        className="code-lines overflow-x-auto py-3 font-mono text-sm leading-6 [&_pre]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
