import { PartnerBannerIllustration } from "@/components/partners/PartnerBannerIllustration";

export function PartnersHero() {
  return (
    <section className="border-b border-primary-dark/20 bg-primary-dark text-white">
      <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <h1 className="text-4xl font-black uppercase tracking-tight text-accent sm:text-5xl lg:text-6xl">
            Partners
          </h1>
          <p className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">
            <span className="text-white">Tools and offers for </span>
            <span className="text-accent">African businesses</span>
          </p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
            AfriGrow partners are organisations that commit resources, tools, and
            expertise to help small businesses profile, promote, connect, and grow.
          </p>
        </div>

        <PartnerBannerIllustration />
      </div>
    </section>
  );
}
