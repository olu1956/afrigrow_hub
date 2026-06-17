import { Agents } from "@/components/landing/Agents";
import { CTA } from "@/components/landing/CTA";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export default function Home() {
  return (
    <SitePageLayout>
      <Hero />
      <Features />
      <Agents />
      <HowItWorks />
      <PricingTeaser />
      <CTA />
    </SitePageLayout>
  );
}
