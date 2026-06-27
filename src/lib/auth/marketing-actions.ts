"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import {
  MARKETING_CAMPAIGNS_TABLE,
  type MarketingCampaign,
  type MarketingCampaignStatus,
} from "@/lib/database/marketing-campaigns";
import {
  campaignToGeneratedContent,
  countCampaignsThisMonth,
  countScheduledCampaigns,
  serializeCampaignBrief,
  serializeGeneratedContent,
} from "@/lib/marketing/campaign-mapper";
import type { CampaignBrief, ContentType, GeneratedContent } from "@/lib/marketing-data";
import { createClient } from "@/lib/supabase/server";

export type MarketingActionResult = {
  ok: boolean;
  error?: string;
};

export type MarketingCampaignsResult = MarketingActionResult & {
  campaigns?: GeneratedContent[];
  stats?: {
    campaignsThisMonth: number;
    scheduledPosts: number;
    totalCampaigns: number;
  };
};

export type SaveMarketingCampaignResult = MarketingActionResult & {
  campaign?: GeneratedContent;
};

async function getUserBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ businessId: string | null; error?: string }> {
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { businessId: null, error: error.message };
  }

  if (!data?.id) {
    return { businessId: null, error: "Business profile not found. Complete your profile first." };
  }

  return { businessId: data.id };
}

export async function getMarketingCampaignsAction(): Promise<MarketingCampaignsResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, campaigns: [], stats: { campaignsThisMonth: 0, scheduledPosts: 0, totalCampaigns: 0 } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from(MARKETING_CAMPAIGNS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  const rows = (data ?? []) as MarketingCampaign[];
  const campaigns = rows.map(campaignToGeneratedContent);

  return {
    ok: true,
    campaigns,
    stats: {
      campaignsThisMonth: countCampaignsThisMonth(rows),
      scheduledPosts: countScheduledCampaigns(rows),
      totalCampaigns: rows.length,
    },
  };
}

export async function saveMarketingCampaignAction(input: {
  campaignType: ContentType;
  title: string;
  brief: CampaignBrief;
  body: string;
  hashtags?: string;
  status?: MarketingCampaignStatus;
}): Promise<SaveMarketingCampaignResult> {
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

  const { businessId, error: businessError } = await getUserBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: businessError };
  }

  const { data, error } = await supabase
    .from(MARKETING_CAMPAIGNS_TABLE)
    .insert({
      user_id: user.id,
      business_id: businessId,
      campaign_type: input.campaignType,
      title: input.title.trim(),
      prompt: serializeCampaignBrief(input.brief),
      generated_content: serializeGeneratedContent(input.body, input.hashtags),
      platform: input.brief.platform.trim(),
      status: input.status ?? "generated",
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/marketing");

  return {
    ok: true,
    campaign: campaignToGeneratedContent(data as MarketingCampaign),
  };
}

export async function deleteMarketingCampaignAction(id: string): Promise<MarketingActionResult> {
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

  const { error } = await supabase
    .from(MARKETING_CAMPAIGNS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/marketing");

  return { ok: true };
}
