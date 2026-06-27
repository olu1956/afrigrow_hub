"use client";

import Image from "next/image";
import { Eye, MapPin, ShieldCheck, Star } from "lucide-react";
import {
  categoryLabels,
  type DirectoryListing,
} from "@/lib/directory-data";

type DirectoryListingCardProps = {
  listing: DirectoryListing;
  onView: (listing: DirectoryListing) => void;
};

export function DirectoryListingCard({ listing, onView }: DirectoryListingCardProps) {
  const isLive = listing.source === "live";
  const showRating = listing.reviewCount > 0;

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-light text-sm font-bold text-primary">
          {listing.logoUrl ? (
            <Image
              src={listing.logoUrl}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            listing.name.slice(0, 2).toUpperCase()
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground">{listing.name}</h3>
                {isLive && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                    Live
                  </span>
                )}
                {!isLive && (
                  <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold uppercase text-muted ring-1 ring-border">
                    Sample
                  </span>
                )}
                {listing.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {listing.featured && (
                  <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{listing.tagline}</p>
            </div>

            {showRating ? (
              <div className="shrink-0 text-right">
                <div className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  {listing.rating}
                </div>
                <p className="text-[10px] text-muted">{listing.reviewCount} reviews</p>
              </div>
            ) : isLive && listing.profileScore !== undefined ? (
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-primary">{listing.profileScore}%</p>
                <p className="text-[10px] text-muted">Profile strength</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {(listing.city || listing.country) && (
          <>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              {[listing.city, listing.country].filter(Boolean).join(", ")}
            </span>
            <span className="text-border">·</span>
          </>
        )}
        <span>{categoryLabels[listing.category]}</span>
        {listing.profileViews > 0 && (
          <>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {listing.profileViews.toLocaleString()} views
            </span>
          </>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-foreground">{listing.description}</p>

      {listing.services.length > 0 && (
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
      )}

      <button
        type="button"
        onClick={() => onView(listing)}
        className="mt-5 w-full rounded-xl border border-primary/20 bg-primary-light py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
      >
        View profile
      </button>
    </article>
  );
}
