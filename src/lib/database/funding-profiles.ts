export type BusinessStage = "idea" | "pre_revenue" | "early" | "growth" | "established";

export type FundingRecommendationsPayload = {
  completedChecklist: string[];
  items: string[];
};

export type FundingProfile = {
  id: string;
  user_id: string;
  business_id: string;
  business_stage: BusinessStage;
  annual_revenue: number;
  funding_needed: number;
  funding_purpose: string;
  readiness_score: number;
  recommendations: FundingRecommendationsPayload;
  created_at: string;
};

export type FundingProfileInsert = Pick<
  FundingProfile,
  "user_id" | "business_id" | "business_stage"
> &
  Partial<
    Pick<
      FundingProfile,
      | "annual_revenue"
      | "funding_needed"
      | "funding_purpose"
      | "readiness_score"
      | "recommendations"
    >
  >;

export type FundingProfileUpdate = Partial<
  Pick<
    FundingProfile,
    | "business_stage"
    | "annual_revenue"
    | "funding_needed"
    | "funding_purpose"
    | "readiness_score"
    | "recommendations"
  >
>;

export const FUNDING_PROFILES_TABLE = "funding_profiles" as const;

export const BUSINESS_STAGES: BusinessStage[] = [
  "idea",
  "pre_revenue",
  "early",
  "growth",
  "established",
];
