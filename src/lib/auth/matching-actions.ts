"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE, type Business } from "@/lib/database/businesses";
import {
  MARKETPLACE_MATCHES_TABLE,
  type MarketplaceMatch,
} from "@/lib/database/marketplace-matches";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import {
  applyMatchStatuses,
  countEnquiriesSent,
  countPartnershipsThisMonth,
  isUuid,
  mapBusinessesToMarketplaceListings,
} from "@/lib/matching/match-mapper";
import type { MarketplaceListing, MatchType } from "@/lib/matching-data";
import { marketplaceListings } from "@/lib/matching-data";
import { createClient } from "@/lib/supabase/server";

export type MatchingActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type MarketplaceDataResult = MatchingActionResult & {
  listings?: MarketplaceListing[];
  matches?: MarketplaceMatch[];
  stats?: {
    activeMatches: number;
    partnershipsThisMonth: number;
    enquiriesSent: number;
  };
};

export type SaveMarketplaceEnquiryResult = MatchingActionResult & {
  match?: MarketplaceMatch;
};

function isMissingTableError(message: string): boolean {
  return /marketplace_matches|schema cache|relation .* does not exist/i.test(message);
}

function formatMatchingDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Run migration 20260620170000_create_marketplace_matches.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

async function getUserBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ business: Business | null; error?: string }> {
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { business: null, error: error.message };
  }

  return { business: (data as Business | null) ?? null };
}

function mapMatchRow(row: MarketplaceMatch): MarketplaceMatch {
  return row;
}

export async function getMarketplaceDataAction(
  matchType: MatchType = "suppliers",
): Promise<MarketplaceDataResult> {
  const demoListings = marketplaceListings.map((listing) => ({
    ...listing,
    source: "demo" as const,
  }));

  if (!isSupabaseAuthEnabled()) {
    return {
      ok: true,
      listings: demoListings,
      matches: [],
      stats: {
        activeMatches: demoListings.filter((listing) => listing.matchType.includes(matchType)).length,
        partnershipsThisMonth: 0,
        enquiriesSent: 0,
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { business, error: businessError } = await getUserBusiness(supabase, user.id);
  if (businessError) {
    return { ok: false, error: businessError };
  }

  const [businessesResult, matchesResult] = await Promise.all([
    supabase
      .from(BUSINESSES_TABLE)
      .select("*")
      .gte("profile_score", DIRECTORY_MIN_PROFILE_SCORE)
      .order("profile_score", { ascending: false })
      .order("updated_at", { ascending: false }),
    supabase
      .from(MARKETPLACE_MATCHES_TABLE)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (businessesResult.error) {
    return { ok: false, error: businessesResult.error.message };
  }

  if (matchesResult.error) {
    if (isMissingTableError(matchesResult.error.message)) {
      const liveListings = mapBusinessesToMarketplaceListings(
        (businessesResult.data ?? []) as Business[],
        business,
        business?.id,
      );
      const listings = liveListings.length > 0 ? liveListings : demoListings;

      return {
        ok: true,
        listings: applyMatchStatuses(listings, [], matchType),
        matches: [],
        warning: formatMatchingDbError(matchesResult.error.message),
        stats: {
          activeMatches: listings.filter((listing) => listing.matchType.includes(matchType)).length,
          partnershipsThisMonth: 0,
          enquiriesSent: 0,
        },
      };
    }

    return { ok: false, error: formatMatchingDbError(matchesResult.error.message) };
  }

  const liveListings = mapBusinessesToMarketplaceListings(
    (businessesResult.data ?? []) as Business[],
    business,
    business?.id,
  );
  const listings = liveListings.length > 0 ? liveListings : demoListings;
  const matches = (matchesResult.data ?? []) as MarketplaceMatch[];
  const listingsWithStatus = applyMatchStatuses(listings, matches, matchType);

  return {
    ok: true,
    listings: listingsWithStatus,
    matches,
    stats: {
      activeMatches: listingsWithStatus.filter((listing) =>
        listing.matchType.includes(matchType),
      ).length,
      partnershipsThisMonth: countPartnershipsThisMonth(matches),
      enquiriesSent: countEnquiriesSent(matches),
    },
  };
}

export async function saveMarketplaceEnquiryAction(input: {
  matchedBusinessId: string;
  matchType: MatchType;
  matchScore: number;
}): Promise<SaveMarketplaceEnquiryResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  if (!isUuid(input.matchedBusinessId)) {
    return {
      ok: true,
      warning: "Demo listings cannot be saved yet. Live directory businesses will persist enquiries.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { business, error: businessError } = await getUserBusiness(supabase, user.id);
  if (!business?.id) {
    return {
      ok: false,
      error: businessError ?? "Business profile not found. Complete your profile first.",
    };
  }

  if (business.id === input.matchedBusinessId) {
    return { ok: false, error: "You cannot send an enquiry to your own business." };
  }

  const { data, error } = await supabase
    .from(MARKETPLACE_MATCHES_TABLE)
    .upsert(
      {
        user_id: user.id,
        business_id: business.id,
        matched_business_id: input.matchedBusinessId,
        match_type: input.matchType,
        match_score: Math.max(0, Math.min(100, input.matchScore)),
        status: "enquired",
      },
      { onConflict: "user_id,matched_business_id,match_type" },
    )
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatMatchingDbError(error.message) };
  }

  revalidatePath("/dashboard/matching");

  return {
    ok: true,
    match: mapMatchRow(data as MarketplaceMatch),
  };
}
