import { partnerOffers } from "@/lib/landing/partners-data";

export type PartnerLogoEntry = {
  id: string;
  name: string;
  src?: string;
  href?: string;
  fallbackLabel?: string;
  fallbackClass?: string;
};

function partnerMarqueeHref(partner: (typeof partnerOffers)[number]): string {
  if (partner.id === "afrigrow") return "/";
  if (partner.ctaHref?.startsWith("http")) return partner.ctaHref;
  return "/partners";
}

/** Homepage marquee — derived from the partners page list. */
export const homepagePartnerLogos: PartnerLogoEntry[] = partnerOffers.map((partner) => ({
  id: partner.id,
  name: partner.name,
  src: partner.logoSrc,
  href: partnerMarqueeHref(partner),
  fallbackLabel: partner.logoSrc ? undefined : partner.name.split(" ")[0],
  fallbackClass: partner.logoSrc ? undefined : `${partner.cardTheme} text-white`,
}));
