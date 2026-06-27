import type { Business, SocialLinks } from "@/lib/database/businesses";
import { emptySocialLinks } from "@/lib/database/businesses";
import {
  buildDefaultProfile,
  calculateProfileStrength,
  type BusinessProfile,
} from "@/lib/profile-data";
import type { SessionPreview } from "@/lib/session-preview";

type ExtendedSocialLinks = SocialLinks & {
  tagline?: string;
  foundedYear?: string;
  address?: string;
  phone?: string;
};

function parseSocialLinks(raw: SocialLinks | null | undefined): ExtendedSocialLinks {
  return { ...emptySocialLinks, ...(raw ?? {}) };
}

export function businessToProfile(
  business: Business,
  session: SessionPreview,
): BusinessProfile {
  const social = parseSocialLinks(business.social_links);

  return {
    businessName: business.business_name || session.name,
    tagline: social.tagline ?? "",
    category: business.industry || session.businessType || "services",
    foundedYear: social.foundedYear ?? "",
    city: business.city,
    country: business.country || session.country,
    address: social.address ?? "",
    phone: social.phone ?? "",
    email: business.email || session.email,
    website: business.website,
    whatsapp: business.whatsapp,
    bio: business.description,
    services: business.products_services ?? [],
    instagram: social.instagram ?? "",
    facebook: social.facebook ?? "",
    linkedin: social.linkedin ?? "",
    logoUrl: business.logo_url,
    profileScore: business.profile_score,
  };
}

export function profileToBusinessUpdate(profile: BusinessProfile) {
  const social: ExtendedSocialLinks = {
    instagram: profile.instagram.trim(),
    facebook: profile.facebook.trim(),
    linkedin: profile.linkedin.trim(),
    tagline: profile.tagline.trim(),
    foundedYear: profile.foundedYear.trim(),
    address: profile.address.trim(),
    phone: profile.phone.trim(),
  };

  const profileScore = calculateProfileStrength(profile);

  return {
    business_name: profile.businessName.trim(),
    industry: profile.category,
    country: profile.country.trim(),
    city: profile.city.trim(),
    description: profile.bio.trim(),
    products_services: profile.services,
    logo_url: profile.logoUrl.trim(),
    website: profile.website.trim(),
    whatsapp: profile.whatsapp.trim(),
    email: profile.email.trim(),
    social_links: social,
    profile_score: profileScore,
  };
}

export function mergeProfileWithDefaults(
  session: SessionPreview,
  business: Business | null,
): BusinessProfile {
  const defaults = buildDefaultProfile(session);
  if (!business) return defaults;
  return { ...defaults, ...businessToProfile(business, session) };
}
