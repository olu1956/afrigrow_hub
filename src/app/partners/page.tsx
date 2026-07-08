import type { Metadata } from "next";
import Link from "next/link";
import { PartnerOfferCard } from "@/components/partners/PartnerOfferCard";
import { PartnersHero } from "@/components/partners/PartnersHero";
import { PartnerLogoMarquee } from "@/components/landing/PartnerLogoMarquee";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { partnerOffers } from "@/lib/landing/partners-data";
import { homepagePartnerLogos } from "@/lib/landing/partner-logos";

export const metadata: Metadata = {
  title: "Our Partners — AfriGrow Hub",
  description:
    "Meet AfriGrow Hub partners offering tools, services, and special offers for African SMEs.",
};

export default function PartnersPage() {
  return (
    <SitePageLayout>
      <PartnersHero />

      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {partnerOffers.map((partner) => (
              <PartnerOfferCard key={partner.id} partner={partner} />
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-dashed border-primary/25 bg-primary-light/40 p-8 text-center">
            <p className="text-lg font-bold text-foreground">Want to partner with AfriGrow?</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Reach African SMEs with offers, tools, and services they need to profile,
              promote, and grow. See tiers and terms on the{" "}
              <Link href="/partners/programme" className="font-semibold text-primary hover:underline">
                Partner Programme
              </Link>
              , then apply — we feature partners on this page and the homepage logo strip.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/partners/programme"
                className="inline-flex rounded-md border border-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary transition hover:bg-primary/5"
              >
                Partner Programme
              </Link>
              <Link
                href="/partners/become-a-partner"
                className="inline-flex rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
              >
                Become a partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PartnerLogoMarquee partners={homepagePartnerLogos} title="Featured on AfriGrow Hub" />
    </SitePageLayout>
  );
}
