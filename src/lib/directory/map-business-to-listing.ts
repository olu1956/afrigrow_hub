import type { Business, SocialLinks } from "@/lib/database/businesses";
import type { DirectoryListing, ListingCategory } from "@/lib/directory-data";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";

const VALID_CATEGORIES = new Set<ListingCategory>([
  "retail",
  "manufacturing",
  "services",
  "events",
  "food",
  "tech",
]);

const COUNTRY_ALIASES: Record<string, string> = {
  GB: "UK",
  UK: "UK",
  "United Kingdom": "UK",
  "Great Britain": "UK",
  US: "USA",
  "United States": "USA",
};

type ExtendedSocialLinks = SocialLinks & {
  tagline?: string;
  phone?: string;
};

function normalizeCategory(industry: string): ListingCategory {
  const value = industry.trim().toLowerCase();
  if (VALID_CATEGORIES.has(value as ListingCategory)) {
    return value as ListingCategory;
  }
  return "services";
}

export function normalizeCountryLabel(country: string): string {
  const trimmed = country.trim();
  if (!trimmed) return "";
  return COUNTRY_ALIASES[trimmed] ?? COUNTRY_ALIASES[trimmed.toUpperCase()] ?? trimmed;
}

function parseSocialLinks(raw: SocialLinks | null | undefined): ExtendedSocialLinks {
  return { ...(raw ?? {}) };
}

function formatMemberSince(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function businessToDirectoryListing(business: Business): DirectoryListing | null {
  const name = business.business_name.trim();
  if (
    !name ||
    business.profile_score < DIRECTORY_MIN_PROFILE_SCORE ||
    business.directory_hidden
  ) {
    return null;
  }

  const social = parseSocialLinks(business.social_links);
  const tagline = social.tagline?.trim() || "";
  const description =
    business.description.trim() ||
    `${name} is a ${normalizeCategory(business.industry).replace("_", " ")} business${
      business.city || business.country
        ? ` based in ${[business.city, normalizeCountryLabel(business.country)].filter(Boolean).join(", ")}`
        : ""
    }.`;

  const featured =
    business.profile_score >= 80 && Boolean(business.logo_url.trim());

  return {
    id: business.id,
    name,
    tagline: tagline || description.slice(0, 80),
    description,
    category: normalizeCategory(business.industry),
    city: business.city.trim(),
    country: normalizeCountryLabel(business.country),
    services: business.products_services?.filter(Boolean) ?? [],
    verified: business.is_verified,
    featured,
    memberSince: formatMemberSince(business.created_at),
    createdAt: business.created_at,
    profileViews: 0,
    rating: 0,
    reviewCount: 0,
    profileScore: business.profile_score,
    logoUrl: business.logo_url.trim() || undefined,
    email: business.email.trim() || undefined,
    website: business.website.trim() || undefined,
    whatsapp: business.whatsapp.trim() || undefined,
    phone: social.phone?.trim() || undefined,
    source: "live",
  };
}

export function mapBusinessesToDirectoryListings(businesses: Business[]): DirectoryListing[] {
  return businesses
    .map(businessToDirectoryListing)
    .filter((listing): listing is DirectoryListing => listing !== null);
}
