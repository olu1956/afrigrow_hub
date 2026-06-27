import type {
  BusinessStage,
  FundingProfile,
  FundingRecommendationsPayload,
} from "@/lib/database/funding-profiles";
import {
  calculateReadiness,
  readinessItems,
} from "@/lib/funding-data";
import {
  normalizeCountryKey,
  resolveBusinessCurrency,
} from "@/lib/funding/currency";

function parseAmount(value: number | string): number {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseFundingRecommendations(raw: unknown): FundingRecommendationsPayload {
  if (!raw || typeof raw !== "object") {
    return { completedChecklist: [], items: [] };
  }

  const payload = raw as Partial<FundingRecommendationsPayload>;

  return {
    completedChecklist: Array.isArray(payload.completedChecklist)
      ? payload.completedChecklist.filter((id): id is string => typeof id === "string")
      : [],
    items: Array.isArray(payload.items)
      ? payload.items.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function mapFundingProfile(row: FundingProfile): FundingProfile {
  return {
    ...row,
    annual_revenue: parseAmount(row.annual_revenue),
    funding_needed: parseAmount(row.funding_needed),
    recommendations: parseFundingRecommendations(row.recommendations),
  };
}

export function buildFundingRecommendations(input: {
  completedChecklist: string[];
  businessStage: BusinessStage;
  fundingPurpose: string;
  fundingNeeded: number;
  country?: string;
}): FundingRecommendationsPayload {
  const completed = new Set(input.completedChecklist);
  const items: string[] = [];
  const countryKey = normalizeCountryKey(input.country ?? "");
  const currency = resolveBusinessCurrency(input.country ?? "");
  const highAsk = input.fundingNeeded >= currency.highFundingThreshold;

  for (const item of readinessItems.filter((row) => row.required && !completed.has(row.id))) {
    items.push(`Complete required item: ${item.label}`);
  }

  if (input.businessStage === "idea" || input.businessStage === "pre_revenue") {
    items.push("Prioritise grants and accelerator programmes suited to early-stage founders.");
  } else if (input.businessStage === "established") {
    items.push("Consider larger loan facilities and equity partners with proven revenue history.");
  }

  items.push(fundingProgrammeHint(countryKey, highAsk));

  const purpose = input.fundingPurpose.trim().toLowerCase();
  if (purpose.includes("equipment") || purpose.includes("machine")) {
    items.push("Emphasise asset or equipment use in your funding application narrative.");
  }
  if (purpose.includes("inventory") || purpose.includes("stock")) {
    items.push("Include inventory turnover plans and supplier quotes in your application pack.");
  }
  if (purpose.includes("marketing") || purpose.includes("expansion")) {
    items.push("Tie your funding ask to measurable growth targets and a 90-day rollout plan.");
  }

  if (items.length === 0) {
    items.push("Your checklist looks strong — shortlist 2–3 matched grants and prepare applications.");
  }

  return {
    completedChecklist: input.completedChecklist,
    items: [...new Set(items)].slice(0, 6),
  };
}

function fundingProgrammeHint(countryKey: string, highAsk: boolean): string {
  switch (countryKey) {
    case "nigeria":
      return highAsk
        ? "Explore BOI SME Loan and Lagos LSETF for higher working-capital needs."
        : "Tony Elumelu Foundation and Africa MSME Grant Fund may match your funding size.";
    case "ghana":
      return highAsk
        ? "Look at Development Bank Ghana and commercial bank SME lines for larger facilities."
        : "Consider GEPA export support and smaller GIRSAL-backed SME facilities.";
    case "kenya":
      return highAsk
        ? "Explore Kenya development bank products and tier-1 bank SME lending lines."
        : "Consider Youth Enterprise Fund and Fanisi-style growth programmes.";
    case "south africa":
      return highAsk
        ? "Explore IDC and SMEgo funding lines for expansion capital."
        : "Consider SEFA and regional small enterprise development agencies.";
    case "uk":
      return highAsk
        ? "Explore British Business Bank partners and regional growth funds."
        : "Consider Start Up Loans and local council grant programmes for UK SMEs.";
    case "canada":
      return highAsk
        ? "Explore BDC and major bank SME lending programmes for growth capital."
        : "Consider Canada Small Business Financing Program and regional grants.";
    case "usa":
      return highAsk
        ? "Explore SBA-backed lenders and regional economic development funds."
        : "Consider microloan programmes and small business grant directories.";
    default:
      return highAsk
        ? "Explore national development bank and regional SME loan facilities in your country."
        : "Tony Elumelu Foundation and Africa MSME Grant Fund may match your funding size.";
  }
}

export function formatFundingPotential(amount: number, country = ""): string {
  if (amount <= 0) return "Set funding target";

  const { code, locale } = resolveBusinessCurrency(country);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function businessStageLabel(stage: BusinessStage): string {
  const labels: Record<BusinessStage, string> = {
    idea: "Idea stage",
    pre_revenue: "Pre-revenue / startup",
    early: "Early revenue",
    growth: "Growth stage",
    established: "Established",
  };

  return labels[stage];
}

export function profileToFormState(profile: FundingProfile) {
  return {
    businessStage: profile.business_stage,
    annualRevenue: String(profile.annual_revenue || ""),
    fundingNeeded: String(profile.funding_needed || ""),
    fundingPurpose: profile.funding_purpose,
    completedChecklist: profile.recommendations.completedChecklist,
    recommendationItems: profile.recommendations.items,
    readinessScore: profile.readiness_score,
  };
}

export function calculateProfileReadiness(completedChecklist: string[]): number {
  return calculateReadiness(new Set(completedChecklist));
}
