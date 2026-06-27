import type { Metadata } from "next";
import { BecomeAPartnerForm } from "@/components/landing/BecomeAPartnerForm";
import { BecomePartnerHero } from "@/components/partners/BecomePartnerHero";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export const metadata: Metadata = {
  title: "Become a Partner — AfriGrow Hub",
  description: "Apply to become an AfriGrow Hub partner and reach African SMEs.",
};

export default function BecomeAPartnerPage() {
  return (
    <SitePageLayout>
      <BecomePartnerHero />
      <BecomeAPartnerForm />
    </SitePageLayout>
  );
}
