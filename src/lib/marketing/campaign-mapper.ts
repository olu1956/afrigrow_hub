import type { MarketingCampaign } from "@/lib/database/marketing-campaigns";
import type { CampaignBrief, ContentType, GeneratedContent } from "@/lib/marketing-data";

const HASHTAG_SEPARATOR = "\n\n---\n";

export function serializeCampaignBrief(brief: CampaignBrief): string {
  return JSON.stringify(brief);
}

export function parseCampaignBrief(raw: string): CampaignBrief | null {
  if (!raw.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CampaignBrief>;
    if (!parsed.topic) return null;

    return {
      topic: parsed.topic ?? "",
      audience: parsed.audience ?? "",
      tone: parsed.tone ?? "",
      goal: parsed.goal ?? "",
      platform: parsed.platform ?? "",
    };
  } catch {
    return {
      topic: raw,
      audience: "",
      tone: "",
      goal: "",
      platform: "",
    };
  }
}

export function serializeGeneratedContent(body: string, hashtags?: string): string {
  if (hashtags?.trim()) {
    return `${body}${HASHTAG_SEPARATOR}${hashtags.trim()}`;
  }
  return body;
}

export function parseGeneratedContent(raw: string): { body: string; hashtags?: string } {
  const index = raw.indexOf(HASHTAG_SEPARATOR);
  if (index === -1) {
    return { body: raw };
  }

  return {
    body: raw.slice(0, index),
    hashtags: raw.slice(index + HASHTAG_SEPARATOR.length).trim() || undefined,
  };
}

export function formatCampaignDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}

export function campaignToGeneratedContent(campaign: MarketingCampaign): GeneratedContent {
  const { body, hashtags } = parseGeneratedContent(campaign.generated_content);

  return {
    id: campaign.id,
    type: campaign.campaign_type as ContentType,
    title: campaign.title,
    body,
    hashtags,
    platform: campaign.platform,
    createdAt: formatCampaignDate(campaign.created_at),
    status: campaign.status,
  };
}

export function countCampaignsThisMonth(campaigns: MarketingCampaign[]): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  return campaigns.filter((campaign) => new Date(campaign.created_at) >= start).length;
}

export function countScheduledCampaigns(campaigns: MarketingCampaign[]): number {
  return campaigns.filter((campaign) => campaign.status === "scheduled").length;
}
