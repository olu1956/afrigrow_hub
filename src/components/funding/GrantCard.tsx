"use client";

import { Calendar, ExternalLink, MapPin, Sparkles } from "lucide-react";
import type { MatchedGrantOpportunity } from "@/lib/funding-data";
import { typeLabels, typeStyles } from "@/lib/funding-data";

type GrantCardProps = {
  grant: MatchedGrantOpportunity;
  onPrepare: (grant: MatchedGrantOpportunity) => void;
};

export function GrantCard({ grant, onPrepare }: GrantCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${typeStyles[grant.type]}`}
          >
            {typeLabels[grant.type]}
          </span>
          <h3 className="mt-2 font-semibold leading-snug text-foreground">{grant.name}</h3>
          <p className="mt-1 text-xs text-muted">{grant.provider}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-1 text-xs font-bold text-accent">
            <Sparkles className="h-3 w-3" />
            {grant.matchScore}%
          </div>
          <p className="mt-1 text-[10px] text-muted">match score</p>
        </div>
      </div>

      <p className="mt-3 text-lg font-bold text-primary">{grant.amount}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{grant.description}</p>

      <div className="mt-3 space-y-1.5 text-xs text-muted">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {grant.region}
        </p>
        <p className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          Deadline: {grant.deadline}
        </p>
      </div>

      <p className="mt-3 text-xs text-foreground">
        <span className="font-semibold text-primary">Eligibility:</span> {grant.eligibility}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {grant.sectors.map((s) => (
          <span
            key={s}
            className="rounded-full bg-primary-light/70 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        <a
          href={grant.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Apply on provider site
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => onPrepare(grant)}
          className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary-light/30"
        >
          Prepare with AfriGrow
        </button>
      </div>
    </article>
  );
}
