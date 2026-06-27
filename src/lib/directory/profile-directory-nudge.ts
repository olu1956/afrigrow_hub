import {
  DIRECTORY_FEATURED_MIN_SCORE,
  DIRECTORY_MIN_PROFILE_SCORE,
} from "@/lib/directory/constants";

export type DirectoryNudgeVariant =
  | "below_threshold"
  | "almost_there"
  | "ready_save"
  | "listed"
  | "featured_push";

export type DirectoryNudgeContent = {
  variant: DirectoryNudgeVariant;
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
  pointsToDirectory?: number;
};

type DirectoryNudgeInput = {
  strength: number;
  /** Last saved profile_score from Supabase (if known). */
  savedStrength?: number | null;
  /** Whether the business row qualifies for directory listing. */
  listed?: boolean;
};

export function getDirectoryNudge(input: DirectoryNudgeInput): DirectoryNudgeContent {
  const { strength, listed = false } = input;
  const savedStrength = input.savedStrength ?? strength;

  if (listed && savedStrength >= DIRECTORY_FEATURED_MIN_SCORE) {
    return {
      variant: "featured_push",
      title: "Featured in the directory",
      message:
        "Your profile qualifies for featured placement. Keep your logo and services up to date so buyers find you first.",
      ctaLabel: "View directory",
      ctaHref: "/dashboard/directory",
    };
  }

  if (listed && savedStrength >= DIRECTORY_MIN_PROFILE_SCORE) {
    return {
      variant: "listed",
      title: "You're live in the directory",
      message: `Other AfriGrow members can discover ${savedStrength >= DIRECTORY_FEATURED_MIN_SCORE ? "and feature " : ""}your business. Reach ${DIRECTORY_FEATURED_MIN_SCORE}% with a logo for featured status.`,
      ctaLabel: "View your listing",
      ctaHref: "/dashboard/directory",
    };
  }

  if (strength >= DIRECTORY_MIN_PROFILE_SCORE && savedStrength < DIRECTORY_MIN_PROFILE_SCORE) {
    return {
      variant: "ready_save",
      title: "Ready for the directory",
      message: `Your profile is at ${strength}%. Save your profile to go live in the Business Directory.`,
      ctaLabel: "Save profile",
      ctaHref: "/dashboard/profile",
    };
  }

  if (strength >= DIRECTORY_MIN_PROFILE_SCORE && savedStrength >= DIRECTORY_MIN_PROFILE_SCORE && !listed) {
    return {
      variant: "ready_save",
      title: "Save to appear in the directory",
      message:
        "Your saved score may be out of date. Save your profile again so the directory picks up your latest details.",
      ctaLabel: "Save profile",
      ctaHref: "/dashboard/profile",
    };
  }

  const pointsToDirectory = Math.max(0, DIRECTORY_MIN_PROFILE_SCORE - strength);

  if (pointsToDirectory > 0 && pointsToDirectory <= 15) {
    return {
      variant: "almost_there",
      title: `${pointsToDirectory}% to the directory`,
      message: `Reach ${DIRECTORY_MIN_PROFILE_SCORE}% profile strength to appear in the Business Directory where members find partners and suppliers.`,
      ctaLabel: "Complete profile",
      ctaHref: "/dashboard/profile",
      pointsToDirectory,
    };
  }

  return {
    variant: "below_threshold",
    title: "Get discovered in the directory",
    message: `Complete your profile to ${DIRECTORY_MIN_PROFILE_SCORE}% to appear in the AfriGrow Business Directory.`,
    ctaLabel: "Build your profile",
    ctaHref: "/dashboard/profile",
    pointsToDirectory,
  };
}
