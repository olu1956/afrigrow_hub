export type FundingOpportunityStatus = "draft" | "published";

export type FundingOpportunityRow = {
  id: string;
  name: string;
  provider: string;
  type: string;
  amount: string;
  region: string;
  deadline: string;
  eligibility: string;
  description: string;
  apply_url: string;
  sectors: string[];
  country_keys: string[];
  eligible_stages: string[];
  sector_keys: string[];
  funding_min: number | null;
  funding_max: number | null;
  funding_currency: string;
  status: FundingOpportunityStatus;
  created_at: string;
  updated_at: string;
};

export type FundingOpportunityInsert = Omit<
  FundingOpportunityRow,
  "created_at" | "updated_at"
> &
  Partial<Pick<FundingOpportunityRow, "created_at" | "updated_at">>;

export const FUNDING_OPPORTUNITIES_TABLE = "funding_opportunities" as const;

export const FUNDING_OPPORTUNITY_STATUSES: FundingOpportunityStatus[] = [
  "draft",
  "published",
];
