import type { FundingOpportunityRow } from "@/lib/database/funding-opportunities";
import type {
  BusinessStage,
  FundingOpportunityDefinition,
  FundingType,
} from "@/lib/funding-data";
import { fundingOpportunities as seedFundingOpportunities } from "@/lib/funding-data";

const FUNDING_TYPES = new Set<FundingType>(["grant", "loan", "accelerator", "equity"]);
const BUSINESS_STAGES = new Set<BusinessStage>([
  "idea",
  "pre_revenue",
  "early",
  "growth",
  "established",
]);

function asFundingType(value: string): FundingType {
  return FUNDING_TYPES.has(value as FundingType) ? (value as FundingType) : "grant";
}

function asStages(values: string[]): BusinessStage[] {
  return values.filter((v): v is BusinessStage => BUSINESS_STAGES.has(v as BusinessStage));
}

export function mapFundingOpportunityRow(
  row: FundingOpportunityRow,
): FundingOpportunityDefinition {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    type: asFundingType(row.type),
    amount: row.amount,
    region: row.region,
    deadline: row.deadline,
    eligibility: row.eligibility,
    description: row.description,
    applyUrl: row.apply_url,
    sectors: row.sectors ?? [],
    countryKeys: (row.country_keys ?? []).map((k) => k.trim().toLowerCase()).filter(Boolean),
    eligibleStages: asStages(row.eligible_stages ?? []),
    sectorKeys: row.sector_keys ?? [],
    fundingMin: row.funding_min ?? undefined,
    fundingMax: row.funding_max ?? undefined,
    fundingCurrency: row.funding_currency || undefined,
  };
}

/** Prefer DB rows; fill gaps from static seed so the catalogue never goes empty. */
export function mergeFundingCatalogue(
  seed: FundingOpportunityDefinition[],
  rows: FundingOpportunityRow[],
): FundingOpportunityDefinition[] {
  const byId = new Map<string, FundingOpportunityDefinition>();

  for (const item of seed) {
    byId.set(item.id, item);
  }

  for (const row of rows) {
    byId.set(row.id, mapFundingOpportunityRow(row));
  }

  return Array.from(byId.values());
}

export function publishedSeedCatalogue(): FundingOpportunityDefinition[] {
  return seedFundingOpportunities;
}

export function definitionToInsert(
  def: FundingOpportunityDefinition,
  status: "draft" | "published" = "published",
): Omit<FundingOpportunityRow, "created_at" | "updated_at"> {
  return {
    id: def.id,
    name: def.name,
    provider: def.provider,
    type: def.type,
    amount: def.amount,
    region: def.region,
    deadline: def.deadline,
    eligibility: def.eligibility,
    description: def.description,
    apply_url: def.applyUrl,
    sectors: def.sectors,
    country_keys: def.countryKeys,
    eligible_stages: def.eligibleStages,
    sector_keys: def.sectorKeys ?? [],
    funding_min: def.fundingMin ?? null,
    funding_max: def.fundingMax ?? null,
    funding_currency: def.fundingCurrency ?? "",
    status,
  };
}
