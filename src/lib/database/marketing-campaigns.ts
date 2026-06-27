import type { ContentType } from "@/lib/marketing-data";

export type MarketingCampaignStatus =
  | "draft"
  | "generated"
  | "scheduled"
  | "published"
  | "archived";

export type MarketingCampaign = {
  id: string;
  user_id: string;
  business_id: string;
  campaign_type: ContentType;
  title: string;
  prompt: string;
  generated_content: string;
  platform: string;
  status: MarketingCampaignStatus;
  created_at: string;
};

export type MarketingCampaignInsert = Pick<
  MarketingCampaign,
  "user_id" | "business_id" | "campaign_type"
> &
  Partial<
    Pick<
      MarketingCampaign,
      "title" | "prompt" | "generated_content" | "platform" | "status"
    >
  >;

export type MarketingCampaignUpdate = Partial<
  Pick<
    MarketingCampaign,
    "title" | "prompt" | "generated_content" | "platform" | "status"
  >
>;

export const MARKETING_CAMPAIGNS_TABLE = "marketing_campaigns" as const;

export const MARKETING_CAMPAIGN_STATUSES: MarketingCampaignStatus[] = [
  "draft",
  "generated",
  "scheduled",
  "published",
  "archived",
];
