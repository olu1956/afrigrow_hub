"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { getSessionDataAction } from "@/lib/auth/get-session-data";
import { USERS_PROFILE_TABLE } from "@/lib/database/users-profile";
import { createClient } from "@/lib/supabase/server";

export type ProfileUpdateResult = {
  ok: boolean;
  error?: string;
};

export async function updateUserProfileAction(input: {
  country: string;
}): Promise<ProfileUpdateResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const country = input.country.trim();
  if (!country) {
    return { ok: false, error: "Please select a country." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in to update your profile." };
  }

  const { error } = await supabase
    .from(USERS_PROFILE_TABLE)
    .update({ country })
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.auth.updateUser({
    data: { country },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export { getSessionDataAction };
