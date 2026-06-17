"use client";

import { Eye, MapPin, ShieldCheck, Star, X } from "lucide-react";
import {
  categoryLabels,
  type DirectoryListing,
} from "@/lib/directory-data";

type DirectoryProfileModalProps = {
  listing: DirectoryListing | null;
  onClose: () => void;
};

export function DirectoryProfileModal({ listing, onClose }: DirectoryProfileModalProps) {
  if (!listing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="directory-profile-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-border bg-card p-5">
          <div className="min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="directory-profile-title" className="text-lg font-bold text-foreground">
                {listing.name}
              </h2>
              {listing.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">{listing.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-primary-light hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <MapPin className="h-4 w-4 text-primary" />
              {listing.city}, {listing.country}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {listing.rating} ({listing.reviewCount} reviews)
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Eye className="h-4 w-4 text-primary" />
              {listing.profileViews.toLocaleString()} profile views
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {categoryLabels[listing.category]}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{listing.description}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Services</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {listing.services.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted">Member since {listing.memberSince}</p>

          <div className="rounded-xl border border-dashed border-border bg-primary-light/30 p-4 text-center">
            <p className="text-sm font-medium text-foreground">Full contact details coming soon</p>
            <p className="mt-1 text-xs text-muted">
              Use Matching to send an enquiry, or upgrade for direct directory messaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
