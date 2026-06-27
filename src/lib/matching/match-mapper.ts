import type { Business } from "@/lib/database/businesses";
import type { MarketplaceMatch, MarketplaceMatchStatus } from "@/lib/database/marketplace-matches";
import {
  normalizeCountryLabel,
} from "@/lib/directory/map-business-to-listing";
import type { ListingCategory, MarketplaceListing, MatchType } from "@/lib/matching-data";

const VALID_CATEGORIES = new Set<ListingCategory>([
  "retail",
  "manufacturing",
  "services",
  "events",
  "food",
  "tech",
]);

function normalizeCategory(industry: string): ListingCategory {
  const value = industry.trim().toLowerCase();
  if (VALID_CATEGORIES.has(value as ListingCategory)) {
    return value as ListingCategory;
  }
  return "services";
}

function inferMatchTypes(category: ListingCategory): MatchType[] {
  switch (category) {
    case "manufacturing":
      return ["suppliers", "partners"];
    case "retail":
    case "food":
      return ["buyers", "partners"];
    case "events":
      return ["buyers", "partners"];
    case "tech":
      return ["partners", "suppliers"];
    default:
      return ["buyers", "suppliers", "partners"];
  }
}

function buildLookingFor(business: Business, category: ListingCategory): string {
  const services = business.products_services?.filter(Boolean) ?? [];
  if (services.length > 0) {
    return `Connections for ${services.slice(0, 2).join(" and ")}`;
  }

  return `Partners and ${category === "manufacturing" ? "buyers" : "suppliers"} in ${normalizeCountryLabel(business.country) || "their region"}`;
}

export function computeMatchScore(source: Business, target: Business): number {
  let score = 45;

  if (
    source.country.trim() &&
    target.country.trim() &&
    normalizeCountryLabel(source.country) === normalizeCountryLabel(target.country)
  ) {
    score += 15;
  }

  if (
    source.industry.trim() &&
    target.industry.trim() &&
    normalizeCategory(source.industry) === normalizeCategory(target.industry)
  ) {
    score += 10;
  } else if (source.industry.trim() && target.industry.trim()) {
    score += 5;
  }

  score += Math.round(Math.min(target.profile_score, 100) * 0.25);

  if (target.is_verified) {
    score += 8;
  }

  if (source.city.trim() && target.city.trim() && source.city.trim() === target.city.trim()) {
    score += 7;
  }

  return Math.min(score, 99);
}

export function businessToMarketplaceListing(
  business: Business,
  sourceBusiness?: Business | null,
): MarketplaceListing {
  const category = normalizeCategory(business.industry);
  const social = (business.social_links ?? {}) as { tagline?: string };
  const tagline =
    social.tagline?.trim() ||
    business.description.trim().slice(0, 90) ||
    `${business.business_name.trim()} on AfriGrow Hub`;

  return {
    id: business.id,
    name: business.business_name.trim(),
    tagline,
    category,
    city: business.city.trim(),
    country: normalizeCountryLabel(business.country),
    matchType: inferMatchTypes(category),
    matchScore: sourceBusiness ? computeMatchScore(sourceBusiness, business) : business.profile_score,
    lookingFor: buildLookingFor(business, category),
    services: business.products_services?.filter(Boolean).slice(0, 4) ?? [],
    verified: business.is_verified,
    source: "live",
  };
}

export function mapBusinessesToMarketplaceListings(
  businesses: Business[],
  sourceBusiness?: Business | null,
  excludeBusinessId?: string,
): MarketplaceListing[] {
  return businesses
    .filter((business) => business.id !== excludeBusinessId)
    .map((business) => businessToMarketplaceListing(business, sourceBusiness))
    .filter((listing) => listing.name.length > 0);
}

export function applyMatchStatuses(
  listings: MarketplaceListing[],
  matches: MarketplaceMatch[],
  activeMatchType: MatchType,
): MarketplaceListing[] {
  const statusByBusiness = new Map<string, MarketplaceMatchStatus>();

  for (const match of matches) {
    if (match.match_type !== activeMatchType) continue;
    statusByBusiness.set(match.matched_business_id, match.status);
  }

  return listings.map((listing) => ({
    ...listing,
    matchStatus: statusByBusiness.get(listing.id),
  }));
}

export function countPartnershipsThisMonth(matches: MarketplaceMatch[]): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  return matches.filter(
    (match) => match.status === "accepted" && new Date(match.created_at) >= start,
  ).length;
}

export function countEnquiriesSent(matches: MarketplaceMatch[]): number {
  return matches.filter((match) =>
    ["enquired", "accepted"].includes(match.status),
  ).length;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
