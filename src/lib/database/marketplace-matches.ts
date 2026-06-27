import type { MatchType } from "@/lib/matching-data";

export type MarketplaceMatchStatus =
  | "suggested"
  | "enquired"
  | "accepted"
  | "declined"
  | "archived";

export type MarketplaceMatch = {
  id: string;
  user_id: string;
  business_id: string;
  matched_business_id: string;
  match_type: MatchType;
  match_score: number;
  status: MarketplaceMatchStatus;
  created_at: string;
};

export type MarketplaceMatchInsert = Pick<
  MarketplaceMatch,
  "user_id" | "business_id" | "matched_business_id" | "match_type"
> &
  Partial<Pick<MarketplaceMatch, "match_score" | "status">>;

export type MarketplaceMatchUpdate = Partial<
  Pick<MarketplaceMatch, "match_score" | "status">
>;

export const MARKETPLACE_MATCHES_TABLE = "marketplace_matches" as const;

export const MARKETPLACE_MATCH_STATUSES: MarketplaceMatchStatus[] = [
  "suggested",
  "enquired",
  "accepted",
  "declined",
  "archived",
];
