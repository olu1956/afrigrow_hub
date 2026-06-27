import type { Metadata } from "next";
import { BusinessAcademyContent } from "@/components/learning/BusinessAcademyContent";
import { BusinessAcademyHero } from "@/components/learning/BusinessAcademyHero";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export const metadata: Metadata = {
  title: "Build a Business Academy — AfriGrow Hub",
  description:
    "Free SME business guides on profile, marketing, CRM, matching, funding, and growth.",
};

export default function BusinessAcademyPage() {
  return (
    <SitePageLayout>
      <BusinessAcademyHero />
      <BusinessAcademyContent />
    </SitePageLayout>
  );
}
