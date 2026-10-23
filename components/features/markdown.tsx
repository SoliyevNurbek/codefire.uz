import rehypeShiki from "@shikijs/rehype";
import "katex/dist/katex.min.css";
import { MarkdownAsync } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

/**
 * Server-only Markdown: GFM, KaTeX math ($…$, $$…$$) and Shiki code
 * highlighting with light/dark themes. Ships zero client JS (except copy buttons).
 */
export async function Markdown({ children, className, compact }: { children: string; className?: string; compact?: boolean }) {
  return (
    <div className={cn("prose-cf", compact && "prose-cf-compact", className)}>
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeShiki, { themes: { light: "github-light", dark: "github-dark" }, defaultColor: "light" }],
        ]}
        components={{
          pre: ({ children, node, ...props }) => {
            const text = codeText(node as HastLike | undefined);
            return (
              <div className="group relative">
                <pre
                  {...props}
                  className="overflow-x-auto rounded-lg border border-border bg-surface-2 p-4 font-mono text-sm leading-relaxed"
                >
                  {children}
                </pre>
                {text && (
                  <CopyButton
                    text={text}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  />
                )}
              </div>
            );
          },
        }}
      >
        {children}
      </MarkdownAsync>
    </div>
  );
}

type HastLike = { type: string; value?: string; children?: HastLike[] };
function codeText(node: HastLike | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(codeText).join("");
}
