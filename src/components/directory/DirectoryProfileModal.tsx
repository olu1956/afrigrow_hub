"use client";

import Image from "next/image";
import { Eye, Globe, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Star, X } from "lucide-react";
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

  const isLive = listing.source === "live";
  const showRating = listing.reviewCount > 0;
  const hasContact = Boolean(
    listing.email || listing.phone || listing.website || listing.whatsapp,
  );

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
          <div className="flex min-w-0 items-start gap-4 pr-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-light text-lg font-bold text-primary">
              {listing.logoUrl ? (
                <Image
                  src={listing.logoUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                listing.name.slice(0, 2).toUpperCase()
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="directory-profile-title" className="text-lg font-bold text-foreground">
                  {listing.name}
                </h2>
                {isLive && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                    Live
                  </span>
                )}
                {listing.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{listing.tagline}</p>
            </div>
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
            {(listing.city || listing.country) && (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <MapPin className="h-4 w-4 text-primary" />
                {[listing.city, listing.country].filter(Boolean).join(", ")}
              </span>
            )}
            {showRating ? (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {listing.rating} ({listing.reviewCount} reviews)
              </span>
            ) : isLive && listing.profileScore !== undefined ? (
              <span className="inline-flex items-center gap-1.5 text-muted">
                Profile strength: <strong className="text-primary">{listing.profileScore}%</strong>
              </span>
            ) : null}
            {listing.profileViews > 0 && (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Eye className="h-4 w-4 text-primary" />
                {listing.profileViews.toLocaleString()} profile views
              </span>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {categoryLabels[listing.category]}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{listing.description}</p>
          </div>

          {listing.services.length > 0 && (
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
          )}

          <p className="text-xs text-muted">Member since {listing.memberSince}</p>

          {isLive && hasContact ? (
            <div className="rounded-xl border border-border bg-primary-light/20 p-4">
              <p className="text-sm font-semibold text-foreground">Contact</p>
              <ul className="mt-3 space-y-2 text-sm">
                {listing.email && (
                  <li>
                    <a
                      href={`mailto:${listing.email}`}
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {listing.email}
                    </a>
                  </li>
                )}
                {listing.phone && (
                  <li className="inline-flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    {listing.phone}
                  </li>
                )}
                {listing.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${listing.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </li>
                )}
                {listing.website && (
                  <li>
                    <a
                      href={listing.website.startsWith("http") ? listing.website : `https://${listing.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {listing.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-primary-light/30 p-4 text-center">
              <p className="text-sm font-medium text-foreground">Full contact details coming soon</p>
              <p className="mt-1 text-xs text-muted">
                Use Matching to send an enquiry, or upgrade for direct directory messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
