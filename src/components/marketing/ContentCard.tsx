"use client";

import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { marketingFieldBorderClass } from "@/components/dashboard/DashboardPageCanvas";
import type { GeneratedContent } from "@/lib/marketing-data";
import { formatCampaignMeta } from "@/lib/marketing-data";

type ContentCardProps = {
  content: GeneratedContent;
  onSave?: () => void;
  saved?: boolean;
  saving?: boolean;
  highlighted?: boolean;
};

export function ContentCard({
  content,
  onSave,
  saved = false,
  saving = false,
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

  const metaLabel = formatCampaignMeta(content.platform, content.type);

  return (
    <article
      className={`rounded-2xl bg-card shadow-md shadow-primary/10 overflow-hidden transition ${
        highlighted
          ? "border-2 border-primary ring-2 ring-primary/20"
          : marketingFieldBorderClass
      }`}
    >
      <div className={`flex items-start justify-between gap-3 border-b-2 border-[#d4ded8] bg-primary-light/40 px-5 py-3`}>
        <div className="min-w-0">
          {metaLabel && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              {metaLabel}
            </p>
          )}
          <h3 className="text-sm font-semibold text-foreground">{content.title}</h3>
        </div>
        <span className="shrink-0 text-xs font-medium text-foreground/65">
          {content.createdAt ?? "Just now"}
        </span>
      </div>
      <div className="p-5">
        <pre className="whitespace-pre-wrap font-sans text-sm font-medium leading-relaxed text-foreground">
          {content.body}
        </pre>
        {content.hashtags && (
          <p className={`mt-4 rounded-xl ${marketingFieldBorderClass} bg-primary-light/50 px-3 py-2 text-xs font-semibold text-primary`}>
            {content.hashtags}
          </p>
        )}
      </div>
      <div className="flex gap-2 border-t-2 border-[#d4ded8] px-5 py-3">
        <button
          type="button"
          onClick={copyToClipboard}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl ${marketingFieldBorderClass} bg-white py-2 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary-light/30`}
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
            disabled={saved || saving}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-default disabled:bg-primary/70"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saved ? (
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
