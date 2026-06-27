"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import {
  FUNDING_PROFILES_TABLE,
  type BusinessStage,
  type FundingProfile,
} from "@/lib/database/funding-profiles";
import {
  buildFundingRecommendations,
  calculateProfileReadiness,
  mapFundingProfile,
} from "@/lib/funding/profile-mapper";
import { createClient } from "@/lib/supabase/server";

export type FundingActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type FundingProfileResult = FundingActionResult & {
  profile?: FundingProfile;
};

function isMissingTableError(message: string): boolean {
  return /funding_profiles|schema cache|relation .* does not exist/i.test(message);
}

function formatFundingDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Run migration 20260620200000_create_funding_profiles.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

async function getUserBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ businessId: string | null; country: string; error?: string }> {
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id, country")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { businessId: null, country: "", error: error.message };
  }

  if (!data?.id) {
    return { businessId: null, country: "", error: "Business profile not found. Complete your profile first." };
  }

  return { businessId: data.id, country: data.country ?? "" };
}

export async function getFundingProfileAction(): Promise<FundingProfileResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from(FUNDING_PROFILES_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) {
      return { ok: true, warning: formatFundingDbError(error.message) };
    }

    return { ok: false, error: formatFundingDbError(error.message) };
  }

  if (!data) {
    return { ok: true };
  }

  return {
    ok: true,
    profile: mapFundingProfile(data as FundingProfile),
  };
}

export async function saveFundingProfileAction(input: {
  businessStage: BusinessStage;
  annualRevenue: number;
  fundingNeeded: number;
  fundingPurpose: string;
  completedChecklist: string[];
  country?: string;
}): Promise<FundingProfileResult> {
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

  const { businessId, country, error: businessError } = await getUserBusiness(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: businessError };
  }

  const readinessScore = calculateProfileReadiness(input.completedChecklist);
  const recommendations = buildFundingRecommendations({
    completedChecklist: input.completedChecklist,
    businessStage: input.businessStage,
    fundingPurpose: input.fundingPurpose,
    fundingNeeded: input.fundingNeeded,
    country: input.country?.trim() || country,
  });

  const { data, error } = await supabase
    .from(FUNDING_PROFILES_TABLE)
    .upsert(
      {
        user_id: user.id,
        business_id: businessId,
        business_stage: input.businessStage,
        annual_revenue: Math.max(0, input.annualRevenue),
        funding_needed: Math.max(0, input.fundingNeeded),
        funding_purpose: input.fundingPurpose.trim(),
        readiness_score: readinessScore,
        recommendations,
      },
      { onConflict: "business_id" },
    )
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatFundingDbError(error.message) };
  }

  revalidatePath("/dashboard/funding");

  return {
    ok: true,
    profile: mapFundingProfile(data as FundingProfile),
  };
}
