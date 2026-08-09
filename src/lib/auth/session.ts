import type { User } from "@supabase/supabase-js";
import type { Business } from "@/lib/database/businesses";
import type { UsersProfile } from "@/lib/database/users-profile";
import {
  emptySession,
  initialsFromName,
  type SessionPreview,
} from "@/lib/session-preview";

type UserMetadata = {
  full_name?: string;
  business_name?: string;
  business_type?: string;
  country?: string;
  plan?: string;
  location?: string;
};

export function sessionFromUser(
  user: User,
  profile?: UsersProfile | null,
  business?: Business | null,
): SessionPreview {
  const meta = (user.user_metadata ?? {}) as UserMetadata;
  const owner =
    profile?.full_name?.trim() ||
    meta.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "User";
  const name =
    business?.business_name?.trim() ||
    meta.business_name?.trim() ||
    `${owner}'s Business`;
  const country =
    business?.country?.trim() ||
    profile?.country?.trim() ||
    meta.country?.trim() ||
    "";
  const email =
    business?.email?.trim() ||
    profile?.email?.trim() ||
    user.email ||
    "";
  const location =
    business?.city?.trim() && country
      ? `${business.city}, ${country}`
      : country || meta.location?.trim() || "";

  return {
    owner,
    name,
    email,
    plan: meta.plan ?? "Growth",
    location,
    country,
    role: profile?.role ?? "owner",
    initials: initialsFromName(owner),
    businessType: business?.industry || meta.business_type,
  };
}

export function sessionFromEmail(email: string, owner?: string): SessionPreview {
  const resolvedOwner =
    owner?.trim() ||
    email
      .split("@")[0]
      ?.replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "User";

  return {
    ...emptySession(),
    owner: resolvedOwner,
    name: `${resolvedOwner}'s Business`,
    email,
    initials: initialsFromName(resolvedOwner),
  };
}
