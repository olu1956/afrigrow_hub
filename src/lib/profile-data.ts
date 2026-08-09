import type { SessionPreview } from "@/lib/session-preview";
import { demoSession } from "@/lib/session-preview";

export type BusinessProfile = {
  businessName: string;
  tagline: string;
  category: string;
  foundedYear: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  bio: string;
  services: string[];
  instagram: string;
  facebook: string;
  linkedin: string;
  logoUrl: string;
  profileScore?: number;
};

const PROFILE_STORAGE_KEY = "afrigrow_profile_preview";

export const profileCategories = [
  { value: "retail", label: "Retail & trading" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "food", label: "Food & hospitality" },
  { value: "events", label: "Events & entertainment" },
  { value: "tech", label: "Tech & digital" },
  { value: "other", label: "Other" },
];

function parseLocation(location: string): { city: string; country: string } {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts[0] ?? "", country: parts.slice(1).join(", ") };
  }
  if (parts.length === 1) {
    return { city: "", country: parts[0] ?? "" };
  }
  return { city: "", country: "" };
}

export function buildDefaultProfile(session: SessionPreview): BusinessProfile {
  const { city, country } = parseLocation(session.location);

  return {
    businessName: session.name,
    tagline: "",
    category: session.businessType || "services",
    foundedYear: "",
    city,
    country,
    address: "",
    phone: "",
    email: session.email,
    website: "",
    whatsapp: "",
    bio: "",
    services: [],
    instagram: "",
    facebook: "",
    linkedin: "",
    logoUrl: "",
  };
}

export function loadProfilePreview(session: SessionPreview): BusinessProfile {
  const defaults = buildDefaultProfile(session);

  if (typeof window === "undefined") return defaults;

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return defaults;

    const saved = JSON.parse(raw) as Partial<BusinessProfile>;
    return {
      ...defaults,
      ...saved,
      businessName: saved.businessName?.trim() || session.name,
      email: saved.email?.trim() || session.email,
      category: saved.category || session.businessType || defaults.category,
    };
  } catch {
    return defaults;
  }
}

export function saveProfilePreview(profile: BusinessProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export function formatProfileLocation(profile: BusinessProfile): string {
  return [profile.city, profile.country].filter(Boolean).join(", ");
}

export function resolveBusinessLocation(
  session: SessionPreview,
  profile?: BusinessProfile,
): string {
  const fromProfile = profile ? formatProfileLocation(profile) : "";
  if (fromProfile) return fromProfile;
  return session.location?.trim() || "";
}

export type MarketingProfileContext = {
  businessName: string;
  owner: string;
  location: string;
  phone: string;
  email: string;
};

export function buildMarketingProfileContext(
  session: SessionPreview,
  profile?: BusinessProfile,
): MarketingProfileContext {
  const resolved = profile ?? buildDefaultProfile(session);

  return {
    businessName: resolved.businessName.trim() || session.name,
    owner: session.owner,
    location: resolveBusinessLocation(session, resolved),
    phone: resolved.phone.trim() || resolved.whatsapp.trim(),
    email: resolved.email.trim() || session.email,
  };
}

export function calculateProfileStrength(profile: BusinessProfile): number {
  const checks = [
    profile.businessName.trim().length > 0,
    profile.tagline.trim().length > 0,
    profile.category.length > 0,
    profile.city.trim().length > 0,
    profile.country.trim().length > 0,
    profile.phone.trim().length > 0,
    profile.email.trim().length > 0,
    profile.bio.trim().length >= 80,
    profile.services.length >= 2,
    profile.whatsapp.trim().length > 0,
    profile.website.trim().length > 0,
    profile.logoUrl.trim().length > 0,
    profile.instagram.trim().length > 0 || profile.facebook.trim().length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function categoryLabel(category: string): string {
  return (
    profileCategories.find((item) => item.value === category)?.label ?? "business"
  );
}

export function buildAiBioSuggestion(
  session: SessionPreview,
  profile: BusinessProfile,
): string {
  const label = categoryLabel(profile.category).toLowerCase();
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const locationText = location ? ` based in ${location}` : "";
  const yearText = profile.foundedYear ? `, established in ${profile.foundedYear}` : "";

  return `${session.name} is a ${label} organisation${locationText}${yearText}. We work with communities, partners, and clients to deliver meaningful outcomes and sustainable growth.`;
}

export function buildAiTaglineSuggestion(session: SessionPreview): string {
  return `${session.name} — trusted partner for lasting impact`;
}

const serviceSuggestionsByCategory: Record<string, string[]> = {
  retail: ["Retail sales", "Wholesale supply", "Product consultations"],
  manufacturing: ["Custom manufacturing", "Bulk production", "Quality assurance"],
  services: ["Consulting & advisory", "Programme delivery", "Community outreach"],
  food: ["Catering services", "Event dining", "Menu planning"],
  events: ["Event planning", "Venue coordination", "Community programmes"],
  tech: ["Software solutions", "Digital support", "Technical consulting"],
  other: ["Core services", "Partnership programmes", "Client support"],
};

export function buildAiServiceSuggestions(
  _session: SessionPreview,
  category: string,
): string[] {
  return serviceSuggestionsByCategory[category] ?? serviceSuggestionsByCategory.other;
}

/** @deprecated Use buildDefaultProfile(session) instead */
export const defaultProfile = buildDefaultProfile(demoSession());
