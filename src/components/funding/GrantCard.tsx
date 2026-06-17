"use client";

import { Calendar, MapPin, Sparkles } from "lucide-react";
import type { GrantOpportunity } from "@/lib/funding-data";
import { typeLabels, typeStyles } from "@/lib/funding-data";

type GrantCardProps = {
  grant: GrantOpportunity;
  onApply: (grant: GrantOpportunity) => void;
};

export function GrantCard({ grant, onApply }: GrantCardProps) {
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
          <p className="mt-1 text-[10px] text-muted">eligibility</p>
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

      <button
        type="button"
        onClick={() => onApply(grant)}
        className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        Prepare application
      </button>
    </article>
  );
}
