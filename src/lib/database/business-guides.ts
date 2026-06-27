export const BUSINESS_GUIDES_TABLE = "business_guides";

export const GUIDE_TOPICS = [
  "profile",
  "marketing",
  "crm",
  "matching",
  "funding",
  "pricing",
  "growth",
  "general",
] as const;

export type GuideTopic = (typeof GUIDE_TOPICS)[number];

export type GuideStatus = "draft" | "published";

export type BusinessGuideRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: GuideTopic;
  author: string;
  read_time_minutes: number;
  is_featured: boolean;
  featured_until: string | null;
  status: GuideStatus;
  linked_agent_href: string;
  linked_agent_label: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessGuideInput = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: GuideTopic;
  author?: string;
  readTimeMinutes?: number;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  status?: GuideStatus;
  linkedAgentHref?: string;
  linkedAgentLabel?: string;
  publishedAt?: string | null;
};
