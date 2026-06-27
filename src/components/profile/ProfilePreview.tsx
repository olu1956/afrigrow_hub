"use client";

import Image from "next/image";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";
import { profileCategories, type BusinessProfile } from "@/lib/profile-data";

type ProfilePreviewProps = {
  profile: BusinessProfile;
  initials: string;
};

export function ProfilePreview({ profile, initials }: ProfilePreviewProps) {
  const categoryLabel =
    profileCategories.find((c) => c.value === profile.category)?.label ??
    profile.category;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-primary-dark to-primary px-5 py-6 text-white">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-xl font-bold">
            {profile.logoUrl ? (
              <Image
                src={profile.logoUrl}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              initials || "?"
            )}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight">
              {profile.businessName || "Your business name"}
            </h3>
            <p className="mt-1 text-sm text-white/80">
              {profile.tagline || "Your tagline appears here"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
                {categoryLabel}
              </span>
              {profile.foundedYear && (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
                  Est. {profile.foundedYear}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            About
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            {profile.bio || "Your business bio will appear here for buyers and partners to read."}
          </p>
        </div>

        {(profile.city || profile.country) && (
          <div className="flex items-start gap-2 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              {[profile.address, profile.city, profile.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}

        {profile.services.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Services
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.services.map((service) => (
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

        <div className="space-y-2 border-t border-border pt-4">
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center gap-2 text-sm text-muted hover:text-primary"
            >
              <Phone className="h-4 w-4" />
              {profile.phone}
            </a>
          )}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-sm text-muted hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              {profile.email}
            </a>
          )}
          {profile.website && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Globe className="h-4 w-4" />
              {profile.website}
            </p>
          )}
        </div>

        {(profile.instagram || profile.facebook || profile.linkedin) && (
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Share2 className="h-4 w-4 text-muted" />
            <div className="flex flex-wrap gap-2 text-xs text-primary">
              {profile.instagram && <span>{profile.instagram}</span>}
              {profile.facebook && <span>{profile.facebook}</span>}
              {profile.linkedin && <span>{profile.linkedin}</span>}
            </div>
          </div>
        )}

        <div className="rounded-xl bg-primary-light/50 px-4 py-3 text-center">
          <Building2 className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-xs font-medium text-primary">
            Public marketplace preview
          </p>
        </div>
      </div>
    </div>
  );
}
