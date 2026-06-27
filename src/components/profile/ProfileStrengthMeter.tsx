"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { ProfileDirectoryNudge } from "@/components/profile/ProfileDirectoryNudge";
import { getDirectoryNudge } from "@/lib/directory/profile-directory-nudge";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import type { BusinessProfile } from "@/lib/profile-data";

type ProfileStrengthMeterProps = {
  strength: number;
  profile: BusinessProfile;
  savedStrength?: number | null;
  listed?: boolean;
  onSaveProfile?: () => void;
};

const checklist = (profile: BusinessProfile) => [
  { label: "Business name", done: !!profile.businessName.trim() },
  { label: "Tagline", done: !!profile.tagline.trim() },
  { label: "Category & location", done: !!profile.city && !!profile.country },
  { label: "Contact details", done: !!profile.phone && !!profile.email },
  { label: "Detailed bio (80+ chars)", done: profile.bio.trim().length >= 80 },
  { label: "At least 2 services", done: profile.services.length >= 2 },
  { label: "Business logo", done: !!profile.logoUrl.trim() },
  { label: "Website or social link", done: !!profile.website || !!profile.instagram },
];

export function ProfileStrengthMeter({
  strength,
  profile,
  savedStrength,
  listed = false,
  onSaveProfile,
}: ProfileStrengthMeterProps) {
  const items = checklist(profile);
  const incomplete = items.filter((i) => !i.done);
  const directoryNudge = getDirectoryNudge({ strength, savedStrength, listed });
  const showSaveCta =
    directoryNudge.variant === "ready_save" && typeof onSaveProfile === "function";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Profile strength</h3>
        <span className="text-2xl font-bold text-primary">{strength}%</span>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary-light">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${strength}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-muted">
        {strength >= 90
          ? "Excellent — your profile is marketplace-ready."
          : strength >= 70
            ? "Good progress — complete a few more fields to stand out."
            : "Add more details so buyers and partners can find and trust you."}
      </p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted/40" />
            )}
            <span className={item.done ? "text-muted" : "text-foreground"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {incomplete.length > 0 && strength < 100 && (
        <p className="mt-4 rounded-xl bg-accent-light px-3 py-2 text-xs font-medium text-accent">
          Tip: {incomplete[0]?.label} is your next quick win
          {strength < DIRECTORY_MIN_PROFILE_SCORE ? " toward the directory." : "."}
        </p>
      )}
      </div>

      <ProfileDirectoryNudge
        content={directoryNudge}
        compact
        onCtaClick={showSaveCta ? onSaveProfile : undefined}
      />
    </div>
  );
}
