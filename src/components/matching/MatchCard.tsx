"use client";

import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { MarketplaceListing } from "@/lib/matching-data";
import { categoryLabels } from "@/lib/matching-data";

type MatchCardProps = {
  listing: MarketplaceListing;
  onEnquire: (listing: MarketplaceListing) => void;
};

export function MatchCard({ listing, onEnquire }: MatchCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{listing.name}</h3>
            {listing.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{listing.tagline}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-1 text-xs font-bold text-accent">
            <Sparkles className="h-3 w-3" />
            {listing.matchScore}%
          </div>
          <p className="mt-1 text-[10px] text-muted">match</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
        {listing.city}, {listing.country}
        <span className="text-border">·</span>
        {categoryLabels[listing.category]}
      </div>

      <p className="mt-3 text-sm text-foreground">
        <span className="font-medium text-primary">Looking for:</span>{" "}
        {listing.lookingFor}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {listing.services.slice(0, 3).map((service) => (
          <span
            key={service}
            className="rounded-full bg-primary-light/70 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {service}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onEnquire(listing)}
        className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        Send enquiry
      </button>
    </article>
  );
}
