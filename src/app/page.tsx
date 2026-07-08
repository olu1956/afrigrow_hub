import { Agents } from "@/components/landing/Agents";
import { CTA } from "@/components/landing/CTA";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PartnerLogoMarquee } from "@/components/landing/PartnerLogoMarquee";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { PromoBannerCarousel } from "@/components/landing/PromoBannerCarousel";
import { PublicGrowthStats } from "@/components/landing/PublicGrowthStats";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { homepagePartnerLogos } from "@/lib/landing/partner-logos";

export default function Home() {
  return (
    <SitePageLayout>
      <PromoBannerCarousel />
      <PublicGrowthStats />
      <Hero />
      <Features />
      <Agents />
      <HowItWorks />
      <PricingTeaser />
      <CTA />
      <PartnerLogoMarquee partners={homepagePartnerLogos} />
    </SitePageLayout>
  );
}
