import type { BusinessStage } from "@/lib/funding-data";
import { resolveBusinessCurrency } from "@/lib/funding/currency";
import {
  opportunityMatchesCountry,
  regionMatchScore,
} from "@/lib/funding/regions";
import type { FundingOpportunityDefinition, MatchedGrantOpportunity } from "@/lib/funding-data";

const STAGE_ORDER: BusinessStage[] = [
  "idea",
  "pre_revenue",
  "early",
  "growth",
  "established",
];

export type FundingMatchInput = {
  country: string;
  businessStage: BusinessStage;
  fundingNeeded: number;
  businessType?: string;
  readinessScore: number;
};

function stageDistance(a: BusinessStage, b: BusinessStage): number {
  return Math.abs(STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b));
}

function stageMatchScore(
  eligibleStages: BusinessStage[],
  userStage: BusinessStage,
): number {
  if (eligibleStages.includes(userStage)) return 25;

  const nearest = Math.min(...eligibleStages.map((stage) => stageDistance(stage, userStage)));
  if (nearest === 1) return 15;
  if (nearest === 2) return 8;
  return 3;
}

function sectorMatchScore(
  sectorKeys: string[] | undefined,
  businessType: string | undefined,
): number {
  if (!sectorKeys?.length) return 6;
  if (!businessType?.trim()) return 6;

  const normalized = businessType.trim().toLowerCase();
  if (sectorKeys.includes(normalized)) return 10;
  if (normalized === "other") return 5;
  return 3;
}

function fundingAmountMatchScore(
  opportunity: FundingOpportunityDefinition,
  fundingNeeded: number,
  userCountry: string,
): number {
  if (fundingNeeded <= 0) return 12;
  if (opportunity.fundingMin == null && opportunity.fundingMax == null) return 12;

  const userCurrency = resolveBusinessCurrency(userCountry).code;
  const oppCurrency = opportunity.fundingCurrency ?? userCurrency;

  if (oppCurrency !== userCurrency) return 10;

  const min = opportunity.fundingMin ?? 0;
  const max = opportunity.fundingMax ?? Number.POSITIVE_INFINITY;

  if (fundingNeeded >= min && fundingNeeded <= max) return 20;

  if (fundingNeeded < min) {
    const ratio = fundingNeeded / min;
    if (ratio >= 0.5) return 14;
    if (ratio >= 0.25) return 8;
    return 4;
  }

  const ratio = max / fundingNeeded;
  if (ratio >= 0.5) return 14;
  if (ratio >= 0.25) return 8;
  return 4;
}

export function calculateMatchScore(
  opportunity: FundingOpportunityDefinition,
  input: FundingMatchInput,
): number {
  const region = regionMatchScore(opportunity.countryKeys, input.country);
  const stage = stageMatchScore(opportunity.eligibleStages, input.businessStage);
  const amount = fundingAmountMatchScore(opportunity, input.fundingNeeded, input.country);
  const sector = sectorMatchScore(opportunity.sectorKeys, input.businessType);
  const readiness = Math.round(input.readinessScore * 0.1);

  return Math.min(100, Math.max(0, region + stage + amount + sector + readiness));
}

export function matchFundingOpportunities(
  opportunities: FundingOpportunityDefinition[],
  input: FundingMatchInput,
): MatchedGrantOpportunity[] {
  return opportunities
    .filter((opportunity) => opportunityMatchesCountry(opportunity.countryKeys, input.country))
    .map((opportunity) => ({
      ...opportunity,
      matchScore: calculateMatchScore(opportunity, input),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
