import { createClient } from "@/lib/supabase/client";
import { BUSINESSES_TABLE, type Business } from "@/lib/database/businesses";

/** Returns the user's primary business (most recently updated). */
export async function fetchUserBusiness(userId: string): Promise<Business | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load businesses:", error.message);
    return null;
  }

  if (!data) return null;
  return data as Business;
}
