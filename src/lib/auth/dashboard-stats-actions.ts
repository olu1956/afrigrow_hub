"use server";

import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { countDueLeads } from "@/lib/crm/lead-mapper";
import { countEnquiriesSent } from "@/lib/matching/match-mapper";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { FUNDING_PROFILES_TABLE } from "@/lib/database/funding-profiles";
import { INVOICES_TABLE } from "@/lib/database/invoices";
import { LEADS_TABLE, type Lead } from "@/lib/database/leads";
import { MARKETING_CAMPAIGNS_TABLE } from "@/lib/database/marketing-campaigns";
import { MARKETPLACE_MATCHES_TABLE, type MarketplaceMatch } from "@/lib/database/marketplace-matches";
import { QUOTATIONS_TABLE } from "@/lib/database/quotations";
import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  profileStrength: number | null;
  crmContacts: number;
  crmFollowUpsDue: number;
  marketingCampaigns: number;
  matchEnquiries: number;
  fundingReadiness: number | null;
  invoicesCreated: number;
  quotationsCreated: number;
};

export type DashboardStatsResult = {
  ok: boolean;
  error?: string;
  stats?: DashboardStats;
};

const emptyStats: DashboardStats = {
  profileStrength: null,
  crmContacts: 0,
  crmFollowUpsDue: 0,
  marketingCampaigns: 0,
  matchEnquiries: 0,
  fundingReadiness: null,
  invoicesCreated: 0,
  quotationsCreated: 0,
};

async function safeCount(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function getDashboardStatsAction(): Promise<DashboardStatsResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, stats: emptyStats };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const [
    businessResult,
    leadsResult,
    campaignsCount,
    matchesResult,
    fundingResult,
    invoicesCount,
    quotationsCount,
  ] = await Promise.all([
    supabase.from(BUSINESSES_TABLE).select("profile_score").eq("user_id", user.id).maybeSingle(),
    supabase.from(LEADS_TABLE).select("*").eq("user_id", user.id),
    safeCount(
      supabase
        .from(MARKETING_CAMPAIGNS_TABLE)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ),
    supabase.from(MARKETPLACE_MATCHES_TABLE).select("*").eq("user_id", user.id),
    supabase
      .from(FUNDING_PROFILES_TABLE)
      .select("readiness_score")
      .eq("user_id", user.id)
      .maybeSingle(),
    safeCount(
      supabase
        .from(INVOICES_TABLE)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ),
    safeCount(
      supabase
        .from(QUOTATIONS_TABLE)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ),
  ]);

  const leads = leadsResult.error ? [] : ((leadsResult.data ?? []) as Lead[]);
  const matches = matchesResult.error
    ? []
    : ((matchesResult.data ?? []) as MarketplaceMatch[]);

  const profileScore = businessResult.data?.profile_score;
  const profileStrength =
    typeof profileScore === "number" && profileScore > 0 ? profileScore : null;

  const fundingScore = fundingResult.data?.readiness_score;
  const fundingReadiness =
    typeof fundingScore === "number" ? fundingScore : null;

  return {
    ok: true,
    stats: {
      profileStrength,
      crmContacts: leads.length,
      crmFollowUpsDue: countDueLeads(leads),
      marketingCampaigns: campaignsCount,
      matchEnquiries: countEnquiriesSent(matches),
      fundingReadiness,
      invoicesCreated: invoicesCount,
      quotationsCreated: quotationsCount,
    },
  };
}
