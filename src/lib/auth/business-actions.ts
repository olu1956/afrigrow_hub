"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { getSessionDataAction } from "@/lib/auth/get-session-data";
import {
  mergeProfileWithDefaults,
  profileToBusinessUpdate,
} from "@/lib/business/profile-mapper";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { USERS_PROFILE_TABLE } from "@/lib/database/users-profile";
import type { BusinessProfile } from "@/lib/profile-data";
import { createClient } from "@/lib/supabase/server";

export type BusinessActionResult = {
  ok: boolean;
  error?: string;
};

export type BusinessProfileResult = BusinessActionResult & {
  profile?: BusinessProfile;
};

export type LogoUploadResult = BusinessActionResult & {
  logoUrl?: string;
  profileScore?: number;
};

export async function getBusinessProfileAction(): Promise<BusinessProfileResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const sessionData = await getSessionDataAction();
  if (!sessionData) {
    return { ok: false, error: "Unable to load session." };
  }

  const { data: business, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    profile: mergeProfileWithDefaults(sessionData.session, business),
  };
}

export async function saveBusinessProfileAction(
  profile: BusinessProfile,
): Promise<BusinessProfileResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const update = profileToBusinessUpdate(profile);

  const { data: existing, error: fetchError } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  let saveError;

  if (existing) {
    ({ error: saveError } = await supabase
      .from(BUSINESSES_TABLE)
      .update(update)
      .eq("user_id", user.id));
  } else {
    ({ error: saveError } = await supabase.from(BUSINESSES_TABLE).insert({
      user_id: user.id,
      ...update,
    }));
  }

  if (saveError) {
    return { ok: false, error: saveError.message };
  }

  if (update.country) {
    await supabase
      .from(USERS_PROFILE_TABLE)
      .update({ country: update.country })
      .eq("user_id", user.id);

    await supabase.auth.updateUser({
      data: { country: update.country, business_name: update.business_name, business_type: update.industry },
    });
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  const refreshed = await getBusinessProfileAction();
  return refreshed;
}

export async function updateBusinessLogoAction(logoUrl: string): Promise<LogoUploadResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  if (!logoUrl.trim()) {
    return { ok: false, error: "Invalid logo URL." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: business } = await supabase
    .from(BUSINESSES_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const sessionData = await getSessionDataAction();
  if (!sessionData) {
    return { ok: false, error: "Unable to load session." };
  }

  const currentProfile = mergeProfileWithDefaults(sessionData.session, business);
  const profileWithLogo: BusinessProfile = {
    ...currentProfile,
    logoUrl,
  };
  const update = profileToBusinessUpdate(profileWithLogo);

  const { error: updateError } = await supabase
    .from(BUSINESSES_TABLE)
    .update({ logo_url: logoUrl, profile_score: update.profile_score })
    .eq("user_id", user.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidatePath("/dashboard/profile");

  return {
    ok: true,
    logoUrl,
    profileScore: update.profile_score,
  };
}
