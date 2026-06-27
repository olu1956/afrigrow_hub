import { partnerOffers } from "@/lib/landing/partners-data";

export type PartnerLogoEntry = {
  id: string;
  name: string;
  src?: string;
  href?: string;
  fallbackLabel?: string;
  fallbackClass?: string;
};

/** Homepage marquee — derived from the partners page list. */
export const homepagePartnerLogos: PartnerLogoEntry[] = partnerOffers.map((partner) => ({
  id: partner.id,
  name: partner.name,
  src: partner.logoSrc,
  href: partner.id === "afrigrow" ? "/" : "/partners",
  fallbackLabel: partner.logoSrc ? undefined : partner.name.split(" ")[0],
  fallbackClass: partner.logoSrc ? undefined : `${partner.cardTheme} text-white`,
}));
