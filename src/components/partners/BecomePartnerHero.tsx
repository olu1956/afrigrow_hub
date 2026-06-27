import { PartnerBannerIllustration } from "@/components/partners/PartnerBannerIllustration";

export function BecomePartnerHero() {
  return (
    <section className="border-b border-primary-dark/20 bg-primary-dark text-white">
      <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-xl font-semibold text-accent sm:text-2xl">Become an AfriGrow</p>
          <h1 className="mt-1 text-5xl font-black uppercase leading-none tracking-tight text-accent sm:text-6xl lg:text-7xl">
            Partner
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            AfriGrow partners are leading brands with tools, services, and offers that
            help African SMEs profile, promote, connect, and grow.
          </p>
        </div>

        <PartnerBannerIllustration />
      </div>
    </section>
  );
}
