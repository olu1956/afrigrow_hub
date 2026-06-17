"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { GeneratedContent } from "@/lib/marketing-data";

type ContentCardProps = {
  content: GeneratedContent;
  onSave?: () => void;
  saved?: boolean;
  highlighted?: boolean;
};

export function ContentCard({
  content,
  onSave,
  saved = false,
  highlighted = false,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    const text = content.hashtags
      ? `${content.body}\n\n${content.hashtags}`
      : content.body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article
      className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition ${
        highlighted ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border bg-primary-light/40 px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{content.title}</h3>
        <span className="text-xs text-muted">{content.createdAt ?? "Just now"}</span>
      </div>
      <div className="p-5">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {content.body}
        </pre>
        {content.hashtags && (
          <p className="mt-4 rounded-xl bg-primary-light/50 px-3 py-2 text-xs font-medium text-primary">
            {content.hashtags}
          </p>
        )}
      </div>
      <div className="flex gap-2 border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary-light/30"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-primary" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-default disabled:bg-primary/70"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save draft"
            )}
          </button>
        )}
      </div>
    </article>
  );
}
