"use server";

import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE, type Business } from "@/lib/database/businesses";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import { mapBusinessesToDirectoryListings } from "@/lib/directory/map-business-to-listing";
import type { DirectoryListing } from "@/lib/directory-data";
import { createClient } from "@/lib/supabase/server";

export type DirectoryListingsResult = {
  ok: boolean;
  listings: DirectoryListing[];
  error?: string;
};

export type MyDirectoryStatusResult = {
  ok: boolean;
  profileScore: number | null;
  listed: boolean;
  businessName: string | null;
  error?: string;
};

export async function getMyDirectoryStatusAction(): Promise<MyDirectoryStatusResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, profileScore: null, listed: false, businessName: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, profileScore: null, listed: false, businessName: null, error: "Not signed in." };
  }

  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("profile_score, business_name, directory_hidden")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // Older DBs without directory_hidden — fall back to score-only listing.
    if (/directory_hidden/i.test(error.message)) {
      const fallback = await supabase
        .from(BUSINESSES_TABLE)
        .select("profile_score, business_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fallback.error) {
        return {
          ok: false,
          profileScore: null,
          listed: false,
          businessName: null,
          error: fallback.error.message,
        };
      }

      const profileScore =
        typeof fallback.data?.profile_score === "number" ? fallback.data.profile_score : null;
      const businessName = fallback.data?.business_name?.trim() || null;
      const listed = Boolean(
        businessName && profileScore !== null && profileScore >= DIRECTORY_MIN_PROFILE_SCORE,
      );
      return { ok: true, profileScore, listed, businessName };
    }

    return {
      ok: false,
      profileScore: null,
      listed: false,
      businessName: null,
      error: error.message,
    };
  }

  const profileScore = typeof data?.profile_score === "number" ? data.profile_score : null;
  const businessName = data?.business_name?.trim() || null;
  const directoryHidden = Boolean(
    (data as { directory_hidden?: boolean | null } | null)?.directory_hidden,
  );
  const listed = Boolean(
    businessName &&
      profileScore !== null &&
      profileScore >= DIRECTORY_MIN_PROFILE_SCORE &&
      !directoryHidden,
  );

  return { ok: true, profileScore, listed, businessName };
}

export async function getDirectoryListingsAction(): Promise<DirectoryListingsResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, listings: [] };
  }

  const supabase = await createClient();
  let { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("*")
    .gte("profile_score", DIRECTORY_MIN_PROFILE_SCORE)
    .eq("directory_hidden", false)
    .order("profile_score", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error && /directory_hidden/i.test(error.message)) {
    const fallback = await supabase
      .from(BUSINESSES_TABLE)
      .select("*")
      .gte("profile_score", DIRECTORY_MIN_PROFILE_SCORE)
      .order("profile_score", { ascending: false })
      .order("updated_at", { ascending: false });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    return { ok: false, listings: [], error: error.message };
  }

  const listings = mapBusinessesToDirectoryListings((data ?? []) as Business[]);
  return { ok: true, listings };
}
