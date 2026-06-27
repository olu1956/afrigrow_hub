import { createClient } from "@/lib/supabase/client";
import { USERS_PROFILE_TABLE, type UsersProfile } from "@/lib/database/users-profile";

export async function fetchUserProfile(userId: string): Promise<UsersProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(USERS_PROFILE_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load users_profile:", error.message);
    return null;
  }

  if (!data) return null;
  return data as UsersProfile;
}
